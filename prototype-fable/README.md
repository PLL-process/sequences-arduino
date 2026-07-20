# Prototype Fable — Parcours vertical séquentiel (séance 1)

Branche : `prototype/fable-parcours-vertical-sequentiel` (créée depuis le commit stable `563835f`).

Ce dossier contient une proposition d'ergonomie alternative pour la séance 1 de
TechnoQuest — Jardin connecté : une lecture **verticale, continue et
séquentielle**, du haut vers le bas, sans serpentin. C'est une exploration de
design isolée : rien ne remplace la version actuelle, qui reste consultable à
l'identique pour comparaison.

## Consulter le prototype

Servir le dépôt localement (par exemple `python3 -m http.server`) puis ouvrir :

| Page | Rôle |
|---|---|
| `prototype-fable/seance-1-verticale.html` | La séance 1 complète en parcours vertical |
| `prototype-fable/comparaison.html` | Version actuelle et proposition côte à côte |
| `prototype-fable/modele-seance-verticale.html` | Modèle abstrait réutilisable pour les séances 2 à 8 |
| `seance-1.html` | La version actuelle, strictement inchangée |

Les deux versions partagent les mêmes scripts et les mêmes clés de sauvegarde
locale (`technoquest-premium-v1`, `technoquest-mission-v1`) : le travail d'un
élève est visible dans l'une comme dans l'autre, aucune donnée n'est perdue.

## La hiérarchie et le parcours 1 → 7

L'ordre du DOM, l'ordre visuel et l'ordre pédagogique sont identiques. La page
est une colonne unique (`min(1120px, 100%)`) découpée en sept sections
`.fv-part`, chacune ouverte par une pastille turquoise, un titre, un objectif
court et le repère « Partie X sur 7 », et fermée par une transition rédigée avec
un bouton « Continuer » :

1. **Découvrir la mission** — héros de séance + composants / compétences /
   résultat attendu ; le déroulé détaillé est replié.
2. **Observer le système** — le jumeau numérique (inchangé) avec consigne,
   grandeurs observées et trois questions courtes dépliables.
3. **Comprendre le programme Arduino** — A. structure (sans le mot
   « algorigramme »), B. algorithme textuel en verbes non numérotés
   (INITIALISER → LIRE → MÉMORISER → AFFICHER → SÉCURISER → ATTENDRE →
   RECOMMENCER), C. algorigramme fidèle au programme réel : DÉBUT →
   INITIALISER → boucle [LIRE ET MÉMORISER → AFFICHER → MAINTENIR LA POMPE
   ARRÊTÉE → ATTENDRE → flèche de retour]. Aucun losange : aucune condition
   `if` n'existe dans cette séance, et la légende l'explique.
4. **Programmer en mode Mission** — lanceur pleine largeur du mode Mission
   (écran complet existant) + éditeur classique ; l'aide d'écriture pas à pas
   est repliée par défaut.
5. **Tester et interpréter** — bouton de vérification simulée et son résultat,
   protocole de tests, réponse argumentée ; barème et correction complète
   repliés mais intacts.
6. **Passer de la simulation au montage réel** — contenu intégral ; les étapes
   sont marquées par des pictogrammes (🔌 📋 🛠️ 🖥️ 👀 🛑) au lieu d'une
   nouvelle série 1-7 ; les durées restent visibles mais secondaires.
7. **QCM de fin de séance** — QCM intégral ; badges Q1…Q20 ; après correction,
   la bonne réponse est surlignée, la réponse choisie à tort est repérée et
   l'explication apparaît en « À retenir ».

Une barre de progression collante (ancres internes vers les sept parties, avec
surlignage de la partie visible) accompagne le défilement. Les grands numéros
1 à 7 sont réservés aux parties : les anciens numéros de section des cartes
sont masqués par CSS, les questions portent des badges « Q », les étapes du
montage réel des pictogrammes.

## Les éléments conservés (tous)

- **Jumeau numérique** : SVG, capteurs A0/A1/A2, Arduino, relais, pompe,
  réservoir, tuyaux, chaînes, animations, boutons Lancer/Arrêter, bascule
  « Voir le montage réel », navigation par composant — le conteneur `.card`
  est déplacé tel quel, rien à l'intérieur n'est modifié.
