
import AppStates from "./appstates"
import logger from "./logger"
import MainMenuScene from "./mainMenuScene";
import SplashScene from "./splashScene";


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

    initialize() {
        const engine = this._engine;
        engine.enterFullscreen(true);

        // note: this will be replaced with the call done internally from AssetManager at some point
        engine.displayLoadingUI();

        this.moveNextAppState(AppStates.INITIALIZING)
        this._splashScreen = new SplashScene(this._engine);
        this._mainMenu = new MainMenuScene(this._engine);
        this.goToOpeningCutscene();
        //  this._engine.hideLoadingUI();       
    }

    run() {
        this.initialize();

        this._engine.runRenderLoop(() => {
            // update loop
            let state = this.currentState;
            switch (state) {
                case AppStates.CREATED:
                case AppStates.INITIALIZING:
                    break;
                case AppStates.CUTSCENE:
                     
                    if (this._splashScreen.skipRequested) {
                        this.goToMainMenu();
                    }

                    break;
                case AppStates.MENU:
                   
                    break;
                case AppStates.RUNNING:

                    break;
                case AppStates.EXITING:
                   
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
    goToOpeningCutscene() {
        this._splashScreen.onReadyObservable.add(() => {
            this.moveNextAppState(AppStates.CUTSCENE);
            this._currentScene = this._splashScreen.scene;
            this._engine.hideLoadingUI();
            this._splashScreen.run();
        });
    }

    goToMainMenu() {

        this.moveNextAppState(AppStates.MENU);
        this._currentScene = this._mainMenu.scene;

    }

    exit() {

    }
}

export default SpaceTruckerApplication