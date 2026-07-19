/* Test Playwright — validation CONTEXTUELLE Arduino de la séance 1 dans la vraie page. */
/* Vérifie, dans le navigateur réel (module d'analyse + validateur chargés) :             */
/*  - les 20 scénarios de contexte/fonction/variable ;                                    */
/*  - la remontée du message pédagogique dans l'interface (bouton « Vérifier ») ;         */
/*  - zéro erreur console ;                                                                */
/*  - aucune régression du chargement (Guidé/Standard/Autonome).                           */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"], [".webp", "image/webp"]]);
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
    const contentType = mimeTypes.get(path.extname(localPath).toLowerCase()) || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

/* Valide un programme dans la page et renvoie un résumé (validateur réel du navigateur). */
function validateInPage(code) {
  const result = window.TechnoQuestMissionValidator.validate(code, 1);
  const ok = {};
  const messages = {};
  result.steps.forEach(step => { ok[step.id] = step.ok; messages[step.id] = step.message; });
  return { ok, messages, allOk: result.allOk, first: result.firstMissing ? result.firstMissing.id : null };
}

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;
const browser = await chromium.launch({ headless: true });

const failures = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}

const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
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
/* Vérifie que le module d'analyse ET le validateur sont bien chargés dans la page. */
await page.waitForFunction(() => Boolean(window.TechnoQuestMissionValidator && window.TechnoQuestMissionArduinoAnalysis));
check(await page.evaluate(() => Boolean(window.TechnoQuestMissionArduinoAnalysis && typeof window.TechnoQuestMissionArduinoAnalysis.analyze === "function")), "module d'analyse Arduino chargé dans la page");

/* Récupère le code de référence via le validateur de la page. */
const REFERENCE = await page.evaluate(() => window.TechnoQuestMissionValidator.getReferenceCode(1));
/* Remplace une occurrence dans un texte (côté Node). */
function replaceOnce(code, from, to) {
  const index = code.indexOf(from);
  if (index < 0) throw new Error(`Fragment introuvable : ${from}`);
  return code.slice(0, index) + to + code.slice(index + from.length);
}
/* Valide un programme dans la page. */
async function validate(code) {
  return page.evaluate(({ fn, c }) => new Function(`return (${fn})`)()(c), { fn: validateInPage.toString(), c: code });
}

/* --- Les 20 scénarios (dans le navigateur réel) --- */

/* 1. Programme correct complet. */
check((await validate(REFERENCE)).allOk === true, "1. programme correct complet → tout validé");

/* 2. Serial.begin seulement dans loop(). */
{
  let c = replaceOnce(REFERENCE, "  Serial.begin(9600);\n", "");
  c = replaceOnce(c, "void loop() {\n", "void loop() {\n  Serial.begin(9600);\n");
  const r = await validate(c);
  check(r.ok.serialBegin === false && /setup\(\)/.test(r.messages.serialBegin), "2. Serial.begin dans loop() → refusé + message setup()");
}

/* 3. pinMode seulement dans loop(). */
{
  let c = replaceOnce(REFERENCE, "  pinMode(PIN_RELAIS_POMPE, OUTPUT);\n", "");
  c = replaceOnce(c, "void loop() {\n", "void loop() {\n  pinMode(PIN_RELAIS_POMPE, OUTPUT);\n");
  const r = await validate(c);
  check(r.ok.pinMode === false && /setup\(\)/.test(r.messages.pinMode), "3. pinMode dans loop() → refusé + message setup()");
}

/* 4. safeLowSetup seulement dans loop(). */
{
  const c = replaceOnce(REFERENCE, "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n}", "}");
  const r = await validate(c);
  check(r.ok.safeLowSetup === false && r.ok.pumpStop === true, "4. LOW seulement dans loop() → safeLowSetup refusé, pumpStop validé");
}

/* 5. pumpStop seulement dans setup(). */
{
  const c = replaceOnce(REFERENCE, "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n  delay(1000);", "  delay(1000);");
  const r = await validate(c);
  check(r.ok.pumpStop === false && /loop\(\)/.test(r.messages.pumpStop) && r.ok.safeLowSetup === true, "5. LOW seulement dans setup() → pumpStop refusé + message loop()");
}

