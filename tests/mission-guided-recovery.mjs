/* Test Playwright — MIGRATION TRANSACTIONNELLE + PANNEAU DE RÉCUPÉRATION accessible. */
/* Vérifie : sauvegarde écrite/relue AVANT toute modification de l'état actif ; QuotaExceededError */
/* → aucune migration, ancien état intact ; panneau visible (Continuer/Restaurer/Copier), clavier, */
/* absence sur session vierge ; déduplication et plafond des sauvegardes ; zéro erreur console. */

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

const KEY = "technoquest-mission-v1";
const BKEY = "technoquest-mission-v1-backups";
const OLD_CODE = ["#include <Arduino.h>", "const int PIN_HUMIDITE_SOL = A0;", "const int PIN_RELAIS_POMPE = 6;", "void setup() {", "  Serial.begin(9600);", "}", "void loop() {", "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);", "  Serial.println(humiditeSol);", "  delay(1000);", "}"].join("\n");

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

/* Ouvre une page avec un scénario de stockage. `seed` = {fn, arg} (fn reçoit arg côté navigateur, */
/* car addInitScript sérialise la fonction : aucune variable de fermeture Node n'est disponible). */
async function open(seed, { grantClipboard = false, viewport = { width: 1366, height: 768 } } = {}) {
  const context = await browser.newContext({ viewport });
  if (grantClipboard) await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: sessionUrl }).catch(() => {});
  if (seed) await context.addInitScript(seed.fn, seed.arg);
  else await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("dialog", d => d.accept().catch(() => {}));
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await pause(500);
  return { context, page, consoleErrors };
}
/* Seed d'une ancienne session (v4) avec du code élève. Le drapeau __seeded garantit que le seed */
/* ne s'applique QU'UNE fois : addInitScript s'exécute à chaque navigation, or un vrai navigateur */
/* ne réinitialise pas le localStorage lors d'un rechargement (sinon la restauration serait écrasée). */
function seedOld(code) {
  return {
    fn: data => {
      if (localStorage.getItem("__seeded")) return;
      localStorage.setItem("__seeded", "1");
      localStorage.setItem("technoquest-mission-v1", JSON.stringify({ structureVersions: { session1: "session-1-progressive-guided-v4" }, sessions: { 1: { modeMission: false, helpMode: "guided", code: data.code, reflection: "R", values: { humidity: "9" }, attempted: true } } }));
    },
    arg: { code }
  };
}

