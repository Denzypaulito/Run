// js/block.js

import { cloudFace } from "./assets.js";

const BOARD_SIZE = 8;
const COLORS = [
  "#ff6b6b",
  "#ffd43b",
  "#69db7c",
  "#4dabf7",
  "#b197fc",
  "#ffa94d",
  "#f783ac",
  "#63e6be"
];

const SHAPES = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [0, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[1, 0], [1, 1], [1, 2], [0, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 1], [1, 0], [1, 1], [2, 0]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 0], [2, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 1], [2, 1]]
];

const faceCache = new Map();

function normalizeShape(cells) {
  let maxX = 0;
  let maxY = 0;
  cells.forEach(([x, y]) => {
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });
  return {
    cells,
    w: maxX + 1,
    h: maxY + 1
  };
}

const NORMALIZED_SHAPES = SHAPES.map(normalizeShape);

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function pickShape() {
  const shape = NORMALIZED_SHAPES[Math.floor(Math.random() * NORMALIZED_SHAPES.length)];
  return {
    cells: shape.cells,
    w: shape.w,
    h: shape.h,
    color: randomColor()
  };
}

function generatePieces(state, ensureFit = false) {
  let attempts = 0;
  do {
    state.pieces = [pickShape(), pickShape(), pickShape()];
    state.nextPiece = pickShape();
    attempts++;
  } while (ensureFit && attempts < 25 && !hasAnyValidMove(state));

  state.selected = 0;
}

export function createBlockState(canvas) {
  return {
    board: createEmptyBoard(),
    pieces: [],
    nextPiece: null,
    selected: 0,
    score: 0,
    gameOver: false,
    demoTimer: 0,
    isDemo: false,
    hoverRow: null,
    hoverCol: null,
    hoverValid: false,
    canvas
  };
}

export function initBlock(state, canvas) {
  state.board = createEmptyBoard();
  state.score = 0;
  state.gameOver = false;
  state.demoTimer = 0;
  state.isDemo = false;
  state.canvas = canvas;
  state.hoverRow = null;
  state.hoverCol = null;
  state.hoverValid = false;
  generatePieces(state, true);
}

export function initBlockDemo(state, canvas) {
  initBlock(state, canvas);
  state.isDemo = true;
  for (let i = 0; i < 18; i++) {
    const r = Math.floor(Math.random() * BOARD_SIZE);
    const c = Math.floor(Math.random() * BOARD_SIZE);
    state.board[r][c] = Math.random() > 0.5 ? randomColor() : null;
  }
}

export function updateBlock(state) {
  if (!state || state.isDemo) return false;
  if (!state.gameOver && !hasAnyValidMove(state)) {
    state.gameOver = true;
  }
  return state.gameOver;
}

export function updateBlockDemo(state, dt) {
  state.demoTimer += dt;
  if (state.demoTimer > 30) {
    state.demoTimer = 0;
    state.selected = (state.selected + 1) % state.pieces.length;
  }
}

function getLayout(canvas) {
  const slotScale = 4;
  const nextScale = 3;
  const gapScale = 0.6;
  const panelSpacingScale = 1.5;
  const heightFactor = Math.max(BOARD_SIZE, slotScale * 3 + gapScale * 2 + 1);

  const maxCellByHeight = Math.floor((canvas.height - 40) / heightFactor);
  const maxCellByWidth = Math.floor((canvas.width - 40) / (BOARD_SIZE + slotScale + panelSpacingScale + nextScale));
  let cell = Math.max(10, Math.min(maxCellByHeight, maxCellByWidth));
  cell = Math.max(10, Math.floor(cell * 0.9));

  const boardSize = cell * BOARD_SIZE;
  const slotSize = cell * slotScale;
  const nextSize = cell * nextScale;
  const gap = Math.max(10, Math.floor(cell * gapScale));
  const panelSpacing = Math.max(12, Math.floor(cell * panelSpacingScale));
  const nextGap = Math.max(12, Math.floor(cell * 0.9));
  const totalWidth = boardSize + panelSpacing + slotSize + nextGap + nextSize;

  const boardX = Math.max(8, Math.floor((canvas.width - totalWidth) / 2));
  const boardY = Math.floor((canvas.height - boardSize) / 2);
  const panelX = boardX + boardSize + panelSpacing;
  const panelHeight = Math.max(slotSize * 3 + gap * 2, nextSize);
  const panelY = Math.floor((canvas.height - panelHeight) / 2);
  const nextX = panelX + slotSize + nextGap;
  const nextY = panelY + Math.floor((panelHeight - nextSize) / 2);

  return {
    cell,
    boardX,
    boardY,
    boardSize,
    panelX,
    panelY,
    slotSize,
    gap,
    nextX,
    nextY,
    nextSize
  };
}

function toCanvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function canPlace(board, piece, row, col) {
  return piece.cells.every(([x, y]) => {
    const r = row + y;
    const c = col + x;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    return !board[r][c];
  });
}

