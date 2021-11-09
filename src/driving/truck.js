import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

import BaseGameObject from "../baseGameObject";
import { truckSetup, screenConfig } from "./gameData.js";

const { SCENE_MASK } = screenConfig;
class Truck extends BaseGameObject {
    currentVelocity = truckSetup.initialVelocity.clone();
    currentAcceleration = truckSetup.maxAcceleration;
    currentAngularVelocity = Vector3.Zero();

    static async loadTruck(scene) {
        const { modelUrl, physicsConfig } = truckSetup;

        let truck = new Truck(scene);
        let engine = scene.getEngine();
        engine.displayLoadingUI("Loading Truck assets");
        let imported = await SceneLoader.ImportMeshAsync("", modelUrl, "", scene);
        let truckMesh = imported.meshes[1];
        truckMesh.layerMask = SCENE_MASK;
        truckMesh.setParent(null);
        truckMesh.position = new Vector3(0, 0, 0);
        truckMesh.rotation = new Vector3(0, 0, 0);
        truckMesh.scaling.setAll(truckSetup.modelScaling);
        truckMesh.checkCollisions = true;
        truckMesh.receiveShadows = true;
        imported.meshes[0].dispose();

        truck.mesh = truckMesh;
        truck.physicsImpostor = new PhysicsImpostor(truckMesh, PhysicsImpostor.BoxImpostor, Object.assign({},physicsConfig), scene);
        engine.hideLoadingUI();
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
        angVel.addInPlace(this.currentAngularVelocity).scaleInPlace(0.99);
        this.physicsImpostor.setAngularVelocity(angVel);
        this.currentAngularVelocity.setAll(0);

    }
}

export default Truck;