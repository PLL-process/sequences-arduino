/* TechnoQuest — progression guidée avec historique consultable et trois lignes de contexte. */
"use strict";

(() => {
  /* Limite la fenêtre à dix-huit lignes pour conserver les proportions validées. */
  const MAX_VISIBLE_LINES = 18;
  /* Affiche trois lignes après la ligne à compléter afin qu'elle ne soit jamais collée au bord inférieur. */
  const TRAILING_CONTEXT_LINES = 3;
  /* Attend la fin de la transition CSS avant un second alignement de sécurité. */
  const LAYOUT_SETTLE_DELAY = 460;

  /* Attend la construction dynamique complète du mode Mission. */
  function waitForMission(attempt = 0) {
    /* Récupère la racine du mode Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère la véritable zone de saisie. */
    const editor = document.getElementById("codeEditor");
    /* Récupère le cadre commun de l'éditeur. */
    const shell = document.getElementById("missionCodeShell");
    /* Récupère la colonne des numéros de ligne. */
    const lineNumbers = document.getElementById("missionLineNumbers");
    /* Récupère le sélecteur du niveau d'aide. */
    const helpLevel = document.getElementById("missionHelpLevel");
    /* Récupère le validateur pédagogique. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe le module lorsque tous les éléments existent. */
    if (root && editor && shell && lineNumbers && helpLevel && validator) {
      /* Lance l'installation principale. */
      installProgressiveReveal({ root, editor, shell, lineNumbers, helpLevel, validator });
      /* Termine l'attente. */
      return;
    }

    /* Réessaie pendant quelques secondes lorsque l'interface se construit encore. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe le calcul des lignes visibles et la relecture libre de l'historique. */
  function installProgressiveReveal(refs) {
    /* Évite une seconde installation. */
    if (refs.root.dataset.progressiveRevealV3Ready === "true") return;
    /* Mémorise que cette version est active. */
    refs.root.dataset.progressiveRevealV3Ready = "true";

    /* Lit le numéro de la séance. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Mémorise la dernière étape afin de détecter une véritable progression. */
    let previousStepId = null;
    /* Mémorise la dernière ligne cible. */
    let previousTargetLineIndex = null;
    /* Mémorise la limite maximale de défilement autorisée. */
    let maximumAllowedScrollTop = Number.POSITIVE_INFINITY;
    /* Empêche une boucle pendant un repositionnement automatique. */
    let correctingScroll = false;
    /* Regroupe les mises à jour successives. */
    let scheduledFrame = 0;
    /* Mémorise le minuteur du second alignement. */
    let settleTimer = 0;
    /* Mémorise le minuteur de l'animation. */
    let animationTimer = 0;
    /* Mémorise la dernière progression calculée pour les tests et les autres modules. */
    let lastProgress = null;

    /* Indique si le mode Guidé progressif est actif et visible. */
    function guidedModeEnabled() {
      /* Vérifie le niveau et la visibilité du mode Mission. */
      return refs.helpLevel.value === "guided" && !refs.root.classList.contains("mission-hidden");
    }

    /* Lit les métriques typographiques réellement appliquées au textarea. */
    function readMetrics() {
      /* Récupère les styles calculés. */
      const style = window.getComputedStyle(refs.editor);
      /* Convertit la hauteur d'une ligne. */
      const lineHeight = Number.parseFloat(style.lineHeight) || 28;
      /* Convertit la marge intérieure supérieure. */
      const paddingTop = Number.parseFloat(style.paddingTop) || 16;
      /* Convertit la marge intérieure inférieure. */
      const paddingBottom = Number.parseFloat(style.paddingBottom) || 16;
      /* Retourne les mesures utiles. */
      return { lineHeight, paddingTop, paddingBottom };
    }

    /* Calcule l'étape active et sa véritable ligne de saisie. */
    function currentProgress() {
      /* Compte toutes les lignes du squelette interne. */
      const totalLines = Math.max(1, refs.editor.value.split("\n").length);
      /* Utilise le calcul centralisé sans mémoire lorsqu'il existe. */
      const centralTarget = window.TechnoQuestMissionGuidedTarget?.getCurrent?.(refs.editor.value, sessionId);
      /* Valide le programme lorsque le calcul centralisé n'est pas disponible. */
      const result = centralTarget?.result || refs.validator.validate(refs.editor.value, sessionId);
      /* Lit la première étape manquante. */
      const stepId = centralTarget ? centralTarget.stepId : result.firstMissing?.id || null;

      /* Révèle tout lorsque la mission est terminée. */
      if (!stepId) {
        /* Retourne la dernière ligne comme limite finale. */
        return {
          result,
          stepId: null,
          targetLineIndex: totalLines - 1,
          revealThroughIndex: totalLines - 1,
          totalLines,
          complete: true
        };
      }

      /* Récupère la ligne calculée par le gestionnaire central ou le validateur. */
      const rawLineIndex = centralTarget?.lineIndex ?? refs.validator.findLineForStep(
        refs.editor.value,
        stepId,
        result,
        sessionId,
        "edition"
      );
      /* Ramène la cible dans les limites du programme. */
      const targetLineIndex = Math.max(0, Math.min(totalLines - 1, Math.round(Number(rawLineIndex) || 0)));
      /* Révèle également trois lignes après la cible pour conserver le contexte visuel. */
      const revealThroughIndex = Math.min(totalLines - 1, targetLineIndex + TRAILING_CONTEXT_LINES);
      /* Retourne la progression courante. */
      return { result, stepId, targetLineIndex, revealThroughIndex, totalLines, complete: false };
    }

    /* Masque visuellement les numéros appartenant aux étapes réellement futures. */
    function updateLineNumberVisibility(progress) {
      /* Parcourt les numéros recréés par le contrôleur Mission. */
      Array.from(refs.lineNumbers.children).forEach((number, index) => {
        /* Conserve la géométrie de chaque ligne tout en cachant son numéro futur. */
        number.classList.toggle("mission-line-future", !progress.complete && index > progress.revealThroughIndex);
        /* Identifie les trois lignes de contexte qui suivent la cible. */
        number.classList.toggle(
          "mission-line-preview",
          !progress.complete && index > progress.targetLineIndex && index <= progress.revealThroughIndex
        );
      });
    }

    /* Anime brièvement la nouvelle étape. */
    function animateNewStep() {
      /* Arrête l'ancien minuteur. */
      window.clearTimeout(animationTimer);
      /* Retire la classe avant de relancer l'animation. */
      refs.shell.classList.remove("mission-progressive-step-change");
      /* Attend une image de rendu. */
      window.requestAnimationFrame(() => {
        /* Active l'animation. */
        refs.shell.classList.add("mission-progressive-step-change");
        /* Programme sa fin. */
        animationTimer = window.setTimeout(() => {
          /* Retire la classe d'animation. */
          refs.shell.classList.remove("mission-progressive-step-change");
        }, 760);
      });
    }

    /* Calcule la limite qui montre la cible et les trois lignes suivantes. */
    function allowedScrollTop(progress, metrics) {
      /* Autorise le défilement natif complet lorsque la mission est terminée. */
      if (progress.complete) return Math.max(0, refs.editor.scrollHeight - refs.editor.clientHeight);
      /* Calcule le bas de la dernière ligne de contexte révélée. */
      const revealedBottom = metrics.paddingTop + (progress.revealThroughIndex + 1) * metrics.lineHeight;
      /* Calcule le bas réellement visible dans la fenêtre. */
      const visibleBottom = refs.editor.clientHeight - metrics.paddingBottom - 4;
      /* Calcule le déplacement nécessaire pour placer le contexte au bas de la fenêtre. */
      const requestedScrollTop = Math.max(0, revealedBottom - visibleBottom);
      /* Calcule la limite native du navigateur. */
      const nativeMaximum = Math.max(0, refs.editor.scrollHeight - refs.editor.clientHeight);
      /* Retourne une valeur valide. */
      return Math.min(nativeMaximum, requestedScrollTop);
    }

    /* Place automatiquement la nouvelle étape tout en laissant ensuite la relecture libre. */
    function alignNewStep(progress) {
      /* Ignore un alignement devenu inutile. */
      if (!guidedModeEnabled()) return;
      /* Recalcule les dimensions réellement rendues. */
      const metrics = readMetrics();
      /* Calcule la limite maximale autorisée. */
      maximumAllowedScrollTop = allowedScrollTop(progress, metrics);
      /* Active le garde-fou. */
      correctingScroll = true;
      /* Place la ligne cible avec trois lignes de contexte en dessous. */
      refs.editor.scrollTop = maximumAllowedScrollTop;
      /* Synchronise explicitement les numéros. */
      refs.lineNumbers.scrollTop = refs.editor.scrollTop;
      /* Informe la coloration et la flèche du nouveau défilement. */
      refs.editor.dispatchEvent(new Event("scroll"));
      /* Libère le garde-fou à la prochaine image. */
      window.requestAnimationFrame(() => {
        /* Autorise les prochains gestes manuels. */
        correctingScroll = false;
      });
    }

    /* Programme un alignement immédiat puis un second après la transition de hauteur. */
    function scheduleAlignment(progress) {
      /* Arrête l'ancien second alignement. */
      window.clearTimeout(settleTimer);
      /* Attend deux images afin que la nouvelle hauteur soit appliquée. */
      window.requestAnimationFrame(() => {
        /* Attend une seconde image pour les styles calculés. */
        window.requestAnimationFrame(() => alignNewStep(progress));
      });
      /* Répète l'alignement après la transition CSS. */
      settleTimer = window.setTimeout(() => alignNewStep(progress), LAYOUT_SETTLE_DELAY);
    }

    /* Synchronise la hauteur, les numéros et la fenêtre visible. */
    function updateProgressiveView({ forceAlignment = false, forceAnimation = false } = {}) {
      /* Libère complètement l'éditeur hors du niveau Guidé. */
      if (!guidedModeEnabled()) {
        /* Retire la classe de révélation. */
        refs.root.classList.remove("mission-progressive-guided");
        /* Supprime la hauteur calculée. */
        refs.root.style.removeProperty("--mission-progressive-height");
        /* Réaffiche tous les numéros. */
        Array.from(refs.lineNumbers.children).forEach(number => {
          /* Retire la classe de ligne future. */
          number.classList.remove("mission-line-future");
          /* Retire la classe de contexte. */
          number.classList.remove("mission-line-preview");
        });
        /* Autorise tout défilement. */
        maximumAllowedScrollTop = Number.POSITIVE_INFINITY;
        /* Réinitialise les mémoires. */
        previousStepId = null;
        /* Réinitialise la ligne précédente. */
        previousTargetLineIndex = null;
        /* Termine la mise à jour. */
        return;
      }

      /* Active le style progressif. */
      refs.root.classList.add("mission-progressive-guided");
      /* Calcule la progression actuelle. */
      const progress = currentProgress();
      /* Mémorise la progression pour les diagnostics. */
      lastProgress = progress;
      /* Lit les métriques actuelles. */
      const metrics = readMetrics();
      /* Compte les lignes révélées, y compris les trois lignes de contexte. */
      const revealedLineCount = progress.revealThroughIndex + 1;
      /* Limite la fenêtre à dix-huit lignes sans modifier les proportions maximales. */
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
      /* Masque uniquement les lignes situées après les trois lignes de contexte. */
      updateLineNumberVisibility(progress);
      /* Recalcule immédiatement la limite de défilement sans déplacer l'utilisateur. */
      maximumAllowedScrollTop = allowedScrollTop(progress, metrics);

      /* Détecte le passage à une nouvelle étape. */
      const stepChanged = progress.stepId !== previousStepId;
      /* Détecte un déplacement réel de la cible. */
      const lineChanged = progress.targetLineIndex !== previousTargetLineIndex;
      /* Mémorise la progression. */
      previousStepId = progress.stepId;
      /* Mémorise la ligne. */
      previousTargetLineIndex = progress.targetLineIndex;

      /* Aligne seulement au démarrage ou lors d'une véritable nouvelle étape. */
      if (stepChanged || lineChanged || forceAlignment) scheduleAlignment(progress);
      /* Anime seulement une véritable progression ou une demande explicite. */
      if (stepChanged || lineChanged || forceAnimation) animateNewStep();
    }

    /* Programme une mise à jour unique. */
    function scheduleUpdate(options = {}) {
      /* Annule la demande précédente. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Programme le nouveau calcul. */
      scheduledFrame = window.requestAnimationFrame(() => updateProgressiveView(options));
    }

    /* Empêche seulement le défilement vers les lignes encore futures. */
    refs.editor.addEventListener("scroll", () => {
      /* Ignore les corrections automatiques. */
      if (correctingScroll || !guidedModeEnabled()) return;
      /* Synchronise les numéros pendant toute relecture autorisée. */
      refs.lineNumbers.scrollTop = refs.editor.scrollTop;
      /* Laisse l'élève remonter librement jusqu'au début du programme. */
      if (refs.editor.scrollTop <= maximumAllowedScrollTop) return;
      /* Active le garde-fou. */
      correctingScroll = true;
      /* Ramène seulement un dépassement vers des lignes non révélées. */
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

    /* Recalcule après chaque caractère sans recentrer une étape incomplète. */
    refs.editor.addEventListener("input", () => scheduleUpdate());
    /* Recalcule et recentre lors d'un changement de niveau. */
    refs.helpLevel.addEventListener("change", () => scheduleUpdate({ forceAlignment: true, forceAnimation: true }));
    /* Recalcule la hauteur après un redimensionnement sans forcer la position de lecture. */
    window.addEventListener("resize", () => scheduleUpdate());
    /* Recalcule et recentre après un passage en plein écran. */
    document.addEventListener("fullscreenchange", () => scheduleUpdate({ forceAlignment: true }));

    /* Les numéros sont recréés après chaque saisie ou validation. */
    const lineNumberObserver = new MutationObserver(() => scheduleUpdate());
    /* Surveille uniquement la structure des numéros. */
    lineNumberObserver.observe(refs.lineNumbers, { childList: true });

    /* Recalcule lors de l'activation ou de la restauration du mode Mission. */
    ["missionActivate", "missionReset", "missionCheck"].forEach(id => {
      /* Attend la fin du gestionnaire historique avant le recentrage. */
      document.getElementById(id)?.addEventListener("click", () => {
        /* Recalcule après la modification éventuelle du programme. */
        window.setTimeout(() => scheduleUpdate({ forceAlignment: true, forceAnimation: true }), 0);
      });
    });

    /* Expose un état de lecture pour les tests de reprise et de défilement. */
    window.TechnoQuestMissionProgressive = {
      /* Retourne une copie de la dernière progression. */
      getProgress: () => lastProgress ? { ...lastProgress } : null,
      /* Retourne la limite de défilement courante. */
      getMaximumScrollTop: () => maximumAllowedScrollTop,
      /* Force un recalcul de diagnostic. */
      refresh: () => scheduleUpdate({ forceAlignment: true })
    };

    /* Lance le premier calcul et place l'étape reprise. */
    scheduleUpdate({ forceAlignment: true, forceAnimation: true });
  }

  /* Démarre après la construction du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque la page est encore en construction. */
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    /* Lance immédiatement l'attente. */
    waitForMission();
  }
})();
