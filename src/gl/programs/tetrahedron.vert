precision highp float;

uniform mat4 uM;
uniform mat4 uMVP;
uniform vec3 uCameraPosition;

attribute vec3 aVertexPosition;
attribute vec2 aUv;
attribute vec3 aNormal;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main(void) {

  vec3 position = aVertexPosition;

  gl_Position = uMVP * vec4(position, 1.0);

  vUv = aUv;
  vNormal = normalize(mat3(uM) * aNormal);
  vViewPosition = uCameraPosition;

}