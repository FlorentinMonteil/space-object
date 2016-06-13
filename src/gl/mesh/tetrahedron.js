import glMatrix        from 'gl-matrix';
import Emitter         from 'eventemitter3';
import Mouse           from 'utils/mouse';
import GUI             from 'dev/gui';

import PyramidPRG      from 'gl/programs/tetrahedron';
import tetrahedronGeom from 'gl/geoms/tetrahedron.json';
import Textures        from 'assets/textures';

var prg = null;

var mat4 = glMatrix.mat4;
var quat = glMatrix.quat;
var M4   = mat4.create();

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

var progress = {
  value : 0
}

document.addEventListener("mousemove", function(e){
  progress.value = e.clientX/window.innerWidth;
});

export default class TetrahedronMesh extends Emitter {

  constructor(gl, opts = {}, id){

    super(gl);
    this.gl = gl;
    if(prg == null){
      prg = PyramidPRG(gl);
    }

    this.prg       = prg;

    this.startTime = Date.now();

    this.x             = opts.x || 0.0;
    this.y             = opts.y || 0.0;
    this.z             = opts.z || 0.0;

    this.wire          = opts.wire || false;

    this._wmatrix     = mat4.create();
    this.__wmatrix    = this._wmatrix;

    this._wmatrix[12] =  this.x;
    this._wmatrix[13] =  this.y;
    this._wmatrix[14] =  this.z;

    // PYRAMID GEOM
    this.geom = tetrahedronGeom;
    var vertices = new Float32Array( this.geom.facePositions.length * 9 )
    var normals  = new Float32Array( this.geom.facePositions.length * 9 )
    var uvs      = new Float32Array( this.geom.facePositions.length * 9 )
    var i = 0;
    var j = 0;
    var faceIndex   = 0;
    var normalIndex = 0;
    this.geom.facePositions.forEach((face)=>{
      face.forEach((vIndex)=>{
        for(j = 0; j<3; j++){
          vertices[ i ] = this.geom.vertexPositions[ vIndex      ][ j ];
          i += 1;
        }
      });
      faceIndex += 1;
    });

    i = 0;
    j = 0;
    this.geom.faceNormals.forEach((face)=>{
      face.forEach((vIndex)=>{
        for(j = 0; j<3; j++){
          normals[ i ] = this.geom.vertexNormals[ vIndex ][ j ];
          i += 1;
        }
      });
    });

    i = 0;
    j = 0;
    this.geom.faceUVs.forEach((face)=>{
      face.forEach((vIndex)=>{
        for(j = 0; j<2; j++){
          uvs[ i ] = this.geom.vertexUVs[ vIndex ][ j ];
          i += 1;
        }
      });
    });

    this.vertices = vertices;

    this.verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    this.verticesBuffer.itemSize = 3;
    this.verticesBuffer.numItems = vertices.length / 3;


    // UVS
    this.uvsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    this.uvsBuffer.itemSize = 2;
    this.uvsBuffer.numItems = uvs.length / 2;


    // NORMALS
    this.normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    this.normalsBuffer.itemSize = 3;
    this.normalsBuffer.numItems = normals.length / 3;

    this.diffuse          = Textures.getTexture(  'granite_D'  );
    this.normalMap        = Textures.getTexture(  'granite_N'  );
    this.ambiantOcclusion = Textures.getTexture(  'granite_AO' );

    this.edgeIndex = Math.floor(Math.random() * this.vertices.length / 3);
    this.edgeAngle = 0;
    this.edgeAxis = [Math.random(), Math.random(), Math.random()];
    this.speed = Math.random() * 2 - 1;
    this.amplitude = 1 + Math.random() * 4;

    if(id){
      this.id = id;
      GUI.remember(this);
      var ctrl = GUI.addFolder('tetrahedron_'+id);
      ctrl.add(this, 'x', -5.0, 5.0);
      ctrl.add(this, 'y', -5.0, 5.0);
      ctrl.add(this, 'z', -5.0, 5.0);
      this.edgeRotate = 0;
      ctrl.add(this, 'edgeRotate', 0, Math.PI).onChange((val)=>{
        this.rotateFromEdge( this.edgeRotate - this.edgeAngle, this.edgeIndex );
      });

      // ctrl.add(this, 'edgeIndex', [0, 1, 2, 3, 4]).onChange((val)=>{
      //   this.edgeIndex = parseInt(val);
      // });

    }

  }

