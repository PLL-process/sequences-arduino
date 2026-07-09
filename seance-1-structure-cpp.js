/* Séance 1 — algorigramme premium et mini-cours sur la structure générale d’un programme C++ Arduino. */
"use strict";
(() => {
  if (Number(document.body.dataset.session || 0) !== 1) return;

  const algorithm = document.querySelector(".algorithm");
  const course = document.querySelector(".course-note");
  if (!algorithm || !course) return;

  const editorTitle = [...document.querySelectorAll("h2,h3")].find(element => element.textContent.includes("Écrire le programme C++"));
  if (editorTitle) editorTitle.textContent = "Comprendre puis écrire le programme C++ Arduino";

  algorithm.classList.add("cpp-algorithm-premium");
  algorithm.innerHTML = `
    <section class="cpp-algo-shell" aria-labelledby="cppAlgoTitle">
      <header class="cpp-algo-header">
        <div>
          <div class="cpp-algo-kicker">Séance 1 · Algorithmique</div>
          <h3 id="cppAlgoTitle">Partie 2 — L’algorigramme du programme Arduino</h3>
          <p>Visualiser la logique générale avant d’écrire la syntaxe C++ permet de mieux comprendre le rôle de chaque partie du programme.</p>
        </div>
        <span class="cpp-loop-badge">↻ loop() se répète sans fin</span>
      </header>

      <div class="cpp-flow" role="img" aria-label="Algorigramme du programme Arduino en sept étapes">
        <div class="cpp-flow-node start" style="--node:#4ade80"><strong>Début</strong><span>Mise sous tension ou remise à zéro de la carte.</span></div>
        <div class="cpp-flow-arrow">↓</div>
        <div class="cpp-flow-node" style="--node:#38bdf8"><strong>1. Inclure</strong><span><code>#include &lt;Arduino.h&gt;</code></span></div>
        <div class="cpp-flow-arrow">↓</div>
        <div class="cpp-flow-node" style="--node:#c084fc"><strong>2. Déclarer</strong><span>Constantes de broches, variables globales éventuelles et noms utiles.</span></div>
        <div class="cpp-flow-arrow">↓</div>
        <div class="cpp-flow-node" style="--node:#fb7185"><strong>3. setup()</strong><span>Initialiser une seule fois la communication série, les modes des broches et l’état sûr.</span></div>
        <div class="cpp-flow-arrow">↓</div>
        <div class="cpp-flow-node loop" style="--node:#f472b6"><strong>4. loop()</strong><span>Entrer dans la boucle principale exécutée tant que la carte est alimentée.</span></div>
        <div class="cpp-flow-arrow">↓</div>
        <div class="cpp-flow-node" style="--node:#60a5fa"><strong>5. Acquérir et mémoriser</strong><span>Lire A0, A1 et A2 avec <code>analogRead()</code>, puis stocker les nombres dans des variables.</span></div>
        <div class="cpp-flow-arrow">↓</div>
        <div class="cpp-flow-node" style="--node:#67e8f9"><strong>6. Communiquer</strong><span>Afficher les trois mesures avec <code>Serial.print()</code> et <code>Serial.println()</code>.</span></div>
        <div class="cpp-flow-arrow">↓</div>
        <div class="cpp-flow-node" style="--node:#4ade80"><strong>7. Temporiser</strong><span>Attendre avec <code>delay(1000)</code>.</span></div>
        <div class="cpp-flow-return">↺ Fin de loop() → retour automatique au début de loop()</div>
      </div>

      <div class="cpp-timeline" aria-label="Sept étapes détaillées">
        ${[
          [1,"INCLURE","Rendre les fonctions Arduino disponibles.","#include <Arduino.h>","#38bdf8"],
          [2,"DÉCLARER","Donner des noms clairs aux broches et prévoir les variables utiles.","const int PIN_HUMIDITE_SOL = A0;","#c084fc"],
          [3,"INITIALISER / SÉCURISER","setup() s’exécute une seule fois au démarrage.","Serial.begin(9600);\npinMode(PIN_RELAIS_POMPE, OUTPUT);\ndigitalWrite(PIN_RELAIS_POMPE, LOW);","#fb7185"],
          [4,"ENTRER DANS loop()","loop() est la boucle principale obligatoire du sketch Arduino.","void loop() {","#f472b6"],
          [5,"ACQUÉRIR / MÉMORISER","Lire les capteurs et stocker leurs valeurs dans des variables entières.","int valeurHumidite = analogRead(PIN_HUMIDITE_SOL);","#60a5fa"],
          [6,"COMMUNIQUER","Envoyer les mesures vers le Moniteur Série.","Serial.println(valeurHumidite);","#67e8f9"],
          [7,"TEMPORISER / REBOUCLER","Attendre une seconde, puis laisser loop() recommencer.","delay(1000);","#4ade80"]
        ].map(step => `<article class="cpp-timeline-item" style="--step:${step[4]}"><div class="cpp-timeline-number">${step[0]}</div><div class="cpp-timeline-card"><h4>${step[1]}</h4><p>${step[2]}</p><pre data-language="cpp" data-code-title="Exemple — ${step[1]}">${step[3].replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre></div></article>`).join("")}
      </div>
    </section>`;

  course.classList.add("cpp-structure-course");
  course.innerHTML = `
    <div class="cpp-structure-intro"><strong>Structure générale d’un programme Arduino en C++ :</strong> un sketch contient des directives éventuelles, des déclarations globales, les deux fonctions obligatoires <code>setup()</code> et <code>loop()</code>, puis éventuellement des fonctions supplémentaires créées pour rendre le programme plus clair.</div>

    <div class="cpp-structure-grid">
      <article class="cpp-structure-card"><span class="tag">Avant setup()</span><h4>Directives, constantes, broches et variables globales</h4><p>On place ici les <code>#include</code>, les constantes de broches et les variables qui doivent être accessibles depuis plusieurs fonctions.</p><p><strong>Constante :</strong> valeur qui ne change pas. <strong>Variable :</strong> valeur qui peut évoluer pendant l’exécution.</p></article>
      <article class="cpp-structure-card"><span class="tag">Obligatoire</span><h4>setup() — exécutée une seule fois</h4><p>Elle prépare la carte au démarrage : communication série, modes des broches, état initial des sorties et messages d’accueil.</p></article>
      <article class="cpp-structure-card"><span class="tag">Obligatoire</span><h4>loop() — exécutée en continu</h4><p>Elle contient les actions répétées : lire les capteurs, traiter les données, commander les sorties, afficher et attendre.</p></article>
      <article class="cpp-structure-card"><span class="tag">Optionnel</span><h4>Fonctions supplémentaires</h4><p>Elles ne sont pas obligatoires. Elles servent seulement à découper un programme long en tâches lisibles, par exemple <code>lireCapteurs()</code>, <code>afficherMesures()</code> ou <code>arreterPompe()</code>.</p></article>
      <article class="cpp-structure-card"><span class="tag">Portée</span><h4>Variables globales et locales</h4><p>Une variable déclarée hors des fonctions est globale. Une variable déclarée dans <code>setup()</code>, <code>loop()</code> ou une fonction supplémentaire est locale à cette fonction.</p></article>
      <article class="cpp-structure-card"><span class="tag">Bibliothèques</span><h4>#include selon le matériel utilisé</h4><p><code>#include &lt;Arduino.h&gt;</code> est affiché ici pour comprendre la structure. D’autres bibliothèques ne seront ajoutées que lorsqu’un module en aura réellement besoin, par exemple un écran LCD I²C.</p></article>
    </div>

    <pre class="cpp-structure-code" data-language="cpp" data-code-title="Structure générale d’un programme C++ Arduino">// 1. DIRECTIVES ÉVENTUELLES
#include &lt;Arduino.h&gt;

// 2. DÉCLARATIONS GLOBALES
const int PIN_CAPTEUR = A0;      // constante de broche
int derniereMesure = 0;          // variable globale éventuelle

// 3. FONCTION OBLIGATOIRE : UNE SEULE FOIS
void setup() {
  Serial.begin(9600);
}

// 4. FONCTION OBLIGATOIRE : EN BOUCLE
void loop() {
  int mesure = analogRead(PIN_CAPTEUR); // variable locale
  Serial.println(mesure);
  delay(1000);
}

// 5. FONCTION SUPPLÉMENTAIRE OPTIONNELLE
void afficherMessage() {
  Serial.println("Mesure effectuee");
}</pre>

    <div class="cpp-optional-note"><strong>À retenir :</strong> pour un sketch Arduino, <code>setup()</code> et <code>loop()</code> sont indispensables. Les autres fonctions sont facultatives. Elles deviennent utiles lorsque le programme grandit, mais elles ne doivent pas compliquer inutilement la séance 1.</div>

    <div class="cpp-reduino-note"><strong>Extension future — Reduino :</strong> une fois le parcours C++ terminé, il sera possible d’étudier une version Python qui transpile vers du C++ Arduino. Reduino sait actuellement produire du C++ et peut compiler/téléverser via PlatformIO pour des plateformes AVR prises en charge. Il faudra toutefois vérifier la compatibilité de la carte choisie avant de l’utiliser avec l’Arduino UNO R4 Minima.</div>`;
})();
