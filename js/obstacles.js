import { cactusImgs, birdImgs } from "./assets.js";

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ===== SPAWN ===== */

export function spawnObstacles(state) {
  let {
    obstacles,
    canvas,
    groundY,
    groundLineY,
    speed,
    score,
    dt,
    obstacleTimer
  } = state;

  obstacleTimer += dt;

  // ⏳ intervalo más natural (menos absurdo)
  let base = Math.max(115 - speed * 3.5, 70);
  let randomExtra = Math.random() * 60;
  let spawnInterval = base + randomExtra;

  if (obstacleTimer < spawnInterval) {
    state.obstacleTimer = obstacleTimer;
    return;
  }

  obstacleTimer = 0;

  const isBird = score > 300 && Math.random() > 0.55;

  // 🌵 patrón orgánico de cactus
  const roll = Math.random();
  let count = 1;

  if (!isBird) {
    if (roll < 0.7) count = 1;
    else if (roll < 0.92) count = 2;
    else count = 3;
  }

  // 🎯 separación variable
  let separation = 28 + Math.random() * 22;

  for (let i = 0; i < count; i++) {
    const img = isBird
      ? randomFrom(birdImgs)
      : randomFrom(cactusImgs);

    let y;

    if (isBird) {
      const hRoll = Math.random();

      if (hRoll < 0.33) {
        // 🔴 ALTO → salto largo
        y = groundY - 95 - Math.random() * 20;

      } else if (hRoll < 0.66) {
        // 🟡 MEDIO → LIMBO CLARO 🔥
        y = groundY - 48 - Math.random() * 10;

      } else {
        // 🟢 BAJO → salto corto
        y = groundY - 18 - Math.random() * 8;
      }

    } else {
      // cactus normal
      y = groundLineY - 42;
    }

    obstacles.push({
      x: canvas.width + 10 + i * separation,
      y,
      baseSize: 40,
      img,
      passed: false,
      isBird,
      drawWidth: 40,
      drawHeight: 40
    });
  }

  state.obstacleTimer = obstacleTimer;
}

/* ===== UPDATE + DRAW ===== */

export function updateAndDrawObstacles(state, ctx, player, onGameOver) {
  const { obstacles, speed, dt } = state;

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= speed * dt;

    if (obs.img && obs.img.complete) {
      const ratio = obs.img.naturalWidth / obs.img.naturalHeight;

      obs.drawHeight = obs.baseSize;
      obs.drawWidth = obs.drawHeight * ratio;

      ctx.drawImage(
        obs.img,
        Math.round(obs.x),
        Math.round(obs.y),
        obs.drawWidth,
        obs.drawHeight
      );
    }

    const hitboxMargin = 8;

    if (
      player.x + hitboxMargin < obs.x + obs.drawWidth - hitboxMargin &&
      player.x + player.width - hitboxMargin > obs.x + hitboxMargin &&
      player.y + hitboxMargin < obs.y + obs.drawHeight - hitboxMargin &&
      player.y + player.height - hitboxMargin > obs.y + hitboxMargin
    ) {
      onGameOver();
      return;
    }

    if (!obs.passed && obs.x + obs.drawWidth < player.x) {
      obs.passed = true;
      state.score += obs.isBird ? 2 : 1;
    }

    if (obs.x + obs.drawWidth < 0) {
      obstacles.splice(i, 1);
    }
  }
}
