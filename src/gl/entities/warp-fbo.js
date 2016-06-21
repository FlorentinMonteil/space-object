import glMatrix  from 'gl-matrix';

import EnvPRG    from 'gl/programs/env';
import Cube      from 'gl/geoms/cube';
import Textures  from 'assets/textures';

var mat4 = glMatrix.mat4;
var prg  = null;

var M4 = mat4.create();

export default class WarpFBO {

  constructor( gl ){

    this.gl = gl;

    this.FBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    this.fboSampleSize   = 2048;
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

    if(prg == null){
      prg = EnvPRG(gl);
    }
    this.geom      = Cube();

    this._wmatrix     = mat4.create();
    this._wmatrix[12] = 0;
    this._wmatrix[13] = 0;
    this._wmatrix[14] = 0;

    mat4.scale( this._wmatrix, this._wmatrix, [.5, .5, .5] );

    this.prg       = prg;

    // Setting up default buffers
    this.indicesBuffer  = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.geom.indices ), gl.STATIC_DRAW);
    this.indicesBuffer.numItems = this.geom.indices.length;

    this.verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( this.geom.vertices ), gl.STATIC_DRAW);
    this.verticesBuffer.itemSize = this.geom.itemSize;
    this.verticesBuffer.numItems = this.geom.vertices.length / this.geom.itemSize;

    this.texture = Textures.getTexture( 'env' );

    this.prg.use();


  }

  render( camera ){

    var gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, this.FBO.width, this.FBO.height);

    this.prg.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.enableVertexAttribArray( this.prg.aVertexPosition() );
    gl.vertexAttribPointer( this.prg.aVertexPosition(), this.verticesBuffer.itemSize, gl.FLOAT, false, 0, 0 );

    this._wmatrix[12] = camera.x;
    this._wmatrix[13] = camera.y;
    this._wmatrix[14] = camera.z;

    camera.modelViewProjectionMatrix( M4, this._wmatrix );
    prg.uMVP( M4 );

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

    gl.uniform1i(this.prg.tCube(), 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, this.texture );

    gl.drawElements( gl.TRIANGLES, this.indicesBuffer.numItems, gl.UNSIGNED_SHORT, 0 );

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }

}