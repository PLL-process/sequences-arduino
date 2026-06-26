/* Reconstruit le jumeau numérique avec une mise en page aérée et pédagogique. */
"use strict";

(() => {
  const garden = document.querySelector(".garden");
  const pumpState = document.getElementById("pump");
  const informationFlow = document.getElementById("informationFlow");
  const boardChoice = document.getElementById("boardChoice");
  if (!garden || !pumpState) return;

  /* Les anciens calques restent inutiles une fois le nouveau schéma construit. */
  garden.querySelectorAll(".hardware-overlay,.hardware-foreground-overlay,.sensor-pulse").forEach(element => element.remove());
  pumpState.style.opacity = "0";
  pumpState.style.pointerEvents = "none";
  pumpState.setAttribute("aria-hidden", "true");
  garden.querySelector(".tank span")?.setAttribute("aria-hidden", "true");
  const oldTankLabel = garden.querySelector(".tank span");
  if (oldTankLabel) oldTankLabel.style.display = "none";

  const style = document.createElement("style");
  style.id = "technoquest-digital-twin-clean-layout-styles";
  style.textContent = `
    .garden.clean-digital-twin{min-height:430px;isolation:isolate;overflow:hidden}
    .twin-hydraulic-layer,.twin-annotation-layer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
    .twin-hydraulic-layer{z-index:3}.twin-annotation-layer{z-index:8}
    .twin-annotation-layer text{font-family:Verdana,Arial,sans-serif}
    .twin-card{fill:#ffffff;stroke:#14352d;stroke-width:2.2}
    .twin-card-title{fill:#14352d;font-size:11px;font-weight:900}
    .twin-card-subtitle{fill:#31564e;font-size:8.5px;font-weight:700}
    .twin-label{fill:#14352d;font-size:9px;font-weight:900}
    .twin-small{fill:#31564e;font-size:7.6px;font-weight:700}
    .twin-board-title{fill:#f3fff9;font-size:10px;font-weight:900;text-anchor:middle}
    .twin-board-subtitle{fill:#cde9df;font-size:8px;font-weight:700;text-anchor:middle}
    .twin-pin{fill:#062015;font-size:10px;font-weight:900;text-anchor:middle}
    .twin-wire{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;opacity:.96}
    .twin-wire-a0{stroke:#6fd3ff}.twin-wire-a1{stroke:#ffd166}.twin-wire-a2{stroke:#b78cff}.twin-wire-d6{stroke:#ff9f68}
    .twin-power-wire{fill:none;stroke-width:3;stroke-linecap:round}.twin-power-plus{stroke:#ff7b72}.twin-power-minus{stroke:#6f8490}
    .twin-pipe-shadow{fill:none;stroke:#07151b;stroke-width:19;stroke-linecap:round;stroke-linejoin:round;opacity:.42}
    .twin-pipe-body{fill:none;stroke:#b6c8ce;stroke-width:14;stroke-linecap:round;stroke-linejoin:round}
    .twin-pipe-highlight{fill:none;stroke:#effbff;stroke-width:3;stroke-linecap:round;opacity:.72}
    .twin-water-stream{fill:none;stroke:#49c7ff;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:18 12;opacity:0}
    .garden.water-running .twin-water-stream{opacity:.95;animation:twinCleanWater .55s linear infinite}
    .garden.water-blocked .twin-water-stream{opacity:.55;stroke:#ff7b72}
    .twin-flow-arrow{fill:#49c7ff;stroke:#e8f9ff;stroke-width:1.2;opacity:.9}
    .twin-sensor-halo{fill:none;stroke-width:3;opacity:0;transform-box:fill-box;transform-origin:center}
    .garden.sensor-reading .twin-sensor-halo{opacity:.92;animation:twinCleanPulse .8s ease-out infinite}
    .garden.sensor-reading .twin-wire-a0,.garden.sensor-reading .twin-wire-a1,.garden.sensor-reading .twin-wire-a2{stroke-dasharray:9 7;animation:twinCleanSignal .6s linear infinite}
    .twin-pump-rotor{transform-box:fill-box;transform-origin:center}
    .garden.water-running .twin-pump-rotor{animation:twinCleanRotor .45s linear infinite}
    .twin-relay-led{fill:#56666d}.garden.water-running .twin-relay-led{fill:#ffd166;filter:drop-shadow(0 0 5px #ffd166)}
    .twin-water-at-foot{opacity:0}.garden.water-running .twin-water-at-foot{opacity:1;animation:twinCleanDrops .65s ease-in-out infinite alternate}
    .twin-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem;margin:.75rem 0;padding:.75rem;border:1px solid var(--border);border-radius:13px;background:#071d17}
    .twin-legend article{padding:.65rem;border-radius:10px;background:var(--soft);line-height:1.45;color:var(--muted)}
    .twin-legend strong{display:block;margin-bottom:.2rem;color:var(--text)}
    .twin-legend .information{border-left:4px solid var(--blue)}.twin-legend .energy{border-left:4px solid var(--yellow)}
    @keyframes twinCleanWater{to{stroke-dashoffset:-30}}
    @keyframes twinCleanSignal{to{stroke-dashoffset:-16}}
    @keyframes twinCleanPulse{0%{transform:scale(.72);opacity:.92}100%{transform:scale(1.38);opacity:0}}
    @keyframes twinCleanRotor{to{transform:rotate(360deg)}}
    @keyframes twinCleanDrops{to{transform:translateY(5px)}}
    @media(max-width:720px){.garden.clean-digital-twin{min-height:405px}.twin-legend{grid-template-columns:1fr}}
    @media(max-width:460px){.garden.clean-digital-twin{min-height:370px}.twin-card-title{font-size:9.5px}.twin-card-subtitle{font-size:7.2px}.twin-label{font-size:8px}.twin-small{font-size:6.8px}}
    @media(prefers-reduced-motion:reduce){.twin-hydraulic-layer *,.twin-annotation-layer *{animation:none!important}}
  `;
  document.head.appendChild(style);
  garden.classList.add("clean-digital-twin");

  const ns = "http://www.w3.org/2000/svg";

  const hydraulic = document.createElementNS(ns, "svg");
  hydraulic.setAttribute("class", "twin-hydraulic-layer");
  hydraulic.setAttribute("viewBox", "0 0 600 410");
  hydraulic.setAttribute("preserveAspectRatio", "none");
  hydraulic.setAttribute("aria-hidden", "true");
  hydraulic.innerHTML = `
    <defs>
      <filter id="twinPipeShadow" x="-25%" y="-35%" width="160%" height="190%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#00120d" flood-opacity=".45"/></filter>
    </defs>
    <!-- Réservoir vers pompe : aspiration -->
    <path class="twin-pipe-shadow" d="M510 326 H476"/>
    <path class="twin-pipe-body" d="M510 326 H476"/>
    <path class="twin-pipe-highlight" d="M510 322 H476"/>
    <path class="twin-water-stream" d="M510 326 H476"/>
    <path class="twin-flow-arrow" d="M489 318 L477 326 L489 334 Z"/>

    <!-- Pompe vers le pied du rosier : refoulement -->
    <path class="twin-pipe-shadow" d="M402 326 H350 Q332 326 332 343 H276 Q252 343 252 359 H233"/>
    <path class="twin-pipe-body" d="M402 326 H350 Q332 326 332 343 H276 Q252 343 252 359 H233"/>
    <path class="twin-pipe-highlight" d="M402 322 H350 Q328 322 328 339 H276 Q248 339 248 359 H233"/>
    <path class="twin-water-stream" d="M402 326 H350 Q332 326 332 343 H276 Q252 343 252 359 H233"/>
    <path class="twin-flow-arrow" d="M367 318 L355 326 L367 334 Z"/>
    <path class="twin-flow-arrow" d="M301 335 L289 343 L301 351 Z"/>
    <path class="twin-flow-arrow" d="M260 350 L252 361 L244 350 Z"/>
    <g class="twin-water-at-foot" fill="#49c7ff">
      <path d="M225 354 C219 363 220 369 225 372 C231 369 231 363 225 354 Z"/>
      <path d="M239 357 C234 365 235 370 239 372 C244 370 244 365 239 357 Z"/>
      <ellipse cx="232" cy="376" rx="24" ry="5" opacity=".5"/>
    </g>`;
  garden.appendChild(hydraulic);

  const overlay = document.createElementNS(ns, "svg");
  overlay.setAttribute("class", "twin-annotation-layer");
  overlay.setAttribute("viewBox", "0 0 600 410");
  overlay.setAttribute("preserveAspectRatio", "none");
  overlay.setAttribute("role", "img");
  overlay.setAttribute("aria-label", "Jumeau numérique du jardin connecté : capteurs A0, A1 et A2, carte Arduino, relais D6, alimentation séparée, pompe et circuit d'eau");
  overlay.innerHTML = `
    <defs>
      <linearGradient id="twinBoardGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#318f78"/><stop offset="1" stop-color="#0d4e41"/></linearGradient>
      <linearGradient id="twinMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef7f8"/><stop offset=".5" stop-color="#738890"/><stop offset="1" stop-color="#f8fcfd"/></linearGradient>
      <filter id="twinCleanShadow" x="-35%" y="-35%" width="175%" height="185%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#00120d" flood-opacity=".5"/></filter>
    </defs>

    <!-- LDR : Light-Dependent Resistor / photorésistance -->
    <g filter="url(#twinCleanShadow)">
      <rect class="twin-card" x="18" y="52" width="170" height="70" rx="11"/>
      <rect x="18" y="52" width="6" height="70" rx="3" fill="#ffd166"/>
      <text class="twin-card-title" x="32" y="72">LDR — photorésistance</text>
      <text class="twin-card-subtitle" x="32" y="89">Capteur de luminosité</text>
      <text class="twin-card-subtitle" x="32" y="106">Mesure → entrée analogique A1</text>
      <circle cx="115" cy="139" r="18" fill="#fff0a6" stroke="#d6a428" stroke-width="3"/>
      <path d="M105 134 Q115 124 125 134 M105 144 Q115 154 125 144" fill="none" stroke="#936813" stroke-width="3"/>
      <line x1="111" y1="157" x2="111" y2="171" stroke="#dce7ea" stroke-width="3"/><line x1="119" y1="157" x2="119" y2="171" stroke="#dce7ea" stroke-width="3"/>
      <circle class="twin-sensor-halo" cx="115" cy="139" r="27" stroke="#ffd166"/>
    </g>

    <!-- Capteur d'humidité A0, dégagé du rosier -->
    <g filter="url(#twinCleanShadow)">
      <rect class="twin-card" x="18" y="202" width="180" height="67" rx="11"/>
      <rect x="18" y="202" width="6" height="67" rx="3" fill="#6fd3ff"/>
      <text class="twin-card-title" x="32" y="222">Capteur d’humidité du sol</text>
      <text class="twin-card-subtitle" x="32" y="241">Mesure du sol → entrée A0</text>
      <text class="twin-card-subtitle" x="32" y="257">Grandeur analogique</text>
      <rect x="104" y="284" width="34" height="36" rx="7" fill="#657f88" stroke="#edf7f8" stroke-width="2"/>
      <circle cx="114" cy="294" r="3.5" fill="#63db8d"/>
      <rect x="110" y="317" width="7" height="47" rx="3.5" fill="url(#twinMetal)"/><rect x="126" y="317" width="7" height="47" rx="3.5" fill="url(#twinMetal)"/>
      <circle class="twin-sensor-halo" cx="121" cy="300" r="27" stroke="#6fd3ff"/>
    </g>

    <!-- Carte Arduino -->
    <g filter="url(#twinCleanShadow)">
      <rect x="250" y="145" width="145" height="91" rx="13" fill="url(#twinBoardGreen)" stroke="#c1e7dc" stroke-width="3"/>
      <rect x="262" y="158" width="34" height="25" rx="5" fill="#dce7ea" stroke="#82979f" stroke-width="2"/>
      <rect x="317" y="170" width="42" height="34" rx="5" fill="#1d2b30" stroke="#758a91" stroke-width="2"/>
      <circle cx="376" cy="160" r="6" fill="#63db8d"/><circle cx="376" cy="181" r="5" fill="#ffd166"/>
      <text id="twinBoardName1" class="twin-board-title" x="323" y="214">Arduino UNO R4</text>
      <text id="twinBoardName2" class="twin-board-subtitle" x="323" y="226">Minima</text>
      <rect x="239" y="153" width="27" height="19" rx="5" fill="#6fd3ff"/><text class="twin-pin" x="252.5" y="167">A0</text>
      <rect x="239" y="178" width="27" height="19" rx="5" fill="#ffd166"/><text class="twin-pin" x="252.5" y="192">A1</text>
      <rect x="239" y="203" width="27" height="19" rx="5" fill="#b78cff"/><text class="twin-pin" x="252.5" y="217">A2</text>
      <rect x="386" y="204" width="29" height="19" rx="5" fill="#ff9f68"/><text class="twin-pin" x="400.5" y="218">D6</text>
    </g>

    <!-- Capteur de niveau A2 : cartouche séparé de l'Arduino -->
    <g filter="url(#twinCleanShadow)">
      <rect class="twin-card" x="405" y="76" width="180" height="74" rx="11"/>
      <rect x="579" y="80" width="5" height="66" rx="2.5" fill="#b78cff"/>
      <rect x="540" y="87" width="31" height="21" rx="6" fill="#6d3da8"/><text x="555.5" y="102" text-anchor="middle" fill="#fff" font-size="10" font-weight="900">A2</text>
      <text class="twin-card-title" x="418" y="98">Capteur de niveau d’eau</text>
      <text class="twin-card-title" x="418" y="115">du réservoir</text>
      <text class="twin-card-subtitle" x="418" y="135">Mesure → entrée analogique A2</text>
      <path d="M515 150 C532 184 539 219 539 269" fill="none" stroke="#b78cff" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 6"/>
    </g>

    <!-- Flotteur dans le réservoir -->
    <g filter="url(#twinCleanShadow)">
      <rect x="532" y="270" width="14" height="94" rx="6" fill="#e3ecee" stroke="#536a72" stroke-width="2"/>
      <line x1="536" y1="289" x2="543" y2="289" stroke="#536a72" stroke-width="2"/><line x1="536" y1="309" x2="543" y2="309" stroke="#536a72" stroke-width="2"/><line x1="536" y1="329" x2="543" y2="329" stroke="#536a72" stroke-width="2"/><line x1="536" y1="349" x2="543" y2="349" stroke="#536a72" stroke-width="2"/>
      <g id="twinLevelFloat"><rect x="526" y="276" width="26" height="12" rx="6" fill="#ffd166" stroke="#8c6911" stroke-width="2"/><circle cx="539" cy="282" r="3" fill="#fff4bd"/></g>
      <circle class="twin-sensor-halo" cx="539" cy="282" r="25" stroke="#b78cff"/>
      <rect class="twin-card" x="500" y="225" width="88" height="25" rx="8"/><text class="twin-label" x="544" y="242" text-anchor="middle">Réservoir d’eau</text>
    </g>

    <!-- Relais et commande électrique -->
    <g filter="url(#twinCleanShadow)">
      <rect class="twin-card" x="397" y="226" width="126" height="43" rx="10"/>
      <text class="twin-card-title" x="409" y="244">Relais (D6)</text>
      <text class="twin-card-subtitle" x="409" y="259">Commande de la pompe</text>
      <rect x="410" y="274" width="57" height="39" rx="7" fill="#1f6954" stroke="#a5d7cb" stroke-width="2"/>
      <rect x="418" y="284" width="25" height="18" rx="3" fill="#23404a"/><circle class="twin-relay-led" cx="456" cy="285" r="5"/>
      <path d="M441 269 V274" stroke="#ff9f68" stroke-width="3"/>
    </g>

    <!-- Alimentation séparée de très basse tension -->
    <g filter="url(#twinCleanShadow)">
      <rect class="twin-card" x="286" y="264" width="105" height="48" rx="10"/>
      <rect x="298" y="276" width="28" height="23" rx="4" fill="#384952" stroke="#dce7ea" stroke-width="2"/><rect x="326" y="282" width="5" height="11" rx="2" fill="#dce7ea"/>
      <text class="twin-label" x="337" y="282">Alimentation</text>
      <text class="twin-small" x="337" y="296">séparée · TBT</text>
      <text class="twin-small" x="337" y="307">Très basse tension</text>
    </g>

    <!-- Pompe placée entre les deux tuyaux -->
    <g filter="url(#twinCleanShadow)">
      <circle cx="402" cy="326" r="10" fill="#dce7ea" stroke="#667b84" stroke-width="4"/><circle cx="402" cy="326" r="5" fill="#49c7ff"/>
      <circle cx="476" cy="326" r="10" fill="#dce7ea" stroke="#667b84" stroke-width="4"/><circle cx="476" cy="326" r="5" fill="#49c7ff"/>
      <rect x="404" y="302" width="70" height="49" rx="21" fill="url(#twinMetal)" stroke="#71858e" stroke-width="3"/>
      <circle class="twin-pump-rotor" cx="426" cy="326" r="15" fill="#dce7ea" stroke="#6d7e86" stroke-width="5"/><circle cx="426" cy="326" r="5" fill="#6d7e86"/>
      <rect x="452" y="311" width="17" height="29" rx="5" fill="#45565e"/>
      <rect class="twin-card" x="393" y="360" width="105" height="28" rx="9"/><text class="twin-label" x="445.5" y="378" text-anchor="middle">Pompe à eau</text>
      <rect class="twin-card" x="476" y="294" width="71" height="23" rx="8"/><text class="twin-small" x="511.5" y="309" text-anchor="middle">Aspiration</text>
      <rect class="twin-card" x="306" y="294" width="88" height="23" rx="8"/><text class="twin-small" x="350" y="309" text-anchor="middle">Refoulement</text>
    </g>

    <!-- Fils : couleurs cohérentes et croisements limités -->
    <path class="twin-wire twin-wire-a1" d="M119 171 C143 184 186 188 239 187"/>
    <path class="twin-wire twin-wire-a0" d="M121 284 C148 235 190 188 239 162"/>
    <path class="twin-wire twin-wire-a2" d="M532 282 C515 229 454 215 395 212 H266"/>
    <path class="twin-wire twin-wire-d6" d="M415 214 C431 222 441 231 441 226"/>
    <path class="twin-wire twin-wire-d6" d="M441 313 C443 318 443 323 443 302"/>
    <path class="twin-power-wire twin-power-plus" d="M391 280 C400 280 404 282 410 285"/><path class="twin-power-wire twin-power-minus" d="M391 299 C399 301 404 303 410 304"/>
  `;
  garden.appendChild(overlay);

  const legend = document.createElement("section");
  legend.className = "twin-legend";
  legend.setAttribute("aria-label", "Lecture pédagogique du jumeau numérique");
  legend.innerHTML = `
    <article class="information"><strong>Chaîne d’information</strong>Capteurs → entrées analogiques A0, A1 et A2 → carte Arduino → décision du programme → sortie numérique D6.</article>
    <article class="energy"><strong>Chaîne d’énergie</strong>Alimentation séparée en très basse tension → relais → pompe → tuyaux → eau transmise au pied du rosier.</article>`;
  garden.insertAdjacentElement("afterend", legend);

  const levelFloat = overlay.querySelector("#twinLevelFloat");
  const reservoir = document.getElementById("reservoir");
  function updateLevel() {
    if (!levelFloat || !reservoir) return;
    const level = Math.max(0, Math.min(100, Number(reservoir.value) || 0));
    levelFloat.setAttribute("transform", `translate(0 ${((100 - level) * .68).toFixed(1)})`);
  }

  function updateBoardName() {
    const isR3 = boardChoice?.value === "r3";
    const first = overlay.querySelector("#twinBoardName1");
    const second = overlay.querySelector("#twinBoardName2");
    if (first) first.textContent = isR3 ? "Arduino UNO R3" : "Arduino UNO R4";
    if (second) second.textContent = isR3 ? "ATmega328P" : "Minima";
  }

  function updatePumpState() {
    const running = pumpState.classList.contains("state-running") || pumpState.classList.contains("on");
    const blocked = pumpState.classList.contains("state-blocked");
    garden.classList.toggle("water-running", running && !blocked);
    garden.classList.toggle("water-blocked", blocked);
  }

  function updateSensorState() {
    if (!informationFlow) return;
    garden.classList.toggle("sensor-reading", informationFlow.classList.contains("active"));
  }

  reservoir?.addEventListener("input", updateLevel);
  boardChoice?.addEventListener("change", updateBoardName);
  new MutationObserver(updatePumpState).observe(pumpState, {attributes:true,attributeFilter:["class"]});
  if (informationFlow) new MutationObserver(updateSensorState).observe(informationFlow, {attributes:true,attributeFilter:["class"]});

  updateLevel();
  updateBoardName();
  updatePumpState();
  updateSensorState();
})();
