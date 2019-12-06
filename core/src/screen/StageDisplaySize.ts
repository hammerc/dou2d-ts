namespace dou2d {
    /**
     * 舞台显示尺寸数据
     * @author wizardc
     */
    export interface StageDisplaySize {
        /**
         * 舞台宽度
         */
        stageWidth: number;

        /**
         * 舞台高度
         */
        stageHeight: number;

        /**
         * 显示宽度, 若跟舞台宽度不同, 将会产生缩放
         */
        displayWidth: number;

        /**
         * 显示高度, 若跟舞台高度不同, 将会产生缩放
         */
        displayHeight: number;
    }
}
