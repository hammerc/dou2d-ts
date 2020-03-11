namespace dou2d {
    /**
     * 模糊滤镜
     * @author wizardc
     */
    export class BlurFilter extends Filter {
        public $blurXFilter: filter.BlurXFilter;
        public $blurYFilter: filter.BlurYFilter;

        protected _blurX: number;
        protected _blurY: number;

        /**
         * @param blurX 水平模糊量
         * @param blurY 垂直模糊量
         */
        public constructor(blurX: number = 4, blurY: number = 4) {
            super("blur");
            this._blurX = blurX;
            this._blurY = blurY;
            this.$blurXFilter = new filter.BlurXFilter(blurX);
            this.$blurYFilter = new filter.BlurYFilter(blurY);
            this.onPropertyChange();
        }

        /**
         * 水平模糊量
         */
        public set blurX(value: number) {
            if (this._blurX == value) {
                return;
            }
            this._blurX = value;
            this.$blurXFilter.blurX = value;
            this.onPropertyChange();
        }
        public get blurX(): number {
            return this._blurX;
        }

        /**
         * 垂直模糊量
         */
        public set blurY(value: number) {
            if (this._blurY == value) {
                return;
            }
            this._blurY = value;
            this.$blurYFilter.blurY = value;
            this.onPropertyChange();
        }
        public get blurY(): number {
            return this._blurY;
        }

        protected updatePadding(): void {
            this._paddingLeft = this._blurX;
            this._paddingRight = this._blurX;
            this._paddingTop = this._blurY;
            this._paddingBottom = this._blurY;
        }
    }

    export namespace filter {
        /**
         * @private
         */
        export class BlurXFilter extends Filter {
            public constructor(blurX: number = 4) {
                super("blurX");

                this.$uniforms.blur = { x: blurX, y: 0 };
                this.onPropertyChange();
            }

            public set blurX(value: number) {
                this.$uniforms.blur.x = value;
            }
            public get blurX(): number {
                return this.$uniforms.blur.x;
            }
        }

        /**
         * @private
         */
        export class BlurYFilter extends Filter {
            public constructor(blurY: number = 4) {
                super("blurY");
                this.$uniforms.blur = { x: 0, y: blurY };
                this.onPropertyChange();
            }

            public set blurY(value: number) {
                this.$uniforms.blur.y = value;
            }
            public get blurY(): number {
                return this.$uniforms.blur.y;
            }
        }
    }
}
