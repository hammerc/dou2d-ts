namespace dou2d {
    /**
     * 着色器属性
     * @author wizardc
     */
    export class Attribute {
        public name: string;
        public type: number;
        public size: number;
        public location: number;
        public count: number;
        public format: number;

        public constructor(gl: WebGLRenderingContext, program: WebGLProgram, attributeData: WebGLActiveInfo) {
            this.name = attributeData.name;
            this.type = attributeData.type;
            this.size = attributeData.size;
            this.location = gl.getAttribLocation(program, this.name);
            this.count = 0;
            this.format = gl.FLOAT;
            this.initCount(gl);
            this.initFormat(gl);
        }

        private initCount(gl: WebGLRenderingContext): void {
            switch (this.type) {
                case gl.FLOAT:
                case gl.BYTE:
                case gl.UNSIGNED_BYTE:
                case gl.UNSIGNED_SHORT:
                    this.count = 1;
                    break;
                case gl.FLOAT_VEC2:
                    this.count = 2;
                    break;
                case gl.FLOAT_VEC3:
                    this.count = 3;
                    break;
                case gl.FLOAT_VEC4:
                    this.count = 4;
                    break;
            }
        }

        private initFormat(gl: WebGLRenderingContext): void {
            switch (this.type) {
                case gl.FLOAT:
                case gl.FLOAT_VEC2:
                case gl.FLOAT_VEC3:
                case gl.FLOAT_VEC4:
                    this.format = gl.FLOAT;
                    break;
                case gl.UNSIGNED_BYTE:
                    this.format = gl.UNSIGNED_BYTE;
                    break;
                case gl.UNSIGNED_SHORT:
                    this.format = gl.UNSIGNED_SHORT;
                    break;
                case gl.BYTE:
                    this.format = gl.BYTE;
                    break;
            }
        }
    }
}
