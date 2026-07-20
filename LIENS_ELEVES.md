# Liens officiels à transmettre aux élèves

> **Référence permanente :** mettre à jour ce fichier à chaque publication d’une nouvelle version (le SHA des liens « dernière version » change à chaque poussée sur la branche).

## Liens élèves — parcours séquentiel (dernière version complète)

Ces liens pointent vers la version la plus récente du parcours vertical séquentiel
(commit `eceba3b`). Elle comprend : programmes C++ Arduino, algorithmes colorés et
algorigrammes, QCM de 20 questions avec corrections détaillées (longueurs
rééquilibrées), sons discrets optionnels du jumeau, badge de fin de séance
imprimable, export du bilan élève et affichage « sobre ».

1. **Séance 1 — Observer les signaux**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-1-verticale.html

2. **Séance 2 — Calibrer un seuil**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-2-verticale.html

3. **Séance 3 — Analyser les chaînes**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-3-verticale.html

4. **Séance 4 — Protéger la pompe**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-4-verticale.html

5. **Séance 5 — Économiser l’eau**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-5-verticale.html

6. **Séance 6 — Décider avec trois données**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-6-verticale.html

7. **Séance 7 — Améliorer la durabilité**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-7-verticale.html

8. **Séance 8 — Défi ingénieur**  
   https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/seance-8-verticale.html

## Tableau de bord enseignant (à ne pas transmettre aux élèves)

- **Tableau de bord :**  
  https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/tableau-de-bord.html

Page 100 % locale : elle agrège les fichiers `bilan_….json` exportés par les
élèves (glisser-déposer ou collage de codes `TQB1:`), affiche la vue classe, la
vue séance (questions les plus ratées) et la vue élève, exporte en CSV et
détecte les bilans modifiés après export. Les bilans chargés sont mémorisés
dans le navigateur de l’enseignant ; rien n’est envoyé sur Internet.

## Autres liens utiles (enseignant)

- **Aperçu des 8 algorigrammes :**  
  https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/apercu-algorigrammes.html
- **Comparaison présentation classique / verticale :**  
  https://raw.githack.com/PLL-process/sequences-arduino/eceba3b6809f37f59c8f6aced0186966ebacc96e/prototype-fable/comparaison.html
- **Branche de travail sur GitHub :**  
  https://github.com/PLL-process/sequences-arduino/tree/prototype/fable-ameliorations-eleves-v3

## Liens stables GitHub Pages (version intégrée à `main`)

`main` contient le parcours vertical jusqu’au commit `59a848b` : ces adresses ne
changent jamais, mais elles n’incluent **pas encore** le dernier lot (sons,
badge, bilan, tableau de bord, affichage sobre, QCM rééquilibré) tant que la
branche n’est pas fusionnée dans `main`.

- **Accueil du parcours :** https://pll-process.github.io/sequences-arduino/
- **Les 8 séances (classique) :** https://pll-process.github.io/sequences-arduino/parcours.html
- **Séances verticales :** https://pll-process.github.io/sequences-arduino/prototype-fable/seance-1-verticale.html … `seance-8-verticale.html`

## Consigne de publication

Les liens « dernière version » contiennent un SHA de commit : ils figent
exactement cette version (les élèves ne verront jamais une page changer sous
leurs yeux en cours de séance). À chaque nouvelle poussée sur la branche, le
SHA change : remettre ce fichier à jour. Après fusion de la branche dans
`main`, remplacer ces liens par les adresses GitHub Pages stables ci-dessus.
