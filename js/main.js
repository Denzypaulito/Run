import { loadSprites } from "./assets.js";
import {
  setLoading,
  setReady,
  onStart,
  onRestart,
  hideMenu,
  resetMenu,
  showGameOver,
  updateScore,
  onSelectGame,
  onBackToMenu,
  setGameMode,
  getGameMode
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

/* ===== CANVAS ===== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;

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
let obstacleTimer = 0;
let demoAnimationId = null;
let demoScore = 0;

/* ===== LOOP CONTROL ===== */
let lastTime = 0;
let animationId = null;

/* ===== PAUSA ===== */
let paused = false;
let countingDown = false;
let countdown = 3;

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
  } else if (mode === "gravity") {
    initGravityGame();
  } else {
    initRun();
  }
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

/* ===== CONTROLES ===== */
function jump() {
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

  playerJump(player);
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

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!started && isMenuOpen() && isStartVisible()) {
      startBtn.click();
      return;
    }
    if (gameOver && isMenuOpen() && isRestartVisible()) {
      restartBtn.click();
      return;
    }
    jump();
  }

  if (e.code === "ArrowDown" || e.code === "KeyS") {
    if (getGameMode() === "run") {
      e.preventDefault();
      playerCrouch(player, true);
    } else if (getGameMode() === "gravity") {
      e.preventDefault();
      if (gravityState) gravityCrouch(gravityState, true);
    }
  }

  if (e.code === "Escape" || e.code === "KeyP") {
    togglePause();
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowDown" || e.code === "KeyS") {
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
  if (!started && isMenuOpen() && isStartVisible()) {
    startBtn.click();
    return;
  }
  jump();
});

document.addEventListener("touchstart", e => {
  if (isInteractiveTarget(e.target)) return;
  e.preventDefault();
  if (!started && isMenuOpen() && isStartVisible()) {
    startBtn.click();
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
  runCountdown();
}

function startGameCountdown() {
  paused = false;
  countingDown = true;
  countdown = 3;

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

function runCountdown() {
  countdownText.textContent = countdown === 0 ? "¡YA!" : countdown;

  if (countdown === 0) {
    setTimeout(() => {
      paused = false;
      countingDown = false;
      pauseOverlay.style.display = "none";
      pauseBtn.style.display = "block";
      lastTime = performance.now();
    }, 500);
    return;
  }

  setTimeout(() => {
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
  startDemo();
});

setGameMode(getGameMode());
startDemo();

onStart(() => {
  hideMenu();
  if (animationId) cancelAnimationFrame(animationId);
  stopDemo();

  started = true;
  initGame();
  if (getGameMode() === "flappy") startGameCountdown();
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
});

onBackToMenu(() => {
  goToMenu();
});

onRestart(() => {
  hideMenu();
  if (animationId) cancelAnimationFrame(animationId);
  stopDemo();

  started = true;
  initGame();
  if (getGameMode() === "flappy") startGameCountdown();
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
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

/* ===== UPDATE ===== */
function update(dt) {
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

  const mode = getGameMode();
  if (mode === "flappy") {
    initFlappyDemo();
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

function goToMenu() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;

  started = false;
  gameOver = false;
  paused = false;
  countingDown = false;

  pauseOverlay.style.display = "none";
  pauseBtn.style.display = "none";

  resetMenu();
  startDemo();
}

/* ===== MOBILE ===== */
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
