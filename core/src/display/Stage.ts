namespace dou2d {
    /**
     * 舞台
     * @author wizardc
     */
    export class Stage extends DisplayObjectContainer {
        private _stageWidth: number = 0;
        private _stageHeight: number = 0;

        private _engine: Engine;

        private _scaleMode: StageScaleMode = StageScaleMode.showAll;
        private _orientation: OrientationMode = OrientationMode.auto;

        private _maxTouches: number = 99;

        public constructor(engine: Engine) {
            super();
            this._engine = engine;
            this._stage = this;
            this.$nestLevel = 1;
        }

        /**
         * 舞台的帧速率
         */
        public set frameRate(value: number) {
            sys.ticker.frameRate = value;
        }
        public get frameRate(): number {
            return sys.ticker.frameRate;
        }

        /**
         * 舞台的当前宽度
         */
        public get stageWidth(): number {
            return this._stageWidth;
        }

        /**
         * 舞台的当前高度
         */
        public get stageHeight(): number {
            return this._stageHeight;
        }

        /**
         * 舞台缩放模式
         */
        public set scaleMode(value: StageScaleMode) {
            if (this._scaleMode == value) {
                return;
            }
            this._scaleMode = value;
            this._engine.updateScreenSize();
        }
        public get scaleMode(): StageScaleMode {
            return this._scaleMode;
        }

        /**
         * 屏幕横竖屏显示方式
         */
        public set orientation(value: OrientationMode) {
            if (this._orientation == value) {
                return;
            }
            this._orientation = value;
            this._engine.updateScreenSize();
        }
        public get orientation(): OrientationMode {
            return this._orientation;
        }

        /**
         * 绘制纹理的缩放比率
         */
        public set textureScaleFactor(value: number) {
            sys.textureScaleFactor = value;
        }
        public get textureScaleFactor(): number {
            return sys.textureScaleFactor;
        }

        /**
         * 屏幕可以同时触摸的数量
         */
        public set maxTouches(value: number) {
            if (this._maxTouches == value) {
                return;
            }
            this._maxTouches = value;
            this._engine.updateMaxTouches(this._maxTouches);
        }
        public get maxTouches(): number {
            return this._maxTouches;
        }

        public $setStageSize(width: number, height: number): void {
            this._stageWidth = width;
            this._stageHeight = height;
        }

        /**
         * 设置分辨率尺寸
         */
        public setContentSize(width: number, height: number): void {
            this._engine.setContentSize(width, height);
        }

        /**
         * 调用该方法后, 在显示列表下次呈现时, 会向每个已注册侦听 Event.RENDER 事件的显示对象发送一个 Event.RENDER 事件
         */
        public invalidate(): void {
            sys.invalidateRenderFlag = true;
        }
    }

    sys.markCannotUse(Stage, "alpha", 1);
    sys.markCannotUse(Stage, "visible", true);
    sys.markCannotUse(Stage, "x", 0);
    sys.markCannotUse(Stage, "y", 0);
    sys.markCannotUse(Stage, "scaleX", 1);
    sys.markCannotUse(Stage, "scaleY", 1);
    sys.markCannotUse(Stage, "rotation", 0);
    sys.markCannotUse(Stage, "cacheAsBitmap", false);
    sys.markCannotUse(Stage, "scrollRect", null);
    sys.markCannotUse(Stage, "filters", null);
    sys.markCannotUse(Stage, "blendMode", null);
    sys.markCannotUse(Stage, "touchEnabled", true);
    sys.markCannotUse(Stage, "matrix", null);
}
