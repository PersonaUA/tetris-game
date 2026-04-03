/**
 * All 7 standard tetrominoes.
 * Each shape is a 2-D array of 0/1 values.
 * Colors follow the classic Tetris color scheme.
 *
 * @typedef {{ shape: number[][], color: string }} Tetromino
 */

/** @type {Tetromino[]} */
export const TETROMINOES = [
  { shape: [[1, 1, 1, 1]],         color: '#00f5ff' }, // I — cyan
  { shape: [[1, 1], [1, 1]],       color: '#ffe600' }, // O — yellow
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#aa00ff' }, // T — purple
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff8800' }, // J — orange
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#0055ff' }, // L — blue
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#aaff00' }, // S — green
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0055' }, // Z — red
];
