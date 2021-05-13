import deviceTypeRegistrationHandlers from "./deviceTypeRegistrationHandlers";
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
    constructor(engine, enabledInputTypes) {
        this._inputMap = {};

        this._engine = engine;
        this.inputDevices = enabledInputTypes;
    }

    registerInputForScene(sceneToRegister) {
        const observers = [];
        this.inputDevices.forEach(action => {
            const fn = deviceTypeRegistrationHandlers[action.deviceType];
            observers.push(fn(sceneToRegister, this.inputMap));
        });
        return observers;
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