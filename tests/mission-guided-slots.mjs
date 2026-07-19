/* Test Playwright — VERROUILLAGE des emplacements éditables (baselineSlotIndices). */
/* Garantit que SEULES les lignes cibles d'étape sont éditables, et qu'une ligne vide de */
/* structure/séparation (ex. entre setup() et loop()) ne devient JAMAIS éditable, même si */
/* une future mise en forme ajoute des lignes vides. Couvre aussi la préservation du code */
/* après rétrogradation, la protection commentaires/structure, Ctrl+C multi-lignes et undo/redo. */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"]]);
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
/* Résout la ligne courante d'une étape. */
function stepLine(stepId) {
  const v = window.TechnoQuestMissionValidator;
  const code = document.getElementById("codeEditor").value;
  return v.findLineForStep(code, stepId, v.validate(code, 1), 1, "edition");
}
const PARTIAL = {
  include: "#include <Arduino.h>", serialBegin: "  Serial.begin(9600);", pinMode: "  pinMode(PIN_RELAIS_POMPE, OUTPUT);", safeLowSetup: "  digitalWrite(PIN_RELAIS_POMPE, LOW);",
  readHumidity: "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);", readLight: "  int lumiere = analogRead(PIN_LUMIERE);", readWater: "  int niveauEau = analogRead(PIN_NIVEAU_EAU);",
  showHumidity: "  Serial.println(humiditeSol);", showLight: "  Serial.println(lumiere);", showWater: "  Serial.println(niveauEau);"
};
/* Place le curseur (réduit) sur une ligne, au retrait, et signale un clic. */
function clickLine(lineIndex) {
  const e = document.getElementById("codeEditor");
  const L = e.value.split("\n");
  const start = L.slice(0, lineIndex).reduce((t, l) => t + l.length + 1, 0);
  const indent = (L[lineIndex].match(/^\s*/) || [""])[0].length;
  e.focus(); e.setSelectionRange(start + indent, start + indent);
  e.dispatchEvent(new Event("click", { bubbles: true }));
  e.dispatchEvent(new Event("mouseup", { bubbles: true }));
}
const caretLineOf = () => { const e = document.getElementById("codeEditor"); return e.value.slice(0, e.selectionStart).split("\n").length - 1; };

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
async function preparePage() {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: sessionUrl }).catch(() => {});
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("dialog", d => d.accept().catch(() => {}));
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#missionActivate", { state: "visible" });
  await page.click("#missionActivate");
  await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.editableSlots));
  return { context, page, consoleErrors };
}

/* Ensemble attendu des emplacements éditables (lignes cibles d'étape, squelette include-slot). */
/* include a désormais sa propre ligne de code vide (ligne 1), donc aucun slot n'est un commentaire. */
const EXPECTED_SLOTS = [1, 8, 10, 12, 24, 27, 30, 35, 38, 41, 43, 45];
/* Ligne vide STRUCTURELLE (séparateur entre setup() et loop()) : ne doit jamais être éditable. */
const SEPARATOR_LINE = 14;

