namespace examples {
    export class TTFTest extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: Dou.Event2D): Promise<void> {
            await Dou.loader.loadAsync("resource/ttf/myFont.ttf");

            Dou.registerFontMapping("MyFont", "resource/ttf/myFont.ttf");

            let textFiled = new Dou.TextField();
            textFiled.fontFamily = "MyFont";
            textFiled.text = "你好，Dou2D！";
            textFiled.x = 100;
            textFiled.y = 100;
            this.addChild(textFiled);
        }
    }
}
