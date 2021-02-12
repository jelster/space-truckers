import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Color3 } from "@babylonjs/core/Maths/math.color"
import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import { Texture } from "@babylonjs/core/Materials/Textures/texture"
import { PointLight } from "@babylonjs/core/Lights/pointLight"
import { Scene } from "@babylonjs/core/scene"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { TrailMesh } from "@babylonjs/core/Meshes/trailMesh"
import { Scalar } from "@babylonjs/core/Maths/math.scalar"
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer"
import { Animation } from "@babylonjs/core/Animations/animation"
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures/starfield/starfieldProceduralTexture";

// imported for side-effect only
import "@babylonjs/core/Helpers/sceneHelpers"

import distortTexture from "../assets/textures/distortion.png";
import rockTextureN from "../assets/textures/rockn.png";
import rockTexture from "../assets/textures/rock.png";

function createStar(scene) {
    let starDiam = 16;
    let star = MeshBuilder.CreateSphere("star", { diameter: starDiam, segments: 128 }, scene);
    let mat = new StandardMaterial("starMat", scene);
    star.material = mat;
    mat.emissiveColor = new Color3(0.37, 0.333, 0.11);
    mat.diffuseTexture = new Texture(distortTexture, scene);
    mat.diffuseTexture.level = 1.8;
    star.rotation = Vector3.Zero();

    return star;
}

function createPlanet(opts, scene) {
    let planet = MeshBuilder.CreateSphere(opts.name, { diameter: 1 }, scene);
    let mat = new StandardMaterial(planet.name + "-mat", scene);
    mat.diffuseColor = mat.specularColor = mat.emissiveColor = opts.color;
    mat.specularPower = 0;
    if (opts.rocky === true) {
        mat.bumpTexture = new Texture(rockTextureN, scene);
        mat.diffuseTexture = new Texture(rockTexture, scene);
    }
    else {
        mat.diffuseTexture = new Texture(distortTexture, scene);
    }

    planet.material = mat;
    planet.scaling.setAll(opts.scale);
    planet.position.x = opts.posRadius * Math.sin(opts.posRadians);
    planet.position.z = opts.posRadius * Math.cos(opts.posRadians);
    planet.orbitOptions = opts;
    planet.orbitAnimationOvserver = createAndStartOrbitAnimation(planet, scene);

    return planet;
}

function setupEnvironment(scene) {
    let starfieldPT = new StarfieldProceduralTexture("starfieldPT", 512, scene);
    starfieldPT.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
    starfieldPT.darkmatter = 1.5;
    starfieldPT.distfading = 0.75;
    let envOptions = {
        skyboxSize: 512,
        createGround: false,
        skyboxTexture: starfieldPT
    };
    let light = new PointLight("starLight", Vector3.Zero(), scene);
    light.intensity = 2;
    light.diffuse = new Color3(1, 1, 0);
    light.specular = new Color3(0.98, 1, 0);
    let env = scene.createDefaultEnvironment(envOptions);
    return env;
}

function populatePlanetarySystem(scene) {
    let planets = [];
    let hg = {
        name: "hg",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 14,
        scale: 2,
        color: new Color3(0.45, 0.33, 0.18),
        rocky: true
    };
    let aphro = {
        name: "aphro",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 35,
        scale: 3.5,
        color: new Color3(0.91, 0.89, 0.72),
        rocky: true
    };
    let tellus = {
        name: "tellus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 65,
        scale: 3.75,
        color: new Color3(0.17, 0.63, 0.05),
        rocky: true
    };
    let ares = {
        name: "ares",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 100,
        scale: 3,
        color: new Color3(0.55, 0, 0),
        rocky: true
    };
    let zeus = {
        name: "zeus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 140,
        scale: 6,
        color: new Color3(0, 0.3, 1),
        rocky: false
    };
    planets.push(createPlanet(hg, scene));
    planets.push(createPlanet(aphro, scene));
    planets.push(createPlanet(tellus, scene));
    planets.push(createPlanet(ares, scene));
    planets.push(createPlanet(zeus, scene));
    return planets;
}

function createSpinAnimation() {
    let orbitAnim = new Animation("planetspin", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const keyFrames = [];
    keyFrames.push({
        frame: 0,
        value: 0
    });

    keyFrames.push({
        frame: 60,
        value: Scalar.TwoPi
    });

    orbitAnim.setKeys(keyFrames);
    return orbitAnim;
}

function createAndStartOrbitAnimation(planet, scene) {
    const Gm = 6672.59 * 0.07;
    const opts = planet.orbitOptions;
    const rCubed = Math.pow(opts.posRadius, 3);
    const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
    const v = Math.sqrt(Gm / opts.posRadius);
    const w = v / period;
    const circum = Scalar.TwoPi * opts.posRadius;
    let angPos = opts.posRadians;

    planet.computeWorldMatrix(true);
    let planetTrail = new TrailMesh(planet.name + "-trail", planet, scene, .1, circum, true);
    let trailMat = new StandardMaterial(planetTrail.name + "-mat", scene);
    trailMat.emissiveColor = trailMat.specularColor = trailMat.diffuseColor = opts.color;
    planetTrail.material = trailMat;

    let preRenderObsv = scene.onBeforeRenderObservable.add(sc => {
        planet.position.x = opts.posRadius * Math.sin(angPos);
        planet.position.z = opts.posRadius * Math.cos(angPos);
        angPos = Scalar.Repeat(angPos + w, Scalar.TwoPi);
    });
    return preRenderObsv;
}

export default function createStartScene(engine) {
    let that = {};
    let scene = that.scene = new Scene(engine);
    let camAlpha = 0,
        camBeta = 1.26,
        camDist = 350,
        camTarget = new Vector3(0, 0, 0);
    let env = setupEnvironment(scene);
    let star = that.star = createStar(scene);
    let planets = that.planets = populatePlanetarySystem(scene);
    let camera = that.camera = new ArcRotateCamera("camera1", camAlpha, camBeta, camDist, camTarget, scene);
    camera.attachControl(true);

    let spinAnim = createSpinAnimation();
    star.animations.push(spinAnim);
    scene.beginAnimation(star, 0, 60, true);

    let glowLayer = new GlowLayer("glowLayer", scene);

    planets.forEach(p => {
        glowLayer.addExcludedMesh(p);
        p.animations.push(spinAnim);
        scene.beginAnimation(p, 0, 60, true, Scalar.RandomRange(0.1, 3));
    });

    return that;
}