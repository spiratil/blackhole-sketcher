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
let clearDelay // Timeout variable for setting a delay when clearing the canvas

// Sleep function
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Event listeners
window.addEventListener('resize', resizeDocumentElements);
//document.querySelector('#rainbow-button').addEventListener('click', () => createNewCanvas());

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

function setCellSize(length) {
  cssVars.style.setProperty('--cell-size', `${length}px`);
}

function resizeDocumentElements() {
  const sizeObj = getDocumentSmallestDimension();
  setBackgroundSize(sizeObj.dimension, sizeObj.size);
  let params = calcCellLength();
  setCellSize(params.L);
}

// Calculates the length of the cell squares for a given circle radius and maximum number of squares
function calcCellLength() {
  const totalSqrs = 2000; // N
  const radius = (bgImg.clientWidth * ratio) / 2; // r

  // L = SQRT( PI * r^2 / N )
  const cellLength = Math.sqrt(Math.PI * Math.pow(radius, 2) / totalSqrs);
  return {
    N: totalSqrs,
    r: radius,
    L: cellLength,
  }
}

// Calculate the maximum number of cells that can fill each row of the circle
// starting from the center and moving out towards the edges. Add these results
// to an array indicating the number of cells to add to each row for when building
// the grid
function calcTotalCells(params) {
  let row = 1, rowArr = [];
  while (true) {
    if (row * params.L > params.r) break; // Exit if the chord length is larger than the radius
    // FLOOR( 2 * SQRT(r^2 - c^2) / L )
    let rowTotal = Math.floor(2 * Math.sqrt(Math.pow(params.r,2) - Math.pow(row * params.L,2)) / params.L);
    if (rowTotal % 2 !== 0) rowTotal--; // Ensure that the number of squares are even
    rowArr.push(rowTotal);
    row++;
  }

  let arrClone = [...rowArr];
  params.rows = [...arrClone.reverse().concat(rowArr)];
  return params;
}

// Creates a new 2D grid using arrays
// 0s are non-existent cells
// 1s are generated cells in the grid
function createNewGrid(rows) {
  grid = [];
  for (let y = 0; y < rows.length; y++) {
    let emptyCount = rows.length - rows[y];
    grid.push(Array(emptyCount / 2).fill(null)
      .concat(Array(rows[y]).fill(1))
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

  // Iterate through the lower-right diagonal half
  //for (point = [grid.length - 1,1]; point[0] > 0 && point[1] < grid.length; point[1]++)
    //trailLines = await displayWipeLines(point, trailLines);
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
  await sleep(20);

  return trailLines;
}

async function createNewCanvas(isInitialCanvas = false) {
  // If the grid already exists and a new canvas is being created, clear beforehand
  if (!isInitialCanvas) await clearCanvas();

  let params = calcCellLength();
  params = calcTotalCells(params);
  await createNewGrid(params.rows);

  const row = document.createElement('div'); // Cell row container div 
  row.classList.add(`row`);
  const cell = document.createElement('div'); // Individual cell div
  cell.classList.add("cell");
  cellsCon.textContent = ""; // Clear previous grid
  setCellSize(params.L);

  // Iterate through the grid and create each cell div on the page
  for (const [y, rowArr] of grid.entries()) {
    let rowClone = row.cloneNode();
    for (const [x, bool] of rowArr.entries()) {
      if (bool) {
        let cellClone = cell.cloneNode();
        cellClone.setAttribute('data-coordinate', `${x}-${y}`);
        rowClone.appendChild(cellClone);
      }
    }
    cellsCon.appendChild(rowClone);
  }
  
  if (isInitialCanvas) {
    await sleep(500);
    clearCanvas(true);
  }
}

// Run after site has loaded
resizeDocumentElements();
createNewCanvas(true)