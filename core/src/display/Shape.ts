namespace dou2d {
    /**
     * 
     * @author wizardc
     */
    export class Shape extends DisplayObject {
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

        $measureContentBounds(bounds: Rectangle): void {
            this.$graphics.$measureContentBounds(bounds);
        }

        $hitTest(stageX: number, stageY: number): DisplayObject {
            let target = super.$hitTest(stageX, stageY);
            if (target == this) {
                target = this.$graphics.$hitTest(stageX, stageY);
            }
            return target;
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            if (this.$graphics) {
                this.$graphics.$onRemoveFromStage();
            }
        }
    }
}
