/* TechnoQuest — squelette progressif simplifié et commenté de la séance 1. */
"use strict";

(() => {
  /* Récupère les données pédagogiques déjà chargées. */
  const missionApi = window.TechnoQuestMissionData;
  /* Arrête le correctif lorsque les données ne sont pas disponibles. */
  if (!missionApi?.getMission) return;

  /* Récupère la première mission. */
  const mission = missionApi.getMission(1);
  /* Arrête le correctif lorsque la mission est absente. */
  if (!mission?.skeletons) return;

  /* Remplace seulement le niveau Guidé par une progression à une instruction par ligne. */
  /* L'étape include dispose désormais d'une LIGNE DE CODE VIDE dédiée sous son commentaire */
  /* (le commentaire reste prérempli et protégé ; l'emplacement de réponse est la ligne vide). */
  mission.skeletons.guided = `  // Charger ici la bibliothèque de base Arduino.

const int PIN_HUMIDITE_SOL = A0; // Donne un nom simple à l'entrée analogique A0.
const int PIN_LUMIERE = A1; // Donne un nom simple à l'entrée analogique A1.
const int PIN_NIVEAU_EAU = A2; // Donne un nom simple à l'entrée analogique A2.
const int PIN_RELAIS_POMPE = 6; // Donne un nom simple à la sortie numérique D6.
void setup() { // Cette fonction s'exécute une seule fois au démarrage.
  // Initialiser le Moniteur Série à 9600 bauds.

  // Configurer D6 en sortie pour commander le relais.

  // Garder la pompe arrêtée au démarrage pour la sécurité.

} // Fin de setup().

void loop() { // Cette fonction recommence continuellement.
  // Lire l'humidité du sol sur A0.

  // Lire la lumière sur A1.

  // Lire le niveau d'eau sur A2.

  // Afficher l'humidité dans le Moniteur Série.

  // Afficher la lumière dans le Moniteur Série.

  // Afficher le niveau d'eau dans le Moniteur Série.

  // Garder la pompe arrêtée pendant cette séance d'observation.

  // Attendre une seconde avant de recommencer les mesures.

} // Fin de loop().`;
})();
