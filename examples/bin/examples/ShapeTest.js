var examples;
(function (examples) {
    class ShapeTest extends Dou.DisplayObjectContainer {
        constructor() {
            super();
            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            let shape = new Dou.Shape();
            shape.graphics.beginFill(0xffffff, 1);
            shape.graphics.drawRect(0, 0, 100, 100);
            shape.graphics.endFill();
            shape.x = 50;
            shape.y = 50;
            this.addChild(shape);
        }
    }
    examples.ShapeTest = ShapeTest;
})(examples || (examples = {}));
