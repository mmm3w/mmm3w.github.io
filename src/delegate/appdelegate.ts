import { Live2DCubismFramework as live2dcubismframework, Option as CsmOption } from "../../live2d/framework/live2dcubismframework"
import CsmCubismFramework = live2dcubismframework.CubismFramework

import { ConstantsDefine } from "../common/constants"
import { Utils } from "../common/utils"
import { ResourcesManager } from "./ResourcesManager"
import { InteractionView } from "./interactionview"
import { Controller } from "./Controller"

let instance: AppDelegate = null

export class AppDelegate {
    private _cubismOption: CsmOption
    private _resourcesManager: ResourcesManager
    private _view: InteractionView
    private _controller: Controller

    //构造函数
    constructor() {
        this._cubismOption = new CsmOption()
        this._resourcesManager = new ResourcesManager()
        this._view = new InteractionView()
        this._controller = new Controller()
    }

    //获取实例
    public static getInstance(): AppDelegate {
        if (instance == null) {
            instance = new AppDelegate()
        }
        return instance
    }

    //释放资源
    public release(): void {
        this._resourcesManager.releaseTexturesWithGL(this._view.getContext())
        this._resourcesManager.releaseAllModel()
        this._resourcesManager = null;

        this._controller.release()
        this._controller = null

        this._view.release()
        this._view = null

        CsmCubismFramework.dispose();

        instance = null
    }

    //初始化
    public initialize(): boolean {
        //初始化绘制view
        if (!this._view.initialize(<HTMLCanvasElement>document.getElementById(ConstantsDefine.CanvasID))) return false
        //初始化sdk
        if (!this.initializeSDK()) return false
        //载入模型
        this._resourcesManager.loadModel(this._view.getContext())
        this._controller.onMarkRenderUpdate()
        this._view.setResizeCallback(() => {
            this._controller.onMarkRenderUpdate()
        })
        //更新时间
        Utils.FrameDeltaTime.updateTime()
        return true
    }

    private initializeSDK() {
        this._cubismOption.logFunction = () => Utils.printMessage
        this._cubismOption.loggingLevel = ConstantsDefine.CubismLoggingLevel
        CsmCubismFramework.startUp(this._cubismOption)
        CsmCubismFramework.initialize()
        return true
    }

    public run(): void {
        // 主循环
        let loop = () => {
            if (instance == null) return
            Utils.FrameDeltaTime.updateTime()
            //更新渲染器
            this._view.render()
            //更新模型绘制
            this._controller.onUpdate(this._resourcesManager.getCurrentModel(), this._view.getCanvas(), this._view.getFrameBuffer())
            requestAnimationFrame(loop)
        }
        loop()
    }


}