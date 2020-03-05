namespace dou2d {
    /**
     * 
     * @author wizardc
     */
    export class ColorMatrixFilter extends Filter {
/**
         * @private
         */
        public $matrix:number[] = [];
        /**
         * @private
         */
        private matrix2:number[] = [];

        /**
         * Initializes a ColorMatrixFilter object.
         * @version Egret 3.1.0
         * @platform Web
         * @language en_US
         */
        /**
         * 创建一个 ColorMatrixFilter 对象。
         * @version Egret 3.1.0
         * @platform Web
         * @language zh_CN
         */
        constructor(matrix:number[] = null) {
            super();
            this.type = "colorTransform";
            this.$uniforms.matrix = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
            this.$uniforms.colorAdd = {x: 0, y: 0, z: 0, w: 0};
            this.setMatrix(matrix);
            this.onPropertyChange(); 
        }

        /**
         * A comma delimited list of 20 doubles that comprise a 4x5 matrix applied to the rendered element.
         * The matrix is in row major order -- that is, the first five elements are multipled by the vector [srcR,srcG,srcB,srcA,1] to determine the output red value, the second five determine the output green value, etc.
         * The value must either be an array or comma delimited string of 20 numbers.
         * @version Egret 3.1.0
         * @platform Web
         * @language en_US
         */
        /**
         * 构成应用于所呈示的元素的一个 4x5 矩阵的、以逗号分隔的 20 个双精度数的列表。
         * 矩阵以行作为主要顺序，即用第一行五个元素乘以矢量 [srcR,srcG,srcB,srcA,1] 以确定输出的红色值，用第二行的五个元素确定输出的绿色值，等等。
         * 该值必须为 20 个数字组成的数组或以逗号分隔的字符串。
         * @version Egret 3.1.0
         * @platform Web
         * @language zh_CN
         */
        public get matrix():number[] {
            for (let i = 0; i < 20; i++) {
                this.matrix2[i] = this.$matrix[i];
            }
            return this.matrix2;
        }

        public set matrix(value:number[]) {
            this.setMatrix(value);
        }

        /**
         * @private
         */
        private setMatrix(value:number[]):void {
            if(value) {
                for (let i = 0; i < 20; i++) {
                    this.$matrix[i] = value[i];
                } 
            } else {
                for (let i = 0; i < 20; i++) {
                    this.$matrix[i] = (i == 0 || i == 6 || i == 12 || i == 18) ? 1 : 0;
                } 
            }

            let $matrix = this.$matrix;
            let matrix = this.$uniforms.matrix;
            let colorAdd = this.$uniforms.colorAdd;

            for(let i = 0, j = 0; i < $matrix.length; i++) {
                if(i === 4) {
                    colorAdd.x = $matrix[i] / 255;
                } else if(i === 9) {
                    colorAdd.y = $matrix[i] / 255;
                } else if(i === 14) {
                    colorAdd.z = $matrix[i] / 255;
                } else if(i === 19) {
                    colorAdd.w = $matrix[i] / 255;
                } else {
                    matrix[j] = $matrix[i];
                    j++;
                }
            }
            this.onPropertyChange();
        }

        /**
         * @private
         */
        public $toJson():string {
            return '{"matrix": [' + this.$matrix.toString() + ']}';
        }
    }
}
