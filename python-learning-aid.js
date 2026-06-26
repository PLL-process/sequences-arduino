/* Restaure l'éditeur Python et ajoute un algorithme ainsi qu'un aperçu coloré. */
"use strict";

(() => {
  if (document.getElementById("pythonLearningAid")) return;
  if (typeof missions === "undefined" || typeof state === "undefined") return;

  const code = document.getElementById("code");
  const simulation = document.getElementById("simulation");
  const codeLabel = document.querySelector('label[for="code"]');
  if (!code || !simulation || !codeLabel) return;

  const algorithms = [
    [
      ["acquire", "ACQUÉRIR", "Mesurer l’humidité du sol avec le capteur relié à A0."],
      ["store", "MÉMORISER", "Placer la valeur obtenue dans la variable humidite."],
      ["communicate", "COMMUNIQUER", "Afficher la valeur mesurée."],
      ["safety", "SÉCURISER", "Maintenir la sortie D6 à LOW et conserver la pompe arrêtée."]
    ],
    [
      ["parameter", "PARAMÉTRER", "Définir un seuil d’humidité à partir des mesures de calibration."],
      ["acquire", "ACQUÉRIR", "Mesurer l’humidité du sol."],
      ["compare", "COMPARER", "Comparer humidite à seuil_humidite."],
      ["decide", "DÉCIDER", "Déterminer si le sol est sec ou suffisamment humide."],
      ["communicate", "COMMUNIQUER", "Afficher l’état du sol, puis maintenir la pompe arrêtée."]
    ],
    [
      ["parameter", "PARAMÉTRER", "Définir le seuil d’humidité."],
      ["acquire", "ACQUÉRIR", "Lire la mesure du capteur A0."],
      ["compare", "COMPARER", "Vérifier si humidite est inférieure au seuil."],
      ["decide", "DÉCIDER", "Choisir entre arroser et arrêter."],
      ["act", "AGIR", "Arroser pendant trois secondes si le sol est sec ; sinon arrêter la pompe."]
    ],
    [
      ["parameter", "PARAMÉTRER", "Définir les seuils d’humidité et de niveau d’eau."],
      ["acquire", "ACQUÉRIR", "Lire l’humidité du sol et le niveau du réservoir."],
      ["safety", "SÉCURISER", "Vérifier en priorité que le réservoir contient assez d’eau."],
      ["compare", "COMPARER", "Tester simultanément sol sec ET niveau suffisant."],
      ["act", "AGIR", "Arroser si les deux conditions sont vraies ; sinon arrêter et, si nécessaire, alerter."]
    ],
    [
      ["parameter", "PARAMÉTRER", "Définir un seuil de démarrage et un seuil d’arrêt."],
      ["acquire", "ACQUÉRIR", "Lire l’humidité et le niveau du réservoir."],
      ["compare", "COMPARER", "Comparer la mesure aux deux seuils de l’hystérésis."],
      ["decide", "DÉCIDER", "Éviter les démarrages répétés autour d’une seule valeur."],
      ["act", "AGIR", "Limiter la durée d’arrosage puis arrêter explicitement la pompe."]
    ],
    [
      ["parameter", "PARAMÉTRER", "Définir les seuils d’humidité, de niveau et de luminosité."],
      ["acquire", "ACQUÉRIR", "Lire les trois capteurs A0, A1 et A2."],
      ["compare", "COMPARER", "Relier les trois comparaisons avec l’opérateur logique and."],
      ["decide", "DÉCIDER", "Autoriser l’arrosage uniquement si tous les critères sont satisfaits."],
      ["act", "AGIR", "Arroser brièvement ou maintenir la pompe arrêtée."]
    ],
    [
      ["calibrate", "CALIBRER", "Relever les nouvelles valeurs du capteur en sol sec et en sol humide."],
      ["parameter", "PARAMÉTRER", "Choisir un nouveau seuil adapté au capteur remplacé."],
      ["acquire", "ACQUÉRIR", "Lire la mesure recalibrée et le niveau du réservoir."],
      ["compare", "COMPARER", "Vérifier le besoin en eau et la sécurité du réservoir."],
      ["act", "AGIR", "Commander la pompe uniquement lorsque les conditions sont valides."]
    ],
    [
      ["parameter", "PARAMÉTRER", "Définir tous les seuils et les limites du système final."],
      ["acquire", "ACQUÉRIR", "Lire l’humidité, la luminosité et le niveau du réservoir."],
      ["safety", "SÉCURISER", "Traiter en premier le cas du réservoir vide ou d’une mesure incohérente."],
      ["compare", "COMPARER", "Évaluer les conditions d’arrosage dans l’ordre prévu."],
      ["act", "AGIR", "Alerter, arroser brièvement ou arrêter explicitement la pompe."],
      ["communicate", "COMMUNIQUER", "Afficher les mesures, la décision et le résultat de l’essai."]
    ]
  ];

  const colors = {
    acquire: ["#6fd3ff", "Acquisition"],
    store: ["#c9a7ff", "Mémorisation"],
    parameter: ["#c9a7ff", "Paramétrage"],
    calibrate: ["#c9a7ff", "Calibration"],
    compare: ["#ffd166", "Comparaison"],
    decide: ["#ff9f68", "Décision"],
    act: ["#63db8d", "Action"],
    safety: ["#ff7b72", "Sécurité"],
    communicate: ["#8be4d3", "Communication"]
  };

  const style = document.createElement("style");
  style.id = "technoquest-python-learning-styles";
  style.textContent = `
    #code{display:block!important;visibility:visible!important;opacity:1!important;min-height:300px!important;color:#effff5!important;background:#04110d!important;border:2px solid #2f6553!important;caret-color:#ffd166!important;position:relative;z-index:2}
    .python-load-note{margin:.55rem 0;padding:.65rem .8rem;border-left:4px solid var(--green);border-radius:9px;background:#0b2b21;color:#dff7e8;line-height:1.45}
    .python-learning-aid{margin:.75rem 0;border:1px solid var(--border);border-radius:14px;background:#071d17;overflow:hidden}
    .python-learning-aid summary{cursor:pointer;padding:.85rem 1rem;color:#fff;font-weight:900;background:#0a2d3a}
    .algorithm-body{padding:.8rem 1rem 1rem}.algorithm-sequence{display:grid;gap:.5rem;margin:.65rem 0}
    .algorithm-step{display:grid;grid-template-columns:135px minmax(0,1fr);gap:.7rem;align-items:center;padding:.65rem .75rem;border:1px solid #2f6553;border-left:6px solid var(--step-color);border-radius:10px;background:#06130f}
    .algorithm-step strong{color:var(--step-color);font-size:.82rem;letter-spacing:.05em}.algorithm-step span{color:#eafff3;line-height:1.45}
    .algorithm-arrow{text-align:center;color:#7fa99b;font-weight:900}.python-color-legend{display:flex;flex-wrap:wrap;gap:.45rem;margin:.65rem 0 0}
    .python-color-legend span{padding:.35rem .55rem;border:1px solid #2f6553;border-radius:999px;color:#dff7e8;font-size:.75rem}.python-color-legend i{display:inline-block;width:.7rem;height:.7rem;margin-right:.3rem;border-radius:50%;background:var(--legend-color)}
    .python-preview-box{margin:.8rem 0}.python-preview-header{display:flex;justify-content:space-between;align-items:center;gap:.7rem;flex-wrap:wrap;margin-bottom:.45rem}
    .python-preview-header h4{margin:0;color:#fff}.python-preview-header small{color:var(--muted)}
    .python-highlight{min-height:120px;margin:0;padding:1rem;overflow:auto;border:1px solid #285544;border-radius:12px;background:#020c09;color:#eafff3;font:1rem/1.55 Consolas,"Courier New",monospace;white-space:pre;tab-size:4}
    .py-comment{color:#83948d;font-style:italic}.py-keyword{color:#ffd166;font-weight:800}.py-decision{color:#ff9f68;font-weight:800}.py-string{color:#f2a7bd}.py-number{color:#c9a7ff}.py-reader{color:#6fd3ff;font-weight:700}.py-action{color:#63db8d;font-weight:800}.py-safety{color:#ff7b72;font-weight:800}.py-output{color:#8be4d3;font-weight:700}.py-operator{color:#ffd166}.py-variable{color:#eafff3}
    .python-tools{display:flex;gap:.55rem;flex-wrap:wrap;margin:.6rem 0}.python-tools button{flex:1 1 180px}
    @media(max-width:650px){.algorithm-step{grid-template-columns:1fr;gap:.25rem}.python-highlight{font-size:.88rem}}
  `;
  document.head.appendChild(style);

  const aid = document.createElement("div");
  aid.id = "pythonLearningAid";
  aid.innerHTML = `
    <p id="pythonLoadNote" class="python-load-note"><strong>Éditeur Python prêt.</strong> La zone ci-dessous reste modifiable ; l’aperçu coloré se met à jour automatiquement.</p>
    <details class="python-learning-aid" open>
      <summary>🧭 Algorithme textuel coloré — ordre des opérations</summary>
      <div class="algorithm-body">
        <p>Lis d’abord la chronologie, puis traduis chaque étape dans le programme Python pédagogique.</p>
        <div id="algorithmSequence" class="algorithm-sequence"></div>
        <div id="algorithmLegend" class="python-color-legend"></div>
      </div>
    </details>`;
  codeLabel.insertAdjacentElement("afterend", aid);

  const preview = document.createElement("section");
  preview.className = "python-preview-box";
  preview.innerHTML = `
    <div class="python-preview-header">
      <h4>Aperçu Python coloré</h4>
      <small>La couleur aide à repérer les rôles ; le texte et les mots-clés restent indispensables.</small>
    </div>
    <pre id="pythonHighlight" class="python-highlight" aria-label="Aperçu coloré du programme Python"></pre>
    <div class="python-tools">
      <button id="restoreMissionCode" type="button">↺ Restaurer le modèle de la mission</button>
      <button id="togglePythonPreview" type="button">Masquer l’aperçu coloré</button>
    </div>`;
  const commandHelp = document.getElementById("commandHelp");
  if (commandHelp) commandHelp.insertAdjacentElement("beforebegin", preview);
  else code.insertAdjacentElement("afterend", preview);

  const sequence = document.getElementById("algorithmSequence");
  const legend = document.getElementById("algorithmLegend");
  const highlight = document.getElementById("pythonHighlight");
  const loadNote = document.getElementById("pythonLoadNote");

  const escapeHtml = value => String(value).replace(/[&<>]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[character]));

  function highlightFragment(fragment) {
    let output = "";
    const token = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b(?:if|elif|else|and|or|not|True|False)\b|\b(?:lire_humidite|lire_reservoir|lire_lumiere)\b|\b(?:arroser)\b|\b(?:stop|alerter)\b|\b(?:afficher)\b|==|!=|<=|>=|<|>|=|\+|-|\*|\/)/g;
    let last = 0;
    let match;
    while ((match = token.exec(fragment))) {
      output += escapeHtml(fragment.slice(last, match.index));
      const value = match[0];
      let className = "py-operator";
      if (/^["']/.test(value)) className = "py-string";
      else if (/^\d/.test(value)) className = "py-number";
      else if (/^(if|elif|else)$/.test(value)) className = "py-decision";
      else if (/^(and|or|not|True|False)$/.test(value)) className = "py-keyword";
      else if (/^lire_/.test(value)) className = "py-reader";
      else if (value === "arroser") className = "py-action";
      else if (/^(stop|alerter)$/.test(value)) className = "py-safety";
      else if (value === "afficher") className = "py-output";
      output += `<span class="${className}">${escapeHtml(value)}</span>`;
      last = match.index + value.length;
    }
    return output + escapeHtml(fragment.slice(last));
  }

  function highlightLine(line) {
    let quote = null;
    let escaped = false;
    let commentIndex = -1;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (escaped) { escaped = false; continue; }
      if (character === "\\") { escaped = true; continue; }
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === "#") {
        commentIndex = index;
        break;
      }
    }
    const codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
    const commentPart = commentIndex >= 0 ? line.slice(commentIndex) : "";
    return highlightFragment(codePart) + (commentPart ? `<span class="py-comment">${escapeHtml(commentPart)}</span>` : "");
  }

  function renderPreview() {
    const value = code.value || "";
    highlight.innerHTML = value.split("\n").map(highlightLine).join("\n") || '<span class="py-comment"># Le programme est vide. Utilise le bouton « Restaurer le modèle ».</span>';
  }

  function activeIndex() {
    return typeof current === "number" && current >= 0 && current < missions.length ? current : 0;
  }

  function ensureCode() {
    const index = activeIndex();
    const missionState = state.missions?.[index];
    const mode = state.profile?.mode && missions[index].codes[state.profile.mode] ? state.profile.mode : "guided";
    if (!code.value.trim()) {
      const fallback = missionState?.code?.trim() ? missionState.code : missions[index].codes[mode] || missions[index].codes.guided;
      code.value = fallback;
      if (missionState) missionState.code = fallback;
      try { if (typeof sauver === "function") sauver(); } catch (error) { /* stockage indisponible */ }
      loadNote.innerHTML = '<strong>Programme restauré.</strong> Un ancien enregistrement vide empêchait probablement l’affichage du modèle.';
    } else {
      loadNote.innerHTML = '<strong>Éditeur Python prêt.</strong> La zone reste modifiable ; l’aperçu coloré se met à jour automatiquement.';
    }
    renderPreview();
  }

  function renderAlgorithm() {
    const index = activeIndex();
    const steps = algorithms[index] || algorithms[0];
    sequence.innerHTML = steps.map((step, position) => {
      const [type, verb, description] = step;
      return `${position ? '<div class="algorithm-arrow" aria-hidden="true">↓</div>' : ''}<div class="algorithm-step" style="--step-color:${colors[type][0]}"><strong>${verb}</strong><span>${description}</span></div>`;
    }).join("");
    const used = [...new Set(steps.map(step => step[0]))];
    legend.innerHTML = used.map(type => `<span style="--legend-color:${colors[type][0]}"><i aria-hidden="true"></i>${colors[type][1]}</span>`).join("");
  }

  function refreshMission() {
    window.setTimeout(() => {
      ensureCode();
      renderAlgorithm();
    }, 0);
  }

  code.addEventListener("input", renderPreview);
  document.getElementById("restoreMissionCode")?.addEventListener("click", () => {
    const index = activeIndex();
    const mode = state.profile?.mode && missions[index].codes[state.profile.mode] ? state.profile.mode : "guided";
    const restored = missions[index].codes[mode] || missions[index].codes.guided;
    code.value = restored;
    if (state.missions?.[index]) state.missions[index].code = restored;
    try { if (typeof sauver === "function") sauver(); } catch (error) { /* stockage indisponible */ }
    renderPreview();
    loadNote.innerHTML = `<strong>Modèle restauré.</strong> Le programme de la mission ${missions[index].id} est de nouveau visible.`;
  });

  document.getElementById("togglePythonPreview")?.addEventListener("click", event => {
    const hidden = highlight.hidden;
    highlight.hidden = !hidden;
    event.currentTarget.textContent = hidden ? "Masquer l’aperçu coloré" : "Afficher l’aperçu coloré";
  });

  const missionTitle = document.getElementById("missionTitle");
  if (missionTitle) new MutationObserver(refreshMission).observe(missionTitle, {childList:true, subtree:true});
  document.getElementById("difficultyMode")?.addEventListener("change", refreshMission);

  let previousValue = "";
  window.setInterval(() => {
    if (code.value !== previousValue) {
      previousValue = code.value;
      renderPreview();
    }
  }, 500);

  ensureCode();
  renderAlgorithm();
})();
