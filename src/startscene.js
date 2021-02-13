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
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures/starfield/starfieldProceduralTexture";

// imported for side-effect only
import "@babylonjs/core/Helpers/sceneHelpers"

// factories
import AstroFactory from "./astroFactory";

// assets
import distortTexture from "../assets/textures/distortion.png";


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
    const planetData = [ hg, aphro, tellus, ares, zeus ];
    const planets = [];
    planetData.forEach(p => {
        const planet = AstroFactory.createPlanet(p, scene);
        AstroFactory.createAndStartOrbitAnimation(planet, scene);
        planet.computeWorldMatrix(true);
        let planetTrail = new TrailMesh(planet.name + "-trail", planet, scene, .1, planet.orbitOptions.orbitalCircum, true);
        let trailMat = new StandardMaterial(planetTrail.name + "-mat", scene);
        trailMat.emissiveColor = trailMat.specularColor = trailMat.diffuseColor = planet.orbitOptions.color;
        planetTrail.material = trailMat;
        planets.push(planet);
    });    

    return planets;
}

export default function createStartScene(engine) {
    const that = {};
    const scene = that.scene = new Scene(engine);
    const camAlpha = 0,
        camBeta = 1.26,
        camDist = 350,
        camTarget = new Vector3(0, 0, 0);
    that.env = setupEnvironment(scene);
    const star = that.star = createStar(scene);
    const planets = that.planets = populatePlanetarySystem(scene);
    that.camera = new ArcRotateCamera("camera1", camAlpha, camBeta, camDist, camTarget, scene);
    const spinAnim = AstroFactory.createSpinAnimation();
    star.animations.push(spinAnim);
    scene.beginAnimation(star, 0, 60, true);

    const glowLayer = new GlowLayer("glowLayer", scene);

    planets.forEach(p => {
        glowLayer.addExcludedMesh(p);
        p.animations.push(spinAnim);
        scene.beginAnimation(p, 0, 60, true, Scalar.RandomRange(0.1, 3));
    });

    return that;
}