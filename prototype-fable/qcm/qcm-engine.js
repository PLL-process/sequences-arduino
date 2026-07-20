/* TechnoQuest — moteur QCM commun des huit séances.
   Un seul moteur, des données par séance (qcm-data-sN.js), une sauvegarde par
   séance dans une clé DÉDIÉE (technoquest-qcm-v1) écrite en lecture-fusion :
   ouvrir le mode Mission, naviguer ou recharger ne peut pas effacer les
   réponses. Les corrections exhaustives ne sont visibles qu'après validation. */
"use strict";
(() => {
  const sessionId = Number(document.body.dataset.session || 0);
  if (sessionId < 1 || sessionId > 8) return;

  const boot = () => {
    const data = window.TechnoQuestQCM?.data?.[sessionId];
    if (!data || document.getElementById("qcmEngineRoot")) return;

    const STORAGE_KEY = "technoquest-qcm-v1";
    const read = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } };
    const write = patch => {
      const fresh = read();
      fresh.sessions = fresh.sessions || {};
      fresh.sessions[sessionId] = { ...(fresh.sessions[sessionId] || {}), ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh.sessions[sessionId];
    };
    let saved = read().sessions?.[sessionId] || {};

    /* Migration douce : réponses de l'ancien QCM de la séance 1 (practicalV1.qcm).
       Certaines questions ont vu l'ordre de leurs choix tourné pour équilibrer
       la répartition des bonnes réponses : legacyChoiceMap (ancien index →
       nouvel index) préserve alors la réponse réellement choisie par l'élève. */
    if (sessionId === 1 && !saved.answers) {
      try {
        const legacy = JSON.parse(localStorage.getItem("technoquest-premium-v1") || "{}").sessions?.[1]?.practicalV1?.qcm;
        if (legacy && Object.keys(legacy).length) {
          const answers = {};
          Object.entries(legacy).forEach(([name, value]) => {
            const n = Number(String(name).replace("s1q", ""));
            if (n >= 1 && n <= 20) {
              const question = data.questions[n - 1];
              const oldIndex = Number(value);
              const mapped = question?.legacyChoiceMap ? question.legacyChoiceMap[oldIndex] : oldIndex;
              if (mapped !== undefined) answers[`s1q${n}`] = Number(mapped);
            }
          });
          saved = write({ answers, migratedFromLegacy: true });
        }
      } catch { /* la migration est optionnelle */ }
    }
    const answers = { ...(saved.answers || {}) };
    let validated = Boolean(saved.validated);

    const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const questionHtml = (q, number) => `
      <fieldset class="qcm-question" data-qid="${q.id}" data-correct="${q.answer}">
        <legend><span class="qcm-badge">Q${number}</span><span class="qcm-libelle">${esc(q.question)}</span></legend>
        ${q.choices.map((choice, i) => `
          <label class="qcm-choice" data-index="${i}">
            <input type="radio" name="${q.id}" value="${i}"${answers[q.id] === i ? " checked" : ""}>
            <span>${esc(choice)}</span>
          </label>`).join("")}
        <div class="qcm-correction" hidden>
          <p class="qcm-cor-bonne"><strong>Bonne réponse :</strong> ${esc(q.choices[q.answer])}</p>
          <p class="qcm-cor-explication">${esc(q.explanation)}</p>
          <div class="qcm-cor-autres"><strong>Pourquoi les autres réponses ne conviennent pas :</strong>
            <ul>${q.whyOthers.map((w, i) => w ? `<li><em>${esc(q.choices[i])}</em> — ${esc(w)}</li>` : "").join("")}</ul>
          </div>
          <p class="qcm-cor-jardin"><strong>Dans le Jardin connecté :</strong> ${esc(q.exampleGarden)}</p>
          <p class="qcm-cor-autre"><strong>Dans un autre système :</strong> ${esc(q.exampleOther)}</p>
          <p class="qcm-cor-retenir"><strong>À retenir :</strong> ${esc(q.takeaway)}</p>
        </div>
      </fieldset>`;

    const root = document.createElement("section");
    root.id = "qcmEngineRoot";
    root.className = "qcm-root";
    root.setAttribute("aria-labelledby", "qcmEngineTitle");
    root.innerHTML = `
      <div class="qcm-head">
        <div>
          <h2 id="qcmEngineTitle">QCM de fin de séance</h2>
          <p>Vingt questions : dix essentielles puis dix d'approfondissement. Chaque question vaut un point.</p>
        </div>
        <p class="qcm-score" id="qcmScoreBox" role="status" aria-live="polite">Score : — / 20</p>
      </div>
      <div class="qcm-consigne">Réponds à toutes les questions puis clique sur « Valider mes réponses ». La correction détaillée apparaît après la validation.</div>
      <h3 class="qcm-groupe">Questions essentielles <span>Q1 à Q10</span></h3>
      <div class="qcm-liste" data-glossaire>${data.questions.slice(0, 10).map((q, i) => questionHtml(q, i + 1)).join("")}</div>
      <details class="qcm-extension" open>
        <summary>Approfondissement et transfert <span>Q11 à Q20</span></summary>
        <div class="qcm-liste" data-glossaire>${data.questions.slice(10).map((q, i) => questionHtml(q, i + 11)).join("")}</div>
      </details>
      <div class="qcm-actions">
        <button type="button" class="btn primary" id="qcmValidate">Valider mes réponses</button>
        <button type="button" class="btn" id="qcmReset">Recommencer</button>
        <span class="qcm-save-note" id="qcmSaveNote">Tes réponses sont enregistrées automatiquement sur cet appareil.</span>
      </div>`;

    /* Point d'insertion : avant la navigation de bas de page (page classique) ;
       les orchestrateurs du prototype vertical déplacent ensuite cette section
       dans la partie QCM. Sur la séance 1, l'ancien affichage du QCM embarqué
       est remplacé par le moteur commun (les réponses ont été migrées). */
    const legacyCore = document.getElementById("s1QcmCore");
    if (sessionId === 1 && legacyCore) {
      const legacyToolbar = legacyCore.closest(".s1-card-body")?.querySelector(".s1-qcm-toolbar");
      const legacyExtension = legacyCore.closest(".s1-card-body")?.querySelector("details.s1-extension");
      legacyToolbar?.remove();
      legacyExtension?.remove();
      legacyCore.replaceWith(root);
    } else {
      const footer = document.querySelector(".session-footer-nav");
      if (footer) footer.insertAdjacentElement("beforebegin", root);
      else document.body.appendChild(root);
    }

    const fields = [...root.querySelectorAll(".qcm-question")];
    const scoreBox = root.querySelector("#qcmScoreBox");
    const validateButton = root.querySelector("#qcmValidate");
    const resetButton = root.querySelector("#qcmReset");

    const setInputsDisabled = disabled => root.querySelectorAll("input[type=radio]").forEach(input => { input.disabled = disabled; });

    const applyCorrection = () => {
      let score = 0;
      fields.forEach(field => {
        const qid = field.dataset.qid;
        const correct = Number(field.dataset.correct);
        const chosen = answers[qid];
        const ok = chosen === correct;
        if (ok) score += 1;
        field.classList.toggle("correct", ok);
        field.classList.toggle("incorrect", !ok);
        field.querySelectorAll(".qcm-choice").forEach(label => {
          const index = Number(label.dataset.index);
          label.classList.toggle("qcm-choice-bonne", index === correct);
          label.classList.toggle("qcm-choice-erreur", !ok && index === chosen);
        });
        field.querySelector(".qcm-correction").hidden = false;
      });
      scoreBox.textContent = `Score : ${score} / 20`;
      setInputsDisabled(true);
      validateButton.disabled = true;
      return score;
    };

    root.addEventListener("change", event => {
      const input = event.target;
      if (input.type !== "radio") return;
      answers[input.name] = Number(input.value);
      saved = write({ answers });
    });

    validateButton.addEventListener("click", () => {
      const unanswered = data.questions.filter(q => !(q.id in answers)).length;
      if (unanswered && !window.confirm(`${unanswered} question(s) sans réponse compteront zéro. Valider quand même ?`)) return;
      const score = applyCorrection();
      validated = true;
      saved = write({ answers, validated: true, score, validatedAt: new Date().toISOString() });
      scoreBox.focus?.();
    });

    resetButton.addEventListener("click", () => {
      if (!window.confirm("Recommencer le QCM ? Tes réponses et ta correction actuelles seront effacées.")) return;
      Object.keys(answers).forEach(key => delete answers[key]);
      validated = false;
      saved = write({ answers: {}, validated: false, score: undefined, validatedAt: undefined });
      root.querySelectorAll("input[type=radio]").forEach(input => { input.checked = false; });
      fields.forEach(field => {
        field.classList.remove("correct", "incorrect");
        field.querySelectorAll(".qcm-choice").forEach(l => l.classList.remove("qcm-choice-bonne", "qcm-choice-erreur"));
        field.querySelector(".qcm-correction").hidden = true;
      });
      setInputsDisabled(false);
      validateButton.disabled = false;
      scoreBox.textContent = "Score : — / 20";
    });

    /* État restauré : réponses déjà cochées via le rendu ; correction si validée. */
    if (validated) applyCorrection();

    /* Infobulles + glossaire (si le module est chargé). */
    window.TechnoQuestInfobulles?.enhance(root);
    if (window.TechnoQuestInfobulles && !document.getElementById("glossaireTechnique")) {
      root.insertAdjacentElement("afterend", window.TechnoQuestInfobulles.buildGlossary());
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
