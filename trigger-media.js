/* Ajoute une situation déclenchante visuelle et un mini-film pédagogique original. */
"use strict";

(() => {
  const intro = document.querySelector(".intro-grid");
  if (!intro || document.querySelector(".trigger-media")) return;

  const style = document.createElement("style");
  style.id = "technoquest-trigger-media-styles";
  style.textContent = `
    .trigger-media{max-width:1600px;margin:0 auto 1rem;padding:0 clamp(1rem,5vw,5rem)}
    .trigger-shell{padding:1rem;border:1px solid var(--border);border-radius:20px;background:#0d2b23ee;box-shadow:var(--shadow)}
    .trigger-heading{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:.9rem}
    .trigger-heading h2{margin:.15rem 0 .35rem}.trigger-heading p{margin:0;color:var(--muted);line-height:1.5}
    .trigger-badge{padding:.4rem .7rem;border:1px solid var(--yellow);border-radius:999px;color:#fff3bd;background:#3b3414;font-weight:800;white-space:nowrap}
    .trigger-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,.7fr);gap:1rem}
    .trigger-film{position:relative;overflow:hidden;border:1px solid var(--border);border-radius:17px;background:#08251d}
    .trigger-film svg{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#9eddf3}
    .trigger-film-caption{min-height:74px;padding:.8rem 1rem;background:#061813;color:var(--text);line-height:1.48}
    .trigger-film-caption strong{display:block;color:var(--yellow);margin-bottom:.2rem}
    .trigger-controls{display:flex;gap:.55rem;flex-wrap:wrap;padding:.75rem 1rem 1rem;background:#061813}
    .trigger-controls button{flex:1 1 135px}
    .trigger-progress{display:flex;gap:.45rem;align-items:center;padding:0 1rem .8rem;background:#061813}
    .trigger-dot{width:12px;height:12px;border-radius:50%;border:2px solid #7ca99a;background:transparent}.trigger-dot.active{background:var(--yellow);border-color:var(--yellow)}.trigger-dot.done{background:var(--green);border-color:var(--green)}
    .trigger-gallery{display:grid;gap:.75rem}
    .trigger-image-card{margin:0;overflow:hidden;border:1px solid var(--border);border-radius:14px;background:#061813}
    .trigger-image-card svg{display:block;width:100%;height:auto;aspect-ratio:16/7;background:#eaf8fb}
    .trigger-image-card figcaption{padding:.65rem .75rem;color:var(--muted);line-height:1.4;font-size:.86rem}
    .trigger-image-card strong{display:block;color:var(--text);margin-bottom:.15rem}
    .trigger-questions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin-top:1rem}
    .trigger-question{padding:.8rem;border:1px solid var(--border);border-radius:13px;background:var(--soft);line-height:1.45}
    .trigger-question strong{display:block;color:var(--blue);margin-bottom:.3rem}
    .trigger-resource{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-top:1rem;padding:.8rem;border-left:5px solid var(--blue);border-radius:12px;background:#092832}
    .trigger-resource p{margin:0;color:#d8eef8;line-height:1.5}.trigger-resource a{display:inline-block;padding:.65rem .85rem;border-radius:10px;background:#1f6954;color:#fff;text-decoration:none;font-weight:800}.trigger-resource a:hover,.trigger-resource a:focus{outline:3px solid #ffd166;outline-offset:2px}
    .trigger-note{margin:.7rem 0 0;color:var(--muted);font-size:.78rem;line-height:1.45}
    .film-part{opacity:.16;transition:opacity .35s,filter .35s,transform .35s;transform-box:fill-box;transform-origin:center}.film-part.active{opacity:1;filter:drop-shadow(0 0 7px #fff8);transform:scale(1.03)}
    .film-water{stroke-dasharray:16 11;opacity:0}.trigger-film.watering .film-water{opacity:1;animation:triggerWater .45s linear infinite}.trigger-film.watering .film-pump{animation:triggerPump .18s linear infinite}
    .film-plant{transform-origin:bottom center;transform-box:fill-box;transition:transform .8s,filter .8s}.trigger-film.scene-0 .film-plant{transform:rotate(-8deg) scale(.9);filter:saturate(.55)}.trigger-film.scene-3 .film-plant{transform:translateY(-3px) scale(1.05);filter:saturate(1.25)}
    @keyframes triggerWater{to{stroke-dashoffset:-27}}@keyframes triggerPump{50%{transform:translateX(2px)}}
    @media(max-width:900px){.trigger-grid{grid-template-columns:1fr}.trigger-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}.trigger-image-card svg{aspect-ratio:4/3}}
    @media(max-width:700px){.trigger-gallery,.trigger-questions{grid-template-columns:1fr}.trigger-image-card svg{aspect-ratio:16/7}}
    @media(prefers-reduced-motion:reduce){.trigger-film *{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "trigger-media";
  section.setAttribute("aria-labelledby", "triggerMediaTitle");
  section.innerHTML = `
    <div class="trigger-shell">
      <div class="trigger-heading">
        <div>
          <p class="eyebrow">Observer avant d’expliquer</p>
          <h2 id="triggerMediaTitle">Une plante peut-elle demander de l’eau toute seule&nbsp;?</h2>
          <p>Regarde d’abord le mini-film sans lire le programme. Repère ce qui est mesuré, ce qui décide et ce qui agit.</p>
        </div>
        <span class="trigger-badge">Situation déclenchante · 2 à 4 min</span>
      </div>

      <div class="trigger-grid">
        <article id="triggerFilm" class="trigger-film scene-0" aria-label="Mini-film animé montrant un jardin automatisé">
          <svg viewBox="0 0 800 450" role="img" aria-labelledby="triggerFilmTitle triggerFilmDesc">
            <title id="triggerFilmTitle">Du sol sec à l’arrosage automatique</title>
            <desc id="triggerFilmDesc">Une plante se flétrit, un capteur mesure l’humidité, une carte Arduino compare la valeur à un seuil puis un relais commande une pompe.</desc>
            <defs>
              <linearGradient id="triggerSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd7f1"/><stop offset="1" stop-color="#e8f9fb"/></linearGradient>
              <linearGradient id="triggerSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b4e2f"/><stop offset="1" stop-color="#3f291d"/></linearGradient>
              <linearGradient id="triggerBoard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e9279"/><stop offset="1" stop-color="#0d4f42"/></linearGradient>
              <filter id="triggerShadow"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity=".28"/></filter>
            </defs>
            <rect width="800" height="450" fill="url(#triggerSky)"/>
            <circle cx="705" cy="72" r="43" fill="#ffd166" opacity=".94"/>
            <rect y="330" width="800" height="120" fill="url(#triggerSoil)"/>
            <path d="M0 350 Q80 325 160 350 T320 350 T480 350 T640 350 T800 350" fill="none" stroke="#95613d" stroke-width="12" opacity=".45"/>

            <g class="film-part film-plant" data-step="0" filter="url(#triggerShadow)">
              <path d="M188 338 C190 290 202 244 217 198" fill="none" stroke="#2f7d45" stroke-width="12" stroke-linecap="round"/>
              <path d="M206 262 C170 244 150 254 148 277 C174 283 192 277 206 262Z" fill="#4ea766"/>
              <path d="M212 230 C249 211 274 221 277 247 C249 252 228 246 212 230Z" fill="#3b9358"/>
              <g fill="#d94767" stroke="#8f2440" stroke-width="3"><circle cx="218" cy="185" r="22"/><circle cx="201" cy="198" r="17"/><circle cx="235" cy="201" r="17"/><circle cx="218" cy="207" r="18"/></g>
              <circle cx="218" cy="198" r="8" fill="#ffd166"/>
              <path d="M164 341 l-12 18 M184 342 l-4 20 M204 340 l9 19" stroke="#d5a06e" stroke-width="4"/>
              <text x="96" y="394" fill="#fff7df" font-size="23" font-weight="800">Sol trop sec</text>
            </g>

            <g class="film-part" data-step="1" filter="url(#triggerShadow)">
              <rect x="286" y="254" width="42" height="48" rx="8" fill="#617d86" stroke="#eef7f8" stroke-width="3"/>
              <rect x="294" y="300" width="8" height="63" rx="4" fill="#cdd9dc"/><rect x="312" y="300" width="8" height="63" rx="4" fill="#cdd9dc"/>
              <circle cx="299" cy="268" r="5" fill="#63db8d"/>
              <rect x="262" y="207" width="103" height="35" rx="11" fill="#fff" stroke="#14352d" stroke-width="2"/>
              <text x="313.5" y="230" text-anchor="middle" fill="#14352d" font-size="18" font-weight="900">28 %</text>
              <text x="258" y="390" fill="#fff7df" font-size="22" font-weight="800">Mesurer</text>
            </g>

            <g class="film-part" data-step="2" filter="url(#triggerShadow)">
              <rect x="396" y="164" width="162" height="112" rx="16" fill="url(#triggerBoard)" stroke="#c2e8dd" stroke-width="4"/>
              <rect x="412" y="181" width="42" height="28" rx="5" fill="#dce7ea"/>
              <rect x="469" y="190" width="48" height="43" rx="6" fill="#1c2b30"/>
              <circle cx="536" cy="185" r="7" fill="#63db8d"/>
              <text x="477" y="254" text-anchor="middle" fill="#fff" font-size="18" font-weight="900">Arduino</text>
              <rect x="405" y="298" width="145" height="43" rx="12" fill="#fff" stroke="#14352d" stroke-width="2"/>
              <text x="477.5" y="316" text-anchor="middle" fill="#14352d" font-size="15" font-weight="900">28 &lt; 35</text>
              <text x="477.5" y="334" text-anchor="middle" fill="#31564e" font-size="13" font-weight="700">Décision : arroser</text>
              <text x="421" y="390" fill="#fff7df" font-size="22" font-weight="800">Comparer et décider</text>
            </g>

            <g class="film-part" data-step="3" filter="url(#triggerShadow)">
              <rect x="582" y="212" width="67" height="52" rx="9" fill="#1f6954" stroke="#c4e8df" stroke-width="3"/>
              <rect x="594" y="225" width="28" height="22" rx="4" fill="#263f48"/><circle cx="636" cy="226" r="6" fill="#ffd166"/>
              <text x="615.5" y="286" text-anchor="middle" fill="#14352d" font-size="16" font-weight="900">Relais</text>
              <g class="film-pump"><rect x="656" y="274" width="74" height="48" rx="20" fill="#c7d4d8" stroke="#697c84" stroke-width="4"/><circle cx="680" cy="298" r="14" fill="#e8eff1" stroke="#70838b" stroke-width="5"/></g>
              <rect x="706" y="151" width="65" height="125" rx="12" fill="#d8eff6" stroke="#507786" stroke-width="4"/><rect x="713" y="193" width="51" height="76" rx="7" fill="#4fc3ea" opacity=".8"/>
              <path d="M713 298 H730 V335 H246" fill="none" stroke="#b9cbd1" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
              <path class="film-water" d="M713 298 H730 V335 H246" fill="none" stroke="#49c7ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M259 325 l-14 10 14 10Z M514 325 l-14 10 14 10Z M703 288 l-10 10 10 10Z" fill="#49c7ff"/>
              <text x="590" y="390" fill="#fff7df" font-size="22" font-weight="800">Commander et agir</text>
            </g>

            <path d="M328 278 C350 261 373 245 396 228" fill="none" stroke="#6fd3ff" stroke-width="5" stroke-linecap="round"/>
            <path d="M558 221 C572 222 577 228 582 237" fill="none" stroke="#ff9f68" stroke-width="5" stroke-linecap="round"/>
          </svg>
          <div id="triggerFilmCaption" class="trigger-film-caption" aria-live="polite"></div>
          <div class="trigger-progress" aria-label="Progression du mini-film">
            <span class="trigger-dot active"></span><span class="trigger-dot"></span><span class="trigger-dot"></span><span class="trigger-dot"></span>
          </div>
          <div class="trigger-controls">
            <button id="triggerPlay" class="primary" type="button">▶ Lire le mini-film</button>
            <button id="triggerNext" type="button">Étape suivante</button>
            <button id="triggerReplay" type="button">↻ Recommencer</button>
          </div>
        </article>

        <div class="trigger-gallery" aria-label="Trois images de compréhension">
          <figure class="trigger-image-card">
            <svg viewBox="0 0 420 180" role="img" aria-label="Plante flétrie dans un sol sec">
              <rect width="420" height="180" fill="#eef9fb"/><circle cx="362" cy="38" r="25" fill="#ffd166"/><rect y="118" width="420" height="62" fill="#75492e"/>
              <path d="M93 125 C95 92 104 68 115 47" stroke="#438b54" stroke-width="8" fill="none"/><path d="M111 72 C83 59 70 68 70 85 C90 89 102 83 111 72Z" fill="#5aa268"/><g fill="#d94767"><circle cx="116" cy="39" r="14"/><circle cx="105" cy="48" r="11"/><circle cx="128" cy="49" r="11"/></g><path d="M44 142 l18 -9 15 9 17 -10 18 10" fill="none" stroke="#c18b62" stroke-width="4"/>
              <text x="170" y="64" fill="#14352d" font-size="22" font-weight="900">Un besoin réel</text><text x="170" y="92" fill="#31564e" font-size="16">Le sol se dessèche.</text><text x="170" y="115" fill="#31564e" font-size="16">L’arrosage manuel peut être oublié.</text>
            </svg>
            <figcaption><strong>1. Constater le problème</strong>La plante a besoin d’eau, mais arroser au hasard peut aussi gaspiller la ressource.</figcaption>
          </figure>
          <figure class="trigger-image-card">
            <svg viewBox="0 0 420 180" role="img" aria-label="Capteur, Arduino, relais et pompe">
              <rect width="420" height="180" fill="#eef9fb"/>
              <rect x="24" y="63" width="55" height="45" rx="8" fill="#607d86"/><rect x="34" y="105" width="8" height="50" rx="4" fill="#aebdc2"/><rect x="59" y="105" width="8" height="50" rx="4" fill="#aebdc2"/><text x="51" y="45" text-anchor="middle" fill="#14352d" font-size="15" font-weight="800">Capteur</text>
              <path d="M80 85 H132" stroke="#6fd3ff" stroke-width="5"/><rect x="132" y="43" width="105" height="85" rx="12" fill="#247d68"/><text x="184.5" y="90" text-anchor="middle" fill="#fff" font-size="17" font-weight="900">Arduino</text>
              <path d="M237 85 H276" stroke="#ff9f68" stroke-width="5"/><rect x="276" y="60" width="56" height="45" rx="8" fill="#1f6954"/><text x="304" y="126" text-anchor="middle" fill="#14352d" font-size="14" font-weight="800">Relais</text>
              <path d="M332 85 H353" stroke="#ff9f68" stroke-width="5"/><rect x="353" y="66" width="52" height="38" rx="17" fill="#c8d5d9" stroke="#71858d" stroke-width="3"/><text x="379" y="126" text-anchor="middle" fill="#14352d" font-size="14" font-weight="800">Pompe</text>
            </svg>
            <figcaption><strong>2. Identifier les fonctions</strong>Le capteur acquiert, la carte traite, le relais distribue l’énergie et la pompe agit.</figcaption>
          </figure>
          <figure class="trigger-image-card">
            <svg viewBox="0 0 420 180" role="img" aria-label="Chronologie mesurer comparer décider agir">
              <rect width="420" height="180" fill="#eef9fb"/>
              <g font-family="Verdana" font-weight="900" font-size="14" text-anchor="middle"><rect x="14" y="62" width="82" height="55" rx="12" fill="#1d536f"/><text x="55" y="94" fill="#fff">MESURER</text><path d="M96 89 H118" stroke="#d29a22" stroke-width="5"/><rect x="118" y="62" width="82" height="55" rx="12" fill="#5b3b78"/><text x="159" y="94" fill="#fff">COMPARER</text><path d="M200 89 H222" stroke="#d29a22" stroke-width="5"/><rect x="222" y="62" width="82" height="55" rx="12" fill="#7a5b11"/><text x="263" y="94" fill="#fff">DÉCIDER</text><path d="M304 89 H326" stroke="#d29a22" stroke-width="5"/><rect x="326" y="62" width="80" height="55" rx="12" fill="#296c44"/><text x="366" y="94" fill="#fff">AGIR</text></g>
            </svg>
            <figcaption><strong>3. Comprendre la chronologie</strong>Une mesure seule ne suffit pas : le programme la compare à un seuil avant de commander la pompe.</figcaption>
          </figure>
        </div>
      </div>

      <div class="trigger-questions">
        <article class="trigger-question"><strong>Que mesure le système&nbsp;?</strong>L’humidité du sol, mais aussi le niveau du réservoir et éventuellement la luminosité.</article>
        <article class="trigger-question"><strong>Qui prend la décision&nbsp;?</strong>Le programme exécuté par la carte Arduino compare les mesures aux seuils.</article>
        <article class="trigger-question"><strong>Quel élément agit&nbsp;?</strong>La pompe déplace l’eau lorsque le relais autorise son alimentation.</article>
      </div>

      <div class="trigger-resource">
        <p><strong>Exemple réel complémentaire :</strong> le projet Arduino Project Hub utilise une UNO R3, un capteur d’humidité, un relais et une pompe. Il montre également une surveillance du niveau du réservoir.</p>
        <a href="https://projecthub.arduino.cc/lc_lab/automatic-watering-system-for-my-plants-e4c4b9" target="_blank" rel="noopener noreferrer">Voir le projet réel ↗</a>
      </div>
      <p class="trigger-note">Les illustrations et l’animation ci-dessus sont originales et intégrées à TechnoQuest. Le lien externe est proposé comme exemple documentaire ; ses photographies ne sont pas recopiées dans la ressource.</p>
    </div>`;
  intro.insertAdjacentElement("afterend", section);

  const film = document.getElementById("triggerFilm");
  const caption = document.getElementById("triggerFilmCaption");
  const play = document.getElementById("triggerPlay");
  const next = document.getElementById("triggerNext");
  const replay = document.getElementById("triggerReplay");
  const dots = [...section.querySelectorAll(".trigger-dot")];
  const parts = [...section.querySelectorAll(".film-part")];
  const captions = [
    ["1. Observer le besoin", "Le sol est sec et la plante commence à se flétrir. Le problème est réel, mais arroser en permanence gaspillerait de l’eau."],
    ["2. Acquérir une mesure", "Le capteur mesure l’humidité du sol. La valeur obtenue est mémorisée afin d’être traitée par le programme."],
    ["3. Comparer et décider", "La carte compare 28 % au seuil de 35 %. Comme la mesure est inférieure au seuil, la condition d’arrosage est vraie."],
    ["4. Commander et agir", "La sortie D6 commande le relais. Le relais autorise l’énergie de la pompe, puis l’eau circule du réservoir vers la plante."]
  ];
  let step = 0;
  let timer = null;

  function renderStep() {
    film.className = `trigger-film scene-${step}${step === 3 ? " watering" : ""}`;
    parts.forEach(part => part.classList.toggle("active", Number(part.dataset.step) === step));
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === step);
      dot.classList.toggle("done", index < step);
    });
    caption.innerHTML = `<strong>${captions[step][0]}</strong>${captions[step][1]}`;
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    play.textContent = "▶ Lire le mini-film";
  }

  function start() {
    if (timer) { stop(); return; }
    play.textContent = "⏸ Mettre en pause";
    timer = window.setInterval(() => {
      if (step >= captions.length - 1) { stop(); return; }
      step += 1;
      renderStep();
    }, 2600);
  }

  play.addEventListener("click", start);
  next.addEventListener("click", () => { stop(); step = (step + 1) % captions.length; renderStep(); });
  replay.addEventListener("click", () => { stop(); step = 0; renderStep(); start(); });
  renderStep();
})();
