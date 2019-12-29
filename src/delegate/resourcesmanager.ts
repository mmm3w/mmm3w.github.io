import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector";
import CsmVector = csmvector.csmVector;
import CsmVectorIterator = csmvector.iterator;


import { TextureInfo } from "../model/textureinfo";
import { Live2DModel } from "../model/live2dmodel";
import { ConstantsDefine } from "../common/constants";
import { Utils } from "../common/utils";
import { ModelFactory } from "../common/ModelFactory";

export class ResourcesManager {
    private _textures: CsmVector<TextureInfo>;
    private _models: CsmVector<Live2DModel>
    private _currentModelIndex: number


    constructor() {
        this._textures = new CsmVector<TextureInfo>()
        this._models = new CsmVector<Live2DModel>()
        this._currentModelIndex = 0
    }

    public getTextures() {
        return this._textures
    }

    public getCurrentModel() {
        return this._models.at(0)
    }

    public releaseAllModel(): void {
        for (let i: number = 0; i < this._models.getSize(); i++) {
            this._models.at(i).release();
            this._models.set(i, null);
        }
        this._models.clear();
    }

    /**
    * 释放渲染器中的贴图资源
    */
    public releaseTexturesWithGL(gl: WebGLRenderingContext): void {
        for (let ite: CsmVectorIterator<TextureInfo> = this._textures.begin(); ite.notEqual(this._textures.end()); ite.preIncrement()) {
            gl.deleteTexture(ite.ptr().id)
        }
        this._textures = null
    }

    /**
     * 释放所有贴图资源
     */
    public releaseTextures(): void {
        for (let i: number = 0; i < this._textures.getSize(); i++) {
            this._textures.set(i, null)
        }
        this._textures.clear()
    }

    /**
     * 释放指定贴图资源
     * @param texture 期望释放的资源
     */
    public releaseTextureByTexture(texture: WebGLTexture) {
        for (let i: number = 0; i < this._textures.getSize(); i++) {
            if (this._textures.at(i).id != texture) {
                continue
            }

            this._textures.set(i, null)
            this._textures.remove(i)
            break
        }
    }

    /**
     * 释放指定贴图资源
     * @param fileName 期望释放的资源
     */
    public releaseTextureByFilePath(fileName: string): void {
        for (let i: number = 0; i < this._textures.getSize(); i++) {
            if (this._textures.at(i).fileName == fileName) {
                this._textures.set(i, null)
                this._textures.remove(i)
                break
            }
        }
    }

    public loadModel(gl: WebGLRenderingContext, index: number = this._currentModelIndex) {
        this._currentModelIndex = index
        Utils.testLog("[APP]model index: {0}", this._currentModelIndex)

        let model: string = ConstantsDefine.ModelDir[index]
        let modelPath: string = ConstantsDefine.ResourcesPath + model + "/"
        let modelJsonName: string = ConstantsDefine.ModelDir[index] + ".model3.json"

        this.releaseAllModel()
        this._models.pushBack(new Live2DModel())

        ModelFactory.loadModel(gl, this._models.at(0), modelPath, modelJsonName, (model: Live2DModel) => { Utils.setupTextures(gl, model, this._textures) })
    }
}