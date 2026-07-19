/* LOT géométrique — Test d'alignement de la géométrie guidée (B1/B2/B3/B5/B7 + zoom). */
/* Vérifie, par mesure RÉELLE du rendu (numéros de gouttière), que : */
/*  - le cadre englobe le commentaire ET la ligne de code ; */
/*  - la flèche, la surbrillance et « Écrire ici · ligne X » visent la ligne de code ; */
/*  - le curseur (selectionStart) est sur la ligne de code (mode Guidé) ; */
/*  - au moins trois lignes suivantes restent visibles ; */
/*  - un seul écrivain de flèche (pas de concurrence après défilement) ; */
/*  - aucune erreur console. */
/* Écrans stricts : 1920x1080, 1366x768, tablette 768x1024, zoom 200 %. */
/* Téléphone : mesuré et journalisé comme limite connue (voir RESIDUAL_PHONE). */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"], [".webp", "image/webp"]]);
const pause = ms => new Promise(r => setTimeout(r, ms));

/* Tolérance d'alignement en pixels (critère : écart maximal de 3 px). */
const TOLERANCE = 3;

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

/* Construit un programme guidé avec certaines étapes remplies (index figés du squelette). */
function buildProgram(filledSteps) {
  const lines = window.TechnoQuestMissionValidator.getSkeleton("guided", 1).split("\n");
  if (filledSteps.includes("include")) lines[1] = "#include <Arduino.h>";
  if (filledSteps.includes("serialBegin")) lines[8] = "  Serial.begin(9600);";
  if (filledSteps.includes("pinMode")) lines[10] = "  pinMode(PIN_RELAIS_POMPE, OUTPUT);";
  const editor = document.getElementById("codeEditor");
  editor.value = lines.join("\n");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Mesure l'alignement réel entre les décorations et les numéros de gouttière (rendu réel). */
function measureAlignment() {
  const gutter = document.getElementById("missionLineNumbers");
  const editor = document.getElementById("codeEditor");
  const frame = document.querySelector(".mission-target-line");
  const band = document.querySelector(".mission-target-code");
  const arrow = document.getElementById("missionArrow");
  const current = window.TechnoQuestMissionGuidedTarget.getCurrent(editor.value, 1);
  const codeLine = current.lineIndex;
  if (codeLine === null || codeLine === undefined) return { done: true };
  const commentLine = String((editor.value.split("\n"))[codeLine] || "").trim().startsWith("//") ? codeLine : codeLine - 1;
  const codeSpan = gutter.children[codeLine]?.getBoundingClientRect();
  const commentSpan = gutter.children[commentLine]?.getBoundingClientRect();
  const frameRect = frame && !frame.hidden ? frame.getBoundingClientRect() : null;
  const bandRect = band && !band.hidden ? band.getBoundingClientRect() : null;
  const arrowRect = arrow && !arrow.classList.contains("mission-arrow-complete") ? arrow.getBoundingClientRect() : null;
  const label = frame?.querySelector(".mission-target-line-label")?.textContent || "";
  const caretLine = editor.value.slice(0, editor.selectionStart).split("\n").length - 1;
  /* Compte les lignes de contexte visibles après la ligne de code. */
  const editorRect = editor.getBoundingClientRect();
  let followingVisible = 0;
  for (let i = codeLine + 1; i < gutter.children.length; i += 1) {
    const r = gutter.children[i].getBoundingClientRect();
    if (r.top >= editorRect.top && r.bottom <= editorRect.bottom + 1) followingVisible += 1; else break;
  }
  return {
    done: false,
    stepId: current.stepId,
    codeLine,
    commentLine,
    caretLine,
    label,
    frameTopVsComment: frameRect && commentSpan ? Math.abs(frameRect.top - commentSpan.top) : null,
    frameBottomVsCode: frameRect && codeSpan ? Math.abs(frameRect.bottom - codeSpan.bottom) : null,
    frameEnclosesTwoLines: frameRect && codeSpan && commentSpan ? (codeLine !== commentLine ? frameRect.height >= (codeSpan.bottom - commentSpan.top) - 6 : true) : null,
    bandVsCodeTop: bandRect && codeSpan ? Math.abs(bandRect.top - codeSpan.top) : null,
    arrowVsCodeCenter: arrowRect && codeSpan ? Math.abs((arrowRect.top + arrowRect.bottom) / 2 - (codeSpan.top + codeSpan.bottom) / 2) : null,
    followingVisible
  };
}

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;
const browser = await chromium.launch({ headless: true });

const failures = [];
const warnings = [];
function check(condition, description, soft = false) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  if (soft) { warnings.push(description); console.log(`WARN— ${description}`); }
  else { failures.push(description); console.log(`ÉCHEC— ${description}`); }
}

/* Prépare une page Mission au niveau Guidé avec les étapes remplies, éventuellement zoomée. */
async function preparePage(viewport, filled, zoom) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#missionActivate", { state: "visible" });
  await page.click("#missionActivate");
  await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
  await page.waitForFunction(() => Boolean(window.TechnoQuestMissionGuidedTarget && window.TechnoQuestGuidedGeometry));
  /* Applique le remplissage demandé (étapes déjà écrites). */
  await page.evaluate(({ fn, steps }) => new Function(`return (${fn})`)()(steps), { fn: buildProgram.toString(), steps: filled });
  await pause(400);
  if (zoom) { await page.evaluate(() => { document.documentElement.style.zoom = "2"; window.dispatchEvent(new Event("resize")); }); await pause(500); }
  await page.locator("#missionCodeShell").scrollIntoViewIfNeeded().catch(() => {});
  await pause(800);
  return { context, page, consoleErrors };
}

