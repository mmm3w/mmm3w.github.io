import { Live2DCubismFramework as cubismusermodel } from "../../Live2DFrameWork/Framework/model/cubismusermodel"
import CubismUserModel = cubismusermodel.CubismUserModel
import { Live2DCubismFramework as icubismmodelsetting } from "../../Live2DFrameWork/Framework/icubismmodelsetting"
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting
import { Live2DCubismFramework as cubismmodelsettingjson } from "../../Live2DFrameWork/Framework/cubismmodelsettingjson"
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson
import { Live2DCubismFramework as acubismmotion } from "../../Live2DFrameWork/Framework/motion/acubismmotion"
import ACubismMotion = acubismmotion.ACubismMotion
import { Live2DCubismFramework as csmmap } from "../../Live2DFrameWork/Framework/type/csmmap"
import CsmMap = csmmap.csmMap
import { Live2DCubismFramework as cubismeyeblink } from "../../Live2DFrameWork/Framework/effect/cubismeyeblink"
import CubismEyeBlink = cubismeyeblink.CubismEyeBlink
import { Live2DCubismFramework as cubismbreath } from "../../Live2DFrameWork/Framework/effect/cubismbreath"
import CubismBreath = cubismbreath.CubismBreath
import BreathParameterData = cubismbreath.BreathParameterData
import { Live2DCubismFramework as csmvector } from "../../Live2DFrameWork/Framework/type/csmvector"
import CsmVector = csmvector.csmVector
import { Live2DCubismFramework as live2dcubismframework } from "../../Live2DFrameWork/Framework/live2dcubismframework"
import CubismFramework = live2dcubismframework.CubismFramework
import { Live2DCubismFramework as cubismdefaultparameterid } from "../../Live2DFrameWork/Framework/cubismdefaultparameterid"
import CubismDefaultParameterId = cubismdefaultparameterid
import { Live2DCubismFramework as cubismid } from "../../Live2DFrameWork/Framework/id/cubismid"
import CubismIdHandle = cubismid.CubismIdHandle
import { Live2DCubismFramework as cubismstring } from "../../Live2DFrameWork/Framework/utils/cubismstring"
import CubismString = cubismstring.CubismString
import { Live2DCubismFramework as cubismmotion } from "../../Live2DFrameWork/Framework/motion/cubismmotion"
import CubismMotion = cubismmotion.CubismMotion
import { Live2DCubismFramework as cubismmotionqueuemanager } from "../../Live2DFrameWork/Framework/motion/cubismmotionqueuemanager"
import CubismMotionQueueEntryHandle = cubismmotionqueuemanager.CubismMotionQueueEntryHandle
import InvalidMotionQueueEntryHandleValue = cubismmotionqueuemanager.InvalidMotionQueueEntryHandleValue
import { CubismLogInfo } from "../../Live2DFrameWork/Framework/utils/cubismdebug"
import { Live2DCubismFramework as csmstring } from "../../Live2DFrameWork/Framework/type/csmstring"
import CsmString = csmstring.csmString
import { Live2DCubismFramework as csmrect } from "../../Live2DFrameWork/Framework/type/csmrectf"
import CsmRect = csmrect.csmRect
import { Live2DCubismFramework as cubismmatrix44 } from "../../Live2DFrameWork/Framework/math/cubismmatrix44"
import CubismMatrix44 = cubismmatrix44.CubismMatrix44

import { TextureInfo } from "../model/textureinfo"
import { LoadStep } from "../common/loadstep"
import { Utils } from "../common/utils"
import FrameDeltaTime = Utils.FrameDeltaTime
import { TextureFactory } from "../common/texturefactory"
import { ConstantsDefine } from "../common/constants"

//From CubismSdkForWeb-4-beta.2
export class Live2DModel extends CubismUserModel {

    private _state: number //模型所处状态
    private _modelHomeDir: string //模型配置所在文件夹
    private _modelSetting: ICubismModelSetting //模型配置信息

