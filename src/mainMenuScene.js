import { CylinderBuilder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color4 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture"
import { Scene, Vector3, Sound, HemisphericLight } from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, Image, Button, StackPanel, Control, TextBlock } from "@babylonjs/gui";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures/starfield/starfieldProceduralTexture";
import menuBackground from "../assets/menuBackground.png";
import titleMusic from "../assets/sounds/space-trucker-title-theme.m4a";

class MainMenuScene {

    get scene() {
        return this._scene;
    }
    constructor(engine) {
        this._engine = engine;
        let scene = this._scene = new Scene(engine);
        // TODO: Use asset manager instead of directly instantiating
        this._music = new Sound("titleMusic", titleMusic, scene, null, { autoplay: true, loop: true, volume: 0.4 });
        scene.clearColor = new Color4(0, 0, 0, 1);

        const camera = new ArcRotateCamera("menuCam", 0, 0, -30, Vector3.Zero(), scene, true);
        this._setupBackgroundEnvironment();
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        const menuContainer = new Rectangle("menuContainer");
        menuContainer.width = 0.8;
        menuContainer.thickness = 0;
        guiMenu.addControl(menuContainer);

        // TODO: find/make a better background image!
        const menuBg = new Image("menuBg", menuBackground);
        menuContainer.addControl(menuBg);

        const menuPanel = new StackPanel("menuPanel");
       // menuPanel.background = "rgba(150, 150, 150, 0.67)";
        menuPanel.height = 0.9;
        menuPanel.top = 0.05;
        menuPanel.bottom = 0.05;
        menuContainer.addControl(menuPanel);

        const titleText = new TextBlock("title", "Space-Truckers: The Video Game!");
        titleText.resizeToFit = true;
        titleText.fontSize = "56pt";
        titleText.color = "white";
        
        titleText.width = 0.8;
        titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        titleText.paddingBottom = "28px";
        menuPanel.addControl(titleText);
        // buttonStyle.fontFamily = "Comic Sans Serif";


        // TODO: extract this into a menu item factory method
        const playButton = Button.CreateSimpleButton("btPlay", "Play");
        playButton.fontSize = "36pt";
        playButton.color = "white";
        playButton.background = "red";
        playButton.height = "80px";
        playButton.width = "160px"
        playButton.thickness = 4;
        playButton.cornerRadius = 105;

        playButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        menuPanel.addControl(playButton);
    }

    _setupBackgroundEnvironment() {
        const light = new HemisphericLight("light", new Vector3(0,0.5, 0), this._scene);
        const starfieldPT = new StarfieldProceduralTexture("starfieldPT", 512, this._scene);
        const starfieldMat = new StandardMaterial("starfield", this._scene);
        const space = CylinderBuilder.CreateCylinder("space", { height: 100, diameterTop: 0, diameterBottom: 60 }, this._scene);
        starfieldMat.diffuseTexture = starfieldPT;
        starfieldMat.diffuseTexture.coordinatesMode = Texture.SKYBOX_MODE;
        starfieldMat.backFaceCulling = false;
        starfieldPT.beta = 0.1;

        space.material = starfieldMat;

        this._starfieldAnimationHandle = this._scene.registerBeforeRender(() => starfieldPT.time += this._scene.getEngine().getDeltaTime() / 1000);

    }
}
export default MainMenuScene;