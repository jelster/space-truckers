
import AppStates from "./appstates"
import logger from "./logger"
import MainMenuScene from "./mainMenuScene";
import SplashScene from "./splashScene";
import SpaceTruckerInputManager from "./spaceTruckerInput";
import SpaceTruckerInputProcessor from "./spaceTruckerInputProcessor";

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

    constructor(engine, enabledInputMethods) {
        this._engine = engine;
        this.enabledInputDevices = enabledInputMethods ||
            [{ deviceType: 1 }, { deviceType: 2 }, { deviceType: 3 }];
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
        this._mainMenu.actionProcessor = new SpaceTruckerInputProcessor(this._mainMenu, this.inputManager);
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
                this._splashScreen.update();

                if (this._splashScreen.skipRequested) {
                    this.goToMainMenu();
                }
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
        this._splashScreen.scene.attachControl();
        this._currentScene = this._splashScreen;
        this._splashScreen.run();
    }

    goToMainMenu() {
        this._splashScreen.scene.detachControl();
        this.moveNextAppState(AppStates.MENU);
        // this._mainMenu.scene.attachControl();
        this._currentScene = this._mainMenu;
    }

    exit() {
        this._engine.exitFullScreen();
    }
}

export default SpaceTruckerApplication