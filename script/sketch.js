import "p5.js-svg";
// import pixi from pixi.js
import * as PIXI from "pixi.js";

import { Application, RenderTexture, Sprite, Ticker } from "pixi.js";
import { Recorder, RecorderStatus, Encoders } from "canvas-record";

import { sv } from "./utils/variables.js";
import { recalculateGrid } from "./utils/eventHandlers.js";
import { loadSetupImages, updateSvgIcons } from "./utils/loadImages";
import { draw } from "./rendering/draw.js";
import { createInput } from "./utils/input";
import { initializeLoadIcon, showLoadIcon } from "./utils/icons.js";
import { downloadCanvas } from "./utils/utils.js";
import { setupRecorder } from "./utils/recording.js";

let resizeAppToMe = document.getElementById("pixiSizerDiv");
console.log("resizeAppToMe", resizeAppToMe);
let targetCanvas = document.getElementById("pixiCanvasTarget");
sv.resizeAppToMeWidth = resizeAppToMe.offsetWidth;
sv.resizeAppToMeHeight = resizeAppToMe.offsetHeight;
// console.log("resizeAppToMeWidth", sv.resizeAppToMeWidth);
// console.log("resizeAppToMeHeight", sv.resizeAppToMeHeight);
sv.pApp = new Application();
await sv.pApp.init({
  background: "#0000ff",
  // background: "#ffffff",
  // background: "#00f0ff",
  // transparent: true,
  clearBeforeRender: true,
  preserveDrawingBuffer: true,
  autoDensity: true,
  resolution: 3,
  antialias: true,
  // THIS WIDTH AND HEIGHT
  // MUST currently match img.width and img.height in  debugImageTo100(),
  // and the width and height of pixiSizerDiv and pixiCanvasTarget in style.css
  width: 800,
  height: 800,
  canvas: targetCanvas,
  resizeTo: resizeAppToMe,
  preference: "webgl",
});
// document.getElementById("pixiApp").appendChild(sv.pApp.canvas);

sv.ticker = new Ticker();
sv.ticker.autoStart = false;
sv.ticker.add(() => {
  render();
});
sv.ticker.stop();

export default function (p) {
  sv.p = p;
}

async function mySetup() {
  initializeLoadIcon();
  createInput();
  showLoadIcon();

  await loadSetupImages();

  recalculateGrid();
  updateSvgIcons();

  sv.setupDone = true;
  sv.ticker.start();
  setupRecorder();
}

const originalCanvas = document.getElementById("pixiCanvasTarget");

window.addEventListener("load", () => {
  mySetup();
});

export const tick = async () => {
  render();

  console.log("tick running");

  if (sv.canvasRecorder.status !== RecorderStatus.Recording) return;
  await sv.canvasRecorder.step();

  if (sv.canvasRecorder.status !== RecorderStatus.Stopped) {
    requestAnimationFrame(() => tick());
  }
};

function render() {
  if (sv.pApp.ticker.FPS <= 30.0) {
    // console.log("<<XXXXXXXX BAD FPS XXXXXXX>>>", sv.pApp.ticker.FPS);
  }
  sv.stats.begin();

  if (sv.setupDone) {
    draw();
    // sv.pApp.renderer.render(sv.pApp.stage, {
    // renderTexture: sv.renderTexture,
    // });

    // Scale the preview sprite to fit the secondary canvas
    // sv.previewSprite.width = 800; // Adjust these dimensions as needed
    // sv.previewSprite.height = 800; // to fit #bodyRight
    // Render the scaled-down preview
    // sv.pApp.renderer.render({ renderTexture: null });
    sv.clock += sv.speed;
  }

  sv.stats.end();
}

window.addEventListener("mousedown", () => {
  console.log("mousedown");
});
