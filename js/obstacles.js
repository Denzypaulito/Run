// js/obstacles.js

export function spawnObstacles(state) {
  const {
    obstacles,
    canvas,
    groundY,
    groundLineY,
    speed,
    score,
    frame
  } = state;

  if (frame < state.nextObstacleFrame) return;

  const minGap = 70;

  let canSpawn = true;
  if (obstacles.length > 0) {
    const lastObs = obstacles[obstacles.length - 1];
    if (canvas.width - lastObs.x < 25) canSpawn = false;
  }

  if (canSpawn) {
    const isBird = score > 300 && Math.random() > 0.5;

    const cactusCount = isBird
      ? 1
      : Math.random() < 0.6
        ? 1
        : Math.random() < 0.8
          ? 2
          : 3;

    for (let i = 0; i < cactusCount; i++) {
      obstacles.push({
        x: canvas.width + 10 + i * 26,
        y: isBird
          ? groundY - 40 - Math.random() * 30
          : groundLineY + 2,
        width: 26,
        height: 30,
        emoji: isBird ? "🦅" : "🌵",
        passed: false,
        isBird
      });
    }

    const baseGap = Math.max(140 - Math.floor(speed) * 10, minGap);
    state.nextObstacleFrame = frame + baseGap + Math.random() * 40;
  } else {
    state.nextObstacleFrame = frame + 20;
  }
}

export function updateAndDrawObstacles(state, ctx, player, onGameOver) {
  const { obstacles, speed } = state;

  ctx.font = "30px Arial";

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= speed;

    ctx.fillText(obs.emoji, Math.round(obs.x), Math.round(obs.y));

    const hitboxMargin = 8;
    const obsTop = obs.y - obs.height;
    const obsBottom = obs.y;

    if (
      player.x + hitboxMargin < obs.x + obs.width - hitboxMargin &&
      player.x + player.width - hitboxMargin > obs.x + hitboxMargin &&
      player.y + hitboxMargin < obsBottom - hitboxMargin &&
      player.y + player.height - hitboxMargin > obsTop + hitboxMargin
    ) {
      onGameOver();
      return;
    }

    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
      state.score += obs.isBird ? 2 : 1;
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }
}
