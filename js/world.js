export function createWorld() {
  return {
    isDayMode: true,
    speed: 6,
    baseSpeed: 6,
    lastScoreMilestone: 0,
    clouds: []
  };
}

export function initWorld(world, canvas) {
  world.isDayMode = true;
  world.speed = world.baseSpeed;
  world.lastScoreMilestone = 0;
  world.clouds = [];

  document.body.className = "day";

  for (let i = 0; i < 3; i++) {
    world.clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 60,
      width: 60 + Math.random() * 40,
      height: 20
    });
  }
}

export function updateWorld(world, score) {
  world.speed = world.baseSpeed + Math.floor(score / 25);

  const currentMilestone = Math.floor(score / 700);
  if (currentMilestone > world.lastScoreMilestone) {
    world.lastScoreMilestone = currentMilestone;
    world.isDayMode = !world.isDayMode;
    document.body.className = world.isDayMode ? "day" : "night";
  }
}

export function drawWorld(ctx, canvas, world, groundY, dt) {
  const bgColor = world.isDayMode ? "#f7f7f7" : "#212121";
  const fgColor = world.isDayMode ? "#535353" : "#f7f7f7";

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* ===== NUBES ===== */
  ctx.fillStyle = world.isDayMode ? "#ccc" : "#444";

  world.clouds.forEach(cloud => {
    cloud.x -= world.speed * 0.2 * dt;

    if (cloud.x + cloud.width < 0) {
      cloud.x = canvas.width;
      cloud.y = 30 + Math.random() * 60;
    }

    ctx.beginPath();
    ctx.arc(cloud.x + 15, cloud.y + 10, 10, 0, Math.PI * 2);
    ctx.arc(cloud.x + 30, cloud.y + 8, 13, 0, Math.PI * 2);
    ctx.arc(cloud.x + 45, cloud.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  const groundLevel = groundY + 60;

  /* ===== SOMBRA ===== */
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
