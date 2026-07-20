/* ============================================================================
   PROTOTYPE FABLE — Parcours vertical séquentiel des séances 2 à 8.
   ----------------------------------------------------------------------------
   Version générique de l'orchestrateur de la séance 1. Même principe :
   NOUVEAU fichier de présentation, aucune logique fonctionnelle modifiée.
   - il DÉPLACE les conteneurs existants (écouteurs conservés) ;
   - il AJOUTE en-têtes de parties, transitions et rail de progression ;
   - les contenus pédagogiques des séances 2 à 8 ne sont pas réécrits :
     les cartes existantes (jumeau, algorithme coloré, éditeur, protocole,
     barème) sont réorganisées telles quelles.
   Ces séances n'ayant ni section « montage réel » ni QCM, le parcours
   comporte cinq parties. #missionModeRoot n'est pas déplacé (écran complet).
   ============================================================================ */
"use strict";

(() => {
  const sessionId = Number(document.body.dataset.session || 0);
  if (sessionId < 2 || sessionId > 8) return;

  const run = () => {
    const shell = document.querySelector(".session-shell");
    if (!shell || document.getElementById("fvRail")) return;

    /* ---------- Repérage des blocs existants ------------------------------ */
    const byTitle = fragment =>
      [...shell.querySelectorAll(".card")].find(card => {
        const h = card.querySelector("h2, h3");
        return h && h.textContent.toLowerCase().includes(fragment.toLowerCase());
      }) || null;

    const topbar = shell.querySelector(".session-topbar");
    const hero = shell.querySelector(".session-hero");
    const lessonPath = shell.querySelector(".lesson-path");
    const grids = [...shell.querySelectorAll(":scope > .session-grid")];
    const twinCard = byTitle("Simuler le jumeau numérique");
    const algoCard = byTitle("algorithme");
    const studentCard = byTitle("Mission élève");
    const editorCard = byTitle("Écrire le programme");
    const testsCard = byTitle("protocole de tests");
    const rubricCard = byTitle("Barème");
    const footerNav = shell.querySelector(".session-footer-nav");

    if (!hero || !twinCard || !editorCard || !testsCard) return;

    /* ---------- Définition des cinq parties ------------------------------- */
    const TOTAL = 5;
    const PARTS = [
      { n: 1, id: "partie-1", title: "Découvrir la mission",
        goal: "Comprendre la situation de départ et l’objectif de la séance.",
        transition: "Commence par observer le fonctionnement du jardin connecté." },
      { n: 2, id: "partie-2", title: "Observer le système",
        goal: "Lancer le jumeau numérique et repérer les constituants concernés.",
        transition: "Tu as observé le système. Découvre maintenant l’algorithme qui organise les actions de cette séance." },
      { n: 3, id: "partie-3", title: "Comprendre l’algorithme",
        goal: "Lire les actions de la séance dans l’ordre, de haut en bas.",
        transition: "Tu connais le déroulement des actions. Complète maintenant le programme dans le mode Mission." },
      { n: 4, id: "partie-4", title: "Programmer et exécuter",
        goal: "Compléter le programme avec le niveau d’aide de ton choix, puis l’exécuter.",
        transition: "Ton programme s’exécute : vérifie point par point qu’il répond au protocole de la séance." },
      { n: 5, id: "partie-5", title: "Tester et interpréter",
        goal: "Cocher le protocole de vérification et rédiger la réponse argumentée.",
        transition: "" }
    ];

    const el = (tag, className, html) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (html !== undefined) node.innerHTML = html;
      return node;
    };

    const pageHref = `prototype-fable/seance-${sessionId}-verticale.html`;

    const buildPart = part => {
      const section = el("section", "fv-part");
      section.id = part.id;
      section.setAttribute("aria-labelledby", `fv-title-${part.n}`);
      section.innerHTML = `
        <header class="fv-part-head">
          <div class="fv-pastille" aria-hidden="true">${part.n}</div>
          <div class="fv-part-head-text">
            <p class="fv-part-kicker">Partie ${part.n} sur ${TOTAL}</p>
            <h2 id="fv-title-${part.n}">${part.title}</h2>
            <p class="fv-part-goal">${part.goal}</p>
          </div>
        </header>
        <div class="fv-part-body"></div>
        ${part.transition ? `
        <footer class="fv-transition">
          <span class="fv-transition-arrow" aria-hidden="true">↓</span>
          <p>${part.transition}</p>
          <a class="fv-continue" href="${pageHref}#partie-${part.n + 1}">Continuer vers la partie ${part.n + 1}</a>
        </footer>` : `
        <footer class="fv-transition fv-transition-end">
          <p>Séance terminée : pense à enregistrer ton travail. Bravo !</p>
        </footer>`}
      `;
      return section;
    };

    const parts = {};
    PARTS.forEach(p => { parts[p.n] = buildPart(p); });
    const body = n => parts[n].querySelector(".fv-part-body");

    /* ---------- Rail de progression --------------------------------------- */
    const rail = el("nav", "fv-rail");
    rail.id = "fvRail";
    rail.setAttribute("aria-label", `Progression de la séance : ${TOTAL} parties`);
    rail.innerHTML = `
      <div class="fv-rail-compact">
        <button type="button" class="fv-rail-toggle" aria-expanded="false" aria-controls="fvRailList">☰<span class="sr-only"> Afficher les ${TOTAL} parties</span></button>
        <div class="fv-rail-now">
          <span class="fv-rail-now-kicker">Partie 1 sur ${TOTAL}</span>
          <strong class="fv-rail-now-title">${PARTS[0].title}</strong>
        </div>
        <div class="fv-rail-bar" aria-hidden="true">${PARTS.map(() => "<i></i>").join("")}</div>
      </div>
      <div class="fv-rail-list" id="fvRailList">${PARTS.map(p =>
        `<a href="${pageHref}#${p.id}" data-part="${p.n}"><span>${p.n}</span><em>${p.title}</em></a>`
      ).join("")}</div>`;
    const railToggle = rail.querySelector(".fv-rail-toggle");
    railToggle.addEventListener("click", () => {
      const open = rail.classList.toggle("open");
      railToggle.setAttribute("aria-expanded", String(open));
    });
    rail.querySelectorAll(".fv-rail-list a").forEach(link => link.addEventListener("click", () => {
      rail.classList.remove("open");
      railToggle.setAttribute("aria-expanded", "false");
    }));

    /* ---------- Bandeau prototype ------------------------------------------ */
    const banner = el("p", "fv-banner",
      `Prototype d’ergonomie « parcours vertical » — séance ${sessionId} : contenus et fonctionnalités actuels, uniquement réorganisés.`);

    /* ---------- Assemblage : attacher la structure avant de la remplir ----- */
    if (topbar) topbar.insertAdjacentElement("afterend", banner);
    else shell.prepend(banner);
    banner.insertAdjacentElement("afterend", rail);
    let anchor = rail;
    PARTS.forEach(p => { anchor.insertAdjacentElement("afterend", parts[p.n]); anchor = parts[p.n]; });
    if (footerNav) shell.appendChild(footerNav);

    /* ======================= PARTIE 1 — Découvrir ========================= */
    body(1).appendChild(hero);
    const detailsPlan = el("details", "fv-fold");
    detailsPlan.innerHTML = "<summary>Déroulé détaillé de la séance (à consulter si besoin)</summary>";
    const detailsPlanBody = el("div", "fv-fold-body");
    if (lessonPath) detailsPlanBody.appendChild(lessonPath);
    if (studentCard) detailsPlanBody.appendChild(studentCard);
    detailsPlan.appendChild(detailsPlanBody);
    body(1).appendChild(detailsPlan);

    /* ======================= PARTIE 2 — Observer ========================== */
    body(2).appendChild(el("div", "fv-consigne",
      "<strong>Consigne d’observation :</strong> lance la démonstration, suis le trajet des signaux entre les constituants, puis arrête la simulation avant de poursuivre."));
    body(2).appendChild(twinCard);

    /* ==================== PARTIE 3 — Comprendre =========================== */
    if (algoCard) body(3).appendChild(algoCard);

    /* ==================== PARTIE 4 — Programmer =========================== */
    const missionButton = document.getElementById("missionActivate");
    if (missionButton) {
      const launcher = el("div", "fv-mission-launcher", `
        <span class="fv-path-tag fv-path-reco">Parcours recommandé</span>
        <div>
          <h3>Mode Mission — écran complet</h3>
          <p>L’éditeur guidé s’ouvre en pleine largeur avec le jumeau numérique, les objectifs, la validation en direct et tes sauvegardes.</p>
        </div>
        <button type="button" class="btn primary fv-mission-open">🚀 Ouvrir le mode Mission</button>`);
      launcher.querySelector(".fv-mission-open").addEventListener("click", () => missionButton.click());
      body(4).appendChild(launcher);
    }
    const editorFold = el("details", "fv-fold fv-editor-alt");
    editorFold.innerHTML = "<summary><span class=\"fv-path-tag\">Alternative</span> Éditeur classique dans la page (déplier si besoin)</summary>";
    const editorFoldBody = el("div", "fv-fold-body");
    editorFoldBody.appendChild(editorCard);
    editorFold.appendChild(editorFoldBody);
    body(4).appendChild(editorFold);

    /* ==================== PARTIE 5 — Tester =============================== */
    if (testsCard) body(5).appendChild(testsCard);
    if (rubricCard) {
      const rubricFold = el("details", "fv-fold");
      rubricFold.innerHTML = "<summary>Barème de la séance et correction complète (détails)</summary>";
      const rubricFoldBody = el("div", "fv-fold-body");
      rubricFoldBody.appendChild(rubricCard);
      rubricFold.appendChild(rubricFoldBody);
      body(5).appendChild(rubricFold);
    }

    /* Retirer les conteneurs de grille devenus vides (conteneurs seulement). */
    grids.forEach(grid => {
      [...grid.querySelectorAll(":scope > div")].forEach(div => { if (!div.children.length) div.remove(); });
      if (!grid.children.length || [...grid.children].every(c => !c.children.length && !c.textContent.trim())) grid.remove();
    });

    /* ---------- Rail : partie active + indicateur compact ------------------ */
    const railKicker = rail.querySelector(".fv-rail-now-kicker");
    const railTitle = rail.querySelector(".fv-rail-now-title");
    const railSegments = [...rail.querySelectorAll(".fv-rail-bar i")];
    const setActivePart = n => {
      rail.querySelectorAll(".fv-rail-list a").forEach(link =>
        link.classList.toggle("active", link.dataset.part === String(n)));
      const part = PARTS[n - 1];
      if (part) {
        railKicker.textContent = `Partie ${part.n} sur ${TOTAL}`;
        railTitle.textContent = part.title;
        railSegments.forEach((seg, i) => seg.classList.toggle("filled", i < part.n));
      }
    };
    setActivePart(1);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActivePart(Number(entry.target.id.replace("partie-", "")));
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      PARTS.forEach(p => observer.observe(parts[p.n]));
    }

    /* ---------- En-tête mobile compact ------------------------------------ */
    const sessionNav = shell.querySelector(".session-nav");
    if (sessionNav && !sessionNav.querySelector(".fv-nav-toggle")) {
      const navToggle = el("button", "fv-nav-toggle", "⋯<span class=\"sr-only\"> Menu de navigation</span>");
      navToggle.type = "button";
      navToggle.setAttribute("aria-expanded", "false");
      sessionNav.prepend(navToggle);
      navToggle.addEventListener("click", () => {
        const open = sessionNav.classList.toggle("fv-nav-open");
        navToggle.setAttribute("aria-expanded", String(open));
      });
    }

    /* ---------- Parties refermables ---------------------------------------- */
    PARTS.forEach(p => {
      const head = parts[p.n].querySelector(".fv-part-head");
      const collapse = el("button", "fv-part-collapse", "Replier");
      collapse.type = "button";
      collapse.setAttribute("aria-expanded", "true");
      collapse.setAttribute("aria-label", `Replier la partie ${p.n} : ${p.title}`);
      head.appendChild(collapse);
      collapse.addEventListener("click", () => {
        const collapsed = parts[p.n].classList.toggle("fv-collapsed");
        collapse.textContent = collapsed ? "Déplier" : "Replier";
        collapse.setAttribute("aria-expanded", String(!collapsed));
        collapse.setAttribute("aria-label", `${collapsed ? "Déplier" : "Replier"} la partie ${p.n} : ${p.title}`);
      });
    });

    document.body.classList.add("fv-vertical");
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
