// js/ui.js

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

let highScore = parseInt(localStorage.getItem("erikaHighScore") || "0");
highScoreEl.textContent = highScore.toString().padStart(5, "0");

export function setLoading() {
  startBtn.disabled = true;
  startBtn.textContent = "Cargando...";
}

export function setReady() {
  startBtn.disabled = false;
  startBtn.textContent = "Iniciar";
}

export function onStart(cb) {
  startBtn.onclick = cb;
}

export function onRestart(cb) {
  restartBtn.onclick = cb;
}

export function hideMenu() {
  menu.style.display = "none";
}

export function resetMenu() {
  gameOverText.style.display = "none";
  finalScore.style.display = "none";
  newRecord.style.display = "none";
  restartBtn.style.display = "none";
  startBtn.style.display = "block";
  instructions.style.display = "block";
}

export function showGameOver(score) {
  const finalScoreNum = Math.floor(score);
  const isNewRecord = finalScoreNum > highScore;

  if (isNewRecord) {
    highScore = finalScoreNum;
    localStorage.setItem("erikaHighScore", highScore.toString());
    highScoreEl.textContent = highScore.toString().padStart(5, "0");
    newRecord.style.display = "block";
  } else {
    newRecord.style.display = "none";
  }

  menu.style.display = "flex";
  gameOverText.style.display = "block";
  finalScore.style.display = "block";
  finalScoreValue.textContent = finalScoreNum.toString().padStart(5, "0");

  restartBtn.style.display = "block";
  startBtn.style.display = "none";
  instructions.style.display = "none";
}

export function updateScore(score) {
  scoreEl.textContent = Math.floor(score).toString().padStart(5, "0");
}
