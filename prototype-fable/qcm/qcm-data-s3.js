/* TechnoQuest — QCM de la séance 3 : Analyser les chaînes.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s3q1 à s3q10 : essentielles · s3q11 à s3q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[3] = {
  session: 3,
  title: "Séance 3 — Analyser les chaînes",
  questions: [
    {
      id: "s3q1",
      theme: "Chaîne d’information",
      question: "Quelles sont, dans l’ordre, les trois fonctions de la chaîne d’information ?",
      choices: [
        "Alimenter → distribuer → convertir",
        "Acquérir → traiter → communiquer",
        "Communiquer → traiter → acquérir"
      ],
      answer: 1,
      explanation: "La chaîne d’information suit toujours le même chemin : on acquiert une grandeur grâce à un capteur, on la traite (calculs, comparaisons, décisions), puis on communique le résultat (affichage ou ordre envoyé à un autre élément).",
      whyOthers: [
        "Alimenter, distribuer et convertir sont des fonctions de la chaîne d’énergie, pas de la chaîne d’information.",
        "",
        "L’ordre est inversé : on ne peut pas communiquer un résultat avant de l’avoir acquis puis traité."
      ],
      exampleGarden: "Le capteur d’humidité acquiert l’état du sol, l’Arduino traite la valeur (comparaison au seuil 560), puis communique : affichage sur le moniteur série et ordre envoyé au relais.",
      exampleOther: "Dans un portail automatique, la cellule détecte la voiture (acquérir), la carte électronique décide (traiter), puis envoie l’ordre d’ouverture (communiquer).",
      takeaway: "Chaîne d’information : acquérir → traiter → communiquer."
    },
    {
      id: "s3q2",
      theme: "Chaîne d’énergie",
      question: "Quelles sont, dans l’ordre, les quatre fonctions de la chaîne d’énergie ?",
      choices: [
        "Alimenter → distribuer → convertir → agir",
        "Acquérir → alimenter → convertir → agir",
        "Distribuer → alimenter → agir → convertir"
      ],
      answer: 0,
      explanation: "La chaîne d’énergie décrit le trajet de l’énergie : une source alimente le système, un élément distribue cette énergie (il l’autorise ou la bloque), un autre la convertit en une forme utile, et enfin le système agit sur son environnement.",
      whyOthers: [
        "",
        "Acquérir est une fonction de la chaîne d’information : c’est le rôle des capteurs, pas celui de la chaîne d’énergie.",
        "L’ordre ne tient pas debout : il faut d’abord une source qui alimente avant de pouvoir distribuer, et convertir avant d’agir."
      ],
      exampleGarden: "L’alimentation TBT séparée alimente, le relais distribue, la pompe convertit l’électricité en mouvement, et la circulation d’eau agit sur la plante.",
      exampleOther: "Pour un ventilateur thermostaté : la prise alimente, l’interrupteur commandé distribue, le moteur convertit l’électricité en rotation, l’hélice agit en brassant l’air.",
      takeaway: "Chaîne d’énergie : alimenter → distribuer → convertir → agir."
    },
    {
      id: "s3q3",
      theme: "Chaîne d’information — acquérir",
      question: "Dans le jardin connecté, quel élément réalise la fonction « acquérir » ?",
      choices: [
        "L’Arduino, qui compare la mesure au seuil",
        "La pompe, qui envoie l’eau vers la plante",
        "Le capteur d’humidité, qui mesure l’état du sol"
      ],
      answer: 2,
      explanation: "Acquérir, c’est capter une grandeur physique du monde réel. C’est le rôle du capteur d’humidité : il transforme l’humidité du sol en un signal que l’Arduino peut lire avec analogRead (valeur ADC entre 0 et 1023).",
      whyOthers: [
        "L’Arduino réalise la fonction « traiter » : il reçoit la mesure et prend une décision, mais il ne capte rien lui-même.",
        "La pompe est un actionneur : elle appartient à la chaîne d’énergie (fonction « convertir »), pas à la chaîne d’information.",
        ""
      ],
      exampleGarden: "Sur notre montage, la sonde d’humidité plantée dans la terre fournit à la broche A0 une valeur entre 0 et 1023 : c’est l’acquisition.",
      exampleOther: "Dans un éclairage public automatique, c’est le capteur de lumière qui acquiert la luminosité ambiante pour savoir si la nuit tombe.",
      takeaway: "Acquérir = le rôle du capteur : transformer une grandeur physique en signal exploitable."
    },
    {
      id: "s3q4",
      theme: "Rôle du relais",
      question: "Quel est le rôle du relais dans notre système d’arrosage ?",
      choices: [
        "Il mesure l’humidité du sol à la place du capteur",
        "Il sert d’interface entre la chaîne d’information et la chaîne d’énergie",
        "Il fournit l’énergie électrique à l’Arduino"
      ],
      answer: 1,
      explanation: "Le relais est le point de rencontre des deux chaînes : il reçoit un ordre logique venant de la broche D6 (chaîne d’information) et, en réponse, il laisse passer ou coupe l’énergie de l’alimentation séparée vers la pompe (chaîne d’énergie).",
      whyOthers: [
        "La mesure de l’humidité est le travail du capteur, pas du relais : le relais ne mesure rien.",
        "",
        "Le relais ne produit ni ne fournit d’énergie : il se contente d’ouvrir ou de fermer le passage de l’énergie qui vient de l’alimentation séparée."
      ],
      exampleGarden: "Quand D6 passe à HIGH, le relais bascule et connecte l’alimentation TBT à la pompe : un petit ordre logique déclenche une vraie circulation d’eau.",
      exampleOther: "Dans une machine à laver, un relais reçoit l’ordre de la carte électronique et laisse alors passer le courant de forte puissance vers la résistance qui chauffe l’eau.",
      takeaway: "Le relais = l’interface : un ordre logique d’un côté, le passage de l’énergie de l’autre."
    },
    {
      id: "s3q5",
      theme: "Alimentation séparée",
      question: "Pourquoi la pompe possède-t-elle sa propre alimentation TBT, séparée de l’Arduino ?",
      choices: [
        "Parce que la broche D6 donne un ordre, pas l’énergie dont la pompe a besoin",
        "Parce que l’Arduino n’a plus aucune broche libre pour brancher la pompe",
        "Parce que la pompe doit pouvoir continuer d’arroser même si l’Arduino est éteint"
      ],
      answer: 0,
      explanation: "Une broche de l’Arduino transporte de l’information (HIGH ou LOW), pas de la puissance. La pompe demande bien plus d’énergie que ce qu’une broche peut fournir : c’est donc une alimentation TBT séparée qui alimente la chaîne d’énergie, et D6 se contente de commander le relais.",
      whyOthers: [
        "",
        "Ce n’est pas une question de place : même avec des broches libres, aucune broche ne pourrait fournir la puissance nécessaire à la pompe.",
        "La séparation ne rend pas la pompe autonome : sans l’ordre envoyé par l’Arduino au relais, elle reste à l’arrêt, même alimentée."
      ],
      exampleGarden: "Sur le schéma du jardin connecté, on voit deux circuits : le circuit de commande (Arduino → relais) et le circuit de puissance (alimentation TBT → relais → pompe).",
      exampleOther: "Le bouton d’un portail automatique n’alimente pas le moteur : il envoie un ordre, et le moteur reçoit son énergie du secteur via un contacteur.",
      takeaway: "La broche donne l’ordre, l’alimentation séparée donne l’énergie : les deux rôles sont distincts."
    },
    {
      id: "s3q6",
      theme: "HIGH / delay / LOW",
      question: "Dans notre projet, que provoque l’instruction digitalWrite(PIN_RELAIS_POMPE, HIGH) ?",
      choices: [
        "Elle arrête définitivement la pompe jusqu’au prochain téléversement",
        "Elle lit la valeur du capteur d’humidité sur la broche A0",
        "Elle active le relais, qui laisse alors passer l’énergie vers la pompe"
      ],
      answer: 2,
      explanation: "Selon la convention de notre projet, HIGH signifie « relais activé » : le relais bascule et connecte l’alimentation séparée à la pompe, qui se met à arroser. LOW le ramène au repos. (Cette convention sera à confirmer avec le module relais réel.)",
      whyOthers: [
        "C’est l’inverse : dans notre convention, HIGH active le relais. C’est LOW qui le remet au repos et arrête la pompe.",
        "Lire le capteur, c’est le rôle d’analogRead(A0) : digitalWrite ne lit rien, il écrit un état logique sur une broche.",
        ""
      ],
      exampleGarden: "Dès que le sol est trop sec, le sketch exécute digitalWrite(PIN_RELAIS_POMPE, HIGH) : clic du relais, la pompe démarre et l’eau circule.",
      exampleOther: "Dans un sèche-mains automatique, la détection des mains déclenche l’équivalent d’un HIGH : le circuit de commande active l’élément qui alimente la soufflerie.",
      takeaway: "digitalWrite envoie un ordre logique : HIGH = relais activé, LOW = relais au repos (convention du projet)."
    },
    {
      id: "s3q7",
      theme: "HIGH / delay / LOW",
      question: "À quoi sert le delay(3000) placé entre le HIGH et le LOW dans notre code d’arrosage ?",
      choices: [
        "Il maintient le relais activé pendant 3 secondes : la pompe arrose exactement 3 secondes",
        "Il fait démarrer et s’arrêter la pompe 3000 fois de suite",
        "Il met le programme en pause pendant 3000 secondes, soit presque une heure"
      ],
      answer: 0,
      explanation: "delay(3000) suspend le programme pendant 3000 millisecondes, c’est-à-dire 3 secondes. Comme le relais a été activé juste avant (HIGH) et qu’il sera coupé juste après (LOW), la pompe fonctionne pendant exactement cette durée : c’est une impulsion d’arrosage.",
      whyOthers: [
        "",
        "delay ne répète rien : il fige simplement le programme. Pendant ces 3 secondes, la broche garde son état HIGH sans changer.",
        "Attention aux unités : delay compte en millisecondes. 3000 ms = 3 s, pas 3000 s."
      ],
      exampleGarden: "La séquence HIGH → delay(3000) → LOW donne une impulsion : 3 secondes d’eau, ni plus ni moins, avant que loop reparte mesurer l’humidité.",
      exampleOther: "Un passage piéton fonctionne pareil : le feu passe au vert pour les piétons, un temporisateur compte quelques secondes, puis le feu repasse au rouge.",
      takeaway: "HIGH → delay(3000) → LOW = une impulsion de 3 secondes, car delay compte en millisecondes."
    },
    {
      id: "s3q8",
      theme: "Pourquoi limiter la durée",
      question: "Pourquoi limiter l’arrosage à une impulsion de 3 secondes au lieu de laisser la pompe tourner en continu ?",
      choices: [
        "Parce que le relais n’est pas conçu pour rester activé plus de quelques secondes",
        "Pour éviter d’inonder la plante et laisser l’eau s’infiltrer avant la remesure",
        "Parce que la fonction delay refuse toute valeur supérieure à 3000"
      ],
      answer: 1,
      explanation: "L’eau met du temps à pénétrer dans la terre : si la pompe tournait en continu, on noierait la plante avant même que le capteur détecte le changement. Une impulsion courte permet d’arroser un peu, puis de remesurer l’humidité au tour de loop suivant, et de recommencer seulement si nécessaire.",
      whyOthers: [
        "Un relais peut rester activé très longtemps sans dommage : la limite de 3 secondes est un choix de conception, pas une contrainte du composant.",
        "",
        "delay accepte des valeurs bien plus grandes que 3000 : c’est nous qui avons choisi 3000 ms, pour des raisons d’arrosage, pas de programmation."
      ],
      exampleGarden: "Avec des impulsions de 3 secondes, le système arrose par petites doses : la mesure d’humidité entre deux impulsions sert de contrôle avant de redonner de l’eau.",
      exampleOther: "Un distributeur de savon automatique délivre une petite dose puis s’arrête : il ne vide pas son réservoir tant que la main reste dessous.",
      takeaway: "On limite la durée pour agir par petites doses contrôlées et remesurer entre chaque action."
    },
    {
      id: "s3q9",
      theme: "Arrêt explicite",
      question: "Pourquoi écrit-on digitalWrite(PIN_RELAIS_POMPE, LOW); dans le else, alors que la pompe semble déjà arrêtée ?",
      choices: [
        "Pour afficher l’état de la pompe dans le moniteur série",
        "Pour ralentir le passage dans loop et économiser la mémoire de la carte Arduino",
        "Pour garantir que le relais est bien au repos quand le sol est assez humide"
      ],
      answer: 2,
      explanation: "En programmation, on ne suppose pas : on impose. Écrire le LOW dans le else garantit que, quel que soit l’état précédent du relais, il est ramené au repos quand l’humidité est suffisante. Le comportement du système est ainsi défini dans tous les cas, sans zone d’ombre.",
      whyOthers: [
        "digitalWrite n’affiche rien à l’écran : l’affichage passe par Serial. Cette instruction écrit seulement un état logique sur la broche D6.",
        "Cette instruction est quasi instantanée : elle ne ralentit rien et n’économise aucune mémoire.",
        ""
      ],
      exampleGarden: "Grâce au LOW du else, même si un bug ou un redémarrage laissait le relais activé, le premier passage dans loop avec un sol humide remettrait la pompe à l’arrêt.",
      exampleOther: "Un radiateur à thermostat fait pareil : quand la température voulue est atteinte, il envoie l’ordre d’arrêt de chauffe, même si la résistance semblait déjà coupée.",
      takeaway: "Un bon programme écrit explicitement l’état voulu dans chaque branche du if/else."
    },
    {
      id: "s3q10",
      theme: "Blocs fonctionnels et liaisons",
      question: "Dans un schéma fonctionnel des chaînes d’information et d’énergie, comment représente-t-on les fils qui relient les éléments ?",
      choices: [
        "Par des flèches entre les blocs, qui montrent le sens de circulation",
        "En dessinant chaque fil avec sa couleur réelle et sa longueur réelle sur le schéma",
        "Par une simple liste des blocs, sans tracer les connexions qui les relient"
      ],
      answer: 0,
      explanation: "Un schéma fonctionnel simplifie la réalité : chaque élément devient un bloc, et les fils deviennent des flèches ou des liaisons. Ce qui compte, c’est ce qui circule (une information ou de l’énergie) et dans quel sens, pas l’aspect physique du câblage.",
      whyOthers: [
        "",
        "Couleurs et longueurs réelles appartiennent au schéma de câblage : sur un schéma fonctionnel, on ne garde que la fonction et le sens de circulation.",
        "Au contraire, les liaisons sont essentielles : sans elles, on ne verrait pas comment l’information et l’énergie circulent entre les blocs."
      ],
      exampleGarden: "Sur notre schéma : capteur → Arduino → relais pour l’information, et alimentation TBT → relais → pompe → circulation d’eau pour l’énergie, chaque → étant une flèche.",
      exampleOther: "Pour un volet roulant, le schéma fonctionnel montre bouton → carte → moteur avec des flèches, sans dessiner un seul fil réel.",
      takeaway: "Schéma fonctionnel : des blocs pour les fonctions, des flèches pour les liaisons et le sens de circulation."
    },
    {
      id: "s3q11",
      theme: "Ordre logique ou énergie ?",
      question: "Le signal envoyé par la broche D6 vers le relais est…",
      choices: [
        "l’énergie électrique qui fait tourner le moteur de la pompe",
        "un ordre logique (HIGH ou LOW) qui appartient à la chaîne d’information",
        "un signal analogique dont la valeur varie entre 0 et 1023"
      ],
      answer: 1,
      explanation: "D6 transporte une information : un état logique HIGH ou LOW produit par digitalWrite. C’est un ordre minuscule en puissance, mais décisif : il commande le relais, qui laisse ensuite passer la véritable énergie venue de l’alimentation séparée.",
      whyOthers: [
        "L’énergie de la pompe vient de l’alimentation TBT séparée : D6 n’alimente pas la pompe, il la commande à travers le relais.",
        "",
        "Les valeurs 0 à 1023 concernent l’ADC en lecture analogique (analogRead). D6 en sortie logique ne connaît que deux états : HIGH ou LOW."
      ],
      exampleGarden: "Si on débranchait l’alimentation TBT, D6 aurait beau passer à HIGH, la pompe resterait muette : l’ordre existe, mais l’énergie manque.",
      exampleOther: "La télécommande d’un portail envoie un ordre radio de quelques milliwatts, alors que le moteur du portail consomme des centaines de watts venus du secteur.",
      takeaway: "Ne pas confondre : l’ordre logique circule dans la chaîne d’information, l’énergie dans la chaîne d’énergie."
    },
    {
      id: "s3q12",
      theme: "Chaîne d’énergie — distribuer",
      question: "Dans la chaîne d’énergie du jardin connecté, quel élément assure la fonction « distribuer » ?",
      choices: [
        "La pompe, qui envoie l’eau dans le tuyau",
        "L’alimentation TBT, qui fournit le courant",
        "Le relais, qui ouvre ou ferme le passage de l’énergie vers la pompe"
      ],
      answer: 2,
      explanation: "Distribuer, c’est autoriser ou interrompre le passage de l’énergie sur ordre de la chaîne d’information. C’est exactement ce que fait le relais : au repos il bloque l’énergie, activé il la laisse passer de l’alimentation vers la pompe.",
      whyOthers: [
        "La pompe assure la fonction « convertir » : elle transforme l’énergie électrique en mouvement, elle ne décide pas du passage du courant.",
        "L’alimentation TBT assure la fonction « alimenter » : elle est la source d’énergie, mais elle ne l’interrompt pas sur ordre.",
        ""
      ],
      exampleGarden: "Alimentation TBT (alimenter) → relais (distribuer) → pompe (convertir) → circulation d’eau (agir) : le relais est le robinet électrique de la chaîne.",
      exampleOther: "Dans un éclairage public, le contacteur commandé par le capteur de lumière distribue l’énergie du réseau vers les lampadaires à la tombée de la nuit.",
      takeaway: "Distribuer = laisser passer ou bloquer l’énergie sur ordre : c’est le poste du relais."
    },
    {
      id: "s3q13",
      theme: "Chaîne d’énergie — convertir",
      question: "Dans notre système, quel élément assure la fonction « convertir », et en quoi convertit-il l’énergie ?",
      choices: [
        "La pompe : elle convertit l’énergie électrique en énergie mécanique",
        "Le relais : il convertit le signal logique HIGH en énergie pour la pompe",
        "L’Arduino : il convertit la valeur ADC du capteur en énergie électrique pour la pompe"
      ],
      answer: 0,
      explanation: "Convertir, c’est changer la forme de l’énergie. La pompe reçoit de l’énergie électrique et la transforme en énergie mécanique : son moteur tourne et propulse l’eau. C’est cette conversion qui rend l’action possible.",
      whyOthers: [
        "",
        "Le relais ne crée ni ne transforme d’énergie : il distribue celle de l’alimentation. Un ordre logique ne devient jamais de l’énergie.",
        "L’Arduino traite de l’information : la valeur ADC est un nombre, pas une réserve d’énergie qu’on pourrait transformer."
      ],
      exampleGarden: "Quand le relais laisse passer le courant, le moteur de la pompe se met à tourner : l’électricité devient mouvement, et le mouvement pousse l’eau vers la plante.",
      exampleOther: "Dans un ventilateur thermostaté, c’est aussi le moteur qui convertit : électricité en entrée, rotation des pales en sortie.",
      takeaway: "Convertir = changer la forme de l’énergie : électrique → mécanique pour notre pompe."
    },
    {
      id: "s3q14",
      theme: "Chaîne d’information — traiter",
      question: "Dans notre sketch, quelle instruction correspond le mieux à la fonction « traiter » ?",
      choices: [
        "analogRead(A0), qui lit la valeur envoyée par le capteur",
        "delay(3000), qui met le programme en pause pendant exactement trois secondes",
        "if (humidite < SEUIL_HUMIDITE), qui compare la mesure au seuil 560"
      ],
      answer: 2,
      explanation: "Traiter, c’est transformer une mesure en décision. La comparaison if (humidite < SEUIL_HUMIDITE) fait exactement cela : à partir du nombre fourni par le capteur, elle choisit entre deux actions, arroser ou ne pas arroser.",
      whyOthers: [
        "analogRead réalise plutôt l’acquisition côté programme : il récupère la mesure, mais ne prend aucune décision avec.",
        "delay ne décide rien : il fige le programme pendant une durée donnée, c’est un outil de temporisation.",
        ""
      ],
      exampleGarden: "Le seuil 560, déterminé lors de la calibration en séance 2, est le critère de décision : en dessous, sol trop sec, la branche du if déclenche l’arrosage.",
      exampleOther: "Le thermostat d’un radiateur traite aussi : il compare la température mesurée à la consigne, puis décide de chauffer ou non.",
      takeaway: "Traiter = comparer, calculer, décider : c’est le cœur du if/else dans loop."
    },
    {
      id: "s3q15",
      theme: "Chaîne d’information — communiquer",
      question: "Dans le jardin connecté, quel élément réalise la fonction « communiquer » vers l’utilisateur ?",
      choices: [
        "La pompe, en envoyant de l’eau vers la plante",
        "Le moniteur série (Serial), qui affiche les mesures à l’écran",
        "L’alimentation TBT, en fournissant du courant au relais et à la pompe"
      ],
      answer: 1,
      explanation: "Communiquer, c’est transmettre le résultat du traitement. Grâce à Serial, l’Arduino envoie les valeurs d’humidité et les décisions vers l’ordinateur : l’utilisateur voit en direct ce que le système mesure et décide.",
      whyOthers: [
        "L’arrosage est l’action finale de la chaîne d’énergie (fonction « agir »), pas une transmission d’information vers l’utilisateur.",
        "",
        "L’alimentation appartient à la chaîne d’énergie : elle fournit de la puissance, elle ne transmet aucune information."
      ],
      exampleGarden: "Dans le moniteur série, on lit par exemple « Humidite : 480 → arrosage » : c’est la chaîne d’information qui communique son verdict.",
      exampleOther: "Un panneau d’affichage à l’entrée d’un parking communique le nombre de places libres calculé par le système de comptage.",
      takeaway: "Communiquer = rendre visible le résultat : ici, l’affichage via Serial et l’ordre envoyé au relais."
    },
    {
      id: "s3q16",
      theme: "Transfert — portail automatique",
      question: "Dans un portail automatique, quel élément joue le même rôle que la pompe de notre jardin connecté ?",
      choices: [
        "Le moteur du portail, qui convertit l’énergie électrique en mouvement",
        "La télécommande, qui envoie l’ordre d’ouverture à la carte électronique du portail",
        "Le détecteur qui repère la présence d’une voiture"
      ],
      answer: 0,
      explanation: "La pompe est l’actionneur qui convertit l’énergie électrique en action utile. Dans un portail automatique, ce poste est tenu par le moteur : il reçoit l’énergie et la transforme en mouvement d’ouverture ou de fermeture.",
      whyOthers: [
        "",
        "La télécommande appartient à la chaîne d’information : elle acquiert l’appui sur le bouton et communique un ordre, comme notre broche D6.",
        "Le détecteur est un capteur : il correspond à notre capteur d’humidité, tout au début de la chaîne d’information."
      ],
      exampleGarden: "Pompe et moteur de portail occupent la même case du schéma fonctionnel : le bloc « convertir » de la chaîne d’énergie.",
      exampleOther: "Même logique pour un store automatique : le capteur de soleil informe, la carte décide, et c’est le moteur du store qui convertit et agit.",
      takeaway: "Pour transférer l’analyse : chercher qui capte, qui décide, qui convertit l’énergie en action."
    },
    {
      id: "s3q17",
      theme: "Arrêt explicite",
      question: "Que se passerait-il si on oubliait le digitalWrite(PIN_RELAIS_POMPE, LOW); après le delay(3000) ?",
      choices: [
        "Le programme afficherait un message d’erreur au téléversement",
        "Rien de grave : le relais se remet toujours au repos tout seul après quelques secondes",
        "Le relais resterait activé : la pompe continuerait d’arroser sans limite de durée"
      ],
      answer: 2,
      explanation: "Une broche garde son dernier état tant qu’on ne le change pas. Sans le LOW, D6 resterait à HIGH après le delay : le relais resterait collé, la pompe tournerait en continu et la plante finirait noyée. L’impulsion de 3 secondes n’existe que grâce au LOW final.",
      whyOthers: [
        "Le code resterait parfaitement valide pour le compilateur : oublier un LOW est une erreur de logique, pas une erreur de syntaxe.",
        "Un relais n’a pas de minuterie intégrée : il obéit à l’ordre reçu et conserve son état tant qu’aucun nouvel ordre n’arrive.",
        ""
      ],
      exampleGarden: "Seule la remesure d’humidité passant au-dessus du seuil, avec le LOW du else, finirait par arrêter la pompe, mais bien trop tard et sans contrôle de durée.",
      exampleOther: "C’est comme un grille-pain dont le minuteur serait cassé : sans ordre d’arrêt, la résistance chaufferait jusqu’à brûler le pain.",
      takeaway: "Une broche garde son état : chaque HIGH doit avoir son LOW prévu dans le programme."
    },
    {
      id: "s3q18",
      theme: "Alimentation séparée",
      question: "Pourquoi ne branche-t-on pas la pompe directement sur la broche D6, sans relais ni alimentation séparée ?",
      choices: [
        "Parce que D6 est une broche réservée uniquement au branchement des capteurs analogiques",
        "Parce qu’une broche fournit un courant trop faible : la pompe en exige bien plus",
        "Parce que la pompe a besoin d’un signal analogique entre 0 et 1023 pour fonctionner"
      ],
      answer: 1,
      explanation: "Les broches de l’Arduino sont conçues pour transporter de l’information, avec un courant très limité. Un moteur de pompe demande un courant bien supérieur : branché en direct, il surchargerait la broche et pourrait détruire la carte. D’où le duo relais + alimentation TBT séparée.",
      whyOthers: [
        "D6 est une broche numérique tout à fait ordinaire : le problème n’est pas sa spécialité, mais la puissance qu’elle est capable de fournir.",
        "",
        "Les valeurs 0 à 1023 concernent la lecture de l’ADC avec analogRead : la pompe, elle, a simplement besoin de puissance électrique, pas d’un nombre."
      ],
      exampleGarden: "Notre montage protège l’Arduino : D6 ne voit que la commande du relais, un tout petit courant, pendant que la pompe puise sa puissance ailleurs.",
      exampleOther: "On ne branche pas non plus un aspirateur sur la sortie casque d’un téléphone : la prise délivre un signal, pas la puissance d’un moteur.",
      takeaway: "Une broche commande, elle n’alimente pas : la puissance passe par le relais et l’alimentation séparée."
    },
    {
      id: "s3q19",
      theme: "Convention HIGH/LOW",
      question: "Notre projet adopte la convention « LOW = relais au repos, HIGH = relais activé ». Que faudra-t-il vérifier avant le montage réel ?",
      choices: [
        "Que le module relais utilisé respecte bien cette convention",
        "Rien de particulier : cette convention est la norme des modules relais du commerce",
        "Que la pompe accepte bien de recevoir des valeurs comprises entre 0 et 1023"
      ],
      answer: 0,
      explanation: "Une convention est un choix d’écriture, pas une loi universelle. Certains modules relais sont dits « actifs à l’état bas » : ils s’enclenchent sur LOW. Avant de brancher la vraie pompe, on testera donc le module réel et on adaptera le code si son comportement est inversé.",
      whyOthers: [
        "",
        "C’est justement le piège : il n’existe pas de norme unique, les modules diffèrent selon leur électronique de commande. Vérifier la documentation ou tester reste indispensable.",
        "Les valeurs 0 à 1023 appartiennent à la lecture analogique du capteur : elles n’ont rien à voir avec la commande logique du relais."
      ],
      exampleGarden: "Premier test prudent en classe : envoyer HIGH puis LOW en observant la LED du module relais, avant de connecter la pompe et son alimentation.",
      exampleOther: "Même prudence pour un feu tricolore de maquette : on vérifie quel état logique allume chaque lampe avant d’écrire le programme définitif.",
      takeaway: "Une convention de code doit toujours être confrontée au comportement réel du composant."
    },
    {
      id: "s3q20",
      theme: "Transfert — éclairage public",
      question: "Dans un lampadaire d’éclairage public automatique, quel élément joue le rôle d’interface entre les deux chaînes, comme le relais de notre jardin ?",
      choices: [
        "Le capteur de lumière, qui détecte la tombée de la nuit pour le circuit de commande",
        "L’ampoule du lampadaire, qui éclaire la rue",
        "Le relais (ou contacteur), qui laisse passer l’énergie du réseau vers la lampe"
      ],
      answer: 2,
      explanation: "L’interface entre les deux chaînes est toujours l’élément qui reçoit un ordre logique d’un côté et distribue l’énergie de l’autre. Dans l’éclairage public, c’est le relais ou contacteur : un petit signal du circuit de commande, et la puissance du réseau file vers les lampes.",
      whyOthers: [
        "Le capteur de lumière est au début de la chaîne d’information : il acquiert, comme notre capteur d’humidité, mais il ne touche pas à l’énergie.",
        "L’ampoule est en bout de chaîne d’énergie : elle convertit l’électricité en lumière, comme notre pompe convertit l’électricité en mouvement.",
        ""
      ],
      exampleGarden: "Le parallèle est complet : capteur de lumière ↔ capteur d’humidité, circuit de commande ↔ Arduino, contacteur ↔ relais, lampe ↔ pompe.",
      exampleOther: "Dans un ventilateur thermostaté, la même case du schéma est occupée par l’interrupteur commandé qui relie la décision du thermostat au moteur.",
      takeaway: "Dans tout objet technique, l’interface entre information et énergie se repère : elle reçoit l’ordre et distribue la puissance."
    }
  ]
};
