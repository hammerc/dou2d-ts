namespace dou2d {
    /**
     * 位图显示对象
     * @author wizardc
     */
    export class Bitmap extends DisplayObject {
        /**
         * 在缩放时是否进行平滑处理的默认值
         */
        public static defaultSmoothing: boolean = true;

        public $bitmapData: BitmapData;

        protected _texture: Texture;
        protected _bitmapX: number = 0;
        protected _bitmapY: number = 0;
        protected _bitmapWidth: number = 0;
        protected _bitmapHeight: number = 0;
        protected _offsetX: number = 0;
        protected _offsetY: number = 0;
        protected _textureWidth: number = 0;
        protected _textureHeight: number = 0;
        protected _sourceWidth: number = 0;
        protected _sourceHeight: number = 0;
        protected _explicitBitmapWidth: number = NaN;
        protected _explicitBitmapHeight: number = NaN;

        protected _scale9Grid: Rectangle;
        protected _fillMode: BitmapFillMode = BitmapFillMode.scale;
        protected _smoothing: boolean = Bitmap.defaultSmoothing;
        protected _pixelHitTest: boolean = false;

        public constructor(value?: Texture) {
            super();
            this.$renderNode = new NormalBitmapNode();
            this.$setTexture(value);
            if (value) {
                (<NormalBitmapNode>this.$renderNode).rotated = value.rotated;
            }
        }

        /**
         * 纹理
         */
        public set texture(value: Texture) {
            this.$setTexture(value);
            if (value && this.$renderNode) {
                (<BitmapNode>this.$renderNode).rotated = value.rotated;
            }
        }
        public get texture(): Texture {
            return this.$getTexture();
        }

        public $setTexture(value: Texture): boolean {
            let oldTexture = this._texture;
            if (value == oldTexture) {
                return false;
            }
            this._texture = value;
            if (value) {
                this.$refreshImageData();
            }
            else {
                if (oldTexture) {
                    BitmapData.removeDisplayObject(this, oldTexture.bitmapData);
                }
                this.setImageData(null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                this.$renderDirty = true;
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
                return true;
            }
            if (this._stage) {
                if (oldTexture && oldTexture.bitmapData) {
                    if (oldTexture.bitmapData === value.bitmapData) {
                        this.$renderDirty = true;
                        let p = this._parent;
                        if (p && !p.$cacheDirty) {
                            p.$cacheDirty = true;
                            p.$cacheDirtyUp();
                        }
                        let maskedObject = this.$maskedObject;
                        if (maskedObject && !maskedObject.$cacheDirty) {
                            maskedObject.$cacheDirty = true;
                            maskedObject.$cacheDirtyUp();
                        }
                        return true;
                    }
                    BitmapData.removeDisplayObject(this, oldTexture.bitmapData);
                }
                BitmapData.addDisplayObject(this, value.bitmapData);
            }
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }

        public $getTexture(): Texture {
            return this._texture;
        }

        /**
         * 九宫格
         */
        public set scale9Grid(value: Rectangle) {
            this.$setScale9Grid(value);
        }
        public get scale9Grid(): Rectangle {
            return this.$getScale9Grid();
        }

        public $setScale9Grid(value: Rectangle): void {
            this._scale9Grid = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getScale9Grid(): Rectangle {
            return this._scale9Grid;
        }

        /**
         * 位图填充方式
         */
        public set fillMode(value: BitmapFillMode) {
            this.$setFillMode(value);
        }
        public get fillMode(): BitmapFillMode {
            return this.$getFillMode();
        }

        public $setFillMode(value: BitmapFillMode): boolean {
            if (value == this._fillMode) {
                return false;
            }
            this._fillMode = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }

        public $getFillMode(): BitmapFillMode {
            return this._fillMode;
        }

        /**
         * 控制在缩放时是否对位图进行平滑处理
         */
        public set smoothing(value: boolean) {
            this.$setSmoothing(value);
        }

        public get smoothing(): boolean {
            return this.$getSmoothing();
        }

        public $setSmoothing(value: boolean): void {
            if (value == this._smoothing) {
                return;
            }
            this._smoothing = value;
            (<BitmapNode>this.$renderNode).smoothing = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getSmoothing(): boolean {
            return this._smoothing;
        }

        /**
         * 是否开启精确像素碰撞
         * * 设置为true显示对象本身的透明区域将能够被穿透
         * * 注意: 若图片资源是以跨域方式从外部服务器加载的, 将无法访问图片的像素数据, 而导致此属性失效
         */
        public set pixelHitTest(value: boolean) {
            this._pixelHitTest = !!value;
        }
        public get pixelHitTest(): boolean {
            return this._pixelHitTest;
        }

        public $onAddToStage(stage: Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);
            let texture = this._texture;
            if (texture && texture.bitmapData) {
                BitmapData.addDisplayObject(this, texture.bitmapData);
            }
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            let texture = this._texture;
            if (texture) {
                BitmapData.removeDisplayObject(this, texture.bitmapData);
            }
        }

        public $setWidth(value: number): boolean {
            if (value < 0 || value == this._explicitBitmapWidth) {
                return false;
            }
            this._explicitBitmapWidth = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }

        public $getWidth(): number {
            return isNaN(this._explicitBitmapWidth) ? this.$getContentBounds().width : this._explicitBitmapWidth;
        }

        public $setHeight(value: number): boolean {
            if (value < 0 || value == this._explicitBitmapHeight) {
                return false;
            }
            this._explicitBitmapHeight = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }

        public $getHeight(): number {
            return isNaN(this._explicitBitmapHeight) ? this.$getContentBounds().height : this._explicitBitmapHeight;
        }

        public $measureContentBounds(bounds: Rectangle): void {
            if (this.$bitmapData) {
                let w = !isNaN(this._explicitBitmapWidth) ? this._explicitBitmapWidth : this._textureWidth;
                let h = !isNaN(this._explicitBitmapHeight) ? this._explicitBitmapHeight : this._textureHeight;
                bounds.set(0, 0, w, h);
            }
            else {
                let w = !isNaN(this._explicitBitmapWidth) ? this._explicitBitmapWidth : 0;
                let h = !isNaN(this._explicitBitmapHeight) ? this._explicitBitmapHeight : 0;
                bounds.set(0, 0, w, h);
            }
        }

        public $updateRenderNode(): void {
            if (this._texture) {
                let destW = !isNaN(this._explicitBitmapWidth) ? this._explicitBitmapWidth : this._textureWidth;
                let destH = !isNaN(this._explicitBitmapHeight) ? this._explicitBitmapHeight : this._textureHeight;
                let scale9Grid = this.scale9Grid;
                if (scale9Grid) {
                    if (this.$renderNode instanceof NormalBitmapNode) {
                        this.$renderNode = new BitmapNode();
                    }
                    BitmapNode.updateTextureDataWithScale9Grid(<BitmapNode>this.$renderNode, this.$bitmapData, scale9Grid, this._bitmapX, this._bitmapY, this._bitmapWidth, this._bitmapHeight, this._offsetX, this._offsetY, this._textureWidth, this._textureHeight, destW, destH, this._sourceWidth, this._sourceHeight, this._smoothing);
                }
                else {
                    if (this.fillMode == BitmapFillMode.repeat && this.$renderNode instanceof NormalBitmapNode) {
                        this.$renderNode = new BitmapNode();
                    }
                    NormalBitmapNode.updateTextureData(<NormalBitmapNode>this.$renderNode, this.$bitmapData, this._bitmapX, this._bitmapY, this._bitmapWidth, this._bitmapHeight, this._offsetX, this._offsetY, this._textureWidth, this._textureHeight, destW, destH, this._sourceWidth, this._sourceHeight, this._fillMode, this._smoothing);
                }
            }
        }

        public $hitTest(stageX: number, stageY: number): DisplayObject {
            let target = super.$hitTest(stageX, stageY);
            if (target && this._pixelHitTest) {
                let boo = this.hitTestPoint(stageX, stageY, true);
                if (!boo) {
                    target = null;
                }
            }
            return target;
        }

        public $refreshImageData(): void {
            let texture = this._texture;
            if (texture) {
                this.setImageData(texture.bitmapData, texture.bitmapX, texture.bitmapY, texture.bitmapWidth, texture.bitmapHeight, texture.offsetX, texture.offsetY, texture.$getTextureWidth(), texture.$getTextureHeight(), texture.sourceWidth, texture.sourceHeight);
            }
        }

        private setImageData(bitmapData: BitmapData, bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number, offsetY: number, textureWidth: number, textureHeight: number, sourceWidth: number, sourceHeight: number): void {
            this.$bitmapData = bitmapData;
            this._bitmapX = bitmapX;
            this._bitmapY = bitmapY;
            this._bitmapWidth = bitmapWidth;
            this._bitmapHeight = bitmapHeight;
            this._offsetX = offsetX;
            this._offsetY = offsetY;
            this._textureWidth = textureWidth;
            this._textureHeight = textureHeight;
            this._sourceWidth = sourceWidth;
            this._sourceHeight = sourceHeight;
        }
    }
}
