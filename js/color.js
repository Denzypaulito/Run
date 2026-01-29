// js/color.js

import { runImgs, cloudFace } from "./assets.js";

const COLORS = ["#ff4d4d", "#4dabf7", "#51cf66"];
const tintedCache = [[], [], []];

function createPlayer(groundY) {
  return {
    x: 60,
    y: groundY,
    width: 40,
    height: 59,
    animFrame: 0,
    animSpeed: 0.12,
    colorIndex: 0
  };
}

export function createColorState(canvas, groundY) {
  return {
    player: createPlayer(groundY),
    barriers: [],
    clouds: [],
    score: 0,
    spawnTimer: 0,
    baseSpawnInterval: 90,
    spawnInterval: 90,
    baseSpeed: 5,
    speed: 5,
    groundY,
    groundLineY: groundY + 60,
    demoTimer: 0,
    canvas
  };
}

export function initColor(state, canvas, groundY) {
  state.player = createPlayer(groundY);
  state.barriers = [];
  state.clouds = [];
  state.score = 0;
  state.spawnTimer = 0;
  state.spawnInterval = state.baseSpawnInterval;
  state.speed = state.baseSpeed;
  state.groundY = groundY;
  state.groundLineY = groundY + 60;
  state.demoTimer = 0;
  state.canvas = canvas;

  for (let i = 0; i < 4; i++) {
    state.clouds.push(createCloud(canvas));
  }
}

export function initColorDemo(state, canvas, groundY) {
  initColor(state, canvas, groundY);
  state.barriers = [];
}

export function cycleColor(state) {
  state.player.colorIndex = (state.player.colorIndex + 1) % COLORS.length;
}

export function updateColor(state, dt) {
  state.speed = state.baseSpeed + Math.floor(state.score / 25);
  state.spawnInterval = Math.max(state.baseSpawnInterval - state.speed * 2, 55);

  updateClouds(state, dt);

  state.spawnTimer += dt;
  if (state.spawnTimer >= state.spawnInterval) {
    state.spawnTimer = 0;
    spawnBarrier(state, state.canvas);
  }

  state.player.animFrame += state.player.animSpeed * (0.6 + state.speed / 10) * dt;
  if (state.player.animFrame >= runImgs.length || state.player.animFrame < 0) {
    state.player.animFrame = 0;
  }

  for (let i = state.barriers.length - 1; i >= 0; i--) {
    const bar = state.barriers[i];
    bar.x -= state.speed * dt;

    const player = state.player;
    const hitX = bar.x < player.x + player.width * 0.65 && !bar.passed;
    if (hitX) {
      bar.passed = true;
      if (bar.colorIndex !== player.colorIndex) {
        return true;
      }
      state.score += 1;
    }

    if (bar.x + bar.width < 0) {
      state.barriers.splice(i, 1);
    }
  }

  state.score += 0.06 * dt;
  return false;
}

export function updateColorDemo(state, dt) {
  state.demoTimer += dt;
  if (state.demoTimer > 30) {
    state.demoTimer = 0;
    cycleColor(state);
  }

  updateClouds(state, dt);

  state.player.animFrame += state.player.animSpeed * 0.9 * dt;
  if (state.player.animFrame >= runImgs.length || state.player.animFrame < 0) {
    state.player.animFrame = 0;
  }
}

export function drawColor(ctx, state, spritesReady, canvas) {
  ctx.fillStyle = "#f7f7f7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawClouds(ctx, state);
  drawGround(ctx, canvas, state.groundLineY);
  drawBarriers(ctx, state, canvas);
  drawColoredPlayer(ctx, state.player, spritesReady);
}

function spawnBarrier(state, canvas) {
  state.barriers.push({
    x: canvas.width + 30,
    y: 0,
    width: 34 + Math.random() * 10,
    colorIndex: Math.floor(Math.random() * COLORS.length),
    passed: false
  });
}

function drawBarriers(ctx, state, canvas) {
  state.barriers.forEach(bar => {
    const color = COLORS[bar.colorIndex];
    const grad = ctx.createLinearGradient(bar.x, 0, bar.x + bar.width, 0);
    grad.addColorStop(0, shadeColor(color, -35));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, shadeColor(color, -35));

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = grad;
    ctx.fillRect(bar.x, 0, bar.width, state.groundLineY);
    ctx.restore();

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(bar.x, 0, bar.width, state.groundLineY);

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bar.x + bar.width * 0.25, 0, bar.width * 0.12, state.groundLineY);
    ctx.globalAlpha = 1;
  });
}

function drawGround(ctx, canvas, groundLineY) {
  ctx.strokeStyle = "#535353";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundLineY);
  ctx.lineTo(canvas.width, groundLineY);
  ctx.stroke();
}

function drawColoredPlayer(ctx, player, spritesReady) {
  const index = Math.floor(player.animFrame) % runImgs.length;
  const img = runImgs[index];
  const color = COLORS[player.colorIndex];

  ctx.save();
  if (spritesReady && img && img.complete) {
    const tinted = getTintedFrame(index, color, img);
    if (tinted) {
      ctx.drawImage(
        tinted,
        Math.round(player.x),
        Math.round(player.y),
        player.width,
        player.height
      );
    } else {
      ctx.drawImage(
        img,
        Math.round(player.x),
        Math.round(player.y),
        player.width,
        player.height
      );
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = color;
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
  ctx.restore();
}

function getTintedFrame(index, color, img) {
  if (!img || !img.complete || !img.naturalWidth) return null;
  const cache = tintedCache[COLORS.indexOf(color)] || tintedCache[0];
  if (cache[index]) return cache[index];

  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const cctx = c.getContext("2d");

  cctx.drawImage(img, 0, 0);
  cctx.globalCompositeOperation = "source-atop";
  cctx.globalAlpha = 0.85;
  cctx.fillStyle = color;
  cctx.fillRect(0, 0, c.width, c.height);
  cctx.globalCompositeOperation = "source-over";
  cctx.globalAlpha = 0.35;
  cctx.drawImage(img, 0, 0);

  cache[index] = c;
  return c;
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `rgb(${r}, ${g}, ${b})`;
}

function createCloud(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: 20 + Math.random() * 80,
    size: 18 + Math.random() * 22,
    speed: 0.12 + Math.random() * 0.18
  };
}

function updateClouds(state, dt) {
  state.clouds.forEach(cloud => {
    cloud.x -= state.speed * cloud.speed * dt * 0.5;

    if (cloud.x + cloud.size < 0) {
      Object.assign(cloud, createCloud(state.canvas), {
        x: state.canvas.width + Math.random() * 40
      });
    }
  });
}

function drawClouds(ctx, state) {
  state.clouds.forEach(cloud => {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.filter = "grayscale(100%)";

    const ratio = cloudFace.naturalWidth / cloudFace.naturalHeight;
    const w = cloud.size * ratio;
    const h = cloud.size;

    ctx.drawImage(
      cloudFace,
      Math.round(cloud.x),
      Math.round(cloud.y),
      w,
      h
    );

    ctx.restore();
  });
}
