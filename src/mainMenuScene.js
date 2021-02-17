import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color4 } from "@babylonjs/core/Maths/math";
import { Scene, Vector3, Sound } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, Image } from "@babylonjs/gui";

import menuBackground from "../assets/menuBackground.png";
import titleMusic  from "../assets/sounds/space-trucker-title-theme.m4a";

class MainMenuScene {

    get scene() {
        return this._scene;
    }
    constructor(engine) {
        this._engine = engine;
        let scene = this._scene = new Scene(engine);
        scene.clearColor = new Color4(0, 0, 0, 1);

        const camera = new ArcRotateCamera("menuCam", 0, 0, 1, Vector3.Zero(), scene, true);
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        const menuContainer = new Rectangle("menuContainer");
        menuContainer.width = 0.8;
        menuContainer.thickness = 0;
        guiMenu.addControl(menuContainer);

        const menuBg = new Image("menuBg", menuBackground);
        menuContainer.addControl(menuBg);

        // TODO: Use asset manager instead of directly instantiating
        this._music = new Sound("titleMusic", titleMusic, scene, null, {autoplay: true, loop: true, volume: 0.4 });
        
    }
}
export default MainMenuScene;