// Déclare la broche analogique du capteur d'humidité du sol Grove.
const int BROCHE_HUMIDITE_SOL = A0;

// Déclare la broche analogique du capteur de luminosité Grove.
const int BROCHE_LUMIERE = A1;

// Déclare la broche analogique du capteur de niveau d'eau Grove.
const int BROCHE_RESERVOIR = A2;

// Déclare la broche numérique du relais Grove.
const int BROCHE_RELAIS = 6;

// Définit le seuil brut en dessous duquel le sol est considéré comme sec.
const int SEUIL_SOL_SEC = 450;

// Définit le seuil brut au-dessus duquel le réservoir est considéré comme suffisant.
const int SEUIL_RESERVOIR_OK = 300;

// Définit le seuil brut permettant d'éviter un arrosage sous une lumière trop forte.
const int SEUIL_LUMIERE_MAX = 750;

// Définit la durée maximale d'un cycle d'arrosage en millisecondes.
const unsigned long DUREE_ARROSAGE_MS = 2000;

// Définit la durée minimale entre deux décisions en millisecondes.
const unsigned long PERIODE_MESURE_MS = 5000;

// Déclare la variable de mesure de l'humidité du sol.
int humiditeSol = 0;

// Déclare la variable de mesure de la luminosité.
int luminosite = 0;

// Déclare la variable de mesure du réservoir.
int niveauReservoir = 0;

// La fonction setup s'exécute une seule fois au démarrage.
void setup() {
  // Démarre la communication série pour le diagnostic.
  Serial.begin(115200);

  // Configure la broche du relais comme une sortie.
  pinMode(BROCHE_RELAIS, OUTPUT);

  // Coupe la pompe au démarrage pour garantir un état sûr.
  digitalWrite(BROCHE_RELAIS, LOW);
}

// La fonction loop s'exécute continuellement.
void loop() {
  // Lit le capteur d'humidité du sol.
  humiditeSol = analogRead(BROCHE_HUMIDITE_SOL);

  // Lit le capteur de luminosité.
  luminosite = analogRead(BROCHE_LUMIERE);

  // Lit le capteur de niveau du réservoir.
  niveauReservoir = analogRead(BROCHE_RESERVOIR);

  // Affiche la mesure du sol.
  Serial.print("Sol=");

  // Affiche la valeur du sol.
  Serial.print(humiditeSol);

  // Affiche le séparateur de luminosité.
  Serial.print(" | Lumiere=");

  // Affiche la luminosité.
  Serial.print(luminosite);

  // Affiche le séparateur du réservoir.
  Serial.print(" | Reservoir=");

  // Affiche le niveau du réservoir et termine la ligne.
  Serial.println(niveauReservoir);

  // Vérifie en priorité si le réservoir est insuffisant.
  if (niveauReservoir <= SEUIL_RESERVOIR_OK) {
    // Coupe immédiatement la pompe pour éviter la marche à vide.
    digitalWrite(BROCHE_RELAIS, LOW);

    // Affiche une alerte de sécurité.
    Serial.println("ALERTE : reservoir insuffisant, pompe interdite.");
  }
  // Vérifie si toutes les conditions d'arrosage sont satisfaites.
  else if (humiditeSol < SEUIL_SOL_SEC && luminosite < SEUIL_LUMIERE_MAX) {
    // Active la pompe à travers le relais.
    digitalWrite(BROCHE_RELAIS, HIGH);

    // Informe l'utilisateur du début de l'arrosage.
    Serial.println("Arrosage court en cours.");

    // Maintient l'arrosage pendant la durée maximale autorisée.
    delay(DUREE_ARROSAGE_MS);

    // Coupe la pompe après le cycle court.
    digitalWrite(BROCHE_RELAIS, LOW);

    // Confirme l'arrêt de la pompe.
    Serial.println("Arrosage termine, pompe arretee.");
  }
  // Traite le cas où l'arrosage n'est pas nécessaire.
  else {
    // Maintient la pompe à l'arrêt.
    digitalWrite(BROCHE_RELAIS, LOW);

    // Explique que les conditions ne sont pas réunies.
    Serial.println("Aucun arrosage necessaire.");
  }

  // Attend avant de réaliser une nouvelle décision.
  delay(PERIODE_MESURE_MS);
}