{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(500);

  /* VERROU : la source explicite des emplacements éditables = exactement les lignes cibles d'étape. */
  const slots = await page.evaluate(() => window.TechnoQuestGuidedGeometry.editableSlots());
  check(JSON.stringify(slots) === JSON.stringify(EXPECTED_SLOTS), `verrou : emplacements éditables = lignes cibles d'étape ${JSON.stringify(EXPECTED_SLOTS)} (obtenu ${JSON.stringify(slots)})`);

  /* VERROU GÉNÉRAL : toute ligne vide du squelette qui n'est PAS une cible d'étape n'est jamais éditable. */
  const blankAudit = await page.evaluate(() => {
    const v = window.TechnoQuestMissionValidator;
    const skeleton = v.getSkeleton("guided", 1).split("\n");
    const slots = window.TechnoQuestGuidedGeometry.editableSlots();
    const model = window.TechnoQuestGuidedGeometry.model();
    const blanks = [];
    skeleton.forEach((l, i) => { if (l.trim() === "") blanks.push(i); });
    const blanksWithoutStep = blanks.filter(i => !slots.includes(i));
    const leaks = blanksWithoutStep.filter(i => model.isEditable(i));
    return { blanks, blanksWithoutStep, leaks };
  });
  check(blankAudit.blanksWithoutStep.includes(SEPARATOR_LINE), `séparateur : la ligne vide ${SEPARATOR_LINE + 1} (entre setup() et loop()) existe et est hors des emplacements`);
  check(blankAudit.leaks.length === 0, `verrou général : aucune ligne vide sans étape n'est éditable (fuites : ${JSON.stringify(blankAudit.leaks)})`);

  /* Résout dynamiquement les lignes utiles. */
  const showHumLine = await run(page, stepLine, "showHumidity");
  const delayLine = await run(page, stepLine, "delay");

  /* 1. Une ligne vide associée à une étape RÉVÉLÉE est éditable (clic conservé). */
  await run(page, clickLine, showHumLine);
  await pause(200);
  check((await page.evaluate(caretLineOf)) === showHumLine, `1. ligne d'étape révélée (${showHumLine + 1}) éditable : le clic y reste`);

  /* 2. Une ligne vide associée à une étape FUTURE reste verrouillée (clic ramené). */
  await run(page, clickLine, delayLine);
  await pause(200);
  const cFuture = await page.evaluate(caretLineOf);
  check(cFuture !== delayLine, `2. ligne d'étape future (${delayLine + 1}) verrouillée : le clic est ramené (obtenu ${cFuture})`);

  /* 3. Une ligne vide de SÉPARATION reste non éditable (clic ramené). */
  await run(page, clickLine, SEPARATOR_LINE);
  await pause(200);
  const cSep = await page.evaluate(caretLineOf);
  check(cSep !== SEPARATOR_LINE, `3. ligne de séparation (${SEPARATOR_LINE + 1}) non éditable : le clic est ramené (obtenu ${cSep})`);

  /* 4. La ligne vide près d'une accolade (séparateur, juste après « } // Fin de setup(). ») reste non éditable. */
  const classifySep = await page.evaluate(sep => window.TechnoQuestGuidedGeometry.model().classify(sep), SEPARATOR_LINE);
  check(classifySep !== "target" && classifySep !== "revealed", `4. ligne près d'une accolade (séparateur) classée non éditable (${classifySep})`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 5. Le code déjà écrit APRÈS une rétrogradation reste conservé. */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  /* Casse showHumidity par frappe réelle (ligne résolue dynamiquement). */
  await page.evaluate(() => {
    const e = document.getElementById("codeEditor"); const v = window.TechnoQuestMissionValidator;
    const shl = v.findLineForStep(e.value, "showHumidity", v.validate(e.value, 1), 1, "edition");
    const L = e.value.split("\n");
    const start = L.slice(0, shl).reduce((t, l) => t + l.length + 1, 0);
    const col = L[shl].indexOf("humiditeSol") + "humiditeSol".length;
    e.focus(); e.setSelectionRange(start + col, start + col); e.dispatchEvent(new Event("click", { bubbles: true }));
  });
  await pause(150);
  await page.keyboard.press("Backspace"); await page.keyboard.press("Backspace"); await page.keyboard.press("Backspace");
  await pause(400);
  const after = await page.evaluate(() => {
    const e = document.getElementById("codeEditor"); const v = window.TechnoQuestMissionValidator; const res = v.validate(e.value, 1); const L = e.value.split("\n");
    return { lLight: L[v.findLineForStep(e.value, "showLight", res, 1, "edition")], lWater: L[v.findLineForStep(e.value, "showWater", res, 1, "edition")], first: res.firstMissing?.id };
  });
  check(after.lLight === "  Serial.println(lumiere);" && after.lWater === "  Serial.println(niveauEau);" && after.first === "showHumidity", `5. code postérieur conservé après rétrogradation (firstMissing=${after.first})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 6. Commentaires ET structure restent protégés (restaurés si altérés), code élève conservé. */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  /* Repère une ligne de commentaire et une ligne de structure (const) réelles. */
  const idx = await page.evaluate(() => {
    const L = document.getElementById("codeEditor").value.split("\n");
    return { comment: L.findIndex(l => /Lire l'humidit/.test(l)), structure: L.findIndex(l => /const int PIN_HUMIDITE_SOL/.test(l)) };
  });
  const before = await page.evaluate(i => { const L = document.getElementById("codeEditor").value.split("\n"); return { comment: L[i.comment], structure: L[i.structure] }; }, idx);
  /* Corrompt par programme un commentaire ET une ligne de structure. */
  await page.evaluate(i => {
    const e = document.getElementById("codeEditor"); const L = e.value.split("\n");
    L[i.comment] = "  // PIRATE COMMENTAIRE"; L[i.structure] = "const int PIN_HUMIDITE_SOL = A5; // pirate structure";
    e.value = L.join("\n"); e.setSelectionRange(0, 0); e.dispatchEvent(new Event("input", { bubbles: true }));
  }, idx);
  await pause(400);
  const restored = await page.evaluate(i => {
    const e = document.getElementById("codeEditor"); const v = window.TechnoQuestMissionValidator; const L = e.value.split("\n");
    const shl = v.findLineForStep(e.value, "showHumidity", v.validate(e.value, 1), 1, "edition");
    return { comment: L[i.comment], structure: L[i.structure], show: L[shl] };
  }, idx);
  check(restored.comment === before.comment && restored.structure === before.structure, `6. commentaire ET structure restaurés après altération`);
  check(restored.show === "  Serial.println(humiditeSol);", `6. code de l'élève préservé pendant la restauration`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 7. Ctrl+C sur plusieurs lignes fonctionne toujours. */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  await page.evaluate(() => {
    const e = document.getElementById("codeEditor"); const v = window.TechnoQuestMissionValidator; const res = v.validate(e.value, 1); const L = e.value.split("\n");
    const a = v.findLineForStep(e.value, "showHumidity", res, 1, "edition"); const b = v.findLineForStep(e.value, "showLight", res, 1, "edition");
    const off = i => L.slice(0, i).reduce((t, l) => t + l.length + 1, 0);
    e.focus(); e.setSelectionRange(off(a) + L[a].indexOf("Serial"), off(b) + L[b].indexOf(";") + 1);
  });
  await pause(120);
  await page.keyboard.press("Control+C");
  await pause(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => "(échec)"));
  check(/humiditeSol/.test(clip) && /lumiere/.test(clip) && clip.includes("\n"), `7. Ctrl+C multi-lignes fonctionne toujours`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 8. Ctrl+Z, Ctrl+Y, Ctrl+Maj+Z restent fonctionnels. */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  await page.evaluate(() => { const e = document.getElementById("codeEditor"); const v = window.TechnoQuestMissionValidator; const shl = v.findLineForStep(e.value, "showHumidity", v.validate(e.value, 1), 1, "edition"); const L = e.value.split("\n"); const s = L.slice(0, shl).reduce((t, l) => t + l.length + 1, 0); e.focus(); e.setSelectionRange(s + L[shl].length, s + L[shl].length); e.dispatchEvent(new Event("click", { bubbles: true })); });
  await pause(120);
  await page.keyboard.type("Q"); await pause(150);
  const l22 = () => page.evaluate(() => { const e = document.getElementById("codeEditor"); const v = window.TechnoQuestMissionValidator; const shl = v.findLineForStep(e.value, "showHumidity", v.validate(e.value, 1), 1, "edition"); return e.value.split("\n")[shl]; });
  check((await l22()).endsWith("Q"), `8. saisie appliquée`);
  await page.keyboard.press("Control+Z"); await pause(150);
  check(!(await l22()).endsWith("Q"), `8. Ctrl+Z annule`);
  await page.keyboard.press("Control+Y"); await pause(150);
  check((await l22()).endsWith("Q"), `8. Ctrl+Y rétablit`);
  await page.keyboard.press("Control+Z"); await pause(120);
  await page.keyboard.press("Control+Shift+Z"); await pause(150);
  check((await l22()).endsWith("Q"), `8. Ctrl+Maj+Z rétablit également`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 9. Zéro erreur console. */
check(allConsoleErrors.length === 0, `9. zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ EMPLACEMENTS ÉDITABLES (baselineSlotIndices) =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — seuls les emplacements de réponse (lignes cibles d'étape) sont éditables ; séparateurs et structure protégés.`);
}
