/* TechnoQuest Mission Mode - squelettes C++ Arduino et validation tolérante. */
"use strict";

(() => {
  const pin = {
    humidity: "(?:PIN_HUMIDITE_SOL|A0)",
    light: "(?:PIN_LUMIERE|A1)",
    water: "(?:PIN_NIVEAU_EAU|A2)",
    pump: "(?:PIN_RELAIS_POMPE|6)"
  };

  const STEPS = [
    {
      id: "include",
      label: "#include <Arduino.h>",
      state: "initialisation",
      hint1: "Le programme Arduino a besoin de sa bibliothèque de base.",
      hint2: "Ajoute une directive #include tout en haut du fichier.",
      hint3: "Exemple avec une autre bibliothèque : #include <Servo.h>",
      test: source => /#\s*include\s*<\s*Arduino\.h\s*>/.test(source)
    },
    {
      id: "serialBegin",
      label: "Serial.begin(9600);",
      state: "communication série",
      hint1: "Il faut préparer le Moniteur Série avant d'afficher les mesures.",
      hint2: "La fonction utile est Serial.begin(...).",
      hint3: "Exemple : Serial.begin(115200); ouvre une communication à 115200 bauds.",
      test: source => /\bSerial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/.test(source)
    },
    {
      id: "pinMode",
      label: "pinMode(PIN_RELAIS_POMPE, OUTPUT);",
      state: "configuration D6",
      hint1: "La broche du relais doit être configurée comme une sortie.",
      hint2: "La fonction utile est pinMode(..., OUTPUT).",
      hint3: "Exemple : pinMode(3, OUTPUT); configure la broche 3 en sortie.",
      test: source => new RegExp(`\\bpinMode\\s*\\(\\s*${pin.pump}\\s*,\\s*OUTPUT\\s*\\)\\s*;`).test(source)
    },
    {
      id: "safeLowSetup",
      label: "digitalWrite(PIN_RELAIS_POMPE, LOW);",
      state: "sécurisation pompe",
      hint1: "La pompe doit rester arrêtée pendant cette première mission.",
      hint2: "La fonction utile est digitalWrite(..., LOW).",
      hint3: "Exemple : digitalWrite(3, LOW); force la broche 3 à 0.",
      test: source => new RegExp(`\\bdigitalWrite\\s*\\(\\s*${pin.pump}\\s*,\\s*LOW\\s*\\)\\s*;`).test(source)
    },
    {
      id: "readHumidity",
      label: "analogRead(PIN_HUMIDITE_SOL);",
      state: "lecture A0",
      hint1: "Le capteur d'humidité est branché sur A0.",
      hint2: "La fonction utile est analogRead(...).",
      hint3: "Exemple : int valeurA3 = analogRead(A3); lit une autre entrée analogique.",
      test: (_source, context) => Boolean(context.vars.humidity)
    },
    {
      id: "readLight",
      label: "analogRead(PIN_LUMIERE);",
      state: "lecture A1",
      hint1: "Le capteur de lumière est branché sur A1.",
      hint2: "Utilise analogRead avec la constante de lumière.",
      hint3: "Exemple : int valeurA3 = analogRead(A3); lit une autre entrée analogique.",
      test: (_source, context) => Boolean(context.vars.light)
    },
    {
      id: "readWater",
      label: "analogRead(PIN_NIVEAU_EAU);",
      state: "lecture A2",
      hint1: "Le capteur de niveau d'eau est branché sur A2.",
      hint2: "Utilise analogRead avec la constante de niveau d'eau.",
      hint3: "Exemple : int valeurA3 = analogRead(A3); lit une autre entrée analogique.",
      test: (_source, context) => Boolean(context.vars.water)
    },
    {
      id: "showHumidity",
      label: "affichage de valeurHumidite",
      state: "communication série",
      hint1: "La valeur d'humidité doit être envoyée vers le Moniteur Série.",
      hint2: "La fonction utile est Serial.print(...) ou Serial.println(...).",
      hint3: "Exemple : Serial.println(valeurA3); affiche une autre mesure.",
      test: (source, context) => hasSerialOutput(source, context.vars.humidity)
    },
    {
      id: "showLight",
      label: "affichage de valeurLumiere",
      state: "communication série",
      hint1: "La valeur de lumière doit être envoyée vers le Moniteur Série.",
      hint2: "La fonction utile est Serial.print(...) ou Serial.println(...).",
      hint3: "Exemple : Serial.println(valeurA3); affiche une autre mesure.",
      test: (source, context) => hasSerialOutput(source, context.vars.light)
    },
    {
      id: "showWater",
      label: "affichage de valeurNiveauEau",
      state: "communication série",
      hint1: "La valeur du niveau d'eau doit être envoyée vers le Moniteur Série.",
      hint2: "La fonction utile est Serial.print(...) ou Serial.println(...).",
      hint3: "Exemple : Serial.println(valeurA3); affiche une autre mesure.",
      test: (source, context) => hasSerialOutput(source, context.vars.water)
    },
    {
      id: "delay",
      label: "delay(1000);",
      state: "temporisation",
      hint1: "La boucle doit attendre une seconde avant de recommencer.",
      hint2: "La fonction utile est delay(...). Mille millisecondes font une seconde.",
      hint3: "Exemple : delay(500); attend une demi-seconde.",
      test: source => /\bdelay\s*\(\s*1000(?:UL|L)?\s*\)\s*;/.test(source)
    }
  ];

  const skeletons = {
    guided: `// Mission 1 — Faire parler les capteurs
// Étape 1 : ajoute la bibliothèque de base Arduino ci-dessous.


const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Étape 2 : initialise le Moniteur Série à 9600 bauds.


  // Étape 3 : configure la broche du relais comme sortie.


  // Étape 4 : force l'état sur LOW pour garder la pompe arrêtée.

}

void loop() {
  // Étape 5 : lis l'humidité du sol sur A0.


  // Étape 6 : lis la lumière sur A1.


  // Étape 7 : lis le niveau d'eau sur A2.


  // Étapes 8 à 10 : affiche les trois mesures dans le Moniteur Série.


  // Sécurité : la pompe reste arrêtée pour cette mission.


  // Étape 11 : attends une seconde avant la prochaine boucle.

}`,

    standard: `// Mission 1 — Faire parler les capteurs

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Initialiser la communication série.

  // Configurer et sécuriser D6.

}

void loop() {
  // Lire A0, A1 et A2 dans trois variables.

  // Afficher les trois mesures.

  // Garder la pompe arrêtée puis attendre une seconde.

}`,

    expert: `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
}

void loop() {
}`
  };

  const reference = `#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}

void loop() {
  int valeurHumidite = analogRead(PIN_HUMIDITE_SOL);
  int valeurLumiere = analogRead(PIN_LUMIERE);
  int valeurNiveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.print("Humidité : ");
  Serial.println(valeurHumidite);
  Serial.print("Lumière : ");
  Serial.println(valeurLumiere);
  Serial.print("Niveau d'eau : ");
  Serial.println(valeurNiveauEau);

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);
}`;

  function sanitize(code) {
    return String(code || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map(line => line.replace(/\/\/.*$/, ""))
      .join("\n");
  }

  function analogVar(source, pinPattern) {
    const pattern = new RegExp(`\\b(?:int|long|float|auto)?\\s*([A-Za-z_]\\w*)\\s*=\\s*analogRead\\s*\\(\\s*${pinPattern}\\s*\\)\\s*;`);
    return source.match(pattern)?.[1] || "";
  }

  function hasSerialOutput(source, variableName) {
    if (!variableName) return false;
    const escaped = variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\bSerial\\s*\\.\\s*print(?:ln)?\\s*\\(\\s*${escaped}\\s*\\)\\s*;`).test(source);
  }

  function constantsStatus(source) {
    return [
      {
        id: "constHumidity",
        label: "const int PIN_HUMIDITE_SOL = A0;",
        ok: /\bconst\s+int\s+PIN_HUMIDITE_SOL\s*=\s*A0\s*;/.test(source)
      },
      {
        id: "constLight",
        label: "const int PIN_LUMIERE = A1;",
        ok: /\bconst\s+int\s+PIN_LUMIERE\s*=\s*A1\s*;/.test(source)
      },
      {
        id: "constWater",
        label: "const int PIN_NIVEAU_EAU = A2;",
        ok: /\bconst\s+int\s+PIN_NIVEAU_EAU\s*=\s*A2\s*;/.test(source)
      },
      {
        id: "constPump",
        label: "const int PIN_RELAIS_POMPE = 6;",
        ok: /\bconst\s+int\s+PIN_RELAIS_POMPE\s*=\s*6\s*;/.test(source)
      }
    ];
  }

  function validate(code) {
    const source = sanitize(code);
    const context = {
      vars: {
        humidity: analogVar(source, pin.humidity),
        light: analogVar(source, pin.light),
        water: analogVar(source, pin.water)
      }
    };
    const stepResults = STEPS.map(step => ({ ...step, ok: step.test(source, context) }));
    const constants = constantsStatus(source);
    const missingConstants = constants.filter(item => !item.ok);
    const missingSteps = stepResults.filter(item => !item.ok);
    const firstMissing = missingSteps[0] || null;
    const hasPlaceholders = /_{3,}|TODO|A_COMPLETER/i.test(code || "");
    const errors = [
      ...missingConstants.map(item => `Constante manquante : ${item.label}`),
      ...missingSteps.map(item => `Instruction manquante : ${item.label}`)
    ];
    if (hasPlaceholders) errors.unshift("Des zones à compléter sont encore présentes dans le programme.");

    return {
      source,
      context,
      constants,
      steps: stepResults,
      firstMissing,
      hasPlaceholders,
      errors,
      allOk: errors.length === 0,
      percent: Math.round((stepResults.filter(item => item.ok).length / stepResults.length) * 100),
      badges: {
        sensors: ["readHumidity", "readLight", "readWater"].every(id => stepResults.find(step => step.id === id)?.ok),
        communication: ["serialBegin", "showHumidity", "showLight", "showWater"].every(id => stepResults.find(step => step.id === id)?.ok),
        safety: ["pinMode", "safeLowSetup"].every(id => stepResults.find(step => step.id === id)?.ok)
      }
    };
  }

  const api = {
    STEPS,
    reference,
    validate,
    getSkeleton(mode) {
      return skeletons[mode] || skeletons.guided;
    }
  };

  if (typeof window !== "undefined") window.TechnoQuestMissionValidator = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
