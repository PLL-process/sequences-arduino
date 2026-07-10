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
  const VERSION = "8";
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
      edge("high", "stopPump", "Oui"), edge("high", "keep", "Non : état conservé"),
      edge("forceStop", "command", "", "merge-left"), edge("startPump", "command", "", "merge-left"),
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
    start: { x: 380, y: 35 },
    setup: { x: 380, y: 155 },
    read: { x: 380, y: 275 },
    display: { x: 380, y: 395 },
    safe: { x: 380, y: 515 },
    wait: { x: 380, y: 635 },
    loop: { x: 380, y: 755 }
  };

  const SESSION_FIVE_LAYOUT = {
    stopPump: { x: 250, y: 900 }
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
      centerY: y + dy + height / 2,
      type: node.classList.contains("algorithm-node--decision") ? "decision" : "ordinary",
      isDecision: node.classList.contains("algorithm-node--decision")
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

  function placeDecisionLabel(label, routePoints) {
    const horizontalSegment = routePoints.slice(1).find((point, index) => {
      const previous = routePoints[index];
      return previous && previous.y === point.y && previous.x !== point.x;
    });
    const segmentIndex = routePoints.indexOf(horizontalSegment);
    const previous = segmentIndex > 0 ? routePoints[segmentIndex - 1] : routePoints[1];
    const first = previous || routePoints[0];
    const second = horizontalSegment || routePoints[1] || first;
    return {
      labelX: (first.x + second.x) / 2,
      labelY: first.y - 9,
      labelAnchor: "middle"
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
    const third = points[2];
    return first.x === second.x && second.y >= first.y &&
      (!third || (third.y === second.y && third.x !== second.x)) &&
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

    if (kind === "merge-left" && targetAnchor.y > sourceAnchor.y) {
      addExteriorCandidate(leftLane, 0);
      return routeFromCandidates(candidates, source, target, kind, nodeMap, "middle", validSequential, null, previousPaths);
    }

    if (targetAnchor.y > sourceAnchor.y) {
      const middleY = (sourceAnchor.y + targetAnchor.y) / 2;
      if (sourceAnchor.x === targetAnchor.x) addCandidate([sourceAnchor, targetAnchor], 0);
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
    const side = target.centerX < source.centerX ? "left" : target.centerX > source.centerX ? "right" : branch === "yes" ? "left" : "right";
    const lead = 30;
    const gap = PORT_GAP;
    const sourceAnchor = getBottomPort(source, gap);
    const targetAnchor = getTopPort(target, gap);
    const stemY = sourceAnchor.y + 22;
    const targetLeadY = approachYForTarget(target, targetAnchor, nodeMap, gap, lead);
    const targetLane = targetAnchor.x;
    const sideLane = side === "left"
      ? Math.min(targetLane, source.centerX - source.width * .58)
      : Math.max(targetLane, source.centerX + source.width * .58);
    const exterior = exteriorLane("", bounds, side);
    const oppositeExterior = exteriorLane("", bounds, side === "left" ? "right" : "left");
    const candidates = [];
    const addCandidate = (points, penalty = 0) => candidates.push({ points, penalty });

    addCandidate([
      sourceAnchor,
      { x: sourceAnchor.x, y: stemY },
      { x: targetLane, y: stemY },
      { x: targetLane, y: targetLeadY },
      targetAnchor
    ], 0);

    addCandidate([
      sourceAnchor,
      { x: sourceAnchor.x, y: stemY },
      { x: sideLane, y: stemY },
      { x: sideLane, y: targetLeadY },
      { x: targetAnchor.x, y: targetLeadY },
      targetAnchor
    ], 80);

    addCandidate([
      sourceAnchor,
      { x: sourceAnchor.x, y: stemY },
      { x: sourceAnchor.x, y: targetLeadY },
      { x: targetAnchor.x, y: targetLeadY },
      targetAnchor
    ], 90);

    const lowMergeY = Math.max(targetLeadY, targetAnchor.y - 8);
    addCandidate([
      sourceAnchor,
      { x: sourceAnchor.x, y: stemY },
      { x: sourceAnchor.x, y: lowMergeY },
      { x: targetAnchor.x, y: lowMergeY },
      targetAnchor
    ], 110);

    addCandidate([
      sourceAnchor,
      { x: sourceAnchor.x, y: stemY },
      { x: exterior, y: stemY },
      { x: exterior, y: targetLeadY },
      { x: targetAnchor.x, y: targetLeadY },
      targetAnchor
    ], 420);

    addCandidate([
      sourceAnchor,
      { x: sourceAnchor.x, y: stemY },
      { x: sideLane, y: stemY },
      { x: sideLane, y: stemY + lead },
      { x: oppositeExterior, y: stemY + lead },
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
      points => placeDecisionLabel(label, points),
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
    const sourceBottom = getBottomPort(source, PORT_GAP);
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

    if (!near(first, sourceBottom, tolerance) || second.x !== first.x || second.y < first.y) {
      result.ordinarySideExits += 1;
    }

    const nearTargetSide = Math.min(Math.abs(last.x - target.left), Math.abs(last.x - target.right)) <= 2;
    if (!near(last, targetTop, tolerance) || previous.x !== last.x || previous.y > last.y || nearTargetSide) {
      result.ordinarySideEntries += 1;
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
      blockCollisions: 0,
      nodeOverlaps: 0,
      labelCollisions: 0,
      zeroLengthSegments: 0,
      foldedSegments: 0,
      danglingConnectors: 0,
      ambiguousCrossings: 0,
      edgeCrossings: 0,
      connectionCount: 0,
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

      const collisions = routingCollisions(geometry.points, definition.source, definition.target, nodeMap);
      if (collisions.length) {
        auditSummary.blockCollisions += collisions.length;
        warnings.push(`${definition.source} → ${definition.target} traverse ${collisions.join(", ")}`);
      }

      const isLoop = definition.kind.startsWith("loop");
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
      if (!markerEnd) auditSummary.missingArrowheads += 1;
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

    // Le titre est déjà présent dans l’en-tête de la carte : éviter sa répétition dans le dessin.
    svg.querySelectorAll(".algorithm-svg-title,.algorithm-svg-subtitle").forEach(element => element.remove());

    const nodes = [...svg.querySelectorAll(".algorithm-node")];
    if (sessionId === 1) {
      nodes.forEach(node => moveNode(node, SESSION_ONE_LAYOUT[node.dataset.node]));
      card.classList.add("algorithm-layout-compact");
    }
    if (sessionId === 5) {
      nodes.forEach(node => moveNode(node, SESSION_FIVE_LAYOUT[node.dataset.node]));
    }
    separateOverlappingNodes(nodes);

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
