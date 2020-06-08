namespace dou2d {
    /**
     * 重力粒子配置接口
     * @author wizardc
     */
    export interface GravityParticleConfig {
        /**
         * 粒子发射坐标
         */
        emitter: { x: number, y: number };

        /**
         * 粒子发射坐标偏移量
         */
        emitterVariance: { x: number, y: number };

        /**
         * 粒子最大数量
         */
        maxParticles: number;

        /**
         * 粒子存活时间
         */
        lifespan: number;

        /**
         * 粒子存活时间差值
         */
        lifespanVariance: number;

        /**
         * 粒子出现时大小
         */
        startSize: number;

        /**
         * 粒子出现时大小差值
         */
        startSizeVariance: number;

        /**
         * 粒子消失时大小
         */
        endSize: number;

        /**
         * 粒子消失时大小差值
         */
        endSizeVariance: number;

        /**
         * 粒子出现时的角度
         */
        emitAngle: number;

        /**
         * 粒子出现时角度差值
         */
        emitAngleVariance: number;

        /**
         * 粒子出现时旋转值
         */
        startRotation: number;

        /**
         * 粒子出现时旋转值差值
         */
        startRotationVariance: number;

        /**
         * 粒子消失时旋转值
         */
        endRotation: number;

        /**
         * 粒子消失时旋转值差值
         */
        endRotationVariance: number;

        /**
         * 粒子出现时速度
         */
        speed: number;

        /**
         * 粒子出现时速度差值
         */
        speedVariance: number;

        /**
         * 粒子重力
         */
        gravity: { x: number, y: number };

        /**
         * 粒子径向加速度
         */
        radialAcceleration: number;

        /**
         * 粒子径向加速度差值
         */
        radialAccelerationVariance: number;

        /**
         * 粒子切向加速度
         */
        tangentialAcceleration: number;

        /**
         * 粒子切向加速度差值
         */
        tangentialAccelerationVariance: number;

        /**
         * 粒子出现时透明度
         */
        startAlpha: number;

        /**
         * 粒子出现时的透明度差值
         */
        startAlphaVariance: number;

        /**
         * 粒子消失时透明度
         */
        endAlpha: number;

        /**
         * 粒子消失时的透明度差值
         */
        endAlphaVariance: number;
    }
}
