const SUPABASE_URL = "https://jdwlazogftqwjhdvahyl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkd2xhem9nZnRxd2poZHZhaHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NTU4NjMsImV4cCI6MjA4NDAzMTg2M30.lFLaTzz5DKrjtHRMXBUQC9xCiB5X65tSsdUp9r0hBng";

const TABLE = "scores";

/* ===== SUBIR SCORE ===== */

export async function submitScore(name, score) {
  score = Math.floor(score);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation" // 👈 IMPORTANTE
    },
    body: JSON.stringify({ name, score })
  });

  if (!res.ok) {
    console.warn("Error guardando score");
    return null;
  }

  return await res.json(); // 👈 esperamos confirmación real
}


/* ===== TOP 10 ===== */

export async function getTopScores() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=name,score&order=score.desc&limit=10`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return await res.json();
  } catch (err) {
    console.warn("Leaderboard fetch error:", err);
    return [];
  }
}

/* ===== RANK GLOBAL ===== */

export async function getMyRank(score) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=id&score=gt.${score}`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "count=exact"
        }
      }
    );

    const count = res.headers.get("content-range")?.split("/")[1] || 0;
    return Number(count) + 1;

  } catch (err) {
    console.warn("Rank error:", err);
    return null;
  }
}

export async function getFullLeaderboard(limit = 100) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=name,score&order=score.desc&limit=${limit}`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return await res.json();
  } catch {
    return [];
  }
}


