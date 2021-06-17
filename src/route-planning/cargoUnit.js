import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
class CargoUnit extends BaseGameObject {
    distanceTraveled = 0.0;
    timeInTransit = 0.0;
    originPlanet;

    constructor(scene, options) {
        super(scene);
        this.mesh = MeshBuilder.CreateBox("cargo", { width: 1, height: 1, depth: 2 }, this.scene);
        this.originPlanet = options.origin;
        this.mesh.parent = this.originPlanet.mesh;
        this.position = new Vector3(this.originPlanet.diameter * 1.01, 0, 0);

    }

    update(deltaTime) {

        super.update(deltaTime);
    }
}

export default CargoUnit;