/* Test Playwright — RACCOURCIS CLAVIER & HISTORIQUE natif dans l'éditeur guidé. */
/* Vérifie le comportement RÉEL dans Chromium : Ctrl+C (copie), Ctrl+Z (annuler), */
/* Ctrl+Y et Ctrl+Maj+Z (rétablir), la revalidation rétroactive après undo/redo, la */
/* protection des commentaires/lignes futures, la liberté en Standard/Autonome, et la */
/* non-régression Classique. Aucun historique personnalisé : on s'appuie sur le natif. */

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

/* Remplit le squelette guidé PAR ÉTAPE (robuste aux décalages). */
function fillGuided(overridesByStep) {
  const v = window.TechnoQuestMissionValidator;
  const skeleton = v.getSkeleton("guided", 1);
  const lines = skeleton.split("\n");
  const result = v.validate(skeleton, 1);
  Object.keys(overridesByStep).forEach(stepId => {
    const line = v.findLineForStep(skeleton, stepId, result, 1, "edition");
    if (Number.isInteger(line) && line >= 0 && line < lines.length) lines[line] = overridesByStep[stepId];
  });
  const editor = document.getElementById("codeEditor");
  editor.value = lines.join("\n");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}
/* Programme valide jusqu'à showWater (pumpStop/delay laissés vides → firstMissing = pumpStop). */
const PARTIAL = {
  include: "#include <Arduino.h>", serialBegin: "  Serial.begin(9600);", pinMode: "  pinMode(PIN_RELAIS_POMPE, OUTPUT);", safeLowSetup: "  digitalWrite(PIN_RELAIS_POMPE, LOW);",
  readHumidity: "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);", readLight: "  int lumiere = analogRead(PIN_LUMIERE);", readWater: "  int niveauEau = analogRead(PIN_NIVEAU_EAU);",
  showHumidity: "  Serial.println(humiditeSol);", showLight: "  Serial.println(lumiere);", showWater: "  Serial.println(niveauEau);"
};
/* Positionne le curseur à la fin d'une ligne (référence : nombre / id d'étape / "COMMENT"). */
function caretEnd(lineRef) {
  const e = document.getElementById("codeEditor");
  const L = e.value.split("\n");
  const v = window.TechnoQuestMissionValidator;
  const line = typeof lineRef === "number" ? lineRef : (lineRef === "COMMENT" ? L.findIndex(l => /Lire l'humidit/.test(l)) : v.findLineForStep(e.value, lineRef, v.validate(e.value, 1), 1, "edition"));
  const start = L.slice(0, line).reduce((t, l) => t + l.length + 1, 0);
  e.focus(); e.setSelectionRange(start + L[line].length, start + L[line].length);
  e.dispatchEvent(new Event("click", { bubbles: true }));
}
/* Sélectionne un intervalle (références de ligne : nombre / id d'étape / "COMMENT"). */
function selectRange(startRef, startText, endRef, endText) {
  const e = document.getElementById("codeEditor");
  const L = e.value.split("\n");
  const v = window.TechnoQuestMissionValidator;
  const resolve = ref => typeof ref === "number" ? ref : (ref === "COMMENT" ? L.findIndex(l => /Lire l'humidit/.test(l)) : v.findLineForStep(e.value, ref, v.validate(e.value, 1), 1, "edition"));
  const startLine = resolve(startRef); const endLine = resolve(endRef);
  const off = i => L.slice(0, i).reduce((t, l) => t + l.length + 1, 0);
  const a = off(startLine) + (startText === null ? 0 : L[startLine].indexOf(startText));
  const b = off(endLine) + (endText === null ? L[endLine].length : L[endLine].indexOf(endText) + endText.length);
  e.focus(); e.setSelectionRange(a, b);
}
/* Sonde compacte (lignes résolues dynamiquement par étape). */
function probe() {
  const e = document.getElementById("codeEditor");
  const v = window.TechnoQuestMissionValidator;
  const model = window.TechnoQuestGuidedGeometry ? window.TechnoQuestGuidedGeometry.model() : { targetLine: null, revealedCodeLines: [], classify: () => "?" };
  const r = v.validate(e.value, 1);
  const L = e.value.split("\n");
  let attempted = null;
  try { attempted = JSON.parse(localStorage.getItem("technoquest-mission-v1")).sessions[1].attempted; } catch (x) {}
  const showHumidityLine = v.findLineForStep(e.value, "showHumidity", r, 1, "edition");
  const delayLine = v.findLineForStep(e.value, "delay", r, 1, "edition");
  const commentLine = L.findIndex(l => /Lire l'humidit/.test(l));
  return {
    firstMissing: r.firstMissing ? r.firstMissing.id : null,
    showHumidityOk: r.steps.find(s => s.id === "showHumidity").ok,
    value: e.value, protectedComment: L[commentLine], showHumidityText: L[showHumidityLine],
    attempted, revealed: model.revealedCodeLines,
    classifyDelay: model.classify ? model.classify(delayLine) : "?", delayText: L[delayLine], delayLine
  };
}

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
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: sessionUrl }).catch(() => {});
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
const readClip = page => page.evaluate(() => navigator.clipboard.readText().catch(() => "(échec)"));

/* ===== Ctrl+C : copie dans tous les cas, sans rien modifier ===== */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  const before = await run(page, probe);

  /* 1. Ctrl+C sur une ligne éditable. */
  await run(page, selectRange, "showHumidity", "Serial", "showHumidity", ";");
  await pause(80);
  await page.keyboard.press("Control+C");
  await pause(150);
  check((await readClip(page)) === "Serial.println(humiditeSol);", `1. Ctrl+C copie une ligne éditable`);

  /* 2. Ctrl+C sur un commentaire pédagogique protégé (copie autorisée). */
  await run(page, selectRange, "COMMENT", "//", "COMMENT", null);
  await pause(80);
  await page.keyboard.press("Control+C");
  await pause(150);
  check(/Lire l'humidit/i.test(await readClip(page)), `2. Ctrl+C copie un commentaire protégé (lecture autorisée)`);

  /* 3. Ctrl+C sur plusieurs lignes. */
  await run(page, selectRange, "showHumidity", "Serial", "showLight", ";");
  await pause(80);
  await page.keyboard.press("Control+C");
  await pause(150);
  const multi = await readClip(page);
  check(/humiditeSol/.test(multi) && /lumiere/.test(multi) && multi.includes("\n"), `3. Ctrl+C copie plusieurs lignes`);

  /* 4. Ctrl+A puis Ctrl+C. */
  await page.locator("#codeEditor").focus();
  await page.keyboard.press("Control+A");
  await pause(120);
  await page.keyboard.press("Control+C");
  await pause(150);
  const all = await readClip(page);
  const editorValue = await page.evaluate(() => document.getElementById("codeEditor").value);
  /* Le presse-papiers normalise les fins de ligne en CRLF sous Windows : on compare en LF. */
  check(all.replace(/\r\n/g, "\n") === editorValue, `4. Ctrl+A puis Ctrl+C copie la totalité du code`);

  /* 5. Ctrl+C ne modifie ni le code, ni attempted, ni la progression. */
  const after = await run(page, probe);
  check(after.value === before.value && after.firstMissing === before.firstMissing && after.attempted === before.attempted, `5. Ctrl+C ne modifie ni le code, ni attempted, ni la progression`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Ctrl+Z / Ctrl+Y / Ctrl+Maj+Z : historique natif ===== */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);

  /* 6. Ctrl+Z après saisie. */
  await run(page, caretEnd, "showHumidity");
  await pause(100);
  await page.keyboard.type("AB");
  await pause(150);
  check((await run(page, probe)).showHumidityText.endsWith("AB"), `6. saisie appliquée avant annulation`);
  await page.keyboard.press("Control+Z");
  await pause(200);
  check(!(await run(page, probe)).showHumidityText.endsWith("AB"), `6. Ctrl+Z annule la dernière saisie`);

  /* 7. Ctrl+Z après suppression. */
  await run(page, caretEnd, "showHumidity");
  await pause(100);
  await page.keyboard.press("Backspace");
  await pause(150);
  const afterDel = (await run(page, probe)).showHumidityText;
  await page.keyboard.press("Control+Z");
  await pause(200);
  check((await run(page, probe)).showHumidityText.length > afterDel.length, `7. Ctrl+Z restaure un caractère supprimé`);

  /* 8. Plusieurs Ctrl+Z successifs (chaque caractère est une unité d'annulation). */
  await run(page, caretEnd, "showHumidity");
  await pause(100);
  /* Capture l'état exact AVANT la saisie (robuste face à d'éventuels résidus des cas précédents). */
  const base8 = (await run(page, probe)).showHumidityText;
  await page.keyboard.type("A"); await pause(120);
  await page.keyboard.type("B"); await pause(120);
  await page.keyboard.type("C"); await pause(120);
  check((await run(page, probe)).showHumidityText.endsWith("ABC"), `8. trois saisies appliquées`);
  await page.keyboard.press("Control+Z"); await pause(150);
  await page.keyboard.press("Control+Z"); await pause(150);
  await page.keyboard.press("Control+Z"); await pause(150);
  check((await run(page, probe)).showHumidityText === base8, `8. trois Ctrl+Z reviennent à l'état initial`);

  /* 9 & 10. Ctrl+Y et Ctrl+Maj+Z rétablissent. */
  await run(page, caretEnd, "showHumidity");
  await pause(80);
  await page.keyboard.type("Q");
  await pause(120);
  await page.keyboard.press("Control+Z");
  await pause(150);
  check(!(await run(page, probe)).showHumidityText.endsWith("Q"), `9. Ctrl+Z annule avant rétablissement`);
  await page.keyboard.press("Control+Y");
  await pause(150);
  check((await run(page, probe)).showHumidityText.endsWith("Q"), `9. Ctrl+Y rétablit la modification annulée`);
  await page.keyboard.press("Control+Z");
  await pause(120);
  await page.keyboard.press("Control+Shift+Z");
  await pause(150);
  check((await run(page, probe)).showHumidityText.endsWith("Q"), `10. Ctrl+Maj+Z rétablit également`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Revalidation rétroactive après undo/redo + protections ===== */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  const comment15 = (await run(page, probe)).protectedComment;

  /* Casse showHumidity en une seule opération : sélectionne « Sol » puis Suppr. */
  await run(page, selectRange, "showHumidity", "Sol", "showHumidity", "Sol");
  await pause(120);
  await page.keyboard.press("Delete");
  await pause(300);
  let p = await run(page, probe);
  check(p.showHumidityOk === false && p.firstMissing === "showHumidity", `11. erreur introduite → showHumidity invalide, cible dessus`);

  /* 11. Ctrl+Z restaure humiditeSol → showHumidity revalidé → reprise. */
  await page.keyboard.press("Control+Z");
  await pause(300);
  p = await run(page, probe);
  check(p.showHumidityText === "  Serial.println(humiditeSol);" && p.showHumidityOk === true, `11. Ctrl+Z restaure la ligne et revalide showHumidity`);
  check(p.firstMissing === "pumpStop", `11. reprise automatique vers la première étape suivante (${p.firstMissing})`);

  /* 12. Ctrl+Y rétablit l'erreur → showHumidity invalide de nouveau. */
  await page.keyboard.press("Control+Y");
  await pause(300);
  p = await run(page, probe);
  check(p.showHumidityOk === false && p.firstMissing === "showHumidity", `12. Ctrl+Y rétablit l'erreur → revalidation rétroactive (showHumidity)`);

  /* 13. Commentaire pédagogique intact après undo/redo. */
  check((await run(page, probe)).protectedComment === comment15, `13. commentaires protégés intacts après undo/redo`);

  /* 14. Ligne future toujours verrouillée/vide après undo/redo. */
  /* Le Ctrl+Z revalide showHumidity → cible pumpStop (ligne 28) ; la ligne 30 (delay) reste future. */
  await page.keyboard.press("Control+Z");
  await pause(250);
  p = await run(page, probe);
  check(p.classifyDelay === "future" && !p.revealed.includes(p.delayLine) && String(p.delayText || "").trim() === "", `14. ligne future (30) reste verrouillée et vide après undo/redo`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Standard et Autonome : undo/redo libres ===== */
for (const level of ["standard", "expert"]) {
  const { context, page, consoleErrors } = await preparePage();
  await page.selectOption("#missionHelpLevel", level);
  await pause(250);
  await page.evaluate(() => { const e = document.getElementById("codeEditor"); e.focus(); e.setSelectionRange(0, 0); });
  /* Saisie d'un jeton sans retour à la ligne (une seule unité d'annulation). */
  await page.keyboard.type("ZZZ");
  await pause(150);
  const typed = await page.evaluate(() => document.getElementById("codeEditor").value.startsWith("ZZZ"));
  await page.keyboard.press("Control+Z");
  await pause(150);
  const undone = await page.evaluate(() => !document.getElementById("codeEditor").value.startsWith("ZZZ"));
  await page.keyboard.press("Control+Y");
  await pause(150);
  const redone = await page.evaluate(() => document.getElementById("codeEditor").value.startsWith("ZZZ"));
  check(typed && undone && redone, `15/16. ${level} : saisie/undo/redo libres`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Classique : aucune régression ===== */
{
  const { context, page, consoleErrors } = await preparePage();
  await page.click("#missionClassic").catch(() => {});
  await pause(300);
  /* Le mode classique ne doit pas planter et l'éditeur reste utilisable. */
  let threw = false;
  try {
    await page.evaluate(() => { const e = document.getElementById("codeEditor"); if (e) { e.focus(); } });
    await page.keyboard.press("Control+Z").catch(() => {});
  } catch (e) { threw = true; }
  check(!threw && consoleErrors.length === 0, `17. Classique : aucune régression (pas d'erreur console)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Sauvegarde / rechargement après undo puis après redo ===== */
{
  const { context, page, consoleErrors } = await preparePage(false);
  await page.evaluate(() => localStorage.clear());
  await run(page, fillGuided, PARTIAL);
  await pause(300);
  await run(page, caretEnd, "showHumidity");
  await pause(100);
  await page.keyboard.type(" // note");
  await pause(150);
  await page.keyboard.press("Control+Z");
  await pause(200);
  const afterUndo = await page.evaluate(() => document.getElementById("codeEditor").value.split("\n")[22]);
  await page.click("#missionSave");
  await pause(200);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#codeEditor", { state: "visible" }).catch(() => {});
  if (await page.evaluate(() => document.getElementById("missionModeRoot")?.classList.contains("mission-hidden"))) await page.click("#missionActivate").catch(() => {});
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry)).catch(() => {});
  await pause(400);
  check((await page.evaluate(() => document.getElementById("codeEditor").value.split("\n")[22])) === afterUndo, `18. sauvegarde/rechargement cohérents après undo`);

  /* Refait une modification, la rétablit, enregistre, recharge. */
  await run(page, caretEnd, "showHumidity");
  await pause(100);
  await page.keyboard.type(" // r");
  await pause(120);
  await page.keyboard.press("Control+Z");
  await pause(120);
  await page.keyboard.press("Control+Y");
  await pause(150);
  const afterRedo = await page.evaluate(() => document.getElementById("codeEditor").value.split("\n")[22]);
  await page.click("#missionSave");
  await pause(200);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#codeEditor", { state: "visible" }).catch(() => {});
  if (await page.evaluate(() => document.getElementById("missionModeRoot")?.classList.contains("mission-hidden"))) await page.click("#missionActivate").catch(() => {});
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry)).catch(() => {});
  await pause(400);
  check((await page.evaluate(() => document.getElementById("codeEditor").value.split("\n")[22])) === afterRedo, `19. sauvegarde/rechargement cohérents après redo`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 20. Zéro erreur console. */
check(allConsoleErrors.length === 0, `20. zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ RACCOURCIS & HISTORIQUE =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — Ctrl+C, Ctrl+Z, Ctrl+Y, Ctrl+Maj+Z natifs, revalidation après undo/redo, protections et modes vérifiés.`);
}
