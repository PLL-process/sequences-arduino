/* Test Playwright : clic exact en mode libre et ligne verrouillée en mode Guidé. */

/* Importe le serveur HTTP natif de Node.js. */
import http from "node:http";
/* Importe les fonctions de lecture du système de fichiers. */
import { readFile, stat } from "node:fs/promises";
/* Importe les fonctions de gestion des chemins. */
import path from "node:path";
/* Importe la conversion d’une URL en chemin local. */
import { fileURLToPath } from "node:url";
/* Importe Chromium depuis Playwright. */
import { chromium } from "playwright";

/* Retrouve le dossier du fichier de test. */
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
/* Retrouve la racine du dépôt. */
const repositoryRoot = path.resolve(testDirectory, "..");
/* Définit les types MIME nécessaires à la séance. */
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"]
]);

/* Attend un nombre donné de millisecondes sans dépendre de l’objet Page. */
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/* Convertit une requête HTTP en chemin local sécurisé. */
function safeLocalPath(requestUrl) {
  /* Analyse l’adresse demandée. */
  const parsedUrl = new URL(requestUrl || "/", "http://127.0.0.1");
  /* Décode le chemin demandé. */
  const decodedPath = decodeURIComponent(parsedUrl.pathname);
  /* Ouvre la séance 1 lorsque la racine est demandée. */
  const requestedPath = decodedPath === "/" ? "/seance-1.html" : decodedPath;
  /* Construit le chemin absolu correspondant. */
  const candidatePath = path.resolve(repositoryRoot, `.${requestedPath}`);
  /* Interdit toute sortie du dépôt. */
  if (!candidatePath.startsWith(repositoryRoot)) throw new Error("Chemin interdit");
  /* Retourne le chemin validé. */
  return candidatePath;
}

