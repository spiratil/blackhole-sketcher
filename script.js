// Document elements
const cssVars = document.querySelector(':root');
const bgImg = document.querySelector('.background');
const header = document.querySelector('header');
const cellsCon = document.querySelector('.cells-container');
const controls = document.querySelectorAll('.controls');
const footer = document.querySelector('footer');

//************************************************** */
// Color management closure function
//************************************************** */
const color = (() => {
  const color = {
    active: (override) => {
      // If override is provided, ignore the set color mode
      if (color.mode == 'standard' && !override || override == 'standard') return standard();
      if (color.mode == 'greyscale' && !override || override == 'greyscale') return greyscale();
      if (color.mode == 'rainbow' && !override || override == 'rainbow') return rainbow();
    },
    canvas: '',
    grid: '#696969',
    hover: '#696969',
    mode: 'standard'
  };

  // Initial settings for page load
  setColorMode('default-color');

  // Colour generating functions
  const greyscale = () => '#' + Math.floor(Math.random()*256).toString(16).padStart(2,'0').repeat(3);
  const rainbow = () => '#' + Math.floor(Math.random()*Math.pow(256,3)).toString(16).padStart(6,'0');
  const standard = () => document.querySelector(`#${tools.lastMouseBtn()}-mouse-color input`).value;

  // Predefined color picker event listeners
  document.querySelector('.preset-colors').addEventListener('click', setColorMode);
  function setColorMode(e) {
    let identifier;
    if (typeof e == 'object') identifier = e.target.id;
    else identifier = e;

    const leftPicker = document.querySelector('#left-mouse-color');
    const rightPicker = document.querySelector('#right-mouse-color');
    
    switch (identifier) {
      case 'default-color':
        color.mode = 'standard';
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
      case 'greyscale-color':
        color.mode = 'greyscale';
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
      case 'rainbow-color':
        color.mode = 'rainbow';
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
    }
  }

  // Mouse color picker event listeners
  document.querySelector('#left-mouse-color input').addEventListener('change', setMouseColors);
  document.querySelector('#right-mouse-color input').addEventListener('change', setMouseColors);

  // Updates the default color picker colors on changes to the mouse colors
  function setMouseColors() {
    const leftColor = document.querySelector('#left-mouse-color input').value;
    document.querySelector('#left-mouse-color').children[0].innerText = leftColor.toUpperCase();
    const rightColor = document.querySelector('#right-mouse-color input').value;
    document.querySelector('#right-mouse-color').children[2].innerText = rightColor.toUpperCase();
    
    // Update the default picker to the new colors
    document.querySelector('#default-color').style.background = `linear-gradient(to bottom right, ${leftColor} 45%, ${rightColor} 55%)`;
  }

  function resetToDefault() {
    color.canvas = '';
    color.grid = '#696969';
    color.hover = '#696969';
    color.mode = 'standard';

    // CSS settings
    cssVars.style.setProperty('--cell-color', 'black');
    cssVars.style.setProperty('--grid-color', color.grid);
    cssVars.style.setProperty('--cell-hover-color', color.hover);
    
    // Mouse picker colors
    document.querySelector('#left-mouse-color input').value = '#FFFFFF';
    document.querySelector('#right-mouse-color input').value = '#696969';
    setMouseColors();
  }

  // App settings color event listener
  document.querySelector('#canvas-color').addEventListener('change', () => {
    color.canvas = document.querySelector('#canvas-color').value;
    cssVars.style.setProperty('--cell-color', color.canvas);
  });
  document.querySelector('#grid-color').addEventListener('change', () => {
    color.grid = document.querySelector('#grid-color').value;
    settings.updateGridLines();
  });
  document.querySelector('#hover-color').addEventListener('change', e => {
    color.hover = document.querySelector('#hover-color').value
    cssVars.style.setProperty('--cell-hover-color', e.target.value)
  });

  // Retrieval functions
  return {
    active: (override) => color.active(override),
    canvas: () => color.canvas,
    grid: () => color.grid,
    hover: () => color.hover,
    //mode: () => color.mode,
    reset: resetToDefault
  };
})();

