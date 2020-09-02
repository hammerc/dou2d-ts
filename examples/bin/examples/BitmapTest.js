var examples;
(function (examples) {
    class BitmapTest extends Dou.DisplayObjectContainer {
        constructor() {
            super();
            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            Dou.loader.load("resource/img/wicker.jpg", (data, url) => {
                let bitmap = new Dou.Bitmap(data);
                bitmap.x = 100;
                bitmap.y = 100;
                this.addChild(bitmap);
            });
        }
    }
    examples.BitmapTest = BitmapTest;
})(examples || (examples = {}));
