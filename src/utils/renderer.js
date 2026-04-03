import { COLS, ROWS, CELL_SIZE, PREVIEW_SIZE } from '../constants/game.js';

const CELL_INSET  = 2;
const GHOST_ALPHA = 0.25;
const GRID_COLOR  = 'rgba(0,245,255,0.05)';
const BG_COLOR    = '#050510';

/**
 * Draws a single locked or active tetromino cell with a 3-D bevel effect and glow.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} col   - Board column
 * @param {number} row   - Board row
 * @param {string} color - CSS color
 */
export function drawSolidCell(ctx, col, row, color) {
  const x    = col * CELL_SIZE + CELL_INSET;
  const y    = row * CELL_SIZE + CELL_INSET;
  const size = CELL_SIZE - CELL_INSET * 2;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);

  ctx.shadowColor = color;
  ctx.shadowBlur  = 10;
  ctx.fillRect(x, y, size, size);
  ctx.shadowBlur  = 0;

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x, y, size, 4);
  ctx.fillRect(x, y, 4, size);

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + size - 4, y, 4, size);
  ctx.fillRect(x, y + size - 4, size, 4);
}

/**
 * Draws a ghost (drop-preview) cell as a faint outline.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} col
 * @param {number} row
 * @param {string} color
 */
export function drawGhostCell(ctx, col, row, color) {
  const x    = col * CELL_SIZE + CELL_INSET;
  const y    = row * CELL_SIZE + CELL_INSET;
  const size = CELL_SIZE - CELL_INSET * 2;

  ctx.globalAlpha = GHOST_ALPHA;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.strokeRect(x, y, size, size);
  ctx.globalAlpha = 1;
}

/**
 * Iterates over a piece shape and calls the callback for each filled cell.
 *
 * @param {number[][]} shape
 * @param {number}     offsetX
 * @param {number}     offsetY
 * @param {(col: number, row: number) => void} callback
 */
function forEachCell(shape, offsetX, offsetY, callback) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) callback(offsetX + c, offsetY + r);
    }
  }
}

/**
 * Draws faint grid lines over the board canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function drawGrid(ctx) {
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth   = 1;

  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL_SIZE);
    ctx.lineTo(COLS * CELL_SIZE, r * CELL_SIZE);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL_SIZE, 0);
    ctx.lineTo(c * CELL_SIZE, ROWS * CELL_SIZE);
    ctx.stroke();
  }
}

/**
 * Full board render: background → grid → locked cells → ghost → active piece.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {(0|string)[][]}          board
 * @param {import('../utils/piece.js').Piece|null} activePiece
 * @param {number|null}             ghostY - Pre-computed ghost Y (null hides ghost)
 */
export function renderBoard(ctx, board, activePiece, ghostY) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);

  drawGrid(ctx);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawSolidCell(ctx, c, r, board[r][c]);
    }
  }

  if (!activePiece) return;

  if (ghostY !== null) {
    forEachCell(activePiece.shape, activePiece.x, ghostY, (col, row) =>
      drawGhostCell(ctx, col, row, activePiece.color)
    );
  }

  forEachCell(activePiece.shape, activePiece.x, activePiece.y, (col, row) =>
    drawSolidCell(ctx, col, row, activePiece.color)
  );
}

/**
 * Renders the next-piece preview onto a small canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('../utils/piece.js').Piece} piece
 */
export function renderPreview(ctx, piece) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

  const { shape, color } = piece;
  const offsetX = Math.floor((4 - shape[0].length) / 2);
  const offsetY = Math.floor((4 - shape.length) / 2);

  forEachCell(shape, offsetX, offsetY, (col, row) =>
    drawSolidCell(ctx, col, row, color)
  );
}
