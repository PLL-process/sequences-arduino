/* TechnoQuest — améliore la lisibilité du circuit de puissance dans le jumeau. */
"use strict";
(() => {
  const id = Number(document.body.dataset.session || 0);
  const stage = document.getElementById("twinStage");
  const svg = stage?.querySelector("svg");
  if (!svg || id < 1 || id > 8 || svg.querySelector("#powerLinkV3")) return;

  const badgeTitle = [...svg.querySelectorAll("text")].find(text => text.textContent.trim() === `Séance ${id}`);
  const badgeSubtitle = badgeTitle?.nextElementSibling;
  const badgeRect = badgeTitle?.previousElementSibling;
  if (badgeRect?.tagName.toLowerCase() === "rect") {
    badgeRect.setAttribute("x", "342"); badgeRect.setAttribute("y", "76");
    badgeRect.setAttribute("width", "190"); badgeRect.setAttribute("height", "62");
    badgeTitle.setAttribute("x", "437"); badgeTitle.setAttribute("y", "102");
    badgeSubtitle?.setAttribute("x", "437"); badgeSubtitle?.setAttribute("y", "124");
  }

  const updateComponentButtons = () => {
    const componentButtons = [...document.querySelectorAll(".component-nav button")];
    componentButtons.forEach(button => {
      if (button.textContent.includes("Relais")) button.dataset.info = "Relais D6 : la commande orange vient de l’Arduino ; les contacts du relais distribuent ensuite l’énergie TBT vers la pompe par la liaison rouge.";
      if (button.textContent.includes("Pompe")) button.dataset.info = "Pompe : actionneur alimenté par le circuit de puissance rouge, clairement représenté au-dessus de la pompe.";
    });
  };
  const hasPowerLabel = [...svg.querySelectorAll("text")].some(text => text.textContent.includes("Circuit de puissance TBT"));
  if (hasPowerLabel) {
    updateComponentButtons();
    return;
  }

  const ns = "http://www.w3.org/2000/svg";
  const group = document.createElementNS(ns, "g");
  group.id = "powerLinkV3";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Circuit de puissance entre l’alimentation, le relais et la pompe");

  const path = (d, width = 7) => {
    const element = document.createElementNS(ns, "path");
    element.setAttribute("d", d); element.setAttribute("fill", "none");
    element.setAttribute("stroke", "#ef4444"); element.setAttribute("stroke-width", String(width));
    element.setAttribute("stroke-linecap", "round"); element.setAttribute("stroke-linejoin", "round");
    return element;
  };

  const supplyRelay = path("M560 392 V352 H590 V333", 6);
  const relayPump = path("M630 333 V365 H760 V384", 7);
  const arrow = document.createElementNS(ns, "path");
  arrow.setAttribute("d", "M751 378 L760 392 L769 378 Z"); arrow.setAttribute("fill", "#ef4444");

  const labelBg = document.createElementNS(ns, "rect");
  labelBg.setAttribute("x", "662"); labelBg.setAttribute("y", "338");
  labelBg.setAttribute("width", "178"); labelBg.setAttribute("height", "26"); labelBg.setAttribute("rx", "8");
  labelBg.setAttribute("fill", "#07131f"); labelBg.setAttribute("stroke", "#ef4444"); labelBg.setAttribute("stroke-width", "1.5");

  const label = document.createElementNS(ns, "text");
  label.setAttribute("x", "751"); label.setAttribute("y", "356"); label.setAttribute("text-anchor", "middle");
  label.setAttribute("fill", "#fecaca"); label.setAttribute("font-size", "12"); label.setAttribute("font-weight", "900");
  label.textContent = "Circuit de puissance TBT";

  group.append(supplyRelay, relayPump, arrow, labelBg, label);
  svg.appendChild(group);

  updateComponentButtons();
})();
