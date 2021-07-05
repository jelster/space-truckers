import {Rectangle}  from "@babylonjs/gui/2D/controls/rectangle";
 
import { AdvancedDynamicTexture} from "@babylonjs/gui/2D/advancedDynamicTexture";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";
import {Control} from "@babylonjs/gui/2D/controls/control";
import SpaceTruckerPlanningScreen from "./spaceTruckerPlanningScreen";

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
                case SpaceTruckerPlanningScreen.PLANNING_STATE.CREATED:

                    break;
                case SpaceTruckerPlanningScreen.PLANNING_STATE.INITIALIZED:
                    break;
                default:
                    break;
            }
        });
        //   engine.runRenderLoop(() => this.scene.render());

    }

    bindToScreen() {
        console.log("initializing route planning UI");
        const cargoDisplay = this.createDisplayCageUi(this.planningScreen.cargo.mesh);
        cargoDisplay.color = "green";
        const planets = this.planningScreen.planets;
        planets.forEach(p => this.createDisplayCageUi(p.mesh));
    }

    createDisplayCageUi(mesh) {
        let startRectangle = new Rectangle("startRec");
        startRectangle.width = "90px";
        startRectangle.height = "90px";
        startRectangle.thickness = 0.768;
        startRectangle.cornerRadius = 3;
        let startMarker = new TextBlock("startTextBlock", mesh.name);
        startMarker.fontSize = "18pt";
        startMarker.color = "lightblue";

        startMarker.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        startRectangle.addControl(startMarker);

        this.gui.addControl(startRectangle);
        startRectangle.linkWithMesh(mesh);
        return startRectangle;
    }
}

export default PlanningScreenGui;
