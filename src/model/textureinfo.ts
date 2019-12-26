/**
* 贴图信息结构
*/
export class TextureInfo {
    img: HTMLImageElement      // 图片
    id: WebGLTexture = null    // 贴图
    width: number = 0          // 宽度
    height: number = 0         // 高度
    usePremultply: boolean     // 是否进行Premult处理
    fileName: string           // 文件名
}