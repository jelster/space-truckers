import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';

import { Control } from '@babylonjs/gui/2D/controls/control';
import { Rectangle } from '@babylonjs/gui/2D/controls/rectangle';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import radarNodeMaterial from '../nme/proceduralTextures/radarSweep.json';
import {screenConfig}  from './gameData';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { NodeMaterial } from "@babylonjs/core/Materials/Node/nodeMaterial";

const { GUI_MASK } = screenConfig;
const initializeGui = async (screen) => {
    const { scene } = screen;
    const { guiViewportSize, radarTextureResolution } = screenConfig;
    let radarTexture = NodeMaterial.Parse(radarNodeMaterial, scene, document.baseURI);
    let guiCamera = new UniversalCamera("guiCam", new Vector3(0, 50, 0), scene);
    guiCamera.layerMask = GUI_MASK;
    guiCamera.viewport = new Viewport(0, 0, 1 - 0.6, 1 - 0.6);
    guiCamera.mode = UniversalCamera.ORTHOGRAPHIC_CAMERA;
    guiCamera.orthoTop = guiViewportSize / 2;
    guiCamera.orthoRight = guiViewportSize / 2;
    guiCamera.orthoLeft = -guiViewportSize / 2;
    guiCamera.orthoBottom = -guiViewportSize / 2;
    scene.activeCameras.push(guiCamera);

    let radarMesh = MeshBuilder.CreatePlane("radarMesh", { width: 4.96, height: 4.96 }, scene);
    radarMesh.layerMask = GUI_MASK;

    let radarGui = AdvancedDynamicTexture.CreateForMeshTexture(radarMesh, radarTextureResolution, radarTextureResolution, false);
    radarGui.background = "black";

    radarMesh.rotation.x = Math.PI / 4;

    radarMesh.material = radarMaterial;
    radarMaterial.diffuseTexture = radarGui;
    radarMaterial.specularColor = Color3.Black();
    radarMaterial.emissiveColor = Color3.White();
    radarMaterial.ambientTexture = radarTexture;
    radarMaterial.emissiveTexture = radarTexture;
    radarTexture.TextureMode = Texture.PLANAR_MODE;

    guiCamera.lockedTarget = radarMesh;

    return { radarGui, radarMesh };
};

export default initializeGui;