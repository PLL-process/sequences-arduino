/* Configuration de la prévisualisation fusionnée de la séance 1. */
"use strict";

window.TechnoQuestSessionTemplateConfig = {
  id: 1,
  totalSessions: 8,
  title: "Observer les signaux",
  subtitle: "Faire parler les trois capteurs sans démarrer la pompe",
  context: "Les plantes du jardin ne peuvent pas communiquer directement leur état. La mission consiste à acquérir les mesures d’humidité, de lumière et de niveau d’eau, puis à les transmettre dans le Moniteur Série tout en maintenant la pompe arrêtée.",
  previousUrl: "../parcours.html",
  nextUrl: "../seance-2.html",
  homeUrl: "../parcours.html",
  objectives: [
    "repérer A0, A1, A2 et D6 sur le jumeau numérique",
    "distinguer une liaison de mesure d’un circuit de puissance",
    "lire les trois entrées analogiques avec analogRead()",
    "afficher les mesures dans le Moniteur Série",
    "maintenir la pompe arrêtée avec D6 à LOW"
  ],
  algorithm: [
    { id: "start", type: "start", label: "Début" },
    { id: "setup", type: "process", label: "Initialiser Serial et D6" },
    { id: "read", type: "process", label: "Lire A0, A1 et A2" },
    { id: "display", type: "process", label: "Afficher les trois mesures" },
    { id: "safe", type: "process", label: "Maintenir D6 à LOW" },
    { id: "wait", type: "process", label: "Attendre 1 seconde" },
    { id: "loop", type: "end", label: "Recommencer" }
  ],
  simulation: {
    humidity: 642,
    light: 518,
    water: 781,
    relayState: "LOW",
    pumpState: "arrêtée"
  },
  assessment: [
    { label: "Initialisation et sécurité", points: 4 },
    { label: "Lecture de A0, A1 et A2", points: 6 },
    { label: "Affichage dans le Moniteur Série", points: 6 },
    { label: "Justification écrite", points: 4 }
  ]
};

// Charger immédiatement les feuilles de style communes.
[
  "../code-harmony.css?v=6",
  "../mission-mode/mission-algorithms-premium.css?v=2",
  "../mission-mode/mission-algorithms-layout-v3.css?v=2",
  "../editor-visibility-guard.css?v=1"
].forEach(href => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
});

// Charger les moteurs complémentaires après l’initialisation de la page, dans un ordre stable.
function loadPreviewEnhancements() {
  const sources = [
    "../code-harmony.js?v=3",
    "../mission-mode/mission-algorithms-premium.js?v=4",
    "../mission-mode/mission-algorithms-layout-v3.js?v=5",
    "../editor-visibility-guard.js?v=1"
  ];

  const loadNext = index => {
    if (index >= sources.length) return;
    const script = document.createElement("script");
    script.src = sources[index];
    script.onload = () => loadNext(index + 1);
    script.onerror = () => loadNext(index + 1);
    document.body.appendChild(script);
  };

  window.setTimeout(() => loadNext(0), 0);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadPreviewEnhancements, { once: true });
} else {
  loadPreviewEnhancements();
}
