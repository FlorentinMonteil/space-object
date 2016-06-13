import when from "when";

class Textures {

  constructor( ){

    this._texs = [];

  }

  setup( gl ){

    this.gl    = gl;

    var granite = "assets/textures/black-white-granite/";
    this._makeTex( "granite_AO", granite + "/T_BlackWhiteGranite_AO.png", gl.REPEAT, gl.REPEAT );
    this._makeTex( "granite_D",  granite + "/T_BlackWhiteGranite_BC.png", gl.REPEAT, gl.REPEAT );
    this._makeTex( "granite_HM", granite + "/T_BlackWhiteGranite_H.png",  gl.REPEAT, gl.REPEAT );
    this._makeTex( "granite_N",  granite + "/T_BlackWhiteGranite_N.png",  gl.REPEAT, gl.REPEAT );

  }

  getTexture( name ){
    return this._texs.filter((_tex)=>{
      return _tex.name === name;
    })[0];
  }

  _makeTex( name, src, wrapS, wrapT ){

    var gl   = this.gl;
    var tex  = this.gl.createTexture();
    tex.name = name;

    gl.bindTexture(    gl.TEXTURE_2D, tex                                            );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR               );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     wrapS                   ); //Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     wrapT                   ); //Prevents t-coordinate wrapping (repeating).

    tex.img             = new Image();
    tex.img.crossOrigin = 'anonymous';
    tex.src             = src;

    this._texs.push(tex);

  }

  _loadTexture( tex ){

    var deffered = when.defer();
    tex.img.onload = ()=>{
      this.onTextureLoaded( tex );
      deffered.resolve();
    }
    tex.img.src = tex.src;
    return deffered.promise;

  }

  load(){

    return when.map(this._texs, this._loadTexture.bind(this));

  }

  onTextureLoaded( tex ){

    var gl  = this.gl;
    gl.bindTexture( gl.TEXTURE_2D, tex );
    gl.texImage2D(  gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

  }

}

const _tex = new Textures();

export default _tex;


