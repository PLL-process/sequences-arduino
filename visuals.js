"use strict";

(() => {
  const visuals = [
    ["v01","Situation déclenchante","Une plante peut mourir si elle manque d’eau, mais aussi si elle est trop arrosée.","Comparer une plante trop sèche et une plante trop arrosée.","Comprendre le besoin"],
    ["v02","Prototype final attendu","Identifier les capteurs, l’Arduino, le relais, l’alimentation séparée, la pompe et le réservoir.","Prototype final du jardin connecté.","Comprendre le besoin"],
    ["v03","Cycle de l’eau","Relier le projet à l’évaporation, à la pluie et à l’infiltration.","Cycle simplifié de l’eau dans le jardin.","Comprendre le besoin"],
    ["v04","Besoin et contraintes","Repérer économie d’eau, sécurité, réparabilité et très basse tension.","Contraintes du jardin connecté.","Comprendre le besoin"],
    ["v05","Composants du système","Identifier la carte, les capteurs, le relais et la pompe.","Composants Arduino et Grove.","Comprendre le système"],
    ["v06","Architecture fonctionnelle","Suivre le chemin allant de la mesure jusqu’à l’action.","Architecture fonctionnelle du jardin connecté.","Comprendre le système"],
    ["v07","Chaîne d’information","Associer acquérir, traiter et communiquer.","Chaîne d’information du système.","Comprendre le système"],
    ["v08","Chaîne d’énergie","Associer alimenter, distribuer, convertir, transmettre et agir.","Chaîne d’énergie du système.","Comprendre le système"],
    ["v09","Entrées, traitement et sortie","Distinguer A0, A1, A2, le traitement et D6.","Entrées et sortie de la carte Arduino.","Comprendre le système"],
    ["v10","Capteur d’humidité sur A0","Reconnaître une entrée analogique et réaliser le câblage.","Capteur d’humidité relié à A0.","Câbler Arduino et Grove"],
    ["v11","Capteur de lumière sur A1","Ajouter la luminosité comme grandeur mesurée.","Capteur de lumière relié à A1.","Câbler Arduino et Grove"],
    ["v12","Capteur de niveau sur A2","Surveiller le réservoir et prévenir la marche à vide.","Capteur de niveau relié à A2.","Câbler Arduino et Grove"],
    ["v13","Relais Grove sur D6","Commander le relais avec une sortie logique.","Relais Grove relié à D6.","Câbler Arduino et Grove"],
    ["v14","Montage final complet","Vérifier A0, A1, A2 et D6 avant la mise sous tension.","Montage complet du jardin connecté.","Câbler Arduino et Grove"],
    ["v15","Branchement dangereux ou correct","Comprendre pourquoi la pompe utilise un relais et une alimentation séparée.","Comparaison de deux branchements de pompe.","Câbler Arduino et Grove"],
    ["v16","Signal analogique","Observer une grandeur qui peut prendre de nombreuses valeurs.","Courbe d’un signal analogique.","Comprendre les signaux"],
    ["v17","Signal logique","Observer LOW et HIGH pour commander le relais.","Signal logique LOW et HIGH.","Comprendre les signaux"],
    ["v18","Mesure, seuil, décision, action","Comprendre comment une mesure conduit à une décision puis à une action.","Mesure comparée à un seuil puis commande de la pompe.","Comprendre les signaux"],
    ["v19","Algorigramme","Préparer le programme avec des tests et des actions.","Algorigramme du jardin connecté.","Programmer"],
    ["v20","Code final annoté","Repérer acquérir, traiter, protéger et commander dans le programme.","Code final annoté.","Programmer"]
  ].map(([id,title,caption,alt,group]) => ({id,title,caption,alt,group}));

  const missionVisualIds = [
    ["v10","v16","v18"], ["v04","v16","v18"], ["v13","v15","v17"], ["v12","v15","v18"],
    ["v08","v18","v19"], ["v11","v14","v18"], ["v05","v04","v20"], ["v02","v14","v19","v20"]
  ];

  const style = document.createElement("style");
  style.id = "technoquest-visual-styles";
  style.textContent = `
    .visual-intro,.visual-library{max-width:1600px;margin-inline:auto;padding:0 clamp(1rem,5vw,5rem) 1rem}
    .visual-intro-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
    .visual-card{margin:0;border:1px solid var(--border);border-radius:18px;background:#0d2b23ee;overflow:hidden;box-shadow:var(--shadow)}
    .visual-card button{display:block;width:100%;padding:0;border:0;border-radius:0;background:transparent}
    .visual-card svg{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#08251d}
    .visual-card figcaption{padding:.85rem 1rem 1rem;color:var(--muted);line-height:1.45}
    .visual-card figcaption strong{display:block;margin-bottom:.25rem;color:var(--text)}
    .mission-visuals{margin:1rem 0;padding:1rem;border:1px solid var(--border);border-radius:16px;background:#061813aa}
    .mission-visuals h3{margin-top:0}.mission-visual-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:.75rem}
    .mission-visual-grid .visual-card figcaption{font-size:.86rem}
    .visual-library details{padding:1rem 1.2rem;border:1px solid var(--border);border-radius:18px;background:#0d2b23ee;box-shadow:var(--shadow)}
    .visual-library summary{cursor:pointer;color:var(--yellow);font-weight:bold;font-size:1.05rem}
    .visual-group-title{margin:1.4rem 0 .7rem;color:var(--blue)}
    .visual-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.9rem;margin-top:1rem}
    .visual-lightbox{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:1rem;background:#020906ed}
    .visual-lightbox.open{display:flex}.visual-lightbox-dialog{position:relative;width:min(1100px,96vw);max-height:94vh;padding:1rem;border:1px solid var(--border);border-radius:20px;background:#0d2b23;box-shadow:0 24px 80px #000}
    .visual-lightbox svg{display:block;width:100%;max-height:75vh;aspect-ratio:16/9}.visual-lightbox p{margin:.75rem 3.5rem 0 0;color:var(--muted)}
    .visual-lightbox-close{position:absolute;top:.7rem;right:.7rem;z-index:2;font-size:1.3rem}.visual-origin{margin:.6rem 0 0;color:var(--muted);font-size:.78rem}
    @media(max-width:760px){.visual-intro-grid{grid-template-columns:1fr}.visual-gallery{grid-template-columns:1fr}}
    @media print{.visual-lightbox{display:none!important}.visual-card{break-inside:avoid}}
  `;
  document.head.appendChild(style);

  const byId = id => visuals.find(item => item.id === id);
  const sprite = id => `images/technoquest-visuels.svg?v=26#${id}`;

  const lightbox = document.createElement("div");
  lightbox.className = "visual-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = `<div class="visual-lightbox-dialog"><button type="button" class="visual-lightbox-close" aria-label="Fermer">✕</button><div id="visualLightboxContent"></div></div>`;
  document.body.appendChild(lightbox);

  function closeLightbox(){ lightbox.classList.remove("open"); }
  lightbox.querySelector("button").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", event => { if(event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", event => { if(event.key === "Escape") closeLightbox(); });

  function openLightbox(visual){
    document.getElementById("visualLightboxContent").innerHTML = `<svg viewBox="0 0 640 360" role="img" aria-label="${visual.alt}"><use href="${sprite(visual.id)}"></use></svg><p><strong>${visual.title}</strong> — ${visual.caption}</p>`;
    lightbox.classList.add("open");
    lightbox.querySelector("button").focus();
  }

  function makeFigure(visual, compact=false){
    const figure = document.createElement("figure");
    figure.className = "visual-card";
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Agrandir : ${visual.title}`);
    button.innerHTML = `<svg viewBox="0 0 640 360" role="img" aria-label="${visual.alt}"><use href="${sprite(visual.id)}"></use></svg>`;
    button.addEventListener("click", () => openLightbox(visual));
    const caption = document.createElement("figcaption");
    caption.innerHTML = `<strong>${visual.title}</strong>${compact ? "" : visual.caption}`;
    figure.append(button, caption);
    return figure;
  }

  const introGrid = document.querySelector(".intro-grid");
  if(introGrid){
    const intro = document.createElement("section");
    intro.className = "visual-intro";
    intro.innerHTML = `<div class="panel-title"><div><p class="eyebrow">Voir avant de concevoir</p><h2>Du problème réel au prototype attendu</h2></div><span class="badge gold">Visuels pédagogiques</span></div><div class="visual-intro-grid"></div>`;
    introGrid.insertAdjacentElement("afterend", intro);
    const grid = intro.querySelector(".visual-intro-grid");
    ["v01","v02"].forEach(id => grid.appendChild(makeFigure(byId(id))));
  }

  const missionPanel = document.querySelector(".mission-panel");
  let missionGrid = null;
  if(missionPanel){
    const box = document.createElement("section");
    box.className = "mission-visuals";
    box.innerHTML = `<h3>Ressources visuelles de la mission</h3><div class="mission-visual-grid"></div>`;
    missionPanel.insertBefore(box, missionPanel.querySelector(".tabs"));
    missionGrid = box.querySelector(".mission-visual-grid");
  }

  function renderMission(index){
    if(!missionGrid) return;
    missionGrid.innerHTML = "";
    (missionVisualIds[index] || missionVisualIds[0]).forEach(id => missionGrid.appendChild(makeFigure(byId(id), true)));
  }
  renderMission(0);
  document.getElementById("missions")?.addEventListener("click", event => {
    const buttons = [...document.querySelectorAll("#missions button")];
    const index = buttons.indexOf(event.target.closest("button"));
    if(index >= 0) renderMission(index);
  });

  const dashboard = document.querySelector(".dashboard");
  if(dashboard){
    const library = document.createElement("section");
    library.className = "visual-library";
    library.innerHTML = `<details><summary>Bibliothèque des 20 visuels pédagogiques</summary><p class="visual-origin">Illustrations vectorielles originales sous licence CC BY 4.0.</p><div id="visualLibraryGroups"></div></details>`;
    dashboard.insertAdjacentElement("beforebegin", library);
    const container = library.querySelector("#visualLibraryGroups");
    [...new Set(visuals.map(item => item.group))].forEach(group => {
      const title = document.createElement("h3"); title.className = "visual-group-title"; title.textContent = group;
      const grid = document.createElement("div"); grid.className = "visual-gallery";
      visuals.filter(item => item.group === group).forEach(item => grid.appendChild(makeFigure(item)));
      container.append(title, grid);
    });
  }
})();

/* Charge seulement le mode stable et les aides légères. */
const simulationEnhancements = document.createElement("script");
simulationEnhancements.src = "simulation-enhancements.js?v=26";
document.body.appendChild(simulationEnhancements);
