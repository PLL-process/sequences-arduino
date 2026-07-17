/* TechnoQuest — repère stable fondé sur le véritable numéro de ligne affiché. */
"use strict";

(() => {
  /* Attend la construction du mode Mission. */
  function waitForMission(attempt = 0) {
    /* Récupère les éléments nécessaires. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère l’éditeur. */
    const editor = document.getElementById("codeEditor");
    /* Récupère son cadre commun. */
    const shell = document.getElementById("missionCodeShell");
    /* Récupère la flèche. */
    const arrow = document.getElementById("missionArrow");
    /* Récupère la colonne des numéros. */
    const lineNumbers = document.getElementById("missionLineNumbers");
    /* Récupère le validateur. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe le repère lorsque tout est prêt. */
    if (root && editor && shell && arrow && lineNumbers && validator) {
      /* Lance l’installation principale. */
      installStableArrow({ root, editor, shell, arrow, lineNumbers, validator });
      /* Termine l’attente. */
      return;
    }

    /* Réessaie pendant quelques secondes si nécessaire. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe un seul calcul partagé par la flèche, le numéro et le cadre. */
  function installStableArrow(refs) {
    /* Bloque l’ancien module de précision lorsqu’il est encore chargé. */
    refs.shell.dataset.precisionArrowReady = "true";
    /* Évite une seconde installation de ce nouveau module. */
    if (refs.shell.dataset.stableArrowReady === "true") return;
    /* Mémorise que le module est prêt. */
    refs.shell.dataset.stableArrowReady = "true";

    /* Lit le numéro de séance. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Récupère la scène de simulation. */
    const twinStage = document.getElementById("twinStage");
    /* Crée le cadre horizontal. */
    const targetLine = document.createElement("div");
    /* Applique sa classe. */
    targetLine.className = "mission-target-line";
    /* Masque le cadre avant le premier calcul. */
    targetLine.hidden = true;
    /* Retire ce décor de la lecture vocale. */
    targetLine.setAttribute("aria-hidden", "true");
    /* Ajoute son étiquette. */
    targetLine.innerHTML = '<span class="mission-target-line-label">Écrire ici</span>';
    /* Place le cadre dans le repère commun. */
    refs.shell.appendChild(targetLine);

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

    /* Retire proprement l’ancien numéro actif. */
    function clearActiveNumber() {
      /* Ne fait rien lorsqu’aucun numéro n’est actif. */
      if (!activeNumber) return;
      /* Retire la classe jaune. */
      activeNumber.classList.remove("mission-target-number");
      /* Retire l’attribut d’étape. */
      activeNumber.removeAttribute("aria-current");
      /* Oublie la référence. */
      activeNumber = null;
    }

    /* Calcule la ligne active à partir du validateur enrichi. */
    function currentTargetLine() {
      /* Valide le programme. */
      const result = refs.validator.validate(refs.editor.value, sessionId);
      /* Lit la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Signale une mission terminée. */
      if (!stepId) return null;
      /* Demande la ligne éditable exacte. */
      const lineIndex = refs.validator.findLineForStep(refs.editor.value, stepId, result, sessionId, "edition");
      /* Calcule la dernière ligne disponible. */
      const maximumLine = Math.max(0, refs.editor.value.split("\n").length - 1);
      /* Retourne un index sûr. */
      return Math.max(0, Math.min(maximumLine, Math.round(Number(lineIndex) || 0)));
    }

    /* Met à jour simultanément les trois repères. */
    function updateArrow() {
      /* Ignore les calculs lorsque le mode est masqué. */
      if (!missionVisible()) return;

      /* Pendant la simulation, masque le cadre d’écriture. */
      if (simulationActive()) {
        /* Ajoute la classe d’exécution. */
        refs.shell.classList.add("mission-execution-target");
        /* Masque le cadre. */
        targetLine.hidden = true;
        /* Retire le numéro d’écriture. */
        clearActiveNumber();
        /* Termine la mise à jour. */
        return;
      }

      /* Retire la classe de simulation. */
      refs.shell.classList.remove("mission-execution-target");
      /* Calcule l’index cible. */
      const lineIndex = currentTargetLine();

      /* Masque les repères lorsque tout est validé. */
      if (lineIndex === null) {
        /* Masque la flèche. */
        refs.arrow.classList.add("mission-arrow-complete");
        /* Masque le cadre. */
        targetLine.hidden = true;
        /* Retire le numéro actif. */
        clearActiveNumber();
        /* Termine la mise à jour. */
        return;
      }

      /* Récupère le véritable élément du numéro de ligne. */
      const number = refs.lineNumbers.children[lineIndex];
      /* Attend sa création lorsqu’il manque temporairement. */
      if (!number) return;
      /* Force l’affichage du numéro actif même si les lignes futures sont masquées. */
      number.classList.remove("mission-line-future");

      /* Remplace l’ancien numéro seulement lorsque la cible change. */
      if (activeNumber !== number) {
        /* Retire l’ancien état. */
        clearActiveNumber();
        /* Mémorise le nouveau numéro. */
        activeNumber = number;
        /* Applique la classe de cible. */
        activeNumber.classList.add("mission-target-number");
        /* Indique l’étape courante. */
        activeNumber.setAttribute("aria-current", "step");
      }

      /* Lit les rectangles dans un même repère DOM. */
      const shellRect = refs.shell.getBoundingClientRect();
      /* Lit le rectangle du numéro actif. */
      const numberRect = number.getBoundingClientRect();
      /* Lit le rectangle de la gouttière entière. */
      const gutterRect = refs.lineNumbers.getBoundingClientRect();
      /* Convertit le texte du numéro. */
      const displayedLineNumber = Number(number.textContent) || lineIndex + 1;
      /* Calcule le haut relatif. */
      const relativeTop = numberRect.top - shellRect.top;
      /* Calcule le centre relatif. */
      const relativeCenter = relativeTop + numberRect.height / 2;
      /* Calcule le début de la zone de code. */
      const codeLeft = gutterRect.right - shellRect.left;

      /* Affiche la flèche. */
      refs.arrow.classList.remove("mission-arrow-complete");
      /* La conserve dans la partie gauche de la gouttière. */
      refs.arrow.style.left = ".45rem";
      /* Aligne son centre sur le centre du numéro. */
      refs.arrow.style.top = `${relativeCenter}px`;
      /* Décrit la cible. */
      refs.arrow.setAttribute("aria-label", `Ligne ${displayedLineNumber} à compléter`);
      /* Ajoute une info-bulle équivalente. */
      refs.arrow.title = `Écrire à la ligne ${displayedLineNumber}`;

      /* Affiche le cadre. */
      targetLine.hidden = false;
      /* Commence après la gouttière. */
      targetLine.style.left = `${codeLeft}px`;
      /* Utilise exactement le haut du numéro. */
      targetLine.style.top = `${relativeTop}px`;
      /* Utilise exactement la hauteur du numéro. */
      targetLine.style.height = `${numberRect.height}px`;
      /* Affiche le même numéro dans l’étiquette. */
      targetLine.querySelector(".mission-target-line-label").textContent = `Écrire ici · ligne ${displayedLineNumber}`;
    }

    /* Programme une seule mise à jour dans la prochaine image. */
    function scheduleUpdate() {
      /* Annule l’ancienne demande. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Attend une image de rendu. */
      scheduledFrame = window.requestAnimationFrame(updateArrow);
    }

    /* Recalcule après les interactions de l’éditeur. */
    ["input", "keyup", "click"].forEach(eventName => refs.editor.addEventListener(eventName, scheduleUpdate));
    /* Recalcule pendant le défilement. */
    refs.editor.addEventListener("scroll", scheduleUpdate, { passive: true });
    /* Recalcule lorsque la fenêtre change de taille. */
    window.addEventListener("resize", scheduleUpdate);
    /* Recalcule en plein écran. */
    document.addEventListener("fullscreenchange", scheduleUpdate);

    /* Les numéros sont recréés après les saisies et validations. */
    const lineObserver = new MutationObserver(scheduleUpdate);
    /* Observe uniquement la structure afin d’éviter toute boucle de classes. */
    lineObserver.observe(refs.lineNumbers, { childList: true, subtree: true });

    /* Recalcule lorsque le mode devient visible. */
    const rootObserver = new MutationObserver(scheduleUpdate);
    /* Observe seulement la classe de visibilité. */
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });

    /* Recalcule lorsque la simulation change d’état. */
    if (twinStage) {
      /* Crée l’observateur de simulation. */
      const twinObserver = new MutationObserver(scheduleUpdate);
      /* Observe uniquement la classe. */
      twinObserver.observe(twinStage, { attributes: true, attributeFilter: ["class"] });
    }

    /* Recalcule après les principales actions. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      /* Attend la fin de l’action historique. */
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
    /* Lance immédiatement l’attente. */
    waitForMission();
  }
})();
