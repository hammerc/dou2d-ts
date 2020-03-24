function loadJS(url: string): void {
    document.writeln(`<script src="${url}"></script>`);
}

function loadAllJS(): void {
}

function loadJSAsync(src: string, callback: () => void): void {
    let s = document.createElement("script");
    s.async = false;
    s.src = src;
    s.addEventListener("load", function () {
        s.parentNode.removeChild(s);
        s.removeEventListener("load", <any>arguments.callee, false);
        callback();
    }, false);
    document.body.appendChild(s);
}

class Main {
    public constructor(urlParams: { [key: string]: string }) {
        // 注册加载类型解析器
        dou.loader.registerAnalyzer(ResourceType.text, new dou.TextAnalyzer());
        dou.loader.registerAnalyzer(ResourceType.json, new dou.JsonAnalyzer());
        dou.loader.registerAnalyzer(ResourceType.binary, new dou.BytesAnalyzer());
        // 关联文件后缀名到指定类型, 扩展名恰好就是资源类型的情况无需指定
        dou.loader.registerExtension("txt", ResourceType.text);
        dou.loader.registerExtension("json", ResourceType.json);
        dou.loader.registerExtension("bin", ResourceType.binary);

        let demo = urlParams.demo;
        loadJSAsync("bin/examples/" + demo + ".js", () => {
            new dou2d.Engine(examples[demo]);
        });
    }
}
