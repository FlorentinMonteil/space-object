precision highp float;

attribute vec3 aVertexPosition;
attribute vec2 aUv;

varying vec2 vUv;

void main(void) {

  gl_Position = vec4(aVertexPosition, 1.0);
  vUv = aUv;

}