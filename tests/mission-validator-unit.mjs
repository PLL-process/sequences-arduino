/* Tests PURS (sans navigateur) de la validation contextuelle Arduino de la séance 1. */
/* Chargent directement le validateur en Node (module.exports) pour un diagnostic rapide. */
/* Couvre les 20 cas demandés au niveau du validateur : fonction, variable, contexte, messages. */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = require(path.join(repositoryRoot, "mission-mode", "mission-validator.js"));

/* Programme de référence complet et correct. */
const REFERENCE = validator.getReferenceCode(1);

/* Journalise et comptabilise les échecs. */
const failures = [];
function check(condition, description) {
  if (condition) { console.log(`OK  — ${description}`); return; }
  failures.push(description);
  console.log(`ÉCHEC— ${description}`);
}

/* Valide un programme et retourne un résumé exploitable. */
function run(code) {
  const result = validator.validate(code, 1);
  const ok = {};
  const messages = {};
  result.steps.forEach(step => { ok[step.id] = step.ok; messages[step.id] = step.message; });
  return { ok, messages, allOk: result.allOk, first: result.firstMissing?.id || null, errors: result.errors };
}

/* Remplace la première occurrence d'un fragment. */
function replaceOnce(code, from, to) {
  const index = code.indexOf(from);
  if (index < 0) throw new Error(`Fragment introuvable pour le test : ${from}`);
  return code.slice(0, index) + to + code.slice(index + from.length);
}

/* 1. Programme correct complet. */
{
  const r = run(REFERENCE);
  check(r.allOk === true && r.first === null, "1. programme correct complet → tout validé");
}

/* 2. Serial.begin seulement dans loop(). */
{
  let code = replaceOnce(REFERENCE, "  Serial.begin(9600);\n", "");
  code = replaceOnce(code, "void loop() {\n", "void loop() {\n  Serial.begin(9600);\n");
  const r = run(code);
  check(r.ok.serialBegin === false && /doit être placé dans setup/.test(r.messages.serialBegin), "2. Serial.begin dans loop() → refusé + message setup()");
}

/* 3. pinMode seulement dans loop(). */
{
  let code = replaceOnce(REFERENCE, "  pinMode(PIN_RELAIS_POMPE, OUTPUT);\n", "");
  code = replaceOnce(code, "void loop() {\n", "void loop() {\n  pinMode(PIN_RELAIS_POMPE, OUTPUT);\n");
  const r = run(code);
  check(r.ok.pinMode === false && /doit être placé dans setup/.test(r.messages.pinMode), "3. pinMode dans loop() → refusé + message setup()");
}

/* 4. safeLowSetup seulement dans loop() (aucun LOW dans setup, un LOW dans loop). */
{
  /* Retire le LOW de setup() (celui qui précède l'accolade fermante de setup). */
  const code = replaceOnce(REFERENCE, "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n}", "}");
  const r = run(code);
  check(r.ok.safeLowSetup === false, "4. safeLowSetup absent de setup() → refusé");
  check(r.ok.pumpStop === true, "4. pumpStop (LOW dans loop) reste validé");
  check(/setup\(\)/.test(r.messages.safeLowSetup), "4. message safeLowSetup invite à le placer dans setup()");
}

/* 5. pumpStop seulement dans setup() (un LOW dans setup, aucun dans loop). */
{
  const code = replaceOnce(REFERENCE, "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n  delay(1000);", "  delay(1000);");
  const r = run(code);
  check(r.ok.pumpStop === false && /manque son arrêt dans loop/.test(r.messages.pumpStop), "5. pumpStop absent de loop() → refusé + message loop()");
  check(r.ok.safeLowSetup === true, "5. safeLowSetup (LOW dans setup) reste validé");
}

/* 6. Un seul digitalWrite LOW, dans setup() → safeLowSetup oui, pumpStop non. */
{
  const code = replaceOnce(REFERENCE, "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n  delay(1000);", "  delay(1000);");
  const r = run(code);
  check(r.ok.safeLowSetup === true && r.ok.pumpStop === false, "6. un seul LOW (setup) → safeLowSetup OK, pumpStop refusé");
}

