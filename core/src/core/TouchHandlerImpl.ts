namespace dou2d {
    /**
     * 
     * @author wizardc
     */
    export class TouchHandlerImpl {
        private maxTouches: number = 0;
        private useTouchesCount: number = 0;

        /**
         * @private
         */
        public constructor(stage: Stage) {
            this.stage = stage;
        }

        /**
         * @private
         * 设置同时触摸数量
         */
        $initMaxTouches(): void {
            this.maxTouches = this.stage.maxTouches;
        }

        /**
         * @private
         */
        private stage: Stage;

        /**
         * @private
         */
        private touchDownTarget: { [key: number]: DisplayObject } = {};

        /**
         * @private
         * 触摸开始（按下）
         * @param x 事件发生处相对于舞台的坐标x
         * @param y 事件发生处相对于舞台的坐标y
         * @param touchPointID 分配给触摸点的唯一标识号
         */
        public onTouchBegin(x: number, y: number, touchPointID: number): void {
            if (this.useTouchesCount >= this.maxTouches) {
                return;
            }
            this.lastTouchX = x;
            this.lastTouchY = y;

            let target = this.findTarget(x, y);
            if (this.touchDownTarget[touchPointID] == null) {
                this.touchDownTarget[touchPointID] = target;
                this.useTouchesCount++;
            }
            target.dispatchTouchEvent(TouchEvent.TOUCH_BEGIN, x, y, touchPointID, true, true, true);
        }

        /**
         * @private
         */
        private lastTouchX: number = -1;
        /**
         * @private
         */
        private lastTouchY: number = -1;

        /**
         * @private
         * 触摸移动
         * @param x 事件发生处相对于舞台的坐标x
         * @param y 事件发生处相对于舞台的坐标y
         * @param touchPointID 分配给触摸点的唯一标识号
         */
        public onTouchMove(x: number, y: number, touchPointID: number): void {
            if (this.touchDownTarget[touchPointID] == null) {
                return;
            }

            if (this.lastTouchX == x && this.lastTouchY == y) {
                return;
            }

            this.lastTouchX = x;
            this.lastTouchY = y;

            let target = this.findTarget(x, y);
            target.dispatchTouchEvent(TouchEvent.TOUCH_MOVE, x, y, touchPointID, true, true, true);
        }

        /**
         * @private
         * 触摸结束（弹起）
         * @param x 事件发生处相对于舞台的坐标x
         * @param y 事件发生处相对于舞台的坐标y
         * @param touchPointID 分配给触摸点的唯一标识号
         */
        public onTouchEnd(x: number, y: number, touchPointID: number): void {
            if (this.touchDownTarget[touchPointID] == null) {
                return;
            }

            let target = this.findTarget(x, y);
            let oldTarget = this.touchDownTarget[touchPointID];
            delete this.touchDownTarget[touchPointID];
            this.useTouchesCount--;

            target.dispatchTouchEvent(TouchEvent.TOUCH_END, x, y, touchPointID, true, true, false);
            if (oldTarget == target) {
                target.dispatchTouchEvent(TouchEvent.TOUCH_TAP, x, y, touchPointID, true, true, false);
            }
            else {
                oldTarget.dispatchTouchEvent(TouchEvent.TOUCH_RELEASE_OUTSIDE, x, y, touchPointID, true, true, false);
            }
        }

        /**
         * @private
         * 获取舞台坐标下的触摸对象
         */
        private findTarget(stageX: number, stageY: number): DisplayObject {
            let target = this.stage.$hitTest(stageX, stageY);
            if (!target) {
                target = this.stage;
            }
            return target;
        }
    }
}
