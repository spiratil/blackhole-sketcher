// Document elements
const cssVars = document.querySelector(':root');
const bgImg = document.querySelector('.background');
const header = document.querySelector('header');
const cellsCon = document.querySelector('.cells-container');
const controls = document.querySelectorAll('.controls');
const footer = document.querySelector('footer');

// Global variables and Closure Functions
const ratio = 5 / 18; // Ratio of the blackhole cells to the total image dimension cells
let grid; // Contains color for each cell on the sketcher
let gridParams;
let history = {
  prevStep: [{}],
  step: 0
};
let selectedTool = 'draw';
let isToolActive = false;
let toolColorMode = 'default';
let lastMouseBtn;
let drawLineCoords;
let moveCellCoords;

function getToolColor(isCanvasColor = false) {
  if (isCanvasColor) return '';

  else if (toolColorMode == 'default') // Color of the mouse button clicked
    return document.querySelector(`#${lastMouseBtn}-mouse-color input`).value;

  else if (toolColorMode == 'rainbow') // Random hex colour
    return '#' + Math.floor(Math.random()*Math.pow(256,3)).toString(16).padStart(6,'0'); 

    else if (toolColorMode == 'greyscale') // Random greyscale hex colour
    return '#' + Math.floor(Math.random()*256).toString(16).padStart(2,'0').repeat(3);
}

// Sleep function
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Event listeners
window.addEventListener('resize', resizeDocumentElements);
document.querySelector('#grid-slider').oninput = updateCellSize;
document.querySelector('#grid-slider').addEventListener('click', createNewCanvas);
document.querySelector('#grid-checkbox').addEventListener('change', showHideGrid);
document.querySelector('#grid-line').addEventListener('change', showHideGrid);
document.querySelector('#grid-color').addEventListener('change', showHideGrid);
document.querySelector('#canvas-color').addEventListener('change', e => cssVars.style.setProperty('--cell-color', e.target.value));
document.querySelector('#hover-checkbox').addEventListener('change', showHideHover);
document.querySelector('#hover-color').addEventListener('change', e => cssVars.style.setProperty('--cell-hover-color', e.target.value));
document.querySelector('#left-mouse-color input').addEventListener('change', updateDefaultColors)
document.querySelector('#right-mouse-color input').addEventListener('change', updateDefaultColors)

// Cell interaction event listeners
document.querySelector('.cells-container').addEventListener('mousedown', initiateToolAction);
document.querySelector('.cells-container').addEventListener('mouseover', continueToolAction)
document.querySelector('.cells-container').addEventListener('contextmenu', e => e.preventDefault()); // Stop right click menu on grid
// Turn off auto fill when mouse button is lifted
window.addEventListener('mouseup', () => {
  if (isToolActive) {
    if (selectedTool != 'line' && selectedTool != 'move') {
      isToolActive = false
      recordHistory();
    }
  }
}); 

// Button event listeners
document.querySelector('#undo-button').addEventListener('click', undoAction);
document.querySelector('#redo-button').addEventListener('click', redoAction);
document.querySelector('#clear-button').addEventListener('click', clearCanvas);
document.querySelector('#reset-button').addEventListener('click', initialiseApp);
document.querySelector('.tool-selection').addEventListener('click', activateTool, true);
document.querySelector('#download-button').addEventListener('click', downloadImage);


function initialiseApp() {
  // Settings
  document.querySelector('#canvas-color').value = '#000000';
  document.querySelector('#hover-checkbox').checked = true;
  document.querySelector('#hover-color').value = '#696969';
  document.querySelector('#grid-checkbox').checked = false;
  document.querySelector('#grid-line').value = 'solid';
  document.querySelector('#grid-color').value = '#696969';
  
  // Main colour pickers
  document.querySelector('#left-mouse-color').children[0].innerText = '#FFFFFF';
  document.querySelector('#left-mouse-color').children[1].value = '#FFFFFF';
  document.querySelector('#right-mouse-color').children[1].value = '#696969';
  document.querySelector('#right-mouse-color').children[2].innerText = '#696969';

  // Small colour pickers
  document.querySelector('.preset-colors').addEventListener('click', setDrawColor);

  // Tools
  document.querySelector('#draw-select').nextElementSibling.classList.remove('icon-hover');
  document.querySelector('#draw-select').nextElementSibling.classList.add('selected');
  let slider = document.querySelector('#grid-slider');
  slider.min = 120;
  slider.max = 4130;
  slider.value = 1070;

  resizeDocumentElements();
  updateCellSize();
  createNewCanvas(true);
}

