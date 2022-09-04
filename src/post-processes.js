import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

function applyPostProcessesToScene(scene, camera) {
    // Create the default pipeline
    let defaultPipeline = new DefaultRenderingPipeline("default", true, scene, [camera]);
    defaultPipeline.samples = 4;
    defaultPipeline.fxaaEnabled = true;

    let imageProcessing = defaultPipeline.imageProcessing;
    defaultPipeline.imageProcessingEnabled = true;
    imageProcessing.toneMappingEnabled = true;
    imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    imageProcessing.colorCurvesEnabled = true;
    imageProcessing.colorGradingEnabled = true;


    defaultPipeline.grainEnabled = true;
    defaultPipeline.grainAmount = 0.5;
    defaultPipeline.grain.animated = true;
    defaultPipeline.sharpenEnabled = true;
    defaultPipeline.bloomEnabled = true;
    return defaultPipeline;
}

let postProcesses = {
    applyPostProcessesToScene: applyPostProcessesToScene
};

export default postProcesses;