uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform vec2 winResolution;
uniform sampler2D uTexture;

uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uSaturation;

varying vec3 worldNormal;
varying vec3 eyeVector;

const int LOOP = 16;

vec3 sat(vec3 rgb, float intensity) {
    vec3 L = vec3(0.2125, 0.7154, 0.0721);
    vec3 grayscale = vec3(dot(rgb, L));
    return mix(grayscale, rgb, intensity);
}

void main() {
    float iorRatioRed = 1.0/uIorR;
    float iorRatioBlue = 1.0/uIorB;
    float iorRatioGreen = 1.0/uIorG;

    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec3 normal = worldNormal;
    vec3 color = vec3(0.0);

    for ( int i = 0; i < LOOP; i ++ ) {
        float slide = float(i) / float(LOOP) * 0.1;

        vec3 refractVecR = refract(eyeVector, normal,(1.0/uIorR));
        vec3 refractVecY = refract(eyeVector, normal, (1.0/uIorY));
        vec3 refractVecG = refract(eyeVector, normal, (1.0/uIorG));
        vec3 refractVecC = refract(eyeVector, normal, (1.0/uIorC));
        vec3 refractVecB = refract(eyeVector, normal, (1.0/uIorB));
        vec3 refractVecP = refract(eyeVector, normal, (1.0/uIorP));

        float r = texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 0.5;

        float y = (texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 +
        texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y * 2.0 -
        texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z) / 6.0;

        float g = texture2D(uTexture, uv + refractVecG.xy * (uRefractPower + slide * 2.0) * uChromaticAberration).y * 0.5;

        float c = (texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).y * 2.0 +
        texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).z * 2.0 -
        texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).x) / 6.0;

        float b = texture2D(uTexture, uv + refractVecB.xy * (uRefractPower + slide * 3.0) * uChromaticAberration).z * 0.5;

        float p = (texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z * 2.0 +
        texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 -
        texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y) / 6.0;

        float R = r + (2.0*p + 2.0*y - c)/3.0;
        float G = g + (2.0*y + 2.0*c - p)/3.0;
        float B = b + (2.0*c + 2.0*p - y)/3.0;

        color.r += R;
        color.g += G;
        color.b += B;

        color = sat(color, uSaturation);
    }

    color /= float( LOOP );

    gl_FragColor = vec4(color, 1.0);
}
