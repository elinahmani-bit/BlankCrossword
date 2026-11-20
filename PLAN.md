# Blank Crossword Scratchpad

A Hebrew-language web app for solving blank crossword puzzles. Definitions are published in a newsletter as screenshots — this tool provides a digital scratchpad to work through the puzzle alongside the clues.

## Architecture

A purely static web app — three files, no build step, no server:

| File | Purpose |
|------|---------|
| `index.html` | Page structure and Tesseract.js CDN import |
| `style.css` | Layout, grid styling, and visual states |
| `app.js` | Grid logic, keyboard handling, and OCR integration |

## Layout

The window is split into two side-by-side panels:

```
┌──────────────────────────┬─────────────────────────┐
│   Definitions (Right)    │   Crossword Grid (Left)  │
│                          │                          │
│   📋 Pasted screenshot   │      1  2  3 ... 12     │
│                          │   א [ ][ ][ ]   [ ]     │
│   [🔍 Extract Text]     │   ב [ ][ ][ ]   [ ]     │
│                          │   ...                    │
│   Extracted text         │   ל [ ][ ][ ]   [ ]     │
│   (editable)             │                          │
│                          │   Mode: שורה ↔           │
└──────────────────────────┴─────────────────────────┘
```

- **Definitions panel** (right, 700px) — paste a screenshot, extract text via OCR.
- **Crossword grid** (left) — 12×12 interactive grid.

## Crossword Grid

- **12×12 cells**, Hebrew language, RTL direction.
- **Row labels**: Hebrew letters א (Alef) through ל (Lamed), displayed on the right side of each row.
- **Column numbers**: 1 through 12, displayed on top, ordered right-to-left.
- **Input**: Cells accept only Hebrew letters (א–ת, including final forms).
- **End of word**: Typing a dot (`.`) marks the cell with a **black circle** (60% of cell size) to denote a word boundary.

## Navigation & Interaction

| Action | Behavior |
|--------|----------|
| **Type a Hebrew letter** | Fills the cell and auto-advances the cursor |
| **Type a dot (`.`)** | Marks the cell as end-of-word (black circle), advances cursor |
| **Space bar** | Toggles between row mode (↔) and column mode (↕) |
| **Arrow keys** | Move the cursor in the corresponding direction |
| **Backspace** | Clears the current cell, or retreats and clears if already empty |
| **Delete** | Clears the current cell without moving |
| **Tab / Shift+Tab** | Advance / retreat the cursor |

### Cursor auto-advance

- **Row mode**: After entering a letter, the cursor moves **left** (next column in reading order).
- **Column mode**: After entering a letter, the cursor moves **down** (next row).

### Visual feedback

- The active row (in row mode) or column (in column mode) is highlighted with a **light blue shadow bar**.
- The focused cell has a **blue inset border**.
- A **mode indicator** below the grid shows the current mode — blue for row, green for column.

## Definitions Panel

### Screenshot paste

- Click the paste area and press **Ctrl+V** to paste a screenshot of the puzzle definitions.
- The image is displayed inline and can be scrolled if larger than the panel.

### OCR text extraction

- Powered by **Tesseract.js** (runs entirely in the browser, no server required).
- After pasting an image, the **"🔍 חלץ טקסט"** button becomes active.
- Clicking it extracts Hebrew text from the image (~5–15 seconds).
- The extracted text appears in an **editable area** below, allowing manual correction of OCR errors.
- Requires internet on first use to download Hebrew language data (~2MB, cached afterward).

## Deployment

The app is a static site (HTML + CSS + JS) and can be hosted on any free static hosting provider:

- **Netlify** — drag & drop at [app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages** — push to a repo, enable Pages in Settings
- **Vercel** / **Cloudflare Pages** — connect a GitHub repo
