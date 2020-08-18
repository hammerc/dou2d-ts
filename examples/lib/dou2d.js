var dou2d;
(function (dou2d) {
    var sys;
    (function (sys) {
        /**
         * 渲染上下文
         */
        sys.glContext = "glContext";
        /**
         * 是否预乘 Alpha
         */
        sys.unpackPremultiplyAlphaWebgl = "unpackPremultiplyAlphaWebgl";
        /**
         * 引擎默认空白贴图
         */
        sys.engineDefaultEmptyTexture = "engineDefaultEmptyTexture";
        /**
         * 是否抗锯齿
         */
        sys.smoothing = "smoothing";
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
(function () {
    // 覆盖原生的 isNaN() 方法实现, 在不同浏览器上有 2 ~ 10 倍性能提升
    window["isNaN"] = function (value) {
        value = +value;
        return value !== value;
    };
})();
var dou2d;
(function (dou2d) {
    var sys;
    (function (sys) {
        /**
         * 标记指定属性不可用
         */
        function markCannotUse(instance, property, defaultValue) {
            Object.defineProperty(instance.prototype, property, {
                get: function () {
                    if (DEBUG) {
                        console.warn(`属性"${property}"不能获取`);
                    }
                    return defaultValue;
                },
                set: function (value) {
                    if (DEBUG) {
                        console.warn(`属性"${property}"不能设置`);
                    }
                },
                enumerable: true,
                configurable: true
            });
        }
        sys.markCannotUse = markCannotUse;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var sys;
    (function (sys) {
        /**
         * 贴图缩放系数
         * * 为了解决图片和字体发虚所引入的机制, 它底层实现的原理是创建更大的画布去绘制
         * * 之所以出现发虚这个问题, 是因为普通屏幕的 1 个像素点就是 1 个物理像素点, 而高清屏的 1 个像素点是 4 个物理像素点, 仅高清手机屏会出现该问题
         */
        sys.textureScaleFactor = 1;
        /**
         * 进入帧回调对象列表
         */
        sys.enterFrameCallBackList = [];
        /**
         * 仅一次进入帧回调对象列表
         */
        sys.enterFrameOnceCallBackList = [];
        /**
         * 固定频率进入帧回调对象列表
         */
        sys.fixedEnterFrameCallBackList = [];
        /**
         * 仅一次固定频率进入帧回调对象列表
         */
        sys.fixedEnterFrameOnceCallBackList = [];
        /**
         * 是否派发 Event.RENDER 事件
         */
        sys.invalidateRenderFlag = false;
        /**
         * 渲染回调对象列表
         */
        sys.renderCallBackList = [];
        /**
         * 仅一次渲染回调对象列表
         */
        sys.renderOnceCallBackList = [];
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 3x3 矩阵
     * 表示一个转换矩阵, 该矩阵确定二维显示对象的位置和方向
     * 该矩阵可以执行转换功能, 包括平移 (沿 x 和 y 轴重新定位), 倾斜, 旋转和缩放 (调整大小)
     * ```
     *  ---                            ---
     *  |     a         c         tx     |   x轴
     *  |     b         d         ty     |   y轴
     *  |     u         v         w      |
     *  ---                            ---
     * ```
     * 在二维中不需要使用到额外的 u, v, w 这 3 个数据, 我们使用如下的默认值即可:
     * ```
     *  ---                            ---
     *  |     a         c         tx     |   x轴
     *  |     b         d         ty     |   y轴
     *  |     0         0         1      |
     *  ---                            ---
     * ```
     * @author wizardc
     */
    class Matrix {
        constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        get scaleX() {
            let m = this;
            if (m.b == 0) {
                return m.a;
            }
            let result = Math.sqrt(m.a * m.a + m.b * m.b);
            return this.getDeterminant() < 0 ? -result : result;
        }
        get scaleY() {
            let m = this;
            if (m.c == 0) {
                return m.d;
            }
            let result = Math.sqrt(m.c * m.c + m.d * m.d);
            return this.getDeterminant() < 0 ? -result : result;
        }
        get skewX() {
            if (this.d < 0) {
                return Math.atan2(this.d, this.c) + dou2d.MathUtil.PI_HALF;
            }
            return Math.atan2(this.d, this.c) - dou2d.MathUtil.PI_HALF;
        }
        get skewY() {
            if (this.a < 0) {
                return Math.atan2(this.b, this.a) - Math.PI;
            }
            return Math.atan2(this.b, this.a);
        }
        getDeterminant() {
            return this.a * this.d - this.b * this.c;
        }
        set(a, b, c, d, tx, ty) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
            return this;
        }
        /**
         * 将该矩阵乘以一个矩阵或将两个矩阵相乘的结果写入该矩阵
         * - v *= matrix
         * - v = matrixA * matrixB
         */
        multiply(matrixA, matrixB) {
            if (!matrixB) {
                matrixB = matrixA;
                matrixA = this;
            }
            let a = matrixA.a * matrixB.a;
            let b = 0;
            let c = 0;
            let d = matrixA.d * matrixB.d;
            let tx = matrixA.tx * matrixB.a + matrixB.tx;
            let ty = matrixA.ty * matrixB.d + matrixB.ty;
            if (matrixA.b !== 0 || matrixA.c !== 0 || matrixB.b !== 0 || matrixB.c !== 0) {
                a += matrixA.b * matrixB.c;
                d += matrixA.c * matrixB.b;
                b += matrixA.a * matrixB.b + matrixA.b * matrixB.d;
                c += matrixA.c * matrixB.a + matrixA.d * matrixB.c;
                tx += matrixA.ty * matrixB.c;
                ty += matrixA.tx * matrixB.b;
            }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
            return this;
        }
        /**
         * 一个矩阵或将两个矩阵乘以该矩阵的结果写入该矩阵
         * - v = matrix * v
         * - v = matrixB * matrixA
         */
        premultiply(matrixA, matrixB) {
            if (!matrixB) {
                matrixB = matrixA;
                matrixA = this;
            }
            let a = matrixB.a * matrixA.a;
            let b = 0;
            let c = 0;
            let d = matrixB.d * matrixA.d;
            let tx = matrixB.tx * matrixA.a + matrixA.tx;
            let ty = matrixB.ty * matrixA.d + matrixA.ty;
            if (matrixB.b !== 0 || matrixB.c !== 0 || matrixA.b !== 0 || matrixA.c !== 0) {
                a += matrixB.b * matrixA.c;
                d += matrixB.c * matrixA.b;
                b += matrixB.a * matrixA.b + matrixB.b * matrixA.d;
                c += matrixB.c * matrixA.a + matrixB.d * matrixA.c;
                tx += matrixB.ty * matrixA.c;
                ty += matrixB.tx * matrixA.b;
            }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
            return this;
        }
        /**
         * 反转当前矩阵或传入的矩阵
         */
        inverse(input) {
            input = input || this;
            let a = input.a, b = input.b, c = input.c, d = input.d, tx = input.tx, ty = input.ty;
            if (b == 0 && c == 0) {
                this.b = this.c = 0;
                if (a == 0 || d == 0) {
                    this.a = this.d = this.tx = this.ty = 0;
                }
                else {
                    a = this.a = 1 / a;
                    d = this.d = 1 / d;
                    this.tx = -a * tx;
                    this.ty = -d * ty;
                }
                return this;
            }
            let determinant = a * d - b * c;
            if (determinant == 0) {
                this.identity();
                return this;
            }
            determinant = 1 / determinant;
            let k = this.a = d * determinant;
            b = this.b = -b * determinant;
            c = this.c = -c * determinant;
            d = this.d = a * determinant;
            this.tx = -(k * tx + c * ty);
            this.ty = -(b * tx + d * ty);
            return this;
        }
        /**
         * 后置矩阵
         * - v *= matrix
         */
        append(a, b, c, d, tx, ty) {
            let a1 = this.a;
            let b1 = this.b;
            let c1 = this.c;
            let d1 = this.d;
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                this.a = a * a1 + b * c1;
                this.b = a * b1 + b * d1;
                this.c = c * a1 + d * c1;
                this.d = c * b1 + d * d1;
            }
            this.tx = tx * a1 + ty * c1 + this.tx;
            this.ty = tx * b1 + ty * d1 + this.ty;
            return this;
        }
        /**
         * 前置矩阵
         * - v = matrix * v
         */
        prepend(a, b, c, d, tx, ty) {
            let tx1 = this.tx;
            if (a != 1 || b != 0 || c != 0 || d != 1) {
                let a1 = this.a;
                let c1 = this.c;
                this.a = a1 * a + this.b * c;
                this.b = a1 * b + this.b * d;
                this.c = c1 * a + this.d * c;
                this.d = c1 * b + this.d * d;
            }
            this.tx = tx1 * a + this.ty * c + tx;
            this.ty = tx1 * b + this.ty * d + ty;
            return this;
        }
        /**
         * 应用旋转
         * @param angle 以弧度为单位的旋转角度
         */
        rotate(angle) {
            if (angle !== 0) {
                let u = Math.cos(angle);
                let v = Math.sin(angle);
                let ta = this.a;
                let tb = this.b;
                let tc = this.c;
                let td = this.d;
                let ttx = this.tx;
                let tty = this.ty;
                this.a = ta * u - tb * v;
                this.b = ta * v + tb * u;
                this.c = tc * u - td * v;
                this.d = tc * v + td * u;
                this.tx = ttx * u - tty * v;
                this.ty = ttx * v + tty * u;
            }
        }
        /**
         * 应用缩放
         */
        scale(sx, sy) {
            if (sx !== 1) {
                this.a *= sx;
                this.c *= sx;
                this.tx *= sx;
            }
            if (sy !== 1) {
                this.b *= sy;
                this.d *= sy;
                this.ty *= sy;
            }
        }
        /**
         * 应用平移
         */
        translate(dx, dy) {
            this.tx += dx;
            this.ty += dy;
        }
        /**
         * 如果给定预转换坐标空间中的点, 则此方法返回发生转换后该点的坐标
         */
        transformPoint(pointX, pointY, result) {
            result = result || new dou2d.Point();
            let x = this.a * pointX + this.c * pointY + this.tx;
            let y = this.b * pointX + this.d * pointY + this.ty;
            result.set(x, y);
            return result;
        }
        /**
         * 如果给定预转换坐标空间中的点, 则此方法返回发生转换后该点的坐标
         * 与 transformPoint 不同的地方是该方法的转换不考虑转换参数 tx 和 ty
         */
        deltaTransformPoint(point, result) {
            result = result || new dou2d.Point();
            result.x = this.a * point.x + this.c * point.y;
            result.y = this.b * point.x + this.d * point.y;
            return result;
        }
        /**
         * 如果给定预转换坐标空间中的矩形, 则此方法返回发生转换后的矩形
         */
        transformBounds(bounds, result) {
            result = result || new dou2d.Rectangle();
            let a = this.a;
            let b = this.b;
            let c = this.c;
            let d = this.d;
            let tx = this.tx;
            let ty = this.ty;
            let x = bounds.x;
            let y = bounds.y;
            let xMax = x + bounds.width;
            let yMax = y + bounds.height;
            let x0 = a * x + c * y + tx;
            let y0 = b * x + d * y + ty;
            let x1 = a * xMax + c * y + tx;
            let y1 = b * xMax + d * y + ty;
            let x2 = a * xMax + c * yMax + tx;
            let y2 = b * xMax + d * yMax + ty;
            let x3 = a * x + c * yMax + tx;
            let y3 = b * x + d * yMax + ty;
            let tmp = 0;
            if (x0 > x1) {
                tmp = x0;
                x0 = x1;
                x1 = tmp;
            }
            if (x2 > x3) {
                tmp = x2;
                x2 = x3;
                x3 = tmp;
            }
            result.x = Math.floor(x0 < x2 ? x0 : x2);
            result.width = Math.ceil((x1 > x3 ? x1 : x3) - result.x);
            if (y0 > y1) {
                tmp = y0;
                y0 = y1;
                y1 = tmp;
            }
            if (y2 > y3) {
                tmp = y2;
                y2 = y3;
                y3 = tmp;
            }
            result.y = Math.floor(y0 < y2 ? y0 : y2);
            result.height = Math.ceil((y1 > y3 ? y1 : y3) - result.y);
            return result;
        }
        /**
         * 更新当前矩阵的缩放和旋转
         */
        updateScaleAndRotation(scaleX, scaleY, skewX, skewY) {
            if ((skewX == 0 || skewX == dou2d.MathUtil.PI_DOUBLE) && (skewY == 0 || skewY == dou2d.MathUtil.PI_DOUBLE)) {
                this.a = scaleX;
                this.b = this.c = 0;
                this.d = scaleY;
                return;
            }
            let u = Math.cos(skewX);
            let v = Math.sin(skewX);
            if (skewX == skewY) {
                this.a = u * scaleX;
                this.b = v * scaleX;
            }
            else {
                this.a = Math.cos(skewY) * scaleX;
                this.b = Math.sin(skewY) * scaleX;
            }
            this.c = -v * scaleY;
            this.d = u * scaleY;
        }
        equals(other) {
            return this.a == other.a && this.b == other.b && this.c == other.c && this.d == other.d && this.tx == other.tx && this.ty == other.ty;
        }
        copy(matrix) {
            this.a = matrix.a;
            this.b = matrix.b;
            this.c = matrix.c;
            this.d = matrix.d;
            this.tx = matrix.tx;
            this.ty = matrix.ty;
            return this;
        }
        clone() {
            return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
        }
        identity() {
            this.a = this.d = 1;
            this.b = this.c = this.tx = this.ty = 0;
        }
        onRecycle() {
            this.identity();
        }
    }
    dou2d.Matrix = Matrix;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 点对象
     * @author wizardc
     */
    class Point {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        /**
         * 获取距离
         */
        static distance(v1, v2) {
            let x = (v1.x - v2.x);
            let y = (v1.y - v2.y);
            return Math.sqrt(x * x + y * y);
        }
        /**
         * 根据长度和角度获取一个向量
         * - 弧度制
         */
        static polar(length, angle, result) {
            result = result || new Point();
            result.x = length * Math.cos(angle);
            result.y = length * Math.sin(angle);
            return result;
        }
        /**
         * 判断两条直线是否相交
         * @param line1Point1 直线 1 上的任意一点
         * @param line1Point2 直线 1 上的任意一点
         * @param line2Point1 直线 2 上的任意一点
         * @param line2Point2 直线 2 上的任意一点
         * @param intersectionPoint 如果传入且相交则会保存交点的位置
         * @returns 是否相交
         * @tutorial https://github.com/thelonious/js-intersections/blob/master/src/intersection/Intersection.js
         */
        static intersection(line1Point1, line1Point2, line2Point1, line2Point2, intersectionPoint) {
            let cross = (line2Point2.y - line2Point1.y) * (line1Point2.x - line1Point1.x) - (line2Point2.x - line2Point1.x) * (line1Point2.y - line1Point1.y);
            if (cross == 0) {
                return false;
            }
            if (intersectionPoint) {
                let temp = (line2Point2.x - line2Point1.x) * (line1Point1.y - line2Point1.y) - (line2Point2.y - line2Point1.y) * (line1Point1.x - line2Point1.x);
                let u = temp / cross;
                intersectionPoint.x = line1Point1.x + u * (line1Point2.x - line1Point1.x);
                intersectionPoint.y = line1Point1.y + u * (line1Point2.y - line1Point1.y);
            }
            return true;
        }
        /**
         * 线性插值
         */
        static lerp(from, to, t, result) {
            result = result || new Point();
            result.x = from.x * (1 - t) + to.x * t;
            result.y = from.y * (1 - t) + to.y * t;
            return result;
        }
        get sqrtLength() {
            let { x, y } = this;
            return x * x + y * y;
        }
        get length() {
            let { x, y } = this;
            return Math.sqrt(x * x + y * y);
        }
        set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        /**
         * 将该向量加上一个向量或将两个向量相加的结果写入该向量
         * - v += v1
         * - v = v1 + v2
         */
        add(p1, p2) {
            if (!p2) {
                p2 = p1;
                p1 = this;
            }
            this.x = p1.x + p2.x;
            this.y = p1.y + p2.y;
            return this;
        }
        /**
         * 将该向量减去一个向量或将两个向量相减的结果写入该向量
         * - v -= v1
         * - v = v1 - v2
         */
        subtract(p1, p2) {
            if (!p2) {
                p2 = p1;
                p1 = this;
            }
            this.x = p1.x - p2.x;
            this.y = p1.y - p2.y;
            return this;
        }
        /**
         * 将该向量乘上一个向量或将两个向量相乘的结果写入该向量
         * - v *= v1
         * - v = v1 * v2
         */
        multiply(p1, p2) {
            if (!p2) {
                p2 = p1;
                p1 = this;
            }
            this.x = p1.x * p2.x;
            this.y = p1.y * p2.y;
            return this;
        }
        /**
         * 将该向量加上一个标量或将输入向量与标量相加的结果写入该向量
         * - v += scalar
         * - v = input + scalar
         */
        addScalar(scalar, input) {
            input = input || this;
            this.x = input.x + scalar;
            this.y = input.y + scalar;
            return this;
        }
        /**
         * 将该向量乘上一个标量或将输入向量与标量相乘的结果写入该向量
         * - v *= scalar
         * - v = input * scalar
         */
        multiplyScalar(scalar, input) {
            input = input || this;
            this.x = scalar * input.x;
            this.y = scalar * input.y;
            return this;
        }
        /**
         * 计算该向量与另一个向量的点积
         * - v · vector
         */
        dot(point) {
            return this.x * point.x + this.y * point.y;
        }
        /**
         * 获取一个向量和该向量的夹角
         * - 弧度制
         */
        getAngle(point) {
            let v1 = dou.recyclable(Point);
            v1.normalize(this);
            let v2 = dou.recyclable(Point);
            v2.normalize(point);
            let result = Math.acos(v1.dot(v2));
            v1.recycle();
            v2.recycle();
            return result;
        }
        /**
         * 叉乘
         */
        cross(point) {
            return this.x * point.y - this.y * point.x;
        }
        /**
         * 归一化该向量或传入的向量
         * - v /= v.length
         */
        normalize(input) {
            input = input || this;
            let { x, y } = input;
            let l = Math.sqrt(x * x + y * y);
            if (l > 0) {
                l = 1 / l;
                this.x = x * l;
                this.y = y * l;
            }
            else {
                this.x = 1;
                this.y = 0;
            }
            return this;
        }
        equal(point) {
            return this.x == point.x && this.y == point.y;
        }
        copy(value) {
            return this.set(value.x, value.y);
        }
        clone() {
            return new Point(this.x, this.y);
        }
        clear() {
            this.x = 0;
            this.y = 0;
            return this;
        }
        onRecycle() {
            this.clear();
        }
    }
    Point.ZERO = new Point(0, 0);
    Point.ONE = new Point(1, 1);
    Point.MINUS_ONE = new Point(-1, -1);
    dou2d.Point = Point;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 矩形对象
     * @author wizardc
     */
    class Rectangle {
        constructor(x = 0, y = 0, width = 0, height = 0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        set top(value) {
            this.height += this.y - value;
            this.y = value;
        }
        get top() {
            return this.y;
        }
        set bottom(value) {
            this.height = value - this.y;
        }
        get bottom() {
            return this.y + this.height;
        }
        set left(value) {
            this.width += this.x - value;
            this.x = value;
        }
        get left() {
            return this.x;
        }
        set right(value) {
            this.width = value - this.x;
        }
        get right() {
            return this.x + this.width;
        }
        set topLeft(value) {
            this.top = value.y;
            this.left = value.x;
        }
        get topLeft() {
            return new dou2d.Point(this.left, this.top);
        }
        set bottomRight(value) {
            this.bottom = value.y;
            this.right = value.x;
        }
        get bottomRight() {
            return new dou2d.Point(this.right, this.bottom);
        }
        set(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        }
        /**
         * 尺寸是否为空
         */
        isEmpty() {
            return this.width <= 0 || this.height <= 0;
        }
        /**
         * 是否包含指定的点
         */
        contains(x, y) {
            return this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y;
        }
        /**
         * 判断是否包含指定的点
         */
        containsPoint(point) {
            return this.x <= point.x && this.x + this.width > point.x && this.y <= point.y && this.y + this.height > point.y;
        }
        /**
         * 判断是否包含指定的矩形
         */
        containsRect(rect) {
            let r1 = rect.x + rect.width;
            let b1 = rect.y + rect.height;
            let r2 = this.x + this.width;
            let b2 = this.y + this.height;
            return (rect.x >= this.x) && (rect.x < r2) && (rect.y >= this.y) && (rect.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
        }
        /**
         * 判断是否和指定的对象相交
         */
        intersects(rect) {
            return Math.max(this.x, rect.x) <= Math.min(this.right, rect.right) && Math.max(this.y, rect.y) <= Math.min(this.bottom, rect.bottom);
        }
        /**
         * 判断是否和指定的对象相交, 返回相交区域, 如果不相交则返回的相交区域的 x, y, width 和 height 都为 0
         */
        intersection(rect, result) {
            result = result || this;
            let x0 = this.x;
            let y0 = this.y;
            let x1 = rect.x;
            let y1 = rect.y;
            let l = Math.max(x0, x1);
            let r = Math.min(x0 + this.width, x1 + rect.width);
            if (l <= r) {
                let t = Math.max(y0, y1);
                let b = Math.min(y0 + this.height, y1 + rect.height);
                if (t <= b) {
                    result.set(l, t, r - l, b - t);
                }
                else {
                    result.clear();
                }
            }
            else {
                result.clear();
            }
            return result;
        }
        /**
         * 合并两个矩形为一个新矩形
         */
        union(rect, result) {
            result = result || this;
            if (rect.isEmpty()) {
                return result;
            }
            if (result.isEmpty()) {
                result.copy(rect);
                return result;
            }
            let l = Math.min(result.x, rect.x);
            let t = Math.min(result.y, rect.y);
            result.set(l, t, Math.max(result.right, rect.right) - l, Math.max(result.bottom, rect.bottom) - t);
            return result;
        }
        equals(rect) {
            if (this === rect) {
                return true;
            }
            return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
        }
        copy(rect) {
            this.x = rect.x;
            this.y = rect.y;
            this.width = rect.width;
            this.height = rect.height;
            return this;
        }
        clone() {
            return new Rectangle(this.x, this.y, this.width, this.height);
        }
        clear() {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            return this;
        }
        onRecycle() {
            this.clear();
        }
    }
    dou2d.Rectangle = Rectangle;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var sys;
    (function (sys) {
        /**
         * 心跳计时器
         * @author wizardc
         */
        class Ticker extends dou.TickerBase {
            constructor() {
                super();
                this._tickList = [];
            }
            /**
             * 添加自定义心跳计时器
             */
            startTick(method, thisObj) {
                let index = this.getTickIndex(method, thisObj);
                if (index == -1) {
                    this.concatTick();
                    this._tickList.push({ method, thisObj });
                }
            }
            getTickIndex(method, thisObj) {
                let list = this._tickList;
                for (let i = 0, len = list.length; i < len; i++) {
                    let tick = list[i];
                    if (tick.method === method && tick.thisObj === thisObj) {
                        return i;
                    }
                }
                return -1;
            }
            concatTick() {
                this._tickList = this._tickList.concat();
            }
            /**
             * 移除自定义心跳计时器
             */
            stopTick(method, thisObj) {
                let index = this.getTickIndex(method, thisObj);
                if (index != -1) {
                    this.concatTick();
                    this._tickList.splice(index, 1);
                }
            }
            updateLogic(passedTime) {
                sys.deltaTime = passedTime;
                let logicCost, renderCost;
                logicCost = dou2d.Time.time;
                dou.Tween.tick(passedTime, false);
                this.broadcastDelay(passedTime);
                this.broadcastTick(passedTime);
                this.broadcastRender();
                renderCost = dou2d.Time.time;
                let drawCalls = sys.player.render(passedTime);
                renderCost = dou2d.Time.time - renderCost;
                this.broadcastEnterFrame();
                this.broadcastFixedEnterFrame(passedTime);
                logicCost = dou2d.Time.time - logicCost - renderCost;
                sys.stat.onFrame(logicCost, renderCost, drawCalls);
            }
            broadcastDelay(passedTime) {
                sys.updateCallLater();
                sys.updateInterval(passedTime);
                sys.updateTimeout(passedTime);
            }
            broadcastTick(passedTime) {
                let list = this._tickList;
                for (let i = 0, len = list.length; i < len; i++) {
                    let tick = list[i];
                    tick.method.call(tick.thisObj, passedTime);
                }
            }
            broadcastRender() {
                if (sys.invalidateRenderFlag) {
                    sys.invalidateRenderFlag = false;
                    if (sys.renderCallBackList.length > 0) {
                        let list = sys.renderCallBackList.concat();
                        for (let display of list) {
                            display.dispatchEvent(dou2d.Event2D.RENDER);
                        }
                    }
                    if (sys.renderOnceCallBackList.length > 0) {
                        let list = sys.renderOnceCallBackList;
                        sys.renderOnceCallBackList = [];
                        for (let display of list) {
                            display.dispatchEvent(dou2d.Event2D.RENDER);
                        }
                    }
                }
            }
            broadcastEnterFrame() {
                if (sys.enterFrameCallBackList.length > 0) {
                    let list = sys.enterFrameCallBackList.concat();
                    for (let display of list) {
                        display.dispatchEvent(dou2d.Event2D.ENTER_FRAME);
                    }
                }
                if (sys.enterFrameOnceCallBackList.length > 0) {
                    let list = sys.enterFrameOnceCallBackList;
                    sys.enterFrameOnceCallBackList = [];
                    for (let display of list) {
                        display.dispatchEvent(dou2d.Event2D.ENTER_FRAME);
                    }
                }
            }
            broadcastFixedEnterFrame(passedTime) {
                sys.fixedPassedTime += passedTime;
                let times = ~~(sys.fixedPassedTime / sys.fixedDeltaTime);
                if (times > 0) {
                    sys.fixedPassedTime %= sys.fixedDeltaTime;
                    if (sys.fixedEnterFrameCallBackList.length > 0) {
                        let list = sys.fixedEnterFrameCallBackList.concat();
                        for (let display of list) {
                            for (let i = 0; i < times; i++) {
                                display.dispatchEvent(dou2d.Event2D.FIXED_ENTER_FRAME);
                            }
                        }
                    }
                    if (sys.fixedEnterFrameOnceCallBackList.length > 0) {
                        let list = sys.fixedEnterFrameOnceCallBackList;
                        sys.fixedEnterFrameOnceCallBackList = [];
                        for (let display of list) {
                            for (let i = 0; i < times; i++) {
                                display.dispatchEvent(dou2d.Event2D.FIXED_ENTER_FRAME);
                            }
                        }
                    }
                }
            }
        }
        sys.Ticker = Ticker;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var sys;
    (function (sys) {
        /**
         * 播放器
         * @author wizardc
         */
        class Player {
            constructor(buffer, stage, rootClass) {
                this._isPlaying = false;
                this._screenDisplayList = this.createDisplayList(stage, buffer);
                this._stage = stage;
                this._rootClass = rootClass;
            }
            createDisplayList(stage, buffer) {
                let displayList = new dou2d.rendering.DisplayList(stage);
                displayList.renderBuffer = buffer;
                stage.$displayList = displayList;
                return displayList;
            }
            start() {
                if (this._isPlaying) {
                    return;
                }
                this._isPlaying = true;
                if (!this._root) {
                    this.initialize();
                }
            }
            initialize() {
                this._root = new this._rootClass();
                if (this._root instanceof dou2d.DisplayObject) {
                    this._stage.addChild(this._root);
                }
                else {
                    console.error(`根容器类必须继承自"dou2d.DisplayObject"`);
                }
            }
            pause() {
                if (!this._isPlaying) {
                    return;
                }
                this._isPlaying = false;
            }
            /**
             * 渲染
             */
            render(passedTime) {
                let stage = this._stage;
                let drawCalls = stage.$displayList.drawToSurface();
                return drawCalls;
            }
            /**
             * 更新舞台尺寸
             */
            updateStageSize(stageWidth, stageHeight) {
                let stage = this._stage;
                stage.$setStageSize(stageWidth, stageHeight);
                this._screenDisplayList.setClipRect(stageWidth, stageHeight);
                stage.dispatchEvent2D(dou2d.Event2D.RESIZE);
            }
        }
        sys.Player = Player;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    const tempRect = new dou2d.Rectangle();
    /**
     * 显示对象
     * @author wizardc
     */
    class DisplayObject extends dou.EventDispatcher {
        constructor() {
            super();
            this.$useTranslate = false;
            this.$cacheDirty = false;
            this.$renderDirty = false;
            this.$tintRGB = 0;
            this.$sortDirty = false;
            this.$lastSortedIndex = 0;
            /**
             * 这个对象在显示列表中的嵌套深度, 舞台为 1, 它的子项为 2, 子项的子项为 3, 以此类推, 当对象不在显示列表中时此属性值为 0
             */
            this.$nestLevel = 0;
            this._name = "";
            this._matrixDirty = false;
            this._x = 0;
            this._y = 0;
            this._scaleX = 1;
            this._scaleY = 1;
            this._rotation = 0;
            this._skewX = 0;
            this._skewXdeg = 0;
            this._skewY = 0;
            this._skewYdeg = 0;
            this._explicitWidth = NaN;
            this._explicitHeight = NaN;
            this._anchorOffsetX = 0;
            this._anchorOffsetY = 0;
            this._visible = true;
            this._invisible = false;
            this._finalVisible = true;
            this._alpha = 1;
            this._tint = 0;
            this._blendMode = "normal" /* normal */;
            this._cacheAsBitmap = false;
            this._touchEnabled = DisplayObject.defaultTouchEnabled;
            this._dropEnabled = false;
            this._zIndex = 0;
            this._sortableChildren = false;
            this._matrix = new dou2d.Matrix();
            this.tint = 0xffffff;
        }
        /**
         * 父容器
         */
        get parent() {
            return this._parent;
        }
        /**
         * 设置父级显示对象
         */
        $setParent(parent) {
            this._parent = parent;
        }
        /**
         * 子项列表
         */
        get $children() {
            return this._children;
        }
        /**
         * 舞台
         */
        get stage() {
            return this._stage;
        }
        /**
         * 名称
         */
        set name(value) {
            this._name = value;
        }
        get name() {
            return this._name;
        }
        /**
         * 当前显示对象的矩阵
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         */
        set matrix(value) {
            this.$setMatrix(value);
        }
        get matrix() {
            return this.$getMatrix().clone();
        }
        /**
         * 设置矩阵
         */
        $setMatrix(matrix, needUpdateProperties = true) {
            let m = this._matrix;
            m.a = matrix.a;
            m.b = matrix.b;
            m.c = matrix.c;
            m.d = matrix.d;
            this._x = matrix.tx;
            this._y = matrix.ty;
            this._matrixDirty = false;
            if (m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1) {
                this.$useTranslate = false;
            }
            else {
                this.$useTranslate = true;
            }
            if (needUpdateProperties) {
                this._scaleX = m.scaleX;
                this._scaleY = m.scaleY;
                this._skewX = matrix.skewX;
                this._skewY = matrix.skewY;
                this._skewXdeg = dou2d.MathUtil.clampRotation(this._skewX * 180 / Math.PI);
                this._skewYdeg = dou2d.MathUtil.clampRotation(this._skewY * 180 / Math.PI);
                this._rotation = dou2d.MathUtil.clampRotation(this._skewY * 180 / Math.PI);
            }
        }
        /**
         * 获取矩阵
         */
        $getMatrix() {
            if (this._matrixDirty) {
                this._matrixDirty = false;
                this._matrix.updateScaleAndRotation(this._scaleX, this._scaleY, this._skewX, this._skewY);
            }
            this._matrix.tx = this._x;
            this._matrix.ty = this._y;
            return this._matrix;
        }
        /**
         * 获得这个显示对象以及它所有父级对象的连接矩阵
         */
        $getConcatenatedMatrix() {
            let matrix = this._concatenatedMatrix;
            if (!matrix) {
                matrix = this._concatenatedMatrix = new dou2d.Matrix();
            }
            if (this._parent) {
                matrix.premultiply(this._parent.$getConcatenatedMatrix(), this.$getMatrix());
            }
            else {
                matrix.copy(this.$getMatrix());
            }
            let offsetX = this._anchorOffsetX;
            let offsetY = this._anchorOffsetY;
            let rect = this._scrollRect;
            if (rect) {
                let temp = dou.recyclable(dou2d.Matrix);
                temp.set(1, 0, 0, 1, -rect.x - offsetX, -rect.y - offsetY);
                matrix.premultiply(matrix, temp);
                temp.recycle();
            }
            else if (offsetX != 0 || offsetY != 0) {
                let temp = dou.recyclable(dou2d.Matrix);
                temp.set(1, 0, 0, 1, -offsetX, -offsetY);
                matrix.premultiply(matrix, temp);
                temp.recycle();
            }
            return this._concatenatedMatrix;
        }
        /**
         * 获取链接矩阵
         */
        $getInvertedConcatenatedMatrix() {
            if (!this._invertedConcatenatedMatrix) {
                this._invertedConcatenatedMatrix = new dou2d.Matrix();
            }
            this._invertedConcatenatedMatrix.inverse(this.$getConcatenatedMatrix());
            return this._invertedConcatenatedMatrix;
        }
        /**
         * x 轴坐标
         */
        set x(value) {
            this.$setX(value);
        }
        get x() {
            return this.$getX();
        }
        $setX(value) {
            if (this._x == value) {
                return false;
            }
            this._x = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }
        $getX() {
            return this._x;
        }
        /**
         * y 轴坐标
         */
        set y(value) {
            this.$setY(value);
        }
        get y() {
            return this.$getY();
        }
        $setY(value) {
            if (this._y == value) {
                return false;
            }
            this._y = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }
        $getY() {
            return this._y;
        }
        /**
         * 水平缩放值
         */
        set scaleX(value) {
            this.$setScaleX(value);
        }
        get scaleX() {
            return this.$getScaleX();
        }
        $setScaleX(value) {
            if (this._scaleX == value) {
                return;
            }
            this._scaleX = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getScaleX() {
            return this._scaleX;
        }
        /**
         * 垂直缩放值
         */
        set scaleY(value) {
            this.$setScaleY(value);
        }
        get scaleY() {
            return this.$getScaleY();
        }
        $setScaleY(value) {
            if (this._scaleY == value) {
                return;
            }
            this._scaleY = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getScaleY() {
            return this._scaleY;
        }
        /**
         * 旋转值
         */
        set rotation(value) {
            this.$setRotation(value);
        }
        get rotation() {
            return this.$getRotation();
        }
        $setRotation(value) {
            value = dou2d.MathUtil.clampRotation(value);
            if (value == this._rotation) {
                return;
            }
            let delta = value - this._rotation;
            let angle = delta / 180 * Math.PI;
            this._skewX += angle;
            this._skewY += angle;
            this._rotation = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getRotation() {
            return this._rotation;
        }
        /**
         * 水平方向斜切
         */
        set skewX(value) {
            this.$setSkewX(value);
        }
        get skewX() {
            return this.$getSkewX();
        }
        $setSkewX(value) {
            if (value == this._skewXdeg) {
                return;
            }
            this._skewXdeg = value;
            value = dou2d.MathUtil.clampRotation(value);
            value = value / 180 * Math.PI;
            this._skewX = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getSkewX() {
            return this._skewXdeg;
        }
        /**
         * 垂直方向斜切
         */
        set skewY(value) {
            this.$setSkewY(value);
        }
        get skewY() {
            return this.$getSkewY();
        }
        $setSkewY(value) {
            if (value == this._skewYdeg) {
                return;
            }
            this._skewYdeg = value;
            value = dou2d.MathUtil.clampRotation(value);
            value = (value + this._rotation) / 180 * Math.PI;
            this._skewY = value;
            this._matrixDirty = true;
            this.updateUseTransform();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getSkewY() {
            return this._skewYdeg;
        }
        /**
         * 宽度
         */
        set width(value) {
            this.$setWidth(value);
        }
        get width() {
            return this.$getWidth();
        }
        $setWidth(value) {
            value = isNaN(value) ? NaN : value;
            if (this._explicitWidth == value) {
                return;
            }
            this._explicitWidth = value;
        }
        $getWidth() {
            return isNaN(this._explicitWidth) ? this.$getOriginalBounds().width : this._explicitWidth;
        }
        /**
         * 高度
         */
        set height(value) {
            this.$setHeight(value);
        }
        get height() {
            return this.$getHeight();
        }
        $setHeight(value) {
            value = isNaN(value) ? NaN : value;
            if (this._explicitHeight == value) {
                return;
            }
            this._explicitHeight = value;
        }
        $getHeight() {
            return isNaN(this._explicitHeight) ? this.$getOriginalBounds().height : this._explicitHeight;
        }
        /**
         * 测量宽度
         */
        get measuredWidth() {
            return this.$getOriginalBounds().width;
        }
        /**
         * 测量高度
         */
        get measuredHeight() {
            return this.$getOriginalBounds().height;
        }
        /**
         * x 轴锚点
         */
        set anchorOffsetX(value) {
            this.$setAnchorOffsetX(value);
        }
        get anchorOffsetX() {
            return this.$getAnchorOffsetX();
        }
        $setAnchorOffsetX(value) {
            if (this._anchorOffsetX == value) {
                return;
            }
            this._anchorOffsetX = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getAnchorOffsetX() {
            return this._anchorOffsetX;
        }
        /**
         * y 轴锚点
         */
        set anchorOffsetY(value) {
            this.$setAnchorOffsetY(value);
        }
        get anchorOffsetY() {
            return this.$getAnchorOffsetY();
        }
        $setAnchorOffsetY(value) {
            if (this._anchorOffsetY == value) {
                return;
            }
            this._anchorOffsetY = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getAnchorOffsetY() {
            return this._anchorOffsetY;
        }
        /**
         * 是否可见
         */
        set visible(value) {
            this._visible = value;
            this.$setVisible(this._visible && !this._invisible);
        }
        get visible() {
            return this._visible;
        }
        /**
         * 是否不可见
         */
        set invisible(value) {
            this._invisible = value;
            this.$setVisible(this._visible && !this._invisible);
        }
        get invisible() {
            return this._invisible;
        }
        /**
         * 最终是否可见
         */
        get finalVisible() {
            return this.$getVisible();
        }
        $setVisible(value) {
            if (this._finalVisible == value) {
                return;
            }
            this._finalVisible = value;
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            this.dispatchEvent2D(value ? dou2d.Event2D.SHOWED : dou2d.Event2D.HIDDEN);
        }
        $getVisible() {
            return this._finalVisible;
        }
        /**
         * 透明度
         */
        set alpha(value) {
            this.$setAlpha(value);
        }
        get alpha() {
            return this.$getAlpha();
        }
        $setAlpha(value) {
            if (this._alpha == value) {
                return;
            }
            this._alpha = value;
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getAlpha() {
            return this._alpha;
        }
        /**
         * 给当前对象设置填充色
         */
        set tint(value) {
            this._tint = value;
            this.$tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
        }
        get tint() {
            return this._tint;
        }
        /**
         * 混合模式
         */
        set blendMode(value) {
            this.$setBlendMode(value);
        }
        get blendMode() {
            return this.$getBlendMode();
        }
        $setBlendMode(value) {
            if (this._blendMode == value) {
                return;
            }
            this._blendMode = value;
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getBlendMode() {
            return this._blendMode;
        }
        /**
         * 显示对象的滚动矩形范围
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         * * 显示对象被裁切为矩形定义的大小, 当您更改 scrollRect 对象的 x 和 y 属性时, 它会在矩形内滚动
         */
        set scrollRect(value) {
            this.$setScrollRect(value);
        }
        get scrollRect() {
            return this.$getScrollRect();
        }
        $setScrollRect(value) {
            if (!value && !this._scrollRect) {
                this.$updateRenderMode();
                return;
            }
            if (value) {
                if (!this._scrollRect) {
                    this._scrollRect = new dou2d.Rectangle();
                }
                this._scrollRect.copy(value);
            }
            else {
                this._scrollRect = null;
            }
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getScrollRect() {
            return this._scrollRect;
        }
        /**
         * 当前对象的遮罩
         * * 当前值是对象时, 修改当前值的属性之后, 需要重新赋值才会生效
         * * 如果遮罩是一个显示对象, 遮罩对象添加到舞台中不会进行绘制
         * * 如果遮罩是一个显示对象, 要确保当舞台缩放时蒙版仍然有效需要将该遮罩添加到显示列表中
         * * 如果遮罩是一个显示对象, 该遮罩对象不能用于遮罩多个执行调用的显示对象, 将其分配给第二个显示对象时, 会撤消其作为第一个对象的遮罩
         */
        set mask(value) {
            this.$setMask(value);
        }
        get mask() {
            return this.$getMask();
        }
        $setMask(value) {
            if (value === this) {
                return;
            }
            if (value) {
                if (value instanceof DisplayObject) {
                    if (value == this.$mask) {
                        return;
                    }
                    if (value.$maskedObject) {
                        value.$maskedObject.mask = null;
                    }
                    value.$maskedObject = this;
                    this.$mask = value;
                    value.$updateRenderMode();
                    if (this.$maskRect) {
                        this.$maskRect = null;
                    }
                }
                else {
                    if (!this.$maskRect) {
                        this.$maskRect = new dou2d.Rectangle();
                    }
                    this.$maskRect.copy(value);
                    if (this.$mask) {
                        this.$mask.$maskedObject = null;
                        this.$mask.$updateRenderMode();
                    }
                    if (this.mask) {
                        this.$mask = null;
                    }
                }
            }
            else {
                if (this.$mask) {
                    this.$mask.$maskedObject = null;
                    this.$mask.$updateRenderMode();
                }
                if (this.mask) {
                    this.$mask = null;
                }
                if (this.$maskRect) {
                    this.$maskRect = null;
                }
            }
            this.$updateRenderMode();
        }
        $getMask() {
            return this.$mask ? this.$mask : this.$maskRect;
        }
        /**
         * 包含当前与显示对象关联的每个滤镜对象的索引数组
         */
        set filters(value) {
            this.$setFilters(value);
        }
        get filters() {
            return this.$getFilters();
        }
        $setFilters(value) {
            let filters = this._filters;
            if (!filters && !value) {
                this._filters = value;
                this.$updateRenderMode();
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
                return;
            }
            if (value && value.length) {
                value = value.concat();
                this._filters = value;
            }
            else {
                this._filters = value;
            }
            this.$updateRenderMode();
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getFilters() {
            return this._filters;
        }
        /**
         * 当前对象的滤镜裁剪区域
         * * 注意: 设定后仅渲染设定了裁剪区域内的图像, 同时滤镜也按照该区域进行处理, 不设定按照默认尺寸进行渲染
         */
        set filterClip(value) {
            this.$setFilterClip(value);
        }
        get filterClip() {
            return this.$getFilterClip();
        }
        $setFilterClip(value) {
            this._filterClip = value;
        }
        $getFilterClip() {
            return this._filterClip;
        }
        /**
         * 是否将当前的显示对象缓存为位图
         */
        set cacheAsBitmap(value) {
            this._cacheAsBitmap = value;
            this.$setHasDisplayList(value);
        }
        get cacheAsBitmap() {
            return this._cacheAsBitmap;
        }
        $setHasDisplayList(value) {
            let hasDisplayList = !!this.$displayList;
            if (hasDisplayList == value) {
                return;
            }
            if (value) {
                let displayList = dou2d.rendering.DisplayList.create(this);
                if (displayList) {
                    this.$displayList = displayList;
                    this.$cacheDirty = true;
                }
            }
            else {
                this.$displayList = null;
            }
        }
        /**
         * 是否接收触摸事件
         */
        set touchEnabled(value) {
            this.$setTouchEnabled(value);
        }
        get touchEnabled() {
            return this.$getTouchEnabled();
        }
        $setTouchEnabled(value) {
            this._touchEnabled = !!value;
        }
        $getTouchEnabled() {
            return this._touchEnabled;
        }
        /**
         * 指定的点击区域
         */
        set hitArea(value) {
            this.$setHitArea(value);
        }
        get hitArea() {
            return this.$getHitArea();
        }
        $setHitArea(value) {
            this._hitArea = value;
        }
        $getHitArea() {
            return this._hitArea;
        }
        /**
         * 是否接受其它对象拖入
         */
        set dropEnabled(value) {
            this.$setDropEnabled(value);
        }
        get dropEnabled() {
            return this.$getDropEnabled();
        }
        $setDropEnabled(value) {
            if (this._dropEnabled == value) {
                return;
            }
            this._dropEnabled = value;
            dou2d.DragManager.instance.$dropRegister(this, this._dropEnabled);
        }
        $getDropEnabled() {
            return this._dropEnabled;
        }
        /**
         * 设置对象的 Z 轴顺序
         */
        set zIndex(value) {
            this._zIndex = value;
            if (this.parent) {
                this.parent.$sortDirty = true;
            }
        }
        get zIndex() {
            return this._zIndex;
        }
        /**
         * 允许对象使用 zIndex 排序
         */
        set sortableChildren(value) {
            this._sortableChildren = value;
        }
        get sortableChildren() {
            return this._sortableChildren;
        }
        /**
         * 显示对象添加到舞台
         */
        $onAddToStage(stage, nestLevel) {
            this._stage = stage;
            this.$nestLevel = nestLevel;
            this.dispatchEvent2D(dou2d.Event2D.ADDED_TO_STAGE);
        }
        /**
         * 显示对象从舞台移除
         */
        $onRemoveFromStage() {
            this.$nestLevel = 0;
            this._stage = null;
            this.dispatchEvent2D(dou2d.Event2D.REMOVED_FROM_STAGE);
        }
        updateUseTransform() {
            if (this._scaleX == 1 && this._scaleY == 1 && this._skewX == 0 && this._skewY == 0) {
                this.$useTranslate = false;
            }
            else {
                this.$useTranslate = true;
            }
        }
        $cacheDirtyUp() {
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
        }
        /**
         * 对子项进行排序
         */
        sortChildren() {
            this.$sortDirty = false;
        }
        /**
         * 返回一个矩形，该矩形定义相对于 targetCoordinateSpace 对象坐标系的显示对象区域
         */
        getTransformedBounds(targetCoordinateSpace, result) {
            return this.$getTransformedBounds(targetCoordinateSpace, result);
        }
        /**
         * 获取显示对象的测量边界
         */
        getBounds(result, calculateAnchor = true) {
            result = this.$getTransformedBounds(this, result);
            if (calculateAnchor) {
                if (this._anchorOffsetX != 0) {
                    result.x -= this._anchorOffsetX;
                }
                if (this._anchorOffsetY != 0) {
                    result.y -= this._anchorOffsetY;
                }
            }
            return result;
        }
        $getTransformedBounds(targetCoordinateSpace, result) {
            let bounds = this.$getOriginalBounds();
            if (!result) {
                result = new dou2d.Rectangle();
            }
            result.copy(bounds);
            if (targetCoordinateSpace == this) {
                return result;
            }
            if (targetCoordinateSpace) {
                let m = dou.recyclable(dou2d.Matrix);
                let invertedTargetMatrix = targetCoordinateSpace.$getInvertedConcatenatedMatrix();
                m.premultiply(invertedTargetMatrix, this.$getConcatenatedMatrix());
                m.transformBounds(result);
                m.recycle();
            }
            else {
                let m = this.$getConcatenatedMatrix();
                m.transformBounds(result);
            }
            return result;
        }
        /**
         * 从全局坐标转换为本地坐标
         */
        globalToLocal(stageX = 0, stageY = 0, result) {
            let m = this.$getInvertedConcatenatedMatrix();
            return m.transformPoint(stageX, stageY, result);
        }
        /**
         * 将本地坐标转换为全局坐标
         */
        localToGlobal(localX = 0, localY = 0, result) {
            let m = this.$getConcatenatedMatrix();
            return m.transformPoint(localX, localY, result);
        }
        /**
         * 获取显示对象占用的矩形区域, 通常包括自身绘制的测量区域, 如果是容器, 还包括所有子项占据的区域
         */
        $getOriginalBounds() {
            let bounds = this.$getContentBounds();
            this.$measureChildBounds(bounds);
            let offset = this.$measureFiltersOffset(false);
            if (offset) {
                bounds.x += offset.minX;
                bounds.y += offset.minY;
                bounds.width += -offset.minX + offset.maxX;
                bounds.height += -offset.minY + offset.maxY;
            }
            return bounds;
        }
        /**
         * 获取显示对象自身占用的矩形区域
         */
        $getContentBounds() {
            let bounds = tempRect;
            bounds.clear();
            this.$measureContentBounds(bounds);
            return bounds;
        }
        /**
         * 测量自身占用的矩形区域
         */
        $measureContentBounds(bounds) {
        }
        /**
         * 测量子项占用的矩形区域
         */
        $measureChildBounds(bounds) {
        }
        /**
         * 测量滤镜偏移量
         */
        $measureFiltersOffset(fromParent) {
            let display = this;
            let minX = 0;
            let minY = 0;
            let maxX = 0;
            let maxY = 0;
            while (display) {
                let filters = display._filters;
                if (filters && filters.length) {
                    let length = filters.length;
                    for (let i = 0; i < length; i++) {
                        let filter = filters[i];
                        if (filter.type == "blur") {
                            let offsetX = filter.blurX;
                            let offsetY = filter.blurY;
                            minX -= offsetX;
                            minY -= offsetY;
                            maxX += offsetX;
                            maxY += offsetY;
                        }
                        else if (filter.type == "glow") {
                            let offsetX = filter.blurX;
                            let offsetY = filter.blurY;
                            minX -= offsetX;
                            minY -= offsetY;
                            maxX += offsetX;
                            maxY += offsetY;
                            let distance = filter.distance || 0;
                            let angle = filter.angle || 0;
                            let distanceX = 0;
                            let distanceY = 0;
                            if (distance != 0) {
                                distanceX = distance * Math.cos(angle);
                                if (distanceX > 0) {
                                    distanceX = Math.ceil(distanceX);
                                }
                                else {
                                    distanceX = Math.floor(distanceX);
                                }
                                distanceY = distance * Math.sin(angle);
                                if (distanceY > 0) {
                                    distanceY = Math.ceil(distanceY);
                                }
                                else {
                                    distanceY = Math.floor(distanceY);
                                }
                                minX += distanceX;
                                maxX += distanceX;
                                minY += distanceY;
                                maxY += distanceY;
                            }
                        }
                        else if (filter.type == "custom") {
                            let padding = filter.padding;
                            minX -= padding;
                            minY -= padding;
                            maxX += padding;
                            maxY += padding;
                        }
                    }
                }
                if (fromParent) {
                    display = display._parent;
                }
                else {
                    display = null;
                }
            }
            minX = Math.min(minX, 0);
            minY = Math.min(minY, 0);
            maxX = Math.max(maxX, 0);
            maxY = Math.max(maxY, 0);
            return { minX, minY, maxX, maxY };
        }
        /**
         * 获取渲染节点
         */
        $getRenderNode() {
            let node = this.$renderNode;
            if (!node) {
                return null;
            }
            if (this.$renderDirty) {
                node.cleanBeforeRender();
                this.$updateRenderNode();
                this.$renderDirty = false;
                node = this.$renderNode;
            }
            return node;
        }
        /**
         * 更新渲染模式
         */
        $updateRenderMode() {
            if (!this._finalVisible || this._alpha <= 0 || this.$maskedObject) {
                this.$renderMode = 1 /* none */;
            }
            else if (this.filters && this.filters.length > 0) {
                this.$renderMode = 2 /* filter */;
            }
            else if (this._blendMode !== "normal" /* normal */ || (this.$mask && this.$mask._stage)) {
                this.$renderMode = 3 /* clip */;
            }
            else if (this._scrollRect || this.$maskRect) {
                this.$renderMode = 4 /* scrollRect */;
            }
            else {
                this.$renderMode = null;
            }
        }
        /**
         * 获取相对于指定根节点的连接矩阵
         */
        $getConcatenatedMatrixAt(root, matrix) {
            let invertMatrix = root.$getInvertedConcatenatedMatrix();
            // 缩放值为 0 逆矩阵无效
            if (invertMatrix.a === 0 || invertMatrix.d === 0) {
                let target = this;
                let rootLevel = root.$nestLevel;
                matrix.identity();
                while (target.$nestLevel > rootLevel) {
                    let rect = target._scrollRect;
                    if (rect) {
                        let m = dou.recyclable(dou2d.Matrix);
                        m.set(1, 0, 0, 1, -rect.x, -rect.y);
                        matrix.multiply(m);
                        m.recycle();
                    }
                    matrix.multiply(target.$getMatrix());
                    target = target._parent;
                }
            }
            else {
                matrix.premultiply(invertMatrix, matrix);
            }
        }
        /**
         * 更新渲染节点
         */
        $updateRenderNode() {
        }
        /**
         * 碰撞检测, 检测舞台坐标下面最先碰撞到的显示对象
         */
        $hitTest(stageX, stageY) {
            if (!this.$renderNode || !this._finalVisible || this._scaleX == 0 || this._scaleY == 0) {
                if (!this._hitArea) {
                    return null;
                }
            }
            let m = this.$getInvertedConcatenatedMatrix();
            // 防止父类影响子类
            if (m.a == 0 && m.b == 0 && m.c == 0 && m.d == 0) {
                if (!this._hitArea) {
                    return null;
                }
            }
            let bounds = this.$getContentBounds();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;
            if (this._hitArea) {
                if (this._hitArea.contains(localX, localY)) {
                    return this;
                }
                return null;
            }
            if (bounds.contains(localX, localY)) {
                // 容器已经检查过 scrollRect 和 mask, 避免重复对遮罩进行碰撞
                if (!this._children) {
                    let rect = this._scrollRect ? this._scrollRect : this.$maskRect;
                    if (rect && !rect.contains(localX, localY)) {
                        return null;
                    }
                    if (this.$mask && !this.$mask.$hitTest(stageX, stageY)) {
                        return null;
                    }
                }
                return this;
            }
            return null;
        }
        /**
         * 碰撞检测
         * @param shapeFlag 是否开启精确碰撞检测
         */
        hitTestPoint(x, y, shapeFlag) {
            if (!shapeFlag) {
                if (this._scaleX == 0 || this._scaleY == 0) {
                    return false;
                }
                let m = this.$getInvertedConcatenatedMatrix();
                let bounds = this.getBounds(null, false);
                let localX = m.a * x + m.c * y + m.tx;
                let localY = m.b * x + m.d * y + m.ty;
                if (bounds.contains(localX, localY)) {
                    // 这里不考虑设置 mask 的情况
                    let rect = this._scrollRect ? this._scrollRect : this.$maskRect;
                    if (rect && !rect.contains(localX, localY)) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
            else {
                let m = this.$getInvertedConcatenatedMatrix();
                let localX = m.a * x + m.c * y + m.tx;
                let localY = m.b * x + m.d * y + m.ty;
                let data;
                let displayList = this.$displayList;
                if (displayList) {
                    let buffer = displayList.renderBuffer;
                    try {
                        data = buffer.getPixels(localX - displayList.offsetX, localY - displayList.offsetY);
                    }
                    catch (e) {
                        console.error(`跨域图片不能获取像素信息`);
                    }
                }
                else {
                    let buffer = dou2d.sys.hitTestBuffer;
                    buffer.resize(3, 3);
                    let matrix = dou.recyclable(dou2d.Matrix);
                    matrix.translate(1 - localX, 1 - localY);
                    dou2d.sys.renderer.render(this, buffer, matrix);
                    matrix.recycle();
                    try {
                        data = buffer.getPixels(1, 1);
                    }
                    catch (e) {
                        console.error(`跨域图片不能获取像素信息`);
                    }
                }
                if (data[3] === 0) {
                    return false;
                }
                return true;
            }
        }
        removeSelf() {
            if (this._parent) {
                this._parent.removeChild(this);
            }
        }
        addEventListener(type, listener, thisObj, once) {
            let result = super.addEventListener(type, listener, thisObj, once);
            if (type == dou2d.Event2D.ENTER_FRAME || type == dou2d.Event2D.FIXED_ENTER_FRAME || type == dou2d.Event2D.RENDER) {
                let list;
                if (type == dou2d.Event2D.ENTER_FRAME) {
                    list = once ? dou2d.sys.enterFrameOnceCallBackList : dou2d.sys.enterFrameCallBackList;
                }
                else if (type == dou2d.Event2D.FIXED_ENTER_FRAME) {
                    list = once ? dou2d.sys.fixedEnterFrameOnceCallBackList : dou2d.sys.fixedEnterFrameCallBackList;
                }
                else {
                    list = once ? dou2d.sys.renderOnceCallBackList : dou2d.sys.renderCallBackList;
                }
                list.pushUnique(this);
            }
            return result;
        }
        willTrigger(type) {
            let parent = this;
            while (parent) {
                if (parent.has(type)) {
                    return true;
                }
                parent = parent._parent;
            }
            return false;
        }
        dispatch(event) {
            let needBubbles = false;
            if (event instanceof dou2d.Event2D && event.bubbles) {
                needBubbles = true;
            }
            if (needBubbles) {
                let list = this.getPropagationList(this);
                event.$setTarget(this);
                this.dispatchPropagationEvent(event, list);
                return !event.$isDefaultPrevented();
            }
            return super.dispatch(event);
        }
        getPropagationList(target) {
            let list = [];
            while (target) {
                list.push(target);
                target = target._parent;
            }
            return list;
        }
        dispatchPropagationEvent(event, list) {
            for (let i = 0, len = list.length; i < len; i++) {
                let currentTarget = list[i];
                event.$setCurrentTarget(currentTarget);
                currentTarget.$notify(event);
                if (event.$isPropagationStopped()) {
                    break;
                }
            }
        }
        off(type, listener, thisObj) {
            super.off(type, listener, thisObj);
            if (type == dou2d.Event2D.ENTER_FRAME || type == dou2d.Event2D.FIXED_ENTER_FRAME || type == dou2d.Event2D.RENDER) {
                let list;
                let listOnce;
                if (type == dou2d.Event2D.ENTER_FRAME) {
                    list = dou2d.sys.enterFrameCallBackList;
                    listOnce = dou2d.sys.enterFrameOnceCallBackList;
                }
                else if (type == dou2d.Event2D.FIXED_ENTER_FRAME) {
                    list = dou2d.sys.fixedEnterFrameCallBackList;
                    listOnce = dou2d.sys.fixedEnterFrameOnceCallBackList;
                }
                else {
                    list = dou2d.sys.renderCallBackList;
                    listOnce = dou2d.sys.renderOnceCallBackList;
                }
                list.remove(this);
                listOnce.remove(this);
            }
        }
    }
    /**
     * 显示对象默认的 touchEnabled 属性
     */
    DisplayObject.defaultTouchEnabled = false;
    dou2d.DisplayObject = DisplayObject;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 显示对象容器
     * @author wizardc
     */
    class DisplayObjectContainer extends dou2d.DisplayObject {
        constructor() {
            super();
            this._touchChildren = true;
            this._children = [];
        }
        /**
         * 子项数量
         */
        get numChildren() {
            return this._children.length;
        }
        /**
         * 确定对象的子级是否支持触摸事件
         */
        set touchChildren(value) {
            this.$setTouchChildren(!!value);
        }
        get touchChildren() {
            return this.$getTouchChildren();
        }
        $setTouchChildren(value) {
            if (this._touchChildren == value) {
                return false;
            }
            this._touchChildren = value;
            return true;
        }
        $getTouchChildren() {
            return this._touchChildren;
        }
        $onAddToStage(stage, nestLevel) {
            super.$onAddToStage(stage, nestLevel);
            let children = this._children;
            let length = children.length;
            nestLevel++;
            for (let i = 0; i < length; i++) {
                let child = this._children[i];
                child.$onAddToStage(stage, nestLevel);
                if (child.$maskedObject) {
                    child.$maskedObject.$updateRenderMode();
                }
            }
        }
        $onRemoveFromStage() {
            super.$onRemoveFromStage();
            let children = this._children;
            let length = children.length;
            for (let i = 0; i < length; i++) {
                let child = children[i];
                child.$onRemoveFromStage();
            }
        }
        /**
         * 添加一个显示对象
         */
        addChild(child) {
            let index = this._children.length;
            if (child.parent == this) {
                index--;
            }
            return this.$doAddChild(child, index);
        }
        /**
         * 添加一个显示对象到指定的索引
         */
        addChildAt(child, index) {
            index = +index | 0;
            if (index < 0 || index >= this._children.length) {
                index = this._children.length;
                if (child.parent == this) {
                    index--;
                }
            }
            return this.$doAddChild(child, index);
        }
        $doAddChild(child, index, notifyListeners = true) {
            if (DEBUG) {
                if (child == this) {
                    throw new Error(`不能将自己作为自己的子项添加`);
                }
                else if ((child instanceof DisplayObjectContainer) && child.contains(this)) {
                    throw new Error(`不能将包含自己的容器作为自己的子项添加`);
                }
            }
            let host = child.parent;
            if (host == this) {
                this.doSetChildIndex(child, index);
                return child;
            }
            if (host) {
                host.removeChild(child);
            }
            this._children.splice(index, 0, child);
            child.$setParent(this);
            let stage = this._stage;
            // 当前容器在舞台
            if (stage) {
                child.$onAddToStage(stage, this.$nestLevel + 1);
            }
            if (notifyListeners) {
                child.dispatchEvent2D(dou2d.Event2D.ADDED, null, true);
            }
            if (child.$maskedObject) {
                child.$maskedObject.$updateRenderMode();
            }
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            this.$childAdded(child, index);
            return child;
        }
        /**
         * 一个子项被添加到容器内
         */
        $childAdded(child, index) {
        }
        /**
         * 返回指定显示对象是否被包含
         * * 搜索包括整个显示列表, 孙项, 曾孙项等
         */
        contains(child) {
            while (child) {
                if (child == this) {
                    return true;
                }
                child = child.parent;
            }
            return false;
        }
        /**
         * 返回位于指定索引处的子显示对象实例
         */
        getChildAt(index) {
            index = +index | 0;
            if (index >= 0 && index < this._children.length) {
                return this._children[index];
            }
            return null;
        }
        /**
         * 返回子显示对象实例的索引位置
         */
        getChildIndex(child) {
            return this._children.indexOf(child);
        }
        /**
         * 返回具有指定名称的子显示对象
         * 如果多个子显示对象具有指定名称, 则该方法会返回子级列表中的第一个对象
         */
        getChildByName(name) {
            let children = this._children;
            let length = children.length;
            let displayObject;
            for (let i = 0; i < length; i++) {
                displayObject = children[i];
                if (displayObject.name == name) {
                    return displayObject;
                }
            }
            return null;
        }
        /**
         * 更改现有子项在显示对象容器中的位置
         */
        setChildIndex(child, index) {
            index = +index | 0;
            if (index < 0 || index >= this._children.length) {
                index = this._children.length - 1;
            }
            this.doSetChildIndex(child, index);
        }
        doSetChildIndex(child, index) {
            let lastIndex = this._children.indexOf(child);
            if (lastIndex < 0) {
                if (DEBUG) {
                    throw new Error(`操作的显示对象必须是自己的子项`);
                }
            }
            if (lastIndex == index) {
                return;
            }
            this.$childRemoved(child, lastIndex);
            // 从原来的位置删除
            this._children.splice(lastIndex, 1);
            // 放到新的位置
            this._children.splice(index, 0, child);
            this.$childAdded(child, index);
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
        }
        /**
         * 在子级列表中两个指定的索引位置
         */
        swapChildrenAt(index1, index2) {
            index1 = +index1 | 0;
            index2 = +index2 | 0;
            if (index1 >= 0 && index1 < this._children.length && index2 >= 0 && index2 < this._children.length) {
                this.doSwapChildrenAt(index1, index2);
            }
        }
        /**
         * 交换两个指定子对象的 Z 轴顺序
         */
        swapChildren(child1, child2) {
            let index1 = this._children.indexOf(child1);
            let index2 = this._children.indexOf(child2);
            if (index1 != -1 && index2 != -1) {
                this.doSwapChildrenAt(index1, index2);
            }
        }
        doSwapChildrenAt(index1, index2) {
            if (index1 > index2) {
                let temp = index2;
                index2 = index1;
                index1 = temp;
            }
            else if (index1 == index2) {
                return;
            }
            let list = this._children;
            let child1 = list[index1];
            let child2 = list[index2];
            this.$childRemoved(child1, index1);
            this.$childRemoved(child2, index2);
            list[index1] = child2;
            list[index2] = child1;
            this.$childAdded(child2, index1);
            this.$childAdded(child1, index2);
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
        }
        /**
         * 移除指定的子显示对象
         */
        removeChild(child) {
            let index = this._children.indexOf(child);
            if (index >= 0) {
                return this.$doRemoveChild(index);
            }
            return null;
        }
        /**
         * 移除指定索引的子显示对象
         */
        removeChildAt(index) {
            index = +index | 0;
            if (index >= 0 && index < this._children.length) {
                return this.$doRemoveChild(index);
            }
            return null;
        }
        $doRemoveChild(index, notifyListeners = true) {
            index = +index | 0;
            let children = this._children;
            let child = children[index];
            this.$childRemoved(child, index);
            if (notifyListeners) {
                child.dispatchEvent2D(dou2d.Event2D.REMOVED, null, true);
            }
            // 在舞台上
            if (this._stage) {
                child.$onRemoveFromStage();
            }
            child.$setParent(null);
            let indexNow = children.indexOf(child);
            if (indexNow != -1) {
                children.splice(indexNow, 1);
            }
            if (child.$maskedObject) {
                child.$maskedObject.$updateRenderMode();
            }
            if (!this.$cacheDirty) {
                this.$cacheDirty = true;
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            return child;
        }
        /**
         * 移除所有的子项
         */
        removeChildren() {
            let children = this._children;
            for (let i = children.length - 1; i >= 0; i--) {
                this.$doRemoveChild(i);
            }
        }
        /**
         * 一个子项从容器内移除
         */
        $childRemoved(child, index) {
        }
        $measureChildBounds(bounds) {
            let children = this._children;
            let length = children.length;
            if (length == 0) {
                return;
            }
            let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
            let found = false;
            let rect = dou.recyclable(dou2d.Rectangle);
            for (let i = -1; i < length; i++) {
                let childBounds;
                if (i == -1) {
                    childBounds = bounds;
                }
                else {
                    children[i].getBounds(rect);
                    children[i].$getMatrix().transformBounds(rect);
                    childBounds = rect;
                }
                if (childBounds.isEmpty()) {
                    continue;
                }
                if (found) {
                    xMin = Math.min(xMin, childBounds.x);
                    xMax = Math.max(xMax, childBounds.x + childBounds.width);
                    yMin = Math.min(yMin, childBounds.y);
                    yMax = Math.max(yMax, childBounds.y + childBounds.height);
                }
                else {
                    found = true;
                    xMin = childBounds.x;
                    xMax = xMin + childBounds.width;
                    yMin = childBounds.y;
                    yMax = yMin + childBounds.height;
                }
            }
            rect.recycle();
            bounds.set(xMin, yMin, xMax - xMin, yMax - yMin);
        }
        $hitTest(stageX, stageY) {
            if (!this._finalVisible) {
                return null;
            }
            let m = this.$getInvertedConcatenatedMatrix();
            let localX = m.a * stageX + m.c * stageY + m.tx;
            let localY = m.b * stageX + m.d * stageY + m.ty;
            if (this._hitArea) {
                if (this._hitArea.contains(localX, localY)) {
                    return this;
                }
                return null;
            }
            let rect = this._scrollRect ? this._scrollRect : this.$maskRect;
            if (rect && !rect.contains(localX, localY)) {
                return null;
            }
            if (this.$mask && !this.$mask.$hitTest(stageX, stageY)) {
                return null;
            }
            let children = this._children;
            let found = false;
            let target;
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child.$maskedObject) {
                    continue;
                }
                target = child.$hitTest(stageX, stageY);
                if (target) {
                    found = true;
                    if (target.touchEnabled) {
                        break;
                    }
                    else {
                        target = null;
                    }
                }
            }
            if (target) {
                if (this._touchChildren) {
                    return target;
                }
                return this;
            }
            if (found) {
                return this;
            }
            return super.$hitTest(stageX, stageY);
        }
        sortChildren() {
            // 关掉脏的标记
            super.sortChildren();
            this.$sortDirty = false;
            // 准备重新排序
            let sortRequired = false;
            const children = this._children;
            let child;
            for (let i = 0, j = children.length; i < j; ++i) {
                child = children[i];
                child.$lastSortedIndex = i;
                if (!sortRequired && child.zIndex !== 0) {
                    sortRequired = true;
                }
            }
            if (sortRequired && children.length > 1) {
                children.sort(this._sortChildrenFunc);
            }
        }
        _sortChildrenFunc(a, b) {
            if (a.zIndex === b.zIndex) {
                return a.$lastSortedIndex - b.$lastSortedIndex;
            }
            return a.zIndex - b.zIndex;
        }
    }
    dou2d.DisplayObjectContainer = DisplayObjectContainer;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 矢量图形类
     * @author wizardc
     */
    class Shape extends dou2d.DisplayObject {
        constructor() {
            super();
            this._graphics = new dou2d.Graphics();
            this._graphics.$setTarget(this);
        }
        /**
         * 矢量绘制对象
         */
        get graphics() {
            return this._graphics;
        }
        $onRemoveFromStage() {
            super.$onRemoveFromStage();
            if (this._graphics) {
                this._graphics.$onRemoveFromStage();
            }
        }
        $measureContentBounds(bounds) {
            this._graphics.$measureContentBounds(bounds);
        }
    }
    dou2d.Shape = Shape;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 精灵类
     * @author wizardc
     */
    class Sprite extends dou2d.DisplayObjectContainer {
        constructor() {
            super();
            this._graphics = new dou2d.Graphics();
            this._graphics.$setTarget(this);
        }
        /**
         * 矢量绘制对象
         */
        get graphics() {
            return this._graphics;
        }
        $onRemoveFromStage() {
            super.$onRemoveFromStage();
            if (this._graphics) {
                this._graphics.$onRemoveFromStage();
            }
        }
        $measureContentBounds(bounds) {
            this._graphics.$measureContentBounds(bounds);
        }
    }
    dou2d.Sprite = Sprite;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 舞台
     * @author wizardc
     */
    class Stage extends dou2d.DisplayObjectContainer {
        constructor(engine) {
            super();
            this._stageWidth = 0;
            this._stageHeight = 0;
            this._scaleMode = "showAll" /* showAll */;
            this._orientation = "auto" /* auto */;
            this._maxTouches = 99;
            this._engine = engine;
            this._stage = this;
            this.$nestLevel = 1;
        }
        /**
         * 舞台的帧速率
         */
        set frameRate(value) {
            dou2d.sys.ticker.frameRate = value;
        }
        get frameRate() {
            return dou2d.sys.ticker.frameRate;
        }
        /**
         * 舞台的当前宽度
         */
        get stageWidth() {
            return this._stageWidth;
        }
        /**
         * 舞台的当前高度
         */
        get stageHeight() {
            return this._stageHeight;
        }
        /**
         * 舞台缩放模式
         */
        set scaleMode(value) {
            if (this._scaleMode == value) {
                return;
            }
            this._scaleMode = value;
            this._engine.updateScreenSize();
        }
        get scaleMode() {
            return this._scaleMode;
        }
        /**
         * 屏幕横竖屏显示方式
         */
        set orientation(value) {
            if (this._orientation == value) {
                return;
            }
            this._orientation = value;
            this._engine.updateScreenSize();
        }
        get orientation() {
            return this._orientation;
        }
        /**
         * 绘制纹理的缩放比率
         */
        set textureScaleFactor(value) {
            dou2d.sys.textureScaleFactor = value;
        }
        get textureScaleFactor() {
            return dou2d.sys.textureScaleFactor;
        }
        /**
         * 屏幕可以同时触摸的数量
         */
        set maxTouches(value) {
            if (this._maxTouches == value) {
                return;
            }
            this._maxTouches = value;
            this._engine.updateMaxTouches(this._maxTouches);
        }
        get maxTouches() {
            return this._maxTouches;
        }
        $setStageSize(width, height) {
            this._stageWidth = width;
            this._stageHeight = height;
        }
        /**
         * 设置分辨率尺寸
         */
        setContentSize(width, height) {
            this._engine.setContentSize(width, height);
        }
        /**
         * 调用该方法后, 在显示列表下次呈现时, 会向每个已注册侦听 Event.RENDER 事件的显示对象发送一个 Event.RENDER 事件
         */
        invalidate() {
            dou2d.sys.invalidateRenderFlag = true;
        }
    }
    dou2d.Stage = Stage;
    dou2d.sys.markCannotUse(Stage, "alpha", 1);
    dou2d.sys.markCannotUse(Stage, "visible", true);
    dou2d.sys.markCannotUse(Stage, "x", 0);
    dou2d.sys.markCannotUse(Stage, "y", 0);
    dou2d.sys.markCannotUse(Stage, "scaleX", 1);
    dou2d.sys.markCannotUse(Stage, "scaleY", 1);
    dou2d.sys.markCannotUse(Stage, "rotation", 0);
    dou2d.sys.markCannotUse(Stage, "cacheAsBitmap", false);
    dou2d.sys.markCannotUse(Stage, "scrollRect", null);
    dou2d.sys.markCannotUse(Stage, "filters", null);
    dou2d.sys.markCannotUse(Stage, "blendMode", null);
    dou2d.sys.markCannotUse(Stage, "touchEnabled", true);
    dou2d.sys.markCannotUse(Stage, "matrix", null);
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 位图数据
     * @author wizardc
     */
    class BitmapData {
        constructor(source) {
            /**
             * webgl纹理生成后，是否删掉原始图像数据
             */
            this.deleteSource = true;
            this.source = source;
            if (this.source) {
                this.width = +source.width;
                this.height = +source.height;
            }
        }
        static create(type, data, callback) {
            let base64 = "";
            if (type === "arraybuffer") {
                base64 = dou2d.Base64Util.encode(data);
            }
            else {
                base64 = data;
            }
            let imageType = "image/png";
            if (base64.charAt(0) === "/") {
                imageType = "image/jpeg";
            }
            else if (base64.charAt(0) === "R") {
                imageType = "image/gif";
            }
            else if (base64.charAt(0) === "i") {
                imageType = "image/png";
            }
            let img = new Image();
            img.src = "data:" + imageType + ";base64," + base64;
            img.crossOrigin = "*";
            let bitmapData = new BitmapData(img);
            img.onload = function () {
                img.onload = undefined;
                bitmapData.source = img;
                bitmapData.height = img.height;
                bitmapData.width = img.width;
                if (callback) {
                    callback(bitmapData);
                }
            };
            return bitmapData;
        }
        static addDisplayObject(displayObject, bitmapData) {
            if (!BitmapData._map.has(bitmapData)) {
                BitmapData._map.set(bitmapData, [displayObject]);
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            if (list.indexOf(displayObject) < 0) {
                list.push(displayObject);
            }
        }
        static removeDisplayObject(displayObject, bitmapData) {
            if (!BitmapData._map.has(bitmapData)) {
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            let index = list.indexOf(displayObject);
            if (index >= 0) {
                list.splice(index, 1);
            }
        }
        static invalidate(bitmapData) {
            if (!BitmapData._map.has(bitmapData)) {
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            for (let i = 0; i < list.length; i++) {
                if (list[i] instanceof dou2d.Bitmap) {
                    list[i].$refreshImageData();
                }
                let bitmap = list[i];
                bitmap.$renderDirty = true;
                let p = bitmap.parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = bitmap.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
        }
        static dispose(bitmapData) {
            if (!BitmapData._map.has(bitmapData)) {
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            for (let node of list) {
                if (node instanceof dou2d.Bitmap) {
                    node.$bitmapData = null;
                }
                node.$renderDirty = true;
                let p = node.parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = node.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            BitmapData._map.delete(bitmapData);
        }
        dispose() {
            if (this.webGLTexture) {
                dou2d.WebGLUtil.deleteTexture(this.webGLTexture);
                this.webGLTexture = null;
            }
            if (this.source && this.source.dispose) {
                this.source.dispose();
            }
            if (this.source && this.source.src) {
                this.source.src = "";
            }
            this.source = null;
            BitmapData.dispose(this);
        }
    }
    BitmapData._map = new Map();
    dou2d.BitmapData = BitmapData;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 位图显示对象
     * @author wizardc
     */
    class Bitmap extends dou2d.DisplayObject {
        constructor(value) {
            super();
            this._bitmapX = 0;
            this._bitmapY = 0;
            this._bitmapWidth = 0;
            this._bitmapHeight = 0;
            this._offsetX = 0;
            this._offsetY = 0;
            this._textureWidth = 0;
            this._textureHeight = 0;
            this._sourceWidth = 0;
            this._sourceHeight = 0;
            this._explicitBitmapWidth = NaN;
            this._explicitBitmapHeight = NaN;
            this._fillMode = "scale" /* scale */;
            this._smoothing = Bitmap.defaultSmoothing;
            this._pixelHitTest = false;
            this.$renderNode = new dou2d.rendering.NormalBitmapNode();
            this.$setTexture(value);
            if (value) {
                this.$renderNode.rotated = value.rotated;
            }
        }
        /**
         * 纹理
         */
        set texture(value) {
            this.$setTexture(value);
            if (value && this.$renderNode) {
                this.$renderNode.rotated = value.rotated;
            }
        }
        get texture() {
            return this.$getTexture();
        }
        $setTexture(value) {
            let oldTexture = this._texture;
            if (value == oldTexture) {
                return false;
            }
            this._texture = value;
            if (value) {
                this.$refreshImageData();
            }
            else {
                if (oldTexture) {
                    dou2d.BitmapData.removeDisplayObject(this, oldTexture.bitmapData);
                }
                this.setImageData(null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                this.$renderDirty = true;
                let p = this._parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = this.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
                return true;
            }
            if (this._stage) {
                if (oldTexture && oldTexture.bitmapData) {
                    if (oldTexture.bitmapData === value.bitmapData) {
                        this.$renderDirty = true;
                        let p = this._parent;
                        if (p && !p.$cacheDirty) {
                            p.$cacheDirty = true;
                            p.$cacheDirtyUp();
                        }
                        let maskedObject = this.$maskedObject;
                        if (maskedObject && !maskedObject.$cacheDirty) {
                            maskedObject.$cacheDirty = true;
                            maskedObject.$cacheDirtyUp();
                        }
                        return true;
                    }
                    dou2d.BitmapData.removeDisplayObject(this, oldTexture.bitmapData);
                }
                dou2d.BitmapData.addDisplayObject(this, value.bitmapData);
            }
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }
        $getTexture() {
            return this._texture;
        }
        /**
         * 九宫格
         */
        set scale9Grid(value) {
            this.$setScale9Grid(value);
        }
        get scale9Grid() {
            return this.$getScale9Grid();
        }
        $setScale9Grid(value) {
            this._scale9Grid = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getScale9Grid() {
            return this._scale9Grid;
        }
        /**
         * 位图填充方式
         */
        set fillMode(value) {
            this.$setFillMode(value);
        }
        get fillMode() {
            return this.$getFillMode();
        }
        $setFillMode(value) {
            if (value == this._fillMode) {
                return false;
            }
            this._fillMode = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }
        $getFillMode() {
            return this._fillMode;
        }
        /**
         * 控制在缩放时是否对位图进行平滑处理
         */
        set smoothing(value) {
            this.$setSmoothing(value);
        }
        get smoothing() {
            return this.$getSmoothing();
        }
        $setSmoothing(value) {
            if (value == this._smoothing) {
                return;
            }
            this._smoothing = value;
            this.$renderNode.smoothing = value;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getSmoothing() {
            return this._smoothing;
        }
        /**
         * 是否开启精确像素碰撞
         * * 设置为true显示对象本身的透明区域将能够被穿透
         * * 注意: 若图片资源是以跨域方式从外部服务器加载的, 将无法访问图片的像素数据, 而导致此属性失效
         */
        set pixelHitTest(value) {
            this._pixelHitTest = !!value;
        }
        get pixelHitTest() {
            return this._pixelHitTest;
        }
        $onAddToStage(stage, nestLevel) {
            super.$onAddToStage(stage, nestLevel);
            let texture = this._texture;
            if (texture && texture.bitmapData) {
                dou2d.BitmapData.addDisplayObject(this, texture.bitmapData);
            }
        }
        $onRemoveFromStage() {
            super.$onRemoveFromStage();
            let texture = this._texture;
            if (texture) {
                dou2d.BitmapData.removeDisplayObject(this, texture.bitmapData);
            }
        }
        $setWidth(value) {
            if (value < 0 || value == this._explicitBitmapWidth) {
                return false;
            }
            this._explicitBitmapWidth = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }
        $getWidth() {
            return isNaN(this._explicitBitmapWidth) ? this.$getContentBounds().width : this._explicitBitmapWidth;
        }
        $setHeight(value) {
            if (value < 0 || value == this._explicitBitmapHeight) {
                return false;
            }
            this._explicitBitmapHeight = value;
            this.$renderDirty = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
            return true;
        }
        $getHeight() {
            return isNaN(this._explicitBitmapHeight) ? this.$getContentBounds().height : this._explicitBitmapHeight;
        }
        $measureContentBounds(bounds) {
            if (this.$bitmapData) {
                let w = !isNaN(this._explicitBitmapWidth) ? this._explicitBitmapWidth : this._textureWidth;
                let h = !isNaN(this._explicitBitmapHeight) ? this._explicitBitmapHeight : this._textureHeight;
                bounds.set(0, 0, w, h);
            }
            else {
                let w = !isNaN(this._explicitBitmapWidth) ? this._explicitBitmapWidth : 0;
                let h = !isNaN(this._explicitBitmapHeight) ? this._explicitBitmapHeight : 0;
                bounds.set(0, 0, w, h);
            }
        }
        $updateRenderNode() {
            if (this._texture) {
                let destW = !isNaN(this._explicitBitmapWidth) ? this._explicitBitmapWidth : this._textureWidth;
                let destH = !isNaN(this._explicitBitmapHeight) ? this._explicitBitmapHeight : this._textureHeight;
                let scale9Grid = this.scale9Grid;
                if (scale9Grid) {
                    if (this.$renderNode instanceof dou2d.rendering.NormalBitmapNode) {
                        this.$renderNode = new dou2d.rendering.BitmapNode();
                    }
                    dou2d.rendering.BitmapNode.updateTextureDataWithScale9Grid(this.$renderNode, this.$bitmapData, scale9Grid, this._bitmapX, this._bitmapY, this._bitmapWidth, this._bitmapHeight, this._offsetX, this._offsetY, this._textureWidth, this._textureHeight, destW, destH, this._sourceWidth, this._sourceHeight, this._smoothing);
                }
                else {
                    if (this.fillMode == "repeat" /* repeat */ && this.$renderNode instanceof dou2d.rendering.NormalBitmapNode) {
                        this.$renderNode = new dou2d.rendering.BitmapNode();
                    }
                    dou2d.rendering.NormalBitmapNode.updateTextureData(this.$renderNode, this.$bitmapData, this._bitmapX, this._bitmapY, this._bitmapWidth, this._bitmapHeight, this._offsetX, this._offsetY, this._textureWidth, this._textureHeight, destW, destH, this._sourceWidth, this._sourceHeight, this._fillMode, this._smoothing);
                }
            }
        }
        $hitTest(stageX, stageY) {
            let target = super.$hitTest(stageX, stageY);
            if (target && this._pixelHitTest) {
                let boo = this.hitTestPoint(stageX, stageY, true);
                if (!boo) {
                    target = null;
                }
            }
            return target;
        }
        $refreshImageData() {
            let texture = this._texture;
            if (texture) {
                this.setImageData(texture.bitmapData, texture.bitmapX, texture.bitmapY, texture.bitmapWidth, texture.bitmapHeight, texture.offsetX, texture.offsetY, texture.$getTextureWidth(), texture.$getTextureHeight(), texture.sourceWidth, texture.sourceHeight);
            }
        }
        setImageData(bitmapData, bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, sourceWidth, sourceHeight) {
            this.$bitmapData = bitmapData;
            this._bitmapX = bitmapX;
            this._bitmapY = bitmapY;
            this._bitmapWidth = bitmapWidth;
            this._bitmapHeight = bitmapHeight;
            this._offsetX = offsetX;
            this._offsetY = offsetY;
            this._textureWidth = textureWidth;
            this._textureHeight = textureHeight;
            this._sourceWidth = sourceWidth;
            this._sourceHeight = sourceHeight;
        }
    }
    /**
     * 在缩放时是否进行平滑处理的默认值
     */
    Bitmap.defaultSmoothing = true;
    dou2d.Bitmap = Bitmap;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 绘制矢量形状类
     * @author wizardc
     */
    class Graphics {
        constructor() {
            /**
             * 当前移动到的坐标 x
             */
            this._lastX = 0;
            /**
             * 当前移动到的坐标 y
             */
            this._lastY = 0;
            /**
             * 线条的左上方宽度
             */
            this._topLeftStrokeWidth = 0;
            /**
             * 线条的右下方宽度
             */
            this._bottomRightStrokeWidth = 0;
            /**
             * 是否已经包含上一次 moveTo 的坐标点
             */
            this._includeLastPosition = true;
            this._minX = Infinity;
            this._minY = Infinity;
            this._maxX = -Infinity;
            this._maxY = -Infinity;
            this._renderNode = new dou2d.rendering.GraphicsNode();
        }
        /**
         * 设置绑定到的目标显示对象
         */
        $setTarget(target) {
            if (this._targetDisplay) {
                this._targetDisplay.$renderNode = null;
            }
            target.$renderNode = this._renderNode;
            this._targetDisplay = target;
        }
        /**
         * 对 1 像素和 3 像素特殊处理, 向右下角偏移 0.5 像素, 以显示清晰锐利的线条
         */
        setStrokeWidth(width) {
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
        beginFill(color, alpha = 1) {
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
        beginGradientFill(type, colors, alphas, ratios, matrix = null) {
            this._fillPath = this._renderNode.beginGradientFill(type, colors, alphas, ratios, matrix, this._strokePath);
            if (this._renderNode.drawData.length > 1) {
                this._fillPath.moveTo(this._lastX, this._lastY);
            }
        }
        /**
         * 对从上一次调用 beginFill 方法之后添加的直线和曲线应用填充
         */
        endFill() {
            this._fillPath = null;
        }
        /**
         * 指定线条样式
         * @param thickness 以点为单位表示线条的粗细, 有效值为 0 到 255, 如果未指定数字, 或者未定义该参数, 则不绘制线条
         * @param color 线条的颜色值, 默认值为黑色
         * @param alpha 线条透明度
         * @param caps 用于指定线条末端处端点类型的 CapsStyle 类的值默认值：CapsStyle.ROUND
         * @param joints 指定用于拐角的连接外观的类型默认值：JointStyle.ROUND
         * @param miterLimit 用于表示剪切斜接的极限值的数字
         * @param lineDash 设置虚线样式
         */
        lineStyle(thickness = NaN, color = 0, alpha = 1, caps = "round" /* round */, joints = "round" /* round */, miterLimit = 3, lineDash) {
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
        drawRect(x, y, width, height) {
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
         * @param ellipseHeight 用于绘制圆角的椭圆的高度, 如果未指定值则默认值与为 ellipseWidth 参数提供的值相匹配
         */
        drawRoundRect(x, y, width, height, ellipseWidth, ellipseHeight) {
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
         * 绘制一个圆
         * @param x 圆心相对于父显示对象注册点的 x 位置
         * @param y 相对于父显示对象注册点的圆心的 y 位置
         * @param radius 圆的半径
         */
        drawCircle(x, y, radius) {
            x = +x || 0;
            y = +y || 0;
            radius = +radius || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.drawCircle(x, y, radius);
            strokePath && strokePath.drawCircle(x, y, radius);
            // -1 +2 解决 WebGL 裁切问题
            this.extendBoundsByPoint(x - radius - 1, y - radius - 1);
            this.extendBoundsByPoint(x + radius + 2, y + radius + 2);
            this.updatePosition(x + radius, y);
            this.dirty();
        }
        /**
         * 绘制一个椭圆
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字
         * @param width 矩形的宽度
         * @param height 矩形的高度
         */
        drawEllipse(x, y, width, height) {
            x = +x || 0;
            y = +y || 0;
            width = +width || 0;
            height = +height || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.drawEllipse(x, y, width, height);
            strokePath && strokePath.drawEllipse(x, y, width, height);
            // -1 +2 解决 WebGL 裁切问题
            this.extendBoundsByPoint(x - 1, y - 1);
            this.extendBoundsByPoint(x + width + 2, y + height + 2);
            this.updatePosition(x + width, y + height * 0.5);
            this.dirty();
        }
        /**
         * 将当前绘图位置移动到 x, y
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字
         */
        moveTo(x, y) {
            x = +x || 0;
            y = +y || 0;
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            fillPath && fillPath.moveTo(x, y);
            strokePath && strokePath.moveTo(x, y);
            this._includeLastPosition = false;
            this._lastX = x;
            this._lastY = y;
            this.dirty();
        }
        /**
         * 使用当前线条样式绘制一条从当前绘图位置开始到 x, y 结束的直线, 当前绘图位置随后会设置为 x, y
         * @param x 一个表示相对于父显示对象注册点的水平位置的数字
         * @param y 一个表示相对于父显示对象注册点的垂直位置的数字
         */
        lineTo(x, y) {
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
         * 使用当前线条样式和由 (controlX, controlY) 指定的控制点绘制一条从当前绘图位置开始到 (anchorX, anchorY) 结束的二次贝塞尔曲线,
         * 当前绘图位置随后设置为 (anchorX, anchorY), 如果在调用 moveTo() 方法之前调用了 curveTo() 方法, 则当前绘图位置的默认值为 (0, 0),
         * 如果缺少任何一个参数, 则此方法将失败, 并且当前绘图位置不改变,
         * 绘制的曲线是二次贝塞尔曲线, 二次贝塞尔曲线包含两个锚点和一个控制点, 该曲线内插这两个锚点, 并向控制点弯曲
         * @param controlX 一个数字, 指定控制点相对于父显示对象注册点的水平位置
         * @param controlY 一个数字, 指定控制点相对于父显示对象注册点的垂直位置
         * @param anchorX 一个数字, 指定下一个锚点相对于父显示对象注册点的水平位置
         * @param anchorY 一个数字, 指定下一个锚点相对于父显示对象注册点的垂直位置
         */
        curveTo(controlX, controlY, anchorX, anchorY) {
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
            let bezierPoints = this.createBezierPoints([lastX, lastY, controlX, controlY, anchorX, anchorY], 50);
            for (let i = 0; i < bezierPoints.length; i++) {
                let point = bezierPoints[i];
                this.extendBoundsByPoint(point.x, point.y);
                point.recycle();
            }
            this.extendBoundsByPoint(anchorX, anchorY);
            this.updatePosition(anchorX, anchorY);
            this.dirty();
        }
        /**
         * 从当前绘图位置到指定的锚点绘制一条三次贝塞尔曲线, 三次贝塞尔曲线由两个锚点和两个控制点组成, 该曲线内插这两个锚点并向两个控制点弯曲
         * @param controlX1 指定首个控制点相对于父显示对象的注册点的水平位置
         * @param controlY1 指定首个控制点相对于父显示对象的注册点的垂直位置
         * @param controlX2 指定第二个控制点相对于父显示对象的注册点的水平位置
         * @param controlY2 指定第二个控制点相对于父显示对象的注册点的垂直位置
         * @param anchorX 指定锚点相对于父显示对象的注册点的水平位置
         * @param anchorY 指定锚点相对于父显示对象的注册点的垂直位置
         */
        cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
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
            let bezierPoints = this.createBezierPoints([lastX, lastY, controlX1, controlY1, controlX2, controlY2, anchorX, anchorY], 50);
            for (let i = 0; i < bezierPoints.length; i++) {
                let point = bezierPoints[i];
                this.extendBoundsByPoint(point.x, point.y);
                point.recycle();
            }
            this.extendBoundsByPoint(anchorX, anchorY);
            this.updatePosition(anchorX, anchorY);
            this.dirty();
        }
        /**
         * 绘制一段圆弧路径
         * @param x 圆心的 x 轴坐标
         * @param y 圆心的 y 轴坐标
         * @param radius 圆弧的半径
         * @param startAngle 圆弧的起始点,  x轴方向开始计算, 单位以弧度表示
         * @param endAngle 圆弧的终点,  单位以弧度表示
         * @param anticlockwise 如果为 true, 逆时针绘制圆弧, 反之, 顺时针绘制
         */
        drawArc(x, y, radius, startAngle, endAngle, anticlockwise) {
            if (radius < 0 || startAngle === endAngle) {
                return;
            }
            x = +x || 0;
            y = +y || 0;
            radius = +radius || 0;
            startAngle = +startAngle || 0;
            endAngle = +endAngle || 0;
            anticlockwise = !!anticlockwise;
            startAngle = dou2d.MathUtil.clampAngle(startAngle);
            endAngle = dou2d.MathUtil.clampAngle(endAngle);
            let fillPath = this._fillPath;
            let strokePath = this._strokePath;
            if (fillPath) {
                fillPath.lastX = this._lastX;
                fillPath.lastY = this._lastY;
                fillPath.drawArc(x, y, radius, startAngle, endAngle, anticlockwise);
            }
            if (strokePath) {
                strokePath.lastX = this._lastX;
                strokePath.lastY = this._lastY;
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
        /**
         * 测量圆弧的矩形大小
         */
        arcBounds(x, y, radius, startAngle, endAngle) {
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
        dirty() {
            this._renderNode.dirtyRender = true;
            const target = this._targetDisplay;
            target.$cacheDirty = true;
            let p = target.parent;
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
        extendBoundsByPoint(x, y) {
            this.extendBoundsByX(x);
            this.extendBoundsByY(y);
        }
        extendBoundsByX(x) {
            this._minX = Math.min(this._minX, x - this._topLeftStrokeWidth);
            this._maxX = Math.max(this._maxX, x + this._bottomRightStrokeWidth);
            this.updateNodeBounds();
        }
        extendBoundsByY(y) {
            this._minY = Math.min(this._minY, y - this._topLeftStrokeWidth);
            this._maxY = Math.max(this._maxY, y + this._bottomRightStrokeWidth);
            this.updateNodeBounds();
        }
        updateNodeBounds() {
            let node = this._renderNode;
            node.x = this._minX;
            node.y = this._minY;
            node.width = Math.ceil(this._maxX - this._minX);
            node.height = Math.ceil(this._maxY - this._minY);
        }
        /**
         * 更新当前的lineX和lineY值, 并标记尺寸失效
         */
        updatePosition(x, y) {
            if (!this._includeLastPosition) {
                this.extendBoundsByPoint(this._lastX, this._lastY);
                this._includeLastPosition = true;
            }
            this._lastX = x;
            this._lastY = y;
            this.extendBoundsByPoint(x, y);
        }
        /**
         * 根据传入的锚点组返回贝塞尔曲线上的一组点
         */
        createBezierPoints(pointsData, pointsAmount) {
            let points = [];
            for (let i = 0; i < pointsAmount; i++) {
                let point = this.getBezierPointByFactor(pointsData, i / pointsAmount);
                if (point) {
                    points.push(point);
                }
            }
            return points;
        }
        /**
         * 根据锚点组与取值系数获取贝塞尔曲线上的一点
         */
        getBezierPointByFactor(pointsData, t) {
            let i = 0;
            let x = 0, y = 0;
            let len = pointsData.length;
            if (len / 2 == 3) {
                let x0 = pointsData[i++];
                let y0 = pointsData[i++];
                let x1 = pointsData[i++];
                let y1 = pointsData[i++];
                let x2 = pointsData[i++];
                let y2 = pointsData[i++];
                x = this.getCurvePoint(x0, x1, x2, t);
                y = this.getCurvePoint(y0, y1, y2, t);
            }
            else if (len / 2 == 4) {
                let x0 = pointsData[i++];
                let y0 = pointsData[i++];
                let x1 = pointsData[i++];
                let y1 = pointsData[i++];
                let x2 = pointsData[i++];
                let y2 = pointsData[i++];
                let x3 = pointsData[i++];
                let y3 = pointsData[i++];
                x = this.getCubicCurvePoint(x0, x1, x2, x3, t);
                y = this.getCubicCurvePoint(y0, y1, y2, y3, t);
            }
            let result = dou.recyclable(dou2d.Point);
            result.set(x, y);
            return result;
        }
        /**
         * 通过factor参数获取二次贝塞尔曲线上的位置
         * 公式为 B(t) = (1-t)^2 * P0 + 2t(1-t) * P1 + t^2 * P2
         * @param factor 从 0 到 1 的闭区间
         */
        getCurvePoint(value0, value1, value2, factor) {
            return Math.pow((1 - factor), 2) * value0 + 2 * factor * (1 - factor) * value1 + Math.pow(factor, 2) * value2;
        }
        /**
         * 通过 factor 参数获取三次贝塞尔曲线上的位置
         * * 公式为 B(t) = (1-t)^3 * P0 + 3t(1-t)^2 * P1 + 3t^2 * (1-t) t^2 * P2 + t^3 *P3
         * @param factor 从 0 到 1 的闭区间
         */
        getCubicCurvePoint(value0, value1, value2, value3, factor) {
            return Math.pow((1 - factor), 3) * value0 + 3 * factor * Math.pow((1 - factor), 2) * value1 + 3 * (1 - factor) * Math.pow(factor, 2) * value2 + Math.pow(factor, 3) * value3;
        }
        $onRemoveFromStage() {
            if (this._renderNode) {
                this._renderNode.clean();
            }
        }
        $measureContentBounds(bounds) {
            if (this._minX === Infinity) {
                bounds.clear();
            }
            else {
                bounds.set(this._minX, this._minY, this._maxX - this._minX, this._maxY - this._minY);
            }
        }
        /**
         * 清除绘制到此 Graphics 对象的图形, 并重置填充和线条样式设置
         */
        clear() {
            this._renderNode.clear();
            this.updatePosition(0, 0);
            this._minX = Infinity;
            this._minY = Infinity;
            this._maxX = -Infinity;
            this._maxY = -Infinity;
            this.dirty();
        }
    }
    dou2d.Graphics = Graphics;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 纹理类是对不同平台不同的图片资源的封装
     * @author wizardc
     */
    class Texture {
        constructor() {
            /**
             * 销毁纹理时是否销毁对应 BitmapData
             */
            this.disposeBitmapData = true;
            /**
             * 表示这个纹理在 BitmapData 上的 x 起始位置
             */
            this.bitmapX = 0;
            /**
             * 表示这个纹理在 BitmapData 上的 y 起始位置
             */
            this.bitmapY = 0;
            /**
             * 表示这个纹理在 BitmapData 上的宽度
             */
            this.bitmapWidth = 0;
            /**
             * 表示这个纹理在 BitmapData 上的高度
             */
            this.bitmapHeight = 0;
            /**
             * 表示这个纹理显示了之后在 x 方向的渲染偏移量
             */
            this.offsetX = 0;
            /**
             * 表示这个纹理显示了之后在 y 方向的渲染偏移量
             */
            this.offsetY = 0;
            /**
             * 位图宽度
             */
            this.sourceWidth = 0;
            /**
             * 位图高度
             */
            this.sourceHeight = 0;
            /**
             * 是否旋转
             */
            this.rotated = false;
            this._textureWidth = 0;
            this._textureHeight = 0;
        }
        /**
         * 纹理宽度，只读属性，不可以设置
         */
        get textureWidth() {
            return this.$getTextureWidth();
        }
        $getTextureWidth() {
            return this._textureWidth;
        }
        $getScaleBitmapWidth() {
            return this.bitmapWidth * dou2d.sys.textureScaleFactor;
        }
        /**
         * 纹理高度，只读属性，不可以设置
         */
        get textureHeight() {
            return this.$getTextureHeight();
        }
        $getTextureHeight() {
            return this._textureHeight;
        }
        $getScaleBitmapHeight() {
            return this.bitmapHeight * dou2d.sys.textureScaleFactor;
        }
        set bitmapData(value) {
            this.$setBitmapData(value);
        }
        get bitmapData() {
            return this.$getBitmapData();
        }
        $setBitmapData(value) {
            this._bitmapData = value;
            let scale = dou2d.sys.textureScaleFactor;
            let w = value.width * scale;
            let h = value.height * scale;
            this.$initData(0, 0, w, h, 0, 0, w, h, value.width, value.height);
        }
        $getBitmapData() {
            return this._bitmapData;
        }
        $initData(bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, sourceWidth, sourceHeight, rotated = false) {
            let scale = dou2d.sys.textureScaleFactor;
            this.bitmapX = bitmapX / scale;
            this.bitmapY = bitmapY / scale;
            this.bitmapWidth = bitmapWidth / scale;
            this.bitmapHeight = bitmapHeight / scale;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this._textureWidth = textureWidth;
            this._textureHeight = textureHeight;
            this.sourceWidth = sourceWidth;
            this.sourceHeight = sourceHeight;
            this.rotated = rotated;
            dou2d.BitmapData.invalidate(this._bitmapData);
        }
        dispose() {
            if (this._bitmapData) {
                if (this.disposeBitmapData) {
                    this._bitmapData.dispose();
                }
                this._bitmapData = null;
            }
        }
    }
    dou2d.Texture = Texture;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 图集对象
     * @author wizardc
     */
    class SpriteSheet {
        constructor(texture) {
            /**
             * 表示这个 SpriteSheet 的位图区域在 bitmapData 上的起始位置 x
             */
            this._bitmapX = 0;
            /**
             * 表示这个 SpriteSheet 的位图区域在 bitmapData 上的起始位置 y
             */
            this._bitmapY = 0;
            /**
             * 纹理缓存字典
             */
            this._textureMap = {};
            this._texture = texture;
            this._bitmapX = texture.bitmapX - texture.offsetX;
            this._bitmapY = texture.bitmapY - texture.offsetY;
        }
        /**
         * 共享的位图数据
         */
        get texture() {
            return this._texture;
        }
        /**
         * 根据指定纹理名称获取一个缓存的纹理对象
         */
        getTexture(name) {
            return this._textureMap[name];
        }
        /**
         * 为 SpriteSheet 上的指定区域创建一个新的 Texture 对象并缓存它
         * @param name 名称
         * @param bitmapX 纹理区域在 bitmapData 上的起始坐标 x
         * @param bitmapY 纹理区域在 bitmapData 上的起始坐标 y
         * @param bitmapWidth 纹理区域在 bitmapData 上的宽度
         * @param bitmapHeight 纹理区域在 bitmapData 上的高度
         * @param offsetX 原始位图的非透明区域 x 起始点
         * @param offsetY 原始位图的非透明区域 y 起始点
         * @param textureWidth 原始位图的高度, 若不传入, 则使用 bitmapWidth 的值
         * @param textureHeight 原始位图的宽度, 若不传入, 则使用 bitmapHeight 的值
         * @returns 创建的纹理对象
         */
        createTexture(name, bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX = 0, offsetY = 0, textureWidth, textureHeight) {
            if (isNaN(textureWidth)) {
                textureWidth = offsetX + bitmapWidth;
            }
            if (isNaN(textureHeight)) {
                textureHeight = offsetY + bitmapHeight;
            }
            let texture = new dou2d.Texture();
            texture.disposeBitmapData = false;
            texture.bitmapData = this._texture.bitmapData;
            texture.$initData(this._bitmapX + bitmapX, this._bitmapY + bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, this._texture.sourceWidth, this._texture.sourceHeight);
            this._textureMap[name] = texture;
            return texture;
        }
        /**
         * 释放纹理
         */
        dispose() {
            if (this._texture) {
                this._texture.dispose();
            }
        }
    }
    dou2d.SpriteSheet = SpriteSheet;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 动态纹理对象
     * * 可将显示对象及其子对象绘制成为一个纹理
     * @author wizardc
     */
    class RenderTexture extends dou2d.Texture {
        constructor() {
            super();
            this.$renderBuffer = new dou2d.rendering.RenderBuffer();
            let bitmapData = new dou2d.BitmapData(this.$renderBuffer.surface);
            bitmapData.deleteSource = false;
            this.$setBitmapData(bitmapData);
        }
        /**
         * 将指定显示对象绘制为一个纹理
         * @param displayObject 需要绘制的显示对象
         * @param clipBounds 绘制矩形区域
         * @param scale 缩放比例
         */
        drawToTexture(displayObject, clipBounds, scale = 1) {
            if (clipBounds && (clipBounds.width == 0 || clipBounds.height == 0)) {
                return false;
            }
            let bounds = clipBounds || displayObject.$getFilterClip() || displayObject.$getOriginalBounds();
            if (bounds.width == 0 || bounds.height == 0) {
                return false;
            }
            scale /= dou2d.sys.textureScaleFactor;
            let width = (bounds.x + bounds.width) * scale;
            let height = (bounds.y + bounds.height) * scale;
            if (clipBounds) {
                width = bounds.width * scale;
                height = bounds.height * scale;
            }
            let renderBuffer = this.$renderBuffer;
            if (!renderBuffer) {
                return false;
            }
            renderBuffer.resize(width, height);
            this.bitmapData.width = width;
            this.bitmapData.height = height;
            let matrix = dou.recyclable(dou2d.Matrix);
            matrix.scale(scale, scale);
            // 应用裁切
            if (clipBounds) {
                matrix.translate(-clipBounds.x, -clipBounds.y);
            }
            dou2d.sys.renderer.render(displayObject, renderBuffer, matrix);
            matrix.recycle();
            // 设置纹理参数
            this.$initData(0, 0, width, height, 0, 0, width, height, width, height);
            return true;
        }
        getPixel32(x, y) {
            let data;
            if (this.$renderBuffer) {
                let scale = dou2d.sys.textureScaleFactor;
                x = Math.round(x / scale);
                y = Math.round(y / scale);
                data = this.$renderBuffer.getPixels(x, y, 1, 1);
            }
            return data;
        }
        dispose() {
            super.dispose();
            this.$renderBuffer = null;
        }
    }
    dou2d.RenderTexture = RenderTexture;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 拖拽管理器类
     * @author wizardc
     */
    class DragManager {
        constructor() {
            this._dragging = false;
            dou2d.sys.stage.on(dou2d.TouchEvent.TOUCH_MOVE, this.stageMoveHandler, this);
        }
        static get instance() {
            return DragManager._instance || (DragManager._instance = new DragManager());
        }
        get dragging() {
            return this._dragging;
        }
        get originDrag() {
            return this._originDrag;
        }
        $dropRegister(target, canDrop) {
            if (canDrop) {
                target.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onMove, this);
                target.on(dou2d.TouchEvent.TOUCH_MOVE, this.onMove, this);
                target.on(dou2d.TouchEvent.TOUCH_END, this.onEnd, this);
            }
            else {
                target.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onMove, this);
                target.off(dou2d.TouchEvent.TOUCH_MOVE, this.onMove, this);
                target.off(dou2d.TouchEvent.TOUCH_END, this.onEnd, this);
            }
        }
        stageMoveHandler(event) {
            if (this._dragging && this._dropTarget) {
                let end = false;
                if (this._dropTarget instanceof dou2d.DisplayObjectContainer) {
                    end = !this._dropTarget.contains(event.target);
                }
                else {
                    end = this._dropTarget !== event.target;
                }
                if (end) {
                    this._dropTarget.dispatchDragEvent(dou2d.DragEvent.DRAG_EXIT, this._dragData);
                    this._dropTarget = undefined;
                }
            }
        }
        onMove(event) {
            if (this._dragging) {
                if (!this._dropTarget) {
                    this._dropTarget = event.currentTarget;
                    this._dropTarget.dispatchDragEvent(dou2d.DragEvent.DRAG_ENTER, this._dragData);
                }
                else {
                    this._dropTarget.dispatchDragEvent(dou2d.DragEvent.DRAG_MOVE, this._dragData);
                }
            }
        }
        onEnd(event) {
            if (this._dragging && this._dropTarget) {
                this._dropTarget.dispatchDragEvent(dou2d.DragEvent.DRAG_DROP, this._dragData);
                this._dragging = false;
                this._dropTarget = undefined;
                this._dragData = undefined;
                this.endDrag();
            }
        }
        doDrag(dragTarget, touchEvent, dragData, dragImage, xOffset, yOffset, imageAlpha = 1) {
            this._dragging = true;
            this._originDrag = dragTarget;
            if (dragImage) {
                this._dragTarget = dragImage;
            }
            else {
                let rt = new dou2d.RenderTexture();
                rt.drawToTexture(dragTarget);
                this._dragTarget = new dou2d.Bitmap(rt);
            }
            this._dragData = dragData;
            this._dragTarget.touchEnabled = false;
            if (this._dragTarget instanceof dou2d.DisplayObjectContainer) {
                this._dragTarget.touchChildren = false;
            }
            this._dragTarget.alpha = imageAlpha;
            dou2d.sys.stage.addChild(this._dragTarget);
            this._offsetX = xOffset;
            this._offsetY = yOffset;
            dou2d.sys.stage.on(dou2d.TouchEvent.TOUCH_MOVE, this.onStageMove, this);
            dou2d.sys.stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageEnd, this);
            this.onStageMove(touchEvent);
            this._originDrag.dispatchDragEvent(dou2d.DragEvent.DRAG_START, this._dragData);
            return this._dragTarget;
        }
        onStageMove(event) {
            this._dragTarget.x = event.stageX + this._offsetX;
            this._dragTarget.y = event.stageY + this._offsetY;
        }
        onStageEnd(event) {
            if (this._dragging) {
                this._originDrag.dispatchDragEvent(dou2d.DragEvent.DRAG_OVER, this._dragData);
                this._dragging = false;
                this._dropTarget = undefined;
                this._dragData = undefined;
                this.endDrag();
            }
        }
        endDrag() {
            dou2d.sys.stage.off(dou2d.TouchEvent.TOUCH_MOVE, this.onStageMove, this);
            dou2d.sys.stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageEnd, this);
            dou2d.sys.stage.removeChild(this._dragTarget);
            this._dragTarget = undefined;
            this._originDrag = undefined;
        }
    }
    dou2d.DragManager = DragManager;
})(dou2d || (dou2d = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchEvent2D: {
            value: function (type, data, bubbles, cancelable) {
                let event = dou.recyclable(dou2d.Event2D);
                event.$initEvent2D(type, data, bubbles, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var dou2d;
(function (dou2d) {
    /**
     * 2D 事件
     * @author wizardc
     */
    class Event2D extends dou.Event {
        constructor() {
            super(...arguments);
            this._bubbles = false;
            this._isPropagationStopped = false;
        }
        get bubbles() {
            return this._bubbles;
        }
        get currentTarget() {
            return this._currentTarget;
        }
        $initEvent2D(type, data, bubbles, cancelable) {
            this.$initEvent(type, data, cancelable);
            this._bubbles = bubbles;
        }
        $setCurrentTarget(currentTarget) {
            this._currentTarget = currentTarget;
        }
        stopPropagation() {
            if (this._bubbles) {
                this._isPropagationStopped = true;
            }
        }
        $isPropagationStopped() {
            return this._isPropagationStopped;
        }
        onRecycle() {
            super.onRecycle();
            this._bubbles = false;
            this._currentTarget = null;
            this._isPropagationStopped = false;
        }
    }
    Event2D.ADDED_TO_STAGE = "addedToStage";
    Event2D.REMOVED_FROM_STAGE = "removedFromStage";
    Event2D.ADDED = "added";
    Event2D.REMOVED = "removed";
    Event2D.ENTER_FRAME = "enterFrame";
    Event2D.FIXED_ENTER_FRAME = "fixedEnterFrame";
    Event2D.SHOWED = "showed";
    Event2D.HIDDEN = "hidden";
    Event2D.RENDER = "render";
    Event2D.RESIZE = "resize";
    Event2D.FOCUS_IN = "focusIn";
    Event2D.FOCUS_OUT = "focusOut";
    Event2D.UPDATE_TEXT = "updateText";
    Event2D.LINK = "link";
    dou2d.Event2D = Event2D;
})(dou2d || (dou2d = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchTouchEvent: {
            value: function (type, stageX, stageY, touchPointID, touchDown, bubbles, cancelable) {
                let event = dou.recyclable(dou2d.TouchEvent);
                event.$initTouchEvent(type, stageX, stageY, touchPointID, touchDown, bubbles, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var dou2d;
(function (dou2d) {
    /**
     * 触摸事件
     * @author wizardc
     */
    class TouchEvent extends dou2d.Event2D {
        constructor() {
            super(...arguments);
            this._localChanged = false;
        }
        get touchPointID() {
            return this._touchPointID;
        }
        get touchDown() {
            return this._touchDown;
        }
        get stageX() {
            return this._stageX;
        }
        get stageY() {
            return this._stageY;
        }
        get localX() {
            if (this._localChanged) {
                this.getLocalPosition();
            }
            return this._localX;
        }
        get localY() {
            if (this._localChanged) {
                this.getLocalPosition();
            }
            return this._localY;
        }
        $initTouchEvent(type, stageX, stageY, touchPointID, touchDown, bubbles, cancelable) {
            this.$initEvent2D(type, null, bubbles, cancelable);
            this._touchPointID = touchPointID;
            this._touchDown = touchDown;
            this._stageX = stageX;
            this._stageY = stageY;
        }
        $setTarget(target) {
            super.$setTarget(target);
            this._localChanged = true;
        }
        getLocalPosition() {
            this._localChanged = false;
            let m = this.target.$getInvertedConcatenatedMatrix();
            let localPoint = dou.recyclable(dou2d.Point);
            m.transformPoint(this._stageX, this._stageY, localPoint);
            this._localX = localPoint.x;
            this._localY = localPoint.y;
            localPoint.recycle();
        }
        onRecycle() {
            super.onRecycle();
            this._touchPointID = NaN;
            this._touchDown = false;
            this._stageX = NaN;
            this._stageY = NaN;
            this._localChanged = false;
            this._localX = NaN;
            this._localY = NaN;
        }
    }
    TouchEvent.TOUCH_BEGIN = "touchBegin";
    TouchEvent.TOUCH_MOVE = "touchMove";
    TouchEvent.TOUCH_END = "touchEnd";
    TouchEvent.TOUCH_CANCEL = "touchCancel";
    TouchEvent.TOUCH_TAP = "touchTap";
    TouchEvent.TOUCH_RELEASE_OUTSIDE = "touchReleaseOutside";
    dou2d.TouchEvent = TouchEvent;
})(dou2d || (dou2d = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchDragEvent: {
            value: function (type, dragData, bubbles, cancelable) {
                let event = dou.recyclable(dou2d.DragEvent);
                event.$initDragEvent(type, dragData, bubbles, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var dou2d;
(function (dou2d) {
    /**
     * 拖拽事件
     * @author wizardc
     */
    class DragEvent extends dou2d.Event2D {
        get dragData() {
            return this._dragData;
        }
        $initDragEvent(type, dragData, bubbles, cancelable) {
            this.$initEvent2D(type, null, bubbles, cancelable);
            this._dragData = dragData;
        }
        onRecycle() {
            super.onRecycle();
            this._dragData = null;
        }
    }
    /**
     * 拖拽对象进入接受安放的拖拽区域时, 由接受对象播放
     */
    DragEvent.DRAG_ENTER = "dragEnter";
    /**
     * 拖拽对象在接受安放的拖拽区域中移动时, 由接受对象播放
     */
    DragEvent.DRAG_MOVE = "dragMove";
    /**
     * 拖拽对象在离开接受安放的拖拽区域时, 由接受对象播放
     */
    DragEvent.DRAG_EXIT = "dragExit";
    /**
     * 拖拽对象在接受安放的拖拽区域放下时, 由接受对象播放
     */
    DragEvent.DRAG_DROP = "dragDrop";
    /**
     * 拖拽对象开始拖拽时, 由拖拽对象播放
     */
    DragEvent.DRAG_START = "dragStart";
    /**
     * 拖拽对象在无效的区域放下时, 由拖拽对象播放
     */
    DragEvent.DRAG_OVER = "dragOver";
    dou2d.DragEvent = DragEvent;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 滤镜基类
     * @author wizardc
     */
    class Filter {
        constructor(type) {
            this._paddingTop = 0;
            this._paddingBottom = 0;
            this._paddingLeft = 0;
            this._paddingRight = 0;
            this._type = type;
            this.$uniforms = {};
        }
        get type() {
            return this._type;
        }
        onPropertyChange() {
            this.updatePadding();
        }
        updatePadding() {
        }
    }
    dou2d.Filter = Filter;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 颜色刷子着色器
     * * 将显示对象刷成一种单一颜色
     * @author wizardc
     */
    class ColorBrushFilter extends dou2d.Filter {
        constructor(r = 1, g = 1, b = 1, a = 1) {
            super("colorBrush");
            this.$uniforms.r = r;
            this.$uniforms.g = g;
            this.$uniforms.b = b;
            this.$uniforms.a = a;
            this.onPropertyChange();
        }
        set r(value) {
            this.$uniforms.r = value;
            this.onPropertyChange();
        }
        get r() {
            return this.$uniforms.r;
        }
        set g(value) {
            this.$uniforms.g = value;
            this.onPropertyChange();
        }
        get g() {
            return this.$uniforms.g;
        }
        set b(value) {
            this.$uniforms.b = value;
            this.onPropertyChange();
        }
        get b() {
            return this.$uniforms.b;
        }
        set a(value) {
            this.$uniforms.a = value;
            this.onPropertyChange();
        }
        get a() {
            return this.$uniforms.a;
        }
    }
    dou2d.ColorBrushFilter = ColorBrushFilter;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 颜色转换滤镜
     * * 允许饱和度更改, 色相旋转, 亮度调整等
     * @author wizardc
     */
    class ColorMatrixFilter extends dou2d.Filter {
        /**
         * @param matrix 一个 4 x 5 矩阵, 第一行五个元素乘以矢量 [srcR,srcG,srcB,srcA,1] 以确定输出的红色值, 第二行的五个元素确定输出的绿色值, 以此类推
         */
        constructor(matrix) {
            super("colorTransform");
            this.$uniforms.matrix = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
            this.$uniforms.colorAdd = { x: 0, y: 0, z: 0, w: 0 };
            this._matrix = [];
            this.setMatrix(matrix);
            this.onPropertyChange();
        }
        /**
         * 一个 4 x 5 矩阵, 第一行五个元素乘以矢量 [srcR,srcG,srcB,srcA,1] 以确定输出的红色值, 第二行的五个元素确定输出的绿色值, 以此类推
         */
        set matrix(value) {
            this.setMatrix(value);
        }
        get matrix() {
            return this._matrix;
        }
        setMatrix(value) {
            if (value) {
                for (let i = 0; i < 20; i++) {
                    this._matrix[i] = value[i];
                }
            }
            else {
                for (let i = 0; i < 20; i++) {
                    this._matrix[i] = (i == 0 || i == 6 || i == 12 || i == 18) ? 1 : 0;
                }
            }
            let m = this._matrix;
            let matrix = this.$uniforms.matrix;
            let colorAdd = this.$uniforms.colorAdd;
            for (let i = 0, j = 0; i < m.length; i++) {
                if (i === 4) {
                    colorAdd.x = m[i] / 255;
                }
                else if (i === 9) {
                    colorAdd.y = m[i] / 255;
                }
                else if (i === 14) {
                    colorAdd.z = m[i] / 255;
                }
                else if (i === 19) {
                    colorAdd.w = m[i] / 255;
                }
                else {
                    matrix[j] = m[i];
                    j++;
                }
            }
            this.onPropertyChange();
        }
    }
    dou2d.ColorMatrixFilter = ColorMatrixFilter;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 模糊滤镜
     * @author wizardc
     */
    class BlurFilter extends dou2d.Filter {
        /**
         * @param blurX 水平模糊量
         * @param blurY 垂直模糊量
         */
        constructor(blurX = 4, blurY = 4) {
            super("blur");
            this._blurX = blurX;
            this._blurY = blurY;
            this.$blurXFilter = new filter.BlurXFilter(blurX);
            this.$blurYFilter = new filter.BlurYFilter(blurY);
            this.onPropertyChange();
        }
        /**
         * 水平模糊量
         */
        set blurX(value) {
            if (this._blurX == value) {
                return;
            }
            this._blurX = value;
            this.$blurXFilter.blurX = value;
            this.onPropertyChange();
        }
        get blurX() {
            return this._blurX;
        }
        /**
         * 垂直模糊量
         */
        set blurY(value) {
            if (this._blurY == value) {
                return;
            }
            this._blurY = value;
            this.$blurYFilter.blurY = value;
            this.onPropertyChange();
        }
        get blurY() {
            return this._blurY;
        }
        updatePadding() {
            this._paddingLeft = this._blurX;
            this._paddingRight = this._blurX;
            this._paddingTop = this._blurY;
            this._paddingBottom = this._blurY;
        }
    }
    dou2d.BlurFilter = BlurFilter;
    let filter;
    (function (filter) {
        /**
         * @private
         */
        class BlurXFilter extends dou2d.Filter {
            constructor(blurX = 4) {
                super("blurX");
                this.$uniforms.blur = { x: blurX, y: 0 };
                this.onPropertyChange();
            }
            set blurX(value) {
                this.$uniforms.blur.x = value;
            }
            get blurX() {
                return this.$uniforms.blur.x;
            }
        }
        filter.BlurXFilter = BlurXFilter;
        /**
         * @private
         */
        class BlurYFilter extends dou2d.Filter {
            constructor(blurY = 4) {
                super("blurY");
                this.$uniforms.blur = { x: 0, y: blurY };
                this.onPropertyChange();
            }
            set blurY(value) {
                this.$uniforms.blur.y = value;
            }
            get blurY() {
                return this.$uniforms.blur.y;
            }
        }
        filter.BlurYFilter = BlurYFilter;
    })(filter = dou2d.filter || (dou2d.filter = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    const sourceKeyMap = {};
    /**
     * 自定义滤镜
     * @author wizardc
     */
    class CustomFilter extends dou2d.Filter {
        /**
         * @param vertexSrc 自定义的顶点着色器程序
         * @param fragmentSrc 自定义的片段着色器程序
         * @param uniforms 着色器中 uniform 的初始值 (key -> value), 目前仅支持数字和数组
         */
        constructor(vertexSrc, fragmentSrc, uniforms = {}) {
            super("custom");
            this._padding = 0;
            this.$vertexSrc = vertexSrc;
            this.$fragmentSrc = fragmentSrc;
            let tempKey = vertexSrc + fragmentSrc;
            if (!sourceKeyMap[tempKey]) {
                sourceKeyMap[tempKey] = dou2d.UUID.generate();
            }
            this.$shaderKey = sourceKeyMap[tempKey];
            this.$uniforms = uniforms;
        }
        /**
         * 滤镜的内边距
         * 如果自定义滤镜所需区域比原区域大 (描边等), 需要手动设置
         */
        set padding(value) {
            if (this._padding == value) {
                return;
            }
            this._padding = value;
            this.onPropertyChange();
        }
        get padding() {
            return this._padding;
        }
        /**
         * 着色器中 uniform 的值
         */
        get uniforms() {
            return this.$uniforms;
        }
        onPropertyChange() {
        }
    }
    dou2d.CustomFilter = CustomFilter;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 发光滤镜
     * @author wizardc
     */
    class GlowFilter extends dou2d.Filter {
        /**
         * @param color 光晕颜色
         * @param alpha 透明度
         * @param blurX 水平模糊, 有效值为 0 到 255
         * @param blurY 垂直模糊, 有效值为 0 到 255
         * @param strength 强度, 有效值为 0 到 255
         * @param inner 是否为内发光
         * @param knockout 是否具有挖空效果
         */
        constructor(color = 0xff0000, alpha = 1, blurX = 6, blurY = 6, strength = 2, inner = false, knockout = false) {
            super("glow");
            this._color = color;
            this._blue = color & 0x0000ff;
            this._green = (color & 0x00ff00) >> 8;
            this._red = color >> 16;
            this._alpha = alpha;
            this._blurX = blurX;
            this._blurY = blurY;
            this._strength = strength;
            this._inner = inner;
            this._knockout = knockout;
            this.$uniforms.color = { x: this._red / 255, y: this._green / 255, z: this._blue / 255, w: 1 };
            this.$uniforms.alpha = alpha;
            this.$uniforms.blurX = blurX;
            this.$uniforms.blurY = blurY;
            this.$uniforms.strength = strength;
            this.$uniforms.inner = inner ? 1 : 0;
            this.$uniforms.knockout = knockout ? 0 : 1;
            this.$uniforms.dist = 0;
            this.$uniforms.angle = 0;
            this.$uniforms.hideObject = 0;
            this.onPropertyChange();
        }
        /**
         * 光晕颜色
         */
        set color(value) {
            if (this._color == value) {
                return;
            }
            this._color = value;
            this._blue = value & 0x0000ff;
            this._green = (value & 0x00ff00) >> 8;
            this._red = value >> 16;
            this.$uniforms.color.x = this._red / 255;
            this.$uniforms.color.y = this._green / 255;
            this.$uniforms.color.z = this._blue / 255;
        }
        get color() {
            return this._color;
        }
        /**
         * 透明度
         */
        set alpha(value) {
            if (this._alpha == value) {
                return;
            }
            this._alpha = value;
            this.$uniforms.alpha = value;
        }
        get alpha() {
            return this._alpha;
        }
        /**
         * 水平模糊, 有效值为 0 到 255
         */
        set blurX(value) {
            if (this._blurX == value) {
                return;
            }
            this._blurX = value;
            this.$uniforms.blurX = value;
            this.onPropertyChange();
        }
        get blurX() {
            return this._blurX;
        }
        /**
         * 垂直模糊, 有效值为 0 到 255
         */
        set blurY(value) {
            if (this._blurY == value) {
                return;
            }
            this._blurY = value;
            this.$uniforms.blurY = value;
            this.onPropertyChange();
        }
        get blurY() {
            return this._blurY;
        }
        /**
         * 强度, 有效值为 0 到 255
         */
        set strength(value) {
            if (this._strength == value) {
                return;
            }
            this._strength = value;
            this.$uniforms.strength = value;
        }
        get strength() {
            return this._strength;
        }
        /**
         * 是否为内发光
         */
        set inner(value) {
            if (this._inner == value) {
                return;
            }
            this._inner = value;
            this.$uniforms.inner = value ? 1 : 0;
        }
        get inner() {
            return this._inner;
        }
        /**
         * 是否具有挖空效果
         */
        set knockout(value) {
            if (this._knockout == value) {
                return;
            }
            this._knockout = value;
            this.$uniforms.knockout = value ? 0 : 1;
        }
        get knockout() {
            return this._knockout;
        }
        updatePadding() {
            this._paddingLeft = this._blurX;
            this._paddingRight = this._blurX;
            this._paddingTop = this._blurY;
            this._paddingBottom = this._blurY;
        }
    }
    dou2d.GlowFilter = GlowFilter;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 投影滤镜
     * @author wizardc
     */
    class DropShadowFilter extends dou2d.GlowFilter {
        /**
         * @param distance 阴影的偏移距离
         * @param angle 阴影的角度
         * @param color 光晕颜色
         * @param alpha 透明度
         * @param blurX 水平模糊, 有效值为 0 到 255
         * @param blurY 垂直模糊, 有效值为 0 到 255
         * @param strength 强度, 有效值为 0 到 255
         * @param inner 是否为内发光
         * @param knockout 是否具有挖空效果
         * @param hideObject 是否隐藏对象
         */
        constructor(distance = 4, angle = 45, color = 0, alpha = 1, blurX = 4, blurY = 4, strength = 1, inner = false, knockout = false, hideObject = false) {
            super(color, alpha, blurX, blurY, strength, inner, knockout);
            this._distance = distance;
            this._angle = angle;
            this._hideObject = hideObject;
            this.$uniforms.dist = distance;
            this.$uniforms.angle = angle / 180 * Math.PI;
            this.$uniforms.hideObject = hideObject ? 1 : 0;
            this.onPropertyChange();
        }
        /**
         * 阴影的偏移距离
         */
        set distance(value) {
            if (this._distance == value) {
                return;
            }
            this._distance = value;
            this.$uniforms.dist = value;
            this.onPropertyChange();
        }
        get distance() {
            return this._distance;
        }
        /**
         * 阴影的角度
         */
        set angle(value) {
            if (this._angle == value) {
                return;
            }
            this._angle = value;
            this.$uniforms.angle = value / 180 * Math.PI;
            this.onPropertyChange();
        }
        get angle() {
            return this._angle;
        }
        /**
         * 是否隐藏对象
         */
        set hideObject(value) {
            if (this._hideObject == value) {
                return;
            }
            this._hideObject = value;
            this.$uniforms.hideObject = value ? 1 : 0;
        }
        get hideObject() {
            return this._hideObject;
        }
        updatePadding() {
            this._paddingLeft = this._blurX;
            this._paddingRight = this._blurX;
            this._paddingTop = this._blurY;
            this._paddingBottom = this._blurY;
            let distance = this._distance || 0;
            let angle = this._angle || 0;
            let distanceX = 0;
            let distanceY = 0;
            if (distance != 0) {
                distanceX = distance * Math.cos(angle);
                if (distanceX > 0) {
                    distanceX = Math.ceil(distanceX);
                }
                else {
                    distanceX = Math.floor(distanceX);
                }
                distanceY = distance * Math.sin(angle);
                if (distanceY > 0) {
                    distanceY = Math.ceil(distanceY);
                }
                else {
                    distanceY = Math.floor(distanceY);
                }
                this._paddingLeft += distanceX;
                this._paddingRight += distanceX;
                this._paddingTop += distanceY;
                this._paddingBottom += distanceY;
            }
        }
    }
    dou2d.DropShadowFilter = DropShadowFilter;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 图片加载器
     * @author wizardc
     */
    class ImageAnalyzer {
        load(url, callback, thisObj) {
            let loader = new dou.ImageLoader();
            loader.crossOrigin = true;
            loader.on(dou.Event.COMPLETE, () => {
                callback.call(thisObj, url, this.createTexture(loader.data));
            });
            loader.on(dou.IOErrorEvent.IO_ERROR, () => {
                callback.call(thisObj, url);
            });
            loader.load(url);
        }
        createTexture(img) {
            let bitmapData = new dou2d.BitmapData(img);
            let texture = new dou2d.Texture();
            texture.$setBitmapData(bitmapData);
            return texture;
        }
        release(data) {
            if (data) {
                data.dispose();
                return true;
            }
            return false;
        }
    }
    dou2d.ImageAnalyzer = ImageAnalyzer;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 粒子系统基类
     * @author wizardc
     */
    class ParticleSystem extends dou2d.DisplayObject {
        constructor(texture, emissionRate, maxParticles) {
            super();
            /**
             * 表示粒子系统最大粒子数, 超过该数量将不会继续创建粒子
             */
            this._maxParticles = 200;
            this._emissionTime = -1;
            this._frameTime = 0;
            this._numParticles = 0;
            this._emitterX = 0;
            this._emitterY = 0;
            this._texture = texture;
            this._emissionRate = emissionRate;
            this._maxParticles = maxParticles;
            this._particles = [];
            this._particleMeasureRect = new dou2d.Rectangle();
            this._transformForMeasure = new dou2d.Matrix();
            this._bitmapNodeList = [];
            this.$renderNode = new dou2d.rendering.GroupNode();
            // 不清除绘制数据
            this.$renderNode.cleanBeforeRender = function () { };
        }
        /**
         * 表示粒子出现点 x 坐标
         */
        set emitterX(value) {
            this._emitterX = value;
        }
        get emitterX() {
            return this._emitterX;
        }
        /**
         * 表示粒子出现点 y 坐标
         */
        set emitterY(value) {
            this._emitterY = value;
        }
        get emitterY() {
            return this._emitterY;
        }
        /**
         * 更换粒子纹理
         */
        changeTexture(texture) {
            if (this._texture != texture) {
                this._texture = texture;
                this._bitmapNodeList.length = 0;
                this.$renderNode.drawData.length = 0;
            }
        }
        /**
         * 开始创建粒子
         * @param duration 粒子出现总时间, -1 表示无限时间
         */
        start(duration = -1) {
            if (this._emissionRate != 0) {
                this._emissionTime = duration;
                dou2d.sys.ticker.startTick(this.update, this);
            }
        }
        update(passedTime) {
            if (this._emissionTime == -1 || this._emissionTime > 0) {
                this._frameTime += passedTime;
                while (this._frameTime > 0) {
                    if (this._numParticles < this._maxParticles) {
                        this.addOneParticle();
                    }
                    this._frameTime -= this._emissionRate;
                }
                if (this._emissionTime != -1) {
                    this._emissionTime -= passedTime;
                    if (this._emissionTime < 0) {
                        this._emissionTime = 0;
                    }
                }
            }
            let particle;
            let particleIndex = 0;
            while (particleIndex < this._numParticles) {
                particle = this._particles[particleIndex];
                if (particle.currentTime < particle.totalTime) {
                    this.advanceParticle(particle, passedTime);
                    particle.currentTime += passedTime;
                    particleIndex++;
                }
                else {
                    this.removeParticle(particle);
                }
            }
            this.$renderDirty = true;
            if (this._numParticles == 0 && this._emissionTime == 0) {
                dou2d.sys.ticker.stopTick(this.update, this);
                this.dispatchEvent(dou.Event.COMPLETE);
            }
            return false;
        }
        addOneParticle() {
            let particle = this.getParticle();
            this.initParticle(particle);
            if (particle.totalTime > 0) {
                this._particles.push(particle);
                this._numParticles++;
            }
        }
        getParticle() {
            return dou.recyclable(this._particleClass);
        }
        removeParticle(particle) {
            let index = this._particles.indexOf(particle);
            if (index != -1) {
                particle.recycle();
                this._particles.splice(index, 1);
                this._numParticles--;
                if (this._bitmapNodeList.length > this._numParticles) {
                    this._bitmapNodeList.length = this._numParticles;
                    this.$renderNode.drawData.length = this._numParticles;
                }
                return true;
            }
            return false;
        }
        /**
         * 停止创建粒子
         * @param clear 是否清除掉现有粒子
         */
        stop(clear = false) {
            this._emissionTime = 0;
            if (clear) {
                this.clear();
                dou2d.sys.ticker.stopTick(this.update, this);
            }
        }
        $measureContentBounds(bounds) {
            if (this._numParticles > 0) {
                let texture = this._texture;
                let textureW = Math.round(texture.$getScaleBitmapWidth());
                let textureH = Math.round(texture.$getScaleBitmapHeight());
                let totalRect = dou.recyclable(dou2d.Rectangle);
                let particle;
                for (let i = 0; i < this._numParticles; i++) {
                    particle = this._particles[i];
                    this._transformForMeasure.identity();
                    this.appendTransform(this._transformForMeasure, particle.x, particle.y, particle.scale, particle.scale, particle.rotation, 0, 0, textureW / 2, textureH / 2);
                    this._particleMeasureRect.clear();
                    this._particleMeasureRect.width = textureW;
                    this._particleMeasureRect.height = textureH;
                    let tmpRegion = dou.recyclable(dou2d.ParticleRegion);
                    tmpRegion.updateRegion(this._particleMeasureRect, this._transformForMeasure);
                    if (i == 0) {
                        totalRect.set(tmpRegion.minX, tmpRegion.minY, tmpRegion.maxX - tmpRegion.minX, tmpRegion.maxY - tmpRegion.minY);
                    }
                    else {
                        let l = Math.min(totalRect.x, tmpRegion.minX);
                        let t = Math.min(totalRect.y, tmpRegion.minY);
                        let r = Math.max(totalRect.right, tmpRegion.maxX);
                        let b = Math.max(totalRect.bottom, tmpRegion.maxY);
                        totalRect.set(l, t, r - l, b - t);
                    }
                    tmpRegion.recycle();
                }
                this._lastRect = totalRect;
                bounds.set(totalRect.x, totalRect.y, totalRect.width, totalRect.height);
                totalRect.recycle();
            }
            else {
                if (this._lastRect) {
                    let totalRect = this._lastRect;
                    bounds.set(totalRect.x, totalRect.y, totalRect.width, totalRect.height);
                    totalRect.recycle();
                    this._lastRect = null;
                }
            }
        }
        appendTransform(matrix, x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
            let cos, sin;
            if (rotation % 360) {
                let r = rotation;
                cos = Math.cos(r);
                sin = Math.sin(r);
            }
            else {
                cos = 1;
                sin = 0;
            }
            if (skewX || skewY) {
                matrix.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
                matrix.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            }
            else {
                matrix.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
            }
            if (regX || regY) {
                matrix.tx -= regX * matrix.a + regY * matrix.c;
                matrix.ty -= regX * matrix.b + regY * matrix.d;
            }
            return matrix;
        }
        $updateRenderNode() {
            if (this._numParticles > 0) {
                let texture = this._texture;
                let textureW = Math.round(texture.$getScaleBitmapWidth());
                let textureH = Math.round(texture.$getScaleBitmapHeight());
                let offsetX = texture.offsetX;
                let offsetY = texture.offsetY;
                let bitmapX = texture.bitmapX;
                let bitmapY = texture.bitmapY;
                let bitmapWidth = texture.bitmapWidth;
                let bitmapHeight = texture.bitmapHeight;
                let particle;
                for (let i = 0; i < this._numParticles; i++) {
                    particle = this._particles[i];
                    let bitmapNode;
                    if (!this._bitmapNodeList[i]) {
                        bitmapNode = new dou2d.rendering.BitmapNode();
                        this._bitmapNodeList[i] = bitmapNode;
                        this.$renderNode.addNode(this._bitmapNodeList[i]);
                        bitmapNode.image = texture.bitmapData;
                        bitmapNode.imageWidth = texture.sourceWidth;
                        bitmapNode.imageHeight = texture.sourceHeight;
                        bitmapNode.drawImage(bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureW, textureH);
                    }
                    bitmapNode = this._bitmapNodeList[i];
                    bitmapNode.matrix = particle.getMatrix(textureW / 2, textureH / 2);
                    bitmapNode.alpha = particle.alpha;
                }
            }
        }
        clear() {
            while (this._particles.length) {
                this.removeParticle(this._particles[0]);
            }
            this._numParticles = 0;
            this.$renderNode.drawData.length = 0;
            this._bitmapNodeList.length = 0;
            this.$renderDirty = true;
            dou.clearPool(this._particleClass);
        }
    }
    dou2d.ParticleSystem = ParticleSystem;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 粒子范围
     * @author wizardc
     */
    class ParticleRegion {
        constructor() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            this.width = 0;
            this.height = 0;
            this.area = 0;
        }
        updateRegion(bounds, matrix) {
            if (bounds.width == 0 || bounds.height == 0) {
                this.clear();
                return;
            }
            let m = matrix;
            let a = m.a;
            let b = m.b;
            let c = m.c;
            let d = m.d;
            let tx = m.tx;
            let ty = m.ty;
            let x = bounds.x;
            let y = bounds.y;
            let xMax = x + bounds.width;
            let yMax = y + bounds.height;
            let minX, minY, maxX, maxY;
            // 通常情况下不缩放旋转的对象占多数, 直接加上偏移量即可
            if (a == 1 && b == 0 && c == 0 && d == 1) {
                minX = x + tx - 1;
                minY = y + ty - 1;
                maxX = xMax + tx + 1;
                maxY = yMax + ty + 1;
            }
            else {
                let x0 = a * x + c * y + tx;
                let y0 = b * x + d * y + ty;
                let x1 = a * xMax + c * y + tx;
                let y1 = b * xMax + d * y + ty;
                let x2 = a * xMax + c * yMax + tx;
                let y2 = b * xMax + d * yMax + ty;
                let x3 = a * x + c * yMax + tx;
                let y3 = b * x + d * yMax + ty;
                let tmp = 0;
                if (x0 > x1) {
                    tmp = x0;
                    x0 = x1;
                    x1 = tmp;
                }
                if (x2 > x3) {
                    tmp = x2;
                    x2 = x3;
                    x3 = tmp;
                }
                minX = (x0 < x2 ? x0 : x2) - 1;
                maxX = (x1 > x3 ? x1 : x3) + 1;
                if (y0 > y1) {
                    tmp = y0;
                    y0 = y1;
                    y1 = tmp;
                }
                if (y2 > y3) {
                    tmp = y2;
                    y2 = y3;
                    y3 = tmp;
                }
                minY = (y0 < y2 ? y0 : y2) - 1;
                maxY = (y1 > y3 ? y1 : y3) + 1;
            }
            this.minX = minX;
            this.minY = minY;
            this.maxX = maxX;
            this.maxY = maxY;
            this.width = maxX - minX;
            this.height = maxY - minY;
            this.area = this.width * this.height;
        }
        clear() {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            this.width = 0;
            this.height = 0;
            this.area = 0;
        }
        onRecycle() {
            this.clear();
        }
    }
    dou2d.ParticleRegion = ParticleRegion;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 粒子基类
     * @author wizardc
     */
    class Particle {
        constructor() {
            this._matrix = new dou2d.Matrix();
            this.clear();
        }
        getMatrix(regX, regY) {
            let matrix = this._matrix;
            matrix.identity();
            let cos, sin;
            if (this.rotation % 360) {
                let r = this.rotation;
                cos = Math.cos(r);
                sin = Math.sin(r);
            }
            else {
                cos = 1;
                sin = 0;
            }
            matrix.append(cos * this.scale, sin * this.scale, -sin * this.scale, cos * this.scale, this.x, this.y);
            if (regX || regY) {
                matrix.tx -= regX * matrix.a + regY * matrix.c;
                matrix.ty -= regX * matrix.b + regY * matrix.d;
            }
            return matrix;
        }
        clear() {
            this.x = 0;
            this.y = 0;
            this.scale = 1;
            this.rotation = 0;
            this.alpha = 1;
            this.currentTime = 0;
            this.totalTime = 1000;
        }
        onRecycle() {
            this.clear();
        }
    }
    dou2d.Particle = Particle;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 重力粒子系统
     * @author wizardc
     */
    class GravityParticleSystem extends dou2d.ParticleSystem {
        constructor(texture, config) {
            super(texture, 0, 0);
            this._particleClass = dou2d.GravityParticle;
            this.parseConfig(config);
            this._emissionRate = this._lifespan / this._maxParticles;
        }
        parseConfig(config) {
            this.emitterX = config.emitter.x;
            this.emitterY = config.emitter.y;
            this._emitterXVariance = config.emitterVariance.x;
            this._emitterYVariance = config.emitterVariance.y;
            this._gravityX = config.gravity.x;
            this._gravityY = config.gravity.y;
            this._maxParticles = config.maxParticles;
            this._speed = config.speed;
            this._speedVariance = config.speedVariance;
            this._lifespan = Math.max(0.01, config.lifespan);
            this._lifespanVariance = config.lifespanVariance;
            this._emitAngle = config.emitAngle;
            this._emitAngleVariance = config.emitAngleVariance;
            this._startSize = config.startSize;
            this._startSizeVariance = config.startSizeVariance;
            this._endSize = config.endSize;
            this._endSizeVariance = config.endSizeVariance;
            this._startRotation = config.startRotation;
            this._startRotationVariance = config.startRotationVariance;
            this._endRotation = config.endRotation;
            this._endRotationVariance = config.endRotationVariance;
            this._radialAcceleration = config.radialAcceleration;
            this._radialAccelerationVariance = config.radialAccelerationVariance;
            this._tangentialAcceleration = config.tangentialAcceleration;
            this._tangentialAccelerationVariance = config.tangentialAccelerationVariance;
            this._startAlpha = config.startAlpha;
            this._startAlphaVariance = config.startAlphaVariance;
            this._endAlpha = config.endAlpha;
            this._endAlphaVariance = config.endAlphaVariance;
        }
        initParticle(particle) {
            let locParticle = particle;
            let lifespan = this.getValue(this._lifespan, this._lifespanVariance);
            locParticle.currentTime = 0;
            locParticle.totalTime = lifespan > 0 ? lifespan : 0;
            if (lifespan <= 0) {
                return;
            }
            locParticle.x = this.getValue(this.emitterX, this._emitterXVariance);
            locParticle.y = this.getValue(this.emitterY, this._emitterYVariance);
            locParticle.startX = this.emitterX;
            locParticle.startY = this.emitterY;
            let angle = this.getValue(this._emitAngle, this._emitAngleVariance);
            let speed = this.getValue(this._speed, this._speedVariance);
            locParticle.velocityX = speed * Math.cos(angle);
            locParticle.velocityY = speed * Math.sin(angle);
            locParticle.radialAcceleration = this.getValue(this._radialAcceleration, this._radialAccelerationVariance);
            locParticle.tangentialAcceleration = this.getValue(this._tangentialAcceleration, this._tangentialAccelerationVariance);
            let startSize = this.getValue(this._startSize, this._startSizeVariance);
            if (startSize < 0.1) {
                startSize = 0.1;
            }
            let endSize = this.getValue(this._endSize, this._endSizeVariance);
            if (endSize < 0.1) {
                endSize = 0.1;
            }
            let textureWidth = this._texture.textureWidth;
            locParticle.scale = startSize / textureWidth;
            locParticle.scaleDelta = ((endSize - startSize) / lifespan) / textureWidth;
            let startRotation = this.getValue(this._startRotation, this._startRotationVariance);
            let endRotation = this.getValue(this._endRotation, this._endRotationVariance);
            locParticle.rotation = startRotation;
            locParticle.rotationDelta = (endRotation - startRotation) / lifespan;
            let startAlpha = this.getValue(this._startAlpha, this._startAlphaVariance);
            let endAlpha = this.getValue(this._endAlpha, this._endAlphaVariance);
            locParticle.alpha = startAlpha;
            locParticle.alphaDelta = (endAlpha - startAlpha) / lifespan;
        }
        getValue(base, variance) {
            return base + variance * (Math.random() * 2 - 1);
        }
        advanceParticle(particle, passedTime) {
            let locParticle = particle;
            passedTime = passedTime / 1000;
            let restTime = locParticle.totalTime - locParticle.currentTime;
            passedTime = restTime > passedTime ? passedTime : restTime;
            locParticle.currentTime += passedTime;
            let distanceX = locParticle.x - locParticle.startX;
            let distanceY = locParticle.y - locParticle.startY;
            let distanceScalar = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (distanceScalar < 0.01) {
                distanceScalar = 0.01;
            }
            let radialX = distanceX / distanceScalar;
            let radialY = distanceY / distanceScalar;
            let tangentialX = radialX;
            let tangentialY = radialY;
            radialX *= locParticle.radialAcceleration;
            radialY *= locParticle.radialAcceleration;
            let temp = tangentialX;
            tangentialX = -tangentialY * locParticle.tangentialAcceleration;
            tangentialY = temp * locParticle.tangentialAcceleration;
            locParticle.velocityX += passedTime * (this._gravityX + radialX + tangentialX);
            locParticle.velocityY += passedTime * (this._gravityY + radialY + tangentialY);
            locParticle.x += locParticle.velocityX * passedTime;
            locParticle.y += locParticle.velocityY * passedTime;
            locParticle.scale += locParticle.scaleDelta * passedTime * 1000;
            if (locParticle.scale < 0) {
                locParticle.scale = 0;
            }
            locParticle.rotation += locParticle.rotationDelta * passedTime * 1000;
            locParticle.alpha += locParticle.alphaDelta * passedTime * 1000;
        }
    }
    dou2d.GravityParticleSystem = GravityParticleSystem;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 重力粒子
     * @author wizardc
     */
    class GravityParticle extends dou2d.Particle {
        clear() {
            super.clear();
            this.startX = 0;
            this.startY = 0;
            this.velocityX = 0;
            this.velocityY = 0;
            this.radialAcceleration = 0;
            this.tangentialAcceleration = 0;
            this.rotationDelta = 0;
            this.scaleDelta = 0;
        }
    }
    dou2d.GravityParticle = GravityParticle;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 渲染节点基类
         * @author wizardc
         */
        class RenderNode {
            constructor() {
                /**
                 * 绘制次数
                 */
                this._renderCount = 0;
                this.drawData = [];
            }
            get renderCount() {
                return this._renderCount;
            }
            /**
             * 自动清空自身的绘制数据
             */
            cleanBeforeRender() {
                this.drawData.length = 0;
                this._renderCount = 0;
            }
        }
        rendering.RenderNode = RenderNode;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 普通位图渲染节点
         * @author wizardc
         */
        class NormalBitmapNode extends rendering.RenderNode {
            constructor() {
                super();
                /**
                 * 控制在缩放时是否对位图进行平滑处理
                 */
                this.smoothing = true;
                /**
                 * 翻转
                 */
                this.rotated = false;
                this.type = 1 /* normalBitmapNode */;
            }
            static updateTextureData(node, image, bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, destW, destH, sourceWidth, sourceHeight, fillMode, smoothing) {
                if (!image) {
                    return;
                }
                let scale = dou2d.sys.textureScaleFactor;
                node.smoothing = smoothing;
                node.image = image;
                node.imageWidth = sourceWidth;
                node.imageHeight = sourceHeight;
                if (fillMode == "scale" /* scale */) {
                    let tsX = destW / textureWidth * scale;
                    let tsY = destH / textureHeight * scale;
                    node.drawImage(bitmapX, bitmapY, bitmapWidth, bitmapHeight, tsX * offsetX, tsY * offsetY, tsX * bitmapWidth, tsY * bitmapHeight);
                }
                else if (fillMode == "clip" /* clip */) {
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
            static drawClipImage(node, scale, bitmapX, bitmapY, scaledBitmapW, scaledBitmapH, offsetX, offsetY, destW, destH, startX = 0, startY = 0) {
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
             * 绘制一次位图
             */
            drawImage(sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH) {
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
            cleanBeforeRender() {
                super.cleanBeforeRender();
                this.image = null;
            }
        }
        rendering.NormalBitmapNode = NormalBitmapNode;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 位图渲染节点
         * @author wizardc
         */
        class BitmapNode extends rendering.RenderNode {
            constructor() {
                super();
                /**
                 * 控制在缩放时是否对位图进行平滑处理
                 */
                this.smoothing = true;
                /**
                 * 翻转
                 */
                this.rotated = false;
                this.type = 2 /* bitmapNode */;
            }
            /**
             * 绘制九宫格位图
             */
            static updateTextureDataWithScale9Grid(node, image, scale9Grid, bitmapX, bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, destW, destH, sourceWidth, sourceHeight, smoothing) {
                node.smoothing = smoothing;
                node.image = image;
                node.imageWidth = sourceWidth;
                node.imageHeight = sourceHeight;
                let imageWidth = bitmapWidth;
                let imageHeight = bitmapHeight;
                destW = destW - (textureWidth - bitmapWidth * dou2d.sys.textureScaleFactor);
                destH = destH - (textureHeight - bitmapHeight * dou2d.sys.textureScaleFactor);
                let targetW0 = scale9Grid.x - offsetX;
                let targetH0 = scale9Grid.y - offsetY;
                let sourceW0 = targetW0 / dou2d.sys.textureScaleFactor;
                let sourceH0 = targetH0 / dou2d.sys.textureScaleFactor;
                let sourceW1 = scale9Grid.width / dou2d.sys.textureScaleFactor;
                let sourceH1 = scale9Grid.height / dou2d.sys.textureScaleFactor;
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
                let targetW2 = sourceW2 * dou2d.sys.textureScaleFactor;
                let targetH2 = sourceH2 * dou2d.sys.textureScaleFactor;
                if ((sourceW0 + sourceW2) * dou2d.sys.textureScaleFactor > destW || (sourceH0 + sourceH2) * dou2d.sys.textureScaleFactor > destH) {
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
             * 绘制一次位图
             */
            drawImage(sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH) {
                this.drawData.push(sourceX, sourceY, sourceW, sourceH, drawX, drawY, drawW, drawH);
                this._renderCount++;
            }
            cleanBeforeRender() {
                super.cleanBeforeRender();
                this.image = null;
                this.matrix = null;
                this.blendMode = null;
                this.alpha = NaN;
                this.filter = null;
            }
        }
        rendering.BitmapNode = BitmapNode;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 文本渲染节点
         * @author wizardc
         */
        class TextNode extends rendering.RenderNode {
            constructor() {
                super();
                this.dirtyRender = true;
                /**
                 * 颜色值
                 */
                this.textColor = 0xFFFFFF;
                /**
                 * 描边颜色值
                 */
                this.strokeColor = 0x000000;
                /**
                 * 字号
                 */
                this.size = 30;
                /**
                 * 描边大小
                 */
                this.stroke = 0;
                /**
                 * 是否加粗
                 */
                this.bold = false;
                /**
                 * 是否倾斜
                 */
                this.italic = false;
                /**
                 * 字体名称
                 */
                this.fontFamily = "Arial";
                this.type = 3 /* textNode */;
            }
            /**
             * 绘制一行文本
             */
            drawText(x, y, text, format) {
                this.drawData.push(x, y, text, format);
                this._renderCount++;
                this.dirtyRender = true;
            }
            cleanBeforeRender() {
                super.cleanBeforeRender();
                this.dirtyRender = true;
            }
            /**
             * 清除非绘制的缓存数据
             */
            clean() {
                if (this.texture) {
                    dou2d.WebGLUtil.deleteTexture(this.texture);
                    this.texture = null;
                    this.dirtyRender = true;
                }
            }
        }
        rendering.TextNode = TextNode;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        rendering.CAPS_STYLES = ["none", "round", "square"];
        rendering.JOINT_STYLES = ["bevel", "miter", "round"];
        /**
         * 矢量渲染节点
         * @author wizardc
         */
        class GraphicsNode extends rendering.RenderNode {
            constructor() {
                super();
                /**
                 * 脏渲染标记
                 */
                this.dirtyRender = true;
                this.type = 4 /* graphicsNode */;
            }
            /**
             * 指定一种简单的单一颜色填充
             * @param beforePath 插入在指定的路径命令之前绘制, 通常是插入到当前正在绘制的线条路径之前, 以确保线条总在填充的上方
             */
            beginFill(color, alpha = 1, beforePath) {
                let path = new rendering.FillPath();
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
            beginGradientFill(type, colors, alphas, ratios, matrix, beforePath) {
                let m = new dou2d.Matrix();
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
                let path = new rendering.GradientFillPath();
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
            lineStyle(thickness, color, alpha = 1, caps, joints, miterLimit = 3, lineDash = []) {
                if (rendering.CAPS_STYLES.indexOf(caps) == -1) {
                    caps = "round";
                }
                if (rendering.JOINT_STYLES.indexOf(joints) == -1) {
                    joints = "round";
                }
                let path = new rendering.StrokePath();
                path.lineWidth = thickness;
                path.lineColor = color;
                path.lineAlpha = alpha;
                path.caps = caps || "round" /* round */;
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
            cleanBeforeRender() {
            }
            /**
             * 清空所有缓存的绘制数据
             */
            clear() {
                this.drawData.length = 0;
                this.dirtyRender = true;
                this._renderCount = 0;
            }
            /**
             * 清除非绘制的缓存数据
             */
            clean() {
                if (this.texture) {
                    dou2d.WebGLUtil.deleteTexture(this.texture);
                    this.texture = null;
                    this.dirtyRender = true;
                }
            }
        }
        rendering.GraphicsNode = GraphicsNode;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 组渲染节点, 用于组合多个渲染节点
         * @author wizardc
         */
        class GroupNode extends rendering.RenderNode {
            constructor() {
                super();
                this.type = 5 /* groupNode */;
            }
            get renderCount() {
                let result = 0;
                let data = this.drawData;
                for (let i = data.length - 1; i >= 0; i--) {
                    result += data[i].$getRenderCount();
                }
                return result;
            }
            addNode(node) {
                this.drawData.push(node);
            }
            cleanBeforeRender() {
                let data = this.drawData;
                for (let i = data.length - 1; i >= 0; i--) {
                    data[i].cleanBeforeRender();
                }
            }
        }
        rendering.GroupNode = GroupNode;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 2D路径
         * @author wizardc
         */
        class Path2D {
            constructor() {
                /**
                 * 当前移动到的坐标 x
                 * 注意: 目前只有 drawArc 之前会被赋值
                 */
                this.lastX = 0;
                /**
                 * 当前移动到的坐标 y
                 * 注意: 目前只有 drawArc 之前会被赋值
                 */
                this.lastY = 0;
                this.commands = [];
                this.data = [];
                this._commandPosition = 0;
                this._dataPosition = 0;
            }
            /**
             * 路径类型
             */
            get type() {
                return this._type;
            }
            /**
             * 将当前绘图位置移动到 (x, y) 如果缺少任何一个参数, 则此方法将失败, 并且当前绘图位置不改变
             * @param x 一个表示相对于父显示对象注册点的水平位置的数字 (以像素为单位)
             * @param y 一个表示相对于父显示对象注册点的垂直位置的数字 (以像素为单位)
             */
            moveTo(x, y) {
                this.commands[this._commandPosition++] = 1 /* moveTo */;
                let pos = this._dataPosition;
                this.data[pos++] = x;
                this.data[pos++] = y;
                this._dataPosition = pos;
            }
            /**
             * 使用当前线条样式绘制一条从当前绘图位置开始到 (x, y) 结束的直线；当前绘图位置随后会设置为 (x, y)
             * @param x 一个表示相对于父显示对象注册点的水平位置的数字 (以像素为单位)
             * @param y 一个表示相对于父显示对象注册点的垂直位置的数字 (以像素为单位)
             */
            lineTo(x, y) {
                this.commands[this._commandPosition++] = 2 /* lineTo */;
                let pos = this._dataPosition;
                this.data[pos++] = x;
                this.data[pos++] = y;
                this._dataPosition = pos;
            }
            /**
             * 使用当前线条样式和由 (controlX, controlY) 指定的控制点绘制一条从当前绘图位置开始到 (anchorX, anchorY) 结束的二次贝塞尔曲线当前绘图位置随后设置为 (anchorX, anchorY)
             * 如果在调用 moveTo() 方法之前调用了 curveTo() 方法, 则当前绘图位置的默认值为 (0, 0) 如果缺少任何一个参数, 则此方法将失败, 并且当前绘图位置不改变
             * 绘制的曲线是二次贝塞尔曲线二次贝塞尔曲线包含两个锚点和一个控制点该曲线内插这两个锚点, 并向控制点弯曲
             * @param controlX 一个数字, 指定控制点相对于父显示对象注册点的水平位置
             * @param controlY 一个数字, 指定控制点相对于父显示对象注册点的垂直位置
             * @param anchorX 一个数字, 指定下一个锚点相对于父显示对象注册点的水平位置
             * @param anchorY 一个数字, 指定下一个锚点相对于父显示对象注册点的垂直位置
             */
            curveTo(controlX, controlY, anchorX, anchorY) {
                this.commands[this._commandPosition++] = 3 /* curveTo */;
                let pos = this._dataPosition;
                this.data[pos++] = controlX;
                this.data[pos++] = controlY;
                this.data[pos++] = anchorX;
                this.data[pos++] = anchorY;
                this._dataPosition = pos;
            }
            /**
             * 从当前绘图位置到指定的锚点绘制一条三次贝塞尔曲线三次贝塞尔曲线由两个锚点和两个控制点组成该曲线内插这两个锚点, 并向两个控制点弯曲
             * @param controlX1 指定首个控制点相对于父显示对象的注册点的水平位置
             * @param controlY1 指定首个控制点相对于父显示对象的注册点的垂直位置
             * @param controlX2 指定第二个控制点相对于父显示对象的注册点的水平位置
             * @param controlY2 指定第二个控制点相对于父显示对象的注册点的垂直位置
             * @param anchorX 指定锚点相对于父显示对象的注册点的水平位置
             * @param anchorY 指定锚点相对于父显示对象的注册点的垂直位置
             */
            cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
                this.commands[this._commandPosition++] = 4 /* cubicCurveTo */;
                let pos = this._dataPosition;
                this.data[pos++] = controlX1;
                this.data[pos++] = controlY1;
                this.data[pos++] = controlX2;
                this.data[pos++] = controlY2;
                this.data[pos++] = anchorX;
                this.data[pos++] = anchorY;
                this._dataPosition = pos;
            }
            /**
             * 绘制一个矩形
             * @param x 圆心相对于父显示对象注册点的 x 位置 (以像素为单位)
             * @param y 相对于父显示对象注册点的圆心的 y 位置 (以像素为单位)
             * @param width 矩形的宽度 (以像素为单位)
             * @param height 矩形的高度 (以像素为单位)
             */
            drawRect(x, y, width, height) {
                let x2 = x + width;
                let y2 = y + height;
                this.moveTo(x, y);
                this.lineTo(x2, y);
                this.lineTo(x2, y2);
                this.lineTo(x, y2);
                this.lineTo(x, y);
            }
            /**
             * 绘制一个圆角矩形
             * @param x 圆心相对于父显示对象注册点的 x 位置 (以像素为单位)
             * @param y 相对于父显示对象注册点的圆心的 y 位置 (以像素为单位)
             * @param width 矩形的宽度 (以像素为单位)
             * @param height 矩形的高度 (以像素为单位)
             * @param ellipseWidth 用于绘制圆角的椭圆的宽度 (以像素为单位)
             * @param ellipseHeight 用于绘制圆角的椭圆的高度 (以像素为单位) 如果未指定值, 则默认值与为 ellipseWidth 参数提供的值相匹配
             */
            drawRoundRect(x, y, width, height, ellipseWidth, ellipseHeight) {
                let radiusX = (ellipseWidth * 0.5) | 0;
                let radiusY = ellipseHeight ? (ellipseHeight * 0.5) | 0 : radiusX;
                if (!radiusX || !radiusY) {
                    this.drawRect(x, y, width, height);
                    return;
                }
                let hw = width * 0.5;
                let hh = height * 0.5;
                if (radiusX > hw) {
                    radiusX = hw;
                }
                if (radiusY > hh) {
                    radiusY = hh;
                }
                if (hw === radiusX && hh === radiusY) {
                    if (radiusX === radiusY) {
                        this.drawCircle(x + radiusX, y + radiusY, radiusX);
                    }
                    else {
                        this.drawEllipse(x, y, radiusX * 2, radiusY * 2);
                    }
                    return;
                }
                //    A-----B
                //  H         C
                //  G         D
                //    F-----E
                // 从 D 点开始, 结束在 D 点
                let right = x + width;
                let bottom = y + height;
                let xlw = x + radiusX;
                let xrw = right - radiusX;
                let ytw = y + radiusY;
                let ybw = bottom - radiusY;
                this.moveTo(right, ybw);
                this.curveTo(right, bottom, xrw, bottom);
                this.lineTo(xlw, bottom);
                this.curveTo(x, bottom, x, ybw);
                this.lineTo(x, ytw);
                this.curveTo(x, y, xlw, y);
                this.lineTo(xrw, y);
                this.curveTo(right, y, right, ytw);
                this.lineTo(right, ybw);
            }
            /**
             * 绘制一个圆
             * @param x 圆心相对于父显示对象注册点的 x 位置 (以像素为单位)
             * @param y 相对于父显示对象注册点的圆心的 y 位置 (以像素为单位)
             * @param radius 圆的半径 (以像素为单位)
             */
            drawCircle(x, y, radius) {
                this.arcToBezier(x, y, radius, radius, 0, Math.PI * 2);
            }
            /**
             * 绘制一个椭圆
             * @param x 一个表示相对于父显示对象注册点的水平位置的数字 (以像素为单位)
             * @param y 一个表示相对于父显示对象注册点的垂直位置的数字 (以像素为单位)
             * @param width 矩形的宽度 (以像素为单位)
             * @param height 矩形的高度 (以像素为单位)
             */
            drawEllipse(x, y, width, height) {
                let radiusX = width * 0.5;
                let radiusY = height * 0.5;
                // 移动 x 和 y 到椭圆的中心
                x += radiusX;
                y += radiusY;
                this.arcToBezier(x, y, radiusX, radiusY, 0, Math.PI * 2);
            }
            /**
             * 绘制一段圆弧路径圆弧路径的圆心在 (x, y) 位置, 半径为 r, 根据 anticlockwise (默认为顺时针) 指定的方向从 startAngle 开始绘制, 到 endAngle 结束
             * @param x 圆弧中心 (圆心) 的 x 轴坐标
             * @param y 圆弧中心 (圆心) 的 y 轴坐标
             * @param radius 圆弧的半径
             * @param startAngle 圆弧的起始点, x 轴方向开始计算, 单位以弧度表示, 注意, 必须在 0~2π 之间
             * @param endAngle 圆弧的终点, 单位以弧度表示, 注意, 必须在 0~2π 之间
             * @param anticlockwise 如果为 true, 逆时针绘制圆弧, 反之, 顺时针绘制
             */
            drawArc(x, y, radius, startAngle, endAngle, anticlockwise) {
                if (anticlockwise) {
                    if (endAngle >= startAngle) {
                        endAngle -= Math.PI * 2;
                    }
                }
                else {
                    if (endAngle <= startAngle) {
                        endAngle += Math.PI * 2;
                    }
                }
                this.arcToBezier(x, y, radius, radius, startAngle, endAngle, anticlockwise);
            }
            /**
             * 绘制一段圆弧路径
             * @param x 圆弧中心 (圆心) 的 x 轴坐标
             * @param y 圆弧中心 (圆心) 的 y 轴坐标
             * @param radiusX 圆弧的半径 x
             * @param radiusY 圆弧的半径 y
             * @param startAngle 圆弧的起始点, x 轴方向开始计算, 单位以弧度表示, 注意：必须为正数
             * @param endAngle 圆弧的终点, 单位以弧度表示, 注意：与 startAngle 差值必须在 0~2π 之间
             * @param anticlockwise 如果为 true, 逆时针绘制圆弧, 反之, 顺时针绘制, 注意：如果为 true, endAngle 必须小于 startAngle, 反之必须大于
             */
            arcToBezier(x, y, radiusX, radiusY, startAngle, endAngle, anticlockwise) {
                let halfPI = Math.PI * 0.5;
                let start = startAngle;
                let end = start;
                if (anticlockwise) {
                    end += -halfPI - (start % halfPI);
                    if (end < endAngle) {
                        end = endAngle;
                    }
                }
                else {
                    end += halfPI - (start % halfPI);
                    if (end > endAngle) {
                        end = endAngle;
                    }
                }
                let currentX = x + Math.cos(start) * radiusX;
                let currentY = y + Math.sin(start) * radiusY;
                if (this.lastX != currentX || this.lastY != currentY) {
                    this.moveTo(currentX, currentY);
                }
                let u = Math.cos(start);
                let v = Math.sin(start);
                for (let i = 0; i < 4; i++) {
                    let addAngle = end - start;
                    let a = 4 * Math.tan(addAngle / 4) / 3;
                    let x1 = currentX - v * a * radiusX;
                    let y1 = currentY + u * a * radiusY;
                    u = Math.cos(end);
                    v = Math.sin(end);
                    currentX = x + u * radiusX;
                    currentY = y + v * radiusY;
                    let x2 = currentX + v * a * radiusX;
                    let y2 = currentY - u * a * radiusY;
                    this.cubicCurveTo(x1, y1, x2, y2, currentX, currentY);
                    if (end === endAngle) {
                        break;
                    }
                    start = end;
                    if (anticlockwise) {
                        end = start - halfPI;
                        if (end < endAngle) {
                            end = endAngle;
                        }
                    }
                    else {
                        end = start + halfPI;
                        if (end > endAngle) {
                            end = endAngle;
                        }
                    }
                }
            }
        }
        rendering.Path2D = Path2D;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 填充路径
         * @author wizardc
         */
        class FillPath extends rendering.Path2D {
            constructor() {
                super();
                this._type = 1 /* fill */;
            }
        }
        rendering.FillPath = FillPath;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 线条路径
         * @author wizardc
         */
        class StrokePath extends rendering.Path2D {
            constructor() {
                super();
                this._type = 3 /* stroke */;
            }
        }
        rendering.StrokePath = StrokePath;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 渐变填充路径
         * @author wizardc
         */
        class GradientFillPath extends rendering.Path2D {
            constructor() {
                super();
                this._type = 2 /* gradientFill */;
            }
        }
        rendering.GradientFillPath = GradientFillPath;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 渲染缓冲
         * @author wizardc
         */
        class RenderBuffer {
            constructor(width, height, root) {
                this.globalAlpha = 1;
                this.globalTintColor = 0xFFFFFF;
                /**
                 * stencil state
                 * 模版开关状态
                 */
                this._stencilState = false;
                this.stencilList = [];
                this.stencilHandleCount = 0;
                /**
                 * scissor state
                 * scissor 开关状态
                 */
                this.scissorState = false;
                this._scissorRect = new dou2d.Rectangle();
                this.hasScissor = false;
                this.drawCalls = 0;
                this.computeDrawCall = false;
                this.globalMatrix = new dou2d.Matrix();
                this.savedGlobalMatrix = new dou2d.Matrix();
                this.offsetX = 0;
                this.offsetY = 0;
                // 获取 RenderContext, 如果是第一次会对 RenderContext 进行初始化
                this.context = rendering.RenderContext.getInstance(width, height);
                // 创建渲染目标
                this.renderTarget = new rendering.RenderTarget(this.context.context, 3, 3);
                if (width && height) {
                    this.resize(width, height);
                }
                // 如果是第一个加入的 buffer, 说明是舞台
                this._root = root;
                // 如果是用于舞台渲染的 RenderBuffer, 则默认添加到 renderContext 中, 而且是第一个
                if (this._root) {
                    this.context.pushBuffer(this);
                    // 画布
                    this.surface = this.context.surface;
                    this.computeDrawCall = true;
                }
                else {
                    // 由于创建 RenderTarget 造成的 FrameBuffer 绑定, 这里重置绑定
                    let lastBuffer = this.context.activatedBuffer;
                    if (lastBuffer) {
                        lastBuffer.renderTarget.activate();
                    }
                    this.renderTarget.initFrameBuffer();
                    this.surface = this.renderTarget;
                }
            }
            /**
             * 获取一个渲染缓冲
             */
            static get(width, height) {
                let buffer = RenderBuffer._renderBufferPool.pop();
                if (buffer) {
                    buffer.resize(width, height);
                    let matrix = buffer.globalMatrix;
                    matrix.a = 1;
                    matrix.b = 0;
                    matrix.c = 0;
                    matrix.d = 1;
                    matrix.tx = 0;
                    matrix.ty = 0;
                    buffer.globalAlpha = 1;
                    buffer.offsetX = 0;
                    buffer.offsetY = 0;
                }
                else {
                    buffer = new RenderBuffer(width, height);
                    buffer.computeDrawCall = false;
                }
                return buffer;
            }
            /**
             * 回收一个渲染缓冲
             */
            static put(buffer) {
                RenderBuffer._renderBufferPool.push(buffer);
            }
            get width() {
                return this.renderTarget.width;
            }
            get height() {
                return this.renderTarget.height;
            }
            enableStencil() {
                if (!this._stencilState) {
                    this.context.enableStencilTest();
                    this._stencilState = true;
                }
            }
            disableStencil() {
                if (this._stencilState) {
                    this.context.disableStencilTest();
                    this._stencilState = false;
                }
            }
            restoreStencil() {
                if (this._stencilState) {
                    this.context.enableStencilTest();
                }
                else {
                    this.context.disableStencilTest();
                }
            }
            enableScissor(x, y, width, height) {
                if (!this.scissorState) {
                    this.scissorState = true;
                    this._scissorRect.set(x, y, width, height);
                    this.context.enableScissorTest(this._scissorRect);
                }
            }
            disableScissor() {
                if (this.scissorState) {
                    this.scissorState = false;
                    this._scissorRect.clear();
                    this.context.disableScissorTest();
                }
            }
            restoreScissor() {
                if (this.scissorState) {
                    this.context.enableScissorTest(this._scissorRect);
                }
                else {
                    this.context.disableScissorTest();
                }
            }
            /**
             * 改变渲染缓冲的大小并清空缓冲区
             * @param useMaxSize 是否将改变后的尺寸与已有尺寸对比, 然后保留较大的尺寸
             */
            resize(width, height, useMaxSize) {
                width = width || 1;
                height = height || 1;
                this.context.pushBuffer(this);
                // RenderTarget 尺寸重置
                if (width != this.renderTarget.width || height != this.renderTarget.height) {
                    this.context.drawCommand.pushResize(this, width, height);
                    // 同步更改宽高
                    this.renderTarget.width = width;
                    this.renderTarget.height = height;
                }
                // 如果是舞台的渲染缓冲, 执行 resize, 否则 surface 大小不随之改变
                if (this._root) {
                    this.context.resize(width, height, useMaxSize);
                }
                this.context.clear();
                this.context.popBuffer();
            }
            setTransform(a, b, c, d, tx, ty) {
                let matrix = this.globalMatrix;
                matrix.a = a;
                matrix.b = b;
                matrix.c = c;
                matrix.d = d;
                matrix.tx = tx;
                matrix.ty = ty;
            }
            transform(a, b, c, d, tx, ty) {
                let matrix = this.globalMatrix;
                let a1 = matrix.a;
                let b1 = matrix.b;
                let c1 = matrix.c;
                let d1 = matrix.d;
                if (a != 1 || b != 0 || c != 0 || d != 1) {
                    matrix.a = a * a1 + b * c1;
                    matrix.b = a * b1 + b * d1;
                    matrix.c = c * a1 + d * c1;
                    matrix.d = c * b1 + d * d1;
                }
                matrix.tx = tx * a1 + ty * c1 + matrix.tx;
                matrix.ty = tx * b1 + ty * d1 + matrix.ty;
            }
            useOffset() {
                if (this.offsetX != 0 || this.offsetY != 0) {
                    this.globalMatrix.append(1, 0, 0, 1, this.offsetX, this.offsetY);
                    this.offsetX = this.offsetY = 0;
                }
            }
            saveTransform() {
                let matrix = this.globalMatrix;
                let sMatrix = this.savedGlobalMatrix;
                sMatrix.a = matrix.a;
                sMatrix.b = matrix.b;
                sMatrix.c = matrix.c;
                sMatrix.d = matrix.d;
                sMatrix.tx = matrix.tx;
                sMatrix.ty = matrix.ty;
            }
            restoreTransform() {
                let matrix = this.globalMatrix;
                let sMatrix = this.savedGlobalMatrix;
                matrix.a = sMatrix.a;
                matrix.b = sMatrix.b;
                matrix.c = sMatrix.c;
                matrix.d = sMatrix.d;
                matrix.tx = sMatrix.tx;
                matrix.ty = sMatrix.ty;
            }
            /**
             * 获取指定区域的像素
             */
            getPixels(x, y, width = 1, height = 1) {
                let pixels = new Uint8Array(4 * width * height);
                let useFrameBuffer = this.renderTarget.useFrameBuffer;
                this.renderTarget.useFrameBuffer = true;
                this.renderTarget.activate();
                this.context.getPixels(x, y, width, height, pixels);
                this.renderTarget.useFrameBuffer = useFrameBuffer;
                this.renderTarget.activate();
                // 图像反转
                let result = new Uint8Array(4 * width * height);
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        let index1 = (width * (height - i - 1) + j) * 4;
                        let index2 = (width * i + j) * 4;
                        let a = pixels[index2 + 3];
                        result[index1] = Math.round(pixels[index2] / a * 255);
                        result[index1 + 1] = Math.round(pixels[index2 + 1] / a * 255);
                        result[index1 + 2] = Math.round(pixels[index2 + 2] / a * 255);
                        result[index1 + 3] = pixels[index2 + 3];
                    }
                }
                return result;
            }
            /**
             * 转换成 base64 字符串, 如果图片 (或者包含的图片) 跨域, 则返回 null
             * @param type 转换的类型, 如: "image/png", "image/jpeg"
             */
            toDataURL(type, encoderOptions) {
                return this.context.surface.toDataURL(type, encoderOptions);
            }
            /**
             * 一次渲染结束
             */
            onRenderFinish() {
                this.drawCalls = 0;
            }
            /**
             * 清空缓冲区数据
             */
            clear() {
                this.context.pushBuffer(this);
                this.context.clear();
                this.context.popBuffer();
            }
            /**
             * 销毁绘制对象
             */
            destroy() {
                this.context.destroy();
            }
        }
        RenderBuffer._renderBufferPool = [];
        rendering.RenderBuffer = RenderBuffer;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 指定渲染目标
         * * 可以是帧缓冲或者屏幕缓冲
         * @author wizardc
         */
        class RenderTarget {
            constructor(gl, width, height) {
                /**
                 * 是否使用帧缓冲
                 */
                this.useFrameBuffer = true;
                this.clearColor = [0, 0, 0, 0];
                this._gl = gl;
                this.setSize(width, height);
            }
            /**
             * 初始化帧缓冲
             */
            initFrameBuffer() {
                if (!this._frameBuffer) {
                    let gl = this._gl;
                    this.texture = this.createTexture();
                    this._frameBuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
                }
            }
            /**
             * 创建空贴图
             */
            createTexture() {
                const webglrendercontext = rendering.RenderContext.getInstance();
                return dou2d.WebGLUtil.createTexture(webglrendercontext, this.width, this.height, null);
            }
            /**
             * 激活当前缓冲
             */
            activate() {
                let gl = this._gl;
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.getFrameBuffer());
            }
            getFrameBuffer() {
                if (!this.useFrameBuffer) {
                    return null;
                }
                return this._frameBuffer;
            }
            /**
             * 开启模板缓冲
             */
            enabledStencil() {
                if (!this._frameBuffer || this._stencilBuffer) {
                    return;
                }
                // 帧缓冲不为空且模板缓冲为空时
                let gl = this._gl;
                gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
                this._stencilBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, this._stencilBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._stencilBuffer);
            }
            resize(width, height) {
                this.setSize(width, height);
                let gl = this._gl;
                if (this._frameBuffer) {
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                }
                if (this._stencilBuffer) {
                    gl.deleteRenderbuffer(this._stencilBuffer);
                    this._stencilBuffer = null;
                }
            }
            setSize(width, height) {
                width = width || 1;
                height = height || 1;
                if (width < 1) {
                    if (DEBUG) {
                        console.warn(`"WebGLRenderTarget"设定的宽度过小: ${width}`);
                    }
                    width = 1;
                }
                if (height < 1) {
                    if (DEBUG) {
                        console.warn(`"WebGLRenderTarget"设定的高度过小: ${height}`);
                    }
                    height = 1;
                }
                this.width = width;
                this.height = height;
            }
            clear(bind) {
                let gl = this._gl;
                if (bind) {
                    this.activate();
                }
                gl.colorMask(true, true, true, true);
                gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            dispose() {
                dou2d.WebGLUtil.deleteTexture(this.texture);
            }
        }
        rendering.RenderTarget = RenderTarget;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 渲染上下文
         * @author wizardcs
         */
        class RenderContext {
            constructor(width, height) {
                /**
                 * 上下文对象是否丢失
                 */
                this.contextLost = false;
                this._projectionX = NaN;
                this._projectionY = NaN;
                this.surface = dou2d.HtmlUtil.createCanvas(width, height);
                this.initWebGL();
                this.bufferStack = [];
                let gl = this.context;
                this._vertexBuffer = gl.createBuffer();
                this._indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
                this.drawCommand = new rendering.DrawCommand();
                this._vertexData = new rendering.VertexData();
                this.setGlobalCompositeOperation("source-over");
            }
            static getInstance(width, height) {
                return RenderContext._instance || (RenderContext._instance = new RenderContext(width, height));
            }
            initWebGL() {
                this.onResize();
                this.surface.addEventListener("webglcontextlost", this.handleContextLost.bind(this), false);
                this.surface.addEventListener("webglcontextrestored", this.handleContextRestored.bind(this), false);
                this.getWebGLContext();
                let gl = this.context;
                this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            }
            handleContextLost() {
                this.contextLost = true;
            }
            handleContextRestored() {
                this.initWebGL();
                this.contextLost = false;
            }
            getWebGLContext() {
                const gl = dou2d.HtmlUtil.getWebGLContext(this.surface);
                this.setContext(gl);
            }
            setContext(gl) {
                this.context = gl;
                gl.disable(gl.DEPTH_TEST);
                gl.disable(gl.CULL_FACE);
                gl.enable(gl.BLEND);
                gl.colorMask(true, true, true, true);
                // 目前只使用 0 号材质单元, 默认开启
                gl.activeTexture(gl.TEXTURE0);
            }
            /**
             * 压入一个 RenderBuffer 并绑定为当前的操作缓冲
             */
            pushBuffer(buffer) {
                this.bufferStack.push(buffer);
                if (buffer != this._currentBuffer) {
                    this.drawCommand.pushActivateBuffer(buffer);
                }
                this._currentBuffer = buffer;
            }
            /**
             * 弹出一个 RenderBuffer 并绑定上一个 RenderBuffer 为当前的操作缓冲
             * * 如果只剩下最后一个 RenderBuffer 则不执行操作
             */
            popBuffer() {
                if (this.bufferStack.length <= 1) {
                    return;
                }
                let buffer = this.bufferStack.pop();
                let lastBuffer = this.bufferStack[this.bufferStack.length - 1];
                if (buffer != lastBuffer) {
                    this.drawCommand.pushActivateBuffer(lastBuffer);
                }
                this._currentBuffer = lastBuffer;
            }
            /**
             * 启用 RenderBuffer
             */
            activateBuffer(buffer, width, height) {
                buffer.renderTarget.activate();
                if (!this._bindIndices) {
                    this.uploadIndicesArray(this._vertexData.getIndices());
                }
                buffer.restoreStencil();
                buffer.restoreScissor();
                this.onResize(width, height);
            }
            /**
             * 上传顶点数据
             */
            uploadVerticesArray(array) {
                let gl = this.context;
                gl.bufferData(gl.ARRAY_BUFFER, array, gl.STREAM_DRAW);
            }
            /**
             * 上传索引数据
             */
            uploadIndicesArray(array) {
                let gl = this.context;
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
                this._bindIndices = true;
            }
            onResize(width, height) {
                width = width || this.surface.width;
                height = height || this.surface.height;
                this._projectionX = width / 2;
                this._projectionY = -height / 2;
                if (this.context) {
                    this.context.viewport(0, 0, width, height);
                }
            }
            /**
             * 改变渲染缓冲的大小并清空缓冲区
             * @param useMaxSize 是否将改变后的尺寸与已有尺寸对比, 然后保留较大的尺寸
             */
            resize(width, height, useMaxSize) {
                dou2d.HtmlUtil.resizeContext(this, width, height, useMaxSize);
            }
            /**
             * 开启模版检测
             */
            enableStencilTest() {
                let gl = this.context;
                gl.enable(gl.STENCIL_TEST);
            }
            /**
             * 关闭模版检测
             */
            disableStencilTest() {
                let gl = this.context;
                gl.disable(gl.STENCIL_TEST);
            }
            /**
             * 开启 scissor 检测
             */
            enableScissorTest(rect) {
                let gl = this.context;
                gl.enable(gl.SCISSOR_TEST);
                gl.scissor(rect.x, rect.y, rect.width, rect.height);
            }
            /**
             * 关闭 scissor 检测
             */
            disableScissorTest() {
                let gl = this.context;
                gl.disable(gl.SCISSOR_TEST);
            }
            /**
             * 获取像素信息
             */
            getPixels(x, y, width, height, pixels) {
                let gl = this.context;
                gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            }
            /**
             * 创建一个贴图
             */
            createTexture(bitmapData) {
                return dou2d.WebGLUtil.createTexture(this, bitmapData);
            }
            /**
             * 更新贴图的图像
             */
            updateTexture(texture, bitmapData) {
                let gl = this.context;
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData);
            }
            /**
             * 获取 BitmapData 的贴图, 如果不存在则创建一个
             */
            getTexture(bitmapData) {
                if (!bitmapData.webGLTexture) {
                    bitmapData.webGLTexture = this.createTexture(bitmapData.source);
                    if (bitmapData.deleteSource && bitmapData.webGLTexture) {
                        if (bitmapData.source) {
                            bitmapData.source.src = "";
                            bitmapData.source = null;
                        }
                    }
                    if (bitmapData.webGLTexture) {
                        bitmapData.webGLTexture[dou2d.sys.smoothing] = true;
                    }
                }
                return bitmapData.webGLTexture;
            }
            /**
             * 设置混色
             */
            setGlobalCompositeOperation(value) {
                this.drawCommand.pushSetBlend(value);
            }
            /**
             * 绘制图片
             */
            drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, imageSourceWidth, imageSourceHeight, rotated, smoothing) {
                let buffer = this._currentBuffer;
                if (this.contextLost || !image || !buffer) {
                    return;
                }
                let texture;
                let offsetX;
                let offsetY;
                // 如果是 RenderTarget
                if (image.texture || (image.source && image.source.texture)) {
                    texture = image.texture || image.source.texture;
                    buffer.saveTransform();
                    offsetX = buffer.offsetX;
                    offsetY = buffer.offsetY;
                    buffer.useOffset();
                    buffer.transform(1, 0, 0, -1, 0, destHeight + destY * 2); // 翻转
                }
                else if (!image.source && !image.webGLTexture) {
                    return;
                }
                // 如果是 BitmapData
                else {
                    texture = this.getTexture(image);
                }
                if (!texture) {
                    return;
                }
                this.drawTexture(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, imageSourceWidth, imageSourceHeight, rotated, smoothing);
                if (image.source && image.source.texture) {
                    buffer.offsetX = offsetX;
                    buffer.offsetY = offsetY;
                    buffer.restoreTransform();
                }
            }
            /**
             * 绘制材质
             */
            drawTexture(texture, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, textureWidth, textureHeight, rotated, smoothing) {
                let buffer = this._currentBuffer;
                if (this.contextLost || !texture || !buffer) {
                    return;
                }
                if (this._vertexData.reachMaxSize()) {
                    this.draw();
                }
                if (smoothing != undefined && texture[dou2d.sys.smoothing] != smoothing) {
                    this.drawCommand.pushChangeSmoothing(texture, smoothing);
                }
                // 应用 filter, 因为只可能是 colorMatrixFilter, 最后两个参数可不传
                this.drawCommand.pushDrawTexture(texture, 2, this.colorMatrixFilter, textureWidth, textureHeight);
                buffer.currentTexture = texture;
                this._vertexData.cacheArrays(buffer, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, textureWidth, textureHeight, rotated);
            }
            /**
             * 绘制矩形
             * * 仅用于遮罩擦除等
             */
            drawRect(x, y, width, height) {
                let buffer = this._currentBuffer;
                if (this.contextLost || !buffer) {
                    return;
                }
                if (this._vertexData.reachMaxSize()) {
                    this.draw();
                }
                this.drawCommand.pushDrawRect();
                buffer.currentTexture = null;
                this._vertexData.cacheArrays(buffer, 0, 0, width, height, x, y, width, height, width, height);
            }
            /**
             * 绘制遮罩
             */
            pushMask(x, y, width, height) {
                let buffer = this._currentBuffer;
                if (this.contextLost || !buffer) {
                    return;
                }
                buffer.stencilList.push({ x, y, width, height });
                if (this._vertexData.reachMaxSize()) {
                    this.draw();
                }
                this.drawCommand.pushPushMask();
                buffer.currentTexture = null;
                this._vertexData.cacheArrays(buffer, 0, 0, width, height, x, y, width, height, width, height);
            }
            /**
             * 恢复遮罩
             */
            popMask() {
                let buffer = this._currentBuffer;
                if (this.contextLost || !buffer) {
                    return;
                }
                let mask = buffer.stencilList.pop();
                if (this._vertexData.reachMaxSize()) {
                    this.draw();
                }
                this.drawCommand.pushPopMask();
                buffer.currentTexture = null;
                this._vertexData.cacheArrays(buffer, 0, 0, mask.width, mask.height, mask.x, mask.y, mask.width, mask.height, mask.width, mask.height);
            }
            /**
             * 开启 scissor test
             */
            enableScissor(x, y, width, height) {
                let buffer = this._currentBuffer;
                this.drawCommand.pushEnableScissor(x, y, width, height);
                buffer.hasScissor = true;
            }
            /**
             * 关闭 scissor test
             */
            disableScissor() {
                let buffer = this._currentBuffer;
                this.drawCommand.pushDisableScissor();
                buffer.hasScissor = false;
            }
            /**
             * 执行目前缓存在命令列表里的命令并清空
             */
            draw() {
                if (this.drawCommand.drawDataLen == 0 || this.contextLost) {
                    return;
                }
                this.uploadVerticesArray(this._vertexData.getVertices());
                let length = this.drawCommand.drawDataLen;
                let offset = 0;
                for (let i = 0; i < length; i++) {
                    let data = this.drawCommand.drawData[i];
                    offset = this.drawData(data, offset);
                    // 计算 draw call
                    if (data.type == 7 /* actBuffer */) {
                        this.activatedBuffer = data.buffer;
                    }
                    if (data.type == 0 /* texture */ || data.type == 1 /* rect */ || data.type == 2 /* pushMask */ || data.type == 3 /* popMask */) {
                        if (this.activatedBuffer && this.activatedBuffer.computeDrawCall) {
                            this.activatedBuffer.drawCalls++;
                        }
                    }
                }
                // 清空数据
                this.drawCommand.clear();
                this._vertexData.clear();
            }
            /**
             * 执行绘制命令
             */
            drawData(data, offset) {
                if (!data) {
                    return;
                }
                let gl = this.context;
                let program;
                let filter = data.filter;
                switch (data.type) {
                    case 0 /* texture */:
                        if (filter) {
                            if (filter.type === "custom") {
                                program = rendering.Program.getProgram(filter.$shaderKey, gl, filter.$vertexSrc, filter.$fragmentSrc);
                            }
                            else if (filter.type === "colorBrush") {
                                program = rendering.Program.getProgram("colorBrush", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.colorBrush_fs);
                            }
                            else if (filter.type === "colorTransform") {
                                program = rendering.Program.getProgram("colorTransform", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.colorTransform_fs);
                            }
                            else if (filter.type === "blurX") {
                                program = rendering.Program.getProgram("blur", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.blur_fs);
                            }
                            else if (filter.type === "blurY") {
                                program = rendering.Program.getProgram("blur", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.blur_fs);
                            }
                            else if (filter.type === "glow") {
                                program = rendering.Program.getProgram("glow", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.glow_fs);
                            }
                        }
                        else {
                            program = rendering.Program.getProgram("texture", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.texture_fs);
                        }
                        this.activeProgram(gl, program);
                        this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                        offset += this.drawTextureElements(data, offset);
                        break;
                    case 1 /* rect */:
                        program = rendering.Program.getProgram("primitive", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.primitive_fs);
                        this.activeProgram(gl, program);
                        this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                        offset += this.drawRectElements(data, offset);
                        break;
                    case 2 /* pushMask */:
                        program = rendering.Program.getProgram("primitive", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.primitive_fs);
                        this.activeProgram(gl, program);
                        this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                        offset += this.drawPushMaskElements(data, offset);
                        break;
                    case 3 /* popMask */:
                        program = rendering.Program.getProgram("primitive", gl, rendering.ShaderLib.default_vs, rendering.ShaderLib.primitive_fs);
                        this.activeProgram(gl, program);
                        this.syncUniforms(program, filter, data.textureWidth, data.textureHeight);
                        offset += this.drawPopMaskElements(data, offset);
                        break;
                    case 4 /* blend */:
                        this.setBlendMode(data.value);
                        break;
                    case 5 /* resizeTarget */:
                        data.buffer.renderTarget.resize(data.width, data.height);
                        this.onResize(data.width, data.height);
                        break;
                    case 6 /* clearColor */:
                        if (this.activatedBuffer) {
                            let target = this.activatedBuffer.renderTarget;
                            if (target.width != 0 || target.height != 0) {
                                target.clear(true);
                            }
                        }
                        break;
                    case 7 /* actBuffer */:
                        this.activateBuffer(data.buffer, data.width, data.height);
                        break;
                    case 8 /* enableScissor */:
                        let buffer = this.activatedBuffer;
                        if (buffer) {
                            if (buffer.renderTarget) {
                                buffer.renderTarget.enabledStencil();
                            }
                            buffer.enableScissor(data.x, data.y, data.width, data.height);
                        }
                        break;
                    case 9 /* disableScissor */:
                        buffer = this.activatedBuffer;
                        if (buffer) {
                            buffer.disableScissor();
                        }
                        break;
                    case 10 /* smoothing */:
                        gl.bindTexture(gl.TEXTURE_2D, data.texture);
                        if (data.smoothing) {
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        }
                        else {
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        }
                        break;
                }
                return offset;
            }
            /**
             * 激活渲染程序并指定属性格式
             */
            activeProgram(gl, program) {
                if (program != this.currentProgram) {
                    gl.useProgram(program.program);
                    // 目前所有 attribute buffer 的绑定方法都是一致的
                    let attribute = program.attributes;
                    for (let key in attribute) {
                        if (key === "aVertexPosition") {
                            gl.vertexAttribPointer(attribute["aVertexPosition"].location, 2, gl.FLOAT, false, 5 * 4, 0);
                            gl.enableVertexAttribArray(attribute["aVertexPosition"].location);
                        }
                        else if (key === "aTextureCoord") {
                            gl.vertexAttribPointer(attribute["aTextureCoord"].location, 2, gl.FLOAT, false, 5 * 4, 2 * 4);
                            gl.enableVertexAttribArray(attribute["aTextureCoord"].location);
                        }
                        else if (key === "aColor") {
                            gl.vertexAttribPointer(attribute["aColor"].location, 4, gl.UNSIGNED_BYTE, true, 5 * 4, 4 * 4);
                            gl.enableVertexAttribArray(attribute["aColor"].location);
                        }
                    }
                    this.currentProgram = program;
                }
            }
            /**
             * 提交 Uniform 数据
             */
            syncUniforms(program, filter, textureWidth, textureHeight) {
                let uniforms = program.uniforms;
                let isCustomFilter = filter && filter.type === "custom";
                for (let key in uniforms) {
                    if (key === "projectionVector") {
                        uniforms[key].setValue({ x: this._projectionX, y: this._projectionY });
                    }
                    else if (key === "uTextureSize") {
                        uniforms[key].setValue({ x: textureWidth, y: textureHeight });
                    }
                    else if (key === "uSampler") {
                        uniforms[key].setValue(0);
                    }
                    else if (key === "uSamplerAlphaMask") {
                        uniforms[key].setValue(1);
                    }
                    else {
                        let value = filter.$uniforms[key];
                        if (value !== undefined) {
                            uniforms[key].setValue(value);
                        }
                        else {
                            if (DEBUG) {
                                console.warn(`自定义滤镜的"uniform": "${key}"未定义`);
                            }
                        }
                    }
                }
            }
            /**
             * 绘制贴图
             */
            drawTextureElements(data, offset) {
                let gl = this.context;
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, data.texture);
                let size = data.count * 3;
                gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
                return size;
            }
            /**
             * 绘制矩形
             */
            drawRectElements(data, offset) {
                let gl = this.context;
                let size = data.count * 3;
                gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
                return size;
            }
            /**
             * 将绘制图像作为一个遮罩进行绘制
             * * 并压入模板缓冲栈, 实际是向模板缓冲渲染新的数据
             */
            drawPushMaskElements(data, offset) {
                let gl = this.context;
                let size = data.count * 3;
                let buffer = this.activatedBuffer;
                if (buffer) {
                    if (buffer.renderTarget) {
                        buffer.renderTarget.enabledStencil();
                    }
                    if (buffer.stencilHandleCount == 0) {
                        buffer.enableStencil();
                        gl.clear(gl.STENCIL_BUFFER_BIT);
                    }
                    let level = buffer.stencilHandleCount;
                    buffer.stencilHandleCount++;
                    gl.colorMask(false, false, false, false);
                    gl.stencilFunc(gl.EQUAL, level, 0xFF);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
                    gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
                    gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                    gl.colorMask(true, true, true, true);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                }
                return size;
            }
            /**
             * 将绘制图像作为一个遮罩进行绘制
             * * 并弹出模板缓冲栈， 实际是将模板缓冲渲染为上一次的数据
             */
            drawPopMaskElements(data, offset) {
                let gl = this.context;
                let size = data.count * 3;
                let buffer = this.activatedBuffer;
                if (buffer) {
                    buffer.stencilHandleCount--;
                    if (buffer.stencilHandleCount == 0) {
                        buffer.disableStencil();
                    }
                    else {
                        let level = buffer.stencilHandleCount;
                        gl.colorMask(false, false, false, false);
                        gl.stencilFunc(gl.EQUAL, level + 1, 0xFF);
                        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
                        gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, offset * 2);
                        gl.stencilFunc(gl.EQUAL, level, 0xFF);
                        gl.colorMask(true, true, true, true);
                        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                    }
                }
                return size;
            }
            /**
             * 设置混色
             */
            setBlendMode(value) {
                let gl = this.context;
                switch (value) {
                    case "source-over":
                        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case "lighter":
                        gl.blendFunc(gl.ONE, gl.ONE);
                        break;
                    case "lighter-in":
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case "destination-out":
                        gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case "destination-in":
                        gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
                        break;
                }
            }
            /**
             * 应用滤镜绘制给定的 RenderBuffer
             * * 此方法不会导致 input 被释放, 所以如果需要释放 input, 需要调用此方法后手动调用 release
             */
            drawTargetWidthFilters(filters, input) {
                let originInput = input, filtersLen = filters.length, output;
                // 应用前面的滤镜
                if (filtersLen > 1) {
                    for (let i = 0; i < filtersLen - 1; i++) {
                        let filter = filters[i];
                        let width = input.renderTarget.width;
                        let height = input.renderTarget.height;
                        output = rendering.RenderBuffer.get(width, height);
                        output.setTransform(1, 0, 0, 1, 0, 0);
                        output.globalAlpha = 1;
                        this.drawToRenderTarget(filter, input, output);
                        if (input != originInput) {
                            rendering.RenderBuffer.put(input);
                        }
                        input = output;
                    }
                }
                // 应用最后一个滤镜并绘制到当前场景中
                let filter = filters[filtersLen - 1];
                this.drawToRenderTarget(filter, input, this._currentBuffer);
                // 释放掉用于交换的buffer
                if (input != originInput) {
                    rendering.RenderBuffer.put(input);
                }
            }
            /**
             * 向一个 RenderBuffer 中绘制
             */
            drawToRenderTarget(filter, input, output) {
                if (this.contextLost) {
                    return;
                }
                if (this._vertexData.reachMaxSize()) {
                    this.draw();
                }
                this.pushBuffer(output);
                let originInput = input, temp, width = input.renderTarget.width, height = input.renderTarget.height;
                // 模糊滤镜分别处理 blurX 与 blurY, 如果两个方向都设定了模糊量则这里先预先处理 blurX 的模糊, blurY 的模糊加入渲染命令等待后续渲染
                if (filter.type == "blur") {
                    let blurXFilter = filter.$blurXFilter;
                    let blurYFilter = filter.$blurYFilter;
                    if (blurXFilter.blurX != 0 && blurYFilter.blurY != 0) {
                        temp = rendering.RenderBuffer.get(width, height);
                        temp.setTransform(1, 0, 0, 1, 0, 0);
                        temp.globalAlpha = 1;
                        this.drawToRenderTarget(filter.$blurXFilter, input, temp);
                        if (input != originInput) {
                            rendering.RenderBuffer.put(input);
                        }
                        input = temp;
                        filter = blurYFilter;
                    }
                    else {
                        filter = blurXFilter.blurX === 0 ? blurYFilter : blurXFilter;
                    }
                }
                // 绘制input结果到舞台
                output.saveTransform();
                output.transform(1, 0, 0, -1, 0, height);
                output.currentTexture = input.renderTarget.texture;
                this._vertexData.cacheArrays(output, 0, 0, width, height, 0, 0, width, height, width, height);
                output.restoreTransform();
                this.drawCommand.pushDrawTexture(input.renderTarget.texture, 2, filter, width, height);
                // 释放掉input
                if (input != originInput) {
                    rendering.RenderBuffer.put(input);
                }
                this.popBuffer();
            }
            /**
             * 清除矩形区域
             */
            clearRect(x, y, width, height) {
                if (x != 0 || y != 0 || width != this.surface.width || height != this.surface.height) {
                    let buffer = this._currentBuffer;
                    if (buffer.hasScissor) {
                        this.setGlobalCompositeOperation("destination-out");
                        this.drawRect(x, y, width, height);
                        this.setGlobalCompositeOperation("source-over");
                    }
                    else {
                        let m = buffer.globalMatrix;
                        if (m.b == 0 && m.c == 0) {
                            x = x * m.a + m.tx;
                            y = y * m.d + m.ty;
                            width = width * m.a;
                            height = height * m.d;
                            this.enableScissor(x, -y - height + buffer.height, width, height);
                            this.clear();
                            this.disableScissor();
                        }
                        else {
                            this.setGlobalCompositeOperation("destination-out");
                            this.drawRect(x, y, width, height);
                            this.setGlobalCompositeOperation("source-over");
                        }
                    }
                }
                else {
                    this.clear();
                }
            }
            /**
             * 清除颜色缓存
             */
            clear() {
                this.drawCommand.pushClearColor();
            }
            /**
             * 销毁绘制对象
             */
            destroy() {
                this.surface.width = this.surface.height = 0;
            }
        }
        rendering.RenderContext = RenderContext;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 绘制指令管理类
         * @author wizardc
         */
        class DrawCommand {
            constructor() {
                /**
                 * 用于缓存绘制命令的数组
                 */
                this.drawData = [];
                /**
                 * 绘制命令长度
                 */
                this.drawDataLen = 0;
            }
            /**
             * 压入绘制矩形指令
             */
            pushDrawRect() {
                if (this.drawDataLen == 0 || this.drawData[this.drawDataLen - 1].type != 1 /* rect */) {
                    let data = this.drawData[this.drawDataLen] || {};
                    data.type = 1 /* rect */;
                    data.count = 0;
                    this.drawData[this.drawDataLen] = data;
                    this.drawDataLen++;
                }
                this.drawData[this.drawDataLen - 1].count += 2;
            }
            /**
             * 压入绘制贴图指令
             */
            pushDrawTexture(texture, count = 2, filter, textureWidth, textureHeight) {
                // 有滤镜的情况下不能进行合并绘制
                if (filter) {
                    let data = this.drawData[this.drawDataLen] || {};
                    data.type = 0 /* texture */;
                    data.texture = texture;
                    data.filter = filter;
                    data.count = count;
                    data.textureWidth = textureWidth;
                    data.textureHeight = textureHeight;
                    this.drawData[this.drawDataLen] = data;
                    this.drawDataLen++;
                }
                else {
                    if (this.drawDataLen == 0 || this.drawData[this.drawDataLen - 1].type != 0 /* texture */ || texture != this.drawData[this.drawDataLen - 1].texture || this.drawData[this.drawDataLen - 1].filter) {
                        let data = this.drawData[this.drawDataLen] || {};
                        data.type = 0 /* texture */;
                        data.texture = texture;
                        data.count = 0;
                        this.drawData[this.drawDataLen] = data;
                        this.drawDataLen++;
                    }
                    this.drawData[this.drawDataLen - 1].count += count;
                }
            }
            /**
             * 贴图绘制的 smoothing 属性改变时需要压入一个新的绘制指令
             */
            pushChangeSmoothing(texture, smoothing) {
                texture[dou2d.sys.smoothing] = smoothing;
                let data = this.drawData[this.drawDataLen] || {};
                data.type = 10 /* smoothing */;
                data.texture = texture;
                data.smoothing = smoothing;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            /**
             * 压入 pushMask 指令
             */
            pushPushMask(count = 1) {
                let data = this.drawData[this.drawDataLen] || {};
                data.type = 2 /* pushMask */;
                data.count = count * 2;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            /**
             * 压入 popMask 指令
             */
            pushPopMask(count = 1) {
                let data = this.drawData[this.drawDataLen] || {};
                data.type = 3 /* popMask */;
                data.count = count * 2;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            /**
             * 压入混色指令
             */
            pushSetBlend(value) {
                let len = this.drawDataLen;
                // 是否遍历到有效绘图操作
                let drawState = false;
                for (let i = len - 1; i >= 0; i--) {
                    let data = this.drawData[i];
                    if (data) {
                        if (data.type == 0 /* texture */ || data.type == 1 /* rect */) {
                            drawState = true;
                        }
                        // 如果与上一次 blend 操作之间无有效绘图则上一次操作无效
                        if (!drawState && data.type == 4 /* blend */) {
                            this.drawData.splice(i, 1);
                            this.drawDataLen--;
                            continue;
                        }
                        // 如果与上一次blend操作重复则本次操作无效
                        if (data.type == 4 /* blend */) {
                            if (data.value == value) {
                                return;
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
                let _data = this.drawData[this.drawDataLen] || {};
                _data.type = 4 /* blend */;
                _data.value = value;
                this.drawData[this.drawDataLen] = _data;
                this.drawDataLen++;
            }
            /**
             * 压入 resize render target 命令
             */
            pushResize(buffer, width, height) {
                let data = this.drawData[this.drawDataLen] || {};
                data.type = 5 /* resizeTarget */;
                data.buffer = buffer;
                data.width = width;
                data.height = height;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            /**
             * 压入 clear color 命令
             */
            pushClearColor() {
                let data = this.drawData[this.drawDataLen] || {};
                data.type = 6 /* clearColor */;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            /**
             * 压入激活 buffer 命令
             */
            pushActivateBuffer(buffer) {
                let len = this.drawDataLen;
                // 有无遍历到有效绘图操作
                let drawState = false;
                for (let i = len - 1; i >= 0; i--) {
                    let data = this.drawData[i];
                    if (data) {
                        if (data.type != 4 /* blend */ && data.type != 7 /* actBuffer */) {
                            drawState = true;
                        }
                        // 如果与上一次 buffer 操作之间无有效绘图则上一次操作无效
                        if (!drawState && data.type == 7 /* actBuffer */) {
                            this.drawData.splice(i, 1);
                            this.drawDataLen--;
                            continue;
                        }
                    }
                }
                let _data = this.drawData[this.drawDataLen] || {};
                _data.type = 7 /* actBuffer */;
                _data.buffer = buffer;
                _data.width = buffer.renderTarget.width;
                _data.height = buffer.renderTarget.height;
                this.drawData[this.drawDataLen] = _data;
                this.drawDataLen++;
            }
            /**
             * 压入 enabel scissor 命令
             */
            pushEnableScissor(x, y, width, height) {
                let data = this.drawData[this.drawDataLen] || {};
                data.type = 8 /* enableScissor */;
                data.x = x;
                data.y = y;
                data.width = width;
                data.height = height;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            /**
             * 压入 disable scissor 命令
             */
            pushDisableScissor() {
                let data = this.drawData[this.drawDataLen] || {};
                data.type = 9 /* disableScissor */;
                this.drawData[this.drawDataLen] = data;
                this.drawDataLen++;
            }
            /**
             * 清空命令数组
             */
            clear() {
                for (let i = 0; i < this.drawDataLen; i++) {
                    let data = this.drawData[i];
                    data.type = 0;
                    data.count = 0;
                    data.texture = null;
                    data.filter = null;
                    data.value = "";
                    data.buffer = null;
                    data.width = 0;
                    data.height = 0;
                    data.textureWidth = 0;
                    data.textureHeight = 0;
                    data.smoothing = false;
                    data.x = 0;
                    data.y = 0;
                }
                this.drawDataLen = 0;
            }
        }
        rendering.DrawCommand = DrawCommand;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 顶点数据管理类
         * ```
         * 顶点格式:
         *   x[32位浮点] + y[32位浮点] + u[32位浮点] + v[32位浮点] + tintcolor[32位整型]
         *
         * 矩形格式(包含 4 个顶点组合而成):
         *   0------1
         *   |      |
         *   |      |
         *   3------2
         *
         * 顶点索引缓冲(包含 6 个整数):
         * [0, 1, 2, 0, 2, 3]
         * ```
         * @author wizardc
         */
        class VertexData {
            constructor() {
                this._vertexIndex = 0;
                this._indexIndex = 0;
                let vertices = new ArrayBuffer(VertexData.maxVertexCount * VertexData.vertByteSize);
                this._verticesFloat32View = new Float32Array(vertices);
                this._verticesUint32View = new Uint32Array(vertices);
                this._vertices = this._verticesFloat32View;
                this._indices = new Uint16Array(VertexData.maxIndicesCount);
                for (let i = 0, j = 0; i < VertexData.maxIndicesCount; i += 6, j += 4) {
                    this._indices[i + 0] = j + 0;
                    this._indices[i + 1] = j + 1;
                    this._indices[i + 2] = j + 2;
                    this._indices[i + 3] = j + 0;
                    this._indices[i + 4] = j + 2;
                    this._indices[i + 5] = j + 3;
                }
            }
            /**
             * 是否达到最大缓存数量
             */
            reachMaxSize(vertexCount = 4, indexCount = 6) {
                return this._vertexIndex > VertexData.maxVertexCount - vertexCount || this._indexIndex > VertexData.maxIndicesCount - indexCount;
            }
            /**
             * 获取缓存完成的顶点数组
             */
            getVertices() {
                let view = this._vertices.subarray(0, this._vertexIndex * VertexData.vertSize);
                return view;
            }
            /**
             * 获取缓存完成的索引数组
             */
            getIndices() {
                return this._indices;
            }
            /**
             * 缓存一组顶点
             */
            cacheArrays(buffer, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight, textureSourceWidth, textureSourceHeight, rotated) {
                // 混入 tintcolor 的 alpha 值
                let alpha = buffer.globalAlpha;
                alpha = Math.min(alpha, 1.0);
                let globalTintColor = buffer.globalTintColor || 0xFFFFFF;
                let currentTexture = buffer.currentTexture;
                if (alpha < 1.0 && currentTexture && currentTexture[dou2d.sys.unpackPremultiplyAlphaWebgl]) {
                    alpha = dou2d.WebGLUtil.premultiplyTint(globalTintColor, alpha);
                }
                else {
                    alpha = globalTintColor + (alpha * 255 << 24);
                }
                // 计算出绘制矩阵，之后把矩阵还原回之前的
                let locWorldTransform = buffer.globalMatrix;
                let a = locWorldTransform.a;
                let b = locWorldTransform.b;
                let c = locWorldTransform.c;
                let d = locWorldTransform.d;
                let tx = locWorldTransform.tx;
                let ty = locWorldTransform.ty;
                let offsetX = buffer.offsetX;
                let offsetY = buffer.offsetY;
                if (offsetX != 0 || offsetY != 0) {
                    tx = offsetX * a + offsetY * c + tx;
                    ty = offsetX * b + offsetY * d + ty;
                }
                if (destX != 0 || destY != 0) {
                    tx = destX * a + destY * c + tx;
                    ty = destX * b + destY * d + ty;
                }
                let a1 = destWidth / sourceWidth;
                if (a1 != 1) {
                    a = a1 * a;
                    b = a1 * b;
                }
                let d1 = destHeight / sourceHeight;
                if (d1 != 1) {
                    c = d1 * c;
                    d = d1 * d;
                }
                let width = textureSourceWidth;
                let height = textureSourceHeight;
                let w = sourceWidth;
                let h = sourceHeight;
                sourceX = sourceX / width;
                sourceY = sourceY / height;
                let vertices = this._vertices;
                let verticesUint32View = this._verticesUint32View;
                let index = this._vertexIndex * VertexData.vertSize;
                if (rotated) {
                    let temp = sourceWidth;
                    sourceWidth = sourceHeight / width;
                    sourceHeight = temp / height;
                    // xy
                    vertices[index++] = tx;
                    vertices[index++] = ty;
                    // uv
                    vertices[index++] = sourceWidth + sourceX;
                    vertices[index++] = sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                    // xy
                    vertices[index++] = a * w + tx;
                    vertices[index++] = b * w + ty;
                    // uv
                    vertices[index++] = sourceWidth + sourceX;
                    vertices[index++] = sourceHeight + sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                    // xy
                    vertices[index++] = a * w + c * h + tx;
                    vertices[index++] = d * h + b * w + ty;
                    // uv
                    vertices[index++] = sourceX;
                    vertices[index++] = sourceHeight + sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                    // xy
                    vertices[index++] = c * h + tx;
                    vertices[index++] = d * h + ty;
                    // uv
                    vertices[index++] = sourceX;
                    vertices[index++] = sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                }
                else {
                    sourceWidth = sourceWidth / width;
                    sourceHeight = sourceHeight / height;
                    // xy
                    vertices[index++] = tx;
                    vertices[index++] = ty;
                    // uv
                    vertices[index++] = sourceX;
                    vertices[index++] = sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                    // xy
                    vertices[index++] = a * w + tx;
                    vertices[index++] = b * w + ty;
                    // uv
                    vertices[index++] = sourceWidth + sourceX;
                    vertices[index++] = sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                    // xy
                    vertices[index++] = a * w + c * h + tx;
                    vertices[index++] = d * h + b * w + ty;
                    // uv
                    vertices[index++] = sourceWidth + sourceX;
                    vertices[index++] = sourceHeight + sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                    // xy
                    vertices[index++] = c * h + tx;
                    vertices[index++] = d * h + ty;
                    // uv
                    vertices[index++] = sourceX;
                    vertices[index++] = sourceHeight + sourceY;
                    // alpha
                    verticesUint32View[index++] = alpha;
                }
                this._vertexIndex += 4;
                this._indexIndex += 6;
            }
            clear() {
                this._vertexIndex = 0;
                this._indexIndex = 0;
            }
        }
        /**
         * 一个顶点的数据大小
         */
        VertexData.vertSize = 5;
        /**
         * 一个顶点的字节数据大小
         */
        VertexData.vertByteSize = VertexData.vertSize * 4;
        /**
         * 最多单次提交的矩形数量
         */
        VertexData.maxQuadsCount = 2048;
        /**
         * 最多单次提交的顶点数量
         */
        VertexData.maxVertexCount = VertexData.maxQuadsCount * 4;
        /**
         * 最多单次提交的索引数量
         */
        VertexData.maxIndicesCount = VertexData.maxQuadsCount * 6;
        rendering.VertexData = VertexData;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 显示列表
         * @author wizardc
         */
        class DisplayList {
            constructor(root) {
                this.offsetX = 0;
                this.offsetY = 0;
                this.canvasScaleX = 1;
                this.canvasScaleY = 1;
                this._isStage = false;
                this.root = root;
                this._isStage = root instanceof dou2d.Stage;
                this.renderNode = new rendering.BitmapNode();
                this._offsetMatrix = new dou2d.Matrix();
            }
            /**
             * 创建一个 DisplayList 对象, 若内存不足或无法创建 RenderBuffer, 将会返回 null
             */
            static create(target) {
                let displayList = new DisplayList(target);
                try {
                    let buffer = new rendering.RenderBuffer();
                    displayList.renderBuffer = buffer;
                }
                catch (e) {
                    return null;
                }
                displayList.root = target;
                return displayList;
            }
            static setCanvasScale(x, y) {
                DisplayList.canvasScaleX = x;
                DisplayList.canvasScaleY = y;
            }
            /**
             * 设置剪裁边界, 不再绘制完整目标对象, 画布尺寸由外部决定, 超过边界的节点将跳过绘制
             */
            setClipRect(width, height) {
                width *= DisplayList.canvasScaleX;
                height *= DisplayList.canvasScaleY;
                this.renderBuffer.resize(width, height);
            }
            /**
             * 绘制根节点显示对象到目标画布, 返回 draw 的次数
             */
            drawToSurface() {
                let drawCalls = 0;
                this.canvasScaleX = this._offsetMatrix.a = DisplayList.canvasScaleX;
                this.canvasScaleY = this._offsetMatrix.d = DisplayList.canvasScaleY;
                // 对非舞台画布要根据目标显示对象尺寸改变而改变
                if (!this._isStage) {
                    this.changeSurfaceSize();
                }
                let buffer = this.renderBuffer;
                buffer.clear();
                drawCalls = dou2d.sys.renderer.render(this.root, buffer, this._offsetMatrix);
                // 对非舞台画布要保存渲染节点
                if (!this._isStage) {
                    let surface = buffer.surface;
                    let renderNode = this.renderNode;
                    renderNode.drawData.length = 0;
                    let width = surface.width;
                    let height = surface.height;
                    if (!this._bitmapData) {
                        this._bitmapData = new dou2d.BitmapData(surface);
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
            changeSurfaceSize() {
                let oldOffsetX = this.offsetX;
                let oldOffsetY = this.offsetY;
                let bounds = this.root.$getFilterClip() || this.root.$getOriginalBounds();
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
        DisplayList.canvasScaleFactor = 1;
        DisplayList.canvasScaleX = 1;
        DisplayList.canvasScaleY = 1;
        rendering.DisplayList = DisplayList;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 画布渲染缓冲
         * @author wizardc
         */
        class CanvasRenderBuffer {
            constructor(width, height) {
                this.surface = dou2d.HtmlUtil.createCanvas(width, height);
                this.context = this.surface.getContext("2d");
                if (this.context) {
                    this.context.$offsetX = 0;
                    this.context.$offsetY = 0;
                }
                this.resize(width, height);
            }
            /**
             * 渲染缓冲的宽度
             */
            get width() {
                return this.surface.width;
            }
            /**
             * 渲染缓冲的高度
             */
            get height() {
                return this.surface.height;
            }
            /**
             * 改变渲染缓冲的大小并清空缓冲区
             * @param width 改变后的宽
             * @param height 改变后的高
             * @param useMaxSize 若传入 true, 则将改变后的尺寸与已有尺寸对比, 保留较大的尺寸
             */
            resize(width, height, useMaxSize) {
                let canvasRenderBuffer = this;
                let surface = canvasRenderBuffer.surface;
                if (useMaxSize) {
                    let change = false;
                    if (surface.width < width) {
                        surface.width = width;
                        change = true;
                    }
                    if (surface.height < height) {
                        surface.height = height;
                        change = true;
                    }
                    // 尺寸没有变化时, 将绘制属性重置
                    if (!change) {
                        canvasRenderBuffer.context.globalCompositeOperation = "source-over";
                        canvasRenderBuffer.context.setTransform(1, 0, 0, 1, 0, 0);
                        canvasRenderBuffer.context.globalAlpha = 1;
                    }
                }
                else {
                    if (surface.width != width) {
                        surface.width = width;
                    }
                    if (surface.height != height) {
                        surface.height = height;
                    }
                }
                canvasRenderBuffer.clear();
            }
            /**
             * 获取指定区域的像素
             */
            getPixels(x, y, width = 1, height = 1) {
                return this.context.getImageData(x, y, width, height).data;
            }
            /**
             * 转换成 Base64 字符串, 如果图片 (或者包含的图片) 跨域, 则返回 null
             * @param type 转换的类型, 如: "image/png", "image/jpeg"
             */
            toDataURL(type, encoderOptions) {
                return this.surface.toDataURL(type, encoderOptions);
            }
            /**
             * 清空缓冲区数据
             */
            clear() {
                this.context.setTransform(1, 0, 0, 1, 0, 0);
                this.context.clearRect(0, 0, this.surface.width, this.surface.height);
            }
            /**
             * 销毁绘制对象
             */
            destroy() {
                this.surface.width = this.surface.height = 0;
            }
        }
        rendering.CanvasRenderBuffer = CanvasRenderBuffer;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 画布渲染类
         * @author wizardc
         */
        class CanvasRenderer {
            renderText(node, context) {
                context.textAlign = "left";
                context.textBaseline = "middle";
                context.lineJoin = "round";
                let drawData = node.drawData;
                let length = drawData.length;
                let pos = 0;
                while (pos < length) {
                    let x = drawData[pos++];
                    let y = drawData[pos++];
                    let text = drawData[pos++];
                    let format = drawData[pos++];
                    context.font = dou2d.HtmlUtil.getFontString(node, format);
                    let textColor = format.textColor == null ? node.textColor : format.textColor;
                    let strokeColor = format.strokeColor == null ? node.strokeColor : format.strokeColor;
                    let stroke = format.stroke == null ? node.stroke : format.stroke;
                    context.fillStyle = dou2d.HtmlUtil.toColorString(textColor);
                    context.strokeStyle = dou2d.HtmlUtil.toColorString(strokeColor);
                    if (stroke) {
                        context.lineWidth = stroke * 2;
                        context.strokeText(text, x + context.$offsetX, y + context.$offsetY);
                    }
                    context.fillText(text, x + context.$offsetX, y + context.$offsetY);
                }
            }
            renderGraphics(node, context) {
                let drawData = node.drawData;
                let length = drawData.length;
                for (let i = 0; i < length; i++) {
                    let path = drawData[i];
                    switch (path.type) {
                        case 1 /* fill */:
                            let fillPath = path;
                            context.fillStyle = this.getRGBAString(fillPath.fillColor, fillPath.fillAlpha);
                            this.renderPath(path, context);
                            context.fill();
                            break;
                        case 2 /* gradientFill */:
                            let g = path;
                            context.fillStyle = this.getGradient(context, g.gradientType, g.colors, g.alphas, g.ratios, g.matrix);
                            context.save();
                            let m = g.matrix;
                            this.renderPath(path, context);
                            context.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                            context.fill();
                            context.restore();
                            break;
                        case 3 /* stroke */:
                            let strokeFill = path;
                            let lineWidth = strokeFill.lineWidth;
                            context.lineWidth = lineWidth;
                            context.strokeStyle = this.getRGBAString(strokeFill.lineColor, strokeFill.lineAlpha);
                            context.lineCap = rendering.CAPS_STYLES[strokeFill.caps];
                            context.lineJoin = strokeFill.joints;
                            context.miterLimit = strokeFill.miterLimit;
                            if (context.setLineDash) {
                                context.setLineDash(strokeFill.lineDash);
                            }
                            // 对 1 像素和 3 像素特殊处理, 向右下角偏移 0.5 像素, 以显示清晰锐利的线条
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
            getRGBAString(color, alpha) {
                let red = color >> 16;
                let green = (color >> 8) & 0xFF;
                let blue = color & 0xFF;
                return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
            }
            getGradient(context, type, colors, alphas, ratios, matrix) {
                let gradient;
                if (type == "linear" /* linear */) {
                    gradient = context.createLinearGradient(-1, 0, 1, 0);
                }
                else {
                    gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
                }
                let l = colors.length;
                for (let i = 0; i < l; i++) {
                    gradient.addColorStop(ratios[i] / 255, this.getRGBAString(colors[i], alphas[i]));
                }
                return gradient;
            }
            renderPath(path, context) {
                context.beginPath();
                let data = path.data;
                let commands = path.commands;
                let commandCount = commands.length;
                let pos = 0;
                for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
                    let command = commands[commandIndex];
                    switch (command) {
                        case 4 /* cubicCurveTo */:
                            context.bezierCurveTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY, data[pos++] + context.$offsetX, data[pos++] + context.$offsetY, data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                            break;
                        case 3 /* curveTo */:
                            context.quadraticCurveTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY, data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                            break;
                        case 2 /* lineTo */:
                            context.lineTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                            break;
                        case 1 /* moveTo */:
                            context.moveTo(data[pos++] + context.$offsetX, data[pos++] + context.$offsetY);
                            break;
                    }
                }
            }
        }
        rendering.CanvasRenderer = CanvasRenderer;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        const blendModes = ["source-over", "lighter", "destination-out"];
        const defaultCompositeOp = "source-over";
        /**
         * 核心渲染类
         * @author wizardc
         */
        class Renderer {
            constructor() {
                this._renderBufferPool = [];
                /**
                 * 渲染的嵌套层次, 0 表示在调用堆栈的最外层
                 */
                this._nestLevel = 0;
            }
            /**
             * 渲染一个显示对象
             * @param displayObject 要渲染的显示对象
             * @param buffer 渲染缓冲
             * @param matrix 要对显示对象整体叠加的变换矩阵
             * @returns drawCall 触发绘制的次数
             */
            render(displayObject, buffer, matrix) {
                this._nestLevel++;
                let webglBuffer = buffer;
                let webglBufferContext = webglBuffer.context;
                webglBufferContext.pushBuffer(webglBuffer);
                // 绘制显示对象
                webglBuffer.transform(matrix.a, matrix.b, matrix.c, matrix.d, 0, 0);
                this.drawDisplayObject(displayObject, webglBuffer, matrix.tx, matrix.ty, true);
                webglBufferContext.draw();
                let drawCall = webglBuffer.drawCalls;
                webglBuffer.onRenderFinish();
                webglBufferContext.popBuffer();
                let invert = dou.recyclable(dou2d.Matrix);
                invert.inverse(matrix);
                webglBuffer.transform(invert.a, invert.b, invert.c, invert.d, 0, 0);
                invert.recycle();
                this._nestLevel--;
                if (this._nestLevel === 0) {
                    // 最大缓存 6 个渲染缓冲
                    if (this._renderBufferPool.length > 6) {
                        this._renderBufferPool.length = 6;
                    }
                    let length = this._renderBufferPool.length;
                    for (let i = 0; i < length; i++) {
                        this._renderBufferPool[i].resize(0, 0);
                    }
                }
                return drawCall;
            }
            /**
             * 绘制一个显示对象
             */
            drawDisplayObject(displayObject, buffer, offsetX, offsetY, isStage) {
                let drawCalls = 0;
                let node;
                let displayList = displayObject.$displayList;
                if (displayList && !isStage) {
                    if (displayObject.$cacheDirty || displayObject.$renderDirty ||
                        displayList.canvasScaleX != rendering.DisplayList.canvasScaleX ||
                        displayList.canvasScaleY != rendering.DisplayList.canvasScaleY) {
                        drawCalls += displayList.drawToSurface();
                    }
                    node = displayList.renderNode;
                }
                else {
                    if (displayObject.$renderDirty) {
                        node = displayObject.$getRenderNode();
                    }
                    else {
                        node = displayObject.$renderNode;
                    }
                }
                displayObject.$cacheDirty = false;
                if (node) {
                    drawCalls++;
                    buffer.offsetX = offsetX;
                    buffer.offsetY = offsetY;
                    switch (node.type) {
                        case 2 /* bitmapNode */:
                            this.renderBitmap(node, buffer);
                            break;
                        case 3 /* textNode */:
                            this.renderText(node, buffer);
                            break;
                        case 4 /* graphicsNode */:
                            this.renderGraphics(node, buffer);
                            break;
                        case 5 /* groupNode */:
                            this.renderGroup(node, buffer);
                            break;
                        case 1 /* normalBitmapNode */:
                            this.renderNormalBitmap(node, buffer);
                            break;
                    }
                    buffer.offsetX = 0;
                    buffer.offsetY = 0;
                }
                if (displayList && !isStage) {
                    return drawCalls;
                }
                let children = displayObject.$children;
                if (children) {
                    if (displayObject.sortableChildren && displayObject.$sortDirty) {
                        // 绘制排序
                        displayObject.sortChildren();
                    }
                    let length = children.length;
                    for (let i = 0; i < length; i++) {
                        let child = children[i];
                        let offsetX2;
                        let offsetY2;
                        let tempAlpha;
                        let tempTintColor;
                        if (child.alpha != 1) {
                            tempAlpha = buffer.globalAlpha;
                            buffer.globalAlpha *= child.alpha;
                        }
                        if (child.tint !== 0xFFFFFF) {
                            tempTintColor = buffer.globalTintColor;
                            buffer.globalTintColor = child.$tintRGB;
                        }
                        let savedMatrix;
                        if (child.$useTranslate) {
                            let m = child.$getMatrix();
                            offsetX2 = offsetX + child.x;
                            offsetY2 = offsetY + child.y;
                            let m2 = buffer.globalMatrix;
                            savedMatrix = dou.recyclable(dou2d.Matrix);
                            savedMatrix.a = m2.a;
                            savedMatrix.b = m2.b;
                            savedMatrix.c = m2.c;
                            savedMatrix.d = m2.d;
                            savedMatrix.tx = m2.tx;
                            savedMatrix.ty = m2.ty;
                            buffer.transform(m.a, m.b, m.c, m.d, offsetX2, offsetY2);
                            offsetX2 = -child.anchorOffsetX;
                            offsetY2 = -child.anchorOffsetY;
                        }
                        else {
                            offsetX2 = offsetX + child.x - child.anchorOffsetX;
                            offsetY2 = offsetY + child.y - child.anchorOffsetY;
                        }
                        switch (child.$renderMode) {
                            case 1 /* none */:
                                break;
                            case 2 /* filter */:
                                drawCalls += this.drawWithFilter(child, buffer, offsetX2, offsetY2);
                                break;
                            case 3 /* clip */:
                                drawCalls += this.drawWithClip(child, buffer, offsetX2, offsetY2);
                                break;
                            case 4 /* scrollRect */:
                                drawCalls += this.drawWithScrollRect(child, buffer, offsetX2, offsetY2);
                                break;
                            default:
                                drawCalls += this.drawDisplayObject(child, buffer, offsetX2, offsetY2);
                                break;
                        }
                        if (tempAlpha) {
                            buffer.globalAlpha = tempAlpha;
                        }
                        if (tempTintColor) {
                            buffer.globalTintColor = tempTintColor;
                        }
                        if (savedMatrix) {
                            let m = buffer.globalMatrix;
                            m.a = savedMatrix.a;
                            m.b = savedMatrix.b;
                            m.c = savedMatrix.c;
                            m.d = savedMatrix.d;
                            m.tx = savedMatrix.tx;
                            m.ty = savedMatrix.ty;
                            savedMatrix.recycle();
                        }
                    }
                }
                return drawCalls;
            }
            drawWithFilter(displayObject, buffer, offsetX, offsetY) {
                let drawCalls = 0;
                if (displayObject.$children && displayObject.$children.length == 0 && (!displayObject.$renderNode || displayObject.$renderNode.renderCount == 0)) {
                    return drawCalls;
                }
                let filters = displayObject.filters;
                let hasBlendMode = (displayObject.blendMode !== "normal" /* normal */);
                let compositeOp;
                if (hasBlendMode) {
                    compositeOp = blendModes[displayObject.blendMode];
                    if (!compositeOp) {
                        compositeOp = defaultCompositeOp;
                    }
                }
                let displayBounds = displayObject.$getFilterClip() || displayObject.$getOriginalBounds();
                let displayBoundsX = displayBounds.x;
                let displayBoundsY = displayBounds.y;
                let displayBoundsWidth = displayBounds.width;
                let displayBoundsHeight = displayBounds.height;
                if (displayBoundsWidth <= 0 || displayBoundsHeight <= 0) {
                    return drawCalls;
                }
                if (!displayObject.mask && filters.length == 1 && (filters[0].type == "colorBrush" || filters[0].type == "colorTransform" || (filters[0].type === "custom" && filters[0].padding === 0))) {
                    let childrenDrawCount = this.getRenderCount(displayObject);
                    if (!displayObject.$children || childrenDrawCount == 1) {
                        if (hasBlendMode) {
                            buffer.context.setGlobalCompositeOperation(compositeOp);
                        }
                        buffer.context.colorMatrixFilter = filters[0];
                        if (displayObject.$mask) {
                            drawCalls += this.drawWithClip(displayObject, buffer, offsetX, offsetY);
                        }
                        else if (displayObject.scrollRect || displayObject.$maskRect) {
                            drawCalls += this.drawWithScrollRect(displayObject, buffer, offsetX, offsetY);
                        }
                        else {
                            drawCalls += this.drawDisplayObject(displayObject, buffer, offsetX, offsetY);
                        }
                        buffer.context.colorMatrixFilter = null;
                        if (hasBlendMode) {
                            buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                        }
                        return drawCalls;
                    }
                }
                // 为显示对象创建一个新的 buffer
                let displayBuffer = this.createRenderBuffer(displayBoundsWidth, displayBoundsHeight);
                displayBuffer.context.pushBuffer(displayBuffer);
                if (displayObject.$mask) {
                    drawCalls += this.drawWithClip(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
                }
                else if (displayObject.scrollRect || displayObject.$maskRect) {
                    drawCalls += this.drawWithScrollRect(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
                }
                else {
                    drawCalls += this.drawDisplayObject(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
                }
                displayBuffer.context.popBuffer();
                // 绘制结果到屏幕
                if (drawCalls > 0) {
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(compositeOp);
                    }
                    drawCalls++;
                    // 绘制结果的时候, 应用滤镜
                    buffer.offsetX = offsetX + displayBoundsX;
                    buffer.offsetY = offsetY + displayBoundsY;
                    let savedMatrix = dou.recyclable(dou2d.Matrix);
                    let curMatrix = buffer.globalMatrix;
                    savedMatrix.a = curMatrix.a;
                    savedMatrix.b = curMatrix.b;
                    savedMatrix.c = curMatrix.c;
                    savedMatrix.d = curMatrix.d;
                    savedMatrix.tx = curMatrix.tx;
                    savedMatrix.ty = curMatrix.ty;
                    buffer.useOffset();
                    buffer.context.drawTargetWidthFilters(filters, displayBuffer);
                    curMatrix.a = savedMatrix.a;
                    curMatrix.b = savedMatrix.b;
                    curMatrix.c = savedMatrix.c;
                    curMatrix.d = savedMatrix.d;
                    curMatrix.tx = savedMatrix.tx;
                    curMatrix.ty = savedMatrix.ty;
                    savedMatrix.recycle();
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                    }
                }
                this._renderBufferPool.push(displayBuffer);
                return drawCalls;
            }
            getRenderCount(displayObject) {
                let drawCount = 0;
                let node = displayObject.$getRenderNode();
                if (node) {
                    drawCount += node.renderCount;
                }
                if (displayObject.$children) {
                    for (let child of displayObject.$children) {
                        let filters = child.filters;
                        // 特殊处理有滤镜的对象
                        if (filters && filters.length > 0) {
                            return 2;
                        }
                        else if (child.$children) {
                            drawCount += this.getRenderCount(child);
                        }
                        else {
                            let node = child.$getRenderNode();
                            if (node) {
                                drawCount += node.renderCount;
                            }
                        }
                    }
                }
                return drawCount;
            }
            drawWithClip(displayObject, buffer, offsetX, offsetY) {
                let drawCalls = 0;
                let hasBlendMode = displayObject.blendMode !== "normal" /* normal */;
                let compositeOp;
                if (hasBlendMode) {
                    compositeOp = blendModes[displayObject.blendMode];
                    if (!compositeOp) {
                        compositeOp = defaultCompositeOp;
                    }
                }
                let scrollRect = displayObject.scrollRect ? displayObject.scrollRect : displayObject.$maskRect;
                let mask = displayObject.$mask;
                if (mask) {
                    let maskRenderMatrix = mask.$getMatrix();
                    // 遮罩 scaleX 或 scaleY 为 0, 放弃绘制
                    if ((maskRenderMatrix.a == 0 && maskRenderMatrix.b == 0) || (maskRenderMatrix.c == 0 && maskRenderMatrix.d == 0)) {
                        return drawCalls;
                    }
                }
                // 没有遮罩, 同时显示对象没有子项
                if (!mask && (!displayObject.$children || displayObject.$children.length == 0)) {
                    if (scrollRect) {
                        buffer.context.pushMask(scrollRect.x + offsetX, scrollRect.y + offsetY, scrollRect.width, scrollRect.height);
                    }
                    // 绘制显示对象
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(compositeOp);
                    }
                    drawCalls += this.drawDisplayObject(displayObject, buffer, offsetX, offsetY);
                    if (hasBlendMode) {
                        buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                    }
                    if (scrollRect) {
                        buffer.context.popMask();
                    }
                    return drawCalls;
                }
                else {
                    let displayBounds = displayObject.$getFilterClip() || displayObject.$getOriginalBounds();
                    let displayBoundsX = displayBounds.x;
                    let displayBoundsY = displayBounds.y;
                    let displayBoundsWidth = displayBounds.width;
                    let displayBoundsHeight = displayBounds.height;
                    if (displayBoundsWidth <= 0 || displayBoundsHeight <= 0) {
                        return drawCalls;
                    }
                    // 绘制显示对象自身, 若有 scrollRect, 应用 clip
                    let displayBuffer = this.createRenderBuffer(displayBoundsWidth, displayBoundsHeight);
                    displayBuffer.context.pushBuffer(displayBuffer);
                    drawCalls += this.drawDisplayObject(displayObject, displayBuffer, -displayBoundsX, -displayBoundsY);
                    // 绘制遮罩
                    if (mask) {
                        let maskBuffer = this.createRenderBuffer(displayBoundsWidth, displayBoundsHeight);
                        maskBuffer.context.pushBuffer(maskBuffer);
                        let maskMatrix = dou.recyclable(dou2d.Matrix);
                        maskMatrix.copy(mask.$getConcatenatedMatrix());
                        mask.$getConcatenatedMatrixAt(displayObject, maskMatrix);
                        maskMatrix.translate(-displayBoundsX, -displayBoundsY);
                        maskBuffer.setTransform(maskMatrix.a, maskMatrix.b, maskMatrix.c, maskMatrix.d, maskMatrix.tx, maskMatrix.ty);
                        maskMatrix.recycle();
                        drawCalls += this.drawDisplayObject(mask, maskBuffer, 0, 0);
                        maskBuffer.context.popBuffer();
                        displayBuffer.context.setGlobalCompositeOperation("destination-in");
                        displayBuffer.setTransform(1, 0, 0, -1, 0, maskBuffer.height);
                        let maskBufferWidth = maskBuffer.renderTarget.width;
                        let maskBufferHeight = maskBuffer.renderTarget.height;
                        displayBuffer.context.drawTexture(maskBuffer.renderTarget.texture, 0, 0, maskBufferWidth, maskBufferHeight, 0, 0, maskBufferWidth, maskBufferHeight, maskBufferWidth, maskBufferHeight);
                        displayBuffer.setTransform(1, 0, 0, 1, 0, 0);
                        displayBuffer.context.setGlobalCompositeOperation("source-over");
                        maskBuffer.setTransform(1, 0, 0, 1, 0, 0);
                        this._renderBufferPool.push(maskBuffer);
                    }
                    displayBuffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                    displayBuffer.context.popBuffer();
                    // 绘制结果到屏幕
                    if (drawCalls > 0) {
                        drawCalls++;
                        if (hasBlendMode) {
                            buffer.context.setGlobalCompositeOperation(compositeOp);
                        }
                        if (scrollRect) {
                            buffer.context.pushMask(scrollRect.x + offsetX, scrollRect.y + offsetY, scrollRect.width, scrollRect.height);
                        }
                        let savedMatrix = dou.recyclable(dou2d.Matrix);
                        let curMatrix = buffer.globalMatrix;
                        savedMatrix.a = curMatrix.a;
                        savedMatrix.b = curMatrix.b;
                        savedMatrix.c = curMatrix.c;
                        savedMatrix.d = curMatrix.d;
                        savedMatrix.tx = curMatrix.tx;
                        savedMatrix.ty = curMatrix.ty;
                        curMatrix.append(1, 0, 0, -1, offsetX + displayBoundsX, offsetY + displayBoundsY + displayBuffer.height);
                        let displayBufferWidth = displayBuffer.renderTarget.width;
                        let displayBufferHeight = displayBuffer.renderTarget.height;
                        buffer.context.drawTexture(displayBuffer.renderTarget.texture, 0, 0, displayBufferWidth, displayBufferHeight, 0, 0, displayBufferWidth, displayBufferHeight, displayBufferWidth, displayBufferHeight);
                        if (scrollRect) {
                            displayBuffer.context.popMask();
                        }
                        if (hasBlendMode) {
                            buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                        }
                        let matrix = buffer.globalMatrix;
                        matrix.a = savedMatrix.a;
                        matrix.b = savedMatrix.b;
                        matrix.c = savedMatrix.c;
                        matrix.d = savedMatrix.d;
                        matrix.tx = savedMatrix.tx;
                        matrix.ty = savedMatrix.ty;
                        savedMatrix.recycle();
                    }
                    this._renderBufferPool.push(displayBuffer);
                    return drawCalls;
                }
            }
            drawWithScrollRect(displayObject, buffer, offsetX, offsetY) {
                let drawCalls = 0;
                let scrollRect = displayObject.scrollRect ? displayObject.scrollRect : displayObject.$maskRect;
                if (scrollRect.isEmpty()) {
                    return drawCalls;
                }
                if (displayObject.scrollRect) {
                    offsetX -= scrollRect.x;
                    offsetY -= scrollRect.y;
                }
                let m = buffer.globalMatrix;
                let context = buffer.context;
                let scissor = false;
                // 有旋转的情况下不能使用 scissor
                if (buffer.hasScissor || m.b != 0 || m.c != 0) {
                    buffer.context.pushMask(scrollRect.x + offsetX, scrollRect.y + offsetY, scrollRect.width, scrollRect.height);
                }
                else {
                    let a = m.a;
                    let d = m.d;
                    let tx = m.tx;
                    let ty = m.ty;
                    let x = scrollRect.x + offsetX;
                    let y = scrollRect.y + offsetY;
                    let xMax = x + scrollRect.width;
                    let yMax = y + scrollRect.height;
                    let minX, minY, maxX, maxY;
                    // 优化, 通常情况下不缩放的对象占多数, 直接加上偏移量即可
                    if (a == 1.0 && d == 1.0) {
                        minX = x + tx;
                        minY = y + ty;
                        maxX = xMax + tx;
                        maxY = yMax + ty;
                    }
                    else {
                        let x0 = a * x + tx;
                        let y0 = d * y + ty;
                        let x1 = a * xMax + tx;
                        let y1 = d * y + ty;
                        let x2 = a * xMax + tx;
                        let y2 = d * yMax + ty;
                        let x3 = a * x + tx;
                        let y3 = d * yMax + ty;
                        let tmp = 0;
                        if (x0 > x1) {
                            tmp = x0;
                            x0 = x1;
                            x1 = tmp;
                        }
                        if (x2 > x3) {
                            tmp = x2;
                            x2 = x3;
                            x3 = tmp;
                        }
                        minX = (x0 < x2 ? x0 : x2);
                        maxX = (x1 > x3 ? x1 : x3);
                        if (y0 > y1) {
                            tmp = y0;
                            y0 = y1;
                            y1 = tmp;
                        }
                        if (y2 > y3) {
                            tmp = y2;
                            y2 = y3;
                            y3 = tmp;
                        }
                        minY = (y0 < y2 ? y0 : y2);
                        maxY = (y1 > y3 ? y1 : y3);
                    }
                    context.enableScissor(minX, -maxY + buffer.height, maxX - minX, maxY - minY);
                    scissor = true;
                }
                drawCalls += this.drawDisplayObject(displayObject, buffer, offsetX, offsetY);
                if (scissor) {
                    context.disableScissor();
                }
                else {
                    context.popMask();
                }
                return drawCalls;
            }
            renderNormalBitmap(node, buffer) {
                let image = node.image;
                if (!image) {
                    return;
                }
                buffer.context.drawImage(image, node.sourceX, node.sourceY, node.sourceW, node.sourceH, node.drawX, node.drawY, node.drawW, node.drawH, node.imageWidth, node.imageHeight, node.rotated, node.smoothing);
            }
            renderBitmap(node, buffer) {
                let image = node.image;
                if (!image) {
                    return;
                }
                let data = node.drawData;
                let length = data.length;
                let pos = 0;
                let m = node.matrix;
                let blendMode = node.blendMode;
                let alpha = node.alpha;
                let savedMatrix;
                let offsetX;
                let offsetY;
                if (m) {
                    savedMatrix = dou.recyclable(dou2d.Matrix);
                    let curMatrix = buffer.globalMatrix;
                    savedMatrix.a = curMatrix.a;
                    savedMatrix.b = curMatrix.b;
                    savedMatrix.c = curMatrix.c;
                    savedMatrix.d = curMatrix.d;
                    savedMatrix.tx = curMatrix.tx;
                    savedMatrix.ty = curMatrix.ty;
                    offsetX = buffer.offsetX;
                    offsetY = buffer.offsetY;
                    buffer.useOffset();
                    buffer.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                }
                // 这里不考虑嵌套
                if (blendMode) {
                    buffer.context.setGlobalCompositeOperation(blendModes[blendMode]);
                }
                let originAlpha;
                if (alpha == alpha) {
                    originAlpha = buffer.globalAlpha;
                    buffer.globalAlpha *= alpha;
                }
                if (node.filter) {
                    buffer.context.colorMatrixFilter = node.filter;
                    while (pos < length) {
                        buffer.context.drawImage(image, data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], node.imageWidth, node.imageHeight, node.rotated, node.smoothing);
                    }
                    buffer.context.colorMatrixFilter = null;
                }
                else {
                    while (pos < length) {
                        buffer.context.drawImage(image, data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], data[pos++], node.imageWidth, node.imageHeight, node.rotated, node.smoothing);
                    }
                }
                if (blendMode) {
                    buffer.context.setGlobalCompositeOperation(defaultCompositeOp);
                }
                if (alpha == alpha) {
                    buffer.globalAlpha = originAlpha;
                }
                if (m) {
                    let matrix = buffer.globalMatrix;
                    matrix.a = savedMatrix.a;
                    matrix.b = savedMatrix.b;
                    matrix.c = savedMatrix.c;
                    matrix.d = savedMatrix.d;
                    matrix.tx = savedMatrix.tx;
                    matrix.ty = savedMatrix.ty;
                    buffer.offsetX = offsetX;
                    buffer.offsetY = offsetY;
                    savedMatrix.recycle();
                }
            }
            renderText(node, buffer) {
                let width = node.width - node.x;
                let height = node.height - node.y;
                if (width <= 0 || height <= 0 || !width || !height || node.drawData.length == 0) {
                    return;
                }
                let canvasScaleX = rendering.DisplayList.canvasScaleX;
                let canvasScaleY = rendering.DisplayList.canvasScaleY;
                let maxTextureSize = buffer.context.maxTextureSize;
                if (width * canvasScaleX > maxTextureSize) {
                    canvasScaleX *= maxTextureSize / (width * canvasScaleX);
                }
                if (height * canvasScaleY > maxTextureSize) {
                    canvasScaleY *= maxTextureSize / (height * canvasScaleY);
                }
                width *= canvasScaleX;
                height *= canvasScaleY;
                let x = node.x * canvasScaleX;
                let y = node.y * canvasScaleY;
                if (node.canvasScaleX != canvasScaleX || node.canvasScaleY != canvasScaleY) {
                    node.canvasScaleX = canvasScaleX;
                    node.canvasScaleY = canvasScaleY;
                    node.dirtyRender = true;
                }
                if (!this._canvasRenderBuffer || !this._canvasRenderBuffer.context) {
                    this._canvasRenderer = new rendering.CanvasRenderer();
                    this._canvasRenderBuffer = new rendering.CanvasRenderBuffer(width, height);
                }
                else if (node.dirtyRender) {
                    this._canvasRenderBuffer.resize(width, height);
                }
                if (!this._canvasRenderBuffer.context) {
                    return;
                }
                if (canvasScaleX != 1 || canvasScaleY != 1) {
                    this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
                }
                if (x || y) {
                    if (node.dirtyRender) {
                        this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, -x, -y);
                    }
                    buffer.transform(1, 0, 0, 1, x / canvasScaleX, y / canvasScaleY);
                }
                else if (canvasScaleX != 1 || canvasScaleY != 1) {
                    this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
                }
                if (node.dirtyRender) {
                    let surface = this._canvasRenderBuffer.surface;
                    this._canvasRenderer.renderText(node, this._canvasRenderBuffer.context);
                    // 拷贝 canvas 到 texture
                    let texture = node.texture;
                    if (!texture) {
                        texture = buffer.context.createTexture(surface);
                        node.texture = texture;
                    }
                    else {
                        // 重新拷贝新的图像
                        buffer.context.updateTexture(texture, surface);
                    }
                    // 保存材质尺寸
                    node.textureWidth = surface.width;
                    node.textureHeight = surface.height;
                }
                let textureWidth = node.textureWidth;
                let textureHeight = node.textureHeight;
                buffer.context.drawTexture(node.texture, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth / canvasScaleX, textureHeight / canvasScaleY, textureWidth, textureHeight);
                if (x || y) {
                    if (node.dirtyRender) {
                        this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
                    }
                    buffer.transform(1, 0, 0, 1, -x / canvasScaleX, -y / canvasScaleY);
                }
                node.dirtyRender = false;
            }
            renderGraphics(node, buffer, forHitTest) {
                let width = node.width;
                let height = node.height;
                if (width <= 0 || height <= 0 || !width || !height || node.drawData.length == 0) {
                    return;
                }
                let canvasScaleX = rendering.DisplayList.canvasScaleX;
                let canvasScaleY = rendering.DisplayList.canvasScaleY;
                if (width * canvasScaleX < 1 || height * canvasScaleY < 1) {
                    canvasScaleX = canvasScaleY = 1;
                }
                if (node.canvasScaleX != canvasScaleX || node.canvasScaleY != canvasScaleY) {
                    node.canvasScaleX = canvasScaleX;
                    node.canvasScaleY = canvasScaleY;
                    node.dirtyRender = true;
                }
                // 缩放叠加 width2 / width 填满整个区域
                width = width * canvasScaleX;
                height = height * canvasScaleY;
                let width2 = Math.ceil(width);
                let height2 = Math.ceil(height);
                canvasScaleX *= width2 / width;
                canvasScaleY *= height2 / height;
                width = width2;
                height = height2;
                if (!this._canvasRenderBuffer || !this._canvasRenderBuffer.context) {
                    this._canvasRenderer = new rendering.CanvasRenderer();
                    this._canvasRenderBuffer = new rendering.CanvasRenderBuffer(width, height);
                }
                else if (node.dirtyRender) {
                    this._canvasRenderBuffer.resize(width, height);
                }
                if (!this._canvasRenderBuffer.context) {
                    return;
                }
                if (canvasScaleX != 1 || canvasScaleY != 1) {
                    this._canvasRenderBuffer.context.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
                }
                if (node.x || node.y) {
                    if (node.dirtyRender || forHitTest) {
                        this._canvasRenderBuffer.context.translate(-node.x, -node.y);
                    }
                    buffer.transform(1, 0, 0, 1, node.x, node.y);
                }
                let surface = this._canvasRenderBuffer.surface;
                if (forHitTest) {
                    this._canvasRenderer.renderGraphics(node, this._canvasRenderBuffer.context);
                    let texture;
                    dou2d.WebGLUtil.deleteTexture(surface);
                    texture = buffer.context.getTexture(surface);
                    buffer.context.drawTexture(texture, 0, 0, width, height, 0, 0, width, height, surface.width, surface.height);
                }
                else {
                    if (node.dirtyRender) {
                        this._canvasRenderer.renderGraphics(node, this._canvasRenderBuffer.context);
                        // 拷贝 canvas 到 texture
                        let texture = node.texture;
                        if (!texture) {
                            texture = buffer.context.createTexture(surface);
                            node.texture = texture;
                        }
                        else {
                            // 重新拷贝新的图像
                            buffer.context.updateTexture(texture, surface);
                        }
                        // 保存材质尺寸
                        node.textureWidth = surface.width;
                        node.textureHeight = surface.height;
                    }
                    let textureWidth = node.textureWidth;
                    let textureHeight = node.textureHeight;
                    buffer.context.drawTexture(node.texture, 0, 0, textureWidth, textureHeight, 0, 0, textureWidth / canvasScaleX, textureHeight / canvasScaleY, textureWidth, textureHeight);
                }
                if (node.x || node.y) {
                    if (node.dirtyRender || forHitTest) {
                        this._canvasRenderBuffer.context.translate(node.x, node.y);
                    }
                    buffer.transform(1, 0, 0, 1, -node.x, -node.y);
                }
                if (!forHitTest) {
                    node.dirtyRender = false;
                }
            }
            renderGroup(groupNode, buffer) {
                let m = groupNode.matrix;
                let savedMatrix;
                let offsetX;
                let offsetY;
                if (m) {
                    savedMatrix = dou.recyclable(dou2d.Matrix);
                    let curMatrix = buffer.globalMatrix;
                    savedMatrix.a = curMatrix.a;
                    savedMatrix.b = curMatrix.b;
                    savedMatrix.c = curMatrix.c;
                    savedMatrix.d = curMatrix.d;
                    savedMatrix.tx = curMatrix.tx;
                    savedMatrix.ty = curMatrix.ty;
                    offsetX = buffer.offsetX;
                    offsetY = buffer.offsetY;
                    buffer.useOffset();
                    buffer.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                }
                let children = groupNode.drawData;
                let length = children.length;
                for (let i = 0; i < length; i++) {
                    let node = children[i];
                    this.renderNode(node, buffer, buffer.offsetX, buffer.offsetY);
                }
                if (m) {
                    let matrix = buffer.globalMatrix;
                    matrix.a = savedMatrix.a;
                    matrix.b = savedMatrix.b;
                    matrix.c = savedMatrix.c;
                    matrix.d = savedMatrix.d;
                    matrix.tx = savedMatrix.tx;
                    matrix.ty = savedMatrix.ty;
                    buffer.offsetX = offsetX;
                    buffer.offsetY = offsetY;
                    savedMatrix.recycle();
                }
            }
            renderNode(node, buffer, offsetX, offsetY, forHitTest) {
                buffer.offsetX = offsetX;
                buffer.offsetY = offsetY;
                switch (node.type) {
                    case 2 /* bitmapNode */:
                        this.renderBitmap(node, buffer);
                        break;
                    case 3 /* textNode */:
                        this.renderText(node, buffer);
                        break;
                    case 4 /* graphicsNode */:
                        this.renderGraphics(node, buffer, forHitTest);
                        break;
                    case 5 /* groupNode */:
                        this.renderGroup(node, buffer);
                        break;
                    case 1 /* normalBitmapNode */:
                        this.renderNormalBitmap(node, buffer);
                        break;
                }
            }
            createRenderBuffer(width, height) {
                let buffer = this._renderBufferPool.pop();
                if (buffer) {
                    buffer.resize(width, height);
                }
                else {
                    buffer = new rendering.RenderBuffer(width, height);
                    buffer.computeDrawCall = false;
                }
                return buffer;
            }
        }
        rendering.Renderer = Renderer;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 默认屏幕适配器
     * @author wizardc
     */
    class DefaultScreenAdapter {
        /**
         * 计算舞台显示尺寸
         * @param scaleMode 当前的缩放模式
         * @param screenWidth 播放器视口宽度
         * @param screenHeight 播放器视口高度
         * @param contentWidth 初始化内容宽度
         * @param contentHeight 初始化内容高度
         */
        calculateStageSize(scaleMode, screenWidth, screenHeight, contentWidth, contentHeight) {
            let displayWidth = screenWidth;
            let displayHeight = screenHeight;
            let stageWidth = contentWidth;
            let stageHeight = contentHeight;
            let scaleX = (screenWidth / stageWidth) || 0;
            let scaleY = (screenHeight / stageHeight) || 0;
            switch (scaleMode) {
                case "exactFit" /* exactFit */:
                    break;
                case "fixedHeight" /* fixedHeight */:
                    stageWidth = Math.round(screenWidth / scaleY);
                    break;
                case "fixedWidth" /* fixedWidth */:
                    stageHeight = Math.round(screenHeight / scaleX);
                    break;
                case "noBorder" /* noBorder */:
                    if (scaleX > scaleY) {
                        displayHeight = Math.round(stageHeight * scaleX);
                    }
                    else {
                        displayWidth = Math.round(stageWidth * scaleY);
                    }
                    break;
                case "showAll" /* showAll */:
                    if (scaleX > scaleY) {
                        displayWidth = Math.round(stageWidth * scaleY);
                    }
                    else {
                        displayHeight = Math.round(stageHeight * scaleX);
                    }
                    break;
                case "fixedNarrow" /* fixedNarrow */:
                    if (scaleX > scaleY) {
                        stageWidth = Math.round(screenWidth / scaleY);
                    }
                    else {
                        stageHeight = Math.round(screenHeight / scaleX);
                    }
                    break;
                case "fixedWide" /* fixedWide */:
                    if (scaleX > scaleY) {
                        stageHeight = Math.round(screenHeight / scaleX);
                    }
                    else {
                        stageWidth = Math.round(screenWidth / scaleY);
                    }
                    break;
                default:
                    stageWidth = screenWidth;
                    stageHeight = screenHeight;
                    break;
            }
            // 宽高不是 2 的整数倍会导致图片绘制出现问题
            if (stageWidth % 2 != 0) {
                stageWidth += 1;
            }
            if (stageHeight % 2 != 0) {
                stageHeight += 1;
            }
            if (displayWidth % 2 != 0) {
                displayWidth += 1;
            }
            if (displayHeight % 2 != 0) {
                displayHeight += 1;
            }
            return { stageWidth, stageHeight, displayWidth, displayHeight };
        }
    }
    dou2d.DefaultScreenAdapter = DefaultScreenAdapter;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 着色器库
         * @author GLSLPacker
         */
        let ShaderLib;
        (function (ShaderLib) {
            ShaderLib.default_vs = `attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec2 aColor;\nuniform vec2 projectionVector;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nconst vec2 center=vec2(-1.0,1.0);\nvoid main(){\ngl_Position=vec4((aVertexPosition/projectionVector)+center,0.0,1.0);\nvTextureCoord=aTextureCoord;\nvColor=vec4(aColor.x,aColor.x,aColor.x,aColor.x);\n}`;
            ShaderLib.blur_fs = `precision mediump float;\nuniform vec2 blur;\nuniform sampler2D uSampler;\nuniform vec2 uTextureSize;\nvarying vec2 vTextureCoord;\nvoid main(){\nconst int sampleRadius=5;\nconst int samples=sampleRadius*2+1;\nvec2 blurUv=blur/uTextureSize;\nvec4 color=vec4(0.0,0.0,0.0,0.0);\nvec2 uv=vec2(0.0,0.0);\nblurUv/=float(sampleRadius);\nfor(int i=-sampleRadius;i<=sampleRadius;i++){\nuv.x=vTextureCoord.x+float(i)*blurUv.x;\nuv.y=vTextureCoord.y+float(i)*blurUv.y;\ncolor+=texture2D(uSampler,uv);\n}\ncolor/=float(samples);\ngl_FragColor=color;\n}`;
            ShaderLib.colorBrush_fs = `precision lowp float;\nuniform float r;\nuniform float g;\nuniform float b;\nuniform float a;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\nvoid main(){\nvec4 color=texture2D(uSampler,vTextureCoord);\nif(color.a>0.0){\ncolor=vec4(color.rgb/color.a,color.a);\n}\ncolor.r=r;\ncolor.g=g;\ncolor.b=b;\ncolor.a*=a;\ngl_FragColor=vec4(color.rgb*color.a,color.a);\n}`;
            ShaderLib.colorTransform_fs = `precision mediump float;\nuniform mat4 matrix;\nuniform vec4 colorAdd;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvoid main(){\nvec4 texColor=texture2D(uSampler,vTextureCoord);\nif(texColor.a>0.0){\ntexColor=vec4(texColor.rgb/texColor.a,texColor.a);\n}\nvec4 locColor=clamp(texColor*matrix+colorAdd,0.0,1.0);\ngl_FragColor=vColor*vec4(locColor.rgb*locColor.a,locColor.a);\n}`;
            ShaderLib.glow_fs = `precision highp float;\nuniform float dist;\nuniform float angle;\nuniform vec4 color;\nuniform float alpha;\nuniform float blurX;\nuniform float blurY;\nuniform float strength;\nuniform float inner;\nuniform float knockout;\nuniform float hideObject;\nuniform sampler2D uSampler;\nuniform vec2 uTextureSize;\nvarying vec2 vTextureCoord;\nfloat random(vec2 scale){\nreturn fract(sin(dot(gl_FragCoord.xy,scale))*43758.5453);\n}\nvoid main(){\nvec2 px=vec2(1.0/uTextureSize.x,1.0/uTextureSize.y);\nconst float linearSamplingTimes=7.0;\nconst float circleSamplingTimes=12.0;\nvec4 ownColor=texture2D(uSampler,vTextureCoord);\nvec4 curColor;\nfloat totalAlpha=0.0;\nfloat maxTotalAlpha=0.0;\nfloat curDistanceX=0.0;\nfloat curDistanceY=0.0;\nfloat offsetX=dist*cos(angle)*px.x;\nfloat offsetY=dist*sin(angle)*px.y;\nconst float PI=3.14159265358979323846264;\nfloat cosAngle;\nfloat sinAngle;\nfloat offset=PI*2.0/circleSamplingTimes*random(vec2(12.9898,78.233));\nfloat stepX=blurX*px.x/linearSamplingTimes;\nfloat stepY=blurY*px.y/linearSamplingTimes;\nfor(float a=0.0;a<=PI*2.0;a+=PI*2.0/circleSamplingTimes){\ncosAngle=cos(a+offset);\nsinAngle=sin(a+offset);\nfor(float i=1.0;i<=linearSamplingTimes;i++){\ncurDistanceX=i*stepX*cosAngle;\ncurDistanceY=i*stepY*sinAngle;\nif(vTextureCoord.x+curDistanceX-offsetX>=0.0 && vTextureCoord.y+curDistanceY+offsetY<=1.0){\ncurColor=texture2D(uSampler,vec2(vTextureCoord.x+curDistanceX-offsetX,vTextureCoord.y+curDistanceY+offsetY));\ntotalAlpha+=(linearSamplingTimes-i)*curColor.a;\n}\nmaxTotalAlpha+=(linearSamplingTimes-i);\n}\n}\nownColor.a=max(ownColor.a,0.0001);\nownColor.rgb=ownColor.rgb/ownColor.a;\nfloat outerGlowAlpha=(totalAlpha/maxTotalAlpha)*strength*alpha*(1.0-inner)*max(min(hideObject,knockout),1.0-ownColor.a);\nfloat innerGlowAlpha=((maxTotalAlpha-totalAlpha)/maxTotalAlpha)*strength*alpha*inner*ownColor.a;\nownColor.a=max(ownColor.a*knockout*(1.0-hideObject),0.0001);\nvec3 mix1=mix(ownColor.rgb,color.rgb,innerGlowAlpha/(innerGlowAlpha+ownColor.a));\nvec3 mix2=mix(mix1,color.rgb,outerGlowAlpha/(innerGlowAlpha+ownColor.a+outerGlowAlpha));\nfloat resultAlpha=min(ownColor.a+outerGlowAlpha+innerGlowAlpha,1.0);\ngl_FragColor=vec4(mix2*resultAlpha,resultAlpha);\n}`;
            ShaderLib.primitive_fs = `precision lowp float;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvoid main(){\ngl_FragColor=vColor;\n}`;
            ShaderLib.texture_fs = `precision lowp float;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nuniform sampler2D uSampler;\nvoid main(){\ngl_FragColor=texture2D(uSampler,vTextureCoord)*vColor;\n}`;
        })(ShaderLib = rendering.ShaderLib || (rendering.ShaderLib = {}));
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 着色器程序
         * @author wizardc
         */
        class Program {
            constructor(gl, vertSource, fragSource) {
                let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertSource);
                let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragSource);
                this.program = this.createProgram(gl, vertexShader, fragmentShader);
                this.attributes = this.extractAttributes(gl, this.program);
                this.uniforms = this.extractUniforms(gl, this.program);
            }
            static getProgram(key, gl, vertSource, fragSource) {
                if (!this.programCache[key]) {
                    this.programCache[key] = new Program(gl, vertSource, fragSource);
                }
                return this.programCache[key];
            }
            static deleteProgram(key) {
                delete this.programCache[key];
            }
            createShader(gl, type, source) {
                let shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
                if (DEBUG && !compiled) {
                    console.error(`着色器未成功编译`);
                    console.error(gl.getShaderInfoLog(shader));
                }
                return shader;
            }
            createProgram(gl, vertexShader, fragmentShader) {
                let program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                return program;
            }
            extractAttributes(gl, program) {
                let attributes = {};
                let totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
                for (let i = 0; i < totalAttributes; i++) {
                    let attribData = gl.getActiveAttrib(program, i);
                    let name = attribData.name;
                    let attribute = new rendering.Attribute(gl, program, attribData);
                    attributes[name] = attribute;
                }
                return attributes;
            }
            extractUniforms(gl, program) {
                let uniforms = {};
                let totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < totalUniforms; i++) {
                    let uniformData = gl.getActiveUniform(program, i);
                    let name = uniformData.name;
                    let uniform = new rendering.Uniform(gl, program, uniformData);
                    uniforms[name] = uniform;
                }
                return uniforms;
            }
        }
        Program.programCache = {};
        rendering.Program = Program;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 着色器属性
         * @author wizardc
         */
        class Attribute {
            constructor(gl, program, attributeData) {
                this.name = attributeData.name;
                this.type = attributeData.type;
                this.size = attributeData.size;
                this.location = gl.getAttribLocation(program, this.name);
                this.count = 0;
                this.format = gl.FLOAT;
                this.initCount(gl);
                this.initFormat(gl);
            }
            initCount(gl) {
                switch (this.type) {
                    case gl.FLOAT:
                    case gl.BYTE:
                    case gl.UNSIGNED_BYTE:
                    case gl.UNSIGNED_SHORT:
                        this.count = 1;
                        break;
                    case gl.FLOAT_VEC2:
                        this.count = 2;
                        break;
                    case gl.FLOAT_VEC3:
                        this.count = 3;
                        break;
                    case gl.FLOAT_VEC4:
                        this.count = 4;
                        break;
                }
            }
            initFormat(gl) {
                switch (this.type) {
                    case gl.FLOAT:
                    case gl.FLOAT_VEC2:
                    case gl.FLOAT_VEC3:
                    case gl.FLOAT_VEC4:
                        this.format = gl.FLOAT;
                        break;
                    case gl.UNSIGNED_BYTE:
                        this.format = gl.UNSIGNED_BYTE;
                        break;
                    case gl.UNSIGNED_SHORT:
                        this.format = gl.UNSIGNED_SHORT;
                        break;
                    case gl.BYTE:
                        this.format = gl.BYTE;
                        break;
                }
            }
        }
        rendering.Attribute = Attribute;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var rendering;
    (function (rendering) {
        /**
         * 着色器参数
         * @author wizardc
         */
        class Uniform {
            constructor(gl, program, uniformData) {
                this.name = uniformData.name;
                this.type = uniformData.type;
                this.size = uniformData.size;
                this.location = gl.getUniformLocation(program, this.name);
                this.setDefaultValue(gl);
                this.generateSetValue(gl);
                this.generateUpload(gl);
            }
            setDefaultValue(gl) {
                switch (this.type) {
                    case gl.FLOAT:
                    case gl.SAMPLER_2D:
                    case gl.SAMPLER_CUBE:
                    case gl.BOOL:
                    case gl.INT:
                        this.value = 0;
                        break;
                    case gl.FLOAT_VEC2:
                    case gl.BOOL_VEC2:
                    case gl.INT_VEC2:
                        this.value = [0, 0];
                        break;
                    case gl.FLOAT_VEC3:
                    case gl.BOOL_VEC3:
                    case gl.INT_VEC3:
                        this.value = [0, 0, 0];
                        break;
                    case gl.FLOAT_VEC4:
                    case gl.BOOL_VEC4:
                    case gl.INT_VEC4:
                        this.value = [0, 0, 0, 0];
                        break;
                    case gl.FLOAT_MAT2:
                        this.value = new Float32Array([
                            1, 0,
                            0, 1
                        ]);
                        break;
                    case gl.FLOAT_MAT3:
                        this.value = new Float32Array([
                            1, 0, 0,
                            0, 1, 0,
                            0, 0, 1
                        ]);
                        break;
                    case gl.FLOAT_MAT4:
                        this.value = new Float32Array([
                            1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1
                        ]);
                        break;
                }
            }
            generateSetValue(gl) {
                switch (this.type) {
                    case gl.FLOAT:
                    case gl.SAMPLER_2D:
                    case gl.SAMPLER_CUBE:
                    case gl.BOOL:
                    case gl.INT:
                        this.setValue = (value) => {
                            let notEqual = this.value !== value;
                            this.value = value;
                            notEqual && this.upload();
                        };
                        break;
                    case gl.FLOAT_VEC2:
                    case gl.BOOL_VEC2:
                    case gl.INT_VEC2:
                        this.setValue = (value) => {
                            let notEqual = this.value[0] !== value.x || this.value[1] !== value.y;
                            this.value[0] = value.x;
                            this.value[1] = value.y;
                            notEqual && this.upload();
                        };
                        break;
                    case gl.FLOAT_VEC3:
                    case gl.BOOL_VEC3:
                    case gl.INT_VEC3:
                        this.setValue = (value) => {
                            this.value[0] = value.x;
                            this.value[1] = value.y;
                            this.value[2] = value.z;
                            this.upload();
                        };
                        break;
                    case gl.FLOAT_VEC4:
                    case gl.BOOL_VEC4:
                    case gl.INT_VEC4:
                        this.setValue = (value) => {
                            this.value[0] = value.x;
                            this.value[1] = value.y;
                            this.value[2] = value.z;
                            this.value[3] = value.w;
                            this.upload();
                        };
                        break;
                    case gl.FLOAT_MAT2:
                    case gl.FLOAT_MAT3:
                    case gl.FLOAT_MAT4:
                        this.setValue = (value) => {
                            this.value.set(value);
                            this.upload();
                        };
                        break;
                }
            }
            generateUpload(gl) {
                switch (this.type) {
                    case gl.FLOAT:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform1f(this.location, value);
                        };
                        break;
                    case gl.FLOAT_VEC2:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform2f(this.location, value[0], value[1]);
                        };
                        break;
                    case gl.FLOAT_VEC3:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform3f(this.location, value[0], value[1], value[2]);
                        };
                        break;
                    case gl.FLOAT_VEC4:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform4f(this.location, value[0], value[1], value[2], value[3]);
                        };
                        break;
                    case gl.SAMPLER_2D:
                    case gl.SAMPLER_CUBE:
                    case gl.BOOL:
                    case gl.INT:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform1i(this.location, value);
                        };
                        break;
                    case gl.BOOL_VEC2:
                    case gl.INT_VEC2:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform2i(this.location, value[0], value[1]);
                        };
                        break;
                    case gl.BOOL_VEC3:
                    case gl.INT_VEC3:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform3i(this.location, value[0], value[1], value[2]);
                        };
                        break;
                    case gl.BOOL_VEC4:
                    case gl.INT_VEC4:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniform4i(this.location, value[0], value[1], value[2], value[3]);
                        };
                        break;
                    case gl.FLOAT_MAT2:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniformMatrix2fv(this.location, false, value);
                        };
                        break;
                    case gl.FLOAT_MAT3:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniformMatrix3fv(this.location, false, value);
                        };
                        break;
                    case gl.FLOAT_MAT4:
                        this.upload = () => {
                            let value = this.value;
                            gl.uniformMatrix4fv(this.location, false, value);
                        };
                        break;
                }
            }
        }
        rendering.Uniform = Uniform;
    })(rendering = dou2d.rendering || (dou2d.rendering = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var input;
    (function (input) {
        /**
         * 输入文本
         * @author wizardc
         */
        class HtmlText extends dou.EventDispatcher {
            constructor() {
                super(...arguments);
                this._gscaleX = 0;
                this._gscaleY = 0;
                this._textValue = "";
                this._colorValue = 0xffffff;
                this._styleInfoes = {};
            }
            setTextField(textfield) {
                this.textfield = textfield;
                return true;
            }
            addToStage() {
                this._htmlInput = dou2d.sys.inputManager;
            }
            show() {
                if (!this._htmlInput.isCurrentStageText(this)) {
                    this._inputElement = this._htmlInput.getInputElement(this);
                    if (!this.textfield.multiline) {
                        this._inputElement.type = this.textfield.inputType;
                    }
                    else {
                        if (this._inputElement instanceof HTMLInputElement) {
                            this._inputElement.type = "text";
                        }
                    }
                    this._inputDiv = this._htmlInput.inputDIV;
                }
                else {
                    this._inputElement.onblur = null;
                }
                this._htmlInput.needShow = true;
                //标记当前文本被选中
                this._isNeedShow = true;
                this.initElement();
            }
            initElement() {
                let point = this.textfield.localToGlobal(0, 0);
                let x = point.x;
                let y = point.y;
                let scaleX = this._htmlInput.scaleX;
                let scaleY = this._htmlInput.scaleY;
                this._inputDiv.style.left = x * scaleX + "px";
                this._inputDiv.style.top = y * scaleY + "px";
                if (this.textfield.multiline && this.textfield.height > this.textfield.size) {
                    this._inputDiv.style.top = (y) * scaleY + "px";
                    this._inputElement.style.top = (-this.textfield.lineSpacing / 2) * scaleY + "px";
                }
                else {
                    this._inputDiv.style.top = y * scaleY + "px";
                    this._inputElement.style.top = 0 + "px";
                }
                let node = this.textfield;
                let cX = 1;
                let cY = 1;
                let rotation = 0;
                while (node.parent) {
                    cX *= node.scaleX;
                    cY *= node.scaleY;
                    rotation += node.rotation;
                    node = node.parent;
                }
                let transformKey = dou2d.HtmlUtil.getStyleName("transform");
                this._inputDiv.style[transformKey] = "rotate(" + rotation + "deg)";
                this._gscaleX = scaleX * cX;
                this._gscaleY = scaleY * cY;
            }
            setText(value) {
                this._textValue = value;
                this.resetText();
                return true;
            }
            getText() {
                if (!this._textValue) {
                    this._textValue = "";
                }
                return this._textValue;
            }
            resetText() {
                if (this._inputElement) {
                    this._inputElement.value = this._textValue;
                }
            }
            setColor(value) {
                this._colorValue = value;
                this.resetColor();
                return true;
            }
            resetColor() {
                if (this._inputElement) {
                    this.setElementStyle("color", dou2d.HtmlUtil.toColorString(this._colorValue));
                }
            }
            onBlur() {
            }
            onInput() {
                let self = this;
                window.setTimeout(function () {
                    if (self._inputElement && self._inputElement.selectionStart == self._inputElement.selectionEnd) {
                        self._textValue = self._inputElement.value;
                        self.dispatchEvent2D(dou2d.Event2D.UPDATE_TEXT);
                    }
                }, 0);
            }
            onClickHandler(e) {
                if (this._isNeedShow) {
                    e.stopImmediatePropagation();
                    this._isNeedShow = false;
                    this.executeShow();
                    this.dispatchEvent2D(dou2d.Event2D.FOCUS_IN);
                }
            }
            executeShow() {
                this._inputElement.value = this.getText();
                if (this._inputElement.onblur == null) {
                    this._inputElement.onblur = this.onBlurHandler.bind(this);
                }
                if (this._inputElement.onfocus == null) {
                    this._inputElement.onfocus = this.onFocusHandler.bind(this);
                }
                this.resetStageText();
                if (this.textfield.maxChars > 0) {
                    this._inputElement.setAttribute("maxlength", this.textfield.maxChars);
                }
                else {
                    this._inputElement.removeAttribute("maxlength");
                }
                this._inputElement.selectionStart = this._inputElement.value.length;
                this._inputElement.selectionEnd = this._inputElement.value.length;
                this._inputElement.focus();
            }
            onBlurHandler() {
                this._htmlInput.clearInputElement();
                window.scrollTo(0, 0);
            }
            onFocusHandler() {
                let self = this;
                window.setTimeout(function () {
                    if (self._inputElement) {
                        self._inputElement.scrollIntoView();
                    }
                }, 200);
            }
            /**
             * 修改位置
             */
            resetStageText() {
                if (this._inputElement) {
                    let textfield = this.textfield;
                    this.setElementStyle("fontFamily", textfield.fontFamily);
                    this.setElementStyle("fontStyle", textfield.italic ? "italic" : "normal");
                    this.setElementStyle("fontWeight", textfield.bold ? "bold" : "normal");
                    this.setElementStyle("textAlign", textfield.textAlign);
                    this.setElementStyle("fontSize", textfield.size * this._gscaleY + "px");
                    this.setElementStyle("color", dou2d.HtmlUtil.toColorString(textfield.textColor));
                    let tw;
                    if (textfield.stage) {
                        tw = textfield.localToGlobal(0, 0).x;
                        tw = Math.min(textfield.width, textfield.stage.stageWidth - tw);
                    }
                    else {
                        tw = textfield.width;
                    }
                    this.setElementStyle("width", tw * this._gscaleX + "px");
                    this.setElementStyle("verticalAlign", textfield.verticalAlign);
                    if (textfield.multiline) {
                        this.setAreaHeight();
                    }
                    else {
                        this.setElementStyle("lineHeight", (textfield.size) * this._gscaleY + "px");
                        if (textfield.height < textfield.size) {
                            this.setElementStyle("height", (textfield.size) * this._gscaleY + "px");
                            let bottom = (textfield.size / 2) * this._gscaleY;
                            this.setElementStyle("padding", "0px 0px " + bottom + "px 0px");
                        }
                        else {
                            this.setElementStyle("height", (textfield.size) * this._gscaleY + "px");
                            let rap = (textfield.height - textfield.size) * this._gscaleY;
                            let valign = dou2d.TextFieldUtil.getValign(textfield);
                            let top = rap * valign;
                            let bottom = rap - top;
                            if (bottom < textfield.size / 2 * this._gscaleY) {
                                bottom = textfield.size / 2 * this._gscaleY;
                            }
                            this.setElementStyle("padding", top + "px 0px " + bottom + "px 0px");
                        }
                    }
                    this._inputDiv.style.clip = "rect(0px " + (textfield.width * this._gscaleX) + "px " + (textfield.height * this._gscaleY) + "px 0px)";
                    this._inputDiv.style.height = textfield.height * this._gscaleY + "px";
                    this._inputDiv.style.width = tw * this._gscaleX + "px";
                }
            }
            setAreaHeight() {
                let textfield = this.textfield;
                if (textfield.multiline) {
                    let textheight = dou2d.TextFieldUtil.getTextHeight(textfield);
                    if (textfield.height <= textfield.size) {
                        this.setElementStyle("height", (textfield.size) * this._gscaleY + "px");
                        this.setElementStyle("padding", "0px");
                        this.setElementStyle("lineHeight", (textfield.size) * this._gscaleY + "px");
                    }
                    else if (textfield.height < textheight) {
                        this.setElementStyle("height", (textfield.height) * this._gscaleY + "px");
                        this.setElementStyle("padding", "0px");
                        this.setElementStyle("lineHeight", (textfield.size + textfield.lineSpacing) * this._gscaleY + "px");
                    }
                    else {
                        this.setElementStyle("height", (textheight + textfield.lineSpacing) * this._gscaleY + "px");
                        let rap = (textfield.height - textheight) * this._gscaleY;
                        let valign = dou2d.TextFieldUtil.getValign(textfield);
                        let top = rap * valign;
                        let bottom = rap - top;
                        this.setElementStyle("padding", top + "px 0px " + bottom + "px 0px");
                        this.setElementStyle("lineHeight", (textfield.size + textfield.lineSpacing) * this._gscaleY + "px");
                    }
                }
            }
            setElementStyle(style, value) {
                if (this._inputElement) {
                    if (this._styleInfoes[style] != value) {
                        this._inputElement.style[style] = value;
                    }
                }
            }
            hide() {
                if (this._htmlInput) {
                    this._htmlInput.disconnectStageText(this);
                }
            }
            removeFromStage() {
                if (this._inputElement) {
                    this._htmlInput.disconnectStageText(this);
                }
            }
            onDisconnect() {
                this._inputElement = null;
                this.dispatchEvent2D(dou2d.Event2D.FOCUS_OUT);
            }
        }
        input.HtmlText = HtmlText;
    })(input = dou2d.input || (dou2d.input = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var input;
    (function (input) {
        /**
         * 输入文本控制器
         * @author wizardc
         */
        class InputController {
            init(text) {
                this._text = text;
                this._stageText = new input.HtmlText();
                this._stageText.setTextField(this._text);
            }
            setText(value) {
                this._stageText.setText(value);
            }
            getText() {
                return this._stageText.getText();
            }
            setColor(value) {
                this._stageText.setColor(value);
            }
            addStageText() {
                if (this._stageTextAdded) {
                    return;
                }
                if (!this._text.$inputEnabled) {
                    this._text.touchEnabled = true;
                }
                this._tempStage = this._text.stage;
                this._stageText.addToStage();
                this._stageText.on(dou2d.Event2D.UPDATE_TEXT, this.updateTextHandler, this);
                this._text.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onMouseDownHandler, this);
                this._stageText.on(dou2d.Event2D.FOCUS_OUT, this.blurHandler, this);
                this._stageText.on(dou2d.Event2D.FOCUS_IN, this.focusHandler, this);
                this._stageTextAdded = true;
            }
            focusHandler(event) {
                // 不再显示竖线, 并且输入框显示最开始
                if (!this._isFocus) {
                    this._isFocus = true;
                    if (!event["showing"]) {
                        this._text.$setIsTyping(true);
                    }
                    this._text.dispatchEvent2D(dou2d.Event2D.FOCUS_IN, null, true);
                }
            }
            blurHandler(event) {
                if (this._isFocus) {
                    // 不再显示竖线, 并且输入框显示最开始
                    this._isFocus = false;
                    this._tempStage.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
                    this._text.$setIsTyping(false);
                    // 失去焦点后调用
                    this._stageText.onBlur();
                    this._text.dispatchEvent2D(dou2d.Event2D.FOCUS_OUT, null, true);
                }
            }
            // 点中文本
            onMouseDownHandler(event) {
                this.onFocus();
            }
            onFocus() {
                if (!this._text.$getVisible()) {
                    return;
                }
                if (this._isFocus) {
                    return;
                }
                this._tempStage.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
                dou2d.callLater(() => {
                    this._tempStage.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
                }, this);
                // 强制更新输入框位置
                this._stageText.show();
            }
            // 未点中文本
            onStageDownHandler(event) {
                if (event.target != this._text) {
                    this._stageText.hide();
                }
            }
            updateTextHandler(event) {
                let values = this._text.$propertyMap;
                let textValue = this._stageText.getText();
                let isChanged = false;
                let reg;
                let result;
                // 内匹配
                if (values[35 /* restrictAnd */] != null) {
                    reg = new RegExp("[" + values[35 /* restrictAnd */] + "]", "g");
                    result = textValue.match(reg);
                    if (result) {
                        textValue = result.join("");
                    }
                    else {
                        textValue = "";
                    }
                    isChanged = true;
                }
                // 外匹配
                if (values[36 /* restrictNot */] != null) {
                    reg = new RegExp("[^" + values[36 /* restrictNot */] + "]", "g");
                    result = textValue.match(reg);
                    if (result) {
                        textValue = result.join("");
                    }
                    else {
                        textValue = "";
                    }
                    isChanged = true;
                }
                if (isChanged && this._stageText.getText() != textValue) {
                    this._stageText.setText(textValue);
                }
                this.resetText();
                this._text.dispatchEvent2D(dou2d.Event2D.CHANGE, null, true);
            }
            resetText() {
                this._text.$setBaseText(this._stageText.getText());
            }
            updateProperties() {
                if (this._isFocus) {
                    // 整体修改
                    this._stageText.resetStageText();
                    this.updateInput();
                    return;
                }
                this._stageText.setText(this._text.$propertyMap[13 /* text */]);
                //整体修改
                this._stageText.resetStageText();
                this.updateInput();
            }
            updateInput() {
                if (!this._text.$getVisible() && this._stageText) {
                    this.hideInput();
                }
            }
            hideInput() {
                this._stageText.removeFromStage();
            }
            removeStageText() {
                if (!this._stageTextAdded) {
                    return;
                }
                if (!this._text.$inputEnabled) {
                    this._text.touchEnabled = false;
                }
                this._stageText.removeFromStage();
                this._stageText.off(dou2d.Event2D.UPDATE_TEXT, this.updateTextHandler, this);
                this._text.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onMouseDownHandler, this);
                this._tempStage.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onStageDownHandler, this);
                this._stageText.off(dou2d.Event2D.FOCUS_OUT, this.blurHandler, this);
                this._stageText.off(dou2d.Event2D.FOCUS_IN, this.focusHandler, this);
                this._stageTextAdded = false;
            }
        }
        input.InputController = InputController;
    })(input = dou2d.input || (dou2d.input = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var input;
    (function (input) {
        /**
         * 输入文本输入管理类
         * @author wizardc
         */
        class InputManager {
            constructor() {
                this.needShow = false;
                this.scaleX = 1;
                this.scaleY = 1;
            }
            isInputOn() {
                return this._stageText != null;
            }
            isCurrentStageText(stageText) {
                return this._stageText == stageText;
            }
            initValue(dom) {
                dom.style.position = "absolute";
                dom.style.left = "0px";
                dom.style.top = "0px";
                dom.style.border = "none";
                dom.style.padding = "0";
            }
            initStageDelegateDiv(container, canvas) {
                this._canvas = canvas;
                let self = this;
                let stageDelegateDiv;
                if (!stageDelegateDiv) {
                    stageDelegateDiv = document.createElement("div");
                    this._stageDelegateDiv = stageDelegateDiv;
                    stageDelegateDiv.id = "StageDelegateDiv";
                    container.appendChild(stageDelegateDiv);
                    self.initValue(stageDelegateDiv);
                    self.inputDIV = document.createElement("div");
                    self.initValue(self.inputDIV);
                    self.inputDIV.style.width = "0px";
                    self.inputDIV.style.height = "0px";
                    self.inputDIV.style.left = 0 + "px";
                    self.inputDIV.style.top = "-100px";
                    self.inputDIV.style[dou2d.HtmlUtil.getStyleName("transformOrigin")] = "0% 0% 0px";
                    stageDelegateDiv.appendChild(self.inputDIV);
                    this._canvas.addEventListener("click", function (e) {
                        if (self.needShow) {
                            self.needShow = false;
                            self._stageText.onClickHandler(e);
                            self.show();
                        }
                        else {
                            if (self._inputElement) {
                                self.clearInputElement();
                                self._inputElement.blur();
                                self._inputElement = null;
                            }
                        }
                    });
                    self.initInputElement(true);
                    self.initInputElement(false);
                }
            }
            initInputElement(multiline) {
                let self = this;
                // 增加 1 个空的 textarea
                let inputElement;
                if (multiline) {
                    inputElement = document.createElement("textarea");
                    inputElement.style["resize"] = "none";
                    self._multiElement = inputElement;
                    inputElement.id = "douTextarea";
                }
                else {
                    inputElement = document.createElement("input");
                    self._simpleElement = inputElement;
                    inputElement.id = "douInput";
                }
                if (inputElement instanceof HTMLInputElement) {
                    inputElement.type = "text";
                }
                self.inputDIV.appendChild(inputElement);
                inputElement.setAttribute("tabindex", "-1");
                inputElement.style.width = "1px";
                inputElement.style.height = "12px";
                self.initValue(inputElement);
                inputElement.style.outline = "thin";
                inputElement.style.background = "none";
                inputElement.style.overflow = "hidden";
                inputElement.style.wordBreak = "break-all";
                // 隐藏输入框
                inputElement.style.opacity = 0;
                inputElement.oninput = function () {
                    if (self._stageText) {
                        self._stageText.onInput();
                    }
                };
            }
            updateSize() {
                if (!this._canvas) {
                    return;
                }
                this.scaleX = dou2d.rendering.DisplayList.canvasScaleX;
                this.scaleY = dou2d.rendering.DisplayList.canvasScaleY;
                this._stageDelegateDiv.style.left = this._canvas.style.left;
                this._stageDelegateDiv.style.top = this._canvas.style.top;
                let transformKey = dou2d.HtmlUtil.getStyleName("transform");
                this._stageDelegateDiv.style[transformKey] = this._canvas.style[transformKey];
                this._stageDelegateDiv.style[dou2d.HtmlUtil.getStyleName("transformOrigin")] = "0% 0% 0px";
            }
            show() {
                let self = this;
                let inputElement = self._inputElement;
                // 隐藏输入框
                dou2d.callLater(function () {
                    inputElement.style.opacity = 1;
                }, self);
            }
            getInputElement(stageText) {
                let self = this;
                self.clearInputElement();
                self._stageText = stageText;
                this._canvas["userTyping"] = true;
                if (self._stageText.textfield.multiline) {
                    self._inputElement = self._multiElement;
                }
                else {
                    self._inputElement = self._simpleElement;
                }
                let otherElement;
                if (self._simpleElement == self._inputElement) {
                    otherElement = self._multiElement;
                }
                else {
                    otherElement = self._simpleElement;
                }
                otherElement.style.display = "none";
                return self._inputElement;
            }
            disconnectStageText(stageText) {
                if (this._stageText == null || this._stageText == stageText) {
                    if (this._inputElement) {
                        this._inputElement.blur();
                    }
                    this.clearInputElement();
                }
                this.needShow = false;
            }
            clearInputElement() {
                let self = this;
                if (self._inputElement) {
                    self._inputElement.value = "";
                    self._inputElement.onblur = null;
                    self._inputElement.onfocus = null;
                    self._inputElement.style.width = "1px";
                    self._inputElement.style.height = "12px";
                    self._inputElement.style.left = "0px";
                    self._inputElement.style.top = "0px";
                    self._inputElement.style.opacity = 0;
                    let otherElement;
                    if (self._simpleElement == self._inputElement) {
                        otherElement = self._multiElement;
                    }
                    else {
                        otherElement = self._simpleElement;
                    }
                    otherElement.style.display = "block";
                    self.inputDIV.style.left = 0 + "px";
                    self.inputDIV.style.top = "-100px";
                    self.inputDIV.style.height = 0 + "px";
                    self.inputDIV.style.width = 0 + "px";
                }
                if (self._stageText) {
                    self._stageText.onDisconnect();
                    self._stageText = null;
                    this._canvas["userTyping"] = false;
                }
            }
        }
        input.InputManager = InputManager;
    })(input = dou2d.input || (dou2d.input = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    const SplitRegex = new RegExp("(?=[\\u00BF-\\u1FFF\\u2C00-\\uD7FF]|\\b|\\s)(?![。，！、》…）)}”】\\.\\,\\!\\?\\]\\:])");
    /**
     * 动态文本
     * @author wizardc
     */
    class TextField extends dou2d.DisplayObject {
        constructor() {
            super();
            this.$inputEnabled = false;
            this._linkPreventTap = false;
            this._isFlow = false;
            this._isTyping = false;
            let textNode = new dou2d.rendering.TextNode();
            textNode.fontFamily = TextField.default_fontFamily;
            this._textNode = textNode;
            this.$renderNode = textNode;
            this.$propertyMap = {
                0: TextField.default_size,
                1: 0,
                2: TextField.default_textColor,
                3: NaN,
                4: NaN,
                5: 0,
                6: 0,
                7: 0,
                8: TextField.default_fontFamily,
                9: "left",
                10: "top",
                11: "#ffffff",
                12: "",
                13: "",
                14: [],
                15: false,
                16: false,
                17: true,
                18: false,
                19: false,
                20: false,
                21: 0,
                22: 0,
                23: 0,
                24: 0 /* dynamic */,
                25: 0x000000,
                26: "#000000",
                27: 0,
                28: -1,
                29: 0,
                30: false,
                31: false,
                32: 0x000000,
                33: false,
                34: 0xffffff,
                35: null,
                36: null,
                37: 0 /* text */
            };
            this._textArr = [];
            this._linesArr = [];
        }
        /**
         * 要使用的字体的名称或用逗号分隔的字体名称列表
         */
        set fontFamily(value) {
            this.$setFontFamily(value);
        }
        get fontFamily() {
            return this.$getFontFamily();
        }
        $setFontFamily(value) {
            let values = this.$propertyMap;
            if (values[8 /* fontFamily */] == value) {
                return false;
            }
            values[8 /* fontFamily */] = value;
            this.invalidateFontString();
            return true;
        }
        $getFontFamily() {
            return this.$propertyMap[8 /* fontFamily */];
        }
        /**
         * 字体大小
         */
        set size(value) {
            this.$setSize(value);
        }
        get size() {
            return this.$getSize();
        }
        $setSize(value) {
            let values = this.$propertyMap;
            if (values[0 /* fontSize */] == value) {
                return false;
            }
            values[0 /* fontSize */] = value;
            this.invalidateFontString();
            return true;
        }
        $getSize() {
            return this.$propertyMap[0 /* fontSize */];
        }
        /**
         * 是否显示为粗体
         */
        set bold(value) {
            this.$setBold(value);
        }
        get bold() {
            return this.$getBold();
        }
        $setBold(value) {
            let values = this.$propertyMap;
            if (value == values[15 /* bold */]) {
                return false;
            }
            values[15 /* bold */] = value;
            this.invalidateFontString();
            return true;
        }
        $getBold() {
            return this.$propertyMap[15 /* bold */];
        }
        /**
         * 是否显示为斜体
         */
        set italic(value) {
            this.$setItalic(value);
        }
        get italic() {
            return this.$getItalic();
        }
        $setItalic(value) {
            let values = this.$propertyMap;
            if (value == values[16 /* italic */]) {
                return false;
            }
            values[16 /* italic */] = value;
            this.invalidateFontString();
            return true;
        }
        $getItalic() {
            return this.$propertyMap[16 /* italic */];
        }
        /**
         * 文本的水平对齐方式
         */
        set textAlign(value) {
            this.$setTextAlign(value);
        }
        get textAlign() {
            return this.$getTextAlign();
        }
        $setTextAlign(value) {
            let values = this.$propertyMap;
            if (values[9 /* textAlign */] == value) {
                return false;
            }
            values[9 /* textAlign */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getTextAlign() {
            return this.$propertyMap[9 /* textAlign */];
        }
        /**
         * 文字的垂直对齐方式
         */
        set verticalAlign(value) {
            this.$setVerticalAlign(value);
        }
        get verticalAlign() {
            return this.$getVerticalAlign();
        }
        $setVerticalAlign(value) {
            let values = this.$propertyMap;
            if (values[10 /* verticalAlign */] == value) {
                return false;
            }
            values[10 /* verticalAlign */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getVerticalAlign() {
            return this.$propertyMap[10 /* verticalAlign */];
        }
        /**
         * 行与行之间的垂直间距量
         */
        set lineSpacing(value) {
            this.$setLineSpacing(value);
        }
        get lineSpacing() {
            return this.$getLineSpacing();
        }
        $setLineSpacing(value) {
            let values = this.$propertyMap;
            if (values[1 /* lineSpacing */] == value) {
                return false;
            }
            values[1 /* lineSpacing */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getLineSpacing() {
            return this.$propertyMap[1 /* lineSpacing */];
        }
        /**
         * 文本颜色
         */
        set textColor(value) {
            this.$setTextColor(value);
        }
        get textColor() {
            return this.$getTextColor();
        }
        $setTextColor(value) {
            let values = this.$propertyMap;
            if (values[2 /* textColor */] == value) {
                return false;
            }
            values[2 /* textColor */] = value;
            if (this._inputController) {
                this._inputController.setColor(this.$propertyMap[2 /* textColor */]);
            }
            this.$invalidateTextField();
            return true;
        }
        $getTextColor() {
            return this.$propertyMap[2 /* textColor */];
        }
        /**
         * 文本字段是按单词换行还是按字符换行
         */
        set wordWrap(value) {
            this.$setWordWrap(value);
        }
        get wordWrap() {
            return this.$getWordWrap();
        }
        $setWordWrap(value) {
            let values = this.$propertyMap;
            if (value == values[19 /* wordWrap */]) {
                return;
            }
            if (values[20 /* displayAsPassword */]) {
                return;
            }
            values[19 /* wordWrap */] = value;
            this.$invalidateTextField();
        }
        $getWordWrap() {
            return this.$propertyMap[19 /* wordWrap */];
        }
        /**
         * 文本类型
         */
        set type(value) {
            this.$setType(value);
        }
        get type() {
            return this.$getType();
        }
        $setType(value) {
            let values = this.$propertyMap;
            if (values[24 /* type */] != value) {
                values[24 /* type */] = value;
                if (value == 1 /* input */) {
                    // input 如果没有设置过宽高则设置默认值为 100, 30
                    if (isNaN(values[3 /* textFieldWidth */])) {
                        this.$setWidth(100);
                    }
                    if (isNaN(values[4 /* textFieldHeight */])) {
                        this.$setHeight(30);
                    }
                    this.$setTouchEnabled(true);
                    // 创建输入文本
                    if (this._inputController == null) {
                        this._inputController = new dou2d.input.InputController();
                    }
                    this._inputController.init(this);
                    this.$invalidateTextField();
                    if (this._stage) {
                        this._inputController.addStageText();
                    }
                }
                else {
                    if (this._inputController) {
                        this._inputController.removeStageText();
                        this._inputController = null;
                    }
                    this.$setTouchEnabled(false);
                }
                return true;
            }
            return false;
        }
        $getType() {
            return this.$propertyMap[24 /* type */];
        }
        /**
         * 弹出键盘的类型
         */
        set inputType(value) {
            this.$setInputType(value);
        }
        get inputType() {
            return this.$getInputType();
        }
        $setInputType(value) {
            if (this.$propertyMap[37 /* inputType */] == value) {
                return false;
            }
            this.$propertyMap[37 /* inputType */] = value;
            return true;
        }
        $getInputType() {
            return this.$propertyMap[37 /* inputType */];
        }
        /**
         * 当前文本
         */
        set text(value) {
            this.$setText(value);
        }
        get text() {
            return this.$getText();
        }
        $setText(value) {
            let result = this.$setBaseText(value);
            if (this._inputController) {
                this._inputController.setText(this.$propertyMap[13 /* text */]);
            }
            return result;
        }
        $setBaseText(value) {
            this._isFlow = false;
            let values = this.$propertyMap;
            if (values[13 /* text */] != value) {
                this.$invalidateTextField();
                values[13 /* text */] = value;
                let text = "";
                if (values[20 /* displayAsPassword */]) {
                    text = this.changeToPassText(value);
                }
                else {
                    text = value;
                }
                this.setMiddleStyle([{ text: text }]);
                return true;
            }
            return false;
        }
        $getText() {
            if (this.$propertyMap[24 /* type */] == 1 /* input */) {
                return this._inputController.getText();
            }
            return this.$propertyMap[13 /* text */];
        }
        /**
         * 否是密码文本
         */
        set displayAsPassword(value) {
            this.$setDisplayAsPassword(value);
        }
        get displayAsPassword() {
            return this.$getDisplayAsPassword();
        }
        $setDisplayAsPassword(value) {
            let values = this.$propertyMap;
            if (values[20 /* displayAsPassword */] != value) {
                values[20 /* displayAsPassword */] = value;
                this.$invalidateTextField();
                let text = "";
                if (value) {
                    text = this.changeToPassText(values[13 /* text */]);
                }
                else {
                    text = values[13 /* text */];
                }
                this.setMiddleStyle([{ text: text }]);
                return true;
            }
            return false;
        }
        $getDisplayAsPassword() {
            return this.$propertyMap[20 /* displayAsPassword */];
        }
        /**
         * 描边颜色
         */
        set strokeColor(value) {
            this.$setStrokeColor(value);
        }
        get strokeColor() {
            return this.$getStrokeColor();
        }
        $setStrokeColor(value) {
            let values = this.$propertyMap;
            if (values[25 /* strokeColor */] != value) {
                this.$invalidateTextField();
                values[25 /* strokeColor */] = value;
                values[26 /* strokeColorString */] = dou2d.HtmlUtil.toColorString(value);
                return true;
            }
            return false;
        }
        $getStrokeColor() {
            return this.$propertyMap[25 /* strokeColor */];
        }
        /**
         * 描边宽度, 0 为没有描边
         */
        set stroke(value) {
            this.$setStroke(value);
        }
        get stroke() {
            return this.$getStroke();
        }
        $setStroke(value) {
            if (this.$propertyMap[27 /* stroke */] != value) {
                this.$invalidateTextField();
                this.$propertyMap[27 /* stroke */] = value;
                return true;
            }
            return false;
        }
        $getStroke() {
            return this.$propertyMap[27 /* stroke */];
        }
        /**
         * 文本字段中最多可输入的字符数
         */
        set maxChars(value) {
            this.$setMaxChars(value);
        }
        get maxChars() {
            return this.$getMaxChars();
        }
        $setMaxChars(value) {
            if (this.$propertyMap[21 /* maxChars */] != value) {
                this.$propertyMap[21 /* maxChars */] = value;
                return true;
            }
            return false;
        }
        $getMaxChars() {
            return this.$propertyMap[21 /* maxChars */];
        }
        /**
         * 文本在文本字段中的垂直位置, 单位行
         */
        set scrollV(value) {
            this.$setScrollV(value);
        }
        get scrollV() {
            return this.$getScrollV();
        }
        $setScrollV(value) {
            value = Math.max(value, 1);
            if (value == this.$propertyMap[28 /* scrollV */]) {
                return false;
            }
            this.$propertyMap[28 /* scrollV */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getScrollV() {
            return Math.min(Math.max(this.$propertyMap[28 /* scrollV */], 1), this.maxScrollV);
        }
        /**
         * scrollV 的最大值
         */
        get maxScrollV() {
            return this.$getMaxScrollV();
        }
        $getMaxScrollV() {
            this.$getLinesArr();
            return Math.max(this.$propertyMap[29 /* numLines */] - dou2d.TextFieldUtil.getScrollNum(this) + 1, 1);
        }
        /**
         * 文本行数
         */
        get numLines() {
            this.$getLinesArr();
            return this.$propertyMap[29 /* numLines */];
        }
        /**
         * 是否为多行文本
         */
        set multiline(value) {
            this.$setMultiline(value);
        }
        get multiline() {
            return this.$getMultiline();
        }
        $setMultiline(value) {
            if (this.$propertyMap[30 /* multiline */] == value) {
                return false;
            }
            this.$propertyMap[30 /* multiline */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getMultiline() {
            return this.$propertyMap[30 /* multiline */];
        }
        /**
         * 表示用户可输入到文本字段中的字符集
         * 如果值为 null, 则可以输入任何字符
         * 如果值为空字符串, 则不能输入任何字符
         * 如果值为一串字符, 则只能在文本字段中输入该字符串中的字符, 可以使用连字符 (-) 指定一个范围
         * 如果字符串以尖号 (^) 开头, 表示后面的字符都不能输入
         */
        set restrict(value) {
            this.$setRestrict(value);
        }
        get restrict() {
            return this.$getRestrict();
        }
        $setRestrict(value) {
            let values = this.$propertyMap;
            if (value == null) {
                values[35 /* restrictAnd */] = null;
                values[36 /* restrictNot */] = null;
                return false;
            }
            let index = -1;
            while (index < value.length) {
                index = value.indexOf("^", index);
                if (index == 0) {
                    break;
                }
                else if (index > 0) {
                    if (value.charAt(index - 1) != "\\") {
                        break;
                    }
                    index++;
                }
                else {
                    break;
                }
            }
            if (index == 0) {
                values[35 /* restrictAnd */] = null;
                values[36 /* restrictNot */] = value.substring(index + 1);
            }
            else if (index > 0) {
                values[35 /* restrictAnd */] = value.substring(0, index);
                values[36 /* restrictNot */] = value.substring(index + 1);
            }
            else {
                values[35 /* restrictAnd */] = value;
                values[36 /* restrictNot */] = null;
            }
            return true;
        }
        $getRestrict() {
            let values = this.$propertyMap;
            let str;
            if (values[35 /* restrictAnd */] != null) {
                str = values[35 /* restrictAnd */];
            }
            if (values[36 /* restrictNot */] != null) {
                if (str == null) {
                    str = "";
                }
                str += "^" + values[36 /* restrictNot */];
            }
            return str;
        }
        /**
         * 是否有边框
         */
        set border(value) {
            this.$setBorder(value);
        }
        get border() {
            return this.$getBorder();
        }
        $setBorder(value) {
            if (this.$propertyMap[31 /* border */] == value) {
                return false;
            }
            this.$propertyMap[31 /* border */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getBorder() {
            return this.$propertyMap[31 /* border */];
        }
        /**
         * 边框的颜色
         */
        set borderColor(value) {
            this.$setBorderColor(value);
        }
        get borderColor() {
            return this.$getBorderColor();
        }
        $setBorderColor(value) {
            if (this.$propertyMap[32 /* borderColor */] == value) {
                return false;
            }
            this.$propertyMap[32 /* borderColor */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getBorderColor() {
            return this.$propertyMap[32 /* borderColor */];
        }
        /**
         * 是否有背景
         */
        set background(value) {
            this.$setBackground(value);
        }
        get background() {
            return this.$getBackground();
        }
        $setBackground(value) {
            if (this.$propertyMap[33 /* background */] == value) {
                return false;
            }
            this.$propertyMap[33 /* background */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getBackground() {
            return this.$propertyMap[33 /* background */];
        }
        /**
         * 背景的颜色
         */
        set backgroundColor(value) {
            this.$setBackgroundColor(value);
        }
        get backgroundColor() {
            return this.$getBackgroundColor();
        }
        $setBackgroundColor(value) {
            if (this.$propertyMap[34 /* backgroundColor */] == value) {
                return false;
            }
            this.$propertyMap[34 /* backgroundColor */] = value;
            this.$invalidateTextField();
            return true;
        }
        $getBackgroundColor() {
            return this.$propertyMap[34 /* backgroundColor */];
        }
        /**
         * 设置富文本
         */
        set textFlow(textArr) {
            this.$setTextFlow(textArr);
        }
        get textFlow() {
            return this.$getTextFlow();
        }
        $setTextFlow(textArr) {
            this._isFlow = true;
            let text = "";
            if (textArr == null) {
                textArr = [];
            }
            for (let i = 0; i < textArr.length; i++) {
                let element = textArr[i];
                text += element.text;
            }
            if (this.$propertyMap[20 /* displayAsPassword */]) {
                this.$setBaseText(text);
            }
            else {
                this.$propertyMap[13 /* text */] = text;
                this.setMiddleStyle(textArr);
            }
            return true;
        }
        $getTextFlow() {
            return this._textArr;
        }
        /**
         * 获取文本测量宽度
         */
        get textWidth() {
            this.$getLinesArr();
            return this.$propertyMap[5 /* textWidth */];
        }
        /**
         * 获取文本测量高度
         */
        get textHeight() {
            this.$getLinesArr();
            return dou2d.TextFieldUtil.getTextHeight(this);
        }
        /**
         * 触发 link 事件后是否阻止父级容器后续的 tap 事件冒泡
         */
        set linkPreventTap(value) {
            this.$setLinkPreventTap(value);
        }
        get linkPreventTap() {
            return this.$getLinkPreventTap();
        }
        $setLinkPreventTap(value) {
            this._linkPreventTap = value;
        }
        $getLinkPreventTap() {
            return this._linkPreventTap;
        }
        $setWidth(value) {
            let values = this.$propertyMap;
            if (isNaN(value)) {
                if (isNaN(values[3 /* textFieldWidth */])) {
                    return false;
                }
                values[3 /* textFieldWidth */] = NaN;
            }
            else {
                if (values[3 /* textFieldWidth */] == value) {
                    return false;
                }
                values[3 /* textFieldWidth */] = value;
            }
            value = +value;
            if (value < 0) {
                return false;
            }
            this.$invalidateTextField();
            return true;
        }
        $getWidth() {
            let values = this.$propertyMap;
            return isNaN(values[3 /* textFieldWidth */]) ? this.$getContentBounds().width : values[3 /* textFieldWidth */];
        }
        $setHeight(value) {
            let values = this.$propertyMap;
            if (isNaN(value)) {
                if (isNaN(values[4 /* textFieldHeight */])) {
                    return false;
                }
                values[4 /* textFieldHeight */] = NaN;
            }
            else {
                if (values[4 /* textFieldHeight */] == value) {
                    return false;
                }
                values[4 /* textFieldHeight */] = value;
            }
            value = +value;
            if (value < 0) {
                return false;
            }
            this.$invalidateTextField();
            return true;
        }
        $getHeight() {
            let values = this.$propertyMap;
            return isNaN(values[4 /* textFieldHeight */]) ? this.$getContentBounds().height : values[4 /* textFieldHeight */];
        }
        $getLineHeight() {
            return this.$propertyMap[1 /* lineSpacing */] + this.$propertyMap[0 /* fontSize */];
        }
        invalidateFontString() {
            this.$propertyMap[17 /* fontStringChanged */] = true;
            this.$invalidateTextField();
        }
        $invalidateTextField() {
            this.$renderDirty = true;
            this.$propertyMap[18 /* textLinesChanged */] = true;
            let p = this._parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getRenderBounds() {
            let bounds = this.$getContentBounds();
            let tmpBounds = dou.recyclable(dou2d.Rectangle);
            tmpBounds.copy(bounds);
            if (this.$propertyMap[31 /* border */]) {
                tmpBounds.width += 2;
                tmpBounds.height += 2;
            }
            let _strokeDouble = this.$propertyMap[27 /* stroke */] * 2;
            if (_strokeDouble > 0) {
                tmpBounds.width += _strokeDouble * 2;
                tmpBounds.height += _strokeDouble * 2;
            }
            // 宽度增加一点, 为了解决 webgl 纹理太小导致裁切问题
            tmpBounds.x -= _strokeDouble + 2;
            tmpBounds.y -= _strokeDouble + 2;
            tmpBounds.width = Math.ceil(tmpBounds.width) + 4;
            tmpBounds.height = Math.ceil(tmpBounds.height) + 4;
            return tmpBounds;
        }
        changeToPassText(text) {
            if (this.$propertyMap[20 /* displayAsPassword */]) {
                let passText = "";
                for (let i = 0, num = text.length; i < num; i++) {
                    switch (text.charAt(i)) {
                        case "\n":
                            passText += "\n";
                            break;
                        case "\r":
                            break;
                        default:
                            passText += "*";
                    }
                }
                return passText;
            }
            return text;
        }
        setMiddleStyle(textArr) {
            this.$propertyMap[18 /* textLinesChanged */] = true;
            this._textArr = textArr;
            this.$invalidateTextField();
        }
        /**
         * 输入文本自动进入到输入状态，仅在类型是输入文本并且是在用户交互下才可以调用
         */
        setFocus() {
            if (this.type == 1 /* input */ && this._stage) {
                this._inputController.onFocus();
            }
        }
        /**
         * 添加一段文本
         */
        appendText(text) {
            this.appendElement({ text: text });
        }
        /**
         * 添加一段带样式的文本
         */
        appendElement(element) {
            let text = this.$propertyMap[13 /* text */] + element.text;
            if (this.$propertyMap[20 /* displayAsPassword */]) {
                this.$setBaseText(text);
            }
            else {
                this.$propertyMap[13 /* text */] = text;
                this._textArr.push(element);
                this.setMiddleStyle(this._textArr);
            }
        }
        $getLinesArr() {
            let values = this.$propertyMap;
            if (!values[18 /* textLinesChanged */]) {
                return this._linesArr;
            }
            values[18 /* textLinesChanged */] = false;
            let text2Arr = this._textArr;
            this._linesArr.length = 0;
            values[6 /* textHeight */] = 0;
            values[5 /* textWidth */] = 0;
            let textFieldWidth = values[3 /* textFieldWidth */];
            // 宽度被设置为 0
            if (!isNaN(textFieldWidth) && textFieldWidth == 0) {
                values[29 /* numLines */] = 0;
                return [{ width: 0, height: 0, charNum: 0, elements: [], hasNextLine: false }];
            }
            let linesArr = this._linesArr;
            let lineW = 0;
            let lineCharNum = 0;
            let lineH = 0;
            let lineCount = 0;
            let lineElement;
            for (let i = 0, text2ArrLength = text2Arr.length; i < text2ArrLength; i++) {
                let element = text2Arr[i];
                // 可能设置为没有文本, 忽略绘制
                if (!element.text) {
                    if (lineElement) {
                        lineElement.width = lineW;
                        lineElement.height = lineH;
                        lineElement.charNum = lineCharNum;
                        values[5 /* textWidth */] = Math.max(values[5 /* textWidth */], lineW);
                        values[6 /* textHeight */] += lineH;
                    }
                    continue;
                }
                element.style = element.style || {};
                let text = element.text.toString();
                let textArr = text.split(/(?:\r\n|\r|\n)/);
                for (let j = 0, textArrLength = textArr.length; j < textArrLength; j++) {
                    if (linesArr[lineCount] == null) {
                        lineElement = { width: 0, height: 0, elements: [], charNum: 0, hasNextLine: false };
                        linesArr[lineCount] = lineElement;
                        lineW = 0;
                        lineH = 0;
                        lineCharNum = 0;
                    }
                    if (values[24 /* type */] == 1 /* input */) {
                        lineH = values[0 /* fontSize */];
                    }
                    else {
                        lineH = Math.max(lineH, element.style.size || values[0 /* fontSize */]);
                    }
                    let isNextLine = true;
                    if (textArr[j] == "") {
                        if (j == textArrLength - 1) {
                            isNextLine = false;
                        }
                    }
                    else {
                        let w = dou2d.HtmlUtil.measureTextByStyle(textArr[j], values, element.style);
                        // 没有设置过宽
                        if (isNaN(textFieldWidth)) {
                            lineW += w;
                            lineCharNum += textArr[j].length;
                            lineElement.elements.push({
                                width: w,
                                text: textArr[j],
                                style: element.style
                            });
                            if (j == textArrLength - 1) {
                                isNextLine = false;
                            }
                        }
                        else {
                            // 在设置范围内
                            if (lineW + w <= textFieldWidth) {
                                lineElement.elements.push({
                                    width: w,
                                    text: textArr[j],
                                    style: element.style
                                });
                                lineW += w;
                                lineCharNum += textArr[j].length;
                                if (j == textArrLength - 1) {
                                    isNextLine = false;
                                }
                            }
                            else {
                                let k = 0;
                                let ww = 0;
                                let word = textArr[j];
                                let words;
                                if (values[19 /* wordWrap */]) {
                                    words = word.split(SplitRegex);
                                }
                                else {
                                    words = word.match(/./g);
                                }
                                let wl = words.length;
                                let charNum = 0;
                                for (; k < wl; k++) {
                                    let codeLen = words[k].length;
                                    let has4BytesUnicode = false;
                                    if (codeLen == 1 && k < wl - 1) {
                                        let charCodeHigh = words[k].charCodeAt(0);
                                        let charCodeLow = words[k + 1].charCodeAt(0);
                                        if (charCodeHigh >= 0xD800 && charCodeHigh <= 0xDBFF && (charCodeLow & 0xFC00) == 0xDC00) {
                                            let realWord = words[k] + words[k + 1];
                                            codeLen = 2;
                                            has4BytesUnicode = true;
                                            w = dou2d.HtmlUtil.measureTextByStyle(realWord, values, element.style);
                                        }
                                        else {
                                            w = dou2d.HtmlUtil.measureTextByStyle(words[k], values, element.style);
                                        }
                                    }
                                    else {
                                        w = dou2d.HtmlUtil.measureTextByStyle(words[k], values, element.style);
                                    }
                                    if (lineW != 0 && lineW + w > textFieldWidth && lineW + k != 0) {
                                        break;
                                    }
                                    if (ww + w > textFieldWidth) {
                                        let words2 = words[k].match(/./g);
                                        for (let k2 = 0, wl2 = words2.length; k2 < wl2; k2++) {
                                            let codeLen = words2[k2].length;
                                            let has4BytesUnicode2 = false;
                                            if (codeLen == 1 && k2 < wl2 - 1) {
                                                let charCodeHigh = words2[k2].charCodeAt(0);
                                                let charCodeLow = words2[k2 + 1].charCodeAt(0);
                                                if (charCodeHigh >= 0xD800 && charCodeHigh <= 0xDBFF && (charCodeLow & 0xFC00) == 0xDC00) {
                                                    let realWord = words2[k2] + words2[k2 + 1];
                                                    codeLen = 2;
                                                    has4BytesUnicode2 = true;
                                                    w = dou2d.HtmlUtil.measureTextByStyle(realWord, values, element.style);
                                                }
                                                else {
                                                    w = dou2d.HtmlUtil.measureTextByStyle(words2[k2], values, element.style);
                                                }
                                            }
                                            else {
                                                w = dou2d.HtmlUtil.measureTextByStyle(words2[k2], values, element.style);
                                            }
                                            if (k2 > 0 && lineW + w > textFieldWidth) {
                                                break;
                                            }
                                            charNum += codeLen;
                                            ww += w;
                                            lineW += w;
                                            lineCharNum += charNum;
                                            if (has4BytesUnicode2) {
                                                k2++;
                                            }
                                        }
                                    }
                                    else {
                                        charNum += codeLen;
                                        ww += w;
                                        lineW += w;
                                        lineCharNum += charNum;
                                    }
                                    if (has4BytesUnicode) {
                                        k++;
                                    }
                                }
                                if (k > 0) {
                                    lineElement.elements.push({
                                        width: ww,
                                        text: word.substring(0, charNum),
                                        style: element.style
                                    });
                                    let leftWord = word.substring(charNum);
                                    let m;
                                    let lwleng = leftWord.length;
                                    for (m = 0; m < lwleng; m++) {
                                        if (leftWord.charAt(m) != " ") {
                                            break;
                                        }
                                    }
                                    textArr[j] = leftWord.substring(m);
                                }
                                if (textArr[j] != "") {
                                    j--;
                                    isNextLine = false;
                                }
                            }
                        }
                    }
                    if (isNextLine) {
                        lineCharNum++;
                        lineElement.hasNextLine = true;
                    }
                    // 非最后一个
                    if (j < textArr.length - 1) {
                        lineElement.width = lineW;
                        lineElement.height = lineH;
                        lineElement.charNum = lineCharNum;
                        values[5 /* textWidth */] = Math.max(values[5 /* textWidth */], lineW);
                        values[6 /* textHeight */] += lineH;
                        lineCount++;
                    }
                }
                if (i == text2Arr.length - 1 && lineElement) {
                    lineElement.width = lineW;
                    lineElement.height = lineH;
                    lineElement.charNum = lineCharNum;
                    values[5 /* textWidth */] = Math.max(values[5 /* textWidth */], lineW);
                    values[6 /* textHeight */] += lineH;
                }
            }
            values[29 /* numLines */] = linesArr.length;
            return linesArr;
        }
        $setIsTyping(value) {
            this._isTyping = value;
            this.$invalidateTextField();
        }
        $setTouchEnabled(value) {
            super.$setTouchEnabled(value);
            if (this.isInput()) {
                this.$inputEnabled = true;
            }
        }
        isInput() {
            return this.$propertyMap[24 /* type */] == 1 /* input */;
        }
        $onAddToStage(stage, nestLevel) {
            super.$onAddToStage(stage, nestLevel);
            this.addEvent();
            if (this.$propertyMap[24 /* type */] == 1 /* input */) {
                this._inputController.addStageText();
            }
        }
        $onRemoveFromStage() {
            super.$onRemoveFromStage();
            this.removeEvent();
            if (this.$propertyMap[24 /* type */] == 1 /* input */) {
                this._inputController.removeStageText();
            }
            if (this._textNode) {
                this._textNode.clean();
            }
        }
        addEvent() {
            this.on(dou2d.TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        }
        removeEvent() {
            this.off(dou2d.TouchEvent.TOUCH_TAP, this.onTapHandler, this);
        }
        onTapHandler(e) {
            if (this.$propertyMap[24 /* type */] == 1 /* input */) {
                return;
            }
            let ele = dou2d.TextFieldUtil.getTextElement(this, e.localX, e.localY);
            if (!ele) {
                return;
            }
            let style = ele.style;
            if (style && style.href) {
                if (style.href.match(/^event:/)) {
                    let type = style.href.match(/^event:/)[0];
                    let data = {
                        text: style.href.substring(type.length),
                        stageX: e.stageX,
                        stageY: e.stageY,
                        localX: e.localX,
                        localY: e.localY
                    };
                    this.dispatchEvent2D(dou2d.Event2D.LINK, data);
                }
                else {
                    open(style.href, style.target || "_blank");
                }
                if (this._linkPreventTap) {
                    e.stopPropagation();
                }
            }
        }
        $measureContentBounds(bounds) {
            this.$getLinesArr();
            let w = 0;
            let h = 0;
            w = !isNaN(this.$propertyMap[3 /* textFieldWidth */]) ? this.$propertyMap[3 /* textFieldWidth */] : this.$propertyMap[5 /* textWidth */];
            h = !isNaN(this.$propertyMap[4 /* textFieldHeight */]) ? this.$propertyMap[4 /* textFieldHeight */] : dou2d.TextFieldUtil.getTextHeight(this);
            bounds.set(0, 0, w, h);
        }
        $updateRenderNode() {
            if (this.$propertyMap[24 /* type */] == 1 /* input */) {
                this._inputController.updateProperties();
                if (this._isTyping) {
                    this.fillBackground();
                    return;
                }
            }
            else if (this.$propertyMap[3 /* textFieldWidth */] == 0) {
                let graphics = this._graphicsNode;
                if (graphics) {
                    graphics.clear();
                }
                return;
            }
            let underLines = this.drawText();
            this.fillBackground(underLines);
            let bounds = this.$getRenderBounds();
            let node = this._textNode;
            node.x = bounds.x;
            node.y = bounds.y;
            node.width = Math.ceil(bounds.width);
            node.height = Math.ceil(bounds.height);
            bounds.recycle();
        }
        fillBackground(lines) {
            let graphics = this._graphicsNode;
            if (graphics) {
                graphics.clear();
            }
            let values = this.$propertyMap;
            if (values[33 /* background */] || values[31 /* border */] || (lines && lines.length > 0)) {
                if (!graphics) {
                    graphics = this._graphicsNode = new dou2d.rendering.GraphicsNode();
                    let groupNode = new dou2d.rendering.GroupNode();
                    groupNode.addNode(graphics);
                    groupNode.addNode(this._textNode);
                    this.$renderNode = groupNode;
                }
                let fillPath;
                let strokePath;
                // 渲染背景
                if (values[33 /* background */]) {
                    fillPath = graphics.beginFill(values[34 /* backgroundColor */]);
                    fillPath.drawRect(0, 0, this.$getWidth(), this.$getHeight());
                }
                // 渲染边框
                if (values[31 /* border */]) {
                    strokePath = graphics.lineStyle(1, values[32 /* borderColor */]);
                    // 1 像素和 3 像素线条宽度的情况, 会向右下角偏移 0.5 像素绘制, 少画一像素宽度, 正好能不超出文本测量边界
                    strokePath.drawRect(0, 0, this.$getWidth() - 1, this.$getHeight() - 1);
                }
                // 渲染下划线
                if (lines && lines.length > 0) {
                    let textColor = values[2 /* textColor */];
                    let lastColor = -1;
                    let length = lines.length;
                    for (let i = 0; i < length; i += 4) {
                        let x = lines[i];
                        let y = lines[i + 1];
                        let w = lines[i + 2];
                        let color = lines[i + 3] || textColor;
                        if (lastColor < 0 || lastColor != color) {
                            lastColor = color;
                            strokePath = graphics.lineStyle(2, color, 1, "none" /* none */);
                        }
                        strokePath.moveTo(x, y);
                        strokePath.lineTo(x + w, y);
                    }
                }
            }
            if (graphics) {
                let bounds = this.$getRenderBounds();
                graphics.x = bounds.x;
                graphics.y = bounds.y;
                graphics.width = bounds.width;
                graphics.height = bounds.height;
                bounds.recycle();
            }
        }
        /**
         * 返回要绘制的下划线列表
         */
        drawText() {
            let node = this._textNode;
            let values = this.$propertyMap;
            // 更新文本样式
            node.bold = values[15 /* bold */];
            node.fontFamily = values[8 /* fontFamily */] || TextField.default_fontFamily;
            node.italic = values[16 /* italic */];
            node.size = values[0 /* fontSize */];
            node.stroke = values[27 /* stroke */];
            node.strokeColor = values[25 /* strokeColor */];
            node.textColor = values[2 /* textColor */];
            // 先算出需要的数值
            let lines = this.$getLinesArr();
            if (values[5 /* textWidth */] == 0) {
                return [];
            }
            let maxWidth = !isNaN(values[3 /* textFieldWidth */]) ? values[3 /* textFieldWidth */] : values[5 /* textWidth */];
            let textHeight = dou2d.TextFieldUtil.getTextHeight(this);
            let drawY = 0;
            let startLine = dou2d.TextFieldUtil.getStartLine(this);
            let textFieldHeight = values[4 /* textFieldHeight */];
            if (!isNaN(textFieldHeight) && textFieldHeight > textHeight) {
                let vAlign = dou2d.TextFieldUtil.getValign(this);
                drawY += vAlign * (textFieldHeight - textHeight);
            }
            drawY = Math.round(drawY);
            let hAlign = dou2d.TextFieldUtil.getHalign(this);
            let drawX = 0;
            let underLineData = [];
            for (let i = startLine, numLinesLength = values[29 /* numLines */]; i < numLinesLength; i++) {
                let line = lines[i];
                let h = line.height;
                drawY += h / 2;
                if (i != startLine) {
                    if (values[24 /* type */] == 1 /* input */ && !values[30 /* multiline */]) {
                        break;
                    }
                    if (!isNaN(textFieldHeight) && drawY > textFieldHeight) {
                        break;
                    }
                }
                drawX = Math.round((maxWidth - line.width) * hAlign);
                for (let j = 0, elementsLength = line.elements.length; j < elementsLength; j++) {
                    let element = line.elements[j];
                    let size = element.style.size || values[0 /* fontSize */];
                    let verticalAlign = values[10 /* verticalAlign */];
                    if (verticalAlign == 0 /* top */) {
                        node.drawText(drawX, drawY - (h - size) / 2, element.text, element.style);
                    }
                    else if (verticalAlign == 1 /* middle */) {
                        node.drawText(drawX, drawY, element.text, element.style);
                    }
                    else {
                        node.drawText(drawX, drawY + (h - size) / 2, element.text, element.style);
                    }
                    if (element.style.underline) {
                        underLineData.push(drawX, drawY + (h) / 2, element.width, element.style.textColor);
                    }
                    drawX += element.width;
                }
                drawY += h / 2 + values[1 /* lineSpacing */];
            }
            return underLineData;
        }
    }
    /**
     * 默认文本字体
     */
    TextField.default_fontFamily = "Arial";
    /**
     * 默认文本字号大小
     */
    TextField.default_size = 30;
    /**
     * 默认文本颜色
     */
    TextField.default_textColor = 0xffffff;
    dou2d.TextField = TextField;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 位图字体
     * @author wizardc
     */
    class BitmapFont extends dou2d.SpriteSheet {
        constructor(texture, config) {
            super(texture);
            this._firstCharHeight = 0;
            if (typeof config == "string") {
                this._charList = JSON.parse(config);
            }
            else {
                this._charList = config;
            }
        }
        getTexture(name) {
            let texture = this._textureMap[name];
            if (!texture) {
                let c = this._charList[name];
                if (!c) {
                    return null;
                }
                texture = this.createTexture(name, c.x, c.y, c.w, c.h, c.offX, c.offY, c.sourceW, c.sourceH);
                this._textureMap[name] = texture;
            }
            return texture;
        }
        getConfig(name, key) {
            if (!this._charList[name]) {
                return 0;
            }
            return this._charList[name][key];
        }
        getFirstCharHeight() {
            if (this._firstCharHeight == 0) {
                for (let str in this._charList) {
                    let c = this._charList[str];
                    if (c) {
                        let sourceH = c.sourceH;
                        if (sourceH === undefined) {
                            let h = c.h;
                            if (h === undefined) {
                                h = 0;
                            }
                            let offY = c.offY;
                            if (offY === undefined) {
                                offY = 0;
                            }
                            sourceH = h + offY;
                        }
                        if (sourceH <= 0) {
                            continue;
                        }
                        this._firstCharHeight = sourceH;
                        break;
                    }
                }
            }
            return this._firstCharHeight;
        }
    }
    dou2d.BitmapFont = BitmapFont;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 位图文本
     * @author wizardc
     */
    class BitmapText extends dou2d.DisplayObject {
        constructor() {
            super();
            this._text = "";
            this._smoothing = dou2d.Bitmap.defaultSmoothing;
            this._lineSpacing = 0;
            this._letterSpacing = 0;
            this._textAlign = 0 /* left */;
            this._verticalAlign = 0 /* top */;
            this._textOffsetX = 0;
            this._textOffsetY = 0;
            this._textStartX = 0;
            this._textStartY = 0;
            this.$renderNode = new dou2d.rendering.BitmapNode();
            this._textLines = [];
            this._lineHeights = [];
        }
        /**
         * 要显示的文本内容
         */
        set text(value) {
            this.$setText(value);
        }
        get text() {
            return this.$getText();
        }
        $setText(value) {
            if (value == null) {
                value = "";
            }
            else {
                value = String(value);
            }
            if (value == this._text) {
                return false;
            }
            this._text = value;
            this.$invalidateContentBounds();
            return true;
        }
        $getText() {
            return this._text;
        }
        /**
         * 位图字体
         */
        set font(value) {
            this.$setFont(value);
        }
        get font() {
            return this.$getFont();
        }
        $setFont(value) {
            if (this._font == value) {
                return false;
            }
            this._font = value;
            this._fontStringChanged = true;
            this.$invalidateContentBounds();
            return true;
        }
        $getFont() {
            return this._font;
        }
        /**
         * 控制在缩放时是否进行平滑处理
         */
        set smoothing(value) {
            this.$setSmoothing(value);
        }
        get smoothing() {
            return this.$getSmoothing();
        }
        $setSmoothing(value) {
            if (value == this._smoothing) {
                return;
            }
            this._smoothing = value;
            let p = this.parent;
            if (p && !p.$cacheDirty) {
                p.$cacheDirty = true;
                p.$cacheDirtyUp();
            }
            let maskedObject = this.$maskedObject;
            if (maskedObject && !maskedObject.$cacheDirty) {
                maskedObject.$cacheDirty = true;
                maskedObject.$cacheDirtyUp();
            }
        }
        $getSmoothing() {
            return this._smoothing;
        }
        /**
         * 一个整数, 表示行与行之间的垂直间距量
         */
        set lineSpacing(value) {
            this.$setLineSpacing(value);
        }
        get lineSpacing() {
            return this.$getLineSpacing();
        }
        $setLineSpacing(value) {
            if (this._lineSpacing == value) {
                return false;
            }
            this._lineSpacing = value;
            this.$invalidateContentBounds();
            return true;
        }
        $getLineSpacing() {
            return this._lineSpacing;
        }
        /**
         * 一个整数, 表示字符之间的距离
         */
        set letterSpacing(value) {
            this.$setLetterSpacing(value);
        }
        get letterSpacing() {
            return this.$getLetterSpacing();
        }
        $setLetterSpacing(value) {
            if (this._letterSpacing == value) {
                return false;
            }
            this._letterSpacing = value;
            this.$invalidateContentBounds();
            return true;
        }
        $getLetterSpacing() {
            return this._letterSpacing;
        }
        /**
         * 文本的水平对齐方式
         */
        set textAlign(value) {
            this.$setTextAlign(value);
        }
        get textAlign() {
            return this.$getTextAlign();
        }
        $setTextAlign(value) {
            if (this._textAlign == value) {
                return false;
            }
            this._textAlign = value;
            this.$invalidateContentBounds();
            return true;
        }
        $getTextAlign() {
            return this._textAlign;
        }
        /**
         * 文字的垂直对齐方式
         */
        set verticalAlign(value) {
            this.$setVerticalAlign(value);
        }
        get verticalAlign() {
            return this.$getVerticalAlign();
        }
        $setVerticalAlign(value) {
            if (this._verticalAlign == value) {
                return false;
            }
            this._verticalAlign = value;
            this.$invalidateContentBounds();
            return true;
        }
        $getVerticalAlign() {
            return this._verticalAlign;
        }
        /**
         * 获取位图文本测量宽度
         */
        get textWidth() {
            this.$getTextLines();
            return this._textWidth;
        }
        /**
         * 获取位图文本测量高度
         */
        get textHeight() {
            this.$getTextLines();
            return this._textHeight;
        }
        $setWidth(value) {
            if (value < 0 || value == this._textFieldWidth) {
                return false;
            }
            this._textFieldWidth = value;
            this.$invalidateContentBounds();
            return true;
        }
        $getWidth() {
            let w = this._textFieldWidth;
            return isNaN(w) ? this.$getContentBounds().width : w;
        }
        $setHeight(value) {
            if (value < 0 || value == this._textFieldHeight) {
                return false;
            }
            this._textFieldHeight = value;
            this.$invalidateContentBounds();
            return true;
        }
        $getHeight() {
            let h = this._textFieldHeight;
            return isNaN(h) ? this.$getContentBounds().height : h;
        }
        $invalidateContentBounds() {
            this.$renderDirty = true;
            this._textLinesChanged = true;
            this.$updateRenderNode();
        }
        $measureContentBounds(bounds) {
            let lines = this.$getTextLines();
            if (lines.length == 0) {
                bounds.clear();
            }
            else {
                bounds.set(this._textOffsetX + this._textStartX, this._textOffsetY + this._textStartY, this._textWidth - this._textOffsetX, this._textHeight - this._textOffsetY);
            }
        }
        $updateRenderNode() {
            let textLines = this.$getTextLines();
            let length = textLines.length;
            if (length == 0) {
                return;
            }
            let textLinesWidth = this._textLinesWidth;
            let bitmapFont = this._font;
            let node = this.$renderNode;
            if (bitmapFont.texture) {
                node.image = bitmapFont.texture.bitmapData;
            }
            node.smoothing = this._smoothing;
            let emptyHeight = bitmapFont.getFirstCharHeight();
            let emptyWidth = Math.ceil(emptyHeight * BitmapText.EMPTY_FACTOR);
            let hasSetHeight = !isNaN(this._textFieldHeight);
            let textWidth = this._textWidth;
            let textFieldWidth = this._textFieldWidth;
            let textFieldHeight = this._textFieldHeight;
            let align = this._textAlign;
            let yPos = this._textOffsetY + this._textStartY;
            let lineHeights = this._lineHeights;
            for (let i = 0; i < length; i++) {
                let lineHeight = lineHeights[i];
                if (hasSetHeight && i > 0 && yPos + lineHeight > textFieldHeight) {
                    break;
                }
                let line = textLines[i];
                let len = line.length;
                let xPos = this._textOffsetX;
                if (align != 0 /* left */) {
                    let countWidth = textFieldWidth > textWidth ? textFieldWidth : textWidth;
                    if (align == 2 /* right */) {
                        xPos += countWidth - textLinesWidth[i];
                    }
                    else if (align == 1 /* center */) {
                        xPos += Math.floor((countWidth - textLinesWidth[i]) / 2);
                    }
                }
                for (let j = 0; j < len; j++) {
                    let character = line.charAt(j);
                    let texture = bitmapFont.getTexture(character);
                    if (!texture) {
                        if (character == " ") {
                            xPos += emptyWidth;
                        }
                        else {
                            if (DEBUG) {
                                console.warn(`未找到字符"${character}", 请检查配置`);
                            }
                        }
                        continue;
                    }
                    let bitmapWidth = texture.bitmapWidth;
                    let bitmapHeight = texture.bitmapHeight;
                    node.imageWidth = texture.sourceWidth;
                    node.imageHeight = texture.sourceHeight;
                    node.drawImage(texture.bitmapX, texture.bitmapY, bitmapWidth, bitmapHeight, xPos + texture.offsetX, yPos + texture.offsetY, texture.$getScaleBitmapWidth(), texture.$getScaleBitmapHeight());
                    xPos += (bitmapFont.getConfig(character, "xadvance") || texture.$getTextureWidth()) + this._letterSpacing;
                }
                yPos += lineHeight + this._lineSpacing;
            }
        }
        $getTextLines() {
            function setLineData(str) {
                if (textFieldHeight && textLines.length > 0 && textHeight > textFieldHeight) {
                    return false;
                }
                textHeight += lineHeight + lineSpacing;
                if (!isFirstChar && !isLastChar) {
                    xPos -= letterSpacing;
                }
                textLines.push(str);
                lineHeights.push(lineHeight);
                textLinesWidth.push(xPos);
                textWidth = Math.max(xPos, textWidth);
                return true;
            }
            if (!this._textLinesChanged) {
                return this._textLines;
            }
            let textLines = [];
            this._textLines = textLines;
            let textLinesWidth = [];
            this._textLinesWidth = textLinesWidth;
            this._textLinesChanged = false;
            let lineHeights = [];
            this._lineHeights = lineHeights;
            if (!this._text || !this._font) {
                this._textWidth = 0;
                this._textHeight = 0;
                return textLines;
            }
            let lineSpacing = this._lineSpacing;
            let letterSpacing = this._letterSpacing;
            let textWidth = 0;
            let textHeight = 0;
            let textOffsetX = 0;
            let textOffsetY = 0;
            let hasWidthSet = !isNaN(this._textFieldWidth);
            let textFieldWidth = this._textFieldWidth;
            let textFieldHeight = this._textFieldHeight;
            let bitmapFont = this._font;
            let emptyHeight = bitmapFont.getFirstCharHeight();
            let emptyWidth = Math.ceil(emptyHeight * BitmapText.EMPTY_FACTOR);
            let text = this._text;
            let textArr = text.split(/(?:\r\n|\r|\n)/);
            let length = textArr.length;
            let isFirstLine = true;
            let isFirstChar;
            let isLastChar;
            let lineHeight;
            let xPos;
            for (let i = 0; i < length; i++) {
                let line = textArr[i];
                let len = line.length;
                lineHeight = 0;
                xPos = 0;
                isFirstChar = true;
                isLastChar = false;
                for (let j = 0; j < len; j++) {
                    if (!isFirstChar) {
                        xPos += letterSpacing;
                    }
                    let character = line.charAt(j);
                    let texureWidth;
                    let textureHeight;
                    let texture = bitmapFont.getTexture(character);
                    if (!texture) {
                        if (character == " ") {
                            texureWidth = emptyWidth;
                            textureHeight = emptyHeight;
                        }
                        else {
                            if (DEBUG) {
                                console.warn(`未找到字符"${character}", 请检查配置`);
                            }
                            if (isFirstChar) {
                                isFirstChar = false;
                            }
                            continue;
                        }
                    }
                    else {
                        texureWidth = texture.$getTextureWidth();
                        textureHeight = texture.$getTextureHeight();
                    }
                    if (isFirstChar) {
                        isFirstChar = false;
                    }
                    if (isFirstLine) {
                        isFirstLine = false;
                    }
                    if (hasWidthSet && j > 0 && xPos + texureWidth > textFieldWidth) {
                        if (!setLineData(line.substring(0, j))) {
                            break;
                        }
                        line = line.substring(j);
                        len = line.length;
                        j = 0;
                        // 最后一个字符要计算纹理宽度, 而不是 xadvance
                        if (j == len - 1) {
                            xPos = texureWidth;
                        }
                        else {
                            xPos = bitmapFont.getConfig(character, "xadvance") || texureWidth;
                        }
                        lineHeight = textureHeight;
                        continue;
                    }
                    // 最后一个字符要计算纹理宽度, 而不是 xadvance
                    if (j == len - 1) {
                        xPos += texureWidth;
                    }
                    else {
                        xPos += bitmapFont.getConfig(character, "xadvance") || texureWidth;
                    }
                    lineHeight = Math.max(textureHeight, lineHeight);
                }
                if (textFieldHeight && i > 0 && textHeight > textFieldHeight) {
                    break;
                }
                isLastChar = true;
                if (!setLineData(line)) {
                    break;
                }
            }
            textHeight -= lineSpacing;
            this._textWidth = textWidth;
            this._textHeight = textHeight;
            this._textOffsetX = textOffsetX;
            this._textOffsetY = textOffsetY;
            this._textStartX = 0;
            this._textStartY = 0;
            let alignType;
            if (textFieldWidth > textWidth) {
                alignType = this._textAlign;
                if (alignType == 2 /* right */) {
                    this._textStartX = textFieldWidth - textWidth;
                }
                else if (alignType == 1 /* center */) {
                    this._textStartX = Math.floor((textFieldWidth - textWidth) / 2);
                }
            }
            if (textFieldHeight > textHeight) {
                alignType = this._verticalAlign;
                if (alignType == 2 /* bottom */) {
                    this._textStartY = textFieldHeight - textHeight;
                }
                else if (alignType == 1 /* middle */) {
                    this._textStartY = Math.floor((textFieldHeight - textHeight) / 2);
                }
            }
            return textLines;
        }
    }
    /**
     * 一个空格字符的宽度比例, 这个数值乘以第一个字符的高度即为空格字符的宽
     */
    BitmapText.EMPTY_FACTOR = 0.33;
    dou2d.BitmapText = BitmapText;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * HTML 格式文本解析器
     * @author wizardc
     */
    let HtmlTextParser;
    (function (HtmlTextParser) {
        const headReg = /^(color|textcolor|strokecolor|stroke|b|bold|i|italic|u|size|fontfamily|href|target)(\s)*=/;
        const replaceArr = [
            [/&lt;/g, "<"],
            [/&gt;/g, ">"],
            [/&amp;/g, "&"],
            [/&quot;/g, "\""],
            [/&apos;/g, "\'"]
        ];
        /**
         * 解析 HTML 格式文本
         */
        function parse(htmltext) {
            let result = [];
            let stack = [];
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
        HtmlTextParser.parse = parse;
        function addToResult(value, stack, result) {
            if (value == "") {
                return;
            }
            value = replaceSpecial(value);
            if (stack.length > 0) {
                result.push({ text: value, style: stack[stack.length - 1] });
            }
            else {
                result.push({ text: value });
            }
        }
        function addToStack(infoStr, stack) {
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
        function changeStringToObject(str) {
            str = str.trim();
            let info = {};
            let header = [];
            if (str.charAt(0) == "i" || str.charAt(0) == "b" || str.charAt(0) == "u") {
                addProperty(info, str, "true");
            }
            else if (header = str.match(/^(font|a)\s/)) {
                str = str.substring(header[0].length).trim();
                let next = 0;
                let titles;
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
        function addProperty(info, head, value) {
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
        function replaceSpecial(value) {
            for (let i = 0; i < replaceArr.length; i++) {
                let k = replaceArr[i][0];
                let v = replaceArr[i][1];
                value = value.replace(k, v);
            }
            return value;
        }
    })(HtmlTextParser = dou2d.HtmlTextParser || (dou2d.HtmlTextParser = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var touch;
    (function (touch) {
        /**
         * 触摸处理类
         * @author wizardc
         */
        class TouchHandler {
            constructor(stage, canvas) {
                this._scaleX = 1;
                this._scaleY = 1;
                this._rotation = 0;
                this.onTouchBegin = (event) => {
                    let location = this.getLocation(event);
                    this._touch.onTouchBegin(location.x, location.y, event.identifier);
                };
                this.onTouchMove = (event) => {
                    // 在外面松开按键
                    if (event.buttons == 0) {
                        this.onTouchEnd(event);
                    }
                    else {
                        this.touchMove(event);
                    }
                };
                this.touchMove = (event) => {
                    let location = this.getLocation(event);
                    this._touch.onTouchMove(location.x, location.y, event.identifier);
                };
                this.onTouchEnd = (event) => {
                    let location = this.getLocation(event);
                    this._touch.onTouchEnd(location.x, location.y, event.identifier);
                };
                this._canvas = canvas;
                this._touch = new touch.TouchHandlerImpl(stage);
                this._point = new dou2d.Point();
                this.addListeners();
            }
            addListeners() {
                if (!dou2d.Capabilities.isMobile) {
                    this.addMouseListener();
                }
                this.addTouchListener();
            }
            addMouseListener() {
                this._canvas.addEventListener("mousedown", this.onTouchBegin);
                this._canvas.addEventListener("mousemove", this.onTouchMove);
                this._canvas.addEventListener("mouseup", this.onTouchEnd);
            }
            addTouchListener() {
                this._canvas.addEventListener("touchstart", (event) => {
                    let l = event.changedTouches.length;
                    for (let i = 0; i < l; i++) {
                        this.onTouchBegin(event.changedTouches[i]);
                    }
                    this.prevent(event);
                }, false);
                this._canvas.addEventListener("touchmove", (event) => {
                    let l = event.changedTouches.length;
                    for (let i = 0; i < l; i++) {
                        this.touchMove(event.changedTouches[i]);
                    }
                    this.prevent(event);
                }, false);
                this._canvas.addEventListener("touchend", (event) => {
                    let l = event.changedTouches.length;
                    for (let i = 0; i < l; i++) {
                        this.onTouchEnd(event.changedTouches[i]);
                    }
                    this.prevent(event);
                }, false);
                this._canvas.addEventListener("touchcancel", (event) => {
                    let l = event.changedTouches.length;
                    for (let i = 0; i < l; i++) {
                        this.onTouchEnd(event.changedTouches[i]);
                    }
                    this.prevent(event);
                }, false);
            }
            prevent(event) {
                event.stopPropagation();
                if (event["isScroll"] != true && !this._canvas["userTyping"]) {
                    event.preventDefault();
                }
            }
            getLocation(event) {
                event.identifier = +event.identifier || 0;
                let doc = document.documentElement;
                let box = this._canvas.getBoundingClientRect();
                let left = box.left + window.pageXOffset - doc.clientLeft;
                let top = box.top + window.pageYOffset - doc.clientTop;
                let x = event.pageX - left, newx = x;
                let y = event.pageY - top, newy = y;
                if (this._rotation == 90) {
                    newx = y;
                    newy = box.width - x;
                }
                else if (this._rotation == -90) {
                    newx = box.height - y;
                    newy = x;
                }
                newx = newx / this._scaleX;
                newy = newy / this._scaleY;
                return this._point.set(Math.round(newx), Math.round(newy));
            }
            /**
             * 更新屏幕当前的缩放比例, 用于计算准确的点击位置
             */
            updateScaleMode(scaleX, scaleY, rotation) {
                this._scaleX = scaleX;
                this._scaleY = scaleY;
                this._rotation = rotation;
            }
            /**
             * 更新同时触摸点的数量
             */
            updateMaxTouches() {
                this._touch.initMaxTouches();
            }
        }
        touch.TouchHandler = TouchHandler;
    })(touch = dou2d.touch || (dou2d.touch = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var touch;
    (function (touch) {
        /**
         * 触摸处理实现类
         * @author wizardc
         */
        class TouchHandlerImpl {
            constructor(stage) {
                this._maxTouches = 0;
                this._useTouchesCount = 0;
                this._lastTouchX = -1;
                this._lastTouchY = -1;
                this._stage = stage;
                this._touchDownTarget = {};
            }
            initMaxTouches() {
                this._maxTouches = this._stage.maxTouches;
            }
            onTouchBegin(x, y, touchPointID) {
                if (this._useTouchesCount >= this._maxTouches) {
                    return;
                }
                this._lastTouchX = x;
                this._lastTouchY = y;
                let target = this.findTarget(x, y);
                if (this._touchDownTarget[touchPointID] == null) {
                    this._touchDownTarget[touchPointID] = target;
                    this._useTouchesCount++;
                }
                target.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_BEGIN, x, y, touchPointID, true, true, true);
            }
            onTouchMove(x, y, touchPointID) {
                if (this._touchDownTarget[touchPointID] == null) {
                    return;
                }
                if (this._lastTouchX == x && this._lastTouchY == y) {
                    return;
                }
                this._lastTouchX = x;
                this._lastTouchY = y;
                let target = this.findTarget(x, y);
                target.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_MOVE, x, y, touchPointID, true, true, true);
            }
            onTouchEnd(x, y, touchPointID) {
                if (this._touchDownTarget[touchPointID] == null) {
                    return;
                }
                let target = this.findTarget(x, y);
                let oldTarget = this._touchDownTarget[touchPointID];
                delete this._touchDownTarget[touchPointID];
                this._useTouchesCount--;
                target.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_END, x, y, touchPointID, false, true, true);
                if (oldTarget == target) {
                    target.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_TAP, x, y, touchPointID, false, true, true);
                }
                else {
                    oldTarget.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_RELEASE_OUTSIDE, x, y, touchPointID, false, true, true);
                }
            }
            findTarget(stageX, stageY) {
                let target = this._stage.$hitTest(stageX, stageY);
                if (!target) {
                    target = this._stage;
                }
                return target;
            }
        }
        touch.TouchHandlerImpl = TouchHandlerImpl;
    })(touch = dou2d.touch || (dou2d.touch = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 注册一个下次渲染之前执行的方法
     * * 同一个方法重复添加会多次调用
     */
    function callLater(method, thisObj, ...args) {
        sys.callLater(method, thisObj, ...args);
    }
    dou2d.callLater = callLater;
    /**
     * 注册一个下次渲染之前执行的方法
     * * 同一个方法重复添加只会调用一次
     */
    function callLaterUnique(method, thisObj, ...args) {
        sys.callLaterUnique(method, thisObj, ...args);
    }
    dou2d.callLaterUnique = callLaterUnique;
    let sys;
    (function (sys) {
        let functionList = [];
        let thisList = [];
        let argsList = [];
        let functionUniqueList = [];
        let thisUniqueList = [];
        let argsUniqueList = [];
        function updateCallLater() {
            if (functionList.length > 0) {
                let fList = functionList;
                let tList = thisList;
                let aList = argsList;
                functionList = [];
                thisList = [];
                argsList = [];
                for (let i = 0, len = fList.length; i < len; i++) {
                    fList[i].apply(tList[i], ...aList[i]);
                }
            }
            if (functionUniqueList.length > 0) {
                let fList = functionUniqueList;
                let tList = thisUniqueList;
                let aList = argsUniqueList;
                functionUniqueList = [];
                thisUniqueList = [];
                argsUniqueList = [];
                for (let i = 0, len = fList.length; i < len; i++) {
                    fList[i].apply(tList[i], ...aList[i]);
                }
            }
        }
        sys.updateCallLater = updateCallLater;
        function callLater(method, thisObj, ...args) {
            functionList.push(method);
            thisList.push(thisObj);
            argsList.push(args);
        }
        sys.callLater = callLater;
        function callLaterUnique(method, thisObj, ...args) {
            for (let i = 0, len = functionUniqueList.length; i < len; i++) {
                if (functionUniqueList[i] === method && thisUniqueList[i] === thisObj) {
                    return;
                }
            }
            functionUniqueList.push(method);
            thisUniqueList.push(thisObj);
            argsUniqueList.push(args);
        }
        sys.callLaterUnique = callLaterUnique;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 添加超时计时器
     */
    function setTimeout(method, thisObj, delay, ...args) {
        return sys.setTimeout(method, thisObj, delay, ...args);
    }
    dou2d.setTimeout = setTimeout;
    /**
     * 移除超时计时器
     */
    function clearTimeout(key) {
        sys.clearTimeout(key);
    }
    dou2d.clearTimeout = clearTimeout;
    let sys;
    (function (sys) {
        let index = 0;
        let map = {};
        let size = 0;
        function updateTimeout(passedTime) {
            if (size > 0) {
                for (let key in map) {
                    let data = map[key];
                    data.delay -= passedTime;
                    if (data.delay <= 0) {
                        clearTimeout(+key);
                        data.method.apply(data.thisObj, ...data.args);
                    }
                }
            }
        }
        sys.updateTimeout = updateTimeout;
        function setTimeout(method, thisObj, delay, ...args) {
            let data = { method, thisObj, delay, args };
            map[index++] = data;
            ++size;
            return index;
        }
        sys.setTimeout = setTimeout;
        function clearTimeout(key) {
            if (map[key]) {
                delete map[key];
                --size;
            }
        }
        sys.clearTimeout = clearTimeout;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 添加重复计时器
     */
    function setInterval(method, thisObj, delay, ...args) {
        return sys.setInterval(method, thisObj, delay, ...args);
    }
    dou2d.setInterval = setInterval;
    /**
     * 移除重复计时器
     */
    function clearInterval(key) {
        return sys.clearInterval(key);
    }
    dou2d.clearInterval = clearInterval;
    let sys;
    (function (sys) {
        let index = 0;
        let map = {};
        let size = 0;
        function updateInterval(passedTime) {
            if (size > 0) {
                for (let key in map) {
                    let data = map[key];
                    data.delay -= passedTime;
                    if (data.delay <= 0) {
                        data.delay = data.originDelay;
                        data.method.apply(data.thisObj, ...data.args);
                    }
                }
            }
        }
        sys.updateInterval = updateInterval;
        function setInterval(method, thisObj, delay, ...args) {
            let data = { method, thisObj, delay, args, originDelay: delay };
            map[index++] = data;
            ++size;
            return index;
        }
        sys.setInterval = setInterval;
        function clearInterval(key) {
            if (map[key]) {
                delete map[key];
                --size;
            }
        }
        sys.clearInterval = clearInterval;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 数学工具类
     * @author wizardc
     */
    let MathUtil;
    (function (MathUtil) {
        MathUtil.PI_HALF = Math.PI * 0.5;
        MathUtil.PI_QUARTER = Math.PI * 0.25;
        MathUtil.PI_DOUBLE = Math.PI * 2;
        /**
         * 弧度制到角度制相乘的系数
         */
        MathUtil.RAD_DEG = 180 / Math.PI;
        /**
         * 角度制到弧度制相乘的系数
         */
        MathUtil.DEG_RAD = Math.PI / 180;
        /**
         * 根号 2
         */
        MathUtil.SQRT_2 = 1.4142135623731;
        /**
         * 根号 2 的一半
         */
        MathUtil.SQRT1_2 = MathUtil.SQRT_2 * 0.5;
        /**
         * 把指定的数限制在指定的区间内
         */
        function clamp(v, min = 0, max = 1) {
            if (v < min) {
                return min;
            }
            if (v > max) {
                return max;
            }
            return v;
        }
        MathUtil.clamp = clamp;
        /**
         * 线性插值
         */
        function lerp(from, to, t) {
            return from + (to - from) * t;
        }
        MathUtil.lerp = lerp;
        /**
         * 转换为弧度
         */
        function toRadians(degrees) {
            return degrees * Math.PI / 180;
        }
        MathUtil.toRadians = toRadians;
        /**
         * 转换为角度
         */
        function toDegrees(radians) {
            return radians * 180 / Math.PI;
        }
        MathUtil.toDegrees = toDegrees;
        /**
         * 格式化弧线角度的值
         */
        function clampAngle(value) {
            value %= Math.PI * 2;
            if (value < 0) {
                value += Math.PI * 2;
            }
            return value;
        }
        MathUtil.clampAngle = clampAngle;
        /**
         * 格式化旋转角度的值
         */
        function clampRotation(value) {
            value %= 360;
            if (value > 180) {
                value -= 360;
            }
            else if (value < -180) {
                value += 360;
            }
            return value;
        }
        MathUtil.clampRotation = clampRotation;
    })(MathUtil = dou2d.MathUtil || (dou2d.MathUtil = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * HTML 工具类
     * @author wizardc
     */
    let HtmlUtil;
    (function (HtmlUtil) {
        let currentPrefix;
        function createCanvas(width, height) {
            let canvas = document.createElement("canvas");
            if (!isNaN(width)) {
                canvas.width = width;
            }
            if (!isNaN(height)) {
                canvas.height = height;
            }
            return canvas;
        }
        HtmlUtil.createCanvas = createCanvas;
        function get2DContext(canvas) {
            return canvas.getContext("2d");
        }
        HtmlUtil.get2DContext = get2DContext;
        function getWebGLContext(canvas, antialias = false, stencil = false) {
            let gl;
            let names = ["webgl", "experimental-webgl"];
            try {
                for (let i = 0; i < names.length; i++) {
                    gl = canvas.getContext(names[i], { antialias, stencil });
                    if (gl) {
                        break;
                    }
                }
            }
            catch (e) {
            }
            if (!gl) {
                console.error(`当前设备不支持 WebGL`);
            }
            return gl;
        }
        HtmlUtil.getWebGLContext = getWebGLContext;
        function resizeContext(renderContext, width, height, useMaxSize) {
            let surface = renderContext.surface;
            if (useMaxSize) {
                if (surface.width < width) {
                    surface.width = width;
                }
                if (surface.height < height) {
                    surface.height = height;
                }
            }
            else {
                if (surface.width !== width) {
                    surface.width = width;
                }
                if (surface.height !== height) {
                    surface.height = height;
                }
            }
            renderContext.onResize();
        }
        HtmlUtil.resizeContext = resizeContext;
        /**
         * 根据样式测量指定样式文本的宽度
         */
        function measureTextByStyle(text, values, style) {
            style = style || {};
            let italic = !style.italic ? values[16 /* italic */] : style.italic;
            let bold = !style.bold ? values[15 /* bold */] : style.bold;
            let size = !style.size ? values[0 /* fontSize */] : style.size;
            let fontFamily = style.fontFamily || values[8 /* fontFamily */] || dou2d.TextField.default_fontFamily;
            return HtmlUtil.measureText(text, fontFamily, size, bold, italic);
        }
        HtmlUtil.measureTextByStyle = measureTextByStyle;
        /**
         * 测量指定样式文本的宽度
         */
        function measureText(text, fontFamily, fontSize, bold, italic) {
            let font = "";
            if (italic) {
                font += "italic ";
            }
            if (bold) {
                font += "bold ";
            }
            font += (fontSize || 12) + "px ";
            font += (fontFamily || "Arial");
            dou2d.sys.context2D.font = font;
            return measureTextWidth(dou2d.sys.context2D, text);
        }
        HtmlUtil.measureText = measureText;
        /**
         * 测量文本的宽度
         */
        function measureTextWidth(context, text) {
            return context.measureText(text).width;
        }
        HtmlUtil.measureTextWidth = measureTextWidth;
        /**
         * 获取样式属性的名称, 兼容多个浏览器
         */
        function getStyleName(name, element) {
            let header = "";
            if (element) {
                header = getPrefix(name, element);
            }
            else {
                if (!currentPrefix) {
                    let tempStyle = document.createElement("div").style;
                    currentPrefix = getPrefix("transform", tempStyle);
                }
                header = currentPrefix;
            }
            if (header == "") {
                return name;
            }
            return header + name.charAt(0).toUpperCase() + name.substring(1, name.length);
        }
        HtmlUtil.getStyleName = getStyleName;
        function getPrefix(name, element) {
            if (name in element) {
                return "";
            }
            name = name.charAt(0).toUpperCase() + name.substring(1, name.length);
            let transArr = ["webkit", "ms", "Moz", "O"];
            for (let i = 0; i < transArr.length; i++) {
                let tempStyle = transArr[i] + name;
                if (tempStyle in element) {
                    return transArr[i];
                }
            }
            return "";
        }
        function getFontString(node, format) {
            let italic = format.italic == null ? node.italic : format.italic;
            let bold = format.bold == null ? node.bold : format.bold;
            let size = format.size == null ? node.size : format.size;
            let fontFamily = format.fontFamily || node.fontFamily;
            let font = italic ? "italic " : "normal ";
            font += bold ? "bold " : "normal ";
            font += size + "px " + fontFamily;
            return font;
        }
        HtmlUtil.getFontString = getFontString;
        function toColorString(value) {
            if (value < 0) {
                value = 0;
            }
            if (value > 16777215) {
                value = 16777215;
            }
            let color = value.toString(16).toUpperCase();
            while (color.length > 6) {
                color = color.slice(1, color.length);
            }
            while (color.length < 6) {
                color = "0" + color;
            }
            return "#" + color;
        }
        HtmlUtil.toColorString = toColorString;
    })(HtmlUtil = dou2d.HtmlUtil || (dou2d.HtmlUtil = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * WebGL 工具类
     * @author wizardc
     */
    let WebGLUtil;
    (function (WebGLUtil) {
        function createTexture(renderContext, sourceOrWidth, height, data) {
            let gl = renderContext.context;
            let texture = gl.createTexture();
            if (!texture) {
                // 需要先创建 texture 失败, 然后 lost 事件才发出来
                renderContext.contextLost = true;
                return;
            }
            texture[dou2d.sys.glContext] = gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            texture[dou2d.sys.unpackPremultiplyAlphaWebgl] = true;
            if (typeof sourceOrWidth == "number") {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sourceOrWidth, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
            }
            else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceOrWidth);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            return texture;
        }
        WebGLUtil.createTexture = createTexture;
        function deleteTexture(texture) {
            // 引擎默认的空白纹理不允许删除
            if (texture[dou2d.sys.engineDefaultEmptyTexture]) {
                if (DEBUG) {
                    console.warn(`默认纹理不允许删除: ${dou2d.sys.engineDefaultEmptyTexture}`);
                }
                return;
            }
            let gl = texture[dou2d.sys.glContext];
            if (gl) {
                gl.deleteTexture(texture);
            }
            else {
                if (DEBUG) {
                    console.warn(`gl 对象为空, 无法删除纹理`);
                }
            }
        }
        WebGLUtil.deleteTexture = deleteTexture;
        function premultiplyTint(tint, alpha) {
            if (alpha === 1) {
                return (alpha * 255 << 24) + tint;
            }
            if (alpha === 0) {
                return 0;
            }
            let R = ((tint >> 16) & 0xFF);
            let G = ((tint >> 8) & 0xFF);
            let B = (tint & 0xFF);
            R = ((R * alpha) + 0.5) | 0;
            G = ((G * alpha) + 0.5) | 0;
            B = ((B * alpha) + 0.5) | 0;
            return (alpha * 255 << 24) + (R << 16) + (G << 8) + B;
        }
        WebGLUtil.premultiplyTint = premultiplyTint;
    })(WebGLUtil = dou2d.WebGLUtil || (dou2d.WebGLUtil = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * Base64 工具类
     * @author wizardc
     */
    let Base64Util;
    (function (Base64Util) {
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let lookup = new Uint8Array(256);
        for (let i = 0; i < chars.length; i++) {
            lookup[chars.charCodeAt(i)] = i;
        }
        /**
         * 编码
         */
        function encode(arraybuffer) {
            let bytes = new Uint8Array(arraybuffer);
            let len = bytes.length;
            let base64 = "";
            for (let i = 0; i < len; i += 3) {
                base64 += chars[bytes[i] >> 2];
                base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                base64 += chars[bytes[i + 2] & 63];
            }
            if ((len % 3) === 2) {
                base64 = base64.substring(0, base64.length - 1) + "=";
            }
            else if (len % 3 === 1) {
                base64 = base64.substring(0, base64.length - 2) + "==";
            }
            return base64;
        }
        Base64Util.encode = encode;
        /**
         * 解码
         */
        function decode(base64) {
            let bufferLength = base64.length * 0.75;
            let len = base64.length;
            let p = 0;
            let encoded1 = 0;
            let encoded2 = 0;
            let encoded3 = 0;
            let encoded4 = 0;
            if (base64[base64.length - 1] === "=") {
                bufferLength--;
                if (base64[base64.length - 2] === "=") {
                    bufferLength--;
                }
            }
            let arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
            for (let i = 0; i < len; i += 4) {
                encoded1 = lookup[base64.charCodeAt(i)];
                encoded2 = lookup[base64.charCodeAt(i + 1)];
                encoded3 = lookup[base64.charCodeAt(i + 2)];
                encoded4 = lookup[base64.charCodeAt(i + 3)];
                bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
            }
            return arraybuffer;
        }
        Base64Util.decode = decode;
    })(Base64Util = dou2d.Base64Util || (dou2d.Base64Util = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    const _implementationMap = {};
    /**
     * 注册一个接口实现
     */
    function registerImplementation(key, data) {
        _implementationMap[key] = data;
    }
    dou2d.registerImplementation = registerImplementation;
    /**
     * 获取一个接口实现
     */
    function getImplementation(key) {
        return _implementationMap[key];
    }
    dou2d.getImplementation = getImplementation;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 运行时环境信息
     * @author wizardc
     */
    let Capabilities;
    (function (Capabilities) {
        /**
         * 引擎版本
         */
        Capabilities.engineVersion = "0.1.0";
        /**
         * 当前的操作系统
         */
        Capabilities.os = "Unknown";
        function init() {
            let userAgent = navigator.userAgent.toLowerCase();
            Capabilities.isMobile = userAgent.indexOf("mobile") != -1 || userAgent.indexOf("android") != -1;
            if (Capabilities.isMobile) {
                if (userAgent.indexOf("windows") < 0 && (userAgent.indexOf("iphone") != -1 || userAgent.indexOf("ipad") != -1 || userAgent.indexOf("ipod") != -1)) {
                    Capabilities.os = "iOS";
                }
                else if (userAgent.indexOf("android") != -1 && userAgent.indexOf("linux") != -1) {
                    Capabilities.os = "Android";
                }
                else if (userAgent.indexOf("windows") != -1) {
                    Capabilities.os = "Windows Phone";
                }
            }
            else {
                if (userAgent.indexOf("windows nt") != -1) {
                    Capabilities.os = "Windows PC";
                }
                else if (userAgent.indexOf("mac os") != -1) {
                    Capabilities.os = "Mac OS";
                }
            }
            let language = navigator.language.toLowerCase();
            let strings = language.split("-");
            if (strings.length > 1) {
                strings[1] = strings[1].toUpperCase();
            }
            language = strings.join("-");
        }
        Capabilities.init = init;
    })(Capabilities = dou2d.Capabilities || (dou2d.Capabilities = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 文本工具类
     * @author wizardc
     */
    let TextFieldUtil;
    (function (TextFieldUtil) {
        /**
         * 获取第一行绘制的行数, 从 0 开始
         */
        function getStartLine(textfield) {
            let values = textfield.$propertyMap;
            let textHeight = TextFieldUtil.getTextHeight(textfield);
            let startLine = 0;
            let textFieldHeight = values[4 /* textFieldHeight */];
            if (!isNaN(textFieldHeight)) {
                // 最大高度比需要显示的高度小
                if (textHeight < textFieldHeight) {
                }
                // 最大高度比需要显示的高度大
                else if (textHeight > textFieldHeight) {
                    startLine = Math.max(values[28 /* scrollV */] - 1, 0);
                    startLine = Math.min(values[29 /* numLines */] - 1, startLine);
                }
                if (!values[30 /* multiline */]) {
                    startLine = Math.max(values[28 /* scrollV */] - 1, 0);
                    if (values[29 /* numLines */] > 0) {
                        startLine = Math.min(values[29 /* numLines */] - 1, startLine);
                    }
                }
            }
            return startLine;
        }
        TextFieldUtil.getStartLine = getStartLine;
        /**
         * 获取水平比例
         */
        function getHalign(textfield) {
            let lineArr = textfield.$getLinesArr();
            let halign = 0;
            if (textfield.$propertyMap[9 /* textAlign */] == 1 /* center */) {
                halign = 0.5;
            }
            else if (textfield.$propertyMap[9 /* textAlign */] == 2 /* right */) {
                halign = 1;
            }
            if (textfield.$propertyMap[24 /* type */] == 1 /* input */ && !textfield.$propertyMap[30 /* multiline */] && lineArr.length > 1) {
                halign = 0;
            }
            return halign;
        }
        TextFieldUtil.getHalign = getHalign;
        /**
         * 获取文本高度
         */
        function getTextHeight(textfield) {
            if (1 /* input */ == textfield.$propertyMap[24 /* type */] && !textfield.$propertyMap[30 /* multiline */]) {
                return textfield.$propertyMap[0 /* fontSize */];
            }
            return textfield.$propertyMap[6 /* textHeight */] + (textfield.$propertyMap[29 /* numLines */] - 1) * textfield.$propertyMap[1 /* lineSpacing */];
        }
        TextFieldUtil.getTextHeight = getTextHeight;
        /**
         * 获取垂直比例
         */
        function getValign(textfield) {
            let textHeight = TextFieldUtil.getTextHeight(textfield);
            let textFieldHeight = textfield.$propertyMap[4 /* textFieldHeight */];
            if (!isNaN(textFieldHeight)) {
                // 最大高度比需要显示的高度小
                if (textHeight < textFieldHeight) {
                    let valign = 0;
                    if (textfield.$propertyMap[10 /* verticalAlign */] == 1 /* middle */) {
                        valign = 0.5;
                    }
                    else if (textfield.$propertyMap[10 /* verticalAlign */] == 2 /* bottom */) {
                        valign = 1;
                    }
                    return valign;
                }
            }
            return 0;
        }
        TextFieldUtil.getValign = getValign;
        /**
         * 根据坐标获取文本项
         */
        function getTextElement(textfield, x, y) {
            let hitTextEle = TextFieldUtil.getHit(textfield, x, y);
            let lineArr = textfield.$getLinesArr();
            if (hitTextEle && lineArr[hitTextEle.lineIndex] && lineArr[hitTextEle.lineIndex].elements[hitTextEle.textElementIndex]) {
                return lineArr[hitTextEle.lineIndex].elements[hitTextEle.textElementIndex];
            }
            return null;
        }
        TextFieldUtil.getTextElement = getTextElement;
        /**
         * 获取文本点击块
         */
        function getHit(textfield, x, y) {
            let lineArr = textfield.$getLinesArr();
            // 文本可点击区域
            if (textfield.$propertyMap[3 /* textFieldWidth */] == 0) {
                return null;
            }
            let line = 0;
            let textHeight = TextFieldUtil.getTextHeight(textfield);
            let startY = 0;
            let textFieldHeight = textfield.$propertyMap[4 /* textFieldHeight */];
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
                if (lineH + textfield.$propertyMap[1 /* lineSpacing */] > y) {
                    return null;
                }
                lineH += textfield.$propertyMap[1 /* lineSpacing */];
            }
            if (line == 0) {
                return null;
            }
            let lineElement = lineArr[line - 1];
            let textFieldWidth = textfield.$propertyMap[3 /* textFieldWidth */];
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
        TextFieldUtil.getHit = getHit;
        /**
         * 获取当前显示多少行
         */
        function getScrollNum(textfield) {
            let scrollNum = 1;
            if (textfield.$propertyMap[30 /* multiline */]) {
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
        TextFieldUtil.getScrollNum = getScrollNum;
    })(TextFieldUtil = dou2d.TextFieldUtil || (dou2d.TextFieldUtil = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * UUID 工具类
     * @author wizardc
     */
    let UUID;
    (function (UUID) {
        let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
        let uuid = new Array(36);
        let rnd = 0, r;
        /**
         * 生成一个 UUID
         */
        function generate() {
            for (let i = 0; i < 36; i++) {
                if (i === 8 || i === 13 || i === 18 || i === 23) {
                    uuid[i] = "-";
                }
                else if (i === 14) {
                    uuid[i] = "4";
                }
                else {
                    if (rnd <= 0x02) {
                        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                    }
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return uuid.join("");
        }
        UUID.generate = generate;
    })(UUID = dou2d.UUID || (dou2d.UUID = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 时间类
     * @author wizardc
     */
    class Time {
        /**
         * 项目启动后经过的时间
         */
        static get time() {
            return dou.getTimer();
        }
        /**
         * 上一帧到这一帧经过的时间
         */
        static get deltaTime() {
            return sys.deltaTime;
        }
        /**
         * 固定频率刷新时间间隔, 默认值为 50 毫秒
         */
        static set fixedDeltaTime(value) {
            sys.fixedDeltaTime = value;
        }
        static get fixedDeltaTime() {
            return sys.fixedDeltaTime;
        }
    }
    dou2d.Time = Time;
    let sys;
    (function (sys) {
        sys.deltaTime = 0;
        sys.fixedDeltaTime = 50;
        sys.fixedPassedTime = 0;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 贝塞尔工具类
     * @author wizardc
     */
    let BezierUtil;
    (function (BezierUtil) {
        /**
         * 二次贝塞尔曲线
         */
        function quadratic(factor, point1, point2, point3, result) {
            if (!result) {
                result = dou.recyclable(dou2d.Point);
            }
            result.x = (1 - factor) * (1 - factor) * point1.x + 2 * factor * (1 - factor) * point2.x + factor * factor * point3.x;
            result.y = (1 - factor) * (1 - factor) * point1.y + 2 * factor * (1 - factor) * point2.y + factor * factor * point3.y;
            return result;
        }
        BezierUtil.quadratic = quadratic;
        /**
         * 三次贝塞尔曲线
         */
        function cube(factor, startPoint, point1, point2, endPoint, result) {
            if (!result) {
                result = dou.recyclable(dou2d.Point);
            }
            let left = 1 - factor;
            result.x = (startPoint.x * Math.pow(left, 3) + 3 * point1.x * Math.pow(left, 2) * factor + 3 * point2.x * Math.pow(factor, 2) * left + endPoint.x * Math.pow(factor, 3));
            result.y = (startPoint.y * Math.pow(left, 3) + 3 * point1.y * Math.pow(left, 2) * factor + 3 * point2.y * Math.pow(factor, 2) * left + endPoint.y * Math.pow(factor, 3));
            return result;
        }
        BezierUtil.cube = cube;
    })(BezierUtil = dou2d.BezierUtil || (dou2d.BezierUtil = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    var sys;
    (function (sys) {
        /**
         * 应用统计信息
         * @author wizardc
         */
        class Stat {
            setListener(method, thisObj) {
                this._method = method;
                this._thisObj = thisObj;
            }
            onFrame(logicTime, renderTime, drawCalls) {
                if (this._method) {
                    this._method.call(this._thisObj, logicTime, renderTime, drawCalls);
                }
            }
        }
        sys.Stat = Stat;
    })(sys = dou2d.sys || (dou2d.sys = {}));
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 简单的性能统计信息面板
     * * 推荐实际项目中自己实现该面板来统计更多有用的详细信息
     * @author wizardc
     */
    class StatPanel extends dou2d.DisplayObjectContainer {
        constructor() {
            super();
            this._time = 0;
            this._frame = 0;
            this._drawCalls = 0;
            this._logicTime = 0;
            this._renderTime = 0;
            this._label = new dou2d.TextField();
            this._label.text = "FPS: 0\rDraw: 0\rLogic: 0ms\rRender: 0ms";
            this._label.size = 20;
            this._label.textColor = 0xffffff;
            this._label.strokeColor = 0x000000;
            this._label.stroke = 1;
            this.addChild(this._label);
            dou2d.sys.stat.setListener(this.receive, this);
            dou2d.sys.stage.addChild(this);
        }
        receive(logicTime, renderTime, drawCalls) {
            this._time += dou2d.Time.deltaTime;
            this._frame += 1;
            this._drawCalls += drawCalls;
            this._logicTime += logicTime;
            this._renderTime += renderTime;
            if (this._frame == dou2d.sys.stage.frameRate) {
                let passedTime = this._time * 0.001;
                let fps = (this._frame / passedTime).toFixed(1);
                let draw = Math.ceil(this._drawCalls / this._frame);
                let logic = Math.ceil(this._logicTime / this._frame);
                let render = Math.ceil(this._renderTime / this._frame);
                this._label.text = `FPS: ${fps}\rDraw: ${draw}\rLogic: ${logic}ms\rRender: ${render}ms`;
                this._time = 0;
                this._frame = 0;
                this._drawCalls = 0;
                this._logicTime = 0;
                this._renderTime = 0;
            }
        }
    }
    dou2d.StatPanel = StatPanel;
})(dou2d || (dou2d = {}));
var dou2d;
(function (dou2d) {
    /**
     * 引擎类, 用来启动 2D 引擎
     * @author wizardc
     */
    class Engine {
        /**
         * @param rootClass 根显示容器类
         * @param div 用户呈现 3D 图像的 Div 元素, 为空则会创建一个全屏的元素
         * @param runOptions 运行配置项
         */
        constructor(rootClass, div, runOptions) {
            this.init(rootClass, div, runOptions);
        }
        init(rootClass, div, runOptions) {
            if (!div) {
                div = document.createElement("div");
                div.style.position = "fixed";
                div.style.left = "0px";
                div.style.top = "0px";
                div.style.width = "100%";
                div.style.height = "100%";
                document.body.appendChild(div);
            }
            this._container = div;
            let options = this._options = this.readOptions(rootClass, runOptions);
            dou2d.sys.stage = new dou2d.Stage(this);
            dou2d.sys.screenAdapter = options.screenAdapter;
            dou2d.sys.renderer = new dou2d.rendering.Renderer();
            let renderBuffer = new dou2d.rendering.RenderBuffer(undefined, undefined, true);
            dou2d.sys.canvas = renderBuffer.surface;
            this.attachCanvas(this._container, dou2d.sys.canvas);
            dou2d.sys.context2D = dou2d.HtmlUtil.get2DContext(dou2d.HtmlUtil.createCanvas(2, 2));
            this._touchHandler = new dou2d.touch.TouchHandler(dou2d.sys.stage, dou2d.sys.canvas);
            dou2d.sys.inputManager = new dou2d.input.InputManager();
            dou2d.sys.inputManager.initStageDelegateDiv(this._container, dou2d.sys.canvas);
            dou2d.sys.player = new dou2d.sys.Player(renderBuffer, dou2d.sys.stage, options.rootClass);
            dou2d.sys.player.start();
            dou2d.sys.ticker = new dou2d.sys.Ticker();
            this.startTicker();
            dou2d.sys.stage.scaleMode = options.scaleMode;
            dou2d.sys.stage.orientation = options.orientation;
            dou2d.sys.stage.maxTouches = options.maxTouches;
            dou2d.sys.stage.frameRate = options.frameRate;
            dou2d.sys.stage.textureScaleFactor = options.textureScaleFactor;
            this.updateScreenSize();
            window.addEventListener("resize", () => {
                window.setTimeout(() => {
                    this.updateScreenSize();
                }, 300);
            });
            dou2d.sys.stat = new dou2d.sys.Stat();
        }
        readOptions(rootClass, runOptions) {
            if (!runOptions) {
                runOptions = {};
            }
            return {
                rootClass,
                contentWidth: runOptions.contentWidth || 480,
                contentHeight: runOptions.contentHeight || 800,
                scaleMode: runOptions.scaleMode || "showAll" /* showAll */,
                orientation: runOptions.orientation || "auto" /* auto */,
                maxTouches: runOptions.maxTouches || 2,
                frameRate: runOptions.frameRate || 60,
                antialias: runOptions.antialias || false,
                screenAdapter: runOptions.screenAdapter || new dou2d.DefaultScreenAdapter(),
                textureScaleFactor: runOptions.canvasScaleFactor ? runOptions.canvasScaleFactor(dou2d.sys.canvas.getContext("2d")) : 1
            };
        }
        attachCanvas(container, canvas) {
            let style = canvas.style;
            style.cursor = "inherit";
            style.position = "absolute";
            style.top = "0";
            style.bottom = "0";
            style.left = "0";
            style.right = "0";
            container.appendChild(canvas);
            style = container.style;
            style.overflow = "hidden";
            style.position = "absolute";
        }
        startTicker() {
            requestAnimationFrame(onTick);
            function onTick() {
                dou2d.sys.ticker.update();
                requestAnimationFrame(onTick);
            }
        }
        setContentSize(width, height) {
            let options = this._options;
            options.contentWidth = width;
            options.contentHeight = height;
            this.updateScreenSize();
        }
        updateScreenSize() {
            let canvas = dou2d.sys.canvas;
            let option = this._options;
            let screenRect = this._container.getBoundingClientRect();
            let top = 0;
            let boundingClientWidth = screenRect.width;
            let boundingClientHeight = screenRect.height;
            if (boundingClientWidth == 0 || boundingClientHeight == 0) {
                return;
            }
            if (screenRect.top < 0) {
                boundingClientHeight += screenRect.top;
                top = -screenRect.top;
            }
            let shouldRotate = false;
            let orientation = dou2d.sys.stage.orientation;
            if (orientation != "auto" /* auto */) {
                shouldRotate = orientation != "portrait" /* portrait */ && boundingClientHeight > boundingClientWidth || orientation == "portrait" /* portrait */ && boundingClientWidth > boundingClientHeight;
            }
            let screenWidth = shouldRotate ? boundingClientHeight : boundingClientWidth;
            let screenHeight = shouldRotate ? boundingClientWidth : boundingClientHeight;
            dou2d.Capabilities.boundingClientWidth = screenWidth;
            dou2d.Capabilities.boundingClientHeight = screenHeight;
            let stageSize = dou2d.sys.screenAdapter.calculateStageSize(dou2d.sys.stage.scaleMode, screenWidth, screenHeight, option.contentWidth, option.contentHeight);
            let stageWidth = stageSize.stageWidth;
            let stageHeight = stageSize.stageHeight;
            let displayWidth = stageSize.displayWidth;
            let displayHeight = stageSize.displayHeight;
            canvas.style[dou2d.HtmlUtil.getStyleName("transformOrigin")] = "0% 0% 0px";
            if (canvas.width != stageWidth) {
                canvas.width = stageWidth;
            }
            if (canvas.height != stageHeight) {
                canvas.height = stageHeight;
            }
            let rotation = 0;
            if (shouldRotate) {
                if (orientation == "landscape" /* landscape */) {
                    rotation = 90;
                    canvas.style.top = top + (boundingClientHeight - displayWidth) / 2 + "px";
                    canvas.style.left = (boundingClientWidth + displayHeight) / 2 + "px";
                }
                else {
                    rotation = -90;
                    canvas.style.top = top + (boundingClientHeight + displayWidth) / 2 + "px";
                    canvas.style.left = (boundingClientWidth - displayHeight) / 2 + "px";
                }
            }
            else {
                canvas.style.top = top + (boundingClientHeight - displayHeight) / 2 + "px";
                canvas.style.left = (boundingClientWidth - displayWidth) / 2 + "px";
            }
            let scalex = displayWidth / stageWidth, scaley = displayHeight / stageHeight;
            let canvasScaleX = scalex * dou2d.rendering.DisplayList.canvasScaleFactor;
            let canvasScaleY = scaley * dou2d.rendering.DisplayList.canvasScaleFactor;
            let matrix = dou.recyclable(dou2d.Matrix);
            matrix.scale(scalex / canvasScaleX, scaley / canvasScaleY);
            matrix.rotate(rotation * Math.PI / 180);
            let transform = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.tx},${matrix.ty})`;
            matrix.recycle();
            canvas.style[dou2d.HtmlUtil.getStyleName("transform")] = transform;
            dou2d.rendering.DisplayList.setCanvasScale(canvasScaleX, canvasScaleY);
            this._touchHandler.updateScaleMode(scalex, scaley, rotation);
            dou2d.sys.inputManager.updateSize();
            dou2d.sys.player.updateStageSize(stageWidth, stageHeight);
        }
        updateMaxTouches(maxTouches) {
            this._touchHandler.updateMaxTouches();
        }
    }
    dou2d.Engine = Engine;
})(dou2d || (dou2d = {}));
