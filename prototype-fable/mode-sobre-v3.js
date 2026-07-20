/* TechnoQuest — mode « faible distraction » (v3).
   Une bascule dans la barre de navigation applique body.fv-sobre : fonds en
   aplats, suppression des ombres, halos, reflets et animations décoratives,
   accents adoucis. Les animations PÉDAGOGIQUES du jumeau (trajets des
   signaux, eau, rotor) sont conservées : elles portent du sens et l'élève
   les contrôle déjà avec Lancer / Arrêter. Préférence mémorisée. */
"use strict";
(() => {
  const PREFS_KEY = "technoquest-preferences-v1";
  const readPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; } };
  const writePrefs = patch => {
    const fresh = readPrefs();
    Object.assign(fresh, patch);
    localStorage.setItem(PREFS_KEY, JSON.stringify(fresh));
  };

  const apply = active => document.body.classList.toggle("fv-sobre", active);
  /* Appliqué au plus tôt pour éviter un flash visuel. */
  apply(Boolean(readPrefs().modeSobre));

  const boot = () => {
    const nav = document.querySelector(".session-nav");
    if (!nav || document.getElementById("fvSobreBtn")) return;
    let active = Boolean(readPrefs().modeSobre);

    const button = document.createElement("button");
    button.id = "fvSobreBtn";
    button.type = "button";
    const paint = () => {
      button.textContent = active ? "🎯 Affichage sobre : oui" : "🎯 Affichage sobre";
      button.title = active
        ? "Revenir à l'affichage complet (couleurs et effets)"
        : "Réduire les animations et les couleurs décoratives (concentration)";
      button.setAttribute("aria-pressed", String(active));
    };
    paint();
    /* Avant le bouton Mission s'il est bien dans la barre, sinon en fin. */
    const reference = document.getElementById("missionActivate");
    nav.insertBefore(button, reference && reference.parentElement === nav ? reference : null);

    button.addEventListener("click", () => {
      active = !active;
      writePrefs({ modeSobre: active });
      apply(active);
      paint();
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0));
  else setTimeout(boot, 0);
})();
