import { Scene } from "@babylonjs/core/scene";
import { Vector3, Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Viewport } from "@babylonjs/core/Maths/math.viewport";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateTorus } from "@babylonjs/core/Meshes/Builders/torusBuilder";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { GridMaterial } from "@babylonjs/materials/grid";
import initializeGui from "./driving-gui.js";
import initializeEnvironment from "./environment.js";
import { screenConfig } from "./gameData.js";

const { GUI_MASK, SCENE_MASK } = screenConfig;
const { followCamSetup } = screenConfig;
class SpaceTruckerDrivingScreen {
    engine;
    scene;
    inputManager;
    gui;
    truck;
    ground;
    environment;
    cameraDolly;
    followCamera;

    constructor(engine, inputManager, routeData) {
        this.engine = engine;
        this.scene = new Scene(engine);
        this.inputManager = inputManager;
        this.scene.clearColor = new Color3(0, 0, 0);
        this.cameraDolly = new TransformNode("cameraDolly", this.scene);
        this.followCamera = new ArcRotateCamera("followCam", 4.712, 1.078, 80, Vector3.Zero(), this.scene);
        //followCamera = new FollowCamera("followCam", new Vector3(0, 500, -1000), scene);
        this.cameraDolly.position.z = truckModel.position.z + 30;
        this.cameraDolly.position.y = 10;
        this.cameraDolly.parent = truck;

        for (var k in followCamSetup) {
            followCamera[k] = followCamSetup[k];
        }
        this.followCamera.lockedTarget = this.cameraDolly;
        this.followCamera.viewport = new Viewport(0, 0, 1, 1);
        this.followCamera.layerMask = SCENE_MASK;
        this.followCamera.attachControl(undefined, true);

        this.scene.activeCameras.push(this.followCamera);

        this.scene.onReadyObservable.addOnce(() => this.initialize());
    }

    async initialize() {
        this.environment = initializeEnvironment(this.scene);
        this.truck = await Truck.loadTruck();
        this.gui = await initializeGui(this.scene);
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);
        this.actionProcessor?.update();

    }

    dispose() {
        this.scene.dispose();
    }
}
export default SpaceTruckerDrivingScreen;