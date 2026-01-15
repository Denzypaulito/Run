// js/ui.js
import { submitScore, getTopScores } from "./leaderboard.js";

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

const leaderboardBox = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");

let highScore = Number(localStorage.getItem("erikaHighScore")) || 0;
let savedName = localStorage.getItem("erikaPlayerName") || "";

highScoreEl.textContent = highScore.toString().padStart(5, "0");

/* ===== BOTONES ===== */

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

/* ===== MENÚ ===== */

export function hideMenu() {
  menu.style.display = "none";
  leaderboardBox.style.display = "none";
}

export function resetMenu() {
  gameOverText.style.display = "none";
  finalScore.style.display = "none";
  newRecord.style.display = "none";
  restartBtn.style.display = "none";
  startBtn.style.display = "block";
  instructions.style.display = "block";
  finalScoreValue.textContent = "00000";
  leaderboardBox.style.display = "none";
}

/* ===== GAME OVER ===== */

export async function showGameOver(score) {
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

  // ✍️ pedir nombre
  let name = prompt("Ingresa tu nombre (máx 12):", savedName || "Player");

  if (!name) name = "Anon";
  name = name.replace(/[^a-zA-Z0-9 _-]/g, "").substring(0, 12);

  localStorage.setItem("erikaPlayerName", name);
  savedName = name;

  // 🌍 enviar score
  await submitScore(name, finalScoreNum);

  // 🏆 traer leaderboard
  const scores = await getTopScores();
  drawLeaderboard(scores, name, finalScoreNum);

  // 📋 mostrar menú
  menu.style.display = "flex";
  gameOverText.style.display = "block";
  finalScore.style.display = "block";
  finalScoreValue.textContent = finalScoreNum.toString().padStart(5, "0");

  restartBtn.style.display = "block";
  startBtn.style.display = "none";
  instructions.style.display = "none";
  leaderboardBox.style.display = "block";
}

/* ===== SCORE ===== */

export function updateScore(score) {
  scoreEl.textContent = Math.floor(score).toString().padStart(5, "0");
}

/* ===== LEADERBOARD ===== */

function drawLeaderboard(scores, myName, myScore) {
  leaderboardList.innerHTML = "";

  scores.forEach((row, i) => {
    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    const scoreSpan = document.createElement("span");

    nameSpan.textContent = `${i + 1}. ${row.name}`;
    scoreSpan.textContent = row.score.toString().padStart(5, "0");

    if (row.name === myName && row.score === myScore) {
      li.style.fontWeight = "bold";
      li.style.color = "#ff4d4d";
    }

    li.appendChild(nameSpan);
    li.appendChild(scoreSpan);
    leaderboardList.appendChild(li);
  });
}
