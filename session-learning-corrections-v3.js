/*
 * TechnoQuest — mise à jour des modèles classiques des séances 5 et 8.
 * Ce fichier remplace uniquement les anciens squelettes connus, jamais une production personnelle de l’élève.
 */
"use strict";

(() => {
  const sessionId = Number(document.body.dataset.session || 0);
  if (![5, 8].includes(sessionId)) return;

  const editor = document.getElementById("codeEditor");
  if (!editor) return;

  const normalize = value => String(value || "").replace(/\r/g, "").trim();

  const session5Old = {
    guided: `seuil_humidite = 30
seuil_arret = ____
seuil_reservoir = 20
humidite = lire_humidite()
reservoir = lire_reservoir()

# Complète la décision avec les deux seuils`,
    standard: `# Programmer une hystérésis et limiter l’arrosage à 2 s.
seuil_humidite = 30
seuil_arret = 42
seuil_reservoir = 20`,
    expert: `# Contrat : utiliser deux seuils, conserver la sécurité du réservoir et limiter chaque arrosage à 2 s.`,
    full: `seuil_humidite = 30
seuil_arret = 42
seuil_reservoir = 20
humidite = lire_humidite()
reservoir = lire_reservoir()

if humidite < seuil_humidite and reservoir >= seuil_reservoir:
    arroser(2)
elif humidite > seuil_arret:
    stop()
else:
    stop()`
  };

  const session5New = {
    guided: `seuil_humidite = 30
seuil_arret = ____
seuil_reservoir = 20
pompe_active = False

humidite = lire_humidite()
reservoir = lire_reservoir()

# 1. Le réservoir reste prioritaire.
if reservoir < seuil_reservoir:
    pompe_active = False
# 2. Sous le seuil bas, mémoriser la marche.
elif ______________________________:
    pompe_active = True
# 3. Au-dessus du seuil haut, mémoriser l’arrêt.
elif ______________________________:
    pompe_active = False
# 4. Entre les deux seuils : ne pas modifier pompe_active.

if pompe_active:
    arroser()
else:
    stop()`,
    standard: `# Programmer une vraie hystérésis avec mémoire de l’état précédent.
seuil_humidite = 30
seuil_arret = 42
seuil_reservoir = 20
pompe_active = False

# Lire A0 et A2.
# Priorité au réservoir.
# Démarrer sous le seuil bas, arrêter au-dessus du seuil haut.
# Entre les deux seuils, conserver pompe_active.`,
    expert: `# Contrat : mémoriser l’état de la pompe entre les deux seuils,
# donner la priorité au réservoir et ne pas ajouter de else
# qui effacerait la mémoire dans la zone d’hystérésis.`,
    full: `seuil_humidite = 30
seuil_arret = 42
seuil_reservoir = 20
pompe_active = False

humidite = lire_humidite()
reservoir = lire_reservoir()

if reservoir < seuil_reservoir:
    pompe_active = False
elif humidite < seuil_humidite:
    pompe_active = True
elif humidite > seuil_arret:
    pompe_active = False
# Sinon, pompe_active conserve sa valeur précédente.

if pompe_active:
    arroser()
else:
    stop()`
  };

  const session8Old = {
    guided: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70

# 1. Lire les trois capteurs
# 2. Traiter d’abord le réservoir vide
# 3. Décider d’arroser ou non
# 4. Afficher les mesures`,
    standard: `# Construire le programme final sécurisé à partir du cahier des charges.
seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70`,
    expert: `# Contrat final : sécurité prioritaire, trois capteurs, arrosage court, alerte et affichage.`,
    full: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70
humidite = lire_humidite()
reservoir = lire_reservoir()
lumiere = lire_lumiere()

if reservoir < seuil_reservoir:
    stop()
    alerter("Réservoir vide")
elif humidite < seuil_humidite and lumiere < seuil_lumiere:
    arroser(2)
else:
    stop()

afficher(humidite, reservoir, lumiere)`
  };

  const session8New = {
    guided: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70

# 1. Lire les trois capteurs.
humidite = lire_humidite()
reservoir = lire_reservoir()
lumiere = lire_lumiere()

# 2. Vérifier que chaque valeur est comprise entre 0 et 1023.
mesures_coherentes = (
    0 <= humidite <= 1023
    and ______________________________
    and ______________________________
)

# 3. Traiter dans cet ordre : incohérence, réservoir vide, décision.
if not mesures_coherentes:
    stop()
    alerter("Erreur capteur")
elif reservoir < seuil_reservoir:
    stop()
    alerter("Réservoir vide")
elif humidite < seuil_humidite and lumiere < seuil_lumiere:
    arroser(2)
else:
    stop()

afficher(humidite, reservoir, lumiere)`,
    standard: `# Construire le programme final avec contrôle de cohérence prioritaire.
seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70

# Lire A0, A1 et A2.
# Vérifier les trois plages 0 à 1023.
# Traiter ensuite le réservoir, puis la décision multicritère.`,
    expert: `# Contrat final : refuser toute mesure incohérente avant la commande,
# conserver la sécurité du réservoir, la décision multicritère,
# l’arrosage court, les alertes et l’affichage.`,
    full: `seuil_humidite = 35
seuil_reservoir = 20
seuil_lumiere = 70
humidite = lire_humidite()
reservoir = lire_reservoir()
lumiere = lire_lumiere()

mesures_coherentes = (
    0 <= humidite <= 1023
    and 0 <= reservoir <= 1023
    and 0 <= lumiere <= 1023
)

if not mesures_coherentes:
    stop()
    alerter("Erreur capteur : mesure incohérente")
elif reservoir < seuil_reservoir:
    stop()
    alerter("Réservoir vide")
elif humidite < seuil_humidite and lumiere < seuil_lumiere:
    arroser(2)
else:
    stop()

afficher(humidite, reservoir, lumiere)`
  };

  const oldModels = sessionId === 5 ? session5Old : session8Old;
  const newModels = sessionId === 5 ? session5New : session8New;

  function replaceKnownModel() {
    const current = normalize(editor.value);
    const entry = Object.entries(oldModels).find(([, value]) => normalize(value) === current);
    if (!entry) return;

    const mode = entry[0];
    editor.value = newModels[mode] || newModels.guided;
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Corriger le modèle initial après l’exécution de session-learning-v2.js.
  window.setTimeout(replaceKnownModel, 30);

  // Corriger aussi les nouveaux modèles chargés par le sélecteur ou le bouton Restaurer.
  document.getElementById("codeModeV2")?.addEventListener("change", () => window.setTimeout(replaceKnownModel, 20));
  document.getElementById("restoreCode")?.addEventListener("click", () => window.setTimeout(replaceKnownModel, 20));
})();
