import glMatrix        from 'gl-matrix';
import Emitter         from 'eventemitter3';
import Mouse           from 'utils/mouse';
import GUI             from 'dev/gui';
import GeomLoader      from 'gl/geoms/geom-loader';
import Ease            from 'utils/ease';

import TetrahedronPRG  from 'gl/programs/tetrahedron';
import tetrahedronGeom from 'gl/geoms/tetrahedron.json';
import Textures        from 'assets/textures';


var prg = null;

var mat4 = glMatrix.mat4;
var quat = glMatrix.quat;
var M4   = mat4.create();

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

var PLACEMENT_TIME = 3000;

export default class TetrahedronMesh extends Emitter {

  constructor(gl, opts = {}){

    super(gl);
    this.gl = gl;
    if(prg == null){
      prg = TetrahedronPRG(gl);
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

    this._x = opts.startX ? opts.startX : Math.random() * 5;
    this._y = opts.startY ? opts.startY : Math.random() * 5;
    this._z = opts.startZ ? opts.startZ : Math.random() * 5;

    this.geom = GeomLoader.parseFlattern( tetrahedronGeom );

    var vertices = this.geom.vertices;
    var normals  = this.geom.normals;
    var uvs      = this.geom.uvs;

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
    this.normals = normals;
    this.normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    this.normalsBuffer.itemSize = 3;
    this.normalsBuffer.numItems = normals.length / 3;

    this.updateTexture( 'crater' );

    this.edgeIndex = null;
    this.edgeAngle = 0;
    this.spinTime  = 0;

    this.placed = false;
    this.placing = false;

    this.lighten = 0;

  }

  updateTexture( name ){

    this.tDiffuse          = Textures.getTexture(  name + '_D'  );
    this.tNormalMap        = Textures.getTexture(  name + '_N'  );
    this.tAmbiantOcclusion = Textures.getTexture(  name + '_AO' );

  }

  rotateFromEdge(angle, edgeIndex){

    this.edgeAngle += angle;
    this.edgeIndex  = edgeIndex;

    var index = this.edgeIndex;

    var v = this.geom.vertices;

    var v1 = [ 
      v[ (index * 3)     ],
      v[ (index * 3) + 1 ],
      v[ (index * 3) + 2 ]
    ];

    var v2 = [
      v[ (index + 1) * 3     ],
      v[ (index + 1) * 3 + 1 ],
      v[ (index + 1) * 3 + 2 ]
    ]

    var axis   = [ v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2] ];

    var origin = v1;
    var invOrigin = [
      -origin[0],
      -origin[1],
      -origin[2]
    ]

    mat4.translate(this.__wmatrix, this._wmatrix, origin);
    mat4.rotate( this.__wmatrix, this.__wmatrix, angle, axis );
    mat4.translate(this.__wmatrix, this.__wmatrix, invOrigin);

  }

  getNormalByFace( i ){
    var n = this.normals;
    return [ 
      n[ i * 9     ],
      n[ i * 9 + 1 ],
      n[ i * 9 + 2 ],
    ]
  }

  setPlaced(){

    this.placed       = true;
    this.placing      = false;
    this.startPlacing = null;
    TweenMax.fromTo( this, 1.0, {lighten: 0}, {lighten: 1 - 1/4} );
    this.emit( 'placed' );

  }

  place(){
    this.placed       = false;
    this.placing      = true;
    this.startPlacing = Date.now();
  }

  render(camera, lights){

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

    var pos = [this.x, this.y, this.z];
    if(!this.placed){

      var _t = Date.now() - this.startPlacing;
      var p = Ease.easeOutCubic( Math.min( 1.0, _t/PLACEMENT_TIME ) );

      if(p == 1)
        this.setPlaced()

      var x = this._x + ( this.x - this._x ) * p;
      var y = this._y + ( this.y - this._y ) * p;
      var z = this._z + ( this.z - this._z ) * p;
      pos = [x, y, z];

      if(!this.placing)
        pos = [this._x, this._y, this._z];

    }

    // PROJ
    mat4.translate(M4, this.__wmatrix, pos);

    camera.modelViewProjectionMatrix( M4, M4 );

    this.prg.uMVP( M4 );

    this.prg.ambientColor([0.3, 0.3, 0.3, 1.0]);
    this.prg.diffuseColor([1.0, 0.9, 1.0, 1.0]);

    this.prg.uCameraPosition([camera.x, camera.y, camera.z]);

    this.prg.uLightRender( lights );
    this.prg.uLight( this.wire );

    var blink = this.placed ? Math.cos(t/100)/8 : 0; 
    this.prg.uLighten( this.lighten + blink );

    // TEXTURE
    gl.uniform1i(this.prg.tDiffuse(), 0);
    gl.uniform1i(this.prg.tNormalMap(), 1);
    gl.uniform1i(this.prg.tAmbiantOcclusion(), 2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tDiffuse);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.tNormalMap);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.tAmbiantOcclusion);

    if(this.wire){
      gl.drawArrays(gl.LINE_LOOP, 0, this.verticesBuffer.numItems);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, this.verticesBuffer.numItems);
    }

  }


};