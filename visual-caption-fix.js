/* Transforme certaines légendes en ressources explicatives et corrige le visuel d'introduction. */
"use strict";

(() => {
  const oldText = "Relier la valeur analogique à une comparaison, puis à la commande de la pompe.";
  const newText = "De la mesure à l’action : la valeur mesurée par le capteur est comparée à un seuil. Cette comparaison conduit à une décision logique, puis à la commande de la pompe. Ici, 28 % est inférieur à 35 % : la condition est vraie et la pompe est activée.";

  const replaceCaption = root => {
    root.querySelectorAll?.("figcaption, #visualLightboxContent p").forEach(element => {
      if (element.textContent.includes(oldText)) {
        const strong = element.querySelector("strong");
        if (strong) element.innerHTML = `<strong>${strong.textContent}</strong> — ${newText}`;
        else element.textContent = newText;
      }
    });
  };

  const improveWaterBalanceCard = root => {
    const cards = [...(root.querySelectorAll?.(".trigger-image-card") || [])];
    const card = cards.find(item => item.textContent.includes("Un besoin réel") || item.textContent.includes("Constater le problème"));
    if (!card || card.dataset.waterBalanceFixed === "true") return;

    card.dataset.waterBalanceFixed = "true";
    card.classList.add("water-balance-card");

    const svg = card.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", "0 0 420 180");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Comparaison entre une plante qui manque d'eau et une plante trop arrosée");
      svg.innerHTML = `
        <title>Ni trop peu, ni trop d’eau</title>
        <desc>À gauche, un sol trop sec fait flétrir la plante. À droite, un sol gorgé d’eau prive les racines d’oxygène. Dans les deux cas, la plante peut mourir.</desc>
        <defs>
          <linearGradient id="drySkyIntro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff1c2"/>
            <stop offset="1" stop-color="#fff9e8"/>
          </linearGradient>
          <linearGradient id="wetSkyIntro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#d8f3ff"/>
            <stop offset="1" stop-color="#effaff"/>
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="210" height="180" fill="url(#drySkyIntro)"/>
        <rect x="210" y="0" width="210" height="180" fill="url(#wetSkyIntro)"/>
        <line x1="210" y1="12" x2="210" y2="168" stroke="#14352d" stroke-width="2" opacity=".32"/>

        <!-- Manque d'eau -->
        <circle cx="171" cy="29" r="20" fill="#ffd166"/>
        <rect x="0" y="114" width="210" height="66" fill="#75492e"/>
        <path d="M26 145 l19 -11 17 12 22 -15 25 14 18 -12 20 13" fill="none" stroke="#d59a67" stroke-width="4"/>
        <path d="M78 124 C80 95 87 71 98 48" stroke="#438b54" stroke-width="8" fill="none"/>
        <path d="M94 74 C68 61 55 69 55 87 C74 91 86 85 94 74Z" fill="#5aa268"/>
        <g fill="#d94767">
          <circle cx="99" cy="42" r="13"/>
          <circle cx="89" cy="51" r="10"/>
          <circle cx="110" cy="52" r="10"/>
        </g>
        <text x="18" y="25" fill="#7c2d12" font-size="17" font-weight="900">Trop sec</text>
        <text x="18" y="47" fill="#63341f" font-size="12" font-weight="700">La plante se flétrit.</text>
        <text x="18" y="65" fill="#63341f" font-size="12">Les racines manquent d’eau.</text>

        <!-- Excès d'eau -->
        <rect x="210" y="114" width="210" height="66" fill="#5b493c"/>
        <rect x="210" y="126" width="210" height="54" fill="#54c7e8" opacity=".72"/>
        <path d="M210 127 Q235 120 260 127 T310 127 T360 127 T420 127" fill="none" stroke="#dff9ff" stroke-width="4"/>
        <path d="M313 124 C312 94 306 70 296 48" stroke="#6c8d54" stroke-width="8" fill="none"/>
        <path d="M302 76 C327 63 340 72 339 89 C322 91 309 86 302 76Z" fill="#8ca66a"/>
        <g fill="#b56f79">
          <circle cx="295" cy="43" r="13"/>
          <circle cx="284" cy="52" r="10"/>
          <circle cx="306" cy="53" r="10"/>
        </g>
        <path d="M286 137 C300 145 308 151 313 163 M320 137 C309 145 304 153 302 166" fill="none" stroke="#6b4a35" stroke-width="4"/>
        <circle cx="239" cy="145" r="4" fill="#e7fbff" opacity=".75"/>
        <circle cx="365" cy="155" r="5" fill="#e7fbff" opacity=".72"/>
        <text x="228" y="25" fill="#075985" font-size="17" font-weight="900">Trop arrosé</text>
        <text x="228" y="47" fill="#164e63" font-size="12" font-weight="700">Les racines s’asphyxient.</text>
        <text x="228" y="65" fill="#164e63" font-size="12">Elles peuvent pourrir.</text>

        <rect x="82" y="150" width="256" height="23" rx="11.5" fill="#0d2b23" stroke="#ffffff" stroke-width="1.5"/>
        <text x="210" y="166" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="900">Dans les deux cas, la plante peut mourir.</text>
      `;
    }

    const figcaption = card.querySelector("figcaption");
    if (figcaption) {
      figcaption.innerHTML = `<strong>1. Trouver le juste arrosage</strong>Une plante peut mourir si elle manque d’eau, mais également si elle est trop arrosée : l’excès d’eau chasse l’air du sol, prive les racines d’oxygène et peut favoriser leur pourrissement. Le système doit donc arroser uniquement lorsque c’est nécessaire.`;
    }
  };

  const improveFilmCaption = root => {
    const caption = root.querySelector?.("#triggerFilmCaption");
    if (!caption || caption.dataset.waterBalanceFixed === "true") return;
    const update = () => {
      if (caption.textContent.includes("Le sol est sec") || caption.textContent.includes("Observer le besoin")) {
        caption.innerHTML = `<strong>1. Observer le besoin sans trop arroser</strong>Le manque d’eau fait flétrir la plante, mais un excès d’arrosage peut aussi l’endommager ou la tuer en asphyxiant ses racines. Il faut donc apporter la bonne quantité d’eau, au bon moment.`;
        caption.dataset.waterBalanceFixed = "true";
      }
    };
    update();
    new MutationObserver(update).observe(caption, {childList:true, subtree:true});
  };

  const applyAll = root => {
    replaceCaption(root);
    improveWaterBalanceCard(root);
    improveFilmCaption(root);
  };

  applyAll(document);
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) applyAll(node);
    }));
  }).observe(document.body, {childList:true, subtree:true});
})();
