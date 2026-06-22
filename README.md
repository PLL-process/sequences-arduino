# TechnoQuest – Jardin connecté

Projet pédagogique de technologie destiné en priorité à la **classe de 4e**, dans le cadre du **programme de technologie du cycle 4 publié au BO n° 9 du 29 février 2024**. Il associe un jumeau numérique interactif, une programmation Python pédagogique et des manipulations réelles avec Arduino Uno R4 Minima et modules Grove.

## Problématique

Lors des périodes chaudes en Guadeloupe ou en Martinique, un arrosage manuel peut être oublié ou gaspiller de l’eau.

> Comment concevoir un système capable d’arroser uniquement lorsque cela est nécessaire, tout en protégeant la pompe et en limitant la consommation d’eau et d’énergie ?

## Objectifs

Concevoir, programmer, tester et améliorer un système d’arrosage automatique capable de :

- mesurer l’humidité du sol ;
- surveiller le niveau du réservoir ;
- prendre une décision à partir de plusieurs données ;
- commander une pompe en très basse tension à travers un relais ;
- éviter la marche à vide lorsque le réservoir est insuffisant ;
- limiter la durée d’arrosage afin d’économiser l’eau ;
- communiquer son état à l’utilisateur ;
- être diagnostiqué, recalibré et amélioré.

## Apports de la version enrichie

La version actuelle ajoute :

- une situation déclenchante et une problématique explicites ;
- un ancrage clair dans le programme 2024 de technologie en 4e ;
- les définitions du signal analogique, du signal logique et des niveaux `LOW = 0` / `HIGH = 1` ;
- un mini-défi sur la chaîne d’information et la chaîne d’énergie ;
- trois niveaux de différenciation : **guidé**, **intermédiaire** et **expert** ;
- des critères de réussite visibles avant la validation ;
- des seuils d’humidité, de réservoir et de luminosité paramétrables ;
- une courbe d’humidité et un historique des essais ;
- un schéma fonctionnel de câblage ;
- une liste de contrôle de sécurité avant mise sous tension ;
- une vue professeur avec les programmes, réponses et tentatives ;
- des exports CSV et JSON, ainsi qu’une impression en PDF ;
- la migration automatique de l’ancienne progression enregistrée dans le navigateur.

## Parcours pédagogique

Le projet alterne sept formes de pratique :

1. **Observer** une situation et les données des capteurs.
2. **Analyser** les signaux et les chaînes fonctionnelles.
3. **Simuler** le comportement dans un jumeau numérique.
4. **Paramétrer et compléter** un programme fourni.
5. **Câbler** un capteur ou un actionneur Grove en respectant les règles de sécurité.
6. **Tester et mesurer** sur un prototype réel.
7. **Argumenter et améliorer** la solution au regard de la sécurité et du développement durable.

## Missions et barème

| Mission | Intitulé | Points |
|---:|---|---:|
| 1 | Observer les signaux | 2 |
| 2 | Calibrer un seuil | 2 |
| 3 | Analyser les chaînes | 3 |
| 4 | Protéger la pompe | 3 |
| 5 | Économiser l’eau | 3 |
| 6 | Décider avec trois données | 3 |
| 7 | Améliorer la durabilité | 2 |
| 8 | Défi ingénieur | 2 |
|  | **Total** | **20** |

## Compétences principalement travaillées

- Décrire et caractériser l’organisation interne d’un objet ou d’un système technique et ses échanges avec son environnement.
- Identifier les constituants des chaînes d’information et d’énergie et les associer à leurs fonctions.
- Collecter, représenter et analyser des données issues d’un système technique.
- Comprendre, compléter, tester et modifier un programme associé à une fonctionnalité.
- Valider une solution par simulation ou par un protocole de tests.
- Repérer et expliquer les choix de conception liés à la sécurité et au développement durable.
- CRCN : création de contenus – programmer ; informations et données – gérer et traiter des données.

## Contenu du dépôt

| Dossier ou fichier | Contenu |
|---|---|
| `index.html`, `styles.css`, `app.js` | Jumeau numérique, missions, différenciation, critères et exports |
| `arduino/` | Programmes Arduino progressifs et commentés |
| `docs/enseignant/` | Séquence complète et organisation des séances |
| `docs/eleve/` | Carnet de missions guidé |
| `docs/evaluation/` | Grille sommative sur 20 |
| `docs/materiel/` | Nomenclature, câblage et sécurité |
| `docs/reseau/` | Préparation du second univers « Réseau du collège » |

## Lancer la simulation

Le site peut être ouvert directement avec `index.html`. Pour éviter certaines restrictions du navigateur, il est préférable d’utiliser un petit serveur local :

```bash
# Se placer dans le dossier du projet.
cd sequences-arduino

# Démarrer un serveur web local sur le port 8000.
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans un navigateur récent.

## Matériel de base par îlot

- Arduino Uno R4 Minima ;
- Grove Base Shield ;
- capteur d’humidité du sol Grove sur A0 ;
- capteur de luminosité Grove sur A1 ;
- capteur de niveau ou détecteur d’eau Grove sur A2 ;
- relais Grove sur D6 ;
- LED de test ou pompe basse tension avec alimentation séparée ;
- câbles Grove et câble USB-C ;
- bac de rétention et support permettant de placer l’électronique en hauteur.

## Sécurité

Le projet reste exclusivement en **très basse tension continue**.

- L’alimentation est coupée avant toute modification du câblage.
- La pompe ou le moteur ne doit jamais être alimenté directement par une broche Arduino.
- Les essais avec circulation d’eau sont réalisés dans un bac de rétention.
- L’électronique est placée en hauteur et à distance des projections.
- Le professeur vérifie le montage avant la mise sous tension.

## Données et respect de la vie privée

Les noms, programmes, réponses et résultats sont enregistrés uniquement dans le stockage local du navigateur. Aucun serveur distant ne reçoit les données. L’élève ou l’enseignant peut exporter les résultats en CSV ou les preuves complètes en JSON, puis effacer la progression.

## Publication

Le workflow GitHub Actions inclus publie automatiquement le site sur GitHub Pages après chaque mise à jour de la branche `main`.

## Référence institutionnelle

Programme de technologie du cycle 4, Bulletin officiel n° 9 du 29 février 2024, ministère de l’Éducation nationale et de la Jeunesse.

## Licences

- Code : licence MIT.
- Documents pédagogiques : licence Creative Commons Attribution 4.0 International.
