namespace dou2d {
    /**
     * 文本渲染节点
     * @author wizardc
     */
    export class TextNode extends RenderNode {
        /**
         * 绘制 x 偏移
         */
        public x: number;

        /**
         * 绘制 y 偏移
         */
        public y: number;

        /**
         * 绘制宽度
         */
        public width: number;

        /**
         * 绘制高度
         */
        public height: number;

        public dirtyRender: boolean = true;

        public texture: WebGLTexture;
        public textureWidth: number;
        public textureHeight: number;
        public canvasScaleX: number;
        public canvasScaleY: number;

        /**
         * 颜色值
         */
        public textColor: number = 0xFFFFFF;

        /**
         * 描边颜色值
         */
        public strokeColor: number = 0x000000;

        /**
         * 字号
         */
        public size: number = 30;

        /**
         * 描边大小
         */
        public stroke: number = 0;

        /**
         * 是否加粗
         */
        public bold: boolean = false;

        /**
         * 是否倾斜
         */
        public italic: boolean = false;

        /**
         * 字体名称
         */
        public fontFamily: string = "Arial";

        public constructor() {
            super();
            this.type = RenderNodeType.textNode;
        }

        /**
         * 绘制一行文本
         */
        public drawText(x: number, y: number, text: string, format: TextFormat): void {
            this.drawData.push(x, y, text, format);
            this._renderCount++;
            this.dirtyRender = true;
        }

        public cleanBeforeRender(): void {
            super.cleanBeforeRender();
            this.dirtyRender = true;
        }

        /**
         * 清除非绘制的缓存数据
         */
        public clean(): void {
            if (this.texture) {
                WebGLUtil.deleteTexture(this.texture);
                this.texture = null;
                this.dirtyRender = true;
            }
        }
    }

    /**
     * 文本格式
     */
    export interface TextFormat {
        /**
         * 颜色值
         */
        textColor?: number;
        /**
         * 描边颜色值
         */
        strokeColor?: number;
        /**
         * 字号
         */
        size?: number;
        /**
         * 描边大小
         */
        stroke?: number;
        /**
         * 是否加粗
         */
        bold?: boolean;
        /**
         * 是否倾斜
         */
        italic?: boolean;
        /**
         * 字体名称
         */
        fontFamily?: string;
    }
}
