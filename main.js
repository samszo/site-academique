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
        cherche;
        

    //dimensionne les contenus
    let rectFooter = d3.select('footer').node().getBoundingClientRect(),
    rectHeader = d3.select('header').node().getBoundingClientRect(),
    hMap = rectFooter.top-rectFooter.height-rectHeader.bottom;
    d3.select('#contentMap').style('height',hMap+"px");
    d3.select('#contentResources').style('height',hMap+"px");
    let  rectMap = d3.select('#contentMap').node().getBoundingClientRect(),
        wMap = rectMap.width,
        intervalId = window.setInterval(function(){
        changePapillon();
      }, 6000);
    changePapillon();

    function changePapillon(){
        let url = "../ChaoticumPapillonae/CreaPapiDynaAnim.php?anim=0&larg=64&haut=64&id=svgPapi";
        d3.xml(url).then(data => {
            d3.select("#svgPapillon").select('svg').remove();
            d3.select("#svgPapillon").node().append(data.documentElement);
        });

    }
    