
import AppStates from "./appstates"
import logger from "./logger"

class SpaceTruckerApplication {
    get currentState() {
        return this._appState || AppStates.INDETERMINATE;
    }
    constructor(engine) {
        this._engine = engine;
    }

    initialize() {
        logger.logInfo("App state changing to " + AppStates.INITIALIZING);

        this._appState = AppStates.INITIALIZING;
        this._engine.displayLoadingUI();
        logger.logInfo("Displayed loading UI");

        this._engine.enterFullscreen(true);
        setTimeout(() => {
            logger.logInfo("AppState Changing to " + AppStates.RUNNING);
            this._appState = AppStates.RUNNING;
            this._engine.hideLoadingUI();
        }, 15000);
    }
}

export default SpaceTruckerApplication