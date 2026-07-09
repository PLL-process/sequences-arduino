/*
 * TechnoQuest — audit visuel et correction responsive des huit algorigrammes.
 *
 * Ce module complète le générateur premium sans modifier ses données pédagogiques :
 * - il compacte la séance 1 en parcours horizontal sur deux rangées ;
 * - il reconstruit toutes les liaisons avec des marges avant les blocs ;
 * - il ajoute un véritable retour de boucle à chaque séance ;
 * - il corrige les retours arrière, notamment la maintenance de la séance 7 ;
 * - il vérifie automatiquement que les connecteurs ne traversent aucun autre bloc ;
 * - il retire le titre visuel répété à l’intérieur du SVG, tout en conservant title/desc.
 * 
 * CORRECTION séance 1 (commit suivant) :
 * - Disposition verticale conventionnelle centrée pour ordre de lecture évident (collégiens).
 * - Retour boucle via loop-right (couloir latéral droit visible).
 * - Connecteurs générés avec attributs inline stroke pour visibilité garantie et SVG téléchargé standalone.
 */
"use strict";

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const VERSION = "4";

  // Décrire les liaisons de chaque séance afin de pouvoir les recalculer après adaptation.
  const SESSION_EDGES = {
    1: [
      edge("start", "setup"), edge("setup", "read"), edge("read", "display"),
      edge("display", "safe"), edge("safe", "wait"), edge("wait", "loop"),
      edge("loop", "read", "Boucle", "loop-right")
    ],
    2: [
      edge("start", "setup"), edge("setup", "read"), edge("read", "compare"),
      edge("compare", "dry", "Oui"), edge("compare", "wet", "Non"),
      edge("dry", "safe"), edge("wet", "safe"), edge("safe", "loop"),
      edge("loop", "read", "Retour", "loop-right")
    ],
    3: [
      edge("start", "read"), edge("read", "compare"), edge("compare", "pump", "Oui"),
      edge("compare", "stop", "Non"), edge("pump", "cut"), edge("cut", "wait"),
      edge("stop", "wait"), edge("wait", "loop"), edge("loop", "read", "Retour", "loop-right")
    ],
    4: [
      edge("start", "read"), edge("read", "water"), edge("water", "alert", "Oui"),
      edge("water", "soil", "Non"), edge("soil", "pump", "Oui"), edge("soil", "stop", "Non"),
      edge("pump", "wait"), edge("stop", "wait"), edge("alert", "wait"), edge("wait", "loop"),
      edge("loop", "read", "Retour", "loop-right")
    ],
    5: [
      edge("start", "read"), edge("read", "water"), edge("water", "forceStop", "Oui"),
      edge("water", "low", "Non"), edge("low", "startPump", "Oui"), edge("low", "high", "Non"),
      edge("high", "stopPump", "Oui"), edge("high", "keep", "Non : état conservé"),
      edge("forceStop", "command"), edge("startPump", "command"),
      edge("stopPump", "command"), edge("keep", "command"),
      edge("command", "wait"), edge("wait", "loop"), edge("loop", "read", "Retour", "loop-right")
    ],
    6: [
      edge("start", "read"), edge("read", "display"), edge("display", "decision"),
      edge("decision", "pump", "Oui"), edge("decision", "stop", "Non"),
      edge("pump", "wait"), edge("stop", "wait"), edge("wait", "loop"),
      edge("loop", "read", "Retour", "loop-right")
    ],
    7: [
      edge("start", "inspect"), edge("inspect", "calibrate"), edge("calibrate", "read"),
      edge("read", "plausible"), edge("plausible", "repair", "Non"), edge("plausible", "water", "Oui"),
      edge("repair", "calibrate", "Recalibrer", "loop-left"),
      edge("water", "pump", "Oui"), edge("water", "stop", "Non"),
      edge("pump", "loop"), edge("stop", "loop"), edge("loop", "inspect", "Nouveau contrôle", "loop-right")
    ],
    8: [
      edge("start", "read"), edge("read", "coherent"), edge("coherent", "sensorError", "Non"),
      edge("coherent", "water", "Oui"), edge("water", "waterError", "Oui"), edge("water", "multi", "Non"),
      edge("multi", "pump", "Oui"), edge("multi", "stop", "Non"),
      edge("sensorError", "display"), edge("waterError", "display"),
      edge("pump", "display"), edge("stop", "display"), edge("display", "wait"),
      edge("wait", "loop"), edge("loop", "read", "Retour", "loop-right")
    ]
  };

  // La séance 1 utilise une disposition verticale conventionnelle centrée.
  // Flux descendant évident pour collégiens ; retour boucle latéral droit (loop-right) clair et sans traversée.
  const SESSION_ONE_LAYOUT = {
    start: { x: 380, y: 50 },
    setup: { x: 380, y: 145 },
    read: { x: 380, y: 240 },
    display: { x: 380, y: 335 },
    safe: { x: 380, y: 430 },
    wait: { x: 380, y: 525 },
    loop: { x: 380, y: 620 }
  };

  function edge(source, target, label = "", kind = "auto") {
    return { source, target, label, kind };
  }

  function number(value) {
    return Number.parseFloat(value || "0") || 0;
  }

  // Lire la boîte géométrique d’un bloc à partir de son rectangle ou de son losange.
  function shapeBox(node) {
    const shape = node.querySelector(".algorithm-node-shape");
    if (!shape) return null;

    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    if (shape.tagName.toLowerCase() === "rect") {
      x = number(shape.getAttribute("x"));
      y = number(shape.getAttribute("y"));
      width = number(shape.getAttribute("width"));
      height = number(shape.getAttribute("height"));
    } else {
      const points = String(shape.getAttribute("points") || "")
        .trim()
        .split(/\s+/)
        .map(point => point.split(",").map(number));
      const xs = points.map(point => point[0]);
      const ys = points.map(point => point[1]);
      x = Math.min(...xs);
      y = Math.min(...ys);
      width = Math.max(...xs) - x;
      height = Math.max(...ys) - y;
    }

    const dx = number(node.dataset.layoutDx);
    const dy = number(node.dataset.layoutDy);
    return {
      id: node.dataset.node || "",
      x: x + dx,
      y: y + dy,
      width,
      height,
      left: x + dx,
      right: x + dx + width,
      top: y + dy,
      bottom: y + dy + height,
      centerX: x + dx + width / 2,
      centerY: y + dy + height / 2
    };
  }

  // Déplacer un groupe complet sans désolidariser sa forme, ses textes et son numéro.
  function moveNode(node, target) {
    const current = shapeBox(node);
    if (!current || !target) return;
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    node.dataset.layoutDx = String(number(node.dataset.layoutDx) + dx);
    node.dataset.layoutDy = String(number(node.dataset.layoutDy) + dy);
    node.setAttribute("transform", `translate(${node.dataset.layoutDx} ${node.dataset.layoutDy})`);
  }

  // Calculer les limites réellement occupées par les blocs.
  function graphBounds(nodeMap) {
    const boxes = [...nodeMap.values()];
    if (!boxes.length) return { minLeft: 0, maxRight: 1100, minTop: 0, maxBottom: 420 };
    return {
      minLeft: Math.min(...boxes.map(box => box.left)),
      maxRight: Math.max(...boxes.map(box => box.right)),
      minTop: Math.min(...boxes.map(box => box.top)),
      maxBottom: Math.max(...boxes.map(box => box.bottom))
    };
  }

  // Convertir une liste de points orthogonaux en chemin SVG.
  function pathData(points) {
    return points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  }

  // Construire un trajet orthogonal qui s’arrête avant le bloc cible.
  function route(source, target, kind, bounds) {
    const gap = 11;

    // Retour par le haut (legacy pour layout horizontal séance 1 ; conservé pour compatibilité).
    if (kind === "loop-top") {
      const laneX = Math.max(1062, bounds.maxRight + 32);
      const topY = Math.max(18, bounds.minTop - 32);
      const points = [
        { x: source.centerX, y: source.bottom + gap },
        { x: laneX, y: source.bottom + gap },
        { x: laneX, y: topY },
        { x: target.centerX, y: topY },
        { x: target.centerX, y: target.top - gap }
      ];
      return {
        points,
        d: pathData(points),
        labelX: laneX - 12,
        labelY: Math.max(topY + 18, (source.bottom + topY) / 2),
        labelAnchor: "end",
        extentRight: laneX
      };
    }

    // Les autres retours principaux rejoignent la cible par son côté droit.
    if (kind === "loop-right") {
      const laneX = bounds.maxRight + 34;
      const points = [
        { x: source.right + gap, y: source.centerY },
        { x: laneX, y: source.centerY },
        { x: laneX, y: target.centerY },
        { x: target.right + gap, y: target.centerY }
      ];
      return {
        points,
        d: pathData(points),
        labelX: laneX - 12,
        labelY: (source.centerY + target.centerY) / 2 - 8,
        labelAnchor: "end",
        extentRight: laneX
      };
    }

    // La boucle corrective de maintenance utilise un couloir extérieur à gauche.
    if (kind === "loop-left") {
      const laneX = Math.max(24, bounds.minLeft - 34);
      const points = [
        { x: source.left - gap, y: source.centerY },
        { x: laneX, y: source.centerY },
        { x: laneX, y: target.centerY },
        { x: target.left - gap, y: target.centerY }
      ];
      return {
        points,
        d: pathData(points),
        labelX: laneX + 10,
        labelY: (source.centerY + target.centerY) / 2 - 8,
        labelAnchor: "start",
        extentRight: bounds.maxRight
      };
    }

    const horizontalDistance = target.centerX - source.centerX;
    const verticalDistance = target.centerY - source.centerY;
    const verticalOverlap = Math.min(source.bottom, target.bottom) - Math.max(source.top, target.top);

    // Liaisons latérales, particulièrement utiles dans la séance 1 compacte.
    if (verticalOverlap > Math.min(source.height, target.height) * .35 || Math.abs(verticalDistance) < 45) {
      if (horizontalDistance >= 0) {
        const startX = source.right + gap;
        const endX = target.left - gap;
        const middleX = startX + (endX - startX) / 2;
        const points = [
          { x: startX, y: source.centerY },
          { x: middleX, y: source.centerY },
          { x: middleX, y: target.centerY },
          { x: endX, y: target.centerY }
        ];
        return {
          points,
          d: pathData(points),
          labelX: middleX,
          labelY: Math.min(source.centerY, target.centerY) - 10,
          labelAnchor: "middle",
          extentRight: Math.max(...points.map(point => point.x))
        };
      }

      const startX = source.left - gap;
      const endX = target.right + gap;
      const middleX = startX + (endX - startX) / 2;
      const points = [
        { x: startX, y: source.centerY },
        { x: middleX, y: source.centerY },
        { x: middleX, y: target.centerY },
        { x: endX, y: target.centerY }
      ];
      return {
        points,
        d: pathData(points),
        labelX: middleX,
        labelY: Math.min(source.centerY, target.centerY) - 10,
        labelAnchor: "middle",
        extentRight: Math.max(...points.map(point => point.x))
      };
    }

    // Flux principal descendant : sortie basse vers entrée haute.
    if (target.top >= source.bottom) {
      const startY = source.bottom + gap;
      const endY = target.top - gap;
      const middleY = startY + Math.max(24, (endY - startY) / 2);
      const points = [
        { x: source.centerX, y: startY },
        { x: source.centerX, y: middleY },
        { x: target.centerX, y: middleY },
        { x: target.centerX, y: endY }
      ];
      return {
        points,
        d: pathData(points),
        labelX: source.centerX + (target.centerX >= source.centerX ? 18 : -18),
        labelY: middleY - 8,
        labelAnchor: target.centerX >= source.centerX ? "start" : "end",
        extentRight: Math.max(...points.map(point => point.x))
      };
    }

    // Sécurité pour un retour arrière non déclaré : utiliser un couloir droit dynamique.
    const laneX = bounds.maxRight + 34;
    const points = [
      { x: source.right + gap, y: source.centerY },
      { x: laneX, y: source.centerY },
      { x: laneX, y: target.centerY },
      { x: target.right + gap, y: target.centerY }
    ];
      return {
        points,
        d: pathData(points),
        labelX: laneX - 12,
        labelY: (source.centerY + target.centerY) / 2 - 8,
        labelAnchor: "end",
        extentRight: laneX
      };
    }

  // Détecter si un segment orthogonal traverse l’intérieur d’un autre bloc.
  function segmentCrossesBox(first, second, box) {
    if (first.x === second.x) {
      const low = Math.min(first.y, second.y);
      const high = Math.max(first.y, second.y);
      return first.x > box.left && first.x < box.right && Math.max(low, box.top) < Math.min(high, box.bottom);
    }
    if (first.y === second.y) {
      const low = Math.min(first.x, second.x);
      const high = Math.max(first.x, second.x);
      return first.y > box.top && first.y < box.bottom && Math.max(low, box.left) < Math.min(high, box.right);
    }
    return false;
  }

  // Vérifier qu’un trajet n’entre dans aucun bloc autre que sa source et sa cible.
  function routingCollisions(points, sourceId, targetId, nodeMap) {
    const collisions = [];
    nodeMap.forEach((box, nodeId) => {
      if (nodeId === sourceId || nodeId === targetId) return;
      for (let index = 0; index < points.length - 1; index += 1) {
        if (segmentCrossesBox(points[index], points[index + 1], box)) {
          collisions.push(nodeId);
          break;
        }
      }
    });
    return collisions;
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  // Reconstruire les connecteurs afin qu’ils n’entrent plus dans les formes.
  // Les attributs inline stroke assurent visibilité et fonctionnement du SVG téléchargé seul.
  function rebuildEdges(svg, sessionId, nodeMap) {
    svg.querySelectorAll(".algorithm-connector,.algorithm-branch-label,.algorithm-layout-connectors").forEach(element => element.remove());

    const layer = svgElement("g", { class: "algorithm-layout-connectors", "aria-hidden": "true" });
    const firstNode = svg.querySelector(".algorithm-node");
    if (firstNode) svg.insertBefore(layer, firstNode);
    else svg.appendChild(layer);

    const bounds = graphBounds(nodeMap);
    const warnings = [];
    let extentRight = bounds.maxRight;

    (SESSION_EDGES[sessionId] || []).forEach((definition, index) => {
      const source = nodeMap.get(definition.source);
      const target = nodeMap.get(definition.target);
      if (!source || !target) {
        warnings.push(`liaison ${definition.source} → ${definition.target} incomplète`);
        return;
      }

      const geometry = route(source, target, definition.kind, bounds);
      extentRight = Math.max(extentRight, geometry.extentRight || bounds.maxRight);
      const collisions = routingCollisions(geometry.points, definition.source, definition.target, nodeMap);
      if (collisions.length) {
        warnings.push(`${definition.source} → ${definition.target} traverse ${collisions.join(", ")}`);
      }

      const path = svgElement("path", {
        class: `algorithm-connector${definition.kind.startsWith("loop") ? " algorithm-loop-connector" : ""}`,
        d: geometry.d,
        "marker-end": "url(#algorithmArrow)",
        "data-edge-index": index,
        "data-source": definition.source,
        "data-target": definition.target,
        "vector-effect": "non-scaling-stroke",
        // Attributs inline pour visibilité garantie et SVG standalone (téléchargement/impression)
        stroke: "#67e8f9",
        "stroke-width": "5",
        "stroke-opacity": "0.92",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      });
      layer.appendChild(path);

      if (definition.label) {
        const text = svgElement("text", {
          class: `algorithm-branch-label${definition.kind.startsWith("loop") ? " algorithm-loop-label" : ""}`,
          x: geometry.labelX,
          y: geometry.labelY,
          "text-anchor": geometry.labelAnchor
        });
        text.textContent = definition.label;
        layer.appendChild(text);
      }
    });

    svg.dataset.routingAudit = warnings.length ? "warning" : "ok";
    if (warnings.length) console.warn(`TechnoQuest — séance ${sessionId} :`, warnings);
    return { bounds, extentRight, warnings };
  }

  function applyLayout(svg) {
    if (svg.dataset.layoutAuditVersion === VERSION) return;
    svg.dataset.layoutAuditVersion = VERSION;

    const card = svg.closest(".algorithm-premium-card");
    const sessionId = Number(card?.dataset.session || document.body.dataset.session || 0);
    if (!SESSION_EDGES[sessionId]) return;

    // Le titre est déjà présent dans l’en-tête de la carte : éviter sa répétition dans le dessin.
    svg.querySelectorAll(".algorithm-svg-title,.algorithm-svg-subtitle").forEach(element => element.remove());

    const nodes = [...svg.querySelectorAll(".algorithm-node")];
    if (sessionId === 1) {
      nodes.forEach(node => moveNode(node, SESSION_ONE_LAYOUT[node.dataset.node]));
      card.classList.add("algorithm-layout-compact");
    }

    const nodeMap = new Map();
    nodes.forEach(node => {
      const box = shapeBox(node);
      if (box) nodeMap.set(node.dataset.node, box);
    });

    const audit = rebuildEdges(svg, sessionId, nodeMap);
    const width = Math.max(1100, Math.ceil(audit.extentRight + 28));
    const height = Math.max(420, audit.bounds.maxBottom + 58);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
    card.dataset.algorithmRoutingAudit = svg.dataset.routingAudit;
  }

  function scan(root = document) {
    root.querySelectorAll?.("svg.algorithm-premium-svg").forEach(applyLayout);
  }

  function initialize() {
    scan(document);
    const observer = new MutationObserver(mutations => {
      let mustScan = false;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.("svg.algorithm-premium-svg") || node.querySelector?.("svg.algorithm-premium-svg")) mustScan = true;
        });
      });
      if (mustScan) window.requestAnimationFrame(() => scan(document));
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
