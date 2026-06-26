/* Supprime les anciens effets d'eau et charge le visuel retenu pour l'introduction. */
"use strict";

(() => {
  document.querySelectorAll(".water-jet, .water-drop-zone").forEach(element => element.remove());

  if (!document.querySelector('script[data-trigger-visual-selection]')) {
    const script = document.createElement("script");
    script.src = "trigger-visual-selection.js?v=23";
    script.dataset.triggerVisualSelection = "true";
    document.body.appendChild(script);
  }
})();
