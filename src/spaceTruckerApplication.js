
import AppStates from "./appstates"

class SpaceTruckerApplication {
    get currentState() {
        return this._appState || AppStates.INDETERMINATE;
    }
    constructor(engine) {
        this._engine = engine;
    }

    initializeApplication() {
        this._appState = AppStates.INITIALIZING;
        this._engine.displayLoadingUI();
        this._engine.enterFullscreen(true);
        setTimeout(() => {
            this._appState = AppStates.RUNNING;
            this._engine.hideLoadingUI();
        }, 15000);
    }
}

export default SpaceTruckerApplication