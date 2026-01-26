// js/gravity.js

import { runImgs, cloudFace } from "./assets.js";

const GROUND_Y = 220;
const GROUND_LINE_Y = GROUND_Y + 60;
const CEILING_LINE_Y = 20;
const CEILING_Y = CEILING_LINE_Y;

function createPlayer() {
  return {
    x: 60,
    y: GROUND_Y,
    width: 40,
    height: 59,
    normalHeight: 59,
    crouchHeight: 35,
    vy: 0,
    gravity: 0.6,
    animFrame: 0,
    animSpeed: 0.12,
    grounded: true,
    isCrouching: false
  };
}

export function createGravityState(canvas) {
  return {
    player: createPlayer(),
    obstacles: [],
    stars: [],
    planets: [],
    score: 0,
    obstacleTimer: 0,
    baseSpeed: 6,
    speed: 6,
    gravityDir: 1,
    demoTimer: 0,
    lastLane: "bottom",
    canvas
  };
}

export function initGravity(state, canvas) {
  state.player = createPlayer();
  state.obstacles = [];
  state.stars = [];
  state.planets = [];
  state.score = 0;
  state.obstacleTimer = 0;
  state.speed = state.baseSpeed;
  state.gravityDir = 1;
  state.demoTimer = 0;
  state.lastLane = "bottom";
  state.canvas = canvas;

  setSpaceMode();

  for (let i = 0; i < 40; i++) {
    state.stars.push(createStar(canvas));
  }

  state.planets = createPlanets(canvas);
}

export function initGravityDemo(state, canvas) {
  initGravity(state, canvas);
  state.obstacles = [];
}

export function toggleGravity(state) {
  state.gravityDir *= -1;
  state.player.vy = 0;
  state.player.grounded = false;
  state.player.isCrouching = false;
  state.player.height = state.player.normalHeight;
}

export function gravityCrouch(state, isDown) {
  if (!state.player.grounded) return;
  state.player.isCrouching = isDown;
}

export function updateGravity(state, dt) {
  const player = state.player;

  state.speed = state.baseSpeed + Math.floor(state.score / 18);

  updateStars(state, dt);
  updatePlanets(state, dt);
  updatePlayer(state, dt);

  const hit = updateObstacles(state, dt);

  state.score += 0.1 * dt;

  return hit;
}

export function updateGravityDemo(state, dt) {
  state.demoTimer += dt;
  updateStars(state, dt);
  updatePlanets(state, dt);

  if (state.demoTimer > 150) {
    state.demoTimer = 0;
    toggleGravity(state);
  }

  updatePlayer(state, dt);
  state.obstacles = [];
  state.score = 0;
}

export function drawGravity(ctx, state, spritesReady) {
  const canvas = state.canvas;

  drawSpaceBackground(ctx, canvas, state.stars, state.planets);
  drawSpaceLines(ctx, canvas);
  drawObstacles(ctx, state);
  drawPlayer(ctx, state.player, state.gravityDir, spritesReady);
}

function setSpaceMode() {
  document.body.classList.remove("day", "night");
  document.body.classList.add("space");
}

function createStar(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.4 + 0.2,
    alpha: Math.random() * 0.6 + 0.2
  };
}

function createPlanets(canvas) {
  const colors = ["#7b4dff", "#f59f00", "#20c997", "#ff6b6b", "#4dabf7"];
  const planets = [];
  const maxPlanets = 5;
  let tries = 0;
  let cursorX = canvas.width + 300;

  while (planets.length < maxPlanets && tries < 200) {
    tries++;
    const size = 26 + Math.random() * 38;
    const x = cursorX + size / 2;
    const y = Math.random() * (canvas.height - size) + size / 2;
    const color = colors[Math.floor(Math.random() * colors.length)];

    const overlaps = planets.some(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);
      return dist < p.size / 2 + size / 2 + 10;
    });

    if (!overlaps) {
      planets.push({ x, y, size, color, speed: 0.25 + Math.random() * 0.35 });
      cursorX += size + 140 + Math.random() * 110;
    }
  }

  return planets;
}

