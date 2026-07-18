/* LOT #1 — Test de CARACTÉRISATION de l'état actuel du mode Mission (séance 1). */
/* Ce test ne corrige rien : il mesure et documente précisément le comportement présent. */
/* Il PEUT signaler des défauts (c'est son but) ; il n'échoue durement que sur une panne d'infrastructure. */

/* Importe le serveur HTTP natif de Node.js. */
import http from "node:http";
/* Importe les fonctions de lecture du système de fichiers. */
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
/* Importe les fonctions de gestion des chemins. */
import path from "node:path";
/* Importe la conversion d'une URL en chemin local. */
import { fileURLToPath } from "node:url";
/* Importe Chromium depuis Playwright. */
import { chromium } from "playwright";

/* Retrouve le dossier du fichier de test. */
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
/* Retrouve la racine du dépôt. */
const repositoryRoot = path.resolve(testDirectory, "..");
/* Définit le dossier où déposer les captures et les relevés. */
const captureDirectory = path.join(testDirectory, "__captures__", "baseline");

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

/* Attend un nombre donné de millisecondes. */
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/* Convertit une requête HTTP en chemin local sécurisé. */
function safeLocalPath(requestUrl) {
  /* Analyse l'adresse demandée. */
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

/* Crée un serveur statique minimal servant le dépôt. */
const server = http.createServer(async (request, response) => {
  /* Protège la lecture du fichier demandé. */
  try {
    /* Calcule le chemin local. */
    let localPath = safeLocalPath(request.url);
    /* Lit les informations du chemin. */
    const localStat = await stat(localPath);
    /* Ajoute index.html lorsqu'un dossier est demandé. */
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
    /* Décrit l'erreur. */
    response.end(`Fichier introuvable : ${error.message}`);
  }
});

/* ---- Fonctions exécutées DANS le navigateur (sérialisées par Playwright). ---- */

/* Construit un programme guidé de séance 1 avec certaines étapes déjà remplies. */
/* Les index de ligne proviennent de mission-session1-guided-skeleton.js (état figé au LOT #1). */
function buildProgramInPage(filledSteps) {
  /* Récupère le squelette guidé réellement chargé. */
  const skeleton = window.TechnoQuestMissionValidator.getSkeleton("guided", 1);
  /* Découpe le squelette en lignes. */
  const lines = skeleton.split("\n");
  /* Relève d'éventuels écarts de structure pour diagnostic. */
  const structureNotes = [];
  /* Vérifie que les lignes cibles attendues sont bien vides. */
  [7, 9, 11].forEach(index => {
    /* Note toute ligne cible non vide. */
    if ((lines[index] || "").trim() !== "") structureNotes.push(`ligne ${index} non vide: "${lines[index]}"`);
  });
  /* Remplit l'inclusion sur la ligne 0 (qui est le commentaire cible de l'étape include). */
  if (filledSteps.includes("include")) lines[0] = "#include <Arduino.h>";
  /* Remplit Serial.begin sur la ligne 7. */
  if (filledSteps.includes("serialBegin")) lines[7] = "  Serial.begin(9600);";
  /* Remplit pinMode sur la ligne 9. */
  if (filledSteps.includes("pinMode")) lines[9] = "  pinMode(PIN_RELAIS_POMPE, OUTPUT);";
  /* Remplit l'état sûr sur la ligne 11. */
  if (filledSteps.includes("safeLowSetup")) lines[11] = "  digitalWrite(PIN_RELAIS_POMPE, LOW);";
  /* Retourne le programme et les notes de structure. */
  return { program: lines.join("\n"), structureNotes };
}

/* Applique une valeur au textarea et déclenche la chaîne de rendu de l'application. */
function applyProgramInPage(program) {
  /* Récupère l'éditeur réel. */
  const editor = document.getElementById("codeEditor");
  /* Écrit la valeur demandée. */
  editor.value = program;
  /* Déclenche l'événement input écouté par tous les modules Mission. */
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Mesure l'état complet de l'éditeur guidé à un instant donné. */
function measureStateInPage() {
  /* Récupère les éléments clés. */
  const editor = document.getElementById("codeEditor");
  const shell = document.getElementById("missionCodeShell");
  const arrow = document.getElementById("missionArrow");
  const lineNumbers = document.getElementById("missionLineNumbers");
  const validator = window.TechnoQuestMissionValidator;
  /* Récupère le cadre jaune s'il existe. */
  const frame = shell ? shell.querySelector(".mission-target-line") : null;
  /* Récupère l'étiquette du cadre. */
  const labelElement = frame ? frame.querySelector(".mission-target-line-label") : null;

  /* Valide le programme courant. */
  const result = validator.validate(editor.value, 1);
  /* Lit la première étape manquante. */
  const stepId = result.firstMissing ? result.firstMissing.id : null;
  /* Lit l'intitulé de la première instruction manquante. */
  const stepLabel = result.firstMissing ? result.firstMissing.label : null;
  /* Calcule la ligne cible via le validateur (chemin réel de l'application). */
  const targetLine = stepId ? validator.findLineForStep(editor.value, stepId, result, 1, "edition") : null;

  /* Lit les métriques typographiques. */
  const style = window.getComputedStyle(editor);
  /* Convertit la hauteur de ligne (valeur utilisée par les modules). */
  const lineHeight = parseFloat(style.lineHeight) || 0;
  /* Convertit la marge intérieure haute. */
  const paddingTop = parseFloat(style.paddingTop) || 0;

  /* Découpe le code en lignes. */
  const lines = editor.value.split("\n");
  /* Lit le point d'insertion. */
  const selectionStart = editor.selectionStart;
  /* Calcule la ligne (0-based) contenant le curseur. */
  const caretLine = editor.value.slice(0, selectionStart).split("\n").length - 1;

  /* Recherche la ligne de commentaire pédagogique associée à la cible. */
  let commentLine = targetLine;
  /* Ne cherche que si une cible existe. */
  if (targetLine !== null) {
    /* Si la cible elle-même est un commentaire (cas include), on la garde. */
    if ((lines[targetLine] || "").trim().startsWith("//")) {
      commentLine = targetLine;
    } else {
      /* Sinon remonte vers le premier commentaire au-dessus de la cible. */
      for (let index = targetLine - 1; index >= 0; index -= 1) {
        /* Retient un commentaire et poursuit pour prendre le plus haut d'un bloc. */
        if ((lines[index] || "").trim().startsWith("//")) { commentLine = index; continue; }
        /* Traverse une ligne vide sans arrêter. */
        if ((lines[index] || "").trim() === "") continue;
        /* S'arrête sur toute autre ligne de code. */
        break;
      }
    }
  }

  /* Lit les rectangles utiles. */
  const editorRect = editor.getBoundingClientRect();
  /* Calcule le haut théorique (formule des modules) de la ligne de code cible. */
  const codeLineTop = targetLine === null ? null : editorRect.top + paddingTop + targetLine * lineHeight - editor.scrollTop;
  /* Calcule le haut théorique de la ligne de commentaire. */
  const commentLineTop = commentLine === null ? null : editorRect.top + paddingTop + commentLine * lineHeight - editor.scrollTop;
  /* Convertit un DOMRect en objet transférable. */
  const rectOf = element => {
    /* Retourne null sans élément. */
    if (!element) return null;
    /* Lit le rectangle. */
    const r = element.getBoundingClientRect();
    /* Retourne les champs utiles arrondis. */
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) };
  };

  /* Calcule les lignes visibles (entièrement) dans la fenêtre de l'éditeur. */
  const firstVisibleLine = lineHeight ? Math.ceil((editor.scrollTop - paddingTop) / lineHeight) : null;
  /* Calcule la dernière ligne entièrement visible. */
  const lastVisibleLine = lineHeight ? Math.floor((editor.scrollTop + editor.clientHeight - paddingTop) / lineHeight) - 1 : null;

  /* Relève les classes des numéros autour de la cible. */
  const numberClasses = {};
  /* Ne relève que si les numéros existent. */
  if (lineNumbers && targetLine !== null) {
    /* Parcourt de la ligne au-dessus jusqu'à trois lignes après. */
    for (let index = Math.max(0, targetLine - 1); index <= targetLine + 3; index += 1) {
      /* Récupère l'élément du numéro. */
      const element = lineNumbers.children[index];
      /* Enregistre sa classe lorsqu'il existe. */
      if (element) numberClasses[index] = element.className || "";
    }
  }

  /* Retourne l'ensemble des mesures. */
  return {
    /* Étape active / première instruction manquante. */
    activeStep: stepId,
    firstMissingInstruction: stepLabel,
    /* Curseur. */
    selectionStart,
    caretLineIndex: caretLine,
    caretLineHuman: caretLine + 1,
    /* Cible. */
    targetLineIndex: targetLine,
    targetLineHuman: targetLine === null ? null : targetLine + 1,
    commentLineIndex: commentLine,
    /* Défilement. */
    scrollTop: Math.round(editor.scrollTop),
    clientHeight: Math.round(editor.clientHeight),
    scrollHeight: Math.round(editor.scrollHeight),
    /* Typographie. */
    lineHeight,
    paddingTop,
    /* Lignes visibles. */
    firstVisibleLine,
    lastVisibleLine,
    followingVisibleCount: (lastVisibleLine !== null && targetLine !== null) ? Math.max(0, lastVisibleLine - targetLine) : null,
    /* Géométrie réelle. */
    frameRect: (frame && !frame.hidden) ? rectOf(frame) : null,
    frameHidden: frame ? Boolean(frame.hidden) : "absent",
    arrowRect: (arrow && !arrow.classList.contains("mission-arrow-complete")) ? rectOf(arrow) : null,
    arrowComplete: arrow ? arrow.classList.contains("mission-arrow-complete") : "absent",
    arrowTopStyle: arrow ? arrow.style.top : null,
    /* Repères calculés. */
    codeLineTop: codeLineTop === null ? null : Math.round(codeLineTop),
    commentLineTop: commentLineTop === null ? null : Math.round(commentLineTop),
    /* Étiquette. */
    labelText: labelElement ? labelElement.textContent : null,
    /* Classes des numéros. */
    numberClasses
  };
}

