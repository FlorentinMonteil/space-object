import glMatrix  from 'gl-matrix';

import EnvPRG    from 'gl/programs/env';
import Cube      from 'gl/geoms/cube';
import GUI       from 'dev/gui';

import Textures        from 'assets/textures';

var mat4 = glMatrix.mat4;
var prg  = null;

var M4 = mat4.create();

export default class Env {

  constructor( gl ){

    this.gl = gl;
    if(prg == null){
      prg = EnvPRG(gl);
    }
    this.geom      = Cube();

    this._wmatrix     = mat4.create();
    this._wmatrix[12] = 0;
    this._wmatrix[13] = 0;
    this._wmatrix[14] = 0;

    mat4.scale( this._wmatrix, this._wmatrix, [-50.0, -50.0, -50.0] );

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

    this.texture = Textures.getTexture( 'env_green' );

    this.prg.use();

  }

  render( camera, lights ){

    let gl = this.gl;

    if(lights){
      return
    }

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

    gl.uniform1i(this.prg.program.tCube, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, this.texture );

    gl.drawElements( gl.TRIANGLES, this.indicesBuffer.numItems, gl.UNSIGNED_SHORT, 0 );
    // gl.drawArrays(gl.TRIANGLES, 0, this.verticesBuffer.numItems);

  }


}