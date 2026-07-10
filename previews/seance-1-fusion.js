/*
 * Moteur de la prévisualisation fusionnée de la séance 1.
 * Il ajoute une coloration C++ de type IDE et une flèche jaune façon CodeCombat.
 */
"use strict";

(() => {
  // Raccourci pour récupérer un élément par son identifiant.
  const byId = id => document.getElementById(id);

  // Récupérer la configuration pédagogique de la séance.
  const config = window.TechnoQuestSessionTemplateConfig;

  // Arrêter proprement si la configuration n’est pas disponible.
  if (!config) return;

  // Définir la clé de sauvegarde locale propre à cette prévisualisation.
  const storageKey = "technoquest-seance-1-fusion-preview-v1";

  // Définir le programme guidé avec des emplacements explicites à compléter.
  const guidedCode = `// Mission 1 — Faire parler les capteurs.
// La flèche jaune indique la prochaine ligne à compléter.

// Étape 1 — Ajouter la bibliothèque Arduino.
____________________________

// Les broches utilisées par le jardin connecté.
const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Étape 2 — Initialiser le Moniteur Série à 9600 bauds.
  ____________________________;

  // Étape 3 — Configurer D6 en sortie.
  ____________________________;

  // Étape 4 — Garder la pompe arrêtée au démarrage.
  ____________________________;
}

void loop() {
  // Étape 5 — Lire l’humidité du sol sur A0.
  int humidite = ____________________________;

  // Étape 6 — Lire la lumière sur A1.
  int lumiere = ____________________________;

  // Étape 7 — Lire le niveau d’eau sur A2.
  int niveauEau = ____________________________;

  // Étape 8 — Afficher l’humidité.
  ____________________________;
  ____________________________;

  // Étape 9 — Afficher la lumière.
  ____________________________;
  ____________________________;

  // Étape 10 — Afficher le niveau d’eau.
  ____________________________;
  ____________________________;

  // Étape 11 — Maintenir la pompe arrêtée.
  ____________________________;

  // Étape 12 — Attendre une seconde.
  ____________________________;
}`;

  // Définir le programme accompagné avec des blocs plus larges à compléter.
  const standardCode = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Initialiser Serial, configurer D6 et sécuriser la pompe.
  ____________________________;
  ____________________________;
  ____________________________;
}

void loop() {
  // Lire A0, A1 et A2 dans trois variables.
  int humidite = ____________________________;
  int lumiere = ____________________________;
  int niveauEau = ____________________________;

  // Afficher les trois mesures.
  ____________________________;
  ____________________________;
  ____________________________;
  ____________________________;
  ____________________________;
  ____________________________;

  // Garder D6 à LOW puis attendre une seconde.
  ____________________________;
  ____________________________;
}`;

  // Définir le contrat du niveau autonome.
  const autonomousCode = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Mission autonome : initialiser Serial et sécuriser D6.
}

void loop() {
  // Mission autonome :
  // 1. Lire A0, A1 et A2.
  // 2. Afficher les trois mesures.
  // 3. Garder la pompe arrêtée.
  // 4. Attendre une seconde.
}`;

  // Définir le programme de référence complet.
  const referenceCode = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.print("Humidité : ");
  Serial.println(humidite);
  Serial.print("Lumière : ");
  Serial.println(lumiere);
  Serial.print("Niveau d'eau : ");
  Serial.println(niveauEau);

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);
}`;

  // Regrouper les trois niveaux d’aide.
  const starters = {
    guided: guidedCode,
    standard: standardCode,
    autonomous: autonomousCode
  };

  // Décrire les critères automatiques et la zone vers laquelle la flèche doit pointer.
  const checks = [
    {
      id: "include",
      label: "La bibliothèque Arduino est incluse.",
      marker: "Étape 1",
      test: source => /#include\s*<Arduino\.h>/.test(source)
    },
    {
      id: "serial",
      label: "Le Moniteur Série est initialisé à 9600 bauds.",
      marker: "Étape 2",
      test: source => /Serial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/.test(source)
    },
    {
      id: "pinmode",
      label: "D6 est configurée comme une sortie.",
      marker: "Étape 3",
      test: source => /pinMode\s*\(\s*PIN_RELAIS_POMPE\s*,\s*OUTPUT\s*\)\s*;/.test(source)
    },
    {
      id: "safe-setup",
      label: "La pompe est arrêtée dans setup().",
      marker: "Étape 4",
      test: source => countMatches(source, /digitalWrite\s*\(\s*PIN_RELAIS_POMPE\s*,\s*LOW\s*\)\s*;/g) >= 1
    },
    {
      id: "read-a0",
      label: "A0 est lu dans la variable humidite.",
      marker: "Étape 5",
      test: source => /int\s+humidite\s*=\s*analogRead\s*\(\s*PIN_HUMIDITE_SOL\s*\)\s*;/.test(source)
    },
    {
      id: "read-a1",
      label: "A1 est lu dans la variable lumiere.",
      marker: "Étape 6",
      test: source => /int\s+lumiere\s*=\s*analogRead\s*\(\s*PIN_LUMIERE\s*\)\s*;/.test(source)
    },
    {
      id: "read-a2",
      label: "A2 est lu dans la variable niveauEau.",
      marker: "Étape 7",
      test: source => /int\s+niveauEau\s*=\s*analogRead\s*\(\s*PIN_NIVEAU_EAU\s*\)\s*;/.test(source)
    },
    {
      id: "show-a0",
      label: "La mesure d’humidité est affichée.",
      marker: "Étape 8",
      test: source => /Serial\s*\.\s*(?:print|println)\s*\([^;]*humidite[^;]*\)\s*;/.test(source)
    },
    {
      id: "show-a1",
      label: "La mesure de lumière est affichée.",
      marker: "Étape 9",
      test: source => /Serial\s*\.\s*(?:print|println)\s*\([^;]*lumiere[^;]*\)\s*;/.test(source)
    },
    {
      id: "show-a2",
      label: "La mesure de niveau d’eau est affichée.",
      marker: "Étape 10",
      test: source => /Serial\s*\.\s*(?:print|println)\s*\([^;]*niveauEau[^;]*\)\s*;/.test(source)
    },
    {
      id: "safe-loop",
      label: "La pompe reste arrêtée dans loop().",
      marker: "Étape 11",
      test: source => countMatches(source, /digitalWrite\s*\(\s*PIN_RELAIS_POMPE\s*,\s*LOW\s*\)\s*;/g) >= 2
    },
    {
      id: "delay",
      label: "Le programme attend une seconde.",
      marker: "Étape 12",
      test: source => /delay\s*\(\s*1000\s*\)\s*;/.test(source)
    }
  ];

  // Définir les objectifs à cocher par l’élève.
  const microObjectives = [
    "repérer les trois entrées analogiques A0, A1 et A2",
    "expliquer le rôle de D6 et du relais",
    "lire une entrée analogique avec analogRead()",
    "afficher une mesure avec Serial.print() et Serial.println()",
    "maintenir la pompe dans un état sûr"
  ];

  // Définir l’état par défaut de la page.
  const defaultState = {
    mode: "classic",
    guidance: "guided",
    code: guidedCode,
    reflection: "",
    objectives: {},
    scores: {},
    validation: {}
  };

  // Charger l’état enregistré dans le navigateur.
  const loadState = () => {
    try {
      return { ...defaultState, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch {
      return { ...defaultState };
    }
  };

  // Conserver l’état courant en mémoire.
  let state = loadState();

  // Conserver la ligne actuellement ciblée par la flèche.
  let currentTargetLine = 0;

  // Conserver un minuteur pour ne pas déplacer le curseur à chaque frappe.
  let caretTimer = 0;

  // Enregistrer l’état courant.
  const saveState = () => localStorage.setItem(storageKey, JSON.stringify(state));

  // Compter le nombre d’occurrences d’une expression régulière.
  function countMatches(source, expression) {
    return (String(source).match(expression) || []).length;
  }

  // Échapper les caractères réservés du HTML.
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

  // Retirer les commentaires avant d’appliquer les tests automatiques.
  const stripComments = code => String(code)
    .split("\n")
    .map(line => line.replace(/\/\/.*$/, ""))
    .join("\n");

  // Rechercher l’index du commentaire marqueur associé à un critère.
  const findMarkerLine = (lines, marker) => {
    const markerIndex = lines.findIndex(line => line.includes(marker));
    if (markerIndex < 0) return -1;

    // Chercher d’abord un emplacement souligné juste après le marqueur.
    for (let index = markerIndex + 1; index <= Math.min(lines.length - 1, markerIndex + 4); index += 1) {
      if (/_{3,}/.test(lines[index])) return index;
      if (lines[index].trim() && !lines[index].trim().startsWith("//")) return index;
    }

    // Revenir au commentaire si aucune ligne cible n’est disponible.
    return markerIndex;
  };

  // Valider le code et déterminer le premier critère manquant.
  const validateCode = () => {
    const code = byId("codeEditor").value;
    const source = stripComments(code);
    const lines = code.split("\n");
    const validation = {};

    // Tester chaque critère indépendamment.
    checks.forEach(check => {
      validation[check.id] = Boolean(check.test(source));
    });

    // Rechercher le premier critère qui n’est pas encore satisfait.
    const firstMissing = checks.find(check => !validation[check.id]) || null;

    // Rechercher d’abord le premier emplacement explicite composé de tirets bas.
    const placeholderLine = lines.findIndex(line => /_{3,}/.test(line));

    // Utiliser l’emplacement explicite, puis le marqueur du critère manquant.
    const targetLine = placeholderLine >= 0
      ? placeholderLine
      : firstMissing
        ? Math.max(0, findMarkerLine(lines, firstMissing.marker))
        : -1;

    // Enregistrer les résultats pour la progression.
    state.validation = validation;
    state.code = code;
    saveState();

    // Retourner toutes les informations utiles à l’interface.
    return { code, source, lines, validation, firstMissing, targetLine };
  };

  // Découper une ligne en partie code et commentaire sans casser les chaînes.
  const splitComment = line => {
    let quote = null;
    let escaped = false;

    for (let index = 0; index < line.length - 1; index += 1) {
      const character = line[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === "\\") {
        escaped = true;
        continue;
      }

      if (quote) {
        if (character === quote) quote = null;
        continue;
      }

      if (character === '"' || character === "'") {
        quote = character;
        continue;
      }

      if (character === "/" && line[index + 1] === "/") {
        return { code: line.slice(0, index), comment: line.slice(index) };
      }
    }

    return { code: line, comment: "" };
  };

  // Colorer les principaux éléments du langage C++ Arduino.
  const highlightFragment = source => {
    const tokenExpression = /(_{3,}|<[A-Za-z_][\w.\/-]*>|#[A-Za-z_]\w*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b(?:const|void|int|long|float|double|bool|char|byte|unsigned|signed|return|if|else|for|while|do|switch|case|break|continue)\b|\b(?:LOW|HIGH|OUTPUT|INPUT|INPUT_PULLUP|A0|A1|A2)\b|\b(?:setup|loop|pinMode|analogRead|analogWrite|digitalRead|digitalWrite|delay|millis)\b|\b(?:Serial|begin|print|println|available|read)\b|==|!=|<=|>=|&&|\|\||\+\+|--|[=+\-*\/%<>!&|.;,:(){}\[\]])/g;
    let html = "";
    let lastIndex = 0;
    let match;

    while ((match = tokenExpression.exec(source))) {
      html += escapeHtml(source.slice(lastIndex, match.index));
      const value = match[0];
      let className = "fusion-token-operator";

      if (/^_{3,}$/.test(value)) className = "fusion-token-placeholder";
      else if (value.startsWith("#")) className = "fusion-token-preprocessor";
      else if (/^<.*>$/.test(value)) className = "fusion-token-header";
      else if (/^["']/.test(value)) className = "fusion-token-string";
      else if (/^\d/.test(value)) className = "fusion-token-number";
      else if (/^(const|return|if|else|for|while|do|switch|case|break|continue)$/.test(value)) className = "fusion-token-keyword";
      else if (/^(void|int|long|float|double|bool|char|byte|unsigned|signed)$/.test(value)) className = "fusion-token-type";
      else if (/^(LOW|HIGH|OUTPUT|INPUT|INPUT_PULLUP|A0|A1|A2)$/.test(value)) className = "fusion-token-constant";
      else if (/^(setup|loop|pinMode|analogRead|analogWrite|digitalRead|digitalWrite|delay|millis)$/.test(value)) className = "fusion-token-function";
      else if (/^(Serial|begin|print|println|available|read)$/.test(value)) className = "fusion-token-serial";

      html += `<span class="${className}">${escapeHtml(value)}</span>`;
      lastIndex = match.index + value.length;
    }

    return html + escapeHtml(source.slice(lastIndex));
  };

  // Colorer une ligne complète en préservant le commentaire.
  const highlightLine = line => {
    const parts = splitComment(line);
    const code = highlightFragment(parts.code);
    const comment = parts.comment
      ? `<span class="fusion-token-comment">${escapeHtml(parts.comment)}</span>`
      : "";
    return code + comment;
  };

  // Mettre à jour les numéros, les couleurs et la flèche jaune.
  const renderEditor = (moveCaret = false) => {
    const editor = byId("codeEditor");
    const highlight = byId("codeHighlight");
    const lineNumbers = byId("lineNumbers");
    const arrow = byId("codeArrow");
    const result = validateCode();

    // Déterminer la ligne cible actuelle.
    currentTargetLine = result.targetLine;

    // Construire la couche de coloration ligne par ligne.
    highlight.innerHTML = result.lines.map((line, index) => {
      const targetClass = index === currentTargetLine ? " is-target" : "";
      return `<span class="fusion-code-line${targetClass}">${highlightLine(line) || " "}</span>`;
    }).join("\n");

    // Construire la colonne des numéros de ligne.
    lineNumbers.innerHTML = result.lines.map((_, index) => {
      const targetClass = index === currentTargetLine ? " class=\"is-target\"" : "";
      return `<span${targetClass}>${index + 1}</span>`;
    }).join("");

    // Masquer la flèche lorsque tous les critères sont validés.
    arrow.classList.toggle("is-complete", currentTargetLine < 0);

    // Synchroniser le défilement des couches visuelles.
    syncEditorScroll();

    // Déplacer le curseur uniquement lorsque cela est demandé.
    if (moveCaret && currentTargetLine >= 0) moveCaretToTarget(result.lines, currentTargetLine);

    // Mettre à jour les critères et la progression.
    renderChecks(result.validation);
    updateProgress();

    // Retourner le résultat pour les autres actions.
    return result;
  };

  // Synchroniser le texte coloré, les numéros et la flèche avec le défilement du textarea.
  const syncEditorScroll = () => {
    const editor = byId("codeEditor");
    const highlight = byId("codeHighlight");
    const lineNumbers = byId("lineNumbers");
    const arrow = byId("codeArrow");
    const style = getComputedStyle(editor);
    const lineHeight = parseFloat(style.lineHeight) || 24.8;
    const paddingTop = parseFloat(style.paddingTop) || 16;

    // Reproduire le défilement dans la couche colorée.
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;

    // Reproduire le défilement vertical dans la colonne de numéros.
    lineNumbers.scrollTop = editor.scrollTop;

    // Placer la flèche exactement sur la ligne cible visible.
    arrow.style.top = `${paddingTop + currentTargetLine * lineHeight - editor.scrollTop}px`;
  };

  // Calculer la sélection correspondant à une ligne ou à son emplacement souligné.
  const selectionForLine = (lines, lineIndex) => {
    const safeIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));
    const startOfLine = lines.slice(0, safeIndex).reduce((total, line) => total + line.length + 1, 0);
    const line = lines[safeIndex] || "";
    const placeholder = line.match(/_{3,}/);

    if (placeholder && typeof placeholder.index === "number") {
      const start = startOfLine + placeholder.index;
      return { start, end: start + placeholder[0].length };
    }

    const indentation = line.match(/^\s*/)?.[0].length || 0;
    const position = startOfLine + indentation;
    return { start: position, end: position };
  };

  // Déplacer le véritable curseur du textarea sur la ligne montrée par la flèche.
  const moveCaretToTarget = (lines, lineIndex) => {
    const editor = byId("codeEditor");
    const selection = selectionForLine(lines, lineIndex);
    const style = getComputedStyle(editor);
    const lineHeight = parseFloat(style.lineHeight) || 24.8;
    const paddingTop = parseFloat(style.paddingTop) || 16;
    const desiredTop = paddingTop + lineIndex * lineHeight - editor.clientHeight * 0.35;
    const maximumTop = Math.max(0, editor.scrollHeight - editor.clientHeight);

    // Faire apparaître la ligne cible dans la zone centrale de l’éditeur.
    editor.scrollTop = Math.max(0, Math.min(maximumTop, desiredTop));

    // Donner le focus et sélectionner l’emplacement à compléter.
    editor.focus({ preventScroll: true });
    editor.setSelectionRange(selection.start, selection.end);

    // Réaligner toutes les couches après le déplacement.
    syncEditorScroll();
  };

  // Afficher les résultats de validation dans la phase Tester.
  const renderChecks = validation => {
    byId("automaticCheckList").innerHTML = checks.map(check => {
      const valid = Boolean(validation[check.id]);
      const className = valid ? "is-valid" : "is-pending";
      const icon = valid ? "✓" : "·";
      return `<li class="${className}"><span class="tq-check-state">${icon}</span><span>${escapeHtml(check.label)}</span></li>`;
    }).join("");
  };

  // Construire l’algorigramme visuel.
  const renderAlgorithm = () => {
    const flow = byId("algorithmFlow");
    flow.innerHTML = "";

    config.algorithm.forEach((step, index) => {
      const node = document.createElement("div");
      node.className = `tq-flow-node tq-flow-node--${step.type}`;
      node.dataset.step = step.id;
      node.innerHTML = `<span>${escapeHtml(step.label)}</span>`;
      flow.appendChild(node);

      if (index < config.algorithm.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "tq-flow-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        flow.appendChild(arrow);
      }
    });
  };

  // Jouer la progression visuelle de l’algorigramme.
  const playAlgorithm = async () => {
    const nodes = [...document.querySelectorAll(".tq-flow-node")];

    for (const node of nodes) {
      nodes.forEach(item => item.classList.remove("is-active"));
      node.classList.add("is-active");
      await new Promise(resolve => window.setTimeout(resolve, 430));
    }

    nodes.forEach(item => item.classList.remove("is-active"));
  };

  // Construire les micro-objectifs.
  const renderMicroObjectives = () => {
    byId("microObjectiveList").innerHTML = microObjectives.map((objective, index) => {
      const checked = state.objectives[index] ? "checked" : "";
      return `<label><input type="checkbox" data-objective="${index}" ${checked}><span>Je sais ${escapeHtml(objective)}.</span></label>`;
    }).join("");
  };

  // Construire la grille d’évaluation du Mode Mission.
  const renderAssessment = () => {
    byId("assessmentGrid").innerHTML = config.assessment.map((criterion, index) => {
      const value = Number(state.scores[index] || 0);
      return `<div class="tq-assessment-item"><label for="score-${index}"><span>${escapeHtml(criterion.label)}</span><strong><span data-score-value="${index}">${value}</span> / ${criterion.points}</strong></label><input id="score-${index}" type="range" min="0" max="${criterion.points}" step="1" value="${value}" data-score-index="${index}"></div>`;
    }).join("");
    updateScore();
  };

  // Calculer le total de la grille d’évaluation.
  const updateScore = () => {
    const total = config.assessment.reduce((sum, criterion, index) => sum + Math.min(Number(state.scores[index] || 0), criterion.points), 0);
    const maximum = config.assessment.reduce((sum, criterion) => sum + criterion.points, 0);
    byId("scoreTotal").textContent = `${total} / ${maximum}`;
  };

  // Basculer l’affichage entre Mode Classique et Mode Mission.
  const renderMode = () => {
    const isMission = state.mode === "mission";
    byId("classicModeButton").classList.toggle("tq-button--active", !isMission);
    byId("missionModeButton").classList.toggle("tq-button--active", isMission);
    byId("classicModeButton").setAttribute("aria-pressed", String(!isMission));
    byId("missionModeButton").setAttribute("aria-pressed", String(isMission));
    byId("phase6").hidden = !isMission;
    updateProgress();
  };

  // Calculer la progression pédagogique de la page.
  const updateProgress = () => {
    const validChecks = checks.filter(check => state.validation[check.id]).length;
    const completedObjectives = microObjectives.filter((_, index) => state.objectives[index]).length;
    const reflectionPoint = state.reflection.trim().length >= 40 ? 1 : 0;
    const total = checks.length + microObjectives.length + 1;
    const completed = validChecks + completedObjectives + reflectionPoint;
    const percent = Math.round((completed / total) * 100);
    byId("sessionProgressText").textContent = `${percent} %`;
    byId("sessionProgressBar").style.width = `${percent}%`;
  };

  // Afficher un retour sous l’éditeur.
  const showFeedback = (message, type = "neutral") => {
    const feedback = byId("codeFeedback");
    feedback.textContent = message;
    feedback.classList.toggle("is-success", type === "success");
    feedback.classList.toggle("is-error", type === "error");
  };

  // Écrire dans le Moniteur Série simulé.
  const writeSerial = lines => {
    byId("serialMonitor").textContent = lines.join("\n");
  };

  // Vérifier le programme sans l’exécuter.
  const checkCode = () => {
    const result = renderEditor(true);
    const missing = checks.filter(check => !result.validation[check.id]);

    if (!missing.length && !/_{3,}/.test(result.code)) {
      showFeedback("Tous les critères sont validés. Le programme peut être exécuté.", "success");
      return;
    }

    showFeedback(`${missing.length} critère(s) restent à compléter. La flèche jaune montre la prochaine ligne.`, "error");
  };

  // Exécuter la simulation lorsque tous les critères sont satisfaits.
  const runCode = async () => {
    const result = renderEditor(true);
    const missing = checks.filter(check => !result.validation[check.id]);

    if (missing.length || /_{3,}/.test(result.code)) {
      showFeedback("Programme incomplet : corrige la ligne indiquée par la flèche jaune.", "error");
      writeSerial(["[Erreur] Exécution interrompue.", ...missing.slice(0, 5).map(check => `• ${check.label}`)]);
      return;
    }

    // Activer les animations du véritable jumeau numérique.
    const twinHost = byId("templateTwin");
    twinHost.classList.add("is-running");

    // Mettre à jour le message situé sous le jumeau.
    const twinStatus = byId("twinStatus");
    if (twinStatus) twinStatus.textContent = "A0, A1 et A2 sont lus ; D6 reste à LOW ; la pompe demeure arrêtée.";

    // Synchroniser l’algorigramme avec l’exécution simulée.
    await playAlgorithm();

    // Afficher les valeurs pédagogiques de la mission 1.
    writeSerial([
      "[Moniteur Série simulé — 9600 bauds]",
      `Humidité : ${config.simulation.humidity}`,
      `Lumière : ${config.simulation.light}`,
      `Niveau d'eau : ${config.simulation.water}`,
      `D6 = ${config.simulation.relayState}`,
      `Pompe ${config.simulation.pumpState}`,
      "[Attente de 1000 ms — nouvelle boucle]"
    ]);

    // Confirmer la réussite.
    showFeedback("Programme validé : les trois capteurs communiquent sans démarrer la pompe.", "success");

    // Arrêter l’animation après un court délai.
    window.setTimeout(() => twinHost.classList.remove("is-running"), 1200);
  };

  // Lancer uniquement l’observation du jumeau numérique.
  const runTwinObservation = () => {
    const twinHost = byId("templateTwin");
    twinHost.classList.add("is-running");
    const twinStatus = byId("twinStatus");
    if (twinStatus) twinStatus.textContent = "Observe A0, A1, A2 et D6. Les liaisons analogiques transmettent des mesures.";
    window.setTimeout(() => twinHost.classList.remove("is-running"), 2500);
  };

  // Restaurer le squelette correspondant au niveau d’aide choisi.
  const restoreCode = () => {
    const starter = starters[state.guidance];

    if (byId("codeEditor").value.trim() && byId("codeEditor").value !== starter && !window.confirm("Restaurer le squelette remplacera le code actuel. Continuer ?")) return;

    state.code = starter;
    state.validation = {};
    saveState();
    byId("codeEditor").value = starter;
    renderEditor(true);
    showFeedback("Le squelette du niveau choisi a été restauré.");
  };

  // Charger le programme complet pour tester l’ensemble du parcours.
  const loadReference = () => {
    if (!window.confirm("Charger l’exemple complet remplacera le code actuel. Continuer ?")) return;
    state.code = referenceCode;
    saveState();
    byId("codeEditor").value = referenceCode;
    renderEditor(false);
    showFeedback("Exemple complet chargé. Tu peux maintenant cliquer sur Exécuter.", "success");
  };

  // Changer de niveau d’aide.
  const changeGuidance = event => {
    const nextGuidance = event.target.value;
    const nextStarter = starters[nextGuidance];

    if (byId("codeEditor").value.trim() && byId("codeEditor").value !== starters[state.guidance] && !window.confirm("Changer de niveau remplacera le code actuel. Continuer ?")) {
      event.target.value = state.guidance;
      return;
    }

    state.guidance = nextGuidance;
    state.code = nextStarter;
    state.validation = {};
    saveState();
    byId("codeEditor").value = nextStarter;
    renderEditor(true);
    showFeedback(`Niveau sélectionné : ${event.target.options[event.target.selectedIndex].text}.`);
  };

  // Copier le code courant.
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(byId("codeEditor").value);
      showFeedback("Code copié dans le presse-papiers.", "success");
    } catch {
      showFeedback("La copie automatique n’est pas disponible dans ce navigateur.", "error");
    }
  };

  // Télécharger le code courant au format Arduino.
  const downloadCode = () => {
    const blob = new Blob([byId("codeEditor").value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mission-1-faire-parler-les-capteurs.ino";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Effacer le Moniteur Série.
  const clearSerial = () => writeSerial(["[Moniteur Série] En attente d’exécution…"]);

  // Réagir à la saisie sans voler immédiatement le curseur de l’élève.
  const handleCodeInput = () => {
    state.code = byId("codeEditor").value;
    saveState();
    const previousLine = currentTargetLine;
    const result = renderEditor(false);

    // Déplacer le curseur seulement lorsque l’élève vient de terminer une étape.
    if (result.targetLine !== previousLine) {
      window.clearTimeout(caretTimer);
      caretTimer = window.setTimeout(() => renderEditor(true), 260);
    }
  };

  // Réagir aux cases « Je sais faire ».
  const handleObjective = event => {
    const input = event.target.closest("[data-objective]");
    if (!input) return;
    state.objectives[input.dataset.objective] = input.checked;
    saveState();
    updateProgress();
  };

  // Réagir à la réponse argumentée.
  const handleReflection = event => {
    state.reflection = event.target.value;
    saveState();
    byId("reflectionStatus").textContent = state.reflection.trim().length >= 40
      ? "Réponse suffisamment développée et enregistrée."
      : "La réponse est enregistrée automatiquement dans ce navigateur.";
    updateProgress();
  };

  // Réagir aux curseurs de notation.
  const handleScore = event => {
    const input = event.target.closest("[data-score-index]");
    if (!input) return;
    const index = input.dataset.scoreIndex;
    state.scores[index] = Number(input.value);
    document.querySelector(`[data-score-value="${index}"]`).textContent = input.value;
    saveState();
    updateScore();
  };

  // Relier les boutons et champs à leurs fonctions.
  const bindEvents = () => {
    byId("classicModeButton").addEventListener("click", () => {
      state.mode = "classic";
      saveState();
      renderMode();
    });

    byId("missionModeButton").addEventListener("click", () => {
      state.mode = "mission";
      saveState();
      renderMode();
      byId("phase6").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    byId("guidanceLevel").addEventListener("change", changeGuidance);
    byId("checkCodeButton").addEventListener("click", checkCode);
    byId("runCodeButton").addEventListener("click", runCode);
    byId("restoreCodeButton").addEventListener("click", restoreCode);
    byId("loadReferenceButton").addEventListener("click", loadReference);
    byId("copyCodeButton").addEventListener("click", copyCode);
    byId("downloadCodeButton").addEventListener("click", downloadCode);
    byId("clearSerialButton").addEventListener("click", clearSerial);
    byId("twinDemoButton").addEventListener("click", runTwinObservation);
    byId("algorithmReplayButton").addEventListener("click", playAlgorithm);
    byId("codeEditor").addEventListener("input", handleCodeInput);
    byId("codeEditor").addEventListener("scroll", syncEditorScroll, { passive: true });
    byId("microObjectiveList").addEventListener("change", handleObjective);
    byId("reflectionText").addEventListener("input", handleReflection);
    byId("assessmentGrid").addEventListener("input", handleScore);
  };

  // Initialiser toute la page dans un ordre stable.
  const initialize = () => {
    byId("guidanceLevel").value = state.guidance;
    byId("codeEditor").value = state.code || starters[state.guidance];
    byId("reflectionText").value = state.reflection || "";
    renderAlgorithm();
    renderMicroObjectives();
    renderAssessment();
    renderMode();
    bindEvents();
    renderEditor(true);
    updateProgress();
  };

  // Attendre que le document soit disponible avant l’initialisation.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
