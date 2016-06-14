import PlanePRG from '../programs/plane';
import Plane    from '../geoms/quad';
import glMatrix from 'gl-matrix';
import Emitter  from 'eventemitter3';
import Ease     from 'utils/ease';
import GUI      from 'dev/gui';

var prg = null;

export default class CoverMesh extends Emitter {

  constructor(gl, texture){

    super(gl);
    this.gl = gl;
    if(prg == null){
      prg = PlanePRG(gl);
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

    if(this.uvs){
      this.textureBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    }

    this.prg.use();

    this.exposure              = 0.7;
    this.decay                 = 0.92;
    this.density               = 0.7;
    this.weight                = 0.3;
    this.lightPositionOnScreen = {
      x: 0.5,
      y: 0.5
    };

    this.prg.exposure( this.exposure );
    this.prg.decay( this.decay );
    this.prg.density( this.density );
    this.prg.weight( this.weight );

    var ctrl = GUI.addFolder('scattering');
    ctrl.add(this, 'exposure', 0, 1);
    ctrl.add(this, 'decay', 0, 1);
    ctrl.add(this, 'density', 0, 1);
    ctrl.add(this, 'weight', 0, 1);

    this.texture = texture;

  }

  render(){

    let gl = this.gl;

    this.prg.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);

    gl.enableVertexAttribArray( this.prg.aVertexPosition() );
    gl.vertexAttribPointer( this.prg.aVertexPosition(), this.verticesBuffer.itemSize, gl.FLOAT, false, 0, 0 );

    if(this.textureBuffer){
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
      gl.enableVertexAttribArray( this.prg.aUv() );
      gl.vertexAttribPointer( this.prg.aUv(), 2, gl.FLOAT, false, 0, 0 );
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.prg.program.uSampler, 0);

    this.prg.exposure( this.exposure );
    this.prg.decay( this.decay );
    this.prg.density( this.density );
    this.prg.weight( this.weight );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.verticesBuffer.numItems);

  }


}