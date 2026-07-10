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
  const VERSION = "10";
  const PORT_GAP = 10;

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
      edge("high", "stopPump", "Oui"), edge("high", "keep", "Non"),
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

  // Layouts explicites : les x sont des centres, pour aligner vraiment les formes de largeur variable.
  const SESSION_LAYOUTS = {
    1: {
      start: { centerX: 300, y: 35 }, setup: { centerX: 300, y: 170 },
      read: { centerX: 300, y: 305 }, display: { centerX: 300, y: 435 },
      safe: { centerX: 300, y: 565 }, wait: { centerX: 300, y: 695 },
      loop: { centerX: 300, y: 825 }
    },
    2: {
      start: { centerX: 520, y: 35 }, setup: { centerX: 520, y: 165 },
      read: { centerX: 520, y: 295 }, compare: { centerX: 520, y: 430 },
      dry: { centerX: 260, y: 595 }, wet: { centerX: 780, y: 595 },
      safe: { centerX: 520, y: 765 }, loop: { centerX: 520, y: 895 }
    },
    3: {
      start: { centerX: 520, y: 35 }, read: { centerX: 520, y: 180 },
      compare: { centerX: 520, y: 325 }, pump: { centerX: 260, y: 500 },
      stop: { centerX: 780, y: 500 }, cut: { centerX: 260, y: 640 },
      wait: { centerX: 520, y: 805 }, loop: { centerX: 520, y: 935 }
    },
    4: {
      start: { centerX: 520, y: 35 }, read: { centerX: 520, y: 180 },
      water: { centerX: 520, y: 330 }, alert: { centerX: 250, y: 515 },
      soil: { centerX: 800, y: 515 }, pump: { centerX: 660, y: 710 },
      stop: { centerX: 940, y: 710 }, wait: { centerX: 520, y: 900 },
      loop: { centerX: 520, y: 1030 }
    },
    5: {
      start: { centerX: 560, y: 35 }, read: { centerX: 560, y: 175 },
      water: { centerX: 560, y: 330 }, forceStop: { centerX: 260, y: 510 },
      low: { centerX: 860, y: 510 }, startPump: { centerX: 700, y: 700 },
      high: { centerX: 1020, y: 700 }, stopPump: { centerX: 860, y: 895 },
      keep: { centerX: 1180, y: 895 }, command: { centerX: 560, y: 1095 },
      wait: { centerX: 560, y: 1225 }, loop: { centerX: 560, y: 1355 }
    },
    6: {
      start: { centerX: 520, y: 35 }, read: { centerX: 520, y: 170 },
      display: { centerX: 520, y: 305 }, decision: { centerX: 520, y: 455 },
      pump: { centerX: 260, y: 640 }, stop: { centerX: 780, y: 640 },
      wait: { centerX: 520, y: 825 }, loop: { centerX: 520, y: 955 }
    },
    7: {
      start: { centerX: 520, y: 35 }, inspect: { centerX: 520, y: 165 },
      calibrate: { centerX: 520, y: 295 }, read: { centerX: 520, y: 425 },
      plausible: { centerX: 520, y: 575 }, repair: { centerX: 250, y: 760 },
      water: { centerX: 790, y: 760 }, pump: { centerX: 650, y: 955 },
      stop: { centerX: 930, y: 955 }, loop: { centerX: 520, y: 1145 }
    },
    8: {
      start: { centerX: 560, y: 35 }, read: { centerX: 560, y: 165 },
      coherent: { centerX: 560, y: 315 }, sensorError: { centerX: 260, y: 505 },
      water: { centerX: 860, y: 505 }, waterError: { centerX: 700, y: 700 },
      multi: { centerX: 1020, y: 700 }, pump: { centerX: 860, y: 895 },
      stop: { centerX: 1180, y: 895 }, display: { centerX: 560, y: 1095 },
      wait: { centerX: 560, y: 1225 }, loop: { centerX: 560, y: 1355 }
    }
  };

  const SESSION_ALIGNMENT_RULES = {
    1: [["start", "setup", "read", "display", "safe", "wait", "loop"]],
    2: [["start", "setup", "read", "compare", "safe", "loop"], ["dry", "wet"]],
    3: [["start", "read", "compare", "wait", "loop"], ["pump", "stop"], ["pump", "cut"]],
    4: [["start", "read", "water", "wait", "loop"], ["alert", "soil"], ["pump", "stop"]],
    5: [["start", "read", "water", "command", "wait", "loop"], ["startPump", "high"], ["stopPump", "keep"]],
    6: [["start", "read", "display", "decision", "wait", "loop"], ["pump", "stop"]],
    7: [["start", "inspect", "calibrate", "read", "plausible", "loop"], ["repair", "water"], ["pump", "stop"]],
    8: [["start", "read", "coherent", "display", "wait", "loop"], ["sensorError", "water"], ["waterError", "multi"], ["pump", "stop"]]
  };

  const SESSION_SYMMETRY_RULES = {
    2: [{ decision: "compare", left: "dry", right: "wet" }],
    3: [{ decision: "compare", left: "pump", right: "stop" }],
    4: [{ decision: "water", left: "alert", right: "soil" }, { decision: "soil", left: "pump", right: "stop" }],
    5: [{ decision: "water", left: "forceStop", right: "low" }, { decision: "low", left: "startPump", right: "high" }, { decision: "high", left: "stopPump", right: "keep" }],
    6: [{ decision: "decision", left: "pump", right: "stop" }],
    7: [{ decision: "plausible", left: "repair", right: "water" }, { decision: "water", left: "pump", right: "stop" }],
    8: [{ decision: "coherent", left: "sensorError", right: "water" }, { decision: "water", left: "waterError", right: "multi" }, { decision: "multi", left: "pump", right: "stop" }]
  };

  const MERGE_TARGET_IDS = new Set(["safe", "wait", "loop", "command", "display"]);

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
      centerY: y + dy + height / 2,
      type: node.classList.contains("algorithm-node--decision") ? "decision" : "ordinary",
      isDecision: node.classList.contains("algorithm-node--decision")
    };
  }

  // Déplacer un groupe complet sans désolidariser sa forme, ses textes et son numéro.
  function moveNode(node, target) {
    const current = shapeBox(node);
    if (!current || !target) return;
    const targetX = Number.isFinite(target.centerX) ? target.centerX - current.width / 2 : target.x;
    const dx = targetX - current.x;
    const dy = target.y - current.y;
    node.dataset.layoutDx = String(number(node.dataset.layoutDx) + dx);
    node.dataset.layoutDy = String(number(node.dataset.layoutDy) + dy);
    node.setAttribute("transform", `translate(${node.dataset.layoutDx} ${node.dataset.layoutDy})`);
  }

  function shiftNode(node, dx, dy = 0) {
    node.dataset.layoutDx = String(number(node.dataset.layoutDx) + dx);
    node.dataset.layoutDy = String(number(node.dataset.layoutDy) + dy);
    node.setAttribute("transform", `translate(${node.dataset.layoutDx} ${node.dataset.layoutDy})`);
  }

  function separateOverlappingNodes(nodes) {
    for (let pass = 0; pass < 8; pass += 1) {
      let shifted = false;
      const boxes = nodes.map(node => ({ node, box: shapeBox(node) })).filter(item => item.box);
      for (let firstIndex = 0; firstIndex < boxes.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < boxes.length; secondIndex += 1) {
          const first = boxes[firstIndex];
          const second = boxes[secondIndex];
          if (!boxesOverlap(first.box, second.box)) continue;
          const overlapX = Math.min(first.box.right, second.box.right) - Math.max(first.box.left, second.box.left);
          shiftNode(second.node, overlapX + 24);
          shifted = true;
        }
      }
      if (!shifted) break;
    }
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

  function getTopPort(box, gap = 0) {
    return { x: box.centerX, y: box.top - gap };
  }

  function getBottomPort(box, gap = 0) {
    return { x: box.centerX, y: box.bottom + gap };
  }

  function getDecisionInputPort(diamond) {
    return { x: diamond.centerX, y: diamond.top };
  }

  function getDecisionYesPort(diamond) {
    return { x: diamond.left, y: diamond.centerY };
  }

  function getDecisionNoPort(diamond) {
    return { x: diamond.right, y: diamond.centerY };
  }

  function decisionBranch(label) {
    const normalized = String(label || "").trim().toLowerCase();
    if (normalized.startsWith("oui")) return "yes";
    if (normalized.startsWith("non")) return "no";
    return "";
  }

  function pointDistance(first, second) {
    return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
  }

  function normalizePoints(points) {
    const compact = [];
    points.forEach(point => {
      const previous = compact[compact.length - 1];
      if (!previous || previous.x !== point.x || previous.y !== point.y) compact.push(point);
    });

    let index = 1;
    while (index < compact.length - 1) {
      const previous = compact[index - 1];
      const current = compact[index];
      const next = compact[index + 1];
      if ((previous.x === current.x && current.x === next.x) || (previous.y === current.y && current.y === next.y)) {
        compact.splice(index, 1);
      } else {
        index += 1;
      }
    }
    return compact;
  }

  function routeLength(points) {
    return points.slice(1).reduce((total, point, index) => total + pointDistance(points[index], point), 0);
  }

  function segmentDirection(first, second) {
    if (near(first, second)) return "";
    return first.x === second.x ? "vertical" : first.y === second.y ? "horizontal" : "diagonal";
  }

  function countBends(points) {
    const directions = [];
    for (let index = 0; index < points.length - 1; index += 1) {
      const direction = segmentDirection(points[index], points[index + 1]);
      if (direction && direction !== directions[directions.length - 1]) directions.push(direction);
    }
    return Math.max(0, directions.length - 1);
  }

  function countShortSegments(points, minimum = 18) {
    let count = 0;
    for (let index = 0; index < points.length - 1; index += 1) {
      const length = pointDistance(points[index], points[index + 1]);
      const isPortApproach = index === 0 || index === points.length - 2;
      if (!isPortApproach && length > 0 && length < minimum) count += 1;
    }
    return count;
  }

  function exteriorLane(kind, bounds, side = "right") {
    if (kind === "loop-left" || side === "left") return Math.max(24, bounds.minLeft - 52);
    return bounds.maxRight + 52;
  }

  function branchLabel(points, source, target, kind, labelSide) {
    const horizontalSegments = [];
    for (let index = 0; index < points.length - 1; index += 1) {
      const first = points[index];
      const second = points[index + 1];
      if (first.y === second.y && first.x !== second.x) {
        horizontalSegments.push({ first, second, length: Math.abs(second.x - first.x) });
      }
    }

    const segment = horizontalSegments.sort((first, second) => second.length - first.length)[0];
    if (!segment) {
      return {
        labelX: source.centerX + 18,
        labelY: (source.bottom + target.top) / 2,
        labelAnchor: "start"
      };
    }

    if (kind === "loop-right") {
      const laneX = Math.max(...points.map(point => point.x));
      return {
        labelX: laneX + 12,
        labelY: (source.centerY + target.centerY) / 2 - 8,
        labelAnchor: "start"
      };
    }

    if (kind === "loop-left") {
      const laneX = Math.min(...points.map(point => point.x));
      return {
        labelX: laneX + 10,
        labelY: (source.centerY + target.centerY) / 2 - 8,
        labelAnchor: "start"
      };
    }

    const labelX = (segment.first.x + segment.second.x) / 2;
    const labelY = segment.first.y + 14;
    return {
      labelX,
      labelY,
      labelAnchor: labelSide || "middle"
    };
  }

  function placeDecisionLabel(branch, source, routePoints) {
    const sign = branch === "yes" ? -1 : 1;
    const first = routePoints[0];
    const second = routePoints[1] || first;
    const horizontalLength = Math.abs(second.x - first.x);
    const offset = Math.max(22, Math.min(54, horizontalLength * .65));
    return {
      labelX: first.x + sign * offset,
      labelY: horizontalLength < 36 ? source.top - 8 : source.centerY - 9,
      labelAnchor: branch === "yes" ? "end" : "start"
    };
  }

  function approachYForTarget(target, targetAnchor, nodeMap, gap, lead) {
    let approachY = targetAnchor.y - lead;
    nodeMap.forEach((box, nodeId) => {
      if (nodeId === target.id) return;
      const verticalLineCanHit = target.centerX > box.left && target.centerX < box.right;
      if (verticalLineCanHit && approachY < box.bottom && targetAnchor.y > box.top) {
        approachY = Math.max(approachY, box.bottom + gap);
      }
    });
    return Math.min(approachY, targetAnchor.y - 1);
  }

  function routeScore(points, sourceId, targetId, nodeMap, penalty = 0, previousPaths = []) {
    return {
      blockCollisions: routingCollisions(points, sourceId, targetId, nodeMap).length,
      crossings: countCandidateCrossings(points, previousPaths),
      bends: countBends(points),
      shortSegments: countShortSegments(points),
      cost: penalty + routeLength(points)
    };
  }

  function routeFromCandidates(candidates, source, target, kind, nodeMap, labelSide, validator, labelFactory, previousPaths = []) {
    const valid = candidates
      .map(candidate => ({
        points: normalizePoints(candidate.points),
        penalty: candidate.penalty || 0
      }))
      .filter(candidate => candidate.points.length >= 2)
      .filter(candidate => validator(candidate.points))
      .map(candidate => ({
        ...candidate,
        score: routeScore(candidate.points, source.id, target.id, nodeMap, candidate.penalty, previousPaths)
      }))
      .sort((first, second) =>
        first.score.blockCollisions - second.score.blockCollisions ||
        first.score.crossings - second.score.crossings ||
        first.score.shortSegments - second.score.shortSegments ||
        first.score.bends - second.score.bends ||
        first.score.cost - second.score.cost
      );

    const best = valid[0] || candidates[0];
    const points = normalizePoints(best.points);
    const label = labelFactory ? labelFactory(points) : branchLabel(points, source, target, kind, labelSide);
    return {
      points,
      d: pathData(points),
      ...label,
      extentRight: Math.max(...points.map(point => point.x), label.labelX + (label.labelAnchor === "start" ? 120 : 0))
    };
  }

  function validSequential(points) {
    const first = points[0];
    const second = points[1];
    const last = points[points.length - 1];
    const previous = points[points.length - 2];
    return first.x === second.x && second.y >= first.y && previous.x === last.x && previous.y <= last.y;
  }

  function validDecisionBranch(points, branch) {
    const first = points[0];
    const second = points[1];
    const last = points[points.length - 1];
    const previous = points[points.length - 2];
    const sign = branch === "yes" ? -1 : 1;
    return first.y === second.y && (second.x - first.x) * sign > 0 &&
      previous.x === last.x && previous.y <= last.y;
  }

  function orthogonalIntersection(firstSegment, secondSegment) {
    const firstHorizontal = firstSegment.first.y === firstSegment.second.y;
    const secondHorizontal = secondSegment.first.y === secondSegment.second.y;
    if (firstHorizontal === secondHorizontal) return null;

    const horizontal = firstHorizontal ? firstSegment : secondSegment;
    const vertical = firstHorizontal ? secondSegment : firstSegment;
    const between = (value, first, second) => value > Math.min(first, second) && value < Math.max(first, second);
    const point = { x: vertical.first.x, y: horizontal.first.y };
    if (!between(point.x, horizontal.first.x, horizontal.second.x) ||
      !between(point.y, vertical.first.y, vertical.second.y)) return null;
    return point;
  }

  function pathSegments(points) {
    const segments = [];
    for (let index = 0; index < points.length - 1; index += 1) {
      const first = points[index];
      const second = points[index + 1];
      if (!near(first, second)) segments.push({ first, second });
    }
    return segments;
  }

  function countCandidateCrossings(points, previousPaths) {
    const segments = pathSegments(points);
    let crossings = 0;
    previousPaths.forEach(previousPath => {
      const previousSegments = pathSegments(previousPath.points);
      segments.forEach(segment => {
        previousSegments.forEach(previousSegment => {
          if (orthogonalIntersection(segment, previousSegment)) crossings += 1;
        });
      });
    });
    return crossings;
  }

  function routeSequentialEdge(source, target, kind, bounds, nodeMap, previousPaths) {
    const gap = PORT_GAP;
    const lead = 28;
    const sourceAnchor = getBottomPort(source, gap);
    const targetAnchor = getTopPort(target, gap);
    const rightLane = exteriorLane(kind, bounds, "right");
    const leftLane = exteriorLane(kind, bounds, "left");
    const preferredLane = kind === "loop-left" ? leftLane : rightLane;
    const alternateLane = preferredLane === rightLane ? leftLane : rightLane;
    const candidates = [];

    const addCandidate = (points, penalty = 0) => candidates.push({ points, penalty });
    const addExteriorCandidate = (laneX, penalty = 800) => {
      const startLeadY = sourceAnchor.y + lead;
      const targetLeadY = approachYForTarget(target, targetAnchor, nodeMap, gap, lead);
      addCandidate([
        sourceAnchor,
        { x: sourceAnchor.x, y: startLeadY },
        { x: laneX, y: startLeadY },
        { x: laneX, y: targetLeadY },
        { x: targetAnchor.x, y: targetLeadY },
        targetAnchor
      ], penalty);
    };

    if (targetAnchor.y > sourceAnchor.y && Math.abs(sourceAnchor.x - targetAnchor.x) <= .5) {
      addCandidate([sourceAnchor, targetAnchor], 0);
      return routeFromCandidates(candidates, source, target, kind, nodeMap, "middle", validSequential, null, previousPaths);
    }

    if (kind === "merge-left" && targetAnchor.y > sourceAnchor.y) {
      addExteriorCandidate(leftLane, 0);
      return routeFromCandidates(candidates, source, target, kind, nodeMap, "middle", validSequential, null, previousPaths);
    }

    if (targetAnchor.y > sourceAnchor.y) {
      if (MERGE_TARGET_IDS.has(target.id)) {
        const mergeY = targetAnchor.y - 38;
        addCandidate([
          sourceAnchor,
          { x: sourceAnchor.x, y: mergeY },
          { x: targetAnchor.x, y: mergeY },
          targetAnchor
        ], 0);
        return routeFromCandidates(candidates, source, target, kind, nodeMap, "middle", validSequential, null, previousPaths);
      }

      const middleY = (sourceAnchor.y + targetAnchor.y) / 2;
      addCandidate([
        sourceAnchor,
        { x: sourceAnchor.x, y: middleY },
        { x: targetAnchor.x, y: middleY },
        targetAnchor
      ], Math.abs(sourceAnchor.x - targetAnchor.x) > 1 ? 20 : 0);

      const startLeadY = Math.min(sourceAnchor.y + lead, middleY);
      const targetLeadY = Math.max(approachYForTarget(target, targetAnchor, nodeMap, gap, lead), middleY);
      addCandidate([
        sourceAnchor,
        { x: sourceAnchor.x, y: startLeadY },
        { x: targetAnchor.x, y: startLeadY },
        { x: targetAnchor.x, y: targetLeadY },
        targetAnchor
      ], 80);

      const lowApproachY = Math.min(targetAnchor.y - 1, Math.max(sourceAnchor.y + lead, targetAnchor.y - 12));
      addCandidate([
        sourceAnchor,
        { x: sourceAnchor.x, y: sourceAnchor.y + lead },
        { x: sourceAnchor.x, y: lowApproachY },
        { x: targetAnchor.x, y: lowApproachY },
        targetAnchor
      ], 90);
      addExteriorCandidate(preferredLane, 900);
      addExteriorCandidate(alternateLane, 1200);
    } else {
      addExteriorCandidate(preferredLane, kind === "loop-left" || kind === "loop-right" ? 0 : 900);
      addExteriorCandidate(alternateLane, 1200);
    }

    return routeFromCandidates(candidates, source, target, kind, nodeMap, "middle", validSequential, null, previousPaths);
  }

  function routeDecisionBranch(source, target, label, bounds, nodeMap, previousPaths) {
    const branch = decisionBranch(label);
    const sign = branch === "yes" ? -1 : 1;
    const branchSide = branch === "yes" ? "left" : "right";
    const lead = 30;
    const gap = PORT_GAP;
    const sourceAnchor = branch === "yes" ? getDecisionYesPort(source) : getDecisionNoPort(source);
    const targetAnchor = getTopPort(target, gap);
    const baseTargetLeadY = approachYForTarget(target, targetAnchor, nodeMap, gap, lead);
    const branchOffsetY = branch === "yes" ? -8 : 8;
    const minApproachY = sourceAnchor.y + 14;
    const maxApproachY = targetAnchor.y - 1;
    const targetLeadY = minApproachY <= maxApproachY
      ? Math.max(minApproachY, Math.min(maxApproachY, baseTargetLeadY + branchOffsetY))
      : maxApproachY;
    const lowApproachY = minApproachY <= maxApproachY
      ? Math.max(targetLeadY, Math.min(maxApproachY, targetAnchor.y - 12))
      : targetLeadY;
    const targetLane = targetAnchor.x;
    let sideLane = sourceAnchor.x + sign * 28;
    const laneLow = Math.min(sourceAnchor.y, Math.max(targetLeadY, lowApproachY));
    const laneHigh = Math.max(sourceAnchor.y, Math.max(targetLeadY, lowApproachY));
    nodeMap.forEach((box, nodeId) => {
      if (nodeId === source.id || nodeId === target.id) return;
      const laneInsideBox = sideLane > box.left && sideLane < box.right;
      const verticalOverlap = Math.max(laneLow, box.top) < Math.min(laneHigh, box.bottom);
      if (!laneInsideBox || !verticalOverlap) return;

      const nearLane = sign < 0 ? box.right + 6 : box.left - 6;
      const farLane = sign < 0 ? box.left - 6 : box.right + 6;
      sideLane = (nearLane - sourceAnchor.x) * sign > 0 ? nearLane : farLane;
    });
    const exterior = exteriorLane("", bounds, branchSide);
    const oppositeExterior = exteriorLane("", bounds, branchSide === "left" ? "right" : "left");
    const targetIsOnBranchSide = (targetLane - sourceAnchor.x) * sign > 34;
    const candidates = [];
    const addCandidate = (points, penalty = 0) => candidates.push({ points, penalty });
    const branchDistance = (targetLane - sourceAnchor.x) * sign;
    const directDropIsReadable = branchDistance >= 18 && targetAnchor.y > sourceAnchor.y;

    if (directDropIsReadable) {
      addCandidate([
        sourceAnchor,
        { x: targetLane, y: sourceAnchor.y },
        targetAnchor
      ], targetIsOnBranchSide ? 0 : 12);
    }

    addCandidate([
      sourceAnchor,
      { x: sideLane, y: sourceAnchor.y },
      { x: sideLane, y: targetLeadY },
      { x: targetAnchor.x, y: targetLeadY },
      targetAnchor
    ], targetIsOnBranchSide ? 80 : 0);

    addCandidate([
      sourceAnchor,
      { x: sideLane, y: sourceAnchor.y },
      { x: sideLane, y: lowApproachY },
      { x: targetAnchor.x, y: lowApproachY },
      targetAnchor
    ], 110);

    if (!targetIsOnBranchSide) {
      const overpassY = source.top - Math.max(4, gap * .5);
      addCandidate([
        sourceAnchor,
        { x: sideLane, y: sourceAnchor.y },
        { x: sideLane, y: overpassY },
        { x: targetAnchor.x, y: overpassY },
        targetAnchor
      ], 220);
    }

    addCandidate([
      sourceAnchor,
      { x: exterior, y: sourceAnchor.y },
      { x: exterior, y: targetLeadY },
      { x: targetAnchor.x, y: targetLeadY },
      targetAnchor
    ], 420);

    addCandidate([
      sourceAnchor,
      { x: exterior, y: sourceAnchor.y },
      { x: exterior, y: lowApproachY },
      { x: targetAnchor.x, y: lowApproachY },
      targetAnchor
    ], 650);

    addCandidate([
      sourceAnchor,
      { x: sideLane, y: sourceAnchor.y },
      { x: sideLane, y: sourceAnchor.y + lead },
      { x: oppositeExterior, y: sourceAnchor.y + lead },
      { x: oppositeExterior, y: targetLeadY },
      { x: targetAnchor.x, y: targetLeadY },
      targetAnchor
    ], 1200);

    return routeFromCandidates(
      candidates,
      source,
      target,
      "decision",
      nodeMap,
      "middle",
      points => validDecisionBranch(points, branch),
      points => placeDecisionLabel(branch, source, points),
      previousPaths
    );
  }

  function route(source, target, definition, bounds, nodeMap, previousPaths) {
    if (source.isDecision) return routeDecisionBranch(source, target, definition.label, bounds, nodeMap, previousPaths);
    return routeSequentialEdge(source, target, definition.kind, bounds, nodeMap, previousPaths);
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

  function boxesOverlap(first, second) {
    return Math.max(first.left, second.left) < Math.min(first.right, second.right) &&
      Math.max(first.top, second.top) < Math.min(first.bottom, second.bottom);
  }

  function blockOverlaps(nodeMap) {
    const boxes = [...nodeMap.entries()];
    const overlaps = [];
    for (let firstIndex = 0; firstIndex < boxes.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < boxes.length; secondIndex += 1) {
        const [firstId, firstBox] = boxes[firstIndex];
        const [secondId, secondBox] = boxes[secondIndex];
        if (boxesOverlap(firstBox, secondBox)) overlaps.push(`${firstId}/${secondId}`);
      }
    }
    return overlaps;
  }

  function near(first, second, tolerance = .5) {
    return Math.abs(first.x - second.x) <= tolerance && Math.abs(first.y - second.y) <= tolerance;
  }

  function hasFoldedSegments(points) {
    for (let index = 0; index < points.length - 2; index += 1) {
      const first = points[index];
      const second = points[index + 1];
      const third = points[index + 2];
      if (near(first, third) && !near(first, second)) return true;
      if (near(first, second)) return true;
    }
    return false;
  }

  function countZeroLengthSegments(points) {
    let count = 0;
    for (let index = 0; index < points.length - 1; index += 1) {
      if (near(points[index], points[index + 1])) count += 1;
    }
    return count;
  }

  function connectionPortAudit(points, source, target, definition) {
    const tolerance = .5;
    const first = points[0];
    const second = points[1];
    const last = points[points.length - 1];
    const previous = points[points.length - 2];
    const targetTop = getTopPort(target, PORT_GAP);
    const result = {
      invalidDecisionInputs: 0,
      invalidDecisionOutputs: 0,
      decisionBottomOutputs: 0,
      reversedDecisionLabels: 0,
      ordinarySideEntries: 0,
      ordinarySideExits: 0,
      zeroLengthSegments: countZeroLengthSegments(points),
      foldedSegments: hasFoldedSegments(points) ? 1 : 0,
      danglingConnectors: points.length < 2 ? 1 : 0
    };

    if (!first || !second || !last || !previous) {
      result.danglingConnectors += 1;
      return result;
    }

    if (source.isDecision) {
      const branch = decisionBranch(definition.label);
      const sign = branch === "yes" ? -1 : 1;
      const expectedSource = branch === "yes" ? getDecisionYesPort(source) : getDecisionNoPort(source);
      const firstSegmentIsHorizontal = second.y === first.y;
      const firstSegmentDirectionIsValid = (second.x - first.x) * sign > 0;
      const startsAtExpectedSide = near(first, expectedSource, tolerance);
      const startsFromBottom = first.y >= source.bottom - tolerance || Math.abs(first.x - source.centerX) <= tolerance;
      const branchIsReversed = branch === "yes"
        ? first.x >= source.centerX - tolerance || second.x > first.x
        : first.x <= source.centerX + tolerance || second.x < first.x;

      if (!["yes", "no"].includes(branch) || !startsAtExpectedSide || !firstSegmentIsHorizontal || !firstSegmentDirectionIsValid) {
        result.invalidDecisionOutputs += 1;
      }
      if (startsFromBottom) result.decisionBottomOutputs += 1;
      if (!["yes", "no"].includes(branch) || branchIsReversed) result.reversedDecisionLabels += 1;
    } else if (!near(first, getBottomPort(source, PORT_GAP), tolerance) || second.x !== first.x || second.y < first.y) {
      result.ordinarySideExits += 1;
    }

    const nearTargetSide = Math.min(Math.abs(last.x - target.left), Math.abs(last.x - target.right)) <= 2;
    if (!near(last, targetTop, tolerance) || previous.x !== last.x || previous.y > last.y || nearTargetSide) {
      if (target.isDecision) result.invalidDecisionInputs += 1;
      else result.ordinarySideEntries += 1;
    }

    return result;
  }

  function labelCollisions(layer, nodeMap) {
    const collisions = [];
    layer.querySelectorAll(".algorithm-branch-label").forEach(label => {
      const box = label.getBBox();
      const padded = {
        left: box.x - 2,
        right: box.x + box.width + 2,
        top: box.y - 2,
        bottom: box.y + box.height + 2
      };
      nodeMap.forEach((nodeBox, nodeId) => {
        if (boxesOverlap(padded, nodeBox)) collisions.push(`${label.textContent.trim()} → ${nodeId}`);
      });
    });
    return collisions;
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function ensureRoutingMarkers(svg) {
    const defs = svg.querySelector("defs") || svg.insertBefore(svgElement("defs"), svg.firstChild);
    const upsertMarker = (id, fill) => {
      defs.querySelector(`#${id}`)?.remove();
      const marker = svgElement("marker", {
        id,
        viewBox: "0 0 10 10",
        refX: "9",
        refY: "5",
        markerWidth: "10",
        markerHeight: "10",
        markerUnits: "userSpaceOnUse",
        orient: "auto"
      });
      marker.appendChild(svgElement("path", {
        d: "M 0 0 L 10 5 L 0 10 z",
        fill
      }));
      defs.appendChild(marker);
    };

    upsertMarker("algorithmArrow", "#67e8f9");
    upsertMarker("algorithmLoopArrow", "#fde047");
  }

  function countAmbiguousCrossings(paths) {
    const intersections = [];
    const endpointKey = point => `${point.x},${point.y}`;
    const segmentList = [];
    paths.forEach(path => {
      for (let index = 0; index < path.points.length - 1; index += 1) {
        const first = path.points[index];
        const second = path.points[index + 1];
        if (near(first, second)) continue;
        segmentList.push({
          edge: path.edge,
          first,
          second,
          endpoints: new Set([endpointKey(first), endpointKey(second)])
        });
      }
    });

    const between = (value, first, second) => value > Math.min(first, second) && value < Math.max(first, second);
    for (let firstIndex = 0; firstIndex < segmentList.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < segmentList.length; secondIndex += 1) {
        const a = segmentList[firstIndex];
        const b = segmentList[secondIndex];
        const aHorizontal = a.first.y === a.second.y;
        const bHorizontal = b.first.y === b.second.y;
        if (aHorizontal === bHorizontal) continue;

        const horizontal = aHorizontal ? a : b;
        const vertical = aHorizontal ? b : a;
        const point = { x: vertical.first.x, y: horizontal.first.y };
        if (!between(point.x, horizontal.first.x, horizontal.second.x) ||
          !between(point.y, vertical.first.y, vertical.second.y)) continue;
        const key = endpointKey(point);
        if (horizontal.endpoints.has(key) || vertical.endpoints.has(key)) continue;
        intersections.push(`${a.edge}/${b.edge}`);
      }
    }
    return intersections;
  }

  function collectJunctionPoints(paths) {
    const byPoint = new Map();
    const keyFor = point => `${point.x},${point.y}`;
    paths.forEach(path => {
      path.points.slice(1, -1).forEach(point => {
        const key = keyFor(point);
        if (!byPoint.has(key)) byPoint.set(key, { point, edges: new Set() });
        byPoint.get(key).edges.add(path.edge);
      });
    });
    return [...byPoint.values()].filter(item => item.edges.size >= 2);
  }

  function drawJunctionDots(layer, junctions) {
    junctions.forEach((junction, index) => {
      layer.appendChild(svgElement("circle", {
        class: "algorithm-junction-dot",
        "data-junction-index": index,
        cx: junction.point.x,
        cy: junction.point.y,
        r: 6,
        fill: "#67e8f9",
        stroke: "#ecfeff",
        "stroke-width": "2",
        filter: "url(#algorithmSoftGlow)"
      }));
    });
  }

  function layoutRuleAudit(sessionId, nodeMap) {
    const result = { nodeMisalignments: 0, asymmetricalBranches: 0 };
    (SESSION_ALIGNMENT_RULES[sessionId] || []).forEach(group => {
      const boxes = group.map(id => nodeMap.get(id)).filter(Boolean);
      if (boxes.length < 2) return;
      const spreadX = Math.max(...boxes.map(box => box.centerX)) - Math.min(...boxes.map(box => box.centerX));
      const spreadY = Math.max(...boxes.map(box => box.centerY)) - Math.min(...boxes.map(box => box.centerY));
      const spreadTop = Math.max(...boxes.map(box => box.top)) - Math.min(...boxes.map(box => box.top));
      if (Math.min(spreadX, spreadY, spreadTop) > 2) result.nodeMisalignments += 1;
    });

    (SESSION_SYMMETRY_RULES[sessionId] || []).forEach(rule => {
      const decision = nodeMap.get(rule.decision);
      const left = nodeMap.get(rule.left);
      const right = nodeMap.get(rule.right);
      if (!decision || !left || !right) return;
      const yAligned = Math.abs(left.centerY - right.centerY) <= 2 || Math.abs(left.top - right.top) <= 2;
      const symmetric = Math.abs(Math.abs(decision.centerX - left.centerX) - Math.abs(right.centerX - decision.centerX)) <= 12;
      if (!yAligned || !symmetric) result.asymmetricalBranches += 1;
    });

    return result;
  }

  // Reconstruire les connecteurs afin qu’ils n’entrent plus dans les formes.
  // Les attributs inline stroke assurent visibilité et fonctionnement du SVG téléchargé seul.
  function rebuildEdges(svg, sessionId, nodeMap) {
    svg.querySelectorAll(".algorithm-connector,.algorithm-branch-label,.algorithm-layout-connectors").forEach(element => element.remove());
    ensureRoutingMarkers(svg);

    const layer = svgElement("g", { class: "algorithm-layout-connectors", "aria-hidden": "true" });
    const firstNode = svg.querySelector(".algorithm-node");
    if (firstNode) svg.insertBefore(layer, firstNode);
    else svg.appendChild(layer);

    const bounds = graphBounds(nodeMap);
    const warnings = [];
    const auditSummary = {
      ok: true,
      missingConnections: 0,
      missingArrowheads: 0,
      invalidDecisionInputs: 0,
      invalidDecisionOutputs: 0,
      decisionBottomOutputs: 0,
      reversedDecisionLabels: 0,
      ordinarySideEntries: 0,
      ordinarySideExits: 0,
      unnecessaryBends: 0,
      shortSegments: 0,
      nodeMisalignments: 0,
      asymmetricalBranches: 0,
      missingJunctionDots: 0,
      titleOverlaps: 0,
      blockCollisions: 0,
      nodeOverlaps: 0,
      labelCollisions: 0,
      zeroLengthSegments: 0,
      foldedSegments: 0,
      danglingConnectors: 0,
      ambiguousCrossings: 0,
      edgeCrossings: 0,
      connectionCount: 0,
      arrowheadCount: 0,
      renderedConnections: 0,
      junctionCount: 0,
      maxBends: 0,
      sideEntries: 0,
      sideExits: 0,
      blockOverlaps: 0
    };
    let extentRight = bounds.maxRight;
    const routedPaths = [];

    (SESSION_EDGES[sessionId] || []).forEach((definition, index) => {
      const source = nodeMap.get(definition.source);
      const target = nodeMap.get(definition.target);
      if (!source || !target) {
        auditSummary.missingConnections += 1;
        warnings.push(`liaison ${definition.source} → ${definition.target} incomplète`);
        return;
      }

      const geometry = route(source, target, definition, bounds, nodeMap, routedPaths);
      extentRight = Math.max(extentRight, geometry.extentRight || bounds.maxRight);
      auditSummary.connectionCount += 1;
      auditSummary.renderedConnections += 1;

      const portWarnings = connectionPortAudit(geometry.points, source, target, definition);
      Object.keys(portWarnings).forEach(key => {
        auditSummary[key] += portWarnings[key];
      });
      auditSummary.sideExits = auditSummary.ordinarySideExits;
      auditSummary.sideEntries = auditSummary.ordinarySideEntries;
      if (portWarnings.invalidDecisionInputs) warnings.push(`${definition.source} → ${definition.target} entre dans un losange par un port non conforme`);
      if (portWarnings.invalidDecisionOutputs) warnings.push(`${definition.source} → ${definition.target} sort d’un losange par un port non conforme`);
      if (portWarnings.decisionBottomOutputs) warnings.push(`${definition.source} → ${definition.target} sort sous un losange`);
      if (portWarnings.reversedDecisionLabels) warnings.push(`${definition.source} → ${definition.target} inverse Oui/Non`);
      if (portWarnings.ordinarySideExits) warnings.push(`${definition.source} → ${definition.target} sort d’un bloc ordinaire par un port non conforme`);
      if (portWarnings.ordinarySideEntries) warnings.push(`${definition.source} → ${definition.target} entre dans un bloc ordinaire par un port non conforme`);
      if (portWarnings.zeroLengthSegments) warnings.push(`${definition.source} → ${definition.target} contient un segment nul`);
      if (portWarnings.foldedSegments) warnings.push(`${definition.source} → ${definition.target} contient un segment replié`);
      if (portWarnings.danglingConnectors) warnings.push(`${definition.source} → ${definition.target} contient une liaison pendante`);

      const isLoop = definition.kind.startsWith("loop");
      const bends = countBends(geometry.points);
      const shortSegments = countShortSegments(geometry.points);
      const verticallyAligned = Math.abs(source.centerX - target.centerX) <= .5 && target.top > source.bottom;
      const bendLimit = isLoop ? 4 : source.isDecision ? 4 : 2;
      auditSummary.maxBends = Math.max(auditSummary.maxBends, bends);
      auditSummary.shortSegments += shortSegments;
      if ((verticallyAligned && bends > 0) || bends > bendLimit) {
        auditSummary.unnecessaryBends += 1;
        warnings.push(`${definition.source} → ${definition.target} contient ${bends} coude(s) inutile(s)`);
      }
      if (shortSegments) warnings.push(`${definition.source} → ${definition.target} contient un segment intermédiaire trop court`);

      const collisions = routingCollisions(geometry.points, definition.source, definition.target, nodeMap);
      if (collisions.length) {
        auditSummary.blockCollisions += collisions.length;
        warnings.push(`${definition.source} → ${definition.target} traverse ${collisions.join(", ")}`);
      }

      const markerEnd = isLoop ? "url(#algorithmLoopArrow)" : "url(#algorithmArrow)";
      const path = svgElement("path", {
        class: `algorithm-connector${isLoop ? " algorithm-loop-connector" : ""}`,
        d: geometry.d,
        "marker-end": markerEnd,
        "data-edge-index": index,
        "data-source": definition.source,
        "data-target": definition.target,
        "data-label": definition.label || "",
        ...(source.isDecision ? { "data-decision-branch": decisionBranch(definition.label) } : {}),
        "vector-effect": "non-scaling-stroke",
        // Attributs inline pour visibilité garantie et SVG standalone (téléchargement/impression)
        stroke: isLoop ? "#fde047" : "#67e8f9",
        "stroke-width": "5",
        "stroke-opacity": "0.92",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        ...(isLoop ? { "stroke-dasharray": "11 8" } : {})
      });
      if (path.hasAttribute("marker-end")) auditSummary.arrowheadCount += 1;
      else auditSummary.missingArrowheads += 1;
      layer.appendChild(path);
      routedPaths.push({ edge: `${definition.source}->${definition.target}`, points: geometry.points });

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

    const junctions = collectJunctionPoints(routedPaths);
    drawJunctionDots(layer, junctions);
    auditSummary.junctionCount = junctions.length;
    auditSummary.missingJunctionDots = layer.querySelectorAll(".algorithm-junction-dot").length === junctions.length ? 0 : junctions.length;
    if (auditSummary.missingJunctionDots) warnings.push("jonctions sans point visible");

    const layoutWarnings = layoutRuleAudit(sessionId, nodeMap);
    auditSummary.nodeMisalignments = layoutWarnings.nodeMisalignments;
    auditSummary.asymmetricalBranches = layoutWarnings.asymmetricalBranches;
    if (auditSummary.nodeMisalignments) warnings.push(`${auditSummary.nodeMisalignments} alignement(s) de blocs non conforme(s)`);
    if (auditSummary.asymmetricalBranches) warnings.push(`${auditSummary.asymmetricalBranches} branche(s) de décision asymétrique(s)`);

    auditSummary.titleOverlaps = svg.querySelectorAll(".algorithm-svg-title,.algorithm-svg-subtitle,title").length;
    if (auditSummary.titleOverlaps) warnings.push("titre encore présent dans le dessin SVG");

    if (auditSummary.arrowheadCount !== (SESSION_EDGES[sessionId] || []).length) {
      auditSummary.missingArrowheads += Math.abs((SESSION_EDGES[sessionId] || []).length - auditSummary.arrowheadCount);
      warnings.push("nombre de pointes de flèche non conforme");
    }

    const overlaps = blockOverlaps(nodeMap);
    auditSummary.nodeOverlaps = overlaps.length;
    auditSummary.blockOverlaps = overlaps.length;
    if (overlaps.length) warnings.push(`blocs superposés : ${overlaps.join(", ")}`);

    const labelHits = labelCollisions(layer, nodeMap);
    auditSummary.labelCollisions = labelHits.length;
    if (labelHits.length) warnings.push(`libellés superposés : ${labelHits.join(", ")}`);

    const crossings = countAmbiguousCrossings(routedPaths);
    auditSummary.ambiguousCrossings = crossings.length;
    auditSummary.edgeCrossings = crossings.length;
    if (crossings.length) warnings.push(`croisements ambigus : ${crossings.join(", ")}`);

    auditSummary.ok = warnings.length === 0;
    svg.dataset.routingAudit = warnings.length ? "warning" : "ok";
    svg.dataset.routingAuditSummary = JSON.stringify(auditSummary);
    if (warnings.length) console.warn(`TechnoQuest — séance ${sessionId} :`, warnings);
    return { bounds, extentRight, warnings, auditSummary };
  }

  function applyLayout(svg) {
    if (svg.dataset.layoutAuditVersion === VERSION) return;
    svg.dataset.layoutAuditVersion = VERSION;

    const card = svg.closest(".algorithm-premium-card");
    const sessionId = Number(card?.dataset.session || document.body.dataset.session || 0);
    if (!SESSION_EDGES[sessionId]) return;

    // Le titre est déjà présent dans l’en-tête de la carte : éviter sa répétition et le tooltip natif du SVG.
    const titleText = svg.querySelector("title")?.textContent || `Algorigramme de la séance ${sessionId}`;
    svg.querySelectorAll(".algorithm-svg-title,.algorithm-svg-subtitle,title,desc").forEach(element => element.remove());
    svg.removeAttribute("aria-labelledby");
    svg.setAttribute("aria-label", titleText);

    const nodes = [...svg.querySelectorAll(".algorithm-node")];
    const layout = SESSION_LAYOUTS[sessionId] || {};
    nodes.forEach(node => moveNode(node, layout[node.dataset.node]));
    if (sessionId === 1) card.classList.add("algorithm-layout-compact");

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
    card.dataset.algorithmRoutingAuditSummary = svg.dataset.routingAuditSummary;
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
