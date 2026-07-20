/* TechnoQuest — export du bilan élève (v3).
   Un bouton « Exporter mon bilan » compose un fichier JSON scellé contenant
   la progression réelle de la séance (coches, QCM, programme, réponse
   argumentée, horodatages) destiné au tableau de bord enseignant
   (prototype-fable/tableau-de-bord.html). Les données ne quittent l'appareil
   que par ce geste volontaire. Un « code bilan » à copier est proposé pour
   les ENT où déposer un fichier est difficile. */
"use strict";
(() => {
  const sessionId = Number(document.body.dataset.session || 0);
  if (sessionId < 1 || sessionId > 8) return;

  const TITRES = { 1: "Observer les signaux", 2: "Calibrer un seuil", 3: "Analyser les chaînes", 4: "Protéger la pompe", 5: "Économiser l’eau", 6: "Décider avec trois données", 7: "Améliorer la durabilité", 8: "Défi ingénieur" };
  const readJson = key => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; } };

  /* Somme de contrôle djb2 (dissuasive, pas cryptographique). */
  const checksum = text => {
    let h = 5381;
    for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };

  const slug = value => String(value).normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "eleve";

  const buildBilan = (name, classe) => {
    const premium = readJson("technoquest-premium-v1").sessions?.[sessionId] || {};
    const progression = readJson("technoquest-progression-v1").sessions?.[sessionId] || {};
    const qcm = readJson("technoquest-qcm-v1").sessions?.[sessionId] || {};
    const bilan = {
      format: "technoquest-bilan-v1",
      exportedAt: new Date().toISOString(),
      seance: { id: sessionId, titre: TITRES[sessionId] },
      eleve: { nom: name, classe },
      progression: {
        demo: Boolean(progression.demo),
        programme: Boolean(progression.programme),
        qcm: Boolean(progression.qcm || qcm.validated),
        dernierePartie: progression.lastPart || null
      },
      qcm: {
        valide: Boolean(qcm.validated),
        score: qcm.validated ? qcm.score : null,
        valideLe: qcm.validatedAt || null,
        reponses: qcm.answers || {}
      },
      programme: {
        code: typeof premium.code === "string" ? premium.code : "",
        verifie: Boolean(progression.programme)
      },
      reponseArgumentee: premium.answer || ""
    };
    bilan.checksum = checksum(JSON.stringify({ ...bilan, checksum: undefined }));
    return bilan;
  };

  const boot = () => {
    const actions = document.querySelector("#qcmEngineRoot .qcm-actions");
    if (!actions || document.getElementById("fvBilanBtn")) return;

    const button = document.createElement("button");
    button.id = "fvBilanBtn";
    button.type = "button";
    button.className = "btn";
    button.textContent = "📤 Exporter mon bilan";
    button.title = "Enregistre un fichier bilan à remettre au professeur (tableau de bord).";
    actions.appendChild(button);

    button.addEventListener("click", async () => {
      const profile = readJson("technoquest-premium-v1").profile || {};
      let name = (profile.name || "").trim();
      let classe = (profile.classe || "").trim();
      if (!name) {
        name = (window.prompt("Ton prénom et ton nom (pour le fichier bilan) :", name) || "").trim();
        if (!name) return;
        classe = (window.prompt("Ta classe :", classe) || "").trim();
        const fresh = readJson("technoquest-premium-v1");
        fresh.profile = { ...(fresh.profile || {}), name, classe };
        localStorage.setItem("technoquest-premium-v1", JSON.stringify(fresh));
      }
      const bilan = buildBilan(name, classe);
      const json = JSON.stringify(bilan, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bilan_${slug(name)}${classe ? `_${slug(classe)}` : ""}_seance-${sessionId}.json`;
      document.body.appendChild(link); link.click(); link.remove();
      URL.revokeObjectURL(url);
      /* Code bilan copiable (repli sans fichier). */
      try {
        await navigator.clipboard.writeText(`TQB1:${btoa(unescape(encodeURIComponent(json)))}`);
        button.textContent = "📤 Bilan exporté — code copié ✓";
      } catch {
        button.textContent = "📤 Bilan exporté ✓";
      }
      setTimeout(() => { button.textContent = "📤 Exporter mon bilan"; }, 4000);
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0));
  else setTimeout(boot, 0);
})();
