/* TechnoQuest — spécifications des huit algorigrammes ultra premium.
   RÈGLE DE FIDÉLITÉ : chaque spécification suit EXACTEMENT le programme C++
   de référence de la séance (mission-mode/mission-data.js). Un losange
   n'apparaît que lorsqu'un if / else if réel existe dans le programme.
   RÈGLE DE COULEUR : chaque forme reprend la couleur de l'action
   correspondante dans l'algorithme coloré de la séance (parcours-premium.js).
   Couleurs transverses stables : INITIALISER #38bdf8 · ATTENDRE #94a3b8 ·
   le retour de loop() est la flèche courbe rose (#f472b6), jamais un losange.
   Chaque spécification fournit aussi la table de correspondance
   « algorithme coloré → forme → instruction C++ » de la partie 3C. */
"use strict";
(() => {
  /* Nœuds réutilisés dans toutes les séances. */
  const INIT = { kind: "rect", action: "INITIALISER", color: "#38bdf8", label: "Préparer la carte : Moniteur Série, broche D6 en sortie", code: "Serial.begin(9600); pinMode(…); …" };
  const SAFE_SETUP = { kind: "rect", action: "SÉCURISER", color: "#fb7185", label: "Imposer l'état sûr : pompe arrêtée", code: "digitalWrite(PIN_RELAIS_POMPE, LOW);" };
  const WAIT = { kind: "rect", action: "ATTENDRE", color: "#94a3b8", label: "Attendre une seconde", code: "delay(1000);" };
  const pump = (seconds, color) => ({ kind: "rect", action: "AGIR", color, label: `Impulsion pompe : ${seconds} s puis arrêt`, code: `digitalWrite(…, HIGH); delay(${seconds * 1000}); … LOW);` });
  const stop = (color, label) => ({ kind: "rect", action: "SÉCURISER", color, label: label || "Garder la pompe arrêtée", code: "digitalWrite(PIN_RELAIS_POMPE, LOW);" });

  window.TechnoQuestAlgorigrammeData = {
    /* ---------- SÉANCE 1 — aucun if : AUCUN losange ---------- */
    1: {
      aria: "Algorigramme séance 1 : début, initialiser et sécuriser dans setup, puis boucle : lire et mémoriser, afficher, garder la pompe arrêtée, attendre, retour au début de la boucle",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "ACQUÉRIR · MÉMORISER", color: "#60a5fa", label: "Lire l'humidité A0 et ranger la valeur", code: "int humidite = analogRead(PIN_HUMIDITE_SOL);" },
        { kind: "io", action: "COMMUNIQUER", color: "#67e8f9", label: "Afficher la mesure au Moniteur Série", code: "Serial.println(humidite);" },
        stop("#fb7185", "Maintenir la pompe arrêtée"),
        WAIT
      ],
      correspondances: [
        ["ACQUÉRIR", "#60a5fa", "parallélogramme bleu", "analogRead(PIN_HUMIDITE_SOL)"],
        ["MÉMORISER", "#c084fc", "même parallélogramme (valeur rangée)", "int humidite = …;"],
        ["COMMUNIQUER", "#67e8f9", "parallélogramme cyan", "Serial.println(humidite);"],
        ["SÉCURISER", "#fb7185", "rectangle rose", "digitalWrite(PIN_RELAIS_POMPE, LOW);"],
        ["ATTENDRE", "#94a3b8", "rectangle gris", "delay(1000);"]
      ],
      note: "Aucun losange dans cette séance : le programme ne contient encore aucune condition if. Le rebouclage de loop() est représenté par la flèche de retour rose."
    },

    /* ---------- SÉANCE 2 — if/else sec ou humide ---------- */
    2: {
      aria: "Algorigramme séance 2 : lire et mémoriser l'humidité, afficher la mesure, décision humidité inférieure au seuil : si oui afficher sol sec, sinon afficher sol humide, sécuriser, attendre, retour",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "MESURER · MÉMORISER", color: "#60a5fa", label: "Lire l'humidité A0 (valeur ADC 0-1023)", code: "int humidite = analogRead(PIN_HUMIDITE_SOL);" },
        { kind: "io", action: "COMMUNIQUER", color: "#c084fc", label: "Afficher la mesure convertible en tension", code: "Serial.print(\"Humidité : \"); Serial.println(humidite);" },
        { kind: "diamond", action: "COMPARER", color: "#facc15", label: "Mesure sous le seuil calibré ?", code: "humidite < SEUIL_HUMIDITE", branchLabel: "OUI · SOL SEC", continueLabel: "NON · SOL HUMIDE", mergeToId: "s2secu",
          branch: [{ kind: "io", action: "DÉCIDER", color: "#fb923c", label: "Annoncer un sol sec", code: "Serial.println(\"Sol sec\");" }] },
        { kind: "io", action: "DÉCIDER", color: "#fb923c", label: "Annoncer un sol humide", code: "Serial.println(\"Sol humide\");" },
        Object.assign(stop("#fb7185", "Pompe arrêtée pendant la calibration"), { id: "s2secu" }),
        WAIT
      ],
      correspondances: [
        ["MESURER", "#60a5fa", "parallélogramme bleu", "int humidite = analogRead(PIN_HUMIDITE_SOL);"],
        ["CONVERTIR", "#c084fc", "parallélogramme violet (affichage)", "Serial.print / Serial.println"],
        ["COMPARER", "#facc15", "losange jaune", "if (humidite < SEUIL_HUMIDITE)"],
        ["DÉCIDER", "#fb923c", "parallélogrammes orange (sortie)", "Serial.println(\"Sol sec\" / \"Sol humide\");"],
        ["SÉCURISER", "#fb7185", "rectangle rose", "digitalWrite(PIN_RELAIS_POMPE, LOW);"]
      ],
      note: "Le losange traduit le if / else réel du programme : la branche OUI affiche « Sol sec », la branche NON affiche « Sol humide »."
    },

    /* ---------- SÉANCE 3 — if/else et première commande de pompe ---------- */
    3: {
      aria: "Algorigramme séance 3 : lire l'humidité, afficher, décision sol sec : si oui impulsion pompe trois secondes puis arrêt, sinon garder la pompe arrêtée, attendre, retour",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "ACQUÉRIR", color: "#60a5fa", label: "Lire l'information du capteur A0", code: "int humidite = analogRead(PIN_HUMIDITE_SOL);" },
        { kind: "io", action: "COMMUNIQUER", color: "#67e8f9", label: "Afficher la mesure", code: "Serial.print(\"Humidité : \"); Serial.println(humidite);" },
        { kind: "diamond", action: "TRAITER", color: "#facc15", label: "Le sol est-il sec ?", code: "humidite < SEUIL_HUMIDITE", branchLabel: "OUI · SOL SEC", continueLabel: "NON", mergeToId: "s3wait",
          branch: [
            { kind: "rect", action: "DISTRIBUER", color: "#fb923c", label: "Relais fermé : l'énergie atteint la pompe", code: "digitalWrite(PIN_RELAIS_POMPE, HIGH);" },
            { kind: "rect", action: "CONVERTIR / AGIR", color: "#4ade80", label: "Arroser 3 secondes puis couper", code: "delay(3000); digitalWrite(…, LOW);" }
          ] },
        stop("#fb7185", "Sinon : garantir l'arrêt"),
        Object.assign({}, WAIT, { id: "s3wait" })
      ],
      correspondances: [
        ["ACQUÉRIR", "#60a5fa", "parallélogramme bleu", "int humidite = analogRead(PIN_HUMIDITE_SOL);"],
        ["TRAITER", "#facc15", "losange jaune", "if (humidite < SEUIL_HUMIDITE)"],
        ["DISTRIBUER", "#fb923c", "rectangle orange", "digitalWrite(PIN_RELAIS_POMPE, HIGH);"],
        ["CONVERTIR / AGIR", "#4ade80", "rectangle vert", "delay(3000); puis digitalWrite(…, LOW);"],
        ["SÉCURISER", "#fb7185", "rectangle rose", "digitalWrite(PIN_RELAIS_POMPE, LOW);"]
      ],
      note: "La branche OUI matérialise la chaîne d'énergie : l'ordre logique D6 ferme le relais, l'énergie de l'alimentation séparée fait tourner la pompe 3 secondes."
    },

    /* ---------- SÉANCE 4 — chaîne if / else if : réservoir prioritaire ---------- */
    4: {
      aria: "Algorigramme séance 4 : lire humidité et niveau, première décision réservoir trop bas : si oui arrêt et alerte, sinon deuxième décision sol sec et niveau suffisant : si oui impulsion trois secondes, sinon arrêt, attendre, retour",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "ACQUÉRIR", color: "#60a5fa", label: "Lire l'humidité A0 et le niveau A2", code: "int humidite = …; int niveauEau = …;" },
        { kind: "diamond", action: "SÉCURISER", color: "#fb7185", label: "Réservoir trop bas ?", code: "niveauEau < SEUIL_RESERVOIR", branchLabel: "OUI · RÉSERVOIR INSUFFISANT", continueLabel: "NON · RÉSERVOIR SUFFISANT", mergeToId: "s4wait",
          branch: [
            { kind: "rect", action: "SÉCURISER", color: "#fb7185", label: "Arrêt immédiat : marche à vide interdite", code: "digitalWrite(PIN_RELAIS_POMPE, LOW);" },
            { kind: "io", action: "ALERTER", color: "#facc15", label: "Prévenir l'utilisateur", code: "Serial.println(\"Réservoir vide\");" }
          ] },
        { kind: "diamond", action: "COMPARER", color: "#facc15", label: "Sol sec ET niveau suffisant ?", code: "humidite < SEUIL && niveauEau >= SEUIL", branchLabel: "OUI", continueLabel: "NON", mergeToId: "s4wait",
          branch: [pump(3, "#4ade80")] },
        stop("#fb7185", "Dans les autres cas : pompe arrêtée"),
        Object.assign({}, WAIT, { id: "s4wait" })
      ],
      correspondances: [
        ["ACQUÉRIR", "#60a5fa", "parallélogramme bleu", "analogRead(PIN_HUMIDITE_SOL) / analogRead(PIN_NIVEAU_EAU)"],
        ["SÉCURISER", "#fb7185", "losange puis rectangles roses", "if (niveauEau < SEUIL_RESERVOIR) → LOW"],
        ["ALERTER", "#facc15", "parallélogramme jaune (sortie)", "Serial.println(\"Réservoir vide\");"],
        ["COMPARER", "#facc15", "losange jaune", "humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR"],
        ["AGIR", "#4ade80", "rectangle vert", "digitalWrite(…, HIGH); delay(3000); … LOW);"]
      ],
      note: "L'ordre des losanges reproduit l'ordre des priorités du programme : la sécurité du réservoir est testée AVANT la décision d'arrosage. Le && exige que les deux conditions soient vraies."
    },

    /* ---------- SÉANCE 5 — vraie hystérésis : état mémorisé ---------- */
    5: {
      aria: "Algorigramme séance 5 : lire humidité et niveau, afficher, trois décisions en chaîne mettant à jour la demande mémorisée d'arrosage : réservoir trop bas la demande devient fausse, humidité sous le seuil bas la demande devient vraie, humidité au-dessus du seuil haut la demande devient fausse, entre les deux la demande est conservée, puis décision demande active : impulsion deux secondes sinon arrêt, attendre, retour",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "MESURER", color: "#60a5fa", label: "Lire l'humidité A0 et le niveau A2", code: "int humidite = …; int niveauEau = …;" },
        { kind: "io", action: "COMMUNIQUER", color: "#c084fc", label: "Afficher la mesure", code: "Serial.print(\"Humidité : \"); Serial.println(humidite);" },
        { kind: "diamond", action: "SÉCURISER", color: "#fb7185", label: "Réservoir trop bas ?", code: "niveauEau < SEUIL_RESERVOIR", branchLabel: "OUI", continueLabel: "NON", mergeToId: "s5demande",
          branch: [{ kind: "rect", action: "MÉMORISER", color: "#c084fc", label: "Annuler la demande d'arrosage", code: "demandeArrosage = false;" }] },
        { kind: "diamond", action: "DÉCIDER", color: "#fb923c", label: "Humidité sous le seuil BAS ?", code: "humidite < SEUIL_HUMIDITE", branchLabel: "OUI · SOL SEC", continueLabel: "NON", mergeToId: "s5demande",
          branch: [{ kind: "rect", action: "MÉMORISER", color: "#c084fc", label: "Demander l'arrosage", code: "demandeArrosage = true;" }] },
        { kind: "diamond", action: "DÉCIDER", color: "#fb923c", label: "Humidité au-dessus du seuil HAUT ?", code: "humidite > SEUIL_ARRET", branchLabel: "OUI · SOL HUMIDE", continueLabel: "NON · ENTRE LES SEUILS · DEMANDE CONSERVÉE", mergeToId: "s5demande",
          branch: [{ kind: "rect", action: "MÉMORISER", color: "#c084fc", label: "Annuler la demande", code: "demandeArrosage = false;" }] },
        { kind: "diamond", action: "DÉCIDER", color: "#fb923c", label: "Demande d'arrosage active ?", code: "if (demandeArrosage)", branchLabel: "OUI", continueLabel: "NON", id: "s5demande", mergeToId: "s5wait",
          branch: [pump(2, "#4ade80")] },
        stop("#fb7185", "Sinon : pompe arrêtée"),
        Object.assign({}, WAIT, { id: "s5wait" })
      ],
      correspondances: [
        ["MESURER", "#60a5fa", "parallélogramme bleu", "analogRead sur A0 et A2"],
        ["PARAMÉTRER", "#c084fc", "rectangles violets (mémoire)", "bool demandeArrosage = false; (globale)"],
        ["DÉCIDER", "#fb923c", "losanges orange en chaîne", "if / else if : seuil bas, seuil haut"],
        ["SÉCURISER", "#fb7185", "losange rose prioritaire", "niveauEau < SEUIL_RESERVOIR → demande annulée"],
        ["ÉCONOMISER", "#4ade80", "rectangle vert", "impulsion limitée : HIGH; delay(2000); LOW;"]
      ],
      note: "La branche « NON · entre les seuils » ne modifie rien : la variable globale demandeArrosage CONSERVE sa valeur d'un tour de loop() à l'autre — c'est la mémorisation qui fait la véritable hystérésis."
    },

    /* ---------- SÉANCE 6 — décision multicritère ---------- */
    6: {
      aria: "Algorigramme séance 6 : lire trois capteurs, afficher les trois mesures, décision unique à trois critères reliés par ET : humidité basse, réservoir suffisant, lumière acceptable ; si oui impulsion deux secondes, sinon arrêt, attendre, retour",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "ACQUÉRIR", color: "#60a5fa", label: "Lire humidité A0, lumière A1, niveau A2", code: "int humidite…; int lumiere…; int niveauEau…;" },
        { kind: "io", action: "COMMUNIQUER", color: "#67e8f9", label: "Afficher les trois mesures", code: "Serial.println(×3);" },
        { kind: "diamond", action: "COMPARER · DÉCIDER", color: "#facc15", label: "Sol sec ET réservoir suffisant ET lumière acceptable ?", code: "a < S1 && b >= S2 && c < S3", branchLabel: "OUI · 3 CRITÈRES VRAIS", continueLabel: "NON · AU MOINS UN CRITÈRE FAUX", mergeToId: "s6wait",
          branch: [pump(2, "#4ade80")] },
        stop("#fb7185", "Sinon : pompe arrêtée"),
        Object.assign({}, WAIT, { id: "s6wait" })
      ],
      correspondances: [
        ["ACQUÉRIR", "#60a5fa", "parallélogramme bleu", "analogRead sur A0, A1 et A2"],
        ["COMPARER", "#facc15", "losange jaune unique", "humidite < SEUIL && niveauEau >= SEUIL && lumiere < SEUIL"],
        ["DÉCIDER", "#fb923c", "branches OUI / NON du losange", "les deux && exigent trois critères vrais"],
        ["AGIR", "#4ade80", "rectangle vert", "digitalWrite(…, HIGH); delay(2000); … LOW);"]
      ],
      note: "Un seul losange car le programme contient une seule condition : les trois critères y sont reliés par deux opérateurs && — si un seul est faux, la branche NON est suivie."
    },

    /* ---------- SÉANCE 7 — capteur recalibré, sécurités conservées ---------- */
    7: {
      aria: "Algorigramme séance 7 : lire le capteur recalibré et le niveau, afficher les deux mesures, décision réservoir trop bas : arrêt ; sinon décision sol sec au nouveau seuil : impulsion deux secondes, sinon arrêt, attendre, retour",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "CALIBRER · ACQUÉRIR", color: "#c084fc", label: "Lire le capteur recalibré A0 et le niveau A2", code: "int humidite = …; int niveauEau = …;" },
        { kind: "io", action: "VALIDER", color: "#4ade80", label: "Afficher pour vérifier la recalibration", code: "Serial.println(humidite); Serial.println(niveauEau);" },
        { kind: "diamond", action: "SÉCURISER", color: "#fb7185", label: "Réservoir trop bas ?", code: "niveauEau < SEUIL_RESERVOIR", branchLabel: "OUI", continueLabel: "NON", mergeToId: "s7wait",
          branch: [stop("#fb7185", "Arrêt : sécurité conservée")] },
        { kind: "diamond", action: "DIAGNOSTIQUER", color: "#fb923c", label: "Sol sec au NOUVEAU seuil (590) ?", code: "humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL", branchLabel: "OUI", continueLabel: "NON", mergeToId: "s7wait",
          branch: [pump(2, "#34d399")] },
        stop("#fb7185", "Sinon : pompe arrêtée"),
        Object.assign({}, WAIT, { id: "s7wait" })
      ],
      correspondances: [
        ["DIAGNOSTIQUER", "#fb7185", "losanges (sécurité puis décision)", "tests du réservoir et du nouveau seuil"],
        ["REMPLACER", "#34d399", "rectangle vert (action conservée)", "impulsion HIGH; delay(2000); LOW;"],
        ["CALIBRER", "#c084fc", "parallélogramme violet", "const int SEUIL_HUMIDITE = 590; et lecture A0"],
        ["VALIDER", "#4ade80", "parallélogramme vert (sortie)", "Serial.println pour vérifier les mesures"]
      ],
      note: "Le remplacement du capteur change le seuil calibré (590), pas la structure : les sécurités du programme précédent sont intégralement conservées."
    },

    /* ---------- SÉANCE 8 — synthèse : priorités du prototype final ---------- */
    8: {
      aria: "Algorigramme séance 8 : lire les trois capteurs, afficher les mesures, décision prioritaire réservoir trop bas : arrêt et alerte ; sinon décision sol sec et lumière acceptable : impulsion deux secondes, sinon arrêt, attendre, retour",
      setup: [INIT, SAFE_SETUP],
      loop: [
        { kind: "io", action: "ACQUÉRIR", color: "#60a5fa", label: "Lire les trois capteurs du prototype", code: "A0, A1, A2 → int humidite, lumiere, niveauEau" },
        { kind: "io", action: "COMMUNIQUER", color: "#4ade80", label: "Afficher les trois mesures", code: "Serial.println(×3);" },
        { kind: "diamond", action: "SÉCURISER", color: "#fb7185", label: "Réservoir trop bas ?", code: "niveauEau < SEUIL_RESERVOIR", branchLabel: "OUI · PRIORITÉ ABSOLUE", continueLabel: "NON", mergeToId: "s8wait",
          branch: [
            stop("#fb7185", "Arrêt immédiat"),
            { kind: "io", action: "ALERTER", color: "#facc15", label: "Alerte utilisateur", code: "Serial.println(\"Réservoir vide\");" }
          ] },
        { kind: "diamond", action: "DÉCIDER", color: "#fb923c", label: "Sol sec ET lumière acceptable ?", code: "humidite < SEUIL && lumiere < SEUIL", branchLabel: "OUI", continueLabel: "NON", mergeToId: "s8wait",
          branch: [pump(2, "#4ade80")] },
        stop("#fb7185", "Sinon : pompe arrêtée"),
        Object.assign({}, WAIT, { id: "s8wait" })
      ],
      correspondances: [
        ["ACQUÉRIR", "#60a5fa", "parallélogramme bleu", "trois analogRead"],
        ["SÉCURISER", "#fb7185", "losange prioritaire + rectangles roses", "if (niveauEau < SEUIL_RESERVOIR) en PREMIER"],
        ["DÉCIDER", "#fb923c", "losange orange", "humidite < SEUIL && lumiere < SEUIL"],
        ["AGIR / COMMUNIQUER", "#4ade80", "rectangle et parallélogrammes verts", "impulsion 2 s ; affichages série"]
      ],
      note: "L'ordre des losanges EST le protocole de sécurité du prototype final : le cas défaillant (réservoir vide) est traité avant le cas normal. Les cas limites se testent autour des seuils."
    }
  };
})();
