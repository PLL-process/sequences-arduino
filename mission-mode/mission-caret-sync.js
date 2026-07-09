/* TechnoQuest Mission Mode - synchronisation du curseur et de la flèche en édition. */
"use strict";

(() => {
  const validator = window.TechnoQuestMissionValidator;
  if (!validator) return;

  const originalFindLineForStep = validator.findLineForStep.bind(validator);

  function regexMatches(pattern, value) {
    if (!pattern) return false;
    pattern.lastIndex = 0;
    return pattern.test(value);
  }

  function findNearbyTarget(lines, markerIndex) {
    const lastIndex = Math.min(lines.length - 1, markerIndex + 4);

    for (let index = markerIndex; index <= lastIndex; index += 1) {
      if (/_{3,}|TODO|A_COMPLETER/i.test(lines[index])) return index;
    }

    for (let index = markerIndex + 1; index <= lastIndex; index += 1) {
      const trimmed = lines[index].trim();
      if (!trimmed) return index;
      if (/^\/\//.test(trimmed) || /^[{}]/.test(trimmed)) break;
    }

    return markerIndex;
  }

  validator.findLineForStep = function findLineForStep(code, stepId, result, sessionId = 1, mode = "edition") {
    if (mode === "simulation") {
      return originalFindLineForStep(code, stepId, result, sessionId, mode);
    }

    const lines = String(code || "").split("\n");
    if (!stepId) return Math.max(0, lines.length - 1);

    const steps = typeof validator.getSteps === "function" ? validator.getSteps(sessionId) : [];
    const step = steps.find(item => item.id === stepId) || validator.stepTemplates?.[stepId];
    const context = result?.context || {};
    const pattern = typeof step?.line === "function" ? step.line(context) : step?.line;

    if (pattern) {
      const indexes = [];
      lines.forEach((line, index) => {
        if (regexMatches(pattern, line)) indexes.push(index);
      });
      if (indexes.length) return step.last ? indexes[indexes.length - 1] : indexes[0];
    }

    const marker = step?.marker;
    if (marker) {
      for (let index = 0; index < lines.length; index += 1) {
        if (regexMatches(marker, lines[index])) return findNearbyTarget(lines, index);
      }
    }

    const placeholderIndex = lines.findIndex(line => /_{3,}|TODO|A_COMPLETER/i.test(line));
    if (placeholderIndex >= 0) return placeholderIndex;

    return originalFindLineForStep(code, stepId, result, sessionId, mode);
  };

  function ready(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback);
    else callback();
  }

  ready(() => {
    const sessionId = Number(document.body.dataset.session || 0);
    const root = document.querySelector("#missionModeRoot");
    const editor = document.querySelector("#codeEditor");
    const twinStage = document.querySelector("#twinStage");
    const activateButton = document.querySelector("#missionActivate");
    const checkButton = document.querySelector("#missionCheck");
    const resetButton = document.querySelector("#missionReset");
    const stopButton = document.querySelector("#missionStop");
    const modeSelect = document.querySelector("#missionHelpLevel");

    if (sessionId < 1 || sessionId > 8 || !root || !editor) return;

    let lastStepId = null;
    let placementTimer = 0;

    function missionVisible() {
      return root.isConnected && !root.classList.contains("mission-hidden");
    }

    function simulationActive() {
      return Boolean(twinStage?.classList.contains("mission-simulating"));
    }

    function currentTarget() {
      const result = validator.validate(editor.value, sessionId);
      const stepId = result.firstMissing?.id || null;
      const line = validator.findLineForStep(editor.value, stepId, result, sessionId, "edition");
      return { result, stepId, line };
    }

    function selectionForLine(lineIndex) {
      const lines = editor.value.split("\n");
      const safeLine = Math.max(0, Math.min(lineIndex, lines.length - 1));
      const lineStart = lines.slice(0, safeLine).reduce((total, line) => total + line.length + 1, 0);
      const lineText = lines[safeLine] || "";
      const placeholder = lineText.match(/_{3,}|TODO|A_COMPLETER/i);

      if (placeholder && typeof placeholder.index === "number") {
        const start = lineStart + placeholder.index;
        return { safeLine, start, end: start + placeholder[0].length };
      }

      const indentation = lineText.match(/^\s*/)?.[0].length || 0;
      const position = lineStart + indentation;
      return { safeLine, start: position, end: position };
    }

    function scrollLineIntoView(lineIndex) {
      const style = window.getComputedStyle(editor);
      const lineHeight = parseFloat(style.lineHeight) || 24;
      const paddingTop = parseFloat(style.paddingTop) || 16;
      const targetTop = paddingTop + lineIndex * lineHeight;
      const desiredTop = targetTop - editor.clientHeight * 0.35;
      const maximumTop = Math.max(0, editor.scrollHeight - editor.clientHeight);
      editor.scrollTop = Math.max(0, Math.min(maximumTop, desiredTop));
      editor.dispatchEvent(new Event("scroll"));
    }

    function placeCaret(force = false) {
      if (!missionVisible() || simulationActive()) return;

      const target = currentTarget();
      if (!target.stepId) {
        lastStepId = null;
        return;
      }
      if (!force && target.stepId === lastStepId) return;

      lastStepId = target.stepId;
      const selection = selectionForLine(target.line);

      window.requestAnimationFrame(() => {
        if (!missionVisible() || simulationActive()) return;
        editor.focus({ preventScroll: true });
        editor.setSelectionRange(selection.start, selection.end);
        scrollLineIntoView(selection.safeLine);
      });
    }

    function scheduleCaret(force = false) {
      window.clearTimeout(placementTimer);
      placementTimer = window.setTimeout(() => placeCaret(force), 0);
    }

    editor.addEventListener("input", () => {
      const nextStepId = validator.validate(editor.value, sessionId).firstMissing?.id || null;
      if (nextStepId !== lastStepId) scheduleCaret(true);
    });

    activateButton?.addEventListener("click", () => scheduleCaret(true));
    checkButton?.addEventListener("click", () => scheduleCaret(true));
    resetButton?.addEventListener("click", () => scheduleCaret(true));
    stopButton?.addEventListener("click", () => scheduleCaret(true));
    modeSelect?.addEventListener("change", () => scheduleCaret(true));

    if (missionVisible()) scheduleCaret(true);
  });
})();
