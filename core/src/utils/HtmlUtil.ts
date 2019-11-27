namespace dou2d {
    /**
     * HTML 工具类
     * @author wizardc
     */
    export namespace HtmlUtil {
        export function createCanvas(width?: number, height?: number): HTMLCanvasElement {
            let canvas = document.createElement("canvas");
            if (!isNaN(width)) {
                canvas.width = width;
            }
            if (!isNaN(height)) {
                canvas.height = height;
            }
            return canvas;
        }

        export function get2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
            return canvas.getContext("2d");
        }

        export function getWebGLContext(canvas: HTMLCanvasElement, antialias: boolean = false, stencil: boolean = false): WebGLRenderingContext {
            let gl: RenderingContext | WebGLRenderingContext;
            let names = ["webgl", "experimental-webgl"];
            try {
                for (let i = 0; i < names.length; i++) {
                    gl = canvas.getContext(names[i], { antialias, stencil });
                    if (gl) {
                        break;
                    }
                }
            } catch (e) {
            }
            if (!gl) {
                console.log("Nonsupport WebGL!");
            }
            return gl as WebGLRenderingContext;
        }

        export function resizeContext(renderContext: RenderContext, width: number, height: number, useMaxSize?: boolean): void {
            let surface = renderContext.surface;
            if (useMaxSize) {
                if (surface.width < width) {
                    surface.width = width;
                }
                if (surface.height < height) {
                    surface.height = height;
                }
            }
            else {
                if (surface.width !== width) {
                    surface.width = width;
                }
                if (surface.height !== height) {
                    surface.height = height;
                }
            }
            renderContext.onResize();
        }

        /**
         * 测量文本的宽度
         */
        export function measureTextWith(context: CanvasRenderingContext2D, text: string): number {
            return context.measureText(text).width;
        }
    }
}
