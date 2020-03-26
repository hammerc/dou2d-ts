namespace dou2d.rendering {
    /**
     * 绘制指令管理类
     * @author wizardc
     */
    export class DrawCommand {
        /**
         * 用于缓存绘制命令的数组
         */
        public readonly drawData: IDrawData[] = [];

        /**
         * 绘制命令长度
         */
        public drawDataLen = 0;

        /**
         * 压入绘制矩形指令
         */
        public pushDrawRect(): void {
            if (this.drawDataLen == 0 || this.drawData[this.drawDataLen - 1].type != DrawableType.rect) {
                let data = this.drawData[this.drawDataLen] || <IDrawData>{};
                data.type = DrawableType.rect;
                data.count = 0;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            this.drawData[this.drawDataLen - 1].count += 2;
        }

        /**
         * 压入绘制贴图指令
         */
        public pushDrawTexture(texture: WebGLTexture, count: number = 2, filter?: Filter, textureWidth?: number, textureHeight?: number): void {
            // 有滤镜的情况下不能进行合并绘制
            if (filter) {
                let data = this.drawData[this.drawDataLen] || <IDrawData>{};
                data.type = DrawableType.texture;
                data.texture = texture;
                data.filter = filter;
                data.count = count;
                data.textureWidth = textureWidth;
                data.textureHeight = textureHeight;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            else {
                if (this.drawDataLen == 0 || this.drawData[this.drawDataLen - 1].type != DrawableType.texture || texture != this.drawData[this.drawDataLen - 1].texture || this.drawData[this.drawDataLen - 1].filter) {
                    let data = this.drawData[this.drawDataLen] || <IDrawData>{};
                    data.type = DrawableType.texture;
                    data.texture = texture;
                    data.count = 0;
                    this.drawData[this.drawDataLen] = data;
                    this.drawDataLen++;
                }
                this.drawData[this.drawDataLen - 1].count += count;
            }
        }

        /**
         * 贴图绘制的 smoothing 属性改变时需要压入一个新的绘制指令
         */
        public pushChangeSmoothing(texture: WebGLTexture, smoothing: boolean): void {
            texture[sys.SMOOTHING] = smoothing;
            let data = this.drawData[this.drawDataLen] || <IDrawData>{};
            data.type = DrawableType.smoothing;
            data.texture = texture;
            data.smoothing = smoothing;
            this.drawData[this.drawDataLen] = data;
            this.drawDataLen++;
        }

        /**
         * 压入 pushMask 指令
         */
        public pushPushMask(count: number = 1): void {
            let data = this.drawData[this.drawDataLen] || <IDrawData>{};
            data.type = DrawableType.pushMask;
            data.count = count * 2;
            this.drawData[this.drawDataLen] = data;
            this.drawDataLen++;
        }

        /**
         * 压入 popMask 指令
         */
        public pushPopMask(count: number = 1): void {
            let data = this.drawData[this.drawDataLen] || <IDrawData>{};
            data.type = DrawableType.popMask;
            data.count = count * 2;
            this.drawData[this.drawDataLen] = data;
            this.drawDataLen++;
        }

        /**
         * 压入混色指令
         */
        public pushSetBlend(value: string): void {
            let len = this.drawDataLen;
            // 是否遍历到有效绘图操作
            let drawState = false;
            for (let i = len - 1; i >= 0; i--) {
                let data = this.drawData[i];
                if (data) {
                    if (data.type == DrawableType.texture || data.type == DrawableType.rect) {
                        drawState = true;
                    }
                    // 如果与上一次 blend 操作之间无有效绘图则上一次操作无效
                    if (!drawState && data.type == DrawableType.blend) {
                        this.drawData.splice(i, 1);
                        this.drawDataLen--;
                        continue;
                    }
                    // 如果与上一次blend操作重复则本次操作无效
                    if (data.type == DrawableType.blend) {
                        if (data.value == value) {
                            return;
                        } else {
                            break;
                        }
                    }
                }
            }
            let _data = this.drawData[this.drawDataLen] || <IDrawData>{};
            _data.type = DrawableType.blend;
            _data.value = value;
            this.drawData[this.drawDataLen] = _data;
            this.drawDataLen++;
        }

        /**
         * 压入 resize render target 命令
         */
        public pushResize(buffer: RenderBuffer, width: number, height: number): void {
            let data = this.drawData[this.drawDataLen] || <IDrawData>{};
            data.type = DrawableType.resizeTarget;
            data.buffer = buffer;
            data.width = width;
            data.height = height;
            this.drawData[this.drawDataLen] = data;
            this.drawDataLen++;
        }

        /**
         * 压入 clear color 命令
         */
        public pushClearColor(): void {
            let data = this.drawData[this.drawDataLen] || <IDrawData>{};
            data.type = DrawableType.clearColor;
            this.drawData[this.drawDataLen] = data;
            this.drawDataLen++;
        }

        /**
         * 压入激活 buffer 命令
         */
        public pushActivateBuffer(buffer: RenderBuffer): void {
            let len = this.drawDataLen;
            // 有无遍历到有效绘图操作
            let drawState = false;
            for (let i = len - 1; i >= 0; i--) {
                let data = this.drawData[i];
                if (data) {
                    if (data.type != DrawableType.blend && data.type != DrawableType.actBuffer) {
                        drawState = true;
                    }
                    // 如果与上一次 buffer 操作之间无有效绘图则上一次操作无效
                    if (!drawState && data.type == DrawableType.actBuffer) {
                        this.drawData.splice(i, 1);
                        this.drawDataLen--;
                        continue;
                    }
                }
            }
            let _data = this.drawData[this.drawDataLen] || <IDrawData>{};
            _data.type = DrawableType.actBuffer;
            _data.buffer = buffer;
            _data.width = buffer.renderTarget.width;
            _data.height = buffer.renderTarget.height;
            this.drawData[this.drawDataLen] = _data;
            this.drawDataLen++;
        }

        /**
         * 压入 enabel scissor 命令
         */
        public pushEnableScissor(x: number, y: number, width: number, height: number): void {
            let data = this.drawData[this.drawDataLen] || <IDrawData>{};
            data.type = DrawableType.enableScissor;
            data.x = x;
            data.y = y;
            data.width = width;
            data.height = height;
            this.drawData[this.drawDataLen] = data;
            this.drawDataLen++;
        }

        /**
         * 压入 disable scissor 命令
         */
        public pushDisableScissor(): void {
            let data = this.drawData[this.drawDataLen] || <IDrawData>{};
            data.type = DrawableType.disableScissor;
            this.drawData[this.drawDataLen] = data;
            this.drawDataLen++;
        }

        /**
         * 清空命令数组
         */
        public clear(): void {
            for (let i = 0; i < this.drawDataLen; i++) {
                let data = this.drawData[i];
                data.type = 0;
                data.count = 0;
                data.texture = null;
                data.filter = null;
                data.value = "";
                data.buffer = null;
                data.width = 0;
                data.height = 0;
                data.textureWidth = 0;
                data.textureHeight = 0;
                data.smoothing = false;
                data.x = 0;
                data.y = 0;
            }
            this.drawDataLen = 0;
        }
    }
}