/* Écrans stricts (téléphone inclus) + un cas zoom. Critère : écart maximal 3 px partout. */
const strictCases = [
  { name: "1920x1080", viewport: { width: 1920, height: 1080 }, zoom: false },
  { name: "1366x768", viewport: { width: 1366, height: 768 }, zoom: false },
  { name: "tablette-768x1024", viewport: { width: 768, height: 1024 }, zoom: false },
  { name: "telephone-390x844", viewport: { width: 390, height: 844 }, zoom: false },
  { name: "1366x768-zoom200", viewport: { width: 1366, height: 768 }, zoom: true }
];

/* Vérifie l'alignement à l'étape serialBegin (commentaire + ligne de code vide) sur chaque écran strict. */
for (const testCase of strictCases) {
  const { context, page, consoleErrors } = await preparePage(testCase.viewport, ["include"], testCase.zoom);
  const m = await page.evaluate(fn => new Function(`return (${fn})`)()(), measureAlignment.toString());
  const tag = testCase.name;
  check(!m.done && m.stepId === "serialBegin", `${tag} : étape active = serialBegin (obtenu ${m.stepId})`);
  check(m.frameTopVsComment !== null && m.frameTopVsComment <= TOLERANCE, `${tag} : cadre haut aligné sur le commentaire (Δ${Math.round(m.frameTopVsComment)}px)`);
  check(m.frameBottomVsCode !== null && m.frameBottomVsCode <= TOLERANCE, `${tag} : cadre bas aligné sur la ligne de code (Δ${Math.round(m.frameBottomVsCode)}px)`);
  check(m.frameEnclosesTwoLines === true, `${tag} : cadre englobe commentaire + code`);
  check(m.arrowVsCodeCenter !== null && m.arrowVsCodeCenter <= TOLERANCE, `${tag} : flèche centrée sur la ligne de code (Δ${Math.round(m.arrowVsCodeCenter)}px)`);
  check(m.bandVsCodeTop !== null && m.bandVsCodeTop <= TOLERANCE, `${tag} : surbrillance sur la ligne de code (Δ${Math.round(m.bandVsCodeTop)}px)`);
  check(m.label.includes(String(m.codeLine + 1)), `${tag} : étiquette « ligne ${m.codeLine + 1} » (obtenu "${m.label}")`);
  check(m.caretLine === m.codeLine, `${tag} : curseur sur la ligne de code (curseur ${m.caretLine + 1}, code ${m.codeLine + 1})`);
  check(m.followingVisible >= 3, `${tag} : au moins 3 lignes suivantes visibles (obtenu ${m.followingVisible})`);
  /* Vérifie l'alignement de #codeHighlight avec le textarea en mode Mission (même interligne). */
  const heights = await page.evaluate(() => ({
    highlight: window.getComputedStyle(document.getElementById("codeHighlight")).lineHeight,
    editor: window.getComputedStyle(document.getElementById("codeEditor")).lineHeight
  }));
  check(heights.highlight === heights.editor, `${tag} : #codeHighlight aligné sur le textarea (interligne ${heights.highlight} = ${heights.editor})`);
  check(consoleErrors.length === 0, `${tag} : aucune erreur console (${JSON.stringify(consoleErrors)})`);
  await context.close();
}

/* Vérifie l'alignement à travers plusieurs étapes successives (1366x768). */
{
  const scenarios = [
    { filled: [], step: "include" },
    { filled: ["include"], step: "serialBegin" },
    { filled: ["include", "serialBegin"], step: "pinMode" }
  ];
  for (const sc of scenarios) {
    const { context, page } = await preparePage({ width: 1366, height: 768 }, sc.filled, false);
    const m = await page.evaluate(fn => new Function(`return (${fn})`)()(), measureAlignment.toString());
    check(m.stepId === sc.step && m.arrowVsCodeCenter <= TOLERANCE && m.caretLine === m.codeLine,
      `étape ${sc.step} : flèche+curseur alignés sur la ligne de code (Δflèche ${m.arrowVsCodeCenter === null ? "n/a" : Math.round(m.arrowVsCodeCenter)}px)`);
    await context.close();
  }
}

/* Vérifie l'écrivain UNIQUE : après défilement, la flèche reste alignée (pas de concurrence). */
{
  const { context, page } = await preparePage({ width: 1366, height: 768 }, ["include", "serialBegin"], false);
  /* Provoque des événements de défilement et de redimensionnement. */
  await page.evaluate(() => { document.getElementById("codeEditor").dispatchEvent(new Event("scroll")); window.dispatchEvent(new Event("resize")); });
  await pause(400);
  const m = await page.evaluate(fn => new Function(`return (${fn})`)()(), measureAlignment.toString());
  check(m.arrowVsCodeCenter !== null && m.arrowVsCodeCenter <= TOLERANCE, `après défilement/redimensionnement : flèche unique et alignée (Δ${m.arrowVsCodeCenter === null ? "n/a" : Math.round(m.arrowVsCodeCenter)}px)`);
  await context.close();
}

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ GÉOMÉTRIE =====`);
if (warnings.length) console.log(`Avertissements (limites connues) : ${warnings.length}`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — géométrie guidée alignée sur écrans stricts et zoom 200 % (${warnings.length} limite(s) connue(s) journalisée(s)).`);
}
