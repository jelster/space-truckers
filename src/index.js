import { Engine } from "@babylonjs/core/Engines/engine";
import createStartScene from "./startscene";
const CanvasName = "index-canvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;

canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let eng = new Engine(canvas, true, null, true);

eng.loadingScreen = new SpaceTruckerLoadingScreen(eng);


// for testing

const btnClickEvtHandle = launchButton.addEventListener("click", () => {
    canvas.classList.remove("background-canvas");
    pageLandingContent.style.display = "none";
    eng.displayLoadingUI();
    
    setTimeout(() => eng.hideLoadingUI(), 15000);
});

