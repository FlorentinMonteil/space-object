export default {

  parseFlattern( geom ){

    var vertices = new Float32Array( geom.facePositions.length * 9 )
    var normals  = new Float32Array( geom.facePositions.length * 9 )
    var uvs      = new Float32Array( geom.facePositions.length * 9 )
    var i = 0;
    var j = 0;
    var faceIndex   = 0;
    var normalIndex = 0;
    geom.facePositions.forEach((face)=>{
      face.forEach((vIndex)=>{
        for(j = 0; j<3; j++){
          vertices[ i ] = geom.vertexPositions[ vIndex      ][ j ];
          i += 1;
        }
      });
      faceIndex += 1;
    });

    i = 0;
    j = 0;
    geom.faceNormals.forEach((face)=>{
      face.forEach((vIndex)=>{
        for(j = 0; j<3; j++){
          normals[ i ] = geom.vertexNormals[ vIndex ][ j ];
          i += 1;
        }
      });
    });

    i = 0;
    j = 0;
    geom.faceUVs.forEach((face)=>{
      face.forEach((vIndex)=>{
        for(j = 0; j<2; j++){
          uvs[ i ] = geom.vertexUVs[ vIndex ][ j ];
          i += 1;
        }
      });
    });

    return {
      vertices,
      normals,
      uvs
    }

  }

}