import { Live2DCubismFramework as cubismmodelsettingjson } from "../../live2d/framework/cubismmodelsettingjson"
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson
import { Live2DCubismFramework as icubismmodelsetting } from "../../live2d/framework/icubismmodelsetting"
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting
import { Live2DCubismFramework as cubismstring } from "../../live2d/framework/utils/cubismstring"
import CubismString = cubismstring.CubismString
import { Live2DCubismFramework as cubismmotion } from "../../live2d/framework/motion/cubismmotion"
import CubismMotion = cubismmotion.CubismMotion

import { Live2DModel } from "../model/live2dmodel";
import { LoadStep } from "./loadstep";
import { Utils } from "./utils";

export namespace ModelFactory {
    /**
     * 载入模型数据
     * @param model 需要被载入的对象 
     * @param dir 存放model3.json的文件夹路径
     * @param fileName 
     */
    export function loadModel(gl: any, model: Live2DModel, dir: string,
        fileName: string, loadTextureCallback: (model: Live2DModel) => void) {
        model.modelHomeDir = dir

        //基础资源加载
        fetch(dir + fileName)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => {
                // 状态更新
                loadSetting(new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength))
            })

        //setting
        let loadSetting = (setting: ICubismModelSetting) => {

            model.state = LoadStep.LoadModel

            model.setUpdating(true)
            model.setInitialized(false)
            model.setModelSetting(setting)

            if (model.getModelFileName() != "") {
                fetch(model.getModelFileName(true))
                    .then((response) => response.arrayBuffer())
                    .then((arrayBuffer) => {
                        model.loadModel(arrayBuffer)
                        // callback
                        loadCubismExpression()
                    })
                model.state = LoadStep.WaitLoadModel
            } else { Utils.printLog("Model data does not exist.") }
        }

        // Expression
        let loadCubismExpression = () => {

            model.state = LoadStep.LoadExpression
            if (model.getExpressionCount() > 0) {
                const count: number = model.getExpressionCount()
                for (let i: number = 0; i < count; i++) {
                    let name: string = model.getExpressionName(i)
                    fetch(model.getExpressionFileName(i, true))
                        .then((response) => response.arrayBuffer())
                        .then((arrayBuffer) => {
                            model.setExpressionValue(name, model.loadExpression(arrayBuffer, arrayBuffer.byteLength, name))
                            model.expressionCount++

                            if (model.expressionCount >= count) {
                                // callback
                                loadCubismPhysics()
                            }
                        })
                }
                model.state = LoadStep.WaitLoadExpression
            }
            else {
                // callback
                loadCubismPhysics()
            }
        }

        // Physics
        let loadCubismPhysics = () => {

            model.state = LoadStep.LoadPhysics
            if (model.getPhysicsFileName() != "") {
                fetch(model.getPhysicsFileName(true))
                    .then((response) => response.arrayBuffer())
                    .then((arrayBuffer) => {
                        model.loadPhysics(arrayBuffer, arrayBuffer.byteLength)
                        // callback
                        loadCubismPose()
                    })
                model.state = LoadStep.WaitLoadPhysics
            }
            else {
                // callback
                loadCubismPose()
            }
        }

        // Pose
        let loadCubismPose = () => {

            model.state = LoadStep.LoadPose
            if (model.getPoseFileName() != "") {
                fetch(model.getPoseFileName(true))
                    .then((response) => response.arrayBuffer())
                    .then((arrayBuffer) => {
                        model.loadPose(arrayBuffer, arrayBuffer.byteLength)
                        // callback
                        setupEyeBlink()
                    })
                model.state = LoadStep.WaitLoadPose
            }
            else {
                // callback
                setupEyeBlink()
            }
        }

        // EyeBlink
        let setupEyeBlink = () => {
            model.state = LoadStep.SetupEyeBlink
            model.obtainEyeBlink()
            // callback
            setupBreath()
        }

        // Breath
        let setupBreath = () => {

            model.state = LoadStep.SetupBreath

            model.obtainBreath()
            model.obtainBreathParameters()
            // callback
            loadUserData()
        }

        // UserData
        let loadUserData = () => {

            model.state = LoadStep.LoadUserData
            if (model.getUserDataFile() != "") {
                fetch(model.getUserDataFile(true))
                    .then((response) => response.arrayBuffer())
                    .then((arrayBuffer) => {
                        model.loadUserData(arrayBuffer, arrayBuffer.byteLength)
                        // callback
                        setupEyeBlinkIds()
                    })
                this.state = LoadStep.WaitLoadUserData
            }
            else {
                // callback
                setupEyeBlinkIds()
            }
        }

        // EyeBlinkIds
        let setupEyeBlinkIds = () => {

            model.state = LoadStep.SetupEyeBlinkIds
            model.obtainEyeBlinkIds()
            // callback
            setupLipSyncIds()
        }

        // LipSyncIds
        let setupLipSyncIds = () => {

            model.state = LoadStep.SetupLipSyncIds
            model.obtainLipSyncIds()
            // callback
            setupLayout()
        }

        // Layout
        let setupLayout = () => {

            model.state = LoadStep.SetupLayout
            model.obtainLayout()
            // callback
            loadCubismMotion()
        }

        // Motion
        let loadCubismMotion = () => {

            model.state = LoadStep.LoadMotion

            model.state = LoadStep.WaitLoadMotion

            model.saveModelParameters()
            let allMotionCount = 0
            let motionCount = 0
            let group: string[] = []

            let motionGroupCount: number = model.getMotionGroupCount()

            // 获取动作总数
            for (let i: number = 0; i < motionGroupCount; i++) {
                group[i] = model.getMotionGroupName(i)
                allMotionCount += model.getMotionCount(group[i])
            }

            // 读取动作数据
            for (let i: number = 0; i < motionGroupCount; i++) {
                ModelFactory.preLoadMotionGroup(model, group[i], (): void => {
                    motionCount++

                    if (motionCount >= allMotionCount) {
                        model.state = LoadStep.LoadTexture

                        // 停止全部动作
                        model.stopAllMotions()
                        model.setUpdating(false)
                        model.setInitialized(true)

                        model.createRenderer()
                        loadTextureCallback(model)
                        model.getRenderer().startUp(gl)
                    }
                })
            }

            // 没有动作数据的情况
            if (motionGroupCount == 0) {
                model.state = LoadStep.LoadTexture

                // 停止全部动作
                model.stopAllMotions()
                model.setUpdating(false)
                model.setInitialized(true)

                model.createRenderer()
                loadTextureCallback(model)
                model.getRenderer().startUp(gl)
            }
        }
    }

    /**
     * 按组名加载动作数据
     * 动作数据的名字通过内部的ModelSetting获取
     * @param model 
     * @param group 动作数据的组名
     * @param callback 回调
     */
    export function preLoadMotionGroup(model: Live2DModel, group: string, callback: any) {
        for (let i: number = 0; i < model.getMotionCount(group); i++) {
            // ex) idle_0
            let name: string = CubismString.getFormatedString("{0}_{1}", group, i)
            let path = model.getMotionFileName(group, i, true)

            if (this._debugMode) {
                Utils.printLog("[APP]load motion: {0} => [{1}_{2}]", path, group, i)
            }

            fetch(path)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => {
                    let tmpMotion: CubismMotion = <CubismMotion>model.loadMotion(arrayBuffer, arrayBuffer.byteLength, name)
                    let fadeTime = model.getMotionFadeInTimeValue(group, i)
                    if (fadeTime >= 0.0) {
                        tmpMotion.setFadeInTime(fadeTime)
                    }
                    fadeTime = model.getMotionFadeOutTimeValue(group, i)
                    if (fadeTime >= 0.0) {
                        tmpMotion.setFadeOutTime(fadeTime)
                    }
                    tmpMotion.setEffectIds(model.getEyeBlinkIds(), model.getLipSyncIds())
                    model.setMotionValue(name, tmpMotion)
                    callback()
                })
        }
    }

}