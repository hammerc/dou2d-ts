namespace dou2d {
    /**
     * 精灵类
     * @author wizardc
     */
    export class Sprite extends DisplayObjectContainer {
        $graphics: Graphics;

        public constructor() {
            super();
            this.$graphics = new Graphics();
            this.$graphics.$setTarget(this);
        }

        /**
         * 获取 Shape 中的 Graphics 对象。可通过此对象执行矢量绘图命令。
         */
        public get graphics(): Graphics {
            return this.$graphics;
        }

        $hitTest(stageX: number, stageY: number): DisplayObject {
            if (!this.$visible) {
                return null;
            }
            let m = this.$getInvertedConcatenatedMatrix();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;

            let rect = this.$scrollRect ? this.$scrollRect : this.$maskRect;
            if (rect && !rect.contains(localX, localY)) {
                return null;
            }

            if (this.$mask && !this.$mask.$hitTest(stageX, stageY)) {
                return null;
            }
            let children = this.$children;
            let found = false;
            let target: DisplayObject = null;
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child.$maskedObject) {
                    continue;
                }
                target = child.$hitTest(stageX, stageY);
                if (target) {
                    found = true;
                    if (target.$touchEnabled) {
                        break;
                    }
                    else {
                        target = null;
                    }
                }
            }
            if (target) {
                if (this.$touchChildren) {
                    return target;
                }
                return this;
            }
            if (found) {
                return this;
            }

            target = DisplayObject.prototype.$hitTest.call(this, stageX, stageY);
            if (target) {
                target = this.$graphics.$hitTest(stageX, stageY);
            }

            return target;
        }

        $measureContentBounds(bounds: Rectangle): void {
            this.$graphics.$measureContentBounds(bounds);
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            if (this.$graphics) {
                this.$graphics.$onRemoveFromStage();
            }
        }
    }
}
