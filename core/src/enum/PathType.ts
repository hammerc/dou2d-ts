namespace dou2d.rendering {
    /**
     * 路径类型
     * @author wizardc
     */
    export const enum PathType {
        /**
         * 纯色填充路径
         */
        fill = 1,
        /**
         * 渐变填充路径
         */
        gradientFill,
        /**
         * 线条路径
         */
        stroke
    }
}
