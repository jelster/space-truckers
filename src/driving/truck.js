import { Observable } from "@babylonjs/core/Misc/observable";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

import BaseGameObject from "../baseGameObject";
import { truckSetup, screenConfig } from "./gameData.js";


const { SCENE_MASK } = screenConfig;
const ANGULAR_DAMPING = 0.025;
const TRUCK_STATES = {
    ALIVE: "alive",
    DYING: "dying",
    DEAD: "dead"
}


class Truck extends BaseGameObject {
    currentVelocity = truckSetup.initialVelocity.clone();
    currentAcceleration = truckSetup.maxAcceleration;
    currentAngularVelocity = Vector3.Zero();
    onDestroyedObservable = new Observable();
    
    #currentHealth = 100;
    #currentState = TRUCK_STATES.DEAD;
    get health() {
        return this.#currentHealth;
    }
    set health(value) {
        this.#currentHealth = value;
        if (this.#currentHealth <= 0 && this.currentState === TRUCK_STATES.ALIVE) {
            this.currentState = TRUCK_STATES.DYING;
            this.onDestroyedObservable.notifyObservers();
        }
    }
    get currentState() {
        return this.#currentState;
    }
    set currentState(value) {
        console.log('truck state changed to', value);
        this.#currentState = value;
    }

    static async loadTruck(scene) {
        const { modelUrl, physicsConfig } = truckSetup;

        let truck = new Truck(scene);
        let imported = await SceneLoader.ImportMeshAsync("", modelUrl, "", scene);
        let truckMesh = imported.meshes[1];
        
        truckMesh.setParent(null);
        imported.meshes[0].dispose();

        truckMesh.layerMask = SCENE_MASK;
        truckMesh.position = new Vector3(0, 0, 0);
        truckMesh.rotation = new Vector3(0, 0, 0);
        truckMesh.scaling.setAll(truckSetup.modelScaling);
        
        truckMesh.receiveShadows = true;
        truck.mesh = truckMesh;
        truck.mesh.bakeCurrentTransformIntoVertices();
        truck.mesh.refreshBoundingInfo();
        truck.physicsImpostor = new PhysicsImpostor(truckMesh, PhysicsImpostor.BoxImpostor, Object.assign({},physicsConfig), scene);
        return truck;
    }

    constructor(scene) {
        super(scene);
    }

    update(deltaTime) {
        super.update(deltaTime);
        let linVel = this.physicsImpostor.getLinearVelocity();
        linVel.addInPlace(this.currentVelocity.scaleInPlace(deltaTime));
        this.physicsImpostor.setLinearVelocity(linVel);
        this.currentVelocity.setAll(0);

        // dampen any tendencies to pitch, roll, or yaw from physics effects
        let angVel = this.physicsImpostor.getAngularVelocity();
        angVel.addInPlace(this.currentAngularVelocity.scaleInPlace(deltaTime)).scaleInPlace(1-ANGULAR_DAMPING);
        this.physicsImpostor.setAngularVelocity(angVel);
        this.currentAngularVelocity.setAll(0);
    }

    kill() {
        const { currentVelocity, currentAngularVelocity, physicsImpostor, mesh } = this;
        currentVelocity.setAll(0);
        currentAngularVelocity.setAll(0);
        physicsImpostor.setLinearVelocity(Vector3.Zero());
        physicsImpostor.setAngularVelocity(Vector3.Zero());
        this.health = 0;
    }

    reset() {
        this.health = 100;
        this.currentState = TRUCK_STATES.ALIVE;
        this.mesh.isVisible = true;
    }
}

export default Truck;