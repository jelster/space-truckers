import { Engine } from "@babylonjs/core/Engines/engine";
import SpaceTruckerApplication from "./spaceTruckerApplication";
import SpaceTruckerLoadingScreen from "./spaceTruckerLoadingScreen";

const CanvasName = "index-canvas";
const launchButton = document.getElementById("btnLaunch");
const pageLandingContent = document.getElementById("pageContainer");

const canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

const eng = new Engine(canvas, true, null, true);

eng.loadingScreen = new SpaceTruckerLoadingScreen(eng);

const theApp = new SpaceTruckerApplication(eng);

const btnClickEvtHandle = launchButton.addEventListener("click", () => {
    canvas.classList.remove("background-canvas");
    pageLandingContent.style.display = "none";
    launchButton.removeEventListener("click", btnClickEvtHandle);
    
    theApp.initializeApplication();
    
});

window.addEventListener('resize', () => {
    eng.resize();
});