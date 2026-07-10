/*
 * TechnoQuest — finition robuste des algorigrammes après routage.
 * Ce module dépend du SVG final produit par mission-algorithms-layout-v3.js.
 */
"use strict";

(() => {
  const VERSION = "2";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const TEXT_AUDIT_KEYS = ["textOverflows", "numberTextOverlaps", "shapeTextCollisions"];

  function parseJson(value, fallback = {}) {
    try {
      return JSON.parse(value || "");
    } catch {
      return fallback;
    }
  }

  function number(value) {
    return Number.parseFloat(value || "0") || 0;
  }

  function boxInside(inner, outer, tolerance = 1.5) {
    return inner.left >= outer.left - tolerance &&
      inner.right <= outer.right + tolerance &&
      inner.top >= outer.top - tolerance &&
      inner.bottom <= outer.bottom + tolerance;
  }

  function boxesOverlap(first, second) {
    return Math.max(first.left, second.left) < Math.min(first.right, second.right) &&
      Math.max(first.top, second.top) < Math.min(first.bottom, second.bottom);
  }

  function rectFromBBox(box) {
    return {
      left: box.x,
      right: box.x + box.width,
      top: box.y,
      bottom: box.y + box.height,
      width: box.width,
      height: box.height
    };
  }

  function unionBoxes(boxes) {
    if (!boxes.length) return null;
    const left = Math.min(...boxes.map(box => box.left));
    const right = Math.max(...boxes.map(box => box.right));
    const top = Math.min(...boxes.map(box => box.top));
    const bottom = Math.max(...boxes.map(box => box.bottom));
    return { left, right, top, bottom, width: right - left, height: bottom - top };
  }

  function setTextX(text, x) {
    if (!text) return;
    text.setAttribute("x", x);
    text.querySelectorAll("tspan").forEach(tspan => tspan.setAttribute("x", x));
  }

  function setFontSize(text, size) {
    if (!text) return;
    text.style.fontSize = `${size}px`;
    text.querySelectorAll("tspan").forEach(tspan => {
      tspan.style.fontSize = `${size}px`;
    });
  }

  function textBoxFor(node) {
    const boxes = [...node.querySelectorAll(".algorithm-node-label,.algorithm-node-caption")]
      .filter(text => text.textContent.trim())
      .map(text => rectFromBBox(text.getBBox()));
    return unionBoxes(boxes);
  }

  function availableTextBox(node, shapeBox, numberBox) {
    const symbol = node.dataset.symbol || "process";
    const horizontal = symbol === "decision" ? 42 : symbol === "io" ? 36 : 18;
    const vertical = symbol === "decision" ? 24 : 13;
    const leftReservedForNumber = numberBox ? numberBox.right + 8 : shapeBox.left + horizontal;
    return {
      left: Math.max(shapeBox.left + horizontal, leftReservedForNumber),
      right: shapeBox.right - horizontal,
      top: shapeBox.top + vertical,
      bottom: shapeBox.bottom - vertical
    };
  }

  function fitNodeText(node) {
    const shape = node.querySelector(".algorithm-node-shape");
    const label = node.querySelector(".algorithm-node-label");
    const caption = node.querySelector(".algorithm-node-caption");
    const numberDisc = node.querySelector(".algorithm-node-number-disc");
    if (!shape || !label) return { textOverflows: 0, numberTextOverlaps: 0, shapeTextCollisions: 0 };

    const shapeBox = rectFromBBox(shape.getBBox());
    const numberBox = numberDisc ? rectFromBBox(numberDisc.getBBox()) : null;
    const available = availableTextBox(node, shapeBox, numberBox);
    const targetX = (available.left + available.right) / 2;
    setTextX(label, targetX);
    setTextX(caption, targetX);

    for (let labelSize = 14; labelSize >= 10; labelSize -= 1) {
      const captionSize = Math.max(8, labelSize - 3);
      setFontSize(label, labelSize);
      setFontSize(caption, captionSize);
      const textBox = textBoxFor(node);
      if (!textBox || (boxInside(textBox, shapeBox) && boxInside(textBox, available, 5))) break;
    }

    const textBox = textBoxFor(node);
    if (!textBox) return { textOverflows: 0, numberTextOverlaps: 0, shapeTextCollisions: 0 };

    return {
      textOverflows: boxInside(textBox, shapeBox) ? 0 : 1,
      numberTextOverlaps: numberBox && boxesOverlap(textBox, numberBox) ? 1 : 0,
      shapeTextCollisions: boxInside(textBox, available, 5) ? 0 : 1
    };
  }

  function auditAndFitText(svg) {
    const audit = { textOverflows: 0, numberTextOverlaps: 0, shapeTextCollisions: 0 };
    svg.querySelectorAll(".algorithm-node").forEach(node => {
      const result = fitNodeText(node);
      TEXT_AUDIT_KEYS.forEach(key => {
        audit[key] += result[key];
      });
    });
    return audit;
  }

  function mergeAudit(svg, textAudit) {
    const card = svg.closest(".algorithm-premium-card");
    const summary = parseJson(svg.dataset.routingAuditSummary, {});
    const wasOk = summary.ok !== false && svg.dataset.routingAudit !== "warning";
    TEXT_AUDIT_KEYS.forEach(key => {
      summary[key] = textAudit[key] || 0;
    });
    const textOk = TEXT_AUDIT_KEYS.every(key => !summary[key]);
    summary.ok = wasOk && textOk;
    svg.dataset.routingAuditSummary = JSON.stringify(summary);
    svg.dataset.routingAudit = summary.ok ? "ok" : "warning";
    if (card) {
      card.dataset.algorithmRoutingAudit = svg.dataset.routingAudit;
      card.dataset.algorithmRoutingAuditSummary = svg.dataset.routingAuditSummary;
    }
  }

  function ensureButton(actions, action, label, afterAction = null) {
    let button = actions.querySelector(`[data-algorithm-action="${action}"]`);
    if (!button) {
      button = document.createElement("button");
      button.className = "algorithm-action-button";
      button.type = "button";
      button.dataset.algorithmAction = action;
      button.textContent = label;
      const after = afterAction ? actions.querySelector(`[data-algorithm-action="${afterAction}"]`) : null;
      if (after?.nextSibling) actions.insertBefore(button, after.nextSibling);
      else actions.appendChild(button);
    }
    return button;
  }

  function ensureReminder(card) {
    if (card.querySelector(".algorithm-symbol-reminder")) return;
    const toolbar = card.querySelector(".algorithm-premium-toolbar");
    const details = document.createElement("details");
    details.className = "algorithm-symbol-reminder";
    details.innerHTML = `<summary>Rappel — symboles normalisés de l’algorigramme</summary>
      <div>
        <p><strong>Début / fin :</strong> forme arrondie.</p>
        <p><strong>Traitement :</strong> rectangle. Le rectangle représente une instruction ou une action : affecter une valeur, effectuer un calcul, appeler une fonction, commander un actionneur ou réaliser une pause.</p>
        <p><strong>Entrée / sortie :</strong> parallélogramme. Le parallélogramme représente une lecture ou une écriture : lire une valeur fournie par un utilisateur ou un capteur, afficher un résultat ou communiquer une information.</p>
        <p><strong>Test :</strong> losange.</p>
        <p><strong>Liaison :</strong> ligne orientée terminée par une flèche.</p>
        <p><strong>Jonction :</strong> point visible.</p>
      </div>`;
    toolbar?.insertAdjacentElement("afterend", details);
  }

  function addNoSlashes(svg) {
    const layer = svg.querySelector(".algorithm-layout-connectors");
    if (!layer) return;
    layer.querySelectorAll(".algorithm-no-slash").forEach(element => element.remove());
    layer.querySelectorAll(".algorithm-connector[data-label]").forEach(path => {
      if (!String(path.dataset.label || "").trim().toLowerCase().startsWith("non")) return;
      try {
        const length = path.getTotalLength();
        const point = path.getPointAtLength(Math.min(26, Math.max(14, length * 0.12)));
        const slash = document.createElementNS(SVG_NS, "line");
        [
          ["class", "algorithm-no-slash"],
          ["x1", point.x - 5.5],
          ["y1", point.y - 7],
          ["x2", point.x + 5.5],
          ["y2", point.y + 7],
          ["stroke", "#ffffff"],
          ["stroke-width", "2.4"],
          ["stroke-linecap", "round"],
          ["vector-effect", "non-scaling-stroke"],
          ["aria-hidden", "true"]
        ].forEach(([name, value]) => slash.setAttribute(name, String(value)));
        layer.appendChild(slash);
      } catch (_error) {
        // Une liaison momentanément non mesurable sera retraitée au prochain événement de rendu.
      }
    });
  }

  function svgSize(svg) {
    const viewBox = String(svg.getAttribute("viewBox") || "").trim().split(/\s+/).map(Number);
    if (viewBox.length === 4 && viewBox.every(Number.isFinite)) {
      return { x: viewBox[0], y: viewBox[1], width: viewBox[2], height: viewBox[3] };
    }
    const box = svg.getBBox();
    return { x: 0, y: 0, width: Math.max(1, box.width), height: Math.max(1, box.height) };
  }

  function exportableSvgClone(svg) {
    const clone = svg.cloneNode(true);
    const size = svgSize(svg);
    clone.setAttribute("xmlns", SVG_NS);
    clone.setAttribute("width", size.width);
    clone.setAttribute("height", size.height);
    clone.setAttribute("viewBox", `${size.x} ${size.y} ${size.width} ${size.height}`);
    clone.querySelectorAll(".is-active,.is-flowing").forEach(element => {
      element.classList.remove("is-active", "is-flowing");
      element.removeAttribute("style");
    });
    const background = document.createElementNS(SVG_NS, "rect");
    background.setAttribute("x", size.x);
    background.setAttribute("y", size.y);
    background.setAttribute("width", size.width);
    background.setAttribute("height", size.height);
    background.setAttribute("fill", "#06131e");
    background.setAttribute("aria-hidden", "true");
    const defs = clone.querySelector("defs");
    if (defs?.nextSibling) clone.insertBefore(background, defs.nextSibling);
    else clone.insertBefore(background, clone.firstChild);
    clone.querySelectorAll("path.algorithm-connector").forEach(path => {
      const isLoop = path.classList.contains("algorithm-loop-connector");
      path.classList.remove("is-flowing", "is-active");
      path.removeAttribute("style");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", isLoop ? "#fde047" : "#67e8f9");
      path.setAttribute("stroke-width", "5");
      path.setAttribute("stroke-opacity", "0.95");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("stroke-dashoffset", "0");
      if (isLoop) path.setAttribute("stroke-dasharray", "11 8");
      else path.removeAttribute("stroke-dasharray");
      path.style.setProperty("filter", "none", "important");
      path.style.setProperty("stroke", isLoop ? "#fde047" : "#67e8f9", "important");
      path.style.setProperty("stroke-width", "5", "important");
      path.style.setProperty("stroke-opacity", "0.95", "important");
      path.style.setProperty("stroke-linecap", "round", "important");
      path.style.setProperty("stroke-linejoin", "round", "important");
      path.style.setProperty("stroke-dashoffset", "0", "important");
      if (isLoop) path.style.setProperty("stroke-dasharray", "11 8", "important");
      else path.style.removeProperty("stroke-dasharray");
    });
    return { clone, size };
  }

  async function downloadPng(card) {
    const svg = card.querySelector("svg.algorithm-premium-svg");
    const sessionId = Number(card.dataset.session || document.body.dataset.session || 0);
    if (!svg || !sessionId) return;
    const { clone, size } = exportableSvgClone(svg);
    const source = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));

    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(size.width * scale);
      canvas.height = Math.ceil(size.height * scale);
      const context = canvas.getContext("2d");
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.drawImage(image, 0, 0, size.width, size.height);
      const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      if (!pngBlob) throw new Error("PNG export failed");
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `algorigramme-seance-${sessionId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(pngUrl), 1500);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function exitFallbackFullscreen() {
    document.querySelectorAll(".algorithm-fullscreen-fallback").forEach(card => {
      card.classList.remove("algorithm-fullscreen-fallback");
    });
    document.body.classList.remove("algorithm-fullscreen-lock");
  }

  async function toggleFullscreen(card) {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    if (card.requestFullscreen) {
      try {
        await card.requestFullscreen();
        return;
      } catch (_error) {
        // Le mode CSS ci-dessous reste disponible si l’API est refusée ou indisponible.
      }
    }
    card.classList.toggle("algorithm-fullscreen-fallback");
    document.body.classList.toggle("algorithm-fullscreen-lock", card.classList.contains("algorithm-fullscreen-fallback"));
  }

  function bindControls(card) {
    const actions = card.querySelector(".algorithm-actions");
    if (!actions) return;
    const pngButton = ensureButton(actions, "download-png", "⇩ Télécharger PNG", "download");
    const fullscreenButton = ensureButton(actions, "fullscreen", "⛶ Plein écran", "print");
    if (!pngButton.dataset.finalPolishBound) {
      pngButton.dataset.finalPolishBound = "true";
      pngButton.addEventListener("click", () => downloadPng(card));
    }
    if (!fullscreenButton.dataset.finalPolishBound) {
      fullscreenButton.dataset.finalPolishBound = "true";
      fullscreenButton.addEventListener("click", () => toggleFullscreen(card));
    }

    const stage = card.querySelector(".algorithm-premium-stage");
    if (stage && !stage.dataset.finalPolishFullscreenBound) {
      stage.dataset.finalPolishFullscreenBound = "true";
      stage.addEventListener("dblclick", () => toggleFullscreen(card));
    }
  }

  function polishCard(card) {
    const svg = card.querySelector("svg.algorithm-premium-svg");
    if (!svg) return;
    bindControls(card);
    ensureReminder(card);
    addNoSlashes(svg);
    mergeAudit(svg, auditAndFitText(svg));
    card.dataset.finalPolishVersion = VERSION;
  }

  let scheduled = false;
  function scan(root = document) {
    if (root.matches?.(".algorithm-premium-card")) polishCard(root);
    root.querySelectorAll?.(".algorithm-premium-card").forEach(polishCard);
  }

  function schedule(root = document) {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      scan(root);
    });
  }

  function initialize() {
    scan(document);
    document.addEventListener("technoquest:algorithm-rendered", event => schedule(event.target.closest?.(".algorithm-premium-card") || document));
    document.addEventListener("technoquest:algorithm-layout-ready", event => schedule(event.target.closest?.(".algorithm-premium-card") || document));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") exitFallbackFullscreen();
    });
    const observer = new MutationObserver(mutations => {
      if (mutations.some(mutation => [...mutation.addedNodes].some(node =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches?.(".algorithm-premium-card,svg.algorithm-premium-svg") || node.querySelector?.(".algorithm-premium-card,svg.algorithm-premium-svg"))
      ))) {
        schedule(document);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
