declare module dou {
    interface EventDispatcher {
        /**
         * 抛出触摸事件
         */
        dispatchTouchEvent(type: string, stageX: number, stageY: number, touchPointID?: number, touchDown?: boolean, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchTouchEvent: {
            value: function (type: string, stageX: number, stageY: number, touchPointID?: number, touchDown?: boolean, bubbles?: boolean, cancelable?: boolean): boolean {
                let event = dou.recyclable(dou2d.TouchEvent);
                event.$initTouchEvent(type, stageX, stageY, touchPointID, touchDown, bubbles, cancelable);
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

        private _touchPointID: number;
        private _touchDown: boolean;

        private _stageX: number;
        private _stageY: number;

        private _localChanged: boolean = false;
        private _localX: number;
        private _localY: number;

        public get touchPointID(): number {
            return this._touchPointID;
        }

        public get touchDown(): boolean {
            return this._touchDown;
        }

        public get stageX(): number {
            return this._stageX;
        }

        public get stageY(): number {
            return this._stageY;
        }

        public get localX(): number {
            if (this._localChanged) {
                this.getLocalPosition();
            }
            return this._localX;
        }

        public get localY(): number {
            if (this._localChanged) {
                this.getLocalPosition();
            }
            return this._localY;
        }

        public $initTouchEvent(type: string, stageX: number, stageY: number, touchPointID?: number, touchDown?: boolean, bubbles?: boolean, cancelable?: boolean): void {
            this.$initEvent2D(type, null, bubbles, cancelable);
            this._touchPointID = touchPointID;
            this._touchDown = touchDown;
            this._stageX = stageX;
            this._stageY = stageY;
        }

        public $setTarget(target: dou.IEventDispatcher): void {
            super.$setTarget(target);
            this._localChanged = true;
        }

        private getLocalPosition(): void {
            this._localChanged = false;
            let m = (<DisplayObject>this.target).$getInvertedConcatenatedMatrix();
            let localPoint = dou.recyclable(Point);
            m.transformPoint(this._stageX, this._stageY, localPoint);
            this._localX = localPoint.x;
            this._localY = localPoint.y;
            localPoint.recycle();
        }

        public onRecycle(): void {
            super.onRecycle();
            this._touchPointID = NaN;
            this._touchDown = false;
            this._stageX = NaN;
            this._stageY = NaN;
            this._localChanged = false;
            this._localX = NaN;
            this._localY = NaN;
        }
    }
}
