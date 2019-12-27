import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector";
import CsmVector = csmvector.csmVector;
import CsmVectorIterator = csmvector.iterator;


import { TextureInfo } from "../model/textureinfo";
import { Live2DModel } from "../model/live2dmodel";
import { ConstantsDefine } from "../common/constants";
import { Utils } from "../common/utils";
import { ModelFactory } from "../common/ModelFactory";
import { LoadStep } from "../common/loadstep";

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

        ModelFactory.loadModel(gl, this._models.at(0), modelPath, modelJsonName, (model: Live2DModel) => {
            Utils.testLog("texture load")
            this.setupTextures(gl, model)
        })
    }

    private setupTextures(gl: WebGLRenderingContext, model: Live2DModel): void {
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

                for (let ite: CsmVectorIterator<TextureInfo> = this._textures.begin(); ite.notEqual(this._textures.end()); ite.preIncrement()) {
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
                        this._textures.pushBack(textureInfo)
                    }

                    onLoad(textureInfo)
                }
                img.src = texturePath

                model.getRenderer().setIsPremultipliedAlpha(usePremultiply)
            }
            model.state = LoadStep.WaitLoadTexture
        }
    }

}