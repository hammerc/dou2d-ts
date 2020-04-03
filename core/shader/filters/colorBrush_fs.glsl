// -----
// 颜色刷子的片段着色器
// -----

precision lowp float;

uniform float r;
uniform float g;
uniform float b;
uniform float a;

uniform sampler2D uSampler;

varying vec2 vTextureCoord;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    // 抵消预乘的 alpha 通道
    if(color.a > 0.0) {
        color = vec4(color.rgb / color.a, color.a);
    }
    color.r = r;
    color.g = g;
    color.b = b;
    color.a *= a;
    gl_FragColor = vec4(color.rgb * color.a, color.a);
}
