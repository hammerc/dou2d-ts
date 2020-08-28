namespace dou2d.input {
    /**
     * 输入文本输入管理类
     * @author wizardc
     */
    export class InputManager {
        public inputDIV: any;

        public needShow: boolean = false;

        public scaleX: number = 1;
        public scaleY: number = 1;

        public finishUserTyping: Function;

        private _stageText: HtmlText;

        private _simpleElement: HTMLInputElement;
        private _multiElement: HTMLTextAreaElement;

        private _inputElement: HTMLInputElement | HTMLTextAreaElement;

        private _stageDelegateDiv: any;
        private _canvas: any;

        public isInputOn(): boolean {
            return this._stageText != null;
        }

        public isCurrentStageText(stageText): boolean {
            return this._stageText == stageText;
        }

        private initValue(dom: any): void {
            dom.style.position = "absolute";
            dom.style.left = "0px";
            dom.style.top = "0px";
            dom.style.border = "none";
            dom.style.padding = "0";
            dom.ontouchmove = (e) => {
                e.preventDefault();
            };
        }

        public initStageDelegateDiv(container: any, canvas: any): any {
            this._canvas = canvas;
            let self = this;
            let stageDelegateDiv: any;
            if (!stageDelegateDiv) {
                stageDelegateDiv = document.createElement("div");
                this._stageDelegateDiv = stageDelegateDiv;
                stageDelegateDiv.id = "StageDelegateDiv";
                container.appendChild(stageDelegateDiv);
                self.initValue(stageDelegateDiv);
                self.inputDIV = document.createElement("div");
                self.initValue(self.inputDIV);
                self.inputDIV.style.width = "0px";
                self.inputDIV.style.height = "0px";
                self.inputDIV.style.left = 0 + "px";
                self.inputDIV.style.top = "-100px";
                self.inputDIV.style[HtmlUtil.getStyleName("transformOrigin")] = "0% 0% 0px";
                stageDelegateDiv.appendChild(self.inputDIV);
                self._canvas.addEventListener("click", this.stageTextClickHandler);
                self.initInputElement(true);
                self.initInputElement(false);
            }
        }

        private stageTextClickHandler = (e) => {
            if (this.needShow) {
                this.needShow = false;
                this._stageText.onClickHandler(e);
                this.show();
            }
            else {
                this.blurInputElement();
                this.disposeInputElement();
            }
        }

        private initInputElement(multiline: boolean): void {
            let self = this;
            // 增加 1 个空的 textarea
            let inputElement: HTMLInputElement | HTMLTextAreaElement;
            if (multiline) {
                inputElement = document.createElement("textarea");
                inputElement.style["resize"] = "none";
                self._multiElement = inputElement;
                inputElement.id = "douTextarea";
            }
            else {
                inputElement = document.createElement("input");
                self._simpleElement = inputElement;
                inputElement.id = "douInput";
            }
            if (inputElement instanceof HTMLInputElement) {
                inputElement.type = "text";
            }
            self.inputDIV.appendChild(inputElement);
            inputElement.setAttribute("tabindex", "-1");
            inputElement.style.width = "1px";
            inputElement.style.height = "12px";
            self.initValue(inputElement);
            inputElement.style.outline = "thin";
            inputElement.style.background = "none";
            inputElement.style.overflow = "hidden";
            inputElement.style.wordBreak = "break-all";
            // 隐藏输入框
            inputElement.style.opacity = "0";
            inputElement.oninput = function () {
                if (self._stageText) {
                    self._stageText.onInput();
                }
            };
        }

        public updateSize(): void {
            if (!this._canvas) {
                return;
            }
            this.scaleX = rendering.DisplayList.canvasScaleX;
            this.scaleY = rendering.DisplayList.canvasScaleY;
            this._stageDelegateDiv.style.left = this._canvas.style.left;
            this._stageDelegateDiv.style.top = this._canvas.style.top;
            let transformKey = HtmlUtil.getStyleName("transform");
            this._stageDelegateDiv.style[transformKey] = this._canvas.style[transformKey];
            this._stageDelegateDiv.style[HtmlUtil.getStyleName("transformOrigin")] = "0% 0% 0px";
        }

        public show(): void {
            let self = this;
            let inputElement = self._inputElement;
            // 隐藏输入框
            callLater(function () {
                inputElement.style.opacity = "1";
            }, self);
        }

        public getInputElement(stageText: HtmlText): any {
            let self = this;
            self.clearInputElement();
            self._stageText = stageText;
            this._canvas["userTyping"] = true;
            if (self._stageText.textfield.multiline) {
                self._inputElement = self._multiElement;
            }
            else {
                self._inputElement = self._simpleElement;
            }
            let otherElement: any;
            if (self._simpleElement == self._inputElement) {
                otherElement = self._multiElement;
            }
            else {
                otherElement = self._simpleElement;
            }
            otherElement.style.display = "none";
            if (this._inputElement && !this.inputDIV.contains(this._inputElement)) {
                this.inputDIV.appendChild(this._inputElement);
            }
            return self._inputElement;
        }

        public disconnectStageText(stageText: HtmlText): void {
            if (this._stageText == null || this._stageText == stageText) {
                if (this._inputElement) {
                    this._inputElement.blur();
                }
                this.clearInputElement();
                if (this._inputElement && this.inputDIV.contains(this._inputElement)) {
                    this.inputDIV.removeChild(this._inputElement);
                }
                this.needShow = false;
            }
        }

        public clearInputElement(): void {
            let self = this;
            if (self._inputElement) {
                self._inputElement.value = "";
                self._inputElement.onblur = null;
                self._inputElement.onfocus = null;
                self._inputElement.style.width = "1px";
                self._inputElement.style.height = "12px";
                self._inputElement.style.left = "0px";
                self._inputElement.style.top = "0px";
                self._inputElement.style.opacity = "0";
                let otherElement: any;
                if (self._simpleElement == self._inputElement) {
                    otherElement = self._multiElement;
                }
                else {
                    otherElement = self._simpleElement;
                }
                otherElement.style.display = "block";
                self.inputDIV.style.left = 0 + "px";
                self.inputDIV.style.top = "-100px";
                self.inputDIV.style.height = 0 + "px";
                self.inputDIV.style.width = 0 + "px";
                self._inputElement.blur();
            }
            if (self._stageText) {
                self._stageText.onDisconnect();
                self._stageText = null;
                this._canvas["userTyping"] = false;
                if (this.finishUserTyping) {
                    this.finishUserTyping();
                }
            }
        }

        public blurInputElement(): void {
            if (this._inputElement) {
                this.clearInputElement();
                this._inputElement.blur();
            }
        }

        public disposeInputElement(): void {
            this._inputElement = null;
        }
    }
}
