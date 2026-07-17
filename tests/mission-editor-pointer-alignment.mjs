/* Test navigateur autonome : précision du clic et verrouillage pédagogique de la ligne guidée. */

/* Importe le serveur HTTP natif de Node.js. */
import http from "node:http";
/* Importe les fonctions de lecture de fichiers. */
import { readFile, stat } from "node:fs/promises";
/* Importe les fonctions de gestion des chemins. */
import path from "node:path";
/* Importe la conversion d’URL vers un chemin local. */
import { fileURLToPath } from "node:url";
/* Importe Chromium depuis Playwright. */
import { chromium } from "playwright";

/* Retrouve le dossier contenant ce fichier. */
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
/* Retrouve la racine du dépôt. */
const repositoryRoot = path.resolve(testDirectory, "..");
/* Associe les extensions principales à leur type MIME. */
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

/* Convertit une requête HTTP en chemin local sécurisé. */
function safeLocalPath(requestUrl) {
  /* Analyse l’adresse demandée. */
  const parsedUrl = new URL(requestUrl || "/", "http://127.0.0.1");
  /* Décode le chemin de l’adresse. */
  const decodedPath = decodeURIComponent(parsedUrl.pathname);
  /* Ouvre la séance 1 lorsque la racine est demandée. */
  const requestedPath = decodedPath === "/" ? "/seance-1.html" : decodedPath;
  /* Construit le chemin absolu. */
  const candidatePath = path.resolve(repositoryRoot, `.${requestedPath}`);
  /* Interdit toute sortie du dépôt. */
  if (!candidatePath.startsWith(repositoryRoot)) throw new Error("Chemin interdit");
  /* Retourne le chemin validé. */
  return candidatePath;
}

