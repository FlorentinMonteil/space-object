precision highp float;

uniform mat4 uMVP;

attribute vec3 aVertexPosition;

varying vec3 vDir;

void main(void) {

  vec3 position = aVertexPosition;

  gl_Position = uMVP * vec4(position, 1.0);

  vDir = aVertexPosition;

}