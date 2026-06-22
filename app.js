/* Active un mode strict pour signaler davantage d’erreurs de programmation. */
"use strict";

/* Regroupe les intitulés de compétences utilisés dans les missions. */
const SKILLS={
  systeme:"Décrire l’organisation interne d’un système et ses échanges",
  programme:"Comprendre, compléter, tester et modifier un programme",
  validation:"Valider une solution par simulation et protocole de tests",
  durable:"Justifier des choix liés à la sécurité et au développement durable",
  donnees:"Collecter, représenter et analyser des données",
  crcn:"CRCN – Création de contenus : programmer"
};

/* Crée une vérification qui exige la présence de tous les motifs indiqués. */
const exige=(...motifs)=>code=>motifs.every(m=>m.test(code));

/* Décrit les huit missions et leur barème total de vingt points. */
const missions=[
  {
    id:1,title:"Observer les signaux",points:2,
    story:"Les plantes se flétrissent. L’équipe doit observer les données du capteur d’humidité et distinguer une grandeur analogique d’un état logique.",
    objective:"Lire et afficher l’humidité, conserver la pompe arrêtée et réussir le mini-défi sur les signaux.",
    skills:["systeme","donnees","programme","crcn"],analysisMin:0,
    codes:{
      guided:"# Lire la grandeur analogique du capteur A0\nhumidite = lire_humidite()\n\n# Afficher la valeur mesurée\nafficher(humidite)\n\n# Conserver la sortie logique D6 à l’état d’arrêt\nstop()",
      intermediate:"# Compléter les trois instructions\nhumidite = ____________\n____________(humidite)\n____________",
      expert:"# Programmer sans modèle :\n# 1. Lire l’humidité.\n# 2. Afficher la valeur.\n# 3. Maintenir la pompe arrêtée."
    },
    checks:[
      ["Le programme lit la valeur d’humidité.",exige(/lire_humidite\s*\(/i)],
      ["La mesure est affichée.",exige(/afficher\s*\(/i)],
      ["La pompe reste explicitement arrêtée.",exige(/stop\s*\(/i)],
      ["Le mini-défi sur les signaux est réussi.",(_,s)=>s.signals]
    ],
    question:"Explique pourquoi l’humidité est une grandeur analogique et pourquoi la commande du relais est une information logique.",
    hardware:["Monter le Grove Base Shield hors tension.","Relier le capteur d’humidité au port A0.","Téléverser le programme 01_capteur_humidite.ino.","Noter trois valeurs en milieu sec et trois valeurs en milieu humide."],
    hints:["Utilise lire_humidite().","Ajoute afficher(humidite).","Termine par stop(), puis réussis le mini-défi sur les signaux."]
  },
  {
    id:2,title:"Calibrer un seuil",points:2,
    story:"Une valeur isolée ne suffit pas. L’équipe réalise plusieurs mesures puis choisit un seuil séparant un sol sec d’un sol suffisamment humide.",
    objective:"Créer une variable de seuil, classer l’état du sol et justifier la valeur choisie.",
    skills:["donnees","programme","validation","crcn"],analysisMin:40,
    codes:{
      guided:"# Définir un seuil modifiable\nseuil_humidite = 35\n\n# Lire puis comparer la mesure\nhumidite = lire_humidite()\nif humidite < seuil_humidite:\n    afficher(\"Sol sec\")\nelse:\n    afficher(\"Sol humide\")\nstop()",
      intermediate:"seuil_humidite = ___\nhumidite = lire_humidite()\nif humidite ___ seuil_humidite:\n    afficher(\"Sol sec\")\nelse:\n    afficher(\"Sol humide\")\nstop()",
      expert:"# Déclarer seuil_humidite, lire humidite, utiliser if/else pour afficher l’état du sol et maintenir la pompe arrêtée."
    },
    checks:[
      ["Une variable seuil_humidite est déclarée.",exige(/seuil_humidite\s*=\s*\d+/i)],
      ["Une condition compare l’humidité au seuil.",exige(/if\s+humidite\s*<\s*seuil_humidite\s*:/i)],
      ["Les deux états du sol sont traités.",exige(/sol sec/i,/sol humide/i)],
      ["Une trace écrite justifie le seuil.",(_,s)=>s.answer.trim().length>=40]
    ],
    question:"Comment as-tu choisi le seuil à partir de tes mesures ? Cite les valeurs observées et justifie ta décision.",
    hardware:["Réaliser cinq mesures en sol sec.","Réaliser cinq mesures en sol humide.","Comparer les deux séries dans un tableur.","Choisir un seuil situé entre les deux groupes."],
    hints:["Le seuil est une variable numérique.","Compare humidite à seuil_humidite.","Un seuil entre 25 et 45 % constitue un point de départ à vérifier."]
  },
  {
    id:3,title:"Analyser les chaînes",points:3,
    story:"Le capteur fonctionne. Il faut comprendre comment l’information circule et comment l’énergie atteint la pompe à travers le relais.",
    objective:"Commander la pompe si le sol est sec et associer les constituants aux fonctions des deux chaînes.",
    skills:["systeme","programme","validation","crcn"],analysisMin:50,
    codes:{
      guided:"seuil_humidite = 35\nhumidite = lire_humidite()\n\n# Traiter la donnée et commander la sortie logique\nif humidite < seuil_humidite:\n    arroser(3)\nelse:\n    stop()",
      intermediate:"seuil_humidite = ___\nhumidite = lire_humidite()\nif humidite ___ seuil_humidite:\n    arroser(___)\nelse:\n    ____________",
      expert:"# Déclarer le seuil, lire l’humidité, arroser trois secondes si le sol est sec et arrêter la pompe sinon."
    },
    checks:[
      ["Le seuil d’humidité est paramétrable.",exige(/seuil_humidite\s*=\s*\d+/i)],
      ["La décision utilise if / else.",exige(/if\s+humidite\s*<\s*seuil_humidite\s*:/i,/else\s*:/i)],
      ["L’arrosage dure trois secondes.",exige(/arroser\s*\(\s*3\s*\)/i)],
      ["Le mini-défi sur les chaînes est réussi.",(_,s)=>s.chains],
      ["La manipulation réelle et la sécurité sont confirmées.",(_,s)=>materielValide(s)]
    ],
    question:"Décris la chaîne d’information et la chaîne d’énergie du jardin connecté en citant les constituants réels.",
    hardware:["Relier le relais Grove au port D6.","Tester la commande du relais avec une LED.","Utiliser une alimentation séparée pour la pompe.","Téléverser 02_relais.ino puis 03_jardin_automatique.ino."],
    hints:["Place arroser(3) dans le bloc if.","Ajoute else puis stop().","Associe les huit constituants dans l’onglet Analyser."]
  },
  {
    id:4,title:"Protéger la pompe",points:3,
    story:"La pompe ne doit jamais fonctionner à vide. Un second capteur surveille le réservoir et une alerte prévient l’utilisateur.",
    objective:"Arroser seulement si le sol est sec ET si le réservoir contient suffisamment d’eau.",
    skills:["systeme","programme","validation","durable","crcn"],analysisMin:50,
    codes:{
      guided:"seuil_humidite = 35\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(3)\nelse:\n    stop()\n\nif reservoir < seuil_reservoir:\n    alerter(\"Réservoir vide\")",
      intermediate:"seuil_humidite = ___\nseuil_reservoir = ___\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nif humidite < seuil_humidite ___ reservoir >= seuil_reservoir:\n    arroser(3)\nelse:\n    stop()\nif reservoir < seuil_reservoir:\n    ____________(\"Réservoir vide\")",
      expert:"# Déclarer deux seuils, lire les deux capteurs, utiliser and, bloquer la pompe si le niveau est insuffisant et déclencher une alerte."
    },
    checks:[
      ["Les deux seuils sont déclarés.",exige(/seuil_humidite\s*=\s*\d+/i,/seuil_reservoir\s*=\s*\d+/i)],
      ["Les deux capteurs sont lus.",exige(/lire_humidite\s*\(/i,/lire_reservoir\s*\(/i)],
      ["L’opérateur logique ET relie les conditions.",exige(/\band\b/i)],
      ["Une alerte et un arrêt de sécurité sont prévus.",exige(/alerter\s*\(/i,/stop\s*\(/i)],
      ["La manipulation réelle et la sécurité sont confirmées.",(_,s)=>materielValide(s)]
    ],
    question:"Quel risque technique est évité ? Explique pourquoi l’opérateur logique ET est indispensable.",
    hardware:["Brancher le capteur de niveau sur A2.","Mesurer le réservoir vide puis rempli.","Définir un seuil réel.","Vérifier que le relais reste au repos si le niveau est insuffisant."],
    hints:["Lis le réservoir avec lire_reservoir().","Relie les conditions avec and.","Ajoute alerter() lorsque reservoir < seuil_reservoir."]
  },
  {
    id:5,title:"Économiser l’eau",points:3,
    story:"Le premier prototype démarre trop souvent autour d’un seuil unique. L’équipe cherche à réduire la consommation d’eau et l’usure de la pompe.",
    objective:"Employer deux seuils, limiter l’arrosage et interpréter le graphique des essais.",
    skills:["programme","donnees","validation","durable","crcn"],analysisMin:60,
    codes:{
      guided:"seuil_humidite = 30\nseuil_arret = 42\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(2)\nelif humidite > seuil_arret:\n    stop()\nelse:\n    stop()",
      intermediate:"seuil_humidite = ___\nseuil_arret = ___\nseuil_reservoir = ___\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(___)\nelif humidite > seuil_arret:\n    stop()\nelse:\n    stop()",
      expert:"# Programmer une hystérésis avec deux seuils, une durée maximale de trois secondes et la sécurité du réservoir."
    },
    checks:[
      ["Deux seuils d’humidité différents sont déclarés.",c=>{const a=valeur(c,"seuil_humidite"),b=valeur(c,"seuil_arret");return Number.isFinite(a)&&Number.isFinite(b)&&a<b;}],
      ["L’arrosage dure au maximum trois secondes.",c=>{const m=c.match(/arroser\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);return !!m&&Number(m[1])<=3;}],
      ["Le réservoir reste pris en compte.",exige(/lire_reservoir\s*\(/i,/seuil_reservoir/i)],
      ["Une trace explique l’hystérésis et l’économie d’eau.",(_,s)=>s.answer.trim().length>=60],
      ["La manipulation réelle et la sécurité sont confirmées.",(_,s)=>materielValide(s)]
    ],
    question:"Explique l’hystérésis et utilise la courbe pour montrer comment elle limite les démarrages répétés.",
    hardware:["Observer les variations autour d’un seuil unique.","Tester deux seuils différents.","Mesurer le débit de la pompe.","Calculer le volume utilisé pendant dix cycles."],
    hints:["Le seuil de démarrage doit être inférieur au seuil d’arrêt.","La durée doit être inférieure ou égale à trois secondes.","Exemple : démarrage à 30 % et arrêt à 42 %."]
  },
  {
    id:6,title:"Décider avec trois données",points:3,
    story:"Sous un fort soleil, l’évaporation augmente. Le système doit aussi tenir compte de la luminosité et des choix d’usage.",
    objective:"Construire et tester une décision multicritère utilisant humidité, réservoir et luminosité.",
    skills:["programme","donnees","validation","durable","crcn"],analysisMin:60,
    codes:{
      guided:"seuil_humidite = 35\nseuil_reservoir = 20\nseuil_lumiere = 70\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\nif humidite < seuil_humidite and reservoir >= seuil_reservoir and lumiere < seuil_lumiere:\n    arroser(2)\nelse:\n    stop()",
      intermediate:"seuil_humidite = ___\nseuil_reservoir = ___\nseuil_lumiere = ___\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\nif humidite < seuil_humidite ___ reservoir >= seuil_reservoir ___ lumiere < seuil_lumiere:\n    arroser(2)\nelse:\n    stop()",
      expert:"# Lire trois capteurs, déclarer trois seuils et construire une condition contenant deux opérateurs and."
    },
    checks:[
      ["Les trois capteurs sont lus.",exige(/lire_humidite\s*\(/i,/lire_reservoir\s*\(/i,/lire_lumiere\s*\(/i)],
      ["Les trois seuils sont paramétrables.",exige(/seuil_humidite\s*=\s*\d+/i,/seuil_reservoir\s*=\s*\d+/i,/seuil_lumiere\s*=\s*\d+/i)],
      ["La condition contient au moins deux opérateurs ET.",c=>(c.match(/\band\b/gi)||[]).length>=2],
      ["Une limite du critère de luminosité est argumentée.",(_,s)=>s.answer.trim().length>=60],
      ["La manipulation réelle et la sécurité sont confirmées.",(_,s)=>materielValide(s)]
    ],
    question:"L’ajout de la luminosité est-il toujours pertinent ? Donne un avantage, une limite et une situation de test.",
    hardware:["Brancher le capteur de lumière sur A1.","Mesurer sous une lumière faible puis forte.","Choisir un seuil adapté.","Tester plusieurs combinaisons de valeurs."],
    hints:["Lis la lumière avec lire_lumiere().","La condition contient trois comparaisons.","Relie les comparaisons avec deux and."]
  },
  {
    id:7,title:"Améliorer la durabilité",points:2,
    story:"Après plusieurs semaines, un capteur résistif peut se corroder. L’équipe compare une solution capacitive et réfléchit à la réparabilité.",
    objective:"Recalibrer la mesure, conserver les sécurités et justifier le composant le plus durable.",
    skills:["systeme","donnees","validation","durable"],analysisMin:80,
    codes:{
      guided:"seuil_humidite = 38\nseuil_reservoir = 20\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(2)\nelse:\n    stop()",
      intermediate:"seuil_humidite = ___\nseuil_reservoir = ___\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nif humidite < seuil_humidite and reservoir >= seuil_reservoir:\n    arroser(___)\nelse:\n    stop()",
      expert:"# Recalibrer le système pour un nouveau capteur tout en conservant la sécurité du réservoir et un arrosage court."
    },
    checks:[
      ["Le nouveau seuil est déclaré.",exige(/seuil_humidite\s*=\s*\d+/i)],
      ["Les deux capteurs et la sécurité sont conservés.",exige(/lire_humidite\s*\(/i,/lire_reservoir\s*\(/i,/\band\b/i,/stop\s*\(/i)],
      ["La comparaison résistif/capacitif est argumentée.",(_,s)=>s.answer.trim().length>=80],
      ["La manipulation réelle et la sécurité sont confirmées.",(_,s)=>materielValide(s)]
    ],
    question:"Compare les capteurs résistif et capacitif selon leur durabilité, stabilité, coût, maintenance et usage.",
    hardware:["Observer les deux technologies de capteurs.","Effectuer une nouvelle calibration.","Comparer dix mesures successives.","Justifier le composant retenu."],
    hints:["Un nouveau capteur exige une nouvelle calibration.","Conserve la sécurité du réservoir.","Appuie ton choix sur plusieurs critères, pas seulement le prix."]
  },
  {
    id:8,title:"Défi ingénieur",points:2,
    story:"Le prototype doit satisfaire le cahier des charges, réussir plusieurs situations d’essai et être présenté à un jury.",
    objective:"Produire une solution complète, sûre, économe, testée et argumentée.",
    skills:["systeme","programme","validation","durable","donnees","crcn"],analysisMin:100,
    codes:{
      guided:"seuil_humidite = 32\nseuil_reservoir = 20\nseuil_lumiere = 70\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\nif reservoir < seuil_reservoir:\n    stop()\n    alerter(\"Remplir le réservoir\")\nelif humidite < seuil_humidite and lumiere < seuil_lumiere:\n    arroser(2)\nelse:\n    stop()",
      intermediate:"seuil_humidite = ___\nseuil_reservoir = ___\nseuil_lumiere = ___\nhumidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\nif reservoir < seuil_reservoir:\n    stop()\n    ____________(\"Remplir le réservoir\")\nelif humidite < seuil_humidite and lumiere < seuil_lumiere:\n    arroser(___)\nelse:\n    stop()",
      expert:"# Concevoir le programme final : trois capteurs, priorité à la sécurité, alerte, arrosage court et arrêt explicite."
    },
    checks:[
      ["Les trois capteurs et les trois seuils sont présents.",exige(/lire_humidite\s*\(/i,/lire_reservoir\s*\(/i,/lire_lumiere\s*\(/i,/seuil_humidite/i,/seuil_reservoir/i,/seuil_lumiere/i)],
      ["La sécurité du réservoir est traitée avant l’arrosage.",c=>c.search(/reservoir\s*<\s*seuil_reservoir/i)>=0&&c.search(/reservoir\s*<\s*seuil_reservoir/i)<c.search(/arroser\s*\(/i)],
      ["Le programme contient alerte, arrosage court et arrêt.",exige(/alerter\s*\(/i,/arroser\s*\(\s*[123](?:\.\d+)?\s*\)/i,/stop\s*\(/i)],
      ["La synthèse présente essais, limite et amélioration.",(_,s)=>s.answer.trim().length>=100],
      ["La manipulation réelle et la sécurité sont confirmées.",(_,s)=>materielValide(s)]
    ],
    question:"Présente le cahier des charges, les essais réalisés, les résultats, une limite et l’amélioration prioritaire.",
    hardware:["Assembler le prototype complet dans un bac de rétention.","Faire vérifier le câblage avant alimentation.","Réaliser six situations d’essai.","Présenter le prototype et les résultats au jury."],
    hints:["Lis les trois capteurs.","Traite le réservoir vide avant l’arrosage.","Ajoute alerte, arrosage court, arrêt explicite et une synthèse argumentée."]
  }
];

/* Définit les clés de stockage local. */
const STORAGE="technoquest-jardin-v2";
const OLD_STORAGE="technoquest-jardin-v1";

/* Crée l’état initial d’une mission. */
const nouvelleMission=m=>({code:m.codes.guided,done:false,hardware:false,answer:"",tries:0,signals:false,chains:false,safety:{}});

/* Crée l’état initial complet de l’application. */
const etatInitial=()=>({profile:{name:"",classe:"",team:"",mode:"guided",teacher:false},thresholds:{humidity:35,reservoir:20,light:70},missions:missions.map(nouvelleMission),history:[]});

/* Charge et normalise une progression enregistrée. */
function charger(){
  let data=null;
  try{data=JSON.parse(localStorage.getItem(STORAGE)||"null");}catch(error){data=null;}
  if(!data){
    try{
      const ancien=JSON.parse(localStorage.getItem(OLD_STORAGE)||"null");
      if(Array.isArray(ancien)){
        data=etatInitial();
        data.missions=data.missions.map((s,i)=>({...s,...(ancien[i]||{}),signals:false,chains:false,safety:{}}));
      }
    }catch(error){data=null;}
  }
  const base=etatInitial();
  if(!data)return base;
  data.profile={...base.profile,...(data.profile||{})};
  data.thresholds={...base.thresholds,...(data.thresholds||{})};
  data.history=Array.isArray(data.history)?data.history.slice(-40):[];
  data.missions=missions.map((m,i)=>({...nouvelleMission(m),...(data.missions?.[i]||{}),safety:{...(data.missions?.[i]?.safety||{})}}));
  return data;
}

/* Mémorise l’état dans le navigateur, sans envoi vers un serveur. */
function sauver(){localStorage.setItem(STORAGE,JSON.stringify(state));}

/* Récupère facilement un élément par son identifiant. */
const $=id=>document.getElementById(id);

/* Regroupe les principaux éléments de l’interface. */
const el={
  score:$("score"),progress:$("progress"),missions:$("missions"),name:$("studentName"),classe:$("studentClass"),team:$("studentTeam"),mode:$("difficultyMode"),
  humidity:$("humidity"),reservoir:$("reservoir"),light:$("light"),humidityValue:$("humidityValue"),reservoirValue:$("reservoirValue"),lightValue:$("lightValue"),
  humidityThreshold:$("humidityThreshold"),reservoirThreshold:$("reservoirThreshold"),lightThreshold:$("lightThreshold"),chart:$("historyChart"),
  water:$("water"),plant:$("plant"),soil:$("soil"),pump:$("pump"),pumpBadge:$("pumpBadge"),title:$("missionTitle"),points:$("points"),story:$("story"),objective:$("objective"),
  competencies:$("competencies"),criteria:$("criteria"),code:$("code"),steps:$("hardwareSteps"),hardware:$("hardwareDone"),question:$("question"),answer:$("answer"),console:$("console"),report:$("report"),teacher:$("teacherView")
};

/* Charge l’état et prépare les variables de navigation. */
let state=charger();
let current=0;
let hintIndex=0;
let editorReady=false;

/* Retourne la valeur numérique d’une variable écrite dans le programme. */
function valeur(code,nom){const m=code.match(new RegExp(`${nom}\\s*=\\s*(\\d+(?:\\.\\d+)?)`,`i`));return m?Number(m[1]):NaN;}

/* Vérifie les quatre règles de sécurité et la réalisation matérielle. */
function materielValide(s){return s.hardware&&["powerOff","separateSupply","retentionTray","teacherCheck"].every(k=>s.safety[k]);}

/* Affiche un message dans la console pédagogique. */
function message(texte){el.console.textContent=texte;}

/* Modifie l’état visuel de la pompe. */
function pompe(active){el.pump.classList.toggle("on",active);el.pump.textContent=active?"POMPE ON":"POMPE";el.pumpBadge.textContent=active?"Pompe active":"Pompe arrêtée";}

/* Enregistre le programme actuellement visible sans écraser l’initialisation. */
function memoriserEditeur(){if(editorReady)state.missions[current].code=el.code.value;}

/* Calcule l’état de chaque critère de la mission active. */
function etatsCriteres(){const m=missions[current],s=state.missions[current];return m.checks.map(([label,test])=>({label,ok:test(s.code,s)}));}

/* Affiche les critères et leur état actuel. */
function afficherCriteres(){el.criteria.innerHTML=etatsCriteres().map(c=>`<li class="${c.ok?"met":"manquant"}">${c.ok?"✅":"⬜"} ${c.label}</li>`).join("");}

/* Crée les boutons des huit missions. */
function afficherNavigation(){
  el.missions.innerHTML="";
  missions.forEach((m,i)=>{
    const b=document.createElement("button");
    b.type="button";
    b.className=`mission ${i===current?"active":""} ${state.missions[i].done?"done":""}`;
    b.innerHTML=`<strong>${m.id}. ${m.title}</strong><br><small>${m.points} point${m.points>1?"s":""}</small>`;
    b.onclick=()=>chargerMission(i);
    el.missions.appendChild(b);
  });
}

/* Affiche une mission et restaure son travail. */
function chargerMission(index){
  memoriserEditeur();
  current=index;
  hintIndex=0;
  const m=missions[index],s=state.missions[index];
  el.title.textContent=`Mission ${m.id} – ${m.title}`;
  el.points.textContent=`${m.points} point${m.points>1?"s":""}`;
  el.story.textContent=m.story;
  el.objective.textContent=m.objective;
  el.competencies.innerHTML=m.skills.map(k=>`<span class="chip">${SKILLS[k]}</span>`).join("");
  el.code.value=s.code;
  el.steps.innerHTML=m.hardware.map(x=>`<li>${x}</li>`).join("");
  el.hardware.checked=s.hardware;
  el.question.textContent=m.question;
  el.answer.value=s.answer;
  document.querySelectorAll(".safetyCheck").forEach(c=>{c.checked=!!s.safety[c.dataset.safety];});
  $("signalHumidity").value=s.signals?"analogique":"";
  $("signalRelay").value=s.signals?"logique":"";
  $("logicLevels").value=s.signals?"low-high":"";
  $("signalFeedback").textContent=s.signals?"✅ Mini-défi déjà réussi.":"";
  construireChaines(s.chains);
  afficherCriteres();
  afficherNavigation();
  pompe(false);
  afficherOnglet("simulation");
  message(`Mission ${m.id} chargée. Consulte les critères, réalise les essais puis valide.`);
  editorReady=true;
}

/* Met à jour le jumeau numérique à partir des curseurs. */
function actualiserCapteurs(){
  const h=Number(el.humidity.value),r=Number(el.reservoir.value),l=Number(el.light.value);
  el.humidityValue.textContent=`${h} %`;
  el.reservoirValue.textContent=`${r} %`;
  el.lightValue.textContent=`${l} %`;
  el.water.style.height=`${r}%`;
  el.plant.classList.toggle("dry",h<Number(el.humidityThreshold.value));
  el.soil.style.background=`hsl(25 38% ${22+Math.round(h/6)}%)`;
}

/* Simule le sous-ensemble pédagogique de Python utilisé par les élèves. */
function executer(){
  const s=state.missions[current],c=el.code.value;
  s.code=c;
  s.tries++;
  const h=Number(el.humidity.value),r=Number(el.reservoir.value),l=Number(el.light.value);
  const sh=Number.isFinite(valeur(c,"seuil_humidite"))?valeur(c,"seuil_humidite"):Number(el.humidityThreshold.value);
  const sr=Number.isFinite(valeur(c,"seuil_reservoir"))?valeur(c,"seuil_reservoir"):Number(el.reservoirThreshold.value);
  const sl=Number.isFinite(valeur(c,"seuil_lumiere"))?valeur(c,"seuil_lumiere"):Number(el.lightThreshold.value);
  const duree=c.match(/arroser\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
  const demande=!!duree&&h<sh;
  const niveauOk=!/lire_reservoir|seuil_reservoir/i.test(c)||r>=sr;
  const lumiereOk=!/lire_lumiere|seuil_lumiere/i.test(c)||l<sl;
  const active=demande&&niveauOk&&lumiereOk;
  const alerte=/alerter\s*\(/i.test(c)&&r<sr;
  pompe(active);
  state.history.push({h,r,l,sh,active,time:new Date().toISOString(),mission:missions[current].id});
  state.history=state.history.slice(-40);
  sauver();
  dessinerGraphique();
  afficherCriteres();
  actualiserTableau();
  message(`Capteurs : humidité=${h} %, réservoir=${r} %, lumière=${l} %.\nSeuils utilisés : ${sh} %, ${sr} %, ${sl} %.\nPompe : ${active?`ACTIVE pendant ${duree[1]} s`:"ARRÊTÉE"}.\nAlerte : ${alerte?"ACTIVE":"aucune"}.`);
}

/* Insère les valeurs réglées dans les variables du programme. */
function appliquerSeuils(){
  let c=el.code.value;
  const valeurs={seuil_humidite:Number(el.humidityThreshold.value),seuil_reservoir:Number(el.reservoirThreshold.value),seuil_lumiere:Number(el.lightThreshold.value)};
  Object.entries(valeurs).forEach(([nom,v])=>{const re=new RegExp(`^${nom}\\s*=.*$`,`m`);if(re.test(c))c=c.replace(re,`${nom} = ${v}`);});
  el.code.value=c;
  state.thresholds={humidity:valeurs.seuil_humidite,reservoir:valeurs.seuil_reservoir,light:valeurs.seuil_lumiere};
  state.missions[current].code=c;
  sauver();
  afficherCriteres();
  message("Les seuils présents dans le programme ont été actualisés.");
}

/* Dessine l’historique de l’humidité et du seuil dans le canevas. */
function dessinerGraphique(){
  const canvas=el.chart,ctx=canvas.getContext("2d"),d=state.history;
  const w=canvas.width,h=canvas.height,p=38;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#04100c";ctx.fillRect(0,0,w,h);
  ctx.strokeStyle="#315b4e";ctx.fillStyle="#b9d5c9";ctx.font="12px Verdana";
  [0,25,50,75,100].forEach(v=>{const y=h-p-(v/100)*(h-2*p);ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke();ctx.fillText(`${v}%`,4,y+4);});
  if(!d.length){ctx.fillText("Exécute le programme pour ajouter un essai.",p+20,h/2);return;}
  const x=i=>p+(d.length===1?0.5:i/(d.length-1))*(w-2*p),y=v=>h-p-(v/100)*(h-2*p);
  ctx.strokeStyle="#ffd166";ctx.beginPath();d.forEach((q,i)=>i?ctx.lineTo(x(i),y(q.sh)):ctx.moveTo(x(i),y(q.sh)));ctx.stroke();
  ctx.strokeStyle="#6fd3ff";ctx.lineWidth=3;ctx.beginPath();d.forEach((q,i)=>i?ctx.lineTo(x(i),y(q.h)):ctx.moveTo(x(i),y(q.h)));ctx.stroke();ctx.lineWidth=1;
  d.forEach((q,i)=>{if(q.active){ctx.fillStyle="#63db8d";ctx.beginPath();ctx.arc(x(i),y(q.h),5,0,Math.PI*2);ctx.fill();}});
}

/* Construit le mini-défi des chaînes d’information et d’énergie. */
function construireChaines(dejaValide){
  const items=[
    ["Capteur d’humidité","Acquérir"],["Arduino Uno R4 Minima","Traiter"],["Écran ou alerte","Communiquer"],["Alimentation basse tension","Alimenter"],
    ["Relais Grove","Distribuer"],["Pompe","Convertir"],["Tuyau","Transmettre"],["Arrosage du sol","Agir"]
  ];
  const options=["","Acquérir","Traiter","Communiquer","Alimenter","Distribuer","Convertir","Transmettre","Agir"];
  $("chainChallenge").innerHTML=items.map(([nom,bonne],i)=>`<label class="chain-row" data-good="${bonne}"><strong>${nom}</strong><select data-chain="${i}">${options.map(o=>`<option value="${o}" ${dejaValide&&o===bonne?"selected":""}>${o||"Choisir une fonction"}</option>`).join("")}</select></label>`).join("");
  $("chainFeedback").textContent=dejaValide?"✅ Mini-défi déjà réussi.":"";
}

/* Valide les trois réponses sur la nature des signaux. */
function validerSignaux(){
  const ok=$("signalHumidity").value==="analogique"&&$("signalRelay").value==="logique"&&$("logicLevels").value==="low-high";
  state.missions[current].signals=ok;
  const f=$("signalFeedback");f.textContent=ok?"✅ Correct : les capteurs fournissent des mesures analogiques et D6 commande un état logique.":"À corriger : repère la grandeur continue, la commande à deux états et les niveaux LOW/HIGH.";f.className=`feedback ${ok?"success":"error"}`;
  sauver();afficherCriteres();
}

/* Valide les associations des deux chaînes. */
function validerChaines(){
  const lignes=[...document.querySelectorAll(".chain-row")];
  const ok=lignes.every(l=>{const juste=l.querySelector("select").value===l.dataset.good;l.classList.toggle("correct",juste);l.classList.toggle("incorrect",!juste);return juste;});
  state.missions[current].chains=ok;
  const f=$("chainFeedback");f.textContent=ok?"✅ Toutes les fonctions sont correctement associées.":"Certaines associations sont à corriger. Repars des verbes des chaînes.";f.className=`feedback ${ok?"success":"error"}`;
  sauver();afficherCriteres();
}

/* Valide une mission lorsque tous ses critères sont atteints. */
function validerMission(){
  const s=state.missions[current];
  s.code=el.code.value;s.answer=el.answer.value.trim();s.hardware=el.hardware.checked;
  const criteres=etatsCriteres(),manquants=criteres.filter(c=>!c.ok).map(c=>c.label);
  if(!manquants.length){s.done=true;message(`Mission validée : +${missions[current].points} point${missions[current].points>1?"s":""}.`);}else{message(`Mission non validée. À compléter :\n– ${manquants.join("\n– ")}`);}
  sauver();afficherCriteres();afficherNavigation();actualiserTableau();
}

/* Affiche une aide progressive adaptée à la mission. */
function afficherIndice(){const a=missions[current].hints,i=Math.min(hintIndex,a.length-1);message(`Indice ${i+1}/${a.length} : ${a[i]}`);hintIndex++;}

/* Réinitialise seulement la mission active selon le niveau d’aide choisi. */
function reinitialiserMission(){if(!confirm("Réinitialiser uniquement cette mission ?"))return;state.missions[current]=nouvelleMission(missions[current]);state.missions[current].code=missions[current].codes[state.profile.mode];sauver();chargerMission(current);actualiserTableau();}

/* Affiche l’un des trois onglets de pratique. */
function afficherOnglet(nom){["simulation","hardware","analysis"].forEach(id=>$(id).classList.toggle("hidden",id!==nom));document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===nom));}

/* Actualise la note et les cartes de suivi. */
function actualiserTableau(){
  const total=missions.reduce((t,m,i)=>t+(state.missions[i].done?m.points:0),0),nb=state.missions.filter(s=>s.done).length;
  el.score.textContent=`${total} / 20`;el.progress.textContent=`${nb} mission${nb>1?"s":""} validée${nb>1?"s":""}`;
  el.report.innerHTML=missions.map((m,i)=>{const s=state.missions[i];const details=state.profile.teacher?`<div class="teacher-details"><strong>Programme :</strong>\n${echapper(s.code)}\n\n<strong>Réponse :</strong>\n${echapper(s.answer||"Non rédigée")}</div>`:"";return `<article><strong>${m.id}. ${m.title}</strong><br>${s.done?`✅ ${m.points}/${m.points}`:`⬜ 0/${m.points}`}<br><small>Matériel : ${materielValide(s)?"validé":"à faire"} · Analyse : ${s.answer?"enregistrée":"à rédiger"} · Tentatives : ${s.tries}</small>${details}</article>`;}).join("");
}

/* Protège les textes de l’élève avant leur insertion dans le HTML. */
function echapper(t){return String(t).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));}

/* Télécharge un contenu généré dans le navigateur. */
function telecharger(nom,contenu,type){const url=URL.createObjectURL(new Blob([contenu],{type}));const a=document.createElement("a");a.href=url;a.download=nom;a.click();URL.revokeObjectURL(url);}

/* Exporte une synthèse compatible avec Excel et LibreOffice Calc. */
function exporterCsv(){
  memoriserEditeur();
  const lignes=[["Nom","Classe","Équipe","Mission","Titre","Points","Maximum","Matériel","Analyse","Tentatives"]];
  missions.forEach((m,i)=>{const s=state.missions[i];lignes.push([state.profile.name,state.profile.classe,state.profile.team,m.id,m.title,s.done?m.points:0,m.points,materielValide(s)?"Oui":"Non",s.answer?"Oui":"Non",s.tries]);});
  const csv=lignes.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
  telecharger("resultats-technoquest-jardin.csv","\ufeff"+csv,"text/csv;charset=utf-8");
}

/* Exporte toutes les preuves afin de faciliter le suivi enseignant. */
function exporterJson(){memoriserEditeur();telecharger("preuves-technoquest-jardin.json",JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),"application/json;charset=utf-8");}

/* Change le niveau d’aide et propose le modèle correspondant. */
function changerMode(){
  const nouveau=el.mode.value,ancien=state.profile.mode;
  if(nouveau===ancien)return;
  const remplacer=confirm("Remplacer le programme de la mission active par le modèle du nouveau niveau d’aide ?");
  state.profile.mode=nouveau;
  if(remplacer){state.missions[current].code=missions[current].codes[nouveau];el.code.value=state.missions[current].code;}
  sauver();afficherCriteres();
}

/* Enregistre les informations d’identification saisies. */
function enregistrerProfil(){state.profile.name=el.name.value.trim();state.profile.classe=el.classe.value.trim();state.profile.team=el.team.value.trim();sauver();}

/* Associe les curseurs de capteurs à la simulation. */
[el.humidity,el.reservoir,el.light].forEach(x=>x.addEventListener("input",actualiserCapteurs));

/* Associe les seuils à la sauvegarde locale. */
[el.humidityThreshold,el.reservoirThreshold,el.lightThreshold].forEach(x=>x.addEventListener("change",()=>{state.thresholds={humidity:Number(el.humidityThreshold.value),reservoir:Number(el.reservoirThreshold.value),light:Number(el.lightThreshold.value)};sauver();actualiserCapteurs();dessinerGraphique();}));

/* Associe les champs d’identité à la sauvegarde locale. */
[el.name,el.classe,el.team].forEach(x=>x.addEventListener("input",enregistrerProfil));

/* Sauvegarde le code et actualise les critères pendant la saisie. */
el.code.addEventListener("input",()=>{if(!editorReady)return;state.missions[current].code=el.code.value;sauver();afficherCriteres();});

/* Sauvegarde la réalisation matérielle. */
el.hardware.addEventListener("change",()=>{state.missions[current].hardware=el.hardware.checked;sauver();afficherCriteres();actualiserTableau();});

/* Sauvegarde chaque règle de sécurité. */
document.querySelectorAll(".safetyCheck").forEach(c=>c.addEventListener("change",()=>{state.missions[current].safety[c.dataset.safety]=c.checked;sauver();afficherCriteres();actualiserTableau();}));

/* Associe les commandes principales. */
$("run").onclick=executer;
$("validate").onclick=validerMission;
$("hint").onclick=afficherIndice;
$("reset").onclick=reinitialiserMission;
$("applyThresholds").onclick=appliquerSeuils;
$("validateSignals").onclick=validerSignaux;
$("validateChains").onclick=validerChaines;
$("saveAnswer").onclick=()=>{state.missions[current].answer=el.answer.value.trim();sauver();afficherCriteres();actualiserTableau();message("Trace écrite enregistrée localement.");};
$("clearChart").onclick=()=>{state.history=[];sauver();dessinerGraphique();};
$("export").onclick=exporterCsv;
$("exportJson").onclick=exporterJson;
$("printReport").onclick=()=>window.print();
$("clear").onclick=()=>{if(confirm("Effacer toute la progression enregistrée sur cet appareil ?")){localStorage.removeItem(STORAGE);localStorage.removeItem(OLD_STORAGE);location.reload();}};

/* Associe le changement de niveau d’aide. */
el.mode.onchange=changerMode;

/* Associe la vue professeur au tableau de bord. */
el.teacher.onchange=()=>{state.profile.teacher=el.teacher.checked;sauver();actualiserTableau();};

/* Associe les boutons d’onglets. */
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>afficherOnglet(b.dataset.tab));

/* Restaure les informations générales. */
el.name.value=state.profile.name;
el.classe.value=state.profile.classe;
el.team.value=state.profile.team;
el.mode.value=state.profile.mode;
el.teacher.checked=state.profile.teacher;
el.humidityThreshold.value=state.thresholds.humidity;
el.reservoirThreshold.value=state.thresholds.reservoir;
el.lightThreshold.value=state.thresholds.light;

/* Initialise l’interface complète. */
afficherNavigation();
chargerMission(0);
actualiserCapteurs();
dessinerGraphique();
actualiserTableau();