/* 6. Un seul digitalWrite LOW dans setup(). */
{
  const c = replaceOnce(REFERENCE, "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n  delay(1000);", "  delay(1000);");
  const r = await validate(c);
  check(r.ok.safeLowSetup === true && r.ok.pumpStop === false, "6. un seul LOW (setup) → safeLowSetup OK, pumpStop refusé");
}

/* 7. Deux digitalWrite LOW, un dans chaque fonction. */
{
  const r = await validate(REFERENCE);
  check(r.ok.safeLowSetup === true && r.ok.pumpStop === true, "7. un LOW dans chaque fonction → safeLowSetup ET pumpStop validés");
}

/* 8. Mauvaise broche pour pinMode. */
{
  const c = replaceOnce(REFERENCE, "pinMode(PIN_RELAIS_POMPE, OUTPUT);", "pinMode(PIN_HUMIDITE_SOL, OUTPUT);");
  const r = await validate(c);
  check(r.ok.pinMode === false && /broche du relais/.test(r.messages.pinMode), "8. pinMode mauvaise broche → refusé + message");
}

/* 9. INPUT au lieu de OUTPUT. */
{
  const c = replaceOnce(REFERENCE, "pinMode(PIN_RELAIS_POMPE, OUTPUT);", "pinMode(PIN_RELAIS_POMPE, INPUT);");
  const r = await validate(c);
  check(r.ok.pinMode === false && /OUTPUT/.test(r.messages.pinMode), "9. pinMode INPUT → refusé + message OUTPUT");
}

/* 10. Lecture du mauvais capteur. */
{
  const c = replaceOnce(REFERENCE, "int lumiere = analogRead(PIN_LUMIERE);", "int lumiere = analogRead(PIN_HUMIDITE_SOL);");
  const r = await validate(c);
  check(r.ok.readLight === false && r.ok.readHumidity === true, "10. lecture mauvais capteur → readLight refusé");
}

