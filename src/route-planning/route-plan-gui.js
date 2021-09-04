import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Animation } from "@babylonjs/core/Animations/animation";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import SpaceTruckerPlanningScreen, { PLAN_STATE_KEYS, PLANNING_STATE } from "./spaceTruckerPlanningScreen";
import { Grid, Image, Slider, StackPanel } from "@babylonjs/gui";
import { AnimationGroup } from "@babylonjs/core";

const panelShrinkX = new Animation("shrinkImageAnimationX", "scaleX", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
const panelShrinkY = new Animation("shrinkImageAnimationY", "scaleY", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
const keys = [];
keys.push({ frame: 0, value: 1.0});
keys.push({ frame: 120, value: 0.40 });
keys.push({ frame: 180, value: 0.05375 });
panelShrinkX.setKeys(keys);
panelShrinkY.setKeys(keys);



class PlanningScreenGui {
    gui;
    scene;
    planningScreen;
    transitTime;
    transitDistance;
    gameStage;
    encounterPanels = [];

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
            this.update();
        });

        this.planningScreen.encounterManager.onNewEncounterObservable.add(encounterIdx => {
            let evt = this.planningScreen.encounterManager.encounterEvents[encounterIdx];
            console.log('encounter gui', evt);
            if (evt && evt.encounter?.id) {
                const encounter = evt.encounter;
                let panel = new Rectangle("panel-" + encounter.name);
                let image = new Image("image-" + encounter.name, encounter.image);
                image.alpha = 0.68;
                panel.addControl(image);
                panel.thickness = 0;
                this.gui.addControl(panel);
                this.encounterPanels.push(panel);
                panel.linkWithMesh(evt.cargoData);
                let animationGroup = new AnimationGroup("shrinkAnimationGroup-"+ encounter.name, this.scene);
                animationGroup.addTargetedAnimation(panelShrinkX, panel);
                animationGroup.addTargetedAnimation(panelShrinkY, panel);
                animationGroup.start(false, 1.0, 0, 180, true);                
            }
           
        });
    }


    update() {
        if (this.planningScreen.gameState === PLANNING_STATE.Initialized) {
            return;
        }
        const gameStage = PLAN_STATE_KEYS[this.planningScreen.gameState],
            transitTime = this.planningScreen.cargo.timeInTransit,
            transitDistance = this.planningScreen.cargo.distanceTraveled,
            launchForce = this.planningScreen.launchForce,
            currentVelocity = this.planningScreen.cargo.lastVelocity.length(),
            currentGravity = this.planningScreen.cargo.lastGravity,
            encounterManager = this.planningScreen.encounterManager;
        
        this.launchSlider.value = launchForce;
        this.launchForce.text = `Launch Force: ${launchForce.toFixed(2)} N`;
        
        this.transitTime.text = `Time in transit: ${transitTime.toFixed(2)} s`;
        this.transitDistance.text = `Transit distance: ${transitDistance.toFixed(2)} m`;
        this.currentVelocity.text = `Current velocity: ${currentVelocity.toFixed(2)} m/s`;
        this.gameStage.text = `Current State: ${gameStage}`;
        this.currentGravity.text = `Grav. Accel.: ${currentGravity.length().toFixed(3)} m/s^2`;
        this.currentZone.text = `Current Zone (in/out): ${encounterManager.currentZone?.name}`;
        
        this.planningScreen.launchArrow.scaling.setAll(launchForce * 0.05);

    }
    onScreenStateChange(newState) {
        switch (newState) {
            case PLANNING_STATE.ReadyToLaunch:
                this.gameStage.color = "white";

                this.currentVelocity.isVisible = false;
                this.transitDistance.isVisible = false;
                this.transitTime.isVisible = false;
                this.currentZone.isVisible = false;

                this.launchForce.isVisible = true;
                this.launchSlider.isVisible = true;
                this.encounterPanels.forEach(panel => {
                    panel.children.forEach(child => child.dispose());
                    panel.dispose();
                });
                break;
            case PLANNING_STATE.InFlight:
                this.gameStage.color = "lightblue";

                this.currentVelocity.isVisible = true;
                this.transitDistance.isVisible = true;
                this.transitTime.isVisible = true;
                this.currentGravity.isVisible = true;
                this.currentZone.isVisible = true;


                this.launchSlider.isVisible = false;
                break;
            case PLANNING_STATE.CargoDestroyed:
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

        this.screenUi = new Grid("screen-ui");        
        this.screenUi.setPadding(20, 20, 20, 20);
        this.screenUi.addRowDefinition(0.2, false);
        this.screenUi.addRowDefinition(0.4, false);
        this.screenUi.addRowDefinition(0.4, false);
        this.screenUi.isHitTestVisible = false;
        this.screenUi.isPointerBlocker = false;
        this.gui.addControl(this.screenUi);

        this.bottomDisplayPanel = new StackPanel("bottom-display-panel");
        this.bottomDisplayPanel.height = "100%";
        this.bottomDisplayPanel.isVertical = false;
        this.bottomDisplayPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.screenUi.addControl(this.bottomDisplayPanel, 2);       

        this.topDisplayPanel = new StackPanel("top-display-panel");
        this.topDisplayPanel.width = "100%";
        this.screenUi.addControl(this.topDisplayPanel, 0);        

        this.gameStage = new TextBlock("route-planning-stage", "Current State: Unknown");
        this.gameStage.fontSize = "48pt";
        this.gameStage.color = "white";
        this.gameStage.height = "60px";
        this.topDisplayPanel.addControl(this.gameStage);

        this.transitTime = new TextBlock("transit-time", "Transit time: 0s");
        this.transitTime.fontSize = "36pt";
        this.transitTime.color = "white";
        this.transitTime.height = "40px";
        this.topDisplayPanel.addControl(this.transitTime);
        this.transitTime.isVisible = false;

        this.transitDistance = new TextBlock("transit-distance", "Transit distance: 0m");
        this.transitDistance.fontSize = "36pt";
        this.transitDistance.color = "white";
        this.transitDistance.height = "40px";
        this.topDisplayPanel.addControl(this.transitDistance);
        this.transitDistance.isVisible = false;

        this.launchForce = new TextBlock("launch-force", "Launch force: 0 N");
        this.launchForce.fontSize = "36pt";
        this.launchForce.color = "white";
        this.launchForce.height = "40px";
        
        this.topDisplayPanel.addControl(this.launchForce);

        this.currentVelocity = new TextBlock("current-velocity", "Current velocity: 0 m/s");
        this.currentVelocity.fontSize = "36pt";
        this.currentVelocity.color = "white";
        this.currentVelocity.height = "40px";
        this.currentVelocity.isVisible = false;
        this.topDisplayPanel.addControl(this.currentVelocity);

        this.currentGravity = new TextBlock("current-gravity", "Current gravity: 0 m/s^2");
        this.currentGravity.fontSize = "36pt";
        this.currentGravity.color = "white";
        this.currentGravity.height = "40px";
        this.currentGravity.isVisible = false;
        this.topDisplayPanel.addControl(this.currentGravity);

        this.currentZone = new TextBlock("current-zone", "Current zone: Unknown");
        this.currentZone.fontSize = "36pt";
        this.currentZone.color = "white";
        this.currentZone.height = "40px";
        this.currentZone.isVisible = false;
        this.topDisplayPanel.addControl(this.currentZone);

        this.launchSlider = new Slider("launchSlider");
        this.launchSlider.height = "600px";
        this.launchSlider.width = "90px";
        //this.launchSlider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.launchSlider.isThumbClamped = true;
        this.launchSlider.isVertical = true;
        this.launchSlider.thumbColor = "black";
        this.launchSlider.barOffset = "15px"
        this.launchSlider.color = "white";
        this.launchSlider.maximum = this.planningScreen.launchForceMax;
        this.launchSlider.minimum = 10;
        this.launchSlider.displayValueBar = true;
        this.launchSlider.step = this.planningScreen.launchIncrement;
        this.launchSlider.value = this.planningScreen.launchForce;
        this.launchSlider.onValueChangedObservable.add((ev, es) => {
            this.planningScreen.launchForce = ev;            
        });
        this.bottomDisplayPanel.addControl(this.launchSlider);
        
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
