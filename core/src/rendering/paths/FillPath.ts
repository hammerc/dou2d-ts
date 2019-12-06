namespace dou2d {
    /**
     * 填充路径
     * @author wizardc
     */
    export class FillPath extends Path2D {
        /**
         * 填充颜色
         */
        public fillColor: number;

        /**
         * 填充透明度
         */
        public fillAlpha: number;

        public constructor() {
            super();
            this._type = PathType.fill;
        }
    }
}
