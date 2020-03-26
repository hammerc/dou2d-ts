namespace dou2d.rendering {
    /**
     * 普通位图渲染节点
     * @author wizardc
     */
    export class NormalBitmapNode extends RenderNode {
        public static updateTextureData(node: NormalBitmapNode, image: BitmapData, bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number, offsetY: number, textureWidth: number, textureHeight: number, destW: number, destH: number, sourceWidth: number, sourceHeight: number, fillMode: string, smoothing: boolean): void {
            if (!image) {
                return;
            }
            let scale = sys.textureScaleFactor;
            node.smoothing = smoothing;
            node.image = image;
            node.imageWidth = sourceWidth;
            node.imageHeight = sourceHeight;
            if (fillMode == BitmapFillMode.scale) {
                let tsX = destW / textureWidth * scale;
                let tsY = destH / textureHeight * scale;
                node.drawImage(bitmapX, bitmapY, bitmapWidth, bitmapHeight, tsX * offsetX, tsY * offsetY, tsX * bitmapWidth, tsY * bitmapHeight);
            }
            else if (fillMode == BitmapFillMode.clip) {
                let displayW = Math.min(textureWidth, destW);
                let displayH = Math.min(textureHeight, destH);
                let scaledBitmapW = bitmapWidth * scale;
                let scaledBitmapH = bitmapHeight * scale;
                NormalBitmapNode.drawClipImage(node, scale, bitmapX, bitmapY, scaledBitmapW, scaledBitmapH, offsetX, offsetY, displayW, displayH);
            }
            else {
                let scaledBitmapW = bitmapWidth * scale;
                let scaledBitmapH = bitmapHeight * scale;
                for (let startX = 0; startX < destW; startX += textureWidth) {
                    for (let startY = 0; startY < destH; startY += textureHeight) {
                        let displayW = Math.min(destW - startX, textureWidth);
                        let displayH = Math.min(destH - startY, textureHeight);
                        NormalBitmapNode.drawClipImage(node, scale, bitmapX, bitmapY, scaledBitmapW, scaledBitmapH, offsetX, offsetY, displayW, displayH, startX, startY);
                    }
                }
            }
        }

        private static drawClipImage(node: NormalBitmapNode, scale: number, bitmapX: number, bitmapY: number, scaledBitmapW: number, scaledBitmapH: number, offsetX: number, offsetY: number, destW: number, destH: number, startX: number = 0, startY: number = 0): void {
            let offset = offsetX + scaledBitmapW - destW;
            if (offset > 0) {
                scaledBitmapW -= offset;
            }
            offset = offsetY + scaledBitmapH - destH;
            if (offset > 0) {
                scaledBitmapH -= offset;
            }
            node.drawImage(bitmapX, bitmapY, scaledBitmapW / scale, scaledBitmapH / scale, startX + offsetX, startY + offsetY, scaledBitmapW, scaledBitmapH);
        }

        /**
         * 要绘制的位图
         */
        public image: BitmapData;

        /**
         * 控制在缩放时是否对位图进行平滑处理
         */
        public smoothing: boolean = true;

        /**
         * 图片宽度
         */
        public imageWidth: number;

        /**
         * 图片高度
         */
        public imageHeight: number;

        /**
         * 翻转
         */
        public rotated: boolean = false;

        public sourceX: number;
        public sourceY: number;
        public sourceW: number;
        public sourceH: number;
        public drawX: number;
        public drawY: number;
        public drawW: number;
        public drawH: number;

        public constructor() {
            super();
            this.type = RenderNodeType.normalBitmapNode;
        }

        /**
         * 绘制一次位图
         */
        public drawImage(sourceX: number, sourceY: number, sourceW: number, sourceH: number, drawX: number, drawY: number, drawW: number, drawH: number): void {
            let self = this;
            self.sourceX = sourceX;
            self.sourceY = sourceY;
            self.sourceW = sourceW;
            self.sourceH = sourceH;
            self.drawX = drawX;
            self.drawY = drawY;
            self.drawW = drawW;
            self.drawH = drawH;
            self._renderCount = 1;
        }

        public cleanBeforeRender(): void {
            super.cleanBeforeRender();
            this.image = null;
        }
    }
}
