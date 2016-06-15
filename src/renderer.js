import LightMap from 'gl/entities/light-map';
import LightFBO from 'gl/entities/light-fbo';

export default class Renderer{
  constructor(cvs){

    this.cvs = cvs;
    this.gl  = cvs.getContext("webgl", {
      premultipliedAlpha: true
    });
    this.wWidth  = window.innerWidth;
    this.wHeight = window.innerHeight;

    let gl = this.gl;

    this.gl.getExtension( 'OES_standard_derivatives' );

    this.lightFBO = new LightFBO( gl );

    this.lightMap = new LightMap(this.gl, this.lightFBO.FBOTexture);

    this.resize();

  }

  resize(){

    let gl  = this.gl;
    let cvs = this.cvs;

    this.wWidth       = window.innerWidth;
    this.wHeight      = window.innerHeight;
    cvs.style.width   = this.wWidth + "px";
    cvs.style.height  = this.wHeight + "px";
    cvs.width         = this.wWidth * window.devicePixelRatio;
    cvs.height        = this.wHeight * window.devicePixelRatio;
    gl.viewportWidth  = cvs.width;
    gl.viewportHeight = cvs.height;
    gl.viewport(0, 0, cvs.width, cvs.height);

  }

  render(scene, camera = null){

    let gl = this.gl;

    gl.enable(gl.DEPTH_TEST);
    this.lightFBO.render( scene, camera );
    this.defaultConf();
    scene.render(camera, false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    this.lightMap.render();

  }

  defaultConf(){
    var gl = this.gl;
    gl.viewport(0, 0, this.cvs.width, this.cvs.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);
  }

}