import MainStyle from 'styles/main.styl';
import MainGL    from 'main-gl';
import vendors   from 'vendors/index.js';

document.addEventListener("DOMContentLoaded", function(event) {

  var mainGL = new MainGL();

  mainGL.load().then(function(){
    mainGL.start();
  })

});