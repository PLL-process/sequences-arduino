# Projet complet – TechnoQuest : Jardin connecté

## Cadre général

| Élément | Choix retenu |
|---|---|
| Niveau principal | 4e, adaptable en 5e et 3e |
| Durée | 10 séances de 55 minutes et une soutenance |
| Organisation | Îlots de 3 ou 4 élèves avec rôles tournants |
| Démarche | Résolution de problème puis démarche de projet |
| Produit final | Prototype Arduino/Grove, programme commenté, essais et présentation |
| Évaluation | Missions numériques sur 20 et soutenance du prototype sur 20 |

## Situation déclenchante

Le jardin pédagogique du collège souffre d’arrosages irréguliers. Certaines plantes reçoivent trop d’eau, d’autres pas assez. Les périodes chaudes augmentent l’évaporation et les oublis peuvent endommager les cultures. Le collège recherche une solution autonome, économe en eau, fiable, maintenable et sûre.

## Problématique

**Comment concevoir un système capable d’arroser automatiquement le jardin seulement lorsque cela est nécessaire, tout en protégeant la pompe et en économisant l’eau ?**

## Alternance des pratiques

| Séance | Simulation et réflexion | Arduino/Grove et expérimentation | Production |
|---:|---|---|---|
| 1 | Découverte du besoin et du jumeau numérique | Identification des composants | Cahier des charges initial |
| 2 | Mission 1 : lecture simulée | Capteur d’humidité sur A0 | Tableau de mesures |
| 3 | Mission 2 : choix du seuil | Calibration sol sec / humide | Seuil justifié |
| 4 | Mission 3 : commande simulée | Relais sur D6, test avec LED | Programme conditionnel |
| 5 | Mission 4 : sécurité du réservoir | Capteur de niveau sur A2 | Test de marche à vide |
| 6 | Mission 5 : économie d’eau | Mesure du débit et temporisation | Calcul de consommation |
| 7 | Mission 6 : décision multicritère | Capteur de lumière sur A1 | Table de vérité |
| 8 | Mission 7 : durabilité | Comparaison résistif / capacitif | Choix argumenté |
| 9 | Mission 8 : intégration | Prototype complet avec pompe | Essais de conformité |
| 10 | Revue de projet | Correction et amélioration | Dossier final |
| 11 | Préparation de l’oral | Démonstration au jury | Soutenance notée |

## Rôles des élèves

- **Responsable sécurité et matériel** : vérifie l’alimentation coupée avant toute modification.
- **Programmeur ou programmeuse** : saisit, teste et commente le programme.
- **Responsable essais et mesures** : applique le protocole et conserve les valeurs.
- **Rapporteur ou rapporteuse** : rédige la synthèse et présente les choix techniques.

## Chaîne d’information

| Fonction | Solution technique |
|---|---|
| Acquérir | Capteur d’humidité, capteur de lumière, capteur de niveau |
| Traiter | Arduino Uno R4 Minima et programme |
| Communiquer | Moniteur série, écran LCD facultatif, alerte |
| Commander | Signal logique envoyé au relais |

## Chaîne d’énergie

| Fonction | Solution technique |
|---|---|
| Alimenter | Alimentation basse tension distincte de la pompe |
| Distribuer | Relais Grove |
| Convertir | Moteur électrique de la pompe |
| Transmettre | Tuyau et circulation de l’eau |
| Agir | Apport d’eau au sol |

## Signal analogique et signal logique

Un **signal analogique** peut prendre de nombreuses valeurs dans un intervalle. Les capteurs branchés sur A0, A1 et A2 produisent des mesures variables.

Un **signal logique ou numérique** prend principalement deux états : `LOW` ou `HIGH`. La sortie D6 commande le relais avec ces deux niveaux.

Le projet établit donc une relation claire :

**mesure analogique → comparaison à un seuil → décision logique → commande d’un actionneur.**

## Matériel par îlot

| Quantité | Élément | Rôle |
|---:|---|---|
| 1 | Arduino Uno R4 Minima | Traiter les informations |
| 1 | Grove Base Shield | Simplifier les connexions |
| 1 | Capteur d’humidité du sol Grove | Mesurer le sol sur A0 |
| 1 | Capteur de lumière Grove | Mesurer la lumière sur A1 |
| 1 | Capteur de niveau ou détecteur d’eau Grove | Surveiller le réservoir sur A2 |
| 1 | Relais Grove | Commander la puissance depuis D6 |
| 1 | LED de test | Vérifier la logique avant la pompe |
| 1 | Pompe basse tension | Déplacer l’eau |
| 1 | Alimentation séparée adaptée | Alimenter la pompe |
| 1 | Tuyau et bac de rétention | Acheminer et contenir l’eau |

## Règles de sécurité

1. Travailler exclusivement en très basse tension continue.
2. Couper les alimentations avant toute modification du câblage.
3. Ne jamais alimenter une pompe directement depuis une broche Arduino.
4. Utiliser une alimentation séparée adaptée à la pompe.
5. Placer l’électronique au-dessus du niveau du réservoir.
6. Réaliser les essais hydrauliques dans un bac de rétention.
7. Faire vérifier le montage avant la mise sous tension.

## Différenciation

### Parcours accompagné

- code partiellement complété ;
- seuils proposés ;
- organigramme fourni ;
- test avec LED avant la pompe ;
- binôme tutoré.

### Parcours autonome

- calibration complète ;
- rédaction du protocole ;
- choix argumenté des seuils ;
- analyse des données dans un tableur.

### Parcours expert

- hystérésis ;
- moyenne glissante des mesures ;
- journalisation CSV ;
- mode manuel et mode automatique ;
- écran LCD Grove ;
- supervision avec Arduino Uno R4 WiFi ou ESP32.

## Grille de soutenance sur 20

| Domaine | Indicateurs | Points |
|---|---|---:|
| Analyse du besoin | Problématique, fonctions et contraintes comprises | 3 |
| Chaînes fonctionnelles | Chaînes d’information et d’énergie correctes | 3 |
| Montage | Câblage exact, propre et sûr | 4 |
| Programme | Mesures, conditions, relais, sécurité et commentaires | 4 |
| Essais | Protocole, résultats, écarts et corrections | 3 |
| Amélioration | Proposition réaliste et argumentée | 1 |
| Communication | Présentation claire et vocabulaire technique | 2 |
| **Total** | | **20** |

## Extension retenue : Réseau informatique du collège

Après stabilisation du Jardin connecté, un second univers sera ajouté au même dépôt.

### Missions prévues

1. Identifier poste client, commutateur, routeur, serveur et point d’accès.
2. Construire une topologie simplifiée du collège.
3. Comprendre adresse IP, masque et passerelle.
4. Simuler l’envoi d’un paquet entre deux salles.
5. Diagnostiquer un câble débranché ou défectueux.
6. Corriger une adresse IP incompatible.
7. Utiliser un testeur de câble RJ45.
8. Distinguer réseau pédagogique et réseau administratif.
9. Produire une fiche de diagnostic.
10. Rétablir le réseau du collège dans un défi final noté.

### Outils envisagés

- Filius ou Packet Tracer ;
- câbles RJ45 courts ;
- commutateurs Ethernet de démonstration ;
- testeur de câble ;
- nouveau jumeau numérique TechnoQuest.
