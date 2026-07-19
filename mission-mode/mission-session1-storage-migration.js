/* TechnoQuest — migration TRANSACTIONNELLE et NON DESTRUCTIVE de la séance 1 (squelette v5). */
/* Règle d'or : l'état actif n'est modifié QU'APRÈS avoir écrit ET RELU une sauvegarde valide. */
/* En cas d'échec (QuotaExceededError, setItem impossible, relecture incohérente) : rien n'est */
/* modifié, aucune migration partielle n'est marquée, l'ancien état est conservé à l'identique, */
/* un avertissement non bloquant est posé, et l'on ne boucle pas (une seule tentative par chargement). */
"use strict";

(() => {
  /* Clé principale du mode Mission. */
  const STORAGE_KEY = "technoquest-mission-v1";
  /* Clé des sauvegardes de récupération. */
  const BACKUP_KEY = "technoquest-mission-v1-backups";
  /* Version de structure : v6 introduit les libellés Serial.print("…") préremplis et protégés */
  /* au-dessus de chaque ligne de réponse Serial.println(variable); des trois affichages. */
  const MIGRATION_VERSION = "session-1-guided-print-labels-v6";
  /* Nombre maximal de sauvegardes conservées par séance. */
  const MAX_BACKUPS = 3;
  /* Séance concernée par cette migration. */
  const SESSION_ID = 1;

  /* Dépendances (validateur + analyse structurelle). */
  const validator = window.TechnoQuestMissionValidator;
  const analysisApi = window.TechnoQuestMissionArduinoAnalysis;

  /* Lecture JSON prudente. */
  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || fallback); } catch { try { return JSON.parse(fallback); } catch { return null; } }
  }
  /* Écriture JSON qui laisse remonter une éventuelle QuotaExceededError. */
  function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  /* Charge la liste des sauvegardes. */
  function loadBackups() { const b = readJson(BACKUP_KEY, "[]"); return Array.isArray(b) ? b : []; }

  /* Déduplique (même code ET même version d'origine) et limite le nombre de sauvegardes, */
  /* sans jamais supprimer la dernière sauvegarde encore NON résolue. */
  function dedupeAndCap(backups) {
    /* Déduplication en conservant la plus récente d'un couple (code, fromVersion). */
    const seen = new Map();
    backups.forEach(b => { seen.set(`${b.fromVersion}::${b.code}`, b); });
    let list = [...seen.values()];
    /* Limite au maximum autorisé (garde les plus récentes). */
    if (list.length > MAX_BACKUPS) {
      const kept = list.slice(-MAX_BACKUPS);
      /* Garantit la survie d'au moins une sauvegarde non résolue si elle existait. */
      const hadUnresolved = list.some(b => b.resolved === false);
      if (hadUnresolved && !kept.some(b => b.resolved === false)) {
        const lastUnresolved = [...list].reverse().find(b => b.resolved === false);
        kept[0] = lastUnresolved;
      }
      list = kept;
    }
    return list;
  }

  /* Identifiant unique de sauvegarde (contexte navigateur : Date/Math disponibles). */
  function makeId() { return `bkp-${Date.now()}-${Math.floor(Math.random() * 1e9)}`; }

  /* Résout une référence de sauvegarde : index numérique, identifiant (id) ou, à défaut, */
  /* la dernière sauvegarde non résolue (sinon la plus récente). Aucune mutation. */
  function resolveRef(backups, ref) {
    if (typeof ref === "number") return backups[ref] || null;
    if (typeof ref === "string") return backups.find(b => b.id === ref) || null;
    return [...backups].reverse().find(b => b.resolved === false) || backups[backups.length - 1] || null;
  }

  /* ---- API de récupération, TOUJOURS exposée (même sans migration) ---- */
  /* Responsabilités STRICTEMENT séparées : la simple consultation ne touche jamais l'état actif. */
  window.TechnoQuestMissionRecovery = {
    /* Liste toutes les sauvegardes (plus récente en dernier). */
    list() { return loadBackups(); },
    /* Retourne la dernière sauvegarde NON résolue (ou null). */
    latestUnresolved() { return [...loadBackups()].reverse().find(b => b.resolved === false) || null; },
    /* LECTURE SEULE — retourne le code d'une sauvegarde. Aucune mutation d'aucun état. */
    getBackupCode(ref) { const b = resolveRef(loadBackups(), ref); return b ? b.code : ""; },
    /* COPIE UNIQUEMENT — écrit le code de la sauvegarde dans le presse-papiers. Aucune mutation */
    /* d'état pédagogique. Retourne une promesse (résolue si la copie a réussi). */
    copyBackup(ref) {
      const code = this.getBackupCode(ref);
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(code);
      return Promise.reject(new Error("Presse-papiers indisponible"));
    },
    /* RÉSOLUTION UNIQUEMENT — marque une notification comme traitée. Ne supprime jamais la */
    /* sauvegarde ni ne touche au code actif. */
    markResolved(ref) {
      const backups = loadBackups();
      const target = resolveRef(backups, ref);
      if (!target) return false;
      target.resolved = true;
      try { writeJson(BACKUP_KEY, backups); return true; } catch { return false; }
    },
    /* RESTAURATION RÉELLE (optionnelle) — remplace l'état actif par l'ancien code, avec copie de */
    /* sécurité préalable de la version en cours. N'est JAMAIS appelée par la simple consultation. */
    restoreToActiveState(ref) {
      const backups = loadBackups();
      const chosen = resolveRef(backups, ref);
      if (!chosen || typeof chosen.code !== "string") return { ok: false };
      const store = readJson(STORAGE_KEY, "{}") || {};
      store.sessions = store.sessions || {};
      const current = store.sessions[SESSION_ID] || {};
      /* Copie de sécurité de l'état actif AVANT restauration (jamais de perte). */
      const safety = {
        id: makeId(), sessionId: SESSION_ID, fromVersion: MIGRATION_VERSION, toVersion: MIGRATION_VERSION,
        migratedAt: new Date().toISOString(), code: typeof current.code === "string" ? current.code : "",
        reflection: current.reflection || "", values: current.values || {}, resolved: true, kind: "safety-before-restore"
      };
      try { writeJson(BACKUP_KEY, dedupeAndCap([...backups, safety])); } catch { /* best-effort */ }
      store.sessions[SESSION_ID] = Object.assign({}, current, { code: chosen.code, modeMission: false, attempted: Boolean(chosen.code && chosen.code.trim()) });
      try { writeJson(STORAGE_KEY, store); } catch { return { ok: false }; }
      this.markResolved(chosen.id);
      return { ok: true, code: chosen.code };
    }
  };

  /* ---- Migration proprement dite ---- */
  const store = readJson(STORAGE_KEY, "{}") || {};
  store.structureVersions = store.structureVersions || {};

  /* Cas « déjà en v5 » : aucune re-migration, aucune nouvelle sauvegarde. */
  if (store.structureVersions.session1 === MIGRATION_VERSION) return;

  /* État précédent de la séance 1. */
  const previous = (store.sessions && store.sessions[SESSION_ID]) || {};
  const oldCode = typeof previous.code === "string" ? previous.code : "";
  const fromVersion = store.structureVersions.session1 || "inconnue";

  /* Session VIERGE (aucun code élève à protéger) : simple marquage v5, AUCUNE sauvegarde, */
  /* aucun panneau. On n'écrit rien de plus que la version pour éviter toute re-migration. */
  if (!oldCode.trim()) {
    store.structureVersions.session1 = MIGRATION_VERSION;
    try { writeJson(STORAGE_KEY, store); } catch { /* sans risque : rien à perdre */ }
    return;
  }

  /* 1) Construit la sauvegarde complète EN MÉMOIRE. */
  const entry = {
    id: makeId(), sessionId: SESSION_ID, fromVersion, toVersion: MIGRATION_VERSION,
    migratedAt: new Date().toISOString(), code: oldCode,
    reflection: previous.reflection || "", values: previous.values || {}, resolved: false, kind: "migration"
  };

  /* 2) Écrit la sauvegarde (peut lever QuotaExceededError). */
  let backupWritten = false;
  try {
    const existing = loadBackups();
    writeJson(BACKUP_KEY, dedupeAndCap([...existing, entry]));
    backupWritten = true;
  } catch (error) {
    backupWritten = false;
  }

  /* 3) & 4) Relit IMMÉDIATEMENT la sauvegarde et vérifie son intégrité. */
  let backupVerified = false;
  if (backupWritten) {
    const reloaded = loadBackups().find(b => b.id === entry.id);
    backupVerified = Boolean(
      reloaded &&
      reloaded.code === oldCode &&
      reloaded.fromVersion === fromVersion &&
      reloaded.sessionId === SESSION_ID &&
      (reloaded.reflection || "") === (previous.reflection || "") &&
      JSON.stringify(reloaded.values || {}) === JSON.stringify(previous.values || {})
    );
  }

  /* Sauvegarde impossible/incohérente → NE RIEN modifier (transaction annulée). */
  if (!backupVerified) {
    /* Avertissement non bloquant, sans marquer la migration ni toucher l'état actif. */
    window.TechnoQuestMissionMigrationWarning = "La mise à niveau n'a pas pu être réalisée sans risque : votre ancien code est conservé tel quel.";
    try { console.warn("[TechnoQuest] Migration séance 1 reportée : sauvegarde de sécurité indisponible. Ancien code conservé."); } catch {}
    return;
  }

  /* 5) Sauvegarde vérifiée : reconstruit/migre puis écrit le nouvel état actif. */
  const newSkeleton = validator && typeof validator.getSkeleton === "function" ? validator.getSkeleton("guided", SESSION_ID) : "";

  /* Trouve la ligne de RÉPONSE (première ligne éditable sous un commentaire). */
  function slotUnderComment(skeletonLines, commentRe) {
    for (let i = 0; i < skeletonLines.length; i += 1) {
      if (!commentRe.test(skeletonLines[i])) continue;
      for (let j = i + 1; j <= Math.min(skeletonLines.length - 1, i + 3); j += 1) {
        const trimmed = String(skeletonLines[j] || "").trim();
        if (trimmed.startsWith("//")) continue;
        if (/^(?:[{}]|void\s+(?:setup|loop)\s*\()/.test(trimmed)) break;
        return j;
      }
    }
    return -1;
  }
  /* Première/toutes lignes originales correspondant à un motif. */
  function firstLine(source, re) { const f = String(source || "").split("\n").find(l => re.test(l)); return f ? f.trim() : null; }
  function allLines(source, re) { return String(source || "").split("\n").filter(l => re.test(l)).map(l => l.trim()); }

  /* Emplacement de RÉPONSE d'un affichage : la ligne vide sous le libellé Serial.print("…") */
  /* prérempli. Le commentaire ancre le bloc, le libellé repère la ligne de réponse (juste après). */
  function answerSlotForShow(skeletonLines, commentRe, labelRe) {
    for (let i = 0; i < skeletonLines.length; i += 1) {
      if (!commentRe.test(skeletonLines[i])) continue;
      for (let j = i + 1; j <= Math.min(skeletonLines.length - 1, i + 6); j += 1) {
        if (labelRe.test(skeletonLines[j])) return Math.min(skeletonLines.length - 1, j + 1);
        if (/^(?:[{}]|void\s+(?:setup|loop)\s*\()/.test(String(skeletonLines[j] || "").trim())) break;
      }
    }
    return -1;
  }
  /* Nom de la variable recevant analogRead(broche) dans un corps donné (sans transformation). */
  function analogVar(body, pinRe) {
    const m = String(body || "").match(new RegExp(`\\b([A-Za-z_]\\w*)\\s*=\\s*analogRead\\s*\\(\\s*${pinRe}\\s*\\)`));
    return m ? m[1] : "";
  }
  /* Instruction d'affichage (Serial.print/println) qui affiche EXACTEMENT cette variable. */
  function printOfVariable(body, variableName) {
    if (!variableName) return null;
    const line = String(body || "").split("\n").find(l => new RegExp(`\\bSerial\\s*\\.\\s*print(?:ln)?\\s*\\(\\s*${variableName}\\s*\\)\\s*;`).test(l));
    return line ? line.trim() : null;
  }

  /* Reconstruit le nouveau squelette avec les instructions reconnues de l'ancien code. */
  function rebuild(source) {
    if (!validator || !analysisApi || !newSkeleton) return { code: "", certain: false };
    const analysis = analysisApi.analyze(source);
    const setupBody = analysis.setup.found ? source.slice(analysis.setup.bodyStart, analysis.setup.bodyEnd) : "";
    const loopBody = analysis.loop.found ? source.slice(analysis.loop.bodyStart, analysis.loop.bodyEnd) : "";
    const lines = newSkeleton.split("\n");
    const PUMP = "(?:PIN_RELAIS_POMPE|6)";
    let placed = 0;
    function place(commentRe, instruction, indent) {
      if (!instruction) return; const slot = slotUnderComment(lines, commentRe); if (slot < 0) return;
      lines[slot] = indent + instruction; placed += 1;
    }
    /* Place une instruction d'affichage dans la ligne de réponse sous son libellé prérempli. */
    function placeShow(commentRe, labelRe, instruction) {
      if (!instruction) return; const slot = answerSlotForShow(lines, commentRe, labelRe); if (slot < 0) return;
      lines[slot] = "  " + instruction; placed += 1;
    }
    place(/Charger ici la biblioth/i, firstLine(source, /#\s*include\s*<\s*Arduino\.h\s*>/i), "");
    place(/Initialiser le Moniteur/i, firstLine(setupBody, /\bSerial\s*\.\s*begin\s*\([^;\n]*\)\s*;/i), "  ");
    place(/Configurer D6/i, firstLine(setupBody, /\bpinMode\s*\([^;\n]*\)\s*;/i), "  ");
    place(/Garder la pompe arr[eê]t[eé]e au d[ée]marrage/i, firstLine(setupBody, new RegExp(`\\bdigitalWrite\\s*\\([^;\\n]*${PUMP}[^;\\n]*LOW[^;\\n]*\\)\\s*;`, "i")), "  ");
    place(/Lire l'humidit/i, firstLine(loopBody, /=\s*analogRead\s*\(\s*(?:PIN_HUMIDITE_SOL|A0)\s*\)\s*;/i), "  ");
    place(/Lire la lumi/i, firstLine(loopBody, /=\s*analogRead\s*\(\s*(?:PIN_LUMIERE|A1)\s*\)\s*;/i), "  ");
    place(/Lire le niveau d'eau/i, firstLine(loopBody, /=\s*analogRead\s*\(\s*(?:PIN_NIVEAU_EAU|A2)\s*\)\s*;/i), "  ");
    /* Chaque affichage est replacé sous SON libellé, d'après la variable réellement lue */
    /* pour ce capteur — sans jamais transformer une mauvaise variable en bonne variable. */
    const varHumidity = analogVar(loopBody, "(?:PIN_HUMIDITE_SOL|A0)");
    const varLight = analogVar(loopBody, "(?:PIN_LUMIERE|A1)");
    const varWater = analogVar(loopBody, "(?:PIN_NIVEAU_EAU|A2)");
    placeShow(/Afficher l'humidit/i, /Serial\s*\.\s*print\s*\(\s*"/i, printOfVariable(loopBody, varHumidity));
    placeShow(/Afficher la lumi/i, /Serial\s*\.\s*print\s*\(\s*"/i, printOfVariable(loopBody, varLight));
    placeShow(/Afficher le niveau d'eau/i, /Serial\s*\.\s*print\s*\(\s*"/i, printOfVariable(loopBody, varWater));
    place(/Garder la pompe arr[eê]t[eé]e pendant cette s[ée]ance/i, firstLine(loopBody, new RegExp(`\\bdigitalWrite\\s*\\([^;\\n]*${PUMP}[^;\\n]*LOW[^;\\n]*\\)\\s*;`, "i")), "  ");
    place(/Attendre une seconde/i, firstLine(loopBody, /\bdelay\s*\(\s*1000[^;\n]*\)\s*;/i), "  ");
    return { code: lines.join("\n"), certain: placed > 0 };
  }

  /* Détermine la stratégie. */
  const hasStudentAnswers = Boolean(oldCode.trim()) && validator ? validator.validate(oldCode, SESSION_ID).steps.some(s => s.ok) : false;
  let migratedCode = "";
  let migrationState = "reset";
  if (hasStudentAnswers) {
    const r = rebuild(oldCode);
    if (r.certain) { migratedCode = r.code; migrationState = "migrated"; }
    else { migratedCode = ""; migrationState = "uncertain"; }
  }

  /* Écrit le nouvel état actif. En cas d'échec, on NE marque PAS la migration (retry au prochain chargement). */
  const nextStore = readJson(STORAGE_KEY, "{}") || {};
  nextStore.structureVersions = nextStore.structureVersions || {};
  nextStore.sessions = nextStore.sessions || {};
  nextStore.sessions[SESSION_ID] = {
    /* Après une migration structurelle, on N'AUTO-ACTIVE PAS : l'élève ré-entre volontairement */
    /* en Mission (le panneau de récupération l'y invite), ce qui évite toute course avec la vue */
    /* Classique qui partage le même textarea et écraserait le code migré. */
    modeMission: false,
    helpMode: "guided",
    activeStep: "include",
    badges: {},
    values: previous.values || {},
    reflection: previous.reflection || "",
    code: migratedCode,
    attempted: migrationState === "migrated",
    migrationState
  };
  delete nextStore.code; delete nextStore.helpMode; delete nextStore.activeStep; delete nextStore.badges; delete nextStore.attempted;
  nextStore.structureVersions.session1 = MIGRATION_VERSION;
  try {
    writeJson(STORAGE_KEY, nextStore);
  } catch (error) {
    /* L'écriture de l'état migré a échoué : l'ancien état actif reste en place, migration NON marquée. */
    window.TechnoQuestMissionMigrationWarning = "La mise à niveau n'a pas pu être finalisée : votre ancien code est conservé et sauvegardé.";
    try { console.warn("[TechnoQuest] Écriture de l'état migré impossible ; ancien état conservé, sauvegarde présente."); } catch {}
  }
})();
