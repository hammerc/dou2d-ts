namespace dou2d {
    /**
     * 精灵类
     * @author wizardc
     */
    export class Sprite extends DisplayObjectContainer {
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

        public $hitTest(stageX: number, stageY: number): DisplayObject {
            if (!this._visible) {
                return null;
            }
            let m = this.$getInvertedConcatenatedMatrix();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;
            let rect = this._scrollRect ? this._scrollRect : this.$maskRect;
            if (rect && !rect.contains(localX, localY)) {
                return null;
            }
            if (this.$mask && !this.$mask.$hitTest(stageX, stageY)) {
                return null;
            }
            let children = this._children;
            let found = false;
            let target: DisplayObject;
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child.$maskedObject) {
                    continue;
                }
                target = child.$hitTest(stageX, stageY);
                if (target) {
                    found = true;
                    if (target.touchEnabled) {
                        break;
                    }
                    else {
                        target = null;
                    }
                }
            }
            if (target) {
                if (this._touchChildren) {
                    return target;
                }
                return this;
            }
            if (found) {
                return this;
            }
            target = DisplayObject.prototype.$hitTest.call(this, stageX, stageY);
            if (target) {
                target = this._graphics.$hitTest(stageX, stageY);
            }
            return target;
        }

        public $measureContentBounds(bounds: Rectangle): void {
            this._graphics.$measureContentBounds(bounds);
        }
    }
}
