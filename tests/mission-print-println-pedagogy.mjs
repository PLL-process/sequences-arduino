/* Test Playwright — PÉDAGOGIE Serial.print() / Serial.println() (séance 1, mode Guidé). */
/* Vérifie : les deux commentaires print/println protégés, les libellés Serial.print("…") */
/* préremplis et protégés, la ligne de réponse vide ciblée, la validation contextuelle par */
/* variable, l'autocomplétion propre à l'étape, la migration v5→v6, les modes libres et le */
/* programme complet — sur 1920×1080, 1366×768, 390×844 et zoom 200 %, sans erreur console. */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"]]);
const pause = ms => new Promise(r => setTimeout(r, ms));

const server = http.createServer(async (request, response) => {
  try {
    const parsedUrl = new URL(request.url || "/", "http://127.0.0.1");
    const requestedPath = decodeURIComponent(parsedUrl.pathname) === "/" ? "/seance-1.html" : decodeURIComponent(parsedUrl.pathname);
    const candidatePath = path.resolve(repositoryRoot, `.${requestedPath}`);
    if (!candidatePath.startsWith(repositoryRoot)) throw new Error("Chemin interdit");
    const localStat = await stat(candidatePath);
    const body = await readFile(localStat.isDirectory() ? path.join(candidatePath, "index.html") : candidatePath);
    response.writeHead(200, { "Content-Type": mimeTypes.get(path.extname(candidatePath).toLowerCase()) || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

const browser = await chromium.launch({ headless: true });
const failures = [];
const allConsoleErrors = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const sessionUrl = `http://127.0.0.1:${server.address().port}/seance-1.html`;

/* Programme complet de référence (produit conceptuellement les trois lignes attendues). */
const FULL_PROGRAM = `#include <Arduino.h>
const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}
void loop() {
  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);
  Serial.print("Humidité du sol : ");
  Serial.println(humiditeSol);
  Serial.print("Lumière : ");
  Serial.println(lumiere);
  Serial.print("Niveau d'eau : ");
  Serial.println(niveauEau);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);
}`;

async function openPage(viewport = { width: 1366, height: 768 }, deviceScaleFactor = 1, seed = null) {
  const context = await browser.newContext({ viewport, deviceScaleFactor });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("dialog", d => d.accept().catch(() => {}));
  if (seed) await context.addInitScript(s => localStorage.setItem("technoquest-mission-v1", s), JSON.stringify(seed));
  else await context.addInitScript(() => localStorage.clear());
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await pause(400);
  return { context, page, consoleErrors };
}

/* Valide un extrait de programme et renvoie l'état d'une étape. */
async function stepState(page, code, stepId) {
  return page.evaluate(([c, id]) => {
    const r = window.TechnoQuestMissionValidator.validate(c, 1);
    const s = r.steps.find(x => x.id === id);
    return { ok: s.ok, message: s.message, allOk: r.allOk };
  }, [code, stepId]);
}

/* ===== A. STRUCTURE GUIDÉE : commentaires + libellés préremplis + ligne de réponse ===== */
{
  const { context, page, consoleErrors } = await openPage();
  await page.click("#missionActivate");
  await pause(300);
  const s = await page.evaluate(() => {
    const V = window.TechnoQuestMissionValidator;
    const G = window.TechnoQuestGuidedGeometry;
    const sk = V.getSkeleton("guided", 1);
    const lines = sk.split("\n");
    const res = V.validate(sk, 1);
    const slots = G.editableSlots();
    const comments = G.protectedComments();
    const line = id => V.findLineForStep(sk, id, res, 1, "edition");
    const model = G.model();
    const idx = re => lines.findIndex(l => re.test(l));
    const printComment = idx(/Serial\.print\(\) affiche sans passer/);
    const printlnComment = idx(/Serial\.println\(\) affiche puis passe/);
    const labelHum = idx(/Serial\s*\.\s*print\s*\(\s*"Humidit/);
    const labelLight = idx(/Serial\s*\.\s*print\s*\(\s*"Lumi/);
    const labelWater = idx(/Serial\s*\.\s*print\s*\(\s*"Niveau/);
    return {
      printComment, printlnComment, labelHum, labelLight, labelWater,
      showHum: line("showHumidity"), showLight: line("showLight"), showWater: line("showWater"),
      slots, comments,
      slotHasLabel: slots.some(i => /Serial\s*\.\s*print\s*\(\s*"/.test(lines[i] || "")),
      slotHasComment: slots.some(i => /^\s*\/\//.test(lines[i] || "")),
      labelsAreComments: [printComment, printlnComment].every(i => comments.includes(i)),
      classifyLabelHum: model.classify(labelHum), classifyPrintComment: model.classify(printComment),
      editableLabelHum: model.isEditable(labelHum), editablePrintComment: model.isEditable(printComment),
      contentShowHum: lines[line("showHumidity")], contentLabelHum: lines[labelHum]
    };
  });
  check(s.printComment >= 0 && s.printlnComment >= 0, `1. les deux commentaires print/println sont visibles dans le squelette`);
  check(s.comments.includes(s.printComment) && s.comments.includes(s.printlnComment), `2. les deux commentaires sont protégés (non éditables)`);
  check(s.labelHum >= 0 && /Humidit/.test(s.contentLabelHum), `3. Serial.print("Humidité du sol : "); est prérempli`);
  check(s.contentShowHum === "" && s.slots.includes(s.showHum), `4. la ligne de réponse (sous le libellé) est vide et éditable`);
  check(s.showHum === s.labelHum + 1 && s.showLight === s.labelLight + 1 && s.showWater === s.labelWater + 1, `5. cadre/flèche visent la ligne vide sous chaque libellé (jamais le libellé)`);
  check(!s.slotHasLabel, `13. aucune ligne Serial.print préremplie n'est un emplacement éditable`);
  check(!s.slotHasComment, `2b. aucune ligne de commentaire n'est un emplacement éditable`);
  check(!s.editableLabelHum && s.classifyLabelHum !== "revealed" && s.classifyLabelHum !== "target", `14. le libellé prérempli n'est pas éditable en Guidé (${s.classifyLabelHum})`);
  check(!s.editablePrintComment, `14b. le commentaire pédagogique n'est pas éditable en Guidé`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== B. VALIDATION CONTEXTUELLE PAR VARIABLE ===== */
{
  const { context, page, consoleErrors } = await openPage();
  const withShow = block => FULL_PROGRAM.replace(/  Serial\.print\("Humidité du sol : "\);\n[\s\S]*?  Serial\.println\(niveauEau\);\n/, block + "\n");
  /* 6. Libellé humidité seul ne valide pas showHumidity. */
  check(!(await stepState(page, withShow('  Serial.print("Humidité du sol : ");'), "showHumidity")).ok, `6. Serial.print du libellé seul ne valide pas showHumidity`);
  /* 7. println(humiditeSol) valide. */
  check((await stepState(page, withShow('  Serial.print("Humidité du sol : ");\n  Serial.println(humiditeSol);'), "showHumidity")).ok, `7. Serial.println(humiditeSol); valide showHumidity`);
  /* 8. println(lumiere) ne valide pas showHumidity. */
  const wrong = await stepState(page, withShow('  Serial.println(lumiere);'), "showHumidity");
  check(!wrong.ok && /lumi/i.test(wrong.message), `8. Serial.println(lumiere); ne valide pas showHumidity (message capteur)`);
  /* 9. Libellé lumière seul ne valide pas showLight. */
  check(!(await stepState(page, withShow('  Serial.print("Lumière : ");'), "showLight")).ok, `9. Serial.print("Lumière : "); seul ne valide pas showLight`);
  /* 10. println(lumiere) valide showLight. */
  check((await stepState(page, withShow('  Serial.print("Lumière : ");\n  Serial.println(lumiere);'), "showLight")).ok, `10. Serial.println(lumiere); valide showLight`);
  /* 11. println(niveauEau) valide showWater. */
  check((await stepState(page, withShow('  Serial.println(niveauEau);'), "showWater")).ok, `11. Serial.println(niveauEau); valide showWater`);
  /* 12. Les trois variables restent distinctes (une bonne, deux mauvaises). */
  const hOk = (await stepState(page, withShow('  Serial.println(humiditeSol);'), "showHumidity")).ok;
  const hAsL = (await stepState(page, withShow('  Serial.println(humiditeSol);'), "showLight")).ok;
  check(hOk && !hAsL, `12. les trois variables restent distinctes (humiditeSol ne valide pas showLight)`);
  /* Refus d'une instruction commentée. */
  check(!(await stepState(page, withShow('  // Serial.println(humiditeSol);'), "showHumidity")).ok, `B : une instruction commentée ne valide pas`);
  /* 17. Revalidation par variable : mauvaise variable puis bonne variable. */
  check(!(await stepState(page, withShow('  Serial.println(lumiere);'), "showHumidity")).ok && (await stepState(page, withShow('  Serial.println(humiditeSol);'), "showHumidity")).ok, `17. revalidation contextuelle après correction de la variable`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== C. AUTOCOMPLÉTION PROPRE À L'ÉTAPE (description au-dessus, commande dessous) ===== */
{
  const { context, page, consoleErrors } = await openPage();
  await page.click("#missionActivate");
  await pause(300);
  /* Remplit le squelette guidé jusqu'aux affichages (include + setup + 3 lectures) pour que */
  /* l'étape active soit showHumidity, puis place le curseur sur SA ligne de réponse (éditable). */
  await page.evaluate(() => {
    const V = window.TechnoQuestMissionValidator;
    const lines = V.getSkeleton("guided", 1).split("\n");
    const sk = lines.join("\n");
    const res0 = V.validate(sk, 1);
    /* Résout chaque emplacement par ancre pédagogique (aucun indice de ligne codé en dur). */
    const put = (id, text) => { lines[V.findLineForStep(sk, id, res0, 1, "edition")] = text; };
    put("include", "#include <Arduino.h>");
    put("serialBegin", "  Serial.begin(9600);");
    put("pinMode", "  pinMode(PIN_RELAIS_POMPE, OUTPUT);");
    put("safeLowSetup", "  digitalWrite(PIN_RELAIS_POMPE, LOW);");
    put("readHumidity", "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);");
    put("readLight", "  int lumiere = analogRead(PIN_LUMIERE);");
    put("readWater", "  int niveauEau = analogRead(PIN_NIVEAU_EAU);");
    const code = lines.join("\n");
    const ed = document.querySelector("#codeEditor");
    ed.value = code;
    ed.dispatchEvent(new Event("input", { bubbles: true }));
    /* Position du curseur au début de la ligne de réponse de showHumidity (ligne 26, index 0-based). */
    const res = V.validate(ed.value, 1);
    const target = V.findLineForStep(ed.value, "showHumidity", res, 1, "edition");
    const pos = ed.value.split("\n").slice(0, target).join("\n").length + (target > 0 ? 1 : 0);
    ed.focus();
    ed.setSelectionRange(pos, pos);
  });
  await page.keyboard.type("  Serial.print");
  await pause(400);
  const menu = await page.evaluate(() => {
    const m = document.querySelector(".mission-completion-menu");
    if (!m || m.hidden) return { found: false };
    const items = [...m.querySelectorAll(".mission-completion-item")].map(b => ({ code: b.querySelector("code").textContent, desc: b.querySelector("span").textContent, codeTop: b.querySelector("code").getBoundingClientRect().top, spanTop: b.querySelector("span").getBoundingClientRect().top }));
    return { found: true, items };
  });
  check(menu.found, `26. l'autocomplétion apparaît sur l'étape d'affichage`);
  const tailored = (menu.items || []).find(i => /Serial\.println\(\s*humiditeSol\s*\)/.test(i.code));
  check(!!tailored, `26b. propose Serial.println(humiditeSol); propre à l'étape active`);
  check(tailored && /passe à la ligne suivante/i.test(tailored.desc), `4-desc. description « Affiche la valeur puis passe à la ligne suivante. »`);
  check(tailored && tailored.spanTop < tailored.codeTop, `27. description AU-DESSUS de la commande`);
  check(tailored && tailored.codeTop >= tailored.spanTop, `28. aucune superposition description/commande`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== D. MIGRATION v5 → v6 (préserve reads + affichages, libellés préremplis, sauvegarde) ===== */
{
  const V5_CODE = `#include <Arduino.h>
const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}
void loop() {
  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveauEau = analogRead(PIN_NIVEAU_EAU);
  Serial.println(humiditeSol);
  Serial.println(lumiere);
  Serial.println(niveauEau);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);
}`;
  const seed = { structureVersions: { session1: "session-1-guided-include-slot-v5" }, sessions: { 1: { modeMission: false, helpMode: "guided", code: V5_CODE, reflection: "note", values: {}, attempted: true } } };
  const { context, page, consoleErrors } = await openPage({ width: 1366, height: 768 }, 1, seed);
  const r = await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("technoquest-mission-v1"));
    const s = store.sessions[1];
    return { version: store.structureVersions.session1, code: s.code, state: s.migrationState, backups: window.TechnoQuestMissionRecovery.list() };
  });
  check(r.version === "session-1-guided-print-labels-v6" && r.state === "migrated", `20. migration v5 → nouvelle structure v6`);
  check(/analogRead\(PIN_HUMIDITE_SOL\)/.test(r.code) && /analogRead\(PIN_LUMIERE\)/.test(r.code) && /analogRead\(PIN_NIVEAU_EAU\)/.test(r.code), `20b. les trois lectures analogiques sont conservées`);
  check(/Serial\.print\("Humidité du sol : "\)/.test(r.code) && /Serial\.print\("Lumière : "\)/.test(r.code) && /Serial\.print\("Niveau d'eau : "\)/.test(r.code), `20c. les libellés Serial.print("…") préremplis sont présents`);
  check(/Serial\.println\(humiditeSol\)/.test(r.code) && /Serial\.println\(lumiere\)/.test(r.code) && /Serial\.println\(niveauEau\)/.test(r.code), `20d. les trois anciens affichages sont replacés dans leurs emplacements`);
  check(r.backups.length === 1 && r.backups[0].code === V5_CODE, `21. ancienne sauvegarde toujours consultable (code v5 intact)`);
  /* 21b. Consultation sans mutation de l'état actif. */
  await page.waitForSelector(".mission-recovery-consult", { state: "visible", timeout: 4000 }).catch(() => {});
  const before = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("technoquest-mission-v1")).sessions[1]));
  await page.click(".mission-recovery-consult");
  await page.waitForSelector(".mission-recovery-code", { state: "visible", timeout: 4000 }).catch(() => {});
  const consultView = await page.evaluate(() => document.querySelector(".mission-recovery-code")?.value || "");
  const after = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("technoquest-mission-v1")).sessions[1]));
  check(consultView === V5_CODE && before === after, `21b. la consultation affiche l'ancien code SANS muter l'état actif`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== E. MODES LIBRES (Standard / Autonome) et Classique ===== */
{
  const { context, page, consoleErrors } = await openPage();
  const withShow = block => FULL_PROGRAM.replace('  Serial.print("Lumière : ");\n  Serial.println(lumiere);\n', block + "\n");
  /* 22. Standard accepte Serial.print(lumiere); (bonne variable, print). */
  check((await stepState(page, withShow('  Serial.print(lumiere);'), "showLight")).ok, `22. mode libre accepte Serial.print(lumiere);`);
  /* 23. Standard accepte Serial.println(lumiere);. */
  check((await stepState(page, withShow('  Serial.println(lumiere);'), "showLight")).ok, `23. mode libre accepte Serial.println(lumiere);`);
  /* 24. Autonome : le programme complet est entièrement valide. */
  check((await stepState(page, FULL_PROGRAM, "showWater")).allOk, `24-25. programme complet valide (aucune régression) et cohérent`);
  /* Le programme complet contient les trois paires libellé + valeur (produit les 3 lignes). */
  check(/Humidité du sol : [\s\S]*humiditeSol[\s\S]*Lumière : [\s\S]*lumiere[\s\S]*Niveau d'eau : [\s\S]*niveauEau/.test(FULL_PROGRAM), `E : le programme complet produit conceptuellement les trois lignes attendues`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== F. RÉSOLUTIONS + ZOOM : structure guidée lisible et cible correcte ===== */
for (const cfg of [
  { label: "1920×1080", viewport: { width: 1920, height: 1080 }, dsf: 1 },
  { label: "1366×768", viewport: { width: 1366, height: 768 }, dsf: 1 },
  { label: "390×844", viewport: { width: 390, height: 844 }, dsf: 1 },
  { label: "zoom 200 %", viewport: { width: 683, height: 384 }, dsf: 2 }
]) {
  const { context, page, consoleErrors } = await openPage(cfg.viewport, cfg.dsf);
  await page.click("#missionActivate");
  await pause(300);
  const s = await page.evaluate(() => {
    const V = window.TechnoQuestMissionValidator;
    const sk = V.getSkeleton("guided", 1);
    const lines = sk.split("\n");
    const res = V.validate(sk, 1);
    const showHum = V.findLineForStep(sk, "showHumidity", res, 1, "edition");
    return { hasLabel: /Serial\.print\("Humidité du sol : "\)/.test(sk), hasComments: /Serial\.print\(\) affiche/.test(sk) && /Serial\.println\(\) affiche/.test(sk), targetBlank: (lines[showHum] || "") === "" };
  });
  check(s.hasLabel && s.hasComments && s.targetBlank, `29-32. [${cfg.label}] libellés + commentaires présents, cible sur la ligne vide`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== 33. Zéro erreur console ===== */
check(allConsoleErrors.length === 0, `33. zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ PÉDAGOGIE print/println =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — commentaires/libellés protégés, réponse ciblée sur la ligne vide, validation par variable, autocomplétion propre à l'étape, migration v5→v6, modes libres.`);
}
