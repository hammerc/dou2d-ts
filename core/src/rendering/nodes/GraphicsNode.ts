namespace dou2d {
    export let CAPS_STYLES = ["none", "round", "square"];
    export let JOINT_STYLES = ["bevel", "miter", "round"];

    /**
     * 矢量渲染节点
     * @author wizardc
     */
    export class GraphicsNode extends RenderNode {
        /**
         * 绘制 x 偏移
         */
        public x: number;

        /**
         * 绘制 y 偏移
         */
        public y: number;

        /**
         * 绘制宽度
         */
        public width: number;

        /**
         * 绘制高度
         */
        public height: number;

        /**
         * 脏渲染标记
         */
        public dirtyRender: boolean = true;

        public texture: WebGLTexture;
        public textureWidth: number;
        public textureHeight: number;
        public canvasScaleX: number;
        public canvasScaleY: number;

        public constructor() {
            super();
            this.type = RenderNodeType.graphicsNode;
        }

        /**
         * 指定一种简单的单一颜色填充
         * @param beforePath 插入在指定的路径命令之前绘制, 通常是插入到当前正在绘制的线条路径之前, 以确保线条总在填充的上方
         */
        public beginFill(color: number, alpha: number = 1, beforePath?: Path2D): Path2D {
            let path = new FillPath();
            path.fillColor = color;
            path.fillAlpha = alpha;
            if (beforePath) {
                let index = this.drawData.lastIndexOf(beforePath);
                this.drawData.splice(index, 0, path);
            }
            else {
                this.drawData.push(path);
            }
            this._renderCount++;
            return path;
        }

        /**
         * 指定渐变色颜色填充
         * @param beforePath 插入在指定的路径命令之前绘制, 通常是插入到当前正在绘制的线条路径之前, 以确保线条总在填充的上方
         */
        public beginGradientFill(type: GradientType, colors: number[], alphas: number[], ratios: number[], matrix?: Matrix, beforePath?: Path2D): Path2D {
            let m = new Matrix();
            if (matrix) {
                m.a = matrix.a * 819.2;
                m.b = matrix.b * 819.2;
                m.c = matrix.c * 819.2;
                m.d = matrix.d * 819.2;
                m.tx = matrix.tx;
                m.ty = matrix.ty;
            }
            else {
                // 默认值
                m.a = 100;
                m.d = 100;
            }
            let path = new GradientFillPath();
            path.gradientType = type;
            path.colors = colors;
            path.alphas = alphas;
            path.ratios = ratios;
            path.matrix = m;
            if (beforePath) {
                let index = this.drawData.lastIndexOf(beforePath);
                this.drawData.splice(index, 0, path);
            }
            else {
                this.drawData.push(path);
            }
            this._renderCount++;
            return path;
        }

        /**
         * 指定一种线条样式
         */
        public lineStyle(thickness?: number, color?: number, alpha: number = 1, caps?: string, joints?: string, miterLimit: number = 3, lineDash: number[] = []): StrokePath {
            if (CAPS_STYLES.indexOf(caps) == -1) {
                caps = "round";
            }
            if (JOINT_STYLES.indexOf(joints) == -1) {
                joints = "round";
            }
            let path = new StrokePath();
            path.lineWidth = thickness;
            path.lineColor = color;
            path.lineAlpha = alpha;
            path.caps = caps || CapsStyle.round;
            path.joints = joints;
            path.miterLimit = miterLimit;
            path.lineDash = lineDash;
            this.drawData.push(path);
            this._renderCount++;
            return path;
        }

        /**
         * 覆盖父类方法, 不自动清空缓存的绘图数据, 改为手动调用 clear 方法清空
         */
        public cleanBeforeRender(): void {
        }

        /**
         * 清空所有缓存的绘制数据
         */
        public clear(): void {
            this.drawData.length = 0;
            this.dirtyRender = true;
            this._renderCount = 0;
        }

        /**
         * 清除非绘制的缓存数据
         */
        public clean(): void {
            if (this.texture) {
                WebGLUtil.deleteTexture(this.texture);
                this.texture = null;
                this.dirtyRender = true;
            }
        }
    }
}
