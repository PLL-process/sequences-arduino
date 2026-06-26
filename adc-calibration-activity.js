/* Mission 2 : convertir une valeur ADC en tension et choisir un seuil par calibration. */
"use strict";

(() => {
  if (typeof missions === "undefined" || typeof state === "undefined") return;
  const analysis = document.getElementById("analysis");
  if (!analysis || document.getElementById("adcCalibrationActivity")) return;

  const missionIndex = 1;
  const mission = missions[missionIndex];
  if (!mission.checks.some(check => /conversion ADC/i.test(check[0]))) {
    mission.checks.splice(3, 0, ["Le tableau de conversion ADC et la calibration du seuil sont validés.", (_, s) => !!s.adcCalibration]);
  }
  if (!mission.hardware.some(step => /tension.*ADC/i.test(step))) {
    mission.hardware.splice(2, 0, "Convertir les valeurs ADC en tensions et compléter le tableau de calibration.");
  }

  const style = document.createElement("style");
  style.id = "technoquest-adc-calibration-styles";
  style.textContent = `
    .adc-calibration{margin:0 0 1rem;padding:1rem;border:1px solid var(--border);border-radius:17px;background:#071d17}
    .adc-calibration[hidden]{display:none!important}.adc-calibration h3{margin:.1rem 0 .5rem;color:var(--yellow)}
    .adc-calibration h4{margin:1rem 0 .5rem;color:var(--blue)}.adc-calibration p{line-height:1.55}
    .adc-important{padding:.8rem;border-left:5px solid var(--yellow);border-radius:11px;background:#352b0c;color:#fff1bd}
    .adc-important strong{color:#fff}.adc-formulas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin:.8rem 0}
    .adc-formula-card{padding:.8rem;border:1px solid var(--border);border-radius:12px;background:var(--soft)}
    .adc-formula-card strong{display:block;color:var(--text);margin-bottom:.35rem}.adc-formula-card code{font-size:1rem;color:#eafff3}
    .adc-settings{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin:.8rem 0}
    .adc-settings label{display:grid;gap:.35rem;color:var(--muted)}.adc-settings select,.adc-settings input{width:100%}
    .adc-table-wrap{overflow:auto;border:1px solid var(--border);border-radius:12px;background:#061813}
    .adc-table{width:100%;border-collapse:collapse;min-width:650px}.adc-table th,.adc-table td{padding:.55rem;border:1px solid var(--border);text-align:center}
    .adc-table th{background:#0d2b23;color:var(--yellow)}.adc-table td:first-child{text-align:left;color:var(--text);font-weight:700}
    .adc-table input{width:100%;min-width:90px}.adc-auto{color:#b9d5c9;font-family:Consolas,monospace}
    .adc-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin:.8rem 0}
    .adc-summary article{padding:.75rem;border:1px solid var(--border);border-radius:11px;background:var(--soft)}
    .adc-summary span{display:block;color:var(--muted);font-size:.8rem}.adc-summary strong{display:block;margin-top:.25rem;color:var(--text)}
    .adc-threshold-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin:.8rem 0}.adc-threshold-grid label{display:grid;gap:.35rem;color:var(--muted)}
    .adc-quiz{display:grid;gap:.65rem;margin:.8rem 0}.adc-quiz label{display:grid;gap:.35rem;padding:.7rem;border:1px solid var(--border);border-radius:11px;background:var(--soft)}
    .adc-actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.8rem}.adc-actions button{flex:1 1 170px}
    .adc-feedback{min-height:1.5rem;margin:.7rem 0 0;font-weight:700}.adc-feedback.ok{color:#9ff2b9}.adc-feedback.no{color:#ffaaa2}
    .adc-correction-panel{display:none;margin-top:.8rem;padding:.9rem;border:1px solid #e8bb55;border-radius:12px;background:#171d18;line-height:1.55}.adc-correction-panel.open{display:block}.adc-correction-panel h4{color:var(--yellow)}
    @media(max-width:760px){.adc-formulas,.adc-settings,.adc-summary,.adc-threshold-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.id = "adcCalibrationActivity";
  section.className = "adc-calibration";
  section.hidden = true;
  section.innerHTML = `
    <h3>Mission 2 — Du nombre ADC à la tension puis au seuil</h3>
    <p>Le capteur envoie une <strong>tension analogique</strong>. L’<abbr title="Analog-to-Digital Converter — convertisseur analogique-numérique (CAN)">ADC</abbr> la mesure et la transforme en un nombre entier. Le programme peut ensuite comparer ce nombre, ou une valeur calibrée en pourcentage, à un seuil.</p>
    <p class="adc-important"><strong>Vocabulaire :</strong> cette activité concerne l’<strong>ADC — Analog-to-Digital Converter — convertisseur analogique-numérique (CAN)</strong>. Le <strong>DAC — Digital-to-Analog Converter — convertisseur numérique-analogique (CNA)</strong> réalise l’opération inverse et n’est pas utilisé pour lire le capteur.</p>

    <div class="adc-formulas">
      <article class="adc-formula-card"><strong>Retrouver la tension</strong><code>V ≈ valeur ADC ÷ (2ⁿ − 1) × Vref</code></article>
      <article class="adc-formula-card"><strong>Retrouver la valeur numérique</strong><code>valeur ADC ≈ V ÷ Vref × (2ⁿ − 1)</code></article>
    </div>

    <div class="adc-settings">
      <label>Résolution étudiée
        <select id="adcBits"><option value="10">10 bits — UNO R3</option><option value="14">14 bits — UNO R4 Minima</option><option value="16">16 bits — extension théorique</option></select>
      </label>
      <label>Tension de référence Vref
        <input id="adcVref" type="number" min="1" max="5" step="0.1" value="5">
      </label>
      <label>Valeur numérique maximale
        <input id="adcMaximum" type="text" readonly>
      </label>
    </div>
    <p id="adcHardwareNote" class="help"></p>

    <h4>1. Vérifier la conversion d’une valeur numérique en tension</h4>
    <p>Calcule les tensions, puis saisis-les avec deux décimales. Une petite différence due à l’arrondi est acceptée.</p>
    <div class="adc-table-wrap"><table class="adc-table">
      <thead><tr><th>Situation</th><th>Valeur ADC</th><th>Calcul attendu</th><th>Tension trouvée par l’élève</th></tr></thead>
      <tbody id="adcConversionRows"></tbody>
    </table></div>

    <h4>2. Calibrer le capteur pour choisir un seuil</h4>
    <p>Réalise cinq mesures en sol sec et cinq mesures en sol humide. Le tableau calcule automatiquement la tension correspondante. Le seuil choisi doit se situer entre les deux groupes de mesures, quelle que soit la direction de variation du capteur.</p>
    <div class="adc-table-wrap"><table class="adc-table">
      <thead><tr><th>Essai</th><th>Milieu</th><th>Valeur ADC relevée</th><th>Tension calculée</th></tr></thead>
      <tbody id="adcCalibrationRows"></tbody>
    </table></div>

    <div class="adc-summary">
      <article><span>Moyenne en sol sec</span><strong id="adcDryMean">—</strong></article>
      <article><span>Moyenne en sol humide</span><strong id="adcWetMean">—</strong></article>
      <article><span>Milieu mathématique proposé</span><strong id="adcSuggestedThreshold">—</strong></article>
    </div>
    <div class="adc-threshold-grid">
      <label>Seuil ADC choisi par l’élève
        <input id="adcStudentThreshold" type="number" min="0" step="1" placeholder="Ex. : 600">
      </label>
      <label>Tension correspondant à ce seuil
        <input id="adcStudentThresholdVoltage" type="number" min="0" max="5" step="0.01" placeholder="Ex. : 2,93">
      </label>
    </div>

    <h4>3. Vérifier la compréhension</h4>
    <div class="adc-quiz">
      <label>Que signifie ADC ?
        <select id="adcQuizMeaning"><option value="">Choisir</option><option value="adc">Analog-to-Digital Converter — convertisseur analogique-numérique</option><option value="dac">Digital-to-Analog Converter — convertisseur numérique-analogique</option></select>
      </label>
      <label>Quelle est la valeur maximale pour une résolution de n bits ?
        <select id="adcQuizMaximum"><option value="">Choisir</option><option value="power">2ⁿ − 1</option><option value="powerOnly">2ⁿ</option><option value="bits">n × 1023</option></select>
      </label>
      <label>Pour 600 sur 1023 avec Vref = 5 V, la tension est environ :
        <select id="adcQuizExample"><option value="">Choisir</option><option value="2.93">2,93 V</option><option value="3.41">3,41 V</option><option value="0.60">0,60 V</option></select>
      </label>
    </div>

    <div class="adc-actions">
      <button id="adcLoadExample" type="button">Charger un jeu d’essai</button>
      <button id="adcCalculate" type="button">Calculer les moyennes</button>
      <button id="adcValidate" class="primary" type="button">✓ Valider l’activité</button>
      <button id="adcCorrection" class="correction-button" type="button">📘 Correction complète</button>
    </div>
    <p id="adcFeedback" class="adc-feedback" aria-live="polite"></p>
    <section id="adcCorrectionPanel" class="adc-correction-panel"></section>`;

  const firstChallenge = analysis.querySelector(".analysis-challenge");
  if (firstChallenge) analysis.insertBefore(section, firstChallenge);
  else analysis.prepend(section);

  const $ = id => document.getElementById(id);
  const bitsInput = $("adcBits");
  const vrefInput = $("adcVref");
  const maxInput = $("adcMaximum");
  const conversionBody = $("adcConversionRows");
  const calibrationBody = $("adcCalibrationRows");
  const dryMeanOutput = $("adcDryMean");
  const wetMeanOutput = $("adcWetMean");
  const suggestedOutput = $("adcSuggestedThreshold");
  const thresholdInput = $("adcStudentThreshold");
  const thresholdVoltageInput = $("adcStudentThresholdVoltage");
  const feedback = $("adcFeedback");
  const correctionPanel = $("adcCorrectionPanel");

  function bits() { return Number(bitsInput.value) || 10; }
  function vref() { return Number(vrefInput.value) || 5; }
  function maximum() { return Math.pow(2, bits()) - 1; }
  function voltage(value) { return Number(value) / maximum() * vref(); }
  function formatVoltage(value) { return Number.isFinite(value) ? `${value.toFixed(2)} V` : "—"; }
  function missionState() { return state.missions[missionIndex]; }

  function conversionValues() {
    const max = maximum();
    return [
      {label:"Début de l’échelle", value:0},
      {label:"Quart de l’échelle", value:Math.round(max * .25)},
      {label:"Milieu de l’échelle", value:Math.round(max * .5)},
      {label:"Exemple équivalent à 600/1023", value:Math.round(max * 600 / 1023)},
      {label:"Fin de l’échelle", value:max}
    ];
  }

  function renderConversionTable(savedAnswers = []) {
    conversionBody.innerHTML = conversionValues().map((row, index) => `
      <tr><td>${row.label}</td><td class="adc-auto">${row.value}</td><td class="adc-auto">${row.value} ÷ ${maximum()} × ${vref().toFixed(1)}</td><td><input class="adc-voltage-answer" data-value="${row.value}" type="number" min="0" max="${vref()}" step="0.01" value="${savedAnswers[index] ?? ""}" aria-label="Tension pour la valeur ${row.value}"></td></tr>`).join("");
  }

  function renderCalibrationTable(savedValues = []) {
    const rows = [];
    for (let i = 0; i < 10; i += 1) {
      const medium = i < 5 ? "Sol sec" : "Sol humide";
      rows.push(`<tr><td>Essai ${i % 5 + 1}</td><td>${medium}</td><td><input class="adc-raw-measure" data-index="${i}" type="number" min="0" max="${maximum()}" step="1" value="${savedValues[i] ?? ""}" aria-label="${medium}, essai ${i % 5 + 1}"></td><td class="adc-auto adc-measure-voltage">—</td></tr>`);
    }
    calibrationBody.innerHTML = rows.join("");
    calibrationBody.querySelectorAll(".adc-raw-measure").forEach(input => input.addEventListener("input", () => { updateMeasurementVoltages(); saveData(); }));
    updateMeasurementVoltages();
  }

  function updateMeasurementVoltages() {
    calibrationBody.querySelectorAll("tr").forEach(row => {
      const input = row.querySelector(".adc-raw-measure");
      const output = row.querySelector(".adc-measure-voltage");
      const value = Number(input.value);
      output.textContent = input.value !== "" && value >= 0 && value <= maximum() ? formatVoltage(voltage(value)) : "—";
    });
  }

  function measurements() {
    return [...calibrationBody.querySelectorAll(".adc-raw-measure")].map(input => input.value === "" ? NaN : Number(input.value));
  }

  function means() {
    const values = measurements();
    if (values.some(value => !Number.isFinite(value) || value < 0 || value > maximum())) return null;
    const average = array => array.reduce((sum, value) => sum + value, 0) / array.length;
    return {dry:average(values.slice(0, 5)), wet:average(values.slice(5, 10))};
  }

  function calculateMeans() {
    const result = means();
    if (!result) {
      dryMeanOutput.textContent = wetMeanOutput.textContent = suggestedOutput.textContent = "Mesures incomplètes";
      return null;
    }
    const suggested = Math.round((result.dry + result.wet) / 2);
    dryMeanOutput.textContent = `${result.dry.toFixed(1)} ADC · ${formatVoltage(voltage(result.dry))}`;
    wetMeanOutput.textContent = `${result.wet.toFixed(1)} ADC · ${formatVoltage(voltage(result.wet))}`;
    suggestedOutput.textContent = `${suggested} ADC · ${formatVoltage(voltage(suggested))}`;
    return {...result, suggested};
  }

  function saveData() {
    const s = missionState();
    s.adcData = {
      bits:bits(), vref:vref(),
      conversions:[...section.querySelectorAll(".adc-voltage-answer")].map(input => input.value),
      measurements:[...section.querySelectorAll(".adc-raw-measure")].map(input => input.value),
      threshold:thresholdInput.value,
      thresholdVoltage:thresholdVoltageInput.value,
      quizMeaning:$("adcQuizMeaning").value,
      quizMaximum:$("adcQuizMaximum").value,
      quizExample:$("adcQuizExample").value
    };
    if (typeof sauver === "function") sauver();
  }

  function updateForResolution(preserve = false) {
    const saved = preserve ? missionState().adcData || {} : {};
    maxInput.value = `${maximum()} (${Math.pow(2, bits())} niveaux)`;
    $("adcHardwareNote").innerHTML = bits() === 10
      ? "<strong>10 bits :</strong> résolution native de l’Arduino UNO R3, de 0 à 1023. L’UNO R4 Minima peut aussi être réglée en 10 bits pour faciliter la comparaison."
      : bits() === 14
        ? "<strong>14 bits :</strong> résolution maximale de lecture analogique de l’Arduino UNO R4 Minima, de 0 à 16383."
        : "<strong>16 bits :</strong> extension mathématique pour comprendre la formule, de 0 à 65535. Ce n’est pas la résolution ADC des cartes UNO R3 ou UNO R4 Minima utilisées dans ce TP.";
    renderConversionTable(saved.conversions || []);
    renderCalibrationTable(saved.measurements || []);
    thresholdInput.max = maximum();
    thresholdInput.value = saved.threshold || "";
    thresholdVoltageInput.max = vref();
    thresholdVoltageInput.value = saved.thresholdVoltage || "";
    calculateMeans();
    saveData();
  }

  function loadExample() {
    const max = maximum();
    const scale = value => Math.round(value / 1023 * max);
    const values = [820,790,840,805,815,350,380,365,340,375].map(scale);
    section.querySelectorAll(".adc-raw-measure").forEach((input, index) => { input.value = values[index]; });
    updateMeasurementVoltages();
    const result = calculateMeans();
    if (result) {
      thresholdInput.value = Math.round(result.suggested);
      thresholdVoltageInput.value = voltage(result.suggested).toFixed(2);
    }
    saveData();
  }

  function validateActivity() {
    saveData();
    const conversionInputs = [...section.querySelectorAll(".adc-voltage-answer")];
    const conversionOk = conversionInputs.every(input => {
      const expected = voltage(Number(input.dataset.value));
      return input.value !== "" && Math.abs(Number(input.value) - expected) <= .03;
    });
    const result = calculateMeans();
    const threshold = Number(thresholdInput.value);
    const thresholdVoltage = Number(thresholdVoltageInput.value);
    const thresholdBetween = result && Number.isFinite(threshold) && threshold >= Math.min(result.dry, result.wet) && threshold <= Math.max(result.dry, result.wet);
    const voltageOk = thresholdInput.value !== "" && thresholdVoltageInput.value !== "" && Math.abs(thresholdVoltage - voltage(threshold)) <= .03;
    const quizOk = $("adcQuizMeaning").value === "adc" && $("adcQuizMaximum").value === "power" && $("adcQuizExample").value === "2.93";
    const allOk = conversionOk && !!result && thresholdBetween && voltageOk && quizOk;
    missionState().adcCalibration = allOk;
    if (typeof sauver === "function") sauver();
    if (typeof afficherCriteres === "function" && typeof current !== "undefined" && current === missionIndex) afficherCriteres();
    feedback.className = `adc-feedback ${allOk ? "ok" : "no"}`;
    feedback.textContent = allOk
      ? "✅ Activité validée : conversions, seuil et questions de compréhension sont corrects."
      : "❌ Vérifie les tensions, complète les dix mesures, place le seuil entre les deux moyennes et relis les trois questions.";
  }

  function markCorrectionUsed() {
    const s = missionState();
    if (!s.correctionUsed) {
      const accepted = window.confirm("Afficher la correction rend la mission 2 formative. Aucun point ne sera attribué pour cette mission. Continuer ?");
      if (!accepted) return false;
    }
    s.correctionUsed = true;
    s.correctionKinds = Array.isArray(s.correctionKinds) ? s.correctionKinds : [];
    if (!s.correctionKinds.includes("adc-calibration")) s.correctionKinds.push("adc-calibration");
    s.done = false;
    if (typeof sauver === "function") sauver();
    if (typeof afficherNavigation === "function") afficherNavigation();
    if (typeof actualiserTableau === "function") actualiserTableau();
    return true;
  }

  function showCorrection() {
    if (!markCorrectionUsed()) return;
    loadExample();
    section.querySelectorAll(".adc-voltage-answer").forEach(input => { input.value = voltage(Number(input.dataset.value)).toFixed(2); });
    $("adcQuizMeaning").value = "adc";
    $("adcQuizMaximum").value = "power";
    $("adcQuizExample").value = "2.93";
    missionState().adcCalibration = true;
    saveData();
    correctionPanel.innerHTML = `
      <h4>Correction expliquée — mission formative, 0 point</h4>
      <p><strong>Étape 1 :</strong> pour une résolution de n bits, il existe 2ⁿ niveaux et la valeur maximale est 2ⁿ − 1.</p>
      <p><strong>Étape 2 :</strong> la tension se calcule par <code>V ≈ valeur ADC ÷ (2ⁿ − 1) × Vref</code>. Ainsi, en 10 bits avec Vref = 5 V : <code>600 ÷ 1023 × 5 ≈ 2,93 V</code>.</p>
      <p><strong>Étape 3 :</strong> les moyennes des mesures sèches et humides forment deux groupes. Le seuil brut doit être placé entre ces deux groupes. Il faut ensuite tester ce choix sur de nouvelles mesures.</p>
      <p><strong>Étape 4 :</strong> certains capteurs donnent une valeur brute plus grande quand le sol est sec, d’autres l’inverse. C’est pourquoi on calibre avant d’utiliser un pourcentage d’humidité dans le programme.</p>
      <p><strong>ADC/CAN :</strong> analogique vers numérique. <strong>DAC/CNA :</strong> numérique vers analogique, opération inverse.</p>`;
    correctionPanel.classList.add("open");
    feedback.className = "adc-feedback no";
    feedback.textContent = "📘 Correction consultée : la mission 2 reste accessible pour apprendre, mais rapporte 0 point.";
  }

  function restore() {
    const saved = missionState().adcData || {};
    bitsInput.value = [10,14,16].includes(Number(saved.bits)) ? String(saved.bits) : "10";
    vrefInput.value = saved.vref || 5;
    updateForResolution(true);
    $("adcQuizMeaning").value = saved.quizMeaning || "";
    $("adcQuizMaximum").value = saved.quizMaximum || "";
    $("adcQuizExample").value = saved.quizExample || "";
  }

  function refreshVisibility() {
    const active = typeof current !== "undefined" && current === missionIndex;
    section.hidden = !active;
    if (active) calculateMeans();
  }

  bitsInput.addEventListener("change", () => updateForResolution(false));
  vrefInput.addEventListener("input", () => updateForResolution(false));
  thresholdInput.addEventListener("input", saveData);
  thresholdVoltageInput.addEventListener("input", saveData);
  section.querySelectorAll("select").forEach(select => select.addEventListener("change", saveData));
  $("adcLoadExample").addEventListener("click", loadExample);
  $("adcCalculate").addEventListener("click", calculateMeans);
  $("adcValidate").addEventListener("click", validateActivity);
  $("adcCorrection").addEventListener("click", showCorrection);

  const title = document.getElementById("missionTitle");
  const nav = document.getElementById("missions");
  if (title) new MutationObserver(() => window.setTimeout(refreshVisibility, 0)).observe(title, {childList:true,subtree:true});
  if (nav) nav.addEventListener("click", () => window.setTimeout(refreshVisibility, 0));

  restore();
  refreshVisibility();
})();
