namespace dou2d.sys {
    /**
     * 心跳计时器
     * @author wizardc
     */
    export class Ticker extends dou.TickerBase {
        private _deltaTime: number = 0;
        private _tickList: { method: (passedTime: number) => void, thisObj: any }[];

        public constructor() {
            super();
            this._tickList = [];
        }

        /**
         * 相较上一帧经过的时间
         */
        public get deltaTime(): number {
            return this._deltaTime;
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
            this._deltaTime = passedTime;

            let logicCost: number, renderCost: number;
            logicCost = dou.getTimer();
            dou.Tween.tick(passedTime, false);
            this.broadcastDelay(passedTime);
            this.broadcastTick(passedTime);
            this.broadcastRender();
            renderCost = dou.getTimer();
            let drawCalls = player.render(passedTime);
            renderCost = dou.getTimer() - renderCost;
            this.broadcastEnterFrame();
            logicCost = dou.getTimer() - logicCost - renderCost;
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
    }
}
