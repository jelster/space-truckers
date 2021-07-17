import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import SpaceTruckerPlanningScreen, { PLAN_STATE_KEYS } from "./spaceTruckerPlanningScreen";
import { StackPanel } from "@babylonjs/gui";


class PlanningScreenGui {
    gui;
    scene;
    planningScreen;
    transitTime;
    transitDistance;
    gameStage;

    constructor(planningScreen) {
        this.scene = planningScreen.scene;
        //this.scene.autoClear = false;

        this.planningScreen = planningScreen;
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this.planningScreen.scene);


        this.planningScreen.onStateChangeObservable.add(state => {
            const currentState = state.currentState;
            this.onScreenStateChange(currentState);
        });

        this.scene.onBeforeRenderObservable.add(() => {
            this.updateControls();
        });
    }

    updateControls() {
        this.transitTime.text = `Time in transit: ${this.planningScreen.cargo.timeInTransit.toFixed(2)} s`;
        this.transitDistance.text = `Transit distance: ${this.planningScreen.cargo.distanceTraveled.toFixed(2)} m`;

        this.gameStage.text = `Current State: ${PLAN_STATE_KEYS[this.planningScreen.gameState]}`;
        this.launchForce.text = `Launch Force: ${this.planningScreen.launchForce.toFixed(3)} N`;
    }
    onScreenStateChange(newState) {
        switch (newState) {
            case SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch:
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.InFlight:
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.CargoDestroyed:
                this.gameStage.color = "red";
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
        
        planets.forEach(p => {
            let marker = this.createDisplayCageUi(p.mesh.name);
            
            let planetRec = marker.children[0];
          
            if (this.planningScreen.origin === p) {
                planetRec.color = "blue";
            }
            else if (this.planningScreen.destination === p) {
                planetRec.color = "yellow";
            }
            marker.linkWithMesh(p.mesh);
            marker.linkOffsetY = "6px";
        });

        this.screenUi = new StackPanel("screen-ui");
        this.screenUi.width = "100%";
        this.screenUi.height = "30%";
        this.screenUi.isHitTestVisible = false;
        this.screenUi.isPointerBlocker = false;
        this.screenUi.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.gui.addControl(this.screenUi);

        this.gameStage = new TextBlock("route-planning-stage", "Current State: Unknown");
        this.gameStage.fontSize = "48pt";
        this.gameStage.color = "white";
        this.gameStage.height = "60px";
        this.screenUi.addControl(this.gameStage);

        this.transitTime = new TextBlock("transit-time", "Transit time: 0s");
        this.transitTime.fontSize = "36pt";
        this.transitTime.color = "white";
        this.transitTime.height = "40px";
        this.screenUi.addControl(this.transitTime);

        this.transitDistance = new TextBlock("transit-distance", "Transit distance: 0m");
        this.transitDistance.fontSize = "36pt";
        this.transitDistance.color = "white";
        this.transitDistance.height = "40px";
        this.screenUi.addControl(this.transitDistance);

        this.launchForce = new TextBlock("launch-force", "Launch force: 0 N");
        this.launchForce.fontSize = "36pt";
        this.launchForce.color = "white";
        this.launchForce.height = "40px";
        this.screenUi.addControl(this.launchForce);

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
