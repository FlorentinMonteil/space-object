import planeFBO from 'gl/mesh/plane-fbo';

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

    this.sceneFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
    this.fboSampleSize   = 1024;
    this.sceneFBO.width  = this.fboSampleSize;
    this.sceneFBO.height = this.fboSampleSize;

    this.sceneFBOTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.sceneFBOTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.fboSampleSize, this.fboSampleSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.fboSampleSize, this.fboSampleSize);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.sceneFBOTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

    this.planeFBO = new planeFBO(this.gl, this.sceneFBOTexture);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

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
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, this.sceneFBO.width, this.sceneFBO.height);
    scene.render(camera, true);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.cvs.width, this.cvs.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.cullFace(gl.BACK);
    gl.blendFunc( gl.ONE_MINUS_SRC_COLOR, gl.ONE );
    gl.disable(gl.BLEND);
    scene.render(camera, false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    this.planeFBO.render();

  }

}