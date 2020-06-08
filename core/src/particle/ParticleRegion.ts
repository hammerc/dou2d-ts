namespace dou2d {
    /**
     * 粒子范围
     * @author wizardc
     */
    export class ParticleRegion implements dou.ICacheable {
        public minX: number = 0;
        public minY: number = 0;
        public maxX: number = 0;
        public maxY: number = 0;
        public width: number = 0;
        public height: number = 0;
        public area: number = 0;

        public updateRegion(bounds: Rectangle, matrix: Matrix): void {
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
            let minX: number, minY: number, maxX: number, maxY: number;
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

        public clear(): void {
            this.minX = 0;
            this.minY = 0;
            this.maxX = 0;
            this.maxY = 0;
            this.width = 0;
            this.height = 0;
            this.area = 0;
        }

        public onRecycle(): void {
            this.clear();
        }
    }
}
