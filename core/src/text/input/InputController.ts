namespace dou2d.input {
    /**
     * 输入文本控制器
     * @author wizardc
     */
    export class InputController {
        private _stageText: HtmlText;
        private _stageTextAdded: boolean;
        private _text: TextField;
        private _isFocus: boolean;
        private _tempStage: Stage;

        public init(text: TextField): void {
            this._text = text;
            this._stageText = new HtmlText();
            this._stageText.setTextField(this._text);
        }

        public setText(value: string) {
            this._stageText.setText(value);
        }

        public getText(): string {
            return this._stageText.getText();
        }

        public setColor(value: number) {
            this._stageText.setColor(value);
        }

        public addStageText(): void {
            if (this._stageTextAdded) {
                return;
            }
            if (!this._text.$inputEnabled) {
                this._text.touchEnabled = true;
            }
            this._tempStage = this._text.stage;
            this._stageText.addToStage();
            this._stageText.on(Event2D.UPDATE_TEXT, this.updateTextHandler, this);
            this._text.on(TouchEvent.TOUCH_BEGIN, this.onMouseDownHandler, this);
            this._text.on(TouchEvent.TOUCH_MOVE, this.onMouseMoveHandler, this);
            this._stageText.on(Event2D.FOCUS_OUT, this.blurHandler, this);
            this._stageText.on(Event2D.FOCUS_IN, this.focusHandler, this);
            this._stageTextAdded = true;
        }

        private focusHandler(event: Event): void {
            // 不再显示竖线, 并且输入框显示最开始
            if (!this._isFocus) {
                this._isFocus = true;
                if (!event["showing"]) {
                    this._text.$setIsTyping(true);
                }
                this._text.dispatchEvent2D(Event2D.FOCUS_IN, null, true);
            }
        }

        private blurHandler(event: Event): void {
            if (this._isFocus) {
                // 不再显示竖线, 并且输入框显示最开始
                this._isFocus = false;
                this._tempStage.off(TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
                this._text.$setIsTyping(false);
                // 失去焦点后调用
                this._stageText.onBlur();
                this._text.dispatchEvent2D(Event2D.FOCUS_OUT, null, true);
            }
        }

        // 点中文本
        private onMouseDownHandler(event: TouchEvent): void {
            this.onFocus();
        }

        private onMouseMoveHandler(event: TouchEvent) {
            this._stageText.hide();
        }

        public onFocus(active: boolean = false): void {
            if (!this._text.$getVisible()) {
                return;
            }
            if (this._isFocus) {
                return;
            }
            this._tempStage.off(TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
            callLater(() => {
                this._tempStage.on(TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
            }, this);
            // 强制更新输入框位置
            this._stageText.show(active);
        }

        // 未点中文本
        private onStageDownHandler(event: TouchEvent): void {
            if (event.target != this._text) {
                this._stageText.hide();
            }
        }

        private updateTextHandler(event: Event): void {
            let values = this._text.$propertyMap;
            let textValue = this._stageText.getText();
            let isChanged = false;
            let reg: RegExp;
            let result: string[];
            // 内匹配
            if (values[sys.TextKeys.restrictAnd] != null) {
                reg = new RegExp("[" + values[sys.TextKeys.restrictAnd] + "]", "g");
                result = textValue.match(reg);
                if (result) {
                    textValue = result.join("");
                }
                else {
                    textValue = "";
                }
                isChanged = true;
            }
            // 外匹配
            if (values[sys.TextKeys.restrictNot] != null) {
                reg = new RegExp("[^" + values[sys.TextKeys.restrictNot] + "]", "g");
                result = textValue.match(reg);
                if (result) {
                    textValue = result.join("");
                }
                else {
                    textValue = "";
                }
                isChanged = true;
            }
            if (isChanged && this._stageText.getText() != textValue) {
                this._stageText.setText(textValue);
            }
            this.resetText();
            this._text.dispatchEvent2D(Event2D.CHANGE, null, true);
        }

        private resetText(): void {
            this._text.$setBaseText(this._stageText.getText());
        }

        public updateProperties(): void {
            if (this._isFocus) {
                // 整体修改
                this._stageText.resetStageText();
                this.updateInput();
                return;
            }
            this._stageText.setText(this._text.$propertyMap[sys.TextKeys.text]);
            //整体修改
            this._stageText.resetStageText();
            this.updateInput();
        }

        private updateInput(): void {
            if (!this._text.$getVisible() && this._stageText) {
                this.removeInput();
            }
        }

        public hideInput(): void {
            this._stageText.hide();
        }

        public removeInput(): void {
            this._stageText.removeFromStage();
        }

        public removeStageText(): void {
            if (!this._stageTextAdded) {
                return;
            }
            if (!this._text.$inputEnabled) {
                this._text.touchEnabled = false;
            }
            this._stageText.removeFromStage();
            this._stageText.off(Event2D.UPDATE_TEXT, this.updateTextHandler, this);
            this._text.off(TouchEvent.TOUCH_BEGIN, this.onMouseDownHandler, this);
            this._text.off(TouchEvent.TOUCH_MOVE, this.onMouseMoveHandler, this);
            this._tempStage.off(TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
            this._stageText.off(Event2D.FOCUS_OUT, this.blurHandler, this);
            this._stageText.off(Event2D.FOCUS_IN, this.focusHandler, this);
            this._stageTextAdded = false;
        }
    }
}
