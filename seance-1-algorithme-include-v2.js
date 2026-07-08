/* Séance 1 — algorithme C++ cohérent, directive #include et mode guidé exhaustif. */
"use strict";
(() => {
  if (Number(document.body.dataset.session || 0) !== 1) return;
  const editor = document.getElementById("codeEditor");
  const highlight = document.getElementById("codeHighlight");
  if (!editor) return;

  const STORAGE_KEY = "technoquest-premium-v1";
  const VERSION = "2026-07-seance1-include-algorithme-v2";

  const guided = `// ---------------------------------------------------------
// Programme : Observation des signaux des capteurs
// Carte : Arduino UNO R3 ou UNO R4 Minima
// Capteurs :
//   - Humidité du sol sur A0
//   - Lumière (LDR) sur A1
//   - Niveau d'eau du réservoir sur A2
// Actionneur :
//   - Relais de la pompe sur D6 (non utilisé pour arroser dans cette séance)
// Objectifs :
//   - Lire les valeurs des capteurs
//   - Afficher ces valeurs dans le Moniteur Série
//   - Comprendre que les capteurs envoient des nombres au microcontrôleur
// ---------------------------------------------------------

// La directive suivante rend explicites les fonctions de base Arduino.
// Dans un fichier .ino, l'IDE Arduino l'ajoute normalement automatiquement,
// mais nous l'écrivons ici pour comprendre l'organisation d'un programme C++.
#include <Arduino.h>

// Ici, nous définissons les numéros de broches utilisés par les capteurs et le relais.
// Cela permet de donner un nom clair à chaque broche.

// Broche analogique pour le capteur d'humidité du sol.
const int PIN_HUMIDITE_SOL = A0;

// Broche analogique pour le capteur de lumière (LDR).
const int PIN_LUMIERE = A1;

// Broche analogique pour le capteur de niveau d'eau du réservoir.
const int PIN_NIVEAU_EAU = A2;

// Broche numérique pour le relais qui commande la pompe (D6).
const int PIN_RELAIS_POMPE = 6;

// La fonction setup() est exécutée UNE SEULE FOIS au démarrage de la carte.
// C'est ici que l'on prépare la communication et les broches.
void setup() {
  // Démarrer la communication série à 9600 bits par seconde.
  // Écris l'instruction sur la ligne suivante.


  // Indiquer que la broche du relais est une SORTIE.
  // Écris l'instruction sur la ligne suivante.


  // Par sécurité, placer le relais au repos avec LOW.
  // Écris l'instruction sur la ligne suivante.


  // Afficher un message d'accueil dans le Moniteur Série.
  // Écris deux instructions Serial.println(...) sur les lignes suivantes.


}

// La fonction loop() tourne en BOUCLE tant que la carte est alimentée.
// C'est ici que l'on lit les capteurs et que l'on affiche leurs valeurs.
void loop() {
  // -------------------------------------------------------
  // 1. ACQUÉRIR ET MÉMORISER LES MESURES
  // -------------------------------------------------------

  // Lire le capteur d'humidité du sol sur A0.
  // Dans cette séquence, on conserve une lecture sur 10 bits : 0 à 1023.
  // Écris la déclaration de valeurHumidite sur la ligne suivante.


  // Lire le capteur de lumière sur A1.
  // Le sens de variation dépend du montage : il faudra l'observer.
  // Écris la déclaration de valeurLumiere sur la ligne suivante.


  // Lire le capteur de niveau d'eau sur A2.
  // Écris la déclaration de valeurNiveauEau sur la ligne suivante.


  // -------------------------------------------------------
  // 2. COMMUNIQUER DANS LE MONITEUR SÉRIE
  // -------------------------------------------------------

  // Afficher un titre pour distinguer deux cycles de mesure.
  // Écris l'instruction sur la ligne suivante.


  // Afficher le texte puis la valeur d'humidité.
  // Utilise Serial.print(...) puis Serial.println(...).


  // Afficher le texte puis la valeur de lumière.


  // Afficher le texte puis la valeur du niveau d'eau.


  // Ajouter une ligne vide pour améliorer la lisibilité.


  // -------------------------------------------------------
  // 3. SÉCURISER, TEMPORISER ET RECOMMENCER
  // -------------------------------------------------------

  // Maintenir la pompe arrêtée pendant cette séance.
  // Nous retenons provisoirement LOW = relais au repos.


  // Attendre 1000 millisecondes avant la prochaine mesure.


}`;

  const standard = `// Séance 1 : observer A0, A1 et A2 dans le Moniteur Série.
#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
  // Initialiser la communication série, D6 et l'état sûr.
  // Afficher un court message d'accueil.
}

void loop() {
  // Lire et mémoriser A0, A1 et A2.

  // Afficher clairement les trois mesures.

  // Maintenir D6 à LOW et attendre une seconde.
}`;

  const expert = `// Mission autonome : lire A0, A1 et A2, afficher les trois mesures
// toutes les secondes et maintenir la pompe arrêtée sur D6.
#include <Arduino.h>

const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;

void setup() {
}

void loop() {
}`;

  const reference = `// ---------------------------------------------------------
// Programme : Observation des signaux des capteurs
// Carte : Arduino UNO R3 ou UNO R4 Minima
// ---------------------------------------------------------
#include <Arduino.h>

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

  const models = { guided, standard, expert };
  const readState = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  };
  const writeSession = patch => {
    const state = readState();
    state.sessions = state.sessions || {};
    state.sessions[1] = { ...(state.sessions[1] || {}), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state.sessions[1];
  };
  let current = readState().sessions?.[1] || {};
  const currentMode = () => document.getElementById("codeModeV2")?.value || current.learningMode || "guided";
  const renderEditor = () => editor.dispatchEvent(new Event("input", { bubbles: true }));
  const loadModel = mode => {
    editor.value = models[mode] || models.guided;
    current = writeSession({
      code: editor.value,
      learningMode: mode,
      learningV2: true,
      learningV2Version: VERSION,
      attemptedV2: false
    });
    renderEditor();
    setTimeout(() => writeSession({ attemptedV2: false }), 0);
  };

  const code = editor.value;
  const unstartedOldSkeleton = !/#include\s*<Arduino\.h>/.test(code)
    && /PIN_LUMIERE/.test(code)
    && !/Serial\s*\.\s*begin\s*\(/.test(code)
    && !/analogRead\s*\(/.test(code);
  if (!code.trim() || unstartedOldSkeleton || (current.learningV2Version !== VERSION && !current.attemptedV2)) {
    loadModel(current.learningMode || "guided");
  } else if (!/#include\s*<Arduino\.h>/.test(code)) {
    editor.value = `#include <Arduino.h>\n\n${code}`;
    current = writeSession({ code: editor.value, learningV2Version: VERSION });
    renderEditor();
  } else {
    current = writeSession({ learningV2Version: VERSION });
  }

  const oldSelect = document.getElementById("codeModeV2");
  if (oldSelect) {
    const select = oldSelect.cloneNode(true);
    oldSelect.replaceWith(select);
    select.value = current.learningMode || "guided";
    select.addEventListener("change", () => {
      current = readState().sessions?.[1] || current;
      if (current.attemptedV2 && !window.confirm("Changer de niveau remplacera le programme en cours par un nouveau squelette. Continuer ?")) {
        select.value = current.learningMode || "guided";
        return;
      }
      loadModel(select.value);
    });
    const note = select.closest(".code-mode-row")?.querySelector("span");
    if (note) note.textContent = "Guidé : commentaires exhaustifs · Standard : consignes courtes · Autonome : mission minimale.";
  }

  const oldRestore = document.getElementById("restoreCode");
  if (oldRestore) {
    const restore = oldRestore.cloneNode(true);
    oldRestore.replaceWith(restore);
    restore.textContent = "↺ Restaurer le squelette";
    restore.addEventListener("click", () => {
      current = readState().sessions?.[1] || current;
      if (current.attemptedV2 && !window.confirm("Effacer le programme actuel et restaurer le squelette ?")) return;
      loadModel(currentMode());
    });
  }

  editor.addEventListener("input", () => {
    current = writeSession({ code: editor.value, attemptedV2: true, learningV2Version: VERSION });
  });

  const correctionPre = document.querySelector("#correctionPanel pre");
  if (correctionPre) correctionPre.textContent = reference;

  const algorithm = document.querySelector(".algorithm");
  if (algorithm) {
    const steps = [
      ["INCLURE", "Rendre disponibles les fonctions de base avec #include <Arduino.h>.", "#38bdf8"],
      ["DÉCLARER", "Associer des noms clairs aux broches A0, A1, A2 et D6.", "#c084fc"],
      ["INITIALISER / SÉCURISER", "Dans setup(), démarrer Serial, configurer D6 et imposer LOW.", "#fb7185"],
      ["ACQUÉRIR", "Dans loop(), lire les trois entrées avec analogRead(...).", "#60a5fa"],
      ["MÉMORISER", "Stocker chaque mesure dans une variable entière.", "#a78bfa"],
      ["COMMUNIQUER", "Afficher les libellés et les valeurs dans le Moniteur Série.", "#67e8f9"],
      ["TEMPORISER / REBOUCLER", "Attendre 1000 ms, puis laisser loop() recommencer.", "#4ade80"]
    ];
    algorithm.innerHTML = steps.map((step, index) => `${index ? '<div class="algo-arrow">↓</div>' : ''}<div class="algo-step" style="--step:${step[2]}"><em>${index + 1}</em><strong>${step[0]}</strong><span>${step[1]}</span></div>`).join("");
  }

  const guide = document.querySelector(".python-guide");
  if (guide) {
    guide.innerHTML = `<h3>Aide d’écriture C++ Arduino pas à pas</h3>
      <p>L’algorithme suit désormais la structure réelle d’un fichier Arduino : inclusion, déclarations, setup(), loop(), acquisition, affichage et temporisation.</p>
      <div>
        <article style="--guide:#38bdf8"><strong><span>1</span>INCLURE</strong><p><code>#include &lt;Arduino.h&gt;</code> rend explicites les fonctions du cœur Arduino. L’IDE l’ajoute automatiquement aux fichiers .ino, mais nous l’affichons pour apprendre la structure C++.</p></article>
        <article style="--guide:#c084fc"><strong><span>2</span>DÉCLARER</strong><p>Les constantes nomment les broches et évitent les nombres dispersés dans le programme.</p><code>const int PIN_EXEMPLE = A3;</code></article>
        <article style="--guide:#fb7185"><strong><span>3</span>INITIALISER / SÉCURISER</strong><p><code>setup()</code> prépare Serial, D6 et l’état sûr LOW.</p></article>
        <article style="--guide:#60a5fa"><strong><span>4</span>ACQUÉRIR</strong><p><code>analogRead(...)</code> lit une entrée analogique.</p><code>int autreMesure = analogRead(A3);</code></article>
        <article style="--guide:#a78bfa"><strong><span>5</span>MÉMORISER</strong><p>Une variable entière conserve la mesure afin de la réutiliser.</p></article>
        <article style="--guide:#67e8f9"><strong><span>6</span>COMMUNIQUER</strong><p><code>Serial.print()</code> écrit sans retour ; <code>Serial.println()</code> ajoute un retour à la ligne.</p></article>
        <article style="--guide:#4ade80"><strong><span>7</span>TEMPORISER / REBOUCLER</strong><p><code>delay(1000)</code> attend une seconde, puis <code>loop()</code> recommence automatiquement.</p></article>
      </div>`;
  }

  const course = document.querySelector(".course-note");
  if (course) {
    course.innerHTML = `<h3>Mini-cours C++ Arduino</h3>
      <p><strong>#include &lt;Arduino.h&gt;</strong> rend visible la dépendance au cœur Arduino. Dans un fichier <code>.ino</code>, l’IDE ajoute normalement cette inclusion automatiquement ; elle n’installe aucune bibliothèque externe.</p>
      <p><strong>setup()</strong> s’exécute une fois. <strong>loop()</strong> se répète. Les constantes nomment A0, A1, A2 et D6. <strong>analogRead()</strong> acquiert les mesures ; <strong>Serial.print/println()</strong> les communiquent ; <strong>delay(1000)</strong> espace les cycles.</p>`;
  }

  const help = document.getElementById("programHelpPanel");
  if (help) {
    help.insertAdjacentHTML("afterbegin", `<p><strong>Directive #include :</strong> <code>#include &lt;Arduino.h&gt;</code> donne accès aux déclarations de <code>pinMode()</code>, <code>analogRead()</code>, <code>digitalWrite()</code>, <code>delay()</code> et à l’objet <code>Serial</code>. Elle est écrite ici pour des raisons pédagogiques, même si l’IDE Arduino la place automatiquement dans un sketch .ino.</p>`);
  }

  const originalRun = document.getElementById("runCode");
  if (originalRun) {
    const run = originalRun.cloneNode(true);
    originalRun.replaceWith(run);
    run.textContent = "▶ Vérifier le programme";
    run.addEventListener("click", () => {
      const source = editor.value;
      const checks = [
        ["Directive Arduino", /#include\s*<Arduino\.h>/.test(source), "Ajouter #include <Arduino.h> en début de programme."],
        ["Communication série", /Serial\s*\.\s*begin\s*\(\s*9600\s*\)\s*;/.test(source), "Ajouter Serial.begin(9600); dans setup()."],
        ["Relais configuré", /pinMode\s*\(\s*PIN_RELAIS_POMPE\s*,\s*OUTPUT\s*\)\s*;/.test(source), "Déclarer D6 comme sortie."],
        ["État sûr", /digitalWrite\s*\(\s*PIN_RELAIS_POMPE\s*,\s*LOW\s*\)\s*;/.test(source), "Maintenir provisoirement le relais à LOW."],
        ["Lecture A0", /analogRead\s*\(\s*(?:PIN_HUMIDITE_SOL|A0)\s*\)/.test(source), "Lire l’humidité sur A0."],
        ["Lecture A1", /analogRead\s*\(\s*(?:PIN_LUMIERE|A1)\s*\)/.test(source), "Lire la lumière sur A1."],
        ["Lecture A2", /analogRead\s*\(\s*(?:PIN_NIVEAU_EAU|A2)\s*\)/.test(source), "Lire le niveau sur A2."],
        ["Affichage série", (source.match(/Serial\s*\.\s*println\s*\(/g) || []).length >= 4, "Afficher le titre et les trois mesures."],
        ["Pause", /delay\s*\(\s*1000\s*\)\s*;/.test(source), "Attendre une seconde entre deux cycles."],
        ["Structure", /void\s+setup\s*\(\s*\)[\s\S]*void\s+loop\s*\(\s*\)/.test(source), "Conserver setup() et loop()."]
      ];
      const ok = checks.every(item => item[1]);
      const output = document.getElementById("codeRunStatus");
      if (output) {
        output.className = `run-status ${ok ? "ok" : "missing"}`;
        output.innerHTML = `<strong>${ok ? "Vérification réussie" : "Programme à compléter"}</strong><span>${ok ? "La structure est prête pour la compilation dans l’IDE Arduino." : "Corrige les éléments signalés avant la compilation réelle."}</span><ul>${checks.map(item => `<li class="${item[1] ? "ok" : "missing"}"><strong>${item[0]}</strong><span>${item[1] ? "Présent" : item[2]}</span></li>`).join("")}</ul>`;
      }
      current = writeSession({ code: editor.value, attemptedV2: true, cppCheckOk: ok });
    });
  }

  const q11 = document.querySelector('.s1-question[data-q="11"]');
  if (q11) {
    q11.dataset.correct = "1";
    q11.innerHTML = `<legend>11. À quoi sert la directive #include &lt;Arduino.h&gt; ?</legend>
      <label><input type="radio" name="s1q11" value="0"> À alimenter électriquement la carte</label>
      <label><input type="radio" name="s1q11" value="1"> À rendre disponibles les déclarations des fonctions de base Arduino</label>
      <label><input type="radio" name="s1q11" value="2"> À remplacer setup() et loop()</label>
      <p class="s1-feedback" hidden>Dans un sketch .ino, l’IDE ajoute normalement Arduino.h automatiquement ; l’écrire rend la dépendance explicite.</p>`;
  }

  if (highlight) highlight.dispatchEvent(new Event("scroll"));
})();
