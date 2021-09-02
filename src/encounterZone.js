import { ActionManager, Color3, ExecuteCodeAction, PredicateCondition } from "@babylonjs/core";
import { Observable } from "@babylonjs/core/Misc/observable";
import { TorusBuilder } from "@babylonjs/core/Meshes/Builders/torusBuilder";

import BaseGameObject from "./baseGameObject";

class SpaceTruckerEncounterZone extends BaseGameObject {
    name = "";
    id = "";
    innerBoundary = 0;
    outerBoundary = 0;
    colorCode = "#000000";
    encounterRate = 0.0;
    scene;
    meshToWatch;
    color = Color3.Black();
    onEnterObservable = new Observable();
    onExitObservable = new Observable();
    onEncounterObservable = new Observable();
    torusDiameter = 0.0;
    torusThickness = 0.0;
    encounterTable = [];
    cumulativeDistribution = [];

    constructor(definition, scene) {
        super(scene);
        this.name = definition.name;
        this.id = definition.id;
        this.scene = scene;
        this.innerBoundary = definition.innerBoundary;
        this.outerBoundary = definition.outerBoundary;
        this.encounterRate = definition.encounterRate;
        this.colorCode = definition.colorCode;
        this.color = Color3.FromHexString(this.colorCode);
        this.torusDiameter = this.outerBoundary - (0.5 * (this.outerBoundary - this.innerBoundary)),
            this.torusThickness = (this.outerBoundary / 2 - this.innerBoundary / 2);
        this.mesh = TorusBuilder.CreateTorus(this.name + '-Zone', {
            diameter: 2 * this.torusDiameter,
            thickness: 2 * this.torusThickness,
            tesselation: 64
        }, scene);
        this.mesh.visibility = 0;

        var total = 0;
        definition.encounters.forEach((e, i) => {
            total += e.probability;
            this.encounterTable.push(e);
        });

        this.cumulativeDistribution[0] = this.encounterTable[0].probability / total;
        for (var i = 1; i < definition.encounters.length; i++) {
            this.cumulativeDistribution[i] = this.cumulativeDistribution[i - 1] + definition.encounters[i].probability / total;
        }
    }

    isWithinZone(position) {
        return true;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const encounterProbability = this.encounterRate * deltaTime;
        if (Math.random() < encounterProbability) {
            let encounter = this.getEncounter();
            console.log('encounter ' + encounter?.name);
            this.onEncounterObservable.notifyObservers(encounter);
        }
    }

    getEncounter() {
        let diceRoll = Math.random();
        
        for (var i = 0; i < this.cumulativeDistribution.length && (diceRoll > this.cumulativeDistribution[i]); i++) {};

        let et = this.encounterTable[i];

        if (!et) {
            console.log('no encounter found', diceRoll, this.encounterTable);
        }
        return et;
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