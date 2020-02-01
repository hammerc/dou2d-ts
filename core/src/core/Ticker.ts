namespace dou2d {
    /**
     * 心跳计时器
     * @author wizardc
     */
    export class Ticker extends dou.TickerBase {
        private _deltaTime: number = 0;

        public constructor() {
            super();
        }

        public get deltaTime(): number {
            return this._deltaTime;
        }

        public updateLogic(passedTime: number): void {
            this._deltaTime = passedTime;

            dou.Tween.tick(passedTime, false);
            player.render(passedTime);
        }
    }
}
