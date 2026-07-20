/* TechnoQuest — QCM de la séance 7 : Améliorer la durabilité.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s7q1 à s7q10 : essentielles · s7q11 à s7q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[7] = {
  session: 7,
  title: "Séance 7 — Améliorer la durabilité",
  questions: [
    {
      id: "s7q1",
      theme: "Usure et corrosion",
      question: "Pourquoi les électrodes d’un capteur d’humidité résistif se corrodent-elles avec le temps ?",
      choices: [
        "Parce que le programme Arduino envoie trop de messages de mesure sur le moniteur série de l’ordinateur",
        "Parce qu’elles sont en métal, au contact de la terre humide et traversées par un courant",
        "Parce que le soleil chauffe trop la carte Arduino pendant les longues journées d’été"
      ],
      answer: 1,
      explanation: "Les électrodes du capteur résistif sont deux tiges métalliques plantées dans la terre humide. Le métal, l’eau et le courant électrique provoquent une réaction chimique qui ronge peu à peu le métal : c’est la corrosion. Les mesures deviennent alors de moins en moins fiables.",
      whyOthers: [
        "L’affichage série ne fait circuler que des données vers l’ordinateur : il n’abîme pas le métal des électrodes plantées dans la terre.",
        "",
        "La chaleur du soleil peut gêner l’électronique, mais elle n’explique pas la corrosion : c’est le trio métal + eau + courant qui ronge les électrodes."
      ],
      exampleGarden: "Après quelques semaines dans la jardinière, les pointes métalliques du capteur noircissent et les valeurs lues sur le moniteur série deviennent étranges.",
      exampleOther: "Des ciseaux oubliés dehors sous la pluie rouillent : métal + humidité = corrosion. Pour les électrodes du capteur, le courant électrique accélère encore le phénomène.",
      takeaway: "Métal + eau + courant = corrosion : un capteur résistif s’use avec le temps, il faut le surveiller."
    },
    {
      id: "s7q2",
      theme: "Dérive d’un capteur",
      question: "On dit qu’un capteur « dérive » quand…",
      choices: [
        "ses mesures changent petit à petit alors que l’humidité réelle du sol reste la même",
        "il se détache de son support de fixation et finit par tomber au fond de la jardinière de la classe",
        "il envoie ses mesures vers l’ordinateur plus rapidement qu’avant"
      ],
      answer: 0,
      explanation: "La dérive, c’est un décalage progressif : à cause de l’usure ou de la corrosion, le capteur affiche des valeurs de plus en plus éloignées de la réalité. Le seuil choisi lors de la calibration ne correspond alors plus aux mesures.",
      whyOthers: [
        "",
        "Un capteur qui tombe est un problème mécanique de fixation, pas une dérive : la dérive concerne la valeur mesurée, pas la position du capteur.",
        "La vitesse d’envoi des mesures dépend du programme, pas de l’usure du capteur : la dérive porte sur la valeur affichée, pas sur sa fréquence."
      ],
      exampleGarden: "En septembre, le capteur affichait 400 dans un sol bien arrosé ; en décembre, il affiche 520 pour le même sol : il a dérivé, le seuil n’est plus adapté.",
      exampleOther: "Un pèse-personne qui affiche peu à peu 2 kg de trop dérive lui aussi : il faut le régler à nouveau pour retrouver des mesures justes.",
      takeaway: "Un capteur qui dérive donne des valeurs de plus en plus fausses : il faut vérifier ses mesures régulièrement."
    },
    {
      id: "s7q3",
      theme: "Résistif ou capacitif",
      question: "Quel est le principal avantage d’un capteur d’humidité résistif ?",
      choices: [
        "Il ne se corrode jamais",
        "Il n’a jamais besoin d’être calibré",
        "Il est peu coûteux à l’achat"
      ],
      answer: 2,
      explanation: "Le capteur résistif est simple à fabriquer, donc peu coûteux : c’est son grand atout. En échange, ses électrodes en contact direct avec la terre se corrodent plus vite, ce qui limite sa durée de vie.",
      whyOthers: [
        "C’est justement l’inverse : ses électrodes métalliques en contact avec la terre humide se corrodent plus vite que celles d’un capteur capacitif.",
        "Comme tous les capteurs d’humidité, il doit être calibré : on mesure ses valeurs en sol sec et en sol humide pour choisir le seuil.",
        ""
      ],
      exampleGarden: "Pour un premier prototype de jardin connecté en classe, le capteur résistif à 2 € permet de tester l’arrosage automatique sans gros budget.",
      exampleOther: "Une imprimante d’entrée de gamme est bon marché à l’achat, mais il faut souvent remplacer ses cartouches : le prix d’achat ne dit pas tout.",
      takeaway: "Résistif = peu coûteux mais s’use plus vite : un avantage à mettre en balance avec la durée de vie."
    },
    {
      id: "s7q4",
      theme: "Résistif ou capacitif",
      question: "Pourquoi un capteur d’humidité capacitif dure-t-il plus longtemps qu’un capteur résistif ?",
      choices: [
        "Parce qu’il est plus léger, plus petit et plus simple à installer dans la jardinière",
        "Parce que son métal est protégé et ne touche pas directement la terre humide",
        "Parce qu’il fonctionne sans électricité, contrairement au capteur résistif"
      ],
      answer: 1,
      explanation: "Le capteur capacitif mesure l’humidité à travers une couche protectrice : son métal n’est pas en contact direct avec la terre humide. Sans ce contact, presque pas de corrosion : il est plus durable et ses mesures restent plus stables. En contrepartie, il coûte plus cher.",
      whyOthers: [
        "Le poids, la taille ou la facilité d’installation ne changent rien à la corrosion : ce qui compte, c’est que le métal soit protégé du contact avec la terre humide.",
        "",
        "Comme le résistif et tout capteur branché sur l’Arduino, il a besoin d’électricité pour fonctionner : c’est sa couche protectrice qui le rend durable, pas une absence de courant."
      ],
      exampleGarden: "Installé dans la même jardinière, le capteur capacitif donne encore des mesures stables après plusieurs mois, là où le résistif avait déjà dérivé.",
      exampleOther: "Une lampe de vélo étanche survit aux trajets sous la pluie, alors qu’un modèle non protégé s’oxyde vite : protéger les parties fragiles prolonge la vie de l’objet.",
      takeaway: "Capacitif = métal protégé, donc plus durable et plus stable, mais plus cher."
    },
    {
      id: "s7q5",
      theme: "Re-calibration",
      question: "On remplace le capteur d’humidité usé par un capteur neuf. Que faut-il faire avant de relancer l’arrosage automatique ?",
      choices: [
        "Recalibrer le nouveau capteur, puis mettre à jour le seuil dans le programme",
        "Rien de particulier : le programme fonctionne exactement pareil avec n’importe quel capteur d’humidité",
        "Changer aussi la pompe par précaution, puisqu’elle a le même âge que l’ancien capteur"
      ],
      answer: 0,
      explanation: "Chaque capteur donne ses propres valeurs, même s’il est du même modèle. Le seuil du programme correspondait à l’ancien capteur. Il faut donc refaire la calibration : mesurer en sol sec, mesurer en sol humide, puis choisir un nouveau seuil entre les deux.",
      whyOthers: [
        "",
        "Le seuil enregistré dans le programme a été mesuré avec l’ancien capteur : avec le nouveau, les valeurs changent et les décisions d’arrosage deviennent fausses.",
        "La pompe n’est pas en cause : même si elle a beaucoup servi, on ne remplace que la pièce usée. Changer des pièces en bon état coûte cher pour rien."
      ],
      exampleGarden: "Avec le capteur neuf, on relève 680 en sol sec et 420 en sol humide : on choisit 590 comme nouveau seuil, bien situé entre les deux.",
      exampleOther: "Sur une balance de cuisine, après avoir changé la pile, on refait la tare avant de peser : après un changement de pièce, on refait le réglage.",
      takeaway: "Capteur remplacé = re-calibration obligatoire : le seuil appartient au capteur, pas au programme."
    },
    {
      id: "s7q6",
      theme: "Nouveau seuil dans le code",
      question: "Après la re-calibration, quelle ligne enregistre correctement le nouveau seuil dans le programme ?",
      choices: [
        "SEUIL_HUMIDITE == 590;",
        "const int 590 = SEUIL_HUMIDITE;",
        "const int SEUIL_HUMIDITE = 590;"
      ],
      answer: 2,
      explanation: "On déclare une constante avec son type (int), son nom (SEUIL_HUMIDITE), puis un seul signe = pour lui donner sa valeur : const int SEUIL_HUMIDITE = 590;. Le mot const rappelle que cette valeur de référence ne change pas pendant l’exécution.",
      whyOthers: [
        "Le double signe == sert à comparer deux valeurs dans une condition, pas à enregistrer une valeur : cette ligne ne définit rien.",
        "L’ordre est inversé : on écrit d’abord le nom de la constante, puis la valeur. Un nombre ne peut pas servir de nom.",
        ""
      ],
      exampleGarden: "Dans le programme du jardin, la ligne const int SEUIL_HUMIDITE = 590; remplace l’ancienne valeur mesurée avec le capteur usé.",
      exampleOther: "C’est comme enregistrer 19 °C sur le thermostat du salon : on inscrit la valeur de référence que le système utilisera pour décider.",
      takeaway: "const int SEUIL_HUMIDITE = 590; : un seul = pour donner la valeur, == seulement pour comparer."
    },
    {
      id: "s7q7",
      theme: "Conserver les sécurités",
      question: "Le capteur d’humidité vient d’être remplacé et recalibré. Faut-il garder la sécurité « réservoir prioritaire » dans le programme ?",
      choices: [
        "Oui : la pompe peut toujours tourner à vide, quel que soit le capteur",
        "Non : avec un capteur d’humidité tout neuf, plus rien ne peut tomber en panne dans le système",
        "Non : cette sécurité ralentit inutilement l’exécution du programme"
      ],
      answer: 0,
      explanation: "La sécurité réservoir protège la pompe : elle interdit l’arrosage quand il n’y a plus d’eau. Ce risque n’a aucun lien avec l’état du capteur d’humidité. Lors d’une maintenance, on remplace la pièce usée, mais on conserve toutes les protections déjà validées.",
      whyOthers: [
        "",
        "Un capteur neuf ne remplit pas le réservoir : la panne « pompe à vide » reste possible, et un capteur neuf peut lui aussi tomber en panne un jour.",
        "Cette vérification est une simple condition : elle s’exécute en une fraction de seconde et ne ralentit pas le programme de façon perceptible."
      ],
      exampleGarden: "Même avec le capteur neuf, si le réservoir est vide, le programme refuse d’arroser : la condition du réservoir reste prioritaire sur la mesure d’humidité.",
      exampleOther: "Dans une voiture, changer un pneu ne dispense pas d’attacher sa ceinture : remplacer une pièce ne supprime pas les autres protections.",
      takeaway: "Maintenance = remplacer la pièce usée, jamais retirer les sécurités qui protègent le système."
    },
    {
      id: "s7q8",
      theme: "Conserver les sécurités",
      question: "Après la maintenance du capteur, quelles protections du programme doivent être conservées ?",
      choices: [
        "Uniquement l’affichage des mesures sur le moniteur série de l’ordinateur",
        "La priorité au réservoir, l’arrêt explicite de la pompe et l’impulsion limitée à 2 secondes",
        "Aucune protection : on repart de zéro et on réécrit tout le programme"
      ],
      answer: 1,
      explanation: "La maintenance change la pièce usée et met à jour le seuil, rien d’autre. Les sécurités construites au fil des séances restent en place : le réservoir prioritaire, l’arrêt explicite de la pompe et l’impulsion d’arrosage limitée à 2 secondes ont déjà prouvé leur utilité.",
      whyOthers: [
        "L’affichage série est très utile pour vérifier les mesures, mais ce n’est pas une protection : ce sont les trois sécurités qui empêchent d’abîmer le matériel et de noyer les plantes.",
        "",
        "Repartir de zéro ferait perdre des protections testées et validées, et risquerait d’introduire de nouvelles erreurs : on ne modifie que ce qui doit l’être."
      ],
      exampleGarden: "Après le changement de capteur, seule la ligne du seuil est modifiée : la condition avec le réservoir, l’arrêt de la pompe et l’impulsion de 2 secondes restent identiques.",
      exampleOther: "Sur une machine à laver, remplacer le joint de la porte ne désactive pas la sécurité qui verrouille la porte pendant le lavage : chaque protection garde son rôle.",
      takeaway: "On ne modifie que le seuil : les trois sécurités validées sont conservées telles quelles."
    },
    {
      id: "s7q9",
      theme: "Vérifier par l’affichage",
      question: "Comment vérifier que la re-calibration du nouveau capteur est réussie ?",
      choices: [
        "En regardant si la petite LED de la carte Arduino clignote",
        "En attendant une semaine pour voir si les plantes survivent",
        "En contrôlant sur le moniteur série que le seuil se situe entre la mesure en sol sec et la mesure en sol humide"
      ],
      answer: 2,
      explanation: "L’affichage série montre les valeurs réellement mesurées par le capteur. Si la valeur en sol sec est nettement au-dessus du seuil et la valeur en sol humide nettement en dessous, le seuil sépare bien les deux situations : la re-calibration est réussie.",
      whyOthers: [
        "La LED de la carte indique seulement que l’Arduino est alimenté ou communique : elle ne dit rien sur la justesse des mesures d’humidité.",
        "Attendre une semaine, c’est risquer de noyer ou d’assécher les plantes avant de découvrir l’erreur : on vérifie tout de suite, avec des mesures affichées.",
        ""
      ],
      exampleGarden: "Sur le moniteur série : sol sec ≈ 680, sol humide ≈ 420. Le seuil 590 est bien entre les deux : le programme saura distinguer les deux situations.",
      exampleOther: "Après avoir changé la pile d’un réveil, on vérifie l’heure affichée avant de compter sur l’alarme : on contrôle avant de faire confiance.",
      takeaway: "Afficher les mesures pour vérifier : un bon seuil se situe clairement entre la valeur sol sec et la valeur sol humide."
    },
    {
      id: "s7q10",
      theme: "Réparabilité",
      question: "Que signifie la « réparabilité » d’un objet technique ?",
      choices: [
        "La possibilité de remplacer facilement une pièce usée",
        "La capacité de l’objet à se réparer tout seul, sans aucune intervention humaine",
        "La garantie que l’objet ne tombera jamais en panne pendant toute sa durée de vie"
      ],
      answer: 0,
      explanation: "Un objet réparable est conçu pour qu’on puisse le démonter et remplacer la pièce défectueuse, plutôt que de jeter l’objet entier. C’est un critère essentiel de durabilité : il réduit les déchets et le coût sur la durée.",
      whyOthers: [
        "",
        "Aucun objet du quotidien ne se répare tout seul, sans intervention humaine : la réparabilité décrit la facilité pour une personne de le réparer.",
        "Aucun objet n’est à l’abri d’une panne, même pendant sa durée de vie prévue : la réparabilité ne l’empêche pas, elle permet d’y remédier facilement quand elle arrive."
      ],
      exampleGarden: "Le capteur du jardin est branché avec des connecteurs plutôt que soudé : on l’a remplacé en cinq minutes, sans toucher au reste du montage.",
      exampleOther: "Un smartphone à batterie remplaçable se garde des années : on change la batterie fatiguée au lieu de jeter tout le téléphone.",
      takeaway: "Réparable = une pièce usée se remplace facilement : l’objet vit plus longtemps et produit moins de déchets."
    },
    {
      id: "s7q11",
      theme: "Critères de durabilité",
      question: "Parmi ces listes, laquelle regroupe de bons critères pour choisir une solution durable ?",
      choices: [
        "La couleur de l’objet, la notoriété de la marque et le nombre de publicités vues à la télévision",
        "Le coût, la durée de vie, la stabilité de la mesure, la maintenance et la réparabilité",
        "Uniquement le prix d’achat le plus bas affiché en magasin"
      ],
      answer: 1,
      explanation: "Choisir une solution durable, c’est comparer plusieurs critères : ce qu’elle coûte, combien de temps elle fonctionne, si ses mesures restent fiables, si son entretien est simple et si on peut la réparer. Aucun critère ne suffit à lui seul : on cherche le meilleur compromis.",
      whyOthers: [
        "La couleur, la notoriété de la marque ou le nombre de publicités n’ont aucun effet sur la durée de vie ni sur la fiabilité : ce ne sont pas des critères techniques.",
        "",
        "Le prix d’achat le plus bas peut coûter plus cher à la longue si l’objet s’use vite et n’est pas réparable : il faut regarder le coût sur toute la durée de vie."
      ],
      exampleGarden: "Pour choisir entre capteur résistif et capacitif, la classe a rempli un tableau : coût, durée de vie, stabilité, entretien, réparabilité, puis a comparé les deux colonnes.",
      exampleOther: "Pour un aspirateur, on compare le prix, la solidité et la disponibilité des pièces détachées, pas seulement l’étiquette en rayon.",
      takeaway: "Une solution durable se choisit sur plusieurs critères : coût, durée de vie, stabilité, maintenance, réparabilité."
    },
    {
      id: "s7q12",
      theme: "Maintenance préventive",
      question: "Qu’est-ce que la maintenance préventive ?",
      choices: [
        "Réparer l’objet uniquement quand il est complètement en panne",
        "Remplacer l’objet tout entier dès que l’une de ses pièces montre les premiers signes d’usure",
        "Vérifier et entretenir régulièrement l’objet avant qu’une panne n’arrive"
      ],
      answer: 2,
      explanation: "Préventive vient de « prévenir » : on agit avant la panne. Des contrôles réguliers permettent de repérer l’usure (corrosion, dérive) et d’intervenir au bon moment, sans casse ni mauvaise surprise.",
      whyOthers: [
        "Attendre la panne, c’est la maintenance corrective : on subit l’arrêt du système, parfois au pire moment, par exemple pendant les vacances.",
        "Remplacer l’objet tout entier aux premiers signes d’usure gaspille de l’argent et des ressources : la maintenance préventive entretient et ne remplace que la pièce fatiguée.",
        ""
      ],
      exampleGarden: "Une fois par mois, l’équipe inspecte les électrodes du capteur et relit ses mesures sur le moniteur série : la dérive est repérée avant que les plantes n’en souffrent.",
      exampleOther: "Sur un vélo, graisser la chaîne et vérifier la pression des pneus régulièrement évite la casse en pleine sortie : c’est de l’entretien préventif.",
      takeaway: "Maintenance préventive = contrôler régulièrement pour agir avant la panne."
    },
    {
      id: "s7q13",
      theme: "Calibration du capacitif",
      question: "Un capteur capacitif tout neuf vient d’être installé dans le jardin connecté. A-t-il besoin d’être calibré ?",
      choices: [
        "Oui : même durable et stable, il donne ses propres valeurs, qu’il faut mesurer pour fixer le seuil",
        "Non : les capteurs capacitifs sont réglés en usine pour tous les types de sol",
        "Non : la calibration ne concerne que les capteurs résistifs"
      ],
      answer: 0,
      explanation: "Capacitif ne veut pas dire pré-réglé : chaque capteur, chaque sol et chaque montage donnent des valeurs différentes. Il faut donc mesurer en sol sec et en sol humide, puis choisir le seuil. L’avantage du capacitif, c’est que ce réglage restera valable plus longtemps, car il dérive peu.",
      whyOthers: [
        "",
        "Aucune usine ne connaît la terre de notre jardinière ni notre montage : les valeurs dépendent du sol réel, il faut les mesurer sur place.",
        "La calibration est nécessaire pour tout capteur d’humidité, quel que soit son principe de mesure : sans seuil adapté, le programme décide mal."
      ],
      exampleGarden: "Avec le capacitif neuf, la classe refait la démarche de calibration apprise en début de séquence : mesure en sol sec, mesure en sol humide, choix du seuil entre les deux.",
      exampleOther: "Un thermomètre de cuisson neuf se vérifie dans l’eau bouillante, qui doit afficher environ 100 °C : même un instrument de qualité se contrôle avant usage.",
      takeaway: "Tout capteur se calibre, même le plus stable : le capacitif dérive moins, mais son seuil doit être mesuré."
    },
    {
      id: "s7q14",
      theme: "Transfert : indice de réparabilité",
      question: "En France, l’indice de réparabilité affiché sur les smartphones et les lave-linge indique…",
      choices: [
        "la vitesse de fonctionnement et la puissance électrique de l’appareil",
        "le prix moyen d’une réparation facturée par un réparateur agréé par la marque",
        "s’il est facile à démonter et si des pièces détachées sont disponibles"
      ],
      answer: 2,
      explanation: "L’indice de réparabilité (note sur 10) évalue la facilité de démontage, la disponibilité des pièces détachées et de la documentation. Plus la note est haute, plus l’objet pourra être réparé au lieu d’être jeté : c’est le critère de réparabilité vu avec notre capteur, appliqué à grande échelle.",
      whyOthers: [
        "La vitesse ou la puissance décrivent les performances de l’appareil, pas la possibilité de le réparer quand il tombe en panne.",
        "L’indice ne donne pas un prix moyen : il évalue la conception de l’appareil et l’accès aux pièces détachées, pas le tarif d’un réparateur.",
        ""
      ],
      exampleGarden: "La classe a préféré un capteur vendu avec un connecteur détachable plutôt qu’un modèle aux fils soudés : plus facile à remplacer, donc plus réparable.",
      exampleOther: "Entre deux consoles au même prix, celle dont les manettes se démontent pour changer un joystick usé durera plus longtemps.",
      takeaway: "L’indice de réparabilité applique aux objets du quotidien le critère que nous utilisons pour le jardin : facile à démonter et à réparer = durable."
    },
    {
      id: "s7q15",
      theme: "Diagnostic de panne",
      question: "Après le remplacement du capteur, la pompe arrose sans arrêt alors que le sol est bien humide. Quelle est la cause la plus probable ?",
      choices: [
        "Le réservoir d’eau du jardin connecté est trop rempli",
        "Le seuil du programme correspond encore à l’ancien capteur : il faut recalibrer",
        "L’impulsion d’arrosage de 2 secondes est beaucoup trop courte pour humidifier le sol"
      ],
      answer: 1,
      explanation: "Le capteur neuf ne donne pas les mêmes valeurs que l’ancien. Si le seuil n’a pas été mis à jour, le programme compare les nouvelles mesures à un seuil dépassé et croit le sol sec en permanence. La re-calibration corrige le problème.",
      whyOthers: [
        "Un réservoir bien rempli permet d’arroser, mais ne déclenche pas l’arrosage : c’est la comparaison entre la mesure et le seuil qui décide.",
        "",
        "L’impulsion de 2 secondes limite chaque arrosage, c’est une sécurité voulue : même courte, elle n’explique pas pourquoi le programme croit le sol sec à chaque mesure."
      ],
      exampleGarden: "L’ancien seuil était 520 ; le capteur neuf affiche 560 même en sol humide. Comme 560 > 520, le programme déclenche l’arrosage à chaque tour de boucle.",
      exampleOther: "Après le remplacement de la sonde de température d’un four, si elle n’est pas réglée, le four chauffe trop : la sonde neuve ne mesure pas comme l’ancienne.",
      takeaway: "Un comportement bizarre juste après un remplacement de capteur = penser d’abord à la re-calibration."
    },
    {
      id: "s7q16",
      theme: "Coût sur la durée de vie",
      question: "Le capteur capacitif coûte 8 € et dure 3 ans. Le capteur résistif coûte 2 € mais doit être remplacé tous les 6 mois. Sur 3 ans, quelle solution est la plus économique ?",
      choices: [
        "Le capteur capacitif : 8 € en tout, contre 6 remplacements × 2 € = 12 € pour le résistif",
        "Le capteur résistif : 2 €, c’est forcément moins cher que 8 €",
        "Les deux solutions coûtent exactement la même chose sur 3 ans"
      ],
      answer: 0,
      explanation: "Sur 3 ans, il faut 6 capteurs résistifs (un tous les 6 mois), soit 6 × 2 € = 12 €. Le capacitif ne coûte que 8 € sur la même durée. Pour juger un coût, on raisonne sur toute la durée de vie, pas seulement sur le prix d’achat. Et chaque remplacement demande aussi du temps de maintenance et de re-calibration.",
      whyOthers: [
        "",
        "2 € est moins cher à l’achat, mais il faut racheter un capteur tous les 6 mois : sur 3 ans, la facture grimpe à 12 €, plus le temps passé à recalibrer.",
        "Le calcul montre 8 € d’un côté et 12 € de l’autre : les deux solutions ne coûtent pas la même chose sur 3 ans."
      ],
      exampleGarden: "Pour le jardin définitif du collège, la classe choisit le capacitif : moins cher sur la durée, plus stable, et moins de séances de maintenance.",
      exampleOther: "Une imprimante bon marché aux cartouches hors de prix revient souvent plus cher qu’un modèle à réservoirs rechargeables : c’est le coût total qui compte.",
      takeaway: "Comparer les coûts sur toute la durée de vie : le moins cher à l’achat n’est pas toujours le plus économique."
    },
    {
      id: "s7q17",
      theme: "Maintenance préventive",
      question: "Quel geste relève de la maintenance préventive du jardin connecté ?",
      choices: [
        "Attendre que la pompe grille complètement pour la remplacer par une pompe toute neuve",
        "Désactiver une à une les sécurités du programme pour gagner du temps pendant les séances",
        "Contrôler régulièrement le capteur et relire ses mesures avant qu’il ne dérive trop"
      ],
      answer: 2,
      explanation: "Contrôler l’état des électrodes et vérifier les mesures affichées permet de repérer la corrosion et la dérive avant la panne. C’est exactement l’esprit de la maintenance préventive : de petits contrôles réguliers évitent de grosses réparations.",
      whyOthers: [
        "Attendre la panne, c’est de la maintenance corrective : la pompe grillée coûte plus cher qu’un contrôle régulier, et les plantes restent sans arrosage pendant ce temps.",
        "Les sécurités ne se désactivent jamais : elles protègent la pompe et les plantes. Les retirer, c’est créer des pannes au lieu de les prévenir.",
        ""
      ],
      exampleGarden: "Le planning de la classe prévoit un contrôle mensuel : inspection des électrodes, lecture des valeurs en sol sec et humide, comparaison avec le seuil.",
      exampleOther: "Détartrer la bouilloire régulièrement lui évite de tomber en panne : quelques minutes d’entretien prolongent la vie de l’appareil.",
      takeaway: "De petits contrôles réguliers évitent les grosses pannes : c’est la maintenance préventive."
    },
    {
      id: "s7q18",
      theme: "Vérifier par l’affichage",
      question: "Le moniteur série affiche : sol sec = 680, sol humide = 420. Le programme contient const int SEUIL_HUMIDITE = 590;. La re-calibration est-elle correcte ?",
      choices: [
        "Non : le seuil devrait être plus grand que 680",
        "Oui : 590 se situe bien entre la valeur du sol humide (420) et celle du sol sec (680)",
        "Non : le seuil devrait être plus petit que 420"
      ],
      answer: 1,
      explanation: "Un bon seuil sépare nettement les deux situations : 420 < 590 < 680. En sol sec, la mesure (680) dépasse le seuil : le programme peut arroser si le réservoir le permet. En sol humide, la mesure (420) reste sous le seuil : pas d’arrosage. La re-calibration est validée.",
      whyOthers: [
        "Un seuil au-dessus de 680 ne serait jamais dépassé, même en sol très sec : le programme n’arroserait plus jamais.",
        "",
        "Un seuil sous 420 serait toujours dépassé, même en sol humide : le programme arroserait sans arrêt et noierait les plantes."
      ],
      exampleGarden: "La classe note les trois valeurs au tableau — 420, 590, 680 — et vérifie d’un coup d’œil que le seuil est bien encadré par les deux mesures.",
      exampleOther: "L’alerte de batterie d’un smartphone se déclenche à 20 % : un niveau bien situé entre 100 % (plein) et 0 % (vide), ni trop tôt ni trop tard.",
      takeaway: "Vérification réussie quand : valeur sol humide < seuil < valeur sol sec."
    },
    {
      id: "s7q19",
      theme: "Transfert : choix durable",
      question: "Ta famille hésite entre deux machines à laver. Laquelle est la solution la plus durable ?",
      choices: [
        "Celle dont les pièces détachées restent disponibles 10 ans, même si elle est un peu plus chère",
        "La machine la moins chère du magasin, même si aucune pièce détachée n’est disponible pour la réparer",
        "La machine la plus grande possible, pour pouvoir laver davantage de linge à la fois"
      ],
      answer: 0,
      explanation: "On retrouve les critères de la séance : durée de vie, réparabilité et maintenance comptent autant que le prix d’achat. Une machine réparable pendant 10 ans évitera peut-être d’en racheter une entière à la première panne : elle est plus durable, et souvent plus économique sur la durée.",
      whyOthers: [
        "",
        "La machine la moins chère, sans pièces détachées disponibles, finit à la déchetterie à la première panne sérieuse : coût élevé sur la durée et gaspillage de ressources.",
        "La taille répond à un besoin de capacité, pas de durabilité : une grande machine non réparable reste fragile face à la première panne."
      ],
      exampleGarden: "C’est le même raisonnement qui a fait préférer le capteur capacitif à connecteur détachable : un peu plus cher, mais durable et facile à remplacer.",
      exampleOther: "Un casque audio à câble détachable se répare en changeant le câble ; un câble soudé qui casse condamne souvent tout le casque.",
      takeaway: "Le réflexe durable : vérifier la disponibilité des pièces et la facilité de réparation avant d’acheter."
    },
    {
      id: "s7q20",
      theme: "Sécurités conservées",
      question: "Après la re-calibration, la condition d’arrosage reste : if (mesure > SEUIL_HUMIDITE && reservoirOK). Qu’est-ce qui a changé et qu’est-ce qui est conservé ?",
      choices: [
        "Tout a changé : la condition a été entièrement réécrite",
        "Rien n’a changé du tout, pas même la valeur du seuil",
        "Seule la valeur de SEUIL_HUMIDITE a changé (590) ; le && garde le réservoir prioritaire, comme avant"
      ],
      answer: 2,
      explanation: "La maintenance met à jour la valeur mesurée — le seuil passe à 590 — sans toucher à la structure du programme. Le && exige toujours les deux conditions à la fois : sol sec ET réservoir disponible. La sécurité réservoir reste donc prioritaire, comme avant.",
      whyOthers: [
        "La condition est identique lettre pour lettre : seul le nombre rangé dans la constante SEUIL_HUMIDITE a été mis à jour.",
        "Si rien n’avait changé, le seuil serait encore celui de l’ancien capteur et les décisions d’arrosage seraient fausses : la valeur 590 est bien nouvelle.",
        ""
      ],
      exampleGarden: "Avec le capteur neuf : mesure 680 en sol sec et réservoir plein → les deux conditions sont vraies, la pompe démarre pour son impulsion de 2 secondes, puis s’arrête explicitement.",
      exampleOther: "Sur une trottinette électrique, changer la batterie ne modifie pas le limiteur de vitesse : la pièce change, la sécurité reste.",
      takeaway: "Recalibrer = changer une valeur, pas la logique : le && et les sécurités restent en place."
    }
  ]
};
