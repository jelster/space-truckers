import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Observable } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PhysicsHelper } from "@babylonjs/core/Physics/physicsHelper";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";

import AsteroidBelt from "./asteroidBelt";
import Planet from "./planet";
import CargoUnit from "./cargoUnit";
import SpaceTruckerInputProcessor from "../spaceTruckerInputProcessor";
import SpaceTruckerSoundManager from "../spaceTruckerSoundManager";
import PlanningScreenGui from "./route-plan-gui";
import { AmmoJSPlugin } from "@babylonjs/core";
import "@babylonjs/core/Physics/physicsEngineComponent";
import { ammoModule, ammoReadyPromise } from "../externals/ammoWrapper";
 
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

    get state() {
        return this._state;
    }
    set state(value) {
        if (this._previousState != value) {
            this._previousState = this._state;
            this._state = value;
            this.onStateChangeObservable.notifyObservers({ priorState: this._previousState, currentState: value });
        }
    }
    _previousState = SpaceTruckerPlanningScreen.PLANNING_STATE.Created;
    _state = SpaceTruckerPlanningScreen.PLANNING_STATE.Created;

    constructor(engine, inputManager, config) {
        
        engine.loadingUIText = 'Loading Route Planning Simulation...';

        this.scene = new Scene(engine);
        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, []);
        this.config = config;

        this.soundManager = new SpaceTruckerSoundManager(this.scene, overworldMusic)

        this.scene.clearColor = new Color3(0.1, 0.1, 0.1);

        const starData = config.starData;
        this.star = MeshBuilder.CreateSphere("star", { diameter: starData.scale }, this.scene);
        this.star.material = new StandardMaterial("starMat", this.scene);
        this.star.material.emissiveTexture = new Texture(starData.diffuseTexture, this.scene);

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

        this.cargo = new CargoUnit(this.scene, { origin: this.origin });

        this.scene.onReadyObservable.add(() => {
            this.ui = new PlanningScreenGui(this);
            this.ui.bindToScreen();
            ammoReadyPromise.then(res => console.log("ammo ready"));
            
        });
        this.state = SpaceTruckerPlanningScreen.PLANNING_STATE.Initialized;
    }

     
    launchCargo(impulse) {

        if (this.state !== PLANNING_STATE.ReadyToLaunch) {
            console.log('Invalid attempt to launch before ready');
            return;
        }

        this.cargo.physicsImpostor.applyImpulse(impulse, this.cargo.position);
        this.state = PLANNING_STATE.InFlight;
    }

    setReadyToLaunchState() {
        console.log('setting state to ReadyToLaunch');
        const muzak = this.soundManager.sound(overworldMusic);
        if (muzak && !(muzak.isPlaying || muzak.isPaused)) {
            muzak.play();
        }        
       // this.initializePhysics();
        this.cargo.reset();
        this.camera.useAutoRotationBehavior = true;
        this.camera.useFramingBehavior = true;
        this.camera.attachControl(true);
        this.state = SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch;
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

        this.star.physicsImpostor = new PhysicsImpostor(this.star, PhysicsImpostor.SphereImpostor, { mass: this.config.starData.mass }, this.scene);
        this.planets.forEach(x => x.physicsImpostor = new PhysicsImpostor(x.mesh, PhysicsImpostor.SphereImpostor, { mass: x.planetData.mass }, this.scene));
        this.cargo.physicsImpostor = new PhysicsImpostor(this.cargo.mesh, PhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);

        const collisionImpostors = this.planets.map(p => p.physicsImpostor);
        collisionImpostors.push(this.star.physicsImpostor);
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);

        switch (this.state) {
            case SpaceTruckerPlanningScreen.PLANNING_STATE.Created:
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch:
            case SpaceTruckerPlanningScreen.PLANNING_STATE.InFlight:
                this.planets.forEach(p => p.update(dT));
                this.asteroidBelt.update(dT);
                this.cargo.update(dT);
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.CargoArrived:
                break;
            case SpaceTruckerPlanningScreen.PLANNING_STATE.RouteAccepted:
                break;
            default:
                break;
        }


    }
}

export default SpaceTruckerPlanningScreen;