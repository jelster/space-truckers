import { Scene } from "@babylonjs/core/scene";
import { Vector3, Vector2, Matrix } from "@babylonjs/core/Maths/math.vector";
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
import { CreateRibbon } from "@babylonjs/core/Meshes/Builders/ribbonBuilder";
import { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";

import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { GridMaterial } from "@babylonjs/materials/grid";
import { Quaternion } from "@babylonjs/core/Maths/math";
import { Path3D } from "@babylonjs/core/Maths/math.path";


import { PhysicsHelper } from "@babylonjs/core/Physics/physicsHelper";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import "@babylonjs/core/Physics/physicsEngineComponent";
import { ammoModule, ammoReadyPromise } from "../externals/ammoWrapper";

import { screenConfig, truckSetup } from "./gameData.js";
import SpaceTruckerInputProcessor from "../spaceTruckerInputProcessor.js";
import Truck from "./truck.js";

import initializeGui from "./driving-gui.js";
import initializeEnvironment from "./environment.js";
import { Axis } from "@babylonjs/core/Maths/math.axis";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Space } from "@babylonjs/core/"; // TODO: fix import

const { GUI_MASK, SCENE_MASK } = screenConfig;
const { followCamSetup } = screenConfig;

const actionList = [
    // { action: 'ACTIVATE', shouldBounce: () => true },
    { action: 'MOVE_UP', shouldBounce: () => false },
    { action: 'MOVE_DOWN', shouldBounce: () => false },
    { action: 'GO_BACK', shouldBounce: () => true },
    { action: 'MOVE_LEFT', shouldBounce: () => false },
    { action: 'MOVE_RIGHT', shouldBounce: () => false },
    //  { action: 'PAUSE', shouldBounce: () => true },
];
class SpaceTruckerDrivingScreen {
    engine;
    scene;
    inputManager;
    gui;
    truck;
    ground;
    groundMaterial;
    environment;
    cameraDolly;
    followCamera;
    actionProcessor;
    routeData;
    path;
    curve = [];

    isLoaded = false;
    routeParameters = { groundHeight: 0, groundWidth: 50, pathLength: 0, };

    constructor(engine, inputManager) {

        this.engine = engine;
        this.scene = new Scene(engine);
        this.inputManager = inputManager;
        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, actionList);
        this.scene.clearColor = new Color3(0, 0, 0);
        this.cameraDolly = new TransformNode("cameraDolly", this.scene);
        this.followCamera = new ArcRotateCamera("followCam", 4.712, 1.078, 80, Vector3.Zero(), this.scene);

        for (var k in followCamSetup) {
            this.followCamera[k] = followCamSetup[k];
        }

        this.followCamera.viewport = new Viewport(0, 0, 1, 1);
        this.followCamera.layerMask = SCENE_MASK;

