import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import ceresDiffuseUrl from "../../assets/textures/2k_ceres_fictional.jpg";

import jupiterTextureUrl from "../../assets/textures/jupiter-globalmap.jpg";

import neptuneUrl from "../../assets/textures/nep0fds1.jpg";

import sunTextureUrl from "../../assets/textures/2k_sun.jpg";

import environmentTextureUrl from "../../assets/environment/crab-nebula-ibl.env";

import hazard_icon from '../../assets/Space-trucker-ui-asteroid-warning.png';

import planetEarthNode from "../nme/materials/planetEarthMaterial.json"


const primaryReferenceMass = 4e16;
const gravConstant = 6.67259e-11; // physical value of 6.67259e-11

const massMultiplier = 1.5;
const distanceMultiplier = 1.0;
const scaleMultiplier = 1.0;
const planetData = [
    {
        name: "hermes",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 450 * distanceMultiplier,
        scale: 40 * scaleMultiplier,
        color: new Color3(0.45, 0.33, 0.18),
        diffuseTexture: ceresDiffuseUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null,
        directIntensity: 0.25,
        mass: 1e14
    },
    {
        name: "tellus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 750 * distanceMultiplier,
        scale: 80 * scaleMultiplier,
        color: new Color3(0.91, 0.89, 0.72),
        nodeMaterial: planetEarthNode,
        //diffuseTexture: earthDiffuseUrl,
        //normalTexture: earthNormalUrl,
        //specularTexture: earthSpecularUrl,
        //lightMapUrl: earthCloudsUrl,
        mass: 3e14
    },
    {
        name: "zeus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 2500 * distanceMultiplier,
        scale: 350 * scaleMultiplier,
        color: new Color3(0.17, 0.63, 0.05),
        diffuseTexture: jupiterTextureUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null,
        mass: 7e15
    },
    {
        name: "janus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 4000 * distanceMultiplier,
        scale: 300 * scaleMultiplier,
        color: new Color3(0.55, 0, 0),
        diffuseTexture: neptuneUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null,
        mass: 7.4e14
    }
];

const encounterZones = {
    innerSystem: {
        id: "inner_system",
        name: "Inner System",
        innerBoundary: 250,
        outerBoundary: 800,
        encounterRate: 0.333,
        colorCode: "#00ff00",
        encounters: [
            {
                name: 'Solar Flare',
                id: 'solar_flare',
                probability: 0.99,
                image: hazard_icon,
                scoreModifier: 0.0
            },
            {
                name: 'Coronal Mass Ejection',
                id: 'cme',
                probability: 0.015,
                image: '',
                scoreModifier: 0.015
            },
            { name: '', id: 'no_encounter', probability: 0.01, image: '', scoreModifier: 0.0  },
            {
                name: 'Magnetic Reconnection',
                id: 'magnetic_reconnect',
                probability: 0.01,
                image: '',
                scoreModifier: 0.15
            }
        ]
    },
    asteroidBelt: {
        id: "asteroid_belt",
        name: "Asteroid Belt",
        innerBoundary: 1000,
        outerBoundary: 1700,
        encounterRate: 0.425,
        colorCode: "#ff0000",
        encounters: [
            {
                name: 'Rock Hazard',
                id: 'rock_hazard',
                image: hazard_icon,
                probability: 0.89,
                scoreModifier: 0.019
            },
            {
                name: 'Rock Monster',
                id: 'rock_monster',
                image: '',
                probability: 0.01,
                scoreModifier: 0.25
            },
            { name: '', id: 'no_encounter', probability: 0.1, image: '', scoreModifier: 0.0  },
            {
                name: 'Momentum Tether',
                id: 'momentum_tether',
                probability: 0.01,
                image: '',
                scoreModifier: 0.15
            }
        ]
    },
    spaceHighway: {
        id: "space_highway",
        name: "Space Highway",
        innerBoundary: 1800,
        outerBoundary: 2500,
        encounterRate: 0.389,
        colorCode: "#ffff00",
        encounters: [
            { name: '', id: 'no_encounter', probability: 0.01, image: '', scoreModifier: 0.0  },
            {
                name: 'Lane Closure',
                id: 'road_construction',
                probability: 0.99,
                image: '',
                scoreModifier: 0.0
            },
            {
                name: 'Detour',
                id: 'space_detour',
                probability: 0.18,
                image: '',
                scoreModifier: 0.05
            },
            {
                name: 'Nav Flagger',
                id: 'nav_flagger',
                probability: 0.01,
                image: '',
                scoreModifier: 0.25
            },
            {
                name: 'Momentum Tether',
                id: 'momentum_tether',
                probability: 0.01,
                image: '',
                scoreModifier: 0.15
            }
        ]
    },
    outerSystem: {
        id: "outer_system",
        name: "Outer System",
        innerBoundary: 2600,
        outerBoundary: 5000,
        encounterRate: 0.10,
        colorCode: "#ff00ff",
        encounters: [
            { name: '', id: 'no_encounter', probability: 0.001, image: '', scoreModifier: 0.0  },
            { name: 'Wandering Space-Herd', id: 'space_herd', probability: 0.79, image: '', scoreModifier: 0.215 },
            { name: 'Primordial Black Hole', id: 'black_hole', probability: 0.01, image: '', scoreModifier: 0.5 },
            { name: 'Space-Porta-Potty', id: 'space_potty', probability: 0.1, image: '', scoreModifier: 0.15 },
        ]
    }
};
const gameData = {
    planetaryInfo: planetData,
    asteroidBeltOptions: {
        density: 390,
        maxScale: new Vector3(10.25, 10.25, 10.25),
        number: 20000,
        innerBeltRadius: 900 * distanceMultiplier,
        outerBeltRadius: 1800 * distanceMultiplier,
        posRadians: 0,
        posRadius: 1
    },
    startingPlanet: "hermes",
    endingPlanet: "zeus",
    cargoMass: 1,
    starData: {
        scale: 500 * scaleMultiplier,
        diffuseTexture: sunTextureUrl,
        mass: primaryReferenceMass
    },
    environment: {
        environmentTexture: environmentTextureUrl,
        blurParameter: 0,
        IBLIntensity: 0.42,
        lightIntensity: 6000000,
        skyboxScale: 16384
    }
};

export default gameData;
export { primaryReferenceMass };
export { gravConstant };
export { encounterZones };