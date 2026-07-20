/* TechnoQuest — éditeur classique : sketchs C++ Arduino complets, vérification,
   exécution pédagogique et protection des anciens brouillons.
   Depuis la migration « cpp-arduino-v5 », les séances 2 à 8 utilisent le même
   C++ Arduino que le mode Mission (mission-mode/mission-data.js) : mêmes
   broches, mêmes constantes, mêmes seuils ADC, mêmes programmes de référence.
   Convention relais du projet : LOW = repos (pompe arrêtée), HIGH = activé —
   à confirmer avec le module relais réellement utilisé. */
"use strict";
(() => {
  const id = Number(document.body.dataset.session || 0);
  if (id < 1 || id > 8) return;
  const editor = document.getElementById("codeEditor");
  const stage = document.getElementById("twinStage");
  if (!editor || !stage) return;

  const VERSION = "2026-07-cpp-arduino-v5";

  /* ---- Briques communes, identiques au mode Mission ---- */
  const PINS = `const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;`;

  const SETUP = `void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}`;

  const sketch = (title, constants, loopBody, intro) => `// ${title}
${intro ? `// ${intro}\n` : ""}
#include <Arduino.h>

${PINS}
${constants ? `\n${constants}\n` : ""}
${SETUP}

void loop() {
${loopBody}
}`;

  /* ---- Modèles par séance : sketch TOUJOURS complet (constantes, setup(),
     loop(), accolades) ; seules les zones ____ sont à remplacer. ---- */
  const models = {
    1: {
      guided: sketch("Séance 1 — Observer les signaux", "",
`  // 1 ACQUÉRIR : lire le capteur d'humidité branché sur A0.
  // Indice : analogRead(PIN_HUMIDITE_SOL) lit l'entrée analogique A0.
  // 2 MÉMORISER : ranger la valeur dans la variable humidite.
  int humidite = _______________;

  // 3 COMMUNIQUER : afficher la valeur mesurée.
  // Indice : Serial.println(...) affiche puis revient à la ligne.
  ____________________________;

  // 4 SÉCURISER : maintenir la pompe arrêtée pendant l'observation.
  digitalWrite(PIN_RELAIS_POMPE, LOW);

  // 5 ATTENDRE une seconde avant la mesure suivante.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 1 — Observer les signaux", "",
`  // Lire A0 puis mémoriser la mesure dans humidite.
  int humidite = __________________;

  // Afficher la valeur mémorisée.
  ________________________________;

  // Maintenir la pompe arrêtée puis attendre une seconde.
  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);`),
      expert: sketch("Séance 1 — Observer les signaux", "",
`  // Mission : lire A0, afficher la mesure, garder D6 à LOW, attendre 1 s.`),
      reference: sketch("Séance 1 — Observer les signaux", "",
`  int humidite = analogRead(PIN_HUMIDITE_SOL);

  Serial.println(humidite);

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);`)
    },
    2: {
      guided: sketch("Séance 2 — Calibrer un seuil",
`// Seuil issu de TA calibration : valeur ADC entre 0 et 1023.
const int SEUIL_HUMIDITE = ____;`,
`  // ACQUÉRIR / MÉMORISER : lire A0 et ranger la valeur.
  int humidite = ____________________;

  // COMMUNIQUER : afficher la mesure.
  Serial.print("Humidité : ");
  ______________________________;

  // COMPARER : sol sec ou sol humide ?
  if (___________________________) {
    Serial.println("Sol sec");
  } else {
    Serial.println("Sol humide");
  }

  // SÉCURISER : pompe arrêtée pendant la calibration.
  digitalWrite(PIN_RELAIS_POMPE, LOW);

  // ATTENDRE une seconde.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 2 — Calibrer un seuil",
`const int SEUIL_HUMIDITE = ____;`,
`  // Lire A0, afficher la mesure, comparer au seuil,
  // afficher "Sol sec" ou "Sol humide", sécuriser puis attendre.
  int humidite = ____________________;

  ______________________________;

  if (___________________________) {
    ______________________________;
  } else {
    ______________________________;
  }

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);`),
      expert: sketch("Séance 2 — Calibrer un seuil",
`const int SEUIL_HUMIDITE = 560;`,
`  // Mission : classer le sol avec le seuil issu de la calibration,
  // afficher la mesure et l'état, garder la pompe arrêtée, attendre 1 s.`),
      reference: sketch("Séance 2 — Calibrer un seuil",
`const int SEUIL_HUMIDITE = 560;`,
`  int humidite = analogRead(PIN_HUMIDITE_SOL);

  Serial.print("Humidité : ");
  Serial.println(humidite);

  if (humidite < SEUIL_HUMIDITE) {
    Serial.println("Sol sec");
  } else {
    Serial.println("Sol humide");
  }

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);`)
    },
    3: {
      guided: sketch("Séance 3 — Analyser les chaînes",
`const int SEUIL_HUMIDITE = 560;`,
`  // ACQUÉRIR / MÉMORISER : lire l'information du capteur A0.
  int humidite = ____________________;

  // COMMUNIQUER : afficher la mesure.
  Serial.print("Humidité : ");
  Serial.println(humidite);

  // TRAITER puis DISTRIBUER : si le sol est sec, le relais D6
  // laisse passer l'énergie vers la pompe pendant 3 secondes.
  if (___________________________) {
    digitalWrite(PIN_RELAIS_POMPE, ____);
    delay(3000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    // SÉCURISER : sinon, garantir l'arrêt.
    ______________________________;
  }

  // ATTENDRE une seconde.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 3 — Analyser les chaînes",
`const int SEUIL_HUMIDITE = 560;`,
`  // Lire A0, afficher, puis arroser 3 s seulement si le sol est sec.
  int humidite = ____________________;

  Serial.print("Humidité : ");
  Serial.println(humidite);

  if (___________________________) {
    ______________________________;
    ______________________________;
    ______________________________;
  } else {
    ______________________________;
  }

  delay(1000);`),
      expert: sketch("Séance 3 — Analyser les chaînes",
`const int SEUIL_HUMIDITE = 560;`,
`  // Mission : commander la pompe 3 s si le sol est sec (D6 à HIGH),
  // sinon garantir l'arrêt (D6 à LOW). Afficher la mesure. Attendre 1 s.`),
      reference: sketch("Séance 3 — Analyser les chaînes",
`const int SEUIL_HUMIDITE = 560;`,
`  int humidite = analogRead(PIN_HUMIDITE_SOL);
  Serial.print("Humidité : ");
  Serial.println(humidite);

  if (humidite < SEUIL_HUMIDITE) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(3000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`)
    },
    4: {
      guided: sketch("Séance 4 — Protéger la pompe",
`const int SEUIL_HUMIDITE = 560;
const int SEUIL_RESERVOIR = 350;`,
`  // ACQUÉRIR / MÉMORISER : lire l'humidité A0 et le niveau A2.
  int humidite = ____________________;
  int niveauEau = ____________________;

  // SÉCURISER d'abord : le réservoir est-il trop bas ?
  if (niveauEau < SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    Serial.println("Réservoir vide");
  }
  // COMPARER : sol sec ET niveau suffisant ?
  else if (_____________________ && _____________________) {
    // AGIR : arroser 3 secondes.
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(3000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  // ATTENDRE une seconde.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 4 — Protéger la pompe",
`const int SEUIL_HUMIDITE = 560;
const int SEUIL_RESERVOIR = 350;`,
`  // Lire A0 et A2. Tester D'ABORD le réservoir (arrêt + alerte),
  // puis arroser 3 s seulement si sol sec ET niveau suffisant.
  int humidite = ____________________;
  int niveauEau = ____________________;

  if (____________________________) {
    ______________________________;
    ______________________________;
  } else if (_____________________ && _____________________) {
    ______________________________;
    ______________________________;
    ______________________________;
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`),
      expert: sketch("Séance 4 — Protéger la pompe",
`const int SEUIL_HUMIDITE = 560;
const int SEUIL_RESERVOIR = 350;`,
`  // Mission : priorité au réservoir (arrêt + alerte série),
  // sinon arroser 3 s si sol sec ET niveau suffisant, sinon arrêt. Attendre 1 s.`),
      reference: sketch("Séance 4 — Protéger la pompe",
`const int SEUIL_HUMIDITE = 560;
const int SEUIL_RESERVOIR = 350;`,
`  int humidite = analogRead(PIN_HUMIDITE_SOL);
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

  delay(1000);`)
    },
    5: {
      guided: sketch("Séance 5 — Économiser l'eau",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = ____;
const int SEUIL_RESERVOIR = 350;

// MÉMORISER entre deux passages dans loop() : la demande d'arrosage.
bool demandeArrosage = false;`,
`  // ACQUÉRIR : lire l'humidité A0 et le niveau A2.
  int humidite = ____________________;
  int niveauEau = ____________________;

  // DÉCIDER avec hystérésis : la demande est MÉMORISÉE.
  if (niveauEau < SEUIL_RESERVOIR) {
    // SÉCURISER : réservoir insuffisant, arrêt immédiat.
    demandeArrosage = false;
  } else if (humidite < SEUIL_HUMIDITE) {
    // Sous le seuil bas : demander l'arrosage.
    demandeArrosage = ____;
  } else if (humidite > SEUIL_ARRET) {
    // Au-dessus du seuil haut : annuler la demande.
    demandeArrosage = ____;
  }
  // Entre les deux seuils : demandeArrosage garde sa valeur précédente.

  // AGIR : une impulsion courte si la demande est active.
  if (demandeArrosage) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  // ATTENDRE une seconde.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 5 — Économiser l'eau",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = ____;
const int SEUIL_RESERVOIR = 350;

bool demandeArrosage = false;`,
`  // Lire A0 et A2, mettre à jour demandeArrosage avec l'hystérésis
  // (réservoir prioritaire), puis commander une impulsion de 2 s.
  int humidite = ____________________;
  int niveauEau = ____________________;

  if (____________________________) {
    demandeArrosage = false;
  } else if (_____________________) {
    demandeArrosage = true;
  } else if (_____________________) {
    demandeArrosage = false;
  }

  if (demandeArrosage) {
    ______________________________;
    ______________________________;
    ______________________________;
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`),
      expert: sketch("Séance 5 — Économiser l'eau",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = 650;
const int SEUIL_RESERVOIR = 350;

bool demandeArrosage = false;`,
`  // Mission : hystérésis MÉMORISÉE (démarrage sous 520, arrêt au-dessus de 650,
  // conservation entre les deux), réservoir prioritaire, impulsion de 2 s max.`),
      reference: sketch("Séance 5 — Économiser l'eau",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_ARRET = 650;
const int SEUIL_RESERVOIR = 350;

// État MÉMORISÉ entre deux passages dans loop() : c'est l'hystérésis.
bool demandeArrosage = false;`,
`  int humidite = analogRead(PIN_HUMIDITE_SOL);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.print("Humidité : ");
  Serial.println(humidite);

  if (niveauEau < SEUIL_RESERVOIR) {
    demandeArrosage = false;
  } else if (humidite < SEUIL_HUMIDITE) {
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

  delay(1000);`)
    },
    6: {
      guided: sketch("Séance 6 — Décider avec trois données",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  // ACQUÉRIR / MÉMORISER : lire les trois capteurs.
  int humidite = ____________________;
  int lumiere = ____________________;
  int niveauEau = ____________________;

  // COMMUNIQUER : afficher les trois mesures.
  Serial.println(humidite);
  Serial.println(lumiere);
  Serial.println(niveauEau);

  // DÉCIDER : les trois critères doivent être vrais ensemble.
  if (_____________________ && _____________________ && _____________________) {
    // AGIR : arroser 2 secondes.
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    // SÉCURISER : rester à l'arrêt.
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  // ATTENDRE une seconde.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 6 — Décider avec trois données",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  // Lire A0, A1 et A2, afficher les trois mesures,
  // puis arroser 2 s seulement si les trois critères sont vrais.
  int humidite = ____________________;
  int lumiere = ____________________;
  int niveauEau = ____________________;

  ______________________________;
  ______________________________;
  ______________________________;

  if (_____________________ && _____________________ && _____________________) {
    ______________________________;
    ______________________________;
    ______________________________;
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`),
      expert: sketch("Séance 6 — Décider avec trois données",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  // Mission : arroser 2 s seulement si humidité, réservoir et lumière
  // valident ensemble la décision. Afficher les trois mesures. Attendre 1 s.`),
      reference: sketch("Séance 6 — Décider avec trois données",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  int humidite = analogRead(PIN_HUMIDITE_SOL);
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

  delay(1000);`)
    },
    7: {
      guided: sketch("Séance 7 — Améliorer la durabilité",
`// Nouveau seuil obtenu après recalibration du capteur remplacé.
const int SEUIL_HUMIDITE = ____;
const int SEUIL_RESERVOIR = 350;`,
`  // ACQUÉRIR : lire le nouveau capteur A0 et le niveau A2.
  int humidite = ____________________;
  int niveauEau = ____________________;

  // COMMUNIQUER : afficher pour vérifier la recalibration.
  Serial.println(humidite);
  Serial.println(niveauEau);

  // SÉCURISER d'abord : réservoir insuffisant → arrêt.
  if (niveauEau < SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }
  // COMPARER avec le seuil recalibré, puis AGIR brièvement.
  else if (_____________________ && niveauEau >= SEUIL_RESERVOIR) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  // ATTENDRE une seconde.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 7 — Améliorer la durabilité",
`const int SEUIL_HUMIDITE = ____;
const int SEUIL_RESERVOIR = 350;`,
`  // Lire A0 recalibré et A2, afficher, conserver la sécurité réservoir,
  // arroser 2 s seulement si le sol est sec.
  int humidite = ____________________;
  int niveauEau = ____________________;

  ______________________________;
  ______________________________;

  if (____________________________) {
    ______________________________;
  } else if (_____________________ && _____________________) {
    ______________________________;
    ______________________________;
    ______________________________;
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`),
      expert: sketch("Séance 7 — Améliorer la durabilité",
`const int SEUIL_HUMIDITE = 590;
const int SEUIL_RESERVOIR = 350;`,
`  // Mission : intégrer le seuil recalibré sans supprimer la sécurité A2,
  // limiter l'arrosage à 2 s, afficher les mesures. Attendre 1 s.`),
      reference: sketch("Séance 7 — Améliorer la durabilité",
`const int SEUIL_HUMIDITE = 590;
const int SEUIL_RESERVOIR = 350;`,
`  int humidite = analogRead(PIN_HUMIDITE_SOL);
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

  delay(1000);`)
    },
    8: {
      guided: sketch("Séance 8 — Défi ingénieur",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  // ACQUÉRIR : lire les trois capteurs du prototype final.
  int humidite = ____________________;
  int lumiere = ____________________;
  int niveauEau = ____________________;

  // COMMUNIQUER : afficher les trois mesures.
  Serial.println(humidite);
  Serial.println(lumiere);
  Serial.println(niveauEau);

  // SÉCURISER d'abord : réservoir vide → arrêt + alerte.
  if (____________________________) {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
    Serial.println("Réservoir vide");
  }
  // DÉCIDER : sol sec ET lumière acceptable → AGIR 2 s.
  else if (_____________________ && _____________________) {
    digitalWrite(PIN_RELAIS_POMPE, HIGH);
    delay(2000);
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  // ATTENDRE une seconde.
  delay(1000);`, "Sketch complet : complète uniquement les zones ____ ."),
      standard: sketch("Séance 8 — Défi ingénieur",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  // Programme final : lire les trois capteurs, afficher,
  // réservoir prioritaire (arrêt + alerte), décision, arrosage 2 s.
  int humidite = ____________________;
  int lumiere = ____________________;
  int niveauEau = ____________________;

  ______________________________;
  ______________________________;
  ______________________________;

  if (____________________________) {
    ______________________________;
    ______________________________;
  } else if (_____________________ && _____________________) {
    ______________________________;
    ______________________________;
    ______________________________;
  } else {
    digitalWrite(PIN_RELAIS_POMPE, LOW);
  }

  delay(1000);`),
      expert: sketch("Séance 8 — Défi ingénieur",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  // Mission finale : sécurité prioritaire (alerte série), trois capteurs,
  // décision multicritère, arrosage court, affichages. Attendre 1 s.`),
      reference: sketch("Séance 8 — Défi ingénieur",
`const int SEUIL_HUMIDITE = 520;
const int SEUIL_RESERVOIR = 350;
const int SEUIL_LUMIERE = 700;`,
`  int humidite = analogRead(PIN_HUMIDITE_SOL);
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

  delay(1000);`)
    }
  };
  const model = models[id];

  const storageKey = "technoquest-premium-v1";
  const readState = () => { try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; } };
  const writeSession = patch => {
    const state = readState();
    state.sessions = state.sessions || {};
    state.sessions[id] = { ...(state.sessions[id] || {}), ...patch };
    localStorage.setItem(storageKey, JSON.stringify(state));
    return state.sessions[id];
  };
  let current = readState().sessions?.[id] || {};
  const mode = () => document.getElementById("codeModeV2")?.value || current.learningMode || "guided";

  const setStarter = selectedMode => {
    editor.value = model[selectedMode];
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    current = writeSession({
      code: editor.value,
      learningMode: selectedMode,
      learningV2: true,
      learningV2Version: VERSION,
      attemptedV2: false
    });
  };

  /* ---- Migration protectrice des anciens brouillons (pseudo-Python) ----
     Règles : un squelette non commencé est migré silencieusement ; une
     tentative commencée est ARCHIVÉE dans une sauvegarde de récupération
     versionnée avant de charger le squelette C++ ; un brouillon C++ existant
     n'est jamais remplacé. */
  const looksPython = source => /\blire_(?:humidite|lumiere|reservoir)\s*\(|\barroser\s*\(|\belif\b|^\s*#(?!include)|\bif\b[^\n{]*:\s*$/m.test(String(source || ""));
  const looksCpp = source => /void\s+setup\s*\(\s*\)/.test(String(source || "")) && /void\s+loop\s*\(\s*\)/.test(String(source || ""));

  const oldCode = String(editor.value || current.code || "");
  const pythonDraft = looksPython(oldCode) && !looksCpp(oldCode);
  if (pythonDraft && current.attemptedV2) {
    /* Tentative commencée en pseudo-Python : archiver AVANT tout remplacement. */
    const recovery = {
      code: oldCode,
      savedAt: new Date().toISOString(),
      fromVersion: current.learningV2Version || "pseudo-python",
      toVersion: VERSION,
      resolved: false
    };
    current = writeSession({ recoveryPython: recovery });
    setStarter(mode());
  } else if (!oldCode.trim() || (pythonDraft && !current.attemptedV2) || (current.learningV2Version !== VERSION && !current.attemptedV2) || (/_{3,}/.test(oldCode) && !current.attemptedV2)) {
    /* Vide, squelette non commencé ou version dépassée sans tentative : migration silencieuse. */
    setStarter(mode());
  } else {
    /* Brouillon C++ commencé : conservé tel quel. */
    current = writeSession({ learningV2Version: VERSION });
  }

  const correctionPre = document.querySelector("#correctionPanel pre");
  if (correctionPre) correctionPre.textContent = model.reference;

  /* Les boutons sont CLONÉS pour retirer les écouteurs installés par les
     couches précédentes : ce module devient l'unique gestionnaire. */
  const originalSelect = document.getElementById("codeModeV2");
  if (originalSelect) {
    const select = originalSelect.cloneNode(true);
    originalSelect.replaceWith(select);
    select.value = current.learningMode || "guided";
    select.addEventListener("change", () => {
      current = readState().sessions?.[id] || current;
      if (current.attemptedV2 && !window.confirm("Changer de niveau d’aide remplacera la tentative actuelle par un nouveau squelette C++. Continuer ?")) {
        select.value = current.learningMode || "guided";
        return;
      }
      setStarter(select.value);
    });
    const row = select.closest(".code-mode-row");
    const note = row?.querySelector("span");
    if (note) note.textContent = "Guidé : sketch complet commenté · Standard : consignes courtes · Autonome : cahier des charges. Les ____ sont à remplacer.";
  }

  const originalRestore = document.getElementById("restoreCode");
  if (originalRestore) {
    const restore = originalRestore.cloneNode(true);
    originalRestore.replaceWith(restore);
    restore.textContent = "↺ Restaurer le squelette C++";
    restore.addEventListener("click", () => {
      current = readState().sessions?.[id] || current;
      if (current.attemptedV2 && !window.confirm("Restaurer le squelette C++ incomplet et effacer la tentative actuelle ?")) return;
      setStarter(mode());
    });
  }

  const markAttempt = () => { current = writeSession({ code: editor.value, attemptedV2: true, learningV2Version: VERSION }); };

  /* ---- Panneau de récupération d'un ancien brouillon Python ---- */
  const editorCard = editor.closest(".card-body");
  const savedRecovery = readState().sessions?.[id]?.recoveryPython;
  if (editorCard && savedRecovery && !savedRecovery.resolved && !document.getElementById("pythonRecoveryV5")) {
    const panel = document.createElement("section");
    panel.id = "pythonRecoveryV5";
    panel.className = "python-recovery";
    panel.innerHTML = `
      <p><strong>Ton ancien brouillon a été conservé.</strong> La séance utilise désormais le C++ Arduino :
      un nouveau squelette a été chargé, et ton ancienne version (pseudo-code) reste récupérable ci-dessous.</p>
      <details><summary>Voir l'ancien brouillon conservé</summary><pre></pre></details>
      <div class="demo-controls">
        <button type="button" class="btn" data-recovery-copy>Copier l'ancien brouillon</button>
        <button type="button" class="btn" data-recovery-resolve>J'ai récupéré ce dont j'avais besoin</button>
      </div>`;
    panel.querySelector("pre").textContent = savedRecovery.code;
    const modeRow = editorCard.querySelector(".code-mode-row");
    (modeRow || editorCard.firstChild).insertAdjacentElement ? (modeRow ? modeRow.insertAdjacentElement("beforebegin", panel) : editorCard.prepend(panel)) : editorCard.prepend(panel);
    panel.querySelector("[data-recovery-copy]").addEventListener("click", async event => {
      try { await navigator.clipboard.writeText(savedRecovery.code); event.target.textContent = "Copié ✓"; }
      catch { event.target.textContent = "Sélectionne le texte ci-dessus puis copie-le"; }
    });
    panel.querySelector("[data-recovery-resolve]").addEventListener("click", () => {
      const state = readState();
      if (state.sessions?.[id]?.recoveryPython) {
        state.sessions[id].recoveryPython.resolved = true;
        localStorage.setItem(storageKey, JSON.stringify(state));
      }
      panel.remove();
    });
  }

  /* ---- Aide progressive C++ par séance ---- */
  const helpBySession = {
    1: `<p class="help-intro"><strong>But :</strong> écrire un premier sketch Arduino C++ qui lit A0, affiche la mesure et garde la pompe arrêtée.</p>
      <div class="help-steps">
        <article style="--help:#facc15"><span>0</span><h4>SQUELETTE</h4><p><code>const int PIN_RELAIS_POMPE = 6;</code> nomme la broche D6. <code>setup()</code> se lance une fois ; <code>loop()</code> se répète.</p></article>
        <article style="--help:#60a5fa"><span>1</span><h4>ACQUÉRIR</h4><p><code>analogRead(PIN_HUMIDITE_SOL)</code> lit le capteur d'humidité branché sur l'entrée analogique A0.</p></article>
        <article style="--help:#c084fc"><span>2</span><h4>MÉMORISER</h4><p>La ligne doit créer une variable entière : <code>int humidite = ...;</code>. Le point-virgule termine l'instruction.</p></article>
        <article style="--help:#67e8f9"><span>3</span><h4>COMMUNIQUER</h4><p><code>Serial.println(humidite);</code> envoie la valeur vers le Moniteur Série.</p></article>
        <article style="--help:#fb7185"><span>4</span><h4>SÉCURISER</h4><p><code>digitalWrite(PIN_RELAIS_POMPE, LOW);</code> impose l'état sûr : D6 reste à 0 et la pompe reste arrêtée.</p></article>
      </div>
      <p><strong>À toi d'adapter :</strong> les blancs <code>____</code> ne sont pas du code : efface-les, puis remplace-les par les instructions C++.</p>`,
    2: `<p>Lis A0 avec <code>analogRead(PIN_HUMIDITE_SOL)</code>, range la valeur dans <code>int humidite</code>, affiche-la avec <code>Serial.println(humidite);</code>, puis compare-la au seuil : <code>if (humidite &lt; SEUIL_HUMIDITE) { … } else { … }</code>. Le seuil est une valeur ADC entre 0 et 1023 issue de ta calibration.</p>`,
    3: `<p>La décision <code>if (humidite &lt; SEUIL_HUMIDITE)</code> relie la chaîne d'information à la chaîne d'énergie : <code>digitalWrite(PIN_RELAIS_POMPE, HIGH);</code> active le relais, <code>delay(3000);</code> limite l'arrosage à trois secondes, puis <code>digitalWrite(PIN_RELAIS_POMPE, LOW);</code> garantit l'arrêt.</p>`,
    4: `<p>Teste D'ABORD le réservoir : <code>if (niveauEau &lt; SEUIL_RESERVOIR)</code>. L'opérateur <code>&amp;&amp;</code> (ET logique) exige ensuite que les deux conditions soient vraies : <code>humidite &lt; SEUIL_HUMIDITE &amp;&amp; niveauEau &gt;= SEUIL_RESERVOIR</code>.</p>`,
    5: `<p>L'hystérésis MÉMORISE une demande entre deux passages dans <code>loop()</code> grâce à la variable globale <code>bool demandeArrosage</code> : vraie sous le seuil bas, fausse au-dessus du seuil haut, conservée entre les deux. Le réservoir garde la priorité et l'impulsion reste limitée à 2 s.</p>`,
    6: `<p>Trois lectures (<code>A0</code>, <code>A1</code>, <code>A2</code>), trois affichages, puis une décision qui relie les trois critères avec <code>&amp;&amp;</code> : humidité basse ET réservoir suffisant ET lumière acceptable.</p>`,
    7: `<p>Le capteur remplacé impose un nouveau seuil calibré dans <code>const int SEUIL_HUMIDITE</code>. La sécurité du réservoir (<code>niveauEau &lt; SEUIL_RESERVOIR</code> → arrêt) reste prioritaire.</p>`,
    8: `<p>Ordre imposé : lire, afficher, tester D'ABORD le réservoir (arrêt + <code>Serial.println("Réservoir vide");</code>), sinon décider avec <code>humidite &lt; SEUIL_HUMIDITE &amp;&amp; lumiere &lt; SEUIL_LUMIERE</code>, arroser 2 s, sinon rester à l'arrêt.</p>`
  };

  /* ---- Vérification C++ ---- */
  const stripComments = code => code.split("\n").map(line => line.replace(/\/\/.*$/, "")).join("\n");
  const checkProgram = code => {
    const source = stripComments(code);
    const errors = [];
    const has = pattern => pattern.test(source);
    if (!source.trim()) errors.push("Le programme ne contient encore aucune instruction.");
    if (has(/_{3,}/)) errors.push("Les blancs ____ ne sont pas du code : efface-les et remplace-les par tes instructions C++.");
    /* Résidus de l'ancien pseudo-Python : message explicite. */
    if (/\blire_(?:humidite|lumiere|reservoir)\s*\(|\barroser\s*\(|\belif\b|\bif\b[^\n{]*:\s*$/m.test(source)) {
      errors.push("Syntaxe Python détectée (lire_…, arroser, elif, « if … : »). Cette séance s'écrit en C++ Arduino : utilise analogRead, digitalWrite, if (…) { }.");
    }
    /* Structure C++ commune. */
    if (!has(/\bvoid\s+setup\s*\(\s*\)\s*\{/)) errors.push("Ajoute le bloc void setup() { ... }.");
    if (!has(/\bvoid\s+loop\s*\(\s*\)\s*\{/)) errors.push("Ajoute le bloc void loop() { ... }.");
    if (!has(/\bSerial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/)) errors.push("Dans setup(), initialise le Moniteur Série avec Serial.begin(9600);");
    if (!has(/\bpinMode\s*\(\s*PIN_RELAIS_POMPE\s*,\s*OUTPUT\s*\)\s*;/)) errors.push("Dans setup(), déclare D6 en sortie avec pinMode(PIN_RELAIS_POMPE, OUTPUT);");
    if (!has(/\bdigitalWrite\s*\(\s*PIN_RELAIS_POMPE\s*,\s*LOW\s*\)\s*;/)) errors.push("L'état sûr digitalWrite(PIN_RELAIS_POMPE, LOW); manque.");
    if (!has(/\bdelay\s*\(\s*1000\s*\)\s*;/)) errors.push("Ajoute delay(1000); pour attendre une seconde entre deux passages dans loop().");
    const braces = (source.match(/\{/g) || []).length - (source.match(/\}/g) || []).length;
    if (braces !== 0) errors.push(`Les accolades ne sont pas équilibrées (${braces > 0 ? "il manque des }" : "il y a trop de }"}).`);
    /* Lectures typées. */
    const readVar = pin => source.match(new RegExp(`\\bint\\s+([A-Za-z_]\\w*)\\s*=\\s*analogRead\\s*\\(\\s*${pin}\\s*\\)\\s*;`));
    const humidity = readVar("(?:PIN_HUMIDITE_SOL|A0)");
    const light = readVar("(?:PIN_LUMIERE|A1)");
    const reservoir = readVar("(?:PIN_NIVEAU_EAU|A2)");
    const needHumidity = () => { if (!humidity) errors.push("Lis A0 dans une variable typée : int humidite = analogRead(PIN_HUMIDITE_SOL);"); };
    const needLight = () => { if (!light) errors.push("Lis A1 dans une variable typée : int lumiere = analogRead(PIN_LUMIERE);"); };
    const needReservoir = () => { if (!reservoir) errors.push("Lis A2 dans une variable typée : int niveauEau = analogRead(PIN_NIVEAU_EAU);"); };
    const needThreshold = name => { if (!has(new RegExp(`\\bconst\\s+int\\s+${name}\\s*=\\s*\\d+\\s*;`))) errors.push(`Définis la constante const int ${name} = …; (valeur ADC).`); };
    const needPulse = seconds => {
      if (!has(/\bdigitalWrite\s*\(\s*PIN_RELAIS_POMPE\s*,\s*HIGH\s*\)\s*;/)) errors.push("L'activation du relais digitalWrite(PIN_RELAIS_POMPE, HIGH); manque.");
      if (!has(new RegExp(`\\bdelay\\s*\\(\\s*${seconds * 1000}\\s*\\)\\s*;`))) errors.push(`Limite l'arrosage avec delay(${seconds * 1000}); (${seconds} secondes).`);
    };
    const needIf = () => { if (!has(/\bif\s*\(/)) errors.push("Il manque la décision if (…) { … }."); };
    const needAnd = count => { if ((source.match(/&&/g) || []).length < count) errors.push(`Relie les conditions avec l'opérateur && (ET logique)${count > 1 ? ` — ${count} attendus` : ""}.`); };
    const needAlert = () => { if (!has(/\bSerial\s*\.\s*println\s*\(\s*"R[ée]servoir vide"\s*\)\s*;/)) errors.push('Ajoute l\'alerte Serial.println("Réservoir vide");'); };
    const needShow = count => { if ((source.match(/\bSerial\s*\.\s*print(?:ln)?\s*\(/g) || []).length < count) errors.push(`Affiche les mesures avec Serial.print / Serial.println (au moins ${count} affichages).`); };

    if (id === 1) { needHumidity(); if (humidity && !new RegExp(`\\bSerial\\s*\\.\\s*println\\s*\\(\\s*${humidity[1]}\\s*\\)\\s*;`).test(source)) errors.push(`Affiche la variable ${humidity[1]} avec Serial.println(${humidity[1]});`); }
    if (id === 2) { needHumidity(); needThreshold("SEUIL_HUMIDITE"); needIf(); if (!has(/\belse\b/)) errors.push("La comparaison if / else est incomplète."); needShow(2); }
    if (id === 3) { needHumidity(); needThreshold("SEUIL_HUMIDITE"); needIf(); needPulse(3); needShow(1); }
    if (id === 4) { needHumidity(); needReservoir(); needThreshold("SEUIL_HUMIDITE"); needThreshold("SEUIL_RESERVOIR"); needIf(); needAnd(1); needPulse(3); needAlert(); }
    if (id === 5) {
      needHumidity(); needReservoir(); needThreshold("SEUIL_HUMIDITE"); needThreshold("SEUIL_ARRET"); needThreshold("SEUIL_RESERVOIR");
      if (!has(/\bbool\s+demandeArrosage\s*=\s*(?:false|true)\s*;/)) errors.push("Déclare l'état mémorisé de l'hystérésis : bool demandeArrosage = false; (en dehors de loop()).");
      if (!has(/demandeArrosage\s*=\s*true\s*;/)) errors.push("Sous le seuil bas, active la demande : demandeArrosage = true;");
      if (!has(/demandeArrosage\s*=\s*false\s*;/)) errors.push("Au-dessus du seuil haut (et si réservoir insuffisant), annule la demande : demandeArrosage = false;");
      if (!has(/\bif\s*\(\s*demandeArrosage\s*\)/)) errors.push("Commande la pompe d'après l'état mémorisé : if (demandeArrosage) { … }.");
      needPulse(2);
    }
    if (id === 6) { needHumidity(); needLight(); needReservoir(); needThreshold("SEUIL_HUMIDITE"); needThreshold("SEUIL_RESERVOIR"); needThreshold("SEUIL_LUMIERE"); needIf(); needAnd(2); needPulse(2); needShow(3); }
    if (id === 7) { needHumidity(); needReservoir(); needThreshold("SEUIL_HUMIDITE"); needThreshold("SEUIL_RESERVOIR"); needIf(); needAnd(1); needPulse(2); needShow(2); }
    if (id === 8) { needHumidity(); needLight(); needReservoir(); needThreshold("SEUIL_HUMIDITE"); needThreshold("SEUIL_RESERVOIR"); needThreshold("SEUIL_LUMIERE"); needIf(); needAnd(1); needPulse(2); needAlert(); needShow(4); }
    return { errors, source };
  };

  /* ---- Exécution pédagogique sur les valeurs ADC du jumeau ---- */
  const SENSORS = { humidity: 642, light: 518, water: 781 };
  const readConst = (source, name, fallback) => Number(source.match(new RegExp(`\\bconst\\s+int\\s+${name}\\s*=\\s*(\\d+)`))?.[1]) || fallback;
  const simulate = source => {
    const low = readConst(source, "SEUIL_HUMIDITE", 560);
    const high = readConst(source, "SEUIL_ARRET", 650);
    const minTank = readConst(source, "SEUIL_RESERVOIR", 350);
    const maxLight = readConst(source, "SEUIL_LUMIERE", 700);
    const h = SENSORS.humidity, l = SENSORS.light, w = SENSORS.water;
    const pulse = /delay\s*\(\s*3000\s*\)/.test(source) ? 3 : 2;
    let action = "Pompe arrêtée — D6 = LOW";
    let alt = "";
    const dry = Math.max(0, low - 80);
    if (id >= 3) {
      const wateringNow =
        id === 3 ? h < low :
        id === 4 ? (w >= minTank && h < low) :
        id === 5 ? (w >= minTank && h < low) :
        id === 6 ? (h < low && w >= minTank && l < maxLight) :
        id === 7 ? (w >= minTank && h < low) :
        (w >= minTank && h < low && l < maxLight);
      if (wateringNow) action = `Arrosage autorisé — D6 = HIGH pendant ${pulse} s puis retour à LOW`;
      if (id === 4 || id === 8) { if (w < minTank) action = "Réservoir vide — arrêt et alerte série"; }
      if (id === 5 && h >= low && h <= high) action = "Entre les deux seuils — demandeArrosage conserve son état (hystérésis)";
      if (!wateringNow) alt = `Avec un sol plus sec (par exemple A0 = ${dry} < ${low}), la pompe serait activée ${pulse} s.`;
    }
    if (id === 2) alt = h < low ? "Sol sec affiché (mesure sous le seuil)." : `Sol humide affiché (A0 = ${h} ≥ ${low}). Avec A0 = ${dry}, « Sol sec » serait affiché.`;
    return { h, l, w, action, alt };
  };

  const actionRow = editorCard?.querySelector(".demo-controls");
  ["runCode", "showProgramHelp", "codeRunStatus", "programHelpPanel"].forEach(controlId => {
    document.getElementById(controlId)?.remove();
  });
  if (actionRow && !document.getElementById("runCodeV3")) {
    const run = document.createElement("button");
    run.id = "runCodeV3"; run.type = "button"; run.className = "btn primary"; run.textContent = "▶ Vérifier et exécuter";
    const help = document.createElement("button");
    help.id = "openHelpV3"; help.type = "button"; help.className = "btn help-button"; help.textContent = "Aide"; help.setAttribute("aria-expanded", "false");
    actionRow.prepend(help); actionRow.prepend(run);

    const consoleBox = document.createElement("pre");
    consoleBox.id = "codeRunConsoleV3"; consoleBox.className = "code-run-console"; consoleBox.setAttribute("aria-live", "polite");
    consoleBox.textContent = "Prêt. La vérification contrôle la structure C++ ; la compilation réelle se fait dans l'IDE Arduino.";
    actionRow.insertAdjacentElement("afterend", consoleBox);

    const panel = document.createElement("section");
    panel.id = "codeHelpV3"; panel.className = "code-help hidden";
    panel.innerHTML = `<div class="code-help-head"><div><p class="eyebrow">Aide progressive</p><h3>Aide d'écriture C++ Arduino pas à pas</h3></div><button type="button" class="btn" data-close-help>Fermer</button></div>${helpBySession[id]}`;
    consoleBox.insertAdjacentElement("afterend", panel);
    const toggleHelp = show => { panel.classList.toggle("hidden", !show); help.setAttribute("aria-expanded", String(show)); if (show) panel.scrollIntoView({ behavior: "smooth", block: "nearest" }); };
    help.addEventListener("click", () => toggleHelp(panel.classList.contains("hidden")));
    panel.querySelector("[data-close-help]").addEventListener("click", () => toggleHelp(false));

    run.addEventListener("click", () => {
      markAttempt();
      const result = checkProgram(editor.value);
      if (result.errors.length) {
        stage.classList.remove("running", "code-valid");
        consoleBox.className = "code-run-console error";
        consoleBox.textContent = "Programme non exécuté :\n• " + result.errors.join("\n• ");
        return;
      }
      const values = simulate(result.source);
      stage.classList.toggle("running", values.action.includes("HIGH"));
      stage.classList.add("code-valid"); setTimeout(() => stage.classList.remove("code-valid"), 1600);
      consoleBox.className = "code-run-console success";
      consoleBox.textContent = `Vérification C++ réussie — exécution pédagogique :\nA0 humidité = ${values.h}\nA1 lumière = ${values.l}\nA2 niveau d'eau = ${values.w}\n${values.action}${values.alt ? `\n${values.alt}` : ""}\nCompile ensuite ce sketch dans l'IDE Arduino pour la carte réelle.`;
      const status = document.getElementById("demoStatus");
      if (status) status.textContent = `Programme vérifié : ${values.action}.`;
    });
  }

  /* ---- Téléchargement du sketch .ino (éditeur classique) ---- */
  if (actionRow && !document.getElementById("downloadInoV5")) {
    const download = document.createElement("button");
    download.id = "downloadInoV5"; download.type = "button"; download.className = "btn";
    download.textContent = "Télécharger le sketch .ino";
    actionRow.appendChild(download);
    download.addEventListener("click", () => {
      const names = { 1: "Seance_1_Observer_Signaux", 2: "Seance_2_Calibrer_Seuil", 3: "Seance_3_Chaines", 4: "Seance_4_Proteger_Pompe", 5: "Seance_5_Economiser_Eau", 6: "Seance_6_Trois_Donnees", 7: "Seance_7_Durabilite", 8: "Seance_8_Defi_Ingenieur" };
      const blob = new Blob([editor.value], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `${names[id] || `Seance_${id}`}.ino`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    });
  }
})();
