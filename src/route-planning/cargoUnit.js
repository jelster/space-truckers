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

    get linearVelocity() {
        return this?.physicsImpostor?.getLinearVelocity()?.length() ?? 0;
    }

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
        this.trailMesh = new TrailMesh("cargoTrail", this.mesh, this.scene, 3, 10000);
        this.physicsImpostor.applyImpulse(impulse, this.mesh.getAbsolutePosition());
    }

    reset() {
        this.timeInTransit = 0;
        this.distanceTraveled = 0;
        if (this.trailMesh) {
            this.trailMesh.dispose();
            this.trailMesh = null;
        }
        //this.physicsImpostor?.setLinearVelocity(Vector3.Zero());
        //this.physicsImpostor?.setAngularVelocity(Vector3.Zero());
        this.position = this.originPlanet.position.clone().scaleInPlace(1.1, 1, 1);
        this.rotation = Vector3.Zero();

        this.mesh.computeWorldMatrix(true);
        this.isInFlight = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.isInFlight) {
            const up = this.mesh.up;
            const linVel = this.physicsImpostor.getLinearVelocity();
            this.timeInTransit += deltaTime;
            this.distanceTraveled += linVel.length() * deltaTime;
            linVel.normalize();
            this.rotation = Vector3.Cross(up, linVel);            
        }        
    }

    destroy() {
        // TODO: play explosion animation and sound
        this.physicsImpostor.setLinearVelocity(Vector3.Zero());
        this.physicsImpostor.setAngularVelocity(Vector3.Zero());
    }
}

export default CargoUnit;