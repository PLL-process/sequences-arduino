/* TechnoQuest Mission Mode - validation C++ Arduino multi-séances. */
/* La séance 1 est validée par CONTEXTE (fonction setup()/loop(), variable, mode) grâce à */
/* l'analyse structurelle pure (mission-arduino-analysis.js) : plus de regex globale unique. */
"use strict";

(() => {
  const dataApi = (typeof window !== "undefined" ? window.TechnoQuestMissionData : null) || (typeof require !== "undefined" ? require("./mission-data.js") : null);
  /* Analyse lexicale/structurelle (neutralisation commentaires/chaînes + corps setup()/loop()). */
  const analysisApi = (typeof window !== "undefined" ? window.TechnoQuestMissionArduinoAnalysis : null) || (typeof require !== "undefined" ? require("./mission-arduino-analysis.js") : null);

  const pin = {
    humidity: "(?:PIN_HUMIDITE_SOL|A0)",
    light: "(?:PIN_LUMIERE|A1)",
    water: "(?:PIN_NIVEAU_EAU|A2)",
    pump: "(?:PIN_RELAIS_POMPE|6)"
  };

  const digitalLow = new RegExp(`\\bdigitalWrite\\s*\\(\\s*${pin.pump}\\s*,\\s*LOW\\s*\\)\\s*;`);
  const digitalHigh = new RegExp(`\\bdigitalWrite\\s*\\(\\s*${pin.pump}\\s*,\\s*HIGH\\s*\\)\\s*;`);

  /* ---- Expressions par instruction (appliquées à un CORPS de fonction, pas au fichier). ---- */
  const RE = {
    /* Bibliothèque de base (tolère des parenthèses/espaces raisonnables). */
    include: /#\s*include\s*<\s*Arduino\.h\s*>/,
    /* Serial.begin(9600) avec espaces, retours à la ligne et parenthèses superflues tolérés. */
    serialBegin: /\bSerial\s*\.\s*begin\s*\(\s*\(?\s*9600\s*\)?\s*\)\s*;/,
    /* pinMode du relais en sortie. */
    pinModeOut: new RegExp(`\\bpinMode\\s*\\(\\s*${pin.pump}\\s*,\\s*OUTPUT\\s*\\)\\s*;`),
    /* Toute utilisation de pinMode. */
    pinModeAny: /\bpinMode\s*\(/,
    /* pinMode du relais en INPUT (erreur pédagogique fréquente). */
    pinModePumpInput: new RegExp(`\\bpinMode\\s*\\(\\s*${pin.pump}\\s*,\\s*INPUT\\s*\\)`),
    /* pinMode visant réellement la broche du relais (peu importe le mode). */
    pinModePump: new RegExp(`\\bpinMode\\s*\\(\\s*${pin.pump}\\s*,`),
    /* Arrêt de la pompe (LOW sur la broche du relais). */
    digLowPump: digitalLow,
    /* Temporisation d'une seconde. */
    delay1000: /\bdelay\s*\(\s*1000(?:UL|L)?\s*\)\s*;/
  };

  /* Échappe une valeur pour un usage littéral dans une expression régulière. */
  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* Teste un motif sur un texte (motif non global : pas d'état lastIndex à gérer). */
  function has(text, pattern) {
    return pattern.test(String(text || ""));
  }

  /* Extrait le nom de la variable recevant analogRead(pin) dans un corps donné. */
  function analogVarIn(body, pinPattern) {
    const pattern = new RegExp(`\\b([A-Za-z_]\\w*)\\s*=\\s*analogRead\\s*\\(\\s*${pinPattern}\\s*\\)\\s*;`);
    return String(body || "").match(pattern)?.[1] || "";
  }

  /* Indique si une lecture analogique d'une broche est présente dans un texte. */
  function analogReadPresent(text, pinPattern) {
    return new RegExp(`analogRead\\s*\\(\\s*${pinPattern}\\s*\\)`).test(String(text || ""));
  }

  /* Indique si une variable précise est affichée seule dans Serial.print/println. */
  function printsVariable(body, variableName) {
    if (!variableName) return false;
    const variable = escapeRegExp(variableName);
    return new RegExp(`\\bSerial\\s*\\.\\s*print(?:ln)?\\s*\\(\\s*${variable}\\s*\\)`).test(String(body || ""));
  }

  /* Indique si une instruction est présente UNIQUEMENT en commentaire ou dans une chaîne. */
  function onlyInCommentOrString(analysis, pattern) {
    return has(analysis.original, pattern) && !has(analysis.stripped, pattern);
  }

  /* ---- Nommage des variables (règles pédagogiques du cycle 4) ---- */
  /* MOTS-CLÉS DU LANGAGE C++ réservés (norme C++11 à C++17, telle que prise en charge par la */
  /* chaîne de compilation Arduino avr-g++). Un mot-clé ne peut jamais servir de nom de variable. */
  /* La liste est déterministe, sans doublon ; la comparaison est EXACTE et SENSIBLE À LA CASSE */
  /* (« format » n'est pas « for », « returnValue » n'est pas « return » : aucun faux positif par */
  /* sous-chaîne). Catégories couvertes : types & déclarations, contrôle & boucles, classes & */
  /* accès, gestion mémoire, exceptions, opérateurs nommés, mots-clés modernes. */
  const CPP_KEYWORDS = [
    /* Types et déclarations. */
    "alignas", "alignof", "asm", "auto", "bool", "char", "char16_t", "char32_t", "const", "constexpr", "decltype", "double", "enum", "explicit", "extern", "false", "float", "inline", "int", "long", "mutable", "register", "short", "signed", "sizeof", "static", "static_assert", "struct", "thread_local", "true", "typedef", "typeid", "typename", "union", "unsigned", "using", "void", "volatile", "wchar_t",
    /* Contrôle et boucles. */
    "break", "case", "continue", "default", "do", "else", "for", "goto", "if", "return", "switch", "while",
    /* Classes et accès. */
    "class", "friend", "namespace", "operator", "private", "protected", "public", "template", "this", "virtual",
    /* Gestion mémoire et conversions. */
    "const_cast", "delete", "dynamic_cast", "new", "reinterpret_cast", "static_cast",
    /* Exceptions. */
    "catch", "noexcept", "throw", "try",
    /* Opérateurs nommés (jetons alternatifs réservés). */
    "and", "and_eq", "bitand", "bitor", "compl", "not", "not_eq", "or", "or_eq", "xor", "xor_eq",
    /* Divers réservés. */
    "export", "nullptr"
  ];
  const CPP_KEYWORD_SET = new Set(CPP_KEYWORDS);

  /* IDENTIFIANTS CRITIQUES DE L'ENVIRONNEMENT ARDUINO pour cette activité (distincts des mots-clés */
  /* C++) : fonctions imposées, constantes matérielles et broches déjà nommées dans le programme. */
  /* Les réutiliser comme nom de variable prêterait à confusion : refus pédagogique avec message dédié. */
  const ARDUINO_RESERVED = [
    "setup", "loop", "Serial",
    "HIGH", "LOW", "INPUT", "OUTPUT", "INPUT_PULLUP",
    "A0", "A1", "A2",
    "PIN_HUMIDITE_SOL", "PIN_LUMIERE", "PIN_NIVEAU_EAU", "PIN_RELAIS_POMPE"
  ];
  const ARDUINO_RESERVED_SET = new Set(ARDUINO_RESERVED);

  /* Diagnostique un identifiant : renvoie null s'il est valide, sinon la catégorie du problème. */
  function identifierProblem(name) {
    const raw = String(name || "");
    if (raw === "") return "empty";
    if (/\s/.test(raw)) return "space";
    if (raw.includes("-")) return "tiret";
    /* Tout caractère non ASCII (é, É, à, ç…) est considéré comme un accent interdit ici. */
    if (/[^\x00-\x7F]/.test(raw)) return "accent";
    if (/^[0-9]/.test(raw)) return "digit";
    /* Premier caractère lettre ou _, puis lettres/chiffres/_ uniquement. */
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(raw)) return "special";
    /* Comparaison EXACTE et sensible à la casse (jamais par sous-chaîne). */
    if (ARDUINO_RESERVED_SET.has(raw)) return "arduino";
    if (CPP_KEYWORD_SET.has(raw)) return "reserved";
    return null;
  }

  /* Vrai si l'identifiant respecte toutes les règles syntaxiques de l'activité. */
  function isValidIdentifier(name) {
    return identifierProblem(name) === null;
  }

  /* Extrait la CIBLE d'affectation (identifiant brut, type retiré) d'une lecture analogique. */
  /* Renvoie null si aucune affectation « … = analogRead(broche) ; » n'existe dans le corps. */
  function readAssignmentTarget(body, pinPattern) {
    const match = String(body || "").match(new RegExp(`([^;\\n{}]*?)=\\s*analogRead\\s*\\(\\s*${pinPattern}\\s*\\)\\s*;`));
    if (!match) return null;
    /* Retire un éventuel type de déclaration pour ne garder que le nom de la variable. */
    return match[1].replace(/^\s*(?:const\s+)?(?:unsigned\s+|signed\s+)?(?:int|long|short|byte|word|float|double|char|bool|auto)\b\s*/i, "").trim();
  }

  /* Analyse le nommage des trois lectures : validité syntaxique + unicité (aucune collision). */
  /* Chaque capteur doit être mémorisé dans un identifiant valide ET distinct des autres. */
  function analyzeNaming(loopBody) {
    const order = [["humidity", pin.humidity], ["light", pin.light], ["water", pin.water]];
    const result = {};
    /* Associe chaque identifiant DÉJÀ utilisé au capteur qui l'a réservé en premier. */
    const usedBy = new Map();
    order.forEach(([key, pinPattern]) => {
      const target = readAssignmentTarget(loopBody, pinPattern);
      /* Aucune affectation pour ce capteur. */
      if (target === null) { result[key] = { present: false, identifier: "", valid: false, problem: null, collidesWith: null }; return; }
      const problem = identifierProblem(target);
      const valid = problem === null;
      let collidesWith = null;
      /* La collision n'a de sens que pour un identifiant valide déjà réservé par un autre capteur. */
      if (valid) {
        if (usedBy.has(target)) collidesWith = usedBy.get(target);
        else usedBy.set(target, key);
      }
      result[key] = { present: true, identifier: target, valid, problem, collidesWith };
    });
    return result;
  }

  /* ---- Helpers de sessions ultérieures (compares/affichages libres), conservés tels quels. ---- */
  function hasSerialOutput(source, variableName) {
    if (!variableName) return false;
    const escaped = escapeRegExp(variableName);
    return new RegExp(`\\bSerial\\s*\\.\\s*print(?:ln)?\\s*\\(\\s*${escaped}\\s*\\)\\s*;`).test(source);
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

  /* ---- Définition des étapes. Les étapes de la séance 1 utilisent une vérification ---- */
  /* ---- CONTEXTUELLE check(analysis, context) → { ok, message } ; les autres séances ---- */
  /* ---- conservent leur test(source, context) → booléen. ---- */
  const stepTemplates = {
    include: {
      label: "#include <Arduino.h>",
      hint1: "Le programme Arduino a besoin de sa bibliothèque de base.",
      hint2: "Ajoute #include <Arduino.h> tout en haut du fichier.",
      hint3: "La directive commence par #include et se place avant les constantes.",
      marker: /biblioth[eè]que|#\s*include/i,
      line: /#\s*include\s*<\s*Arduino\.h\s*>/i,
      check: analysis => {
        /* Directive réellement présente (hors commentaire/chaîne). */
        if (has(analysis.stripped, RE.include)) return { ok: true };
        /* Présente uniquement en commentaire. */
        if (has(analysis.original, RE.include)) return { ok: false, message: "La bibliothèque #include <Arduino.h> est écrite en commentaire : elle n'est pas prise en compte." };
        /* Absente. */
        return { ok: false };
      }
    },
    serialBegin: {
      label: "Serial.begin(9600);",
      hint1: "Il faut préparer le Moniteur Série avant d'afficher les mesures.",
      hint2: "Ecris Serial.begin(9600); dans setup().",
      hint3: "Le Moniteur Série devra aussi être réglé sur 9600 bauds.",
      marker: /Moniteur S[ée]rie|Serial\.begin/i,
      line: /\bSerial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/,
      check: analysis => {
        /* Correctement placé dans setup(). */
        if (has(analysis.setup.body, RE.serialBegin)) return { ok: true };
        /* Présent mais dans loop(). */
        if (has(analysis.loop.body, RE.serialBegin)) return { ok: false, message: "Serial.begin(9600); est présent, mais doit être placé dans setup()." };
        /* Présent hors des fonctions. */
        if (has(analysis.outside, RE.serialBegin)) return { ok: false, message: "Serial.begin(9600); doit être placé à l'intérieur de setup()." };
        /* Présent seulement en commentaire/chaîne. */
        if (onlyInCommentOrString(analysis, RE.serialBegin)) return { ok: false, message: "Serial.begin(9600); est actuellement dans un commentaire ou une chaîne et n'est pas exécuté." };
        /* Absent. */
        return { ok: false };
      }
    },
    pinMode: {
      label: "pinMode(PIN_RELAIS_POMPE, OUTPUT);",
      hint1: "La broche du relais doit être configurée comme une sortie.",
      hint2: "Ecris pinMode(PIN_RELAIS_POMPE, OUTPUT); dans setup().",
      hint3: "OUTPUT indique que D6 envoie une commande logique.",
      marker: /sortie|pinMode/i,
      line: new RegExp(`\\bpinMode\\s*\\(\\s*${pin.pump}\\s*,\\s*OUTPUT\\s*\\)\\s*;`),
      check: analysis => {
        /* Correctement placé dans setup(). */
        if (has(analysis.setup.body, RE.pinModeOut)) return { ok: true };
        /* Correct mais dans loop(). */
        if (has(analysis.loop.body, RE.pinModeOut)) return { ok: false, message: "pinMode(PIN_RELAIS_POMPE, OUTPUT); doit être placé dans setup()." };
        /* Broche du relais configurée en INPUT au lieu d'OUTPUT. */
        if (has(analysis.stripped, RE.pinModePumpInput)) return { ok: false, message: "La broche du relais est configurée en INPUT, mais elle doit être une sortie : utilise OUTPUT." };
        /* pinMode utilisé sur une autre broche que le relais. */
        if (has(analysis.stripped, RE.pinModeAny) && !has(analysis.stripped, RE.pinModePump)) return { ok: false, message: "pinMode doit configurer la broche du relais (PIN_RELAIS_POMPE) en OUTPUT." };
        /* Présent seulement en commentaire/chaîne. */
        if (onlyInCommentOrString(analysis, RE.pinModeOut)) return { ok: false, message: "pinMode(PIN_RELAIS_POMPE, OUTPUT); est dans un commentaire ou une chaîne et n'est pas exécuté." };
        /* Absent. */
        return { ok: false };
      }
    },
    safeLowSetup: {
      label: "digitalWrite(PIN_RELAIS_POMPE, LOW);",
      hint1: "La pompe doit commencer dans un état sûr.",
      hint2: "Force D6 à LOW dans setup().",
      hint3: "LOW garde le relais au repos dans ces missions.",
      marker: /LOW|pompe arr[eê]t[eé]e|digitalWrite/i,
      line: digitalLow,
      check: analysis => {
        /* Arrêt de sécurité présent dans setup(). */
        if (has(analysis.setup.body, RE.digLowPump)) return { ok: true };
        /* Présent seulement dans loop() : il manque dans setup(). */
        if (has(analysis.loop.body, RE.digLowPump)) return { ok: false, message: "L'arrêt de sécurité digitalWrite(PIN_RELAIS_POMPE, LOW); doit d'abord être placé dans setup() pour démarrer la pompe à l'arrêt." };
        /* Présent seulement en commentaire/chaîne. */
        if (onlyInCommentOrString(analysis, RE.digLowPump)) return { ok: false, message: "L'arrêt de sécurité de la pompe est dans un commentaire ou une chaîne et n'est pas exécuté." };
        /* Absent. */
        return { ok: false };
      }
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
      check: (analysis, context) => readCheck(analysis, context, "humidity")
    },
    readLight: {
      label: "analogRead(PIN_LUMIERE);",
      hint1: "La LDR est branchée sur A1.",
      hint2: "Lis A1 avec analogRead(PIN_LUMIERE).",
      hint3: "Stocke la valeur dans une variable int.",
      marker: /lumi[eè]re|A1/i,
      line: new RegExp(`analogRead\\s*\\(\\s*${pin.light}\\s*\\)\\s*;`),
      check: (analysis, context) => readCheck(analysis, context, "light")
    },
    readWater: {
      label: "analogRead(PIN_NIVEAU_EAU);",
      hint1: "Le niveau du réservoir est branché sur A2.",
      hint2: "Lis A2 avec analogRead(PIN_NIVEAU_EAU).",
      hint3: "Cette mesure protège la pompe.",
      marker: /niveau|r[eé]servoir|A2/i,
      line: new RegExp(`analogRead\\s*\\(\\s*${pin.water}\\s*\\)\\s*;`),
      check: (analysis, context) => readCheck(analysis, context, "water")
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
      check: (analysis, context) => showCheck(analysis, context, "humidity")
    },
    showLight: {
      label: "affichage de la lumière",
      hint1: "La mesure A1 doit être visible dans le Moniteur Série.",
      hint2: "Affiche la variable de lumière avec Serial.print ou Serial.println.",
      hint3: "Exemple : Serial.println(lumiere);",
      marker: /Serial|lumi[eè]re/i,
      line: (_context) => /\bSerial\s*\.\s*print(?:ln)?\s*\(/,
      check: (analysis, context) => showCheck(analysis, context, "light")
    },
    showWater: {
      label: "affichage du niveau d'eau",
      hint1: "La mesure A2 doit être visible dans le Moniteur Série.",
      hint2: "Affiche la variable du niveau d'eau.",
      hint3: "Exemple : Serial.println(niveauEau);",
      marker: /Serial|niveau|r[eé]servoir/i,
      line: (_context) => /\bSerial\s*\.\s*print(?:ln)?\s*\(/,
      check: (analysis, context) => showCheck(analysis, context, "water")
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
      hint2: "Ajoute digitalWrite(PIN_RELAIS_POMPE, LOW); dans loop().",
      hint3: "Cette instruction doit aussi exister dans les cas else.",
      marker: /LOW|pompe arr[eê]t/i,
      line: digitalLow,
      last: true,
      check: analysis => {
        /* Arrêt de la pompe présent dans loop() (étape pédagogique de la boucle). */
        if (has(analysis.loop.body, RE.digLowPump)) return { ok: true };
        /* Présent uniquement dans setup() : il manque dans loop(). */
        if (has(analysis.setup.body, RE.digLowPump)) return { ok: false, message: "La pompe est arrêtée dans setup(), mais il manque son arrêt dans loop()." };
        /* Présent seulement en commentaire/chaîne. */
        if (onlyInCommentOrString(analysis, RE.digLowPump)) return { ok: false, message: "L'arrêt de la pompe dans loop() est dans un commentaire ou une chaîne et n'est pas exécuté." };
        /* Absent. */
        return { ok: false };
      }
    },
    delay: {
      label: "delay(1000);",
      hint1: "La boucle doit attendre une seconde avant de recommencer.",
      hint2: "Utilise delay(1000); en fin de loop().",
      hint3: "1000 millisecondes correspondent à une seconde.",
      marker: /1000|seconde|delay/i,
      line: /\bdelay\s*\(\s*1000(?:UL|L)?\s*\)\s*;/,
      check: analysis => {
        /* Temporisation d'une seconde dans loop(). */
        if (has(analysis.loop.body, RE.delay1000)) return { ok: true };
        /* Présente mais dans setup(). */
        if (has(analysis.setup.body, RE.delay1000)) return { ok: false, message: "delay(1000); doit être placé dans loop(), pas dans setup()." };
        /* Présente seulement en commentaire/chaîne. */
        if (onlyInCommentOrString(analysis, RE.delay1000)) return { ok: false, message: "delay(1000); est dans un commentaire ou une chaîne et n'est pas exécuté." };
        /* Absente. */
        return { ok: false };
      }
    }
  };

  /* Désignations pédagogiques des trois capteurs : sujet (« la lumière »), complément « de … » */
  /* et complément « à … » (contraction « au » gérée) pour des messages grammaticalement corrects. */
  const SENSORS = {
    humidity: { pin: pin.humidity, subject: "l'humidité du sol", of: "de l'humidité du sol", at: "à l'humidité du sol", example: "int humidite = analogRead(PIN_HUMIDITE_SOL);" },
    light: { pin: pin.light, subject: "la lumière", of: "de la lumière", at: "à la lumière", example: "int lumiere = analogRead(PIN_LUMIERE);" },
    water: { pin: pin.water, subject: "le niveau d'eau", of: "du niveau d'eau", at: "au niveau d'eau", example: "int niveauEau = analogRead(PIN_NIVEAU_EAU);" }
  };

  /* Message pédagogique dédié à un identifiant critique de l'environnement Arduino. */
  function arduinoReservedMessage(name) {
    if (name === "Serial") return "Serial est déjà utilisé par Arduino pour la communication série : choisis un autre nom pour mémoriser la mesure.";
    if (/^PIN_/.test(name)) return `${name} désigne déjà une broche dans ce programme. Choisis un autre nom pour mémoriser la mesure.`;
    if (name === "setup" || name === "loop") return `${name} est le nom d'une fonction Arduino : choisis un autre identifiant pour ta variable.`;
    return `${name} est réservé par Arduino : choisis un autre identifiant pour ta variable.`;
  }

  /* Message pédagogique associé à un identifiant invalide (name utilisé pour les cas réservés). */
  function identifierMessage(problem, name) {
    switch (problem) {
      case "space": return "Choisis un nom de variable sans espace, sans tiret et sans accent.";
      case "tiret": return "Choisis un nom de variable sans tiret : utilise seulement des lettres, des chiffres et le caractère _.";
      case "accent": return "Choisis un nom de variable sans accent : utilise seulement des lettres non accentuées, des chiffres et le caractère _.";
      case "digit": return "Un nom de variable ne peut pas commencer par un chiffre.";
      case "reserved": return `${name} est un mot réservé du langage C++ : choisis un autre identifiant.`;
      case "arduino": return arduinoReservedMessage(name);
      default: return "Ce nom de variable contient un caractère non autorisé : utilise seulement des lettres, des chiffres et le caractère _.";
    }
  }

  /* Message pédagogique lorsqu'un identifiant est déjà lié à un autre capteur (collision/écrasement). */
  function collisionMessage(key, identifier) {
    const sensor = SENSORS[key];
    const suggestion = { humidity: "humiditeSol", light: "lumiere", water: "niveauEau" }[key];
    return `La variable ${identifier} est déjà déclarée. La même variable ne doit pas mémoriser les mesures de deux capteurs différents : choisis un autre nom pour ${sensor.subject}, par exemple ${suggestion}.`;
  }

  /* Vérification contextuelle d'une lecture analogique (dans loop(), stockée, bien NOMMÉE et UNIQUE). */
  function readCheck(analysis, context, key) {
    /* Désignation du capteur. */
    const sensor = SENSORS[key];
    /* État de nommage de ce capteur (validité + collision). */
    const naming = context.naming ? context.naming[key] : null;
    /* Une affectation « … = analogRead(broche) ; » existe dans loop() : on vérifie son nom. */
    if (naming && naming.present) {
      /* Identifiant syntaxiquement invalide (espace, tiret, accent, chiffre initial, spécial, réservé). */
      if (!naming.valid) return { ok: false, message: identifierMessage(naming.problem, naming.identifier) };
      /* Identifiant déjà utilisé pour un autre capteur : mesure écrasée / redéclaration. */
      if (naming.collidesWith) return { ok: false, message: collisionMessage(key, naming.identifier) };
      /* Lecture correctement lue, stockée, nommée et distincte. */
      return { ok: true };
    }
    /* Repli sans analyse de nommage (autres séances) : présence d'une variable suffit. */
    if (!naming && context.vars[key]) return { ok: true };
    /* Lecture réalisée mais dans setup() au lieu de loop(). */
    if (analogReadPresent(analysis.setup.body, sensor.pin)) return { ok: false, message: `La lecture ${sensor.of} doit être dans loop(), pas dans setup().` };
    /* Lecture présente dans loop() mais non stockée dans une variable. */
    if (analogReadPresent(analysis.loop.body, sensor.pin)) return { ok: false, message: `Stocke la lecture ${sensor.of} dans une variable, par exemple : ${sensor.example}` };
    /* Lecture seulement en commentaire/chaîne. */
    if (analogReadPresent(analysis.original, sensor.pin) && !analogReadPresent(analysis.stripped, sensor.pin)) return { ok: false, message: `La lecture ${sensor.of} est dans un commentaire ou une chaîne et n'est pas exécutée.` };
    /* Absente. */
    return { ok: false };
  }

  /* Vérification contextuelle d'un affichage (doit afficher LA bonne variable, dans loop()). */
  function showCheck(analysis, context, key) {
    /* Désignation du capteur attendu. */
    const sensor = SENSORS[key];
    /* Variable attendue pour cet affichage. */
    const variable = context.vars[key];
    /* Affichage correct de la bonne variable dans loop(). */
    if (variable && printsVariable(analysis.loop.body, variable)) return { ok: true };
    /* Bonne variable mais affichée dans setup(). */
    if (variable && printsVariable(analysis.setup.body, variable)) return { ok: false, message: `L'affichage ${sensor.of} doit être dans loop().` };
    /* Recense les variables de capteurs RÉELLEMENT affichées dans loop(). */
    const printedSensors = Object.keys(SENSORS).filter(k => context.vars[k] && printsVariable(analysis.loop.body, context.vars[k]));
    /* Variables affichées appartenant à un AUTRE capteur que celui attendu. */
    const wrongSensors = printedSensors.filter(k => k !== key);
    /* Cas CERTAIN : une seule variable de capteur est affichée et c'est la mauvaise. */
    if (wrongSensors.length === 1 && printedSensors.length === 1) {
      return { ok: false, message: `Tu affiches ${SENSORS[wrongSensors[0]].subject} à l'étape consacrée ${sensor.at}.` };
    }
    /* Cas INCERTAIN : une mauvaise variable est affichée mais on ne peut pas l'identifier */
    /* avec certitude (plusieurs capteurs affichés) → message neutre et exact, jamais faux. */
    if (wrongSensors.length >= 1) {
      return { ok: false, message: "La variable affichée ne correspond pas à la mesure attendue pour cette étape." };
    }
    /* Aucune variable lue : il faut d'abord lire la mesure. */
    if (!variable) return { ok: false, message: `Lis d'abord la mesure ${sensor.of} dans une variable, puis affiche cette variable.` };
    /* Variable lue mais non affichée (souvent : seulement une étiquette texte). */
    return { ok: false, message: `Affiche la variable ${sensor.of} (pas seulement un texte) avec Serial.print ou Serial.println.` };
  }

  function getMission(sessionId) {
    return dataApi.getMission(Number(sessionId) || 1);
  }

  function getSteps(sessionId) {
    const mission = getMission(sessionId);
    return mission.steps.map(id => ({ id, ...stepTemplates[id] })).filter(step => step.label);
  }

  /* Neutralise UNIQUEMENT les commentaires (chemin HÉRITÉ des séances 2 à 8, inchangé). */
  function sanitize(code) {
    return String(code || "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map(line => line.replace(/\/\/.*$/, ""))
      .join("\n");
  }

  /* Extrait les variables de capteurs depuis une source donnée. */
  function extractVars(varSource) {
    return {
      humidity: analogVarIn(varSource, pin.humidity),
      light: analogVarIn(varSource, pin.light),
      water: analogVarIn(varSource, pin.water)
    };
  }

  /* Chemin HÉRITÉ (booléen sur le code sanitizé) pour les 12 modèles partagés avec la séance 1. */
  /* Ces fonctions reproduisent EXACTEMENT l'ancien mécanisme test(source) utilisé par les */
  /* séances 2 à 8 : aucune analyse de fonction, aucune extraction depuis loop(), aucun message. */
  const LEGACY_TEST = {
    include: source => RE.include.test(source),
    serialBegin: source => /\bSerial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/.test(source),
    pinMode: source => RE.pinModeOut.test(source),
    safeLowSetup: source => digitalLow.test(source),
    readHumidity: (_source, context) => Boolean(context.vars.humidity),
    readLight: (_source, context) => Boolean(context.vars.light),
    readWater: (_source, context) => Boolean(context.vars.water),
    showHumidity: (source, context) => hasSerialOutput(source, context.vars.humidity),
    showLight: (source, context) => hasSerialOutput(source, context.vars.light),
    showWater: (source, context) => hasSerialOutput(source, context.vars.water),
    pumpStop: source => digitalLow.test(source),
    delay: source => /\bdelay\s*\(\s*1000(?:UL|L)?\s*\)\s*;/.test(source)
  };

  /* Évalue une étape. La vérification CONTEXTUELLE n'est utilisée QUE pour la séance 1. */
  function evaluateStep(step, analysis, context, useContextual, legacySource) {
    /* Séance 1 uniquement : vérification contextuelle riche (fonction, variable, message). */
    if (useContextual && typeof step.check === "function") return step.check(analysis, context);
    /* Séances 2 à 8 (et repli) : ANCIEN chemin test(source) strictement préservé. */
    const legacy = LEGACY_TEST[step.id] || step.test;
    /* Applique le test hérité sur le code sanitizé (commentaires retirés). */
    if (typeof legacy === "function") return { ok: Boolean(legacy(legacySource, context)) };
    /* Aucune vérification définie. */
    return { ok: false };
  }

  function validate(code, sessionId = 1) {
    const mission = getMission(sessionId);
    /* GARDE DE PÉRIMÈTRE : l'analyse contextuelle Arduino ne s'applique QU'À la séance 1. */
    /* (Un repli sûr désactive le contexte si le module d'analyse est absent.) */
    const useContextual = Number(sessionId) === 1 && Boolean(analysisApi) && typeof analysisApi.analyze === "function";
    /* Code neutralisé (commentaires retirés) : base du chemin hérité et champ « source ». */
    const source = sanitize(code);
    /* Analyse structurelle calculée UNIQUEMENT pour la séance 1 (aucune dépendance sinon). */
    const analysis = useContextual ? analysisApi.analyze(code) : null;
    /* Variables : depuis loop() en séance 1 ; depuis tout le code sanitizé pour les séances 2 à 8. */
    const varSource = useContextual ? (analysis.loop.found ? analysis.loop.body : analysis.stripped) : source;
    /* Contexte partagé (l'analyse n'est présente qu'en séance 1). */
    /* Le nommage (validité + unicité des identifiants de lecture) n'est calculé QU'EN séance 1. */
    const context = { analysis, vars: extractVars(varSource), naming: useContextual ? analyzeNaming(varSource) : null };
    const steps = getSteps(mission.id);
    /* Évalue chaque étape avec son message pédagogique éventuel (contextuel en séance 1). */
    const stepResults = steps.map(step => {
      /* Résultat de la vérification (contextuelle en séance 1, héritée sinon). */
      const outcome = evaluateStep(step, analysis, context, useContextual, source);
      /* Compose l'étape enrichie. */
      return { ...step, ok: Boolean(outcome.ok), message: outcome.ok ? "" : (outcome.message || "") };
    });
    const constants = constantsStatus(source);
    const missingConstants = constants.filter(item => !item.ok);
    const missingSteps = stepResults.filter(item => !item.ok);
    const firstMissing = missingSteps[0] || null;
    const hasPlaceholders = /_{3,}|TODO|A_COMPLETER/i.test(code || "");
    const errors = [
      ...missingConstants.map(item => `Constante manquante : ${item.label}`),
      /* Utilise le message pédagogique contextuel lorsqu'il existe, sinon un libellé générique. */
      ...missingSteps.map(item => item.message || `Instruction manquante : ${item.label}`)
    ];
    if (hasPlaceholders) errors.unshift("Des zones à compléter sont encore présentes dans le programme.");
    const badges = Object.fromEntries(mission.badges.map(badge => [
      badge.id,
      badge.steps.every(id => stepResults.find(step => step.id === id)?.ok)
    ]));

    return {
      source,
      analysis,
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
    stepTemplates,
    /* Exposé pour les tests et l'outillage : listes déterministes des identifiants réservés. */
    reservedWords: { cpp: CPP_KEYWORDS.slice(), arduino: ARDUINO_RESERVED.slice() },
    isValidIdentifier
  };

  if (typeof window !== "undefined") window.TechnoQuestMissionValidator = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
