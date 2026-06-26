/* Charge séquentiellement le moteur, les visuels matériels et les aides pédagogiques. */
"use strict";

(() => {
  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${src}?v=25`;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    document.body.appendChild(script);
  });

  /* L'aide Python est chargée en premier afin de restaurer rapidement l'éditeur, même avec une connexion lente. */
  loadScript("python-learning-aid.js")
    .then(() => loadScript("simulation-enhancements-core.js"))
    .then(() => loadScript("trigger-media.js"))
    .then(() => loadScript("rose-visual.js"))
    .then(() => loadScript("hardware-visual.js"))
    .then(() => loadScript("hardware-layout-fix.js"))
    .then(() => loadScript("hydraulic-layout-fix.js"))
    .then(() => loadScript("reservoir-label-fix.js"))
    .then(() => loadScript("cleanup-legacy-water.js"))
    .then(() => loadScript("pedagogical-corrections-data.js"))
    .then(() => loadScript("pedagogical-corrections.js"))
    .then(() => loadScript("visual-caption-fix.js"))
    .then(() => loadScript("acronym-learning.js"))
    .then(() => loadScript("board-adaptation.js"))
    .then(() => loadScript("adc-calibration-activity.js"))
    .then(() => loadScript("digital-twin-clean-layout.js"))
    .then(() => loadScript("digital-twin-clean-layout-fix.js"))
    .catch(error => console.error("TechnoQuest :", error));
})();
