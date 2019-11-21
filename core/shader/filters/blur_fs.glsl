// -----
// 模糊效果的片段着色器
// -----

precision mediump float;

uniform vec2 blur;

uniform sampler2D uSampler;
uniform vec2 uTextureSize;

varying vec2 vTextureCoord;

void main() {
    const int sampleRadius = 5;
    const int samples = sampleRadius * 2 + 1;
    vec2 blurUv = blur / uTextureSize;
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 uv = vec2(0.0, 0.0);
    blurUv /= float(sampleRadius);
    for (int i = -sampleRadius; i <= sampleRadius; i++) {
        uv.x = vTextureCoord.x + float(i) * blurUv.x;
        uv.y = vTextureCoord.y + float(i) * blurUv.y;
        color += texture2D(uSampler, uv);
    }
    color /= float(samples);
    gl_FragColor = color;
}
