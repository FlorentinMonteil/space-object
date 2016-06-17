#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform float uTime;
uniform sampler2D tDiffuse;
uniform sampler2D tNormalMap;
uniform sampler2D tAmbiantOcclusion;
uniform float uLight;
uniform float uLightRender;
uniform float uLighten;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

// Uniforms
uniform vec4 ambientColor;
uniform vec4 diffuseColor;
varying vec4 vPos;

void main(void)
{ 

  vec2 uv = vUv;
  vec3 lightDir = normalize( vec3(0.0) - vPos.xyz );

  vec3 normalAdjusted = normalize(vNormal) + (texture2D(tNormalMap, uv.st).rgb * 1.0 - 0.5);

  vec3 AO = texture2D(tAmbiantOcclusion, uv).rgb;

  float diffuseIntensity = max(0.0, dot(normalize(normalAdjusted), normalize(lightDir))) * AO.r * 1.5 * uLighten;

  vec3 colour = ((diffuseIntensity * diffuseColor.rgb) + ambientColor.rgb) * texture2D(tDiffuse, uv.st).rgb;

  gl_FragColor = vec4(colour, 1.0);

  gl_FragColor = mix(gl_FragColor, vec4(vec3(uLight), 1.0), uLightRender);

  // gl_FragColor = vec4(colour, 1.0);

}