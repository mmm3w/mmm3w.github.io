import { Live2DCubismFramework as cubismMatrix44 } from "../../Live2DFramework/Framework/math/cubismmatrix44";
import CsmCubismMatrix44 = cubismMatrix44.CubismMatrix44;
import { Live2DCubismFramework as cubismviewmatrix } from "../../Live2DFramework/Framework/math/cubismviewmatrix";
import CsmCubismViewMatrix = cubismviewmatrix.CubismViewMatrix;

import { ConstantsDefine } from "../common/constants"
import { Utils } from "../common/utils";

/**
 *  只负责渲染图像
 */
export class InteractionView {

    private _viewMatrix = new CsmCubismViewMatrix() //viewMatrix
    private _deviceToScreen: CsmCubismMatrix44    // 设备屏幕矩阵
    private _programId: WebGLProgram              // shader ID

    constructor() {
        this._programId = null;
        // 用于将设备坐标转换为屏幕坐标
        this._deviceToScreen = new CsmCubismMatrix44()

        // 画面扩大缩小移动用矩阵
        this._viewMatrix = new CsmCubismViewMatrix()
    }

    //初始化矩阵
    public initialize(width: number, height: number): void {
        let ratio: number = height / width
        let left: number = ConstantsDefine.ViewLogicalLeft
        let right: number = ConstantsDefine.ViewLogicalRight
        let bottom: number = -ratio
        let top: number = ratio

        this._viewMatrix.setScreenRect(left, right, bottom, top)   // 设备对应的画面范围

        let screenW: number = Math.abs(left - right)
        this._deviceToScreen.scaleRelative(screenW / width, -screenW / width)
        this._deviceToScreen.translateRelative(-width * 0.5, -height * 0.5)

        // 表示範囲の設定
        this._viewMatrix.setMaxScale(ConstantsDefine.ViewMaxScale) // 限界拡張率
        this._viewMatrix.setMinScale(ConstantsDefine.ViewMinScale) // 限界縮小率

        // 表示できる最大範囲
        this._viewMatrix.setMaxScreenRect(
            ConstantsDefine.ViewLogicalMaxLeft,
            ConstantsDefine.ViewLogicalMaxRight,
            ConstantsDefine.ViewLogicalMaxBottom,
            ConstantsDefine.ViewLogicalMaxTop
        )
    }

    public initializeSprite(gl: any): void {
        if (this._programId == null) {
            this._programId = Utils.createShader(gl)
        }
    }

    /**
    * 释放
    */
    public release(gl: any): void {
        this._viewMatrix = null
        // this._touchManager = null;
        this._deviceToScreen = null

        gl.deleteProgram(this._programId)
        this._programId = null
    }

    public render(gl: any, callback: any): void {
        gl.useProgram(this._programId);

        gl.flush();


        callback() //此处回调更新模型
        // let live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();

        // live2DManager.onUpdate();
    }
}