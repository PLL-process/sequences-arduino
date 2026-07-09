/* Jumeau numérique v5 — mise en page aérée et circulation électrique animée. */
"use strict";
(() => {
  const stage = document.getElementById("twinStage");
  const svg = stage?.querySelector("svg");
  if (!svg || svg.querySelector("#twinLayoutV5")) return;

  const NS = "http://www.w3.org/2000/svg";
  const texts = [...svg.querySelectorAll("text")];
  const findText = value => texts.find(node => node.textContent.trim() === value);
  const tankText = findText("Réservoir");
  const pumpText = findText("POMPE");
  const supplyText = findText("ALIMENTATION");
  const relayText = findText("RELAIS");
  const humidityLabel = findText("Humidité A0");
  const lightLabel = findText("Lumière A1");
  if (!tankText || !pumpText || !supplyText || !relayText) return;

  if (humidityLabel) {
    humidityLabel.textContent = "Capteur d’humidité du sol — A0";
    humidityLabel.setAttribute("x", "18");
    humidityLabel.setAttribute("font-size", "12");
  }
  if (lightLabel) {
    lightLabel.textContent = "Capteur de lumière — A1";
    lightLabel.setAttribute("x", "205");
    lightLabel.setAttribute("font-size", "12");
  }

  svg.setAttribute("viewBox", "0 0 1000 560");
  const background = svg.querySelector('rect[width="900"][height="510"]');
  if (background) { background.setAttribute("width", "1000"); background.setAttribute("height", "560"); }

  const sun = svg.querySelector('circle[fill="#ffd166"][r="38"]');
  if (sun) { sun.setAttribute("cx", "952"); sun.setAttribute("cy", "38"); sun.setAttribute("r", "30"); }

  const tankGroup = tankText.closest("g");
  const pumpGroup = pumpText.closest("g");
  const relayGroup = relayText.closest("g");
  if (!tankGroup || !pumpGroup || !relayGroup) return;

  const tankClone = tankGroup.cloneNode(true);
  tankClone.id = "tankV5";
  tankClone.classList.add("twin-component-gap");
  tankClone.setAttribute("transform", "translate(40 -70)");
  const tankTitle = [...tankClone.querySelectorAll("text")].find(node => node.textContent.trim() === "Réservoir");
  const levelText = [...tankClone.querySelectorAll("text")].find(node => node.textContent.trim() === "Niveau A2");
  if (tankTitle) { tankTitle.setAttribute("x", "830"); tankTitle.setAttribute("y", "105"); }
  if (levelText) {
    levelText.setAttribute("x", "830");
    levelText.setAttribute("y", "377");
    levelText.setAttribute("text-anchor", "middle");
    const pill = document.createElementNS(NS, "rect");
    pill.setAttribute("x", "768"); pill.setAttribute("y", "354");
    pill.setAttribute("width", "124"); pill.setAttribute("height", "32"); pill.setAttribute("rx", "10");
    pill.setAttribute("fill", "#07131fee"); pill.setAttribute("stroke", "#c084fc"); pill.setAttribute("stroke-width", "2");
    levelText.parentNode.insertBefore(pill, levelText);
  }

  const pumpClone = pumpGroup.cloneNode(true);
  pumpClone.id = "pumpV5";
  pumpClone.classList.add("twin-component-gap");
  pumpClone.setAttribute("transform", "translate(20 45)");

  const supplyRect = supplyText.previousElementSibling;
  const supplySubtitle = supplyText.nextElementSibling;
  const supplyGroup = document.createElementNS(NS, "g");
  supplyGroup.id = "supplyV5";
  supplyGroup.classList.add("twin-component-gap");
  supplyGroup.setAttribute("transform", "translate(10 55)");
  [supplyRect, supplyText, supplySubtitle].forEach(node => { if (node) supplyGroup.appendChild(node.cloneNode(true)); });

  tankGroup.style.display = "none";
  pumpGroup.style.display = "none";
  [supplyRect, supplyText, supplySubtitle].forEach(node => { if (node) node.style.display = "none"; });

  const oldPowerLabel = findText("Circuit de puissance TBT");
  if (oldPowerLabel) {
    const oldRect = oldPowerLabel.previousElementSibling;
    oldPowerLabel.style.display = "none";
    if (oldRect) oldRect.style.display = "none";
  }
  const oldWaterLabel = findText("Réservoir → pompe → plante");
  if (oldWaterLabel) oldWaterLabel.style.display = "none";
  const oldPaths = [...svg.querySelectorAll("path")];
  oldPaths.forEach(path => {
    const d = path.getAttribute("d") || "";
    if (d.startsWith("M670 305") || d.startsWith("M882 328")) path.style.display = "none";
    if (d.startsWith("M806 215")) path.setAttribute("d", "M800 210 H561");
  });
  const oldOverlay = svg.querySelector("#powerLinkV3");
  if (oldOverlay) oldOverlay.style.display = "none";

  const defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS(NS, "defs"), svg.firstChild);
  const makeMarker = (id, color) => {
    const marker = document.createElementNS(NS, "marker");
    marker.id = id; marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "8.8"); marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "7"); marker.setAttribute("markerHeight", "7");
    marker.setAttribute("orient", "auto-start-reverse");
    const arrow = document.createElementNS(NS, "path");
    arrow.setAttribute("d", "M0 0 L10 5 L0 10 Z"); arrow.setAttribute("fill", color);
    marker.appendChild(arrow); defs.appendChild(marker);
  };
  makeMarker("currentArrowPlusV5", "#fb7185");
  makeMarker("currentArrowReturnV5", "#60a5fa");
  makeMarker("waterArrowV5", "#67e8f9");

  const layout = document.createElementNS(NS, "g");
  layout.id = "twinLayoutV5";

  const path = (d, className, marker) => {
    const element = document.createElementNS(NS, "path");
    element.setAttribute("d", d); element.setAttribute("class", className);
    if (marker) element.setAttribute("marker-end", `url(#${marker})`);
    return element;
  };

  const waterBase1 = path("M922 258 V325 H970 V470 H800", "twin-water-pipe-v5");
  const waterFlow1 = path("M922 258 V325 H970 V470 H800", "twin-water-flow-v5", "waterArrowV5");
  const waterBase2 = path("M800 480 H735 V510 H180 V420", "twin-water-pipe-v5");
  const waterFlow2 = path("M800 480 H735 V510 H180 V420", "twin-water-flow-v5", "waterArrowV5");

  const plusWire1 = path("M635 425 V333", "twin-current-wire");
  const plusFlow1 = path("M635 425 V333", "twin-current-flow", "currentArrowPlusV5");
  const plusWire2 = path("M670 305 H720 V375 H880 V435", "twin-current-wire");
  const plusFlow2 = path("M670 305 H720 V375 H880 V435", "twin-current-flow", "currentArrowPlusV5");
  const returnWire = path("M880 507 V544 H635 V483", "twin-current-wire twin-current-return-wire");
  const returnFlow = path("M880 507 V544 H635 V483", "twin-current-flow return", "currentArrowReturnV5");

  layout.append(waterBase1, waterFlow1, waterBase2, waterFlow2, plusWire1, plusFlow1, plusWire2, plusFlow2, returnWire, returnFlow);

  const labelGroup = document.createElementNS(NS, "g");
  labelGroup.setAttribute("class", "twin-power-label-v5");
  const labelRect = document.createElementNS(NS, "rect");
  labelRect.setAttribute("x", "735"); labelRect.setAttribute("y", "323");
  labelRect.setAttribute("width", "230"); labelRect.setAttribute("height", "34"); labelRect.setAttribute("rx", "11");
  const label = document.createElementNS(NS, "text");
  label.setAttribute("x", "850"); label.setAttribute("y", "345"); label.setAttribute("text-anchor", "middle");
  label.textContent = "Circuit de puissance TBT";
  labelGroup.append(labelRect, label);
  layout.appendChild(labelGroup);

  const plus = document.createElementNS(NS, "text");
  plus.setAttribute("x", "650"); plus.setAttribute("y", "405"); plus.setAttribute("fill", "#fecaca"); plus.setAttribute("class", "twin-terminal-label"); plus.textContent = "+ TBT";
  const zero = document.createElementNS(NS, "text");
  zero.setAttribute("x", "650"); zero.setAttribute("y", "532"); zero.setAttribute("fill", "#bfdbfe"); zero.setAttribute("class", "twin-terminal-label"); zero.textContent = "0 V";
  const waterLabel = document.createElementNS(NS, "text");
  waterLabel.setAttribute("x", "400"); waterLabel.setAttribute("y", "526"); waterLabel.setAttribute("text-anchor", "middle"); waterLabel.setAttribute("class", "twin-water-label-v5");
  waterLabel.textContent = "Réservoir → pompe → plante";
  layout.append(plus, zero, waterLabel);

  relayGroup.parentNode.insertBefore(layout, relayGroup);
  svg.append(tankClone, pumpClone, supplyGroup);

  const terminal = (cx, cy, fill) => {
    const point = document.createElementNS(NS, "circle");
    point.setAttribute("cx", String(cx));
    point.setAttribute("cy", String(cy));
    point.setAttribute("r", "6");
    point.setAttribute("fill", fill);
    return point;
  };

  const supplyPlus = terminal(635, 425, "#fb7185");
  const supplyZero = terminal(635, 483, "#60a5fa");
  const relayInput = terminal(635, 333, "#fb7185");
  const relayOutput = terminal(670, 305, "#fb7185");
  const relayControl = terminal(600, 301, "#fb923c");
  const pumpPlus = terminal(880, 435, "#fb7185");
  const pumpZero = terminal(880, 507, "#60a5fa");
  const humiditySignal = terminal(97, 340, "#60a5fa");
  const lightSignal = terminal(289, 132, "#facc15");
  const levelSignal = terminal(800, 210, "#c084fc");
  svg.append(supplyPlus, supplyZero, relayInput, relayOutput, relayControl, pumpPlus, pumpZero, humiditySignal, lightSignal, levelSignal);
})();
