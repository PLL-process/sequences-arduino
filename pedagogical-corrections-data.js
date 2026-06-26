/* Ressources de correction formative pour les huit missions. */
"use strict";
window.TECHNOQUEST_CORRECTIONS = {
  instructions: [
    "Complète le programme pour lire l’humidité du sol, afficher la mesure puis maintenir la pompe à l’arrêt. Exécute-le et réussis ensuite le mini-défi sur les signaux.",
    "Complète le tableau ADC, convertis les valeurs numériques en tensions, réalise cinq mesures en sol sec et cinq en sol humide, puis choisis et justifie un seuil situé entre les deux groupes.",
    "Commande la pompe pendant trois secondes lorsque le sol est trop sec, puis associe chaque constituant à sa fonction dans les deux chaînes.",
    "Autorise l’arrosage seulement si le sol est sec et si le réservoir contient assez d’eau. Prévois un arrêt et une alerte de sécurité.",
    "Programme deux seuils d’humidité afin d’éviter les démarrages répétés. Limite l’arrosage et explique l’hystérésis.",
    "Lis les trois mesures, règle les trois seuils et construis une décision multicritère. Justifie l’intérêt et les limites de la luminosité.",
    "Recalibre le programme pour un nouveau capteur, conserve la sécurité du réservoir et compare les capteurs résistif et capacitif.",
    "Conçois le programme final : sécurité prioritaire, trois capteurs, alerte, arrosage court et arrêt explicite. Présente les essais et les limites."
  ],
  explanations: [
    ["lire_humidite() acquiert la mesure du capteur A0.","afficher(humidite) communique la valeur observée.","stop() conserve D6 à LOW : relais et pompe arrêtés."],
    ["L’ADC convertit la tension analogique du capteur en un nombre numérique.","La tension se retrouve avec V ≈ valeur ADC ÷ (2ⁿ − 1) × Vref.","Le seuil doit se situer entre les groupes de mesures sèches et humides, puis être vérifié par de nouveaux essais.","seuil_humidite est la valeur de référence utilisée par la condition if/else."],
    ["La mesure est comparée au seuil dans if/else.","arroser(3) active la pompe trois secondes si le sol est sec.","else puis stop() imposent un état sûr si la condition est fausse."],
    ["Deux mesures sont acquises : humidité et niveau du réservoir.","and impose que les deux conditions soient vraies.","alerter() informe l’utilisateur et stop() protège la pompe contre la marche à vide."],
    ["Le seuil bas déclenche l’arrosage et le seuil haut confirme l’humidification.","L’écart entre les seuils est l’hystérésis.","Elle réduit les commutations, la consommation d’eau et l’usure."],
    ["A0, A1 et A2 fournissent humidité, luminosité et niveau.","Deux opérateurs and relient les trois comparaisons.","La luminosité devient un critère choisi par le programme ; elle ne commande pas directement la pompe."],
    ["Un nouveau capteur doit être recalibré.","La lecture du réservoir et l’arrêt de sécurité sont conservés.","Le capteur peut être remplacé sans modifier toute la chaîne de commande."],
    ["Le réservoir est testé avant l’arrosage pour donner la priorité à la sécurité.","Si le niveau est faible : stop() et alerter().", "Sinon, les autres seuils sont testés et l’arrosage reste court."]
  ],
  answers: [
    "L’humidité du sol est une grandeur physique qui varie progressivement. Le capteur produit une tension analogique, puis l’ADC de l’Arduino transforme cette tension en un nombre numérique, ensuite calibré en pourcentage. La commande du relais est logique : LOW maintient la pompe arrêtée et HIGH l’active. La mesure peut donc prendre de nombreuses valeurs, tandis que D6 ne prend que les états 0 ou 1.",
    "Le capteur fournit une tension analogique. L’ADC la transforme en un nombre compris entre 0 et 2ⁿ − 1. Pour retrouver la tension, on utilise V ≈ valeur ADC ÷ (2ⁿ − 1) × Vref. Par exemple, 600 sur 1023 avec Vref = 5 V donne environ 2,93 V. Pour calibrer le seuil, on réalise plusieurs mesures en sol sec et humide, on calcule les moyennes et on choisit une valeur située entre les deux groupes. Ce choix doit ensuite être vérifié sur de nouveaux essais, car le sens de variation et les valeurs dépendent du capteur et du sol.",
    "Chaîne d’information : le capteur acquiert, l’Arduino traite et l’écran ou l’alerte communique. Chaîne d’énergie : l’alimentation alimente, le relais distribue, la pompe convertit l’énergie électrique en énergie hydraulique, le tuyau transmet l’eau et l’arrosage agit sur le sol. Le relais sépare la commande logique du circuit de puissance de la pompe.",
    "La sécurité évite la marche à vide, qui peut échauffer et endommager la pompe. L’opérateur and est indispensable : le sol doit être trop sec ET le niveau du réservoir doit être suffisant. Si l’une des conditions est fausse, stop() maintient la pompe à l’arrêt et une alerte peut demander le remplissage du réservoir.",
    "L’hystérésis utilise deux seuils : par exemple démarrage sous 30 % et confirmation d’arrêt au-dessus de 42 %. Entre les deux, le système évite de changer continuellement d’état. Cela diminue les démarrages du relais et de la pompe, limite leur usure et réduit la consommation d’eau et d’énergie.",
    "La luminosité peut éviter un arrosage en plein soleil, lorsque l’évaporation est forte. Sa limite est qu’elle ne mesure pas directement le besoin en eau : un sol peut rester sec malgré une forte lumière. Un essai pertinent compare sol sec ou humide sous lumière faible ou forte. Le seuil de luminosité est donc un choix d’usage, pas une règle universelle.",
    "Le capteur résistif mesure la conductivité entre deux électrodes. Il est peu coûteux, mais se corrode plus facilement et ses mesures peuvent dériver. Le capteur capacitif est généralement plus durable et demande moins de maintenance, mais il coûte davantage et doit aussi être calibré. Le choix final dépend de la durabilité, de la stabilité, du coût et de la réparabilité attendus.",
    "Le cahier des charges impose un arrosage automatique, économe, sûr, en très basse tension et réparable. Les essais doivent couvrir sol sec, sol humide, réservoir vide, forte lumière, valeur proche du seuil et capteur défaillant. Une limite est que la simulation ne reproduit pas parfaitement le capteur réel ni la diffusion lente de l’eau. L’amélioration prioritaire est une calibration réelle accompagnée d’un diagnostic des pannes."
  ]
};
