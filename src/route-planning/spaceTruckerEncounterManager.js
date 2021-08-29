import SpaceTruckerEncounterZone from '../encounterZone';
import { encounterZones } from '../encounterZone.js';

const zones = Object.keys(encounterZones);

class SpaceTruckerEncounterManager {
    planningScreen;
    encounterZones = [];
    cargo;
    inAndOut = 0;
    scene;

    get currentZone() {
        let zidx = this.encounterZones.length - this.inAndOut;
        return this.encounterZones[zidx];
    }
    constructor(cargo, scene) {
        this.scene = scene;
        this.cargo = cargo;
        this.encounterZones = zones.map(zone => new SpaceTruckerEncounterZone(encounterZones[zone],this.scene));

        this.initialize();
    }

    initialize() {
        this.encounterZones.forEach(zone => {
            zone.registerZoneIntersectionTrigger(this.cargo.mesh);
            zone.enterObserver = zone.onEnterObservable.add((evt) => this.onIntersectEnter(evt));
            zone.exitObserver = zone.onExitObservable.add((evt) => this.onIntersectExit(evt));
        });        
    }

    teardown() {
        this.encounterZones.forEach(zone => {
            zone.unregisterZoneIntersectionTrigger(this.cargo.mesh);
            zone.onEnterObservable.remove(zone.enterObserver);
            zone.onExitObservable.remove(zone.exitObserver);
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

    update(delta) {

        // TODO: Update cargo trail mesh's vertice colors to match current encounter zone
    }

    
}

export default SpaceTruckerEncounterManager;
