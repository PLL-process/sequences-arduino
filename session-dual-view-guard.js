/* TechnoQuest — garde-fou pédagogique pour les deux vues. */
"use strict";

(() => {
  const sessionId = Number(document.body.dataset.session || 0);
  if (sessionId < 1 || sessionId > 8) return;

  const enhance = () => {
    const toggle = document.getElementById("representationToggle");
    const twinButton = toggle?.querySelector('[data-view="twin"]');
    const realButton = toggle?.querySelector('[data-view="real"]');
    const twinView = document.getElementById("twinViewV2");
    const realView = document.getElementById("realViewV2");
    const editor = document.getElementById("codeEditor");

    if (twinButton) twinButton.textContent = "Schéma / Jumeau numérique";
    if (realButton) realButton.textContent = "Voir le montage réel";

    if (toggle && !document.getElementById("representationHelp")) {
      const help = document.createElement("p");
      help.id = "representationHelp";
      help.className = "representation-help";
      help.innerHTML = "<strong>Deux regards complémentaires :</strong> utilise d’abord le schéma pour comprendre les fonctions et les flux, puis la vue réelle pour reconnaître le matériel.";
      toggle.insertAdjacentElement("afterend", help);
    }

    if (realView && !realView.querySelector(".solution-mask")) {
      realView.classList.add("real-view-protected");
      const mask = document.createElement("div");
      mask.className = "solution-mask";
      mask.innerHTML = `<strong>À toi de programmer</strong><span>Les éventuels extraits de code présents dans l’illustration sont volontairement masqués. Construis ta solution dans l’éditeur.</span>`;
      realView.appendChild(mask);
    }

    // La vue pédagogique est toujours la vue d'entrée.
    if (twinButton && twinView && realView) {
      twinButton.click();
      twinView.classList.remove("hidden");
      realView.classList.add("hidden");
    }

    const hero = document.querySelector(".session-hero");
    if (hero && !hero.querySelector(".activity-badge")) {
      const badge = document.createElement("p");
      badge.className = "activity-badge";
      badge.textContent = "Activité élève évaluée — la présentation générale ne contient aucun travail à rendre";
      hero.querySelector("div")?.appendChild(badge);
    }

    // Sécurité supplémentaire : un ancien programme complet ne doit pas réapparaître avant tentative.
    if (editor) {
      const stateKey = "technoquest-premium-v1";
      let state = {};
      try { state = JSON.parse(localStorage.getItem(stateKey) || "{}"); } catch (error) { state = {}; }
      const current = state.sessions?.[sessionId] || {};
      if (!current.attemptedV2 && !current.correction && !editor.value.includes("____") && editor.value.trim().split("\n").length > 5) {
        const mode = document.getElementById("codeModeV2");
        if (mode) mode.dispatchEvent(new Event("change", {bubbles:true}));
      }
    }
  };

  window.setTimeout(enhance, 0);
  window.addEventListener("load", enhance, {once:true});
})();
