/* Sauvegarde la question 11 remplacée après la construction du QCM. */
"use strict";
(() => {
  if (Number(document.body.dataset.session || 0) !== 1) return;
  const inputs = [...document.querySelectorAll('input[name="s1q11"]')];
  if (!inputs.length) return;
  const key = "technoquest-premium-v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; } };
  const saved = read().sessions?.[1]?.practicalV1?.qcm?.s1q11;
  inputs.forEach(input => {
    input.checked = input.value === saved;
    input.addEventListener("change", () => {
      const state = read();
      state.sessions = state.sessions || {};
      state.sessions[1] = state.sessions[1] || {};
      const practical = state.sessions[1].practicalV1 || {};
      practical.qcm = { ...(practical.qcm || {}), s1q11: input.value };
      practical.updatedAt = new Date().toISOString();
      state.sessions[1].practicalV1 = practical;
      localStorage.setItem(key, JSON.stringify(state));
    });
  });
})();
