/* TechnoQuest — écrin esthétique du jumeau numérique (v3, présentation pure).
   Le SVG du jumeau et toute sa logique (capteurs, animations, boutons
   Lancer/Arrêter, mode Mission) restent STRICTEMENT inchangés : ce module
   enveloppe la scène existante dans un cadre décoratif (bandeau d'instrument,
   vitre en reflet non cliquable, halo d'activité) et ajoute un bouton
   plein écran refermable à la souris, au clavier (Échap) et au toucher.
   Quand le mode Mission déplace la scène, le cadre se masque tout seul. */
"use strict";
(() => {
  const boot = () => {
    const stage = document.getElementById("twinStage");
    if (!stage || document.querySelector(".fv-twin-frame")) return;

    /* ---- Cadre décoratif autour de la scène existante ---- */
    const frame = document.createElement("div");
    frame.className = "fv-twin-frame";
    stage.insertAdjacentElement("beforebegin", frame);

    const header = document.createElement("div");
    header.className = "fv-twin-frame-head";
    header.innerHTML = `
      <span class="fv-twin-led" aria-hidden="true"></span>
      <strong>Jumeau numérique · Jardin connecté</strong>
      <span class="fv-twin-head-note">simulation pédagogique</span>
      <button type="button" class="fv-twin-fullscreen-btn" aria-pressed="false" title="Agrandir le jumeau (Échap pour quitter)">⛶<span class="sr-only"> Afficher le jumeau numérique en plein écran</span></button>`;
    frame.appendChild(header);
    frame.appendChild(stage);

    const glass = document.createElement("div");
    glass.className = "fv-twin-glass";
    glass.setAttribute("aria-hidden", "true");
    frame.appendChild(glass);

    /* ---- Plein écran (présentation seulement) ---- */
    const button = header.querySelector(".fv-twin-fullscreen-btn");
    const setFullscreen = active => {
      frame.classList.toggle("fv-twin-plein-ecran", active);
      document.body.classList.toggle("fv-twin-no-scroll", active);
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? "✕" : "⛶";
      button.title = active ? "Quitter le plein écran (Échap)" : "Agrandir le jumeau (Échap pour quitter)";
      if (active) button.focus();
    };
    button.addEventListener("click", () => setFullscreen(!frame.classList.contains("fv-twin-plein-ecran")));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && frame.classList.contains("fv-twin-plein-ecran")) setFullscreen(false);
    });

    /* ---- Halo d'activité : reflète l'état running SANS toucher à sa logique ---- */
    const sync = () => frame.classList.toggle("fv-twin-active", stage.classList.contains("running"));
    new MutationObserver(sync).observe(stage, { attributes: true, attributeFilter: ["class"] });
    sync();

    /* ---- Si le mode Mission emprunte la scène, le cadre s'efface ---- */
    const visibility = () => { frame.classList.toggle("fv-twin-vide", !frame.contains(stage)); };
    new MutationObserver(visibility).observe(frame, { childList: true });
    document.getElementById("missionActivate")?.addEventListener("click", () => setTimeout(visibility, 50));
    document.addEventListener("click", event => {
      if (event.target.closest("#missionClassic")) setTimeout(visibility, 400);
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
