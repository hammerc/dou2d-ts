var examples;
(function (examples) {
    class BitmapTest extends dou2d.DisplayObjectContainer {
        constructor() {
            super();
            this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            dou.loader.load("resource/img/wicker.jpg", (data, url) => {
                let bitmap = new dou2d.Bitmap(data);
                bitmap.x = 100;
                bitmap.y = 100;
                this.addChild(bitmap);
            });
        }
    }
    examples.BitmapTest = BitmapTest;
})(examples || (examples = {}));