function setDrawColor(e) {
  let leftPicker = document.querySelector('#left-mouse-color');
  let rightPicker = document.querySelector('#right-mouse-color');
  switch (e.target.id) {
    case 'default-color':
      toolColorMode = 'default'
      const isAlreadyDefault = document.querySelector('#default-color').style.background == '' ? true : false;

      leftPicker.children[0].innerText = isAlreadyDefault ? '#FFFFFF' : document.querySelector('#left-mouse-color input').value.toUpperCase();
      leftPicker.children[0].style.fontSize = '1cqw';
      leftPicker.children[0].style.margin = 0;
      leftPicker.children[1].value = isAlreadyDefault ? '#FFFFFF' : document.querySelector('#left-mouse-color input').value;
      leftPicker.children[1].style.display = 'inline-block';
      leftPicker.children[2].style.display = 'none';
      rightPicker.children[0].style.display = 'none';
      rightPicker.children[1].value = isAlreadyDefault ? '#696969' : document.querySelector('#right-mouse-color input').value;
      rightPicker.children[1].style.display = 'inline-block';
      rightPicker.children[2].innerText = isAlreadyDefault ? '#696969' : document.querySelector('#right-mouse-color input').value.toUpperCase();
      rightPicker.children[2].style.fontSize = '1cqw';
      rightPicker.children[2].style.margin = 0;
      break;
    case 'rainbow-color':
      toolColorMode = 'rainbow';
      leftPicker.children[0].innerText = 'RAINBOW';
      leftPicker.children[0].style.fontSize = '0.9484cqw';
      leftPicker.children[0].style.margin = 0;
      leftPicker.children[1].style.display = 'none';
      leftPicker.children[2].style.display = 'inline-block';
      leftPicker.children[2].style.backgroundImage = 'linear-gradient(to bottom right, red 20%, orange, yellow, green, blue, indigo, violet 80%)';
      rightPicker.children[0].style.display = 'inline-block';
      rightPicker.children[0].style.backgroundImage = 'linear-gradient(to bottom right, red 20%, orange, yellow, green, blue, indigo, violet 80%)';
      rightPicker.children[1].style.display = 'none';
      rightPicker.children[2].innerText = 'RAINBOW';
      rightPicker.children[2].style.fontSize = '0.9484cqw';
      rightPicker.children[2].style.margin = 0;
      break;
    case 'greyscale-color':
      toolColorMode = 'greyscale';
      leftPicker.children[0].innerText = 'GREYSCALE';
      leftPicker.children[0].style.fontSize = '0.66cqw';
      leftPicker.children[0].style.margin = '5px';
      leftPicker.children[1].style.display = 'none';
      leftPicker.children[2].style.display = 'block';
      leftPicker.children[2].style.backgroundImage = 'linear-gradient(to bottom right, white 20%, black, dimgrey, lightgrey, grey, black, lightgrey, darkgrey, dimgrey, lightgrey, black 80%)';
      rightPicker.children[0].style.display = 'block';
      rightPicker.children[0].style.backgroundImage = 'linear-gradient(to bottom right, white 20%, black, dimgrey, lightgrey, grey, black, lightgrey, darkgrey, dimgrey, lightgrey, black 80%)';
      rightPicker.children[1].style.display = 'none';
      rightPicker.children[2].innerText = 'GREYSCALE';
      rightPicker.children[2].style.fontSize = '0.66cqw';
      rightPicker.children[2].style.margin = '5px';
      break;
  }
}

function updateCellSize() {
  calcCellLength();
  calcTotalCells();
  document.querySelector('.info-total-cells').innerText = gridParams.realN + ' cells';
}

function showHideGrid() {
  if (document.querySelector('#grid-checkbox').checked) {
    const color = document.querySelector('#grid-color').value + '50'; // Add transparency
    const line = document.querySelector('#grid-line').value;
    cssVars.style.setProperty('--grid-color', color);
    cssVars.style.setProperty('--grid-line-type', line);
  }
  else cssVars.style.setProperty('--grid-line-type', 'none');
}

