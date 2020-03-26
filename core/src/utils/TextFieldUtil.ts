namespace dou2d {
    /**
     * 文本工具类
     * @author wizardc
     */
    export namespace TextFieldUtil {
        /**
         * 获取第一行绘制的行数, 从 0 开始
         */
        export function getStartLine(textfield: TextField): number {
            let values = textfield.$propertyMap;
            let textHeight = TextFieldUtil.getTextHeight(textfield);
            let startLine = 0;
            let textFieldHeight: number = values[sys.TextKeys.textFieldHeight];
            if (!isNaN(textFieldHeight)) {
                // 最大高度比需要显示的高度小
                if (textHeight < textFieldHeight) {
                }
                // 最大高度比需要显示的高度大
                else if (textHeight > textFieldHeight) {
                    startLine = Math.max(values[sys.TextKeys.scrollV] - 1, 0);
                    startLine = Math.min(values[sys.TextKeys.numLines] - 1, startLine);
                }
                if (!values[sys.TextKeys.multiline]) {
                    startLine = Math.max(values[sys.TextKeys.scrollV] - 1, 0);
                    if (values[sys.TextKeys.numLines] > 0) {
                        startLine = Math.min(values[sys.TextKeys.numLines] - 1, startLine);
                    }
                }
            }
            return startLine;
        }

        /**
         * 获取水平比例
         */
        export function getHalign(textfield: TextField): number {
            let lineArr = textfield.$getLinesArr();
            let halign = 0;
            if (textfield.$propertyMap[sys.TextKeys.textAlign] == HorizontalAlign.center) {
                halign = 0.5;
            }
            else if (textfield.$propertyMap[sys.TextKeys.textAlign] == HorizontalAlign.right) {
                halign = 1;
            }
            if (textfield.$propertyMap[sys.TextKeys.type] == TextFieldType.input && !textfield.$propertyMap[sys.TextKeys.multiline] && lineArr.length > 1) {
                halign = 0;
            }
            return halign;
        }

        /**
         * 获取文本高度
         */
        export function getTextHeight(textfield: TextField): number {
            if (TextFieldType.input == textfield.$propertyMap[sys.TextKeys.type] && !textfield.$propertyMap[sys.TextKeys.multiline]) {
                return textfield.$propertyMap[sys.TextKeys.fontSize]
            }
            return textfield.$propertyMap[sys.TextKeys.textHeight] + (textfield.$propertyMap[sys.TextKeys.numLines] - 1) * textfield.$propertyMap[sys.TextKeys.lineSpacing]
        }

        /**
         * 获取垂直比例
         */
        export function getValign(textfield: TextField): number {
            let textHeight = TextFieldUtil.getTextHeight(textfield);
            let textFieldHeight: number = textfield.$propertyMap[sys.TextKeys.textFieldHeight];
            if (!isNaN(textFieldHeight)) {
                // 最大高度比需要显示的高度小
                if (textHeight < textFieldHeight) {
                    let valign = 0;
                    if (textfield.$propertyMap[sys.TextKeys.verticalAlign] == VerticalAlign.middle) {
                        valign = 0.5;
                    }
                    else if (textfield.$propertyMap[sys.TextKeys.verticalAlign] == VerticalAlign.bottom) {
                        valign = 1;
                    }
                    return valign;
                }
            }
            return 0;
        }

        /**
         * 根据坐标获取文本项
         */
        export function getTextElement(textfield: TextField, x: number, y: number): ITextElement {
            let hitTextEle = TextFieldUtil.getHit(textfield, x, y);
            let lineArr = textfield.$getLinesArr();
            if (hitTextEle && lineArr[hitTextEle.lineIndex] && lineArr[hitTextEle.lineIndex].elements[hitTextEle.textElementIndex]) {
                return lineArr[hitTextEle.lineIndex].elements[hitTextEle.textElementIndex];
            }
            return null;
        }

        /**
         * 获取文本点击块
         */
        export function getHit(textfield: TextField, x: number, y: number): IHitTextElement {
            let lineArr = textfield.$getLinesArr();
            // 文本可点击区域
            if (textfield.$propertyMap[sys.TextKeys.textFieldWidth] == 0) {
                return null;
            }
            let line = 0;
            let textHeight = TextFieldUtil.getTextHeight(textfield);
            let startY = 0;
            let textFieldHeight = textfield.$propertyMap[sys.TextKeys.textFieldHeight];
            if (!isNaN(textFieldHeight) && textFieldHeight > textHeight) {
                let valign = TextFieldUtil.getValign(textfield);
                startY = valign * (textFieldHeight - textHeight);
                if (startY != 0) {
                    y -= startY;
                }
            }
            let startLine = TextFieldUtil.getStartLine(textfield);
            let lineH = 0;
            for (let i = startLine; i < lineArr.length; i++) {
                let lineEle = lineArr[i];
                if (lineH + lineEle.height >= y) {
                    if (lineH < y) {
                        line = i + 1;
                    }
                    break;
                }
                else {
                    lineH += lineEle.height;
                }
                if (lineH + textfield.$propertyMap[sys.TextKeys.lineSpacing] > y) {
                    return null;
                }
                lineH += textfield.$propertyMap[sys.TextKeys.lineSpacing];
            }
            if (line == 0) {
                return null;
            }
            let lineElement = lineArr[line - 1];
            let textFieldWidth = textfield.$propertyMap[sys.TextKeys.textFieldWidth];
            if (isNaN(textFieldWidth)) {
                textFieldWidth = textfield.textWidth;
            }
            let halign = TextFieldUtil.getHalign(textfield);
            x -= halign * (textFieldWidth - lineElement.width);
            let lineW = 0;
            for (let i = 0; i < lineElement.elements.length; i++) {
                let iwTE = lineElement.elements[i];
                if (lineW + iwTE.width <= x) {
                    lineW += iwTE.width;
                }
                else if (lineW < x) {
                    return { lineIndex: line - 1, textElementIndex: i };
                }
            }
            return null;
        }

        /**
         * 获取当前显示多少行
         */
        export function getScrollNum(textfield: TextField): number {
            let scrollNum = 1;
            if (textfield.$propertyMap[sys.TextKeys.multiline]) {
                let height = textfield.height;
                let size = textfield.size;
                let lineSpacing = textfield.lineSpacing;
                scrollNum = Math.floor(height / (size + lineSpacing));
                let leftH = height - (size + lineSpacing) * scrollNum;
                if (leftH > size / 2) {
                    scrollNum++;
                }
            }
            return scrollNum;
        }
    }
}
