# TechnoQuest – Jardin connecté

Projet pédagogique de technologie pour le cycle 4, associant une simulation web engageante et des manipulations réelles avec Arduino Uno R4 Minima et modules Grove.

## Objectif

Concevoir, programmer, tester et améliorer un système d’arrosage automatique capable de :

- mesurer l’humidité du sol ;
- décider si un arrosage est nécessaire ;
- commander une pompe en très basse tension ;
- éviter la marche à vide lorsque le réservoir est insuffisant ;
- limiter la durée d’arrosage afin d’économiser l’eau ;
- communiquer son état à l’utilisateur.

## Parcours pédagogique

Le projet alterne cinq formes de pratique :

1. **Simuler** une situation et prévoir le comportement du système.
2. **Câbler** un capteur ou un actionneur Grove.
3. **Programmer** l’Arduino Uno R4 Minima.
4. **Tester et mesurer** sur un prototype réel.
5. **Analyser et améliorer** la solution en justifiant les choix.

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| `index.html`, `styles.css`, `app.js` | Simulateur pédagogique et missions notées |
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
cd technoquest-jardin

# Démarrer un serveur web local sur le port 8000.
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Matériel de base par îlot

- Arduino Uno R4 Minima ;
- Grove Base Shield ;
- capteur d’humidité du sol Grove sur A0 ;
- capteur de luminosité Grove sur A1 ;
- capteur de niveau ou détecteur d’eau Grove sur A2 ;
- relais Grove sur D6 ;
- LED de test ou pompe basse tension avec alimentation séparée ;
- câbles Grove et câble USB-C.

## Sécurité

Le projet reste exclusivement en **très basse tension continue**. Une pompe ou un moteur ne doit jamais être alimenté directement par une broche Arduino. Les essais avec circulation d’eau sont réalisés dans un bac de rétention, avec l’électronique placée en hauteur et l’alimentation coupée avant toute modification du câblage.

## Publication

Le workflow GitHub Actions inclus publie automatiquement le site sur GitHub Pages après fusion sur `main`.

## Licences

- Code : licence MIT.
- Documents pédagogiques : licence Creative Commons Attribution 4.0 International.
