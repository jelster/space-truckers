import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import ceresDiffuseUrl from "../../assets/textures/2k_ceres_fictional.jpg";
import ceresBumpUrl from "../../assets/textures/2k_ceres_fictional.dds";

import earthDiffuseUrl from "../../assets/textures/2k_earth_daymap.jpg";
import earthNormalUrl from "../../assets/textures/2k_earth_normal_map.png";
import earthSpecularUrl from "../../assets/textures/2k_earth_specular_map.png";
import earthCloudsUrl from "../../assets/textures/2k_earth_clouds.jpg";

import jupiterTextureUrl from "../../assets/textures/jupiter-globalmap.jpg";

import neptuneUrl from "../../assets/textures/nep0fds1.jpg";

import sunTextureUrl from "../../assets/textures/2k_sun.jpg";

import environmentTextureUrl from "../../assets/environment/milkyway-pbr-hdr.env";


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
        scale: 10 * scaleMultiplier,
        color: new Color3(0.45, 0.33, 0.18),
        diffuseTexture: ceresDiffuseUrl,
        normalTexture: ceresBumpUrl,
        specularTexture: null,
        lightMapUrl: null,
        directIntensity: 0.25,
        mass: 1e14
    },
    {
        name: "tellus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 750 * distanceMultiplier,
        scale: 30 * scaleMultiplier,
        color: new Color3(0.91, 0.89, 0.72),
        diffuseTexture: earthDiffuseUrl,
        normalTexture: earthNormalUrl,
        specularTexture: earthSpecularUrl,
        lightMapUrl: earthCloudsUrl,
        mass: 3e14
    },
    {
        name: "zeus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 2500 * distanceMultiplier,
        scale: 200 * scaleMultiplier,
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
        scale: 110 * scaleMultiplier,
        color: new Color3(0.55, 0, 0),
        diffuseTexture: neptuneUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null,
        mass: 7.4e14
    }
];
const gameData = {
    planetaryInfo: planetData,
    asteroidBeltOptions: {
        density: 250,
        maxScale: new Vector3(10.25, 10.25, 10.25),
        number: 5000,
        innerBeltRadius: 1000 * distanceMultiplier,
        outerBeltRadius: 1700 * distanceMultiplier,
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
        environmentTexture: environmentTextureUrl
    }
};

export default gameData;
export {primaryReferenceMass};
export {gravConstant};