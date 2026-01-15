/* ===== CARGAR SPRITES ERIKA ===== */

export const runImgs = [new Image(), new Image(), new Image()];
runImgs[0].src = "Erika2.png";
runImgs[1].src = "Erika4.png";
runImgs[2].src = "Erika3.png";

export const jumpImg = new Image();
jumpImg.src = "Erika4.png";

let imagesLoaded = 0;
const totalImages = 4;

export function loadSprites(onReady) {
  function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) onReady();
  }

  function imageError() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) onReady();
  }

  runImgs.forEach(img => {
    img.onload = imageLoaded;
    img.onerror = imageError;
    img.style.imageRendering = "pixelated";
  });

  jumpImg.onload = imageLoaded;
  jumpImg.onerror = imageError;
  jumpImg.style.imageRendering = "pixelated";
}
