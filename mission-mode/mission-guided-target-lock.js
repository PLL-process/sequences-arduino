/* TechnoQuest — verrouille chaque étape guidée sur sa véritable ligne de saisie. */
"use strict";

(() => {
  /* Récupère le validateur déjà chargé. */
  const validator = window.TechnoQuestMissionValidator;
  /* Arrête le module lorsque le validateur est absent. */
  if (!validator || typeof validator.findLineForStep !== "function") return;

  /* Conserve la recherche précédente pour les autres modes et les cas de secours. */
  const originalFindLineForStep = validator.findLineForStep.bind(validator);
  /* Mémorise l’étape verrouillée. */
  let lockedStepId = null;
  /* Mémorise la ligne de saisie verrouillée. */
  let lockedLineIndex = null;

  /* Associe chaque étape de la séance 1 à un commentaire suffisamment précis. */
  const SESSION_ONE_ANCHORS = {
    /* La bibliothèque se saisit sur la toute première ligne vide. */
    include: { directLine: 0 },
    /* La communication série se saisit immédiatement sous son commentaire. */
    serialBegin: { comment: /Initialiser le Moniteur S[ée]rie à 9600 bauds/i },
    /* La configuration du relais possède désormais son propre commentaire. */
    pinMode: { comment: /Configurer D6 en sortie/i },
    /* L’état sûr de démarrage possède également son propre commentaire. */
    safeLowSetup: { comment: /Garder la pompe arr[eê]t[eé]e au d[ée]marrage/i },
    /* Chaque lecture de capteur pointe vers son commentaire exact. */
    readHumidity: { comment: /Lire l'humidit[eé] du sol sur A0/i },
    /* La lecture de lumière ne peut plus être confondue avec les objectifs généraux. */
    readLight: { comment: /Lire la lumi[eè]re sur A1/i },
    /* La lecture du réservoir utilise son commentaire propre. */
    readWater: { comment: /Lire le niveau d'eau sur A2/i },
    /* Chaque affichage série est séparé afin de progresser une ligne à la fois. */
    showHumidity: { comment: /Afficher l'humidit[eé] dans le Moniteur S[ée]rie/i },
    /* L’affichage de lumière possède une cible distincte. */
    showLight: { comment: /Afficher la lumi[eè]re dans le Moniteur S[ée]rie/i },
    /* L’affichage du niveau d’eau possède une cible distincte. */
    showWater: { comment: /Afficher le niveau d'eau dans le Moniteur S[ée]rie/i },
    /* L’arrêt de sécurité dans loop possède une cible distincte du setup. */
    pumpStop: { comment: /Garder la pompe arr[eê]t[eé]e\.?$/i },
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

  /* Recherche la première ligne de saisie placée sous un commentaire précis. */
  function lineAfterComment(lines, pattern) {
    /* Parcourt le programme dans son ordre naturel. */
    for (let index = 0; index < lines.length; index += 1) {
      /* Ignore les lignes qui ne correspondent pas au commentaire attendu. */
      if (!matches(pattern, lines[index])) continue;
      /* Examine les deux lignes suivantes afin de tolérer une ligne blanche supplémentaire. */
      for (let candidate = index + 1; candidate <= Math.min(lines.length - 1, index + 2); candidate += 1) {
        /* Lit la ligne candidate sans espaces périphériques. */
        const trimmed = String(lines[candidate] || "").trim();
        /* Ignore un second commentaire éventuel. */
        if (trimmed.startsWith("//")) continue;
        /* Refuse de traverser une accolade ou une nouvelle fonction. */
        if (/^(?:[{}]|void\s+(?:setup|loop)\s*\()/.test(trimmed)) break;
        /* Retourne la première ligne réellement éditable. */
        return candidate;
      }
    }
    /* Signale qu’aucune cible précise n’a été trouvée. */
    return null;
  }

  /* Recherche une cible propre à la séance 1. */
  function sessionOneTarget(code, stepId) {
    /* Récupère la définition précise de l’étape. */
    const anchor = SESSION_ONE_ANCHORS[stepId];
    /* Signale l’absence de définition spéciale. */
    if (!anchor) return null;
    /* Découpe le programme en lignes. */
    const lines = String(code || "").split("\n");
    /* Retourne directement la ligne prévue lorsqu’elle est fixe. */
    if (Number.isInteger(anchor.directLine)) return clampLine(code, anchor.directLine);
    /* Recherche la ligne située juste sous le commentaire exact. */
    return lineAfterComment(lines, anchor.comment);
  }

  /* Oublie la cible afin de recalculer une nouvelle structure. */
  function resetLock() {
    /* Réinitialise l’étape. */
    lockedStepId = null;
    /* Réinitialise la ligne. */
    lockedLineIndex = null;
  }

  /* Remplace la recherche par une cible stable et précise en mode Guidé. */
  validator.findLineForStep = function findStableGuidedLine(code, stepId, result, sessionId = 1, mode = "edition") {
    /* Laisse la simulation et les autres niveaux utiliser le comportement normal. */
    if (mode !== "edition" || !guidedModeEnabled() || !stepId) {
      /* Délègue au validateur précédent. */
      return originalFindLineForStep(code, stepId, result, sessionId, mode);
    }

    /* Réutilise exactement la même ligne tant que l’étape n’est pas validée. */
    if (stepId === lockedStepId && Number.isInteger(lockedLineIndex)) {
      /* Sécurise la ligne après une modification du texte. */
      lockedLineIndex = clampLine(code, lockedLineIndex);
      /* Retourne la ligne verrouillée. */
      return lockedLineIndex;
    }

    /* Recherche d’abord une cible précise pour la séance 1. */
    const exactTarget = sessionId === 1 ? sessionOneTarget(code, stepId) : null;
    /* Utilise le validateur historique seulement lorsqu’aucune cible précise n’existe. */
    const fallbackTarget = exactTarget === null
      ? originalFindLineForStep(code, stepId, result, sessionId, mode)
      : exactTarget;

    /* Mémorise la nouvelle étape. */
    lockedStepId = stepId;
    /* Mémorise sa ligne réelle de saisie. */
    lockedLineIndex = clampLine(code, fallbackTarget);
    /* Retourne la cible stable. */
    return lockedLineIndex;
  };

  /* Expose l’état pour les tests et les repères visuels. */
  window.TechnoQuestMissionGuidedTarget = {
    /* Retourne l’étape verrouillée. */
    getStepId: () => lockedStepId,
    /* Retourne l’index de la ligne verrouillée. */
    getLineIndex: () => lockedLineIndex,
    /* Permet une réinitialisation explicite. */
    reset: resetLock
  };

  /* Connecte les actions qui remplacent le squelette. */
  function connectResetEvents() {
    /* Oublie la cible lors d’un changement de niveau. */
    document.getElementById("missionHelpLevel")?.addEventListener("change", resetLock, true);
    /* Oublie la cible avant une activation ou une restauration. */
    ["missionActivate", "missionReset"].forEach(id => {
      /* Connecte le bouton lorsqu’il existe. */
      document.getElementById(id)?.addEventListener("click", resetLock, true);
    });
  }

  /* Attend la construction du document. */
  if (document.readyState === "loading") {
    /* Connecte les événements après DOMContentLoaded. */
    document.addEventListener("DOMContentLoaded", connectResetEvents);
  } else {
    /* Connecte immédiatement les événements. */
    connectResetEvents();
  }
})();
