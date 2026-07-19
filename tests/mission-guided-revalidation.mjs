/* Test Playwright — REVALIDATION RÉTROACTIVE des étapes de la séance 1 (mode Guidé). */
/* Vérifie qu'une étape déjà réussie redevient « à corriger » dès que le code courant ne la */
/* valide plus, que la cible (firstMissing/cadre/flèche) revient dessus, SANS jamais effacer */
/* le code écrit après l'étape ni masquer les lignes déjà révélées, y compris après rechargement. */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"], [".png", "image/png"]]);
const pause = ms => new Promise(r => setTimeout(r, ms));

function safeLocalPath(requestUrl) {
  const parsedUrl = new URL(requestUrl || "/", "http://127.0.0.1");
  const decodedPath = decodeURIComponent(parsedUrl.pathname);
  const requestedPath = decodedPath === "/" ? "/seance-1.html" : decodedPath;
  const candidatePath = path.resolve(repositoryRoot, `.${requestedPath}`);
  if (!candidatePath.startsWith(repositoryRoot)) throw new Error("Chemin interdit");
  return candidatePath;
}
const server = http.createServer(async (request, response) => {
  try {
    let localPath = safeLocalPath(request.url);
    const localStat = await stat(localPath);
    if (localStat.isDirectory()) localPath = path.join(localPath, "index.html");
    const body = await readFile(localPath);
    response.writeHead(200, { "Content-Type": mimeTypes.get(path.extname(localPath).toLowerCase()) || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

/* Remplit le squelette guidé réel avec des remplacements de lignes (index figés). */
function fillGuided(overrides) {
  const lines = window.TechnoQuestMissionValidator.getSkeleton("guided", 1).split("\n");
  Object.keys(overrides).forEach(k => { lines[Number(k)] = overrides[k]; });
  const editor = document.getElementById("codeEditor");
  editor.value = lines.join("\n");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Sonde de l'état de progression et de la géométrie guidée. */
function probe() {
  const editor = document.getElementById("codeEditor");
  const model = window.TechnoQuestGuidedGeometry.model();
  const frame = document.querySelector(".mission-target-line");
  const result = window.TechnoQuestMissionValidator.validate(editor.value, 1);
  const ok = {};
  result.steps.forEach(s => { ok[s.id] = s.ok; });
  const L = editor.value.split("\n");
  return {
    firstMissing: result.firstMissing ? result.firstMissing.id : null,
    firstMissingMsg: result.firstMissing ? result.firstMissing.message : "",
    ok,
    target: model.targetLine,
    stepId: model.stepId,
    revealed: model.revealedCodeLines,
    frameLabel: frame && !frame.hidden ? frame.querySelector(".mission-target-line-label").textContent : "(caché)",
    line22: L[22], line24: L[24], line26: L[26], line28: L[28]
  };
}

/* Programme guidé COMPLET et valide (variable d'humidité nommée humiditeSol). */
const COMPLETE = {
  0: "#include <Arduino.h>",
  7: "  Serial.begin(9600);",
  9: "  pinMode(PIN_RELAIS_POMPE, OUTPUT);",
  11: "  digitalWrite(PIN_RELAIS_POMPE, LOW);",
  16: "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);",
  18: "  int lumiere = analogRead(PIN_LUMIERE);",
  20: "  int niveauEau = analogRead(PIN_NIVEAU_EAU);",
  22: "  Serial.println(humiditeSol);",
  24: "  Serial.println(lumiere);",
  26: "  Serial.println(niveauEau);",
  28: "  digitalWrite(PIN_RELAIS_POMPE, LOW);",
  30: "  delay(1000);"
};

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;
const browser = await chromium.launch({ headless: true });

const failures = [];
const allConsoleErrors = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}
function run(page, fn, ...args) {
  return page.evaluate(({ f, a }) => new Function(`return (${f})`)()(...a), { f: fn.toString(), a: args });
}
async function preparePage(clearInit = true) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  if (clearInit) await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("dialog", d => d.accept().catch(() => {}));
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#missionActivate", { state: "visible" });
  await page.click("#missionActivate");
  await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.model));
  return { context, page, consoleErrors };
}

/* ===== Cas 1 à 7 : rétrogradation de showHumidity, préservation du code postérieur, reprise ===== */
{
  const { context, page, consoleErrors } = await preparePage();
  /* Programme valide jusqu'à showWater (pumpStop/delay laissés vides). */
  const partial = { ...COMPLETE }; delete partial[28]; delete partial[30];
  await run(page, fillGuided, partial);
  await pause(500);
  let p = await run(page, probe);
  check(p.ok.showHumidity === true && p.firstMissing === "pumpStop", `état initial : showHumidity validé, cible pumpStop (obtenu ${p.firstMissing})`);

  /* Casse showHumidity par une FRAPPE RÉELLE : clic ligne 22 puis suppression de « Sol ». */
  await page.evaluate(() => {
    const e = document.getElementById("codeEditor");
    const L = e.value.split("\n");
    const start = L.slice(0, 22).reduce((t, l) => t + l.length + 1, 0);
    const col = L[22].indexOf("humiditeSol") + "humiditeSol".length;
    e.focus(); e.setSelectionRange(start + col, start + col);
    e.dispatchEvent(new Event("click", { bubbles: true }));
  });
  await pause(150);
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await pause(400);
  p = await run(page, probe);
  check(p.ok.showHumidity === false, `cas 1 : showHumidity redevient invalide après modification`);
  check(p.firstMissing === "showHumidity", `cas 2 : firstMissing revient sur showHumidity (obtenu ${p.firstMissing})`);
  check(p.target === 22 && p.frameLabel.includes("ligne 23"), `cas 3 : cadre et flèche reviennent sur showHumidity (ligne 23, obtenu "${p.frameLabel}")`);
  check(p.line24 === "  Serial.println(lumiere);" && p.line26 === "  Serial.println(niveauEau);", `cas 5 : le code écrit APRÈS showHumidity est conservé`);
  check(p.revealed.includes(24) && p.revealed.includes(26), `cas 4 : les lignes lumière/eau déjà révélées restent accessibles`);
  check(/mesure attendue|variable|Affiche/.test(p.firstMissingMsg), `cas 3 : message pédagogique précis affiché ("${p.firstMissingMsg.slice(0, 60)}…")`);

  /* Correction manuelle : réécrit « Sol ». */
  await page.keyboard.type("Sol");
  await pause(400);
  p = await run(page, probe);
  check(p.ok.showHumidity === true, `cas 6 : correction manuelle vers humiditeSol revalide l'étape`);
  check(p.firstMissing === "pumpStop", `cas 7 : reprise automatique vers la première étape suivante manquante (${p.firstMissing})`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 8 à 11 : rétrogradation d'autres étapes depuis un programme complet ===== */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, COMPLETE);
  await pause(400);
  let p = await run(page, probe);
  check(p.firstMissing === null, `programme complet initial : toutes les étapes validées`);

  /* Cas 8 : suppression de Serial.begin après validation. */
  await run(page, fillGuided, { ...COMPLETE, 7: "" });
  await pause(300);
  p = await run(page, probe);
  check(p.ok.serialBegin === false && p.firstMissing === "serialBegin", `cas 8 : suppression de Serial.begin → serialBegin invalide, cible dessus`);

  /* Cas 9 : OUTPUT remplacé par INPUT. */
  await run(page, fillGuided, { ...COMPLETE, 9: "  pinMode(PIN_RELAIS_POMPE, INPUT);" });
  await pause(300);
  p = await run(page, probe);
  check(p.ok.pinMode === false && p.firstMissing === "pinMode", `cas 9 : OUTPUT→INPUT → pinMode invalide, cible dessus`);

  /* Cas 10 : suppression du LOW dans setup (safeLowSetup) ; le LOW de loop reste. */
  await run(page, fillGuided, { ...COMPLETE, 11: "" });
  await pause(300);
  p = await run(page, probe);
  check(p.ok.safeLowSetup === false && p.firstMissing === "safeLowSetup" && p.ok.pumpStop === true, `cas 10 : suppression du LOW de setup → safeLowSetup invalide (pumpStop conservé)`);

  /* Cas 11 : bon capteur remplacé par le mauvais (A0 lu à la place de A1). */
  await run(page, fillGuided, { ...COMPLETE, 18: "  int lumiere = analogRead(PIN_HUMIDITE_SOL);" });
  await pause(300);
  p = await run(page, probe);
  check(p.ok.readLight === false && p.firstMissing === "readLight", `cas 11 : mauvais capteur → readLight invalide, cible dessus`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 12 à 15 : erreur introduite, rechargement, correction, progression restaurée ===== */
{
  const { context, page, consoleErrors } = await preparePage(false);
  await page.evaluate(() => localStorage.clear());
  await run(page, fillGuided, COMPLETE);
  await pause(300);
  /* Introduit une erreur sur showHumidity puis enregistre. */
  await run(page, fillGuided, { ...COMPLETE, 22: "  Serial.println(humidite);" });
  await pause(300);
  let p = await run(page, probe);
  check(p.ok.showHumidity === false && p.firstMissing === "showHumidity", `cas 12 : erreur introduite avant rechargement (showHumidity invalide)`);
  await page.click("#missionSave");
  await pause(200);

  /* Recharge la page. */
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#codeEditor", { state: "visible" }).catch(() => {});
  const hidden = await page.evaluate(() => document.getElementById("missionModeRoot")?.classList.contains("mission-hidden"));
  if (hidden) await page.click("#missionActivate").catch(() => {});
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.model)).catch(() => {});
  await pause(500);
  p = await run(page, probe);
  check(p.ok.showHumidity === false && p.firstMissing === "showHumidity", `cas 13 : étape toujours invalide APRÈS rechargement`);
  check(p.line24 === "  Serial.println(lumiere);", `cas 13 : code postérieur conservé après rechargement`);

  /* Corrige après rechargement. */
  await run(page, fillGuided, COMPLETE);
  await pause(400);
  p = await run(page, probe);
  check(p.ok.showHumidity === true, `cas 14 : correction après rechargement revalide l'étape`);
  check(p.firstMissing === null, `cas 15 : progression restaurée correctement (programme complet)`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* Zéro erreur console. */
check(allConsoleErrors.length === 0, `zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ REVALIDATION RÉTROACTIVE =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — rétrogradation, préservation du code postérieur, maintien des lignes révélées et reprise vérifiés.`);
}
