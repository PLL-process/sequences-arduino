/*
 * TechnoQuest — configuration d’exemple du template de séance.
 *
 * Dupliquer ce fichier, puis modifier uniquement cet objet pour créer une nouvelle séance.
 * Le moteur session-template.js construit ensuite l’interface, l’algorigramme,
 * les niveaux d’aide, les validations et le moniteur série simulé.
 */
"use strict";

window.TechnoQuestSessionTemplateConfig = {
  // Numéro et identité générale de la séance.
  id: 2,
  totalSessions: 8,
  title: "Calibrer un seuil",
  subtitle: "Transformer des mesures en décision fiable",
  context: "Le jardin connecté reçoit des valeurs différentes selon que le sol est sec ou humide. L’équipe doit choisir un seuil justifié avant d’autoriser l’automatisation.",

  // Liens de navigation à adapter lors de la duplication.
  previousUrl: "../seance-1.html",
  nextUrl: "../seance-3.html",
  homeUrl: "../parcours.html",

  // Objectifs courts, observables et compréhensibles par un élève.
  objectives: [
    "Relever plusieurs valeurs du capteur d’humidité sur A0.",
    "Comparer les mesures obtenues en sol sec et en sol humide.",
    "Choisir et justifier un seuil de décision.",
    "Vérifier le résultat dans le moniteur série simulé."
  ],

  // Étapes de l’algorigramme visuel.
  algorithm: [
    { id: "start", type: "start", label: "Début" },
    { id: "read", type: "process", label: "Lire A0" },
    { id: "compare", type: "decision", label: "Humidité < seuil ?" },
    { id: "dry", type: "process", label: "Afficher : sol sec" },
    { id: "wet", type: "process", label: "Afficher : sol humide" },
    { id: "safe", type: "process", label: "Maintenir D6 à LOW" },
    { id: "end", type: "end", label: "Recommencer" }
  ],

  // Squelettes proposés selon le niveau d’aide choisi.
  starters: {
    guided: `const int CAPTEUR_HUMIDITE = A0;
const int RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;

void setup() {
  Serial.begin(9600);
  pinMode(RELAIS_POMPE, OUTPUT);
}

void loop() {
  // 1. Acquérir et mémoriser la mesure du capteur A0.
  int humidite = analogRead(CAPTEUR_HUMIDITE);

  // 2. Comparer la mesure au seuil retenu.
  if (______________________________) {
    Serial.println("Sol sec");
  } else {
    Serial.println("Sol humide");
  }

  // 3. Pendant la calibration, la pompe doit rester arrêtée.
  digitalWrite(RELAIS_POMPE, LOW);
  delay(1000);
}`,
    standard: `const int CAPTEUR_HUMIDITE = A0;
const int RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;

void setup() {
  Serial.begin(9600);
  pinMode(RELAIS_POMPE, OUTPUT);
}

void loop() {
  int humidite = __________________________;

  if (humidite < SEUIL_HUMIDITE) {
    ______________________________;
  } else {
    ______________________________;
  }

  digitalWrite(RELAIS_POMPE, LOW);
  delay(1000);
}`,
    autonomous: `// Mission autonome :
// - lire le capteur d’humidité sur A0 ;
// - comparer la mesure à un seuil justifié ;
// - afficher « Sol sec » ou « Sol humide » ;
// - maintenir la pompe arrêtée pendant la calibration.
`
  },

  // Programme complet utilisé uniquement pour restaurer la démonstration du template.
  referenceCode: `const int CAPTEUR_HUMIDITE = A0;
const int RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;

void setup() {
  Serial.begin(9600);
  pinMode(RELAIS_POMPE, OUTPUT);
}

void loop() {
  int humidite = analogRead(CAPTEUR_HUMIDITE);

  if (humidite < SEUIL_HUMIDITE) {
    Serial.println("Sol sec");
  } else {
    Serial.println("Sol humide");
  }

  digitalWrite(RELAIS_POMPE, LOW);
  delay(1000);
}`,

  // Valeurs fixes de la simulation pédagogique reproductible.
  simulation: {
    humidity: 468,
    threshold: 520,
    relayState: "LOW",
    pumpState: "arrêtée"
  },

  // Contrôles automatiques appliqués au code de l’élève.
  checks: [
    {
      id: "serial",
      label: "Le moniteur série est initialisé à 9600 bauds.",
      pattern: "Serial\\s*\\.\\s*begin\\s*\\(\\s*9600\\s*\\)\\s*;"
    },
    {
      id: "read-a0",
      label: "Le programme lit explicitement le capteur branché sur A0.",
      pattern: "analogRead\\s*\\(\\s*(?:A0|CAPTEUR_HUMIDITE)\\s*\\)"
    },
    {
      id: "decision",
      label: "Une condition compare la mesure au seuil d’humidité.",
      pattern: "if\\s*\\([^)]*(?:SEUIL_HUMIDITE|seuil)[^)]*\\)"
    },
    {
      id: "display",
      label: "Les états du sol sont envoyés au moniteur série.",
      pattern: "Serial\\s*\\.\\s*println\\s*\\("
    },
    {
      id: "safe-state",
      label: "La pompe est maintenue à l’arrêt avec D6 à LOW.",
      pattern: "digitalWrite\\s*\\(\\s*(?:RELAIS_POMPE|6)\\s*,\\s*LOW\\s*\\)\\s*;"
    }
  ],

  // Critères de la mission, visibles uniquement en Mode Mission.
  assessment: [
    { label: "Programme fonctionnel et syntaxe attendue", points: 8 },
    { label: "Seuil cohérent avec les mesures", points: 4 },
    { label: "État sûr de la pompe", points: 4 },
    { label: "Justification écrite", points: 4 }
  ]
};

// Charger le véritable jumeau numérique partagé avec les séances publiques.
const realTwinScript = document.createElement("script");
realTwinScript.src = "real-twin.js?v=1";
realTwinScript.async = false;
document.head.appendChild(realTwinScript);

// Charger la feuille de style commune aux programmes et à tous les langages reconnus.
const codeHarmonyStyles = document.createElement("link");
codeHarmonyStyles.rel = "stylesheet";
codeHarmonyStyles.href = "../code-harmony.css?v=4";
document.head.appendChild(codeHarmonyStyles);

// Charger le moteur commun de coloration, de légende et de gouttière.
const codeHarmonyScript = document.createElement("script");
codeHarmonyScript.src = "../code-harmony.js?v=1";
codeHarmonyScript.async = false;
document.head.appendChild(codeHarmonyScript);
