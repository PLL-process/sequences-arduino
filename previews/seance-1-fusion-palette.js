/*
 * Palette pédagogique et gouttière renforcée pour l’éditeur C++ de la séance 1.
 * Ce module complète la prévisualisation sans modifier les moteurs du parcours public.
 */
"use strict";

(() => {
  // Définir une palette stable et suffisamment contrastée sur fond sombre.
  const palette = {
    gutterBackground: "#111827",
    gutterNumber: "#7dd3fc",
    gutterActive: "#fde047",
    gutterBorder: "#38bdf8",
    preprocessor: "#f472b6",
    header: "#a3e635",
    comment: "#4ade80",
    type: "#22d3ee",
    keyword: "#c084fc",
    function: "#facc15",
    serial: "#38bdf8",
    string: "#fb923c",
    number: "#93c5fd",
    constant: "#f9a8d4",
    pin: "#fb7185",
    variable: "#5eead4",
    operator: "#e2e8f0",
    placeholder: "#fde047"
  };

  // Injecter les styles qui rendent la gouttière et les catégories très visibles.
  const injectStyles = () => {
    if (document.getElementById("fusionPedagogicalPaletteStyles")) return;

    const style = document.createElement("style");
    style.id = "fusionPedagogicalPaletteStyles";
    style.textContent = `
      .fusion-editor-titlebar{border-bottom-color:#2d4b60}
      .fusion-editor-titlebar::after{content:"Gouttière + coloration pédagogique";margin-left:.75rem;padding:.22rem .5rem;border:1px solid ${palette.gutterBorder};border-radius:999px;background:rgba(56,189,248,.11);color:#bae6fd;font-size:.7rem;font-weight:850;white-space:nowrap}
      .fusion-token-legend{display:flex;flex-wrap:wrap;gap:.45rem;padding:.7rem 1rem;border-bottom:1px solid #2d4b60;background:#0a1620}
      .fusion-token-legend__title{display:inline-flex;align-items:center;margin-right:.2rem;color:#e2e8f0;font-size:.78rem;font-weight:900}
      .fusion-token-chip{display:inline-flex;align-items:center;gap:.35rem;padding:.24rem .52rem;border:1px solid #314d61;border-radius:999px;background:#101e2a;color:#dbeafe;font-size:.72rem;font-weight:750;white-space:nowrap}
      .fusion-token-chip::before{width:.68rem;height:.68rem;flex:0 0 auto;border-radius:.22rem;background:var(--chip-color);box-shadow:0 0 8px color-mix(in srgb,var(--chip-color) 70%,transparent);content:""}
      .fusion-token-chip--gutter{--chip-color:${palette.gutterNumber}}
      .fusion-token-chip--preprocessor{--chip-color:${palette.preprocessor}}
      .fusion-token-chip--header{--chip-color:${palette.header}}
      .fusion-token-chip--comment{--chip-color:${palette.comment}}
      .fusion-token-chip--type{--chip-color:${palette.type}}
      .fusion-token-chip--keyword{--chip-color:${palette.keyword}}
      .fusion-token-chip--function{--chip-color:${palette.function}}
      .fusion-token-chip--serial{--chip-color:${palette.serial}}
      .fusion-token-chip--string{--chip-color:${palette.string}}
      .fusion-token-chip--number{--chip-color:${palette.number}}
      .fusion-token-chip--pin{--chip-color:${palette.pin}}
      .fusion-token-chip--variable{--chip-color:${palette.variable}}
      .fusion-line-numbers{z-index:12;width:4rem;padding-top:1rem;border-right:3px solid ${palette.gutterBorder};background:${palette.gutterBackground};color:${palette.gutterNumber};box-shadow:inset -12px 0 18px rgba(0,0,0,.22);font-weight:750}
      .fusion-line-numbers span{height:var(--fusion-line-height);padding-right:.72rem;border-left:3px solid transparent}
      .fusion-line-numbers span:nth-child(5n){background:rgba(56,189,248,.035)}
      .fusion-line-numbers span.is-target{border-left-color:${palette.gutterActive};background:linear-gradient(90deg,rgba(253,224,71,.16),rgba(253,224,71,.03));color:${palette.gutterActive};font-weight:950;text-shadow:0 0 8px rgba(253,224,71,.55)}
      .fusion-code-arrow{z-index:15;left:4.18rem;color:${palette.gutterActive};filter:drop-shadow(0 0 6px rgba(253,224,71,.95))}
      .fusion-code-highlight,.fusion-code-editor{inset:0 0 0 5.8rem;width:calc(100% - 5.8rem)}
      .fusion-code-highlight{color:#dbeafe}
      .fusion-editor-shell{border:2px solid #2f536b;border-radius:0 0 .8rem .8rem;box-shadow:inset 0 0 0 1px rgba(125,211,252,.05)}
      .fusion-editor-shell::before{position:absolute;z-index:11;top:0;bottom:0;left:4rem;width:1.8rem;background:linear-gradient(90deg,#0b1822,rgba(11,24,34,.6));content:"";pointer-events:none}
      .fusion-token-preprocessor{color:${palette.preprocessor}!important;font-weight:900}
      .fusion-token-header{color:${palette.header}!important;font-weight:850}
      .fusion-token-comment{color:${palette.comment}!important;font-style:italic}
      .fusion-token-type{color:${palette.type}!important;font-weight:900}
      .fusion-token-keyword{color:${palette.keyword}!important;font-weight:900}
      .fusion-token-function{color:${palette.function}!important;font-weight:850}
      .fusion-token-serial{color:${palette.serial}!important;font-weight:900}
      .fusion-token-string{color:${palette.string}!important}
      .fusion-token-number{color:${palette.number}!important}
      .fusion-token-constant{color:${palette.constant}!important;font-weight:850}
      .fusion-token-pin{color:${palette.pin}!important;font-weight:900}
      .fusion-token-variable{color:${palette.variable}!important;font-weight:850}
      .fusion-token-operator{color:${palette.operator}!important}
      .fusion-token-placeholder{border:1px solid rgba(253,224,71,.55);background:rgba(253,224,71,.16)!important;color:${palette.placeholder}!important;font-weight:950;text-decoration:underline wavy ${palette.placeholder};text-underline-offset:.18rem}
      .fusion-code-line.is-target{display:inline-block;width:100%;background:linear-gradient(90deg,rgba(253,224,71,.18),rgba(253,224,71,.035) 72%,transparent)}
      @media(max-width:720px){.fusion-editor-titlebar::after{display:none}.fusion-line-numbers{width:3.5rem}.fusion-code-arrow{left:3.68rem}.fusion-code-highlight,.fusion-code-editor{inset:0 0 0 5.15rem;width:calc(100% - 5.15rem)}.fusion-editor-shell::before{left:3.5rem;width:1.65rem}.fusion-token-legend{max-height:7.5rem;overflow:auto}}
    `;

    document.head.appendChild(style);
  };

  // Échapper les caractères réservés avant d’insérer le code dans le DOM.
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

  // Séparer le commentaire de la partie code sans confondre // dans une chaîne.
  const splitComment = line => {
    let quote = null;
    let escaped = false;

    for (let index = 0; index < line.length - 1; index += 1) {
      const character = line[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === "\\") {
        escaped = true;
        continue;
      }

      if (quote) {
        if (character === quote) quote = null;
        continue;
      }

      if (character === '"' || character === "'") {
        quote = character;
        continue;
      }

      if (character === "/" && line[index + 1] === "/") {
        return { code: line.slice(0, index), comment: line.slice(index) };
      }
    }

    return { code: line, comment: "" };
  };

  // Relever les variables déclarées dans le programme courant.
  const collectVariables = source => {
    const names = new Set();
    const declarationExpression = /\b(?:const\s+)?(?:int|long|float|double|bool|char|byte|unsigned\s+int|unsigned\s+long)\s+([A-Za-z_]\w*)/g;
    let match;

    while ((match = declarationExpression.exec(source))) {
      names.add(match[1]);
    }

    return names;
  };

  // Attribuer une classe pédagogique à chaque token C++ reconnu.
  const classifyToken = (value, variables) => {
    if (/^_{3,}$/.test(value)) return "fusion-token-placeholder";
    if (value.startsWith("#")) return "fusion-token-preprocessor";
    if (/^<.*>$/.test(value)) return "fusion-token-header";
    if (/^["']/.test(value)) return "fusion-token-string";
    if (/^\d/.test(value)) return "fusion-token-number";
    if (/^(void|int|long|float|double|bool|char|byte|unsigned|signed)$/.test(value)) return "fusion-token-type";
    if (/^(const|return|if|else|for|while|do|switch|case|break|continue)$/.test(value)) return "fusion-token-keyword";
    if (/^(setup|loop|pinMode|analogRead|analogWrite|digitalRead|digitalWrite|delay|millis)$/.test(value)) return "fusion-token-function";
    if (/^(Serial|begin|print|println|available|read)$/.test(value)) return "fusion-token-serial";
    if (/^(LOW|HIGH|OUTPUT|INPUT|INPUT_PULLUP|A0|A1|A2)$/.test(value)) return "fusion-token-constant";
    if (/^PIN_[A-Z0-9_]+$/.test(value)) return "fusion-token-pin";
    if (variables.has(value)) return "fusion-token-variable";
    return "fusion-token-operator";
  };

  // Colorer une portion de code en conservant tous les espaces.
  const highlightFragment = (source, variables) => {
    const tokenExpression = /(_{3,}|<[A-Za-z_][\w.\/-]*>|#[A-Za-z_]\w*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|==|!=|<=|>=|&&|\|\||\+\+|--|[=+\-*\/%<>!&|.;,:(){}\[\]])/g;
    let html = "";
    let lastIndex = 0;
    let match;

    while ((match = tokenExpression.exec(source))) {
      html += escapeHtml(source.slice(lastIndex, match.index));
      const value = match[0];
      const className = classifyToken(value, variables);
      html += `<span class="${className}">${escapeHtml(value)}</span>`;
      lastIndex = match.index + value.length;
    }

    return html + escapeHtml(source.slice(lastIndex));
  };

  // Construire la légende visible au-dessus de l’éditeur.
  const injectLegend = () => {
    if (document.querySelector(".fusion-token-legend")) return;
    const titlebar = document.querySelector(".fusion-editor-titlebar");
    if (!titlebar) return;

    const legend = document.createElement("div");
    legend.className = "fusion-token-legend";
    legend.setAttribute("aria-label", "Légende des couleurs du code C plus plus");
    legend.innerHTML = `
      <span class="fusion-token-legend__title">Légende :</span>
      <span class="fusion-token-chip fusion-token-chip--gutter">Gouttière / lignes</span>
      <span class="fusion-token-chip fusion-token-chip--preprocessor">Préprocesseur</span>
      <span class="fusion-token-chip fusion-token-chip--header">Bibliothèque</span>
      <span class="fusion-token-chip fusion-token-chip--comment">Commentaire</span>
      <span class="fusion-token-chip fusion-token-chip--type">Type</span>
      <span class="fusion-token-chip fusion-token-chip--keyword">Mot-clé</span>
      <span class="fusion-token-chip fusion-token-chip--function">Fonction Arduino</span>
      <span class="fusion-token-chip fusion-token-chip--serial">Communication série</span>
      <span class="fusion-token-chip fusion-token-chip--string">Texte affiché</span>
      <span class="fusion-token-chip fusion-token-chip--number">Nombre</span>
      <span class="fusion-token-chip fusion-token-chip--pin">Broche nommée</span>
      <span class="fusion-token-chip fusion-token-chip--variable">Variable</span>
    `;

    titlebar.insertAdjacentElement("afterend", legend);
  };

  // Repeindre l’éditeur avec la palette enrichie.
  const repaintEditor = () => {
    const editor = document.getElementById("codeEditor");
    const highlight = document.getElementById("codeHighlight");
    const lineNumbers = document.getElementById("lineNumbers");
    if (!editor || !highlight || !lineNumbers) return;

    const lines = editor.value.split("\n");
    const variables = collectVariables(editor.value);
    const targetLine = [...lineNumbers.children].findIndex(line => line.classList.contains("is-target"));

    highlight.innerHTML = lines.map((line, index) => {
      const parts = splitComment(line);
      const code = highlightFragment(parts.code, variables);
      const comment = parts.comment
        ? `<span class="fusion-token-comment">${escapeHtml(parts.comment)}</span>`
        : "";
      const targetClass = index === targetLine ? " is-target" : "";
      return `<span class="fusion-code-line${targetClass}">${code || " "}${comment}</span>`;
    }).join("\n");

    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  };

  // Initialiser le module après la création de l’éditeur principal.
  const initialize = () => {
    const editor = document.getElementById("codeEditor");
    const highlight = document.getElementById("codeHighlight");
    if (!editor || !highlight) return;

    injectStyles();
    injectLegend();
    repaintEditor();

    // L’éditeur principal travaille d’abord, puis ce module applique la palette enrichie.
    editor.addEventListener("input", () => window.requestAnimationFrame(repaintEditor));
    editor.addEventListener("scroll", () => window.requestAnimationFrame(repaintEditor), { passive: true });

    // Repeindre aussi après les boutons Restaurer, Vérifier et Charger l’exemple.
    document.addEventListener("click", event => {
      if (event.target.closest("#restoreCodeButton,#checkCodeButton,#loadReferenceButton,#runCodeButton")) {
        window.setTimeout(repaintEditor, 30);
      }
    });

    // Observer les reconstructions effectuées par le moteur principal sans créer de boucle.
    const observer = new MutationObserver(() => {
      observer.disconnect();
      repaintEditor();
      observer.observe(highlight, { childList: true, subtree: true });
    });
    observer.observe(highlight, { childList: true, subtree: true });
  };

  // Attendre que tous les scripts de la page aient créé l’éditeur.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(initialize, 0), { once: true });
  } else {
    window.setTimeout(initialize, 0);
  }
})();
