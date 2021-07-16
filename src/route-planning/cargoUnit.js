import { TrailMesh } from "@babylonjs/core";
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
    isInFlight = false;

    constructor(scene, origin, options) {
        super(scene, options);
        this.autoUpdatePosition = false;
        this.options = options;
        this.originPlanet = origin;
        this.mass = this.options.cargoMass;
        this.mesh = MeshBuilder.CreateBox("cargo", { width: 1, height: 1, depth: 2 }, this.scene);
        this.mesh.rotation = Vector3.Zero();

    }

    launch(impulse) {
        this.isInFlight = true;
        this.trailMesh = new TrailMesh("cargoTrail", this.mesh, this.scene, 3, 1000);
        this.physicsImpostor.applyImpulse(impulse, this.mesh.getAbsolutePosition());
    }

    reset() {
        if (this.trailMesh) {
            this.trailMesh.dispose();
            this.trailMesh = null;
        }
        this.physicsImpostor?.setLinearVelocity(Vector3.Zero());
        this.physicsImpostor?.setAngularVelocity(Vector3.Zero());
        this.position = this.originPlanet.position.clone().scaleInPlace(1.1, 1, 1);
        this.rotation = Vector3.Zero();
        this.mesh.computeWorldMatrix(true);
        this.isInFlight = false;
    }

    update(deltaTime) {

        if (this.isInFlight) {
            const up = this.mesh.up;
            const linVel = this.physicsImpostor.getLinearVelocity().normalize();

            this.rotation = Vector3.Cross(up, linVel);
        }

        //super.update(deltaTime);
    }
}

export default CargoUnit;