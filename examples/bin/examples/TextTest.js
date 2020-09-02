var examples;
(function (examples) {
    class TextTest extends Dou.DisplayObjectContainer {
        constructor() {
            super();
            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            let textFiled = new Dou.TextField();
            textFiled.text = "你好，Dou2D！";
            textFiled.x = 100;
            textFiled.y = 100;
            this.addChild(textFiled);
            let input = new Dou.TextField();
            input.type = 1 /* input */;
            input.text = "请输入";
            input.x = 100;
            input.y = 300;
            this.addChild(input);
        }
    }
    examples.TextTest = TextTest;
})(examples || (examples = {}));
