namespace examples {
    export class TextTest extends dou2d.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: dou2d.Event2D): void {
            let textFiled = new dou2d.TextField();
            textFiled.text = "你好，Dou2D！";
            textFiled.x = 100;
            textFiled.y = 100;
            this.addChild(textFiled);

            let input = new dou2d.TextField();
            input.type = dou2d.TextFieldType.input;
            input.text = "请输入";
            input.x = 100;
            input.y = 300;
            this.addChild(input);
        }
    }
}
