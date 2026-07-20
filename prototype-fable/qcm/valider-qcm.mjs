#!/usr/bin/env node
/* TechnoQuest — validateur automatisé COMMUN des données QCM (en plus de node --check).
   Usage : node prototype-fable/qcm/valider-qcm.mjs [--strict]
   Vérifie pour chaque séance :
   - exactement 20 questions ; identifiants sNq1 à sNq20, uniques et dans l'ordre ;
   - trois choix exactement ; answer ∈ {0,1,2} ; trois éléments dans whyOthers ;
   - chaîne vide dans whyOthers à l'index de la bonne réponse, justifications non vides ailleurs ;
   - explanation, exampleGarden, exampleOther, takeaway, theme non vides ;
   - absence de doublon exact de question (dans la séance et entre séances) ;
   - absence de HTML dans les données (< interdit hors comparaisons C++ « a < b ») ;
   - absence de syntaxe Python présentée comme programme (lire_*, arroser(, elif, if …:) ;
   - répartition équilibrée des index 0/1/2 (chacun entre 4 et 10 sur 20) ;
   - la bonne réponse n'est pas systématiquement la plus longue (≤ 40 % de « plus longue stricte ») ;
   - métriques de longueurs en fin de rapport (non bloquantes, revue humaine) ;
   - pas de formulation « toutes les réponses » / « aucune réponse » ;
   - apostrophe typographique ’ (aucune apostrophe droite ' dans les textes) ;
   - aucune notion introduite avant sa séance (table PREMATURE ci-dessous) ;
   - variété des objets techniques dans exampleOther (≥ 12 objets distincts par séance).
   Sortie : rapport tabulaire + code retour 0 (tout conforme) / 1 (violations). */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const windowStub = {};
globalThis.window = windowStub;
for (let n = 1; n <= 8; n++) {
  new Function("window", readFileSync(join(here, `qcm-data-s${n}.js`), "utf8"))(windowStub);
}
const data = windowStub.TechnoQuestQCM.data;

/* Notions dont l'usage est interdit AVANT leur séance d'introduction.
   (heuristique lexicale : toute alerte est revue à la main) */
