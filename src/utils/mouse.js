import Emitter from 'eventemitter3';

var windowWidth, windowHeight;

class Mouse extends Emitter {

  constructor(){

    super();

    this.x       = 0;
    this.y       = 0;
    this.screenX = 0;
    this.screenY = 0;

    this.onMouseMove = this._onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('touchmove', this.onMouseMove);
    document.addEventListener('click', (e)=>{
      this.emit('click');
    });

    this.onResize    = this._onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.onResize();

  }

  _onMouseMove(e){

    let pos = [ e.clientX, e.clientY ];

    if(e.touches){
      if(e.preventDefault){ e.preventDefault() };
      pos[0] = e.touches[0].clientX;
      pos[1] = e.touches[0].clientY;
    }

    this.x = (pos[0]/window.innerWidth) * 2 - 1;
    this.y = (pos[1]/window.innerHeight) * 2 - 1;
    // this.z = (pos[2]/window.innerHeight) * 2 - 1;

    this.clientX = pos[0];
    this.clientY = pos[1];

    this.emit('mousemove', this);

  }

  _onResize(){
    windowWidth  = window.innerWidth;
    windowHeight = window.innerHeight;
  }

}

const _mouse = new Mouse();

export default _mouse;