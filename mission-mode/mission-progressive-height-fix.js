/* TechnoQuest — réduit la fenêtre guidée à la seule progression déjà autorisée. */
"use strict";

(() => {
  /* Attend que la vue progressive et le validateur soient disponibles. */
  function waitForMission(attempt = 0) {
    /* Récupère la racine Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère l’éditeur. */
    const editor = document.getElementById("codeEditor");
    /* Récupère le niveau d’aide. */
    const helpLevel = document.getElementById("missionHelpLevel");
    /* Récupère le validateur. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe le correctif lorsque tous les éléments existent. */
    if (root && editor && helpLevel && validator) {
      /* Lance l’installation principale. */
      installHeightFix({ root, editor, helpLevel, validator });
      /* Termine l’attente. */
      return;
    }

    /* Réessaie pendant quelques secondes lorsque l’interface se construit encore. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe le calcul de hauteur sans minimum artificiel de trois lignes. */
  function installHeightFix(refs) {
    /* Évite une seconde installation. */
    if (refs.root.dataset.progressiveHeightFixReady === "true") return;
    /* Mémorise que le correctif est prêt. */
    refs.root.dataset.progressiveHeightFixReady = "true";

    /* Lit le numéro de la séance. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Regroupe les mises à jour successives. */
    let scheduledFrame = 0;

    /* Calcule et applique la hauteur correspondant aux lignes déjà révélées. */
    function updateHeight() {
      /* Ignore les autres niveaux d’aide. */
      if (refs.helpLevel.value !== "guided" || refs.root.classList.contains("mission-hidden")) return;
      /* Valide le programme courant. */
      const result = refs.validator.validate(refs.editor.value, sessionId);
      /* Lit la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Compte toutes les lignes du programme. */
      const totalLines = Math.max(1, refs.editor.value.split("\n").length);
      /* Calcule la dernière ligne autorisée. */
      const targetLineIndex = stepId
        /* Demande la ligne éditable exacte au validateur enrichi. */
        ? refs.validator.findLineForStep(refs.editor.value, stepId, result, sessionId, "edition")
        /* Révèle tout lorsque la mission est terminée. */
        : totalLines - 1;
      /* Limite la fenêtre à dix-huit lignes sans imposer trois lignes au démarrage. */
      const visibleLineCount = Math.min(18, Math.max(1, Math.round(Number(targetLineIndex) || 0) + 1));
      /* Lit les métriques du textarea. */
      const style = window.getComputedStyle(refs.editor);
      /* Convertit la hauteur de ligne. */
      const lineHeight = parseFloat(style.lineHeight) || 28;
      /* Convertit la marge supérieure. */
      const paddingTop = parseFloat(style.paddingTop) || 16;
      /* Convertit la marge inférieure. */
      const paddingBottom = parseFloat(style.paddingBottom) || 16;
      /* Calcule la hauteur exacte. */
      const height = Math.ceil(paddingTop + visibleLineCount * lineHeight + paddingBottom + 2);
      /* Remplace la valeur calculée par l’ancien minimum de trois lignes. */
      refs.root.style.setProperty("--mission-progressive-height", `${height}px`);
    }

    /* Programme la correction après les autres gestionnaires. */
    function scheduleUpdate() {
      /* Annule l’ancienne image. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Attend deux images afin de passer après le module progressif principal. */
      scheduledFrame = window.requestAnimationFrame(() => window.requestAnimationFrame(updateHeight));
    }

    /* Recalcule après chaque saisie. */
    refs.editor.addEventListener("input", scheduleUpdate);
    /* Recalcule après un changement de niveau. */
    refs.helpLevel.addEventListener("change", scheduleUpdate);
    /* Recalcule après une activation ou une restauration. */
    ["missionActivate", "missionReset", "missionCheck"].forEach(id => {
      /* Attend la fin de l’action historique. */
      document.getElementById(id)?.addEventListener("click", () => window.setTimeout(scheduleUpdate, 0));
    });
    /* Recalcule après un redimensionnement. */
    window.addEventListener("resize", scheduleUpdate);
    /* Recalcule après un passage en plein écran. */
    document.addEventListener("fullscreenchange", scheduleUpdate);
    /* Lance le premier calcul. */
    scheduleUpdate();
  }

  /* Démarre après la construction du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque nécessaire. */
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    /* Lance immédiatement l’attente. */
    waitForMission();
  }
})();
