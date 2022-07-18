import { PBRMaterial, TrailMesh, TransformNode } from "@babylonjs/core";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";

import OrbitingGameObject from "../orbitingGameObject";
import SpaceTruckerEncounterManager from "./spaceTruckerEncounterManager";

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
    launchForce = 0.0;
    encounterManager;
    samplingFrequency = 8; //Hz
    samplingCounter = 0;
    trailMeshMaterial;
    get lastFlightPoint() {
        return this.routePath[this.routePath.length - 1];
    }

    get linearVelocity() {
        return this?.physicsImpostor?.getLinearVelocity()?.length() ?? 0;
    }

    constructor(scene, origin, options) {
        super(scene, options);
        this.autoUpdatePosition = false;
        this.options = options;
        this.originPlanet = origin;
        this.mass = this.options.cargoMass;
        this.mesh = CreateBox("cargo", { width: 1, height: 1, depth: 2 }, this.scene);
        this.mesh.rotation = Vector3.Zero();
        this.encounterManager = new SpaceTruckerEncounterManager(this, scene);
        this.trailMeshMaterial = new PBRMaterial("cargoTrailMaterial", this.scene);
        this.mesh.material = this.trailMeshMaterial;

    }

    launch(impulse) {
        this.isInFlight = true;
        this.trailMesh = new TrailMesh("cargoTrail", this.mesh, this.scene, 3, 10000);
        this.trailMesh.material = this.trailMeshMaterial;
        this.physicsImpostor.applyImpulse(impulse, this.mesh.getAbsolutePosition());
    }

    reset() {
        console.log('clearing route path of ', this.routePath.length, 'points');
        this.routePath.forEach(node => node = null);
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

            if (this.samplingCounter < this.samplingFrequency) {
                this.samplingCounter += 1;
            }
            else {
                this.captureRouteData();
                this.samplingCounter = 0;
            }

            this.encounterManager.update(deltaTime);
            this.physicsImpostor.applyImpulse(this.currentGravity.scale(deltaTime), this.mesh.getAbsolutePosition());
            this.currentGravity = Vector3.Zero();
        }
    }

    captureRouteData() {
        const node = {};
        node.position = this.mesh.position.clone();
        node.rotationQuaternion = new Quaternion();
        if (this.mesh.rotationQuaternion) {
            node.rotationQuaternion.copyFrom(this.mesh.rotationQuaternion);
        } else {
            Quaternion.FromEulerVectorToRef(this.rotation, node.rotationQuaternion);
        }
        node.scaling = this.lastVelocity.clone();
        node.velocity = node.scaling;
        node.gravity = this.lastGravity.clone();
        node.time = this.timeInTransit;
        node.distanceTraveled = this.distanceTraveled;
        node.encounterZone = this.encounterManager.currentZone?.id;
        this.routePath.push(node);
    }

    destroy() {
        // TODO: play explosion animation and sound
        this.physicsImpostor.setLinearVelocity(Vector3.Zero());
        this.physicsImpostor.setAngularVelocity(Vector3.Zero());
    }
}

export default CargoUnit;