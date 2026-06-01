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
    { term: "fuera del pais", weight: 0.20 },
    { term: "vete a tu pais", weight: 0.32 },
    { term: "regresate a tu pais", weight: 0.32 },
    { term: "largate de mi pais", weight: 0.34 }
  ],
  insultos: [
    { term: "puta", weight: 0.18 },
    { term: "puta madre", weight: 0.14 },
    { term: "puto", weight: 0.18 },
    { term: "zorra", weight: 0.18 },
    { term: "naca", weight: 0.16 },
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

const phoneChats = [
  {
    id: "chat-1",
    name: "Grupo escolar",
    preview: "Puta naca, vete a tu pais",
    messages: [
      { from: "other", text: "Nadie te quiere en el grupo." },
      { from: "other", text: "Puta naca, vete a tu pais." },
      { from: "me", text: "Ya paren." }
    ]
  },
  {
    id: "chat-2",
    name: "Chat de trabajo",
    preview: "Eres una idiota",
    messages: [
      { from: "other", text: "Tu reporte salio mal otra vez." },
      { from: "other", text: "Eres una idiota, no entiendes nada." },
      { from: "me", text: "No me hables asi." }
    ]
  },
  {
    id: "chat-3",
    name: "Debate normal",
    preview: "No estoy de acuerdo",
    messages: [
      { from: "other", text: "No estoy de acuerdo con tu propuesta." },
      { from: "other", text: "Podemos corregirlo sin pelear." },
      { from: "me", text: "Va, lo revisamos." }
    ]
  }
];

function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/https?:\/\/\S+/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(text) {
  return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
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

  if (/\b(eres|son|ustedes|esa gente|ellos|ellas|tu gente)\b/.test(normalized) && hits.length) score += 0.08;
  if (/\b(vete|largate|regresate|vayanse)\b.*\b(pais|paisito)\b/.test(normalized)) {
    score += 0.24;
    categories.push("exclusion");
    hits.push("expulsion_nativista");
  }
  const uppercaseRatio = text ? text.replace(/[^A-ZÁÉÍÓÚÑ]/g, "").length / Math.max(text.replace(/\s+/g, "").length, 1) : 0;
  if (uppercaseRatio > 0.34) score += 0.05;
  if ((text.match(/!/g) || []).length >= 2 && hits.length) score += 0.04;

  const cappedScore = Math.min(Math.max(score, 0.02), 0.98);
  const isHate = cappedScore >= 0.48;
  const abusiveTerms = ["puta", "puta madre", "puto", "zorra", "naca", "tonta", "tonto", "idiota", "imbecil", "pendeja", "pendejo", "estupida", "estupido", "tarada", "tarado"];
  const isAbusive = !isHate && hits.some((term) => abusiveTerms.includes(term));
  const severity = cappedScore >= 0.78 ? "alto" : cappedScore >= 0.48 ? "medio" : "bajo";

  return { normalized, score: cappedScore, isHate, isAbusive, hits: [...new Set(hits)], categories: [...new Set(categories)], severity };
}

function createSystemState(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) return { tone: "neutral", title: "No puedo evaluar un mensaje vacío todavía.", summary: "Escribe algo primero.", detail: "Cuando no hay texto, el sistema no clasifica.", meta: ["sin texto"] };
  if (trimmed.length < 3) return { tone: "neutral", title: "No puedo decidir con tan poco texto.", summary: "Necesito más contexto.", detail: "Con entradas muy cortas es fácil fallar.", meta: ["muy corto"] };

  const result = analyzeText(trimmed);
  const terms = result.hits.length ? result.hits.join(", ") : "sin coincidencias fuertes";
  const categories = result.categories.length ? result.categories.join(", ") : "sin categoria critica";

  if (result.isHate) return { tone: "danger", title: "Probabilidad alta de odio.", summary: "La lectura apunta a ataque dirigido o exclusion.", detail: `Terminos: ${terms}. Categorias: ${categories}.`, meta: [`score ${Math.round(result.score * 100)}%`, "odio", result.severity] };
  if (result.isAbusive) return { tone: "warn", title: "Agresion verbal probable.", summary: "Hay insultos, pero no suficiente senal de odio directo.", detail: `Terminos: ${terms}.`, meta: [`score ${Math.round(result.score * 100)}%`, "agresion verbal", result.severity] };
  return { tone: "safe", title: "Sin senales fuertes de odio.", summary: "Suena mas a queja o desacuerdo.", detail: `Lectura: ${categories}.`, meta: [`score ${Math.round(result.score * 100)}%`, "sin odio", result.severity] };
}

