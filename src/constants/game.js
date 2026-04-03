/** Board dimensions (in cells) */
export const COLS = 5;
export const ROWS = 20;

/** Pixel size of each cell on the canvas */
export const CELL_SIZE = 30;

/** Preview canvas size for the next piece */
export const PREVIEW_SIZE = 80;

/** Number of lines to clear per level */
export const LINES_PER_LEVEL = 10;

/**
 * Drop interval in ms for each level.
 * Formula: max(50, 800 - (level - 1) * 70)
 */
export const BASE_DROP_SPEED_MS  = 800;
export const DROP_SPEED_STEP_MS  = 70;
export const MIN_DROP_SPEED_MS   = 50;

/**
 * Score awarded per cleared line count (index = lines cleared).
 * Multiplied by the current level.
 */
export const LINE_SCORE_TABLE = [0, 100, 300, 500, 800];

/** Bonus points per cell during a hard drop */
export const HARD_DROP_BONUS_PER_CELL = 2;

/** Bonus points per cell during a soft drop */
export const SOFT_DROP_BONUS_PER_CELL = 1;

/** localStorage key for persisting the high score */
export const HIGH_SCORE_STORAGE_KEY = 'tetris_highScore';
