namespace dou2d {
    /**
     * 图集对象
     * @author wizardc
     */
    export class SpriteSheet {
        /**
         * 表示这个 SpriteSheet 的位图区域在 bitmapData 上的起始位置 x
         */
        private _bitmapX: number = 0;

        /**
         * 表示这个 SpriteSheet 的位图区域在 bitmapData 上的起始位置 y
         */
        private _bitmapY: number = 0;

        /**
         * 共享的位图数据
         */
        private _texture: Texture;

        /**
         * 纹理缓存字典
         */
        private _textureMap: { [key: string]: Texture } = {};

        public constructor(texture: Texture) {
            this._texture = texture;
            this._bitmapX = texture.bitmapX - texture.offsetX;
            this._bitmapY = texture.bitmapY - texture.offsetY;
        }

        /**
         * 根据指定纹理名称获取一个缓存的纹理对象
         */
        public getTexture(name: string): Texture {
            return this._textureMap[name];
        }

        /**
         * 为 SpriteSheet 上的指定区域创建一个新的 Texture 对象并缓存它
         * @param name 名称
         * @param bitmapX 纹理区域在 bitmapData 上的起始坐标 x
         * @param bitmapY 纹理区域在 bitmapData 上的起始坐标 y
         * @param bitmapWidth 纹理区域在 bitmapData 上的宽度
         * @param bitmapHeight 纹理区域在 bitmapData 上的高度
         * @param offsetX 原始位图的非透明区域 x 起始点
         * @param offsetY 原始位图的非透明区域 y 起始点
         * @param textureWidth 原始位图的高度, 若不传入, 则使用 bitmapWidth 的值
         * @param textureHeight 原始位图的宽度, 若不传入, 则使用 bitmapHeight 的值
         * @returns 创建的纹理对象
         */
        public createTexture(name: string, bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number = 0, offsetY: number = 0, textureWidth?: number, textureHeight?: number): Texture {
            if (isNaN(textureWidth)) {
                textureWidth = offsetX + bitmapWidth;
            }
            if (isNaN(textureHeight)) {
                textureHeight = offsetY + bitmapHeight;
            }
            let texture = new Texture();
            texture.disposeBitmapData = false;
            texture.bitmapData = this._texture.bitmapData;
            texture.$initData(this._bitmapX + bitmapX, this._bitmapY + bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, this._texture.sourceWidth, this._texture.sourceHeight);
            this._textureMap[name] = texture;
            return texture;
        }

        /**
         * 释放纹理
         */
        public dispose(): void {
            if (this._texture) {
                this._texture.dispose();
            }
        }
    }
}
