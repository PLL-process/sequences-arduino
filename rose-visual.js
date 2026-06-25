/* Remplace le symbole floral simplifié par un rosier SVG animé et accessible. */
"use strict";

(() => {
  const plant = document.getElementById("plant");
  if (!plant) return;

  const style = document.createElement("style");
  style.id = "technoquest-rose-styles";
  style.textContent = `
    .plant.rose-plant {
      left: 24%;
      bottom: 52px;
      width: 175px;
      height: 215px;
      font-size: 0;
      color: inherit;
      text-shadow: none;
      transform-origin: 50% 100%;
      filter: drop-shadow(0 8px 5px #0005);
      transition: transform 1.6s ease, filter 1.6s ease;
    }
    .rose-plant svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .rose-plant .rose-whole,
    .rose-plant .rose-bloom,
    .rose-plant .rose-leaf,
    .rose-plant .rose-stem,
    .rose-plant .rose-bud {
      transform-box: fill-box;
      transition: transform 1.6s ease, filter 1.6s ease, opacity 1.2s ease;
    }
    .rose-plant .rose-whole { transform-origin: 50% 100%; }
    .rose-plant .rose-bloom { transform-origin: 50% 80%; }
    .rose-plant .rose-leaf { transform-origin: 50% 50%; }
    .rose-plant .rose-stem { transform-origin: 50% 100%; }
    .rose-plant .overwater-spots { opacity: 0; transition: opacity 1.2s ease; }
    .rose-plant .rose-highlight { opacity: .72; }

    .plant.rose-plant.state-healthy {
      transform: translateY(-4px) scale(1.05);
      filter: drop-shadow(0 9px 6px #0005) saturate(1.08) brightness(1.04);
    }
    .plant.rose-plant.state-healthy .rose-bloom-main { transform: scale(1.08); }
    .plant.rose-plant.state-healthy .rose-bloom-left { transform: rotate(-3deg) scale(1.03); }
    .plant.rose-plant.state-healthy .rose-bloom-right { transform: rotate(3deg) scale(1.03); }

    .plant.rose-plant.state-stressed {
      transform: translateY(5px) rotate(-3deg) scale(.98);
      filter: drop-shadow(0 7px 5px #0005) saturate(.78) brightness(.92);
    }
    .plant.rose-plant.state-stressed .rose-bloom-main { transform: rotate(8deg) translateY(5px) scale(.96); }
    .plant.rose-plant.state-stressed .rose-bloom-left { transform: rotate(-10deg) translateY(4px) scale(.94); }
    .plant.rose-plant.state-stressed .rose-bloom-right { transform: rotate(12deg) translateY(5px) scale(.94); }
    .plant.rose-plant.state-stressed .rose-leaf-left { transform: rotate(-13deg) translateY(3px); }
    .plant.rose-plant.state-stressed .rose-leaf-right { transform: rotate(13deg) translateY(3px); }

    .plant.rose-plant.state-wilted {
      transform: translateY(18px) rotate(-11deg) scale(.88);
      filter: drop-shadow(0 5px 4px #0005) saturate(.42) brightness(.72);
    }
    .plant.rose-plant.state-wilted .rose-whole { transform: skewX(-4deg); }
    .plant.rose-plant.state-wilted .rose-bloom-main { transform: rotate(30deg) translate(7px,16px) scale(.82); }
    .plant.rose-plant.state-wilted .rose-bloom-left { transform: rotate(-28deg) translate(-5px,12px) scale(.78); }
    .plant.rose-plant.state-wilted .rose-bloom-right { transform: rotate(32deg) translate(7px,13px) scale(.78); }
    .plant.rose-plant.state-wilted .rose-leaf-left { transform: rotate(-34deg) translateY(8px) scale(.9); }
    .plant.rose-plant.state-wilted .rose-leaf-right { transform: rotate(34deg) translateY(8px) scale(.9); }
    .plant.rose-plant.state-wilted .rose-bud { transform: rotate(25deg) translateY(10px); }

    .plant.rose-plant.state-overwatered {
      transform: translateY(10px) rotate(5deg) scale(.96);
      filter: drop-shadow(0 7px 5px #0005) saturate(.68) hue-rotate(12deg) brightness(.9);
    }
    .plant.rose-plant.state-overwatered .rose-bloom-main { transform: rotate(8deg) translateY(8px) scale(.96); }
    .plant.rose-plant.state-overwatered .rose-bloom-left { transform: rotate(-12deg) translateY(6px) scale(.93); }
    .plant.rose-plant.state-overwatered .rose-bloom-right { transform: rotate(15deg) translateY(7px) scale(.93); }
    .plant.rose-plant.state-overwatered .rose-leaf-left { transform: rotate(-18deg) translateY(5px); }
    .plant.rose-plant.state-overwatered .rose-leaf-right { transform: rotate(18deg) translateY(5px); }
    .plant.rose-plant.state-overwatered .overwater-spots { opacity: .9; }

    @media (max-width: 720px) {
      .plant.rose-plant { left: 22%; width: 145px; height: 185px; bottom: 54px; }
    }
    @media (max-width: 460px) {
      .plant.rose-plant { left: 18%; width: 120px; height: 160px; bottom: 56px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .plant.rose-plant,
      .rose-plant * { transition-duration: .001ms !important; }
    }
  `;
  document.head.appendChild(style);

  plant.classList.add("rose-plant");
  plant.setAttribute("role", "img");
  plant.setAttribute("aria-label", "Rosier du jardin connecté");
  plant.innerHTML = `
    <svg viewBox="0 0 180 220" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="roseStemGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#2e6f42"/>
          <stop offset=".55" stop-color="#4f9a5d"/>
          <stop offset="1" stop-color="#245a36"/>
        </linearGradient>
        <radialGradient id="rosePetalMain" cx="45%" cy="38%" r="70%">
          <stop offset="0" stop-color="#ffb3c1"/>
          <stop offset=".45" stop-color="#ef476f"/>
          <stop offset="1" stop-color="#9f1239"/>
        </radialGradient>
        <radialGradient id="rosePetalLight" cx="42%" cy="32%" r="75%">
          <stop offset="0" stop-color="#ffd0d9"/>
          <stop offset=".5" stop-color="#ff6b8a"/>
          <stop offset="1" stop-color="#b51f4b"/>
        </radialGradient>
        <linearGradient id="roseLeafGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7bc96f"/>
          <stop offset=".55" stop-color="#3e8f4f"/>
          <stop offset="1" stop-color="#1f5c35"/>
        </linearGradient>
        <filter id="roseSoftShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#430819" flood-opacity=".38"/>
        </filter>
      </defs>

      <g class="rose-whole">
        <ellipse cx="91" cy="208" rx="49" ry="8" fill="#2c1d16" opacity=".42"/>

        <g class="rose-stem rose-stem-main">
          <path d="M91 205 C89 170 92 139 91 105 C90 83 89 64 88 42" fill="none" stroke="url(#roseStemGradient)" stroke-width="8" stroke-linecap="round"/>
          <path d="M91 158 C69 147 55 131 47 110" fill="none" stroke="url(#roseStemGradient)" stroke-width="5" stroke-linecap="round"/>
          <path d="M91 136 C114 124 126 109 132 87" fill="none" stroke="url(#roseStemGradient)" stroke-width="5" stroke-linecap="round"/>
          <path d="M89 107 C73 94 66 79 65 63" fill="none" stroke="url(#roseStemGradient)" stroke-width="4" stroke-linecap="round"/>
          <path d="M90 91 C105 81 115 67 118 52" fill="none" stroke="url(#roseStemGradient)" stroke-width="4" stroke-linecap="round"/>
        </g>

        <g class="rose-leaf rose-leaf-left" fill="url(#roseLeafGradient)" stroke="#184b2d" stroke-width="1.4">
          <path d="M66 151 C44 143 33 128 38 116 C54 115 69 125 77 142 C74 146 70 149 66 151 Z"/>
          <path d="M60 139 L39 118" fill="none" stroke="#d2f0c9" stroke-width="1.2" opacity=".55"/>
          <path d="M54 126 L49 140 M47 121 L40 132" fill="none" stroke="#d2f0c9" stroke-width=".9" opacity=".45"/>
        </g>
        <g class="rose-leaf rose-leaf-right" fill="url(#roseLeafGradient)" stroke="#184b2d" stroke-width="1.4">
          <path d="M109 137 C129 127 146 126 153 137 C145 152 128 160 109 154 C106 148 106 142 109 137 Z"/>
          <path d="M116 148 L151 137" fill="none" stroke="#d2f0c9" stroke-width="1.2" opacity=".55"/>
          <path d="M129 144 L136 154 M140 141 L146 148" fill="none" stroke="#d2f0c9" stroke-width=".9" opacity=".45"/>
        </g>
        <g class="rose-leaf rose-leaf-left" transform="translate(7 -42) scale(.78)" fill="url(#roseLeafGradient)" stroke="#184b2d" stroke-width="1.4">
          <path d="M66 151 C44 143 33 128 38 116 C54 115 69 125 77 142 C74 146 70 149 66 151 Z"/>
          <path d="M60 139 L39 118" fill="none" stroke="#d2f0c9" stroke-width="1.1" opacity=".5"/>
        </g>
        <g class="rose-leaf rose-leaf-right" transform="translate(-4 -54) scale(.72)" fill="url(#roseLeafGradient)" stroke="#184b2d" stroke-width="1.4">
          <path d="M109 137 C129 127 146 126 153 137 C145 152 128 160 109 154 C106 148 106 142 109 137 Z"/>
          <path d="M116 148 L151 137" fill="none" stroke="#d2f0c9" stroke-width="1.1" opacity=".5"/>
        </g>

        <g class="rose-bloom rose-bloom-main" transform="translate(89 35)" filter="url(#roseSoftShadow)">
          <ellipse rx="28" ry="18" fill="#8f1537" opacity=".5"/>
          <ellipse rx="20" ry="29" transform="rotate(-8)" fill="url(#rosePetalMain)"/>
          <ellipse rx="20" ry="28" transform="rotate(54)" fill="url(#rosePetalLight)"/>
          <ellipse rx="20" ry="28" transform="rotate(113)" fill="url(#rosePetalMain)"/>
          <ellipse rx="20" ry="28" transform="rotate(174)" fill="url(#rosePetalLight)"/>
          <ellipse rx="20" ry="28" transform="rotate(235)" fill="url(#rosePetalMain)"/>
          <ellipse rx="20" ry="28" transform="rotate(296)" fill="url(#rosePetalLight)"/>
          <path d="M-13 -3 C-3 -19 18 -14 15 2 C12 17 -7 18 -15 6 C-7 10 5 7 5 0 C4 -7 -5 -8 -13 -3 Z" fill="#c9184a"/>
          <path class="rose-highlight" d="M-8 -12 C-2 -18 8 -15 11 -8" fill="none" stroke="#ffd2dc" stroke-width="3" stroke-linecap="round"/>
        </g>

        <g class="rose-bloom rose-bloom-left" transform="translate(48 103) scale(.78)" filter="url(#roseSoftShadow)">
          <ellipse rx="20" ry="27" transform="rotate(-10)" fill="url(#rosePetalMain)"/>
          <ellipse rx="18" ry="25" transform="rotate(52)" fill="url(#rosePetalLight)"/>
          <ellipse rx="18" ry="25" transform="rotate(112)" fill="url(#rosePetalMain)"/>
          <ellipse rx="18" ry="25" transform="rotate(175)" fill="url(#rosePetalLight)"/>
          <ellipse rx="18" ry="25" transform="rotate(238)" fill="url(#rosePetalMain)"/>
          <path d="M-9 -2 C-2 -13 13 -10 11 2 C9 12 -5 13 -11 5 C-5 7 3 5 3 0 C3 -5 -4 -6 -9 -2 Z" fill="#b51745"/>
        </g>

        <g class="rose-bloom rose-bloom-right" transform="translate(132 82) scale(.74)" filter="url(#roseSoftShadow)">
          <ellipse rx="20" ry="27" transform="rotate(8)" fill="url(#rosePetalMain)"/>
          <ellipse rx="18" ry="25" transform="rotate(69)" fill="url(#rosePetalLight)"/>
          <ellipse rx="18" ry="25" transform="rotate(129)" fill="url(#rosePetalMain)"/>
          <ellipse rx="18" ry="25" transform="rotate(190)" fill="url(#rosePetalLight)"/>
          <ellipse rx="18" ry="25" transform="rotate(251)" fill="url(#rosePetalMain)"/>
          <path d="M-9 -2 C-2 -13 13 -10 11 2 C9 12 -5 13 -11 5 C-5 7 3 5 3 0 C3 -5 -4 -6 -9 -2 Z" fill="#b51745"/>
        </g>

        <g class="rose-bud" transform="translate(64 61)">
          <path d="M0 19 C-7 9 -8 -4 0 -12 C9 -4 9 9 0 19 Z" fill="url(#rosePetalMain)" stroke="#8e1839" stroke-width="1.2"/>
          <path d="M-8 16 L0 22 L8 16" fill="#3f8f51"/>
        </g>

        <g class="overwater-spots" fill="#efd45f" stroke="#8a6d13" stroke-width=".7">
          <circle cx="51" cy="133" r="4"/><circle cx="125" cy="145" r="3.5"/><circle cx="75" cy="103" r="3"/>
        </g>
      </g>
    </svg>`;
})();
