/* TechnoQuest — positionnement précis de la flèche sur la ligne à compléter. */
"use strict";

(() => {
  /* Attend la création dynamique du mode Mission avant d’installer le repère. */
  function waitForMission(attempt = 0) {
    const root = document.getElementById("missionModeRoot");
    const editor = document.getElementById("codeEditor");
    const shell = document.getElementById("missionCodeShell");
    const arrow = document.getElementById("missionArrow");
    const lineNumbers = document.getElementById("missionLineNumbers");
    const validator = window.TechnoQuestMissionValidator;

    if (root && editor && shell && arrow && lineNumbers && validator) {
      installPrecisionArrow({ root, editor, shell, arrow, lineNumbers, validator });
      return;
    }

    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe un bandeau de ligne et recalcule la position à chaque changement utile. */
  function installPrecisionArrow(refs) {
    if (refs.shell.dataset.precisionArrowReady === "true") return;
    refs.shell.dataset.precisionArrowReady = "true";

    const sessionId = Number(document.body.dataset.session || 1);
    const twinStage = document.getElementById("twinStage");
    const targetLine = document.createElement("div");
    targetLine.className = "mission-target-line";
    targetLine.hidden = true;
    targetLine.setAttribute("aria-hidden", "true");
    targetLine.innerHTML = '<span class="mission-target-line-label">Écrire ici</span>';
    refs.shell.appendChild(targetLine);

    let scheduledFrame = 0;
    let previousStepId = null;

    /* Indique si le mode Mission est actuellement affiché. */
    function missionVisible() {
      return refs.root.isConnected && !refs.root.classList.contains("mission-hidden");
    }

    /* Distingue l’exécution de la phase d’écriture. */
    function simulationActive() {
      return Boolean(twinStage?.classList.contains("mission-simulating"));
    }

    /* Détermine la première étape incomplète et sa ligne exacte dans le squelette. */
    function targetForCurrentCode() {
      const result = refs.validator.validate(refs.editor.value, sessionId);
      const stepId = result.firstMissing?.id || null;
      if (!stepId) return { result, stepId: null, lineIndex: null };

      const rawLine = refs.validator.findLineForStep(
        refs.editor.value,
        stepId,
        result,
        sessionId,
        "edition"
      );

      const maximumLine = Math.max(0, refs.editor.value.split("\n").length - 1);
      const lineIndex = Number.isFinite(rawLine)
        ? Math.max(0, Math.min(maximumLine, Math.round(rawLine)))
        : 0;

      return { result, stepId, lineIndex };
    }

    /* Fait apparaître la ligne ciblée dans la zone visible lors d’un changement d’étape. */
    function revealLine(lineIndex) {
      const editorStyle = window.getComputedStyle(refs.editor);
      const lineHeight = parseFloat(editorStyle.lineHeight) || 24;
      const paddingTop = parseFloat(editorStyle.paddingTop) || 16;
      const targetTop = paddingTop + lineIndex * lineHeight;
      const visibleTop = refs.editor.scrollTop;
      const visibleBottom = visibleTop + refs.editor.clientHeight - lineHeight;

      if (targetTop < visibleTop || targetTop > visibleBottom) {
        const desiredTop = targetTop - refs.editor.clientHeight * 0.38;
        const maximumTop = Math.max(0, refs.editor.scrollHeight - refs.editor.clientHeight);
        refs.editor.scrollTop = Math.max(0, Math.min(maximumTop, desiredTop));
      }
    }

    /* Retire les anciens repères de numéro de ligne. */
    function clearNumberHighlight() {
      refs.lineNumbers.querySelectorAll(".mission-target-number").forEach(number => {
        number.classList.remove("mission-target-number");
        number.removeAttribute("aria-current");
      });
    }

    /* Place la flèche au centre vertical exact de la ligne calculée. */
    function updatePrecisionArrow({ reveal = false } = {}) {
      if (!missionVisible()) return;

      if (simulationActive()) {
        refs.shell.classList.add("mission-execution-target");
        targetLine.hidden = true;
        clearNumberHighlight();
        refs.arrow.classList.remove("mission-arrow-complete");
        return;
      }

      refs.shell.classList.remove("mission-execution-target");
      const target = targetForCurrentCode();

      if (target.lineIndex === null) {
        refs.arrow.classList.add("mission-arrow-complete");
        targetLine.hidden = true;
        clearNumberHighlight();
        previousStepId = null;
        return;
      }

      const stepChanged = target.stepId !== previousStepId;
      previousStepId = target.stepId;
      if (reveal || stepChanged) revealLine(target.lineIndex);

      const editorStyle = window.getComputedStyle(refs.editor);
      const lineHeight = parseFloat(editorStyle.lineHeight) || 24;
      const paddingTop = parseFloat(editorStyle.paddingTop) || 16;
      const editorRect = refs.editor.getBoundingClientRect();
      const shellRect = refs.shell.getBoundingClientRect();
      const editorOffsetTop = editorRect.top - shellRect.top;
      const lineTop = editorOffsetTop + paddingTop + target.lineIndex * lineHeight - refs.editor.scrollTop;
      const lineCenter = lineTop + lineHeight / 2;
      const minimumCenter = editorOffsetTop + lineHeight / 2;
      const maximumCenter = editorOffsetTop + refs.editor.clientHeight - lineHeight / 2;
      const visibleCenter = Math.max(minimumCenter, Math.min(maximumCenter, lineCenter));
      const gutterWidth = refs.lineNumbers.getBoundingClientRect().width || 52;

      refs.arrow.classList.remove("mission-arrow-complete");
      refs.arrow.style.left = `${Math.max(6, gutterWidth - 15)}px`;
      refs.arrow.style.top = `${visibleCenter}px`;
      refs.arrow.setAttribute("aria-label", `Ligne ${target.lineIndex + 1} à compléter`);
      refs.arrow.title = `Écrire à la ligne ${target.lineIndex + 1}`;

      targetLine.hidden = false;
      targetLine.style.left = `${gutterWidth}px`;
      targetLine.style.top = `${lineTop}px`;
      targetLine.style.height = `${lineHeight}px`;
      targetLine.querySelector(".mission-target-line-label").textContent = `Écrire ici · ligne ${target.lineIndex + 1}`;

      clearNumberHighlight();
      const number = refs.lineNumbers.children[target.lineIndex];
      if (number) {
        number.classList.add("mission-target-number");
        number.setAttribute("aria-current", "step");
      }
    }

    /* Regroupe plusieurs événements successifs dans une seule mise à jour graphique. */
    function scheduleUpdate(options = {}) {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = window.requestAnimationFrame(() => updatePrecisionArrow(options));
    }

    /* Le texte et le défilement modifient directement la position cible. */
    refs.editor.addEventListener("input", () => scheduleUpdate({ reveal: true }));
    refs.editor.addEventListener("scroll", () => scheduleUpdate(), { passive: true });
    refs.editor.addEventListener("keyup", () => scheduleUpdate());
    refs.editor.addEventListener("click", () => scheduleUpdate());

    /* Les changements de taille recalculent les coordonnées relatives. */
    window.addEventListener("resize", () => scheduleUpdate());
    document.addEventListener("fullscreenchange", () => scheduleUpdate({ reveal: true }));

    /* Les numéros de lignes sont recréés par l’application après chaque saisie. */
    const lineObserver = new MutationObserver(() => scheduleUpdate());
    lineObserver.observe(refs.lineNumbers, { childList: true, subtree: true });

    /* L’activation ou la désactivation du mode Mission déclenche également le calcul. */
    const rootObserver = new MutationObserver(() => {
      if (missionVisible()) scheduleUpdate({ reveal: true });
    });
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });

    /* Les changements d’état du jumeau numérique rétablissent la flèche d’exécution. */
    if (twinStage) {
      const simulationObserver = new MutationObserver(() => scheduleUpdate());
      simulationObserver.observe(twinStage, { attributes: true, attributeFilter: ["class"] });
    }

    /* Les boutons principaux peuvent déplacer la prochaine étape attendue. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      document.getElementById(id)?.addEventListener("click", () => {
        window.setTimeout(() => scheduleUpdate({ reveal: true }), 0);
      });
    });

    document.getElementById("missionHelpLevel")?.addEventListener("change", () => {
      window.setTimeout(() => scheduleUpdate({ reveal: true }), 0);
    });

    scheduleUpdate({ reveal: true });
  }

  /* Démarre une fois le document disponible. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    waitForMission();
  }
})();
