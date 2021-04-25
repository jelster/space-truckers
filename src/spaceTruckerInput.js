import { DeviceSourceManager } from "@babylonjs/core/DeviceInput/InputDevices/deviceSourceManager";
import {DeviceType } from "@babylonjs/core/DeviceInput/InputDevices/deviceEnums" ;
import {Observable } from "@babylonjs/core/Misc/observable";

import kbControlMap from "./keyboardControlMap";

class SpaceTruckerInputManager {
    // inputQueue = [];
    // deviceSourceManager;
    // activeDevice = null;
    // _kbInputMap = {};
    get inputMap() {
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
            
        this.onInputQueueUpdated = new Observable();

    }
    _dispatchKeyboardInput(input) {
        this._inputMap[input.inputIndex] = input.currentState == 1;
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
        }

    }
}
export default SpaceTruckerInputManager;