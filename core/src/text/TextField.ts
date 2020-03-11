namespace dou2d {
    const SplitRegex = new RegExp("(?=[\\u00BF-\\u1FFF\\u2C00-\\uD7FF]|\\b|\\s)(?![。，！、》…）)}”】\\.\\,\\!\\?\\]\\:])");

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

        public $propertyMap: Object;

        public $inputEnabled: boolean = false;

        protected _inputController: input.InputController;

        protected _textNode: TextNode;
        protected _graphicsNode: GraphicsNode;

        protected _isFlow: boolean = false;
        protected _textArr: ITextElement[];
        protected _linesArr: ILineElement[];
        protected _isTyping: boolean = false;

        public constructor() {
            super();
            let textNode = new TextNode();
            textNode.fontFamily = TextField.default_fontFamily;
            this._textNode = textNode;
            this.$renderNode = textNode;
            this.$propertyMap = {
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
            this._textArr = [];
            this._linesArr = [];
        }

        /**
         * 要使用的字体的名称或用逗号分隔的字体名称列表
         */
        public set fontFamily(value: string) {
            this.$setFontFamily(value);
        }
        public get fontFamily(): string {
            return this.$getFontFamily();
        }

        public $setFontFamily(value: string): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.fontFamily] == value) {
                return false;
            }
            values[TextKeys.fontFamily] = value;
            this.invalidateFontString();
            return true;
        }

        public $getFontFamily(): string {
            return this.$propertyMap[TextKeys.fontFamily];
        }

        /**
         * 字体大小
         */
        public set size(value: number) {
            this.$setSize(value);
        }
        public get size(): number {
            return this.$getSize();
        }

        public $setSize(value: number): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.fontSize] == value) {
                return false;
            }
            values[TextKeys.fontSize] = value;
            this.invalidateFontString();
            return true;
        }

        public $getSize(): number {
            return this.$propertyMap[TextKeys.fontSize];
        }

        /**
         * 是否显示为粗体
         */
        public set bold(value: boolean) {
            this.$setBold(value);
        }
        public get bold(): boolean {
            return this.$getBold();
        }

        public $setBold(value: boolean): boolean {
            let values = this.$propertyMap;
            if (value == values[TextKeys.bold]) {
                return false;
            }
            values[TextKeys.bold] = value;
            this.invalidateFontString();
            return true;
        }

        public $getBold(): boolean {
            return this.$propertyMap[TextKeys.bold];
        }

        /**
         * 是否显示为斜体
         */
        public set italic(value: boolean) {
            this.$setItalic(value);
        }
        public get italic(): boolean {
            return this.$getItalic();
        }

        public $setItalic(value: boolean): boolean {
            let values = this.$propertyMap;
            if (value == values[TextKeys.italic]) {
                return false;
            }
            values[TextKeys.italic] = value;
            this.invalidateFontString();
            return true;
        }

        public $getItalic(): boolean {
            return this.$propertyMap[TextKeys.italic];
        }

        /**
         * 文本的水平对齐方式
         */
        public set textAlign(value: HorizontalAlign) {
            this.$setTextAlign(value);
        }
        public get textAlign(): HorizontalAlign {
            return this.$getTextAlign();
        }

        public $setTextAlign(value: HorizontalAlign): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.textAlign] == value) {
                return false;
            }
            values[TextKeys.textAlign] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getTextAlign(): HorizontalAlign {
            return this.$propertyMap[TextKeys.textAlign];
        }

        /**
         * 文字的垂直对齐方式
         */
        public set verticalAlign(value: VerticalAlign) {
            this.$setVerticalAlign(value);
        }
        public get verticalAlign(): VerticalAlign {
            return this.$getVerticalAlign();
        }

        public $setVerticalAlign(value: VerticalAlign): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.verticalAlign] == value) {
                return false;
            }
            values[TextKeys.verticalAlign] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getVerticalAlign(): VerticalAlign {
            return this.$propertyMap[TextKeys.verticalAlign];
        }

        /**
         * 行与行之间的垂直间距量
         */
        public set lineSpacing(value: number) {
            this.$setLineSpacing(value);
        }
        public get lineSpacing(): number {
            return this.$getLineSpacing();
        }

        public $setLineSpacing(value: number): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.lineSpacing] == value) {
                return false;
            }
            values[TextKeys.lineSpacing] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getLineSpacing(): number {
            return this.$propertyMap[TextKeys.lineSpacing];
        }

        /**
         * 文本颜色
         */
        public set textColor(value: number) {
            this.$setTextColor(value);
        }
        public get textColor(): number {
            return this.$getTextColor();
        }

        public $setTextColor(value: number): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.textColor] == value) {
                return false;
            }
            values[TextKeys.textColor] = value;
            if (this._inputController) {
                this._inputController.setColor(this.$propertyMap[TextKeys.textColor]);
            }
            this.$invalidateTextField();
            return true;
        }

        public $getTextColor(): number {
            return this.$propertyMap[TextKeys.textColor];
        }

        /**
         * 文本字段是按单词换行还是按字符换行
         */
        public set wordWrap(value: boolean) {
            this.$setWordWrap(value);
        }
        public get wordWrap(): boolean {
            return this.$getWordWrap();
        }

        public $setWordWrap(value: boolean): void {
            let values = this.$propertyMap;
            if (value == values[TextKeys.wordWrap]) {
                return;
            }
            if (values[TextKeys.displayAsPassword]) {
                return;
            }
            values[TextKeys.wordWrap] = value;
            this.$invalidateTextField();
        }

        public $getWordWrap(): boolean {
            return this.$propertyMap[TextKeys.wordWrap];
        }

        /**
         * 文本类型
         */
        public set type(value: TextFieldType) {
            this.$setType(value);
        }
        public get type(): TextFieldType {
            return this.$getType();
        }

        public $setType(value: TextFieldType): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.type] != value) {
                values[TextKeys.type] = value;
                if (value == TextFieldType.input) {
                    // input 如果没有设置过宽高则设置默认值为 100, 30
                    if (isNaN(values[TextKeys.textFieldWidth])) {
                        this.$setWidth(100);
                    }
                    if (isNaN(values[TextKeys.textFieldHeight])) {
                        this.$setHeight(30);
                    }
                    this.$setTouchEnabled(true);
                    // 创建输入文本
                    if (this._inputController == null) {
                        this._inputController = new input.InputController();
                    }
                    this._inputController.init(this);
                    this.$invalidateTextField();
                    if (this._stage) {
                        this._inputController.addStageText();
                    }
                }
                else {
                    if (this._inputController) {
                        this._inputController.removeStageText();
                        this._inputController = null;
                    }
                    this.$setTouchEnabled(false);
                }
                return true;
            }
            return false;
        }

        public $getType(): TextFieldType {
            return this.$propertyMap[TextKeys.type];
        }

        /**
         * 弹出键盘的类型
         */
        public set inputType(value: string) {
            this.$setInputType(value);
        }
        public get inputType(): string {
            return this.$getInputType();
        }

        public $setInputType(value: string): boolean {
            if (this.$propertyMap[TextKeys.inputType] == value) {
                return false;
            }
            this.$propertyMap[TextKeys.inputType] = value;
            return true;
        }

        public $getInputType(): string {
            return this.$propertyMap[TextKeys.inputType];
        }

        /**
         * 当前文本
         */
        public set text(value: string) {
            this.$setText(value);
        }
        public get text(): string {
            return this.$getText();
        }

        public $setText(value: string): boolean {
            let result = this.$setBaseText(value);
            if (this._inputController) {
                this._inputController.setText(this.$propertyMap[TextKeys.text]);
            }
            return result;
        }

        public $setBaseText(value: string): boolean {
            this._isFlow = false;
            let values = this.$propertyMap;
            if (values[TextKeys.text] != value) {
                this.$invalidateTextField();
                values[TextKeys.text] = value;
                let text = "";
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

        public $getText(): string {
            if (this.$propertyMap[TextKeys.type] == TextFieldType.input) {
                return this._inputController.getText();
            }
            return this.$propertyMap[TextKeys.text];
        }

        /**
         * 否是密码文本
         */
        public set displayAsPassword(value: boolean) {
            this.$setDisplayAsPassword(value);
        }
        public get displayAsPassword(): boolean {
            return this.$getDisplayAsPassword();
        }

        public $setDisplayAsPassword(value: boolean): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.displayAsPassword] != value) {
                values[TextKeys.displayAsPassword] = value;
                this.$invalidateTextField();
                let text = "";
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

        public $getDisplayAsPassword(): boolean {
            return this.$propertyMap[TextKeys.displayAsPassword];
        }

        /**
         * 描边颜色
         */
        public set strokeColor(value: number) {
            this.$setStrokeColor(value);
        }
        public get strokeColor(): number {
            return this.$getStrokeColor();
        }

        public $setStrokeColor(value: number): boolean {
            let values = this.$propertyMap;
            if (values[TextKeys.strokeColor] != value) {
                this.$invalidateTextField();
                values[TextKeys.strokeColor] = value;
                values[TextKeys.strokeColorString] = toColorString(value);
                return true;
            }
            return false;
        }

        public $getStrokeColor(): number {
            return this.$propertyMap[TextKeys.strokeColor];
        }

        /**
         * 描边宽度, 0 为没有描边
         */
        public set stroke(value: number) {
            this.$setStroke(value);
        }
        public get stroke(): number {
            return this.$getStroke();
        }

        public $setStroke(value: number): boolean {
            if (this.$propertyMap[TextKeys.stroke] != value) {
                this.$invalidateTextField();
                this.$propertyMap[TextKeys.stroke] = value;
                return true;
            }
            return false;
        }

        public $getStroke(): number {
            return this.$propertyMap[TextKeys.stroke];
        }

        /**
         * 文本字段中最多可输入的字符数
         */
        public set maxChars(value: number) {
            this.$setMaxChars(value);
        }
        public get maxChars(): number {
            return this.$getMaxChars();
        }

        public $setMaxChars(value: number): boolean {
            if (this.$propertyMap[TextKeys.maxChars] != value) {
                this.$propertyMap[TextKeys.maxChars] = value;
                return true;
            }
            return false;
        }

        public $getMaxChars(): number {
            return this.$propertyMap[TextKeys.maxChars];
        }

        /**
         * 文本在文本字段中的垂直位置, 单位行
         */
        public set scrollV(value: number) {
            this.$setScrollV(value);
        }
        public get scrollV(): number {
            return this.$getScrollV();
        }

        public $setScrollV(value: number): boolean {
            value = Math.max(value, 1);
            if (value == this.$propertyMap[TextKeys.scrollV]) {
                return false;
            }
            this.$propertyMap[TextKeys.scrollV] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getScrollV(): number {
            return Math.min(Math.max(this.$propertyMap[TextKeys.scrollV], 1), this.maxScrollV);
        }

        /**
         * scrollV 的最大值
         */
        public get maxScrollV(): number {
            return this.$getMaxScrollV();
        }

        public $getMaxScrollV(): number {
            this.$getLinesArr();
            return Math.max(this.$propertyMap[TextKeys.numLines] - TextFieldUtil.getScrollNum(this) + 1, 1);
        }

        /**
         * 文本行数
         */
        public get numLines(): number {
            this.$getLinesArr();
            return this.$propertyMap[TextKeys.numLines];
        }

        /**
         * 是否为多行文本
         */
        public set multiline(value: boolean) {
            this.$setMultiline(value);
        }
        public get multiline(): boolean {
            return this.$getMultiline();
        }

        public $setMultiline(value: boolean): boolean {
            if (this.$propertyMap[TextKeys.multiline] == value) {
                return false;
            }
            this.$propertyMap[TextKeys.multiline] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getMultiline(): boolean {
            return this.$propertyMap[TextKeys.multiline];
        }

        /**
         * 表示用户可输入到文本字段中的字符集
         * 如果值为 null, 则可以输入任何字符
         * 如果值为空字符串, 则不能输入任何字符
         * 如果值为一串字符, 则只能在文本字段中输入该字符串中的字符, 可以使用连字符 (-) 指定一个范围
         * 如果字符串以尖号 (^) 开头, 表示后面的字符都不能输入
         */
        public set restrict(value: string) {
            this.$setRestrict(value);
        }
        public get restrict(): string {
            return this.$getRestrict();
        }

        public $setRestrict(value: string): boolean {
            let values = this.$propertyMap;
            if (value == null) {
                values[TextKeys.restrictAnd] = null;
                values[TextKeys.restrictNot] = null;
                return false;
            }
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
            return true;
        }

        public $getRestrict(): string {
            let values = this.$propertyMap;
            let str: string;
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

        /**
         * 是否有边框
         */
        public set border(value: boolean) {
            this.$setBorder(value);
        }
        public get border(): boolean {
            return this.$getBorder();
        }

        public $setBorder(value: boolean): boolean {
            if (this.$propertyMap[TextKeys.border] == value) {
                return false;
            }
            this.$propertyMap[TextKeys.border] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getBorder(): boolean {
            return this.$propertyMap[TextKeys.border];
        }

        /**
         * 边框的颜色
         */
        public set borderColor(value: number) {
            this.$setBorderColor(value);
        }
        public get borderColor(): number {
            return this.$getBorderColor();
        }

        public $setBorderColor(value: number): boolean {
            if (this.$propertyMap[TextKeys.borderColor] == value) {
                return false;
            }
            this.$propertyMap[TextKeys.borderColor] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getBorderColor(): number {
            return this.$propertyMap[TextKeys.borderColor];
        }

        /**
         * 是否有背景
         */
        public set background(value: boolean) {
            this.$setBackground(value);
        }
        public get background(): boolean {
            return this.$getBackground();
        }

        public $setBackground(value: boolean): boolean {
            if (this.$propertyMap[TextKeys.background] == value) {
                return false;
            }
            this.$propertyMap[TextKeys.background] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getBackground(): boolean {
            return this.$propertyMap[TextKeys.background];
        }

        /**
         * 背景的颜色
         */
        public set backgroundColor(value: number) {
            this.$setBackgroundColor(value);
        }
        public get backgroundColor(): number {
            return this.$getBackgroundColor();
        }

        public $setBackgroundColor(value: number): boolean {
            if (this.$propertyMap[TextKeys.backgroundColor] == value) {
                return false;
            }
            this.$propertyMap[TextKeys.backgroundColor] = value;
            this.$invalidateTextField();
            return true;
        }

        public $getBackgroundColor(): number {
            return this.$propertyMap[TextKeys.backgroundColor];
        }

        /**
         * 设置富文本
         */
        public set textFlow(textArr: ITextElement[]) {
            this.$setTextFlow(textArr);
        }
        public get textFlow(): ITextElement[] {
            return this.$getTextFlow();
        }

        public $setTextFlow(textArr: ITextElement[]): boolean {
            this._isFlow = true;
            let text = "";
            if (textArr == null) {
                textArr = [];
            }
            for (let i = 0; i < textArr.length; i++) {
                let element = textArr[i];
                text += element.text;
            }
            if (this.$propertyMap[TextKeys.displayAsPassword]) {
                this.$setBaseText(text);
            }
            else {
                this.$propertyMap[TextKeys.text] = text;
                this.setMiddleStyle(textArr);
            }
            return true;
        }

        public $getTextFlow(): ITextElement[] {
            return this._textArr;
        }

        /**
         * 获取文本测量宽度
         */
        public get textWidth(): number {
            this.$getLinesArr();
            return this.$propertyMap[TextKeys.textWidth];
        }

        /**
         * 获取文本测量高度
         */
        public get textHeight(): number {
            this.$getLinesArr();
            return TextFieldUtil.getTextHeight(this);
        }

        public $setWidth(value: number): boolean {
            let values = this.$propertyMap;
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

        public $getWidth(): number {
            let values = this.$propertyMap;
            return isNaN(values[TextKeys.textFieldWidth]) ? this.$getContentBounds().width : values[TextKeys.textFieldWidth];
        }

        public $setHeight(value: number): boolean {
            let values = this.$propertyMap;
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

        public $getHeight(): number {
            let values = this.$propertyMap;
            return isNaN(values[TextKeys.textFieldHeight]) ? this.$getContentBounds().height : values[TextKeys.textFieldHeight];
        }

        public $getLineHeight(): number {
            return this.$propertyMap[TextKeys.lineSpacing] + this.$propertyMap[TextKeys.fontSize];
        }

        private invalidateFontString(): void {
            this.$propertyMap[TextKeys.fontStringChanged] = true;
            this.$invalidateTextField();
        }

        public $invalidateTextField(): void {
            this.$renderDirty = true;
            this.$propertyMap[TextKeys.textLinesChanged] = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        public $getRenderBounds(): dou.Recyclable<Rectangle> {
            let bounds = this.$getContentBounds();
            let tmpBounds = dou.recyclable(Rectangle);
            tmpBounds.copy(bounds);
            if (this.$propertyMap[TextKeys.border]) {
                tmpBounds.width += 2;
                tmpBounds.height += 2;
            }
            let _strokeDouble = this.$propertyMap[TextKeys.stroke] * 2;
            if (_strokeDouble > 0) {
                tmpBounds.width += _strokeDouble * 2;
                tmpBounds.height += _strokeDouble * 2;
            }
            // 宽度增加一点, 为了解决 webgl 纹理太小导致裁切问题
            tmpBounds.x -= _strokeDouble + 2;
            tmpBounds.y -= _strokeDouble + 2;
            tmpBounds.width = Math.ceil(tmpBounds.width) + 4;
            tmpBounds.height = Math.ceil(tmpBounds.height) + 4;
            return tmpBounds;
        }

        private changeToPassText(text: string): string {
            if (this.$propertyMap[TextKeys.displayAsPassword]) {
                let passText: string = "";
                for (let i: number = 0, num = text.length; i < num; i++) {
                    switch (text.charAt(i)) {
                        case "\n":
                            passText += "\n";
                            break;
                        case "\r":
                            break;
                        default:
                            passText += "*";
                    }
                }
                return passText;
            }
            return text;
        }

        private setMiddleStyle(textArr: ITextElement[]): void {
            this.$propertyMap[TextKeys.textLinesChanged] = true;
            this._textArr = textArr;
            this.$invalidateTextField();
        }

        /**
         * 输入文本自动进入到输入状态，仅在类型是输入文本并且是在用户交互下才可以调用
         */
        public setFocus(): void {
            if (this.type == TextFieldType.input && this._stage) {
                this._inputController.onFocus();
            }
        }

        /**
         * 添加一段文本
         */
        public appendText(text: string): void {
            this.appendElement(<ITextElement>{ text: text });
        }

        /**
         * 添加一段带样式的文本
         */
        public appendElement(element: ITextElement): void {
            let text = this.$propertyMap[TextKeys.text] + element.text;
            if (this.$propertyMap[TextKeys.displayAsPassword]) {
                this.$setBaseText(text);
            }
            else {
                this.$propertyMap[TextKeys.text] = text;
                this._textArr.push(element);
                this.setMiddleStyle(this._textArr);
            }
        }

        public $getLinesArr(): ILineElement[] {
            let values = this.$propertyMap;
            if (!values[TextKeys.textLinesChanged]) {
                return this._linesArr;
            }
            values[TextKeys.textLinesChanged] = false;
            let text2Arr = this._textArr;
            this._linesArr.length = 0;
            values[TextKeys.textHeight] = 0;
            values[TextKeys.textWidth] = 0;
            let textFieldWidth: number = values[TextKeys.textFieldWidth];
            // 宽度被设置为 0
            if (!isNaN(textFieldWidth) && textFieldWidth == 0) {
                values[TextKeys.numLines] = 0;
                return [{ width: 0, height: 0, charNum: 0, elements: [], hasNextLine: false }];
            }
            let linesArr = this._linesArr;
            let lineW = 0;
            let lineCharNum = 0;
            let lineH = 0;
            let lineCount = 0;
            let lineElement: ILineElement;
            for (let i = 0, text2ArrLength = text2Arr.length; i < text2ArrLength; i++) {
                let element = text2Arr[i];
                // 可能设置为没有文本, 忽略绘制
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
                let text = element.text.toString();
                let textArr = text.split(/(?:\r\n|\r|\n)/);
                for (let j = 0, textArrLength = textArr.length; j < textArrLength; j++) {
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
                    let isNextLine = true;
                    if (textArr[j] == "") {
                        if (j == textArrLength - 1) {
                            isNextLine = false;
                        }
                    }
                    else {
                        let w: number = HtmlUtil.measureTextByStyle(textArr[j], values, element.style);
                        // 没有设置过宽
                        if (isNaN(textFieldWidth)) {
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
                            // 在设置范围内
                            if (lineW + w <= textFieldWidth) {
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
                                let k = 0;
                                let ww = 0;
                                let word = textArr[j];
                                let words: string[];
                                if (values[TextKeys.wordWrap]) {
                                    words = word.split(SplitRegex);
                                }
                                else {
                                    words = word.match(/./g);
                                }
                                let wl = words.length;
                                let charNum = 0;
                                for (; k < wl; k++) {
                                    let codeLen = words[k].length;
                                    let has4BytesUnicode = false;
                                    if (codeLen == 1 && k < wl - 1) {
                                        let charCodeHigh = words[k].charCodeAt(0);
                                        let charCodeLow = words[k + 1].charCodeAt(0);
                                        if (charCodeHigh >= 0xD800 && charCodeHigh <= 0xDBFF && (charCodeLow & 0xFC00) == 0xDC00) {
                                            let realWord = words[k] + words[k + 1];
                                            codeLen = 2;
                                            has4BytesUnicode = true;
                                            w = HtmlUtil.measureTextByStyle(realWord, values, element.style);
                                        }
                                        else {
                                            w = HtmlUtil.measureTextByStyle(words[k], values, element.style);
                                        }
                                    }
                                    else {
                                        w = HtmlUtil.measureTextByStyle(words[k], values, element.style);
                                    }
                                    if (lineW != 0 && lineW + w > textFieldWidth && lineW + k != 0) {
                                        break;
                                    }
                                    if (ww + w > textFieldWidth) {
                                        let words2 = words[k].match(/./g);
                                        for (let k2 = 0, wl2 = words2.length; k2 < wl2; k2++) {
                                            let codeLen = words2[k2].length;
                                            let has4BytesUnicode2 = false;
                                            if (codeLen == 1 && k2 < wl2 - 1) {
                                                let charCodeHigh = words2[k2].charCodeAt(0);
                                                let charCodeLow = words2[k2 + 1].charCodeAt(0);
                                                if (charCodeHigh >= 0xD800 && charCodeHigh <= 0xDBFF && (charCodeLow & 0xFC00) == 0xDC00) {
                                                    let realWord = words2[k2] + words2[k2 + 1];
                                                    codeLen = 2;
                                                    has4BytesUnicode2 = true;
                                                    w = HtmlUtil.measureTextByStyle(realWord, values, element.style);
                                                }
                                                else {
                                                    w = HtmlUtil.measureTextByStyle(words2[k2], values, element.style);
                                                }
                                            }
                                            else {
                                                w = HtmlUtil.measureTextByStyle(words2[k2], values, element.style);
                                            }
                                            if (k2 > 0 && lineW + w > textFieldWidth) {
                                                break;
                                            }
                                            charNum += codeLen;
                                            ww += w;
                                            lineW += w;
                                            lineCharNum += charNum;
                                            if (has4BytesUnicode2) {
                                                k2++;
                                            }
                                        }
                                    }
                                    else {
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
                                    let leftWord = word.substring(charNum);
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
                    // 非最后一个
                    if (j < textArr.length - 1) {
                        lineElement.width = lineW;
                        lineElement.height = lineH;
                        lineElement.charNum = lineCharNum;
                        values[TextKeys.textWidth] = Math.max(values[TextKeys.textWidth], lineW);
                        values[TextKeys.textHeight] += lineH;
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

        public $setIsTyping(value: boolean): void {
            this._isTyping = value;
            this.$invalidateTextField();
        }

        public $setTouchEnabled(value: boolean): void {
            super.$setTouchEnabled(value);
            if (this.isInput()) {
                this.$inputEnabled = true;
            }
        }

        private isInput(): boolean {
            return this.$propertyMap[TextKeys.type] == TextFieldType.input;
        }

        public $onAddToStage(stage: Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);
            this.addEvent();
            if (this.$propertyMap[TextKeys.type] == TextFieldType.input) {
                this._inputController.addStageText();
            }
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            this.removeEvent();
            if (this.$propertyMap[TextKeys.type] == TextFieldType.input) {
                this._inputController.removeStageText();
            }
            if (this._textNode) {
                this._textNode.clean();
            }
        }

        private addEvent(): void {
            this.on(TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        }

        private removeEvent(): void {
            this.off(TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        }

        private onTapHandler(e: TouchEvent): void {
            if (this.$propertyMap[TextKeys.type] == TextFieldType.input) {
                return;
            }
            let ele = TextFieldUtil.getTextElement(this, e.localX, e.localY);
            if (!ele) {
                return;
            }
            let style: ITextStyle = ele.style;
            if (style && style.href) {
                if (style.href.match(/^event:/)) {
                    let type = style.href.match(/^event:/)[0];
                    this.dispatchEvent2D(Event2D.LINK, style.href.substring(type.length));
                }
                else {
                    open(style.href, style.target || "_blank");
                }
            }
        }

        public $measureContentBounds(bounds: Rectangle): void {
            this.$getLinesArr();
            let w = 0;
            let h = 0;
            w = !isNaN(this.$propertyMap[TextKeys.textFieldWidth]) ? this.$propertyMap[TextKeys.textFieldWidth] : this.$propertyMap[TextKeys.textWidth];
            h = !isNaN(this.$propertyMap[TextKeys.textFieldHeight]) ? this.$propertyMap[TextKeys.textFieldHeight] : TextFieldUtil.getTextHeight(this);
            bounds.set(0, 0, w, h);
        }

        public $updateRenderNode(): void {
            if (this.$propertyMap[TextKeys.type] == TextFieldType.input) {
                this._inputController.updateProperties();
                if (this._isTyping) {
                    this.fillBackground();
                    return;
                }
            }
            else if (this.$propertyMap[TextKeys.textFieldWidth] == 0) {
                let graphics = this._graphicsNode;
                if (graphics) {
                    graphics.clear();
                }
                return;
            }
            let underLines = this.drawText();
            this.fillBackground(underLines);
            let bounds = this.$getRenderBounds();
            let node = this._textNode;
            node.x = bounds.x;
            node.y = bounds.y;
            node.width = Math.ceil(bounds.width);
            node.height = Math.ceil(bounds.height);
            bounds.recycle();
        }

        private fillBackground(lines?: number[]): void {
            let graphics = this._graphicsNode;
            if (graphics) {
                graphics.clear();
            }
            let values = this.$propertyMap;
            if (values[TextKeys.background] || values[TextKeys.border] || (lines && lines.length > 0)) {
                if (!graphics) {
                    graphics = this._graphicsNode = new GraphicsNode();
                    let groupNode = new GroupNode();
                    groupNode.addNode(graphics);
                    groupNode.addNode(this._textNode);
                    this.$renderNode = groupNode;
                }
                let fillPath: Path2D;
                let strokePath: Path2D;
                // 渲染背景
                if (values[TextKeys.background]) {
                    fillPath = graphics.beginFill(values[TextKeys.backgroundColor]);
                    fillPath.drawRect(0, 0, this.$getWidth(), this.$getHeight());
                }
                // 渲染边框
                if (values[TextKeys.border]) {
                    strokePath = graphics.lineStyle(1, values[TextKeys.borderColor]);
                    // 1 像素和 3 像素线条宽度的情况, 会向右下角偏移 0.5 像素绘制, 少画一像素宽度, 正好能不超出文本测量边界
                    strokePath.drawRect(0, 0, this.$getWidth() - 1, this.$getHeight() - 1);
                }
                // 渲染下划线
                if (lines && lines.length > 0) {
                    let textColor = values[TextKeys.textColor];
                    let lastColor = -1;
                    let length = lines.length;
                    for (let i = 0; i < length; i += 4) {
                        let x = lines[i];
                        let y = lines[i + 1];
                        let w = lines[i + 2];
                        let color = lines[i + 3] || textColor;
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
         * 返回要绘制的下划线列表
         */
        private drawText(): number[] {
            let node = this._textNode;
            let values = this.$propertyMap;
            // 更新文本样式
            node.bold = values[TextKeys.bold];
            node.fontFamily = values[TextKeys.fontFamily] || TextField.default_fontFamily;
            node.italic = values[TextKeys.italic];
            node.size = values[TextKeys.fontSize];
            node.stroke = values[TextKeys.stroke];
            node.strokeColor = values[TextKeys.strokeColor];
            node.textColor = values[TextKeys.textColor];
            // 先算出需要的数值
            let lines = this.$getLinesArr();
            if (values[TextKeys.textWidth] == 0) {
                return [];
            }
            let maxWidth = !isNaN(values[TextKeys.textFieldWidth]) ? values[TextKeys.textFieldWidth] : values[TextKeys.textWidth];
            let textHeight = TextFieldUtil.getTextHeight(this);
            let drawY = 0;
            let startLine = TextFieldUtil.getStartLine(this);
            let textFieldHeight = values[TextKeys.textFieldHeight];
            if (!isNaN(textFieldHeight) && textFieldHeight > textHeight) {
                let vAlign = TextFieldUtil.getValign(this);
                drawY += vAlign * (textFieldHeight - textHeight);
            }
            drawY = Math.round(drawY);
            let hAlign = TextFieldUtil.getHalign(this);
            let drawX = 0;
            let underLineData: number[] = [];
            for (let i = startLine, numLinesLength = values[TextKeys.numLines]; i < numLinesLength; i++) {
                let line = lines[i];
                let h = line.height;
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
                for (let j = 0, elementsLength = line.elements.length; j < elementsLength; j++) {
                    let element: IWTextElement = line.elements[j];
                    let size = element.style.size || values[TextKeys.fontSize];
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
    }
}
