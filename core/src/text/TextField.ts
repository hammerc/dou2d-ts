namespace dou2d {
    let SplitRegex = new RegExp("(?=[\\u00BF-\\u1FFF\\u2C00-\\uD7FF]|\\b|\\s)(?![。，！、》…）)}”】\\.\\,\\!\\?\\]\\:])");

    /**
     * 动态文本
     * @author wizardc
     */
    export class TextField extends DisplayObject {

        /**
         * 默认文本字体
         */
        public static default_fontFamily: string = "Arial";

        /**
         * 默认文本字号大小
         */
        public static default_size: number = 30;

        /**
         * 默认文本颜色
         */
        public static default_textColor: number = 0xffffff;

        constructor() {
            super();
            let textNode = new TextNode();
            textNode.fontFamily = TextField.default_fontFamily;
            this.textNode = textNode;
            this.$renderNode = textNode;
            this.$TextField = {
                0: TextField.default_size,
                1: 0,
                2: TextField.default_textColor,
                3: NaN,
                4: NaN,
                5: 0,
                6: 0,
                7: 0,
                8: TextField.default_fontFamily,
                9: "left",
                10: "top",
                11: "#ffffff",
                12: "",
                13: "",
                14: [],
                15: false,
                16: false,
                17: true,
                18: false,
                19: false,
                20: false,
                21: 0,
                22: 0,
                23: 0,
                24: TextFieldType.dynamic,
                25: 0x000000,
                26: "#000000",
                27: 0,
                28: -1,
                29: 0,
                30: false,
                31: false,
                32: 0x000000,
                33: false,
                34: 0xffffff,
                35: null,
                36: null,
                37: TextFieldInputType.text
            };
        }

        $TextField: Object;

        private isInput(): boolean {
            return this.$TextField[TextKeys.type] == TextFieldType.input;
        }

        $inputEnabled: boolean = false;

        $setTouchEnabled(value: boolean): void {
            super.$setTouchEnabled(value);

            if (this.isInput()) {
                this.$inputEnabled = true;
            }
        }

        /**
         * 要使用的字体的名称或用逗号分隔的字体名称列表
         */
        public get fontFamily(): string {
            return this.$TextField[TextKeys.fontFamily];
        }

        public set fontFamily(value: string) {
            this.$setFontFamily(value);
        }

        $setFontFamily(value: string): boolean {
            let values = this.$TextField;
            if (values[TextKeys.fontFamily] == value) {
                return false;
            }
            values[TextKeys.fontFamily] = value;
            this.invalidateFontString();
            return true;
        }

        /**
         * 文本的字号大小
         */
        public get size(): number {
            return this.$TextField[TextKeys.fontSize];
        }

        public set size(value: number) {
            this.$setSize(value);
        }

        $setSize(value: number): boolean {
            let values = this.$TextField;
            if (values[TextKeys.fontSize] == value) {
                return false;
            }
            values[TextKeys.fontSize] = value;
            this.invalidateFontString();
            return true;
        }

        /**
         * 是否显示为粗体
         */
        public get bold(): boolean {
            return this.$TextField[TextKeys.bold];
        }

        public set bold(value: boolean) {
            this.$setBold(value);
        }

        $setBold(value: boolean): boolean {
            let values = this.$TextField;
            if (value == values[TextKeys.bold]) {
                return false;
            }
            values[TextKeys.bold] = value;
            this.invalidateFontString();
            return true;
        }

        /**
         * 是否显示为斜体
         */
        public get italic(): boolean {
            return this.$TextField[TextKeys.italic];
        }

        public set italic(value: boolean) {
            this.$setItalic(value);
        }

        $setItalic(value: boolean): boolean {
            let values = this.$TextField;
            if (value == values[TextKeys.italic]) {
                return false;
            }
            values[TextKeys.italic] = value;
            this.invalidateFontString();
            return true;
        }

        private invalidateFontString(): void {
            this.$TextField[TextKeys.fontStringChanged] = true;
            this.$invalidateTextField();
        }

        /**
         * 文本的水平对齐方式
         */
        public get textAlign(): HorizontalAlign {
            return this.$TextField[TextKeys.textAlign];
        }

        public set textAlign(value: HorizontalAlign) {
            this.$setTextAlign(value);
        }

        $setTextAlign(value: HorizontalAlign): boolean {
            let values = this.$TextField;
            if (values[TextKeys.textAlign] == value) {
                return false;
            }
            values[TextKeys.textAlign] = value;
            this.$invalidateTextField();
            return true;
        }

        /**
         * 文字的垂直对齐方式
         */
        public get verticalAlign(): VerticalAlign {
            return this.$TextField[TextKeys.verticalAlign];
        }

        public set verticalAlign(value: VerticalAlign) {
            this.$setVerticalAlign(value);
        }

        $setVerticalAlign(value: VerticalAlign): boolean {
            let values = this.$TextField;
            if (values[TextKeys.verticalAlign] == value) {
                return false;
            }
            values[TextKeys.verticalAlign] = value;
            this.$invalidateTextField();
            return true;
        }

        /**
         * 一个整数，表示行与行之间的垂直间距量
         */
        public get lineSpacing(): number {
            return this.$TextField[TextKeys.lineSpacing];
        }

        public set lineSpacing(value: number) {
            this.$setLineSpacing(value);
        }

        $setLineSpacing(value: number): boolean {
            let values = this.$TextField;
            if (values[TextKeys.lineSpacing] == value) {
                return false;
            }
            values[TextKeys.lineSpacing] = value;
            this.$invalidateTextField();
            return true;
        }

        /**
         * 文本颜色
         */
        public get textColor(): number {
            return this.$TextField[TextKeys.textColor];
        }

        public set textColor(value: number) {
            this.$setTextColor(value);
        }

        $setTextColor(value: number): boolean {
            let values = this.$TextField;
            if (values[TextKeys.textColor] == value) {
                return false;
            }
            values[TextKeys.textColor] = value;
            if (this.inputUtils) {
                this.inputUtils.setColor(this.$TextField[TextKeys.textColor]);
            }
            this.$invalidateTextField();
            return true;
        }

        /**
         * 一个布尔值，表示文本字段是否按单词换行。如果值为 true，则该文本字段按单词换行；
         * 如果值为 false，则该文本字段按字符换行
         */
        public get wordWrap(): boolean {
            return this.$TextField[TextKeys.wordWrap];
        }

        public set wordWrap(value: boolean) {
            this.$setWordWrap(value);
        }

        $setWordWrap(value: boolean): void {
            let values = this.$TextField;
            if (value == values[TextKeys.wordWrap]) {
                return;
            }
            if (values[TextKeys.displayAsPassword]) {
                return;
            }
            values[TextKeys.wordWrap] = value;
            this.$invalidateTextField();
        }

        protected inputUtils: input.InputController = null;

        /**
         * 文本字段的类型
         */
        public set type(value: TextFieldType) {
            this.$setType(value);
        }

        $setType(value: TextFieldType): boolean {
            let values = this.$TextField;
            if (values[TextKeys.type] != value) {
                values[TextKeys.type] = value;
                if (value == TextFieldType.input) {//input，如果没有设置过宽高，则设置默认值为100，30
                    if (isNaN(values[TextKeys.textFieldWidth])) {
                        this.$setWidth(100);
                    }
                    if (isNaN(values[TextKeys.textFieldHeight])) {
                        this.$setHeight(30);
                    }

                    this.$setTouchEnabled(true);

                    //创建stageText
                    if (this.inputUtils == null) {
                        this.inputUtils = new input.InputController();
                    }

                    this.inputUtils.init(this);
                    this.$invalidateTextField();

                    if (this._stage) {
                        this.inputUtils.addStageText();
                    }
                }
                else {
                    if (this.inputUtils) {
                        this.inputUtils.removeStageText();
                        this.inputUtils = null;
                    }
                    this.$setTouchEnabled(false);
                }

                return true;
            }
            return false;
        }

        public get type(): TextFieldType {
            return this.$TextField[TextKeys.type];
        }

        /**
         * 弹出键盘的类型
         */
        public set inputType(value: string) {
            if (this.$TextField[TextKeys.inputType] == value) {
                return;
            }
            this.$TextField[TextKeys.inputType] = value;
        }

        public get inputType(): string {
            return this.$TextField[TextKeys.inputType];
        }

        public get text(): string {
            return this.$getText();
        }

        public $getText(): string {
            if (this.$TextField[TextKeys.type] == TextFieldType.input) {
                return this.inputUtils.getText();
            }

            return this.$TextField[TextKeys.text];
        }

        /**
         * 作为文本字段中当前文本的字符串
         */
        public set text(value: string) {
            this.$setText(value);
        }

        $setBaseText(value: string): boolean {
            if (value == null) {
                value = "";
            }
            else {
                value = value.toString();
            }

            this.isFlow = false;
            let values = this.$TextField;
            if (values[TextKeys.text] != value) {
                this.$invalidateTextField();
                values[TextKeys.text] = value;
                let text: string = "";
                if (values[TextKeys.displayAsPassword]) {
                    text = this.changeToPassText(value);
                }
                else {
                    text = value;
                }

                this.setMiddleStyle([<ITextElement>{ text: text }]);
                return true;
            }
            return false;
        }

        $setText(value: string): boolean {
            if (value == null) {
                value = "";
            }

            let result: boolean = this.$setBaseText(value);
            if (this.inputUtils) {
                this.inputUtils.setText(this.$TextField[TextKeys.text]);
            }
            return result;
        }

        /**
         * 指定文本字段是否是密码文本字段。
         * 如果此属性的值为 true，则文本字段被视为密码文本字段，并使用星号而不是实际字符来隐藏输入的字符。如果为 false，则不会将文本字段视为密码文本字段
         */
        public get displayAsPassword(): boolean {
            return this.$TextField[TextKeys.displayAsPassword];
        }

        public set displayAsPassword(value: boolean) {
            this.$setDisplayAsPassword(value);
        }

        $setDisplayAsPassword(value: boolean): boolean {
            let values = this.$TextField;
            if (values[TextKeys.displayAsPassword] != value) {
                values[TextKeys.displayAsPassword] = value;

                this.$invalidateTextField();

                let text: string = "";
                if (value) {
                    text = this.changeToPassText(values[TextKeys.text]);
                }
                else {
                    text = values[TextKeys.text];
                }

                this.setMiddleStyle([<ITextElement>{ text: text }]);

                return true;
            }
            return false;
        }

        public get strokeColor(): number {
            return this.$TextField[TextKeys.strokeColor];
        }

        /**
         * 表示文本的描边颜色
         */
        public set strokeColor(value: number) {
            this.$setStrokeColor(value);
        }

        $setStrokeColor(value: number): boolean {
            let values = this.$TextField;
            if (values[TextKeys.strokeColor] != value) {
                this.$invalidateTextField();
                values[TextKeys.strokeColor] = value;
                values[TextKeys.strokeColorString] = toColorString(value);

                return true;
            }

            return false;
        }

        public get stroke(): number {
            return this.$TextField[TextKeys.stroke];
        }

        /**
         * 表示描边宽度。
         * 0为没有描边。
         */
        public set stroke(value: number) {
            this.$setStroke(value);
        }

        $setStroke(value: number): boolean {
            if (this.$TextField[TextKeys.stroke] != value) {
                this.$invalidateTextField();
                this.$TextField[TextKeys.stroke] = value;
                return true;
            }
            return false;
        }

        /**
         * 文本字段中最多可包含的字符数（即用户输入的字符数）。
         * 脚本可以插入比 maxChars 允许的字符数更多的文本；maxChars 属性仅表示用户可以输入多少文本。如果此属性的值为 0，则用户可以输入无限数量的文本
         */
        public get maxChars(): number {
            return this.$TextField[TextKeys.maxChars];
        }

        public set maxChars(value: number) {
            this.$setMaxChars(value);
        }

        $setMaxChars(value: number): boolean {
            if (this.$TextField[TextKeys.maxChars] != value) {
                this.$TextField[TextKeys.maxChars] = value;
                return true;
            }

            return false;
        }

        /**
         * 文本在文本字段中的垂直位置。scrollV 属性可帮助用户定位到长篇文章的特定段落，还可用于创建滚动文本字段
         * 垂直滚动的单位是行，而水平滚动的单位是像素
         * 如果显示的第一行是文本字段中的第一行，则 scrollV 设置为 1（而非 0）
         */
        public set scrollV(value: number) {
            value = Math.max(value, 1);
            if (value == this.$TextField[TextKeys.scrollV]) {
                return;
            }
            this.$TextField[TextKeys.scrollV] = value;
            this.$invalidateTextField();
        }

        public get scrollV(): number {
            return Math.min(Math.max(this.$TextField[TextKeys.scrollV], 1), this.maxScrollV);
        }

        /**
         * scrollV 的最大值
         */
        public get maxScrollV(): number {
            this.$getLinesArr();
            return Math.max(this.$TextField[TextKeys.numLines] - TextFieldUtil.getScrollNum(this) + 1, 1);
        }

        public get selectionBeginIndex(): number {
            return 0;
        }

        public get selectionEndIndex(): number {
            return 0;
        }

        public get caretIndex(): number {
            return 0;
        }

        $setSelection(beginIndex: number, endIndex: number): boolean {
            return false;
        }

        $getLineHeight(): number {
            return this.$TextField[TextKeys.lineSpacing] + this.$TextField[TextKeys.fontSize];
        }

        /**
         * 文本行数
         */
        public get numLines(): number {
            this.$getLinesArr();
            return this.$TextField[TextKeys.numLines];
        }

        /**
         * 表示字段是否为多行文本字段。注意，此属性仅在type为TextFieldType.INPUT时才有效。
         * 如果值为 true，则文本字段为多行文本字段；如果值为 false，则文本字段为单行文本字段。在类型为 TextFieldType.INPUT 的字段中，multiline 值将确定 Enter 键是否创建新行（如果值为 false，则将忽略 Enter 键）。
         */
        public set multiline(value: boolean) {
            this.$setMultiline(value);
        }

        $setMultiline(value: boolean): boolean {
            if (this.$TextField[TextKeys.multiline] == value) {
                return false;
            }
            this.$TextField[TextKeys.multiline] = value;
            this.$invalidateTextField();
            return true;
        }

        public get multiline(): boolean {
            return this.$TextField[TextKeys.multiline];
        }

        /**
         * 表示用户可输入到文本字段中的字符集。如果 restrict 属性的值为 null，则可以输入任何字符。如果 restrict 属性的值为空字符串，则不能输入任何字符。如果 restrict 属性的值为一串字符，则只能在文本字段中输入该字符串中的字符。从左向右扫描该字符串。可以使用连字符 (-) 指定一个范围。只限制用户交互；脚本可将任何文本放入文本字段中。<br/>
         * 如果字符串以尖号 (^) 开头，则先接受所有字符，然后从接受字符集中排除字符串中 ^ 之后的字符。如果字符串不以尖号 (^) 开头，则最初不接受任何字符，然后将字符串中的字符包括在接受字符集中。<br/>
         * 下例仅允许在文本字段中输入大写字符、空格和数字：<br/>
         * my_txt.restrict = "A-Z 0-9";<br/>
         * 下例包含除小写字母之外的所有字符：<br/>
         * my_txt.restrict = "^a-z";<br/>
         * 如果需要输入字符 \ ^，请使用2个反斜杠 "\\-" "\\^" ：<br/>
         * 可在字符串中的任何位置使用 ^，以在包含字符与排除字符之间进行切换，但是最多只能有一个 ^ 用来排除。下面的代码只包含除大写字母 Q 之外的大写字母：<br/>
         * my_txt.restrict = "A-Z^Q";<br/>
         */
        public set restrict(value: string) {
            let values = this.$TextField;
            if (value == null) {
                values[TextKeys.restrictAnd] = null;
                values[TextKeys.restrictNot] = null;
            }
            else {
                let index = -1;
                while (index < value.length) {
                    index = value.indexOf("^", index);
                    if (index == 0) {
                        break;
                    }
                    else if (index > 0) {
                        if (value.charAt(index - 1) != "\\") {
                            break;
                        }
                        index++;
                    }
                    else {
                        break;
                    }
                }

                if (index == 0) {
                    values[TextKeys.restrictAnd] = null;
                    values[TextKeys.restrictNot] = value.substring(index + 1);
                }
                else if (index > 0) {
                    values[TextKeys.restrictAnd] = value.substring(0, index);
                    values[TextKeys.restrictNot] = value.substring(index + 1);
                }
                else {
                    values[TextKeys.restrictAnd] = value;
                    values[TextKeys.restrictNot] = null;
                }
            }

        }

        public get restrict(): string {
            let values = this.$TextField;

            let str: string = null;
            if (values[TextKeys.restrictAnd] != null) {
                str = values[TextKeys.restrictAnd];
            }

            if (values[TextKeys.restrictNot] != null) {
                if (str == null) {
                    str = "";
                }
                str += "^" + values[TextKeys.restrictNot];
            }
            return str;
        }

        $setWidth(value: number): boolean {
            let values = this.$TextField;
            if (isNaN(value)) {
                if (isNaN(values[TextKeys.textFieldWidth])) {
                    return false;
                }

                values[TextKeys.textFieldWidth] = NaN;
            }
            else {
                if (values[TextKeys.textFieldWidth] == value) {
                    return false;
                }

                values[TextKeys.textFieldWidth] = value;
            }

            value = +value;
            if (value < 0) {
                return false;
            }
            this.$invalidateTextField();

            return true;
        }

        $setHeight(value: number): boolean {
            let values = this.$TextField;
            if (isNaN(value)) {
                if (isNaN(values[TextKeys.textFieldHeight])) {
                    return false;
                }

                values[TextKeys.textFieldHeight] = NaN;
            }
            else {
                if (values[TextKeys.textFieldHeight] == value) {
                    return false;
                }

                values[TextKeys.textFieldHeight] = value;
            }

            value = +value;
            if (value < 0) {
                return false;
            }
            this.$invalidateTextField();

            return true;
        }

        /**
         * 获取显示宽度
         */
        $getWidth(): number {
            let values = this.$TextField;
            return isNaN(values[TextKeys.textFieldWidth]) ? this.$getContentBounds().width : values[TextKeys.textFieldWidth];
        }

        /**
         * 获取显示宽度
         */
        $getHeight(): number {
            let values = this.$TextField;
            return isNaN(values[TextKeys.textFieldHeight]) ? this.$getContentBounds().height : values[TextKeys.textFieldHeight];
        }

        private textNode: TextNode;
        public $graphicsNode: GraphicsNode = null;

        /**
         * 指定文本字段是否具有边框。
         * 如果为 true，则文本字段具有边框。如果为 false，则文本字段没有边框。
         * 使用 borderColor 属性来设置边框颜色。
         */
        public set border(value: boolean) {
            this.$setBorder(value);
        }

        $setBorder(value: boolean): void {
            value = !!value;
            if (this.$TextField[TextKeys.border] == value) {
                return;
            }
            this.$TextField[TextKeys.border] = value;
            this.$invalidateTextField();
        }

        public get border(): boolean {
            return this.$TextField[TextKeys.border];
        }

        /**
         * 文本字段边框的颜色。
         * 即使当前没有边框，也可检索或设置此属性，但只有当文本字段已将 border 属性设置为 true 时，才可以看到颜色
         */
        public set borderColor(value: number) {
            this.$setBorderColor(value);
        }

        $setBorderColor(value: number): void {
            value = +value || 0;
            if (this.$TextField[TextKeys.borderColor] == value) {
                return;
            }
            this.$TextField[TextKeys.borderColor] = value;
            this.$invalidateTextField();
        }

        public get borderColor(): number {
            return this.$TextField[TextKeys.borderColor];
        }

        /**
         * 指定文本字段是否具有背景填充。
         * 如果为 true，则文本字段具有背景填充。如果为 false，则文本字段没有背景填充。
         * 使用 backgroundColor 属性来设置文本字段的背景颜色。
         */
        public set background(value: boolean) {
            this.$setBackground(value);
        }

        $setBackground(value: boolean): void {
            if (this.$TextField[TextKeys.background] == value) {
                return;
            }
            this.$TextField[TextKeys.background] = value;
            this.$invalidateTextField();
        }

        public get background(): boolean {
            return this.$TextField[TextKeys.background];
        }

        /**
         * 文本字段背景的颜色。
         * 即使当前没有背景，也可检索或设置此属性，但只有当文本字段已将 background 属性设置为 true 时，才可以看到颜色
         */
        public set backgroundColor(value: number) {
            this.$setBackgroundColor(value);
        }

        $setBackgroundColor(value: number): void {
            if (this.$TextField[TextKeys.backgroundColor] == value) {
                return;
            }
            this.$TextField[TextKeys.backgroundColor] = value;
            this.$invalidateTextField();
        }

        public get backgroundColor(): number {
            return this.$TextField[TextKeys.backgroundColor];
        }

        private fillBackground(lines?: number[]): void {
            let graphics = this.$graphicsNode;
            if (graphics) {
                graphics.clear();
            }
            let values = this.$TextField;
            if (values[TextKeys.background] || values[TextKeys.border] || (lines && lines.length > 0)) {
                if (!graphics) {
                    graphics = this.$graphicsNode = new GraphicsNode();
                    let groupNode = new GroupNode();
                    groupNode.addNode(graphics);
                    groupNode.addNode(this.textNode);
                    this.$renderNode = groupNode;
                }
                let fillPath: Path2D;
                let strokePath: Path2D;
                //渲染背景
                if (values[TextKeys.background]) {
                    fillPath = graphics.beginFill(values[TextKeys.backgroundColor]);
                    fillPath.drawRect(0, 0, this.$getWidth(), this.$getHeight());
                }
                //渲染边框
                if (values[TextKeys.border]) {
                    strokePath = graphics.lineStyle(1, values[TextKeys.borderColor]);
                    //1像素和3像素线条宽度的情况，会向右下角偏移0.5像素绘制。少画一像素宽度，正好能不超出文本测量边界。
                    strokePath.drawRect(0, 0, this.$getWidth() - 1, this.$getHeight() - 1);
                }
                //渲染下划线
                if (lines && lines.length > 0) {
                    let textColor = values[TextKeys.textColor];
                    let lastColor = -1;
                    let length = lines.length;
                    for (let i = 0; i < length; i += 4) {
                        let x: number = lines[i];
                        let y: number = lines[i + 1];
                        let w: number = lines[i + 2];
                        let color: number = lines[i + 3] || textColor;
                        if (lastColor < 0 || lastColor != color) {
                            lastColor = color;
                            strokePath = graphics.lineStyle(2, color, 1, CapsStyle.none);
                        }
                        strokePath.moveTo(x, y);
                        strokePath.lineTo(x + w, y);
                    }
                }
            }
            if (graphics) {
                let bounds = this.$getRenderBounds();
                graphics.x = bounds.x;
                graphics.y = bounds.y;
                graphics.width = bounds.width;
                graphics.height = bounds.height;
                bounds.recycle();
            }
        }

        /**
         * 输入文本自动进入到输入状态，仅在类型是输入文本并且是在用户交互下才可以调用
         */
        public setFocus(): void {
            if (this.type == TextFieldType.input && this._stage) {
                this.inputUtils.onFocus();
            }
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();

            this.removeEvent();

            if (this.$TextField[TextKeys.type] == TextFieldType.input) {
                this.inputUtils.removeStageText();
            }

            if (this.textNode) {
                this.textNode.clean();
            }

        }

        public $onAddToStage(stage: Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);

            this.addEvent();

            if (this.$TextField[TextKeys.type] == TextFieldType.input) {
                this.inputUtils.addStageText();
            }

        }

        $invalidateTextField(): void {
            let self = this;
            self.$renderDirty = true;
            self.$TextField[TextKeys.textLinesChanged] = true;
            let p = self._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = self.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        $getRenderBounds(): dou.Recyclable<Rectangle> {
            let bounds = this.$getContentBounds();

            let tmpBounds = dou.recyclable(Rectangle);
            tmpBounds.copy(bounds);
            if (this.$TextField[TextKeys.border]) {
                tmpBounds.width += 2;
                tmpBounds.height += 2;
            }
            let _strokeDouble = this.$TextField[TextKeys.stroke] * 2;
            if (_strokeDouble > 0) {
                tmpBounds.width += _strokeDouble * 2;
                tmpBounds.height += _strokeDouble * 2;
            }
            tmpBounds.x -= _strokeDouble + 2;//+2和+4 是为了webgl纹理太小导致裁切问题
            tmpBounds.y -= _strokeDouble + 2;
            tmpBounds.width = Math.ceil(tmpBounds.width) + 4;
            tmpBounds.height = Math.ceil(tmpBounds.height) + 4;
            return tmpBounds;
        }

        $measureContentBounds(bounds: Rectangle): void {
            this.$getLinesArr();
            let w: number = 0;
            let h: number = 0;
            w = !isNaN(this.$TextField[TextKeys.textFieldWidth]) ? this.$TextField[TextKeys.textFieldWidth] : this.$TextField[TextKeys.textWidth];
            h = !isNaN(this.$TextField[TextKeys.textFieldHeight]) ? this.$TextField[TextKeys.textFieldHeight] : TextFieldUtil.getTextHeight(this);
            bounds.set(0, 0, w, h);
        }

        $updateRenderNode(): void {
            if (this.$TextField[TextKeys.type] == TextFieldType.input) {
                this.inputUtils.updateProperties();
                if (this.$isTyping) {
                    this.fillBackground();
                    return;
                }
            }
            else if (this.$TextField[TextKeys.textFieldWidth] == 0) {
                let graphics = this.$graphicsNode;
                if (graphics) {
                    graphics.clear();
                }
                return;
            }

            let underLines = this.drawText();
            this.fillBackground(underLines);
            //tudo 宽高很小的情况下webgl模式绘制异常
            let bounds = this.$getRenderBounds();
            let node = this.textNode;
            node.x = bounds.x;
            node.y = bounds.y;
            node.width = Math.ceil(bounds.width);
            node.height = Math.ceil(bounds.height);
            bounds.recycle();
        }

        private isFlow: boolean = false;

        /**
         * 设置富文本
         */
        public set textFlow(textArr: Array<ITextElement>) {
            this.isFlow = true;
            let text: string = "";
            if (textArr == null)
                textArr = [];
            for (let i: number = 0; i < textArr.length; i++) {
                let element: ITextElement = textArr[i];
                text += element.text;
            }

            if (this.$TextField[TextKeys.displayAsPassword]) {
                this.$setBaseText(text);
            }
            else {
                this.$TextField[TextKeys.text] = text;
                this.setMiddleStyle(textArr);
            }
        }

        public get textFlow(): Array<ITextElement> {
            return this.textArr;
        }

        private changeToPassText(text: string): string {
            if (this.$TextField[TextKeys.displayAsPassword]) {
                let passText: string = "";
                for (let i: number = 0, num = text.length; i < num; i++) {
                    switch (text.charAt(i)) {
                        case '\n':
                            passText += "\n";
                            break;
                        case '\r':
                            break;
                        default:
                            passText += '*';
                    }
                }
                return passText;
            }
            return text;
        }

        private textArr: Array<ITextElement> = [];

        private setMiddleStyle(textArr: Array<ITextElement>): void {
            this.$TextField[TextKeys.textLinesChanged] = true;
            this.textArr = textArr;
            this.$invalidateTextField();
        }

        /**
         * 获取文本测量宽度
         */
        public get textWidth(): number {
            this.$getLinesArr();
            return this.$TextField[TextKeys.textWidth];
        }

        /**
         * 获取文本测量高度
         */
        public get textHeight(): number {
            this.$getLinesArr();
            return TextFieldUtil.getTextHeight(this);
        }

        public appendText(text: string): void {
            this.appendElement(<ITextElement>{ text: text });
        }

        public appendElement(element: ITextElement): void {
            const text: string = this.$TextField[TextKeys.text] + element.text;

            if (this.$TextField[TextKeys.displayAsPassword]) {
                this.$setBaseText(text);
            }
            else {
                this.$TextField[TextKeys.text] = text;

                this.textArr.push(element);
                this.setMiddleStyle(this.textArr);
            }
        }

        private linesArr: Array<ILineElement> = [];

        $getLinesArr(): Array<ILineElement> {
            let values = this.$TextField;

            if (!values[TextKeys.textLinesChanged]) {
                return this.linesArr;
            }

            values[TextKeys.textLinesChanged] = false;
            let text2Arr: Array<ITextElement> = this.textArr;

            this.linesArr.length = 0;
            values[TextKeys.textHeight] = 0;
            values[TextKeys.textWidth] = 0;

            let textFieldWidth: number = values[TextKeys.textFieldWidth];
            //宽度被设置为0
            if (!isNaN(textFieldWidth) && textFieldWidth == 0) {
                values[TextKeys.numLines] = 0;
                return [{ width: 0, height: 0, charNum: 0, elements: [], hasNextLine: false }];
            }

            let linesArr: Array<ILineElement> = this.linesArr;
            let lineW: number = 0;
            let lineCharNum: number = 0;
            let lineH: number = 0;
            let lineCount: number = 0;
            let lineElement: ILineElement;

            for (let i: number = 0, text2ArrLength: number = text2Arr.length; i < text2ArrLength; i++) {
                let element: ITextElement = text2Arr[i];
                //可能设置为没有文本，忽略绘制
                if (!element.text) {
                    if (lineElement) {
                        lineElement.width = lineW;
                        lineElement.height = lineH;
                        lineElement.charNum = lineCharNum;
                        values[TextKeys.textWidth] = Math.max(values[TextKeys.textWidth], lineW);
                        values[TextKeys.textHeight] += lineH;
                    }
                    continue;
                }
                element.style = element.style || <ITextStyle>{};

                let text: string = element.text.toString();
                let textArr: string[] = text.split(/(?:\r\n|\r|\n)/);

                for (let j: number = 0, textArrLength: number = textArr.length; j < textArrLength; j++) {
                    if (linesArr[lineCount] == null) {
                        lineElement = { width: 0, height: 0, elements: [], charNum: 0, hasNextLine: false };
                        linesArr[lineCount] = lineElement;
                        lineW = 0;
                        lineH = 0;
                        lineCharNum = 0;
                    }

                    if (values[TextKeys.type] == TextFieldType.input) {
                        lineH = values[TextKeys.fontSize];
                    }
                    else {
                        lineH = Math.max(lineH, element.style.size || values[TextKeys.fontSize]);
                    }

                    let isNextLine: boolean = true;
                    if (textArr[j] == "") {
                        if (j == textArrLength - 1) {
                            isNextLine = false;
                        }
                    }
                    else {
                        let w: number = HtmlUtil.measureTextByStyle(textArr[j], values, element.style);
                        if (isNaN(textFieldWidth)) {//没有设置过宽
                            lineW += w;
                            lineCharNum += textArr[j].length;
                            lineElement.elements.push(<IWTextElement>{
                                width: w,
                                text: textArr[j],
                                style: element.style
                            });

                            if (j == textArrLength - 1) {
                                isNextLine = false;
                            }
                        }
                        else {
                            if (lineW + w <= textFieldWidth) {//在设置范围内
                                lineElement.elements.push(<IWTextElement>{
                                    width: w,
                                    text: textArr[j],
                                    style: element.style
                                });
                                lineW += w;
                                lineCharNum += textArr[j].length;

                                if (j == textArrLength - 1) {
                                    isNextLine = false;
                                }
                            }
                            else {
                                let k: number = 0;
                                let ww: number = 0;
                                let word: string = textArr[j];
                                let words: string[];
                                if (values[TextKeys.wordWrap]) {
                                    words = word.split(SplitRegex);
                                }
                                else {
                                    words = word.match(/./g);
                                }
                                let wl: number = words.length;
                                let charNum = 0;
                                for (; k < wl; k++) {

                                    // detect 4 bytes unicode, refer https://mths.be/punycode
                                    var codeLen = words[k].length;
                                    var has4BytesUnicode = false;
                                    if (codeLen == 1 && k < wl - 1) // when there is 2 bytes high surrogate
                                    {
                                        var charCodeHigh = words[k].charCodeAt(0);
                                        var charCodeLow = words[k + 1].charCodeAt(0);
                                        if (charCodeHigh >= 0xD800 && charCodeHigh <= 0xDBFF && (charCodeLow & 0xFC00) == 0xDC00) { // low
                                            var realWord = words[k] + words[k + 1];
                                            codeLen = 2;
                                            has4BytesUnicode = true;
                                            w = HtmlUtil.measureTextByStyle(realWord, values, element.style);
                                        } else {
                                            w = HtmlUtil.measureTextByStyle(words[k], values, element.style);
                                        }
                                    } else {
                                        w = HtmlUtil.measureTextByStyle(words[k], values, element.style);
                                    }

                                    // w = HtmlUtil.measureTextByStyle(words[k], values, element.style);
                                    if (lineW != 0 && lineW + w > textFieldWidth && lineW + k != 0) {
                                        break;
                                    }
                                    if (ww + w > textFieldWidth) {//纯英文，一个词就超出宽度的情况
                                        var words2: Array<string> = words[k].match(/./g);
                                        for (var k2 = 0, wl2 = words2.length; k2 < wl2; k2++) {

                                            // detect 4 bytes unicode, refer https://mths.be/punycode
                                            var codeLen = words2[k2].length;
                                            var has4BytesUnicode2 = false;
                                            if (codeLen == 1 && k2 < wl2 - 1) // when there is 2 bytes high surrogate
                                            {
                                                var charCodeHigh = words2[k2].charCodeAt(0);
                                                var charCodeLow = words2[k2 + 1].charCodeAt(0);
                                                if (charCodeHigh >= 0xD800 && charCodeHigh <= 0xDBFF && (charCodeLow & 0xFC00) == 0xDC00) { // low
                                                    var realWord = words2[k2] + words2[k2 + 1];
                                                    codeLen = 2;
                                                    has4BytesUnicode2 = true;
                                                    w = HtmlUtil.measureTextByStyle(realWord, values, element.style);
                                                } else {
                                                    w = HtmlUtil.measureTextByStyle(words2[k2], values, element.style);
                                                }
                                            } else {
                                                w = HtmlUtil.measureTextByStyle(words2[k2], values, element.style);
                                            }
                                            // w = HtmlUtil.measureTextByStyle(words2[k2], values, element.style);

                                            if (k2 > 0 && lineW + w > textFieldWidth) {
                                                break;
                                            }
                                            // charNum += words2[k2].length;
                                            charNum += codeLen;
                                            ww += w;
                                            lineW += w;
                                            lineCharNum += charNum;

                                            if (has4BytesUnicode2) {
                                                k2++;
                                            }
                                        }
                                    } else {
                                        // charNum += words[k].length;
                                        charNum += codeLen;
                                        ww += w;
                                        lineW += w;
                                        lineCharNum += charNum;
                                    }

                                    if (has4BytesUnicode) {
                                        k++;
                                    }

                                }

                                if (k > 0) {
                                    lineElement.elements.push(<IWTextElement>{
                                        width: ww,
                                        text: word.substring(0, charNum),
                                        style: element.style
                                    });

                                    let leftWord: string = word.substring(charNum);
                                    let m: number;
                                    let lwleng = leftWord.length;
                                    for (m = 0; m < lwleng; m++) {
                                        if (leftWord.charAt(m) != " ") {
                                            break;
                                        }
                                    }
                                    textArr[j] = leftWord.substring(m);
                                }
                                if (textArr[j] != "") {
                                    j--;
                                    isNextLine = false;
                                }
                            }
                        }
                    }

                    if (isNextLine) {
                        lineCharNum++;
                        lineElement.hasNextLine = true;
                    }

                    if (j < textArr.length - 1) {//非最后一个
                        lineElement.width = lineW;
                        lineElement.height = lineH;
                        lineElement.charNum = lineCharNum;
                        values[TextKeys.textWidth] = Math.max(values[TextKeys.textWidth], lineW);
                        values[TextKeys.textHeight] += lineH;

                        //if (this._type == TextFieldType.INPUT && !this._multiline) {
                        //    this._numLines = linesArr.length;
                        //    return linesArr;
                        //}
                        lineCount++;
                    }


                }

                if (i == text2Arr.length - 1 && lineElement) {
                    lineElement.width = lineW;
                    lineElement.height = lineH;
                    lineElement.charNum = lineCharNum;
                    values[TextKeys.textWidth] = Math.max(values[TextKeys.textWidth], lineW);
                    values[TextKeys.textHeight] += lineH;
                }
            }

            values[TextKeys.numLines] = linesArr.length;
            return linesArr;
        }

        $isTyping: boolean = false;

        public $setIsTyping(value: boolean): void {
            this.$isTyping = value;
            this.$invalidateTextField();
        }

        /**
         * 返回要绘制的下划线列表
         */
        private drawText(): number[] {
            let node = this.textNode;
            let values = this.$TextField;
            //更新文本样式
            node.bold = values[TextKeys.bold];
            node.fontFamily = values[TextKeys.fontFamily] || TextField.default_fontFamily;
            node.italic = values[TextKeys.italic];
            node.size = values[TextKeys.fontSize];
            node.stroke = values[TextKeys.stroke];
            node.strokeColor = values[TextKeys.strokeColor];
            node.textColor = values[TextKeys.textColor];
            //先算出需要的数值
            let lines: Array<ILineElement> = this.$getLinesArr();
            if (values[TextKeys.textWidth] == 0) {
                return [];
            }

            let maxWidth: number = !isNaN(values[TextKeys.textFieldWidth]) ? values[TextKeys.textFieldWidth] : values[TextKeys.textWidth];
            let textHeight: number = TextFieldUtil.getTextHeight(this);

            let drawY: number = 0;
            let startLine: number = TextFieldUtil.getStartLine(this);

            let textFieldHeight: number = values[TextKeys.textFieldHeight];
            if (!isNaN(textFieldHeight) && textFieldHeight > textHeight) {
                let vAlign: number = TextFieldUtil.getValign(this);
                drawY += vAlign * (textFieldHeight - textHeight);
            }
            drawY = Math.round(drawY);
            let hAlign: number = TextFieldUtil.getHalign(this);

            let drawX: number = 0;
            let underLineData: number[] = [];
            for (let i: number = startLine, numLinesLength: number = values[TextKeys.numLines]; i < numLinesLength; i++) {
                let line: ILineElement = lines[i];
                let h: number = line.height;
                drawY += h / 2;
                if (i != startLine) {
                    if (values[TextKeys.type] == TextFieldType.input && !values[TextKeys.multiline]) {
                        break;
                    }
                    if (!isNaN(textFieldHeight) && drawY > textFieldHeight) {
                        break;
                    }
                }

                drawX = Math.round((maxWidth - line.width) * hAlign);
                for (let j: number = 0, elementsLength: number = line.elements.length; j < elementsLength; j++) {
                    let element: IWTextElement = line.elements[j];
                    let size: number = element.style.size || values[TextKeys.fontSize];

                    node.drawText(drawX, drawY + (h - size) / 2, element.text, element.style);

                    if (element.style.underline) {
                        underLineData.push(
                            drawX,
                            drawY + (h) / 2,
                            element.width,
                            element.style.textColor
                        );
                    }

                    drawX += element.width;
                }
                drawY += h / 2 + values[TextKeys.lineSpacing];
            }

            return underLineData;
        }

        //增加点击事件
        private addEvent(): void {
            this.on(TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        }

        //释放点击事件
        private removeEvent(): void {
            this.off(TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        }

        //处理富文本中有href的
        private onTapHandler(e: TouchEvent): void {
            if (this.$TextField[TextKeys.type] == TextFieldType.input) {
                return;
            }
            let ele: ITextElement = TextFieldUtil.getTextElement(this, e.localX, e.localY);
            if (ele == null) {
                return;
            }
            let style: ITextStyle = ele.style;

            if (style && style.href) {
                if (style.href.match(/^event:/)) {
                    let type: string = style.href.match(/^event:/)[0];
                    this.dispatchEvent2D(Event2D.LINK, style.href.substring(type.length));
                }
                else {
                    open(style.href, style.target || "_blank");
                }
            }
        }
    }
}
