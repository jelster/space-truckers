import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Observable } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Sound } from "@babylonjs/core/Audio/sound";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";


import AsteroidBelt from "./asteroidBelt";
import Planet from "./planet";
import CargoUnit from "./cargoUnit";
import SpaceTruckerInputProcessor from "../spaceTruckerInputProcessor";
import SpaceTruckerSoundManager from "../spaceTruckerSoundManager";
import PlanningScreenGui from "./route-plan-gui";





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
            this.state = SpaceTruckerPlanningScreen.PLANNING_STATE.Initialized;
            this.ui = new PlanningScreenGui(this);
            this.ui.bindToScreen();
        });
    }

    setReadyToLaunchState() {
        const muzak = this.soundManager.sound(overworldMusic);
        if (muzak && !(muzak.isPlaying || muzak.isPaused)) {
            muzak.play();
        }

        this.cargo.reset();

        this.camera.useAutoRotationBehavior = true;
        this.camera.useFramingBehavior = true;
        this.camera.attachControl(true);
        this.state = SpaceTruckerPlanningScreen.PLANNING_STATE.ReadyToLaunch;
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