        this.scene.activeCameras.push(this.followCamera);

    }

    async initialize(routeData) {
        this.routeData = routeData;
        let paths = this.calculateRouteParameters(routeData);
        this.ground = MeshBuilder.CreateRibbon("road", {
            pathArray: paths,
        }, this.scene);
        var groundMat = this.groundMaterial = new GridMaterial("roadMat", this.scene);

        // this.ground = MeshBuilder.CreateGround("ground", {
        //     width: this.routeParameters.groundWidth,
        //     height: this.routeParameters.groundHeight,
        //     subdivisionsX: 64,
        //     subdivisionsY: 64,
        //     updateable: true
        // }, this.scene);

        this.ground.layerMask = SCENE_MASK;
        this.ground.material = groundMat;

        await ammoReadyPromise;
        let plugin = new AmmoJSPlugin(true, ammoModule);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), plugin);

        initializeEnvironment(this);
        let tP = Truck.loadTruck(this.scene);
        let gP = initializeGui(this);

        this.truck = await tP;
        this.gui = await gP;

        this.ground.physicsImpostor = new PhysicsImpostor(
            this.ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.5 },
            this.scene);

        this.cameraDolly.position.z = this.truck.position.z + 30;
        this.cameraDolly.position.y = 10;
        this.cameraDolly.parent = this.truck.mesh;

        this.gui.sceneObserver = this.scene.onAfterRenderObservable.add(() => this.updateGui());
        this.followCamera.lockedTarget = this.cameraDolly;
        this.followCamera.attachControl(undefined, true);
        this.isLoaded = true;
    }

    calculateRouteParameters(routeData) {
        let pathPoints = routeData.map(p => {
            return (typeof p !== 'Vector3' ? new Vector3(p.position.x, p.position.y, p.position.z) : p).scaleInPlace(7);
        });

        let path3d = new Path3D(pathPoints, new Vector3(0, 1, 0), false,true);

        let curve = path3d.getCurve();
        let displayLines = MeshBuilder.CreateLines("displayLines", { points: curve }, this.scene);
        let pathA = [];
        let pathB = [];
        for (let i = 0; i < curve.length; i++) {
            let p = curve[i];
            const { x, y, z, w } = routeData[i].rotationQuaternion;
            const rotation = new Quaternion(x, y, z, w);
            const vel = routeData[i].velocity;

            let pA = new Vector3(p.x + 20, p.y, p.z + 20);
            //    pA.rotateByQuaternionToRef(rotation, pA);
            let pB = new Vector3(p.x - 20, p.y, p.z - 20);
            //     pB.rotateByQuaternionToRef(rotation, pB);
            pathA.push(pA);
            pathB.push(pB);
        }

        this.path = path3d;
        this.curve = curve;
        return [pathB, curve, pathA];

    }

    reset() {
        console.log('resetting...');

        this.truck.position.z = this.curve[1].z;
        this.truck.position.x = this.curve[1].x;
        this.truck.position.y = this.curve[1].y + 12.5;
        this.truck.mesh.rotationQuaternion = new Quaternion();

        this.truck.currentVelocity.setAll(0);
        this.truck.physicsImpostor.mass = truckSetup.physicsConfig.mass;
        this.truck.physicsImpostor.setLinearVelocity(this.truck.currentVelocity);
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);
        this.actionProcessor?.update();

        if (this.isLoaded) {

            this.truck.update(deltaTime);
        }
    }

    updateGui() {
        const dT = (this.scene.getEngine().getDeltaTime() / 1000);
    }

    dispose() {
        this.scene.onAfterRenderObservable.remove(this.gui.sceneObserver);
        this.scene.dispose();
    }

    MOVE_UP(state) {
        let currDir = this.truck.forward;
        let currAccel = this.truck.currentAcceleration
        this.truck.currentVelocity.addInPlace(currDir.scale(currAccel));
    }

    MOVE_DOWN(state) {
        let currDir = this.truck.forward;
        let currAccel = this.truck.currentAcceleration
        this.truck.currentVelocity.addInPlace(currDir.scale(currAccel).negate());
    }

    MOVE_LEFT(state) {
        let { forward, currentAcceleration, currentVelocity } = this.truck;
        let left = Vector3.Cross(forward, this.followCamera.upVector);
        currentVelocity.addInPlace(left.scale(currentAcceleration));

        this.truck.mesh.rotate(Axis.Y, -currentAcceleration / Scalar.TwoPi / 60, Space.LOCAL);
    }

    MOVE_RIGHT(state) {
        let { forward, currentAcceleration, currentVelocity } = this.truck;
        let right = Vector3.Cross(forward, this.followCamera.upVector.negate());
        currentVelocity.addInPlace(right.scale(currentAcceleration));

        this.truck.mesh.rotate(Axis.Y, currentAcceleration / Scalar.TwoPi / 60, Space.LOCAL);
    }

    GO_BACK() {
        this.reset();
    }
}
export default SpaceTruckerDrivingScreen;