function placePiece(state, piece, row, col) {
  piece.cells.forEach(([x, y]) => {
    const r = row + y;
    const c = col + x;
    state.board[r][c] = piece.color;
  });
}

function clearLines(state) {
  const fullRows = [];
  const fullCols = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (state.board[r].every(cell => cell)) fullRows.push(r);
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!state.board[r][c]) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }

  if (fullRows.length === 0 && fullCols.length === 0) return 0;

  fullRows.forEach(r => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      state.board[r][c] = null;
    }
  });

  fullCols.forEach(c => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      state.board[r][c] = null;
    }
  });

  return fullRows.length + fullCols.length;
}

function hasAnyValidMove(state) {
  const available = state.pieces;
  if (!available.length) return false;

  for (const piece of available) {
    for (let r = 0; r <= BOARD_SIZE - piece.h; r++) {
      for (let c = 0; c <= BOARD_SIZE - piece.w; c++) {
        if (canPlace(state.board, piece, r, c)) {
          return true;
        }
      }
    }
  }

  return false;
}

function awardScore(state, lineCount) {
  if (lineCount > 0) {
    state.score += lineCount * lineCount * 20;
  }
}

function replacePiece(state, index) {
  state.pieces[index] = state.nextPiece || pickShape();
  state.nextPiece = pickShape();
  state.selected = index;
}

function tryPlace(state, index, row, col) {
  const piece = state.pieces[index];
  if (!canPlace(state.board, piece, row, col)) return false;

  placePiece(state, piece, row, col);
  const lineCount = clearLines(state);
  awardScore(state, lineCount);
  replacePiece(state, index);

  if (!hasAnyValidMove(state)) {
    state.gameOver = true;
  }

  return true;
}

function getPlacementFromPoint(state, layout, x, y) {
  if (
    x < layout.boardX ||
    x > layout.boardX + layout.boardSize ||
    y < layout.boardY ||
    y > layout.boardY + layout.boardSize
  ) {
    return null;
  }

  const piece = state.pieces[state.selected];
  if (!piece) return null;

  const anchorX = x - (piece.w * layout.cell) / 2;
  const anchorY = y - (piece.h * layout.cell) / 2;
  const rawCol = Math.floor((anchorX - layout.boardX) / layout.cell);
  const rawRow = Math.floor((anchorY - layout.boardY) / layout.cell);
  const maxCol = Math.max(0, BOARD_SIZE - piece.w);
  const maxRow = Math.max(0, BOARD_SIZE - piece.h);

  const col = Math.max(0, Math.min(maxCol, rawCol));
  const row = Math.max(0, Math.min(maxRow, rawRow));

  return { row, col };
}

export function handleBlockHover(state, canvas, clientX, clientY) {
  if (!state || state.isDemo || state.gameOver) return false;

  const { x, y } = toCanvasPoint(canvas, clientX, clientY);
  const layout = getLayout(canvas);
  const placement = getPlacementFromPoint(state, layout, x, y);

  if (!placement) {
    clearBlockHover(state);
    return false;
  }

  const piece = state.pieces[state.selected];
  const valid = piece ? canPlace(state.board, piece, placement.row, placement.col) : false;

  state.hoverRow = placement.row;
  state.hoverCol = placement.col;
  state.hoverValid = valid;
  return true;
}

export function clearBlockHover(state) {
  if (!state) return;
  state.hoverRow = null;
  state.hoverCol = null;
  state.hoverValid = false;
}

export function handleBlockClick(state, canvas, clientX, clientY) {
  if (!state || state.isDemo || state.gameOver) return false;

  const { x, y } = toCanvasPoint(canvas, clientX, clientY);
  const layout = getLayout(canvas);

  for (let i = 0; i < state.pieces.length; i++) {
    const slotX = layout.panelX;
    const slotY = layout.panelY + i * (layout.slotSize + layout.gap);
    if (
      x >= slotX &&
      x <= slotX + layout.slotSize &&
      y >= slotY &&
      y <= slotY + layout.slotSize
    ) {
      state.selected = i;
      return true;
    }
  }

  const placement = getPlacementFromPoint(state, layout, x, y);
  if (!placement) return false;

  const placed = tryPlace(state, state.selected, placement.row, placement.col);
  if (placed) {
    clearBlockHover(state);
  }
  return placed;
}

