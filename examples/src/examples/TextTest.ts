namespace examples {
    export class TextTest extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: Dou.Event2D): void {
            let textFiled = new Dou.TextField();
            textFiled.text = "你好，Dou2D！";
            textFiled.x = 100;
            textFiled.y = 100;
            this.addChild(textFiled);

            let input = new Dou.TextField();
            input.type = Dou.TextFieldType.input;
            input.text = "请输入";
            input.x = 100;
            input.y = 300;
            this.addChild(input);
        }
    }
}