/* 11. showSoil (humidité) avec une mauvaise variable — plusieurs affichés → message NEUTRE exact. */
{
  const c = replaceOnce(REFERENCE, "Serial.println(humidite);", "Serial.println(lumiere);");
  const r = await validate(c);
  check(r.ok.showHumidity === false && /ne correspond pas à la mesure attendue/.test(r.messages.showHumidity) && !/lumière|humidité|niveau d'eau/.test(r.messages.showHumidity), "11. mauvaise variable (ambigu) → message neutre sans nommer de capteur");
}

/* 11b. Un seul capteur affiché et c'est le mauvais → identification CERTAINE (message nommé). */
{
  let c = replaceOnce(REFERENCE, "  Serial.print(\"Humidité : \");\n  Serial.println(humidite);\n", "");
  c = replaceOnce(c, "  Serial.print(\"Niveau d'eau : \");\n  Serial.println(niveauEau);\n", "");
  const r = await validate(c);
  check(r.ok.showHumidity === false && /la lumière à l'étape consacrée à l'humidité du sol/.test(r.messages.showHumidity), "11b. un seul capteur affiché (lumière) → message nommé certain");
}

/* 12. showLight avec une mauvaise variable — ambigu → message NEUTRE. */
{
  const c = replaceOnce(REFERENCE, "Serial.println(lumiere);", "Serial.println(niveauEau);");
  const r = await validate(c);
  check(r.ok.showLight === false && /ne correspond pas à la mesure attendue/.test(r.messages.showLight), "12. mauvaise variable (ambigu) à l'étape lumière → message neutre");
}

/* 13. showWater avec une mauvaise variable — ambigu → message NEUTRE. */
{
  const c = replaceOnce(REFERENCE, "Serial.println(niveauEau);", "Serial.println(humidite);");
  const r = await validate(c);
  check(r.ok.showWater === false && /ne correspond pas à la mesure attendue/.test(r.messages.showWater), "13. mauvaise variable (ambigu) à l'étape eau → message neutre");
}

/* 14. Instruction uniquement commentée. */
{
  const c = replaceOnce(REFERENCE, "  Serial.begin(9600);", "  // Serial.begin(9600);");
  const r = await validate(c);
  check(r.ok.serialBegin === false && /commentaire ou une chaîne/.test(r.messages.serialBegin), "14. Serial.begin commenté → refusé + message");
}

/* 15. Instruction seulement dans une chaîne. */
{
  const c = replaceOnce(REFERENCE, "  Serial.begin(9600);", '  Serial.println("Serial.begin(9600);");');
  const r = await validate(c);
  check(r.ok.serialBegin === false && /commentaire ou une chaîne/.test(r.messages.serialBegin), "15. Serial.begin dans une chaîne → refusé + message");
}

/* 16. Espaces et retours à la ligne inhabituels mais valides. */
{
  let c = replaceOnce(REFERENCE, "  Serial.begin(9600);", "  Serial . begin (  9600  ) ;");
  c = replaceOnce(c, "  pinMode(PIN_RELAIS_POMPE, OUTPUT);", "  pinMode(\n    PIN_RELAIS_POMPE,\n    OUTPUT\n  );");
  const r = await validate(c);
  check(r.ok.serialBegin === true && r.ok.pinMode === true, "16. espaces/retours à la ligne inhabituels → acceptés");
}

/* 17. Commentaires ajoutés par l'élève. */
{
  let c = replaceOnce(REFERENCE, "void loop() {", "void loop() { // ma boucle");
  c = replaceOnce(c, "  delay(1000);", "  // j'attends\n  delay(1000);");
  const r = await validate(c);
  check(r.allOk === true, "17. commentaires ajoutés par l'élève → toujours valide");
}

/* 18. Accolades imbriquées dans if/else. */
{
  const c = replaceOnce(REFERENCE, "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n  delay(1000);\n}", "  if (niveauEau < 100) {\n    digitalWrite(PIN_RELAIS_POMPE, LOW);\n  } else {\n    digitalWrite(PIN_RELAIS_POMPE, LOW);\n  }\n  delay(1000);\n}");
  const r = await validate(c);
  check(r.ok.pumpStop === true && r.allOk === true, "18. accolades imbriquées if/else → détection correcte");
}

/* 19. Programme incomplet. */
{
  const c = REFERENCE.slice(0, REFERENCE.indexOf("void loop() {") + 40);
  const r = await validate(c);
  check(r.allOk === false, "19. programme incomplet → non validé (sans plantage)");
}

/* 20. Interface : le message pédagogique remonte via le bouton « Vérifier ». */
{
  /* Charge dans l'éditeur un programme où Serial.begin est dans loop() (mal placé). */
  let c = replaceOnce(REFERENCE, "  Serial.begin(9600);\n", "");
  c = replaceOnce(c, "void loop() {\n", "void loop() {\n  Serial.begin(9600);\n");
  await page.evaluate(code => {
    const editor = document.getElementById("codeEditor");
    editor.value = code;
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }, c);
  await pause(200);
  await page.click("#missionCheck");
  await pause(200);
  const message = await page.evaluate(() => document.getElementById("missionMessage")?.textContent || "");
  check(/doit être placé dans setup/.test(message), `20. bouton « Vérifier » affiche le message contextuel ("${message.slice(0, 90)}…")`);
}

/* Non-régression du chargement des trois niveaux d'aide (aucun plantage de validation). */
for (const level of ["standard", "expert", "guided"]) {
  await page.selectOption("#missionHelpLevel", level).catch(() => {});
  await pause(200);
  const ok = await page.evaluate(() => { try { window.TechnoQuestMissionValidator.validate(document.getElementById("codeEditor").value, 1); return true; } catch (e) { return false; } });
  check(ok === true, `non-régression : validation sans plantage en niveau ${level}`);
}

/* Zéro erreur console sur l'ensemble. */
check(consoleErrors.length === 0, `zéro erreur console (${JSON.stringify(consoleErrors)})`);

await context.close();
await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ VALIDATEUR (NAVIGATEUR) =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — validation contextuelle vérifiée dans le navigateur, message remonté à l'interface, zéro erreur console.`);
}
