"use strict";
(() => {
  const n = Number(document.body.dataset.session || 0);
  const stage = document.getElementById("twinStage");
  if (!stage || n < 1 || n > 8) return;

  const titles = ["","Observer les signaux","Calibrer un seuil","Analyser les chaînes","Protéger la pompe","Économiser l’eau","Décider avec trois données","Améliorer la durabilité","Défi ingénieur"];
  const notes = ["","A0 fournit une mesure analogique variable ; D6 commande le relais avec LOW ou HIGH.","Le seuil se choisit à partir de plusieurs mesures en sol sec et humide, puis se vérifie.","La chaîne d’information et la chaîne d’énergie jouent des rôles différents mais complémentaires.","La pompe reste arrêtée si le niveau du réservoir est insuffisant.","Deux seuils et un arrosage court réduisent les commutations et la consommation d’eau.","La décision combine humidité, luminosité et niveau du réservoir.","La durabilité dépend du choix du capteur, de la calibration, de la maintenance et de la réparabilité.","Le prototype final doit réussir les cas normaux, les cas limites et une défaillance."];
  const x = ((n - 1) / 7) * 100;

  const style = document.createElement("style");
  style.textContent = ".realSessionVisual{width:100%;height:100%;background-image:url(images/seances-reelles-sprite.svg?v=2);background-repeat:no-repeat;background-size:800% 100%;background-position:var(--x) 0;background-color:#fff}.realSessionNote{margin:.75rem 0 0;padding:.75rem .85rem;border:1px solid #31536a;border-left:5px solid var(--session-accent,#22d3ee);border-radius:11px;background:#07131f;color:#dce9ef;line-height:1.45}";
  document.head.appendChild(style);

  stage.innerHTML = "";
  stage.style.background = "#fff";
  const visual = document.createElement("div");
  visual.className = "realSessionVisual";
  visual.style.setProperty("--x", x + "%");
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
