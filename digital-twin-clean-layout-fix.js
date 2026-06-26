/* Ajuste la séparation visuelle entre le relais, l'alimentation et la pompe. */
"use strict";

(() => {
  const overlay = document.querySelector(".twin-annotation-layer");
  if (!overlay) return;

  const relayTitle = [...overlay.querySelectorAll("text")].find(element => element.textContent.trim() === "Relais (D6)");
  const relayGroup = relayTitle?.closest("g");
  if (relayGroup) relayGroup.setAttribute("transform", "translate(0 -18)");

  const d6Wires = overlay.querySelectorAll(".twin-wire-d6");
  if (d6Wires[0]) d6Wires[0].setAttribute("d", "M415 214 C430 222 438 238 438 256");
  if (d6Wires[1]) d6Wires[1].setAttribute("d", "M443 295 C443 299 443 302 443 306");

  const powerPlus = overlay.querySelector(".twin-power-plus");
  const powerMinus = overlay.querySelector(".twin-power-minus");
  powerPlus?.setAttribute("d", "M391 280 C400 276 404 270 410 267");
  powerMinus?.setAttribute("d", "M391 299 C399 295 404 289 410 286");
})();
