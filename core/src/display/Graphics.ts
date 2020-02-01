namespace dou2d {
    /**
     * 绘制矢量形状类
     * @author wizardc
     */
    export class Graphics {
        private _renderNode: GraphicsNode;
        private _targetDisplay: DisplayObject;

        /**
         * 当前移动到的坐标 x
         */
        private _lastX: number = 0;

        /**
         * 当前移动到的坐标 y
         */
        private _lastY: number = 0;

        /**
         * 当前正在绘制的填充
         */
        private _fillPath: Path2D;

        /**
         * 当前正在绘制的线条
         */
        private _strokePath: StrokePath;

        /**
         * 线条的左上方宽度
         */
        private _topLeftStrokeWidth = 0;

        /**
         * 线条的右下方宽度
         */
        private _bottomRightStrokeWidth = 0;

        public constructor() {
            this._renderNode = new GraphicsNode();
        }

        /**
         * 设置绑定到的目标显示对象
         */
        public $setTarget(target: DisplayObject): void {
            if (this._targetDisplay) {
                this._targetDisplay.$renderNode = null;
            }
            target.$renderNode = this._renderNode;
            this._targetDisplay = target;
        }

        /**
         * 对 1 像素和 3 像素特殊处理, 向右下角偏移 0.5 像素, 以显示清晰锐利的线条
         */
        private setStrokeWidth(width: number) {
            switch (width) {
                case 1:
                    this._topLeftStrokeWidth = 0;
                    this._bottomRightStrokeWidth = 1;
                    break;
                case 3:
                    this._topLeftStrokeWidth = 1;
                    this._bottomRightStrokeWidth = 2;
                    break;
                default:
                    let half = Math.ceil(width * 0.5) | 0;
                    this._topLeftStrokeWidth = half;
                    this._bottomRightStrokeWidth = half;
                    break;
            }
        }

        /**
         * 设定单一颜色填充, 调用 clear 方法会清除填充
         */
        public beginFill(color: number, alpha: number = 1): void {
            color = +color || 0;
            alpha = +alpha || 0;
            this._fillPath = this._renderNode.beginFill(color, alpha, this._strokePath);
            if (this._renderNode.drawData.length > 1) {
                this._fillPath.moveTo(this._lastX, this._lastY);
            }
        }

        /**
         * 设定渐变填充, 调用 clear 方法会清除填充
         * @param type 渐变类型
         * @param colors 渐变中使用的颜色值的数组, 对于每种颜色请在 alphas 和 ratios 参数中指定对应值
         * @param alphas colors 数组中对应颜色的 alpha 值
         * @param ratios 颜色分布比率的数组, 有效值为 0 到 255
         * @param matrix 转换矩阵, Matrix 类包括 createGradientBox 方法, 通过该方法可以方便地设置矩阵, 以便与 beginGradientFill 方法一起使用
         */
        public beginGradientFill(type: GradientType, colors: number[], alphas: number[], ratios: number[], matrix: Matrix = null): void {
            this._fillPath = this._renderNode.beginGradientFill(type, colors, alphas, ratios, matrix, this._strokePath);
            if (this._renderNode.drawData.length > 1) {
                this._fillPath.moveTo(this._lastX, this._lastY);
            }
        }

        /**
         * 对从上一次调用 beginFill 方法之后添加的直线和曲线应用填充
         */
        public endFill(): void {
            this._fillPath = null;
        }

        /**
         * 指定线条样式
         * @param thickness 以点为单位表示线条的粗细, 有效值为 0 到 255, 如果未指定数字，或者未定义该参数，则不绘制线条
         * @param color 线条的颜色值, 默认值为黑色
         * @param alpha 线条透明度
         * @param caps 用于指定线条末端处端点类型的 CapsStyle 类的值。默认值：CapsStyle.ROUND
         * @param joints 指定用于拐角的连接外观的类型。默认值：JointStyle.ROUND
         * @param miterLimit 用于表示剪切斜接的极限值的数字
         * @param lineDash 设置虚线样式
         */
        public lineStyle(thickness: number = NaN, color: number = 0, alpha: number = 1, caps: CapsStyle = CapsStyle.round, joints: JointStyle = JointStyle.round, miterLimit: number = 3, lineDash?: number[]): void {
            thickness = +thickness || 0;
            color = +color || 0;
            alpha = +alpha || 0;
            miterLimit = +miterLimit || 0;
            if (thickness <= 0) {
                this._strokePath = null;
                this.setStrokeWidth(0);
            }
            else {
                this.setStrokeWidth(thickness);
                this._strokePath = this._renderNode.lineStyle(thickness, color, alpha, caps, joints, miterLimit, lineDash);
                if (this._renderNode.drawData.length > 1) {
                    this._strokePath.moveTo(this._lastX, this._lastY);
                }
            }
        }

        /**
         * 绘制一个矩形
         * @param x 圆心相对于父显示对象注册点的 x 位置
         * @param y 相对于父显示对象注册点的圆心的 y 位置
         * @param width 矩形的宽度
         * @param height 矩形的高度
         */
        public drawRect(x: number, y: number, width: number, height: number): void {
            x = +x || 0;
            y = +y || 0;
            width = +width || 0;
            height = +height || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.drawRect(x, y, width, height);
            strokePath && strokePath.drawRect(x, y, width, height);
            this.extendBoundsByPoint(x + width, y + height);
            this.updatePosition(x, y);
            this.dirty();
        }

        /**
         * 绘制一个圆角矩形
         * @param x 圆心相对于父显示对象注册点的 x 位置
         * @param y 相对于父显示对象注册点的圆心的 y 位置
         * @param width 矩形的宽度
         * @param height 矩形的高度
         * @param ellipseWidth 用于绘制圆角的椭圆的宽度
         * @param ellipseHeight 用于绘制圆角的椭圆的高度, 。 （可选）如果未指定值，则默认值与为 ellipseWidth 参数提供的值相匹配。
         */
        public drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight?: number): void {
            x = +x || 0;
            y = +y || 0;
            width = +width || 0;
            height = +height || 0;
            ellipseWidth = +ellipseWidth || 0;
            ellipseHeight = +ellipseHeight || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.drawRoundRect(x, y, width, height, ellipseWidth, ellipseHeight);
            strokePath && strokePath.drawRoundRect(x, y, width, height, ellipseWidth, ellipseHeight);
            let radiusX = (ellipseWidth * 0.5) | 0;
            let radiusY = ellipseHeight ? (ellipseHeight * 0.5) | 0 : radiusX;
            let right = x + width;
            let bottom = y + height;
            let ybw = bottom - radiusY;
            this.extendBoundsByPoint(x, y);
            this.extendBoundsByPoint(right, bottom);
            this.updatePosition(right, ybw);
            this.dirty();
        }

        /**
         * 绘制一个圆。
         * @param x 圆心相对于父显示对象注册点的 x 位置（以像素为单位）。
         * @param y 相对于父显示对象注册点的圆心的 y 位置（以像素为单位）。
         * @param radius 圆的半径（以像素为单位）。
         */
        public drawCircle(x: number, y: number, radius: number): void {
            x = +x || 0;
            y = +y || 0;
            radius = +radius || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.drawCircle(x, y, radius);
            strokePath && strokePath.drawCircle(x, y, radius);
            //-1 +2 解决WebGL裁切问题
            this.extendBoundsByPoint(x - radius - 1, y - radius - 1);
            this.extendBoundsByPoint(x + radius + 2, y + radius + 2);
            this.updatePosition(x + radius, y);
            this.dirty();
        }

        /**
         * 绘制一个椭圆。
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         * @param width 矩形的宽度（以像素为单位）。
         * @param height 矩形的高度（以像素为单位）。
         */
        public drawEllipse(x: number, y: number, width: number, height: number): void {
            x = +x || 0;
            y = +y || 0;
            width = +width || 0;
            height = +height || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.drawEllipse(x, y, width, height);
            strokePath && strokePath.drawEllipse(x, y, width, height);
            //-1 +2 解决WebGL裁切问题
            this.extendBoundsByPoint(x - 1, y - 1);
            this.extendBoundsByPoint(x + width + 2, y + height + 2);
            this.updatePosition(x + width, y + height * 0.5);
            this.dirty();
        }

        /**
         * 将当前绘图位置移动到 (x, y)。如果缺少任何一个参数，则此方法将失败，并且当前绘图位置不改变。
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         */
        public moveTo(x: number, y: number): void {
            x = +x || 0;
            y = +y || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.moveTo(x, y);
            strokePath && strokePath.moveTo(x, y);
            this.includeLastPosition = false;
            this._lastX = x;
            this._lastY = y;
            this.dirty();
        }

        /**
         * 使用当前线条样式绘制一条从当前绘图位置开始到 (x, y) 结束的直线；当前绘图位置随后会设置为 (x, y)。
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字（以像素为单位）。
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字（以像素为单位）。
         */
        public lineTo(x: number, y: number): void {
            x = +x || 0;
            y = +y || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.lineTo(x, y);
            strokePath && strokePath.lineTo(x, y);
            this.updatePosition(x, y);
            this.dirty();
        }

        /**
         * 使用当前线条样式和由 (controlX, controlY) 指定的控制点绘制一条从当前绘图位置开始到 (anchorX, anchorY) 结束的二次贝塞尔曲线。当前绘图位置随后设置为 (anchorX, anchorY)。
         * 如果在调用 moveTo() 方法之前调用了 curveTo() 方法，则当前绘图位置的默认值为 (0, 0)。如果缺少任何一个参数，则此方法将失败，并且当前绘图位置不改变。
         * 绘制的曲线是二次贝塞尔曲线。二次贝塞尔曲线包含两个锚点和一个控制点。该曲线内插这两个锚点，并向控制点弯曲。
         * @param controlX 一个数字，指定控制点相对于父显示对象注册点的水平位置。
         * @param controlY 一个数字，指定控制点相对于父显示对象注册点的垂直位置。
         * @param anchorX 一个数字，指定下一个锚点相对于父显示对象注册点的水平位置。
         * @param anchorY 一个数字，指定下一个锚点相对于父显示对象注册点的垂直位置。
         */
        public curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
            controlX = +controlX || 0;
            controlY = +controlY || 0;
            anchorX = +anchorX || 0;
            anchorY = +anchorY || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.curveTo(controlX, controlY, anchorX, anchorY);
            strokePath && strokePath.curveTo(controlX, controlY, anchorX, anchorY);
            let lastX = this._lastX || 0;
            let lastY = this._lastY || 0;
            let bezierPoints = createBezierPoints([lastX, lastY, controlX, controlY, anchorX, anchorY], 50);
            for (let i = 0; i < bezierPoints.length; i++) {
                let point = bezierPoints[i];
                this.extendBoundsByPoint(point.x, point.y);
                egret.Point.release(point);
            }
            this.extendBoundsByPoint(anchorX, anchorY);
            this.updatePosition(anchorX, anchorY);
            this.dirty();
        }

        /**
         * 从当前绘图位置到指定的锚点绘制一条三次贝塞尔曲线。三次贝塞尔曲线由两个锚点和两个控制点组成。该曲线内插这两个锚点，并向两个控制点弯曲。
         * @param controlX1 指定首个控制点相对于父显示对象的注册点的水平位置。
         * @param controlY1 指定首个控制点相对于父显示对象的注册点的垂直位置。
         * @param controlX2 指定第二个控制点相对于父显示对象的注册点的水平位置。
         * @param controlY2 指定第二个控制点相对于父显示对象的注册点的垂直位置。
         * @param anchorX 指定锚点相对于父显示对象的注册点的水平位置。
         * @param anchorY 指定锚点相对于父显示对象的注册点的垂直位置。
         */
        public cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void {
            controlX1 = +controlX1 || 0;
            controlY1 = +controlY1 || 0;
            controlX2 = +controlX2 || 0;
            controlY2 = +controlY2 || 0;
            anchorX = +anchorX || 0;
            anchorY = +anchorY || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY);
            strokePath && strokePath.cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY);
            let lastX = this._lastX || 0;
            let lastY = this._lastY || 0;
            let bezierPoints = createBezierPoints([lastX, lastY, controlX1, controlY1, controlX2, controlY2, anchorX, anchorY], 50);
            for (let i = 0; i < bezierPoints.length; i++) {
                let point = bezierPoints[i];
                this.extendBoundsByPoint(point.x, point.y);
                egret.Point.release(point);
            }
            this.extendBoundsByPoint(anchorX, anchorY);
            this.updatePosition(anchorX, anchorY);
            this.dirty();
        }

        /**
         * 绘制一段圆弧路径。圆弧路径的圆心在 (x, y) 位置，半径为 r ，根据anticlockwise （默认为顺时针）指定的方向从 startAngle 开始绘制，到 endAngle 结束。
         * @param x 圆弧中心（圆心）的 x 轴坐标。
         * @param y 圆弧中心（圆心）的 y 轴坐标。
         * @param radius 圆弧的半径。
         * @param startAngle 圆弧的起始点， x轴方向开始计算，单位以弧度表示。
         * @param endAngle 圆弧的终点， 单位以弧度表示。
         * @param anticlockwise 如果为 true，逆时针绘制圆弧，反之，顺时针绘制。
         */
        public drawArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
            if (radius < 0 || startAngle === endAngle) {
                return;
            }
            x = +x || 0;
            y = +y || 0;
            radius = +radius || 0;
            startAngle = +startAngle || 0;
            endAngle = +endAngle || 0;
            anticlockwise = !!anticlockwise;
            startAngle = clampAngle(startAngle);
            endAngle = clampAngle(endAngle);
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            if (fillPath) {
                fillPath.$lastX = this._lastX;
                fillPath.$lastY = this._lastY;
                fillPath.drawArc(x, y, radius, startAngle, endAngle, anticlockwise);
            }
            if (strokePath) {
                strokePath.$lastX = this._lastX;
                strokePath.$lastY = this._lastY;
                strokePath.drawArc(x, y, radius, startAngle, endAngle, anticlockwise);
            }
            if (anticlockwise) {
                this.arcBounds(x, y, radius, endAngle, startAngle);
            }
            else {
                this.arcBounds(x, y, radius, startAngle, endAngle);
            }
            let endX = x + Math.cos(endAngle) * radius;
            let endY = y + Math.sin(endAngle) * radius;
            this.updatePosition(endX, endY);
            this.dirty();
        }

        private dirty(): void {
            let self = this;
            self._renderNode.dirtyRender = true;
            const target = self._targetDisplay;
            target.$cacheDirty = true;
            let p = target._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = target.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }

        /**
         * 测量圆弧的矩形大小
         */
        private arcBounds(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
            let PI = Math.PI;
            if (Math.abs(startAngle - endAngle) < 0.01) {
                this.extendBoundsByPoint(x - radius, y - radius);
                this.extendBoundsByPoint(x + radius, y + radius);
                return;
            }
            if (startAngle > endAngle) {
                endAngle += PI * 2;
            }
            let startX = Math.cos(startAngle) * radius;
            let endX = Math.cos(endAngle) * radius;
            let xMin = Math.min(startX, endX);
            let xMax = Math.max(startX, endX);
            let startY = Math.sin(startAngle) * radius;
            let endY = Math.sin(endAngle) * radius;
            let yMin = Math.min(startY, endY);
            let yMax = Math.max(startY, endY);
            let startRange = startAngle / (PI * 0.5);
            let endRange = endAngle / (PI * 0.5);
            for (let i = Math.ceil(startRange); i <= endRange; i++) {
                switch (i % 4) {
                    case 0:
                        xMax = radius;
                        break;
                    case 1:
                        yMax = radius;
                        break;
                    case 2:
                        xMin = -radius;
                        break;
                    case 3:
                        yMin = -radius;
                        break;
                }
            }
            xMin = Math.floor(xMin);
            yMin = Math.floor(yMin);
            xMax = Math.ceil(xMax);
            yMax = Math.ceil(yMax);
            this.extendBoundsByPoint(xMin + x, yMin + y);
            this.extendBoundsByPoint(xMax + x, yMax + y);
        }

        /**
         * 清除绘制到此 Graphics 对象的图形，并重置填充和线条样式设置。
         */
        public clear(): void {
            this._renderNode.clear();
            this.updatePosition(0, 0);
            this.minX = Infinity;
            this.minY = Infinity;
            this.maxX = -Infinity;
            this.maxY = -Infinity;
            this.dirty();
        }

        private minX: number = Infinity;
        private minY: number = Infinity;
        private maxX: number = -Infinity;
        private maxY: number = -Infinity;

        private extendBoundsByPoint(x: number, y: number): void {
            this.extendBoundsByX(x);
            this.extendBoundsByY(y);
        }

        private extendBoundsByX(x: number): void {
            this.minX = Math.min(this.minX, x - this._topLeftStrokeWidth);
            this.maxX = Math.max(this.maxX, x + this._bottomRightStrokeWidth);
            this.updateNodeBounds();
        }

        private extendBoundsByY(y: number): void {
            this.minY = Math.min(this.minY, y - this._topLeftStrokeWidth);
            this.maxY = Math.max(this.maxY, y + this._bottomRightStrokeWidth);
            this.updateNodeBounds();
        }

        private updateNodeBounds(): void {
            let node = this._renderNode;
            node.x = this.minX;
            node.y = this.minY;
            node.width = Math.ceil(this.maxX - this.minX);
            node.height = Math.ceil(this.maxY - this.minY);
        }

        /**
         * 是否已经包含上一次moveTo的坐标点
         */
        private includeLastPosition: boolean = true;

        /**
         * 更新当前的lineX和lineY值，并标记尺寸失效。
         */
        private updatePosition(x: number, y: number): void {
            if (!this.includeLastPosition) {
                this.extendBoundsByPoint(this._lastX, this._lastY);
                this.includeLastPosition = true;
            }
            this._lastX = x;
            this._lastY = y;
            this.extendBoundsByPoint(x, y);
        }

        $measureContentBounds(bounds: Rectangle): void {
            if (this.minX === Infinity) {
                bounds.setEmpty();
            }
            else {
                bounds.setTo(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
            }
        }

        $hitTest(stageX: number, stageY: number): DisplayObject {
            let target = this._targetDisplay;
            let m = target.$getInvertedConcatenatedMatrix();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;
            let buffer = sys.canvasHitTestBuffer;
            buffer.resize(3, 3);
            let node = this._renderNode;
            let matrix = Matrix.create();
            matrix.identity();
            matrix.translate(1 - localX, 1 - localY);
            sys.canvasRenderer.drawNodeToBuffer(node, buffer, matrix, true);
            Matrix.release(matrix);
            try {
                let data = buffer.getPixels(1, 1);
                if (data[3] === 0) {
                    return null;
                }
            }
            catch (e) {
                throw new Error(sys.tr(1039));
            }
            return target;
        }

        public $onRemoveFromStage(): void {
            if (this._renderNode) {
                this._renderNode.clean();
            }
        }
    }

    /**
     * 根据传入的锚点组返回贝塞尔曲线上的一组点,返回类型为egret.Point[];
     * @param pointsData 锚点组,保存着所有控制点的x和y坐标,格式为[x0,y0,x1,y1,x2,y2...]
     * @param pointsAmount 要获取的点的总个数，实际返回点数不一定等于该属性，与范围有关
     * @param range 要获取的点与中心锚点的范围值，0~1之间
     * @returns egret.Point[];
     */
    function createBezierPoints(pointsData: number[], pointsAmount: number): egret.Point[] {
        let points = [];
        for (let i = 0; i < pointsAmount; i++) {
            const point = getBezierPointByFactor(pointsData, i / pointsAmount);
            if (point)
                points.push(point);
        }
        return points;
    }

    /**
     * 根据锚点组与取值系数获取贝塞尔曲线上的一点
     * @param pointsData 锚点组,保存着所有控制点的x和y坐标,格式为[x0,y0,x1,y1,x2,y2...]
     * @param t 取值系数
     * @returns egret.Point
     */
    function getBezierPointByFactor(pointsData: number[], t: number): egret.Point {
        let i = 0;
        let x = 0, y = 0;
        const len = pointsData.length;
        //根据传入的数据数量判断是二次贝塞尔还是三次贝塞尔
        if (len / 2 == 3) {
            //二次
            const x0 = pointsData[i++];
            const y0 = pointsData[i++];
            const x1 = pointsData[i++];
            const y1 = pointsData[i++];
            const x2 = pointsData[i++];
            const y2 = pointsData[i++];
            x = getCurvePoint(x0, x1, x2, t);
            y = getCurvePoint(y0, y1, y2, t);
        } else if (len / 2 == 4) {
            //三次
            const x0 = pointsData[i++];
            const y0 = pointsData[i++];
            const x1 = pointsData[i++];
            const y1 = pointsData[i++];
            const x2 = pointsData[i++];
            const y2 = pointsData[i++];
            const x3 = pointsData[i++];
            const y3 = pointsData[i++];
            x = getCubicCurvePoint(x0, x1, x2, x3, t);
            y = getCubicCurvePoint(y0, y1, y2, y3, t);
        }
        return egret.Point.create(x, y);
    }

    /**
     * 通过factor参数获取二次贝塞尔曲线上的位置
     * 公式为B(t) = (1-t)^2 * P0 + 2t(1-t) * P1 + t^2 * P2 
     * @param value0 P0
     * @param value1 P1
     * @param value2 P2
     * @param factor t，从0到1的闭区间
     */
    function getCurvePoint(value0: number, value1: number, value2: number, factor: number): number {
        const result = Math.pow((1 - factor), 2) * value0 + 2 * factor * (1 - factor) * value1 + Math.pow(factor, 2) * value2;
        return result;
    }

    /**
     * 通过factor参数获取三次贝塞尔曲线上的位置
     * 公式为B(t) = (1-t)^3 * P0 + 3t(1-t)^2 * P1 + 3t^2 * (1-t) t^2 * P2 + t^3 *P3 
     * @param value0 P0
     * @param value1 P1
     * @param value2 P2
     * @param value3 P3
     * @param factor t，从0到1的闭区间
     */
    function getCubicCurvePoint(value0: number, value1: number, value2: number, value3: number, factor: number): number {
        const result = Math.pow((1 - factor), 3) * value0 + 3 * factor * Math.pow((1 - factor), 2) * value1 + 3 * (1 - factor) * Math.pow(factor, 2) * value2 + Math.pow(factor, 3) * value3;
        return result;
    }
}
