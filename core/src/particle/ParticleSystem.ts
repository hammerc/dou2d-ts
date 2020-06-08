namespace dou2d {
    /**
     * 粒子系统基类
     * @author wizardc
     */
    export abstract class ParticleSystem<T extends Particle> extends DisplayObject {
        /**
         * 表示粒子所使用的纹理
         */
        protected _texture: Texture;

        /**
         * 表示粒子出现间隔
         */
        protected _emissionRate: number;

        /**
         * 表示粒子系统最大粒子数, 超过该数量将不会继续创建粒子
         */
        protected _maxParticles: number = 200;

        /**
         * 粒子类
         */
        protected _particleClass: { new(): T };

        private _emissionTime: number = -1;
        private _frameTime: number = 0;

        private _particles: T[];
        private _numParticles: number = 0;

        private _emitterX: number = 0;
        private _emitterY: number = 0;

        private _particleMeasureRect: Rectangle;
        private _transformForMeasure: Matrix;
        private _lastRect: Rectangle;

        private _bitmapNodeList: rendering.BitmapNode[];

        public constructor(texture: Texture, emissionRate: number, maxParticles: number) {
            super();
            this._texture = texture;
            this._emissionRate = emissionRate;
            this._maxParticles = maxParticles;
            this._particles = [];
            this._particleMeasureRect = new Rectangle();
            this._transformForMeasure = new Matrix();
            this._bitmapNodeList = [];
            this.$renderNode = new rendering.GroupNode();
            // 不清除绘制数据
            this.$renderNode.cleanBeforeRender = function () { };
        }

        /**
         * 表示粒子出现点 x 坐标
         */
        public set emitterX(value: number) {
            this._emitterX = value;
        }
        public get emitterX(): number {
            return this._emitterX;
        }

        /**
         * 表示粒子出现点 y 坐标
         */
        public set emitterY(value: number) {
            this._emitterY = value;
        }
        public get emitterY(): number {
            return this._emitterY;
        }

        /**
         * 更换粒子纹理
         */
        public changeTexture(texture: Texture): void {
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
        public start(duration: number = -1): void {
            if (this._emissionRate != 0) {
                this._emissionTime = duration;
                sys.ticker.startTick(this.update, this);
            }
        }

        private update(passedTime: number): boolean {
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
            let particle: T;
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
                sys.ticker.stopTick(this.update, this);
                this.dispatchEvent(dou.Event.COMPLETE);
            }
            return false;
        }

        private addOneParticle(): void {
            let particle = this.getParticle();
            this.initParticle(particle);
            if (particle.totalTime > 0) {
                this._particles.push(particle);
                this._numParticles++;
            }
        }

        private getParticle(): T {
            return dou.recyclable(<any>this._particleClass);
        }

        protected abstract initParticle(particle: T): void;

        public abstract advanceParticle(particle: T, passedTime: number): void;

        private removeParticle(particle: T): boolean {
            let index = this._particles.indexOf(particle);
            if (index != -1) {
                (<dou.Recyclable<T>>particle).recycle();
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
        public stop(clear: boolean = false): void {
            this._emissionTime = 0;
            if (clear) {
                this.clear();
                sys.ticker.stopTick(this.update, this);
            }
        }

        public $measureContentBounds(bounds: Rectangle): void {
            if (this._numParticles > 0) {
                let texture = this._texture;
                let textureW = Math.round(texture.$getScaleBitmapWidth());
                let textureH = Math.round(texture.$getScaleBitmapHeight());
                let totalRect = dou.recyclable(Rectangle);
                let particle: T;
                for (let i = 0; i < this._numParticles; i++) {
                    particle = this._particles[i];
                    this._transformForMeasure.identity();
                    this.appendTransform(this._transformForMeasure, particle.x, particle.y, particle.scale, particle.scale, particle.rotation, 0, 0, textureW / 2, textureH / 2);
                    this._particleMeasureRect.clear();
                    this._particleMeasureRect.width = textureW;
                    this._particleMeasureRect.height = textureH;
                    let tmpRegion = dou.recyclable(ParticleRegion);
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
                    let totalRect = <any>this._lastRect;
                    bounds.set(totalRect.x, totalRect.y, totalRect.width, totalRect.height);
                    totalRect.recycle();
                    this._lastRect = null;
                }
            }
        }

        private appendTransform(matrix: Matrix, x: number, y: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number, regX: number, regY: number): Matrix {
            let cos: number, sin: number;
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

        public $updateRenderNode(): void {
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
                let particle: T;
                for (let i = 0; i < this._numParticles; i++) {
                    particle = this._particles[i];
                    let bitmapNode: rendering.BitmapNode;
                    if (!this._bitmapNodeList[i]) {
                        bitmapNode = new rendering.BitmapNode();
                        this._bitmapNodeList[i] = bitmapNode;
                        (<rendering.GroupNode>this.$renderNode).addNode(this._bitmapNodeList[i]);
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

        private clear(): void {
            while (this._particles.length) {
                this.removeParticle(this._particles[0]);
            }
            this._numParticles = 0;
            this.$renderNode.drawData.length = 0;
            this._bitmapNodeList.length = 0;
            this.$renderDirty = true;
            dou.clearPool(<any>this._particleClass);
        }
    }
}
