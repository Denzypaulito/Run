import { loadSprites } from "./assets.js";
import {
  setLoading,
  setReady,
  onStart,
  onRestart,
  hideMenu,
  resetMenu,
  showGameOver,
  showMatchOver,
  updateScore,
  onSelectGame,
  onSelectPlayMode,
  onSubmitMultiNames,
  showMultiNameModal,
  hideMultiNameModal,
  onBackToMenu,
  setGameMode,
  getGameMode,
  setPlayMode,
  getPlayMode,
  getMultiNames,
  saveMultiNamesFromInputs
} from "./ui.js";
import {
  createPlayer,
  updatePlayer,
  drawPlayer,
  playerJump,
  playerCrouch
} from "./player.js";
import {
  spawnObstacles,
  updateAndDrawObstacles
} from "./obstacles.js";
import {
  createWorld,
  initWorld,
  updateWorld,
  drawWorld
} from "./world.js";
import {
  createFlappyState,
  initFlappy,
  updateFlappy,
  drawFlappy,
  flap,
  updateFlappyDemo
} from "./flappy.js";
import {
  createGravityState,
  initGravity,
  initGravityDemo,
  updateGravity,
  drawGravity,
  updateGravityDemo,
  toggleGravity,
  gravityCrouch
} from "./gravity.js";
import {
  createColorState,
  initColor,
  initColorDemo,
  updateColor,
  updateColorDemo,
  drawColor,
  cycleColor
} from "./color.js";

/* ===== CANVAS ===== */
const singleView = document.getElementById("singleView");
const multiView = document.getElementById("multiView");
const canvasWrapper = document.getElementById("canvasWrapper");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;

const canvasP1 = document.getElementById("gameP1");
const canvasP2 = document.getElementById("gameP2");
const ctxP1 = canvasP1.getContext("2d", { alpha: false });
const ctxP2 = canvasP2.getContext("2d", { alpha: false });
ctxP1.imageSmoothingEnabled = false;
ctxP2.imageSmoothingEnabled = false;

const p1NameEl = document.getElementById("p1Name");
const p2NameEl = document.getElementById("p2Name");
const p1TimeEl = document.getElementById("p1Time");
const p2TimeEl = document.getElementById("p2Time");

/* ===== PAUSA UI ===== */
const pauseBtn = document.getElementById("pauseBtn");
const pauseOverlay = document.getElementById("pauseOverlay");
const pauseText = document.getElementById("pauseText");
const countdownText = document.getElementById("countdownText");
const resumeBtn = document.getElementById("resumeBtn");
const pauseMenuBtn = document.getElementById("pauseMenuBtn");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const rotateHint = document.getElementById("rotateHint");
const dismissRotateBtn = document.getElementById("dismissRotateBtn");
const multiNameModal = document.getElementById("multiNameModal");

/* 🔥 oculto desde que carga la página */
pauseBtn.style.display = "none";

/* ===== SPRITES ===== */
let spritesReady = false;
setLoading();

loadSprites(() => {
  spritesReady = true;
  setReady();
});

/* ===== CONSTANTES ===== */
const groundY = 220;
const groundLineY = groundY + 60;

/* ===== ESTADO ===== */
let world;
let player, obstacles, frame, score, gameOver, started;
let flappyState;
let gravityState;
let colorState;
let obstacleTimer = 0;
let demoAnimationId = null;
let demoScore = 0;

let isMultiplayer = false;
let multiPlayers = [];
let multiNames = ["Jugador 1", "Jugador 2"];
let multiMode = "run";
let multiTime = 0;
let multiAnimationId = null;

/* ===== LOOP CONTROL ===== */
let lastTime = 0;
let animationId = null;

/* ===== PAUSA ===== */
let paused = false;
let countingDown = false;
let countdown = 3;
let countdownTimeoutId = null;
let countdownToken = 0;

/* ===== INIT ===== */
function initRun() {
  world = createWorld();
  initWorld(world, canvas);

  player = createPlayer(groundY);
  player.animFrame = 0;
  player.fastFall = false;

  obstacles = [];
  frame = 0;
  score = 0;
  gameOver = false;
  obstacleTimer = 0;

  paused = false;
  countingDown = false;
  countdown = 3;

  pauseOverlay.style.display = "none";
  pauseBtn.style.display = "block"; // ✅ SOLO cuando el juego inicia

  updateScore(0);
}