/* ===== Migration transactionnelle : sauvegarde écrite+relue avant migration (cas 1,2) ===== */
{
  const { context, page, consoleErrors } = await open(seedOld(OLD_CODE));
  const r = await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("technoquest-mission-v1"));
    const backups = window.TechnoQuestMissionRecovery.list();
    return { migrated: store.structureVersions.session1, state: store.sessions[1].migrationState, backupCode: backups[0] ? backups[0].code : null, backupFields: backups[0] ? Object.keys(backups[0]).sort() : [] };
  });
  check(r.migrated === "session-1-guided-include-slot-v5" && r.state === "migrated", `1. migration appliquée seulement après sauvegarde (état ${r.state})`);
  check(r.backupCode === OLD_CODE, `2. sauvegarde strictement identique à l'ancien code`);
  check(["code", "fromVersion", "id", "migratedAt", "reflection", "resolved", "sessionId", "toVersion", "values"].every(k => r.backupFields.includes(k)), `2. sauvegarde enrichie (id/sessionId/fromVersion/toVersion/migratedAt/reflection/values/resolved)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== QuotaExceededError sur la sauvegarde → aucune migration, ancien état intact (cas 3,4) ===== */
{
  const seed = {
    fn: () => {
      localStorage.setItem("technoquest-mission-v1", JSON.stringify({ structureVersions: { session1: "session-1-progressive-guided-v4" }, sessions: { 1: { modeMission: false, helpMode: "guided", code: "#include <Arduino.h>\nvoid setup(){}\nvoid loop(){ int humiditeSol = analogRead(A0); }", reflection: "R", values: {}, attempted: true } } }));
      const orig = localStorage.setItem.bind(localStorage);
      localStorage.setItem = (k, v) => { if (k === "technoquest-mission-v1-backups") { const e = new Error("simulate quota"); e.name = "QuotaExceededError"; throw e; } return orig(k, v); };
    }
  };
  const { context, page, consoleErrors } = await open(seed);
  const r = await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("technoquest-mission-v1"));
    return { version: store.structureVersions.session1, code: store.sessions[1].code, warning: window.TechnoQuestMissionMigrationWarning || null };
  });
  check(r.version === "session-1-progressive-guided-v4", `3. échec d'écriture → migration NON marquée (version reste ${r.version})`);
  check(/analogRead\(A0\)/.test(r.code) && !r.code.includes("Charger ici"), `3. ancien code intact (aucun squelette neuf, aucune migration partielle)`);
  check(typeof r.warning === "string" && r.warning.length > 0, `4. QuotaExceededError → avertissement non bloquant posé`);
  check(consoleErrors.length === 0, `4. aucune erreur JavaScript non gérée malgré le quota`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Panneau : visible après migration, absent sur session vierge (cas 5,6) ===== */
{
  const { context, page, consoleErrors } = await open(seedOld(OLD_CODE));
  await page.waitForSelector(".mission-recovery-panel", { state: "visible", timeout: 4000 }).catch(() => {});
  const info = await page.evaluate(() => {
    const p = document.querySelector(".mission-recovery-panel");
    return { present: !!p, role: p ? p.getAttribute("role") : null, hasLabel: p ? !!p.getAttribute("aria-label") : false, buttons: p ? [...p.querySelectorAll("button")].map(b => b.getAttribute("aria-label")) : [], launcher: !!document.querySelector(".mission-recovery-launcher") };
  });
  check(info.present && info.role === "dialog" && info.hasLabel, `5. panneau visible et accessible après migration (role=dialog, aria-label)`);
  check(info.buttons.some(l => /Continuer/.test(l)) && info.buttons.some(l => /Consulter/.test(l)) && info.buttons.some(l => /Copier/.test(l)), `5. trois boutons présents avec aria-label (Continuer / Consulter / Copier)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();

  const { context: c2, page: p2, consoleErrors: e2 } = await open(null);
  await pause(400);
  check(!(await p2.evaluate(() => !!document.querySelector(".mission-recovery-panel"))) && !(await p2.evaluate(() => !!document.querySelector(".mission-recovery-launcher"))), `6. panneau ET lanceur absents sur session vierge`);
  allConsoleErrors.push(...e2);
  await c2.close();
}

/* ===== Bouton Continuer (cas 7) ===== */
{
  const { context, page, consoleErrors } = await open(seedOld(OLD_CODE));
  await page.waitForSelector(".mission-recovery-continue", { state: "visible", timeout: 4000 }).catch(() => {});
  await page.click(".mission-recovery-continue");
  await pause(200);
  const r = await page.evaluate(() => ({ panel: !!document.querySelector(".mission-recovery-panel"), backups: window.TechnoQuestMissionRecovery.list().length, resolved: window.TechnoQuestMissionRecovery.list().every(b => b.resolved === true) }));
  check(!r.panel && r.backups === 1 && r.resolved, `7. « Continuer » ferme le panneau, conserve la sauvegarde, la marque résolue`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== « Consulter mon ancien code » : LECTURE SEULE PURE — ne mute AUCUN état actif ===== */
{
  const { context, page, consoleErrors } = await open(seedOld(OLD_CODE), { grantClipboard: true });
  await page.waitForSelector(".mission-recovery-consult", { state: "visible", timeout: 4000 }).catch(() => {});
  /* 1. Instantané de l'état actif complet AVANT consultation. */
  const snapshot = () => page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("technoquest-mission-v1"));
    const s = st.sessions[1];
    const unresolved = window.TechnoQuestMissionRecovery.list().some(b => b.resolved === false);
    return { active: JSON.stringify(s), code: s.code, modeMission: s.modeMission, helpMode: s.helpMode, activeStep: s.activeStep, attempted: s.attempted, migrationState: s.migrationState, version: st.structureVersions.session1, unresolved };
  });
  const before = await snapshot();
  /* 2. Cliquer « Consulter mon ancien code ». */
  await page.click(".mission-recovery-consult");
  await page.waitForSelector(".mission-recovery-code", { state: "visible", timeout: 4000 }).catch(() => {});
  /* 3. Vérifier l'affichage ET l'absence totale de mutation. */
  const view = await page.evaluate(() => {
    const ta = document.querySelector(".mission-recovery-code");
    return { taVisible: ta ? ta.offsetParent !== null : false, taReadonly: ta ? ta.readOnly : null, taValue: ta ? ta.value : null, focused: document.activeElement === ta, hasBack: !!document.querySelector(".mission-recovery-back"), hasCopy: !!document.querySelector(".mission-recovery-copy"), msg: document.querySelector(".mission-recovery-msg")?.textContent || "" };
  });
  const afterConsult = await snapshot();
  check(view.taVisible && view.taReadonly === true, `3a. l'élève VOIT son ancien code dans une zone en lecture seule (readonly)`);
  check(view.taValue === OLD_CODE, `3b. le code affiché est exactement l'ancien code complet`);
  check(view.focused, `3c. la zone de code reçoit le focus (sélection clavier immédiate)`);
  check(view.hasBack && view.hasCopy, `3d. actions « Copier mon ancien code » et « Revenir à la nouvelle version » présentes`);
  check(/pas.*adapt|nouvelle activité n'est pas modifiée/i.test(view.msg), `3e. message : lecture seule, l'activité n'est pas modifiée`);
  check(afterConsult.code === before.code, `3f. sessions[1].code STRICTEMENT inchangé par la consultation`);
  check(afterConsult.modeMission === before.modeMission, `3g. modeMission inchangé`);
  check(afterConsult.helpMode === before.helpMode, `3h. helpMode inchangé`);
  check(afterConsult.activeStep === before.activeStep && afterConsult.migrationState === before.migrationState, `3i. progression (activeStep/migrationState) inchangée`);
  check(afterConsult.attempted === before.attempted, `3j. attempted inchangé`);
  check(afterConsult.version === "session-1-guided-include-slot-v5", `3k. aucune nouvelle migration (reste en v5)`);
  check(afterConsult.unresolved === true, `3l. la sauvegarde est TOUJOURS non résolue après consultation`);
  /* Égalité stricte de l'état actif complet avant/après consultation. */
  check(afterConsult.active === before.active, `3m. état actif complet IDENTIQUE avant et après consultation`);

  /* 4‑5. Copier depuis la vue : copie réelle + aucune mutation. */
  await page.click(".mission-recovery-copy");
  await pause(250);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => "(échec)"));
  const afterCopy = await snapshot();
  check(clip.replace(/\r\n/g, "\n") === OLD_CODE, `4. l'ancien code est réellement copiable dans le presse-papiers`);
  check(afterCopy.active === before.active, `5. la copie ne modifie aucun état actif`);

  /* 9. Aucune écriture tardive de l'ancien code (attente prolongée). */
  await pause(700);
  const late = await snapshot();
  check(late.code === before.code && late.code !== OLD_CODE, `9. aucune écriture tardive : l'ancien code n'apparaît pas dans l'état actif`);

  /* « Revenir à la nouvelle version » ferme la vue, sauvegarde toujours disponible et non résolue. */
  await page.click(".mission-recovery-back");
  await pause(150);
  const closed = await page.evaluate(() => ({ panel: !!document.querySelector(".mission-recovery-panel"), backups: window.TechnoQuestMissionRecovery.list().length, unresolved: window.TechnoQuestMissionRecovery.list().some(b => b.resolved === false) }));
  check(!closed.panel && closed.backups >= 1 && closed.unresolved, `6b. « Revenir » ferme la vue ; sauvegarde disponible et non résolue`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== « Continuer » : conserve la nouvelle version ; rechargements sans migration ni fuite ===== */
{
  const { context, page, consoleErrors } = await open(seedOld(OLD_CODE));
  await page.waitForSelector(".mission-recovery-continue", { state: "visible", timeout: 4000 }).catch(() => {});
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("technoquest-mission-v1")).sessions[1].code);
  /* 6. Continuer avec la nouvelle version. */
  await page.click(".mission-recovery-continue");
  await pause(200);
  const after = await page.evaluate(() => ({ panel: !!document.querySelector(".mission-recovery-panel"), code: JSON.parse(localStorage.getItem("technoquest-mission-v1")).sessions[1].code, resolved: window.TechnoQuestMissionRecovery.list().every(b => b.resolved === true), backups: window.TechnoQuestMissionRecovery.list().length }));
  check(!after.panel, `7a. « Continuer » ferme le panneau`);
  check(after.code === before && after.code !== OLD_CODE, `7b. le code actif de la nouvelle version est inchangé (pas de restauration silencieuse)`);
  check(after.backups >= 1, `7c. la sauvegarde reste disponible après « Continuer »`);
  check(after.resolved, `7d. « Continuer » peut marquer la notification comme résolue`);
  /* 7‑fin + 8. Plusieurs rechargements : nouvelle version toujours active, aucune nouvelle migration. */
  for (let i = 0; i < 2; i += 1) {
    await page.reload({ waitUntil: "networkidle" });
    await pause(400);
  }
  const reloaded = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("technoquest-mission-v1"));
    const ed = document.querySelector("#codeEditor");
    return { code: st.sessions[1].code, version: st.structureVersions.session1, editorHasOld: ed ? ed.value.includes("analogRead(PIN_HUMIDITE_SOL)") && ed.value.split("\n").length < 15 : false };
  });
  check(reloaded.code === before, `7e. après plusieurs rechargements, la nouvelle version reste active`);
  check(reloaded.version === "session-1-guided-include-slot-v5", `8. plusieurs rechargements sans nouvelle migration (reste en v5)`);
  check(!reloaded.editorHasOld, `7f. aucun ancien code n'apparaît silencieusement dans l'éditeur`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Navigation clavier complète : Tab, Entrée, Échap (cas 11) ===== */
{
  const { context, page, consoleErrors } = await open(seedOld(OLD_CODE), { grantClipboard: true });
  await page.waitForSelector(".mission-recovery-panel", { state: "visible", timeout: 4000 }).catch(() => {});
  await page.focus(".mission-recovery-continue");
  const nav = await page.evaluate(() => {
    const order = [...document.querySelectorAll(".mission-recovery-panel .mission-recovery-actions button")];
    return { count: order.length, firstFocused: document.activeElement === order[0] };
  });
  check(nav.count === 3 && nav.firstFocused, `11a. Tab : le premier bouton reçoit le focus (3 actions)`);
  /* Tab jusqu'à « Consulter », puis Entrée ouvre la vue en lecture seule. */
  await page.keyboard.press("Tab");
  const onConsult = await page.evaluate(() => document.activeElement?.classList.contains("mission-recovery-consult"));
  check(onConsult, `11b. Tab atteint « Consulter mon ancien code »`);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".mission-recovery-code", { state: "visible", timeout: 4000 }).catch(() => {});
  const opened = await page.evaluate(() => !!document.querySelector(".mission-recovery-code"));
  check(opened, `11c. Entrée sur « Consulter » ouvre la zone en lecture seule`);
  /* Échap ferme le panneau. */
  await page.keyboard.press("Escape");
  await pause(150);
  const closedByEsc = await page.evaluate(() => !document.querySelector(".mission-recovery-panel"));
  check(closedByEsc, `11d. Échap ferme le panneau`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Rendu de la consultation sur 3 résolutions (cas 12) ===== */
for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
  const { context, page, consoleErrors } = await open(seedOld(OLD_CODE), { viewport });
  await page.waitForSelector(".mission-recovery-consult", { state: "visible", timeout: 4000 }).catch(() => {});
  await page.click(".mission-recovery-consult");
  await page.waitForSelector(".mission-recovery-code", { state: "visible", timeout: 4000 }).catch(() => {});
  const r = await page.evaluate(() => {
    const ta = document.querySelector(".mission-recovery-code");
    const rect = ta ? ta.getBoundingClientRect() : null;
    return { visible: ta ? ta.offsetParent !== null : false, value: ta ? ta.value : null, inView: rect ? rect.left >= 0 && rect.right <= window.innerWidth : false, horizOverflow: document.documentElement.scrollWidth > window.innerWidth };
  });
  check(r.visible && r.value === OLD_CODE && r.inView && !r.horizOverflow, `12. [${viewport.width}×${viewport.height}] code visible, dans le cadre, sans débordement horizontal`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Déduplication et plafond des sauvegardes (cas 13, 14) ===== */
{
  /* Seed avec des sauvegardes existantes (dont un doublon) + une ancienne session. */
  const seed = {
    fn: () => {
      const dup = { id: "d1", sessionId: 1, fromVersion: "vieux", toVersion: "session-1-guided-include-slot-v5", migratedAt: "t0", code: "CODE_ANCIEN", reflection: "", values: {}, resolved: true };
      const many = [dup, { ...dup, id: "d2" }, { ...dup, id: "d3", code: "AUTRE1" }, { ...dup, id: "d4", code: "AUTRE2" }, { ...dup, id: "d5", code: "AUTRE3" }];
      localStorage.setItem("technoquest-mission-v1-backups", JSON.stringify(many));
      localStorage.setItem("technoquest-mission-v1", JSON.stringify({ structureVersions: { session1: "vieux" }, sessions: { 1: { modeMission: false, helpMode: "guided", code: "CODE_ANCIEN", reflection: "", values: {}, attempted: true } } }));
    }
  };
  const { context, page, consoleErrors } = await open(seed);
  const r = await page.evaluate(() => {
    const backups = window.TechnoQuestMissionRecovery.list();
    const codes = backups.map(b => b.code);
    const dupCount = codes.filter(c => c === "CODE_ANCIEN").length;
    return { total: backups.length, dupCount };
  });
  check(r.total <= 3, `14. plafond respecté : au maximum 3 sauvegardes (obtenu ${r.total})`);
  check(r.dupCount <= 1, `13. déduplication : « CODE_ANCIEN » (même code/version) n'apparaît qu'une fois (${r.dupCount})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Zéro erreur console (cas 15) ===== */
check(allConsoleErrors.length === 0, `15. zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ MIGRATION TRANSACTIONNELLE & RÉCUPÉRATION =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — migration transactionnelle, QuotaExceededError sûre, CONSULTATION en lecture seule sans mutation (Continuer/Consulter/Copier), dédup + plafond vérifiés.`);
}
