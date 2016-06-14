import glMatrix     from 'gl-matrix';
import Ease         from 'utils/ease';

import globalStates from 'states/global-states';
import Textures     from 'assets/textures';
import Renderer     from 'renderer';
import Scene        from 'scene';
import Camera       from 'camera';
import Tetrahedron  from 'gl/mesh/tetrahedron';
import Mouse        from 'utils/mouse';

var startTime = 0;

var SPIN_DURATION = 2000;

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
    var edgeIndex = 0;
    for(var i = 0; i<4; i++){

      var pyramid = new Tetrahedron( this.renderer.gl, 
        {x: 0.0, y: 0.0, z: 0.0, wire: false}, "_"+i
      );

      pyramid.rotateFromEdge(-Math.acos(1/3), 0);
      pyramid.step = i;
      var e = 0;
      for(var j=0; j<pyramid.step; j++){
        pyramid.edgeAngle = 0;
        pyramid.spinTime  = 0;
        var orientation = (e % 3) == 0 ? -1 : 1;
        if(j == 3){ orientation = -orientation; }
        var a = orientation * (Math.PI * 2 - 2 * Math.acos(1/3));
        pyramid.rotateFromEdge(a, e);
        e = this.getEdgeIndexByStep( e, j + 1 );
        console.log(e);
        pyramid.edgeIndex = e;
      }

      // pyramid.edgeIndex = edgeIndex;
      // edgeIndex         = this.getEdgeIndexByStep( pyramid.edgeIndex, pyramid.step );
      // pyramid.step      = i;
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

    SPIN_DURATION = 2000 * Math.abs(Mouse.x);

    var t = Date.now() - startTime;

    for (var i = 0; i < this.rotatingPyramids.length; i++) {

      var p = this.rotatingPyramids[i];
      var spinProgress = (t - p.spinTime)/SPIN_DURATION;
      var orientation = (p.edgeIndex % 3) == 0 ? -1 : 1;
      if(p.step == 3){
        orientation = -orientation;
      }
      var a = orientation * (Math.PI * 2 - 2 * Math.acos(1/3)) * Math.max(0.0, Math.min(1.0, spinProgress));//* Ease.easeOutCubic(spinProgress);

      p.rotateFromEdge(a - p.edgeAngle, p.edgeIndex);

      if(spinProgress > 1){
        p.edgeAngle   = 0;
        p.spinTime    = t;
        p.step       += 1;
        if(p.step > 4){
          p.edgeIndex = 0;
          p.step      = 1;
          p.edgeIndex = 0;
        }
        p.edgeIndex = this.getEdgeIndexByStep(p.edgeIndex, p.step);
      }

    }

    this.camera.update(this.w, this.h);

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.loop);

  }

  getEdgeIndexByStep( currentEdgeIndex, step ){
    var increment = step == 3 ? 3 : 2;
    return step != 4 ? (currentEdgeIndex + increment) : 0;
  }

}