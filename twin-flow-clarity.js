/* Clarification des sens de circulation et des libellés du jumeau numérique. */
"use strict";
(() => {
  // Récupérer le SVG du jumeau déjà construit.
  const stage = document.getElementById("twinStage");
  const svg = stage?.querySelector("svg");
  if (!svg || svg.querySelector("#twinFlowClarityV1")) return;

  // Ajouter un marqueur invisible pour éviter une double exécution.
  const NS = "http://www.w3.org/2000/svg";
  const marker = document.createElementNS(NS, "g");
  marker.id = "twinFlowClarityV1";
  marker.setAttribute("display", "none");
  svg.appendChild(marker);

  // Placer la borne positive de l’alimentation exactement sur la verticale 5 V.
  const positiveSupplyTerminal = svg.querySelector('circle[cx="470"][cy="58"][fill="#ef4444"]');
  if (positiveSupplyTerminal) positiveSupplyTerminal.setAttribute("cx", "500");

  // Supprimer le petit segment horizontal inutile : la liaison 5 V devient verticale.
  [...svg.querySelectorAll("path")].forEach(path => {
    if ((path.getAttribute("d") || "") === "M470 58 H500 V160") {
      path.setAttribute("d", "M500 58 V160");
    }
  });

  // Replacer le libellé 5 V à proximité immédiate de sa verticale.
  const fiveVoltLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "5 V USB");
  if (fiveVoltLabel) {
    fiveVoltLabel.setAttribute("x", "510");
    fiveVoltLabel.setAttribute("y", "77");
  }

  // Rapprocher le cartouche du circuit de puissance de son conducteur rose.
  const powerLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "Circuit de puissance TBT");
  if (powerLabel) {
    const powerGroup = powerLabel.closest("g");
    const powerRect = powerGroup?.querySelector("rect");
    if (powerRect) {
      powerRect.setAttribute("x", "730");
      powerRect.setAttribute("y", "338");
      powerRect.setAttribute("width", "235");
      powerRect.setAttribute("height", "30");
      powerRect.setAttribute("rx", "10");
    }
    powerLabel.setAttribute("x", "847.5");
    powerLabel.setAttribute("y", "358");
  }

  // Nommer explicitement le circuit hydraulique.
  const waterLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "Réservoir → pompe → plante");
  if (waterLabel) {
    waterLabel.textContent = "Tuyau d’eau : réservoir → pompe → plante";
    waterLabel.setAttribute("x", "390");
    waterLabel.setAttribute("y", "530");
  }
})();
