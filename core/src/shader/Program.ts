namespace dou2d {
    /**
     * 着色器程序
     * @author wizardc
     */
    export class Program {
        private static programCache: { [index: string]: Program } = {};

        public static getProgram(key: string, gl: WebGLRenderingContext, vertSource: string, fragSource: string): Program {
            if (!this.programCache[key]) {
                this.programCache[key] = new Program(gl, vertSource, fragSource);
            }
            return this.programCache[key];
        }

        public static deleteProgram(key: string): void {
            delete this.programCache[key];
        }

        public program: WebGLProgram;
        public attributes: { [index: string]: Attribute };
        public uniforms: { [index: string]: Uniform };

        private constructor(gl: WebGLRenderingContext, vertSource: string, fragSource: string) {
            let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertSource);
            let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragSource);
            this.program = this.createProgram(gl, vertexShader, fragmentShader);
            this.attributes = this.extractAttributes(gl, this.program);
            this.uniforms = this.extractUniforms(gl, this.program);
        }

        private createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
            let shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (DEBUG && !compiled) {
                console.error("shader not compiled!");
                console.error(gl.getShaderInfoLog(shader));
            }
            return shader;
        }

        private createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
            let program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            return program;
        }

        private extractAttributes(gl: WebGLRenderingContext, program: WebGLProgram): { [index: string]: Attribute } {
            let attributes: { [index: string]: Attribute } = {};
            let totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < totalAttributes; i++) {
                let attribData = gl.getActiveAttrib(program, i);
                let name = attribData.name;
                let attribute = new Attribute(gl, program, attribData);
                attributes[name] = attribute;
            }
            return attributes;
        }

        private extractUniforms(gl: WebGLRenderingContext, program: WebGLProgram): { [index: string]: Uniform } {
            let uniforms: { [index: string]: Uniform } = {};
            let totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < totalUniforms; i++) {
                let uniformData = gl.getActiveUniform(program, i);
                let name = uniformData.name;
                let uniform = new Uniform(gl, program, uniformData);
                uniforms[name] = uniform;
            }
            return uniforms;
        }
    }
}
