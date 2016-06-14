export default function(){

  let itemSize = 3;
  let geom = {
    vertices: new Float32Array([
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0
    ]),
    uvs: new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1
    ]),
    indices: [0, 1, 2, 3]
  }
  return {vertices: geom.vertices, uvs: geom.uvs, indices: geom.indices, itemSize: itemSize}

}