in vec2 aPosition;
in vec2 aUV;
in vec2 aPositionOffset;
in float aIndex;

uniform float vRowCount;
uniform float vColCount;
uniform float vTime;
uniform float manualScale;
uniform float vNoiseLevel;
uniform float clipDarkOutliers;
uniform float clipLightOutliers;
uniform int sD;
uniform int sI;
uniform int cO;
uniform sampler2D bTex1;
uniform sampler2D noiseTex;

out vec2 vUV;
out float vIndex;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {

    float rowCount = vRowCount;
    float colCount = vColCount;

    float totalCells = rowCount * colCount;
    float indexFloat = aIndex * totalCells;
    float x = mod(indexFloat, colCount) / colCount;
    float y = floor(indexFloat / colCount) / rowCount;
    vec2 bTexUV = vec2(x, y);
    float noise = (texture2D(noiseTex, bTexUV).r) * vNoiseLevel;
    vec4 bTexColor = texture2D(bTex1, bTexUV);
    float brightness = bTexColor.r;

    float scale = mod(manualScale, 1.0);

    if(sD == 1) {
        scale = mod(vTime + noise + brightness, 1.0);
    } else if(sI == 1) {
        scale = mod(vTime + noise, 1.0);
    }

    if(brightness <= clipDarkOutliers || brightness >= 1.0 - clipLightOutliers) {
        scale = 0.0;
    }

    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(aPosition * (scale) + aPositionOffset, 1.0)).xy, 0.0, 1.0);

    vUV = aUV;
    vIndex = aIndex;
}