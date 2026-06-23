/* Améliorations pédagogiques et visuelles du jumeau numérique. */
"use strict";

(() => {
  /* Récupère les éléments indispensables de la simulation. */
  const garden = document.querySelector(".garden");
  const simulationPanel = document.querySelector(".simulation-panel");
  const missionTitle = document.getElementById("missionTitle");
  const codeEditor = document.getElementById("code");
  const pump = document.getElementById("pump");
  const pumpBadge = document.getElementById("pumpBadge");
  const humidity = document.getElementById("humidity");
  const reservoir = document.getElementById("reservoir");
  const light = document.getElementById("light");
  const humidityThreshold = document.getElementById("humidityThreshold");
  const reservoirThreshold = document.getElementById("reservoirThreshold");
  const lightThreshold = document.getElementById("lightThreshold");
  const consoleZone = document.getElementById("console");

  /* Quitte proprement si la page ne contient pas le jumeau numérique. */
  if (!garden || !simulationPanel || !pump || !pumpBadge) return;

  /* Ajoute les styles nécessaires sans modifier la feuille principale. */
  const style = document.createElement("style");
  style.textContent = `
    .pump-learning-box {
      margin: 1rem 0;
      padding: 1rem;
      border: 1px solid var(--border);
      border-left: 5px solid var(--yellow);
      border-radius: 14px;
      background: #061813b8;
    }
    .pump-learning-box.ready { border-left-color: var(--green); }
    .pump-learning-box.blocked { border-left-color: var(--red); }
    .pump-learning-box h3 { margin: 0 0 .45rem; }
    .pump-learning-box p { margin: .35rem 0; color: var(--muted); line-height: 1.5; }
    .pump-learning-actions { display: flex; flex-wrap: wrap; gap: .65rem; margin-top: .8rem; }
    .pump-learning-actions button { flex: 1 1 240px; }
    .pump-condition-list { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .7rem; }
    .pump-condition {
      padding: .38rem .62rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--soft);
      font-size: .82rem;
    }
    .pump-condition.ok { border-color: var(--green); color: #d8ffe7; }
    .pump-condition.no { border-color: var(--red); color: #ffd9d4; }
    .water-jet {
      position: absolute;
      right: 135px;
      bottom: 82px;
      z-index: 4;
      width: 285px;
      height: 14px;
      opacity: 0;
      pointer-events: none;
      transform: rotate(8deg);
      transform-origin: right center;
      border-radius: 999px;
      background: repeating-linear-gradient(90deg, #bdefff 0 16px, #3eb5e8 16px 31px);
      box-shadow: 0 0 14px #6fd3ff;
    }
    .water-jet.active {
      opacity: .95;
      animation: waterFlow .32s linear infinite;
    }
    .water-splash {
      position: absolute;
      left: 26%;
      bottom: 72px;
      z-index: 5;
      width: 78px;
      height: 36px;
      opacity: 0;
      pointer-events: none;
    }
    .water-splash::before,
    .water-splash::after {
      content: "";
      position: absolute;
      width: 16px;
      height: 24px;
      border-radius: 50% 50% 55% 55%;
      background: #6fd3ff;
      box-shadow: 25px -9px 0 #3eb5e8, 50px 3px 0 #bdefff;
    }
    .water-splash.active {
      opacity: 1;
      animation: splashPulse .55s ease-in-out infinite alternate;
    }
    .soil.watering { box-shadow: inset 0 0 0 4px #6fd3ff55, 0 0 25px #3eb5e844; }
    .pump-countdown { color: var(--yellow); font-weight: bold; }
    @keyframes waterFlow {
      from { background-position: 0 0; }
      to { background-position: -31px 0; }
    }
    @keyframes splashPulse {
      from { transform: translateY(2px) scale(.9); }
      to { transform: translateY(-6px) scale(1.08); }
    }
    @media (max-width: 620px) {
      .water-jet { right: 105px; width: 205px; bottom: 82px; }
      .water-splash { left: 20%; }
    }
    @media (prefers-reduced-motion: reduce) {
      .water-jet.active, .water-splash.active { animation: none; }
    }
  `;
  document.head.appendChild(style);

  /* Ajoute le jet d'eau et les éclaboussures dans le jardin. */
  const waterJet = document.createElement("div");
  waterJet.className = "water-jet";
  waterJet.setAttribute("aria-hidden", "true");
  const waterSplash = document.createElement("div");
  waterSplash.className = "water-splash";
  waterSplash.setAttribute("aria-hidden", "true");
  garden.append(waterJet, waterSplash);

  /* Ajoute un panneau expliquant clairement le comportement de la pompe. */
  const learningBox = document.createElement("section");
  learningBox.className = "pump-learning-box";
  learningBox.setAttribute("aria-labelledby", "pumpLearningTitle");
  learningBox.innerHTML = `
    <h3 id="pumpLearningTitle">Pourquoi la pompe est-elle arrêtée ?</h3>
    <p id="pumpLearningMessage" aria-live="polite"></p>
    <div id="pumpConditions" class="pump-condition-list" aria-label="État des conditions d'arrosage"></div>
    <div class="pump-learning-actions">
      <button id="testAutomaticWatering" type="button" class="primary">💧 Tester l’arrosage automatique</button>
    </div>`;

  /* Place le panneau juste après les capteurs. */
  const sensors = simulationPanel.querySelector(".sensors");
  sensors.insertAdjacentElement("afterend", learningBox);

  const learningMessage = document.getElementById("pumpLearningMessage");
  const conditionsZone = document.getElementById("pumpConditions");
  const testButton = document.getElementById("testAutomaticWatering");
  const soil = document.getElementById("soil");

  /* Mémorise le temporisateur de l'animation courante. */
  let stopTimer = null;
  let countdownTimer = null;
  let remaining = 0;
  let visualCycleRunning = false;

  /* Retourne le numéro de la mission actuellement affichée. */
  function currentMissionNumber() {
    const match = (missionTitle?.textContent || "").match(/Mission\s+(\d+)/i);
    return match ? Number(match[1]) : 1;
  }

  /* Retourne la durée d'arrosage écrite dans le programme. */
  function programmedDuration() {
    const match = (codeEditor?.value || "").match(/arroser\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
    return match ? Math.max(.5, Math.min(10, Number(match[1]))) : 3;
  }

  /* Lit les capteurs et les seuils affichés. */
  function readConditions() {
    const h = Number(humidity?.value || 0);
    const r = Number(reservoir?.value || 0);
    const l = Number(light?.value || 0);
    const sh = Number(humidityThreshold?.value || 35);
    const sr = Number(reservoirThreshold?.value || 20);
    const sl = Number(lightThreshold?.value || 70);
    return {
      h, r, l, sh, sr, sl,
      soilDry: h < sh,
      reservoirReady: r >= sr,
      lightReady: l < sl
    };
  }

  /* Affiche les trois conditions sous forme de pastilles lisibles. */
  function renderConditions() {
    const c = readConditions();
    conditionsZone.innerHTML = `
      <span class="pump-condition ${c.soilDry ? "ok" : "no"}">${c.soilDry ? "✓" : "✗"} Sol sec : ${c.h} % &lt; ${c.sh} %</span>
      <span class="pump-condition ${c.reservoirReady ? "ok" : "no"}">${c.reservoirReady ? "✓" : "✗"} Réservoir : ${c.r} % ≥ ${c.sr} %</span>
      <span class="pump-condition ${c.lightReady ? "ok" : "no"}">${c.lightReady ? "✓" : "✗"} Lumière : ${c.l} % &lt; ${c.sl} %</span>`;
    return c;
  }

  /* Explique le comportement attendu selon la mission et le programme. */
  function updateExplanation() {
    const mission = currentMissionNumber();
    const code = codeEditor?.value || "";
    const containsWatering = /arroser\s*\(/i.test(code);
    const c = renderConditions();

    learningBox.classList.remove("ready", "blocked");

    if (mission === 1) {
      learningBox.classList.add("blocked");
      learningMessage.innerHTML = "<strong>Arrêt volontaire :</strong> la mission 1 sert uniquement à observer le signal analogique. Son programme contient <code>stop()</code> et aucun ordre <code>arroser()</code>.";
      return;
    }

    if (mission === 2) {
      learningBox.classList.add("blocked");
      learningMessage.innerHTML = "<strong>Calibration en cours :</strong> la mission 2 classe le sol comme sec ou humide, mais elle ne commande pas encore la pompe.";
      return;
    }

    if (!containsWatering) {
      learningBox.classList.add("blocked");
      learningMessage.innerHTML = "Le programme actuel ne contient pas encore d’ordre <code>arroser(durée)</code>. Complète-le ou utilise le bouton de test indépendant.";
      return;
    }

    if (c.soilDry && c.reservoirReady && c.lightReady) {
      learningBox.classList.add("ready");
      learningMessage.innerHTML = "<strong>Conditions réunies :</strong> le bouton <strong>Exécuter</strong> peut activer la pompe pendant la durée indiquée dans <code>arroser(...)</code>.";
    } else {
      learningBox.classList.add("blocked");
      learningMessage.innerHTML = "<strong>Arrosage bloqué :</strong> au moins une condition de sécurité ou de besoin n’est pas satisfaite. Consulte les pastilles ci-dessous.";
    }
  }

  /* Arrête visuellement la pompe et le circuit d'eau. */
  function stopVisualCycle(reason = "Cycle terminé") {
    visualCycleRunning = false;
    clearTimeout(stopTimer);
    clearInterval(countdownTimer);
    pump.classList.remove("on");
    pump.textContent = "POMPE";
    pumpBadge.textContent = "Pompe arrêtée";
    waterJet.classList.remove("active");
    waterSplash.classList.remove("active");
    soil?.classList.remove("watering");
    learningMessage.innerHTML = `<strong>${reason} :</strong> la pompe a été arrêtée automatiquement. Modifie les valeurs ou exécute un nouvel essai.`;
    updateExplanationDelayed();
  }

  /* Lance la pompe, l'eau et un compte à rebours réel. */
  function startVisualCycle(duration, source = "programme") {
    clearTimeout(stopTimer);
    clearInterval(countdownTimer);
    visualCycleRunning = true;
    remaining = Math.ceil(duration);
    pump.classList.add("on");
    pump.textContent = "POMPE ON";
    pumpBadge.textContent = "Pompe active";
    waterJet.classList.add("active");
    waterSplash.classList.add("active");
    soil?.classList.add("watering");
    learningBox.classList.remove("blocked");
    learningBox.classList.add("ready");
    learningMessage.innerHTML = `<strong>Arrosage en cours (${source}) :</strong> arrêt automatique dans <span class="pump-countdown">${remaining} s</span>.`;

    countdownTimer = setInterval(() => {
      remaining -= 1;
      const countdown = learningMessage.querySelector(".pump-countdown");
      if (countdown && remaining >= 0) countdown.textContent = `${remaining} s`;
    }, 1000);

    stopTimer = setTimeout(() => stopVisualCycle("Cycle d’arrosage terminé"), duration * 1000);
  }

  /* Actualise l'explication après la fin de l'animation. */
  function updateExplanationDelayed() {
    setTimeout(() => {
      if (!visualCycleRunning) updateExplanation();
    }, 1400);
  }

  /* Réalise un test automatique indépendant de la mission active. */
  function testAutomaticWatering() {
    const c = renderConditions();
    const blockers = [];
    if (!c.soilDry) blockers.push(`le sol n’est pas assez sec (${c.h} %)`);
    if (!c.reservoirReady) blockers.push(`le réservoir est insuffisant (${c.r} %)`);
    if (!c.lightReady) blockers.push(`la luminosité dépasse le seuil (${c.l} %)`);

    if (blockers.length) {
      stopVisualCycle("Test refusé");
      learningBox.classList.add("blocked");
      learningMessage.innerHTML = `<strong>La pompe reste arrêtée :</strong> ${blockers.join(" ; ")}.`;
      if (consoleZone) consoleZone.textContent = `Test automatique : pompe arrêtée.\nMotif : ${blockers.join(" ; ")}.`;
      return;
    }

    startVisualCycle(3, "test indépendant");
    if (consoleZone) consoleZone.textContent = "Test automatique : toutes les conditions sont satisfaites.\nLa pompe fonctionne pendant 3 secondes puis s’arrête automatiquement.";
  }

  /* Réagit à l'activation de la pompe par le programme principal. */
  const pumpObserver = new MutationObserver(() => {
    if (pump.classList.contains("on") && !visualCycleRunning) {
      startVisualCycle(programmedDuration(), "programme élève");
    }
  });
  pumpObserver.observe(pump, { attributes: true, attributeFilter: ["class"] });

  /* Actualise l'explication lorsqu'une autre mission est chargée. */
  if (missionTitle) {
    const titleObserver = new MutationObserver(() => {
      if (!visualCycleRunning) updateExplanation();
    });
    titleObserver.observe(missionTitle, { childList: true, characterData: true, subtree: true });
  }

  /* Actualise les conditions pendant les réglages de l'élève. */
  [humidity, reservoir, light, humidityThreshold, reservoirThreshold, lightThreshold, codeEditor]
    .filter(Boolean)
    .forEach(control => control.addEventListener("input", () => {
      if (!visualCycleRunning) updateExplanation();
    }));

  /* Associe le bouton de test autonome. */
  testButton.addEventListener("click", testAutomaticWatering);

  /* Initialise le panneau pédagogique. */
  updateExplanation();
})();
