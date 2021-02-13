import { Engine } from "@babylonjs/core/Engines/engine";
import SpaceTruckerLoadingScreen from "./spaceTruckerLoadingScreen";
const CanvasName = "index-canvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;

canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let eng = new Engine(canvas, true, null, true);
window.addEventListener('resize', () => {
    eng.resize();
});
eng.loadingScreen = new SpaceTruckerLoadingScreen(eng);


// for testing
const launchButton = document.getElementById("btnLaunch");
const pageLandingContent = document.getElementById("pageContainer");
const btnClickEvtHandle = launchButton.addEventListener("click", () => {
    canvas.classList.remove("background-canvas");
    pageLandingContent.style.display = "none";

    eng.enterFullscreen(true);
    eng.displayLoadingUI();
    
    setTimeout(() => eng.hideLoadingUI(), 15000);
});

