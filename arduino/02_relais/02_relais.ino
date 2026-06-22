// Déclare la broche numérique reliée au relais Grove.
const int BROCHE_RELAIS = 6;

// La fonction setup s'exécute une seule fois au démarrage.
void setup() {
  // Configure la broche du relais comme une sortie.
  pinMode(BROCHE_RELAIS, OUTPUT);

  // Place immédiatement le relais dans son état de repos.
  digitalWrite(BROCHE_RELAIS, LOW);
}

// La fonction loop s'exécute continuellement.
void loop() {
  // Active le relais pendant deux secondes pour le test.
  digitalWrite(BROCHE_RELAIS, HIGH);

  // Maintient l'état actif pendant deux secondes.
  delay(2000);

  // Désactive le relais.
  digitalWrite(BROCHE_RELAIS, LOW);

  // Maintient l'état de repos pendant deux secondes.
  delay(2000);
}
