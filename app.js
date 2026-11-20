// ===== Constants =====
const ROWS = 12;
const COLS = 12;
const HEBREW_LABELS = 'אבגדהוזחטיכל'.split('');

// ===== State =====
let currentRow = 0;
let currentCol = 0;
let mode = 'row'; // 'row' or 'col'
const grid = []; // 2D array of cell DOM elements

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  createGrid();
  setupPasteArea();
  setupOCR();
  setupSaveLoad();
  focusCell(0, 0);
});

// ===== Grid Creation =====
function createGrid() {
  const table = document.getElementById('crossword-grid');

  // Column header row
  const headerRow = document.createElement('tr');
  const corner = document.createElement('th');
  corner.className = 'corner';
  headerRow.appendChild(corner);

  for (let c = 0; c < COLS; c++) {
    const th = document.createElement('th');
    th.className = 'col-header';
    th.textContent = c + 1;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Data rows
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    const tr = document.createElement('tr');

    // Row header (Hebrew letter)
    const rowHeader = document.createElement('th');
    rowHeader.className = 'row-header';
    rowHeader.textContent = HEBREW_LABELS[r];
    tr.appendChild(rowHeader);

    // Cells
    for (let c = 0; c < COLS; c++) {
      const td = document.createElement('td');
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.tabIndex = 0;
      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener('mousedown', (e) => {
        e.preventDefault();
        currentRow = r;
        currentCol = c;
        cell.focus();
        updateHighlight();
      });

      cell.addEventListener('keydown', handleKeyDown);

      td.appendChild(cell);
      tr.appendChild(td);
      grid[r][c] = cell;
    }

    table.appendChild(tr);
  }
}

// ===== Keyboard Handling =====
function handleKeyDown(e) {
  const cell = grid[currentRow][currentCol];

  // Hebrew letter input (א-ת including final forms)
  if (isHebrewLetter(e.key)) {
    e.preventDefault();
    cell.textContent = e.key;
    cell.classList.remove('black');
    advanceCursor();
    return;
  }

  // Dot → black cell
  if (e.key === '.') {
    e.preventDefault();
    cell.textContent = '';
    cell.classList.add('black');
    advanceCursor();
    return;
  }

  // Space → toggle mode
  if (e.key === ' ') {
    e.preventDefault();
    toggleMode();
    return;
  }

  // Backspace → clear or retreat
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (cell.textContent || cell.classList.contains('black')) {
      cell.textContent = '';
      cell.classList.remove('black');
    } else {
      retreatCursor();
      const prevCell = grid[currentRow][currentCol];
      prevCell.textContent = '';
      prevCell.classList.remove('black');
    }
    return;
  }

  // Delete → clear current cell
  if (e.key === 'Delete') {
    e.preventDefault();
    cell.textContent = '';
    cell.classList.remove('black');
    return;
  }

  // Arrow keys navigation
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (currentCol > 0) focusCell(currentRow, currentCol - 1);
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (currentCol < COLS - 1) focusCell(currentRow, currentCol + 1);
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (currentRow > 0) focusCell(currentRow - 1, currentCol);
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (currentRow < ROWS - 1) focusCell(currentRow + 1, currentCol);
    return;
  }

  // Tab → advance (Shift+Tab → retreat)
  if (e.key === 'Tab') {
    e.preventDefault();
    if (e.shiftKey) {
      retreatCursor();
    } else {
      advanceCursor();
    }
    return;
  }
}

// ===== Helpers =====
function isHebrewLetter(key) {
  if (key.length !== 1) return false;
  const code = key.charCodeAt(0);
  return code >= 0x05D0 && code <= 0x05EA;
}

function toggleMode() {
  mode = mode === 'row' ? 'col' : 'row';
  updateModeIndicator();
  updateHighlight();
}

// ===== Cursor Movement =====
function advanceCursor() {
  if (mode === 'row') {
    if (currentCol < COLS - 1) focusCell(currentRow, currentCol + 1);
  } else {
    if (currentRow < ROWS - 1) focusCell(currentRow + 1, currentCol);
  }
}

function retreatCursor() {
  if (mode === 'row') {
    if (currentCol > 0) focusCell(currentRow, currentCol - 1);
  } else {
    if (currentRow > 0) focusCell(currentRow - 1, currentCol);
  }
}

