import { Live2DCubismFramework as cubismusermodel } from "../../live2d/framework/model/cubismusermodel"
import CubismUserModel = cubismusermodel.CubismUserModel
import { Live2DCubismFramework as icubismmodelsetting } from "../../live2d/framework/icubismmodelsetting"
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting
import { Live2DCubismFramework as cubismmodelsettingjson } from "../../live2d/framework/cubismmodelsettingjson"
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson
import { Live2DCubismFramework as acubismmotion } from "../../live2d/framework/motion/acubismmotion"
import ACubismMotion = acubismmotion.ACubismMotion
import { Live2DCubismFramework as csmmap } from "../../live2d/framework/type/csmmap"
import CsmMap = csmmap.csmMap
import { Live2DCubismFramework as cubismeyeblink } from "../../live2d/framework/effect/cubismeyeblink"
import CubismEyeBlink = cubismeyeblink.CubismEyeBlink
import { Live2DCubismFramework as cubismbreath } from "../../live2d/framework/effect/cubismbreath"
import CubismBreath = cubismbreath.CubismBreath
import BreathParameterData = cubismbreath.BreathParameterData
import { Live2DCubismFramework as csmvector } from "../../live2d/framework/type/csmvector"
import CsmVector = csmvector.csmVector
import { Live2DCubismFramework as live2dcubismframework } from "../../live2d/framework/live2dcubismframework"
import CubismFramework = live2dcubismframework.CubismFramework
import { Live2DCubismFramework as cubismdefaultparameterid } from "../../live2d/framework/cubismdefaultparameterid"
import CubismDefaultParameterId = cubismdefaultparameterid
import { Live2DCubismFramework as cubismid } from "../../live2d/framework/id/cubismid"
import CubismIdHandle = cubismid.CubismIdHandle
import { Live2DCubismFramework as cubismstring } from "../../live2d/framework/utils/cubismstring"
import CubismString = cubismstring.CubismString
import { Live2DCubismFramework as cubismmotion } from "../../live2d/framework/motion/cubismmotion"
import CubismMotion = cubismmotion.CubismMotion
import { Live2DCubismFramework as cubismmotionqueuemanager } from "../../live2d/framework/motion/cubismmotionqueuemanager"
import CubismMotionQueueEntryHandle = cubismmotionqueuemanager.CubismMotionQueueEntryHandle
import InvalidMotionQueueEntryHandleValue = cubismmotionqueuemanager.InvalidMotionQueueEntryHandleValue
import { CubismLogInfo } from "../../live2d/framework/utils/cubismdebug"
import { Live2DCubismFramework as csmstring } from "../../live2d/framework/type/csmstring"
import CsmString = csmstring.csmString
import { Live2DCubismFramework as csmrect } from "../../live2d/framework/type/csmrectf"
import CsmRect = csmrect.csmRect
import { Live2DCubismFramework as cubismmatrix44 } from "../../live2d/framework/math/cubismmatrix44"
import CubismMatrix44 = cubismmatrix44.CubismMatrix44

// import { TextureInfo } from "../model/textureinfo"
import { LoadStep } from "../common/loadstep"
import { Utils } from "../common/utils"
import FrameDeltaTime = Utils.FrameDeltaTime
// import { TextureFactory } from "../common/texturefactory"
import { ConstantsDefine } from "../common/constants"

//From CubismSdkForWeb-4-beta.2
export class Live2DModel extends CubismUserModel {

    state: number //模型所处状态
    modelHomeDir: string //模型配置所在文件夹

    expressionCount: number // 表情的数量
    textureCount: number // 贴图的数量

    private _modelSetting: ICubismModelSetting //模型配置信息

    private _expressions: CsmMap<string, ACubismMotion> //获取的表情列表
    private _motions: CsmMap<string, ACubismMotion> // 获取的动作列表

    private _userTimeSeconds: number   // 时间累计值[秒]
    private _lastChanceMotion: number //上次特殊待机动作的时间

    private _idParamAngleX: CubismIdHandle     // 参数ID: ParamAngleX
    private _idParamAngleY: CubismIdHandle     // 参数ID: ParamAngleY
    private _idParamAngleZ: CubismIdHandle     // 参数ID: ParamAngleZ
    private _idParamBodyAngleX: CubismIdHandle // 参数ID: ParamBodyAngleX
    private _idParamBreath: CubismIdHandle // 参数ID: ParamBreath

    private _idParamEyeBallX: CubismIdHandle   // 参数ID: ParamEyeBallX
    private _idParamEyeBallY: CubismIdHandle   // 参数ID: ParamEyeBAllY

