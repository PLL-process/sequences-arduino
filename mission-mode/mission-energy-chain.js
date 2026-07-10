/* TechnoQuest — apprentissage différencié de la chaîne d'énergie, séance 3. */
"use strict";

(() => {
  const STORAGE_KEY = "technoquest-energy-level-v1-s3";
  const LEVELS = ["guided", "supported", "autonomous"];
  const FUNCTIONS = ["", "Alimenter", "Distribuer", "Convertir", "Transmettre / agir"];
  const COMPONENTS = [
    "",
    "Alimentation séparée 12 V DC",
    "Contacts de puissance du relais",
    "Pompe à eau",
    "Tuyau puis sol",
    "Arduino"
  ];
  const ANSWERS = [
    { component: COMPONENTS[1], role: FUNCTIONS[1] },
    { component: COMPONENTS[2], role: FUNCTIONS[2] },
    { component: COMPONENTS[3], role: FUNCTIONS[3] },
    { component: COMPONENTS[4], role: FUNCTIONS[4] }
  ];

  const escapeHtml = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const levelLabel = level => level === "supported"
    ? "Accompagné"
    : level === "autonomous"
      ? "Autonome"
      : "Guidé";

  const optionList = (values, placeholder, selected = "") => values.map((value, index) => {
    const label = index === 0 ? placeholder : value;
    return `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");

  function block(role, component, detail) {
    return `<article class="energy-block"><span class="energy-function">${escapeHtml(role)}</span><strong>${escapeHtml(component)}</strong><small>${escapeHtml(detail)}</small></article>`;
  }

  function fullDiagram(level) {
    const powerBlocks = level === "guided"
      ? [
          ["Alimenter", "Alimentation séparée 12 V DC", "Fournit l’énergie électrique"],
          ["Distribuer", "Contacts du relais", "Autorisent ou coupent le courant"],
          ["Convertir", "Pompe à eau", "Électrique → mécanique et hydraulique"],
          ["Transmettre / agir", "Tuyau puis sol", "L’eau est conduite jusqu’aux racines"]
        ]
      : level === "supported"
        ? [
            ["À retrouver", "Alimentation séparée 12 V DC", "Source de l’énergie électrique"],
            ["À retrouver", "Contacts du relais", "Ouvrent ou ferment le circuit"],
            ["À retrouver", "Pompe à eau", "Change la forme de l’énergie"],
            ["À retrouver", "Tuyau puis sol", "Conduisent l’eau jusqu’aux racines"]
          ]
        : ANSWERS.map((answer, index) => ["À reconstruire", `Position ${index + 1}`, "Choisir le constituant et sa fonction"]);

    return `<section class="energy-lane" aria-labelledby="informationLaneTitle">
      <h3 id="informationLaneTitle">Chaîne d’information — elle transporte des signaux</h3>
      <div class="energy-flow">
        ${block("Acquérir", "Capteur d’humidité", "Produit une mesure sur A0")}
        <span class="energy-flow-arrow" aria-hidden="true">→</span>
        ${block("Traiter / décider", "Arduino", "Compare la mesure aux seuils")}
        <span class="energy-flow-arrow" aria-hidden="true">→</span>
        ${block("Communiquer", "Sortie D6", "Envoie un état logique LOW ou HIGH")}
        <span class="energy-flow-arrow" aria-hidden="true">⇢</span>
        ${block("Commander", "Bobine du relais", "Actionne mécaniquement les contacts")}
      </div>
    </section>
    <div class="energy-command-link">D6 transmet un ordre de faible puissance ; les contacts du relais commutent la puissance de la pompe.</div>
    <section class="energy-lane energy-lane--power" aria-labelledby="powerLaneTitle">
      <h3 id="powerLaneTitle">Chaîne d’énergie — elle transporte la puissance</h3>
      <div class="energy-flow">
        ${block(...powerBlocks[0])}
        <span class="energy-flow-arrow" aria-hidden="true">→</span>
        ${block(...powerBlocks[1])}
        <span class="energy-flow-arrow" aria-hidden="true">→</span>
        ${block(...powerBlocks[2])}
        <span class="energy-flow-arrow" aria-hidden="true">→</span>
        ${block(...powerBlocks[3])}
      </div>
    </section>`;
  }

  function supportedExercise() {
    return `<section class="energy-exercise" aria-labelledby="energyExerciseTitle">
      <h3 id="energyExerciseTitle">À toi : associe chaque fonction au bon constituant</h3>
      <p>Les constituants sont déjà dans l’ordre. Complète leurs fonctions, puis vérifie.</p>
      <div class="energy-answer-grid">
        ${ANSWERS.map((answer, index) => `<div class="energy-answer" data-energy-answer="${index}">
          <label>${escapeHtml(answer.component)}</label>
          <select data-energy-role="${index}" aria-label="Fonction de ${escapeHtml(answer.component)}">${optionList(FUNCTIONS, "Choisir la fonction")}</select>
        </div>`).join("")}
      </div>
      ${exerciseActions()}
    </section>`;
  }

  function autonomousExercise() {
    return `<section class="energy-exercise" aria-labelledby="energyExerciseTitle">
      <h3 id="energyExerciseTitle">Défi autonome : reconstruis la chaîne de puissance</h3>
      <p>Choisis le constituant et sa fonction pour chaque position. Attention : l’Arduino est un distracteur, car il ne fournit pas l’énergie de la pompe.</p>
      <div class="energy-answer-grid">
        ${ANSWERS.map((answer, index) => `<div class="energy-answer" data-energy-answer="${index}">
          <label for="energyComponent${index}">Position ${index + 1}</label>
          <select id="energyComponent${index}" data-energy-component="${index}" aria-label="Constituant en position ${index + 1}">${optionList(COMPONENTS, "Choisir le constituant")}</select>
          <select data-energy-role="${index}" aria-label="Fonction en position ${index + 1}">${optionList(FUNCTIONS, "Choisir la fonction")}</select>
        </div>`).join("")}
      </div>
      ${exerciseActions()}
    </section>`;
  }

  function exerciseActions() {
    return `<div class="energy-exercise-actions">
      <button class="energy-check-button" type="button" data-energy-action="check">✓ Vérifier la chaîne</button>
      <button class="energy-reset-button" type="button" data-energy-action="reset">↺ Effacer mes réponses</button>
    </div>
    <p class="energy-feedback" aria-live="polite">Complète les quatre positions avant de vérifier.</p>`;
  }

  function bodyForLevel(level) {
    if (level === "guided") {
      return `${fullDiagram(level)}
        <p class="energy-trace"><strong>Trace écrite :</strong> l’Arduino traite l’information et commande la bobine du relais par D6. L’alimentation séparée fournit la puissance ; les contacts du relais la distribuent à la pompe, qui convertit l’énergie électrique en énergie mécanique et hydraulique.</p>`;
    }
    return `${fullDiagram(level)}${level === "supported" ? supportedExercise() : autonomousExercise()}`;
  }

  function componentHtml(level) {
    return `<div class="energy-learning-head">
      <div><p class="energy-learning-kicker">Partie Comprendre · Chaînes fonctionnelles</p><h2>Qui commande ? Qui fournit la puissance ?</h2><p>Observe les deux voies, puis augmente progressivement le niveau d’autonomie pour reconstruire la chaîne d’énergie du jardin connecté.</p></div>
      <span class="energy-learning-badge">⚡ Puissance ≠ signal</span>
    </div>
    <div class="energy-learning-toolbar" role="group" aria-label="Niveau d’aide pour la chaîne d’énergie">
      ${LEVELS.map(value => `<button class="energy-level-button${value === level ? " is-active" : ""}" type="button" data-energy-level="${value}" aria-pressed="${value === level}">${levelLabel(value)}</button>`).join("")}
    </div>
    <div class="energy-learning-body">
      <p class="energy-separation-note"><span aria-hidden="true">!</span><strong>L’Arduino ne fournit jamais l’énergie à la pompe. Il envoie seulement un ordre logique à la bobine du relais ; les contacts du relais ouvrent ou ferment le circuit de puissance alimenté séparément.</strong></p>
      ${bodyForLevel(level)}
    </div>`;
  }

  function render(card, level) {
    card.dataset.energyLevel = level;
    card.innerHTML = componentHtml(level);
    bind(card, level);
  }

  function bind(card, level) {
    card.querySelectorAll("[data-energy-level]").forEach(button => {
      button.addEventListener("click", () => {
        const next = button.dataset.energyLevel;
        localStorage.setItem(STORAGE_KEY, next);
        render(card, next);
      });
    });

    card.querySelector('[data-energy-action="check"]')?.addEventListener("click", () => checkAnswers(card, level));
    card.querySelector('[data-energy-action="reset"]')?.addEventListener("click", () => {
      card.querySelectorAll(".energy-answer select").forEach(select => { select.value = ""; });
      card.querySelectorAll(".energy-answer").forEach(answer => answer.classList.remove("is-correct", "is-wrong"));
      const feedback = card.querySelector(".energy-feedback");
      feedback.className = "energy-feedback";
      feedback.textContent = "Complète les quatre positions avant de vérifier.";
    });
  }

  function checkAnswers(card, level) {
    let correct = 0;
    let complete = true;

    ANSWERS.forEach((answer, index) => {
      const wrapper = card.querySelector(`[data-energy-answer="${index}"]`);
      const role = card.querySelector(`[data-energy-role="${index}"]`)?.value || "";
      const component = level === "autonomous"
        ? card.querySelector(`[data-energy-component="${index}"]`)?.value || ""
        : answer.component;
      const isComplete = Boolean(role && component);
      const isCorrect = role === answer.role && component === answer.component;
      complete = complete && isComplete;
      correct += Number(isCorrect);
      wrapper?.classList.toggle("is-correct", isCorrect);
      wrapper?.classList.toggle("is-wrong", isComplete && !isCorrect);
    });

    const feedback = card.querySelector(".energy-feedback");
    if (!complete) {
      feedback.className = "energy-feedback is-error";
      feedback.textContent = "Il reste au moins une réponse à compléter.";
    } else if (correct === ANSWERS.length) {
      feedback.className = "energy-feedback is-success";
      feedback.textContent = "Bravo : la puissance suit bien alimentation séparée → contacts du relais → pompe → tuyau et sol.";
    } else {
      feedback.className = "energy-feedback is-error";
      feedback.textContent = `${correct} réponse${correct > 1 ? "s" : ""} correcte${correct > 1 ? "s" : ""} sur 4. Repère où l’énergie est fournie, distribuée, convertie puis transmise.`;
    }
  }

  function initialize() {
    if (Number(document.body.dataset.session) !== 3 || document.querySelector(".energy-learning-card")) return;
    const anchor = document.querySelector('.algorithm-premium-card[data-session="3"]');
    if (!anchor?.parentNode) return;
    const card = document.createElement("article");
    card.className = "card energy-learning-card";
    card.dataset.session = "3";
    anchor.insertAdjacentElement("afterend", card);
    const saved = localStorage.getItem(STORAGE_KEY);
    render(card, LEVELS.includes(saved) ? saved : "guided");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(initialize, 140), { once: true });
  } else {
    window.setTimeout(initialize, 140);
  }
})();