- **Mode Mission** : ses quatre niveaux, validateur, suggestions, aides,
  sauvegardes, progression, messages, boutons, raccourcis, panneau de
  récupération, migrations. Son conteneur `#missionModeRoot` n'est même pas
  déplacé (il doit rester frère de `.session-shell` pour l'écran complet).
- **Programmes et algorithmes** : squelettes Guidé/Standard/Autonome, programme
  de référence, commentaires, constantes, noms de variables — affichés, jamais
  réécrits.
- **QCM** : 10 questions essentielles + 10 d'approfondissement, scores,
  correction, question métacognitive, sauvegarde de brouillon.
- **Barème /20, correction exhaustive, protocole de tests, réponse argumentée,
  relevés expérimentaux, copie du code, téléchargement du `.ino`.**

## Les éléments uniquement déplacés

Le fichier `parcours-vertical.js` ne fait que des déplacements de conteneurs
(`appendChild` conserve les écouteurs d'événements) et des ajouts de
présentation :

| Élément existant | Avant | Après |
|---|---|---|
| `.session-hero` | haut de page | Partie 1 |
| carte « Mission élève » + `.lesson-path` | colonne droite / bandeau | Partie 1, repliés |
| carte du jumeau numérique | grille 2 colonnes, gauche | Partie 2 |
| carte algorithme (`.cpp-algo-shell`) | grille 2 colonnes, gauche | Partie 3, documentation repliée |
| `.course-note` (structure C++) | dans la carte éditeur | Partie 3, cours replié |
| carte éditeur | grille 2 colonnes, droite | Partie 4 |
| bouton `#runCode` + `#codeRunStatus` | dans la carte éditeur | Partie 5 |
| carte protocole de tests | grille 2 colonnes basse | Partie 5 |
| carte barème | grille 2 colonnes basse | Partie 5, repliée |
| carte montage réel | `#s1PracticalSection`, gauche | Partie 6 |
| carte QCM | `#s1PracticalSection`, droite | Partie 7 |

Particularité technique : les parties 6 et 7 sont insérées **à l'intérieur** de
`#s1PracticalSection` (déplacé au bon endroit du flux), car le gestionnaire de
correction du QCM recherche ses questions dans cette section.

Seules retouches de texte (présentation des titres, autorisée par la mission) :
le titre de la carte éditeur devient « Écrire le programme C++ Arduino » et le
titre interne « Partie 2 — L'algorigramme… » devient « Le déroulement détaillé
du programme Arduino » pour ne pas entrer en conflit avec la numérotation des
sept parties.

## Les choix responsive

Testé à 1920×1080, 1366×768, 768×1024, 390×844 et à l'équivalent d'un zoom de
200 % : `scrollWidth − clientWidth = 0` partout (aucun défilement horizontal de
page ; le tableau de relevés défile à l'intérieur de son conteneur).
La colonne unique conserve le même ordre à toutes les tailles ; les grilles
internes (intro, grandeurs, structure) passent de 3-4 colonnes à 1-2 puis 1 ;
le rail de progression défile horizontalement au doigt ; les zones repliables
sont des `details/summary` natifs, accessibles au clavier ; l'ordre de
tabulation suit l'ordre visuel puisque le DOM n'est jamais réordonné
visuellement par CSS.

## Révision 2 — compacité et petit écran (ergonomie uniquement)

Suite à la première revue, un second commit exclusivement ergonomique ajoute,
sans toucher à la moindre logique :

- **Rail mobile vertical** : sous 900 px, le rail horizontal disparaît au
  profit d'un indicateur compact « Partie X sur 7 » + titre courant + barre de
  progression à sept segments, avec un bouton ☰ dépliant la liste verticale
  des sept parties. La rangée de pastilles reste réservée aux grands écrans.
- **En-tête mobile compact** : sous 650 px, seuls la marque et le bouton
  « Activer le Mode Mission » restent visibles ; Précédente / 8 séances /
  Suivante / Imprimer se replient derrière un bouton ⋯ (rien n'est supprimé).
- **Partie 4 clarifiée** : le mode Mission est étiqueté « Parcours
  recommandé » ; l'éditeur classique devient une « Alternative » repliée par
  défaut — il conserve tous ses comportements une fois déplié, et le mode
  Mission le restitue à sa place au retour.
- **Longueur perçue réduite** : chaque partie possède un bouton
  Replier / Déplier dans son en-tête (jamais repliée par défaut, et tout se
  déplie à l'impression) ; les questions d'observation fonctionnent en
  accordéon (une seule ouverte à la fois).

## Révision 3 — extension du parcours vertical aux séances 2 à 8

À la demande de la revue, les séances 2 à 8 reçoivent le même traitement, avec
un orchestrateur générique (`parcours-vertical-2a8.js`) et sept pages
`seance-2-verticale.html` … `seance-8-verticale.html`. Ces séances n'ayant ni
section « montage réel » ni QCM, leur parcours comporte **cinq parties** :
Découvrir la mission → Observer le système → Comprendre l'algorithme →
Programmer et exécuter → Tester et interpréter (repère « Partie X sur 5 »).

Mêmes conventions que la séance 1 : pastilles réservées aux parties, rail
compact sur mobile, en-tête mobile réduit, mode Mission en « Parcours
recommandé », éditeur classique en « Alternative » repliée, barème replié,
parties refermables. Les contenus pédagogiques des séances 2 à 8 ne sont pas
réécrits : leurs cartes existantes (jumeau, algorithme coloré, éditeur avec
exécution pédagogique, protocole, barème) sont déplacées telles quelles, et
l'exécution du programme reste dans la carte éditeur (elle anime le jumeau et
doit rester proche de lui). `comparaison.html` gagne un sélecteur de séance
1 à 8.

Vérifications : les sept pages rendent leurs cinq parties dans l'ordre, sans
erreur JavaScript ni défilement horizontal ; sur la séance 2 (câblage identique
aux suivantes) : démonstration du jumeau, exécution pédagogique, aller-retour
mode Mission, restitution de l'éditeur dans son pli.

## Les composants réutilisables (séances 2 à 8)

`seance-verticale.css` définit un jeu de classes indépendantes de la séance :
`.fv-part`, `.fv-part-head`, `.fv-pastille`, `.fv-part-kicker` (« Partie X sur
7 »), `.fv-transition` + `.fv-continue`, `.fv-rail`, `.fv-fold` (repliable),
`.fv-consigne`, `.fv-intro-grid`, `.fv-grandeurs-grid`, `.fv-q` (question
courte), `.fv-structure-grid`, `.fv-verbes`, `.fv-flowchart` (+ `.fv-oval`,
`.fv-rect`, `.fv-io`, `.fv-loop-zone`, `.fv-return`, `.fv-legende`),
`.fv-mission-launcher`, `.fv-qbadge`.

`modele-seance-verticale.html` montre la maquette abstraite : mêmes sept
parties, mêmes conventions de titres, de numérotation (1-7 réservés aux
parties, badges Q pour les QCM, pictogrammes pour les procédures), de
transitions et de responsive. À partir de la séance 2, l'algorigramme intègre
le losange de décision **uniquement** parce qu'un `if` réel existe alors dans
le programme. Les contenus pédagogiques des séances 2 à 8 ne sont pas réécrits.

## Fichiers créés (liste exacte)

- `prototype-fable/parcours-vertical-2a8.js`
- `prototype-fable/seance-2-verticale.html` … `prototype-fable/seance-8-verticale.html` (7 pages)

- `prototype-fable/seance-1-verticale.html`
- `prototype-fable/parcours-vertical.js`
- `prototype-fable/seance-verticale.css`
- `prototype-fable/comparaison.html`
- `prototype-fable/modele-seance-verticale.html`
- `prototype-fable/README.md`

## Fichiers modifiés (liste exacte)

Aucun. `git diff 563835f --stat` ne montre que des ajouts dans
`prototype-fable/`. Ni `seance-1.html`, ni `parcours-premium.js/css`, ni les
fichiers `mission-mode/*`, ni les fichiers `twin-*` n'ont été touchés.

## Confirmation de non-régression

Vérifications automatisées (Playwright) exécutées sur le prototype :
démonstration du jumeau (lancer/arrêter), vérification simulée du programme
(10 contrôles rendus), niveaux d'aide, panneau d'aide, correction du QCM
(score, surlignage, explication), sauvegarde du brouillon, ouverture du mode
Mission plein écran, retour au mode classique avec restitution de l'éditeur et
du jumeau à leur place dans le parcours, persistance après rechargement et
lecture croisée des mêmes sauvegardes par `seance-1.html`. Aucune erreur
JavaScript en console.

Observation (comportement identique dans les deux versions, donc antérieur au
prototype et volontairement non corrigé ici) : l'activation du mode Mission
réinitialise `practicalV1` (réponses QCM) dans `technoquest-premium-v1`. À
discuter séparément de cette proposition d'ergonomie.

## Révision 4 — sons, badge, bilan + tableau de bord, affichage sobre

Quatre fonctions optionnelles, purement additives (aucune logique existante
modifiée), câblées sur les 16 pages (8 classiques + 8 verticales) :

- **Sons discrets du jumeau** (`sons-jumeau-v3.js`) : ronronnement grave de la
  pompe et gouttes d'eau synthétisés en Web Audio (aucun fichier son),
  uniquement pendant la démonstration et uniquement si l'élève a activé le
  bouton 🔇/🔊 de l'écrin du jumeau. Désactivé par défaut, préférence mémorisée
  (`technoquest-preferences-v1`).
- **Badge de fin de séance imprimable** (`badge-seance-v3.js`) : après
  validation du QCM, un bouton « 🏅 Imprimer mon badge de séance » compose une
  carte (rosette avec le score /20, coches de progression réelles, date, ligne
  de signature) et l'imprime seule. Le nom de l'élève est demandé une fois puis
  mémorisé dans son profil.
- **Export du bilan élève** (`bilan-eleve-v3.js`) : « 📤 Exporter mon bilan »
  produit un fichier `bilan_<nom>_<classe>_seance-N.json` scellé par une somme
  de contrôle (djb2), plus un code `TQB1:…` copié dans le presse-papiers pour
  les ENT où déposer un fichier est difficile. Contenu : progression, QCM
  (score, réponses), code C++, réponse argumentée.
- **Tableau de bord enseignant** (`tableau-de-bord.html` + `.js`) : page 100 %
  locale (aucune donnée envoyée sur Internet) qui agrège les bilans par
  glisser-déposer de fichiers ou collage de codes. Vue classe (grille élèves ×
  séances, score /20, points de progression, moyennes), vue séance (questions
  triées des plus ratées aux mieux réussies, avec les intitulés lus dans les
  fichiers QCM), vue élève (réponses détaillées, code C++, réponse argumentée,
  alerte « ⚠ modifié » si la somme de contrôle ne correspond plus), export CSV
  (compatible Excel/LibreOffice français) et impression. Les bilans chargés
  sont mémorisés dans le navigateur de l'enseignant ; un bouton « Voir avec des
  données d'exemple » montre le fonctionnement avec trois élèves fictifs, sans
  rien enregistrer.
- **Mode « faible distraction »** (`mode-sobre-v3.js`) : bascule
  « 🎯 Affichage sobre » dans la barre du haut — fonds en aplats, suppression
  des ombres, halos, reflets et transitions décoratives, couleurs adoucies.
  Les animations pédagogiques du jumeau (signaux, eau, rotor) restent actives,
  car elles portent du sens. Préférence mémorisée, appliquée dès le chargement.

Tests automatisés (Playwright) : 60 contrôles du lot (activation des sons sans
erreur, badge construit puis nettoyé après impression, bilan téléchargé avec
somme de contrôle vérifiée, déduplication et alerte d'intégrité du tableau de
bord, CSV, persistance, mode sobre conservé après rechargement, zéro
débordement horizontal à 390 px) + fumée sur les 16 pages et aller-retour du
mode Mission avec QCM conservé. Aucune erreur JavaScript.

Note : l'observation d'une ancienne révision sur la réinitialisation du QCM à
l'activation du mode Mission est obsolète — ce défaut a été corrigé (écriture
en lecture-fusion dans `parcours-premium.js`) et le test d'aller-retour Mission
le vérifie désormais.
