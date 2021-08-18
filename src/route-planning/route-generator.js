import { Observable } from "@babylonjs/core/Misc/observable";
import SpaceTruckerPlanningScreen from "./spaceTruckerPlanningScreen";

class SpaceTruckerRouteGenerator {
    routePoints = [];
    
    cargoUnit;

    constructor(cargoUnit) {
        this.cargoUnit = cargoUnit;
    }
}

export default SpaceTruckerRouteGenerator;