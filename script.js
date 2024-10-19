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
window.addEventListener('resize', resizeDocumentElements);

// Set the initial size of the background image
function getDocumentSmallestDimension() {
  let maxHeight = window.innerHeight - header.clientHeight - footer.clientHeight - 100;
  let maxWidth = window.innerWidth - 2 * controls[0].clientWidth - 200; // Control panel widths and minimum spacing between
  console.log(`Width: ${maxWidth} Height: ${maxHeight}`);
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

// Run after site has loaded
resizeDocumentElements();