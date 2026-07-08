/* TechnoQuest — articulation schéma / réalité et programmation sans solution donnée. */
"use strict";

(() => {
  const id = Number(document.body.dataset.session || 0);
  if (id < 1 || id > 8) return;

  const data = {
    1: {
      old: "# Lire la grandeur analogique du capteur A0\nhumidite = lire_humidite()\n\n# Afficher la valeur mesurée\nafficher(humidite)\n\n# Maintenir la pompe arrêtée\nstop()",
      guided: "# Complète les deux instructions manquantes\n# La pompe reste arrêtée pendant l’observation\nstop()\n\nhumidite = _____________\n_____________(humidite)",
      standard: "# 1. Lire le capteur A0\n# 2. Afficher la valeur\n# 3. Maintenir la pompe arrêtée\n\nhumidite = __________________\n____________________________\n____________________________",
      expert: "# Contrat : lire A0, afficher la mesure et garantir l’arrêt de la pompe.\n"
    },
    2: {
      old: "# Définir un seuil modifiable\nseuil_humidite = 35\n\n# Lire puis comparer la mesure\nhumidite = lire_humidite()\nif humidite < seuil_humidite:\n    afficher(\"Sol sec\")\nelse:\n    afficher(\"Sol humide\")\nstop()",
      guided: "# Choisis le seuil à partir de tes mesures\nseuil_humidite = ____\nhumidite = lire_humidite()\n\nif humidite < seuil_humidite:\n    afficher(\"Sol sec\")\nelse:\n    afficher(\"Sol humide\")\n\nstop()",
      standard: "# Définis un seuil, lis A0 puis affiche l’état du sol.\nseuil_humidite = ____\n\n# À compléter\n",
      expert: "# Contrat : utiliser les mesures de calibration pour classer le sol sec ou humide.\n"
    },
    3: {
      old: "seuil_humidite = 35\nhumidite = lire_humidite()\n\n# Traiter la donnée et commander la sortie logique\nif humidite < seuil_humidite:\n    arroser(3)\nelse:\n    stop()",
      guided: "seuil_humidite = 35\nhumidite = lire_humidite()\n\nif __________________________:\n    arroser(3)\nelse:\n    __________",
      standard: "# Lire l’humidité puis arroser 3 s uniquement si le sol est sec.\nseuil_humidite = 35\n",
      expert: "# Contrat : commander la pompe 3 s si le sol est sec, sinon garantir l’arrêt.\n"
    },
    4: {
      old: "seuil_humidite = 35\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(3)\nelse:\n    stop()\n\nif reservoir < seuil_reservoir:\n    alerter(\"Réservoir vide\")",
      guided: "seuil_humidite = 35\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif __________________ and __________________:\n    arroser(3)\nelse:\n    stop()\n\nif __________________:\n    alerter(\"Réservoir vide\")",
      standard: "# Lire A0 et A2. Donner la priorité à la sécurité du réservoir.\nseuil_humidite = 35\nseuil_reservoir = 20\n",
      expert: "# Contrat : arroser seulement si le sol est sec ET le niveau suffisant ; sinon arrêter et alerter si nécessaire.\n"
    },
    5: {
      old: "seuil_humidite = 30\nseuil_arret = 42\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(2)\nelif humidite > seuil_arret:\n    stop()\nelse:\n    stop()",
      guided: "seuil_humidite = 30\nseuil_arret = ____\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\n# Complète la décision avec les deux seuils\n",
      standard: "# Programmer une hystérésis et limiter l’arrosage à 2 s.\nseuil_humidite = 30\nseuil_arret = 42\nseuil_reservoir = 20\n",
      expert: "# Contrat : utiliser deux seuils, conserver la sécurité du réservoir et limiter chaque arrosage à 2 s.\n"
    },
    6: {
      old: "seuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir and lumiere < seuil_lumiere:\n    arroser(2)\nelse:\n    stop()",
      guided: "seuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\n\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\n\nif __________________ and __________________ and __________________:\n    arroser(2)\nelse:\n    stop()",
      standard: "# Lire A0, A1 et A2 puis construire une décision multicritère.\nseuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\n",
      expert: "# Contrat : arroser 2 s seulement si les trois critères choisis sont satisfaits.\n"
    },
    7: {
      old: "seuil_humidite = 38\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(2)\nelse:\n    stop()",
      guided: "# Valeur à déterminer après la nouvelle calibration\nseuil_humidite = ____\nseuil_reservoir = 20\n\n# Complète le programme en conservant la sécurité du réservoir\n",
      standard: "# Recalibrer le capteur puis conserver la sécurité du réservoir.\nseuil_humidite = ____\nseuil_reservoir = 20\n",
      expert: "# Contrat : intégrer le nouveau seuil de calibration sans supprimer les sécurités.\n"
    },
    8: {
      old: "seuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\n\nif reservoir < seuil_reservoir:\n    stop()\n    alerter(\"Réservoir vide\")\nelif humidite < seuil_humidite and lumiere < seuil_lumiere:\n    arroser(2)\nelse:\n    stop()\n\nafficher(humidite, reservoir, lumiere)",
      guided: "seuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\n\n# 1. Lire les trois capteurs\n# 2. Traiter d’abord le réservoir vide\n# 3. Décider d’arroser ou non\n# 4. Afficher les mesures\n",
      standard: "# Construire le programme final sécurisé à partir du cahier des charges.\nseuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\n",
      expert: "# Contrat final : sécurité prioritaire, trois capteurs, arrosage court, alerte et affichage.\n"
    }
  }[id];

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
    state.sessions[id] = current;
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  let resetting = false;
  const setStarter = mode => {
    resetting = true;
    current.learningMode = mode;
    current.attemptedV2 = false;
    editor.value = data[mode];
    current.code = editor.value;
    saveState();
    editor.dispatchEvent(new Event("input", {bubbles:true}));
    resetting = false;
  };

  const normalized = editor.value.replace(/\r/g, "").trim();
  const oldNormalized = data.old.replace(/\r/g, "").trim();
  if (!current.learningV2 || normalized === oldNormalized || !normalized) {
    current.learningV2 = true;
    setStarter(current.learningMode);
  } else {
    current.attemptedV2 = true;
    saveState();
  }

  const editorCard = editor.closest(".card-body");
  const editorWrap = editorCard?.querySelector(".editor-wrap");
  if (editorCard && editorWrap && !document.getElementById("codeModeV2")) {
    const modeRow = document.createElement("div");
    modeRow.className = "code-mode-row";
    modeRow.innerHTML = `<label for="codeModeV2"><strong>Niveau d’aide</strong></label><select id="codeModeV2"><option value="guided">Guidé</option><option value="standard">Standard</option><option value="expert">Autonome</option></select><span>Le modèle reste volontairement incomplet.</span>`;
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
        ? "Vue pédagogique active : le jumeau numérique sert à comprendre les fonctions et les flux."
        : "Vue réalité active : identifie le matériel, puis compare-le au schéma fonctionnel.";
    };
    buttons.forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  }
})();
