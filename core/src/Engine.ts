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

            let options = this._options = this.readOptions(rootClass, runOptions);

            stage = new Stage(this);
            stage.scaleMode = <any>options.scaleMode;
            stage.orientation = <any>options.orientation;
            stage.maxTouches = options.maxTouches;
            stage.frameRate = options.frameRate;
            stage.textureScaleFactor = options.textureScaleFactor;

            screenAdapter = options.screenAdapter;
            renderer = new Renderer();

            let renderBuffer = new RenderBuffer(undefined, undefined, true);
            canvas = renderBuffer.surface as HTMLCanvasElement;

            context2D = HtmlUtil.get2DContext(HtmlUtil.createCanvas(2, 2));

            player = new Player(renderBuffer, stage, options.rootClass);
            player.start();
            this._touchHandler = new touch.TouchHandler(stage, canvas);
            this._input = new input.InputManager();

            ticker = new Ticker();
            this.startTicker();
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
                textureScaleFactor: runOptions.canvasScaleFactor ? runOptions.canvasScaleFactor(canvas.getContext("2d")) : 1
            };
        }

        private startTicker(): void {
            requestAnimationFrame(onTick);
            function onTick() {
                ticker.update();
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
            let canvas = dou2d.canvas;
            let option = this._options;
            let screenRect = canvas.getBoundingClientRect();
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
            let orientation = stage.orientation;
            if (orientation != OrientationMode.auto) {
                shouldRotate = orientation != OrientationMode.portrait && boundingClientHeight > boundingClientWidth || orientation == OrientationMode.portrait && boundingClientWidth > boundingClientHeight;
            }
            let screenWidth = shouldRotate ? boundingClientHeight : boundingClientWidth;
            let screenHeight = shouldRotate ? boundingClientWidth : boundingClientHeight;
            Capabilities.boundingClientWidth = screenWidth;
            Capabilities.boundingClientHeight = screenHeight;
            let stageSize = screenAdapter.calculateStageSize(stage.scaleMode, screenWidth, screenHeight, option.contentWidth, option.contentHeight);
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
            let canvasScaleX = scalex * DisplayList.$canvasScaleFactor;
            let canvasScaleY = scaley * DisplayList.$canvasScaleFactor;
            let matrix = dou.recyclable(Matrix);
            matrix.scale(scalex / canvasScaleX, scaley / canvasScaleY);
            matrix.rotate(rotation * Math.PI / 180);
            let transform = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.tx},${matrix.ty})`;
            matrix.recycle();
            canvas.style[HtmlUtil.getStyleName("transform")] = transform;
            DisplayList.$setCanvasScale(canvasScaleX, canvasScaleY);
            this._touchHandler.updateScaleMode(scalex, scaley, rotation);
            this._input.updateSize();
            player.updateStageSize(stageWidth, stageHeight);
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
