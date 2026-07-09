# Template réutilisable de séance TechnoQuest

Ce dossier contient une **référence de structure**, autonome et directement consultable dans le navigateur. Il sert à préparer ou harmoniser une séance avant son intégration dans les moteurs de production du dépôt.

## État réel du projet au moment de la création

Le rapport externe ayant motivé ce travail contient plusieurs observations pertinentes sur la charge cognitive, la navigation globale et l’intérêt d’un algorigramme. En revanche, certains constats ne correspondent plus à l’état actuel du dépôt :

- le **Mode Mission** existe dans les huit séances ;
- le retour au **Mode Classique** est déjà prévu ;
- trois niveaux d’aide sont proposés : **Guidé**, **Standard/Accompagné** et **Autonome** ;
- le moteur applique une **validation automatique** du programme ;
- un **moniteur série simulé** existe dans le Mode Mission et dans l’exécution pédagogique classique ;
- les huit séances partagent déjà un moteur commun de contenus et de sauvegarde.

Le template ne remplace donc pas `parcours-premium.js`, `session-code-v3.js` ni les fichiers du dossier `mission-mode/`. Il formalise une structure commune et fournit une maquette isolée pour tester de nouveaux contenus.

## Fichiers

| Fichier | Rôle |
|---|---|
| `session-template.html` | Structure complète d’une séance type. |
| `session-template.css` | Design responsive et accessible du template. |
| `session-template.js` | Composants interactifs, sauvegarde locale, validation et moniteur série. |
| `session-template.config.example.js` | Exemple de configuration pour la séance 2. |

## Fonctionnalités incluses

- en-tête avec séance courante et progression globale ;
- bascule Mode Classique / Mode Mission ;
- six phases constantes : Explorer, Comprendre, Programmer, Tester, Réfléchir, Valider ;
- jumeau numérique simplifié comme emplacement de démonstration ;
- algorigramme visuel avec surbrillance séquentielle ;
- éditeur C++ Arduino ;
- trois niveaux d’aide ;
- validation automatique configurable ;
- moniteur série simulé ;
- micro-objectifs « Je sais faire… » ;
- réponse réflexive sauvegardée localement ;
- grille d’évaluation sur 20 en Mode Mission ;
- copie et téléchargement du fichier `.ino` ;
- navigation précédente / suivante ;
- responsive tablette et téléphone ;
- prise en charge de `prefers-reduced-motion`.

## Utilisation recommandée

### 1. Préparer une nouvelle configuration

Dupliquer :

```text
session-template.config.example.js
```

Puis renommer le fichier, par exemple :

```text
session-4.config.js
```

Modifier l’objet `window.TechnoQuestSessionTemplateConfig` :

- `id`, `title`, `subtitle`, `context` ;
- `objectives` ;
- `algorithm` ;
- `starters.guided`, `starters.standard`, `starters.autonomous` ;
- `simulation` ;
- `checks` ;
- `assessment` ;
- liens précédent, suivant et parcours.

### 2. Créer la page de prévisualisation

Dupliquer `session-template.html`, puis remplacer :

```html
<script src="session-template.config.example.js?v=1"></script>
```

par :

```html
<script src="session-4.config.js?v=1"></script>
```

Le moteur `session-template.js` ne doit normalement pas être modifié pour une nouvelle séance.

### 3. Valider la séance avant intégration

Vérifier au minimum :

1. le passage entre les trois niveaux d’aide ;
2. les expressions régulières de `checks` avec un programme incomplet puis complet ;
3. les lignes du moniteur série ;
4. la cohérence entre algorigramme, code et simulation ;
5. le score maximal de la grille, qui doit totaliser 20 points ;
6. l’affichage sur ordinateur, tablette et téléphone ;
7. la navigation au clavier ;
8. la sauvegarde et le rechargement de la page.

## Structure type à conserver dans les huit séances

| Phase | Intention pédagogique | Composants attendus |
|---|---|---|
| 1. Explorer | Comprendre la situation et observer le système | contexte, objectifs, jumeau numérique |
| 2. Comprendre | Passer du fonctionnement à l’algorithme | algorigramme, notions courtes |
| 3. Programmer | Traduire l’algorithme en code | niveaux d’aide, éditeur, exécution |
| 4. Tester | Recevoir un retour immédiat | validation automatique, micro-objectifs |
| 5. Réfléchir | Expliquer et transférer | réponse argumentée, sauvegarde |
| 6. Valider | Évaluer sans confondre vitesse et réussite | critères explicites sur 20 |

## Règle d’intégration dans le projet existant

Le dépôt possède déjà une architecture dynamique. Lorsqu’une séance préparée avec ce template est validée, il faut **transférer ses données et ses composants utiles vers les moteurs communs existants**, plutôt que publier huit copies indépendantes du moteur du template.

En pratique :

- les contenus pédagogiques vont dans la configuration commune de la séance ;
- les squelettes et validations rejoignent `session-code-v3.js` ou `mission-mode/mission-data.js` ;
- l’algorigramme peut devenir un composant commun chargé par les huit séances ;
- le moniteur série doit continuer à utiliser le moteur Mission existant ;
- les styles réellement retenus doivent être mutualisés dans une feuille commune.

## Limites volontaires de la maquette

- le jumeau numérique du template est une représentation simplifiée ;
- le moteur n’interprète pas l’intégralité du langage C++ ;
- la validation repose sur des motifs configurables ;
- la compilation réelle reste effectuée dans l’IDE Arduino ;
- cette page ne doit pas remplacer directement les pages publiques avant une phase de migration et de tests.
