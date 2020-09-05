namespace dou2d.sys {
    /**
     * 心跳计时器回调, 返回 true 表示立即刷新显示列表
     */
    export type TickCallBack = (passedTime: number) => boolean;

    /**
     * 心跳计时器
     * @author wizardc
     */
    export class Ticker extends dou.TickerBase {
        private _tickList: { method: TickCallBack, thisObj: any }[];

        public constructor() {
            super();
            this._tickList = [];
        }

        /**
         * 添加自定义心跳计时器
         */
        public startTick(method: TickCallBack, thisObj: any): void {
            let index = this.getTickIndex(method, thisObj);
            if (index == -1) {
                this.concatTick();
                this._tickList.push({ method, thisObj });
            }
        }

        private getTickIndex(method: TickCallBack, thisObj: any): number {
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
        public stopTick(method: TickCallBack, thisObj: any): void {
            let index = this.getTickIndex(method, thisObj);
            if (index != -1) {
                this.concatTick();
                this._tickList.splice(index, 1);
            }
        }

        public updateLogic(passedTime: number): void {
            $2d.deltaTime = passedTime;

            let logicCost: number, renderCost: number;
            logicCost = Time.time;
            dou.Tween.tick(passedTime, false);
            this.broadcastDelay(passedTime);
            this.broadcastTick(passedTime);
            this.broadcastRender();
            renderCost = Time.time;
            let drawCalls = $2d.player.render(passedTime);
            renderCost = Time.time - renderCost;
            this.broadcastEnterFrame();
            this.broadcastFixedEnterFrame(passedTime);
            logicCost = Time.time - logicCost - renderCost;
            $2d.stat.onFrame(logicCost, renderCost, drawCalls);
        }

        private broadcastDelay(passedTime: number): void {
            sys.updateCallLater();
            sys.updateInterval(passedTime);
            sys.updateTimeout(passedTime);
        }

        private broadcastTick(passedTime: number): void {
            let list = this._tickList;
            let immediateUpdate = false;
            for (let i = 0, len = list.length; i < len; i++) {
                let tick = list[i];
                if (tick.method.call(tick.thisObj, passedTime)) {
                    immediateUpdate = true;
                }
            }
            if (immediateUpdate) {
                this.requestImmediateUpdate();
            }
        }

        private broadcastRender(): void {
            if ($2d.invalidateRenderFlag) {
                $2d.invalidateRenderFlag = false;
                if ($2d.renderCallBackList.length > 0) {
                    let list = $2d.renderCallBackList.concat();
                    for (let display of list) {
                        display.dispatchEvent(Event2D.RENDER);
                    }
                }
                if ($2d.renderOnceCallBackList.length > 0) {
                    let list = $2d.renderOnceCallBackList;
                    $2d.renderOnceCallBackList = [];
                    for (let display of list) {
                        display.dispatchEvent(Event2D.RENDER);
                    }
                }
            }
        }

        private broadcastEnterFrame(): void {
            if ($2d.enterFrameCallBackList.length > 0) {
                let list = $2d.enterFrameCallBackList.concat();
                for (let display of list) {
                    display.dispatchEvent(Event2D.ENTER_FRAME);
                }
            }
            if ($2d.enterFrameOnceCallBackList.length > 0) {
                let list = $2d.enterFrameOnceCallBackList;
                $2d.enterFrameOnceCallBackList = [];
                for (let display of list) {
                    display.dispatchEvent(Event2D.ENTER_FRAME);
                }
            }
        }

        private broadcastFixedEnterFrame(passedTime: number): void {
            $2d.fixedPassedTime += passedTime;
            let times = ~~($2d.fixedPassedTime / $2d.fixedDeltaTime);
            if (times > 0) {
                $2d.fixedPassedTime %= $2d.fixedDeltaTime;
                if ($2d.fixedEnterFrameCallBackList.length > 0) {
                    let list = $2d.fixedEnterFrameCallBackList.concat();
                    for (let display of list) {
                        for (let i = 0; i < times; i++) {
                            display.dispatchEvent(Event2D.FIXED_ENTER_FRAME);
                        }
                    }
                }
                if ($2d.fixedEnterFrameOnceCallBackList.length > 0) {
                    let list = $2d.fixedEnterFrameOnceCallBackList;
                    $2d.fixedEnterFrameOnceCallBackList = [];
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
