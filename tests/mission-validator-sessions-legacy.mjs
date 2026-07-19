/* Non-régression STRICTE des séances 2 à 8 : l'ancien chemin test(source) est intégralement */
/* préservé, l'analyse contextuelle Arduino n'est utilisée QUE pour la séance 1. */
/* Test pur (Node), rapide et déterministe : espionne analyze() pour prouver le périmètre. */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Charge le module d'analyse et installe un espion sur analyze(). */
const analysisModule = require(path.join(repositoryRoot, "mission-mode", "mission-arduino-analysis.js"));
const originalAnalyze = analysisModule.analyze;
let analyzeCalls = 0;
analysisModule.analyze = (...args) => { analyzeCalls += 1; return originalAnalyze(...args); };

/* Charge le validateur APRÈS l'espion (il capture le même objet module). */
const validator = require(path.join(repositoryRoot, "mission-mode", "mission-validator.js"));

/* Instantané des identifiants d'étapes attendus par séance (état figé, doit rester inchangé). */
const EXPECTED_STEPS = {
  1: ["include", "serialBegin", "pinMode", "safeLowSetup", "readHumidity", "readLight", "readWater", "showHumidity", "showLight", "showWater", "pumpStop", "delay"],
  2: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "readHumidity", "compareHumidity", "showHumidity", "showSoilState", "pumpStop", "delay"],
  3: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "readHumidity", "compareHumidity", "showHumidity", "pumpStart", "delayPump", "pumpStop", "delay"],
  4: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "readHumidity", "readWater", "compareWaterLow", "compareHumidity", "compareWaterEnough", "alertWater", "pumpStart", "delayPump", "pumpStop", "delay"],
  5: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdStop", "thresholdWater", "readHumidity", "readWater", "compareWaterLow", "compareHumidity", "compareStop", "pumpStart", "delayPump", "pumpStop", "delay"],
  6: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "thresholdLight", "readHumidity", "readLight", "readWater", "compareHumidity", "compareWaterEnough", "compareLight", "showHumidity", "showLight", "showWater", "pumpStart", "delayPump", "pumpStop", "delay"],
  7: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "readHumidity", "readWater", "compareWaterLow", "compareHumidity", "compareWaterEnough", "showHumidity", "showWater", "pumpStart", "delayPump", "pumpStop", "delay"],
  8: ["include", "serialBegin", "pinMode", "safeLowSetup", "thresholdHumidity", "thresholdWater", "thresholdLight", "readHumidity", "readLight", "readWater", "compareWaterLow", "alertWater", "compareHumidity", "compareLight", "showHumidity", "showLight", "showWater", "pumpStart", "delayPump", "pumpStop", "delay"]
};

const failures = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}

/* Preuve 1 : la séance 1 utilise bien le NOUVEAU chemin (analyze appelé). */
{
  analyzeCalls = 0;
  validator.validate(validator.getReferenceCode(1), 1);
  check(analyzeCalls > 0, `séance 1 → chemin contextuel (analyze appelé ${analyzeCalls} fois)`);
}

