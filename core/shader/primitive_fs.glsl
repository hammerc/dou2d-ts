// -----
// 渲染纯色的片段着色器
// -----

precision lowp float;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