/* Crée un serveur statique sans dépendance externe. */
const server = http.createServer(async (request, response) => {
  /* Protège la lecture de chaque fichier. */
  try {
    /* Calcule le fichier demandé. */
    let localPath = safeLocalPath(request.url);
    /* Lit les informations du chemin. */
    const localStat = await stat(localPath);
    /* Ajoute index.html lorsqu’un dossier est demandé. */
    if (localStat.isDirectory()) localPath = path.join(localPath, "index.html");
    /* Lit le contenu du fichier. */
    const body = await readFile(localPath);
    /* Détermine le type MIME à envoyer. */
    const contentType = mimeTypes.get(path.extname(localPath).toLowerCase()) || "application/octet-stream";
    /* Envoie la réponse sans cache. */
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    /* Termine la réponse avec le contenu. */
    response.end(body);
  } catch (error) {
    /* Envoie un statut 404 en cas d’échec. */
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    /* Décrit l’échec. */
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

/* Attend qu’un port libre soit attribué au serveur. */
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
/* Lit l’adresse attribuée. */
const address = server.address();
/* Vérifie le format de l’adresse. */
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
/* Construit l’adresse de la séance. */
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;
/* Lance Chromium sans interface graphique. */
const browser = await chromium.launch({ headless: true });

/* Définit les trois tailles d’écran contrôlées. */
const viewports = [
  /* Représente un ordinateur portable courant. */
  { name: "ordinateur-1366x768", width: 1366, height: 768 },
  /* Représente une tablette verticale. */
  { name: "tablette-768x1024", width: 768, height: 1024 },
  /* Représente un téléphone courant. */
  { name: "telephone-412x915", width: 412, height: 915 }
];

/* Stocke tous les échecs rencontrés. */
const failures = [];

/* Retourne la ligne correspondant au point d’insertion. */
async function selectedLine(editor) {
  /* Compte les lignes placées avant selectionStart. */
  return editor.evaluate(element => element.value.slice(0, element.selectionStart).split("\n").length);
}

/* Clique au centre vertical d’une ligne donnée. */
async function clickLine(editor, lineNumber) {
  /* Calcule le défilement et les coordonnées de la ligne. */
  const metrics = await editor.evaluate((element, requestedLine) => {
    /* Lit les styles réellement appliqués. */
    const style = window.getComputedStyle(element);
    /* Convertit la hauteur de ligne. */
    const lineHeight = Number.parseFloat(style.lineHeight);
    /* Convertit la marge intérieure supérieure. */
    const paddingTop = Number.parseFloat(style.paddingTop);
    /* Convertit la marge intérieure gauche. */
    const paddingLeft = Number.parseFloat(style.paddingLeft);
    /* Calcule le centre absolu de la ligne. */
    const absoluteLineCenter = paddingTop + (requestedLine - 0.5) * lineHeight;
    /* Centre la ligne dans la fenêtre de l’éditeur. */
    element.scrollTop = Math.max(0, absoluteLineCenter - element.clientHeight * 0.45);
    /* Retourne les mesures nécessaires. */
    return { lineHeight, paddingTop, paddingLeft, scrollTop: element.scrollTop };
  }, lineNumber);
  /* Calcule la coordonnée verticale visible. */
  const clickY = metrics.paddingTop + (lineNumber - 0.5) * metrics.lineHeight - metrics.scrollTop;
  /* Calcule une coordonnée horizontale située dans le texte. */
  const clickX = metrics.paddingLeft + 70;
  /* Effectue le véritable clic de souris. */
  await editor.click({ position: { x: clickX, y: clickY } });
  /* Attend la fin des gestionnaires de clic. */
  await editor.page().waitForTimeout(60);
}

/* Teste chaque taille d’écran séparément. */
for (const viewport of viewports) {
  /* Crée un contexte isolé avec la taille demandée. */
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  /* Supprime toute ancienne sauvegarde avant le chargement. */
  await context.addInitScript(() => localStorage.clear());
  /* Ouvre une nouvelle page. */
  const page = await context.newPage();

  /* Poursuit les autres écrans même si celui-ci échoue. */
  try {
    /* Charge la séance. */
    await page.goto(sessionUrl, { waitUntil: "networkidle" });
    /* Attend la création du bouton Mission. */
    await page.waitForSelector("#missionActivate");
    /* Active le mode Mission. */
    await page.click("#missionActivate");
    /* Attend l’éditeur déplacé dans le panneau Mission. */
    await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
    /* Récupère le textarea réel. */
    const editor = page.locator("#missionEditorMount #codeEditor");

    /* Passe en mode Standard pour contrôler le placement libre du clic. */
    await page.selectOption("#missionHelpLevel", "standard");
    /* Attend le nouveau squelette. */
    await page.waitForTimeout(150);
    /* Compte les lignes disponibles. */
    const standardLineCount = await editor.evaluate(element => element.value.split("\n").length);
    /* Définit plusieurs lignes valides, dont la ligne 11 signalée. */
    const freeLines = [3, 8, 11, Math.min(15, standardLineCount)].filter((line, index, array) => line <= standardLineCount && array.indexOf(line) === index);

    /* Vérifie que le clic libre vise exactement chaque ligne. */
    for (const requestedLine of freeLines) {
      /* Clique sur la ligne demandée. */
      await clickLine(editor, requestedLine);
      /* Lit la ligne réellement sélectionnée. */
      const actualLine = await selectedLine(editor);
      /* Signale tout décalage vertical. */
      if (actualLine !== requestedLine) {
        throw new Error(`${viewport.name} : mode Standard, clic ligne ${requestedLine}, curseur ligne ${actualLine}`);
      }
    }

    /* Passe en mode Guidé pour contrôler le verrouillage pédagogique. */
    await page.selectOption("#missionHelpLevel", "guided");
    /* Attend le nouveau squelette et son premier placement. */
    await page.waitForTimeout(180);
    /* Demande au validateur la ligne actuellement attendue. */
    const targetLine = await page.evaluate(() => {
      /* Récupère l’éditeur. */
      const codeEditor = document.getElementById("codeEditor");
      /* Récupère le validateur Mission. */
      const missionValidator = window.TechnoQuestMissionValidator;
      /* Valide le programme actuel. */
      const result = missionValidator.validate(codeEditor.value, 1);
      /* Récupère la première étape manquante. */
      const stepId = result.firstMissing?.id || null;
      /* Calcule la ligne attendue et convertit l’index en numéro humain. */
      return missionValidator.findLineForStep(codeEditor.value, stepId, result, 1, "edition") + 1;
    });
    /* Compte les lignes du squelette guidé. */
    const guidedLineCount = await editor.evaluate(element => element.value.split("\n").length);
    /* Choisit volontairement une autre ligne visible. */
    const attemptedLine = targetLine < guidedLineCount - 2 ? targetLine + 3 : Math.max(1, targetLine - 3);
    /* Clique sur cette autre ligne. */
    await clickLine(editor, attemptedLine);
    /* Lit la ligne finalement conservée par le verrouillage. */
    const lockedLine = await selectedLine(editor);
    /* Vérifie que le curseur est revenu sur la ligne attendue. */
    if (lockedLine !== targetLine) {
      throw new Error(`${viewport.name} : mode Guidé, cible ${targetLine}, clic ${attemptedLine}, curseur ${lockedLine}`);
    }

    /* Saisit un marqueur simple sur la ligne verrouillée. */
    const marker = "/*TEST_VERROU*/";
    /* Écrit le marqueur avec le clavier. */
    await page.keyboard.type(marker);
    /* Lit les lignes après la saisie. */
    const linesAfterTyping = await editor.inputValue().then(value => value.split("\n"));
    /* Vérifie que la saisie est restée sur la ligne attendue. */
    if (!linesAfterTyping[targetLine - 1]?.includes(marker)) {
      throw new Error(`${viewport.name} : la saisie guidée a quitté la ligne ${targetLine}`);
    }

    /* Vérifie que la flèche verticale reste associée à cette ligne incomplète. */
    const arrowLabel = await page.locator("#missionArrow").getAttribute("aria-label");
    /* Signale un repère incohérent. */
    if (arrowLabel && !arrowLabel.includes(String(targetLine))) {
      throw new Error(`${viewport.name} : flèche annoncée « ${arrowLabel} », cible attendue ${targetLine}`);
    }

    /* Affiche un résumé de réussite pour l’écran testé. */
    console.log(`OK — ${viewport.name} : clic libre exact et verrouillage guidé sur la ligne ${targetLine}`);
  } catch (error) {
    /* Ajoute l’erreur au rapport final. */
    failures.push(`${viewport.name} — ${error.message}`);
    /* Enregistre une capture pour faciliter le diagnostic. */
    await page.screenshot({ path: `cursor-failure-${viewport.name}.png`, fullPage: true });
  } finally {
    /* Ferme le contexte de cet écran. */
    await context.close();
  }
}

/* Ferme Chromium. */
await browser.close();
/* Ferme le serveur local. */
await new Promise(resolve => server.close(resolve));

/* Retourne un code d’échec lorsque des anomalies ont été rencontrées. */
if (failures.length) {
  /* Affiche le rapport complet. */
  console.error(`ÉCHEC DU TEST CURSEUR\n${failures.join("\n")}`);
  /* Signale l’échec au terminal, à Codex ou à l’intégration continue. */
  process.exitCode = 1;
} else {
  /* Confirme la réussite de tous les scénarios. */
  console.log("SUCCÈS — clic exact en mode libre et verrouillage de la ligne en mode Guidé");
}
