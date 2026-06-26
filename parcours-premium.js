/* TechnoQuest — moteur commun des huit séances premium notées sur 20. */
"use strict";

(() => {
  const sessions = [
    {
      id:1,title:"Observer les signaux",accent:"#22d3ee",story:"Les plantes se flétrissent. L’équipe doit observer les données du capteur d’humidité et distinguer une grandeur analogique d’un état logique.",
      objective:"Lire et afficher l’humidité du sol, puis expliquer la différence entre une mesure analogique et une commande logique.",
      chips:["Signal analogique","Signal logique","A0","D6"],
      tasks:["Observer la valeur d’humidité fournie par A0.","Afficher la mesure dans le programme.","Maintenir la pompe arrêtée avec stop().","Expliquer pourquoi A0 varie alors que D6 possède seulement deux états."],
      algorithm:[["ACQUÉRIR","Lire l’humidité du sol avec le capteur A0.","#60a5fa"],["MÉMORISER","Stocker la valeur dans la variable humidite.","#c084fc"],["COMMUNIQUER","Afficher la mesure obtenue.","#67e8f9"],["SÉCURISER","Maintenir D6 à LOW et la pompe arrêtée.","#fb7185"]],
      code:"# Lire la grandeur analogique du capteur A0\nhumidite = lire_humidite()\n\n# Afficher la valeur mesurée\nafficher(humidite)\n\n# Maintenir la pompe arrêtée\nstop()",
      tests:["La valeur d’humidité est lue.","La mesure est affichée.","La pompe reste explicitement arrêtée."],
      question:"Explique pourquoi l’humidité est une grandeur analogique et pourquoi la commande D6 du relais est une information logique.",
      correction:"L’humidité du sol varie progressivement : le capteur produit une tension analogique, puis l’ADC/CAN de l’Arduino la convertit en valeur numérique. La sortie D6 commande le relais avec deux états logiques : LOW = 0 pour l’arrêt et HIGH = 1 pour la marche."
    },
    {
      id:2,title:"Calibrer un seuil",accent:"#c084fc",story:"Une valeur isolée ne suffit pas. L’équipe réalise plusieurs mesures en sol sec et humide afin de déterminer un seuil pertinent.",
      objective:"Convertir une valeur ADC en tension, analyser plusieurs mesures et justifier un seuil d’humidité.",
      chips:["ADC / CAN","Calibration","Seuil","Tableau de mesures"],
      tasks:["Relever cinq valeurs en sol sec et cinq en sol humide.","Convertir une valeur ADC en tension avec V ≈ valeur ÷ (2ⁿ − 1) × Vref.","Calculer les moyennes des deux séries.","Choisir un seuil situé entre les deux groupes et le justifier."],
      algorithm:[["MESURER","Relever plusieurs valeurs dans chaque état du sol.","#60a5fa"],["CONVERTIR","Retrouver la tension correspondant à chaque valeur ADC.","#c084fc"],["COMPARER","Comparer les moyennes du sol sec et du sol humide.","#facc15"],["DÉCIDER","Choisir un seuil à vérifier par de nouveaux essais.","#fb923c"]],
      code:"# Définir un seuil modifiable\nseuil_humidite = 35\n\n# Lire puis comparer la mesure\nhumidite = lire_humidite()\nif humidite < seuil_humidite:\n    afficher(\"Sol sec\")\nelse:\n    afficher(\"Sol humide\")\nstop()",
      tests:["Les deux séries de mesures sont complètes.","Le calcul de tension est correctement appliqué.","Le seuil choisi est situé entre les groupes sec et humide."],
      question:"Comment as-tu choisi le seuil à partir des mesures et de la conversion ADC ? Cite tes valeurs et justifie ta décision.",
      correction:"Pour une résolution de n bits, la valeur maximale est 2ⁿ − 1. En 10 bits avec Vref = 5 V, 600 correspond à 600 ÷ 1023 × 5 ≈ 2,93 V. Le seuil brut doit se situer entre les mesures sèches et humides, puis être vérifié expérimentalement."
    },
    {
      id:3,title:"Analyser les chaînes",accent:"#facc15",story:"Le capteur fonctionne. Il faut comprendre comment l’information circule et comment l’énergie atteint la pompe à travers le relais.",
      objective:"Identifier les chaînes d’information et d’énergie, puis commander la pompe si le sol est sec.",
      chips:["Chaîne d’information","Chaîne d’énergie","Relais","Pompe"],
      tasks:["Associer acquérir, traiter et communiquer aux bons constituants.","Associer alimenter, distribuer, convertir, transmettre et agir.","Distinguer les blocs fonctionnels des fils de liaison.","Commander la pompe pendant trois secondes si le sol est sec."],
      algorithm:[["ACQUÉRIR","Le capteur mesure l’humidité.","#60a5fa"],["TRAITER","L’Arduino compare la mesure au seuil.","#facc15"],["DISTRIBUER","Le relais autorise ou coupe l’énergie de la pompe.","#fb923c"],["CONVERTIR / AGIR","La pompe transforme l’énergie électrique en circulation d’eau.","#4ade80"]],
      code:"seuil_humidite = 35\nhumidite = lire_humidite()\n\n# Traiter la donnée et commander la sortie logique\nif humidite < seuil_humidite:\n    arroser(3)\nelse:\n    stop()",
      tests:["La chaîne d’information est correctement identifiée.","La chaîne d’énergie est correctement identifiée.","Le programme commande trois secondes d’arrosage lorsque le sol est sec."],
      question:"Décris les deux chaînes en citant les constituants réels et explique comment les fils sont représentés dans une chaîne fonctionnelle.",
      correction:"Chaîne d’information : capteur → Arduino → affichage ou alerte. Chaîne d’énergie : alimentation séparée → relais → pompe → tuyau → sol. Les fils existent physiquement, mais ils sont généralement représentés par des liaisons ou des flèches dans une chaîne fonctionnelle simplifiée."
    },
    {
      id:4,title:"Protéger la pompe",accent:"#fb7185",story:"La pompe ne doit jamais fonctionner à vide. Un second capteur surveille le réservoir et une alerte prévient l’utilisateur.",
      objective:"Autoriser l’arrosage uniquement si le sol est sec ET si le niveau du réservoir est suffisant.",
      chips:["Sécurité","A2","Opérateur AND","Alerte"],
      tasks:["Lire l’humidité et le niveau du réservoir.","Donner la priorité à la protection contre la marche à vide.","Relier les deux conditions avec and.","Déclencher une alerte si le réservoir est trop bas."],
      algorithm:[["ACQUÉRIR","Lire l’humidité A0 et le niveau A2.","#60a5fa"],["SÉCURISER","Vérifier d’abord que le réservoir contient assez d’eau.","#fb7185"],["COMPARER","Tester sol sec ET niveau suffisant.","#facc15"],["AGIR / ALERTER","Arroser ou arrêter et avertir l’utilisateur.","#4ade80"]],
      code:"seuil_humidite = 35\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(3)\nelse:\n    stop()\n\nif reservoir < seuil_reservoir:\n    alerter(\"Réservoir vide\")",
      tests:["Réservoir plein : l’arrosage est autorisé si le sol est sec.","Réservoir vide : la pompe reste arrêtée.","Une alerte apparaît lorsque le niveau est insuffisant."],
      question:"Quel risque technique est évité ? Explique pourquoi l’opérateur logique and est indispensable.",
      correction:"L’opérateur and impose que le sol soit sec ET que le niveau d’eau soit suffisant. Si l’une des deux conditions est fausse, la pompe reste arrêtée. Cette sécurité évite la marche à vide et l’échauffement de la pompe."
    },
    {
      id:5,title:"Économiser l’eau",accent:"#4ade80",story:"Un seuil unique peut provoquer des démarrages répétés. L’équipe cherche à réduire la consommation d’eau et l’usure de la pompe.",
      objective:"Employer deux seuils, limiter la durée d’arrosage et interpréter les résultats des essais.",
      chips:["Hystérésis","Économie d’eau","Durée limitée","Essais"],
      tasks:["Définir un seuil de démarrage et un seuil d’arrêt.","Limiter chaque arrosage à deux ou trois secondes.","Observer les oscillations autour d’un seuil unique.","Expliquer comment l’hystérésis réduit les commutations."],
      algorithm:[["PARAMÉTRER","Définir un seuil bas et un seuil haut.","#c084fc"],["MESURER","Lire l’humidité et le niveau du réservoir.","#60a5fa"],["DÉCIDER","Utiliser l’hystérésis pour éviter les redémarrages répétés.","#fb923c"],["ÉCONOMISER","Limiter la durée et le nombre d’arrosages.","#4ade80"]],
      code:"seuil_humidite = 30\nseuil_arret = 42\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(2)\nelif humidite > seuil_arret:\n    stop()\nelse:\n    stop()",
      tests:["Le seuil de démarrage est inférieur au seuil d’arrêt.","La durée d’arrosage ne dépasse pas trois secondes.","Le réservoir reste pris en compte."],
      question:"Explique l’hystérésis et montre comment elle réduit les démarrages, la consommation d’eau et l’usure.",
      correction:"L’hystérésis utilise deux seuils différents : le système démarre sous le seuil bas et ne considère le sol suffisamment humide qu’au-dessus du seuil haut. L’écart entre les deux évite les changements rapides d’état autour d’une seule valeur."
    },
    {
      id:6,title:"Décider avec trois données",accent:"#60a5fa",story:"Le jardin reçoit parfois un fort ensoleillement. L’équipe ajoute la luminosité comme troisième information de décision.",
      objective:"Construire une décision multicritère avec humidité, niveau du réservoir et luminosité.",
      chips:["A0","A1","A2","Décision multicritère"],
      tasks:["Lire les trois capteurs.","Définir trois seuils modifiables.","Relier les critères avec des opérateurs logiques.","Justifier l’intérêt et les limites de la luminosité."],
      algorithm:[["ACQUÉRIR","Lire humidité, luminosité et niveau.","#60a5fa"],["COMPARER","Comparer chaque mesure à son seuil.","#facc15"],["DÉCIDER","Autoriser l’arrosage seulement si les critères retenus sont satisfaits.","#fb923c"],["AGIR","Arroser brièvement ou rester arrêté.","#4ade80"]],
      code:"seuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir and lumiere < seuil_lumiere:\n    arroser(2)\nelse:\n    stop()",
      tests:["Les trois grandeurs sont lues.","Les trois seuils sont modifiables.","La décision tient compte des trois comparaisons."],
      question:"Pourquoi la luminosité peut-elle être utile sans mesurer directement le besoin en eau ? Donne aussi une limite.",
      correction:"La luminosité peut éviter un arrosage en plein soleil lorsque l’évaporation est forte. Cependant, elle ne mesure pas directement l’humidité du sol : elle ne doit donc pas remplacer le capteur d’humidité, mais seulement compléter la décision."
    },
    {
      id:7,title:"Améliorer la durabilité",accent:"#34d399",story:"Le capteur d’humidité peut se corroder ou dériver. L’équipe doit comparer plusieurs solutions et rendre le système plus maintenable.",
      objective:"Recalibrer un nouveau capteur et justifier un choix durable, réparable et maintenable.",
      chips:["Durabilité","Maintenance","Capteur capacitif","Réparabilité"],
      tasks:["Comparer un capteur résistif et un capteur capacitif.","Recalibrer les valeurs sèches et humides.","Conserver les sécurités du système.","Justifier le choix avec des critères de durabilité et de coût."],
      algorithm:[["DIAGNOSTIQUER","Identifier la dérive ou la corrosion du capteur.","#fb7185"],["REMPLACER","Installer un capteur plus durable si nécessaire.","#34d399"],["CALIBRER","Relever les nouvelles valeurs de référence.","#c084fc"],["VALIDER","Vérifier que les sécurités et les décisions restent correctes.","#4ade80"]],
      code:"seuil_humidite = 38\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(2)\nelse:\n    stop()",
      tests:["Le nouveau capteur est recalibré.","La sécurité du réservoir est conservée.","Le choix technique est justifié par au moins trois critères."],
      question:"Compare les capteurs résistif et capacitif, puis justifie celui que tu retiens pour un jardin durable.",
      correction:"Le capteur résistif est peu coûteux mais ses électrodes se corrodent plus facilement. Le capteur capacitif est généralement plus durable et stable, mais il coûte davantage et doit lui aussi être calibré. Le choix dépend du coût, de la durée de vie, de la maintenance et de la réparabilité."
    },
    {
      id:8,title:"Défi ingénieur",accent:"#fb923c",story:"L’équipe doit maintenant réunir toutes les fonctions dans un prototype final, le tester et défendre ses choix.",
      objective:"Produire le programme final, un protocole de tests complet et une justification technique argumentée.",
      chips:["Synthèse","Prototype final","Protocole de tests","Validation"],
      tasks:["Programmer la sécurité prioritaire et les trois capteurs.","Prévoir arrêt, alerte et arrosage court.","Tester les situations normales, limites et défaillantes.","Présenter les résultats, les limites et une amélioration."],
      algorithm:[["ACQUÉRIR","Lire toutes les mesures utiles.","#60a5fa"],["SÉCURISER","Traiter d’abord le réservoir vide et les valeurs incohérentes.","#fb7185"],["DÉCIDER","Appliquer les seuils et la logique multicritère.","#fb923c"],["AGIR / COMMUNIQUER","Arroser, arrêter, alerter et afficher les résultats.","#4ade80"]],
      code:"seuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\n\nif reservoir < seuil_reservoir:\n    stop()\n    alerter(\"Réservoir vide\")\nelif humidite < seuil_humidite and lumiere < seuil_lumiere:\n    arroser(2)\nelse:\n    stop()\n\nafficher(humidite, reservoir, lumiere)",
      tests:["Réservoir vide : arrêt et alerte.","Sol sec, eau disponible et lumière acceptable : arrosage court.","Sol humide ou forte lumière : pompe arrêtée.","Une valeur incohérente est signalée dans le protocole."],
      question:"Présente ton prototype final, le protocole de tests, les résultats obtenus, une limite de la simulation et l’amélioration prioritaire.",
      correction:"La sécurité du réservoir doit être testée avant toute commande d’arrosage. Le programme lit les trois capteurs, applique des seuils justifiés, limite la durée de fonctionnement et conserve un arrêt explicite. Le protocole doit inclure les cas normaux, les cas limites et au moins une défaillance."
    }
  ];

  const storageKey = "technoquest-premium-v1";
  const body = document.body;
  const sessionId = Number(body.dataset.session || new URLSearchParams(location.search).get("session") || 1);
  const session = sessions.find(item => item.id === sessionId) || sessions[0];

  function loadState(){
    try{return JSON.parse(localStorage.getItem(storageKey)||"{}");}catch(error){return {}}
  }
  function saveState(data){localStorage.setItem(storageKey,JSON.stringify(data))}
  const state = loadState();
  state.profile = state.profile || {name:"",classe:"",team:""};
  state.sessions = state.sessions || {};
  state.sessions[session.id] = state.sessions[session.id] || {code:session.code,answer:"",tests:[],scores:[0,0,0,0,0],correction:false};
  const current = state.sessions[session.id];

  const colors = ["#22d3ee","#c084fc","#facc15","#fb7185","#4ade80","#60a5fa","#34d399","#fb923c"];

  function svgTwin(){
    const focus = session.id;
    const sensorGlow = [1,2,4,6,7,8].includes(focus);
    const relayGlow = [3,4,5,8].includes(focus);
    const waterVisible = [3,4,5,6,8].includes(focus);
    return `<svg viewBox="0 0 900 510" role="img" aria-label="Jumeau numérique premium de la séance ${session.id}">
      <defs>
        <linearGradient id="board" x2="0" y2="1"><stop stop-color="#22c4ae"/><stop offset="1" stop-color="#0f5f55"/></linearGradient>
        <linearGradient id="tank" x2="0" y2="1"><stop stop-color="#b8efff"/><stop offset="1" stop-color="#248fc7"/></linearGradient>
        <linearGradient id="metal"><stop stop-color="#e4edf0"/><stop offset="1" stop-color="#5b6c74"/></linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".35"/></filter>
        <filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="900" height="510" fill="transparent"/>
      <circle cx="815" cy="70" r="38" fill="#ffd166" filter="url(#glow)"/>
      <path d="M120 394 C120 330 137 266 165 210" stroke="#226c3a" stroke-width="13" fill="none" stroke-linecap="round"/>
      <ellipse cx="126" cy="283" rx="48" ry="21" fill="#55a86b" transform="rotate(-28 126 283)"/>
      <ellipse cx="183" cy="300" rx="43" ry="18" fill="#3e9559" transform="rotate(25 183 300)"/>
      <g fill="#df4a70" stroke="#922440" stroke-width="3"><circle cx="168" cy="196" r="25"/><circle cx="148" cy="213" r="19"/><circle cx="190" cy="214" r="19"/><circle cx="168" cy="221" r="20"/></g><circle cx="168" cy="209" r="8" fill="#ffd166"/>
      <ellipse cx="160" cy="410" rx="105" ry="25" fill="#4e2e1e"/><ellipse class="twin-water" cx="160" cy="410" rx="95" ry="18" fill="#38bdf8" opacity=".35"/>

      <g class="highlight" style="color:#60a5fa" filter="url(#shadow)"><rect x="55" y="316" width="42" height="50" rx="8" fill="#607984" stroke="#f3fbff" stroke-width="3"/><rect x="62" y="363" width="8" height="55" rx="4" fill="#d6e2e5"/><rect x="81" y="363" width="8" height="55" rx="4" fill="#d6e2e5"/><text x="35" y="455" fill="#fff" font-size="13" font-weight="800">Humidité A0</text>${sensorGlow?'<circle cx="76" cy="340" r="38" fill="none" stroke="#60a5fa" stroke-width="3" opacity=".75"/>':''}</g>
      <g class="highlight" style="color:#facc15"><circle cx="265" cy="132" r="24" fill="#fde047" stroke="#a66f05" stroke-width="3"/><text x="265" y="137" text-anchor="middle" fill="#6b4300" font-size="11" font-weight="900">LDR</text><text x="226" y="176" fill="#fff" font-size="13" font-weight="800">Lumière A1</text></g>

      <g filter="url(#shadow)"><rect x="342" y="160" width="190" height="210" rx="24" fill="url(#board)" stroke="#bbfff2" stroke-width="3"/><rect x="370" y="189" width="58" height="38" rx="6" fill="#e1eaed"/><rect x="420" y="242" width="66" height="55" rx="7" fill="#17252b"/><text x="437" y="330" text-anchor="middle" fill="#fff" font-size="20" font-weight="900">ARDUINO</text><text x="437" y="351" text-anchor="middle" fill="#d7fff7" font-size="13">UNO R3 / UNO R4 Minima</text></g>
      <g font-size="13" font-weight="900" text-anchor="middle"><rect x="313" y="196" width="42" height="28" rx="8" fill="#60a5fa"/><text x="334" y="215" fill="#06111d">A0</text><rect x="313" y="242" width="42" height="28" rx="8" fill="#facc15"/><text x="334" y="261" fill="#4d3600">A1</text><rect x="519" y="196" width="42" height="28" rx="8" fill="#c084fc"/><text x="540" y="215" fill="#fff">A2</text><rect x="519" y="287" width="42" height="28" rx="8" fill="#fb923c"/><text x="540" y="306" fill="#4d1a00">D6</text></g>

      <g filter="url(#shadow)"><rect x="660" y="125" width="135" height="225" rx="22" fill="#dff7ff22" stroke="#dff8ff" stroke-width="4"/><rect x="670" y="212" width="115" height="128" rx="10" fill="url(#tank)"/><rect x="720" y="155" width="10" height="170" rx="5" fill="#e5eef1"/><rect x="702" y="205" width="46" height="20" rx="10" fill="#ffd166" stroke="#8d650d" stroke-width="2"/><text x="727" y="105" text-anchor="middle" fill="#fff" font-size="17" font-weight="900">Réservoir</text><text x="686" y="374" fill="#fff" font-size="13" font-weight="800">Niveau A2</text></g>

      <g filter="url(#shadow)" class="highlight" style="color:#fb923c"><rect x="575" y="278" width="70" height="55" rx="12" fill="#fb923c" stroke="#ffddb8" stroke-width="3"/><text x="610" y="301" text-anchor="middle" fill="#5e2400" font-size="14" font-weight="900">RELAIS</text><text x="610" y="320" text-anchor="middle" fill="#5e2400" font-size="11">D6</text>${relayGlow?'<circle cx="632" cy="290" r="11" fill="#4ade80" filter="url(#glow)"/>':''}</g>
      <g filter="url(#shadow)"><rect x="690" y="390" width="150" height="72" rx="26" fill="url(#metal)" stroke="#e5eef1" stroke-width="3"/><circle cx="727" cy="426" r="25" fill="#475862" stroke="#dce7ea" stroke-width="3"/><g class="twin-rotor"><path d="M727 407V445M708 426H746" stroke="#fff" stroke-width="6"/><circle cx="727" cy="426" r="6" fill="#fff"/></g><text x="786" y="421" fill="#fff" font-size="15" font-weight="900">POMPE</text><text x="786" y="440" fill="#dbe8ec" font-size="11">Actionneur</text></g>
      <rect x="535" y="392" width="125" height="58" rx="13" fill="#151f27" stroke="#788991" stroke-width="2"/><text x="597" y="414" text-anchor="middle" fill="#ffe4c4" font-size="11" font-weight="800">ALIMENTATION</text><text x="597" y="431" text-anchor="middle" fill="#ffe4c4" font-size="11">séparée TBT</text>

      <path class="twin-signal" d="M97 340H280V210H313" fill="none" stroke="#60a5fa" stroke-width="5"/>
      <path class="twin-signal" d="M289 132H300V256H313" fill="none" stroke="#facc15" stroke-width="5"/>
      <path class="twin-signal" d="M702 215H585V210H561" fill="none" stroke="#c084fc" stroke-width="5"/>
      <path class="twin-signal" d="M561 301H575" fill="none" stroke="#fb923c" stroke-width="5"/>
      <path d="M660 420H690M645 305V392H660" fill="none" stroke="#fb7185" stroke-width="4"/>
      <path d="M785 328V426H840M690 426H660" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round"/>
      <path class="twin-water" d="M785 328V426H840M690 426H660M690 426H650V470H180V420" fill="none" stroke="#67e8f9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" ${waterVisible?'opacity="1"':'opacity="0"'}/>
      <text x="650" y="484" fill="#e5f9ff" font-size="13" font-weight="900">Réservoir → pompe → plante</text>
      <rect x="305" y="390" width="230" height="62" rx="16" fill="#07131fee" stroke="${session.accent}" stroke-width="2"/><text x="420" y="415" text-anchor="middle" fill="#fff" font-size="14" font-weight="900">Séance ${session.id}</text><text x="420" y="437" text-anchor="middle" fill="#dbe9ef" font-size="12">${session.title}</text>
    </svg>`;
  }

  function escapeHtml(value){return String(value).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
  function highlightFragment(fragment){
    let out="",last=0,match;
    const token=/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b(?:if|elif|else|and|or|not|True|False)\b|\b(?:lire_humidite|lire_reservoir|lire_lumiere)\b|\b(?:arroser)\b|\b(?:stop|alerter)\b|\b(?:afficher)\b|==|!=|<=|>=|<|>|=|\+|-|\*|\/)/g;
    while((match=token.exec(fragment))){
      out+=escapeHtml(fragment.slice(last,match.index));const v=match[0];let cls="py-operator";
      if(/^["']/.test(v))cls="py-string";else if(/^\d/.test(v))cls="py-number";else if(/^(if|elif|else)$/.test(v))cls="py-decision";else if(/^(and|or|not|True|False)$/.test(v))cls="py-keyword";else if(/^lire_/.test(v))cls="py-reader";else if(v==="arroser")cls="py-action";else if(/^(stop|alerter)$/.test(v))cls="py-safety";else if(v==="afficher")cls="py-output";
      out+=`<span class="${cls}">${escapeHtml(v)}</span>`;last=match.index+v.length;
    }
    return out+escapeHtml(fragment.slice(last));
  }
  function highlightLine(line){
    let quote=null,escaped=false,comment=-1;
    for(let i=0;i<line.length;i++){const c=line[i];if(escaped){escaped=false;continue}if(c==="\\"){escaped=true;continue}if(quote){if(c===quote)quote=null}else if(c==='"'||c==="'")quote=c;else if(c==="#"){comment=i;break}}
    const a=comment>=0?line.slice(0,comment):line,b=comment>=0?line.slice(comment):"";
    return highlightFragment(a)+(b?`<span class="py-comment">${escapeHtml(b)}</span>`:"");
  }

  function pageTemplate(){
    const prev = session.id>1?`seance-${session.id-1}.html`:"parcours.html";
    const next = session.id<8?`seance-${session.id+1}.html`:"parcours.html";
    return `<div class="session-shell" style="--session-accent:${session.accent}">
      <header class="session-topbar"><a class="brand" href="parcours.html">TECHNOQUEST · JARDIN CONNECTÉ</a><nav class="session-nav"><a href="${prev}">← Précédente</a><a href="parcours.html">8 séances</a><a href="${next}">Suivante →</a><button id="printSession" type="button">Imprimer</button></nav></header>
      <section class="session-hero"><div><p class="eyebrow">Séance ${session.id} sur 8 · Évaluation autonome</p><h1>${session.title}</h1><p>${session.story}</p><p><strong>Objectif :</strong> ${session.objective}</p><div>${session.chips.map(c=>`<span class="chip">${c}</span>`).join(" ")}</div></div><div class="score-badge"><div><strong id="heroScore">0</strong><span>/ 20</span></div></div></section>
      <section class="session-grid">
        <div>
          <article class="card"><div class="card-head"><div><h2>Jumeau numérique premium</h2><p>Le visuel met en évidence les éléments utiles à cette séance.</p></div><span class="chip">Chargement ciblé</span></div><div class="card-body"><div id="twinStage" class="twin-stage">${svgTwin()}</div><div class="twin-legend"><article><strong>Chaîne d’information</strong>Capteurs → entrées A0/A1/A2 → Arduino → décision → D6.</article><article><strong>Chaîne d’énergie</strong>Alimentation séparée → relais → pompe → tuyaux → sol.</article></div><div class="demo-controls"><button id="runDemo" class="btn primary" type="button">▶ Lancer la démonstration</button><button id="stopDemo" class="btn" type="button">■ Arrêter</button></div><p id="demoStatus" class="demo-status">Prêt. La pompe reste arrêtée tant que la démonstration n’est pas lancée.</p></div></article>
          <article class="card" style="margin-top:1rem"><div class="card-head"><h2>Algorithme textuel coloré</h2><span class="chip">Chronologie</span></div><div class="card-body"><div class="algorithm">${session.algorithm.map((s,i)=>`${i?'<div class="algo-arrow">↓</div>':''}<div class="algo-step" style="--step:${s[2]}"><strong>${s[0]}</strong><span>${s[1]}</span></div>`).join("")}</div></div></article>
        </div>
        <div>
          <article class="card"><div class="card-head"><div><h2>Défi élève</h2><p>Une seule production principale pour limiter la charge cognitive.</p></div><span class="chip">Noté /20</span></div><div class="card-body"><ul class="task-list">${session.tasks.map(t=>`<li>${t}</li>`).join("")}</ul></div></article>
          <article class="card" style="margin-top:1rem"><div class="card-head"><div><h2>Programme Python pédagogique</h2><p>Écris directement dans l’éditeur coloré.</p></div><span class="chip">Modifiable</span></div><div class="card-body"><div class="editor-wrap"><pre id="codeHighlight" aria-hidden="true"></pre><textarea id="codeEditor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Programme Python de la séance"></textarea></div><div class="demo-controls"><button id="restoreCode" class="btn" type="button">↺ Restaurer le modèle</button><button id="saveSession" class="btn primary" type="button">Enregistrer</button></div></div></article>
        </div>
      </section>
      <section class="session-grid" style="margin-top:1rem">
        <article class="card"><div class="card-head"><h2>Protocole de tests</h2><span class="chip">Validation</span></div><div class="card-body"><div id="testGrid" class="test-grid">${session.tests.map((t,i)=>`<label><input type="checkbox" data-test="${i}"> <span>${t}</span></label>`).join("")}</div><h3>Réponse argumentée</h3><p>${session.question}</p><textarea id="answer" class="response-area" placeholder="Rédige une réponse précise en utilisant le vocabulaire technique..."></textarea></div></article>
        <article class="card"><div class="card-head"><h2>Barème de la séance</h2><span class="chip">20 points</span></div><div class="card-body"><div class="rubric-grid">
          ${[["Compréhension et analyse",4],["Programme Python",6],["Simulation et tests",4],["Justification écrite",4],["Autonomie et sécurité",2]].map((r,i)=>`<div class="rubric-item"><label>${r[0]}<br><strong>/ ${r[1]}</strong></label><input type="number" min="0" max="${r[1]}" step="0.5" data-score="${i}" value="0"></div>`).join("")}
          </div><div class="rubric-total"><span>Note de la séance</span><strong id="totalScore">0 / 20</strong></div><div class="demo-controls"><button id="showCorrection" class="btn warning" type="button">📘 Correction complète</button><button id="resetSession" class="btn danger" type="button">Réinitialiser la séance</button></div><section id="correctionPanel" class="correction"><h3>Correction exhaustive</h3><p>${session.correction}</p><p><strong>Programme de référence :</strong></p><pre>${escapeHtml(session.code)}</pre><p class="zero-note">Correction consultée : cette séance devient formative et rapporte 0 point.</p></section></div></article>
      </section>
      <nav class="session-footer-nav"><a href="${prev}">← Séance précédente</a><a href="parcours.html">Retour aux 8 séances</a><a href="${next}">Séance suivante →</a></nav>
    </div>`;
  }

  function hubTemplate(){
    const done = sessions.map(s=>state.sessions?.[s.id]?.saved || false);
    return `<main class="hub"><section class="hub-hero"><p class="eyebrow">TechnoQuest · Cycle 4</p><h1>Jardin connecté — 8 séances ultra premium</h1><p>Chaque mission constitue une séance autonome notée sur 20. Les pages ne chargent que les ressources nécessaires : le rendu reste spectaculaire, mais la navigation et le travail de l’élève restent simples.</p><p><a class="btn" href="index.html">Retour à la présentation générale</a></p></section><section class="hub-progress"><strong>Progression enregistrée sur cet appareil</strong><div class="hub-progress-grid">${sessions.map((s,i)=>`<span class="${done[i]?'done':''}">S${s.id}${done[i]?' ✓':''}</span>`).join("")}</div></section><section class="hub-grid">${sessions.map((s,i)=>`<a class="hub-card" href="seance-${s.id}.html" style="--accent:${colors[i]}"><span class="hub-number">${s.id}</span><h2>${s.title}</h2><p>${s.objective}</p><footer><span>Séance notée</span><strong>/20 →</strong></footer></a>`).join("")}</section></main>`;
  }

  if(body.dataset.hub==="true"){
    body.innerHTML = hubTemplate();
    return;
  }

  body.innerHTML = pageTemplate();
  const editor=document.getElementById("codeEditor"),highlight=document.getElementById("codeHighlight"),answer=document.getElementById("answer"),scoreInputs=[...document.querySelectorAll("[data-score]")],tests=[...document.querySelectorAll("[data-test]")];
  editor.value=current.code||session.code;answer.value=current.answer||"";tests.forEach((input,i)=>input.checked=!!current.tests[i]);scoreInputs.forEach((input,i)=>input.value=current.scores[i]||0);

  function renderHighlight(){highlight.innerHTML=editor.value.split("\n").map(highlightLine).join("\n")||'<span class="py-comment"># Commence ton programme ici.</span>'}
  function syncScroll(){highlight.scrollTop=editor.scrollTop;highlight.scrollLeft=editor.scrollLeft}
  function total(){
    if(current.correction)return 0;
    return scoreInputs.reduce((sum,input)=>sum+Math.min(Number(input.max),Math.max(0,Number(input.value)||0)),0);
  }
  function renderScore(){const value=total();document.getElementById("totalScore").textContent=`${value.toFixed(value%1?1:0)} / 20`;document.getElementById("heroScore").textContent=value.toFixed(value%1?1:0)}
  function persist(saved=false){
    current.code=editor.value;current.answer=answer.value;current.tests=tests.map(i=>i.checked);current.scores=scoreInputs.map(i=>Number(i.value)||0);if(saved)current.saved=true;state.sessions[session.id]=current;saveState(state);renderScore();
  }

  editor.addEventListener("input",()=>{renderHighlight();persist(false)});editor.addEventListener("scroll",syncScroll,{passive:true});answer.addEventListener("input",()=>persist(false));tests.forEach(i=>i.addEventListener("change",()=>persist(false)));scoreInputs.forEach(i=>i.addEventListener("input",()=>persist(false)));
  document.getElementById("restoreCode").addEventListener("click",()=>{editor.value=session.code;renderHighlight();syncScroll();persist(false)});
  document.getElementById("saveSession").addEventListener("click",()=>{persist(true);document.getElementById("demoStatus").textContent="Séance enregistrée sur cet appareil."});
  document.getElementById("printSession").addEventListener("click",()=>window.print());

  const stage=document.getElementById("twinStage"),status=document.getElementById("demoStatus");
  document.getElementById("runDemo").addEventListener("click",()=>{stage.classList.add("running");status.textContent=`Démonstration active : ${session.objective}`});
  document.getElementById("stopDemo").addEventListener("click",()=>{stage.classList.remove("running");status.textContent="Démonstration arrêtée. La pompe revient à l’état sûr."});

  document.getElementById("showCorrection").addEventListener("click",()=>{
    if(!current.correction && !window.confirm("Afficher la correction rend cette séance formative : la note devient 0/20. Continuer ?"))return;
    current.correction=true;current.scores=[0,0,0,0,0];scoreInputs.forEach(i=>{i.value=0;i.disabled=true});document.getElementById("correctionPanel").classList.add("open");persist(true);
  });
  if(current.correction){scoreInputs.forEach(i=>{i.value=0;i.disabled=true});document.getElementById("correctionPanel").classList.add("open")}

  document.getElementById("resetSession").addEventListener("click",()=>{
    if(!window.confirm("Réinitialiser toutes les réponses de cette séance ?"))return;
    state.sessions[session.id]={code:session.code,answer:"",tests:[],scores:[0,0,0,0,0],correction:false};saveState(state);location.reload();
  });

  renderHighlight();syncScroll();renderScore();
})();
