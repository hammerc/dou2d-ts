namespace dou2d.touch {
    /**
     * 触摸处理类
     * @author wizardc
     */
    export class TouchHandler {
        private _canvas: HTMLCanvasElement;
        private _touch: TouchHandlerImpl;

        private _point: Point;

        private _scaleX: number = 1;
        private _scaleY: number = 1;
        private _rotation: number = 0;

        public constructor(stage: Stage, canvas: HTMLCanvasElement) {
            this._canvas = canvas;
            this._touch = new TouchHandlerImpl(stage);
            this._point = new Point();
            this.addListeners();
        }

        private addListeners(): void {
            if (!Capabilities.isMobile) {
                this.addMouseListener();
            }
            this.addTouchListener();
        }

        private addMouseListener(): void {
            this._canvas.addEventListener("mousedown", this.onTouchBegin);
            this._canvas.addEventListener("mousemove", this.onTouchMove);
            this._canvas.addEventListener("mouseup", this.onTouchEnd);
        }

        private addTouchListener(): void {
            this._canvas.addEventListener("touchstart", (event: any) => {
                let l = event.changedTouches.length;
                for (let i = 0; i < l; i++) {
                    this.onTouchBegin(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
            this._canvas.addEventListener("touchmove", (event: any) => {
                let l = event.changedTouches.length;
                for (let i = 0; i < l; i++) {
                    this.touchMove(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
            this._canvas.addEventListener("touchend", (event: any) => {
                let l = event.changedTouches.length;
                for (let i = 0; i < l; i++) {
                    this.onTouchEnd(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
            this._canvas.addEventListener("touchcancel", (event: any) => {
                let l = event.changedTouches.length;
                for (let i = 0; i < l; i++) {
                    this.onTouchEnd(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
        }

        private onTouchBegin = (event: any): void => {
            let location = this.getLocation(event);
            this._touch.onTouchBegin(location.x, location.y, event.identifier);
        }

        private onTouchMove = (event: MouseEvent) => {
            // 在外面松开按键
            if (event.buttons == 0) {
                this.onTouchEnd(event);
            }
            else {
                this.touchMove(event);
            }
        }

        private touchMove = (event: any): void => {
            let location = this.getLocation(event);
            this._touch.onTouchMove(location.x, location.y, event.identifier);
        }

        private onTouchEnd = (event: any): void => {
            let location = this.getLocation(event);
            this._touch.onTouchEnd(location.x, location.y, event.identifier);
        }

        private prevent(event: any): void {
            event.stopPropagation();
            if (event["isScroll"] != true && !this._canvas["userTyping"]) {
                event.preventDefault();
            }
        }

        private getLocation(event: any): Point {
            event.identifier = +event.identifier || 0;
            let doc = document.documentElement;
            let box = this._canvas.getBoundingClientRect();
            let left = box.left + window.pageXOffset - doc.clientLeft;
            let top = box.top + window.pageYOffset - doc.clientTop;
            let x = event.pageX - left, newx = x;
            let y = event.pageY - top, newy = y;
            if (this._rotation == 90) {
                newx = y;
                newy = box.width - x;
            }
            else if (this._rotation == -90) {
                newx = box.height - y;
                newy = x;
            }
            newx = newx / this._scaleX;
            newy = newy / this._scaleY;
            return this._point.set(Math.round(newx), Math.round(newy));
        }

        /**
         * 更新屏幕当前的缩放比例, 用于计算准确的点击位置
         */
        public updateScaleMode(scaleX: number, scaleY: number, rotation: number): void {
            this._scaleX = scaleX;
            this._scaleY = scaleY;
            this._rotation = rotation;
        }

        /**
         * 更新同时触摸点的数量
         */
        public updateMaxTouches(): void {
            this._touch.initMaxTouches();
        }
    }
}
