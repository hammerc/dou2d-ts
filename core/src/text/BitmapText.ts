namespace dou2d {
    /**
     * 位图文本
     * @author wizardc
     */
    export class BitmapText extends DisplayObject {
        /**
         * 一个空格字符的宽度比例, 这个数值乘以第一个字符的高度即为空格字符的宽
         */
        public static EMPTY_FACTOR: number = 0.33;

        protected _text: string = "";
        protected _textLinesChanged: boolean;
        protected _textFieldWidth: number;
        protected _textFieldHeight: number;

        protected _font: BitmapFont;
        protected _fontStringChanged: boolean;

        protected _smoothing: boolean = Bitmap.defaultSmoothing;

        protected _lineSpacing: number = 0;
        protected _letterSpacing: number = 0;

        protected _textAlign: HorizontalAlign = HorizontalAlign.left;
        protected _verticalAlign: VerticalAlign = VerticalAlign.top;

        protected _textWidth: number;
        protected _textHeight: number;

        protected _textOffsetX: number = 0;
        protected _textOffsetY: number = 0;
        protected _textStartX: number = 0;
        protected _textStartY: number = 0;
        protected _textLines: string[];
        protected _textLinesWidth: number[];
        protected _lineHeights: number[];

        public constructor() {
            super();
            this.$renderNode = new rendering.BitmapNode();
            this._textLines = [];
            this._lineHeights = [];
        }

        /**
         * 要显示的文本内容
         */
        public set text(value: string) {
            this.$setText(value);
        }
        public get text(): string {
            return this.$getText();
        }

        public $setText(value: string): boolean {
            if (value == null) {
                value = "";
            }
            else {
                value = String(value);
            }
            if (value == this._text) {
                return false;
            }
            this._text = value;
            this.$invalidateContentBounds();
            return true;
        }

        public $getText(): string {
            return this._text;
        }

        /**
         * 位图字体
         */
        public set font(value: BitmapFont) {
            this.$setFont(value);
        }
        public get font(): BitmapFont {
            return this.$getFont();
        }

        public $setFont(value: BitmapFont): boolean {
            if (this._font == value) {
                return false;
            }
            this._font = value;
            this._fontStringChanged = true;
            this.$invalidateContentBounds();
            return true;
        }

        public $getFont(): BitmapFont {
            return this._font;
        }

        /**
         * 控制在缩放时是否进行平滑处理
         */
        public set smoothing(value: boolean) {
            this.$setSmoothing(value);
        }
        public get smoothing(): boolean {
            return this.$getSmoothing();
        }

        public $setSmoothing(value: boolean): void {
            if (value == this._smoothing) {
                return;
            }
            this._smoothing = value;
            let p = this.parent;
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

        public $getSmoothing(): boolean {
            return this._smoothing;
        }

        /**
         * 一个整数, 表示行与行之间的垂直间距量
         */
        public set lineSpacing(value: number) {
            this.$setLineSpacing(value);
        }
        public get lineSpacing(): number {
            return this.$getLineSpacing();
        }

        public $setLineSpacing(value: number): boolean {
            if (this._lineSpacing == value) {
                return false;
            }
            this._lineSpacing = value;
            this.$invalidateContentBounds();
            return true;
        }

        public $getLineSpacing(): number {
            return this._lineSpacing;
        }

        /**
         * 一个整数, 表示字符之间的距离
         */
        public set letterSpacing(value: number) {
            this.$setLetterSpacing(value);
        }
        public get letterSpacing(): number {
            return this.$getLetterSpacing();
        }

        public $setLetterSpacing(value: number): boolean {
            if (this._letterSpacing == value) {
                return false;
            }
            this._letterSpacing = value;
            this.$invalidateContentBounds();
            return true;
        }

        public $getLetterSpacing(): number {
            return this._letterSpacing;
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
            if (this._textAlign == value) {
                return false;
            }
            this._textAlign = value;
            this.$invalidateContentBounds();
            return true;
        }

        public $getTextAlign(): HorizontalAlign {
            return this._textAlign;
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
            if (this._verticalAlign == value) {
                return false;
            }
            this._verticalAlign = value;
            this.$invalidateContentBounds();
            return true;
        }

        public $getVerticalAlign(): VerticalAlign {
            return this._verticalAlign;
        }

        /**
         * 获取位图文本测量宽度
         */
        public get textWidth(): number {
            this.$getTextLines();
            return this._textWidth;
        }

        /**
         * 获取位图文本测量高度
         */
        public get textHeight(): number {
            this.$getTextLines();
            return this._textHeight;
        }

        public $setWidth(value: number): boolean {
            if (value < 0 || value == this._textFieldWidth) {
                return false;
            }
            this._textFieldWidth = value;
            this.$invalidateContentBounds();
            return true;
        }

        public $getWidth(): number {
            let w = this._textFieldWidth;
            return isNaN(w) ? this.$getContentBounds().width : w;
        }

        public $setHeight(value: number): boolean {
            if (value < 0 || value == this._textFieldHeight) {
                return false;
            }
            this._textFieldHeight = value;
            this.$invalidateContentBounds();
            return true;
        }

        public $getHeight(): number {
            let h = this._textFieldHeight;
            return isNaN(h) ? this.$getContentBounds().height : h;
        }

        public $invalidateContentBounds(): void {
            this.$renderDirty = true;
            this._textLinesChanged = true;
            this.$updateRenderNode();
        }

        public $measureContentBounds(bounds: Rectangle): void {
            let lines = this.$getTextLines();
            if (lines.length == 0) {
                bounds.clear();
            }
            else {
                bounds.set(this._textOffsetX + this._textStartX, this._textOffsetY + this._textStartY, this._textWidth - this._textOffsetX, this._textHeight - this._textOffsetY);
            }
        }

        public $updateRenderNode(): void {
            let textLines = this.$getTextLines();
            let length = textLines.length;
            if (length == 0) {
                return;
            }
            let textLinesWidth = this._textLinesWidth;
            let bitmapFont = this._font;
            let node = <rendering.BitmapNode>this.$renderNode;
            if (bitmapFont.texture) {
                node.image = bitmapFont.texture.bitmapData;
            }
            node.smoothing = this._smoothing;
            let emptyHeight = bitmapFont.getFirstCharHeight();
            let emptyWidth = Math.ceil(emptyHeight * BitmapText.EMPTY_FACTOR);
            let hasSetHeight = !isNaN(this._textFieldHeight);
            let textWidth = this._textWidth;
            let textFieldWidth = this._textFieldWidth;
            let textFieldHeight = this._textFieldHeight;
            let align = this._textAlign;
            let yPos = this._textOffsetY + this._textStartY;
            let lineHeights = this._lineHeights;
            for (let i = 0; i < length; i++) {
                let lineHeight = lineHeights[i];
                if (hasSetHeight && i > 0 && yPos + lineHeight > textFieldHeight) {
                    break;
                }
                let line = textLines[i];
                let len = line.length;
                let xPos = this._textOffsetX;
                if (align != HorizontalAlign.left) {
                    let countWidth = textFieldWidth > textWidth ? textFieldWidth : textWidth;
                    if (align == HorizontalAlign.right) {
                        xPos += countWidth - textLinesWidth[i];
                    } else if (align == HorizontalAlign.center) {
                        xPos += Math.floor((countWidth - textLinesWidth[i]) / 2);
                    }
                }
                for (let j = 0; j < len; j++) {
                    let character = line.charAt(j);
                    let texture = bitmapFont.getTexture(character);
                    if (!texture) {
                        if (character == " ") {
                            xPos += emptyWidth;
                        }
                        else {
                            console.warn(`BitmapText no corresponding characters: ${character}, please check the configuration file.`);
                        }
                        continue;
                    }
                    let bitmapWidth = texture.bitmapWidth;
                    let bitmapHeight = texture.bitmapHeight;
                    node.imageWidth = texture.sourceWidth;
                    node.imageHeight = texture.sourceHeight;
                    node.drawImage(texture.bitmapX, texture.bitmapY, bitmapWidth, bitmapHeight, xPos + texture.offsetX, yPos + texture.offsetY, texture.$getScaleBitmapWidth(), texture.$getScaleBitmapHeight());
                    xPos += (bitmapFont.getConfig(character, "xadvance") || texture.$getTextureWidth()) + this._letterSpacing;
                }
                yPos += lineHeight + this._lineSpacing;
            }
        }

        public $getTextLines(): string[] {
            function setLineData(str: string): boolean {
                if (textFieldHeight && textLines.length > 0 && textHeight > textFieldHeight) {
                    return false;
                }
                textHeight += lineHeight + lineSpacing;
                if (!isFirstChar && !isLastChar) {
                    xPos -= letterSpacing;
                }
                textLines.push(str);
                lineHeights.push(lineHeight);
                textLinesWidth.push(xPos);
                textWidth = Math.max(xPos, textWidth);
                return true;
            }
            if (!this._textLinesChanged) {
                return this._textLines;
            }
            let textLines: string[] = [];
            this._textLines = textLines;
            let textLinesWidth: number[] = [];
            this._textLinesWidth = textLinesWidth;
            this._textLinesChanged = false;
            let lineHeights: number[] = [];
            this._lineHeights = lineHeights;
            if (!this._text || !this._font) {
                this._textWidth = 0;
                this._textHeight = 0;
                return textLines;
            }
            let lineSpacing = this._lineSpacing;
            let letterSpacing = this._letterSpacing;
            let textWidth = 0;
            let textHeight = 0;
            let textOffsetX = 0;
            let textOffsetY = 0;
            let hasWidthSet = !isNaN(this._textFieldWidth);
            let textFieldWidth = this._textFieldWidth;
            let textFieldHeight = this._textFieldHeight;
            let bitmapFont = this._font;
            let emptyHeight = bitmapFont.getFirstCharHeight();
            let emptyWidth = Math.ceil(emptyHeight * BitmapText.EMPTY_FACTOR);
            let text = this._text;
            let textArr = text.split(/(?:\r\n|\r|\n)/);
            let length = textArr.length;
            let isFirstLine = true;
            let isFirstChar: boolean;
            let isLastChar: boolean;
            let lineHeight: number;
            let xPos: number;
            for (let i = 0; i < length; i++) {
                let line = textArr[i];
                let len = line.length;
                lineHeight = 0;
                xPos = 0;
                isFirstChar = true;
                isLastChar = false;
                for (let j = 0; j < len; j++) {
                    if (!isFirstChar) {
                        xPos += letterSpacing;
                    }
                    let character = line.charAt(j);
                    let texureWidth: number;
                    let textureHeight: number;
                    let texture = bitmapFont.getTexture(character);
                    if (!texture) {
                        if (character == " ") {
                            texureWidth = emptyWidth;
                            textureHeight = emptyHeight;
                        }
                        else {
                            console.warn(`BitmapText no corresponding characters: ${character}, please check the configuration file.`);
                            if (isFirstChar) {
                                isFirstChar = false;
                            }
                            continue;
                        }
                    }
                    else {
                        texureWidth = texture.$getTextureWidth();
                        textureHeight = texture.$getTextureHeight();
                    }
                    if (isFirstChar) {
                        isFirstChar = false;
                    }
                    if (isFirstLine) {
                        isFirstLine = false;
                    }
                    if (hasWidthSet && j > 0 && xPos + texureWidth > textFieldWidth) {
                        if (!setLineData(line.substring(0, j))) {
                            break;
                        }
                        line = line.substring(j);
                        len = line.length;
                        j = 0;
                        // 最后一个字符要计算纹理宽度, 而不是 xadvance
                        if (j == len - 1) {
                            xPos = texureWidth;
                        }
                        else {
                            xPos = bitmapFont.getConfig(character, "xadvance") || texureWidth;
                        }
                        lineHeight = textureHeight;
                        continue;
                    }
                    // 最后一个字符要计算纹理宽度, 而不是 xadvance
                    if (j == len - 1) {
                        xPos += texureWidth;
                    }
                    else {
                        xPos += bitmapFont.getConfig(character, "xadvance") || texureWidth;
                    }
                    lineHeight = Math.max(textureHeight, lineHeight);
                }
                if (textFieldHeight && i > 0 && textHeight > textFieldHeight) {
                    break;
                }
                isLastChar = true;
                if (!setLineData(line)) {
                    break;
                }
            }
            textHeight -= lineSpacing;
            this._textWidth = textWidth;
            this._textHeight = textHeight;
            this._textOffsetX = textOffsetX;
            this._textOffsetY = textOffsetY;
            this._textStartX = 0;
            this._textStartY = 0;
            let alignType: any;
            if (textFieldWidth > textWidth) {
                alignType = this._textAlign;
                if (alignType == HorizontalAlign.right) {
                    this._textStartX = textFieldWidth - textWidth;
                }
                else if (alignType == HorizontalAlign.center) {
                    this._textStartX = Math.floor((textFieldWidth - textWidth) / 2);
                }
            }
            if (textFieldHeight > textHeight) {
                alignType = this._verticalAlign;
                if (alignType == VerticalAlign.bottom) {
                    this._textStartY = textFieldHeight - textHeight;
                }
                else if (alignType == VerticalAlign.middle) {
                    this._textStartY = Math.floor((textFieldHeight - textHeight) / 2);
                }
            }
            return textLines;
        }
    }
}
