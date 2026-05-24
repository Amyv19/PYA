const lexicon = {
  grupos: [
    { term: "inmigrantes", weight: 0.16 },
    { term: "migrantes", weight: 0.16 },
    { term: "musulmanes", weight: 0.16 },
    { term: "negros", weight: 0.18 },
    { term: "indios", weight: 0.18 },
    { term: "gays", weight: 0.16 },
    { term: "trans", weight: 0.16 },
    { term: "mujeres", weight: 0.12 },
    { term: "judios", weight: 0.18 },
    { term: "pobres", weight: 0.1 },
    { term: "feministas", weight: 0.1 }
  ],
  violencia: [
    { term: "genocidio", weight: 0.34 },
    { term: "matar", weight: 0.28 },
    { term: "maten", weight: 0.28 },
    { term: "linchar", weight: 0.28 },
    { term: "desaparecer", weight: 0.24 },
    { term: "morir", weight: 0.18 }
  ],
  exclusion: [
    { term: "deport", weight: 0.26 },
    { term: "expuls", weight: 0.24 },
    { term: "sin derechos", weight: 0.26 },
    { term: "quitarles derechos", weight: 0.28 },
    { term: "no merecen derechos", weight: 0.32 },
    { term: "fuera del pais", weight: 0.2 }
  ],
  insultos: [
    { term: "puta", weight: 0.18 },
    { term: "puta madre", weight: 0.14 },
    { term: "puto", weight: 0.18 },
    { term: "tonta", weight: 0.12 },
    { term: "tonto", weight: 0.12 },
    { term: "idiota", weight: 0.14 },
    { term: "imbecil", weight: 0.14 },
    { term: "pendeja", weight: 0.16 },
    { term: "pendejo", weight: 0.16 },
    { term: "estupida", weight: 0.12 },
    { term: "estupido", weight: 0.12 },
    { term: "tarada", weight: 0.12 },
    { term: "tarado", weight: 0.12 },
    { term: "maricon", weight: 0.22 },
    { term: "joto", weight: 0.2 },
    { term: "sudaca", weight: 0.24 },
    { term: "parasito", weight: 0.18 },
    { term: "plaga", weight: 0.18 },
    { term: "basura humana", weight: 0.2 },
    { term: "negro de mierda", weight: 0.32 },
    { term: "pinches indios", weight: 0.32 }
  ],
  contextoSuave: [
    { term: "pelicula", weight: -0.1 },
    { term: "proyecto", weight: -0.1 },
    { term: "app", weight: -0.1 },
    { term: "trafico", weight: -0.08 },
    { term: "debate", weight: -0.08 },
    { term: "argumento", weight: -0.08 },
    { term: "servicio", weight: -0.08 },
    { term: "oficina", weight: -0.08 }
  ]
};

const sampleTweets = [
  { text: "Tu raza es inferior y no deberia estar aqui." },
  { text: "Vamos al cine el viernes, llevo las palomitas." },
  { text: "Deberian deportarte del pais por como eres." },
  { text: "Tengo una pregunta sobre el proyecto final." },
  { text: "Pinches indios, nunca aprenden." },
  { text: "No estoy de acuerdo con tu argumento, pero podemos debatirlo." }
];

