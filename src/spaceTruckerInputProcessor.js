import { Observable } from "@babylonjs/core/Misc/observable";
import logger from "./logger";
import { setAndStartTimer } from "@babylonjs/core/Misc/timer";

function bounce(funcToBounce, bounceInMilliseconds, inputProcessor) {
    let composer = () => {
        var isBounced = false;
        const observableContext = inputProcessor.screen.scene.onBeforeRenderObservable;
        return (...args) => {
            if (isBounced) {
                return false;
            }
            isBounced = true;
            setAndStartTimer({ 
                timeout: bounceInMilliseconds, 
                onEnded: () => isBounced = false,
                contextObservable: observableContext
            });
            return funcToBounce.call(inputProcessor.screen, args);
        };
    }
    return composer();
    
}

class SpaceTruckerInputProcessor {
    onCommandObservable = new Observable();
    actionState = {};
    actionMap = {};
    actionList = [];
    lastActionState = null;
    controlsAttached = false;
    inputManager;
    screen;
    scene;

    get inputQueue() {
        return this._inputQueue;
    }
    constructor(screen, inputManager, actionList) {
        this.scene = screen.scene;
        this.screen = screen;
        this.inputManager = inputManager;
        this.actionList = actionList;
        this._inputQueue = [];

        this.buildActionMap(actionList, false);
        //this.scene.onBeforeRenderObservable.add(() => this.update());


        //this.onCommandObservable.add(inputs => this.inputCommandHandler(inputs));

    }
    attachControl() {
        if (!this.controlsAttached) {
            logger.logInfo("input processor attaching control for screen ", this.screen);
            this.scene.attachControl();
            this.inputManager.registerInputForScene(this.scene);
            this.onInputObserver = this.inputManager.onInputAvailableObservable.add((inputs) => {
                this.inputAvailableHandler(inputs);
            });
            this.controlsAttached = true;
        }
    }
    detachControl() {
        if (this.controlsAttached) {
            logger.logInfo("input processor detaching control for screen ", this.screen);

            this.inputManager.onInputAvailableObservable.remove(this.onInputObserver);
            this.inputManager.unregisterInputForScene(this.scene);
            this.controlsAttached = false;
            this._inputQueue = [];
        }
    }
    update() {

        if (!this.controlsAttached) {
            return;
        }
        this.inputManager.getInputs(this.scene);
        this.lastActionState = this.actionState;

        const inputQueue = this.inputQueue;
        while (inputQueue.length > 0) {
            let input = inputQueue.pop();
            this.inputCommandHandler(input);
        }
    }

    inputAvailableHandler(inputs) {
        this.inputQueue.push(inputs);
    }

    buildActionMap(actionList, createNew) {
        if (createNew) {
            this.actionMap = {};
        }
        //const actionList = keyboardControlMap.menuActionList
        actionList.forEach(actionDef => {
            const action = actionDef.action;
            const actionFn = this.screen[action];
            if (!actionFn) {
                return;
            }
            this.actionMap[action] = actionDef.shouldBounce() ? bounce(actionFn, 250, this) : actionFn.bind(this.screen, ...args);
        });
    }

    inputCommandHandler(input) {
        input.forEach(i => {
            const inputParam = i.lastEvent;
            const actionFn = this.actionMap[i.action];
            if (actionFn) {

                const priorState = this.lastActionState ? this.lastActionState[i.action] : null;
                
                // the way we're dispatching this function in this context results in a loss of the "this" context for the
                // function being dispatched. Calling bind on the function object returns a new function with the correct
                // "this" set as expected. That function is immediately invoked with the target and magnitude parameter values.
                
                this.actionState[i.action] = actionFn({priorState}, inputParam);
                // use the return value of the actionFn to allow handlers to maintain individual states (if they choose).
                // handlers that don't need to maintain state also don't need to know what to return, 
                // since undefined == null == false.

            }
        });
    }
}

export default SpaceTruckerInputProcessor;