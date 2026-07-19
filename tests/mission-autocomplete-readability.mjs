/* Test Playwright — LISIBILITÉ de la fenêtre d'autocomplétion « Choisissez la suite possible ». */
/* Vérifie qu'en mode Guidé, après avoir saisi « #inc » : le panneau apparaît, la description et */
/* la commande #include <Arduino.h> sont visibles SANS se chevaucher (deux zones verticales), le */
/* fond est quasi opaque, la proposition active est identifiable, la sélection au clavier et à la */
/* souris fonctionne, et aucune erreur console n'est émise — à 1920×1080, 1366×768, 390×844 et zoom 200 %. */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".svg", "image/svg+xml"], [".png", "image/png"]]);
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
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}
/* Analyse une couleur CSS et retourne son canal alpha (1 si opaque). */
function alphaOf(color) {
  const m = String(color).match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const parts = m[1].split(",").map(s => s.trim());
  return parts.length >= 4 ? parseFloat(parts[3]) : 1;
}

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;

/* Ouvre la page, active la Mission guidée, saisit « #inc » et attend le menu. */
/* Le zoom navigateur 200 % est émulé fidèlement : un vrai zoom divise par deux la largeur */
/* CSS du viewport (et déclenche la reflow des media queries) avec un deviceScaleFactor de 2 — */
/* contrairement à body.style.zoom qui ne fait que mettre à l'échelle sans reflow. */
async function openWithMenu(viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  await context.addInitScript(() => localStorage.clear());
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await pause(400);
  await page.click("#missionActivate");
  await pause(300);
  await page.evaluate(() => { const e = document.querySelector("#codeEditor"); e.focus(); e.setSelectionRange(0, 0); });
  await page.keyboard.type("#inc");
  await pause(400);
  return { context, page, consoleErrors };
}

/* Mesure le panneau et sa première proposition. */
const probeMenu = () => ({
  found: (() => { const m = document.querySelector(".mission-completion-menu"); return !!m && !m.hidden; })(),
  ...(() => {
    const menu = document.querySelector(".mission-completion-menu");
    if (!menu || menu.hidden) return {};
    const cs = getComputedStyle(menu);
    const item = menu.querySelector(".mission-completion-item");
    const code = item.querySelector("code");
    const span = item.querySelector("span");
    const rc = code.getBoundingClientRect();
    const rs = span.getBoundingClientRect();
    const activeCs = getComputedStyle(item);
    const mr = menu.getBoundingClientRect();
    return {
      menuBg: cs.backgroundColor, menuOpacity: cs.opacity, zIndex: cs.zIndex,
      itemBg: activeCs.backgroundColor, itemBorder: activeCs.borderTopColor, itemBoxShadow: activeCs.boxShadow,
      codeVisible: rc.width > 0 && rc.height > 0, spanVisible: rs.width > 0 && rs.height > 0,
      codeText: code.textContent, spanText: span.textContent,
      /* Chevauchement des rectangles description/commande. */
      overlap: !(rc.right <= rs.left || rs.right <= rc.left || rc.bottom <= rs.top || rs.bottom <= rc.top),
      codeBelowSpan: rc.top >= rs.bottom - 1,
      menuRight: mr.right, menuLeft: mr.left, menuTop: mr.top, innerWidth: window.innerWidth
    };
  })()
});

const allConsoleErrors = [];

/* ===== Lisibilité et non-chevauchement sur 4 configurations ===== */
for (const cfg of [
  { label: "1920×1080", viewport: { width: 1920, height: 1080 }, dsf: 1 },
  { label: "1366×768", viewport: { width: 1366, height: 768 }, dsf: 1 },
  { label: "390×844", viewport: { width: 390, height: 844 }, dsf: 1 },
  /* Zoom 200 % d'un écran 1366×768 : viewport CSS divisé par deux, deviceScaleFactor 2. */
  { label: "1366×768 · zoom 200 %", viewport: { width: 683, height: 384 }, dsf: 2 }
]) {
  const { context, page, consoleErrors } = await openWithMenu(cfg.viewport, cfg.dsf);
  const m = await page.evaluate(probeMenu);
  check(m.found, `[${cfg.label}] 2. le panneau de suggestions apparaît après « #inc »`);
  check(m.spanVisible && /\S/.test(m.spanText || ""), `[${cfg.label}] 3. la description pédagogique est visible`);
  check(m.codeVisible && /#include\s*<\s*Arduino\.h\s*>/.test(m.codeText || ""), `[${cfg.label}] 4. « #include <Arduino.h> » est visible (chevrons corrects)`);
  check(m.overlap === false && m.codeBelowSpan === true, `[${cfg.label}] 5. description et commande NE se chevauchent PAS (commande sous description)`);
  check(alphaOf(m.menuBg) >= 0.95 && m.menuOpacity === "1", `[${cfg.label}] 6. fond du panneau quasi opaque (α=${alphaOf(m.menuBg)}, opacity=${m.menuOpacity})`);
  check(alphaOf(m.itemBg) >= 0.95, `[${cfg.label}] 6b. fond des cartes quasi opaque (α=${alphaOf(m.itemBg)})`);
  check(Number(m.zIndex) >= 40 && m.menuLeft >= -1 && m.menuRight <= m.innerWidth + 1, `[${cfg.label}] 4pos. z-index suffisant (${m.zIndex}), pas de débordement horizontal`);
  /* Proposition active identifiable : bordure ambre ou liseré interne. */
  check(/250,\s*204,\s*21/.test(m.itemBorder) || /250,\s*204,\s*21/.test(m.itemBoxShadow), `[${cfg.label}] 7. proposition active identifiable (liseré ambre)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Sélection au CLAVIER (flèche + Entrée) ===== */
{
  const { context, page, consoleErrors } = await openWithMenu({ width: 1366, height: 768 }, 1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await pause(200);
  const value = await page.evaluate(() => document.querySelector("#codeEditor").value);
  check(/#include\s*<\s*Arduino\.h\s*>/.test(value), `8. sélection au clavier (↓ puis Entrée) insère #include <Arduino.h>`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Sélection à la SOURIS (clic) ===== */
{
  const { context, page, consoleErrors } = await openWithMenu({ width: 1366, height: 768 }, 1);
  await page.click(".mission-completion-menu .mission-completion-item");
  await pause(200);
  const value = await page.evaluate(() => document.querySelector("#codeEditor").value);
  check(/#include\s*<\s*Arduino\.h\s*>/.test(value), `9. sélection à la souris (clic) insère #include <Arduino.h>`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== Zéro erreur console (cas 10) ===== */
check(allConsoleErrors.length === 0, `10. zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ LISIBILITÉ AUTOCOMPLÉTION =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — description et commande empilées sans chevauchement, panneau opaque, sélection clavier/souris fonctionnelle, zéro erreur console.`);
}
