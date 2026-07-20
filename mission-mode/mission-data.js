/* TechnoQuest Mission Mode - données pédagogiques des huit missions. */
"use strict";

(() => {
  const commonConstants = `const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;`;

  const setupCode = `void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}`;

  const setupStates = [
    { id: "serialBegin", lineStep: "serialBegin", label: "setup() - activation du Moniteur Série", signal: "serial", console: "Moniteur Série prêt à 9600 bauds." },
    { id: "pinMode", lineStep: "pinMode", label: "setup() - D6 configurée en sortie", signal: "d6", console: "D6 devient une sortie de commande." },
    { id: "safeLowSetup", lineStep: "safeLowSetup", label: "setup() - pompe maintenue arrêtée", signal: "tbt", console: "Relais au repos : pompe arrêtée." }
  ];

  const sensors = {
    humidity: { key: "humidity", label: "A0 humidité", value: 642, signal: "a0" },
    light: { key: "light", label: "A1 lumière", value: 518, signal: "a1" },
    water: { key: "water", label: "A2 niveau", value: 781, signal: "a2" }
  };

  const state = (id, lineStep, label, signal, console, sensorKey = "") => ({
    id,
    lineStep,
    label,
    signal,
    sensor: sensorKey,
    value: sensorKey ? sensors[sensorKey].value : undefined,
    console
  });

  const readHumidity = state("readA0", "readHumidity", "loop() - lecture de A0 humidité", "a0", "A0 humidité = 642", "humidity");
  const readLight = state("readA1", "readLight", "loop() - lecture de A1 lumière", "a1", "A1 lumière = 518", "light");
  const readWater = state("readA2", "readWater", "loop() - lecture de A2 niveau d'eau", "a2", "A2 niveau d'eau = 781", "water");
  const showHumidity = state("serialHumidity", "showHumidity", "loop() - affichage de l'humidité", "serial", "Humidité : 642");
  const showLight = state("serialLight", "showLight", "loop() - affichage de la lumière", "serial", "Lumière : 518");
  const showWater = state("serialWater", "showWater", "loop() - affichage du niveau d'eau", "serial", "Niveau d'eau : 781");
  const delay1 = state("delay", "delay", "loop() - temporisation de 1000 ms", "water", "Attente 1 seconde, puis retour au début de loop().");
  const pumpStart = state("pumpStart", "pumpStart", "loop() - relais activé", "tbt", "D6 passe à HIGH : le relais alimente brièvement la pompe.");
  const pumpStop = state("pumpStop", "pumpStop", "loop() - pompe arrêtée", "tbt", "D6 revient à LOW : la pompe est arrêtée.");
  const alertWater = state("alertWater", "alertWater", "loop() - alerte réservoir", "a2", "Alerte : réservoir vide ou niveau insuffisant.");

  function buildReference(extraConstants, loopCode) {
    return `#include <Arduino.h>

${commonConstants}
${extraConstants ? `\n${extraConstants}\n` : ""}
${setupCode}

void loop() {
${loopCode}
}`;
  }

  function buildSkeleton(mission, mode) {
    if (mode === "expert") {
      return `#include <Arduino.h>

${commonConstants}
${mission.expertConstants || mission.referenceConstants || ""}
void setup() {
}

void loop() {
  // ${mission.expertContract}
}`;
    }
    const isGuided = mode === "guided";
    return `// ${mission.title}
// ${isGuided ? mission.guidedIntro : mission.standardIntro}

${commonConstants}
${isGuided ? mission.guidedConstants : mission.standardConstants}
void setup() {
  // Initialiser le Moniteur Série à 9600 bauds.

  // Configurer D6 en sortie puis garder la pompe arrêtée.

}

void loop() {
${isGuided ? mission.guidedLoop : mission.standardLoop}
}`;
  }

  function mission(config) {
    const completed = {
      sensors: config.sensorKeys.map(key => sensors[key]),
      setupStates,
      skeletons: {},
      ...config
    };
    completed.skeletons.guided = buildSkeleton(completed, "guided");
    completed.skeletons.standard = buildSkeleton(completed, "standard");
    completed.skeletons.expert = buildSkeleton(completed, "expert");
    completed.reference = buildReference(completed.referenceConstants || "", completed.referenceLoop);
    completed.values = Object.fromEntries(completed.sensors.map(sensor => [sensor.key, sensor.value]));
    return completed;
  }

  const missions = {
    1: mission({
      id: 1,
      title: "Mission 1 — Faire parler les capteurs",
      subtitle: "Lire A0, A1 et A2 dans le Moniteur Série sans démarrer la pompe.",
      context: "Les plantes du jardin ne peuvent pas encore communiquer leur état. Ta mission consiste à lire leurs capteurs et à transmettre leurs mesures dans le Moniteur Série, sans démarrer la pompe.",
      fileName: "mission-1-faire-parler-les-capteurs.ino",
      sensorKeys: ["humidity", "light", "water"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "readHumidity", "readLight", "readWater", "showHumidity", "showLight", "showWater", "pumpStop", "delay"],
      loopStates: [readHumidity, readLight, readWater, showHumidity, showLight, showWater, pumpStop, delay1],
      objectives: [
        { label: "initialiser la communication série", steps: ["serialBegin"] },
        { label: "sécuriser la pompe", steps: ["pinMode", "safeLowSetup", "pumpStop"] },
        { label: "lire A0, A1 et A2", steps: ["readHumidity", "readLight", "readWater"] },
        { label: "afficher les trois mesures", steps: ["showHumidity", "showLight", "showWater"] },
        { label: "attendre une seconde", steps: ["delay"] },
        { label: "téléverser ensuite dans l'IDE Arduino", steps: ["include", "serialBegin", "pinMode"] }
      ],
      badges: [
        { id: "sensors", label: "Capteurs détectés", steps: ["readHumidity", "readLight", "readWater"] },
        { id: "communication", label: "Communication établie", steps: ["serialBegin", "showHumidity", "showLight", "showWater"] },
        { id: "safety", label: "Système sécurisé", steps: ["pinMode", "safeLowSetup", "pumpStop"] }
      ],
      guidedIntro: "Étape 1 : ajoute la bibliothèque Arduino, puis complète chaque ligne manquante.",
      standardIntro: "Complète les lectures, les affichages et l'arrêt de sécurité.",
      expertContract: "Lire A0, A1 et A2, afficher les trois mesures, garder D6 à LOW et attendre une seconde.",
      guidedConstants: "",
      standardConstants: "",
      referenceConstants: "",
      guidedLoop: `  // Lire l'humidité du sol sur A0.

  // Lire la lumière sur A1.

  // Lire le niveau d'eau sur A2.

  // Afficher les trois mesures dans le Moniteur Série.

  // Garder la pompe arrêtée.

  // Attendre une seconde.
`,
      standardLoop: `  // Lire A0, A1 et A2 dans trois variables.

  // Afficher les trois mesures.

  // Garder la pompe arrêtée puis attendre une seconde.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.print("Humidité : ");
  Serial.println(humidite);
  Serial.print("Lumière : ");
  Serial.println(lumiere);
  Serial.print("Niveau d'eau : ");
  Serial.println(niveauEau);

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);`
    }),
    2: mission({
      id: 2,
      title: "Mission 2 — Calibrer un seuil",
      subtitle: "Choisir un seuil d'humidité à partir des mesures sèches et humides.",
      context: "Une valeur isolée ne suffit pas. Ta mission consiste à programmer un seuil modifiable, lire A0, classer le sol et conserver la pompe arrêtée.",
      fileName: "mission-2-calibrer-un-seuil.ino",
      sensorKeys: ["humidity"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "readHumidity", "compareHumidity", "showHumidity", "showSoilState", "pumpStop", "delay"],
      loopStates: [readHumidity, state("compareHumidity", "compareHumidity", "loop() - comparaison au seuil", "a0", "Humidité comparée au seuil choisi."), showHumidity, state("showSoilState", "showSoilState", "loop() - affichage sec ou humide", "serial", "État du sol affiché dans le Moniteur Série."), pumpStop, delay1],
      objectives: [
        { label: "définir un seuil modifiable", steps: ["thresholdHumidity"] },
        { label: "lire l'humidité A0", steps: ["readHumidity"] },
        { label: "comparer la mesure au seuil", steps: ["compareHumidity"] },
        { label: "afficher la mesure et l'état du sol", steps: ["showHumidity", "showSoilState"] },
        { label: "garder la pompe arrêtée", steps: ["safeLowSetup", "pumpStop"] }
      ],
      badges: [
        { id: "sensors", label: "A0 calibré", steps: ["readHumidity"] },
        { id: "decision", label: "Seuil justifié", steps: ["thresholdHumidity", "compareHumidity"] },
        { id: "safety", label: "Pompe bloquée", steps: ["pinMode", "safeLowSetup", "pumpStop"] }
      ],
      guidedIntro: "Utilise tes mesures pour remplacer la valeur du seuil, puis complète la comparaison.",
      standardIntro: "Définis un seuil, lis A0, affiche l'état du sol et sécurise D6.",
      expertContract: "Classer le sol avec un seuil issu de la calibration et garder la pompe arrêtée.",
      guidedConstants: "\nconst int SEUIL_HUMIDITE = ____;\n",
      standardConstants: "\nconst int SEUIL_HUMIDITE = ____;\n",
      expertConstants: "\nconst int SEUIL_HUMIDITE = 560;\n",
      referenceConstants: "const int SEUIL_HUMIDITE = 560;",
      guidedLoop: `  // Lire A0 dans une variable humidite.

  // Afficher la valeur mesurée.

  // Comparer humidite au seuil et afficher "Sol sec" ou "Sol humide".

  // Garder la pompe arrêtée et attendre une seconde.
`,
      standardLoop: `  // Lire A0, comparer au seuil, afficher l'état du sol.

  // Garder D6 à LOW puis attendre une seconde.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);

  Serial.print("Humidité : ");
  Serial.println(humidite);

  if (humidite < SEUIL_HUMIDITE) {
    Serial.println("Sol sec");
  } else {
    Serial.println("Sol humide");
  }

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);`
    }),
    3: mission({
      id: 3,
      title: "Mission 3 — Analyser les chaînes",
      subtitle: "Relier information et énergie en commandant brièvement la pompe.",
      context: "Le capteur informe l'Arduino, mais la pompe utilise une alimentation séparée. Ta mission consiste à lire A0 puis commander le relais seulement si le sol est sec.",
      fileName: "mission-3-chaines-information-energie.ino",
      sensorKeys: ["humidity"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "readHumidity", "compareHumidity", "showHumidity", "pumpStart", "delayPump", "pumpStop", "delay"],
      loopStates: [readHumidity, state("compareHumidity", "compareHumidity", "loop() - décision sol sec", "a0", "Décision : le sol est comparé au seuil."), showHumidity, pumpStart, state("delayPump", "delayPump", "loop() - arrosage limité", "water", "Arrosage limité à trois secondes."), pumpStop, delay1],
      objectives: [
        { label: "lire l'information A0", steps: ["readHumidity"] },
        { label: "traiter la mesure avec un seuil", steps: ["thresholdHumidity", "compareHumidity"] },
        { label: "distribuer l'énergie par le relais", steps: ["pumpStart"] },
        { label: "arrêter la pompe après trois secondes", steps: ["delayPump", "pumpStop"] },
        { label: "afficher la mesure", steps: ["showHumidity"] }
      ],
      badges: [
        { id: "sensors", label: "Information acquise", steps: ["readHumidity"] },
        { id: "decision", label: "Traitement réalisé", steps: ["thresholdHumidity", "compareHumidity"] },
        { id: "safety", label: "Énergie maîtrisée", steps: ["pinMode", "pumpStart", "pumpStop"] }
      ],
      guidedIntro: "Complète le programme qui relie la chaîne d'information à la chaîne d'énergie.",
      standardIntro: "Lis A0, teste le seuil, active le relais trois secondes seulement si le sol est sec.",
      expertContract: "Commander la pompe trois secondes si le sol est sec, sinon garantir l'arrêt.",
      guidedConstants: "\nconst int SEUIL_HUMIDITE = 560;\n",
      standardConstants: "\nconst int SEUIL_HUMIDITE = 560;\n",
      expertConstants: "\nconst int SEUIL_HUMIDITE = 560;\n",
      referenceConstants: "const int SEUIL_HUMIDITE = 560;",
      guidedLoop: `  // Lire A0 dans humidite.

  // Afficher la mesure.

  // Si le sol est sec, activer D6, attendre 3 s, puis arrêter.

  // Sinon, garder la pompe arrêtée.

  // Attendre une seconde avant de recommencer.
`,
      standardLoop: `  // Lire A0, afficher, puis arroser 3 s uniquement si humidite < SEUIL_HUMIDITE.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);
  Serial.print("Humidité : ");
  Serial.println(humidite);

  if (humidite < SEUIL_HUMIDITE) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(3000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`
    }),
    4: mission({
      id: 4,
      title: "Mission 4 — Protéger la pompe",
      subtitle: "Arroser seulement si le sol est sec et si le réservoir contient assez d'eau.",
      context: "La pompe ne doit jamais fonctionner à vide. Ta mission consiste à donner la priorité au niveau A2 avant toute commande d'arrosage.",
      fileName: "mission-4-proteger-la-pompe.ino",
      sensorKeys: ["humidity", "water"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "readHumidity", "readWater", "compareWaterLow", "compareHumidity", "compareWaterEnough", "alertWater", "pumpStart", "delayPump", "pumpStop", "delay"],
      loopStates: [readHumidity, readWater, state("compareWaterLow", "compareWaterLow", "loop() - priorité au réservoir", "a2", "Le niveau A2 est vérifié avant l'arrosage."), alertWater, state("compareHumidity", "compareHumidity", "loop() - sol sec et eau disponible", "a0", "Décision avec humidité et niveau."), pumpStart, state("delayPump", "delayPump", "loop() - arrosage limité", "water", "Arrosage limité à trois secondes."), pumpStop, delay1],
      objectives: [
        { label: "lire A0 et A2", steps: ["readHumidity", "readWater"] },
        { label: "définir les deux seuils", steps: ["thresholdHumidity", "thresholdWater"] },
        { label: "bloquer la marche à vide", steps: ["compareWaterLow", "alertWater", "pumpStop"] },
        { label: "arroser seulement si les deux conditions sont vraies", steps: ["compareHumidity", "compareWaterEnough", "pumpStart"] },
        { label: "limiter la durée d'arrosage", steps: ["delayPump"] }
      ],
      badges: [
        { id: "sensors", label: "A0 et A2 lus", steps: ["readHumidity", "readWater"] },
        { id: "decision", label: "Condition AND", steps: ["compareHumidity", "compareWaterEnough"] },
        { id: "safety", label: "Marche à vide évitée", steps: ["compareWaterLow", "alertWater", "pumpStop"] }
      ],
      guidedIntro: "Complète la sécurité du réservoir avant la décision d'arrosage.",
      standardIntro: "Lis A0 et A2, donne la priorité au réservoir, puis arrose seulement si les deux conditions sont vraies.",
      expertContract: "Sécurité réservoir prioritaire, condition AND et arrosage court.",
      guidedConstants: "\nconst int SEUIL_HUMIDITE = 560;\nconst int SEUIL_RESERVOIR = 350;\n",
      standardConstants: "\nconst int SEUIL_HUMIDITE = 560;\nconst int SEUIL_RESERVOIR = 350;\n",
      expertConstants: "\nconst int SEUIL_HUMIDITE = 560;\nconst int SEUIL_RESERVOIR = 350;\n",
      referenceConstants: "const int SEUIL_HUMIDITE = 560;\nconst int SEUIL_RESERVOIR = 350;",
      guidedLoop: `  // Lire humidite sur A0 et niveauEau sur A2.

  // Si le réservoir est trop bas, arrêter et afficher une alerte.

  // Sinon, si le sol est sec ET le niveau suffisant, arroser 3 s.

  // Dans tous les autres cas, garder la pompe arrêtée.

  // Attendre une seconde.
`,
      standardLoop: `  // Lire A0 et A2, tester d'abord le réservoir, puis appliquer la condition AND.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  if (niveauEau < SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    Serial.println("Réservoir vide");
  } else if (humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(3000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`
    }),
    5: mission({
      id: 5,
      title: "Mission 5 — Économiser l'eau",
      subtitle: "Utiliser deux seuils pour réduire les redémarrages de la pompe.",
      context: "Un seuil unique provoque des oscillations. Ta mission consiste à programmer une hystérésis simple et à limiter l'arrosage.",
      fileName: "mission-5-economiser-eau.ino",
      sensorKeys: ["humidity", "water"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdStop", "thresholdWater", "readHumidity", "readWater", "compareWaterLow", "compareHumidity", "compareStop", "pumpStart", "delayPump", "pumpStop", "delay"],
      loopStates: [readHumidity, readWater, state("compareHumidity", "compareHumidity", "loop() - seuil de démarrage", "a0", "Le seuil bas décide le démarrage."), state("compareStop", "compareStop", "loop() - seuil d'arrêt", "a0", "Le seuil haut stabilise l'arrêt."), pumpStart, state("delayPump", "delayPump", "loop() - arrosage court", "water", "Arrosage limité à deux secondes."), pumpStop, delay1],
      objectives: [
        { label: "définir un seuil bas et un seuil haut", steps: ["thresholdHumidity", "thresholdStop"] },
        { label: "conserver la sécurité du réservoir", steps: ["thresholdWater", "readWater", "compareWaterLow"] },
        { label: "démarrer sous le seuil bas", steps: ["compareHumidity", "pumpStart"] },
        { label: "arrêter au-dessus du seuil haut", steps: ["compareStop", "pumpStop"] },
        { label: "limiter l'arrosage à deux secondes", steps: ["delayPump"] }
      ],
      badges: [
        { id: "sensors", label: "Mesures utiles", steps: ["readHumidity", "readWater"] },
        { id: "decision", label: "Hystérésis", steps: ["thresholdHumidity", "thresholdStop", "compareStop"] },
        { id: "safety", label: "Eau économisée", steps: ["delayPump", "pumpStop"] }
      ],
      guidedIntro: "Complète les deux seuils et la demande MÉMORISÉE de l'hystérésis.",
      standardIntro: "Programme deux seuils, la sécurité réservoir et un arrosage court.",
      expertContract: "Utiliser deux seuils, conserver A2 et limiter chaque arrosage à deux secondes.",
      guidedConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_ARRET = ____;\nconst int SEUIL_RESERVOIR = 350;\n\n// MÉMORISER entre deux passages dans loop() : la demande d'arrosage.\nbool demandeArrosage = false;\n",
      standardConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_ARRET = ____;\nconst int SEUIL_RESERVOIR = 350;\n\nbool demandeArrosage = false;\n",
      expertConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_ARRET = 650;\nconst int SEUIL_RESERVOIR = 350;\n\nbool demandeArrosage = false;\n",
      referenceConstants: "const int SEUIL_HUMIDITE = 520;\nconst int SEUIL_ARRET = 650;\nconst int SEUIL_RESERVOIR = 350;\n\n// État MÉMORISÉ entre deux passages dans loop() : c'est l'hystérésis.\nbool demandeArrosage = false;",
      guidedLoop: `  // Lire humidite et niveauEau.

  // Si le réservoir est trop bas : demandeArrosage = false; (priorité sécurité).

  // Sinon, si humidite est sous le seuil bas : demandeArrosage = true;

  // Sinon, si humidite dépasse le seuil haut : demandeArrosage = false;

  // Entre les deux seuils : ne rien écrire, la demande est MÉMORISÉE.

  // Si demandeArrosage est vraie : impulsion de 2 s (HIGH, delay, LOW).

  // Sinon : garder la pompe arrêtée.
`,
      standardLoop: `  // Lire A0 et A2, mettre à jour demandeArrosage (hystérésis mémorisée,
  // réservoir prioritaire), puis commander une impulsion limitée à 2 s.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  if (niveauEau < SEUIL_RESERVOIR) {
    demandeArrosage = false;
  } else if (humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR) {
    demandeArrosage = true;
  } else if (humidite > SEUIL_ARRET) {
    demandeArrosage = false;
  }
  // Entre les deux seuils : demandeArrosage conserve sa valeur.

  if (demandeArrosage) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`
    }),
    6: mission({
      id: 6,
      title: "Mission 6 — Décider avec trois données",
      subtitle: "Combiner humidité, niveau d'eau et luminosité.",
      context: "La luminosité complète la décision sans remplacer l'humidité. Ta mission consiste à lire A0, A1 et A2 puis appliquer une condition multicritère.",
      fileName: "mission-6-decision-trois-donnees.ino",
      sensorKeys: ["humidity", "light", "water"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "thresholdLight", "readHumidity", "readLight", "readWater", "compareHumidity", "compareWaterEnough", "compareLight", "showHumidity", "showLight", "showWater", "pumpStart", "delayPump", "pumpStop", "delay"],
      loopStates: [readHumidity, readLight, readWater, state("compareHumidity", "compareHumidity", "loop() - humidité sous seuil", "a0", "Critère humidité vérifié."), state("compareLight", "compareLight", "loop() - luminosité acceptable", "a1", "Critère luminosité vérifié."), pumpStart, state("delayPump", "delayPump", "loop() - arrosage court", "water", "Arrosage limité à deux secondes."), pumpStop, delay1],
      objectives: [
        { label: "lire les trois capteurs", steps: ["readHumidity", "readLight", "readWater"] },
        { label: "définir trois seuils", steps: ["thresholdHumidity", "thresholdWater", "thresholdLight"] },
        { label: "relier les critères avec AND", steps: ["compareHumidity", "compareWaterEnough", "compareLight"] },
        { label: "afficher les trois mesures", steps: ["showHumidity", "showLight", "showWater"] },
        { label: "arroser brièvement ou rester arrêté", steps: ["pumpStart", "delayPump", "pumpStop"] }
      ],
      badges: [
        { id: "sensors", label: "Trois données", steps: ["readHumidity", "readLight", "readWater"] },
        { id: "decision", label: "Décision multicritère", steps: ["compareHumidity", "compareWaterEnough", "compareLight"] },
        { id: "safety", label: "Commande limitée", steps: ["delayPump", "pumpStop"] }
      ],
      guidedIntro: "Complète la décision qui utilise les trois grandeurs.",
      standardIntro: "Lis A0, A1, A2 puis construis une condition multicritère.",
      expertContract: "Arroser deux secondes seulement si humidité, réservoir et lumière valident la décision.",
      guidedConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;\n",
      standardConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;\n",
      expertConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;\n",
      referenceConstants: "const int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;",
      guidedLoop: `  // Lire humidite, lumiere et niveauEau.

  // Afficher les trois mesures.

  // Si le sol est sec, le réservoir suffisant et la lumière acceptable, arroser 2 s.

  // Sinon, garder la pompe arrêtée.
`,
      standardLoop: `  // Lire A0, A1 et A2, afficher, puis appliquer une condition avec trois critères.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.println(humidite);
  Serial.println(lumiere);
  Serial.println(niveauEau);

  if (humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR && lumiere < SEUIL_LUMIERE) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`
    }),
    7: mission({
      id: 7,
      title: "Mission 7 — Améliorer la durabilité",
      subtitle: "Recalibrer un capteur plus durable sans supprimer les sécurités.",
      context: "Un capteur peut dériver ou se corroder. Ta mission consiste à programmer le nouveau seuil et à conserver la protection du réservoir.",
      fileName: "mission-7-durabilite-capteur.ino",
      sensorKeys: ["humidity", "water"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "readHumidity", "readWater", "compareWaterLow", "compareHumidity", "compareWaterEnough", "showHumidity", "showWater", "pumpStart", "delayPump", "pumpStop", "delay"],
      loopStates: [readHumidity, readWater, state("compareHumidity", "compareHumidity", "loop() - nouveau seuil calibré", "a0", "Le nouveau seuil du capteur est utilisé."), state("compareWaterLow", "compareWaterLow", "loop() - sécurité réservoir", "a2", "Le réservoir reste prioritaire."), pumpStart, state("delayPump", "delayPump", "loop() - arrosage limité", "water", "Arrosage limité à deux secondes."), pumpStop, delay1],
      objectives: [
        { label: "intégrer le nouveau seuil calibré", steps: ["thresholdHumidity", "compareHumidity"] },
        { label: "lire le capteur remplacé et le réservoir", steps: ["readHumidity", "readWater"] },
        { label: "conserver la sécurité A2", steps: ["thresholdWater", "compareWaterLow", "compareWaterEnough"] },
        { label: "limiter la commande de pompe", steps: ["delayPump", "pumpStop"] },
        { label: "afficher les mesures utiles", steps: ["showHumidity", "showWater"] }
      ],
      badges: [
        { id: "sensors", label: "Capteur recalibré", steps: ["thresholdHumidity", "readHumidity"] },
        { id: "decision", label: "Maintenance validée", steps: ["compareHumidity", "compareWaterEnough"] },
        { id: "safety", label: "Sécurités conservées", steps: ["compareWaterLow", "pumpStop"] }
      ],
      guidedIntro: "Complète le nouveau seuil et vérifie que les sécurités restent présentes.",
      standardIntro: "Recalibre A0, conserve A2 et limite l'arrosage.",
      expertContract: "Intégrer un nouveau seuil de calibration sans retirer les protections.",
      guidedConstants: "\nconst int SEUIL_HUMIDITE = ____;\nconst int SEUIL_RESERVOIR = 350;\n",
      standardConstants: "\nconst int SEUIL_HUMIDITE = ____;\nconst int SEUIL_RESERVOIR = 350;\n",
      expertConstants: "\nconst int SEUIL_HUMIDITE = 590;\nconst int SEUIL_RESERVOIR = 350;\n",
      referenceConstants: "const int SEUIL_HUMIDITE = 590;\nconst int SEUIL_RESERVOIR = 350;",
      guidedLoop: `  // Lire humidite et niveauEau.

  // Afficher les deux valeurs pour vérifier la recalibration.

  // Si le réservoir est trop bas, arrêter.

  // Sinon, arroser 2 s seulement si le sol est sec.
`,
      standardLoop: `  // Lire A0 et A2, utiliser le nouveau seuil et conserver la sécurité réservoir.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.println(humidite);
  Serial.println(niveauEau);

  if (niveauEau < SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else if (humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`
    }),
    8: mission({
      id: 8,
      title: "Mission 8 — Défi ingénieur",
      subtitle: "Programmer le prototype final et vérifier les cas normaux, limites et défaillants.",
      context: "Le prototype final doit lire trois capteurs, sécuriser le réservoir, arroser brièvement et communiquer ses mesures.",
      fileName: "mission-8-prototype-final.ino",
      sensorKeys: ["humidity", "light", "water"],
      steps: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "thresholdLight", "readHumidity", "readLight", "readWater", "compareWaterLow", "alertWater", "compareHumidity", "compareLight", "showHumidity", "showLight", "showWater", "pumpStart", "delayPump", "pumpStop", "delay"],
      loopStates: [readHumidity, readLight, readWater, state("compareWaterLow", "compareWaterLow", "loop() - sécurité prioritaire", "a2", "Le réservoir est testé avant l'arrosage."), alertWater, state("compareHumidity", "compareHumidity", "loop() - décision finale", "a0", "Humidité et lumière sont comparées."), state("compareLight", "compareLight", "loop() - critère lumière", "a1", "La luminosité complète la décision."), pumpStart, state("delayPump", "delayPump", "loop() - arrosage final limité", "water", "Arrosage limité à deux secondes."), pumpStop, delay1],
      objectives: [
        { label: "lire les trois capteurs", steps: ["readHumidity", "readLight", "readWater"] },
        { label: "traiter d'abord le réservoir vide", steps: ["compareWaterLow", "alertWater", "pumpStop"] },
        { label: "appliquer la décision multicritère", steps: ["compareHumidity", "compareLight"] },
        { label: "afficher les résultats", steps: ["showHumidity", "showLight", "showWater"] },
        { label: "limiter et sécuriser l'arrosage", steps: ["pumpStart", "delayPump", "pumpStop"] }
      ],
      badges: [
        { id: "sensors", label: "Prototype instrumenté", steps: ["readHumidity", "readLight", "readWater"] },
        { id: "decision", label: "Décision finale", steps: ["compareWaterLow", "compareHumidity", "compareLight"] },
        { id: "safety", label: "Sécurité prioritaire", steps: ["alertWater", "pumpStop"] }
      ],
      guidedIntro: "Complète le programme final en respectant la sécurité prioritaire.",
      standardIntro: "Construis le programme final à partir du cahier des charges.",
      expertContract: "Sécurité prioritaire, trois capteurs, arrosage court, alerte et affichage.",
      guidedConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;\n",
      standardConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;\n",
      expertConstants: "\nconst int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;\n",
      referenceConstants: "const int SEUIL_HUMIDITE = 520;\nconst int SEUIL_RESERVOIR = 350;\nconst int SEUIL_LUMIERE = 700;",
      guidedLoop: `  // Lire les trois capteurs.

  // Afficher les mesures.

  // Traiter d'abord le réservoir vide : arrêter et alerter.

  // Sinon, arroser 2 s si le sol est sec et la lumière acceptable.

  // Sinon, garder la pompe arrêtée.
`,
      standardLoop: `  // Programme final : sécurité prioritaire, trois capteurs, décision, affichage et arrosage court.
`,
      referenceLoop: `  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.println(humidite);
  Serial.println(lumiere);
  Serial.println(niveauEau);

  if (niveauEau < SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    Serial.println("Réservoir vide");
  } else if (humidite < SEUIL_HUMIDITE && lumiere < SEUIL_LUMIERE) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`
    })
  };

  function getMission(id) {
    return missions[id] || missions[1];
  }

  const api = { missions, getMission };
  if (typeof window !== "undefined") window.TechnoQuestMissionData = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
