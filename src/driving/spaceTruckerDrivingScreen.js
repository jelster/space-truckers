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
import { Axis } from "@babylonjs/core/Maths/math.axis";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Space } from "@babylonjs/core/"; // TODO: fix import
import { setAndStartTimer } from "@babylonjs/core/Misc";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { GridMaterial } from "@babylonjs/materials/grid";
import { Quaternion } from "@babylonjs/core/Maths/math";
import { Path3D } from "@babylonjs/core/Maths/math.path";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { PhysicsHelper } from "@babylonjs/core/Physics/physicsHelper";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import "@babylonjs/core/Physics/physicsEngineComponent";
import "@babylonjs/core/Meshes/Builders/ribbonBuilder";
import "@babylonjs/core/Meshes/Builders/linesBuilder";

import { ammoModule, ammoReadyPromise } from "../externals/ammoWrapper";
import { screenConfig, truckSetup } from "./gameData.js";
import SpaceTruckerInputProcessor from "../spaceTruckerInputProcessor.js";
import Truck from "./truck.js";

import initializeGui from "./driving-gui.js";
import initializeEnvironment from "./environment.js";


const { GUI_MASK, SCENE_MASK } = screenConfig;
const { followCamSetup } = screenConfig;

const actionList = [
    // { action: 'ACTIVATE', shouldBounce: () => true },
    { action: 'MOVE_UP', shouldBounce: () => false },
    { action: 'MOVE_DOWN', shouldBounce: () => false },
    { action: 'GO_BACK', shouldBounce: () => true },
    { action: 'MOVE_LEFT', shouldBounce: () => false },
    { action: 'MOVE_RIGHT', shouldBounce: () => false },
    { action: 'MOVE_IN', shouldBounce: () => false },
    { action: 'MOVE_OUT', shouldBounce: () => false }

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
    killMesh;

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
        let route = this.route = this.calculateRouteParameters(routeData);
        this.ground = MeshBuilder.CreateRibbon("road", {
            pathArray: route.paths,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);

        var groundMat = this.groundMaterial = new GridMaterial("roadMat", this.scene);
        this.ground.layerMask = SCENE_MASK;
        this.ground.material = groundMat;

        await ammoReadyPromise;
        let plugin = new AmmoJSPlugin(true, ammoModule);
        this.scene.enablePhysics(new Vector3(0, 0, 0), plugin);

        initializeEnvironment(this);
        let tP = Truck.loadTruck(this.scene);
        let gP = initializeGui(this);

        this.truck = await tP;
        this.gui = await gP;

        this.setupKillMesh();

        this.ground.physicsImpostor = new PhysicsImpostor(
            this.ground,
            PhysicsImpostor.ConvexHullImpostor,
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

    setupKillMesh() {
        this.killMesh = MeshBuilder.CreatePlane("killMesh", { size: 50000 }, this.scene);
        this.killMesh.rotation.x = Math.PI / 2;
        this.killMesh.position.y = -150;
        this.killMesh.layerMask = 0x0;

        let killAm = new ActionManager(this.scene);
        let zact = new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: { mesh: this.truck.mesh }
        }, aev => this.killTruck());

        killAm.registerAction(zact);
        this.killMesh.actionManager = killAm;
    }

    calculateRouteParameters(routeData) {
        const { routeDataScalingFactor } = screenConfig;
        let pathPoints = routeData.map(p => {
            return {
                position: (typeof p.position !== 'Vector3' ? new Vector3(p.position.x, p.position.y, p.position.z) : p.position).scaleInPlace(routeDataScalingFactor),
                gravity: (typeof p.gravity !== 'Vector3' ? new Vector3(p.gravity.x, p.gravity.y, p.gravity.z) : p.gravity).scaleInPlace(routeDataScalingFactor),
                velocity: (typeof p.velocity !== 'Vector3' ? new Vector3(p.velocity.x, p.velocity.y, p.velocity.z) : p.velocity).scaleInPlace(routeDataScalingFactor),
            };
        });

        let path3d = new Path3D(pathPoints.map(p => p.position), new Vector3(0, 1, 0), false, false);

        let curve = path3d.getCurve();
        let displayLines = MeshBuilder.CreateLines("displayLines", { points: curve }, this.scene);
        let pathA = [];
        let pathB = [];
        let pathC = [];
        let pathD = [];
        for (let i = 0; i < pathPoints.length; i++) {
            const { position, gravity, velocity } = pathPoints[i];
            let p = position;
            let speed = velocity.length() / routeDataScalingFactor;
            let pA = new Vector3(p.x + speed, p.y - speed, p.z + speed);
            //    pA.rotateByQuaternionToRef(rotation, pA);
            let pB = new Vector3(p.x - speed, p.y - speed, p.z - speed);
            //     pB.rotateByQuaternionToRef(rotation, pB);
            let pC = pB.clone().addInPlaceFromFloats(0, speed * 2, 0);
            let pD = pA.clone().addInPlaceFromFloats(0, speed * 2, 0);
            pathA.push(pA);
            pathB.push(pB);
            pathC.push(pC);
            pathD.push(pD);
        }

        return { paths: [pathB, pathC, pathD, pathA, pathB], pathPoints, path3d, displayLines };

    }

    reset() {
        console.log('resetting...');
        const point = this.route.path3d.getPointAt(0);
        const tang = this.route.path3d.getTangentAt(0);
        this.truck.mesh.position.copyFrom(point);
        this.truck.currentVelocity.copyFrom(this.route.pathPoints[0].velocity);
        this.truck.currentAngularVelocity.setAll(0);
        this.truck.physicsImpostor.setLinearVelocity(Vector3.Zero());
        
        this.truck.mesh.rotationQuaternion = Quaternion.FromLookDirectionRH(tang, this.followCamera.upVector);

        
   // this.truck.physicsImpostor.setAngularVelocity(this.truck.currentAngularVelocity);
    }

    killTruck() {
        
        this.truck.currentVelocity.setAll(0);
        this.truck.currentAngularVelocity.setAll(0);
        this.truck.physicsImpostor.setLinearVelocity(Vector3.Zero());
        this.truck.physicsImpostor.setAngularVelocity(Vector3.Zero());
        this.reset();
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
        const { turnSpeedRadians } = truckSetup;
        let { currentAngularVelocity } = this.truck;
        currentAngularVelocity.y -= turnSpeedRadians;
    }

    MOVE_RIGHT(state) {
        const { turnSpeedRadians } = truckSetup;
        let { currentAngularVelocity } = this.truck;
        currentAngularVelocity.y += turnSpeedRadians;
    }

    MOVE_IN(state) {
        let up = this.truck.mesh.up;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(up.scale(currAccel));
    }

    MOVE_OUT(state) {
        let up = this.truck.mesh.up;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(up.scale(currAccel).negate());
    }

    GO_BACK() {
        this.reset();
    }
}
export default SpaceTruckerDrivingScreen;