export function drawBlock(ctx, state, spritesReady, canvas) {
  const layout = getLayout(canvas);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#141414");
  gradient.addColorStop(1, "#1f1f1f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBoard(ctx, state, layout, spritesReady);
  drawGhostPlacement(ctx, state, layout, spritesReady);
  drawPiecePanel(ctx, state, layout, spritesReady);
}

function drawBoard(ctx, state, layout, spritesReady) {
  const { boardX, boardY, boardSize, cell } = layout;

  ctx.fillStyle = "#1f1f1f";
  ctx.fillRect(boardX, boardY, boardSize, boardSize);
  ctx.strokeStyle = "#050505";
  ctx.lineWidth = 3;
  ctx.strokeRect(boardX - 1.5, boardY - 1.5, boardSize + 3, boardSize + 3);

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const x = boardX + c * cell;
      const y = boardY + r * cell;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.strokeRect(x, y, cell, cell);

      if (state.board[r][c]) {
        drawErikaTile(ctx, x, y, cell, state.board[r][c], spritesReady, 1);
      }
    }
  }
}

function drawGhostPlacement(ctx, state, layout, spritesReady) {
  if (state.hoverRow === null || state.hoverCol === null) return;

  const piece = state.pieces[state.selected];
  if (!piece) return;

  const baseX = layout.boardX + state.hoverCol * layout.cell;
  const baseY = layout.boardY + state.hoverRow * layout.cell;
  const alpha = state.hoverValid ? 0.45 : 0.25;
  const tint = state.hoverValid ? piece.color : "#ff6b6b";

  piece.cells.forEach(([x, y]) => {
    drawErikaTile(
      ctx,
      baseX + x * layout.cell,
      baseY + y * layout.cell,
      layout.cell,
      tint,
      spritesReady,
      alpha
    );
  });
}

function drawPiecePanel(ctx, state, layout, spritesReady) {
  const { panelX, panelY, slotSize, gap, nextX, nextY, nextSize } = layout;

  for (let i = 0; i < state.pieces.length; i++) {
    const slotX = panelX;
    const slotY = panelY + i * (slotSize + gap);
    const piece = state.pieces[i];
    const selected = i === state.selected;

    ctx.fillStyle = selected ? "#2a2f3a" : "#1c1c1c";
    ctx.fillRect(slotX, slotY, slotSize, slotSize);
    ctx.strokeStyle = selected ? "#4dabf7" : "rgba(255,255,255,0.15)";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(slotX, slotY, slotSize, slotSize);

    const smallCell = Math.floor(slotSize / 4);
    const offsetX = slotX + Math.floor((slotSize - piece.w * smallCell) / 2);
    const offsetY = slotY + Math.floor((slotSize - piece.h * smallCell) / 2);

    piece.cells.forEach(([x, y]) => {
      drawErikaTile(ctx, offsetX + x * smallCell, offsetY + y * smallCell, smallCell, piece.color, spritesReady, 1);
    });
  }

  if (state.nextPiece) {
    ctx.fillStyle = "#1c1c1c";
    ctx.fillRect(nextX, nextY, nextSize, nextSize);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(nextX, nextY, nextSize, nextSize);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `${Math.max(10, Math.floor(nextSize * 0.18))}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("NEXT", nextX + nextSize / 2, nextY - 6);

    const nextCell = Math.floor(nextSize / 4);
    const offsetX = nextX + Math.floor((nextSize - state.nextPiece.w * nextCell) / 2);
    const offsetY = nextY + Math.floor((nextSize - state.nextPiece.h * nextCell) / 2);

    state.nextPiece.cells.forEach(([x, y]) => {
      drawErikaTile(
        ctx,
        offsetX + x * nextCell,
        offsetY + y * nextCell,
        nextCell,
        state.nextPiece.color,
        spritesReady,
        0.9
      );
    });
  }
}

function drawErikaTile(ctx, x, y, size, color, spritesReady, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const dark = shadeColor(color, -18);
  const light = shadeColor(color, 14);

  ctx.fillStyle = light;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.strokeStyle = dark;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

  if (spritesReady && cloudFace.complete) {
    const tinted = getTintedFace(color);
    if (tinted) {
      ctx.drawImage(tinted, x + 2, y + 2, size - 4, size - 4);
    }
  }

  ctx.restore();
}

function getTintedFace(color) {
  const cached = faceCache.get(color);
  if (cached) return cached;
  if (!cloudFace.complete || cloudFace.width === 0 || cloudFace.height === 0) return null;

  const off = document.createElement("canvas");
  off.width = cloudFace.width;
  off.height = cloudFace.height;
  const octx = off.getContext("2d");
  octx.drawImage(cloudFace, 0, 0);
  octx.globalCompositeOperation = "source-atop";
  octx.fillStyle = color;
  octx.globalAlpha = 0.6;
  octx.fillRect(0, 0, off.width, off.height);
  octx.globalCompositeOperation = "source-over";
  octx.globalAlpha = 1;
  faceCache.set(color, off);
  return off;
}

function shadeColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = (num >> 16) + amt;
  const g = ((num >> 8) & 0x00ff) + amt;
  const b = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (Math.max(0, Math.min(255, r)) << 16) +
      (Math.max(0, Math.min(255, g)) << 8) +
      Math.max(0, Math.min(255, b))
    )
      .toString(16)
      .slice(1)
  );
}
