namespace examples {
    export class ShapeTest extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: Dou.Event2D): void {
            let shape = new Dou.Shape();
            shape.graphics.beginFill(0xffffff, 1);
            shape.graphics.drawRect(0, 0, 100, 100);
            shape.graphics.endFill();
            shape.x = 50;
            shape.y = 50;
            this.addChild(shape);
        }
    }
}
