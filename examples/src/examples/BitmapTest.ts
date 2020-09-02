namespace examples {
    export class BitmapTest extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: Dou.Event2D): void {
            Dou.loader.load("resource/img/wicker.jpg", (data, url) => {
                let bitmap = new Dou.Bitmap(data);
                bitmap.x = 100;
                bitmap.y = 100;
                this.addChild(bitmap);
            });
        }
    }
}
