import LightPRG from 'gl/programs/inner-light';
import Plane    from 'gl/geoms/quad';
import GUI      from 'dev/gui';
import glMatrix from 'gl-matrix';

var prg = null;

var mat4 = glMatrix.mat4;
var mat3 = glMatrix.mat3;
var quat = glMatrix.quat;
var vec3 = glMatrix.vec3;

var M3   = mat3.create();
var M4   = mat4.create();
var V3   = vec3.create();
var QUAT = quat.fromValues(0, 0, 0, 0);

export default class InnerLight {

  constructor( gl ){

    this.gl = gl;
    if(prg == null){
      prg = LightPRG(gl);
    }
    this.geom      = Plane();
    this.uvs       = this.geom.uvs;
    this.prg       = prg;

    // Setting up default buffers
    this.verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.geom.vertices, gl.STATIC_DRAW);
    this.verticesBuffer.itemSize = this.geom.itemSize;
    this.verticesBuffer.numItems = this.geom.vertices.length / this.geom.itemSize;

    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this._wmatrix = mat4.create();
    this._wmatrix[12] =  this.x;
    this._wmatrix[13] =  this.y;
    this._wmatrix[14] =  this.z;

    this.startTime = Date.now();

    this.prg.use();

  }

  render(camera, lights){

    let gl = this.gl;

    if(!lights){
      return;
    }
    var t = Date.now() - this.startTime;

    this.prg.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);

    gl.enableVertexAttribArray( this.prg.aVertexPosition() );
    gl.vertexAttribPointer( this.prg.aVertexPosition(), this.verticesBuffer.itemSize, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.enableVertexAttribArray( this.prg.aUv() );
    gl.vertexAttribPointer( this.prg.aUv(), 2, gl.FLOAT, false, 0, 0 );

    this._wmatrix[12] =  this.x;
    this._wmatrix[13] =  this.y;
    this._wmatrix[14] =  this.z;

    camera.modelViewMatrix( M4, this._wmatrix );

    mat3.fromMat4( M3, M4 );
    quat.fromMat3( QUAT, M3 );
    quat.invert(QUAT, QUAT);
    mat4.fromRotationTranslation( M4, QUAT, [0.0, 0.0, 0.0] );

    camera.modelViewProjectionMatrix( M4, M4 );

    this.prg.uMVP( M4 );

    this.prg.uTime( t );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.verticesBuffer.numItems);

  }


}