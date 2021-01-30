import { Engine } from "@babylonjs/core";
import createStartScene from "./startscene";
const CanvasName = "index-canvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.style.width = "100%";
canvas.style.height = "100%";
document.body.appendChild(canvas);

let eng = new Engine(canvas, true, null, true);
let startScene = createStartScene(eng);
eng.runRenderLoop(() => {
    startScene.scene.render();
});
