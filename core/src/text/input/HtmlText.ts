namespace dou2d {
    /**
     * 
     * @author wizardc
     */
    export class HtmlText {

        /**
         * @private
         */
        private htmlInput: web.HTMLInput;

        /**
         * @private
         */
        constructor() {
            super();

        }

        /**
         * @private
         */
        $textfield: TextField;
        /**
         * @private
         * 
         * @param textfield 
         */
        $setTextField(textfield: TextField): boolean {
            this.$textfield = textfield;

            return true;
        }

        /**
         * @private
         */
        private _isNeedShow: boolean = false;
        /**
         * @private
         */
        private inputElement: any = null;
        /**
         * @private
         */
        private inputDiv: any = null;

        /**
         * @private
         */
        private _gscaleX: number = 0;
        /**
         * @private
         */
        private _gscaleY: number = 0;

        /**
         * @private
         * 
         */
        $addToStage(): void {
            this.htmlInput = web.$getTextAdapter(this.$textfield);
        }

        /**
         * @private
         * 
         */
        private _initElement(): void {
            let point = this.$textfield.localToGlobal(0, 0);
            let x = point.x;
            let y = point.y;
            // let m = this.$textfield.$renderNode.renderMatrix;
            // let cX = m.a;
            // let cY = m.d;

            let scaleX = this.htmlInput.$scaleX;
            let scaleY = this.htmlInput.$scaleY;

            this.inputDiv.style.left = x * scaleX + "px";
            this.inputDiv.style.top = y * scaleY + "px";

            if (this.$textfield.multiline && this.$textfield.height > this.$textfield.size) {
                this.inputDiv.style.top = (y) * scaleY + "px";

                this.inputElement.style.top = (-this.$textfield.lineSpacing / 2) * scaleY + "px";
            }
            else {
                this.inputDiv.style.top = y * scaleY + "px";

                this.inputElement.style.top = 0 + "px";
            }

            let node: any = this.$textfield;
            let cX = 1;
            let cY = 1;
            let rotation = 0;
            while (node.parent) {
                cX *= node.scaleX;
                cY *= node.scaleY;
                rotation += node.rotation;

                node = node.parent;
            }

            let transformKey = web.getPrefixStyleName("transform");
            this.inputDiv.style[transformKey] = "rotate(" + rotation + "deg)";

            this._gscaleX = scaleX * cX;
            this._gscaleY = scaleY * cY;
        }

        /**
         * @private
         * 
         */
        $show(): void {
            if (!this.htmlInput.isCurrentStageText(this)) {
                this.inputElement = this.htmlInput.getInputElement(this);
                if (!this.$textfield.multiline) {
                    this.inputElement.type = this.$textfield.inputType;
                }
                else {
                    this.inputElement.type = "text";
                }
                this.inputDiv = this.htmlInput._inputDIV;
            }
            else {
                this.inputElement.onblur = null;
            }

            this.htmlInput._needShow = true;

            //标记当前文本被选中
            this._isNeedShow = true;

            this._initElement();
        }

        /**
         * @private
         * 
         */
        private onBlurHandler(): void {
            this.htmlInput.clearInputElement();
            window.scrollTo(0, 0);
        }

        /**
         * @private
         * 
         */
        private onFocusHandler(): void {
            //the soft keyboard will cover the input box in some cases
            let self = this;
            window.setTimeout(function () {
                if (self.inputElement) {
                    self.inputElement.scrollIntoView();
                }
            }, 200);
        }

        /**
         * @private
         * 
         */
        private executeShow(): void {
            let self = this;
            //打开
            this.inputElement.value = this.$getText();

            if (this.inputElement.onblur == null) {
                this.inputElement.onblur = this.onBlurHandler.bind(this);
            }
            if (this.inputElement.onfocus == null) {
                this.inputElement.onfocus = this.onFocusHandler.bind(this);
            }

            this.$resetStageText();

            if (this.$textfield.maxChars > 0) {
                this.inputElement.setAttribute("maxlength", this.$textfield.maxChars);
            }
            else {
                this.inputElement.removeAttribute("maxlength");
            }

            this.inputElement.selectionStart = this.inputElement.value.length;
            this.inputElement.selectionEnd = this.inputElement.value.length;
            this.inputElement.focus();
        }

        /**
         * @private
         */
        $hide(): void {
            if (this.htmlInput) {
                this.htmlInput.disconnectStageText(this);
            }
        }

        /**
         * @private
         */
        private textValue: string = "";

        /**
         * @private
         * 
         * @returns 
         */
        $getText(): string {
            if (!this.textValue) {
                this.textValue = "";
            }
            return this.textValue;
        }

        /**
         * @private
         * 
         * @param value 
         */
        $setText(value: string): boolean {
            this.textValue = value;

            this.resetText();

            return true;
        }
        /**
         * @private
         * 
         */
        private resetText(): void {
            if (this.inputElement) {
                this.inputElement.value = this.textValue;
            }
        }
        /**
         * @private
         */
        private colorValue: number = 0xffffff;
        $setColor(value: number): boolean {
            this.colorValue = value;
            this.resetColor();
            return true;
        }
        /**
         * @private
         *
         */
        private resetColor(): void {
            if (this.inputElement) {
                this.setElementStyle("color", toColorString(this.colorValue));
            }
        }


        $onBlur(): void {

        }

        /**
         * @private
         * 
         */
        public _onInput(): void {
            let self = this;

            window.setTimeout(function () {
                if (self.inputElement && self.inputElement.selectionStart == self.inputElement.selectionEnd) {
                    self.textValue = self.inputElement.value;

                    Event.dispatchEvent(self, "updateText", false);
                }
            }, 0);
        }

        private setAreaHeight() {
            let textfield: TextField = this.$textfield;
            if (textfield.multiline) {
                let textheight = TextFieldUtils.$getTextHeight(textfield);
                if (textfield.height <= textfield.size) {
                    this.setElementStyle("height", (textfield.size) * this._gscaleY + "px");

                    this.setElementStyle("padding", "0px");
                    this.setElementStyle("lineHeight", (textfield.size) * this._gscaleY + "px");
                }
                else if (textfield.height < textheight) {
                    this.setElementStyle("height", (textfield.height) * this._gscaleY + "px");

                    this.setElementStyle("padding", "0px");
                    this.setElementStyle("lineHeight", (textfield.size + textfield.lineSpacing) * this._gscaleY + "px");
                }
                else {
                    this.setElementStyle("height", (textheight + textfield.lineSpacing) * this._gscaleY + "px");

                    let rap = (textfield.height - textheight) * this._gscaleY;
                    let valign: number = TextFieldUtils.$getValign(textfield);
                    let top = rap * valign;
                    let bottom = rap - top;
                    this.setElementStyle("padding", top + "px 0px " + bottom + "px 0px");
                    this.setElementStyle("lineHeight", (textfield.size + textfield.lineSpacing) * this._gscaleY + "px");
                }

            }
        }

        /**
         * @private
         * 
         * @param e 
         */
        public _onClickHandler(e): void {
            if (this._isNeedShow) {
                e.stopImmediatePropagation();
                //e.preventDefault();
                this._isNeedShow = false;

                this.executeShow();

                this.dispatchEvent(new Event("focus"));
            }
        }

        /**
         * @private
         * 
         */
        public _onDisconnect(): void {
            this.inputElement = null;

            this.dispatchEvent(new Event("blur"));
        }

        /**
         * @private
         */
        private _styleInfoes: Object = {};

        /**
         * @private
         * 
         * @param style 
         * @param value 
         */
        private setElementStyle(style: string, value: any): void {
            if (this.inputElement) {
                if (this._styleInfoes[style] != value) {
                    this.inputElement.style[style] = value;
                    //this._styleInfoes[style] = value;
                }
            }
        }

        /**
         * @private
         * 
         */
        $removeFromStage(): void {
            if (this.inputElement) {
                this.htmlInput.disconnectStageText(this);
            }
        }

        /**
         * 修改位置
         * @private
         */
        $resetStageText(): void {
            if (this.inputElement) {
                let textfield: TextField = this.$textfield;
                this.setElementStyle("fontFamily", textfield.fontFamily);
                this.setElementStyle("fontStyle", textfield.italic ? "italic" : "normal");
                this.setElementStyle("fontWeight", textfield.bold ? "bold" : "normal");
                this.setElementStyle("textAlign", textfield.textAlign);
                this.setElementStyle("fontSize", textfield.size * this._gscaleY + "px");
                this.setElementStyle("color", toColorString(textfield.textColor));

                let tw: number;
                if (textfield.stage) {
                    tw = textfield.localToGlobal(0, 0).x;
                    tw = Math.min(textfield.width, textfield.stage.stageWidth - tw);
                }
                else {
                    tw = textfield.width
                }

                this.setElementStyle("width", tw * this._gscaleX + "px");

                this.setElementStyle("verticalAlign", textfield.verticalAlign);
                if (textfield.multiline) {
                    this.setAreaHeight();
                }
                else {
                    this.setElementStyle("lineHeight", (textfield.size) * this._gscaleY + "px");
                    if (textfield.height < textfield.size) {
                        this.setElementStyle("height", (textfield.size) * this._gscaleY + "px");

                        let bottom = (textfield.size / 2) * this._gscaleY;
                        this.setElementStyle("padding", "0px 0px " + bottom + "px 0px");
                    }
                    else {
                        this.setElementStyle("height", (textfield.size) * this._gscaleY + "px");
                        let rap = (textfield.height - textfield.size) * this._gscaleY;
                        let valign = TextFieldUtils.$getValign(textfield);
                        let top = rap * valign;
                        let bottom = rap - top;
                        if (bottom < textfield.size / 2 * this._gscaleY) {
                            bottom = textfield.size / 2 * this._gscaleY;
                        }
                        this.setElementStyle("padding", top + "px 0px " + bottom + "px 0px");
                    }
                }

                this.inputDiv.style.clip = "rect(0px " + (textfield.width * this._gscaleX) + "px " + (textfield.height * this._gscaleY) + "px 0px)";
                this.inputDiv.style.height = textfield.height * this._gscaleY + "px";
                this.inputDiv.style.width = tw * this._gscaleX + "px";
            }
        }
    }
}
