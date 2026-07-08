/* Séance 1 — C++ Arduino réel, phase pratique, QCM et sauvegarde de brouillon. */
"use strict";
(() => {
  if (Number(document.body.dataset.session || 0) !== 1) return;
  const editor = document.getElementById("codeEditor");
  const highlight = document.getElementById("codeHighlight");
  const footer = document.querySelector(".session-footer-nav");
  if (!editor || !footer || document.getElementById("s1PracticalSection")) return;

  const STORAGE_KEY = "technoquest-premium-v1";
  const VERSION = "2026-07-seance1-cpp-pratique-v1";

  const models = {
    guided: `// Séance 1 : observer trois signaux analogiques
// Carte : Arduino UNO R3 ou UNO R4 Minima

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Démarrer le Moniteur Série à 9600 bits par seconde.


  // Préparer D6 comme sortie puis imposer l’état sûr LOW.


}

void loop() {
  // 1. Lire A0 et mémoriser la valeur dans valeurHumidite.


  // 2. Lire A1 et mémoriser la valeur dans valeurLumiere.


  // 3. Lire A2 et mémoriser la valeur dans valeurNiveauEau.


  // 4. Afficher les trois mesures dans le Moniteur Série.





  // 5. Maintenir la pompe arrêtée pendant cette séance.


  // 6. Attendre une seconde avant la mesure suivante.


}`,
    standard: `// Séance 1 : observer A0, A1 et A2 avec le Moniteur Série.

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Initialiser la communication série, D6 et l’état sûr.
}

void loop() {
  // Lire les trois entrées analogiques.

  // Afficher clairement les trois mesures.

  // Maintenir D6 à LOW et attendre une seconde.
}`,
    expert: `// Mission autonome :
// Lire A0, A1 et A2, afficher les trois mesures toutes les secondes
// et maintenir la pompe arrêtée sur D6.

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
}

void loop() {
}`
  };

  const reference = `// ---------------------------------------------------------
// Programme : Observation des signaux des capteurs
// Carte : Arduino UNO R3 ou UNO R4 Minima
// ---------------------------------------------------------

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);

  Serial.println("Demarrage de la seance 1 : Observer les signaux des capteurs");
  Serial.println("----------------------------------------------------------");
}

void loop() {
  int valeurHumidite = analogRead(PIN_HUMIDITE_SOL);
  int valeurLumiere = analogRead(PIN_LUMIERE);
  int valeurNiveauEau = analogRead(PIN_NIVEAU_EAU);

  Serial.println("Nouvelle mesure des capteurs :");
  Serial.print("  Humidite du sol (A0) : ");
  Serial.println(valeurHumidite);
  Serial.print("  Lumiere (A1) : ");
  Serial.println(valeurLumiere);
  Serial.print("  Niveau d'eau (A2) : ");
  Serial.println(valeurNiveauEau);
  Serial.println();

  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);
}`;

  const readState = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  };
  const updateSession = patch => {
    const state = readState();
    state.sessions = state.sessions || {};
    state.sessions[1] = { ...(state.sessions[1] || {}), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state.sessions[1];
  };
  let current = readState().sessions?.[1] || {};

  const dispatchEditorInput = () => {
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    highlight?.dispatchEvent(new Event("scroll"));
  };
  const currentMode = () => document.getElementById("codeModeV2")?.value || current.learningMode || "guided";
  const loadModel = mode => {
    editor.value = models[mode];
    current = updateSession({
      code: editor.value,
      learningMode: mode,
      learningV2: true,
      learningV2Version: VERSION,
      attemptedV2: false
    });
    dispatchEditorInput();
  };

  const oldPython = /lire_humidite|seuil_humidite|\bafficher\s*\(|_{4,}/.test(editor.value);
  const oldMinimalCpp = /analogRead\s*\(\s*A0\s*\)/.test(editor.value) && !/PIN_LUMIERE/.test(editor.value);
  if (!editor.value.trim() || oldPython || oldMinimalCpp || (current.learningV2Version !== VERSION && !current.attemptedV2)) {
    loadModel(current.learningMode || "guided");
  } else {
    current = updateSession({ learningV2Version: VERSION });
  }

  const originalSelect = document.getElementById("codeModeV2");
  if (originalSelect) {
    const select = originalSelect.cloneNode(true);
    originalSelect.replaceWith(select);
    select.value = current.learningMode || "guided";
    select.addEventListener("change", () => {
      current = readState().sessions?.[1] || current;
      if (current.attemptedV2 && !window.confirm("Changer de niveau remplacera le programme en cours par un nouveau squelette. Continuer ?")) {
        select.value = current.learningMode || "guided";
        return;
      }
      loadModel(select.value);
    });
    const row = select.closest(".code-mode-row");
    const note = row?.querySelector("span");
    if (note) note.textContent = "Guidé : commentaires détaillés · Standard : consignes courtes · Autonome : cahier des charges minimal.";
  }

  const originalRestore = document.getElementById("restoreCode");
  if (originalRestore) {
    const restore = originalRestore.cloneNode(true);
    originalRestore.replaceWith(restore);
    restore.textContent = "↺ Restaurer le squelette";
    restore.addEventListener("click", () => {
      current = readState().sessions?.[1] || current;
      if (current.attemptedV2 && !window.confirm("Effacer le programme actuel et restaurer le squelette ?")) return;
      loadModel(currentMode());
    });
  }

  editor.addEventListener("input", () => {
    current = updateSession({ code: editor.value, attemptedV2: true, learningV2Version: VERSION });
  });

  const correctionPre = document.querySelector("#correctionPanel pre");
  if (correctionPre) correctionPre.textContent = reference;

  const guide = document.querySelector(".python-guide");
  if (guide) {
    guide.innerHTML = `<h3>Aide d’écriture C++ Arduino pas à pas</h3>
      <p>Le code est coloré comme dans un IDE. Les commentaires décrivent l’intention ; les lignes vides sont les endroits où écrire les instructions.</p>
      <div>
        <article style="--guide:#60a5fa"><strong><span>1</span>ACQUÉRIR</strong><p><code>analogRead(...)</code> lit une entrée analogique. A0, A1 et A2 doivent être nommées explicitement.</p><code>// Exemple de transfert sur une autre entrée\nint autreMesure = analogRead(A3);</code></article>
        <article style="--guide:#c084fc"><strong><span>2</span>MÉMORISER</strong><p>Une variable entière conserve le nombre produit par le convertisseur analogique-numérique.</p><code>int autreMesure = analogRead(A3);</code></article>
        <article style="--guide:#67e8f9"><strong><span>3</span>COMMUNIQUER</strong><p><code>Serial.print()</code> écrit sans retour à la ligne ; <code>Serial.println()</code> ajoute un retour à la ligne.</p><code>Serial.println(autreMesure);</code></article>
        <article style="--guide:#fb7185"><strong><span>4</span>SÉCURISER</strong><p>Dans cette préparation, nous retenons temporairement la convention LOW = relais au repos.</p><code>digitalWrite(PIN_RELAIS_POMPE, LOW);</code></article>
      </div>`;
  }

  const helpPanel = document.getElementById("programHelpPanel");
  if (helpPanel) {
    helpPanel.innerHTML = `<h3>Aide exhaustive — séance 1</h3>
      <p><strong>Structure :</strong> les déclarations donnent des noms aux broches ; <code>setup()</code> s’exécute une fois ; <code>loop()</code> se répète tant que la carte est alimentée.</p>
      <p><strong>Entrées :</strong> <code>analogRead(PIN_HUMIDITE_SOL)</code>, <code>analogRead(PIN_LUMIERE)</code> et <code>analogRead(PIN_NIVEAU_EAU)</code> lisent respectivement A0, A1 et A2.</p>
      <p><strong>Moniteur Série :</strong> <code>Serial.begin(9600)</code> impose la vitesse. Le Moniteur Série doit lui aussi être réglé sur 9600 bauds.</p>
      <p><strong>Sortie :</strong> <code>pinMode(PIN_RELAIS_POMPE, OUTPUT)</code> prépare D6 ; <code>digitalWrite(PIN_RELAIS_POMPE, LOW)</code> maintient ici la pompe arrêtée.</p>
      <p><strong>Temporisation :</strong> <code>delay(1000)</code> attend 1000 ms, soit une seconde.</p>
      <p><strong>Règles C++ :</strong> chaque instruction se termine par <code>;</code>. Les blocs sont entourés par <code>{</code> et <code>}</code>. Les commentaires commencent par <code>//</code>.</p>
      <p><strong>Exemple de transfert, à ne pas recopier tel quel :</strong></p>
      <pre>const int PIN_EXEMPLE = A3;\nint autreMesure = analogRead(PIN_EXEMPLE);\nSerial.println(autreMesure);</pre>
      <p>L’activité demande de transposer cette méthode vers A0, A1 et A2.</p>`;
  }

  const originalRun = document.getElementById("runCode");
  if (originalRun) {
    const run = originalRun.cloneNode(true);
    originalRun.replaceWith(run);
    run.textContent = "▶ Vérifier le programme";
    run.addEventListener("click", () => {
      const code = editor.value;
      const checks = [
        ["Communication série", /Serial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/.test(code), "Ajouter Serial.begin(9600); dans setup()."],
        ["Relais configuré", /pinMode\s*\(\s*PIN_RELAIS_POMPE\s*,\s*OUTPUT\s*\)\s*;/.test(code), "Déclarer D6 comme sortie."],
        ["État sûr", /digitalWrite\s*\(\s*PIN_RELAIS_POMPE\s*,\s*LOW\s*\)\s*;/.test(code), "Maintenir le relais à LOW."],
        ["Lecture A0", /analogRead\s*\(\s*(?:PIN_HUMIDITE_SOL|A0)\s*\)/.test(code), "Lire l’humidité sur A0."],
        ["Lecture A1", /analogRead\s*\(\s*(?:PIN_LUMIERE|A1)\s*\)/.test(code), "Lire la lumière sur A1."],
        ["Lecture A2", /analogRead\s*\(\s*(?:PIN_NIVEAU_EAU|A2)\s*\)/.test(code), "Lire le niveau sur A2."],
        ["Affichage série", (code.match(/Serial\s*\.\s*println\s*\(/g) || []).length >= 3, "Afficher au moins les trois valeurs."],
        ["Pause", /delay\s*\(\s*1000\s*\)\s*;/.test(code), "Attendre une seconde entre deux séries de mesures."],
        ["Structure", /void\s+setup\s*\(\s*\)[\s\S]*void\s+loop\s*\(\s*\)/.test(code), "Conserver setup() et loop()."]
      ];
      const ok = checks.every(item => item[1]) && !/_{4,}/.test(code);
      const output = document.getElementById("codeRunStatus");
      output.className = `run-status ${ok ? "ok" : "missing"}`;
      output.innerHTML = `<strong>${ok ? "Vérification réussie" : "Programme à compléter"}</strong><span>${ok ? "Le squelette contient les éléments nécessaires avant compilation dans l’IDE Arduino." : "Corrige les éléments indiqués avant de passer à l’IDE Arduino."}</span><ul>${checks.map(item => `<li class="${item[1] ? "ok" : "missing"}"><strong>${item[0]}</strong><span>${item[1] ? "Présent" : item[2]}</span></li>`).join("")}</ul>`;
      current = updateSession({ code: editor.value, attemptedV2: true, cppCheckOk: ok });
    });
  }

  const originalHelp = document.getElementById("showProgramHelp");
  if (originalHelp && helpPanel) {
    const help = originalHelp.cloneNode(true);
    originalHelp.replaceWith(help);
    help.textContent = "Aide exhaustive";
    help.addEventListener("click", () => {
      helpPanel.hidden = !helpPanel.hidden;
      help.textContent = helpPanel.hidden ? "Aide exhaustive" : "Masquer l’aide";
    });
  }

  const algorithmSteps = [...document.querySelectorAll(".algorithm .algo-step")];
  if (algorithmSteps[0]) algorithmSteps[0].querySelector("span").textContent = "Lire les capteurs analogiques A0, A1 et A2.";
  if (algorithmSteps[1]) algorithmSteps[1].querySelector("span").textContent = "Stocker les trois nombres dans des variables entières.";
  if (algorithmSteps[2]) algorithmSteps[2].querySelector("span").textContent = "Afficher les mesures dans le Moniteur Série.";

  const qcmCore = [
    ["Quelle fonction s’exécute une seule fois au démarrage ?", ["setup()", "loop()", "analogRead()"], 0, "setup() sert à initialiser la carte."],
    ["Quelle fonction se répète tant que la carte est alimentée ?", ["setup()", "loop()", "pinMode()"], 1, "loop() est exécutée en continu."],
    ["Quelle instruction lit l’entrée analogique A0 ?", ["digitalRead(A0)", "analogRead(A0)", "Serial.read(A0)"], 1, "analogRead() lit une entrée analogique."],
    ["À quoi sert Serial.begin(9600) ?", ["À alimenter les capteurs", "À régler la communication série", "À démarrer la pompe"], 1, "La même vitesse doit être choisie dans le Moniteur Série."],
    ["Quelle instruction prépare D6 comme sortie ?", ["pinMode(PIN_RELAIS_POMPE, OUTPUT);", "analogRead(D6);", "Serial.println(D6);"], 0, "pinMode(..., OUTPUT) configure une sortie."],
    ["Dans cette préparation, quel état maintient la pompe arrêtée ?", ["LOW", "HIGH", "A0"], 0, "La logique inversée sera vérifiée ultérieurement sur le relais réel."],
    ["Quel type convient aux valeurs renvoyées par analogRead() ?", ["int", "void", "String uniquement"], 0, "Une variable int peut stocker ces nombres."],
    ["Que fait Serial.println(valeurHumidite) ?", ["Elle mesure l’humidité", "Elle affiche la valeur et revient à la ligne", "Elle active le relais"], 1, "println affiche puis ajoute un retour à la ligne."],
    ["Pourquoi ajouter delay(1000) ?", ["Pour attendre une seconde entre deux mesures", "Pour convertir A0 en D6", "Pour augmenter la tension"], 0, "1000 millisecondes correspondent à une seconde."],
    ["Pourquoi la pompe ne doit-elle pas être alimentée directement par D6 ?", ["D6 fournit seulement une commande logique", "D6 est une entrée analogique", "La pompe n’utilise aucune énergie"], 0, "Le relais distribue l’énergie d’une alimentation séparée." ]
  ];
  const qcmExtension = [
    ["A0, A1 et A2 sont principalement utilisées comme…", ["entrées analogiques", "sorties de puissance", "ports série"], 0, "Elles reçoivent les mesures des capteurs."],
    ["D6 est principalement utilisée ici comme…", ["entrée analogique", "sortie numérique", "alimentation de la pompe"], 1, "D6 commande le module relais."],
    ["Quel symbole termine généralement une instruction C++ ?", [":", ";", "#"], 1, "Le point-virgule termine une instruction."],
    ["Comment commence un commentaire sur une seule ligne ?", ["//", "##", "<!--"], 0, "// introduit un commentaire C++."],
    ["Pourquoi donner un nom comme PIN_LUMIERE à A1 ?", ["Pour rendre le programme plus lisible", "Pour augmenter la tension", "Pour changer le capteur"], 0, "Le nom indique le rôle de la broche."],
    ["Que faut-il régler à 9600 dans l’IDE Arduino ?", ["Le zoom", "Le Moniteur Série", "La tension de la pompe"], 1, "La vitesse doit correspondre à Serial.begin(9600)."],
    ["Que doit-on observer en cachant puis en éclairant la LDR ?", ["Une valeur qui peut varier", "Une valeur toujours égale à 0", "La pompe obligatoirement en marche"], 0, "Le sens de variation dépend du montage ; il faut l’observer."],
    ["Pourquoi comparer la simulation au montage réel ?", ["Pour vérifier que le modèle représente correctement le système", "Pour supprimer les capteurs", "Pour éviter le téléversement"], 0, "La comparaison relie l’abstrait au réel."],
    ["Quelle action vient avant le téléversement ?", ["Compiler ou vérifier le programme", "Débrancher tous les capteurs définitivement", "Mettre la pompe dans le pot"], 0, "La compilation détecte les erreurs de syntaxe."],
    ["Quel est l’objectif principal de la séance 1 ?", ["Observer et afficher les signaux sans commander l’arrosage", "Déterminer l’hystérésis finale", "Faire fonctionner la pompe en permanence"], 0, "La pompe reste arrêtée pendant l’observation." ]
  ];

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));

  const renderQuestions = (questions, offset) => questions.map((item, index) => {
    const number = offset + index + 1;
    return `<fieldset class="s1-question" data-q="${number}" data-correct="${item[2]}"><legend>${number}. ${escapeHtml(item[0])}</legend>${item[1].map((choice, choiceIndex) => `<label><input type="radio" name="s1q${number}" value="${choiceIndex}"> ${escapeHtml(choice)}</label>`).join("")}<p class="s1-feedback" hidden>${escapeHtml(item[3])}</p></fieldset>`;
  }).join("");

  const section = document.createElement("section");
  section.id = "s1PracticalSection";
  section.innerHTML = `<div class="s1-practical-grid">
    <article class="s1-card">
      <div class="s1-card-head"><div><h2><span class="section-number">6</span>Passer de la simulation au montage réel</h2><p>Compiler, téléverser et observer les valeurs dans le Moniteur Série.</p></div><span class="chip">Arduino IDE</span></div>
      <div class="s1-card-body">
        <div class="s1-timeplan" aria-label="Temps conseillé pour 55 minutes"><article><strong>8 min</strong><span>Simulation</span></article><article><strong>15 min</strong><span>Programme C++</span></article><article><strong>17 min</strong><span>Montage réel</span></article><article><strong>10 min</strong><span>QCM essentiel</span></article><article><strong>5 min</strong><span>Bilan et sauvegarde</span></article></div>
        <p class="s1-ide-note"><strong>Important :</strong> le bouton « Vérifier le programme » contrôle la structure dans la page. La compilation et le téléversement réels se font ensuite dans <strong>l’IDE Arduino</strong>.</p>
        <div class="s1-actions"><button id="s1CopyCode" class="btn" type="button">Copier le code</button><button id="s1DownloadIno" class="btn primary" type="button">Télécharger le fichier .ino</button></div>
        <ol class="s1-practical-steps"><li>Dans l’IDE Arduino, choisir la carte utilisée et le port série correspondant.</li><li>Coller le programme ou ouvrir le fichier <code>Seance_1_Observer_Signaux.ino</code>.</li><li>Compiler le programme, corriger les erreurs éventuelles puis le téléverser.</li><li>Ouvrir <strong>Outils → Moniteur Série</strong> et régler la vitesse sur <strong>9600 bauds</strong>.</li><li>Observer les valeurs en humidifiant légèrement la terre, en cachant ou éclairant la LDR et en modifiant le niveau d’eau.</li><li>Vérifier que la pompe reste arrêtée pendant toute cette séance.</li></ol>
        <div class="s1-checklist"><label><input type="checkbox" data-practical="board"> Carte et port sélectionnés</label><label><input type="checkbox" data-practical="compiled"> Programme compilé sans erreur</label><label><input type="checkbox" data-practical="uploaded"> Programme téléversé</label><label><input type="checkbox" data-practical="serial"> Moniteur Série ouvert à 9600 bauds</label><label><input type="checkbox" data-practical="safe"> Pompe restée arrêtée</label></div>
        <h3>Relevés expérimentaux</h3>
        <table class="s1-observation-table"><thead><tr><th>Capteur</th><th>Situation 1</th><th>Valeur</th><th>Situation 2</th><th>Valeur</th></tr></thead><tbody>
          <tr><td>A0 — humidité</td><td>Terre plutôt sèche</td><td><input type="number" min="0" max="16383" data-observation="a0dry" aria-label="Valeur A0 terre sèche"></td><td>Terre légèrement humide</td><td><input type="number" min="0" max="16383" data-observation="a0wet" aria-label="Valeur A0 terre humide"></td></tr>
          <tr><td>A1 — lumière</td><td>LDR cachée</td><td><input type="number" min="0" max="16383" data-observation="a1dark" aria-label="Valeur A1 LDR cachée"></td><td>LDR éclairée</td><td><input type="number" min="0" max="16383" data-observation="a1light" aria-label="Valeur A1 LDR éclairée"></td></tr>
          <tr><td>A2 — niveau</td><td>Niveau bas</td><td><input type="number" min="0" max="16383" data-observation="a2low" aria-label="Valeur A2 niveau bas"></td><td>Niveau plus haut</td><td><input type="number" min="0" max="16383" data-observation="a2high" aria-label="Valeur A2 niveau haut"></td></tr>
        </tbody></table>
      </div>
    </article>

    <article class="s1-card">
      <div class="s1-card-head"><div><h2><span class="section-number">7</span>QCM de fin de séance</h2><p>Dix questions essentielles pour tenir dans 55 minutes, puis dix questions facultatives d’approfondissement.</p></div><span class="chip">Autoévaluation</span></div>
      <div class="s1-card-body">
        <div class="s1-qcm-toolbar"><span id="s1QcmScore" class="s1-score">Essentiel : — /10 · Approfondissement : — /10</span><button id="s1CorrectQcm" class="btn primary" type="button">Corriger le QCM</button></div>
        <div id="s1QcmCore">${renderQuestions(qcmCore, 0)}</div>
        <details class="s1-extension"><summary>Pour aller plus loin : 10 questions supplémentaires</summary><div id="s1QcmExtension">${renderQuestions(qcmExtension, 10)}</div></details>
        <h3>Question métacognitive</h3>
        <p>Quelle étape t’a le plus aidé à comprendre — le jumeau numérique, les commentaires C++, la vérification dans la page ou le montage réel ? Décris aussi une difficulté rencontrée et la manière dont tu l’as résolue.</p>
        <textarea id="s1Meta" class="s1-meta" placeholder="Je pensais que… J’ai observé que… J’ai compris que…"></textarea>
        <p class="s1-draft-note">Le QCM est formatif et ne modifie pas automatiquement le barème /20 de la séance.</p>
        <div class="s1-savebar"><span id="s1SaveStatus" class="s1-save-status">Brouillon non enregistré manuellement — la sauvegarde automatique est active.</span><button id="s1SaveDraft" class="btn primary" type="button">Enregistrer et reprendre plus tard</button></div>
      </div>
    </article>
  </div>`;
  footer.insertAdjacentElement("beforebegin", section);

  const practicalInputs = [...section.querySelectorAll("[data-practical]")];
  const observationInputs = [...section.querySelectorAll("[data-observation]")];
  const qcmInputs = [...section.querySelectorAll(".s1-question input")];
  const meta = document.getElementById("s1Meta");
  const saveStatus = document.getElementById("s1SaveStatus");

  const saved = readState().sessions?.[1]?.practicalV1 || {};
  practicalInputs.forEach(input => input.checked = Boolean(saved.practical?.[input.dataset.practical]));
  observationInputs.forEach(input => input.value = saved.observations?.[input.dataset.observation] ?? "");
  qcmInputs.forEach(input => input.checked = saved.qcm?.[input.name] === input.value);
  meta.value = saved.meta || "";
  if (saved.savedAt) {
    saveStatus.textContent = `Brouillon enregistré le ${new Date(saved.savedAt).toLocaleString("fr-FR")}.`;
    saveStatus.classList.add("saved");
  }

  const collect = manual => {
    const practical = Object.fromEntries(practicalInputs.map(input => [input.dataset.practical, input.checked]));
    const observations = Object.fromEntries(observationInputs.map(input => [input.dataset.observation, input.value]));
    const qcm = {};
    qcmInputs.forEach(input => { if (input.checked) qcm[input.name] = input.value; });
    const previous = readState().sessions?.[1]?.practicalV1 || {};
    const practicalV1 = { ...previous, practical, observations, qcm, meta: meta.value, updatedAt: new Date().toISOString() };
    if (manual) practicalV1.savedAt = practicalV1.updatedAt;
    updateSession({ practicalV1 });
    if (manual) {
      saveStatus.textContent = `Brouillon enregistré le ${new Date(practicalV1.savedAt).toLocaleString("fr-FR")}. Tu peux fermer la page et reprendre plus tard.`;
      saveStatus.classList.add("saved");
    } else {
      saveStatus.textContent = "Modifications sauvegardées automatiquement sur cet appareil.";
    }
  };
  [...practicalInputs, ...observationInputs, ...qcmInputs, meta].forEach(input => input.addEventListener(input.type === "checkbox" || input.type === "radio" ? "change" : "input", () => collect(false)));
  document.getElementById("s1SaveDraft").addEventListener("click", () => collect(true));

  document.getElementById("s1CopyCode").addEventListener("click", async event => {
    try {
      await navigator.clipboard.writeText(editor.value);
      event.currentTarget.textContent = "Code copié ✓";
    } catch {
      event.currentTarget.textContent = "Sélectionne puis copie le code";
      editor.focus(); editor.select();
    }
  });
  document.getElementById("s1DownloadIno").addEventListener("click", () => {
    const blob = new Blob([editor.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "Seance_1_Observer_Signaux.ino";
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  });

  document.getElementById("s1CorrectQcm").addEventListener("click", () => {
    let coreScore = 0, extensionScore = 0;
    [...section.querySelectorAll(".s1-question")].forEach((field, index) => {
      const selected = field.querySelector("input:checked");
      const correct = Number(field.dataset.correct);
      const ok = selected && Number(selected.value) === correct;
      field.classList.toggle("correct", Boolean(ok));
      field.classList.toggle("incorrect", !ok);
      field.querySelector(".s1-feedback").hidden = false;
      if (ok && index < 10) coreScore += 1;
      if (ok && index >= 10) extensionScore += 1;
    });
    document.getElementById("s1QcmScore").textContent = `Essentiel : ${coreScore} /10 · Approfondissement : ${extensionScore} /10`;
    const previous = readState().sessions?.[1]?.practicalV1 || {};
    updateSession({ practicalV1: { ...previous, qcmCoreScore: coreScore, qcmExtensionScore: extensionScore, qcmCorrectedAt: new Date().toISOString() } });
  });
})();
