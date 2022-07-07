#version 150 core

uniform vec3 cameraPos;
uniform vec3 lightColor=vec3(1);
uniform vec3 ambientLight=vec3(0.1);
uniform vec3 lightPos=vec3(3, 3, 3);
uniform vec4 diffuseMaterial=vec4(1, 0.4, 0, 1);
uniform vec4 specularMaterial=vec4(1);

uniform sampler2D diffTex;
uniform sampler2D bumpTex;

in vec3 normal;
in vec3 worldPos;
in vec2 texCoord;

out vec4 out_Color;

mat3 getTBN( vec3 N ) {
    vec3 Q1 = dFdx(worldPos), Q2 = dFdy(worldPos);
    vec2 st1 = dFdx(texCoord), st2 = dFdy(texCoord);
    float D = st1.s*st2.t-st2.s*st1.t;
    return mat3(normalize(( Q1*st2.t - Q2*st1.t )*D),
                       normalize((-Q1*st2.s + Q2*st1.s )*D), N);
}

#define TEX_DELTA 0.0001
void main(void)
{

vec3 N=normalize(normal);
vec3 L=normalize(lightPos-worldPos);

mat3 TBN = getTBN( N );
float Bu = texture( bumpTex, texCoord+vec2(TEX_DELTA,0) ).r
         - texture( bumpTex, texCoord-vec2(TEX_DELTA,0) ).r;
float Bv = texture( bumpTex, texCoord+vec2(0,TEX_DELTA) ).r
         - texture( bumpTex, texCoord-vec2(0,TEX_DELTA) ).r;
vec3 bumpVec = vec3(-Bu*15., -Bv*15., 1 );
N = normalize( TBN* bumpVec );



vec3 V=normalize(cameraPos-worldPos);
vec3 R=N*dot(N, L)*2.-L;

vec4 diffuseTexMaterial = texture(diffTex, texCoord);
diffuseTexMaterial.rgb=pow(diffuseTexMaterial.rgb, vec3(2.2));
vec3 color=vec3(0);

float diffuseFactor=clamp(dot(N, L), 0, 1);
float specularFactor=pow(clamp(dot(R, V), 0, 1), 10);
color += diffuseTexMaterial.rgb*diffuseFactor*lightColor;
color += specularMaterial.rgb * specularFactor * lightColor;
color += diffuseTexMaterial.rgb * ambientLight;

out_Color = vec4(pow( color,vec3(1/2.2)),  diffuseMaterial.a);
}
