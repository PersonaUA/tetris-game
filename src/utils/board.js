import { COLS, ROWS } from '../constants/game.js';

/**
 * Creates a fresh empty game board.
 * Each cell holds either 0 (empty) or a CSS color string.
 *
 * @returns {(0|string)[][]}
 */
export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

/**
 * Locks the current piece onto the board (mutates the board in place).
 *
 * @param {{ shape: number[][], color: string, x: number, y: number }} piece
 * @param {(0|string)[][]} board
 */
export function lockPiece(piece, board) {
  const { shape, color, x, y } = piece;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] && y + r >= 0) {
        board[y + r][x + c] = color;
      }
    }
  }
}

/**
 * Removes all completed lines from the board (mutates in place)
 * and returns how many lines were cleared.
 *
 * @param {(0|string)[][]} board
 * @returns {number} Number of cleared lines
 */
export function clearCompletedLines(board) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      r++; // re-check the same row index after shift
    }
  }
  return cleared;
}
