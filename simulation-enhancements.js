/* Charge séquentiellement le moteur, le rosier et le schéma matériel du jumeau numérique. */
"use strict";

(() => {
  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${src}?v=10`;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    document.body.appendChild(script);
  });

  loadScript("simulation-enhancements-core.js")
    .then(() => loadScript("rose-visual.js"))
    .then(() => loadScript("hardware-visual.js"))
    .then(() => loadScript("hardware-layout-fix.js"))
    .then(() => loadScript("cleanup-legacy-water.js"))
    .catch(error => console.error("TechnoQuest :", error));
})();
