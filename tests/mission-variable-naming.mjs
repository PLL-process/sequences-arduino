/* Test Playwright — PÉDAGOGIE du NOMMAGE des variables (séance 1). */
/* Vérifie : le rappel protégé sur les identifiants, la fiche « Bien nommer une variable », */
/* les règles syntaxiques (espace/tiret/accent/chiffre/spécial/mot réservé), l'unicité des */
/* identifiants (redéclaration, écrasement), l'association variable↔capteur, la revalidation */
/* rétroactive et la conservation du code — sans erreur console. */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const mimeTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"]]);
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
const allConsoleErrors = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const sessionUrl = `http://127.0.0.1:${server.address().port}/seance-1.html`;

async function openPage() {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", e => consoleErrors.push(`pageerror: ${e.message}`));
  await context.addInitScript(() => localStorage.clear());
  await page.goto(sessionUrl, { waitUntil: "networkidle" });
  await pause(400);
  return { context, page, consoleErrors };
}

/* Construit un programme séance 1 avec un bloc de lectures donné. */
function program(readsBlock, showsBlock = "") {
  return `#include <Arduino.h>
const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
void setup() {
  Serial.begin(9600);
  pinMode(PIN_RELAIS_POMPE, OUTPUT);
  digitalWrite(PIN_RELAIS_POMPE, LOW);
}
void loop() {
${readsBlock}
${showsBlock}
  digitalWrite(PIN_RELAIS_POMPE, LOW);
  delay(1000);
}`;
}
/* Trois lectures avec des noms donnés. */
const reads = (h, l, w) => `  int ${h} = analogRead(PIN_HUMIDITE_SOL);\n  int ${l} = analogRead(PIN_LUMIERE);\n  int ${w} = analogRead(PIN_NIVEAU_EAU);`;

/* Évalue une étape du programme. */
async function stepOf(page, code, stepId) {
  return page.evaluate(([c, id]) => {
    const r = window.TechnoQuestMissionValidator.validate(c, 1);
    const s = r.steps.find(x => x.id === id);
    return { ok: s.ok, message: s.message, firstMissing: r.firstMissing?.id };
  }, [code, stepId]);
}

