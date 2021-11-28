import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';

import { Control } from '@babylonjs/gui/2D/controls/control';
import { Rectangle } from '@babylonjs/gui/2D/controls/rectangle';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import radarNodeMaterial from '../nme/proceduralTextures/radarSweep.json';
import {screenConfig}  from './gameData';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Viewport } from '@babylonjs/core/Maths/math.viewport';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { NodeMaterial } from "@babylonjs/core/Materials/Node/nodeMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';



const { GUI_MASK } = screenConfig;
const initializeGui = async (screen) => {
    const { scene, encounters } = screen;
    const { guiViewportSize, radarTextureResolution } = screenConfig;
    
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
    radarMesh.rotation.x = Math.PI / 2;

    let radarGui = AdvancedDynamicTexture.CreateForMeshTexture(radarMesh, radarTextureResolution, radarTextureResolution, false);
    radarGui.background = "black";
    
    let radarMaterial = new StandardMaterial("radMat", scene);
    let nodeMat = NodeMaterial.Parse(radarNodeMaterial, scene, document.baseURI);    
    let radarTexture = nodeMat.createProceduralTexture(radarTextureResolution, scene);

    radarMesh.material = radarMaterial;
    radarMaterial.diffuseTexture = radarGui;
    radarMaterial.specularColor = Color3.Black();
    radarMaterial.emissiveColor = Color3.White();
    radarMaterial.ambientTexture = radarTexture;
    radarMaterial.emissiveTexture = radarTexture;
    radarTexture.TextureMode = Texture.PLANAR_MODE;

    guiCamera.lockedTarget = radarMesh;

    encounters.forEach((o, i) => {
        let blip = new Rectangle("radar-obstacle-" + i);
        o.uiBlip = blip;
        blip.width = "3%";
        blip.height = "3%";
        blip.background = "white";
        blip.color = "white";
        blip.cornerRadius = "1000";
        radarGui.addControl(blip);

    });
    var gl = new GlowLayer("gl", scene, { blurKernelSize: 4, camera: guiCamera });
    return { radarGui, radarMesh, radarMaterial, radarTexture, guiCamera };
};

export default initializeGui;