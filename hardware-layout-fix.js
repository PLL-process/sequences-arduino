/* Corrige la lisibilité des capteurs A0/A2 et ajoute un capteur de niveau visible dans le réservoir. */
"use strict";

(() => {
  const garden = document.querySelector(".garden");
  const overlay = garden?.querySelector(".hardware-overlay");
  const reservoirInput = document.getElementById("reservoir");
  if (!garden || !overlay) return;

  const findText = value => [...overlay.querySelectorAll("text")].find(node => node.textContent.trim() === value);

  /* Masque l'ancien capteur d'humidité et ses libellés, placés derrière le rosier. */
  const oldSoilLabel = findText("Capteur sol");
  oldSoilLabel?.closest("g")?.setAttribute("display", "none");
  overlay.querySelectorAll(".wire-a0").forEach(node => node.setAttribute("display", "none"));
  findText("Signal A0")?.setAttribute("display", "none");

  /* Le capteur de niveau A2 est redessiné dans le réservoir. */
  overlay.querySelectorAll(".wire-a2").forEach(node => node.setAttribute("display", "none"));
  findText("Niveau A2")?.setAttribute("display", "none");

  /* Rend la fonction de l'entrée A1 plus explicite. */
  const a1Label = findText("Signal A1");
  if (a1Label) a1Label.textContent = "Lumière → entrée A1";

  const style = document.createElement("style");
  style.id = "technoquest-hardware-layout-fix-styles";
  style.textContent = `
    .hardware-foreground-overlay {
      position:absolute;
      inset:0;
      z-index:7;
      width:100%;
      height:100%;
      overflow:visible;
      pointer-events:none;
    }
    .hardware-foreground-overlay text {
      font-family:Verdana,Arial,sans-serif;
      paint-order:stroke;
      stroke:#062015;
      stroke-width:3px;
      stroke-linejoin:round;
    }
    .hardware-foreground-overlay .fg-title {
      fill:#f4fff9;
      font-size:12px;
      font-weight:800;
    }
    .hardware-foreground-overlay .fg-caption {
      fill:#d8eef8;
      font-size:10px;
      font-weight:700;
    }
    .hardware-foreground-overlay .fg-wire {
      fill:none;
      stroke-width:4;
      stroke-linecap:round;
      stroke-linejoin:round;
      opacity:.95;
    }
    .hardware-foreground-overlay .fg-wire-a0 { stroke:#6fd3ff; }
    .hardware-foreground-overlay .fg-wire-a2 { stroke:#b78cff; }
    .garden.sensor-reading .hardware-foreground-overlay .fg-wire {
      stroke-dasharray:9 7;
      animation:hardwareSignalFlow .6s linear infinite;
      filter:drop-shadow(0 0 5px currentColor);
    }
    .hardware-foreground-overlay .fg-halo {
      fill:none;
      stroke-width:3;
      opacity:0;
    }
    .garden.sensor-reading .hardware-foreground-overlay .fg-halo {
      opacity:.95;
      animation:hardwareSensorPulse .8s ease-out infinite;
    }
    .hardware-foreground-overlay .level-float {
      transition:transform .25s ease;
    }
    @media(max-width:460px){
      .hardware-foreground-overlay .fg-title{font-size:10px}
      .hardware-foreground-overlay .fg-caption{font-size:8px}
    }
    @media(prefers-reduced-motion:reduce){
      .hardware-foreground-overlay *{animation:none!important;transition:none!important}
    }
  `;
  document.head.appendChild(style);

  const foreground = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  foreground.setAttribute("class", "hardware-foreground-overlay");
  foreground.setAttribute("viewBox", "0 0 600 410");
  foreground.setAttribute("preserveAspectRatio", "none");
  foreground.setAttribute("role", "img");
  foreground.setAttribute("aria-label", "Capteur d'humidité du sol relié à A0 et capteur de niveau d'eau relié à A2");
  foreground.innerHTML = `
    <defs>
      <linearGradient id="soilSensorMetalFront" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#e8f2f4"/>
        <stop offset=".5" stop-color="#71858d"/>
        <stop offset="1" stop-color="#f5fbfc"/>
      </linearGradient>
      <filter id="frontHardwareShadow" x="-35%" y="-35%" width="170%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#00120d" flood-opacity=".55"/>
      </filter>
    </defs>

    <!-- Nouveau capteur d'humidité, déplacé à gauche du rosier -->
    <g filter="url(#frontHardwareShadow)">
      <rect x="105" y="266" width="34" height="36" rx="7" fill="#607b84" stroke="#edf7f8" stroke-width="2"/>
      <circle cx="115" cy="276" r="3.5" fill="#63db8d"/>
      <rect x="111" y="299" width="7" height="49" rx="3.5" fill="url(#soilSensorMetalFront)"/>
      <rect x="126" y="299" width="7" height="49" rx="3.5" fill="url(#soilSensorMetalFront)"/>
      <circle class="fg-halo" cx="122" cy="282" r="27" stroke="#6fd3ff"/>
      <text class="fg-title" x="57" y="251">Capteur d’humidité</text>
      <text class="fg-caption" x="57" y="265">Mesure du sol → entrée A0</text>
    </g>
    <path class="fg-wire fg-wire-a0" d="M122 266 C132 228 159 203 196 185 C220 173 241 152 264 137"/>

    <!-- Capteur de niveau d'eau visible dans le réservoir -->
    <g filter="url(#frontHardwareShadow)">
      <rect x="526" y="260" width="15" height="96" rx="6" fill="#dce7ea" stroke="#526971" stroke-width="2"/>
      <line x1="530" y1="277" x2="537" y2="277" stroke="#526971" stroke-width="2"/>
      <line x1="530" y1="296" x2="537" y2="296" stroke="#526971" stroke-width="2"/>
      <line x1="530" y1="315" x2="537" y2="315" stroke="#526971" stroke-width="2"/>
      <line x1="530" y1="334" x2="537" y2="334" stroke="#526971" stroke-width="2"/>
      <g id="levelFloat" class="level-float">
        <rect x="520" y="264" width="27" height="12" rx="6" fill="#ffd166" stroke="#8c6911" stroke-width="2"/>
        <circle cx="533.5" cy="270" r="3" fill="#fff3bd"/>
      </g>
      <circle class="fg-halo" cx="533" cy="270" r="25" stroke="#b78cff"/>
      <text class="fg-title" x="451" y="232">Capteur de niveau d’eau</text>
      <text class="fg-caption" x="451" y="246">Mesure du réservoir → entrée A2</text>
    </g>
    <path class="fg-wire fg-wire-a2" d="M526 260 C492 215 444 201 384 197 C344 194 315 191 290 189"/>
  `;
  garden.appendChild(foreground);

  const levelFloat = foreground.querySelector("#levelFloat");
  const updateLevelFloat = () => {
    if (!levelFloat || !reservoirInput) return;
    const level = Math.max(0, Math.min(100, Number(reservoirInput.value) || 0));
    const verticalTravel = 76;
    const translateY = (100 - level) / 100 * verticalTravel;
    levelFloat.setAttribute("transform", `translate(0 ${translateY.toFixed(1)})`);
  };

  updateLevelFloat();
  reservoirInput?.addEventListener("input", updateLevelFloat);
  window.setInterval(updateLevelFloat, 250);
})();
