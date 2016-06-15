export default function(){

  let itemSize = 3;
  let geom = {
    vertices: [
      -1,  1, -1,
       1,  1, -1,
       1,  1,  1,
      -1,  1,  1,
      -1, -1, -1,
       1, -1, -1,
       1, -1,  1,
      -1, -1,  1
    ],
    indices: [
      0, 1, 2,
      0, 2, 3,
      3, 2, 6,
      3, 6, 7,
      7, 6, 5,
      7, 5, 4,
      4, 5, 1,
      4, 1, 0,
      4, 0, 3,
      4, 3, 7,
      1, 5, 6,
      1, 6, 2
    ]
  }
  return {vertices: geom.vertices, indices: geom.indices, itemSize: itemSize}

}