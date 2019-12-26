import { Live2DCubismFramework as csmvector } from "../../Live2DFrameWork/Framework/type/csmvector"
import CsmVectorIterator = csmvector.iterator

import { TextureInfo } from "../model/textureinfo"
/**
 * 贴图创建工厂
 */
export namespace TextureFactory {
    //From CubismSdkForWeb-4-beta.2
    export function createTextureFromPngFile(gl: any, fileName: string, usePremultiply: boolean, callback: any): void {
         // search loaded texture already
         for(let ite: CsmVectorIterator<TextureInfo> = this._textures.begin(); ite.notEqual(this._textures.end()); ite.preIncrement())
         {
             if(ite.ptr().fileName == fileName && ite.ptr().usePremultply == usePremultiply)
             {
                 // 2回目以降はキャッシュが使用される(待ち時間なし)
                 // WebKitでは同じImageのonloadを再度呼ぶには再インスタンスが必要
                 // 詳細：https://stackoverflow.com/a/5024181
                 ite.ptr().img = new Image()
                 ite.ptr().img.onload = () =>
                 {
                     callback(ite.ptr())
                 }
                 ite.ptr().img.src = fileName
                 return
             }
         }
 
         // データのオンロードをトリガーにする
         let img = new Image()
         img.onload = () =>
         {
             // テクスチャオブジェクトの作成
             let tex: WebGLTexture = gl.createTexture()
 
             // テクスチャを選択
             gl.bindTexture(gl.TEXTURE_2D, tex)
 
             // テクスチャにピクセルを書き込む
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
 
             // Premult処理を行わせる
             if(usePremultiply)
             {
                 gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
             }
 
             // テクスチャにピクセルを書き込む
             gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
 
             // ミップマップを生成
             gl.generateMipmap(gl.TEXTURE_2D)
 
             // テクスチャをバインド
             gl.bindTexture(gl.TEXTURE_2D, null)
 
             let textureInfo: TextureInfo = new TextureInfo()
             if(textureInfo != null)
             {
                 textureInfo.fileName = fileName
                 textureInfo.width = img.width
                 textureInfo.height = img.height
                 textureInfo.id = tex
                 textureInfo.img = img
                 textureInfo.usePremultply = usePremultiply
                 this._textures.pushBack(textureInfo)
             }
 
             callback(textureInfo)
         }
         img.src = fileName
    }
}