import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { screenConfig, environmentConfig } from "./gameData.js";


const { SCENE_MASK } = screenConfig;
const { envTextureUrl, skyBoxSize } = environmentConfig;

const initializeEnvironment = (screen) => {
    const { scene } = screen;
    var light = new HemisphericLight("light", new Vector3(0, 0, -1), scene);
    light.intensity = 1000;
    var skyTexture = new CubeTexture(envTextureUrl, scene);
    skyTexture.coordinatesMode = Texture.SKYBOX_MODE;
    scene.reflectionTexture = skyTexture;
    var skyBox = scene.createDefaultSkybox(skyTexture, false, skyBoxSize);
    skyBox.layerMask = SCENE_MASK;
    screen.environment = { skyBox, light, skyTexture };
    return screen.environment;
};

export default initializeEnvironment;
