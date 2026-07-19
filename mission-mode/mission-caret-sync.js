/* TechnoQuest Mission Mode — synchronisation du curseur, de la flèche et de la ligne guidée. */
"use strict";

(() => {
  /* Récupère le validateur partagé par les huit missions. */
  const validator = window.TechnoQuestMissionValidator;
  /* Arrête le module lorsque le validateur n’est pas encore disponible. */
  if (!validator) return;

  /* Conserve la méthode d’origine pour le mode simulation. */
  const originalFindLineForStep = validator.findLineForStep.bind(validator);

  /* Teste une expression régulière sans conserver son ancien index interne. */
  function regexMatches(pattern, value) {
    /* Refuse un motif absent. */
    if (!pattern) return false;
    /* Réinitialise les expressions utilisant le drapeau global. */
    pattern.lastIndex = 0;
    /* Retourne le résultat du test. */
    return pattern.test(value);
  }

  /* Cherche la ligne vide ou le marqueur placé sous une consigne. */
  function findNearbyTarget(lines, markerIndex) {
    /* Limite la recherche aux quatre lignes qui suivent la consigne. */
    const lastIndex = Math.min(lines.length - 1, markerIndex + 4);

    /* Recherche d’abord un emplacement explicitement marqué. */
    for (let index = markerIndex; index <= lastIndex; index += 1) {
      /* Retourne immédiatement le marqueur trouvé. */
      if (/_{3,}|TODO|A_COMPLETER/i.test(lines[index])) return index;
    }

    /* Recherche ensuite la première ligne vide placée sous le commentaire. */
    for (let index = markerIndex + 1; index <= lastIndex; index += 1) {
      /* Retire les espaces afin d’identifier une vraie ligne vide. */
      const trimmed = lines[index].trim();
      /* Retourne la ligne vide. */
      if (!trimmed) return index;
      /* Arrête la recherche lorsqu’une nouvelle section commence. */
      if (/^\/\//.test(trimmed) || /^[{}]/.test(trimmed)) break;
    }

    /* Utilise la ligne de la consigne seulement en dernier recours. */
    return markerIndex;
  }

  /* Rend plus précise la recherche de la ligne attendue en mode édition. */
  validator.findLineForStep = function findLineForStep(code, stepId, result, sessionId = 1, mode = "edition") {
    /* Laisse la simulation utiliser son comportement historique. */
    if (mode === "simulation") {
      /* Délègue le calcul à la méthode originale. */
      return originalFindLineForStep(code, stepId, result, sessionId, mode);
    }

    /* Transforme le programme en tableau de lignes. */
    const lines = String(code || "").split("\n");
    /* Retourne la dernière ligne lorsque l’étape n’est pas connue. */
    if (!stepId) return Math.max(0, lines.length - 1);

    /* Récupère les étapes propres à la séance. */
    const steps = typeof validator.getSteps === "function" ? validator.getSteps(sessionId) : [];
    /* Retrouve la définition complète de l’étape. */
    const step = steps.find(item => item.id === stepId) || validator.stepTemplates?.[stepId];
    /* Récupère le contexte calculé par le validateur. */
    const context = result?.context || {};
    /* Produit le motif de la ligne attendue. */
    const pattern = typeof step?.line === "function" ? step.line(context) : step?.line;

    /* Recherche une instruction déjà présente mais encore incomplète. */
    if (pattern) {
      /* Stocke toutes les lignes correspondant au motif. */
      const indexes = [];
      /* Examine chaque ligne du programme. */
      lines.forEach((line, index) => {
        /* Ajoute l’index lorsque la ligne correspond. */
        if (regexMatches(pattern, line)) indexes.push(index);
      });
      /* Retourne la première ou la dernière occurrence selon l’étape. */
      if (indexes.length) return step.last ? indexes[indexes.length - 1] : indexes[0];
    }

    /* Recherche la consigne textuelle associée à l’étape. */
    const marker = step?.marker;
    /* Parcourt les lignes lorsque la consigne existe. */
    if (marker) {
      /* Examine le programme ligne par ligne. */
      for (let index = 0; index < lines.length; index += 1) {
        /* Retourne la zone de saisie proche de la consigne trouvée. */
        if (regexMatches(marker, lines[index])) return findNearbyTarget(lines, index);
      }
    }

    /* Recherche un emplacement générique laissé dans le squelette. */
    const placeholderIndex = lines.findIndex(line => /_{3,}|TODO|A_COMPLETER/i.test(line));
    /* Utilise cet emplacement lorsqu’il existe. */
    if (placeholderIndex >= 0) return placeholderIndex;

    /* Termine par le calcul historique du validateur. */
    return originalFindLineForStep(code, stepId, result, sessionId, mode);
  };

  /* Exécute une fonction dès que le document est utilisable. */
  function ready(callback) {
    /* Attend DOMContentLoaded lorsque le document est encore en construction. */
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback);
    /* Exécute immédiatement la fonction dans les autres cas. */
    else callback();
  }

  /* Installe le guidage du curseur après la création du mode Mission. */
  ready(() => {
    /* Lit le numéro de la séance depuis la page. */
    const sessionId = Number(document.body.dataset.session || 0);
    /* Récupère la racine du mode Mission. */
    const root = document.querySelector("#missionModeRoot");
    /* Récupère la zone réelle de saisie. */
    const editor = document.querySelector("#codeEditor");
    /* Récupère le jumeau numérique afin de distinguer écriture et simulation. */
    const twinStage = document.querySelector("#twinStage");
    /* Récupère le bouton d’activation du mode Mission. */
    const activateButton = document.querySelector("#missionActivate");
    /* Récupère le bouton de vérification. */
    const checkButton = document.querySelector("#missionCheck");
    /* Récupère le bouton de restauration. */
    const resetButton = document.querySelector("#missionReset");
    /* Récupère le bouton d’arrêt. */
    const stopButton = document.querySelector("#missionStop");
    /* Récupère le sélecteur du niveau d’aide. */
    const modeSelect = document.querySelector("#missionHelpLevel");
    /* Récupère la coque de l’éditeur pour y placer le message pédagogique. */
    const codeShell = document.querySelector("#missionCodeShell");

    /* Arrête l’installation hors des séances prévues ou sans éditeur. */
    if (sessionId < 1 || sessionId > 8 || !root || !editor) return;

    /* Mémorise la dernière étape active. */
    let lastStepId = null;
    /* Mémorise le dernier numéro de ligne verrouillé. */
    let lockedLineIndex = null;
    /* Mémorise le minuteur de placement automatique. */
    let placementTimer = 0;
    /* Mémorise le minuteur du message pédagogique. */
    let noticeTimer = 0;
    /* Empêche une boucle pendant une correction automatique de sélection. */
    let correctingSelection = false;

    /* Crée le message expliquant pourquoi le curseur reste sur la ligne attendue. */
    const lockNotice = document.createElement("div");
    /* Applique la classe visuelle du message. */
    lockNotice.className = "mission-line-lock-note";
    /* Rend les changements de texte accessibles aux lecteurs d’écran. */
    lockNotice.setAttribute("aria-live", "polite");
    /* Masque le message au démarrage. */
    lockNotice.hidden = true;
    /* Ajoute le message sous l’éditeur lorsque la coque existe. */
    codeShell?.appendChild(lockNotice);

    /* Indique si le mode Mission est affiché. */
    function missionVisible() {
      /* Vérifie la présence dans le document et l’absence de la classe de masquage. */
      return root.isConnected && !root.classList.contains("mission-hidden");
    }

    /* Indique si la simulation est en cours. */
    function simulationActive() {
      /* Recherche la classe appliquée pendant l’exécution. */
      return Boolean(twinStage?.classList.contains("mission-simulating"));
    }

    /* Active le verrouillage seulement dans le niveau Guidé. */
    function guidedLockEnabled() {
      /* Compare la valeur sélectionnée au mode guidé. */
      return modeSelect?.value === "guided";
    }

    /* Calcule la première étape encore incomplète. */
    function currentTarget() {
      /* Valide le programme actuel. */
      const result = validator.validate(editor.value, sessionId);
      /* Récupère l’identifiant de la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Recherche la ligne correspondant à cette étape. */
      const line = validator.findLineForStep(editor.value, stepId, result, sessionId, "edition");
      /* Retourne toutes les informations utiles. */
      return { result, stepId, line };
    }

    /* Retourne les limites absolues d’une ligne dans la chaîne du programme. */
    function boundsForLine(lineIndex) {
      /* Découpe le programme en lignes. */
      const lines = editor.value.split("\n");
      /* Ramène l’index dans les limites du programme. */
      const safeLine = Math.max(0, Math.min(lineIndex, lines.length - 1));
      /* Additionne les longueurs des lignes précédentes et leurs retours à la ligne. */
      const start = lines.slice(0, safeLine).reduce((total, line) => total + line.length + 1, 0);
      /* Calcule la fin de la ligne sans inclure le retour à la ligne. */
      const end = start + (lines[safeLine] || "").length;
      /* Retourne le texte et les limites calculées. */
      return { safeLine, start, end, text: lines[safeLine] || "" };
    }

    /* Détermine la ligne contenant une position absolue du curseur. */
    function lineForPosition(position) {
      /* Compte les retours à la ligne placés avant la position. */
      return editor.value.slice(0, Math.max(0, position)).split("\n").length - 1;
    }

    /* Calcule l’emplacement pédagogique initial d’une ligne. */
    function selectionForLine(lineIndex, preferredColumn = null) {
      /* Récupère les limites et le texte de la ligne. */
      const bounds = boundsForLine(lineIndex);
      /* Recherche un marqueur explicite à sélectionner. */
      const placeholder = bounds.text.match(/_{3,}|TODO|A_COMPLETER/i);

      /* Sélectionne le marqueur lorsque celui-ci existe. */
      if (placeholder && typeof placeholder.index === "number") {
        /* Calcule le début du marqueur. */
        const start = bounds.start + placeholder.index;
        /* Retourne la plage du marqueur. */
        return { safeLine: bounds.safeLine, start, end: start + placeholder[0].length };
      }

      /* Calcule le retrait initial de la ligne. */
      const indentation = bounds.text.match(/^\s*/)?.[0].length || 0;
      /* Utilise la colonne demandée sans dépasser la longueur de la ligne. */
      const column = preferredColumn === null
        /* Place le curseur après le retrait lors d’un changement d’étape. */
        ? indentation
        /* Conserve la colonne relative pendant le verrouillage. */
        : Math.max(indentation, Math.min(preferredColumn, bounds.text.length));
      /* Calcule la position absolue du curseur. */
      const position = bounds.start + column;
      /* Retourne une sélection réduite à cette position. */
      return { safeLine: bounds.safeLine, start: position, end: position };
    }

    /* Fait défiler l’éditeur afin de garder la ligne active visible. */
    function scrollLineIntoView(lineIndex) {
      /* La géométrie guidée est l'écrivain unique du défilement : ne rien faire ici. */
      if (window.__TQ_GEOMETRY_CLAIM__) return;
      /* Lit les métriques réellement appliquées au textarea. */
      const style = window.getComputedStyle(editor);
      /* Convertit la hauteur d’une ligne. */
      const lineHeight = parseFloat(style.lineHeight) || 24;
      /* Convertit la marge intérieure supérieure. */
      const paddingTop = parseFloat(style.paddingTop) || 16;
      /* Calcule la position verticale de la ligne dans le contenu. */
      const targetTop = paddingTop + lineIndex * lineHeight;
      /* Définit une position de lecture confortable. */
      const desiredTop = targetTop - editor.clientHeight * 0.35;
      /* Calcule la valeur maximale du défilement. */
      const maximumTop = Math.max(0, editor.scrollHeight - editor.clientHeight);
      /* Applique une valeur comprise dans les limites. */
      editor.scrollTop = Math.max(0, Math.min(maximumTop, desiredTop));
      /* Synchronise les autres couches encore à l’écoute du défilement. */
      editor.dispatchEvent(new Event("scroll"));
    }

    /* Affiche brièvement la raison du verrouillage. */
    function announceLock(lineIndex) {
      /* Arrête l’ancien minuteur du message. */
      window.clearTimeout(noticeTimer);
      /* Écrit le message associé à la ligne attendue. */
      lockNotice.textContent = `Complétez d’abord la ligne ${lineIndex + 1}. Le curseur passera ensuite automatiquement à l’étape suivante.`;
      /* Affiche le message. */
      lockNotice.hidden = false;
      /* Programme sa disparition. */
      noticeTimer = window.setTimeout(() => {
        /* Masque le message après deux secondes. */
        lockNotice.hidden = true;
      }, 2200);
    }

    /* Place le curseur sur la ligne attendue. */
    function placeCaret(force = false, preferredColumn = null) {
      /* Ignore la demande hors du mode Mission ou pendant la simulation. */
      if (!missionVisible() || simulationActive()) return;

      /* Calcule la cible pédagogique actuelle. */
      const target = currentTarget();
      /* Libère le verrouillage lorsque tout est terminé. */
      if (!target.stepId) {
        /* Réinitialise l’étape mémorisée. */
        lastStepId = null;
        /* Réinitialise la ligne mémorisée. */
        lockedLineIndex = null;
        /* Termine sans déplacer le curseur. */
        return;
      }

      /* Évite un déplacement inutile lorsque l’étape n’a pas changé. */
      if (!force && target.stepId === lastStepId) return;

      /* Mémorise l’étape active. */
      lastStepId = target.stepId;
      /* Mémorise la ligne active. */
      lockedLineIndex = target.line;
      /* Calcule la sélection à appliquer. */
      const selection = selectionForLine(target.line, preferredColumn);

      /* Attend la prochaine image afin de laisser l’interface finir son rendu. */
      window.requestAnimationFrame(() => {
        /* Vérifie une nouvelle fois que l’éditeur doit recevoir le focus. */
        if (!missionVisible() || simulationActive()) return;
        /* Active le textarea sans déplacer toute la page. */
        editor.focus({ preventScroll: true });
        /* Place le curseur ou sélectionne le marqueur. */
        editor.setSelectionRange(selection.start, selection.end);
        /* Rend la ligne visible. */
        scrollLineIntoView(selection.safeLine);
      });
    }

    /* Replace le curseur sur la ligne verrouillée en conservant sa colonne relative. */
    function enforceGuidedLine({ announce = false } = {}) {
      /* Ignore les appels récursifs déclenchés par setSelectionRange. */
      if (correctingSelection) return;
      /* Ignore le verrouillage hors du niveau Guidé. */
      if (!guidedLockEnabled()) return;
      /* Ignore le verrouillage hors du mode Mission ou pendant la simulation. */
      if (!missionVisible() || simulationActive()) return;

      /* Calcule l’étape réellement active. */
      const target = currentTarget();
      /* Libère le curseur lorsque le programme est complet. */
      if (!target.stepId) return;
      /* Mémorise la ligne attendue la plus récente. */
      lockedLineIndex = target.line;

      /* Calcule la ligne du début de la sélection. */
      const startLine = lineForPosition(editor.selectionStart);
      /* Calcule la ligne de fin de la sélection. */
      const endLine = lineForPosition(editor.selectionEnd);
      /* Ne fait rien lorsque toute la sélection reste sur la bonne ligne. */
      if (startLine === target.line && endLine === target.line) return;

      /* Calcule la colonne relative actuellement visée. */
      const currentBounds = boundsForLine(startLine);
      /* Retient la colonne sans valeur négative. */
      const preferredColumn = Math.max(0, editor.selectionStart - currentBounds.start);
      /* Calcule la position équivalente sur la ligne attendue. */
      const selection = selectionForLine(target.line, preferredColumn);

      /* Active le garde-fou contre les événements récursifs. */
      correctingSelection = true;
      /* Replace immédiatement le curseur sur la ligne pédagogique. */
      editor.setSelectionRange(selection.start, selection.end);
      /* Rend la ligne visible. */
      scrollLineIntoView(selection.safeLine);
      /* Libère le garde-fou à la prochaine image. */
      window.requestAnimationFrame(() => {
        /* Autorise les futurs contrôles. */
        correctingSelection = false;
      });

      /* Affiche une explication lorsque le déplacement venait de l’utilisateur. */
      if (announce) announceLock(target.line);
    }

    /* Programme un placement automatique sans cumuler les minuteurs. */
    function scheduleCaret(force = false) {
      /* Annule le placement précédent. */
      window.clearTimeout(placementTimer);
      /* Programme le nouveau placement après les autres gestionnaires. */
      placementTimer = window.setTimeout(() => placeCaret(force), 0);
    }

    /* Empêche les opérations qui fusionneraient ou créeraient une autre ligne. */
    editor.addEventListener("beforeinput", event => {
      /* Ignore les restrictions hors du niveau Guidé. */
      if (!guidedLockEnabled() || !missionVisible() || simulationActive()) return;
      /* Calcule la cible actuelle. */
      const target = currentTarget();
      /* Ignore le verrouillage lorsque l’étape est terminée. */
      if (!target.stepId) return;
      /* Récupère les limites de la ligne attendue. */
      const bounds = boundsForLine(target.line);
      /* Détecte une création de nouvelle ligne. */
      const createsLine = event.inputType === "insertLineBreak" || event.inputType === "insertParagraph";
      /* Détecte un collage contenant au moins un retour à la ligne. */
      const multilinePaste = event.inputType === "insertFromPaste" && String(event.data || "").includes("\n");
      /* Détecte une suppression arrière qui fusionnerait avec la ligne précédente. */
      const mergesBackward = event.inputType === "deleteContentBackward" && editor.selectionStart === editor.selectionEnd && editor.selectionStart <= bounds.start;
      /* Détecte une suppression avant qui fusionnerait avec la ligne suivante. */
      const mergesForward = event.inputType === "deleteContentForward" && editor.selectionStart === editor.selectionEnd && editor.selectionStart >= bounds.end;

      /* Bloque les opérations qui quitteraient la ligne active. */
      if (createsLine || multilinePaste || mergesBackward || mergesForward) {
        /* Annule l’opération native. */
        event.preventDefault();
        /* Replace le curseur sur la bonne ligne. */
        enforceGuidedLine({ announce: true });
        /* Explique le verrouillage. */
        announceLock(target.line);
      }
    });

    /* Intercepte les touches de navigation verticale dans le niveau Guidé. */
    editor.addEventListener("keydown", event => {
      /* Laisse fonctionner les raccourcis avec Ctrl, Alt ou Meta. */
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      /* Ignore les restrictions hors du niveau Guidé. */
      if (!guidedLockEnabled() || !missionVisible() || simulationActive()) return;
      /* Liste les touches qui changeraient de ligne. */
      const verticalKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown"];
      /* Bloque ces touches tant que la ligne n’est pas validée. */
      if (verticalKeys.includes(event.key)) {
        /* Annule le déplacement vertical natif. */
        event.preventDefault();
        /* Replace le curseur et affiche le message. */
        enforceGuidedLine({ announce: true });
      }
    });

    /* Contrôle le résultat d’un clic après le placement natif du navigateur. */
    editor.addEventListener("click", () => {
      /* Attend que le navigateur ait terminé de calculer selectionStart. */
      window.setTimeout(() => enforceGuidedLine({ announce: true }), 0);
    });

    /* Contrôle également les sélections effectuées à la souris. */
    editor.addEventListener("mouseup", () => {
      /* Attend la fin du geste de sélection. */
      window.setTimeout(() => enforceGuidedLine({ announce: true }), 0);
    });

    /* Contrôle les sélections produites par le clavier ou le système. */
    document.addEventListener("selectionchange", () => {
      /* Ignore les changements concernant un autre élément. */
      if (document.activeElement !== editor) return;
      /* Contrôle la ligne à la prochaine image. */
      window.requestAnimationFrame(() => enforceGuidedLine());
    });

    /* Valide la ligne après chaque modification du programme. */
    editor.addEventListener("input", () => {
      /* Calcule la prochaine étape manquante. */
      const nextStepId = validator.validate(editor.value, sessionId).firstMissing?.id || null;
      /* Déplace automatiquement le curseur seulement lorsque l’étape est validée. */
      if (nextStepId !== lastStepId) scheduleCaret(true);
      /* Maintient sinon le curseur sur la ligne active. */
      else window.requestAnimationFrame(() => enforceGuidedLine());
    });

    /* Replace le curseur lors de l’activation du mode Mission. */
    activateButton?.addEventListener("click", () => scheduleCaret(true));
    /* Replace le curseur après une vérification. */
    checkButton?.addEventListener("click", () => scheduleCaret(true));
    /* Replace le curseur après une restauration. */
    resetButton?.addEventListener("click", () => scheduleCaret(true));
    /* Replace le curseur après l’arrêt d’une simulation. */
    stopButton?.addEventListener("click", () => scheduleCaret(true));
    /* Recalcule le comportement lors d’un changement de niveau. */
    modeSelect?.addEventListener("change", () => {
      /* Masque l’ancien message. */
      lockNotice.hidden = true;
      /* Place le curseur sur la première étape du nouveau squelette. */
      scheduleCaret(true);
    });

    /* Initialise le curseur lorsque le mode Mission est déjà visible. */
    if (missionVisible()) scheduleCaret(true);
  });
})();
