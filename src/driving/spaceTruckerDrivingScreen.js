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
import SpaceTruckerInputManager from "../spaceTruckerInput";


const { GUI_MASK, SCENE_MASK } = screenConfig;
const { followCamSetup } = screenConfig;

const inputMapPatches = {
    w: "MOVE_IN", W: "MOVE_IN",
    s: "MOVE_OUT", S: "MOVE_OUT",
    ArrowUp: 'MOVE_UP',
    ArrowDown: 'MOVE_DOWN',
    ArrowLeft: 'ROTATE_LEFT',
    ArrowRight: 'ROTATE_RIGHT',

};
SpaceTruckerInputManager.patchControlMap(inputMapPatches);
const actionList = [
    // { action: 'ACTIVATE', shouldBounce: () => true },
    { action: 'MOVE_UP', shouldBounce: () => false },
    { action: 'MOVE_DOWN', shouldBounce: () => false },
    { action: 'GO_BACK', shouldBounce: () => true },
    { action: 'MOVE_LEFT', shouldBounce: () => false },
    { action: 'MOVE_RIGHT', shouldBounce: () => false },
    { action: 'MOVE_IN', shouldBounce: () => false },
    { action: 'MOVE_OUT', shouldBounce: () => false },
    { action: 'ROTATE_LEFT', shouldBounce: () => false },
    { action: 'ROTATE_RIGHT', shouldBounce: () => false },

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
    encounters = [];
    isLoaded = false;
    tempObstacleMesh;
    constructor(engine, routeData, inputManager) {
        this.routeData = routeData;
        this.encounters = routeData.filter(e => e.encounter).map(e => e.encounter);
        this.engine = engine;
        this.scene = new Scene(engine);
        this.cameraDolly = new TransformNode("cameraDolly", this.scene);

        // temporary until the encounter spawner is implemented
        this.tempObstacleMesh = CreateSphere("tempObstacle", this.scene, { size: new Vector3(1, 1, 1) });

        this.scene.clearColor = new Color3(0, 0, 0);

        this.inputManager = inputManager;
        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, actionList);

        this.followCamera = new ArcRotateCamera("followCam", 4.712, 1.078, 80, Vector3.Zero(), this.scene);
        for (var k in followCamSetup) {
            this.followCamera[k] = followCamSetup[k];
        }
        this.followCamera.viewport = new Viewport(0, 0, 1, 1);
        this.followCamera.layerMask = SCENE_MASK;
        //this.followCamera.attachControl(undefined, true);
        this.scene.activeCameras.push(this.followCamera);

        initializeEnvironment(this);
        this.route = this.calculateRouteParameters(this.routeData);
        this.scene.onReadyObservable.addOnce(async () => {
            await this.initialize();
            let gP = initializeGui(this);
            this.gui = await gP;
            this.gui.sceneObserver = this.scene.onAfterRenderObservable.add(() => this.updateGui());
        });
    }

    async initialize() {
        await ammoReadyPromise;
        let plugin = new AmmoJSPlugin(true, ammoModule);
        this.scene.enablePhysics(new Vector3(0, 0, 0), plugin);

        const { route } = this;

        let tP = Truck.loadTruck(this.scene);
        this.truck = await tP;
        this.cameraDolly.parent = this.truck.mesh;
        this.followCamera.parent = this.cameraDolly;
        var groundMat = this.groundMaterial = new GridMaterial("roadMat", this.scene);
        this.ground = MeshBuilder.CreateRibbon("road", {
            pathArray: route.paths,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);

        this.ground.layerMask = SCENE_MASK;
        this.ground.material = groundMat;
        this.ground.visibility = 0.67;

        this.setupKillMesh();

        this.ground.physicsImpostor = new PhysicsImpostor(
            this.ground,
            PhysicsImpostor.MeshImpostor,
            { mass: 0, restitution: 0.998, friction: 0.5 },
            this.scene);

        this.isLoaded = true;
        setTimeout(() => this.reset(), 1000);
    }

    setupKillMesh() {
        let killAm = new ActionManager(this.scene);
        let zact = new ExecuteCodeAction({
            trigger: ActionManager.OnIntersectionExitTrigger,
            parameter: { mesh: this.truck.mesh }
        }, aev => this.killTruck());

        killAm.registerAction(zact);
        this.ground.actionManager = killAm;
    }

    calculateRouteParameters(routeData) {
        const { routeDataScalingFactor } = screenConfig;
        let pathPoints = routeData.map(p => {
            return {
                position: (typeof p.position !== 'Vector3' ? new Vector3(p.position.x, p.position.y, p.position.z) : p.position)
                    .scaleInPlace(routeDataScalingFactor),
                gravity: (typeof p.gravity !== 'Vector3' ? new Vector3(p.gravity.x, p.gravity.y, p.gravity.z) : p.gravity)
                    .scaleInPlace(routeDataScalingFactor),
                velocity: (typeof p.velocity !== 'Vector3' ? new Vector3(p.velocity.x, p.velocity.y, p.velocity.z) : p.velocity)
                    .scaleInPlace(routeDataScalingFactor),
                encounter: p.encounter,
            };
        });

        let path3d = new Path3D(pathPoints.map(p => p.position), new Vector3(0, 1, 0), false, true);

        let curve = path3d.getCurve();
        console.log("Curve and Path sample set sizes", curve.length, pathPoints.length);
        let displayLines = MeshBuilder.CreateLines("displayLines", { points: curve }, this.scene);
        const { numberOfRoadSegments } = screenConfig;
        let paths = [];
        for (let i = 0; i < numberOfRoadSegments; i++) {
            paths.push([]);
        }

        for (let i = 0; i < pathPoints.length; i++) {
            let { position, gravity, velocity } = pathPoints[i];
            let speed = velocity.length() / routeDataScalingFactor;
            let last = position.clone();
            for (let pathIdx = 0; pathIdx < numberOfRoadSegments; pathIdx++) {
                let radiix = (pathIdx / numberOfRoadSegments) * Scalar.TwoPi;
                let path = paths[pathIdx];
                path.push(last.clone()
                    .addInPlaceFromFloats(Math.sin(radiix) * speed, Math.cos(radiix) * speed, 0));

            }
        }
        paths.push(paths[0]);

        return { paths, pathPoints, path3d, displayLines };
    }

    spawnEncounter(encounter) {
        
    }
    reset() {
        const { path3d, pathPoints } = this.route;
        const { currentVelocity, currentAngularVelocity, physicsImpostor, mesh } = this.truck;

        console.log('resetting...');
        const point = path3d.getPointAt(0);
        const tang = path3d.getTangentAt(0);

        currentVelocity.copyFrom(pathPoints[0].velocity);
        currentAngularVelocity.setAll(0);

        mesh.position.copyFrom(point);
        physicsImpostor.setLinearVelocity(Vector3.Zero());

        mesh.rotationQuaternion = Quaternion.FromLookDirectionRH(tang, this.followCamera.upVector);
        physicsImpostor.setAngularVelocity(Vector3.Zero());


        // this.truck.physicsImpostor.setAngularVelocity(this.truck.currentAngularVelocity);
    }

    killTruck() {
        const { currentVelocity, currentAngularVelocity, physicsImpostor } = this.truck;
        currentVelocity.setAll(0);
        currentAngularVelocity.setAll(0);
        physicsImpostor.setLinearVelocity(Vector3.Zero());
        physicsImpostor.setAngularVelocity(Vector3.Zero());
        this.reset();
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);
        this.actionProcessor?.update();

        if (this.isLoaded) {
            this.truck.update(dT);
        }
    }

    updateGui() {
        const dT = (this.scene.getEngine().getDeltaTime() / 1000);
    }

    dispose() {
        SpaceTruckerInputManager.unPatchControlMap(inputMapPatches);
        this.scene.onAfterRenderObservable.remove(this.gui.sceneObserver);
        this.scene.dispose();

    }

    MOVE_UP(state) {
        let up = this.truck.mesh.up;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(up.scale(currAccel));
    }

    MOVE_DOWN(state) {
        let up = this.truck.mesh.up;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(up.scale(currAccel).negate());

    }

    ROTATE_LEFT(state) {
        const { turnSpeedRadians } = truckSetup;
        let { currentAngularVelocity } = this.truck;
        currentAngularVelocity.y -= turnSpeedRadians;
    }

    ROTATE_RIGHT(state) {
        const { turnSpeedRadians } = truckSetup;
        let { currentAngularVelocity } = this.truck;
        currentAngularVelocity.y += turnSpeedRadians;
    }

    MOVE_IN(state) {
        let currDir = this.truck.forward;
        let currAccel = this.truck.currentAcceleration
        this.truck.currentVelocity.addInPlace(currDir.scale(currAccel));
    }

    MOVE_OUT(state) {
        let currDir = this.truck.forward;
        let currAccel = this.truck.currentAcceleration
        this.truck.currentVelocity.addInPlace(currDir.scale(currAccel).negate());
    }

    GO_BACK() {
        this.reset();
    }
}
export default SpaceTruckerDrivingScreen;