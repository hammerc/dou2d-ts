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
        let demo = urlParams.demo;
        loadJSAsync("bin/examples/" + demo + ".js", () => {
            new Dou.Engine(examples[demo]);
            new Dou.StatPanel();
        });
    }
}
