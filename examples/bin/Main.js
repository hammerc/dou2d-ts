function loadJS(url) {
    document.writeln(`<script src="${url}"></script>`);
}
function loadAllJS() {
}
function loadJSAsync(src, callback) {
    let s = document.createElement("script");
    s.async = false;
    s.src = src;
    s.addEventListener("load", function () {
        s.parentNode.removeChild(s);
        s.removeEventListener("load", arguments.callee, false);
        callback();
    }, false);
    document.body.appendChild(s);
}
class Main {
    constructor(urlParams) {
        // 注册加载类型解析器
        dou.loader.registerAnalyzer("text" /* text */, new dou.TextAnalyzer());
        dou.loader.registerAnalyzer("json" /* json */, new dou.JsonAnalyzer());
        dou.loader.registerAnalyzer("binary" /* binary */, new dou.BytesAnalyzer());
        dou.loader.registerAnalyzer("sound" /* sound */, new dou.SoundAnalyzer());
        dou.loader.registerAnalyzer("image" /* image */, new dou2d.ImageAnalyzer());
        // 关联文件后缀名到指定类型, 扩展名恰好就是资源类型的情况无需指定
        dou.loader.registerExtension("txt", "text" /* text */);
        dou.loader.registerExtension("json", "json" /* json */);
        dou.loader.registerExtension("bin", "binary" /* binary */);
        dou.loader.registerExtension("mp3", "sound" /* sound */);
        dou.loader.registerExtension("jpg", "image" /* image */);
        dou.loader.registerExtension("jpeg", "image" /* image */);
        dou.loader.registerExtension("png", "image" /* image */);
        let demo = urlParams.demo;
        loadJSAsync("bin/examples/" + demo + ".js", () => {
            new dou2d.Engine(examples[demo]);
        });
    }
}