function showHideHover() {
  if (this.checked) {
    cssVars.style.setProperty('--cell-animate-in', 'cell-hover-in');
    cssVars.style.setProperty('--cell-animate-out', 'cell-hover-out');
  }
  else {
    cssVars.style.setProperty('--cell-animate-in', undefined);
    cssVars.style.setProperty('--cell-animate-out', undefined);
  }
}

function activateTool(e) {
  document.querySelector(`#${selectedTool}-select`).nextElementSibling.classList.remove('selected');
  document.querySelector(`#${selectedTool}-select`).nextElementSibling.classList.add('icon-hover');

  switch (e.target.id) {
    case 'draw-select':
      selectedTool = 'draw';
      break;
    case 'erase-select':
      selectedTool = 'erase';
      break;
    case 'line-select':
      selectedTool = 'line';
      break;
    case 'move-select':
      selectedTool = 'move';
      break;
  }

  document.querySelector(`#${selectedTool}-select`).nextElementSibling.classList.remove('icon-hover');
  document.querySelector(`#${selectedTool}-select`).nextElementSibling.classList.add('selected');
}

function initiateToolAction(e) {
  e.preventDefault();

  // Return if the mouse moves beyond the grid to prevent a null error
  let cell;  
  try {
    cell = document.querySelector(`.cell[data-coordinate="${e.target.attributes[1].value}"]`);
  }
  catch { return; }

  lastMouseBtn = e.button === 0 ? 'left'
    : e.button === 2 ? 'right'
    : null;

  switch (selectedTool) {
    case 'draw':
      isToolActive = true;
      recordHistory(e.target.attributes[1].value, getToolColor(), 'disable');
      fillCell(cell, getToolColor(), 'disable');
      break;
    case 'erase':
      isToolActive = true;
      if (!e.target.style.background || e.target.style.background == document.querySelector('#canvas-color').value) return;
      recordHistory(e.target.attributes[1].value, getToolColor(true), 'enable');
      fillCell(cell, getToolColor(true), 'enable');
      break;
    case 'line':
      if (!lastMouseBtn) return;
        
      // Initiate the line if not already active
      if (!isToolActive) {
        isToolActive = true;

        const mouseCoord = e.target.dataset.coordinate;
        drawLineCoords = {
          origin: mouseCoord, // Initial coordinate of mouse click
          cells: {[mouseCoord]: setCellRecord(mouseCoord)},
        };

        fillCell(cell, getToolColor(), 'disable');
      }
      else {
        for (const coord of Object.keys(drawLineCoords.cells))
          recordHistory(coord, '', '', true);
        isToolActive = false;
        recordHistory(); // End the current history log
      }
      break;
    case 'move':
      // Activate the tool if not already
      if (!isToolActive) {
        isToolActive = true;  
        
        const cellCoord = e.target.attributes[1].value;
        const origin = document.querySelector(`.cell[data-coordinate="${cellCoord}"`);
        const isCanvasColor = origin.style.background == '';

        moveCellCoords = {
          origin: {
            coord: cellCoord,
            ...setCellRecord(cellCoord, isCanvasColor)
          },
          target: {
            coord: cellCoord,
            ...setCellRecord(cellCoord, isCanvasColor)
          } 
        };

        // Add opacity and a border to the cell being moved
        if (e.target.style.background !== '') {
          const rgb = e.target.style.background.match(/\d+/g).map(Number);
          fillCell(origin, `rgba(${rgb.join(',')}, 0.65)`, 'disable', `solid 2px ${document.querySelector('#grid-color').value}`);
        }
        else fillCell(origin, getToolColor(true), 'disable', `solid 2px ${document.querySelector('#grid-color').value}`);
      }
      // Finalise moving the cell to the new location
      else {
        // Return the cells to their original state so that the history can be recorder correctly
        const origin = document.querySelector(`.cell[data-coordinate="${moveCellCoords.origin.coord}"]`);
        fillCell(origin, moveCellCoords.origin.oldColor, moveCellCoords.origin.oldHover);
        const newCell = document.querySelector(`.cell[data-coordinate="${moveCellCoords.target.coord}"]`);
        fillCell(newCell, moveCellCoords.target.oldColor, moveCellCoords.target.oldHover);

        // Don't record history if the origin is not moved to another cell
        if (moveCellCoords.origin.coord != moveCellCoords.target.coord) {
          recordHistory(moveCellCoords.origin.coord, getToolColor(true), 'enable');
          recordHistory(moveCellCoords.target.coord, moveCellCoords.origin.oldColor, moveCellCoords.origin.oldHover);
        }

        // Set the new cell states
        fillCell(origin, getToolColor(true), 'enable');
        fillCell(newCell, moveCellCoords.origin.oldColor, moveCellCoords.origin.oldHover);

        isToolActive = false;
        if (moveCellCoords.origin.coord != moveCellCoords.target.coord) recordHistory();
      }
      break;
    }
}

