/* TechnoQuest — QCM de la séance 4 : Protéger la pompe.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s4q1 à s4q10 : essentielles · s4q11 à s4q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[4] = {
  session: 4,
  title: "Séance 4 — Protéger la pompe",
  questions: [
    {
      id: "s4q1",
      theme: "Sécurité prioritaire",
      question: "Dans le programme de la séance 4, pourquoi teste-t-on le niveau du réservoir AVANT l’humidité du sol ?",
      choices: [
        "Parce que le capteur de niveau est branché sur A2, une broche plus rapide que les autres",
        "Parce que la sécurité passe avant tout : sans eau, la pompe ne doit jamais démarrer",
        "Parce que le capteur d’humidité du sol met beaucoup plus de temps à répondre"
      ],
      answer: 1,
      explanation: "On place toujours le test de sécurité en premier dans le programme. Si le réservoir est vide, la pompe est arrêtée immédiatement, quelle que soit l’humidité du sol. C’est ce qu’on appelle la sécurité prioritaire.",
      whyOthers: [
        "Le numéro de broche ne change rien à la vitesse : toutes les entrées analogiques (A0, A1, A2...) se lisent aussi rapidement les unes que les autres.",
        "",
        "Les deux capteurs répondent en une fraction de seconde : l’ordre des tests est un choix de sécurité, pas une question de vitesse."
      ],
      exampleGarden: "Même si le sol est très sec, le programme vérifie d’abord niveauEau : si le réservoir est vide, il affiche l’alerte et n’arrose pas.",
      exampleOther: "Un ascenseur vérifie d’abord que les portes sont bien fermées avant d’accepter de monter : la sécurité est testée avant le service demandé.",
      takeaway: "La condition de sécurité se teste toujours en premier dans le programme."
    },
    {
      id: "s4q2",
      theme: "Marche à vide",
      question: "Qu’appelle-t-on la « marche à vide » d’une pompe ?",
      choices: [
        "La pompe tourne alors qu’il n’y a plus d’eau à aspirer",
        "La pompe reste arrêtée alors que le réservoir est plein",
        "La pompe tourne au ralenti parce que la pile est usée"
      ],
      answer: 0,
      explanation: "Une pompe en marche à vide tourne sans eau. L’eau sert aussi à la refroidir et à la lubrifier : sans eau, la pompe s’échauffe et s’use très vite. C’est pour cela que la marche à vide est interdite.",
      whyOthers: [
        "",
        "Une pompe arrêtée ne risque rien : le problème de la marche à vide, c’est justement qu’elle TOURNE sans eau.",
        "Une pile faible ralentit le moteur mais ne s’appelle pas « marche à vide » : le vide dont on parle, c’est l’absence d’eau."
      ],
      exampleGarden: "Si le réservoir se vide pendant l’arrosage et que la pompe continue de tourner, elle s’échauffe et peut être détruite en quelques minutes.",
      exampleOther: "Une bouilloire mise en marche sans eau chauffe dangereusement : les modèles récents ont une sécurité qui coupe le chauffage dans ce cas.",
      takeaway: "Marche à vide = pompe qui tourne sans eau : échauffement et usure, donc interdit."
    },
    {
      id: "s4q3",
      theme: "Opérateur && (ET logique)",
      question: "Avec l’opérateur && (ET), quand la condition complète est-elle vraie ?",
      choices: [
        "Dès qu’une seule des deux conditions est vraie",
        "Quand les deux conditions sont fausses",
        "Uniquement quand les DEUX conditions sont vraies en même temps"
      ],
      answer: 2,
      explanation: "L’opérateur && signifie ET : il exige que les deux conditions soient vraies en même temps. Si l’une des deux est fausse, le résultat est faux. Petite table de vérité : vrai && vrai = vrai ; tous les autres cas = faux.",
      whyOthers: [
        "Une seule condition vraie ne suffit pas avec && : c’est le comportement d’un autre opérateur (le OU), pas celui du ET.",
        "Deux conditions fausses donnent forcément un résultat faux : faux && faux = faux.",
        ""
      ],
      exampleGarden: "L’arrosage démarre seulement si humidite < SEUIL_HUMIDITE ET niveauEau >= SEUIL_RESERVOIR : sol sec ET eau disponible.",
      exampleOther: "Un four à micro-ondes ne chauffe que si la porte est fermée ET si un temps de cuisson a été réglé : les deux conditions sont exigées.",
      takeaway: "&& (ET) : les deux conditions doivent être vraies pour que le résultat soit vrai."
    },
    {
      id: "s4q4",
      theme: "&& avec une condition fausse",
      question: "Le sol est sec (première condition vraie) mais le réservoir est vide (deuxième condition fausse). Que vaut la condition « sol sec && réservoir plein » ?",
      choices: [
        "Vrai, car une condition vraie suffit à rendre le tout vrai",
        "Faux, car une seule condition fausse suffit à rendre le ET faux",
        "On ne peut pas répondre sans connaître la température"
      ],
      answer: 1,
      explanation: "Avec &&, il suffit qu’UNE des conditions soit fausse pour que l’ensemble soit faux : vrai && faux = faux. C’est exactement ce qui protège la pompe : sol sec ne suffit pas, il faut aussi de l’eau.",
      whyOthers: [
        "C’est l’inverse : avec le ET, une condition vraie ne suffit jamais, il faut que TOUTES les conditions soient vraies.",
        "",
        "La température n’intervient pas ici : la table de vérité du ET suffit pour répondre, vrai && faux = faux."
      ],
      exampleGarden: "Sol sec + réservoir vide : la condition d’arrosage est fausse, la pompe reste arrêtée et l’alerte « Réservoir vide » s’affiche.",
      exampleOther: "Un distributeur de boissons ne sert que si on a payé ET choisi une boisson : payer sans choisir ne déclenche rien.",
      takeaway: "Une seule condition fausse rend tout le ET faux : vrai && faux = faux."
    },
    {
      id: "s4q5",
      theme: "Le rôle de else if",
      question: "À quoi sert le mot-clé else if dans le programme de la séance 4 ?",
      choices: [
        "À répéter le même test plusieurs fois pour être sûr du résultat",
        "À exécuter deux blocs d’instructions en même temps",
        "À tester une nouvelle condition si la précédente était fausse"
      ],
      answer: 2,
      explanation: "else if enchaîne les décisions : on ne teste la condition d’arrosage QUE si le test « réservoir vide » a échoué. Cela crée un ordre de priorité entre les décisions du programme.",
      whyOthers: [
        "Chaque test est fait une seule fois par passage : else if ajoute un NOUVEAU test, il ne répète pas le précédent.",
        "Un seul bloc s’exécute à la fois : else if sert justement à choisir entre plusieurs blocs, jamais à en lancer deux ensemble.",
        ""
      ],
      exampleGarden: "if (niveauEau < SEUIL_RESERVOIR) { arrêt + alerte } else if (sol sec && eau disponible) { arrosage 3 s } else { arrêt } : trois décisions en cascade.",
      exampleOther: "Un radiateur intelligent décide en cascade : si fenêtre ouverte, on coupe ; sinon si la pièce est froide, on chauffe ; sinon on ne fait rien.",
      takeaway: "else if permet d’enchaîner des décisions dans un ordre de priorité."
    },
    {
      id: "s4q6",
      theme: "Alerte utilisateur",
      question: "Quelle instruction affiche l’alerte « Réservoir vide » sur le moniteur série de l’ordinateur ?",
      choices: [
        "Serial.println(\"Réservoir vide\");",
        "digitalWrite(\"Réservoir vide\");",
        "analogRead(\"Réservoir vide\");"
      ],
      answer: 0,
      explanation: "Serial.println() envoie un message de la carte vers l’ordinateur par le câble USB. On l’utilise depuis la séance 3 pour lire les valeurs des capteurs, et ici pour prévenir l’utilisateur qu’il doit remplir le réservoir.",
      whyOthers: [
        "",
        "digitalWrite() met une broche à HIGH ou LOW (comme pour le relais) : elle ne sait pas envoyer de texte à l’ordinateur.",
        "analogRead() LIT une valeur sur une broche analogique : elle ne peut ni écrire ni afficher un message."
      ],
      exampleGarden: "Quand niveauEau < 350, le programme arrête la pompe puis exécute Serial.println(\"Réservoir vide\") : le message apparaît sur le moniteur série.",
      exampleOther: "Une imprimante affiche « Plus de papier » au lieu de continuer à imprimer dans le vide : l’objet informe l’utilisateur du problème.",
      takeaway: "Serial.println() sert à envoyer un message d’alerte de la carte vers l’utilisateur."
    },
    {
      id: "s4q7",
      theme: "Seuil du réservoir",
      question: "On a const int SEUIL_RESERVOIR = 350; et le capteur du réservoir renvoie niveauEau = 210. Que fait le programme ?",
      choices: [
        "Il arrose pendant 3 secondes car le réservoir est presque plein",
        "Il arrête la pompe et affiche « Réservoir vide », car 210 < 350",
        "Il attend que niveauEau remonte exactement à 350 avant de décider"
      ],
      answer: 1,
      explanation: "Le premier test du programme est if (niveauEau < SEUIL_RESERVOIR). Comme 210 < 350 est vrai, le bloc de sécurité s’exécute : pompe arrêtée et alerte « Réservoir vide » sur le moniteur série.",
      whyOthers: [
        "C’est l’inverse : une valeur SOUS le seuil (210 < 350) signale un réservoir vide, donc l’arrosage est interdit.",
        "",
        "Le programme ne se met jamais en attente : à chaque passage dans loop() il relit les capteurs et décide immédiatement."
      ],
      exampleGarden: "Tant que le capteur A2 renvoie une valeur inférieure à 350, chaque tour de loop() maintient la pompe arrêtée et répète l’alerte.",
      exampleOther: "Une voiture allume le voyant de carburant quand le niveau mesuré passe sous un seuil : même principe de comparaison à une valeur fixée.",
      takeaway: "niveauEau < SEUIL_RESERVOIR vrai = réservoir vide : arrêt de la pompe et alerte."
    },
    {
      id: "s4q8",
      theme: "La comparaison >=",
      question: "Dans la condition niveauEau >= SEUIL_RESERVOIR, que signifie le symbole >= ?",
      choices: [
        "niveauEau est strictement plus grand que le seuil (l’égalité est exclue)",
        "niveauEau est plus petit que le seuil",
        "niveauEau est plus grand que le seuil OU égal au seuil"
      ],
      answer: 2,
      explanation: ">= se lit « supérieur ou égal » : la condition est vraie si niveauEau dépasse le seuil, mais aussi s’il lui est exactement égal. C’est le contraire exact de <, utilisé pour détecter le réservoir vide.",
      whyOthers: [
        "Le « strictement plus grand » s’écrit > sans le signe = : avec >=, le cas d’égalité rend aussi la condition vraie.",
        "« Plus petit que » s’écrit < : c’est justement la comparaison du test « réservoir vide », l’opposé de >=.",
        ""
      ],
      exampleGarden: "niveauEau >= SEUIL_RESERVOIR vérifie qu’il reste assez d’eau : 350 ou plus, l’arrosage est autorisé ; 349 ou moins, il est interdit.",
      exampleOther: "Une attraction affiche « taille >= 1,40 m » : un enfant qui mesure exactement 1,40 m a le droit de monter, l’égalité compte.",
      takeaway: ">= signifie « supérieur ou égal » : l’égalité rend la condition vraie."
    },
    {
      id: "s4q9",
      theme: "Deux lectures de capteurs",
      question: "Quelle instruction lit correctement le niveau d’eau du réservoir et le range dans une variable ?",
      choices: [
        "int niveauEau = analogRead(PIN_NIVEAU_EAU);",
        "int niveauEau = digitalWrite(PIN_NIVEAU_EAU);",
        "int niveauEau = Serial.println(PIN_NIVEAU_EAU);"
      ],
      answer: 0,
      explanation: "Comme pour l’humidité du sol, on utilise analogRead() sur la broche du capteur (ici A2). Le résultat, un nombre entre 0 et 1023, est rangé dans la variable int niveauEau pour être comparé au seuil.",
      whyOthers: [
        "",
        "digitalWrite() ÉCRIT un état HIGH ou LOW sur une broche de sortie : elle ne renvoie aucune mesure à ranger dans une variable.",
        "Serial.println() affiche un message sur le moniteur série : elle n’effectue aucune lecture de capteur."
      ],
      exampleGarden: "Au début de loop(), le programme fait deux lectures : int humidite = analogRead(PIN_HUMIDITE_SOL); puis int niveauEau = analogRead(PIN_NIVEAU_EAU);",
      exampleOther: "Une station météo lit chacun de ses capteurs (température, vent, pluie) dans une variable différente avant d’afficher son bilan.",
      takeaway: "analogRead() lit un capteur analogique ; une variable par capteur pour mémoriser chaque mesure."
    },
    {
      id: "s4q10",
      theme: "Ordre des tests",
      question: "Le sol est très sec ET le réservoir est vide en même temps. Que fait le programme de la séance 4 ?",
      choices: [
        "Il arrose quand même 3 secondes, car un sol sec est toujours prioritaire",
        "Il n’arrose pas : le test du réservoir arrive en premier et bloque l’arrosage",
        "Il arrose deux fois plus longtemps pour compenser le manque d’eau"
      ],
      answer: 1,
      explanation: "Le if (niveauEau < SEUIL_RESERVOIR) est placé en premier : sa condition est vraie, donc son bloc s’exécute (arrêt + alerte) et les tests suivants ne sont même pas regardés. La pompe est protégée.",
      whyOthers: [
        "C’est l’inverse : dans ce programme, c’est la sécurité du matériel qui est prioritaire, pas le besoin d’arrosage.",
        "",
        "Arroser sans eau est impossible et dangereux : la pompe tournerait à vide, s’échaufferait et s’userait."
      ],
      exampleGarden: "Sol desséché + réservoir à sec : le moniteur série affiche « Réservoir vide » et la pompe reste arrêtée jusqu’au remplissage du réservoir.",
      exampleOther: "Une tondeuse robot rentre se recharger quand sa batterie est presque vide, même si la pelouse n’est pas finie : la protection passe avant la tâche.",
      takeaway: "Le test placé en premier gagne : si la sécurité se déclenche, le reste n’est pas exécuté."
    },
    {
      id: "s4q11",
      theme: "Table de vérité du ET",
      question: "Parmi ces trois combinaisons, laquelle donne un résultat VRAI avec l’opérateur && ?",
      choices: [
        "vrai && faux",
        "faux && vrai",
        "vrai && vrai"
      ],
      answer: 2,
      explanation: "La table de vérité du ET ne contient qu’une seule ligne vraie : vrai && vrai = vrai. Les trois autres combinaisons (vrai/faux, faux/vrai, faux/faux) donnent toutes un résultat faux.",
      whyOthers: [
        "La deuxième condition est fausse, donc le ET est faux : l’ordre des conditions ne change rien.",
        "La première condition est fausse, donc le ET est faux, même si la deuxième est vraie.",
        ""
      ],
      exampleGarden: "L’arrosage ne se déclenche que sur la ligne « vrai && vrai » : sol sec (vrai) et eau disponible (vrai) en même temps.",
      exampleOther: "Une machine à laver ne lance le cycle que si la porte est verrouillée ET si un programme est sélectionné : une seule ligne de la table autorise le départ.",
      takeaway: "Une seule combinaison rend le ET vrai : vrai && vrai."
    },
    {
      id: "s4q12",
      theme: "Découverte : différence entre && (ET) et || (OU)",
      question: "En Arduino il existe aussi l’opérateur || (OU) : la condition complète est vraie dès qu’AU MOINS UNE des deux conditions est vraie. Quelle est alors la différence entre && et || ?",
      choices: [
        "&& exige que les deux conditions soient vraies ; || se contente d’une seule condition vraie",
        "&& et || donnent toujours exactement le même résultat",
        "|| exige que les deux conditions soient vraies ; && se contente d’une seule condition vraie"
      ],
      answer: 0,
      explanation: "&& (ET) est exigeant : il faut les deux conditions vraies. || (OU) est plus tolérant : une seule condition vraie suffit. Par exemple, vrai || faux = vrai, alors que vrai && faux = faux.",
      whyOthers: [
        "",
        "Ils diffèrent dès qu’une seule condition est vraie : vrai && faux = faux mais vrai || faux = vrai.",
        "C’est l’inverse : le symbole && correspond au ET (exigeant), et || correspond au OU (une condition suffit)."
      ],
      exampleGarden: "Pour arroser, on utilise && : sol sec ET eau disponible. Avec ||, la pompe arroserait dès que le sol est sec, même réservoir vide : dangereux !",
      exampleOther: "Une alarme incendie utilise le OU : elle sonne si elle détecte de la fumée OU une forte chaleur ; un seul signe de danger suffit.",
      takeaway: "&& = les deux conditions vraies ; || = au moins une condition vraie."
    },
    {
      id: "s4q13",
      theme: "Le bloc else final",
      question: "Le sol est humide et le réservoir est plein. Quel bloc du programme s’exécute ?",
      choices: [
        "Le bloc d’arrosage : la pompe tourne 3 secondes",
        "Le bloc else final : la pompe reste arrêtée",
        "Aucun bloc : le programme s’arrête définitivement"
      ],
      answer: 1,
      explanation: "Le test « réservoir vide » est faux (réservoir plein), et le test d’arrosage est faux aussi (le sol n’est pas sec). Quand toutes les conditions sont fausses, c’est le bloc else final qui s’exécute : pompe arrêtée.",
      whyOthers: [
        "Pour arroser, il faudrait humidite < SEUIL_HUMIDITE : un sol humide rend cette condition fausse, donc pas d’arrosage.",
        "",
        "Le programme ne s’arrête jamais : loop() recommence aussitôt et relira les capteurs au tour suivant."
      ],
      exampleGarden: "Sol humide + réservoir plein : rien à faire, le else final maintient la pompe à l’arrêt, et loop() surveillera à nouveau au prochain tour.",
      exampleOther: "Un aspirateur robot dont la batterie est chargée et la pièce déjà propre reste à sa base : « ne rien faire » est aussi une décision du programme.",
      takeaway: "Le else final couvre tous les cas restants : ici, il maintient la pompe arrêtée."
    },
    {
      id: "s4q14",
      theme: "La double condition d’arrosage",
      question: "Pourquoi écrire humidite < SEUIL_HUMIDITE && niveauEau >= SEUIL_RESERVOIR dans le else if, plutôt qu’une seule condition ?",
      choices: [
        "Pour n’arroser que si le sol est sec ET s’il reste de l’eau",
        "Pour que la pompe arrose deux fois plus vite grâce aux deux conditions",
        "Parce qu’Arduino oblige à écrire deux conditions dans chaque test"
      ],
      answer: 0,
      explanation: "La double condition verrouille la décision d’arrosage : le besoin (sol sec) ET la ressource (eau disponible) doivent être réunis. C’est une deuxième barrière de sécurité, en plus du test du réservoir placé en premier.",
      whyOthers: [
        "",
        "Une condition ne change pas la vitesse de la pompe : elle décide seulement si le bloc s’exécute ou non.",
        "Arduino accepte très bien une condition unique : mettre deux conditions ici est un CHOIX de sécurité, pas une obligation du langage."
      ],
      exampleGarden: "Grâce au &&, même si on modifiait l’ordre des tests par erreur, l’arrosage resterait impossible avec un réservoir vide.",
      exampleOther: "Un portail automatique ne se ferme que si l’ordre de fermeture est donné ET si aucun obstacle n’est détecté : deux conditions pour agir sans danger.",
      takeaway: "Combiner besoin ET sécurité dans la même condition rend le programme plus sûr."
    },
    {
      id: "s4q15",
      theme: "Transfert : sécurité prioritaire ailleurs",
      question: "Quel objet applique le MÊME principe que notre test du réservoir passé en premier (sécurité prioritaire) ?",
      choices: [
        "Une lampe de jardin qui s’allume dès qu’il fait nuit",
        "Un réveil qui sonne tous les matins à 7 heures",
        "Un sèche-linge qui refuse de démarrer tant que le hublot est ouvert"
      ],
      answer: 2,
      explanation: "Le sèche-linge vérifie d’abord une condition de sécurité (hublot fermé) avant de rendre le service demandé (sécher le linge). C’est exactement notre logique : d’abord la sécurité, ensuite l’action.",
      whyOthers: [
        "La lampe réagit simplement à une mesure de luminosité : c’est un if avec seuil (séance 3), sans condition de sécurité qui bloque l’action.",
        "Le réveil déclenche une action à heure fixe : il n’y a aucun test de sécurité qui pourrait empêcher la sonnerie.",
        ""
      ],
      exampleGarden: "Réservoir vide = hublot ouvert : dans les deux cas, l’appareil refuse de démarrer et le signale, quelle que soit la demande.",
      exampleOther: "Un drone refuse de décoller si sa batterie est trop faible pour revenir : la vérification de sécurité passe avant la mission.",
      takeaway: "Beaucoup d’objets techniques testent une sécurité AVANT d’exécuter leur fonction principale."
    },
    {
      id: "s4q16",
      theme: "Cas limite du seuil",
      question: "Le capteur renvoie niveauEau = 350, exactement la valeur de SEUIL_RESERVOIR. Le programme considère-t-il le réservoir comme vide ?",
      choices: [
        "Oui : le capteur atteint le seuil, donc 350 < 350 est vrai",
        "Non : 350 < 350 est faux, l’arrosage reste possible",
        "Le programme plante car les deux valeurs sont égales"
      ],
      answer: 1,
      explanation: "Le symbole < est STRICT : 350 < 350 est faux, car un nombre n’est pas plus petit que lui-même. Le programme passe donc au else if, où 350 >= 350 est vrai : l’eau est considérée comme suffisante.",
      whyOthers: [
        "Atteindre le seuil ne rend pas le < vrai : 350 < 350 est faux ; pour que l’égalité compte, il faudrait écrire <=.",
        "",
        "Comparer deux valeurs égales est parfaitement normal pour la carte : elle répond simplement « faux » à 350 < 350."
      ],
      exampleGarden: "Les deux comparaisons du programme se complètent exactement : < 350 déclenche l’alerte, >= 350 autorise l’arrosage ; aucune valeur n’est oubliée.",
      exampleOther: "Sur une balance de cuisine réglée pour alerter « sous 100 g », un poids d’exactement 100 g ne déclenche pas l’alerte : la limite strictement inférieure l’exclut.",
      takeaway: "< est strict : la valeur exacte du seuil rend niveauEau < SEUIL faux et niveauEau >= SEUIL vrai."
    },
    {
      id: "s4q17",
      theme: "Lire un scénario complet",
      question: "Le sol est sec (humidite < SEUIL_HUMIDITE est vrai) et le capteur du réservoir renvoie 200. Que voit-on sur le moniteur série ?",
      choices: [
        "Le message « Réservoir vide », et la pompe ne démarre pas",
        "Rien du tout : le moniteur série ne fonctionne que quand la pompe tourne",
        "Un message d’arrosage, car le sol sec déclenche toujours la pompe"
      ],
      answer: 0,
      explanation: "200 < 350 : le premier test est vrai, donc son bloc s’exécute en entier : arrêt de la pompe et Serial.println(\"Réservoir vide\"). Le else if n’est même pas évalué, le sol sec n’y change rien.",
      whyOthers: [
        "",
        "Le moniteur série fonctionne en permanence tant que la carte est branchée en USB : il affiche justement les alertes quand la pompe est arrêtée.",
        "Le sol sec ne suffit plus depuis la séance 4 : le test du réservoir, placé avant, bloque l’arrosage quand l’eau manque."
      ],
      exampleGarden: "L’utilisateur qui lit « Réservoir vide » sur son écran sait exactement quoi faire : remplir le réservoir, puis l’arrosage redeviendra possible.",
      exampleOther: "Une cafetière affiche « Remplir le réservoir d’eau » et refuse de lancer le café : l’alerte remplace l’action impossible.",
      takeaway: "Savoir dérouler le programme dans sa tête permet de prévoir l’affichage et le comportement."
    },
    {
      id: "s4q18",
      theme: "Chaîne d’information à deux capteurs",
      question: "Avec deux capteurs (humidité du sol et niveau d’eau), que devient la chaîne d’information du jardin connecté ?",
      choices: [
        "Elle disparaît : deux capteurs qui mesurent en même temps s’annulent",
        "Elle devient une chaîne d’énergie, car il y a plus de courant à transporter",
        "Elle acquiert DEUX informations, traitées ensemble par la carte"
      ],
      answer: 2,
      explanation: "La chaîne d’information s’enrichit : ACQUÉRIR deux mesures (humidité, niveau d’eau), TRAITER les deux avec if / else if et l’opérateur &&, puis COMMUNIQUER l’ordre au relais ou l’alerte à l’utilisateur.",
      whyOthers: [
        "Les capteurs ne se gênent pas : chacun est lu sur sa propre broche analogique et fournit sa propre valeur.",
        "La chaîne d’énergie (pile, relais, pompe) ne change pas ici : ce sont les INFORMATIONS qui sont plus nombreuses, pas l’énergie.",
        ""
      ],
      exampleGarden: "A0 fournit l’humidité, A2 le niveau d’eau : la carte croise ces deux informations avant d’envoyer son ordre à la chaîne d’énergie via le relais.",
      exampleOther: "Un réfrigérateur connecté croise la température intérieure et l’état de la porte pour décider de refroidir ou d’alerter « porte ouverte ».",
      takeaway: "Plus de capteurs = plus d’informations à traiter, pour des décisions plus intelligentes et plus sûres."
    },
    {
      id: "s4q19",
      theme: "Un seul bloc s’exécute",
      question: "Dans un enchaînement if / else if / else, combien de blocs s’exécutent à chaque passage dans loop() ?",
      choices: [
        "Tous les blocs, exécutés l’un après l’autre",
        "Un seul : le premier dont la condition est vraie, ou le else si toutes sont fausses",
        "Deux blocs au maximum, si deux conditions sont vraies"
      ],
      answer: 1,
      explanation: "L’enchaînement if / else if / else choisit exactement UN bloc par passage : la carte descend la liste, s’arrête à la première condition vraie, et exécute le else seulement si toutes les conditions sont fausses.",
      whyOthers: [
        "Exécuter tous les blocs serait contradictoire : la pompe ne peut pas être à la fois arrêtée et en train d’arroser.",
        "",
        "Même si deux conditions étaient vraies en même temps, seule la PREMIÈRE rencontrée exécute son bloc : les suivantes sont ignorées."
      ],
      exampleGarden: "À chaque tour de loop(), la pompe est soit arrêtée avec alerte, soit en arrosage 3 s, soit simplement arrêtée : jamais deux comportements à la fois.",
      exampleOther: "Un feu tricolore est vert, orange OU rouge : le programme choisit un seul état à la fois, jamais deux couleurs ensemble.",
      takeaway: "if / else if / else garantit qu’un seul bloc s’exécute à chaque passage."
    },
    {
      id: "s4q20",
      theme: "Transfert : choisir entre ET et OU",
      question: "Un drone doit se poser d’urgence si sa batterie est faible OU si le vent est trop fort. Sachant que || (OU) est vrai dès qu’au moins une condition est vraie, quel opérateur faut-il utiliser ?",
      choices: [
        "&&, car il faut attendre que les deux dangers arrivent en même temps",
        "Aucun opérateur : un objet ne peut surveiller qu’un seul danger à la fois",
        "|| (OU) : un seul danger suffit à déclencher l’atterrissage de sécurité"
      ],
      answer: 2,
      explanation: "Pour une mise en sécurité, un seul danger doit suffire : c’est le rôle du || (OU). Avec &&, le drone continuerait de voler batterie vide tant que le vent resterait calme : beaucoup trop risqué.",
      whyOthers: [
        "Avec &&, il faudrait batterie faible ET vent fort EN MÊME TEMPS pour se poser : un seul des deux dangers ne suffirait pas, ce qui est dangereux.",
        "Un programme peut surveiller autant de conditions qu’on veut : il suffit de les combiner avec les opérateurs logiques && ou ||.",
        ""
      ],
      exampleGarden: "Dans notre jardin, c’est l’inverse : pour AUTORISER l’arrosage on exige tout avec && ; pour INTERDIRE ou alerter, un seul problème doit suffire.",
      exampleOther: "batterieFaible || ventFort : dès que l’une des deux conditions devient vraie, le drone déclenche son atterrissage d’urgence.",
      takeaway: "Pour autoriser une action : && (tout doit être bon) ; pour se mettre en sécurité : || (un seul danger suffit)."
    }
  ]
};