    private _expressions: CsmMap<string, ACubismMotion> //获取的表情列表
    private _expressionCount: number // 表情的数量
    private _motions: CsmMap<string, ACubismMotion> // 获取的动作列表
    private _motionCount: number   // 动作数量
    private _allMotionCount: number // 动作总数
    private _textureCount: number   // 贴图数量

    private _userTimeSeconds: number   // 时间累计值[秒]

    private _idParamAngleX: CubismIdHandle     // 参数ID: ParamAngleX
    private _idParamAngleY: CubismIdHandle     // 参数ID: ParamAngleY
    private _idParamAngleZ: CubismIdHandle     // 参数ID: ParamAngleZ
    private _idParamEyeBallX: CubismIdHandle   // 参数ID: ParamEyeBallX
    private _idParamEyeBallY: CubismIdHandle   // 参数ID: ParamEyeBAllY
    private _idParamBodyAngleX: CubismIdHandle // 参数ID: ParamBodyAngleX

    private _eyeBlinkIds: CsmVector<CubismIdHandle>  // 模型设置中眨眼使用的param id
    private _lipSyncIds: CsmVector<CubismIdHandle>   // 模型设置中口型使用的param id

    //暂时没有作用
    private _hitArea: CsmVector<CsmRect>
    private _userArea: CsmVector<CsmRect>

