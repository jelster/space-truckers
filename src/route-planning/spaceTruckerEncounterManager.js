import { Observable } from '@babylonjs/core';
import SpaceTruckerEncounterZone from '../encounterZone';
import SpaceTruckerSoundManager from '../spaceTruckerSoundManager';
import { encounterZones } from "./gameData";

const zones = Object.keys(encounterZones);
class SpaceTruckerEncounterManager {
    planningScreen;
    encounterZones = [];
    encounterEvents = [];
    cargo;
    inAndOut = 0;
    scene;
    onNewEncounterObservable = new Observable();
    soundManager;

    get currentZone() {
        let zidx = this.encounterZones.length - this.inAndOut;
        return this.encounterZones[zidx]?.zone;
    }
    constructor(cargo, scene) {
        this.scene = scene;
        this.cargo = cargo;
        this.encounterZones = zones.map(zone => ({ zone: new SpaceTruckerEncounterZone(encounterZones[zone], this.scene) }));
        this.initialize();
    }

    initialize() {
        this.encounterEvents = [];
        this.encounterZones.forEach(ez => {
            const zone = ez.zone;
            zone.registerZoneIntersectionTrigger(this.cargo.mesh);
            ez.enterObserver = zone.onEnterObservable.add((evt) => this.onIntersectEnter(evt));
            ez.exitObserver = zone.onExitObservable.add((evt) => this.onIntersectExit(evt));
            ez.encounterObserver = zone.onEncounterObservable.add((evt) => this.onEncounter(evt));
        });
    }

    teardown() {
        this.encounterZones.forEach(ez => {
            const zone = ez.zone;
            zone.unregisterZoneIntersectionTrigger(this.cargo.mesh);
            zone.onEnterObservable.remove(ez.enterObserver);
            zone.onExitObservable.remove(ez.exitObserver);
            zone.onEncounterObservable.remove(ez.encounterObserver);
        });
    }

    onIntersectEnter(evt) {
        this.inAndOut++;
        console.log(evt.name + " entered");
    }
    onIntersectExit(evt) {
        this.inAndOut--;
        console.log(evt.name + " exited");
    }
    onEncounter(encounter) {
        console.log("Encounter: " + encounter?.name);
        if (!encounter) {
            return;
        }
        const cargoData = this.cargo.lastFlightPoint;
        const idx = this.encounterEvents.push({ encounter, cargoData });
        this.onNewEncounterObservable.notifyObservers(idx - 1);
       
    }

    update(delta) {
        const cZone = this.currentZone;
        if (cZone) {
            cZone.update(delta);
        }

        // TODO: Update cargo trail mesh's vertice colors to match current encounter zone
    }

    dispose() {
        this.teardown();
        super.dispose();
    }

}

export default SpaceTruckerEncounterManager;
