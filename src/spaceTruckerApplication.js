
import AppStates from "./appstates"
import logger from "./logger"
import MainMenuScene from "./mainMenuScene";
import SplashScene from "./splashScene";
import SpaceTruckerInputManager from "./spaceTruckerInput";

import appData from "./route-planning/gameData";
import SpaceTruckerPlanningScreen from "./route-planning/spaceTruckerPlanningScreen";
import SpaceTruckerDrivingScreen from "./driving/spaceTruckerDrivingScreen";

// TODO: conditionally include sample data in the build
import sampleRoute from "./driving/sample-route.json";
import sampleRoute2 from "./driving/sample-route2.json";
import sampleRoute3 from "./driving/sample-route3.json";
import sampleRoute4 from "./driving/sample-route4.json";
import sampleRoute5 from "./driving/sample-route5.json";

const sampleRoutes = {
    "sample-route": sampleRoute,
    "sample-route2": sampleRoute2,
    "sample-route3": sampleRoute3,
    "sample-route4": sampleRoute4,
    "sample-route5": sampleRoute5
};
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
        // TODO: conditionally enable or disable fullscreen based on checkbox or config
        //engine.enterFullscreen(false);

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
        this._routePlanningScene.routeAcceptedObservable.add(() => {
            this.goToDrivingState();
        });

        engine.hideLoadingUI();
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
                this._splashScreen.update(gameTime);
                if (this._splashScreen.skipRequested) {
                    logger.logInfo("in application onRender - skipping splash screen message");
                    this.goToMainMenu();
                    break;
                }
                break;
            case AppStates.MENU:
                this._mainMenu.update(gameTime);
                break;
            case AppStates.PLANNING:
                this?._routePlanningScene?.update(gameTime);
                break;
            case AppStates.DRIVING:
                this._drivingScene.update(gameTime);
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
        this._splashScreen.scene.dispose();
        this._splashScreen = null;

        this._currentScene = this._mainMenu;
        this.moveNextAppState(AppStates.MENU);
        this._mainMenu._onMenuEnter(1200);
        this._currentScene.actionProcessor.attachControl();
    }

    goToRunningState() {
        const queryString = window.location.search;
        if (queryString.toLowerCase().includes("testdrive")) {
            let routeParam = queryString.substring(queryString.indexOf("route=") + 6);
            let lookupRoute = sampleRoutes[routeParam];
            this.goToDrivingState(lookupRoute);
            return;
        }

        this._currentScene.actionProcessor.detachControl();
        this._currentScene = this._routePlanningScene;
        this.moveNextAppState(AppStates.PLANNING);
        this._currentScene.actionProcessor.attachControl();
        this._routePlanningScene.setReadyToLaunchState();
    }

    goToDrivingState(routeData) {
        routeData = routeData ?? this._routePlanningScene.routeData;
        this._currentScene.actionProcessor.detachControl();
        this._routePlanningScene?.dispose();
        this._routePlanningScene = null;
        this._drivingScene = new SpaceTruckerDrivingScreen(this._engine, routeData, this.inputManager);
        this._currentScene = this._drivingScene;
        this.moveNextAppState(AppStates.DRIVING);
        this._drivingScene.initialize().then(() => {
            this._currentScene.actionProcessor.attachControl();
            this._drivingScene.reset();
        });
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