const keywordWeights = [
  { term: "idiota", weight: 0.16 },
  { term: "basura", weight: 0.18 },
  { term: "inferior", weight: 0.22 },
  { term: "genocidio", weight: 0.35 },
  { term: "deport", weight: 0.2 },
  { term: "parásito", weight: 0.24 },
  { term: "parasito", weight: 0.24 },
  { term: "no mereces", weight: 0.18 },
  { term: "tu raza", weight: 0.26 },
  { term: "criminales", weight: 0.14 },
  { term: "maldita", weight: 0.12 },
  { term: "derechos", weight: 0.08 }
];

const sampleTweets = [
  { text: "Tu raza es inferior y no deberia estar aqui." },
  { text: "Vamos al cine el viernes, llevo las palomitas." },
  { text: "Deberian deportarte del pais por como eres." },
  { text: "Tengo una pregunta sobre el proyecto final." }
];

const sampleMetrics = [
  { name: "Logistic Regression", accuracy: 1.0, roc_auc: 1.0 },
  { name: "Random Forest", accuracy: 1.0, roc_auc: 1.0 },
  { name: "Naive Bayes", accuracy: 1.0, roc_auc: 1.0 }
];

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function analyzeText(text) {
  const normalized = normalizeText(text);
  let score = 0.08;
  const hits = [];

  keywordWeights.forEach((keyword) => {
    if (normalized.includes(normalizeText(keyword.term))) {
      score += keyword.weight;
      hits.push(keyword.term);
    }
  });

  const cappedScore = Math.min(score, 0.98);
  const isHate = cappedScore >= 0.45;

  return {
    normalized,
    score: cappedScore,
    isHate,
    hits
  };
}

function renderAnalysis(result) {
  const box = document.getElementById("analysis-result");
  const label = result.isHate ? "Posible contenido de odio" : "Sin señales fuertes de odio";
  const klass = result.isHate ? "alert" : "safe";
  const hits = result.hits.length ? result.hits.join(", ") : "Ninguna coincidencia fuerte";

  box.className = `result ${klass}`;
  box.innerHTML = `
    <h3>${label}</h3>
    <p><strong>Probabilidad estimada:</strong> ${(result.score * 100).toFixed(1)}%</p>
    <p><strong>Texto normalizado:</strong> ${result.normalized || "Sin contenido"}</p>
    <p><strong>Senales detectadas:</strong> ${hits}</p>
  `;
}

function renderKeywords() {
  const list = document.getElementById("keyword-list");
  list.innerHTML = keywordWeights.map((item) => `<li>${item.term}</li>`).join("");
}

function renderMetrics(metrics) {
  const root = document.getElementById("metrics-cards");
  root.innerHTML = metrics.map((item) => `
    <article class="metric-item">
      <strong>${item.name}</strong>
      <span>Accuracy: ${(item.accuracy * 100).toFixed(1)}%</span>
      <span>ROC-AUC: ${(item.roc_auc * 100).toFixed(1)}%</span>
    </article>
  `).join("");
}

function renderTweets(rows) {
  const root = document.getElementById("tweet-table");
  root.innerHTML = rows.map((row) => {
    const result = analyzeText(row.text || "");
    return `
      <article class="tweet-row">
        <div>${row.text}</div>
        <div class="tweet-label ${result.isHate ? "badge-danger" : "badge-safe"}">
          ${result.isHate ? "odio" : "no_odio"}
        </div>
        <div class="tweet-score">${(result.score * 100).toFixed(0)}%</div>
      </article>
    `;
  }).join("");
}

async function loadMetrics() {
  try {
    const response = await fetch("../results/experiments_log.json");
    if (!response.ok) {
      throw new Error("No se pudo leer experiments_log.json");
    }
    const data = await response.json();
    const metrics = data.map((item) => ({
      name: item.name,
      accuracy: item.metrics.accuracy,
      roc_auc: item.metrics.roc_auc
    }));
    renderMetrics(metrics);
  } catch (error) {
    renderMetrics(sampleMetrics);
  }
}

async function loadTweets() {
  try {
    const response = await fetch("./twitter_posts.json");
    if (!response.ok) {
      throw new Error("No se encontro twitter_posts.json");
    }
    const data = await response.json();
    renderTweets(data);
  } catch (error) {
    renderTweets(sampleTweets);
  }
}

function wireUI() {
  const input = document.getElementById("text-input");
  document.getElementById("analyze-btn").addEventListener("click", () => {
    renderAnalysis(analyzeText(input.value));
  });

  document.getElementById("sample-btn").addEventListener("click", () => {
    input.value = "Deberian deportarte del pais, no mereces derechos.";
    renderAnalysis(analyzeText(input.value));
  });
}

renderKeywords();
loadMetrics();
loadTweets();
wireUI();
