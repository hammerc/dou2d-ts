namespace dou2d.rendering {
    /**
     * 显示列表
     * @author wizardc
     */
    export class DisplayList {
        public static canvasScaleFactor: number = 1;

        public static canvasScaleX: number = 1;
        public static canvasScaleY: number = 1;

        /**
         * 创建一个 DisplayList 对象, 若内存不足或无法创建 RenderBuffer, 将会返回 null
         */
        public static create(target: DisplayObject): DisplayList {
            let displayList = new DisplayList(target);
            try {
                let buffer = new RenderBuffer();
                displayList.renderBuffer = buffer;
            }
            catch (e) {
                return null;
            }
            displayList.root = target;
            return displayList;
        }

        public static setCanvasScale(x: number, y: number): void {
            DisplayList.canvasScaleX = x;
            DisplayList.canvasScaleY = y;
        }

        /**
         * 位图渲染节点
         */
        public renderNode: RenderNode;

        public renderBuffer: RenderBuffer;

        public offsetX: number = 0;
        public offsetY: number = 0;

        /**
         * 显示列表根节点
         */
        public root: DisplayObject;

        public canvasScaleX: number = 1;
        public canvasScaleY: number = 1;

        private _isStage: boolean = false;

        private _offsetMatrix: Matrix;

        private _bitmapData: BitmapData;

        public constructor(root: DisplayObject) {
            this.root = root;
            this._isStage = root instanceof Stage;
            this.renderNode = new BitmapNode();
            this._offsetMatrix = new Matrix();
        }

        /**
         * 设置剪裁边界, 不再绘制完整目标对象, 画布尺寸由外部决定, 超过边界的节点将跳过绘制
         */
        public setClipRect(width: number, height: number): void {
            width *= DisplayList.canvasScaleX;
            height *= DisplayList.canvasScaleY;
            this.renderBuffer.resize(width, height);
        }

        /**
         * 绘制根节点显示对象到目标画布, 返回 draw 的次数
         */
        public drawToSurface(): number {
            let drawCalls = 0;
            this.canvasScaleX = this._offsetMatrix.a = DisplayList.canvasScaleX;
            this.canvasScaleY = this._offsetMatrix.d = DisplayList.canvasScaleY;
            // 对非舞台画布要根据目标显示对象尺寸改变而改变
            if (!this._isStage) {
                this.changeSurfaceSize();
            }
            let buffer = this.renderBuffer;
            buffer.clear();
            drawCalls = sys.renderer.render(this.root, buffer, this._offsetMatrix);
            // 对非舞台画布要保存渲染节点
            if (!this._isStage) {
                let surface = buffer.surface;
                let renderNode = <BitmapNode>this.renderNode;
                renderNode.drawData.length = 0;
                let width = surface.width;
                let height = surface.height;
                if (!this._bitmapData) {
                    this._bitmapData = new BitmapData(surface);
                }
                else {
                    this._bitmapData.source = surface;
                    this._bitmapData.width = width;
                    this._bitmapData.height = height;
                }
                renderNode.image = this._bitmapData;
                renderNode.imageWidth = width;
                renderNode.imageHeight = height;
                renderNode.drawImage(0, 0, width, height, -this.offsetX, -this.offsetY, width / this.canvasScaleX, height / this.canvasScaleY);
            }
            return drawCalls;
        }

        /**
         * 改变画布的尺寸, 由于画布尺寸修改会清空原始画布所以这里将原始画布绘制到一个新画布上, 再与原始画布交换
         */
        public changeSurfaceSize(): void {
            let oldOffsetX = this.offsetX;
            let oldOffsetY = this.offsetY;
            let bounds = this.root.$getOriginalBounds();
            let scaleX = this.canvasScaleX;
            let scaleY = this.canvasScaleY;
            this.offsetX = -bounds.x;
            this.offsetY = -bounds.y;
            this._offsetMatrix.set(this._offsetMatrix.a, 0, 0, this._offsetMatrix.d, this.offsetX, this.offsetY);
            let buffer = this.renderBuffer;
            // 在 chrome 里, 小于等于 256 * 256 的 canvas 会不启用 GPU 加速
            let width = Math.max(257, bounds.width * scaleX);
            let height = Math.max(257, bounds.height * scaleY);
            if (this.offsetX == oldOffsetX &&
                this.offsetY == oldOffsetY &&
                buffer.surface.width == width &&
                buffer.surface.height == height) {
                return;
            }
            buffer.resize(width, height);
        }
    }
}
