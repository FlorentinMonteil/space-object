precision highp float;

uniform samplerCube tCube;

varying vec3 vDir;

void main( void ){

  vec3 dir = vDir;
  dir.y = -dir.y;
  vec4 color = textureCube( tCube, dir );
  gl_FragColor = color;

}
