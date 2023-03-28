import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import {  PLANNING_STATE } from "./spaceTruckerPlanningScreen";
import { StackPanel } from "@babylonjs/gui";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import guiScreen from "../guis/route-planning-gui.json";

import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { RotationGizmo } from "@babylonjs/core/Gizmos/rotationGizmo";

const GUI_LAYER_MASK = 2;
class PlanningScreenGui {
    gui;
    scene;
    planningScreen;
    transitTime;
    transitDistance;
    gameStage;
    encounterPanels = [];
    guiCamera;

    #launchSlider;
    #cargoRotationGizmo;
    #utilityLayer;

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

        this.#utilityLayer = UtilityLayerRenderer.DefaultUtilityLayer;
        this.planningScreen = planningScreen;
        let gui = this.gui = AdvancedDynamicTexture.CreateFullscreenUI("ui",
            true,
            this.#utilityLayer.utilityLayerScene,
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
                this.#cargoRotationGizmo.attachedMesh = this.planningScreen.cargo.mesh;
                break;
            case PLANNING_STATE.InFlight:
                this.centerText = "";
                this.launchResetButton.text = "RESET";
                this.#cargoRotationGizmo.attachedMesh = null;
                break;
            case PLANNING_STATE.CargoDestroyed:
                this.centerText = "Invalid Route - Cargo Destroyed";
                this.launchResetButton.text = "RESET";
                break;
            case PLANNING_STATE.Paused:
                this.centerText = "Paused";
                this.launchResetButton.text = "RESET";
                this.#cargoRotationGizmo.attachedMesh = null;
                break;
            default:
                break;
        }
    }

    *routeSimulationTextCoroutine() {
        const routeSimulationCornerText = this.#routeSimulationText;
        let frameCount = 0;
        const totalFrames = 90;
        let direction = 1;
        while (true) {
            let { gameState } = this.planningScreen;
            if (gameState === PLANNING_STATE.CargoDestroyed) {
                routeSimulationCornerText.text = "CARGO DESTROYED";
                yield;
            }
            if (gameState === PLANNING_STATE.ReadyToLaunch || gameState === PLANNING_STATE.InFlight) {
                routeSimulationCornerText.text = "SIMULATING ROUTE...";
                let progress = frameCount / totalFrames;
                if (direction > 0) {
                    routeSimulationCornerText.alpha = Scalar.SmoothStep(0, 1, progress);
                }
                else {
                    routeSimulationCornerText.alpha = Scalar.SmoothStep(1, 0, progress);
                }
                if (frameCount >= totalFrames) {
                    direction *= -1;
                    frameCount = 0;
                }
                frameCount++;
                yield;
            }
            else {
                routeSimulationCornerText.alpha = 1;
                routeSimulationCornerText.text = "SIMULATION PAUSED";
            }
            yield;
        }
    }

    bindToScreen() {
        console.log("initializing route planning UI");

        const cargo = this.planningScreen.cargo;
        const planets = this.planningScreen.planets;

        const cargoDisplay = this.createDisplayCageUi(cargo.mesh.name);
        cargoDisplay.color = "green";
        cargoDisplay.linkWithMesh(cargo.mesh);

        planets.forEach(p => {

            if (this.planningScreen.destination === p) {
                let marker = this.createDisplayCageUi(p.mesh.name);

                let planetRec = marker.children[0];
                planetRec.color = "yellow";
                marker.linkWithMesh(p.mesh);
                marker.linkOffsetY = "6px";
            }

        });
        this.#launchResetButton.isHitTestVisible = true;
        this.#launchResetButton.isPointerBlocker = true;
        this.#launchResetButton.onPointerClickObservable.add(() => {
            if (this.planningScreen.gameState === PLANNING_STATE.ReadyToLaunch) {
                this.planningScreen.ACTIVATE(true);
            }
            else {
                this.planningScreen.GO_BACK();
            }
        });
        this.#launchSlider.isHitTestVisible = true;
        this.#launchSlider.isPointerBlocker = true;
        this.#launchSlider.maximum = this.planningScreen.launchForceMax;
        this.#launchSlider.minimum = 10;
        this.#launchSlider.displayValueBar = true;
        this.#launchSlider.step = this.planningScreen.launchForceIncrement;
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
        this.scene.onBeforeRenderObservable.runCoroutineAsync(this.routeSimulationTextCoroutine());

         
        this.#cargoRotationGizmo = new RotationGizmo(this.#utilityLayer, null, null, 1.2);
        this.#cargoRotationGizmo.scaleRatio = 1.15;
        this.#cargoRotationGizmo.attachedMesh = cargo.mesh;

        this.#cargoRotationGizmo.updateGizmoPositionToMatchAttachedMesh = true;
        this.#cargoRotationGizmo.updateGizmoRotationToMatchAttachedMesh = true;
        this.#cargoRotationGizmo.updateScale = true;



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
