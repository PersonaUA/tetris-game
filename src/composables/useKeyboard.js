import { onMounted, onUnmounted } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/vue.esm-browser.prod.js';

/**
 * @typedef {Object} GameActions
 * @property {() => void} moveLeft
 * @property {() => void} moveRight
 * @property {() => void} softDropManual
 * @property {() => void} rotate
 * @property {() => void} hardDrop
 * @property {() => void} togglePause
 */

/**
 * Registers and cleans up document-level keyboard listeners
 * that map standard Tetris keys to game actions.
 *
 * Arrow keys and Space have their default browser scrolling
 * behaviour prevented while the game is active.
 *
 * @param {GameActions} actions
 */
export function useKeyboard(actions) {
  const { moveLeft, moveRight, softDropManual, rotate, hardDrop, togglePause } = actions;

  /** Keys that must not trigger browser scroll */
  const PREVENT_DEFAULT_KEYS = new Set([
    'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ',
  ]);

  /** @param {KeyboardEvent} event */
  function handleKeyDown(event) {
    if (PREVENT_DEFAULT_KEYS.has(event.key)) event.preventDefault();

    switch (event.key) {
      case 'ArrowLeft':  return moveLeft();
      case 'ArrowRight': return moveRight();
      case 'ArrowDown':  return softDropManual();
      case 'ArrowUp':    return rotate();
      case ' ':          return hardDrop();
      case 'p':
      case 'P':
      case 'Escape':     return togglePause();
    }
  }

  onMounted(()   => document.addEventListener('keydown', handleKeyDown));
  onUnmounted(() => document.removeEventListener('keydown', handleKeyDown));
}