/* 7. Deux digitalWrite LOW, un dans chaque fonction → les deux étapes validées. */
{
  const r = run(REFERENCE);
  check(r.ok.safeLowSetup === true && r.ok.pumpStop === true, "7. un LOW dans chaque fonction → safeLowSetup ET pumpStop validés");
}

/* 8. Mauvaise broche pour pinMode. */
{
  const code = replaceOnce(REFERENCE, "pinMode(PIN_RELAIS_POMPE, OUTPUT);", "pinMode(PIN_HUMIDITE_SOL, OUTPUT);");
  const r = run(code);
  check(r.ok.pinMode === false && /broche du relais/.test(r.messages.pinMode), "8. pinMode mauvaise broche → refusé + message broche relais");
}

/* 9. INPUT au lieu de OUTPUT. */
{
  const code = replaceOnce(REFERENCE, "pinMode(PIN_RELAIS_POMPE, OUTPUT);", "pinMode(PIN_RELAIS_POMPE, INPUT);");
  const r = run(code);
  check(r.ok.pinMode === false && /INPUT|OUTPUT/.test(r.messages.pinMode), "9. pinMode INPUT → refusé + message OUTPUT");
}

/* 10. Lecture du mauvais capteur (A1 remplacé par une seconde lecture A0). */
{
  const code = replaceOnce(REFERENCE, "int lumiere = analogRead(PIN_LUMIERE);", "int lumiere = analogRead(PIN_HUMIDITE_SOL);");
  const r = run(code);
  check(r.ok.readLight === false, "10. lecture du mauvais capteur (A0 au lieu de A1) → readLight refusé");
  check(r.ok.readHumidity === true, "10. readHumidity reste validé");
}

