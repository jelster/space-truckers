import { Engine } from "@babylonjs/core";

const CanvasName = "index-canvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.style.width = "100%";
canvas.style.height = "100%";
document.body.appendChild(canvas);

export {canvas};