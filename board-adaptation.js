/* Adapte le TP à l'Arduino UNO R3 et à l'Arduino UNO R4 Minima. */
"use strict";

(() => {
  const STORAGE_KEY = "technoquest-board-choice-v1";
  const configs = {
    r3: {
      name: "Arduino UNO R3",
      sceneName: "Arduino UNO R3",
      mcu: "ATmega328P — architecture AVR 8 bits",
      clock: "16 MHz",
      usb: "USB Type-B",
      defaultBits: 10,
      allowedBits: [10],
      ide: "Outils → Type de carte → Arduino AVR Boards → Arduino Uno",
      note: "Les six entrées analogiques A0 à A5 délivrent directement des valeurs sur 10 bits, donc de 0 à 1023.",
      setupResolution: ""
    },
    r4: {
      name: "Arduino UNO R4 Minima",
      sceneName: "Arduino UNO R4",
      mcu: "Renesas RA4M1 — architecture Arm Cortex-M4 32 bits",
      clock: "48 MHz",
      usb: "USB-C",
      defaultBits: 14,
      allowedBits: [10, 14],
      ide: "Outils → Type de carte → Arduino UNO R4 Boards → Arduino UNO R4 Minima",
      note: "Les six entrées analogiques peuvent fonctionner jusqu'à 14 bits. Le mode 10 bits peut être conservé pour comparer directement les résultats avec l'UNO R3.",
      setupResolution: bits => `  analogReadResolution(${bits}); // résolution choisie pour l'ADC\n`
    }
  };

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (error) { saved = {}; }
  let boardKey = saved.board === "r3" ? "r3" : "r4";
  let bits = configs[boardKey].allowedBits.includes(Number(saved.bits)) ? Number(saved.bits) : configs[boardKey].defaultBits;

  const style = document.createElement("style");
  style.id = "technoquest-board-adaptation-styles";
  style.textContent = `
    .board-adapter{margin:1rem 0;padding:1rem;border:1px solid var(--border);border-radius:16px;background:#071d17}
    .board-adapter h3{margin:.1rem 0 .7rem;color:var(--yellow)}
    .board-selector-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
    .board-selector-grid label{display:grid;gap:.35rem;color:var(--muted)}
    .board-selector-grid select{width:100%}
    .board-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.65rem;margin-top:.8rem}
    .board-summary article{padding:.7rem;border:1px solid var(--border);border-radius:11px;background:var(--soft)}
    .board-summary span{display:block;color:var(--muted);font-size:.8rem}.board-summary strong{display:block;margin-top:.25rem;color:var(--text)}
    .board-common{margin:.8rem 0 0;padding:.7rem;border-left:4px solid var(--green);background:#0b2b21;line-height:1.5}
    .board-code{margin-top:.8rem}.board-code summary{cursor:pointer;color:var(--blue);font-weight:bold}
    .board-code pre{white-space:pre-wrap;overflow:auto;padding:.8rem;border:1px solid var(--border);border-radius:10px;background:#030d0a;color:#ddfff0}
    .board-ide-note{margin:.7rem 0 0;padding:.7rem;border:1px solid #ffd16677;border-radius:10px;background:#30270b;color:#fff0bd;line-height:1.5}
    .hardware-board-notice{margin:.8rem 0;padding:.8rem;border:1px solid var(--blue);border-radius:12px;background:#092832;line-height:1.5}
    .board-comparison{width:100%;border-collapse:collapse;margin-top:.8rem;font-size:.88rem}.board-comparison th,.board-comparison td{padding:.55rem;border:1px solid var(--border);text-align:left}.board-comparison th{color:var(--yellow);background:#0b2b21}
    @media(max-width:700px){.board-selector-grid{grid-template-columns:1fr}.board-comparison{font-size:.78rem}}
  `;
  document.head.appendChild(style);

  const anchor = document.querySelector(".adc-learning-card") || document.querySelector(".adc-note") || document.querySelector(".digital-twin-dashboard");
  if (!anchor) return;

  const panel = document.createElement("section");
  panel.className = "board-adapter";
  panel.setAttribute("aria-labelledby", "boardAdapterTitle");
  panel.innerHTML = `
    <h3 id="boardAdapterTitle">Adapter le TP à la carte disponible</h3>
    <div class="board-selector-grid">
      <label>Carte utilisée
        <select id="boardChoice">
          <option value="r4">Arduino UNO R4 Minima</option>
          <option value="r3">Arduino UNO R3</option>
        </select>
      </label>
      <label>Résolution de la conversion analogique
        <select id="boardResolution"></select>
      </label>
    </div>
    <div id="boardSummary" class="board-summary"></div>
    <p class="board-common"><strong>Montage commun aux deux cartes :</strong> capteur d'humidité sur A0, capteur de lumière sur A1, capteur de niveau sur A2 et relais sur D6. Le programme Python pédagogique reste identique, car il utilise des pourcentages calibrés de 0 à 100 %.</p>
    <table class="board-comparison">
      <thead><tr><th>Élément</th><th>UNO R3</th><th>UNO R4 Minima</th></tr></thead>
      <tbody>
        <tr><td>Microcontrôleur</td><td>ATmega328P, AVR 8 bits</td><td>Renesas RA4M1, Arm 32 bits</td></tr>
        <tr><td>Entrées analogiques</td><td>6 entrées, A0 à A5</td><td>6 entrées, A0 à A5</td></tr>
        <tr><td>Résolution analogique</td><td>10 bits : 0 à 1023</td><td>jusqu'à 14 bits : 0 à 16383</td></tr>
        <tr><td>Tension logique</td><td>5 V</td><td>5 V</td></tr>
        <tr><td>Connexion USB</td><td>USB Type-B</td><td>USB-C</td></tr>
      </tbody>
    </table>
    <p id="boardIdeNote" class="board-ide-note"></p>
    <details class="board-code">
      <summary>Voir l'adaptation du programme Arduino réel en C++</summary>
      <p>Le pseudo-Python sert à apprendre l'algorithme. Le téléversement sur la carte réelle utilise le langage Arduino, fondé sur le C++.</p>
      <pre><code id="boardCppCode"></code></pre>
    </details>`;
  anchor.insertAdjacentElement("beforebegin", panel);

  const boardChoice = document.getElementById("boardChoice");
  const resolutionChoice = document.getElementById("boardResolution");
  const summary = document.getElementById("boardSummary");
  const ideNote = document.getElementById("boardIdeNote");
  const cppCode = document.getElementById("boardCppCode");

  const hardwareTab = document.getElementById("hardware");
  const hardwareNotice = document.createElement("section");
  hardwareNotice.className = "hardware-board-notice";
  const wiring = hardwareTab?.querySelector(".wiring-diagram");
  if (wiring) wiring.insertAdjacentElement("beforebegin", hardwareNotice);

  function maximum() { return Math.pow(2, bits) - 1; }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify({board: boardKey, bits})); }

  function cppProgram() {
    const config = configs[boardKey];
    const resolutionLine = boardKey === "r4" ? config.setupResolution(bits) : "";
    return `// Programme réel compatible avec ${config.name}\nconst byte CAPTEUR_HUMIDITE = A0;\nconst byte CAPTEUR_LUMIERE = A1;\nconst byte CAPTEUR_NIVEAU = A2;\nconst byte RELAIS_POMPE = 6;\n\n// Valeurs à relever pendant la calibration\nconst int BRUT_SEC = ${boardKey === "r3" ? "850" : bits === 14 ? "13600" : "850"};\nconst int BRUT_HUMIDE = ${boardKey === "r3" ? "350" : bits === 14 ? "5600" : "350"};\n\nfloat calibrerHumidite(int brut) {\n  float pourcentage = 100.0 * (brut - BRUT_SEC) / (BRUT_HUMIDE - BRUT_SEC);\n  return constrain(pourcentage, 0.0, 100.0);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(RELAIS_POMPE, OUTPUT);\n  digitalWrite(RELAIS_POMPE, LOW);\n${resolutionLine}}\n\nvoid loop() {\n  int brutHumidite = analogRead(CAPTEUR_HUMIDITE);\n  int brutLumiere = analogRead(CAPTEUR_LUMIERE);\n  int brutNiveau = analogRead(CAPTEUR_NIVEAU);\n  float humidite = calibrerHumidite(brutHumidite);\n\n  bool solSec = humidite < 35.0;\n  bool reservoirSuffisant = brutNiveau > 0; // seuil à calibrer réellement\n\n  if (solSec && reservoirSuffisant) {\n    digitalWrite(RELAIS_POMPE, HIGH);\n    delay(2000);\n  }\n  digitalWrite(RELAIS_POMPE, LOW);\n  delay(500);\n}`;
  }

  function renderAdcLearning() {
    const card = document.querySelector(".adc-learning-card");
    if (!card) return;
    const config = configs[boardKey];
    const max = maximum();
    const mid = Math.round(max / 2);
    card.innerHTML = `
      <strong>À retenir — ${config.name}</strong>
      <p>Un capteur produit une tension analogique. L'<abbr title="Analog-to-Digital Converter — convertisseur analogique-numérique (CAN)">ADC</abbr> la transforme en un nombre numérique.</p>
      <p>Avec une résolution de <strong>${bits} bits</strong>, il existe <strong>${max + 1} niveaux</strong>, numérotés de 0 à ${max} :</p>
      <ul><li><strong>0</strong> ≈ 0 V ;</li><li><strong>${mid}</strong> ≈ 2,5 V ;</li><li><strong>${max}</strong> ≈ 5 V.</li></ul>
      <p class="adc-formula"><code>valeur numérique ≈ tension ÷ 5 × ${max}</code></p>
      <p>${config.note}</p>
      <p class="adc-warning"><strong>Après calibration :</strong> les nombres bruts propres à chaque carte sont convertis en un même indice d'humidité de 0 à 100 %. Les missions peuvent donc utiliser le même pseudo-Python.</p>`;
  }

  function updateRawMetrics() {
    const max = maximum();
    const mapping = [
      ["humidity", "metricHumidityRaw"],
      ["reservoir", "metricReservoirRaw"],
      ["light", "metricLightRaw"]
    ];
    mapping.forEach(([inputId, outputId]) => {
      const input = document.getElementById(inputId);
      const output = document.getElementById(outputId);
      if (!input || !output || /Erreur|incohérente/i.test(output.textContent)) return;
      const raw = Math.round((Number(input.value) || 0) / 100 * max);
      output.textContent = `ADC ${bits} bits : ${raw} / ${max}`;
    });
  }

  function replaceVisibleBoardNames(root = document) {
    const config = configs[boardKey];
    const controller = document.querySelector(".controller-block");
    if (controller) controller.innerHTML = `${config.name}<br><strong>Traitement</strong>`;

    document.querySelectorAll("#chainChallenge .chain-row strong").forEach(element => {
      if (/Arduino UNO/i.test(element.textContent)) element.textContent = config.name;
    });

    document.querySelectorAll(".hardware-overlay text").forEach(element => {
      if (/Arduino UNO R[34]/i.test(element.textContent)) element.textContent = config.sceneName;
    });

    document.querySelectorAll("#hardwareSteps li").forEach(item => {
      item.innerHTML = item.innerHTML
        .replace(/Arduino Uno R4 Minima/gi, config.name)
        .replace(/Arduino UNO R4 Minima/gi, config.name);
    });
  }

  function render() {
    const config = configs[boardKey];
    boardChoice.value = boardKey;
    resolutionChoice.innerHTML = config.allowedBits.map(value => `<option value="${value}" ${value === bits ? "selected" : ""}>${value} bits — 0 à ${Math.pow(2, value) - 1}</option>`).join("");
    resolutionChoice.disabled = config.allowedBits.length === 1;
    summary.innerHTML = `
      <article><span>Carte sélectionnée</span><strong>${config.name}</strong></article>
      <article><span>Microcontrôleur</span><strong>${config.mcu}</strong></article>
      <article><span>Fréquence</span><strong>${config.clock}</strong></article>
      <article><span>Résolution utilisée</span><strong>${bits} bits · 0 à ${maximum()}</strong></article>`;
    ideNote.innerHTML = `<strong>Avant le téléversement :</strong> dans l'IDE Arduino, sélectionner <em>${config.ide}</em>, puis choisir le port correspondant. Utiliser un câble ${config.usb}.`;
    hardwareNotice.innerHTML = `<strong>Carte choisie : ${config.name}</strong><br>Les branchements restent A0, A1, A2 et D6. Résolution utilisée pour les mesures brutes : ${bits} bits, soit 0 à ${maximum()}.`;
    cppCode.textContent = cppProgram();
    renderAdcLearning();
    replaceVisibleBoardNames();
    updateRawMetrics();
    save();
  }

  boardChoice.addEventListener("change", event => {
    boardKey = event.target.value === "r3" ? "r3" : "r4";
    bits = configs[boardKey].defaultBits;
    render();
  });
  resolutionChoice.addEventListener("change", event => {
    const requested = Number(event.target.value);
    if (configs[boardKey].allowedBits.includes(requested)) bits = requested;
    render();
  });

  const observer = new MutationObserver(() => {
    replaceVisibleBoardNames();
    updateRawMetrics();
  });
  observer.observe(document.body, {childList:true, subtree:true});
  window.setInterval(updateRawMetrics, 250);
  render();
})();
