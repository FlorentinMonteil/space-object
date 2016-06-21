export default class LightFBO {

  constructor( gl ){

    this.gl = gl;

    this.FBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    this.fboSampleSize   = 512;
    this.FBO.width  = this.fboSampleSize;
    this.FBO.height = this.fboSampleSize;

    this.FBOTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.FBOTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.fboSampleSize, this.fboSampleSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.fboSampleSize, this.fboSampleSize);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.FBOTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }

  render( scene, camera = null ){

    var gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, this.FBO.width, this.FBO.height);
    scene.render(camera, true);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }

}