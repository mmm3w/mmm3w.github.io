import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector";
import CsmVector = csmvector.csmVector;
import CsmVectorIterator = csmvector.iterator;

import { TextureInfo } from "../model/textureinfo"
import { LoadStep } from "./loadstep"
import { Live2DModel } from "../model/live2dmodel";

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

    export function createShader(webgl: WebGLRenderingContext): WebGLProgram {
        // バーテックスシェーダーのコンパイル
        let vertexShaderId = webgl.createShader(webgl.VERTEX_SHADER);

        if (vertexShaderId == null) {
            Utils.printLog("failed to create vertexShader");
            return null;
        }

        const vertexShader: string =
            "precision mediump float;" +
            "attribute vec3 position;" +
            "attribute vec2 uv;" +
            "varying vec2 vuv;" +
            "void main(void)" +
            "{" +
            "   gl_Position = vec4(position, 1.0);" +
            "   vuv = uv;" +
            "}";

        webgl.shaderSource(vertexShaderId, vertexShader);
        webgl.compileShader(vertexShaderId);

        // フラグメントシェーダのコンパイル
        let fragmentShaderId = webgl.createShader(webgl.FRAGMENT_SHADER);

        if (fragmentShaderId == null) {
            Utils.printLog("failed to create fragmentShader");
            return null;
        }

        const fragmentShader: string =
            "precision mediump float;" +
            "varying vec2 vuv;" +
            "uniform sampler2D texture;" +
            "void main(void)" +
            "{" +
            "   gl_FragColor = texture2D(texture, vuv);" +
            "}";

        webgl.shaderSource(fragmentShaderId, fragmentShader);
        webgl.compileShader(fragmentShaderId);

        let programId = webgl.createProgram();
        webgl.attachShader(programId, vertexShaderId);
        webgl.attachShader(programId, fragmentShaderId);

        webgl.deleteShader(vertexShaderId);
        webgl.deleteShader(fragmentShaderId);

        webgl.linkProgram(programId);

        webgl.useProgram(programId);
        return programId;
    }

    export function setupTextures(gl: WebGLRenderingContext, model: Live2DModel, textures: CsmVector<TextureInfo>): void {
        // 使用premultipliedAlpha保证iPhone的透明通道的品质
        let usePremultiply: boolean = true

        if (model.state == LoadStep.LoadTexture) {
            // 用于读取贴图
            let textureCount: number = model.getTextureCount()
            for (let modelTextureNumber = 0; modelTextureNumber < textureCount; modelTextureNumber++) {
                // 跳过没有名字的贴图
                if (model.getTextureFileName(modelTextureNumber) == "") {
                    Utils.printLog("getTextureFileName null")
                    continue
                }
                // 通过WebGL的贴图单元加载贴图
                let texturePath = model.getTextureFileName(modelTextureNumber, true)
                //加载完成时回调函数
                let onLoad = (textureInfo: TextureInfo): void => {
                    model.getRenderer().bindTexture(modelTextureNumber, textureInfo.id)

                    model.textureCount++

                    if (model.textureCount >= textureCount) {
                        // 加载结束
                        model.state = LoadStep.CompleteSetup
                    }
                }

                for (let ite: CsmVectorIterator<TextureInfo> = textures.begin(); ite.notEqual(textures.end()); ite.preIncrement()) {
                    if (ite.ptr().fileName == texturePath && ite.ptr().usePremultply == usePremultiply) {
                        // 2回目以降はキャッシュが使用される(待ち時間なし)
                        // WebKitでは同じImageのonloadを再度呼ぶには再インスタンスが必要
                        // 詳細：https://stackoverflow.com/a/5024181
                        ite.ptr().img = new Image()
                        ite.ptr().img.onload = () => {
                            onLoad(ite.ptr())
                        }
                        ite.ptr().img.src = texturePath
                        return
                    }
                }

                let img = new Image()
                img.onload = () => {
                    let tex: WebGLTexture = gl.createTexture()
                    gl.bindTexture(gl.TEXTURE_2D, tex)
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                    if (usePremultiply) {
                        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
                    }
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
                    gl.generateMipmap(gl.TEXTURE_2D)
                    gl.bindTexture(gl.TEXTURE_2D, null)
                    let textureInfo: TextureInfo = new TextureInfo()
                    if (textureInfo != null) {
                        textureInfo.fileName = texturePath
                        textureInfo.width = img.width
                        textureInfo.height = img.height
                        textureInfo.id = tex
                        textureInfo.img = img
                        textureInfo.usePremultply = usePremultiply
                        textures.pushBack(textureInfo)
                    }

                    onLoad(textureInfo)
                }
                img.src = texturePath

                model.getRenderer().setIsPremultipliedAlpha(usePremultiply)
            }
            model.state = LoadStep.WaitLoadTexture
        }
    }

    export class Throttle {
        private static lastTime = 0.0
        public static throttlefirst(callback: any) {
            let currentTime = Date.now()
            if (currentTime - this.lastTime > 1000) {
                this.lastTime = currentTime
                callback()
            }
        }

        private static firstFire: number = null

        public static throttlelast(callback: any) {
            if (this.firstFire === null) {
                this.firstFire = setTimeout(() => {
                    this.firstFire = null;
                    callback();
                }, 300);
            }
        }
    }
}