function updatePlanets(state, dt) {
  if (!state.planets.length) return;

  const planetsSorted = state.planets.slice().sort((a, b) => a.x - b.x);
  let maxX = planetsSorted[planetsSorted.length - 1].x;
  const bgShift = state.speed * dt * 0.5;

  state.planets.forEach(planet => {
    planet.x -= bgShift;
    if (planet.x + planet.size / 2 < 0) {
      const spawnRight = Math.max(maxX, state.canvas.width) + 140;
      planet.x = spawnRight + planet.size;
      maxX = planet.x;
      planet.y = findNonOverlappingY(state, planet);
    }
  });
}

function findNonOverlappingY(state, planet) {
  let tries = 0;
  while (tries < 50) {
    tries++;
    const y = Math.random() * (state.canvas.height - planet.size) + planet.size / 2;
    const overlaps = state.planets.some(p => {
      if (p === planet) return false;
      const dx = p.x - planet.x;
      const dy = p.y - y;
      const dist = Math.hypot(dx, dy);
      return dist < p.size / 2 + planet.size / 2 + 10;
    });

    if (!overlaps) return y;
  }

  return Math.random() * (state.canvas.height - planet.size) + planet.size / 2;
}

function updateStars(state, dt) {
  const bgShift = state.speed * dt * 0.5;
  state.stars.forEach(star => {
    star.x -= bgShift;
    if (star.x < -2) {
      star.x = state.canvas.width + 80;
      star.y = Math.random() * state.canvas.height;
    }
  });
}

function drawSpaceBackground(ctx, canvas, stars, planets) {
  ctx.fillStyle = "#05070f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0d1328";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
  });

  ctx.globalAlpha = 1;

  planets.forEach(planet => {
    drawPlanet(ctx, planet);
  });

  ctx.globalAlpha = 1;
}

function drawSpaceLines(ctx, canvas) {
  ctx.strokeStyle = "#3aa7ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_LINE_Y);
  ctx.lineTo(canvas.width, GROUND_LINE_Y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, CEILING_LINE_Y);
  ctx.lineTo(canvas.width, CEILING_LINE_Y);
  ctx.stroke();
}

function updatePlayer(state, dt) {
  const player = state.player;
  const dir = state.gravityDir;

  player.vy += player.gravity * dir * dt;
  player.y += player.vy * dt;

  if (dir === 1 && player.y >= GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    player.grounded = true;
  } else if (dir === -1 && player.y <= CEILING_Y) {
    player.y = CEILING_Y;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }

  if (player.grounded) {
    if (player.isCrouching) {
      player.height = player.crouchHeight;
      if (dir === 1) {
        player.y = GROUND_Y + (player.normalHeight - player.crouchHeight);
      } else {
        player.y = CEILING_Y;
      }
    } else {
      player.height = player.normalHeight;
      player.y = dir === 1 ? GROUND_Y : CEILING_Y;
    }
  }

  if (player.grounded) {
    const speedFactor = 0.6 + state.speed / 10;
    player.animFrame += player.animSpeed * speedFactor * dt;
  }

  if (player.animFrame >= runImgs.length || player.animFrame < 0) {
    player.animFrame = 0;
  }
}

