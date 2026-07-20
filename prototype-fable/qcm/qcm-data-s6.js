/* TechnoQuest — QCM de la séance 6 : Décider avec trois données.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s6q1 à s6q10 : essentielles · s6q11 à s6q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[6] = {
  session: 6,
  title: "Séance 6 — Décider avec trois données",
  questions: [
    {
      id: "s6q1",
      theme: "Décision multicritère",
      question: "Quelle est la grande nouveauté du programme de la séance 6 par rapport à la séance 5 ?",
      choices: [
        "Le programme n’utilise plus aucun seuil : il déclenche l’arrosage à heures fixes, quelles que soient les mesures",
        "La décision d’arroser combine désormais trois mesures : humidité, niveau d’eau et luminosité",
        "Le capteur d’humidité est supprimé et remplacé par la photorésistance"
      ],
      answer: 1,
      explanation: "En séance 6, on ajoute un troisième critère : la luminosité mesurée par la LDR sur A1. Le programme décide d’arroser seulement si le sol est sec, si le réservoir contient assez d’eau ET s’il ne fait pas trop lumineux. C’est une décision multicritère.",
      whyOthers: [
        "Au contraire, aucun horaire fixe n’est programmé : les seuils restent au cœur du programme, avec SEUIL_HUMIDITE, SEUIL_RESERVOIR et maintenant SEUIL_LUMIERE.",
        "",
        "Le capteur d’humidité reste indispensable : la LDR ajoute une information, elle ne remplace rien."
      ],
      exampleGarden: "Sol sec, réservoir plein, ciel couvert : les trois critères sont réunis, la pompe s’active 2 secondes. En plein soleil, même sol sec, elle attend.",
      exampleOther: "Des essuie-glaces automatiques combinent aussi plusieurs informations : pluie détectée ET contact mis ET vitesse du véhicule, avant de se déclencher.",
      takeaway: "Séance 6 = décision multicritère : trois mesures combinées pour décider d’arroser."
    },
    {
      id: "s6q2",
      theme: "La photorésistance LDR",
      question: "Quel est le rôle de la photorésistance (LDR) branchée sur l’entrée A1 ?",
      choices: [
        "Mesurer la luminosité ambiante autour de la plante",
        "Mesurer l’humidité du sol plus précisément que le capteur de la séance 2",
        "Mesurer la température de l’air autour de la plante"
      ],
      answer: 0,
      explanation: "LDR signifie « Light Dependent Resistor » : une résistance qui varie avec la lumière. Branchée sur A1, elle donne une valeur ADC entre 0 et 1023 qui reflète la luminosité ambiante. Le programme la compare à SEUIL_LUMIERE (700).",
      whyOthers: [
        "",
        "Une LDR ne réagit qu’à la lumière : elle ne sait rien de l’eau contenue dans la terre.",
        "La LDR est sensible à la lumière, pas à la température : ce serait le rôle d’un autre capteur."
      ],
      exampleGarden: "Sur le prototype, on cache la LDR avec la main : la valeur lue sur A1 change, et on voit la décision d’arrosage évoluer dans le moniteur série.",
      exampleOther: "Les lampadaires d’éclairage de rue utilisent une cellule du même type : quand la nuit tombe, la mesure de lumière franchit un seuil et les lampes s’allument.",
      takeaway: "La LDR sur A1 mesure la luminosité, comparée au seuil SEUIL_LUMIERE = 700."
    },
    {
      id: "s6q3",
      theme: "Pourquoi le critère lumière",
      question: "Pourquoi le jardin connecté évite-t-il d’arroser en plein soleil ?",
      choices: [
        "Parce que le moteur de la pompe s’arrête automatiquement dès qu’il fait trop chaud",
        "Parce que l’eau du réservoir devient trop froide pour la plante",
        "Parce que l’eau s’évapore vite et que les gouttes font loupe sur les feuilles"
      ],
      answer: 2,
      explanation: "En plein soleil, une grande partie de l’eau s’évapore avant de profiter aux racines : c’est du gaspillage. De plus, les gouttes posées sur les feuilles peuvent concentrer la lumière comme de petites loupes et abîmer la plante. Arroser quand la lumière est plus faible est donc plus efficace.",
      whyOthers: [
        "La pompe n’a aucune sécurité liée à la chaleur et fonctionne très bien au soleil : c’est l’efficacité de l’arrosage qui pose problème, pas le moteur.",
        "La température de l’eau du réservoir n’est pas la raison retenue : le vrai problème est l’évaporation et l’effet loupe.",
        ""
      ],
      exampleGarden: "À midi en été, un arrosage de 2 secondes perd beaucoup d’eau par évaporation ; le soir, la même impulsion humidifie bien mieux la terre.",
      exampleOther: "Les services d’arrosage municipal des espaces verts programment souvent l’arrosage tôt le matin ou le soir, exactement pour la même raison.",
      takeaway: "On n’arrose pas en plein soleil : évaporation forte et gouttes-loupes sur les feuilles."
    },
    {
      id: "s6q4",
      theme: "Deux && pour trois critères",
      question: "Pour relier TROIS critères dans une seule condition if, combien d’opérateurs && faut-il écrire ?",
      choices: [
        "Trois, un devant chaque critère",
        "Deux, un entre chaque paire de critères qui se suivent",
        "Un seul, placé au milieu de la condition"
      ],
      answer: 1,
      explanation: "L’opérateur && relie deux expressions entre elles. Pour trois critères, il faut donc deux && : critère1 && critère2 && critère3. C’est comme relier trois wagons : il faut deux attelages.",
      whyOthers: [
        "Un && se place ENTRE deux critères, jamais devant le premier : trois && seraient une erreur de syntaxe.",
        "",
        "Un seul && ne relierait que deux critères : le troisième resterait en dehors de la condition."
      ],
      exampleGarden: "if (humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR && lumiere < SEUIL_LUMIERE) : on compte bien deux && pour trois comparaisons.",
      exampleOther: "Dans une serre agricole, un programme peut écrire : temperatureBasse && ventFaible && nuit, avec deux && aussi, pour décider de fermer les ouvrants.",
      takeaway: "Trois critères = deux && : un opérateur entre chaque paire de critères."
    },
    {
      id: "s6q5",
      theme: "Un seul critère faux",
      question: "Dans la condition à trois critères reliés par &&, que se passe-t-il si UN SEUL des trois critères est faux ?",
      choices: [
        "La condition entière est fausse : le programme n’arrose pas",
        "La condition reste vraie tant que deux critères sur trois sont vrais",
        "Le programme arrose quand même, mais moins longtemps"
      ],
      answer: 0,
      explanation: "Avec &&, TOUS les critères doivent être vrais en même temps pour que la condition soit vraie. Un seul critère faux suffit à rendre toute la condition fausse : le programme passe dans le else et arrête l’arrosage. C’est déjà ce qu’on avait vu avec deux critères en séance 5, et cela reste vrai avec trois.",
      whyOthers: [
        "",
        "Ce serait une décision « à la majorité », mais && ne fonctionne pas ainsi : il exige l’unanimité des critères.",
        "La durée d’arrosage (2 secondes) ne change pas : soit la condition est vraie et on arrose, soit elle est fausse et on n’arrose pas."
      ],
      exampleGarden: "Sol sec et réservoir plein, mais plein soleil : le critère lumière est faux, donc pas d’arrosage. Il faut attendre que la luminosité baisse.",
      exampleOther: "Une voiture ne démarre en mode « start » que si : frein appuyé ET bon badge détecté ET levier au point mort. Une seule condition manquante et rien ne se passe.",
      takeaway: "Avec &&, un seul critère faux rend toute la condition fausse : pas d’arrosage."
    },
    {
      id: "s6q6",
      theme: "La condition complète",
      question: "Quelle condition correspond exactement à la décision d’arrosage de la séance 6 ?",
      choices: [
        "if (humidite < SEUIL_HUMIDITE || niveauEau >= SEUIL_RESERVOIR || lumiere < SEUIL_LUMIERE)",
        "if (humidite > SEUIL_HUMIDITE && niveauEau < SEUIL_RESERVOIR && lumiere > SEUIL_LUMIERE)",
        "if (humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR && lumiere < SEUIL_LUMIERE)"
      ],
      answer: 2,
      explanation: "On arrose si : le sol est sec (humidite < 520), ET le réservoir contient assez d’eau (niveauEau >= 350), ET la lumière est assez faible (lumiere < 700). Les trois comparaisons sont reliées par deux && : toutes doivent être vraies ensemble.",
      whyOthers: [
        "Avec || (OU), un seul critère vrai suffirait : le jardin pourrait arroser réservoir vide ou en plein soleil, ce qu’on veut justement éviter.",
        "Les sens de comparaison sont inversés : cette condition arroserait un sol humide, avec un réservoir vide, en plein soleil !",
        ""
      ],
      exampleGarden: "Avec humidite = 400, niveauEau = 600 et lumiere = 300 : 400 < 520 vrai, 600 >= 350 vrai, 300 < 700 vrai. Les trois sont vrais : arrosage de 2 secondes.",
      exampleOther: "Un lave-linge combine les mêmes idées : porte fermée ET arrivée d’eau ouverte ET programme choisi, avant de lancer le cycle.",
      takeaway: "La bonne condition : sec ET assez d’eau ET lumière faible, reliés par deux &&."
    },
    {
      id: "s6q7",
      theme: "Limite du critère lumière",
      question: "La photorésistance peut-elle remplacer le capteur d’humidité du sol ?",
      choices: [
        "Non : la LDR mesure la lumière et complète la décision sans remplacer le capteur d’humidité",
        "Oui : quand il fait sombre, le sol est forcément humide",
        "Oui : la LDR est un composant plus récent, donc plus précis pour mesurer toutes les grandeurs du jardin"
      ],
      answer: 0,
      explanation: "Chaque capteur mesure UNE grandeur physique. La LDR mesure la lumière, rien d’autre. Elle apporte une information supplémentaire utile (est-ce le bon moment pour arroser ?), mais seule la sonde d’humidité dit si la plante a besoin d’eau. Les deux capteurs se complètent, ils ne s’échangent pas.",
      whyOthers: [
        "",
        "Il peut faire nuit avec un sol très sec, ou grand soleil après une pluie : lumière et humidité du sol sont deux informations indépendantes.",
        "Une LDR n’est ni plus ni moins « moderne » : elle est simplement conçue pour mesurer la lumière, pas l’eau dans la terre."
      ],
      exampleGarden: "Une nuit de canicule : il fait sombre (lumiere < 700) mais le sol peut être très sec ou déjà arrosé. Sans le capteur A0, impossible de le savoir.",
      exampleOther: "Sur une voiture, le capteur de pluie ne remplace pas le capteur de vitesse : chacun renseigne les essuie-glaces sur une chose différente.",
      takeaway: "La LDR complète la décision, mais seule la sonde d’humidité mesure l’eau du sol."
    },
    {
      id: "s6q8",
      theme: "Le seuil de lumière",
      question: "Avec SEUIL_LUMIERE = 700, quand le critère lumière autorise-t-il l’arrosage dans notre programme ?",
      choices: [
        "Quand lumiere est exactement égale à 700",
        "Quand lumiere < 700, c’est-à-dire quand la valeur lue est en dessous du seuil",
        "Quand lumiere > 700, c’est-à-dire quand la valeur lue dépasse le seuil"
      ],
      answer: 1,
      explanation: "Dans la condition de la séance 6, le critère s’écrit lumiere < SEUIL_LUMIERE. Le critère est donc vrai quand la valeur lue sur A1 est inférieure à 700, ce qui correspond, sur notre montage, à une lumière assez faible pour arroser sans gaspiller.",
      whyOthers: [
        "L’égalité exacte est un cas très rare et ce n’est pas ce que teste l’opérateur < : on compare une plage de valeurs, pas un nombre unique.",
        "",
        "lumiere > 700 correspondrait au cas opposé : sur notre montage, ce serait autoriser l’arrosage justement quand il fait très lumineux."
      ],
      exampleGarden: "En fin de journée, la mesure passe de 850 à 640 : elle vient de descendre sous 700, le critère lumière devient vrai et l’arrosage redevient possible.",
      exampleOther: "Un éclairage de rue fait le même type de comparaison à un seuil sur sa mesure de lumière pour choisir le moment d’allumer les lampadaires.",
      takeaway: "Critère lumière du programme : vrai quand lumiere < SEUIL_LUMIERE (700)."
    },
    {
      id: "s6q9",
      theme: "Afficher les trois mesures",
      question: "Pourquoi le programme affiche-t-il les TROIS mesures (humidité, niveau, lumière) avec Serial.println ?",
      choices: [
        "Parce que Serial.println est obligatoire pour que les capteurs fonctionnent",
        "Pour ralentir le programme et économiser la batterie",
        "Pour vérifier chaque valeur lue et comprendre pourquoi le programme arrose ou non"
      ],
      answer: 2,
      explanation: "Avec trois critères, il devient difficile de deviner « de tête » pourquoi la pompe reste arrêtée. En affichant humidite, niveauEau et lumiere dans le moniteur série, on voit d’un coup d'œil quel critère est vrai ou faux, et on peut vérifier ou régler les seuils.",
      whyOthers: [
        "Les capteurs fonctionnent très bien sans affichage : analogRead suffit à lire les valeurs. L’affichage sert à l’humain, pas au capteur.",
        "Ce n’est pas le but : l’affichage sert à observer et à déboguer, pas à ralentir le programme.",
        ""
      ],
      exampleGarden: "Le moniteur affiche : humidite 480, niveau 200, lumiere 350. On comprend aussitôt : sol sec et lumière faible, mais réservoir trop bas, d’où l’absence d’arrosage.",
      exampleOther: "Le tableau de bord d’une serre agricole affiche température, hygrométrie et lumière : le jardinier comprend les décisions automatiques en un regard.",
      takeaway: "Afficher les trois mesures permet de comprendre et de vérifier chaque décision."
    },
    {
      id: "s6q10",
      theme: "Sens de variation de la LDR",
      question: "La valeur lue sur A1 augmente-t-elle toujours quand la lumière augmente ?",
      choices: [
        "Non : le sens de variation dépend du montage de la LDR, il faut l’observer sur son propre prototype",
        "Oui : sur tous les montages possibles, davantage de lumière donne toujours une valeur lue plus grande sur A1",
        "Non : la valeur lue sur A1 ne change jamais, seul le seuil compte"
      ],
      answer: 0,
      explanation: "La LDR se branche avec une autre résistance. Selon la position de la LDR dans ce montage, la valeur lue sur A1 peut monter OU descendre quand la lumière augmente. Avant de choisir le sens de la comparaison, on observe donc les valeurs au moniteur série, en éclairant puis en cachant la LDR.",
      whyOthers: [
        "",
        "C’est justement le piège : deux montages corrects peuvent donner des sens de variation opposés. Il faut tester le sien.",
        "La valeur lue varie bien avec la lumière : c’est cette variation qu’on compare au seuil."
      ],
      exampleGarden: "Deux binômes de la classe obtiennent des résultats opposés en cachant leur LDR : leurs montages diffèrent. Chacun ajuste le sens de sa comparaison après observation.",
      exampleOther: "Un technicien qui installe une cellule d’éclairage de rue vérifie aussi le sens de la mesure avant de régler le seuil de déclenchement des lampadaires.",
      takeaway: "Le sens de variation de la LDR dépend du montage : observer avant de programmer."
    },
    {
      id: "s6q11",
      theme: "Ordre de lecture des capteurs",
      question: "Dans la boucle loop, à quel moment faut-il lire les trois capteurs ?",
      choices: [
        "Un seul suffit : les deux autres valeurs sont recopiées automatiquement",
        "Après la décision d’arrosage, pour vérifier ensuite que le programme a eu raison de se déclencher",
        "Tous les trois avant le if, pour décider avec des mesures fraîches et cohérentes"
      ],
      answer: 2,
      explanation: "On lit d’abord A0, A1 et A2 avec analogRead, on range les valeurs dans trois variables, PUIS on écrit la condition. Ainsi la décision s’appuie sur trois mesures prises quasiment au même instant : c’est la démarche mesurer, puis décider, puis agir.",
      whyOthers: [
        "Chaque entrée analogique doit être lue par son propre analogRead : rien n’est recopié tout seul.",
        "Décider avant de mesurer n’a pas de sens : le if a besoin des trois valeurs pour évaluer ses critères.",
        ""
      ],
      exampleGarden: "En début de loop : humidite = analogRead(A0); lumiere = analogRead(A1); niveauEau = analogRead(A2); puis vient le if à trois critères.",
      exampleOther: "Des essuie-glaces automatiques lisent d’abord la pluie et la vitesse, puis choisissent la cadence de balayage : mesurer avant de décider, toujours.",
      takeaway: "Lire les trois capteurs avant le if : on décide sur des mesures fraîches."
    },
    {
      id: "s6q12",
      theme: "Cas concret : plein soleil",
      question: "Mesures : humidite = 400, niveauEau = 600, lumiere = 900. Que fait le programme de la séance 6 ?",
      choices: [
        "Il arrose 2 secondes, car le sol est sec et le réservoir est plein",
        "Il n’arrose pas : la lumière (900) n’est pas inférieure à 700, donc un critère est faux",
        "Il arrose 1 seconde seulement, pour compenser l’évaporation"
      ],
      answer: 1,
      explanation: "Vérifions critère par critère : 400 < 520 vrai (sol sec) ; 600 >= 350 vrai (assez d’eau) ; 900 < 700 FAUX (trop lumineux). Un critère faux rend toute la condition fausse : le programme passe dans le else et n’arrose pas. Il attendra que la luminosité baisse.",
      whyOthers: [
        "Deux critères vrais ne suffisent pas : le && exige les trois. Ici le critère lumière bloque l’arrosage, volontairement.",
        "",
        "Le programme ne module pas la durée : l’impulsion reste de 2 secondes quand la condition est vraie, et il n’y a aucun arrosage quand elle est fausse."
      ],
      exampleGarden: "C’est le scénario « midi en été » : la plante a soif, mais arroser maintenant gaspillerait l’eau. Le soir venu, lumiere descend sous 700 et l’arrosage part.",
      exampleOther: "Un arrosage municipal fait pareil : même pelouse sèche et cuves pleines, il attend la fin de journée pour déclencher les asperseurs.",
      takeaway: "Trois critères s’évaluent un par un : ici la lumière est trop forte, donc pas d’arrosage."
    },
    {
      id: "s6q13",
      theme: "Cas concret : réservoir bas",
      question: "Mesures : humidite = 450, niveauEau = 200, lumiere = 300. Pourquoi la pompe reste-t-elle arrêtée ?",
      choices: [
        "Parce que niveauEau (200) est sous SEUIL_RESERVOIR (350) : la sécurité réservoir bloque l’arrosage",
        "Parce que la lumière mesurée (300) est bien trop faible pour autoriser un arrosage sans danger pour la plante",
        "Parce que le sol (450) est encore trop humide pour déclencher un arrosage"
      ],
      answer: 0,
      explanation: "Critère par critère : 450 < 520 vrai (sol sec) ; 200 >= 350 FAUX (pas assez d’eau) ; 300 < 700 vrai (lumière faible). Le critère du réservoir est faux, donc la condition entière est fausse. C’est la sécurité vue en séance 5 : jamais de pompe qui tourne à vide, même avec trois critères.",
      whyOthers: [
        "",
        "300 < 700 : le critère lumière est vrai, il autorise l’arrosage. Ce n’est pas lui qui bloque.",
        "450 < 520 : le sol est bien considéré comme sec. C’est le manque d’eau dans le réservoir qui empêche d’arroser."
      ],
      exampleGarden: "Le moniteur série affiche les trois valeurs : on repère tout de suite le 200 du réservoir, et on sait qu’il faut le remplir avant d’espérer un arrosage.",
      exampleOther: "Une serre agricole coupe aussi sa brumisation quand la cuve d’eau descend sous un niveau minimal, quelles que soient les autres mesures.",
      takeaway: "La sécurité réservoir reste prioritaire : sans eau, aucun autre critère ne peut déclencher la pompe."
    },
    {
      id: "s6q14",
      theme: "De deux à trois critères",
      question: "Qu’apporte le troisième critère (lumière) par rapport au programme à deux critères de la séance 5 ?",
      choices: [
        "Il rend le programme plus rapide à exécuter sur la carte Arduino",
        "Il remplace complètement la sécurité réservoir de la séance 5, qui deviendrait inutile avec la mesure de lumière",
        "Il choisit un meilleur moment pour arroser, en plus de savoir s’il faut arroser et si on peut le faire"
      ],
      answer: 2,
      explanation: "Chaque critère répond à une question différente : l’humidité dit s’il FAUT arroser, le niveau d’eau dit si on PEUT arroser, la lumière dit si c’est le BON MOMENT. Le système devient plus économe et plus respectueux de la plante, sans rien perdre des sécurités déjà en place.",
      whyOthers: [
        "La vitesse d’exécution ne change presque pas : une comparaison de plus est instantanée pour la carte. L’intérêt est dans la qualité de la décision.",
        "La sécurité réservoir reste indispensable : la lumière ne dit rien du contenu de la cuve. Les critères s’ajoutent, ils ne se remplacent pas.",
        ""
      ],
      exampleGarden: "Séance 5 : sol sec + eau disponible, on arrose, même à midi. Séance 6 : mêmes conditions, mais l’arrosage attend la baisse de lumière du soir.",
      exampleOther: "Un chauffe-eau « heures creuses » ajoute aussi un critère de moment : eau à réchauffer ET tarif avantageux, pour chauffer au meilleur moment.",
      takeaway: "Humidité = faut-il ? Réservoir = peut-on ? Lumière = est-ce le bon moment ?"
    },
    {
      id: "s6q15",
      theme: "Transfert : essuie-glaces",
      question: "Des essuie-glaces automatiques se déclenchent si : pluie détectée && moteur allumé && commande en mode auto. Quel point commun avec notre jardin connecté ?",
      choices: [
        "Aucun : une voiture n’a pas de capteur d’humidité de sol",
        "Les deux systèmes exigent que tous leurs critères soient vrais ensemble avant d’agir",
        "Les deux systèmes utilisent exactement les mêmes capteurs, simplement installés à des endroits différents"
      ],
      answer: 1,
      explanation: "Les capteurs diffèrent, mais la LOGIQUE est identique : plusieurs critères reliés par des && et une action déclenchée seulement quand tous sont vrais. C’est cette structure de décision multicritère qu’on apprend à reconnaître dans les objets techniques qui nous entourent.",
      whyOthers: [
        "Ce sont les capteurs qui changent, pas la logique : la structure « critère && critère && critère » est exactement la même.",
        "",
        "Un détecteur de pluie n’a rien à voir avec une sonde d’humidité de sol : c’est la structure du programme qui est commune, pas le matériel."
      ],
      exampleGarden: "Notre if à deux && (humidité, réservoir, lumière) a la même forme que celui des essuie-glaces : trois critères, une action.",
      exampleOther: "Sur la voiture : s’il pleut mais que le mode auto est désactivé, rien ne bouge. Un critère faux bloque tout, comme dans notre jardin.",
      takeaway: "La décision multicritère avec && se retrouve dans de nombreux objets techniques."
    },
    {
      id: "s6q16",
      theme: "Transfert : éclairage de rue",
      question: "Un éclairage de rue s’allume quand sa cellule mesure une lumière sous un seuil. Quel élément de notre jardin joue un rôle semblable à cette cellule ?",
      choices: [
        "La photorésistance LDR branchée sur A1, comparée à SEUIL_LUMIERE",
        "La pompe d’arrosage, qui agit sur le monde réel",
        "La variable qui mémorise l’état de l’hystérésis"
      ],
      answer: 0,
      explanation: "Dans les deux systèmes, un capteur de lumière fournit une valeur qu’un programme compare à un seuil pour décider. Lampadaire : lumière faible, on allume. Jardin : lumière faible (et sol sec, et réservoir suffisant), on arrose. Même brique technique, usages différents.",
      whyOthers: [
        "",
        "La pompe est un actionneur : elle exécute la décision, elle ne mesure rien. L’équivalent côté lampadaire serait l’ampoule.",
        "La variable d’hystérésis est une mémoire interne du programme, pas un capteur qui mesure la lumière."
      ],
      exampleGarden: "Notre LDR sur A1 et sa comparaison lumiere < 700 forment le même duo capteur + seuil que la cellule du lampadaire.",
      exampleOther: "Certaines voitures allument aussi leurs feux automatiquement grâce à un capteur de lumière et un seuil : encore la même brique.",
      takeaway: "Capteur de lumière + seuil : une brique qu’on retrouve du lampadaire au jardin connecté."
    },
    {
      id: "s6q17",
      theme: "Transfert : serre agricole",
      question: "Une serre agricole déclenche son ombrage automatique si : forte lumière && température élevée && vent faible. Combien de critères doivent être vrais pour que la toile se déploie ?",
      choices: [
        "Un seul suffit, n’importe lequel",
        "Deux sur trois, à la majorité",
        "Les trois à la fois, car ils sont reliés par des &&"
      ],
      answer: 2,
      explanation: "Comme dans notre programme d’arrosage, les && exigent que tous les critères soient vrais simultanément. Forte lumière et chaleur mais vent fort : la toile reste repliée (elle pourrait s’abîmer). C’est exactement la logique du jardin : un critère faux suffit à bloquer l’action.",
      whyOthers: [
        "Avec un seul critère vrai, la condition && reste fausse : ce comportement « un seul suffit » correspondrait à l’opérateur ||.",
        "Le && ne fait pas de vote à la majorité : deux critères vrais et un faux donnent une condition fausse.",
        ""
      ],
      exampleGarden: "Notre pompe obéit à la même règle : sol sec et lumière faible ne suffisent pas si le réservoir est bas.",
      exampleOther: "Dans la serre : soleil éclatant, 35 degrés, mais rafales de vent : l’ombrage attend une accalmie, exactement comme notre arrosage attend le bon moment.",
      takeaway: "Dans une condition &&, l’action n’a lieu que si TOUS les critères sont vrais ensemble."
    },
    {
      id: "s6q18",
      theme: "Impulsion de 2 secondes",
      question: "Pourquoi garde-t-on l’arrosage par impulsion de 2 secondes dans le programme à trois critères ?",
      choices: [
        "Parce que le moteur d’une petite pompe comme la nôtre ne peut jamais fonctionner plus de 2 secondes d’affilée",
        "Parce qu’une petite dose laisse l’eau s’infiltrer avant la mesure suivante et évite de noyer la plante",
        "Parce que 2 secondes suffisent à remplir complètement le réservoir"
      ],
      answer: 1,
      explanation: "C’est un acquis des séances précédentes qui reste valable : après une impulsion courte, l’eau met du temps à s’infiltrer et la mesure d’humidité remonte progressivement. Arroser par petites doses, mesurer, puis décider à nouveau : le cycle évite l’excès d’eau, quel que soit le nombre de critères.",
      whyOthers: [
        "Techniquement, la pompe pourrait tourner bien plus longtemps : c’est un choix de programmation pour doser l’eau, pas une limite du matériel.",
        "",
        "L’impulsion VIDE un peu le réservoir vers la plante, elle ne le remplit pas : c’est l’inverse."
      ],
      exampleGarden: "Cycle complet : mesurer les trois valeurs, arroser 2 secondes si les trois critères sont vrais, laisser l’eau s’infiltrer, puis remesurer au tour suivant.",
      exampleOther: "Les brumisateurs de rayons de légumes en magasin fonctionnent aussi par brèves impulsions régulières plutôt qu’en jet continu.",
      takeaway: "Petites doses de 2 s + nouvelles mesures : on dose l’eau au lieu de noyer la plante."
    },
    {
      id: "s6q19",
      theme: "Limite : LDR seule",
      question: "Un élève propose de supprimer le capteur d’humidité : « la LDR suffit, on arrosera chaque soir quand il fait sombre ». Quel problème ce choix pose-t-il ?",
      choices: [
        "Aucun : c’est une amélioration, le programme devient plus simple",
        "La LDR tomberait rapidement en panne si elle restait branchée toute seule sur la carte Arduino",
        "Le système arroserait sans savoir si la plante en a besoin, sol trempé comme sol sec"
      ],
      answer: 2,
      explanation: "La luminosité renseigne sur le MOMENT, pas sur le BESOIN. Sans la sonde d’humidité, le programme arroserait tous les soirs, y compris après une pluie, et pourrait noyer la plante ou gaspiller le réservoir. La LDR complète la décision, elle ne remplace pas la mesure d’humidité : c’est la limite vue en séance 6.",
      whyOthers: [
        "Plus simple, oui, mais moins pertinent : on perdrait l’information essentielle, le besoin en eau de la plante.",
        "Une LDR fonctionne très bien seule électriquement : le problème est dans l’information manquante, pas dans le matériel.",
        ""
      ],
      exampleGarden: "Semaine pluvieuse : sol détrempé chaque soir, et pourtant ce programme « LDR seule » arroserait quand même à la nuit tombée.",
      exampleOther: "Des essuie-glaces qui se déclencheraient chaque soir « parce qu’il fait nuit », sans capteur de pluie, balaieraient un pare-brise parfaitement sec.",
      takeaway: "Chaque capteur a son rôle : supprimer la mesure d’humidité ferait arroser sans connaître le besoin."
    },
    {
      id: "s6q20",
      theme: "Déboguer avec trois critères",
      question: "Le sol est sec et il fait sombre, mais la pompe ne démarre jamais. Quelle est la démarche la plus efficace pour trouver la cause ?",
      choices: [
        "Lire les trois valeurs affichées au moniteur série et vérifier chaque critère face à son seuil",
        "Modifier les seuils au hasard, l’un après l’autre, jusqu’à ce que la pompe finisse par démarrer",
        "Remplacer immédiatement la pompe, qui est forcément en panne"
      ],
      answer: 0,
      explanation: "Avec trois critères, la démarche est méthodique : ouvrir le moniteur série, lire humidite, niveauEau et lumiere, puis comparer chaque valeur à son seuil. Ici, deux critères semblent vrais : le suspect naturel est le troisième, souvent un réservoir sous 350. Les mesures affichées le confirment en quelques secondes.",
      whyOthers: [
        "",
        "Modifier les seuils au hasard peut « forcer » la pompe, mais casse la logique du système : on pourrait arroser réservoir vide ou en plein soleil.",
        "Changer la pompe sans observer les mesures, c’est agir avant de comprendre : si un critère est faux, une pompe neuve restera tout aussi silencieuse."
      ],
      exampleGarden: "Moniteur série : humidite 470, lumiere 320, niveau 240. Diagnostic immédiat : 240 < 350, le réservoir manque d’eau. On le remplit, l’arrosage repart.",
      exampleOther: "Un technicien qui dépanne un arrosage municipal consulte d’abord les mesures de la centrale (pression, niveau des cuves, programmation) avant de toucher au matériel.",
      takeaway: "Pour déboguer un système multicritère : afficher les mesures et tester chaque critère un par un."
    }
  ]
};
