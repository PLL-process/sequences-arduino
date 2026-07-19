/* TechnoQuest — MODÈLE de cible guidée (pur, sans DOM, sans écouteur). */
/* Il classe chaque ligne du programme guidé en catégories stables et fournit une */
/* réconciliation NON destructive des lignes non éditables. */
/* Catégories exposées :                                                               */
/*   - targetLine : ligne de la première étape réellement manquante ;                  */
/*   - revealedCodeLines : lignes de code révélées et éditables (étapes déjà autorisées */
/*     + étape active), y compris la ligne d'include écrite sur un ancien commentaire ; */
/*   - protectedCommentLines : commentaires pédagogiques verrouillés ;                 */
/*   - futureLines : lignes situées après l'étape active, verrouillées ;               */
/*   - editingLine : ancienne ligne autorisée actuellement sous le curseur.            */
/* Aucune écriture DOM : le contrôleur consomme ce modèle et reste l'écrivain unique.  */
"use strict";

(() => {
  /* Fabrique un modèle lié au validateur et à la cible canonique. */
  function createTargetModel(deps) {
    /* Validateur partagé (source des étapes et de la recherche de ligne). */
    const validator = deps.validator;
    /* Cible canonique sans cache (première étape manquante + sa ligne). */
    const guidedTarget = deps.guidedTarget;

    /* Lignes du squelette pédagogique de référence (baseline). */
    let baselineLines = null;
    /* Indices des lignes de commentaire dans la baseline. */
    let baselineCommentIndices = new Set();
    /* Indices des lignes VIDES de la baseline = emplacements éditables de l'élève. */
    /* Ces lignes lui appartiennent : leur contenu ne doit JAMAIS être restauré/effacé. */
    let baselineSlotIndices = new Set();
    /* Nombre de lignes de la baseline (garde-fou de réconciliation). */
    let baselineLen = 0;
    /* Dernier contenu connu et valide des lignes éditables (secours structurel). */
    const lastGoodEditable = new Map();

    /* Enregistre la baseline à partir du squelette guidé fourni par le validateur. */
    function captureBaseline(skeletonCode, sessionId) {
      /* Découpe le squelette de référence en lignes. */
      baselineLines = String(skeletonCode || "").split("\n");
      /* Mémorise son nombre de lignes. */
      baselineLen = baselineLines.length;
      /* Réinitialise les ensembles de commentaires et d'emplacements éditables. */
      baselineCommentIndices = new Set();
      baselineSlotIndices = new Set();
      /* Repère chaque ligne de commentaire pédagogique (protégée). */
      baselineLines.forEach((line, index) => {
        /* Une ligne de commentaire commence par //. */
        if (line.trim().startsWith("//")) baselineCommentIndices.add(index);
      });
      /* SOURCE EXPLICITE des emplacements éditables : la LIGNE CIBLE de chaque étape, calculée */
      /* via les ancres pédagogiques du validateur — et NON « toute ligne vide ». Cela exclut */
      /* les lignes vides de structure ou de séparation (ex. entre setup() et loop()) qui ne */
      /* correspondent à aucune étape : elles ne deviennent jamais éditables. */
      try {
        /* Valide le squelette pour disposer du contexte de recherche de ligne. */
        const result = validator.validate(skeletonCode, sessionId);
        /* Récupère les étapes de la séance. */
        const steps = typeof validator.getSteps === "function" ? validator.getSteps(sessionId) : [];
        /* Ajoute la ligne cible réelle de chaque étape. */
        steps.forEach(step => {
          /* Calcule la ligne de réponse de l'étape sur le squelette vierge. */
          const line = validator.findLineForStep(skeletonCode, step.id, result, sessionId, "edition");
          /* Retient uniquement une ligne valide et bornée. */
          if (Number.isInteger(line) && line >= 0 && line < baselineLen) baselineSlotIndices.add(line);
        });
      } catch (error) {
        /* En cas d'indisponibilité du validateur, aucun emplacement éditable (protection maximale). */
        baselineSlotIndices = new Set();
      }
      /* Oublie les anciens contenus éditables mémorisés. */
      lastGoodEditable.clear();
    }

    /* Indique si une baseline exploitable a été enregistrée. */
    function hasBaseline() {
      /* La baseline doit exister et contenir au moins une ligne. */
      return Array.isArray(baselineLines) && baselineLen > 0;
    }

    /* Compte la ligne (0-based) contenant une position absolue. */
    function lineForPosition(code, position) {
      /* Compte les retours à la ligne situés avant la position. */
      return String(code).slice(0, Math.max(0, position)).split("\n").length - 1;
    }

    /* Calcule la ligne cible de chaque étape déjà atteinte ou active. */
    function revealedLinesFor(code, sessionId, result, targetLine, lines) {
      /* Ensemble des lignes révélées (évite les doublons). */
      const revealed = new Set();
      /* L'étape active est toujours éditable. */
      if (Number.isInteger(targetLine)) revealed.add(targetLine);
      /* Récupère la liste ordonnée des étapes de la séance. */
      const steps = typeof validator.getSteps === "function" ? validator.getSteps(sessionId) : [];
      /* Examine chaque étape pour retrouver sa ligne réelle. */
      steps.forEach(step => {
        /* Recherche la ligne correspondant à l'étape dans le code courant. */
        const line = validator.findLineForStep(code, step.id, result, sessionId, "edition");
        /* Ne garde que les lignes situées au niveau ou avant l'étape active. */
        if (Number.isInteger(line) && line <= targetLine) revealed.add(line);
      });
      /* Révélation PERSISTANTE : tout emplacement éditable DÉJÀ rempli par l'élève reste */
      /* accessible, même si une rétrogradation ramène la cible plus haut. On ne re-verrouille */
      /* jamais une ligne où l'élève a écrit ; seuls les emplacements encore vides restent futurs. */
      if (hasBaseline() && Array.isArray(lines)) {
        /* Parcourt les emplacements éditables de la baseline. */
        baselineSlotIndices.forEach(index => {
          /* Ajoute l'emplacement s'il contient réellement du code de l'élève. */
          if (index < lines.length && String(lines[index] || "").trim() !== "") revealed.add(index);
        });
      }
      /* Retourne un tableau trié pour un usage stable. */
      return [...revealed].sort((a, b) => a - b);
    }

    /* Classe le programme courant et calcule la cible active. */
    function compute(code, sessionId, caretLine) {
      /* Découpe le programme courant en lignes. */
      const lines = String(code || "").split("\n");
      /* Dernière ligne disponible. */
      const maxLine = Math.max(0, lines.length - 1);
      /* Récupère l'état canonique (étape active + ligne). */
      const current = guidedTarget?.getCurrent?.(code, sessionId) || {};
      /* Identifiant de l'étape active. */
      const stepId = current.stepId || null;
      /* Résultat de validation associé (réutilisé pour la recherche de ligne). */
      const result = current.result || validator.validate(code, sessionId);

      /* Sans étape active, la mission est terminée : plus aucune contrainte. */
      if (!stepId || current.lineIndex === null || current.lineIndex === undefined) {
        /* Retourne un modèle « terminé » sans verrou. */
        return {
          /* Aucune étape active. */
          stepId: null,
          /* Aucune ligne cible. */
          targetLine: null,
          /* Toutes les lignes de code deviennent librement révélées. */
          revealedCodeLines: [],
          /* Aucune ligne à protéger activement. */
          protectedCommentLines: hasBaseline() ? [...baselineCommentIndices] : [],
          /* Aucune ligne future. */
          futureLines: [],
          /* Aucun retour en arrière signalé. */
          editingLine: null,
          /* Toutes les lignes sont éditables à la fin. */
          isEditable: () => true,
          /* Classe générique. */
          classify: () => "revealed"
        };
      }

      /* Borne la ligne cible dans les limites du programme. */
      const targetLine = Math.max(0, Math.min(maxLine, Math.round(Number(current.lineIndex) || 0)));
      /* Calcule les lignes révélées (éditables) jusqu'à l'étape active + emplacements déjà remplis. */
      const revealedCodeLines = revealedLinesFor(code, sessionId, result, targetLine, lines);
      /* Ensemble rapide des lignes éditables. */
      const revealedSet = new Set(revealedCodeLines);
      /* Lignes de commentaire protégées = commentaires baseline non éditables. */
      const protectedCommentLines = hasBaseline()
        ? [...baselineCommentIndices].filter(index => !revealedSet.has(index))
        : lines.reduce((acc, line, index) => {
            /* Repli sans baseline : détecte les commentaires courants hors cible. */
            if (line.trim().startsWith("//") && !revealedSet.has(index)) acc.push(index);
            /* Poursuit l'accumulation. */
            return acc;
          }, []);
      /* Lignes futures = toutes celles situées après l'étape active. */
      const futureLines = [];
      /* Remplit la liste des lignes futures. */
      for (let index = targetLine + 1; index <= maxLine; index += 1) futureLines.push(index);

      /* Détermine si le curseur consulte une ancienne ligne autorisée. */
      const editingLine = Number.isInteger(caretLine) && revealedSet.has(caretLine) && caretLine !== targetLine
        ? caretLine
        : null;

      /* Indique si une ligne est éditable. */
      const isEditable = index => revealedSet.has(index);
      /* Donne la catégorie d'une ligne pour les tests et l'affichage. */
      const classify = index => {
        /* La ligne active est la cible. */
        if (index === targetLine) return "target";
        /* Une ligne révélée est éditable. */
        if (revealedSet.has(index)) return "revealed";
        /* Une ligne future est verrouillée. */
        if (index > targetLine) return "future";
        /* Une ligne de commentaire baseline est protégée. */
        if (hasBaseline() ? baselineCommentIndices.has(index) : lines[index]?.trim().startsWith("//")) return "comment";
        /* Le reste correspond à la structure pré-remplie. */
        return "structure";
      };

      /* Retourne le modèle complet. */
      return {
        /* Étape active. */
        stepId,
        /* Ligne de la première étape manquante. */
        targetLine,
        /* Lignes de code révélées et éditables. */
        revealedCodeLines,
        /* Commentaires pédagogiques protégés. */
        protectedCommentLines,
        /* Lignes futures verrouillées. */
        futureLines,
        /* Ancienne ligne actuellement éditée. */
        editingLine,
        /* Test d'éditabilité. */
        isEditable,
        /* Classification d'une ligne. */
        classify
      };
    }

    /* Restaure les lignes non éditables depuis la baseline sans toucher au code élève. */
    function reconcile(code, model) {
      /* Sans baseline ni cible, aucune réconciliation. */
      if (!hasBaseline() || !model || model.targetLine === null) return { value: code, changed: false };
      /* Découpe le programme courant. */
      const lines = String(code || "").split("\n");
      /* Garde-fou : ne touche à rien si la structure de lignes a divergé. */
      /* (beforeinput empêche déjà les changements de nombre de lignes ; on protège les */
      /*  sessions reprises d'un format antérieur en refusant une réécriture hasardeuse.) */
      if (lines.length !== baselineLen) return { value: code, changed: false };

      /* Ensemble des lignes éditables actives (étapes atteintes + emplacements remplis). */
      const revealedSet = new Set(model.revealedCodeLines);
      /* Copie de travail. */
      const out = lines.slice();
      /* Drapeau de modification. */
      let changed = false;
      /* Parcourt chaque ligne. */
      for (let index = 0; index < baselineLen; index += 1) {
        /* PRÉSERVE toute ligne qui appartient à l'élève :                                 */
        /*  - un emplacement éditable de la baseline (ligne vide au départ), REMPLI OU NON, */
        /*    y compris situé APRÈS une étape rétrogradée → on n'efface jamais son code ;   */
        /*  - une ligne actuellement révélée (dont la cible-include écrite sur un commentaire).*/
        if (baselineSlotIndices.has(index) || revealedSet.has(index)) {
          /* Retient le dernier bon contenu éditable pour un éventuel secours. */
          lastGoodEditable.set(index, lines[index]);
          /* Ne modifie jamais le territoire de l'élève. */
          continue;
        }
        /* Restaure UNIQUEMENT une ligne pédagogique non éditable altérée (commentaire ou structure). */
        if (lines[index] !== baselineLines[index]) {
          /* Rétablit exactement le texte pédagogique d'origine. */
          out[index] = baselineLines[index];
          /* Signale une correction. */
          changed = true;
        }
      }
      /* Retourne le programme réparé. */
      return { value: out.join("\n"), changed };
    }

    /* Expose l'interface pure du modèle. */
    return {
      /* Enregistre la baseline pédagogique. */
      captureBaseline,
      /* Indique si une baseline est disponible. */
      hasBaseline,
      /* Calcule la classification et la cible. */
      compute,
      /* Réconcilie les lignes protégées. */
      reconcile,
      /* Utilitaire de conversion position → ligne. */
      lineForPosition,
      /* Expose la liste triée des emplacements éditables (diagnostic/tests). */
      editableSlots: () => [...baselineSlotIndices].sort((a, b) => a - b),
      /* Expose la liste triée des commentaires protégés (diagnostic/tests). */
      protectedComments: () => [...baselineCommentIndices].sort((a, b) => a - b)
    };
  }

  /* Publie la fabrique du modèle de cible. */
  window.TechnoQuestMissionTargetModel = { create: createTargetModel };
})();
