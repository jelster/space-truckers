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


import AsteroidBelt from "./route-planning/asteroidBelt";
import Planet from "./route-planning/planet";
import CargoUnit from "./route-planning/cargoUnit";
import SpaceTruckerInputProcessor from "./spaceTruckerInputProcessor";

import backgroundMusicUrl from "../assets/music/Space-Truckers overworld theme.m4a";

const PLANNING_STATE = Object.freeze({
    Created: 0,
    ReadyToLaunch: 1,
    InFlight: 2,
    CargoArrived: 3,
    RouteAccepted: 4,
    GeneratingCourse: 5
});


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
    muzak;
    actionProcessor;
    onStateChangeObservable = new Observable();

    get state() {
        return this._state;
    }
    set state(value) {
        const currValue = this.state;
        if (currValue !== value) {
            this._state = value;
            this.onStateChangeObservable.notifyObservers({ priorState: currValue, currentState: value });
        }
    }

    _state = PLANNING_STATE.Created;

    constructor(engine, inputManager, config) {
        this.scene = new Scene(engine);
        this.actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, []);
        this.config = config;

        engine.displayLoadingUI();

        engine.loadingUIText = 'Loading route planning...';

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
        let sb = this.scene.createDefaultSkybox(skyTexture, false, 20000);

        this.camera = new ArcRotateCamera("cam", 0, 1.35, 3000, Vector3.Zero(), this.scene);


        this.camera.maxZ = 100000;
        this.camera.position.y += 10000;

        this.light = new PointLight("starLight", new Vector3(), this.scene);
        this.light.intensity = 10000000;

        const muzakOptions = { autoplay: false, loop: true, volume: 0.87 };
        this.muzak = new Sound("overworld-music", backgroundMusicUrl, this.scene, () => {
            console.log("muzak ready");
            this.muzak.play();
        }, muzakOptions);

        this.scene.onReadyObservable.add(() => {
            console.log("ready scene");
            engine.hideLoadingUI();

            this.setReadyToLaunchState();
        });

    }

    setReadyToLaunchState() {
        if (this.trailMesh) {
            this.trailMesh.dispose();
            this.trailMesh = null;
        }

        this.origin = this.planets.filter(p => p.name ===
            this.config.startingPlanet)[0];


        this.destination = this.planets.filter(p =>
            p.name === this.config.endingPlanet)[0];

        //  this?.cargo?.dispose();
        this.cargo = new CargoUnit(this.scene, { origin: this.origin });
        this.camera.useAutoRotationBehavior = true;
        this.camera.useFramingBehavior = true;


        // this.camera.radius = 500;

         
        this.state = PLANNING_STATE.ReadyToLaunch;
    }

    update(deltaTime) {
        const dT = deltaTime ?? (this.scene.getEngine().getDeltaTime() / 1000);

        switch (this.state) {
            case PLANNING_STATE.Created:
                break;
            case PLANNING_STATE.ReadyToLaunch:
            case PLANNING_STATE.InFlight:
                this.planets.forEach(p => p.update(dT));
                this.asteroidBelt.update(dT);
                this.cargo.update(dT);
                break;
            case PLANNING_STATE.CargoArrived:
                break;
            case PLANNING_STATE.RouteAccepted:
                break;
            default:
                break;
        }


    }
}

export default SpaceTruckerPlanningScreen;