/* Calcule, à partir d'une mesure, les écarts par rapport au comportement IDÉAL attendu. */
/* Ces écarts ne sont pas des erreurs de test : ils documentent les bugs présents. */
function evaluateDefects(measure) {
  /* Prépare la liste des constats. */
  const defects = [];
  /* Ignore l'analyse lorsqu'aucune cible n'est active. */
  if (measure.targetLineIndex === null) return defects;

  /* B4/curseur : le point d'insertion doit être sur la ligne de code cible. */
  if (measure.caretLineIndex !== measure.targetLineIndex) {
    /* Note le décalage curseur / cible. */
    defects.push(`curseur ligne ${measure.caretLineHuman} ≠ cible ligne ${measure.targetLineHuman}`);
  }

  /* B2 : le cadre doit exister et englober le commentaire ET la ligne de code. */
  if (!measure.frameRect) {
    /* Note l'absence de cadre visible. */
    defects.push("cadre jaune absent ou masqué");
  } else {
    /* Calcule le haut attendu (commentaire) et le bas attendu (ligne de code). */
    const expectedTop = measure.commentLineTop;
    const expectedBottom = (measure.codeLineTop === null ? null : measure.codeLineTop + measure.lineHeight);
    /* Vérifie que le haut du cadre atteint le commentaire (tolérance 4 px). */
    if (expectedTop !== null && measure.frameRect.top > expectedTop + 4) {
      /* Note un cadre qui n'englobe pas le commentaire. */
      defects.push(`cadre haut=${measure.frameRect.top} n'englobe pas le commentaire (attendu ≈ ${expectedTop})`);
    }
    /* Vérifie que le bas du cadre couvre la ligne de code (tolérance 4 px). */
    if (expectedBottom !== null && measure.frameRect.bottom < expectedBottom - 4) {
      /* Note un cadre trop court. */
      defects.push(`cadre bas=${measure.frameRect.bottom} ne couvre pas la ligne de code (attendu ≥ ${Math.round(expectedBottom)})`);
    }
    /* Mesure une hauteur d'une seule ligne (symptôme B2). */
    if (measure.lineHeight && measure.frameRect.height <= measure.lineHeight + 4) {
      /* Note un cadre limité à une ligne. */
      defects.push(`cadre d'une seule ligne (hauteur=${measure.frameRect.height} ≈ lineHeight=${measure.lineHeight})`);
    }
  }

  /* B1/B3 : la flèche doit être centrée sur la ligne de code cible. */
  if (measure.arrowRect && measure.codeLineTop !== null && measure.lineHeight) {
    /* Calcule le centre attendu de la ligne. */
    const expectedCenter = measure.codeLineTop + measure.lineHeight / 2;
    /* Calcule le centre réel de la flèche. */
    const arrowCenter = measure.arrowRect.top + measure.arrowRect.height / 2;
    /* Note un désalignement supérieur à une demi-ligne. */
    if (Math.abs(arrowCenter - expectedCenter) > measure.lineHeight / 2) {
      /* Consigne l'écart flèche / ligne. */
      defects.push(`flèche centre=${Math.round(arrowCenter)} désaligné de la ligne (attendu ≈ ${Math.round(expectedCenter)})`);
    }
  }

  /* Étiquette : « Écrire ici · ligne X » doit désigner la ligne de code cible. */
  if (measure.labelText && !measure.labelText.includes(String(measure.targetLineHuman))) {
    /* Consigne une étiquette incohérente. */
    defects.push(`étiquette "${measure.labelText}" ≠ ligne cible ${measure.targetLineHuman}`);
  }

  /* Contexte : au moins trois lignes suivantes doivent être visibles. */
  if (measure.followingVisibleCount !== null && measure.followingVisibleCount < 3) {
    /* Consigne un contexte insuffisant. */
    defects.push(`seulement ${measure.followingVisibleCount} ligne(s) suivante(s) visibles (attendu ≥ 3)`);
  }

  /* Retourne les constats. */
  return defects;
}

