/* TechnoQuest — révélation progressive fiable avec suivi automatique de la ligne active. */
"use strict";

(() => {
  /* Limite la fenêtre de travail à dix-huit lignes lorsqu’un programme devient long. */
  const MAX_VISIBLE_LINES = 18;
  /* Attend la fin de la transition CSS avant un second alignement de sécurité. */
  const LAYOUT_SETTLE_DELAY = 460;

  /* Attend la construction dynamique complète du mode Mission. */
  function waitForMission(attempt = 0) {
    /* Récupère la racine du mode Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère la véritable zone de saisie. */
    const editor = document.getElementById("codeEditor");
    /* Récupère le cadre commun de l’éditeur. */
    const shell = document.getElementById("missionCodeShell");
    /* Récupère la colonne des numéros de ligne. */
    const lineNumbers = document.getElementById("missionLineNumbers");
    /* Récupère le sélecteur du niveau d’aide. */
    const helpLevel = document.getElementById("missionHelpLevel");
    /* Récupère le validateur pédagogique. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe le module lorsque tous les éléments existent. */
    if (root && editor && shell && lineNumbers && helpLevel && validator) {
      /* Lance l’installation principale. */
      installProgressiveReveal({ root, editor, shell, lineNumbers, helpLevel, validator });
      /* Termine l’attente. */
      return;
    }

    /* Réessaie pendant quelques secondes lorsque l’interface se construit encore. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe le calcul des lignes visibles et le suivi automatique du commentaire actif. */
  function installProgressiveReveal(refs) {
    /* Évite une seconde installation. */
    if (refs.root.dataset.progressiveRevealV2Ready === "true") return;
    /* Mémorise que cette version est active. */
    refs.root.dataset.progressiveRevealV2Ready = "true";

    /* Lit le numéro de la séance. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Mémorise la dernière étape afin de détecter une progression. */
    let previousStepId = null;
    /* Mémorise la dernière ligne révélée. */
    let previousTargetLineIndex = null;
    /* Mémorise le défilement maximal autorisé. */
    let maximumAllowedScrollTop = Number.POSITIVE_INFINITY;
    /* Empêche une boucle pendant un repositionnement automatique. */
    let correctingScroll = false;
    /* Regroupe les mises à jour successives. */
    let scheduledFrame = 0;
    /* Mémorise le minuteur du second alignement. */
    let settleTimer = 0;
    /* Mémorise le minuteur de l’animation. */
    let animationTimer = 0;

    /* Indique si le mode Guidé progressif est actif et visible. */
    function guidedModeEnabled() {
      /* Vérifie le niveau et la visibilité du mode Mission. */
      return refs.helpLevel.value === "guided" && !refs.root.classList.contains("mission-hidden");
    }

    /* Lit les métriques typographiques réellement appliquées au textarea. */
    function readMetrics() {
      /* Récupère les styles calculés. */
      const style = window.getComputedStyle(refs.editor);
      /* Convertit la hauteur d’une ligne. */
      const lineHeight = Number.parseFloat(style.lineHeight) || 28;
      /* Convertit la marge intérieure supérieure. */
      const paddingTop = Number.parseFloat(style.paddingTop) || 16;
      /* Convertit la marge intérieure inférieure. */
      const paddingBottom = Number.parseFloat(style.paddingBottom) || 16;
      /* Retourne les mesures utiles. */
      return { lineHeight, paddingTop, paddingBottom };
    }

    /* Calcule l’étape active et sa véritable ligne de saisie. */
    function currentProgress() {
      /* Valide le programme actuel. */
      const result = refs.validator.validate(refs.editor.value, sessionId);
      /* Lit la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Compte toutes les lignes du squelette interne. */
      const totalLines = Math.max(1, refs.editor.value.split("\n").length);

      /* Révèle tout lorsque la mission est terminée. */
      if (!stepId) {
        /* Retourne la dernière ligne comme limite finale. */
        return { result, stepId: null, targetLineIndex: totalLines - 1, totalLines, complete: true };
      }

      /* Demande au validateur enrichi la véritable ligne éditable. */
      const rawLineIndex = refs.validator.findLineForStep(
        refs.editor.value,
        stepId,
        result,
        sessionId,
        "edition"
      );
      /* Ramène cette ligne dans les limites du programme. */
      const targetLineIndex = Math.max(0, Math.min(totalLines - 1, Math.round(Number(rawLineIndex) || 0)));
      /* Retourne la progression courante. */
      return { result, stepId, targetLineIndex, totalLines, complete: false };
    }

    /* Masque les numéros appartenant aux étapes futures. */
    function updateLineNumberVisibility(lastVisibleLineIndex, complete) {
      /* Parcourt les numéros recréés par le contrôleur Mission. */
      Array.from(refs.lineNumbers.children).forEach((number, index) => {
        /* Masque uniquement les lignes encore interdites. */
        number.classList.toggle("mission-line-future", !complete && index > lastVisibleLineIndex);
      });
    }

    /* Anime brièvement la nouvelle étape. */
    function animateNewStep() {
      /* Arrête l’ancien minuteur. */
      window.clearTimeout(animationTimer);
      /* Retire la classe avant de relancer l’animation. */
      refs.shell.classList.remove("mission-progressive-step-change");
      /* Attend une image de rendu. */
      window.requestAnimationFrame(() => {
        /* Active l’animation. */
        refs.shell.classList.add("mission-progressive-step-change");
        /* Programme sa fin. */
        animationTimer = window.setTimeout(() => {
          /* Retire la classe d’animation. */
          refs.shell.classList.remove("mission-progressive-step-change");
        }, 760);
      });
    }

    /* Calcule le défilement réellement nécessaire pour voir la ligne active en entier. */
    function desiredScrollTop(progress, metrics) {
      /* Autorise le défilement natif complet lorsque la mission est terminée. */
      if (progress.complete) return Math.max(0, refs.editor.scrollHeight - refs.editor.clientHeight);
      /* Calcule le bas réel de la ligne active dans le contenu du textarea. */
      const targetBottom = metrics.paddingTop + (progress.targetLineIndex + 1) * metrics.lineHeight;
      /* Conserve une petite marge sous la ligne afin que son curseur ne soit pas coupé. */
      const visibleBottom = refs.editor.clientHeight - metrics.paddingBottom - 4;
      /* Calcule le déplacement nécessaire pour rendre la ligne entièrement visible. */
      const requestedScrollTop = Math.max(0, targetBottom - visibleBottom);
      /* Calcule la limite native du navigateur. */
      const nativeMaximum = Math.max(0, refs.editor.scrollHeight - refs.editor.clientHeight);
      /* Retourne une valeur valide. */
      return Math.min(nativeMaximum, requestedScrollTop);
    }

    /* Aligne la fenêtre sur le commentaire et la ligne de code actifs. */
    function alignActiveLine(progress, metrics) {
      /* Ignore un alignement devenu inutile. */
      if (!guidedModeEnabled()) return;
      /* Recalcule la limite à partir des dimensions réellement rendues. */
      maximumAllowedScrollTop = desiredScrollTop(progress, metrics);
      /* Active le garde-fou. */
      correctingScroll = true;
      /* Place la ligne active dans la fenêtre visible. */
      refs.editor.scrollTop = maximumAllowedScrollTop;
      /* Synchronise explicitement les numéros. */
      refs.lineNumbers.scrollTop = refs.editor.scrollTop;
      /* Informe les autres modules du nouveau défilement. */
      refs.editor.dispatchEvent(new Event("scroll"));
      /* Libère le garde-fou à la prochaine image. */
      window.requestAnimationFrame(() => {
        /* Autorise les prochains gestes. */
        correctingScroll = false;
      });
    }

    /* Programme un alignement immédiat puis un second après la transition de hauteur. */
    function scheduleAlignment(progress, metrics) {
      /* Arrête l’ancien second alignement. */
      window.clearTimeout(settleTimer);
      /* Attend deux images afin que la nouvelle hauteur soit appliquée. */
      window.requestAnimationFrame(() => {
        /* Attend une seconde image pour les styles calculés. */
        window.requestAnimationFrame(() => alignActiveLine(progress, readMetrics()));
      });
      /* Répète l’alignement après la transition CSS. */
      settleTimer = window.setTimeout(() => alignActiveLine(progress, readMetrics()), LAYOUT_SETTLE_DELAY);
    }

    /* Synchronise la hauteur, les numéros et la ligne visible. */
    function updateProgressiveView({ forceAnimation = false } = {}) {
      /* Libère complètement l’éditeur hors du niveau Guidé. */
      if (!guidedModeEnabled()) {
        /* Retire la classe de révélation. */
        refs.root.classList.remove("mission-progressive-guided");
        /* Supprime la hauteur calculée. */
        refs.root.style.removeProperty("--mission-progressive-height");
        /* Réaffiche tous les numéros. */
        Array.from(refs.lineNumbers.children).forEach(number => number.classList.remove("mission-line-future"));
        /* Autorise tout défilement. */
        maximumAllowedScrollTop = Number.POSITIVE_INFINITY;
        /* Réinitialise les mémoires. */
        previousStepId = null;
        previousTargetLineIndex = null;
        /* Termine la mise à jour. */
        return;
      }

      /* Active le style progressif. */
      refs.root.classList.add("mission-progressive-guided");
      /* Calcule la progression actuelle. */
      const progress = currentProgress();
      /* Lit les métriques actuelles. */
      const metrics = readMetrics();
      /* Compte les lignes déjà autorisées. */
      const revealedLineCount = progress.targetLineIndex + 1;
      /* Limite la fenêtre à dix-huit lignes sans imposer de lignes futures. */
      const visibleLineCount = Math.min(MAX_VISIBLE_LINES, Math.max(1, revealedLineCount));
      /* Calcule la hauteur exacte de la fenêtre. */
      const progressiveHeight = Math.ceil(
        metrics.paddingTop
        + visibleLineCount * metrics.lineHeight
        + metrics.paddingBottom
        + 4
      );

      /* Applique la hauteur progressive. */
      refs.root.style.setProperty("--mission-progressive-height", `${progressiveHeight}px`);
      /* Masque les numéros futurs. */
      updateLineNumberVisibility(progress.targetLineIndex, progress.complete);

      /* Détecte le passage à une nouvelle étape. */
      const stepChanged = progress.stepId !== previousStepId;
      /* Détecte un déplacement réel de la cible. */
      const lineChanged = progress.targetLineIndex !== previousTargetLineIndex;
      /* Mémorise la progression. */
      previousStepId = progress.stepId;
      /* Mémorise la ligne. */
      previousTargetLineIndex = progress.targetLineIndex;

      /* Aligne systématiquement la ligne active après le calcul de hauteur. */
      scheduleAlignment(progress, metrics);
      /* Anime uniquement une véritable nouvelle étape. */
      if (stepChanged || lineChanged || forceAnimation) animateNewStep();
    }

    /* Programme une mise à jour unique. */
    function scheduleUpdate(options = {}) {
      /* Annule la demande précédente. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Programme le nouveau calcul. */
      scheduledFrame = window.requestAnimationFrame(() => updateProgressiveView(options));
    }

    /* Empêche seulement le défilement vers des lignes futures. */
    refs.editor.addEventListener("scroll", () => {
      /* Ignore les corrections automatiques. */
      if (correctingScroll || !guidedModeEnabled()) return;
      /* Synchronise les numéros pendant toute relecture autorisée. */
      refs.lineNumbers.scrollTop = refs.editor.scrollTop;
      /* Laisse l’élève remonter librement parmi les lignes déjà révélées. */
      if (refs.editor.scrollTop <= maximumAllowedScrollTop) return;
      /* Active le garde-fou. */
      correctingScroll = true;
      /* Ramène l’éditeur à la dernière ligne autorisée. */
      refs.editor.scrollTop = maximumAllowedScrollTop;
      /* Synchronise la gouttière. */
      refs.lineNumbers.scrollTop = refs.editor.scrollTop;
      /* Informe les autres modules. */
      refs.editor.dispatchEvent(new Event("scroll"));
      /* Libère le garde-fou. */
      window.requestAnimationFrame(() => {
        /* Autorise les prochains gestes. */
        correctingScroll = false;
      });
    }, { passive: true });

    /* Recalcule après chaque caractère saisi ou supprimé. */
    refs.editor.addEventListener("input", () => scheduleUpdate());
    /* Recalcule lorsque le niveau d’aide change. */
    refs.helpLevel.addEventListener("change", () => scheduleUpdate({ forceAnimation: true }));
    /* Recalcule après un redimensionnement. */
    window.addEventListener("resize", () => scheduleUpdate());
    /* Recalcule après un passage en plein écran. */
    document.addEventListener("fullscreenchange", () => scheduleUpdate({ forceAnimation: true }));

    /* Les numéros sont recréés après chaque saisie ou validation. */
    const lineNumberObserver = new MutationObserver(() => scheduleUpdate());
    /* Surveille uniquement leur structure. */
    lineNumberObserver.observe(refs.lineNumbers, { childList: true });

    /* Surveille l’activation et la désactivation du mode Mission. */
    const rootObserver = new MutationObserver(() => scheduleUpdate({ forceAnimation: true }));
    /* Observe seulement les changements de classe. */
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });

    /* Recalcule après les actions qui remplacent ou vérifient le squelette. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      /* Récupère le bouton demandé. */
      const button = document.getElementById(id);
      /* Attend la fin de son gestionnaire historique. */
      button?.addEventListener("click", () => window.setTimeout(() => scheduleUpdate({ forceAnimation: true }), 0));
    });

    /* Lance le premier calcul. */
    scheduleUpdate({ forceAnimation: true });
  }

  /* Démarre après la construction initiale du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque le document se construit encore. */
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    /* Lance immédiatement l’attente. */
    waitForMission();
  }
})();
