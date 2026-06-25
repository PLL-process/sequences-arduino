/* Améliore la lisibilité du cartouche A2 et du libellé du réservoir. */
"use strict";

(() => {
  const garden = document.querySelector(".garden");
  const foreground = garden?.querySelector(".hardware-foreground-overlay");
  const tank = garden?.querySelector(".tank");
  if (!garden || !foreground || !tank) return;

  /* Supprime l'ancien cartouche de niveau d'eau, trop étroit et visuellement confus. */
  [...foreground.querySelectorAll("g")].forEach(group => {
    const text = group.textContent.replace(/\s+/g, " ").trim();
    if (text.includes("Capteur de niveau d’eau") || text.includes("Réservoir → entrée analogique A2")) {
      group.remove();
    }
  });

  /* Masque le vieux libellé vertical du réservoir afin d'éviter les superpositions. */
  const oldTankLabel = tank.querySelector("span");
  if (oldTankLabel) oldTankLabel.style.display = "none";

  const style = document.createElement("style");
  style.id = "technoquest-reservoir-label-fix-styles";
  style.textContent = `
    .reservoir-clear-label text {
      font-family: Verdana, Arial, sans-serif;
      stroke: none !important;
      paint-order: normal !important;
    }
    .reservoir-clear-title {
      fill: #14352d;
      font-size: 12px;
      font-weight: 900;
    }
    .reservoir-clear-subtitle {
      fill: #31564e;
      font-size: 9px;
      font-weight: 700;
    }
    .reservoir-clear-badge {
      fill: #ffffff;
      font-size: 10px;
      font-weight: 900;
    }
    .reservoir-name-label {
      fill: #14352d;
      font-size: 10px;
      font-weight: 900;
    }
    @media(max-width:460px){
      .reservoir-clear-title{font-size:10px}
      .reservoir-clear-subtitle{font-size:7.5px}
      .reservoir-name-label{font-size:8px}
    }
  `;
  document.head.appendChild(style);

  const ns = "http://www.w3.org/2000/svg";
  const group = document.createElementNS(ns, "g");
  group.setAttribute("class", "reservoir-clear-label");
  group.innerHTML = `
    <!-- Cartouche blanc entièrement lisible, placé dans le ciel -->
    <g>
      <rect x="354" y="78" width="202" height="76" rx="12" fill="#ffffff" stroke="#14352d" stroke-width="2.5"/>
      <rect x="549" y="82" width="6" height="68" rx="3" fill="#7d4cc2"/>
      <rect x="504" y="90" width="38" height="24" rx="7" fill="#6d3da8" stroke="#d9c3ff" stroke-width="1.5"/>
      <text class="reservoir-clear-badge" x="514" y="106">A2</text>
      <text class="reservoir-clear-title" x="368" y="101">Capteur de niveau</text>
      <text class="reservoir-clear-title" x="368" y="119">d’eau du réservoir</text>
      <text class="reservoir-clear-subtitle" x="368" y="139">Mesure transmise à l’entrée analogique A2</text>
      <path d="M473 154 C493 184 514 216 530 258" fill="none" stroke="#7d4cc2" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 6"/>
    </g>

    <!-- Libellé horizontal du réservoir, sur fond blanc -->
    <g>
      <rect x="496" y="224" width="91" height="24" rx="8" fill="#ffffff" stroke="#14352d" stroke-width="2"/>
      <text class="reservoir-name-label" x="505" y="240">Réservoir d’eau</text>
    </g>
  `;
  foreground.appendChild(group);
})();
