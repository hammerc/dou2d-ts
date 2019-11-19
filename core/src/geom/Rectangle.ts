namespace dou2d {
    /**
     * 矩形对象
     * @author wizardc
     */
    export class Rectangle implements dou.ICacheable {
        public x: number;
        public y: number;
        public width: number;
        public height: number;

        public constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        public set top(value: number) {
            this.height += this.y - value;
            this.y = value;
        }
        public get top(): number {
            return this.y;
        }

        public set bottom(value: number) {
            this.height = value - this.y;
        }
        public get bottom(): number {
            return this.y + this.height;
        }

        public set left(value: number) {
            this.width += this.x - value;
            this.x = value;
        }
        public get left(): number {
            return this.x;
        }

        public set right(value: number) {
            this.width = value - this.x;
        }
        public get right(): number {
            return this.x + this.width;
        }

        public set topLeft(value: Point) {
            this.top = value.y;
            this.left = value.x;
        }
        public get topLeft(): Point {
            return new Point(this.left, this.top);
        }

        public set bottomRight(value: Point) {
            this.bottom = value.y;
            this.right = value.x;
        }
        public get bottomRight(): Point {
            return new Point(this.right, this.bottom);
        }

        public set(x: number, y: number, width: number, height: number): this {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        }

        /**
         * 尺寸是否为空
         */
        public isEmpty(): boolean {
            return this.width <= 0 || this.height <= 0;
        }

        /**
         * 是否包含指定的点
         */
        public contains(x: number, y: number): boolean {
            return this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y;
        }

        /**
         * 判断是否包含指定的点
         */
        public containsPoint(point: IPoint): boolean {
            return this.x <= point.x && this.x + this.width > point.x && this.y <= point.y && this.y + this.height > point.y;
        }

        /**
         * 判断是否包含指定的矩形
         */
        public containsRect(rect: Rectangle): boolean {
            let r1 = rect.x + rect.width;
            let b1 = rect.y + rect.height;
            let r2 = this.x + this.width;
            let b2 = this.y + this.height;
            return (rect.x >= this.x) && (rect.x < r2) && (rect.y >= this.y) && (rect.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
        }

        /**
         * 判断是否和指定的对象相交
         */
        public intersects(rect: Rectangle): boolean {
            return Math.max(this.x, rect.x) <= Math.min(this.right, rect.right) && Math.max(this.y, rect.y) <= Math.min(this.bottom, rect.bottom);
        }

        /**
         * 判断是否和指定的对象相交, 返回相交区域, 如果不相交则返回的相交区域的 x, y, width 和 height 都为 0
         */
        public intersection(rect: Rectangle, result?: Rectangle): Rectangle {
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
        public union(rect: Rectangle, result?: Rectangle): Rectangle {
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

        public equals(rect: Rectangle): boolean {
            if (this === rect) {
                return true;
            }
            return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
        }

        public copy(rect: Rectangle): this {
            this.x = rect.x;
            this.y = rect.y;
            this.width = rect.width;
            this.height = rect.height;
            return this;
        }

        public clone(): Rectangle {
            return new Rectangle(this.x, this.y, this.width, this.height);
        }

        public clear(): this {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            return this;
        }

        public onRecycle(): void {
            this.clear();
        }
    }
}
