const SUPABASE_URL = "https://jdwlazogftqwjhdvahyl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkd2xhem9nZnRxd2poZHZhaHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NTU4NjMsImV4cCI6MjA4NDAzMTg2M30.lFLaTzz5DKrjtHRMXBUQC9xCiB5X65tSsdUp9r0hBng";

const TABLE = "scores";

/* ===== SUBIR SCORE ===== */

export async function submitScore(name, score) {
  score = Math.floor(score);

  if (!name || name.length > 12) return;
  if (score < 0 || score > 999999) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ name, score })
    });
  } catch (err) {
    console.warn("Leaderboard error:", err);
  }
}

/* ===== OBTENER TOP 10 ===== */

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
  } catch {
    return [];
  }
}
