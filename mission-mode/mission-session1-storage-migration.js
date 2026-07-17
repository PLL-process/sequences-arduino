/* TechnoQuest — migration unique des anciennes sauvegardes de la séance 1. */
"use strict";

(() => {
  /* Utilise la même clé que le contrôleur du mode Mission. */
  const STORAGE_KEY = "technoquest-mission-v1";
  /* Identifie cette nouvelle structure progressive de la séance 1. */
  const MIGRATION_VERSION = "session-1-progressive-guided-v3";

  /* Lit prudemment l’ancienne sauvegarde. */
  function loadStore() {
    /* Protège l’application contre une valeur JSON invalide. */
    try {
      /* Retourne l’objet mémorisé ou un objet vide. */
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      /* Retourne un objet vide lorsque la sauvegarde est illisible. */
      return {};
    }
  }

  /* Charge la sauvegarde actuelle. */
  const store = loadStore();
  /* Crée la zone des versions de structure si elle n’existe pas. */
  store.structureVersions = store.structureVersions || {};

  /* Ne modifie rien lorsque cette migration a déjà été appliquée. */
  if (store.structureVersions.session1 === MIGRATION_VERSION) return;

  /* Crée la collection des séances lorsque nécessaire. */
  store.sessions = store.sessions || {};
  /* Récupère l’état précédent de la séance 1. */
  const previousState = store.sessions[1] || {};

  /* Conserve les préférences utiles mais retire le code devenu incompatible. */
  store.sessions[1] = {
    /* Conserve l’ouverture automatique du mode Mission. */
    modeMission: Boolean(previousState.modeMission),
    /* Redémarre en niveau Guidé pour tester la révélation progressive. */
    helpMode: "guided",
    /* Replace la progression sur la première instruction. */
    activeStep: "include",
    /* Réinitialise les badges liés à l’ancien programme. */
    badges: {},
    /* Conserve les valeurs de capteurs éventuellement réglées. */
    values: previousState.values || {},
    /* Conserve la réflexion écrite par l’élève. */
    reflection: previousState.reflection || "",
    /* Force le contrôleur à recréer le nouveau squelette. */
    code: "",
    /* Indique qu’aucune tentative n’a encore été faite avec ce nouveau squelette. */
    attempted: false
  };

  /* Supprime également l’ancien format historique utilisé avant sessions[1]. */
  delete store.code;
  /* Supprime l’ancien niveau d’aide historique. */
  delete store.helpMode;
  /* Supprime l’ancienne étape historique. */
  delete store.activeStep;
  /* Supprime les anciens badges historiques. */
  delete store.badges;
  /* Supprime l’ancien indicateur de tentative. */
  delete store.attempted;

  /* Mémorise que la migration a été effectuée une seule fois. */
  store.structureVersions.session1 = MIGRATION_VERSION;
  /* Enregistre le nouvel état avant le chargement du contrôleur Mission. */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
})();
