namespace dou2d {
    /**
     * 投影滤镜
     * @author wizardc
     */
    export class DropShadowFilter extends GlowFilter {
        protected _distance: number;
        protected _angle: number;
        protected _hideObject: boolean;

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
        public constructor(distance: number = 4, angle: number = 45, color: number = 0, alpha: number = 1, blurX: number = 4, blurY: number = 4, strength: number = 1, inner: boolean = false, knockout: boolean = false, hideObject: boolean = false) {
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
        public set distance(value: number) {
            if (this._distance == value) {
                return;
            }
            this._distance = value;
            this.$uniforms.dist = value;
            this.onPropertyChange();
        }
        public get distance(): number {
            return this._distance;
        }

        /**
         * 阴影的角度
         */
        public set angle(value: number) {
            if (this._angle == value) {
                return;
            }
            this._angle = value;
            this.$uniforms.angle = value / 180 * Math.PI;
            this.onPropertyChange();
        }
        public get angle(): number {
            return this._angle;
        }

        /**
         * 是否隐藏对象
         */
        public set hideObject(value: boolean) {
            if (this._hideObject == value) {
                return;
            }
            this._hideObject = value;
            this.$uniforms.hideObject = value ? 1 : 0;
        }
        public get hideObject(): boolean {
            return this._hideObject;
        }

        protected updatePadding(): void {
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
}
