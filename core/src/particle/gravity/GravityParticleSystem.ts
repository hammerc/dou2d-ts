namespace dou2d {
    /**
     * 重力粒子系统
     * @author wizardc
     */
    export class GravityParticleSystem extends ParticleSystem<GravityParticle> {
        /**
         * 表示粒子初始坐标 x 差值
         */
        private _emitterXVariance: number;

        /**
         * 表示粒子初始坐标 y 差值
         */
        private _emitterYVariance: number;

        /**
         * 表示粒子存活时间，单位毫秒
         */
        private _lifespan: number;

        /**
         * 表示粒子存活时间差值，单位毫秒
         */
        private _lifespanVariance: number;

        /**
         * 表示粒子出现时大小
         */
        private _startSize: number;

        /**
         * 表示粒子出现时大小差值
         */
        private _startSizeVariance: number;

        /**
         * 表示粒子消失时大小
         */
        private _endSize: number;

        /**
         * 表示粒子消失时大小差值
         */
        private _endSizeVariance: number;

        /**
         * 表示粒子出现时的角度
         */
        private _emitAngle: number;

        /**
         * 表示粒子出现时的角度差值
         */
        private _emitAngleVariance: number;

        /**
         * 表示粒子出现时旋转值
         */
        private _startRotation: number;

        /**
         * 表示粒子出现时旋转值差值
         */
        private _startRotationVariance: number;

        /**
         * 表示粒子消失时旋转值
         */
        private _endRotation: number;

        /**
         * 表示粒子消失时旋转值差值
         */
        private _endRotationVariance: number;

        /**
         * 表示粒子出现时速度
         */
        private _speed: number;

        /**
         * 表示粒子出现时速度差值
         */
        private _speedVariance: number;

        /**
         * 表示粒子水平重力
         */
        private _gravityX: number;

        /**
         * 表示粒子垂直重力
         */
        private _gravityY: number;

        /**
         * 表示粒子径向加速度
         */
        private _radialAcceleration: number;

        /**
         * 表示粒子径向加速度差值
         */
        private _radialAccelerationVariance: number;

        /**
         * 表示粒子切向加速度
         */
        private _tangentialAcceleration: number;

        /**
         * 表示粒子切向加速度差值
         */
        private _tangentialAccelerationVariance: number;

        /**
         * 表示粒子出现时的 Alpha 透明度值
         */
        private _startAlpha: number;

        /**
         * 表示粒子出现时的 Alpha 透明度差值
         */
        private _startAlphaVariance: number;

        /**
         * 表示粒子消失时的 Alpha 透明度值
         */
        private _endAlpha: number;

        /**
         * 表示粒子消失时的 Alpha 透明度差值
         */
        private _endAlphaVariance: number;

        public constructor(texture: Texture, config: GravityParticleConfig) {
            super(texture, 0, 0);
            this._particleClass = GravityParticle;
            this.parseConfig(config);
            this._emissionRate = this._lifespan / this._maxParticles;
        }

        private parseConfig(config: GravityParticleConfig): void {
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

        protected initParticle(particle: GravityParticle): void {
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

        private getValue(base: number, variance: number): number {
            return base + variance * (Math.random() * 2 - 1);
        }

        public advanceParticle(particle: GravityParticle, passedTime: number): void {
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
}
