/* Met en avant le visuel v01 pour lancer la séquence. */
"use strict";

(() => {
  const introGrid = document.querySelector(".intro-grid");
  const visualIntro = document.querySelector(".visual-intro");
  const triggerMedia = document.querySelector(".trigger-media");
  if (!introGrid || !visualIntro || !triggerMedia) return;

  const grid = visualIntro.querySelector(".visual-intro-grid");
  if (!grid) return;

  [...grid.querySelectorAll(".visual-card")].forEach(card => {
    const href = card.querySelector("use")?.getAttribute("href") || "";
    if (!href.endsWith("#v01")) card.remove();
  });

  const selectedCard = grid.querySelector(".visual-card");
  if (!selectedCard) return;

  visualIntro.classList.add("selected-trigger-visual");
  const eyebrow = visualIntro.querySelector(".eyebrow");
  const title = visualIntro.querySelector("h2");
  const badge = visualIntro.querySelector(".badge");
  if (eyebrow) eyebrow.textContent = "Image retenue pour lancer le projet";
  if (title) title.textContent = "Trop peu ou trop d’eau : comment trouver le bon équilibre ?";
  if (badge) badge.textContent = "Situation déclenchante";

  const caption = selectedCard.querySelector("figcaption");
  if (caption) {
    caption.innerHTML = `<strong>Observer deux situations opposées</strong>
      À gauche, le sol est trop sec et la plante manque d’eau. À droite, l’excès d’eau peut asphyxier les racines et gaspiller la ressource. Le système devra donc arroser seulement lorsque cela est nécessaire.`;
  }

  const questions = document.createElement("section");
  questions.className = "trigger-observation-guide";
  questions.setAttribute("aria-label", "Questions d’observation");
  questions.innerHTML = `
    <strong>Avant de découvrir la solution, observe l’image et réponds oralement :</strong>
    <ol>
      <li>Quel problème reconnais-tu dans chacune des deux parties ?</li>
      <li>Quelle grandeur faudrait-il mesurer pour éviter ces deux situations ?</li>
      <li>Comment un système pourrait-il décider du bon moment pour arroser ?</li>
    </ol>
    <p><strong>Problématique :</strong> comment arroser la plante uniquement lorsqu’elle en a besoin, tout en économisant l’eau et en protégeant le matériel ?</p>`;
  selectedCard.insertAdjacentElement("afterend", questions);

  const style = document.createElement("style");
  style.id = "technoquest-trigger-visual-selection-styles";
  style.textContent = `
    .selected-trigger-visual .visual-intro-grid{grid-template-columns:minmax(0,1fr)!important;max-width:980px;margin-inline:auto}
    .selected-trigger-visual .visual-card svg{aspect-ratio:16/9}
    .selected-trigger-visual .visual-card figcaption{font-size:1rem}
    .trigger-observation-guide{margin-top:1rem;padding:1rem 1.1rem;border:1px solid var(--border);border-left:5px solid var(--yellow);border-radius:14px;background:#352b0c;color:#fff1bd;line-height:1.55}
    .trigger-observation-guide>strong{display:block;color:#fff;margin-bottom:.45rem}
    .trigger-observation-guide ol{margin:.4rem 0 .7rem;padding-left:1.4rem}
    .trigger-observation-guide li{margin:.3rem 0}
    .trigger-observation-guide p{margin:.65rem 0 0;padding-top:.65rem;border-top:1px solid #ffd16655}
    @media(max-width:760px){.selected-trigger-visual .visual-card figcaption{font-size:.9rem}}
  `;
  document.head.appendChild(style);

  introGrid.insertAdjacentElement("afterend", visualIntro);
})();
