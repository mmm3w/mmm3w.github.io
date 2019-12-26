export namespace Utils {
    export function printLog(format: string, ...args: any[]): void {
        console.log(format.replace(/\{(\d+)\}/g, (_, k) => args[k]))
    }

    export function printMessage(message: string): void {
        printLog(message)
    }

    export class FrameDeltaTime {
        private static currentFrame = 0.0
        private static lastFrame = 0.0
        private static deltaTime = 0.0

        private static lastUpdate = Date.now()

        /**
         * 时间差（与上一帧的时间差）
         * @return 时间差[ms]
         */
        public static getDeltaTime(): number {
            return this.deltaTime
        }

        public static updateTime(): void {
            this.currentFrame = Date.now()
            this.deltaTime = (this.currentFrame - this.lastFrame) / 1000
            this.lastFrame = this.currentFrame
        }
    }

    /**
     * 创建shader
     * @param gl webgl
     */
    export function createShader(gl: any): WebGLProgram {
        let vertexShaderId = gl.createShader(gl.VERTEX_SHADER)

        if (vertexShaderId == null) {
            Utils.printLog("failed to create vertexShader")
            return null
        }

        const vertexShader: string =
            "precision mediump float" +
            "attribute vec3 position" +
            "attribute vec2 uv" +
            "varying vec2 vuv" +
            "void main(void)" +
            "{" +
            "   gl_Position = vec4(position, 1.0)" +
            "   vuv = uv" +
            "}"

        gl.shaderSource(vertexShaderId, vertexShader)
        gl.compileShader(vertexShaderId)

        let fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER)

        if (fragmentShaderId == null) {
            Utils.printLog("failed to create fragmentShader")
            return null
        }

        const fragmentShader: string =
            "precision mediump float" +
            "varying vec2 vuv" +
            "uniform sampler2D texture" +
            "void main(void)" +
            "{" +
            "   gl_FragColor = texture2D(texture, vuv)" +
            "}"

        gl.shaderSource(fragmentShaderId, fragmentShader)
        gl.compileShader(fragmentShaderId)

        //programId 生成
        let programId = gl.createProgram()
        gl.attachShader(programId, vertexShaderId)
        gl.attachShader(programId, fragmentShaderId)

        gl.deleteShader(vertexShaderId)
        gl.deleteShader(fragmentShaderId)

        // link
        gl.linkProgram(programId)

        gl.useProgram(programId)

        return programId
    }
}