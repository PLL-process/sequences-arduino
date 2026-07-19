/* LOT « Navigation et protection du mode Guidé » — test Playwright dédié. */
/* Couvre les 16 cas obligatoires :                                                   */
/*  1. clic sur une ancienne ligne révélée ;                                          */
/*  2. modification réussie de cette ligne ;                                          */
/*  3. navigation flèches / Page précédente / souris ;                                */
/*  4. maintien du cadre principal sur l'étape manquante ;                            */
/*  5. surbrillance secondaire de la ligne éditée ;                                   */
/*  6. tentative d'accès à une ligne future (verrouillée) ;                           */
/*  7. bouton « Revenir à l'étape » à la souris et au clavier ;                       */
/*  8. protection contre Ctrl+A + Suppr ;                                             */
/*  9. protection contre couper ;                                                     */
/* 10. protection contre collage multi-lignes ;                                       */
/* 11. protection contre glisser-déposer (multi-lignes) ;                             */
/* 12. insertion par autocomplétion / programme ;                                     */
/* 13. sauvegarde et rechargement après correction ;                                  */
/* 14. absence de régression en Standard et Autonome ;                                */
/* 15. téléphone, 1366x768 et 1920x1080 ;                                             */
/* 16. zéro erreur console.                                                           */

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

/* ---- Fonctions injectées dans la page (exécutées côté navigateur) ---- */

