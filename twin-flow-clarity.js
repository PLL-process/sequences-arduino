/* Clarification des sens de circulation et des libellés du jumeau numérique. */
"use strict";
(() => {
  // Récupérer le SVG du jumeau déjà construit.
  const stage = document.getElementById("twinStage");
  const svg = stage?.querySelector("svg");
  if (!svg || svg.querySelector("#twinFlowClarityV5")) return;

  // Ajouter un marqueur invisible pour éviter une double exécution.
  const NS = "http://www.w3.org/2000/svg";
  const marker = document.createElementNS(NS, "g");
  marker.id = "twinFlowClarityV5";
  marker.setAttribute("display", "none");
  svg.appendChild(marker);

  // Placer le cartouche de séance à l’extrême gauche du jumeau.
  const sessionTitle = [...svg.querySelectorAll("text")]
    .find(node => /^Séance\s+\d+$/.test(node.textContent.trim()));
  if (sessionTitle) {
    const sessionRect = sessionTitle.previousElementSibling;
    const sessionSubtitle = sessionTitle.nextElementSibling;
    if (sessionRect?.tagName.toLowerCase() === "rect") {
      sessionRect.setAttribute("x", "12");
      sessionRect.setAttribute("y", "8");
      sessionRect.setAttribute("width", "210");
      sessionRect.setAttribute("height", "50");
    }
    sessionTitle.setAttribute("x", "117");
    sessionTitle.setAttribute("y", "31");
    if (sessionSubtitle?.tagName.toLowerCase() === "text") {
      sessionSubtitle.setAttribute("x", "117");
      sessionSubtitle.setAttribute("y", "50");
    }
  }

  // Éloigner légèrement le soleil du réservoir, en diagonale vers la droite et le haut.
  const sun = svg.querySelector('circle[fill="#ffd166"][r="30"]');
  if (sun) {
    sun.setAttribute("cx", "970");
    sun.setAttribute("cy", "30");
  }

  // Placer la borne positive de l’alimentation exactement sur la verticale 5 V.
  const positiveSupplyTerminal = [...svg.querySelectorAll('circle[fill="#ef4444"]')]
    .find(node => node.getAttribute("cy") === "58");
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

  // Retirer les points de jonction et bornes d’alimentation devenus orphelins.
  const orphanTerminalSelectors = [
    'circle[cx="516"][cy="100"]',
    'circle[cx="55"][cy="340"]',
    'circle[cx="241"][cy="170"]',
    'circle[cx="869"][cy="135"]',
    'circle[cx="892"][cy="145"]'
  ];
  orphanTerminalSelectors.forEach(selector => {
    svg.querySelector(selector)?.remove();
  });

  // Placer le libellé 5 V USB à gauche de la verticale rouge.
  const fiveVoltLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "5 V USB");
  if (fiveVoltLabel) {
    fiveVoltLabel.setAttribute("x", "490");
    fiveVoltLabel.setAttribute("y", "77");
    fiveVoltLabel.setAttribute("text-anchor", "end");
  }

  // Ajouter le libellé GND à droite de la verticale noire.
  let supplyGroundLabel = svg.querySelector("#arduinoGroundLabelV5");
  if (!supplyGroundLabel) {
    supplyGroundLabel = document.createElementNS(NS, "text");
    supplyGroundLabel.id = "arduinoGroundLabelV5";
    supplyGroundLabel.setAttribute("class", "twin-supply-ground-label");
    supplyGroundLabel.textContent = "GND";
    svg.appendChild(supplyGroundLabel);
  }
  supplyGroundLabel.setAttribute("x", "526");
  supplyGroundLabel.setAttribute("y", "77");
  supplyGroundLabel.setAttribute("text-anchor", "start");

  // Corriger le sous-titre de l’alimentation Arduino.
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

  // Remplacer le libellé du retour de puissance par 0 V TBT.
  const zeroVoltLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "0 V");
  if (zeroVoltLabel) zeroVoltLabel.textContent = "0 V TBT";

  // Développer l’abréviation TBT dans le cartouche de l’alimentation séparée.
  const separateSupplyGroup = svg.querySelector("#supplyV5");
  if (separateSupplyGroup) {
    const separateSupplyRect = separateSupplyGroup.querySelector("rect");
    const separateSupplyTexts = [...separateSupplyGroup.querySelectorAll("text")];
    const separateSupplyTitle = separateSupplyTexts
      .find(node => node.textContent.trim() === "ALIMENTATION");
    const separateSupplySubtitle = separateSupplyTexts
      .find(node => node.textContent.trim() === "séparée TBT");

    // Élargir le cartouche symétriquement autour de ses bornes centrales.
    if (separateSupplyRect) {
      separateSupplyRect.setAttribute("x", "535");
      separateSupplyRect.setAttribute("width", "180");
    }

    // Conserver le titre centré.
    if (separateSupplyTitle) {
      separateSupplyTitle.setAttribute("x", "625");
      separateSupplyTitle.setAttribute("y", "392");
    }

    // Écrire le développement complet de TBT sur la deuxième ligne.
    if (separateSupplySubtitle) {
      separateSupplySubtitle.textContent = "séparée TBT (Très Basse Tension)";
      separateSupplySubtitle.setAttribute("x", "625");
      separateSupplySubtitle.setAttribute("y", "410");
      separateSupplySubtitle.setAttribute("font-size", "8.5");
      separateSupplySubtitle.setAttribute("font-weight", "800");
    }
  }

  // Ajouter la note pédagogique au centre de l’espace marron libre.
  const note = document.createElementNS(NS, "text");
  note.id = "twinMeasurementNoteV5";
  note.setAttribute("x", "350");
  note.setAttribute("y", "421");
  note.setAttribute("text-anchor", "middle");
  note.setAttribute("class", "twin-measurement-note");

  // Première ligne : nature des liaisons analogiques.
  const lineOne = document.createElementNS(NS, "tspan");
  lineOne.setAttribute("x", "350");
  lineOne.setAttribute("dy", "0");
  lineOne.textContent = "A0, A1 et A2 : liaisons de mesure,";

  // Deuxième ligne : distinction avec le courant d’alimentation.
  const lineTwo = document.createElementNS(NS, "tspan");
  lineTwo.setAttribute("x", "350");
  lineTwo.setAttribute("dy", "13");
  lineTwo.textContent = "pas des chemins principaux de courant.";

  // Troisième ligne : avertissement sur la simplification du dessin.
  const lineThree = document.createElementNS(NS, "tspan");
  lineThree.setAttribute("x", "350");
  lineThree.setAttribute("dy", "13");
  lineThree.textContent = "Alimentation des capteurs non représentée.";

  // Insérer les trois lignes dans le SVG.
  note.append(lineOne, lineTwo, lineThree);
  svg.appendChild(note);
})();
