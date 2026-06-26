/* Relie les huit anciennes cartes de missions aux huit séances séparées notées sur 20. */
"use strict";

(() => {
  const missions = document.getElementById("missions");
  if (!missions || document.getElementById("premiumPathBanner")) return;

  const style = document.createElement("style");
  style.id = "technoquest-premium-path-link-styles";
  style.textContent = `
    .premium-path-banner{margin:1rem clamp(1rem,5vw,5rem);padding:1rem 1.1rem;border:1px solid #267287;border-left:6px solid #22d3ee;border-radius:16px;background:linear-gradient(135deg,#0b2230,#07151f);box-shadow:0 18px 45px #0004;color:#e8fbff}
    .premium-path-banner h2{margin:.05rem 0 .4rem}.premium-path-banner p{margin:.35rem 0;color:#bcd4df;line-height:1.5}.premium-path-banner a{display:inline-block;margin-top:.55rem;padding:.7rem .9rem;border:1px solid #22d3ee;border-radius:11px;background:#0f766e;color:#fff;text-decoration:none;font-weight:900}
    #missions .mission{position:relative;cursor:pointer;min-height:82px}
    #missions .mission small{display:block;margin-top:.3rem;color:#fde68a;font-weight:900}
  `;
  document.head.appendChild(style);

  const banner = document.createElement("section");
  banner.id = "premiumPathBanner";
  banner.className = "premium-path-banner";
  banner.innerHTML = `<h2>Nouveau parcours : 8 séances ultra premium</h2><p>Chaque mission ouvre maintenant une page autonome, légère et notée sur 20, avec son jumeau numérique ciblé, son algorithme, son éditeur Python coloré, ses tests et son barème.</p><a href="parcours.html">Ouvrir le parcours des 8 séances →</a>`;
  missions.insertAdjacentElement("beforebegin", banner);

  function relabel() {
    missions.querySelectorAll("button").forEach(button => {
      const small = button.querySelector("small");
      if (small) small.textContent = "Séance notée /20";
    });
    const score = document.getElementById("score");
    const progress = document.getElementById("progress");
    if (score) score.textContent = "8 séances";
    if (progress) progress.textContent = "Chaque séance est évaluée sur 20";
  }

  missions.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const buttons = [...missions.querySelectorAll("button")];
    const index = buttons.indexOf(button);
    if (index < 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = `seance-${index + 1}.html`;
  }, true);

  new MutationObserver(relabel).observe(missions, {childList:true, subtree:true});
  relabel();
})();
