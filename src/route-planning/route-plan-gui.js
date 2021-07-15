import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import SpaceTruckerPlanningScreen from "./spaceTruckerPlanningScreen";
import { StackPanel } from "@babylonjs/gui";

class PlanningScreenGui {
    gui;
    scene;
    planningScreen;
    constructor(planningScreen) {
        this.scene = planningScreen.scene;
        //this.scene.autoClear = false;

        this.planningScreen = planningScreen;
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this.planningScreen.scene);

        this.planningScreen.onStateChangeObservable.add(state => {
            const currentState = state.currentState;
            switch (currentState) {
                case SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch:
                    break;
                case SpaceTruckerPlanningScreen.PLANNING_STATE.InFlight:
                    break;
                case SpaceTruckerPlanningScreen.PLANNING_STATE.CargoDestroyed:
                    break;
                default:
                    break;
            }
        });
        //   engine.runRenderLoop(() => this.scene.render());

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
