
import AppStates from "./appstates"
import logger from "./logger"
import MainMenuScene from "./mainMenuScene";
import SplashScene from "./splashScene";
import SpaceTruckerInputManager from "./spaceTruckerInput";

import appData from "./route-planning/gameData";
import SpaceTruckerPlanningScreen, { PLANNING_STATE } from "./route-planning/spaceTruckerPlanningScreen";
import setBaseAssetUrl from "./systems/setBaseAssetUrl";
import SpaceTruckerDrivingScreen from "./driving/spaceTruckerDrivingScreen";

// TODO: conditionally include sample data in the build
import sampleRoute from "./driving/sample-route.json";
import sampleRoute2 from "./driving/sample-route2.json";
import sampleRoute3 from "./driving/sample-route3.json";
import sampleRoute4 from "./driving/sample-route4.json";
import sampleRoute5 from "./driving/sample-route5.json";
import sampleRoute6 from "./driving/sample-route6.json";

setBaseAssetUrl();
const sampleRoutes = {
    "sample-route": sampleRoute,
    "sample-route2": sampleRoute2,
    "sample-route3": sampleRoute3,
    "sample-route4": sampleRoute4,
    "sample-route5": sampleRoute5,
    "sample-route6": sampleRoute6
};

const driveModeInputMapPatches = {
    w: "MOVE_IN", W: "MOVE_IN",
    s: "MOVE_OUT", S: "MOVE_OUT",
    ArrowUp: 'MOVE_UP',
    ArrowDown: 'MOVE_DOWN',
    ArrowLeft: 'ROTATE_LEFT',
    ArrowRight: 'ROTATE_RIGHT',
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

        this._splashScreen.onReadyObservable.addOnce(() => {
            this.goToOpeningCutscene();
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
        this._currentScene = this._splashScreen;
        this._splashScreen.run();
    }

    goToMainMenu() {
        this._currentScene?.actionProcessor?.detachControl();
        if (this._currentScene.scene) {
            this._currentScene.scene.dispose();
        }
        this._currentScene = null;
        this._mainMenu = new MainMenuScene(this._engine, this.inputManager);
        this._mainMenu.onExitActionObservable.addOnce(() => this.exit());
        this._mainMenu.onPlayActionObservable.addOnce(() => this.goToRunningState());
        this._currentScene = this._mainMenu;
        this.moveNextAppState(AppStates.MENU);
        this._mainMenu._onMenuEnter(1200);
        this._currentScene.actionProcessor.attachControl();
    }

    goToRunningState() {
        const queryString = window.location.search;
        this._currentScene.actionProcessor.detachControl();
        if (queryString.toLowerCase().includes("testdrive")) {
            let routeParam = queryString.substring(queryString.indexOf("route=") + 6);
            let lookupRoute = sampleRoutes[routeParam];
            this.goToDrivingState(lookupRoute);
            return;
        }
        this._engine.loadingUIText = "Loading Route Planning...";
        this._routePlanningScene = new SpaceTruckerPlanningScreen(this._engine, this.inputManager, appData);
        this._routePlanningScene.onStateChangeObservable.add((ev, es) => {
            if (ev.currentState === PLANNING_STATE.Initialized) {
                this._currentScene = this._routePlanningScene;
                this.moveNextAppState(AppStates.PLANNING);
                this._currentScene.actionProcessor.attachControl();
                this._routePlanningScene.setReadyToLaunchState();
                this._routePlanningScene.routeAcceptedObservable.add(() => {
                    this.goToDrivingState();
                });
            }
        });
    }

    goToDrivingState(routeData) {
        this._engine.displayLoadingUI();
        routeData = routeData ?? this._routePlanningScene.routeData;
        this._currentScene.actionProcessor.detachControl();

        let driveControls = { ...this.inputManager.controlsMap, ...driveModeInputMapPatches };
        let driveInputManager = new SpaceTruckerInputManager(this._engine, driveControls);
        this._drivingScene = new SpaceTruckerDrivingScreen(this._engine, routeData, driveInputManager);

        this.moveNextAppState(AppStates.DRIVING);
        this._drivingScene.initialize().then(() => {
            if (this._currentScene.dispose) {
                this._currentScene?.dispose();
            }
            this._currentScene = null;
            this._currentScene = this._drivingScene;
            this._currentScene.actionProcessor.attachControl();
            this._engine.hideLoadingUI();
            this._drivingScene.reset();
        });
        this._drivingScene.onExitObservable.addOnce(() => {
            this.goToMainMenu();
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