namespace dou2d {
    /**
     * 触摸处理类
     * @author wizardc
     */
    export class TouchHandler {

        /**
         * @private
         */
        public constructor(stage: Stage, canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.touch = new TouchHandlerImpl(stage);
            this.addListeners();
        }

        /**
         * @private
         */
        private canvas: HTMLCanvasElement;
        /**
         * @private
         */
        private touch: TouchHandlerImpl;

        /**
         * @private
         * 添加事件监听
         */
        private addListeners(): void {
            if (window.navigator.msPointerEnabled) {
                this.canvas.addEventListener("MSPointerDown", (event: any) => {
                    event.identifier = event.pointerId;
                    this.onTouchBegin(event);
                    this.prevent(event);
                }, false);
                this.canvas.addEventListener("MSPointerMove", (event: any) => {
                    event.identifier = event.pointerId;
                    this.onTouchMove(event);
                    this.prevent(event);
                }, false);
                this.canvas.addEventListener("MSPointerUp", (event: any) => {
                    event.identifier = event.pointerId;
                    this.onTouchEnd(event);
                    this.prevent(event);
                }, false);
            }
            else {
                if (!Capabilities.isMobile) {
                    this.addMouseListener();
                }
                this.addTouchListener();
            }
        }

        /**
         * @private
         * 
         */
        private addMouseListener(): void {
            this.canvas.addEventListener("mousedown", this.onTouchBegin);
            this.canvas.addEventListener("mousemove", this.onMouseMove);
            this.canvas.addEventListener("mouseup", this.onTouchEnd);
        }

        /**
         * @private
         * 
         */
        private addTouchListener(): void {
            this.canvas.addEventListener("touchstart", (event: any) => {
                let l = event.changedTouches.length;
                for (let i: number = 0; i < l; i++) {
                    this.onTouchBegin(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
            this.canvas.addEventListener("touchmove", (event: any) => {
                let l = event.changedTouches.length;
                for (let i: number = 0; i < l; i++) {
                    this.onTouchMove(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
            this.canvas.addEventListener("touchend", (event: any) => {
                let l = event.changedTouches.length;
                for (let i: number = 0; i < l; i++) {
                    this.onTouchEnd(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
            this.canvas.addEventListener("touchcancel", (event: any) => {
                let l = event.changedTouches.length;
                for (let i: number = 0; i < l; i++) {
                    this.onTouchEnd(event.changedTouches[i]);
                }
                this.prevent(event);
            }, false);
        }

        /**
         * @private
         */
        private prevent(event): void {
            event.stopPropagation();
            if (event["isScroll"] != true && !this.canvas['userTyping']) {
                event.preventDefault();
            }
        }

        /**
         * @private
         */
        private onTouchBegin = (event: any): void => {
            let location = this.getLocation(event);
            this.touch.onTouchBegin(location.x, location.y, event.identifier);
        }

        private onMouseMove = (event: MouseEvent) => {
            if (event.buttons == 0) {//在外面松开按键
                this.onTouchEnd(event);
            } else {
                this.onTouchMove(event);
            }
        }

        /**
         * @private
         */
        private onTouchMove = (event: any): void => {
            let location = this.getLocation(event);
            this.touch.onTouchMove(location.x, location.y, event.identifier);

        }

        /**
         * @private
         */
        private onTouchEnd = (event: any): void => {
            let location = this.getLocation(event);
            this.touch.onTouchEnd(location.x, location.y, event.identifier);
        }

        /**
         * @private
         */
        private getLocation(event: any): Point {
            event.identifier = +event.identifier || 0;
            let doc = document.documentElement;
            let box = this.canvas.getBoundingClientRect();
            let left = box.left + window.pageXOffset - doc.clientLeft;
            let top = box.top + window.pageYOffset - doc.clientTop;
            let x = event.pageX - left, newx = x;
            let y = event.pageY - top, newy = y;
            if (this.rotation == 90) {
                newx = y;
                newy = box.width - x;
            }
            else if (this.rotation == -90) {
                newx = box.height - y;
                newy = x;
            }
            newx = newx / this.scaleX;
            newy = newy / this.scaleY;
            return this.$TempPoint.set(Math.round(newx), Math.round(newy));
        }

        private $TempPoint: Point = new Point();

        /**
         * @private
         */
        private scaleX: number = 1;
        /**
         * @private
         */
        private scaleY: number = 1;
        /**
         * @private
         */
        private rotation: number = 0;

        /**
         * @private
         * 更新屏幕当前的缩放比例，用于计算准确的点击位置。
         * @param scaleX 水平方向的缩放比例。
         * @param scaleY 垂直方向的缩放比例。
         */
        public updateScaleMode(scaleX: number, scaleY: number, rotation: number): void {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
            this.rotation = rotation;
        }

        /**
         * @private
         * 更新同时触摸点的数量
         */
        public $updateMaxTouches(): void {
            this.touch.$initMaxTouches();
        }
    }
}
