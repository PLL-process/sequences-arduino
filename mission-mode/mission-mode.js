/* TechnoQuest Mission Mode - contrôleur écran partagé de la séance 1. */
"use strict";

(() => {
  const STORAGE_KEY = "technoquest-mission-v1";
  const qs = selector => document.querySelector(selector);

  const objectiveMap = [
    { id: "serial", label: "initialiser la communication série", ok: result => result.steps.find(step => step.id === "serialBegin")?.ok },
    { id: "safe", label: "sécuriser la pompe", ok: result => result.badges.safety },
    { id: "a0", label: "lire A0", ok: result => result.steps.find(step => step.id === "readHumidity")?.ok },
    { id: "a1", label: "lire A1", ok: result => result.steps.find(step => step.id === "readLight")?.ok },
    { id: "a2", label: "lire A2", ok: result => result.steps.find(step => step.id === "readWater")?.ok },
    { id: "display", label: "afficher les trois mesures", ok: result => ["showHumidity", "showLight", "showWater"].every(id => result.steps.find(step => step.id === id)?.ok) },
    { id: "delay", label: "attendre une seconde", ok: result => result.steps.find(step => step.id === "delay")?.ok },
    { id: "ide", label: "compiler et téléverser ensuite dans l'IDE Arduino", ok: result => result.allOk }
  ];

  function ready(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback);
    else callback();
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]));
  }

  ready(() => {
    if (document.body.dataset.session !== "1") return;
    const validator = window.TechnoQuestMissionValidator;
    const docs = window.TechnoQuestMissionDocs;
    const engineApi = window.TechnoQuestMissionEngine;
    const classicShell = qs(".session-shell");
    const editor = qs("#codeEditor");
    const highlight = qs("#codeHighlight");
    const editorWrap = editor?.closest(".editor-wrap");
    const twinStage = qs("#twinStage");
    if (!validator || !docs || !engineApi || !classicShell || !editor || !highlight || !editorWrap || !twinStage) return;

    const state = {
      modeMission: false,
      helpMode: "guided",
      activeStep: "include",
      badges: {},
      values: { humidity: 642, light: 518, water: 781 },
      reflection: "",
      ...loadState()
    };

    let attempted = Boolean(state.attempted);
    let programmaticEditorChange = false;
    let twinPlaceholder = null;
    let editorPlaceholder = null;
    let currentResult = validator.validate(editor.value);
    let serialLines = ["Simulation pédagogique — la compilation réelle se fait dans l'IDE Arduino."];
    let executionLineStep = null;

    const root = createMissionRoot();
    classicShell.insertAdjacentElement("afterend", root);
    const activateButton = createActivateButton();
    const nav = qs(".session-nav") || classicShell;
    nav.appendChild(activateButton);

    const refs = {
      root,
      activateButton,
      twinMount: root.querySelector("#missionTwinMount"),
      editorMount: root.querySelector("#missionEditorMount"),
      lineNumbers: root.querySelector("#missionLineNumbers"),
      arrow: root.querySelector("#missionArrow"),
      modeSelect: root.querySelector("#missionHelpLevel"),
      progressValue: root.querySelector("#missionProgressValue"),
      progressBar: root.querySelector("#missionProgressBar span"),
      stateLabel: root.querySelector("#missionStateLabel"),
      stateDetail: root.querySelector("#missionStateDetail"),
      objectiveList: root.querySelector("#missionObjectives"),
      validationList: root.querySelector("#missionValidation"),
      message: root.querySelector("#missionMessage"),
      serial: root.querySelector("#missionSerial"),
      helpPanel: root.querySelector("#missionHelpPanel"),
      docsPanel: root.querySelector("#missionDocsPanel"),
      reflection: root.querySelector("#missionReflection"),
      humidity: root.querySelector('[data-sensor="humidity"] span'),
      light: root.querySelector('[data-sensor="light"] span'),
      water: root.querySelector('[data-sensor="water"] span'),
      badges: {
        sensors: root.querySelector('[data-badge="sensors"]'),
        communication: root.querySelector('[data-badge="communication"]'),
        safety: root.querySelector('[data-badge="safety"]')
      }
    };

    refs.modeSelect.value = state.helpMode || "guided";
    refs.reflection.value = state.reflection || "";
    refs.humidity.textContent = state.values?.humidity ?? "--";
    refs.light.textContent = state.values?.light ?? "--";
    refs.water.textContent = state.values?.water ?? "--";

    const engine = engineApi.createEngine({
      onState: renderEngineState,
      onStop: () => {
        twinStage.classList.remove("mission-simulating", "running");
        clearTwinActivity();
        executionLineStep = null;
        updateArrow();
        refs.stateLabel.textContent = "Simulation arrêtée";
        refs.stateDetail.textContent = "La pompe reste à l'état sûr : D6 = LOW.";
        state.activeStep = currentResult.firstMissing?.id || "complete";
        saveState(state);
      }
    });

    bindEvents();
    prepareTwin();
    renderAll();
    if (state.modeMission) activateMission(false);

    function createMissionRoot() {
      const element = document.createElement("section");
      element.id = "missionModeRoot";
      element.className = "mission-shell mission-hidden";
      element.setAttribute("aria-label", "Mode Mission TechnoQuest");
      element.innerHTML = `
        <header class="mission-topbar">
          <div class="mission-title"><span class="mission-mark">M1</span><div><strong>Mission 1 — Faire parler les capteurs</strong><span>Lire A0, A1 et A2 dans le Moniteur Série sans démarrer la pompe.</span></div></div>
          <button id="missionClassic" class="btn" type="button" aria-label="Revenir au mode classique">Revenir au mode classique</button>
        </header>
        <main class="mission-split">
          <section class="mission-left" aria-label="Jumeau numérique et objectifs">
            <div class="mission-context"><p class="eyebrow">Mode Mission TechnoQuest</p><h1>Mission 1 — Faire parler les capteurs</h1><p>Les plantes du jardin ne peuvent pas encore communiquer leur état. Ta mission consiste à lire leurs capteurs et à transmettre leurs mesures dans le Moniteur Série, sans démarrer la pompe.</p></div>
            <article class="mission-panel"><div class="mission-panel-head"><div><h2>Jumeau numérique interactif</h2><p>Observe les signaux, l'énergie TBT et le trajet de l'eau pendant la simulation.</p></div></div><div class="mission-panel-body"><div id="missionTwinMount" class="mission-twin-mount"></div></div></article>
            <article class="mission-panel"><div class="mission-panel-head"><div><h2>État du système</h2><p aria-live="polite">Simulation pédagogique — la compilation réelle se fait dans l'IDE Arduino.</p></div></div><div class="mission-panel-body"><div class="mission-state"><div><strong id="missionStateLabel">Initialisation</strong><span id="missionStateDetail">Complète le programme, puis lance la simulation.</span></div><span id="missionProgressValue">0 %</span></div><div class="mission-progress" aria-label="Progression de mission"><div class="mission-progress-top"><span>Progression</span><span>Mission 1</span></div><div class="mission-bar" id="missionProgressBar"><span></span></div></div><div class="mission-sensor-grid"><div class="mission-sensor" data-sensor="humidity"><strong>A0 humidité</strong><span>--</span></div><div class="mission-sensor" data-sensor="light"><strong>A1 lumière</strong><span>--</span></div><div class="mission-sensor" data-sensor="water"><strong>A2 niveau</strong><span>--</span></div></div><pre id="missionSerial" class="mission-console" aria-live="polite"></pre></div></article>
            <article class="mission-panel"><div class="mission-panel-head"><div><h2>Objectifs de mission</h2><p>Valide les étapes sans classement, sans pénalité et sans chronomètre.</p></div></div><div class="mission-panel-body"><ul id="missionObjectives" class="mission-objectives"></ul><div class="mission-badges"><span class="mission-badge" data-badge="sensors">Capteurs détectés</span><span class="mission-badge" data-badge="communication">Communication établie</span><span class="mission-badge" data-badge="safety">Système sécurisé</span></div></div></article>
          </section>
          <section class="mission-right" aria-label="Éditeur C++ Arduino">
            <article class="mission-panel"><div class="mission-panel-head"><div><h2>Éditeur C++ Arduino</h2><p>La flèche jaune indique la première instruction attendue qui manque, puis la ligne exécutée pendant la simulation.</p></div></div><div class="mission-panel-body"><div class="mission-toolbar"><label for="missionHelpLevel">Niveau d'aide</label><select id="missionHelpLevel"><option value="guided">Guidé</option><option value="standard">Standard</option><option value="expert">Autonome</option></select></div><div id="missionCodeShell" class="mission-code-shell"><div id="missionLineNumbers" class="mission-line-numbers" aria-hidden="true"></div><div id="missionArrow" class="mission-arrow" aria-hidden="true"></div><div id="missionEditorMount" class="mission-editor-mount"></div></div><div class="mission-actions"><button id="missionRun" class="btn primary" type="button">Exécuter la simulation</button><button id="missionCheck" class="btn" type="button">Vérifier le programme</button><button id="missionHelp" class="btn" type="button" aria-expanded="false">Aide</button><button id="missionDocs" class="btn" type="button" aria-expanded="false">Documentation</button><button id="missionReset" class="btn warning" type="button">Réinitialiser le squelette</button><button id="missionSave" class="btn primary" type="button">Enregistrer</button><button id="missionDownload" class="btn" type="button">Télécharger le fichier .ino</button></div><div class="mission-sim-controls"><button id="missionStep" class="btn" type="button">Pas à pas</button><button id="missionPause" class="btn" type="button">Pause</button><button id="missionResume" class="btn" type="button">Reprise</button><button id="missionStop" class="btn" type="button">Arrêt</button><label>Vitesse <select id="missionSpeed"><option value="normal">normale</option><option value="slow">lente</option></select></label></div><p id="missionMessage" class="mission-message" aria-live="polite">Prêt : complète le programme puis vérifie-le.</p><section id="missionHelpPanel" class="mission-side-panel" aria-live="polite"></section><section id="missionDocsPanel" class="mission-side-panel"><h3>Documentation C++ Arduino</h3>${window.TechnoQuestMissionDocs.documentationHtml}</section></div></article>
            <article class="mission-panel"><div class="mission-panel-head"><div><h2>Validation</h2><p>Le validateur accepte les espaces, indentations et noms de variables raisonnables.</p></div></div><div class="mission-panel-body"><ul id="missionValidation" class="mission-validation"></ul></div></article>
            <article class="mission-panel"><div class="mission-panel-head"><div><h2>Retour métacognitif</h2><p>Note ce que tu as compris avant de passer dans l'IDE Arduino.</p></div></div><div class="mission-panel-body"><textarea id="missionReflection" class="mission-reflection" placeholder="J'ai compris que..."></textarea><p class="mission-download-note">Le fichier .ino téléchargé contient ton code actuel, pas une correction cachée.</p></div></article>
          </section>
        </main>`;
      return element;
    }

    function createActivateButton() {
      const button = document.createElement("button");
      button.id = "missionActivate";
      button.className = "mission-entry";
      button.type = "button";
      button.textContent = "Activer le Mode Mission";
      button.setAttribute("aria-label", "Activer le Mode Mission TechnoQuest");
      return button;
    }

    function bindEvents() {
      refs.activateButton.addEventListener("click", () => activateMission(true));
      root.querySelector("#missionClassic").addEventListener("click", () => deactivateMission());
      refs.modeSelect.addEventListener("change", () => changeSkeleton(refs.modeSelect.value));
      refs.reflection.addEventListener("input", () => {
        state.reflection = refs.reflection.value;
        saveState(state);
      });
      editor.addEventListener("input", () => {
        state.code = editor.value;
        if (!programmaticEditorChange) {
          state.attempted = true;
          attempted = true;
        }
        saveState(state);
        renderAll();
      });
      editor.addEventListener("scroll", updateArrow, { passive: true });
      root.querySelector("#missionCheck").addEventListener("click", () => checkProgram(true));
      root.querySelector("#missionRun").addEventListener("click", runSimulation);
      root.querySelector("#missionStep").addEventListener("click", () => {
        if (!ensureRunnable()) return;
        engine.step();
      });
      root.querySelector("#missionPause").addEventListener("click", () => engine.pause());
      root.querySelector("#missionResume").addEventListener("click", () => engine.resume());
      root.querySelector("#missionStop").addEventListener("click", () => engine.stop());
      root.querySelector("#missionSpeed").addEventListener("change", event => engine.setSpeed(event.target.value));
      root.querySelector("#missionHelp").addEventListener("click", () => togglePanel(refs.helpPanel, root.querySelector("#missionHelp")));
      root.querySelector("#missionDocs").addEventListener("click", () => togglePanel(refs.docsPanel, root.querySelector("#missionDocs")));
      root.querySelector("#missionReset").addEventListener("click", () => resetSkeleton(true));
      root.querySelector("#missionSave").addEventListener("click", () => {
        state.code = editor.value;
        state.savedAt = new Date().toISOString();
        saveState(state);
        showMessage("Mission enregistrée sur cet appareil.", "success");
      });
      root.querySelector("#missionDownload").addEventListener("click", downloadIno);
      window.addEventListener("resize", updateArrow);
    }

    function activateMission(remember) {
      if (remember) {
        state.modeMission = true;
        saveState(state);
      }
      classicShell.classList.add("mission-hidden");
      root.classList.remove("mission-hidden");
      moveIntoMission();
      if (!state.code) resetSkeleton(false);
      else {
        programmaticEditorChange = true;
        editor.value = state.code;
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        programmaticEditorChange = false;
      }
      renderAll();
      editor.focus();
    }

    function deactivateMission() {
      state.modeMission = false;
      state.code = editor.value;
      saveState(state);
      engine.stop();
      moveBackToClassic();
      root.classList.add("mission-hidden");
      classicShell.classList.remove("mission-hidden");
      refs.activateButton.focus();
    }

    function moveIntoMission() {
      if (!twinPlaceholder) {
        twinPlaceholder = document.createComment("mission twin placeholder");
        twinStage.parentNode.insertBefore(twinPlaceholder, twinStage);
      }
      refs.twinMount.appendChild(twinStage);
      if (!editorPlaceholder) {
        editorPlaceholder = document.createComment("mission editor placeholder");
        editorWrap.parentNode.insertBefore(editorPlaceholder, editorWrap);
      }
      refs.editorMount.appendChild(editorWrap);
      editorWrap.classList.add("mission-editor-wrap");
    }

    function moveBackToClassic() {
      if (twinPlaceholder?.parentNode) twinPlaceholder.parentNode.insertBefore(twinStage, twinPlaceholder);
      if (editorPlaceholder?.parentNode) editorPlaceholder.parentNode.insertBefore(editorWrap, editorPlaceholder);
      editorWrap.classList.remove("mission-editor-wrap");
    }

    function changeSkeleton(mode) {
      const changedCode = editor.value.trim() && editor.value.trim() !== validator.getSkeleton(state.helpMode || "guided").trim();
      if (changedCode && attempted && !window.confirm("Changer de niveau d'aide remplacera la tentative actuelle. Continuer ?")) {
        refs.modeSelect.value = state.helpMode || "guided";
        return;
      }
      state.helpMode = mode;
      resetSkeleton(false);
    }

    function resetSkeleton(confirmReset) {
      if (confirmReset && attempted && !window.confirm("Réinitialiser le squelette et effacer la tentative actuelle ?")) return;
      const code = validator.getSkeleton(refs.modeSelect.value);
      programmaticEditorChange = true;
      editor.value = code;
      attempted = false;
      Object.assign(state, { code, helpMode: refs.modeSelect.value, attempted: false, activeStep: "include" });
      saveState(state);
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      programmaticEditorChange = false;
      showMessage("Squelette " + refs.modeSelect.options[refs.modeSelect.selectedIndex].textContent + " chargé.", "neutral");
      renderAll();
    }

    function renderAll() {
      currentResult = validator.validate(editor.value);
      state.activeStep = currentResult.firstMissing?.id || "complete";
      state.badges = currentResult.badges;
      saveState(state);
      renderLineNumbers();
      renderProgress();
      renderObjectives();
      renderBadges();
      renderValidation();
      renderHelp();
      updateArrow();
    }

    function renderLineNumbers() {
      const lines = Math.max(1, editor.value.split("\n").length);
      refs.lineNumbers.innerHTML = Array.from({ length: lines }, (_, index) => `<span>${index + 1}</span>`).join("");
      refs.lineNumbers.scrollTop = editor.scrollTop;
    }

    function renderProgress() {
      const percent = Math.round((objectiveMap.filter(item => item.ok(currentResult)).length / objectiveMap.length) * 100);
      refs.progressValue.textContent = `${percent} %`;
      refs.progressBar.style.width = `${percent}%`;
    }

    function renderObjectives() {
      refs.objectiveList.innerHTML = objectiveMap.map(item => `<li class="${item.ok(currentResult) ? "done" : ""}">${escapeHtml(item.label)}</li>`).join("");
    }

    function renderBadges() {
      refs.badges.sensors.classList.toggle("earned", currentResult.badges.sensors);
      refs.badges.communication.classList.toggle("earned", currentResult.badges.communication);
      refs.badges.safety.classList.toggle("earned", currentResult.badges.safety);
    }

    function renderValidation() {
      const firstId = currentResult.firstMissing?.id;
      refs.validationList.innerHTML = currentResult.steps.map(step => {
        const stateClass = step.ok ? "done" : step.id === firstId ? "active" : "";
        return `<li class="${stateClass}"><span>${escapeHtml(step.label)}</span><strong>${step.ok ? "OK" : step.id === firstId ? "À faire" : "En attente"}</strong></li>`;
      }).join("");
    }

    function renderHelp() {
      refs.helpPanel.innerHTML = `<h3>Aide contextuelle</h3>${docs.helpFor(currentResult.firstMissing)}`;
    }

    function updateArrow() {
      if (!root.isConnected || root.classList.contains("mission-hidden")) return;
      refs.lineNumbers.scrollTop = editor.scrollTop;
      const line = executionLineStep
        ? findLineForStep(executionLineStep, "simulation")
        : findLineForStep(currentResult.firstMissing?.id, "edition");
      const style = window.getComputedStyle(editor);
      const lineHeight = parseFloat(style.lineHeight) || 24;
      const paddingTop = parseFloat(style.paddingTop) || 16;
      const top = Math.max(10, Math.min(editor.clientHeight - 22, paddingTop + line * lineHeight - editor.scrollTop));
      refs.arrow.style.top = `${top}px`;
    }

    function findLineForStep(stepId, mode) {
      if (!stepId) return Math.max(0, editor.value.split("\n").length - 1);
      const lines = editor.value.split("\n");
      const variable = currentResult.context?.vars || {};
      const exact = {
        include: /#\s*include\s*<\s*Arduino\.h\s*>/i,
        serialBegin: /Serial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/,
        pinMode: /pinMode\s*\(\s*(?:PIN_RELAIS_POMPE|6)\s*,\s*OUTPUT\s*\)\s*;/,
        safeLowSetup: /digitalWrite\s*\(\s*(?:PIN_RELAIS_POMPE|6)\s*,\s*LOW\s*\)\s*;/,
        readHumidity: /analogRead\s*\(\s*(?:PIN_HUMIDITE_SOL|A0)\s*\)\s*;/,
        readLight: /analogRead\s*\(\s*(?:PIN_LUMIERE|A1)\s*\)\s*;/,
        readWater: /analogRead\s*\(\s*(?:PIN_NIVEAU_EAU|A2)\s*\)\s*;/,
        showHumidity: serialLinePattern(variable.humidity),
        showLight: serialLinePattern(variable.light),
        showWater: serialLinePattern(variable.water),
        delay: /delay\s*\(\s*1000(?:UL|L)?\s*\)\s*;/
      };
      const exactPattern = exact[stepId];
      const exactFound = exactPattern ? lines.findIndex(line => exactPattern.test(line)) : -1;
      if (exactFound >= 0) return exactFound;
      if (mode === "simulation") return Math.min(lines.length - 1, Math.max(0, validator.STEPS.findIndex(step => step.id === stepId)));

      const markers = {
        include: /biblioth[eè]que|#\s*include/i,
        serialBegin: /Moniteur S[ée]rie|Serial\.begin/i,
        pinMode: /sortie|pinMode/i,
        safeLowSetup: /LOW|pompe arr[eê]t[eé]e|digitalWrite/i,
        readHumidity: /humidit[eé]|A0/i,
        readLight: /lumi[eè]re|A1/i,
        readWater: /niveau|A2/i,
        showHumidity: /[ÉE]tapes 8|affiche|Serial\.print/i,
        showLight: /[ÉE]tapes 8|affiche|Serial\.print/i,
        showWater: /[ÉE]tapes 8|affiche|Serial\.print/i,
        delay: /seconde|delay/i
      };
      const marker = markers[stepId];
      const found = marker ? lines.findIndex(line => marker.test(line)) : -1;
      if (found >= 0) {
        const blankAfter = lines.findIndex((line, index) => index > found && !line.trim());
        return blankAfter > found ? blankAfter : found;
      }
      return Math.min(lines.length - 1, validator.STEPS.findIndex(step => step.id === stepId) + 1);
    }

    function serialLinePattern(variableName) {
      if (!variableName) return /Serial\s*\.\s*print(?:ln)?\s*\(/;
      const escaped = variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`Serial\\s*\\.\\s*print(?:ln)?\\s*\\(\\s*${escaped}\\s*\\)\\s*;`);
    }

    function checkProgram(explicit) {
      attempted = true;
      state.attempted = true;
      state.code = editor.value;
      saveState(state);
      renderAll();
      if (currentResult.allOk) {
        showMessage("Programme reconnu : tous les objectifs de mission sont valides. Tu peux lancer la simulation pédagogique.", "success");
        return true;
      }
      const first = currentResult.firstMissing;
      showMessage(`Programme incomplet : ${currentResult.errors[0] || "une instruction manque."}${first ? " La flèche indique : " + first.label + "." : ""}`, explicit ? "error" : "neutral");
      return false;
    }

    function ensureRunnable() {
      if (checkProgram(false)) return true;
      refs.helpPanel.classList.add("open");
      root.querySelector("#missionHelp").setAttribute("aria-expanded", "true");
      return false;
    }

    function runSimulation() {
      if (!ensureRunnable()) return;
      serialLines = ["Simulation pédagogique — la compilation réelle se fait dans l'IDE Arduino."];
      refs.serial.textContent = serialLines.join("\n");
      twinStage.classList.add("mission-simulating");
      engine.run();
      showMessage("Simulation pédagogique lancée : setup() puis loop() sont joués ligne par ligne.", "success");
    }

    function renderEngineState(step) {
      twinStage.classList.add("mission-simulating");
      executionLineStep = step.lineStep || null;
      updateArrow();
      refs.stateLabel.textContent = step.label;
      refs.stateDetail.textContent = step.paused ? "Simulation en pause." : `Exécution pédagogique contrôlée, sans compilation réelle. ${step.phase === "loop" ? `Tour de loop() n°${step.loopNumber}.` : "setup() ne s'exécute qu'une seule fois."}`;
      if (step.sensor === "humidity") {
        refs.humidity.textContent = `${step.value}`;
        state.values.humidity = step.value;
      }
      if (step.sensor === "light") {
        refs.light.textContent = `${step.value}`;
        state.values.light = step.value;
      }
      if (step.sensor === "water") {
        refs.water.textContent = `${step.value}`;
        state.values.water = step.value;
      }
      if (step.console) {
        serialLines.push(step.console);
        refs.serial.textContent = serialLines.slice(-9).join("\n");
        refs.serial.scrollTop = refs.serial.scrollHeight;
      }
      state.activeStep = executionLineStep || currentResult.firstMissing?.id || "complete";
      saveState(state);
      markTwinActivity(step.signal);
    }

    function showMessage(text, type) {
      refs.message.textContent = text;
      refs.message.className = `mission-message ${type === "error" ? "error" : type === "success" ? "success" : ""}`;
    }

    function togglePanel(panel, button) {
      const open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    }

    function downloadIno() {
      state.code = editor.value;
      saveState(state);
      const blob = new Blob([editor.value], { type: "text/x-arduino;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mission-1-faire-parler-les-capteurs.ino";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showMessage("Fichier .ino préparé avec ton code actuel.", "success");
    }

    function prepareTwin() {
      const svg = twinStage.querySelector("svg");
      if (!svg) return;
      [...svg.querySelectorAll("text")].forEach(text => {
        const parentGroup = text.closest("g");
        if (parentGroup?.style.display === "none") return;
        if (text.textContent.trim() === "Niveau A2") {
          text.textContent = "Capteur de niveau d’eau — A2";
          text.setAttribute("x", "830");
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-size", "10.5");
          const pill = text.previousElementSibling;
          if (pill?.tagName?.toLowerCase() === "rect") {
            pill.setAttribute("x", "714");
            pill.setAttribute("width", "232");
          }
        }
      });
      addClassToFirst(svg, 'path[stroke="#60a5fa"]', "mission-flow-a0");
      addClassToFirst(svg, 'path[stroke="#facc15"]', "mission-flow-a1");
      addClassToFirst(svg, 'path[stroke="#c084fc"]', "mission-flow-a2");
      addClassToFirst(svg, 'path[stroke="#fb923c"]', "mission-flow-d6");
      svg.querySelectorAll(".twin-current-flow:not(.return)").forEach(path => path.classList.add("mission-tbt-flow"));
      svg.querySelectorAll(".twin-current-flow.return").forEach(path => path.classList.add("mission-return-flow"));
      svg.querySelectorAll(".twin-water-flow-v5").forEach(path => path.classList.add("mission-water-flow"));
      svg.querySelector(".twin-water")?.classList.add("mission-water-flow");
    }

    function addClassToFirst(svg, selector, className) {
      svg.querySelector(selector)?.classList.add(className);
    }

    function clearTwinActivity() {
      twinStage.querySelectorAll(".mission-active").forEach(item => item.classList.remove("mission-active"));
    }

    function markTwinActivity(signal) {
      clearTwinActivity();
      const map = {
        a0: ".mission-flow-a0",
        a1: ".mission-flow-a1",
        a2: ".mission-flow-a2",
        d6: ".mission-flow-d6",
        tbt: ".mission-tbt-flow,.mission-return-flow",
        serial: ".mission-flow-a0,.mission-flow-a1,.mission-flow-a2",
        water: ".mission-water-flow"
      };
      twinStage.querySelectorAll(map[signal] || "").forEach(item => item.classList.add("mission-active"));
    }
  });
})();
