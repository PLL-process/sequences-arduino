/* LOT #1.5 — Test ciblé : mission-editor-assist.js se charge sans SyntaxError (régression B18). */
/* Vérifie : absence d'exception au chargement, module effectivement installé, */
/* autocomplétion et commandes d'assistance disponibles, aucune nouvelle erreur console. */

/* Serveur HTTP natif. */
import http from "node:http";
/* Lecture du système de fichiers. */
import { readFile, stat } from "node:fs/promises";
/* Gestion des chemins. */
import path from "node:path";
/* Conversion URL -> chemin. */
import { fileURLToPath } from "node:url";
/* Chromium via Playwright. */
import { chromium } from "playwright";

/* Dossier du test. */
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
/* Racine du dépôt. */
const repositoryRoot = path.resolve(testDirectory, "..");

/* Types MIME utiles. */
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".webp", "image/webp"]
]);

/* Pause simple. */
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/* Convertit une requête en chemin local sûr. */
function safeLocalPath(requestUrl) {
  /* Analyse l'adresse. */
  const parsedUrl = new URL(requestUrl || "/", "http://127.0.0.1");
  /* Décode le chemin. */
  const decodedPath = decodeURIComponent(parsedUrl.pathname);
  /* Séance 1 par défaut. */
  const requestedPath = decodedPath === "/" ? "/seance-1.html" : decodedPath;
  /* Chemin absolu. */
  const candidatePath = path.resolve(repositoryRoot, `.${requestedPath}`);
  /* Interdit toute sortie du dépôt. */
  if (!candidatePath.startsWith(repositoryRoot)) throw new Error("Chemin interdit");
  /* Retourne le chemin. */
  return candidatePath;
}