function initFlappyGame() {
  flappyState = createFlappyState(canvas);
  initFlappy(flappyState, canvas);

  frame = 0;
  score = 0;
  gameOver = false;

  paused = false;
  countingDown = false;
  countdown = 3;

  pauseOverlay.style.display = "none";
  pauseBtn.style.display = "block";

  updateScore(0);
}

function initGravityGame() {
  gravityState = createGravityState(canvas);
  initGravity(gravityState, canvas);

  frame = 0;
  score = 0;
  gameOver = false;

  paused = false;
  countingDown = false;
  countdown = 3;

  pauseOverlay.style.display = "none";
  pauseBtn.style.display = "block";

  updateScore(0);
}

function initGame() {
  const mode = getGameMode();
  if (mode === "flappy") {
    initFlappyGame();
  } else if (mode === "color") {
    colorState = createColorState(canvas, groundY);
    initColor(colorState, canvas, groundY);
    pauseOverlay.style.display = "none";
    pauseBtn.style.display = "block";
  } else if (mode === "gravity") {
    initGravityGame();
  } else {
    initRun();
  }
}

function createMultiSession(canvasEl, ctxEl) {
  return {
    canvas: canvasEl,
    ctx: ctxEl,
    world: null,
    player: null,
    obstacles: [],
    obstacleTimer: 0,
    flappyState: null,
    gravityState: null,
    colorState: null,
    score: 0,
    dead: false,
    time: 0
  };
}

function initSession(session, mode) {
  session.score = 0;
  session.dead = false;
  session.time = 0;

  if (mode === "flappy") {
    session.flappyState = createFlappyState(session.canvas);
    initFlappy(session.flappyState, session.canvas);
    return;
  }

  if (mode === "gravity") {
    session.gravityState = createGravityState(session.canvas);
    initGravity(session.gravityState, session.canvas);
    return;
  }

  if (mode === "color") {
    session.colorState = createColorState(session.canvas, groundY);
    initColor(session.colorState, session.canvas, groundY);
    return;
  }

  session.world = createWorld();
  initWorld(session.world, session.canvas);
  session.player = createPlayer(groundY);
  session.player.animFrame = 0;
  session.player.fastFall = false;
  session.obstacles = [];
  session.obstacleTimer = 0;
}

function updateSession(session, mode, dt) {
  if (mode === "flappy") {
    const dead = updateFlappy(session.flappyState, dt, session.canvas);
    drawFlappy(session.ctx, session.flappyState, session.canvas);
    session.score = session.flappyState.score;
    return dead;
  }

  if (mode === "gravity") {
    const dead = updateGravity(session.gravityState, dt);
    drawGravity(session.ctx, session.gravityState, spritesReady);
    session.score = session.gravityState.score;
    return dead;
  }

  if (mode === "color") {
    const dead = updateColor(session.colorState, dt);
    drawColor(session.ctx, session.colorState, spritesReady, session.canvas);
    session.score = session.colorState.score;
    return dead;
  }

  updateWorld(session.world, session.score);
  drawWorld(session.ctx, session.canvas, session.world, groundY, dt);

  updatePlayer(session.player, groundY, dt, session.world.speed);
  drawPlayer(session.ctx, session.player, spritesReady);

  const obstacleState = {
    obstacles: session.obstacles,
    canvas: session.canvas,
    groundY,
    groundLineY,
    speed: session.world.speed,
    score: session.score,
    dt,
    obstacleTimer: session.obstacleTimer
  };

  spawnObstacles(obstacleState);
  session.obstacleTimer = obstacleState.obstacleTimer;

  let dead = false;
  updateAndDrawObstacles(
    { obstacles: session.obstacles, speed: session.world.speed, score: session.score, dt },
    session.ctx,
    session.player,
    () => {
      dead = true;
    }
  );

  session.score += 0.1 * dt;
  return dead;
}

function initRunDemo() {
  world = createWorld();
  initWorld(world, canvas);

  player = createPlayer(groundY);
  player.animFrame = 0;
  player.fastFall = false;

  demoScore = 0;
}

function initFlappyDemo() {
  flappyState = createFlappyState(canvas);
  initFlappy(flappyState, canvas);
  flappyState.pipes = [];
}

