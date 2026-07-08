/* Maintient l’état « non tenté » après restauration volontaire d’un squelette. */
"use strict";
(() => {
  if (Number(document.body.dataset.session || 0) !== 1) return;
  const storageKey = "technoquest-premium-v1";
  const markStarter = () => setTimeout(() => {
    try {
      const state = JSON.parse(localStorage.getItem(storageKey) || "{}");
      state.sessions = state.sessions || {};
      state.sessions[1] = { ...(state.sessions[1] || {}), attemptedV2: false };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch { /* la page reste utilisable sans stockage */ }
  }, 0);
  document.getElementById("codeModeV2")?.addEventListener("change", markStarter);
  document.getElementById("restoreCode")?.addEventListener("click", markStarter);
})();
