/* TechnoQuest — assistance de l’éditeur C++ Arduino inspirée de CodeCombat. */
"use strict";

(() => {
  /* Le catalogue centralise les commandes proposées et leurs fiches méthodes. */
  const METHODS = [
    {
      id: "include",
      label: "#include <Arduino.h>",
      aliases: ["#i", "include", "arduino"],
      insert: "#include <Arduino.h>",
      description: "Charge les définitions essentielles de l’environnement Arduino avant la compilation.",
      example: "#include <Arduino.h>",
      parameters: []
    },
    {
      id: "const-int",
      label: "const int nom = broche;",
      aliases: ["const", "int", "pin"],
      insert: "const int NOM_BROCHE = A0;",
      cursor: "NOM_BROCHE",
      description: "Crée une constante entière pour nommer clairement une broche du montage.",
      example: "const int PIN_HUMIDITE_SOL = A0;",
      parameters: [
        ["NOM_BROCHE", "Nom explicite de la broche."],
        ["A0", "Numéro ou nom de la broche Arduino."]
      ]
    },
    {
      id: "setup",
      label: "void setup()",
      aliases: ["setup", "void", "initialiser"],
      insert: "void setup() {\n  \n}",
      cursor: "  \n",
      description: "Contient les instructions exécutées une seule fois au démarrage de la carte.",
      example: "void setup() {\n  Serial.begin(9600);\n}",
      parameters: []
    },
    {
      id: "loop",
      label: "void loop()",
      aliases: ["loop", "void", "boucle"],
      insert: "void loop() {\n  \n}",
      cursor: "  \n",
      description: "Contient la boucle de surveillance répétée tant que la carte est alimentée.",
      example: "void loop() {\n  int humidite = analogRead(A0);\n}",
      parameters: []
    },
    {
      id: "serial-begin",
      label: "Serial.begin(9600);",
      aliases: ["ser", "serial", "begin", "9600"],
      insert: "Serial.begin(9600);",
      description: "Initialise la liaison série afin d’afficher les mesures dans le Moniteur Série.",
      example: "Serial.begin(9600);",
      parameters: [["9600", "Vitesse de communication en bauds."]]
    },
    {
      id: "pinmode-output",
      label: "pinMode(broche, OUTPUT);",
      aliases: ["pin", "pinmode", "output", "sortie"],
      insert: "pinMode(PIN_RELAIS_POMPE, OUTPUT);",
      cursor: "PIN_RELAIS_POMPE",
      description: "Configure une broche logique en sortie pour commander un actionneur.",
      example: "pinMode(PIN_RELAIS_POMPE, OUTPUT);",
      parameters: [
        ["broche", "Broche numérique à configurer."],
        ["OUTPUT", "Mode sortie logique."]
      ]
    },
    {
      id: "digitalwrite-low",
      label: "digitalWrite(broche, LOW);",
      aliases: ["dig", "digitalwrite", "low", "arreter"],
      insert: "digitalWrite(PIN_RELAIS_POMPE, LOW);",
      cursor: "PIN_RELAIS_POMPE",
      description: "Place la sortie à l’état logique bas. Dans cette mission, cela maintient la pompe à l’arrêt au démarrage.",
      example: "digitalWrite(PIN_RELAIS_POMPE, LOW);",
      parameters: [
        ["broche", "Broche reliée au relais de la pompe."],
        ["LOW", "Niveau logique bas, égal à 0."]
      ]
    },
    {
      id: "analogread",
      label: "analogRead(broche)",
      aliases: ["ana", "analogread", "lire", "capteur"],
      insert: "analogRead(PIN_HUMIDITE_SOL)",
      cursor: "PIN_HUMIDITE_SOL",
      description: "Lit une valeur analogique provenant d’un capteur connecté à une entrée A0 à A5.",
      example: "int humidite = analogRead(PIN_HUMIDITE_SOL);",
      parameters: [["broche", "Entrée analogique, par exemple A0."]]
    },
    {
      id: "serial-print",
      label: "Serial.print(message);",
      aliases: ["ser", "serial", "print", "afficher"],
      insert: "Serial.print(\"Humidite : \");",
      cursor: "Humidite : ",
      description: "Affiche une donnée dans le Moniteur Série sans revenir automatiquement à la ligne.",
      example: "Serial.print(\"Humidite : \");",
      parameters: [["message", "Texte, nombre ou variable à afficher."]]
    },
    {
      id: "serial-println",
      label: "Serial.println(valeur);",
      aliases: ["ser", "serial", "println", "ligne"],
      insert: "Serial.println(humidite);",
      cursor: "humidite",
      description: "Affiche une donnée dans le Moniteur Série puis commence une nouvelle ligne.",
      example: "Serial.println(humidite);",
      parameters: [["valeur", "Texte, nombre ou variable à afficher."]]
    },
    {
      id: "delay",
      label: "delay(duree);",
      aliases: ["del", "delay", "attendre", "temporisation"],
      insert: "delay(500);",
      cursor: "500",
      description: "Ajoute une temporisation exprimée en millisecondes entre deux lectures.",
      example: "delay(500);",
      parameters: [["duree", "Temps d’attente en millisecondes."]]
    },
    {
      /* Fiche pédagogique (n'insère aucun code) : règles de nommage des variables. */
      id: "nommer-variable",
      label: "Bien nommer une variable",
      aliases: ["nom", "nommer", "variable", "identifiant"],
      insert: "",
      guide: true,
      description: "Un identifiant décrit clairement la valeur mémorisée et ne représente qu'une seule information. Trois capteurs nécessitent trois identifiants distincts. Les majuscules comptent : niveauEau, niveaueau et NIVEAUEAU sont trois identifiants différents. Les mots réservés du C++ ne peuvent pas servir de noms.",
      valid: ["humiditeSol", "niveauEau", "niveau_eau", "mesureReservoir", "capteur2"],
      invalid: [
        ["niveau eau", "contient un espace"],
        ["niveau-eau", "contient un tiret"],
        ["niveauÉau", "contient un accent"],
        ["2eCapteur", "commence par un chiffre"],
        ["niveauEau!", "contient un caractère spécial"]
      ],
      example: "int niveauEau = analogRead(PIN_NIVEAU_EAU);",
      parameters: []
    }
  ];

  /* Protège les textes injectés dans l’interface. */
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));

  /* Attend que le mode Mission ait construit son interface dynamique. */
  function waitForMission(attempt = 0) {
    const root = document.getElementById("missionModeRoot");
    const editor = document.getElementById("codeEditor");
    const codeShell = document.getElementById("missionCodeShell");
    if (root && editor && codeShell) {
      enhanceMission(root, editor, codeShell);
      return;
    }
    if (attempt < 80) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Installe toutes les améliorations sans modifier le fonctionnement pédagogique existant. */
  function enhanceMission(root, editor, codeShell) {
    if (root.dataset.editorAssistReady === "true") return;
    root.dataset.editorAssistReady = "true";

    const codePanel = codeShell.closest(".mission-panel");
    const panelHead = codePanel?.querySelector(".mission-panel-head");
    const panelBody = codePanel?.querySelector(".mission-panel-body");
    const helpLevel = document.getElementById("missionHelpLevel");
    if (!codePanel || !panelHead || !panelBody || !helpLevel) return;

    codePanel.classList.add("mission-code-panel");

    const headActions = buildHeadActions();
    panelHead.appendChild(headActions.container);

    const methodCard = buildMethodCard();
    panelBody.appendChild(methodCard.card);

    const completion = buildCompletionMenu();
    codeShell.appendChild(completion.menu);

    const commandRail = buildCommandRail();
    codeShell.insertAdjacentElement("afterend", commandRail.rail);

    const learningDialog = buildLearningDialog();
    root.appendChild(learningDialog.dialog);

    bindFullscreen(codePanel, panelHead, headActions.fullscreenButton);
    bindLearningPopups(root, learningDialog, headActions.courseButton);
    bindMethodCards(commandRail, methodCard, editor);
    bindCompletion(editor, helpLevel, completion, methodCard);

    /* Le bouton Méthodes ouvre directement la première fiche comme repère. */
    headActions.methodsButton.addEventListener("click", () => showMethod(METHODS[0], methodCard));
  }

  /* Crée les boutons de l’en-tête de l’éditeur. */
  function buildHeadActions() {
    const container = document.createElement("div");
    container.className = "mission-editor-head-actions";
    container.innerHTML = `
      <button id="missionCoursePopup" class="btn" type="button">Cours</button>
      <button id="missionMethodsPopup" class="btn" type="button">Méthodes</button>
      <button id="missionEditorFullscreen" class="btn primary" type="button" aria-pressed="false">Plein écran</button>`;
    return {
      container,
      courseButton: container.querySelector("#missionCoursePopup"),
      methodsButton: container.querySelector("#missionMethodsPopup"),
      fullscreenButton: container.querySelector("#missionEditorFullscreen")
    };
  }

  /* Construit la fiche méthode contextuelle. */
  function buildMethodCard() {
    const card = document.createElement("aside");
    card.className = "mission-method-card";
    card.hidden = true;
    card.setAttribute("aria-live", "polite");
    return { card };
  }

  /* Construit la liste flottante des propositions de code. */
  function buildCompletionMenu() {
    const menu = document.createElement("div");
    menu.className = "mission-completion-menu";
    menu.hidden = true;
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Propositions de code C++ Arduino");
    return { menu, items: [], activeIndex: 0, fragment: null };
  }

  /* Construit le rappel de commandes situé sous l’éditeur. */
  function buildCommandRail() {
    const rail = document.createElement("nav");
    rail.className = "mission-command-rail";
    rail.setAttribute("aria-label", "Rappel des commandes C++ Arduino");
    rail.innerHTML = `
      <button class="mission-command-scroll" type="button" data-direction="left" aria-label="Faire défiler les commandes vers la gauche">←</button>
      <div class="mission-command-list"></div>
      <button class="mission-command-scroll" type="button" data-direction="right" aria-label="Faire défiler les commandes vers la droite">→</button>`;

    const list = rail.querySelector(".mission-command-list");
    METHODS.forEach(method => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mission-command-chip";
      button.dataset.methodId = method.id;
      button.textContent = method.label;
      button.title = "Survoler pour lire la méthode ; cliquer pour insérer le code.";
      list.appendChild(button);
    });

    rail.querySelectorAll(".mission-command-scroll").forEach(button => {
      button.addEventListener("click", () => {
        const direction = button.dataset.direction === "left" ? -1 : 1;
        list.scrollBy({ left: direction * Math.max(260, list.clientWidth * .72), behavior: "smooth" });
      });
    });

    return { rail, list };
  }

  /* Crée une fenêtre modale unique réutilisée par le cours, l’aide et la documentation. */
  function buildLearningDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "mission-learning-dialog";
    dialog.innerHTML = `
      <div class="mission-learning-head">
        <h2 id="missionLearningTitle">Cours</h2>
        <button class="mission-learning-close" type="button" aria-label="Fermer la fenêtre">×</button>
      </div>
      <div id="missionLearningBody" class="mission-learning-body"></div>`;

    const closeButton = dialog.querySelector(".mission-learning-close");
    closeButton.addEventListener("click", () => closeLearningDialog(dialog));
    dialog.addEventListener("click", event => {
      if (event.target === dialog) closeLearningDialog(dialog);
    });

    return {
      dialog,
      title: dialog.querySelector("#missionLearningTitle"),
      body: dialog.querySelector("#missionLearningBody")
    };
  }

  /* Active le plein écran natif et prévoit une solution de secours. */
  function bindFullscreen(codePanel, panelHead, button) {
    const updateButton = () => {
      const active = document.fullscreenElement === codePanel || codePanel.classList.contains("mission-editor-maximized");
      button.textContent = active ? "Quitter le plein écran" : "Plein écran";
      button.setAttribute("aria-pressed", String(active));
    };

    const toggle = async () => {
      try {
        if (document.fullscreenElement === codePanel) {
          await document.exitFullscreen();
        } else if (codePanel.requestFullscreen) {
          await codePanel.requestFullscreen();
        } else {
          codePanel.classList.toggle("mission-editor-maximized");
        }
      } catch {
        codePanel.classList.toggle("mission-editor-maximized");
      }
      updateButton();
    };

    button.addEventListener("click", toggle);
    panelHead.addEventListener("dblclick", event => {
      if (event.target.closest("button, select, input, a")) return;
      toggle();
    });
    document.addEventListener("fullscreenchange", updateButton);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && codePanel.classList.contains("mission-editor-maximized")) {
        codePanel.classList.remove("mission-editor-maximized");
        updateButton();
      }
    });
  }

  /* Remplace les panneaux de cours en ligne par des fenêtres contextuelles. */
  function bindLearningPopups(root, learningDialog, courseButton) {
    const helpButton = root.querySelector("#missionHelp");
    const docsButton = root.querySelector("#missionDocs");
    const helpPanel = root.querySelector("#missionHelpPanel");
    const docsPanel = root.querySelector("#missionDocsPanel");
    const missionContext = root.querySelector(".mission-context");

    const open = (title, html) => openLearningDialog(learningDialog, title, html);

    courseButton.addEventListener("click", () => {
      const contextHtml = missionContext ? missionContext.outerHTML : "";
      const docsHtml = docsPanel ? docsPanel.innerHTML : "<p>Le rappel de cours n’est pas encore disponible.</p>";
      open("Cours et documentation C++ Arduino", `${contextHtml}${docsHtml}`);
    });

    if (helpButton && helpPanel) {
      helpButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        open("Aide contextuelle", helpPanel.innerHTML);
      }, true);
    }

    if (docsButton && docsPanel) {
      docsButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        open("Documentation C++ Arduino", docsPanel.innerHTML);
      }, true);
    }
  }

  /* Ouvre la fenêtre de cours en conservant une solution compatible avec les anciens navigateurs. */
  function openLearningDialog(refs, title, html) {
    refs.title.textContent = title;
    refs.body.innerHTML = html;
    if (typeof refs.dialog.showModal === "function") refs.dialog.showModal();
    else {
      refs.dialog.setAttribute("open", "");
      refs.dialog.classList.add("fallback-open");
    }
    refs.dialog.querySelector(".mission-learning-close")?.focus();
  }

  /* Ferme proprement la fenêtre de cours. */
  function closeLearningDialog(dialog) {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    dialog.removeAttribute("open");
    dialog.classList.remove("fallback-open");
  }

  /* Lie le ruban défilant à la fiche méthode et à l’insertion dans l’éditeur. */
  function bindMethodCards(commandRail, methodCard, editor) {
    commandRail.list.querySelectorAll(".mission-command-chip").forEach(button => {
      const method = METHODS.find(item => item.id === button.dataset.methodId);
      if (!method) return;
      button.addEventListener("pointerenter", () => showMethod(method, methodCard));
      button.addEventListener("focus", () => showMethod(method, methodCard));
      /* Une fiche pédagogique (guide) s'affiche sans insérer de code ; les autres insèrent. */
      button.addEventListener("click", () => method.guide ? showMethod(method, methodCard) : insertMethod(editor, method));
    });

    editor.addEventListener("click", () => showMethodAtCaret(editor, methodCard));
    editor.addEventListener("keyup", event => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) showMethodAtCaret(editor, methodCard);
    });
  }

  /* Affiche une fiche méthode complète et synthétique (ou une fiche pédagogique « guide »). */
  function showMethod(method, methodCard) {
    /* Fiche pédagogique : listes d'identifiants valides / invalides au lieu des paramètres. */
    if (method.guide) {
      const validList = (method.valid || []).map(name => `<li><code>${escapeHtml(name)}</code></li>`).join("");
      const invalidList = (method.invalid || []).map(([name, reason]) => `<li><code>${escapeHtml(name)}</code> <span>— ${escapeHtml(reason)}</span></li>`).join("");
      methodCard.card.innerHTML = `
        <div class="mission-method-card-head">
          <h3>${escapeHtml(method.label)}</h3>
          <button class="mission-method-close" type="button" aria-label="Fermer la fiche">×</button>
        </div>
        <p>${escapeHtml(method.description)}</p>
        <strong>Valides :</strong>
        <ul class="mission-naming-valid">${validList}</ul>
        <strong>Invalides pour cette activité :</strong>
        <ul class="mission-naming-invalid">${invalidList}</ul>`;
      methodCard.card.hidden = false;
      methodCard.card.querySelector(".mission-method-close")?.addEventListener("click", () => { methodCard.card.hidden = true; });
      return;
    }

    const parameters = method.parameters.length
      ? `<dl>${method.parameters.map(([name, description]) => `<dt><code>${escapeHtml(name)}</code></dt><dd>${escapeHtml(description)}</dd>`).join("")}</dl>`
      : "<p><em>Aucun paramètre requis.</em></p>";

    methodCard.card.innerHTML = `
      <div class="mission-method-card-head">
        <h3>${escapeHtml(method.label)}</h3>
        <button class="mission-method-close" type="button" aria-label="Fermer la fiche méthode">×</button>
      </div>
      <p>${escapeHtml(method.description)}</p>
      <strong>Exemple :</strong>
      <pre><code>${escapeHtml(method.example)}</code></pre>
      <strong>Paramètres :</strong>
      ${parameters}`;
    methodCard.card.hidden = false;
    methodCard.card.querySelector(".mission-method-close")?.addEventListener("click", () => {
      methodCard.card.hidden = true;
    });
  }

  /* Affiche la fiche correspondant au mot situé sous le curseur de saisie. */
  function showMethodAtCaret(editor, methodCard) {
    const position = editor.selectionStart;
    const source = editor.value;
    const left = source.slice(0, position).match(/[A-Za-z_][\w.]*$/)?.[0] || "";
    const right = source.slice(position).match(/^[A-Za-z_][\w.]*/)?.[0] || "";
    const word = `${left}${right}`.toLowerCase();
    if (!word) return;
    const method = METHODS.find(item => item.aliases.some(alias => word.includes(alias.toLowerCase())) || item.label.toLowerCase().includes(word));
    if (method) showMethod(method, methodCard);
  }

  /* Suggestions DÉPENDANT DE L'ÉTAPE ACTIVE : pour un affichage, propose Serial.println(variable); */
  /* avec la variable réellement lue par l'élève pour ce capteur (repli sur un nom canonique). */
  function stepSuggestions(editor) {
    const target = typeof window !== "undefined" ? window.TechnoQuestMissionGuidedTarget : null;
    if (!target || typeof target.getCurrent !== "function") return [];
    const sessionId = Number(document.body?.dataset?.session || 1);
    /* État guidé courant (étape active + variables déjà lues), sans cache. */
    const current = target.getCurrent(editor.value, sessionId) || {};
    const vars = current.result?.context?.vars || {};
    /* Lectures : propose la déclaration complète avec un nom d'identifiant conseillé et distinct. */
    const readByStep = {
      readHumidity: { insert: "int humiditeSol = analogRead(PIN_HUMIDITE_SOL);", description: "Lis la mesure sur A0 et mémorise-la dans une variable distincte." },
      readLight: { insert: "int lumiere = analogRead(PIN_LUMIERE);", description: "Lis la mesure sur A1 et mémorise-la dans une variable distincte." },
      readWater: { insert: "int niveauEau = analogRead(PIN_NIVEAU_EAU);", description: "Lis la mesure sur A2 et mémorise-la dans une variable distincte." }
    };
    if (readByStep[current.stepId]) {
      const r = readByStep[current.stepId];
      return [{ label: r.insert, aliases: ["int", "ana", "analogread", "lire", "capteur"], insert: r.insert, description: r.description }];
    }
    /* Affichages : propose Serial.println(variable) avec la variable réellement lue. */
    const variableByStep = {
      showHumidity: vars.humidity || "humiditeSol",
      showLight: vars.light || "lumiere",
      showWater: vars.water || "niveauEau"
    };
    const variable = variableByStep[current.stepId];
    if (!variable) return [];
    /* Une seule proposition ciblée, présentée comme les autres (description au-dessus, code dessous). */
    return [{
      label: `Serial.println(${variable});`,
      aliases: ["ser", "serial", "print", "println", "ligne", "afficher"],
      insert: `Serial.println(${variable});`,
      description: "Affiche la valeur puis passe à la ligne suivante."
    }];
  }

  /* Active l’autocomplétion uniquement dans le niveau Guidé. */
  function bindCompletion(editor, helpLevel, completion, methodCard) {
    const refresh = event => {
      if (helpLevel.value !== "guided") {
        hideCompletion(completion);
        return;
      }
      if (event && ["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(event.key)) return;
      const fragment = getFragment(editor);
      if (!fragment || fragment.text.length < 1) {
        hideCompletion(completion);
        return;
      }
      const query = fragment.text.toLowerCase();
      /* Suggestions propres à l'étape active (affichages), filtrées par le fragment saisi. */
      const dynamic = stepSuggestions(editor).filter(method => {
        const searchable = [method.label, ...method.aliases].join(" ").toLowerCase();
        return searchable.includes(query);
      });
      const base = METHODS.filter(method => {
        /* Les fiches pédagogiques (guides) n'insèrent pas de code : jamais dans les propositions. */
        if (method.guide) return false;
        const searchable = [method.label, ...method.aliases].join(" ").toLowerCase();
        return searchable.includes(query);
      });
      /* Les propositions ciblées passent en tête ; on déduplique par libellé et on limite à 7. */
      const seenLabels = new Set();
      const matches = [...dynamic, ...base].filter(method => {
        if (seenLabels.has(method.label)) return false;
        seenLabels.add(method.label);
        return true;
      }).slice(0, 7);
      if (!matches.length) {
        hideCompletion(completion);
        return;
      }
      completion.fragment = fragment;
      completion.items = matches;
      completion.activeIndex = 0;
      renderCompletion(editor, completion, methodCard);
    };

    editor.addEventListener("input", refresh);
    editor.addEventListener("keyup", refresh);
    editor.addEventListener("keydown", event => handleCompletionKey(event, editor, completion, methodCard));
    editor.addEventListener("blur", () => window.setTimeout(() => hideCompletion(completion), 140));
    helpLevel.addEventListener("change", () => hideCompletion(completion));
  }

  /* Repère le fragment actuellement saisi avant le curseur. */
  function getFragment(editor) {
    const end = editor.selectionStart;
    const before = editor.value.slice(0, end);
    const match = before.match(/(?:#[A-Za-z_]*|[A-Za-z_][\w.]*)$/);
    if (!match) return null;
    return { text: match[0], start: end - match[0].length, end };
  }

  /* Affiche les suggestions et leur explication courte. */
  function renderCompletion(editor, completion, methodCard) {
    completion.menu.innerHTML = completion.items.map((method, index) => `
      <button class="mission-completion-item ${index === completion.activeIndex ? "active" : ""}" type="button" role="option" aria-selected="${index === completion.activeIndex}">
        <code>${escapeHtml(method.label)}</code>
        <span>${escapeHtml(method.description.slice(0, 72))}${method.description.length > 72 ? "…" : ""}</span>
      </button>`).join("");
    completion.menu.hidden = false;

    completion.menu.querySelectorAll(".mission-completion-item").forEach((button, index) => {
      button.addEventListener("pointerenter", () => {
        completion.activeIndex = index;
        updateCompletionSelection(completion);
        showMethod(completion.items[index], methodCard);
      });
      button.addEventListener("mousedown", event => event.preventDefault());
      button.addEventListener("click", () => {
        insertCompletion(editor, completion, completion.items[index]);
        hideCompletion(completion);
      });
    });
  }

  /* Gère les flèches, Entrée, Tabulation et Échap dans la liste de propositions. */
  function handleCompletionKey(event, editor, completion, methodCard) {
    if (completion.menu.hidden || !completion.items.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      completion.activeIndex = (completion.activeIndex + 1) % completion.items.length;
      updateCompletionSelection(completion);
      showMethod(completion.items[completion.activeIndex], methodCard);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      completion.activeIndex = (completion.activeIndex - 1 + completion.items.length) % completion.items.length;
      updateCompletionSelection(completion);
      showMethod(completion.items[completion.activeIndex], methodCard);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      insertCompletion(editor, completion, completion.items[completion.activeIndex]);
      hideCompletion(completion);
    } else if (event.key === "Escape") {
      event.preventDefault();
      hideCompletion(completion);
    }
  }

  /* Met à jour visuellement la proposition sélectionnée. */
  function updateCompletionSelection(completion) {
    completion.menu.querySelectorAll(".mission-completion-item").forEach((button, index) => {
      const active = index === completion.activeIndex;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      if (active) button.scrollIntoView({ block: "nearest" });
    });
  }

  /* Insère une proposition en remplaçant uniquement le fragment en cours de saisie. */
  function insertCompletion(editor, completion, method) {
    const fragment = completion.fragment || getFragment(editor);
    if (!fragment) return insertMethod(editor, method);
    replaceEditorRange(editor, fragment.start, fragment.end, method);
  }

  /* Insère une commande du ruban à la position actuelle du curseur. */
  function insertMethod(editor, method) {
    replaceEditorRange(editor, editor.selectionStart, editor.selectionEnd, method);
  }

  /* Remplace une plage de texte, repositionne le curseur et déclenche les validateurs existants. */
  function replaceEditorRange(editor, start, end, method) {
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    editor.value = `${before}${method.insert}${after}`;
    let caret = start + method.insert.length;
    if (method.cursor) {
      const cursorIndex = method.insert.indexOf(method.cursor);
      if (cursorIndex >= 0) {
        const selectStart = start + cursorIndex;
        const selectEnd = selectStart + method.cursor.length;
        editor.focus();
        editor.setSelectionRange(selectStart, selectEnd);
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
    }
    editor.focus();
    editor.setSelectionRange(caret, caret);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /* Masque et réinitialise l’autocomplétion. */
  function hideCompletion(completion) {
    completion.menu.hidden = true;
    completion.menu.innerHTML = "";
    completion.items = [];
    completion.fragment = null;
    completion.activeIndex = 0;
  }

  /* Lance l’installation après le chargement du document. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => waitForMission());
  else waitForMission();
})();
