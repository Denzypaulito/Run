// js/ui.js
import {
  submitScore,
  getTopScores,
  getMyRank,
  getFullLeaderboard
} from "./leaderboard.js";

/* ===== ELEMENTOS ===== */

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
const myRankText = document.getElementById("myRankText");

const openFullLbBtn = document.getElementById("openFullLbBtn");

const fullLeaderboardBox = document.getElementById("fullLeaderboard");
const fullLeaderboardList = document.getElementById("fullLeaderboardList");
const closeFullLbBtn = document.getElementById("closeFullLbBtn");

const nameModal = document.getElementById("nameModal");
const nameInput = document.getElementById("playerNameInput");
const submitNameBtn = document.getElementById("submitNameBtn");

const loader = document.getElementById("loader");

/* ===== LOCAL STORAGE ===== */

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
  fullLeaderboardBox.style.display = "none";
  nameModal.style.display = "none";
  loader.style.display = "none";
  myRankText.style.display = "none";
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
  fullLeaderboardBox.style.display = "none";
  nameModal.style.display = "none";
  loader.style.display = "none";
  myRankText.style.display = "none";
}

/* ===== GAME OVER ===== */

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

  finalScoreValue.textContent = finalScoreNum.toString().padStart(5, "0");

  menu.style.display = "flex";
  gameOverText.style.display = "block";
  finalScore.style.display = "block";

  restartBtn.style.display = "none";
  startBtn.style.display = "none";
  instructions.style.display = "none";

  nameModal.style.display = "flex";
  leaderboardBox.style.display = "none";
  fullLeaderboardBox.style.display = "none";
  loader.style.display = "none";
  myRankText.style.display = "none";

  nameInput.value = savedName || "";
  nameInput.focus();

  submitNameBtn.onclick = async () => {
    let name = nameInput.value.trim();

    if (!name) name = "Anon";
    name = name.replace(/[^a-zA-Z0-9 _-]/g, "").substring(0, 12);

    localStorage.setItem("erikaPlayerName", name);
    savedName = name;

    nameModal.style.display = "none";
    loader.style.display = "flex";

    const [_, scores, myRank] = await Promise.all([
      submitScore(name, finalScoreNum),
      getTopScores(),
      getMyRank(finalScoreNum)
    ]);

    drawLeaderboard(scores, name, finalScoreNum);

    if (myRank > 10) {
      myRankText.textContent = `No entraste al top 10 — quedaste en el puesto #${myRank}`;
      myRankText.style.display = "block";
    } else {
      myRankText.style.display = "none";
    }

    loader.style.display = "none";
    leaderboardBox.style.display = "block";
    restartBtn.style.display = "block";
  };
}

/* ===== SCORE ===== */

export function updateScore(score) {
  scoreEl.textContent = Math.floor(score).toString().padStart(5, "0");
}

/* ===== TOP 10 ===== */

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

  openFullLbBtn.style.display = "block";
}

/* ===== FULL LEADERBOARD ===== */

openFullLbBtn.onclick = async () => {
  leaderboardBox.style.display = "none";
  myRankText.style.display = "none";
  loader.style.display = "flex";

  const scores = await getFullLeaderboard(100);
  drawFullLeaderboard(scores);

  loader.style.display = "none";
  fullLeaderboardBox.style.display = "block";
};

closeFullLbBtn.onclick = () => {
  fullLeaderboardBox.style.display = "none";
  leaderboardBox.style.display = "block";
  myRankText.style.display = "block";
};

function drawFullLeaderboard(scores) {
  fullLeaderboardList.innerHTML = "";

  scores.forEach((row, i) => {
    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    const scoreSpan = document.createElement("span");

    nameSpan.textContent = `${i + 1}. ${row.name}`;
    scoreSpan.textContent = row.score.toString().padStart(5, "0");

    li.appendChild(nameSpan);
    li.appendChild(scoreSpan);
    fullLeaderboardList.appendChild(li);
  });
}
