/*
 * TechnoQuest — composant commun de coloration et de gouttière multi-langages.
 * Il harmonise les éditeurs modifiables et les programmes en lecture seule.
 */
"use strict";

(() => {
  // Donner un nom lisible à chaque langage reconnu.
  const LANGUAGE_NAMES = {
    cpp: "C++ / Arduino",
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    shell: "Shell",
    powershell: "PowerShell",
    sql: "SQL",
    generic: "Code"
  };

  // Regrouper les mots réservés du C et du C++.
  const CPP_KEYWORDS = new Set([
    "alignas", "alignof", "and", "and_eq", "asm", "auto", "bitand", "bitor", "break", "case", "catch",
    "class", "compl", "concept", "const", "consteval", "constexpr", "constinit", "const_cast", "continue",
    "co_await", "co_return", "co_yield", "decltype", "default", "delete", "do", "dynamic_cast", "else",
    "enum", "explicit", "export", "extern", "false", "for", "friend", "goto", "if", "inline", "mutable",
    "namespace", "new", "noexcept", "not", "not_eq", "nullptr", "operator", "or", "or_eq", "private",
    "protected", "public", "register", "reinterpret_cast", "requires", "return", "sizeof", "static",
    "static_assert", "static_cast", "struct", "switch", "template", "this", "thread_local", "throw", "true",
    "try", "typedef", "typeid", "typename", "union", "using", "virtual", "volatile", "while", "xor", "xor_eq"
  ]);

  // Regrouper les types fréquents en C++ et dans Arduino.
  const CPP_TYPES = new Set([
    "void", "bool", "char", "signed", "unsigned", "short", "int", "long", "float", "double", "byte", "word",
    "String", "size_t", "uint8_t", "uint16_t", "uint32_t", "int8_t", "int16_t", "int32_t"
  ]);

  // Regrouper les fonctions Arduino les plus utilisées dans le parcours.
  const ARDUINO_FUNCTIONS = new Set([
    "setup", "loop", "pinMode", "digitalRead", "digitalWrite", "analogRead", "analogWrite", "delay", "delayMicroseconds",
    "millis", "micros", "map", "constrain", "tone", "noTone", "pulseIn", "attachInterrupt", "detachInterrupt"
  ]);

  // Regrouper les constantes matérielles courantes.
  const ARDUINO_CONSTANTS = new Set([
    "LOW", "HIGH", "INPUT", "OUTPUT", "INPUT_PULLUP", "LED_BUILTIN", "A0", "A1", "A2", "A3", "A4", "A5"
  ]);

  // Regrouper les mots réservés de Python.
  const PYTHON_KEYWORDS = new Set([
    "and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del", "elif", "else", "except",
    "False", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "None", "nonlocal", "not",
    "or", "pass", "raise", "return", "True", "try", "while", "with", "yield", "match", "case"
  ]);

  // Regrouper les fonctions intégrées Python courantes.
  const PYTHON_FUNCTIONS = new Set([
    "print", "input", "len", "range", "int", "float", "str", "bool", "list", "dict", "set", "tuple", "enumerate",
    "zip", "min", "max", "sum", "round", "open", "type", "isinstance", "lire_humidite", "lire_reservoir",
    "lire_lumiere", "afficher", "arroser", "stop", "alerter"
  ]);

  // Regrouper les mots réservés de JavaScript et TypeScript.
  const JS_KEYWORDS = new Set([
    "await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else",
    "export", "extends", "false", "finally", "for", "from", "function", "get", "if", "import", "in", "instanceof",
    "let", "new", "null", "of", "return", "set", "static", "super", "switch", "this", "throw", "true", "try",
    "typeof", "undefined", "var", "void", "while", "with", "yield", "async", "interface", "type", "implements",
    "private", "protected", "public", "readonly", "enum", "namespace"
  ]);

  // Regrouper les mots réservés SQL fréquents.
  const SQL_KEYWORDS = new Set([
    "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "ALTER",
    "DROP", "JOIN", "INNER", "LEFT", "RIGHT", "FULL", "ON", "GROUP", "BY", "ORDER", "HAVING", "AS", "AND", "OR",
    "NOT", "NULL", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "DISTINCT", "LIMIT", "OFFSET", "UNION", "ALL"
  ]);

  // Exclure les consoles et sorties qui ne doivent pas recevoir de gouttière.
  const SKIP_PRE_PATTERN = /(serial|console|terminal|output|monitor|journal|log|mission-console)/i;

  // Échapper les caractères réservés du HTML.
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

  // Normaliser les alias courants de langages.
  const normalizeLanguage = value => {
    const language = String(value || "").toLowerCase().replace(/[^a-z0-9+#-]/g, "");
    if (["c", "cc", "cxx", "cpp", "c++", "arduino", "ino"].includes(language)) return "cpp";
    if (["py", "python", "micropython"].includes(language)) return "python";
    if (["js", "javascript", "node", "nodejs"].includes(language)) return "javascript";
    if (["ts", "typescript"].includes(language)) return "typescript";
    if (["html", "htm", "xml", "svg"].includes(language)) return "html";
    if (["css", "scss", "sass", "less"].includes(language)) return "css";
    if (["json", "jsonc"].includes(language)) return "json";
    if (["sh", "bash", "shell", "zsh"].includes(language)) return "shell";
    if (["ps1", "powershell", "pwsh"].includes(language)) return "powershell";
    if (["sql", "sqlite", "mysql", "postgresql"].includes(language)) return "sql";
    return language && LANGUAGE_NAMES[language] ? language : "generic";
  };

  // Chercher une indication de langage dans les attributs ou classes.
  const languageFromElement = element => {
    const explicit = element.dataset.language || element.dataset.lang || element.getAttribute("lang");
    if (explicit) return normalizeLanguage(explicit);

    // Examiner les classes de l’élément et de son enfant code éventuel.
    const classText = [element.className, element.querySelector?.("code")?.className]
      .filter(Boolean)
      .join(" ");
    const classMatch = classText.match(/(?:language|lang)-([\w+#-]+)/i);
    if (classMatch) return normalizeLanguage(classMatch[1]);

    // Reconnaître les classes descriptives propres au projet.
    if (/cpp|arduino|sketch|ino/i.test(classText)) return "cpp";
    if (/python|py-code/i.test(classText)) return "python";
    if (/javascript|typescript|html|css|json|powershell|shell|sql/i.test(classText)) {
      const match = classText.match(/javascript|typescript|html|css|json|powershell|shell|sql/i);
      return normalizeLanguage(match?.[0]);
    }

    return null;
  };

  // Détecter le langage à partir de motifs caractéristiques.
  const detectLanguage = (source, element = null) => {
    const explicit = element ? languageFromElement(element) : null;
    if (explicit && explicit !== "generic") return explicit;

    const code = String(source || "");
    const scores = {
      cpp: 0,
      python: 0,
      javascript: 0,
      typescript: 0,
      html: 0,
      css: 0,
      json: 0,
      shell: 0,
      powershell: 0,
      sql: 0
    };

    // Pondérer les marqueurs C++ et Arduino.
    if (/#include\s*[<"]/.test(code)) scores.cpp += 5;
    if (/\bvoid\s+(?:setup|loop)\s*\(/.test(code)) scores.cpp += 6;
    if (/\b(?:pinMode|analogRead|digitalWrite|Serial\.)\b/.test(code)) scores.cpp += 4;
    if (/\b(?:const\s+int|uint\d+_t|std::)\b/.test(code)) scores.cpp += 2;

    // Pondérer les marqueurs Python.
    if (/^\s*(?:def|class)\s+\w+/m.test(code)) scores.python += 5;
    if (/^\s*(?:from\s+\w+\s+import|import\s+\w+)/m.test(code)) scores.python += 4;
    if (/^\s*(?:if|elif|for|while)\b[^\n]*:\s*$/m.test(code)) scores.python += 3;
    if (/\b(?:print|range|len)\s*\(/.test(code)) scores.python += 2;
    if (/\b(?:lire_humidite|arroser|alerter|stop)\s*\(/.test(code)) scores.python += 3;

    // Pondérer les marqueurs JavaScript et TypeScript.
    if (/\b(?:const|let|var)\s+\w+\s*=/.test(code)) scores.javascript += 3;
    if (/=>|\bfunction\s+\w*\s*\(/.test(code)) scores.javascript += 4;
    if (/\b(?:document|window|console)\./.test(code)) scores.javascript += 4;
    if (/\binterface\s+\w+|:\s*(?:string|number|boolean)\b/.test(code)) scores.typescript += 5;

    // Pondérer les marqueurs HTML et CSS.
    if (/<(?:!doctype|html|head|body|div|section|script|style|svg)\b/i.test(code)) scores.html += 6;
    if (/<\/?[a-z][^>]*>/i.test(code)) scores.html += 3;
    if (/[.#]?[a-z][\w-]*(?:\s+[.#]?[a-z][\w-]*)*\s*\{[^}]*[\w-]+\s*:/i.test(code)) scores.css += 5;

    // Pondérer les marqueurs JSON.
    if (/^\s*[\[{]/.test(code) && /"[^"\n]+"\s*:/.test(code)) scores.json += 5;

    // Pondérer les marqueurs Shell et PowerShell.
    if (/^\s*#!.*\b(?:bash|sh|zsh)\b/m.test(code)) scores.shell += 6;
    if (/^\s*(?:sudo\s+|apt(?:-get)?\s+|echo\s+|cd\s+)/m.test(code)) scores.shell += 3;
    if (/\$[A-Za-z_]\w*|\b(?:Get|Set|Write|New|Remove)-[A-Za-z]+\b/.test(code)) scores.powershell += 5;

    // Pondérer les marqueurs SQL.
    if (/\bSELECT\b[\s\S]+\bFROM\b/i.test(code)) scores.sql += 5;
    if (/\b(?:INSERT\s+INTO|CREATE\s+TABLE|UPDATE\s+\w+\s+SET)\b/i.test(code)) scores.sql += 5;

    // Choisir le langage obtenant le score le plus élevé.
    const ranked = Object.entries(scores).sort((first, second) => second[1] - first[1]);
    return ranked[0][1] > 0 ? ranked[0][0] : explicit || "generic";
  };

  // Extraire les noms de variables déclarées pour les colorer de façon stable.
  const collectVariables = (source, language) => {
    const variables = new Set();
    const code = String(source || "");
    let expression = null;

    // Utiliser une expression adaptée aux déclarations C/C++.
    if (language === "cpp") {
      expression = /\b(?:const\s+)?(?:bool|char|byte|short|int|long|float|double|String|size_t|u?int\d+_t)\s+([A-Za-z_]\w*)/g;
    }

    // Utiliser une expression adaptée aux affectations Python.
    if (language === "python") {
      expression = /^\s*([A-Za-z_]\w*)\s*=/gm;
    }

    // Utiliser une expression adaptée aux déclarations JavaScript et TypeScript.
    if (language === "javascript" || language === "typescript") {
      expression = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
    }

    // Utiliser une expression adaptée aux variables PowerShell.
    if (language === "powershell") {
      expression = /\$([A-Za-z_]\w*)/g;
    }

    // Parcourir toutes les déclarations trouvées.
    if (expression) {
      let match;
      while ((match = expression.exec(code))) variables.add(match[1]);
    }

    return variables;
  };

  // Repérer le début d’un commentaire en respectant les chaînes de caractères.
  const splitLineComment = (line, language) => {
    const markers = language === "sql"
      ? ["--"]
      : ["cpp", "javascript", "typescript"].includes(language)
        ? ["//"]
        : ["python", "shell", "powershell"].includes(language)
          ? ["#"]
          : [];
    let quote = null;
    let escaped = false;

    // Examiner chaque caractère jusqu’à trouver un marqueur hors chaîne.
    for (let index = 0; index < line.length; index += 1) {
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

      if (character === '"' || character === "'" || character === "`") {
        quote = character;
        continue;
      }

      const marker = markers.find(candidate => line.startsWith(candidate, index));
      if (marker) return { code: line.slice(0, index), comment: line.slice(index) };
    }

    return { code: line, comment: "" };
  };

  // Classer un identifiant selon le langage et sa fonction pédagogique.
  const classifyIdentifier = (value, language, variables, context = {}) => {
    // Reconnaître les broches nommées et les constantes matérielles.
    if (/^(?:PIN|BROCHE|RELAIS|CAPTEUR)_[A-Z0-9_]+$/.test(value)) return "ch-pin";
    if (ARDUINO_CONSTANTS.has(value)) return "ch-constant";

    // Reconnaître les entités C++ et Arduino.
    if (language === "cpp") {
      if (CPP_TYPES.has(value)) return "ch-type";
      if (CPP_KEYWORDS.has(value)) return "ch-keyword";
      if (ARDUINO_FUNCTIONS.has(value)) return "ch-function";
      if (["Serial", "begin", "print", "println", "available", "read"].includes(value)) return "ch-serial";
    }

    // Reconnaître les entités Python.
    if (language === "python") {
      if (PYTHON_KEYWORDS.has(value)) return "ch-keyword";
      if (PYTHON_FUNCTIONS.has(value)) return "ch-function";
    }

    // Reconnaître les entités JavaScript et TypeScript.
    if (language === "javascript" || language === "typescript") {
      if (JS_KEYWORDS.has(value)) return "ch-keyword";
      if (["console", "document", "window", "JSON", "Math", "Array", "Object", "Promise"].includes(value)) return "ch-serial";
      if (context.nextNonSpace === "(") return "ch-function";
    }

    // Reconnaître les mots-clés SQL indépendamment de la casse.
    if (language === "sql" && SQL_KEYWORDS.has(value.toUpperCase())) return "ch-keyword";

    // Reconnaître les commandes Shell et PowerShell.
    if (["shell", "powershell"].includes(language) && context.commandPosition) return "ch-command";

    // Reconnaître une variable déjà déclarée.
    if (variables.has(value.replace(/^\$/, ""))) return "ch-variable";

    // Reconnaître les constantes conventionnelles écrites en capitales.
    if (/^[A-Z][A-Z0-9_]{2,}$/.test(value)) return "ch-constant";

    // Utiliser une couleur de fonction quand un appel est détecté.
    if (context.nextNonSpace === "(") return "ch-function";

    return "ch-operator";
  };

  // Colorer une ligne HTML ou XML.
  const highlightMarkupLine = line => {
    const expression = /(<!--[\s\S]*?-->|<\/?[A-Za-z][\w:-]*|\s+[A-Za-z_:][-\w:.]*(?=\s*=)|"[^"]*"|'[^']*'|\/>|>|=)/g;
    let output = "";
    let lastIndex = 0;
    let match;

    // Transformer chaque token de balisage en span coloré.
    while ((match = expression.exec(line))) {
      output += escapeHtml(line.slice(lastIndex, match.index));
      const value = match[0];
      let className = "ch-operator";
      if (value.startsWith("<!--")) className = "ch-comment";
      else if (/^<\/?/.test(value)) className = "ch-tag";
      else if (/^\s+[A-Za-z_:]/.test(value)) className = "ch-attribute";
      else if (/^["']/.test(value)) className = "ch-string";
      output += `<span class="${className}">${escapeHtml(value)}</span>`;
      lastIndex = match.index + value.length;
    }

    return output + escapeHtml(line.slice(lastIndex));
  };

  // Colorer une ligne CSS.
  const highlightCssLine = line => {
    const expression = /(\/\*.*?\*\/|#[0-9a-fA-F]{3,8}\b|--[\w-]+|[\w-]+(?=\s*:)|[.#]?[A-Za-z][\w-]*(?=\s*\{)|"[^"]*"|'[^']*'|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|deg)?\b|[{}:;,()>+~*=])/g;
    let output = "";
    let lastIndex = 0;
    let match;

    // Transformer chaque token CSS en span coloré.
    while ((match = expression.exec(line))) {
      output += escapeHtml(line.slice(lastIndex, match.index));
      const value = match[0];
      let className = "ch-operator";
      if (value.startsWith("/*")) className = "ch-comment";
      else if (/^["']/.test(value)) className = "ch-string";
      else if (/^\d/.test(value) || /^#[0-9a-f]/i.test(value)) className = "ch-number";
      else if (/^[.#]/.test(value) || /\{$/.test(line.trim())) className = "ch-selector";
      else if (/^[\w-]+$/.test(value)) className = "ch-property";
      output += `<span class="${className}">${escapeHtml(value)}</span>`;
      lastIndex = match.index + value.length;
    }

    return output + escapeHtml(line.slice(lastIndex));
  };

  // Colorer une ligne JSON en distinguant les clés et les valeurs.
  const highlightJsonLine = line => {
    const expression = /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\b(?:true|false|null)\b|[{}\[\],:])/g;
    let output = "";
    let lastIndex = 0;
    let match;

    // Transformer chaque token JSON en span coloré.
    while ((match = expression.exec(line))) {
      output += escapeHtml(line.slice(lastIndex, match.index));
      const value = match[0];
      let className = "ch-operator";
      if (/^"/.test(value)) className = /:\s*$/.test(line.slice(match.index + value.length)) ? "ch-property" : "ch-string";
      if (/^-?\d/.test(value)) className = "ch-number";
      if (/^(true|false|null)$/.test(value)) className = "ch-constant";
      output += `<span class="${className}">${escapeHtml(value)}</span>`;
      lastIndex = match.index + value.length;
    }

    return output + escapeHtml(line.slice(lastIndex));
  };

  // Colorer une ligne de langage textuel général.
  const highlightGenericLine = (line, language, variables) => {
    const parts = splitLineComment(line, language);
    const source = parts.code;
    const tokenExpression = /(_{3,}|#[A-Za-z_]\w*|<[A-Za-z_][\w.\/-]*>|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\$[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|==|!=|<=|>=|=>|&&|\|\||\+\+|--|::|[=+\-*\/%<>!&|.;,:(){}\[\]])/g;
    let output = "";
    let lastIndex = 0;
    let match;

    // Examiner chaque token sans effectuer de remplacement récursif.
    while ((match = tokenExpression.exec(source))) {
      output += escapeHtml(source.slice(lastIndex, match.index));
      const value = match[0];
      const after = source.slice(match.index + value.length);
      const before = source.slice(0, match.index);
      const nextNonSpace = after.match(/\S/)?.[0] || "";
      const commandPosition = /^\s*$/.test(before) || /[|;&]\s*$/.test(before);
      let className = "ch-operator";

      if (/^_{3,}$/.test(value)) className = "ch-placeholder";
      else if (/^#[A-Za-z_]/.test(value) && language === "cpp") className = "ch-directive";
      else if (/^<.*>$/.test(value) && language === "cpp") className = "ch-library";
      else if (/^["'`]/.test(value)) className = "ch-string";
      else if (/^\d/.test(value)) className = "ch-number";
      else if (/^\$/.test(value)) className = "ch-variable";
      else if (/^[A-Za-z_]/.test(value)) className = classifyIdentifier(value, language, variables, { nextNonSpace, commandPosition });

      output += `<span class="${className}">${escapeHtml(value)}</span>`;
      lastIndex = match.index + value.length;
    }

    // Ajouter la fin du code et le commentaire éventuel.
    output += escapeHtml(source.slice(lastIndex));
    if (parts.comment) output += `<span class="ch-comment">${escapeHtml(parts.comment)}</span>`;
    return output;
  };

  // Colorer une ligne selon le langage détecté.
  const highlightLine = (line, language, variables) => {
    if (language === "html") return highlightMarkupLine(line);
    if (language === "css") return highlightCssLine(line);
    if (language === "json") return highlightJsonLine(line);
    return highlightGenericLine(line, language, variables);
  };

  // Construire la légende adaptée au langage affiché.
  const legendHtml = language => {
    const common = [
      ["gutter", "Gouttière / lignes"],
      ["comment", "Commentaire"],
      ["keyword", "Mot-clé"],
      ["function", "Fonction"],
      ["string", "Texte"],
      ["number", "Nombre"],
      ["variable", "Variable"]
    ];
    const additions = language === "cpp"
      ? [["directive", "Préprocesseur"], ["library", "Bibliothèque"], ["type", "Type"], ["serial", "Communication série"], ["pin", "Broche nommée"]]
      : language === "html"
        ? [["tag", "Balise"], ["property", "Attribut"]]
        : language === "css"
          ? [["tag", "Sélecteur"], ["property", "Propriété"]]
          : ["shell", "powershell"].includes(language)
            ? [["command", "Commande"]]
            : [];

    // Produire les pastilles de couleur de la légende.
    return [...common, ...additions]
      .map(([className, label]) => `<span class="code-harmony-chip code-harmony-chip--${className}">${label}</span>`)
      .join("");
  };

  // Déduire un titre court à partir du contexte du bloc.
  const inferTitle = (element, language) => {
    const explicit = element.dataset.codeTitle || element.getAttribute("aria-label");
    if (explicit) return explicit;
    const heading = element.closest("article,section,div")?.querySelector("h2,h3,h4");
    if (heading && !heading.contains(element)) return heading.textContent.trim();
    return `Programme ${LANGUAGE_NAMES[language] || "Code"}`;
  };

  // Déterminer si un bloc pre correspond réellement à du code.
  const shouldDecoratePre = pre => {
    if (pre.dataset.codeHarmonyEnhanced === "true") return false;
    if (pre.closest(".code-harmony-shell")) return false;
    const identity = `${pre.id} ${pre.className}`;
    if (SKIP_PRE_PATTERN.test(identity)) return false;
    if (["codeHighlight", "missionSerial", "serialMonitor"].includes(pre.id)) return false;
    if (pre.closest(".editor-wrap,.fusion-editor-shell,.code-harmony-textarea-shell")) return false;

    const source = pre.textContent || "";
    if (source.trim().length < 4) return false;
    if (languageFromElement(pre)) return true;
    if (pre.closest(".cpp-structure-course,.cpp-timeline,.correction,.mission-side-panel,.python-guide")) return true;
    return detectLanguage(source, pre) !== "generic";
  };

  // Transformer un pre statique en programme avec gouttière et palette.
  const decorateStaticPre = pre => {
    if (!shouldDecoratePre(pre)) return;

    // Conserver le texte brut avant de remplacer les spans historiques.
    const source = (pre.textContent || "").replace(/^\n|\n$/g, "");
    const language = detectLanguage(source, pre);
    const variables = collectVariables(source, language);
    const lines = source.split("\n");

    // Créer l’enveloppe générale.
    const shell = document.createElement("section");
    shell.className = "code-harmony-shell";
    shell.dataset.language = language;

    // Créer l’en-tête, le titre et les outils.
    const header = document.createElement("header");
    header.className = "code-harmony-header";
    header.innerHTML = `<strong class="code-harmony-title">${escapeHtml(inferTitle(pre, language))}</strong><div class="code-harmony-tools"><span class="code-harmony-language">${escapeHtml(LANGUAGE_NAMES[language] || "Code")}</span><button class="code-harmony-copy" type="button">Copier</button></div>`;

    // Créer la légende repliable.
    const legend = document.createElement("details");
    legend.className = "code-harmony-legend";
    legend.innerHTML = `<summary>Légende pédagogique des couleurs</summary><div class="code-harmony-legend-grid">${legendHtml(language)}</div>`;

    // Créer la zone de défilement et la grille.
    const body = document.createElement("div");
    body.className = "code-harmony-body";
    const grid = document.createElement("div");
    grid.className = "code-harmony-grid";
    const gutter = document.createElement("div");
    gutter.className = "code-harmony-gutter";
    gutter.setAttribute("aria-hidden", "true");

    // Construire les numéros de ligne.
    gutter.innerHTML = lines.map((_, index) => `<span>${index + 1}</span>`).join("");

    // Réutiliser l’élément pre d’origine comme source colorée.
    pre.dataset.codeHarmonyEnhanced = "true";
    pre.dataset.language = language;
    pre.classList.add("code-harmony-source");
    pre.innerHTML = lines
      .map(line => `<span class="ch-line">${highlightLine(line, language, variables) || "&nbsp;"}</span>`)
      .join("");

    // Insérer l’enveloppe à la place du bloc d’origine.
    pre.parentNode.insertBefore(shell, pre);
    shell.append(header, legend, body);
    body.appendChild(grid);
    grid.append(gutter, pre);

    // Relier le bouton Copier au texte brut.
    header.querySelector(".code-harmony-copy").addEventListener("click", async event => {
      try {
        await navigator.clipboard.writeText(source);
        event.currentTarget.textContent = "Copié ✓";
        window.setTimeout(() => { event.currentTarget.textContent = "Copier"; }, 1200);
      } catch {
        event.currentTarget.textContent = "Copie impossible";
      }
    });
  };

  // Construire un en-tête compact commun aux éditeurs modifiables.
  const createEditorHead = (editor, language) => {
    const existing = editor.closest(".fusion-editor-panel,.tq-editor-panel,.card-body")?.querySelector(":scope > .code-harmony-editor-head");
    if (existing) return existing;

    const head = document.createElement("div");
    head.className = "code-harmony-editor-head";
    head.innerHTML = `<strong>Éditeur pédagogique avec gouttière</strong><span>${escapeHtml(LANGUAGE_NAMES[language] || "Code")}</span>`;
    return head;
  };

  // Trouver la ligne du curseur dans un textarea.
  const caretLine = editor => editor.value.slice(0, editor.selectionStart || 0).split("\n").length - 1;

  // Trouver la première ligne encore incomplète, sinon la ligne du curseur.
  const targetLine = editor => {
    const lines = editor.value.split("\n");
    const missing = lines.findIndex(line => /_{3,}|<\?\?>|TODO\b/.test(line));
    return missing >= 0 ? missing : caretLine(editor);
  };

  // Construire les numéros d’un éditeur modifiable.
  const renderLiveGutter = (editor, gutter, arrow = null) => {
    const lines = editor.value.split("\n");
    const active = Math.max(0, targetLine(editor));
    gutter.innerHTML = lines.map((_, index) => `<span class="${index === active ? "is-active" : ""}">${index + 1}</span>`).join("");
    gutter.scrollTop = editor.scrollTop;

    // Placer la flèche jaune sur la même ligne que la gouttière.
    if (arrow) {
      const style = getComputedStyle(editor);
      const lineHeight = parseFloat(style.lineHeight) || 24.8;
      const paddingTop = parseFloat(style.paddingTop) || 16;
      arrow.style.top = `${paddingTop + active * lineHeight - editor.scrollTop}px`;
      arrow.textContent = "➤";
    }
  };

  // Repeindre la couche colorée d’un éditeur.
  const renderLiveHighlight = (editor, highlight, language) => {
    const source = editor.value;
    const variables = collectVariables(source, language);
    const active = Math.max(0, targetLine(editor));
    highlight.innerHTML = source.split("\n")
      .map((line, index) => `<span class="ch-line ${index === active ? "is-target" : ""}">${highlightLine(line, language, variables) || "&nbsp;"}</span>`)
      .join("");
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
  };

  // Harmoniser l’éditeur classique déjà présent dans les huit séances.
  const enhanceClassicEditor = wrap => {
    if (wrap.dataset.codeHarmonyEnhanced === "true") return;
    const editor = wrap.querySelector("textarea");
    const highlight = wrap.querySelector("pre");
    if (!editor || !highlight) return;

    const language = detectLanguage(editor.value, editor);
    wrap.dataset.codeHarmonyEnhanced = "true";
    wrap.dataset.language = language;
    wrap.classList.add("code-harmony-live-editor");

    // Créer la gouttière et la flèche jaune.
    const gutter = document.createElement("div");
    gutter.className = "code-harmony-live-gutter";
    gutter.setAttribute("aria-hidden", "true");
    const arrow = document.createElement("div");
    arrow.className = "code-harmony-live-arrow";
    arrow.setAttribute("aria-hidden", "true");
    wrap.prepend(gutter, arrow);

    // Ajouter l’en-tête avant l’éditeur.
    const head = createEditorHead(editor, language);
    wrap.insertAdjacentElement("beforebegin", head);

    // Préparer une fonction de rendu commune.
    const render = () => {
      const currentLanguage = detectLanguage(editor.value, editor);
      wrap.dataset.language = currentLanguage;
      head.querySelector("span").textContent = LANGUAGE_NAMES[currentLanguage] || "Code";
      renderLiveHighlight(editor, highlight, currentLanguage);
      renderLiveGutter(editor, gutter, arrow);
    };

    // Mettre à jour l’affichage lors de chaque interaction utile.
    editor.addEventListener("input", () => window.requestAnimationFrame(render));
    editor.addEventListener("scroll", () => window.requestAnimationFrame(render), { passive: true });
    editor.addEventListener("click", render);
    editor.addEventListener("keyup", render);
    editor.addEventListener("select", render);
    render();
  };

  // Harmoniser un textarea simple en lui ajoutant une couche colorée.
  const enhancePlainEditor = editor => {
    if (editor.dataset.codeHarmonyEnhanced === "true") return;
    if (editor.closest(".editor-wrap,.fusion-editor-shell,.mission-reflection")) return;
    if (!/codeEditor|code-editor|program/i.test(`${editor.id} ${editor.className} ${editor.dataset.role || ""}`)) return;

    const language = detectLanguage(editor.value, editor);
    editor.dataset.codeHarmonyEnhanced = "true";

    // Créer l’en-tête et l’enveloppe de l’éditeur.
    const head = createEditorHead(editor, language);
    const shell = document.createElement("div");
    shell.className = "code-harmony-textarea-shell";
    const gutter = document.createElement("div");
    gutter.className = "code-harmony-live-gutter";
    gutter.setAttribute("aria-hidden", "true");
    const arrow = document.createElement("div");
    arrow.className = "code-harmony-live-arrow";
    arrow.setAttribute("aria-hidden", "true");
    const highlight = document.createElement("pre");
    highlight.className = "code-harmony-live-highlight";
    highlight.setAttribute("aria-hidden", "true");

    // Insérer l’enveloppe à la place du textarea.
    editor.parentNode.insertBefore(head, editor);
    editor.parentNode.insertBefore(shell, editor);
    shell.append(gutter, arrow, highlight, editor);

    // Préparer la fonction de rendu de l’éditeur simple.
    const render = () => {
      const currentLanguage = detectLanguage(editor.value, editor);
      head.querySelector("span").textContent = LANGUAGE_NAMES[currentLanguage] || "Code";
      renderLiveHighlight(editor, highlight, currentLanguage);
      renderLiveGutter(editor, gutter, arrow);
    };

    // Mettre à jour les couches au fil de la saisie.
    editor.addEventListener("input", () => window.requestAnimationFrame(render));
    editor.addEventListener("scroll", () => window.requestAnimationFrame(render), { passive: true });
    editor.addEventListener("click", render);
    editor.addEventListener("keyup", render);
    render();
  };

  // Harmoniser l’éditeur spécial de la prévisualisation fusionnée.
  const enhanceFusionEditor = shell => {
    if (shell.dataset.codeHarmonyEnhanced === "true") return;
    shell.dataset.codeHarmonyEnhanced = "true";
    const titlebar = shell.closest(".fusion-editor-panel")?.querySelector(".fusion-editor-titlebar");
    if (!titlebar || titlebar.nextElementSibling?.classList.contains("code-harmony-legend")) return;

    // Ajouter la même légende que dans tous les autres éditeurs.
    const legend = document.createElement("details");
    legend.className = "code-harmony-legend";
    legend.innerHTML = `<summary>Légende pédagogique des couleurs</summary><div class="code-harmony-legend-grid">${legendHtml("cpp")}</div>`;
    titlebar.insertAdjacentElement("afterend", legend);
  };

  // Colorer les petits extraits code affichés sans pre, sans ajouter de gouttière.
  const decorateInlineCode = code => {
    if (code.dataset.codeHarmonyEnhanced === "true") return;
    if (code.closest("pre,.code-harmony-shell,.fusion-editor-shell,.editor-wrap")) return;
    const source = code.textContent || "";
    if (source.trim().length < 3 || source.includes("\n")) return;
    const language = detectLanguage(source, code);
    if (language === "generic" && !code.closest(".python-guide,.cpp-structure-course,.course-note,.program-help")) return;
    code.dataset.codeHarmonyEnhanced = "true";
    code.classList.add("code-harmony-inline");
    code.innerHTML = highlightLine(source, language, collectVariables(source, language));
  };

  // Scanner une portion du document pour y appliquer les composants communs.
  const scan = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll("pre").forEach(decorateStaticPre);
    scope.querySelectorAll(".editor-wrap").forEach(enhanceClassicEditor);
    scope.querySelectorAll("textarea#codeEditor,textarea[data-code-editor],textarea.code-editor").forEach(enhancePlainEditor);
    scope.querySelectorAll(".fusion-editor-shell").forEach(enhanceFusionEditor);
    scope.querySelectorAll("code").forEach(decorateInlineCode);
  };

  // Initialiser le composant et surveiller les contenus générés dynamiquement.
  const initialize = () => {
    scan(document);

    // Observer les ajouts réalisés par les moteurs de séance et le Mode Mission.
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          scan(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  // Attendre la construction du document avant le premier scan.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
