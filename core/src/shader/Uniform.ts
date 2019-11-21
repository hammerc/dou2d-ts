namespace dou2d {
    /**
     * 着色器参数
     * @author wizardc
     */
    export class Uniform {
        public name: string;
        public type: number;
        public size: number;
        public location: WebGLUniformLocation;
        public value: any;

        public setValue: (value: any) => void;
        public upload: () => void;

        public constructor(gl: WebGLRenderingContext, program: WebGLProgram, uniformData: WebGLActiveInfo) {
            this.name = uniformData.name;
            this.type = uniformData.type;
            this.size = uniformData.size;
            this.location = gl.getUniformLocation(program, this.name);
            this.setDefaultValue(gl);
            this.generateSetValue(gl);
            this.generateUpload(gl);
        }

        private setDefaultValue(gl: WebGLRenderingContext): void {
            switch (this.type) {
                case gl.FLOAT:
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                case gl.BOOL:
                case gl.INT:
                    this.value = 0;
                    break;
                case gl.FLOAT_VEC2:
                case gl.BOOL_VEC2:
                case gl.INT_VEC2:
                    this.value = [0, 0];
                    break;
                case gl.FLOAT_VEC3:
                case gl.BOOL_VEC3:
                case gl.INT_VEC3:
                    this.value = [0, 0, 0];
                    break;
                case gl.FLOAT_VEC4:
                case gl.BOOL_VEC4:
                case gl.INT_VEC4:
                    this.value = [0, 0, 0, 0];
                    break;
                case gl.FLOAT_MAT2:
                    this.value = new Float32Array([
                        1, 0,
                        0, 1
                    ]);
                    break;
                case gl.FLOAT_MAT3:
                    this.value = new Float32Array([
                        1, 0, 0,
                        0, 1, 0,
                        0, 0, 1
                    ]);
                    break;
                case gl.FLOAT_MAT4:
                    this.value = new Float32Array([
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ]);
                    break;
            }
        }

        private generateSetValue(gl: WebGLRenderingContext): void {
            switch (this.type) {
                case gl.FLOAT:
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                case gl.BOOL:
                case gl.INT:
                    this.setValue = (value) => {
                        let notEqual = this.value !== value;
                        this.value = value;
                        notEqual && this.upload();
                    };
                    break;
                case gl.FLOAT_VEC2:
                case gl.BOOL_VEC2:
                case gl.INT_VEC2:
                    this.setValue = (value) => {
                        let notEqual = this.value[0] !== value.x || this.value[1] !== value.y;
                        this.value[0] = value.x;
                        this.value[1] = value.y;
                        notEqual && this.upload();
                    };
                    break;
                case gl.FLOAT_VEC3:
                case gl.BOOL_VEC3:
                case gl.INT_VEC3:
                    this.setValue = (value) => {
                        this.value[0] = value.x;
                        this.value[1] = value.y;
                        this.value[2] = value.z;
                        this.upload();
                    };
                    break;
                case gl.FLOAT_VEC4:
                case gl.BOOL_VEC4:
                case gl.INT_VEC4:
                    this.setValue = (value) => {
                        this.value[0] = value.x;
                        this.value[1] = value.y;
                        this.value[2] = value.z;
                        this.value[3] = value.w;
                        this.upload();
                    };
                    break;
                case gl.FLOAT_MAT2:
                case gl.FLOAT_MAT3:
                case gl.FLOAT_MAT4:
                    this.setValue = (value) => {
                        this.value.set(value);
                        this.upload();
                    };
                    break;
            }
        }

        private generateUpload(gl: WebGLRenderingContext): void {
            switch (this.type) {
                case gl.FLOAT:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform1f(this.location, value);
                    };
                    break;
                case gl.FLOAT_VEC2:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform2f(this.location, value[0], value[1]);
                    };
                    break;
                case gl.FLOAT_VEC3:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform3f(this.location, value[0], value[1], value[2]);
                    };
                    break;
                case gl.FLOAT_VEC4:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform4f(this.location, value[0], value[1], value[2], value[3]);
                    };
                    break;
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                case gl.BOOL:
                case gl.INT:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform1i(this.location, value);
                    };
                    break;
                case gl.BOOL_VEC2:
                case gl.INT_VEC2:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform2i(this.location, value[0], value[1]);
                    };
                    break;
                case gl.BOOL_VEC3:
                case gl.INT_VEC3:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform3i(this.location, value[0], value[1], value[2]);
                    };
                    break;
                case gl.BOOL_VEC4:
                case gl.INT_VEC4:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniform4i(this.location, value[0], value[1], value[2], value[3]);
                    };
                    break;
                case gl.FLOAT_MAT2:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniformMatrix2fv(this.location, false, value);
                    };
                    break;
                case gl.FLOAT_MAT3:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniformMatrix3fv(this.location, false, value);
                    };
                    break;
                case gl.FLOAT_MAT4:
                    this.upload = () => {
                        var value = this.value;
                        gl.uniformMatrix4fv(this.location, false, value);
                    };
                    break;
            }
        }
    }
}
