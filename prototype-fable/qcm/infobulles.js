/* TechnoQuest — infobulles accessibles et glossaire des mots techniques.
   Chaque terme marqué devient un <dfn class="terme-technique"> focalisable
   (tabindex="0", aria-describedby, role="tooltip") : l'infobulle s'ouvre au
   survol, au focus clavier et au toucher, et se ferme avec Échap. Le glossaire
   repliable reprend toutes les définitions (consultable au clavier, imprimé). */
"use strict";
(() => {
  /* Les définitions vivent dans glossaire-central.js (source unique). */
  const TERMES = window.TechnoQuestGlossaire || {};
  if (!Object.keys(TERMES).length) {
    try { console.warn("[TechnoQuest] glossaire-central.js doit être chargé avant infobulles.js"); } catch {}
  }

  let idCounter = 0;
  let openTip = null;

  const closeTip = () => {
    if (!openTip) return;
    openTip.hidden = true;
    openTip = null;
  };
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeTip(); });
  document.addEventListener("click", event => {
    if (openTip && !event.target.closest(".terme-technique") && !event.target.closest(".infobulle")) closeTip();
  });

  const attach = dfn => {
    const terme = dfn.dataset.terme;
    const definition = TERMES[terme];
    if (!definition) return;
    idCounter += 1;
    const tipId = `infobulle-${idCounter}`;
    dfn.setAttribute("tabindex", "0");
    dfn.setAttribute("aria-describedby", tipId);
    const tip = document.createElement("span");
    tip.id = tipId;
    tip.className = "infobulle";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    tip.textContent = definition;
    dfn.insertAdjacentElement("afterend", tip);

    const open = () => {
      closeTip();
      const rect = dfn.getBoundingClientRect();
      tip.style.left = "0";
      tip.style.top = "100%";
      tip.hidden = false;
      openTip = tip;
      /* Garde l'infobulle dans l'écran. */
      const tipRect = tip.getBoundingClientRect();
      if (tipRect.right > window.innerWidth - 8) {
        tip.style.left = `${Math.max(-(tipRect.right - window.innerWidth + 12), -rect.left + 8)}px`;
      }
    };
    dfn.style.position = "relative";
    dfn.addEventListener("mouseenter", open);
    dfn.addEventListener("mouseleave", () => { if (openTip === tip) closeTip(); });
    dfn.addEventListener("focus", open);
    dfn.addEventListener("blur", () => { if (openTip === tip) closeTip(); });
    dfn.addEventListener("click", event => {
      event.preventDefault();
      if (tip.hidden) open(); else closeTip();
    });
  };

  /* Marque la PREMIÈRE occurrence de chaque terme dans les nœuds texte d'un
     conteneur portant data-glossaire (jamais dans code, pre, textarea, svg).
     On sélectionne peu de termes par zone : uniquement ceux réellement
     présents, une seule fois, pour ne pas surcharger la lecture. */
  const markTerms = container => {
    const seen = new Set();
    const entries = Object.keys(TERMES).sort((a, b) => b.length - a.length);
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest("code, pre, textarea, script, style, svg, .infobulle, .terme-technique, button, select, option")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      for (const terme of entries) {
        if (seen.has(terme)) continue;
        const escaped = terme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(^|[\\s(«'’])(${escaped})(?=$|[\\s.,;:!?)»'’])`, "iu");
        const match = node.nodeValue.match(re);
        if (!match) continue;
        const index = match.index + match[1].length;
        const before = node.nodeValue.slice(0, index);
        const word = node.nodeValue.slice(index, index + match[2].length);
        const after = node.nodeValue.slice(index + match[2].length);
        const dfn = document.createElement("dfn");
        dfn.className = "terme-technique";
        dfn.dataset.terme = terme;
        dfn.textContent = word;
        const afterNode = document.createTextNode(after);
        node.nodeValue = before;
        node.parentNode.insertBefore(dfn, node.nextSibling);
        node.parentNode.insertBefore(afterNode, dfn.nextSibling);
        attach(dfn);
        seen.add(terme);
        break; /* un seul terme marqué par nœud texte, on continue sur le suivant */
      }
    });
  };

  const api = {
    termes: TERMES,
    /* Marque et active les infobulles dans un conteneur donné. */
    enhance(rootElement) {
      (rootElement || document).querySelectorAll("[data-glossaire]").forEach(markTerms);
      /* Termes déjà marqués à la main dans le HTML. */
      (rootElement || document).querySelectorAll("dfn.terme-technique:not([aria-describedby])").forEach(attach);
    },
    /* Construit le glossaire repliable complet. */
    buildGlossary() {
      const details = document.createElement("details");
      details.id = "glossaireTechnique";
      details.className = "glossaire";
      details.innerHTML = `<summary>Glossaire des mots techniques</summary>
        <dl>${Object.entries(TERMES).map(([terme, definition]) => `<dt>${terme}</dt><dd>${definition}</dd>`).join("")}</dl>`;
      return details;
    }
  };
  window.TechnoQuestInfobulles = api;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => api.enhance(document));
  else api.enhance(document);
})();
