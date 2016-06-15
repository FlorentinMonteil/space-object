precision highp float;

varying vec2 vUv;
uniform sampler2D uSampler;

uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
const vec2 lightPositionOnScreen = vec2(0.5, 0.5);
const int NUM_SAMPLES = 100;

void main(void){

  // gl_FragColor         = texture2D(uSampler, vec2(vUv.s, vUv.t));
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  vec2 deltaTextCoord = vec2( vUv - lightPositionOnScreen.xy );
  vec2 textCoo = vUv;
  deltaTextCoord *= 1.0 / float(NUM_SAMPLES) * density;
  float illuminationDecay = 1.0;

  for(int i=0; i < NUM_SAMPLES ; i++)
  {
     textCoo -= deltaTextCoord;
     vec4 sample = texture2D(uSampler, textCoo );
     sample *= illuminationDecay * weight;
     gl_FragColor += sample;
     illuminationDecay *= decay;
   }
   gl_FragColor *= exposure;

}