// js/assets.js

/* ===== ERIKA (8 sprites) ===== */

export const runImgs = [];
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `Erikas${i}.png`;
  img.style.imageRendering = "pixelated";
  runImgs.push(img);
}

/* ===== OBSTÁCULOS ===== */

export const cactusImgs = [];
for (let i = 1; i <= 3; i++) {
  const img = new Image();
  img.src = `Cactus${i}.png`;
  img.style.imageRendering = "pixelated";
  cactusImgs.push(img);
}

export const birdImgs = [];
for (let i = 1; i <= 2; i++) {
  const img = new Image();
  img.src = `Bird${i}.png`;
  img.style.imageRendering = "pixelated";
  birdImgs.push(img);
}

export const flappyBirdImg = birdImgs[0];

/* ===== NUBE (CARA ERIKA) ===== */

export const cloudFace = new Image();
cloudFace.src = "ErikaFace.png"; // 👉 nombre exacto de tu archivo
cloudFace.style.imageRendering = "pixelated";

/* ===== LOADER ===== */

let imagesLoaded = 0;
const totalImages =
  runImgs.length +
  cactusImgs.length +
  birdImgs.length +
  1; // 👈 cloudFace

export function loadSprites(onReady) {
  function done() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) onReady();
  }

  [...runImgs, ...cactusImgs, ...birdImgs, cloudFace].forEach(img => {
    img.onload = done;
    img.onerror = done;
  });
}
