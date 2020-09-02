namespace dou2d {
    /**
     * 注册字体
     * * **注意调用该方法前需要提前加载完成字体文件**
     * @param name 字体名称, 设置到 fontFamily 属性上
     * @param path 字体文件的完整路径
     */
    export function registerFontMapping(name: string, path: string): void {
        if ((<any>window).FontFace) {
            loadFontByFontFace(name, path);
        }
        else {
            loadFontByWebStyle(name, path);
        }
    }

    function loadFontByFontFace(name: string, path: string): void {
        let fontResCache = sys.fontResMap;
        if (!fontResCache[path]) {
            if (DEBUG) {
                console.warn(`TTF字体"${path}"没有加载`);
            }
            return;
        }
        let resCache = fontResCache[path];
        let fontFace = new (window as any).FontFace(name, resCache);
        (<any>document).fonts.add(fontFace);
        fontFace.load().catch((err) => {
            console.error(`TTF字体加载错误: ${err}`);
        });
    };

    function loadFontByWebStyle(name: string, path: string): void {
        let styleElement = document.createElement("style");
        styleElement.type = "text/css";
        styleElement.textContent = `
            @font-face
            {
                font-family: "${name}";
                src: url("${path}");
            }`;
        styleElement.onerror = (err) => {
            console.error(`TTF字体加载错误: ${err}`);
        };
        document.body.appendChild(styleElement);
    }

    export namespace sys {
        export let fontResMap: { [name: string]: ArrayBuffer } = {};
    }
}
