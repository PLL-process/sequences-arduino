/* Supprime les anciens effets d'eau devenus redondants avec les nouveaux tuyaux. */
"use strict";

(() => {
  document.querySelectorAll(".water-jet, .water-drop-zone").forEach(element => element.remove());
})();
