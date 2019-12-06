namespace dou2d {
    /**
     * 混合模式类型
     * @author wizardc
     */
    export const enum BlendMode {
        /**
         * 该显示对象出现在背景前面
         */
        normal = "normal",
        /**
         * 将显示对象的原色值添加到它的背景颜色中，上限值为 0xFF
         */
        add = "add",
        /**
         * 根据显示对象的 Alpha 值擦除背景。Alpha 值不为0的区域将被擦除。
         */
        erase = "erase"
    }
}
