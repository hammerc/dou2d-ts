namespace dou2d {
    /**
     * 重力粒子
     * @author wizardc
     */
    export class GravityParticle extends Particle {
        /**
         * 发射时的 x 坐标
         */
        public startX: number;

        /**
         * 发射时的 y 坐标
         */
        public startY: number;

        /**
         * x 轴速度
         */
        public velocityX: number;

        /**
         * y 轴速度
         */
        public velocityY: number;

        /**
         * 径向加速度
         */
        public radialAcceleration: number;

        /**
         * 切向加速度
         */
        public tangentialAcceleration: number;

        /**
         * 旋转增量
         */
        public rotationDelta: number;

        /**
         * 缩放增量
         */
        public scaleDelta: number;

        /**
         * 透明度增量
         */
        public alphaDelta: number;

        public clear(): void {
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
}
