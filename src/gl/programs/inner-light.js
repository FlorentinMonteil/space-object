var Program = require('nanogl/program');

export default function(gl){
  return new Program(
    gl, 
    require('./inner-light.vert')(),
    require('./inner-light.frag')()
  );
}