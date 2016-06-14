import glMatrix from 'gl-matrix';

var MOUSE            = {x: 0, y: 0}
var RAY_ORIGIN       = glMatrix.vec3.create();
var RAY_DIRECTION    = glMatrix.vec3.create();

export default class Scene {

  constructor(gl){

    this.gl       = gl;
    this.objects = [];

  }

  getObjects(){
    return this.objects;
  }

  addObject(object){

    this.objects.push(object);

  }

  initTime(){
    for (var i = 0; i < this.objects.length; i++) {
      this.objects[i].loaded = true;
      this.objects[i].startTime = Date.now() + 200 + i * 2;
    }
  }

  render(camera, lights){

    for (var i=0, max=this.objects.length; i<max; i++) {
      this.objects[i].render(camera, lights);
    }

  }

}