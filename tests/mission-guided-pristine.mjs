/* Test Playwright — SESSION VIERGE + MIGRATION NON DESTRUCTIVE (squelette include-slot v5). */
/* Vérifie que la première cible est une VRAIE ligne de code vide (jamais un commentaire), */
/* que les emplacements éditables ne contiennent aucun commentaire, et que les anciennes */
/* sessions localStorage sont migrées SANS jamais perdre le code (sauvegarde + récupération). */

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

/* Ancien squelette (mission-data par défaut) — commentaire de titre en ligne 0, aucune saisie. */
const OLD_SKELETON = ["// Mission 1 — Faire parler les capteurs", "// Étape 1 : ajoute la bibliothèque.", "", "const int PIN_HUMIDITE_SOL = A0;", "const int PIN_LUMIERE = A1;", "const int PIN_NIVEAU_EAU = A2;", "const int PIN_RELAIS_POMPE = 6;", "", "void setup() {", "  // Initialiser le Moniteur Série à 9600 bauds.", "", "  // Configurer D6 en sortie puis garder la pompe arrêtée.", "", "}", "", "void loop() {", "  // Lire A0, A1 et A2.", "", "  // Afficher les trois mesures dans le Moniteur Série.", "", "  // Garder la pompe arrêtée.", "", "  // Attendre une seconde.", "", "}"].join("\n");
/* Ancienne session AVEC code élève reconnaissable. */
const OLD_WITH_CODE = ["#include <Arduino.h>", "const int PIN_HUMIDITE_SOL = A0;", "const int PIN_LUMIERE = A1;", "const int PIN_NIVEAU_EAU = A2;", "const int PIN_RELAIS_POMPE = 6;", "void setup() {", "  Serial.begin(9600);", "  pinMode(PIN_RELAIS_POMPE, OUTPUT);", "  digitalWrite(PIN_RELAIS_POMPE, LOW);", "}", "void loop() {", "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);", "  int lumiere = analogRead(PIN_LUMIERE);", "  Serial.println(humiditeSol);", "  Serial.println(lumiere);", "  digitalWrite(PIN_RELAIS_POMPE, LOW);", "  delay(1000);", "}"].join("\n");
/* Ancien code atypique, non reconnaissable. */
const ATYPICAL = "int x = 42; // vieux code sans structure Arduino reconnue";

const browser = await chromium.launch({ headless: true });
const failures = [];
const allConsoleErrors = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;

