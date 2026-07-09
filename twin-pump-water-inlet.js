/* Repositionnement de la pompe et clarification de son arrivée d’eau. */
"use strict";
(() => {
  // Récupérer le SVG du jumeau numérique déjà construit.
  const stage = document.getElementById("twinStage");
  const svg = stage?.querySelector("svg");
  if (!svg || svg.querySelector("#twinPumpWaterInletV1")) return;

  // Ajouter un marqueur invisible afin d’éviter une double exécution.
  const NS = "http://www.w3.org/2000/svg";
  const marker = document.createElementNS(NS, "g");
  marker.id = "twinPumpWaterInletV1";
  marker.setAttribute("display", "none");
  svg.appendChild(marker);

  // Déplacer la pompe légèrement vers la droite.
  const pump = svg.querySelector("#pumpV5");
  if (pump) pump.setAttribute("transform", "translate(35 45)");

  // Remplacer l’arrivée d’eau par un L inversé se terminant à droite de la pompe.
  const oldInletRoute = "M922 258 V325 H970 V470 H800";
  const newInletRoute = "M922 258 H995 V470 H987";

  // Recaler aussi la sortie de pompe vers la plante après le déplacement de la pompe.
  const oldOutletRoute = "M800 480 H735 V510 H180 V420";
  const newOutletRoute = "M815 480 H735 V510 H180 V420";

  // Adapter les deux couches du tuyau : fond sombre et flux cyan animé.
  [...svg.querySelectorAll("path")].forEach(path => {
    const route = path.getAttribute("d") || "";
    if (route === oldInletRoute) path.setAttribute("d", newInletRoute);
    if (route === oldOutletRoute) path.setAttribute("d", newOutletRoute);
  });

  // Déplacer les deux bornes électriques de la pompe avec son dessin.
  const pumpPlus = svg.querySelector('circle[cx="880"][cy="435"][fill="#fb7185"]');
  const pumpZero = svg.querySelector('circle[cx="880"][cy="507"][fill="#60a5fa"]');
  if (pumpPlus) pumpPlus.setAttribute("cx", "895");
  if (pumpZero) pumpZero.setAttribute("cx", "895");

  // Recaler les liaisons électriques afin qu’elles restent connectées à la pompe.
  [...svg.querySelectorAll("path")].forEach(path => {
    const route = path.getAttribute("d") || "";
    if (route === "M670 305 H720 V375 H880 V435") {
      path.setAttribute("d", "M670 305 H720 V375 H895 V435");
    }
    if (route === "M880 507 V544 H635 V483") {
      path.setAttribute("d", "M895 507 V544 H635 V483");
    }
  });
})();