function initGravityMenuDemo() {
  gravityState = createGravityState(canvas);
  initGravityDemo(gravityState, canvas);
}

function initColorMenuDemo() {
  colorState = createColorState(canvas, groundY);
  initColorDemo(colorState, canvas, groundY);
}

function showSingleView() {
  singleView.style.display = "block";
  multiView.style.display = "none";
  canvasWrapper.classList.remove("multiplayer");
}

function showMultiView() {
  singleView.style.display = "none";
  multiView.style.display = "flex";
  canvasWrapper.classList.add("multiplayer");
}

/* ===== CONTROLES ===== */
function jump() {
  if (isMultiplayer) return;
  if (!started || gameOver || paused || countingDown) return;

  const mode = getGameMode();
  if (mode === "flappy") {
    flap(flappyState);
    return;
  }

  if (mode === "gravity") {
    toggleGravity(gravityState);
    return;
  }

  if (mode === "color") {
    cycleColor(colorState);
    return;
  }

  playerJump(player);
}

function multiAction(playerIndex) {
  if (!isMultiplayer || !started || countingDown) return;
  const session = multiPlayers[playerIndex];
  if (!session || session.dead) return;

  if (multiMode === "flappy") {
    flap(session.flappyState);
    return;
  }

  if (multiMode === "gravity") {
    toggleGravity(session.gravityState);
    return;
  }

  if (multiMode === "color") {
    cycleColor(session.colorState);
    return;
  }

  playerJump(session.player);
}

function multiCrouch(playerIndex, isDown) {
  if (!isMultiplayer || !started || countingDown) return;
  const session = multiPlayers[playerIndex];
  if (!session || session.dead) return;

  if (multiMode === "run") {
    playerCrouch(session.player, isDown);
  } else if (multiMode === "gravity") {
    gravityCrouch(session.gravityState, isDown);
  }
}

function isMenuOpen() {
  return window.getComputedStyle(menu).display !== "none";
}

function isStartVisible() {
  return window.getComputedStyle(startBtn).display !== "none";
}

function isRestartVisible() {
  return window.getComputedStyle(restartBtn).display !== "none";
}

function multiNameModalIsOpen() {
  return window.getComputedStyle(multiNameModal).display !== "none";
}

function handleMenuStart() {
  if (!started && isMenuOpen() && isStartVisible()) {
    startBtn.click();
    return true;
  }
  return false;
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    if (handleMenuStart()) return;
    if (gameOver && isMenuOpen() && isRestartVisible()) {
      restartBtn.click();
      return;
    }
    if (isMultiplayer) {
      //multiAction(0);
      return;
    }
    jump();
  }

  if (e.code === "KeyW") {
    if (isMultiplayer) {
      e.preventDefault();
      multiAction(0);
      return;
    }
  }

  if (e.code === "ArrowUp") {
    if (isMultiplayer) {
      e.preventDefault();
      multiAction(1);
      return;
    }
  }

  if (e.code === "ArrowDown" || e.code === "KeyS") {
    if (isMultiplayer) {
      e.preventDefault();
      const idx = e.code === "ArrowDown" ? 1 : 0;
      multiCrouch(idx, true);
      return;
    }
    if (getGameMode() === "run") {
      e.preventDefault();
      playerCrouch(player, true);
    } else if (getGameMode() === "gravity") {
      e.preventDefault();
      if (gravityState) gravityCrouch(gravityState, true);
    }
  }

  if (e.code === "Escape" || e.code === "KeyP") {
    if (!isMultiplayer) togglePause();
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowDown" || e.code === "KeyS") {
    if (isMultiplayer) {
      const idx = e.code === "ArrowDown" ? 1 : 0;
      multiCrouch(idx, false);
      return;
    }
    if (getGameMode() === "run") {
      playerCrouch(player, false);
    } else if (getGameMode() === "gravity") {
      if (gravityState) gravityCrouch(gravityState, false);
    }
  }
});

function isInteractiveTarget(target) {
  return target.closest("button, input, #pauseOverlay");
}

document.addEventListener("click", e => {
  if (isInteractiveTarget(e.target)) return;
  if (handleMenuStart()) return;
  if (isMultiplayer) {
    const half = window.innerHeight / 2;
    multiAction(e.clientY < half ? 0 : 1);
    return;
  }
  jump();
});

