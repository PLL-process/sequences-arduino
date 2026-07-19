/* Démonstration VISUELLE de la géométrie guidée (lente et séquentielle). */
/* Ouvre un vrai Chromium visible et parcourt la séance 1 étape par étape */
/* afin d'observer le cadre, la flèche, la surbrillance et le curseur suivre la ligne de code. */
/* */
/* Lancement (fenêtre visible) :  node tests/mission-guided-demo.mjs */
/* Vérification sans fenêtre     :  HEADLESS=1 node tests/mission-guided-demo.mjs */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"], [".webp", "image/webp"]]);

/* Durée d'une pause de démonstration (raccourcie en mode sans fenêtre). */
const HEADLESS = process.env.HEADLESS === "1";
const beat = HEADLESS ? 120 : 1600;
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

/* Affiche une bannière de narration au-dessus de la page. */
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
  if (filledSteps.includes("include")) lines[1] = "#include <Arduino.h>";
  if (filledSteps.includes("serialBegin")) lines[8] = "  Serial.begin(9600);";
  if (filledSteps.includes("pinMode")) lines[10] = "  pinMode(PIN_RELAIS_POMPE, OUTPUT);";
  if (filledSteps.includes("safeLowSetup")) lines[12] = "  digitalWrite(PIN_RELAIS_POMPE, LOW);";
  const editor = document.getElementById("codeEditor");
  editor.value = lines.join("\n");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;

/* Fenêtre visible par défaut ; ralenti pour l'observation. */
const browser = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 250 });
const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
await context.addInitScript(() => localStorage.clear());
const page = await context.newPage();

try {
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("#missionActivate", { state: "visible" });
  await page.evaluate(fn => new Function(`return (${fn})`)()("Démonstration — géométrie guidée de la séance 1"), showBanner.toString());
  await pause(beat);

  /* Active le mode Mission. */
  await page.evaluate(fn => new Function(`return (${fn})`)()("1) Activation du mode Mission (niveau Guidé)"), showBanner.toString());
  await page.click("#missionActivate");
  await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
  await page.waitForFunction(() => Boolean(window.TechnoQuestGuidedGeometry));
  await page.locator("#missionCodeShell").scrollIntoViewIfNeeded().catch(() => {});
  await pause(beat);

  /* Étape include. */
  await page.evaluate(fn => new Function(`return (${fn})`)()("2) Étape include : le cadre vise la première instruction manquante"), showBanner.toString());
  await pause(beat);

  /* Étape serialBegin (saisie réelle sur la ligne de code sous le commentaire). */
  await page.evaluate(fn => new Function(`return (${fn})`)()("3) include écrit → la cible avance à Serial.begin(9600);"), showBanner.toString());
  await page.evaluate(({ fn }) => new Function(`return (${fn})`)()(["include"]), { fn: fillSteps.toString() });
  await pause(beat);
  /* Saisie au clavier sur la ligne de code guidée. */
  await page.evaluate(fn => new Function(`return (${fn})`)()("4) Saisie au clavier — le curseur est verrouillé sur la ligne de code"), showBanner.toString());
  await page.locator("#missionEditorMount #codeEditor").click();
  await pause(beat / 2);
  await page.keyboard.type("  Serial.begin(9600);", { delay: HEADLESS ? 0 : 60 });
  await pause(beat);

  /* Étapes pinMode puis safeLowSetup. */
  await page.evaluate(fn => new Function(`return (${fn})`)()("5) Étape suivante : pinMode(PIN_RELAIS_POMPE, OUTPUT);"), showBanner.toString());
  await page.evaluate(({ fn }) => new Function(`return (${fn})`)()(["include", "serialBegin"]), { fn: fillSteps.toString() });
  await pause(beat);
  await page.evaluate(fn => new Function(`return (${fn})`)()("6) Étape « Garder la pompe arrêtée au démarrage »"), showBanner.toString());
  await page.evaluate(({ fn }) => new Function(`return (${fn})`)()(["include", "serialBegin", "pinMode"]), { fn: fillSteps.toString() });
  await pause(beat);

  /* Démonstration du zoom 200 %. */
  await page.evaluate(fn => new Function(`return (${fn})`)()("7) Zoom à 200 % — le cadre et la flèche restent alignés"), showBanner.toString());
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; window.dispatchEvent(new Event("resize")); });
  await pause(beat);
  await page.evaluate(() => { document.documentElement.style.zoom = "1"; window.dispatchEvent(new Event("resize")); });

  /* Fin. */
  await page.evaluate(fn => new Function(`return (${fn})`)()("Fin de la démonstration."), showBanner.toString());
  await pause(HEADLESS ? 120 : 3000);
  console.log("Démonstration terminée.");
} catch (error) {
  console.error("Erreur de démonstration :", error.message);
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