    constructor() {
        super()

        this._state = LoadStep.LoadAssets
        this._modelHomeDir = null
        this._modelSetting = null

        this._expressions = new CsmMap<string, ACubismMotion>()
        this._expressionCount = 0
        this._motions = new CsmMap<string, ACubismMotion>()
        this._motionCount = 0
        this._allMotionCount = 0
        this._textureCount = 0

        this._userTimeSeconds = 0.0

        this._idParamAngleX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleX)
        this._idParamAngleY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleY)
        this._idParamAngleZ = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleZ)
        this._idParamEyeBallX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallX)
        this._idParamEyeBallY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallY)
        this._idParamBodyAngleX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBodyAngleX)

        this._eyeBlinkIds = new CsmVector<CubismIdHandle>()
        this._lipSyncIds = new CsmVector<CubismIdHandle>()


        this._hitArea = new CsmVector<CsmRect>()
        this._userArea = new CsmVector<CsmRect>()
    }

    /**
     * 通过存放model3.json的文件夹路径加载模型
     * @param dir
     * @param fileName
     */
    public loadAssets(gl: any, dir: string, fileName: string): void {
        this._modelHomeDir = dir

        const path: string = dir + fileName

        fetch(path).then((response) => response.arrayBuffer()).then(
            (arrayBuffer) => {
                let buffer: ArrayBuffer = arrayBuffer
                let size = buffer.byteLength
                let setting: ICubismModelSetting = new CubismModelSettingJson(buffer, size)

                // 状态更新を更新
                this._state = LoadStep.LoadModel

                // 装载模型
                this.setupModel(gl, setting)
            }
        )
    }

    /**
     * 重建渲染器
     */
    public reloadRenderer(gl: any): void {
        this.deleteRenderer()
        this.createRenderer()
        this.setupTextures(gl)
    }

    /**
     * 更新
     */
    public update(): void {
        if (this._state != LoadStep.CompleteSetup) return

        const deltaTimeSeconds: number = FrameDeltaTime.getDeltaTime()
        this._userTimeSeconds += deltaTimeSeconds


        this._dragManager.update(deltaTimeSeconds)
        this._dragX = this._dragManager.getX()
        this._dragY = this._dragManager.getY()

        // 是否通过运动更新参数
        let motionUpdated = false

        //--------------------------------------------------------------------------
        this._model.loadParameters()   // 加载上次保存的状态
        if (this._motionManager.isFinished()) {
            // 没有播放动作时、随机播放待机动作
            this.startRandomMotion(ConstantsDefine.MotionGroupIdle, ConstantsDefine.PriorityIdle)
        }
        else {
            motionUpdated = this._motionManager.updateMotion(this._model, deltaTimeSeconds)    // 动作更新
        }
        this._model.saveParameters() // 保存状态
        //--------------------------------------------------------------------------

        // 眨眼
        if (!motionUpdated) {
            if (this._eyeBlink != null) {
                // 主动作未更新时
                this._eyeBlink.updateParameters(this._model, deltaTimeSeconds)
            }
        }

        if (this._expressionManager != null) {
            this._expressionManager.updateMotion(this._model, deltaTimeSeconds) // 更新表情参数（相对变化）
        }

        // 拖拽时变化
        // 拖拽时改变脸的朝向
        this._model.addParameterValueById(this._idParamAngleX, this._dragX * 30)  // 值在-30~30之间变更
        this._model.addParameterValueById(this._idParamAngleY, this._dragY * 30)
        this._model.addParameterValueById(this._idParamAngleZ, this._dragX * this._dragY * -30)

        // 拖拽时改变身体的朝向
        this._model.addParameterValueById(this._idParamBodyAngleX, this._dragX * 10)  // 值在-10~10之间变更

        // 拖拽时改变眼睛的方向
        this._model.addParameterValueById(this._idParamEyeBallX, this._dragX) // 值在-1~1之间变更
        this._model.addParameterValueById(this._idParamEyeBallY, this._dragY)

        // 呼吸
        if (this._breath != null) {
            this._breath.updateParameters(this._model, deltaTimeSeconds)
        }

        // 物理计算设置
        if (this._physics != null) {
            this._physics.evaluate(this._model, deltaTimeSeconds)
        }

        // 口型设定
        if (this._lipsync) {
            let value: number = 0  // 要设置口型时，请从系统获取音量并输入0到1之间的值。

            for (let i: number = 0; i < this._lipSyncIds.getSize(); ++i) {
                this._model.addParameterValueById(this._lipSyncIds.at(i), value, 0.8)
            }
        }

        // 姿势设定
        if (this._pose != null) {
            this._pose.updateParameters(this._model, deltaTimeSeconds)
        }

        this._model.update()
    }

    /**
     * 播放指定动作
     * @param group 动作组名
     * @param no 组内编号
     * @param priority 优先度
     * @return 开始的东西的id。其他动作听过isFinished()进行判断是否结束。为开始时是[-1]
     */
    public startMotion(group: string, no: number, priority: number): CubismMotionQueueEntryHandle {
        if (priority == ConstantsDefine.PriorityForce) {
            this._motionManager.setReservePriority(priority)
        }
        else if (!this._motionManager.reserveMotion(priority)) {
            if (this._debugMode) {
                Utils.printLog("[APP]can't start motion.")
            }
            return InvalidMotionQueueEntryHandleValue
        }

        const fileName: string = this._modelSetting.getMotionFileName(group, no)

        // ex) idle_0
        let name: string = CubismString.getFormatedString("{0}_{1}", group, no)
        let motion: CubismMotion = <CubismMotion>this._motions.getValue(name)
        let autoDelete: boolean = false

        if (motion == null) {
            let path: string = fileName
            path = this._modelHomeDir + path

            fetch(path).then((response) => response.arrayBuffer()).then(
                (arrayBuffer) => {
                    let buffer: ArrayBuffer = arrayBuffer
                    let size = buffer.byteLength

                    motion = <CubismMotion>this.loadMotion(buffer, size, null)
                    let fadeTime: number = this._modelSetting.getMotionFadeInTimeValue(group, no)

                    if (fadeTime >= 0.0) {
                        motion.setFadeInTime(fadeTime)
                    }

                    fadeTime = this._modelSetting.getMotionFadeOutTimeValue(group, no)
                    if (fadeTime >= 0.0) {
                        motion.setFadeOutTime(fadeTime)
                    }

                    motion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds)
                    autoDelete = true  // 終了時にメモリから削除

                    this.deleteBuffer(buffer, path)
                }
            )
        }

        if (this._debugMode) {
            Utils.printLog("[APP]start motion: [{0}_{1}", group, no)
        }
        return this._motionManager.startMotionPriority(motion, autoDelete, priority)
    }

    /**
     * 开始一个随机的动作
     * @param group 动作名
     * @param priority 优先度
     * @return 开始的东西的id。其他动作听过isFinished()进行判断是否结束。为开始时是[-1]
     */
    public startRandomMotion(group: string, priority: number): CubismMotionQueueEntryHandle {
        if (this._modelSetting.getMotionCount(group) == 0) {
            return InvalidMotionQueueEntryHandleValue
        }
        let no: number = Math.floor(Math.random() * this._modelSetting.getMotionCount(group))
        return this.startMotion(group, no, priority)
    }

    /**
     * 设置指定的表情
     *
     * @param expressionId 表情动作的ID
     */
    public setExpression(expressionId: string): void {
        let motion: ACubismMotion = this._expressions.getValue(expressionId)

        if (this._debugMode) {
            Utils.printLog("[APP]expression: [{0}]", expressionId)
        }

        if (motion != null) {
            this._expressionManager.startMotionPriority(motion, false, ConstantsDefine.PriorityForce)
        }
        else {
            if (this._debugMode) {
                Utils.printLog("[APP]expression[{0}] is null", expressionId)
            }
        }
    }

    /**
     * 设置一个随机表情
     */
    public setRandomExpression(): void {
        if (this._expressions.getSize() == 0) {
            return
        }
        let no: number = Math.floor(Math.random() * this._expressions.getSize())

        for (let i: number = 0; i < this._expressions.getSize(); i++) {
            if (i == no) {
                let name: string = this._expressions._keyValues[i].first
                this.setExpression(name)
                return
            }
        }
    }

    /**
     * 触发一些事件
     */
    public motionEventFired(eventValue: CsmString): void {
        CubismLogInfo("{0} is fired on LAppModel!!", eventValue.s)
    }

    /**
     * 碰撞检测
     * 计算指定id的矩形进行碰撞检测
     *
     * @param hitArenaName  需要检测的对象的id
     * @param x             判定を行うX座標
     * @param y             判定を行うY座標
     */
    public hitTest(hitArenaName: string, x: number, y: number): boolean {
        // 透明时无碰撞
        if (this._opacity < 1) {
            return false
        }
        const count: number = this._modelSetting.getHitAreasCount()
        for (let i: number = 0; i < count; i++) {
            if (this._modelSetting.getHitAreaName(i) == hitArenaName) {
                const drawId: CubismIdHandle = this._modelSetting.getHitAreaId(i)
                return this.isHit(drawId, x, y)
            }
        }
        return false
    }

    ///////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 通过model3.json装载模型
     * 根据model3.json的内容生成模型，动作，物理计算等相关组件
     *
     * @param setting ICubismModelSetting的实例
     */
    private setupModel(gl: any, setting: ICubismModelSetting): void {
        this._updating = true
        this._initialized = false
        this._modelSetting = setting

        let buffer: ArrayBuffer
        let size: number

        // CubismModel
        if (this._modelSetting.getModelFileName() != "") {
            let path: string = this._modelSetting.getModelFileName()
            path = this._modelHomeDir + path

            fetch(path).then((response) => response.arrayBuffer()).then(
                (arrayBuffer) => {
                    buffer = arrayBuffer
                    this.loadModel(buffer)
                    this.deleteBuffer(buffer, path)
                    this._state = LoadStep.LoadExpression
                    // callback
                    loadCubismExpression()
                }
            )
            this._state = LoadStep.WaitLoadModel
        }
        else {
            Utils.printLog("Model data does not exist.")
        }

        // Expression
        let loadCubismExpression = () => {
            if (this._modelSetting.getExpressionCount() > 0) {
                const count: number = this._modelSetting.getExpressionCount()

                for (let i: number = 0; i < count; i++) {
                    let name: string = this._modelSetting.getExpressionName(i)
                    let path: string = this._modelSetting.getExpressionFileName(i)
                    path = this._modelHomeDir + path

                    fetch(path).then((response) => response.arrayBuffer()).then(
                        (arrayBuffer) => {
                            let buffer: ArrayBuffer = arrayBuffer
                            let size: number = buffer.byteLength

                            let motion: ACubismMotion = this.loadExpression(buffer, size, name)

                            if (this._expressions.getValue(name) != null) {
                                ACubismMotion.delete(this._expressions.getValue(name))
                                this._expressions.setValue(name, null)
                            }

                            this._expressions.setValue(name, motion)

                            this.deleteBuffer(buffer, path)

                            this._expressionCount++

                            if (this._expressionCount >= count) {
                                this._state = LoadStep.LoadPhysics

                                // callback
                                loadCubismPhysics()
                            }
                        }
                    )
                }
                this._state = LoadStep.WaitLoadExpression
            }
            else {
                this._state = LoadStep.LoadPhysics

                // callback
                loadCubismPhysics()
            }
        }

        // Physics
        let loadCubismPhysics = () => {
            if (this._modelSetting.getPhysicsFileName() != "") {
                let path: string = this._modelSetting.getPhysicsFileName()
                path = this._modelHomeDir + path

                fetch(path).then((response) => response.arrayBuffer()).then(
                    (arrayBuffer) => {
                        let buffer: ArrayBuffer = arrayBuffer
                        let size: number = buffer.byteLength

                        this.loadPhysics(buffer, size)
                        this.deleteBuffer(buffer, path)

                        this._state = LoadStep.LoadPose

                        // callback
                        loadCubismPose()
                    }
                )
                this._state = LoadStep.WaitLoadPhysics
            }
            else {
                this._state = LoadStep.LoadPose

                // callback
                loadCubismPose()
            }
        }

        // Pose
        let loadCubismPose = () => {
            if (this._modelSetting.getPoseFileName() != "") {
                let path: string = this._modelSetting.getPoseFileName()
                path = this._modelHomeDir + path

                fetch(path).then((response) => response.arrayBuffer()).then(
                    (arrayBuffer) => {
                        let buffer: ArrayBuffer = arrayBuffer
                        let size: number = buffer.byteLength

                        this.loadPose(buffer, size)
                        this.deleteBuffer(buffer, path)

                        this._state = LoadStep.SetupEyeBlink

                        // callback
                        setupEyeBlink()
                    }
                )
                this._state = LoadStep.WaitLoadPose
            }
            else {
                this._state = LoadStep.SetupEyeBlink

                // callback
                setupEyeBlink()
            }
        }

        // EyeBlink
        let setupEyeBlink = () => {
            if (this._modelSetting.getEyeBlinkParameterCount() > 0) {
                this._eyeBlink = CubismEyeBlink.create(this._modelSetting)
                this._state = LoadStep.SetupBreath
            }

            // callback
            setupBreath()
        }

        // Breath
        let setupBreath = () => {
            this._breath = CubismBreath.create()

            let breathParameters: CsmVector<BreathParameterData> = new CsmVector()
            breathParameters.pushBack(new BreathParameterData(this._idParamAngleX, 0.0, 15.0, 6.5345, 0.5))
            breathParameters.pushBack(new BreathParameterData(this._idParamAngleY, 0.0, 8.0, 3.5345, 0.5))
            breathParameters.pushBack(new BreathParameterData(this._idParamAngleZ, 0.0, 10.0, 5.5345, 0.5))
            breathParameters.pushBack(new BreathParameterData(this._idParamBodyAngleX, 0.0, 4.0, 15.5345, 0.5))
            breathParameters.pushBack(new BreathParameterData(CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBreath), 0.0, 0.5, 3.2345, 0.5))

            this._breath.setParameters(breathParameters)
            this._state = LoadStep.LoadUserData

            // callback
            loadUserData()
        }

        // UserData
        let loadUserData = () => {
            if (this._modelSetting.getUserDataFile() != "") {
                let path: string = this._modelSetting.getUserDataFile()
                path = this._modelHomeDir + path

                fetch(path).then((response) => response.arrayBuffer()).then(
                    (arrayBuffer) => {
                        let buffer: ArrayBuffer = arrayBuffer
                        let size: number = buffer.byteLength

                        this.loadUserData(buffer, size)
                        this.deleteBuffer(buffer, path)

                        this._state = LoadStep.SetupEyeBlinkIds

                        // callback
                        setupEyeBlinkIds()
                    }
                )

                this._state = LoadStep.WaitLoadUserData
            }
            else {
                this._state = LoadStep.SetupEyeBlinkIds

                // callback
                setupEyeBlinkIds()
            }
        }

        // EyeBlinkIds
        let setupEyeBlinkIds = () => {
            let eyeBlinkIdCount: number = this._modelSetting.getEyeBlinkParameterCount()

            for (let i: number = 0; i < eyeBlinkIdCount; ++i) {
                this._eyeBlinkIds.pushBack(this._modelSetting.getEyeBlinkParameterId(i))
            }

            this._state = LoadStep.SetupLipSyncIds

            // callback
            setupLipSyncIds()
        }

        // LipSyncIds
        let setupLipSyncIds = () => {
            let lipSyncIdCount = this._modelSetting.getLipSyncParameterCount()

            for (let i: number = 0; i < lipSyncIdCount; ++i) {
                this._lipSyncIds.pushBack(this._modelSetting.getLipSyncParameterId(i))
            }
            this._state = LoadStep.SetupLayout

            // callback
            setupLayout()
        }

        // Layout
        let setupLayout = () => {
            let layout: CsmMap<string, number> = new CsmMap<string, number>()
            this._modelSetting.getLayoutMap(layout)
            this._modelMatrix.setupFromLayout(layout)
            this._state = LoadStep.LoadMotion

            // callback
            loadCubismMotion()
        }

        // Motion
        let loadCubismMotion = () => {
            this._state = LoadStep.WaitLoadMotion
            this._model.saveParameters()
            this._allMotionCount = 0
            this._motionCount = 0
            let group: string[] = []

            let motionGroupCount: number = this._modelSetting.getMotionGroupCount()

            // 获取动作总数
            for (let i: number = 0; i < motionGroupCount; i++) {
                group[i] = this._modelSetting.getMotionGroupName(i)
                this._allMotionCount += this._modelSetting.getMotionCount(group[i])
            }

            // 读取动作数据
            for (let i: number = 0; i < motionGroupCount; i++) {
                this.preLoadMotionGroup(group[i], (): void => {
                    this._motionCount++

                    if (this._motionCount >= this._allMotionCount) {
                        this._state = LoadStep.LoadTexture

                        // 停止全部动作
                        this._motionManager.stopAllMotions()

                        this._updating = false
                        this._initialized = true

                        this.createRenderer()
                        this.setupTextures(gl)
                        this.getRenderer().startUp(gl)
                    }
                })
            }

            // 没有动作数据的情况
            if (motionGroupCount == 0) {
                this._state = LoadStep.LoadTexture

                // 停止全部动作
                this._motionManager.stopAllMotions()

                this._updating = false
                this._initialized = true

                this.createRenderer()
                this.setupTextures(gl)
                this.getRenderer().startUp(gl)
            }
        }
    }

    /**
     * 装载贴图数据
     */
    private setupTextures(gl: any): void {
        // 使用premultipliedAlpha保证iPhone的透明通道的品质
        let usePremultiply: boolean = true

        if (this._state == LoadStep.LoadTexture) {
            // 用于读取贴图
            let textureCount: number = this._modelSetting.getTextureCount()

            for (let modelTextureNumber = 0; modelTextureNumber < textureCount; modelTextureNumber++) {
                // 跳过没有名字的贴图
                if (this._modelSetting.getTextureFileName(modelTextureNumber) == "") {
                    Utils.printLog("getTextureFileName null")
                    continue
                }

                // 通过WebGL的贴图单元加载贴图
                let texturePath = this._modelSetting.getTextureFileName(modelTextureNumber)
                texturePath = this._modelHomeDir + texturePath

                //加载完成时回调函数
                let onLoad = (textureInfo: TextureInfo): void => {
                    this.getRenderer().bindTexture(modelTextureNumber, textureInfo.id)

                    this._textureCount++

                    if (this._textureCount >= textureCount) {
                        // 加载结束
                        this._state = LoadStep.CompleteSetup
                    }
                }

                // 通过工厂创建贴图
                TextureFactory.createTextureFromPngFile(gl, texturePath, usePremultiply, onLoad)
                this.getRenderer().setIsPremultipliedAlpha(usePremultiply)
            }
            this._state = LoadStep.WaitLoadTexture
        }
    }

    /**
     * 释放动作数据资源
     */
    public releaseMotions(): void {
        this._motions.clear()
    }

    /**
     * 释放表情数据资源
     */
    public releaseExpressions(): void {
        this._expressions.clear()
    }

    /**
    * 模型绘制处理。通过View-Projection矩阵绘制模型。
    */
    public draw(canvas: HTMLCanvasElement, frameBuffer: WebGLFramebuffer, matrix: CubismMatrix44): void {
        if (this._model == null) return

        // 各项工作结束后
        if (this._state == LoadStep.CompleteSetup) {
            matrix.multiplyByMatrix(this._modelMatrix)
            this.getRenderer().setMvpMatrix(matrix)
            this.doDraw(canvas, frameBuffer)
        }
    }

    /****************************************************************************************************** */
    private deleteBuffer(buffer: ArrayBuffer, path: string = "") {
        buffer = void 0
    }

    /**
    * 模型绘制处理。通过View-Projection矩阵绘制模型。
    */
    private doDraw(canvas: HTMLCanvasElement, frameBuffer: WebGLFramebuffer): void {
        if (this._model == null) return

        // 依照canvas的大小
        let viewport: number[] = [
            0,
            0,
            canvas.width,
            canvas.height
        ]

        this.getRenderer().setRenderState(frameBuffer, viewport)
        this.getRenderer().drawModel()
    }

    /**
     * 按组名加载动作数据
     * 动作数据的名字通过内部的ModelSetting获取
     *
     * @param group 动作数据的组名
     */
    private preLoadMotionGroup(group: string, callback: any): void {
        for (let i: number = 0; i < this._modelSetting.getMotionCount(group); i++) {
            // ex) idle_0
            let name: string = CubismString.getFormatedString("{0}_{1}", group, i)
            let path = this._modelSetting.getMotionFileName(group, i)
            path = this._modelHomeDir + path

            if (this._debugMode) {
                Utils.printLog("[APP]load motion: {0} => [{1}_{2}]", path, group, i)
            }

            fetch(path).then((response) => response.arrayBuffer()).then(
                (arrayBuffer) => {
                    let buffer: ArrayBuffer = arrayBuffer
                    let size = buffer.byteLength

                    let tmpMotion: CubismMotion = <CubismMotion>this.loadMotion(buffer, size, name)

                    let fadeTime = this._modelSetting.getMotionFadeInTimeValue(group, i)
                    if (fadeTime >= 0.0) {
                        tmpMotion.setFadeInTime(fadeTime)
                    }

                    fadeTime = this._modelSetting.getMotionFadeOutTimeValue(group, i)
                    if (fadeTime >= 0.0) {
                        tmpMotion.setFadeOutTime(fadeTime)
                    }
                    tmpMotion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds)

                    if (this._motions.getValue(name) != null) {
                        ACubismMotion.delete(this._motions.getValue(name))
                    }

                    this._motions.setValue(name, tmpMotion)

                    this.deleteBuffer(buffer, path)
                    callback()
                }
            )
        }
    }

}