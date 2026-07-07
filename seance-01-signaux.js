/* Intègre le visuel premium spécifique à la séance 1. */
"use strict";

(() => {
  const stage = document.getElementById("twinStage");
  if (!stage) return;

  stage.classList.add("session-one-visual");
  stage.innerHTML = `<img src="images/seance-01-signaux.svg?v=1" width="1280" height="720" alt="Séance 1 : le capteur d’humidité A0 mesure une valeur analogique variable tandis que la sortie D6 commande un état logique LOW ou HIGH. La pompe, placée à côté du pot, reste arrêtée avec D6 à LOW.">`;

  const heading = stage.closest(".card")?.querySelector(".card-head h2");
  const description = stage.closest(".card")?.querySelector(".card-head p");
  if (heading) heading.textContent = "Observer les signaux — visuel pédagogique";
  if (description) description.textContent = "Comparer la grandeur analogique A0 et la commande logique D6 sans surcharger la séance.";

  const legends = stage.nextElementSibling;
  if (legends?.classList.contains("twin-legend")) {
    legends.innerHTML = `
      <article><strong>A0 — signal analogique</strong>Le capteur d’humidité peut produire une multitude de valeurs. L’Arduino les acquiert puis les convertit en donnée exploitable.</article>
      <article><strong>D6 — signal logique</strong>LOW = 0 maintient le relais ouvert et la pompe arrêtée. HIGH = 1 autorise la commande du relais.</article>`;
  }

  const controls = stage.closest(".card-body")?.querySelector(".demo-controls");
  const status = document.getElementById("demoStatus");
  if (controls) controls.remove();
  if (status) {
    status.className = "session-one-note";
    status.textContent = "État sûr de la séance : D6 = LOW, relais ouvert et pompe arrêtée. Aucun arrosage n’est déclenché pendant l’observation des signaux.";
  }
})();
