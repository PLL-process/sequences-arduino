/* TechnoQuest — QCM de la séance 2 : Calibrer un seuil.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s2q1 à s2q10 : essentielles · s2q11 à s2q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[2] = {
  session: 2,
  title: "Séance 2 — Calibrer un seuil",
  questions: [
    {
      id: "s2q1",
      theme: "Convertisseur analogique-numérique (CAN)",
      question: "Dans la carte Arduino, quel est le rôle du convertisseur analogique-numérique (CAN, ou ADC en anglais) ?",
      choices: [
        "Il transforme un nombre du programme en une tension, afin de faire tourner la pompe branchée sur le relais de la broche D6.",
        "Il transforme la tension mesurée sur une broche analogique en un nombre utilisable par le programme.",
        "Il augmente la tension fournie par le capteur pour rendre la mesure plus précise et plus stable."
      ],
      answer: 1,
      explanation: "Le capteur fournit une tension qui varie de façon continue. Or le programme ne sait manipuler que des nombres. Le CAN traduit donc la tension présente sur A0, A1 ou A2 en un nombre entier, que le sketch récupère avec analogRead.",
      whyOthers: [
        "C’est presque l’inverse : le CAN va de la tension vers le nombre, pas du nombre vers la tension ; de plus, la pompe est commandée par le relais sur D6, pas par le CAN.",
        "",
        "Le CAN n’augmente ni ne stabilise la tension du capteur : il se contente de la mesurer et de la traduire en nombre."
      ],
      exampleGarden: "Quand le capteur d’humidité du sol envoie environ 2,93 V sur A0, le CAN traduit cette tension en la valeur 600, que le sketch lit avec analogRead(PIN_HUMIDITE_SOL).",
      exampleOther: "Dans une balance de cuisine électronique, un capteur de force fournit une tension ; un CAN la transforme en nombre pour afficher la masse en grammes.",
      takeaway: "Le CAN traduit une tension analogique en un nombre entier que le programme peut utiliser."
    },
    {
      id: "s2q2",
      theme: "Plage de valeurs 0 à 1023",
      question: "Quelles valeurs analogRead peut-il renvoyer sur une carte Arduino Uno ?",
      choices: [
        "Un nombre entier compris entre 0 et 1023.",
        "Un nombre décimal entre 0 et 5, comme une tension.",
        "Seulement 0 ou 1, comme un signal logique."
      ],
      answer: 0,
      explanation: "Le CAN de l’Arduino Uno a une résolution de 10 bits : il peut coder 1024 valeurs différentes, numérotées de 0 à 1023. La valeur 0 correspond à 0 V et la valeur 1023 à 5 V.",
      whyOthers: [
        "",
        "analogRead renvoie un nombre entier sans unité ; c’est à nous de le convertir en tension si besoin, avec la formule V ≈ valeur ÷ 1023 × 5.",
        "Un signal logique ne prend que deux états, comme sur la broche D6 du relais ; une entrée analogique offre 1024 niveaux, bien plus fins."
      ],
      exampleGarden: "Le capteur d’humidité branché sur A0 renvoie par exemple 500 en sol sec et 620 en sol humide : deux valeurs parmi les 1024 possibles.",
      exampleOther: "Dans une station météo, le capteur de luminosité lu en analogique renvoie lui aussi une valeur entre 0 et 1023 selon la lumière reçue.",
      takeaway: "Sur Arduino Uno, analogRead renvoie un entier entre 0 et 1023, car le CAN travaille sur 10 bits."
    },
    {
      id: "s2q3",
      theme: "Conversion valeur → tension",
      question: "Le capteur renvoie la valeur 600. Quelle tension cela représente-t-il environ (Vref = 5 V) ?",
      choices: [
        "0,6 V, car il suffit de diviser la valeur par 1000.",
        "6 V, car on multiplie la valeur par 0,01.",
        "Environ 2,93 V, car V ≈ 600 ÷ 1023 × 5."
      ],
      answer: 2,
      explanation: "On applique la formule V ≈ valeur ÷ 1023 × Vref. Ici : 600 ÷ 1023 × 5 ≈ 2,93 V. La valeur 600 représente donc un peu plus de la moitié de la tension de référence de 5 V.",
      whyOthers: [
        "Diviser par 1000 est une règle inventée : la vraie formule fait intervenir 1023, la plus grande valeur du CAN, et la tension de référence de 5 V.",
        "Une tension de 6 V est impossible ici : la mesure ne peut pas dépasser la tension de référence de 5 V, atteinte pour la valeur 1023.",
        ""
      ],
      exampleGarden: "Quand le Moniteur Série affiche « Humidité : 600 », on sait que le capteur du sol envoie environ 2,93 V sur la broche A0.",
      exampleOther: "Dans un four, si le capteur de température renvoie la valeur 512, la tension vaut environ 512 ÷ 1023 × 5 ≈ 2,5 V.",
      takeaway: "Pour convertir une valeur du CAN en tension : V ≈ valeur ÷ 1023 × 5 V."
    },
    {
      id: "s2q4",
      theme: "Calibration : le principe",
      question: "En quoi consiste la calibration du capteur d’humidité réalisée en séance 2 ?",
      choices: [
        "À régler la vitesse de la pompe pour qu’elle arrose plus doucement.",
        "À mesurer les valeurs du capteur en sol sec puis en sol humide, pour choisir un seuil adapté.",
        "À remplacer le capteur d’humidité du sol par un modèle plus précis, vendu déjà réglé en usine et prêt à mesurer."
      ],
      answer: 1,
      explanation: "Calibrer, c’est confronter le capteur à des situations connues (sol sec, puis sol humide), relever plusieurs valeurs, calculer les moyennes, puis choisir un seuil placé entre les deux groupes. Le programme pourra ensuite décider si le sol est sec ou humide.",
      whyOthers: [
        "La pompe reste volontairement arrêtée pendant toute la calibration ; on ne règle pas sa vitesse, on étudie les valeurs du capteur.",
        "",
        "On garde le même capteur : aucun modèle n’arrive « déjà réglé » pour notre terre ; la calibration sert justement à bien utiliser le matériel dont on dispose."
      ],
      exampleGarden: "Les élèves relèvent par exemple 495, 500 et 505 en sol sec, puis 615, 620 et 625 en sol humide, avant de choisir SEUIL_HUMIDITE = 560.",
      exampleOther: "Un écran tactile se calibre de façon comparable : on appuie sur des croix affichées à des positions connues pour que l’appareil ajuste ses mesures.",
      takeaway: "Calibrer un capteur, c’est le tester dans des situations connues pour choisir un seuil fiable."
    },
    {
      id: "s2q5",
      theme: "Calibration : plusieurs mesures",
      question: "Pendant la calibration, pourquoi fait-on plusieurs mesures en sol sec au lieu d’une seule ?",
      choices: [
        "Parce qu’une mesure isolée peut être trop haute ou trop basse : plusieurs mesures rendent le résultat plus fiable.",
        "Parce que le capteur d’humidité a besoin de plusieurs essais de chauffe avant de commencer à fonctionner correctement.",
        "Parce que la carte Arduino refuse de lire deux fois de suite la même valeur sur la broche A0."
      ],
      answer: 0,
      explanation: "Les valeurs d’un capteur varient légèrement d’une lecture à l’autre : petites perturbations électriques, contact avec la terre, position de la sonde… En répétant la mesure, on repère ces variations et on évite de fonder tout le réglage sur une valeur accidentelle.",
      whyOthers: [
        "",
        "Le capteur fonctionne dès la première lecture, sans temps de chauffe ; le problème n’est pas le démarrage, mais les petites variations naturelles des mesures.",
        "La carte peut tout à fait lire deux fois de suite la même valeur sur A0 ; répéter les mesures est un choix de méthode, pas une obligation technique."
      ],
      exampleGarden: "En sol sec, trois lectures donnent 495, 510 et 500 : aucune n’est « la » bonne, mais ensemble elles décrivent bien le comportement du capteur.",
      exampleOther: "Un garagiste teste plusieurs fois le radar de recul d’une voiture devant le même obstacle, pour vérifier que la distance annoncée est régulière.",
      takeaway: "Une mesure unique peut tromper ; plusieurs mesures donnent une image fiable du capteur."
    },
    {
      id: "s2q6",
      theme: "Calibration : la moyenne",
      question: "Après avoir relevé 495, 500 et 505 en sol sec, pourquoi calcule-t-on la moyenne de ces valeurs ?",
      choices: [
        "Pour obtenir la valeur la plus grande des trois, celle qui décrirait le mieux un sol vraiment sec.",
        "Pour résumer les mesures par une valeur centrale, qui gomme les petites variations.",
        "Parce que le logiciel Arduino exige une moyenne pour pouvoir compiler."
      ],
      answer: 1,
      explanation: "La moyenne, ici (495 + 500 + 505) ÷ 3 = 500, donne une valeur représentative du groupe de mesures. Elle atténue les petites variations d’une lecture à l’autre et fournit un repère solide pour placer ensuite le seuil.",
      whyOthers: [
        "La moyenne n’est pas le maximum : elle vaut ici 500, une valeur centrale ; la lecture la plus grande ne décrit pas mieux le sol, elle peut être accidentelle.",
        "",
        "La compilation ne dépend pas de nos calculs sur papier : la moyenne est un outil mathématique que nous choisissons, pas une exigence du logiciel."
      ],
      exampleGarden: "Moyenne en sol sec : 500 ; moyenne en sol humide : 620. Ces deux repères permettent de placer le seuil à 560, entre les deux.",
      exampleOther: "Une montre cardio affiche une fréquence cardiaque moyennée sur plusieurs battements, pour éviter un affichage qui saute sans arrêt.",
      takeaway: "La moyenne résume plusieurs mesures en une valeur centrale, plus fiable qu’une lecture isolée."
    },
    {
      id: "s2q7",
      theme: "Calibration : placer le seuil",
      question: "La moyenne en sol sec vaut 500 et la moyenne en sol humide vaut 620. Où faut-il placer le seuil ?",
      choices: [
        "En dessous de 500, pour être certain de détecter le sol sec dès la toute première lecture.",
        "Entre 500 et 620, par exemple à 560, pour bien séparer les deux situations.",
        "Au-dessus de 620, pour garder une marge de sécurité."
      ],
      answer: 1,
      explanation: "Le seuil doit se trouver entre le groupe « sec » et le groupe « humide ». Ainsi, une valeur en dessous du seuil signifie sol sec et une valeur au-dessus signifie sol humide, sans confusion possible. 560 laisse une bonne distance avec chacune des deux moyennes.",
      whyOthers: [
        "Un seuil placé sous 500 serait dépassé même en sol sec, dès la première lecture : le programme afficherait « Sol humide » alors que la plante a soif.",
        "",
        "Un seuil placé au-dessus de 620 rangerait presque toutes les valeurs du côté « sol sec », même quand la terre vient d’être arrosée."
      ],
      exampleGarden: "Avec const int SEUIL_HUMIDITE = 560;, la lecture 505 (sol sec) passe bien dans le if, et la lecture 618 (sol humide) passe dans le else.",
      exampleOther: "Un store automatique se règle de la même façon : son seuil de luminosité est placé entre les valeurs mesurées par temps couvert et celles mesurées en plein soleil.",
      takeaway: "Un bon seuil se place entre les valeurs du groupe « sec » et celles du groupe « humide »."
    },
    {
      id: "s2q8",
      theme: "Constante et variable",
      question: "Dans la ligne const int SEUIL_HUMIDITE = 560;, à quoi sert le mot-clé const ?",
      choices: [
        "Il indique que cette valeur ne changera pas pendant l’exécution du programme.",
        "Il transforme la valeur 560 en une tension de 5,60 V.",
        "Il oblige la carte à relire le capteur à chaque tour de loop()."
      ],
      answer: 0,
      explanation: "const déclare une constante : SEUIL_HUMIDITE vaudra 560 du début à la fin de l’exécution. À l’inverse, int humidite = analogRead(PIN_HUMIDITE_SOL); crée une variable, dont la valeur change à chaque lecture du capteur.",
      whyOthers: [
        "",
        "const ne fait aucun calcul de tension : 560 reste une valeur brute du CAN, sans unité.",
        "C’est l’instruction analogRead placée dans loop() qui relit le capteur ; const protège seulement la valeur du seuil."
      ],
      exampleGarden: "SEUIL_HUMIDITE reste fixé à 560 pendant toute la séance, alors que la variable humidite change à chaque analogRead(PIN_HUMIDITE_SOL).",
      exampleOther: "Dans un chauffe-eau, la température maximale de sécurité est une constante du programme, alors que la température mesurée de l’eau est une variable.",
      takeaway: "Une constante (const) garde la même valeur pendant tout le programme ; une variable peut changer."
    },
    {
      id: "s2q9",
      theme: "La décision if / else",
      question: "Que fait l’instruction if (humidite < SEUIL_HUMIDITE) { Serial.println(\"Sol sec\"); } else { Serial.println(\"Sol humide\"); } ?",
      choices: [
        "Elle affiche les deux messages, « Sol sec » puis « Sol humide », à chaque tour de boucle.",
        "Elle démarre la pompe du jardin dès que le sol est sec.",
        "Elle affiche « Sol sec » si la valeur est sous le seuil, sinon « Sol humide »."
      ],
      answer: 2,
      explanation: "Le if teste la condition humidite < SEUIL_HUMIDITE. Si elle est vraie, seul le bloc du if s’exécute ; sinon, seul le bloc du else s’exécute. Un seul des deux messages s’affiche à chaque tour de loop().",
      whyOthers: [
        "Le if/else choisit un chemin ou l’autre : les deux blocs ne s’exécutent jamais au même tour de boucle.",
        "En séance 2, le programme se contente d’afficher un message ; la pompe reste arrêtée grâce à digitalWrite(PIN_RELAIS_POMPE, LOW);.",
        ""
      ],
      exampleGarden: "Avec humidite = 505 et SEUIL_HUMIDITE = 560, la condition 505 < 560 est vraie : le Moniteur Série affiche « Sol sec ».",
      exampleOther: "Une alarme de maison suit la même logique : si un mouvement est détecté, la sirène se déclenche ; sinon, elle reste silencieuse.",
      takeaway: "if / else permet au programme de choisir une action selon qu’une condition est vraie ou fausse."
    },
    {
      id: "s2q10",
      theme: "Serial.print et Serial.println",
      question: "Quelle est la différence entre Serial.print et Serial.println ?",
      choices: [
        "Serial.print affiche en gras, Serial.println en écriture normale.",
        "Serial.println ajoute un retour à la ligne après le texte, Serial.print non.",
        "Serial.print envoie le texte vers l’écran, Serial.println vers la pompe."
      ],
      answer: 1,
      explanation: "Les deux instructions envoient du texte ou des nombres vers le Moniteur Série. La seule différence : println termine par un retour à la ligne, alors que print laisse le curseur sur la même ligne, prêt à écrire à la suite.",
      whyOthers: [
        "Le Moniteur Série n’affiche ni gras ni couleurs : la différence porte uniquement sur le retour à la ligne.",
        "",
        "Les deux instructions parlent au Moniteur Série ; la pompe, elle, est commandée par digitalWrite sur la broche D6."
      ],
      exampleGarden: "Serial.print(\"Humidité : \"); puis Serial.println(humidite); affichent « Humidité : 600 » sur une seule ligne, puis passent à la ligne suivante.",
      exampleOther: "Le compteur d’un vélo électrique construit son affichage pareil : l’étiquette « Vitesse : » d’abord, puis la valeur juste à la suite.",
      takeaway: "print écrit sans retour à la ligne ; println écrit puis passe à la ligne."
    },
    {
      id: "s2q11",
      theme: "Valeur brute, pas un pourcentage",
      question: "Le seuil vaut 560. Peut-on dire que cela correspond à 56 % d’humidité ?",
      choices: [
        "Non : 560 est une valeur brute du CAN, comprise entre 0 et 1023, sans unité ni pourcentage.",
        "Oui : il suffit de diviser la valeur mesurée par 10, car la plage de conversion va de 0 à 1000.",
        "Oui : les valeurs renvoyées par analogRead sont déjà des pourcentages."
      ],
      answer: 0,
      explanation: "560 est le nombre fourni par le convertisseur analogique-numérique. Il n’a pas d’unité : ce ne sont ni des volts, ni des pourcents. C’est notre calibration (sec ≈ 500, humide ≈ 620) qui donne un sens à cette valeur.",
      whyOthers: [
        "",
        "Diviser par 10 est un calcul sans fondement : la plage du CAN va de 0 à 1023, pas de 0 à 1000, et rien ne dit que 0 signifie « 0 % d’humidité ».",
        "analogRead renvoie une valeur brute ; si l’on veut un pourcentage, c’est au programmeur de construire la conversion, après calibration."
      ],
      exampleGarden: "Le Moniteur Série affiche « Humidité : 620 » : cette valeur brute signifie « sol humide » uniquement parce que notre calibration l’a montré.",
      exampleOther: "Dans une machine à laver, le capteur de niveau d’eau renvoie aussi une valeur brute : c’est le concepteur qui décide à partir de quelle valeur la cuve est « pleine ».",
      takeaway: "Une valeur d’analogRead est un nombre brut sans unité ; seule la calibration lui donne un sens."
    },
    {
      id: "s2q12",
      theme: "Comparaison stricte <",
      question: "SEUIL_HUMIDITE vaut 560 et la lecture donne exactement humidite = 560. Que va afficher le programme ?",
      choices: [
        "« Sol sec », car 560 est la valeur limite du sol sec, rangée avec les mesures inférieures au seuil.",
        "Rien, car le programme s’arrête sur ce cas particulier.",
        "« Sol humide », car la condition 560 < 560 est fausse : c’est le bloc else qui s’exécute."
      ],
      answer: 2,
      explanation: "L’opérateur < est une comparaison stricte : 560 < 560 est faux. La condition du if n’est donc pas remplie et le programme exécute le bloc else, qui affiche « Sol humide ». La valeur exactement égale au seuil est rangée du côté « humide ».",
      whyOthers: [
        "Avec l’opérateur strict <, la condition 560 < 560 est fausse : la valeur limite n’est pas rangée avec les mesures inférieures et ne passe pas dans le bloc « Sol sec ».",
        "Un if/else prévoit toujours une issue : quand la condition est fausse, le bloc else s’exécute ; le programme ne se bloque jamais sur ce test.",
        ""
      ],
      exampleGarden: "Ce cas reste rare dans le jardin : le seuil 560 est placé loin des moyennes 500 et 620, donc les lectures tombent nettement d’un côté ou de l’autre.",
      exampleOther: "Un thermostat réglé sur « chauffer tant que température < 19 » arrête le chauffage dès que 19 °C est atteint : la valeur limite bascule de l’autre côté.",
      takeaway: "La comparaison < est stricte : une valeur égale au seuil fait exécuter le bloc else."
    },
    {
      id: "s2q13",
      theme: "Pompe arrêtée pendant la calibration",
      question: "Pourquoi le programme de la séance garde-t-il la pompe arrêtée avec digitalWrite(PIN_RELAIS_POMPE, LOW); ?",
      choices: [
        "Parce que la pompe du jardin connecté est en panne pendant la séance 2.",
        "Parce qu’un même sketch Arduino ne peut pas contenir à la fois une lecture analogRead et une écriture digitalWrite.",
        "Pour observer les valeurs du capteur sans qu’un arrosage vienne modifier l’humidité pendant les mesures."
      ],
      answer: 2,
      explanation: "Pendant la calibration, on veut comparer un sol sec et un sol humide bien identifiés. Si la pompe arrosait pendant les relevés, l’humidité changerait en cours de mesure et les deux groupes de valeurs deviendraient flous.",
      whyOthers: [
        "La pompe fonctionne très bien : la maintenir arrêtée est un choix volontaire de méthode, pas une réparation.",
        "Un sketch peut mélanger lectures analogiques et écritures logiques ; la preuve : notre programme contient les deux.",
        ""
      ],
      exampleGarden: "Grâce à digitalWrite(PIN_RELAIS_POMPE, LOW);, les élèves relèvent 495, 500 et 505 en sol sec sans qu’une goutte d’eau ne fausse la série de mesures.",
      exampleOther: "Pour régler un réfrigérateur en usine, on commence par mesurer la température sans déclencher le froid, afin d’observer l’appareil dans un état stable.",
      takeaway: "Pendant une calibration, on immobilise les actionneurs pour que les mesures restent fidèles à la situation."
    },
    {
      id: "s2q14",
      theme: "Vérifier le seuil par l’expérience",
      question: "Le seuil 560 est programmé et téléversé. Comment vérifier expérimentalement qu’il est bien choisi ?",
      choices: [
        "Placer le capteur en sol sec puis en sol humide, et vérifier le message du Moniteur Série dans chaque cas.",
        "Relire attentivement tout le programme, plusieurs fois de suite, pour vérifier qu’il compile sans la moindre erreur.",
        "Demander à plusieurs camarades de la classe si la valeur 560 leur paraît être un bon choix."
      ],
      answer: 0,
      explanation: "Un seuil se valide par l’expérience : on replace le capteur dans les deux situations connues et on observe la décision du programme. Si « Sol sec » apparaît en sol sec et « Sol humide » en sol humide, le seuil remplit son rôle.",
      whyOthers: [
        "",
        "Une compilation réussie prouve seulement que le code est bien écrit, pas que le seuil sépare correctement les deux situations réelles.",
        "L’avis des camarades ne remplace pas un test : seule la confrontation avec le sol réel montre si le seuil fonctionne."
      ],
      exampleGarden: "Capteur dans la terre sèche : « Sol sec » s’affiche ; capteur dans la terre arrosée : « Sol humide » s’affiche. Le seuil 560 est validé.",
      exampleOther: "Après la pose d’un détecteur de fumée, on utilise le bouton de test ou une fumée d’essai pour vérifier qu’il sonne réellement.",
      takeaway: "Un seuil se vérifie en testant le système dans les situations réelles qu’il doit distinguer."
    },
    {
      id: "s2q15",
      theme: "Résolution 10 bits",
      question: "Pourquoi la valeur maximale d’analogRead est-elle 1023, et pas 1000 ?",
      choices: [
        "Parce que les ingénieurs ont arrondi 1000 à 1023 pour gagner en précision.",
        "Parce que la tension de référence vaut 10,23 V.",
        "Parce que le CAN travaille sur 10 bits : il code 1024 valeurs, numérotées de 0 à 1023."
      ],
      answer: 2,
      explanation: "En binaire, 10 bits permettent 2 × 2 × … × 2 (dix fois), soit 1024 combinaisons. Comme la première valeur est 0, la dernière est 1023. C’est la résolution du convertisseur de l’Arduino Uno.",
      whyOthers: [
        "1023 n’est pas un arrondi : c’est la conséquence directe du codage binaire sur 10 bits, dont la numérotation commence à 0.",
        "La tension de référence de la carte vaut 5 V ; le nombre 1023 vient du codage binaire, pas de la tension.",
        ""
      ],
      exampleGarden: "Si le capteur d’humidité envoyait exactement 5 V sur A0, analogRead renverrait 1023, la plus grande valeur possible.",
      exampleOther: "Une manette de jeu qui code la position de son joystick sur 8 bits ne dispose que de 256 niveaux, de 0 à 255 : moins de bits, moins de finesse.",
      takeaway: "10 bits donnent 1024 valeurs possibles, numérotées de 0 à 1023."
    },
    {
      id: "s2q16",
      theme: "Chaque capteur se calibre",
      question: "Deux groupes utilisent le même modèle de capteur d’humidité. Peuvent-ils recopier le seuil l’un de l’autre sans vérifier ?",
      choices: [
        "Oui : deux capteurs du même modèle, fabriqués dans la même usine, donnent exactement les mêmes valeurs.",
        "Non : deux capteurs identiques peuvent donner des valeurs un peu différentes ; chaque montage mérite sa propre calibration.",
        "Non : le règlement de la classe interdit d’utiliser deux fois la même valeur de seuil ; chaque groupe doit choisir un nombre différent."
      ],
      answer: 1,
      explanation: "Petites différences de fabrication, branchement, profondeur d’enfoncement de la sonde dans la terre… Tout cela décale les valeurs lues. Le seuil d’un groupe peut donc mal séparer sec et humide sur l’autre montage : il faut au moins le vérifier, au mieux refaire la calibration.",
      whyOthers: [
        "Même sortis de la même usine, deux capteurs présentent de petites différences de fabrication qui décalent leurs valeurs.",
        "",
        "Aucun règlement n’impose des seuils différents dans la classe ; la vraie raison est expérimentale : chaque montage produit ses propres valeurs."
      ],
      exampleGarden: "Le groupe A mesure 500 en sol sec, le groupe B mesure 530 avec le même modèle de capteur : un seuil unique de 560 laisserait très peu de marge au groupe B.",
      exampleOther: "Deux pèse-personnes du même modèle peuvent afficher des masses légèrement différentes : chacun possède son propre réglage du zéro.",
      takeaway: "Chaque capteur et chaque montage se calibrent : un seuil ne se recopie pas les yeux fermés."
    },
    {
      id: "s2q17",
      theme: "Construire une ligne d’affichage",
      question: "Que produit la suite Serial.print(\"Humidité : \"); Serial.println(humidite); si humidite vaut 600 ?",
      choices: [
        "Une seule ligne « Humidité : 600 », puis le curseur passe à la ligne suivante.",
        "Deux lignes : « Humidité : » d’abord, puis « 600 » en dessous.",
        "Rien, car on ne peut pas mélanger du texte et un nombre dans le Moniteur Série."
      ],
      answer: 0,
      explanation: "Serial.print écrit « Humidité : » sans retour à la ligne ; Serial.println(humidite) écrit donc 600 juste à la suite, puis termine la ligne. Résultat : une ligne complète et lisible à chaque tour de loop().",
      whyOthers: [
        "",
        "Deux lignes apparaîtraient si la première instruction était un println ; ici, le print laisse le curseur sur la même ligne.",
        "Le Moniteur Série accepte très bien du texte puis un nombre : c’est justement l’intérêt d’enchaîner print et println."
      ],
      exampleGarden: "Toutes les secondes, grâce à delay(1000);, une nouvelle ligne « Humidité : … » s’ajoute dans le Moniteur Série : on suit l’évolution du sol en direct.",
      exampleOther: "L’écran d’une imprimante procède pareil : l’étiquette « Encre : » puis la valeur restante, affichées à la suite sur une seule ligne.",
      takeaway: "print puis println enchaînés construisent une seule ligne : étiquette, valeur, puis retour à la ligne."
    },
    {
      id: "s2q18",
      theme: "Modifier le seuil",
      question: "Après de nouveaux tests, la classe décide de passer le seuil de 560 à 580. Que faut-il faire ?",
      choices: [
        "Tourner le petit bouton de réglage du seuil situé sur la carte Arduino, juste à côté des broches analogiques A0 à A2.",
        "Effacer tout le sketch et le réécrire entièrement avec la nouvelle valeur du seuil.",
        "Remplacer 560 par 580 dans la ligne const int SEUIL_HUMIDITE = 560;, puis compiler et téléverser le programme."
      ],
      answer: 2,
      explanation: "Le seuil vit dans le code source. Pour le changer, on modifie la valeur de la constante dans le fichier .ino, puis on compile et on téléverse : la carte reçoit la nouvelle version du programme. Grâce à la constante bien nommée, une seule ligne suffit.",
      whyOthers: [
        "La carte Arduino Uno ne possède aucun bouton de réglage du seuil, ni près des broches analogiques ni ailleurs : ce réglage se trouve dans le programme.",
        "Inutile de tout réécrire : c’est justement l’avantage d’avoir rangé le seuil dans une constante nommée, modifiable en une seule ligne.",
        ""
      ],
      exampleGarden: "La ligne devient const int SEUIL_HUMIDITE = 580; ; après le téléversement, le jardin connecté applique aussitôt cette nouvelle limite.",
      exampleOther: "Sur un robot aspirateur, changer la distance de détection des obstacles passe aussi par une mise à jour du programme, pas par un démontage.",
      takeaway: "Changer un seuil, c’est modifier la constante dans le code, puis compiler et téléverser."
    },
    {
      id: "s2q19",
      theme: "Transférer le if / else",
      question: "Un four doit afficher « Trop chaud » au-delà de 220 degrés, sinon « Température correcte ». Quelle structure de programme convient ?",
      choices: [
        "Une suite de delay pour attendre que le four refroidisse.",
        "Un if/else qui compare la température mesurée à un seuil, comme pour l’humidité du sol.",
        "Un Serial.begin(9600) répété plusieurs fois pour accélérer la mesure."
      ],
      answer: 1,
      explanation: "C’est exactement la même logique qu’au jardin : une grandeur mesurée, un seuil, une décision. Ici : if (temperature > 220) → « Trop chaud », else → « Température correcte ». Seuls la grandeur, le sens de la comparaison et la valeur du seuil changent.",
      whyOthers: [
        "delay fait seulement patienter le programme ; il ne compare rien et ne prend aucune décision.",
        "",
        "Serial.begin(9600) initialise la communication série une seule fois, dans setup() ; le répéter n’apporte rien à la décision."
      ],
      exampleGarden: "Dans le jardin, la même structure compare humidite au seuil 560 pour choisir entre « Sol sec » et « Sol humide ».",
      exampleOther: "Un portail automatique compare de la même façon le signal de sa cellule de détection à un seuil pour décider de s’arrêter ou de continuer.",
      takeaway: "Le trio « mesure, seuil, if/else » se transfère à tout objet qui doit prendre une décision simple."
    },
    {
      id: "s2q20",
      theme: "La chaîne de la mesure",
      question: "Quel enchaînement décrit correctement le chemin qui va du sol jusqu’au message « Sol sec » à l’écran ?",
      choices: [
        "Capteur (tension) → CAN (nombre de 0 à 1023) → analogRead dans le sketch → if/else → message sur le Moniteur Série.",
        "Moniteur Série → CAN (nombre de 0 à 1023) → capteur (tension) → relais de la pompe sur D6 → message affiché à l’écran.",
        "if/else → capteur (tension) → téléversement du sketch → CAN (nombre) → delay(1000)."
      ],
      answer: 0,
      explanation: "Le capteur traduit l’humidité en tension ; le CAN convertit cette tension en nombre ; analogRead range ce nombre dans la variable humidite ; le if/else le compare au seuil ; Serial.println affiche la conclusion. Chaque maillon dépend du précédent.",
      whyOthers: [
        "",
        "Le Moniteur Série est le bout de la chaîne, pas le début ; et le relais de la pompe, maintenu au repos en séance 2, ne participe pas à la mesure.",
        "Le téléversement a lieu une seule fois, avant l’exécution ; il ne fait pas partie de la chaîne parcourue à chaque mesure."
      ],
      exampleGarden: "Sol sec → environ 2,4 V sur A0 → valeur 500 → condition 500 < 560 vraie → « Sol sec » affiché : la chaîne complète en une seconde.",
      exampleOther: "Dans un lampadaire automatique : capteur de lumière → CAN → comparaison à un seuil → allumage de la lampe à la tombée de la nuit.",
      takeaway: "Une mesure suit toujours une chaîne : capteur → conversion → programme → décision → affichage ou action."
    }
  ]
};
