export namespace Utils {
    export function printLog(format: string, ...args: any[]): void {
        console.log(format.replace(/\{(\d+)\}/g, (_, k) => args[k]))
    }

    export function testLog(format: string, ...args: any[]): void {
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

    export function deleteBuffer(buffer: ArrayBuffer, path: string = "") {
        buffer = void 0
    }
}