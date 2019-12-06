namespace dou2d {
    /**
     * 图像填充模式
     * @author wizardc
     */
    export const enum BitmapFillMode {
        /**
         * 重复位图以填充区域
         */
        repeat = "repeat",
        /**
         * 位图填充拉伸以填充区域
         */
        scale = "scale",
        /**
         * 在区域的边缘处截断不显示位图
         */
        clip = "clip"
    }
}
