namespace dou2d.rendering {
    /**
     * 渐变填充路径
     * @author wizardc
     */
    export class GradientFillPath extends Path2D {
        public gradientType: string;
        public colors: number[];
        public alphas: number[];
        public ratios: number[];
        public matrix: Matrix;

        public constructor() {
            super();
            this._type = PathType.gradientFill;
        }
    }
}
