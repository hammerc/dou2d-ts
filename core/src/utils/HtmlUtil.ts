namespace dou2d {
    /**
     * HTML 工具类
     * @author wizardc
     */
    export namespace HtmlUtil {
        let currentPrefix: string;

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
            }
            catch (e) {
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

        /**
         * 获取样式属性的名称, 兼容多个浏览器
         */
        export function getStyleName(name: string, element?: any): string {
            let header = "";
            if (element) {
                header = getPrefix(name, element);
            }
            else {
                if (!currentPrefix) {
                    let tempStyle = document.createElement("div").style;
                    currentPrefix = getPrefix("transform", tempStyle);
                }
                header = currentPrefix;
            }
            if (header == "") {
                return name;
            }
            return header + name.charAt(0).toUpperCase() + name.substring(1, name.length);
        }

        function getPrefix(name: string, element: any): string {
            if (name in element) {
                return "";
            }
            name = name.charAt(0).toUpperCase() + name.substring(1, name.length);
            let transArr: string[] = ["webkit", "ms", "Moz", "O"];
            for (let i = 0; i < transArr.length; i++) {
                let tempStyle = transArr[i] + name;
                if (tempStyle in element) {
                    return transArr[i];
                }
            }
            return "";
        }
    }
}