function renderAnalysis(rawText) {
  const state = createSystemState(rawText);
  const root = document.getElementById("analysis-result");
  root.innerHTML = `
    <article class="system-card ${state.tone === "danger" ? "danger-card" : state.tone === "warn" ? "warn-card" : state.tone === "safe" ? "safe-card" : "neutral-card"}">
      <strong>${state.title}</strong>
      <p>${state.summary}</p>
      <div class="analysis-meta">${state.meta.map((item) => `<span class="meta-chip">${item}</span>`).join("")}</div>
      <p>${state.detail}</p>
    </article>
  `;
}

function renderKeywords() {
  const root = document.getElementById("keyword-list");
  root.innerHTML = ["grupos objetivo", "expulsion y exclusion", "violencia explicita", "groseria sin contexto", "critica comun"].map((item) => `<li>${item}</li>`).join("");
}

function renderTweets(rows) {
  const root = document.getElementById("tweet-table");
  root.innerHTML = rows.map((row) => {
    const result = analyzeText(row.text || "");
    const tone = result.isHate ? "danger" : result.isAbusive ? "warn" : "safe";
    const copy = result.isHate ? "Se recomendaria revision humana." : result.isAbusive ? "Se marcaria por agresion verbal probable." : "No muestra riesgo fuerte.";
    return `
      <article class="post-card">
        <div class="post-head">
          <strong>${escapeHtml(row.user)}</strong>
          <span class="post-meta">${escapeHtml(row.handle)}</span>
        </div>
        <div class="post-body">${escapeHtml(row.text)}</div>
        <div class="post-response ${tone}">${copy}</div>
      </article>
    `;
  }).join("");
}

function createPhoneAlert(chat) {
  const combined = chat.messages.map((m) => m.text).join(" ");
  const result = analyzeText(combined);
  if (result.isHate) return { klass: "danger", title: "Riesgo alto", body: "Hay senales de odio o exclusion. Conviene revision humana inmediata." };
  if (result.isAbusive) return { klass: "warn", title: "Agresion verbal", body: "Hay insultos directos. Se recomendaria moderar o revisar." };
  return { klass: "safe", title: "Sin riesgo fuerte", body: "Parece mas desacuerdo que ataque." };
}

function renderPhonePicker(activeId) {
  const root = document.getElementById("chat-picker");
  root.innerHTML = phoneChats.map((chat) => `
    <button class="chat-chip ${chat.id === activeId ? "active" : ""}" data-chat-id="${chat.id}">
      <strong>${escapeHtml(chat.name)}</strong>
      <span>${escapeHtml(chat.preview)}</span>
    </button>
  `).join("");
  root.querySelectorAll("[data-chat-id]").forEach((button) => {
    button.addEventListener("click", () => renderPhoneChat(button.getAttribute("data-chat-id")));
  });
}

function renderPhoneChat(chatId) {
  const chat = phoneChats.find((item) => item.id === chatId) || phoneChats[0];
  const alert = createPhoneAlert(chat);
  document.getElementById("phone-contact").textContent = chat.name;
  document.getElementById("phone-status").textContent = "Chat monitoreado";
  document.getElementById("phone-messages").innerHTML = chat.messages.map((message) => `
    <div class="msg-row ${message.from === "me" ? "me" : "other"}">
      <div class="msg-bubble">${escapeHtml(message.text)}</div>
    </div>
  `).join("");
  document.getElementById("phone-system").innerHTML = `
    <div class="phone-alert ${alert.klass}">
      <strong>${alert.title}</strong>
      <p>${alert.body}</p>
    </div>
  `;
  renderPhonePicker(chat.id);
}

function wireTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = {
    phone: document.getElementById("panel-phone"),
    text: document.getElementById("panel-text"),
    feed: document.getElementById("panel-feed")
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      Object.values(panels).forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      panels[tab.getAttribute("data-tab")].classList.add("active");
    });
  });
}

function wireUI() {
  const input = document.getElementById("text-input");
  document.getElementById("analyze-btn").addEventListener("click", () => renderAnalysis(input.value));
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
renderAnalysis("");
renderPhoneChat(phoneChats[0].id);
renderTweets(sampleTweets);
wireTabs();
wireUI();