function continueToolAction(e) {
  if (!isToolActive) return;

  // Return if the mouse moves outside of the cells range
  let cell;  
  try {
    cell = document.querySelector(`.cell[data-coordinate="${e.target.attributes[1].value}"]`);
  }
  catch { return; }

  switch (selectedTool) {
    case 'draw':
      recordHistory(e.target.attributes[1].value, getToolColor(), 'disable');
      fillCell(cell, getToolColor(), 'disable');
      break;
    case 'erase':
      recordHistory(e.target.attributes[1].value, getToolColor(true), 'enable');
      fillCell(cell, getToolColor(true), 'enable');
      break;
    case 'line':
      // Remove the previous line drawn
      for (const [key, point] of Object.entries(drawLineCoords.cells)) {
        if (drawLineCoords.origin == key) { // Skip the origin coordinate
          fillCell(document.querySelector(`.cell[data-coordinate="${drawLineCoords.origin}"]`), getToolColor(), 'disable');
          continue;
        }

        fillCell(document.querySelector(`.cell[data-coordinate="${key}"]`), point.oldColor, point.oldHover);
        delete drawLineCoords.cells[key]; // Remove the old line coordinate
      }

      // Determine the distance between the origin and mouse pointer along the x and y axis
      let mouseCoord = e.target.dataset.coordinate.split('-').map(Number);
      let origin = drawLineCoords.origin.split('-').map(Number);
      let xLength = mouseCoord[0] - origin[0];
      let yLength = mouseCoord[1] - origin[1];

      // The line is dynamically drawn based on the smallest x or y step. dx and dy represent the smallest
      // step alone the line's slope
      let dx, dy;
      if (Math.abs(xLength) > Math.abs(yLength)) {
        dx = Math.sign(xLength) * Math.abs(xLength / (yLength === 0 ? 1 : yLength));
        dy = Math.sign(yLength);
      }
      else if (Math.abs(yLength) > Math.abs(xLength)) {
        dx = Math.sign(xLength);
        dy = Math.sign(yLength) * Math.abs(yLength / (xLength === 0 ? 1 : xLength));
      }
      else {
        dx = Math.sign(xLength);
        dy = Math.sign(yLength);
      }

      let ittCount;
      if (Math.abs(dx) === 0 || Math.abs(dy) === 0) ittCount = 1; // If x or y equal 0, set to 1 so that the iteration does not immediately end
      else ittCount = Math.abs(dx) <= Math.abs(dy) ? Math.abs(xLength) : Math.abs(yLength); // Set the number of iterations to the smallest x or y step
      
      let prevPoint = origin; // The point calculated in the previous iteration
      for (let i = 1; i <= ittCount; i++) {
        let newX = origin[0] + Math.ceil(i * dx);
        let newY = origin[1] + Math.ceil(i * dy);
        drawLineCoords.cells[`${newX}-${newY}`] = setCellRecord(`${newX}-${newY}`); // Add the new point
        fillCell(document.querySelector(`.cell[data-coordinate="${newX}-${newY}"]`), getToolColor(), 'disable');

        // The number of x and y steps between the previous point and the new point
        let gapY = Math.abs(newY - prevPoint[1]);
        let gapX = Math.abs(newX - prevPoint[0]); 

        // Fill in the missing gaps between points for when dx or dy is larger than the base step
        if (gapX > 1) {
          for (let j = 1; j < gapX; j++) {
            let newX = prevPoint[0] + j * Math.sign(dx);
            drawLineCoords.cells[`${newX}-${newY}`] = setCellRecord(`${newX}-${newY}`); // Add the new point
            fillCell(document.querySelector(`.cell[data-coordinate="${newX}-${newY}"]`), getToolColor(), 'disable');
          }
        }
        else if (gapY > 1) {
          for (let j = 1; j < gapY; j++) {
            let newY = prevPoint[1] + j * Math.sign(dy);
            drawLineCoords.cells[`${newX}-${newY}`] = setCellRecord(`${newX}-${newY}`); // Add the new point
            fillCell(document.querySelector(`.cell[data-coordinate="${newX}-${newY}"]`), getToolColor(), 'disable');
          }
        }

        prevPoint = [newX, newY];
      }
      break;
    case 'move':
      // Restore the old cell to its original state once the mouse moves to a new cell
      const oldCell = document.querySelector(`.cell[data-coordinate="${moveCellCoords.target.coord}"]`);
      if (moveCellCoords.target.coord != moveCellCoords.origin.coord)
        fillCell(oldCell, moveCellCoords.target.oldColor, moveCellCoords.target.oldHover);
      // If the mouse hovers over and then moves away from the origin, restore it to a faded background afterwards
      else {
        if (oldCell.style.background !== '') {
          const rgb = oldCell.style.background.match(/\d+/g).map(Number);
          fillCell(oldCell, `rgba(${rgb.join(',')}, 0.65)`, 'disable', `solid 2px ${document.querySelector('#grid-color').value}`);
        }
        else fillCell(oldCell, getToolColor(true), 'disable', `solid 2px ${document.querySelector('#grid-color').value}`);
      }

      // Save the new cells current state
      moveCellCoords.target.coord = e.target.attributes[1].value;
      moveCellCoords.target.oldColor = newCell.style.background;
      moveCellCoords.target.oldHover = newCell.classList.contains('disable-hover') ? 'disable' : 'enable';

      // Set the new cell to mimic the origin
      const newCell = document.querySelector(`.cell[data-coordinate="${moveCellCoords.target.coord}"]`);
      newCell.style.background = moveCellCoords.origin.oldColor;
      newCell.style.border = `solid 2px ${document.querySelector('#grid-color').value}`;
      if (moveCellCoords.target.oldHover == 'enable') newCell.classList.add('disable-hover');
      
      break;
  }
}

