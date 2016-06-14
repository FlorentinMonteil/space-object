import GUI      from 'dev/gui';
import Easing   from 'utils/easing';
import glMatrix from 'gl-matrix'
import Emitter  from 'eventemitter3';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

const CENTER = vec3.create()
const UP     = vec3.fromValues(0, 1, 0);
const VEC3   = vec3.create()


export default class Camera extends Emitter{

  constructor() {

    super();

    this.fov = 30;

    this._view     = mat4.create()
    this._proj     = mat4.create()
    this._viewProj = mat4.create()

    this.radius       = 4;
    this.arc_progress = 0.63;

    this.x    = 0.0;
    this.y    = -4.0;
    this.z    = 0.0;

    mat4.identity( this._view );

    this.startTime = Date.now();

    this.lookX = 0.0;
    this.lookY = 0.0;
    this.lookZ = 0.0;

    var cameraCtrl = GUI.addFolder('camera');
    cameraCtrl.add(this, 'arc_progress', 0, 1);
    cameraCtrl.add(this, 'radius', 0, 10);
    cameraCtrl.add(this, 'y', -10, 10);

    cameraCtrl.add(this, 'lookX', -10, 10);
    cameraCtrl.add(this, 'lookY', -10, 10);
    cameraCtrl.add(this, 'lookZ', -10, 10);

  }

  update( w, h ){

    let t = Date.now() - this.startTime;

    glMatrix.mat4.perspective(
      this._proj, 
      this.fov, //fov
      w / h,    // aspect
      0.1,      // near
      1000.0    // far
    );

    this.arc_progress += 0.001;
    if(this.arc_progress == 1){
      this.arc_progress = 0;
    }

    this.x = Math.cos(this.arc_progress * Math.PI*2) * this.radius;
    this.z = Math.sin(this.arc_progress * Math.PI*2) * this.radius;

    vec3.set( VEC3,
      this.x,
      this.y,
      this.z
    )

    var lookAt = [this.lookX, this.lookY, this.lookZ];

    // this._view[12] =  this.x
    // this._view[13] =  this.y
    // this._view[14] =  this.z
    // mat4. this._view
    mat4.lookAt( this._view, VEC3, lookAt, UP )

    // mat4.invert(this._view, this._view)

    this.updateViewProjectionMatrix()

  }


  updateViewProjectionMatrix(  ){
    mat4.multiply( this._viewProj, this._proj, this._view );
  }

  modelViewProjectionMatrix( out, model ){
    mat4.multiply( out, this._viewProj, model );
  }

  modelViewMatrix( model ){
    mat4.multiply( model, this._view, model );
  }

}
