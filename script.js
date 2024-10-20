// Document elements
const cssVars = document.querySelector(':root');
const bgImg = document.querySelector('.background');
const header = document.querySelector('header');
const pixelsCon = document.querySelector('.pixels-container');
const controls = document.querySelectorAll('.controls');
const footer = document.querySelector('footer');

// Global variables
const ratio = 5 / 18; // Ratio of the blackhole pixels to the total image dimension pixels

// Event listeners
window.addEventListener('resize', () => {
  resizeDocumentElements();
  createGrid();
});

// Set the initial size of the background image
function getDocumentSmallestDimension() {
  let maxHeight = window.innerHeight - header.clientHeight - footer.clientHeight - 100;
  let maxWidth = window.innerWidth - 2 * controls[0].clientWidth - 200; // Control panel widths and minimum spacing between
  if (maxHeight < maxWidth) return { dimension: 'height', size: maxHeight / ratio };
  else return { dimension: 'width', size: maxHeight / ratio };
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

function setPixelSizes() {
  pixelsCon.style.width = `${bgImg.clientWidth * ratio}px`;
  pixelsCon.style.height = `${bgImg.clientWidth * ratio}px`;
}

function resizeDocumentElements() {
  const sizeObj = getDocumentSmallestDimension();
  setBackgroundSize(sizeObj.dimension, sizeObj.size);
  setPixelSizes();
}

// Calculates the length of the pixel squares for a given circle radius and maximum number of squares
function calcPixelLength() {
  const totalSqrs = 1000; // N
  const radius = pixelsCon.clientWidth / 2; // r
  // L = SQRT( PI * r^2 / N )
  const pixelLength = Math.sqrt(Math.PI * Math.pow(radius, 2) / totalSqrs);
  // d = L * number of y rows away from the circle center (1 initially)
  // c = 2 * SQRT( r^2 - d^2 )
  // Initially set to the length of one pixel length from the center of the circle
  const chord = 2 * Math.sqrt( Math.pow(radius, 2) - Math.pow(pixelLength, 2) );

  // Calculate the maximum number of pixels that can fill each row of the circle
  // starting from the center and moving out towards the edges. Add these results
  // to an array indicating the number of pixels to add to each row for when building
  // the grid
  let row = 1, rowArr = [];
  while (true) {
    if (row * pixelLength > radius) break; // Exit if the chord length is larger than the radius
    // FLOOR( 2 * SQRT(r^2 - c^2) / L )
    let rowTotal = Math.floor(2 * Math.sqrt(Math.pow(radius,2) - Math.pow(row * pixelLength,2)) / pixelLength);
    if (rowTotal % 2 !== 0) rowTotal--; // Ensure that the number of squares are even
    rowArr.push(rowTotal);
    row++;
  }

  let arrClone = [...rowArr];
  return {
    N: totalSqrs,
    r: radius,
    L: pixelLength,
    c: chord,
    // Array of pixel count by ordered row from top to bottom of grid
    rows: [...arrClone.reverse().concat(rowArr)]
  };
}

async function createGrid() {
  let params = calcPixelLength()

  const row = document.createElement('div'); // Pixel row container div 
  row.classList.add(`row`);
  const pixel = document.createElement('div'); // Individual pixel div
  pixel.classList.add("pixel");
  pixelsCon.textContent = ""; // Clear previous grid
  cssVars.style.setProperty('--pixel-size', `${params.L}px`);

  // Iterate through the array of total squares per row and create each pixel div
  for (let y = 0; y < params.rows.length; y++) {
    let rowClone = row.cloneNode();
    for (let x = 0; x < params.rows[y]; x++) {
      let pixelClone = pixel.cloneNode();
      pixelClone.style.background = `rgb(
        ${Math.ceil(Math.random()*255).toString()},
        ${Math.ceil(Math.random()*255).toString()},
        ${Math.ceil(Math.random()*255).toString()}
      )`;
      rowClone.appendChild(pixelClone);
    }
    pixelsCon.appendChild(rowClone);
  }
}

// Run after site has loaded
resizeDocumentElements();
createGrid()