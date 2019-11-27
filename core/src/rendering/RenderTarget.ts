namespace dou2d {
    /**
     * 指定渲染目标
     * * 可以是帧缓冲或者屏幕缓冲
     * @author wizardc
     */
    export class RenderTarget {
        /**
         * 是否使用帧缓冲
         */
        public useFrameBuffer: boolean = true;

        public width: number;
        public height: number;
        public texture: WebGLTexture;
        public clearColor: number[] = [0, 0, 0, 0];

        private _gl: WebGLRenderingContext;
        private _frameBuffer: WebGLFramebuffer;
        private _stencilBuffer: WebGLRenderbuffer;

        public constructor(gl: WebGLRenderingContext, width: number, height: number) {
            this._gl = gl;
            this.setSize(width, height);
        }

        /**
         * 初始化帧缓冲
         */
        public initFrameBuffer(): void {
            if (!this._frameBuffer) {
                let gl = this._gl;
                this.texture = this.createTexture();
                this._frameBuffer = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
            }
        }

        /**
         * 创建空贴图
         */
        private createTexture(): WebGLTexture {
            const webglrendercontext = RenderContext.getInstance();
            return WebGLUtil.createTexture(webglrendercontext, this.width, this.height, null);
        }

        /**
         * 激活当前缓冲
         */
        public activate(): void {
            let gl = this._gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.getFrameBuffer());
        }

        private getFrameBuffer(): WebGLFramebuffer {
            if (!this.useFrameBuffer) {
                return null;
            }
            return this._frameBuffer;
        }

        /**
         * 开启模板缓冲
         */
        public enabledStencil(): void {
            if (!this._frameBuffer || this._stencilBuffer) {
                return;
            }
            // 帧缓冲不为空且模板缓冲为空时
            let gl = this._gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
            this._stencilBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._stencilBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._stencilBuffer);
        }

        public resize(width: number, height: number): void {
            this.setSize(width, height);
            let gl = this._gl;
            if (this._frameBuffer) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            }
            if (this._stencilBuffer) {
                gl.deleteRenderbuffer(this._stencilBuffer);
                this._stencilBuffer = null;
            }
        }

        private setSize(width: number, height: number): void {
            width = width || 1;
            height = height || 1;
            if (width < 1) {
                if (DEBUG) {
                    console.warn('WebGLRenderTarget _resize width = ' + width);
                }
                width = 1;
            }
            if (height < 1) {
                if (DEBUG) {
                    console.warn('WebGLRenderTarget _resize height = ' + height);
                }
                height = 1;
            }
            this.width = width;
            this.height = height;
        }

        public clear(bind?: boolean) {
            let gl = this._gl;
            if (bind) {
                this.activate();
            }
            gl.colorMask(true, true, true, true);
            gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        public dispose(): void {
            WebGLUtil.deleteTexture(this.texture);
        }
    }
}