/* ===== A. RAPPEL SUR LES IDENTIFIANTS (visible, protégé, hors slots) ===== */
{
  const { context, page, consoleErrors } = await openPage();
  await page.click("#missionActivate");
  await pause(300);
  const s = await page.evaluate(() => {
    const V = window.TechnoQuestMissionValidator;
    const G = window.TechnoQuestGuidedGeometry;
    const sk = V.getSkeleton("guided", 1);
    const lines = sk.split("\n");
    const slots = G.editableSlots();
    const comments = G.protectedComments();
    const reminderRegexes = [/Une variable mémorise une valeur sous un nom/, /Utilise un identifiant différent pour chaque capteur/, /ni espace, ni tiret, ni accent/, /lettres, des chiffres et le caractère _/, /ne doit pas commencer par un chiffre/, /majuscules comptent/];
    const reminderIdx = reminderRegexes.map(re => lines.findIndex(l => re.test(l)));
    return {
      allVisible: reminderIdx.every(i => i >= 0),
      allProtected: reminderIdx.every(i => comments.includes(i)),
      noneInSlots: reminderIdx.every(i => !slots.includes(i)),
      hintHum: /par exemple humiditeSol/.test(sk), hintLight: /par exemple lumiere/.test(sk), hintWater: /par exemple niveauEau/.test(sk)
    };
  });
  check(s.allVisible, `1. le rappel sur les identifiants est visible (6 lignes)`);
  check(s.allProtected, `2. le rappel est protégé (commentaires non éditables)`);
  check(s.noneInSlots, `3. aucun commentaire de rappel n'est un emplacement éditable`);
  check(s.hintHum && s.hintLight && s.hintWater, `2b. les consignes de lecture proposent des exemples de noms`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== B. FICHE « Bien nommer une variable » (accessible souris + clavier) ===== */
{
  const { context, page, consoleErrors } = await openPage();
  await page.click("#missionActivate");
  await pause(300);
  const chip = page.locator(".mission-command-chip", { hasText: "Bien nommer une variable" });
  check(await chip.count() === 1, `4. la fiche « Bien nommer une variable » existe dans la palette`);
  /* Ouverture au CLAVIER (focus + Entrée). */
  await chip.focus();
  await page.keyboard.press("Enter");
  await pause(150);
  const card = await page.evaluate(() => {
    const c = document.querySelector(".mission-method-card");
    if (!c || c.hidden) return { open: false };
    return {
      open: true,
      valid: [...c.querySelectorAll(".mission-naming-valid code")].map(e => e.textContent),
      invalid: [...c.querySelectorAll(".mission-naming-invalid code")].map(e => e.textContent),
      focusOnClose: document.activeElement === c.querySelector(".mission-method-close"),
      editorVisible: !!document.querySelector("#codeEditor")
    };
  });
  check(card.open && card.editorVisible, `4b. la fiche s'ouvre au clavier sans masquer l'éditeur`);
  check(card.valid?.includes("humiditeSol") && card.valid?.includes("niveau_eau"), `4c. la fiche liste des identifiants VALIDES`);
  check(card.invalid?.includes("niveau eau") && card.invalid?.includes("2eCapteur"), `4d. la fiche liste des identifiants INVALIDES`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== C. RÈGLES SYNTAXIQUES DES IDENTIFIANTS ===== */
{
  const { context, page, consoleErrors } = await openPage();
  const water = name => program(`  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int lumiere = analogRead(PIN_LUMIERE);\n  int ${name} = analogRead(PIN_NIVEAU_EAU);`);
  check((await stepOf(page, program(reads("humiditeSol", "lumiere", "niveauEau")), "readWater")).ok, `5. humiditeSol accepté`);
  check((await stepOf(page, water("niveau_eau"), "readWater")).ok, `6. niveau_eau accepté`);
  check((await stepOf(page, water("eau"), "readWater")).ok, `7. eau accepté`);
  const space = await stepOf(page, water("niveau eau"), "readWater");
  check(!space.ok && /espace|caractère/i.test(space.message), `8. « niveau eau » refusé (espace)`);
  const tiret = await stepOf(page, water("niveau-eau"), "readWater");
  check(!tiret.ok && /tiret|caractère/i.test(tiret.message), `9. « niveau-eau » refusé (tiret)`);
  const accent = await stepOf(page, water("niveauÉau"), "readWater");
  check(!accent.ok && /accent|caractère/i.test(accent.message), `10. « niveauÉau » refusé (accent)`);
  const digit = await stepOf(page, water("2eCapteur"), "readWater");
  check(!digit.ok && /chiffre/i.test(digit.message), `11. « 2eCapteur » refusé (commence par un chiffre)`);
  const special = await stepOf(page, water("niveauEau!"), "readWater");
  check(!special.ok && /caractère|autorisé/i.test(special.message), `12. « niveauEau! » refusé (caractère spécial)`);
  const reserved = await stepOf(page, water("return"), "readWater");
  check(!reserved.ok && /réservé/i.test(reserved.message), `13. mot réservé C++ (« return ») refusé`);
  /* 14. Sensibilité à la casse : niveauEau et niveaueau sont distincts (aucune collision). */
  const distinctCase = await stepOf(page, reads("niveauEau", "lumiere", "niveaueau"), "readWater");
  check(distinctCase.ok, `14. niveauEau et niveaueau reconnus comme identifiants différents`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== D. UNICITÉ : redéclaration, écrasement, association ===== */
{
  const { context, page, consoleErrors } = await openPage();
  check((await stepOf(page, program(reads("humiditeSol", "lumiere", "niveauEau")), "readWater")).ok, `15. trois variables distinctes acceptées`);
  const dup = await stepOf(page, program("  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int lumiere = analogRead(PIN_LUMIERE);\n  int lumiere = analogRead(PIN_NIVEAU_EAU);"), "readWater");
  check(!dup.ok && /déjà déclarée|deux capteurs/i.test(dup.message), `16. même identifiant déclaré deux fois refusé`);
  const reassign = await stepOf(page, program("  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int lumiere = analogRead(PIN_LUMIERE);\n  lumiere = analogRead(PIN_NIVEAU_EAU);"), "readWater");
  check(!reassign.ok && /déjà déclarée|deux capteurs/i.test(reassign.message), `17. même variable réaffectée à un autre capteur refusée`);
  check((await stepOf(page, program(reads("humidite", "luminosite", "eau")), "readWater")).ok && (await stepOf(page, program(reads("mesureSol", "mesureLdr", "mesureReservoir")), "readWater")).ok, `18. trois noms libres distincts acceptés`);
  /* 19. bonne broche mais variable déjà liée à un autre capteur (eau réutilisée pour A2 après A1). */
  const boundElsewhere = await stepOf(page, program("  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int eau = analogRead(PIN_LUMIERE);\n  int eau = analogRead(PIN_NIVEAU_EAU);"), "readWater");
  check(!boundElsewhere.ok, `19. bonne broche mais variable déjà liée à un autre capteur refusée`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== E. CORRECTION, REVALIDATION RÉTROACTIVE, CODE CONSERVÉ ===== */
{
  const { context, page, consoleErrors } = await openPage();
  /* 20. Correction vers un nom valide → l'étape est validée. */
  check((await stepOf(page, program(reads("humiditeSol", "lumiere", "niveauEau")), "readWater")).ok, `20. correction vers niveauEau valide l'étape`);
  /* 21. Revalidation rétroactive : une lecture fautive AVANT des affichages corrects → firstMissing revient à cette lecture. */
  const retro = await stepOf(page, program("  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int lumiere = analogRead(PIN_LUMIERE);\n  int lumiere = analogRead(PIN_NIVEAU_EAU);", "  Serial.println(humiditeSol);\n  Serial.println(lumiere);"), "readWater");
  check(retro.firstMissing === "readWater", `21. la progression revient à la première lecture fautive (firstMissing=${retro.firstMissing})`);
  /* 22. Le code postérieur (affichages) reste présent dans le programme malgré la lecture fautive. */
  const withLater = program("  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int lumiere = analogRead(PIN_LUMIERE);\n  int lumiere = analogRead(PIN_NIVEAU_EAU);", "  Serial.println(humiditeSol);");
  check(/Serial\.println\(humiditeSol\)/.test(withLater), `22. le code postérieur est conservé (non effacé par la lecture fautive)`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== F. ASSOCIATION variable ↔ capteur pour les affichages ===== */
{
  const { context, page, consoleErrors } = await openPage();
  const base = "  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int mesureLdr = analogRead(PIN_LUMIERE);\n  int eau = analogRead(PIN_NIVEAU_EAU);";
  /* 23. Affichage avec un nom libre correctement relié (mesureLdr lié à A1) accepté. */
  check((await stepOf(page, program(base, "  Serial.println(mesureLdr);"), "showLight")).ok, `23. affichage d'un nom libre correctement relié accepté`);
  /* 24. Mauvaise liaison variable/capteur (afficher eau=A2 pour la lumière) refusée. */
  check(!(await stepOf(page, program(base, "  Serial.println(eau);"), "showLight")).ok, `24. mauvaise liaison variable/capteur refusée`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== G. MOTS RÉSERVÉS C++ ET IDENTIFIANTS ARDUINO (durcissement) ===== */
{
  const { context, page, consoleErrors } = await openPage();
  const waterName = name => program(`  int humiditeSol = analogRead(PIN_HUMIDITE_SOL);\n  int lumiere = analogRead(PIN_LUMIERE);\n  int ${name} = analogRead(PIN_NIVEAU_EAU);`);
  const rej = async (name, re, label) => { const r = await stepOf(page, waterName(name), "readWater"); check(!r.ok && re.test(r.message), label); };
  const acc = async (name, label) => { const r = await stepOf(page, waterName(name), "readWater"); check(r.ok, label); };
  /* Mots-clés C++ (message C++, nommé). */
  await rej("int", /mot réservé du langage C\+\+/, `G1. mot-clé « int » refusé`);
  await rej("for", /mot réservé du langage C\+\+/, `G2. contrôle « for » refusé`);
  await rej("class", /mot réservé du langage C\+\+/, `G3. « class » refusé`);
  await rej("constexpr", /mot réservé du langage C\+\+/, `G4. moderne « constexpr » refusé`);
  await rej("nullptr", /mot réservé du langage C\+\+/, `G5. moderne « nullptr » refusé`);
  await rej("static_assert", /mot réservé du langage C\+\+/, `G6. « static_assert » refusé`);
  await rej("and", /mot réservé du langage C\+\+/, `G7. opérateur alternatif « and » refusé`);
  await rej("not_eq", /mot réservé du langage C\+\+/, `G8. opérateur alternatif « not_eq » refusé`);
  /* Identifiants critiques Arduino (message dédié, distinct du C++). */
  await rej("setup", /fonction Arduino/, `G9. « setup » refusé (message Arduino)`);
  await rej("loop", /fonction Arduino/, `G10. « loop » refusé (message Arduino)`);
  await rej("Serial", /communication série/, `G11. « Serial » refusé (message Arduino)`);
  await rej("HIGH", /réservé par Arduino/, `G12. « HIGH » refusé (message Arduino)`);
  await rej("PIN_LUMIERE", /désigne déjà une broche/, `G13. « PIN_LUMIERE » refusé (message broche)`);
  /* Aucun faux positif par sous-chaîne + sensibilité à la casse. */
  await acc("format", `G14. « format » accepté (contient « for » mais n'est pas « for »)`);
  await acc("classer", `G15. « classer » accepté (contient « class »)`);
  await acc("returnValue", `G16. « returnValue » accepté (contient « return »)`);
  await acc("serialMesure", `G17. « serialMesure » accepté (Serial réservé, serialMesure non)`);
  await acc("For", `G18. sensibilité à la casse : « For » accepté alors que « for » est refusé`);
  await acc("newValue", `G19. aucun faux positif par sous-chaîne (« newValue » accepté)`);
  /* Intégrité des tableaux de mots réservés : aucun doublon, aucune intersection, forme correcte. */
  const lists = await page.evaluate(() => window.TechnoQuestMissionValidator.reservedWords);
  const noDup = arr => arr.length === new Set(arr).size;
  const shapeOk = arr => arr.every(w => /^[A-Za-z_][A-Za-z0-9_]*$/.test(w));
  const noOverlap = lists.cpp.every(w => !lists.arduino.includes(w));
  check(noDup(lists.cpp) && noDup(lists.arduino), `G20. les tableaux de mots réservés ne contiennent aucun doublon (C++=${lists.cpp.length}, Arduino=${lists.arduino.length})`);
  check(shapeOk(lists.cpp) && shapeOk(lists.arduino) && noOverlap, `G21. chaque entrée respecte la forme attendue et C++/Arduino sont disjoints`);
  allConsoleErrors.push(...consoleErrors);
  await context.close();
}

/* ===== 25. Zéro erreur console ===== */
check(allConsoleErrors.length === 0, `25. zéro erreur console (${JSON.stringify(allConsoleErrors)})`);

await browser.close();
await new Promise(resolve => server.close(resolve));

console.log(`\n===== RÉSUMÉ NOMMAGE DES VARIABLES =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — rappel protégé, fiche accessible, règles syntaxiques, unicité des identifiants et association variable↔capteur vérifiées.`);
}
