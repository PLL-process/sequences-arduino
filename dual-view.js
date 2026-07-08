"use strict";
(() => {
  const n = Number(document.body.dataset.session || 0);
  if (n < 1 || n > 8) return;
  const stage = document.getElementById("twinStage");
  if (!stage) return;

  const titles = ["","Observer les signaux","Calibrer un seuil","Analyser les chaînes","Protéger la pompe","Économiser l’eau","Décider avec trois données","Améliorer la durabilité","Défi ingénieur"];
  const image = `images/seance-${String(n).padStart(2,"0")}-reelle.png?v=3`;

  const style = document.createElement("style");
  style.textContent = `
    .dual-view-shell{display:grid;gap:.75rem}
    .dual-view-toolbar{display:flex;gap:.55rem;flex-wrap:wrap;align-items:center}
    .dual-view-toolbar button{padding:.65rem .85rem;border:1px solid #31536a;border-radius:10px;background:#0c1c2c;color:#fff;font-weight:850;cursor:pointer}
    .dual-view-toolbar button[aria-pressed="true"]{background:#0f766e;border-color:#67e8f9;box-shadow:0 0 0 2px #67e8f933}
    .dual-view-panel{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:14px;background:#fff}
    .dual-view-panel img{display:block;width:100%;height:100%;object-fit:contain;background:#fff}
    .schema-overlay{position:absolute;inset:0;pointer-events:none}
    .schema-overlay svg{width:100%;height:100%}
    .schema-wire{fill:none;stroke-width:7;stroke-linecap:round;stroke-dasharray:18 13;animation:dash 1.1s linear infinite}
    .schema-label rect{fill:#07131fee;stroke-width:2}
    .schema-label text{fill:#fff;font:800 22px system-ui,sans-serif;text-anchor:middle}
    .schema-caption{padding:.75rem .85rem;border:1px solid #31536a;border-left:5px solid var(--session-accent,#22d3ee);border-radius:11px;background:#07131f;color:#dce9ef;line-height:1.45}
    .reality-note{position:absolute;right:.8rem;bottom:.8rem;padding:.45rem .65rem;border-radius:9px;background:#07131fdd;color:#fff;font:800 .78rem system-ui,sans-serif}
    @keyframes dash{to{stroke-dashoffset:-31}}
    @media(prefers-reduced-motion:reduce){.schema-wire{animation:none}}
  `;
  document.head.appendChild(style);

  stage.className = "dual-view-shell";
  stage.style.aspectRatio = "auto";
  stage.style.background = "transparent";
  stage.innerHTML = `
    <div class="dual-view-toolbar" role="group" aria-label="Choix de la vue">
      <button type="button" data-view="schema" aria-pressed="true">Schéma / jumeau numérique</button>
      <button type="button" data-view="reality" aria-pressed="false">Voir le montage réel</button>
    </div>
    <div class="dual-view-panel">
      <img src="${image}" alt="Montage réel de la séance ${n} : ${titles[n]}">
      <div class="schema-overlay" data-pane="schema" aria-hidden="true">
        <svg viewBox="0 0 1280 720" role="img" aria-label="Vue pédagogique annotée du montage">
          <path class="schema-wire" d="M170 405 C330 300 430 285 545 300" stroke="#2563eb"/>
          <path class="schema-wire" d="M630 315 C760 315 820 325 915 370" stroke="#f97316"/>
          <path class="schema-wire" d="M930 430 C1040 500 1085 520 1150 505" stroke="#dc2626"/>
          <g class="schema-label" transform="translate(155 135)"><rect x="-115" y="-28" width="230" height="56" rx="14" stroke="#2563eb"/><text y="8">ACQUÉRIR · A0</text></g>
          <g class="schema-label" transform="translate(640 125)"><rect x="-120" y="-28" width="240" height="56" rx="14" stroke="#14b8a6"/><text y="8">TRAITER · Arduino</text></g>
          <g class="schema-label" transform="translate(1020 180)"><rect x="-125" y="-28" width="250" height="56" rx="14" stroke="#f97316"/><text y="8">DISTRIBUER · Relais</text></g>
          <g class="schema-label" transform="translate(1055 625)"><rect x="-120" y="-28" width="240" height="56" rx="14" stroke="#dc2626"/><text y="8">AGIR · Pompe</text></g>
        </svg>
      </div>
      <span class="reality-note" data-pane="reality" hidden>Vue réelle non annotée</span>
    </div>
    <p class="schema-caption" id="dualViewCaption">Vue pédagogique : les flèches relient les fonctions acquérir, traiter, distribuer et agir au montage réel.</p>
  `;

  const buttons = [...stage.querySelectorAll("[data-view]")];
  const schema = stage.querySelector('[data-pane="schema"]');
  const reality = stage.querySelector('[data-pane="reality"]');
  const caption = stage.querySelector("#dualViewCaption");
  buttons.forEach(button => button.addEventListener("click", () => {
    const mode = button.dataset.view;
    buttons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    const isSchema = mode === "schema";
    schema.hidden = !isSchema;
    reality.hidden = isSchema;
    caption.textContent = isSchema
      ? "Vue pédagogique : les flèches relient les fonctions acquérir, traiter, distribuer et agir au montage réel."
      : "Vue réalité : observe la forme, la position et les connexions des composants avant de revenir au schéma.";
  }));

  const heading = stage.closest(".card")?.querySelector(".card-head h2");
  const description = stage.closest(".card")?.querySelector(".card-head p");
  if (heading) heading.textContent = `${titles[n]} — du schéma au réel`;
  if (description) description.textContent = "Passe de la représentation fonctionnelle au montage réel pour relier l’abstrait au concret.";

  const controls = stage.closest(".card-body")?.querySelector(".demo-controls");
  if (controls) controls.remove();
})();
