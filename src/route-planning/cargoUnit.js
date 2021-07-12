import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

import OrbitingGameObject from "../orbitingGameObject";
 
class CargoUnit extends OrbitingGameObject {
    distanceTraveled = 0.0;
    timeInTransit = 0.0;
    originPlanet;
    options;
    trailMesh;
    mass = 0;
    constructor(scene, origin, options) {
        super(scene, options);
        this.autoUpdatePosition = false;
        this.options = options;
        this.originPlanet = origin;
        this.mass = this.options.cargoMass;
        this.mesh = MeshBuilder.CreateBox("cargo", { width: 1, height: 1, depth: 2 }, this.scene);

    }

    get originPosition() {
        return this.originPlanet.position.clone().scaleInPlace(this.originPlanet.diameter * 1.1, 0, 0);
    }
    reset() {
        this.position = this.originPosition
        if (this.trailMesh) {
            this.trailMesh.dispose();
            this.trailMesh = null;
        }
        this.orbitalRadius = this.position.length();
        
        this.setOrbitalParameters(this.position.length());
    }
 
    update(deltaTime) {

        // const up = this.mesh.up;
        // const linVel = this.physicsImpostor.getLinearVelocity().normalize();
        
        // this.rotation = Vector3.Cross(up, linVel);

       
        //super.update(deltaTime);
    }
}

export default CargoUnit;