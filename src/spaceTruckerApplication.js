
import AppStates from "./appstates"
import logger from "./logger"
import MainMenuScene from "./mainMenuScene";
import SplashScene from "./splashScene";
import SpaceTruckerInputManager from "./spaceTruckerInput";

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
            let nextState = yield currentState;
            if (nextState !== null && nextState !== undefined) {
                setState(nextState);
                if (nextState === AppStates.EXITING) {
                    return currentState;
                }
            }
        }
    }

    get currentState() {
        return this._stateMachine.next().value;
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

        engine.displayLoadingUI();

        this.moveNextAppState(AppStates.INITIALIZING);
        this.inputManager = new SpaceTruckerInputManager(engine);

        this._splashScreen = new SplashScene(this._engine, this.inputManager);
        this._mainMenu = new MainMenuScene(this._engine, this.inputManager);
        this._splashScreen.onReadyObservable.addOnce(() => {
            this.goToOpeningCutscene();
        });
    }

    run() {
        this.initialize();
        this._engine.runRenderLoop(() => this.onRender());
    }

    onRender() {
        // update loop. Inputs are routed to the active state's scene.
        let state = this.currentState;

        switch (state) {
            case AppStates.CREATED:
            case AppStates.INITIALIZING:
                break;
            case AppStates.CUTSCENE:
                if (this._splashScreen.skipRequested) {
                    this.goToMainMenu();
                    logger.logInfo("in application onRender - skipping splash screen message");
                }
                this._splashScreen.update();

                break;
            case AppStates.MENU:
                this._mainMenu.update();

                break;
            case AppStates.RUNNING:

                break;
            case AppStates.EXITING:

                break;
            default:
                break;
        }

        // render
        this.activeScene?.scene?.render();
    }

    // State transition commands
    goToOpeningCutscene() {
        this.moveNextAppState(AppStates.CUTSCENE);

        this._engine.hideLoadingUI();
        this._splashScreen.actionProcessor.attachControl();
        this._currentScene = this._splashScreen;
        this._splashScreen.run();
    }

    goToMainMenu() {
        this._splashScreen.actionProcessor.detachControl();
        this._currentScene = this._mainMenu;
        this.moveNextAppState(AppStates.MENU);
        this._mainMenu.actionProcessor.attachControl();
        
    }

    exit() {
        this._engine.exitFullScreen();
    }
}

export default SpaceTruckerApplication