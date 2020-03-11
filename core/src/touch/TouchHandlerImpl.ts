namespace dou2d.touch {
    /**
     * 触摸处理实现类
     * @author wizardc
     */
    export class TouchHandlerImpl {
        private _stage: Stage;

        private _maxTouches: number = 0;
        private _useTouchesCount: number = 0;

        private _touchDownTarget: { [key: number]: DisplayObject };

        private _lastTouchX: number = -1;
        private _lastTouchY: number = -1;

        public constructor(stage: Stage) {
            this._stage = stage;
            this._touchDownTarget = {};
        }

        public initMaxTouches(): void {
            this._maxTouches = this._stage.maxTouches;
        }

        public onTouchBegin(x: number, y: number, touchPointID: number): void {
            if (this._useTouchesCount >= this._maxTouches) {
                return;
            }
            this._lastTouchX = x;
            this._lastTouchY = y;
            let target = this.findTarget(x, y);
            if (this._touchDownTarget[touchPointID] == null) {
                this._touchDownTarget[touchPointID] = target;
                this._useTouchesCount++;
            }
            target.dispatchTouchEvent(TouchEvent.TOUCH_BEGIN, x, y, touchPointID, true, true, true);
        }

        public onTouchMove(x: number, y: number, touchPointID: number): void {
            if (this._touchDownTarget[touchPointID] == null) {
                return;
            }
            if (this._lastTouchX == x && this._lastTouchY == y) {
                return;
            }
            this._lastTouchX = x;
            this._lastTouchY = y;
            let target = this.findTarget(x, y);
            target.dispatchTouchEvent(TouchEvent.TOUCH_MOVE, x, y, touchPointID, true, true, true);
        }

        public onTouchEnd(x: number, y: number, touchPointID: number): void {
            if (this._touchDownTarget[touchPointID] == null) {
                return;
            }
            let target = this.findTarget(x, y);
            let oldTarget = this._touchDownTarget[touchPointID];
            delete this._touchDownTarget[touchPointID];
            this._useTouchesCount--;
            target.dispatchTouchEvent(TouchEvent.TOUCH_END, x, y, touchPointID, false, true, true);
            if (oldTarget == target) {
                target.dispatchTouchEvent(TouchEvent.TOUCH_TAP, x, y, touchPointID, false, true, true);
            }
            else {
                oldTarget.dispatchTouchEvent(TouchEvent.TOUCH_RELEASE_OUTSIDE, x, y, touchPointID, false, true, true);
            }
        }

        private findTarget(stageX: number, stageY: number): DisplayObject {
            let target = this._stage.$hitTest(stageX, stageY);
            if (!target) {
                target = this._stage;
            }
            return target;
        }
    }
}
