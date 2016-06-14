var Program = require('nanogl/program');

export default function(gl){
  return new Program(
    gl, 
    require('./plane-vert.vert')(),
    require('./plane-frag.frag')()
  );
}