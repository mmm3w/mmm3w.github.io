/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { AppDelegate } from "./delegate/appdelegate"

let main: any = () => {
    // create the application instance
    if (AppDelegate.getInstance().initialize() == false) return
    AppDelegate.getInstance().run()
}


main()

/**
 * 終了時の処理
 */
window.onbeforeunload = () => {
    // LAppDelegate.releaseInstance()
}
