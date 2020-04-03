namespace dou2d {
    /**
     * 拖拽管理器类
     * @author wizardc
     */
    export class DragManager {
        private static _instance: DragManager;

        public static get instance(): DragManager {
            return DragManager._instance || (DragManager._instance = new DragManager());
        }

        private _dragging: boolean = false;

        private _dropTarget: DisplayObject;
        private _dragTarget: DisplayObject;
        private _originDrag: DisplayObject;

        private _dragData: any;

        private _offsetX: number;
        private _offsetY: number;

        private constructor() {
            sys.stage.on(TouchEvent.TOUCH_MOVE, this.stageMoveHandler, this);
        }

        public get dragging(): boolean {
            return this._dragging;
        }

        public get originDrag(): DisplayObject {
            return this._originDrag;
        }

        public $dropRegister(target: DisplayObject, canDrop: boolean): void {
            if (canDrop) {
                target.on(TouchEvent.TOUCH_BEGIN, this.onMove, this);
                target.on(TouchEvent.TOUCH_MOVE, this.onMove, this);
                target.on(TouchEvent.TOUCH_END, this.onEnd, this);
            }
            else {
                target.off(TouchEvent.TOUCH_BEGIN, this.onMove, this);
                target.off(TouchEvent.TOUCH_MOVE, this.onMove, this);
                target.off(TouchEvent.TOUCH_END, this.onEnd, this);
            }
        }

        private stageMoveHandler(event: TouchEvent): void {
            if (this._dragging && this._dropTarget) {
                let end = false;
                if (this._dropTarget instanceof DisplayObjectContainer) {
                    end = !this._dropTarget.contains(event.target as DisplayObject);
                }
                else {
                    end = this._dropTarget !== event.target;
                }
                if (end) {
                    this._dropTarget.dispatchDragEvent(DragEvent.DRAG_EXIT, this._dragData);
                    this._dropTarget = undefined;
                }
            }
        }

        private onMove(event: TouchEvent): void {
            if (this._dragging) {
                if (!this._dropTarget) {
                    this._dropTarget = event.currentTarget as DisplayObject;
                    this._dropTarget.dispatchDragEvent(DragEvent.DRAG_ENTER, this._dragData);
                }
                else {
                    this._dropTarget.dispatchDragEvent(DragEvent.DRAG_MOVE, this._dragData);
                }
            }
        }

        private onEnd(event: TouchEvent): void {
            if (this._dragging && this._dropTarget) {
                this._dropTarget.dispatchDragEvent(DragEvent.DRAG_DROP, this._dragData);
                this._dragging = false;
                this._dropTarget = undefined;
                this._dragData = undefined;
                this.endDrag();
            }
        }

        public doDrag(dragTarget: DisplayObject, touchEvent: TouchEvent, dragData?: any, dragImage?: DisplayObject, xOffset?: number, yOffset?: number, imageAlpha: number = 1): DisplayObject {
            this._dragging = true;
            this._originDrag = dragTarget;
            if (dragImage) {
                this._dragTarget = dragImage;
            }
            else {
                let rt = new RenderTexture();
                rt.drawToTexture(dragTarget);
                this._dragTarget = new Bitmap(rt);
            }
            this._dragData = dragData;
            this._dragTarget.touchEnabled = false;
            if (this._dragTarget instanceof DisplayObjectContainer) {
                this._dragTarget.touchChildren = false;
            }
            this._dragTarget.alpha = imageAlpha;
            sys.stage.addChild(this._dragTarget);
            this._offsetX = xOffset;
            this._offsetY = yOffset;
            sys.stage.on(TouchEvent.TOUCH_MOVE, this.onStageMove, this);
            sys.stage.on(TouchEvent.TOUCH_END, this.onStageEnd, this);
            this.onStageMove(touchEvent);
            this._originDrag.dispatchDragEvent(DragEvent.DRAG_START, this._dragData);
            return this._dragTarget;
        }

        private onStageMove(event: TouchEvent): void {
            this._dragTarget.x = event.stageX + this._offsetX;
            this._dragTarget.y = event.stageY + this._offsetY;
        }

        private onStageEnd(event: TouchEvent): void {
            if (this._dragging) {
                this._originDrag.dispatchDragEvent(DragEvent.DRAG_OVER, this._dragData);
                this._dragging = false;
                this._dropTarget = undefined;
                this._dragData = undefined;
                this.endDrag();
            }
        }

        private endDrag(): void {
            sys.stage.off(TouchEvent.TOUCH_MOVE, this.onStageMove, this);
            sys.stage.off(TouchEvent.TOUCH_END, this.onStageEnd, this);
            sys.stage.removeChild(this._dragTarget);
            this._dragTarget = undefined;
            this._originDrag = undefined;
        }
    }
}
