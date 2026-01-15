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

  // ⏳ intervalo base con más variación
  let base = Math.max(95 - speed * 3, 55);
  let randomExtra = Math.random() * 40; // 🎲 variación
  let spawnInterval = base + randomExtra;

  if (obstacleTimer < spawnInterval) {
    state.obstacleTimer = obstacleTimer;
    return;
  }

  obstacleTimer = 0;

  const isBird = score > 350 && Math.random() > 0.55;

  // 🌵 patrón de cactus más natural
  const patternRoll = Math.random();

  let cactusCount = 1;

  if (!isBird) {
    if (patternRoll < 0.65) cactusCount = 1;       // la mayoría solos
    else if (patternRoll < 0.9) cactusCount = 2;   // a veces dobles
    else cactusCount = 3;                          // raros triples
  }

  // 🎯 separación variable entre cactus
  let separation = 22 + Math.random() * 14;

  for (let i = 0; i < cactusCount; i++) {
    obstacles.push({
      x: canvas.width + 10 + i * separation,
      y: isBird
        ? groundY - 40 - Math.random() * 35
        : groundLineY + 2,
      width: 26,
      height: 30,
      emoji: isBird ? "🦅" : "🌵",
      passed: false,
      isBird
    });
  }

  state.obstacleTimer = obstacleTimer;
}


export function updateAndDrawObstacles(state, ctx, player, onGameOver) {
  const { obstacles, speed, dt } = state;

  ctx.font = "30px Arial";

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= speed * dt;

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
