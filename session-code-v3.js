/* TechnoQuest — modèles incomplets, aide progressive et exécution pédagogique. */
"use strict";
(() => {
  const id = Number(document.body.dataset.session || 0);
  if (id < 1 || id > 8) return;
  const editor = document.getElementById("codeEditor");
  const stage = document.getElementById("twinStage");
  if (!editor || !stage) return;

  const VERSION = "2026-07-cpp-arduino-v4";
  const models = {
    1: {
      guided: `const int RELAIS_POMPE = 6;

void setup() {
  Serial.begin(9600);
  pinMode(RELAIS_POMPE, OUTPUT);
}

void loop() {
  // 1 ACQUÉRIR : lire le capteur d’humidité branché sur A0
  // Indice : analogRead(A0) lit explicitement l’entrée analogique A0.
  // 2 MÉMORISER : ranger la valeur dans la variable humidite
  int humidite = _______________;

  // 3 COMMUNIQUER : afficher la valeur mesurée
  // Indice : affiche la variable avec Serial.println(...)
  ____________________________;

  // 4 SÉCURISER : maintenir la pompe arrêtée pendant l’observation
  digitalWrite(RELAIS_POMPE, LOW);
}`,
      standard: `const int RELAIS_POMPE = 6;

void setup() {
  Serial.begin(9600);
  pinMode(RELAIS_POMPE, OUTPUT);
}

void loop() {
  // Lire A0 puis mémoriser la mesure dans humidite.
  int humidite = __________________;

  // Afficher la valeur mémorisée.
  ________________________________;

  // Maintenir la pompe arrêtée pendant l’observation.
  digitalWrite(RELAIS_POMPE, LOW);
}`,
      expert: `const int RELAIS_POMPE = 6;

void setup() {
  Serial.begin(9600);
  pinMode(RELAIS_POMPE, OUTPUT);
}

void loop() {
  // Mission : lire A0, afficher la mesure et garder D6 à LOW.
}`,
      reference: `const int RELAIS_POMPE = 6;

void setup() {
  Serial.begin(9600);
  pinMode(RELAIS_POMPE, OUTPUT);
}

void loop() {
  // 1 ACQUÉRIR : lire le capteur A0
  // 2 MÉMORISER : ranger la valeur dans la variable humidite
  int humidite = analogRead(A0);

  // 3 COMMUNIQUER : afficher la valeur mesurée
  Serial.println(humidite);

  // 4 SÉCURISER : maintenir la pompe arrêtée
  digitalWrite(RELAIS_POMPE, LOW);
}`
    },
    2: {
      guided: `# Déterminer un seuil à partir des mesures en sol sec et humide.
seuil_humidite = 35

# Lire le capteur d’humidité branché sur A0.

# Comparer la mesure au seuil et afficher « Sol sec » ou « Sol humide ».

# Maintenir la pompe arrêtée pendant la calibration.
`,
      standard: `# Définir le seuil retenu, lire A0, comparer puis afficher l’état du sol.
seuil_humidite = 35
`,
      expert: `# Mission : classer le sol à partir de A0 et du seuil issu de la calibration.
`,
      reference: `seuil_humidite = 35
humidite = lire_humidite(A0)
if humidite < seuil_humidite:
    afficher("Sol sec")
else:
    afficher("Sol humide")
stop()`
    },
    3: {
      guided: `seuil_humidite = 35

# Lire l’humidité sur A0 et la mémoriser.

# Si le sol est sec, arroser pendant 3 secondes.
# Sinon, arrêter explicitement la pompe.
`,
      standard: `# Lire A0 puis commander la pompe 3 s uniquement si le sol est sec.
seuil_humidite = 35
`,
      expert: `# Mission : commander la pompe 3 s si le sol est sec, sinon garantir l’arrêt.
`,
      reference: `seuil_humidite = 35
humidite = lire_humidite(A0)
if humidite < seuil_humidite:
    arroser(3)
else:
    stop()`
    },
    4: {
      guided: `seuil_humidite = 35
seuil_reservoir = 20

# Lire l’humidité sur A0 et le niveau du réservoir sur A2.

# Arroser seulement si le sol est sec ET si le niveau est suffisant.

# Sinon arrêter. Si le réservoir est trop bas, afficher une alerte.
`,
      standard: `# Lire A0 et A2. Donner la priorité à la sécurité du réservoir.
seuil_humidite = 35
seuil_reservoir = 20
`,
      expert: `# Mission : sol sec ET niveau suffisant ; sinon arrêt et alerte si nécessaire.
`,
      reference: `seuil_humidite = 35
seuil_reservoir = 20
humidite = lire_humidite(A0)
reservoir = lire_reservoir(A2)
if humidite < seuil_humidite and reservoir >= seuil_reservoir:
    arroser(3)
else:
    stop()
if reservoir < seuil_reservoir:
    alerter("Réservoir vide")`
    },
    5: {
      guided: `seuil_humidite = 30
seuil_arret = 42
seuil_reservoir = 20

# Lire l’humidité sur A0 et le niveau sur A2.

# Utiliser les deux seuils pour éviter les démarrages répétés.

# Limiter chaque arrosage à 2 secondes et conserver l’arrêt sûr.
`,
      standard: `# Programmer une hystérésis, lire A0 et A2 et limiter l’arrosage à 2 s.
seuil_humidite = 30
seuil_arret = 42
seuil_reservoir = 20
`,
      expert: `# Mission : hystérésis, sécurité du réservoir et arrosage limité à 2 s.
`,
      reference: `seuil_humidite = 30
seuil_arret = 42
seuil_reservoir = 20
humidite = lire_humidite(A0)
reservoir = lire_reservoir(A2)
if humidite < seuil_humidite and reservoir >= seuil_reservoir:
    arroser(2)
elif humidite > seuil_arret:
    stop()
else:
    stop()`
    },
    6: {
      guided: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70

# Lire l’humidité sur A0, la lumière sur A1 et le niveau sur A2.

# Construire une décision qui relie les trois comparaisons.

# Arroser 2 secondes ou maintenir la pompe arrêtée.
`,
      standard: `# Lire A0, A1 et A2 puis construire une décision multicritère.
seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70
`,
      expert: `# Mission : décider avec A0, A1 et A2 tout en conservant l’état sûr.
`,
      reference: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70
humidite = lire_humidite(A0)
lumiere = lire_lumiere(A1)
reservoir = lire_reservoir(A2)
if humidite < seuil_humidite and reservoir >= seuil_reservoir and lumiere < seuil_lumiere:
    arroser(2)
else:
    stop()`
    },
    7: {
      guided: `# Inscrire le seuil obtenu après la nouvelle calibration.
seuil_humidite = 38
seuil_reservoir = 20

# Lire le nouveau capteur sur A0 et le niveau sur A2.

# Conserver la sécurité du réservoir et l’arrêt explicite.
`,
      standard: `# Recalibrer A0 puis conserver la sécurité fournie par A2.
seuil_humidite = 38
seuil_reservoir = 20
`,
      expert: `# Mission : intégrer le nouveau seuil sans supprimer les sécurités.
`,
      reference: `seuil_humidite = 38
seuil_reservoir = 20
humidite = lire_humidite(A0)
reservoir = lire_reservoir(A2)
if humidite < seuil_humidite and reservoir >= seuil_reservoir:
    arroser(2)
else:
    stop()`
    },
    8: {
      guided: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70

# 1. Lire A0, A1 et A2.

# 2. Traiter d’abord le cas du réservoir vide.

# 3. Décider d’arroser brièvement ou d’arrêter.

# 4. Afficher les trois mesures et produire une alerte si nécessaire.
`,
      standard: `# Construire le programme final sécurisé à partir du cahier des charges.
seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70
`,
      expert: `# Mission finale : sécurité prioritaire, trois capteurs, arrosage court, alerte et affichage.
`,
      reference: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70
humidite = lire_humidite(A0)
lumiere = lire_lumiere(A1)
reservoir = lire_reservoir(A2)
if reservoir < seuil_reservoir:
    stop()
    alerter("Réservoir vide")
elif humidite < seuil_humidite and lumiere < seuil_lumiere:
    arroser(2)
else:
    stop()
afficher(humidite, reservoir, lumiere)`
    }
  };
  const model = models[id];

  const storageKey = "technoquest-premium-v1";
  const readState = () => { try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; } };
  const writeSession = patch => {
    const state = readState();
    state.sessions = state.sessions || {};
    state.sessions[id] = { ...(state.sessions[id] || {}), ...patch };
    localStorage.setItem(storageKey, JSON.stringify(state));
    return state.sessions[id];
  };
  let current = readState().sessions?.[id] || {};
  const mode = () => document.getElementById("codeModeV2")?.value || current.learningMode || "guided";

  const setStarter = selectedMode => {
    editor.value = model[selectedMode];
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    current = writeSession({
      code: editor.value,
      learningMode: selectedMode,
      learningV2: true,
      learningV2Version: VERSION,
      attemptedV2: false
    });
  };

  const shouldRefresh = current.learningV2Version !== VERSION && !current.attemptedV2;
  const legacySession1 = id === 1 && /\b(?:lire_humidite|afficher|stop)\s*\(/.test(editor.value);
  if (!editor.value.trim() || legacySession1 || shouldRefresh || (/_{3,}/.test(editor.value) && !current.attemptedV2)) setStarter(mode());
  else current = writeSession({ learningV2Version: VERSION });

  const correctionPre = document.querySelector("#correctionPanel pre");
  if (correctionPre) correctionPre.textContent = model.reference;

  const select = document.getElementById("codeModeV2");
  select?.addEventListener("change", event => {
    event.stopImmediatePropagation();
    const selected = event.target.value;
    current = readState().sessions?.[id] || current;
    if (current.attemptedV2 && !window.confirm("Changer de niveau d’aide remplacera la tentative actuelle. Continuer ?")) {
      event.target.value = current.learningMode || "guided";
      return;
    }
    setStarter(selected);
  }, true);

  document.getElementById("restoreCode")?.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    current = readState().sessions?.[id] || current;
    if (current.attemptedV2 && !window.confirm("Restaurer le modèle incomplet et effacer la tentative actuelle ?")) return;
    setStarter(mode());
  }, true);

  const markAttempt = () => { current = writeSession({ code: editor.value, attemptedV2: true, learningV2Version: VERSION }); };

  const helpBySession = {
    1: `<p class="help-intro"><strong>But :</strong> écrire un premier programme Arduino C++ qui lit A0, affiche la mesure et garde la pompe arrêtée.</p>
      <div class="help-steps">
        <article style="--help:#facc15"><span>0</span><h4>SQUELETTE</h4><p><code>const int RELAIS_POMPE = 6;</code> nomme la broche D6. <code>setup()</code> se lance une fois ; <code>loop()</code> se répète.</p></article>
        <article style="--help:#60a5fa"><span>1</span><h4>ACQUÉRIR</h4><p><code>analogRead(A0)</code> lit explicitement le capteur d’humidité branché sur l’entrée analogique A0.</p></article>
        <article style="--help:#c084fc"><span>2</span><h4>MÉMORISER</h4><p>La ligne doit créer une variable entière : <code>int humidite = ...;</code>. Le point-virgule termine l’instruction.</p></article>
        <article style="--help:#67e8f9"><span>3</span><h4>COMMUNIQUER</h4><p><code>Serial.println(humidite);</code> envoie la valeur vers le moniteur série de la simulation.</p></article>
        <article style="--help:#fb7185"><span>4</span><h4>SÉCURISER</h4><p><code>digitalWrite(RELAIS_POMPE, LOW);</code> impose l’état sûr : D6 reste à 0 et la pompe reste arrêtée.</p></article>
      </div>
      <h4>Exemple de transfert sur une autre entrée — ne pas recopier tel quel</h4>
      <pre>int luminosite = analogRead(A1);\nSerial.println(luminosite);\ndigitalWrite(RELAIS_POMPE, LOW);</pre>
      <p><strong>À toi d’adapter :</strong> l’éditeur demande l’humidité branchée sur <strong>A0</strong>. Les blancs comme <code>____</code> ne sont pas du code : efface-les, puis remplace-les par les instructions C++.</p>
      <details><summary>Repères Arduino C++</summary><ul><li><code>Serial.begin(9600);</code> prépare l’affichage série.</li><li><code>pinMode(RELAIS_POMPE, OUTPUT);</code> déclare D6 comme sortie.</li><li><code>analogRead(A0);</code> lit une entrée analogique.</li><li><code>Serial.println(variable);</code> affiche une variable.</li><li><code>digitalWrite(RELAIS_POMPE, LOW);</code> coupe le relais.</li></ul></details>`,
    2: `<p>Lis l’humidité sur <code>A0</code>, compare-la au seuil choisi à partir des mesures, affiche l’état du sol et conserve la pompe arrêtée pendant la calibration.</p>`,
    3: `<p>Compare la mesure de <code>A0</code> au seuil. <code>arroser(3)</code> commande trois secondes d’arrosage ; <code>stop()</code> garantit l’arrêt dans l’autre cas.</p>`,
    4: `<p>Lis l’humidité sur <code>A0</code> et le niveau sur <code>A2</code>. L’opérateur <code>and</code> exige que les deux conditions soient vraies.</p>`,
    5: `<p>L’hystérésis emploie un seuil de démarrage et un seuil d’arrêt. Conserve <code>A0</code>, la sécurité de <code>A2</code> et un arrosage court.</p>`,
    6: `<p><code>A0</code> mesure l’humidité, <code>A1</code> la lumière et <code>A2</code> le niveau. Relie les trois comparaisons.</p>`,
    7: `<p>Utilise le seuil issu de la nouvelle calibration, la lecture explicite de <code>A0</code> et la sécurité du niveau sur <code>A2</code>.</p>`,
    8: `<p>Traite d’abord le réservoir vide, lis les trois capteurs, limite l’arrosage, conserve un arrêt explicite et affiche les mesures.</p>`
  };

  const stripComments = code => code.split("\n").map(line => line.replace(/\/\/.*$/, "").replace(/#.*$/, "")).join("\n");
  const checkProgram = code => {
    const source = stripComments(code);
    const errors = [];
    const cppHumidity = source.match(/\bint\s+([A-Za-z_]\w*)\s*=\s*analogRead\s*\(\s*A0\s*\)\s*;/);
    const humidity = source.match(/([A-Za-z_]\w*)\s*=\s*lire_humidite\s*\(\s*A0\s*\)/);
    const light = source.match(/([A-Za-z_]\w*)\s*=\s*lire_lumiere\s*\(\s*A1\s*\)/);
    const reservoir = source.match(/([A-Za-z_]\w*)\s*=\s*lire_reservoir\s*\(\s*A2\s*\)/);
    const has = pattern => pattern.test(source);
    const readHumidity = () => { if (!humidity) errors.push("Je ne trouve pas la lecture explicite du capteur d’humidité sur A0."); };
    const readLight = () => { if (!light) errors.push("Je ne trouve pas la lecture explicite du capteur de lumière sur A1."); };
    const readReservoir = () => { if (!reservoir) errors.push("Je ne trouve pas la lecture explicite du niveau sur A2."); };
    const requireStop = () => { if (!has(/\bstop\s*\(\s*\)/)) errors.push("L’état sûr stop() manque."); };
    const requireWater = () => { if (!has(/\barroser\s*\(\s*[23]\s*\)/)) errors.push("Je ne trouve pas un arrosage limité à 2 ou 3 secondes."); };
    if (!source.trim()) errors.push("Le programme ne contient encore aucune instruction.");
    if (has(/_{3,}/)) errors.push("Les blancs ____ ne sont pas du code : efface-les et remplace-les par tes instructions C++.");
    if (has(/lire_(?:humidite|lumiere|reservoir)\s*\(\s*\)/)) errors.push("Indique la broche entre parenthèses.");
    if (id === 1) {
      if (!has(/\bconst\s+int\s+RELAIS_POMPE\s*=\s*6\s*;/)) errors.push("Déclare la broche du relais : const int RELAIS_POMPE = 6;");
      if (!has(/\bvoid\s+setup\s*\(\s*\)\s*\{/)) errors.push("Ajoute le bloc void setup() { ... }.");
      if (!has(/\bSerial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/)) errors.push("Dans setup(), initialise l’affichage avec Serial.begin(9600);");
      if (!has(/\bpinMode\s*\(\s*RELAIS_POMPE\s*,\s*OUTPUT\s*\)\s*;/)) errors.push("Dans setup(), déclare D6 en sortie avec pinMode(RELAIS_POMPE, OUTPUT);");
      if (!has(/\bvoid\s+loop\s*\(\s*\)\s*\{/)) errors.push("Ajoute le bloc void loop() { ... }.");
      if (!cppHumidity) errors.push("Dans loop(), lis A0 avec : int humidite = analogRead(A0);");
      if (cppHumidity && !new RegExp(`\\bSerial\\s*\\.\\s*println\\s*\\(\\s*${cppHumidity[1]}\\s*\\)\\s*;`).test(source)) errors.push(`Affiche la variable ${cppHumidity[1]} avec Serial.println(${cppHumidity[1]});`);
      if (!has(/\bdigitalWrite\s*\(\s*(?:RELAIS_POMPE|6)\s*,\s*LOW\s*\)\s*;/)) errors.push("Garde la pompe arrêtée avec digitalWrite(RELAIS_POMPE, LOW);");
    }
    if (id === 2) { readHumidity(); if (!has(/seuil_humidite\s*=\s*\d+/)) errors.push("Définis seuil_humidite."); if (!has(/\bif\b/) || !has(/\belse\s*:/)) errors.push("La comparaison if / else est incomplète."); if (!has(/\bafficher\s*\(/)) errors.push("Il manque l’affichage."); requireStop(); }
    if (id === 3) { readHumidity(); if (!has(/seuil_humidite\s*=\s*\d+/)) errors.push("Définis seuil_humidite."); if (!has(/\bif\b/)) errors.push("Il manque la décision if."); requireWater(); requireStop(); }
    if (id === 4) { readHumidity(); readReservoir(); if (!has(/\band\b/)) errors.push("Relie les conditions avec and."); requireWater(); requireStop(); if (!has(/\balerter\s*\(/)) errors.push("Il manque l’alerte."); }
    if (id === 5) { readHumidity(); readReservoir(); if (!has(/seuil_humidite\s*=\s*\d+/) || !has(/seuil_arret\s*=\s*\d+/)) errors.push("Les deux seuils doivent être numériques."); requireWater(); requireStop(); }
    if (id === 6) { readHumidity(); readLight(); readReservoir(); if ((source.match(/\band\b/g) || []).length < 2) errors.push("La décision doit relier les trois critères."); requireWater(); requireStop(); }
    if (id === 7) { readHumidity(); readReservoir(); if (!has(/seuil_humidite\s*=\s*\d+/)) errors.push("Inscris le seuil calibré."); if (!has(/\band\b/)) errors.push("Conserve la sécurité du réservoir."); requireStop(); }
    if (id === 8) { readHumidity(); readLight(); readReservoir(); requireWater(); requireStop(); if (!has(/\balerter\s*\(/)) errors.push("Il manque l’alerte."); if (!has(/\bafficher\s*\(/)) errors.push("Il manque l’affichage final."); }
    return { errors, source };
  };

  const simulate = source => {
    const humidity = id === 1 ? 35 : 28, reservoir = 75, light = 62;
    const number = name => Number(source.match(new RegExp(`${name}\\s*=\\s*(\\d+)`))?.[1]);
    const low = number("seuil_humidite") || 35, high = number("seuil_arret") || 42;
    const minTank = number("seuil_reservoir") || 20, maxLight = number("seuil_lumiere") || 70;
    let action = "Pompe arrêtée — D6 = LOW";
    if ([3,4,5,6,7,8].includes(id) && humidity < low && reservoir >= minTank && (![6,8].includes(id) || light < maxLight)) action = `Arrosage autorisé — D6 = HIGH pendant ${/arroser\s*\(\s*3/.test(source) ? 3 : 2} s`;
    if (id === 5 && humidity >= low && humidity <= high) action = "Zone d’hystérésis — pompe arrêtée pour cet essai";
    return { humidity, reservoir, light, action };
  };

  const editorCard = editor.closest(".card-body");
  const actionRow = editorCard?.querySelector(".demo-controls");
  ["runCode", "showProgramHelp", "codeRunStatus", "programHelpPanel"].forEach(controlId => {
    document.getElementById(controlId)?.remove();
  });
  if (actionRow && !document.getElementById("runCodeV3")) {
    const run = document.createElement("button");
    run.id = "runCodeV3"; run.type = "button"; run.className = "btn primary"; run.textContent = "▶ Exécuter le programme";
    const help = document.createElement("button");
    help.id = "openHelpV3"; help.type = "button"; help.className = "btn help-button"; help.textContent = "Aide"; help.setAttribute("aria-expanded", "false");
    actionRow.prepend(help); actionRow.prepend(run);

    const consoleBox = document.createElement("pre");
    consoleBox.id = "codeRunConsoleV3"; consoleBox.className = "code-run-console"; consoleBox.setAttribute("aria-live", "polite");
    consoleBox.textContent = "Prêt. L’exécution pédagogique vérifie les instructions reconnues par le simulateur.";
    actionRow.insertAdjacentElement("afterend", consoleBox);

    const panel = document.createElement("section");
    panel.id = "codeHelpV3"; panel.className = "code-help hidden";
    panel.innerHTML = `<div class="code-help-head"><div><p class="eyebrow">Aide progressive</p><h3>Comprendre sans recevoir la solution</h3></div><button type="button" class="btn" data-close-help>Fermer</button></div>${helpBySession[id]}`;
    consoleBox.insertAdjacentElement("afterend", panel);
    const toggleHelp = show => { panel.classList.toggle("hidden", !show); help.setAttribute("aria-expanded", String(show)); if (show) panel.scrollIntoView({ behavior: "smooth", block: "nearest" }); };
    help.addEventListener("click", () => toggleHelp(panel.classList.contains("hidden")));
    panel.querySelector("[data-close-help]").addEventListener("click", () => toggleHelp(false));

    run.addEventListener("click", () => {
      markAttempt();
      const result = checkProgram(editor.value);
      if (result.errors.length) {
        stage.classList.remove("running", "code-valid");
        consoleBox.className = "code-run-console error";
        consoleBox.textContent = "Programme non exécuté :\n• " + result.errors.join("\n• ");
        return;
      }
      const values = simulate(result.source);
      stage.classList.toggle("running", values.action.includes("HIGH"));
      stage.classList.add("code-valid"); setTimeout(() => stage.classList.remove("code-valid"), 1600);
      consoleBox.className = "code-run-console success";
      consoleBox.textContent = `Exécution pédagogique réussie.\nA0 humidité = ${values.humidity} %\nA1 lumière = ${values.light} %\nA2 réservoir = ${values.reservoir} %\n${values.action}`;
      const status = document.getElementById("demoStatus");
      if (status) status.textContent = `Programme exécuté : ${values.action}.`;
    });
  }
})();
