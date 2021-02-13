import { AdvancedDynamicTexture, GUI, TextBlock, Container } from "@babylonjs/gui";

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
        this._textContainer = AdvancedDynamicTexture.CreateFullscreenUI("loadingUI", true, this._startScene.scene);

        const textBlock = new TextBlock("textBlock", this._loadingText);
        textBlock.fontSize = "62pt";
        textBlock.color = "antiquewhite";
        textBlock.verticalAlignment = Container.VERTICAL_ALIGNMENT_BOTTOM;
        textBlock.paddingTop = "15%";

        this._textContainer.addControl(textBlock);

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
        if (this._progressAvailable) {
            this._loadingText = "Loading Space-Truckers: The Video Game... " + ((this._currentAmountLoaded / this._totalToLoad) * 100).toFixed(2);
        }
        
    }
}

export default SpaceTruckerLoadingScreen;