/* TechnoQuest — QCM de la séance 8 : Défi ingénieur.
   STATUT : PROVISOIRE — en attente de la validation par Pascal des programmes
   C++ définitifs, des algorithmes colorés et des algorigrammes.
   Structure validée par prototype-fable/qcm/valider-qcm.mjs.
   s8q1 à s8q10 : essentielles · s8q11 à s8q20 : approfondissement/transfert.
   Aucune balise HTML dans ces données : les infobulles et le glossaire vivent
   dans glossaire-central.js + infobulles.js. */
"use strict";
window.TechnoQuestQCM = window.TechnoQuestQCM || {};
window.TechnoQuestQCM.data = window.TechnoQuestQCM.data || {};
window.TechnoQuestQCM.data[8] = {
  session: 8,
  title: "Séance 8 — Défi ingénieur",
  questions: [
    {
      id: "s8q1",
      theme: "Ordre des priorités",
      question: "Dans le programme final, quelle condition doit être testée EN PREMIER, avant toutes les autres ?",
      choices: [
        "humidite < SEUIL_HUMIDITE, car arroser les plantes est la mission principale du système",
        "niveauEau < SEUIL_RESERVOIR, car la sécurité de la pompe passe avant tout",
        "lumiere < SEUIL_LUMIERE, car c’est le capteur qui réagit le plus vite"
      ],
      answer: 1,
      explanation: "Dans un if / else if / else, les conditions sont examinées dans l’ordre où elles sont écrites. On place donc la vérification du réservoir tout en haut : c’est la priorité absolue, celle qui protège le matériel. L’ordre des conditions dans le programme traduit l’ordre des priorités du système.",
      whyOthers: [
        "Arroser est bien la mission du système, mais arroser sans eau ferait tourner la pompe à vide et l’abîmerait : la règle de sécurité doit être vérifiée avant la mission.",
        "",
        "La vitesse de réaction d’un capteur n’a rien à voir avec l’ordre des conditions : c’est l’importance de chaque règle (sa priorité) qui décide de l’ordre d’écriture."
      ],
      exampleGarden: "Dans notre programme, if (niveauEau < SEUIL_RESERVOIR) est écrit tout en haut : si le réservoir est vide, la pompe s’arrête et « Réservoir vide » s’affiche, quel que soit l’état du sol.",
      exampleOther: "Dans une voiture autonome, la détection d’un piéton passe avant la consigne de vitesse : la règle « freiner en cas de danger » est toujours testée en premier.",
      takeaway: "L’ordre des conditions dans le programme, c’est l’ordre des priorités : la sécurité s’écrit toujours en premier."
    },
    {
      id: "s8q2",
      theme: "Priorité absolue",
      question: "niveauEau = 320, humidite = 200 (sol très sec) et lumiere = 300 (nuit). Que fait le programme final ?",
      choices: [
        "Il arrose 2 secondes, car le sol est sec et la lumière est faible",
        "Il arrose plus longtemps pour compenser le manque d’eau",
        "Il arrête la pompe et affiche « Réservoir vide », car niveauEau (320) est inférieur à SEUIL_RESERVOIR (350)"
      ],
      answer: 2,
      explanation: "320 < 350 : la première condition est vraie, donc son bloc s’exécute (arrêt de la pompe + message « Réservoir vide ») et le programme ignore tout le reste. Le else if n’est même pas examiné : c’est exactement le rôle d’une priorité absolue.",
      whyOthers: [
        "Le sol est bien sec et la nuit tombée, mais le programme n’examine même pas cette condition : la première condition (réservoir vide) est vraie, donc les suivantes sont ignorées.",
        "« Arroser plus longtemps » n’existe pas dans le programme, et surtout il n’y a plus d’eau à envoyer : la pompe tournerait à vide et s’abîmerait.",
        ""
      ],
      exampleGarden: "Test à faire dans le simulateur : réglez niveauEau à 320, humidité à 200, lumière à 300, puis vérifiez que la pompe reste arrêtée et que « Réservoir vide » s’affiche.",
      exampleOther: "Dans une centrale électrique, quand le bouton d’arrêt d’urgence est enfoncé, toutes les autres commandes sont ignorées : la machine s’arrête, sans discussion.",
      takeaway: "Quand la première condition est vraie, tout le reste est ignoré : c’est cela, une priorité absolue."
    },
    {
      id: "s8q3",
      theme: "Protocole de tests",
      question: "Quelles sont les trois familles de cas que doit couvrir un protocole de tests complet ?",
      choices: [
        "Les cas normaux, les cas limites et les cas défaillants",
        "Les cas faciles, les cas moyens et enfin les cas les plus difficiles",
        "Les cas du matin, les cas du midi et les cas du soir"
      ],
      answer: 0,
      explanation: "Un protocole complet vérifie trois familles de situations : les cas normaux (fonctionnement attendu de tous les jours), les cas limites (valeurs pile égales aux seuils, ou situées entre deux seuils) et les cas défaillants (réservoir vide, capteur débranché, valeur incohérente).",
      whyOthers: [
        "",
        "« Facile » ou « difficile » ne décrit pas une situation du système : le protocole classe les cas selon ce qui est testé — fonctionnement attendu, frontière d’un seuil, ou panne.",
        "Le moment de la journée fait varier la lumière, mais ce n’est pas une famille de tests : on parle de cas normaux, limites et défaillants."
      ],
      exampleGarden: "Notre protocole : cas normal (sol sec + eau disponible → arrosage 2 s), cas limite (humidité exactement égale à 520), cas défaillant (capteur débranché qui renvoie 0 en permanence).",
      exampleOther: "Un constructeur d’ascenseurs teste le fonctionnement normal, la charge maximale exacte (cas limite) et une coupure de courant en pleine montée (cas défaillant).",
      takeaway: "Un bon protocole couvre trois familles : cas normaux, cas limites, cas défaillants."
    },
    {
      id: "s8q4",
      theme: "Cas normal",
      question: "Test d’un cas NORMAL : humidite = 200, lumiere = 500, niveauEau = 800. Quel comportement doit-on observer ?",
      choices: [
        "La pompe reste arrêtée : un niveauEau de 800 déclenche la mise en sécurité du réservoir",
        "La pompe arrose pendant 2 secondes : eau disponible, sol sec et lumière faible",
        "Le programme affiche « Réservoir vide » par précaution"
      ],
      answer: 1,
      explanation: "La première condition est fausse (800 n’est pas inférieur à 350 : le réservoir contient de l’eau). Le else if est alors examiné : 200 < 520 ET 500 < 700, les deux sont vraies, donc le bloc d’arrosage s’exécute pendant 2 secondes. C’est le comportement attendu du cas normal.",
      whyOthers: [
        "niveauEau = 800 signifie au contraire que l’eau est disponible (800 ≥ 350) : un niveau élevé ne déclenche aucune « mise en sécurité » et n’a jamais bloqué la pompe.",
        "",
        "Le message « Réservoir vide » ne s’affiche que si niveauEau est inférieur à 350 ; avec 800, le réservoir est bien rempli, il n’y a aucune raison d’alerter."
      ],
      exampleGarden: "Avec ces valeurs, la deuxième condition est vraie (200 < 520 ET 500 < 700) : la pompe démarre 2 secondes, puis le programme reprend ses mesures au tour suivant de loop().",
      exampleOther: "Le cas normal d’un test de four : on règle 180 °C et on vérifie que la température atteint bien 180 °C — le fonctionnement de tous les jours doit être irréprochable.",
      takeaway: "Un cas normal vérifie que le système fait correctement son travail de tous les jours."
    },
    {
      id: "s8q5",
      theme: "Cas limite",
      question: "Cas LIMITE : humidite vaut exactement 520 (la valeur du seuil), lumiere = 400 et niveauEau = 800. Que fait le programme ?",
      choices: [
        "Il n’arrose pas, car la condition humidite < 520 est fausse quand humidite vaut exactement 520",
        "Il arrose 2 secondes, car 520 est bien la valeur du seuil d’humidité",
        "Il affiche un message d’erreur, car cette valeur est interdite"
      ],
      answer: 0,
      explanation: "Le programme utilise < (strictement inférieur) : 520 < 520 est faux, donc le ET de la condition d’arrosage est faux et c’est le else final qui s’exécute (arrêt). Tester la valeur exacte du seuil permet de vérifier ce comportement de frontière.",
      whyOthers: [
        "",
        "La condition utilise < (strictement inférieur) : 520 < 520 est faux, donc le bloc d’arrosage n’est pas exécuté. C’est précisément ce que le cas limite met en évidence.",
        "Aucune valeur entre 0 et 1023 n’est « interdite » : 520 est une mesure possible comme une autre, et le programme la traite normalement, sans erreur."
      ],
      exampleGarden: "Si le cahier des charges voulait arroser aussi quand humidite vaut exactement 520, il faudrait écrire humidite <= SEUIL_HUMIDITE : le cas limite révèle ce choix d’écriture.",
      exampleOther: "Un radar routier réglé à 50 km/h : les ingénieurs vérifient ce qui se passe à exactement 50 km/h, pour ne flasher ni trop tôt ni trop tard.",
      takeaway: "Avec <, la valeur exacte du seuil ne déclenche pas l’action : les cas limites révèlent ce détail."
    },
    {
      id: "s8q6",
      theme: "Tester avant la mise en service",
      question: "Pourquoi faut-il dérouler tout le protocole de tests AVANT d’installer le système dans le vrai jardin ?",
      choices: [
        "Parce que c’est obligatoire pour avoir une bonne note, même si cela ne sert à rien",
        "Parce qu’un programme qui compile sans erreur ne peut plus contenir de défaut",
        "Pour découvrir et corriger les erreurs pendant qu’elles sont sans danger, avant qu’elles ne noient les plantes ou n’abîment la pompe"
      ],
      answer: 2,
      explanation: "Tester avant la mise en service, c’est provoquer volontairement toutes les situations (normales, limites, défaillantes) pendant qu’une erreur ne coûte rien. Une fois le système installé, la même erreur peut noyer les semis, vider le réservoir ou griller la pompe.",
      whyOthers: [
        "Les tests ne sont pas un rituel scolaire : dans l’industrie comme en classe, ils servent réellement à trouver les erreurs avant qu’elles ne coûtent cher.",
        "La compilation vérifie seulement l’écriture du programme (la syntaxe), pas sa logique : un programme peut compiler parfaitement et pourtant arroser au mauvais moment.",
        ""
      ],
      exampleGarden: "Une erreur d’ordre des conditions découverte dans le simulateur se corrige en deux minutes ; découverte au jardin, elle peut faire tourner la pompe à vide tout un week-end.",
      exampleOther: "Un nouveau médicament est testé pendant des années (essais cliniques) avant d’être vendu en pharmacie : on vérifie tout tant qu’on peut encore corriger.",
      takeaway: "Tester avant la mise en service, c’est trouver les erreurs tant qu’elles sont encore sans danger."
    },
    {
      id: "s8q7",
      theme: "Cas défaillant",
      question: "Pendant les tests, le capteur d’humidité renvoie 0 en permanence, même plongé dans un verre d’eau. Que faut-il en conclure ?",
      choices: [
        "Le sol est extrêmement sec, il faut arroser d’urgence : une valeur aussi basse prouve que la terre manque d’eau",
        "La valeur est incohérente : capteur sans doute débranché ou en panne, il faut vérifier le câblage",
        "C’est normal, un capteur renvoie souvent 0 pour se reposer"
      ],
      answer: 1,
      explanation: "Une valeur figée à 0 (ou à 1023) qui ne réagit à aucun changement n’est pas une mesure : c’est le symptôme classique d’un fil débranché, d’une soudure cassée ou d’un court-circuit. C’est un cas défaillant du protocole : on vérifie le montage avant de laisser le programme décider.",
      whyOthers: [
        "Même le sol le plus sec ne donne pas 0 pile en permanence, et surtout la valeur devrait changer quand on plonge le capteur dans l’eau : si rien ne bouge, le capteur ne mesure plus.",
        "",
        "Un capteur ne « se repose » jamais : s’il renvoie toujours 0, c’est qu’aucun signal ne lui parvient (fil débranché, mauvais contact, court-circuit)."
      ],
      exampleGarden: "Test défaillant du protocole : on débranche volontairement le capteur d’humidité, on note la valeur renvoyée et on observe ce que décide alors le programme.",
      exampleOther: "Un thermomètre médical qui afficherait 0 °C serait aussitôt mis de côté : aucun patient vivant n’est à cette température, la valeur est incohérente.",
      takeaway: "Une valeur figée à 0 ou 1023 n’est pas une mesure : c’est un signal de panne à vérifier."
    },
    {
      id: "s8q8",
      theme: "Structure if / else if / else",
      question: "Dans le programme final, à quoi sert le « else if » placé entre la vérification du réservoir et la condition d’arrosage ?",
      choices: [
        "Il permet d’exécuter le bloc du réservoir et le bloc d’arrosage en même temps, pour que le programme réagisse plus vite",
        "Il remplace le point-virgule attendu à la fin de chaque ligne du programme",
        "Il fait que la condition d’arrosage n’est examinée QUE si le réservoir n’est pas vide"
      ],
      answer: 2,
      explanation: "Le else if crée une hiérarchie : la condition d’arrosage n’est examinée que si la première condition (réservoir vide) est fausse. À chaque passage dans loop(), un seul bloc s’exécute — celui de la première condition vraie, ou le else final si aucune ne l’est.",
      whyOthers: [
        "Un if / else if / else exécute UN SEUL bloc par passage : celui de la première condition vraie. Les blocs ne s’exécutent jamais « en même temps ».",
        "Le else if est un mot-clé de structure, pas de la ponctuation : chaque instruction du programme garde son point-virgule.",
        ""
      ],
      exampleGarden: "Si niveauEau vaut 300, le bloc « Réservoir vide » s’exécute et le programme ne regarde même pas l’humidité ni la lumière : un seul bloc par tour de loop().",
      exampleOther: "Aux urgences de l’hôpital, on s’occupe d’abord des cas les plus graves ; les autres patients attendent leur tour : c’est un tri par priorité, une règle à la fois.",
      takeaway: "if / else if / else : les conditions sont examinées dans l’ordre et un seul bloc s’exécute."
    },
    {
      id: "s8q9",
      theme: "Validation du prototype",
      question: "Comment décide-t-on que le prototype du jardin connecté est VALIDÉ ?",
      choices: [
        "Quand chaque test du protocole donne le comportement que demande le cahier des charges",
        "Quand le programme compile sans aucun message d’erreur, preuve que la logique est forcément correcte",
        "Quand le montage est joli et bien rangé sur la table"
      ],
      answer: 0,
      explanation: "Valider un prototype, c’est comparer, test après test, le comportement observé au comportement attendu décrit dans le cahier des charges. Si tous les cas (normaux, limites, défaillants) donnent le résultat prévu, le prototype est validé.",
      whyOthers: [
        "",
        "Compiler sans erreur signifie seulement que le programme est bien écrit, pas qu’il fait ce qu’on attend : il pourrait arroser réservoir vide sans une seule erreur de compilation.",
        "Un montage soigné aide à travailler et à dépanner, mais la validation porte sur le comportement : le système fait-il ce que le cahier des charges demande ?"
      ],
      exampleGarden: "Exigence du cahier des charges : « ne jamais faire tourner la pompe réservoir vide ». Test : niveauEau = 300 → pompe arrêtée + message. Observé = attendu : exigence validée.",
      exampleOther: "Un pont n’est ouvert à la circulation qu’après des essais de charge : on vérifie qu’il se comporte exactement comme les calculs l’avaient prévu.",
      takeaway: "Valider = comparer le comportement observé à ce que demande le cahier des charges, test par test."
    },
    {
      id: "s8q10",
      theme: "Afficher les mesures",
      question: "Le programme final commence chaque tour de loop() par lire les trois capteurs et afficher les mesures dans le moniteur série. À quoi sert cet affichage ?",
      choices: [
        "À ralentir volontairement le programme entre deux mesures, ce qui économise la batterie de la carte",
        "À voir ce que « voit » l’Arduino, pour comprendre ses décisions pendant les tests",
        "À rien : l’Arduino refuse simplement de fonctionner sans Serial.println"
      ],
      answer: 1,
      explanation: "L’affichage série est la fenêtre du testeur : il montre les valeurs réellement mesurées (humidité, lumière, niveau d’eau) au moment où le programme décide. Pendant le protocole de tests, c’est lui qui permet de comparer mesure, seuil et décision.",
      whyOthers: [
        "L’affichage série n’est pas là pour ralentir ni pour économiser quoi que ce soit : c’est un outil d’observation indispensable pendant les tests.",
        "",
        "L’Arduino fonctionne très bien sans Serial.println ; mais en cas de comportement bizarre, on serait aveugle : impossible de savoir quelles valeurs il a réellement mesurées."
      ],
      exampleGarden: "Grâce à l’affichage, on lit par exemple « humidite : 342 » et on comprend aussitôt pourquoi l’arrosage s’est déclenché : 342 est inférieur au seuil 520.",
      exampleOther: "Un lave-linge moderne affiche un code d’erreur sur son écran : ce message aide le réparateur à comprendre la panne sans tout démonter.",
      takeaway: "Afficher les mesures, c’est voir ce que voit la carte : indispensable pour tester et diagnostiquer."
    },
    {
      id: "s8q11",
      theme: "Condition ET et cas entre deux seuils",
      question: "humidite = 300 (sol sec), lumiere = 800 (plein jour), niveauEau = 900. Pourquoi la pompe reste-t-elle arrêtée ?",
      choices: [
        "Parce que le ET exige sol sec ET lumière faible : ici, lumiere (800) n’est pas inférieure à 700",
        "Parce que le réservoir est vide et que cette priorité bloque l’arrosage",
        "Parce que 300 est supérieur au seuil d’humidité : le sol est encore jugé trop humide pour mériter un arrosage"
      ],
      answer: 0,
      explanation: "Le réservoir contient de l’eau (900 ≥ 350), donc le programme examine le else if : humidite < 520 est vraie (300 < 520), mais lumiere < 700 est fausse (800). Avec un ET (&&), une seule condition fausse suffit à rendre le tout faux : c’est le else final qui s’exécute.",
      whyOthers: [
        "",
        "niveauEau = 900 est supérieur à 350 : le réservoir contient de l’eau, ce n’est donc pas lui qui bloque l’arrosage.",
        "Au contraire, 300 est inférieur à 520 : le sol est bien considéré comme sec. C’est la lumière (800, non inférieure à 700) qui rend le ET faux."
      ],
      exampleGarden: "C’est un choix du cahier des charges : arroser en plein soleil gaspille l’eau (évaporation) ; on attend la fin de journée, quand lumiere passe sous 700.",
      exampleOther: "Sur des montagnes russes, le train ne démarre que si tous les harnais sont verrouillés ET si l’opérateur a donné le départ : une seule des deux conditions ne suffit pas.",
      takeaway: "Un ET exige que les deux conditions soient vraies en même temps : une seule ne suffit jamais."
    },
    {
      id: "s8q12",
      theme: "Pourquoi les cas limites sont précieux",
      question: "Pourquoi teste-t-on des valeurs exactement égales aux seuils (comme humidite = 520) plutôt que seulement des valeurs très éloignées ?",
      choices: [
        "Parce que ces valeurs font planter l’Arduino, incapable de comparer un nombre égal au seuil",
        "Parce qu’elles sont plus faciles à taper au clavier",
        "Parce que c’est pile à la frontière que se cachent les erreurs, comme confondre < et <="
      ],
      answer: 2,
      explanation: "Loin des seuils, presque tous les programmes se comportent pareil : c’est à la frontière que les choix d’écriture (< ou <=, ordre des conditions) changent la décision. Tester la valeur exacte du seuil vérifie que le comportement de frontière est bien celui voulu par le cahier des charges.",
      whyOthers: [
        "Une valeur égale au seuil ne fait pas planter la carte : elle est traitée comme n’importe quel nombre. Le risque n’est pas le plantage, c’est une décision inattendue.",
        "La facilité de saisie n’a aucun rapport : on choisit ces valeurs parce qu’elles se trouvent exactement à la frontière entre deux comportements.",
        ""
      ],
      exampleGarden: "Nos trois seuils donnent trois cas limites à tester : niveauEau = 350, humidite = 520, lumiere = 700. Trois occasions de vérifier nos < et notre ordre de priorités.",
      exampleOther: "Un distributeur de boissons : que se passe-t-il quand on insère exactement le prix demandé, ni plus ni moins ? C’est souvent là que les bugs se cachent.",
      takeaway: "Les erreurs se cachent aux frontières : testez toujours les valeurs exactes des seuils."
    },
    {
      id: "s8q13",
      theme: "Détection de valeur incohérente",
      question: "En pleine journée d’été, le capteur de lumière renvoie 1023 sans jamais bouger, même quand on le couvre complètement avec la main. Que doit penser un bon testeur ?",
      choices: [
        "La valeur est incohérente : un capteur qui ne réagit plus à rien est probablement mal branché ou en court-circuit",
        "Le soleil est vraiment très fort aujourd’hui, tout est normal",
        "1023 est la meilleure valeur possible, donc le capteur fonctionne parfaitement"
      ],
      answer: 0,
      explanation: "Une vraie mesure varie quand les conditions changent. Couvrir le capteur devrait faire chuter la valeur ; si elle reste figée à 1023, ce n’est plus une mesure mais un défaut électrique (court-circuit, mauvais branchement). Le testeur vérifie le montage avant de croire le chiffre.",
      whyOthers: [
        "",
        "Un soleil très fort peut donner une valeur proche de 1023, mais couvrir le capteur avec la main devrait faire chuter la mesure : si rien ne bouge, le capteur ne mesure plus.",
        "Une valeur « parfaite » qui ne bouge jamais est justement suspecte : une vraie mesure réagit aux changements de conditions."
      ],
      exampleGarden: "Amélioration possible du programme : si lumiere reste figée à 0 ou à 1023, afficher « Capteur lumière à vérifier » plutôt que de décider avec une fausse mesure.",
      exampleOther: "Dans un avion, si une sonde de vitesse givre et renvoie une valeur figée, les systèmes la comparent aux autres sondes pour détecter l’incohérence.",
      takeaway: "Douter d’une mesure incohérente avant de la croire : c’est le réflexe d’un bon ingénieur."
    },
    {
      id: "s8q14",
      theme: "Simulation et réalité",
      question: "Le programme fonctionne parfaitement dans le simulateur. Peut-on l’installer directement dans le vrai jardin sans autre vérification ?",
      choices: [
        "Oui : le simulateur reproduit fidèlement chaque détail du jardin, donc la réalité se comportera forcément pareil",
        "Non : la simulation ne reproduit pas tout, il faut aussi tester le montage réel",
        "Oui, à condition de croiser les doigts au moment du branchement"
      ],
      answer: 1,
      explanation: "La simulation est un modèle simplifié : capteurs parfaits, valeurs propres, pas d’usure ni de météo. Elle est idéale pour tester la logique du programme sans risque, mais la mise en service exige aussi des tests sur le montage réel, dans les vraies conditions.",
      whyOthers: [
        "La simulation est un modèle simplifié de la réalité : elle ignore la boue, la corrosion, les faux contacts, la pluie… Le réel réserve toujours des surprises.",
        "",
        "La chance ne fait pas partie de la boîte à outils de l’ingénieur : ce sont les tests sur le montage réel qui remplacent les doigts croisés."
      ],
      exampleGarden: "Dans le simulateur, le capteur d’humidité est parfait ; au jardin, la boue le recouvre peu à peu et les valeurs dérivent : il faudra le nettoyer et parfois réajuster les seuils.",
      exampleOther: "Les crash-tests virtuels des voitures sont toujours complétés par de vrais crash-tests : la simulation prépare, mais ne remplace pas l’essai réel.",
      takeaway: "La simulation prépare, le test réel confirme : les deux sont nécessaires avant la mise en service."
    },
    {
      id: "s8q15",
      theme: "Cahier des charges",
      question: "À quoi sert le cahier des charges au moment de valider le prototype ?",
      choices: [
        "À décorer le classeur de technologie",
        "À ranger les composants dans la bonne boîte à la fin de la séance",
        "À servir de référence : il décrit ce que le système DOIT faire"
      ],
      answer: 2,
      explanation: "Le cahier des charges liste les fonctions et les contraintes que le système doit respecter. Sans lui, impossible de juger un test : un comportement n’est ni « bon » ni « mauvais » en soi, il est conforme ou non à ce qui a été demandé.",
      whyOthers: [
        "Le cahier des charges est un document de travail, pas une décoration : chaque test du protocole se rapporte à l’une de ses exigences.",
        "Ranger les composants relève de l’organisation de l’atelier ; le cahier des charges, lui, décrit les fonctions et les contraintes du système à réaliser.",
        ""
      ],
      exampleGarden: "Notre cahier des charges disait : arroser quand le sol est sec et la lumière faible, ne jamais pomper à vide, prévenir quand le réservoir est vide. Chaque test vérifie l’une de ces lignes.",
      exampleOther: "Avant de construire un collège, l’architecte reçoit un cahier des charges : nombre de salles, accessibilité, budget. À la fin, on vérifie que le bâtiment y répond point par point.",
      takeaway: "Le cahier des charges est la référence : sans lui, impossible de dire si le prototype est réussi."
    },
    {
      id: "s8q16",
      theme: "Amélioration continue",
      question: "Pendant les tests, un cas échoue : le système arrose alors que le réservoir est vide. Que fait un bon ingénieur ?",
      choices: [
        "Il supprime ce test du protocole pour que tout soit vert",
        "Il cherche la cause (ici, sans doute l’ordre des conditions), corrige le programme, puis REJOUE tous les tests",
        "Il note le problème quelque part et met quand même le système en service"
      ],
      answer: 1,
      explanation: "Un test qui échoue est une information précieuse : il montre où le programme s’écarte du cahier des charges. La démarche est toujours la même : comprendre la cause, corriger, puis rejouer TOUT le protocole, car une correction peut avoir cassé autre chose ailleurs.",
      whyOthers: [
        "Supprimer un test qui échoue, c’est cacher le problème, pas le résoudre : le système arroserait toujours réservoir vide, mais plus personne ne le verrait avant la panne.",
        "",
        "Mettre en service avec un défaut de sécurité connu, c’est accepter d’abîmer la pompe : un ingénieur corrige d’abord, installe ensuite."
      ],
      exampleGarden: "Cause probable de l’échec : la condition d’arrosage écrite AVANT celle du réservoir. On remet la sécurité en premier, puis on rejoue les tests des trois familles.",
      exampleOther: "Après chaque essai raté d’une fusée, les ingénieurs analysent les données, corrigent la conception, puis relancent un essai : chaque échec fait progresser le projet.",
      takeaway: "Un test qui échoue est une chance : comprendre, corriger, puis tout retester — c’est l’amélioration continue."
    },
    {
      id: "s8q17",
      theme: "Présenter ses résultats",
      question: "Pourquoi la séance se termine-t-elle par une présentation des résultats de tests et des idées d’amélioration ?",
      choices: [
        "Parce qu’un prototype doit convaincre : résultats de tests à l’appui, améliorations proposées",
        "Parce qu’il faut bien occuper les dernières minutes du cours",
        "Parce que le programme s’efface de la mémoire de la carte si les résultats ne sont pas présentés"
      ],
      answer: 0,
      explanation: "Présenter, c’est le dernier maillon de la démarche : on montre les résultats du protocole (preuves de fiabilité), on reconnaît les limites du prototype et on propose des améliorations. C’est exactement ce que fait un bureau d’études devant son client.",
      whyOthers: [
        "",
        "La présentation n’est pas un bouche-trou : dans les bureaux d’études, convaincre le client avec des résultats de tests fait pleinement partie du métier.",
        "Un programme téléversé reste dans la carte, présentation ou pas ; ce qui se construit en présentant, c’est la confiance dans le système."
      ],
      exampleGarden: "Idées d’amélioration présentées par les équipes : capteur de pluie, alerte à distance quand le réservoir se vide, seuils réglables selon les plantes cultivées.",
      exampleOther: "Dans les concours de robotique, chaque équipe présente son robot, ses tests et ses améliorations prévues : convaincre avec des preuves fait partie du métier d’ingénieur.",
      takeaway: "Un prototype validé se présente : résultats de tests à l’appui et améliorations proposées."
    },
    {
      id: "s8q18",
      theme: "Transfert : priorité à la sécurité",
      question: "Un train reçoit en même temps deux informations : « signal rouge devant » et « horaire à respecter, accélérer ». Laquelle son système embarqué traite-t-il en premier, et quel est le lien avec notre programme ?",
      choices: [
        "L’horaire : arriver à l’heure est la mission principale du train, elle passe donc avant les autres informations",
        "Les deux en même temps : un ordinateur peut tout faire à la fois",
        "Le signal rouge : la sécurité est testée en premier, comme niveauEau < SEUIL_RESERVOIR dans notre programme"
      ],
      answer: 2,
      explanation: "Quand deux consignes se contredisent, c’est l’ordre des priorités qui tranche, et la sécurité gagne toujours : le train freine, l’horaire attendra. Notre programme applique la même règle : « réservoir vide » est testé avant « faut-il arroser ? ».",
      whyOthers: [
        "Arriver à l’heure est la mission, mais un signal rouge annonce un danger : la sécurité est toujours prioritaire sur la mission, dans le train comme au jardin.",
        "Même un ordinateur très rapide applique ses règles dans un ordre défini : quand deux consignes se contredisent (freiner ou accélérer), c’est l’ordre des priorités qui décide.",
        ""
      ],
      exampleGarden: "Au jardin, même logique : « réservoir vide » gagne toujours contre « sol sec », car protéger la pompe passe avant arroser tout de suite.",
      exampleOther: "Dans un four à micro-ondes, l’ouverture de la porte coupe immédiatement les ondes, quelle que soit la cuisson en cours : la sécurité de la porte est prioritaire.",
      takeaway: "Partout en ingénierie, la règle de sécurité est testée avant la mission : c’est l’ordre des priorités."
    },
    {
      id: "s8q19",
      theme: "Transfert : protocole de tests",
      question: "Avant CHAQUE vol, les pilotes déroulent une check-list complète, même s’ils ont déjà volé mille fois. Quel est le point commun avec la séance 8 ?",
      choices: [
        "Aucun : un avion n’a pas de capteur d’humidité ni de pompe d’arrosage, il n’y a donc rien de comparable entre les deux situations",
        "C’est un protocole de tests : des vérifications ordonnées, faites AVANT la mise en service",
        "Les pilotes le font uniquement pour passer le temps avant le décollage"
      ],
      answer: 1,
      explanation: "La check-list d’avion et notre protocole de tests reposent sur la même idée : vérifier systématiquement, point par point et dans l’ordre, AVANT d’agir. On ne fait pas confiance à la mémoire ni à l’habitude : on suit la liste, à chaque fois.",
      whyOthers: [
        "Les capteurs diffèrent, mais la démarche est identique : vérifier point par point, dans l’ordre, avant de mettre en service. C’est cela, le vrai point commun.",
        "",
        "La check-list est une procédure de sécurité obligatoire, pas un passe-temps : elle a évité d’innombrables accidents en attrapant les oublis avant le décollage."
      ],
      exampleGarden: "Avant d’installer le système au jardin, on déroule tout le protocole (cas normaux, limites, défaillants) ; et après CHAQUE modification du programme, on le rejoue entièrement.",
      exampleOther: "Au bloc opératoire, l’équipe déroule aussi une check-list avant chaque opération : compter, vérifier, puis agir — jamais l’inverse.",
      takeaway: "Vérifier avant d’agir, à chaque fois : les protocoles de tests protègent des accidents."
    },
    {
      id: "s8q20",
      theme: "La démarche de l’ingénieur",
      question: "Quelle est la démarche complète que vous avez suivie sur les 8 séances, la même que celle des bureaux d’études ?",
      choices: [
        "Besoin → cahier des charges → prototype → protocole de tests → validation → améliorations",
        "Programmer d’abord, réfléchir ensuite, et ne tester le montage que si quelque chose sent le brûlé sur la table de l’atelier",
        "Acheter le matériel le plus cher possible pour éviter d’avoir à tester"
      ],
      answer: 0,
      explanation: "C’est la démarche de projet de l’ingénieur : partir d’un besoin, le traduire en cahier des charges, construire un prototype, le soumettre à un protocole de tests, valider en comparant au cahier des charges, puis améliorer. Elle s’applique à tous les objets techniques, du jardin connecté à l’avion de ligne.",
      whyOthers: [
        "",
        "Programmer sans réfléchir au besoin ni tester, c’est l’inverse de la démarche d’ingénierie : on découvre les problèmes trop tard, quand ils coûtent cher.",
        "Le prix du matériel ne garantit rien : même le meilleur composant doit être testé dans SON système, avec SES seuils et SES cas limites."
      ],
      exampleGarden: "Notre séquence : besoin d’arroser sans gaspiller → cahier des charges → capteurs, pompe et programme → protocole de tests → validation → idées d’amélioration présentées.",
      exampleOther: "Un smartphone suit exactement ce chemin : étude du besoin, cahier des charges, prototypes, des milliers de tests, validation, puis mises à jour pour l’améliorer.",
      takeaway: "Besoin, cahier des charges, prototype, tests, validation, amélioration : vous avez travaillé comme de vrais ingénieurs."
    }
  ]
};
