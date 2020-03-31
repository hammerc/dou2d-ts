namespace dou2d.rendering {
    /**
     * 顶点数据管理类
     * ```
     * 顶点格式:
     *   x[32位浮点] + y[32位浮点] + u[32位浮点] + v[32位浮点] + tintcolor[32位整型]
     * 
     * 矩形格式(包含 4 个顶点组合而成):
     *   0------1
     *   |      |
     *   |      |
     *   3------2
     * 
     * 顶点索引缓冲(包含 6 个整数):
     * [0, 1, 2, 0, 2, 3]
     * ```
     * @author wizardc
     */
    export class VertexData {
        /**
         * 一个顶点的数据大小
         */
        public static readonly vertSize: number = 5;

        /**
         * 一个顶点的字节数据大小
         */
        public static readonly vertByteSize: number = VertexData.vertSize * 4;

        /**
         * 最多单次提交的矩形数量
         */
        public static readonly maxQuadsCount: number = 2048;

        /**
         * 最多单次提交的顶点数量
         */
        public static readonly maxVertexCount: number = VertexData.maxQuadsCount * 4;

        /**
         * 最多单次提交的索引数量
         */
        public static readonly maxIndicesCount: number = VertexData.maxQuadsCount * 6;

        private _vertices: Float32Array;
        private _indices: Uint16Array;

        private _vertexIndex: number = 0;
        private _indexIndex: number = 0;

        private _verticesFloat32View: Float32Array;
        private _verticesUint32View: Uint32Array;

        public constructor() {
            let vertices = new ArrayBuffer(VertexData.maxVertexCount * VertexData.vertByteSize);
            this._verticesFloat32View = new Float32Array(vertices);
            this._verticesUint32View = new Uint32Array(vertices);
            this._vertices = this._verticesFloat32View;
            this._indices = new Uint16Array(VertexData.maxIndicesCount);
            for (let i = 0, j = 0; i < VertexData.maxIndicesCount; i += 6, j += 4) {
                this._indices[i + 0] = j + 0;
                this._indices[i + 1] = j + 1;
                this._indices[i + 2] = j + 2;
                this._indices[i + 3] = j + 0;
                this._indices[i + 4] = j + 2;
                this._indices[i + 5] = j + 3;
            }
        }

        /**
         * 是否达到最大缓存数量
         */
        public reachMaxSize(vertexCount: number = 4, indexCount: number = 6): boolean {
            return this._vertexIndex > VertexData.maxVertexCount - vertexCount || this._indexIndex > VertexData.maxIndicesCount - indexCount;
        }

        /**
         * 获取缓存完成的顶点数组
         */
        public getVertices(): Float32Array {
            let view = this._vertices.subarray(0, this._vertexIndex * VertexData.vertSize);
            return view;
        }

        /**
         * 获取缓存完成的索引数组
         */
        public getIndices(): Uint16Array {
            return this._indices;
        }

        /**
         * 缓存一组顶点
         */
        public cacheArrays(buffer: RenderBuffer, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destX: number, destY: number, destWidth: number, destHeight: number, textureSourceWidth: number, textureSourceHeight: number, rotated?: boolean): void {
            // 混入 tintcolor 的 alpha 值
            let alpha = buffer.globalAlpha;
            alpha = Math.min(alpha, 1.0);
            let globalTintColor = buffer.globalTintColor || 0xFFFFFF;
            let currentTexture = buffer.currentTexture;
            if (alpha < 1.0 && currentTexture && currentTexture[sys.unpackPremultiplyAlphaWebgl]) {
                alpha = WebGLUtil.premultiplyTint(globalTintColor, alpha);
            }
            else {
                alpha = globalTintColor + (alpha * 255 << 24);
            }
            // 计算出绘制矩阵，之后把矩阵还原回之前的
            let locWorldTransform = buffer.globalMatrix;
            let a = locWorldTransform.a;
            let b = locWorldTransform.b;
            let c = locWorldTransform.c;
            let d = locWorldTransform.d;
            let tx = locWorldTransform.tx;
            let ty = locWorldTransform.ty;
            let offsetX = buffer.offsetX;
            let offsetY = buffer.offsetY;
            if (offsetX != 0 || offsetY != 0) {
                tx = offsetX * a + offsetY * c + tx;
                ty = offsetX * b + offsetY * d + ty;
            }
            if (destX != 0 || destY != 0) {
                tx = destX * a + destY * c + tx;
                ty = destX * b + destY * d + ty;
            }
            let a1 = destWidth / sourceWidth;
            if (a1 != 1) {
                a = a1 * a;
                b = a1 * b;
            }
            let d1 = destHeight / sourceHeight;
            if (d1 != 1) {
                c = d1 * c;
                d = d1 * d;
            }
            let width = textureSourceWidth;
            let height = textureSourceHeight;
            let w = sourceWidth;
            let h = sourceHeight;
            sourceX = sourceX / width;
            sourceY = sourceY / height;
            let vertices = this._vertices;
            let verticesUint32View = this._verticesUint32View;
            let index = this._vertexIndex * VertexData.vertSize;
            if (rotated) {
                let temp = sourceWidth;
                sourceWidth = sourceHeight / width;
                sourceHeight = temp / height;
                // xy
                vertices[index++] = tx;
                vertices[index++] = ty;
                // uv
                vertices[index++] = sourceWidth + sourceX;
                vertices[index++] = sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
                // xy
                vertices[index++] = a * w + tx;
                vertices[index++] = b * w + ty;
                // uv
                vertices[index++] = sourceWidth + sourceX;
                vertices[index++] = sourceHeight + sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
                // xy
                vertices[index++] = a * w + c * h + tx;
                vertices[index++] = d * h + b * w + ty;
                // uv
                vertices[index++] = sourceX;
                vertices[index++] = sourceHeight + sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
                // xy
                vertices[index++] = c * h + tx;
                vertices[index++] = d * h + ty;
                // uv
                vertices[index++] = sourceX;
                vertices[index++] = sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
            }
            else {
                sourceWidth = sourceWidth / width;
                sourceHeight = sourceHeight / height;
                // xy
                vertices[index++] = tx;
                vertices[index++] = ty;
                // uv
                vertices[index++] = sourceX;
                vertices[index++] = sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
                // xy
                vertices[index++] = a * w + tx;
                vertices[index++] = b * w + ty;
                // uv
                vertices[index++] = sourceWidth + sourceX;
                vertices[index++] = sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
                // xy
                vertices[index++] = a * w + c * h + tx;
                vertices[index++] = d * h + b * w + ty;
                // uv
                vertices[index++] = sourceWidth + sourceX;
                vertices[index++] = sourceHeight + sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
                // xy
                vertices[index++] = c * h + tx;
                vertices[index++] = d * h + ty;
                // uv
                vertices[index++] = sourceX;
                vertices[index++] = sourceHeight + sourceY;
                // alpha
                verticesUint32View[index++] = alpha;
            }
            this._vertexIndex += 4;
            this._indexIndex += 6;
        }

        public clear(): void {
            this._vertexIndex = 0;
            this._indexIndex = 0;
        }
    }
}
