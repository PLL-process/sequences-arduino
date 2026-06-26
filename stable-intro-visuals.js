/* Remplace les deux premiers visuels par des versions lisibles et stables sur tablette. */
"use strict";

(() => {
  const STYLE_ID = "technoquest-stable-intro-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .visual-intro .visual-card svg{background:#071c17}
      .visual-intro .visual-card figcaption{font-size:.98rem;line-height:1.5}
      .stable-visual-title{font:800 27px Verdana,Arial,sans-serif;fill:#f7fff9}
      .stable-visual-subtitle{font:700 18px Verdana,Arial,sans-serif;fill:#f7fff9}
      .stable-visual-text{font:14px Verdana,Arial,sans-serif;fill:#dceee8}
      .stable-visual-small{font:12px Verdana,Arial,sans-serif;fill:#dceee8}
      .stable-visual-label{font:800 14px Verdana,Arial,sans-serif;fill:#ffffff}
      @media(max-width:760px){.visual-intro .visual-card figcaption{font-size:.9rem}}
    `;
    document.head.appendChild(style);
  }

  function visual01() {
    return `
      <title>Situation déclenchante : ni trop peu ni trop d’eau</title>
      <desc>À gauche, une plante manque d’eau. À droite, une plante trop arrosée souffre d’un manque d’oxygène au niveau des racines. Dans les deux cas, elle peut mourir.</desc>
      <defs>
        <linearGradient id="v01Bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d3027"/><stop offset="1" stop-color="#061712"/></linearGradient>
        <linearGradient id="v01Dry" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0c2"/><stop offset="1" stop-color="#f7d7a6"/></linearGradient>
        <linearGradient id="v01Wet" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dff7ff"/><stop offset="1" stop-color="#bfe8f6"/></linearGradient>
        <filter id="v01Shadow"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".28"/></filter>
      </defs>
      <rect width="640" height="360" rx="24" fill="url(#v01Bg)"/>
      <text x="28" y="39" class="stable-visual-title">Trouver le juste arrosage</text>
      <text x="28" y="62" class="stable-visual-small">Le système doit éviter deux situations dangereuses pour la plante.</text>

      <g filter="url(#v01Shadow)">
        <rect x="24" y="82" width="286" height="222" rx="18" fill="url(#v01Dry)"/>
        <rect x="330" y="82" width="286" height="222" rx="18" fill="url(#v01Wet)"/>
      </g>

      <!-- Trop peu d'eau -->
      <circle cx="260" cy="118" r="25" fill="#ffd166"/>
      <rect x="24" y="225" width="286" height="79" fill="#795033"/>
      <path d="M49 268 l18-11 18 12 20-15 20 14 18-12 20 13" fill="none" stroke="#d69b68" stroke-width="4"/>
      <path d="M146 228 C148 188 157 157 172 124" fill="none" stroke="#4a8b54" stroke-width="9" stroke-linecap="round"/>
      <path d="M166 158 C136 145 119 155 120 177 C142 181 157 173 166 158Z" fill="#58a368"/>
      <g fill="#d94767"><circle cx="173" cy="116" r="16"/><circle cx="160" cy="128" r="12"/><circle cx="187" cy="129" r="12"/></g>
      <text x="42" y="110" fill="#7c2d12" font-size="19" font-weight="900">Trop peu d’eau</text>
      <text x="42" y="136" fill="#63341f" font-size="14" font-weight="700">La plante se flétrit.</text>
      <text x="42" y="158" fill="#63341f" font-size="13">Les racines manquent d’eau.</text>

      <!-- Trop d'eau -->
      <rect x="330" y="225" width="286" height="79" fill="#5b4a3f"/>
      <rect x="330" y="247" width="286" height="57" fill="#4fc5e8" opacity=".78"/>
      <path d="M330 247 Q355 239 380 247 T430 247 T480 247 T530 247 T616 247" fill="none" stroke="#e9fcff" stroke-width="4"/>
      <path d="M470 228 C469 187 461 156 446 124" fill="none" stroke="#6f8f5c" stroke-width="9" stroke-linecap="round"/>
      <path d="M452 159 C482 146 499 157 497 179 C476 181 461 174 452 159Z" fill="#8ca66a"/>
      <g fill="#b66e79"><circle cx="445" cy="116" r="16"/><circle cx="432" cy="128" r="12"/><circle cx="459" cy="129" r="12"/></g>
      <path d="M438 264 C454 273 461 283 466 298 M477 264 C463 274 458 284 456 299" fill="none" stroke="#6a4935" stroke-width="4"/>
      <circle cx="370" cy="267" r="5" fill="#effdff" opacity=".75"/><circle cx="560" cy="282" r="6" fill="#effdff" opacity=".75"/>
      <text x="348" y="110" fill="#075985" font-size="19" font-weight="900">Trop d’eau</text>
      <text x="348" y="136" fill="#164e63" font-size="14" font-weight="700">Les racines s’asphyxient.</text>
      <text x="348" y="158" fill="#164e63" font-size="13">Elles peuvent pourrir.</text>

      <rect x="96" y="316" width="448" height="31" rx="15.5" fill="#0b2a21" stroke="#8ee2c1" stroke-width="1.5"/>
      <text x="320" y="337" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="900">Dans les deux cas, la plante peut mourir.</text>
    `;
  }

  function visual02() {
    return `
      <title>Prototype final attendu du jardin connecté</title>
      <desc>Les capteurs d'humidité, de luminosité et de niveau envoient leurs mesures à l'Arduino. La sortie D6 commande le relais. Une alimentation séparée fournit l'énergie de la pompe. L'eau va du réservoir à la plante.</desc>
      <defs>
        <linearGradient id="v02Bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0b2430"/><stop offset="1" stop-color="#061319"/></linearGradient>
        <filter id="v02Shadow"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".35"/></filter>
        <marker id="v02ArrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#67d6ff"/></marker>
        <marker id="v02ArrowOrange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#ff9f68"/></marker>
      </defs>
      <rect width="640" height="360" rx="24" fill="url(#v02Bg)"/>
      <text x="28" y="39" class="stable-visual-title">Prototype final attendu</text>
      <text x="28" y="62" class="stable-visual-small">Mesurer → traiter → commander → arroser uniquement si nécessaire</text>

      <g filter="url(#v02Shadow)">
        <rect x="20" y="82" width="190" height="232" rx="18" fill="#0c3025" stroke="#2f7d64" stroke-width="2"/>
        <rect x="225" y="82" width="185" height="232" rx="18" fill="#102333" stroke="#315271" stroke-width="2"/>
        <rect x="425" y="82" width="195" height="232" rx="18" fill="#123025" stroke="#2f7d64" stroke-width="2"/>
      </g>

      <text x="38" y="108" class="stable-visual-subtitle">Capteurs et plante</text>
      <text x="243" y="108" class="stable-visual-subtitle">Arduino</text>
      <text x="443" y="108" class="stable-visual-subtitle">Énergie et eau</text>

      <!-- Zone capteurs -->
      <circle cx="66" cy="147" r="16" fill="#ffd166" stroke="#b98514" stroke-width="2"/>
      <text x="90" y="144" class="stable-visual-label">LDR</text><text x="90" y="161" class="stable-visual-small">Luminosité → A1</text>
      <rect x="44" y="191" width="33" height="40" rx="6" fill="#657f88" stroke="#eaf6f8" stroke-width="2"/>
      <rect x="49" y="228" width="7" height="42" rx="3" fill="#cbd8dc"/><rect x="65" y="228" width="7" height="42" rx="3" fill="#cbd8dc"/>
      <text x="88" y="211" class="stable-visual-label">Humidité</text><text x="88" y="228" class="stable-visual-small">Sol → A0</text>
      <rect x="108" y="272" width="80" height="21" rx="10" fill="#6b432c"/>
      <path d="M148 272v-36m0 10l-17-14m17 7l18-13" fill="none" stroke="#63db8d" stroke-width="5"/>

      <!-- Arduino -->
      <rect x="258" y="127" width="120" height="138" rx="17" fill="#167464" stroke="#a6eedb" stroke-width="3"/>
      <rect x="278" y="145" width="45" height="28" rx="5" fill="#d9e4e8"/>
      <rect x="308" y="183" width="45" height="38" rx="5" fill="#1e2d34"/>
      <text x="318" y="242" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="900">UNO R3 / R4</text>
      <g font-size="11" font-weight="900" text-anchor="middle"><rect x="231" y="142" width="31" height="22" rx="6" fill="#6fd3ff"/><text x="246.5" y="157" fill="#062015">A0</text><rect x="231" y="176" width="31" height="22" rx="6" fill="#ffd166"/><text x="246.5" y="191" fill="#513a00">A1</text><rect x="231" y="210" width="31" height="22" rx="6" fill="#b78cff"/><text x="246.5" y="225" fill="#ffffff">A2</text><rect x="374" y="210" width="31" height="22" rx="6" fill="#ff9f68"/><text x="389.5" y="225" fill="#542000">D6</text></g>
      <text x="258" y="288" class="stable-visual-small">Comparer les mesures aux seuils</text>

      <!-- Réservoir, niveau, relais, pompe -->
      <rect x="455" y="130" width="58" height="104" rx="10" fill="#d9f4ff22" stroke="#dff8ff" stroke-width="3"/>
      <rect x="461" y="174" width="46" height="54" rx="6" fill="#47bce5"/>
      <rect x="478" y="145" width="9" height="72" rx="4" fill="#e2edf0"/><rect x="469" y="170" width="27" height="12" rx="6" fill="#ffd166"/>
      <text x="446" y="252" class="stable-visual-small">Niveau → A2</text>
      <rect x="535" y="132" width="61" height="40" rx="8" fill="#ff9f68"/><text x="565.5" y="157" text-anchor="middle" fill="#562000" font-size="13" font-weight="900">RELAIS</text>
      <rect x="521" y="207" width="86" height="54" rx="20" fill="#7d8d94" stroke="#e6eef0" stroke-width="3"/><circle cx="545" cy="234" r="14" fill="#d9e4e8" stroke="#5b6c73" stroke-width="4"/><text x="574" y="238" fill="#ffffff" font-size="13" font-weight="900">POMPE</text>
      <rect x="438" y="274" width="166" height="26" rx="10" fill="#161f25" stroke="#6e7f87"/><text x="521" y="292" text-anchor="middle" fill="#dce9ed" font-size="11" font-weight="800">Alimentation séparée TBT</text>

      <!-- Liaisons -->
      <path d="M77 147 H225" fill="none" stroke="#ffd166" stroke-width="4"/>
      <path d="M77 210 H225" fill="none" stroke="#6fd3ff" stroke-width="4"/>
      <path d="M478 170 H410" fill="none" stroke="#b78cff" stroke-width="4"/>
      <path d="M405 221 H535" fill="none" stroke="#ff9f68" stroke-width="4" marker-end="url(#v02ArrowOrange)"/>
      <path d="M521 287 H535 V172" fill="none" stroke="#ff7b72" stroke-width="3"/>
      <path d="M513 198 H521" fill="none" stroke="#67d6ff" stroke-width="7" marker-end="url(#v02ArrowBlue)"/>
      <path d="M607 234 H617 V308 H188 V282" fill="none" stroke="#67d6ff" stroke-width="7" marker-end="url(#v02ArrowBlue)"/>
      <text x="510" y="191" fill="#b9eaff" font-size="10" font-weight="800">Aspiration</text>
      <text x="430" y="327" fill="#b9eaff" font-size="10" font-weight="800">Refoulement vers la plante</text>
    `;
  }

  function replaceSvg(svg, id) {
    if (!svg || svg.dataset.stableVisual === id) return;
    svg.setAttribute("viewBox", "0 0 640 360");
    svg.dataset.stableVisual = id;
    svg.innerHTML = id === "v01" ? visual01() : visual02();
  }

  function enhance(root = document) {
    root.querySelectorAll?.('svg use[href$="#v01"], svg use[href$="#v02"]').forEach(use => {
      const id = use.getAttribute("href").endsWith("#v01") ? "v01" : "v02";
      const svg = use.closest("svg");
      replaceSvg(svg, id);
      const figure = svg?.closest("figure");
      const caption = figure?.querySelector("figcaption");
      if (caption) {
        caption.innerHTML = id === "v01"
          ? "<strong>Situation déclenchante</strong>Une plante peut mourir si elle manque d’eau, mais aussi si elle est trop arrosée. Le défi consiste à apporter la bonne quantité d’eau au bon moment."
          : "<strong>Prototype final attendu</strong>Les capteurs mesurent, l’Arduino décide, D6 commande le relais et une alimentation séparée fournit l’énergie nécessaire à la pompe.";
      }
    });
  }

  enhance();
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
    }));
  }).observe(document.body, {childList:true, subtree:true});
})();
