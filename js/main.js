import { loadSprites } from "./assets.js";
import {
  setLoading,
  setReady,
  onStart,
  onRestart,
  hideMenu,
  resetMenu,
  showGameOver,
  updateScore
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
let obstacleTimer = 0;

/* ===== LOOP CONTROL ===== */
let lastTime = 0;
let animationId = null;

/* ===== PAUSA ===== */
let paused = false;
let countingDown = false;
let countdown = 3;

/* ===== INIT ===== */
function init() {
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

/* ===== CONTROLES ===== */
function jump() {
  if (!started || gameOver || paused || countingDown) return;
  playerJump(player);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    jump();
  }

  if (e.code === "ArrowDown" || e.code === "KeyS") {
    e.preventDefault();
    playerCrouch(player, true);
  }

  if (e.code === "Escape" || e.code === "KeyP") {
    togglePause();
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowDown" || e.code === "KeyS") {
    playerCrouch(player, false);
  }
});

canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  jump();
}, { passive: false });

/* ===== PAUSA ===== */

pauseBtn.onclick = togglePause;
resumeBtn.onclick = startCountdown;

function togglePause() {
  if (!started || gameOver || countingDown) return;

  if (!paused) {
    paused = true;
    pauseOverlay.style.display = "flex";
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
onStart(() => {
  hideMenu();
  if (animationId) cancelAnimationFrame(animationId);

  started = true;
  init();
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
});

onRestart(() => {
  hideMenu();
  resetMenu();
  if (animationId) cancelAnimationFrame(animationId);

  started = true;
  init();
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
      showGameOver(score);
    }
  );

  score += 0.1 * dt;
  updateScore(score);
  frame++;
}

/* ===== MOBILE ===== */
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
