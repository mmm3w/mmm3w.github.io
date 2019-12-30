import { Live2DCubismFramework as cubismMatrix44 } from "../../live2d/framework/math/cubismmatrix44";
import CsmCubismMatrix44 = cubismMatrix44.CubismMatrix44;
import { Live2DCubismFramework as cubismviewmatrix } from "../../live2d/framework/math/cubismviewmatrix";
import CsmCubismViewMatrix = cubismviewmatrix.CubismViewMatrix;

import { ConstantsDefine } from "../common/constants"
import { Utils } from "../common/utils";

/**
 *  负责渲染图像
 */
export class InteractionView {
    private _canvas: HTMLCanvasElement
    private _webgl: WebGLRenderingContext
    private _frameBuffer: WebGLFramebuffer

    private _bgImage: HTMLImageElement

    private _viewMatrix = new CsmCubismViewMatrix() //viewMatrix,响应移动等事件
    private _deviceToScreen: CsmCubismMatrix44    // 设备屏幕矩阵
    private _programId: WebGLProgram              // shader ID

    private _onResizeCallback: () => void

    constructor() {
        this._canvas = null
        this._webgl = null
        this._frameBuffer = null

        this._programId = null;
        // 用于将设备坐标转换为屏幕坐标
        this._deviceToScreen = new CsmCubismMatrix44()

        // 画面扩大缩小移动用矩阵
        this._viewMatrix = new CsmCubismViewMatrix()
    }

    /**
    * 释放
    */
    public release(): void {
        this._viewMatrix = null
        // this._touchManager = null;
        this._deviceToScreen = null

        this._webgl.deleteProgram(this._programId)
        this._programId = null

        this._frameBuffer = null
        this._webgl = null
        this._canvas = null
    }

    public setResizeCallback(onResizeCallback: () => void) {
        //页面发生缩放通知更新模型的渲染器
        this._onResizeCallback = onResizeCallback
    }


    public initialize(canvas: HTMLCanvasElement) {
        this._bgImage = <HTMLImageElement>document.getElementById("bgImage")
        if (this._bgImage) {
            this._bgImage.width = document.defaultView.innerWidth
            this._bgImage.height = document.defaultView.innerHeight
        }
        //初始化画布和webgl
        this._canvas = <HTMLCanvasElement>document.getElementById(ConstantsDefine.CanvasID)
        if (!canvas) {
            alert("Canvas initialize failed")
            this._canvas = null
            return false
        }
        this._canvas = canvas
        this._canvas.width = document.defaultView.innerWidth / 2
        this._canvas.height = document.defaultView.innerHeight

        this._webgl = this._canvas.getContext("webgl") //|| this._canvas.getContext("experimental-webgl")
        if (!this._webgl) {
            alert("WebGL initialize failed")
            this._webgl = null
            return false
        }

        if (!this._frameBuffer) {
            this._frameBuffer = this._webgl.getParameter(this._webgl.FRAMEBUFFER_BINDING)
        }

        this._webgl.enable(this._webgl.BLEND)
        this._webgl.blendFunc(this._webgl.SRC_ALPHA, this._webgl.ONE_MINUS_SRC_ALPHA)

        let width: number = this._canvas.width;
        let height: number = this._canvas.height;

        //初始化矩阵
        let ratio: number = this._canvas.width / this._canvas.height
        let left: number = ConstantsDefine.ViewLogicalLeft
        let right: number = ConstantsDefine.ViewLogicalRight
        let bottom: number = -ratio
        let top: number = ratio

        this._viewMatrix.setScreenRect(left, right, bottom, top)   // 设备对应的画面范围

        let screenW: number = Math.abs(left - right)
        this._deviceToScreen.scaleRelative(screenW / width, -screenW / width)
        this._deviceToScreen.translateRelative(-width * 0.5, -height * 0.5)

        // 显示范围设定
        this._viewMatrix.setMaxScale(ConstantsDefine.ViewMaxScale) // 限界拡張率
        this._viewMatrix.setMinScale(ConstantsDefine.ViewMinScale) // 限界縮小率

        // 显示最大范围
        this._viewMatrix.setMaxScreenRect(
            ConstantsDefine.ViewLogicalMaxLeft,
            ConstantsDefine.ViewLogicalMaxRight,
            ConstantsDefine.ViewLogicalMaxBottom,
            ConstantsDefine.ViewLogicalMaxTop
        )

        this.createShader()

        document.body.onresize = () => {
            this._canvas.width = document.defaultView.innerWidth / 2
            this._canvas.height = document.defaultView.innerHeight
            if (this._bgImage) {
                this._bgImage.width = document.defaultView.innerWidth
                this._bgImage.height = document.defaultView.innerHeight
            }
            if (this._onResizeCallback) this._onResizeCallback()
        }
        return true
    }

    public createShader(): void {
        if (this._programId == null) {
            this._programId = Utils.createShader(this._webgl)
        }
    }

    public render(): void {
        this._webgl.clearColor(0.0, 0.0, 0.0, 0.0)
        this._webgl.enable(this._webgl.DEPTH_TEST)
        this._webgl.depthFunc(this._webgl.LEQUAL)
        this._webgl.clear(this._webgl.COLOR_BUFFER_BIT | this._webgl.DEPTH_BUFFER_BIT)
        this._webgl.clearDepth(1.0)
        this._webgl.enable(this._webgl.BLEND)
        this._webgl.blendFunc(this._webgl.SRC_ALPHA, this._webgl.ONE_MINUS_SRC_ALPHA)
        this._webgl.useProgram(this._programId);
        this._webgl.flush();
    }

    /**
    * X座標をView座標に変換する。
    *
    * @param deviceX デバイスX座標
    */
    public transformViewX(deviceX: number): number {
        let screenX: number = this._deviceToScreen.transformX(deviceX) // 論理座標変換した座標を取得。
        return this._viewMatrix.invertTransformX(screenX)  // 拡大、縮小、移動後の値。
    }

    /**
     * Y座標をView座標に変換する。
     *
     * @param deviceY デバイスY座標
     */
    public transformViewY(deviceY: number): number {
        let screenY: number = this._deviceToScreen.transformY(deviceY) // 論理座標変換した座標を取得。
        return this._viewMatrix.invertTransformY(screenY)
    }

    /**
     * X座標をScreen座標に変換する。
     * @param deviceX デバイスX座標
     */
    public transformScreenX(deviceX: number): number {
        return this._deviceToScreen.transformX(deviceX)
    }

    /**
     * Y座標をScreen座標に変換する。
     *
     * @param deviceY デバイスY座標
     */
    public transformScreenY(deviceY: number): number {
        return this._deviceToScreen.transformY(deviceY)
    }

    //gl context provider
    public getContext() {
        return this._webgl
    }

    public getCanvas() {
        return this._canvas
    }

    public getFrameBuffer() {
        return this._frameBuffer
    }

}