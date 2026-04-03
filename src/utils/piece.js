import { COLS } from '../constants/game.js';
import { TETROMINOES } from '../constants/tetrominoes.js';

/**
 * @typedef {{ shape: number[][], color: string, x: number, y: number }} Piece
 */

/**
 * Returns a new Piece object from a random tetromino template,
 * spawned at the top-centre of the board.
 *
 * @returns {Piece}
 */
export function createRandomPiece() {
  const template = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  return {
    shape: template.shape.map(row => [...row]),
    color: template.color,
    x: Math.floor(COLS / 2) - Math.floor(template.shape[0].length / 2),
    y: 0,
  };
}

/**
 * Rotates a shape 90° clockwise.
 *
 * @param {number[][]} shape
 * @returns {number[][]}
 */
export function rotateClockwise(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

/**
 * Checks whether a piece at the given (offsetX, offsetY) position
 * does not collide with board walls or locked cells.
 *
 * @param {number[][]}     shape
 * @param {number}         offsetX
 * @param {number}         offsetY
 * @param {(0|string)[][]} board
 * @returns {boolean}
 */
export function isValidPosition(shape, offsetX, offsetY, board) {
  const ROWS = board.length;
  const COLS = board[0].length;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;

      const boardX = offsetX + c;
      const boardY = offsetY + r;

      // Cells above the top of the board are allowed (spawning / rotation).
      // Cells outside left/right/bottom walls are forbidden.
      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return false;

      // Only check locked-cell collision once inside the visible board.
      if (boardY >= 0 && board[boardY][boardX] !== 0) return false;
    }
  }
  return true;
}

/**
 * Returns the Y coordinate the piece would land on if dropped straight down.
 * Used to render the ghost (shadow) piece.
 *
 * @param {Piece}          piece
 * @param {(0|string)[][]} board
 * @returns {number}
 */
export function getGhostY(piece, board) {
  let ghostY = piece.y;
  while (isValidPosition(piece.shape, piece.x, ghostY + 1, board)) {
    ghostY++;
  }
  return ghostY;
}

/**
 * Attempts wall-kick offsets when a rotation would be invalid.
 * Returns the valid X offset, or null if no kick works.
 *
 * @param {number[][]}     rotatedShape
 * @param {number}         x
 * @param {number}         y
 * @param {(0|string)[][]} board
 * @returns {number|null}
 */
export function resolveWallKick(rotatedShape, x, y, board) {
  const kicks = [0, 1, -1, 2, -2];
  for (const kick of kicks) {
    if (isValidPosition(rotatedShape, x + kick, y, board)) return kick;
  }
  return null;
}
