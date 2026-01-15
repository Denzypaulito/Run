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
let nextObstacleFrame = 100;

/* ===== INIT ===== */
function init() {
  world = createWorld();
  initWorld(world, canvas);

  player = createPlayer(groundY);

  obstacles = [];
  frame = 0;
  score = 0;
  gameOver = false;
  nextObstacleFrame = 80;
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
  requestAnimationFrame(gameLoop);
});

onRestart(() => {
  hideMenu();
  resetMenu();
  started = true;
  init();
  requestAnimationFrame(gameLoop);
});

/* ===== UPDATE ===== */
function update() {
  /* Mundo */
  updateWorld(world, score);
  drawWorld(ctx, canvas, world, groundY);

  /* Jugador */
  updatePlayer(player, groundY);
  drawPlayer(ctx, player, spritesReady);

  /* Obstáculos */
  const obstacleState = {
    obstacles,
    canvas,
    groundY,
    groundLineY,
    speed: world.speed,
    score,
    frame,
    nextObstacleFrame
  };

  spawnObstacles(obstacleState);
  nextObstacleFrame = obstacleState.nextObstacleFrame;

  updateAndDrawObstacles(
    { obstacles, speed: world.speed, score },
    ctx,
    player,
    () => {
      gameOver = true;
      showGameOver(score);
    }
  );

  /* Score */
  score += 0.1;
  updateScore(score);

  frame++;
}

/* ===== LOOP ===== */
function gameLoop() {
  if (!started) return;
  update();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

/* ===== MOBILE ===== */
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
