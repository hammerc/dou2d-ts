namespace dou2d {
    /**
     * 线条路径
     * @author wizardc
     */
    export class StrokePath extends Path2D {
        /**
         * 线条宽度
         * 注意: 绘制时对 1 像素和 3 像素要特殊处理, 整体向右下角偏移 0.5 像素, 以显示清晰锐利的线条
         */
        public lineWidth: number;

        /**
         * 线条颜色
         */
        public lineColor: number;

        /**
         * 线条透明度
         */
        public lineAlpha: number;

        /**
         * 端点样式
         * * "none": 无端点
         * * "round": 圆头端点
         * * "square": 方头端点
         */
        public caps: string;

        /**
         * 联接点样式
         * * "bevel": 斜角连接
         * * "miter": 尖角连接
         * * "round": 圆角连接
         */
        public joints: string;

        /**
         * 用于表示剪切斜接的极限值的数字
         */
        public miterLimit: number;

        /**
         * 描述交替绘制线段和间距 (坐标空间单位) 长度的数字
         */
        public lineDash: number[];

        public constructor() {
            super();
            this._type = PathType.stroke;
        }
    }
}