/* Serveur statique minimal. */
const server = http.createServer(async (request, response) => {
  /* Protège la lecture. */
  try {
    /* Chemin local. */
    let localPath = safeLocalPath(request.url);
    /* Statistiques du chemin. */
    const localStat = await stat(localPath);
    /* index.html pour un dossier. */
    if (localStat.isDirectory()) localPath = path.join(localPath, "index.html");
    /* Lecture du contenu. */
    const body = await readFile(localPath);
    /* Type MIME. */
    const contentType = mimeTypes.get(path.extname(localPath).toLowerCase()) || "application/octet-stream";
    /* Réponse sans cache. */
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    /* Fin de réponse. */
    response.end(body);
  } catch (error) {
    /* Erreur 404. */
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    /* Détail. */
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

/* Nombre attendu de méthodes du catalogue (voir METHODS dans mission-editor-assist.js). */
const EXPECTED_METHOD_COUNT = 11;

/* Démarre le serveur. */
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
/* Adresse du serveur. */
const address = server.address();
/* Vérifie l'adresse. */
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
/* URL de la séance. */
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;

/* Lance Chromium. */
const browser = await chromium.launch({ headless: true });
/* Contexte 1366x768. */
const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
/* Efface toute sauvegarde. */
await context.addInitScript(() => localStorage.clear());
/* Nouvelle page. */
const page = await context.newPage();

/* Collecte des erreurs console. */
const consoleErrors = [];
/* Collecte des exceptions JS non capturées. */
const pageErrors = [];
/* Collecte des exceptions localisées (CDP). */
const locatedExceptions = [];

/* Écoute la console. */
page.on("console", message => {
  /* Retient uniquement les erreurs. */
  if (message.type() === "error") {
    /* Ajoute l'emplacement. */
    const location = message.location();
    /* Consigne l'entrée. */
    consoleErrors.push(`${message.text()} @ ${location.url}:${location.lineNumber}`);
  }
});
/* Écoute les exceptions JS. */
page.on("pageerror", error => pageErrors.push(error.message));
/* Session CDP pour localiser les exceptions. */
const cdp = await context.newCDPSession(page);
/* Active le domaine d'exécution. */
await cdp.send("Runtime.enable");
/* Enregistre chaque exception localisée. */
cdp.on("Runtime.exceptionThrown", event => {
  /* Détails de l'exception. */
  const details = event.exceptionDetails;
  /* Message complet si disponible. */
  const message = (details.exception && details.exception.description) ? details.exception.description.split("\n")[0] : details.text;
  /* Consigne la localisation (1-based). */
  locatedExceptions.push(`${message} @ ${details.url}:${(details.lineNumber || 0) + 1}:${(details.columnNumber || 0) + 1}`);
});

/* Liste des échecs d'assertion. */
const failures = [];
/* Ajoute une assertion. */
function assert(condition, description) {
  /* Consigne l'échec le cas échéant. */
  if (!condition) failures.push(description);
  /* Journalise le résultat. */
  console.log(`${condition ? "OK " : "ÉCHEC"} — ${description}`);
}

/* Exécute le scénario. */
try {
  /* Charge la séance. */
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  /* Attend le bouton d'activation. */
  await page.waitForSelector("#missionActivate", { state: "visible" });
  /* Active le mode Mission. */
  await page.click("#missionActivate");
  /* Attend l'éditeur du panneau Mission. */
  await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });

  /* Laisse le module d'assistance s'installer (waitForMission interroge toutes les 100 ms). */
  await page.waitForFunction(
    () => document.getElementById("missionModeRoot")?.dataset.editorAssistReady === "true",
    { timeout: 10000 }
  ).catch(() => {});
  /* Petite marge pour la construction du ruban et du menu. */
  await pause(300);

  /* 1) Aucune exception JavaScript non capturée au chargement. */
  assert(pageErrors.length === 0, `aucune exception JS au chargement (observées: ${JSON.stringify(pageErrors)})`);
  /* 2) Aucune exception localisée (dont l'ancienne SyntaxError de editor-assist). */
  assert(locatedExceptions.length === 0, `aucune exception localisée (observées: ${JSON.stringify(locatedExceptions)})`);
  /* 3) Spécifiquement, aucune SyntaxError liée à editor-assist. */
  const editorAssistSyntax = [...locatedExceptions, ...pageErrors, ...consoleErrors]
    .some(entry => /SyntaxError/.test(entry) && /editor-assist/.test(entry));
  assert(!editorAssistSyntax, "aucune SyntaxError provenant de mission-editor-assist.js");

  /* 4) Le module est effectivement installé. */
  const assistReady = await page.evaluate(() => document.getElementById("missionModeRoot")?.dataset.editorAssistReady === "true");
  assert(assistReady === true, "mission-editor-assist.js installé (editorAssistReady = true)");

  /* 5) Les commandes d'assistance existent. */
  const assistUi = await page.evaluate(() => ({
    /* Bouton Cours. */
    course: Boolean(document.getElementById("missionCoursePopup")),
    /* Bouton Méthodes. */
    methods: Boolean(document.getElementById("missionMethodsPopup")),
    /* Ruban de commandes. */
    rail: Boolean(document.querySelector(".mission-command-rail")),
    /* Nombre de puces de commande. */
    chips: document.querySelectorAll(".mission-command-chip").length,
    /* Présence du menu d'autocomplétion. */
    completionMenu: Boolean(document.querySelector(".mission-completion-menu"))
  }));
  /* Vérifie chaque élément d'assistance. */
  assert(assistUi.course && assistUi.methods, "boutons d'assistance présents (Cours + Méthodes)");
  assert(assistUi.rail, "ruban de commandes présent");
  assert(assistUi.chips === EXPECTED_METHOD_COUNT, `ruban complet : ${assistUi.chips} commandes (attendu ${EXPECTED_METHOD_COUNT})`);
  assert(assistUi.completionMenu, "conteneur d'autocomplétion présent");

  /* 6) L'autocomplétion fonctionne réellement (niveau Guidé). */
  /* Vérifie que le niveau courant est bien Guidé (autocomplétion active uniquement dans ce mode). */
  const helpValue = await page.evaluate(() => document.getElementById("missionHelpLevel")?.value);
  assert(helpValue === "guided", `niveau Guidé actif pour l'autocomplétion (courant: ${helpValue})`);
  /* Donne le focus à l'éditeur. */
  await page.locator("#missionEditorMount #codeEditor").click();
  /* Laisse le placement guidé du curseur se faire. */
  await pause(150);
  /* Saisit un fragment déclencheur, précédé d'un espace pour un mot propre. */
  await page.keyboard.type(" Serial", { delay: 25 });
  /* Laisse l'autocomplétion réagir. */
  await pause(250);
  /* Lit l'état du menu de propositions. */
  const completion = await page.evaluate(() => {
    /* Récupère le menu. */
    const menu = document.querySelector(".mission-completion-menu");
    /* Compte les propositions visibles. */
    const items = document.querySelectorAll(".mission-completion-item").length;
    /* Retourne l'état. */
    return { visible: Boolean(menu && !menu.hidden), items };
  });
  /* Vérifie l'apparition de propositions. */
  assert(completion.visible && completion.items >= 1, `autocomplétion fonctionnelle sur « Serial » (visible=${completion.visible}, items=${completion.items})`);
  /* Ferme le menu. */
  await page.keyboard.press("Escape");

  /* 7) Le bouton Méthodes ouvre la fiche méthode (documentation contextuelle). */
  await page.click("#missionMethodsPopup");
  /* Laisse la fiche s'afficher. */
  await pause(150);
  /* Vérifie la visibilité de la fiche. */
  const cardVisible = await page.evaluate(() => {
    /* Récupère la fiche méthode. */
    const card = document.querySelector(".mission-method-card");
    /* Retourne sa visibilité. */
    return Boolean(card && !card.hidden);
  });
  /* Vérifie l'ouverture de la documentation méthode. */
  assert(cardVisible, "le bouton Méthodes ouvre la fiche méthode (documentation)");

  /* 8) Aucune erreur console pendant l'ensemble des interactions. */
  assert(consoleErrors.length === 0, `aucune erreur console (observées: ${JSON.stringify(consoleErrors)})`);
} catch (error) {
  /* Consigne une panne d'exécution. */
  failures.push(`exécution : ${error.message}`);
  /* Capture de diagnostic. */
  try { await page.screenshot({ path: path.join(testDirectory, "editor-assist-failure.png"), fullPage: true }); } catch {}
} finally {
  /* Ferme le contexte. */
  await context.close();
  /* Ferme Chromium. */
  await browser.close();
  /* Ferme le serveur. */
  await new Promise(resolve => server.close(resolve));
}

/* Bilan final. */
if (failures.length) {
  /* Affiche les échecs. */
  console.error(`\nÉCHEC (${failures.length}) :\n${failures.map(item => " - " + item).join("\n")}`);
  /* Signale l'échec réel. */
  process.exitCode = 1;
} else {
  /* Confirme la réussite. */
  console.log("\nSUCCÈS — mission-editor-assist.js se charge et l'assistance est disponible (B18 corrigé).");
}
