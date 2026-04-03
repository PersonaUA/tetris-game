import { ref, reactive, computed, onUnmounted } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/vue.esm-browser.prod.js';

import {
  LINES_PER_LEVEL,
  LINE_SCORE_TABLE,
  HARD_DROP_BONUS_PER_CELL,
  SOFT_DROP_BONUS_PER_CELL,
  BASE_DROP_SPEED_MS,
  DROP_SPEED_STEP_MS,
  MIN_DROP_SPEED_MS,
  HIGH_SCORE_STORAGE_KEY,
} from '../constants/game.js';

import { createEmptyBoard, lockPiece, clearCompletedLines } from '../utils/board.js';
import { createRandomPiece, rotateClockwise, isValidPosition, getGhostY, resolveWallKick } from '../utils/piece.js';

/**
 * @typedef {'idle'|'playing'|'paused'|'over'} GameStatus
 */

export function useGameState() {
  // ─── Persistent ─────────────────────────────────────────────────────────────
  const highScore = ref(Number(localStorage.getItem(HIGH_SCORE_STORAGE_KEY) || 0));

  // ─── Game lifecycle ──────────────────────────────────────────────────────────
  const gameState = ref('idle');

  // ─── Score / progress ───────────────────────────────────────────────────────
  const score = ref(0);
  const lines = ref(0);
  const level = ref(1);

  const stats = reactive({ singles: 0, doubles: 0, triples: 0, tetris: 0 });

  const levelProgress = computed(() => (lines.value % LINES_PER_LEVEL) / LINES_PER_LEVEL);

  // ─── Board & pieces (plain JS — not reactive) ────────────────────────────────
  // Avoided making these reactive: Vue's deep reactivity on large arrays and
  // frequently-mutated objects causes unnecessary overhead. Instead, the render
  // callback is called explicitly via _markDirty().
  let board       = createEmptyBoard();
  let activePiece = null;
  let nextPiece   = null;

  // ─── Render callback (injected by useCanvasRenderer) ────────────────────────
  // Decouples game state from rendering while still allowing immediate redraws.
  let _renderCallback = null;

  function setRenderCallback(fn) {
    _renderCallback = fn;
  }

  function _markDirty() {
    if (_renderCallback) {
      _renderCallback({
        board,
        activePiece,
        nextPiece,
        ghostY: activePiece ? getGhostY(activePiece, board) : null,
      });
    }
  }

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const isFlashing = ref(false);

  // ─── Drop timer ─────────────────────────────────────────────────────────────
  let dropTimerId = null;

  function _getDropIntervalMs() {
    return Math.max(MIN_DROP_SPEED_MS, BASE_DROP_SPEED_MS - (level.value - 1) * DROP_SPEED_STEP_MS);
  }

  function _startDropTimer() {
    _stopDropTimer();
    dropTimerId = setInterval(() => {
      if (gameState.value === 'playing') _softDrop();
    }, _getDropIntervalMs());
  }

  function _stopDropTimer() {
    if (dropTimerId !== null) {
      clearInterval(dropTimerId);
      dropTimerId = null;
    }
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  function _flashBoard() {
    isFlashing.value = true;
    setTimeout(() => { isFlashing.value = false; }, 150);
  }

  function _updateHighScore() {
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem(HIGH_SCORE_STORAGE_KEY, highScore.value);
    }
  }

  function _recordClearedLines(count) {
    if (count === 1)      stats.singles++;
    else if (count === 2) stats.doubles++;
    else if (count === 3) stats.triples++;
    else if (count === 4) stats.tetris++;
  }

  function _lockAndSpawn() {
    lockPiece(activePiece, board);

    const cleared = clearCompletedLines(board);

    if (cleared > 0) {
      score.value += LINE_SCORE_TABLE[cleared] * level.value;
      lines.value += cleared;
      level.value  = Math.floor(lines.value / LINES_PER_LEVEL) + 1;

      _recordClearedLines(cleared);
      _updateHighScore();
      _flashBoard();
      _startDropTimer();
    }

    activePiece = nextPiece;
    nextPiece   = createRandomPiece();

    if (!isValidPosition(activePiece.shape, activePiece.x, activePiece.y, board)) {
      _endGame();
      return;
    }

    _markDirty();
  }

  function _softDrop() {
    if (!activePiece) return;

    if (isValidPosition(activePiece.shape, activePiece.x, activePiece.y + 1, board)) {
      activePiece.y++;
    } else {
      _lockAndSpawn();
      return;
    }

    _markDirty();
  }

  // ─── Public actions ──────────────────────────────────────────────────────────

  function startGame() {
    board       = createEmptyBoard();
    score.value = 0;
    lines.value = 0;
    level.value = 1;
    stats.singles = stats.doubles = stats.triples = stats.tetris = 0;

    activePiece = createRandomPiece();
    nextPiece   = createRandomPiece();

    gameState.value = 'playing';
    _startDropTimer();
    _markDirty();
  }

  function _endGame() {
    gameState.value = 'over';
    _stopDropTimer();
    _markDirty();
  }

  function togglePause() {
    if (gameState.value === 'playing') {
      gameState.value = 'paused';
      _stopDropTimer();
      _markDirty();
    } else if (gameState.value === 'paused') {
      gameState.value = 'playing';
      _startDropTimer();
      _markDirty();
    }
  }

  function moveLeft() {
    if (gameState.value !== 'playing' || !activePiece) return;
    if (isValidPosition(activePiece.shape, activePiece.x - 1, activePiece.y, board)) {
      activePiece.x--;
      _markDirty();
    }
  }

  function moveRight() {
    if (gameState.value !== 'playing' || !activePiece) return;
    if (isValidPosition(activePiece.shape, activePiece.x + 1, activePiece.y, board)) {
      activePiece.x++;
      _markDirty();
    }
  }

  function softDropManual() {
    if (gameState.value !== 'playing') return;
    score.value += SOFT_DROP_BONUS_PER_CELL;
    _softDrop();
  }

  function rotate() {
    if (gameState.value !== 'playing' || !activePiece) return;

    const rotated = rotateClockwise(activePiece.shape);
    const kick    = resolveWallKick(rotated, activePiece.x, activePiece.y, board);

    if (kick === null) return;

    activePiece.shape  = rotated;
    activePiece.x     += kick;
    _markDirty();
  }

  function hardDrop() {
    if (gameState.value !== 'playing' || !activePiece) return;

    let dropped = 0;
    while (isValidPosition(activePiece.shape, activePiece.x, activePiece.y + 1, board)) {
      activePiece.y++;
      dropped++;
    }

    score.value += dropped * HARD_DROP_BONUS_PER_CELL;
    _lockAndSpawn();
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  onUnmounted(() => _stopDropTimer());

  return {
    // State
    gameState,
    score,
    lines,
    level,
    levelProgress,
    highScore,
    stats,
    isFlashing,

    // Render bridge
    setRenderCallback,

    // Actions
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    softDropManual,
    rotate,
    hardDrop,
  };
}
