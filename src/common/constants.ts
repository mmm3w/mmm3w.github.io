import { LogLevel } from "../../live2d/framework/live2dcubismframework"

/**
 * 常量定义
 */
export namespace ConstantsDefine {
    export const CanvasID: string = "SAMPLE"

    export const ResourcesPath: string = "./Resources/"

    export const ModelDir: string[] = [
        "Hiyori",
        "Nacho",
        "Rice"
    ]
    export const ModelDirSize: number = ModelDir.length

    export const DebugLogEnable: boolean = true
    export const DebugTouchLogEnable: boolean = false

    // 动作优先度常量の優先度定数
    export const PriorityNone: number = 0
    export const PriorityIdle: number = 1
    export const PriorityNormal: number = 2
    export const PriorityForce: number = 3

    // 与外部定义文件匹配
    export const MotionGroupIdle: string = "Idle" // アイドリング 不懂
    export const MotionGroupTapBody: string = "TapBody" // 点击身体事件tag

    export const HitAreaNameHead: string = "Head"
    export const HitAreaNameBody: string = "Body"

    export const ViewMaxScale: number = 2.0
    export const ViewMinScale: number = 0.8

    export const ViewLogicalLeft: number = -1.0
    export const ViewLogicalRight: number = 1.0

    export const ViewLogicalMaxLeft: number = -2.0
    export const ViewLogicalMaxRight: number = 2.0
    export const ViewLogicalMaxBottom: number = -2.0
    export const ViewLogicalMaxTop: number = 2.0

    export const CubismLoggingLevel: LogLevel = LogLevel.LogLevel_Debug
}