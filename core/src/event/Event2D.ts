namespace dou2d {
    /**
     * 2D 事件
     * @author wizardc
     */
    export class Event2D extends dou.Event {
        public static ENTER_FRAME: string = "enterFrame";
        public static EXIT_FRAME: string = "exitFrame";

        public static RESIZE: string = "resize";

        protected _bubbles: boolean = false;

        public static dispatch(target: dou.IEventDispatcher, type: string, data?: any, bubbles?: boolean, cancelable?: boolean): boolean {
            let event = dou.recyclable(Event2D);
            event.initEvent(type, data, bubbles, cancelable);
            let result = target.dispatchEvent(event);
            event.recycle();
            return result;
        }

        public initEvent(type: string, data?: any, bubbles?: boolean, cancelable?: boolean): void {
            this.init(type, data, cancelable);
            this._bubbles = bubbles;
        }

        public onRecycle(): void {
            super.onRecycle();
            this._bubbles = false;
        }
    }
}