const PREMATURE = [
  { terms: [/hyst[ée]r[ée]sis/i, /SEUIL_ARRET/, /demandeArrosage/, /seuil (bas|haut)/i], from: 5 },
  { terms: [/&&/, /op[ée]rateur logique/i, /SEUIL_RESERVOIR/, /marche [àa] vide/i, /R[ée]servoir vide/], from: 4 },
  { terms: [/SEUIL_LUMIERE/, /multicrit[èe]re/i], from: 6 },
  { terms: [/capacitif/i, /r[ée]sistif/i, /corrosion/i, /recalibr/i], from: 7 },
  { terms: [/\bif\b|\belse\b|condition/i, /\bseuil\b/i, /SEUIL_HUMIDITE/], from: 2 },
  { terms: [/digitalWrite\s*\(\s*PIN_RELAIS_POMPE\s*,\s*HIGH/i, /arrosage de trois secondes|delay\(3000\)/i], from: 3 }
];

const textFields = q => [q.question, ...q.choices, q.explanation, ...q.whyOthers, q.exampleGarden, q.exampleOther, q.takeaway, q.theme];

const rows = [];
const violations = [];
const allQuestions = new Map();

for (let n = 1; n <= 8; n++) {
  const v = message => violations.push(`S${n} — ${message}`);
  const d = data[n];
  if (!d) { v("données absentes"); continue; }
  const qs = d.questions || [];
  if (qs.length !== 20) v(`${qs.length} questions au lieu de 20`);

  const dist = [0, 0, 0];
  let longestBias = 0;
  const others = new Set();
  qs.forEach((q, i) => {
    const id = `s${n}q${i + 1}`;
    if (q.id !== id) v(`${q.id || "?"} : identifiant attendu ${id} (unicité + ordre)`);
    if (!Array.isArray(q.choices) || q.choices.length !== 3) v(`${id} : ${q.choices?.length} choix au lieu de 3`);
    if (![0, 1, 2].includes(q.answer)) v(`${id} : answer=${q.answer} hors {0,1,2}`);
    else dist[q.answer] += 1;
    if (!Array.isArray(q.whyOthers) || q.whyOthers.length !== 3) v(`${id} : whyOthers doit avoir 3 éléments`);
    else {
      if (q.whyOthers[q.answer] !== "") v(`${id} : whyOthers[${q.answer}] doit être la chaîne vide (bonne réponse)`);
      q.whyOthers.forEach((w, j) => { if (j !== q.answer && (!w || !w.trim())) v(`${id} : whyOthers[${j}] vide`); });
    }
    for (const [field, label] of [[q.explanation, "explanation"], [q.exampleGarden, "exampleGarden"], [q.exampleOther, "exampleOther"], [q.takeaway, "takeaway"], [q.theme, "theme"]]) {
      if (!field || !String(field).trim()) v(`${id} : ${label} vide`);
    }
    /* Doublons exacts (intra et inter séances). */
    const key = String(q.question).trim().toLowerCase();
    if (allQuestions.has(key)) v(`${id} : doublon exact de ${allQuestions.get(key)}`);
    else allQuestions.set(key, id);
    /* HTML interdit : les infobulles ne vivent PAS dans les données.
       (une vraie balise, pas une comparaison C++ « a < b » ni le jeton
       pédagogique « <!-- » cité comme mauvaise réponse) */
    textFields(q).forEach(t => {
      if (/<\/?[a-z][a-z0-9-]*(\s+[a-z-]+=|\s*\/?>)/i.test(String(t)) || /<(script|span|div|dfn|abbr)\b/i.test(String(t))) {
        v(`${id} : balise HTML interdite dans « ${String(t).slice(0, 40)}… »`);
      }
    });
    /* Python présenté comme programme (pas la prose française « if/else : »). */
    textFields(q).forEach(t => {
      if (/lire_(?:humidite|lumiere|reservoir)\s*\(|\barroser\s*\(\s*\d|\belif\b|\bif\s+[a-z_]+\s*[<>=!]=?\s*[^:\n]{1,24}:(?!=)/.test(String(t))) {
        v(`${id} : syntaxe Python détectée dans « ${String(t).slice(0, 50)}… »`);
      }
    });
    /* Formulations interdites. */
    textFields(q).slice(1, 4).forEach(t => {
      if (/toutes les r[ée]ponses|aucune r[ée]ponse|toutes les propositions/i.test(String(t))) {
        v(`${id} : formulation « toutes/aucune réponse » interdite`);
      }
    });
    /* Apostrophe typographique. */
    textFields(q).forEach(t => {
      if (/[a-zà-ÿA-Z]'[a-zà-ÿA-Z]/.test(String(t))) v(`${id} : apostrophe droite ' à remplacer par ’ dans « ${String(t).slice(0, 40)}… »`);
    });
    /* Notion prématurée. */
    PREMATURE.forEach(rule => {
      if (n >= rule.from) return;
      textFields(q).forEach(t => {
        rule.terms.forEach(re => { if (re.test(String(t))) v(`${id} : notion prématurée (${re}) — introduite en S${rule.from}`); });
      });
    });
    /* Biais de longueur. */
    if (Array.isArray(q.choices) && q.choices.length === 3) {
      const lengths = q.choices.map(c => String(c).length);
      if (lengths[q.answer] > Math.max(...lengths.filter((_, j) => j !== q.answer))) longestBias += 1;
    }
    others.add(String(q.exampleOther).slice(0, 34).toLowerCase());
  });

  const balanced = dist.every(count => count >= 4 && count <= 10);
  if (!balanced) v(`répartition des réponses déséquilibrée : ${dist.join("/")}`);
  const biasPct = Math.round(100 * longestBias / (qs.length || 1));
  if (biasPct > 40) v(`bonne réponse la plus longue dans ${biasPct}% des questions (max 40 %)`);
  if (others.size < 12) v(`exampleOther : seulement ${others.size} objets techniques distincts (min 12)`);

  /* ---- Métriques de longueurs (informatives, revue humaine) ---- */
  let sumCorrect = 0, sumDistract = 0, distractCount = 0, maxGap = 0, maxGapId = "";
  let distractLongest = 0, closeTrio = 0;
  const doubleFlags = [];
  qs.forEach((q, i) => {
    if (!Array.isArray(q.choices) || q.choices.length !== 3) return;
    const lengths = q.choices.map(c => String(c).length);
    sumCorrect += lengths[q.answer];
    lengths.forEach((len, j) => { if (j !== q.answer) { sumDistract += len; distractCount += 1; } });
    const gap = Math.max(...lengths) - Math.min(...lengths);
    if (gap > maxGap) { maxGap = gap; maxGapId = `s${n}q${i + 1}`; }
    const longestIndex = lengths.indexOf(Math.max(...lengths));
    if (longestIndex !== q.answer) distractLongest += 1;
    if (Math.max(...lengths) <= Math.min(...lengths) * 1.3) closeTrio += 1;
    if (Math.max(...lengths) >= 2 * Math.min(...lengths)) doubleFlags.push(`s${n}q${i + 1}`);
  });

  rows.push({
    seance: n,
    total: qs.length,
    essentiels: Math.min(10, qs.length),
    approfondissement: Math.max(0, qs.length - 10),
    dist: dist.join("/"),
    d0: dist[0], d1: dist[1], d2: dist[2],
    biasPct,
    avgCorrect: Math.round(sumCorrect / (qs.length || 1)),
    avgDistract: Math.round(sumDistract / (distractCount || 1)),
    maxGap, maxGapId, distractLongest, closeTrio, doubleFlags
  });
}

/* ---- Rapport tabulaire ---- */
const sessionViolations = n => violations.filter(m => m.startsWith(`S${n} `)).length;
console.log("Séance | 20 questions | essentiels 10 | approfondissement 10 | répartition 0/1/2 | bonne rép. la + longue | validation structurelle");
console.log("-------|--------------|---------------|----------------------|-------------------|------------------------|------------------------");
rows.forEach(r => {
  const okCount = r.total === 20 ? "oui (20)" : `NON (${r.total})`;
  const structural = sessionViolations(r.seance) === 0 ? "CONFORME" : `${sessionViolations(r.seance)} violation(s)`;
  console.log(`S${r.seance}     | ${okCount.padEnd(12)} | ${String(r.essentiels).padEnd(13)} | ${String(r.approfondissement).padEnd(20)} | ${r.dist.padEnd(17)} | ${String(r.biasPct + " %").padEnd(22)} | ${structural}`);
});

console.log("\nMétriques de longueurs (informatives — revue humaine, non bloquantes) :");
console.log("Séance | long. moy. bonne rép. | long. moy. distracteurs | plus grand écart | distracteur le + long | trois longueurs proches | choix ≥ 2× le plus court");
rows.forEach(r => {
  console.log(`S${r.seance}     | ${String(r.avgCorrect + " car.").padEnd(21)} | ${String(r.avgDistract + " car.").padEnd(23)} | ${String(r.maxGap + " car. (" + r.maxGapId + ")").padEnd(16)} | ${String(r.distractLongest + "/20").padEnd(21)} | ${String(r.closeTrio + "/20").padEnd(23)} | ${r.doubleFlags.length ? r.doubleFlags.join(" ") : "aucun"}`);
});
const allFlags = rows.flatMap(r => r.doubleFlags);
if (allFlags.length) console.log(`→ ${allFlags.length} question(s) à revue humaine (un choix ≈ 2× le plus court) : ${allFlags.join(", ")}`);

if (violations.length) {
  console.log(`\n${violations.length} violation(s) :`);
  violations.slice(0, 60).forEach(m => console.log("  ✗ " + m));
  if (violations.length > 60) console.log(`  … et ${violations.length - 60} de plus`);
  process.exit(1);
} else {
  console.log("\nVALIDATION STRUCTURELLE : 8 séances conformes, 160 questions, 0 violation.");
}
