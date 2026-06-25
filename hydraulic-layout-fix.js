/* Aligne la pompe entre les deux tuyaux et relie clairement le relais à la pompe. */
"use strict";

(() => {
  const garden = document.querySelector(".garden");
  const overlay = garden?.querySelector(".hardware-overlay");
  const pump = document.getElementById("pump");
  if (!garden || !overlay || !pump) return;

  const setPath = (selector, index, d) => {
    const element = overlay.querySelectorAll(selector)[index];
    if (element) element.setAttribute("d", d);
  };

  /* Le centre hydraulique de la pompe se situe autour de y = 330 dans le viewBox. */
  const intakePath = "M500 330 H472";
  const outletPath = "M394 330 H354 Q336 330 336 346 H278 Q255 346 255 359 H238";

  [".pipe-shadow", ".pipe-body", ".pipe-water"].forEach(selector => {
    setPath(selector, 0, intakePath);
    setPath(selector, 1, outletPath);
  });
  setPath(".pipe-highlight", 0, "M500 326 H472");
  setPath(".pipe-highlight", 1, "M394 326 H354 Q336 326 336 342 H278 Q251 342 251 359 H238");

  /* D6 commande électriquement le relais, puis le relais alimente la pompe. */
  const d6Wires = overlay.querySelectorAll(".wire-d6");
  if (d6Wires[0]) d6Wires[0].setAttribute("d", "M419 190 C431 205 430 217 416 227");
  if (d6Wires[1]) d6Wires[1].setAttribute("d", "M416 265 C416 282 425 292 433 304");

  const style = document.createElement("style");
  style.id = "technoquest-hydraulic-layout-fix-styles";
  style.textContent = `
    .pump.hardware-pump {
      right:128px;
      bottom:53px;
      width:78px;
      height:54px;
      z-index:8;
    }
    .hydraulic-connector {
      fill:#dce7ea;
      stroke:#667b84;
      stroke-width:4;
    }
    .hydraulic-connector-inner {
      fill:#8ea2aa;
      stroke:#eef7f8;
      stroke-width:2;
    }
    .hydraulic-label,
    .electrical-label {
      font-family:Verdana,Arial,sans-serif;
      font-weight:800;
      paint-order:stroke;
      stroke:#062015;
      stroke-width:3px;
      stroke-linejoin:round;
    }
    .hydraulic-label {
      fill:#d8eef8;
      font-size:10px;
    }
    .electrical-label {
      fill:#ffd7bc;
      font-size:9px;
    }
    .electrical-arrow {
      fill:none;
      stroke:#ff9f68;
      stroke-width:4;
      stroke-linecap:round;
      stroke-linejoin:round;
    }
    .garden.water-running .hydraulic-connector-inner {
      fill:#49c7ff;
      filter:drop-shadow(0 0 5px #49c7ff);
    }
    @media(max-width:720px){
      .pump.hardware-pump{right:112px;bottom:51px}
    }
    @media(max-width:460px){
      .pump.hardware-pump{right:96px;bottom:48px}
      .hydraulic-label{font-size:8px}
      .electrical-label{font-size:7px}
    }
  `;
  document.head.appendChild(style);

  const ns = "http://www.w3.org/2000/svg";
  const details = document.createElementNS(ns, "g");
  details.setAttribute("class", "hydraulic-layout-details");
  details.innerHTML = `
    <defs>
      <marker id="electricalArrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L8,4 L0,8 Z" fill="#ff9f68" stroke="none"/>
      </marker>
    </defs>

    <!-- Raccord de sortie de la pompe vers le rosier -->
    <circle class="hydraulic-connector" cx="394" cy="330" r="10"/>
    <circle class="hydraulic-connector-inner" cx="394" cy="330" r="5"/>

    <!-- Raccord d'entrée de la pompe depuis le réservoir -->
    <circle class="hydraulic-connector" cx="472" cy="330" r="10"/>
    <circle class="hydraulic-connector-inner" cx="472" cy="330" r="5"/>

    <text class="hydraulic-label" x="474" y="317">Aspiration</text>
    <text class="hydraulic-label" x="305" y="318">Refoulement</text>

    <!-- Liaison électrique distincte du circuit d'eau -->
    <path class="electrical-arrow" d="M416 265 C416 282 425 292 433 304" marker-end="url(#electricalArrowHead)"/>
    <text class="electrical-label" x="436" y="287">Commande électrique</text>
  `;
  overlay.appendChild(details);

  pump.setAttribute("aria-label", "Pompe placée entre le tuyau d'aspiration du réservoir et le tuyau de refoulement vers le rosier, commandée électriquement par le relais D6");
})();
