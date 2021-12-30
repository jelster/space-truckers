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
import { Observable, setAndStartTimer } from "@babylonjs/core/Misc";
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
import createScoringDialog from "../scoring/scoringDialog";
import SpaceTruckerSoundManager from "../spaceTruckerSoundManager";
import calculateEncounterScore from "../scoring/spaceTruckerScoreManager";
import computeScores from "../scoring/spaceTruckerScoreManager";


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

const actionList = [
    { action: 'ACTIVATE', shouldBounce: () => true },
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

const DRIVING_STATE = Object.freeze({
    Created: 0,
    Initialized: 1,
    Paused: 2,
    RouteStart: 3,
    Driving: 4,
    RouteComplete: 5
});
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
    route = null;
    path;
    curve = [];
    killMesh;
    encounters = [];
    tempObstacleMesh = null;
    onReadyObservable = new Observable();
    onRouteCompleteObservable = new Observable();
    onExitObservable = new Observable();
    scoreDialog;
    soundManager;
    currentState = DRIVING_STATE.Created;

    get currentTransitTime() {
        return this?.route?.actualTransitTime;
    }
    set currentTransitTime(val) {
        if (this.route) {
            this.route.actualTransitTime = val;
        }
    }

    constructor(engine, routeData, inputManager) {
        
        // this.encounters = routeData.filter(e => e.encounter).map(e => e.encounter);
        this.engine = engine;
        this.scene = new Scene(engine);
        this.cameraDolly = new TransformNode("cameraDolly", this.scene);

        // temporary until the encounter spawner is implemented
        this.tempObstacleMesh = CreateSphere("tempObstacle", this.scene);
        this.tempObstacleMesh.visibility = 1;
        this.tempObstacleMesh.layerMask = 0;

        this.scene.clearColor = new Color3(0, 0, 0);
        SpaceTruckerInputManager.patchControlMap(inputMapPatches);
        this.inputManager = inputManager;
        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, actionList);

        this.soundManager = new SpaceTruckerSoundManager(this.scene, "scoring", "encounter", "error");

        this.followCamera = new ArcRotateCamera("followCam", 4.712, 1.078, 80, Vector3.Zero(), this.scene);
        for (var k in followCamSetup) {
            this.followCamera[k] = followCamSetup[k];
        }
        this.followCamera.viewport = new Viewport(0, 0, 1, 1);
        this.followCamera.layerMask = SCENE_MASK;
        //this.followCamera.attachControl(undefined, true);
        this.scene.activeCameras.push(this.followCamera);

        initializeEnvironment(this);
        this.route = this.calculateRouteParameters(routeData);
        this.scene.onReadyObservable.addOnce(async () => {
            await this.initialize();
            this.currentState = DRIVING_STATE.Initialized;
            let gP = initializeGui(this);
            this.gui = await gP;
            this.onReadyObservable.notifyObservers(this);
        });
        this.currentState = DRIVING_STATE.Created;
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
            sideOrientation: Mesh.DOUBLESIDE,
            closeArray: true
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

        for (let i = 0; i < this.route.pathPoints.length; i++) {
            if (this.route.pathPoints[i].encounter) {
                let enc = this.spawnEncounter(i);
                this.encounters.push(enc);
            }
        }
        this.truck.onDestroyedObservable.add(() => {
            this.currentState = DRIVING_STATE.RouteComplete;
            // TODO: display cargo destroyed dialog
        });
        setTimeout(() => {
            this.reset();
        }, 1000);
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
        console.log(routeData);
        const { routeDataScalingFactor } = screenConfig;
        let pathPoints = routeData.route.map(p => {
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
            let speed = Scalar.Clamp(velocity.length(), 20, 200);
            let last = position.clone();
            for (let pathIdx = 0; pathIdx < numberOfRoadSegments; pathIdx++) {
                let radiix = (pathIdx / numberOfRoadSegments) * Scalar.TwoPi;
                let path = paths[pathIdx];
                let xScale = Math.cos(radiix);
                let yScale = Math.sin(radiix);

                path.push(last.clone()
                    .addInPlaceFromFloats(
                        xScale * speed,
                        yScale * speed,
                        0));
            }
        }
        //paths.push(paths[0]);
        let transitTime = routeData.transitTime;
        let {distanceTraveled, launchForce} = routeData;
        return { paths, pathPoints, path3d, displayLines, transitTime, distanceTraveled, launchForce };
    }

    spawnEncounter(seed) {
        const { pathPoints } = this.route;
        const tempObstacleMesh = this.tempObstacleMesh;
        const { routeDataScalingFactor } = screenConfig;
        let point = pathPoints[seed];
        let { encounter, position, gravity, velocity } = point;
        let encounterMesh = tempObstacleMesh.createInstance(encounter.id + '-' + seed);
        const scaling = 20; // hack: temporary

        encounterMesh.position.copyFrom(position);
        encounterMesh.position.x += Scalar.RandomRange(-scaling, scaling);
        encounterMesh.position.y += Scalar.RandomRange(-scaling, scaling);
        encounterMesh.scaling.setAll(Scalar.RandomRange(scaling * 0.5, scaling * 1.5));

        encounterMesh.layerMask = SCENE_MASK;
        encounterMesh.physicsImpostor = new PhysicsImpostor(
            encounterMesh,
            PhysicsImpostor.SphereImpostor,
            {
                mass: velocity.lengthSquared(),
                restitution: 0.576
            }, this.scene);
        encounterMesh.physicsImpostor.setLinearVelocity(gravity.negateInPlace());

        return encounterMesh;
    }

    start() {
        this.currentState = DRIVING_STATE.Driving;
    }

    reset() {
        const { path3d, pathPoints } = this.route;
        const { currentVelocity, currentAngularVelocity, physicsImpostor, mesh } = this.truck;
        const up = Axis.Y;

        console.log('resetting...');
        this.currentTransitTime = 0.0;
        this.truck.health = 100;
        const point = path3d.getPointAt(0);
        const tang = path3d.getTangentAt(0);

        currentVelocity.copyFrom(pathPoints[0].velocity);
        currentAngularVelocity.setAll(0);

        mesh.position.copyFrom(point);
        physicsImpostor.setLinearVelocity(Vector3.Zero());

        mesh.rotationQuaternion = Quaternion.FromLookDirectionRH(tang, up);
        physicsImpostor.setAngularVelocity(Vector3.Zero());
        this.currentState = DRIVING_STATE.RouteStart;
        this.gui.guiCamera.layerMask = GUI_MASK;
    }

    killTruck() {
        const { currentVelocity, currentAngularVelocity, physicsImpostor, mesh } = this.truck;
        const { path3d } = this.route;
        currentVelocity.setAll(0);
        currentAngularVelocity.setAll(0);
        physicsImpostor.setLinearVelocity(Vector3.Zero());
        physicsImpostor.setAngularVelocity(Vector3.Zero());

        // check to see if the player has completed the route or if it's just blown through the tube
        let closestPathPosition = path3d.getClosestPositionTo(mesh.absolutePosition);
        // not close enough!
        if (closestPathPosition < 0.976) {
            this.reset();
            return;
        }
        this.completeRound();
    }

    completeRound() {
        this.gui.guiCamera.layerMask = 0x0;
        this.currentState = DRIVING_STATE.RouteComplete;
        this.route.actualTransitTime = this.currentTransitTime;
        // gather data for score computation
        let scoring = computeScores(this.route);
        let scoreDialog = this.scoreDialog = createScoringDialog(scoring, this);
        scoreDialog.onAcceptedObservable.addOnce(() => this.onExitObservable.notifyObservers());
        scoreDialog.onCancelledObservable.addOnce(() => this.reset());
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);
        this.actionProcessor?.update();

        const { currentState, truck } = this;

        if (currentState === DRIVING_STATE.Driving) {
            truck.update(dT);
            this.updateGui(dT);
            this.currentTransitTime += dT;
            this.route.cargoCondition = this.truck.health;
        }
    }

    updateGui(dT) {
        const { absolutePosition, up } = this.truck.mesh;
        const { encounters } = this;
        encounters.forEach(obstacle => {
            const { uiBlip } = obstacle;
            // calculate the polar coordinates of the obstacle relative to the truck
            let r = Vector3.Distance(obstacle.absolutePosition, absolutePosition);
            // theta is the angle between the center origin and the obstacle
            let theta = Vector3.GetAngleBetweenVectorsOnPlane(absolutePosition, up, obstacle.absolutePosition);
            let posLeft = Math.cos(theta) * r; // translate from origin-center
            let posTop = -1 * Math.sin(theta) * r; // translate from origin-center
            uiBlip.left = posLeft * 4.96 - (r * 0.5); // scale by size of radar mesh
            uiBlip.top = posTop * 4.96 - (r * 0.5);
        });
    }

    dispose() {
        SpaceTruckerInputManager.unPatchControlMap(inputMapPatches);
        this.scene.onAfterRenderObservable.remove(this.gui.sceneObserver);
        this.scene.dispose();
    }

    ACTIVATE(state) {
        if (!state && this.currentState === DRIVING_STATE.RouteStart) {
            this.start();
        }
    }

    MOVE_UP(state) {
        let up = this.truck.mesh.up;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(up.scale(currAccel));
    }

    MOVE_DOWN(state) {
        let up = this.truck.mesh.up;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(up.scale(currAccel).negateInPlace());
    }

    ROTATE_LEFT(state) {
        const { turnSpeedRadians } = truckSetup;
        let { currentAngularVelocity } = this.truck;
        let wV = this.truck.mesh.up.clone()
            .negateInPlace()
            .scaleInPlace(turnSpeedRadians);
        currentAngularVelocity.addInPlace(wV);
    }

    ROTATE_RIGHT(state) {
        const { turnSpeedRadians } = truckSetup;
        let { currentAngularVelocity } = this.truck;
        let wV = this.truck.mesh.up.clone()
            .scaleInPlace(turnSpeedRadians);
        currentAngularVelocity.addInPlace(wV);
    }

    MOVE_LEFT(state, evt, amt) {
        let { currentVelocity } = this.truck;
        let currDir = this.truck.forward;
        let currentAcceleration = this.truck.currentAcceleration;

        let left = Vector3.Cross(currDir, this.truck.mesh.up);
        currentVelocity.addInPlace(left.scale(currentAcceleration / 2));
    }

    MOVE_RIGHT(state, evt, amt) {
        let { currentVelocity } = this.truck;
        let currDir = this.truck.forward;
        let currentAcceleration = this.truck.currentAcceleration;

        let right = Vector3.Cross(currDir, this.truck.mesh.up).negateInPlace();
        currentVelocity.addInPlace(right.scale(currentAcceleration / 2));
    }

    MOVE_IN(state) {
        let currDir = this.truck.forward;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(currDir.scale(currAccel));
    }

    MOVE_OUT(state) {
        let currDir = this.truck.forward;
        let currAccel = this.truck.currentAcceleration;
        this.truck.currentVelocity.addInPlace(currDir.scale(currAccel).negateInPlace());
    }

    GO_BACK() {
        this.reset();
    }
}
export default SpaceTruckerDrivingScreen;