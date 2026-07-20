/* TechnoQuest — progression élève (v3, pages verticales).
   Trois signaux RÉELS, observés sans modifier la moindre logique :
   - démonstration du jumeau lancée (clic sur le bouton existant) ;
   - programme vérifié avec succès (console de vérification en état succès) ;
   - QCM validé (clé de sauvegarde du moteur QCM).
   Ils allument des coches ✓ sur le rail de progression, et un bouton
   « Reprendre où j'en étais » propose de revenir à la dernière partie
   visitée après un rechargement. Sauvegarde dédiée, écrite en
   lecture-fusion : technoquest-progression-v1. */
"use strict";
(() => {
  const sessionId = Number(document.body.dataset.session || 0);
  if (sessionId < 1 || sessionId > 8) return;

  const KEY = "technoquest-progression-v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
  const write = patch => {
    const fresh = read();
    fresh.sessions = fresh.sessions || {};
    fresh.sessions[sessionId] = { ...(fresh.sessions[sessionId] || {}), ...patch };
    localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh.sessions[sessionId];
  };

  const boot = () => {
    const rail = document.getElementById("fvRail");
    if (!rail || document.getElementById("fvReprendre")) return;
    const parts = [...document.querySelectorAll(".fv-part")];
    const totalParts = parts.length;
    if (!totalParts) return;
    let saved = read().sessions?.[sessionId] || {};

    /* ---- Coches sur le rail : partie 2 (observer), partie 4 (programmer),
       dernière partie (QCM). ---- */
    const marks = { demo: 2, programme: 4, qcm: totalParts };
    const applyMarks = () => {
      Object.entries(marks).forEach(([signal, partNumber]) => {
        const done = Boolean(saved[signal]);
        rail.querySelectorAll(`[data-part="${partNumber}"]`).forEach(link => link.classList.toggle("fv-part-faite", done));
        const segment = rail.querySelectorAll(".fv-rail-bar i")[partNumber - 1];
        if (segment) segment.classList.toggle("fv-seg-faite", done);
      });
    };

    const mark = signal => {
      if (saved[signal]) return;
      saved = write({ [signal]: true });
      applyMarks();
    };

    /* Signal 1 — démonstration lancée. */
    document.getElementById("runDemo")?.addEventListener("click", () => mark("demo"));

    /* Signal 2 — vérification du programme réussie (classique 2-8 et séance 1). */
    const consoleBox = document.getElementById("codeRunConsoleV3");
    if (consoleBox) {
      new MutationObserver(() => { if (consoleBox.classList.contains("success")) mark("programme"); })
        .observe(consoleBox, { attributes: true, attributeFilter: ["class"] });
      if (consoleBox.classList.contains("success")) mark("programme");
    }
    const runStatus = document.getElementById("codeRunStatus");
    if (runStatus) {
      new MutationObserver(() => { if (runStatus.classList.contains("ok")) mark("programme"); })
        .observe(runStatus, { attributes: true, attributeFilter: ["class"] });
    }

    /* Signal 3 — QCM validé (clé du moteur commun, relue après chaque validation). */
    const checkQcm = () => {
      try {
        const qcm = JSON.parse(localStorage.getItem("technoquest-qcm-v1") || "{}").sessions?.[sessionId];
        if (qcm?.validated) mark("qcm");
      } catch { /* signal optionnel */ }
    };
    checkQcm();
    document.getElementById("qcmValidate")?.addEventListener("click", () => setTimeout(checkQcm, 150));

    applyMarks();

    /* ---- Reprendre où j'en étais ---- */
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const n = Number(entry.target.id.replace("partie-", ""));
          if (n > 1) write({ lastPart: n });
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      parts.forEach(part => observer.observe(part));
    }

    const lastPart = Number(saved.lastPart || 0);
    if (lastPart > 1 && lastPart <= totalParts && (window.scrollY || 0) < 80) {
      const toast = document.createElement("div");
      toast.id = "fvReprendre";
      toast.setAttribute("role", "status");
      toast.innerHTML = `
        <p>Tu t’étais arrêté à la <strong>partie ${lastPart} sur ${totalParts}</strong>.</p>
        <div>
          <button type="button" class="btn primary" data-reprendre>Reprendre là-bas ↓</button>
          <button type="button" class="btn" data-fermer aria-label="Fermer et rester en haut de page">Rester ici</button>
        </div>`;
      document.body.appendChild(toast);
      const close = () => toast.remove();
      toast.querySelector("[data-reprendre]").addEventListener("click", () => {
        document.getElementById(`partie-${lastPart}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        close();
      });
      toast.querySelector("[data-fermer]").addEventListener("click", close);
      setTimeout(() => { if (toast.isConnected) toast.classList.add("fv-toast-discret"); }, 12000);
    }
  };

  /* Après l'orchestrateur (le rail doit exister). */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0));
  else setTimeout(boot, 0);
})();
