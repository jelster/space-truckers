import { ActionManager, Color3, ExecuteCodeAction, PredicateCondition } from "@babylonjs/core";
import { Observable } from "@babylonjs/core/Misc/observable";
import { Vector3 } from "../../Maths/math.vector";
import { MeshBuilder } from "../../Meshes/meshBuilder";

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

    constructor(definition, scene) {
        this.name = definition.name;
        this.scene = scene;
        this.innerBoundary = definition.innerBoundary;
        this.outerBoundary = definition.outerBoundary;
        this.encounterRate = definition.encounterRate;
        this.colorCode = definition.colorCode;
        this.color = Color3.FromHexString(this.colorCode);
        this.mesh = MeshBuilder.CreateTorus(this.name, {
            diameter: this.outerBoundary,
            thickness: this.innerBoundary,
            tesselation: 32
        }, scene);
    }

    isWithinZone(position) {
        return true;
    }

    registerZoneIntersectionTrigger(meshToWatch) {
        this.meshToWatch = meshToWatch;
        if (!meshToWatch.actionManager) {
            meshToWatch.actionManager = new ActionManager(this.scene);
        }
        const zact = this.intersectionEnterAction = new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: { mesh: meshToWatch, usePreciseIntersections: true }
        },
            (c1) => this.onEnterObservable.notifyObservers(c1),
            new PredicateCondition(zam, () => isWithinZone(ez, cargoUnit.absolutePosition))
        );

        const zext = this.intersectionExitAction = new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionExitTrigger,
            parameter: { mesh: meshToWatch, usePreciseIntersections: true }
        },
            (c1) =>
                this.onExitObservable.notifyObservers(c1),
            new PredicateCondition(zam, () => isWithinZone(ez, cargoUnit.absolutePosition))
        );
        const zam = meshToWatch.actionManager;
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