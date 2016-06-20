precision highp float;

attribute vec3 aVertexPosition;
attribute vec2 aUv;

uniform mat4 uMVP;

varying vec2 vUv;

uniform float uViewPort;

void main(void) {

  vec3 position =  aVertexPosition;//(uMVP * vec4(aVertexPosition, 1.0)).xyz;

  gl_Position = vec4(position, 1.0);

  vUv = aUv;

}