/*
 * TechnoQuest — moteur autonome du template réutilisable.
 *
 * Ce fichier sert de démonstration et de référence de structure.
 * Il ne remplace pas mission-mode/mission-mode.js ni session-code-v3.js.
 */
"use strict";

(() => {
  // Récupérer la configuration déclarée avant ce script.
  const config = window.TechnoQuestSessionTemplateConfig;

  // Arrêter proprement si la configuration n’existe pas.
  if (!config) {
    console.error("TechnoQuest : configuration du template introuvable.");
    return;
  }

  // Créer un raccourci de sélection d’un élément par identifiant.
  const byId = id => document.getElementById(id);

  // Construire la clé de sauvegarde propre à la séance d’exemple.
  const storageKey = `technoquest-template-session-${config.id}`;

  // Définir l’état initial du template.
  const initialState = {
    mode: "classic",
    guidance: "guided",
    code: config.starters.guided,
    reflection: "",
    microObjectives: {},
    scores: {},
    checkedPhases: {},
    lastValidation: {}
  };

  // Charger une sauvegarde locale en conservant les valeurs par défaut manquantes.
  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        ...initialState,
        ...saved,
        microObjectives: { ...initialState.microObjectives, ...(saved.microObjectives || {}) },
        scores: { ...initialState.scores, ...(saved.scores || {}) },
        checkedPhases: { ...initialState.checkedPhases, ...(saved.checkedPhases || {}) },
        lastValidation: { ...initialState.lastValidation, ...(saved.lastValidation || {}) }
      };
    } catch {
      return { ...initialState };
    }
  };

  // Conserver l’état courant en mémoire.
  let state = loadState();

  // Enregistrer l’état courant dans le navigateur.
  const saveState = () => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  // Échapper les caractères HTML lors de la création de texte dynamique.
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

  // Calculer le pourcentage global du parcours.
  const globalPercent = Math.round((config.id / config.totalSessions) * 100);

  // Remplir les informations générales de l’en-tête.
  const renderIdentity = () => {
    byId("sessionEyebrow").textContent = `Séance ${config.id} sur ${config.totalSessions}`;
    byId("sessionTitle").textContent = config.title;
    byId("sessionSubtitle").textContent = config.subtitle;
    byId("sessionContext").textContent = config.context;
    byId("globalProgressText").textContent = `${config.id} / ${config.totalSessions}`;
    byId("globalProgressBar").style.width = `${globalPercent}%`;
    byId("homeLink").href = config.homeUrl;
    byId("previousSessionLink").href = config.previousUrl;
    byId("nextSessionLink").href = config.nextUrl;
    document.title = `Séance ${config.id} — ${config.title} — TechnoQuest`;
  };

  // Construire la liste des objectifs pédagogiques.
  const renderObjectives = () => {
    byId("objectiveList").innerHTML = config.objectives
      .map(objective => `<li>${escapeHtml(objective)}</li>`)
      .join("");
  };

  // Construire l’algorigramme à partir du tableau de configuration.
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

  // Construire la liste des contrôles automatiques.
  const renderAutomaticChecks = () => {
    const list = byId("automaticCheckList");
    list.innerHTML = config.checks.map(check => {
      const isValid = Boolean(state.lastValidation[check.id]);
      const className = isValid ? "is-valid" : "";
      const icon = isValid ? "✓" : "·";
      return `<li class="${className}" data-check-id="${escapeHtml(check.id)}"><span class="tq-check-state">${icon}</span><span>${escapeHtml(check.label)}</span></li>`;
    }).join("");
  };

  // Construire les micro-objectifs à cocher par l’élève.
  const renderMicroObjectives = () => {
    const container = byId("microObjectiveList");
    container.innerHTML = config.objectives.map((objective, index) => {
      const checked = state.microObjectives[index] ? "checked" : "";
      return `<label><input type="checkbox" data-micro-objective="${index}" ${checked}><span>Je sais ${escapeHtml(objective.charAt(0).toLowerCase() + objective.slice(1))}</span></label>`;
    }).join("");
  };

  // Construire les critères et curseurs de notation du Mode Mission.
  const renderAssessment = () => {
    const grid = byId("assessmentGrid");
    grid.innerHTML = config.assessment.map((criterion, index) => {
      const value = Number(state.scores[index] || 0);
      return `<div class="tq-assessment-item"><label for="score-${index}"><span>${escapeHtml(criterion.label)}</span><strong><span data-score-value="${index}">${value}</span> / ${criterion.points}</strong></label><input id="score-${index}" type="range" min="0" max="${criterion.points}" step="1" value="${value}" data-score-index="${index}"></div>`;
    }).join("");
    updateScoreTotal();
  };

  // Calculer et afficher le total de la grille d’évaluation.
  const updateScoreTotal = () => {
    const total = config.assessment.reduce((sum, criterion, index) => {
      const value = Math.min(Number(state.scores[index] || 0), criterion.points);
      return sum + value;
    }, 0);
    const maximum = config.assessment.reduce((sum, criterion) => sum + criterion.points, 0);
    byId("scoreTotal").textContent = `${total} / ${maximum}`;
  };

  // Afficher le code correspondant au niveau d’aide courant.
  const renderCode = () => {
    byId("guidanceLevel").value = state.guidance;
    byId("codeEditor").value = state.code || config.starters[state.guidance];
  };

  // Afficher le texte réflexif sauvegardé.
  const renderReflection = () => {
    byId("reflectionText").value = state.reflection || "";
  };

  // Basculer entre Mode Classique et Mode Mission.
  const renderMode = () => {
    const isMission = state.mode === "mission";
    const classicButton = byId("classicModeButton");
    const missionButton = byId("missionModeButton");
    const missionSection = byId("phase6");

    classicButton.classList.toggle("tq-button--active", !isMission);
    missionButton.classList.toggle("tq-button--active", isMission);
    classicButton.setAttribute("aria-pressed", String(!isMission));
    missionButton.setAttribute("aria-pressed", String(isMission));
    missionSection.hidden = !isMission;

    updateProgress();
  };

  // Mettre à jour la progression de la séance à partir des actions réalisées.
  const updateProgress = () => {
    const totalChecks = config.checks.length;
    const validChecks = config.checks.filter(check => state.lastValidation[check.id]).length;
    const totalObjectives = config.objectives.length;
    const completedObjectives = config.objectives.filter((_, index) => state.microObjectives[index]).length;
    const reflectionCompleted = state.reflection.trim().length >= 30 ? 1 : 0;
    const missionBonus = state.mode === "mission" ? 1 : 0;
    const total = totalChecks + totalObjectives + 1 + missionBonus;
    const completed = validChecks + completedObjectives + reflectionCompleted + missionBonus;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    byId("sessionProgressText").textContent = `${percent} %`;
    byId("sessionProgressBar").style.width = `${percent}%`;
  };

  // Retirer les commentaires afin d’éviter les faux positifs de validation.
  const stripComments = code => code
    .split("\n")
    .map(line => line.replace(/\/\/.*$/, ""))
    .join("\n");

  // Vérifier le programme à partir des expressions régulières de configuration.
  const validateCode = () => {
    const source = stripComments(byId("codeEditor").value);
    const results = {};

    config.checks.forEach(check => {
      const expression = new RegExp(check.pattern, "m");
      results[check.id] = expression.test(source);
    });

    // Considérer les longues suites de tirets bas comme des zones encore incomplètes.
    const hasPlaceholder = /_{4,}/.test(source);

    // Invalider le résultat global si le squelette contient encore un blanc.
    if (hasPlaceholder) {
      results.placeholders = false;
    }

    // Enregistrer la validation courante.
    state.lastValidation = results;
    state.code = byId("codeEditor").value;
    saveState();

    // Actualiser la liste des critères.
    renderAutomaticChecks();
    updateProgress();

    // Retourner un résumé pratique.
    const missing = config.checks.filter(check => !results[check.id]);
    return { source, results, missing, hasPlaceholder };
  };

  // Afficher un message de feedback sous l’éditeur.
  const showFeedback = (message, type = "neutral") => {
    const feedback = byId("codeFeedback");
    feedback.textContent = message;
    feedback.classList.toggle("is-success", type === "success");
    feedback.classList.toggle("is-error", type === "error");
  };

  // Écrire une ou plusieurs lignes dans le moniteur série simulé.
  const writeSerial = lines => {
    byId("serialMonitor").textContent = lines.join("\n");
  };

  // Mettre en évidence successivement les étapes de l’algorigramme.
  const playAlgorithm = async () => {
    const nodes = [...document.querySelectorAll(".tq-flow-node")];

    for (const node of nodes) {
      nodes.forEach(item => item.classList.remove("is-active"));
      node.classList.add("is-active");
      await new Promise(resolve => window.setTimeout(resolve, 450));
    }

    nodes.forEach(item => item.classList.remove("is-active"));
  };

  // Exécuter la simulation pédagogique après validation du programme.
  const runSimulation = async () => {
    const validation = validateCode();

    if (validation.hasPlaceholder || validation.missing.length) {
      const messages = validation.missing.map(check => `• ${check.label}`);
      if (validation.hasPlaceholder) messages.unshift("• Remplacer les zones ______ par du code valide.");
      showFeedback(`Programme incomplet : ${validation.missing.length + Number(validation.hasPlaceholder)} point(s) à corriger.`, "error");
      writeSerial(["[Erreur] Le programme n’a pas été exécuté.", ...messages]);
      return;
    }

    // Lire les valeurs reproductibles de la simulation.
    const { humidity, threshold, relayState, pumpState } = config.simulation;
    const soilState = humidity < threshold ? "Sol sec" : "Sol humide";

    // Activer l’animation simplifiée du jumeau.
    byId("templateTwin").classList.add("is-running");
    byId("twinHumidityValue").textContent = humidity;
    byId("twinStatus").textContent = `A0 = ${humidity} ; seuil = ${threshold} ; D6 = ${relayState}.`;
    byId("twinPump").classList.add("is-safe");

    // Jouer l’algorigramme de manière synchronisée.
    await playAlgorithm();

    // Afficher le résultat simulé comme un véritable moniteur série pédagogique.
    writeSerial([
      "[Moniteur série simulé — 9600 bauds]",
      `A0 = ${humidity}`,
      `Seuil = ${threshold}`,
      soilState,
      `D6 = ${relayState}`,
      `Pompe ${pumpState}`,
      "[Fin de la boucle simulée]"
    ]);

    // Arrêter l’animation après un court délai.
    window.setTimeout(() => byId("templateTwin").classList.remove("is-running"), 900);

    // Confirmer la réussite.
    showFeedback("Programme reconnu : l’exécution pédagogique est réussie.", "success");
  };

  // Vérifier le programme sans lancer la simulation.
  const checkCodeOnly = () => {
    const validation = validateCode();

    if (!validation.hasPlaceholder && validation.missing.length === 0) {
      showFeedback("Tous les critères automatiques sont validés.", "success");
      return;
    }

    const count = validation.missing.length + Number(validation.hasPlaceholder);
    showFeedback(`${count} critère(s) restent à corriger. Consulte la liste de validation.`, "error");
  };

  // Restaurer le squelette du niveau d’aide sélectionné.
  const restoreStarter = () => {
    const nextCode = config.starters[state.guidance];
    const currentCode = byId("codeEditor").value;

    if (currentCode.trim() && currentCode !== nextCode && !window.confirm("Restaurer le squelette remplacera le code actuel. Continuer ?")) {
      return;
    }

    state.code = nextCode;
    state.lastValidation = {};
    saveState();
    renderCode();
    renderAutomaticChecks();
    updateProgress();
    showFeedback("Le squelette du niveau choisi a été restauré.");
  };

  // Changer le niveau d’aide et proposer le squelette correspondant.
  const changeGuidance = event => {
    const nextGuidance = event.target.value;
    const currentCode = byId("codeEditor").value;

    if (currentCode.trim() && currentCode !== config.starters[state.guidance] && !window.confirm("Changer de niveau remplacera le code actuel. Continuer ?")) {
      event.target.value = state.guidance;
      return;
    }

    state.guidance = nextGuidance;
    state.code = config.starters[nextGuidance];
    state.lastValidation = {};
    saveState();
    renderCode();
    renderAutomaticChecks();
    updateProgress();
    showFeedback(`Niveau d’aide sélectionné : ${event.target.options[event.target.selectedIndex].text}.`);
  };

  // Copier le code dans le presse-papiers.
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(byId("codeEditor").value);
      showFeedback("Code copié dans le presse-papiers.", "success");
    } catch {
      showFeedback("La copie automatique n’est pas disponible dans ce navigateur.", "error");
    }
  };

  // Télécharger le code courant avec l’extension Arduino .ino.
  const downloadCode = () => {
    const blob = new Blob([byId("codeEditor").value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `technoquest-seance-${config.id}.ino`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Lancer une observation simplifiée sans analyser le code.
  const runTwinObservation = () => {
    byId("templateTwin").classList.add("is-running");
    byId("twinHumidityValue").textContent = config.simulation.humidity;
    byId("twinStatus").textContent = "Le capteur A0 transmet une mesure à l’Arduino ; la sortie D6 reste à LOW.";
    byId("twinPump").classList.add("is-safe");
    window.setTimeout(() => byId("templateTwin").classList.remove("is-running"), 2200);
  };

  // Réagir aux cases de micro-objectifs.
  const handleMicroObjective = event => {
    const input = event.target.closest("[data-micro-objective]");
    if (!input) return;
    state.microObjectives[input.dataset.microObjective] = input.checked;
    saveState();
    updateProgress();
  };

  // Réagir aux curseurs de la grille d’évaluation.
  const handleAssessment = event => {
    const input = event.target.closest("[data-score-index]");
    if (!input) return;
    const index = input.dataset.scoreIndex;
    state.scores[index] = Number(input.value);
    document.querySelector(`[data-score-value="${index}"]`).textContent = input.value;
    saveState();
    updateScoreTotal();
  };

  // Enregistrer automatiquement le texte réflexif.
  const handleReflection = event => {
    state.reflection = event.target.value;
    saveState();
    updateProgress();
    byId("reflectionStatus").textContent = state.reflection.trim().length >= 30
      ? "Réponse suffisamment développée et enregistrée."
      : "La réponse est enregistrée automatiquement sur cet appareil.";
  };

  // Enregistrer automatiquement le code sans déclencher la validation.
  const handleCodeInput = event => {
    state.code = event.target.value;
    saveState();
  };

  // Activer le Mode Classique.
  const activateClassicMode = () => {
    state.mode = "classic";
    saveState();
    renderMode();
  };

  // Activer le Mode Mission.
  const activateMissionMode = () => {
    state.mode = "mission";
    saveState();
    renderMode();
    byId("phase6").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Effacer le moniteur série simulé.
  const clearSerial = () => {
    writeSerial(["[Moniteur série] En attente d’exécution…"]);
  };

  // Relier toutes les actions de l’interface aux fonctions correspondantes.
  const bindEvents = () => {
    byId("classicModeButton").addEventListener("click", activateClassicMode);
    byId("missionModeButton").addEventListener("click", activateMissionMode);
    byId("guidanceLevel").addEventListener("change", changeGuidance);
    byId("checkCodeButton").addEventListener("click", checkCodeOnly);
    byId("runCodeButton").addEventListener("click", runSimulation);
    byId("restoreCodeButton").addEventListener("click", restoreStarter);
    byId("copyCodeButton").addEventListener("click", copyCode);
    byId("downloadCodeButton").addEventListener("click", downloadCode);
    byId("clearSerialButton").addEventListener("click", clearSerial);
    byId("twinDemoButton").addEventListener("click", runTwinObservation);
    byId("algorithmReplayButton").addEventListener("click", playAlgorithm);
    byId("microObjectiveList").addEventListener("change", handleMicroObjective);
    byId("assessmentGrid").addEventListener("input", handleAssessment);
    byId("reflectionText").addEventListener("input", handleReflection);
    byId("codeEditor").addEventListener("input", handleCodeInput);
  };

  // Construire toute l’interface dans un ordre déterministe.
  const initialize = () => {
    renderIdentity();
    renderObjectives();
    renderAlgorithm();
    renderAutomaticChecks();
    renderMicroObjectives();
    renderAssessment();
    renderCode();
    renderReflection();
    renderMode();
    bindEvents();
    updateProgress();
  };

  // Lancer l’initialisation lorsque le document est disponible.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
