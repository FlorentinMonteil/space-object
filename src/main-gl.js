import glMatrix     from 'gl-matrix';
import Ease         from 'utils/ease';
import Mouse        from 'utils/mouse';
import globalStates from 'states/global-states';
import Textures     from 'assets/textures';
import GUI          from 'dev/gui';

import Renderer     from 'renderer';
import Scene        from 'scene';
import Camera       from 'camera';

import LightMap     from 'gl/entities/light-map';
import LightFBO     from 'gl/entities/light-fbo';

import Env          from 'gl/entities/env';
import Tetrahedron  from 'gl/entities/tetrahedron';
import InnerLight   from 'gl/entities/inner-light';

import Warp         from 'gl/entities/warp';
import WarpFBO      from 'gl/entities/warp-fbo';


var startTime = 0;

var SPIN_DURATION = 5000;

export default class MainGL {

  constructor(){

    this.camera   = new Camera();

    this.renderer = new Renderer(document.getElementById('canvas'));
    Mouse.setUp(document.getElementById('canvas'));
    this.scene    = new Scene(this.renderer.gl);

    this.loop           = this._loop.bind(this);
    this.onResize       = this._onResize.bind(this);

    window.addEventListener("resize", this.onResize);
    this.onResize();

    Textures.setup(this.renderer.gl);

    this.loop();

    var texCtrl = GUI.addFolder('texture');
    var currentTexture = {t: 'crater'};
    texCtrl.add( currentTexture, 't', [
      'granite',
      'adams',
      'crater',
      'eroded',
      'sand',
      'volcanic',
      'solar'
    ]).onChange((name)=>{
      for (var i = 0; i < this.tetrahedrons.length; i++) {
        this.tetrahedrons[i].updateTexture(name);
      }
    });

  }

  load(){
    return Textures.load().then(()=>{
      this.initObjects();
    });
  }

  start(){
    globalStates.playing = true;
    startTime = Date.now();
    this.camera.startTime = Date.now();
  }

  initObjects(){

    this.tetrahedrons = [];
    var edgeIndex = 0;
    for(var i = 0; i<4; i++){

      var tetrahedron = new Tetrahedron( this.renderer.gl, 
        {
          x: 0.0, 
          y: 0.0, 
          z: 0.0,
          wire: false
        }
      );

      tetrahedron.rotateFromEdge(-Math.acos(1/3), 0);
      tetrahedron.step = i;
      var e = 0;
      for(var j=0; j<tetrahedron.step; j++){
        tetrahedron.edgeAngle = 0;
        tetrahedron.spinTime  = 0;
        var orientation = (e % 3) == 0 ? -1 : 1;
        if(j == 3){ orientation = -orientation; }
        var a = orientation * (Math.PI * 2 - 2 * Math.acos(1/3));
        tetrahedron.rotateFromEdge(a, e);
        e = this.getEdgeIndexByStep( e, j + 1 );
        tetrahedron.edgeIndex = e;
      }

      var a = tetrahedron.getNormalByFace( 1 );
      var dir = 1;
      if(i == 2){
        dir = -1;
      }
      tetrahedron._x = dir * a[0] * ( 2 + Math.random() * 20 );
      tetrahedron._y = dir * a[1] * ( 2 + Math.random() * 20 );
      tetrahedron._z = dir * a[2] * ( 2 + Math.random() * 20 );

      tetrahedron.edgeAngle = 0;
      tetrahedron.spinTime  = 0;

      this.tetrahedrons.push(tetrahedron);
      this.scene.addObject(tetrahedron);

      tetrahedron.place();

    }
    
    this.innerLight = new InnerLight( this.renderer.gl );
    this.scene.addObject( this.innerLight );

    this.env = new Env( this.renderer.gl );
    this.scene.addObject( this.env );

    this.tetrahedrons[0].on( 'placed', ()=>{
      this.innerLight.show();
    } );

    this.lightFBO = new LightFBO( this.renderer.gl );
    this.lightMap = new LightMap( this.renderer.gl, this.lightFBO.FBOTexture);
    this.scene.addObject( this.lightMap );

    this.warpFBO = new WarpFBO( this.renderer.gl );
    this.warp = new Warp( this.renderer.gl, this.warpFBO.FBOTexture );
    this.scene.addObject( this.warp );

    // this.warp.hide();

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

    this.rotateTetra( t );

    this.camera.update(this.w, this.h);

    var gl = this.renderer.gl;

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    this.lightFBO.render( this.scene, this.camera );    
    this.warpFBO.render( this.camera );

    this.renderer.render( this.scene, this.camera );

    window.requestAnimationFrame(this.loop);

  }

  rotateTetra( t ){
    for (var i = 0; i < this.tetrahedrons.length; i++) {

      var p = this.tetrahedrons[i];
      // var spinProgress = Ease.easeInOutCubic((t - p.spinTime)/SPIN_DURATION);
      var spinProgress = (t - p.spinTime)/SPIN_DURATION;
      var orientation = (p.edgeIndex % 3) == 0 ? -1 : 1;
      if(p.step == 3){
        orientation = -orientation;
      }
      var a = orientation * (Math.PI * 2 - 2 * Math.acos(1/3)) * Math.max(0.0, Math.min(1.0, spinProgress));

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
  }

  getEdgeIndexByStep( currentEdgeIndex, step ){
    var increment = step == 3 ? 3 : 2;
    return step != 4 ? (currentEdgeIndex + increment) : 0;
  }

}