document.addEventListener("touchstart", e => {
  if (isInteractiveTarget(e.target)) return;
  e.preventDefault();
  if (handleMenuStart()) return;
  const touch = e.touches[0];
  if (isMultiplayer) {
    const half = window.innerHeight / 2;
    multiAction(touch.clientY < half ? 0 : 1);
    return;
  }
  jump();
}, { passive: false });

/* ===== PAUSA ===== */

pauseBtn.onclick = togglePause;
resumeBtn.onclick = startCountdown;
pauseMenuBtn.onclick = goToMenu;

function togglePause() {
  if (!started || gameOver || countingDown) return;

  if (!paused) {
    paused = true;
    pauseOverlay.style.display = "flex";
    pauseText.textContent = "PAUSA";
    pauseText.style.display = "block";
    countdownText.textContent = "";
    resumeBtn.style.display = "block";
    pauseBtn.style.display = "none";
  }
}

function startCountdown() {
  if (!paused) return;

  pauseText.style.display = "none";
  resumeBtn.style.display = "none";
  countingDown = true;
  countdown = 3;
  countdownToken++;
  runCountdown();
}

function startGameCountdown() {
  paused = false;
  countingDown = true;
  countdown = 3;
  countdownToken++;

  if (getGameMode() === "flappy" && flappyState) {
    drawFlappy(ctx, flappyState, canvas);
    updateScore(0);
  }

  pauseOverlay.style.display = "flex";
  pauseText.textContent = "PREPARA";
  pauseText.style.display = "block";
  countdownText.textContent = "";
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "none";

  runCountdown();
}

function startMatchCountdown() {
  paused = false;
  countingDown = true;
  countdown = 3;
  countdownToken++;

  pauseOverlay.style.display = "flex";
  pauseText.textContent = "PREPARA";
  pauseText.style.display = "block";
  countdownText.textContent = "";
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "none";

  runCountdown();
}

function runCountdown() {
  const token = countdownToken;
  countdownText.textContent = countdown === 0 ? "¡YA!" : countdown;

  if (countdown === 0) {
    clearTimeout(countdownTimeoutId);
    countdownTimeoutId = setTimeout(() => {
      if (token !== countdownToken) return;
      paused = false;
      countingDown = false;
      pauseOverlay.style.display = "none";
      if (!isMultiplayer) pauseBtn.style.display = "block";
      lastTime = performance.now();
    }, 500);
    return;
  }

  clearTimeout(countdownTimeoutId);
  countdownTimeoutId = setTimeout(() => {
    if (token !== countdownToken) return;
    countdown--;
    runCountdown();
  }, 900);
}

/* ===== UI EVENTS ===== */
onSelectGame(mode => {
  const current = getGameMode();
  if (mode === current) return;

  setGameMode(mode);
  resetMenu();
  ensureMenuState();
  startDemo();
});

setGameMode(getGameMode());
setPlayMode(getPlayMode());
startDemo();

onSelectPlayMode(mode => {
  setPlayMode(mode);
  resetMenu();
  ensureMenuState();
  if (mode === "multi") {
    showMultiNameModal();
  } else {
    hideMultiNameModal();
  }
});

