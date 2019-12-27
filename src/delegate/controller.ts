import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector"
import CsmVector = csmvector.csmVector
import { Live2DCubismFramework as cubismmatrix44 } from "../../live2d/framework/math/cubismmatrix44"
import CsmCubismMatrix44 = cubismmatrix44.CubismMatrix44


import { Live2DModel } from "../model/live2dmodel";

export class Controller {

    private _viewMatrix: CsmCubismMatrix44    // 绘制模型时用的矩阵

    constructor() {
        this._viewMatrix = new CsmCubismMatrix44()
    }

    public onUpdate(model: Live2DModel, canvas: HTMLCanvasElement, frameBuffer: WebGLFramebuffer) {
        let projection: CsmCubismMatrix44 = new CsmCubismMatrix44()
        projection.scale(1.0, canvas.width / canvas.height)
        if (this._viewMatrix != null) {
            projection.multiplyByMatrix(this._viewMatrix)
        }

        const saveProjection: CsmCubismMatrix44 = projection.clone()
        projection = saveProjection.clone()
        model.updateMyModel()
        model.draw(canvas, frameBuffer, projection)
    }

    public release(): void {
        this._viewMatrix = null;
    }
}