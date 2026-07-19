/* TechnoQuest — CONTRÔLEUR de la géométrie guidée : écouteurs, boucle rAF, ÉCRIVAIN UNIQUE. */
/* Consomme le moteur pur (TechnoQuestGuidedGeometryEngine) et la cible canonique */
/* (TechnoQuestMissionGuidedTarget). Il est le SEUL à écrire le cadre, la flèche, la */
/* surbrillance, le numéro actif et le scrollTop de l'éditeur. */
/* En revendiquant la propriété, il neutralise les anciens écrivains concurrents. */
"use strict";

(() => {
  /* Revendique immédiatement la propriété de la géométrie guidée (lu par les anciens écrivains). */
  window.__TQ_GEOMETRY_CLAIM__ = true;

  /* Indique si le niveau Guidé est actif. */
  function guidedModeEnabled() {
    /* Lit la valeur du sélecteur d'aide. */
    return document.getElementById("missionHelpLevel")?.value === "guided";
  }

  /* Attend que le mode Mission et le moteur soient prêts. */
  function waitForMission(attempt = 0) {
    /* Racine Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Zone de saisie réelle. */
    const editor = document.getElementById("codeEditor");
    /* Couche de coloration. */
    const highlight = document.getElementById("codeHighlight");
    /* Cadre commun. */
    const shell = document.getElementById("missionCodeShell");
    /* Flèche. */
    const arrow = document.getElementById("missionArrow");
    /* Colonne des numéros. */
    const lineNumbers = document.getElementById("missionLineNumbers");
    /* Cible canonique. */
    const guidedTarget = window.TechnoQuestMissionGuidedTarget;
    /* Fabrique du moteur de géométrie. */
    const engineFactory = window.TechnoQuestGuidedGeometryEngine;

    /* Installe lorsque tout est disponible. */
    if (root && editor && highlight && shell && arrow && lineNumbers && guidedTarget && engineFactory) {
      /* Lance l'installation. */
      install({ root, editor, highlight, shell, arrow, lineNumbers, guidedTarget, engine: engineFactory.create({ editor, shell, lineNumbers }) });
      /* Termine l'attente. */
      return;
    }
    /* Réessaie pendant la construction de l'interface. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe l'écrivain unique. */
  function install(refs) {
    /* Évite une double installation. */
    if (refs.shell.dataset.guidedControllerReady === "true") return;
    /* Marque l'installation. */
    refs.shell.dataset.guidedControllerReady = "true";

    /* Numéro de séance. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Scène de simulation. */
    const twinStage = document.getElementById("twinStage");

    /* Réutilise ou crée le grand cadre pédagogique. */
    const frame = refs.shell.querySelector(".mission-target-line") || document.createElement("div");
    /* Applique la classe du cadre. */
    frame.className = "mission-target-line";
    /* Retire le cadre de la lecture vocale. */
    frame.setAttribute("aria-hidden", "true");
    /* Ajoute l'étiquette lorsqu'elle manque. */
    if (!frame.querySelector(".mission-target-line-label")) {
      /* Construit l'étiquette. */
      frame.innerHTML = '<span class="mission-target-line-label">Écrire ici</span>';
    }
    /* Insère le cadre si nécessaire. */
    if (!frame.isConnected) refs.shell.appendChild(frame);
    /* Masque le cadre avant le premier calcul. */
    frame.hidden = true;

    /* Réutilise ou crée la surbrillance de la ligne de code. */
    const codeBand = refs.shell.querySelector(".mission-target-code") || document.createElement("div");
    /* Applique sa classe. */
    codeBand.className = "mission-target-code";
    /* Retire ce décor de la lecture vocale. */
    codeBand.setAttribute("aria-hidden", "true");
    /* Insère la surbrillance si nécessaire. */
    if (!codeBand.isConnected) refs.shell.appendChild(codeBand);
    /* Masque la surbrillance avant le premier calcul. */
    codeBand.hidden = true;

    /* Numéro actuellement mis en évidence. */
    let activeNumber = null;
    /* Image programmée. */
    let scheduledFrame = 0;
    /* Minuteur de stabilisation. */
    let settleTimer = 0;
    /* Garde-fou contre la ré-entrance lors d'un ajustement de défilement. */
    let applyingScroll = false;
    /* Dernière mesure exposée pour les tests. */
    let lastMeasure = null;

    /* Indique si le mode Mission est visible. */
    function missionVisible() {
      /* Vérifie la classe de masquage. */
      return !refs.root.classList.contains("mission-hidden");
    }

    /* Indique si une simulation est en cours. */
    function simulationActive() {
      /* Vérifie la classe de la scène jumelle. */
      return Boolean(twinStage?.classList.contains("mission-simulating"));
    }

    /* Retire proprement le numéro actif. */
    function clearActiveNumber() {
      /* Ne fait rien sans numéro actif. */
      if (!activeNumber) return;
      /* Retire la classe jaune. */
      activeNumber.classList.remove("mission-target-number");
      /* Retire l'attribut d'étape. */
      activeNumber.removeAttribute("aria-current");
      /* Oublie la référence. */
      activeNumber = null;
    }

    /* Masque toutes les décorations d'écriture. */
    function hideDecorations() {
      /* Masque la flèche. */
      refs.arrow.classList.add("mission-arrow-complete");
      /* Masque le grand cadre. */
      frame.hidden = true;
      /* Masque la surbrillance de code. */
      codeBand.hidden = true;
      /* Retire le numéro actif. */
      clearActiveNumber();
    }

    /* Met à jour et écrit toutes les décorations (écrivain unique). */
    function update() {
      /* Ignore lorsque le mode est masqué. */
      if (!missionVisible()) return;
      /* Synchronise la gouttière (affichage des numéros) avec le défilement réel. */
      refs.lineNumbers.scrollTop = refs.editor.scrollTop;

      /* Pendant la simulation, retire les décorations d'écriture. */
      if (simulationActive()) {
        /* Marque l'exécution. */
        refs.shell.classList.add("mission-execution-target");
        /* Masque les décorations d'écriture. */
        hideDecorations();
        /* Termine. */
        return;
      }
      /* Retire la classe d'exécution hors simulation. */
      refs.shell.classList.remove("mission-execution-target");

      /* Récupère la cible depuis la source de vérité unique. */
      const current = refs.guidedTarget.getCurrent?.(refs.editor.value, sessionId);
      /* Lit l'étape active. */
      const stepId = current?.stepId || null;
      /* Masque tout lorsque la mission est terminée. */
      if (!stepId || current.lineIndex === null || current.lineIndex === undefined) {
        /* Retire les décorations. */
        hideDecorations();
        /* Oublie la dernière mesure. */
        lastMeasure = null;
        /* Termine. */
        return;
      }

      /* Découpe le programme en lignes. */
      const lines = refs.editor.value.split("\n");
      /* Borne la ligne de code. */
      const codeLine = Math.max(0, Math.min(lines.length - 1, Math.round(Number(current.lineIndex) || 0)));

      /* Ajuste d'abord le défilement (le contrôleur est l'écrivain unique du scrollTop). */
      if (guidedModeEnabled()) {
        /* Demande le défilement souhaité au moteur. */
        const desiredScroll = refs.engine.computeScroll(lines, codeLine);
        /* Applique un déplacement réel uniquement. */
        if (desiredScroll !== null && Math.abs(desiredScroll - refs.editor.scrollTop) > 1) {
          /* Active le garde-fou. */
          applyingScroll = true;
          /* Écrit le défilement de l'éditeur. */
          refs.editor.scrollTop = desiredScroll;
          /* Synchronise la coloration. */
          refs.highlight.scrollTop = desiredScroll;
          /* Synchronise la gouttière. */
          refs.lineNumbers.scrollTop = desiredScroll;
          /* Synchronise le miroir de mesure. */
          refs.engine.syncScroll();
          /* Libère le garde-fou à l'image suivante. */
          window.requestAnimationFrame(() => { applyingScroll = false; });
        }
      }

      /* Demande la géométrie des décorations au moteur (nombres purs). */
      const deco = refs.engine.computeDecorations(lines, codeLine);
      /* Masque lorsque la cible n'est pas visible. */
      if (!deco.visible) {
        /* Retire les décorations. */
        hideDecorations();
        /* Conserve un diagnostic. */
        lastMeasure = { stepId, codeLine, commentLine: deco.commentLine, visible: false };
        /* Termine. */
        return;
      }

      /* Affiche et positionne le grand cadre. */
      frame.hidden = false;
      /* Commence après la gouttière. */
      frame.style.left = `${deco.frame.left}px`;
      /* Positionne le haut sur le commentaire. */
      frame.style.top = `${deco.frame.top}px`;
      /* Couvre jusqu'au bas de la ligne de code. */
      frame.style.height = `${deco.frame.height}px`;
      /* Met à jour l'étiquette avec le numéro de la LIGNE DE CODE. */
      frame.querySelector(".mission-target-line-label").textContent = `Écrire ici · ligne ${deco.codeLineHuman}`;

      /* Affiche et positionne la surbrillance de la ligne de code. */
      codeBand.hidden = false;
      /* Aligne son gauche. */
      codeBand.style.left = `${deco.codeBand.left}px`;
      /* Positionne son haut. */
      codeBand.style.top = `${deco.codeBand.top}px`;
      /* Utilise la hauteur mesurée. */
      codeBand.style.height = `${deco.codeBand.height}px`;

      /* Affiche et centre la flèche sur la ligne de code. */
      refs.arrow.classList.remove("mission-arrow-complete");
      /* Conserve la flèche à gauche. */
      refs.arrow.style.left = ".45rem";
      /* Centre la flèche. */
      refs.arrow.style.top = `${deco.arrowCenter}px`;
      /* Décrit la cible. */
      refs.arrow.setAttribute("aria-label", `Ligne ${deco.codeLineHuman} à compléter`);
      /* Ajoute une info-bulle. */
      refs.arrow.title = `Écrire à la ligne ${deco.codeLineHuman}`;

      /* Met en évidence le numéro de la ligne de code (affichage). */
      const number = refs.lineNumbers.children[codeLine];
      /* Applique la surbrillance lorsque le numéro existe. */
      if (number) {
        /* Retire d'éventuels états de contexte. */
        number.classList.remove("mission-line-future");
        /* Retire un éventuel aperçu. */
        number.classList.remove("mission-line-preview");
        /* Remplace l'ancien numéro seulement lorsqu'il change. */
        if (activeNumber !== number) {
          /* Retire l'ancien état. */
          clearActiveNumber();
          /* Mémorise le nouveau numéro. */
          activeNumber = number;
          /* Applique la classe jaune. */
          activeNumber.classList.add("mission-target-number");
          /* Indique l'étape courante. */
          activeNumber.setAttribute("aria-current", "step");
        }
      }

      /* Conserve la dernière mesure pour les tests. */
      lastMeasure = {
        /* Étape active. */
        stepId,
        /* Ligne de code (0-based). */
        codeLine,
        /* Ligne de code (humaine). */
        codeLineHuman: deco.codeLineHuman,
        /* Haut du bloc de commentaire. */
        commentLine: deco.commentLine,
        /* Décorations visibles. */
        visible: true
      };
    }

    /* Programme un recalcul après la prochaine mise en page. */
    function scheduleUpdate() {
      /* Annule l'ancienne demande. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Attend deux images pour laisser curseur et hauteur se stabiliser. */
      scheduledFrame = window.requestAnimationFrame(() => window.requestAnimationFrame(update));
      /* Re-vérifie après la stabilisation (transition de hauteur ~0,38 s, reflows tardifs). */
      window.clearTimeout(settleTimer);
      /* update() n'émet aucun événement de saisie : cette re-vérification est sûre. */
      settleTimer = window.setTimeout(update, 520);
    }

    /* Recalcule après les interactions de l'éditeur. */
    ["input", "keyup", "click", "focus", "mouseup"].forEach(eventName => {
      /* Connecte chaque événement utile. */
      refs.editor.addEventListener(eventName, scheduleUpdate);
    });
    /* Recalcule pendant le défilement, sauf pendant un ajustement interne. */
    refs.editor.addEventListener("scroll", () => {
      /* Ignore les défilements provoqués par cette couche. */
      if (applyingScroll) return;
      /* Recalcule la position. */
      scheduleUpdate();
    }, { passive: true });
    /* Recalcule après tout changement de sélection dans l'éditeur. */
    document.addEventListener("selectionchange", () => {
      /* Ignore une sélection hors de l'éditeur. */
      if (document.activeElement !== refs.editor) return;
      /* Recalcule la position. */
      scheduleUpdate();
    });
    /* Recalcule au redimensionnement (le zoom navigateur émet aussi resize). */
    window.addEventListener("resize", scheduleUpdate);
    /* Recalcule lorsque la page défile (l'éditeur peut entrer ou sortir de la fenêtre). */
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    /* Recalcule au passage plein écran. */
    document.addEventListener("fullscreenchange", scheduleUpdate);
    /* Recalcule à la fin d'une transition (hauteur progressive) qui déplace le contenu. */
    refs.root.addEventListener("transitionend", scheduleUpdate);
    /* Recalcule aussi à la fin d'une transition du repère commun. */
    refs.shell.addEventListener("transitionend", scheduleUpdate);
    /* Recalcule lorsque la taille rendue de l'éditeur change (reflow, zoom, largeur). */
    if (window.ResizeObserver) {
      /* Crée l'observateur de taille. */
      const sizeObserver = new ResizeObserver(scheduleUpdate);
      /* Observe la zone de saisie. */
      sizeObserver.observe(refs.editor);
    }
    /* Les numéros de ligne sont recréés après les saisies et validations. */
    const numbersObserver = new MutationObserver(scheduleUpdate);
    /* Observe la structure de la gouttière. */
    numbersObserver.observe(refs.lineNumbers, { childList: true });
    /* Recalcule lorsque la visibilité du mode change. */
    const rootObserver = new MutationObserver(scheduleUpdate);
    /* Observe la classe de la racine. */
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });
    /* Recalcule lorsque la simulation change d'état. */
    if (twinStage) {
      /* Crée l'observateur de simulation. */
      const twinObserver = new MutationObserver(scheduleUpdate);
      /* Observe la classe de la scène. */
      twinObserver.observe(twinStage, { attributes: true, attributeFilter: ["class"] });
    }
    /* Recalcule après les principales actions Mission. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      /* Attend la fin de l'action historique. */
      document.getElementById(id)?.addEventListener("click", () => window.setTimeout(scheduleUpdate, 0));
    });
    /* Recalcule après un changement de niveau. */
    document.getElementById("missionHelpLevel")?.addEventListener("change", () => window.setTimeout(scheduleUpdate, 0));

    /* Expose un accès de test à la dernière mesure et au recalcul. */
    window.TechnoQuestGuidedGeometry = {
      /* Retourne la dernière mesure calculée. */
      measure: () => lastMeasure,
      /* Force un recalcul immédiat. */
      refresh: () => scheduleUpdate()
    };

    /* Lance le premier calcul. */
    scheduleUpdate();
  }

  /* Démarre après la construction du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded. */
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    /* Lance immédiatement l'attente. */
    waitForMission();
  }
})();
