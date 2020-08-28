declare module dou {
    interface EventDispatcher {
        /**
         * 抛出计时器事件
         */
        dispatchTimerEvent(type: string, cancelable?: boolean): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchTimerEvent: {
            value: function (type: string, cancelable?: boolean): boolean {
                let event = dou.recyclable(dou2d.TimerEvent);
                event.$initTimerEvent(type, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();

namespace dou2d {
    /**
     * 计时器事件
     * @author wizardc
     */
    export class TimerEvent extends dou.Event {
        public static TIMER: string = "timer";
        public static TIMER_COMPLETE: string = "timerComplete";

        public $initTimerEvent(type: string, cancelable?: boolean): void {
            this.$initEvent(type, null, cancelable);
        }

        /**
         * 请求忽略帧率立即刷新显示列表
         */
        public updateAfterEvent(): void {
            sys.ticker.requestImmediateUpdate();
        }
    }
}
