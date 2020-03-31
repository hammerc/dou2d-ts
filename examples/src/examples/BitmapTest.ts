namespace examples {
    export class BitmapTest extends dou2d.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: dou2d.Event2D): void {
            dou.loader.load("resource/img/wicker.jpg", (data, url) => {
                let bitmap = new dou2d.Bitmap(data);
                bitmap.x = 100;
                bitmap.y = 100;
                this.addChild(bitmap);
            });
        }
    }
}
