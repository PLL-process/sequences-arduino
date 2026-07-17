/* TechnoQuest — positionne la flèche, le cadre et le numéro sur une seule ligne de référence. */
"use strict";

(() => {
  /* Attend que le mode Mission ait construit tous ses éléments dynamiques. */
  function waitForMission(attempt = 0) {
    /* Récupère la racine du mode Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère la zone de saisie. */
    const editor = document.getElementById("codeEditor");
    /* Récupère le cadre commun de l’éditeur. */
    const shell = document.getElementById("missionCodeShell");
    /* Récupère la flèche jaune. */
    const arrow = document.getElementById("missionArrow");
    /* Récupère la colonne des numéros. */
    const lineNumbers = document.getElementById("missionLineNumbers");
    /* Récupère le validateur pédagogique. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe le module lorsque tous les éléments existent. */
    if (root && editor && shell && arrow && lineNumbers && validator) {
      /* Lance l’installation principale. */
      installPrecisionArrow({ root, editor, shell, arrow, lineNumbers, validator });
      /* Termine l’attente. */
      return;
    }

    /* Réessaie pendant quelques secondes lorsque l’interface est encore en construction. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe le repère visuel unique de la ligne active. */
  function installPrecisionArrow(refs) {
    /* Évite une seconde installation lors d’un retour au mode Mission. */
    if (refs.shell.dataset.precisionArrowReady === "true") return;
    /* Mémorise que le module est prêt. */
    refs.shell.dataset.precisionArrowReady = "true";

    /* Lit le numéro de la séance. */
    const sessionId = Number(document.body.dataset.session || 1);
    /* Récupère la scène du jumeau numérique. */
    const twinStage = document.getElementById("twinStage");
    /* Crée le cadre horizontal de la ligne active. */
    const targetLine = document.createElement("div");
    /* Applique la classe visuelle. */
    targetLine.className = "mission-target-line";
    /* Masque le cadre avant le premier calcul. */
    targetLine.hidden = true;
    /* Retire ce décor de la lecture vocale. */
    targetLine.setAttribute("aria-hidden", "true");
    /* Ajoute l’étiquette de ligne. */
    targetLine.innerHTML = '<span class="mission-target-line-label">Écrire ici</span>';
    /* Place le cadre dans le même repère que la flèche et la gouttière. */
    refs.shell.appendChild(targetLine);

    /* Regroupe les événements successifs dans une seule image de rendu. */
    let scheduledFrame = 0;
    /* Mémorise la dernière étape afin de détecter une progression. */
    let previousStepId = null;

    /* Indique si le mode Mission est visible. */
    function missionVisible() {
      /* Vérifie la présence dans le document et l’absence de la classe de masquage. */
      return refs.root.isConnected && !refs.root.classList.contains("mission-hidden");
    }

    /* Indique si la simulation est en cours. */
    function simulationActive() {
      /* Recherche la classe appliquée au jumeau pendant l’exécution. */
      return Boolean(twinStage?.classList.contains("mission-simulating"));
    }

    /* Calcule la première ligne réellement éditable encore incomplète. */
    function targetForCurrentCode() {
      /* Valide le programme courant. */
      const result = refs.validator.validate(refs.editor.value, sessionId);
      /* Lit la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Signale la fin du programme lorsque toutes les étapes sont reconnues. */
      if (!stepId) return { result, stepId: null, lineIndex: null };

      /* Demande au validateur enrichi la ligne éditable de cette étape. */
      const rawLine = refs.validator.findLineForStep(
        refs.editor.value,
        stepId,
        result,
        sessionId,
        "edition"
      );
      /* Calcule la dernière ligne disponible. */
      const maximumLine = Math.max(0, refs.editor.value.split("\n").length - 1);
      /* Ramène l’index dans les limites du programme. */
      const lineIndex = Number.isFinite(rawLine)
        ? Math.max(0, Math.min(maximumLine, Math.round(rawLine)))
        : 0;

      /* Retourne la cible complète. */
      return { result, stepId, lineIndex };
    }

    /* Retire l’ancien état visuel des numéros. */
    function clearNumberHighlight() {
      /* Parcourt uniquement les anciens numéros actifs. */
      refs.lineNumbers.querySelectorAll(".mission-target-number").forEach(number => {
        /* Retire la classe jaune. */
        number.classList.remove("mission-target-number");
        /* Retire l’indication d’étape courante. */
        number.removeAttribute("aria-current");
      });
    }

    /* Rend la ligne cible visible dans la fenêtre de l’éditeur. */
    function revealLine(lineIndex) {
      /* Lit les métriques du textarea. */
      const style = window.getComputedStyle(refs.editor);
      /* Convertit la hauteur d’une ligne. */
      const lineHeight = parseFloat(style.lineHeight) || 28;
      /* Convertit la marge intérieure supérieure. */
      const paddingTop = parseFloat(style.paddingTop) || 16;
      /* Calcule le début de la ligne dans le contenu. */
      const lineTop = paddingTop + lineIndex * lineHeight;
      /* Calcule la fin de la zone visible. */
      const visibleBottom = refs.editor.scrollTop + refs.editor.clientHeight - lineHeight;

      /* Défile seulement lorsque la ligne sort de la fenêtre. */
      if (lineTop < refs.editor.scrollTop || lineTop > visibleBottom) {
        /* Place la ligne dans une zone de lecture confortable. */
        const desiredTop = lineTop - refs.editor.clientHeight * .38;
        /* Calcule la limite naturelle du défilement. */
        const maximumTop = Math.max(0, refs.editor.scrollHeight - refs.editor.clientHeight);
        /* Applique une valeur sûre. */
        refs.editor.scrollTop = Math.max(0, Math.min(maximumTop, desiredTop));
      }
    }

    /* Retourne la géométrie du véritable numéro de ligne dans le repère du cadre. */
    function geometryForLine(lineIndex) {
      /* Récupère le numéro de ligne correspondant à l’index. */
      const number = refs.lineNumbers.children[lineIndex];
      /* Signale l’absence temporaire du numéro. */
      if (!number) return null;

      /* Force l’affichage du numéro actif même pendant une reconstruction progressive. */
      number.classList.remove("mission-line-future");
      /* Lit le rectangle du cadre général. */
      const shellRect = refs.shell.getBoundingClientRect();
      /* Lit le rectangle du numéro qui devient la source géométrique unique. */
      const numberRect = number.getBoundingClientRect();
      /* Lit le rectangle de toute la gouttière. */
      const gutterRect = refs.lineNumbers.getBoundingClientRect();

      /* Retourne toutes les coordonnées relatives au cadre commun. */
      return {
        number,
        lineNumber: Number(number.textContent) || lineIndex + 1,
        top: numberRect.top - shellRect.top,
        center: numberRect.top - shellRect.top + numberRect.height / 2,
        height: numberRect.height,
        codeLeft: gutterRect.right - shellRect.left
      };
    }

    /* Place simultanément la flèche, le cadre et le numéro actif. */
    function updatePrecisionArrow({ reveal = false } = {}) {
      /* Ignore les calculs lorsque le mode Mission est masqué. */
      if (!missionVisible()) return;

      /* Pendant la simulation, le moteur historique reprend le contrôle de la flèche. */
      if (simulationActive()) {
        /* Marque la phase d’exécution. */
        refs.shell.classList.add("mission-execution-target");
        /* Masque le cadre d’écriture. */
        targetLine.hidden = true;
        /* Retire le numéro d’écriture. */
        clearNumberHighlight();
        /* Conserve la flèche disponible pour l’exécution. */
        refs.arrow.classList.remove("mission-arrow-complete");
        /* Termine cette mise à jour. */
        return;
      }

      /* Retire la classe d’exécution. */
      refs.shell.classList.remove("mission-execution-target");
      /* Calcule la ligne active. */
      const target = targetForCurrentCode();

      /* Masque tous les repères lorsque le programme est complet. */
      if (target.lineIndex === null) {
        /* Masque la flèche. */
        refs.arrow.classList.add("mission-arrow-complete");
        /* Masque le cadre. */
        targetLine.hidden = true;
        /* Retire le numéro actif. */
        clearNumberHighlight();
        /* Réinitialise l’étape mémorisée. */
        previousStepId = null;
        /* Termine la mise à jour. */
        return;
      }

      /* Détecte un changement d’étape. */
      const stepChanged = target.stepId !== previousStepId;
      /* Mémorise la nouvelle étape. */
      previousStepId = target.stepId;
      /* Rend la cible visible seulement lorsque cela est nécessaire. */
      if (reveal || stepChanged) revealLine(target.lineIndex);

      /* Attend la fin du défilement programmatique avant de mesurer les rectangles. */
      window.requestAnimationFrame(() => {
        /* Récupère la géométrie du numéro de ligne actif. */
        const geometry = geometryForLine(target.lineIndex);
        /* Réessaie plus tard lorsque les numéros sont en cours de reconstruction. */
        if (!geometry) {
          scheduleUpdate();
          return;
        }

        /* Retire l’ancien numéro actif. */
        clearNumberHighlight();
        /* Met en évidence le numéro réellement mesuré. */
        geometry.number.classList.add("mission-target-number");
        /* Indique qu’il représente l’étape en cours. */
        geometry.number.setAttribute("aria-current", "step");

        /* Affiche la flèche. */
        refs.arrow.classList.remove("mission-arrow-complete");
        /* Place la flèche dans sa zone réservée, sans recouvrir le numéro. */
        refs.arrow.style.left = ".45rem";
        /* Aligne le centre de la flèche sur le centre exact du numéro. */
        refs.arrow.style.top = `${geometry.center}px`;
        /* Décrit la ligne visée. */
        refs.arrow.setAttribute("aria-label", `Ligne ${geometry.lineNumber} à compléter`);
        /* Ajoute la même information au survol. */
        refs.arrow.title = `Écrire à la ligne ${geometry.lineNumber}`;

        /* Affiche le cadre. */
        targetLine.hidden = false;
        /* Commence le cadre après toute la gouttière. */
        targetLine.style.left = `${geometry.codeLeft}px`;
        /* Aligne le haut du cadre sur le haut exact du numéro. */
        targetLine.style.top = `${geometry.top}px`;
        /* Donne au cadre exactement la hauteur du numéro. */
        targetLine.style.height = `${geometry.height}px`;
        /* Affiche le même numéro que celui mesuré dans la gouttière. */
        targetLine.querySelector(".mission-target-line-label").textContent = `Écrire ici · ligne ${geometry.lineNumber}`;
      });
    }

    /* Programme une seule mise à jour par image de rendu. */
    function scheduleUpdate(options = {}) {
      /* Annule la demande précédente. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Programme le nouveau calcul. */
      scheduledFrame = window.requestAnimationFrame(() => updatePrecisionArrow(options));
    }

    /* Recalcule après chaque modification ou déplacement utile. */
    refs.editor.addEventListener("input", () => scheduleUpdate({ reveal: true }));
    /* Recalcule après un défilement. */
    refs.editor.addEventListener("scroll", () => scheduleUpdate(), { passive: true });
    /* Recalcule après une navigation au clavier. */
    refs.editor.addEventListener("keyup", () => scheduleUpdate());
    /* Recalcule après un clic. */
    refs.editor.addEventListener("click", () => scheduleUpdate());

    /* Recalcule lorsque la taille de l’écran change. */
    window.addEventListener("resize", () => scheduleUpdate());
    /* Recalcule lors d’un passage en plein écran. */
    document.addEventListener("fullscreenchange", () => scheduleUpdate({ reveal: true }));

    /* Les numéros sont recréés après chaque saisie et validation. */
    const lineObserver = new MutationObserver(() => scheduleUpdate());
    /* Observe les ajouts, suppressions et changements de classe. */
    lineObserver.observe(refs.lineNumbers, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    /* L’activation du mode Mission déclenche un nouveau calcul. */
    const rootObserver = new MutationObserver(() => {
      /* Recalcule uniquement lorsque le mode devient visible. */
      if (missionVisible()) scheduleUpdate({ reveal: true });
    });
    /* Observe la classe de visibilité. */
    rootObserver.observe(refs.root, { attributes: true, attributeFilter: ["class"] });

    /* Les changements de simulation modifient le type de repère. */
    if (twinStage) {
      /* Crée l’observateur de la scène. */
      const simulationObserver = new MutationObserver(() => scheduleUpdate());
      /* Observe la classe de simulation. */
      simulationObserver.observe(twinStage, { attributes: true, attributeFilter: ["class"] });
    }

    /* Les actions principales peuvent modifier la prochaine étape. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      /* Attend la fin du gestionnaire historique avant de recalculer. */
      document.getElementById(id)?.addEventListener("click", () => {
        /* Recalcule après la modification éventuelle du programme. */
        window.setTimeout(() => scheduleUpdate({ reveal: true }), 0);
      });
    });

    /* Un changement de niveau remplace le squelette. */
    document.getElementById("missionHelpLevel")?.addEventListener("change", () => {
      /* Recalcule après l’installation du nouveau squelette. */
      window.setTimeout(() => scheduleUpdate({ reveal: true }), 0);
    });

    /* Lance le premier calcul. */
    scheduleUpdate({ reveal: true });
  }

  /* Démarre après la construction du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque la page est encore en construction. */
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    /* Lance immédiatement l’attente lorsque le document est déjà prêt. */
    waitForMission();
  }
})();
