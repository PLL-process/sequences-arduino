/* TechnoQuest — QCM de la séance 5 : Économiser l’eau.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s5q1 à s5q10 : essentielles · s5q11 à s5q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[5] = {
  session: 5,
  title: "Séance 5 — Économiser l’eau",
  questions: [
    {
      id: "s5q1",
      theme: "Le problème du seuil unique",
      question: "Avec un seul seuil (par exemple 520), pourquoi la pompe risque-t-elle de démarrer et de s’arrêter sans cesse ?",
      choices: [
        "Parce que la carte Arduino n’est pas assez rapide pour lire le capteur d’humidité",
        "Parce que la mesure d’humidité oscille autour du seuil, sans cesse juste en dessous puis juste au-dessus",
        "Parce que la pompe est trop puissante par rapport au volume du réservoir"
      ],
      answer: 1,
      explanation: "Autour d’une seule valeur, la mesure du capteur n’est jamais parfaitement stable : elle oscille légèrement. Dès qu’elle passe sous 520, la pompe démarre ; dès qu’elle remonte juste au-dessus, la pompe s’arrête… et ainsi de suite. Ces démarrages et arrêts répétés usent la pompe et gaspillent l’eau.",
      whyOthers: [
        "La carte Arduino lit le capteur très vite, ce n’est pas elle le problème : c’est la mesure qui oscille autour du seuil unique.",
        "",
        "La puissance de la pompe n’a rien à voir : même une toute petite pompe démarrerait et s’arrêterait sans cesse avec un seuil unique."
      ],
      exampleGarden: "L’humidité mesure 519 : la pompe démarre. Quelques gouttes arrivent, la mesure passe à 523 : elle s’arrête. La terre sèche un peu, 518 : elle redémarre… clic, clac, toute la journée.",
      exampleOther: "Un chauffe-eau réglé sur une seule température s’allumerait et s’éteindrait sans arrêt dès que l’eau perdrait un demi-degré. C’est pour cela qu’il attend que l’eau ait nettement refroidi avant de se rallumer.",
      takeaway: "Un seuil unique fait osciller le système : la mesure passe sans cesse d’un côté à l’autre du seuil, et la pompe démarre et s’arrête en permanence."
    },
    {
      id: "s5q2",
      theme: "La solution : deux seuils",
      question: "Comment l’hystérésis résout-elle le problème du seuil unique ?",
      choices: [
        "Elle utilise deux seuils : un seuil bas pour démarrer l’arrosage, un seuil haut pour l’arrêter",
        "Elle utilise toujours un seul seuil, mais calculé avec beaucoup plus de précision, avec des chiffres après la virgule",
        "Elle supprime les seuils et arrose à heures fixes, sans regarder le capteur"
      ],
      answer: 0,
      explanation: "Avec deux seuils écartés (démarrage à 520, arrêt à 650), les petites oscillations de la mesure ne suffisent plus à faire changer la pompe d’état : il faut que l’humidité change vraiment beaucoup pour passer d’un seuil à l’autre. Fini les démarrages en rafale !",
      whyOthers: [
        "",
        "Un seuil plus précis, même avec des chiffres après la virgule, resterait un seuil unique : la mesure oscillerait autour de lui exactement de la même façon.",
        "Arroser à heures fixes, c’est ne plus tenir compte des besoins réels de la plante : on arroserait parfois une terre déjà humide."
      ],
      exampleGarden: "Notre jardin démarre l’arrosage quand l’humidité descend sous 520 et ne l’arrête que lorsqu’elle dépasse 650 : entre les deux, la pompe ne change pas d’avis à chaque petite variation.",
      exampleOther: "Un thermostat de chauffage fait pareil : il allume le chauffage sous 19 °C et ne le coupe qu’au-dessus de 21 °C, au lieu de s’agiter autour d’une seule température.",
      takeaway: "L’hystérésis utilise deux seuils écartés : un seuil bas de démarrage et un seuil haut d’arrêt. Les petites oscillations de la mesure ne déclenchent plus rien."
    },
    {
      id: "s5q3",
      theme: "Le seuil de démarrage",
      question: "Dans le programme, à quoi sert const int SEUIL_HUMIDITE = 520; ?",
      choices: [
        "C’est le seuil d’arrêt : dès que l’humidité mesurée dépasse la valeur 520, la pompe s’arrête aussitôt",
        "C’est la durée de l’impulsion d’arrosage envoyée à la pompe, exprimée en millisecondes",
        "C’est le seuil de démarrage : sous 520, si le réservoir le permet, demandeArrosage passe à true"
      ],
      answer: 2,
      explanation: "SEUIL_HUMIDITE = 520 est le seuil bas, celui du démarrage : quand la mesure d’humidité passe en dessous, la terre est trop sèche ; si le réservoir contient assez d’eau, le programme écrit demandeArrosage = true; pour demander l’arrosage.",
      whyOthers: [
        "Le seuil d’arrêt, c’est l’autre constante : SEUIL_ARRET = 650. Attention à ne pas les confondre !",
        "La durée de l’impulsion est réglée par delay(2000) dans la commande de la pompe, pas par ce seuil.",
        ""
      ],
      exampleGarden: "La mesure descend à 505 et le réservoir contient assez d’eau : 505 < 520, la terre est trop sèche, le programme passe demandeArrosage à true et l’arrosage va commencer.",
      exampleOther: "Dans une climatisation, c’est l’inverse mais c’est la même idée : une température de déclenchement (par exemple 26 °C) au-delà de laquelle elle se met en route.",
      takeaway: "SEUIL_HUMIDITE = 520 est le seuil bas : en dessous, la terre est trop sèche et, si le réservoir le permet, le programme demande l’arrosage (demandeArrosage = true)."
    },
    {
      id: "s5q4",
      theme: "Le seuil d’arrêt",
      question: "Et const int SEUIL_ARRET = 650;, à quoi sert-il ?",
      choices: [
        "C’est le seuil haut : si l’humidité dépasse 650, la terre est assez humide, on met demandeArrosage à false",
        "C’est la valeur maximale que peut renvoyer la fonction analogRead()",
        "C’est le niveau minimal d’eau que doit contenir le réservoir"
      ],
      answer: 0,
      explanation: "SEUIL_ARRET = 650 est le seuil haut : quand la mesure d’humidité le dépasse, la terre a reçu assez d’eau. Le programme écrit alors demandeArrosage = false; pour arrêter de demander l’arrosage.",
      whyOthers: [
        "",
        "La valeur maximale d’analogRead() est 1023, on l’a vue dès la première séance : 650 est simplement un seuil choisi par nous.",
        "Le niveau du réservoir est surveillé par un autre capteur, avec son propre seuil : ici on parle de l’humidité de la terre."
      ],
      exampleGarden: "Après quelques impulsions d’arrosage, la mesure grimpe à 660 : 660 > 650, la terre est bien humide, demandeArrosage repasse à false et la pompe reste éteinte.",
      exampleOther: "Un réfrigérateur coupe son moteur quand l’intérieur est redevenu bien froid : c’est son seuil d’arrêt à lui.",
      takeaway: "SEUIL_ARRET = 650 est le seuil haut : au-dessus, la terre est assez humide et le programme arrête de demander l’arrosage (demandeArrosage = false)."
    },
    {
      id: "s5q5",
      theme: "Le type de la variable d’état",
      question: "Quel est le type de la variable demandeArrosage, et quelles valeurs peut-elle prendre ?",
      choices: [
        "int : elle peut prendre toutes les valeurs entières de 0 à 1023, comme la mesure renvoyée par le capteur",
        "bool : deux valeurs possibles seulement, true (vrai) ou false (faux)",
        "const : elle garde toujours la même valeur, comme un seuil"
      ],
      answer: 1,
      explanation: "demandeArrosage répond à une question qui n’a que deux réponses possibles : faut-il arroser, oui ou non ? Le type bool est fait exactement pour cela : il ne stocke que true ou false, rien d’autre.",
      whyOthers: [
        "int sert aux nombres entiers, comme la mesure du capteur (0 à 1023). Ici on n’a pas besoin d’un nombre, juste d’un oui ou d’un non.",
        "",
        "const n’est pas un type : c’est un mot-clé qui interdit de modifier une valeur. Or demandeArrosage doit justement pouvoir changer !"
      ],
      exampleGarden: "bool demandeArrosage = false; : au démarrage du programme, personne ne demande l’arrosage. Elle passera à true quand la terre sera trop sèche.",
      exampleOther: "Dans le programme d’un congélateur, on trouverait la même idée : une variable bool froidDemande, vraie ou fausse, pour savoir si le moteur doit produire du froid.",
      takeaway: "demandeArrosage est de type bool : elle ne vaut que true ou false. C’est le type parfait pour mémoriser une décision oui/non."
    },
    {
      id: "s5q6",
      theme: "Variable globale : où la déclarer",
      question: "Où faut-il déclarer bool demandeArrosage = false; pour que l’hystérésis fonctionne ?",
      choices: [
        "À l’intérieur de loop(), juste avant les mesures, pour qu’elle reparte proprement de false à chaque nouveau tour",
        "À l’intérieur de setup(), car les initialisations se font dans setup()",
        "En dehors de loop(), tout en haut du programme : c’est une variable globale"
      ],
      answer: 2,
      explanation: "Déclarée en dehors de loop(), demandeArrosage est une variable globale : elle est créée une seule fois, au démarrage, et elle garde sa valeur entre deux passages dans loop(). C’est cette persistance qui permet au programme de se souvenir de sa dernière décision.",
      whyOthers: [
        "Repartir de false à chaque tour, c’est exactement ce qu’on veut ÉVITER : la variable oublierait tout et l’hystérésis serait impossible.",
        "Une variable déclarée dans setup() n’existe que pendant setup() : loop() ne pourrait même pas l’utiliser.",
        ""
      ],
      exampleGarden: "Tout en haut du programme, à côté de const int SEUIL_HUMIDITE = 520;, on écrit bool demandeArrosage = false; : elle vivra aussi longtemps que le programme.",
      exampleOther: "Un thermostat de chauffage garde lui aussi en mémoire, en permanence, sa dernière décision : chauffer ou ne pas chauffer. Sans cette mémoire, il repartirait de zéro à chaque instant.",
      takeaway: "La variable d’état se déclare EN DEHORS de loop() : globale, elle est créée une seule fois et conserve sa valeur entre les tours de loop()."
    },
    {
      id: "s5q7",
      theme: "La zone entre les deux seuils",
      question: "Que fait le programme quand le réservoir est suffisant et que l’humidité est entre les deux seuils, par exemple entre 520 et 650 ?",
      choices: [
        "Il n’écrit rien : demandeArrosage garde simplement sa valeur précédente",
        "Il met demandeArrosage à false, par sécurité, pour être certain de ne jamais arroser sans raison valable",
        "Il met demandeArrosage à true, pour arroser un petit peu au cas où"
      ],
      answer: 0,
      explanation: "Entre les deux seuils, aucune condition n’est vraie : le programme ne touche pas à demandeArrosage, qui conserve la valeur décidée au tour précédent. Si on arrosait, on continue ; si on n’arrosait pas, on continue de ne pas arroser. C’est le cœur de l’hystérésis.",
      whyOthers: [
        "",
        "Mettre false entre les seuils casserait l’hystérésis : un arrosage commencé s’arrêterait dès que la mesure dépasserait 520, comme avec un seuil unique.",
        "Mettre true entre les seuils ferait arroser une terre qui n’en a peut-être pas besoin : gaspillage d’eau garanti."
      ],
      exampleGarden: "L’humidité vaut 590. On arrosait ? On continue jusqu’à 650. On n’arrosait pas ? On attend que la mesure descende sous 520. Dans les deux cas, le programme ne change rien.",
      exampleOther: "Un chauffe-eau dont l’eau est à une température intermédiaire ne change rien non plus : s’il chauffait, il continue ; sinon, il attend que l’eau refroidisse davantage.",
      takeaway: "Entre les deux seuils, on n’écrit RIEN : la variable d’état garde sa valeur précédente. C’est cette zone de mémoire qui fait l’hystérésis."
    },
    {
      id: "s5q8",
      theme: "La priorité du réservoir",
      question: "Le réservoir est presque vide et la terre est très sèche. Que doit faire le programme ?",
      choices: [
        "Arroser quand même : la terre très sèche est le problème le plus urgent, le remplissage du réservoir attendra",
        "Mettre demandeArrosage à false : la sécurité du réservoir passe avant tout",
        "Attendre 2 secondes, puis lancer l’arrosage normalement"
      ],
      answer: 1,
      explanation: "Comme depuis la séance 3, la sécurité du réservoir passe avant tout : ce test se fait en premier. Si le niveau d’eau est insuffisant, le programme force demandeArrosage = false;, quelle que soit l’humidité de la terre. Faire tourner la pompe à vide l’abîmerait.",
      whyOthers: [
        "Arroser sans eau ne mouillerait rien du tout et ferait tourner la pompe à vide, ce qui peut la détruire.",
        "",
        "Attendre 2 secondes ne remplira pas le réservoir : le problème resterait entier. Les 2 secondes, c’est la durée de l’impulsion, pas une solution de sécurité."
      ],
      exampleGarden: "Humidité à 430, mais capteur de niveau au plus bas : demandeArrosage = false. Le programme signale plutôt qu’il faut remplir le réservoir.",
      exampleOther: "Une climatisation dont le bac de récupération d’eau est plein s’arrête, même s’il fait très chaud dans la pièce : la sécurité de l’appareil passe avant le confort.",
      takeaway: "Le test du réservoir est toujours prioritaire : niveau insuffisant → demandeArrosage = false, même si la terre est très sèche."
    },
    {
      id: "s5q9",
      theme: "La commande de la pompe",
      question: "Une fois la valeur de demandeArrosage décidée, comment le programme commande-t-il la pompe ?",
      choices: [
        "Il laisse la pompe allumée en continu (HIGH), sans jamais l’éteindre, tant que demandeArrosage vaut true",
        "Il envoie une impulsion de 2 secondes seulement quand demandeArrosage vaut false",
        "if (demandeArrosage) { HIGH, delay(2000), LOW } else { LOW } : une impulsion de 2 secondes si l’arrosage est demandé, pompe éteinte sinon"
      ],
      answer: 2,
      explanation: "On réutilise l’impulsion apprise à la séance 4 : si demandeArrosage est vraie, la pompe reçoit HIGH, on attend 2000 millisecondes avec delay(2000), puis on repasse à LOW. Sinon, la pompe reste simplement à LOW. À chaque tour de loop(), la mesure est refaite et on recommence si besoin.",
      whyOthers: [
        "Une pompe allumée en continu inonderait la plante et empêcherait de re-mesurer l’humidité entre deux arrosages.",
        "C’est l’inverse : false signifie « pas d’arrosage demandé », donc pompe à LOW, pas d’impulsion.",
        ""
      ],
      exampleGarden: "demandeArrosage vaut true : la pompe s’active 2 secondes, s’arrête, la terre absorbe l’eau, le capteur re-mesure, et une nouvelle impulsion part si la terre est encore trop sèche.",
      exampleOther: "Un distributeur automatique de croquettes fonctionne pareil : quand la distribution est demandée, son moteur tourne quelques secondes puis s’arrête, il ne reste jamais allumé en continu.",
      takeaway: "La variable d’état décide, l’impulsion exécute : if (demandeArrosage) → HIGH, delay(2000), LOW ; sinon → LOW."
    },
    {
      id: "s5q10",
      theme: "Économie d’eau et durée de vie",
      question: "Pourquoi l’hystérésis fait-elle économiser l’eau et prolonge-t-elle la durée de vie de la pompe ?",
      choices: [
        "Parce qu’elle évite les démarrages répétés : la pompe s’use moins et n’arrose plus par à-coups",
        "Parce qu’elle réduit la tension électrique envoyée à la pompe",
        "Parce qu’elle n’autorise l’arrosage que la nuit, au moment où l’eau s’évapore beaucoup moins qu’en pleine journée"
      ],
      answer: 0,
      explanation: "Avec le seuil unique, la pompe enchaînait des dizaines de micro-arrosages inutiles : chaque démarrage use le moteur et gaspille de l’eau. Avec l’hystérésis, la pompe démarre une fois, arrose franchement jusqu’au seuil haut, puis reste tranquille longtemps.",
      whyOthers: [
        "",
        "La tension envoyée à la pompe ne change pas : c’est la fréquence des démarrages qui diminue, pas la puissance.",
        "Notre programme ne connaît pas l’heure : il se base uniquement sur l’humidité mesurée et le niveau du réservoir."
      ],
      exampleGarden: "Au lieu de 50 mini-démarrages par heure autour de 520, la pompe fait un vrai cycle d’arrosage de 520 à 650, puis se repose jusqu’à ce que la terre sèche vraiment.",
      exampleOther: "Le moteur d’un réfrigérateur dure des années précisément parce qu’il fait de longs cycles espacés au lieu de s’allumer et de s’éteindre sans arrêt.",
      takeaway: "Moins de démarrages = moins d’usure et moins de gaspillage : l’hystérésis fait faire à la pompe de vrais cycles, espacés et utiles."
    },
    {
      id: "s5q11",
      theme: "Variable locale : le piège",
      question: "Un élève déclare bool demandeArrosage = false; À L’INTÉRIEUR de loop(). Pourquoi son hystérésis ne fonctionne-t-elle pas ?",
      choices: [
        "Parce que le type bool est interdit à l’intérieur de loop() : il doit être déclaré tout en haut du programme",
        "Parce qu’une variable locale est recréée à chaque tour de loop() : elle repart de false et ne mémorise rien",
        "Parce que loop() ne s’exécute qu’une seule fois, au démarrage du programme"
      ],
      answer: 1,
      explanation: "Une variable déclarée dans loop() est locale : elle naît au début du tour et disparaît à la fin. Au tour suivant, elle est recréée avec sa valeur initiale, false. Impossible de se souvenir qu’on était en train d’arroser : la mémorisation, cœur de l’hystérésis, est perdue.",
      whyOthers: [
        "bool est autorisé partout, dans loop() comme ailleurs : ce n’est pas le type le problème, c’est l’endroit de la déclaration.",
        "",
        "C’est l’inverse : loop() se répète sans fin, on le sait depuis la première séance. C’est setup() qui ne s’exécute qu’une fois."
      ],
      exampleGarden: "La terre est sèche, demandeArrosage passe à true… puis le tour de loop() se termine et la variable disparaît. Au tour suivant, elle renaît à false : l’arrosage s’interrompt sans raison dans la zone entre les seuils.",
      exampleOther: "Ce serait un thermostat amnésique : à chaque instant, il oublierait s’il était en train de chauffer et repartirait de zéro, incapable de tenir une décision.",
      takeaway: "Une variable locale déclarée dans loop() repart de sa valeur initiale à chaque tour : elle ne peut rien mémoriser. La variable d’état doit être globale."
    },
    {
      id: "s5q12",
      theme: "Reconnaître une vraie hystérésis",
      question: "Un programme utilise bien deux seuils, mais toutes ses branches if / else if / else commandent directement la pompe, et chacune la ramène à un état fixé, sans variable mémorisée. Est-ce une vraie hystérésis ?",
      choices: [
        "Oui : à partir du moment où il y a deux seuils, c’est une hystérésis",
        "Oui, à condition que les deux seuils soient assez écartés l’un de l’autre pour bloquer les petites oscillations de la mesure",
        "Non : il faut deux seuils ET une variable d’état mémorisée entre les tours"
      ],
      answer: 2,
      explanation: "L’hystérésis, c’est deux seuils PLUS une mémoire. Si chaque branche impose son état à la pompe et qu’aucune valeur n’est conservée entre les tours, la zone entre les seuils ne « retient » rien : le comportement redevient celui d’un simple jeu de conditions, sans mémorisation.",
      whyOthers: [
        "Deux seuils sans mémoire ne suffisent pas : dans la zone intermédiaire, le programme doit pouvoir continuer ce qu’il faisait, donc s’en souvenir.",
        "Écarter les seuils ne crée pas de mémoire : le problème n’est pas la distance entre les seuils, c’est l’absence de variable d’état.",
        ""
      ],
      exampleGarden: "Si le else final éteint toujours la pompe, alors dès que l’humidité entre dans la zone 520-650, l’arrosage en cours s’arrête net : ce n’est pas le comportement voulu.",
      exampleOther: "Une climatisation qui couperait son compresseur dès que la température quitte la zone chaude, au lieu de continuer jusqu’à la température basse, redémarrerait sans cesse : deux réglages ne servent à rien sans mémoire.",
      takeaway: "Pas de mémoire, pas d’hystérésis : deux seuils ne suffisent pas, il faut aussi une variable d’état qui conserve la décision entre les tours de loop()."
    },
    {
      id: "s5q13",
      theme: "Scénario : dans la zone intermédiaire",
      question: "humidite vaut 600, le réservoir est plein, et au tour précédent demandeArrosage valait true. Que se passe-t-il ?",
      choices: [
        "600 est entre 520 et 650 : le programme n’écrit rien, demandeArrosage reste true, et la pompe reçoit une nouvelle impulsion de 2 secondes",
        "demandeArrosage passe à false, car 600 dépasse le seuil de démarrage 520",
        "Aucune condition n’est vraie : le programme se bloque et affiche une erreur"
      ],
      answer: 0,
      explanation: "600 n’est ni en dessous de 520, ni au-dessus de 650 : aucune des deux conditions ne s’applique, donc le programme ne modifie pas demandeArrosage. Elle vaut toujours true, l’arrosage continue par impulsions jusqu’à ce que la mesure dépasse 650.",
      whyOthers: [
        "",
        "Dépasser le seuil de DÉMARRAGE ne suffit pas pour s’arrêter : il faut dépasser le seuil d’ARRÊT, 650. C’est tout l’intérêt des deux seuils.",
        "Un programme ne se bloque pas quand aucun if n’est vrai : il continue simplement sans rien écrire. Et ici, c’est exactement ce qu’on veut !"
      ],
      exampleGarden: "L’arrosage commencé à 505 se poursuit tranquillement à 560, 600, 630… et ne s’arrêtera qu’une fois la barre des 650 franchie : un cycle complet, sans à-coups.",
      exampleOther: "Un chauffe-eau dont l’eau est à mi-chemin entre ses deux températures continue de chauffer s’il avait commencé : il termine son cycle au lieu de s’arrêter en route.",
      takeaway: "Dans la zone intermédiaire, la décision précédente continue : demandeArrosage garde sa valeur et l’arrosage commencé va jusqu’au seuil haut."
    },
    {
      id: "s5q14",
      theme: "Scénario : terre trop sèche",
      question: "humidite vaut 480 et le réservoir contient assez d’eau. Que fait le programme ?",
      choices: [
        "Rien : 480 est dans la zone intermédiaire, entre les deux seuils",
        "Il met demandeArrosage à false, car une terre aussi sèche ne doit pas être arrosée d’un coup",
        "480 < 520, le seuil de démarrage : il met demandeArrosage à true"
      ],
      answer: 2,
      explanation: "480 est en dessous du seuil de démarrage SEUIL_HUMIDITE = 520 : la terre est trop sèche. Comme le réservoir est suffisant, le programme écrit demandeArrosage = true; et la pompe enchaîne des impulsions de 2 secondes, tour après tour, jusqu’à ce que l’humidité dépasse 650.",
      whyOthers: [
        "La zone intermédiaire va de 520 à 650 : 480 est EN DESSOUS de 520, donc la condition de démarrage est bien vraie.",
        "C’est le contraire : plus la terre est sèche, plus elle a besoin d’eau. Et les impulsions de 2 secondes apportent justement l’eau petit à petit.",
        ""
      ],
      exampleGarden: "Mesure à 480, réservoir plein : demandeArrosage passe à true, première impulsion de 2 secondes, la terre boit, on re-mesure, et on recommence tant qu’on n’a pas atteint 650.",
      exampleOther: "Quand la température d’un congélateur remonte au-dessus de son seuil d’alerte, son moteur se met en route et produit du froid jusqu’à revenir à la bonne température.",
      takeaway: "Humidité sous le seuil bas + réservoir suffisant → demandeArrosage = true : l’arrosage par impulsions commence."
    },
    {
      id: "s5q15",
      theme: "Scénario : terre bien arrosée",
      question: "Après plusieurs impulsions d’arrosage, humidite atteint 700. Que se passe-t-il ?",
      choices: [
        "demandeArrosage reste true tant que le réservoir contient de l’eau : c’est le niveau d’eau qui décide",
        "700 > 650, le seuil d’arrêt : demandeArrosage passe à false et la pompe reste à LOW",
        "La pompe accélère pour terminer l’arrosage plus vite"
      ],
      answer: 1,
      explanation: "700 dépasse SEUIL_ARRET = 650 : l’objectif est atteint, la terre est bien humide. Le programme écrit demandeArrosage = false; et la branche else laisse la pompe à LOW. Elle ne redémarrera que lorsque la mesure redescendra sous 520 : un long repos bien mérité.",
      whyOthers: [
        "Le réservoir sert de sécurité, pas de condition d’arrêt : c’est le seuil haut d’humidité qui met fin à l’arrosage.",
        "",
        "La pompe ne connaît que deux états, HIGH ou LOW : elle ne peut pas accélérer. Et l’arrosage est justement terminé !"
      ],
      exampleGarden: "660, puis 700 : le cycle d’arrosage se termine proprement. La pompe restera silencieuse tout le temps que la terre mettra à redescendre sous 520.",
      exampleOther: "Une climatisation qui a bien rafraîchi la pièce coupe son compresseur une fois passée sous sa température basse, et ne le relancera que quand il fera de nouveau vraiment chaud.",
      takeaway: "Humidité au-dessus du seuil haut → demandeArrosage = false : le cycle est terminé, la pompe se repose jusqu’au prochain vrai besoin."
    },
    {
      id: "s5q16",
      theme: "Scénario : la sécurité d’abord",
      question: "humidite vaut 400 (terre très sèche), mais le capteur du réservoir indique un niveau insuffisant. Que vaut demandeArrosage à la fin du tour de loop() ?",
      choices: [
        "false : le test du réservoir est prioritaire ; sans eau disponible, on n’arrose pas, même si la terre est très sèche",
        "true : 400 < 520, la condition de démarrage l’emporte sur tout le reste",
        "Elle garde sa valeur précédente, comme dans la zone entre les deux seuils"
      ],
      answer: 0,
      explanation: "Le test du niveau du réservoir se fait EN PREMIER : s’il est insuffisant, le programme force demandeArrosage = false; et les autres conditions ne changent rien. Protéger la pompe (qui grillerait à vide) passe avant l’envie d’arroser.",
      whyOthers: [
        "",
        "La condition d’humidité ne s’applique que si le réservoir est suffisant : dans notre if / else if, la sécurité est testée avant, donc elle gagne toujours.",
        "La mémorisation ne concerne que la zone entre les seuils, quand le réservoir est suffisant : ici, la sécurité impose false, sans discussion."
      ],
      exampleGarden: "Terre à 400, réservoir vide : pas d’arrosage, demandeArrosage = false. Le jardin attend qu’on remplisse le réservoir, et l’arrosage reprendra tout seul ensuite.",
      exampleOther: "Un chauffe-eau qui détecte un manque d’eau n’allume pas sa résistance, même si l’eau restante est froide : chauffer à vide la détruirait.",
      takeaway: "La sécurité gagne toujours : réservoir insuffisant → demandeArrosage = false, quelles que soient l’humidité et la valeur précédente."
    },
    {
      id: "s5q17",
      theme: "Transfert : le thermostat",
      question: "Un thermostat allume le chauffage sous 19 °C et le coupe au-dessus de 21 °C. Il fait 20 °C dans la pièce. Que fait le chauffage ?",
      choices: [
        "Il s’éteint forcément, car 20 °C est une température confortable où plus personne n’a besoin de chauffage",
        "Il s’allume forcément, car 20 °C est en dessous de 21 °C",
        "Il garde son état précédent : s’il chauffait, il continue ; s’il était éteint, il le reste"
      ],
      answer: 2,
      explanation: "20 °C est entre les deux seuils du thermostat : comme notre programme entre 520 et 650, il ne change rien et conserve sa décision précédente. On ne peut pas deviner l’état du chauffage juste avec la température : il faut connaître son histoire. C’est la signature de l’hystérésis.",
      whyOthers: [
        "À 20 °C, le chauffage peut très bien être encore allumé : s’il montait depuis 18 °C, il continue jusqu’à dépasser 21 °C.",
        "Et il peut aussi être éteint : s’il redescend depuis 22 °C, il ne se rallumera que sous 19 °C. Entre les seuils, rien ne se décide.",
        ""
      ],
      exampleGarden: "C’est exactement notre humidité à 600 : impossible de dire si la pompe arrose sans savoir ce qu’elle faisait avant. La mesure seule ne suffit pas, la mémoire compte.",
      exampleOther: "Pareil pour un réfrigérateur à une température intermédiaire : son moteur continue ou reste coupé selon ce qu’il faisait juste avant.",
      takeaway: "Entre ses deux seuils, un système à hystérésis conserve son état précédent : la mesure seule ne suffit pas à connaître son comportement."
    },
    {
      id: "s5q18",
      theme: "Transfert : pourquoi deux températures",
      question: "Pourquoi le thermostat utilise-t-il deux températures (19 °C et 21 °C) plutôt qu’une seule (20 °C) ?",
      choices: [
        "Parce qu’il est physiquement impossible, même avec un excellent capteur, de mesurer une température d’exactement 20 °C",
        "Pour éviter les allumages et extinctions sans fin quand la température oscille autour de 20 °C",
        "Pour pouvoir chauffer deux pièces différentes de la maison en même temps"
      ],
      answer: 1,
      explanation: "Avec un seul réglage à 20 °C, la température de la pièce oscillerait autour : 19,9 °C, on allume ; 20,1 °C, on éteint ; et ainsi de suite. Les deux températures créent une zone tampon de 2 °C : le chauffage fait de longs cycles au lieu de s’agiter. C’est le même raisonnement que nos seuils 520 et 650.",
      whyOthers: [
        "On sait très bien mesurer 20 °C : le problème n’est pas la précision de la mesure, c’est son oscillation naturelle autour du seuil.",
        "",
        "Les deux températures concernent la même pièce : ce sont un seuil d’allumage et un seuil d’extinction, pas deux zones à chauffer."
      ],
      exampleGarden: "Nos 520 et 650 jouent le même rôle que les 19 °C et 21 °C : un écart volontaire entre démarrage et arrêt pour que la pompe travaille par vrais cycles.",
      exampleOther: "Le compresseur d’une climatisation est protégé de la même façon : une température d’enclenchement et une température de coupure bien distinctes lui évitent les à-coups qui l’useraient.",
      takeaway: "Deux seuils écartés créent une zone tampon : le système fait de longs cycles réguliers au lieu d’osciller sans fin autour d’une valeur unique."
    },
    {
      id: "s5q19",
      theme: "L’impulsion de 2 secondes",
      question: "Dans if (demandeArrosage) { digitalWrite(POMPE, HIGH); delay(2000); digitalWrite(POMPE, LOW); }, combien de temps la pompe reste-t-elle allumée ?",
      choices: [
        "2 secondes : delay(2000) fait patienter le programme 2000 millisecondes entre le HIGH et le LOW",
        "2000 secondes, soit un peu plus d’une demi-heure",
        "Elle reste allumée tant que demandeArrosage vaut true, sans jamais s’arrêter"
      ],
      answer: 0,
      explanation: "delay() compte en MILLISECONDES : 2000 ms = 2 s. La pompe passe à HIGH, le programme attend 2 secondes, puis elle repasse à LOW : c’est l’impulsion de la séance 4. Si la terre est encore trop sèche au tour suivant, une nouvelle impulsion repart.",
      whyOthers: [
        "",
        "Attention à l’unité : delay() compte en millisecondes, pas en secondes. 2000 ms font 2 s, pas 2000 s !",
        "Le LOW est écrit juste après le delay(2000) : l’impulsion s’arrête toujours au bout de 2 secondes, même si demandeArrosage reste true. C’est le tour suivant qui relancera une impulsion."
      ],
      exampleGarden: "Chaque impulsion verse l’équivalent d’un petit verre d’eau, puis laisse à la terre le temps de l’absorber avant la mesure suivante : un arrosage doux et progressif.",
      exampleOther: "Un sèche-mains automatique souffle pendant une durée fixe puis s’arrête : si les mains sont encore mouillées, on repasse les mains et il relance un cycle.",
      takeaway: "delay(2000) = 2000 millisecondes = 2 secondes : l’impulsion HIGH → attente → LOW dure exactement 2 s, puis la main revient au programme."
    },
    {
      id: "s5q20",
      theme: "Transfert : l’hystérésis autour de nous",
      question: "Parmi ces objets, lequel utilise le même principe d’hystérésis que notre arrosage automatique ?",
      choices: [
        "Une lampe de poche, qu’on allume et qu’on éteint soi-même avec un bouton",
        "Un réfrigérateur, qui relance son moteur quand il fait trop chaud à l’intérieur et le coupe une fois revenu au frais",
        "Une calculatrice, qui affiche le résultat du calcul qu’on vient de taper"
      ],
      answer: 1,
      explanation: "Le réfrigérateur a tout de l’hystérésis : un capteur de température, un seuil haut qui déclenche le froid, un seuil bas qui l’arrête, et une mémoire de son état entre les deux. Comme notre jardin, il régule une grandeur mesurée en évitant les démarrages incessants de son moteur.",
      whyOthers: [
        "La lampe de poche obéit directement à la main de l’utilisateur : pas de capteur, pas de seuils, pas de décision automatique.",
        "",
        "La calculatrice effectue un calcul à la demande : elle ne mesure rien en continu et n’a aucun état à réguler."
      ],
      exampleGarden: "Notre jardin fait partie de cette grande famille : mesurer une grandeur (l’humidité), la maintenir entre deux seuils, et mémoriser sa décision d’un tour de loop() à l’autre.",
      exampleOther: "Chauffe-eau, thermostat, climatisation, congélateur : tous ces objets régulent une température entre un seuil de mise en route et un seuil d’arrêt, avec un état mémorisé. L’hystérésis est partout autour de nous.",
      takeaway: "Dès qu’un objet régule automatiquement une grandeur entre un seuil de démarrage et un seuil d’arrêt, avec un état mémorisé, c’est une hystérésis."
    }
  ]
};
