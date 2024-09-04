// merci beaucoup à
// Copyright 2021-2023 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/tree
export class tree {
    constructor(params={}) {
        var me = this;
        this.cont = params.cont ? params.cont : d3.select('body');
        this.data = params.data ? params.data : [];// data is either tabular (array of objects) or hierarchy (nested objects)
        let path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
        id = params.id ? params.id : Array.isArray(me.data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
        parentId = params.parentId ? params.parentId : Array.isArray(me.data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
        children, // if hierarchical data, given a d in data, returns its children
        tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
        sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
        label = params.label ? params.label : null, // given a node d, returns the display name
        title, // given a node d, returns its hover text
        link, // given a node d, its link (if any)
        linkTarget = "_blank", // the target attribute for links (if any)
        width = params.width ? params.width : 800, // outer width, in pixels
        height = params.height ? params.height : 800, // outer height, in pixels
        r = 3, // radius of nodes
        padding = 1, // horizontal padding for first and last column
        fill = "#999", // fill for nodes
        fillOpacity, // fill opacity for nodes
        stroke = "#555", // stroke for links
        strokeWidth = 1.5, // stroke width for links
        strokeOpacity = 0.4, // stroke opacity for links
        strokeLinejoin, // stroke line join for links
        strokeLinecap, // stroke line cap for links
        halo = "#fff", // color of label halo 
        haloWidth = 3, // padding around the labels
        curve = d3.curveBumpX; // curve for the link    

        // If id and parentId options are specified, or the path option, use d3.stratify
        // to convert tabular data to a hierarchy; otherwise we assume that the data is
        // specified as an object {children} with nested objects (a.k.a. the “flare.json”
        // format), and use d3.hierarchy.
        const root = path != null ? d3.stratify().path(path)(me.data)
            : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(me.data)
            : d3.hierarchy(me.data, children);
        
        this.init = function () {  
            // Sort the nodes.
            if (sort != null) root.sort(sort);
        
            // Compute labels and titles.
            const descendants = root.descendants();
            const L = label == null ? null : descendants.map(d => label(d.data, d));
        
            // Compute the layout.
            const dx = 10;
            const dy = width / (root.height + padding);
            tree().size([width,height])(root);
            //tree().nodeSize([dx, dy])(root);
        
            // Center the tree.
            let x0 = Infinity,
                x1 = -x0,
                xMinI = x0,
                xMaxI = -x0,
                y0 = x0,
                y1 = -x0,
                yMinI = x0,
                yMaxI = -x0;                
            root.each((d,i) => {
                if (d.x > x1){xMaxI = i;x1 = d.x;}
                if (d.x < x0){x0 = d.x;xMinI = i;} 
                if (d.y > y1){yMaxI = i;y1 = d.y;} 
                if (d.y < y0){y0 = d.y;yMinI = i;}
            });
        
            // Compute the default height.
            if (height === undefined) height = x1 - x0 + dx * 2;
        
            // Use the required curve
            if (typeof curve !== "function") throw new Error(`Unsupported curve`);
        
            let svg = me.cont.append("svg")
                .attr("viewBox", [-dy * padding / 2, x0 - dx, width, height])
                .attr("width", width)
                .attr("height", height)
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10),
            vis = svg.append("g"),
                //.attr("transform", "translate(" + [me.w >> 1, me.h >> 1] + ")"); 
            //gestion du zoom
            planW=width*6, planH=height*6,
            zoom = d3.zoom()
                .extent([[0, 0], [planW, planH]])
                .scaleExtent([0, 10])
                .on("zoom", zoomed);              
            svg.call(zoom);
            function zoomed({transform}) {
                vis.attr("transform", transform);
            }
            
            vis.append("g")
                .attr("fill", "none")
                .attr("stroke", stroke)
                .attr("stroke-opacity", strokeOpacity)
                .attr("stroke-linecap", strokeLinecap)
                .attr("stroke-linejoin", strokeLinejoin)
                .attr("stroke-width", strokeWidth)
            .selectAll("path")
                .data(root.links())
                .join("path")
                .attr("d", d3.link(curve)
                    .x(d => d.y)
                    .y(d => d.x));
        
            const node = vis.append("g")
                .attr('id','treeTextLinks')
                .selectAll("a")
                .data(root.descendants())
                .join("a")
                    .attr('id',(d,i)=>'treeLink'+i)
                    .attr("xlink:href", link == null ? null : d => link(d.data, d))
                    .attr("target", link == null ? null : linkTarget)
                    .attr("transform", d => `translate(${d.y},${d.x})`);
        
            node.append("circle")
                .attr("fill", d => d.children ? stroke : fill)
                .attr("r", r);
        
            if (title != null) node.append("title")
                .text(d => title(d.data, d));
        
            if (L) node.append("text")
                .attr('id',(d,i)=>'treeText'+i)
                .attr("dy", "0.32em")
                .attr("x", d => d.children ? -6 : 6)
                .attr("text-anchor", d => d.children ? "end" : "start")
                .attr('fill','white')
                .attr('font-size','initial')
                /*
                .attr("paint-order", "stroke")
                .attr("stroke", halo)
                .attr("stroke-width", haloWidth)
                */
                .attr('class','deSelectNode')
                .text((d, i) => L[i])
                .on('click',selectText);        

            //ajuste le viewbox
            let bbLinks = svg.select('#treeTextLinks').node().getBBox();            
            svg.attr("viewBox", [bbLinks.x, bbLinks.y, bbLinks.width, bbLinks.height]);                

        }
        function selectText(e,d){
            let n = d3.select(e.target);
            if(n.attr('fill')=='red'){
                n.attr('class','deSelectNode');                
            }else{
                n.attr('fill','red');
                n.attr('class','selectNode');                
            }
            me.cont.select('.deSelectNode').attr('fill','white');            
        }
        this.init();
    }
}