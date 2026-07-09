/* Clarification des sens de circulation et des libellés du jumeau numérique. */
"use strict";
(() => {
  // Récupérer le SVG du jumeau déjà construit.
  const stage = document.getElementById("twinStage");
  const svg = stage?.querySelector("svg");
  if (!svg || svg.querySelector("#twinFlowClarityV2")) return;

  // Ajouter un marqueur invisible pour éviter une double exécution.
  const NS = "http://www.w3.org/2000/svg";
  const marker = document.createElementNS(NS, "g");
  marker.id = "twinFlowClarityV2";
  marker.setAttribute("display", "none");
  svg.appendChild(marker);

  // Placer la borne positive de l’alimentation exactement sur la verticale 5 V.
  const positiveSupplyTerminal = svg.querySelector('circle[cx="470"][cy="58"][fill="#ef4444"]');
  if (positiveSupplyTerminal) positiveSupplyTerminal.setAttribute("cx", "500");

  // Simplifier les conducteurs : conserver uniquement l’alimentation de la carte Arduino.
  [...svg.querySelectorAll("path")].forEach(path => {
    const route = path.getAttribute("d") || "";

    // Transformer la liaison 5 V en verticale propre entre l’alimentation et la carte.
    if (route === "M470 58 H500 V160") {
      path.setAttribute("d", "M500 58 V160");
    }

    // Supprimer toutes les branches GND allant vers les capteurs.
    if (route.startsWith("M516 58 V160")) {
      path.setAttribute("d", "M516 58 V160");
    }

    // Retirer les conducteurs VCC et GND propres au capteur de niveau.
    if (
      path.classList.contains("twin-level-vcc-wire") ||
      path.classList.contains("twin-level-vcc-flow") ||
      path.classList.contains("twin-level-ground-wire") ||
      path.classList.contains("twin-level-ground-flow")
    ) {
      path.remove();
    }
  });

  // Replacer le libellé 5 V à proximité immédiate de sa verticale.
  const fiveVoltLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "5 V USB");
  if (fiveVoltLabel) {
    fiveVoltLabel.setAttribute("x", "510");
    fiveVoltLabel.setAttribute("y", "77");
  }

  // Corriger le sous-titre de l’alimentation afin de ne plus suggérer les fils des capteurs.
  const supplySubtitle = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "5 V USB · capteurs via Arduino");
  if (supplySubtitle) {
    supplySubtitle.textContent = "5 V USB · alimentation de la carte";
  }

  // Retirer l’ancien libellé GND commun, devenu inutile après la simplification.
  const groundLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "GND commun capteurs");
  if (groundLabel) groundLabel.remove();

  // Réduire les marges latérales du cartouche de puissance et l’éloigner du tuyau d’eau.
  const powerLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "Circuit de puissance TBT");
  if (powerLabel) {
    const powerGroup = powerLabel.closest("g");
    const powerRect = powerGroup?.querySelector("rect");
    if (powerRect) {
      powerRect.setAttribute("x", "742");
      powerRect.setAttribute("y", "338");
      powerRect.setAttribute("width", "205");
      powerRect.setAttribute("height", "30");
      powerRect.setAttribute("rx", "10");
    }
    powerLabel.setAttribute("x", "844.5");
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

  // Ajouter une note pédagogique en bas à droite du jumeau numérique.
  const note = document.createElementNS(NS, "text");
  note.id = "twinMeasurementNoteV2";
  note.setAttribute("x", "690");
  note.setAttribute("y", "494");
  note.setAttribute("class", "twin-measurement-note");

  // Première ligne : nature des liaisons analogiques.
  const lineOne = document.createElementNS(NS, "tspan");
  lineOne.setAttribute("x", "690");
  lineOne.setAttribute("dy", "0");
  lineOne.textContent = "A0, A1 et A2 : liaisons de mesure,";

  // Deuxième ligne : distinction avec le courant d’alimentation.
  const lineTwo = document.createElementNS(NS, "tspan");
  lineTwo.setAttribute("x", "690");
  lineTwo.setAttribute("dy", "12");
  lineTwo.textContent = "pas des chemins principaux de courant.";

  // Troisième ligne : sens conventionnel du courant.
  const lineThree = document.createElementNS(NS, "tspan");
  lineThree.setAttribute("x", "690");
  lineThree.setAttribute("dy", "12");
  lineThree.textContent = "Sens conventionnel : du + vers le −.";

  // Quatrième ligne : avertissement sur la simplification du dessin.
  const lineFour = document.createElementNS(NS, "tspan");
  lineFour.setAttribute("x", "690");
  lineFour.setAttribute("dy", "12");
  lineFour.textContent = "Alimentation des capteurs non représentée.";

  // Insérer les quatre lignes dans le SVG.
  note.append(lineOne, lineTwo, lineThree, lineFour);
  svg.appendChild(note);
})();
