
import AppStates from "./appstates"
import logger from "./logger"


class SpaceTruckerApplication {
    *appStateMachine() {
        let previousState = AppStates.INDETERMINATE;
        let currentState = AppStates.LAUNCHED;
        const app = this;
        function setState(newState) {
            previousState = currentState;
            currentState = newState;
            logger.logInfo("App state changed. Previous state:" + previousState + " New state: " + newState);
            return newState;
        }

        while (true) {
            // initial state of application
            yield setState(AppStates.LAUNCHED);  
            
            // resume here on the call to .next()               
            yield setState(AppStates.INITIALIZING);
            
            yield setState(AppStates.RUNNING);
        
            yield setState(AppStates.EXITED);
    
        }
    }
        
    get currentState() {
        return this._appState || AppStates.INDETERMINATE;
    }

    get activeScene() {
        return this._currentScene;
    }

    moveNextAppState() {
        this._appState = this._stateMachine.next().value;
    }

    constructor(engine) {
        this._appState = AppStates.CREATED;
        this._engine = engine;
        this._currentScene = null;
        this._stateMachine = this.appStateMachine();

        this.moveNextAppState();
    }
    
    initialize() {       
        this._engine.displayLoadingUI();
        
        this._engine.enterFullscreen(true);
        setTimeout(() => {
            
             
            this._engine.hideLoadingUI();
            this._appState = this._stateMachine.next();

        }, 15000);
    }

    run() {
        this.initialize(); 
        // this puts us into the initializing state
        this.moveNextAppState();

    }
    exit() {

    }
}

export default SpaceTruckerApplication