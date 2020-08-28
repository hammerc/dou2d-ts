namespace dou2d.input {
    /**
     * 输入文本
     * @author wizardc
     */
    export class HtmlText extends dou.EventDispatcher {
        public textfield: TextField;

        private _htmlInput: InputManager;

        private _isNeedShow: boolean;
        private _inputElement: HTMLInputElement | HTMLTextAreaElement;
        private _inputDiv: any;

        private _gscaleX: number = 0;
        private _gscaleY: number = 0;

        private _textValue: string = "";
        private _colorValue: number = 0xffffff;
        private _styleInfoes: Object = {};

        public setTextField(textfield: TextField): boolean {
            this.textfield = textfield;
            return true;
        }

        public addToStage(): void {
            this._htmlInput = sys.inputManager;
        }

        public show(active: boolean = true): void {
            if (!this._htmlInput.isCurrentStageText(this)) {
                this._inputElement = this._htmlInput.getInputElement(this);
                if (!this.textfield.multiline) {
                    (<any>this._inputElement).type = this.textfield.inputType;
                }
                else {
                    (<any>this._inputElement).type = "text";
                }
                this._inputDiv = this._htmlInput.inputDIV;
            }
            else {
                this._inputElement.onblur = null;
            }
            this._htmlInput.needShow = true;
            //标记当前文本被选中
            this._isNeedShow = true;
            this.initElement();
            if (active) {
                this.activeShowKeyboard();
            }
        }

        public activeShowKeyboard(): void {
            if (this._htmlInput.needShow) {
                this._isNeedShow = false;
                this.dispatchEvent("focus");
                this.executeShow();
                this._htmlInput.show();
            }
            else {
                this._htmlInput.blurInputElement();
                this._htmlInput.disposeInputElement();
            }
        }

        private initElement(): void {
            let point = this.textfield.localToGlobal(0, 0);
            let x = point.x;
            let y = point.y;
            let scaleX = this._htmlInput.scaleX;
            let scaleY = this._htmlInput.scaleY;
            this._inputDiv.style.left = x * scaleX + "px";
            this._inputDiv.style.top = y * scaleY + "px";
            if (this.textfield.multiline && this.textfield.height > this.textfield.size) {
                this._inputDiv.style.top = (y) * scaleY + "px";
                this._inputElement.style.top = (-this.textfield.lineSpacing / 2) * scaleY + "px";
            }
            else {
                this._inputDiv.style.top = y * scaleY + "px";
                this._inputElement.style.top = 0 + "px";
            }
            let node: any = this.textfield;
            let cX = 1;
            let cY = 1;
            let rotation = 0;
            while (node.parent) {
                cX *= node.scaleX;
                cY *= node.scaleY;
                rotation += node.rotation;
                node = node.parent;
            }
            let transformKey = HtmlUtil.getStyleName("transform");
            this._inputDiv.style[transformKey] = "rotate(" + rotation + "deg)";
            this._gscaleX = scaleX * cX;
            this._gscaleY = scaleY * cY;
        }

        public setText(value: string): boolean {
            this._textValue = value;
            this.resetText();
            return true;
        }

        public getText(): string {
            if (!this._textValue) {
                this._textValue = "";
            }
            return this._textValue;
        }

        private resetText(): void {
            if (this._inputElement) {
                this._inputElement.value = this._textValue;
            }
        }

        public setColor(value: number): boolean {
            this._colorValue = value;
            this.resetColor();
            return true;
        }

        private resetColor(): void {
            if (this._inputElement) {
                this.setElementStyle("color", HtmlUtil.toColorString(this._colorValue));
            }
        }

        public onBlur(): void {
        }

        public onInput(): void {
            let self = this;
            window.setTimeout(function () {
                if (self._inputElement && self._inputElement.selectionStart == self._inputElement.selectionEnd) {
                    self._textValue = self._inputElement.value;
                    self.dispatchEvent2D(Event2D.UPDATE_TEXT);
                }
            }, 0);
        }

        public onClickHandler(e): void {
            if (this._isNeedShow) {
                e.stopImmediatePropagation();
                this._isNeedShow = false;
                this.dispatchEvent2D(Event2D.FOCUS_IN);
                this.executeShow();
            }
        }

        private executeShow(): void {
            if (this._inputElement.value !== this.getText()) {
                this._inputElement.value = this.getText();
            }
            if (this._inputElement.onblur == null) {
                this._inputElement.onblur = this.onBlurHandler.bind(this);
            }
            if (this._inputElement.onfocus == null) {
                this._inputElement.onfocus = this.onFocusHandler.bind(this);
            }
            this.resetStageText();
            if (this.textfield.maxChars > 0) {
                this._inputElement.setAttribute("maxlength", this.textfield.maxChars + "");
            }
            else {
                this._inputElement.removeAttribute("maxlength");
            }
            this._inputElement.selectionStart = this._inputElement.value.length;
            this._inputElement.selectionEnd = this._inputElement.value.length;
            this._inputElement.focus();
        }

        private onBlurHandler(): void {
            this._htmlInput.clearInputElement();
            window.scrollTo(0, 0);
        }

        private onFocusHandler(): void {
            let self = this;
            window.setTimeout(function () {
                if (self._inputElement) {
                    self._inputElement.scrollIntoView();
                }
            }, 200);
        }

        /**
         * 修改位置
         */
        public resetStageText(): void {
            if (this._inputElement) {
                let textfield: TextField = this.textfield;
                this.setElementStyle("fontFamily", textfield.fontFamily);
                this.setElementStyle("fontStyle", textfield.italic ? "italic" : "normal");
                this.setElementStyle("fontWeight", textfield.bold ? "bold" : "normal");
                this.setElementStyle("textAlign", textfield.textAlign);
                this.setElementStyle("fontSize", textfield.size * this._gscaleY + "px");
                this.setElementStyle("color", HtmlUtil.toColorString(textfield.textColor));
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
                        let valign = TextFieldUtil.getValign(textfield);
                        let top = rap * valign;
                        let bottom = rap - top;
                        if (bottom < textfield.size / 2 * this._gscaleY) {
                            bottom = textfield.size / 2 * this._gscaleY;
                        }
                        this.setElementStyle("padding", top + "px 0px " + bottom + "px 0px");
                    }
                }
                this._inputDiv.style.clip = "rect(0px " + (textfield.width * this._gscaleX) + "px " + (textfield.height * this._gscaleY) + "px 0px)";
                this._inputDiv.style.height = textfield.height * this._gscaleY + "px";
                this._inputDiv.style.width = tw * this._gscaleX + "px";
            }
        }

        private setAreaHeight() {
            let textfield: TextField = this.textfield;
            if (textfield.multiline) {
                let textheight = TextFieldUtil.getTextHeight(textfield);
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
                    let valign: number = TextFieldUtil.getValign(textfield);
                    let top = rap * valign;
                    let bottom = rap - top;
                    this.setElementStyle("padding", top + "px 0px " + bottom + "px 0px");
                    this.setElementStyle("lineHeight", (textfield.size + textfield.lineSpacing) * this._gscaleY + "px");
                }
            }
        }

        private setElementStyle(style: string, value: any): void {
            if (this._inputElement) {
                if (this._styleInfoes[style] != value) {
                    this._inputElement.style[style] = value;
                }
            }
        }

        public hide(): void {
            if (this._htmlInput) {
                this._htmlInput.disconnectStageText(this);
            }
        }

        public removeFromStage(): void {
            if (this._inputElement) {
                this._htmlInput.disconnectStageText(this);
            }
        }

        public onDisconnect(): void {
            this._inputElement = null;
            this.dispatchEvent2D(Event2D.FOCUS_OUT);
        }
    }
}
