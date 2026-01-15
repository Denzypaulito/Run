// js/world.js

import { cloudFace } from "./assets.js";

/* ===== CREAR MUNDO ===== */

export function createWorld() {
  return {
    isDayMode: true,
    speed: 6,
    baseSpeed: 6,
    lastScoreMilestone: 0,
    clouds: []
  };
}

/* ===== INIT ===== */

export function initWorld(world, canvas) {
  world.isDayMode = true;
  world.speed = world.baseSpeed;
  world.lastScoreMilestone = 0;
  world.clouds = [];

  document.body.className = "day";

  for (let i = 0; i < 4; i++) {
    world.clouds.push(createCloud(canvas));
  }
}

function createCloud(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: 20 + Math.random() * 80,
    size: 18 + Math.random() * 22,
    speed: 0.12 + Math.random() * 0.18
  };
}

/* ===== UPDATE ===== */

export function updateWorld(world, score) {
  world.speed = world.baseSpeed + Math.floor(score / 25);

  const currentMilestone = Math.floor(score / 700);
  if (currentMilestone > world.lastScoreMilestone) {
    world.lastScoreMilestone = currentMilestone;
    world.isDayMode = !world.isDayMode;
    document.body.className = world.isDayMode ? "day" : "night";
  }
}

/* ===== DRAW ===== */

export function drawWorld(ctx, canvas, world, groundY, dt) {
  const bgColor = world.isDayMode ? "#f7f7f7" : "#212121";
  const fgColor = world.isDayMode ? "#535353" : "#f7f7f7";

  /* ===== FONDO ===== */

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* ===== NUBES (CARA ERIKA) ===== */

  world.clouds.forEach(cloud => {
    cloud.x -= world.speed * cloud.speed * dt;

    if (cloud.x + cloud.size < 0) {
      Object.assign(cloud, createCloud(canvas), {
        x: canvas.width + Math.random() * 40
      });
    }

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

  const groundLevel = groundY + 60;

  /* ===== SOMBRA DEL SUELO ===== */

  const grad = ctx.createLinearGradient(0, groundLevel, 0, groundLevel + 14);
  grad.addColorStop(0, "rgba(0,0,0,0.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, groundLevel, canvas.width, 14);

  /* ===== LINEA DE SUELO ===== */

  ctx.strokeStyle = fgColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundLevel);
  ctx.lineTo(canvas.width, groundLevel);
  ctx.stroke();
}
