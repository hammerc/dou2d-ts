namespace dou2d {
    /**
     * 矢量图形类
     * @author wizardc
     */
    export class Shape extends DisplayObject {
        private _graphics: Graphics;

        public constructor() {
            super();
            this._graphics = new Graphics();
            this._graphics.$setTarget(this);
        }

        /**
         * 矢量绘制对象
         */
        public get graphics(): Graphics {
            return this._graphics;
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            if (this._graphics) {
                this._graphics.$onRemoveFromStage();
            }
        }

        public $measureContentBounds(bounds: Rectangle): void {
            this._graphics.$measureContentBounds(bounds);
        }
    }
}
