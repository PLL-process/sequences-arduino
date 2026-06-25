/* Charge séquentiellement le moteur du jumeau numérique puis le rosier SVG. */
"use strict";

(() => {
  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${src}?v=7`;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    document.body.appendChild(script);
  });

  loadScript("simulation-enhancements-core.js")
    .then(() => loadScript("rose-visual.js"))
    .catch(error => console.error("TechnoQuest :", error));
})();
