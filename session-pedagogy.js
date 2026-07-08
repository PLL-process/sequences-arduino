"use strict";
(() => {
  const n = Number(document.body.dataset.session || 0);
  if (n !== 1) return;

  const editor = document.getElementById("codeEditor");
  const highlighter = document.getElementById("codeHighlight");
  const correctionPanel = document.getElementById("correctionPanel");
  const correctionButton = document.getElementById("showCorrection");
  if (!editor || !highlighter || !correctionButton) return;

  const fullSolution = `# Lire la grandeur analogique du capteur A0
humidite = lire_humidite()

# Afficher la valeur mesurée
afficher(humidite)

# Maintenir la pompe arrêtée
stop()`;

  const starters = {
    guided: `# La pompe reste arrêtée pendant l'observation
stop()

# Complète les deux instructions
humidite = _____________
___________(humidite)`,
    standard: `# 1. Lire le capteur A0
# 2. Afficher la valeur obtenue
# 3. Maintenir la pompe arrêtée

humidite = __________________

____________________________

____________________________`,
    autonomous: `# Contrat : lire l'humidité sur A0, afficher la valeur,
# puis garantir que la pompe reste arrêtée.

`
  };

  const wrapper = editor.closest(".card-body");
  const modeBar = document.createElement("div");
  modeBar.className = "demo-controls";
  modeBar.innerHTML = `
    <label for="codingMode"><strong>Niveau d’aide :</strong></label>
    <select id="codingMode" class="btn" aria-label="Niveau d’aide pour programmer">
      <option value="guided">Guidé</option>
      <option value="standard" selected>Standard</option>
      <option value="autonomous">Autonome</option>
    </select>
    <span class="chip">La solution n’est pas affichée avant une tentative</span>`;
  wrapper.insertBefore(modeBar, wrapper.firstChild);

  const select = modeBar.querySelector("#codingMode");
  const oldSolutions = [fullSolution, "humidite = lire_humidite()\nafficher(humidite)\nstop()"];
  const shouldReplace = !editor.value.trim() || oldSolutions.some(value => editor.value.trim() === value.trim());
  if (shouldReplace) {
    editor.value = starters.standard;
    editor.dispatchEvent(new Event("input", {bubbles:true}));
  }

  let attempted = !shouldReplace && editor.value.trim().length > 20;
  const initialByMode = {...starters};
  editor.addEventListener("input", () => {
    const starter = initialByMode[select.value];
    attempted = editor.value.trim() !== starter.trim() && editor.value.trim().length > 20;
  });

  select.addEventListener("change", () => {
    const currentStarter = initialByMode[select.value];
    if (attempted && !window.confirm("Changer de niveau remplacera le programme en cours. Continuer ?")) {
      select.value = "standard";
      return;
    }
    editor.value = currentStarter;
    attempted = false;
    editor.dispatchEvent(new Event("input", {bubbles:true}));
    editor.focus();
  });

  correctionButton.addEventListener("click", event => {
    if (attempted) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.alert("Essaie d’abord de compléter ou d’écrire le programme. La correction sera disponible après une véritable tentative.");
  }, true);

  if (correctionPanel) {
    const pre = correctionPanel.querySelector("pre");
    if (pre) pre.textContent = fullSolution;
  }

  const oldRestore = document.getElementById("restoreCode");
  if (oldRestore) {
    const replacement = oldRestore.cloneNode(true);
    oldRestore.replaceWith(replacement);
    replacement.addEventListener("click", () => {
      editor.value = starters[select.value];
      attempted = false;
      editor.dispatchEvent(new Event("input", {bubbles:true}));
      editor.focus();
    });
  }
})();
