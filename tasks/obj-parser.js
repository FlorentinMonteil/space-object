var fs = require("fs")
var parseOBJ = require("parse-obj")
 
parseOBJ(fs.createReadStream("./src/assets/pyramid.obj"), function(err, result) {
  if(err) {
    throw new Error("Error parsing OBJ file: " + err)
  }
  fs.writeFileSync( "./src/scripts/gl/geoms/pyramid.json", JSON.stringify(result));
  console.log("Got mesh: ", result)
})