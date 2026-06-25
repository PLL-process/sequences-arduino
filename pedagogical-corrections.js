/* Ajoute des consignes et des corrections formatives sans points. */
"use strict";

(() => {
  if (typeof missions === "undefined" || typeof state === "undefined") return;
  const data = window.TECHNOQUEST_CORRECTIONS;
  if (!data) return;
  const $ = id => document.getElementById(id);
  const esc = text => String(text).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

  const style = document.createElement("style");
  style.textContent = `
    .student-instruction,.correction-policy,.correction-panel{margin:.8rem 0;padding:.9rem 1rem;border-radius:13px;line-height:1.55}
    .student-instruction{border-left:5px solid var(--blue);background:#0a2d3a;color:#e5f6ff}
    .correction-policy{border:1px solid #c4922f;background:#3a2c0d;color:#fff0be}
    .correction-policy.used{border-color:var(--red);background:#49201d;color:#ffe0dc}
    .student-instruction strong,.correction-policy strong{display:block;margin-bottom:.25rem;color:#fff}
    .correction-button{border-color:#e8bb55;background:#44350f;color:#fff3bd;font-weight:bold}
    .correction-panel{display:none;border:1px solid #e8bb55;background:#171d18;color:var(--text)}
    .correction-panel.open{display:block}.correction-panel h4{margin:.2rem 0 .6rem;color:var(--yellow)}
    .correction-panel pre{white-space:pre-wrap;padding:.85rem;border:1px solid var(--border);border-radius:10px;background:#04100c;color:#eafff3}
    .correction-panel li{margin:.38rem 0}.correction-score-note{font-weight:bold;color:#ffaaa2}
    .challenge-correction-actions{display:flex;gap:.55rem;flex-wrap:wrap;margin-top:.7rem}
    .mission.correction-used{border-color:#ff7b72;background:#4a211d}
    @media(max-width:600px){.correction-button{width:100%}}
  `;
  document.head.appendChild(style);

  const code = $("code");
  const codeLabel = document.querySelector('label[for="code"]');
  const actions = code?.closest(".tab-content")?.querySelector(".actions");
  if (!code || !codeLabel || !actions) return;

  const instruction = document.createElement("div");
  instruction.className = "student-instruction";
  instruction.innerHTML = '<strong>Consigne de programmation</strong><span id="programInstruction"></span>';
  codeLabel.insertAdjacentElement("afterend", instruction);

  const policy = document.createElement("div");
  policy.className = "correction-policy";
  instruction.insertAdjacentElement("afterend", policy);

  const codeButton = document.createElement("button");
  codeButton.type = "button";
  codeButton.className = "correction-button";
  codeButton.textContent = "📘 Correction complète";
  actions.appendChild(codeButton);

  const codePanel = document.createElement("section");
  codePanel.className = "correction-panel";
  actions.insertAdjacentElement("afterend", codePanel);

  const currentState = () => state.missions[current];

  function markUsed(kind) {
    const s = currentState();
    if (!s.correctionUsed) {
      const ok = confirm("Afficher la correction rend cette mission formative. Aucun point ne sera attribué. Continuer ?");
      if (!ok) return false;
    }
    s.correctionUsed = true;
    s.correctionKinds = Array.isArray(s.correctionKinds) ? s.correctionKinds : [];
    if (!s.correctionKinds.includes(kind)) s.correctionKinds.push(kind);
    s.done = false;
    sauver(); afficherNavigation(); actualiserTableau(); refresh();
    message(`Correction consultée pour la mission ${missions[current].id} : 0 point pour cette mission.`);
    return true;
  }

  function correctionCode() {
    const m = missions[current];
    const details = data.explanations[current] || [];
    return `<h4>Correction du programme — mission ${m.id}</h4>
      <p class="correction-score-note">Mission hors barème après consultation de la correction.</p>
      <pre><code>${esc(m.codes.guided)}</code></pre>
      <h4>Explication détaillée</h4><ul>${details.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <button type="button" id="insertCorrectedCode">Insérer le programme corrigé</button>`;
  }

  codeButton.addEventListener("click", () => {
    if (!markUsed("programme")) return;
    codePanel.innerHTML = correctionCode();
    codePanel.classList.add("open");
    $("insertCorrectedCode")?.addEventListener("click", () => {
      code.value = missions[current].codes.guided;
      code.dispatchEvent(new Event("input", {bubbles:true}));
      message("Le programme corrigé a été inséré. Lis les commentaires puis exécute-le.");
    });
  });

  function addButton(section, label, kind, render) {
    if (!section) return;
    const zone = document.createElement("div"); zone.className = "challenge-correction-actions";
    const button = document.createElement("button"); button.type = "button"; button.className = "correction-button"; button.textContent = label;
    const panel = document.createElement("section"); panel.className = "correction-panel";
    zone.appendChild(button); section.append(zone, panel);
    button.addEventListener("click", () => { if (markUsed(kind)) { render(panel); panel.classList.add("open"); } });
  }

  addButton($("validateSignals")?.closest(".analysis-challenge"), "📘 Correction des signaux", "signaux", panel => {
    $("signalHumidity").value = "analogique"; $("signalRelay").value = "logique"; $("logicLevels").value = "low-high";
    currentState().signals = true; sauver(); afficherCriteres();
    panel.innerHTML = `<h4>Correction exhaustive — signaux</h4><p class="correction-score-note">Mission hors barème.</p><ul>
      <li><strong>A0 : mesure analogique.</strong> La grandeur et la tension varient progressivement ; l’ADC produit ensuite un nombre numérique.</li>
      <li><strong>D6 : commande logique.</strong> LOW maintient le relais au repos ; HIGH l’active.</li>
      <li><strong>Niveaux logiques :</strong> LOW = 0 et HIGH = 1. Ce ne sont pas des pourcentages d’humidité.</li></ul>`;
    $("signalFeedback").textContent = "📘 Réponses affichées par la correction — aucun point.";
  });

  addButton($("validateChains")?.closest(".analysis-challenge"), "📘 Correction des chaînes", "chaines", panel => {
    document.querySelectorAll(".chain-row").forEach(row => { row.querySelector("select").value = row.dataset.good; row.classList.add("correct"); });
    currentState().chains = true; sauver(); afficherCriteres();
    panel.innerHTML = `<h4>Correction exhaustive — chaînes</h4><p class="correction-score-note">Mission hors barème.</p>
      <h4>Chaîne d’information</h4><ul><li>Capteur d’humidité → <strong>Acquérir</strong>.</li><li>Arduino UNO R4 → <strong>Traiter</strong>.</li><li>Écran ou alerte → <strong>Communiquer</strong>.</li></ul>
      <h4>Chaîne d’énergie</h4><ul><li>Alimentation → <strong>Alimenter</strong>.</li><li>Relais → <strong>Distribuer</strong>.</li><li>Pompe → <strong>Convertir</strong>.</li><li>Tuyau → <strong>Transmettre</strong>.</li><li>Arrosage du sol → <strong>Agir</strong>.</li></ul>`;
    $("chainFeedback").textContent = "📘 Associations affichées par la correction — aucun point.";
  });

  addButton($("saveAnswer")?.closest(".written-analysis"), "📘 Correction de la trace écrite", "trace", panel => {
    panel.innerHTML = `<h4>Proposition de réponse — mission ${missions[current].id}</h4><p class="correction-score-note">Mission hors barème.</p><p>${esc(data.answers[current])}</p><p><strong>Méthode :</strong> adapte cette réponse à tes propres mesures et distingue résultats, justification et limites.</p>`;
  });

  $("validate")?.addEventListener("click", event => {
    const s = currentState();
    if (!s?.correctionUsed) return;
    event.preventDefault(); event.stopImmediatePropagation();
    s.done = false; s.code = code.value; s.answer = $("answer")?.value.trim() || s.answer;
    sauver(); afficherCriteres(); afficherNavigation(); actualiserTableau();
    message(`Mission ${missions[current].id} vérifiée à titre formatif : 0 point, car une correction a été consultée.`);
  }, true);

  function refresh() {
    const s = currentState();
    $("programInstruction").textContent = data.instructions[current] || missions[current].objective;
    policy.classList.toggle("used", !!s.correctionUsed);
    policy.innerHTML = s.correctionUsed
      ? "<strong>Mission formative — correction consultée</strong>Tu peux poursuivre les essais, mais cette mission rapporte désormais 0 point."
      : "<strong>Avant d’ouvrir une correction</strong>Une correction est une ressource d’apprentissage. Dès qu’elle est affichée, aucun point ne peut être attribué pour cette mission.";
    codePanel.classList.remove("open");
    document.querySelectorAll("#missions .mission").forEach((button, index) => {
      const used = !!state.missions[index]?.correctionUsed;
      button.classList.toggle("correction-used", used);
      if (used && button.querySelector("small")) button.querySelector("small").textContent = "Correction consultée · 0 point";
    });
  }

  new MutationObserver(() => setTimeout(refresh, 0)).observe($("missionTitle"), {childList:true});
  new MutationObserver(() => setTimeout(refresh, 0)).observe($("missions"), {childList:true});
  refresh();
})();
