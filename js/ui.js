// js/ui.js
import {
  submitScore,
  getTopScores,
  getMyRank,
  getFullLeaderboard,
  getTableForMode
} from "./leaderboard.js";

/* ===== ELEMENTOS ===== */

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const gameTitle = document.getElementById("gameTitle");
const gameOverText = document.getElementById("gameOverText");
const finalScore = document.getElementById("finalScore");
const finalScoreValue = document.getElementById("finalScoreValue");
const newRecord = document.getElementById("newRecord");
const instructions = document.getElementById("instructions");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

const gameSelect = document.getElementById("gameSelect");
const selectRunBtn = document.getElementById("selectRunBtn");
const selectFlappyBtn = document.getElementById("selectFlappyBtn");
const selectGravityBtn = document.getElementById("selectGravityBtn");

const playModeSelect = document.getElementById("playModeSelect");
const singleModeBtn = document.getElementById("singleModeBtn");
const multiModeBtn = document.getElementById("multiModeBtn");

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

const multiNameModal = document.getElementById("multiNameModal");
const player1NameInput = document.getElementById("player1NameInput");
const player2NameInput = document.getElementById("player2NameInput");
const startMultiBtn = document.getElementById("startMultiBtn");

const winnerBox = document.getElementById("winnerBox");
const winnerText = document.getElementById("winnerText");

const loader = document.getElementById("loader");

/* ===== LOCAL STORAGE ===== */

const highScores = {
  run: Number(localStorage.getItem("erikaHighScore")) || 0,
  flappy: Number(localStorage.getItem("flappyHighScore")) || 0,
  gravity: Number(localStorage.getItem("gravityHighScore")) || 0
};
let savedName = localStorage.getItem("erikaPlayerName") || "";
let currentMode = "run";
let playMode = "single";

function sanitizePlayerName(raw, fallback) {
  const name = (raw || "").trim();
  if (!name) return fallback;
  return name.replace(/[^a-zA-Z0-9 _-]/g, "").substring(0, 12);
}

function updateHighScoreDisplay() {
  highScoreEl.textContent = highScores[currentMode].toString().padStart(5, "0");
}

updateHighScoreDisplay();
document.body.classList.add("menu-demo");

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

export function onBackToMenu(cb) {
  backToMenuBtn.onclick = cb;
}

export function onSelectPlayMode(cb) {
  singleModeBtn.onclick = () => cb("single");
  multiModeBtn.onclick = () => cb("multi");
}

export function onSelectGame(cb) {
  selectRunBtn.onclick = () => cb("run");
  selectFlappyBtn.onclick = () => cb("flappy");
  selectGravityBtn.onclick = () => cb("gravity");
}

export function setGameMode(mode) {
  currentMode = mode;

  if (mode === "run") {
    gameTitle.textContent = "ERIKA RUN";
    instructions.textContent = "Presiona ESPACIO o toca para saltar";
    document.body.classList.remove("space", "night");
    document.body.classList.add("day");
  } else if (mode === "flappy") {
    gameTitle.textContent = "FLAPPY ERIKA";
    instructions.textContent = "Presiona ESPACIO o toca para volar";
    document.body.classList.remove("space", "night");
    document.body.classList.add("day");
  } else {
    gameTitle.textContent = "ERIKA GRAVITY";
    instructions.textContent = "Presiona ESPACIO o toca para invertir gravedad";
    document.body.classList.remove("day", "night");
    document.body.classList.add("space");
  }

  selectRunBtn.classList.toggle("active", mode === "run");
  selectFlappyBtn.classList.toggle("active", mode === "flappy");
  selectGravityBtn.classList.toggle("active", mode === "gravity");
  updateHighScoreDisplay();
}

export function getGameMode() {
  return currentMode;
}

export function setPlayMode(mode) {
  playMode = mode;
  singleModeBtn.classList.toggle("active", mode === "single");
  multiModeBtn.classList.toggle("active", mode === "multi");
}

export function getPlayMode() {
  return playMode;
}

export function showMultiNameModal() {
  multiNameModal.style.display = "flex";
  player1NameInput.value = localStorage.getItem("player1Name") || "";
  player2NameInput.value = localStorage.getItem("player2Name") || "";
  player1NameInput.focus();
}

export function hideMultiNameModal() {
  multiNameModal.style.display = "none";
}

export function getMultiNames() {
  const name1 = sanitizePlayerName(localStorage.getItem("player1Name"), "Jugador 1");
  const name2 = sanitizePlayerName(localStorage.getItem("player2Name"), "Jugador 2");
  return [name1, name2];
}

export function saveMultiNamesFromInputs() {
  const name1 = sanitizePlayerName(player1NameInput.value, "Jugador 1");
  const name2 = sanitizePlayerName(player2NameInput.value, "Jugador 2");

  localStorage.setItem("player1Name", name1);
  localStorage.setItem("player2Name", name2);

  return [name1, name2];
}

export function onSubmitMultiNames(cb) {
  startMultiBtn.onclick = () => {
    const [name1, name2] = saveMultiNamesFromInputs();
    hideMultiNameModal();
    cb(name1, name2);
  };
}

