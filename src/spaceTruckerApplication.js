
import AppStates from "./appstates"
import logger from "./logger"
import MainMenuScene from "./mainMenuScene";
import SplashScene from "./splashScene";
 import SpaceTruckerInputManager from "./spaceTruckerInput";

import appData from "./route-planning/gameData";
import SpaceTruckerPlanningScreen from "./route-planning/spaceTruckerPlanningScreen"; 

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
        engine.enterFullscreen(false);

        engine.displayLoadingUI();

        this.moveNextAppState(AppStates.INITIALIZING);
        this._engine.loadingUIText = "Initializing Input...";
        this.inputManager = new SpaceTruckerInputManager(engine);

        this._engine.loadingUIText = "Loading Splash Scene...";
        this._splashScreen = new SplashScene(this._engine, this.inputManager);

        this._engine.loadingUIText = "Loading Main Menu...";
        this._mainMenu = new MainMenuScene(this._engine, this.inputManager);
        this._splashScreen.onReadyObservable.addOnce(() => {
            this.goToOpeningCutscene();
        });
        this._mainMenu.onExitActionObservable.addOnce(() => this.exit());
        this._mainMenu.onPlayActionObservable.add(() => this.goToRunningState());
        
        this._engine.loadingUIText = "Loading Route Planning...";
        this._routePlanningScene = new SpaceTruckerPlanningScreen(this._engine, this.inputManager, appData);  
        
        this._routePlanningScene.routeAcceptedObservable.add(() => this.goToDrivingState());
    }

    run() {
        this.initialize();
        this._engine.runRenderLoop(() => this.onRender());
    }

    onRender() {
        // update loop. Inputs are routed to the active state's scene.
        let state = this.currentState;
        const gameTime = this._engine.getDeltaTime() / 1000;
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
            case AppStates.PLANNING:
                this?._routePlanningScene.update(gameTime);
                break;
            case AppStates.DRIVING:

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

        this._splashScreen.onReadyObservable.addOnce(() => this._engine.hideLoadingUI());
        this._splashScreen.actionProcessor.attachControl();
        this._currentScene = this._splashScreen;
        this._splashScreen.run();
    }

    goToMainMenu() {
        this._currentScene.actionProcessor.detachControl();
        this._currentScene = this._mainMenu;
        this.moveNextAppState(AppStates.MENU);
        this._currentScene.actionProcessor.attachControl();
    }

    goToRunningState() {
        this._currentScene.actionProcessor.detachControl();
        
        this._currentScene = this._routePlanningScene;

        this.moveNextAppState(AppStates.PLANNING);        
        this._currentScene.actionProcessor.attachControl();
        this._routePlanningScene.setReadyToLaunchState();        
    }

    goToDrivingState() {
        // extract route data from planning scene
        const routeData = this._routePlanningScene.routePath;
        // create new driving scene with route data

        // set current scene to driving scene
        this._currentScene.actionProcessor.detachControl();

        // go to driving state
        this.moveNextAppState(AppStates.DRIVING);
    }

    exit() {
        this._engine.exitFullscreen();
        this.moveNextAppState(AppStates.EXITING);
        if (window) {
            this._engine.dispose();
            window.location?.reload();
        }
    }
}

export default SpaceTruckerApplication