/* TechnoQuest — MOTEUR de géométrie guidée (pur, sans écouteur, sans écriture des décorations). */
/* Responsabilités : mesurer la position réelle des lignes du textarea et calculer, en nombres, */
/* la géométrie du cadre, de la surbrillance et de la flèche. */
/* Il n'écrit NI le cadre, NI la flèche, NI le scrollTop : c'est le rôle du contrôleur. */
/* La mesure s'appuie sur un MIROIR invisible qui recopie exactement le rendu du textarea */
/* (largeur, police, taille, interligne, marges, bordures, tabulation, white-space, retour à la ligne), */
/* ce qui reste correct avec défilement horizontal, sur téléphone et au zoom 200 %. */
"use strict";

(() => {
  /* Propriétés recopiées du textarea vers le miroir pour un rendu identique. */
  const MIRRORED_STYLES = [
    "boxSizing", "width",
    "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderStyle",
    "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontVariant",
    "lineHeight", "letterSpacing", "wordSpacing", "textTransform", "textIndent",
    "tabSize", "whiteSpace", "overflowWrap", "wordBreak", "direction"
  ];

  /* Nombre de lignes de contexte à garder visibles après la ligne active. */
  const TRAILING_CONTEXT_LINES = 3;
  /* Petite marge de confort pour le défilement. */
  const SCROLL_PADDING = 6;

  /* Crée un moteur de géométrie lié à un éditeur et à son repère commun. */
  function createGuidedGeometry(refs) {
    /* Conteneur direct du textarea (pour y placer le miroir au même endroit). */
    const wrap = refs.editor.parentElement;
    /* Miroir de mesure (créé à la demande). */
    let mirror = null;
    /* Divisions de ligne du miroir. */
    let lineDivs = [];

    /* Crée le miroir invisible une seule fois. */
    function ensureMirror() {
      /* Ne recrée pas un miroir encore présent. */
      if (mirror && mirror.isConnected) return;
      /* Construit le miroir. */
      mirror = document.createElement("div");
      /* Classe de repérage. */
      mirror.className = "mission-geometry-mirror";
      /* Retire le miroir de la lecture vocale. */
      mirror.setAttribute("aria-hidden", "true");
      /* Superpose exactement le textarea. */
      mirror.style.position = "absolute";
      /* Aligne le coin supérieur. */
      mirror.style.top = "0";
      /* Aligne le bord gauche. */
      mirror.style.left = "0";
      /* Supprime toute marge. */
      mirror.style.margin = "0";
      /* Rend le miroir invisible mais mesurable. */
      mirror.style.visibility = "hidden";
      /* Empêche toute interaction. */
      mirror.style.pointerEvents = "none";
      /* Place le miroir sous les autres couches. */
      mirror.style.zIndex = "-1";
      /* Reproduit le défilement du textarea par masquage du débordement. */
      mirror.style.overflow = "hidden";
      /* Insère le miroir dans le même conteneur que le textarea. */
      wrap.appendChild(mirror);
      /* Force la reconstruction des lignes. */
      lineDivs = [];
    }

    /* Recopie les styles de rendu du textarea sur le miroir. */
    function syncStyle() {
      /* Lit les styles calculés du textarea. */
      const computed = window.getComputedStyle(refs.editor);
      /* Recopie chaque propriété utile. */
      MIRRORED_STYLES.forEach(property => { mirror.style[property] = computed[property]; });
      /* Aligne la taille de boîte sur celle du textarea pour un défilement identique. */
      mirror.style.width = `${refs.editor.offsetWidth}px`;
      /* Aligne la hauteur de boîte. */
      mirror.style.height = `${refs.editor.offsetHeight}px`;
    }

    /* Reconstruit ou met à jour les lignes du miroir. */
    function syncContent(lines) {
      /* Reconstruit toute la structure lorsque le nombre de lignes change. */
      if (lineDivs.length !== lines.length) {
        /* Vide le miroir. */
        mirror.textContent = "";
        /* Réinitialise la liste. */
        lineDivs = [];
        /* Recopie la gestion des espaces du textarea. */
        const whiteSpace = window.getComputedStyle(refs.editor).whiteSpace;
        /* Crée une division par ligne. */
        for (let index = 0; index < lines.length; index += 1) {
          /* Construit la division de ligne. */
          const division = document.createElement("div");
          /* Reproduit exactement la gestion des espaces. */
          division.style.whiteSpace = whiteSpace;
          /* Ajoute la division au miroir. */
          mirror.appendChild(division);
          /* Mémorise la division. */
          lineDivs.push(division);
        }
      }
      /* Met à jour le texte de chaque ligne (espace insécable de largeur nulle si vide). */
      for (let index = 0; index < lines.length; index += 1) {
        /* Évite une réécriture inutile. */
        if (lineDivs[index].__text === lines[index]) continue;
        /* Écrit le texte de la ligne, ou un caractère invisible pour conserver la hauteur. */
        lineDivs[index].textContent = lines[index] === "" ? "​" : lines[index];
        /* Mémorise la valeur écrite. */
        lineDivs[index].__text = lines[index];
      }
    }

    /* Aligne le défilement du miroir sur celui du textarea. */
    function syncScroll() {
      /* Copie le défilement vertical. */
      mirror.scrollTop = refs.editor.scrollTop;
      /* Copie le défilement horizontal. */
      mirror.scrollLeft = refs.editor.scrollLeft;
    }

    /* Synchronise entièrement le miroir avant une mesure. */
    function sync(lines) {
      /* Garantit l'existence du miroir. */
      ensureMirror();
      /* Recopie les styles de rendu. */
      syncStyle();
      /* Met à jour les lignes. */
      syncContent(lines);
      /* Aligne le défilement. */
      syncScroll();
    }

    /* Retourne le rectangle écran réel d'une ligne (mesuré dans le miroir). */
    function lineRect(lineIndex) {
      /* Récupère la division de ligne. */
      const division = lineDivs[lineIndex];
      /* Signale l'absence de ligne. */
      if (!division) return null;
      /* Lit son rectangle réel (à l'échelle du zoom). */
      const rect = division.getBoundingClientRect();
      /* Retourne les bornes verticales. */
      return { top: rect.top, bottom: rect.bottom, height: rect.height };
    }

    /* Détermine la première ligne du bloc de commentaire pédagogique au-dessus de la ligne de code. */
    function commentBlockStart(lines, codeLineIndex) {
      /* Lorsque la ligne cible est elle-même un commentaire (cas include), le bloc est cette ligne. */
      if (String(lines[codeLineIndex] || "").trim().startsWith("//")) return codeLineIndex;
      /* Départ du bloc. */
      let blockStart = null;
      /* Remonte tant que la ligne au-dessus est un commentaire (bloc multi-lignes toléré). */
      for (let index = codeLineIndex - 1; index >= 0; index -= 1) {
        /* Arrête dès qu'une ligne n'est pas un commentaire. */
        if (!String(lines[index] || "").trim().startsWith("//")) break;
        /* Étend le bloc vers le haut. */
        blockStart = index;
      }
      /* Retourne le haut du bloc, sinon la ligne de code seule. */
      return blockStart === null ? codeLineIndex : blockStart;
    }

    /* Calcule le facteur de zoom (pixels écran par pixel de contenu). */
    function zoomFactor(editorRect) {
      /* Utilise la hauteur visible non zoomée comme référence. */
      const clientHeight = refs.editor.clientHeight;
      /* Retourne 1 sans référence exploitable. */
      if (clientHeight <= 0) return 1;
      /* Calcule le rapport. */
      const factor = editorRect.height / clientHeight;
      /* Sécurise la valeur. */
      return isFinite(factor) && factor > 0 ? factor : 1;
    }

    /* Calcule le défilement souhaité (nombre pur), sans l'appliquer. */
    function computeScroll(lines, codeLine) {
      /* Synchronise le miroir avec l'état courant. */
      sync(lines);
      /* Rectangle visible du textarea. */
      const editorRect = refs.editor.getBoundingClientRect();
      /* Hauteur visible en pixels de contenu. */
      const clientHeight = refs.editor.clientHeight;
      /* Facteur de zoom. */
      const zoom = zoomFactor(editorRect);
      /* Détermine la première ligne du commentaire. */
      const commentLine = commentBlockStart(lines, codeLine);
      /* Dernière ligne à garder visible. */
      const revealLine = Math.min(lines.length - 1, codeLine + TRAILING_CONTEXT_LINES);
      /* Mesures nécessaires. */
      const commentRect = lineRect(commentLine);
      /* Mesure de la ligne de contexte. */
      const revealRect = lineRect(revealLine);
      /* Abandonne sans mesures fiables. */
      if (!commentRect || !revealRect) return null;
      /* Convertit une position écran en position de contenu (unités homogènes). */
      const toContent = rect => refs.editor.scrollTop + (rect.top - editorRect.top) / zoom;
      /* Haut du commentaire dans le contenu. */
      const commentTopContent = toContent(commentRect);
      /* Bas de la ligne de contexte dans le contenu. */
      const revealBottomContent = refs.editor.scrollTop + (revealRect.bottom - editorRect.top) / zoom;
      /* Défilement maximal natif. */
      const nativeMax = Math.max(0, refs.editor.scrollHeight - clientHeight);
      /* Défilement minimal pour voir la ligne de contexte en bas. */
      const lowBound = Math.max(0, revealBottomContent - clientHeight + SCROLL_PADDING);
      /* Défilement maximal pour garder le commentaire visible en haut. */
      const highBound = Math.max(0, commentTopContent - SCROLL_PADDING);
      /* Privilégie le commentaire lorsque la fenêtre est trop courte. */
      const desired = Math.min(lowBound, highBound);
      /* Ramène la valeur dans les limites. */
      return Math.max(0, Math.min(nativeMax, desired));
    }

    /* Calcule la géométrie des décorations (nombres purs, repère local du cadre). */
    function computeDecorations(lines, codeLine) {
      /* Synchronise le miroir (récupère aussi le défilement le plus récent). */
      sync(lines);
      /* Détermine la première ligne du commentaire. */
      const commentLine = commentBlockStart(lines, codeLine);
      /* Rectangles de référence. */
      const editorRect = refs.editor.getBoundingClientRect();
      /* Rectangle du repère commun. */
      const shellRect = refs.shell.getBoundingClientRect();
      /* Rectangle de la gouttière (pour le début de la zone de code). */
      const gutterRect = refs.lineNumbers.getBoundingClientRect();
      /* Facteur de zoom. */
      const zoom = zoomFactor(editorRect);
      /* Mesure de la ligne de code. */
      const codeRect = lineRect(codeLine);
      /* Mesure du haut du commentaire. */
      const commentRect = lineRect(commentLine);
      /* Masque lorsque les mesures manquent. */
      if (!codeRect || !commentRect) return { visible: false, codeLine, commentLine };
      /* Masque lorsque la ligne de code sort de la fenêtre visible. */
      if (codeRect.bottom <= editorRect.top + 1 || codeRect.top >= editorRect.bottom - 1) {
        /* Signale une cible hors écran. */
        return { visible: false, codeLine, commentLine };
      }
      /* Convertit une distance écran en pixels locaux du repère commun. */
      const toLocal = value => value / zoom;
      /* Début horizontal de la zone de code. */
      const codeLeft = toLocal(gutterRect.right - shellRect.left);
      /* Haut du cadre = haut du commentaire, borné à la zone visible. */
      const frameTop = toLocal(Math.max(commentRect.top, editorRect.top) - shellRect.top);
      /* Bas du cadre = bas de la ligne de code, borné à la zone visible. */
      const frameBottom = toLocal(Math.min(codeRect.bottom, editorRect.bottom) - shellRect.top);
      /* Haut de la ligne de code dans le repère commun. */
      const codeTop = toLocal(codeRect.top - shellRect.top);
      /* Hauteur locale de la ligne de code. */
      const codeHeight = toLocal(codeRect.height);
      /* Retourne une géométrie complète et prête à écrire. */
      return {
        /* Décorations visibles. */
        visible: true,
        /* Ligne de code (0-based). */
        codeLine,
        /* Haut du bloc de commentaire. */
        commentLine,
        /* Grand cadre autour du commentaire complet et de la ligne de code. */
        frame: { left: codeLeft, top: frameTop, height: Math.max(codeHeight, frameBottom - frameTop) },
        /* Surbrillance de la seule ligne de code. */
        codeBand: { left: codeLeft, top: codeTop, height: codeHeight },
        /* Centre vertical de la flèche (ligne de code). */
        arrowCenter: codeTop + codeHeight / 2,
        /* Numéro humain de la ligne de code (pour l'étiquette). */
        codeLineHuman: codeLine + 1
      };
    }

    /* Calcule la bande (surbrillance) d'une ligne quelconque, pour la ligne éditée. */
    function computeLineBand(lines, lineIndex) {
      /* Synchronise le miroir avant la mesure. */
      sync(lines);
      /* Rectangle visible du textarea. */
      const editorRect = refs.editor.getBoundingClientRect();
      /* Rectangle du repère commun. */
      const shellRect = refs.shell.getBoundingClientRect();
      /* Rectangle de la gouttière (début de la zone de code). */
      const gutterRect = refs.lineNumbers.getBoundingClientRect();
      /* Facteur de zoom. */
      const zoom = zoomFactor(editorRect);
      /* Mesure de la ligne demandée. */
      const rect = lineRect(lineIndex);
      /* Masque lorsque la mesure manque. */
      if (!rect) return { visible: false };
      /* Masque lorsque la ligne sort de la zone visible. */
      if (rect.bottom <= editorRect.top + 1 || rect.top >= editorRect.bottom - 1) return { visible: false };
      /* Convertit une distance écran en pixels locaux. */
      const toLocal = value => value / zoom;
      /* Bornes verticales visibles de la ligne. */
      const visibleTop = Math.max(rect.top, editorRect.top);
      /* Bas visible de la ligne. */
      const visibleBottom = Math.min(rect.bottom, editorRect.bottom);
      /* Retourne la bande prête à écrire. */
      return {
        /* Bande visible. */
        visible: true,
        /* Début horizontal après la gouttière. */
        left: toLocal(gutterRect.right - shellRect.left),
        /* Haut de la bande. */
        top: toLocal(visibleTop - shellRect.top),
        /* Hauteur visible de la bande. */
        height: toLocal(visibleBottom - visibleTop)
      };
    }

    /* Expose l'interface pure du moteur. */
    return {
      /* Calcule le défilement souhaité. */
      computeScroll,
      /* Applique le défilement au miroir après une écriture du contrôleur. */
      syncScroll,
      /* Calcule la géométrie des décorations. */
      computeDecorations,
      /* Calcule la bande d'une ligne éditée (surbrillance secondaire). */
      computeLineBand,
      /* Recherche du bloc de commentaire (exposée pour les tests). */
      commentBlockStart
    };
  }

  /* Publie la fabrique du moteur de géométrie. */
  window.TechnoQuestGuidedGeometryEngine = { create: createGuidedGeometry };
})();
