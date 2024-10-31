// Document elements
const cssVars = document.querySelector(':root');
const bgImg = document.querySelector('.background');
const header = document.querySelector('header');
const cellsCon = document.querySelector('.cells-container');
const controls = document.querySelectorAll('.controls');
const footer = document.querySelector('footer');

// Global variables
const ratio = 5 / 18; // Ratio of the blackhole cells to the total image dimension cells
let grid; // Contains color for each cell on the sketcher
let gridParams;
let history = {
  prevStep: [{}],
  step: 0
};
let selectedTool = 'draw';
let toolMode = 'default';
let isToolActive = false;
let toolColor;

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

// Cell interaction event listeners
document.querySelector('.cells-container').addEventListener('mousedown', initiateToolAction);
document.querySelector('.cells-container').addEventListener('mouseover', continueToolAction)
document.querySelector('.cells-container').addEventListener('contextmenu', e => e.preventDefault()); // Stop right click menu on grid
// Turn off auto fill when mouse button is lifted
window.addEventListener('mouseup', () => {
  if (isToolActive) {
    isToolActive = false
    recordHistory();
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
  document.querySelector('.preset-colors').addEventListener('click', setDefaultColor);

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

function setDefaultColor(e) {
  let leftPicker = document.querySelector('#left-mouse-color');
  let rightPicker = document.querySelector('#right-mouse-color');
  console.log(cssVars.getAttribute('--rainbow-color'))
  switch (e.target.id) {
    case 'default-color':
      toolMode = 'default'
      leftPicker.children[0].innerText = '#FFFFFF';
      leftPicker.children[0].style.fontSize = '1cqw';
      leftPicker.children[0].style.margin = 0;
      leftPicker.children[1].value = '#FFFFFF';
      leftPicker.children[1].style.display = 'inline-block';
      leftPicker.children[2].style.display = 'none';
      rightPicker.children[0].style.display = 'none';
      rightPicker.children[1].value = '#696969';
      rightPicker.children[1].style.display = 'inline-block';
      rightPicker.children[2].innerText = '#696969';
      rightPicker.children[2].style.fontSize = '1cqw';
      rightPicker.children[2].style.margin = 0;
      break;
    case 'rainbow-color':
      toolMode = 'rainbow';
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
      toolMode = 'greyscale';
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
  catch { return }

  switch (selectedTool) {
    case 'draw':
      isToolActive = true;

      // Set the color fill to the current mouse being used
      if (toolMode == 'default') {
        if (e.button === 0) toolColor = document.querySelector('#left-mouse-color').children[1].value;
        else if (e.button === 2) toolColor = document.querySelector('#right-mouse-color').children[1].value;
      }
      else if (toolMode == 'rainbow') toolColor = '#' + Math.floor(Math.random()*Math.pow(256,3)).toString(16).padStart(6,'0'); // Random hex colour
      else if (toolMode == 'greyscale') toolColor = '#' + Math.floor(Math.random()*256).toString(16).padStart(2,'0').repeat(3); // Random greyscale hex colour

      recordHistory(e.target.attributes[1].value);

      // Fill in the cell
      cell.classList.add('disable-hover');
      cell.style.background = toolColor;
      break;
    default:
  }
}

function continueToolAction(e) {
  if (!isToolActive) return;

  switch (selectedTool) {
    case 'draw':
      let cell;  
      try {
        cell = document.querySelector(`.cell[data-coordinate="${e.target.attributes[1].value}"]`);
      }
      catch { return }

      if (toolMode == 'rainbow') toolColor = '#' + Math.floor(Math.random()*Math.pow(256,3)).toString(16).padStart(6,'0'); // Random hex colour
      else if (toolMode == 'greyscale') toolColor = '#' + Math.floor(Math.random()*256).toString(16).padStart(2,'0').repeat(3); // Random greyscale hex colour

      recordHistory(e.target.attributes[1].value);

      // Fill in the cell
      cell.classList.add('disable-hover');
      cell.style.background = toolColor;
  }
}

function recordHistory(coord) {
  if (isToolActive) {
    // Delete redo history if it exists
    if (history.step !== 0) {
      history.prevStep.splice(0, history.step + 1);
      history.prevStep.unshift({});
      history.step = 0;
    }

    // Add to the current history step
    if (Object.hasOwn(history.prevStep[0], coord)) return;
    history.prevStep[0][coord] = {
      new: toolColor,
      old: document.querySelector(`.cell[data-coordinate="${coord}"]`).style.background
    };
  }
  else history.prevStep.unshift({});
}

function undoAction() {
  if (history.step != history.prevStep.length - 1) {
    history.step++;

    for (const [key, value] of Object.entries(history.prevStep[history.step])) {
      document.querySelector(`.cell[data-coordinate="${key}"]`).style.background = value.old;
      if (value.old === 'none') document.querySelector(`.cell[data-coordinate="${key}"]`).classList.remove('disable-hover');
    }
  }

  if (history.prevStep.length === 0) history.prevStep.push([]);
}

function redoAction() {
  if (history.step > 0) {
    for (const [key, value] of Object.entries(history.prevStep[history.step])) {
      document.querySelector(`.cell[data-coordinate="${key}"]`).classList.add('disable-hover');
      document.querySelector(`.cell[data-coordinate="${key}"]`).style.background = value.new;
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