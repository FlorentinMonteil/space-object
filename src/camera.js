import GUI      from 'dev/gui';
import glMatrix from 'gl-matrix'
import Emitter  from 'eventemitter3';
import Mouse    from 'utils/mouse';
import Ease     from 'utils/ease';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

const CENTER = vec3.create()
const UP     = vec3.fromValues(0, 1, 0);
const VEC3   = vec3.create()

var ZOOM_DURATION = 2000;

export default class Camera extends Emitter{

  constructor() {

    super();

    this.fov = 1.4;

    this._view     = mat4.create()
    this._proj     = mat4.create()
    this._viewProj = mat4.create()

    this.radius  = 25;
    this._radius = 4;

    this.panX   = 0;
    this.panY   = 0;
    this._pan   = [0, 0];

    this.x    = 0.0;
    this.y    = 0.0;
    this.z    = 0.0;

    mat4.identity( this._view );

    this.startTime = Date.now();

    this.lookX = 0.0;
    this.lookY = 0.0;
    this.lookZ = 0.0;

    var cameraCtrl = GUI.addFolder('camera');
    cameraCtrl.add(this, 'panX', 0, 1);
    cameraCtrl.add(this, 'panY', 0, 1);
    cameraCtrl.add(this, 'radius', 0, 10);
    cameraCtrl.add(this, 'y', -10, 10);

    cameraCtrl.add(this, 'lookX', -10, 10);
    cameraCtrl.add(this, 'lookY', -10, 10);
    cameraCtrl.add(this, 'lookZ', -10, 10);
    cameraCtrl.add(this, 'fov', 0, Math.PI);

    this.onMouseMove  = this._onMouseMove.bind(this);
    this.onMouseDown  = this._onMouseDown.bind(this);
    this.onMouseWheel = this._onMouseWheel.bind(this);

    this.mouseStartPan = [0, 0];
    this.mousePan      = [0, 0];

    Mouse.on('mousemove', this.onMouseMove);
    Mouse.on('mousedown', this.onMouseDown);

    // document.addEventListener('mousewheel', this.onMouseWheel);

  }

  _onMouseWheel(e){
    var zoom = e.deltaY < 0 ? 1 : -1;
    this._radius += zoom * 0.3;
  }

  _onMouseMove( e ){

    if(!Mouse.down){ return; }

    this.mousePan[ 0 ] = (e.x - this.mouseStartPan[ 0 ]);
    this.mousePan[ 1 ] = (e.y - this.mouseStartPan[ 1 ]);

    this.mouseStartPan = [e.x, e.y];
    this._pan[ 0 ] += this.mousePan[ 0 ];
    this._pan[ 1 ] += this.mousePan[ 1 ];
    this._pan[ 1 ] = Math.max(-1.0, Math.min(this._pan[1], 1.0));
  }

  _onMouseDown( e ){

    this.mouseStartPan = [e.x, e.y];

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

    // Zoom
    var p      = Ease.easeOutCubic( Math.min( 1.0, t/ZOOM_DURATION ) );
    var radius = this.radius + ( this._radius - this.radius ) * p;

    // Pan
    this.panX -= ( this.panX - this._pan[0] ) / 10;
    this.panY -= ( this.panY - this._pan[1] ) / 10;
    var phi    = this.panX * Math.PI*2;
    var theta  = ((this.panY + 1)/2) * Math.PI;
    this.z = Math.cos(phi) * radius;
    this.x = Math.sin(phi) * radius;
    this.y = Math.cos(theta) * radius;

    vec3.set( VEC3,
      this.x,
      this.y,
      this.z
    )

    var lookAt = [this.lookX, this.lookY, this.lookZ];

    mat4.lookAt( this._view, VEC3, lookAt, UP )
    
    this.updateViewProjectionMatrix()

  }


  updateViewProjectionMatrix(  ){
    mat4.multiply( this._viewProj, this._proj, this._view );
  }

  modelViewProjectionMatrix( out, model ){
    mat4.multiply( out, this._viewProj, model );
  }

  modelViewMatrix( out, model ){
    mat4.multiply( out, this._view, model );
  }

}
