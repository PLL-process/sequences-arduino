/* TechnoQuest — curseur visuel précisément aligné avec la couche de code colorée. */
"use strict";

(() => {
  /* Attend que l’éditeur ait été déplacé dans le mode Mission. */
  function waitForEditor(attempt = 0) {
    const root = document.getElementById("missionModeRoot");
    const editor = document.getElementById("codeEditor");
    const editorWrap = editor?.closest(".editor-wrap");
    const missionMount = document.getElementById("missionEditorMount");

    if (root && editor && editorWrap && missionMount) {
      installPreciseCaret({ root, editor, editorWrap, missionMount });
      return;
    }

    if (attempt < 100) window.setTimeout(() => waitForEditor(attempt + 1), 100);
  }

  /* Installe un curseur indépendant du rendu natif du textarea. */
  function installPreciseCaret(refs) {
    if (refs.editorWrap.dataset.preciseCaretReady === "true") return;
    refs.editorWrap.dataset.preciseCaretReady = "true";

    const caret = document.createElement("span");
    caret.className = "mission-precise-caret";
    caret.setAttribute("aria-hidden", "true");
    refs.editorWrap.appendChild(caret);
    refs.editorWrap.classList.add("mission-custom-caret-ready");

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let scheduledFrame = 0;

    /* Détermine si le mode Mission est visible et si le textarea est réellement actif. */
    function editorIsActive() {
      const missionVisible = !refs.root.classList.contains("mission-hidden");
      return missionVisible && document.activeElement === refs.editor;
    }

    /* Convertit les tabulations en colonnes afin de mesurer la position horizontale exacte. */
    function expandTabs(text, tabSize) {
      let result = "";
      let column = 0;

      for (const character of text) {
        if (character === "\t") {
          const spaces = tabSize - (column % tabSize);
          result += " ".repeat(spaces);
          column += spaces;
        } else {
          result += character;
          column += 1;
        }
      }

      return result;
    }

    /* Calcule la ligne et le texte situé avant le point d’insertion. */
    function caretLocation() {
      const position = refs.editor.selectionStart;
      const sourceBeforeCaret = refs.editor.value.slice(0, position);
      const lines = sourceBeforeCaret.split("\n");
      return {
        lineIndex: Math.max(0, lines.length - 1),
        lineBeforeCaret: lines[lines.length - 1] || ""
      };
    }

    /* Lit les métriques CSS communes aux deux couches de l’éditeur. */
    function editorMetrics() {
      const style = window.getComputedStyle(refs.editor);
      const fontSize = parseFloat(style.fontSize) || 18;
      const lineHeight = parseFloat(style.lineHeight) || 28;
      const paddingLeft = parseFloat(style.paddingLeft) || 16;
      const paddingTop = parseFloat(style.paddingTop) || 16;
      const tabSize = Number.parseInt(style.tabSize, 10) || 4;

      if (context) {
        context.font = `${style.fontWeight || "400"} ${style.fontSize || "18px"} ${style.fontFamily || "Consolas"}`;
      }

      return { fontSize, lineHeight, paddingLeft, paddingTop, tabSize };
    }

    /* Positionne le curseur sur la ligne et la colonne réelles de selectionStart. */
    function updateCaret() {
      scheduledFrame = 0;

      if (!editorIsActive() || refs.editor.selectionStart !== refs.editor.selectionEnd) {
        caret.classList.remove("is-visible");
        return;
      }

      const location = caretLocation();
      const metrics = editorMetrics();
      const expandedText = expandTabs(location.lineBeforeCaret, metrics.tabSize);
      const measuredWidth = context ? context.measureText(expandedText).width : expandedText.length * metrics.fontSize * .6;
      const caretHeight = Math.max(18, metrics.lineHeight - 4);
      const verticalInset = (metrics.lineHeight - caretHeight) / 2;
      const left = metrics.paddingLeft + measuredWidth - refs.editor.scrollLeft;
      const top = metrics.paddingTop + location.lineIndex * metrics.lineHeight + verticalInset - refs.editor.scrollTop;

      const visibleHorizontally = left >= 0 && left <= refs.editor.clientWidth;
      const visibleVertically = top + caretHeight >= 0 && top <= refs.editor.clientHeight;

      caret.style.left = `${Math.round(left)}px`;
      caret.style.top = `${Math.round(top)}px`;
      caret.style.height = `${Math.round(caretHeight)}px`;
      caret.classList.toggle("is-visible", visibleHorizontally && visibleVertically);
    }

    /* Regroupe les nombreux événements de saisie dans une seule image de rendu. */
    function scheduleCaretUpdate() {
      window.cancelAnimationFrame(scheduledFrame);
      scheduledFrame = window.requestAnimationFrame(updateCaret);
    }

    /* Les événements couvrent la saisie, la suppression, les flèches et les clics. */
    ["input", "keyup", "keydown", "click", "select", "focus", "mouseup"].forEach(eventName => {
      refs.editor.addEventListener(eventName, scheduleCaretUpdate);
    });

    /* Le défilement doit déplacer le curseur exactement comme le texte coloré. */
    refs.editor.addEventListener("scroll", scheduleCaretUpdate, { passive: true });

    /* selectionchange couvre notamment Suppr, Retour arrière et les sélections au clavier. */
    document.addEventListener("selectionchange", () => {
      if (document.activeElement === refs.editor) scheduleCaretUpdate();
    });

    /* Le curseur est retiré dès que l’éditeur perd le focus. */
    refs.editor.addEventListener("blur", () => caret.classList.remove("is-visible"));

    /* Les changements de taille ou de plein écran modifient le repère de coordonnées. */
    window.addEventListener("resize", scheduleCaretUpdate);
    document.addEventListener("fullscreenchange", scheduleCaretUpdate);

    /* L’activation du mode Mission peut déplacer le composant après son initialisation. */
    const rootObserver = new MutationObserver(scheduleCaretUpdate);
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });

    scheduleCaretUpdate();
  }

  /* Démarre après la construction du document. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => waitForEditor());
  } else {
    waitForEditor();
  }
})();
