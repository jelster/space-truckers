import { TrailMesh } from "@babylonjs/core";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

import OrbitingGameObject from "../orbitingGameObject";

class CargoUnit extends OrbitingGameObject {
    currentGravity = new Vector3(0, 0, 0);
    lastVelocity = new Vector3(0, 0, 0);
    lastGravity = new Vector3(0, 0, 0);
    distanceTraveled = 0.0;
    timeInTransit = 0.0;
    originPlanet;
    options;
    trailMesh;
    mass = 0;
    isInFlight = false;
    routePath = [];

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
        this.routePath = [];
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
            this.lastGravity = this.currentGravity.clone();
            const linVel = this.physicsImpostor.getLinearVelocity();
            this.lastVelocity = linVel.clone();
            linVel.normalize();

            this.timeInTransit += deltaTime;
            this.distanceTraveled += this.lastVelocity.length() * deltaTime;            
            
            this.rotation = Vector3.Cross(this.mesh.up, linVel);

            let currentPoint = { 
                time: this.timeInTransit, 
                position: this.position.clone(), 
                rotation: this.mesh.rotationQuaternion.clone(),
                velocity: this.lastVelocity.clone(),
                gravity: this.lastGravity.clone()
            };
            this.routePath.push(currentPoint);

            this.physicsImpostor.applyImpulse(this.currentGravity.scale(deltaTime), this.mesh.getAbsolutePosition());
            this.currentGravity = Vector3.Zero();
        }
    }

    destroy() {
        // TODO: play explosion animation and sound
        this.physicsImpostor.setLinearVelocity(Vector3.Zero());
        this.physicsImpostor.setAngularVelocity(Vector3.Zero());
    }
}

export default CargoUnit;