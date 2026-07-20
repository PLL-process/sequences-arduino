/* TechnoQuest — badge de fin de séance imprimable (v3).
   Quand le QCM de la séance est validé, un bouton « Imprimer mon badge »
   apparaît sous le score : il compose une carte (nom de l'élève, séance,
   date, score /20, coches de progression, rosette) et lance l'impression en
   masquant tout le reste de la page. Le nom vient du profil enregistré ;
   s'il manque, deux champs le demandent et le mémorisent. */
"use strict";
(() => {
  const sessionId = Number(document.body.dataset.session || 0);
  if (sessionId < 1 || sessionId > 8) return;

  const TITRES = { 1: "Observer les signaux", 2: "Calibrer un seuil", 3: "Analyser les chaînes", 4: "Protéger la pompe", 5: "Économiser l’eau", 6: "Décider avec trois données", 7: "Améliorer la durabilité", 8: "Défi ingénieur" };
  const ACCENTS = { 1: "#22d3ee", 2: "#c084fc", 3: "#facc15", 4: "#fb7185", 5: "#4ade80", 6: "#60a5fa", 7: "#34d399", 8: "#fb923c" };

  const readJson = key => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; } };
  const esc = value => String(value).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const getProfile = () => readJson("technoquest-premium-v1").profile || {};
  const saveProfile = (name, classe) => {
    const fresh = readJson("technoquest-premium-v1");
    fresh.profile = { ...(fresh.profile || {}), name, classe };
    localStorage.setItem("technoquest-premium-v1", JSON.stringify(fresh));
  };

  const boot = () => {
    const scoreBox = document.getElementById("qcmScoreBox");
    const root = document.getElementById("qcmEngineRoot");
    if (!scoreBox || !root || document.getElementById("fvBadgeBtn")) return;

    const button = document.createElement("button");
    button.id = "fvBadgeBtn";
    button.type = "button";
    button.className = "btn";
    button.textContent = "🏅 Imprimer mon badge de séance";
    button.hidden = true;
    root.querySelector(".qcm-actions")?.appendChild(button);

    const refresh = () => {
      const saved = readJson("technoquest-qcm-v1").sessions?.[sessionId];
      button.hidden = !saved?.validated;
      return saved;
    };
    refresh();
    document.getElementById("qcmValidate")?.addEventListener("click", () => setTimeout(refresh, 200));
    document.getElementById("qcmReset")?.addEventListener("click", () => setTimeout(refresh, 200));

    const buildBadge = () => {
      const saved = refresh();
      if (!saved?.validated) return;
      let { name = "", classe = "" } = getProfile();
      if (!name.trim()) {
        name = (window.prompt("Ton prénom et ton nom (pour le badge) :", name) || "").trim();
        if (!name) return;
        classe = (window.prompt("Ta classe :", classe) || "").trim();
        saveProfile(name, classe);
      }
      const progression = readJson("technoquest-progression-v1").sessions?.[sessionId] || {};
      const accent = ACCENTS[sessionId];
      const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      const coche = (done, label) => `<li class="${done ? "fait" : ""}">${done ? "✔" : "○"} ${label}</li>`;

      document.getElementById("fvBadgeCarte")?.remove();
      const carte = document.createElement("div");
      carte.id = "fvBadgeCarte";
      carte.innerHTML = `
        <div class="fv-badge" style="--accent:${accent}">
          <svg class="fv-badge-rosette" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="44" fill="none" stroke="${accent}" stroke-width="5"/>
            <circle cx="60" cy="60" r="34" fill="${accent}" opacity="0.15"/>
            ${Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30) * Math.PI / 180;
              return `<circle cx="${60 + Math.cos(a) * 52}" cy="${60 + Math.sin(a) * 52}" r="4.5" fill="${accent}"/>`;
            }).join("")}
            <text x="60" y="55" text-anchor="middle" font-size="26" font-weight="900" fill="#0b3441">${saved.score}</text>
            <text x="60" y="74" text-anchor="middle" font-size="11" font-weight="700" fill="#0b3441">/ 20</text>
          </svg>
          <p class="fv-badge-titre">TechnoQuest · Jardin connecté</p>
          <h2>Séance ${sessionId} — ${esc(TITRES[sessionId])}</h2>
          <p class="fv-badge-nom">décerné à <strong>${esc(name)}</strong>${classe ? ` · ${esc(classe)}` : ""}</p>
          <ul class="fv-badge-coches">
            ${coche(progression.demo, "Jumeau numérique observé")}
            ${coche(progression.programme, "Programme C++ vérifié")}
            ${coche(true, `QCM validé : ${saved.score} / 20`)}
          </ul>
          <p class="fv-badge-date">Fait le ${date}</p>
          <p class="fv-badge-signature">Signature du professeur : ______________________</p>
        </div>`;
      document.body.appendChild(carte);
      document.body.classList.add("fv-impression-badge");
      const cleanup = () => {
        document.body.classList.remove("fv-impression-badge");
        carte.remove();
        window.removeEventListener("afterprint", cleanup);
      };
      window.addEventListener("afterprint", cleanup);
      window.print();
      /* Navigateurs sans afterprint fiable : nettoyage différé. */
      setTimeout(() => { if (carte.isConnected) cleanup(); }, 1500);
    };

    button.addEventListener("click", buildBadge);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0));
  else setTimeout(boot, 0);
})();
