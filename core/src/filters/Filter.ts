namespace dou2d {
    /**
     * 滤镜基类
     * @author wizardc
     */
    export abstract class Filter {
        private _type: string;

        protected _paddingTop: number = 0;
        protected _paddingBottom: number = 0;
        protected _paddingLeft: number = 0;
        protected _paddingRight: number = 0;

        /**
         * 会传递到片段着色器中的数据集合
         */
        public $uniforms: any;

        public constructor(type: string) {
            this._type = type;
            this.$uniforms = {};
        }

        public get type(): string {
            return this._type;
        }

        public onPropertyChange(): void {
            this.updatePadding();
        }

        protected updatePadding(): void {
        }
    }
}
