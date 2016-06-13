var Program = require('nanogl/program');

export default function(gl){
  return new Program(
    gl, 
    require('./tetrahedron.vert')(),
    require('./tetrahedron.frag')()
  );
}