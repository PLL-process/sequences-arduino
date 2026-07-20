/* TechnoQuest — articulation schéma / réalité et programmation sans solution donnée. */
"use strict";

(() => {
  const id = Number(document.body.dataset.session || 0);
  if (id < 1 || id > 8) return;

  const data = {
    1: {
      version: "2026-07-seance1-cpp",
      old: [
        "# Lire la grandeur analogique du capteur A0\nhumidite = lire_humidite()\n\n# Afficher la valeur mesurée\nafficher(humidite)\n\n# Maintenir la pompe arrêtée\nstop()",
        "# 1 ACQUÉRIR : lire le capteur A0\n# 2 MÉMORISER : ranger la valeur dans la variable humidite\nhumidite = lire_humidite()\n\n# 3 COMMUNIQUER : afficher la valeur mesurée\nafficher(humidite)\n\n# 4 SÉCURISER : maintenir la pompe arrêtée\nstop()",
        "const int RELAIS_POMPE = 6;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(RELAIS_POMPE, OUTPUT);\n}\n\nvoid loop() {\n  // 1 ACQUÉRIR : lire le capteur A0\n  // 2 MÉMORISER : ranger la valeur dans la variable humidite\n  int humidite = analogRead(A0);\n\n  // 3 COMMUNIQUER : afficher la valeur mesurée\n  Serial.println(humidite);\n\n  // 4 SÉCURISER : maintenir la pompe arrêtée\n  digitalWrite(RELAIS_POMPE, LOW);\n}"
      ],
      guided: "const int RELAIS_POMPE = 6;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(RELAIS_POMPE, OUTPUT);\n}\n\nvoid loop() {\n  // 1 ACQUÉRIR : lire le capteur A0\n  // Indice : analogRead(A0) lit explicitement A0.\n  // 2 MÉMORISER : ranger la valeur dans la variable humidite\n  int humidite = _______________;\n\n  // 3 COMMUNIQUER : afficher la valeur mesurée\n  // Indice : utilise Serial.println(...)\n  ____________________________;\n\n  // 4 SÉCURISER : maintenir la pompe arrêtée\n  digitalWrite(RELAIS_POMPE, LOW);\n}",
      standard: "const int RELAIS_POMPE = 6;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(RELAIS_POMPE, OUTPUT);\n}\n\nvoid loop() {\n  // 1 ACQUÉRIR : lire le capteur A0\n  // 2 MÉMORISER : stocker la mesure dans humidite\n  int humidite = __________________;\n\n  // 3 COMMUNIQUER : afficher humidite\n  ________________________________;\n\n  // 4 SÉCURISER : arrêter la pompe\n  ________________________________;\n}",
      expert: "const int RELAIS_POMPE = 6;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(RELAIS_POMPE, OUTPUT);\n}\n\nvoid loop() {\n  // Lire A0, afficher la mesure, garder D6 à LOW.\n}\n"
    }
  }[id];

  /* Séances 2 à 8 : les squelettes sont désormais gérés en C++ Arduino par
     session-code-v3.js (alignés sur le mode Mission). Ce module conserve la
     ligne « Niveau d'aide », la bascule schéma/réel et la garde de correction. */
  const editor = document.getElementById("codeEditor");
  const stage = document.getElementById("twinStage");
  const correctionButton = document.getElementById("showCorrection");
  if (!editor || !stage || !correctionButton) return;

  const storageKey = "technoquest-premium-v1";
  let state = {};
  try { state = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (error) { state = {}; }
  state.sessions = state.sessions || {};
  state.sessions[id] = state.sessions[id] || {};
  const current = state.sessions[id];
  current.learningMode = current.learningMode || "guided";
  current.attemptedV2 = Boolean(current.attemptedV2);

  const saveState = () => {
    /* Écriture non destructive : relecture au moment d'écrire pour ne pas écraser
       les données ajoutées par d'autres modules depuis le chargement de la page. */
    let fresh = {};
    try { fresh = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (error) { fresh = {}; }
    fresh.sessions = fresh.sessions || {};
    fresh.sessions[id] = Object.assign({}, fresh.sessions[id], current);
    state.sessions = fresh.sessions;
    localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  let resetting = false;
  const setStarter = mode => {
    if (!data) return; /* squelettes délégués à session-code-v3.js */
    resetting = true;
    current.learningMode = mode;
    current.attemptedV2 = false;
    if (data.version) current.learningV2Version = data.version;
    editor.value = data[mode];
    current.code = editor.value;
    saveState();
    editor.dispatchEvent(new Event("input", {bubbles:true}));
    resetting = false;
  };

  if (data) {
    const normalized = editor.value.replace(/\r/g, "").trim();
    const oldNormalized = (Array.isArray(data.old) ? data.old : [data.old]).map(value => value.replace(/\r/g, "").trim());
    const versionChanged = data.version && current.learningV2Version !== data.version;
    if (!current.learningV2 || oldNormalized.includes(normalized) || !normalized || (versionChanged && !current.attemptedV2)) {
      current.learningV2 = true;
      if (data.version) current.learningV2Version = data.version;
      setStarter(current.learningMode);
    } else {
      if (data.version) current.learningV2Version = data.version;
      current.attemptedV2 = true;
      saveState();
    }
  }

  const editorCard = editor.closest(".card-body");
  const editorWrap = editorCard?.querySelector(".editor-wrap");
  if (editorCard && editorWrap && !document.getElementById("codeModeV2")) {
    const modeRow = document.createElement("div");
    modeRow.className = "code-mode-row";
    modeRow.innerHTML = `<label for="codeModeV2"><strong>Niveau d’aide</strong></label><select id="codeModeV2"><option value="guided">Guidé</option><option value="standard">Standard</option><option value="expert">Autonome</option></select><span>Les ____ sont des zones à effacer puis remplacer.</span>`;
    editorCard.insertBefore(modeRow, editorWrap);
    const select = modeRow.querySelector("select");
    select.value = current.learningMode;
    select.addEventListener("change", () => {
      if (current.attemptedV2 && !window.confirm("Changer de niveau d’aide remplacera la tentative actuelle par un nouveau modèle incomplet. Continuer ?")) {
        select.value = current.learningMode;
        return;
      }
      setStarter(select.value);
    });

    const note = document.createElement("p");
    note.className = "attempt-note";
    note.textContent = "La solution complète n’apparaît qu’après une première tentative et l’ouverture volontaire de la correction formative.";
    editorWrap.insertAdjacentElement("afterend", note);
  }

  const restore = document.getElementById("restoreCode");
  restore?.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (current.attemptedV2 && !window.confirm("Restaurer le modèle incomplet et effacer la tentative actuelle ?")) return;
    const select = document.getElementById("codeModeV2");
    setStarter(select?.value || current.learningMode || "guided");
  }, true);

  const markAttempt = () => {
    if (resetting) return;
    current.attemptedV2 = true;
    current.code = editor.value;
    saveState();
  };
  editor.addEventListener("input", markAttempt);
  document.getElementById("answer")?.addEventListener("input", markAttempt);
  document.querySelectorAll("[data-test]").forEach(input => input.addEventListener("change", markAttempt));
  document.getElementById("saveSession")?.addEventListener("click", markAttempt);

  correctionButton.addEventListener("click", event => {
    if (current.correction) return;
    if (!current.attemptedV2) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.alert("Commence par modifier le programme, effectuer un test ou rédiger une réponse avant d’ouvrir la correction.");
    }
  }, true);

  const cardBody = stage.closest(".card-body");
  if (cardBody && !document.getElementById("representationToggle")) {
    const legend = stage.nextElementSibling?.classList.contains("twin-legend") ? stage.nextElementSibling : null;
    const controls = cardBody.querySelector(".demo-controls");
    const status = document.getElementById("demoStatus");

    const toggle = document.createElement("div");
    toggle.id = "representationToggle";
    toggle.className = "view-toggle";
    toggle.innerHTML = `<button type="button" class="btn active" data-view="twin" aria-pressed="true">Schéma / Jumeau numérique</button><button type="button" class="btn" data-view="real" aria-pressed="false">Voir le montage réel</button>`;
    cardBody.insertBefore(toggle, stage);

    const twinView = document.createElement("div");
    twinView.id = "twinViewV2";
    twinView.className = "view-panel";
    cardBody.insertBefore(twinView, stage);
    twinView.appendChild(stage);

    const componentNav = document.createElement("div");
    componentNav.className = "component-nav";
    componentNav.innerHTML = `
      <button type="button" data-info="Capteur A0 : mesure analogique de l’humidité du sol.">Capteur A0</button>
      <button type="button" data-info="Arduino : acquiert, traite, décide et commande la sortie D6.">Arduino</button>
      <button type="button" data-info="Capteur A2 : surveille le niveau du réservoir et protège la pompe.">Réservoir A2</button>
      <button type="button" data-info="Relais D6 : distribue l’énergie de l’alimentation séparée vers la pompe.">Relais D6</button>
      <button type="button" data-info="Pompe : actionneur qui transforme l’énergie électrique en circulation d’eau.">Pompe</button>
      <button type="button" data-info="Alimentation séparée TBT : elle fournit l’énergie de puissance sans solliciter la broche Arduino.">Alimentation</button>`;
    twinView.appendChild(componentNav);
    const info = document.createElement("p");
    info.className = "component-info";
    info.textContent = "Sélectionne un constituant pour connaître son rôle.";
    twinView.appendChild(info);
    componentNav.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      componentNav.querySelectorAll("button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      info.textContent = button.dataset.info;
    }));

    if (legend) twinView.appendChild(legend);
    if (controls) twinView.appendChild(controls);

    const realView = document.createElement("figure");
    realView.id = "realViewV2";
    realView.className = "real-view hidden";
    const imagePath = `images/seance-${String(id).padStart(2, "0")}-reelle.png?v=2`;
    realView.innerHTML = `<img src="${imagePath}" alt="Montage réel ou rendu réaliste de la séance ${id}" loading="lazy"><figcaption>Repère les composants réels, puis reviens au schéma pour comprendre les fonctions et les flux.</figcaption>`;
    twinView.insertAdjacentElement("afterend", realView);

    const buttons = [...toggle.querySelectorAll("button")];
    const setView = view => {
      const twin = view === "twin";
      twinView.classList.toggle("hidden", !twin);
      realView.classList.toggle("hidden", twin);
      buttons.forEach(button => {
        const active = button.dataset.view === view;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (status) status.textContent = twin
        ? "Vue pédagogique active : clique sur « Lancer la démonstration » pour simuler l’objet technique et observer les flux."
        : "Vue réalité active : identifie le matériel, puis compare-le au schéma fonctionnel.";
    };
    buttons.forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  }
})();
