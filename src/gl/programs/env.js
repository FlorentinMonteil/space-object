var Program = require('nanogl/program');

export default function(gl){
  return new Program(
    gl, 
    require('./env.vert')(),
    require('./env.frag')()
  );
}