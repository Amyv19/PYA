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
    { term: "pobres", weight: 0.10 },
    { term: "feministas", weight: 0.10 }
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
    { term: "fuera del pais", weight: 0.20 }
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
    { term: "joto", weight: 0.20 },
    { term: "sudaca", weight: 0.24 },
    { term: "parasito", weight: 0.18 },
    { term: "plaga", weight: 0.18 },
    { term: "basura humana", weight: 0.20 },
    { term: "negro de mierda", weight: 0.32 },
    { term: "pinches indios", weight: 0.32 }
  ],
  contextoSuave: [
    { term: "pelicula", weight: -0.10 },
    { term: "proyecto", weight: -0.10 },
    { term: "app", weight: -0.10 },
    { term: "trafico", weight: -0.08 },
    { term: "debate", weight: -0.08 },
    { term: "argumento", weight: -0.08 },
    { term: "servicio", weight: -0.08 },
    { term: "oficina", weight: -0.08 }
  ]
};

const sampleTweets = [
  { user: "lucia.design", handle: "@lucia", text: "No estoy de acuerdo con tu argumento, pero podemos debatirlo." },
  { user: "foro.vecinal", handle: "@foro", text: "Pinches indios, nunca aprenden." },
  { user: "cinefilo_88", handle: "@cinefilo", text: "La pelicula estuvo horrible y perdi mi dinero." },
  { user: "alerta_social", handle: "@alerta", text: "Esa gente no merece derechos y deberian expulsarlos." }
];

