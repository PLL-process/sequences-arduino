/* TechnoQuest — CONTRÔLEUR de la géométrie ET de la navigation guidées : écouteurs, boucle rAF, */
/* ÉCRIVAIN UNIQUE du cadre, de la flèche, de la surbrillance, du numéro actif et du scrollTop. */
/* Il est aussi le SEUL gestionnaire du curseur, de la navigation entre lignes révélées, de la */
/* surbrillance secondaire (ligne éditée), du bouton « Revenir à l'étape » et du recentrage à la */
/* demande. Il consomme le moteur pur (TechnoQuestGuidedGeometryEngine), la cible canonique */
/* (TechnoQuestMissionGuidedTarget) et le modèle de cible (TechnoQuestMissionTargetModel). */
/* En revendiquant la géométrie ET le curseur, il neutralise les anciens écrivains concurrents. */
"use strict";

(() => {
  /* Revendique immédiatement la propriété de la géométrie guidée (lu par les anciens écrivains). */
  window.__TQ_GEOMETRY_CLAIM__ = true;
  /* Revendique la propriété du curseur guidé (lu par mission-caret-sync pour se retirer). */
  window.__TQ_CARET_CLAIM__ = true;

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
    /* Fabrique du modèle de cible. */
    const modelFactory = window.TechnoQuestMissionTargetModel;
    /* Validateur partagé. */
    const validator = window.TechnoQuestMissionValidator;

    /* Installe lorsque tout est disponible. */
    if (root && editor && highlight && shell && arrow && lineNumbers && guidedTarget && engineFactory && modelFactory && validator) {
      /* Lance l'installation. */
      install({
        /* Racine Mission. */
        root,
        /* Zone de saisie. */
        editor,
        /* Coloration. */
        highlight,
        /* Repère commun. */
        shell,
        /* Flèche. */
        arrow,
        /* Numéros. */
        lineNumbers,
        /* Cible canonique. */
        guidedTarget,
        /* Validateur. */
        validator,
        /* Moteur de géométrie. */
        engine: engineFactory.create({ editor, shell, lineNumbers }),
        /* Modèle de cible. */
        model: modelFactory.create({ validator, guidedTarget })
      });
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
    /* Modèle de cible (classification des lignes). */
    const targetModel = refs.model;

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

    /* Réutilise ou crée la surbrillance SECONDAIRE de la ligne révélée en cours d'édition. */
    const editingBand = refs.shell.querySelector(".mission-editing-line") || document.createElement("div");
    /* Applique sa classe. */
    editingBand.className = "mission-editing-line";
    /* Retire ce décor de la lecture vocale. */
    editingBand.setAttribute("aria-hidden", "true");
    /* Insère la bande secondaire si nécessaire. */
    if (!editingBand.isConnected) refs.shell.appendChild(editingBand);
    /* Masque la bande secondaire avant le premier calcul. */
    editingBand.hidden = true;

    /* Crée le message accessible expliquant un verrouillage. */
    const lockNotice = refs.shell.querySelector(".mission-line-lock-note") || document.createElement("div");
    /* Applique sa classe. */
    lockNotice.className = "mission-line-lock-note";
    /* Rend le message audible aux lecteurs d'écran. */
    lockNotice.setAttribute("aria-live", "polite");
    /* Insère le message si nécessaire. */
    if (!lockNotice.isConnected) refs.shell.appendChild(lockNotice);
    /* Masque le message au démarrage. */
    lockNotice.hidden = true;

    /* Crée ou récupère le bouton « Revenir à l'étape » dans la barre d'outils pédagogique. */
    const toolbar = refs.root.querySelector(".mission-toolbar");
    /* Bouton de recentrage à la demande. */
    let returnButton = toolbar?.querySelector(".mission-return-step") || null;
    /* Construit le bouton lorsqu'il manque et que la barre existe. */
    if (toolbar && !returnButton) {
      /* Crée le bouton. */
      returnButton = document.createElement("button");
      /* Bouton non soumis. */
      returnButton.type = "button";
      /* Classe visuelle compacte. */
      returnButton.className = "mission-return-step";
      /* Intitulé visible. */
      returnButton.textContent = "Revenir à l'étape";
      /* Intitulé accessible complet. */
      returnButton.setAttribute("aria-label", "Revenir à la ligne de l'étape à compléter");
      /* Masqué tant que l'élève ne s'est pas éloigné. */
      returnButton.hidden = true;
      /* Ajoute le bouton à la barre d'outils. */
      toolbar.appendChild(returnButton);
    }

    /* Numéro actuellement mis en évidence. */
    let activeNumber = null;
    /* Image programmée. */
    let scheduledFrame = 0;
    /* Minuteur de stabilisation. */
    let settleTimer = 0;
    /* Minuteur du message de verrouillage. */
    let noticeTimer = 0;
    /* Garde-fou contre la ré-entrance lors d'un ajustement de défilement. */
    let applyingScroll = false;
    /* Garde-fou contre la ré-entrance lors d'une correction de sélection. */
    let correctingSelection = false;
    /* Garde-fou contre la ré-entrance lors d'une réconciliation de commentaire. */
    let reconciling = false;
    /* Suspend le recentrage automatique tant que l'élève consulte une ancienne ligne. */
    let holdGuiding = false;
    /* Dernière étape connue (détection d'un changement d'étape). */
    let lastStepId = null;
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

    /* Enregistre une seule fois la baseline pédagogique du niveau Guidé. */
    function ensureBaseline() {
      /* Ne recapture pas une baseline déjà enregistrée. */
      if (targetModel.hasBaseline()) return;
      /* Capture UNIQUEMENT en mode Guidé : les ancres pédagogiques (donc les lignes cibles */
      /* d'étape servant de source explicite aux emplacements éditables) n'y sont actives que là. */
      if (!guidedModeEnabled()) return;
      /* Récupère le squelette guidé canonique depuis le validateur. */
      const skeleton = typeof refs.validator.getSkeleton === "function"
        ? refs.validator.getSkeleton("guided", sessionId)
        : null;
      /* Enregistre la baseline (les emplacements éditables proviennent des lignes cibles d'étape). */
      if (skeleton) targetModel.captureBaseline(skeleton, sessionId);
    }

    /* Convertit une position absolue en index de ligne. */
    function lineForPos(value, position) {
      /* Délègue au modèle pour un calcul homogène. */
      return targetModel.lineForPosition(value, position);
    }

    /* Retourne les limites absolues d'une ligne dans le programme courant. */
    function boundsForLine(lineIndex) {
      /* Découpe le programme. */
      const lines = refs.editor.value.split("\n");
      /* Ramène l'index dans les limites. */
      const safeLine = Math.max(0, Math.min(lineIndex, lines.length - 1));
      /* Additionne les longueurs précédentes et leurs retours à la ligne. */
      const start = lines.slice(0, safeLine).reduce((total, line) => total + line.length + 1, 0);
      /* Calcule la fin de la ligne. */
      const end = start + (lines[safeLine] || "").length;
      /* Retourne le texte et les bornes. */
      return { safeLine, start, end, text: lines[safeLine] || "" };
    }

    /* Calcule l'emplacement pédagogique du curseur sur une ligne (marqueur ou après le retrait). */
    function selectionForLine(lineIndex) {
      /* Récupère les limites et le texte de la ligne. */
      const bounds = boundsForLine(lineIndex);
      /* Recherche un marqueur explicite à sélectionner. */
      const placeholder = bounds.text.match(/_{3,}|TODO|A_COMPLETER/i);
      /* Sélectionne le marqueur lorsqu'il existe. */
      if (placeholder && typeof placeholder.index === "number") {
        /* Début du marqueur. */
        const start = bounds.start + placeholder.index;
        /* Retourne la plage du marqueur. */
        return { safeLine: bounds.safeLine, start, end: start + placeholder[0].length };
      }
      /* Calcule le retrait initial. */
      const indentation = bounds.text.match(/^\s*/)?.[0].length || 0;
      /* Position après le retrait. */
      const position = bounds.start + indentation;
      /* Retourne un curseur réduit. */
      return { safeLine: bounds.safeLine, start: position, end: position };
    }

    /* Détermine la ligne éditable la plus proche d'une ligne visée. */
    function nearestEditable(lineIndex, model) {
      /* Sans lignes révélées, se rabat sur la cible. */
      if (!model.revealedCodeLines.length) return model.targetLine;
      /* Une ligne future (ou la cible) renvoie toujours vers la cible. */
      if (lineIndex >= model.targetLine) return model.targetLine;
      /* Meilleure ligne trouvée. */
      let best = model.targetLine;
      /* Distance minimale. */
      let bestDistance = Infinity;
      /* Cherche la ligne révélée la plus proche. */
      model.revealedCodeLines.forEach(line => {
        /* Distance à la ligne visée. */
        const distance = Math.abs(line - lineIndex);
        /* Retient la plus proche. */
        if (distance < bestDistance) {
          /* Met à jour la distance. */
          bestDistance = distance;
          /* Met à jour la meilleure ligne. */
          best = line;
        }
      });
      /* Retourne la ligne éditable retenue. */
      return best;
    }

    /* Place le curseur sur une ligne, sans relancer la boucle de correction. */
    function snapCaretTo(lineIndex) {
      /* Calcule la sélection cible. */
      const selection = selectionForLine(lineIndex);
      /* Active le garde-fou. */
      correctingSelection = true;
      /* Donne le focus sans faire défiler toute la page. */
      refs.editor.focus({ preventScroll: true });
      /* Positionne le curseur. */
      refs.editor.setSelectionRange(selection.start, selection.end);
      /* Libère le garde-fou à l'image suivante. */
      window.requestAnimationFrame(() => { correctingSelection = false; });
    }

    /* Replace le curseur sur l'étape active et réactive le recentrage. */
    function placeCaretOnTarget() {
      /* Ignore hors du niveau Guidé, hors Mission ou pendant la simulation. */
      if (!guidedModeEnabled() || !missionVisible() || simulationActive()) return;
      /* Calcule la cible courante. */
      const current = refs.guidedTarget.getCurrent?.(refs.editor.value, sessionId);
      /* Termine lorsque la mission est complète. */
      if (!current?.stepId || current.lineIndex === null || current.lineIndex === undefined) return;
      /* Borne la ligne cible. */
      const lines = refs.editor.value.split("\n");
      /* Ligne cible sécurisée. */
      const targetLine = Math.max(0, Math.min(lines.length - 1, Math.round(Number(current.lineIndex) || 0)));
      /* Réactive le guidage automatique. */
      holdGuiding = false;
      /* Attend la fin du rendu pour placer le curseur. */
      window.requestAnimationFrame(() => {
        /* Revalide le contexte. */
        if (!guidedModeEnabled() || !missionVisible() || simulationActive()) return;
        /* Place le curseur sur la ligne à coder. */
        snapCaretTo(targetLine);
        /* Recalcule et recentre (le contrôleur reste l'écrivain unique du scrollTop). */
        scheduleUpdate();
      });
    }

    /* Affiche brièvement un message de verrouillage. */
    function announceLock(reason) {
      /* Arrête l'ancien minuteur. */
      window.clearTimeout(noticeTimer);
      /* Choisit le texte selon la raison. */
      lockNotice.textContent = reason === "comment"
        /* Message pour un commentaire protégé. */
        ? "Les commentaires pédagogiques sont protégés. Ton code, lui, reste modifiable."
        /* Message pour un déplacement bloqué. */
        : "Tu peux corriger les lignes déjà révélées. Utilise « Revenir à l'étape » pour reprendre.";
      /* Affiche le message. */
      lockNotice.hidden = false;
      /* Programme sa disparition. */
      noticeTimer = window.setTimeout(() => { lockNotice.hidden = true; }, 2400);
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
      /* Masque la surbrillance secondaire. */
      editingBand.hidden = true;
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
        /* Masque le bouton de recentrage. */
        if (returnButton) returnButton.hidden = true;
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
        /* Masque le bouton de recentrage. */
        if (returnButton) returnButton.hidden = true;
        /* Oublie la dernière mesure. */
        lastMeasure = null;
        /* Termine. */
        return;
      }

      /* Découpe le programme en lignes. */
      const lines = refs.editor.value.split("\n");
      /* Borne la ligne de code. */
      const codeLine = Math.max(0, Math.min(lines.length - 1, Math.round(Number(current.lineIndex) || 0)));
      /* Calcule le modèle courant avec la position du curseur. */
      const model = targetModel.compute(refs.editor.value, sessionId, lineForPos(refs.editor.value, refs.editor.selectionStart));
      /* Détermine si le recentrage automatique est autorisé. */
      const autoScroll = guidedModeEnabled() && !holdGuiding;

      /* Ajuste le défilement uniquement lorsque le guidage n'est pas suspendu. */
      if (autoScroll) {
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
      /* Met à jour la surbrillance secondaire (ligne révélée en cours d'édition). */
      updateEditingBand(lines, model, codeLine);
      /* Met à jour la visibilité du bouton de recentrage. */
      if (returnButton) returnButton.hidden = !(guidedModeEnabled() && holdGuiding);
      /* Masque lorsque la cible n'est pas visible. */
      if (!deco.visible) {
        /* Retire les décorations principales (mais garde la bande secondaire déjà gérée). */
        refs.arrow.classList.add("mission-arrow-complete");
        /* Masque le cadre principal. */
        frame.hidden = true;
        /* Masque la surbrillance principale. */
        codeBand.hidden = true;
        /* Retire le numéro actif. */
        clearActiveNumber();
        /* Conserve un diagnostic. */
        lastMeasure = { stepId, codeLine, commentLine: deco.commentLine, visible: false, editingLine: model.editingLine };
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
        visible: true,
        /* Ancienne ligne éditée (ou null). */
        editingLine: model.editingLine,
        /* Recentrage suspendu. */
        holdGuiding
      };
    }

    /* Positionne et affiche la surbrillance secondaire de la ligne éditée. */
    function updateEditingBand(lines, model, codeLine) {
      /* Détermine si une ancienne ligne est réellement éditée. */
      const editingLine = guidedModeEnabled() && model.editingLine !== null && model.editingLine !== codeLine
        ? model.editingLine
        : null;
      /* Masque la bande secondaire sans ligne éditée. */
      if (editingLine === null) {
        /* Retire la bande. */
        editingBand.hidden = true;
        /* Termine. */
        return;
      }
      /* Mesure la bande de la ligne éditée. */
      const band = refs.engine.computeLineBand(lines, editingLine);
      /* Masque la bande lorsqu'elle sort de la zone visible. */
      if (!band.visible) {
        /* Retire la bande. */
        editingBand.hidden = true;
        /* Termine. */
        return;
      }
      /* Affiche la bande secondaire. */
      editingBand.hidden = false;
      /* Aligne son gauche. */
      editingBand.style.left = `${band.left}px`;
      /* Positionne son haut. */
      editingBand.style.top = `${band.top}px`;
      /* Applique sa hauteur. */
      editingBand.style.height = `${band.height}px`;
    }

    /* Programme un recalcul après la prochaine mise en page. */
    function scheduleUpdate() {
      /* Annule l'ancienne demande. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Attend deux images pour laisser curseur et hauteur se stabiliser. */
      scheduledFrame = window.requestAnimationFrame(() => window.requestAnimationFrame(update));
      /* Re-vérifie après la stabilisation (transition de hauteur, reflows tardifs). */
      window.clearTimeout(settleTimer);
      /* update() n'émet aucun événement de saisie : cette re-vérification est sûre. */
      settleTimer = window.setTimeout(update, 520);
    }

    /* Réconcilie les commentaires protégés après une modification (défense non destructive). */
    function reconcileComments() {
      /* Ignore hors du niveau Guidé, hors Mission, en simulation ou sans baseline. */
      if (!guidedModeEnabled() || !missionVisible() || simulationActive()) return;
      /* Évite la ré-entrance. */
      if (reconciling || !targetModel.hasBaseline()) return;
      /* Programme courant. */
      const value = refs.editor.value;
      /* Modèle courant. */
      const model = targetModel.compute(value, sessionId, lineForPos(value, refs.editor.selectionStart));
      /* Rien à protéger lorsque la mission est terminée. */
      if (model.targetLine === null) return;
      /* Calcule la version réparée. */
      const repaired = targetModel.reconcile(value, model);
      /* Termine lorsque aucun commentaire n'a été altéré. */
      if (!repaired.changed) return;
      /* Mémorise la position du curseur. */
      const caret = refs.editor.selectionStart;
      /* Active le garde-fou. */
      reconciling = true;
      /* Réécrit le programme protégé. */
      refs.editor.value = repaired.value;
      /* Recalcule la ligne du curseur dans la nouvelle valeur. */
      const caretLine = lineForPos(repaired.value, Math.min(caret, repaired.value.length));
      /* Ramène le curseur sur une ligne éditable. */
      const safeLine = model.isEditable(caretLine) ? caretLine : nearestEditable(caretLine, model);
      /* Bornes de la ligne sûre. */
      const bounds = boundsForLine(safeLine);
      /* Colonne conservée dans les limites. */
      const column = Math.min(Math.max(0, caret - bounds.start), bounds.text.length);
      /* Repositionne le curseur. */
      refs.editor.setSelectionRange(bounds.start + column, bounds.start + column);
      /* Notifie les validateurs existants avec la valeur protégée. */
      /* L'événement est marqué RESTAURATION INTERNE : coloration, validateur, géométrie et */
      /* stockage se mettent à jour, mais ce n'est PAS une tentative pédagogique de l'élève. */
      const restoreEvent = new Event("input", { bubbles: true });
      /* Marque l'événement comme une restauration interne (lu par mission-mode). */
      restoreEvent.__tqRestore = true;
      /* Diffuse l'événement de restauration. */
      refs.editor.dispatchEvent(restoreEvent);
      /* Libère le garde-fou. */
      reconciling = false;
      /* Explique la protection. */
      announceLock("comment");
    }

    /* Empêche toute modification hors des lignes éditables et tout changement de structure. */
    function guardBeforeInput(event) {
      /* Ignore hors du niveau Guidé, hors Mission ou pendant la simulation. */
      if (!guidedModeEnabled() || !missionVisible() || simulationActive()) return;
      /* Ignore pendant une réconciliation interne. */
      if (reconciling) return;
      /* Programme courant. */
      const value = refs.editor.value;
      /* Modèle courant. */
      const model = targetModel.compute(value, sessionId, lineForPos(value, refs.editor.selectionStart));
      /* Aucune contrainte lorsque la mission est terminée. */
      if (model.targetLine === null) return;
      /* Type d'opération. */
      const type = event.inputType || "";
      /* AUTORISE explicitement l'annulation/rétablissement natifs (Ctrl+Z / Ctrl+Y / Ctrl+Maj+Z). */
      /* On ne les bloque jamais : la protection des commentaires est assurée après coup par */
      /* reconcileComments (qui ne restaure que les commentaires/structure, jamais le code élève). */
      if (type === "historyUndo" || type === "historyRedo") return;
      /* Bornes de la plage affectée. */
      let start = refs.editor.selectionStart;
      /* Fin de la plage affectée. */
      let end = refs.editor.selectionEnd;
      /* Étend la plage vers l'arrière pour une suppression sans sélection. */
      if (start === end && (type === "deleteContentBackward" || type === "deleteWordBackward")) start = Math.max(0, start - 1);
      /* Étend la plage vers l'avant pour une suppression sans sélection. */
      if (start === end && (type === "deleteContentForward" || type === "deleteWordForward")) end = Math.min(value.length, end + 1);
      /* Ligne de début de la plage. */
      const startLine = lineForPos(value, start);
      /* Ligne de fin de la plage. */
      const endLine = lineForPos(value, end);
      /* Texte inséré directement. */
      const inserted = typeof event.data === "string" ? event.data : "";
      /* Texte transporté (collage ou glisser-déposer). */
      const transfer = event.dataTransfer ? (event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text") || "") : "";
      /* Détecte l'ajout d'un retour à la ligne. */
      const addsNewline = type === "insertLineBreak" || type === "insertParagraph" || inserted.includes("\n") || transfer.includes("\n");
      /* Détecte une plage qui franchit une frontière de ligne. */
      const spansLines = startLine !== endLine;
      /* Détecte une opération touchant une ligne non éditable. */
      const touchesLocked = !model.isEditable(startLine) || !model.isEditable(endLine);

      /* Bloque toute opération dangereuse pour la structure ou les commentaires. */
      if (addsNewline || spansLines || touchesLocked) {
        /* Annule l'opération native. */
        event.preventDefault();
        /* Ramène le curseur sur une ligne éditable. */
        const snapLine = nearestEditable(lineForPos(value, refs.editor.selectionStart), model);
        /* Replace le curseur. */
        snapCaretTo(snapLine);
        /* Suspend ou non le guidage selon la ligne d'arrivée. */
        holdGuiding = snapLine !== model.targetLine;
        /* Explique le verrouillage. */
        announceLock(touchesLocked ? "comment" : "navigation");
        /* Recalcule les décorations. */
        scheduleUpdate();
      }
    }

    /* Bloque un glisser-déposer multi-lignes avant même le traitement natif. */
    function guardDrop(event) {
      /* Ignore hors du niveau Guidé. */
      if (!guidedModeEnabled() || !missionVisible() || simulationActive()) return;
      /* Texte déposé. */
      const dropped = event.dataTransfer ? (event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text") || "") : "";
      /* Bloque uniquement les dépôts multi-lignes (les dépôts d'une ligne restent filtrés par beforeinput). */
      if (dropped.includes("\n")) {
        /* Annule le dépôt. */
        event.preventDefault();
        /* Explique le verrouillage. */
        announceLock("navigation");
      }
    }

    /* Synchronise l'état de navigation après un déplacement du curseur. */
    function syncCaretState() {
      /* Ignore hors du niveau Guidé, hors Mission ou pendant la simulation. */
      if (!guidedModeEnabled() || !missionVisible() || simulationActive()) return;
      /* Ignore pendant une correction interne. */
      if (correctingSelection || reconciling) return;
      /* Ignore lorsque l'éditeur n'a pas le focus. */
      if (document.activeElement !== refs.editor) return;
      /* Programme courant. */
      const value = refs.editor.value;
      /* Modèle courant. */
      const model = targetModel.compute(value, sessionId, lineForPos(value, refs.editor.selectionStart));
      /* Aucune contrainte lorsque la mission est terminée. */
      if (model.targetLine === null) return;
      /* Ligne de début de sélection. */
      const startLine = lineForPos(value, refs.editor.selectionStart);
      /* Indique si la sélection est réduite à un simple point d'insertion. */
      const collapsed = refs.editor.selectionStart === refs.editor.selectionEnd;

      /* Une SÉLECTION (plage) est laissée intacte : elle sert à COPIER/lire, y compris à travers */
      /* commentaires, lignes futures ou plusieurs lignes. La modification d'une telle plage reste */
      /* bloquée par guardBeforeInput ; la copie, elle, ne doit jamais être perturbée. */
      if (!collapsed) {
        /* Recalcule les décorations sans toucher à la sélection. */
        scheduleUpdate();
        /* Termine. */
        return;
      }

      /* Curseur réduit sur une ligne NON éditable : le ramène sur la ligne éditable la plus proche. */
      if (!model.isEditable(startLine)) {
        /* Détermine la ligne éditable la plus proche. */
        const snapLine = nearestEditable(startLine, model);
        /* Replace le curseur. */
        snapCaretTo(snapLine);
        /* Suspend le guidage lorsqu'on atterrit sur une ancienne ligne. */
        holdGuiding = snapLine !== model.targetLine;
        /* Recalcule. */
        scheduleUpdate();
        /* Termine. */
        return;
      }

      /* Curseur réduit sur une ligne éditable : distingue la cible d'une ancienne ligne. */
      if (startLine === model.targetLine) {
        /* Le retour sur l'étape active relance le guidage. */
        holdGuiding = false;
      } else {
        /* La consultation d'une ancienne ligne suspend le recentrage. */
        holdGuiding = true;
      }
      /* Recalcule les décorations et la surbrillance secondaire. */
      scheduleUpdate();
    }

    /* Traite une modification du programme : protection puis détection d'un changement d'étape. */
    function handleInput() {
      /* Enregistre la baseline dès que le niveau Guidé est actif. */
      ensureBaseline();
      /* Protège d'abord les commentaires pédagogiques. */
      reconcileComments();
      /* Détecte un changement d'étape pour re-guider vers la nouvelle cible. */
      const current = refs.guidedTarget.getCurrent?.(refs.editor.value, sessionId);
      /* Étape active courante. */
      const stepId = current?.stepId || null;
      /* Étape connue précédente. */
      const previous = lastStepId;
      /* Mémorise systématiquement la nouvelle étape. */
      lastStepId = stepId;
      /* Ligne de la nouvelle cible (le cas échéant). */
      const newTarget = current && current.lineIndex !== null && current.lineIndex !== undefined
        ? Math.round(Number(current.lineIndex) || 0)
        : null;
      /* Ligne courante du curseur. */
      const caretLine = lineForPos(refs.editor.value, refs.editor.selectionStart);
      /* Re-guide UNIQUEMENT lors d'un vrai changement entre deux étapes réelles, */
      /* quand l'élève suit le guidage (pas en train de corriger une ancienne ligne) */
      /* et que le curseur n'est pas déjà sur la nouvelle cible : évite tout saut parasite. */
      if (stepId && previous && stepId !== previous && guidedModeEnabled() && !holdGuiding && newTarget !== null && caretLine !== newTarget) {
        /* Replace le curseur sur la nouvelle étape. */
        placeCaretOnTarget();
      }
      /* Recalcule les décorations. */
      scheduleUpdate();
    }

    /* Protège la structure AVANT la saisie native. */
    refs.editor.addEventListener("beforeinput", guardBeforeInput);
    /* Bloque les glisser-déposer multi-lignes. */
    refs.editor.addEventListener("drop", guardDrop);
    /* Traite chaque modification du programme. */
    refs.editor.addEventListener("input", handleInput);
    /* Synchronise la navigation après un clic. */
    refs.editor.addEventListener("click", () => window.setTimeout(syncCaretState, 0));
    /* Synchronise la navigation après une sélection à la souris. */
    refs.editor.addEventListener("mouseup", () => window.setTimeout(syncCaretState, 0));
    /* Recalcule les décorations après une frappe. */
    refs.editor.addEventListener("keyup", scheduleUpdate);
    /* Recalcule les décorations lors d'une prise de focus. */
    refs.editor.addEventListener("focus", scheduleUpdate);
    /* Recalcule pendant le défilement, sauf pendant un ajustement interne. */
    refs.editor.addEventListener("scroll", () => {
      /* Ignore les défilements provoqués par cette couche. */
      if (applyingScroll) return;
      /* Un défilement manuel suspend le recentrage automatique. */
      if (guidedModeEnabled()) holdGuiding = true;
      /* Recalcule la position. */
      scheduleUpdate();
    }, { passive: true });
    /* Contrôle la navigation à chaque changement de sélection dans l'éditeur. */
    document.addEventListener("selectionchange", () => {
      /* Ignore une sélection hors de l'éditeur. */
      if (document.activeElement !== refs.editor) return;
      /* Contrôle la navigation à la prochaine image. */
      window.requestAnimationFrame(syncCaretState);
    });
    /* Recalcule au redimensionnement (le zoom navigateur émet aussi resize). */
    window.addEventListener("resize", scheduleUpdate);
    /* Recalcule lorsque la page défile. */
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    /* Recalcule au passage plein écran. */
    document.addEventListener("fullscreenchange", scheduleUpdate);
    /* Recalcule à la fin d'une transition qui déplace le contenu. */
    refs.root.addEventListener("transitionend", scheduleUpdate);
    /* Recalcule aussi à la fin d'une transition du repère commun. */
    refs.shell.addEventListener("transitionend", scheduleUpdate);
    /* Recalcule lorsque la taille rendue de l'éditeur change. */
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
    /* Replace le curseur après les principales actions Mission. */
    ["missionActivate", "missionCheck", "missionReset", "missionStop"].forEach(id => {
      /* Attend la fin de l'action historique puis re-guide. */
      document.getElementById(id)?.addEventListener("click", () => window.setTimeout(() => {
        /* Réinitialise la baseline et l'étape connue au besoin. */
        ensureBaseline();
        /* Force un replacement propre sur l'étape active. */
        placeCaretOnTarget();
        /* Recalcule. */
        scheduleUpdate();
      }, 0));
    });
    /* Re-guide après un changement de niveau d'aide. */
    document.getElementById("missionHelpLevel")?.addEventListener("change", () => window.setTimeout(() => {
      /* Réinitialise l'étape connue. */
      lastStepId = null;
      /* Relance le guidage. */
      holdGuiding = false;
      /* Replace le curseur sur l'étape active du nouveau squelette. */
      placeCaretOnTarget();
      /* Recalcule. */
      scheduleUpdate();
    }, 0));
    /* Recentre à la demande depuis le bouton pédagogique (souris et clavier). */
    returnButton?.addEventListener("click", () => {
      /* Replace le curseur sur l'étape active. */
      placeCaretOnTarget();
      /* Recalcule immédiatement. */
      scheduleUpdate();
    });

    /* Expose un accès de test à la dernière mesure et au recalcul. */
    window.TechnoQuestGuidedGeometry = {
      /* Retourne la dernière mesure calculée. */
      measure: () => lastMeasure,
      /* Force un recalcul immédiat. */
      refresh: () => scheduleUpdate(),
      /* Expose le modèle de cible courant (tests de navigation). */
      model: () => targetModel.compute(refs.editor.value, sessionId, lineForPos(refs.editor.value, refs.editor.selectionStart)),
      /* Recentre par programme (équivalent du bouton). */
      returnToStep: () => { placeCaretOnTarget(); scheduleUpdate(); },
      /* Expose la liste des emplacements éditables réels (diagnostic/tests). */
      editableSlots: () => targetModel.editableSlots(),
      /* Expose la liste des commentaires protégés (diagnostic/tests). */
      protectedComments: () => targetModel.protectedComments(),
      /* Indique si le recentrage est actuellement suspendu. */
      isHolding: () => holdGuiding
    };

    /* Enregistre la baseline et lance le premier calcul. */
    ensureBaseline();
    /* Lance le premier calcul. */
    scheduleUpdate();
    /* Place le curseur sur la première étape lorsque le mode est déjà visible. */
    if (guidedModeEnabled() && missionVisible()) window.setTimeout(placeCaretOnTarget, 0);
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
