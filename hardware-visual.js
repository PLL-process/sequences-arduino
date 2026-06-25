/* Ajoute les tuyaux, les capteurs et la carte programmable au jumeau numérique. */
"use strict";

(() => {
  const garden = document.querySelector(".garden");
  const pump = document.getElementById("pump");
  const informationFlow = document.getElementById("informationFlow");
  if (!garden || !pump) return;

  const style = document.createElement("style");
  style.id = "technoquest-hardware-visual-styles";
  style.textContent = `
    .garden.hardware-scene {
      min-height: 410px;
      isolation: isolate;
    }
    .hardware-overlay {
      position: absolute;
      inset: 0;
      z-index: 3;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    }
    .hardware-overlay text {
      font-family: Verdana, Arial, sans-serif;
      paint-order: stroke;
      stroke: #062015;
      stroke-width: 2.5px;
      stroke-linejoin: round;
    }
    .hardware-overlay .hardware-label {
      fill: #f4fff9;
      font-size: 12px;
      font-weight: 700;
    }
    .hardware-overlay .pin-label {
      fill: #062015;
      font-size: 11px;
      font-weight: 800;
      stroke: none;
    }
    .hardware-overlay .device-caption {
      fill: #f4fff9;
      font-size: 10px;
      font-weight: 700;
    }
    .hardware-overlay .pipe-shadow {
      fill: none;
      stroke: #0a1720;
      stroke-width: 18;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: .42;
    }
    .hardware-overlay .pipe-body {
      fill: none;
      stroke: #a9bdc5;
      stroke-width: 13;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .hardware-overlay .pipe-highlight {
      fill: none;
      stroke: #e8f6fa;
      stroke-width: 3;
      stroke-linecap: round;
      opacity: .65;
    }
    .hardware-overlay .pipe-water {
      fill: none;
      stroke: #49c7ff;
      stroke-width: 7;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 18 12;
      opacity: 0;
    }
    .garden.water-running .hardware-overlay .pipe-water {
      opacity: .95;
      animation: hardwareWaterFlow .55s linear infinite;
    }
    .garden.water-blocked .hardware-overlay .pipe-water {
      opacity: .5;
      stroke: #ff7b72;
      animation: none;
    }
    .hardware-overlay .wire {
      fill: none;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: .88;
    }
    .hardware-overlay .wire-a0 { stroke: #6fd3ff; }
    .hardware-overlay .wire-a1 { stroke: #ffd166; }
    .hardware-overlay .wire-d6 { stroke: #ff9f68; }
    .hardware-overlay .wire-a2 { stroke: #b78cff; }
    .garden.sensor-reading .hardware-overlay .wire-a0,
    .garden.sensor-reading .hardware-overlay .wire-a1,
    .garden.sensor-reading .hardware-overlay .wire-a2 {
      stroke-dasharray: 9 7;
      animation: hardwareSignalFlow .6s linear infinite;
      filter: drop-shadow(0 0 4px currentColor);
    }
    .hardware-overlay .sensor-halo {
      fill: none;
      stroke-width: 3;
      opacity: 0;
    }
    .garden.sensor-reading .hardware-overlay .sensor-halo {
      opacity: .9;
      animation: hardwareSensorPulse .8s ease-out infinite;
    }
    .hardware-overlay .board-led {
      fill: #273b35;
      stroke: #91a8bb;
      stroke-width: 1;
    }
    .garden.sensor-reading .hardware-overlay .board-led {
      fill: #63db8d;
      filter: drop-shadow(0 0 5px #63db8d);
    }
    .hardware-overlay .relay-led {
      fill: #465057;
    }
    .garden.water-running .hardware-overlay .relay-led {
      fill: #ffd166;
      filter: drop-shadow(0 0 5px #ffd166);
    }
    .hardware-overlay .water-at-foot {
      opacity: 0;
    }
    .garden.water-running .hardware-overlay .water-at-foot {
      opacity: 1;
      animation: hardwareDrops .7s ease-in-out infinite alternate;
    }

    .pump.hardware-pump {
      z-index: 5;
      right: 128px;
      bottom: 53px;
      width: 78px;
      height: 54px;
      padding: 0;
      display: grid;
      place-items: center;
      border: 4px solid #91a8bb;
      border-radius: 26px 15px 15px 26px;
      background: linear-gradient(145deg,#e9eff1,#aab9be 48%,#687982 49%,#384750);
      color: #f4fff9;
      font-size: .63rem;
      font-weight: 800;
      text-shadow: 0 1px 3px #000;
      box-shadow: inset 0 0 0 4px #ffffff33,0 5px 9px #0005;
    }
    .pump.hardware-pump::before {
      content: "";
      position: absolute;
      left: 8px;
      top: 9px;
      width: 28px;
      height: 28px;
      border: 5px solid #7b8990;
      border-radius: 50%;
      background: radial-gradient(circle,#dfe8eb 0 18%,#697981 20% 35%,#c9d4d7 37% 52%,#5b6b72 54%);
      box-shadow: inset 0 0 5px #0008;
    }
    .pump.hardware-pump::after {
      content: "";
      position: absolute;
      right: -13px;
      top: 18px;
      width: 15px;
      height: 16px;
      border: 3px solid #7d9099;
      border-left: 0;
      border-radius: 0 7px 7px 0;
      background: #c8d4d8;
    }
    .pump.hardware-pump.state-running::before,
    .pump.hardware-pump.on::before {
      animation: hardwareRotor .45s linear infinite;
    }

    .plant.rose-plant { z-index: 5; }
    .soil { z-index: 1; }
    .tank { z-index: 4; }

    @keyframes hardwareWaterFlow { to { stroke-dashoffset: -30; } }
    @keyframes hardwareSignalFlow { to { stroke-dashoffset: -16; } }
    @keyframes hardwareSensorPulse {
      0% { transform: scale(.7); opacity: .95; }
      100% { transform: scale(1.35); opacity: 0; }
    }
    @keyframes hardwareDrops { to { transform: translateY(6px); } }
    @keyframes hardwareRotor { to { transform: rotate(360deg); } }

    @media (max-width: 720px) {
      .garden.hardware-scene { min-height: 385px; }
      .pump.hardware-pump { right: 112px; bottom: 51px; transform: scale(.9); transform-origin: bottom right; }
    }
    @media (max-width: 460px) {
      .garden.hardware-scene { min-height: 360px; }
      .pump.hardware-pump { right: 96px; bottom: 48px; transform: scale(.76); }
      .hardware-overlay .hardware-label { font-size: 10px; }
      .hardware-overlay .device-caption { font-size: 8px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .hardware-overlay *, .pump.hardware-pump::before { animation: none !important; }
    }
  `;
  document.head.appendChild(style);

  garden.classList.add("hardware-scene");
  pump.classList.add("hardware-pump");
  pump.setAttribute("aria-label", "Pompe basse tension commandée par le relais sur D6");

  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  overlay.setAttribute("class", "hardware-overlay");
  overlay.setAttribute("viewBox", "0 0 600 410");
  overlay.setAttribute("preserveAspectRatio", "none");
  overlay.setAttribute("role", "img");
  overlay.setAttribute("aria-label", "Schéma du jardin connecté avec tuyaux, capteur d’humidité A0, capteur de luminosité A1, capteur de niveau A2, carte Arduino et relais D6");
  overlay.innerHTML = `
    <defs>
      <linearGradient id="boardGreen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2a8c74"/>
        <stop offset="1" stop-color="#0c4f42"/>
      </linearGradient>
      <linearGradient id="sensorMetal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#dce7ea"/>
        <stop offset=".5" stop-color="#7d9199"/>
        <stop offset="1" stop-color="#eef7f8"/>
      </linearGradient>
      <filter id="hardwareShadow" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#00120d" flood-opacity=".5"/>
      </filter>
    </defs>

    <!-- Tuyau d’aspiration : réservoir vers pompe -->
    <path class="pipe-shadow" d="M500 287 H457"/>
    <path class="pipe-body" d="M500 287 H457"/>
    <path class="pipe-highlight" d="M500 283 H457"/>
    <path class="pipe-water" d="M500 287 H457"/>

    <!-- Tuyau de refoulement : pompe vers le pied du rosier -->
    <path class="pipe-shadow" d="M405 287 H350 Q326 287 326 311 H250 Q226 311 226 329"/>
    <path class="pipe-body" d="M405 287 H350 Q326 287 326 311 H250 Q226 311 226 329"/>
    <path class="pipe-highlight" d="M405 283 H350 Q326 283 326 307 H250 Q222 307 222 329"/>
    <path class="pipe-water" d="M405 287 H350 Q326 287 326 311 H250 Q226 311 226 329"/>
    <g class="water-at-foot" fill="#6fd3ff">
      <path d="M218 328 C212 337 213 343 218 346 C224 343 224 337 218 328 Z"/>
      <path d="M231 331 C226 338 227 343 231 345 C236 343 236 338 231 331 Z"/>
      <ellipse cx="224" cy="349" rx="21" ry="4" fill="#49bfe8" opacity=".55"/>
    </g>

    <!-- Capteur de luminosité LDR sur A1 -->
    <g filter="url(#hardwareShadow)">
      <circle cx="92" cy="105" r="19" fill="#fff0a6" stroke="#d8a82c" stroke-width="3"/>
      <path d="M81 100 Q92 89 103 100 M81 109 Q92 120 103 109" fill="none" stroke="#9b6d12" stroke-width="3"/>
      <line x1="88" y1="124" x2="88" y2="141" stroke="#aebcc2" stroke-width="3"/>
      <line x1="96" y1="124" x2="96" y2="141" stroke="#aebcc2" stroke-width="3"/>
      <circle class="sensor-halo" cx="92" cy="105" r="27" stroke="#ffd166"/>
      <text class="hardware-label" x="58" y="82">LDR</text>
      <text class="device-caption" x="53" y="157">Luminosité</text>
    </g>

    <!-- Capteur d’humidité planté dans le sol sur A0 -->
    <g filter="url(#hardwareShadow)">
      <rect x="169" y="264" width="30" height="34" rx="6" fill="#6d858e" stroke="#e7f0f2" stroke-width="2"/>
      <circle cx="178" cy="274" r="3" fill="#63db8d"/>
      <rect x="175" y="295" width="6" height="45" rx="3" fill="url(#sensorMetal)"/>
      <rect x="188" y="295" width="6" height="45" rx="3" fill="url(#sensorMetal)"/>
      <circle class="sensor-halo" cx="184" cy="279" r="25" stroke="#6fd3ff"/>
      <text class="hardware-label" x="128" y="252">Capteur sol</text>
      <text class="device-caption" x="133" y="355">Humidité</text>
    </g>

    <!-- Carte programmable Arduino Uno R4 Minima -->
    <g filter="url(#hardwareShadow)">
      <rect x="270" y="121" width="142" height="88" rx="12" fill="url(#boardGreen)" stroke="#b6dfd4" stroke-width="3"/>
      <rect x="280" y="133" width="34" height="24" rx="4" fill="#d8e3e6" stroke="#82979f" stroke-width="2"/>
      <rect x="333" y="145" width="42" height="33" rx="5" fill="#1e2c30" stroke="#768b91" stroke-width="2"/>
      <circle class="board-led" cx="394" cy="139" r="6"/>
      <circle cx="394" cy="158" r="5" fill="#ffd166" opacity=".8"/>
      <text class="hardware-label" x="287" y="190">Arduino UNO R4</text>
      <rect x="264" y="128" width="26" height="18" rx="5" fill="#6fd3ff"/>
      <text class="pin-label" x="269" y="141">A0</text>
      <rect x="264" y="154" width="26" height="18" rx="5" fill="#ffd166"/>
      <text class="pin-label" x="269" y="167">A1</text>
      <rect x="264" y="180" width="26" height="18" rx="5" fill="#b78cff"/>
      <text class="pin-label" x="269" y="193">A2</text>
      <rect x="392" y="181" width="27" height="18" rx="5" fill="#ff9f68"/>
      <text class="pin-label" x="397" y="194">D6</text>
    </g>

    <!-- Relais Grove entre D6 et la pompe -->
    <g filter="url(#hardwareShadow)">
      <rect x="388" y="227" width="55" height="38" rx="7" fill="#1f6954" stroke="#9bd2c5" stroke-width="2"/>
      <rect x="396" y="237" width="24" height="18" rx="3" fill="#23404a"/>
      <circle class="relay-led" cx="432" cy="238" r="5"/>
      <text class="device-caption" x="396" y="278">Relais D6</text>
    </g>

    <!-- Câblages des capteurs vers des entrées distinctes -->
    <path class="wire wire-a1" d="M96 142 C124 180 180 183 264 163"/>
    <path class="wire wire-a0" d="M184 264 C203 224 226 188 264 137"/>
    <path class="wire wire-a2" d="M514 227 C494 185 455 174 290 189"/>
    <path class="wire wire-d6" d="M419 190 C430 205 429 215 416 227"/>
    <path class="wire wire-d6" d="M443 246 C452 255 455 264 454 276"/>

    <text class="device-caption" x="108" y="174" fill="#ffd166">Signal A1</text>
    <text class="device-caption" x="204" y="224" fill="#6fd3ff">Signal A0</text>
    <text class="device-caption" x="447" y="180" fill="#b78cff">Niveau A2</text>
  `;
  garden.appendChild(overlay);

  const updatePumpVisual = () => {
    const running = pump.classList.contains("state-running") || pump.classList.contains("on");
    const blocked = pump.classList.contains("state-blocked");
    garden.classList.toggle("water-running", running && !blocked);
    garden.classList.toggle("water-blocked", blocked);
  };

  const pumpObserver = new MutationObserver(updatePumpVisual);
  pumpObserver.observe(pump, {attributes: true, attributeFilter: ["class"]});
  updatePumpVisual();

  if (informationFlow) {
    const updateSensorVisual = () => {
      garden.classList.toggle("sensor-reading", informationFlow.classList.contains("active"));
    };
    const informationObserver = new MutationObserver(updateSensorVisual);
    informationObserver.observe(informationFlow, {attributes: true, attributeFilter: ["class"]});
    updateSensorVisual();
  }
})();
