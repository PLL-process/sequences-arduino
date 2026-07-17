/* TechnoQuest — squelette progressif simplifié de la séance 1. */
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
  mission.skeletons.guided = `
const int PIN_HUMIDITE_SOL = A0;
const int PIN_LUMIERE = A1;
const int PIN_NIVEAU_EAU = A2;
const int PIN_RELAIS_POMPE = 6;
void setup() {
  // Initialiser le Moniteur Série à 9600 bauds.

  // Configurer D6 en sortie.

  // Garder la pompe arrêtée au démarrage.

}

void loop() {
  // Lire l'humidité du sol sur A0.

  // Lire la lumière sur A1.

  // Lire le niveau d'eau sur A2.

  // Afficher l'humidité dans le Moniteur Série.

  // Afficher la lumière dans le Moniteur Série.

  // Afficher le niveau d'eau dans le Moniteur Série.

  // Garder la pompe arrêtée.

  // Attendre une seconde.

}`;
})();
