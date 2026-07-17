/* Test navigateur autonome : précision verticale du clic dans l’éditeur Mission. */

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

/* Retrouve le dossier contenant ce fichier de test. */
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
/* Retrouve la racine du dépôt située un niveau au-dessus. */
const repositoryRoot = path.resolve(testDirectory, "..");
/* Définit les principaux types MIME nécessaires à la séance. */
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

/* Empêche toute sortie du dossier du dépôt lors d’une requête HTTP. */
function safeLocalPath(requestUrl) {
  /* Analyse l’adresse reçue par le serveur. */
  const parsedUrl = new URL(requestUrl || "/", "http://127.0.0.1");
  /* Décode le chemin demandé. */
  const decodedPath = decodeURIComponent(parsedUrl.pathname);
  /* Transforme la racine en page de séance pour simplifier le test. */
  const requestedPath = decodedPath === "/" ? "/seance-1.html" : decodedPath;
  /* Construit le chemin absolu correspondant. */
  const candidatePath = path.resolve(repositoryRoot, `.${requestedPath}`);
  /* Refuse les chemins situés hors du dépôt. */
  if (!candidatePath.startsWith(repositoryRoot)) throw new Error("Chemin interdit");
  /* Retourne le chemin validé. */
  return candidatePath;
}

/* Crée un petit serveur statique sans dépendance supplémentaire. */
const server = http.createServer(async (request, response) => {
  /* Protège le serveur contre les erreurs de lecture. */
  try {
    /* Calcule le fichier local demandé. */
    let localPath = safeLocalPath(request.url);
    /* Lit les informations du fichier ou du dossier. */
    const localStat = await stat(localPath);
    /* Ajoute index.html lorsqu’un dossier est demandé. */
    if (localStat.isDirectory()) localPath = path.join(localPath, "index.html");
    /* Lit le contenu binaire du fichier. */
    const body = await readFile(localPath);
    /* Détermine le type MIME à envoyer. */
    const contentType = mimeTypes.get(path.extname(localPath).toLowerCase()) || "application/octet-stream";
    /* Envoie un statut de réussite et désactive le cache. */
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    /* Envoie le fichier au navigateur. */
    response.end(body);
  } catch (error) {
    /* Envoie une réponse 404 en cas de fichier absent ou interdit. */
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    /* Décrit brièvement l’erreur dans la réponse. */
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

/* Attend que le serveur écoute sur un port libre. */
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
/* Récupère l’adresse choisie par le système. */
const address = server.address();
/* Vérifie que l’adresse est exploitable. */
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
/* Construit l’adresse complète de la séance. */
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;
/* Lance un navigateur Chromium sans interface. */
const browser = await chromium.launch({ headless: true });

/* Définit les écrans à contrôler. */
const viewports = [
  /* Représente un ordinateur portable courant. */
  { name: "ordinateur-1366x768", width: 1366, height: 768 },
  /* Représente une tablette en orientation portrait. */
  { name: "tablette-768x1024", width: 768, height: 1024 },
  /* Représente un téléphone de largeur moyenne. */
  { name: "telephone-412x915", width: 412, height: 915 }
];

/* Stocke les éventuelles erreurs afin de tester tous les écrans. */
const failures = [];

/* Teste successivement chaque taille d’écran. */
for (const viewport of viewports) {
  /* Crée un contexte isolé avec la taille demandée. */
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  /* Supprime les anciennes sauvegardes avant chaque chargement. */
  await context.addInitScript(() => localStorage.clear());
  /* Ouvre une nouvelle page. */
  const page = await context.newPage();

  /* Protège chaque scénario pour poursuivre les autres en cas d’échec. */
  try {
    /* Charge la séance sans utiliser le cache. */
    await page.goto(sessionUrl, { waitUntil: "networkidle" });
    /* Attend la création du bouton du mode Mission. */
    await page.waitForSelector("#missionActivate");
    /* Active le mode Mission. */
    await page.click("#missionActivate");
    /* Attend que l’éditeur soit visible dans son nouvel emplacement. */
    await page.waitForSelector("#missionEditorMount #codeEditor", { state: "visible" });
    /* Sélectionne explicitement le niveau Guidé. */
    await page.selectOption("#missionHelpLevel", "guided");
    /* Attend la remise en place du squelette guidé. */
    await page.waitForTimeout(120);
    /* Retrouve la zone de saisie réelle. */
    const editor = page.locator("#missionEditorMount #codeEditor");
    /* Place le défilement au début avant le premier contrôle. */
    await editor.evaluate(element => { element.scrollTop = 0; element.scrollLeft = 0; });

    /* Teste plusieurs lignes, dont la ligne 11 signalée par l’utilisateur. */
    for (const requestedLine of [3, 8, 11, 20]) {
      /* Calcule la position de la ligne dans le textarea. */
      const metrics = await editor.evaluate((element, lineNumber) => {
        /* Lit les propriétés réellement appliquées par le navigateur. */
        const style = window.getComputedStyle(element);
        /* Convertit la hauteur de ligne en nombre. */
        const lineHeight = Number.parseFloat(style.lineHeight);
        /* Convertit la marge intérieure supérieure en nombre. */
        const paddingTop = Number.parseFloat(style.paddingTop);
        /* Convertit la marge intérieure gauche en nombre. */
        const paddingLeft = Number.parseFloat(style.paddingLeft);
        /* Calcule la position verticale absolue du centre de la ligne. */
        const absoluteLineCenter = paddingTop + (lineNumber - 0.5) * lineHeight;
        /* Centre la ligne dans la fenêtre lorsque cela est nécessaire. */
        const desiredScrollTop = Math.max(0, absoluteLineCenter - element.clientHeight * 0.45);
        /* Applique le défilement calculé. */
        element.scrollTop = desiredScrollTop;
        /* Retourne les mesures nécessaires au clic Playwright. */
        return { lineHeight, paddingTop, paddingLeft, scrollTop: element.scrollTop };
      }, requestedLine);

      /* Calcule la coordonnée verticale visible du centre de la ligne. */
      const clickY = metrics.paddingTop + (requestedLine - 0.5) * metrics.lineHeight - metrics.scrollTop;
      /* Choisit une colonne proche du début du code sans viser le bord. */
      const clickX = metrics.paddingLeft + 70;
      /* Effectue un véritable clic de souris dans le textarea. */
      await editor.click({ position: { x: clickX, y: clickY } });
      /* Laisse le navigateur terminer le placement du point d’insertion. */
      await page.waitForTimeout(40);
      /* Détermine la ligne réellement sélectionnée par le navigateur. */
      const selectedLine = await editor.evaluate(element => element.value.slice(0, element.selectionStart).split("\n").length);
      /* Signale immédiatement un décalage vertical. */
      if (selectedLine !== requestedLine) {
        throw new Error(`${viewport.name} : clic ligne ${requestedLine}, curseur placé ligne ${selectedLine}`);
      }

      /* Crée un marqueur unique pour vérifier le lieu réel de la saisie. */
      const marker = `CURSEUR_TEST_${requestedLine}`;
      /* Saisit le marqueur comme le ferait l’utilisateur. */
      await page.keyboard.type(marker);
      /* Lit les lignes après la saisie. */
      const linesAfterTyping = await editor.inputValue().then(value => value.split("\n"));
      /* Vérifie que le marqueur se trouve bien sur la ligne demandée. */
      if (!linesAfterTyping[requestedLine - 1]?.includes(marker)) {
        throw new Error(`${viewport.name} : le texte destiné à la ligne ${requestedLine} a été écrit ailleurs`);
      }
      /* Annule la saisie pour conserver le squelette avant le test suivant. */
      await page.keyboard.press(process.platform === "darwin" ? "Meta+Z" : "Control+Z");
      /* Attend que l’annulation soit prise en compte. */
      await page.waitForTimeout(40);
    }

    /* Affiche une confirmation lisible dans le terminal. */
    console.log(`OK — ${viewport.name} : lignes 3, 8, 11 et 20 correctement ciblées`);
  } catch (error) {
    /* Ajoute le nom de l’écran et le message à la liste des échecs. */
    failures.push(`${viewport.name} — ${error.message}`);
    /* Enregistre une capture d’écran destinée au diagnostic Codex. */
    await page.screenshot({ path: `cursor-failure-${viewport.name}.png`, fullPage: true });
  } finally {
    /* Ferme le contexte pour libérer les ressources. */
    await context.close();
  }
}

/* Ferme le navigateur après tous les scénarios. */
await browser.close();
/* Ferme le serveur HTTP local. */
await new Promise(resolve => server.close(resolve));

/* Termine avec une erreur lorsqu’au moins un écran présente un décalage. */
if (failures.length) {
  /* Affiche toutes les erreurs dans un seul rapport. */
  console.error(`ÉCHEC DU TEST CURSEUR\n${failures.join("\n")}`);
  /* Retourne un code d’échec utilisable par Codex ou une intégration continue. */
  process.exitCode = 1;
} else {
  /* Confirme que tous les écrans ont réussi. */
  console.log("SUCCÈS — précision du clic et de la saisie validée sur les trois tailles d’écran");
}
