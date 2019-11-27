namespace dou2d {
    /**
     * 渲染缓冲
     * @author wizardc
     */
    export class RenderBuffer {
        private static _renderBufferPool: RenderBuffer[] = [];

        /**
         * 获取一个渲染缓冲
         */
        public static get(width: number, height: number): RenderBuffer {
            let buffer = RenderBuffer._renderBufferPool.pop();
            if (buffer) {
                buffer.resize(width, height);
                var matrix = buffer.globalMatrix;
                matrix.a = 1;
                matrix.b = 0;
                matrix.c = 0;
                matrix.d = 1;
                matrix.tx = 0;
                matrix.ty = 0;
                buffer.globalAlpha = 1;
                buffer.offsetX = 0;
                buffer.offsetY = 0;
            }
            else {
                buffer = new RenderBuffer(width, height);
                buffer.computeDrawCall = false;
            }
            return buffer;
        }

        /**
         * 回收一个渲染缓冲
         */
        public static put(buffer: RenderBuffer): void {
            RenderBuffer._renderBufferPool.push(buffer);
        }

        /**
         * 渲染上下文
         */
        public context: RenderContext;

        /**
         * 舞台缓存为 Canvas, 普通缓存为 RenderTarget
         */
        public surface: HTMLCanvasElement | RenderTarget;

        /**
         * 渲染目标
         */
        public renderTarget: RenderTarget;

        /**
         * 是否为舞台
         */
        private _root: boolean;

        /**
         * 当前使用的贴图
         */
        public currentTexture: WebGLTexture;

        public globalAlpha: number = 1;

        public globalTintColor: number = 0xFFFFFF;

        /**
         * stencil state
         * 模版开关状态
         */
        private _stencilState: boolean = false;

        public stencilList: { x: number, y: number, width: number, height: number }[] = [];

        public stencilHandleCount: number = 0;

        /**
         * scissor state
         * scissor 开关状态  
         */
        public scissorState: boolean = false;

        private _scissorRect: Rectangle = new Rectangle();

        public hasScissor: boolean = false;

        public drawCalls: number = 0;
        public computeDrawCall: boolean = false;

        public globalMatrix: Matrix = new Matrix();
        public savedGlobalMatrix: Matrix = new Matrix();

        public offsetX: number = 0;
        public offsetY: number = 0;

        public constructor(width?: number, height?: number, root?: boolean) {
            // 获取 RenderContext, 如果是第一次会对 RenderContext 进行初始化
            this.context = RenderContext.getInstance(width, height);
            // 创建渲染目标
            this.renderTarget = new RenderTarget(this.context.context, 3, 3);
            if (width && height) {
                this.resize(width, height);
            }
            // 如果是第一个加入的 buffer, 说明是舞台
            this._root = root;
            // 如果是用于舞台渲染的 RenderBuffer, 则默认添加到 renderContext 中, 而且是第一个
            if (this._root) {
                this.context.pushBuffer(this);
                // 画布
                this.surface = this.context.surface;
                this.computeDrawCall = true;
            }
            else {
                // 由于创建 RenderTarget 造成的 FrameBuffer 绑定, 这里重置绑定
                let lastBuffer = this.context.activatedBuffer;
                if (lastBuffer) {
                    lastBuffer.renderTarget.activate();
                }
                this.renderTarget.initFrameBuffer();
                this.surface = this.renderTarget;
            }
        }

        public get width(): number {
            return this.renderTarget.width;
        }

        public get height(): number {
            return this.renderTarget.height;
        }

        public enableStencil(): void {
            if (!this._stencilState) {
                this.context.enableStencilTest();
                this._stencilState = true;
            }
        }

        public disableStencil(): void {
            if (this._stencilState) {
                this.context.disableStencilTest();
                this._stencilState = false;
            }
        }

        public restoreStencil(): void {
            if (this._stencilState) {
                this.context.enableStencilTest();
            }
            else {
                this.context.disableStencilTest();
            }
        }

        public enableScissor(x: number, y: number, width: number, height: number): void {
            if (!this.scissorState) {
                this.scissorState = true;
                this._scissorRect.set(x, y, width, height);
                this.context.enableScissorTest(this._scissorRect);
            }
        }

        public disableScissor(): void {
            if (this.scissorState) {
                this.scissorState = false;
                this._scissorRect.clear();
                this.context.disableScissorTest();
            }
        }

        public restoreScissor(): void {
            if (this.scissorState) {
                this.context.enableScissorTest(this._scissorRect);
            }
            else {
                this.context.disableScissorTest();
            }
        }

        /**
         * 改变渲染缓冲的大小并清空缓冲区
         * @param useMaxSize 是否将改变后的尺寸与已有尺寸对比, 然后保留较大的尺寸
         */
        public resize(width: number, height: number, useMaxSize?: boolean): void {
            width = width || 1;
            height = height || 1;
            this.context.pushBuffer(this);
            // RenderTarget 尺寸重置
            if (width != this.renderTarget.width || height != this.renderTarget.height) {
                this.context.drawCommand.pushResize(this, width, height);
                // 同步更改宽高
                this.renderTarget.width = width;
                this.renderTarget.height = height;
            }
            // 如果是舞台的渲染缓冲, 执行 resize, 否则 surface 大小不随之改变
            if (this._root) {
                this.context.resize(width, height, useMaxSize);
            }
            this.context.clear();
            this.context.popBuffer();
        }

        public setTransform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
            let matrix = this.globalMatrix;
            matrix.a = a;
            matrix.b = b;
            matrix.c = c;
            matrix.d = d;
            matrix.tx = tx;
            matrix.ty = ty;
        }

        public transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
            let matrix = this.globalMatrix;
            let a1 = matrix.a;
            let b1 = matrix.b;
            let c1 = matrix.c;
            let d1 = matrix.d;
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                matrix.a = a * a1 + b * c1;
                matrix.b = a * b1 + b * d1;
                matrix.c = c * a1 + d * c1;
                matrix.d = c * b1 + d * d1;
            }
            matrix.tx = tx * a1 + ty * c1 + matrix.tx;
            matrix.ty = tx * b1 + ty * d1 + matrix.ty;
        }

        public useOffset(): void {
            if (this.offsetX != 0 || this.offsetY != 0) {
                this.globalMatrix.append(1, 0, 0, 1, this.offsetX, this.offsetY);
                this.offsetX = this.offsetY = 0;
            }
        }

        public saveTransform(): void {
            let matrix = this.globalMatrix;
            let sMatrix = this.savedGlobalMatrix;
            sMatrix.a = matrix.a;
            sMatrix.b = matrix.b;
            sMatrix.c = matrix.c;
            sMatrix.d = matrix.d;
            sMatrix.tx = matrix.tx;
            sMatrix.ty = matrix.ty;
        }

        public restoreTransform(): void {
            let matrix = this.globalMatrix;
            let sMatrix = this.savedGlobalMatrix;
            matrix.a = sMatrix.a;
            matrix.b = sMatrix.b;
            matrix.c = sMatrix.c;
            matrix.d = sMatrix.d;
            matrix.tx = sMatrix.tx;
            matrix.ty = sMatrix.ty;
        }

        /**
         * 获取指定区域的像素
         */
        public getPixels(x: number, y: number, width: number = 1, height: number = 1): number[] {
            let pixels = new Uint8Array(4 * width * height);
            let useFrameBuffer = this.renderTarget.useFrameBuffer;
            this.renderTarget.useFrameBuffer = true;
            this.renderTarget.activate();
            this.context.getPixels(x, y, width, height, pixels);
            this.renderTarget.useFrameBuffer = useFrameBuffer;
            this.renderTarget.activate();
            // 图像反转
            let result = new Uint8Array(4 * width * height);
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    let index1 = (width * (height - i - 1) + j) * 4;
                    let index2 = (width * i + j) * 4;
                    let a = pixels[index2 + 3];
                    result[index1] = Math.round(pixels[index2] / a * 255);
                    result[index1 + 1] = Math.round(pixels[index2 + 1] / a * 255);
                    result[index1 + 2] = Math.round(pixels[index2 + 2] / a * 255);
                    result[index1 + 3] = pixels[index2 + 3];
                }
            }
            return <number[]><any>result;
        }

        /**
         * 转换成 base64 字符串, 如果图片 (或者包含的图片) 跨域, 则返回 null
         * @param type 转换的类型, 如: "image/png", "image/jpeg"
         */
        public toDataURL(type?: string, encoderOptions?: number): string {
            return this.context.surface.toDataURL(type, encoderOptions);
        }

        /**
         * 一次渲染结束
         */
        public onRenderFinish(): void {
            this.drawCalls = 0;
        }

        /**
         * 清空缓冲区数据
         */
        public clear(): void {
            this.context.pushBuffer(this);
            this.context.clear();
            this.context.popBuffer();
        }

        /**
         * 销毁绘制对象
         */
        public destroy(): void {
            this.context.destroy();
        }
    }
}
