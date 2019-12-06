namespace dou2d {
    export let canvas: HTMLCanvasElement;
    export let ticker: Ticker;
    export let screenAdapter: IScreenAdapter;

    /**
     * 引擎类, 用来启动 2D 引擎
     * @author wizardc
     */
    export class Engine {
        private _canvas: HTMLCanvasElement;

        /**
         * @param canvas 用户呈现 3D 图像的 Canvas 元素, 为空则会创建一个全屏的元素
         */
        public constructor(canvas?: HTMLCanvasElement) {
            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.style.position = "fixed";
                canvas.style.left = "0px";
                canvas.style.top = "0px";
                canvas.style.width = "100%";
                canvas.style.height = "100%";
                document.body.appendChild(canvas);
            }
            this._canvas = dou2d.canvas = canvas;

            screenAdapter = new DefaultScreenAdapter();

            ticker = new Ticker(this);
            this.startTicker();
        }

        private startTicker(): void {
            requestAnimationFrame(onTick);
            function onTick() {
                ticker.update();
                requestAnimationFrame(onTick);
            }
        }
    }
}
