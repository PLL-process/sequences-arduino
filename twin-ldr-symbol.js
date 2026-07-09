/* Symbole électrique vectoriel de la photorésistance LDR. */
"use strict";
(() => {
  // Récupérer le jumeau numérique déjà construit par twin-layout-v5.js.
  const stage = document.getElementById("twinStage");
  const svg = stage?.querySelector("svg");
  if (!svg || svg.querySelector("#ldrElectricalSymbolV5")) return;

  // Retrouver le libellé du capteur de lumière et son groupe SVG.
  const lightLabel = [...svg.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "Capteur de lumière — A1");
  const lightGroup = lightLabel?.closest("g");
  if (!lightGroup) return;

  // Masquer l’ancien texte LDR pour libérer l’intérieur du cercle.
  const oldLdrText = [...lightGroup.querySelectorAll("text")]
    .find(node => node.textContent.trim() === "LDR");
  if (oldLdrText) oldLdrText.style.display = "none";

  // Replacer les deux bornes sur les extrémités gauche et droite du cercle.
  const groundTerminal = svg.querySelector('circle[cx="282"][cy="153"][fill="#111827"]');
  const signalTerminal = svg.querySelector('circle[cx="282"][cy="187"][fill="#facc15"]');
  if (groundTerminal) {
    groundTerminal.setAttribute("cx", "241");
    groundTerminal.setAttribute("cy", "170");
  }
  if (signalTerminal) {
    signalTerminal.setAttribute("cx", "289");
    signalTerminal.setAttribute("cy", "170");
  }

  // Rerouter le GND vers la borne gauche sans traverser le composant.
  const oldGroundRoute = "M516 58 V160 M516 100 H20 V340 H55 M516 100 H315 V153 H282";
  const newGroundRoute = "M516 58 V160 M516 100 H20 V340 H55 M516 100 H220 V170 H241";
  [...svg.querySelectorAll("path")].forEach(path => {
    if ((path.getAttribute("d") || "") === oldGroundRoute) {
      path.setAttribute("d", newGroundRoute);
    }
  });

  // Rerouter le signal A1 depuis la borne droite jusqu’à l’entrée analogique.
  [...svg.querySelectorAll("path")].forEach(path => {
    if ((path.getAttribute("d") || "") === "M282 187 H300 V256 H313") {
      path.setAttribute("d", "M289 170 H313 V256");
    }
  });

  // Créer un petit marqueur de flèche pour représenter la lumière incidente.
  const NS = "http://www.w3.org/2000/svg";
  const defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild);
  if (!defs.querySelector("#ldrLightArrowV5")) {
    const marker = document.createElementNS(NS, "marker");
    marker.id = "ldrLightArrowV5";
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "8.5");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "5");
    marker.setAttribute("markerHeight", "5");
    marker.setAttribute("orient", "auto");
    const arrowHead = document.createElementNS(NS, "path");
    arrowHead.setAttribute("d", "M0 0 L10 5 L0 10 Z");
    arrowHead.setAttribute("fill", "#111827");
    marker.appendChild(arrowHead);
    defs.appendChild(marker);
  }

  // Créer le symbole électrique complet à l’intérieur du cercle jaune.
  const symbol = document.createElementNS(NS, "g");
  symbol.id = "ldrElectricalSymbolV5";
  symbol.setAttribute("fill", "none");
  symbol.setAttribute("stroke", "#111827");
  symbol.setAttribute("stroke-width", "2.7");
  symbol.setAttribute("stroke-linecap", "round");
  symbol.setAttribute("stroke-linejoin", "round");

  // Dessiner la résistance en zigzag de la borne GND à la borne A1.
  const resistor = document.createElementNS(NS, "path");
  resistor.setAttribute("d", "M241 170 H246 L250 162 L256 178 L262 162 L268 178 L274 162 L280 178 L284 170 H289");

  // Dessiner les deux flèches lumineuses dirigées vers la résistance.
  const lightArrowOne = document.createElementNS(NS, "path");
  lightArrowOne.setAttribute("d", "M247 149 L256 159");
  lightArrowOne.setAttribute("marker-end", "url(#ldrLightArrowV5)");
  const lightArrowTwo = document.createElementNS(NS, "path");
  lightArrowTwo.setAttribute("d", "M258 147 L267 157");
  lightArrowTwo.setAttribute("marker-end", "url(#ldrLightArrowV5)");

  // Ajouter le symbole dans le groupe du LDR.
  symbol.append(resistor, lightArrowOne, lightArrowTwo);
  lightGroup.appendChild(symbol);
})();
