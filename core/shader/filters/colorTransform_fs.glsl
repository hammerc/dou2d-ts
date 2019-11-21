// -----
// 颜色转换效果的片段着色器
// -----

precision mediump float;

uniform mat4 matrix;
uniform vec4 colorAdd;

uniform sampler2D uSampler;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    // 抵消预乘的 alpha 通道
    if(texColor.a > 0.0) {
        texColor = vec4(texColor.rgb / texColor.a, texColor.a);
    }
    vec4 locColor = clamp(texColor * matrix + colorAdd, 0.0, 1.0);
    gl_FragColor = vColor * vec4(locColor.rgb * locColor.a, locColor.a);
}
