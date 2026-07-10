/*
 * TechnoQuest — finition visuelle des algorigrammes.
 * Rend les liaisons et leurs flèches toujours visibles, ajuste les textes,
 * anime le flux, raccorde les boucles sur les liaisons et ajoute le plein écran.
 */
"use strict";

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const VERSION = "1";
  const POLISH_DELAY = 80;

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function number(value) {
    return Number.parseFloat(value || "0") || 0;
  }

  function localShapeBox(node) {
    const shape = node?.querySelector(".algorithm-node-shape");
    if (!shape) return null;
    const box = shape.getBBox();
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      left: box.x,
      right: box.x + box.width,
      top: box.y,
      bottom: box.y + box.height,
      centerX: box.x + box.width / 2,
      centerY: box.y + box.height / 2,
      isDecision: node.classList.contains("algorithm-node--decision")
    };
  }

  function translatedShapeBox(node) {
    const box = localShapeBox(node);
    if (!box) return null;
    const dx = number(node.dataset.layoutDx);
    const dy = number(node.dataset.layoutDy);
    return {
      ...box,
      x: box.x + dx,
      y: box.y + dy,
      left: box.left + dx,
      right: box.right + dx,
      top: box.top + dy,
      bottom: box.bottom + dy,
      centerX: box.centerX + dx,
      centerY: box.centerY + dy
    };
  }

  function ensureFinalMarkers(svg) {
    const defs = svg.querySelector("defs") || svg.insertBefore(svgElement("defs"), svg.firstChild);
    const upsert = (id, fill) => {
      defs.querySelector(`#${id}`)?.remove();
      const marker = svgElement("marker", {
        id,
        viewBox: "0 0 12 12",
        refX: "9.2",
        refY: "6",
        markerWidth: "10",
        markerHeight: "10",
        markerUnits: "userSpaceOnUse",
        orient: "auto",
        overflow: "visible"
      });
      marker.appendChild(svgElement("path", {
        d: "M 0 1 L 10 6 L 0 11 z",
        fill,
        stroke: "#041018",
        "stroke-width": ".8",
        "paint-order": "stroke fill"
      }));
      defs.appendChild(marker);
    };
    upsert("algorithmArrowFinal", "#67e8f9");
    upsert("algorithmLoopArrowFinal", "#fde047");
  }

  function nodeMap(svg) {
    return new Map([...svg.querySelectorAll(".algorithm-node")].map(node => [node.dataset.node, translatedShapeBox(node)]));
  }

  function straightenAlignedEdges(svg, boxes) {
    svg.querySelectorAll(".algorithm-layout-connectors .algorithm-connector").forEach(path => {
      const source = boxes.get(path.dataset.source);
      const target = boxes.get(path.dataset.target);
      if (!source || !target || path.classList.contains("algorithm-loop-connector")) return;
      if (target.top <= source.bottom || Math.abs(source.centerX - target.centerX) > 1) return;
      const startY = source.bottom + 10;
      const endY = target.top - 10;
      if (endY - startY < 12) return;
      path.setAttribute("d", `M ${source.centerX} ${startY} L ${target.centerX} ${endY}`);
      path.dataset.straightened = "true";
    });
  }

  function makeConnectorsVisible(svg) {
    ensureFinalMarkers(svg);
    const boxes = nodeMap(svg);
    straightenAlignedEdges(svg, boxes);

    svg.querySelectorAll(".algorithm-connector-underlay,.algorithm-flow-pulse,.algorithm-no-slash,.algorithm-loop-junction-dot").forEach(element => element.remove());

    svg.querySelectorAll(".algorithm-layout-connectors .algorithm-connector").forEach(path => {
      const loop = path.classList.contains("algorithm-loop-connector");
      const color = loop ? "#fde047" : "#67e8f9";
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", loop ? "5.2" : "5.4");
      path.setAttribute("stroke-opacity", "1");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("vector-effect", "non-scaling-stroke");
      path.setAttribute("pathLength", "100");
      path.setAttribute("marker-end", loop ? "url(#algorithmLoopArrowFinal)" : "url(#algorithmArrowFinal)");
      path.style.setProperty("display", "inline", "important");
      path.style.setProperty("visibility", "visible", "important");
      path.style.setProperty("opacity", "1", "important");

      const underlay = path.cloneNode(false);
      underlay.removeAttribute("marker-end");
      underlay.removeAttribute("data-edge-index");
      underlay.classList.remove("algorithm-connector", "algorithm-loop-connector");
      underlay.classList.add("algorithm-connector-underlay");
      underlay.setAttribute("stroke", "#020a10");
      underlay.setAttribute("stroke-width", loop ? "9.5" : "10");
      underlay.setAttribute("stroke-opacity", ".82");
      underlay.setAttribute("filter", "none");
      path.parentNode.insertBefore(underlay, path);

      const pulse = path.cloneNode(false);
      pulse.removeAttribute("marker-end");
      pulse.removeAttribute("data-edge-index");
      pulse.classList.remove("algorithm-connector", "algorithm-loop-connector");
      pulse.classList.add("algorithm-flow-pulse");
      if (loop) pulse.classList.add("algorithm-flow-pulse--loop");
      pulse.setAttribute("stroke", loop ? "#fff7a8" : "#effcff");
      pulse.setAttribute("stroke-width", loop ? "2.2" : "2.5");
      pulse.setAttribute("stroke-opacity", "0");
      pulse.setAttribute("stroke-dasharray", loop ? "7 13" : "9 15");
      pulse.setAttribute("pathLength", "100");
      pulse.setAttribute("filter", "none");
      path.parentNode.insertBefore(pulse, path.nextSibling);
    });
  }

  function midpoint(path) {
    try {
      const length = path.getTotalLength();
      if (!Number.isFinite(length) || length <= 0) return null;
      return path.getPointAtLength(length / 2);
    } catch (_error) {
      return null;
    }
  }

  function rerouteLoopsToIncomingJunction(svg) {
    const layer = svg.querySelector(".algorithm-layout-connectors");
    if (!layer) return;

    layer.querySelectorAll(".algorithm-loop-connector").forEach(loopPath => {
      const targetId = loopPath.dataset.target;
      const incoming = [...layer.querySelectorAll(`.algorithm-connector[data-target="${CSS.escape(targetId || "")}"]`)]
        .find(path => path !== loopPath && !path.classList.contains("algorithm-loop-connector"));
      const junction = incoming ? midpoint(incoming) : null;
      if (!junction) return;

      let start;
      try {
        start = loopPath.getPointAtLength(0);
      } catch (_error) {
        return;
      }
      const loopBox = loopPath.getBBox();
      const right = !loopPath.dataset.label?.toLowerCase().includes("recalibrer") && loopPath.getAttribute("d")?.includes(String(loopBox.x + loopBox.width));
      const useLeft = loopPath.dataset.label?.toLowerCase().includes("recalibrer") || loopPath.classList.contains("loop-left");
      const laneX = useLeft
        ? Math.min(loopBox.x, junction.x - 90)
        : Math.max(loopBox.x + loopBox.width, junction.x + 90);
      const leadY = start.y + 24;
      const points = [
        `M ${start.x} ${start.y}`,
        `L ${start.x} ${leadY}`,
        `L ${laneX} ${leadY}`,
        `L ${laneX} ${junction.y}`,
        `L ${junction.x} ${junction.y}`
      ];
      loopPath.setAttribute("d", points.join(" "));
      loopPath.dataset.junctionTarget = "incoming-midpoint";

      const dot = svgElement("circle", {
        class: "algorithm-loop-junction-dot",
        cx: junction.x,
        cy: junction.y,
        r: "5.5",
        fill: "#fde047",
        stroke: "#67e8f9",
        "stroke-width": "2.5",
        "vector-effect": "non-scaling-stroke"
      });
      layer.appendChild(dot);
    });
  }

  function addNoBranchSlashes(svg) {
    const layer = svg.querySelector(".algorithm-layout-connectors");
    if (!layer) return;
    layer.querySelectorAll('.algorithm-connector[data-label]');
    layer.querySelectorAll('.algorithm-connector[data-label]').forEach(path => {
      if (!String(path.dataset.label || "").trim().toLowerCase().startsWith("non")) return;
      let point;
      try {
        const length = path.getTotalLength();
        point = path.getPointAtLength(Math.min(24, Math.max(12, length * .12)));
      } catch (_error) {
        return;
      }
      const slash = svgElement("line", {
        class: "algorithm-no-slash",
       x1: point.x - 5.5,
        y1: point.y - 7,
       x2: point.x + 5.5,
        y2: point.y + 7,
       stroke: "#ffffff",
        "stroke-width": "2.4",
        "stroke-linecap": "round",
        "vector-effect": "non-scaling-stroke",
        "aria-hidden": "true"
      });
      layer.appendChild(slash);
    });
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  function measure(text, size, weight = 800) {
    if (!context) return String(text).length * size * .56;
    context.font = `${weight} ${size}px Arial, sans-serif`;
    return context.measureText(String(text)).width;
  }

  function splitLongWord(word, maxWidth, size, weight) {
    const chunks = [];
    let current = "";
    [...word].forEach(character => {
      const candidate = current + character;
      if (current && measure(candidate, size, weight) > maxWidth) {
        chunks.push(current);
        current = character;
      } else {
        current = candidate;
      }
    });
    if (current) chunks.push(current);
    return chunks;
  }

  function wrapByWidth(value, maxWidth, size, weight, maxLines) {
    const rawWords = String(value || "").trim().split(/\s+/)