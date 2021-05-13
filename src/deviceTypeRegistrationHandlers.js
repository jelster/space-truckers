import { KeyboardEventTypes, PointerEventTypes } from "@babylonjs/core";

function registerKeyboardDeviceSource(scene, inputMap) {
    return {
        observer: scene.onKeyboardObservable.add((kbInfo) => {
            inputMap[kbInfo.event.key] = kbInfo.event.type === KeyboardEventTypes.KEYDOWN;
        }),
        observable: scene.onKeyboardObservable
    };
}

function registerMouseDeviceSource(scene, inputMap) {
    return {
        observer: scene.onPointerObservable.add((pointerInfo) => {
            inputMap['Return'] = pointerInfo.type === PointerEventTypes.POINTERDOWN;
        }),
        observable: scene.onPointerObservable
    };
}

const deviceTypeRegistrationHandlers = {
    /* generic */   0: { onRegister: function (scene) { } },
    /* keyboard */  1: { onRegister: registerKeyboardDeviceSource },
    /* mouse */     2: { onRegister: registerMouseDeviceSource },
    /* touch */     3: { onRegister: registerMouseDeviceSource },
    /* dualshock */ 4: { onRegister: function (scene) { } },
    /* xbox */      5: { onRegister: function (scene) { } },
    /* switch */    6: { onRegister: function (scene) { } }
}

export default deviceTypeRegistrationHandlers;