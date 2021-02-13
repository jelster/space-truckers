import StateMachine from "javascript-state-machine"
import AppStates from "./appstates"
import logger from "./logger"

class SpaceTruckerApplication {

    get currentState() {
        return this._appState || AppStates.Created;
    }

    get activeScene() {
        return this._currentScene;
    }

    constructor(engine) {
        const that = this;
        this._appState = AppStates.Created;
        this._engine = engine;
        this._currentScene = null;

        function createStateMachine() {
            return new StateMachine({
                init: AppStates.Created,
                transitions: [
                    { name: "launch", from: AppStates.Created, to: AppStates.Initializing },
                    { name: "initialized", from: AppStates.Initializing, to: AppStates.Running },
                    { name: "exit", from: AppStates.Exiting, to: AppStates.Exited }
                ],
                methods: {
                    onLaunch: () => logger.logInfo("onLaunch"),
                    onInitialized: () => {
                        logger.logInfo("onInitialized");
                        that._engine.hideLoadingUI();
                    },
                    onExit: () => logger.logInfo("onExit"),
                    onCreated: () => logger.logInfo("onCreated"),
                    onInitializing: () => { 
                        logger.logInfo("onInitializing"); 
                        that.initialize();
                    },
                    onRunning: () => {
                        logger.logInfo("onRunning");
                        that.run();
                    },
                    onExited: () => logger.logInfo("onExited")
                }
            });
        }
        this._stateMachine = createStateMachine();
        
        
    }

    initialize() {
        this._engine.displayLoadingUI();

        this._engine.enterFullscreen(true);
        setTimeout(() => {
            this._stateMachine.initialized();

        }, 15000);
    }
    run() {

    }
    start() {
        this._stateMachine.launch();

        // this puts us into the initializing state
         

    }
    exit() {

    }
}

export default SpaceTruckerApplication