namespace dou2d {
    /**
     * 纹理类是对不同平台不同的图片资源的封装
     * @author wizardc
     */
    export class Texture {
        /**
         * 销毁纹理时是否销毁对应 BitmapData
         */
        public disposeBitmapData: boolean = true;

        /**
         * 表示这个纹理在 BitmapData 上的 x 起始位置
         */
        public bitmapX: number = 0;

        /**
         * 表示这个纹理在 BitmapData 上的 y 起始位置
         */
        public bitmapY: number = 0;

        /**
         * 表示这个纹理在 BitmapData 上的宽度
         */
        public bitmapWidth: number = 0;

        /**
         * 表示这个纹理在 BitmapData 上的高度
         */
        public bitmapHeight: number = 0;

        /**
         * 表示这个纹理显示了之后在 x 方向的渲染偏移量
         */
        public offsetX = 0;

        /**
         * 表示这个纹理显示了之后在 y 方向的渲染偏移量
         */
        public offsetY = 0;

        /**
         * 位图宽度
         */
        public sourceWidth: number = 0;

        /**
         * 位图高度
         */
        public sourceHeight: number = 0;

        /**
         * 是否旋转
         */
        public rotated: boolean = false;

        private _bitmapData: BitmapData;

        private _textureWidth: number = 0;
        private _textureHeight: number = 0;

        /**
         * 纹理宽度，只读属性，不可以设置
         */
        public get textureWidth(): number {
            return this.$getTextureWidth();
        }

        public $getTextureWidth(): number {
            return this._textureWidth;
        }

        public $getScaleBitmapWidth(): number {
            return this.bitmapWidth * sys.textureScaleFactor;
        }

        /**
         * 纹理高度，只读属性，不可以设置
         */
        public get textureHeight(): number {
            return this.$getTextureHeight();
        }

        public $getTextureHeight(): number {
            return this._textureHeight;
        }

        public $getScaleBitmapHeight(): number {
            return this.bitmapHeight * sys.textureScaleFactor;
        }

        public set bitmapData(value: BitmapData) {
            this.$setBitmapData(value);
        }
        public get bitmapData(): BitmapData {
            return this.$getBitmapData();
        }

        public $setBitmapData(value: BitmapData) {
            this._bitmapData = value;
            let scale = sys.textureScaleFactor;
            let w = value.width * scale;
            let h = value.height * scale;
            this.$initData(0, 0, w, h, 0, 0, w, h, value.width, value.height);
        }

        public $getBitmapData(): BitmapData {
            return this._bitmapData;
        }

        public $initData(bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number, offsetY: number, textureWidth: number, textureHeight: number, sourceWidth: number, sourceHeight: number, rotated: boolean = false): void {
            let scale = sys.textureScaleFactor;
            this.bitmapX = bitmapX / scale;
            this.bitmapY = bitmapY / scale;
            this.bitmapWidth = bitmapWidth / scale;
            this.bitmapHeight = bitmapHeight / scale;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this._textureWidth = textureWidth;
            this._textureHeight = textureHeight;
            this.sourceWidth = sourceWidth;
            this.sourceHeight = sourceHeight;
            this.rotated = rotated;
            BitmapData.invalidate(this._bitmapData);
        }

        public dispose(): void {
            if (this._bitmapData) {
                if (this.disposeBitmapData) {
                    this._bitmapData.dispose();
                }
                this._bitmapData = null;
            }
        }
    }
}
