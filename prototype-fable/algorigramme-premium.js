/* TechnoQuest — algorigrammes ultra premium.
   Rendu SVG responsive des huit algorigrammes, fidèles aux programmes C++ de
   référence (mission-mode/mission-data.js). Chaque forme conserve la couleur
   de l'action correspondante dans l'algorithme coloré de la séance.
   Formes normalisées : ovale (début), rectangle (traitement), parallélogramme
   (entrée/sortie), losange (décision réelle uniquement), flèche continue,
   flèche courbe de retour de boucle. Aucun losange n'est inventé : la
   répétition de loop() est une flèche de retour, jamais une décision.
   Les branches OUI rejoignent la colonne principale par des couloirs à droite,
   vers le nœud désigné par mergeToId dans la spécification. */
"use strict";
(() => {
  /* ---------- Géométrie ---------- */
  const W = 880;
  const SPINE_X = 292;
  const BRANCH_X = 672;
  const NODE_W = 344, NODE_H = 64, NODE_H_CODE = 78;
  const BRANCH_W = 292;
  const DIAMOND_W = 336, DIAMOND_H = 118;
  const GAP = 42;

  const esc = value => String(value).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const shade = (hex, factor) => {
    const n = parseInt(hex.slice(1), 16);
    const channel = shift => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
    return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, "0")}`;
  };

  const defs = colors => `
    <defs>
      <filter id="agShadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity="0.38"/>
      </filter>
      <marker id="agArrow" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
        <path d="M0,0.6 L9.4,5 L0,9.4 Z" fill="#9fc3d2"/>
      </marker>
      <marker id="agArrowLoop" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M0,0.6 L9.4,5 L0,9.4 Z" fill="#f472b6"/>
      </marker>
      ${[...new Set(colors)].map(color => `
      <linearGradient id="agG${color.slice(1)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${shade(color, 0.34)}"/>
        <stop offset="1" stop-color="${shade(color, 0.16)}"/>
      </linearGradient>`).join("")}
    </defs>`;

  const lines = (text, x, y, options = {}) => {
    const parts = String(text).split("\n");
    const lineHeight = options.lineHeight || 15;
    const startY = y - ((parts.length - 1) * lineHeight) / 2;
    return parts.map((part, i) =>
      `<text x="${x}" y="${startY + i * lineHeight}" text-anchor="middle" dominant-baseline="middle"
        font-size="${options.size || 13}" font-weight="${options.weight || 800}"
        ${options.mono ? 'font-family="Consolas, Courier New, monospace"' : 'font-family="Inter, system-ui, sans-serif"'}
        fill="${options.fill || "#f4fbff"}"${options.spacing ? ` letter-spacing="${options.spacing}"` : ""}>${esc(part)}</text>`).join("");
  };

  const shapes = {
    oval: (x, y, w, h, color) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}"
        fill="url(#agG${color.slice(1)})" stroke="${color}" stroke-width="2.4" filter="url(#agShadow)"/>`,
    rect: (x, y, w, h, color) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12"
        fill="url(#agG${color.slice(1)})" stroke="${color}" stroke-width="2.4" filter="url(#agShadow)"/>`,
    io: (x, y, w, h, color) => {
      const skew = 16;
      return `<path d="M${x - w / 2 + skew},${y - h / 2} H${x + w / 2} L${x + w / 2 - skew},${y + h / 2} H${x - w / 2} Z"
        fill="url(#agG${color.slice(1)})" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" filter="url(#agShadow)"/>`;
    },
    diamond: (x, y, w, h, color) => `<path d="M${x},${y - h / 2} L${x + w / 2},${y} L${x},${y + h / 2} L${x - w / 2},${y} Z"
        fill="url(#agG${color.slice(1)})" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" filter="url(#agShadow)"/>`
  };

  const heightOf = node => node.kind === "diamond" ? DIAMOND_H : (node.code ? NODE_H_CODE : NODE_H);

  const nodeSvg = (node, x, width) => {
    const h = heightOf(node);
    const parts = [];
    if (node.kind === "diamond") {
      parts.push(shapes.diamond(x, node.y, DIAMOND_W, DIAMOND_H, node.color));
      parts.push(lines(node.action, x, node.y - 26, { size: 10.6, fill: node.color, spacing: ".08em" }));
      parts.push(lines(node.label, x, node.y + (node.code ? -4 : 4), { size: 12.4 }));
      if (node.code) parts.push(lines(node.code, x, node.y + 22, { size: 10.6, weight: 600, mono: true, fill: "#cde8f2" }));
    } else {
      parts.push(shapes[node.kind](x, node.y, width, h, node.color));
      parts.push(lines(node.action, x, node.y - h / 2 + 15, { size: 10.4, fill: node.color, spacing: ".1em" }));
      parts.push(lines(node.label, x, node.code ? node.y + 2 : node.y + 8, { size: 12.6 }));
      if (node.code) parts.push(lines(node.code, x, node.y + h / 2 - 13, { size: 10.4, weight: 600, mono: true, fill: "#b7d6e2" }));
    }
    node.h = h;
    return parts.join("");
  };

  /* Pastille de libellé multi-lignes (OUI · SOL SEC → deux lignes). */
  const labelChip = (text, x, y, color) => {
    const parts = String(text).split(" · ");
    const widest = Math.max(...parts.map(p => p.length));
    const width = widest * 7 + 18;
    const height = parts.length * 15 + 10;
    return `<g><rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" rx="${Math.min(12, height / 2)}"
      fill="#07131f" stroke="${color}" stroke-width="1.4"/>
      ${lines(parts.join("\n"), x, y + 0.5, { size: 10.4, fill: color, spacing: ".05em", lineHeight: 14 })}</g>`;
  };

  const arrow = (path, options = {}) =>
    `<path d="${path}" fill="none" stroke="${options.color || "#9fc3d2"}" stroke-width="2.6"
      stroke-linejoin="round" marker-end="url(#${options.loop ? "agArrowLoop" : "agArrow"})"/>`;

  /* ---------- Rendu ---------- */
  function render(spec) {
    const colors = ["#f472b6", "#94a3b8", spec.startColor || "#4ade80"];
    const collect = node => { colors.push(node.color); (node.branch || []).forEach(collect); };
    spec.setup.forEach(collect); spec.loop.forEach(collect);

    const under = [];   /* zones et cadres (dessous) */
    const flows = [];   /* flèches (milieu) */
    const body = [];    /* formes et textes (dessus) */

    /* --- Position du départ et de setup() --- */
    let y = 66;
    const startY = y;
    y += 28 + GAP;
    const setupTop = y;
    y += 40;
    spec.setup.forEach(node => {
      node.h = heightOf(node);
      node.y = y + node.h / 2;
      y = node.y + node.h / 2 + GAP;
    });
    const setupBottom = y - GAP / 2 + 2;
    y = setupBottom + GAP + 10;

    /* --- Position des nœuds de loop(), avec dégagement des branches --- */
    const loopTop = y;
    y += 46;
    spec.loop.forEach(node => {
      node.h = heightOf(node);
      /* Espace supplémentaire au-dessus si la pastille NON précédente est haute. */
      node.y = y + node.h / 2;
      let clearance = node.y + node.h / 2 + (node.kind === "diamond" && String(node.continueLabel || "NON").split(" · ").length > 1 ? (String(node.continueLabel).split(" · ").length - 1) * 16 : 0);
      if (node.branch) {
        let branchY = node.y - heightOf(node) / 2;
        node.branch.forEach((child, i) => {
          child.y = branchY + heightOf(child) / 2 + (i === 0 ? 0 : 14);
          branchY = child.y + heightOf(child) / 2;
          child.h = heightOf(child);
        });
        node.branchBottom = branchY;
        clearance = Math.max(clearance, branchY);
      }
      y = clearance + GAP;
    });
    const lastNode = spec.loop[spec.loop.length - 1];
    const loopBottom = Math.max(lastNode.y + lastNode.h / 2, ...spec.loop.map(n => n.branchBottom || 0)) + 30;

    /* --- Formes --- */
    body.push(shapes.oval(SPINE_X, startY, 210, 56, spec.startColor || "#4ade80"));
    body.push(lines("DÉBUT", SPINE_X, startY + 1, { size: 15, fill: "#eafff3", spacing: ".2em" }));
    spec.setup.forEach(node => body.push(nodeSvg(node, SPINE_X, NODE_W)));
    spec.loop.forEach(node => {
      body.push(nodeSvg(node, SPINE_X, NODE_W));
      (node.branch || []).forEach(child => body.push(nodeSvg(child, BRANCH_X, BRANCH_W)));
    });

    /* --- Zones setup() et loop() --- */
    under.push(`<rect x="${SPINE_X - NODE_W / 2 - 30}" y="${setupTop}" width="${NODE_W + 60}" height="${setupBottom - setupTop}" rx="18"
      fill="rgba(56,189,248,0.05)" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="7 6"/>`);
    body.push(`<g><rect x="${SPINE_X - 128}" y="${setupTop - 14}" width="256" height="28" rx="14" fill="#062334" stroke="#38bdf8" stroke-width="1.6"/>
      ${lines("UNE SEULE FOIS — setup()", SPINE_X, setupTop + 1, { size: 11.4, fill: "#7dd3fc", spacing: ".08em" })}</g>`);
    under.push(`<rect x="92" y="${loopTop}" width="${W - 92 - 20}" height="${loopBottom - loopTop}" rx="20"
      fill="rgba(244,114,182,0.045)" stroke="#f472b6" stroke-width="1.8" stroke-dasharray="9 7"/>`);
    body.push(`<g><rect x="${SPINE_X - 122}" y="${loopTop - 14}" width="244" height="28" rx="14" fill="#2b0f1e" stroke="#f472b6" stroke-width="1.6"/>
      ${lines("EN CONTINU — loop()", SPINE_X, loopTop + 1, { size: 11.4, fill: "#fbcfe8", spacing: ".08em" })}</g>`);

    /* --- Flèches de la colonne principale --- */
    const firstLoopNode = spec.loop[0];
    flows.push(arrow(`M${SPINE_X},${startY + 28} L${SPINE_X},${spec.setup[0].y - spec.setup[0].h / 2 - 5}`));
    spec.setup.forEach((node, i) => {
      const next = spec.setup[i + 1] || firstLoopNode;
      flows.push(arrow(`M${SPINE_X},${node.y + node.h / 2} L${SPINE_X},${next.y - next.h / 2 - 5}`));
    });
    spec.loop.forEach((node, i) => {
      const next = spec.loop[i + 1];
      if (!next) return;
      flows.push(arrow(`M${SPINE_X},${node.y + node.h / 2} L${SPINE_X},${next.y - next.h / 2 - 5}`));
      if (node.kind === "diamond") {
        const midY = (node.y + node.h / 2 + next.y - next.h / 2) / 2;
        body.push(labelChip(node.continueLabel || "NON", SPINE_X + (String(node.continueLabel || "NON").length > 14 ? 0 : 108), midY, "#fda4af"));
      }
    });

    /* --- Branches OUI et couloirs de fusion --- */
    const byId = {};
    spec.loop.forEach(node => { if (node.id) byId[node.id] = node; });
    let lane = 0;
    spec.loop.forEach(node => {
      if (!node.branch) return;
      const edgeX = SPINE_X + DIAMOND_W / 2;
      flows.push(arrow(`M${edgeX},${node.y} L${BRANCH_X - BRANCH_W / 2 - 7},${node.y}`));
      /* Pastille OUI sous la flèche horizontale : l'espace y est libre
         (le losange s'amincit vers le bas, la branche est plus haute). */
      body.push(labelChip(node.branchLabel || "OUI", (edgeX + BRANCH_X - BRANCH_W / 2) / 2, node.y + 28, "#86efac"));
      node.branch.forEach((child, i) => {
        const next = node.branch[i + 1];
        if (next) flows.push(arrow(`M${BRANCH_X},${child.y + child.h / 2} L${BRANCH_X},${next.y - next.h / 2 - 5}`));
      });
      /* Couloir de fusion vers le nœud cible. */
      const target = byId[node.mergeToId];
      if (target) {
        lane += 1;
        const laneX = W - 26 - (lane - 1) * 16;
        const from = node.branch[node.branch.length - 1];
        const fromY = from.y + from.h / 2;
        let endX, endY;
        if (target.kind === "diamond") {
          endY = target.y - 20 - (lane - 1) * 12;
          endX = SPINE_X + (DIAMOND_W / 2) * (1 - Math.abs(endY - target.y) / (DIAMOND_H / 2)) + 8;
        } else {
          /* Arrivées décalées pour que plusieurs couloirs restent lisibles. */
          endY = target.y - 8 + (lane - 1) * 14;
          endX = SPINE_X + NODE_W / 2 + 8;
        }
        flows.push(arrow(`M${BRANCH_X},${fromY} L${BRANCH_X},${fromY + 16} L${laneX},${fromY + 16} L${laneX},${endY} L${endX},${endY}`));
      }
    });

    /* --- Flèche courbe de retour de boucle --- */
    const firstY = firstLoopNode.y;
    const lastY = lastNode.y;
    const returnX = 48;
    flows.push(arrow(
      `M${SPINE_X - NODE_W / 2},${lastY} C${returnX + 44},${lastY} ${returnX},${lastY - 44} ${returnX},${(lastY + firstY) / 2}
       C${returnX},${firstY + 44} ${returnX + 44},${firstY} ${SPINE_X - (firstLoopNode.kind === "diamond" ? DIAMOND_W : NODE_W) / 2 - 8},${firstY}`,
      { color: "#f472b6", loop: true }));
    body.push(`<g><rect x="${returnX - 40}" y="${(lastY + firstY) / 2 - 22}" width="88" height="42" rx="12" fill="#2b0f1e" stroke="#f472b6" stroke-width="1.5"/>
      ${lines("↺ RETOUR\nboucle loop()", returnX + 4, (lastY + firstY) / 2 - 1, { size: 9.8, fill: "#fbcfe8" })}</g>`);

    const height = loopBottom + 40;
    return `<svg viewBox="0 0 ${W} ${height}" role="img" preserveAspectRatio="xMidYMin meet"
      aria-label="${esc(spec.aria)}" class="ag-svg">
      ${defs(colors)}
      ${under.join("")}
      ${flows.join("")}
      ${body.join("")}
    </svg>`;
  }

  window.TechnoQuestAlgorigramme = {
    render(sessionId) {
      const spec = window.TechnoQuestAlgorigrammeData?.[sessionId];
      if (!spec) return "";
      return render(JSON.parse(JSON.stringify(spec)));
    },
    spec(sessionId) {
      return window.TechnoQuestAlgorigrammeData?.[sessionId] || null;
    }
  };
})();
