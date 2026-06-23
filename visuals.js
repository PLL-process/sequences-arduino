"use strict";

(() => {
  const visuals = [
    {id:"v01", title:"Situation déclenchante", caption:"Comparer un sol trop sec et un sol trop arrosé afin d’identifier le besoin.", alt:"Jardin partagé entre une zone trop sèche et une zone trop arrosée.", group:"Comprendre le besoin"},
    {id:"v02", title:"Prototype final attendu", caption:"Visualiser l’ensemble Arduino, capteurs, relais, pompe, réservoir et plante.", alt:"Prototype final du jardin connecté avec Arduino, relais, pompe et réservoir.", group:"Comprendre le besoin"},
    {id:"v03", title:"Cycle de l’eau", caption:"Relier le projet à l’évaporation, à la pluie, à l’infiltration et aux besoins des plantes.", alt:"Cycle simplifié de l’eau dans un jardin avec soleil, évaporation, pluie et infiltration.", group:"Comprendre le besoin"},
    {id:"v04", title:"Besoin et contraintes", caption:"Repérer les critères du cahier des charges : économie, sécurité, réparabilité et basse tension.", alt:"Quatre contraintes du jardin connecté : économie d’eau, protection de la pompe, réparabilité et basse tension.", group:"Comprendre le besoin"},
    {id:"v05", title:"Composants du système", caption:"Identifier la carte Arduino, les trois capteurs Grove, le relais et la pompe.", alt:"Vue simplifiée des composants Arduino et Grove du jardin connecté.", group:"Comprendre le système"},
    {id:"v06", title:"Architecture fonctionnelle", caption:"Suivre le chemin allant de la mesure jusqu’à l’action sur le sol.", alt:"Architecture fonctionnelle capteurs, Arduino, relais et pompe.", group:"Comprendre le système"},
    {id:"v07", title:"Chaîne d’information", caption:"Associer acquérir, traiter et communiquer aux constituants du système.", alt:"Chaîne d’information avec capteurs, programme Arduino et communication.", group:"Comprendre le système"},
    {id:"v08", title:"Chaîne d’énergie", caption:"Associer alimenter, distribuer, convertir, transmettre et agir.", alt:"Chaîne d’énergie de la batterie au sol arrosé.", group:"Comprendre le système"},
    {id:"v09", title:"Entrées, traitement et sortie", caption:"Distinguer les entrées A0, A1, A2, le traitement et la sortie D6.", alt:"Entrées analogiques A0 A1 A2, traitement Arduino et sortie logique D6.", group:"Comprendre le système"},
    {id:"v10", title:"Capteur d’humidité sur A0", caption:"Réaliser le premier câblage Grove et reconnaître une entrée analogique.", alt:"Capteur d’humidité Grove relié au port A0.", group:"Câbler Arduino et Grove"},
    {id:"v11", title:"Capteur de lumière sur A1", caption:"Ajouter la luminosité comme grandeur physique mesurée.", alt:"Capteur de lumière Grove relié au port A1.", group:"Câbler Arduino et Grove"},
    {id:"v12", title:"Capteur de niveau sur A2", caption:"Surveiller le réservoir et prévenir la marche à vide.", alt:"Capteur de niveau d’eau relié au port A2 et placé dans le réservoir.", group:"Câbler Arduino et Grove"},
    {id:"v13", title:"Relais Grove sur D6", caption:"Commander un actionneur avec une sortie logique LOW ou HIGH.", alt:"Relais Grove relié à la sortie numérique D6.", group:"Câbler Arduino et Grove"},
    {id:"v14", title:"Montage final complet", caption:"Vérifier les connexions A0, A1, A2 et D6 avant la mise sous tension.", alt:"Montage Arduino complet avec trois capteurs, relais et pompe.", group:"Câbler Arduino et Grove"},
    {id:"v15", title:"Branchement dangereux ou correct", caption:"Comprendre pourquoi la pompe doit être commandée par un relais et une alimentation adaptée.", alt:"Comparaison entre une pompe branchée directement à l’Arduino et une pompe commandée par relais.", group:"Câbler Arduino et Grove"},
    {id:"v16", title:"Signal analogique", caption:"Observer une grandeur qui peut prendre de nombreuses valeurs.", alt:"Courbe continue représentant un signal analogique.", group:"Comprendre les signaux"},
    {id:"v17", title:"Signal logique", caption:"Observer les deux états LOW et HIGH utilisés pour commander le relais.", alt:"Signal logique rectangulaire alternant entre LOW égal zéro et HIGH égal un.", group:"Comprendre les signaux"},
    {id:"v18", title:"Mesure, seuil, décision, action", caption:"Relier la valeur analogique à une comparaison, puis à la commande de la pompe.", alt:"Chaîne mesure 28 pour cent, seuil 28 inférieur à 35, décision vraie et pompe activée.", group:"Comprendre les signaux"},
    {id:"v19", title:"Algorigramme", caption:"Préparer le programme en représentant les tests et les actions.", alt:"Algorigramme lisant les capteurs puis décidant d’arroser ou d’arrêter.", group:"Programmer"},
    {id:"v20", title:"Code final annoté", caption:"Repérer dans le programme les fonctions acquérir, traiter, protéger et commander.", alt:"Extrait de code Arduino annoté par fonctions techniques.", group:"Programmer"}
  ];

  const missionVisualIds = [
    ["v10","v16","v18"],
    ["v04","v16","v18"],
    ["v13","v15","v17"],
    ["v12","v15","v18"],
    ["v08","v18","v19"],
    ["v11","v14","v18"],
    ["v05","v04","v20"],
    ["v02","v14","v19","v20"]
  ];

  const css = `
    .visual-intro,.visual-library{max-width:1600px;margin-inline:auto;padding:0 clamp(1rem,5vw,5rem) 1rem}
    .visual-intro-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
    .visual-card{margin:0;border:1px solid var(--border);border-radius:18px;background:#0d2b23ee;overflow:hidden;box-shadow:var(--shadow);transition:transform .18s,border-color .18s}
    .visual-card:hover,.visual-card:focus-within{transform:translateY(-3px);border-color:var(--yellow)}
    .visual-card button{display:block;width:100%;padding:0;border:0;border-radius:0;background:transparent}
    .visual-card svg{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#08251d}
    .visual-card figcaption{padding:.85rem 1rem 1rem;color:var(--muted);line-height:1.45}
    .visual-card figcaption strong{display:block;margin-bottom:.25rem;color:var(--text)}
    .mission-visuals{margin:1rem 0;padding:1rem;border:1px solid var(--border);border-radius:16px;background:#061813aa}
    .mission-visuals h3{margin-top:0}
    .mission-visual-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:.75rem}
    .mission-visual-grid .visual-card figcaption{font-size:.86rem}
    .visual-library details{padding:1rem 1.2rem;border:1px solid var(--border);border-radius:18px;background:#0d2b23ee;box-shadow:var(--shadow)}
    .visual-library summary{cursor:pointer;color:var(--yellow);font-weight:bold;font-size:1.05rem}
    .visual-group-title{margin:1.4rem 0 .7rem;color:var(--blue)}
    .visual-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.9rem;margin-top:1rem}
    .visual-lightbox{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:1rem;background:#020906ed}
    .visual-lightbox.open{display:flex}
    .visual-lightbox-dialog{position:relative;width:min(1100px,96vw);max-height:94vh;padding:1rem;border:1px solid var(--border);border-radius:20px;background:#0d2b23;box-shadow:0 24px 80px #000}
    .visual-lightbox svg{display:block;width:100%;max-height:75vh;aspect-ratio:16/9}
    .visual-lightbox p{margin:.75rem 3.5rem 0 0;color:var(--muted)}
    .visual-lightbox-close{position:absolute;top:.7rem;right:.7rem;z-index:2;font-size:1.3rem}
    .visual-origin{margin:.6rem 0 0;color:var(--muted);font-size:.78rem}
    @media(max-width:760px){.visual-intro-grid{grid-template-columns:1fr}.visual-gallery{grid-template-columns:1fr}}
    @media print{.visual-lightbox{display:none!important}.visual-library details{box-shadow:none}.visual-card{break-inside:avoid}}
  `;
  const style = document.createElement("style");
  style.id = "technoquest-visual-styles";
  style.textContent = css;
  document.head.appendChild(style);

  function visualById(id) {
    return visuals.find(v => v.id === id);
  }

  function makeFigure(visual, compact = false) {
    const figure = document.createElement("figure");
    figure.className = "visual-card";
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Agrandir : ${visual.title}`);
    button.innerHTML = `<svg viewBox="0 0 640 360" role="img" aria-label="${visual.alt}"><use href="images/technoquest-visuels.svg#${visual.id}"></use></svg>`;
    button.addEventListener("click", () => openLightbox(visual));
    const caption = document.createElement("figcaption");
    caption.innerHTML = `<strong>${visual.title}</strong>${compact ? "" : visual.caption}`;
    figure.append(button, caption);
    return figure;
  }

  const lightbox = document.createElement("div");
  lightbox.className = "visual-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Visuel pédagogique agrandi");
  lightbox.innerHTML = `
    <div class="visual-lightbox-dialog">
      <button type="button" class="visual-lightbox-close" aria-label="Fermer le visuel">✕</button>
      <div id="visualLightboxContent"></div>
    </div>`;
  document.body.appendChild(lightbox);

  function openLightbox(visual) {
    document.getElementById("visualLightboxContent").innerHTML = `
      <svg viewBox="0 0 640 360" role="img" aria-label="${visual.alt}"><use href="images/technoquest-visuels.svg#${visual.id}"></use></svg>
      <p><strong>${visual.title}</strong> — ${visual.caption}</p>`;
    lightbox.classList.add("open");
    lightbox.querySelector(".visual-lightbox-close").focus();
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
  }
  lightbox.querySelector(".visual-lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  const introGrid = document.querySelector(".intro-grid");
  if (introGrid) {
    const intro = document.createElement("section");
    intro.className = "visual-intro";
    intro.setAttribute("aria-labelledby", "visualIntroTitle");
    intro.innerHTML = `
      <div class="panel-title">
        <div>
          <p class="eyebrow">Voir avant de concevoir</p>
          <h2 id="visualIntroTitle">Du problème réel au prototype attendu</h2>
        </div>
        <span class="badge gold">Visuels pédagogiques</span>
      </div>
      <div class="visual-intro-grid"></div>`;
    introGrid.insertAdjacentElement("afterend", intro);
    const grid = intro.querySelector(".visual-intro-grid");
    ["v01","v02"].forEach(id => grid.appendChild(makeFigure(visualById(id))));
  }

  const missionPanel = document.querySelector(".mission-panel");
  let missionBox;
  if (missionPanel) {
    missionBox = document.createElement("section");
    missionBox.className = "mission-visuals";
    missionBox.setAttribute("aria-labelledby", "missionVisualTitle");
    missionBox.innerHTML = `<h3 id="missionVisualTitle">Ressources visuelles de la mission</h3><div class="mission-visual-grid"></div>`;
    const tabs = missionPanel.querySelector(".tabs");
    missionPanel.insertBefore(missionBox, tabs);
  }

  function renderMissionVisuals(index) {
    if (!missionBox) return;
    const grid = missionBox.querySelector(".mission-visual-grid");
    grid.innerHTML = "";
    (missionVisualIds[index] || missionVisualIds[0]).forEach(id => grid.appendChild(makeFigure(visualById(id), true)));
  }
  renderMissionVisuals(0);

  const nav = document.getElementById("missions");
  if (nav) {
    nav.addEventListener("click", event => {
      const buttons = [...nav.querySelectorAll("button")];
      const button = event.target.closest("button");
      const index = buttons.indexOf(button);
      if (index >= 0) renderMissionVisuals(index);
    });
  }

  const dashboard = document.querySelector(".dashboard");
  if (dashboard) {
    const library = document.createElement("section");
    library.className = "visual-library";
    library.setAttribute("aria-labelledby", "visualLibraryTitle");
    library.innerHTML = `
      <details>
        <summary id="visualLibraryTitle">Bibliothèque des 20 visuels pédagogiques</summary>
        <p class="visual-origin">Illustrations vectorielles originales, intégrées au projet et réutilisables dans les fiches élèves sous licence CC BY 4.0.</p>
        <div id="visualLibraryGroups"></div>
      </details>`;
    dashboard.insertAdjacentElement("beforebegin", library);
    const container = library.querySelector("#visualLibraryGroups");
    [...new Set(visuals.map(v => v.group))].forEach(group => {
      const title = document.createElement("h3");
      title.className = "visual-group-title";
      title.textContent = group;
      const grid = document.createElement("div");
      grid.className = "visual-gallery";
      visuals.filter(v => v.group === group).forEach(v => grid.appendChild(makeFigure(v)));
      container.append(title, grid);
    });
  }
})();

/* Charge les améliorations du jumeau numérique après la bibliothèque visuelle. */
const simulationEnhancements = document.createElement("script");
simulationEnhancements.src = "simulation-enhancements.js";
document.body.appendChild(simulationEnhancements);
