namespace dou2d.rendering {
    /**
     * 位图渲染节点
     * @author wizardc
     */
    export class BitmapNode extends RenderNode {
        /**
         * 绘制九宫格位图
         */
        public static updateTextureDataWithScale9Grid(node: BitmapNode, image: BitmapData, scale9Grid: Rectangle, bitmapX: number, bitmapY: number, bitmapWidth: number, bitmapHeight: number, offsetX: number, offsetY: number, textureWidth: number, textureHeight: number, destW: number, destH: number, sourceWidth: number, sourceHeight: number, smoothing: boolean): void {
            node.smoothing = smoothing;
            node.image = image;
            node.imageWidth = sourceWidth;
            node.imageHeight = sourceHeight;
            let imageWidth = bitmapWidth;
            let imageHeight = bitmapHeight;
            destW = destW - (textureWidth - bitmapWidth * $2d.textureScaleFactor);
            destH = destH - (textureHeight - bitmapHeight * $2d.textureScaleFactor);
            let targetW0 = scale9Grid.x - offsetX;
            let targetH0 = scale9Grid.y - offsetY;
            let sourceW0 = targetW0 / $2d.textureScaleFactor;
            let sourceH0 = targetH0 / $2d.textureScaleFactor;
            let sourceW1 = scale9Grid.width / $2d.textureScaleFactor;
            let sourceH1 = scale9Grid.height / $2d.textureScaleFactor;
            // 防止空心的情况出现
            if (sourceH1 == 0) {
                sourceH1 = 1;
                if (sourceH0 >= imageHeight) {
                    sourceH0--;
                }
            }
            if (sourceW1 == 0) {
                sourceW1 = 1;
                if (sourceW0 >= imageWidth) {
                    sourceW0--;
                }
            }
            let sourceX0 = bitmapX;
            let sourceX1 = sourceX0 + sourceW0;
            let sourceX2 = sourceX1 + sourceW1;
            let sourceW2 = imageWidth - sourceW0 - sourceW1;
            let sourceY0 = bitmapY;
            let sourceY1 = sourceY0 + sourceH0;
            let sourceY2 = sourceY1 + sourceH1;
            let sourceH2 = imageHeight - sourceH0 - sourceH1;
            let targetW2 = sourceW2 * $2d.textureScaleFactor;
            let targetH2 = sourceH2 * $2d.textureScaleFactor;
            if ((sourceW0 + sourceW2) * $2d.textureScaleFactor > destW || (sourceH0 + sourceH2) * $2d.textureScaleFactor > destH) {
                node.drawImage(bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, destW, destH);
                return;
            }
            let targetX0 = offsetX;
            let targetX1 = targetX0 + targetW0;
            let targetX2 = targetX0 + (destW - targetW2);
            let targetW1 = destW - targetW0 - targetW2;
            let targetY0 = offsetY;
            let targetY1 = targetY0 + targetH0;
            let targetY2 = targetY0 + destH - targetH2;
            let targetH1 = destH - targetH0 - targetH2;
            //
            //             x0     x1     x2
            //          y0 +------+------+------+
            //             |      |      |      | h0
            //             |      |      |      |
            //          y1 +------+------+------+
            //             |      |      |      | h1
            //             |      |      |      |
            //          y2 +------+------+------+
            //             |      |      |      | h2
            //             |      |      |      |
            //             +------+------+------+
            //                w0     w1     w2
            //
            if (sourceH0 > 0) {
                if (sourceW0 > 0) {
                    node.drawImage(sourceX0, sourceY0, sourceW0, sourceH0, targetX0, targetY0, targetW0, targetH0);
                }
                if (sourceW1 > 0) {
                    node.drawImage(sourceX1, sourceY0, sourceW1, sourceH0, targetX1, targetY0, targetW1, targetH0);
                }
                if (sourceW2 > 0) {
                    node.drawImage(sourceX2, sourceY0, sourceW2, sourceH0, targetX2, targetY0, targetW2, targetH0);
                }
            }
            if (sourceH1 > 0) {
                if (sourceW0 > 0) {
                    node.drawImage(sourceX0, sourceY1, sourceW0, sourceH1, targetX0, targetY1, targetW0, targetH1);
                }
                if (sourceW1 > 0) {
                    node.drawImage(sourceX1, sourceY1, sourceW1, sourceH1, targetX1, targetY1, targetW1, targetH1);
                }
                if (sourceW2 > 0) {
                    node.drawImage(sourceX2, sourceY1, sourceW2, sourceH1, targetX2, targetY1, targetW2, targetH1);
                }
            }
            if (sourceH2 > 0) {
                if (sourceW0 > 0) {
                    node.drawImage(sourceX0, sourceY2, sourceW0, sourceH2, targetX0, targetY2, targetW0, targetH2);
                }
                if (sourceW1 > 0) {
                    node.drawImage(sourceX1, sourceY2, sourceW1, sourceH2, targetX1, targetY2, targetW1, targetH2);
                }
                if (sourceW2 > 0) {
                    node.drawImage(sourceX2, sourceY2, sourceW2, sourceH2, targetX2, targetY2, targetW2, targetH2);
                }
            }
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
         * 相对偏移矩阵
         */
        public matrix: Matrix;

        /**
         * 图片宽度
         */
        public imageWidth: number;

        /**
         * 图片高度
         */
        public imageHeight: number;

        /**
         * 使用的混合模式
         */
        public blendMode: number;

        /**
         * 相对透明度
         */
        public alpha: number;

        /**
         * 颜色变换滤镜
         */
        public filter: ColorMatrixFilter;

        /**
         * 翻转
         */
        public rotated: boolean = false;

        public constructor() {
            super();
            this.type = RenderNodeType.bitmapNode;
        }

        /**
         * 绘制一次位图
         */
        public drawImage(sourceX: number, sourceY: number, sourceW: number, sourceH: number, drawX: number, drawY: number, drawW: number, drawH: number): void {
            this.drawData.push(sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH);
            this._renderCount++;
        }

        public cleanBeforeRender(): void {
            super.cleanBeforeRender();
            this.image = null;
            this.matrix = null;
            this.blendMode = null;
            this.alpha = NaN;
            this.filter = null;
        }
    }
}