const sampleMetrics = [
  {
    title: "Diferencia groseria de odio",
    body: "No todo insulto es odio. Si hay groseria sin grupo objetivo, responde como agresion verbal."
  },
  {
    title: "Muestra cuando no puede ayudar",
    body: "Si no escribes nada o mandas algo demasiado corto, el sistema lo dice con un mensaje directo."
  },
  {
    title: "Piensa como timeline",
    body: "La salida ahora aparece como respuesta de moderacion dentro de una conversacion tipo red social."
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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  const abusiveTerms = [
    "puta", "puta madre", "puto", "tonta", "tonto", "idiota", "imbecil",
    "pendeja", "pendejo", "estupida", "estupido", "tarada", "tarado"
  ];
  const isAbusive = !isHate && hits.some((term) => abusiveTerms.includes(term));
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

function createSystemState(rawText) {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return {
      tone: "neutral",
      title: "No puedo evaluar un mensaje vacio todavia.",
      summary: "Escribe algo primero y te respondo como si fuera una alerta de moderacion.",
      detail: "Cuando no hay texto, el sistema evita inventar una clasificacion.",
      meta: { confianza: "--", categoria: "sin texto", lectura: "esperando mensaje" }
    };
  }

  if (trimmed.length < 3) {
    return {
      tone: "neutral",
      title: "No puedo decidir con tan poco texto.",
      summary: "Necesito al menos una palabra o frase un poco mas clara para interpretar el contexto.",
      detail: "Con entradas demasiado cortas es facil marcar falso positivo o falso negativo.",
      meta: { confianza: "baja", categoria: "muy corto", lectura: "sin contexto" }
    };
  }

  const result = analyzeText(trimmed);
  const confidence = `${(result.score * 100).toFixed(0)}%`;
  const terms = result.hits.length ? result.hits.join(", ") : "sin coincidencias fuertes";
  const categories = result.categories.length ? result.categories.join(", ") : "sin categoria critica";

  if (result.isHate) {
    return {
      tone: "danger",
      title: "Alerta: posible mensaje de odio.",
      summary: "Detecte ataque dirigido, exclusion o lenguaje con riesgo alto dentro del mensaje.",
      detail: `Terminos detectados: ${terms}. Categorias: ${categories}.`,
      meta: { confianza: confidence, categoria: "odio", lectura: result.severity }
    };
  }

  if (result.isAbusive) {
    return {
      tone: "warn",
      title: "Esto parece agresion verbal, no odio directo.",
      summary: "Hay groserias o insultos, pero no aparecen suficientes señales de ataque contra un grupo.",
      detail: `Terminos detectados: ${terms}. El sistema lo separa del odio identitario para evitar exagerar.`,
      meta: { confianza: confidence, categoria: "agresion verbal", lectura: result.severity }
    };
  }

  return {
    tone: "safe",
    title: "No veo señales fuertes de odio aqui.",
    summary: "El mensaje puede ser neutral, una critica comun o una queja sin objetivo identitario claro.",
    detail: `Lectura actual: ${categories}. Texto normalizado: ${result.normalized || "sin contenido"}.`,
    meta: { confianza: confidence, categoria: "sin odio", lectura: result.severity }
  };
}

function toneClass(tone) {
  if (tone === "danger") return "danger-card";
  if (tone === "warn") return "warn-card";
  if (tone === "safe") return "safe-card";
  return "neutral-card";
}

function badgeClass(tone) {
  if (tone === "danger") return "badge badge-danger";
  if (tone === "warn") return "badge badge-warn";
  if (tone === "safe") return "badge badge-safe";
  return "badge";
}

function renderAnalysis(rawText) {
  const state = createSystemState(rawText);
  const container = document.getElementById("analysis-result");
  const safeText = escapeHtml(rawText.trim() || "Todavia no escribes nada.");

  container.className = "system-thread";
  container.innerHTML = `
    <article class="post-card">
      <div class="post-head">
        <div class="avatar avatar-user">T&uacute;</div>
        <div>
          <p class="post-author">Tu mensaje</p>
          <p class="post-meta">Simulacion de post para moderacion</p>
        </div>
      </div>
      <div class="post-bubble">${safeText}</div>
    </article>
    <article class="system-card ${toneClass(state.tone)}">
      <div class="system-head">
        <div class="avatar avatar-bot">PYA</div>
        <div>
          <strong>${state.title}</strong>
          <p>${state.summary}</p>
        </div>
      </div>
      <div class="analysis-grid">
        <div class="analysis-pill">
          <span>Confianza</span>
          <strong>${state.meta.confianza}</strong>
        </div>
        <div class="analysis-pill">
          <span>Categoria</span>
          <strong>${state.meta.categoria}</strong>
        </div>
        <div class="analysis-pill">
          <span>Lectura</span>
          <strong>${state.meta.lectura}</strong>
        </div>
      </div>
      <p class="analysis-copy">${state.detail}</p>
    </article>
  `;
}

function renderKeywords() {
  const list = document.getElementById("keyword-list");
  const curated = [
    "grupos objetivo",
    "expulsion y exclusion",
    "violencia explicita",
    "groseria sin contexto",
    "critica comun",
    "mensajes demasiado cortos"
  ];
  list.innerHTML = curated.map((item) => `<li>${item}</li>`).join("");
}

function renderMetrics(metrics) {
  const root = document.getElementById("metrics-cards");
  root.innerHTML = metrics.map((item) => `
    <article class="metric-item">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function renderTweets(rows) {
  const root = document.getElementById("tweet-table");
  root.innerHTML = rows.map((row) => {
    const result = analyzeText(row.text || "");
    const tone = result.isHate ? "danger" : result.isAbusive ? "warn" : "safe";
    const badgeText = result.isHate
      ? `odio ${result.severity}`
      : result.isAbusive
        ? "agresion verbal"
        : "sin odio";
    const replyCopy = result.isHate
      ? "El sistema subiria este mensaje a revision por ataque dirigido o exclusion."
      : result.isAbusive
        ? "El sistema marcaria el tono agresivo, pero sin llevarlo directo a odio."
        : "El sistema lo dejaria pasar o pediria mas contexto antes de bloquear.";

    return `
      <article class="post-card">
        <div class="post-head">
          <div class="avatar avatar-feed">${escapeHtml((row.user || "feed").slice(0, 3).toUpperCase())}</div>
          <div>
            <p class="post-author">${escapeHtml(row.user || "usuario_demo")}</p>
            <p class="post-meta">${escapeHtml(row.handle || "@demo")} · ahora</p>
          </div>
        </div>
        <div class="post-bubble">${escapeHtml(row.text || "")}</div>
        <article class="reply-card ${tone === "danger" ? "reply-danger" : tone === "warn" ? "reply-warn" : "reply-safe"}">
          <div class="reply-head">
            <span class="${badgeClass(tone)}">${badgeText}</span>
            <span class="post-meta">score ${(result.score * 100).toFixed(0)}%</span>
          </div>
          <p class="analysis-copy">${replyCopy}</p>
        </article>
      </article>
    `;
  }).join("");
}

async function loadTweets() {
  try {
    const response = await fetch("./twitter_posts.json");
    if (!response.ok) {
      throw new Error("No se pudo leer twitter_posts.json");
    }
    const data = await response.json();
    const mapped = data.slice(0, 6).map((item, index) => ({
      user: `cuenta_${index + 1}`,
      handle: `@feed${index + 1}`,
      text: item.text || ""
    }));
    renderTweets(mapped);
  } catch (error) {
    renderTweets(sampleTweets);
  }
}

function wireUI() {
  const input = document.getElementById("text-input");
  document.getElementById("analyze-btn").addEventListener("click", () => {
    renderAnalysis(input.value);
  });

  document.getElementById("sample-btn").addEventListener("click", () => {
    input.value = "Pinches indios, no merecen derechos y deberian expulsarlos.";
    renderAnalysis(input.value);
  });

  document.getElementById("soft-btn").addEventListener("click", () => {
    input.value = "No estoy de acuerdo con tu idea, pero podemos discutirla sin insultos.";
    renderAnalysis(input.value);
  });
}

renderKeywords();
renderMetrics(sampleMetrics);
renderAnalysis("");
loadTweets();
wireUI();