/* Ouvre une page, éventuellement avec une ancienne session ensemencée. */
async function open(viewport, seed) {
  const context = await browser.newContext({ viewport });
  if (seed) await context.addInitScript(s => localStorage.setItem("technoquest-mission-v1", JSON.stringify(s)), seed);
  else await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("dialog", d => d.accept().catch(() => {}));
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await pause(300);
  if (await page.evaluate(() => document.getElementById("missionModeRoot")?.classList.contains("mission-hidden"))) {
    await page.waitForSelector("#missionActivate", { state: "visible" }).catch(() => {});
    await page.click("#missionActivate").catch(() => {});
  }
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.model && window.TechnoQuestGuidedGeometry.editableSlots)).catch(() => {});
  await pause(600);
  return { context, page, consoleErrors };
}
/* Sonde complète. */
function probe() {
  const e = document.getElementById("codeEditor");
  const g = window.TechnoQuestGuidedGeometry;
  const m = g.model();
  const frame = document.querySelector(".mission-target-line");
  const res = window.TechnoQuestMissionValidator.validate(e.value, 1);
  const L = e.value.split("\n");
  const slots = g.editableSlots();
  const store = (() => { try { return JSON.parse(localStorage.getItem("technoquest-mission-v1")); } catch (x) { return {}; } })();
  return {
    firstMissing: res.firstMissing ? res.firstMissing.id : null,
    targetLine: m.targetLine,
    targetText: L[m.targetLine],
    targetIsComment: /^\s*\/\//.test(L[m.targetLine] || ""),
    frameLabel: frame && !frame.hidden ? frame.querySelector(".mission-target-line-label").textContent : "(caché)",
    slots,
    slotsHaveComment: slots.some(i => /^\s*\/\//.test(L[i] || "")),
    caretLine: e.value.slice(0, e.selectionStart).split("\n").length - 1,
    migrationState: store.sessions ? store.sessions[1].migrationState : undefined,
    reflection: store.sessions ? store.sessions[1].reflection : undefined,
    values: store.sessions ? JSON.stringify(store.sessions[1].values) : undefined,
    backups: window.TechnoQuestMissionRecovery ? window.TechnoQuestMissionRecovery.list() : [],
    editorValue: e.value
  };
}

/* ===== A. SESSION VIERGE (cas 1 à 8) sur 4 résolutions ===== */
const viewports = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "390x844", width: 390, height: 844 }
];
for (const vp of viewports) {
  const { context, page, consoleErrors } = await open(vp, null);
  const p = await page.evaluate(probe);
  check(p.firstMissing === "include", `A (${vp.name}) : firstMissing === include`);
  check(!p.targetIsComment, `A (${vp.name}) : targetLine ne commence pas par // ("${p.targetText}")`);
  check(p.frameLabel.includes("ligne " + (p.targetLine + 1)), `A (${vp.name}) : étiquette affiche le bon numéro (${p.frameLabel})`);
  check(!p.slotsHaveComment, `A (${vp.name}) : aucun emplacement éditable n'est un commentaire`);
  /* Saisie de #include possible + progression vers Serial.begin. */
  await page.evaluate(() => { const e = document.getElementById("codeEditor"); const v = window.TechnoQuestMissionValidator; const line = v.findLineForStep(e.value, "include", v.validate(e.value, 1), 1, "edition"); const L = e.value.split("\n"); const s = L.slice(0, line).reduce((t, l) => t + l.length + 1, 0); e.focus(); e.setSelectionRange(s + (L[line].match(/^\s*/)[0].length), s + (L[line].match(/^\s*/)[0].length)); e.dispatchEvent(new Event("click", { bubbles: true })); });
  await pause(150);
  await page.keyboard.type("#include <Arduino.h>");
  await pause(300);
  const p2 = await page.evaluate(probe);
  check(p2.firstMissing === "serialBegin", `A (${vp.name}) : saisie de #include possible → progression vers Serial.begin (${p2.firstMissing})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* Zoom 200 % sur session vierge. */
{
  const { context, page, consoleErrors } = await open({ width: 1366, height: 768 }, null);
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; window.dispatchEvent(new Event("resize")); });
  await pause(500);
  const p = await page.evaluate(probe);
  check(p.firstMissing === "include" && !p.targetIsComment, `A (zoom 200%) : cible include sur une ligne de code (non commentaire)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== B. ANCIEN SQUELETTE SANS SAISIE (cas 9 à 13) ===== */
{
  const seed = { structureVersions: { session1: "session-1-progressive-guided-v4" }, sessions: { 1: { modeMission: true, helpMode: "guided", code: OLD_SKELETON, reflection: "note B", values: { humidity: "5" }, attempted: true } } };
  const { context, page, consoleErrors } = await open({ width: 1366, height: 768 }, seed);
  const p = await page.evaluate(probe);
  check(p.migrationState === "reset", `B : ancien squelette sans saisie → migration « reset » vers le nouveau squelette`);
  check(!p.targetIsComment && p.firstMissing === "include", `B : aucune cible sur un commentaire (cible ${p.targetLine + 1} = "${p.targetText}")`);
  check(p.backups.length === 1 && p.backups[0].code === OLD_SKELETON, `B : sauvegarde de récupération créée avec l'ancien code complet`);
  check(p.reflection === "note B" && /"humidity":"5"/.test(p.values || ""), `B : reflection et values conservées (reflection="${p.reflection}", values=${p.values})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== C. ANCIEN SQUELETTE AVEC CODE ÉLÈVE (cas 14 à 19) ===== */
{
  const seed = { structureVersions: { session1: "session-1-progressive-guided-v4" }, sessions: { 1: { modeMission: true, helpMode: "guided", code: OLD_WITH_CODE, reflection: "note C", values: {}, attempted: true } } };
  const { context, page, consoleErrors } = await open({ width: 1366, height: 768 }, seed);
  const p = await page.evaluate(probe);
  check(p.migrationState === "migrated", `C : ancienne session avec code → migration « migrated »`);
  check(p.editorValue.includes("humiditeSol") && p.editorValue.includes("Serial.begin(9600)") && p.editorValue.includes("pinMode"), `C : instructions reconnues replacées dans les nouveaux emplacements`);
  check(!p.slotsHaveComment && !p.targetIsComment, `C : aucun emplacement/cible n'est un commentaire`);
  check(p.backups.length === 1 && p.backups[0].code === OLD_WITH_CODE, `C : ancien code complet disponible dans la sauvegarde`);
  /* La progression est recalculée depuis le code migré (readWater manquant dans l'ancien code). */
  check(p.firstMissing === "readWater", `C : progression recalculée depuis le code migré (firstMissing=${p.firstMissing})`);
  /* Le code migré est cohérent (47 lignes du squelette v6 : rappels de nommage + libellés préremplis). */
  check(p.editorValue.split("\n").length === 47, `C : aucune ligne ultérieure effacée (structure complète, ${p.editorValue.split("\n").length} lignes)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== D. MIGRATION INCERTAINE (cas 20 à 24) ===== */
{
  const seed = { structureVersions: { session1: "vieux-format-inconnu" }, sessions: { 1: { modeMission: true, helpMode: "guided", code: ATYPICAL, reflection: "note D", values: {}, attempted: true } } };
  const { context, page, consoleErrors } = await open({ width: 1366, height: 768 }, seed);
  const p = await page.evaluate(probe);
  check(p.migrationState === "reset" || p.migrationState === "uncertain", `D : migration incertaine explicite (état "${p.migrationState}")`);
  check(p.backups.length === 1 && p.backups[0].code === ATYPICAL, `D : ancien code atypique reste récupérable dans la sauvegarde`);
  check(!p.targetIsComment, `D : aucune cible sur un commentaire malgré l'incertitude`);
  /* Restauration réelle (API dédiée, distincte de la consultation) : remet l'ancien code actif. */
  const restored = await page.evaluate(() => {
    const result = window.TechnoQuestMissionRecovery.restoreToActiveState();
    const store = JSON.parse(localStorage.getItem("technoquest-mission-v1"));
    return { ok: result.ok, code: store.sessions[1].code };
  });
  check(restored.ok === true && restored.code === ATYPICAL, `D : restoreToActiveState remet l'ancien code actif (aucune perte)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== E. EMPLACEMENTS + rechargement + déjà-v5 (cas 25 à 30) ===== */
{
  const { context, page, consoleErrors } = await open({ width: 1366, height: 768 }, null);
  let p = await page.evaluate(probe);
  check(!p.slotsHaveComment, `E25 : baselineSlotIndices ne contient aucun commentaire`);
  const audit = await page.evaluate(() => {
    const v = window.TechnoQuestMissionValidator; const L = v.getSkeleton("guided", 1).split("\n"); const slots = window.TechnoQuestGuidedGeometry.editableSlots(); const model = window.TechnoQuestGuidedGeometry.model();
    const blanksNoStep = L.map((l, i) => i).filter(i => L[i].trim() === "" && !slots.includes(i));
    return { leaks: blanksNoStep.filter(i => model.isEditable(i)), everySlotHasStep: slots.every(i => { const res = v.validate(L.join("\n"), 1); return v.getSteps(1).some(s => v.findLineForStep(L.join("\n"), s.id, res, 1, "edition") === i); }) };
  });
  check(audit.leaks.length === 0, `E26 : aucune ligne vide structurelle n'est éditable`);
  check(audit.everySlotHasStep === true, `E27 : toutes les lignes cibles correspondent à une étape`);
  /* E28 : rechargement sans décalage. */
  await page.reload({ waitUntil: "networkidle" });
  if (await page.evaluate(() => document.getElementById("missionModeRoot")?.classList.contains("mission-hidden"))) await page.click("#missionActivate").catch(() => {});
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.editableSlots)).catch(() => {});
  await pause(500);
  p = await page.evaluate(probe);
  check(p.firstMissing === "include" && !p.targetIsComment, `E28 : rechargement sans décalage (cible include sur une ligne de code)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}
/* E29 : une session déjà en v6 n'est pas re-migrée (aucune nouvelle sauvegarde). */
{
  const seed = { structureVersions: { session1: "session-1-guided-print-labels-v6" }, sessions: { 1: { modeMission: true, helpMode: "guided", code: "", reflection: "", values: {}, attempted: false } } };
  const { context, page, consoleErrors } = await open({ width: 1366, height: 768 }, seed);
  const backups = await page.evaluate(() => window.TechnoQuestMissionRecovery.list());
  check(backups.length === 0, `E29 : session déjà en v6 non re-migrée (aucune sauvegarde ajoutée)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* E30 : zéro erreur console. */
check(allConsoleErrors.length === 0, `E30 : zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ SESSION VIERGE & MIGRATION =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — cible include sur une ligne de code, aucun commentaire éditable, migration non destructive (sauvegarde + récupération) vérifiées.`);
}
