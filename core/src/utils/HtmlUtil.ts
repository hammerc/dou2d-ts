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
                console.error(`当前设备不支持 WebGL`);
            }
            return gl as WebGLRenderingContext;
        }

        export function resizeContext(renderContext: rendering.RenderContext, width: number, height: number, useMaxSize?: boolean): void {
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
         * 根据样式测量指定样式文本的宽度
         */
        export function measureTextByStyle(text: string, values: any, style?: ITextStyle): number {
            style = style || <ITextStyle>{};
            let italic: boolean = !style.italic ? values[sys.TextKeys.italic] : style.italic;
            let bold: boolean = !style.bold ? values[sys.TextKeys.bold] : style.bold;
            let size: number = !style.size ? values[sys.TextKeys.fontSize] : style.size;
            let fontFamily: string = style.fontFamily || values[sys.TextKeys.fontFamily] || TextField.default_fontFamily;
            return HtmlUtil.measureText(text, fontFamily, size, bold, italic);
        }

        /**
         * 测量指定样式文本的宽度
         */
        export function measureText(text: string, fontFamily: string, fontSize: number, bold: boolean, italic: boolean): number {
            let font: string = "";
            if (italic) {
                font += "italic ";
            }
            if (bold) {
                font += "bold ";
            }
            font += (fontSize || 12) + "px ";
            font += (fontFamily || "Arial");
            sys.context2D.font = font;
            return measureTextWidth(sys.context2D, text);
        }

        /**
         * 测量文本的宽度
         */
        export function measureTextWidth(context: CanvasRenderingContext2D, text: string): number {
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

        export function getFontString(node: rendering.TextNode, format: rendering.TextFormat): string {
            let italic: boolean = format.italic == null ? node.italic : format.italic;
            let bold: boolean = format.bold == null ? node.bold : format.bold;
            let size: number = format.size == null ? node.size : format.size;
            let fontFamily: string = format.fontFamily || node.fontFamily;
            let font: string = italic ? "italic " : "normal ";
            font += bold ? "bold " : "normal ";
            font += size + "px " + fontFamily;
            return font;
        }

        export function toColorString(value: number): string {
            if (value < 0) {
                value = 0;
            }
            if (value > 16777215) {
                value = 16777215;
            }
            let color = value.toString(16).toUpperCase();
            while (color.length > 6) {
                color = color.slice(1, color.length);
            }
            while (color.length < 6) {
                color = "0" + color;
            }
            return "#" + color;
        }

        export function getRelativePath(url: string, fileName: string): string {
            if (fileName.indexOf("://") != -1) {
                return fileName;
            }
            url = url.split("\\").join("/");
            var params = url.match(/#.*|\?.*/);
            var paramUrl = "";
            if (params) {
                paramUrl = params[0];
            }
            var index = url.lastIndexOf("/");
            if (index != -1) {
                url = url.substring(0, index + 1) + fileName;
            }
            else {
                url = fileName;
            }
            return url + paramUrl;
        }
    }
}
