/* Hero et progression globale du hub TechnoQuest. Aucun service externe. */
"use strict";

(() => {
  const hub = document.querySelector(".hub");
  const hero = document.querySelector(".hub-hero");
  const cards = [...document.querySelectorAll(".hub-card")];
  if (!hub || !hero || !cards.length || document.getElementById("questTimeline")) return;

  const titles = [
    "Observer les signaux",
    "Calibrer un seuil",
    "Analyser les chaînes",
    "Protéger la pompe",
    "Économiser l’eau",
    "Décider avec trois données",
    "Améliorer la durabilité",
    "Défi ingénieur"
  ];

  let state = {};
  try {
    state = JSON.parse(localStorage.getItem("technoquest-premium-v1") || "{}");
  } catch (error) {
    console.warn("TechnoQuest : progression locale illisible", error);
  }

  const sessionState = state.sessions || {};
  const values = titles.map((title, index) => {
    const data = sessionState[index + 1] || {};
    const scores = Array.isArray(data.scores) ? data.scores : [];
    const score = data.correction
      ? 0
      : Math.min(20, scores.reduce((sum, value) => sum + (Number(value) || 0), 0));
    return {
      id: index + 1,
      title,
      score,
      done: Boolean(data.saved),
      correction: Boolean(data.correction)
    };
  });

  const completed = values.filter(item => item.done).length;
  const points = values.reduce((sum, item) => sum + item.score, 0);
  const average = points / 8;
  const next = values.find(item => !item.done) || values[7];
  const sessionImage = index => `images/seance-${String(index + 1).padStart(2, "0")}-reelle.png?v=1`;

  hero.innerHTML = `
    <div class="hub-hero-copy">
      <p class="eyebrow">TechnoQuest · Technologie · Cycle 4</p>
      <h1>Sauve le jardin&nbsp;!</h1>
      <p class="hero-lead">Huit séances pour observer, programmer, sécuriser et améliorer un système d’arrosage connecté. Chaque séance est autonome et évaluée sur 20.</p>
      <div class="hero-metrics" aria-label="Progression globale">
        <article class="hero-metric"><strong>${completed} / 8</strong><span>Séances enregistrées</span></article>
        <article class="hero-metric"><strong>${points.toFixed(points % 1 ? 1 : 0)} / 160</strong><span>Points obtenus</span></article>
        <article class="hero-metric"><strong>${average.toFixed(average % 1 ? 1 : 0)} / 20</strong><span>Moyenne du parcours</span></article>
      </div>
      <div class="hero-actions">
        <a class="btn primary" href="seance-${next.id}.html">▶ Reprendre à la séance ${next.id}</a>
        <a class="btn" href="index.html">Voir la présentation générale</a>
      </div>
    </div>
    <figure class="hub-hero-visual">
      <img src="images/accueil-technoquest.png?v=1" width="1536" height="1024" alt="Planche TechnoQuest du jardin connecté présentant les huit séances avec les composants Arduino, capteurs, relais, pompe et logique de sécurité.">
    </figure>`;

  const timeline = document.createElement("section");
  timeline.id = "questTimeline";
  timeline.className = "quest-timeline";
  timeline.setAttribute("aria-labelledby", "questTimelineTitle");
  timeline.innerHTML = `
    <div class="quest-timeline-head">
      <h2 id="questTimelineTitle">Chemin des huit séances</h2>
      <span>Les séances restent accessibles librement.</span>
    </div>
    <nav class="quest-line" aria-label="Progression dans le parcours">
      ${values.map(item => {
        const classes = ["quest-step"];
        if (item.done) classes.push("done");
        if (item.id === next.id) classes.push("current");
        const status = item.done ? `Terminée · ${item.score}/20` : item.id === next.id ? "À reprendre" : "Disponible";
        return `<a class="${classes.join(" ")}" href="seance-${item.id}.html" aria-label="Séance ${item.id}, ${item.title}, ${status}"><strong>${item.done ? "✓" : item.id}</strong><small>${status}</small></a>`;
      }).join("")}
    </nav>`;
  hero.insertAdjacentElement("afterend", timeline);

  cards.forEach((card, index) => {
    const item = values[index];
    if (!item) return;
    if (item.done) card.classList.add("is-done");
    if (item.id === next.id) card.classList.add("is-current");

    const media = document.createElement("figure");
    media.className = "hub-card-media";
    media.style.setProperty("--image-zoom", index === 0 ? "1" : "1.75");
    const thumbnail = document.createElement("img");
    thumbnail.className = "hub-card-image";
    thumbnail.src = sessionImage(index);
    thumbnail.width = 1280;
    thumbnail.height = 720;
    thumbnail.loading = "lazy";
    thumbnail.alt = "";
    media.appendChild(thumbnail);
    const number = card.querySelector(".hub-number");
    if (number) number.insertAdjacentElement("afterend", media);
    else card.prepend(media);

    const statusText = item.done
      ? item.correction
        ? "Formative · correction consultée"
        : "Séance enregistrée"
      : item.id === next.id
        ? "À reprendre"
        : "Non commencée";

    const status = document.createElement("div");
    status.className = "hub-card-status";
    status.innerHTML = `<span>${statusText}</span><small>${item.score.toFixed(item.score % 1 ? 1 : 0)} / 20</small>`;

    const track = document.createElement("div");
    track.className = "hub-score-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "20");
    track.setAttribute("aria-valuenow", String(item.score));
    track.setAttribute("aria-label", `Note de la séance ${item.id}`);
    track.innerHTML = `<div class="hub-score-fill" style="--score:${Math.max(0, Math.min(100, item.score * 5))}%"></div>`;

    const footer = card.querySelector("footer");
    if (footer) {
      footer.insertAdjacentElement("beforebegin", status);
      footer.insertAdjacentElement("beforebegin", track);
    } else {
      card.append(status, track);
    }
  });
})();