/* Preuve 2 : chaque séance 2 à 8 conserve son ancien chemin, ses étapes, ses résultats. */
for (let session = 2; session <= 8; session += 1) {
  /* Charge une définition et un squelette réels pour la séance. */
  let reference; let skeleton;
  try { reference = validator.getReferenceCode(session); } catch (e) { reference = null; }
  try { skeleton = validator.getSkeleton("guided", session); } catch (e) { skeleton = null; }

  /* 2a. Chargement de la définition (étapes présentes). */
  const steps = validator.getSteps(session);
  const ids = steps.map(s => s.id);
  check(steps.length > 0, `séance ${session} : définition chargée (${steps.length} étapes)`);

  /* 2b. Nombre et identifiants des étapes inchangés (instantané figé). */
  check(JSON.stringify(ids) === JSON.stringify(EXPECTED_STEPS[session]), `séance ${session} : étapes et ordre inchangés`);

  /* 2c. Validation des squelettes/références sans exception ET sans appeler analyze(). */
  analyzeCalls = 0;
  let threw = false;
  let result = null;
  try {
    if (skeleton) validator.validate(skeleton, session);
    result = validator.validate(reference || skeleton || "", session);
  } catch (e) { threw = true; }
  check(!threw, `séance ${session} : validation sans exception`);
  check(analyzeCalls === 0, `séance ${session} : ANCIEN chemin (analyze JAMAIS appelé)`);

  /* 2d. Aucun message contextuel (le chemin hérité ne produit que des booléens). */
  const anyMessage = result ? result.steps.some(s => s.message && s.message.length) : false;
  check(anyMessage === false, `séance ${session} : aucun message contextuel produit`);

  /* 2e. Le champ analysis reste null (aucune analyse structurelle rattachée). */
  check(result && result.analysis === null, `séance ${session} : aucune analyse structurelle attachée (analysis=null)`);

  /* 2f. API publique et badges présents et cohérents. */
  const badgeKeys = result ? Object.keys(result.badges) : [];
  const missionBadges = require(path.join(repositoryRoot, "mission-mode", "mission-data.js")).getMission(session).badges.map(b => b.id);
  check(JSON.stringify(badgeKeys.sort()) === JSON.stringify(missionBadges.slice().sort()), `séance ${session} : badges inchangés (${badgeKeys.length})`);
  check(result && Array.isArray(result.steps) && Array.isArray(result.errors) && "firstMissing" in result && "percent" in result, `séance ${session} : API de résultat inchangée (steps/errors/firstMissing/percent)`);
}

/* Preuve 3 : indépendance vis-à-vis de mission-arduino-analysis.js pour les séances 2 à 8. */
/* On rend analyze() défaillant : les séances 2 à 8 doivent continuer à valider sans erreur. */
{
  analysisModule.analyze = () => { throw new Error("analyze ne doit PAS être appelé pour les séances 2 à 8"); };
  let threw = false;
  try {
    for (let session = 2; session <= 8; session += 1) {
      const ref = (() => { try { return validator.getReferenceCode(session); } catch (e) { return validator.getSkeleton("guided", session); } })();
      validator.validate(ref, session);
    }
  } catch (e) { threw = true; }
  check(!threw, "séances 2 à 8 : aucune dépendance obligatoire à mission-arduino-analysis.js (analyze défaillant sans impact)");
  /* Restaure l'espion pour la suite. */
  analysisModule.analyze = (...args) => { analyzeCalls += 1; return originalAnalyze(...args); };
}

/* Preuve 4 : contraste de comportement — l'ancien chemin reste PERMISSIF (chaînes non neutralisées), */
/* la séance 1 est STRICTE. Une instruction placée dans une chaîne : */
/*  - valide en séance 2 (ancien test(source)) ;                                      */
/*  - ne valide PAS en séance 1 (analyse contextuelle).                                */
{
  const codeWithStringInstruction = 'const int PIN_RELAIS_POMPE = 6;\nvoid setup(){ Serial.println("digitalWrite(PIN_RELAIS_POMPE, LOW);"); }\nvoid loop(){}';
  const s2 = validator.validate(codeWithStringInstruction, 2).steps.find(s => s.id === "safeLowSetup");
  const s1 = validator.validate(codeWithStringInstruction, 1).steps.find(s => s.id === "safeLowSetup");
  check(s2 && s2.ok === true, "séance 2 : ancien chemin permissif (instruction dans une chaîne toujours acceptée)");
  check(s1 && s1.ok === false, "séance 1 : chemin contextuel strict (instruction dans une chaîne refusée)");
}

console.log(`\n===== RÉSUMÉ NON-RÉGRESSION SÉANCES 2 À 8 =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — séance 1 contextuelle, séances 2 à 8 sur l'ancien chemin test(source) intégralement préservé.`);
}
