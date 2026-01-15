// js/assets.js

export const runImgs = [];
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `Erikas${i}.png`;
  img.style.imageRendering = "pixelated";
  runImgs.push(img);
}

let imagesLoaded = 0;
const totalImages = runImgs.length;

export function loadSprites(onReady) {
  function done() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) onReady();
  }

  runImgs.forEach(img => {
    img.onload = done;
    img.onerror = done;
  });
}
