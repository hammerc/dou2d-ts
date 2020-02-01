namespace dou2d {
    /**
     * 文本输入管理类
     * @author wizardc
     */
    export class Input {
        /**
         * @private
         */
        private _stageText: HTMLStageText;

        /**
         * @private
         */
        private _simpleElement: any;
        /**
         * @private
         */
        private _multiElement: any;

        /**
         * @private
         */
        private _inputElement: any;
        /**
         * @private
         */
        public _inputDIV: any;

        /**
         * @private
         * 
         * @returns 
         */
        public isInputOn(): boolean {
            return this._stageText != null;
        }

        /**
         * @private
         * 
         * @param stageText 
         * @returns 
         */
        public isCurrentStageText(stageText): boolean {
            return this._stageText == stageText;
        }

        /**
         * @private
         * 
         * @param dom 
         */
        private initValue(dom: any): void {
            dom.style.position = "absolute";
            dom.style.left = "0px";
            dom.style.top = "0px";
            dom.style.border = "none";
            dom.style.padding = "0";
        }

        /**
         * @private
         */
        public _needShow: boolean = false;

        /**
         * @private
         */
        $scaleX: number = 1;
        /**
         * @private
         */
        $scaleY: number = 1;

        /**
         * @private
         * 
         */
        $updateSize(): void {
            if (!this.canvas) {
                return;
            }

            this.$scaleX = sys.DisplayList.$canvasScaleX;
            this.$scaleY = sys.DisplayList.$canvasScaleY;

            this.StageDelegateDiv.style.left = this.canvas.style.left;
            this.StageDelegateDiv.style.top = this.canvas.style.top;

            let transformKey = web.getPrefixStyleName("transform");
            this.StageDelegateDiv.style[transformKey] = this.canvas.style[transformKey];
            this.StageDelegateDiv.style[web.getPrefixStyleName("transformOrigin")] = "0% 0% 0px";
        }

        /**
         * @private
         */
        private StageDelegateDiv;
        /**
         * @private
         */
        private canvas;
        /**
         * @private
         * 
         * @param container 
         * @param canvas 
         * @returns 
         */
        public _initStageDelegateDiv(container, canvas): any {
            this.canvas = canvas;
            let self = this;
            let stageDelegateDiv;
            if (!stageDelegateDiv) {
                stageDelegateDiv = document.createElement("div");
                this.StageDelegateDiv = stageDelegateDiv;
                stageDelegateDiv.id = "StageDelegateDiv";
                container.appendChild(stageDelegateDiv);
                self.initValue(stageDelegateDiv);

                self._inputDIV = document.createElement("div");
                self.initValue(self._inputDIV);
                self._inputDIV.style.width = "0px";
                self._inputDIV.style.height = "0px";

                self._inputDIV.style.left = 0 + "px";
                self._inputDIV.style.top = "-100px";

                self._inputDIV.style[web.getPrefixStyleName("transformOrigin")] = "0% 0% 0px";
                stageDelegateDiv.appendChild(self._inputDIV);

                this.canvas.addEventListener("click", function (e) {
                    if (self._needShow) {
                        self._needShow = false;

                        self._stageText._onClickHandler(e);

                        self.show();

                    }
                    else {
                        if (self._inputElement) {
                            self.clearInputElement();
                            self._inputElement.blur();
                            self._inputElement = null;
                        }
                    }
                });

                self.initInputElement(true);
                self.initInputElement(false);
            }
        }

        //初始化输入框
        private initInputElement(multiline: boolean): void {
            let self = this;

            //增加1个空的textarea
            let inputElement: any;
            if (multiline) {
                inputElement = document.createElement("textarea");
                inputElement.style["resize"] = "none";
                self._multiElement = inputElement;
                inputElement.id = "egretTextarea";
            }
            else {
                inputElement = document.createElement("input");
                self._simpleElement = inputElement;
                inputElement.id = "egretInput";
            }

            inputElement.type = "text";

            self._inputDIV.appendChild(inputElement);
            inputElement.setAttribute("tabindex", "-1");
            inputElement.style.width = "1px";
            inputElement.style.height = "12px";

            self.initValue(inputElement);
            inputElement.style.outline = "thin";
            inputElement.style.background = "none";

            inputElement.style.overflow = "hidden";
            inputElement.style.wordBreak = "break-all";

            //隐藏输入框
            inputElement.style.opacity = 0;

            inputElement.oninput = function () {
                if (self._stageText) {
                    self._stageText._onInput();
                }
            };
        }

        /**
         * @private
         * 
         */
        public show(): void {
            let self = this;
            let inputElement = self._inputElement;
            //隐藏输入框
            $callAsync(function () {
                inputElement.style.opacity = 1;
            }, self);
        }

        /**
         * @private
         * 
         * @param stageText 
         */
        public disconnectStageText(stageText): void {
            if (this._stageText == null || this._stageText == stageText) {
                if (this._inputElement) {
                    this._inputElement.blur();
                }
                this.clearInputElement();
            }
            this._needShow = false;
        }

        /**
         * @private
         * 
         */
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
                self._inputElement.style.opacity = 0;

                let otherElement;
                if (self._simpleElement == self._inputElement) {
                    otherElement = self._multiElement;
                }
                else {
                    otherElement = self._simpleElement;
                }
                otherElement.style.display = "block";

                self._inputDIV.style.left = 0 + "px";
                self._inputDIV.style.top = "-100px";
                self._inputDIV.style.height = 0 + "px";
                self._inputDIV.style.width = 0 + "px";

            }

            if (self._stageText) {
                self._stageText._onDisconnect();
                self._stageText = null;
                this.canvas['userTyping'] = false;
            }
        }

        /**
         * @private
         * 
         * @param stageText 
         * @returns 
         */
        public getInputElement(stageText): any {
            let self = this;
            self.clearInputElement();

            self._stageText = stageText;

            this.canvas['userTyping'] = true;

            if (self._stageText.$textfield.multiline) {
                self._inputElement = self._multiElement;
            }
            else {
                self._inputElement = self._simpleElement;
            }

            let otherElement;
            if (self._simpleElement == self._inputElement) {
                otherElement = self._multiElement;
            }
            else {
                otherElement = self._simpleElement;
            }
            otherElement.style.display = "none";

            return self._inputElement;
        }

    }
}
