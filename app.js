/* Active un mode JavaScript strict. */
"use strict";

/* Définit les huit missions et leur barème total de vingt points. */
const missions = [
  /* Mission 1 : découverte de la mesure analogique. */
  { id:1, title:"Lire l'humidité", points:2, story:"Les plantes se flétrissent. Il faut d'abord mesurer l'état du sol avec le capteur Grove.", objective:"Lire et afficher l'humidité sans activer la pompe.", code:"# Lire le capteur\nhumidite = lire_humidite()\n\n# Afficher la mesure\nafficher(humidite)\n\n# Conserver la pompe à l'arrêt\nstop()", question:"Pourquoi le signal du capteur d'humidité est-il analogique ?", hardware:["Monter le Grove Base Shield hors tension.","Relier le capteur d'humidité au port A0.","Téléverser le programme 01_capteur_humidite.ino.","Noter trois valeurs en milieu sec et trois valeurs en milieu humide."], hints:["Utilise lire_humidite().","Ajoute afficher(humidite).","Termine par stop()."], validate:(c)=>/lire_humidite\s*\(/i.test(c)&&/afficher\s*\(/i.test(c)&&/stop\s*\(/i.test(c) },
  /* Mission 2 : calibration du seuil. */
  { id:2, title:"Calibrer le seuil", points:2, story:"Une valeur isolée ne suffit pas. L'équipe doit définir un seuil à partir de mesures réelles.", objective:"Reconnaître un sol sec avec un seuil compris entre 25 % et 45 %.", code:"humidite = lire_humidite()\n\nif humidite < 35:\n    afficher(\"Sol sec\")\nelse:\n    afficher(\"Sol humide\")\n\nstop()", question:"Comment as-tu choisi le seuil à partir de tes mesures ?", hardware:["Réaliser cinq mesures en sol sec.","Réaliser cinq mesures en sol humide.","Comparer les deux séries dans un tableur.","Choisir et justifier un seuil situé entre les deux groupes."], hints:["Compare humidite à un nombre.","Le seuil simulé est compris entre 25 et 45.","Exemple : if humidite < 35:"], validate:(c)=>{const m=c.match(/humidite\s*<\s*(\d+)/i);return !!m&&Number(m[1])>=25&&Number(m[1])<=45&&/stop\s*\(/i.test(c);} },
  /* Mission 3 : commande du relais et de la pompe. */
  { id:3, title:"Commander la pompe", points:3, story:"Le capteur fonctionne. Il faut maintenant commander une pompe basse tension à travers un relais Grove.", objective:"Arroser durant trois secondes si le sol est sec, sinon arrêter la pompe.", code:"humidite = lire_humidite()\n\nif humidite < 35:\n    arroser(3)\nelse:\n    stop()", question:"Explique la différence entre chaîne d'information et chaîne d'énergie.", hardware:["Relier le relais Grove au port D6.","Tester d'abord le relais avec une LED.","Utiliser une alimentation séparée pour la pompe.","Téléverser 02_relais.ino puis 03_jardin_automatique.ino."], hints:["Place arroser(3) dans le bloc if.","Ajoute else puis stop().","La pompe n'est jamais alimentée par une broche Arduino."], validate:(c)=>/if\s+humidite\s*<\s*\d+/i.test(c)&&/arroser\s*\(\s*3\s*\)/i.test(c)&&/stop\s*\(/i.test(c) },
  /* Mission 4 : protection contre la marche à vide. */
  { id:4, title:"Protéger la pompe", points:3, story:"La pompe ne doit jamais fonctionner à vide. Un second capteur surveille le réservoir.", objective:"Arroser seulement si le sol est sec ET si le réservoir contient au moins 20 % d'eau.", code:"humidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < 35 and reservoir >= 20:\n    arroser(3)\nelse:\n    stop()\n\nif reservoir < 20:\n    alerter(\"Réservoir vide\")", question:"Quel risque est évité et pourquoi utilise-t-on l'opérateur logique ET ?", hardware:["Brancher le capteur de niveau sur A2.","Mesurer le réservoir vide puis rempli.","Définir un seuil réel.","Vérifier que le relais reste au repos si le niveau est insuffisant."], hints:["Lis le réservoir avec lire_reservoir().","Relie les conditions avec and.","Ajoute une alerte sous 20 %."], validate:(c)=>/lire_reservoir\s*\(/i.test(c)&&/\band\b/i.test(c)&&/reservoir\s*>=\s*20/i.test(c)&&/alerter\s*\(/i.test(c) },
  /* Mission 5 : économie d'eau et hystérésis. */
  { id:5, title:"Économiser l'eau", points:3, story:"Le premier prototype démarre trop souvent. Il faut réduire la consommation et les oscillations.", objective:"Employer deux seuils différents et limiter l'arrosage à trois secondes maximum.", code:"humidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < 30 and reservoir >= 20:\n    arroser(2)\nelif humidite > 42:\n    stop()\nelse:\n    stop()", question:"Qu'est-ce qu'une hystérésis et pourquoi limite-t-elle les démarrages répétés ?", hardware:["Observer les variations autour d'un seuil unique.","Tester deux seuils différents.","Mesurer le débit de la pompe.","Calculer le volume utilisé pendant dix cycles."], hints:["Utilise deux comparaisons différentes de humidite.","La durée doit rester inférieure ou égale à 3.","Exemple : 30 % au démarrage et 42 % pour l'arrêt."], validate:(c)=>{const s=[...c.matchAll(/humidite\s*[<>]=?\s*(\d+)/gi)].map(x=>x[1]);const d=c.match(/arroser\s*\(\s*(\d+)/i);return new Set(s).size>=2&&!!d&&Number(d[1])<=3&&/stop\s*\(/i.test(c);} },
  /* Mission 6 : décision multicritère. */
  { id:6, title:"Jardin multicritère", points:3, story:"Sous un fort soleil, l'évaporation augmente. Le système tient aussi compte de la lumière.", objective:"Arroser si le sol est sec, le réservoir suffisant et la luminosité inférieure à 70 %.", code:"humidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\n\nif humidite < 35 and reservoir >= 20 and lumiere < 70:\n    arroser(2)\nelse:\n    stop()", question:"L'ajout de la luminosité est-il toujours pertinent ? Donne un avantage et une limite.", hardware:["Brancher le capteur de lumière sur A1.","Mesurer sous une lumière faible puis forte.","Choisir un seuil adapté.","Tester plusieurs combinaisons de valeurs."], hints:["Lis la lumière avec lire_lumiere().","La condition contient trois comparaisons.","Compare lumiere à 70."], validate:(c)=>/lire_lumiere\s*\(/i.test(c)&&(c.match(/\band\b/gi)||[]).length>=2&&/lumiere\s*<\s*70/i.test(c) },
  /* Mission 7 : durabilité du capteur. */
  { id:7, title:"Améliorer la fiabilité", points:2, story:"Après plusieurs semaines, un capteur résistif peut se corroder. L'équipe compare une solution capacitive.", objective:"Recalibrer la mesure et conserver toutes les sécurités du système.", code:"humidite = lire_humidite()\nreservoir = lire_reservoir()\n\nif humidite < 38 and reservoir >= 20:\n    arroser(2)\nelse:\n    stop()", question:"Compare capteurs résistif et capacitif selon durabilité, stabilité, coût et usage.", hardware:["Observer les deux technologies de capteurs.","Effectuer une nouvelle calibration.","Comparer dix mesures successives.","Justifier le composant retenu."], hints:["Un nouveau capteur exige une nouvelle calibration.","Conserve la sécurité du réservoir.","Conserve un arrêt explicite."], validate:(c)=>/lire_humidite\s*\(/i.test(c)&&/lire_reservoir\s*\(/i.test(c)&&/arroser\s*\(/i.test(c)&&/stop\s*\(/i.test(c) },
  /* Mission 8 : intégration et soutenance. */
  { id:8, title:"Défi ingénieur", points:2, story:"Le prototype doit désormais satisfaire le cahier des charges et être présenté à un jury.", objective:"Produire une solution complète, sûre, économe, testée et argumentée.", code:"humidite = lire_humidite()\nreservoir = lire_reservoir()\nlumiere = lire_lumiere()\n\nif reservoir < 20:\n    stop()\n    alerter(\"Remplir le réservoir\")\nelif humidite < 32 and lumiere < 70:\n    arroser(2)\nelse:\n    stop()", question:"Présente le cahier des charges, les essais, une limite et l'amélioration prioritaire.", hardware:["Assembler le prototype complet dans un bac de rétention.","Faire vérifier le câblage avant alimentation.","Réaliser six situations d'essai.","Présenter le prototype et les résultats au jury."], hints:["Lis les trois capteurs.","Traite le réservoir vide avant l'arrosage.","Ajoute alerte, arrosage court et arrêt explicite."], validate:(c)=>/lire_humidite\s*\(/i.test(c)&&/lire_reservoir\s*\(/i.test(c)&&/lire_lumiere\s*\(/i.test(c)&&/alerter\s*\(/i.test(c)&&c.search(/reservoir\s*<\s*20/i)<c.search(/arroser\s*\(/i) }
];

/* Définit la clé de sauvegarde locale. */
const storageKey = "technoquest-jardin-v1";
/* Charge la progression ou crée un état initial. */
let state = JSON.parse(localStorage.getItem(storageKey) || "null") || missions.map(m=>({code:m.code,done:false,hardware:false,answer:"",tries:0}));
/* Mémorise la mission affichée. */
let current = 0;
/* Mémorise le niveau d'indice affiché. */
let hintIndex = 0;

/* Récupère un élément de la page par son identifiant. */
const $ = id => document.getElementById(id);
/* Regroupe les principaux éléments. */
const el = { missions:$("missions"),score:$("score"),progress:$("progress"),title:$("missionTitle"),points:$("points"),story:$("story"),objective:$("objective"),code:$("code"),steps:$("hardwareSteps"),hardware:$("hardwareDone"),question:$("question"),answer:$("answer"),console:$("console"),humidity:$("humidity"),reservoir:$("reservoir"),light:$("light"),humidityValue:$("humidityValue"),reservoirValue:$("reservoirValue"),lightValue:$("lightValue"),water:$("water"),plant:$("plant"),soil:$("soil"),pump:$("pump"),pumpBadge:$("pumpBadge"),report:$("report") };

/* Enregistre l'état courant. */
function save(){ localStorage.setItem(storageKey,JSON.stringify(state)); }
/* Affiche un message dans la console pédagogique. */
function message(text){ el.console.textContent=text; }
/* Active ou arrête visuellement la pompe. */
function setPump(on){ el.pump.classList.toggle("on",on); el.pump.textContent=on?"POMPE ON":"POMPE"; el.pumpBadge.textContent=on?"Pompe active":"Pompe arrêtée"; }

/* Crée la navigation des missions. */
function renderNav(){
  /* Vide l'ancienne navigation. */
  el.missions.innerHTML="";
  /* Crée un bouton par mission. */
  missions.forEach((m,i)=>{
    /* Crée le bouton. */
    const b=document.createElement("button");
    /* Définit son contenu. */
    b.innerHTML=`<strong>${m.id}. ${m.title}</strong><br><small>${m.points} point${m.points>1?"s":""}</small>`;
    /* Applique ses classes. */
    b.className=`mission ${i===current?"active":""} ${state[i].done?"done":""}`;
    /* Charge la mission au clic. */
    b.onclick=()=>loadMission(i);
    /* Ajoute le bouton. */
    el.missions.appendChild(b);
  });
}

/* Charge une mission dans l'interface. */
function loadMission(index){
  /* Sauvegarde le code quitté. */
  state[current].code=el.code.value||state[current].code;
  /* Mémorise la nouvelle mission. */
  current=index;
  /* Réinitialise les indices. */
  hintIndex=0;
  /* Récupère les données. */
  const m=missions[index],s=state[index];
  /* Remplit les contenus. */
  el.title.textContent=`Mission ${m.id} – ${m.title}`;
  el.points.textContent=`${m.points} point${m.points>1?"s":""}`;
  el.story.textContent=m.story;
  el.objective.textContent=m.objective;
  el.code.value=s.code;
  el.hardware.checked=s.hardware;
  el.question.textContent=m.question;
  el.answer.value=s.answer;
  /* Crée les étapes matérielles. */
  el.steps.innerHTML=m.hardware.map(x=>`<li>${x}</li>`).join("");
  /* Réinitialise la pompe. */
  setPump(false);
  /* Affiche l'onglet de simulation. */
  showTab("simulation");
  /* Actualise la navigation. */
  renderNav();
  /* Affiche le message de départ. */
  message(`Mission ${m.id} chargée. Modifie les capteurs puis exécute ton programme.`);
}

/* Met à jour l'affichage des capteurs. */
function updateSensors(){
  /* Lit les trois valeurs. */
  const h=Number(el.humidity.value),r=Number(el.reservoir.value),l=Number(el.light.value);
  /* Met à jour les sorties. */
  el.humidityValue.textContent=`${h} %`;
  el.reservoirValue.textContent=`${r} %`;
  el.lightValue.textContent=`${l} %`;
  /* Met à jour le réservoir. */
  el.water.style.height=`${r}%`;
  /* Met à jour l'état de la plante. */
  el.plant.classList.toggle("dry",h<35);
  /* Met à jour la couleur de la terre. */
  el.soil.style.background=`hsl(25 38% ${22+Math.round(h/6)}%)`;
}

/* Simule le sous-ensemble pédagogique de Python. */
function runCode(){
  /* Sauvegarde le code. */
  state[current].code=el.code.value;
  /* Incrémente les tentatives. */
  state[current].tries++;
  /* Lit les valeurs. */
  const h=Number(el.humidity.value),r=Number(el.reservoir.value),l=Number(el.light.value),c=el.code.value;
  /* Recherche la durée d'arrosage. */
  const dm=c.match(/arroser\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
  /* Évalue les conditions essentielles reconnues. */
  const humidityOk=!/humidite\s*<\s*(\d+)/i.test(c)||h<Number(c.match(/humidite\s*<\s*(\d+)/i)[1]);
  /* Évalue le seuil du réservoir suffisant. */
  const reservoirOk=!/reservoir\s*>=\s*(\d+)/i.test(c)||r>=Number(c.match(/reservoir\s*>=\s*(\d+)/i)[1]);
  /* Évalue le seuil de lumière. */
  const lightOk=!/lumiere\s*<\s*(\d+)/i.test(c)||l<Number(c.match(/lumiere\s*<\s*(\d+)/i)[1]);
  /* Vérifie la sécurité du réservoir bas. */
  const blocked=/reservoir\s*<\s*20/i.test(c)&&r<20;
  /* Détermine l'état de la pompe. */
  const on=!!dm&&humidityOk&&reservoirOk&&lightOk&&!blocked;
  /* Met à jour la pompe. */
  setPump(on);
  /* Détermine l'alerte. */
  const alert=/alerter\s*\(/i.test(c)&&r<20;
  /* Enregistre l'état. */
  save();
  /* Actualise le tableau de bord. */
  updateDashboard();
  /* Affiche le résultat. */
  message(`Capteurs : humidité=${h} %, réservoir=${r} %, lumière=${l} %.\nPompe : ${on?`ACTIVE pendant ${dm[1]} s`:"ARRÊTÉE"}.\nAlerte : ${alert?"ACTIVE":"aucune"}.`);
}

/* Valide la mission active. */
function validateMission(){
  /* Sauvegarde les données courantes. */
  state[current].code=el.code.value;
  state[current].hardware=el.hardware.checked;
  state[current].answer=el.answer.value.trim();
  /* Vérifie le code. */
  const codeOk=missions[current].validate(el.code.value);
  /* Exige la pratique réelle à partir de la mission 3. */
  const hardwareOk=missions[current].id<3||el.hardware.checked;
  /* Exige une analyse substantielle pour les deux dernières missions. */
  const analysisOk=missions[current].id<7||el.answer.value.trim().length>=80;
  /* Valide si toutes les conditions sont réunies. */
  if(codeOk&&hardwareOk&&analysisOk){ state[current].done=true; message(`Mission validée : +${missions[current].points} point${missions[current].points>1?"s":""}.`); }
  /* Explique les preuves manquantes. */
  else { const missing=[]; if(!codeOk)missing.push("programme incomplet"); if(!hardwareOk)missing.push("montage Arduino/Grove non confirmé"); if(!analysisOk)missing.push("analyse de moins de 80 caractères"); message(`Mission non validée : ${missing.join(", ")}.`); }
  /* Enregistre et actualise. */
  save(); renderNav(); updateDashboard();
}

/* Affiche un indice progressif. */
function showHint(){ const hints=missions[current].hints; message(`Indice ${Math.min(hintIndex+1,hints.length)}/${hints.length} : ${hints[Math.min(hintIndex,hints.length-1)]}`); hintIndex++; }
/* Réinitialise uniquement la mission active. */
function resetMission(){ state[current]={code:missions[current].code,done:false,hardware:false,answer:"",tries:0}; save(); loadMission(current); updateDashboard(); }

/* Affiche un des trois onglets de pratique. */
function showTab(name){
  /* Parcourt les noms d'onglets. */
  ["simulation","hardware","analysis"].forEach(id=>$(id).classList.toggle("hidden",id!==name));
  /* Met à jour les boutons. */
  document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
}

/* Calcule la note et construit le rapport. */
function updateDashboard(){
  /* Calcule le total. */
  const score=missions.reduce((t,m,i)=>t+(state[i].done?m.points:0),0);
  /* Compte les réussites. */
  const count=state.filter(x=>x.done).length;
  /* Affiche la note. */
  el.score.textContent=`${score} / 20`;
  /* Affiche la progression. */
  el.progress.textContent=`${count} mission${count>1?"s":""} validée${count>1?"s":""}`;
  /* Crée les cartes. */
  el.report.innerHTML=missions.map((m,i)=>`<article><strong>${m.id}. ${m.title}</strong><br>${state[i].done?`✅ ${m.points}/${m.points}`:`⬜ 0/${m.points}`}<br><small>Arduino/Grove : ${state[i].hardware?"validé":"à faire"} · Analyse : ${state[i].answer?"enregistrée":"à rédiger"} · Tentatives : ${state[i].tries}</small></article>`).join("");
}

/* Exporte les résultats dans un CSV compatible avec un tableur français. */
function exportCsv(){
  /* Définit l'en-tête. */
  const rows=[["Mission","Titre","Points","Maximum","Arduino_Grove","Analyse","Tentatives"]];
  /* Ajoute les missions. */
  missions.forEach((m,i)=>rows.push([m.id,m.title,state[i].done?m.points:0,m.points,state[i].hardware?"Oui":"Non",state[i].answer?"Oui":"Non",state[i].tries]));
  /* Produit le texte CSV. */
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
  /* Crée le fichier en mémoire. */
  const url=URL.createObjectURL(new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}));
  /* Crée un lien temporaire. */
  const a=document.createElement("a");
  /* Définit sa destination. */
  a.href=url;
  /* Définit le nom du fichier. */
  a.download="resultats-technoquest-jardin.csv";
  /* Lance le téléchargement. */
  a.click();
  /* Libère la mémoire. */
  URL.revokeObjectURL(url);
}

/* Associe les événements des capteurs. */
[el.humidity,el.reservoir,el.light].forEach(x=>x.addEventListener("input",updateSensors));
/* Associe les événements de saisie et de validation. */
el.code.addEventListener("input",()=>{state[current].code=el.code.value;save();});
el.hardware.addEventListener("change",()=>{state[current].hardware=el.hardware.checked;save();updateDashboard();});
$("saveAnswer").onclick=()=>{state[current].answer=el.answer.value.trim();save();updateDashboard();message("Trace écrite enregistrée localement.");};
/* Associe les boutons principaux. */
$("run").onclick=runCode;
$("validate").onclick=validateMission;
$("hint").onclick=showHint;
$("reset").onclick=resetMission;
$("export").onclick=exportCsv;
$("clear").onclick=()=>{if(confirm("Effacer toute la progression enregistrée sur cet appareil ?")){localStorage.removeItem(storageKey);location.reload();}};
/* Associe les onglets. */
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
/* Initialise l'interface. */
renderNav(); loadMission(0); updateSensors(); updateDashboard();
