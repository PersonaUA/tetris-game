import { onMounted, onUnmounted } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/vue.esm-browser.prod.js';
import { renderBoard, renderPreview } from '../utils/renderer.js';

/**
 * Wires the game-state render callback to the canvas elements.
 *
 * Instead of polling via RAF + dirty flag, a callback is registered that
 * the game state calls on every change. RAF is used only to schedule the
 * actual draw on the next animation frame to avoid layout thrashing.
 *
 * @param {import('vue').Ref<HTMLCanvasElement>} boardCanvasRef
 * @param {import('vue').Ref<HTMLCanvasElement>} previewCanvasRef
 * @param {(cb: Function) => void}               setRenderCallback
 * @param {import('vue').Ref<string>}            gameState
 */
export function useCanvasRenderer(boardCanvasRef, previewCanvasRef, setRenderCallback, gameState) {
  let rafId        = null;
  let pendingFrame = null;

  /**
   * Called by the game state on every change.
   * Schedules a canvas repaint on the next animation frame.
   *
   * @param {{ board, activePiece, nextPiece, ghostY }} frame
   */
  function onGameStateChanged(frame) {
    pendingFrame = frame;
    if (rafId !== null) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      rafId = null;
      _paint(pendingFrame);
    });
  }

  function _paint({ board, activePiece, nextPiece, ghostY }) {
    const boardCtx = boardCanvasRef.value?.getContext('2d');
    if (boardCtx) {
      const showPiece  = gameState.value === 'playing' ? activePiece : null;
      const showGhostY = gameState.value === 'playing' ? ghostY : null;
      renderBoard(boardCtx, board, showPiece, showGhostY);
    }

    const previewCtx = previewCanvasRef.value?.getContext('2d');
    if (previewCtx && nextPiece) {
      renderPreview(previewCtx, nextPiece);
    }
  }

  onMounted(()   => setRenderCallback(onGameStateChanged));
  onUnmounted(() => { if (rafId !== null) cancelAnimationFrame(rafId); });
}