function drawPlayer(ctx, player, gravityDir, spritesReady) {
  const index = Math.floor(player.animFrame) % runImgs.length;
  const img = runImgs[index];

  ctx.save();
  ctx.translate(Math.round(player.x + player.width / 2), Math.round(player.y + player.height / 2));
  ctx.scale(1, gravityDir === -1 ? -1 : 1);

  if (spritesReady && img && img.complete) {
    ctx.drawImage(
      img,
      -player.width / 2,
      -player.height / 2,
      player.width,
      player.height
    );
  } else {
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
  }

  ctx.restore();
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function spawnObstacle(state) {
  let lane = Math.random() > 0.5 ? "bottom" : "top";
  if (lane === state.lastLane && Math.random() < 0.6) {
    lane = lane === "bottom" ? "top" : "bottom";
  }
  state.lastLane = lane;
  const img = cloudFace;

  let y = GROUND_LINE_Y - 42;
  let flipY = false;
  let size = 34 + Math.random() * 38;

  if (lane === "bottom") {
    const minY = GROUND_Y - size * 0.4;
    const maxY = GROUND_Y - size * 0.1;
    y = minY + Math.random() * Math.max(4, maxY - minY);
  } else {
    const minY = CEILING_Y;
    const maxY = CEILING_Y + size * 0.4;
    y = minY + Math.random() * Math.max(4, maxY - minY);
  }

  state.obstacles.push({
    x: state.canvas.width + 10,
    y,
    baseSize: size,
    img,
    passed: false,
    isBird: false,
    isAsteroid: true,
    drawWidth: 40,
    drawHeight: 40,
    flipY,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() * 0.05 + 0.01) * (Math.random() < 0.5 ? -1 : 1)
  });
}

function updateObstacles(state, dt) {
  state.obstacleTimer += dt;

  const base = Math.max(90 - state.speed * 4.6, 50);
  const randomExtra = Math.random() * 35;
  const spawnInterval = base + randomExtra;

  if (state.obstacleTimer >= spawnInterval) {
    state.obstacleTimer = 0;
    spawnObstacle(state);
  }

  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    const obs = state.obstacles[i];
    obs.x -= state.speed * dt;

    if (obs.img && obs.img.complete) {
      const ratio = obs.img.naturalWidth / obs.img.naturalHeight;
      obs.drawHeight = obs.baseSize;
      obs.drawWidth = obs.drawHeight * ratio;
    }

    const hitboxMargin = 8;
    const player = state.player;

    if (
      player.x + hitboxMargin < obs.x + obs.drawWidth - hitboxMargin &&
      player.x + player.width - hitboxMargin > obs.x + hitboxMargin &&
      player.y + hitboxMargin < obs.y + obs.drawHeight - hitboxMargin &&
      player.y + player.height - hitboxMargin > obs.y + hitboxMargin
    ) {
      return true;
    }

    if (!obs.passed && obs.x + obs.drawWidth < player.x) {
      obs.passed = true;
      state.score += 1;
    }

    if (obs.x + obs.drawWidth < 0) {
      state.obstacles.splice(i, 1);
    }
  }

  return false;
}

function drawObstacles(ctx, state) {
  state.obstacles.forEach(obs => {
    if (!obs.img || !obs.img.complete) return;

    if (obs.isAsteroid) {
      obs.rotation += obs.rotationSpeed;
      drawAsteroid(ctx, obs);
      return;
    }

    if (obs.flipY) {
      ctx.save();
      ctx.translate(Math.round(obs.x + obs.drawWidth / 2), Math.round(obs.y + obs.drawHeight / 2));
      ctx.scale(1, -1);
      ctx.drawImage(
        obs.img,
        -obs.drawWidth / 2,
        -obs.drawHeight / 2,
        obs.drawWidth,
        obs.drawHeight
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        obs.img,
        Math.round(obs.x),
        Math.round(obs.y),
        obs.drawWidth,
        obs.drawHeight
      );
    }
  });
}

function drawPlanet(ctx, planet) {
  const { x, y, size, color } = planet;
  const r = size / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.globalCompositeOperation = "multiply";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (cloudFace && cloudFace.complete) {
    ctx.drawImage(cloudFace, x - r, y - r, size, size);
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function drawAsteroid(ctx, obs) {
  const w = obs.drawWidth;
  const h = obs.drawHeight;
  const cx = obs.x + w / 2;
  const cy = obs.y + h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(obs.rotation);
  ctx.filter = "grayscale(100%) contrast(120%)";

  ctx.drawImage(
    cloudFace,
    -w / 2,
    -h / 2,
    w,
    h
  );

  ctx.filter = "none";
  ctx.restore();
}
