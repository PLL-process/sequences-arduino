/* TechnoQuest — calcule sans mémoire obsolète la véritable ligne de chaque étape guidée. */
"use strict";

(() => {
  /* Récupère le validateur déjà chargé. */
  const validator = window.TechnoQuestMissionValidator;
  /* Arrête le module lorsque le validateur est absent. */
  if (!validator || typeof validator.findLineForStep !== "function") return;

  /* Conserve la recherche précédente pour les autres modes et les cas de secours. */
  const originalFindLineForStep = validator.findLineForStep.bind(validator);

  /* Associe chaque étape de la séance 1 à un commentaire précis. */
  const SESSION_ONE_ANCHORS = {
    /* La bibliothèque se saisit sur la LIGNE VIDE dédiée, juste sous son commentaire. */
    include: { comment: /Charger ici la biblioth[eè]que de base Arduino/i },
    /* La communication série se saisit immédiatement sous son commentaire. */
    serialBegin: { comment: /Initialiser le Moniteur S[ée]rie à 9600 bauds/i },
    /* La configuration du relais possède son propre commentaire. */
    pinMode: { comment: /Configurer D6 en sortie/i },
    /* L'état sûr de démarrage possède son propre commentaire. */
    safeLowSetup: { comment: /Garder la pompe arr[eê]t[eé]e au d[ée]marrage/i },
    /* Chaque lecture de capteur pointe vers son commentaire exact. */
    readHumidity: { comment: /Lire l'humidit[eé] du sol sur A0/i },
    /* La lecture de lumière ne peut plus être confondue avec un autre objectif. */
    readLight: { comment: /Lire la lumi[eè]re sur A1/i },
    /* La lecture du réservoir utilise son commentaire propre. */
    readWater: { comment: /Lire le niveau d'eau sur A2/i },
    /* Chaque affichage vise la LIGNE VIDE située sous la ligne Serial.print("Libellé : ") */
    /* préremplie et protégée : c'est là que l'élève écrit Serial.println(variable);. */
    showHumidity: { comment: /Afficher l'humidit[eé] du sol dans le Moniteur s[ée]rie/i, answerAfterLabel: /Serial\s*\.\s*print\s*\(\s*"[^"]*[Hh]umidit/i },
    /* L'affichage de lumière possède une cible distincte. */
    showLight: { comment: /Afficher la lumi[eè]re dans le Moniteur s[ée]rie/i, answerAfterLabel: /Serial\s*\.\s*print\s*\(\s*"[^"]*[Ll]umi/i },
    /* L'affichage du niveau d'eau possède une cible distincte. */
    showWater: { comment: /Afficher le niveau d'eau dans le Moniteur s[ée]rie/i, answerAfterLabel: /Serial\s*\.\s*print\s*\(\s*"[^"]*[Nn]iveau/i },
    /* L'arrêt de sécurité dans loop possède une cible distincte du setup. */
    pumpStop: { comment: /Garder la pompe arr[eê]t[eé]e pendant cette s[ée]ance|Garder la pompe arr[eê]t[eé]e\.?$/i },
    /* La temporisation se saisit sous son commentaire exact. */
    delay: { comment: /Attendre une seconde/i }
  };

  /* Indique si le niveau Guidé est actuellement sélectionné. */
  function guidedModeEnabled() {
    /* Lit la valeur du sélecteur dynamique. */
    return document.getElementById("missionHelpLevel")?.value === "guided";
  }

  /* Ramène une ligne dans les limites du programme. */
  function clampLine(code, lineIndex) {
    /* Calcule la dernière ligne disponible. */
    const maximumLine = Math.max(0, String(code || "").split("\n").length - 1);
    /* Retourne un entier valide. */
    return Math.max(0, Math.min(maximumLine, Math.round(Number(lineIndex) || 0)));
  }

  /* Teste une expression régulière sans conserver son ancien index. */
  function matches(pattern, text) {
    /* Refuse un motif absent. */
    if (!pattern) return false;
    /* Réinitialise les expressions régulières globales. */
    pattern.lastIndex = 0;
    /* Retourne le résultat du test. */
    return pattern.test(String(text || ""));
  }

  /* Recherche la LIGNE VIDE de réponse située juste sous une ligne « Serial.print("Libellé : ") » */
  /* préremplie et protégée. Le commentaire sert d'ancre de bloc ; le libellé sert de repère. */
  /* La ligne de réponse est celle qui suit immédiatement le libellé, jamais le libellé lui-même. */
  function answerLineAfterLabel(lines, commentPattern, labelPattern) {
    /* Parcourt le programme à la recherche du commentaire de bloc. */
    for (let index = 0; index < lines.length; index += 1) {
      /* Ignore les lignes qui ne correspondent pas au commentaire attendu. */
      if (!matches(commentPattern, lines[index])) continue;
      /* Examine quelques lignes suivantes pour trouver le libellé prérempli. */
      for (let candidate = index + 1; candidate <= Math.min(lines.length - 1, index + 6); candidate += 1) {
        /* Le libellé Serial.print("…") repère l'emplacement ; la réponse est juste en dessous. */
        if (matches(labelPattern, lines[candidate])) return Math.min(lines.length - 1, candidate + 1);
        /* Ne traverse jamais une accolade ni une nouvelle fonction. */
        if (/^(?:[{}]|void\s+(?:setup|loop)\s*\()/.test(String(lines[candidate] || "").trim())) break;
      }
    }
    /* Signale qu'aucune cible précise n'a été trouvée. */
    return null;
  }

  /* Recherche la première ligne de saisie placée sous un commentaire précis. */
  function lineAfterComment(lines, pattern) {
    /* Parcourt le programme dans son ordre naturel. */
    for (let index = 0; index < lines.length; index += 1) {
      /* Ignore les lignes qui ne correspondent pas au commentaire attendu. */
      if (!matches(pattern, lines[index])) continue;
      /* Examine les trois lignes suivantes pour tolérer un espacement pédagogique. */
      for (let candidate = index + 1; candidate <= Math.min(lines.length - 1, index + 3); candidate += 1) {
        /* Lit la ligne candidate sans espaces périphériques. */
        const trimmed = String(lines[candidate] || "").trim();
        /* Ignore un éventuel second commentaire. */
        if (trimmed.startsWith("//")) continue;
        /* Refuse de traverser une accolade ou une nouvelle fonction. */
        if (/^(?:[{}]|void\s+(?:setup|loop)\s*\()/.test(trimmed)) break;
        /* Retourne la première ligne réellement éditable. */
        return candidate;
      }
    }
    /* Signale qu'aucune cible précise n'a été trouvée. */
    return null;
  }

  /* Recherche une cible propre à la séance 1. */
  function sessionOneTarget(code, stepId) {
    /* Récupère la définition précise de l'étape. */
    const anchor = SESSION_ONE_ANCHORS[stepId];
    /* Signale l'absence de définition spéciale. */
    if (!anchor) return null;
    /* Découpe le programme en lignes. */
    const lines = String(code || "").split("\n");
    /* Retourne directement la ligne prévue lorsqu'elle est fixe. */
    if (Number.isInteger(anchor.directLine)) return clampLine(code, anchor.directLine);
    /* Affichage : la réponse est la ligne vide sous le libellé Serial.print("…") prérempli. */
    if (anchor.answerAfterLabel) {
      const afterLabel = answerLineAfterLabel(lines, anchor.comment, anchor.answerAfterLabel);
      if (afterLabel !== null) return afterLabel;
    }
    /* Recherche la ligne située juste sous le commentaire exact. */
    return lineAfterComment(lines, anchor.comment);
  }

  /* Retourne la ligne actuelle à partir du programme réellement validé. */
  function currentGuidedTarget(code, sessionId = 1) {
    /* Valide le programme courant. */
    const result = validator.validate(code, sessionId);
    /* Lit la première étape encore incomplète. */
    const stepId = result.firstMissing?.id || null;
    /* Signale une mission terminée. */
    if (!stepId) return { result, stepId: null, lineIndex: null };
    /* Calcule la ligne avec la méthode enrichie ci-dessous. */
    const lineIndex = validator.findLineForStep(code, stepId, result, sessionId, "edition");
    /* Retourne un état complet et immédiatement exploitable. */
    return { result, stepId, lineIndex };
  }

  /* Remplace la recherche par une cible précise recalculée à chaque appel. */
  validator.findLineForStep = function findExactGuidedLine(code, stepId, result, sessionId = 1, mode = "edition") {
    /* Laisse la simulation et les autres niveaux utiliser le comportement normal. */
    if (mode !== "edition" || !guidedModeEnabled() || !stepId) {
      /* Délègue au validateur précédent. */
      return originalFindLineForStep(code, stepId, result, sessionId, mode);
    }

    /* Recherche d'abord une cible précise pour la séance 1. */
    const exactTarget = sessionId === 1 ? sessionOneTarget(code, stepId) : null;
    /* Utilise le validateur historique seulement lorsqu'aucune cible précise n'existe. */
    const fallbackTarget = exactTarget === null
      ? originalFindLineForStep(code, stepId, result, sessionId, mode)
      : exactTarget;
    /* Retourne une ligne sécurisée sans réutiliser une ancienne étape mémorisée. */
    return clampLine(code, fallbackTarget);
  };

  /* Expose un calcul centralisé pour la flèche, le défilement et les tests. */
  window.TechnoQuestMissionGuidedTarget = {
    /* Retourne l'état courant sans cache. */
    getCurrent: (code, sessionId = 1) => currentGuidedTarget(code, sessionId),
    /* Conserve une méthode de compatibilité pour les anciens modules. */
    getStepId: () => currentGuidedTarget(document.getElementById("codeEditor")?.value || "", Number(document.body.dataset.session || 1)).stepId,
    /* Conserve une méthode de compatibilité pour les anciens modules. */
    getLineIndex: () => currentGuidedTarget(document.getElementById("codeEditor")?.value || "", Number(document.body.dataset.session || 1)).lineIndex,
    /* La version sans mémoire n'a plus besoin d'une réinitialisation. */
    reset: () => undefined
  };
})();
