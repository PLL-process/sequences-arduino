/* ============================================================================
   PROTOTYPE FABLE — Parcours vertical séquentiel de la séance 1.
   ----------------------------------------------------------------------------
   Ce fichier est un NOUVEAU fichier de présentation. Il ne modifie AUCUNE
   logique fonctionnelle :
   - il DÉPLACE des conteneurs DOM existants (les écouteurs d'événements sont
     conservés par appendChild / insertBefore) ;
   - il AJOUTE des en-têtes de parties, des transitions et des blocs
     pédagogiques statiques (Partie 1, questions d'observation, algorigramme) ;
   - il n'écrase aucun gestionnaire, ne supprime aucun contenu, ne touche ni au
     localStorage, ni au validateur, ni au jumeau numérique, ni au QCM.
   Le mode Mission reste un écran plein géré par mission-mode.js : son conteneur
   #missionModeRoot n'est pas déplacé (il doit rester frère de .session-shell).
   ============================================================================ */
"use strict";

(() => {
  if (Number(document.body.dataset.session || 0) !== 1) return;

  const run = () => {
    const shell = document.querySelector(".session-shell");
    if (!shell || document.getElementById("fvRail")) return;

    /* ---------- Repérage des blocs existants (aucune modification interne) -- */
    const byTitle = (selector, fragment) =>
      [...shell.querySelectorAll(selector)].find(card => {
        const h = card.querySelector("h2, h3");
        return h && h.textContent.toLowerCase().includes(fragment.toLowerCase());
      }) || null;

    const topbar = shell.querySelector(".session-topbar");
    const hero = shell.querySelector(".session-hero");
    const lessonPath = shell.querySelector(".lesson-path");
    const grids = [...shell.querySelectorAll(":scope > .session-grid")];
    const twinCard = byTitle(".card", "Simuler le jumeau numérique");
    const algoCard = byTitle(".card", "algorithme");
    const studentCard = byTitle(".card", "Mission élève");
    const editorCard = byTitle(".card", "programme C++");
    const testsCard = byTitle(".card", "protocole de tests");
    const rubricCard = byTitle(".card", "Barème");
    const practicalSection = document.getElementById("s1PracticalSection");
    const realCard = practicalSection ?
      [...practicalSection.querySelectorAll(".s1-card")].find(c => c.textContent.includes("montage réel")) : null;
    const qcmCard = practicalSection ?
      [...practicalSection.querySelectorAll(".s1-card")].find(c => c.textContent.includes("QCM de fin de séance")) : null;
    const footerNav = shell.querySelector(".session-footer-nav");
    const courseNote = shell.querySelector(".course-note");

    if (!hero || !twinCard || !editorCard || !testsCard || !qcmCard) return;

    /* ---------- Définition des sept parties ------------------------------- */
    const PARTS = [
      { n: 1, id: "partie-1", title: "Découvrir la mission",
        goal: "Comprendre la situation de départ et ce que tu vas produire.",
        transition: "Commence par observer le fonctionnement du jardin connecté." },
      { n: 2, id: "partie-2", title: "Observer le système",
        goal: "Lancer le jumeau numérique et repérer capteurs, Arduino, relais et pompe.",
        transition: "Tu as observé les capteurs, l’Arduino et la pompe. Découvre maintenant comment le programme organise ces actions." },
      { n: 3, id: "partie-3", title: "Comprendre le programme Arduino",
        goal: "Relier la structure du programme, l’algorithme et son algorigramme.",
        transition: "Tu connais maintenant la structure et le déroulement du programme. Complète-le dans le mode Mission." },
      { n: 4, id: "partie-4", title: "Programmer en mode Mission",
        goal: "Écrire le programme C++ pas à pas, avec le niveau d’aide de ton choix.",
        transition: "Ton programme est écrit : vérifie maintenant qu’il fait exactement ce qui est attendu." },
      { n: 5, id: "partie-5", title: "Tester et interpréter",
        goal: "Exécuter la vérification simulée, cocher le protocole et argumenter.",
        transition: "La simulation est validée : passe au montage réel avec l’IDE Arduino." },
      { n: 6, id: "partie-6", title: "Passer de la simulation au montage réel",
        goal: "Téléverser le programme sur la carte et comparer avec la simulation.",
        transition: "Termine la séance en vérifiant ce que tu as retenu." },
      { n: 7, id: "partie-7", title: "QCM de fin de séance",
        goal: "Vérifier les notions essentielles, puis enregistrer ton bilan.",
        transition: "" }
    ];

    const el = (tag, className, html) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (html !== undefined) node.innerHTML = html;
      return node;
    };

    const buildPart = part => {
      const section = el("section", "fv-part");
      section.id = part.id;
      section.setAttribute("aria-labelledby", `fv-title-${part.n}`);
      section.innerHTML = `
        <header class="fv-part-head">
          <div class="fv-pastille" aria-hidden="true">${part.n}</div>
          <div class="fv-part-head-text">
            <p class="fv-part-kicker">Partie ${part.n} sur 7</p>
            <h2 id="fv-title-${part.n}">${part.title}</h2>
            <p class="fv-part-goal">${part.goal}</p>
          </div>
        </header>
        <div class="fv-part-body"></div>
        ${part.transition ? `
        <footer class="fv-transition">
          <span class="fv-transition-arrow" aria-hidden="true">↓</span>
          <p>${part.transition}</p>
          <a class="fv-continue" href="prototype-fable/seance-1-verticale.html#partie-${part.n + 1}">Continuer vers la partie ${part.n + 1}</a>
        </footer>` : `
        <footer class="fv-transition fv-transition-end">
          <p>Séance terminée : pense à enregistrer ton bilan ci-dessus. Bravo pour ta première mission !</p>
        </footer>`}
      `;
      return section;
    };

    const parts = {};
    PARTS.forEach(p => { parts[p.n] = buildPart(p); });
    const body = n => parts[n].querySelector(".fv-part-body");

    /* Les sections sont attachées au document AVANT d'être remplies : les
       recherches par identifiant (getElementById) restent ainsi valides
       pendant les déplacements de conteneurs. */

    /* ---------- Rail de progression (liens d'ancrage internes) ------------ */
    const rail = el("nav", "fv-rail");
    rail.id = "fvRail";
    rail.setAttribute("aria-label", "Progression de la séance : sept parties");
    rail.innerHTML = PARTS.map(p =>
      `<a href="prototype-fable/seance-1-verticale.html#${p.id}" data-part="${p.n}"><span>${p.n}</span><em>${p.title}</em></a>`
    ).join("");

    /* ---------- Bandeau prototype ----------------------------------------- */
    const banner = el("p", "fv-banner",
      "Prototype d’ergonomie « parcours vertical » — les contenus et les fonctionnalités sont ceux de la séance 1 actuelle, uniquement réorganisés.");

    /* ---------- Assemblage : attacher la structure avant de la remplir ----- */
    if (topbar) topbar.insertAdjacentElement("afterend", banner);
    else shell.prepend(banner);
    banner.insertAdjacentElement("afterend", rail);
    let anchor = rail;
    PARTS.filter(p => p.n <= 5).forEach(p => { anchor.insertAdjacentElement("afterend", parts[p.n]); anchor = parts[p.n]; });
    /* Les parties 6 et 7 restent DESCENDANTES de #s1PracticalSection : les
       gestionnaires d'origine (correction du QCM notamment) recherchent leurs
       éléments à l'intérieur de cette section. On insère donc les deux
       nouvelles sections dans ce conteneur, déplacé à la bonne position. */
    if (practicalSection) {
      anchor.insertAdjacentElement("afterend", practicalSection);
      practicalSection.appendChild(parts[6]);
      practicalSection.appendChild(parts[7]);
    } else {
      anchor.insertAdjacentElement("afterend", parts[6]);
      parts[6].insertAdjacentElement("afterend", parts[7]);
    }
    if (footerNav) shell.appendChild(footerNav);

    /* ======================= PARTIE 1 — Découvrir ========================= */
    body(1).appendChild(hero);
    body(1).appendChild(el("div", "fv-intro-grid", `
      <article class="fv-intro-box">
        <h3>Composants principaux</h3>
        <ul>
          <li><strong>A0</strong> — capteur d’humidité du sol</li>
          <li><strong>A1</strong> — capteur de lumière (LDR)</li>
          <li><strong>A2</strong> — capteur de niveau du réservoir</li>
          <li><strong>Arduino</strong> — carte qui lit, décide et commande</li>
          <li><strong>Relais D6 + pompe</strong> — actionneur maintenu à l’arrêt</li>
        </ul>
      </article>
      <article class="fv-intro-box">
        <h3>Compétences travaillées</h3>
        <ul>
          <li>Observer et décrire un objet technique simulé</li>
          <li>Lire un algorithme et un algorigramme</li>
          <li>Écrire un premier programme C++ Arduino</li>
          <li>Tester, vérifier et interpréter des mesures</li>
        </ul>
      </article>
      <article class="fv-intro-box fv-intro-result">
        <h3>Résultat attendu</h3>
        <p>Un programme C++ qui lit les trois capteurs, affiche les mesures dans le Moniteur série et maintient la pompe arrêtée sur D6.</p>
      </article>
    `));
    const detailsPlan = el("details", "fv-fold");
    detailsPlan.innerHTML = "<summary>Déroulé détaillé de la séance (à consulter si besoin)</summary>";
    const detailsPlanBody = el("div", "fv-fold-body");
    if (lessonPath) detailsPlanBody.appendChild(lessonPath);
    if (studentCard) detailsPlanBody.appendChild(studentCard);
    detailsPlan.appendChild(detailsPlanBody);
    body(1).appendChild(detailsPlan);

    /* ======================= PARTIE 2 — Observer ========================== */
    body(2).appendChild(el("div", "fv-consigne",
      "<strong>Consigne d’observation :</strong> lance la démonstration, suis le trajet du signal depuis chaque capteur vers l’Arduino, puis vérifie que la commande D6 laisse la pompe arrêtée."));
    body(2).appendChild(twinCard);
    body(2).appendChild(el("div", "fv-grandeurs", `
      <h3>Grandeurs observées</h3>
      <div class="fv-grandeurs-grid">
        <article><strong>A0</strong><span>Humidité du sol — valeur analogique variable</span></article>
        <article><strong>A1</strong><span>Lumière — valeur analogique variable</span></article>
        <article><strong>A2</strong><span>Niveau d’eau — valeur analogique variable</span></article>
        <article><strong>D6</strong><span>Commande de la pompe — deux états logiques : LOW ou HIGH</span></article>
      </div>`));
    body(2).appendChild(el("div", "fv-questions", `
      <h3>Questions rapides d’observation</h3>
      <details class="fv-q"><summary>D’où part l’information qui arrive sur l’entrée A0 ?</summary><p>Du capteur d’humidité planté dans le sol : il envoie une tension analogique vers l’entrée A0 de l’Arduino.</p></details>
      <details class="fv-q"><summary>Pourquoi la pompe reste-t-elle arrêtée pendant la démonstration ?</summary><p>La sortie D6 reste à l’état logique LOW : le relais n’alimente donc pas la pompe. C’est l’état sûr demandé dans cette séance.</p></details>
      <details class="fv-q"><summary>Quelle différence y a-t-il entre le signal de A0 et celui de D6 ?</summary><p>A0 reçoit une mesure analogique qui varie progressivement ; D6 émet une commande logique qui ne connaît que deux états, LOW ou HIGH.</p></details>
    `));

    /* ==================== PARTIE 3 — Comprendre =========================== */
    /* A. Structure du programme (représentation visuelle, sans le mot « algorigramme ») */
    body(3).appendChild(el("div", "fv-structure", `
      <h3 class="fv-sub">A. La structure du programme</h3>
      <div class="fv-structure-grid">
        <article><em aria-hidden="true">📚</em><strong>Bibliothèques et constantes</strong><span>En haut du programme : <code>#include</code> et les noms donnés aux broches (<code>PIN_HUMIDITE_SOL</code>…).</span></article>
        <article><em aria-hidden="true">1️⃣</em><strong>setup( ) — une seule fois</strong><span>Exécutée au démarrage : elle prépare la communication série, les broches et l’état sûr.</span></article>
        <article><em aria-hidden="true">🔁</em><strong>loop( ) — en continu</strong><span>Répétée tant que la carte est alimentée : lire, afficher, sécuriser, attendre.</span></article>
      </div>`));
    const structFold = el("details", "fv-fold");
    structFold.innerHTML = "<summary>Cours complet : structure générale d’un programme C++ Arduino</summary>";
    const structFoldBody = el("div", "fv-fold-body");
    if (courseNote) structFoldBody.appendChild(courseNote);
    structFold.appendChild(structFoldBody);
    body(3).appendChild(structFold);

    /* B. Algorithme textuel — verbes d'action, volontairement non numérotés */
    body(3).appendChild(el("div", "fv-algo-text", `
      <h3 class="fv-sub">B. L’algorithme du programme, en français</h3>
      <p class="fv-note">Ces actions correspondent exactement au programme de la séance. Elles ne sont pas numérotées : les grands numéros sont réservés aux sept parties de la page.</p>
      <div class="fv-verbes">
        <span style="--v:#fb7185">INITIALISER</span><i>→</i>
        <span style="--v:#60a5fa">LIRE</span><i>→</i>
        <span style="--v:#c084fc">MÉMORISER</span><i>→</i>
        <span style="--v:#67e8f9">AFFICHER</span><i>→</i>
        <span style="--v:#fb923c">SÉCURISER</span><i>→</i>
        <span style="--v:#4ade80">ATTENDRE</span><i>→</i>
        <span style="--v:#facc15">RECOMMENCER</span>
      </div>
      <ul class="fv-verbes-detail">
        <li><strong style="color:#fb7185">INITIALISER</strong> — inclure les ressources, déclarer les constantes, démarrer la communication série, configurer les broches et placer la pompe dans un état sûr.</li>
        <li><strong style="color:#60a5fa">LIRE</strong> — mesurer les trois entrées analogiques A0, A1 et A2.</li>
        <li><strong style="color:#c084fc">MÉMORISER</strong> — ranger chaque mesure dans une variable entière.</li>
        <li><strong style="color:#67e8f9">AFFICHER</strong> — envoyer les trois mesures vers le Moniteur série.</li>
        <li><strong style="color:#fb923c">SÉCURISER</strong> — conserver la pompe arrêtée (D6 à LOW).</li>
        <li><strong style="color:#4ade80">ATTENDRE</strong> — temporiser une seconde.</li>
        <li><strong style="color:#facc15">RECOMMENCER</strong> — laisser loop() reprendre automatiquement au début.</li>
      </ul>`));

    /* C. Algorigramme fidèle au programme réel — aucune décision inventée */
    body(3).appendChild(el("div", "fv-flow", `
      <h3 class="fv-sub">C. L’algorigramme de la séance</h3>
      <div class="fv-flowchart" role="img" aria-label="Algorigramme : début, initialiser, puis boucle lire et mémoriser, afficher, maintenir la pompe arrêtée, attendre, et retour à lire">
        <div class="fv-node fv-oval">DÉBUT</div>
        <div class="fv-arrow" aria-hidden="true">↓</div>
        <div class="fv-node fv-rect">INITIALISER<small>setup( ) — une seule fois</small></div>
        <div class="fv-arrow" aria-hidden="true">↓</div>
        <div class="fv-loop-zone">
          <div class="fv-loop-label">loop( ) — répétée en continu</div>
          <div class="fv-node fv-rect" id="fvNodeLire">LIRE ET MÉMORISER<small>analogRead sur A0, A1, A2</small></div>
          <div class="fv-arrow" aria-hidden="true">↓</div>
          <div class="fv-node fv-io">AFFICHER<small>Serial.print / Serial.println</small></div>
          <div class="fv-arrow" aria-hidden="true">↓</div>
          <div class="fv-node fv-rect">MAINTENIR LA POMPE ARRÊTÉE<small>digitalWrite(…, LOW)</small></div>
          <div class="fv-arrow" aria-hidden="true">↓</div>
          <div class="fv-node fv-rect">ATTENDRE<small>delay(1000)</small></div>
          <div class="fv-return" aria-hidden="true"><span>↺ retour à LIRE</span></div>
        </div>
      </div>
      <div class="fv-legende">
        <h4>Légende</h4>
        <ul>
          <li><i class="fv-l-oval"></i> Ovale : début ou fin</li>
          <li><i class="fv-l-rect"></i> Rectangle : traitement</li>
          <li><i class="fv-l-io"></i> Parallélogramme : entrée ou sortie</li>
          <li><i class="fv-l-diam"></i> Losange : décision conditionnelle</li>
          <li><i class="fv-l-arrow">→</i> Flèche : ordre d’exécution</li>
        </ul>
        <p class="fv-note">Le losange n’est pas utilisé dans cette séance : le programme ne contient encore aucune condition <code>if</code>. Le rebouclage de <code>loop()</code> est représenté par une flèche de retour, pas par une décision.</p>
      </div>`));

    const algoFold = el("details", "fv-fold");
    algoFold.innerHTML = "<summary>Documentation détaillée : les étapes du programme une par une</summary>";
    const algoFoldBody = el("div", "fv-fold-body");
    if (algoCard) {
      const oldTitle = algoCard.querySelector(".cpp-algo-header h3");
      if (oldTitle) oldTitle.textContent = "Le déroulement détaillé du programme Arduino";
      algoFoldBody.appendChild(algoCard);
    }
    algoFold.appendChild(algoFoldBody);
    body(3).appendChild(algoFold);

    /* ==================== PARTIE 4 — Programmer =========================== */
    const missionButton = document.getElementById("missionActivate");
    if (missionButton) {
      const launcher = el("div", "fv-mission-launcher", `
        <div>
          <h3>Mode Mission — écran complet</h3>
          <p>L’éditeur guidé s’ouvre en pleine largeur avec le jumeau numérique, les objectifs, la validation en direct et tes sauvegardes. Quatre niveaux sont conservés : Guidé, Standard, Autonome et l’éditeur Classique ci-dessous.</p>
        </div>
        <button type="button" class="btn primary fv-mission-open">🚀 Ouvrir le mode Mission</button>`);
      launcher.querySelector(".fv-mission-open").addEventListener("click", () => missionButton.click());
      body(4).appendChild(launcher);
    }
    const editorTitle = editorCard.querySelector(".card-head h2");
    if (editorTitle) editorTitle.textContent = "Écrire le programme C++ Arduino";
    body(4).appendChild(editorCard);

    /* L'aide d'écriture pas à pas reste disponible mais repliée par défaut
       (divulgation progressive) — son contenu n'est pas modifié. */
    const writingGuide = editorCard.querySelector(".python-guide");
    if (writingGuide) {
      const guideFold = el("details", "fv-fold");
      guideFold.innerHTML = "<summary>Aide d’écriture C++ pas à pas (déplier si besoin)</summary>";
      const guideFoldBody = el("div", "fv-fold-body");
      writingGuide.insertAdjacentElement("beforebegin", guideFold);
      guideFoldBody.appendChild(writingGuide);
      guideFold.appendChild(guideFoldBody);
    }

    /* ==================== PARTIE 5 — Tester =============================== */
    const runButton = document.getElementById("runCode");
    const runStatus = document.getElementById("codeRunStatus");
    const testBar = el("div", "fv-testbar", `
      <div class="fv-consigne"><strong>Exécution simulée :</strong> lance la vérification pour contrôler la structure de ton programme et lire les valeurs simulées du Moniteur série.</div>`);
    if (runButton) testBar.appendChild(runButton);
    if (runStatus) testBar.appendChild(runStatus);
    body(5).appendChild(testBar);
    if (testsCard) body(5).appendChild(testsCard);
    if (rubricCard) {
      const rubricFold = el("details", "fv-fold");
      rubricFold.innerHTML = "<summary>Barème de la séance et correction complète (détails)</summary>";
      const rubricFoldBody = el("div", "fv-fold-body");
      rubricFoldBody.appendChild(rubricCard);
      rubricFold.appendChild(rubricFoldBody);
      body(5).appendChild(rubricFold);
    }

    /* ==================== PARTIE 6 — Montage réel ========================= */
    if (realCard) body(6).appendChild(realCard);

    /* ==================== PARTIE 7 — QCM ================================== */
    body(7).appendChild(qcmCard);

    /* Badges Q1…Q20 : transformation purement visuelle des légendes. */
    qcmCard.querySelectorAll(".s1-question > legend").forEach(legend => {
      const textNode = legend.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
      const match = textNode.textContent.match(/^\s*(\d+)\.\s*(.*)$/s);
      if (!match) return;
      const badge = el("span", "fv-qbadge", `Q${match[1]}`);
      textNode.textContent = " " + match[2];
      legend.insertBefore(badge, textNode);
    });
    /* Marquer la bonne réponse pour la présentation de la correction. */
    qcmCard.querySelectorAll(".s1-question").forEach(field => {
      const correct = Number(field.dataset.correct);
      const choices = field.querySelectorAll(":scope > label");
      if (choices[correct]) choices[correct].classList.add("fv-choice-correcte");
    });

    /* Retirer les conteneurs de grille devenus vides (conteneurs seulement). */
    grids.forEach(grid => {
      [...grid.querySelectorAll(":scope > div")].forEach(div => { if (!div.children.length) div.remove(); });
      if (!grid.children.length || [...grid.children].every(c => !c.children.length && !c.textContent.trim())) grid.remove();
    });
    /* La grille interne vidée est retirée ; #s1PracticalSection est conservé
       (les gestionnaires d'origine s'appuient sur cette section). */
    const practicalGrid = document.querySelector(".s1-practical-grid");
    if (practicalGrid && !practicalGrid.children.length) practicalGrid.remove();

    /* ---------- Surlignage de la partie active dans le rail --------------- */
    if ("IntersectionObserver" in window) {
      const links = new Map([...rail.querySelectorAll("a")].map(a => [a.dataset.part, a]));
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const n = entry.target.id.replace("partie-", "");
          if (entry.isIntersecting) {
            links.forEach(link => link.classList.remove("active"));
            links.get(n)?.classList.add("active");
          }
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      PARTS.forEach(p => observer.observe(parts[p.n]));
    }

    document.body.classList.add("fv-vertical");
  };

  /* Les scripts d'origine construisent la page pendant l'analyse (defer) puis
     mission-mode.js termine sur DOMContentLoaded. Cet orchestrateur est chargé
     en dernier : son écouteur DOMContentLoaded s'exécute donc après celui du
     mode Mission, quand toute la page d'origine est en place. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