/* Remplit certaines étapes du squelette guidé (index figés). */
function buildProgram(filledSteps) {
  const lines = window.TechnoQuestMissionValidator.getSkeleton("guided", 1).split("\n");
  if (filledSteps.includes("include")) lines[1] = "#include <Arduino.h>";
  if (filledSteps.includes("serialBegin")) lines[8] = "  Serial.begin(9600);";
  if (filledSteps.includes("pinMode")) lines[10] = "  pinMode(PIN_RELAIS_POMPE, OUTPUT);";
  const editor = document.getElementById("codeEditor");
  editor.value = lines.join("\n");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Place le curseur sur une ligne donnée (au retrait ou en fin de ligne) et signale un clic. */
function setCaretLine(line, atEnd) {
  const editor = document.getElementById("codeEditor");
  const lines = editor.value.split("\n");
  const start = lines.slice(0, line).reduce((total, l) => total + l.length + 1, 0);
  const indent = (lines[line].match(/^\s*/) || [""])[0].length;
  const column = atEnd ? lines[line].length : indent;
  editor.focus();
  editor.setSelectionRange(start + column, start + column);
  editor.dispatchEvent(new Event("click", { bubbles: true }));
  editor.dispatchEvent(new Event("mouseup", { bubbles: true }));
}

/* Corrompt une ligne par programme (simule autocomplétion / modification programmatique). */
function corruptLine(line, text) {
  const editor = document.getElementById("codeEditor");
  const lines = editor.value.split("\n");
  lines[line] = text;
  editor.value = lines.join("\n");
  editor.setSelectionRange(0, 0);
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Tente un glisser-déposer multi-lignes et retourne si l'opération a été bloquée. */
function tryMultilineDrop() {
  const editor = document.getElementById("codeEditor");
  const before = editor.value;
  const transfer = new DataTransfer();
  transfer.setData("text/plain", "PIRATE_A\nPIRATE_B\nPIRATE_C");
  const event = new DragEvent("drop", { dataTransfer: transfer, bubbles: true, cancelable: true });
  editor.dispatchEvent(event);
  return { prevented: event.defaultPrevented, unchanged: editor.value === before };
}

/* Installe un espion enregistrant les tentatives réelles de collage sur l'éditeur. */
function installPasteSpy() {
  const editor = document.getElementById("codeEditor");
  /* Réinitialise le journal des collages. */
  window.__pasteSpy = { insertFromPaste: 0, paste: 0, text: "", prevented: null };
  /* CAPTURE (avant la protection) : lit le texte réellement proposé, encore accessible. */
  editor.addEventListener("beforeinput", event => {
    /* Ne retient que les collages. */
    if (event.inputType !== "insertFromPaste") return;
    /* Compte la tentative réelle de collage. */
    window.__pasteSpy.insertFromPaste += 1;
    /* Récupère le texte proposé à l'éditeur AVANT toute annulation. */
    /* Selon le navigateur, la charge du collage arrive via event.data OU via dataTransfer. */
    const fromData = typeof event.data === "string" ? event.data : "";
    /* Lit aussi le transfert de données lorsqu'il est exposé. */
    const fromTransfer = (event.dataTransfer && (event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text"))) || "";
    /* Retient la charge non vide (priorité à celle qui contient réellement le texte). */
    window.__pasteSpy.text = fromData || fromTransfer;
  }, true);
  /* BULLE (après la protection, enregistré plus tard) : lit defaultPrevented. */
  editor.addEventListener("beforeinput", event => {
    /* Ne retient que les collages. */
    if (event.inputType !== "insertFromPaste") return;
    /* Lit si notre protection a annulé l'opération. */
    window.__pasteSpy.prevented = event.defaultPrevented;
  });
  /* Compte aussi l'événement paste natif. */
  editor.addEventListener("paste", () => { window.__pasteSpy.paste += 1; });
}

/* Reproduit fidèlement l'événement natif de collage multi-lignes (chemin DÉTERMINISTE). */
/* Justification : lorsque le presse-papiers réel est indisponible/instable dans l'environnement, */
/* on émet le MÊME événement (beforeinput type insertFromPaste, même charge multi-lignes) que */
/* le navigateur enverrait, afin de vérifier de façon déterministe que la protection l'annule. */
function dispatchDeterministicPaste() {
  const editor = document.getElementById("codeEditor");
  /* Mémorise la valeur avant l'opération. */
  const before = editor.value;
  /* Construit le transfert de données multi-lignes. */
  const transfer = new DataTransfer();
  /* Charge un texte multi-lignes. */
  transfer.setData("text/plain", "DET_A\nDET_B\nDET_C");
  /* Construit l'événement de collage identique au natif. */
  const event = new InputEvent("beforeinput", { inputType: "insertFromPaste", dataTransfer: transfer, bubbles: true, cancelable: true });
  /* Diffuse l'événement à l'éditeur. */
  editor.dispatchEvent(event);
  /* Retourne les preuves : annulation par la protection, charge proposée, valeur intacte. */
  return { prevented: event.defaultPrevented, text: transfer.getData("text/plain"), unchanged: editor.value === before };
}

/* Bascule le niveau d'aide et retourne la valeur appliquée. */
function setHelpLevel(level) {
  const select = document.getElementById("missionHelpLevel");
  select.value = level;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return select.value;
}

/* Sonde complète de l'état de navigation et de protection. */
function navProbe() {
  const editor = document.getElementById("codeEditor");
  const gutter = document.getElementById("missionLineNumbers");
  const geo = window.TechnoQuestGuidedGeometry;
  const model = geo.model();
  const editingBand = document.querySelector(".mission-editing-line");
  const frame = document.querySelector(".mission-target-line");
  const codeBand = document.querySelector(".mission-target-code");
  const button = document.querySelector(".mission-return-step");
  const lines = editor.value.split("\n");
  const caretLine = editor.value.slice(0, editor.selectionStart).split("\n").length - 1;
  let editingBandDelta = null;
  if (editingBand && !editingBand.hidden && model.editingLine !== null) {
    const span = gutter.children[model.editingLine]?.getBoundingClientRect();
    const rect = editingBand.getBoundingClientRect();
    editingBandDelta = span ? Math.abs(rect.top - span.top) : null;
  }
  return {
    stepId: model.stepId,
    targetLine: model.targetLine,
    revealed: model.revealedCodeLines,
    classify11: model.classify(11),
    protectedComments: model.protectedCommentLines,
    caretLine,
    editingLine: model.editingLine,
    holding: geo.isHolding(),
    buttonHidden: button ? button.hidden : null,
    editingBandVisible: editingBand ? !editingBand.hidden : false,
    editingBandDelta,
    frameVisible: frame ? !frame.hidden : false,
    frameLabel: frame?.querySelector(".mission-target-line-label")?.textContent || "",
    codeBandVisible: codeBand ? !codeBand.hidden : false,
    lineCount: lines.length,
    line1: lines[1],
    line6: lines[6],
    line7: lines[7],
    line8: lines[8],
    value: editor.value
  };
}

/* ---- Utilitaires côté Node ---- */

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

/* Exécute une fonction injectée avec des arguments. */
function run(page, fn, ...args) {
  return page.evaluate(({ f, a }) => new Function(`return (${f})`)()(...a), { f: fn.toString(), a: args });
}

/* Prépare une page Mission guidée. clearInit=false conserve localStorage entre rechargements. */
async function preparePage(viewport, filled, clearInit = true) {
  const context = await browser.newContext({ viewport });
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
  await page.waitForFunction(() => Boolean(window.TechnoQuestMissionGuidedTarget && window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.model));
  if (filled && filled.length) await run(page, buildProgram, filled);
  await pause(500);
  return { context, page, consoleErrors };
}

const allConsoleErrors = [];

/* ===== Bloc principal : remontée, correction, cadre, surbrillance, futur, bouton (1366x768) ===== */
{
  const { context, page, consoleErrors } = await preparePage({ width: 1366, height: 768 }, ["include", "serialBegin"]);
  /* Étape active attendue : pinMode (ligne 9). */
  let p = await run(page, navProbe);
  check(p.stepId === "pinMode" && p.targetLine === 10, `état initial : étape pinMode ciblant la ligne 10 (obtenu ${p.stepId}/${p.targetLine})`);
  check(p.revealed.includes(1) && p.revealed.includes(8) && p.revealed.includes(10), `lignes révélées incluent include(0), serialBegin(7), cible(9) : ${JSON.stringify(p.revealed)}`);

  /* Cas 1 : clic sur une ancienne ligne révélée (ligne 7). */
  await run(page, setCaretLine, 8, true);
  await pause(200);
  p = await run(page, navProbe);
  check(p.caretLine === 8, `cas 1 : clic place le curseur sur l'ancienne ligne 7 (obtenu ${p.caretLine + 1})`);
  check(p.editingLine === 8 && p.holding === true, `cas 1 : consultation d'une ancienne ligne détectée (editingLine=${p.editingLine}, hold=${p.holding})`);

  /* Cas 5 : surbrillance secondaire sur la ligne éditée. */
  check(p.editingBandVisible === true && p.editingBandDelta !== null && p.editingBandDelta <= 3, `cas 5 : surbrillance secondaire alignée sur la ligne 7 (Δ${p.editingBandDelta === null ? "n/a" : Math.round(p.editingBandDelta)}px)`);

  /* Cas 4 : le cadre principal reste sur l'étape manquante (ligne 10). */
  check(p.frameVisible === true && p.frameLabel.includes("ligne 11"), `cas 4 : cadre principal maintenu sur l'étape (label "${p.frameLabel}")`);
  check(p.codeBandVisible === true, `cas 4 : surbrillance principale toujours affichée sur la cible`);

  /* Cas 7a : le bouton « Revenir à l'étape » apparaît quand on s'éloigne. */
  check(p.buttonHidden === false, `cas 7 : bouton « Revenir à l'étape » visible après éloignement`);

  /* Cas 2 : modification réussie de l'ancienne ligne (ajout d'un espace, reste valide). */
  await page.keyboard.type("  ");
  await pause(250);
  p = await run(page, navProbe);
  check(p.line8.startsWith("  Serial.begin(9600);") && p.line8.length > "  Serial.begin(9600);".length, `cas 2 : correction de la ligne 7 persistée ("${p.line8}")`);
  check(p.stepId === "pinMode", `cas 2 : l'étape active reste pinMode après correction d'une ancienne ligne`);

  /* Cas 3 : navigation clavier (flèche haut) et souris entre lignes révélées. */
  await run(page, setCaretLine, 10, false);
  await pause(150);
  await page.keyboard.press("ArrowUp");
  await pause(200);
  p = await run(page, navProbe);
  check(p.caretLine !== 10 && p.revealed.includes(p.caretLine), `cas 3 : flèche haut déplace vers une ligne révélée (obtenu ligne ${p.caretLine + 1})`);
  /* Page précédente reste dans les lignes autorisées (pas de saut dans le futur ni les commentaires verrouillés). */
  await page.keyboard.press("PageUp");
  await pause(200);
  p = await run(page, navProbe);
  check(p.revealed.includes(p.caretLine), `cas 3 : Page précédente reste sur une ligne autorisée (ligne ${p.caretLine + 1})`);

  /* Cas 6 : tentative d'accès à une ligne future (ligne 11 = étape suivante verrouillée). */
  await run(page, setCaretLine, 12, false);
  await pause(200);
  p = await run(page, navProbe);
  check(p.classify11 === "future", `cas 6 : la ligne 12 est classée « future »`);
  check(p.caretLine !== 12 && p.revealed.includes(p.caretLine), `cas 6 : curseur ramené hors de la ligne future (obtenu ligne ${p.caretLine + 1})`);

  /* Cas 7b : « Revenir à l'étape » à la souris recentre sur la cible. */
  await run(page, setCaretLine, 8, false);
  await pause(150);
  await page.click(".mission-return-step");
  await pause(300);
  p = await run(page, navProbe);
  check(p.caretLine === 10 && p.holding === false, `cas 7 : bouton (souris) recentre le curseur sur l'étape (ligne ${p.caretLine + 1})`);
  check(p.buttonHidden === true, `cas 7 : bouton masqué après recentrage`);

  /* Cas 7c : « Revenir à l'étape » au clavier (focus + Entrée). */
  await run(page, setCaretLine, 8, false);
  await pause(200);
  await page.locator(".mission-return-step").focus();
  await page.keyboard.press("Enter");
  await pause(300);
  p = await run(page, navProbe);
  check(p.caretLine === 10 && p.holding === false, `cas 7 : bouton (clavier) recentre le curseur sur l'étape (ligne ${p.caretLine + 1})`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Protections (Ctrl+A+Suppr, couper, collage, glisser-déposer) ===== */
{
  const { context, page, consoleErrors } = await preparePage({ width: 1366, height: 768 }, ["include", "serialBegin"]);
  const baseline = await run(page, navProbe);
  const commentSix = baseline.line6;

  /* Cas 8 : Ctrl+A puis Suppr ne vide pas l'éditeur. */
  await page.locator("#codeEditor").focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
  await pause(300);
  let p = await run(page, navProbe);
  check(p.lineCount === baseline.lineCount, `cas 8 : Ctrl+A+Suppr préserve le nombre de lignes (${p.lineCount}/${baseline.lineCount})`);
  check(p.line6 === commentSix, `cas 8 : commentaire pédagogique intact après Ctrl+A+Suppr`);
  check(p.line1 === "#include <Arduino.h>" && p.line8.includes("Serial.begin"), `cas 8 : code de l'élève préservé après Ctrl+A+Suppr`);

  /* Cas 9 : couper une sélection couvrant commentaire + code est bloqué. */
  await page.locator("#codeEditor").focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Control+X");
  await pause(300);
  p = await run(page, navProbe);
  check(p.lineCount === baseline.lineCount && p.line6 === commentSix, `cas 9 : couper (sélection totale) bloqué, commentaires et structure intacts`);
  check(p.line1 === "#include <Arduino.h>" && p.line8.includes("Serial.begin"), `cas 9 : couper préserve le code de l'élève`);

  /* Cas 10a : chemin DÉTERMINISTE — un collage multi-lignes natif reproduit est bloqué. */
  await run(page, setCaretLine, 10, false);
  const det = await run(page, dispatchDeterministicPaste);
  check(det.text.includes("\n"), `cas 10 : texte multi-lignes réellement proposé à l'éditeur (déterministe)`);
  check(det.prevented === true, `cas 10 : collage multi-lignes annulé par la protection (déterministe, defaultPrevented=${det.prevented})`);
  check(det.unchanged === true, `cas 10 : éditeur intact après collage déterministe bloqué`);

  /* Cas 10b : chemin RÉEL — presse-papiers accordé, collage réellement tenté puis bloqué. */
  await run(page, installPasteSpy);
  const wrote = await page.evaluate(() => navigator.clipboard.writeText("HACK_A\nHACK_B\nHACK_C").then(() => true).catch(() => false));
  await page.locator("#codeEditor").focus();
  await run(page, setCaretLine, 10, false);
  await page.keyboard.press("Control+V");
  await pause(300);
  const spy = await page.evaluate(() => window.__pasteSpy);
  p = await run(page, navProbe);
  /* Le presse-papiers doit être accessible (permissions accordées dans le contexte). */
  check(wrote === true, `cas 10 : écriture presse-papiers réussie (permissions accordées : ${wrote})`);
  /* Le navigateur doit avoir RÉELLEMENT tenté le collage — sinon le test échoue. */
  check(spy.insertFromPaste >= 1, `cas 10 : le navigateur a réellement tenté le collage (insertFromPaste=${spy.insertFromPaste})`);
  /* Le texte multi-lignes doit avoir été proposé à l'éditeur. */
  check(typeof spy.text === "string" && spy.text.includes("\n"), `cas 10 : texte multi-lignes réellement transmis (${JSON.stringify(spy.text)})`);
  /* La protection doit l'avoir annulé. */
  check(spy.prevented === true, `cas 10 : collage réel annulé par la protection (defaultPrevented=${spy.prevented})`);
  /* Aucune ligne pirate ne doit avoir été insérée. */
  check(p.lineCount === baseline.lineCount && !p.value.includes("HACK_B"), `cas 10 : aucune ligne pirate insérée après collage réel bloqué`);

  /* Cas 11 : glisser-déposer multi-lignes bloqué. */
  const drop = await run(page, tryMultilineDrop);
  check(drop.prevented === true && drop.unchanged === true, `cas 11 : glisser-déposer multi-lignes bloqué (prevented=${drop.prevented})`);

  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 12 : insertion programmatique / autocomplétion dans un commentaire restaurée ===== */
{
  const { context, page, consoleErrors } = await preparePage({ width: 1366, height: 768 }, ["include", "serialBegin"]);
  const baseline = await run(page, navProbe);
  /* Corrompt le commentaire de la ligne 6 par programme (simule assist/autocomplétion). */
  await run(page, corruptLine, 6, "  // PIRATE INSERTION");
  await pause(300);
  const p = await run(page, navProbe);
  check(p.line6 === baseline.line6, `cas 12 : commentaire restauré après insertion programmatique ("${p.line6}")`);
  check(p.line1 === "#include <Arduino.h>" && p.line8.includes("Serial.begin"), `cas 12 : code de l'élève préservé pendant la restauration`);
  check(p.lineCount === baseline.lineCount, `cas 12 : aucune réinitialisation de l'éditeur (nombre de lignes ${p.lineCount})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 12b : la restauration d'un commentaire ne marque PAS une fausse tentative ===== */
{
  const { context, page, consoleErrors } = await preparePage({ width: 1366, height: 768 }, []);
  /* Lit l'indicateur attempted persisté par le contrôleur historique. */
  const readAttempted = () => page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem("technoquest-mission-v1")).sessions[1].attempted; } catch (e) { return null; }
  });
  /* État initial : aucune tentative sur un squelette fraîchement chargé. */
  const a0 = await readAttempted();
  check(a0 === false, `cas 12b : état initial sans tentative (attempted=${a0})`);
  /* Un input marqué RESTAURATION INTERNE ne doit PAS marquer attempted. */
  await page.evaluate(() => { const e = new Event("input", { bubbles: true }); e.__tqRestore = true; document.getElementById("codeEditor").dispatchEvent(e); });
  await pause(120);
  const a1 = await readAttempted();
  check(a1 === false, `cas 12b : un input __tqRestore ne marque pas attempted (${a0} → ${a1})`);
  /* CONTRÔLE : un input élève normal marque bien attempted (preuve que le marquage fonctionne). */
  await page.evaluate(() => { document.getElementById("codeEditor").dispatchEvent(new Event("input", { bubbles: true })); });
  await pause(120);
  const a2 = await readAttempted();
  check(a2 === true, `cas 12b : contrôle — un input élève normal marque attempted (obtenu ${a2})`);
  /* Flux RÉEL : une corruption de commentaire déclenche une restauration marquée, sans boucle. */
  await page.evaluate(() => { window.__inp = []; document.getElementById("codeEditor").addEventListener("input", e => window.__inp.push(Boolean(e.__tqRestore))); });
  const commentBefore = await page.evaluate(() => document.getElementById("codeEditor").value.split("\n")[6]);
  await run(page, corruptLine, 6, "  // ALTERATION 12b");
  await pause(350);
  const inputs = await page.evaluate(() => window.__inp);
  const line6After = await page.evaluate(() => document.getElementById("codeEditor").value.split("\n")[6]);
  check(line6After === commentBefore, `cas 12b : commentaire restauré dans le flux réel`);
  check(inputs.some(x => x === true), `cas 12b : reconcile émet bien un input __tqRestore (marqué)`);
  check(inputs.length > 0 && inputs.length <= 8, `cas 12b : aucune boucle infinie d'événements (inputs=${inputs.length})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 13 : sauvegarde et rechargement après correction ===== */
{
  const { context, page, consoleErrors } = await preparePage({ width: 1366, height: 768 }, [], false);
  /* Charge un état propre puis remplit deux étapes. */
  await page.evaluate(() => localStorage.clear());
  await run(page, buildProgram, ["include", "serialBegin"]);
  await pause(300);
  /* Corrige l'ancienne ligne 7 (ajout d'un marqueur inoffensif). */
  await run(page, setCaretLine, 8, true);
  await pause(150);
  await page.keyboard.type(" // corrige");
  await pause(250);
  /* Enregistre puis recharge la page. */
  await page.click("#missionSave");
  await pause(200);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#codeEditor", { state: "visible" }).catch(() => {});
  /* Réactive la Mission si nécessaire. */
  const hidden = await page.evaluate(() => document.getElementById("missionModeRoot")?.classList.contains("mission-hidden"));
  if (hidden) { await page.click("#missionActivate").catch(() => {}); }
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.model)).catch(() => {});
  await pause(500);
  const p = await run(page, navProbe);
  check(p.line8.includes("// corrige"), `cas 13 : correction conservée après rechargement ("${p.line8}")`);
  check(p.line7.includes("Initialiser le Moniteur"), `cas 13 : commentaire pédagogique intact après rechargement`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 14 : absence de régression en Standard et Autonome ===== */
for (const level of ["standard", "expert"]) {
  const { context, page, consoleErrors } = await preparePage({ width: 1366, height: 768 }, []);
  /* Bascule le niveau (pas de tentative en cours : pas de confirmation destructrice). */
  const applied = await run(page, setHelpLevel, level);
  await pause(300);
  check(applied === level, `cas 14 : niveau « ${level} » appliqué`);
  /* Le curseur peut se poser sur une ligne de commentaire sans être ramené. */
  await run(page, setCaretLine, 6, false);
  await pause(200);
  let p = await run(page, navProbe);
  check(p.caretLine === 6, `cas 14 (${level}) : liberté de placer le curseur sur une ligne quelconque (ligne ${p.caretLine + 1})`);
  /* Le retour à la ligne est autorisé (aucun verrou de structure). */
  const before = await page.evaluate(() => document.getElementById("codeEditor").value.split("\n").length);
  await page.locator("#codeEditor").focus();
  await run(page, setCaretLine, 6, true);
  await page.keyboard.press("Enter");
  await pause(200);
  const after = await page.evaluate(() => document.getElementById("codeEditor").value.split("\n").length);
  check(after === before + 1, `cas 14 (${level}) : retour à la ligne autorisé (lignes ${before} → ${after})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 15 : téléphone, 1366x768 et 1920x1080 — scénario cœur (remontée + protection) ===== */
const viewports = [
  { name: "telephone-390x844", width: 390, height: 844 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1920x1080", width: 1920, height: 1080 }
];
for (const vp of viewports) {
  const { context, page, consoleErrors } = await preparePage({ width: vp.width, height: vp.height }, ["include", "serialBegin"]);
  /* Remontée vers l'ancienne ligne. */
  await run(page, setCaretLine, 8, false);
  await pause(250);
  let p = await run(page, navProbe);
  check(p.editingLine === 8 && p.editingBandVisible === true, `cas 15 (${vp.name}) : surbrillance secondaire active sur l'ancienne ligne`);
  check(p.frameVisible === true && p.frameLabel.includes("ligne 11"), `cas 15 (${vp.name}) : cadre principal maintenu sur l'étape`);
  check(p.buttonHidden === false, `cas 15 (${vp.name}) : bouton « Revenir à l'étape » compact et visible`);
  /* Protection commentaire (Ctrl+A+Suppr). */
  await page.locator("#codeEditor").focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
  await pause(300);
  p = await run(page, navProbe);
  check(p.line7.includes("Initialiser le Moniteur") && p.line1 === "#include <Arduino.h>", `cas 15 (${vp.name}) : protection commentaire + code préservés`);
  /* Recentrage à la demande. */
  await page.click(".mission-return-step").catch(() => {});
  await pause(300);
  p = await run(page, navProbe);
  check(p.caretLine === 10, `cas 15 (${vp.name}) : recentrage sur l'étape depuis le bouton (ligne ${p.caretLine + 1})`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Cas 16 : zéro erreur console sur l'ensemble des scénarios ===== */
check(allConsoleErrors.length === 0, `cas 16 : aucune erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ NAVIGATION & PROTECTION =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — remontée, correction, protection des commentaires, verrouillage des lignes futures, bouton « Revenir à l'étape » et non-régression Standard/Autonome validés.`);
}