// Updates the default color picker colors on changes to the mouse colors
function updateDefaultColors(e) {
  const leftColor = document.querySelector('#left-mouse-color input').value;
  document.querySelector('#left-mouse-color').children[0].innerText = leftColor.toUpperCase();
  const rightColor = document.querySelector('#right-mouse-color input').value;
  document.querySelector('#right-mouse-color').children[2].innerText = rightColor.toUpperCase();
  document.querySelector('#default-color').style.background = `linear-gradient(to bottom right, ${leftColor} 45%, ${rightColor} 55%)`;
}

function fillCell(cell, color, enableHover, border) {
  enableHover == 'enable' ? cell.classList.remove('disable-hover') : cell.classList.add('disable-hover');
  cell.style.background = color;
  border ? cell.style.border = border : cell.style.border = '';
}

function setCellRecord(coord, isCanvasColor = false) {
  return {
    newColor: getToolColor(isCanvasColor),
    oldColor: document.querySelector(`.cell[data-coordinate="${coord}"]`).style.background,
    newHover: isCanvasColor ? 'enable' : 'disable',
    oldHover: document.querySelector(`.cell[data-coordinate="${coord}"]`).classList.contains('disable-hover') ? 'disable' : 'enable'
  };
}

function recordHistory(coord, color, hover, lineEntry = false) {
  if (isToolActive) {
    // Delete redo history if it exists
    if (history.step !== 0) {
      history.prevStep.splice(0, history.step + 1);
      history.prevStep.unshift({});
      history.step = 0;
    }

    if (Object.hasOwn(history.prevStep[0], coord)) return;
    if (lineEntry) { // Add the drawn line to the history record
      history.prevStep[0][coord] = {
        newColor: drawLineCoords.cells[coord].newColor,
        oldColor: drawLineCoords.cells[coord].oldColor,
        newHover: drawLineCoords.cells[coord].newHover,
        oldHover: drawLineCoords.cells[coord].oldHover
      };
    }
    else { // Add drawing, erasing and moving to the history record
      history.prevStep[0][coord] = {
        newColor: color,
        oldColor: document.querySelector(`.cell[data-coordinate="${coord}"]`).style.background,
        newHover: hover,
        oldHover: document.querySelector(`.cell[data-coordinate="${coord}"]`).classList.contains('disable-hover') ? 'disable' : 'enable'
      };
    }
  }
  else history.prevStep.unshift({});
}