/* 11. showSoil (humidité) avec une mauvaise variable — plusieurs capteurs affichés → message NEUTRE. */
{
  const code = replaceOnce(REFERENCE, "Serial.println(humidite);", "Serial.println(lumiere);");
  const r = run(code);
  check(r.ok.showHumidity === false && /ne correspond pas à la mesure attendue/.test(r.messages.showHumidity), "11. mauvaise variable (ambigu) à l'étape humidité → refusé + message NEUTRE");
  check(!/lumière|humidité|niveau d'eau/.test(r.messages.showHumidity), "11. le message neutre ne nomme aucun capteur (jamais faux)");
}

/* 11b. Un SEUL capteur affiché et c'est le mauvais → identification CERTAINE (message nommé). */
{
  /* Conserve uniquement l'affichage de la lumière (retire humidité et niveau d'eau). */
  let code = replaceOnce(REFERENCE, "  Serial.print(\"Humidité : \");\n  Serial.println(humidite);\n", "");
  code = replaceOnce(code, "  Serial.print(\"Niveau d'eau : \");\n  Serial.println(niveauEau);\n", "");
  const r = run(code);
  check(r.ok.showHumidity === false && /la lumière à l'étape consacrée à l'humidité du sol/.test(r.messages.showHumidity), "11b. un seul capteur affiché (lumière) à l'étape humidité → message nommé CERTAIN");
}

/* 12. showLight avec une mauvaise variable — ambigu → message NEUTRE. */
{
  const code = replaceOnce(REFERENCE, "Serial.println(lumiere);", "Serial.println(niveauEau);");
  const r = run(code);
  check(r.ok.showLight === false && /ne correspond pas à la mesure attendue/.test(r.messages.showLight), "12. mauvaise variable (ambigu) à l'étape lumière → refusé + message NEUTRE");
}

/* 13. showWater avec une mauvaise variable — ambigu → message NEUTRE. */
{
  const code = replaceOnce(REFERENCE, "Serial.println(niveauEau);", "Serial.println(humidite);");
  const r = run(code);
  check(r.ok.showWater === false && /ne correspond pas à la mesure attendue/.test(r.messages.showWater), "13. mauvaise variable (ambigu) à l'étape eau → refusé + message NEUTRE");
}

/* 14. Instruction uniquement commentée. */
{
  const code = replaceOnce(REFERENCE, "  Serial.begin(9600);", "  // Serial.begin(9600);");
  const r = run(code);
  check(r.ok.serialBegin === false && /commentaire ou une chaîne/.test(r.messages.serialBegin), "14. Serial.begin commenté → refusé + message commentaire");
}

/* 15. Instruction présente uniquement dans une chaîne de caractères. */
{
  const code = replaceOnce(REFERENCE, "  Serial.begin(9600);", '  Serial.println("Serial.begin(9600);");');
  const r = run(code);
  check(r.ok.serialBegin === false && /commentaire ou une chaîne/.test(r.messages.serialBegin), "15. Serial.begin dans une chaîne → refusé + message chaîne");
}

/* 16. Espaces et retours à la ligne inhabituels mais valides. */
{
  let code = replaceOnce(REFERENCE, "  Serial.begin(9600);", "  Serial . begin (  9600  ) ;");
  code = replaceOnce(code, "  pinMode(PIN_RELAIS_POMPE, OUTPUT);", "  pinMode(\n    PIN_RELAIS_POMPE,\n    OUTPUT\n  );");
  const r = run(code);
  check(r.ok.serialBegin === true && r.ok.pinMode === true, "16. espaces/retours à la ligne inhabituels mais valides → acceptés");
}

/* 17. Commentaires ajoutés par l'élève. */
{
  let code = replaceOnce(REFERENCE, "void loop() {", "void loop() { // ma boucle principale");
  code = replaceOnce(code, "  delay(1000);", "  // j'attends une seconde\n  delay(1000);");
  const r = run(code);
  check(r.allOk === true, "17. commentaires ajoutés par l'élève → programme toujours valide");
}

/* 18. Accolades imbriquées dans if/else. */
{
  const code = replaceOnce(
    REFERENCE,
    "  digitalWrite(PIN_RELAIS_POMPE, LOW);\n  delay(1000);\n}",
    "  if (niveauEau < 100) {\n    digitalWrite(PIN_RELAIS_POMPE, LOW);\n  } else {\n    digitalWrite(PIN_RELAIS_POMPE, LOW);\n  }\n  delay(1000);\n}"
  );
  const r = run(code);
  check(r.ok.pumpStop === true && r.ok.delay === true && r.allOk === true, "18. accolades imbriquées if/else dans loop() → détection correcte");
}

/* 19. Programme incomplet (loop tronquée, non refermée). */
{
  const code = REFERENCE.slice(0, REFERENCE.indexOf("void loop() {") + "void loop() {\n  int humidite = analogRead(PIN_HUMIDITE_SOL);".length);
  let threw = false;
  let r;
  try { r = run(code); } catch (e) { threw = true; }
  check(!threw, "19. programme incomplet → aucune exception (analyse robuste)");
  check(r && r.allOk === false, "19. programme incomplet → non validé");
}

/* 20. Robustesse : aucune exception sur des entrées limites. */
{
  let threw = false;
  try {
    validator.validate("", 1);
    validator.validate("void setup(){} void loop(){", 1);
    validator.validate("/* commentaire non fermé", 1);
    validator.validate('char c = \'{\'; void setup(){} void loop(){}', 1);
  } catch (e) { threw = true; }
  check(!threw, "20. entrées limites (vide, non fermées, littéral accolade) → aucune exception");
}

console.log(`\n===== RÉSUMÉ VALIDATEUR (UNITAIRE) =====`);
if (failures.length) {
  console.error(`\nÉCHECS (${failures.length}) :\n${failures.map(f => " - " + f).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`\nSUCCÈS — validation contextuelle (fonction, variable, contexte, messages) vérifiée sur 20 cas.`);
}