//************************************************** */
// Grid management closure function
//************************************************** */
const grid = (function() {
  const grid = {
    isCanvasReady: false,
    cellLength: null, 
    data: null, // The grid data
    radius: null, 
    ratio: 5 / 18, // Ratio of the blackhole circle to the total image dimensions
    rows: null, // Array of rows indicating where cells can be placed inside the grid
    totalSqrs: null // The actual number of cells able to fit inside the circle
  };

  // Event listener for window size changes
  window.addEventListener('resize', resizeDocument);

  function resizeDocument() {
    // Determine the maximum background image size based on the smallest value of the window's width or height
    let maxHeight = window.innerHeight - header.clientHeight - footer.clientHeight - 100;
    let maxWidth = window.innerWidth - 2 * controls[0].clientWidth - 200; // Control panel widths and minimum spacing between
    const [dimension, size] = maxHeight < maxWidth ? ['height', maxHeight / grid.ratio] : ['width', maxWidth / grid.ratio];

    // Set the size of the background image to fit the space available
    if (dimension == 'height') {
      cssVars.style.setProperty('--content-area-height', `${size}px`);
      cssVars.style.setProperty('--content-area-width', undefined);
    }
    else {
      cssVars.style.setProperty('--content-area-height', undefined);
      cssVars.style.setProperty('--content-area-width', `${size}px`);
    }

    calcCellLength(settings.canvasSize());
    setCellSize();
  }

  function calcCellLength(maxSqrs) {
    if (maxSqrs === undefined) throw 'Parameter maxSqrs was not provided.';
    grid.radius = (bgImg.clientWidth * grid.ratio) / 2;
    grid.cellLength = Math.sqrt(Math.PI * Math.pow(grid.radius, 2) / maxSqrs); // L = SQRT( PI * r^2 / N )
  }

  // Calculate the maximum number of cells that can fill each row of the circle
  // starting from the center and moving out towards the edges. Add these results
  // to an array indicating the number of cells to add to each row for when building
  // the grid
  function calcTotalCells() {
    let row = 1, rowArr = [];
    while (true) {
      if (row * grid.cellLength > grid.radius) break; // Exit if the chord length is larger than the radius
      // FLOOR( 2 * SQRT(r^2 - c^2) / L )
      let rowTotal = Math.floor(2 * Math.sqrt(Math.pow(grid.radius,2) - Math.pow(row * grid.cellLength,2)) / grid.cellLength);
      if (rowTotal % 2 !== 0) rowTotal--; // Ensure that the number of squares are even
      rowArr.push(rowTotal);
      row++;
    }

    // As only half the circle of cells is created, make a clone and attach it to the grid rows
    let arrClone = [...rowArr];
    grid.rows = [...arrClone.reverse().concat(rowArr)];

    // Update the total cells displayed in the settings
    grid.totalSqrs = grid.rows.reduce((sum, entry) => sum += entry);
    document.querySelector('.info-total-cells').innerText = grid.totalSqrs + ' cells';
  }

  async function createNewCanvas() {
    // If the grid already exists and a new canvas is being created, clear beforehand
    if (grid.isCanvasReady) await clearCanvas();
    else {
      calcCellLength(settings.canvasSize());
      calcTotalCells();
    }
    await createNewGrid();
  
    // Create rows to fill the div that contain each row of cells
    const row = document.createElement('div'); // Cell row container div 
    row.classList.add(`row`);
    const cell = document.createElement('div'); // Individual cell div
    cell.classList.add("cell");
    cellsCon.textContent = ""; // Clear previous grid
    setCellSize();
  
    // Iterate through the grid and create each cell div on the page
    for (const [y, rowArr] of grid.data.entries()) {
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
    
    if (!grid.isCanvasReady) {
      await settings.sleep(500);
      await clearCanvas();
      grid.isCanvasReady = true;
    }
  }

  // Creates a new 2D grid using arrays that fits within the black hole circle
  // 0s are non-existent cells that would fall outside the circle
  // 1s are generated cells inside the grid circle
  function createNewGrid() {
    grid.data = [];
    for (let y = 0; y < grid.rows.length; y++) {
      let emptyCount = grid.rows.length - grid.rows[y];
      grid.data.push(Array(emptyCount / 2).fill(null)
        .concat(Array(grid.rows[y]).fill(1))
        .concat(Array(emptyCount / 2).fill(null))
      );
    }
  }

  function setCellSize() {
    cssVars.style.setProperty('--cell-size', `${grid.cellLength}px`);
  }

  // Show a rolling wave move across the canvas and clear to the background color
  async function clearCanvas(fill) {
    settings.toggleHover(false);

    let trailLines = [[], [], []];

    // Iterate through from the upper-left diagonal half to the bottom-right diagonal half
    let point;
    for (point = [1,0]; point[0] < grid.data.length && point[1] < grid.data.length; point[0] < grid.data.length - 1 ? point[0]++ : point[1]++)
      trailLines = await displayWipeLines(point, trailLines, fill);

    settings.toggleHover(settings.hover());
  }

  // Display a line that wipes the sketcher clean
  async function displayWipeLines(point, trailLines, fill) {
    // Create the new lead line if it exists
    let leadLine = [];
    for (let x = point[0], y = point[1]; x >= 1, y < grid.data.length; x--, y++) {
      if (grid.data[y][x] === 1) leadLine.push([x,y]);
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
    for (const point of trailLines[2]) {
      let cell = document.querySelector(`.cell[data-coordinate="${point[0]}-${point[1]}"]`);
      cell.classList.remove("trail-line-two");
      if (fill === undefined) {
        cell.style.background = '';
        cell.classList.remove('disable-hover');
      }
      else {
        cell.style.background = color.active(fill);
        cell.classList.add('disable-hover');
      }
    }

    // Copy each line into the next trail for the next iteration
    trailLines[2] = [...trailLines[1]];
    trailLines[1] = [...trailLines[0]];
    trailLines[0] = [...leadLine];
    // Clear the grid at a consistent rate for any grid size
    await settings.sleep(-0.005117707 * grid.totalSqrs + 30.491299898);

    return trailLines;
  }

  // Retrieval functions
  return {
    calcCellLength: maxSqrs => calcCellLength(maxSqrs),
    calcTotalCells: calcTotalCells,
    clearCanvas: fill => clearCanvas(fill),
    createNewCanvas: createNewCanvas,
    //data: () => grid.data, // The grid data
    //cellLength: () => grid.cellLength, 
    isCanvasReady: () => grid.isCanvasReady,
    radius: () => grid.radius, 
    ratio: () => grid.ratio, // Ratio of the blackhole cells to the total image dimension cells
    resizeDocument: resizeDocument,
    //rows: () => grid.rows, // Array of rows indicating where cells can be placed inside the grid
    totalSqrs: () => grid.totalSqrs
  }
})();

//************************************************** */
// History management closure function
//************************************************** */
const history = (function() {
  const history = {
    prevStep: [{}],
    step: 0
  };

  // History button event listeners
  document.querySelector('#undo-button').addEventListener('click', undoAction);
  document.querySelector('#redo-button').addEventListener('click', redoAction);

  function recordHistory(coord, color, hover, lineEntry) {
    if (tools.active()) {
      // Delete redo history if it exists
      if (history.step !== 0) {
        history.prevStep.splice(0, history.step + 1);
        history.prevStep.unshift({});
        history.step = 0;
      }
  
      if (Object.hasOwn(history.prevStep[0], coord)) return;
      if (lineEntry) { // Add the drawn line to the history record
        history.prevStep[0][coord] = {
          newColor: tools.lineData().cells[coord].newColor,
          oldColor: tools.lineData().cells[coord].oldColor,
          newHover: tools.lineData().cells[coord].newHover,
          oldHover: tools.lineData().cells[coord].oldHover
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

  // Global functions
  return {
    recordHistory: (coord, color, hover, lineEntry = false) => recordHistory(coord, color, hover, lineEntry),
    redoAction: () => redoAction(),
    undoAction: () => undoAction()
  }
})();

//************************************************** */
// Settings management closure function
//************************************************** */
const settings = (() => {
  const settings = {
    canvasSize: 1070,
    grid: false,
    gridLine: 'solid',
    hover: true
  };

  // Canvas size slider
  const slider = document.querySelector('#grid-slider');
  slider.oninput = async () => {
    await grid.calcCellLength(document.querySelector('#grid-slider').value);
    await grid.calcTotalCells();
    // Update the total cells displayed in the settings
    document.querySelector('.info-total-cells').innerText = grid.totalSqrs() + ' cells';
  };
  document.querySelector('#grid-slider').addEventListener('click', () => grid.createNewCanvas());

  // Grid line activation
  document.querySelector('#grid-checkbox').addEventListener('change', updateGridLines);
  document.querySelector('#grid-line').addEventListener('change', updateGridLines);
  function updateGridLines() {
    settings.grid = document.querySelector('#grid-checkbox').checked;
    settings.gridLine = document.querySelector('#grid-line').value;
    if (settings.grid) { // Show or hide the grid
      cssVars.style.setProperty('--grid-color', color.grid() + '50'); // Add opacity
      cssVars.style.setProperty('--grid-line-type', settings.gridLine);
    }
    else cssVars.style.setProperty('--grid-line-type', 'none');
  }
  
  // Mouse hover activation
  document.querySelector('#hover-checkbox').addEventListener('change', () => {
    settings.hover = document.querySelector('#hover-checkbox').checked;
    toggleHover(settings.hover);
  });
  function toggleHover(identifier) {
    if (identifier) {
      cssVars.style.setProperty('--cell-animate-in', 'cell-hover-in');
      cssVars.style.setProperty('--cell-animate-out', 'cell-hover-out');
    }
    else {
      cssVars.style.setProperty('--cell-animate-in', undefined);
      cssVars.style.setProperty('--cell-animate-out', undefined);
    }
  }

  // Setting buttons event listeners
  document.querySelector('#clear-button').addEventListener('click', () => grid.clearCanvas());
  document.querySelector('#random-color-button').addEventListener('click', () => grid.clearCanvas('rainbow'));
  document.querySelector('#random-greyscale-button').addEventListener('click', () => grid.clearCanvas('greyscale'));
  document.querySelector('#reset-button').addEventListener('click', async () => await resetToDefault());

  async function resetToDefault() {
    settings.canvasSize = 1070;
    settings.grid = false;
    settings.gridLine = 'solid';
    settings.hover = true;

    await color.reset();
    tools.reset();

    // Default colors
    document.querySelector('#canvas-color').value = color.canvas();
    document.querySelector('#grid-color').value = color.grid();
    document.querySelector('#hover-color').value = color.hover();

    // App settings
    document.querySelector('#grid-checkbox').checked = settings.grid;
    document.querySelector('#grid-line').value = settings.gridLine;
    document.querySelector('#hover-checkbox').checked = settings.hover;
    updateGridLines();
    toggleHover(grid.isCanvasReady ? settings.hover : false);

    // Reset canvas only if one already exists and is a different size from the default
    if (grid.isCanvasReady()) {
      if (slider != settings.canvasSize) {
        await grid.calcCellLength(settings.canvasSize);
        await grid.calcTotalCells();
        grid.createNewCanvas();
      }
      else grid.clearCanvas();
    }

    // Slider settings
    slider.min = 120;
    slider.max = 4130;
    slider.value = settings.canvasSize;
  }

  // Initialise the app for use
  resetToDefault();

  // Retrieval functions
  return {
    //grid: () => settings.grid,
    //gridLine: () => settings.gridLine,
    canvasSize: () => settings.canvasSize,
    hover: () => settings.hover,
    sleep: ms => new Promise(r => setTimeout(r, ms)),
    updateGridLines: () => updateGridLines(),
    toggleHover: (identifier) => toggleHover(identifier)
  };
})();

//************************************************** */
// Tool management closure function
//************************************************** */
const tools = (() => {
   const tools = {
    active: false,
    lastMouseBtn: 'left',
    lineData: null,
    moveData: null,
    selected: 'draw',
  };

  // Initial tools set up
  document.querySelector('#draw-select').nextElementSibling.classList.remove('icon-hover');
  document.querySelector('#draw-select').nextElementSibling.classList.add('selected');

  // Tool button event listeners
  document.querySelector('.tool-selection').addEventListener('click', activateTool, true);

  function activateTool(e) {
    document.querySelector(`#${tools.selected}-select`).nextElementSibling.classList.remove('selected');
    document.querySelector(`#${tools.selected}-select`).nextElementSibling.classList.add('icon-hover');

    let identifier;
    if (typeof e == 'object') identifier = e.target.id
    else identifier = e;
  
    switch (identifier) {
      case 'draw-select':
        tools.selected = 'draw';
        break;
      case 'erase-select':
        tools.selected = 'erase';
        break;
      case 'line-select':
        tools.selected = 'line';
        break;
      case 'move-select':
        tools.selected = 'move';
        break;
    }
  
    document.querySelector(`#${tools.selected}-select`).nextElementSibling.classList.remove('icon-hover');
    document.querySelector(`#${tools.selected}-select`).nextElementSibling.classList.add('selected');
  }

  // Turn off auto fill when mouse button is lifted
  window.addEventListener('mouseup', () => {
    if (tools.active) {
      if (tools.selected != 'line' && tools.selected != 'move') {
        tools.active = false
        history.recordHistory();
      }
    }
  }); 

  // Cell interaction event listeners
  document.querySelector('.cells-container').addEventListener('mousedown', initiateToolAction);
  document.querySelector('.cells-container').addEventListener('mouseover', continueToolAction);
  document.querySelector('.cells-container').addEventListener('contextmenu', e => e.preventDefault()); // Stop right click menu on grid

  function initiateToolAction(e) {
    e.preventDefault();
  
    // Return if the mouse moves beyond the grid to prevent a null error
    let cell;  
    try {
      cell = document.querySelector(`.cell[data-coordinate="${e.target.attributes[1].value}"]`);
    }
    catch { return; }
  
    tools.lastMouseBtn = e.button === 0 ? 'left'
      : e.button === 2 ? 'right'
      : null;
  
    switch (tools.selected) {
      case 'draw':
        tools.active = true;
        history.recordHistory(e.target.attributes[1].value, color.active(), 'disable');
        fillCell(cell, color.active(), 'disable');
        break;
      case 'erase':
        tools.active = true;
        if (!e.target.style.background || e.target.style.background == document.querySelector('#canvas-color').value) return;
        history.recordHistory(e.target.attributes[1].value, color.canvas(), 'enable');
        fillCell(cell, color.canvas(), 'enable');
        break;
      case 'line':
        if (!tools.lastMouseBtn) return;
          
        // Initiate the line if not already active
        if (!tools.active) {
          tools.active = true;
  
          const mouseCoord = e.target.dataset.coordinate;
          tools.lineData = {
            origin: mouseCoord, // Initial coordinate of mouse click
            cells: {[mouseCoord]: setCellRecord(mouseCoord)},
          };
  
          fillCell(cell, color.active(), 'disable');
        }
        else {
          for (const coord of Object.keys(tools.lineData.cells))
            history.recordHistory(coord, '', '', true);
          tools.active = false;
          history.recordHistory(); // End the current history log
        }
        break;
      case 'move':
        // Activate the tool if not already
        if (!tools.active) {
          tools.active = true;  
          
          const cellCoord = e.target.attributes[1].value;
          const origin = document.querySelector(`.cell[data-coordinate="${cellCoord}"`);
          const isCanvasColor = origin.style.background == '';
  
          tools.moveData = {
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
          else fillCell(origin, color.canvas(), 'disable', `solid 2px ${document.querySelector('#grid-color').value}`);
        }
        // Finalise moving the cell to the new location
        else {
          // Return the cells to their original state so that the history can be recorder correctly
          const origin = document.querySelector(`.cell[data-coordinate="${tools.moveData.origin.coord}"]`);
          fillCell(origin, tools.moveData.origin.oldColor, tools.moveData.origin.oldHover);
          const newCell = document.querySelector(`.cell[data-coordinate="${tools.moveData.target.coord}"]`);
          fillCell(newCell, tools.moveData.target.oldColor, tools.moveData.target.oldHover);
  
          // Don't record history if the origin is not moved to another cell
          if (tools.moveData.origin.coord != tools.moveData.target.coord) {
            history.recordHistory(tools.moveData.origin.coord, color.canvas(), 'enable');
            history.recordHistory(tools.moveData.target.coord, tools.moveData.origin.oldColor, tools.moveData.origin.oldHover);
          }
  
          // Set the new cell states
          fillCell(origin, color.canvas(), 'enable');
          fillCell(newCell, tools.moveData.origin.oldColor, tools.moveData.origin.oldHover);
  
          tools.active = false;
          if (tools.moveData.origin.coord != tools.moveData.target.coord) history.recordHistory();
        }
        break;
    }
  }
  
  function continueToolAction(e) {
    if (!tools.active) return;
  
    // Return if the mouse moves outside of the cells range
    let cell;  
    try {
      cell = document.querySelector(`.cell[data-coordinate="${e.target.attributes[1].value}"]`);
    }
    catch { return; }
  
    switch (tools.selected) {
      case 'draw':
        history.recordHistory(e.target.attributes[1].value, color.active(), 'disable');
        fillCell(cell, color.active(), 'disable');
        break;
      case 'erase':
        history.recordHistory(e.target.attributes[1].value, color.canvas(), 'enable');
        fillCell(cell, color.canvas(), 'enable');
        break;
      case 'line':
        // Remove the previous line drawn
        for (const [key, point] of Object.entries(tools.lineData.cells)) {
          if (tools.lineData.origin == key) { // Skip the origin coordinate
            fillCell(document.querySelector(`.cell[data-coordinate="${tools.lineData.origin}"]`), color.active(), 'disable');
            continue;
          }
  
          fillCell(document.querySelector(`.cell[data-coordinate="${key}"]`), point.oldColor, point.oldHover);
          delete tools.lineData.cells[key]; // Remove the old line coordinate
        }
  
        // Determine the distance between the origin and mouse pointer along the x and y axis
        let mouseCoord = e.target.dataset.coordinate.split('-').map(Number);
        let origin = tools.lineData.origin.split('-').map(Number);
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
          tools.lineData.cells[`${newX}-${newY}`] = setCellRecord(`${newX}-${newY}`); // Add the new point
          fillCell(document.querySelector(`.cell[data-coordinate="${newX}-${newY}"]`), color.active(), 'disable');
  
          // The number of x and y steps between the previous point and the new point
          let gapY = Math.abs(newY - prevPoint[1]);
          let gapX = Math.abs(newX - prevPoint[0]); 
  
          // Fill in the missing gaps between points for when dx or dy is larger than the base step
          if (gapX > 1) {
            for (let j = 1; j < gapX; j++) {
              let newX = prevPoint[0] + j * Math.sign(dx);
              tools.lineData.cells[`${newX}-${newY}`] = setCellRecord(`${newX}-${newY}`); // Add the new point
              fillCell(document.querySelector(`.cell[data-coordinate="${newX}-${newY}"]`), color.active(), 'disable');
            }
          }
          else if (gapY > 1) {
            for (let j = 1; j < gapY; j++) {
              let newY = prevPoint[1] + j * Math.sign(dy);
              tools.lineData.cells[`${newX}-${newY}`] = setCellRecord(`${newX}-${newY}`); // Add the new point
              fillCell(document.querySelector(`.cell[data-coordinate="${newX}-${newY}"]`), color.active(), 'disable');
            }
          }
  
          prevPoint = [newX, newY];
        }
        break;
      case 'move':
        // Restore the old cell to its original state once the mouse moves to a new cell
        const oldCell = document.querySelector(`.cell[data-coordinate="${tools.moveData.target.coord}"]`);
        if (tools.moveData.target.coord != tools.moveData.origin.coord)
          fillCell(oldCell, tools.moveData.target.oldColor, tools.moveData.target.oldHover);
        // If the mouse hovers over and then moves away from the origin, restore it to a faded background afterwards
        else {
          if (oldCell.style.background !== '') {
            const rgb = oldCell.style.background.match(/\d+/g).map(Number);
            fillCell(oldCell, `rgba(${rgb.join(',')}, 0.65)`, 'disable', `solid 2px ${document.querySelector('#grid-color').value}`);
          }
          else fillCell(oldCell, color.canvas(), 'disable', `solid 2px ${document.querySelector('#grid-color').value}`);
        }
  
        // Save the new cells current state
        tools.moveData.target.coord = e.target.attributes[1].value;
        const newCell = document.querySelector(`.cell[data-coordinate="${tools.moveData.target.coord}"]`);
        tools.moveData.target.oldColor = newCell.style.background;
        tools.moveData.target.oldHover = newCell.classList.contains('disable-hover') ? 'disable' : 'enable';
  
        // Set the new cell to mimic the origin
        newCell.style.background = tools.moveData.origin.oldColor;
        newCell.style.border = `solid 2px ${document.querySelector('#grid-color').value}`;
        if (tools.moveData.target.oldHover == 'enable') newCell.classList.add('disable-hover');
        
        break;
    }
  }

  function fillCell(cell, color, enableHover, border) {
    enableHover == 'enable' ? cell.classList.remove('disable-hover') : cell.classList.add('disable-hover');
    cell.style.background = color;
    border ? cell.style.border = border : cell.style.border = '';
  }
  
  function setCellRecord(coord, isCanvasColor = false) {
    return {
      newColor: isCanvasColor ? color.canvas() : color.active(),
      oldColor: document.querySelector(`.cell[data-coordinate="${coord}"]`).style.background,
      newHover: isCanvasColor ? 'enable' : 'disable',
      oldHover: document.querySelector(`.cell[data-coordinate="${coord}"]`).classList.contains('disable-hover') ? 'disable' : 'enable'
    };
  }

  // Retrieval functions
  return {
    active: () => tools.active,
    lastMouseBtn: () => tools.lastMouseBtn,
    lineData: () => tools.lineData,
    //moveData: () => tools.moveData,
    //selected: () => tools.selected,
    reset: () => activateTool('draw-select')
  };
})();


// Create the canvas on page load
grid.resizeDocument();
grid.createNewCanvas();






/*


// Button event listeners
document.querySelector('#download-button').addEventListener('click', downloadImage);
document.querySelector('#reset-button').addEventListener('click', initialiseApp);










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

*/