/* ---- Orchestration côté Node.js. ---- */

/* Attend qu'un port libre soit attribué. */
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
/* Lit l'adresse du serveur. */
const address = server.address();
/* Vérifie que l'adresse est exploitable. */
if (!address || typeof address === "string") throw new Error("Adresse locale indisponible");
/* Construit l'adresse de la séance. */
const sessionUrl = `http://127.0.0.1:${address.port}/seance-1.html`;

/* Prépare le dossier de captures. */
await mkdir(captureDirectory, { recursive: true });

/* Définit les deux écrans imposés. */
const viewports = [
  /* Écran de bureau standard. */
  { name: "1920x1080", width: 1920, height: 1080 },
  /* Écran de portable de classe. */
  { name: "1366x768", width: 1366, height: 768 }
];

/* Définit les scénarios de caractérisation. */
const scenarios = [
  /* 1. Ouverture sans sauvegarde. */
  { id: "01-ouverture-sans-sauvegarde", mode: "guided", fill: [] },
  /* 2. Après validation de #include <Arduino.h>. */
  { id: "02-apres-include", mode: "guided", fill: ["include"] },
  /* 3. Après validation de Serial.begin(9600);. */
  { id: "03-apres-serialBegin", mode: "guided", fill: ["include", "serialBegin"] },
  /* 4. Reprise depuis une sauvegarde partielle. */
  { id: "04-reprise-sauvegarde-partielle", mode: "guided", fill: [], seedPartial: true },
  /* 5. Étape « Garder la pompe arrêtée au démarrage ». */
  { id: "05-etape-pompe-arretee", mode: "guided", fill: ["include", "serialBegin", "pinMode"] },
  /* 6. Tentative de remontée et de correction d'une ligne révélée. */
  { id: "06-remontee-correction", mode: "guided", fill: ["include", "serialBegin"], scrollBack: true },
  /* 7. Zoom à 200 %. */
  { id: "07-zoom-200", mode: "guided", fill: ["include"], zoom: true },
  /* 8a. Mode Guidé (référence). */
  { id: "08a-mode-guided", mode: "guided", fill: [] },
  /* 8b. Mode Standard. */
  { id: "08b-mode-standard", mode: "standard", fill: [] },
  /* 8c. Mode Autonome (valeur interne « expert »). */
  { id: "08c-mode-autonome", mode: "expert", fill: [] }
];

