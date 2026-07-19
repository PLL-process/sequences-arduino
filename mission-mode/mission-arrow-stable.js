/* TechnoQuest — aligne la flèche, le cadre, le numéro et le curseur sur une géométrie unique. */
"use strict";

(() => {
  /* Attend la construction du mode Mission. */
  function waitForMission(attempt = 0) {
    /* Récupère la racine Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère la zone réelle de saisie. */
    const editor = document.getElementById("codeEditor");
    /* Récupère le cadre commun. */
    const shell = document.getElementById("missionCodeShell");
    /* Récupère la flèche. */
    const arrow = document.getElementById("missionArrow");
    /* Récupère la colonne des numéros. */
    const lineNumbers = document.getElementById("missionLineNumbers");
    /* Récupère le validateur. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe le repère lorsque tous les éléments existent. */
    if (root && editor && shell && arrow && lineNumbers && validator) {
      /* Lance l'installation principale. */
      installStableArrow({ root, editor, shell, arrow, lineNumbers, validator });
      /* Termine l'attente. */
      return;
    }

    /* Réessaie pendant quelques secondes lorsque l'interface se construit encore. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe un seul calcul partagé par la flèche, le cadre et la gouttière. */
  function installStableArrow(refs) {
    /* Se retire complètement lorsque la nouvelle géométrie guidée possède la propriété unique. */
    if (window.__TQ_GEOMETRY_CLAIM__) return;
    /* Bloque un ancien module de précision encore présent dans une ancienne page. */
    refs.shell.dataset.precisionArrowReady = "true";
    /* Évite une seconde installation. */
    if (refs.shell.dataset.stableArrowV2Ready === "true") return;
    /* Mémorise que cette version est prête. */
    refs.shell.dataset.stableArrowV2Ready = "true";

    /* Lit le numéro de séance. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Récupère la scène de simulation. */
    const twinStage = document.getElementById("twinStage");
    /* Réutilise un cadre existant ou en crée un nouveau. */
    const targetLine = refs.shell.querySelector(".mission-target-line") || document.createElement("div");
    /* Applique sa classe. */
    targetLine.className = "mission-target-line";
    /* Retire ce décor de la lecture vocale. */
    targetLine.setAttribute("aria-hidden", "true");
    /* Ajoute son étiquette lorsqu'elle n'existe pas. */
    if (!targetLine.querySelector(".mission-target-line-label")) {
      /* Construit l'étiquette. */
      targetLine.innerHTML = '<span class="mission-target-line-label">Écrire ici</span>';
    }
    /* Place le cadre dans le repère commun lorsqu'il vient d'être créé. */
    if (!targetLine.isConnected) refs.shell.appendChild(targetLine);
    /* Masque le cadre avant le premier calcul. */
    targetLine.hidden = true;

    /* Mémorise le numéro actuellement actif. */
    let activeNumber = null;
    /* Regroupe les demandes de rendu. */
    let scheduledFrame = 0;

    /* Indique si le mode Mission est visible. */
    function missionVisible() {
      /* Vérifie la classe de masquage. */
      return !refs.root.classList.contains("mission-hidden");
    }

    /* Indique si la simulation est en cours. */
    function simulationActive() {
      /* Vérifie la classe de la scène. */
      return Boolean(twinStage?.classList.contains("mission-simulating"));
    }

    /* Retire proprement l'ancien numéro actif. */
    function clearActiveNumber() {
      /* Ne fait rien lorsqu'aucun numéro n'est actif. */
      if (!activeNumber) return;
      /* Retire la classe jaune. */
      activeNumber.classList.remove("mission-target-number");
      /* Retire l'attribut d'étape. */
      activeNumber.removeAttribute("aria-current");
      /* Oublie la référence. */
      activeNumber = null;
    }

    /* Retourne la ligne contenant le véritable point d'insertion. */
    function caretLineIndex() {
      /* Compte les retours à la ligne placés avant selectionStart. */
      return refs.editor.value.slice(0, refs.editor.selectionStart).split("\n").length - 1;
    }

    /* Calcule la ligne pédagogique actuelle sans réutiliser une ancienne étape. */
    function canonicalTargetLine() {
      /* Utilise le gestionnaire central lorsqu'il existe. */
      const centralTarget = window.TechnoQuestMissionGuidedTarget?.getCurrent?.(refs.editor.value, sessionId);
      /* Retourne immédiatement sa ligne lorsqu'elle est disponible. */
      if (centralTarget && centralTarget.stepId) return centralTarget.lineIndex;
      /* Valide le programme avec le validateur historique en solution de secours. */
      const result = refs.validator.validate(refs.editor.value, sessionId);
      /* Lit la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Signale une mission terminée. */
      if (!stepId) return null;
      /* Demande la ligne éditable au validateur. */
      return refs.validator.findLineForStep(refs.editor.value, stepId, result, sessionId, "edition");
    }

    /* Choisit la même ligne que le curseur lorsqu'il est actif, sinon la cible canonique. */
    function displayedTargetLine() {
      /* Calcule la dernière ligne disponible. */
      const maximumLine = Math.max(0, refs.editor.value.split("\n").length - 1);
      /* Calcule la cible canonique. */
      const canonicalLine = canonicalTargetLine();
      /* Signale une mission terminée. */
      if (canonicalLine === null || canonicalLine === undefined) return null;
      /* Lit la ligne du curseur seulement lorsque l'éditeur possède le focus. */
      const focusedLine = document.activeElement === refs.editor ? caretLineIndex() : null;
      /* Utilise le curseur lorsqu'il se trouve sur la ligne guidée ou juste pendant son placement. */
      const chosenLine = focusedLine !== null && Math.abs(focusedLine - Number(canonicalLine)) <= 1
        ? focusedLine
        : Number(canonicalLine);
      /* Retourne un index entier valide. */
      return Math.max(0, Math.min(maximumLine, Math.round(chosenLine || 0)));
    }

    /* Masque les repères lorsque la ligne active n'est pas dans la fenêtre visible. */
    function hideTargetDecorations() {
      /* Masque la flèche. */
      refs.arrow.classList.add("mission-arrow-complete");
      /* Masque le cadre. */
      targetLine.hidden = true;
    }

    /* Met à jour simultanément tous les repères. */
    function updateArrow() {
      /* Ignore les calculs lorsque le mode est masqué. */
      if (!missionVisible()) return;
      /* Synchronise d'abord les numéros avec le défilement réel du code. */
      refs.lineNumbers.scrollTop = refs.editor.scrollTop;

      /* Pendant la simulation, masque le cadre d'écriture. */
      if (simulationActive()) {
        /* Ajoute la classe d'exécution. */
        refs.shell.classList.add("mission-execution-target");
        /* Masque les repères d'écriture. */
        hideTargetDecorations();
        /* Retire le numéro d'écriture. */
        clearActiveNumber();
        /* Termine la mise à jour. */
        return;
      }

      /* Retire la classe de simulation. */
      refs.shell.classList.remove("mission-execution-target");
      /* Calcule l'index cible. */
      const lineIndex = displayedTargetLine();

      /* Masque les repères lorsque tout est validé. */
      if (lineIndex === null) {
        /* Masque les décorations. */
        hideTargetDecorations();
        /* Retire le numéro actif. */
        clearActiveNumber();
        /* Termine la mise à jour. */
        return;
      }

      /* Récupère le véritable élément du numéro de ligne. */
      const number = refs.lineNumbers.children[lineIndex];
      /* Attend sa création lorsqu'il manque temporairement. */
      if (!number) return;
      /* Force l'affichage du numéro actif. */
      number.classList.remove("mission-line-future");
      /* Retire son éventuel état de simple aperçu. */
      number.classList.remove("mission-line-preview");

      /* Remplace l'ancien numéro seulement lorsque la cible change. */
      if (activeNumber !== number) {
        /* Retire l'ancien état. */
        clearActiveNumber();
        /* Mémorise le nouveau numéro. */
        activeNumber = number;
        /* Applique la classe de cible. */
        activeNumber.classList.add("mission-target-number");
        /* Indique l'étape courante. */
        activeNumber.setAttribute("aria-current", "step");
      }

      /* Lit les rectangles du même repère DOM. */
      const shellRect = refs.shell.getBoundingClientRect();
      /* Lit le rectangle du textarea. */
      const editorRect = refs.editor.getBoundingClientRect();
      /* Lit la largeur de la gouttière. */
      const gutterRect = refs.lineNumbers.getBoundingClientRect();
      /* Lit les métriques typographiques. */
      const style = window.getComputedStyle(refs.editor);
      /* Convertit la hauteur de ligne. */
      const lineHeight = parseFloat(style.lineHeight) || 28;
      /* Convertit la marge intérieure supérieure. */
      const paddingTop = parseFloat(style.paddingTop) || 16;
      /* Calcule le haut de la ligne dans le repère du cadre. */
      const relativeTop = editorRect.top - shellRect.top + paddingTop + lineIndex * lineHeight - refs.editor.scrollTop;
      /* Calcule son centre. */
      const relativeCenter = relativeTop + lineHeight / 2;
      /* Calcule le début de la zone de code. */
      const codeLeft = gutterRect.right - shellRect.left;
      /* Calcule les limites visibles du textarea. */
      const visibleTop = editorRect.top - shellRect.top;
      /* Calcule la limite inférieure visible. */
      const visibleBottom = editorRect.bottom - shellRect.top;

      /* Masque la flèche lorsque l'élève remonte et que la cible sort de l'écran. */
      if (relativeTop + lineHeight <= visibleTop || relativeTop >= visibleBottom) {
        /* Masque uniquement les décorations, sans changer la cible. */
        hideTargetDecorations();
        /* Termine la mise à jour. */
        return;
      }

      /* Affiche la flèche. */
      refs.arrow.classList.remove("mission-arrow-complete");
      /* La conserve dans la partie gauche de la gouttière. */
      refs.arrow.style.left = ".45rem";
      /* Aligne son centre sur la même ligne que le curseur. */
      refs.arrow.style.top = `${relativeCenter}px`;
      /* Décrit la cible. */
      refs.arrow.setAttribute("aria-label", `Ligne ${lineIndex + 1} à compléter`);
      /* Ajoute une info-bulle équivalente. */
      refs.arrow.title = `Écrire à la ligne ${lineIndex + 1}`;

      /* Affiche le cadre. */
      targetLine.hidden = false;
      /* Commence après la gouttière. */
      targetLine.style.left = `${codeLeft}px`;
      /* Utilise exactement le haut calculé pour le curseur. */
      targetLine.style.top = `${relativeTop}px`;
      /* Utilise exactement la hauteur de ligne du textarea. */
      targetLine.style.height = `${lineHeight}px`;
      /* Affiche le même numéro dans l'étiquette. */
      targetLine.querySelector(".mission-target-line-label").textContent = `Écrire ici · ligne ${lineIndex + 1}`;
    }

    /* Programme un recalcul après la prochaine mise en page du navigateur. */
    function scheduleUpdate() {
      /* Annule l'ancienne demande. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Attend deux images afin que le curseur et la hauteur soient stabilisés. */
      scheduledFrame = window.requestAnimationFrame(() => window.requestAnimationFrame(updateArrow));
    }

    /* Recalcule après les interactions de l'éditeur. */
    ["input", "keyup", "click", "focus", "mouseup"].forEach(eventName => {
      /* Connecte chaque événement utile. */
      refs.editor.addEventListener(eventName, scheduleUpdate);
    });
    /* Recalcule pendant le défilement. */
    refs.editor.addEventListener("scroll", scheduleUpdate, { passive: true });
    /* Recalcule après toute modification de sélection. */
    document.addEventListener("selectionchange", () => {
      /* Ignore les sélections situées dans un autre élément. */
      if (document.activeElement !== refs.editor) return;
      /* Recalcule la position. */
      scheduleUpdate();
    });
    /* Recalcule lorsque la fenêtre change de taille. */
    window.addEventListener("resize", scheduleUpdate);
    /* Recalcule en plein écran. */
    document.addEventListener("fullscreenchange", scheduleUpdate);

    /* Les numéros sont recréés après les saisies et validations. */
    const lineObserver = new MutationObserver(scheduleUpdate);
    /* Observe uniquement la structure afin d'éviter une boucle de classes. */
    lineObserver.observe(refs.lineNumbers, { childList: true, subtree: true });

    /* Recalcule lorsque le mode devient visible. */
    const rootObserver = new MutationObserver(scheduleUpdate);
    /* Observe seulement la classe de visibilité. */
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });

    /* Recalcule lorsque la simulation change d'état. */
    if (twinStage) {
      /* Crée l'observateur de simulation. */
      const twinObserver = new MutationObserver(scheduleUpdate);
      /* Observe uniquement la classe. */
      twinObserver.observe(twinStage, { attributes: true, attributeFilter: ["class"] });
    }

    /* Recalcule après les principales actions. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      /* Attend la fin de l'action historique. */
      document.getElementById(id)?.addEventListener("click", () => window.setTimeout(scheduleUpdate, 0));
    });
    /* Recalcule après un changement de niveau. */
    document.getElementById("missionHelpLevel")?.addEventListener("change", () => window.setTimeout(scheduleUpdate, 0));
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
