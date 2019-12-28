import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector"
import CsmVector = csmvector.csmVector
import { Live2DCubismFramework as cubismmatrix44 } from "../../live2d/framework/math/cubismmatrix44"
import CsmCubismMatrix44 = cubismmatrix44.CubismMatrix44


import { Live2DModel } from "../model/live2dmodel";
import { TouchManager } from "../delegate/touchmanager"
import { LoadStep } from "../common/loadstep";

export class Controller {

    private _viewMatrix: CsmCubismMatrix44    // 绘制模型时用的矩阵
    private _touch: TouchManager

    private _renderUpdateMark: boolean

    constructor() {
        this._viewMatrix = new CsmCubismMatrix44()
        this._touch = new TouchManager()

        this._renderUpdateMark = true
    }

    public onUpdate(model: Live2DModel, canvas: HTMLCanvasElement, frameBuffer: WebGLFramebuffer) {
        if (model.getModel() == null) return
        if (model.state == LoadStep.CompleteSetup) {

            model.updateModel()

            if (this._renderUpdateMark) {
                // canvas大小发生改变时重新设置画布矩阵
                let viewport: number[] = [
                    0,
                    0,
                    canvas.width,
                    canvas.height
                ]
                let projection: CsmCubismMatrix44 = new CsmCubismMatrix44()
                projection.scale(1.0, canvas.width / canvas.height)
                if (this._viewMatrix != null) {
                    projection.multiplyByMatrix(this._viewMatrix)
                }
                const saveProjection: CsmCubismMatrix44 = projection.clone()
                projection = saveProjection.clone()

                projection.multiplyByMatrix(model.getModelMatrix())
                model.getRenderer().setMvpMatrix(projection)
                model.getRenderer().setRenderState(frameBuffer, viewport)
                this._renderUpdateMark = false
            }
            
            model.getRenderer().drawModel()
        }
    }

    public release(): void {
        this._viewMatrix = null;
        this._touch = null;
    }

    public onMarkRenderUpdate() {
        this._renderUpdateMark = true
    }

    /*=================================================================================*/


    // public onActionDown(e: MouseEvent): void {

    // }

    // public onActionUp(e: MouseEvent): void {

    // }

    // public onActionMove(e: MouseEvent): void {

    // }




}