namespace dou2d {
    /**
     * 计时器
     * @author wizardc
     */
    export class Timer extends dou.EventDispatcher {
        private _delay: number;
        private _repeatCount: number;

        private _currentCount: number = 0;

        private _running: boolean = false;

        private _updateInterval: number;
        private _lastCount: number;
        private _lastTimeStamp: number;

        public constructor(delay: number, repeatCount?: number) {
            super();
            this.delay = delay;
            this._repeatCount = +repeatCount | 0;
        }

        /**
         * 计时器间的延迟
         */
        public set delay(value: number) {
            if (value < 1) {
                value = 1;
            }
            if (this._delay == value) {
                return;
            }
            this._delay = value;
            this._lastCount = this._updateInterval = Math.round(60 * value);
        }
        public get delay(): number {
            return this._delay;
        }

        /**
         * 执行总次数
         */
        public get repeatCount(): number {
            return this._repeatCount;
        }

        /**
         * 当前执行的次数
         */
        public get currentCount(): number {
            return this._currentCount;
        }

        /**
         * 当前是否正在执行
         */
        public get running(): boolean {
            return this._running;
        }

        /**
         * 启动计时器
         */
        public start() {
            if (this._running) {
                return;
            }
            this._lastCount = this._updateInterval;
            this._lastTimeStamp = dou.getTimer();
            $2d.ticker.startTick(this.update, this);
            this._running = true;
        }

        private update(timeStamp: number): boolean {
            let deltaTime = timeStamp - this._lastTimeStamp;
            if (deltaTime >= this._delay) {
                this._lastCount = this._updateInterval;
            }
            else {
                this._lastCount -= 1000;
                if (this._lastCount > 0) {
                    return false;
                }
                this._lastCount += this._updateInterval;
            }
            this._lastTimeStamp = timeStamp;
            this._currentCount++;
            let complete = (this._repeatCount > 0 && this._currentCount >= this._repeatCount);
            if (this._repeatCount == 0 || this._currentCount <= this._repeatCount) {
                this.dispatchTimerEvent(TimerEvent.TIMER);
            }
            if (complete) {
                this.stop();
                this.dispatchTimerEvent(TimerEvent.TIMER_COMPLETE);
            }
            return false;
        }

        /**
         * 停止计时器
         */
        public stop() {
            if (!this._running) {
                return;
            }
            $2d.ticker.stopTick(this.update, this);
            this._running = false;
        }

        /**
         * 停止计时器, 并重置执行次数
         */
        public reset(): void {
            this.stop();
            this._currentCount = 0;
        }
    }
}
