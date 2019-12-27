// import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector"
// import CsmVector = csmvector.csmVector
// import { Live2DCubismFramework as cubismmatrix44 } from "../../live2d/framework/math/cubismmatrix44"
// import CsmCubismMatrix44 = cubismmatrix44.CubismMatrix44

// import { Live2DModel } from "../model/live2dmodel"
// import { ConstantsDefine } from "../common/constants"
// import { Utils } from "../common/utils"
// /**
//  * 模型对象和资源对象管理
//  */
// export class ModelManager {
//     private _models: CsmVector<Live2DModel> //模型集合
//     private _sceneIndex: number                // 当前的模型
//     private _viewMatrix: CsmCubismMatrix44    // 绘制模型时用的矩阵

//     constructor() {
//         this._models = new CsmVector<Live2DModel>()

//         this._viewMatrix = new CsmCubismMatrix44()
//         this._sceneIndex = 0
//     }

//     /**
//      * 释放所有模型资源
//      */
//     public releaseAllModel(): void {
//         for (let i: number = 0; i < this._models.getSize(); i++) {
//             this._models.at(i).release()
//             this._models.set(i, null)
//         }
//         this._models.clear()
//     }

//     /**
//      * 获取模型。
//      *
//      * @param no 模型列表的index値
//      * @return 返回实例。找不到则返回null。
//      */
//     public getModel(no: number): Live2DModel {
//         if (no < this._models.getSize()) {
//             return this._models.at(no)
//         }
//         return null
//     }
//     /************************************************************************** */
//     /**
//      * 以下是可能需要从此处迁移的部分
//      */

//     /**
//      * 处理拖拽事件
//      *
//      * @param x 画面X坐标
//      * @param y 画面Y坐标
//      */
//     public onDrag(x: number, y: number): void {
//         for (let i: number = 0; i < this._models.getSize(); i++) {
//             let model: Live2DModel = this.getModel(i)
//             if (model) {
//                 model.setDragging(x, y)
//             }
//         }
//     }

//     /**
//      * 处理tap事件
//      *
//      * @param x 画面X坐标
//      * @param y 画面Y坐标
//      */
//     public onTap(x: number, y: number): void {
//         if (ConstantsDefine.DebugLogEnable) {
//             Utils.printLog("[APP]tap point: {x: {0} y: {1}}", x.toFixed(2), y.toFixed(2))
//         }

//         for (let i: number = 0; i < this._models.getSize(); i++) {
//             if (this._models.at(i).hitTest(ConstantsDefine.HitAreaNameHead, x, y)) {
//                 if (ConstantsDefine.DebugLogEnable) {
//                     Utils.printLog("[APP]hit area: [{0}]", ConstantsDefine.HitAreaNameHead)
//                 }
//                 this._models.at(i).setRandomExpression()
//             }
//             else if (this._models.at(i).hitTest(ConstantsDefine.HitAreaNameBody, x, y)) {
//                 if (ConstantsDefine.DebugLogEnable) {
//                     Utils.printLog("[APP]hit area: [{0}]", ConstantsDefine.HitAreaNameBody)
//                 }
//                 this._models.at(i).startRandomMotion(ConstantsDefine.MotionGroupTapBody, ConstantsDefine.PriorityNormal)
//             }
//         }
//     }

//     /**
//      * 画面更新时处理，
//      * 更新模型以及重新绘制
//      */
//     public onUpdate(canvas: HTMLCanvasElement, frameBuffer: WebGLFramebuffer): void {
//         let projection: CsmCubismMatrix44 = new CsmCubismMatrix44()

//         let width: number, height: number
//         width = canvas.width
//         height = canvas.height
//         projection.scale(1.0, width / height)

//         if (this._viewMatrix != null) {
//             projection.multiplyByMatrix(this._viewMatrix)
//         }

//         const saveProjection: CsmCubismMatrix44 = projection.clone()
//         let modelCount: number = this._models.getSize()

//         for (let i: number = 0; i < modelCount; ++i) {
//             let model: Live2DModel = this.getModel(i)
//             projection = saveProjection.clone()

//             model.update()
//             model.draw(canvas, frameBuffer, projection)
//         }
//     }

//     /**
//      * 示例中时切换模型
//      */
//     public nextScene(gl: any): void {
//         let no: number = (this._sceneIndex + 1) % ConstantsDefine.ModelDirSize
//         this.changeScene(no, gl)
//     }

//     /**
//      * 示例中时切换模型
//      */
//     public changeScene(gl: any, index: number): void {
//         this._sceneIndex = index
//         if (ConstantsDefine.DebugLogEnable) {
//             Utils.printLog("[APP]model index: {0}", this._sceneIndex)
//         }

//         // ModelDir[]保存模型文件夹名
//         // 确定model3.json的path
//         // 文件夹名请和model3.json的名字保持一直
//         let model: string = ConstantsDefine.ModelDir[index]
//         let modelPath: string = ConstantsDefine.ResourcesPath + model + "/"
//         let modelJsonName: string = ConstantsDefine.ModelDir[index]
//         modelJsonName += ".model3.json"

//         this.releaseAllModel()
//         this._models.pushBack(new Live2DModel())
//         // this._models.at(0).loadAssets(gl, modelPath, modelJsonName)
//     }


// }