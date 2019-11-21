// -----
// 渲染贴图的片段着色器
// -----

precision lowp float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;

void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;
}
