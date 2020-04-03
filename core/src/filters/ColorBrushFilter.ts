namespace dou2d {
    /**
     * 颜色刷子着色器
     * * 将显示对象刷成一种单一颜色
     * @author wizardc
     */
    export class ColorBrushFilter extends Filter {
        public constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
            super("colorBrush");
            this.$uniforms.r = r;
            this.$uniforms.g = g;
            this.$uniforms.b = b;
            this.$uniforms.a = a;
            this.onPropertyChange();
        }

        public set r(value: number) {
            this.$uniforms.r = value;
            this.onPropertyChange();
        }
        public get r(): number {
            return this.$uniforms.r;
        }

        public set g(value: number) {
            this.$uniforms.g = value;
            this.onPropertyChange();
        }
        public get g(): number {
            return this.$uniforms.g;
        }

        public set b(value: number) {
            this.$uniforms.b = value;
            this.onPropertyChange();
        }
        public get b(): number {
            return this.$uniforms.b;
        }

        public set a(value: number) {
            this.$uniforms.a = value;
            this.onPropertyChange();
        }
        public get a(): number {
            return this.$uniforms.a;
        }
    }
}
