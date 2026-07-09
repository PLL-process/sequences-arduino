/*
 * TechnoQuest — huit algorigrammes SVG ultra premium.
 * Trois niveaux sont produits à partir des mêmes données : Guidé, Accompagné et Autonome.
 */
"use strict";

(() => {
  // Couleurs sémantiques partagées avec les cartes et le code.
  const NODE_COLORS = {
    start: ["#0d6b42", "#4ade80"],
    end: ["#0d6b42", "#4ade80"],
    process: ["#075985", "#38bdf8"],
    sensor: ["#075985", "#60a5fa"],
    decision: ["#6b21a8", "#c084fc"],
    safety: ["#9f1239", "#fb7185"],
    energy: ["#9a3412", "#fb923c"],
    communication: ["#0e7490", "#67e8f9"],
    memory: ["#854d0e", "#fde047"],
    maintenance: ["#92400e", "#fbbf24"]
  };

  // Définir les huit algorigrammes à partir des objectifs et programmes de référence.
  const ALGORITHMS = {
    1: {
      title: "Observer les signaux",
      subtitle: "Acquérir A0, A1 et A2, communiquer les mesures et maintenir D6 à LOW.",
      note: "Les trois entrées analogiques sont observées ; la chaîne de puissance reste volontairement inactive.",
      nodes: [
        n("start", 410, 50, "start", "Début", "Mise sous tension", "include"),
        n("setup", 390, 150, "process", "Initialiser", "Serial et D6", "serialBegin"),
        n("read", 390, 260, "sensor", "Lire A0, A1, A2", "Trois mesures", "readHumidity"),
        n("display", 390, 370, "communication", "Afficher", "Moniteur Série", "showHumidity"),
        n("safe", 390, 480, "safety", "Maintenir D6 à LOW", "Pompe arrêtée", "pumpStop"),
        n("wait", 390, 590, "process", "Attendre 1 seconde", "delay(1000)", "delay"),
        n("loop", 410, 700, "end", "Recommencer", "Retour dans loop()", "delay")
      ],
      edges: chain("start", "setup", "read", "display", "safe", "wait", "loop"),
      supportedMasks: ["display", "safe"],
      autonomousMasks: ["setup", "read", "display", "safe", "wait"]
    },
    2: {
      title: "Calibrer un seuil",
      subtitle: "Transformer une valeur analogique en information « sol sec » ou « sol humide ».",
      note: "Le seuil doit être choisi à partir de plusieurs mesures, et non d’une valeur isolée.",
      nodes: [
        n("start", 410, 45, "start", "Début", "Calibration", "include"),
        n("setup", 390, 140, "process", "Initialiser", "Serial, D6 et seuil", "thresholdHumidity"),
        n("read", 390, 250, "sensor", "Lire A0", "Humidité du sol", "readHumidity"),
        n("compare", 390, 365, "decision", "Humidité < seuil ?", "Décision", "compareHumidity", 200, 100),
        n("dry", 150, 510, "communication", "Afficher « Sol sec »", "Mesure interprétée", "showSoilState"),
        n("wet", 630, 510, "communication", "Afficher « Sol humide »", "Mesure interprétée", "showSoilState"),
        n("safe", 390, 640, "safety", "Maintenir la pompe arrêtée", "D6 = LOW", "pumpStop"),
        n("loop", 410, 750, "end", "Recommencer", "Nouvelle mesure", "delay")
      ],
      edges: [
        e("start", "setup"), e("setup", "read"), e("read", "compare"),
        e("compare", "dry", "Oui"), e("compare", "wet", "Non"),
        e("dry", "safe"), e("wet", "safe"), e("safe", "loop")
      ],
      supportedMasks: ["compare", "wet"],
      autonomousMasks: ["setup", "read", "compare", "dry", "wet", "safe"]
    },
    3: {
      title: "Relier information et énergie",
      subtitle: "La mesure A0 déclenche ou interdit une alimentation de puissance limitée dans le temps.",
      note: "Cet algorigramme complète les schémas des chaînes d’information et d’énergie ; il ne les remplace pas.",
      nodes: [
        n("start", 410, 45, "start", "Début", "Système sécurisé", "include"),
        n("read", 390, 150, "sensor", "Lire A0", "Chaîne d’information", "readHumidity"),
        n("compare", 390, 270, "decision", "Sol sec ?", "Comparer au seuil", "compareHumidity", 200, 100),
        n("pump", 145, 425, "energy", "Activer le relais", "Pompe pendant 3 s", "pumpStart"),
        n("stop", 635, 425, "safety", "Garder D6 à LOW", "Pompe arrêtée", "pumpStop"),
        n("cut", 145, 555, "safety", "Couper le relais", "Fin de l’arrosage", "pumpStop"),
        n("wait", 390, 680, "process", "Attendre 1 seconde", "Puis recommencer", "delay"),
        n("loop", 410, 785, "end", "Recommencer", "Boucle", "delay")
      ],
      edges: [
        e("start", "read"), e("read", "compare"), e("compare", "pump", "Oui"), e("compare", "stop", "Non"),
        e("pump", "cut"), e("cut", "wait"), e("stop", "wait"), e("wait", "loop")
      ],
      supportedMasks: ["compare", "cut"],
      autonomousMasks: ["read", "compare", "pump", "stop", "cut", "wait"]
    },
    4: {
      title: "Protéger la pompe",
      subtitle: "Donner la priorité au réservoir avant de décider l’arrosage.",
      note: "La condition de sécurité A2 est évaluée avant toute autorisation de puissance.",
      nodes: [
        n("start", 410, 35, "start", "Début", "Protection active", "include"),
        n("read", 390, 135, "sensor", "Lire A0 et A2", "Humidité + niveau", "readHumidity"),
        n("water", 390, 250, "decision", "Réservoir insuffisant ?", "Priorité sécurité", "compareWaterLow", 220, 105),
        n("alert", 95, 415, "safety", "Arrêter et alerter", "Marche à vide interdite", "alertWater"),
        n("soil", 610, 415, "decision", "Sol sec ET eau suffisante ?", "Condition AND", "compareHumidity", 235, 110),
        n("pump", 545, 585, "energy", "Arroser 3 secondes", "Puis arrêter", "pumpStart"),
        n("stop", 805, 585, "safety", "Rester arrêté", "D6 = LOW", "pumpStop"),
        n("wait", 390, 735, "process", "Attendre 1 seconde", "Nouvelle vérification", "delay"),
        n("loop", 410, 840, "end", "Recommencer", "Boucle sécurisée", "delay")
      ],
      edges: [
        e("start", "read"), e("read", "water"), e("water", "alert", "Oui"), e("water", "soil", "Non"),
        e("soil", "pump", "Oui"), e("soil", "stop", "Non"), e("pump", "wait"), e("stop", "wait"), e("alert", "wait"), e("wait", "loop")
      ],
      supportedMasks: ["water", "soil", "alert"],
      autonomousMasks: ["read", "water", "alert", "soil", "pump", "stop", "wait"]
    },
    5: {
      title: "Économiser l’eau avec une vraie hystérésis",
      subtitle: "Mémoriser l’état précédent de la pompe entre deux seuils distincts.",
      note: "Correction intégrée : la zone intermédiaire conserve explicitement l’état précédent de pompeActive.",
      nodes: [
        n("start", 410, 25, "start", "Début", "pompeActive = false", "rememberPumpState"),
        n("read", 390, 125, "sensor", "Lire A0 et A2", "Humidité + niveau", "readHumidity"),
        n("water", 390, 240, "decision", "Réservoir insuffisant ?", "Sécurité prioritaire", "compareWaterLow", 220, 105),
        n("forceStop", 75, 400, "safety", "pompeActive = false", "Arrêt immédiat", "pumpStop"),
        n("low", 610, 400, "decision", "Humidité < seuil bas ?", "Démarrage", "compareHumidity", 220, 105),
        n("startPump", 520, 560, "memory", "pompeActive = true", "Mémoriser marche", "rememberPumpState"),
        n("high", 760, 560, "decision", "Humidité > seuil haut ?", "Arrêt", "compareStop", 220, 105),
        n("stopPump", 540, 830, "memory", "pompeActive = false", "Mémoriser arrêt", "rememberPumpState"),
        n("keep", 850, 780, "memory", "Conserver pompeActive", "Entre seuils : état inchangé", "rememberPumpState", 240, 78),
        n("command", 390, 980, "energy", "Commander D6", "Selon pompeActive", "pumpStart"),
        n("wait", 390, 1095, "process", "Attendre 1 seconde", "Nouvelle mesure", "delay"),
        n("loop", 410, 1210, "end", "Recommencer", "Mémoire conservée", "delay")
      ],
      edges: [
        e("start", "read"), e("read", "water"), e("water", "forceStop", "Oui"), e("water", "low", "Non"),
        e("low", "startPump", "Oui"), e("low", "high", "Non"), e("high", "stopPump", "Oui"), e("high", "keep", "Non : état conservé"),
        e("forceStop", "command"), e("startPump", "command"), e("stopPump", "command"), e("keep", "command"),
        e("command", "wait"), e("wait", "loop")
      ],
      supportedMasks: ["water", "low", "high", "keep"],
      autonomousMasks: ["read", "water", "forceStop", "low", "startPump", "high", "stopPump", "keep", "command"]
    },
    6: {
      title: "Décider avec trois données",
      subtitle: "Associer humidité, niveau d’eau et luminosité dans une décision multicritère.",
      note: "La luminosité complète la décision ; elle ne remplace ni l’humidité ni la sécurité du réservoir.",
      nodes: [
        n("start", 410, 45, "start", "Début", "Trois capteurs", "include"),
        n("read", 390, 150, "sensor", "Lire A0, A1, A2", "Humidité, lumière, niveau", "readHumidity"),
        n("display", 390, 260, "communication", "Afficher les mesures", "Moniteur Série", "showHumidity"),
        n("decision", 380, 380, "decision", "Les 3 critères sont-ils vrais ?", "A0 ET A2 ET A1", "compareLight", 240, 110),
        n("pump", 155, 545, "energy", "Arroser 2 secondes", "Puis couper D6", "pumpStart"),
        n("stop", 650, 545, "safety", "Maintenir D6 à LOW", "Aucun arrosage", "pumpStop"),
        n("wait", 390, 690, "process", "Attendre 1 seconde", "Nouvelle décision", "delay"),
        n("loop", 410, 795, "end", "Recommencer", "Boucle", "delay")
      ],
      edges: [
        e("start", "read"), e("read", "display"), e("display", "decision"),
        e("decision", "pump", "Oui"), e("decision", "stop", "Non"), e("pump", "wait"), e("stop", "wait"), e("wait", "loop")
      ],
      supportedMasks: ["display", "decision", "stop"],
      autonomousMasks: ["read", "display", "decision", "pump", "stop", "wait"]
    },
    7: {
      title: "Diagnostiquer, recalibrer et maintenir",
      subtitle: "Organigramme de maintenance associé au programme de commande.",
      note: "Cette séance ajoute une démarche de diagnostic : observer, recalibrer, vérifier, puis conserver toutes les sécurités dans le programme.",
      nodes: [
        n("start", 410, 30, "start", "Début", "Maintenance", "include"),
        n("inspect", 390, 130, "maintenance", "Inspecter le capteur", "Corrosion, dérive, câblage", "thresholdHumidity"),
        n("calibrate", 390, 240, "maintenance", "Recalibrer A0", "Déterminer le nouveau seuil", "thresholdHumidity"),
        n("read", 390, 350, "sensor", "Lire A0 et A2", "Vérifier les mesures", "readHumidity"),
        n("plausible", 390, 470, "decision", "Mesures plausibles ?", "Diagnostic", "showHumidity", 210, 100),
        n("repair", 90, 625, "maintenance", "Corriger ou remplacer", "Puis recalibrer", "thresholdHumidity"),
        n("water", 630, 625, "decision", "Réservoir suffisant ET sol sec ?", "Commande sécurisée", "compareWaterEnough", 240, 110),
        n("pump", 565, 790, "energy", "Arroser 2 secondes", "Puis arrêter", "pumpStart"),
        n("stop", 820, 790, "safety", "Maintenir D6 à LOW", "Sécurité conservée", "pumpStop"),
        n("loop", 410, 930, "end", "Consigner et recommencer", "Maintenance préventive", "delay")
      ],
      edges: [
        e("start", "inspect"), e("inspect", "calibrate"), e("calibrate", "read"), e("read", "plausible"),
        e("plausible", "repair", "Non"), e("plausible", "water", "Oui"), e("repair", "calibrate"),
        e("water", "pump", "Oui"), e("water", "stop", "Non"), e("pump", "loop"), e("stop", "loop")
      ],
      supportedMasks: ["inspect", "plausible", "water"],
      autonomousMasks: ["inspect", "calibrate", "read", "plausible", "repair", "water", "pump", "stop"]
    },
    8: {
      title: "Défi ingénieur — prototype final fiable",
      subtitle: "Contrôler les valeurs incohérentes avant la sécurité du réservoir et avant l’arrosage.",
      note: "Correction intégrée : toute mesure hors de la plage 0–1023 provoque l’arrêt de la pompe et une alerte avant les autres décisions.",
      nodes: [
        n("start", 410, 25, "start", "Début", "Prototype final", "include"),
        n("read", 390, 125, "sensor", "Lire A0, A1, A2", "Trois mesures", "readHumidity"),
        n("coherent", 385, 245, "decision", "Mesures cohérentes ?", "Chaque valeur entre 0 et 1023", "checkCoherence", 230, 110),
        n("sensorError", 75, 410, "safety", "Arrêter et signaler", "Erreur capteur", "alertSensor"),
        n("water", 625, 410, "decision", "Réservoir insuffisant ?", "Sécurité A2", "compareWaterLow", 220, 105),
        n("waterError", 540, 570, "safety", "Arrêter et alerter", "Réservoir vide", "alertWater"),
        n("multi", 785, 570, "decision", "Sol sec ET lumière acceptable ?", "Décision finale", "compareLight", 230, 110),
        n("pump", 700, 735, "energy", "Arroser 2 secondes", "Puis couper D6", "pumpStart"),
        n("stop", 900, 735, "safety", "Maintenir D6 à LOW", "Pas d’arrosage", "pumpStop", 190, 76),
        n("display", 390, 865, "communication", "Afficher les résultats", "Mesures et alertes", "showHumidity"),
        n("wait", 390, 975, "process", "Attendre 1 seconde", "Nouvelle vérification", "delay"),
        n("loop", 410, 1080, "end", "Recommencer", "Boucle fiable", "delay")
      ],
      edges: [
        e("start", "read"), e("read", "coherent"), e("coherent", "sensorError", "Non"), e("coherent", "water", "Oui"),
        e("water", "waterError", "Oui"), e("water", "multi", "Non"), e("multi", "pump", "Oui"), e("multi", "stop", "Non"),
        e("sensorError", "display"), e("waterError", "display"), e("pump", "display"), e("stop", "display"),
        e("display", "wait"), e("wait", "loop")
      ],
      supportedMasks: ["coherent", "sensorError", "water", "multi"],
      autonomousMasks: ["read", "coherent", "sensorError", "water", "waterError", "multi", "pump", "stop", "display"]
    }
  };

  // Construire un nœud avec des dimensions par défaut.
  function n(id, x, y, type, label, caption, step, width = 220, height = 78) {
    return { id, x, y, type, label, caption, step, width, height };
  }

  // Construire une liaison entre deux nœuds.
  function e(source, target, label = "") {
    return { source, target, label };
  }

  // Construire une chaîne linéaire de liaisons.
  function chain(...ids) {
    return ids.slice(0, -1).map((id, index) => e(id, ids[index + 1]));
  }

  // Échapper les caractères réservés du XML.
  const escapeXml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  })[character]);

  // Diviser un texte en lignes courtes pour les éléments SVG.
  function wrapText(value, maximum = 26) {
    const words = String(value || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";

    words.forEach(word => {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maximum && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines.slice(0, 3);
  }

  // Calculer la hauteur requise par un diagramme.
  function diagramHeight(algorithm) {
    return Math.max(820, ...algorithm.nodes.map(node => node.y + node.height + 70));
  }

  // Produire le chemin orthogonal d’une liaison.
  function edgePath(source, target) {
    const startX = source.x + source.width / 2;
    const startY = source.y + source.height;
    const endX = target.x + target.width / 2;
    const endY = target.y;
    const middleY = startY + Math.max(28, (endY - startY) / 2);
    return `M ${startX} ${startY} V ${middleY} H ${endX} V ${endY}`;
  }

  // Produire les définitions graphiques intégrées au SVG et conservées au téléchargement.
  function svgDefinitions() {
    return `<defs>
      <linearGradient id="algorithmConnectorGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#38bdf8"/><stop offset=".55" stop-color="#67e8f9"/><stop offset="1" stop-color="#c084fc"/></linearGradient>
      ${gradient("Green", "#0b3b28", "#147d4c")}
      ${gradient("Blue", "#082f49", "#075985")}
      ${gradient("Violet", "#3b0764", "#7e22ce")}
      ${gradient("Rose", "#4c0519", "#9f1239")}
      ${gradient("Orange", "#431407", "#c2410c")}
      ${gradient("Cyan", "#083344", "#0e7490")}
      ${gradient("Yellow", "#422006", "#a16207")}
      ${gradient("Amber", "#451a03", "#b45309")}
      <filter id="algorithmSoftGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="algorithmStrongGlow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="8" result="blur"/><feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.15  0 1 0 0 0.65  0 0 1 0 0.95  0 0 0 1 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="algorithmArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#67e8f9"/></marker>
      <style>
        .algorithm-connector{fill:none;stroke:url(#algorithmConnectorGradient);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter:url(#algorithmSoftGlow)}
        .algorithm-branch-label{fill:#dff7ff;font:900 12px Arial;paint-order:stroke;stroke:#06111b;stroke-width:4px}
        .algorithm-node-shape{stroke-width:3}.algorithm-node-label{fill:#fff;font:950 14px Arial;text-anchor:middle;paint-order:stroke;stroke:rgba(3,9,15,.92);stroke-width:5px;stroke-linejoin:round}.algorithm-node-caption{fill:#d7edf5;font:750 11px Arial;text-anchor:middle;paint-order:stroke;stroke:rgba(3,9,15,.92);stroke-width:4px}.algorithm-node-number{fill:#05111b;font:950 11px Arial;text-anchor:middle;dominant-baseline:middle}.algorithm-node-number-disc{fill:#eafcff;stroke:#05111b;stroke-width:2}.algorithm-node--start .algorithm-node-shape,.algorithm-node--end .algorithm-node-shape{fill:url(#algorithmGreenGradient);stroke:#86efac}.algorithm-node--process .algorithm-node-shape,.algorithm-node--sensor .algorithm-node-shape{fill:url(#algorithmBlueGradient);stroke:#7dd3fc}.algorithm-node--decision .algorithm-node-shape{fill:url(#algorithmVioletGradient);stroke:#d8b4fe}.algorithm-node--safety .algorithm-node-shape{fill:url(#algorithmRoseGradient);stroke:#fda4af}.algorithm-node--energy .algorithm-node-shape{fill:url(#algorithmOrangeGradient);stroke:#fdba74}.algorithm-node--communication .algorithm-node-shape{fill:url(#algorithmCyanGradient);stroke:#a5f3fc}.algorithm-node--memory .algorithm-node-shape{fill:url(#algorithmYellowGradient);stroke:#fde68a}.algorithm-node--maintenance .algorithm-node-shape{fill:url(#algorithmAmberGradient);stroke:#fcd34d}
      </style>
    </defs>`;
  }

  // Construire un dégradé vertical.
  function gradient(name, first, second) {
    return `<linearGradient id="algorithm${name}Gradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${first}"/><stop offset="1" stop-color="${second}"/></linearGradient>`;
  }

  // Déterminer les nœuds à masquer selon le niveau sélectionné.
  function maskedNodes(algorithm, level) {
    if (level === "supported") return new Set(algorithm.supportedMasks || []);
    if (level === "autonomous") return new Set(algorithm.autonomousMasks || []);
    return new Set();
  }

  // Dessiner un nœud et son texte avec des halos lisibles mais mesurés.
  function renderNode(node, index, masked) {
    const centerX = node.x + node.width / 2;
    const centerY = node.y + node.height / 2;
    const hidden = masked.has(node.id);
    const label = hidden ? "À compléter" : node.label;
    const caption = hidden ? "________________" : node.caption;
    const labelLines = wrapText(label, node.type === "decision" ? 27 : 29);
    const captionLines = wrapText(caption, 34);
    const shape = node.type === "decision"
      ? `<polygon class="algorithm-node-shape" points="${centerX},${node.y} ${node.x + node.width},${centerY} ${centerX},${node.y + node.height} ${node.x},${centerY}"/>`
      : node.type === "start" || node.type === "end"
        ? `<rect class="algorithm-node-shape" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.height / 2}"/>`
        : `<rect class="algorithm-node-shape" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="18"/>`;
    const labelStart = centerY - (labelLines.length - 1) * 9 - (captionLines.length ? 7 : 0);
    const labelText = labelLines.map((line, lineIndex) => `<tspan x="${centerX}" dy="${lineIndex ? 18 : 0}">${escapeXml(line)}</tspan>`).join("");
    const captionStart = labelStart + labelLines.length * 18 + 3;
    const captionText = captionLines.map((line, lineIndex) => `<tspan x="${centerX}" dy="${lineIndex ? 15 : 0}">${escapeXml(line)}</tspan>`).join("");

    return `<g class="algorithm-node algorithm-node--${node.type}${hidden ? " is-masked" : ""}" data-node="${node.id}" data-step="${escapeXml(node.step || "")}" tabindex="0" role="button" aria-label="${escapeXml(label)}">
      ${shape}
      <circle class="algorithm-node-number-disc" cx="${node.x + 15}" cy="${node.y + 15}" r="12"/>
      <text class="algorithm-node-number" x="${node.x + 15}" y="${node.y + 15}">${index + 1}</text>
      <text class="algorithm-node-label" x="${centerX}" y="${labelStart}">${labelText}</text>
      <text class="algorithm-node-caption" x="${centerX}" y="${captionStart}">${captionText}</text>
    </g>`;
  }

  // Dessiner une liaison et son éventuel libellé Oui / Non.
  function renderEdge(edge, map) {
    const source = map.get(edge.source);
    const target = map.get(edge.target);
    if (!source || !target) return "";
    const path = edgePath(source, target);
    const startY = source.y + source.height;
    const endY = target.y;
    const labelX = (source.x + source.width / 2 + target.x + target.width / 2) / 2 + 8;
    const labelY = startY + Math.max(28, (endY - startY) / 2) - 7;
    return `<path class="algorithm-connector" d="${path}" marker-end="url(#algorithmArrow)"/>${edge.label ? `<text class="algorithm-branch-label" x="${labelX}" y="${labelY}">${escapeXml(edge.label)}</text>` : ""}`;
  }

  // Construire le SVG complet d’un niveau donné.
  function renderSvg(sessionId, algorithm, level) {
    const masked = maskedNodes(algorithm, level);
    const map = new Map(algorithm.nodes.map(node => [node.id, node]));
    const height = diagramHeight(algorithm);
    const nodes = algorithm.nodes.map((node, index) => renderNode(node, index, masked)).join("");
    const edges = algorithm.edges.map(edge => renderEdge(edge, map)).join("");
    return `<svg class="algorithm-premium-svg" viewBox="0 0 1100 ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="algorithmSvgTitle-${sessionId} algorithmSvgDesc-${sessionId}">
      ${svgDefinitions()}
      <title id="algorithmSvgTitle-${sessionId}">Algorigramme de la séance ${sessionId} — ${escapeXml(algorithm.title)}</title>
      <desc id="algorithmSvgDesc-${sessionId}">${escapeXml(algorithm.subtitle)}</desc>
      <text class="algorithm-svg-title" x="40" y="35">Séance ${sessionId} — ${escapeXml(algorithm.title)}</text>
      <text class="algorithm-svg-subtitle" x="40" y="57">${escapeXml(levelLabel(level))} · Clique sur un bloc pour retrouver le code associé.</text>
      ${edges}
      ${nodes}
    </svg>`;
  }

  // Donner un nom français au niveau.
  function levelLabel(level) {
    return level === "supported" ? "Niveau accompagné" : level === "autonomous" ? "Niveau autonome" : "Niveau guidé";
  }

  // Construire la banque de mots correspondant aux blocs masqués.
  function renderWordBank(algorithm, level) {
    const masked = maskedNodes(algorithm, level);
    if (!masked.size) return "";
    const labels = algorithm.nodes.filter(node => masked.has(node.id)).map(node => node.label);
    return `<div class="algorithm-word-bank"><strong>Banque de propositions :</strong>${labels.map(label => `<span>${escapeXml(label)}</span>`).join("")}</div>`;
  }

  // Construire l’interface complète autour du SVG.
  function componentHtml(sessionId, algorithm, level) {
    const correctionNotice = sessionId === 5
      ? "La véritable hystérésis mémorise pompeActive entre les deux seuils."
      : sessionId === 8
        ? "Le contrôle de cohérence est exécuté avant toute décision de puissance."
        : "Les couleurs distinguent acquisition, décision, sécurité, communication et énergie.";

    return `<div class="algorithm-premium-head">
      <div><p class="algorithm-premium-kicker">Partie Comprendre · Algorigramme interactif</p><h2>${escapeXml(algorithm.title)}</h2><p>${escapeXml(algorithm.subtitle)}</p></div>
      <span class="algorithm-premium-badge">✦ SVG imprimable</span>
    </div>
    <div class="algorithm-premium-toolbar">
      <div class="algorithm-levels" role="group" aria-label="Niveau de guidage de l’algorigramme">
        ${levelButton("guided", "Guidé", level)}
        ${levelButton("supported", "Accompagné", level)}
        ${levelButton("autonomous", "Autonome", level)}
      </div>
      <div class="algorithm-actions">
        <button class="algorithm-action-button" type="button" data-algorithm-action="play">▶ Animer</button>
        <button class="algorithm-action-button" type="button" data-algorithm-action="download">⇩ Télécharger SVG</button>
        <button class="algorithm-action-button" type="button" data-algorithm-action="print">🖨 Imprimer</button>
      </div>
    </div>
    <div class="algorithm-premium-stage">${renderSvg(sessionId, algorithm, level)}${renderWordBank(algorithm, level)}</div>
    <div class="algorithm-premium-foot"><p class="algorithm-premium-status"><strong>À retenir :</strong> ${escapeXml(correctionNotice)} ${escapeXml(algorithm.note)}</p><span class="algorithm-code-link">Bloc sélectionné ↔ ligne de code</span></div>`;
  }

  // Construire un bouton de niveau.
  function levelButton(level, label, selected) {
    return `<button class="algorithm-level-button${level === selected ? " is-active" : ""}" type="button" data-level="${level}" aria-pressed="${level === selected}">${label}</button>`;
  }

  // Rechercher ou créer la carte d’accueil de l’algorigramme.
  function locateCard(sessionId) {
    const existingFlow = document.getElementById("algorithmFlow");
    if (existingFlow) {
      const existingCard = existingFlow.closest("article,.tq-card,.fusion-algorithm-card") || existingFlow.parentElement;
      existingCard.classList.add("algorithm-premium-card");
      existingCard.dataset.session = String(sessionId);
      return existingCard;
    }

    const oldAlgorithm = document.querySelector(".algorithm");
    if (oldAlgorithm) {
      const oldCard = oldAlgorithm.closest("article.card") || oldAlgorithm;
      oldCard.classList.add("algorithm-premium-card");
      oldCard.dataset.session = String(sessionId);
      return oldCard;
    }

    const editor = document.getElementById("codeEditor");
    const editorCard = editor?.closest("article.card,article.tq-card,.tq-section") || editor?.parentElement;
    if (!editorCard?.parentNode) return null;

    const card = document.createElement("article");
    card.className = editorCard.classList.contains("tq-section") ? "tq-card algorithm-premium-card" : "card algorithm-premium-card";
    card.dataset.session = String(sessionId);
    editorCard.parentNode.insertBefore(card, editorCard);
    return card;
  }

  // Mettre à jour le composant après un changement de niveau.
  function renderComponent(card, sessionId, algorithm, level) {
    card.dataset.level = level;
    card.innerHTML = componentHtml(sessionId, algorithm, level);
    bindComponent(card, sessionId, algorithm, level);
  }

  // Relier les commandes du composant.
  function bindComponent(card, sessionId, algorithm, level) {
    card.querySelectorAll("[data-level]").forEach(button => {
      button.addEventListener("click", () => {
        const nextLevel = button.dataset.level;
        localStorage.setItem(`technoquest-algorithm-level-v1-s${sessionId}`, nextLevel);
        renderComponent(card, sessionId, algorithm, nextLevel);
      });
    });

    card.querySelector('[data-algorithm-action="play"]')?.addEventListener("click", () => playAlgorithm(card));
    card.querySelector('[data-algorithm-action="download"]')?.addEventListener("click", () => downloadSvg(card, sessionId, level));
    card.querySelector('[data-algorithm-action="print"]')?.addEventListener("click", () => printAlgorithm(card));

    card.querySelectorAll(".algorithm-node").forEach(node => {
      const activate = () => focusCodeLine(node.dataset.step, sessionId, card, node);
      node.addEventListener("click", activate);
      node.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  // Animer successivement les blocs pour rendre la logique visible.
  async function playAlgorithm(card) {
    if (card.classList.contains("is-playing")) return;
    const nodes = [...card.querySelectorAll(".algorithm-node")];
    card.classList.add("is-playing");

    for (const node of nodes) {
      nodes.forEach(item => item.classList.remove("is-active"));
      node.classList.add("is-active");
      await new Promise(resolve => window.setTimeout(resolve, 520));
    }

    nodes.forEach(item => item.classList.remove("is-active"));
    card.classList.remove("is-playing");
  }

  // Télécharger le SVG courant dans un fichier indépendant.
  function downloadSvg(card, sessionId, level) {
    const svg = card.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const source = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `technoquest-seance-${sessionId}-algorigramme-${level}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  // Imprimer uniquement la carte active depuis le navigateur.
  function printAlgorithm(card) {
    document.body.classList.add("algorithm-print-mode");
    card.classList.add("algorithm-print-target");
    const cleanup = () => {
      document.body.classList.remove("algorithm-print-mode");
      card.classList.remove("algorithm-print-target");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 1500);
  }

  // Retrouver la ligne de code associée à un bloc et y placer le curseur.
  function focusCodeLine(stepId, sessionId, card, selectedNode) {
    const editor = document.getElementById("codeEditor");
    const validator = window.TechnoQuestMissionValidator;
    if (!editor || !stepId) return;

    let lineIndex = 0;
    if (validator?.validate && validator?.findLineForStep) {
      const result = validator.validate(editor.value, sessionId);
      lineIndex = validator.findLineForStep(editor.value, stepId, result, sessionId, "edition");
    } else {
      lineIndex = Math.max(0, editor.value.split("\n").findIndex(line => line.toLowerCase().includes(stepId.toLowerCase())));
    }

    const lines = editor.value.split("\n");
    const safeIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));
    const start = lines.slice(0, safeIndex).reduce((sum, line) => sum + line.length + 1, 0);
    const end = start + (lines[safeIndex]?.length || 0);
    editor.focus({ preventScroll: true });
    editor.setSelectionRange(start, end);
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 24;
    editor.scrollTop = Math.max(0, safeIndex * lineHeight - editor.clientHeight * .35);
    editor.scrollIntoView({ behavior: "smooth", block: "center" });

    card.querySelectorAll(".algorithm-node").forEach(node => node.classList.toggle("is-active", node === selectedNode));
    window.setTimeout(() => selectedNode.classList.remove("is-active"), 1800);
  }

  // Initialiser la séance courante lorsque la page a terminé sa construction.
  function initialize() {
    const sessionId = Number(document.body.dataset.session || window.TechnoQuestSessionTemplateConfig?.id || 0);
    const algorithm = ALGORITHMS[sessionId];
    if (!algorithm) return;
    const card = locateCard(sessionId);
    if (!card) return;
    const saved = localStorage.getItem(`technoquest-algorithm-level-v1-s${sessionId}`);
    const level = ["guided", "supported", "autonomous"].includes(saved) ? saved : "guided";
    renderComponent(card, sessionId, algorithm, level);
  }

  // Attendre que parcours-premium.js et le template aient créé leur contenu.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(initialize, 40), { once: true });
  } else {
    window.setTimeout(initialize, 40);
  }
})();