/* Lance Chromium sans interface. */
const browser = await chromium.launch({ headless: true });
/* Prépare le rapport global. */
const report = { generatedAt: new Date().toISOString(), sessionUrl, records: [] };
/* Collecte les pannes d'infrastructure (seules à faire échouer le test). */
const infraErrors = [];

/* Parcourt chaque écran. */
for (const viewport of viewports) {
  /* Parcourt chaque scénario. */
  for (const scenario of scenarios) {
    /* Construit un contexte isolé à la bonne taille. */
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    /* Prépare l'état localStorage avant chargement selon le scénario. */
    if (scenario.seedPartial) {
      /* Injecte une sauvegarde partielle non destructive (structure v4 pour éviter l'effacement par la migration). */
      await context.addInitScript(() => {
        /* Construit un programme partiel (include + Serial.begin déjà écrits). */
        const partial = [
          "#include <Arduino.h>",
          "const int PIN_HUMIDITE_SOL = A0;",
          "const int PIN_LUMIERE = A1;",
          "const int PIN_NIVEAU_EAU = A2;",
          "const int PIN_RELAIS_POMPE = 6;",
          "void setup() {",
          "  // Initialiser le Moniteur Série à 9600 bauds.",
          "  Serial.begin(9600);",
          "  // Configurer D6 en sortie pour commander le relais.",
          "",
          "  // Garder la pompe arrêtée au démarrage pour la sécurité.",
          "",
          "} // Fin de setup().",
          "",
          "void loop() {",
          "} // Fin de loop()."
        ].join("\n");
        /* Écrit la sauvegarde dans la clé du contrôleur. */
        localStorage.setItem("technoquest-mission-v1", JSON.stringify({
          /* Marque la structure comme déjà migrée pour préserver le code. */
          structureVersions: { session1: "session-1-progressive-guided-v4" },
          /* Décrit la séance 1 reprise. */
          sessions: { 1: { modeMission: true, helpMode: "guided", activeStep: "pinMode", badges: {}, values: {}, reflection: "", code: partial, attempted: true } }
        }));
      });
    } else {
      /* Efface toute sauvegarde avant le chargement. */
      await context.addInitScript(() => localStorage.clear());
    }

    /* Ouvre une page. */
    const page = await context.newPage();
    /* Collecte les messages de console. */
    const consoleErrors = [];
    /* Collecte les avertissements de console. */
    const consoleWarnings = [];
    /* Écoute la console en conservant l'emplacement (fichier:ligne:colonne). */
    page.on("console", message => {
      /* Ne retient que les erreurs et avertissements. */
      if (message.type() !== "error" && message.type() !== "warning") return;
      /* Lit l'emplacement de l'entrée. */
      const location = message.location();
      /* Compose une entrée traçable. */
      const entry = `${message.text()} @ ${location.url}:${location.lineNumber}:${location.columnNumber}`;
      /* Range selon le type. */
      if (message.type() === "error") consoleErrors.push(entry); else consoleWarnings.push(entry);
    });
    /* Écoute les exceptions non capturées côté JavaScript. */
    page.on("pageerror", error => consoleErrors.push(`pageerror: ${error.message}`));
    /* Prépare la collecte des exceptions localisées (utile quand la pile JS est vide). */
    const locatedExceptions = [];
    /* Ouvre une session CDP pour obtenir l'emplacement exact des exceptions. */
    const cdp = await context.newCDPSession(page);
    /* Active le domaine d'exécution. */
    await cdp.send("Runtime.enable");
    /* Enregistre chaque exception avec son fichier, sa ligne et sa colonne. */
    cdp.on("Runtime.exceptionThrown", event => {
      /* Récupère les détails de l'exception. */
      const details = event.exceptionDetails;
      /* Préfère la description complète (type + message) lorsqu'elle existe. */
      const message = (details.exception && details.exception.description)
        ? details.exception.description.split("\n")[0]
        : details.text;
      /* Consigne l'exception localisée (lignes/colonnes converties en 1-based). */
      locatedExceptions.push({ message, url: details.url, line: (details.lineNumber || 0) + 1, column: (details.columnNumber || 0) + 1 });
    });

    /* Protège chaque scénario pour poursuivre les autres. */
    try {
      /* Charge la séance. */
      await page.goto(sessionUrl, { waitUntil: "networkidle" });
      /* Laisse une éventuelle auto-activation (sauvegarde modeMission) se produire. */
      await pause(300);
      /* Cible l'éditeur monté dans le panneau Mission. */
      const missionEditor = page.locator("#missionEditorMount #codeEditor");
      /* Vérifie si le mode Mission est déjà actif (cas reprise sauvegarde). */
      const alreadyActive = await missionEditor.isVisible().catch(() => false);
      /* Active manuellement seulement lorsque ce n'est pas déjà fait. */
      if (!alreadyActive) {
        /* Attend le bouton visible. */
        await page.waitForSelector("#missionActivate", { state: "visible" });
        /* Active le mode Mission. */
        await page.click("#missionActivate");
      }
      /* Attend l'éditeur déplacé dans le panneau Mission. */
      await missionEditor.waitFor({ state: "visible", timeout: 15000 });
      /* Attend la disponibilité du calcul de cible centralisé. */
      await page.waitForFunction(() => Boolean(window.TechnoQuestMissionGuidedTarget && window.TechnoQuestMissionValidator));

      /* Sélectionne le niveau demandé. */
      await page.selectOption("#missionHelpLevel", scenario.mode);
      /* Laisse le squelette du niveau se charger. */
      await pause(220);

      /* Applique un programme partiel lorsque le scénario le demande (hors reprise localStorage). */
      let structureNotes = [];
      /* Ne remplit que si des étapes sont listées. */
      if (scenario.fill && scenario.fill.length) {
        /* Construit puis applique le programme dans la page. */
        structureNotes = await page.evaluate(({ fn1, fn2, filled }) => {
          /* Reconstruit la fonction de construction depuis sa source. */
          const build = new Function(`return (${fn1})`)();
          /* Reconstruit la fonction d'application depuis sa source. */
          const apply = new Function(`return (${fn2})`)();
          /* Construit le programme. */
          const built = build(filled);
          /* Applique le programme. */
          apply(built.program);
          /* Retourne les notes de structure. */
          return built.structureNotes;
        }, { fn1: buildProgramInPage.toString(), fn2: applyProgramInPage.toString(), filled: scenario.fill });
      }

      /* Applique un zoom à 200 % lorsque le scénario l'exige (modèle CSS zoom de Chromium). */
      if (scenario.zoom) {
        /* Applique le zoom sur la racine du document. */
        await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
      }

      /* Effectue une tentative de remontée et de correction lorsque demandé. */
      let scrollBackResult = null;
      /* Ne teste la remontée que sur les scénarios concernés. */
      if (scenario.scrollBack) {
        /* Cible une ligne révélée antérieure (ligne 7 = Serial.begin déjà écrit). */
        scrollBackResult = await page.evaluate(() => {
          /* Récupère l'éditeur. */
          const editor = document.getElementById("codeEditor");
          /* Découpe le code. */
          const lines = editor.value.split("\n");
          /* Calcule le décalage caractère du début de la ligne 7. */
          let offset = 0;
          /* Additionne les longueurs des lignes précédentes. */
          for (let index = 0; index < 7; index += 1) offset += lines[index].length + 1;
          /* Positionne le curseur en fin de ligne 7. */
          const desired = offset + lines[7].length;
          /* Applique la sélection sur la ligne révélée. */
          editor.focus();
          /* Déplace le point d'insertion. */
          editor.setSelectionRange(desired, desired);
          /* Notifie un changement de sélection. */
          document.dispatchEvent(new Event("selectionchange"));
          /* Retourne la ligne demandée. */
          return { requestedLine: 7 };
        });
        /* Laisse les gestionnaires de verrouillage s'exécuter. */
        await pause(120);
        /* Tente une frappe sur la ligne révélée. */
        await page.keyboard.type(" ");
        /* Laisse l'application réagir. */
        await pause(120);
        /* Relit où la frappe a réellement atterri. */
        scrollBackResult = await page.evaluate(previous => {
          /* Récupère l'éditeur. */
          const editor = document.getElementById("codeEditor");
          /* Calcule la ligne finale du curseur. */
          const caretLine = editor.value.slice(0, editor.selectionStart).split("\n").length - 1;
          /* Retourne le constat de remontée. */
          return {
            /* Ligne visée par l'élève (0-based). */
            requestedLineIndex: 6,
            /* Ligne réellement obtenue après verrouillage éventuel. */
            resultingCaretLineIndex: caretLine,
            /* Indique si la correction sur une ligne révélée a été possible. */
            editAllowedOnRevealedLine: caretLine === 6 || caretLine === 7
          };
        }, scrollBackResult);
      }

      /* Laisse la géométrie se stabiliser au-delà du re-alignement de 460 ms. */
      await pause(700);

      /* Amène l'éditeur Mission dans la fenêtre pour des coordonnées et des captures exploitables. */
      await page.locator("#missionCodeShell").scrollIntoViewIfNeeded().catch(() => {});
      /* Laisse le défilement de page se poser. */
      await pause(120);

      /* Mesure l'état final. */
      const measure = await page.evaluate(fn => {
        /* Reconstruit la fonction de mesure depuis sa source. */
        const run = new Function(`return (${fn})`)();
        /* Exécute la mesure. */
        return run();
      }, measureStateInPage.toString());

      /* Évalue les écarts au comportement idéal (documente les bugs). */
      const defects = await page.evaluate(({ fn, m }) => {
        /* Reconstruit la fonction d'évaluation. */
        const run = new Function(`return (${fn})`)();
        /* Exécute l'évaluation. */
        return run(m);
      }, { fn: evaluateDefects.toString(), m: measure });

      /* Construit le nom de capture. */
      const captureName = `${scenario.id}__${scenario.mode}__${viewport.name}.png`;
      /* Enregistre la capture pleine page (preuve visuelle complète). */
      await page.screenshot({ path: path.join(captureDirectory, captureName), fullPage: true });

      /* Ajoute l'enregistrement au rapport. */
      report.records.push({
        scenario: scenario.id,
        mode: scenario.mode,
        viewport: viewport.name,
        capture: captureName,
        structureNotes,
        scrollBack: scrollBackResult,
        consoleErrors,
        consoleWarnings,
        locatedExceptions,
        measure,
        defects
      });

      /* Affiche une ligne de synthèse. */
      console.log(`OK relevé — ${scenario.id} · ${scenario.mode} · ${viewport.name} · étape=${measure.activeStep} · cible=${measure.targetLineHuman} · défauts=${defects.length}`);
    } catch (error) {
      /* Enregistre une panne d'infrastructure. */
      infraErrors.push(`${scenario.id} · ${viewport.name} — ${error.message}`);
      /* Tente une capture de diagnostic. */
      try { await page.screenshot({ path: path.join(captureDirectory, `ERREUR-${scenario.id}__${viewport.name}.png`), fullPage: false }); } catch {}
      /* Trace l'erreur. */
      console.error(`ÉCHEC INFRA — ${scenario.id} · ${viewport.name} : ${error.message}`);
    } finally {
      /* Ferme le contexte. */
      await context.close();
    }
  }
}