function focusCell(row, col) {
  currentRow = row;
  currentCol = col;
  grid[row][col].focus();
  updateHighlight();
}

// ===== Highlight =====
function updateHighlight() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].classList.remove('highlight');
    }
  }

  if (mode === 'row') {
    for (let c = 0; c < COLS; c++) {
      grid[currentRow][c].classList.add('highlight');
    }
  } else {
    for (let r = 0; r < ROWS; r++) {
      grid[r][currentCol].classList.add('highlight');
    }
  }
}

function updateModeIndicator() {
  const indicator = document.getElementById('mode-indicator');
  if (mode === 'row') {
    indicator.textContent = 'מצב: שורה ↔';
    indicator.classList.remove('col-mode');
  } else {
    indicator.textContent = 'מצב: עמודה ↕';
    indicator.classList.add('col-mode');
  }
}

// ===== Definitions Paste Area =====
function setupPasteArea() {
  const pasteArea = document.getElementById('paste-area');
  const extractBtn = document.getElementById('extract-btn');

  pasteArea.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          pasteArea.innerHTML = '';
          const img = document.createElement('img');
          img.src = event.target.result;
          pasteArea.appendChild(img);
          // Enable the extract button
          extractBtn.disabled = false;
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  });

  // Prevent paste area from capturing crossword keyboard shortcuts
  pasteArea.addEventListener('keydown', (e) => {
    e.stopPropagation();
  });
}

// ===== OCR with Tesseract.js =====
function setupOCR() {
  const extractBtn = document.getElementById('extract-btn');
  const extractedText = document.getElementById('extracted-text');

  extractBtn.addEventListener('click', async () => {
    const pasteArea = document.getElementById('paste-area');
    const img = pasteArea.querySelector('img');

    if (!img) return;

    // Show loading state
    extractBtn.disabled = true;
    extractBtn.classList.add('loading');

    try {
      const result = await Tesseract.recognize(img.src, 'heb', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            const pct = Math.round(info.progress * 100);
            extractBtn.dataset.progress = pct;
          }
        }
      });

      // Show extracted text
      extractedText.textContent = result.data.text;
      extractedText.classList.add('visible');
    } catch (err) {
      console.error('OCR error:', err);
      extractedText.textContent = 'שגיאה בחילוץ טקסט. נסו שנית.';
      extractedText.classList.add('visible');
    } finally {
      // Reset button
      extractBtn.disabled = false;
      extractBtn.classList.remove('loading');
    }
  });

  // Prevent extracted text area from capturing crossword keyboard shortcuts
  extractedText.addEventListener('keydown', (e) => {
    e.stopPropagation();
  });
}

// ===== Save / Load =====
function setupSaveLoad() {
  const saveBtn = document.getElementById('save-btn');
  const loadBtn = document.getElementById('load-btn');
  const loadInput = document.getElementById('load-input');

  saveBtn.addEventListener('click', saveToFile);
  loadBtn.addEventListener('click', () => loadInput.click());
  loadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadFromFile(file);
    loadInput.value = ''; // reset so the same file can be loaded again
  });
}

function saveToFile() {
  const extractedText = document.getElementById('extracted-text');

  // Collect grid state
  const gridData = [];
  for (let r = 0; r < ROWS; r++) {
    gridData[r] = [];
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      if (cell.classList.contains('black')) {
        gridData[r][c] = '.';
      } else {
        gridData[r][c] = cell.textContent || '';
      }
    }
  }

  const data = {
    definitions: extractedText.textContent || '',
    grid: gridData
  };

  // Trigger download
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'crossword.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      restoreState(data);
    } catch (err) {
      console.error('Failed to load file:', err);
      alert('שגיאה בטעינת הקובץ');
    }
  };
  reader.readAsText(file);
}

function restoreState(data) {
  // Restore grid
  if (data.grid) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        const value = data.grid[r]?.[c] || '';
        cell.classList.remove('black');
        if (value === '.') {
          cell.textContent = '';
          cell.classList.add('black');
        } else {
          cell.textContent = value;
        }
      }
    }
  }

  // Restore definitions text
  if (data.definitions) {
    const extractedText = document.getElementById('extracted-text');
    extractedText.textContent = data.definitions;
    extractedText.classList.add('visible');
  }

  // Reset cursor to top-right
  focusCell(0, 0);
}
