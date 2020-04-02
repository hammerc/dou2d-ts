namespace dou2d.sys {
    /**
     * 心跳计时器
     * @author wizardc
     */
    export class Ticker extends dou.TickerBase {
        private _tickList: { method: (passedTime: number) => void, thisObj: any }[];

        public constructor() {
            super();
            this._tickList = [];
        }

        /**
         * 添加自定义心跳计时器
         */
        public startTick(method: (passedTime: number) => void, thisObj: any): void {
            let index = this.getTickIndex(method, thisObj);
            if (index == -1) {
                this.concatTick();
                this._tickList.push({ method, thisObj });
            }
        }

        private getTickIndex(method: (passedTime: number) => void, thisObj: any): number {
            let list = this._tickList;
            for (let i = 0, len = list.length; i < len; i++) {
                let tick = list[i];
                if (tick.method === method && tick.thisObj === thisObj) {
                    return i;
                }
            }
            return -1;
        }

        private concatTick(): void {
            this._tickList = this._tickList.concat();
        }

        /**
         * 移除自定义心跳计时器
         */
        public stopTick(method: (passedTime: number) => void, thisObj: any): void {
            let index = this.getTickIndex(method, thisObj);
            if (index != -1) {
                this.concatTick();
                this._tickList.splice(index, 1);
            }
        }

        public updateLogic(passedTime: number): void {
            sys.deltaTime = passedTime;

            let logicCost: number, renderCost: number;
            logicCost = Time.time;
            dou.Tween.tick(passedTime, false);
            this.broadcastDelay(passedTime);
            this.broadcastTick(passedTime);
            this.broadcastRender();
            renderCost = Time.time;
            let drawCalls = player.render(passedTime);
            renderCost = Time.time - renderCost;
            this.broadcastEnterFrame();
            this.broadcastFixedEnterFrame(passedTime);
            logicCost = Time.time - logicCost - renderCost;
            stat.onFrame(logicCost, renderCost, drawCalls);
        }

        private broadcastDelay(passedTime: number): void {
            sys.updateCallLater();
            sys.updateInterval(passedTime);
            sys.updateTimeout(passedTime);
        }

        private broadcastTick(passedTime: number): void {
            let list = this._tickList;
            for (let i = 0, len = list.length; i < len; i++) {
                let tick = list[i];
                tick.method.call(tick.thisObj, passedTime);
            }
        }

        private broadcastRender(): void {
            if (invalidateRenderFlag) {
                invalidateRenderFlag = false;
                if (renderCallBackList.length > 0) {
                    let list = renderCallBackList.concat();
                    for (let display of list) {
                        display.dispatchEvent(Event2D.RENDER);
                    }
                }
                if (renderOnceCallBackList.length > 0) {
                    let list = renderOnceCallBackList;
                    renderOnceCallBackList = [];
                    for (let display of list) {
                        display.dispatchEvent(Event2D.RENDER);
                    }
                }
            }
        }

        private broadcastEnterFrame(): void {
            if (enterFrameCallBackList.length > 0) {
                let list = enterFrameCallBackList.concat();
                for (let display of list) {
                    display.dispatchEvent(Event2D.ENTER_FRAME);
                }
            }
            if (enterFrameOnceCallBackList.length > 0) {
                let list = enterFrameOnceCallBackList;
                enterFrameOnceCallBackList = [];
                for (let display of list) {
                    display.dispatchEvent(Event2D.ENTER_FRAME);
                }
            }
        }

        private broadcastFixedEnterFrame(passedTime: number): void {
            sys.fixedPassedTime += passedTime;
            let times = ~~(sys.fixedPassedTime / sys.fixedDeltaTime);
            if (times > 0) {
                sys.fixedPassedTime %= sys.fixedDeltaTime;
                if (fixedEnterFrameCallBackList.length > 0) {
                    let list = fixedEnterFrameCallBackList.concat();
                    for (let display of list) {
                        for (let i = 0; i < times; i++) {
                            display.dispatchEvent(Event2D.FIXED_ENTER_FRAME);
                        }
                    }
                }
                if (fixedEnterFrameOnceCallBackList.length > 0) {
                    let list = fixedEnterFrameOnceCallBackList;
                    fixedEnterFrameOnceCallBackList = [];
                    for (let display of list) {
                        for (let i = 0; i < times; i++) {
                            display.dispatchEvent(Event2D.FIXED_ENTER_FRAME);
                        }
                    }
                }
            }
        }
    }
}
