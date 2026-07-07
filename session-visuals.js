"use strict";
(() => {
  const n = Number(document.body.dataset.session || 0);
  if (n < 2 || n > 8) return;
  const stage = document.getElementById("twinStage");
  if (!stage) return;

  const titles = ["","","Calibrer un seuil","Analyser les chaînes","Protéger la pompe","Économiser l’eau","Décider avec trois données","Améliorer la durabilité","Défi ingénieur"];
  const notes = ["","","Le seuil se choisit à partir de plusieurs mesures en sol sec et humide, puis se vérifie expérimentalement.","La chaîne d’information et la chaîne d’énergie jouent des rôles différents mais complémentaires.","La pompe reste arrêtée si le niveau du réservoir est insuffisant.","Deux seuils et un arrosage court réduisent les commutations et la consommation d’eau.","La décision combine humidité, luminosité et niveau du réservoir.","La durabilité dépend du choix du capteur, de la calibration, de la maintenance et de la réparabilité.","Le prototype final doit réussir les cas normaux, les cas limites et une défaillance."];
  const col = (n - 1) % 4;
  const row = Math.floor((n - 1) / 4);
  const x = [0, 33.333, 66.667, 100][col];
  const y = row ? 100 : 0;

  const style = document.createElement("style");
  style.textContent = ".realSessionVisual{width:100%;height:100%;background-image:url(images/seances-reelles-sprite.svg?v=1);background-repeat:no-repeat;background-size:400% 200%;background-position:var(--x) var(--y);background-color:#fff}.realSessionNote{margin:.75rem 0 0;padding:.75rem .85rem;border:1px solid #31536a;border-left:5px solid var(--session-accent,#22d3ee);border-radius:11px;background:#07131f;color:#dce9ef;line-height:1.45}";
  document.head.appendChild(style);

  stage.innerHTML = "";
  stage.style.background = "#fff";
  const visual = document.createElement("div");
  visual.className = "realSessionVisual";
  visual.style.setProperty("--x", x + "%");
  visual.style.setProperty("--y", y + "%");
  visual.setAttribute("role", "img");
  visual.setAttribute("aria-label", "Infographie réaliste de la séance " + n + " : " + titles[n]);
  stage.appendChild(visual);

  const heading = stage.closest(".card")?.querySelector(".card-head h2");
  const description = stage.closest(".card")?.querySelector(".card-head p");
  if (heading) heading.textContent = titles[n] + " — composants réels";
  if (description) description.textContent = "Infographie réaliste centrée sur les éléments utiles à cette séance.";

  const controls = stage.closest(".card-body")?.querySelector(".demo-controls");
  if (controls) controls.remove();
  const status = document.getElementById("demoStatus");
  if (status) {
    status.className = "realSessionNote";
    status.textContent = notes[n];
  }
})();
