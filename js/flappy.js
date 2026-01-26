// js/flappy.js

import { flappyBirdImg, cloudFace } from "./assets.js";

export function createFlappyState(canvas) {
  return {
    bird: {
      x: 130,
      y: canvas.height / 2,
      vy: 0,
      width: 36,
      height: 26
    },
    pipes: [],
    clouds: [],
    score: 0,
    spawnTimer: 0,
    baseSpawnInterval: 120,
    basePipeGap: 115,
    spawnInterval: 120,
    pipeGap: 115,
    pipeWidth: 54,
    baseSpeed: 2.0,
    speed: 2.0,
    demoTime: 0
  };
}

export function initFlappy(state, canvas) {
  state.bird.x = 130;
  state.bird.y = canvas.height / 2;
  state.bird.vy = 0;
  state.pipes = [];
  state.clouds = [];
  state.score = 0;
  state.spawnTimer = 0;
  state.spawnInterval = state.baseSpawnInterval;
  state.pipeGap = state.basePipeGap;
  state.speed = state.baseSpeed;
  state.demoTime = 0;

  for (let i = 0; i < 4; i++) {
    state.clouds.push(createCloud(canvas));
  }

  for (let i = 0; i < 2; i++) {
    spawnPipe(state, canvas, i * (state.spawnInterval * 0.8));
  }
}

export function flap(state) {
  state.bird.vy = -7.2;
}

export function updateFlappy(state, dt, canvas) {
  const bird = state.bird;
  const score = state.score;

  const difficulty = Math.min(score / 14, 12);
  state.speed = state.baseSpeed + difficulty * 0.18;
  state.spawnInterval = Math.max(state.baseSpawnInterval - difficulty * 8, 62);
  state.pipeGap = Math.max(state.basePipeGap - difficulty * 3.2, 72);

  const gravity = 0.45;
  bird.vy += gravity * dt;
  bird.y += bird.vy * dt;

  if (bird.y < 0 || bird.y + bird.height > canvas.height) {
    return true;
  }

  state.spawnTimer += dt;
  if (state.spawnTimer >= state.spawnInterval) {
    state.spawnTimer = 0;
    spawnPipe(state, canvas, 0);
  }

  for (let i = state.pipes.length - 1; i >= 0; i--) {
    const pipe = state.pipes[i];
    pipe.x -= state.speed * dt * 2.2;

    if (!pipe.passed && pipe.x + state.pipeWidth < bird.x) {
      pipe.passed = true;
      state.score += 1;
    }

    if (pipe.x + state.pipeWidth < -10) {
      state.pipes.splice(i, 1);
      continue;
    }

    if (checkPipeCollision(state, pipe)) {
      return true;
    }
  }

  return false;
}

export function updateFlappyDemo(state, dt, canvas) {
  const bird = state.bird;

  state.demoTime += dt;
  const baseY = canvas.height * 0.5;
  const amplitude = 18;
  const speed = 0.06;

  bird.y = baseY + Math.sin(state.demoTime * speed) * amplitude - bird.height / 2;
  bird.vy = 0;

  state.pipes = [];
  state.spawnTimer = 0;
  state.score = 0;
}

export function drawFlappy(ctx, state, canvas) {
  const { bird, pipes, clouds } = state;

  const theme = getThemeColors();
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  clouds.forEach(cloud => {
    cloud.x -= cloud.speed;

    if (cloud.x + cloud.size < 0) {
      Object.assign(cloud, createCloud(canvas), {
        x: canvas.width + Math.random() * 40
      });
    }

    ctx.save();
    ctx.globalAlpha = 0.25;
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

  ctx.fillStyle = theme.grassTop;
  ctx.fillRect(0, canvas.height - 18, canvas.width, 3);
  ctx.fillStyle = theme.grass;
  ctx.fillRect(0, canvas.height - 15, canvas.width, 15);

  pipes.forEach(pipe => {
    drawPipe(ctx, state, pipe, canvas.height);
  });

  drawBird(ctx, bird);
}

function getThemeColors() {
  const body = document.body.classList;

  if (body.contains("space")) {
    return {
      bg: "#05070f",
      grassTop: "#0b152b",
      grass: "#1b2b4a"
    };
  }

  if (body.contains("night")) {
    return {
      bg: "#212121",
      grassTop: "#2f6a35",
      grass: "#3d8a45"
    };
  }

  return {
    bg: "#f7f7f7",
    grassTop: "#4fae5a",
    grass: "#6ecf6a"
  };
}

function createCloud(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: 20 + Math.random() * 80,
    size: 18 + Math.random() * 22,
    speed: 0.35 + Math.random() * 0.45
  };
}

function spawnPipe(state, canvas, offset = 0) {
  const minY = 40;
  const maxY = canvas.height - 40 - state.pipeGap;
  const range = Math.max(40, maxY - minY);
  const chaos = Math.min(state.score / 25, 6);
  const jitter = (Math.random() - 0.5) * chaos * 6;
  const gapY = minY + Math.random() * range + jitter;

  state.pipes.push({
    x: canvas.width + 40 + offset,
    gapY: Math.max(minY, Math.min(gapY, maxY)),
    passed: false
  });
}

function checkPipeCollision(state, pipe) {
  const { bird, pipeWidth, pipeGap } = state;
  const margin = 6;

  const birdLeft = bird.x + margin;
  const birdRight = bird.x + bird.width - margin;
  const birdTop = bird.y + margin;
  const birdBottom = bird.y + bird.height - margin;

  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipeWidth;
  const gapTop = pipe.gapY;
  const gapBottom = pipe.gapY + pipeGap;

  const hitsX = birdRight > pipeLeft && birdLeft < pipeRight;
  const hitsTop = birdTop < gapTop;
  const hitsBottom = birdBottom > gapBottom;

  return hitsX && (hitsTop || hitsBottom);
}

function drawPipe(ctx, state, pipe, canvasHeight) {
  const { pipeWidth, pipeGap } = state;
  const pipeColor = "#2f9e44";
  const edgeColor = "#1f7a34";
  const capHeight = 16;
  const capWidth = pipeWidth + 10;
  const capX = pipe.x - 5;

  ctx.fillStyle = pipeColor;
  ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
  ctx.fillRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, canvasHeight - pipe.gapY - pipeGap);

  ctx.fillStyle = edgeColor;
  ctx.fillRect(capX, pipe.gapY - capHeight, capWidth, capHeight);
  ctx.fillRect(capX, pipe.gapY + pipeGap, capWidth, capHeight);

  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.gapY);
  ctx.strokeRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, canvasHeight - pipe.gapY - pipeGap);
}

function drawBird(ctx, bird) {
  const img = flappyBirdImg;

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.scale(-1, 1);

  const angle = Math.max(-0.5, Math.min(0.5, bird.vy / 10));
  ctx.rotate(angle);

  if (img && img.complete) {
    ctx.drawImage(
      img,
      -bird.width / 2,
      -bird.height / 2,
      bird.width,
      bird.height
    );
  } else {
    ctx.fillStyle = "#ffca3a";
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
  }

  ctx.restore();
}
