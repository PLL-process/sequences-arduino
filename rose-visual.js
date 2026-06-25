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
      bottom: 50px;
      width: 178px;
      height: 220px;
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
    .rose-plant .overwater-spots {
      opacity: 0;
      transition: opacity 1.2s ease;
    }
    .rose-plant .rose-highlight {
      opacity: .75;
    }

    .plant.rose-plant.state-healthy {
      transform: translateY(-4px) scale(1.04);
      filter: drop-shadow(0 9px 6px #0005) saturate(1.08) brightness(1.04);
    }
    .plant.rose-plant.state-stressed {
      transform: translateY(5px) rotate(-3deg) scale(.98);
      filter: drop-shadow(0 7px 5px #0005) saturate(.78) brightness(.92);
    }
    .plant.rose-plant.state-wilted {
      transform: translateY(18px) rotate(-11deg) scale(.88);
      filter: drop-shadow(0 5px 4px #0005) saturate(.42) brightness(.72);
    }
    .plant.rose-plant.state-overwatered {
      transform: translateY(10px) rotate(5deg) scale(.96);
      filter: drop-shadow(0 7px 5px #0005) saturate(.68) hue-rotate(12deg) brightness(.9);
    }
    .plant.rose-plant.state-overwatered .overwater-spots {
      opacity: .9;
    }

    @media (max-width: 720px) {
      .plant.rose-plant {
        left: 22%;
        width: 148px;
        height: 188px;
        bottom: 52px;
      }
    }
    @media (max-width: 460px) {
      .plant.rose-plant {
        left: 18%;
        width: 122px;
        height: 162px;
        bottom: 54px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .plant.rose-plant {
        transition-duration: .001ms !important;
      }
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
          <stop offset="0" stop-color="#245a36"/>
          <stop offset=".5" stop-color="#4f9a5d"/>
          <stop offset="1" stop-color="#2e6f42"/>
        </linearGradient>
        <radialGradient id="rosePetalMain" cx="42%" cy="34%" r="72%">
          <stop offset="0" stop-color="#ffd0d9"/>
          <stop offset=".38" stop-color="#ff6b8a"/>
          <stop offset=".72" stop-color="#d82f62"/>
          <stop offset="1" stop-color="#8f1537"/>
        </radialGradient>
        <radialGradient id="rosePetalDark" cx="45%" cy="38%" r="75%">
          <stop offset="0" stop-color="#ffb3c1"/>
          <stop offset=".5" stop-color="#ef476f"/>
          <stop offset="1" stop-color="#9f1239"/>
        </radialGradient>
        <linearGradient id="roseLeafGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7bc96f"/>
          <stop offset=".52" stop-color="#3e8f4f"/>
          <stop offset="1" stop-color="#1f5c35"/>
        </linearGradient>
        <filter id="roseSoftShadow" x="-35%" y="-35%" width="170%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#430819" flood-opacity=".38"/>
        </filter>
      </defs>

      <ellipse cx="90" cy="209" rx="48" ry="8" fill="#2c1d16" opacity=".42"/>

      <g fill="none" stroke="url(#roseStemGradient)" stroke-linecap="round">
        <path d="M90 205 C89 171 91 136 90 102 C90 79 90 58 90 39" stroke-width="8"/>
        <path d="M90 158 C72 148 58 133 49 112" stroke-width="5"/>
        <path d="M90 137 C110 126 124 109 132 88" stroke-width="5"/>
        <path d="M90 110 C75 98 67 82 65 65" stroke-width="4"/>
        <path d="M90 91 C106 80 116 66 119 52" stroke-width="4"/>
      </g>

      <g fill="url(#roseLeafGradient)" stroke="#184b2d" stroke-width="1.4">
        <path d="M66 153 C44 145 32 130 38 116 C55 115 70 126 78 143 C75 148 71 151 66 153 Z"/>
        <path d="M109 138 C130 128 146 128 153 138 C145 153 128 161 109 155 C106 149 106 143 109 138 Z"/>
        <path d="M70 112 C55 107 47 97 51 87 C64 86 76 94 81 106 C78 109 74 111 70 112 Z"/>
        <path d="M105 102 C120 95 132 96 137 104 C131 115 118 120 105 116 C103 111 103 106 105 102 Z"/>
      </g>
      <g fill="none" stroke="#d2f0c9" stroke-width="1" opacity=".5">
        <path d="M61 140 L39 118 M117 149 L151 138 M64 103 L52 89 M113 111 L136 104"/>
      </g>

      <g transform="translate(90 37)" filter="url(#roseSoftShadow)">
        <ellipse rx="21" ry="30" transform="rotate(-5)" fill="url(#rosePetalDark)"/>
        <ellipse rx="20" ry="29" transform="rotate(55)" fill="url(#rosePetalMain)"/>
        <ellipse rx="20" ry="29" transform="rotate(115)" fill="url(#rosePetalDark)"/>
        <ellipse rx="20" ry="29" transform="rotate(175)" fill="url(#rosePetalMain)"/>
        <ellipse rx="20" ry="29" transform="rotate(235)" fill="url(#rosePetalDark)"/>
        <ellipse rx="20" ry="29" transform="rotate(295)" fill="url(#rosePetalMain)"/>
        <path d="M-13 -3 C-3 -19 18 -14 15 2 C12 17 -7 18 -15 6 C-7 10 5 7 5 0 C4 -7 -5 -8 -13 -3 Z" fill="#c9184a"/>
        <path class="rose-highlight" d="M-8 -12 C-2 -18 8 -15 11 -8" fill="none" stroke="#ffd2dc" stroke-width="3" stroke-linecap="round"/>
      </g>

      <g transform="translate(49 104) scale(.76)" filter="url(#roseSoftShadow)">
        <ellipse rx="20" ry="27" transform="rotate(-10)" fill="url(#rosePetalDark)"/>
        <ellipse rx="18" ry="25" transform="rotate(52)" fill="url(#rosePetalMain)"/>
        <ellipse rx="18" ry="25" transform="rotate(112)" fill="url(#rosePetalDark)"/>
        <ellipse rx="18" ry="25" transform="rotate(175)" fill="url(#rosePetalMain)"/>
        <ellipse rx="18" ry="25" transform="rotate(238)" fill="url(#rosePetalDark)"/>
        <path d="M-9 -2 C-2 -13 13 -10 11 2 C9 12 -5 13 -11 5 C-5 7 3 5 3 0 C3 -5 -4 -6 -9 -2 Z" fill="#b51745"/>
      </g>

      <g transform="translate(132 83) scale(.72)" filter="url(#roseSoftShadow)">
        <ellipse rx="20" ry="27" transform="rotate(8)" fill="url(#rosePetalDark)"/>
        <ellipse rx="18" ry="25" transform="rotate(69)" fill="url(#rosePetalMain)"/>
        <ellipse rx="18" ry="25" transform="rotate(129)" fill="url(#rosePetalDark)"/>
        <ellipse rx="18" ry="25" transform="rotate(190)" fill="url(#rosePetalMain)"/>
        <ellipse rx="18" ry="25" transform="rotate(251)" fill="url(#rosePetalDark)"/>
        <path d="M-9 -2 C-2 -13 13 -10 11 2 C9 12 -5 13 -11 5 C-5 7 3 5 3 0 C3 -5 -4 -6 -9 -2 Z" fill="#b51745"/>
      </g>

      <g transform="translate(65 64)">
        <path d="M0 18 C-7 8 -8 -4 0 -12 C9 -4 9 8 0 18 Z" fill="url(#rosePetalDark)" stroke="#8e1839" stroke-width="1.2"/>
        <path d="M-8 15 L0 22 L8 15" fill="#3f8f51"/>
      </g>

      <g class="overwater-spots" fill="#efd45f" stroke="#8a6d13" stroke-width=".7">
        <circle cx="52" cy="134" r="4"/>
        <circle cx="126" cy="146" r="3.5"/>
        <circle cx="76" cy="104" r="3"/>
      </g>
    </svg>`;
})();
