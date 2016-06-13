export default class Renderer{
  constructor(cvs){

    this.cvs = cvs;
    this.gl  = cvs.getContext("webgl", {
      premultipliedAlpha: true
    });
    this.wWidth  = window.innerWidth;
    this.wHeight = window.innerHeight;

    let gl = this.gl;

    this.gl.getExtension('OES_standard_derivatives');

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

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    scene.render(camera);

  }

}