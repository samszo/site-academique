import {modal} from './modules/modal.js';
import {loader} from './modules/loader.js';

    let hotPubli, 
        urlFicheItem = "/samszo/omk/s/fiches/item/",
        urlAdminItem = "/samszo/omk/admin/item/",
        wait = new loader(),
        intervalId = window.setInterval(function(){
            changePapillon();
            aleaDia();
        }, 6000),
        confs;

    changePapillon();
    chargeCitations();
    
    //chargement des conférences    
    d3.json("assets/data/confsInfos.js").then(data => {
        confs = data;
        aleaDia();
    });                

    //chargement des publications
    //http://localhost/samszo/omk/api/items?property[0][property][]=2&property[0][type]=res&property[0][text]=61225&per_page=1000
    d3.json("assets/data/itemsSamszoCreator.json").then(data=>{
        console.log(data);
        //formate les datas
        let rs = [];
        data.forEach(d=>{
            let r = {
                'lien':`<a target="blank" href="${urlAdminItem+d["o:id"]}">admin</a>, <a target="blank" href="${urlFicheItem+d["o:id"]}">détails</a>`,
                'date':d["dcterms:date"] ? new Date(d["dcterms:date"][0]["@value"]).getUTCFullYear() : null,
                'auteur':d["dcterms:creator"].map(c=>`<a target="blank" href="${urlFicheItem+c.value_resource_id}">${c.display_title}</a>`),
                'titre':d["o:title"],
                'type':d["dcterms:isPartOf"] ? d["dcterms:isPartOf"][0].display_title : '---',
            };
            rs.push(r);
        })
        rs.sort((a, b) => b.date - a.date);
        setTable(rs);
    });

    const safeHtmlRenderer = (_instance, td, _row, _col, _prop, value) => {
        // WARNING: Be sure you only allow certain HTML tags to avoid XSS threats.
        // Sanitize the "value" before passing it to the innerHTML property.
        td.innerHTML = value;
      };
    function setTable(data){
        let headers = Object.keys(data[0]);

        hotPubli = new Handsontable(d3.select('#hotPublications').node(), {
            className: 'htDark',
            afterGetColHeader: function(col, TH){
                TH.className = 'darkTH'
            },
            colHeaders: true,
            rowHeaders: true,
            data:data,
            colHeaders: headers,
            height: '300px',
            width: '100%',
            licenseKey: 'non-commercial-and-evaluation',
            customBorders: true,
            dropdownMenu: true,
            multiColumnSorting: true,
            filters: true,
            selectionMode:'single',
            columns: getCellEditor(headers),
            colWidths: [50, 50, 400, 600, 300],
            stretchH: 'last',
            manualColumnResize: true,
            autoWrapRow: true,
            autoWrapCol: true,
            allowInsertColumn: false,
            copyPaste: false,
        });

    }    

    function getCellEditor(headers){
        let editors = [];
        headers.forEach(h=>{
            switch (h) {
                case 'date':
                    editors.push({data:h, type:'date'})                  
                    break;                
                case 'auteur':
                case 'lien':
                    editors.push({ data:h, renderer: safeHtmlRenderer})                  
                    break;                
              default:
                editors.push({data:h, type: 'text'})                  
                break;
            }
          })
        return editors;
    }

    function aleaDia(){
        let conf = confs[d3.randomInt(0, confs.length-1)()],
        numDia = d3.randomInt(0, conf.diapos.length-1)(),
        url = conf.urlSlide+'?diapo='+numDia;        
        d3.select("#aleaDiapo").style('display','block').attr('src',url);
    }


    function changePapillon(){
        let url = "../ChaoticumPapillonae/CreaPapiDynaAnim.php?anim=0&larg=64&haut=64&id=svgPapi";
        d3.xml(url).then(data => {
            d3.select("#svgPapillon").select('svg').remove();
            d3.select("#svgPapillon").node().append(data.documentElement);
        });

    }
    
    function chargeCitations(){
        let url = "../samszo/omk/s/cartoaffect/page/ajax?json=1&helper=citations";
        d3.json(url).then(rs=>{
            console.log(rs);
            /*
            <div class="carousel-item active">
                <div class="container">
                    <figure>
                        <blockquote class="blockquote">
                            <p>A well-known quote, contained in a blockquote element.</p>
                        </blockquote>
                        <figcaption class="blockquote-footer">
                            Someone famous in <cite title="Source Title">Source Title</cite>
                        </figcaption>
                    </figure>
                </div>
            </div>

            */
            let items = d3.select("#carouselWorksItems").selectAll('div').data(rs).enter().append('div')
                .attr('class',(d,i)=>"carousel-item"+(i==0 ? " active" : ""))
                .append('div').attr('class',"container")
                .append('figure');
            items.append('blockquote').attr('class',"blockquote").append('p').attr('class',"fw-light")
                .html(d=>d.text.replace(/(<([^>]+)>)/gi, ""));
            let ref = items.append('blockquote').attr('class',"blockquote-footer");
            ref.selectAll('span').data(d=>{
                return d.creators;
            }).enter().append('span').attr('class','text-uppercase fw-bold me-1').html((d,i)=>{
                return i>0 ? ', '+d.nom : d.nom;
            });
            ref.append('cite').html(d=>d.titre)
        })
    }
