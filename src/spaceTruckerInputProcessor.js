import { Observable } from "@babylonjs/core/Misc/observable";
import logger from "./logger";

class SpaceTruckerInputProcessor {
    onCommandObservable = new Observable();
    actionState = {};
    lastActionState = null;
    controlsAttached = false;
    inputManager;
    screen;
    scene;

    get inputQueue() {
        return this._inputQueue;
    }
    constructor(screen, inputManager) {
        this.scene = screen.scene;
        this.screen = screen;
        this.inputManager = inputManager;
        this._inputQueue = [];

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

    inputCommandHandler(input) {
        input.forEach(i => {
            const inputParam = i.lastEvent;
            const actionFn = this?.screen[i.action];
            if (actionFn) {
                
                const priorState = this.lastActionState ? this.lastActionState[i.action] : null;
                console.log("taking action!", {input, priorState});
                // the way we're dispatching this function in this context results in a loss of the "this" context for the
                // function being dispatched. Calling bind on the function object returns a new function with the correct
                // "this" set as expected. That function is immediately invoked with the target and magnitude parameter values.
                this.actionState[i.action] = actionFn.bind(this.screen)({ priorState }, inputParam);
                // use the return value of the actionFn to allow handlers to maintain individual states (if they choose).
                // handlers that don't need to maintain state also don't need to know what to return, 
                // since undefined == null == false.
               
            }
        });
    }
}

export default SpaceTruckerInputProcessor;