function undoAction() {
  if (history.step != history.prevStep.length - 1) {
    history.step++;

    for (const [key, value] of Object.entries(history.prevStep[history.step])) {
      document.querySelector(`.cell[data-coordinate="${key}"]`).style.background = value.oldColor;
      if (value.oldHover == 'enable') document.querySelector(`.cell[data-coordinate="${key}"]`).classList.remove('disable-hover');
      else document.querySelector(`.cell[data-coordinate="${key}"]`).classList.add('disable-hover');
    }
  }

  if (history.prevStep.length === 0) history.prevStep.push([]);
}

function redoAction() {
  if (history.step > 0) {
    for (const [key, value] of Object.entries(history.prevStep[history.step])) {
      if (value.newHover == 'enable') document.querySelector(`.cell[data-coordinate="${key}"]`).classList.remove('disable-hover');
      else document.querySelector(`.cell[data-coordinate="${key}"]`).classList.add('disable-hover');
      document.querySelector(`.cell[data-coordinate="${key}"]`).style.background = value.newColor;
    }

    history.step--;
  }
}

async function downloadImage() {
  let canvas = document.createElement('canvas');
  if (!canvas.getContext) throw 'Browser does not support canvas!';

  let image = new Image();
  image.onerror = e => console.log(e)
  image.src = './imgs/background.jpg?' + (new Date()).getTime();
  image.onload = function() {
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0, 0);

    let link = document.createElement('a');
    link.download = 'Blackhole Sketcher.jpeg';
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
  };
}

// Set the initial size of the background image
function getDocumentSmallestDimension() {
  let maxHeight = window.innerHeight - header.clientHeight - footer.clientHeight - 100;
  let maxWidth = window.innerWidth - 2 * controls[0].clientWidth - 200; // Control panel widths and minimum spacing between
  if (maxHeight < maxWidth) return { dimension: 'height', size: maxHeight / ratio };
  else return { dimension: 'width', size: maxWidth / ratio };
}

function setBackgroundSize(dimension, size) {
  if (dimension == 'height') {
    cssVars.style.setProperty('--content-area-height', `${size}px`);
    cssVars.style.setProperty('--content-area-width', undefined);
  }
  else {
    cssVars.style.setProperty('--content-area-height', undefined);
    cssVars.style.setProperty('--content-area-width', `${size}px`);
  }
}

function setCellSize() {
  cssVars.style.setProperty('--cell-size', `${gridParams.L}px`);
}

function resizeDocumentElements() {
  const sizeObj = getDocumentSmallestDimension();
  setBackgroundSize(sizeObj.dimension, sizeObj.size);
  calcCellLength();
  setCellSize();
}

// Calculates the length of the cell squares for a given circle radius and maximum number of squares
function calcCellLength() {
  const totalSqrs = document.querySelector('#grid-slider').value; // N
  const radius = (bgImg.clientWidth * ratio) / 2; // r

  // L = SQRT( PI * r^2 / N )
  const cellLength = Math.sqrt(Math.PI * Math.pow(radius, 2) / totalSqrs);
  gridParams = {
    N: totalSqrs,
    r: radius,
    L: cellLength,
  };
}

