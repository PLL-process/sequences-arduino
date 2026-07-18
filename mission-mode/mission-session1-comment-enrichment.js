/* TechnoQuest — enrichit une ancienne sauvegarde sans effacer les réponses de l'élève. */
"use strict";

(() => {
  /* Utilise la clé historique du mode Mission. */
  const STORAGE_KEY = "technoquest-mission-v1";
  /* Identifie cette migration non destructive. */
  const COMMENT_VERSION = "session-1-comments-v1";

  /* Lit prudemment la sauvegarde locale. */
  function loadStore() {
    /* Protège l'application contre un JSON invalide. */
    try {
      /* Retourne la sauvegarde ou un objet vide. */
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      /* Retourne un objet vide lorsque la sauvegarde est illisible. */
      return {};
    }
  }

  /* Ajoute un commentaire seulement lorsque la ligne de code existe et n'en possède pas déjà. */
  function appendComment(line, pattern, comment) {
    /* Ignore les lignes qui ne correspondent pas à l'instruction attendue. */
    if (!pattern.test(line)) return line;
    /* Préserve une explication déjà présente. */
    if (/\/\//.test(line)) return line;
    /* Ajoute l'explication à droite sans déplacer les numéros de ligne. */
    return `${line.replace(/\s+$/, "")} // ${comment}`;
  }

  /* Enrichit les lignes structurelles sans ajouter ni supprimer de ligne. */
  function enrichCode(code) {
    /* Découpe le programme afin de conserver exactement sa structure verticale. */
    const lines = String(code || "").split("\n");
    /* Mémorise si la prochaine accolade fermante termine setup(). */
    let insideSetup = false;
    /* Mémorise si la prochaine accolade fermante termine loop(). */
    let insideLoop = false;

    /* Transforme chaque ligne séparément. */
    return lines.map(line => {
      /* Travaille d'abord sur une copie locale. */
      let enriched = line;
      /* Explique la bibliothèque lorsque l'élève l'a déjà saisie. */
      enriched = appendComment(enriched, /^\s*#\s*include\s*<\s*Arduino\.h\s*>/i, "Charge la bibliothèque de base Arduino.");
      /* Explique le rôle de la broche A0. */
      enriched = appendComment(enriched, /^\s*const\s+int\s+PIN_HUMIDITE_SOL\s*=\s*A0\s*;/, "A0 reçoit la mesure d'humidité du sol.");
      /* Explique le rôle de la broche A1. */
      enriched = appendComment(enriched, /^\s*const\s+int\s+PIN_LUMIERE\s*=\s*A1\s*;/, "A1 reçoit la mesure de lumière.");
      /* Explique le rôle de la broche A2. */
      enriched = appendComment(enriched, /^\s*const\s+int\s+PIN_NIVEAU_EAU\s*=\s*A2\s*;/, "A2 reçoit le niveau d'eau du réservoir.");
      /* Explique le rôle de la sortie D6. */
      enriched = appendComment(enriched, /^\s*const\s+int\s+PIN_RELAIS_POMPE\s*=\s*6\s*;/, "D6 commande le relais de la pompe.");

      /* Détecte l'ouverture de setup(). */
      if (/^\s*void\s+setup\s*\(\s*\)\s*\{/.test(enriched)) {
        /* Ajoute l'explication sans décaler les lignes. */
        enriched = appendComment(enriched, /^\s*void\s+setup\s*\(\s*\)\s*\{/, "S'exécute une seule fois au démarrage.");
        /* Mémorise la fonction ouverte. */
        insideSetup = true;
        /* Ferme l'autre contexte éventuel. */
        insideLoop = false;
      }

      /* Détecte l'ouverture de loop(). */
      if (/^\s*void\s+loop\s*\(\s*\)\s*\{/.test(enriched)) {
        /* Ajoute l'explication sans décaler les lignes. */
        enriched = appendComment(enriched, /^\s*void\s+loop\s*\(\s*\)\s*\{/, "Recommence continuellement les mesures.");
        /* Mémorise la fonction ouverte. */
        insideLoop = true;
        /* Ferme l'autre contexte éventuel. */
        insideSetup = false;
      }

      /* Explique une accolade fermante isolée selon la fonction en cours. */
      if (/^\s*}\s*$/.test(enriched)) {
        /* Ajoute le nom de la fonction terminée. */
        if (insideSetup) enriched = `${enriched} // Fin de setup().`;
        /* Ajoute le nom de la fonction terminée. */
        else if (insideLoop) enriched = `${enriched} // Fin de loop().`;
        /* Ferme les deux contextes. */
        insideSetup = false;
        /* Ferme les deux contextes. */
        insideLoop = false;
      }

      /* Retourne la ligne enrichie. */
      return enriched;
    }).join("\n");
  }

  /* Charge la sauvegarde actuelle. */
  const store = loadStore();
  /* Crée la collection des versions d'enrichissement. */
  store.commentVersions = store.commentVersions || {};
  /* Arrête lorsque cette migration a déjà été appliquée. */
  if (store.commentVersions.session1 === COMMENT_VERSION) return;
  /* Récupère la séance 1 lorsqu'elle existe. */
  const sessionState = store.sessions?.[1];

  /* Enrichit uniquement une progression réellement sauvegardée. */
  if (sessionState && typeof sessionState.code === "string" && sessionState.code.trim()) {
    /* Conserve toutes les réponses et tous les retours à la ligne. */
    sessionState.code = enrichCode(sessionState.code);
  }

  /* Mémorise que l'enrichissement non destructif a été effectué. */
  store.commentVersions.session1 = COMMENT_VERSION;
  /* Enregistre la sauvegarde enrichie avant la création de l'interface. */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
})();
