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
import { setAndStartTimer } from "@babylonjs/core/Misc/timer";
import { ammoModule, ammoReadyPromise } from "../externals/ammoWrapper";

import AsteroidBelt from "./asteroidBelt";
import Planet from "./planet";
import CargoUnit from "./cargoUnit";
import SpaceTruckerInputProcessor from "../spaceTruckerInputProcessor";
import SpaceTruckerSoundManager from "../spaceTruckerSoundManager";
import PlanningScreenGui from "./route-plan-gui";
import Star from "./star";
import gameData from "./gameData";

const preFlightActionList = [
    { action: 'ACTIVATE', shouldBounce: () => true },
    { action: 'MOVE_OUT', shouldBounce: () => true },

    { action: 'GO_BACK', shouldBounce: () => true }
];
const overworldMusic = "overworld";
class SpaceTruckerPlanningScreen {
    scene;
    config;
    launchForce = 5.0;
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

    static PLANNING_STATE = Object.freeze({
        Created: 0,
        Initialized: 1,
        ReadyToLaunch: 2,
        InFlight: 3,
        CargoArrived: 4,
        RouteAccepted: 5,
        GeneratingCourse: 6
    });

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
    _previousState = SpaceTruckerPlanningScreen.PLANNING_STATE.Created;
    _state = SpaceTruckerPlanningScreen.PLANNING_STATE.Created;

    constructor(engine, inputManager, config) {
        this.onStateChangeObservable.add(s => console.log(`${s.currentState} is new state. Prev was ${s.priorState}`));
        engine.loadingUIText = 'Loading Route Planning Simulation...';

        this.scene = new Scene(engine);

        this.config = config;

        this.soundManager = new SpaceTruckerSoundManager(this.scene, overworldMusic);
        this.soundManager.onSoundPlaybackEnded.add(soundId => {
            if (soundId === overworldMusic) {
                setAndStartTimer({
                    contextObservable: this.scene.onBeforeRenderObservable,
                    timeout: 10000,
                    onEnded: () => this.soundManager.sound(soundId).play()
                });
            }
        });

        this.scene.clearColor = new Color3(0.1, 0.1, 0.1);


        this.star = new Star(this.scene, config.starData);

        const planetData = config.planetaryInfo;
        planetData.forEach(planData => {
            let planet = new Planet(this.scene, planData);
            this.planets.push(planet);
        });


        this.asteroidBelt = new AsteroidBelt(this.scene, config.asteroidBeltOptions);

        //let skyTexture = CubeTexture.CreateFromImages(skyBoxfiles, this.scene);
        const skyTexture = new CubeTexture(config.environment.environmentTexture, this.scene);
        skyTexture.coordinatesMode = Texture.SKYBOX_MODE;
        this.scene.reflectionTexture = skyTexture;
        this.skybox = this.scene.createDefaultSkybox(skyTexture, false, 20000);

        this.camera = new ArcRotateCamera("cam", 0, 1.35, 3000, Vector3.Zero(), this.scene);


        this.camera.maxZ = 100000;
        this.camera.position.y += 10000;

        this.light = new PointLight("starLight", new Vector3(), this.scene);
        this.light.intensity = 10000000;


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

        this.scene.onReadyObservable.add(() => {
            this.ui = new PlanningScreenGui(this);
            this.ui.bindToScreen();
        });
        ammoReadyPromise.then(res => {
            console.log("ammo ready");
            this.initializePhysics();
        });
        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, preFlightActionList);
        this.gameState = SpaceTruckerPlanningScreen.PLANNING_STATE.Initialized;
        this.camera.useFramingBehavior = true;
        this.camera.attachControl(true);
    }

    MOVE_OUT(state) {
        if (!state.previousState && this.gameState === SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch) {
            this.launchCargo(new Vector3(-1, 0, 1).scale(100));
        }
        return true;
    }

    GO_BACK(state) {
        if (!state.previousState && this.gameState === SpaceTruckerPlanningScreen.PLANNING_STATE.InFlight) {
            this.setReadyToLaunchState();
        }
        return true;
    }


    launchCargo(impulse) {
        if (this.gameState !== SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch) {
            console.log('Invalid attempt to launch before ready');
            return;
        }
        console.log("launching cargo!");
         
        this.cargo.physicsImpostor.applyImpulse(impulse, this.cargo.mesh.getAbsolutePosition());
        this.gameState = SpaceTruckerPlanningScreen.PLANNING_STATE.InFlight;
    }

    setReadyToLaunchState() {
        console.log('setting state to ReadyToLaunch');
        const muzak = this.soundManager.sound(overworldMusic);
        if (muzak && !(muzak.isPlaying || muzak.isPaused)) {
            muzak.play();
        }
        this.cargo.reset();

        this.gameState = SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch;
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
        this.cargo.physicsImpostor = new PhysicsImpostor(this.cargo.mesh, PhysicsImpostor.BoxImpostor, {
            mass: this.cargo.mass,
            disableBidirectionalTransformation: false
        }, this.scene);

        // const collisionImpostors = this.planets.map(p => p.physicsImpostor);
        // collisionImpostors.push(this.star.physicsImpostor);
        // this.cargo.physicsImpostor.registerOnPhysicsCollide(collisionImpostors, (collider, collided) => { 
        //     console.log(`${collider.name} collided with ${collided.name}`);
        // });
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);
        this.actionProcessor?.update();
        switch (this.gameState) {
            case SpaceTruckerPlanningScreen.PLANNING_STATE.Created:
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch:
                this.star.update(dT);
                this.planets.forEach(p => p.update(dT));
                this.asteroidBelt.update(dT);
                this.cargo.position = this.origin.position.clone().scaleInPlace(1.1, 1, 1);
                this.cargo.update(dT);
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.InFlight:
                this.star.update(dT);
                this.planets.forEach(p => p.update(dT));
                this.asteroidBelt.update(dT);
                this.cargo.update(dT);

                let grav = this.updateGravitationalForcesForBox(dT);
                this.cargo.physicsImpostor.applyForce(grav, this.cargo.mesh.getAbsolutePosition());
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.CargoArrived:
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.RouteAccepted:
                break;
            default:
                break;
        }


    }

    updateGravitationalForcesForBox(timeStep) {
        const cargoPosition = this.cargo.position;
        let summedForces = this.star.calculateGravitationalForce(cargoPosition);
        this.planets.forEach(p => summedForces.addInPlace(p.calculateGravitationalForce(cargoPosition)));

        return summedForces; //.scaleInPlace(timeStep);
    }
}

export default SpaceTruckerPlanningScreen;