export function showMatchOver(text) {
  menu.style.display = "flex";
  gameOverText.textContent = "FIN DE LA PARTIDA";
  gameOverText.style.display = "block";
  finalScore.style.display = "none";
  newRecord.style.display = "none";
  instructions.style.display = "none";
  gameSelect.style.display = "none";
  playModeSelect.style.display = "none";

  leaderboardBox.style.display = "none";
  fullLeaderboardBox.style.display = "none";
  loader.style.display = "none";
  myRankText.style.display = "none";
  nameModal.style.display = "none";
  multiNameModal.style.display = "none";

  winnerText.textContent = text;
  winnerBox.style.display = "block";

  restartBtn.style.display = "block";
  backToMenuBtn.style.display = "block";
  startBtn.style.display = "none";

  document.body.classList.remove("menu-demo");
  document.body.classList.add("game-over");
}

/* ===== MENÚ ===== */

export function hideMenu() {
  menu.style.display = "none";
  gameSelect.style.display = "none";
  playModeSelect.style.display = "none";
  leaderboardBox.style.display = "none";
  fullLeaderboardBox.style.display = "none";
  nameModal.style.display = "none";
  multiNameModal.style.display = "none";
  loader.style.display = "none";
  myRankText.style.display = "none";
  winnerBox.style.display = "none";
  document.body.classList.remove("menu-demo");
  document.body.classList.remove("game-over");
}

export function resetMenu() {
  menu.style.display = "flex";
  gameOverText.style.display = "none";
  gameOverText.textContent = "GAME OVER";
  finalScore.style.display = "none";
  newRecord.style.display = "none";
  restartBtn.style.display = "none";
  backToMenuBtn.style.display = "none";
  startBtn.style.display = "block";
  instructions.style.display = "block";
  finalScoreValue.textContent = "00000";
  gameSelect.style.display = "flex";
  playModeSelect.style.display = "flex";

  leaderboardBox.style.display = "none";
  fullLeaderboardBox.style.display = "none";
  nameModal.style.display = "none";
  multiNameModal.style.display = "none";
  loader.style.display = "none";
  myRankText.style.display = "none";
  winnerBox.style.display = "none";
  document.body.classList.add("menu-demo");
  document.body.classList.remove("game-over");
}

/* ===== GAME OVER ===== */

export function showGameOver(score, mode = currentMode) {
  currentMode = mode;
  const table = getTableForMode(currentMode);
  const finalScoreNum = Math.floor(score);
  const isNewRecord = finalScoreNum > highScores[currentMode];

  if (isNewRecord) {
    highScores[currentMode] = finalScoreNum;

    if (currentMode === "run") {
      localStorage.setItem("erikaHighScore", finalScoreNum.toString());
    } else if (currentMode === "flappy") {
      localStorage.setItem("flappyHighScore", finalScoreNum.toString());
    } else {
      localStorage.setItem("gravityHighScore", finalScoreNum.toString());
    }

    updateHighScoreDisplay();
    newRecord.style.display = "block";
  } else {
    newRecord.style.display = "none";
  }

  finalScoreValue.textContent = finalScoreNum.toString().padStart(5, "0");

  menu.style.display = "flex";
  gameOverText.style.display = "block";
  finalScore.style.display = "block";

  restartBtn.style.display = "none";
  backToMenuBtn.style.display = "block";
  startBtn.style.display = "none";
  instructions.style.display = "none";
  gameSelect.style.display = "none";
  playModeSelect.style.display = "none";

  leaderboardBox.style.display = "none";
  fullLeaderboardBox.style.display = "none";
  loader.style.display = "none";
  myRankText.style.display = "none";
  multiNameModal.style.display = "none";
  winnerBox.style.display = "none";
  document.body.classList.remove("menu-demo");
  document.body.classList.add("game-over");

  /* ===============================
     👉 SOLO SI ES NUEVO RÉCORD
  =============================== */

  if (isNewRecord) {
    nameModal.style.display = "flex";
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

      await submitScore(name, finalScoreNum, table);

    // pequeño buffer para evitar latencia fantasma
    await new Promise(r => setTimeout(r, 250));
        
    const [scores, myRank] = await Promise.all([
      getTopScores(table),
      getMyRank(finalScoreNum, table)
    ]);

      finishLeaderboard(scores, myRank, name, finalScoreNum);
    };

  } else {
    /* ===============================
       👉 SI NO ES NUEVO RÉCORD
    =============================== */

    loader.style.display = "flex";

    Promise.all([
      getTopScores(table),
      getMyRank(finalScoreNum, table)
    ]).then(([scores, myRank]) => {
      finishLeaderboard(scores, myRank, savedName, finalScoreNum);
    });
  }
}

/* ===== SCORE ===== */

export function updateScore(score) {
  scoreEl.textContent = Math.floor(score).toString().padStart(5, "0");
}

/* ===== FINALIZA LEADERBOARD ===== */

function finishLeaderboard(scores, myRank, myName, myScore) {
  drawLeaderboard(scores, myName, myScore);

  if (myRank > 10) {
    myRankText.textContent = `No entraste al top 10 — quedaste en el puesto #${myRank}`;
    myRankText.style.display = "block";
  } else {
    myRankText.style.display = "none";
  }

  loader.style.display = "none";
  leaderboardBox.style.display = "block";
  restartBtn.style.display = "block";
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

  const scores = await getFullLeaderboard(100, getTableForMode(currentMode));
  drawFullLeaderboard(scores);

  loader.style.display = "none";
  fullLeaderboardBox.style.display = "block";
};

closeFullLbBtn.onclick = () => {
  fullLeaderboardBox.style.display = "none";
  leaderboardBox.style.display = "block";
  if (myRankText.textContent) myRankText.style.display = "block";
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
