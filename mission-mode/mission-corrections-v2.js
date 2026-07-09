/*
 * TechnoQuest — corrections pédagogiques des missions 5 et 8.
 *
 * Mission 5 : vraie hystérésis avec mémorisation de l’état précédent.
 * Mission 8 : contrôle explicite des mesures incohérentes avant toute commande.
 */
"use strict";

(() => {
  // Récupérer les deux API déjà chargées par la page.
  const dataApi = window.TechnoQuestMissionData;
  const validator = window.TechnoQuestMissionValidator;

  // Ne rien modifier si les moteurs principaux ne sont pas encore disponibles.
  if (!dataApi?.missions || !validator?.stepTemplates) return;

  // Raccourci permettant de construire un état d’exécution simulé.
  const executionState = (id, lineStep, label, signal, consoleText) => ({
    id,
    lineStep,
    label,
    signal,
    console: consoleText
  });

  // Ajouter le contrôle de la mémorisation nécessaire à une vraie hystérésis.
  validator.stepTemplates.rememberPumpState = {
    label: "mémoriser l’état précédent de la pompe",
    hint1: "Une hystérésis doit conserver l’état de la pompe entre les deux seuils.",
    hint2: "Déclare une variable globale bool pompeActive = false;.",
    hint3: "Sous le seuil bas, passe pompeActive à true ; au-dessus du seuil haut, repasse-la à false ; entre les deux, ne la modifie pas.",
    marker: /pompeActive|état précédent|hyst[eé]r[eé]sis/i,
    line: /bool\s+pompeActive|pompeActive\s*=\s*(?:true|false)/,
    test: (source, context) => {
      const humidityVariable = context?.vars?.humidity;
      const stateDeclaration = source.match(/\bbool\s+([A-Za-z_]\w*)\s*=\s*false\s*;/);
      if (!humidityVariable || !stateDeclaration) return false;

      const stateVariable = stateDeclaration[1];
      const escapedHumidity = humidityVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedState = stateVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const startPattern = new RegExp(`if\\s*\\([^)]*${escapedHumidity}\\s*<\\s*SEUIL_HUMIDITE[^)]*\\)\\s*\\{[\\s\\S]*?${escapedState}\\s*=\\s*true\\s*;`);
      const stopPattern = new RegExp(`else\\s+if\\s*\\([^)]*${escapedHumidity}\\s*>\\s*SEUIL_ARRET[^)]*\\)\\s*\\{[\\s\\S]*?${escapedState}\\s*=\\s*false\\s*;`);
      return startPattern.test(source) && stopPattern.test(source);
    }
  };

  // Ajouter le contrôle de cohérence attendu dans le défi ingénieur.
  validator.stepTemplates.checkCoherence = {
    label: "vérifier que A0, A1 et A2 restent dans la plage 0 à 1023",
    hint1: "Le prototype final doit refuser une mesure impossible avant de commander la pompe.",
    hint2: "Construis un booléen mesuresCoherentes avec les trois valeurs comprises entre 0 et 1023.",
    hint3: "Exemple : humidite >= 0 && humidite <= 1023, puis le même contrôle pour lumière et niveau d’eau.",
    marker: /mesuresCoherentes|coh[eé]rentes|0.*1023|1023.*0/i,
    line: /mesuresCoherentes|coh[eé]rentes|1023/,
    test: (source, context) => {
      const variables = [context?.vars?.humidity, context?.vars?.light, context?.vars?.water].filter(Boolean);
      if (variables.length !== 3) return false;

      return variables.every(variable => {
        const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const lowerBound = new RegExp(`\\b${escaped}\\s*>=\\s*0\\b|\\b0\\s*<=\\s*${escaped}\\b`);
        const upperBound = new RegExp(`\\b${escaped}\\s*<=\\s*1023\\b|\\b1023\\s*>=\\s*${escaped}\\b`);
        return lowerBound.test(source) && upperBound.test(source);
      });
    }
  };

  // Ajouter le message d’erreur associé aux mesures incohérentes.
  validator.stepTemplates.alertSensor = {
    label: "afficher une erreur de capteur et maintenir la pompe arrêtée",
    hint1: "Une mesure impossible doit produire une alerte claire.",
    hint2: "Affiche un message comme Erreur capteur ou Mesure incohérente.",
    hint3: "L’alerte doit être traitée avant le réservoir vide et avant l’arrosage.",
    marker: /Erreur capteur|Mesure incoh[eé]rente|capteur invalide/i,
    line: /Erreur capteur|Mesure incoh[eé]rente|capteur invalide/i,
    test: source => /Serial\s*\.\s*println\s*\(\s*"[^"]*(?:Erreur capteur|Mesure incoh[eé]rente|capteur invalide)[^"]*"\s*\)\s*;/i.test(source)
  };

  // Corriger la mission 5 : conserver l’état dans la zone d’hystérésis.
  const mission5 = dataApi.missions[5];
  if (mission5) {
    mission5.subtitle = "Mémoriser l’état de la pompe entre un seuil de démarrage et un seuil d’arrêt.";
    mission5.context = "Un seuil unique provoque des oscillations. Ta mission consiste à créer une vraie hystérésis : la pompe démarre sous le seuil bas, s’arrête au-dessus du seuil haut et conserve son état entre les deux, tout en respectant la sécurité du réservoir.";
    mission5.steps = [
      "include", "serialBegin", "pinMode", "safeLowSetup",
      "thresholdHumidity", "thresholdStop", "thresholdWater", "rememberPumpState",
      "readHumidity", "readWater", "compareWaterLow", "compareHumidity", "compareStop",
      "pumpStart", "pumpStop", "delay"
    ];
    mission5.objectives = [
      { label: "définir un seuil bas et un seuil haut", steps: ["thresholdHumidity", "thresholdStop"] },
      { label: "mémoriser l’état précédent de la pompe", steps: ["rememberPumpState"] },
      { label: "conserver la sécurité prioritaire du réservoir", steps: ["thresholdWater", "readWater", "compareWaterLow", "pumpStop"] },
      { label: "démarrer sous le seuil bas et arrêter au-dessus du seuil haut", steps: ["compareHumidity", "compareStop", "pumpStart", "pumpStop"] },
      { label: "conserver l’état entre les deux seuils", steps: ["rememberPumpState"] }
    ];
    mission5.badges = [
      { id: "sensors", label: "Mesures utiles", steps: ["readHumidity", "readWater"] },
      { id: "decision", label: "Vraie hystérésis", steps: ["thresholdHumidity", "thresholdStop", "rememberPumpState", "compareStop"] },
      { id: "safety", label: "Réservoir prioritaire", steps: ["compareWaterLow", "pumpStop"] }
    ];
    mission5.guidedIntro = "Complète les deux seuils et la variable qui mémorise l’état précédent de la pompe.";
    mission5.standardIntro = "Programme une vraie hystérésis avec mémorisation et sécurité prioritaire du réservoir.";
    mission5.expertContract = "Démarrer sous le seuil bas, arrêter au-dessus du seuil haut, conserver l’état entre les deux et protéger la pompe si A2 est insuffisant.";

    // Fournir trois squelettes cohérents avec la véritable hystérésis.
    mission5.skeletons.guided = `// Mission 5 — Vraie hystérésis
// Complète les lignes manquantes sans ajouter de else qui effacerait la mémoire.

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = ____;
const int SEUIL_RESERVOIR = 350;

// Mémoriser l’état précédent entre deux passages dans loop().
bool pompeActive = false;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  if (niveauEau < SEUIL_RESERVOIR) {
    pompeActive = false;
  } else if (______________________________) {
    pompeActive = true;
  } else if (______________________________) {
    pompeActive = false;
  }
  // Entre les deux seuils : aucune affectation, donc l’état est conservé.

  if (pompeActive) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);
}`;

    mission5.skeletons.standard = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = 650;
const int SEUIL_RESERVOIR = 350;

bool pompeActive = false;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  // Lire A0 et A2.

  // Priorité au réservoir, puis vraie hystérésis avec mémorisation.

  // Commander D6 selon pompeActive, puis attendre une seconde.
}`;

    mission5.skeletons.expert = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = 650;
const int SEUIL_RESERVOIR = 350;

bool pompeActive = false;

void setup() {
}

void loop() {
  // Contrat : vraie hystérésis mémorisée et sécurité A2 prioritaire.
}`;

    // Remplacer le programme de référence erroné par une vraie hystérésis.
    mission5.reference = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = 650;
const int SEUIL_RESERVOIR = 350;

bool pompeActive = false;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  if (niveauEau < SEUIL_RESERVOIR) {
    pompeActive = false;
  } else if (humidite < SEUIL_HUMIDITE) {
    pompeActive = true;
  } else if (humidite > SEUIL_ARRET) {
    pompeActive = false;
  }

  if (pompeActive) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  Serial.print("Humidité : ");
  Serial.println(humidite);
  Serial.print("Pompe active : ");
  Serial.println(pompeActive ? "oui" : "non");
  delay(1000);
}`;

    mission5.loopStates = [
      executionState("readA0", "readHumidity", "loop() — lecture de A0 humidité", "a0", "Humidité lue."),
      executionState("readA2", "readWater", "loop() — lecture de A2 niveau d’eau", "a2", "Niveau du réservoir lu."),
      executionState("checkWater", "compareWaterLow", "loop() — sécurité du réservoir", "a2", "A2 reste prioritaire."),
      executionState("remember", "rememberPumpState", "loop() — mémorisation de l’état", "d6", "Entre les deux seuils, l’état précédent est conservé."),
      executionState("start", "pumpStart", "loop() — commande HIGH si pompeActive", "tbt", "La pompe peut rester active sous le seuil bas."),
      executionState("stop", "pumpStop", "loop() — commande LOW si pompe inactive", "tbt", "La pompe s’arrête au-dessus du seuil haut ou si le réservoir est insuffisant."),
      executionState("delay", "delay", "loop() — temporisation", "water", "Nouvelle mesure dans une seconde.")
    ];
  }

  // Corriger la mission 8 : vérifier les valeurs incohérentes en premier.
  const mission8 = dataApi.missions[8];
  if (mission8) {
    mission8.subtitle = "Programmer le prototype final, détecter les mesures incohérentes et sécuriser toute commande.";
    mission8.context = "Le prototype final doit lire trois capteurs, refuser toute valeur incohérente, sécuriser le réservoir, arroser brièvement et communiquer ses mesures.";
    mission8.steps = [
      "include", "serialBegin", "pinMode", "safeLowSetup",
      "thresholdHumidity", "thresholdWater", "thresholdLight",
      "readHumidity", "readLight", "readWater", "checkCoherence", "alertSensor",
      "compareWaterLow", "alertWater", "compareHumidity", "compareLight",
      "showHumidity", "showLight", "showWater", "pumpStart", "delayPump", "pumpStop", "delay"
    ];
    mission8.objectives = [
      { label: "lire les trois capteurs", steps: ["readHumidity", "readLight", "readWater"] },
      { label: "refuser les valeurs incohérentes avant toute commande", steps: ["checkCoherence", "alertSensor", "pumpStop"] },
      { label: "traiter ensuite le réservoir vide", steps: ["compareWaterLow", "alertWater", "pumpStop"] },
      { label: "appliquer la décision multicritère", steps: ["compareHumidity", "compareLight"] },
      { label: "afficher, limiter et sécuriser l’arrosage", steps: ["showHumidity", "showLight", "showWater", "pumpStart", "delayPump", "pumpStop"] }
    ];
    mission8.badges = [
      { id: "sensors", label: "Trois mesures contrôlées", steps: ["readHumidity", "readLight", "readWater", "checkCoherence"] },
      { id: "decision", label: "Décision finale fiable", steps: ["checkCoherence", "compareWaterLow", "compareHumidity", "compareLight"] },
      { id: "safety", label: "Défaillance maîtrisée", steps: ["alertSensor", "alertWater", "pumpStop"] }
    ];
    mission8.guidedIntro = "Complète le programme final en vérifiant d’abord la cohérence des trois mesures.";
    mission8.standardIntro = "Construis le programme final avec contrôle de cohérence, sécurité réservoir et décision multicritère.";
    mission8.expertContract = "Contrôler la cohérence des trois mesures avant toute commande, puis appliquer les sécurités et la décision finale.";

    // Fournir des squelettes intégrant explicitement le contrôle de cohérence.
    mission8.skeletons.guided = `// Mission 8 — Prototype final fiable

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  bool mesuresCoherentes =
    humidite >= 0 && humidite <= 1023 &&
    ______________________________ &&
    ______________________________;

  if (!mesuresCoherentes) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    ______________________________;
  } else if (niveauEau < SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    Serial.println("Réservoir vide");
  } else if (humidite < SEUIL_HUMIDITE && lumiere < SEUIL_LUMIERE) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  Serial.println(humidite);
  Serial.println(lumiere);
  Serial.println(niveauEau);
  delay(1000);
}`;

    mission8.skeletons.standard = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  // Lire A0, A1 et A2.
  // Construire mesuresCoherentes avec la plage 0 à 1023.
  // Traiter dans cet ordre : incohérence, réservoir vide, décision multicritère.
  // Afficher les mesures puis attendre une seconde.
}`;

    mission8.skeletons.expert = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;

