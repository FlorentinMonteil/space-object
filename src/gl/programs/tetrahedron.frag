#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform float uTime;
uniform sampler2D tDiffuse;
uniform sampler2D tNormalMap;
uniform sampler2D tAmbiantOcclusion;
uniform float uLight;
uniform vec2 uMouse;
uniform float uLightRender;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

// Uniforms
uniform vec4 ambientColour;
uniform vec4 diffuseColour;
uniform vec4 specularColour;


void main(void)
{ 

  vec2 uv = vUv;
  // uv *= 5.0;
  vec3 lightDir = vec3(0.0, -0.5, -1.0);
  // vec3 lightDir = vec3(vViewPosition);

  const float maxVariance = 5.0; // Mess around with this value to increase/decrease normal perturbation
  const float minVariance = maxVariance / 2.0;

  // Create a normal which is our standard normal + the normal map perturbation (which is going to be either positive or negative)
  vec3 normalAdjusted = normalize(vNormal);// + normalize(texture2D(tNormalMap, vUv.st).rgb * maxVariance - minVariance);

  // Calculate diffuse intensity
  float diffuseIntensity = max(0.0, dot(normalize(normalAdjusted), normalize(lightDir)));

  // Add the diffuse contribution blended with the standard texture lookup and add in the ambient light on top
  vec3 colour = (diffuseIntensity * diffuseColour.rgb) * texture2D(tDiffuse, uv.st).rgb + ambientColour.rgb;

  // Set the almost final output color as a vec4 - only specular to go!
  gl_FragColor = vec4(colour, 1.0);

  // Calc and apply specular contribution
  vec3 vReflection        = normalize(reflect(-normalize(normalAdjusted), normalize(lightDir)));
  float specularIntensity = max(0.0, dot(normalize(normalAdjusted), vReflection));

  // // If the diffuse light intensity is over a given value, then add the specular component
  // // Only calc the pow function when the diffuseIntensity is high (adding specular for high diffuse intensities only runs faster)
  // // Put this as 0 for accuracy, and something high like 0.98 for speed

  float baseLightRadius = 64.0;
  float ifSpec = (1.0 - sqrt(uMouse.x*uMouse.x + uMouse.y*uMouse.y))*(baseLightRadius-1.0);
  ifSpec = 0.0;// (1.0 - sqrt(uMouse.x*uMouse.x + uMouse.y*uMouse.y))*(baseLightRadius-1.0);
  float fSpec = pow(specularIntensity, baseLightRadius - ifSpec);
  gl_FragColor.rgb *= specularIntensity * texture2D(tAmbiantOcclusion, uv.st).rgb;
  gl_FragColor.rgb += vec3(max(fSpec, 0.2) * specularColour.rgb) * texture2D(tAmbiantOcclusion, uv.st).rgb;



  gl_FragColor = mix(gl_FragColor, vec4(uLight, uLight, uLight, 1.0), uLightRender);
  // gl_FragColor = vec4(uLight, uLight, uLight, 1.0);

  // gl_FragColor = texture2D(tDiffuse, uv.st);

}