/* Remplace le bouton de restauration hérité afin de recharger le modèle incomplet v3. */
"use strict";
(() => {
  const oldButton = document.getElementById("restoreCode");
  const select = document.getElementById("codeModeV2");
  if (!oldButton || !select || oldButton.dataset.v3 === "true") return;
  const button = oldButton.cloneNode(true);
  button.dataset.v3 = "true";
  button.textContent = "↺ Restaurer le modèle incomplet";
  oldButton.replaceWith(button);
  button.addEventListener("click", event => {
    event.preventDefault();
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
})();
