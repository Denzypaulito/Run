import { runImgs } from "./assets.js";

export function createPlayer(groundY) {
  return {
    x: 60,
    y: groundY,
    width: 40,
    height: 59,
    vy: 0,
    gravity: 0.6,
    jumpPower: -13,
    grounded: true,
    animFrame: 0,
    animSpeed: 0.25
  };
}

export function updatePlayer(player, groundY, dt) {
  if (!player.grounded) {
    player.vy += player.gravity * dt;
  }

  player.y += player.vy * dt;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.grounded = true;
  }

  if (player.grounded) {
    player.animFrame += player.animSpeed * dt;
    if (player.animFrame >= runImgs.length) {
      player.animFrame = 0;
    }
  }
}

export function drawPlayer(ctx, player, spritesReady) {
  if (!spritesReady) {
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    return;
  }

  let img;

  if (player.grounded) {
    img = runImgs[Math.floor(player.animFrame)];
  } else {
    const frame = Math.floor(player.animFrame) % runImgs.length;
    const distTo3 = Math.abs(frame - 2);
    const distTo7 = Math.abs(frame - 6);
    img = distTo3 <= distTo7 ? runImgs[2] : runImgs[6];
  }

  ctx.drawImage(
    img,
    Math.round(player.x),
    Math.round(player.y),
    player.width,
    player.height
  );
}

export function playerJump(player) {
  if (player.grounded) {
    player.vy = player.jumpPower;
    player.grounded = false;
  }
}
