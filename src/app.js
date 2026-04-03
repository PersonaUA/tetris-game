import { createApp, ref } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/vue.esm-browser.prod.js';

import { COLS, ROWS, CELL_SIZE, PREVIEW_SIZE } from './constants/game.js';
import { useGameState }      from './composables/useGameState.js';
import { useKeyboard }       from './composables/useKeyboard.js';
import { useCanvasRenderer } from './composables/useCanvasRenderer.js';

createApp({
  setup() {
    // ── Canvas refs ────────────────────────────────────────────────────────────
    const boardCanvasRef   = ref(null);
    const previewCanvasRef = ref(null);

    // ── Game state & actions ───────────────────────────────────────────────────
    const game = useGameState();

    // ── Render loop ────────────────────────────────────────────────────────────
    // Must be registered before useKeyboard so the canvas is ready when
    // the first key is pressed.
    useCanvasRenderer(
      boardCanvasRef,
      previewCanvasRef,
      game.setRenderCallback,
      game.gameState,
    );

    // ── Keyboard input ─────────────────────────────────────────────────────────
    useKeyboard({
      moveLeft:       game.moveLeft,
      moveRight:      game.moveRight,
      softDropManual: game.softDropManual,
      rotate:         game.rotate,
      hardDrop:       game.hardDrop,
      togglePause:    game.togglePause,
    });

    // ── Template bindings ──────────────────────────────────────────────────────
    return {
      boardCanvasRef,
      previewCanvasRef,
      BOARD_WIDTH:  COLS * CELL_SIZE,
      BOARD_HEIGHT: ROWS * CELL_SIZE,
      PREVIEW_SIZE,

      gameState:     game.gameState,
      score:         game.score,
      lines:         game.lines,
      level:         game.level,
      levelProgress: game.levelProgress,
      highScore:     game.highScore,
      stats:         game.stats,
      isFlashing:    game.isFlashing,

      startGame:      game.startGame,
      togglePause:    game.togglePause,
      moveLeft:       game.moveLeft,
      moveRight:      game.moveRight,
      softDropManual: game.softDropManual,
      rotate:         game.rotate,
      hardDrop:       game.hardDrop,
    };
  },
}).mount('#app');
