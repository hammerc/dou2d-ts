namespace dou2d {
    /**
     * 发光滤镜
     * @author wizardc
     */
    export class GlowFilter extends Filter {
        protected _color: number;
        protected _red: number;
        protected _green: number;
        protected _blue: number;
        protected _alpha: number;
        protected _blurX: number;
        protected _blurY: number;
        protected _strength: number;
        protected _inner: boolean;
        protected _knockout: boolean;

        /**
         * @param color 光晕颜色
         * @param alpha 透明度
         * @param blurX 水平模糊, 有效值为 0 到 255
         * @param blurY 垂直模糊, 有效值为 0 到 255
         * @param strength 强度, 有效值为 0 到 255
         * @param inner 是否为内发光
         * @param knockout 是否具有挖空效果
         */
        public constructor(color: number = 0xff0000, alpha: number = 1, blurX: number = 6, blurY: number = 6, strength: number = 2, inner: boolean = false, knockout: boolean = false) {
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
        public set color(value: number) {
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
        public get color(): number {
            return this._color;
        }

        /**
         * 透明度
         */
        public set alpha(value: number) {
            if (this._alpha == value) {
                return;
            }
            this._alpha = value;
            this.$uniforms.alpha = value;
        }
        public get alpha(): number {
            return this._alpha;
        }

        /**
         * 水平模糊, 有效值为 0 到 255
         */
        public set blurX(value: number) {
            if (this._blurX == value) {
                return;
            }
            this._blurX = value;
            this.$uniforms.blurX = value;
            this.onPropertyChange();
        }
        public get blurX(): number {
            return this._blurX;
        }

        /**
         * 垂直模糊, 有效值为 0 到 255
         */
        public set blurY(value: number) {
            if (this._blurY == value) {
                return;
            }
            this._blurY = value;
            this.$uniforms.blurY = value;
            this.onPropertyChange();
        }
        public get blurY(): number {
            return this._blurY;
        }

        /**
         * 强度, 有效值为 0 到 255
         */
        public set strength(value: number) {
            if (this._strength == value) {
                return;
            }
            this._strength = value;
            this.$uniforms.strength = value;
        }
        public get strength(): number {
            return this._strength;
        }

        /**
         * 是否为内发光
         */
        public set inner(value: boolean) {
            if (this._inner == value) {
                return;
            }
            this._inner = value;
            this.$uniforms.inner = value ? 1 : 0;
        }
        public get inner(): boolean {
            return this._inner;
        }

        /**
         * 是否具有挖空效果
         */
        public set knockout(value: boolean) {
            if (this._knockout == value) {
                return;
            }
            this._knockout = value;
            this.$uniforms.knockout = value ? 0 : 1;
        }
        public get knockout(): boolean {
            return this._knockout;
        }

        protected updatePadding(): void {
            this._paddingLeft = this._blurX;
            this._paddingRight = this._blurX;
            this._paddingTop = this._blurY;
            this._paddingBottom = this._blurY;
        }
    }
}
