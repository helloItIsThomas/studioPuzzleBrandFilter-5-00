import * as dat from "dat.gui";
import { recalculateGrid } from "./eventHandlers";
import { setupRecorder, startRecording, stopRecording } from "./recording";
import { updateCellData } from "../imgProcessing/imageProcessing";
import { createInput } from "./input";
import { downloadBlob } from "canvas-record";
import { downloadCanvas } from "./utils";
import { createGraphicsForSingleImage } from "../rendering/createShapeGraphics";
import { shaderRendering } from "../rendering/shaderRendering";
import { updateSvgIcons } from "./loadImages";

export const gui = new dat.GUI({
  autoPlace: false,
});

var customContainer = document
  .querySelector(".moveGUI")
  .appendChild(gui.domElement);

export const sv = {
  pixiScreenshot: undefined,

  oneActiveImage: null,
  arcCont: null,
  animatedArc: null,
  workerDone: false,
  pApp: null,
  resizeAppToMe: null,
  resizeAppToMeWidth: null,
  resizeAppToMeHeight: null,
  pContainer: null,
  sceneContainer: null,
  sceneContainerFrame: null,
  aPositionBuffer: null,
  ticker: null,
  frameRate: null,
  spinnyBG: null,
  triangleMesh: null,
  instancePositionBuffer: null,
  totalTriangles: null,
  triangles: null,
  iconAtlas: null,
  spritesheet: null,
  sSheetTextures: [],
  sheets: [],
  canvasRecorder: null,
  p: null,
  setupDone: false,
  clock: null,
  duration: 2000,
  startLoop: 1.01,
  endLoop: 1.99,
  stateStartTime: null,
  clearImage: null,
  stills: [],
  animUnderImgs: [],
  singleImgIcons: [],
  debugImgToggle: 0,
  slidingPieceImgs: [],
  manualScale: 1.0,
  transitionSpeed: 3000.0,
  transitionDelay: 0.5,
  speed: 0.02,
  color: false,
  params: {
    // clipOutliers: false,
    // coU: 0,
    clipDarkOutliers: 0,
    clipLightOutliers: 0,
    scaleDynamically: true,
    sdU: 1,
    startInvisible: false,
    siU: 0,
  },
  totalSourceUploadNum: null,
  advanced: null,
  customShapeGraphics: null,
  circleGraphicLeft: null,
  circleGraphicRight: null,
  iconGraphic0: null,
  iconGraphic1: null,
  iconGraphic2: null,
  iconGraphic3: null,
  iconGraphic4: null,
  iconGraphic5: null,
  iconGraphic6: null,
  iconGraphic7: null,
  iconGraphic8: null,
  iconGraphic9: null,
  iconGraphic10: null,
  iconGraphic11: null,
  iconGraphic12: null,
  iconGraphic13: null,
  iconGraphic14: null,
  iconGraphic15: null,
  iconGraphic16: null,
  iconGraphic17: null,
  iconGraphic18: null,
  iconGraphic19: null,
  singleImgIconPaths: null,

  cTex: null,
  sTex: null,
  loadingSprite: null,
  loadingScreen: null,
  circles: [],
  shapes: [],
  shapes2: [],
  noiseTex: null,
  noisyValues: null,

  rowCount: null,
  colCount: null,
  totalCells: null,
  xExcess: null,
  yExcess: null,
  gridW: null,
  gridH: null,
  cellW: null,
  cellH: null,
  gridGutterMult: 1.0,
  gridResolutionBuffer: "2",
  gridResolution: "2",
  noiseOffset: 0.0,

  tlThresh1: 0.15,
  tlThresh1BUFFER: 0.01,
  tlThresh2: 0.25,
  tlThresh2BUFFER: 0.01,
  tlThresh3: 0.5,
  tlThresh3BUFFER: 0.01,

  testSVG: null,
  testImages: null,

  isRecording: false,
  takeScreenshot: false,
  tempUploadFiles: [],

  // HTML elements
  inputElement: null,
  imgDiv: null,
};

const recording = gui.addFolder("Render");
recording.open();
const screenshotController = recording
  .add(sv, "takeScreenshot")
  .name("Screenshot");
const recordingController = recording.add(sv, "isRecording").name("Recording");

recordingController.onChange((value) => {
  console.log("recording toggled: ", value);
  if (!sv.canvasRecorder) setupRecorder();
  if (sv.isRecording) startRecording();
  else if (!sv.isRecording) stopRecording();
});

function sameResDownload(value) {
  if (value) {
    const webglCanvas = sv.pApp.canvas;
    downloadCanvas(webglCanvas);
    screenshotController.setValue(false);
  }
}

screenshotController.onChange((value) => {
  sameResDownload(value);
});

