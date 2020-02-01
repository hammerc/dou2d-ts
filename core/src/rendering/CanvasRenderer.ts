namespace dou2d {
    /**
     * 画布渲染类
     * @author wizardc
     */
    export class CanvasRenderer {
        public renderText(node: TextNode, context: CanvasRenderingContext2D): void {
            context.textAlign = "left";
            context.textBaseline = "middle";
            context.lineJoin = "round";//确保描边样式是圆角
            let drawData = node.drawData;
            let length = drawData.length;
            let pos = 0;
            while (pos < length) {
                let x = drawData[pos++];
                let y = drawData[pos++];
                let text = drawData[pos++];
                let format: TextFormat = drawData[pos++];
                context.font = this.getFontString(node, format);
                let textColor = format.textColor == null ? node.textColor : format.textColor;
                let strokeColor = format.strokeColor == null ? node.strokeColor : format.strokeColor;
                let stroke = format.stroke == null ? node.stroke : format.stroke;
                context.fillStyle = toColorString(textColor);
                context.strokeStyle = toColorString(strokeColor);
                if (stroke) {
                    context.lineWidth = stroke * 2;
                    context.strokeText(text, x + context.$offsetX, y + context.$offsetY);
                }
                context.fillText(text, x + context.$offsetX, y + context.$offsetY);
            }
        }

        private getFontString(node: TextNode, format: TextFormat): string {
            let italic: boolean = format.italic == null ? node.italic : format.italic;
            let bold: boolean = format.bold == null ? node.bold : format.bold;
            let size: number = format.size == null ? node.size : format.size;
            let fontFamily: string = format.fontFamily || node.fontFamily;
            let font: string = italic ? "italic " : "normal ";
            font += bold ? "bold " : "normal ";
            font += size + "px " + fontFamily;
            return font;
        }

        public renderGraphics(node: GraphicsNode, context: CanvasRenderingContext2D): number {
            let drawData = node.drawData;
            let length = drawData.length;
            for (let i = 0; i < length; i++) {
                let path: Path2D = drawData[i];
                switch (path.type) {
                    case PathType.fill:
                        let fillPath = <FillPath>path;
                        context.fillStyle = this.getRGBAString(fillPath.fillColor, fillPath.fillAlpha);
                        this.renderPath(path, context);
                        if (this.renderingMask) {
                            context.clip();
                        }
                        else {
                            context.fill();
                        }
                        break;
                    case PathType.gradientFill:
                        let g = <GradientFillPath>path;
                        context.fillStyle = this.getGradient(context, g.gradientType, g.colors, g.alphas, g.ratios, g.matrix);
                        context.save();
                        let m = g.matrix;
                        this.renderPath(path, context);
                        context.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                        context.fill();
                        context.restore();
                        break;
                    case PathType.stroke:
                        let strokeFill = <StrokePath>path;
                        let lineWidth = strokeFill.lineWidth;
                        context.lineWidth = lineWidth;
                        context.strokeStyle = this.getRGBAString(strokeFill.lineColor, strokeFill.lineAlpha);
                        context.lineCap = CAPS_STYLES[strokeFill.caps];
                        context.lineJoin = strokeFill.joints;
                        context.miterLimit = strokeFill.miterLimit;
                        if (context.setLineDash) {
                            context.setLineDash(strokeFill.lineDash);
                        }
                        //对1像素和3像素特殊处理，向右下角偏移0.5像素，以显示清晰锐利的线条。
                        let isSpecialCaseWidth = lineWidth === 1 || lineWidth === 3;
                        if (isSpecialCaseWidth) {
                            context.translate(0.5, 0.5);
                        }
                        this.renderPath(path, context);
                        context.stroke();
                        if (isSpecialCaseWidth) {
                            context.translate(-0.5, -0.5);
                        }
                        break;
                }
            }
            return length == 0 ? 0 : 1;
        }

        private getRGBAString(color: number, alpha: number): string {
            let red = color >> 16;
            let green = (color >> 8) & 0xFF;
            let blue = color & 0xFF;
            return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
        }

        private getGradient(context: CanvasRenderingContext2D, type: string, colors: number[],
            alphas: number[], ratios: number[], matrix: Matrix): CanvasGradient {
            let gradient: CanvasGradient;
            if (type == GradientType.linear) {
                gradient = context.createLinearGradient(-1, 0, 1, 0);
            }
            else {
                gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
            }
            //todo colors alphas ratios数量不一致情况处理
            let l = colors.length;
            for (let i = 0; i < l; i++) {
                gradient.addColorStop(ratios[i] / 255, this.getRGBAString(colors[i], alphas[i]));
            }
            return gradient;
        }

        private renderPath(path: Path2D, context: CanvasRenderingContext2D): void {
            context.beginPath();
            let data = path.$data;
            let commands = path.$commands;
            let commandCount = commands.length;
            let pos = 0;
            for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
                let command = commands[commandIndex];
                switch (command) {
                    case PathCommand.cubicCurveTo:
                        context.bezierCurveTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY, data[pos++] + context.$offsetX, data[pos++] + context.$offsetY, data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                        break;
                    case PathCommand.curveTo:
                        context.quadraticCurveTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY, data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                        break;
                    case PathCommand.lineTo:
                        context.lineTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                        break;
                    case PathCommand.moveTo:
                        context.moveTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                        break;
                }
            }
        }
    }
}