/* Ferme Chromium. */
await browser.close();
/* Ferme le serveur local. */
await new Promise(resolve => server.close(resolve));

/* Écrit le relevé JSON complet. */
await writeFile(path.join(captureDirectory, "measures.json"), JSON.stringify(report, null, 2), "utf-8");

/* Agrège les défauts documentés. */
const totalDefects = report.records.reduce((sum, record) => sum + record.defects.length, 0);
/* Agrège les erreurs console. */
const totalConsoleErrors = report.records.reduce((sum, record) => sum + record.consoleErrors.length, 0);

/* Affiche un récapitulatif lisible. */
console.log("\n===== CARACTÉRISATION (LOT #1) — RÉSUMÉ =====");
/* Parcourt les enregistrements pour lister les défauts. */
for (const record of report.records) {
  /* N'affiche que les scénarios présentant des constats. */
  if (record.defects.length || record.consoleErrors.length) {
    /* Affiche l'en-tête du scénario. */
    console.log(`\n• ${record.scenario} · ${record.mode} · ${record.viewport}`);
    /* Affiche chaque défaut. */
    record.defects.forEach(defect => console.log(`   - défaut : ${defect}`));
    /* Affiche chaque erreur console. */
    record.consoleErrors.forEach(error => console.log(`   - console : ${error}`));
  }
}
/* Agrège les exceptions localisées uniques (fichier:ligne). */
const uniqueExceptions = new Map();
/* Parcourt tous les relevés. */
for (const record of report.records) {
  /* Parcourt les exceptions localisées du relevé. */
  for (const exception of (record.locatedExceptions || [])) {
    /* Construit une clé fichier:ligne lisible. */
    const shortUrl = String(exception.url || "").split("/").slice(-2).join("/").split("?")[0];
    /* Compose la clé unique. */
    const key = `${exception.message} @ ${shortUrl}:${exception.line}:${exception.column}`;
    /* Incrémente le compteur. */
    uniqueExceptions.set(key, (uniqueExceptions.get(key) || 0) + 1);
  }
}
/* Affiche les exceptions localisées uniques. */
if (uniqueExceptions.size) {
  /* Titre de section. */
  console.log("\n----- Exceptions JavaScript localisées (uniques) -----");
  /* Détaille chaque exception. */
  for (const [key, count] of uniqueExceptions) console.log(`   ×${count} — ${key}`);
}

/* Affiche les totaux. */
console.log(`\nRelevés : ${report.records.length} · défauts documentés : ${totalDefects} · erreurs console : ${totalConsoleErrors}`);
/* Indique l'emplacement des preuves. */
console.log(`Preuves : ${path.relative(repositoryRoot, captureDirectory)} (captures + measures.json)`);

/* Ne fait échouer le test QUE sur une panne d'infrastructure (les défauts sont attendus). */
if (infraErrors.length) {
  /* Affiche les pannes. */
  console.error(`\nPANNES D'INFRASTRUCTURE (${infraErrors.length}) :\n${infraErrors.join("\n")}`);
  /* Signale l'échec réel. */
  process.exitCode = 1;
} else {
  /* Confirme que la caractérisation s'est déroulée. */
  console.log("\nCaractérisation terminée sans panne d'infrastructure.");
}
