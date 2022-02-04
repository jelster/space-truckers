import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Animation } from "@babylonjs/core/Animations/animation";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { PLAN_STATE_KEYS, PLANNING_STATE } from "./spaceTruckerPlanningScreen";
import { Grid, Image, Slider, StackPanel } from "@babylonjs/gui";
import guiScreen from "../guis/route-planning-gui.json";

class PlanningScreenGui {
    gui;
    scene;
    planningScreen;
    transitTime;
    transitDistance;
    gameStage;
    encounterPanels = [];

    #launchSlider;
    get launchForce() {
        return this.#launchSlider.value;
    }
    set launchForce(value) {
        this.#launchSlider.value = value;
    }

    #centerText;
    get centerText() {
        return this.#centerText.text;
    }
    set centerText(text) {
        this.#centerText.text = text;
    }

    #currentVelocityText;
    get currentVelocityText() {
        return this.#currentVelocityText.text;
    }
    set currentVelocityText(text) {
        this.#currentVelocityText.text = `Velocity: ${text} m/s`;
    }

    #currentAccelerationText;
    get currentAccelerationText() {
        return this.#currentAccelerationText.text;
    }
    set currentAccelerationText(text) {
        this.#currentAccelerationText.text = `Acceleration: ${text} m/s/s`;
    }

    #distanceText;
    get distanceText() {
        return this.#distanceText.text;
    }
    set distanceText(text) {
        this.#distanceText.text = `Distance: ${text} m`;
    }

    #simTimeText;
    get simTimeText() {
        return this.#simTimeText.text;
    }
    set simTimeText(timeInSeconds) {
        let timeString = (timeInSeconds / 60).toFixed(0) + "m:" + (timeInSeconds % 60).toFixed(2) + "s";
        this.#simTimeText.text = timeString;
    }
    #launchResetButton;
    get launchResetButton() {
        return this.#launchResetButton;
    }

    #routeSimulationText;
    get routeSimulationTextBox() {
        return this.#routeSimulationText;
    }

    constructor(planningScreen) {
        this.scene = planningScreen.scene;
        //this.scene.autoClear = false;

        this.planningScreen = planningScreen;
        let gui = this.gui = AdvancedDynamicTexture.CreateFullscreenUI("ui",
            true,
            this.planningScreen.scene,
            AdvancedDynamicTexture.NEAREST_NEAREST,
            true);
        gui.parseContent(guiScreen);
        this.#launchSlider = gui.getControlByName("launchSlider");
        this.#centerText = gui.getControlByName("centerText");
        this.#currentAccelerationText = gui.getControlByName("currentAccelerationText");
        this.#currentVelocityText = gui.getControlByName("currentVelocityText");
        this.#distanceText = gui.getControlByName("distanceText");
        this.#simTimeText = gui.getControlByName("simTimeText");
        this.#launchResetButton = gui.getControlByName("launchResetButton");
        this.#routeSimulationText = gui.getControlByName("routeSimulationText");

    }


    update() {
        let { gameState } = this.planningScreen;
        if (gameState === PLANNING_STATE.Created || gameState === PLANNING_STATE.Initialized) {
            return;
        }
        if (!this.gui) {
            return;
        }
        const transitTime = this.planningScreen.cargo.timeInTransit,
            transitDistance = this.planningScreen.cargo.distanceTraveled,
            launchF = this.planningScreen.launchForce,
            currentVelocity = this.planningScreen.cargo.lastVelocity.length(),
            currentAcceleration = this.planningScreen.cargo.lastGravity.length();

        this.launchForce = launchF;
        this.distanceText = transitDistance.toFixed(2);
        this.currentVelocityText = currentVelocity.toFixed(2);
        this.currentAccelerationText = currentAcceleration.toFixed(2);
        this.simTimeText = transitTime.toFixed(4);

        this.planningScreen.launchArrow.scaling.setAll(launchF * 0.05);

    }
    onScreenStateChange(newState) {
        switch (newState) {
            case PLANNING_STATE.ReadyToLaunch:
                this.centerText = "";
                this.launchResetButton.text = "LAUNCH";
                break;
            case PLANNING_STATE.InFlight:
                this.centerText = "";
                this.launchResetButton.text = "RESET";
                break;
            case PLANNING_STATE.CargoDestroyed:
                this.centerText = "Invalid Route - Cargo Destroyed";
                this.launchResetButton.text = "RESET";
                break;
            default:
                break;
        }
    }

    bindToScreen() {
        console.log("initializing route planning UI");

        const cargo = this.planningScreen.cargo;
        const planets = this.planningScreen.planets;

        const cargoDisplay = this.createDisplayCageUi(cargo.mesh.name);
        cargoDisplay.color = "green";
        cargoDisplay.linkWithMesh(cargo.mesh);

        // planets.forEach(p => {
        //     let marker = this.createDisplayCageUi(p.mesh.name);

        //     let planetRec = marker.children[0];

        //     if (this.planningScreen.origin === p) {
        //         planetRec.color = "blue";
        //     }
        //     else if (this.planningScreen.destination === p) {
        //         planetRec.color = "yellow";
        //     }
        //     marker.linkWithMesh(p.mesh);
        //     marker.linkOffsetY = "6px";
        // });

        this.#launchSlider.maximum = this.planningScreen.launchForceMax;
        this.#launchSlider.minimum = 10;
        this.#launchSlider.displayValueBar = true;
        this.#launchSlider.step = this.planningScreen.launchIncrement;
        this.#launchSlider.value = this.planningScreen.launchForce;
        this.#launchSlider.onValueChangedObservable.add((ev, es) => {
            this.planningScreen.launchForce = ev;
        });

        this.planningScreen.onStateChangeObservable.add(state => {
            const currentState = state.currentState;
            this.onScreenStateChange(currentState);
        });

        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });

    }

    createDisplayCageUi(name) {
        name = name || "unknown";
        let markerContainer = new StackPanel("panel-" + name);

        let startRectangle = new Rectangle("marker-" + name);
        startRectangle.height = "100px";
        startRectangle.width = "100px";
        startRectangle.thickness = 0.868;
        startRectangle.cornerRadius = 3;
        markerContainer.addControl(startRectangle);

        let startMarker = new TextBlock("title-" + name, name.toLocaleUpperCase());
        startMarker.paddingTop = "2px";
        startMarker.fontSize = "14pt";
        startMarker.color = "lightblue";
        startMarker.resizeToFit = true;
        startMarker.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        markerContainer.addControl(startMarker);

        this.gui.addControl(markerContainer);


        return markerContainer;
    }
}

export default PlanningScreenGui;
