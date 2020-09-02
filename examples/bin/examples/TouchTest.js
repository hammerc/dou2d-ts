var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var examples;
(function (examples) {
    class TouchTest extends Dou.DisplayObjectContainer {
        constructor() {
            super();
            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            return __awaiter(this, void 0, void 0, function* () {
                let texture = yield Dou.loader.loadAsync("resource/img/wicker.jpg");
                let container1 = new Dou.DisplayObjectContainer();
                container1.x = 100;
                container1.y = 200;
                container1.scaleX = 2;
                container1.scaleY = 0.5;
                this.addChild(container1);
                let container2 = new Dou.DisplayObjectContainer();
                container2.x = 100;
                container2.y = 100;
                container2.rotation = 45;
                container1.addChild(container2);
                let bitmap = new Dou.Bitmap(texture);
                bitmap.anchorOffsetX = 128;
                bitmap.anchorOffsetY = 128;
                bitmap.touchEnabled = true;
                container2.addChild(bitmap);
                bitmap.on(Dou.TouchEvent.TOUCH_BEGIN, () => { console.log("TOUCH_BEGIN"); });
                bitmap.on(Dou.TouchEvent.TOUCH_MOVE, () => { console.log("TOUCH_MOVE"); });
                bitmap.on(Dou.TouchEvent.TOUCH_TAP, () => { console.log("TOUCH_TAP"); });
                bitmap.on(Dou.TouchEvent.TOUCH_END, () => { console.log("TOUCH_END"); });
                bitmap.on(Dou.TouchEvent.TOUCH_RELEASE_OUTSIDE, () => { console.log("TOUCH_RELEASE_OUTSIDE"); });
            });
        }
    }
    examples.TouchTest = TouchTest;
})(examples || (examples = {}));