const sampleMetrics = [
  {
    title: "Ataque dirigido",
    body: "Sube el score si hay grupo objetivo, exclusión o violencia, no solo insultos sueltos."
  },
  {
    title: "Contexto común",
    body: "Baja el score cuando detecta quejas de producto, debate o crítica no identitaria."
  },
  {
    title: "Lectura final",
    body: "Combina intensidad, términos detectados y contexto para estimar riesgo de odio."
  }
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

function findMatches(normalized, terms) {
  return terms.filter((entry) => normalized.includes(entry.term));
}

function analyzeText(text) {
  const normalized = normalizeText(text);
  let score = 0.06;
  const hits = [];
  const categories = [];

  Object.entries(lexicon).forEach(([category, terms]) => {
    const matches = findMatches(normalized, terms);
    if (matches.length) {
      score += matches.reduce((acc, item) => acc + item.weight, 0);
      if (category !== "contextoSuave") {
        categories.push(category);
        hits.push(...matches.map((item) => item.term));
      }
    }
  });

  const hasTargetedStructure = /\b(eres|son|ustedes|esa gente|ellos|ellas|tu gente)\b/.test(normalized);
  if (hasTargetedStructure && hits.length) {
    score += 0.08;
  }

  const uppercaseRatio = text
    ? text.replace(/[^A-ZÁÉÍÓÚÑ]/g, "").length / Math.max(text.replace(/\s+/g, "").length, 1)
    : 0;
  if (uppercaseRatio > 0.34) {
    score += 0.05;
  }

  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations >= 2 && hits.length) {
    score += 0.04;
  }

  const cappedScore = Math.min(Math.max(score, 0.02), 0.98);
  const isHate = cappedScore >= 0.48;
  const isAbusive = !isHate && hits.some((term) =>
    ["puta", "puta madre", "puto", "tonta", "tonto", "idiota", "imbecil", "pendeja", "pendejo", "estupida", "estupido", "tarada", "tarado"].includes(term)
  );
  const severity = cappedScore >= 0.78 ? "alto" : cappedScore >= 0.48 ? "medio" : "bajo";

  return {
    normalized,
    score: cappedScore,
    isHate,
    isAbusive,
    hits: [...new Set(hits)],
    categories: [...new Set(categories)],
    severity
  };
}

function renderAnalysis(result) {
  const box = document.getElementById("analysis-result");
  const label = result.isHate
    ? "Riesgo alto de odio"
    : result.isAbusive
      ? "Agresion verbal detectada"
      : "Sin señales fuertes de odio";
  const klass = result.isHate ? "alert" : result.isAbusive ? "alert" : "safe";
  const hits = result.hits.length ? result.hits.join(", ") : "Ninguna coincidencia clara";
  const categories = result.categories.length ? result.categories.join(", ") : "sin categoría crítica";

  box.className = `result ${klass}`;
  box.innerHTML = `
    <h3>${label}</h3>
    <p><strong>Score estimado:</strong> ${(result.score * 100).toFixed(1)}%</p>
    <div class="detail-grid">
      <div class="detail-card">
        <span>Severidad</span>
        <strong>${result.severity}</strong>
      </div>
      <div class="detail-card">
        <span>Categorías</span>
        <strong>${categories}</strong>
      </div>
      <div class="detail-card">
        <span>Términos</span>
        <strong>${hits}</strong>
      </div>
    </div>
    <p><strong>Texto normalizado:</strong> ${result.normalized || "Sin contenido"}</p>
  `;
}

function renderKeywords() {
  const list = document.getElementById("keyword-list");
  const curated = [
    "grupos objetivo",
    "expulsión y exclusión",
    "violencia explícita",
    "insultos identitarios",
    "contexto no dirigido",
    "debate o crítica común"
  ];
  list.innerHTML = curated.map((item) => `<li>${item}</li>`).join("");
}

function renderMetrics(metrics) {
  const root = document.getElementById("metrics-cards");
  root.innerHTML = metrics.map((item) => `
    <article class="metric-item">
      <strong>${item.title}</strong>
      <span>${item.body}</span>
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
          ${result.isHate ? `odio (${result.severity})` : "no_odio"}
        </div>
        <div class="tweet-score">${(result.score * 100).toFixed(0)}%</div>
      </article>
    `;
  }).join("");
}

async function loadTweets() {
  try {
    const response = await fetch("./twitter_posts.json");
    if (!response.ok) {
      throw new Error("No se encontró twitter_posts.json");
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
    input.value = "Pinches indios, no merecen derechos y deberian expulsarlos.";
    renderAnalysis(analyzeText(input.value));
  });
}

renderKeywords();
renderMetrics(sampleMetrics);
loadTweets();
wireUI();
