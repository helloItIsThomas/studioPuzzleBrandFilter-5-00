onmessage = function (e) {
  // console.log("¶ acting on initial worker.postMessage from main thread ¶");

  const { imageData, rowCount, colCount, cellW, cellH } = e.data;

  const cells = [];

  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < colCount; x++) {
      const xPos = x * cellW;
      const yPos = y * cellH;

      // Populate cell object
      cells.push({
        gridIndex: y * colCount + x,
        x: xPos,
        y: yPos,
        width: cellW,
        height: cellH,
      });
    }
  }

  const result = {
    cells,
    imageData,
  };

  // console.log("ª finishing stuff on worker thread ª");
  postMessage(result);
};
