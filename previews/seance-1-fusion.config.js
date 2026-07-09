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

// Charger la feuille de style commune à tous les langages et tous les programmes.
const codeHarmonyStyles = document.createElement("link");
codeHarmonyStyles.rel = "stylesheet";
codeHarmonyStyles.href = "../code-harmony.css?v=3";
document.head.appendChild(codeHarmonyStyles);

// Charger le moteur commun de gouttière et de coloration après la construction du document.
const codeHarmonyScript = document.createElement("script");
codeHarmonyScript.src = "../code-harmony.js?v=1";
codeHarmonyScript.async = false;
document.head.appendChild(codeHarmonyScript);
