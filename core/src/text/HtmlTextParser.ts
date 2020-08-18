namespace dou2d {
    /**
     * HTML 格式文本解析器
     * @author wizardc
     */
    export namespace HtmlTextParser {
        const headReg: RegExp = /^(color|textcolor|strokecolor|stroke|b|bold|i|italic|u|size|fontfamily|href|target)(\s)*=/;
        const replaceArr: any[] = [
            [/&lt;/g, "<"],
            [/&gt;/g, ">"],
            [/&amp;/g, "&"],
            [/&quot;/g, "\""],
            [/&apos;/g, "\'"]
        ];

        /**
         * 解析 HTML 格式文本
         */
        export function parse(htmltext: string): ITextElement[] {
            let result: ITextElement[] = [];
            let stack: ITextStyle[] = [];
            let firstIdx = 0;
            let length = htmltext.length;
            while (firstIdx < length) {
                let starIdx = htmltext.indexOf("<", firstIdx);
                if (starIdx < 0) {
                    addToResult(htmltext.substring(firstIdx), stack, result);
                    firstIdx = length;
                }
                else {
                    addToResult(htmltext.substring(firstIdx, starIdx), stack, result);
                    let fontEnd = htmltext.indexOf(">", starIdx);
                    if (fontEnd == -1) {
                        console.error(`XML 格式错误`);
                        fontEnd = starIdx;
                    }
                    else if (htmltext.charAt(starIdx + 1) == "\/") {
                        stack.pop();
                    }
                    else {
                        addToStack(htmltext.substring(starIdx + 1, fontEnd), stack);
                    }
                    firstIdx = fontEnd + 1;
                }
            }
            return result;
        }

        function addToResult(value: string, stack: ITextStyle[], result: ITextElement[]): void {
            if (value == "") {
                return;
            }
            value = replaceSpecial(value);
            if (stack.length > 0) {
                result.push({ text: value, style: stack[stack.length - 1] })
            }
            else {
                result.push(<ITextElement>{ text: value });
            }
        }

        function addToStack(infoStr: string, stack: ITextStyle[]): void {
            let info = changeStringToObject(infoStr);
            if (stack.length == 0) {
                stack.push(info);
            }
            else {
                let lastInfo = stack[stack.length - 1];
                for (let key in lastInfo) {
                    if (info[key] == null) {
                        info[key] = lastInfo[key];
                    }
                }
                stack.push(info);
            }
        }

        function changeStringToObject(str: string): ITextStyle {
            str = str.trim();
            let info = {};
            let header = [];
            if (str.charAt(0) == "i" || str.charAt(0) == "b" || str.charAt(0) == "u") {
                addProperty(info, str, "true");
            }
            else if (header = str.match(/^(font|a)\s/)) {
                str = str.substring(header[0].length).trim();
                let next = 0;
                let titles: RegExpMatchArray;
                while (titles = str.match(headReg)) {
                    let title = titles[0];
                    let value = "";
                    str = str.substring(title.length).trim();
                    if (str.charAt(0) == "\"") {
                        next = str.indexOf("\"", 1);
                        value = str.substring(1, next);
                        next += 1;
                    }
                    else if (str.charAt(0) == "\'") {
                        next = str.indexOf("\'", 1);
                        value = str.substring(1, next);
                        next += 1;
                    }
                    else {
                        value = str.match(/(\S)+/)[0];
                        next = value.length;
                    }
                    addProperty(info, title.substring(0, title.length - 1).trim(), value.trim());
                    str = str.substring(next).trim();
                }
            }
            return info;
        }

        function addProperty(info: ITextStyle, head: string, value: string): void {
            switch (head.toLowerCase()) {
                case "color":
                case "textcolor":
                    value = value.replace(/#/, "0x");
                    info.textColor = parseInt(value);
                    break;
                case "strokecolor":
                    value = value.replace(/#/, "0x");
                    info.strokeColor = parseInt(value);
                    break;
                case "stroke":
                    info.stroke = parseInt(value);
                    break;
                case "b":
                case "bold":
                    info.bold = value == "true";
                    break;
                case "u":
                    info.underline = value == "true";
                    break;
                case "i":
                case "italic":
                    info.italic = value == "true";
                    break;
                case "size":
                    info.size = parseInt(value);
                    break;
                case "fontfamily":
                    info.fontFamily = value;
                    break;
                case "href":
                    info.href = replaceSpecial(value);
                    break;
                case "target":
                    info.target = replaceSpecial(value);
                    break;
            }
        }

        function replaceSpecial(value: string): string {
            for (let i = 0; i < replaceArr.length; i++) {
                let k = replaceArr[i][0];
                let v = replaceArr[i][1];
                value = value.replace(k, v);
            }
            return value;
        }
    }
}