// Calculate the maximum number of cells that can fill each row of the circle
// starting from the center and moving out towards the edges. Add these results
// to an array indicating the number of cells to add to each row for when building
// the grid
function calcTotalCells() {
  let row = 1, rowArr = [];
  gridParams.realN = 0
  while (true) {
    if (row * gridParams.L > gridParams.r) break; // Exit if the chord length is larger than the radius
    // FLOOR( 2 * SQRT(r^2 - c^2) / L )
    let rowTotal = Math.floor(2 * Math.sqrt(Math.pow(gridParams.r,2) - Math.pow(row * gridParams.L,2)) / gridParams.L);
    if (rowTotal % 2 !== 0) rowTotal--; // Ensure that the number of squares are even
    rowArr.push(rowTotal);
    gridParams.realN += rowTotal;
    row++;
  }
  gridParams.realN *= 2;

  let arrClone = [...rowArr];
  gridParams.rows = [...arrClone.reverse().concat(rowArr)];
}

// Creates a new 2D grid using arrays
// 0s are non-existent cells
// 1s are generated cells in the grid
function createNewGrid() {
  grid = [];
  for (let y = 0; y < gridParams.rows.length; y++) {
    let emptyCount = gridParams.rows.length - gridParams.rows[y];
    grid.push(Array(emptyCount / 2).fill(null)
      .concat(Array(gridParams.rows[y]).fill(1))
      .concat(Array(emptyCount / 2).fill(null))
    );
  }
}

// Show a rolling wave move across the canvas and clear to the background color
async function clearCanvas() {
  let trailLines = [[], [], []];
  let point;

  // Iterate through the upper-left diagonal half
  for (point = [1,1]; point[0] < grid.length && point[1] < grid.length; point[0] < grid.length - 1 ? point[0]++ : point[1]++)
    trailLines = await displayWipeLines(point, trailLines);
}

// Display a line that wipes the sketcher clean
async function displayWipeLines(point, trailLines) {
  // Create the new lead line if it exists
  let leadLine = [];
  for (let x = point[0], y = point[1]; x >= 1, y < grid.length; x--, y++) {
    if (grid[y][x] === 1) leadLine.push([x,y]);
  }

  // Update the lines on the page
  for (const point of leadLine) {
    let cell = document.querySelector(`.cell[data-coordinate="${point[0]}-${point[1]}"]`);
    cell.classList.add("leading-line");
    cell.removeAttribute('style');
  }
  for (const point of trailLines[0]) {
    let cell = document.querySelector(`.cell[data-coordinate="${point[0]}-${point[1]}"]`);
    cell.classList.remove("leading-line");
    cell.classList.add("trail-line-one");
  }
  for (const point of trailLines[1]) {
    let cell = document.querySelector(`.cell[data-coordinate="${point[0]}-${point[1]}"]`);
    cell.classList.remove("trail-line-one");
    cell.classList.add("trail-line-two");
  }
  for (const point of trailLines[2])
    document.querySelector(`.cell[data-coordinate="${point[0]}-${point[1]}"]`).classList.remove("trail-line-two");

  // Copy each line into the next trail for the next iteration
  trailLines[2] = [...trailLines[1]];
  trailLines[1] = [...trailLines[0]];
  trailLines[0] = [...leadLine];
  // Clear the grid at a consistent rate for any grid size
  await sleep(-0.005117707 * gridParams.realN + 30.491299898); 

  return trailLines;
}

async function createNewCanvas(isInitialCanvas = false) {
  // If the grid already exists and a new canvas is being created, clear beforehand
  if (isInitialCanvas !== true) await clearCanvas();

  await createNewGrid();

  const row = document.createElement('div'); // Cell row container div 
  row.classList.add(`row`);
  const cell = document.createElement('div'); // Individual cell div
  cell.classList.add("cell");
  cellsCon.textContent = ""; // Clear previous grid
  setCellSize();

  // Iterate through the grid and create each cell div on the page
  for (const [y, rowArr] of grid.entries()) {
    let rowClone = row.cloneNode();
    for (const [x, bool] of rowArr.entries()) {
      if (bool) {
        let cellClone = cell.cloneNode();
        cellClone.setAttribute('data-coordinate', `${x}-${y}`);
        cellClone.style = 'background: none;'
        rowClone.appendChild(cellClone);
      }
    }
    cellsCon.appendChild(rowClone);
  }
  
  if (isInitialCanvas === true) {
    await sleep(500);
    clearCanvas(true);
  }

}

// Run after site has loaded
initialiseApp();

//activateTool();