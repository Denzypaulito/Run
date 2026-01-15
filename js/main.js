const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });

ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverText = document.getElementById("gameOverText");
const finalScore = document.getElementById("finalScore");
const finalScoreValue = document.getElementById("finalScoreValue");
const newRecord = document.getElementById("newRecord");
const instructions = document.getElementById("instructions");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

/* ===== CARGAR SPRITES ERIKA ===== */
const runImgs = [new Image(), new Image(), new Image()];
runImgs[0].src = "Erika2.png";
runImgs[1].src = "Erika4.png";
runImgs[2].src = "Erika3.png";

const jumpImg = new Image();
jumpImg.src = "Erika4.png";

let imagesLoaded = 0;
const totalImages = 4;

function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    startBtn.disabled = false;
    startBtn.textContent = "Iniciar";
  }
}

function imageError() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    startBtn.disabled = false;
    startBtn.textContent = "Iniciar";
  }
}

runImgs[0].onload = imageLoaded;
runImgs[0].onerror = imageError;
runImgs[1].onload = imageLoaded;
runImgs[1].onerror = imageError;
runImgs[2].onload = imageLoaded;
runImgs[2].onerror = imageError;
jumpImg.onload = imageLoaded;
jumpImg.onerror = imageError;

[...runImgs, jumpImg].forEach(img => {
  img.style.imageRendering = 'pixelated';
});

startBtn.disabled = true;
startBtn.textContent = "Cargando...";

/* ===== VARIABLES ===== */
const groundY = 220;
const baseSpeed = 6;
const groundLineY = groundY + 60;

let isDayMode = true;
let groundX = 0;
let speed = baseSpeed;
let invincible = 0;
let nextObstacleFrame = 100;
let highScore = parseInt(localStorage.getItem('erikaHighScore') || '0');
let lastScoreMilestone = 0;

let player, obstacles, clouds, frame, score, gameOver, started = false;

highScoreEl.textContent = highScore.toString().padStart(5, "0");

/* ===== INIT ===== */
function init() {
  player = {
    x: 60,
    y: groundY,
    width: 40,
    height: 59,
    vy: 0,
    gravity: 0.6,
    jumpPower: -13,
    grounded: true,
    animFrame: 0
  };

  obstacles = [];
  clouds = [];
  frame = 0;
  score = 0;
  speed = baseSpeed;
  invincible = 0;
  gameOver = false;
  nextObstacleFrame = 80;
  lastScoreMilestone = 0;
  isDayMode = true;
  document.body.className = 'day';
  
  // Crear algunas nubes iniciales
  for (let i = 0; i < 3; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 60,
      width: 60 + Math.random() * 40,
      height: 20
    });
  }
}

/* ===== CONTROLES ===== */
function jump() {
  if (!started || gameOver) return;
  if (player.grounded) {
    player.vy = player.jumpPower;
    player.grounded = false;
  }
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

/* ===== BOTONES ===== */
startBtn.onclick = () => {
  menu.style.display = "none";
  started = true;
  init();
  requestAnimationFrame(gameLoop);
};

restartBtn.onclick = () => {
  menu.style.display = "none";
  gameOverText.style.display = "none";
  finalScore.style.display = "none";
  newRecord.style.display = "none";
  restartBtn.style.display = "none";
  startBtn.style.display = "block";
  instructions.style.display = "block";
  started = true;
  init();
  requestAnimationFrame(gameLoop);
};

/* ===== DIBUJAR ===== */
function drawPixelPerfect(img, x, y, w, h) {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
  }
}

