namespace examples {
    export class ShapeTest extends dou2d.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: dou2d.Event2D): void {
            let shape = new dou2d.Shape();
            shape.graphics.beginFill(0xffffff, 1);
            shape.graphics.drawRect(0, 0, 100, 100);
            shape.graphics.endFill();
            shape.x = 50;
            shape.y = 50;
            this.addChild(shape);
        }
    }
}
