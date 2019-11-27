namespace dou2d {
    /**
     * 绘制数据接口
     * @author wizardc
     */
    export interface IDrawData {
        type: number;
        count: number;
        texture: WebGLTexture;
        filter: Filter;
        value: string;
        buffer: RenderBuffer;
        width: number;
        height: number;
        textureWidth: number;
        textureHeight: number;
        smoothing: boolean;
        x: number;
        y: number;
    }
}
