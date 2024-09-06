import {modal} from './modules/modal.js';
import {auth} from './modules/auth.js';
import {tagcloud} from './modules/tagcloud.js';
import {loader} from './modules/loader.js';
import {tree} from './modules/tree.js';
import {transcription} from './modules/transcription.js';

    let tc, 
        hotRes, 
        //accordion = document.getElementById('accordionJDC'),
        //rectAccordion = accordion.getBoundingClientRect(),
        wait = new loader(),
        intervalId = window.setInterval(function(){
            changePapillon();
            aleaDia();
        }, 6000),
        confs;

    d3.json("assets/data/confsInfos.js")
    .then(data => {
        confs = data;
        aleaDia();
    });                

    changePapillon();
    chargeCitations();

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
