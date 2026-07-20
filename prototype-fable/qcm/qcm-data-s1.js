/* TechnoQuest — QCM de la séance 1 : Observer les signaux.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s1q1 à s1q10 : essentielles · s1q11 à s1q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js.
   legacyChoiceMap : rotation ancien index → nouveau, pour migrer les réponses
   enregistrées avec l’ordre historique des choix. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[1] = {
  session: 1,
  title: "Séance 1 — Observer les signaux",
  questions: [
    {
      id: "s1q1",
      theme: "structure du sketch",
      question: "Quelle fonction s’exécute une seule fois au démarrage ?",
      choices: [
        "setup()",
        "loop()",
        "analogRead()"
      ],
      answer: 0,
      explanation: "setup() est exécutée une seule fois, juste après la mise sous tension ou un reset de la carte : c’est là qu’on prépare les broches et la communication série.",
      whyOthers: [
        "",
        "loop() ne démarre qu’après setup() et se répète ensuite sans arrêt : ce n’est pas une fonction exécutée une seule fois.",
        "analogRead() est une instruction qui lit une entrée analogique, pas une fonction que la carte lance au démarrage."
      ],
      exampleGarden: "Dans le sketch du jardin connecté, setup() lance Serial.begin(9600), configure D6 en sortie et impose digitalWrite(PIN_RELAIS_POMPE, LOW) : tout cela ne se fait qu’une seule fois.",
      exampleOther: "Dans une station météo, setup() sert par exemple à démarrer la communication série avant la toute première mesure.",
      takeaway: "setup() = préparation de la carte, exécutée une seule fois au démarrage."
    },
    {
      id: "s1q2",
      theme: "structure du sketch",
      question: "Quelle fonction se répète tant que la carte est alimentée ?",
      choices: [
        "setup()",
        "loop()",
        "pinMode()"
      ],
      answer: 1,
      explanation: "loop() est appelée en boucle, encore et encore, tant que la carte reste alimentée : c’est le cœur du programme.",
      whyOthers: [
        "setup() n’est exécutée qu’une seule fois au démarrage, pas en continu.",
        "",
        "pinMode() est une instruction de configuration d’une broche, pas une fonction répétée automatiquement par la carte."
      ],
      exampleGarden: "Dans le sketch de la séance, loop() relit sans cesse A0, A1 et A2 puis affiche les trois valeurs : le jardin est surveillé en permanence.",
      exampleOther: "Dans un feu tricolore, c’est aussi une boucle qui enchaîne vert, orange et rouge tant que le feu est alimenté.",
      takeaway: "loop() se répète en continu : c’est elle qui fait vivre l’objet technique."
    },
    {
      id: "s1q3",
      theme: "lecture analogique",
      question: "Quelle instruction lit l’entrée analogique A0 ?",
      choices: [
        "digitalRead(A0)",
        "analogRead(A0)",
        "Serial.read(A0)"
      ],
      answer: 1,
      explanation: "analogRead(A0) mesure la tension présente sur l’entrée analogique A0 et renvoie un nombre : c’est l’instruction prévue pour un signal qui varie.",
      whyOthers: [
        "digitalRead() ne renvoie que deux états, LOW ou HIGH : on perdrait toutes les valeurs intermédiaires du capteur.",
        "",
        "Serial.read() sert à recevoir des données par la liaison série, pas à mesurer une broche de la carte."
      ],
      exampleGarden: "int valeurHumidite = analogRead(PIN_HUMIDITE); lit le capteur d’humidité du sol branché sur A0.",
      exampleOther: "Dans un store automatique, analogRead() lit de la même façon un capteur de lumière pour connaître l’ensoleillement.",
      takeaway: "Entrée analogique = analogRead(), qui renvoie un nombre et pas seulement LOW ou HIGH."
    },
    {
      id: "s1q4",
      theme: "communication série",
      question: "À quoi sert Serial.begin(9600) ?",
      choices: [
        "À alimenter les capteurs",
        "À régler la communication série",
        "À démarrer la pompe"
      ],
      answer: 1,
      explanation: "Serial.begin(9600) ouvre la communication série entre la carte et l’ordinateur, à la vitesse de 9600 bauds, la même que celle choisie dans le Moniteur Série.",
      whyOthers: [
        "L’alimentation des capteurs vient du câblage du montage, pas d’une instruction du programme.",
        "",
        "La pompe est commandée par le relais sur D6 ; Serial.begin() ne pilote aucun actionneur."
      ],
      exampleGarden: "Sans Serial.begin(9600) dans setup(), impossible de voir les mesures de A0, A1 et A2 s’afficher dans le Moniteur Série.",
      exampleOther: "Un robot explorateur utilise aussi Serial.begin() pour envoyer ses mesures de distance à l’ordinateur pendant les essais.",
      takeaway: "Serial.begin(9600) ouvre le dialogue carte-ordinateur ; les deux côtés doivent utiliser la même vitesse."
    },
    {
      id: "s1q5",
      theme: "configuration des broches",
      question: "Quelle instruction prépare D6 comme sortie ?",
      choices: [
        "pinMode(PIN_RELAIS_POMPE, OUTPUT);",
        "analogRead(PIN_RELAIS_POMPE);",
        "Serial.println(PIN_RELAIS_POMPE);"
      ],
      answer: 0,
      explanation: "pinMode(PIN_RELAIS_POMPE, OUTPUT); indique à la carte que la broche D6 servira de sortie, capable d’envoyer LOW ou HIGH vers le module relais.",
      whyOthers: [
        "",
        "analogRead() sert à lire une entrée analogique ; cette instruction ne configure rien et D6 est ici une sortie.",
        "Serial.println(PIN_RELAIS_POMPE) afficherait simplement le numéro de la broche dans le Moniteur Série, sans la configurer."
      ],
      exampleGarden: "Dans setup(), pinMode(PIN_RELAIS_POMPE, OUTPUT); prépare D6 avant d’imposer l’état LOW qui garde la pompe arrêtée.",
      exampleOther: "Dans une alarme de maison, on écrirait de même pinMode(PIN_SIRENE, OUTPUT); pour préparer la broche qui commande la sirène.",
      takeaway: "Avant d’utiliser une broche en sortie, on la déclare avec pinMode(..., OUTPUT) dans setup()."
    },
    {
      id: "s1q6",
      theme: "sécurité de l’actionneur",
      question: "Dans cette préparation, quel état maintient la pompe arrêtée ?",
      choices: [
        "HIGH",
        "A0",
        "LOW"
      ],
      answer: 2,
      explanation: "digitalWrite(PIN_RELAIS_POMPE, LOW) laisse le relais au repos : la pompe reste arrêtée, c’est l’état sûr choisi pour la séance. Cette convention devra être confirmée sur le module relais réel.",
      whyOthers: [
        "HIGH risquerait d’activer le relais, donc de démarrer la pompe, ce qui est interdit pendant la séance 1.",
        "A0 est le nom d’une entrée analogique, pas un état logique qu’on peut écrire sur une sortie.",
        ""
      ],
      exampleGarden: "Dès setup(), le sketch impose LOW sur D6 : même si les capteurs donnent des valeurs étonnantes, la pompe ne peut pas se mettre en marche.",
      exampleOther: "Un portail automatique applique la même idée : au démarrage, le moteur est placé dans un état sûr qui l’empêche de bouger tout seul.",
      takeaway: "Au démarrage, on place l’actionneur dans un état sûr : ici LOW pour garder la pompe arrêtée.",
      legacyChoiceMap: {"0":2,"1":0,"2":1}
    },
    {
      id: "s1q7",
      theme: "variables et types",
      question: "Quel type convient aux valeurs renvoyées par analogRead() ?",
      choices: [
        "int",
        "void",
        "String uniquement"
      ],
      answer: 0,
      explanation: "analogRead() renvoie un nombre entier ; une variable de type int est donc adaptée pour le stocker.",
      whyOthers: [
        "",
        "void signifie « rien » : c’est le type d’une fonction qui ne renvoie pas de valeur, pas un type de variable pour un nombre.",
        "Un texte (String) n’est pas obligatoire : la mesure est d’abord un nombre entier, plus simple à stocker et à comparer."
      ],
      exampleGarden: "int valeurLumiere = analogRead(PIN_LUMIERE); range la mesure de la LDR branchée sur A1 dans une variable entière.",
      exampleOther: "Dans un thermostat de maison, la mesure du capteur de température est aussi rangée dans une variable int avant d’être affichée.",
      takeaway: "Une mesure d’analogRead() se range dans une variable de type int."
    },
    {
      id: "s1q8",
      theme: "communication série",
      question: "Que fait Serial.println(valeurHumidite) ?",
      choices: [
        "Elle mesure l’humidité du sol avec le capteur",
        "Elle affiche la valeur et revient à la ligne",
        "Elle active le relais qui commande la pompe"
      ],
      answer: 1,
      explanation: "Serial.println(valeurHumidite) envoie la valeur de la variable vers le Moniteur Série puis passe à la ligne : chaque mesure s’affiche proprement.",
      whyOthers: [
        "La mesure est faite par analogRead() ; Serial.println() ne fait qu’afficher le nombre déjà stocké dans la variable.",
        "",
        "Le relais est commandé par digitalWrite() sur D6 ; afficher une valeur ne change l’état d’aucune sortie."
      ],
      exampleGarden: "Dans loop(), Serial.println(valeurHumidite) fait apparaître la mesure de A0 dans le Moniteur Série, une valeur par ligne.",
      exampleOther: "Un sonomètre de classe utilise aussi Serial.println() pour afficher le niveau sonore mesuré, ligne après ligne.",
      takeaway: "print affiche ; println affiche puis revient à la ligne."
    },
    {
      id: "s1q9",
      theme: "temporisation",
      question: "Pourquoi ajouter delay(1000) ?",
      choices: [
        "Pour attendre une seconde entre deux mesures",
        "Pour convertir A0 en D6",
        "Pour augmenter la tension"
      ],
      answer: 0,
      explanation: "delay(1000) met le programme en pause pendant 1000 millisecondes, soit une seconde : les mesures restent lisibles au lieu de défiler trop vite.",
      whyOthers: [
        "",
        "Aucune instruction ne « convertit » A0 en D6 : ce sont deux broches différentes, une entrée de mesure et une sortie de commande.",
        "delay() ne modifie aucune tension : il fait seulement attendre le programme."
      ],
      exampleGarden: "À la fin de loop(), delay(1000) laisse une seconde entre deux séries de mesures de A0, A1 et A2 dans le Moniteur Série.",
      exampleOther: "Dans un feu de vélo clignotant, delay() fixe la durée entre l’allumage et l’extinction de la lampe.",
      takeaway: "delay(1000) = pause d’une seconde, car 1000 ms = 1 s."
    },
    {
      id: "s1q10",
      theme: "chaîne d’énergie et relais",
      question: "Pourquoi la pompe ne doit-elle pas être alimentée directement par D6 ?",
      choices: [
        "D6 est une entrée analogique",
        "La pompe n’utilise aucune énergie",
        "D6 fournit seulement une commande logique"
      ],
      answer: 2,
      explanation: "La broche D6 ne délivre qu’un petit signal de commande, LOW ou HIGH : elle ne peut pas fournir l’énergie qu’exige la pompe. Le relais reçoit cet ordre et distribue l’énergie d’une alimentation séparée.",
      whyOthers: [
        "D6 est une broche numérique utilisée ici en sortie de commande, pas une entrée analogique.",
        "La pompe consomme au contraire beaucoup d’énergie : c’est justement pour cela qu’un relais est nécessaire.",
        ""
      ],
      exampleGarden: "Dans le jardin connecté, D6 commande le module relais, et c’est le relais qui laissera passer, plus tard, le courant de la pompe.",
      exampleOther: "Dans une voiture, la petite clé de contact ne fait que commander un relais : c’est lui qui envoie le fort courant au démarreur.",
      takeaway: "Une broche de la carte donne un ordre ; le relais distribue l’énergie de puissance.",
      legacyChoiceMap: {"0":2,"1":0,"2":1}
    },
    {
      id: "s1q11",
      theme: "entrées analogiques",
      question: "A0, A1 et A2 sont principalement utilisées comme…",
      choices: [
        "entrées analogiques",
        "sorties de puissance",
        "ports série"
      ],
      answer: 0,
      explanation: "A0, A1 et A2 reçoivent les signaux analogiques des trois capteurs du projet : humidité du sol, lumière et niveau d’eau. Ce sont des entrées de mesure.",
      whyOthers: [
        "",
        "Ces broches ne fournissent pas d’énergie : elles se contentent de mesurer une tension.",
        "La liaison série passe par d’autres broches et par le câble USB, pas par A0, A1 et A2."
      ],
      exampleGarden: "Dans le sketch de la séance, A0 lit l’humidité du sol, A1 la LDR et A2 le niveau d’eau : trois entrées analogiques.",
      exampleOther: "Sur une manette de jeu, le joystick est aussi branché sur des entrées analogiques pour mesurer son inclinaison.",
      takeaway: "A0, A1 et A2 sont des entrées analogiques : elles servent à mesurer, pas à commander."
    },
    {
      id: "s1q12",
      theme: "sortie numérique",
      question: "D6 est principalement utilisée ici comme…",
      choices: [
        "entrée analogique",
        "sortie numérique",
        "alimentation de la pompe"
      ],
      answer: 1,
      explanation: "D6 envoie un signal logique, LOW ou HIGH, vers le module relais : c’est une sortie numérique de commande.",
      whyOthers: [
        "Les entrées analogiques du projet sont A0, A1 et A2 ; D6 ne sert pas à mesurer.",
        "",
        "D6 ne fournit pas l’énergie de la pompe : elle donne seulement l’ordre au relais, qui gère la puissance."
      ],
      exampleGarden: "digitalWrite(PIN_RELAIS_POMPE, LOW) écrit un état logique sur la sortie D6 pour maintenir le relais au repos.",
      exampleOther: "Dans un sèche-mains automatique, une sortie numérique commande de la même façon le déclenchement de la soufflerie.",
      takeaway: "D6 est une sortie numérique : elle écrit LOW ou HIGH pour donner un ordre."
    },
    {
      id: "s1q13",
      theme: "syntaxe C++",
      question: "Quel symbole termine généralement une instruction C++ ?",
      choices: [
        ":",
        ";",
        "#"
      ],
      answer: 1,
      explanation: "En C++, chaque instruction se termine par un point-virgule : c’est lui qui indique au compilateur où l’instruction s’arrête.",
      whyOthers: [
        "Les deux-points ne terminent pas une instruction en C++ ; ils apparaissent dans d’autres écritures du langage.",
        "",
        "Le symbole # sert au début de lignes spéciales comme #include <Arduino.h>, pas à terminer une instruction."
      ],
      exampleGarden: "Dans le sketch, delay(1000); et digitalWrite(PIN_RELAIS_POMPE, LOW); se terminent par un point-virgule ; l’oublier provoque une erreur à la compilation.",
      exampleOther: "Le programme d’un robot aspirateur écrit en C++ suit la même règle : chaque ordre se termine par un point-virgule.",
      takeaway: "En C++, une instruction se termine par un point-virgule."
    },
    {
      id: "s1q14",
      theme: "commentaires",
      question: "Comment commence un commentaire sur une seule ligne ?",
      choices: [
        "##",
        "<!--",
        "//"
      ],
      answer: 2,
      explanation: "Deux barres obliques // font ignorer au compilateur tout le reste de la ligne : c’est un commentaire destiné aux humains qui lisent le code.",
      whyOthers: [
        "## n’a pas de sens en C++ ; le symbole # seul est réservé à des lignes spéciales comme #include.",
        "<!-- est le début d’un commentaire en HTML, pas en C++.",
        ""
      ],
      exampleGarden: "Dans le sketch de la séance, // pompe arrêtée pendant toute la séance 1 explique la ligne digitalWrite(PIN_RELAIS_POMPE, LOW); sans être exécuté.",
      exampleOther: "Dans le programme d’un distributeur de croquettes, // heure du repas du matin aide à relire le code des mois plus tard.",
      takeaway: "// commence un commentaire d’une ligne, ignoré par la carte mais précieux pour le lecteur.",
      legacyChoiceMap: {"0":2,"1":0,"2":1}
    },
    {
      id: "s1q15",
      theme: "lisibilité du code",
      question: "Pourquoi donner un nom comme PIN_LUMIERE à A1 ?",
      choices: [
        "Pour rendre le programme plus lisible",
        "Pour augmenter la tension",
        "Pour changer le capteur"
      ],
      answer: 0,
      explanation: "Une constante const int PIN_LUMIERE = A1; donne un nom parlant à la broche : on comprend son rôle en lisant le code, et on ne change le numéro qu’à un seul endroit si le câblage évolue.",
      whyOthers: [
        "",
        "Un nom écrit dans le programme ne modifie aucune grandeur électrique : la tension reste la même.",
        "Renommer une broche ne change pas le capteur branché dessus ; seul le câblage réel pourrait le faire."
      ],
      exampleGarden: "Dans le sketch, PIN_HUMIDITE, PIN_LUMIERE et PIN_RELAIS_POMPE indiquent tout de suite quel capteur ou quel actionneur est concerné.",
      exampleOther: "Dans une maquette d’ascenseur, PIN_BOUTON_ETAGE2 est bien plus clair qu’un simple numéro de broche.",
      takeaway: "Des constantes bien nommées rendent le programme lisible et facile à modifier."
    },
    {
      id: "s1q16",
      theme: "Moniteur Série",
      question: "Que faut-il régler à 9600 dans l’IDE Arduino ?",
      choices: [
        "Le zoom",
        "Le Moniteur Série",
        "La tension de la pompe"
      ],
      answer: 1,
      explanation: "Le Moniteur Série doit être réglé sur 9600 bauds, la même vitesse que Serial.begin(9600) : sinon l’affichage est illisible ou vide.",
      whyOthers: [
        "Le zoom ne change que la taille du texte à l’écran, pas la communication avec la carte.",
        "",
        "Aucun réglage de l’IDE ne fixe la tension de la pompe : c’est le rôle du montage électrique et du relais."
      ],
      exampleGarden: "Si le Moniteur Série est réglé sur une autre vitesse, les mesures de A0, A1 et A2 apparaissent en caractères incompréhensibles.",
      exampleOther: "Même règle pour une aide au stationnement à ultrasons : le Moniteur Série doit être à la vitesse choisie dans le programme pour lire les distances.",
      takeaway: "Vitesse du Moniteur Série = vitesse de Serial.begin(), ici 9600 bauds."
    },
    {
      id: "s1q17",
      theme: "signal analogique",
      question: "Que doit-on observer en cachant puis en éclairant la LDR ?",
      choices: [
        "Une valeur qui peut varier",
        "Une valeur toujours égale à 0",
        "La pompe obligatoirement en marche"
      ],
      answer: 0,
      explanation: "En cachant puis en éclairant la LDR branchée sur A1, on doit voir la valeur affichée changer : c’est la preuve qu’un signal analogique varie avec la lumière. Le sens de variation dépend du montage, il faut l’observer.",
      whyOthers: [
        "",
        "Une valeur figée à 0 signalerait plutôt un problème de câblage ; un capteur analogique qui fonctionne donne des valeurs qui bougent.",
        "La pompe reste arrêtée toute la séance : l’expérience sur la LDR ne commande aucun actionneur."
      ],
      exampleGarden: "Main au-dessus de la LDR puis lampe allumée : la valeur de A1 monte ou descend dans le Moniteur Série, et on note le sens observé.",
      exampleOther: "Un lampadaire automatique repose sur la même observation : la mesure de lumière varie au crépuscule, ce qui permettra de décider de l’allumage.",
      takeaway: "Un capteur analogique se teste en faisant varier la grandeur mesurée et en observant la valeur affichée."
    },
    {
      id: "s1q18",
      theme: "jumeau numérique",
      question: "Pourquoi comparer la simulation au montage réel ?",
      choices: [
        "Pour se passer des capteurs sur le montage du jardin",
        "Pour éviter de téléverser le programme dans la carte",
        "Pour vérifier que le modèle représente correctement le système"
      ],
      answer: 2,
      explanation: "Le jumeau numérique n’est utile que s’il se comporte comme le vrai montage : comparer les deux permet de vérifier que le modèle représente correctement le système.",
      whyOthers: [
        "La comparaison ne permet pas de s’en passer : les capteurs restent indispensables sur le montage réel.",
        "Le téléversement reste nécessaire pour tester le programme sur la carte réelle ; la simulation ne le remplace pas.",
        ""
      ],
      exampleGarden: "On compare les valeurs de A0, A1 et A2 dans le simulateur et sur le vrai montage : si elles racontent la même histoire, le jumeau numérique du jardin est fiable.",
      exampleOther: "Pour une maquette de maison domotique, on vérifie de même que les volets simulés réagissent comme les volets réels avant de conclure.",
      takeaway: "Un modèle numérique doit être confronté au réel pour être validé.",
      legacyChoiceMap: {"0":2,"1":0,"2":1}
    },
    {
      id: "s1q19",
      theme: "compiler et téléverser",
      question: "Quelle action vient avant le téléversement ?",
      choices: [
        "Compiler ou vérifier le programme",
        "Débrancher tous les capteurs définitivement",
        "Mettre la pompe dans le pot"
      ],
      answer: 0,
      explanation: "Avant le téléversement, on compile le programme : le compilateur traduit le C++ et signale les erreurs de syntaxe tant qu’il est encore temps de les corriger.",
      whyOthers: [
        "",
        "On ne débranche pas les capteurs pour téléverser, et surtout pas définitivement : ils servent juste après pour les essais.",
        "L’installation de la pompe est une opération de montage, sans lien avec l’envoi du programme vers la carte."
      ],
      exampleGarden: "Un point-virgule oublié dans le sketch du jardin est signalé dès la compilation, avant même que la carte reçoive le programme.",
      exampleOther: "Pour une guirlande de Noël programmée, on vérifie aussi le code dans l’IDE avant de le téléverser dans la carte.",
      takeaway: "Compiler d’abord, téléverser ensuite : les erreurs de syntaxe se corrigent avant l’envoi."
    },
    {
      id: "s1q20",
      theme: "objectif de la séance",
      question: "Quel est l’objectif principal de la séance 1 ?",
      choices: [
        "Commander l’arrosage automatique dès cette première séance",
        "Faire fonctionner la pompe en permanence",
        "Observer et afficher les signaux sans commander l’arrosage"
      ],
      answer: 2,
      explanation: "La séance 1 consiste à observer : lire les trois capteurs, afficher leurs valeurs dans le Moniteur Série et garder la pompe arrêtée grâce à l’état sûr LOW sur D6.",
      whyOthers: [
        "La commande d’arrosage viendra dans les séances suivantes : la séance 1 se limite volontairement à observer et afficher les signaux, pompe arrêtée.",
        "Faire tourner la pompe en permanence est exactement ce que la séance interdit : D6 reste à LOW du début à la fin.",
        ""
      ],
      exampleGarden: "Le sketch de la séance lit A0, A1 et A2, affiche les mesures toutes les secondes et maintient digitalWrite(PIN_RELAIS_POMPE, LOW).",
      exampleOther: "Même démarche pour un ventilateur de salle de classe : on mesure d’abord la température sans faire tourner le ventilateur, pour comprendre avant d’agir.",
      takeaway: "Séance 1 : observer et afficher les signaux ; la pompe reste arrêtée.",
      legacyChoiceMap: {"0":2,"1":0,"2":1}
    }
  ]
};
