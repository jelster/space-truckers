import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

function applyPostProcessesToScene(scene, camera) {
    // Create the default pipeline
    let defaultPipeline = new DefaultRenderingPipeline("default", true, scene, [camera]);
    defaultPipeline.samples = 4;
    defaultPipeline.fxaaEnabled = true;
    defaultPipeline.imageProcessingEnabled = true;
    defaultPipeline.imageProcessing.toneMappingEnabled = true;
    defaultPipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;

    defaultPipeline.bloomEnabled = true;
    return defaultPipeline;
}

let postProcesses = {
    applyPostProcessesToScene: applyPostProcessesToScene
};

export default postProcesses;