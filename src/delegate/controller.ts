import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector"
import CsmVector = csmvector.csmVector
import { Live2DCubismFramework as cubismmatrix44 } from "../../live2d/framework/math/cubismmatrix44"
import CsmCubismMatrix44 = cubismmatrix44.CubismMatrix44


import { Live2DModel } from "../model/live2dmodel";
import { TouchManager } from "../model/touchmanager";
import { LoadStep } from "../common/loadstep";
import { ConstantsDefine } from "../common/constants";
import { ResourcesManager } from "./ResourcesManager";
import { InteractionView } from "./interactionview";

export class Controller {

    private _viewMatrix: CsmCubismMatrix44    // 绘制模型时用的矩阵
    private _touch: TouchManager
    private _captured: boolean

    private _renderUpdateMark: boolean

    private _resourcesManager: ResourcesManager
    private _view: InteractionView

    constructor(r: ResourcesManager, v: InteractionView) {
        this._viewMatrix = new CsmCubismMatrix44()
        this._viewMatrix.scale(4, 4)
        this._viewMatrix.translateY(-1)
        this._viewMatrix.translateX(1)

        this._touch = new TouchManager()
        this._captured = false
        this._renderUpdateMark = true

        this._resourcesManager = r
        this._view = v
    }

    public release(): void {
        this._viewMatrix = null
        this._touch = null

        this._resourcesManager = null
        this._view = null
    }

    public onUpdate() {
        let model = this._resourcesManager.getCurrentModel()
        let canvas = this._view.getCanvas()
        let frameBuffer = this._view.getFrameBuffer()

        if (model.getModel() == null) return
        if (model.state == LoadStep.CompleteSetup) {
            model.updateModel()
            if (this._renderUpdateMark) {
                // canvas大小发生改变时重新设置画布矩阵
                let projection: CsmCubismMatrix44 = new CsmCubismMatrix44()

                projection.scale(canvas.height / canvas.width, 1.0)
                if (this._viewMatrix != null) {
                    projection.multiplyByMatrix(this._viewMatrix)
                }
                projection.multiplyByMatrix(model.getModelMatrix())
                model.getRenderer().setMvpMatrix(projection)

                let viewport: number[] = [0, 0, canvas.width, canvas.height]
                model.getRenderer().setRenderState(frameBuffer, viewport)

                this._renderUpdateMark = false
            }

            model.getRenderer().drawModel()
        }
    }

    public onMarkRenderUpdate() {
        this._renderUpdateMark = true
    }

    public onEventDown(pointX: number, pointY: number): void {
        this._captured = true
        this._touch.touchesBegan(pointX, pointY);
    }

    public onEventMove(pointX: number, pointY: number): void {
        if (!this._captured) return
        let viewX: number = this._view.transformViewX(this._touch.getX());
        let viewY: number = this._view.transformViewY(this._touch.getY());
        this._touch.touchesMoved(pointX, pointY);
        this._resourcesManager.getCurrentModel().setDragging(viewX, viewY)

    }

    public onEventUp(pointX: number, pointY: number): void {
        this._captured = false
        let model = this._resourcesManager.getCurrentModel()
        model.setDragging(0.0, 0.0)

        let x: number = this._view.transformScreenX(this._touch.getX()); // 論理座標変換した座標を取得。
        let y: number = this._view.transformScreenX(this._touch.getY()); // 論理座標変化した座標を取得。
        this.onTap(model, x, y);
    }

    /*=================================================================================*/
    private onTap(model: Live2DModel, x: number, y: number): void {
        if (model.hitTest(ConstantsDefine.HitAreaNameHead, x, y)) {
            model.setRandomExpression()
        } else if (model.hitTest(ConstantsDefine.HitAreaNameBody, x, y)) {
            model.startRandomTapMotion(ConstantsDefine.PriorityForce);
        }
    }
}