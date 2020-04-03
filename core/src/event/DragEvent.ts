declare module dou {
    interface EventDispatcher {
        /**
         * 抛出拖拽事件
         */
        dispatchDragEvent(type: string, dragData?: any, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchDragEvent: {
            value: function (type: string, dragData?: any, bubbles?: boolean, cancelable?: boolean): boolean {
                let event = dou.recyclable(dou2d.DragEvent);
                event.$initDragEvent(type, dragData, bubbles, cancelable);
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
     * 拖拽事件
     * @author wizardc
     */
    export class DragEvent extends Event2D {
        /**
         * 拖拽对象进入接受安放的拖拽区域时, 由接受对象播放
         */
        public static DRAG_ENTER: string = "dragEnter";

        /**
         * 拖拽对象在接受安放的拖拽区域中移动时, 由接受对象播放
         */
        public static DRAG_MOVE: string = "dragMove";

        /**
         * 拖拽对象在离开接受安放的拖拽区域时, 由接受对象播放
         */
        public static DRAG_EXIT: string = "dragExit";

        /**
         * 拖拽对象在接受安放的拖拽区域放下时, 由接受对象播放
         */
        public static DRAG_DROP: string = "dragDrop";

        /**
         * 拖拽对象开始拖拽时, 由拖拽对象播放
         */
        public static DRAG_START: string = "dragStart";

        /**
         * 拖拽对象在无效的区域放下时, 由拖拽对象播放
         */
        public static DRAG_OVER: string = "dragOver";

        private _dragData: any;

        public get dragData(): any {
            return this._dragData;
        }

        public $initDragEvent(type: string, dragData?: any, bubbles?: boolean, cancelable?: boolean): void {
            this.$initEvent2D(type, null, bubbles, cancelable);
            this._dragData = dragData;
        }

        public onRecycle(): void {
            super.onRecycle();
            this._dragData = null;
        }
    }
}