/* ===== UPDATE ===== */
function update() {
  // Colores según modo
  const bgColor = isDayMode ? '#f7f7f7' : '#212121';
  const fgColor = isDayMode ? '#535353' : '#f7f7f7';
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Aceleración progresiva sin límite */
  speed = baseSpeed + Math.floor(score / 25);

  /* Cambiar de día a noche cada 700 puntos */
  const currentMilestone = Math.floor(score / 700);
  if (currentMilestone > lastScoreMilestone) {
    lastScoreMilestone = currentMilestone;
    isDayMode = !isDayMode;
    document.body.className = isDayMode ? 'day' : 'night';
  }

  /* Nubes */
  ctx.fillStyle = isDayMode ? '#ccc' : '#444';
  clouds.forEach(cloud => {
    cloud.x -= speed * 0.2;
    if (cloud.x + cloud.width < 0) {
      cloud.x = canvas.width;
      cloud.y = 30 + Math.random() * 60;
    }
    
    // Nube simple con rectángulos redondeados
    ctx.beginPath();
    ctx.arc(cloud.x + 15, cloud.y + 10, 10, 0, Math.PI * 2);
    ctx.arc(cloud.x + 30, cloud.y + 8, 13, 0, Math.PI * 2);
    ctx.arc(cloud.x + 45, cloud.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  /* Línea del suelo */
  ctx.strokeStyle = fgColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  groundX -= speed;
  if (groundX <= -20) groundX = 0;
  
  for (let x = groundX; x < canvas.width; x += 20) {
    ctx.moveTo(x, groundY + 60);
    ctx.lineTo(x + 10, groundY + 60);
  }
  ctx.stroke();

  /* Física del jugador */
  if (!player.grounded) {
    player.vy += player.gravity;
  }
  player.y += player.vy;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.grounded = true;
  }

  /* Dibujar Erika con animación */
  let img;
  if (player.grounded) {
    // Animación de correr con 3 frames
    img = runImgs[Math.floor(player.animFrame) % runImgs.length];
    player.animFrame += 0.2;
  } else {
    // Frame de salto
    img = jumpImg;
  }
  
  if (invincible > 0 && Math.floor(frame / 5) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  if (imagesLoaded === totalImages) {
    drawPixelPerfect(img, player.x, player.y, player.width, player.height);
  } else {
    // Fallback si no cargan las imágenes
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(Math.round(player.x), Math.round(player.y), player.width, player.height);
  }
  
  ctx.globalAlpha = 1;

  /* Sistema de obstáculos */
if (frame >= nextObstacleFrame) {
  const minGap = 70;

  // Evitar que aparezcan demasiado pegados
  let canSpawn = true;
  if (obstacles.length > 0) {
    const lastObs = obstacles[obstacles.length - 1];
    if (canvas.width - lastObs.x < 25) {
      canSpawn = false;
    }
  }

  if (canSpawn) {
    // ¿Pájaro o cactus?
    const isBird = score > 300 && Math.random() > 0.5;

    // ===== DOBLE / TRIPLE CACTUS =====
    const cactusCount = isBird
      ? 1
      : Math.random() < 0.6
        ? 1
        : Math.random() < 0.8
          ? 2
          : 3;

    for (let i = 0; i < cactusCount; i++) {
      obstacles.push({
        x: canvas.width + 10 + i * 26, // separación entre cactus
        y: isBird
          ? groundY - 40 - Math.random() * 30
          : groundLineY + 2, // IMPORTANTE: baseline del emoji
        width: 26,
        height: 30,
        emoji: isBird ? '🦅' : '🌵',
        passed: false,
        isBird
      });
    }

    // ===== GAP VARIABLE =====
    const baseGap = Math.max(140 - Math.floor(speed) * 10, minGap);
    const randomGap = Math.random() * 40;
    nextObstacleFrame = frame + baseGap + randomGap;

  } else {
    nextObstacleFrame = frame + 20;
  }
}


  /* Procesar obstáculos */
  ctx.font = '30px Arial';
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= speed;
    
    // Dibujar emoji
    ctx.fillText(obs.emoji, Math.round(obs.x), Math.round(obs.y));

    /* Colisión con hitbox más justa */
    const hitboxMargin = 8;

// Como el emoji usa baseline, calculamos su caja real
const obsTop = obs.y - obs.height;
const obsBottom = obs.y;

if (
  invincible <= 0 &&
  player.x + hitboxMargin < obs.x + obs.width - hitboxMargin &&
  player.x + player.width - hitboxMargin > obs.x + hitboxMargin &&
  player.y + hitboxMargin < obsBottom - hitboxMargin &&
  player.y + player.height - hitboxMargin > obsTop + hitboxMargin
) {

      gameOver = true;
      let finalScoreNum = Math.floor(score);
      let isNewRecord = finalScoreNum > highScore;
      
      if (isNewRecord) {
        highScore = finalScoreNum;
        localStorage.setItem('erikaHighScore', highScore.toString());
        highScoreEl.textContent = highScore.toString().padStart(5, "0");
      }
      
      menu.style.display = "flex";
      gameOverText.style.display = "block";
      finalScore.style.display = "block";
      finalScoreValue.textContent = finalScoreNum.toString().padStart(5, "0");
      
      if (isNewRecord) {
        newRecord.style.display = "block";
      }
      
      restartBtn.style.display = "block";
      startBtn.style.display = "none";
      instructions.style.display = "none";
      break;
    }

    /* Puntos por pasar obstáculo */
    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
      score += obs.isBird ? 2 : 1;
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }

  if (invincible > 0) invincible--;

  /* Actualizar score */
  score += 0.1;
  scoreEl.textContent = Math.floor(score).toString().padStart(5, "0");

  frame++;
}

/* ===== LOOP ===== */
function gameLoop() {
  if (!started) return;
  update();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

// Prevenir gestos en móviles
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());