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


const planetData = [
    {
        name: "hermes",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 450,
        scale: 10,
        color: new Color3(0.45, 0.33, 0.18),
        diffuseTexture: ceresDiffuseUrl,
        normalTexture: ceresBumpUrl,
        specularTexture: null,
        lightMapUrl: null,
        directIntensity: 0.25,
        mass: 8e13
    },
    {
        name: "tellus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 750,
        scale: 30,
        color: new Color3(0.91, 0.89, 0.72),
        diffuseTexture: earthDiffuseUrl,
        normalTexture: earthNormalUrl,
        specularTexture: earthSpecularUrl,
        lightMapUrl: earthCloudsUrl,
        mass: 1e14
    },
    {
        name: "zeus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 2500,
        scale: 200,
        color: new Color3(0.17, 0.63, 0.05),
        diffuseTexture: jupiterTextureUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null,
        mass: 7e14
    },
    {
        name: "janus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 4000,
        scale: 110,
        color: new Color3(0.55, 0, 0),
        diffuseTexture: neptuneUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null,
        mass: 3.4e14
    }
];
const gameData = {
    planetaryInfo: planetData,
    asteroidBeltOptions: {
        density: 150,
        maxScale: new Vector3(10.25, 10.25, 10.25),
        number: 1000,
        innerBeltRadius: 1000,
        outerBeltRadius: 1800,
        posRadians: 0,
        posRadius: 1
    },
    startingPlanet: "hermes",
    endingPlanet: "zeus",
    cargoMass: 1,
    starData: {
        scale: 500,
        diffuseTexture: sunTextureUrl,
        mass: 3e15
    },
    environment: {
        environmentTexture: environmentTextureUrl
    }
};

const primaryReferenceMass = 4e15;
const gravConstant = 6.67259e-11;

export default gameData;
export {primaryReferenceMass};
export {gravConstant};