void setup() {
}

void loop() {
  // Contrat final : cohérence des mesures, sécurité prioritaire, décision, affichage et arrosage court.
}`;

    // Remplacer le programme final par une version qui traite réellement les valeurs incohérentes.
    mission8.reference = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  bool mesuresCoherentes =
    humidite >= 0 && humidite <= 1023 &&
    lumiere >= 0 && lumiere <= 1023 &&
    niveauEau >= 0 && niveauEau <= 1023;

  if (!mesuresCoherentes) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    Serial.println("Erreur capteur : mesure incohérente");
  } else if (niveauEau < SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    Serial.println("Réservoir vide");
  } else if (humidite < SEUIL_HUMIDITE && lumiere < SEUIL_LUMIERE) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  Serial.println(humidite);
  Serial.println(lumiere);
  Serial.println(niveauEau);
  delay(1000);
}`;

    mission8.loopStates = [
      executionState("readA0", "readHumidity", "loop() — lecture de A0", "a0", "Humidité lue."),
      executionState("readA1", "readLight", "loop() — lecture de A1", "a1", "Lumière lue."),
      executionState("readA2", "readWater", "loop() — lecture de A2", "a2", "Niveau d’eau lu."),
      executionState("coherence", "checkCoherence", "loop() — contrôle de cohérence", "serial", "Les trois mesures sont comparées à la plage 0–1023."),
      executionState("sensorAlert", "alertSensor", "loop() — alerte capteur", "serial", "Toute mesure incohérente bloque la pompe."),
      executionState("waterSafety", "compareWaterLow", "loop() — sécurité du réservoir", "a2", "Le réservoir est contrôlé après la cohérence."),
      executionState("decision", "compareHumidity", "loop() — décision multicritère", "a0", "Humidité et lumière sont comparées."),
      executionState("pump", "pumpStart", "loop() — arrosage autorisé", "tbt", "Arrosage limité à deux secondes."),
      executionState("stop", "pumpStop", "loop() — arrêt de sécurité", "tbt", "La pompe revient à LOW."),
      executionState("delay", "delay", "loop() — temporisation", "water", "Nouvelle boucle dans une seconde.")
    ];
  }
})();
