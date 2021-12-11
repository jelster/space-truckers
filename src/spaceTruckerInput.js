import { Gamepad, KeyboardEventTypes, Logger, PointerEventTypes } from "@babylonjs/core";
import {Observable} from "@babylonjs/core/Misc/observable";
import logger from "./logger";

import SpaceTruckerControls from "./inputActionMaps";


const controlsMap = SpaceTruckerControls.inputControlsMap;
let tempControlsMap = {};
class SpaceTruckerInputManager {
    static patchControlMap(newMaps) {
        tempControlsMap = Object.assign({}, controlsMap);
        Object.assign(controlsMap, newMaps);
    }
    static unPatchControlMap() {
        Object.assign(controlsMap, tempControlsMap);
        tempControlsMap = {};
    }
    get hasInput() {
        return this._inputKeys?.length > 0;
    }

    get inputMap() {
        if (!this._inputMap) {
            this._inputMap = {};
        }
        return this._inputMap;
    }

    get onInputAvailableObservable() {
        return this._onInputAvailable;
    }

    get inputSubscriptions() {
        if (!this._inputSubscriptions) {
            this._inputSubscriptions = [];
        }
        return this._inputSubscriptions;
    }
    constructor(engine) {
        this._inputMap = {};
        this._engine = engine;
        this._onInputAvailable = new Observable();
        this.gamepad = null;
        this._inputSubscriptions = [];
    }

    registerInputForScene(sceneToRegister) {
        logger.logInfo("registering input for scene", sceneToRegister);
        const inputSubscriptions = this.inputSubscriptions;
        const registration = {
            scene: sceneToRegister, subscriptions: [
                this.enableKeyboard(sceneToRegister),
                this.enableMouse(sceneToRegister),
                this.enableGamepad(sceneToRegister)
            ]
        };

        sceneToRegister.onDisposeObservable.add(() => this.unregisterInputForScene(sceneToRegister));
        inputSubscriptions.push(registration);
        sceneToRegister.attachControl();
    }

    unregisterInputForScene(sceneToUnregister) {
        logger.logInfo("unregistering input controls for scene", sceneToUnregister);
        const subs = this.inputSubscriptions.find(s => s.scene === sceneToUnregister);
        if (!subs) {
            logger.logWarning("didn't find any subscriptions to unregister...", this.inputSubscriptions);
            return;
        }
        subs.subscriptions.forEach(sub => sub.dispose());
        sceneToUnregister.detachControl();
    }

    getInputs(scene) {
        const sceneInputHandler = this.inputSubscriptions.find(is => is.scene === scene);
        if (!sceneInputHandler) {
            return;
        }
        sceneInputHandler.subscriptions.forEach(s => s.checkInputs());
        const im = this.inputMap;
        const ik = Object.keys(im);

        const inputs = ik
            .map((key) => {
                return { action: controlsMap[key], lastEvent: im[key] };
            });
        if (inputs && inputs.length > 0) {
            this.onInputAvailableObservable.notifyObservers(inputs);
        }
        return inputs;
    }

    enableMouse(scene) {
        const obs = scene.onPointerObservable.add((pointerInfo) => {
            
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                this.inputMap["PointerTap"] = pointerInfo;
            }
            else if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                delete this.inputMap["PointerTap"];
            }
            
        });

        const checkInputs = () => { };
        return { checkInputs, dispose: () => scene.onPointerObservable.remove(obs) };
    }

    enableKeyboard(scene) {
        const observer = scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key;
            const keyMapped = controlsMap[key];
            if (!keyMapped) {
                console.log("Unmapped key processed by app", key);
                return;
            }

            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                this.inputMap[key] = kbInfo.event;
            }
            else {
                delete this.inputMap[key];
            }
        });

        const checkInputs = () => { };
        return {
            checkInputs,
            dispose: () => {
                scene.onKeyboardObservable.remove(observer);
            }
        };
    }

    // adapted from 
    // source: https://github.com/BabylonJS/Babylon.js/blob/preview/src/Cameras/Inputs/freeCameraGamepadInput.ts
    enableGamepad(scene) {
        const manager = scene.gamepadManager;
        const gamepadConnectedObserver = manager.onGamepadConnectedObservable
            .add(gamepad => {
                console.log('gamepad connected', gamepad);
                // HACK: need to avoid selecting goofy non-gamepad devices reported by browser
                if (gamepad?.browserGamepad?.buttons.length > 0) {
                    if (gamepad.type !== Gamepad.POSE_ENABLED) {
                        // prioritize XBOX gamepads.
                        if (!this.gamepad || gamepad.type === Gamepad.XBOX) {
                            this.gamepad = gamepad;
                        }
                    }
                    const controlMap = SpaceTruckerControls.gamePadControlMap[gamepad.type];
                    // how do we manage the observers here?
                    this._gamePadOnButtonDown = gamepad.onButtonDownObservable.add((buttonId, s) => {
                        console.log("button down", buttonId, s);
                        const buttonMapped = controlMap[buttonId][0];
                        console.log(buttonMapped[0]);
                        this.inputMap[buttonMapped] = 1;
                    });
                    this._gamePadOnButtonUp = gamepad.onButtonUpObservable.add((buttonId, s) => {
                        console.log("button up", buttonId, s);
                        const buttonMapped = controlMap[buttonId][0];
                        delete this.inputMap[buttonMapped];
                    });
                }
            });

        const gamepadDisconnectedObserver = manager.onGamepadDisconnectedObservable
            .add(gamepad => {
                gamepad.onButtonDownObservable.remove(this._gamePadOnButtonDown);
                gamepad.onButtonUpObservable.remove(this._gamePadOnButtonUp);
                this.gamepad = null;
            });

        const checkInputs = () => {
            const iMap = this.inputMap;
            if (!this.gamepad) { return; }

            // handle quantitative or input that reads between 0 and 1
            // binary (on/off) inputs are handled by the onButton/ondPadUp|DownObservables

            let LSValues = SpaceTruckerControls.normalizeJoystickInputs(this.gamepad.leftStick);
            SpaceTruckerControls.mapStickTranslationInputToActions(LSValues, iMap);

            let RSValues = SpaceTruckerControls.normalizeJoystickInputs(this.gamepad.rightStick);
            SpaceTruckerControls.mapRotationInputToActions(RSValues, iMap);

        };

        // check if there are already other controllers connected
        this.gamepad = manager
            .gamepads
            .find(gp => gp && gp.type === Gamepad.Xbox && gp.browserGamepad.buttons.length);

        // if no xbox controller was found, but there are gamepad controllers, take the first one
        if (!this.gamepad && manager.gamepads.length) {
            // HACK
            this.gamepad = manager.gamepads[0];
        }

        console.log('gamepad enabled', this.gamepad);

        return {
            checkInputs,
            dispose: () => {
                this.gamepad = null;
                manager.onGamepadConnectedObservable.remove(gamepadConnectedObserver);
                manager.onGamepadDisconnectedObservable.remove(gamepadDisconnectedObserver);
                SpaceTruckerInputManager.unPatchControlMap();
            }
        };
    }

}
export default SpaceTruckerInputManager;