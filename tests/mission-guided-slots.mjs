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

/* Remplit le squelette guidé réel (index figés). */
function fillGuided(overrides) {
  const lines = window.TechnoQuestMissionValidator.getSkeleton("guided", 1).split("\n");
  Object.keys(overrides).forEach(k => { lines[Number(k)] = overrides[k]; });
  const editor = document.getElementById("codeEditor");
  editor.value = lines.join("\n");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}
const PARTIAL = {
  0: "#include <Arduino.h>", 7: "  Serial.begin(9600);", 9: "  pinMode(PIN_RELAIS_POMPE, OUTPUT);", 11: "  digitalWrite(PIN_RELAIS_POMPE, LOW);",
  16: "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);", 18: "  int lumiere = analogRead(PIN_LUMIERE);", 20: "  int niveauEau = analogRead(PIN_NIVEAU_EAU);",
  22: "  Serial.println(humiditeSol);", 24: "  Serial.println(lumiere);", 26: "  Serial.println(niveauEau);"
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

/* Ensemble attendu des emplacements éditables (lignes cibles d'étape). */
const EXPECTED_SLOTS = [0, 7, 9, 11, 16, 18, 20, 22, 24, 26, 28, 30];

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
  check(blankAudit.blanksWithoutStep.includes(13), `séparateur : la ligne vide 13 (entre setup() et loop()) existe et est hors des emplacements`);
  check(blankAudit.leaks.length === 0, `verrou général : aucune ligne vide sans étape n'est éditable (fuites : ${JSON.stringify(blankAudit.leaks)})`);

  /* 1. Une ligne vide associée à une étape RÉVÉLÉE est éditable (clic conservé). */
  await run(page, clickLine, 22);
  await pause(200);
  check((await page.evaluate(caretLineOf)) === 22, `1. ligne d'étape révélée (22) éditable : le clic y reste`);

  /* 2. Une ligne vide associée à une étape FUTURE reste verrouillée (clic ramené). */
  await run(page, clickLine, 30);
  await pause(200);
  const c30 = await page.evaluate(caretLineOf);
  check(c30 !== 30, `2. ligne d'étape future (30) verrouillée : le clic est ramené (obtenu ${c30})`);

  /* 3. Une ligne vide de SÉPARATION (13) reste non éditable (clic ramené). */
  await run(page, clickLine, 13);
  await pause(200);
  const c13 = await page.evaluate(caretLineOf);
  check(c13 !== 13, `3. ligne de séparation (13) non éditable : le clic est ramené (obtenu ${c13})`);

  /* 4. La ligne vide près d'une accolade (13, juste après « } // Fin de setup(). ») reste non éditable. */
  const classify13 = await page.evaluate(() => window.TechnoQuestGuidedGeometry.model().classify(13));
  check(classify13 !== "target" && classify13 !== "revealed", `4. ligne près d'une accolade (13) classée non éditable (${classify13})`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 5. Le code déjà écrit APRÈS une rétrogradation reste conservé. */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  /* Casse showHumidity (ligne 22) par frappe réelle. */
  await page.evaluate(() => {
    const e = document.getElementById("codeEditor"); const L = e.value.split("\n");
    const start = L.slice(0, 22).reduce((t, l) => t + l.length + 1, 0);
    const col = L[22].indexOf("humiditeSol") + "humiditeSol".length;
    e.focus(); e.setSelectionRange(start + col, start + col); e.dispatchEvent(new Event("click", { bubbles: true }));
  });
  await pause(150);
  await page.keyboard.press("Backspace"); await page.keyboard.press("Backspace"); await page.keyboard.press("Backspace");
  await pause(400);
  const after = await page.evaluate(() => { const L = document.getElementById("codeEditor").value.split("\n"); return { l24: L[24], l26: L[26], first: window.TechnoQuestMissionValidator.validate(document.getElementById("codeEditor").value, 1).firstMissing?.id }; });
  check(after.l24 === "  Serial.println(lumiere);" && after.l26 === "  Serial.println(niveauEau);" && after.first === "showHumidity", `5. code postérieur conservé après rétrogradation (firstMissing=${after.first})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 6. Commentaires ET structure restent protégés (restaurés si altérés), code élève conservé. */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  const before = await page.evaluate(() => { const L = document.getElementById("codeEditor").value.split("\n"); return { comment15: L[15], structure1: L[1] }; });
  /* Corrompt par programme un commentaire (15) ET une ligne de structure (1). */
  await page.evaluate(() => {
    const e = document.getElementById("codeEditor"); const L = e.value.split("\n");
    L[15] = "  // PIRATE COMMENTAIRE"; L[1] = "const int PIN_HUMIDITE_SOL = A5; // pirate structure";
    e.value = L.join("\n"); e.setSelectionRange(0, 0); e.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await pause(400);
  const restored = await page.evaluate(() => { const L = document.getElementById("codeEditor").value.split("\n"); return { comment15: L[15], structure1: L[1], l22: L[22], count: L.length }; });
  check(restored.comment15 === before.comment15 && restored.structure1 === before.structure1, `6. commentaire ET structure restaurés après altération`);
  check(restored.l22 === "  Serial.println(humiditeSol);", `6. code de l'élève préservé pendant la restauration`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* 7. Ctrl+C sur plusieurs lignes fonctionne toujours. */
{
  const { context, page, consoleErrors } = await preparePage();
  await run(page, fillGuided, PARTIAL);
  await pause(400);
  await page.evaluate(() => {
    const e = document.getElementById("codeEditor"); const L = e.value.split("\n");
    const off = i => L.slice(0, i).reduce((t, l) => t + l.length + 1, 0);
    e.focus(); e.setSelectionRange(off(22) + L[22].indexOf("Serial"), off(24) + L[24].indexOf(";") + 1);
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
  await page.evaluate(() => { const e = document.getElementById("codeEditor"); const L = e.value.split("\n"); const s = L.slice(0, 22).reduce((t, l) => t + l.length + 1, 0); e.focus(); e.setSelectionRange(s + L[22].length, s + L[22].length); e.dispatchEvent(new Event("click", { bubbles: true })); });
  await pause(120);
  await page.keyboard.type("Q"); await pause(150);
  const l22 = () => page.evaluate(() => document.getElementById("codeEditor").value.split("\n")[22]);
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
