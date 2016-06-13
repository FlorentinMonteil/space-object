var Dat = require( 'dat-gui' )

var DISABLED = false;

var gui = new Dat.GUI()
// gui.close()""

if(DISABLED){
  gui.domElement.parentNode.removeChild(gui.domElement);
}


module.exports = gui;

