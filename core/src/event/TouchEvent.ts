declare module dou {
    interface EventDispatcher {
        /**
         * 抛出触摸事件
         */
        dispatchTouchEvent(type: string, stageX?: number, stageY?: number, touchPointID?: number, bubbles?: boolean, cancelable?: boolean, touchDown?: boolean): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher, {
        dispatchTouchEvent: {
            value: function (type: string, stageX?: number, stageY?: number, touchPointID?: number, bubbles?: boolean, cancelable?: boolean, touchDown?: boolean): boolean {
                let event = dou.recyclable(dou2d.TouchEvent);
                event.$initTouchEvent(type, stageX, stageY, touchPointID, bubbles, cancelable);
                let result = this.dispatchEvent(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();

namespace dou2d {
    /**
     * 触摸事件
     * @author wizardc
     */
    export class TouchEvent extends Event2D {
        public static TOUCH_BEGIN: string = "touchBegin";
        public static TOUCH_MOVE: string = "touchMove";
        public static TOUCH_END: string = "touchEnd";
        public static TOUCH_CANCEL: string = "touchCancel";
        public static TOUCH_TAP: string = "touchTap";
        public static TOUCH_RELEASE_OUTSIDE: string = "touchReleaseOutside";

        public get localX(): number {
            return 0;
        }

        public get localY(): number {
            return 0;
        }

        public $initTouchEvent(type: string, stageX?: number, stageY?: number, touchPointID?: number, bubbles?: boolean, cancelable?: boolean): void {
            this.$initEvent2D(type, null, bubbles, cancelable);

        }

        public onRecycle(): void {
            super.onRecycle();
        }
    }
}
