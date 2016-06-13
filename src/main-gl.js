import glMatrix     from 'gl-matrix';
import Ease         from 'utils/ease';

import globalStates from 'states/global-states';
import Textures     from 'assets/textures';
import Renderer     from 'renderer';
import Scene        from 'scene';
import Camera       from 'camera';
import Tetrahedron  from 'gl/mesh/tetrahedron';

var startTime = 0;

var SPIN_DURATION = 2500;

export default class MainGL {

  constructor(){

    this.camera   = new Camera();

    this.renderer = new Renderer(document.getElementById('collection-webgl'));
    this.scene    = new Scene(this.renderer.gl);

    this.loop           = this._loop.bind(this);
    this.onResize       = this._onResize.bind(this);

    window.addEventListener("resize", this.onResize);
    this.onResize();

    Textures.setup(this.renderer.gl);

    this.loop();

  }

  load(){
    return Textures.load().then(()=>{
      this.initObjects();
    });
  }

  start(){
    globalStates.playing = true;
    startTime = Date.now();
  }

  initObjects(){

    this.basePyramid = new Tetrahedron( this.renderer.gl, {x: 0.0, y: 0.0, wire:true}, "1" ); 

    this.rotatingPyramids = [];
    for(var i = 0; i<1; i++){

      var pyramid = new Tetrahedron( this.renderer.gl, 
        {x: 0.0, y: 0.0, z: 0.0, wire: false}, "_"+i
      );

      pyramid.rotateFromEdge(-Math.acos(1/3), i*3);
      pyramid.edgeIndex = i*3;
      pyramid.edgeAngle = 0;
      pyramid.spinTime  = 0;
      this.rotatingPyramids.push(pyramid);
      this.scene.addObject(pyramid);

    }

    this.scene.addObject( this.basePyramid );

  }

  _onResize(){
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.camera.update(this.w, this.h);
    this.renderer.resize();
  }

  _loop(dt){

    if(!globalStates.playing){
      window.requestAnimationFrame(this.loop);
      return;
    }

    var t = Date.now() - startTime;

    for (var i = 0; i < this.rotatingPyramids.length; i++) {

      var p = this.rotatingPyramids[i];
      var spinPorgress = (t - p.spinTime)/SPIN_DURATION;
      var orientation = (p.edgeIndex % 4) == 0 ? -1 : 1;
      console.log(orientation);
      var a = orientation * (Math.PI * 2 - 2 * Math.acos(1/3)) * Ease.easeOutCubic(spinPorgress);

      p.rotateFromEdge(a - p.edgeAngle, p.edgeIndex);
      if(spinPorgress > 1){
        p.edgeAngle  = 0;
        p.spinTime = t;
        p.edgeIndex += 2;
        if(p.edgeIndex > 12){
          p.edgeIndex = 0;
        }
      }

    }

    this.camera.update(this.w, this.h);

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.loop);

  }

}