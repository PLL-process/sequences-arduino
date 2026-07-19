/* Démonstration VISUELLE — Navigation et protection du mode Guidé (lente, séquentielle). */
/* Ouvre un vrai Chromium visible et montre, pas à pas :                                */
/*   - la cible active (cadre + flèche sur la première étape manquante) ;               */
/*   - la remontée vers une ancienne ligne révélée ;                                    */
/*   - sa correction (le code de l'élève est modifiable) ;                              */
/*   - le maintien du cadre principal sur l'étape manquante ;                           */
/*   - la surbrillance secondaire de la ligne éditée ;                                  */
/*   - le bouton « Revenir à l'étape » ;                                                */
/*   - une tentative bloquée de modification d'un commentaire pédagogique ;             */
/*   - une tentative bloquée d'accès à une ligne future.                                */
/* */
/* Lancement (fenêtre visible) :  node tests/mission-guided-navigation-demo.mjs         */
/* Auto-vérification sans fenêtre :  HEADLESS=1 node tests/mission-guided-navigation-demo.mjs */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"], [".webp", "image/webp"]]);

const HEADLESS = process.env.HEADLESS === "1";
const beat = HEADLESS ? 120 : 1700;
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

/* Bannière de narration (non interactive). */
function showBanner(text) {
  let banner = document.getElementById("__demoBanner__");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "__demoBanner__";
    banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;padding:10px 16px;background:#facc15;color:#111;font:700 16px/1.3 Inter,system-ui,sans-serif;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.4);pointer-events:none";
    document.body.appendChild(banner);
  }
  banner.textContent = text;
}

/* Remplit certaines étapes du squelette guidé (index figés). */
function fillSteps(filledSteps) {
  const lines = window.TechnoQuestMissionValidator.getSkeleton("guided", 1).split("\n");
  if (filledSteps.includes("include")) lines[0] = "#include <Arduino.h>";
  if (filledSteps.includes("serialBegin")) lines[7] = "  Serial.begin(9600);";
  if (filledSteps.includes("pinMode")) lines[9] = "  pinMode(PIN_RELAIS_POMPE, OUTPUT);";
  const editor = document.getElementById("codeEditor");
  editor.value = lines.join("\n");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Place le curseur sur une ligne (au retrait ou en fin) et signale un clic. */
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

/* Corrompt un commentaire par programme (démontre la restauration). */
function corruptComment(line) {
  const editor = document.getElementById("codeEditor");
  const lines = editor.value.split("\n");
  lines[line] = "  // TENTATIVE DE MODIFICATION";
  editor.value = lines.join("\n");
  editor.setSelectionRange(0, 0);
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Sonde compacte de l'état guidé. */
function probe() {
  const editor = document.getElementById("codeEditor");
  const model = window.TechnoQuestGuidedGeometry.model();
  const button = document.querySelector(".mission-return-step");
  const band = document.querySelector(".mission-editing-line");
  return {
    caretLine: editor.value.slice(0, editor.selectionStart).split("\n").length - 1,
    editingLine: model.editingLine,
    targetLine: model.targetLine,
    holding: window.TechnoQuestGuidedGeometry.isHolding(),
    buttonVisible: button ? !button.hidden : false,
    bandVisible: band ? !band.hidden : false,
    line6: editor.value.split("\n")[6],
    line7: editor.value.split("\n")[7],
    line0: editor.value.split("\n")[0]
  };
}

const banner = fn => showBanner.toString();
const call = (page, fn, ...args) => page.evaluate(({ f, a }) => new Function(`return (${f})`)()(...a), { f: fn.toString(), a: args });

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;

const browser = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 220 });
const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
await context.addInitScript(() => localStorage.clear());
const page = await context.newPage();
page.on("dialog", d => d.accept().catch(() => {}));

const failures = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}

try {
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#missionActivate", { state: "visible" });
  await call(page, showBanner, "Démonstration — Navigation et protection du mode Guidé");
  await pause(beat);

  /* 1) Activation. */
  await call(page, showBanner, "1) Activation du mode Mission (niveau Guidé)");
  await page.click("#missionActivate");
  await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry && window.TechnoQuestGuidedGeometry.model));
  await page.locator("#missionCodeShell").scrollIntoViewIfNeeded().catch(() => {});
  await pause(beat);

  /* 2) Cible active : deux étapes déjà écrites, la cible avance à pinMode. */
  await call(page, showBanner, "2) Cible active : le cadre vise la première étape manquante (pinMode)");
  await call(page, fillSteps, ["include", "serialBegin"]);
  await pause(beat);
  let p = await call(page, probe);
  check(p.targetLine === 9, `démo : cible active sur la ligne 10 (obtenu ${p.targetLine + 1})`);

  /* 3) Remontée vers une ancienne ligne révélée (Serial.begin, ligne 8). */
  await call(page, showBanner, "3) Remontée : l'élève clique sur une ancienne ligne déjà révélée (ligne 8)");
  await call(page, setCaretLine, 7, true);
  await pause(beat);
  p = await call(page, probe);
  check(p.editingLine === 7 && p.bandVisible, `démo : surbrillance secondaire sur l'ancienne ligne 8`);
  check(p.targetLine === 9, `démo : cadre principal maintenu sur l'étape (ligne 10)`);
  check(p.buttonVisible, `démo : bouton « Revenir à l'étape » apparaît`);

  /* 4) Correction de l'ancienne ligne. */
  await call(page, showBanner, "4) Correction : le code déjà écrit reste modifiable");
  await page.keyboard.type("  // relu", { delay: HEADLESS ? 0 : 55 });
  await pause(beat);
  p = await call(page, probe);
  check(p.line7.includes("// relu"), `démo : correction de l'ancienne ligne appliquée`);

  /* 5) La cible principale reste indiquée. */
  await call(page, showBanner, "5) La cible principale reste indiquée sur l'étape à compléter");
  await pause(beat);

  /* 6) Bouton « Revenir à l'étape ». */
  await call(page, showBanner, "6) Bouton « Revenir à l'étape » : recentrage sur la cible");
  await page.click(".mission-return-step");
  await pause(beat);
  p = await call(page, probe);
  check(p.caretLine === 9 && !p.holding, `démo : recentrage sur l'étape depuis le bouton`);

  /* 7) Tentative bloquée de modification d'un commentaire. */
  await call(page, showBanner, "7) Protection : une modification programmatique d'un commentaire est annulée");
  const commentBefore = (await call(page, probe)).line6;
  await call(page, corruptComment, 6);
  await pause(beat);
  p = await call(page, probe);
  check(p.line6 === commentBefore, `démo : commentaire pédagogique restauré`);
  check(p.line0 === "#include <Arduino.h>" && p.line7.includes("Serial.begin"), `démo : code de l'élève préservé`);

  /* 8) Tentative bloquée d'accès à une ligne future. */
  await call(page, showBanner, "8) Verrouillage : tentative d'accès à une ligne future (curseur ramené)");
  await call(page, setCaretLine, 11, false);
  await pause(beat);
  p = await call(page, probe);
  check(p.caretLine !== 11, `démo : curseur ramené hors de la ligne future`);

  await call(page, showBanner, "Fin de la démonstration.");
  await pause(HEADLESS ? 120 : 3200);

  if (failures.length) {
    console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log("\nDémonstration terminée — navigation, correction, protection et recentrage validés.");
  }
} catch (error) {
  console.error("Erreur de démonstration :", error.message);
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
