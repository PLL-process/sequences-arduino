/*
 * TechnoQuest — finition visuelle et pédagogique des algorigrammes.
 * - garantit la visibilité des liaisons et des flèches ;
 * - anime le flux pendant la lecture ;
 * - distingue Traitement (rectangle) et Entrée/Sortie (parallélogramme) ;
 * - contient les textes dans les formes ;
 * - ajoute le téléchargement PNG et le plein écran.
 */
"use strict";

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const POLISH_VERSION = "2";
  const GAP = 10;

  const EDGES = {
    1: [["start","setup"],["setup","read"],["read","display"],["display","safe"],["safe","wait"],["wait","loop"],["loop","read","Boucle","loop-right"]],
    2: [["start","setup"],["setup","read"],["read","compare"],["compare","dry","Oui"],["compare","wet","Non"],["dry","safe"],["wet","safe"],["safe","loop"],["loop","read","Retour","loop-right"]],
    3: [["start","read"],["read","compare"],["compare","pump","Oui"],["compare","stop","Non"],["pump","cut"],["cut","wait"],["stop","wait"],["wait","loop"],["loop","read","Retour","loop-right"]],
    4: [["start","read"],["read","water"],["water","alert","Oui"],["water","soil","Non"],["soil","pump","Oui"],["soil","stop","Non"],["pump","wait"],["stop","wait"],["alert","wait"],["wait","loop"],["loop","read","Retour","loop-right"]],
    5: [["start","read"],["read","water"],["water","forceStop","Oui"],["water","low","Non"],["low","startPump","Oui"],["low","high","Non"],["high","stopPump","Oui"],["high","keep","Non"],["forceStop","command"],["startPump","command"],["stopPump","command"],["keep","command"],["command","wait"],["wait","loop"],["loop","read","Retour","loop-right"]],
    6: [["start","read"],["read","display"],["display","decision"],["decision","pump","Oui"],["decision","stop","Non"],["pump","wait"],["stop","wait"],["wait","loop"],["loop","read","Retour","loop-right"]],
    7: [["start","inspect"],["inspect","calibrate"],["calibrate","read"],["read","plausible"],["plausible","repair","Non"],["plausible","water","Oui"],["repair","calibrate","Recalibrer","loop-left"],["water","pump","Oui"],["water","stop","Non"],["pump","loop"],["stop","loop"],["loop","inspect","Nouveau contrôle","loop-right"]],
    8: [["start","read"],["read","coherent"],["coherent","sensorError","Non"],["coherent","water","Oui"],["water","waterError","Oui"],["water","multi","Non"],["multi","pump","Oui"],["multi","stop","Non"],["sensorError","display"],["waterError","display"],["pump","display"],["stop","display"],["display","wait"],["wait","loop"],["loop","read","Retour","loop-right"]]
  };

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function number(value) {
    return Number.parseFloat(value || "0") || 0;
  }

  function nodeBox(node) {
    const shape = node?.querySelector(".algorithm-node-shape");
    if (!shape) return null;
    const local = shape.getBBox();
    const dx = number(node.dataset.layoutDx);
    const dy = number(node.dataset.layoutDy);
    return {
      left: local.x + dx,
      right: local.x + local.width + dx,
      top: local.y + dy,
      bottom: local.y + local.height + dy,
      width: local.width,
      height: local.height,
      centerX: local.x + local.width / 2 + dx,
      centerY: local.y + local.height / 2 + dy,
      localCenterX: local.x + local.width / 2,
      localCenterY: local.y + local.height / 2,
      isDecision: node.classList.contains("algorithm-node--decision")
    };
  }

  function nodeMap(svg) {
    return new Map([...svg.querySelectorAll(".algorithm-node")].map(node => [node.dataset.node, nodeBox(node)]));
  }

  function ensureMarkers(svg) {
    const defs = svg.querySelector("defs") || svg.insertBefore(svgElement("defs"), svg.firstChild);
    const upsert = (id, fill) => {
      defs.querySelector(`#${id}`)?.remove();
      const marker = svgElement("marker", { id, viewBox: "0 0 14 14", refX: "12.2", refY: "7", markerWidth: "13", markerHeight: "13", markerUnits: "userSpaceOnUse", orient: "auto", overflow: "visible" });
      marker.appendChild(svgElement("path", { d: "M 0 1 L 13 7 L 0 13 z", fill, stroke: "#031019", "stroke-width": "1", "paint-order": "stroke fill" }));
      defs.appendChild(marker);
    };
    upsert("algorithmArrowFinal", "#67e8f9");
    upsert("algorithmLoopArrowFinal", "#fde047");
  }

  function ensureConnectorLayer(svg) {
    let layer = svg.querySelector(".algorithm-layout-connectors");
    if (layer) return layer;
    layer = svgElement("g", { class: "algorithm-layout-connectors", "aria-hidden": "true" });
    const firstNode = svg.querySelector(".algorithm-node");
    if (firstNode) svg.insertBefore(layer, firstNode);
    else svg.appendChild(layer);
    return layer;
  }

  function isIoNode(node) {
    if (!node) return false;
    if (node.classList.contains("algorithm-node--sensor") || node.classList.contains("algorithm-node--communication")) return true;
    const label = node.querySelector(".algorithm-node-label")?.textContent?.trim() || "";
    return /^(Lire|Afficher|Écrire|Commander D6\b)/i.test(label);
  }

  function normalizeSymbols(svg) {
    svg.querySelectorAll(".algorithm-node").forEach(node => {
      const shape = node.querySelector(".algorithm-node-shape");
      if (!shape || !isIoNode(node) || shape.tagName.toLowerCase() === "polygon") return;
      const box = shape.getBBox();
      const slant = Math.max(14, Math.min(28, box.width * 0.12));
      const polygon = svgElement("polygon", { class: shape.getAttribute("class") || "algorithm-node-shape", points: `${box.x + slant},${box.y} ${box.x + box.width},${box.y} ${box.x + box.width - slant},${box.y + box.height} ${box.x},${box.y + box.height}` });
      [...shape.attributes].forEach(attribute => {
        if (!["x","y","width","height","rx","class"].includes(attribute.name)) polygon.setAttribute(attribute.name, attribute.value);
      });
      shape.replaceWith(polygon);
      node.classList.add("algorithm-node--io");
      node.dataset.symbolKind = "input-output";
    });
    svg.querySelectorAll(".algorithm-node:not(.algorithm-node--decision):not(.algorithm-node--start):not(.algorithm-node--end):not(.algorithm-node--io)").forEach(node => {
      node.dataset.symbolKind = "treatment";
    });
  }

  function defaultRoute(source, target, label = "", kind = "") {
    const loop = kind.startsWith("loop");
    if (loop) {
      const laneX = kind === "loop-left" ? Math.min(source.left, target.left) - 80 : Math.max(source.right, target.right) + 80;
      const start = { x: source.centerX, y: source.bottom + GAP };
      const end = { x: target.centerX, y: target.top - GAP };
      return `M ${start.x} ${start.y} L ${start.x} ${start.y + 24} L ${laneX} ${start.y + 24} L ${laneX} ${end.y - 24} L ${end.x} ${end.y - 24} L ${end.x} ${end.y}`;
    }
    if (source.isDecision) {
      const yes = String(label).trim().toLowerCase().startsWith("oui");
      const start = { x: yes ? source.left : source.right, y: source.centerY };
      const end = { x: target.centerX, y: target.top - GAP };
      return `M ${start.x} ${start.y} L ${end.x} ${start.y} L ${end.x} ${end.y}`;
    }
    const start = { x: source.centerX, y: source.bottom + GAP };
    const end = { x: target.centerX, y: target.top - GAP };
    if (Math.abs(start.x - end.x) <= 1) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    const middleY = start.y + Math.max(24, (end.y - start.y) / 2);
    return `M ${start.x} ${start.y} L ${start.x} ${middleY} L ${end.x} ${middleY} L ${end.x} ${end.y}`;
  }

  function ensureExpectedEdges(svg, sessionId, boxes) {
    const layer = ensureConnectorLayer(svg);
    (EDGES[sessionId] || []).forEach(([sourceId, targetId, label = "", kind = ""]) => {
      let path = layer.querySelector(`.algorithm-connector[data-source="${CSS.escape(sourceId)}"][data-target="${CSS.escape(targetId)}"]`);
      if (path) return;
      const source = boxes.get(sourceId);
      const target = boxes.get(targetId);
      if (!source || !target) return;
      path = svgElement("path", { class: `algorithm-connector${kind.startsWith("loop") ? " algorithm-loop-connector" : ""}`, d: defaultRoute(source, target, label, kind), "data-source": sourceId, "data-target": targetId, "data-label": label, "data-generated-by-polish": "true", fill: "none" });
      layer.appendChild(path);
      if (label) {
        const text = svgElement("text", { class: `algorithm-branch-label${kind.startsWith("loop") ? " algorithm-loop-label" : ""}` });
        text.textContent = label;
        try {
          const length = path.getTotalLength();
          const point = path.getPointAtLength(Math.min(length * 0.22, 54));
          text.setAttribute("x", point.x + (label.toLowerCase().startsWith("non") ? 10 : -10));
          text.setAttribute("y", point.y - 8);
          text.setAttribute("text-anchor", label.toLowerCase().startsWith("non") ? "start" : "end");
        } catch (_error) {
          text.setAttribute("x", source.centerX);
          text.setAttribute("y", source.centerY - 12);
        }
        layer.appendChild(text);
      }
    });
  }

  function straightenAlignedEdges(svg, boxes) {
    svg.querySelectorAll(".algorithm-layout-connectors .algorithm-connector").forEach(path => {
      if (path.classList.contains("algorithm-loop-connector")) return;
      const source = boxes.get(path.dataset.source);
      const target = boxes.get(path.dataset.target);
      if (!source || !target || source.isDecision || target.top <= source.bottom) return;
      if (Math.abs(source.centerX - target.centerX) > 1) return;
      path.setAttribute("d", `M ${source.centerX} ${source.bottom + GAP} L ${target.centerX} ${target.top - GAP}`);
      path.dataset.straightened = "true";
    });
  }

  function styleConnectors(svg) {
    ensureMarkers(svg);
    svg.querySelectorAll(".algorithm-connector-underlay,.algorithm-flow-pulse,.algorithm-no-slash,.algorithm-loop-junction-dot").forEach(element => element.remove());
    svg.querySelectorAll(".algorithm-layout-connectors .algorithm-connector").forEach(path => {
      const loop = path.classList.contains("algorithm-loop-connector");
      const color = loop ? "#fde047" : "#67e8f9";
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", loop ? "5.4" : "5.8");
      path.setAttribute("stroke-opacity", "1");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("vector-effect", "non-scaling-stroke");
      path.setAttribute("marker-end", loop ? "url(#algorithmLoopArrowFinal)" : "url(#algorithmArrowFinal)");
      path.setAttribute("pathLength", "100");
      path.style.setProperty("display", "inline", "important");
      path.style.setProperty("visibility", "visible", "important");
      path.style.setProperty("opacity", "1", "important");
      const underlay = path.cloneNode(false);
      underlay.removeAttribute("marker-end");
      underlay.removeAttribute("data-edge-index");
      underlay.classList.remove("algorithm-connector", "algorithm-loop-connector");
      underlay.classList.add("algorithm-connector-underlay");
      underlay.setAttribute("stroke", "#020a10");
      underlay.setAttribute("stroke-width", loop ? "10" : "11");
      underlay.setAttribute("stroke-opacity", ".86");
      path.parentNode.insertBefore(underlay, path);
      const pulse = path.cloneNode(false);
      pulse.removeAttribute("marker-end");
      pulse.removeAttribute("data-edge-index");
      pulse.classList.remove("algorithm-connector", "algorithm-loop-connector");
      pulse.classList.add("algorithm-flow-pulse");
      if (loop) pulse.classList.add("algorithm-flow-pulse--loop");
      pulse.setAttribute("stroke", loop ? "#fff7a8" : "#effcff");
      pulse.setAttribute("stroke-width", loop ? "2.2" : "2.6");
      pulse.setAttribute("stroke-dasharray", loop ? "7 13" : "9 15");
      pulse.setAttribute("stroke-opacity", "0");
      pulse.setAttribute("pathLength", "100");
      path.parentNode.insertBefore(pulse, path.nextSibling);
    });
  }

  function midpoint(path) {
    try {
      const length = path.getTotalLength();
      return length > 0 ? path.getPointAtLength(length / 2) : null;
    } catch (_error) {
      return null;
    }
  }

  function rerouteLoopsToJunction(svg) {
    const layer = svg.querySelector(".algorithm-layout-connectors");
    if (!layer) return;
    layer.querySelectorAll(".algorithm-loop-connector").forEach(loopPath => {
      const targetId = loopPath.dataset.target || "";
      const incoming = [...layer.querySelectorAll(`.algorithm-connector[data-target="${CSS.escape(targetId)}"]`)].find(path => path !== loopPath && !path.classList.contains("algorithm-loop-connector"));
      const junction = incoming ? midpoint(incoming) : null;
      if (!junction) return;
      let start;
      try {
        start = loopPath.getPointAtLength(0);
      } catch (_error) {
        return;
      }
      const useLeft = String(loopPath.dataset.label || "").toLowerCase().includes("recalibrer");
      const laneX = useLeft ? Math.min(start.x, junction.x) - 120 : Math.max(start.x, junction.x) + 170;
      const leadY = start.y + 26;
      loopPath.setAttribute("d", `M ${start.x} ${start.y} L ${start.x} ${leadY} L ${laneX} ${leadY} L ${laneX} ${junction.y} L ${junction.x} ${junction.y}`);
      loopPath.dataset.junctionTarget = "incoming-midpoint";
      layer.appendChild(svgElement("circle", { class: "algorithm-loop-junction-dot", cx: junction.x, cy: junction.y, r: "5.8", fill: "#fde047", stroke: "#67e8f9", "stroke-width": "2.5", "vector-effect": "non-scaling-stroke" }));
    });
  }

  function addNoSlashes(svg) {
    const layer = svg.querySelector(".algorithm-layout-connectors");
    if (!layer) return;
    layer.querySelectorAll('.algorithm-connector[data-label]').forEach(path => {
      if (!String(path.dataset.label || "").trim().toLowerCase().startsWith("non")) return;
      try {
        const length = path.getTotalLength();
        const point = path.getPointAtLength(Math.min(26, Math.max(14, length * 0.12)));
        layer.appendChild(svgElement("line", { class: "algorithm-no-slash", x1: point.x - 5.5, y1: point.y - 7, x2: point.x + 5.5, y2: point.y + 7, stroke: "#ffffff", "stroke-width": "2.4", "stroke-linecap": "round", "vector-effect": "non-scaling-stroke", "aria-hidden": "true" }));
      } catch (_error) {}
    });
  }

  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");

  function measure(text, size, weight = 800) {
    if (!measureContext) return String(text).length * size * 0.56;
    measureContext.font = `${weight} ${size}px Arial, sans-serif`;
    return measureContext.measureText(String(text)).width;
  }

  function splitWord(word, maxWidth, size, weight) {
    const chunks = [];
    let current = "";
    [...word].forEach(character => {
      const candidate = current + character;
      if (current && measure(candidate, size, weight) > maxWidth) {
        chunks.push(current);
        current = character;
      } else current = candidate;
    });
    if (current) chunks.push(current);
    return chunks;
  }

  function wrapText(value, maxWidth, size, weight, maxLines) {
    const words = String(value || "").trim().split(/\s+/).filter(Boolean).flatMap(word => measure(word, size, weight) > maxWidth ? splitWord(word, maxWidth, size, weight) : [word]);
    const lines = [];
    let line = "";
    words.forEach(word => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measure(candidate, size, weight) > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const clipped = lines.slice(0, maxLines);
      let last = clipped[maxLines - 1];
      while (last.length > 1 && measure(`${last}…`, size, weight) > maxWidth) last = last.slice(0, -1);
      clipped[maxLines - 1] = `${last}…`;
      return clipped;
    }
    return lines;
  }

  function replaceTspans(textElement, lines, x, firstY, lineHeight) {
    textElement.textContent = "";
    lines.forEach((line, index) => {
      const tspan = svgElement("tspan", { x, y: firstY + index * lineHeight });
      tspan.textContent = line;
      textElement.appendChild(tspan);
    });
  }

  function fitNodeText(node) {
    const box = nodeBox(node);
    if (!box) return;
    const labelElement = node.querySelector(".algorithm-node-label");
    const captionElement = node.querySelector(".algorithm-node-caption");
    if (!labelElement || !captionElement) return;
    if (!node.dataset.originalLabel) node.dataset.originalLabel = labelElement.textContent.trim();
    if (!node.dataset.originalCaption) node.dataset.originalCaption = captionElement.textContent.trim();
    const decision = node.classList.contains("algorithm-node--decision");
    const io = node.classList.contains("algorithm-node--io");
    const maxWidth = decision ? box.width * 0.58 : box.width - (io ? 66 : 48);
    const centerX = box.localCenterX + (decision ? 0 : 7);
    const maxHeight = box.height - 18;
    let labelSize = decision ? 14 : 15;
    let captionSize = decision ? 10.5 : 11;
    let labelLines;
    let captionLines;
    let totalHeight;
    do {
      labelLines = wrapText(node.dataset.originalLabel, maxWidth, labelSize, 900, 3);
      captionLines = wrapText(node.dataset.originalCaption, maxWidth, captionSize, 750, 2);
      totalHeight = labelLines.length * (labelSize + 2) + captionLines.length * (captionSize + 2) + (captionLines.length ? 3 : 0);
      if (totalHeight <= maxHeight && labelLines.every(line => measure(line, labelSize, 900) <= maxWidth + 1)) break;
      labelSize -= 0.5;
      captionSize = Math.max(8.5, captionSize - 0.35);
    } while (labelSize > 10.5);
    const labelLineHeight = labelSize + 2;
    const captionLineHeight = captionSize + 2;
    const startY = box.localCenterY - totalHeight / 2 + labelSize;
    replaceTspans(labelElement, labelLines, centerX, startY, labelLineHeight);
    replaceTspans(captionElement, captionLines, centerX, startY + labelLines.length * labelLineHeight + 3, captionLineHeight);
    labelElement.setAttribute("font-size", labelSize.toFixed(1));
    captionElement.setAttribute("font-size", captionSize.toFixed(1));
  }

  function fitAllTexts(svg) {
    svg.querySelectorAll(".algorithm-node").forEach(fitNodeText);
  }

  function courseReminderHtml() {
    return `<details class="algorithm-symbol-course"><summary>Rappel de cours — symboles normalisés de l’algorigramme</summary><div class="algorithm-symbol-grid"><article class="algorithm-symbol-card"><span class="algorithm-symbol-icon algorithm-symbol-icon--process" aria-hidden="true"></span><div><h3>Traitement — rectangle</h3><p>On l’utilise pour affecter une valeur à une variable, calculer une expression, appeler une fonction ou réaliser une action, par exemple une pause.</p><p class="algorithm-symbol-example"><strong>Exemples :</strong> <code>pompeActive = false</code>, <code>Attendre 1 seconde</code>, activer ou arrêter un relais.</p></div></article><article class="algorithm-symbol-card"><span class="algorithm-symbol-icon algorithm-symbol-icon--io" aria-hidden="true"></span><div><h3>Entrée / Sortie — parallélogramme</h3><p>On l’utilise pour dialoguer avec un utilisateur, lire un capteur, écrire une information, communiquer sur un réseau ou commander explicitement une sortie.</p><p class="algorithm-symbol-example"><strong>Pseudo-code :</strong> <code>Lire humidité</code> ; <code>Écrire résultat</code>.</p></div></article></div></details>`;
  }

  function ensureCourseReminder(card) {
    if (card.querySelector(".algorithm-symbol-course")) return;
    const toolbar = card.querySelector(".algorithm-premium-toolbar");
    if (toolbar) toolbar.insertAdjacentHTML("afterend", courseReminderHtml());
  }

  function serializeSvg(svg) {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", SVG_NS);
    clone.querySelectorAll(".algorithm-flow-pulse").forEach(element => element.remove());
    const viewBox = clone.viewBox.baseVal;
    clone.setAttribute("width", String(viewBox.width || 1100));
    clone.setAttribute("height", String(viewBox.height || 900));
    return new XMLSerializer().serializeToString(clone);
  }

  function downloadPng(card, sessionId) {
    const svg = card.querySelector("svg.algorithm-premium-svg");
    if (!svg) return;
    const source = serializeSvg(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const viewBox = svg.viewBox.baseVal;
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round((viewBox.width || 1100) * scale));
      canvas.height = Math.max(1, Math.round((viewBox.height || 900) * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }
      context.scale(scale, scale);
      context.fillStyle = "#06131e";
      context.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
      context.drawImage(image, 0, 0, viewBox.width || 1100, viewBox.height || 900);
      canvas.toBlob(pngBlob => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `technoquest-seance-${sessionId}-algorigramme.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(pngUrl), 500);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  async function toggleFullscreen(card) {
    if (document.fullscreenElement === card) {
      await document.exitFullscreen?.();
      return;
    }
    if (card.requestFullscreen) {
      try {
        await card.requestFullscreen();
        return;
      } catch (_error) {}
    }
    const active = card.classList.toggle("is-algorithm-fullscreen-fallback");
    document.body.classList.toggle("algorithm-fullscreen-fallback-open", active);
  }

  function ensureActions(card, sessionId) {
    const actions = card.querySelector(".algorithm-actions");
    if (!actions) return;
    if (!actions.querySelector('[data-algorithm-action="download-png"]')) {
      const button = document.createElement("button");
      button.className = "algorithm-action-button";
      button.type = "button";
      button.dataset.algorithmAction = "download-png";
      button.textContent = "⇩ Télécharger PNG";
      button.addEventListener("click", () => downloadPng(card, sessionId));
      actions.appendChild(button);
    }
    if (!actions.querySelector('[data-algorithm-action="fullscreen"]')) {
      const button = document.createElement("button");
      button.className = "algorithm-action-button algorithm-fullscreen-button";
      button.type = "button";
      button.dataset.algorithmAction = "fullscreen";
      button.textContent = "⛶ Plein écran";
      button.addEventListener("click", () => toggleFullscreen(card));
      actions.appendChild(button);
    }
    const stage = card.querySelector(".algorithm-premium-stage");
    if (stage && !stage.dataset.fullscreenBound) {
      stage.dataset.fullscreenBound = "true";
      stage.title = "Double-cliquer pour afficher ou quitter le plein écran";
      stage.addEventListener("dblclick", event => {
        if (event.target.closest("button,a,input,textarea,select")) return;
        toggleFullscreen(card);
      });
    }
  }

  function polish(svg) {
    const card = svg.closest(".algorithm-premium-card");
    if (!card) return;
    const sessionId = Number(card.dataset.session || document.body.dataset.session || 0);
    if (!EDGES[sessionId]) return;
    normalizeSymbols(svg);
    const boxes = nodeMap(svg);
    ensureExpectedEdges(svg, sessionId, boxes);
    straightenAlignedEdges(svg, boxes);
    styleConnectors(svg);
    rerouteLoopsToJunction(svg);
    styleConnectors(svg);
    addNoSlashes(svg);
    fitAllTexts(svg);
    ensureCourseReminder(card);
    ensureActions(card, sessionId);
    svg.dataset.finalPolishVersion = POLISH_VERSION;
    svg.dataset.visibleConnectorCount = String(svg.querySelectorAll(".algorithm-layout-connectors .algorithm-connector").length);
    card.dataset.finalPolish = "ready";
  }

  function schedule(svg) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => polish(svg), 80);
      window.setTimeout(() => polish(svg), 260);
    });
  }

  function scan(root = document) {
    root.querySelectorAll?.("svg.algorithm-premium-svg").forEach(schedule);
  }

  function initialize() {
    scan(document);
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches?.("svg.algorithm-premium-svg")) schedule(node);
        node.querySelectorAll?.("svg.algorithm-premium-svg").forEach(schedule);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("fullscreenchange", () => {
      document.querySelectorAll(".algorithm-premium-card").forEach(card => {
        if (document.fullscreenElement !== card) card.classList.remove("is-algorithm-fullscreen-fallback");
      });
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      document.querySelectorAll(".algorithm-premium-card.is-algorithm-fullscreen-fallback").forEach(card => card.classList.remove("is-algorithm-fullscreen-fallback"));
      document.body.classList.remove("algorithm-fullscreen-fallback-open");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
