/* TechnoQuest Mission Mode - validation C++ Arduino multi-séances. */
"use strict";

(() => {
  const dataApi = (typeof window !== "undefined" ? window.TechnoQuestMissionData : null) || (typeof require !== "undefined" ? require("./mission-data.js") : null);

  const pin = {
    humidity: "(?:PIN_HUMIDITE_SOL|A0)",
    light: "(?:PIN_LUMIERE|A1)",
    water: "(?:PIN_NIVEAU_EAU|A2)",
    pump: "(?:PIN_RELAIS_POMPE|6)"
  };

  const digitalLow = new RegExp(`\\bdigitalWrite\\s*\\(\\s*${pin.pump}\\s*,\\s*LOW\\s*\\)\\s*;`);
  const digitalHigh = new RegExp(`\\bdigitalWrite\\s*\\(\\s*${pin.pump}\\s*,\\s*HIGH\\s*\\)\\s*;`);

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
    const escaped = escapeRegExp(variableName);
    return new RegExp(`\\bSerial\\s*\\.\\s*print(?:ln)?\\s*\\(\\s*${escaped}\\s*\\)\\s*;`).test(source);
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function compareWith(source, variableName, operator, constantName) {
    if (!variableName) return false;
    const variable = escapeRegExp(variableName);
    const constant = escapeRegExp(constantName);
    const op = escapeRegExp(operator);
    const left = new RegExp(`\\b${variable}\\s*${op}\\s*${constant}\\b`);
    const right = new RegExp(`\\b${constant}\\s*${op}\\s*${variable}\\b`);
    return left.test(source) || right.test(source);
  }

  function containsSerialText(source, words) {
    return /\bSerial\s*\.\s*print(?:ln)?\s*\(/.test(source) && words.some(word => new RegExp(word, "i").test(source));
  }

  function constantsStatus(source) {
    return [
      { id: "constHumidity", label: "const int PIN_HUMIDITE_SOL = A0;", ok: /\bconst\s+int\s+PIN_HUMIDITE_SOL\s*=\s*A0\s*;/.test(source) },
      { id: "constLight", label: "const int PIN_LUMIERE = A1;", ok: /\bconst\s+int\s+PIN_LUMIERE\s*=\s*A1\s*;/.test(source) },
      { id: "constWater", label: "const int PIN_NIVEAU_EAU = A2;", ok: /\bconst\s+int\s+PIN_NIVEAU_EAU\s*=\s*A2\s*;/.test(source) },
      { id: "constPump", label: "const int PIN_RELAIS_POMPE = 6;", ok: /\bconst\s+int\s+PIN_RELAIS_POMPE\s*=\s*6\s*;/.test(source) }
    ];
  }

  const stepTemplates = {
    include: {
      label: "#include <Arduino.h>",
      hint1: "Le programme Arduino a besoin de sa bibliothèque de base.",
      hint2: "Ajoute #include <Arduino.h> tout en haut du fichier.",
      hint3: "La directive commence par #include et se place avant les constantes.",
      marker: /biblioth[eè]que|#\s*include/i,
      line: /#\s*include\s*<\s*Arduino\.h\s*>/i,
      test: source => /#\s*include\s*<\s*Arduino\.h\s*>/.test(source)
    },
    serialBegin: {
      label: "Serial.begin(9600);",
      hint1: "Il faut préparer le Moniteur Série avant d'afficher les mesures.",
      hint2: "Ecris Serial.begin(9600); dans setup().",
      hint3: "Le Moniteur Série devra aussi être réglé sur 9600 bauds.",
      marker: /Moniteur S[ée]rie|Serial\.begin/i,
      line: /\bSerial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/,
      test: source => /\bSerial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/.test(source)
    },
    pinMode: {
      label: "pinMode(PIN_RELAIS_POMPE, OUTPUT);",
      hint1: "La broche du relais doit être configurée comme une sortie.",
      hint2: "Ecris pinMode(PIN_RELAIS_POMPE, OUTPUT); dans setup().",
      hint3: "OUTPUT indique que D6 envoie une commande logique.",
      marker: /sortie|pinMode/i,
      line: new RegExp(`\\bpinMode\\s*\\(\\s*${pin.pump}\\s*,\\s*OUTPUT\\s*\\)\\s*;`),
      test: source => new RegExp(`\\bpinMode\\s*\\(\\s*${pin.pump}\\s*,\\s*OUTPUT\\s*\\)\\s*;`).test(source)
    },
    safeLowSetup: {
      label: "digitalWrite(PIN_RELAIS_POMPE, LOW);",
      hint1: "La pompe doit commencer dans un état sûr.",
      hint2: "Force D6 à LOW dans setup().",
      hint3: "LOW garde le relais au repos dans ces missions.",
      marker: /LOW|pompe arr[eê]t[eé]e|digitalWrite/i,
      line: digitalLow,
      test: source => digitalLow.test(source)
    },
    thresholdHumidity: {
      label: "const int SEUIL_HUMIDITE = ...;",
      hint1: "Le seuil d'humidité doit être une constante modifiable.",
      hint2: "Ajoute const int SEUIL_HUMIDITE = une valeur issue des mesures.",
      hint3: "Exemple : const int SEUIL_HUMIDITE = 560;",
      marker: /SEUIL_HUMIDITE|seuil d'humidit/i,
      line: /\bconst\s+int\s+SEUIL_HUMIDITE\s*=\s*\d+\s*;/,
      test: source => /\bconst\s+int\s+SEUIL_HUMIDITE\s*=\s*\d+\s*;/.test(source)
    },
    thresholdStop: {
      label: "const int SEUIL_ARRET = ...;",
      hint1: "L'hystérésis utilise un seuil de démarrage et un seuil d'arrêt.",
      hint2: "Ajoute une constante SEUIL_ARRET supérieure au seuil de démarrage.",
      hint3: "Exemple : const int SEUIL_ARRET = 650;",
      marker: /SEUIL_ARRET|seuil haut|hyst[eé]r[eé]sis/i,
      line: /\bconst\s+int\s+SEUIL_ARRET\s*=\s*\d+\s*;/,
      test: source => /\bconst\s+int\s+SEUIL_ARRET\s*=\s*\d+\s*;/.test(source)
    },
    thresholdWater: {
      label: "const int SEUIL_RESERVOIR = ...;",
      hint1: "Le réservoir a besoin d'un seuil de sécurité.",
      hint2: "Ajoute const int SEUIL_RESERVOIR = une valeur minimale.",
      hint3: "Cette valeur sert à éviter la marche à vide.",
      marker: /SEUIL_RESERVOIR|r[eé]servoir/i,
      line: /\bconst\s+int\s+SEUIL_RESERVOIR\s*=\s*\d+\s*;/,
      test: source => /\bconst\s+int\s+SEUIL_RESERVOIR\s*=\s*\d+\s*;/.test(source)
    },
    thresholdLight: {
      label: "const int SEUIL_LUMIERE = ...;",
      hint1: "La luminosité doit avoir son propre seuil.",
      hint2: "Ajoute const int SEUIL_LUMIERE = une valeur adaptée.",
      hint3: "Ce seuil complète la décision sans remplacer A0.",
      marker: /SEUIL_LUMIERE|lumi[eè]re/i,
      line: /\bconst\s+int\s+SEUIL_LUMIERE\s*=\s*\d+\s*;/,
      test: source => /\bconst\s+int\s+SEUIL_LUMIERE\s*=\s*\d+\s*;/.test(source)
    },
    readHumidity: {
      label: "analogRead(PIN_HUMIDITE_SOL);",
      hint1: "Le capteur d'humidité est branché sur A0.",
      hint2: "Lis A0 avec analogRead(PIN_HUMIDITE_SOL).",
      hint3: "Stocke la valeur dans une variable int.",
      marker: /humidit[eé]|A0/i,
      line: new RegExp(`analogRead\\s*\\(\\s*${pin.humidity}\\s*\\)\\s*;`),
      test: (_source, context) => Boolean(context.vars.humidity)
    },
    readLight: {
      label: "analogRead(PIN_LUMIERE);",
      hint1: "La LDR est branchée sur A1.",
      hint2: "Lis A1 avec analogRead(PIN_LUMIERE).",
      hint3: "Stocke la valeur dans une variable int.",
      marker: /lumi[eè]re|A1/i,
      line: new RegExp(`analogRead\\s*\\(\\s*${pin.light}\\s*\\)\\s*;`),
      test: (_source, context) => Boolean(context.vars.light)
    },
    readWater: {
      label: "analogRead(PIN_NIVEAU_EAU);",
      hint1: "Le niveau du réservoir est branché sur A2.",
      hint2: "Lis A2 avec analogRead(PIN_NIVEAU_EAU).",
      hint3: "Cette mesure protège la pompe.",
      marker: /niveau|r[eé]servoir|A2/i,
      line: new RegExp(`analogRead\\s*\\(\\s*${pin.water}\\s*\\)\\s*;`),
      test: (_source, context) => Boolean(context.vars.water)
    },
    compareHumidity: {
      label: "humidite < SEUIL_HUMIDITE",
      hint1: "La décision doit comparer l'humidité au seuil choisi.",
      hint2: "Utilise une condition du type humidite < SEUIL_HUMIDITE.",
      hint3: "La variable peut avoir un autre nom si elle vient bien de A0.",
      marker: /humidit[eé].*SEUIL_HUMIDITE|SEUIL_HUMIDITE.*humidit[eé]/i,
      line: /if|else if|elif/i,
      test: (source, context) => compareWith(source, context.vars.humidity, "<", "SEUIL_HUMIDITE")
    },
    compareStop: {
      label: "humidite > SEUIL_ARRET",
      hint1: "Le seuil haut sert à stabiliser l'arrêt.",
      hint2: "Compare l'humidité avec SEUIL_ARRET.",
      hint3: "Exemple : humidite > SEUIL_ARRET.",
      marker: /SEUIL_ARRET|seuil haut/i,
      line: /SEUIL_ARRET/,
      test: (source, context) => compareWith(source, context.vars.humidity, ">", "SEUIL_ARRET")
    },
    compareWaterLow: {
      label: "niveauEau < SEUIL_RESERVOIR",
      hint1: "La sécurité du réservoir doit être testée.",
      hint2: "Teste le niveau insuffisant avec < SEUIL_RESERVOIR.",
      hint3: "Ce test doit conduire à l'arrêt et à l'alerte.",
      marker: /r[eé]servoir|SEUIL_RESERVOIR|niveau/i,
      line: /SEUIL_RESERVOIR/,
      test: (source, context) => compareWith(source, context.vars.water, "<", "SEUIL_RESERVOIR")
    },
    compareWaterEnough: {
      label: "niveauEau >= SEUIL_RESERVOIR",
      hint1: "L'arrosage n'est autorisé que si le niveau est suffisant.",
      hint2: "Ajoute niveauEau >= SEUIL_RESERVOIR dans la condition d'arrosage.",
      hint3: "Combine ce critère avec &&.",
      marker: />=\s*SEUIL_RESERVOIR|SEUIL_RESERVOIR\s*<=/i,
      line: /SEUIL_RESERVOIR/,
      test: (source, context) => compareWith(source, context.vars.water, ">=", "SEUIL_RESERVOIR")
    },
    compareLight: {
      label: "lumiere < SEUIL_LUMIERE",
      hint1: "La luminosité complète la décision.",
      hint2: "Compare la variable lue sur A1 au seuil de lumière.",
      hint3: "Exemple : lumiere < SEUIL_LUMIERE.",
      marker: /SEUIL_LUMIERE|lumi[eè]re/i,
      line: /SEUIL_LUMIERE/,
      test: (source, context) => compareWith(source, context.vars.light, "<", "SEUIL_LUMIERE")
    },
    showHumidity: {
      label: "affichage de l'humidité",
      hint1: "La mesure A0 doit être visible dans le Moniteur Série.",
      hint2: "Affiche la variable d'humidité avec Serial.print ou Serial.println.",
      hint3: "Exemple : Serial.println(humidite);",
      marker: /Serial|affich/i,
      line: (_context) => /\bSerial\s*\.\s*print(?:ln)?\s*\(/,
      test: (source, context) => hasSerialOutput(source, context.vars.humidity)
    },
    showLight: {
      label: "affichage de la lumière",
      hint1: "La mesure A1 doit être visible dans le Moniteur Série.",
      hint2: "Affiche la variable de lumière avec Serial.print ou Serial.println.",
      hint3: "Exemple : Serial.println(lumiere);",
      marker: /Serial|lumi[eè]re/i,
      line: (_context) => /\bSerial\s*\.\s*print(?:ln)?\s*\(/,
      test: (source, context) => hasSerialOutput(source, context.vars.light)
    },
    showWater: {
      label: "affichage du niveau d'eau",
      hint1: "La mesure A2 doit être visible dans le Moniteur Série.",
      hint2: "Affiche la variable du niveau d'eau.",
      hint3: "Exemple : Serial.println(niveauEau);",
      marker: /Serial|niveau|r[eé]servoir/i,
      line: (_context) => /\bSerial\s*\.\s*print(?:ln)?\s*\(/,
      test: (source, context) => hasSerialOutput(source, context.vars.water)
    },
    showSoilState: {
      label: "affichage Sol sec / Sol humide",
      hint1: "La calibration doit produire une information interprétable.",
      hint2: "Affiche Sol sec ou Sol humide selon la comparaison.",
      hint3: "Utilise Serial.println(\"Sol sec\"); par exemple.",
      marker: /Sol sec|Sol humide/i,
      line: /Sol sec|Sol humide/i,
      test: source => containsSerialText(source, ["Sol sec", "Sol humide"])
    },
    alertWater: {
      label: "alerte réservoir vide",
      hint1: "L'utilisateur doit être averti si le réservoir est trop bas.",
      hint2: "Ajoute un message Serial.println indiquant le réservoir vide.",
      hint3: "L'alerte accompagne l'arrêt de la pompe.",
      marker: /Reservoir vide|R[eé]servoir vide|alerte/i,
      line: /Reservoir vide|R[eé]servoir vide|alerte/i,
      test: source => containsSerialText(source, ["Reservoir vide", "R[eé]servoir vide", "niveau insuffisant"])
    },
    pumpStart: {
      label: "digitalWrite(PIN_RELAIS_POMPE, HIGH);",
      hint1: "Le relais doit recevoir HIGH seulement quand l'arrosage est autorisé.",
      hint2: "Utilise digitalWrite(PIN_RELAIS_POMPE, HIGH);.",
      hint3: "Ne place pas HIGH dans le cas réservoir vide.",
      marker: /HIGH|relais active|arroser/i,
      line: digitalHigh,
      test: source => digitalHigh.test(source)
    },
    delayPump: {
      label: "delay(2000) ou delay(3000);",
      hint1: "La pompe ne doit fonctionner que pendant une durée courte.",
      hint2: "Utilise delay(2000); ou delay(3000); dans le bloc d'arrosage.",
      hint3: "Deux secondes économisent plus d'eau que trois secondes.",
      marker: /2000|3000|arrosage/i,
      line: /\bdelay\s*\(\s*(?:2000|3000)(?:UL|L)?\s*\)\s*;/,
      test: source => /\bdelay\s*\(\s*(?:2000|3000)(?:UL|L)?\s*\)\s*;/.test(source)
    },
    pumpStop: {
      label: "arrêter la pompe avec LOW",
      hint1: "Après l'arrosage ou en cas de refus, la pompe doit être arrêtée.",
      hint2: "Ajoute digitalWrite(PIN_RELAIS_POMPE, LOW);.",
      hint3: "Cette instruction doit aussi exister dans les cas else.",
      marker: /LOW|pompe arr[eê]t/i,
      line: digitalLow,
      last: true,
      test: source => digitalLow.test(source)
    },
    delay: {
      label: "delay(1000);",
      hint1: "La boucle doit attendre une seconde avant de recommencer.",
      hint2: "Utilise delay(1000); en fin de loop().",
      hint3: "1000 millisecondes correspondent à une seconde.",
      marker: /1000|seconde|delay/i,
      line: /\bdelay\s*\(\s*1000(?:UL|L)?\s*\)\s*;/,
      test: source => /\bdelay\s*\(\s*1000(?:UL|L)?\s*\)\s*;/.test(source)
    }
  };

  function getMission(sessionId) {
    return dataApi.getMission(Number(sessionId) || 1);
  }

  function getSteps(sessionId) {
    const mission = getMission(sessionId);
    return mission.steps.map(id => ({ id, ...stepTemplates[id] })).filter(step => step.label);
  }

  function validate(code, sessionId = 1) {
    const mission = getMission(sessionId);
    const source = sanitize(code);
    const context = {
      vars: {
        humidity: analogVar(source, pin.humidity),
        light: analogVar(source, pin.light),
        water: analogVar(source, pin.water)
      }
    };
    const steps = getSteps(mission.id);
    const stepResults = steps.map(step => ({ ...step, ok: step.test(source, context) }));
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
    const badges = Object.fromEntries(mission.badges.map(badge => [
      badge.id,
      badge.steps.every(id => stepResults.find(step => step.id === id)?.ok)
    ]));

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
      badges
    };
  }

  function getSkeleton(mode, sessionId = 1) {
    const mission = getMission(sessionId);
    return mission.skeletons[mode] || mission.skeletons.guided;
  }

  function getReferenceCode(sessionId = 1) {
    return getMission(sessionId).reference;
  }

  function findLineForStep(code, stepId, result, sessionId = 1, mode = "edition") {
    if (!stepId) return Math.max(0, String(code || "").split("\n").length - 1);
    const lines = String(code || "").split("\n");
    const steps = getSteps(sessionId);
    const step = steps.find(item => item.id === stepId);
    const context = result?.context || {};
    const pattern = typeof step?.line === "function" ? step.line(context) : step?.line;
    if (pattern) {
      const indexes = [];
      lines.forEach((line, index) => {
        pattern.lastIndex = 0;
        if (pattern.test(line)) indexes.push(index);
      });
      if (indexes.length) return step.last ? indexes[indexes.length - 1] : indexes[0];
    }
    if (mode === "simulation") {
      return Math.min(lines.length - 1, Math.max(0, steps.findIndex(item => item.id === stepId)));
    }
    const marker = step?.marker;
    const found = marker ? lines.findIndex(line => marker.test(line)) : -1;
    if (found >= 0) {
      const blankAfter = lines.findIndex((line, index) => index > found && !line.trim());
      return blankAfter > found ? blankAfter : found;
    }
    return Math.min(lines.length - 1, Math.max(0, steps.findIndex(item => item.id === stepId) + 1));
  }

  const api = {
    getSteps,
    getSkeleton,
    getReferenceCode,
    findLineForStep,
    validate,
    stepTemplates
  };

  if (typeof window !== "undefined") window.TechnoQuestMissionValidator = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
