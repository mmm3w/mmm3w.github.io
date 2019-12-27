import { Live2DCubismFramework as live2dcubismframework, Option as CsmOption } from "../../live2d/framework/live2dcubismframework"
import CsmCubismFramework = live2dcubismframework.CubismFramework

import { ConstantsDefine } from "../common/constants"
import { Utils } from "../common/utils"
import { ResourcesManager } from "./ResourcesManager"
import { InteractionView } from "./interactionview"
import { Controller } from "./Controller"

let instance: AppDelegate = null

export class AppDelegate {

    private _canvas: HTMLCanvasElement
    private _webgl: any
    private _frameBuffer: WebGLFramebuffer

    private _cubismOption: CsmOption
    private _resourcesManager: ResourcesManager
    private _view: InteractionView
    private _controller: Controller

    //构造函数
    constructor() {
        this._cubismOption = new CsmOption()
        this._resourcesManager = new ResourcesManager()
        this._view = new InteractionView()

        this._controller = new Controller()
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
        //初始化画布和webgl
        this._canvas = <HTMLCanvasElement>document.getElementById(ConstantsDefine.CanvasID)
        if (!this._canvas) {
            alert("Canvas initialize failed")
            this._canvas = null
            return false
        }

        this._webgl = this._canvas.getContext("webgl") || this._canvas.getContext("experimental-webgl")
        if (!this._webgl) {
            alert("WebGL initialize failed")
            this._webgl = null
            return false
        }

        if (this._frameBuffer) {
            this._frameBuffer = this._webgl.getParameter(this._webgl.FRAMEBUFFER_BINDING)
        }

        this._webgl.enable(this._webgl.BLEND)
        this._webgl.blendFunc(this._webgl.SRC_ALPHA, this._webgl.ONE_MINUS_SRC_ALPHA)

        //初始化绘制view
        this._view.initialize(this._canvas.width, this._canvas.height)

        //初始化sdk
        this._cubismOption.logFunction = () => Utils.printMessage
        this._cubismOption.loggingLevel = ConstantsDefine.CubismLoggingLevel
        CsmCubismFramework.startUp(this._cubismOption)
        CsmCubismFramework.initialize()

        //载入首个模型
        this._resourcesManager.loadModel(this._webgl)

        Utils.FrameDeltaTime.updateTime()

        this._view.initializeSprite()
        return true
    }

    public run(): void {
        // 主循环
        let loop = () => {
            if (instance == null) return
            Utils.FrameDeltaTime.updateTime()
            this._webgl.clearColor(0.0, 0.0, 0.0, 0.0)
            this._webgl.enable(this._webgl.DEPTH_TEST)
            this._webgl.depthFunc(this._webgl.LEQUAL)
            this._webgl.clear(this._webgl.COLOR_BUFFER_BIT | this._webgl.DEPTH_BUFFER_BIT)
            this._webgl.clearDepth(1.0)
            this._webgl.enable(this._webgl.BLEND)
            this._webgl.blendFunc(this._webgl.SRC_ALPHA, this._webgl.ONE_MINUS_SRC_ALPHA)
            this._view.render(this._webgl, () => {
                this._controller.onUpdate(this._resourcesManager.getCurrentModel(),this._canvas, this._frameBuffer)
            })
            requestAnimationFrame(loop)
        }
        loop()
    }


    public createShader(): WebGLProgram {
        // バーテックスシェーダーのコンパイル
        let vertexShaderId = this._webgl.createShader(this._webgl.VERTEX_SHADER);

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

        this._webgl.shaderSource(vertexShaderId, vertexShader);
        this._webgl.compileShader(vertexShaderId);

        // フラグメントシェーダのコンパイル
        let fragmentShaderId = this._webgl.createShader(this._webgl.FRAGMENT_SHADER);

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

        this._webgl.shaderSource(fragmentShaderId, fragmentShader);
        this._webgl.compileShader(fragmentShaderId);

        let programId = this._webgl.createProgram();
        this._webgl.attachShader(programId, vertexShaderId);
        this._webgl.attachShader(programId, fragmentShaderId);

        this._webgl.deleteShader(vertexShaderId);
        this._webgl.deleteShader(fragmentShaderId);

        this._webgl.linkProgram(programId);

        this._webgl.useProgram(programId);
        return programId;
    }
}