    private _eyeBlinkIds: CsmVector<CubismIdHandle>  // 模型设置中眨眼使用的param id
    private _lipSyncIds: CsmVector<CubismIdHandle>   // 模型设置中口型使用的param id

    constructor() {
        super()

        this.state = LoadStep.LoadAssets
        this.modelHomeDir = null
        this._modelSetting = null

        this._expressions = new CsmMap<string, ACubismMotion>()
        this.expressionCount = 0
        this._motions = new CsmMap<string, ACubismMotion>()
        this.textureCount = 0

        this._userTimeSeconds = 0.0
        this._lastChanceMotion = Date.now()

        this._idParamAngleX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleX)
        this._idParamAngleY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleY)
        this._idParamAngleZ = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamAngleZ)
        this._idParamBodyAngleX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBodyAngleX)
        this._idParamBreath = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamBreath)

        this._idParamEyeBallX = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallX)
        this._idParamEyeBallY = CubismFramework.getIdManager().getId(CubismDefaultParameterId.ParamEyeBallY)

        this._eyeBlinkIds = new CsmVector<CubismIdHandle>()
        this._lipSyncIds = new CsmVector<CubismIdHandle>()
    }

    /*=================================================================================*/
    //内部代理
    public setExpressionValue(name: string, motion: ACubismMotion) {
        if (this._expressions.getValue(name) != null) {
            ACubismMotion.delete(this._expressions.getValue(name))
            this._expressions.setValue(name, null)
        }
        this._expressions.setValue(name, motion)
    }

    public setMotionValue(name: string, motion: ACubismMotion) {
        if (this._motions.getValue(name) != null) {
            ACubismMotion.delete(this._motions.getValue(name))
        }
        this._motions.setValue(name, motion)
    }

    public saveModelParameters() {
        this._model.saveParameters()
    }

    public stopAllMotions() {
        this._motionManager.stopAllMotions()
    }

    /*---------------------------------------------------------------------------------*/
    //modelSetting代理
    public getModelFileName(isIncludeHomeDir: boolean = false): string {
        return this.completeHomeDir(isIncludeHomeDir, this._modelSetting.getModelFileName())
    }

    public getExpressionCount(): number {
        return this._modelSetting.getExpressionCount()
    }

    public getExpressionName(index: number): string {
        return this._modelSetting.getExpressionName(index)
    }

    public getExpressionFileName(index: number, isIncludeHomeDir: boolean = false): string {
        return this.completeHomeDir(isIncludeHomeDir, this._modelSetting.getExpressionFileName(index))
    }

    public getPhysicsFileName(isIncludeHomeDir: boolean = false): string {
        return this.completeHomeDir(isIncludeHomeDir, this._modelSetting.getPhysicsFileName())
    }

    public getPoseFileName(isIncludeHomeDir: boolean = false): string {
        return this.completeHomeDir(isIncludeHomeDir, this._modelSetting.getPoseFileName())
    }

    public getEyeBlinkParameterCount(): number {
        return this._modelSetting.getEyeBlinkParameterCount()
    }

    public getUserDataFile(isIncludeHomeDir: boolean = false): string {
        return this.completeHomeDir(isIncludeHomeDir, this._modelSetting.getUserDataFile())
    }

    public getLipSyncParameterCount(): number {
        return this._modelSetting.getLipSyncParameterCount()
    }

    public getMotionGroupCount(): number {
        return this._modelSetting.getMotionGroupCount()
    }

    public getMotionCount(group: string): number {
        return this._modelSetting.getMotionCount(group)
    }

    public getMotionGroupName(index: number): string {
        return this._modelSetting.getMotionGroupName(index)
    }

    public getMotionFileName(group: string, index: number, isIncludeHomeDir: boolean = false): string {
        return this.completeHomeDir(isIncludeHomeDir, this._modelSetting.getMotionFileName(group, index))
    }

    public getMotionFadeInTimeValue(group: string, index: number): number {
        return this._modelSetting.getMotionFadeInTimeValue(group, index)
    }

    public getMotionFadeOutTimeValue(group: string, index: number): number {
        return this._modelSetting.getMotionFadeOutTimeValue(group, index)
    }

    public getTextureCount(): number {
        return this._modelSetting.getTextureCount()
    }

    public getTextureFileName(index: number, isIncludeHomeDir: boolean = false): string {
        return this.completeHomeDir(isIncludeHomeDir, this._modelSetting.getTextureFileName(index))
    }

    /*=================================================================================*/
    //资源创建
    public obtainEyeBlink() {
        if (this.getEyeBlinkParameterCount() > 0)
            this._eyeBlink = CubismEyeBlink.create(this._modelSetting)
    }

    public obtainBreath() {
        this._breath = CubismBreath.create()
    }

    public obtainBreathParameters() {
        let breathParameters: CsmVector<BreathParameterData> = new CsmVector()
        breathParameters.pushBack(new BreathParameterData(this._idParamAngleX, 0.0, 15.0, 6.5345, 0.5))
        breathParameters.pushBack(new BreathParameterData(this._idParamAngleY, 0.0, 8.0, 3.5345, 0.5))
        breathParameters.pushBack(new BreathParameterData(this._idParamAngleZ, 0.0, 10.0, 5.5345, 0.5))
        breathParameters.pushBack(new BreathParameterData(this._idParamBodyAngleX, 0.0, 4.0, 15.5345, 0.5))
        breathParameters.pushBack(new BreathParameterData(this._idParamBreath, 0.0, 0.5, 3.2345, 0.5))
        this._breath.setParameters(breathParameters)
    }

    public obtainEyeBlinkIds() {
        for (let i: number = 0; i < this.getEyeBlinkParameterCount(); ++i) {
            this._eyeBlinkIds.pushBack(this._modelSetting.getEyeBlinkParameterId(i))
        }
    }

    public obtainLipSyncIds() {
        for (let i: number = 0; i < this.getLipSyncParameterCount(); ++i) {
            this._lipSyncIds.pushBack(this._modelSetting.getLipSyncParameterId(i))
        }
    }

    public obtainLayout() {
        let layout: CsmMap<string, number> = new CsmMap<string, number>()
        this._modelSetting.getLayoutMap(layout)
        this._modelMatrix.setupFromLayout(layout)
    }

    /*=================================================================================*/
    public setModelSetting(setting: ICubismModelSetting) {
        this._modelSetting = setting
    }

    public getEyeBlinkIds(): CsmVector<CubismIdHandle> {
        return this._eyeBlinkIds
    }

    public getLipSyncIds(): CsmVector<CubismIdHandle> {
        return this._lipSyncIds
    }
    /*=================================================================================*/
    /**
     * 重建渲染器
     */
    public reloadRenderer(gl: any): void {
        this.deleteRenderer()
        this.createRenderer()
        // this.setupTextures(gl)
    }

    /**
     * 更新
     */
    public updateModel(): void {
        if (this.state != LoadStep.CompleteSetup) return

        const deltaTimeSeconds: number = FrameDeltaTime.getDeltaTime()
        this._userTimeSeconds += deltaTimeSeconds


        this._dragManager.update(deltaTimeSeconds)
        this._dragX = this._dragManager.getX()
        this._dragY = this._dragManager.getY()

        // 是否通过运动更新参数
        let motionUpdated = false

        //--------------------------------------------------------------------------
        this._model.loadParameters()   // 加载上次保存的状态
        if (!this._motionManager.isFinished()) {
            motionUpdated = this._motionManager.updateMotion(this._model, deltaTimeSeconds)    // 动作更新
        } else {
            // 没有播放动作时、随机播放待机动作
            this.startRandomMotion(ConstantsDefine.MotionGroupStandby, ConstantsDefine.PriorityIdle)
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
            path = this.modelHomeDir + path

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

                    buffer = void 0
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
     * @param group 动作组
     * @param priority 优先度
     * @return 开始的东西的id。其他动作听过isFinished()进行判断是否结束。为开始时是[-1]
     */
    public startRandomMotion(group: string, priority: number): CubismMotionQueueEntryHandle {
        let groupName: string
        let currentTime = Date.now()
        if (currentTime - this._lastChanceMotion > Utils.chanceMotionTimeRange()) {
            groupName = ConstantsDefine.MotionGroupChance
            this._lastChanceMotion = currentTime
            console.log("sp");
        } else {
            groupName = ConstantsDefine.MotionGroupStandby
            console.log("normal");
        }

        if (this._modelSetting.getMotionCount(groupName) == 0) {
            return InvalidMotionQueueEntryHandleValue
        }
        let no: number = Math.floor(Math.random() * this._modelSetting.getMotionCount(groupName))
        return this.startMotion(groupName, no, priority)
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

    /**
    * 释放动作数据资源
    */
    public releaseMotions(): void {
        this._motions.clear()
    }

    /**
     * 释放表情数据资源
     */
    public release_expressions(): void {
        this._expressions.clear()
    }

    /*=================================================================================*/
    private completeHomeDir(isIncludeHomeDir: boolean, source: string): string {
        if (isIncludeHomeDir)
            return this.modelHomeDir + source
        else
            return source
    }
}