namespace dou2d {
    /**
     * 粒子基类
     * @author wizardc
     */
    export abstract class Particle implements dou.ICacheable {
        /**
         * 表示粒子相对于父级本地坐标的 x 坐标
         */
        public x: number;

        /**
         * 表示粒子相对于父级本地坐标的 y 坐标
         */
        public y: number;

        /**
         * 表示从注册点开始应用的对象的缩放比例
         */
        public scale: number;

        /**
         * 表示粒子距其原始方向的旋转程度, 以度为单位
         */
        public rotation: number;

        /**
         * 表示粒子的 Alpha 透明度值
         */
        public alpha: number;

        /**
         * 表示粒子当前存活时间
         */
        public currentTime: number;

        /**
         * 表示粒子的存活总时间
         */
        public totalTime: number;

        private _matrix: Matrix;

        public constructor() {
            this._matrix = new Matrix();
            this.clear();
        }

        public getMatrix(regX: number, regY: number): Matrix {
            let matrix = this._matrix;
            matrix.identity();
            let cos: number, sin: number;
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

        public clear(): void {
            this.x = 0;
            this.y = 0;
            this.scale = 1;
            this.rotation = 0;
            this.alpha = 1;
            this.currentTime = 0;
            this.totalTime = 1000;
        }

        public onRecycle(): void {
            this.clear();
        }
    }
}
