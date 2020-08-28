namespace dou2d.rendering {
    /**
     * 渲染上下文
     * @author wizardcs
     */
    export class RenderContext {
        private static _instance: RenderContext;

        public static getInstance(width?: number, height?: number): RenderContext {
            return RenderContext._instance || (RenderContext._instance = new RenderContext(width, height));
        }

        /**
         * 呈现最终绘图结果的画布
         */
        public surface: HTMLCanvasElement;

        /**
         * 渲染上下文
         */
        public context: WebGLRenderingContext;

        /**
         * 上下文对象是否丢失
         */
        public contextLost: boolean = false;

        /**
         * 贴图支持的最大尺寸
         */
        public maxTextureSize: number;

        /**
         * 顶点数组管理器
         */
        private _vertexData: VertexData;

        /**
         * 绘制命令管理器
         */
        public drawCommand: DrawCommand;

        /**
         * 渲染缓冲栈
         * * 最下面的对象为屏幕渲染缓冲, 上层为帧缓冲
         */
        public bufferStack: RenderBuffer[];

        /**
         * 当前绑定的 RenderBuffer
         */
        private _currentBuffer: RenderBuffer;

        /**
         * 当前激活的 RenderBuffer
         */
        public activatedBuffer: RenderBuffer;

        /**
         * 当前使用的渲染程序
         */
        public currentProgram: Program;

        private _bindIndices: boolean;

        private _vertexBuffer: WebGLBuffer;
        private _indexBuffer: WebGLBuffer;

        private _projectionX: number = NaN;
        private _projectionY: number = NaN;

        /**
         * 优化, 实现物体在只有一个变色滤镜的情况下以最简单方式渲染
         */
        public colorMatrixFilter: ColorMatrixFilter;

        public constructor(width?: number, height?: number) {
            this.surface = HtmlUtil.createCanvas(width, height);
            this.initWebGL();
            this.bufferStack = [];
            let gl = this.context;
            this._vertexBuffer = gl.createBuffer();
            this._indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            this.drawCommand = new DrawCommand();
            this._vertexData = new VertexData();
            this.setGlobalCompositeOperation("source-over");
        }

        private initWebGL(): void {
            this.onResize();
            this.surface.addEventListener("webglcontextlost", this.handleContextLost.bind(this), false);
            this.surface.addEventListener("webglcontextrestored", this.handleContextRestored.bind(this), false);
            this.getWebGLContext();
            let gl = this.context;
            this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        }

        private handleContextLost(): void {
            this.contextLost = true;
        }

        private handleContextRestored(): void {
            this.initWebGL();
            this.contextLost = false;
        }

        private getWebGLContext(): void {
            const gl = HtmlUtil.getWebGLContext(this.surface);
            this.setContext(gl);
        }

        private setContext(gl: any): void {
            this.context = gl;
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.BLEND);
            gl.colorMask(true, true, true, true);
            // 目前只使用 0 号材质单元, 默认开启
            gl.activeTexture(gl.TEXTURE0);
        }

        /**
         * 压入一个 RenderBuffer 并绑定为当前的操作缓冲
         */
        public pushBuffer(buffer: RenderBuffer): void {
            this.bufferStack.push(buffer);
            if (buffer != this._currentBuffer) {
                this.drawCommand.pushActivateBuffer(buffer);
            }
            this._currentBuffer = buffer;
        }

        /**
         * 弹出一个 RenderBuffer 并绑定上一个 RenderBuffer 为当前的操作缓冲
         * * 如果只剩下最后一个 RenderBuffer 则不执行操作
         */
        public popBuffer(): void {
            if (this.bufferStack.length <= 1) {
                return;
            }
            let buffer = this.bufferStack.pop();
            let lastBuffer = this.bufferStack[this.bufferStack.length - 1];
            if (buffer != lastBuffer) {
                this.drawCommand.pushActivateBuffer(lastBuffer);
            }
            this._currentBuffer = lastBuffer;
        }

        /**
         * 启用 RenderBuffer
         */
        private activateBuffer(buffer: RenderBuffer, width: number, height: number): void {
            buffer.renderTarget.activate();
            if (!this._bindIndices) {
                this.uploadIndicesArray(this._vertexData.getIndices());
            }
            buffer.restoreStencil();
            buffer.restoreScissor();
            this.onResize(width, height);
        }

        /**
         * 上传顶点数据
         */
        private uploadVerticesArray(array: Float32Array): void {
            let gl = this.context;
            gl.bufferData(gl.ARRAY_BUFFER, array, gl.STREAM_DRAW);
        }

        /**
         * 上传索引数据
         */
        private uploadIndicesArray(array: Uint16Array): void {
            let gl = this.context;
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
            this._bindIndices = true;
        }

        public onResize(width?: number, height?: number): void {
            width = width || this.surface.width;
            height = height || this.surface.height;
            this._projectionX = width / 2;
            this._projectionY = -height / 2;
            if (this.context) {
                this.context.viewport(0, 0, width, height);
            }
        }

        /**
         * 改变渲染缓冲的大小并清空缓冲区
         * @param useMaxSize 是否将改变后的尺寸与已有尺寸对比, 然后保留较大的尺寸
         */
        public resize(width: number, height: number, useMaxSize?: boolean): void {
            HtmlUtil.resizeContext(this, width, height, useMaxSize);
        }

        /**
         * 开启模版检测
         */
        public enableStencilTest(): void {
            let gl = this.context;
            gl.enable(gl.STENCIL_TEST);
        }

        /**
         * 关闭模版检测
         */
        public disableStencilTest(): void {
            let gl = this.context;
            gl.disable(gl.STENCIL_TEST);
        }

        /**
         * 开启 scissor 检测
         */
        public enableScissorTest(rect: Rectangle): void {
            let gl = this.context;
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(rect.x, rect.y, rect.width, rect.height);
        }

        /**
         * 关闭 scissor 检测
         */
        public disableScissorTest(): void {
            let gl = this.context;
            gl.disable(gl.SCISSOR_TEST);
        }

        /**
         * 获取像素信息
         */
        public getPixels(x: number, y: number, width: number, height: number, pixels: ArrayBufferView): void {
            let gl = this.context;
            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        }

        /**
         * 创建一个贴图
         */
        public createTexture(bitmapData: TexImageSource): WebGLTexture {
            return WebGLUtil.createTexture(this, bitmapData);
        }

        /**
         * 更新贴图的图像
         */
        public updateTexture(texture: WebGLTexture, bitmapData: TexImageSource): void {
            let gl = this.context;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData);
        }

        /**
         * 获取 BitmapData 的贴图, 如果不存在则创建一个
         */
        public getTexture(bitmapData: BitmapData): WebGLTexture {
            if (!bitmapData.webGLTexture) {
                bitmapData.webGLTexture = this.createTexture(bitmapData.source);
                if (bitmapData.deleteSource && bitmapData.webGLTexture) {
                    if (bitmapData.source) {
                        bitmapData.source.src = "";
                        bitmapData.source = null;
                    }
                }
                if (bitmapData.webGLTexture) {
                    bitmapData.webGLTexture[sys.smoothing] = true;
                }
            }
            return bitmapData.webGLTexture;
        }

        /**
         * 设置混色
         */
        public setGlobalCompositeOperation(value: string): void {
            this.drawCommand.pushSetBlend(value);
        }

        /**
         * 绘制图片
         */
        public drawImage(image: BitmapData | RenderTarget, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destX: number, destY: number, destWidth: number, destHeight: number, imageSourceWidth: number, imageSourceHeight: number, rotated: boolean, smoothing?: boolean): void {
            let buffer = this._currentBuffer;
            if (this.contextLost || !image || !buffer) {
                return;
            }
            let texture: WebGLTexture;
            let offsetX: number;
            let offsetY: number;
            // 如果是 RenderTarget
            if ((<any>image).texture || ((<any>image).source && (<any>image).source.texture)) {
                texture = (<any>image).texture || (<any>image).source.texture;
                buffer.saveTransform();
                offsetX = buffer.offsetX;
                offsetY = buffer.offsetY;
                buffer.useOffset();
                buffer.transform(1, 0, 0, -1, 0, destHeight + destY * 2);// 翻转
            }
            else if (!(<any>image).source && !(<any>image).webGLTexture) {
                return;
            }
            // 如果是 BitmapData
            else {
                texture = this.getTexture(image as BitmapData);
            }
            if (!texture) {
                return;
            }
            this.drawTexture(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, imageSourceWidth, imageSourceHeight, rotated, smoothing);
            if ((<any>image).source && (<any>image).source.texture) {
                buffer.offsetX = offsetX;
                buffer.offsetY = offsetY;
                buffer.restoreTransform();
            }
        }

        /**
         * 绘制材质
         */
        public drawTexture(texture: WebGLTexture, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destX: number, destY: number, destWidth: number, destHeight: number, textureWidth: number, textureHeight: number, rotated?: boolean, smoothing?: boolean): void {
            let buffer = this._currentBuffer;
            if (this.contextLost || !texture || !buffer) {
                return;
            }
            if (this._vertexData.reachMaxSize()) {
                this.draw();
            }
            if (smoothing != undefined && texture[sys.smoothing] != smoothing) {
                this.drawCommand.pushChangeSmoothing(texture, smoothing);
            }
            // 应用 filter, 因为只可能是 colorMatrixFilter, 最后两个参数可不传
            this.drawCommand.pushDrawTexture(texture, 2, this.colorMatrixFilter, textureWidth, textureHeight);
            buffer.currentTexture = texture;
            this._vertexData.cacheArrays(buffer, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, textureWidth, textureHeight, rotated);
        }

        /**
         * 绘制矩形
         * * 仅用于遮罩擦除等
         */
        public drawRect(x: number, y: number, width: number, height: number): void {
            let buffer = this._currentBuffer;
            if (this.contextLost || !buffer) {
                return;
            }
            if (this._vertexData.reachMaxSize()) {
                this.draw();
            }
            this.drawCommand.pushDrawRect();
            buffer.currentTexture = null;
            this._vertexData.cacheArrays(buffer, 0, 0, width, height, x, y, width, height, width, height);
        }

        /**
         * 绘制遮罩
         */
        public pushMask(x: number, y: number, width: number, height: number): void {
            let buffer = this._currentBuffer;
            if (this.contextLost || !buffer) {
                return;
            }
            buffer.stencilList.push({ x, y, width, height });
            if (this._vertexData.reachMaxSize()) {
                this.draw();
            }
            this.drawCommand.pushPushMask();
            buffer.currentTexture = null;
            this._vertexData.cacheArrays(buffer, 0, 0, width, height, x, y, width, height, width, height);
        }

        /**
         * 恢复遮罩
         */
        public popMask(): void {
            let buffer = this._currentBuffer;
            if (this.contextLost || !buffer) {
                return;
            }
            let mask = buffer.stencilList.pop();
            if (this._vertexData.reachMaxSize()) {
                this.draw();
            }
            this.drawCommand.pushPopMask();
            buffer.currentTexture = null;
            this._vertexData.cacheArrays(buffer, 0, 0, mask.width, mask.height, mask.x, mask.y, mask.width, mask.height, mask.width, mask.height);
        }

        /**
         * 开启 scissor test
         */
        public enableScissor(x: number, y: number, width: number, height: number): void {
            let buffer = this._currentBuffer;
            this.drawCommand.pushEnableScissor(x, y, width, height);
            buffer.hasScissor = true;
        }

        /**
         * 关闭 scissor test
         */
        public disableScissor(): void {
            let buffer = this._currentBuffer;
            this.drawCommand.pushDisableScissor();
            buffer.hasScissor = false;
        }

        /**
         * 执行目前缓存在命令列表里的命令并清空
         */
        public draw(): void {
            if (this.drawCommand.drawDataLen == 0 || this.contextLost) {
                return;
            }
            this.uploadVerticesArray(this._vertexData.getVertices());
            let length = this.drawCommand.drawDataLen;
            let offset = 0;
            for (let i = 0; i < length; i++) {
                let data = this.drawCommand.drawData[i];
                offset = this.drawData(data, offset);
                // 计算 draw call
                if (data.type == DrawableType.actBuffer) {
                    this.activatedBuffer = data.buffer;
                }
                if (data.type == DrawableType.texture || data.type == DrawableType.rect || data.type == DrawableType.pushMask || data.type == DrawableType.popMask) {
                    if (this.activatedBuffer && this.activatedBuffer.computeDrawCall) {
                        this.activatedBuffer.drawCalls++;
                    }
                }
            }
            // 清空数据
            this.drawCommand.clear();
            this._vertexData.clear();
        }

        /**
         * 执行绘制命令
         */
        private drawData(data: IDrawData, offset: number): number {
            if (!data) {
                return;
            }
            let gl = this.context;
            let program: Program;
            let filter = data.filter;
            switch (data.type) {
                case DrawableType.texture:
                    if (filter) {
                        if (filter.type === "custom") {
                            program = Program.getProgram((<CustomFilter>filter).$shaderKey, gl, (<CustomFilter>filter).$vertexSrc, (<CustomFilter>filter).$fragmentSrc);
                        }
                        else if (filter.type === "colorBrush") {
                            program = Program.getProgram("colorBrush", gl, ShaderLib.default_vs, ShaderLib.colorBrush_fs);
                        }
                        else if (filter.type === "colorTransform") {
                            program = Program.getProgram("colorTransform", gl, ShaderLib.default_vs, ShaderLib.colorTransform_fs);
                        }
                        else if (filter.type === "blurX") {
                            program = Program.getProgram("blur", gl, ShaderLib.default_vs, ShaderLib.blur_fs);
                        }
                        else if (filter.type === "blurY") {
                            program = Program.getProgram("blur", gl, ShaderLib.default_vs, ShaderLib.blur_fs);
                        }
                        else if (filter.type === "glow") {
                            program = Program.getProgram("glow", gl, ShaderLib.default_vs, ShaderLib.glow_fs);
                        }
                    }
                    else {
                        program = Program.getProgram("texture", gl, ShaderLib.default_vs, ShaderLib.texture_fs);
                    }
                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                    offset += this.drawTextureElements(data, offset);
                    break;
                case DrawableType.rect:
                    program = Program.getProgram("primitive", gl, ShaderLib.default_vs, ShaderLib.primitive_fs);
                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                    offset += this.drawRectElements(data, offset);
                    break;
                case DrawableType.pushMask:
                    program = Program.getProgram("primitive", gl, ShaderLib.default_vs, ShaderLib.primitive_fs);
                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                    offset += this.drawPushMaskElements(data, offset);
                    break;
                case DrawableType.popMask:
                    program = Program.getProgram("primitive", gl, ShaderLib.default_vs, ShaderLib.primitive_fs);
                    this.activeProgram(gl, program);
                    this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                    offset += this.drawPopMaskElements(data, offset);
                    break;
                case DrawableType.blend:
                    this.setBlendMode(<any>data.value);
                    break;
                case DrawableType.resizeTarget:
                    data.buffer.renderTarget.resize(data.width, data.height);
                    this.onResize(data.width, data.height);
                    break;
                case DrawableType.clearColor:
                    if (this.activatedBuffer) {
                        let target = this.activatedBuffer.renderTarget;
                        if (target.width != 0 || target.height != 0) {
                            target.clear(true);
                        }
                    }
                    break;
                case DrawableType.actBuffer:
                    this.activateBuffer(data.buffer, data.width, data.height);
                    break;
                case DrawableType.enableScissor:
                    let buffer = this.activatedBuffer;
                    if (buffer) {
                        if (buffer.renderTarget) {
                            buffer.renderTarget.enabledStencil();
                        }
                        buffer.enableScissor(data.x, data.y, data.width, data.height);
                    }
                    break;
                case DrawableType.disableScissor:
                    buffer = this.activatedBuffer;
                    if (buffer) {
                        buffer.disableScissor();
                    }
                    break;
                case DrawableType.smoothing:
                    gl.bindTexture(gl.TEXTURE_2D, data.texture);
                    if (data.smoothing) {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    }
                    else {
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    }
                    break;
            }
            return offset;
        }

        /**
         * 激活渲染程序并指定属性格式
         */
        private activeProgram(gl: WebGLRenderingContext, program: Program): void {
            if (program != this.currentProgram) {
                gl.useProgram(program.program);
                // 目前所有 attribute buffer 的绑定方法都是一致的
                let attribute = program.attributes;
                for (let key in attribute) {
                    if (key === "aVertexPosition") {
                        gl.vertexAttribPointer(attribute["aVertexPosition"].location, 2, gl.FLOAT, false, 5 * 4, 0);
                        gl.enableVertexAttribArray(attribute["aVertexPosition"].location);
                    }
                    else if (key === "aTextureCoord") {
                        gl.vertexAttribPointer(attribute["aTextureCoord"].location, 2, gl.FLOAT, false, 5 * 4, 2 * 4);
                        gl.enableVertexAttribArray(attribute["aTextureCoord"].location);
                    }
                    else if (key === "aColor") {
                        gl.vertexAttribPointer(attribute["aColor"].location, 4, gl.UNSIGNED_BYTE, true, 5 * 4, 4 * 4);
                        gl.enableVertexAttribArray(attribute["aColor"].location);
                    }
                }
                this.currentProgram = program;
            }
        }

        /**
         * 提交 Uniform 数据
         */
        private syncUniforms(program: Program, filter: Filter, textureWidth: number, textureHeight: number): void {
            let uniforms = program.uniforms;
            let isCustomFilter = filter && filter.type === "custom";
            for (let key in uniforms) {
                // 用于滤镜 buffer 缩放, 忽略
                if (key == "$filterScale") {
                    continue;
                }
                if (key === "projectionVector") {
                    uniforms[key].setValue({ x: this._projectionX, y: this._projectionY });
                }
                else if (key === "uTextureSize") {
                    uniforms[key].setValue({ x: textureWidth, y: textureHeight });
                }
                else if (key === "uSampler") {
                    uniforms[key].setValue(0);
                }
                else if (key === "uSamplerAlphaMask") {
                    uniforms[key].setValue(1);
                }
                else {
                    let value = filter.$uniforms[key];
                    if (value !== undefined) {
                        if ((filter.type == "glow" || filter.type.indexOf("blur") == 0)) {
                            if ((key == "blurX" || key == "blurY" || key == "dist")) {
                                value = value * (filter.$uniforms.$filterScale || 1);
                            }
                            else if (key == "blur" && value.x != undefined && value.y != undefined) {
                                let newValue = { x: 0, y: 0 };
                                newValue.x = value.x * (filter.$uniforms.$filterScale != undefined ? filter.$uniforms.$filterScale : 1);
                                newValue.y = value.y * (filter.$uniforms.$filterScale != undefined ? filter.$uniforms.$filterScale : 1);
                                uniforms[key].setValue(newValue);
                                continue;
                            }
                        }
                        uniforms[key].setValue(value);
                    }
                    else {
                        if (DEBUG) {
                            console.warn(`自定义滤镜的"uniform": "${key}"未定义`);
                        }
                    }
                }
            }
        }

        /**
         * 绘制贴图
         */
        private drawTextureElements(data: IDrawData, offset: number): number {
            let gl = this.context;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, data.texture);
            let size = data.count * 3;
            gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
            return size;
        }

        /**
         * 绘制矩形
         */
        private drawRectElements(data: IDrawData, offset: number): number {
            let gl = this.context;
            let size = data.count * 3;
            gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
            return size;
        }

        /**
         * 将绘制图像作为一个遮罩进行绘制
         * * 并压入模板缓冲栈, 实际是向模板缓冲渲染新的数据
         */
        private drawPushMaskElements(data: IDrawData, offset: number): number {
            let gl = this.context;
            let size = data.count * 3;
            let buffer = this.activatedBuffer;
            if (buffer) {
                if (buffer.renderTarget) {
                    buffer.renderTarget.enabledStencil();
                }
                if (buffer.stencilHandleCount == 0) {
                    buffer.enableStencil();
                    gl.clear(gl.STENCIL_BUFFER_BIT);
                }
                let level = buffer.stencilHandleCount;
                buffer.stencilHandleCount++;
                gl.colorMask(false, false, false, false);
                gl.stencilFunc(gl.EQUAL, level, 0xFF);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
                gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
                gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                gl.colorMask(true, true, true, true);
                gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            }
            return size;
        }

        /**
         * 将绘制图像作为一个遮罩进行绘制
         * * 并弹出模板缓冲栈， 实际是将模板缓冲渲染为上一次的数据
         */
        private drawPopMaskElements(data: IDrawData, offset: number): number {
            let gl = this.context;
            let size = data.count * 3;
            let buffer = this.activatedBuffer;
            if (buffer) {
                buffer.stencilHandleCount--;
                if (buffer.stencilHandleCount == 0) {
                    buffer.disableStencil();
                }
                else {
                    let level = buffer.stencilHandleCount;
                    gl.colorMask(false, false, false, false);
                    gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
                    gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
                    gl.stencilFunc(gl.EQUAL, level, 0xFF);
                    gl.colorMask(true, true, true, true);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                }
            }
            return size;
        }

        /**
         * 设置混色
         */
        private setBlendMode(value: "source-over" | "lighter" | "lighter-in" | "destination-out" | "destination-in"): void {
            let gl = this.context;
            switch (value) {
                case "source-over":
                    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    break;
                case "lighter":
                    gl.blendFunc(gl.ONE, gl.ONE);
                    break;
                case "lighter-in":
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    break;
                case "destination-out":
                    gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
                    break;
                case "destination-in":
                    gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
                    break;
            }
        }

        /**
         * 应用滤镜绘制给定的 RenderBuffer
         * * 此方法不会导致 input 被释放, 所以如果需要释放 input, 需要调用此方法后手动调用 release
         */
        public drawTargetWidthFilters(filters: Filter[], input: RenderBuffer): void {
            let originInput = input, filtersLen: number = filters.length, output: RenderBuffer;
            // 应用前面的滤镜
            if (filtersLen > 1) {
                for (let i = 0; i < filtersLen - 1; i++) {
                    let filter = filters[i];
                    let width: number = input.renderTarget.width;
                    let height: number = input.renderTarget.height;
                    output = RenderBuffer.get(width, height);
                    const scale = Math.max(DisplayList.canvasScaleFactor, 2);
                    output.setTransform(scale, 0, 0, scale, 0, 0);
                    output.globalAlpha = 1;
                    this.drawToRenderTarget(filter, input, output);
                    if (input != originInput) {
                        RenderBuffer.put(input);
                    }
                    input = output;
                }
            }
            // 应用最后一个滤镜并绘制到当前场景中
            let filter = filters[filtersLen - 1];
            this.drawToRenderTarget(filter, input, this._currentBuffer);
            // 释放掉用于交换的buffer
            if (input != originInput) {
                RenderBuffer.put(input);
            }
        }

        /**
         * 向一个 RenderBuffer 中绘制
         */
        private drawToRenderTarget(filter: Filter, input: RenderBuffer, output: RenderBuffer): void {
            if (this.contextLost) {
                return;
            }
            if (this._vertexData.reachMaxSize()) {
                this.draw();
            }
            this.pushBuffer(output);
            let originInput = input, temp: RenderBuffer, width: number = input.renderTarget.width, height: number = input.renderTarget.height;
            // 模糊滤镜分别处理 blurX 与 blurY, 如果两个方向都设定了模糊量则这里先预先处理 blurX 的模糊, blurY 的模糊加入渲染命令等待后续渲染
            if (filter.type == "blur") {
                let blurXFilter = (<BlurFilter>filter).$blurXFilter;
                let blurYFilter = (<BlurFilter>filter).$blurYFilter;
                if (blurXFilter.blurX != 0 && blurYFilter.blurY != 0) {
                    temp = RenderBuffer.get(width, height);
                    const scale = Math.max(DisplayList.canvasScaleFactor, 2);
                    temp.setTransform(1, 0, 0, 1, 0, 0);
                    temp.transform(scale, 0, 0, scale, 0, 0);
                    temp.globalAlpha = 1;
                    this.drawToRenderTarget((<BlurFilter>filter).$blurXFilter, input, temp);
                    if (input != originInput) {
                        RenderBuffer.put(input);
                    }
                    input = temp;
                    filter = blurYFilter;
                }
                else {
                    filter = blurXFilter.blurX === 0 ? blurYFilter : blurXFilter;
                }
            }
            // 绘制input结果到舞台
            output.saveTransform();
            const scale = Math.max(DisplayList.canvasScaleFactor, 2);
            output.transform(1 / scale, 0, 0, 1 / scale, 0, 0);
            output.transform(1, 0, 0, -1, 0, height);
            output.currentTexture = input.renderTarget.texture;
            this._vertexData.cacheArrays(output, 0, 0, width, height, 0, 0, width, height, width, height);
            output.restoreTransform();
            this.drawCommand.pushDrawTexture(input.renderTarget.texture, 2, filter, width, height);
            // 释放掉input
            if (input != originInput) {
                RenderBuffer.put(input);
            }
            this.popBuffer();
        }

        /**
         * 清除矩形区域
         */
        public clearRect(x: number, y: number, width: number, height: number): void {
            if (x != 0 || y != 0 || width != this.surface.width || height != this.surface.height) {
                let buffer = this._currentBuffer;
                if (buffer.hasScissor) {
                    this.setGlobalCompositeOperation("destination-out");
                    this.drawRect(x, y, width, height);
                    this.setGlobalCompositeOperation("source-over");
                }
                else {
                    let m = buffer.globalMatrix;
                    if (m.b == 0 && m.c == 0) {
                        x = x * m.a + m.tx;
                        y = y * m.d + m.ty;
                        width = width * m.a;
                        height = height * m.d;
                        this.enableScissor(x, - y - height + buffer.height, width, height);
                        this.clear();
                        this.disableScissor();
                    }
                    else {
                        this.setGlobalCompositeOperation("destination-out");
                        this.drawRect(x, y, width, height);
                        this.setGlobalCompositeOperation("source-over");
                    }
                }
            }
            else {
                this.clear();
            }
        }

        /**
         * 清除颜色缓存
         */
        public clear(): void {
            this.drawCommand.pushClearColor();
        }

        /**
         * 销毁绘制对象
         */
        public destroy(): void {
            this.surface.width = this.surface.height = 0;
        }
    }
}
