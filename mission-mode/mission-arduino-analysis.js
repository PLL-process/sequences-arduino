/* TechnoQuest — ANALYSE lexicale et structurelle légère du code Arduino/C++ (PURE). */
/* Objectif : permettre au validateur de raisonner par FONCTION et par CONTEXTE, sans */
/* expression régulière globale appliquée à tout le fichier, et sans aucune exécution */
/* dynamique (pas d'eval, pas de Function). */
/* */
/* Deux étapes :                                                                        */
/*   1. neutralisation lexicale : les commentaires et le CONTENU des chaînes/caractères */
/*      sont remplacés par des espaces (longueur et retours à la ligne préservés) afin  */
/*      qu'aucune instruction « cachée » dans un commentaire ou une chaîne ne compte ;  */
/*   2. extraction structurelle : repérage des corps de setup() et loop() par équilibre */
/*      des accolades (gère les blocs imbriqués if/else), et calcul du code « hors      */
/*      fonctions ».                                                                     */
/* Le code ORIGINAL est conservé pour les messages pédagogiques et pour distinguer une  */
/* instruction réellement absente d'une instruction seulement commentée.                */
"use strict";

(() => {
  /* Neutralise commentaires et contenu des chaînes/caractères (remplacés par des espaces). */
  function neutralize(code) {
    /* Chaîne source sécurisée. */
    const source = String(code || "");
    /* Longueur totale. */
    const length = source.length;
    /* Accumulateur de sortie. */
    let out = "";
    /* Position de lecture. */
    let index = 0;
    /* État courant de l'analyseur lexical. */
    let state = "code";

    /* Parcourt chaque caractère une seule fois. */
    while (index < length) {
      /* Caractère courant. */
      const c = source[index];
      /* Caractère suivant. */
      const next = source[index + 1];

      /* État normal : détecte le début des commentaires et des chaînes. */
      if (state === "code") {
        /* Commentaire de ligne. */
        if (c === "/" && next === "/") { out += "  "; index += 2; state = "line"; continue; }
        /* Commentaire de bloc. */
        if (c === "/" && next === "*") { out += "  "; index += 2; state = "block"; continue; }
        /* Chaîne entre guillemets doubles. */
        if (c === "\"") { out += "\""; index += 1; state = "dquote"; continue; }
        /* Littéral caractère entre apostrophes. */
        if (c === "'") { out += "'"; index += 1; state = "squote"; continue; }
        /* Caractère de code conservé tel quel. */
        out += c; index += 1; continue;
      }

      /* Commentaire de ligne : neutralise jusqu'au retour à la ligne. */
      if (state === "line") {
        /* Fin du commentaire de ligne. */
        if (c === "\n") { out += "\n"; index += 1; state = "code"; continue; }
        /* Contenu neutralisé. */
        out += " "; index += 1; continue;
      }

      /* Commentaire de bloc : neutralise jusqu'au marqueur de fin. */
      if (state === "block") {
        /* Fin du commentaire de bloc. */
        if (c === "*" && next === "/") { out += "  "; index += 2; state = "code"; continue; }
        /* Conserve les retours à la ligne, neutralise le reste. */
        out += (c === "\n" ? "\n" : " "); index += 1; continue;
      }

      /* Chaîne double : neutralise le contenu, gère les échappements. */
      if (state === "dquote") {
        /* Échappement : neutralise les deux caractères. */
        if (c === "\\") { out += "  "; index += 2; continue; }
        /* Fin de chaîne. */
        if (c === "\"") { out += "\""; index += 1; state = "code"; continue; }
        /* Contenu neutralisé (retours à la ligne conservés). */
        out += (c === "\n" ? "\n" : " "); index += 1; continue;
      }

      /* Littéral caractère : neutralise le contenu, gère les échappements. */
      if (state === "squote") {
        /* Échappement : neutralise les deux caractères. */
        if (c === "\\") { out += "  "; index += 2; continue; }
        /* Fin du littéral. */
        if (c === "'") { out += "'"; index += 1; state = "code"; continue; }
        /* Contenu neutralisé. */
        out += (c === "\n" ? "\n" : " "); index += 1; continue;
      }
    }

    /* Retourne le code neutralisé (même longueur, mêmes lignes). */
    return out;
  }

  /* Recherche le corps d'une fonction setup()/loop() par équilibre des accolades. */
  function findFunctionBody(stripped, name) {
    /* Motif d'en-tête : « name ( [void] ) { » (le type de retour éventuel est ignoré). */
    const headerPattern = new RegExp(`\\b${name}\\s*\\(\\s*(?:void)?\\s*\\)\\s*\\{`, "g");
    /* Recherche la première occurrence réelle (les chaînes/commentaires sont neutralisés). */
    const match = headerPattern.exec(stripped);
    /* Signale l'absence de la fonction. */
    if (!match) return { found: false, body: "", bodyStart: -1, bodyEnd: -1, headerIndex: -1 };
    /* Position de l'accolade ouvrante. */
    const braceIndex = match.index + match[0].length - 1;
    /* Profondeur d'imbrication. */
    let depth = 0;
    /* Index de parcours. */
    let i = braceIndex;
    /* Parcourt jusqu'à refermer l'accolade ouvrante. */
    for (; i < stripped.length; i += 1) {
      /* Caractère courant. */
      const ch = stripped[i];
      /* Ouvre un niveau. */
      if (ch === "{") depth += 1;
      /* Ferme un niveau. */
      else if (ch === "}") { depth -= 1; if (depth === 0) break; }
    }
    /* Début du corps (après l'accolade ouvrante). */
    const bodyStart = braceIndex + 1;
    /* Fin du corps (sur l'accolade fermante, ou fin de fichier si non équilibrée). */
    const bodyEnd = depth === 0 ? i : stripped.length;
    /* Retourne le corps et ses bornes. */
    return { found: true, body: stripped.slice(bodyStart, bodyEnd), bodyStart, bodyEnd, headerIndex: match.index };
  }

  /* Remplace une plage par des espaces (préserve la longueur et les retours à la ligne). */
  function blankRange(str, start, end) {
    /* Ignore une plage invalide. */
    if (start < 0 || end < start) return str;
    /* Reconstruit la portion neutralisée en gardant les sauts de ligne. */
    const middle = str.slice(start, end).replace(/[^\n]/g, " ");
    /* Recompose la chaîne. */
    return str.slice(0, start) + middle + str.slice(end);
  }

  /* Analyse complète du programme. */
  function analyze(code) {
    /* Code original conservé (messages, distinction commentaire/chaîne). */
    const original = String(code || "");
    /* Code neutralisé (base de toute recherche d'instruction). */
    const stripped = neutralize(original);
    /* Corps de setup(). */
    const setup = findFunctionBody(stripped, "setup");
    /* Corps de loop(). */
    const loop = findFunctionBody(stripped, "loop");
    /* Code « hors fonctions » = neutralisé privé des corps de setup() et loop(). */
    let outside = stripped;
    /* Retire le corps de loop() en premier (index plus élevés) pour ne pas décaler les bornes. */
    if (loop.found) outside = blankRange(outside, loop.bodyStart, loop.bodyEnd);
    /* Retire ensuite le corps de setup(). */
    if (setup.found) outside = blankRange(outside, setup.bodyStart, setup.bodyEnd);
    /* Retourne l'analyse complète. */
    return { original, stripped, setup, loop, outside };
  }

  /* Interface publique pure. */
  const api = { analyze, neutralize };

  /* Publie l'API dans le navigateur. */
  if (typeof window !== "undefined") window.TechnoQuestMissionArduinoAnalysis = api;
  /* Permet l'usage en Node (tests unitaires purs, sans navigateur). */
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
