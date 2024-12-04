import { sv } from "../utils/variables.js";
import { Still } from "./Stills.js";
import { shaderRendering } from "../rendering/shaderRendering.js";
import {
  createGraphicsForSingleImage,
  createGraphicsForMultipleImages,
} from "../rendering/createShapeGraphics.js";
import { hideLoadIcon } from "../utils/icons.js";

export async function updateCellData(_processedImgs) {
  sv.stills = [];
  const promises = [];

  for (const [i, image] of _processedImgs.entries()) {
    const still = new Still();
    still.processedImage = image;

    promises.push(
      still.populateGridWithWorker(image).then(() => {
        still.currentImageIndex = i;
        sv.stills.push(still);
      })
    );
  }

  await Promise.all(promises).then(() => {
    console.log("checking oneActiveImage state: ", sv.oneActiveImage);
    if (sv.oneActiveImage === true)
      sv.iconAtlas = createGraphicsForSingleImage();
    else if (sv.oneActiveImage === false) createGraphicsForMultipleImages();
    else throw new Error("No valid images loaded");

    shaderRendering();

    setTimeout(() => {
      sv.workerDone = true;
      hideLoadIcon();
    }, 1000);
  });
}
