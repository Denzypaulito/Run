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
  playerJump
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
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

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

/* ===== INIT ===== */
function init() {
  world = createWorld();
  initWorld(world, canvas);

  player = createPlayer(groundY);

  obstacles = [];
  frame = 0;
  score = 0;
  gameOver = false;
  obstacleTimer = 0;
}

/* ===== CONTROLES ===== */
function jump() {
  if (!started || gameOver) return;
  playerJump(player);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  jump();
}, { passive: false });

/* ===== UI EVENTS ===== */
onStart(() => {
  hideMenu();
  started = true;
  init();
  lastTime = 0;
  requestAnimationFrame(gameLoop);
});

onRestart(() => {
  hideMenu();
  resetMenu();
  started = true;
  init();
  lastTime = 0;
  requestAnimationFrame(gameLoop);
});

/* ===== LOOP CON TIEMPO ===== */
let lastTime = 0;

function gameLoop(time = 0) {
  if (!started) return;

  const delta = time - lastTime;
  lastTime = time;

  const dt = delta / 16.666; // normalizado a 60fps

  update(dt);

  if (!gameOver) requestAnimationFrame(gameLoop);
}

/* ===== UPDATE ===== */
function update(dt) {
  /* Mundo */
  updateWorld(world, score, dt);
  drawWorld(ctx, canvas, world, groundY, dt);

  /* Jugador */
  updatePlayer(player, groundY, dt);
  drawPlayer(ctx, player, spritesReady);

  /* Obstáculos (por tiempo) */
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
      showGameOver(score);
    }
  );

  /* Score */
  score += 0.1 * dt;
  updateScore(score);

  frame++;
}

/* ===== MOBILE ===== */
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
