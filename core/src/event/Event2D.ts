declare module dou {
    interface EventDispatcher {
        /**
         * 抛出 2D 事件
         */
        dispatchEvent2D(type: string, data?: any, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchEvent2D: {
            value: function (type: string, data?: any, bubbles?: boolean, cancelable?: boolean): boolean {
                let event = dou.recyclable(dou2d.Event2D);
                event.$initEvent2D(type, data, bubbles, cancelable);
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
     * 2D 事件
     * @author wizardc
     */
    export class Event2D extends dou.Event {
        public static ADDED_TO_STAGE: string = "addedToStage";
        public static REMOVED_FROM_STAGE: string = "removedFromStage";

        public static ADDED: string = "added";
        public static REMOVED: string = "removed";

        public static ENTER_FRAME: string = "enterFrame";
        public static EXIT_FRAME: string = "exitFrame";

        public static RENDER: string = "render";

        public static RESIZE: string = "resize";

        public static FOCUS_IN: string = "focusIn";
        public static FOCUS_OUT: string = "focusOut";

        public static UPDATE_TEXT: string = "updateText";

        public static LINK: string = "link";

        private _bubbles: boolean = false;
        private _currentTarget: dou.IEventDispatcher;
        private _isPropagationStopped: boolean = false;

        public get bubbles(): boolean {
            return this._bubbles;
        }

        public get currentTarget(): dou.IEventDispatcher {
            return this._currentTarget;
        }

        public $initEvent2D(type: string, data?: any, bubbles?: boolean, cancelable?: boolean): void {
            this.$initEvent(type, data, cancelable);
            this._bubbles = bubbles;
        }

        public $setCurrentTarget(currentTarget: dou.IEventDispatcher): void {
            this._currentTarget = currentTarget;
        }

        public stopPropagation(): void {
            if (this._bubbles) {
                this._isPropagationStopped = true;
            }
        }

        public $isPropagationStopped(): boolean {
            return this._isPropagationStopped;
        }

        public onRecycle(): void {
            super.onRecycle();
            this._bubbles = false;
            this._currentTarget = null;
            this._isPropagationStopped = false;
        }
    }
}
