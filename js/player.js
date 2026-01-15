import { runImgs } from "./assets.js";

/* ===== CREATE ===== */

export function createPlayer(groundY) {
  return {
    x: 60,
    y: groundY,
    baseY: groundY,

    width: 40,
    height: 59,
    normalHeight: 59,
    crouchHeight: 35,

    vy: 0,
    gravity: 0.6,
    jumpPower: -13,
    grounded: true,

    animFrame: 0,
    animSpeed: 0.12,
    isCrouching: false,

    fastFall: false,
    fastFallMultiplier: 2.5
  };
}

/* ===== UPDATE ===== */

export function updatePlayer(player, groundY, dt, worldSpeed = 6) {

  /* --- FÍSICA --- */
  if (!player.grounded) {
    const g = player.fastFall
      ? player.gravity * player.fastFallMultiplier
      : player.gravity;

    player.vy += g * dt;
  }

  player.y += player.vy * dt;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.grounded = true;
    player.fastFall = false;
  }

  /* --- LIMBO REAL (solo en el suelo) --- */
  if (player.grounded) {
    if (player.isCrouching) {
      player.height = player.crouchHeight;
      player.y = groundY + (player.normalHeight - player.crouchHeight);
    } else {
      player.height = player.normalHeight;
      player.y = groundY;
    }
  }

  /* --- ANIMACIÓN --- */
  if (player.grounded && !player.isCrouching) {
    const speedFactor = 0.6 + worldSpeed / 10;
    player.animFrame += player.animSpeed * speedFactor * dt;

    if (player.animFrame >= runImgs.length) {
      player.animFrame = 0;
    }
  }
}

/* ===== DRAW ===== */

export function drawPlayer(ctx, player, spritesReady) {

  let img;

  if (player.grounded) {
    img = runImgs[Math.floor(player.animFrame)];
  } else {
    const frame = Math.floor(player.animFrame) % runImgs.length;
    const distTo3 = Math.abs(frame - 2);
    const distTo7 = Math.abs(frame - 6);
    img = distTo3 <= distTo7 ? runImgs[2] : runImgs[6];
  }

  if (spritesReady && img.complete) {
    ctx.drawImage(
      img,
      Math.round(player.x),
      Math.round(player.y),
      player.width,
      player.height
    );
  } else {
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

/* ===== ACTIONS ===== */

export function playerJump(player) {
  if (player.grounded && !player.isCrouching) {
    player.vy = player.jumpPower;
    player.grounded = false;
  }
}

export function playerCrouch(player, isDown) {

  // 🪂 en el aire → caída rápida
  if (!player.grounded) {
    player.fastFall = isDown;
    return;
  }

  // 🧎 en el suelo → limbo
  player.isCrouching = isDown;
}
