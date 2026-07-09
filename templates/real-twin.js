/*
 * TechnoQuest — chargement du véritable jumeau numérique dans le template.
 *
 * Ce composant reprend le SVG commun des séances publiques, puis charge
 * exactement les mêmes scripts d’amélioration que le parcours principal.
 */
"use strict";

(() => {
  // Récupérer la configuration de la séance affichée dans le template.
  const config = window.TechnoQuestSessionTemplateConfig || { id: 1, title: "Observer les signaux" };

  // Construire le jumeau uniquement lorsque son conteneur est disponible.
  const initializeRealTwin = () => {
    // Conserver le conteneur déjà utilisé par le moteur du template.
    const host = document.getElementById("templateTwin");
    if (!host || host.dataset.realTwinLoaded === "true") return;

    // Marquer le composant afin d’éviter un second chargement.
    host.dataset.realTwinLoaded = "true";
    host.className = "tq-real-twin-host";

    // Déterminer les mises en évidence propres à la séance courante.
    const focus = Number(config.id || 1);
    const sensorGlow = [1, 2, 4, 6, 7, 8].includes(focus);
    const relayGlow = [3, 4, 5, 8].includes(focus);
    const waterVisible = [3, 4, 5, 6, 8].includes(focus);

    // Générer le même SVG de base que celui des huit séances publiques.
    const svg = `<svg viewBox="0 0 980 510" role="img" aria-label="Jumeau numérique premium de la séance ${focus}">
      <defs>
        <linearGradient id="board" x2="0" y2="1"><stop stop-color="#22c4ae"/><stop offset="1" stop-color="#0f5f55"/></linearGradient>
        <linearGradient id="tank" x2="0" y2="1"><stop stop-color="#b8efff"/><stop offset="1" stop-color="#248fc7"/></linearGradient>
        <linearGradient id="metal"><stop stop-color="#e4edf0"/><stop offset="1" stop-color="#5b6c74"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".35"/></filter>
        <filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="900" height="510" fill="transparent"/>
      <circle cx="895" cy="70" r="38" fill="#ffd166" filter="url(#glow)"/>
      <path d="M120 394 C120 330 137 266 165 210" stroke="#226c3a" stroke-width="13" fill="none" stroke-linecap="round"/>
      <ellipse cx="126" cy="283" rx="48" ry="21" fill="#55a86b" transform="rotate(-28 126 283)"/>
      <ellipse cx="183" cy="300" rx="43" ry="18" fill="#3e9559" transform="rotate(25 183 300)"/>
      <g fill="#df4a70" stroke="#922440" stroke-width="3"><circle cx="168" cy="196" r="25"/><circle cx="148" cy="213" r="19"/><circle cx="190" cy="214" r="19"/><circle cx="168" cy="221" r="20"/></g><circle cx="168" cy="209" r="8" fill="#ffd166"/>
      <ellipse cx="160" cy="410" rx="105" ry="25" fill="#4e2e1e"/><ellipse class="twin-water" cx="160" cy="410" rx="95" ry="18" fill="#38bdf8" opacity=".35"/>

      <g class="highlight" style="color:#60a5fa" filter="url(#shadow)"><rect x="55" y="316" width="42" height="50" rx="8" fill="#607984" stroke="#f3fbff" stroke-width="3"/><rect x="62" y="363" width="8" height="55" rx="4" fill="#d6e2e5"/><rect x="81" y="363" width="8" height="55" rx="4" fill="#d6e2e5"/><text x="35" y="455" fill="#fff" font-size="13" font-weight="800">Humidité A0</text>${sensorGlow ? '<circle cx="76" cy="340" r="38" fill="none" stroke="#60a5fa" stroke-width="3" opacity=".75"/>' : ""}</g>
      <g class="highlight" style="color:#facc15"><circle cx="265" cy="132" r="24" fill="#fde047" stroke="#a66f05" stroke-width="3"/><text x="265" y="137" text-anchor="middle" fill="#6b4300" font-size="11" font-weight="900">LDR</text><text x="226" y="176" fill="#fff" font-size="13" font-weight="800">Lumière A1</text></g>

      <g filter="url(#shadow)"><rect x="342" y="160" width="190" height="210" rx="24" fill="url(#board)" stroke="#bbfff2" stroke-width="3"/><rect x="370" y="189" width="58" height="38" rx="6" fill="#e1eaed"/><rect x="420" y="242" width="66" height="55" rx="7" fill="#17252b"/><text x="437" y="330" text-anchor="middle" fill="#fff" font-size="20" font-weight="900">ARDUINO</text><text x="437" y="351" text-anchor="middle" fill="#d7fff7" font-size="13">UNO R3 / UNO R4 Minima</text></g>
      <g font-size="13" font-weight="900" text-anchor="middle"><rect x="313" y="196" width="42" height="28" rx="8" fill="#60a5fa"/><text x="334" y="215" fill="#06111d">A0</text><rect x="313" y="242" width="42" height="28" rx="8" fill="#facc15"/><text x="334" y="261" fill="#4d3600">A1</text><rect x="519" y="196" width="42" height="28" rx="8" fill="#c084fc"/><text x="540" y="215" fill="#fff">A2</text><rect x="519" y="287" width="42" height="28" rx="8" fill="#fb923c"/><text x="540" y="306" fill="#4d1a00">D6</text></g>

      <g filter="url(#shadow)"><rect x="760" y="125" width="140" height="225" rx="22" fill="#dff7ff22" stroke="#dff8ff" stroke-width="4"/><rect x="770" y="212" width="120" height="128" rx="10" fill="url(#tank)"/><rect x="822" y="155" width="10" height="170" rx="5" fill="#e5eef1"/><rect x="806" y="205" width="46" height="20" rx="10" fill="#ffd166" stroke="#8d650d" stroke-width="2"/><text x="830" y="105" text-anchor="middle" fill="#fff" font-size="17" font-weight="900">Réservoir</text><text x="790" y="374" fill="#fff" font-size="13" font-weight="800">Niveau A2</text></g>

      <g filter="url(#shadow)" class="highlight" style="color:#fb923c"><rect x="600" y="278" width="70" height="55" rx="12" fill="#fb923c" stroke="#ffddb8" stroke-width="3"/><text x="635" y="301" text-anchor="middle" fill="#5e2400" font-size="14" font-weight="900">RELAIS</text><text x="635" y="320" text-anchor="middle" fill="#5e2400" font-size="11">D6</text>${relayGlow ? '<circle cx="657" cy="290" r="11" fill="#4ade80" filter="url(#glow)"/>' : ""}</g>
      <g filter="url(#shadow)"><rect x="780" y="390" width="170" height="72" rx="26" fill="url(#metal)" stroke="#e5eef1" stroke-width="3"/><circle cx="817" cy="426" r="25" fill="#475862" stroke="#dce7ea" stroke-width="3"/><g class="twin-rotor"><path d="M817 407V445M798 426H836" stroke="#fff" stroke-width="6"/><circle cx="817" cy="426" r="6" fill="#fff"/></g><text x="882" y="421" fill="#fff" font-size="15" font-weight="900">POMPE</text><text x="882" y="440" fill="#dbe8ec" font-size="11">Actionneur</text></g>
      <rect x="555" y="370" width="140" height="58" rx="13" fill="#151f27" stroke="#788991" stroke-width="2"/><text x="625" y="392" text-anchor="middle" fill="#ffe4c4" font-size="11" font-weight="800">ALIMENTATION</text><text x="625" y="409" text-anchor="middle" fill="#ffe4c4" font-size="11">séparée TBT</text>

      <path class="twin-signal" d="M97 340H280V210H313" fill="none" stroke="#60a5fa" stroke-width="5"/>
      <path class="twin-signal" d="M289 132H300V256H313" fill="none" stroke="#facc15" stroke-width="5"/>
      <path class="twin-signal" d="M806 215H585V210H561" fill="none" stroke="#c084fc" stroke-width="5"/>
      <path class="twin-signal" d="M561 301H600" fill="none" stroke="#fb923c" stroke-width="5"/>
      <path d="M670 305H730V360H805V390" fill="none" stroke="#fb7185" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="705" y="342" width="190" height="25" rx="8" fill="#07131fee" stroke="#fb7185" stroke-width="2"/><text x="800" y="359" text-anchor="middle" fill="#fff" font-size="11" font-weight="900">Circuit de puissance TBT</text>
      <path d="M882 328V370C882 382 872 386 858 386H830C815 386 806 396 806 410V426H780M780 426H710V470H180V420" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="twin-water" d="M882 328V370C882 382 872 386 858 386H830C815 386 806 396 806 410V426H780M780 426H710V470H180V420" fill="none" stroke="#67e8f9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" ${waterVisible ? 'opacity="1"' : 'opacity="0"'}/>
      <text x="724" y="484" fill="#e5f9ff" font-size="13" font-weight="900">Réservoir → pompe → plante</text>
      <rect x="354" y="112" width="166" height="46" rx="14" fill="#07131fee" stroke="#22d3ee" stroke-width="2"/><text x="437" y="132" text-anchor="middle" fill="#fff" font-size="13" font-weight="900">Séance ${focus}</text><text x="437" y="150" text-anchor="middle" fill="#dbe9ef" font-size="11">${String(config.title || "Observer les signaux")}</text>
    </svg>`;

    // Insérer le véritable jumeau et conserver les identifiants attendus par le template.
    host.innerHTML = `<div id="twinStage" class="twin-stage">${svg}</div>
      <span id="twinHumidityValue" hidden></span>
      <span id="twinPump" hidden></span>
      <p id="twinStatus" class="tq-real-twin-status" aria-live="polite">Prêt pour l’observation.</p>`;

    // Ajouter les styles communs indispensables au composant autonome.
    if (!document.getElementById("realTwinBaseStyles")) {
      const style = document.createElement("style");
      style.id = "realTwinBaseStyles";
      style.textContent = `
        .tq-real-twin-host{display:grid;gap:.65rem}
        .tq-real-twin-host .twin-stage{position:relative;aspect-ratio:16/9;overflow:hidden;border:1px solid #4c809c;border-radius:1.25rem;background:linear-gradient(#8cd8f2 0 42%,#4d8a4d 42% 55%,#5a3825 55%)}
        .tq-real-twin-host .twin-stage svg{display:block;width:100%;height:100%}
        .tq-real-twin-status{margin:0;padding:.65rem .75rem;border-left:4px solid #22d3ee;border-radius:.7rem;background:#07131f;color:#d9edf6;text-align:center}
        .twin-signal{stroke-dasharray:16 12;animation:signalFlow .65s linear infinite paused}
        .twin-water{stroke-dasharray:20 14;animation:waterFlow .6s linear infinite paused;opacity:0}
        .twin-rotor{transform-box:fill-box;transform-origin:center;animation:spin .45s linear infinite paused}
        .twin-stage.running .twin-signal,.twin-stage.running .twin-water,.twin-stage.running .twin-rotor{animation-play-state:running}
        .twin-stage.running .twin-water{opacity:1}
        .twin-stage.running .highlight{filter:drop-shadow(0 0 8px currentColor)}
        @keyframes signalFlow{to{stroke-dashoffset:-28}}
        @keyframes waterFlow{to{stroke-dashoffset:-34}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `;
      document.head.appendChild(style);
    }

    // Charger la feuille de style finale utilisée par les séances publiques.
    if (!document.querySelector('link[data-real-twin-layout="true"]')) {
      const layoutStyles = document.createElement("link");
      layoutStyles.rel = "stylesheet";
      layoutStyles.href = "../twin-layout-v5.css?v=8";
      layoutStyles.dataset.realTwinLayout = "true";
      document.head.appendChild(layoutStyles);
    }

    // Reproduire l’état d’animation demandé par le moteur du template.
    const stage = document.getElementById("twinStage");
    const observer = new MutationObserver(() => {
      stage.classList.toggle("running", host.classList.contains("is-running"));
    });
    observer.observe(host, { attributes: true, attributeFilter: ["class"] });

    // Charger les mêmes améliorations, dans le même ordre, que les séances publiques.
    const enhancementScripts = [
      "../twin-clarity-v3.js?v=2",
      "../twin-layout-v5.js?v=11",
      "../twin-ldr-symbol.js?v=1",
      "../twin-flow-clarity.js?v=6",
      "../twin-pump-water-inlet.js?v=4"
    ];

    // Charger chaque script après le précédent afin de préserver les dépendances SVG.
    enhancementScripts.reduce((promise, source) => promise.then(() => new Promise(resolve => {
      const script = document.createElement("script");
      script.src = source;
      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);
    })), Promise.resolve());
  };

  // La configuration est chargée en fin de document : le DOM existe normalement déjà.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRealTwin, { once: true });
  } else {
    initializeRealTwin();
  }
})();
