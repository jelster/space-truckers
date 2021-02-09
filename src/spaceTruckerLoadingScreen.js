import createStartScene from "./startscene";

class SpaceTruckerLoadingScreen {
    get progressAvailable() {
        return this._progressAvailable;
    }
    get currentAmountLoaded() {
        return this._currentAmountLoaded;
    }
    get totalToLoad() {
        return this._totalToLoad;
    }

    get loadingUIText() {
        return this._loadingText;
    }
    constructor(engine) {
        this._totalToLoad = 0.00;
        this._loadingText = "Loading Space-Truckers: The Video Game...";
        this._currentAmountLoaded = 0.00;
        this._engine = engine;
        this._startScene = createStartScene(engine);
        engine.runRenderLoop(() => {
            if (this._startScene && this._active === true) {
                this._startScene.scene.render();
            }
        });
    }

    displayLoadingUI() {
        this._active = true;        

    }

    hideLoadingUI() {
        this._active = false;   
    }

    onProgressHandler(evt) {
        this._progressAvailable = evt.lengthComputable === true;
        this._currentAmountLoaded = evt.loaded || this.currentAmountLoaded;
        this._totalToLoad = evt.total || this.currentAmountLoaded;
    }
}

export default SpaceTruckerLoadingScreen;