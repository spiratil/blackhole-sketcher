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

// PI * total squares ^ 2 / radius
function calcPixelLength() {
  const totalSqrs = 1000; // N
  const radius = pixelsCon.clientWidth / 2; // r
  // L = SQRT( PI * r^2 / N )
  const pixelLength = Math.sqrt(Math.PI * Math.pow(radius, 2) / totalSqrs);
  // d = L * number of y rows away from the circle center (1 initially)
  // c = 2 * SQRT( r^2 - d^2 )
  // Initially set to the length of one pixel length from the center of the circle
  const chord = 2 * Math.sqrt( Math.pow(radius, 2) - Math.pow(pixelLength, 2) );
  return {
    N: totalSqrs,
    r: radius,
    L: pixelLength,
    c: chord
  };
}

async function createGrid() {
  pixelsCon.innerHTML = "";
  let params = calcPixelLength()
  console.log(params)

  cssVars.style.setProperty('--pixel-size', `${params.L}px`);
  const row = document.createElement('div');
  const pixel = document.createElement('div');
  pixel.classList.add("pixel");

  for (let y = 1; y * params.L < params.r; y++) {
    let rowClone = row.cloneNode();
    rowClone.classList.add(`row`);
    
    for (let x = 1; x * params.L < params.c; x++) {
      let pixelClone = pixel.cloneNode();
      pixelClone.style.background = `rgb(
        ${Math.ceil(Math.random()*255).toString()},
        ${Math.ceil(Math.random()*255).toString()},
        ${Math.ceil(Math.random()*255).toString()}
      )`;
      rowClone.appendChild(pixelClone);
    }

    pixelsCon.appendChild(rowClone);

    // Calculate the new chord length for the next row
    // chord = 2 * SQRT( radius ^ 2 - chord distance from circle center ^ 2 )
    params.c = 2 * Math.sqrt( Math.pow(params.r,2) - Math.pow(params.L * (y + 1),2) );
  }

  // Iterate over the created grid and add the remaining pixels required
  let pixelsConClone = pixelsCon.cloneNode(true);
  console.log(pixelsConClone)
  for (let y = 0; y < pixelsConClone.childElementCount; y++) {
    const rowClone = pixelsConClone.children[y].cloneNode(true);
    pixelsCon.insertBefore(rowClone, pixelsCon.children[0]);
  }
}

// Run after site has loaded
resizeDocumentElements();
createGrid()