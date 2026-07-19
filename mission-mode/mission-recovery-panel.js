/* TechnoQuest — panneau VISIBLE et ACCESSIBLE de récupération d'une ancienne version. */
/* S'appuie sur window.TechnoQuestMissionRecovery (migration transactionnelle). Il s'affiche */
/* automatiquement quand une sauvegarde NON résolue existe, et reste accessible à la demande */
/* via un bouton « Récupération ». Il n'apparaît jamais pour une session vierge sans sauvegarde, */
/* ni automatiquement pour une sauvegarde déjà traitée (fermée par l'élève). */
"use strict";

(() => {
  /* API de récupération fournie par la migration. */
  const Recovery = window.TechnoQuestMissionRecovery;
  /* Sans API de récupération, aucun panneau. */
  if (!Recovery) return;

  /* Exécute après construction du document. */
  function ready(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback);
    else callback();
  }

  /* Injecte une seule fois les styles du panneau (thème neutre, responsive, focus visible). */
  function injectStyles() {
    if (document.getElementById("mission-recovery-styles")) return;
    const style = document.createElement("style");
    style.id = "mission-recovery-styles";
    style.textContent = `
      .mission-recovery-launcher{position:fixed;left:12px;bottom:12px;z-index:99998;padding:.4rem .7rem;border-radius:999px;border:1.5px solid rgba(250,204,21,.7);background:#1f2937;color:#f8fafc;font:600 .82rem/1.2 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)}
      .mission-recovery-launcher:focus-visible{outline:3px solid rgba(250,204,21,.9);outline-offset:2px}
      .mission-recovery-panel{position:fixed;left:12px;bottom:60px;z-index:99999;width:min(92vw,360px);padding:1rem 1.1rem;border-radius:14px;border:1.6px solid rgba(250,204,21,.6);background:#111827;color:#f8fafc;box-shadow:0 14px 40px rgba(0,0,0,.5);font:400 .9rem/1.4 Inter,system-ui,sans-serif}
      .mission-recovery-panel h2{margin:0 0 .4rem;font-size:.95rem}
      .mission-recovery-msg{margin:0 0 .8rem}
      .mission-recovery-actions{display:flex;flex-direction:column;gap:.5rem}
      .mission-recovery-actions button{width:100%;padding:.5rem .7rem;border-radius:10px;border:1.4px solid rgba(148,163,184,.5);background:#1f2937;color:#f8fafc;font:600 .85rem/1.2 Inter,system-ui,sans-serif;cursor:pointer;text-align:center}
      .mission-recovery-actions .mission-recovery-consult{border-color:rgba(250,204,21,.8);background:rgba(250,204,21,.16)}
      .mission-recovery-actions button:hover{filter:brightness(1.12)}
      .mission-recovery-actions button:focus-visible{outline:3px solid rgba(250,204,21,.9);outline-offset:2px}
      .mission-recovery-code{width:100%;box-sizing:border-box;min-height:9rem;max-height:42vh;margin:.2rem 0 .7rem;padding:.55rem .6rem;border-radius:10px;border:1.4px solid rgba(148,163,184,.5);background:#0b1220;color:#e5e7eb;font:400 .78rem/1.45 "SFMono-Regular",Consolas,"Liberation Mono",monospace;white-space:pre;overflow:auto;resize:vertical}
      .mission-recovery-code:focus-visible{outline:3px solid rgba(250,204,21,.9);outline-offset:2px}
      .mission-recovery-status{margin:.6rem 0 0;min-height:1.1em;font-size:.82rem;color:rgba(250,204,21,.95)}
      .mission-recovery-close{position:absolute;top:.4rem;right:.5rem;background:none;border:none;color:#cbd5e1;font-size:1.1rem;line-height:1;cursor:pointer;padding:.2rem}
      .mission-recovery-close:focus-visible{outline:2px solid rgba(250,204,21,.9);outline-offset:2px}
      @media (max-width:680px){.mission-recovery-panel{left:8px;right:8px;width:auto;bottom:56px}.mission-recovery-launcher{left:8px;bottom:8px}}
      @media print{.mission-recovery-panel,.mission-recovery-launcher{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  ready(() => {
    /* Références au panneau, au lanceur et au dernier élément focalisé avant ouverture. */
    let panel = null;
    let launcher = null;
    let previouslyFocused = null;

    /* Écrit un message accessible dans le panneau. */
    function setStatus(text) {
      const status = panel && panel.querySelector(".mission-recovery-status");
      if (status) status.textContent = text;
    }

    /* Ferme le panneau et rend le focus. */
    function closePanel() {
      if (!panel) return;
      panel.remove();
      panel = null;
      if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
    }

    /* COPIE UNIQUEMENT : délègue à l'API (aucune mutation d'état), avec message accessible. */
    function copyBackup(ref) {
      Recovery.copyBackup(ref).then(
        () => setStatus("Ancien code copié dans le presse-papiers."),
        () => setStatus("Copie impossible dans ce navigateur.")
      );
    }

    /* CONSULTATION EN LECTURE SEULE (Solution B pure) : affiche l'ancien code dans le panneau. */
    /* N'appelle JAMAIS de restauration : ne modifie ni sessions[1].code, ni modeMission, ni */
    /* helpMode, ni la progression, ni attempted, et ne marque pas la sauvegarde comme résolue. */
    function showConsult(ref) {
      if (!panel) return;
      const code = Recovery.getBackupCode(ref);
      panel.querySelector("h2").textContent = "Consultation de l'ancien code";
      const message = panel.querySelector(".mission-recovery-msg");
      message.textContent = "Votre ancien programme est affiché ci-dessous en lecture seule : il n'a PAS été adapté au nouveau squelette et la nouvelle activité n'est pas modifiée. Sélectionnez-le et copiez-le si besoin.";
      /* Zone de texte en lecture seule contenant le code complet. */
      const area = document.createElement("textarea");
      area.className = "mission-recovery-code";
      area.readOnly = true;
      area.setAttribute("aria-label", "Ancien code, en lecture seule");
      area.value = code || "";
      message.insertAdjacentElement("afterend", area);
      /* Remplace les actions par « Copier mon ancien code » et « Revenir à la nouvelle version ». */
      const actions = panel.querySelector(".mission-recovery-actions");
      actions.innerHTML = "";
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "mission-recovery-copy";
      copyButton.textContent = "Copier mon ancien code";
      copyButton.setAttribute("aria-label", "Copier mon ancien code dans le presse-papiers");
      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "mission-recovery-back";
      backButton.textContent = "Revenir à la nouvelle version";
      backButton.setAttribute("aria-label", "Revenir à la nouvelle version de l'activité");
      actions.append(copyButton, backButton);
      copyButton.addEventListener("click", () => copyBackup(ref));
      backButton.addEventListener("click", closePanel);
      /* Focalise et présélectionne le code pour une copie clavier immédiate (Ctrl+C). */
      area.focus();
      area.select();
      setStatus("Consultation en lecture seule. La nouvelle activité et la sauvegarde sont inchangées.");
    }

    /* Ouvre le panneau pour une sauvegarde donnée. */
    function openPanel(backup) {
      if (!backup) return;
      injectStyles();
      closePanel();
      previouslyFocused = document.activeElement;
      panel = document.createElement("div");
      panel.className = "mission-recovery-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "false");
      panel.setAttribute("aria-label", "Récupération d'une ancienne version de votre programme");
      panel.innerHTML = `
        <button type="button" class="mission-recovery-close" aria-label="Fermer le panneau de récupération">×</button>
        <h2>Ancienne version disponible</h2>
        <p class="mission-recovery-msg">Une ancienne version de votre programme a été sauvegardée lors de la mise à jour de l'activité.</p>
        <div class="mission-recovery-actions">
          <button type="button" class="mission-recovery-continue" aria-label="Continuer avec la nouvelle version">Continuer avec la nouvelle version</button>
          <button type="button" class="mission-recovery-consult" aria-label="Consulter mon ancien code en lecture seule">Consulter mon ancien code</button>
          <button type="button" class="mission-recovery-copy" aria-label="Copier mon ancien code dans le presse-papiers">Copier mon ancien code</button>
        </div>
        <p class="mission-recovery-status" aria-live="polite"></p>
      `;

      /* A. Continuer avec la nouvelle version : conserve l'état actif tel quel, marque la */
      /* notification comme traitée (jamais de suppression de la sauvegarde), ferme le panneau. */
      panel.querySelector(".mission-recovery-continue").addEventListener("click", () => {
        Recovery.markResolved(backup.id);
        closePanel();
      });
      /* B. Consulter mon ancien code : LECTURE SEULE. Aucune restauration, aucune mutation. */
      panel.querySelector(".mission-recovery-consult").addEventListener("click", () => {
        showConsult(backup.id);
      });
      /* C. Copier mon ancien code : copie uniquement, sans toucher à aucun état pédagogique. */
      panel.querySelector(".mission-recovery-copy").addEventListener("click", () => {
        copyBackup(backup.id);
      });
      /* Fermeture par la croix ou par Échap. */
      panel.querySelector(".mission-recovery-close").addEventListener("click", closePanel);
      panel.addEventListener("keydown", event => { if (event.key === "Escape") closePanel(); });

      document.body.appendChild(panel);
      /* Focus initial sur le premier bouton d'action pour une navigation clavier immédiate. */
      panel.querySelector(".mission-recovery-continue").focus();
    }

    /* Construit le lanceur « Récupération » (accès volontaire), présent dès qu'une sauvegarde existe. */
    function buildLauncher() {
      if (launcher) return;
      injectStyles();
      launcher = document.createElement("button");
      launcher.type = "button";
      launcher.className = "mission-recovery-launcher";
      launcher.textContent = "Récupération";
      launcher.setAttribute("aria-label", "Ouvrir la récupération d'une ancienne version de votre programme");
      launcher.addEventListener("click", () => {
        const backups = Recovery.list();
        openPanel(Recovery.latestUnresolved() || backups[backups.length - 1]);
      });
      document.body.appendChild(launcher);
    }

    /* Décide de l'affichage : lanceur si des sauvegardes existent, panneau auto si non résolu. */
    const backups = Recovery.list();
    if (backups.length > 0) {
      buildLauncher();
      const unresolved = Recovery.latestUnresolved();
      if (unresolved) openPanel(unresolved);
    }
  });
})();
