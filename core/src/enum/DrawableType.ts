namespace dou2d.rendering {
    /**
     * 绘制命令类型
     * @author wizardc
     */
    export const enum DrawableType {
        texture,
        rect,
        pushMask,
        popMask,
        blend,
        resizeTarget,
        clearColor,
        actBuffer,
        enableScissor,
        disableScissor,
        smoothing
    }
}