  rotateFromEdge(angle, edgeIndex){
    this.edgeAngle += angle;
    this.edgeIndex  = edgeIndex;
    this.edgeRotate = this.edgeAngle;
    var v = this.vertices; 
    var o = [ 
      v[ (edgeIndex * 3)     ],// * this.amplitude,
      v[ (edgeIndex * 3) + 1 ],//* this.amplitude,
      v[ (edgeIndex * 3) + 2 ]// * this.amplitude
    ];
    var o2 = [
      v[ (edgeIndex + 1) * 3     ],// * this.amplitude,
      v[ (edgeIndex + 1) * 3 + 1 ],//* this.amplitude,
      v[ (edgeIndex + 1) * 3 + 2 ]// * this.amplitude
    ]

    var a = [ o[0] - o2[0], o[1] - o2[1], o[2] - o2[2] ];
    // console.log(o, a, edgeIndex);
    mat4.translate(this.__wmatrix, this._wmatrix, o);
    mat4.rotate( this.__wmatrix, this.__wmatrix, angle, a );
    mat4.translate(this.__wmatrix, this.__wmatrix, [-o[0], -o[1], -o[2]]);

    // var translation = [ 
    //   rOrigin
    // ];

  }

  render(camera){

    let gl = this.gl;

    let t = Date.now() - this.startTime;

    this.prg.use();

    // VERTICES
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.enableVertexAttribArray( this.prg.aVertexPosition() );
    gl.vertexAttribPointer( this.prg.aVertexPosition(), this.verticesBuffer.itemSize, gl.FLOAT, false, 0, 0 );

    // UVS
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
    gl.enableVertexAttribArray( this.prg.aUv() );
    gl.vertexAttribPointer( this.prg.aUv(), this.uvsBuffer.itemSize, gl.FLOAT, false, 0, 0 );

    // // NORMAL
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.enableVertexAttribArray( this.prg.aNormal() );
    gl.vertexAttribPointer( this.prg.aNormal(), this.normalsBuffer.itemSize, gl.FLOAT, false, 0, 0 );

    // PROJ
    this.prg.uM( this._wmatrix );

    // PROJ
    mat4.translate(M4, this.__wmatrix, [this.x, this.y, this.z]);

    camera.modelViewProjectionMatrix( M4, M4 );

    this.prg.uMVP( M4 );

    this.prg.ambientColour([1.0, 1.0, 1.0, 1.0]);
    this.prg.diffuseColour([1.0, 1.0, 1.0, 1.0]);
    this.prg.specularColour([1.0, 1.0, 1.0, 1.0]);

    this.prg.uCameraPosition([camera.x, camera.y, camera.z]);

    this.prg.uMouse([Mouse.x, Mouse.y]);

    // TEXTURE
    gl.uniform1i(this.prg.program.tDiffuse, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.diffuse);

    gl.uniform1i(this.prg.program.tNormalMap, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.normalMap);

    gl.uniform1i(this.prg.program.tAmbiantOcclusion, 2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.ambiantOcclusion);

    if(this.wire){
      gl.drawArrays(gl.LINE_LOOP, 0, this.verticesBuffer.numItems);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, this.verticesBuffer.numItems);
    }
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

    // gl.drawElements(gl.TRIANGLES, this.indicesBuffer.numItems*3*progress.value, gl.UNSIGNED_SHORT, 0);



  }


};