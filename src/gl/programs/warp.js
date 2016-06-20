var Program = require('nanogl/program');

export default function(gl){
  return new Program(
    gl, 
    require('./warp.vert')(),
    require('./warp.frag')()
  );
}