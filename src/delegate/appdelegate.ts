import { Live2DCubismFramework as live2dcubismframework, Option as CsmOption } from "../../Live2DFramework/Framework/live2dcubismframework"
import CsmCubismFramework = live2dcubismframework.CubismFramework

import { ConstantsDefine } from "../common/constants"
import { InteractionView } from "./interactionview"
import { TextureManager } from "./texturemanager"
import { ModelManager } from "./modelmanager"
import { Utils } from "../common/utils"

let instance: AppDelegate = null

export class AppDelegate {
    private _canvas: HTMLCanvasElement
    private _gl: any
    private _frameBuffer: WebGLFramebuffer

    private _view: InteractionView
    private _modelManager: ModelManager
    private _textureManager: TextureManager

    //构造函数
    constructor() {
        this._view = new InteractionView()
        this._modelManager = new ModelManager()
        this._textureManager = new TextureManager()
    }

    //获取实例
    public static getInstance(): AppDelegate {
        if (instance == null) {
            instance = new AppDelegate()
        }
        return instance
    }

    //释放资源
    public static release(): void {

        // instance = null
    }

    //初始化
    public initialize(): boolean {
        this._canvas = <HTMLCanvasElement>document.getElementById(ConstantsDefine.CanvasID)
        if (!this._canvas) {
            alert("Canvas initialize failed")
            this._canvas = null
            return false
        }

        this._gl = this._canvas.getContext("webgl") || this._canvas.getContext("experimental-webgl")
        if (!this._gl) {
            alert("WebGL initialize failed")
            this._gl = null
            return false
        }

        if (this._frameBuffer) {
            this._frameBuffer = this._gl.getParameter(this._gl.FRAMEBUFFER_BINDING)
        }

        this._gl.enable(this._gl.BLEND)
        this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA)

        //初始化绘制view
        this._view.initialize(this._canvas.width, this._canvas.height)
        //初始化sdk
        this.initializeCubism()
        //载入首个模型
        console.log(CsmCubismFramework.getIdManager())
        this._modelManager.changeScene(this._gl, 0)

        Utils.FrameDeltaTime.updateTime()

        this._view.initializeSprite(this._gl)

        return true
    }

    public run(): void {
        // メインループ
        let loop = () => {
            // インスタンスの有無の確認
            if (instance == null) return

            // 時間更新
            // LAppPal.updateTime();

            // 画面の初期化
            this._gl.clearColor(0.0, 0.0, 0.0, 1.0)

            // 深度テストを有効化
            this._gl.enable(this._gl.DEPTH_TEST)

            // 近くにある物体は、遠くにある物体を覆い隠す
            this._gl.depthFunc(this._gl.LEQUAL)

            // カラーバッファや深度バッファをクリアする
            this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT)

            this._gl.clearDepth(1.0)

            // 透過設定
            this._gl.enable(this._gl.BLEND)
            this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA)

            // 描画更新
            this._view.render(this._gl, () => {
                this._modelManager.onUpdate(this._canvas, this._frameBuffer)
            })

            // ループのために再帰呼び出し
            requestAnimationFrame(loop)
        }
        loop()
    }

    /******************************************************************* */
    /**
     * Cubism SDK初始化
     */
    private initializeCubism(): void {
        let cubismOption = new CsmOption()

        cubismOption.logFunction = () => Utils.printMessage
        cubismOption.loggingLevel = ConstantsDefine.CubismLoggingLevel
        CsmCubismFramework.startUp(cubismOption)
        CsmCubismFramework.initialize()
    }

}