function startSingleGame() {
  isMultiplayer = false;
  showSingleView();
  hideMultiNameModal();
  hideMenu();
  if (animationId) cancelAnimationFrame(animationId);
  if (multiAnimationId) cancelAnimationFrame(multiAnimationId);
  stopDemo();

  started = true;
  ensureMenuState();
  initGame();
  if (getGameMode() === "flappy") startGameCountdown();
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function drawMultiStartFrames() {
  multiPlayers.forEach(session => {
    updateSession(session, multiMode, 0);
  });
}

function startMultiplayerGame(name1, name2) {
  isMultiplayer = true;
  showMultiView();
  hideMultiNameModal();
  hideMenu();
  if (animationId) cancelAnimationFrame(animationId);
  if (multiAnimationId) cancelAnimationFrame(multiAnimationId);
  stopDemo();

  started = true;
  gameOver = false;
  paused = false;
  countingDown = false;
  ensureMenuState();

  multiMode = getGameMode();
  multiNames = [name1, name2];
  p1NameEl.textContent = name1;
  p2NameEl.textContent = name2;
  p1TimeEl.textContent = "000.0";
  p2TimeEl.textContent = "000.0";

  multiPlayers = [
    createMultiSession(canvasP1, ctxP1),
    createMultiSession(canvasP2, ctxP2)
  ];

  multiPlayers.forEach(session => initSession(session, multiMode));
  multiTime = 0;

  pauseOverlay.style.display = "none";
  pauseBtn.style.display = "none";

  drawMultiStartFrames();
  startMatchCountdown();
  lastTime = performance.now();
  multiAnimationId = requestAnimationFrame(multiLoop);
}

onSubmitMultiNames((name1, name2) => {
  multiNames = [name1, name2];
});

/* ===== ORIENTATION HINT ===== */
let rotateDismissed = localStorage.getItem("rotateHintDismissed") === "1";

function updateOrientationHint() {
  const portrait = window.matchMedia("(orientation: portrait)").matches;
  document.body.classList.toggle("portrait", portrait);

  if (portrait && !rotateDismissed) {
    rotateHint.style.display = "flex";
  } else {
    rotateHint.style.display = "none";
  }
}

dismissRotateBtn.onclick = () => {
  rotateDismissed = true;
  localStorage.setItem("rotateHintDismissed", "1");
  rotateHint.style.display = "none";
};

window.addEventListener("orientationchange", updateOrientationHint);
window.addEventListener("resize", updateOrientationHint);
updateOrientationHint();

onStart(() => {
  if (getPlayMode() === "multi") {
    if (multiNameModalIsOpen()) {
      const [n1, n2] = saveMultiNamesFromInputs();
      multiNames = [n1, n2];
    } else {
      multiNames = getMultiNames();
    }
    startMultiplayerGame(multiNames[0], multiNames[1]);
    return;
  }
  startSingleGame();
});

onBackToMenu(() => {
  goToMenu();
});

onRestart(() => {
  if (getPlayMode() === "multi" && isMultiplayer) {
    if (multiNameModalIsOpen()) {
      const [n1, n2] = saveMultiNamesFromInputs();
      multiNames = [n1, n2];
    } else {
      multiNames = getMultiNames();
    }
    startMultiplayerGame(multiNames[0], multiNames[1]);
    return;
  }
  startSingleGame();
});

/* ===== GAME LOOP ===== */
function gameLoop(time = 0) {
  if (!started) return;

  if (paused || countingDown) {
    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  let delta = time - lastTime;
  lastTime = time;

  if (delta > 60) delta = 60;

  const dt = delta / 16.666;
  update(dt);

  if (!gameOver) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function formatTime(t) {
  return t.toFixed(1).padStart(5, "0");
}

function multiLoop(time = 0) {
  if (!isMultiplayer) return;

  if (paused || countingDown) {
    multiAnimationId = requestAnimationFrame(multiLoop);
    return;
  }

  let delta = time - lastTime;
  lastTime = time;

  if (delta > 60) delta = 60;

  const dt = delta / 16.666;
  multiTime += dt;

  multiPlayers.forEach(session => {
    if (session.dead) return;
    const dead = updateSession(session, multiMode, dt);
    if (dead) {
      session.dead = true;
      session.time = multiTime;
    }
  });

  const p1Time = multiPlayers[0].dead ? multiPlayers[0].time : multiTime;
  const p2Time = multiPlayers[1].dead ? multiPlayers[1].time : multiTime;
  p1TimeEl.textContent = formatTime(p1Time);
  p2TimeEl.textContent = formatTime(p2Time);

  if (multiPlayers.some(p => p.dead)) {
    endMultiplayerMatch();
    return;
  }

  multiAnimationId = requestAnimationFrame(multiLoop);
}

/* ===== UPDATE ===== */
function update(dt) {
  if (isMultiplayer) return;
  const mode = getGameMode();

  if (mode === "flappy") {
    const dead = updateFlappy(flappyState, dt, canvas);
    drawFlappy(ctx, flappyState, canvas);

    score = flappyState.score;
    updateScore(score);

    if (dead) {
      gameOver = true;
      pauseBtn.style.display = "none";
      showGameOver(score, "flappy");
      return;
    }

    frame++;
    return;
  }

  if (mode === "gravity") {
    const dead = updateGravity(gravityState, dt);
    drawGravity(ctx, gravityState, spritesReady);

    score = gravityState.score;
    updateScore(score);

    if (dead) {
      gameOver = true;
      pauseBtn.style.display = "none";
      showGameOver(score, "gravity");
      return;
    }

    frame++;
    return;
  }

  if (mode === "color") {
    const dead = updateColor(colorState, dt);
    drawColor(ctx, colorState, spritesReady, canvas);

    score = colorState.score;
    updateScore(score);

    if (dead) {
      gameOver = true;
      pauseBtn.style.display = "none";
      showGameOver(score, "color");
      return;
    }

    frame++;
    return;
  }

  updateWorld(world, score);
  drawWorld(ctx, canvas, world, groundY, dt);

  updatePlayer(player, groundY, dt, world.speed);
  drawPlayer(ctx, player, spritesReady);

  const obstacleState = {
    obstacles,
    canvas,
    groundY,
    groundLineY,
    speed: world.speed,
    score,
    dt,
    obstacleTimer
  };

  spawnObstacles(obstacleState);
  obstacleTimer = obstacleState.obstacleTimer;

  updateAndDrawObstacles(
    { obstacles, speed: world.speed, score, dt },
    ctx,
    player,
    () => {
      gameOver = true;
      pauseBtn.style.display = "none"; // ✅ se oculta en game over
      showGameOver(score, "run");
    }
  );

  score += 0.1 * dt;
  updateScore(score);
  frame++;
}

/* ===== DEMO LOOP (MENU) ===== */
function startDemo() {
  if (started) return;
  stopDemo();
  showSingleView();
  ensureMenuState();

  const mode = getGameMode();
  if (mode === "flappy") {
    initFlappyDemo();
  } else if (mode === "color") {
    initColorMenuDemo();
  } else if (mode === "gravity") {
    initGravityMenuDemo();
  } else {
    initRunDemo();
  }

  let last = performance.now();
  demoAnimationId = requestAnimationFrame(function loop(time) {
    if (started) return;

    const delta = Math.min(60, time - last);
    last = time;
    const dt = delta / 16.666;

    if (getGameMode() === "flappy") {
      updateFlappyDemo(flappyState, dt, canvas);
      drawFlappy(ctx, flappyState, canvas);
    } else if (getGameMode() === "color") {
      updateColorDemo(colorState, dt);
      drawColor(ctx, colorState, spritesReady, canvas);
    } else if (getGameMode() === "gravity") {
      updateGravityDemo(gravityState, dt);
      drawGravity(ctx, gravityState, spritesReady);
    } else {
      demoScore += 0.05 * dt;
      updateWorld(world, demoScore);
      drawWorld(ctx, canvas, world, groundY, dt);
      updatePlayer(player, groundY, dt, world.speed);
      drawPlayer(ctx, player, spritesReady);
    }

    demoAnimationId = requestAnimationFrame(loop);
  });
}

function stopDemo() {
  if (demoAnimationId) cancelAnimationFrame(demoAnimationId);
  demoAnimationId = null;
}

function ensureMenuState() {
  paused = false;
  countingDown = false;
  countdownToken++;
  clearTimeout(countdownTimeoutId);
  pauseOverlay.style.display = "none";
  pauseBtn.style.display = "none";
}

function endMultiplayerMatch() {
  if (multiAnimationId) cancelAnimationFrame(multiAnimationId);
  multiAnimationId = null;

  started = false;
  gameOver = true;
  paused = false;
  countingDown = false;

  let resultText = "";
  if (multiPlayers[0].dead && !multiPlayers[1].dead) {
    resultText = `Ganó ${multiNames[1]}`;
  } else if (multiPlayers[1].dead && !multiPlayers[0].dead) {
    resultText = `Ganó ${multiNames[0]}`;
  } else {
    resultText = `Empate`;
  }

  showMatchOver(resultText);
}

function goToMenu() {
  if (animationId) cancelAnimationFrame(animationId);
  if (multiAnimationId) cancelAnimationFrame(multiAnimationId);
  animationId = null;
  multiAnimationId = null;

  started = false;
  gameOver = false;
  paused = false;
  countingDown = false;
  isMultiplayer = false;

  pauseOverlay.style.display = "none";
  pauseBtn.style.display = "none";

  showSingleView();
  resetMenu();
  ensureMenuState();
  startDemo();
}

/* ===== MOBILE ===== */
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
