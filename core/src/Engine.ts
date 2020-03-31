namespace dou2d {
    /**
     * 引擎类, 用来启动 2D 引擎
     * @author wizardc
     */
    export class Engine {
        private _options: {
            rootClass: any;
            contentWidth: number;
            contentHeight: number;
            scaleMode: string;
            orientation: string;
            maxTouches: number;
            frameRate: number;
            antialias: boolean;
            screenAdapter: IScreenAdapter;
            textureScaleFactor: number;
        };

        private _container: HTMLElement;
        private _touchHandler: touch.TouchHandler;
        private _input: input.InputManager;

        /**
         * @param rootClass 根显示容器类
         * @param div 用户呈现 3D 图像的 Div 元素, 为空则会创建一个全屏的元素
         * @param runOptions 运行配置项
         */
        public constructor(rootClass: any, div?: HTMLDivElement, runOptions?: RunOptions) {
            this.init(rootClass, div, runOptions);
        }

        private init(rootClass: any, div?: HTMLDivElement, runOptions?: RunOptions): void {
            if (!div) {
                div = document.createElement("div");
                div.style.position = "fixed";
                div.style.left = "0px";
                div.style.top = "0px";
                div.style.width = "100%";
                div.style.height = "100%";
                document.body.appendChild(div);
            }
            this._container = div;

            let options = this._options = this.readOptions(rootClass, runOptions);

            sys.stage = new Stage(this);

            sys.screenAdapter = options.screenAdapter;
            sys.renderer = new rendering.Renderer();

            let renderBuffer = new rendering.RenderBuffer(undefined, undefined, true);
            sys.canvas = renderBuffer.surface as HTMLCanvasElement;

            this.attachCanvas(this._container, sys.canvas);

            sys.context2D = HtmlUtil.get2DContext(HtmlUtil.createCanvas(2, 2));

            this._touchHandler = new touch.TouchHandler(sys.stage, sys.canvas);
            this._input = new input.InputManager();

            sys.player = new sys.Player(renderBuffer, sys.stage, options.rootClass);
            sys.player.start();

            sys.ticker = new sys.Ticker();
            this.startTicker();

            sys.stage.scaleMode = <any>options.scaleMode;
            sys.stage.orientation = <any>options.orientation;
            sys.stage.maxTouches = options.maxTouches;
            sys.stage.frameRate = options.frameRate;
            sys.stage.textureScaleFactor = options.textureScaleFactor;

            this.updateScreenSize();
            window.addEventListener("resize", () => {
                window.setTimeout(() => {
                    this.updateScreenSize();
                }, 300);
            });

            sys.stat = new sys.Stat();
        }

        private readOptions(rootClass: any, runOptions?: RunOptions) {
            if (!runOptions) {
                runOptions = {};
            }
            return {
                rootClass,
                contentWidth: runOptions.contentWidth || 480,
                contentHeight: runOptions.contentHeight || 800,
                scaleMode: runOptions.scaleMode || StageScaleMode.showAll,
                orientation: runOptions.orientation || OrientationMode.auto,
                maxTouches: runOptions.maxTouches || 2,
                frameRate: runOptions.frameRate || 60,
                antialias: runOptions.antialias || false,
                screenAdapter: runOptions.screenAdapter || new DefaultScreenAdapter(),
                textureScaleFactor: runOptions.canvasScaleFactor ? runOptions.canvasScaleFactor(sys.canvas.getContext("2d")) : 1
            };
        }

        private attachCanvas(container: HTMLElement, canvas: HTMLCanvasElement): void {
            let style = canvas.style;
            style.cursor = "inherit";
            style.position = "absolute";
            style.top = "0";
            style.bottom = "0";
            style.left = "0";
            style.right = "0";
            container.appendChild(canvas);
            style = container.style;
            style.overflow = "hidden";
            style.position = "absolute";
        }

        private startTicker(): void {
            requestAnimationFrame(onTick);
            function onTick() {
                sys.ticker.update();
                requestAnimationFrame(onTick);
            }
        }

        public setContentSize(width: number, height: number): void {
            let options = this._options;
            options.contentWidth = width;
            options.contentHeight = height;
            this.updateScreenSize();
        }

        public updateScreenSize(): void {
            let canvas = sys.canvas;
            let option = this._options;
            let screenRect = this._container.getBoundingClientRect();
            let top = 0;
            let boundingClientWidth = screenRect.width;
            let boundingClientHeight = screenRect.height;
            if (boundingClientWidth == 0 || boundingClientHeight == 0) {
                return;
            }
            if (screenRect.top < 0) {
                boundingClientHeight += screenRect.top;
                top = -screenRect.top;
            }
            let shouldRotate = false;
            let orientation = sys.stage.orientation;
            if (orientation != OrientationMode.auto) {
                shouldRotate = orientation != OrientationMode.portrait && boundingClientHeight > boundingClientWidth || orientation == OrientationMode.portrait && boundingClientWidth > boundingClientHeight;
            }
            let screenWidth = shouldRotate ? boundingClientHeight : boundingClientWidth;
            let screenHeight = shouldRotate ? boundingClientWidth : boundingClientHeight;
            Capabilities.boundingClientWidth = screenWidth;
            Capabilities.boundingClientHeight = screenHeight;
            let stageSize = sys.screenAdapter.calculateStageSize(sys.stage.scaleMode, screenWidth, screenHeight, option.contentWidth, option.contentHeight);
            let stageWidth = stageSize.stageWidth;
            let stageHeight = stageSize.stageHeight;
            let displayWidth = stageSize.displayWidth;
            let displayHeight = stageSize.displayHeight;
            canvas.style[HtmlUtil.getStyleName("transformOrigin")] = "0% 0% 0px";
            if (canvas.width != stageWidth) {
                canvas.width = stageWidth;
            }
            if (canvas.height != stageHeight) {
                canvas.height = stageHeight;
            }
            let rotation = 0;
            if (shouldRotate) {
                if (orientation == OrientationMode.landscape) {
                    rotation = 90;
                    canvas.style.top = top + (boundingClientHeight - displayWidth) / 2 + "px";
                    canvas.style.left = (boundingClientWidth + displayHeight) / 2 + "px";
                }
                else {
                    rotation = -90;
                    canvas.style.top = top + (boundingClientHeight + displayWidth) / 2 + "px";
                    canvas.style.left = (boundingClientWidth - displayHeight) / 2 + "px";
                }
            }
            else {
                canvas.style.top = top + (boundingClientHeight - displayHeight) / 2 + "px";
                canvas.style.left = (boundingClientWidth - displayWidth) / 2 + "px";
            }
            let scalex = displayWidth / stageWidth, scaley = displayHeight / stageHeight;
            let canvasScaleX = scalex * rendering.DisplayList.$canvasScaleFactor;
            let canvasScaleY = scaley * rendering.DisplayList.$canvasScaleFactor;
            let matrix = dou.recyclable(Matrix);
            matrix.scale(scalex / canvasScaleX, scaley / canvasScaleY);
            matrix.rotate(rotation * Math.PI / 180);
            let transform = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.tx},${matrix.ty})`;
            matrix.recycle();
            canvas.style[HtmlUtil.getStyleName("transform")] = transform;
            rendering.DisplayList.$setCanvasScale(canvasScaleX, canvasScaleY);
            this._touchHandler.updateScaleMode(scalex, scaley, rotation);
            this._input.updateSize();
            sys.player.updateStageSize(stageWidth, stageHeight);
        }

        public updateMaxTouches(maxTouches: number): void {
            this._touchHandler.updateMaxTouches();
        }
    }

    /**
     * 启动配置选项
     * @author wizardc
     */
    export interface RunOptions {
        contentWidth?: number;
        contentHeight?: number;
        scaleMode?: string;
        orientation?: string;
        maxTouches?: number;
        frameRate?: number;
        antialias?: boolean;
        screenAdapter?: IScreenAdapter;
        canvasScaleFactor?: (context: CanvasRenderingContext2D) => number;
    }
}
