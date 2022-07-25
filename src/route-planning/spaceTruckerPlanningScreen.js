import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Observable } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";

import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PhysicsHelper } from "@babylonjs/core/Physics/physicsHelper";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import "@babylonjs/core/Physics/physicsEngineComponent";
import { ammoModule, ammoReadyPromise } from "../externals/ammoWrapper";

import AsteroidBelt from "./asteroidBelt";
import Planet from "./planet";
import CargoUnit from "./cargoUnit";
import SpaceTruckerInputProcessor from "../spaceTruckerInputProcessor";
import SpaceTruckerSoundManager from "../spaceTruckerSoundManager";
import PlanningScreenGui from "./route-plan-gui";
import Star from "./star";
import gameData from "./gameData";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { Ray } from "@babylonjs/core/Culling/ray"; // used by ActionManager
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { ArcFollowCamera, Axis, NodeMaterial, Scalar, Space } from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import DialogBox from "../guis/guiDialog";

import postProcesses from "../post-processes";
import destinationMaterial from "../nme/materials/destinationMaterial.json";

const preFlightActionList = [
    { action: 'ACTIVATE', shouldBounce: () => true },
    { action: 'MOVE_OUT', shouldBounce: () => false },
    { action: 'MOVE_IN', shouldBounce: () => false },
    { action: 'GO_BACK', shouldBounce: () => true },
    { action: 'MOVE_LEFT', shouldBounce: () => false },
    { action: 'MOVE_RIGHT', shouldBounce: () => false },
    { action: 'PAUSE', shouldBounce: () => true },
    { action: 'MOVE_UP', shouldBounce: () => false },
    { action: 'MOVE_DOWN', shouldBounce: () => false }
];
const overworldMusic = "overworld";
const ambientSound = "ambient";

const PLANNING_SCREEN_LAYER_MASK = 1;

const PLANNING_STATE = Object.freeze({
    Created: 0,
    Initialized: 1,
    ReadyToLaunch: 2,
    InFlight: 3,
    CargoArrived: 4,
    RouteAccepted: 5,
    CargoDestroyed: 7,
    Paused: 8
});
class SpaceTruckerPlanningScreen {
    scene;
    config;
    launchForce = 100.0;
    launchForceIncrement = 5.0;;
    launchForceMax = 120;
    launchRotationSpeed = 0.0891;
    planets = [];
    origin;
    destination;
    cargo;
    star;
    launchArrow;
    destinationMesh;
    asteroidBelt;
    soundManager;
    actionProcessor;
    onStateChangeObservable = new Observable();
    routeAcceptedObservable = new Observable();
    routeConfirmationDialog = null;
    cargoDestroyedDialog = null;

    get routeData() {
        return {
            route: this.cargo.routePath,
            launchForce: this.launchForce,
            transitTime: this.cargo.timeInTransit,
            distanceTraveled: this.cargo.distanceTraveled
        }
    }
    get encounterManager() {
        return this.cargo.encounterManager;
    }

    get currentZone() {
        return this.encounterManager.currentZone;
    }

    get gameState() {
        return this._state;
    }
    set gameState(value) {
        if (this._state != value) {
            this._previousState = this._state;
            this._state = value;
            this.onStateChangeObservable.notifyObservers({ priorState: this._previousState, currentState: value });
        }
    }
    _previousState = PLANNING_STATE.Created;
    _state = PLANNING_STATE.Created;

