namespace examples {
    export class TouchTest extends dou2d.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: dou2d.Event2D): Promise<void> {
            let texture: dou2d.Texture = await dou.loader.loadAsync("resource/img/wicker.jpg");

            let container1 = new dou2d.DisplayObjectContainer();
            container1.x = 100;
            container1.y = 200;
            container1.scaleX = 2;
            container1.scaleY = 0.5;
            this.addChild(container1);

            let container2 = new dou2d.DisplayObjectContainer();
            container2.x = 100;
            container2.y = 100;
            container2.rotation = 45;
            container1.addChild(container2);

            let bitmap = new dou2d.Bitmap(texture);
            bitmap.anchorOffsetX = 128;
            bitmap.anchorOffsetY = 128;
            bitmap.touchEnabled = true;
            container2.addChild(bitmap);

            bitmap.on(dou2d.TouchEvent.TOUCH_BEGIN, () => { console.log("TOUCH_BEGIN"); });
            bitmap.on(dou2d.TouchEvent.TOUCH_MOVE, () => { console.log("TOUCH_MOVE"); });
            bitmap.on(dou2d.TouchEvent.TOUCH_TAP, () => { console.log("TOUCH_TAP"); });
            bitmap.on(dou2d.TouchEvent.TOUCH_END, () => { console.log("TOUCH_END"); });
            bitmap.on(dou2d.TouchEvent.TOUCH_RELEASE_OUTSIDE, () => { console.log("TOUCH_RELEASE_OUTSIDE"); });
            bitmap.on(dou2d.TouchEvent.TOUCH_CANCEL, () => { console.log("TOUCH_CANCEL"); });
        }
    }
}
