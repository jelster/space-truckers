
import AppStates from "./appstates"
import logger from "./logger"
import MainMenuScene from "./mainMenuScene";


class SpaceTruckerApplication {
    *appStateMachine() {
        let previousState = null;
        let currentState = null;
        function setState(newState) {
            previousState = currentState;
            currentState = newState;
            logger.logInfo("App state changed. Previous state:" + previousState + " New state: " + newState);
            return newState;
        }

        while (true) {
            let nextState = yield;
            if (nextState !== null && nextState !== undefined) {
                setState(nextState);
                if (nextState === AppStates.EXITING) {
                    return currentState;
                }
            }
        }
    }

    get currentState() {
        return this._stateMachine.next();
    }

    get activeScene() {
        return this._currentScene;
    }


    moveNextAppState(state) {
        return this._stateMachine.next(state).value;
    }

    constructor(engine) {
        this._engine = engine;
        this._currentScene = null;
        this._stateMachine = this.appStateMachine();
        this._mainMenu = null;

        this.moveNextAppState(AppStates.CREATED);
    }

    async initialize() {
        this._engine.enterFullscreen(true);

        // note: this will be replaced with the call done internally from AssetManager at some point
        this._engine.displayLoadingUI();
        
        this.moveNextAppState(AppStates.INITIALIZING)

        // for simulating loading times
        const p = new Promise((res, rej) => {
            setTimeout(() => res(), 5000);
        });

        await p;

        this._engine.hideLoadingUI();

       
    }

    async run() {
        await this.initialize();
        await this.goToMainMenu();

        this._engine.runRenderLoop(() => {
            // update loop
            let state = this.currentState;
            switch (state) {
                case AppStates.CREATED:
                case AppStates.INITIALIZING:
                    break;
                case AppStates.CUTSCENE:
                    logger.logInfo("App State: Cutscene");
                    break;
                case AppStates.MENU:
                    break;
                case AppStates.RUNNING:
                    this.goToOpeningCutscene();
                    break;
                case AppStates.EXITING:
                    this.exit();
                    break;
                default:
                    //             logger.logWarning("Unrecognized AppState value " + state);
                    break;
            }

            // render
            this._currentScene?.render();

        });
    }

    // State transition commands
    async goToOpeningCutscene() {
        this._engine.displayLoadingUI();
        this.moveNextAppState(AppStates.CUTSCENE);

        return Promise.resolve()
            .then(() => this._engine.hideLoadingUI());
    }

    async goToMainMenu() {
        this._engine.displayLoadingUI();
        this._mainMenu = new MainMenuScene(this._engine);
        this._currentScene = this._mainMenu.scene;

        this._engine.hideLoadingUI();
        this.moveNextAppState(AppStates.MENU);
        return Promise.resolve()
            .then(() => this._engine.hideLoadingUI());
    }

    exit() {

    }
}

export default SpaceTruckerApplication