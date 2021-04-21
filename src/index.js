import { Engine } from "@babylonjs/core/Engines/engine";
import SpaceTruckerApplication from "./spaceTruckerApplication";
import SpaceTruckerLoadingScreen from "./spaceTruckerLoadingScreen";
import logger from "./logger";

const CanvasName = "index-canvas";
const launchButton = document.getElementById("btnLaunch");
const pageLandingContent = document.getElementById("pageContainer");

const canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

const eng = new Engine(canvas, true, null, true);
logger.logInfo("Created BJS engine");

eng.loadingScreen = new SpaceTruckerLoadingScreen(eng);

const theApp = new SpaceTruckerApplication(eng);    

const btnClickEvtHandle = () => {
    logger.logInfo("Launch button clicked. Initializing application.");
    canvas.classList.remove("background-canvas");
    pageLandingContent.style.display = "none";
    launchButton.removeEventListener("click", btnClickEvtHandle);
    
    theApp.run();
};
launchButton.addEventListener("click", btnClickEvtHandle);

window.addEventListener('resize', () => {
    eng.resize();
});