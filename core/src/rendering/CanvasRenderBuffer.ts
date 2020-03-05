namespace dou2d {
    /**
     * 画布渲染缓冲
     * @author wizardc
     */
    export class CanvasRenderBuffer {
        public constructor(width?: number, height?: number) {
            this.surface = HtmlUtil.createCanvas(width, height);
            this.context = this.surface.getContext("2d");
            if (this.context) {
                this.context.$offsetX = 0;
                this.context.$offsetY = 0;
            }
            this.resize(width, height)
        }

        /**
         * 渲染上下文
         */
        public context: CanvasRenderingContext2D;
        /**
         * 呈现最终绘图结果的画布
         */
        public surface: HTMLCanvasElement;

        /**
         * 渲染缓冲的宽度，以像素为单位。
         * @readOnly
         */
        public get width(): number {
            return this.surface.width;
        }

        /**
         * 渲染缓冲的高度，以像素为单位。
         * @readOnly
         */
        public get height(): number {
            return this.surface.height;
        }

        /**
         * 改变渲染缓冲的大小并清空缓冲区
         * @param width 改变后的宽
         * @param height 改变后的高
         * @param useMaxSize 若传入true，则将改变后的尺寸与已有尺寸对比，保留较大的尺寸。
         */
        public resize(width: number, height: number, useMaxSize?: boolean): void {
            let canvasRenderBuffer = this;
            let surface = canvasRenderBuffer.surface;
            if (useMaxSize) {
                let change = false;
                if (surface.width < width) {
                    surface.width = width;
                    change = true;
                }
                if (surface.height < height) {
                    surface.height = height;
                    change = true;
                }
                //尺寸没有变化时,将绘制属性重置
                if (!change) {
                    canvasRenderBuffer.context.globalCompositeOperation = "source-over";
                    canvasRenderBuffer.context.setTransform(1, 0, 0, 1, 0, 0);
                    canvasRenderBuffer.context.globalAlpha = 1;
                }
            }
            else {
                if (surface.width != width) {
                    surface.width = width;
                }
                if (surface.height != height) {
                    surface.height = height;
                }
            }
            canvasRenderBuffer.clear();
        }

        /**
         * 获取指定区域的像素
         */
        public getPixels(x: number, y: number, width: number = 1, height: number = 1): number[] {
            return <number[]><any>this.context.getImageData(x, y, width, height).data;
        }

        /**
         * 转换成base64字符串，如果图片（或者包含的图片）跨域，则返回null
         * @param type 转换的类型，如: "image/png","image/jpeg"
         */
        public toDataURL(type?: string, encoderOptions?: number): string {
            return this.surface.toDataURL(type, encoderOptions);
        }

        /**
         * 清空缓冲区数据
         */
        public clear(): void {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.clearRect(0, 0, this.surface.width, this.surface.height);
        }

        /**
         * 销毁绘制对象
         */
        public destroy(): void {
            this.surface.width = this.surface.height = 0;
        }
    }
}
