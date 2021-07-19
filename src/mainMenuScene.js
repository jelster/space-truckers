import { CylinderBuilder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color4 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture"
import { Scene, Vector3, Scalar, Sound, HemisphericLight } from "@babylonjs/core";
import { Observable } from "@babylonjs/core/Misc/observable";
import { AdvancedDynamicTexture, Rectangle, Image, Button, Control, TextBlock, Grid, TextWrapping } from "@babylonjs/gui";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures/starfield/starfieldProceduralTexture";
import { setAndStartTimer } from "@babylonjs/core/Misc/timer";
import logger from "./logger";
import SpaceTruckerInputProcessor from "./spaceTruckerInputProcessor";


import menuBackground from "../assets/menuBackground.png";

import selectionIcon from "../assets/ui-selection-icon.PNG";

const menuActionList = [
    { action: 'ACTIVATE', shouldBounce: () => true },
    { action: 'MOVE_UP', shouldBounce: () => true },
    { action: 'MOVE_DOWN', shouldBounce: () => true },
    { action: 'MOVE_RIGHT', shouldBounce: () => true },
    { action: 'MOVE_LEFT', shouldBounce: () => true },
    { action: 'GO_BACK', shouldBounce: () => true }
];

class MainMenuScene {
    inputManager;
    camera;
    selectedItemChanged = new Observable();
    actionState = {};
    lastActionState = null;
    onPlayActionObservable = new Observable();
    onExitActionObservable = new Observable();

    get scene() {
        return this._scene;
    }

    get selectedItem() {
        const row = this._menuGrid.getChildrenAt(this.selectedItemIndex, 1);
        if (row && row.length) {
            return row[0];
        }
        return null;
    }

    get selectedItemIndex() {
        return this._selectedItemIndex;
    }

    set selectedItemIndex(idx) {
        const itemCount = this._menuGrid.rowCount;
        const newIdx = Scalar.Repeat(idx, itemCount);
        this._selectedItemIndex = newIdx;
        this.selectedItemChanged.notifyObservers(newIdx);
    }
    constructor(engine, inputManager) {
        this._engine = engine;
        this._selectedItemIndex = -1;
        let scene = this._scene = new Scene(engine);

        scene.clearColor = new Color4(0, 0, 0, 1);

        this.camera = new ArcRotateCamera("menuCam", 0, 0, -30, Vector3.Zero(), scene, true);
        this._setupBackgroundEnvironment();
        this._setupUi();
        this._addMenuItems();
        this._createSelectorIcon();

        this.selectedItemChanged.add((idx) => {

            const menuGrid = this._menuGrid;
            const selectedItem = this.selectedItem;

            this._selectorIcon.isVisible = true;
            menuGrid.removeControl(this._selectorIcon);
            menuGrid.addControl(this._selectorIcon, idx);
        });

        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, menuActionList);
    }

    update() {
        // update and reset state variables to prepare for the update cycle
        this.actionProcessor?.update();
    }


    MOVE_UP(state) {
        logger.logInfo("MOVE_UP");
        if (!state) {
            const oldIdx = this.selectedItemIndex;
            const newIdx = oldIdx - 1;
            this.selectedItemIndex = newIdx;

        }
        return true;

    }

    MOVE_DOWN(state) {
        if (!state) {
            const oldIdx = this.selectedItemIndex;
            const newIdx = oldIdx + 1;
            logger.logInfo("MOVE_DOWN " + newIdx);
            this.selectedItemIndex = newIdx;
        }
        return lastState;

    }

    ACTIVATE(state, input) {

        if (!state) {
            // this is the first time through this action handler for this button press sequence
            console.log("ACIVATE - " + this.selectedItemIndex);
            const selectedItem = this.selectedItem;
            if (selectedItem) {
                selectedItem.onPointerClickObservable.notifyObservers();
            }

        }
        // indicate interest in maintaining state by returning anything other than 0, null, undefined, or false
        return true;
    }

    GO_BACK() {
        return false;
    }

    _setupBackgroundEnvironment() {
        const light = new HemisphericLight("light", new Vector3(0, 0.5, 0), this._scene);
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

    _setupUi() {
        const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        gui.renderAtIdealSize = true;
        this._guiMenu = gui;
        const menuContainer = new Rectangle("menuContainer");
        menuContainer.width = 0.8;
        menuContainer.thickness = 5;
        menuContainer.cornerRadius = 13;

        this._guiMenu.addControl(menuContainer);
        this._menuContainer = menuContainer;

        const menuBg = new Image("menuBg", menuBackground);
        menuContainer.addControl(menuBg);

        const menuGrid = new Grid("menuGrid");
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addRowDefinition(0.5);
        menuGrid.addRowDefinition(0.5);
        menuContainer.addControl(menuGrid);
        this._menuGrid = menuGrid;

        const titleText = new TextBlock("title", "Space-Truckers: The Main Menu");
        titleText.resizeToFit = true;
        titleText.textWrapping = TextWrapping.WordWrap;
        titleText.fontSize = "96pt";
        titleText.color = "white";
        titleText.width = 0.9;
        titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        titleText.paddingTop = titleText.paddingBottom = "18px";
        titleText.shadowOffsetX = 3;
        titleText.shadowOffsetY = 6;
        titleText.shadowBlur = 2;
        menuContainer.addControl(titleText);
    }

    _addMenuItems() {

        function createMenuItem(opts) {
            const btn = Button.CreateSimpleButton(opts.name || "", opts.title);
            btn.color = opts.color || "white";
            btn.background = opts.background || "green";
            btn.height = "80px";
            btn.thickness = 4;
            btn.cornerRadius = 80;
            btn.shadowOffsetY = 12;
            btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            btn.fontSize = "36pt";

            if (opts.onInvoked) {
                btn.onPointerClickObservable.add((ed, es) => opts.onInvoked(ed, es));
            }

            return btn;
        }

        const pbOpts = {
            name: "btPlay",
            title: "Play",
            background: "red",
            color: "white",
            onInvoked: () => {
                logger.logInfo("Play button clicked");
                this._onMenuLeave(1000, () => this.onPlayActionObservable.notifyObservers())
            }
        };
        const playButton = createMenuItem(pbOpts);
        this._menuGrid.addControl(playButton, this._menuGrid.children.length, 1);

        const ebOpts = {
            name: "btExit",
            title: "Exit",
            background: "white",
            color: "black",
            onInvoked: () => {
                logger.logInfo("Exit button clicked");
                this._onMenuLeave(1000,() => this.onExitActionObservable.notifyObservers());
                
            }
        }
        const exitButton = createMenuItem(ebOpts);
        this._menuGrid.addControl(exitButton, this._menuGrid.children.length, 1);

    }

    _createSelectorIcon() {
        const selectorIcon = new Image("selectorIcon", selectionIcon);
        selectorIcon.width = "160px";
        selectorIcon.height = "60px";
        selectorIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        selectorIcon.shadowOffsetX = 5;
        selectorIcon.shadowOffsetY = 3;

        selectorIcon.isVisible = false;
        this._menuGrid.addControl(selectorIcon, 1, 0);
        this._selectorIcon = selectorIcon;
        this._selectorAnimationFrame = 0;
        this._selectorIconHoverAnimation = this._scene.onBeforeRenderObservable.add(() => this._selectorIconAnimation());
    }

    _selectorIconAnimation() {
        const animTimeSeconds = Math.PI * 2;
        const dT = this._scene.getEngine().getDeltaTime() / 1000;
        this._selectorAnimationFrame = Scalar.Repeat(this._selectorAnimationFrame + dT * 5, animTimeSeconds * 10);
        this._selectorIcon.top = Math.sin(this._selectorAnimationFrame).toFixed(0) + "px";
    }

    _onMenuEnter(duration) {
        let fadeIn = 0;
        const fadeTime = duration || 1500;
        const timer = setAndStartTimer({
            timeout: fadeTime,
            contextObservable: this._scene.onBeforeRenderObservable,
            onTick: () => {
                const dT = this._scene.getEngine().getDeltaTime();
                fadeIn += dT;
                const currAmt = Scalar.SmoothStep(0, 1, fadeIn / fadeTime);
                this._menuContainer.alpha = currAmt;
            },
            onEnded: () => {
                this.selectedItemIndex = 0;
            }
        });
        return timer;
    }

    _onMenuLeave(duration, onEndedAction) {
        let fadeOut = 0;
        const fadeTime = duration || 1500;

        this._menuContainer.isVisible = false;

        const timer = setAndStartTimer({
            timeout: fadeTime,
            contextObservable: this._scene.onBeforeRenderObservable,
            onTick: () => {
                const dT = this._scene.getEngine().getDeltaTime();
                fadeOut += dT;
                const currAmt = Scalar.SmoothStep(1, 0, fadeOut / fadeTime);
                this._menuContainer.alpha = currAmt;

            },
            onEnded: () => {
                if (onEndedAction && typeof onEndedAction === 'function') {
                    onEndedAction();
                }
                
                //this._music.stop();

            }
        });
        return timer;
    }

}
export default MainMenuScene;