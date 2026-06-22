// Déclare la broche analogique reliée au capteur d'humidité Grove.
const int BROCHE_HUMIDITE = A0;

// Déclare la variable qui recevra la mesure brute.
int valeurHumidite = 0;

// La fonction setup s'exécute une seule fois au démarrage.
void setup() {
  // Démarre la communication série à 115200 bauds.
  Serial.begin(115200);

  // Attend brièvement la disponibilité du port série sans bloquer indéfiniment.
  while (!Serial && millis() < 3000) {
    // Réalise une courte attente de dix millisecondes.
    delay(10);
  }
}

// La fonction loop s'exécute continuellement.
void loop() {
  // Lit le signal analogique produit par le capteur.
  valeurHumidite = analogRead(BROCHE_HUMIDITE);

  // Affiche un libellé compréhensible dans le moniteur série.
  Serial.print("Humidite brute : ");

  // Affiche la valeur mesurée.
  Serial.println(valeurHumidite);

  // Attend une demi-seconde avant la mesure suivante.
  delay(500);
}
