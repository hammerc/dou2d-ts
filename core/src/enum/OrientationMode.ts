namespace dou2d {
    /**
     * 舞台旋转模式
     * @author wizardc
     */
    export const enum OrientationMode {
        /**
         * 适配屏幕
         */
        auto = "auto",
        /**
         * 默认竖屏
         */
        portrait = "portrait",
        /**
         * 默认横屏, 舞台顺时针旋转90度
         */
        landscape = "landscape",
        /**
         * 默认横屏, 舞台逆时针旋转90度
         */
        landscapeFlipped = "landscapeFlipped"
    }
}
