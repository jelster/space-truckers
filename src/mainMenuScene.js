import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color4 } from "@babylonjs/core/Maths/math";
import { Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, Image } from "@babylonjs/gui";

import menuBackground from "../assets/menuBackground.png";

class MainMenuScene {

    get scene() {
        return this._scene;
    }
    constructor(engine) {
        this._engine = engine;
        let scene = this._scene = new Scene(engine);
        scene.clearColor = new Color4(0, 0, 0, 1);

        let camera = new ArcRotateCamera("menuCam", 0, 0, 1, Vector3.Zero(), scene, true);
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        const menuContainer = new Rectangle("menuContainer");
        menuContainer.width = 0.8;
        menuContainer.thickness = 0;
        guiMenu.addControl(menuContainer);

        const menuBg = new Image("menuBg", menuBackground);
        menuContainer.addControl(menuBg);
    }
}
export default MainMenuScene;