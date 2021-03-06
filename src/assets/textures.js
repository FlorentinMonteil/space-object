import when from "when";

class Textures {

  constructor( ){

    this._texs = [];

  }

  setup( gl ){

    this.gl    = gl;

    // var granite = "assets/textures/black-white-granite/";
    // this.makeTex( "granite_AO", granite + "/T_BlackWhiteGranite_AO.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "granite_D",  granite + "/T_BlackWhiteGranite_BC.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "granite_N",  granite + "/T_BlackWhiteGranite_N.png",  gl.REPEAT, gl.REPEAT );

    // var adams    = "src/assets/textures/adams";
    // this.makeTex( "adams_AO", adams + "/AO.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "adams_D",  adams + "/BC.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "adams_N",  adams + "/N.png",  gl.REPEAT, gl.REPEAT );

    var crater   = "src/assets/textures/crater";
    this.makeTex( "crater_AO", crater + "/AO.jpg", gl.REPEAT, gl.REPEAT );
    this.makeTex( "crater_D",  crater + "/BC.jpg", gl.REPEAT, gl.REPEAT );
    this.makeTex( "crater_N",  crater + "/N.jpg",  gl.REPEAT, gl.REPEAT );

    this.makeTex( "space", "src/assets/textures/env/negx.jpg", gl.REPEAT, gl.REPEAT );

    // var eroded   = "src/assets/textures/eroded";
    // this.makeTex( "eroded_AO", eroded + "/AO.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "eroded_D",  eroded + "/BC.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "eroded_N",  eroded + "/N.png",  gl.REPEAT, gl.REPEAT );

    // var sand     = "src/assets/textures/sand";
    // this.makeTex( "sand_AO", sand + "/AO.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "sand_D",  sand + "/BC.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "sand_N",  sand + "/N.png",  gl.REPEAT, gl.REPEAT );


    // var volcanic = "src/assets/textures/volcanic";
    // this.makeTex( "volcanic_AO", volcanic + "/AO.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "volcanic_D",  volcanic + "/BC.png", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "volcanic_N",  volcanic + "/N.png",  gl.REPEAT, gl.REPEAT );

    // var solar = "src/assets/textures/solar";
    // this.makeTex( "solar_AO", solar + "/AO.jpg", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "solar_D",  solar + "/BC.jpg", gl.REPEAT, gl.REPEAT );
    // this.makeTex( "solar_N",  solar + "/N.jpg",  gl.REPEAT, gl.REPEAT );

    this.makeCube( "env", "src/assets/textures/env" );

    this.makeCube( "env_green", "src/assets/textures/env-green" );

  }

  getTexture( name ){
    return this._texs.filter((_tex)=>{
      return _tex.name === name;
    })[0];
  }

  makeTex( name, src, wrapS, wrapT ){

    var gl   = this.gl;
    var tex  = this.gl.createTexture();
    tex.name = name;

    gl.bindTexture(    gl.TEXTURE_2D, tex                                            );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR               );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     wrapS                   );
    gl.texParameteri(  gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     wrapT                   );

    tex.img             = new Image();
    tex.img.crossOrigin = 'anonymous';
    tex.src             = src;

    this._texs.push(tex);

  }

  loadTexture( tex ){

    if(tex.cube){
      return this.loadCube( tex );
    }

    var deffered = when.defer();
    tex.img.onload = ()=>{
      this.onTextureLoaded( tex );
      deffered.resolve();
    }
    tex.img.src = tex.src;
    return deffered.promise;

  }

  loadCube( tex ){

    var deffered = when.defer();

    var loaded = 0;
    var _onImgLoaded = ()=>{
      loaded += 1;
      if(loaded == tex.imgs.length){
        this.onCubeLoaded( tex );
        deffered.resolve();
      }
    }
    for (var i = 0; i < tex.imgs.length; i++) {
      tex.imgs[i].img.onload = _onImgLoaded;
      tex.imgs[i].img.src = tex.imgs[i].src ;
    }

    return deffered.promise;

  }

  makeCube(  name, folder ){

    var gl   = this.gl;
    var tex  = this.gl.createTexture();
    tex.name = name;

    gl.bindTexture( gl.TEXTURE_CUBE_MAP, tex );

    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR );

    tex.cube = true;


    tex.imgs = [];
    for (var i = 0; i < 6; i++) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      tex.imgs.push( { img: img, src: "" } );
    }

    tex.imgs[0].src = folder + "/negx.jpg";
    tex.imgs[1].src = folder + "/negy.jpg";
    tex.imgs[2].src = folder + "/negz.jpg";
    tex.imgs[3].src = folder + "/posx.jpg";
    tex.imgs[4].src = folder + "/posy.jpg";
    tex.imgs[5].src = folder + "/posz.jpg";

    this._texs.push(tex);

  }

  load(){

    return when.map(this._texs, this.loadTexture.bind(this));

  }

  onTextureLoaded( tex ){

    var gl  = this.gl;
    gl.bindTexture( gl.TEXTURE_2D, tex );
    gl.texImage2D(  gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

  }

  onCubeLoaded( tex ){

    var gl = this.gl;
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, tex );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.imgs[0].img );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.imgs[1].img );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.imgs[2].img );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.imgs[3].img );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.imgs[4].img );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.imgs[5].img );

  }

}

const _tex = new Textures();

export default _tex;


