import { Live2DCubismFramework as csmvector } from "../../Live2DFrameWork/Framework/type/csmvector"
import CsmVector = csmvector.csmVector
import CsmVectorIterator = csmvector.iterator

import { TextureInfo } from "../model/textureinfo"
/**
 * 贴图管理
 */
export class TextureManager {
    private _textures: CsmVector<TextureInfo> //贴图集合
    constructor() {
        this._textures = new CsmVector<TextureInfo>()
    }

    /************************************************************************** */
    /**
     * 释放渲染器中的贴图资源
     */
    public releaseL(gl: any): void {
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
}