/* Crée un serveur statique minimal. */
const server = http.createServer(async (request, response) => {
  /* Protège la lecture du fichier demandé. */
  try {
    /* Calcule le chemin local. */
    let localPath = safeLocalPath(request.url);
    /* Lit les informations du chemin. */
    const localStat = await stat(localPath);
    /* Ajoute index.html lorsqu’un dossier est demandé. */
    if (localStat.isDirectory()) localPath = path.join(localPath, "index.html");
    /* Lit le contenu du fichier. */
    const body = await readFile(localPath);
    /* Détermine le type MIME. */
    const contentType = mimeTypes.get(path.extname(localPath).toLowerCase()) || "application/octet-stream";
    /* Envoie une réponse sans cache. */
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    /* Termine la réponse. */
    response.end(body);
  } catch (error) {
    /* Envoie une erreur 404. */
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    /* Décrit l’erreur. */
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

/* Attend qu’un port libre soit attribué. */
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
/* Lit l’adresse du serveur. */
const address = server.address();
/* Vérifie que l’adresse est exploitable. */
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
/* Construit l’adresse de la séance. */
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;
/* Lance Chromium sans interface. */
const browser = await chromium.launch({ headless: true });

/* Définit les écrans à tester. */
const viewports = [
  /* Ordinateur portable courant. */
  { name: "ordinateur-1366x768", width: 1366, height: 768 },
  /* Tablette verticale. */
  { name: "tablette-768x1024", width: 768, height: 1024 },
  /* Téléphone courant. */
  { name: "telephone-412x915", width: 412, height: 915 }
];

/* Stocke les erreurs afin d’exécuter tous les scénarios. */
const failures = [];

/* Retourne le numéro humain de la ligne contenant le curseur. */
async function selectedLine(editor) {
  /* Compte les retours à la ligne avant selectionStart. */
  return editor.evaluate(element => element.value.slice(0, element.selectionStart).split("\n").length);
}

/* Clique au centre vertical d’une ligne donnée. */
async function clickLine(editor, lineNumber) {
  /* Calcule les coordonnées réellement appliquées par le navigateur. */
  const metrics = await editor.evaluate((element, requestedLine) => {
    /* Lit les styles du textarea. */
    const style = window.getComputedStyle(element);
    /* Convertit la hauteur de ligne. */
    const lineHeight = Number.parseFloat(style.lineHeight);
    /* Convertit la marge intérieure supérieure. */
    const paddingTop = Number.parseFloat(style.paddingTop);
    /* Convertit la marge intérieure gauche. */
    const paddingLeft = Number.parseFloat(style.paddingLeft);
    /* Calcule le centre absolu de la ligne. */
    const absoluteCenter = paddingTop + (requestedLine - 0.5) * lineHeight;
    /* Centre la ligne dans la fenêtre lorsque cela est possible. */
    element.scrollTop = Math.max(0, absoluteCenter - element.clientHeight * 0.45);
    /* Retourne les mesures utiles. */
    return { lineHeight, paddingTop, paddingLeft, scrollTop: element.scrollTop };
  }, lineNumber);
  /* Calcule la coordonnée verticale visible. */
  const clickY = metrics.paddingTop + (lineNumber - 0.5) * metrics.lineHeight - metrics.scrollTop;
  /* Calcule une coordonnée horizontale située dans le texte. */
  const clickX = metrics.paddingLeft + 70;
  /* Effectue un véritable clic de souris. */
  await editor.click({ position: { x: clickX, y: clickY } });
  /* Attend la fin des gestionnaires de clic. */
  await pause(70);
}

/* Teste chaque taille d’écran. */
for (const viewport of viewports) {
  /* Crée un contexte isolé. */
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  /* Efface les sauvegardes avant le chargement. */
  await context.addInitScript(() => localStorage.clear());
  /* Ouvre une page. */
  const page = await context.newPage();

  /* Protège le scénario pour poursuivre les autres écrans. */
  try {
    /* Charge la séance. */
    await page.goto(sessionUrl, { waitUntil: "networkidle" });
    /* Attend le bouton Mission. */
    await page.waitForSelector("#missionActivate");
    /* Active le mode Mission. */
    await page.click("#missionActivate");
    /* Attend le textarea déplacé dans le panneau Mission. */
    await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
    /* Récupère le textarea réel. */
    const editor = page.locator("#missionEditorMount #codeEditor");

    /* Passe en mode Standard pour tester le clic libre. */
    await page.selectOption("#missionHelpLevel", "standard");
    /* Attend le chargement du squelette Standard. */
    await page.waitForTimeout(160);
    /* Compte les lignes disponibles. */
    const lineCount = await editor.evaluate(element => element.value.split("\n").length);
    /* Définit des lignes de contrôle dont la ligne 11. */
    const freeLines = [3, 8, 11, Math.min(15, lineCount)].filter((line, index, array) => line <= lineCount && array.indexOf(line) === index);

    /* Vérifie chaque clic libre. */
    for (const requestedLine of freeLines) {
      /* Clique sur la ligne demandée. */
      await clickLine(editor, requestedLine);
      /* Lit la ligne réellement obtenue. */
      const actualLine = await selectedLine(editor);
      /* Signale tout décalage. */
      if (actualLine !== requestedLine) {
        throw new Error(`${viewport.name} : mode Standard, clic ${requestedLine}, curseur ${actualLine}`);
      }
    }

    /* Passe en mode Guidé pour tester le verrouillage. */
    await page.selectOption("#missionHelpLevel", "guided");
    /* Attend le squelette et le placement pédagogique. */
    await page.waitForTimeout(200);
    /* Calcule la ligne attendue grâce au validateur réel. */
    const targetLine = await page.evaluate(() => {
      /* Récupère l’éditeur. */
      const codeEditor = document.getElementById("codeEditor");
      /* Récupère le validateur Mission. */
      const missionValidator = window.TechnoQuestMissionValidator;
      /* Valide le programme. */
      const result = missionValidator.validate(codeEditor.value, 1);
      /* Récupère la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Retourne le numéro humain de la ligne cible. */
      return missionValidator.findLineForStep(codeEditor.value, stepId, result, 1, "edition") + 1;
    });
    /* Compte les lignes du squelette guidé. */
    const guidedLineCount = await editor.evaluate(element => element.value.split("\n").length);
    /* Choisit volontairement une autre ligne. */
    const attemptedLine = targetLine < guidedLineCount - 2 ? targetLine + 3 : Math.max(1, targetLine - 3);
    /* Clique sur la mauvaise ligne. */
    await clickLine(editor, attemptedLine);
    /* Lit la ligne conservée après le verrouillage. */
    const lockedLine = await selectedLine(editor);
    /* Vérifie le retour automatique sur la cible. */
    if (lockedLine !== targetLine) {
      throw new Error(`${viewport.name} : cible ${targetLine}, clic ${attemptedLine}, curseur ${lockedLine}`);
    }

    /* Saisit un marqueur sur la ligne verrouillée. */
    await page.keyboard.type("/*TEST_VERROU*/");
    /* Lit les lignes après la saisie. */
    const linesAfterTyping = await editor.inputValue().then(value => value.split("\n"));
    /* Vérifie la ligne réelle de la saisie. */
    if (!linesAfterTyping[targetLine - 1]?.includes("/*TEST_VERROU*/")) {
      throw new Error(`${viewport.name} : la saisie guidée a quitté la ligne ${targetLine}`);
    }

    /* Affiche un résumé de réussite. */
    console.log(`OK — ${viewport.name} : clic libre exact et ligne ${targetLine} verrouillée en mode Guidé`);
  } catch (error) {
    /* Ajoute l’erreur au rapport. */
    failures.push(`${viewport.name} — ${error.message}`);
    /* Enregistre une capture de diagnostic. */
    await page.screenshot({ path: `cursor-failure-${viewport.name}.png`, fullPage: true });
  } finally {
    /* Ferme le contexte testé. */
    await context.close();
  }
}

/* Ferme Chromium. */
await browser.close();
/* Ferme le serveur local. */
await new Promise(resolve => server.close(resolve));

/* Retourne un code d’échec lorsqu’une anomalie existe. */
if (failures.length) {
  /* Affiche toutes les erreurs. */
  console.error(`ÉCHEC DU TEST CURSEUR\n${failures.join("\n")}`);
  /* Signale l’échec à Codex ou à l’intégration continue. */
  process.exitCode = 1;
} else {
  /* Confirme la réussite des scénarios. */
  console.log("SUCCÈS — clic exact en mode libre et verrouillage de ligne en mode Guidé");
}
