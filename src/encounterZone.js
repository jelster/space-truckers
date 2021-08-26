import { ActionManager, Color3, ExecuteCodeAction, PredicateCondition } from "@babylonjs/core";
import { Observable } from "@babylonjs/core/Misc/observable";
import { TorusBuilder } from "@babylonjs/core/Meshes/Builders/torusBuilder";

import BaseGameObject from "./baseGameObject";

const encounterZones = {
    innerSystem: {
        name: "Inner System",
        innerBoundary: 250,
        outerBoundary: 800,
        encounterRate: 0.1,
        colorCode: "#00ff00"
    },
    asteroidBelt: {
        name: "Asteroid Belt",
        innerBoundary: 1000,
        outerBoundary: 1700,
        encounterRate: 0.2,
        colorCode: "#ff0000"
    },
    spaceHighway: {
        name: "Space Highway",
        innerBoundary: 1800,
        outerBoundary: 2500,
        encounterRate: 0.3,
        colorCode: "#ffff00"
    },
    outerSystem: {
        name: "Outer System",
        innerBoundary: 2600,
        outerBoundary: 5000,
        encounterRate: 0.4,
        colorCode: "#ff00ff"
    }
};
class SpaceTruckerEncounterZone extends BaseGameObject {
    name = "";
    innerBoundary = 0;
    outerBoundary = 0;
    colorCode = "#000000";
    encounterRate = 0.0;
    scene;
    meshToWatch;
    color = Color3.Black();
    onEnterObservable = new Observable();
    onExitObservable = new Observable();
    torusDiameter = 0.0;
    torusThickness = 0.0;
    constructor(definition, scene) {
        super(scene);
        this.name = definition.name;
        this.scene = scene;
        this.innerBoundary = definition.innerBoundary;
        this.outerBoundary = definition.outerBoundary;
        this.encounterRate = definition.encounterRate;
        this.colorCode = definition.colorCode;
        this.color = Color3.FromHexString(this.colorCode);
        this.torusDiameter = this.outerBoundary - (0.5 * (this.outerBoundary - this.innerBoundary)),
            this.torusThickness = (this.outerBoundary / 2 - this.innerBoundary / 2);
        this.mesh = TorusBuilder.CreateTorus(this.name, {
            diameter: 2 * this.torusDiameter,
            thickness: 2 * this.torusThickness,
            tesselation: 64
        }, scene);
        this.mesh.visibility = 0;
    }

    isWithinZone(position) {
        return true;
    }

    registerZoneIntersectionTrigger(meshToWatch) {
        this.meshToWatch = meshToWatch;
        if (!this.mesh.actionManager) {
            this.mesh.actionManager = new ActionManager(this.scene);
        }
        const zam = this.mesh.actionManager;
        const zact = this.intersectionEnterAction = new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: { mesh: meshToWatch, usePreciseIntersections: true }
        },
            (c1) => {
                this.onEnterObservable.notifyObservers(this);
                console.log('enter trigger ' + this.name);
            },
            new PredicateCondition(zam, () => this.isWithinZone(meshToWatch.absolutePosition))
        );

        const zext = this.intersectionExitAction = new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionExitTrigger,
            parameter: { mesh: meshToWatch, usePreciseIntersections: true }
        },
            (c1) => {
                this.onExitObservable.notifyObservers(this);
                console.log('exit trigger ' + this.name);
            },
            new PredicateCondition(zam, () => this.isWithinZone(meshToWatch.absolutePosition))
        );

        zam.registerAction(zact);
        zam.registerAction(zext);

        console.log('zone interesections registered');
    }

    unRegisterZoneIntersectionTrigger() {
        if (!this.meshToWatch) {
            return;
        }
        const zam = this.meshToWatch.actionManager;
        let zact = this.intersectEnterAction,
            zext = this.intersectExitAction;
        zam.unregisterAction(zext);
        zam.unregisterAction(zact);
    }
}

export default SpaceTruckerEncounterZone;
export { encounterZones };