import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import BaseGameObject from "../baseGameObject";
 
class CargoUnit extends BaseGameObject {
    distanceTraveled = 0.0;
    timeInTransit = 0.0;
    originPlanet;
    options;
    trailMesh;
    constructor(scene, options) {
        super(scene);
        this.options = options;
        this.originPlanet = this.options.origin;
        this.mesh = MeshBuilder.CreateBox("cargo", { width: 1, height: 1, depth: 2 }, this.scene);

    }

    reset() {
        this.mesh.parent = this.originPlanet.mesh;
        this.position = new Vector3(this.originPlanet.diameter * 1.1, 0, 0);
        if (this.trailMesh) {
            this.trailMesh.dispose();
            this.trailMesh = null;
        }
    }
    update(deltaTime) {

        super.update(deltaTime);
    }
}

export default CargoUnit;