namespace dou2d {
    /**
     * 默认屏幕适配器
     * @author wizardc
     */
    export class DefaultScreenAdapter implements IScreenAdapter {
        /**
         * 计算舞台显示尺寸
         * @param scaleMode 当前的缩放模式
         * @param screenWidth 播放器视口宽度
         * @param screenHeight 播放器视口高度
         * @param contentWidth 初始化内容宽度
         * @param contentHeight 初始化内容高度
         */
        public calculateStageSize(scaleMode: string, screenWidth: number, screenHeight: number, contentWidth: number, contentHeight: number): StageDisplaySize {
            let displayWidth = screenWidth;
            let displayHeight = screenHeight;
            let stageWidth = contentWidth;
            let stageHeight = contentHeight;
            let scaleX = (screenWidth / stageWidth) || 0;
            let scaleY = (screenHeight / stageHeight) || 0;
            switch (scaleMode) {
                case StageScaleMode.exactFit:
                    break;
                case StageScaleMode.fixedHeight:
                    stageWidth = Math.round(screenWidth / scaleY);
                    break;
                case StageScaleMode.fixedWidth:
                    stageHeight = Math.round(screenHeight / scaleX);
                    break;
                case StageScaleMode.noBorder:
                    if (scaleX > scaleY) {
                        displayHeight = Math.round(stageHeight * scaleX);
                    }
                    else {
                        displayWidth = Math.round(stageWidth * scaleY);
                    }
                    break;
                case StageScaleMode.showAll:
                    if (scaleX > scaleY) {
                        displayWidth = Math.round(stageWidth * scaleY);
                    }
                    else {
                        displayHeight = Math.round(stageHeight * scaleX);
                    }
                    break;
                case StageScaleMode.fixedNarrow:
                    if (scaleX > scaleY) {
                        stageWidth = Math.round(screenWidth / scaleY);
                    }
                    else {
                        stageHeight = Math.round(screenHeight / scaleX);
                    }
                    break;
                case StageScaleMode.fixedWide:
                    if (scaleX > scaleY) {
                        stageHeight = Math.round(screenHeight / scaleX);
                    }
                    else {
                        stageWidth = Math.round(screenWidth / scaleY);
                    }
                    break;
                default:
                    stageWidth = screenWidth;
                    stageHeight = screenHeight;
                    break;
            }
            // 宽高不是 2 的整数倍会导致图片绘制出现问题
            if (stageWidth % 2 != 0) {
                stageWidth += 1;
            }
            if (stageHeight % 2 != 0) {
                stageHeight += 1;
            }
            if (displayWidth % 2 != 0) {
                displayWidth += 1;
            }
            if (displayHeight % 2 != 0) {
                displayHeight += 1;
            }
            return { stageWidth, stageHeight, displayWidth, displayHeight };
        }
    }
}
