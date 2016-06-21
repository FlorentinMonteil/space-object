import WarpPRG   from 'gl/programs/warp';
import Plane     from 'gl/geoms/quad';
import GUI       from 'dev/gui';
import Textures  from 'assets/textures';
import Mouse     from 'utils/mouse';
import glMatrix  from 'gl-matrix';
import Cube      from 'gl/geoms/cube';

var mat4  = glMatrix.mat4;
var M4    = mat4.create();
var prg   = null;

export default class Warp {

  constructor( gl, texture ){

    this.gl = gl;
    if(prg == null){
      prg = WarpPRG(gl);
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

    this.startTime = Date.now();

    this.radius = 0.0;

    var ctrl = GUI.addFolder('warp');
    ctrl.add(this, 'radius', 0, 1);

    this.texture = texture;

    // document.addEventListener('click', ()=>{
    //   this.hide();
    //   TweenMax.delayedCall(4, this.show.bind(this));
    // });



    // window.setInterval(()=>{
    //   this.hide();
    //   TweenMax.delayedCall(4, this.show.bind(this));
    // }, 8000);

    // this.hide();
    // TweenMax.delayedCall(4, this.show.bind(this));

    document.addEventListener('mousedown', ()=>{
      this.hide();
    });

    document.addEventListener('mouseup', ()=>{
      this.show();
    });


  }

  hide(){
    TweenMax.killTweensOf(this);
    TweenMax.to(this, 2.0, {radius: 0.85, ease: Power2.easeOut});
  }

  show(){
    TweenMax.killTweensOf(this);
    TweenMax.to(this, 2, {radius: 0, ease: Power2.easeInOut});
  }

  render( camera, lightPass ){

    if(lightPass){ return; }

    let gl = this.gl;

    this.prg.use();

    var t = Date.now() - this.startTime;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);

    gl.enableVertexAttribArray( this.prg.aVertexPosition() );
    gl.vertexAttribPointer( this.prg.aVertexPosition(), this.verticesBuffer.itemSize, gl.FLOAT, false, 0, 0 );

    if(this.textureBuffer){
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
      gl.enableVertexAttribArray( this.prg.aUv() );
      gl.vertexAttribPointer( this.prg.aUv(), 2, gl.FLOAT, false, 0, 0 );
    }

    // this.prg.uMVP( M4 );

    this.prg.uMouse( [Mouse.x, Mouse.y] );

    this.prg.uTime( t );

    this.prg.uRadius( this.radius );

    gl.uniform1i(this.prg.uSampler(), 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.verticesBuffer.numItems);

    gl.bindTexture(gl.TEXTURE_2D, null);

  }


}