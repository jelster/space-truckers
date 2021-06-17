import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";


const planetData = [
    {
        name: "hermes",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 450,
        scale: 10,
        color: new Color3(0.45, 0.33, 0.18),
        diffuseTexture: ceresDiffuseURl,
        normalTexture: ceresBumpUrl,
        specularTexture: null,
        lightMapUrl: null,
        directIntensity: 0.25
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
        lightMapUrl: earthCloudsUrl
    },
    {
        name: "zeus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 2500,
        scale: 200,
        color: new Color3(0.17, 0.63, 0.05),
        diffuseTexture: juperTextureUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null
    },
    {
        name: "janus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 4000,
        scale: 110,
        color: new Color3(0.55, 0, 0),
        diffuseTexture: saturnUrl,
        normalTexture: null,
        specularTexture: null,
        lightMapUrl: null
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
    starData: {
        scale: 500,
        diffuseTexture: sunTextureUrl
    }
};

const primaryReferenceMass = 4e15;
const gravConstant = 6.67259e-11;

export default { planetData, gameData, primaryReferenceMass, gravConstant };