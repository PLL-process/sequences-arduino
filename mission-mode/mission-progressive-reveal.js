/* TechnoQuest — révélation progressive des lignes du programme en mode Guidé. */
"use strict";

(() => {
  /* Limite la fenêtre à dix-huit lignes lorsque le programme devient long. */
  const MAX_VISIBLE_LINES = 18;
  /* Garantit une fenêtre minimale de trois lignes pour la première étape. */
  const MIN_VISIBLE_LINES = 3;

  /* Attend la construction dynamique complète du mode Mission. */
  function waitForMission(attempt = 0) {
    /* Récupère la racine du mode Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère la zone réelle de saisie. */
    const editor = document.getElementById("codeEditor");
    /* Récupère le cadre de l’éditeur. */
    const shell = document.getElementById("missionCodeShell");
    /* Récupère la colonne des numéros. */
    const lineNumbers = document.getElementById("missionLineNumbers");
    /* Récupère le sélecteur du niveau d’aide. */
    const helpLevel = document.getElementById("missionHelpLevel");
    /* Récupère le validateur pédagogique. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe le module lorsque tous les éléments nécessaires sont présents. */
    if (root && editor && shell && lineNumbers && helpLevel && validator) {
      /* Lance l’installation principale. */
      installProgressiveReveal({ root, editor, shell, lineNumbers, helpLevel, validator });
      /* Termine l’attente. */
      return;
    }

    /* Réessaie pendant quelques secondes si l’interface est encore en construction. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe le calcul des lignes visibles et le verrouillage du défilement futur. */
  function installProgressiveReveal(refs) {
    /* Évite une seconde installation lors d’un retour au mode Mission. */
    if (refs.root.dataset.progressiveRevealReady === "true") return;
    /* Mémorise que le module est prêt. */
    refs.root.dataset.progressiveRevealReady = "true";

    /* Lit le numéro de la séance affichée. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Mémorise la dernière étape afin de détecter une progression. */
    let previousStepId = null;
    /* Mémorise la dernière ligne révélée. */
    let revealedLineIndex = null;
    /* Mémorise le défilement maximal autorisé avant la prochaine validation. */
    let maximumAllowedScrollTop = Number.POSITIVE_INFINITY;
    /* Empêche une boucle lors d’une correction automatique du défilement. */
    let correctingScroll = false;
    /* Regroupe les mises à jour successives dans une seule image. */
    let scheduledFrame = 0;
    /* Mémorise le minuteur de l’animation de révélation. */
    let animationTimer = 0;

    /* Indique si le niveau Guidé doit masquer les étapes futures. */
    function guidedModeEnabled() {
      /* Vérifie à la fois le niveau sélectionné et la visibilité du mode Mission. */
      return refs.helpLevel.value === "guided" && !refs.root.classList.contains("mission-hidden");
    }

    /* Lit les métriques typographiques réellement appliquées au textarea. */
    function readMetrics() {
      /* Récupère les styles calculés par le navigateur. */
      const style = window.getComputedStyle(refs.editor);
      /* Convertit la hauteur d’une ligne en nombre. */
      const lineHeight = Number.parseFloat(style.lineHeight) || 28;
      /* Convertit la marge intérieure supérieure en nombre. */
      const paddingTop = Number.parseFloat(style.paddingTop) || 16;
      /* Convertit la marge intérieure inférieure en nombre. */
      const paddingBottom = Number.parseFloat(style.paddingBottom) || 16;
      /* Retourne les trois valeurs nécessaires au calcul. */
      return { lineHeight, paddingTop, paddingBottom };
    }

    /* Calcule la première étape manquante et la dernière ligne autorisée. */
    function currentProgress() {
      /* Valide le programme actuel. */
      const result = refs.validator.validate(refs.editor.value, sessionId);
      /* Lit l’identifiant de la première étape incomplète. */
      const stepId = result.firstMissing?.id || null;
      /* Compte toutes les lignes du squelette interne. */
      const totalLines = Math.max(1, refs.editor.value.split("\n").length);

      /* Révèle le programme complet lorsque toutes les étapes sont terminées. */
      if (!stepId) {
        /* Retourne la dernière ligne comme limite finale. */
        return { result, stepId: null, targetLineIndex: totalLines - 1, totalLines, complete: true };
      }

      /* Demande au validateur enrichi la ligne réellement éditable. */
      const rawLineIndex = refs.validator.findLineForStep(
        /* Transmet le programme courant. */
        refs.editor.value,
        /* Transmet l’étape à compléter. */
        stepId,
        /* Transmet le résultat de validation. */
        result,
        /* Transmet le numéro de séance. */
        sessionId,
        /* Indique qu’il s’agit de la phase d’édition. */
        "edition"
      );
      /* Ramène la ligne dans les limites du programme. */
      const targetLineIndex = Math.max(0, Math.min(totalLines - 1, Math.round(Number(rawLineIndex) || 0)));
      /* Retourne les informations nécessaires au rendu progressif. */
      return { result, stepId, targetLineIndex, totalLines, complete: false };
    }

    /* Masque tous les numéros correspondant aux lignes qui ne sont pas encore révélées. */
    function updateLineNumberVisibility(lastVisibleLineIndex, complete) {
      /* Parcourt tous les numéros recréés par le contrôleur Mission. */
      Array.from(refs.lineNumbers.children).forEach((number, index) => {
        /* Masque la ligne seulement lorsqu’elle appartient au futur du mode Guidé. */
        number.classList.toggle("mission-line-future", !complete && index > lastVisibleLineIndex);
      });
    }

    /* Applique une courte animation lors de l’apparition d’une nouvelle étape. */
    function animateNewStep() {
      /* Arrête l’ancien minuteur. */
      window.clearTimeout(animationTimer);
      /* Retire d’abord la classe pour pouvoir relancer l’animation. */
      refs.shell.classList.remove("mission-progressive-step-change");
      /* Attend une image avant de remettre la classe. */
      window.requestAnimationFrame(() => {
        /* Active l’animation de la ligne cible. */
        refs.shell.classList.add("mission-progressive-step-change");
        /* Programme la suppression de la classe. */
        animationTimer = window.setTimeout(() => {
          /* Termine l’animation proprement. */
          refs.shell.classList.remove("mission-progressive-step-change");
        }, 760);
      });
    }

    /* Synchronise la hauteur, les numéros et le défilement autorisé. */
    function updateProgressiveView({ forceAnimation = false } = {}) {
      /* Libère l’éditeur lorsque le niveau Guidé n’est pas actif. */
      if (!guidedModeEnabled()) {
        /* Retire la classe générale de révélation. */
        refs.root.classList.remove("mission-progressive-guided");
        /* Supprime la hauteur calculée. */
        refs.root.style.removeProperty("--mission-progressive-height");
        /* Réaffiche tous les numéros de ligne. */
        Array.from(refs.lineNumbers.children).forEach(number => number.classList.remove("mission-line-future"));
        /* Autorise tout défilement. */
        maximumAllowedScrollTop = Number.POSITIVE_INFINITY;
        /* Réinitialise les étapes mémorisées. */
        previousStepId = null;
        /* Réinitialise la dernière ligne révélée. */
        revealedLineIndex = null;
        /* Termine la mise à jour. */
        return;
      }

      /* Active le style progressif. */
      refs.root.classList.add("mission-progressive-guided");
      /* Calcule l’état pédagogique actuel. */
      const progress = currentProgress();
      /* Lit les métriques de l’éditeur. */
      const metrics = readMetrics();
      /* Calcule le nombre de lignes déjà autorisées. */
      const revealedLineCount = progress.targetLineIndex + 1;
      /* Limite la fenêtre tout en conservant au moins trois lignes. */
      const visibleLineCount = Math.min(
        /* Applique la limite supérieure. */
        MAX_VISIBLE_LINES,
        /* Applique la limite inférieure sans afficher de ligne future. */
        Math.max(MIN_VISIBLE_LINES, revealedLineCount)
      );
      /* Calcule la hauteur exacte du cadre visible. */
      const progressiveHeight = Math.ceil(
        /* Ajoute la marge intérieure supérieure. */
        metrics.paddingTop
        /* Ajoute les lignes visibles. */
        + visibleLineCount * metrics.lineHeight
        /* Ajoute la marge intérieure inférieure. */
        + metrics.paddingBottom
        /* Ajoute les bordures du cadre. */
        + 2
      );

      /* Transmet la hauteur aux règles CSS. */
      refs.root.style.setProperty("--mission-progressive-height", `${progressiveHeight}px`);
      /* Masque les numéros appartenant aux étapes futures. */
      updateLineNumberVisibility(progress.targetLineIndex, progress.complete);

      /* Autorise le programme complet à utiliser tout son défilement. */
      if (progress.complete) {
        /* Calcule le défilement maximal natif. */
        maximumAllowedScrollTop = Math.max(0, refs.editor.scrollHeight - refs.editor.clientHeight);
      } else {
        /* Calcule le nombre de lignes révélées qui dépassent la fenêtre. */
        const hiddenPastLines = Math.max(0, revealedLineCount - visibleLineCount);
        /* Place la ligne active au bas de la fenêtre sans montrer les lignes futures. */
        maximumAllowedScrollTop = Math.max(0, hiddenPastLines * metrics.lineHeight);
      }

      /* Détecte le passage à une nouvelle étape validée. */
      const stepChanged = progress.stepId !== previousStepId;
      /* Détecte le changement de la dernière ligne révélée. */
      const lineChanged = progress.targetLineIndex !== revealedLineIndex;
      /* Mémorise l’étape courante. */
      previousStepId = progress.stepId;
      /* Mémorise la dernière ligne révélée. */
      revealedLineIndex = progress.targetLineIndex;

      /* Place la fenêtre sur la limite autorisée lors d’une progression. */
      if (stepChanged || lineChanged || forceAnimation) {
        /* Active le garde-fou de défilement. */
        correctingScroll = true;
        /* Positionne la fenêtre sans dévoiler l’étape suivante. */
        refs.editor.scrollTop = maximumAllowedScrollTop;
        /* Synchronise la coloration et les numéros. */
        refs.editor.dispatchEvent(new Event("scroll"));
        /* Libère le garde-fou à la prochaine image. */
        window.requestAnimationFrame(() => {
          /* Autorise les nouveaux contrôles de défilement. */
          correctingScroll = false;
        });
        /* Anime la nouvelle ligne lorsque l’étape change réellement. */
        if (stepChanged || lineChanged) animateNewStep();
      }
    }

    /* Programme une mise à jour unique dans la prochaine image. */
    function scheduleUpdate(options = {}) {
      /* Annule la mise à jour précédente. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Programme le nouveau calcul. */
      scheduledFrame = window.requestAnimationFrame(() => updateProgressiveView(options));
    }

    /* Empêche le défilement vers les lignes futures encore masquées. */
    refs.editor.addEventListener("scroll", () => {
      /* Ignore les corrections que le module vient lui-même d’effectuer. */
      if (correctingScroll || !guidedModeEnabled()) return;
      /* Laisse l’utilisateur relire librement les lignes déjà révélées vers le haut. */
      if (refs.editor.scrollTop <= maximumAllowedScrollTop) return;
      /* Active le garde-fou. */
      correctingScroll = true;
      /* Ramène le défilement à la dernière ligne autorisée. */
      refs.editor.scrollTop = maximumAllowedScrollTop;
      /* Synchronise immédiatement les couches visuelles. */
      refs.editor.dispatchEvent(new Event("scroll"));
      /* Libère le garde-fou à la prochaine image. */
      window.requestAnimationFrame(() => {
        /* Autorise les prochains gestes de défilement. */
        correctingScroll = false;
      });
    }, { passive: true });

    /* Recalcule la progression après chaque caractère saisi ou supprimé. */
    refs.editor.addEventListener("input", () => scheduleUpdate());
    /* Recalcule la progression lorsque le niveau d’aide change. */
    refs.helpLevel.addEventListener("change", () => scheduleUpdate({ forceAnimation: true }));
    /* Recalcule la hauteur après un redimensionnement. */
    window.addEventListener("resize", () => scheduleUpdate());
    /* Recalcule la hauteur après un passage en plein écran. */
    document.addEventListener("fullscreenchange", () => scheduleUpdate({ forceAnimation: true }));

    /* Les numéros sont recréés après chaque validation ou saisie. */
    const lineNumberObserver = new MutationObserver(() => scheduleUpdate());
    /* Surveille uniquement la liste des numéros. */
    lineNumberObserver.observe(refs.lineNumbers, { childList: true });

    /* Surveille l’activation et la désactivation du mode Mission. */
    const rootObserver = new MutationObserver(() => scheduleUpdate({ forceAnimation: true }));
    /* Observe seulement les changements de classe. */
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });

    /* Recalcule après les actions qui remplacent ou vérifient le squelette. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      /* Récupère le bouton demandé. */
      const button = document.getElementById(id);
      /* Attend la fin de son gestionnaire avant de recalculer. */
      button?.addEventListener("click", () => window.setTimeout(() => scheduleUpdate({ forceAnimation: true }), 0));
    });

    /* Lance le premier calcul. */
    scheduleUpdate({ forceAnimation: true });
  }

  /* Démarre après la construction initiale du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque la page est encore en cours de lecture. */
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    /* Lance immédiatement l’attente lorsque la page est prête. */
    waitForMission();
  }
})();
