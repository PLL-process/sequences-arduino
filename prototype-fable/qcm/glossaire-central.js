/* TechnoQuest — GLOSSAIRE CENTRAL des mots techniques.
   Source unique des définitions, réutilisée par :
   - les infobulles accessibles (infobulles.js) ;
   - le panneau « Glossaire des mots techniques » du moteur QCM ;
   - tout futur module (fiches, impression, aide).
   Définitions courtes, exactes, niveau collège (cycle 4).
   Aucune balise HTML : du texte pur, mis en forme par les consommateurs. */
"use strict";
window.TechnoQuestGlossaire = {
    "sketch": "Programme Arduino enregistré dans un fichier portant l’extension .ino.",
    "téléverser": "Envoyer le programme compilé depuis l’ordinateur vers la mémoire de la carte Arduino.",
    "compiler": "Traduire le programme C++ en instructions que le microcontrôleur peut exécuter, en vérifiant la syntaxe.",
    ".ino": "Extension des fichiers de programme Arduino, ouverts par l’IDE Arduino.",
    "ADC": "Convertisseur analogique-numérique : il transforme une tension en nombre (0 à 1023 en 10 bits). En français : CAN.",
    "CAN": "Convertisseur analogique-numérique (en anglais ADC) : il transforme une tension en nombre entier.",
    "signal analogique": "Signal qui peut prendre toutes les valeurs intermédiaires possibles, comme la tension d’un capteur d’humidité.",
    "signal logique": "Signal qui ne connaît que deux états : LOW (0) ou HIGH (1).",
    "seuil": "Valeur de référence à laquelle on compare une mesure pour prendre une décision.",
    "calibration": "Série de mesures dans des situations connues (sol sec, sol humide) qui permet de choisir un seuil pertinent.",
    "hystérésis": "Décision à deux seuils avec mémorisation : on démarre sous le seuil bas, on arrête au-dessus du seuil haut, et entre les deux on conserve l’état précédent.",
    "relais": "Composant commandé par un signal logique qui laisse passer ou coupe l’énergie d’un circuit séparé, comme celui de la pompe.",
    "capteur": "Composant qui transforme une grandeur physique (humidité, lumière, niveau) en signal électrique exploitable.",
    "actionneur": "Composant qui agit sur le monde réel à partir d’un ordre, comme la pompe qui fait circuler l’eau.",
    "variable": "Emplacement nommé et typé dont la valeur peut changer pendant l’exécution du programme.",
    "constante": "Valeur nommée qui ne change pas pendant l’exécution, déclarée avec const.",
    "variable globale": "Variable déclarée en dehors des fonctions : elle conserve sa valeur entre deux passages dans loop().",
    "boucle": "Portion de programme répétée : sur Arduino, la fonction loop() se répète tant que la carte est alimentée.",
    "condition": "Test qui oriente le programme : if (…) { … } else { … }.",
    "opérateur logique": "Symbole qui relie des conditions : && (ET) exige que tout soit vrai, || (OU) qu’au moins une le soit.",
    "setup()": "Fonction exécutée une seule fois au démarrage de la carte : elle prépare la communication et les broches.",
    "loop()": "Fonction exécutée en continu après setup() : elle contient les actions répétées du programme.",
    "Moniteur Série": "Fenêtre de l’IDE Arduino qui affiche les messages envoyés par la carte avec Serial.print et Serial.println.",
    "baud": "Unité de vitesse de la communication série : 9600 bauds dans ce projet, à régler pareil des deux côtés.",
    "algorigramme": "Représentation graphique normalisée d’un algorithme : ovales, rectangles, parallélogrammes, losanges et flèches.",
    "algorithme": "Suite ordonnée d’actions qui décrit la solution d’un problème, indépendamment du langage.",
    "marche à vide": "Fonctionnement d’une pompe sans eau : elle s’échauffe et s’use — c’est ce que la sécurité du réservoir évite.",
    "durabilité": "Capacité d’un objet technique à fonctionner longtemps : elle dépend du choix des composants, de la maintenance et de la réparabilité.",
    "maintenance": "Ensemble des actions (vérification, nettoyage, recalibration, remplacement) qui maintiennent un système en bon état.",
    "TBT": "Très basse tension : domaine de tension sans danger utilisé pour alimenter la pompe via une alimentation séparée."
};
