namespace dou2d {
    /**
     * 动态纹理对象
     * * 可将显示对象及其子对象绘制成为一个纹理
     * @author wizardc
     */
    export class RenderTexture extends Texture {
        public $renderBuffer: rendering.RenderBuffer;

        public constructor() {
            super();
            this.$renderBuffer = new rendering.RenderBuffer();
            let bitmapData = new BitmapData(this.$renderBuffer.surface);
            bitmapData.deleteSource = false;
            this.$setBitmapData(bitmapData);
        }

        /**
         * 将指定显示对象绘制为一个纹理
         * @param displayObject 需要绘制的显示对象
         * @param clipBounds 绘制矩形区域
         * @param scale 缩放比例
         */
        public drawToTexture(displayObject: DisplayObject, clipBounds?: Rectangle, scale: number = 1): boolean {
            if (clipBounds && (clipBounds.width == 0 || clipBounds.height == 0)) {
                return false;
            }
            let bounds = clipBounds || displayObject.$getFilterClip() || displayObject.$getOriginalBounds();
            if (bounds.width == 0 || bounds.height == 0) {
                return false;
            }
            scale /= sys.textureScaleFactor;
            let width = (bounds.x + bounds.width) * scale;
            let height = (bounds.y + bounds.height) * scale;
            if (clipBounds) {
                width = bounds.width * scale;
                height = bounds.height * scale;
            }
            let renderBuffer = this.$renderBuffer;
            if (!renderBuffer) {
                return false;
            }
            renderBuffer.resize(width, height);
            this.bitmapData.width = width;
            this.bitmapData.height = height;
            let matrix = dou.recyclable(Matrix);
            matrix.scale(scale, scale);
            // 应用裁切
            if (clipBounds) {
                matrix.translate(-clipBounds.x, -clipBounds.y);
            }
            sys.renderer.render(displayObject, renderBuffer, matrix);
            matrix.recycle();
            // 设置纹理参数
            this.$initData(0, 0, width, height, 0, 0, width, height, width, height);
            return true;
        }

        public getPixel32(x: number, y: number): number[] {
            let data: number[];
            if (this.$renderBuffer) {
                let scale = sys.textureScaleFactor;
                x = Math.round(x / scale);
                y = Math.round(y / scale);
                data = this.$renderBuffer.getPixels(x, y, 1, 1);
            }
            return data;
        }

        public dispose(): void {
            super.dispose();
            this.$renderBuffer = null;
        }
    }
}
