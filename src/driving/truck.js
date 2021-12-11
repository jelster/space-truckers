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
        angVel.addInPlace(this.currentAngularVelocity.scaleInPlace(deltaTime)).scaleInPlace(0.986);
        this.physicsImpostor.setAngularVelocity(angVel);
        this.currentAngularVelocity.setAll(0);

    }
}

export default Truck;