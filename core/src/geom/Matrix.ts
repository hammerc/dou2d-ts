namespace dou2d {
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
    export class Matrix implements dou.ICacheable {
        /**
         * 缩放或旋转图像时影响像素沿 x 轴定位的值
         */
        public a: number;

        /**
         * 旋转或倾斜图像时影响像素沿 y 轴定位的值
         */
        public b: number;

        /**
         * 旋转或倾斜图像时影响像素沿 x 轴定位的值
         */
        public c: number;

        /**
         * 缩放或旋转图像时影响像素沿 y 轴定位的值
         */
        public d: number;

        /**
         * 沿 x 轴平移每个点的距离
         */
        public tx: number;

        /**
         * 沿 y 轴平移每个点的距离
         */
        public ty: number;

        public constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }

        public get scaleX(): number {
            let m = this;
            if (m.b == 0) {
                return m.a;
            }
            let result = Math.sqrt(m.a * m.a + m.b * m.b);
            return this.getDeterminant() < 0 ? -result : result;
        }

        public get scaleY(): number {
            let m = this;
            if (m.c == 0) {
                return m.d;
            }
            let result = Math.sqrt(m.c * m.c + m.d * m.d);
            return this.getDeterminant() < 0 ? -result : result;
        }

        public get skewX(): number {
            if (this.d < 0) {
                return Math.atan2(this.d, this.c) + MathUtil.PI_HALF;
            }
            return Math.atan2(this.d, this.c) - MathUtil.PI_HALF;
        }

        public get skewY(): number {
            if (this.a < 0) {
                return Math.atan2(this.b, this.a) - Math.PI;
            }
            return Math.atan2(this.b, this.a);
        }

        private getDeterminant(): number {
            return this.a * this.d - this.b * this.c;
        }

        public set(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix {
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
        public multiply(matrixA: Matrix, matrixB?: Matrix): this {
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
        public premultiply(matrixA: Matrix, matrixB?: Matrix): this {
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
        public inverse(input?: Matrix): this {
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
        public append(a: number, b: number, c: number, d: number, tx: number, ty: number): this {
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
        public prepend(a: number, b: number, c: number, d: number, tx: number, ty: number): this {
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
        public rotate(angle: number): void {
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
        public scale(sx: number, sy: number): void {
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
        public translate(dx: number, dy: number): void {
            this.tx += dx;
            this.ty += dy;
        }

        /**
         * 如果给定预转换坐标空间中的点, 则此方法返回发生转换后该点的坐标
         */
        public transformPoint(pointX: number, pointY: number, result?: Point): Point {
            result = result || new Point();
            let x = this.a * pointX + this.c * pointY + this.tx;
            let y = this.b * pointX + this.d * pointY + this.ty;
            result.set(x, y);
            return result;
        }

        /**
         * 如果给定预转换坐标空间中的点, 则此方法返回发生转换后该点的坐标
         * 与 transformPoint 不同的地方是该方法的转换不考虑转换参数 tx 和 ty
         */
        public deltaTransformPoint(point: Point, result?: Point): Point {
            result = result || new Point();
            result.x = this.a * point.x + this.c * point.y;
            result.y = this.b * point.x + this.d * point.y;
            return result;
        }

        /**
         * 如果给定预转换坐标空间中的矩形, 则此方法返回发生转换后的矩形
         */
        public transformBounds(bounds: Rectangle, result?: Rectangle): Rectangle {
            result = result || new Rectangle();
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
        public updateScaleAndRotation(scaleX: number, scaleY: number, skewX: number, skewY: number): void {
            if ((skewX == 0 || skewX == MathUtil.PI_DOUBLE) && (skewY == 0 || skewY == MathUtil.PI_DOUBLE)) {
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

        public equals(other: Matrix): boolean {
            return this.a == other.a && this.b == other.b && this.c == other.c && this.d == other.d && this.tx == other.tx && this.ty == other.ty;
        }

        public copy(matrix: Matrix): Matrix {
            this.a = matrix.a;
            this.b = matrix.b;
            this.c = matrix.c;
            this.d = matrix.d;
            this.tx = matrix.tx;
            this.ty = matrix.ty;
            return this;
        }

        public clone(): Matrix {
            return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
        }

        public identity(): void {
            this.a = this.d = 1;
            this.b = this.c = this.tx = this.ty = 0;
        }

        public onRecycle(): void {
            this.identity();
        }
    }
}
