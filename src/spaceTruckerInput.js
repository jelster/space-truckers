import { DeviceSourceManager } from "@babylonjs/core/DeviceInput/InputDevices/deviceSourceManager";
import { DeviceType } from "@babylonjs/core/DeviceInput/InputDevices/deviceEnums";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";

import { Observable } from "@babylonjs/core/Misc/observable";

import kbControlMap from "./keyboardControlMap";
import { PointerEventTypes } from "@babylonjs/core";

const controlMapKeys = Object.keys(kbControlMap);
const deviceTypeRegistrationHandlers = {
/* generic */   0: { onRegister: function (scene) { } },
/* keyboard */  1: {
        onRegister: function (scene, inputMap) {
            return scene.onKeyboardObservable.add((kbInfo) => {
                inputMap[kbInfo.event.key] = kbInfo.event.type === KeyboardEventTypes.KEYDOWN;
            });
        }
    },
/* mouse */     2: {
        onRegister: function (scene, inputMap) {
            scene.onPointerObservable.add((pointerInfo) => {
                inputMap['Return'] = pointerInfo.type === PointerEventTypes.POINTERDOWN;

            });
        }
    },
/* touch */     3: { onRegister: function (scene) { 

} },
/* dualshock */ 4: { onRegister: function (scene) { } },
/* xbox */      5: { onRegister: function (scene) { 

} },
/* switch */    6: { onRegister: function (scene) { } }
}
class SpaceTruckerInputManager {
    // inputQueue = [];
    // deviceSourceManager;
    // activeDevice = null;
    // _kbInputMap = {};
    get hasInput() {
        return this._inputKeys?.length > 0;
    }
    get inputMap() {
        if (!this._inputMap) {
            this._inputMap = {};
        }
        return this._inputMap;
    }
    constructor(engine) {
        this._inputMap = {};
        
        this._engine = engine;
    }

    registerInputForScene(sceneToRegister, handledActions) {
        const observers = [];
        handledActions.forEach(action => {
            const fn = deviceTypeRegistrationHandlers[action.deviceType];
            observers.push(fn(sceneToRegister, this.inputMap));
        });
    }

    getMatchingInputs(actionList) {
        const controlsToMatch = controlMapKeys.filter(k => actionList.indexOf(kbControlMap[k]) > -1);
        const im = this.inputMap;
        const ik = this._inputKeys;
        return ik.filter(ik => im[ik] === true && controlsToMatch.indexOf(ik) > -1)
            .map((key) => {
                return kbControlMap[key];
            });
    }
}
export default SpaceTruckerInputManager;