namespace dou2d {
    const sourceKeyMap: { [key: string]: string } = {};

    /**
     * 自定义滤镜
     * @author wizardc
     */
    export class CustomFilter extends Filter {
        public $vertexSrc: string;
        public $fragmentSrc: string;
        public $shaderKey: string;

        protected _padding: number = 0;

        /**
         * @param vertexSrc 自定义的顶点着色器程序
         * @param fragmentSrc 自定义的片段着色器程序
         * @param uniforms 着色器中 uniform 的初始值 (key -> value), 目前仅支持数字和数组
         */
        public constructor(vertexSrc: string, fragmentSrc: string, uniforms: any = {}) {
            super("custom");
            this.$vertexSrc = vertexSrc;
            this.$fragmentSrc = fragmentSrc;
            let tempKey = vertexSrc + fragmentSrc;
            if (!sourceKeyMap[tempKey]) {
                sourceKeyMap[tempKey] = UUID.generate();
            }
            this.$shaderKey = sourceKeyMap[tempKey];
            this.$uniforms = uniforms;
            this.onPropertyChange();
        }

        /**
         * 滤镜的内边距
         * 如果自定义滤镜所需区域比原区域大 (描边等), 需要手动设置
         */
        public set padding(value: number) {
            if (this._padding == value) {
                return;
            }
            this._padding = value;
            this.onPropertyChange();
        }
        public get padding(): number {
            return this._padding;
        }

        /**
         * 着色器中 uniform 的值
         */
        public get uniforms(): any {
            return this.$uniforms;
        }

        public onPropertyChange(): void {
        }
    }
}