const general = gui.addFolder("General");
general.open();
const gridResController = general
  .add(sv, "gridResolutionBuffer")
  .name("Grid Resolution");
general.add(sv, "speed", 0.0, 0.1).name("Speed");

const colorController = general.add(sv, "color", false).name("Color");

const manualScaleController = general
  .add(sv, "manualScale", 0.0, 0.99, 0.01)
  .name("Manual Scale");
const noiseController = general
  .add(sv, "noiseOffset", 0, 1, 0.01)
  .name("Noise Offset");

const threshController1 = general
  .add(sv, "tlThresh1", 0.0, 1.0)
  .name("tlThresh1");
const threshController2 = general
  .add(sv, "tlThresh2", 0.0, 1.0)
  .name("tlThresh2");
const threshController3 = general
  .add(sv, "tlThresh3", 0.0, 1.0)
  .name("tlThresh3");

colorController.onChange((value) => {
  recalculateGrid();
  updateSvgIcons();
});
noiseController.onChange((value) => {
  sv.triangleMesh.shader.resources.waveUniforms.uniforms.noiseLevel = value;
});
manualScaleController.onChange((value) => {
  sv.triangleMesh.shader.resources.waveUniforms.uniforms.manualScale = Math.min(
    value,
    0.9999999
  );
});
threshController1.onChange((value) => {});
threshController2.onChange((value) => {});
threshController3.onChange((value) => {});

const inputField = gridResController.domElement.querySelector("input");
inputField.addEventListener("keydown", (event) => {
  const value = parseInt(inputField.value, 10);
  if (value !== sv.gridResolution) {
    if (event.key === "Enter") {
      if (sv.workerDone) {
        if (value < 400) sv.gridResolution = value;
        else sv.gridResolution = 400;
        if (value == 0) sv.gridResolution = 1;
        recalculateGrid();
        updateSvgIcons();
      }
    }
  }
});

// Add the toggle parameter to control visibility
// const showSingleImgModeController = gui
// .add(sv.params, "showSingleImgMode")
// .name("Single Image Mode");

// const outerDiv = showSingleImgModeController.domElement.parentElement;
// outerDiv.classList.add("title-class");

// References for dynamically added controllers
let scaleDynamicController,
  startInvisibleController,
  clipDarkController,
  clipLightController;

// Function to add advanced parameters
sv.advanced = gui.addFolder("Advanced");
sv.advanced.open();
sv.advanced.hide();
function addAdvancedParameters() {
  // clipController = sv.advanced
  // .add(sv.params, "clipOutliers")
  // .name("Clip Outliers");
  clipDarkController = sv.advanced
    .add(sv.params, "clipDarkOutliers", 0.0, 1.0, 0.001)
    .name("Clip Dark Outliers");
  clipLightController = sv.advanced
    .add(sv.params, "clipLightOutliers", 0.0, 1.0, 0.001)
    .name("Clip Light Outliers");

  scaleDynamicController = sv.advanced
    .add(sv.params, "scaleDynamically")
    .name("Scale Dynamically");

  startInvisibleController = sv.advanced
    .add(sv.params, "startInvisible")
    .name("Start Invisible");

  clipDarkController.onChange((value) => {
    console.log(value);
    // if (value) sv.params.coU = 1;
    // else sv.params.coU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.clipDarkOutliers =
      value;
  });
  clipLightController.onChange((value) => {
    console.log(value);
    // if (value) sv.params.coU = 1;
    // else sv.params.coU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.clipLightOutliers =
      value;
  });

  startInvisibleController.onChange((value) => {
    console.log(value);
    if (value) sv.params.siU = 1;
    else sv.params.siU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.sI = sv.params.siU;
  });

  scaleDynamicController.onChange((value) => {
    if (value) sv.params.sdU = 1;
    else sv.params.sdU = 0;
    sv.triangleMesh.shader.resources.waveUniforms.uniforms.sD = sv.params.sdU;
  });
}
addAdvancedParameters();

// Function to remove advanced parameters
// function removeAdvancedParameters() {
// console.log(" • running removeAdvancedParameters • ");
// if (contrastController) gui.remove(contrastController);
// if (clipController) gui.remove(clipController);
// if (scaleDynamicController) gui.remove(scaleDynamicController);
// if (startInvisibleController) gui.remove(startInvisibleController);
// contrastController = null;
// clipController = null;
// scaleDynamicController = null;
// startInvisibleController = null;
// }

// Function to dynamically update the visibility of parameters
// function updateVisibility() {
// console.log(" • running updateVisibility • ");
// createInput();
//removeAdvancedParameters(); // Always remove first to avoid duplicates
// addAdvancedParameters(); // Add when the toggle is true
// if (sv.params.showSingleImgMode) {
// }
// }

// Update visibility when the boolean changes
// Initial state update
// updateVisibility();
