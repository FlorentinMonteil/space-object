precision highp float;

uniform mat4 uMVP;

attribute vec3 aVertexPosition;
attribute vec2 aUv;

varying vec2 vUv;

void main(void) {

  vec3 position = aVertexPosition;

  gl_Position = uMVP * vec4(position, 1.0);

  vUv = aUv;

}