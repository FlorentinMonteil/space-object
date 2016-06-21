precision highp float;

uniform float uTime;
uniform float uReveal;

varying vec2 vUv;

float circle(vec2 uv, float iSeed, float speed){
  float range = (0.03+iSeed*0.001);
  speed = speed/250.0;
  return step(distance(uv, vec2(0.5 + sin(uTime*speed+iSeed*0.5)* range, 0.5 + cos(uTime*speed*(iSeed*0.01)+iSeed/2.0)*range)), 0.1)*0.1;
}


void main(void) {

  vec2 uv    = vUv;
  float white = step(distance(uv, vec2(0.5, 0.5)), 0.1);
  white += circle(uv, 4.0, 2.0);
  white += circle(uv, 2.0, 5.0);
  white += circle(uv, 4.5, 10.0);
  white += circle(uv, 2.0, 2.0);
  white += circle(uv, 3.0, 4.0);
  // white += circle(uv, 1.0, 2.5);
  // white += circle(uv, 1.3447, 1.0);
  // white += circle(uv, 2.3, 3.0);
  // white += circle(uv, 9.2110, 2.0341);
  // white += circle(uv, 8.5991, 5.4094);
  // white += circle(uv, 4.4082, 3.7331);
  // white += circle(uv, 7.837, 4.0430);
  // white += circle(uv, 5.3065, 7.5013);
  // white += circle(uv, 6.4361, 8.4739);
  // white += circle(uv, 9.6764, 7.4849);
  // white += circle(uv, 7.9577, 7.3705);
  // white += circle(uv, 6.0867, 8.238);
  // white += circle(uv, 9.9517, 3.2051);
  // white += circle(uv, 7.8888, 1.1956);
  // white += circle(uv, 3.8026, 5.6140);
  // white += circle(uv, 3.0208, 4.0112);
  // white += circle(uv, 6.1247, 4.1470);

  white *= uReveal;

  vec3 color  = vec3(white, white/2.0, white);
  gl_FragColor = vec4(color, color.r);

}