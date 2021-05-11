import { DeviceSourceManager } from "@babylonjs/core/DeviceInput/InputDevices/deviceSourceManager";
import { DeviceType } from "@babylonjs/core/DeviceInput/InputDevices/deviceEnums";
import { Observable } from "@babylonjs/core/Misc/observable";

import kbControlMap from "./keyboardControlMap";

const controlMapKeys = Object.keys(kbControlMap);

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
        let that = this;
        this._engine = engine;
        const dsm = this.deviceSourceManager = new DeviceSourceManager(engine);
        this._onConnectedObserver = dsm.onDeviceConnectedObservable.add(
            function (device) {
                that._handleOnDeviceConnected(device);
            });

    }

    getMatchingInputs(actionList) {
        const controlsToMatch = controlMapKeys.filter(k => actionList.indexOf(kbControlMap[k]) > -1);
        const im = this.inputMap;
        return controlsToMatch.map((key) => im[key]);
    }

    _dispatchKeyboardInput(input) {
        this.inputMap[input.inputIndex] = input.currentState == 1;
        // this will be called a lot less than hasInput() so regenerate the keys cache whenever we update it
        this._inputKeys = Object.keys(this.inputMap);
    }

    _handleOnDeviceConnected(device) {
        let that = this;
        console.log("new device connection", device);

        switch (device.deviceType) {
            case DeviceType.Keyboard:
                device.onInputChangedObservable.add(
                    function (inputData) {
                        that._dispatchKeyboardInput(inputData);
                    });
                break;
            case DeviceType.Mouse || DeviceType.Touch:

                break;
        }

    }
}
export default SpaceTruckerInputManager;