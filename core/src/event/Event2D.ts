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

        private _bubbles: boolean = false;
        private _currentTarget: dou.IEventDispatcher;
        private _isPropagationStopped: boolean = false;

        public static dispatch(target: dou.IEventDispatcher, type: string, data?: any, bubbles?: boolean, cancelable?: boolean): boolean {
            let event = dou.recyclable(Event2D);
            event.initEvent(type, data, bubbles, cancelable);
            let result = target.dispatchEvent(event);
            event.recycle();
            return result;
        }

        public get bubbles(): boolean {
            return this._bubbles;
        }

        public get currentTarget(): dou.IEventDispatcher {
            return this._currentTarget;
        }

        public initEvent(type: string, data?: any, bubbles?: boolean, cancelable?: boolean): void {
            this.init(type, data, cancelable);
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
