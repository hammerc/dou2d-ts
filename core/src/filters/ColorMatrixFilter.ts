namespace dou2d {
    /**
     * 颜色转换滤镜
     * * 允许饱和度更改, 色相旋转, 亮度调整等
     * @author wizardc
     */
    export class ColorMatrixFilter extends Filter {
        protected _matrix: number[];

        /**
         * @param matrix 一个 4 x 5 矩阵, 第一行五个元素乘以矢量 [srcR,srcG,srcB,srcA,1] 以确定输出的红色值, 第二行的五个元素确定输出的绿色值, 以此类推
         */
        public constructor(matrix?: number[]) {
            super("colorTransform");
            this.$uniforms.matrix = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
            this.$uniforms.colorAdd = { x: 0, y: 0, z: 0, w: 0 };
            this._matrix = [];
            this.setMatrix(matrix);
            this.onPropertyChange();
        }

        /**
         * 一个 4 x 5 矩阵, 第一行五个元素乘以矢量 [srcR,srcG,srcB,srcA,1] 以确定输出的红色值, 第二行的五个元素确定输出的绿色值, 以此类推
         */
        public set matrix(value: number[]) {
            this.setMatrix(value);
        }
        public get matrix(): number[] {
            return this._matrix;
        }

        private setMatrix(value: number[]): void {
            if (value) {
                for (let i = 0; i < 20; i++) {
                    this._matrix[i] = value[i];
                }
            }
            else {
                for (let i = 0; i < 20; i++) {
                    this._matrix[i] = (i == 0 || i == 6 || i == 12 || i == 18) ? 1 : 0;
                }
            }
            let m = this._matrix;
            let matrix = this.$uniforms.matrix;
            let colorAdd = this.$uniforms.colorAdd;
            for (let i = 0, j = 0; i < m.length; i++) {
                if (i === 4) {
                    colorAdd.x = m[i] / 255;
                }
                else if (i === 9) {
                    colorAdd.y = m[i] / 255;
                }
                else if (i === 14) {
                    colorAdd.z = m[i] / 255;
                }
                else if (i === 19) {
                    colorAdd.w = m[i] / 255;
                }
                else {
                    matrix[j] = m[i];
                    j++;
                }
            }
            this.onPropertyChange();
        }
    }
}
