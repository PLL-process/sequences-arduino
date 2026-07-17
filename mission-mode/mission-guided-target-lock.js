/* TechnoQuest — stabilise la ligne pédagogique du mode Guidé jusqu’à validation. */
"use strict";

(() => {
  /* Récupère le validateur déjà chargé par le mode Mission. */
  const validator = window.TechnoQuestMissionValidator;
  /* Arrête le correctif lorsque le validateur n’est pas disponible. */
  if (!validator || typeof validator.findLineForStep !== "function") return;

  /* Conserve la méthode enrichie installée par mission-caret-sync.js. */
  const originalFindLineForStep = validator.findLineForStep.bind(validator);
  /* Mémorise l’étape actuellement verrouillée. */
  let lockedStepId = null;
  /* Mémorise la ligne éditable associée à cette étape. */
  let lockedLineIndex = null;

  /* Indique si le niveau d’aide Guidé est sélectionné. */
  function guidedModeEnabled() {
    /* Lit la valeur du sélecteur lorsqu’il existe. */
    return document.getElementById("missionHelpLevel")?.value === "guided";
  }

  /* Ramène un index dans les limites du programme courant. */
  function clampLine(code, lineIndex) {
    /* Calcule le dernier index de ligne disponible. */
    const maximumLine = Math.max(0, String(code || "").split("\n").length - 1);
    /* Retourne un entier compris entre zéro et la dernière ligne. */
    return Math.max(0, Math.min(maximumLine, Math.round(Number(lineIndex) || 0)));
  }

  /* Détermine si une ligne appartient au squelette et ne doit pas recevoir la saisie. */
  function structuralLine(text) {
    /* Retire les espaces placés autour du texte. */
    const trimmed = String(text || "").trim();
    /* Considère les accolades, fonctions et constantes déjà fournies comme structurelles. */
    return /^(?:[{}]|void\s+(?:setup|loop)\s*\(|const\s+int\b)/.test(trimmed);
  }

  /* Corrige une cible qui pointerait encore sur la ligne de commentaire. */
  function editableLineNear(code, rawLineIndex) {
    /* Découpe le programme en lignes. */
    const lines = String(code || "").split("\n");
    /* Sécurise l’index proposé par le validateur. */
    const safeRawLine = clampLine(code, rawLineIndex);
    /* Lit la ligne proposée. */
    const rawText = String(lines[safeRawLine] || "").trim();
    /* Conserve la cible lorsqu’elle n’est pas un commentaire. */
    if (!rawText.startsWith("//")) return safeRawLine;

    /* Limite la recherche aux quatre lignes qui suivent la consigne. */
    const lastCandidate = Math.min(lines.length - 1, safeRawLine + 4);
    /* Recherche la première véritable ligne de saisie sous le commentaire. */
    for (let index = safeRawLine + 1; index <= lastCandidate; index += 1) {
      /* Lit le contenu sans espaces périphériques. */
      const candidate = String(lines[index] || "").trim();
      /* Ignore une autre ligne de commentaire. */
      if (candidate.startsWith("//")) continue;
      /* Ignore une ligne structurelle déjà fournie dans le squelette. */
      if (structuralLine(candidate)) break;
      /* Retourne la ligne vide, partiellement saisie ou marquée à compléter. */
      return index;
    }

    /* Utilise la proposition initiale lorsqu’aucune zone éditable n’est trouvée. */
    return safeRawLine;
  }

  /* Oublie la cible afin que la prochaine étape soit recalculée. */
  function resetLock() {
    /* Réinitialise l’identifiant de l’étape. */
    lockedStepId = null;
    /* Réinitialise le numéro de ligne. */
    lockedLineIndex = null;
  }

  /* Remplace la recherche de ligne par une recherche stable en mode Guidé. */
  validator.findLineForStep = function findStableGuidedLine(code, stepId, result, sessionId = 1, mode = "edition") {
    /* Laisse la simulation et les autres niveaux utiliser le comportement normal. */
    if (mode !== "edition" || !guidedModeEnabled() || !stepId) {
      /* Délègue le calcul au validateur précédent. */
      return originalFindLineForStep(code, stepId, result, sessionId, mode);
    }

    /* Réutilise la même ligne tant que la première étape manquante ne change pas. */
    if (stepId === lockedStepId && Number.isInteger(lockedLineIndex)) {
      /* Ramène la ligne mémorisée dans les limites du texte actuel. */
      lockedLineIndex = clampLine(code, lockedLineIndex);
      /* Retourne la cible verrouillée. */
      return lockedLineIndex;
    }

    /* Calcule la ligne proposée pour la nouvelle étape. */
    const rawLineIndex = originalFindLineForStep(code, stepId, result, sessionId, mode);
    /* Déplace éventuellement la cible du commentaire vers la ligne éditable située dessous. */
    const editableLineIndex = editableLineNear(code, rawLineIndex);
    /* Mémorise la nouvelle étape. */
    lockedStepId = stepId;
    /* Mémorise sa ligne éditable. */
    lockedLineIndex = editableLineIndex;
    /* Retourne la nouvelle cible stable. */
    return lockedLineIndex;
  };

  /* Expose un état en lecture seule pour les tests et les repères visuels. */
  window.TechnoQuestMissionGuidedTarget = {
    /* Retourne l’étape actuellement verrouillée. */
    getStepId: () => lockedStepId,
    /* Retourne la ligne verrouillée sous forme d’index commençant à zéro. */
    getLineIndex: () => lockedLineIndex,
    /* Permet aux restaurations explicites de demander un nouveau calcul. */
    reset: resetLock
  };

  /* Attend que le document soit construit pour connecter les boutons dynamiques. */
  function connectResetEvents() {
    /* Récupère le sélecteur du niveau d’aide. */
    const helpLevel = document.getElementById("missionHelpLevel");
    /* Oublie la cible lors d’un changement de niveau. */
    helpLevel?.addEventListener("change", resetLock, true);

    /* Liste les actions qui remplacent ou restaurent le squelette. */
    ["missionActivate", "missionReset"].forEach(id => {
      /* Récupère le bouton correspondant. */
      const button = document.getElementById(id);
      /* Oublie la cible avant l’action afin de recalculer la première ligne vide. */
      button?.addEventListener("click", resetLock, true);
    });
  }

  /* Connecte les événements après la construction de l’interface. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque le document est encore en cours de lecture. */
    document.addEventListener("DOMContentLoaded", connectResetEvents);
  } else {
    /* Connecte immédiatement les événements lorsque le document est prêt. */
    connectResetEvents();
  }
})();