    constructor(engine, inputManager, config) {
        this.onStateChangeObservable.add(s => console.log(`${s.currentState} is new state. Prev was ${s.priorState}`));
        engine.loadingUIText = 'Loading Route Planning Simulation...';

        this.scene = new Scene(engine);
        this.scene.onNewMeshAddedObservable.add(mesh => mesh.layerMask = PLANNING_SCREEN_LAYER_MASK);
        

        this.config = config;
        const { blurParameter, environmentTexture, IBLIntensity, lightIntensity, skyboxScale } = config.environment;

        this.soundManager = new SpaceTruckerSoundManager(this.scene, overworldMusic, ambientSound);

        this.scene.clearColor = new Color3(0.1, 0.1, 0.1);

        this.star = new Star(this.scene, config.starData);

        const planetData = config.planetaryInfo;
        planetData.forEach(planData => {
            let planet = new Planet(this.scene, planData);
            this.planets.push(planet);
            planet.mesh.computeWorldMatrix(true);
        });

        this.asteroidBelt = new AsteroidBelt(this.scene, config.asteroidBeltOptions);

        //let skyTexture = CubeTexture.CreateFromImages(skyBoxfiles, this.scene);
        const skyTexture = new CubeTexture(environmentTexture, this.scene);
        skyTexture.coordinatesMode = Texture.SKYBOX_MODE;
        this.scene.reflectionTexture = skyTexture;
        this.skybox = this.scene.createDefaultSkybox(skyTexture, true, skyboxScale, blurParameter, true);
        this.scene.environmentIntensity = IBLIntensity;
        this.camera = new ArcRotateCamera("cam", 0, 1.35, 3000, Vector3.Zero(), this.scene);
        this.scene.activeCamera = this.camera;
        this.scene.activeCameras.push(this.camera);
        this.camera.layerMask = PLANNING_SCREEN_LAYER_MASK;
        this.camera.maxZ = 100000;
        this.camera.position.y += 10000;

        let light = this.light = new PointLight("starLight", new Vector3(), this.scene);
        this.light.intensity = lightIntensity;
        light.radius = config.starData.scale / 2;
        this.origin = this.planets.filter(p => p.name ===
            this.config.startingPlanet)[0];

        this.destination = this.planets.filter(p =>
            p.name === this.config.endingPlanet)[0];

        this.cargo = new CargoUnit(this.scene,
            this.origin, {
            destination: this.destination,
            cargoMass: config.cargoMass,
            ...gameData
        });
        const arrowLines = [
            new Vector3(-1, 0, 0),
            new Vector3(-1, 0, -3),
            new Vector3(-2, 0, -3),
            new Vector3(0, 0, -5),
            new Vector3(2, 0, -3),
            new Vector3(1, 0, -3),
            new Vector3(1, 0, 0)

        ];
        this.launchArrow = MeshBuilder.CreateLines("launchArrow", { points: arrowLines });
        this.launchArrow.scaling.scaleInPlace(10);
        this.launchArrow.rotation = new Vector3(0, Math.PI, 0);
        this.launchArrow.bakeCurrentTransformIntoVertices();

        this.destinationMesh = MeshBuilder.CreateIcoSphere("destination", {
            radius: this.destination.diameter * 1.055,
            subdivisions: 4,
            flat: false
        }, this.scene);
        this.destinationMesh.material = NodeMaterial.Parse(destinationMaterial, this.scene);
        this.destinationMesh.visibility = 0.013;
        this.destinationMesh.parent = this.destination.mesh;
        this.destinationMesh.actionManager = new ActionManager(this.scene);
        this.destinationMesh.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.cargo.mesh,
                    usePreciseIntersection: true

                },
                (ev) => {
                    console.log('mesh intersection triggered!', ev);
                    this.cargoArrived();
                }
            ));


        this.scene.onReadyObservable.addOnce(() => {
            this.ui = new PlanningScreenGui(this);
            this.scene.particleSystems.forEach(ps => ps.layerMask = PLANNING_SCREEN_LAYER_MASK);
            this.ui.bindToScreen();
            this.gameState = PLANNING_STATE.Initialized;

        });
        ammoReadyPromise.then(res => {
            console.log("ammo ready");
            // this.initializePhysics();
        });
        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, preFlightActionList);

        this.camera.useFramingBehavior = true;
        this.camera.attachControl(true);

        this.routeConfirmationDialog = new DialogBox({
            bodyText: 'Successful route planning! Use route and launch?',
            titleText: 'Confirm Flight Plan',
            acceptText: 'Launch!',
            cancelText: 'Reset',
            displayOnLoad: false
        }, this.scene);
        this.routeConfirmationDialog.onAcceptedObservable.add(() => {
            this.routeAcceptedObservable.notifyObservers();
            this.gameState = PLANNING_STATE.RouteAccepted;
            this.routeConfirmationDialog.hide();
        });
        this.routeConfirmationDialog.onCancelledObservable.add(() => {
            this.routeConfirmationDialog.hide();
            this.setReadyToLaunchState();
        });
        let renderPipeline = postProcesses.applyPostProcessesToScene(this.scene, this.camera);
        this._renderPipeline = renderPipeline;
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);
        this.actionProcessor?.update();

        switch (this.gameState) {
            case PLANNING_STATE.Created:
                break;
            case PLANNING_STATE.ReadyToLaunch:
                this.star.update(dT);
                this.planets.forEach(p => p.update(dT));
                this.asteroidBelt.update(dT);
                this.cargo.update(dT);
                this.cargo.position.copyFrom(this.origin.position).scaleInPlace(1.1, 1, 1);

                break;
            case PLANNING_STATE.InFlight:
                this.star.update(dT);
                this.planets.forEach(p => p.update(dT));
                this.asteroidBelt.update(dT);

                this.cargo.currentGravity = this.updateGravitationalForcesForBox(dT);
                this.cargo.update(dT);
                break;
            case PLANNING_STATE.CargoArrived:
                break;
            case PLANNING_STATE.CargoDestroyed:
                break;
            case PLANNING_STATE.Paused:
                break;
            case PLANNING_STATE.RouteAccepted:
                break;
            default:
                break;
        }

    }

    ACTIVATE(state, args) {
        if (args.pointerType || this.gameState !== PLANNING_STATE.ReadyToLaunch) {
            return;
        }
        console.log(state, args);

        this.launchCargo(this.cargo.forward.scale(this.launchForce));


        return true;
    }

    MOVE_OUT(state) {
        if (this.gameState === PLANNING_STATE.ReadyToLaunch) {
            this.launchForce = Scalar.Clamp(this.launchForce + this.launchForceIncrement, 0, this.launchForceMax);
        }
    }

    MOVE_IN(state) {
        if (this.gameState === PLANNING_STATE.ReadyToLaunch) {
            this.launchForce = Scalar.Clamp(this.launchForce - this.launchForceIncrement, 0, this.launchForceMax);
        }
    }

    GO_BACK(state) {
        if (!state && this.gameState !== PLANNING_STATE.ReadyToLaunch) {
            this.setReadyToLaunchState();
        }
        return true;
    }

    MOVE_LEFT(state) {
        if (this.gameState === PLANNING_STATE.ReadyToLaunch) {
            this.cargo.mesh.rotate(Axis.Y, -this.launchRotationSpeed, Space.World);
        }
    }

    MOVE_RIGHT(state) {
        if (this.gameState === PLANNING_STATE.ReadyToLaunch) {
            this.cargo.mesh.rotate(Axis.Y, this.launchRotationSpeed, Space.World);
        }
    }

    MOVE_UP(state) {
        if (this.gameState === PLANNING_STATE.ReadyToLaunch) {
            this.cargo.mesh.rotate(Axis.X, -this.launchRotationSpeed, Space.World);
        }
    }

    MOVE_DOWN(state) {
        if (this.gameState === PLANNING_STATE.ReadyToLaunch) {
            this.cargo.mesh.rotate(Axis.X, this.launchRotationSpeed, Space.World);
        }
    }

    PAUSE(state) {
        if (!state) {
            this.togglePause();
        }
        return true;
    }

    togglePause() {
        if (this.gameState === PLANNING_STATE.Paused) {
            this.gameState = this._previousState;
            if (this.gameState === PLANNING_STATE.InFlight) {
                this.cargo.isInFlight = true;
                this.cargo.position.copyFrom(this.cargo.lastFlightPoint.position);
                this.cargo.physicsImpostor.setLinearVelocity(this.cargo.lastFlightPoint.velocity);
            }

            this.cargo.physicsImpostor.wakeUp();
        }
        else {
            this.cargo.isInFlight = false;
            this.cargo.physicsImpostor.sleep();
            this.cargo.physicsImpostor.setLinearVelocity(Vector3.Zero());
            this.gameState = PLANNING_STATE.Paused;
        }
    }

    cargoArrived() {
        this.gameState = PLANNING_STATE.CargoArrived;
        this.cargo.physicsImpostor.setLinearVelocity(new Vector3(0, 0, 0));
        this.routeConfirmationDialog.show();
    }


    onCargoDestroyed(collided) {
        this.destroyedBy = collided.name;
        this.cargo.destroy();
        this.gameState = PLANNING_STATE.CargoDestroyed;
    }

    launchCargo(impulse) {
        if (this.gameState !== PLANNING_STATE.ReadyToLaunch) {
            console.log('Invalid attempt to launch before ready');
            return;
        }
        this.launchArrow.parent = null;
        this.launchArrow.visibility = 0;
        this.cargo.launch(impulse);
        console.log("launching cargo!");

        this.gameState = PLANNING_STATE.InFlight;
    }

    setReadyToLaunchState() {
        console.log('setting state to ReadyToLaunch');
        const muzak = this.soundManager.sound(overworldMusic);
        const ambient = this.soundManager.sound(ambientSound);
        if (muzak && !(muzak.isPlaying || muzak.isPaused)) {
            muzak.play();
        }
        if (ambient && !(ambient.isPlaying || ambient.isPaused)) {
            ambient.play();
        }
        this.cargo.reset();
        this.launchArrow.parent = this.cargo.mesh;
        this.launchArrow.visibility = 0.38;
        this.launchArrow.rotation = Vector3.Zero();

        this.initializePhysics();

        this.gameState = PLANNING_STATE.ReadyToLaunch;
    }

    initializePhysics() {
        this.scene.gravity = Vector3.Zero();
        if (this.scene.isPhysicsEnabled()) {
            console.log("resetting physics engine");
            this.scene.getPhysicsEngine().getImpostors()
                .forEach(i => { i.dispose(); });
            this.scene.disablePhysicsEngine();
        }
        let plugin = new AmmoJSPlugin(true, ammoModule);
        this.scene.enablePhysics(new Vector3(0, 0, 0), plugin);
        this.physicsHelper = new PhysicsHelper(this.scene);

        this.star.physicsImpostor = new PhysicsImpostor(this.star.mesh, PhysicsImpostor.SphereImpostor, {
            mass: this.config.starData.mass,
            restitution: 0,
            disableBidirectionalTransformation: false,
        }, this.scene);
        this.planets.forEach(x => x.physicsImpostor = new PhysicsImpostor(x.mesh, PhysicsImpostor.SphereImpostor, {
            mass: x.planetData.mass,
            restitution: 0,
            disableBidirectionalTransformation: false
        }, this.scene));
        const cargoImp = this.cargo.physicsImpostor = new PhysicsImpostor(this.cargo.mesh, PhysicsImpostor.BoxImpostor, {
            mass: this.cargo.mass,
            disableBidirectionalTransformation: false,
            ignoreParent: true
        }, this.scene);

        const collisionImpostors = this.planets.map(p => p.physicsImpostor);
        collisionImpostors.push(this.star.physicsImpostor);
        cargoImp.registerOnPhysicsCollide(collisionImpostors, (collider, collided) => {
            console.log(`${collider.object?.name} collided with ${collided.object?.name}`);
            this.onCargoDestroyed(collided);
        });
    }

    updateGravitationalForcesForBox() {
        const cargoPosition = this.cargo.position;
        let summedForces = this.star.calculateGravitationalForce(cargoPosition);
        this.planets.forEach(p => summedForces.addInPlace(p.calculateGravitationalForce(cargoPosition)));

        return summedForces;
    }

    dispose() {
        this.soundManager.dispose();
        this.onStateChangeObservable.clear();
        this.routeAcceptedObservable.clear();

        this.encounterManager.dispose();
        this.scene.dispose();

    }
}

export default SpaceTruckerPlanningScreen;
const PLAN_STATE_KEYS = Object.keys(PLANNING_STATE);
export { PLAN_STATE_KEYS, PLANNING_STATE };