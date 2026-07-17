/* TechnoQuest — place les propositions d’autocomplétion près de la ligne active. */
"use strict";

(() => {
  /* Attend la création de l’éditeur et de son menu d’autocomplétion. */
  function waitForCompletion(attempt = 0) {
    /* Récupère le cadre de l’éditeur. */
    const shell = document.getElementById("missionCodeShell");
    /* Récupère la zone réelle de saisie. */
    const editor = document.getElementById("codeEditor");
    /* Récupère le menu créé par l’assistance existante. */
    const menu = shell?.querySelector(".mission-completion-menu");
    /* Récupère la colonne des numéros. */
    const lineNumbers = document.getElementById("missionLineNumbers");

    /* Installe l’ancrage lorsque tous les éléments existent. */
    if (shell && editor && menu && lineNumbers) {
      /* Lance l’installation principale. */
      installPointerCompletion({ shell, editor, menu, lineNumbers });
      /* Termine l’attente. */
      return;
    }

    /* Réessaie pendant quelques secondes si l’interface est encore en construction. */
    if (attempt < 100) window.setTimeout(() => waitForCompletion(attempt + 1), 100);
  }

  /* Installe le placement et le titre pédagogique du menu. */
  function installPointerCompletion(refs) {
    /* Évite une seconde installation. */
    if (refs.menu.dataset.pointerCompletionReady === "true") return;
    /* Mémorise que le module est prêt. */
    refs.menu.dataset.pointerCompletionReady = "true";
    /* Active les règles CSS d’ancrage. */
    refs.menu.classList.add("mission-completion-anchored");

    /* Regroupe les recalculs successifs dans une seule image. */
    let scheduledFrame = 0;

    /* Retourne l’index de la ligne contenant le point d’insertion. */
    function currentLineIndex() {
      /* Compte les retours à la ligne avant selectionStart. */
      return refs.editor.value.slice(0, refs.editor.selectionStart).split("\n").length - 1;
    }

    /* Ajoute ou restaure le titre du menu après son rendu dynamique. */
    function ensureHeading() {
      /* Ne recrée pas le titre lorsqu’il existe déjà. */
      if (refs.menu.querySelector(".mission-completion-heading")) return;
      /* Crée l’en-tête. */
      const heading = document.createElement("div");
      /* Applique la classe visuelle. */
      heading.className = "mission-completion-heading";
      /* Ajoute l’instruction souris et le rappel clavier. */
      heading.innerHTML = "<strong>Choisissez la suite possible</strong><span>Clic souris · ↑ ↓ · Entrée</span>";
      /* Place le titre avant la première proposition. */
      refs.menu.insertBefore(heading, refs.menu.firstChild);
    }

    /* Place le menu juste sous la ligne dans laquelle l’élève écrit. */
    function positionMenu() {
      /* Ignore les calculs lorsque le menu est masqué. */
      if (refs.menu.hidden) return;
      /* Restaure le titre après chaque reconstruction des propositions. */
      ensureHeading();

      /* Calcule la ligne active. */
      const lineIndex = currentLineIndex();
      /* Récupère son numéro visible. */
      const number = refs.lineNumbers.children[lineIndex];
      /* Lit le rectangle général. */
      const shellRect = refs.shell.getBoundingClientRect();
      /* Lit la largeur de la gouttière. */
      const gutterRect = refs.lineNumbers.getBoundingClientRect();
      /* Lit les métriques de secours du textarea. */
      const editorStyle = window.getComputedStyle(refs.editor);
      /* Convertit la hauteur de ligne. */
      const lineHeight = parseFloat(editorStyle.lineHeight) || 28;
      /* Convertit la marge intérieure supérieure. */
      const paddingTop = parseFloat(editorStyle.paddingTop) || 16;

      /* Calcule la position verticale à partir du numéro lorsqu’il est disponible. */
      const desiredTop = number
        /* Place le menu juste sous le numéro réellement affiché. */
        ? number.getBoundingClientRect().bottom - shellRect.top + 4
        /* Utilise les métriques du textarea comme solution de secours. */
        : refs.editor.getBoundingClientRect().top - shellRect.top + paddingTop + (lineIndex + 1) * lineHeight - refs.editor.scrollTop + 4;
      /* Calcule la position horizontale après la gouttière. */
      const desiredLeft = gutterRect.right - shellRect.left + 8;
      /* Calcule la hauteur maximale disponible sous la ligne. */
      const availableBelow = refs.shell.clientHeight - desiredTop - 8;
      /* Calcule la hauteur approximative du menu. */
      const menuHeight = Math.min(refs.menu.scrollHeight || 250, 310);
      /* Détermine si le menu doit plutôt apparaître au-dessus. */
      const placeAbove = availableBelow < Math.min(150, menuHeight) && desiredTop > menuHeight + 12;
      /* Calcule la position verticale finale. */
      const finalTop = placeAbove ? Math.max(4, desiredTop - menuHeight - lineHeight - 4) : Math.max(4, desiredTop);

      /* Transmet les coordonnées aux variables CSS. */
      refs.menu.style.setProperty("--mission-completion-top", `${Math.round(finalTop)}px`);
      /* Transmet la position horizontale. */
      refs.menu.style.setProperty("--mission-completion-left", `${Math.round(desiredLeft)}px`);
      /* Transmet également la valeur utilisée sur mobile. */
      refs.menu.style.setProperty("--mission-completion-left-mobile", `${Math.round(desiredLeft)}px`);
    }

    /* Programme un seul recalcul dans la prochaine image. */
    function schedulePosition() {
      /* Annule le calcul précédent. */
      window.cancelAnimationFrame(scheduledFrame);
      /* Programme le nouveau placement. */
      scheduledFrame = window.requestAnimationFrame(positionMenu);
    }

    /* Le menu est entièrement reconstruit après chaque caractère. */
    const menuObserver = new MutationObserver(() => schedulePosition());
    /* Observe les propositions, le titre et l’attribut hidden. */
    menuObserver.observe(refs.menu, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });

    /* Recalcule après la saisie. */
    refs.editor.addEventListener("input", schedulePosition);
    /* Recalcule après un clic dans le code. */
    refs.editor.addEventListener("click", schedulePosition);
    /* Recalcule après une navigation horizontale. */
    refs.editor.addEventListener("keyup", schedulePosition);
    /* Recalcule pendant le défilement. */
    refs.editor.addEventListener("scroll", schedulePosition, { passive: true });
    /* Recalcule lorsque l’écran change de taille. */
    window.addEventListener("resize", schedulePosition);
    /* Recalcule lors du plein écran. */
    document.addEventListener("fullscreenchange", schedulePosition);
  }

  /* Démarre après la construction du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque la page est encore en construction. */
    document.addEventListener("DOMContentLoaded", () => waitForCompletion());
  } else {
    /* Lance immédiatement l’attente lorsque le document est prêt. */
    waitForCompletion();
  }
})();
