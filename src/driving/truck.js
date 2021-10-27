import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import BaseGameObject from "../baseGameObject";
import { truckSetup, screenConfig } from "./gameData.js";

const { SCENE_MASK } = screenConfig;
class Truck extends BaseGameObject {

    static async loadTruck(scene) {
        const { modelUrl } = truckSetup;

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
        engine.hideLoadingUI();
        return truck;
    }

    constructor(scene) {
        super(scene);        

    }

    update(deltaTime) {
        super.update(deltaTime);

    }
}

export default Truck;