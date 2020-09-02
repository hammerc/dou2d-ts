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
        let demo = urlParams.demo;
        loadJSAsync("bin/examples/" + demo + ".js", () => {
            new Dou.Engine(examples[demo]);
            new Dou.StatPanel();
        });
    }
}
