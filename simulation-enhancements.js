/* Jumeau numérique enrichi pour TechnoQuest – Jardin connecté. */
"use strict";

(() => {
  const byId = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const round = value => Math.round(value * 10) / 10;

  const garden = document.querySelector(".garden");
  const simulationPanel = document.querySelector(".simulation-panel");
  const missionTitle = byId("missionTitle");
  const codeEditor = byId("code");
  const runButton = byId("run");
  const pump = byId("pump");
  const pumpBadge = byId("pumpBadge");
  const plant = byId("plant");
  const soil = byId("soil");
  const water = byId("water");
  const humidity = byId("humidity");
  const reservoir = byId("reservoir");
  const light = byId("light");
  const humidityValue = byId("humidityValue");
  const reservoirValue = byId("reservoirValue");
  const lightValue = byId("lightValue");
  const humidityThreshold = byId("humidityThreshold");
  const reservoirThreshold = byId("reservoirThreshold");
  const lightThreshold = byId("lightThreshold");

  if (!garden || !simulationPanel || !pump || !plant || !soil || !water) return;

  const headerLabel = document.querySelector(".site-header .label");
  if (headerLabel) headerLabel.textContent = "TECHNOQUEST · TECHNOLOGIE · 4e · 3e · CYCLE 4";
  const classInput = byId("studentClass");
  if (classInput) classInput.placeholder = "Ex. : 4e A ou 3e B";
  const analogParagraph = document.querySelector(".knowledge-grid article:first-child p");
  if (analogParagraph) {
    analogParagraph.innerHTML = "Un signal analogique évolue de façon continue. L’Arduino mesure sa tension avec un convertisseur analogique-numérique (ADC), qui produit ensuite un <strong>nombre numérique</strong>, par exemple de 0 à 1023. Ce nombre peut être calibré en un indice d’humidité de 0 à 100&nbsp;%.";
  }

  const style = document.createElement("style");
  style.id = "digital-twin-v3-styles";
  style.textContent = `
    .digital-twin-toolbar,.digital-twin-dashboard,.decision-panel,.flow-panel,.event-panel,.compare-panel{margin:1rem 0;padding:1rem;border:1px solid var(--border);border-radius:16px;background:#061813c7}
    .digital-twin-toolbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.8rem;align-items:end}
    .digital-twin-toolbar label,.compare-panel label{display:grid;gap:.35rem;color:var(--muted);font-size:.9rem}
    .digital-twin-toolbar select,.digital-twin-toolbar input,.compare-panel input{width:100%}
    .twin-actions{display:flex;flex-wrap:wrap;gap:.6rem;grid-column:1/-1}.twin-actions button{flex:1 1 190px}
    .digital-twin-dashboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.7rem}
    .metric-card{padding:.8rem;border:1px solid var(--border);border-radius:13px;background:var(--soft);min-height:86px}
    .metric-card span{display:block;color:var(--muted);font-size:.8rem;margin-bottom:.35rem}.metric-card strong{font-size:1.05rem}
    .sensor-detail{display:block;margin-top:.3rem;color:#b9d5c9;font-size:.75rem;line-height:1.35}
    .adc-note{grid-column:1/-1;margin:0;padding:.7rem;border-left:4px solid var(--blue);background:#0a2d3a;color:#d8eef8;line-height:1.45}
    .condition-list{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.7rem}
    .condition-chip{padding:.42rem .68rem;border-radius:999px;border:1px solid var(--border);background:var(--soft);font-size:.82rem}
    .condition-chip.ok{border-color:var(--green);color:#d8ffe7}.condition-chip.no{border-color:var(--red);color:#ffd9d4}.condition-chip.info{border-color:var(--blue);color:#d8f3ff}
    .decision-panel.ready{border-left:5px solid var(--green)}.decision-panel.blocked{border-left:5px solid var(--red)}.decision-panel.waiting{border-left:5px solid var(--yellow)}
    .decision-panel h3,.flow-panel h3,.event-panel h3,.compare-panel h3{margin-top:0}.decision-panel p{color:var(--muted);line-height:1.5}
    .code-trace{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:.55rem;margin-top:.8rem}
    .trace-step{padding:.65rem;border:1px solid var(--border);border-radius:12px;background:#0d2b23;color:var(--muted);transition:transform .2s,border-color .2s,background .2s}
    .trace-step.active{transform:translateY(-2px);border-color:var(--yellow);background:#3b3414;color:#fff6cf}.trace-step.done{border-color:var(--green);color:#d8ffe7}
    .flow-grid{display:grid;grid-template-columns:1fr;gap:.65rem}.flow-row{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;padding:.65rem;border-radius:12px;background:var(--soft)}
    .flow-label{min-width:95px;font-weight:bold}.flow-node{padding:.35rem .55rem;border-radius:9px;border:1px solid var(--border);background:#0d2b23}.flow-arrow{font-weight:bold;color:var(--muted)}
    .flow-row.info.active .flow-node,.flow-row.info.active .flow-arrow{border-color:var(--blue);color:#d8f3ff;text-shadow:0 0 8px #6fd3ff88}
    .flow-row.energy.active .flow-node,.flow-row.energy.active .flow-arrow{border-color:var(--yellow);color:#fff3c0;text-shadow:0 0 8px #ffd16688}
    .event-log{max-height:180px;overflow:auto;margin:0;padding-left:1.4rem;color:var(--muted);font-family:Consolas,monospace;font-size:.82rem}.event-log li{margin:.25rem 0}.event-log strong{color:var(--text)}
    .garden{overflow:hidden}.water-jet{position:absolute;right:130px;bottom:84px;width:285px;height:13px;opacity:0;pointer-events:none;transform:rotate(8deg);transform-origin:right center;border-radius:999px;background:repeating-linear-gradient(90deg,#bdefff 0 15px,#3eb5e8 15px 29px);box-shadow:0 0 14px #6fd3ff;z-index:5}
    .water-jet.active{opacity:.95;animation:waterFlow .32s linear infinite}.water-jet.blocked{opacity:.35;background:repeating-linear-gradient(90deg,#a9a9a9 0 12px,#555 12px 25px);box-shadow:none}
    .water-drop-zone{position:absolute;left:25%;bottom:70px;width:90px;height:42px;opacity:0;z-index:6;pointer-events:none}.water-drop-zone::before{content:"💧  💧  💧";font-size:22px;letter-spacing:5px}.water-drop-zone.active{opacity:1;animation:splashPulse .55s ease-in-out infinite alternate}
    .sensor-pulse{position:absolute;width:34px;height:34px;border:3px solid var(--blue);border-radius:50%;opacity:0;z-index:7;pointer-events:none}.sensor-pulse.humidity{left:36%;bottom:76px}.sensor-pulse.reservoir{right:69px;bottom:118px}.sensor-pulse.light{right:44px;top:48px}.sensor-pulse.active{animation:sensorPulse .75s ease-out 1}
    .plant{transition:transform 1.6s ease,filter 1.6s ease,color 1.6s ease}.plant.state-healthy{transform:translateY(-4px) scale(1.08);filter:saturate(1.25) brightness(1.1);color:#63db8d}.plant.state-stressed{transform:translateY(4px) scale(.98) rotate(-3deg);filter:saturate(.78);color:#9fbf65}.plant.state-wilted{transform:translateY(17px) scale(.86) rotate(-12deg);filter:saturate(.45) brightness(.72);color:#a58252}.plant.state-overwatered{transform:translateY(9px) scale(.95) rotate(7deg);filter:saturate(.55) hue-rotate(22deg);color:#d7c65c}
    .soil{transition:background 1.2s ease,box-shadow 1.2s ease,filter 1.2s ease}.soil.state-dry{background:repeating-linear-gradient(132deg,#6a4029 0 25px,#402719 26px 29px,#6a4029 30px 51px)!important;filter:brightness(1.13)}.soil.state-normal{background:linear-gradient(#704a31,#52331f)!important}.soil.state-saturated{background:linear-gradient(#34271f,#21352f)!important;box-shadow:inset 0 8px 0 #3eb5e855,0 0 20px #3eb5e833}.soil.watering{box-shadow:inset 0 0 0 4px #6fd3ff55,0 0 25px #3eb5e844}
    .pump{transition:transform .2s,box-shadow .25s,background .25s}.pump.state-starting{background:#705d19;box-shadow:0 0 14px #ffd166;animation:pumpStart .18s linear infinite}.pump.state-running{background:#196b46;box-shadow:0 0 18px #63db8d;animation:pumpRun .12s linear infinite}.pump.state-stopping{background:#69552b;box-shadow:0 0 10px #ffd166}.pump.state-blocked{background:#6a2e2e;box-shadow:0 0 14px #ff7b72}.tank.low{box-shadow:0 0 0 4px #ff7b7255}.tank.critical{animation:tankWarning .9s ease-in-out infinite alternate}.simulation-paused{opacity:.72}
    body.reduce-motion *{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}
    @media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}}
    @keyframes waterFlow{to{background-position:-29px 0}}@keyframes splashPulse{to{transform:translateY(-6px) scale(1.07)}}@keyframes sensorPulse{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(2.2)}}@keyframes pumpStart{50%{transform:translateX(2px)}}@keyframes pumpRun{25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}@keyframes tankWarning{to{box-shadow:0 0 0 5px #ff7b72aa}}
    @media(max-width:720px){.digital-twin-toolbar{grid-template-columns:1fr 1fr}.twin-actions{grid-column:1/-1}.water-jet{right:105px;width:205px}.flow-row{font-size:.78rem}.digital-twin-dashboard{grid-template-columns:1fr 1fr}}
    @media(max-width:460px){.digital-twin-toolbar,.digital-twin-dashboard{grid-template-columns:1fr}.twin-actions button{flex-basis:100%}.water-jet{right:90px;width:150px}.code-trace{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  const waterJet = document.createElement("div"); waterJet.className = "water-jet"; waterJet.setAttribute("aria-hidden", "true");
  const waterDrops = document.createElement("div"); waterDrops.className = "water-drop-zone"; waterDrops.setAttribute("aria-hidden", "true");
  const pulseHumidity = document.createElement("div"); pulseHumidity.className = "sensor-pulse humidity";
  const pulseReservoir = document.createElement("div"); pulseReservoir.className = "sensor-pulse reservoir";
  const pulseLight = document.createElement("div"); pulseLight.className = "sensor-pulse light";
  garden.append(waterJet, waterDrops, pulseHumidity, pulseReservoir, pulseLight);

  const toolbar = document.createElement("section");
  toolbar.className = "digital-twin-toolbar";
  toolbar.setAttribute("aria-label", "Commandes du jumeau numérique");
  toolbar.innerHTML = `
    <label>Scénario pédagogique<select id="twinScenario"><option value="dry">Sol très sec</option><option value="normal">Sol suffisamment humide</option><option value="empty">Réservoir vide</option><option value="bright">Luminosité forte</option><option value="overwatered">Excès d’eau</option><option value="sensorFault">Capteur d’humidité défaillant</option><option value="pipeBlocked">Tuyau bouché</option><option value="badThreshold">Seuil mal réglé</option></select></label>
    <label>Mode de commande<select id="twinMode"><option value="automatic">Automatique</option><option value="manual">Manuel sécurisé</option><option value="safety">Sécurité seule</option></select></label>
    <label>Vitesse du temps simulé<select id="twinSpeed"><option value="0.5">× 0,5</option><option value="1" selected>× 1</option><option value="2">× 2</option><option value="4">× 4</option></select></label>
    <label><span>Options d’accessibilité</span><span><input id="twinReducedMotion" type="checkbox"> Réduire les animations</span><span><input id="twinSound" type="checkbox"> Sons discrets</span></label>
    <div class="twin-actions"><button id="applyTwinScenario" type="button">Charger le scénario</button><button id="testTwinCycle" class="primary" type="button">💧 Tester un cycle</button><button id="toggleTwinClock" type="button">⏸ Mettre le temps en pause</button><button id="replayTwinCycle" type="button" disabled>↻ Rejouer le dernier essai</button></div>`;
  const sensors = simulationPanel.querySelector(".sensors");
  sensors.insertAdjacentElement("beforebegin", toolbar);

  const dashboard = document.createElement("section");
  dashboard.className = "digital-twin-dashboard";
  dashboard.innerHTML = `
    <article class="metric-card"><span>Humidité du sol</span><strong id="metricHumidity">—</strong><small id="metricHumidityRaw" class="sensor-detail"></small></article>
    <article class="metric-card"><span>Niveau du réservoir</span><strong id="metricReservoir">—</strong><small id="metricReservoirRaw" class="sensor-detail"></small></article>
    <article class="metric-card"><span>Luminosité</span><strong id="metricLight">—</strong><small id="metricLightRaw" class="sensor-detail"></small></article>
    <article class="metric-card"><span>État de la plante</span><strong id="metricPlant">—</strong><small class="sensor-detail">Réaction retardée par rapport au sol</small></article>
    <article class="metric-card"><span>Eau utilisée</span><strong id="metricWater">0 mL</strong><small class="sensor-detail">Estimation du modèle</small></article>
    <article class="metric-card"><span>Énergie estimée</span><strong id="metricEnergy">0 Wh</strong><small class="sensor-detail">Pompe basse tension simulée</small></article>
    <p class="adc-note"><strong>À retenir :</strong> les valeurs 0 à 1023 ne sont pas analogiques. Ce sont des valeurs numériques produites par le convertisseur analogique-numérique (ADC) de l’Arduino à partir d’une tension analogique.</p>`;
  sensors.insertAdjacentElement("afterend", dashboard);

  const decisionPanel = document.createElement("section");
  decisionPanel.className = "decision-panel waiting";
  decisionPanel.innerHTML = `<h3>Décision du système</h3><p id="twinDecision" aria-live="polite"></p><div id="twinConditions" class="condition-list"></div><div class="code-trace" aria-label="Étapes d’exécution du programme"><div class="trace-step" data-trace="0"><strong>1. Acquérir</strong><br><small>Lire les capteurs</small></div><div class="trace-step" data-trace="1"><strong>2. Convertir</strong><br><small>ADC puis calibration</small></div><div class="trace-step" data-trace="2"><strong>3. Comparer</strong><br><small>Tester les seuils</small></div><div class="trace-step" data-trace="3"><strong>4. Décider</strong><br><small>VRAI ou FAUX</small></div><div class="trace-step" data-trace="4"><strong>5. Commander</strong><br><small>D6 : LOW ou HIGH</small></div></div>`;
  dashboard.insertAdjacentElement("afterend", decisionPanel);

  const flowPanel = document.createElement("section");
  flowPanel.className = "flow-panel";
  flowPanel.innerHTML = `<h3>Flux du système</h3><div class="flow-grid"><div id="informationFlow" class="flow-row info"><span class="flow-label">Information</span><span class="flow-node">Capteurs</span><span class="flow-arrow">→</span><span class="flow-node">ADC / calibration</span><span class="flow-arrow">→</span><span class="flow-node">Arduino</span><span class="flow-arrow">→</span><span class="flow-node">Décision</span></div><div id="energyFlow" class="flow-row energy"><span class="flow-label">Énergie</span><span class="flow-node">Alimentation séparée</span><span class="flow-arrow">→</span><span class="flow-node">Relais D6</span><span class="flow-arrow">→</span><span class="flow-node">Pompe</span><span class="flow-arrow">→</span><span class="flow-node">Eau vers le sol</span></div></div>`;
  decisionPanel.insertAdjacentElement("afterend", flowPanel);

  const comparePanel = document.createElement("details");
  comparePanel.className = "compare-panel";
  comparePanel.innerHTML = `<summary>Comparer une mesure réelle et la simulation</summary><h3>Écart réel / simulé</h3><label>Valeur numérique mesurée par l’ADC (0 à 1023)<input id="realAdcValue" type="number" min="0" max="1023" placeholder="Ex. : 640"></label><button id="compareRealValue" type="button">Comparer</button><p id="realComparison" aria-live="polite"></p>`;
  flowPanel.insertAdjacentElement("afterend", comparePanel);

  const eventPanel = document.createElement("details");
  eventPanel.className = "event-panel";
  eventPanel.open = true;
  eventPanel.innerHTML = `<summary>Journal des événements</summary><h3>Chronologie du dernier essai</h3><ol id="twinEventLog" class="event-log"></ol>`;
  comparePanel.insertAdjacentElement("afterend", eventPanel);

  const decisionText = byId("twinDecision");
  const conditionsZone = byId("twinConditions");
  const eventLog = byId("twinEventLog");
  const infoFlow = byId("informationFlow");
  const energyFlow = byId("energyFlow");
  const tank = garden.querySelector(".tank");

  const model = {humidity:Number(humidity.value),reservoir:Number(reservoir.value),light:Number(light.value),soilMoisture:Number(humidity.value),plantMoisture:Number(humidity.value),pumpState:"off",cycleRemaining:0,phaseRemaining:0,waterTransit:0,waterUsedMl:0,energyWh:0,elapsedMinutes:0,speed:1,environmentRunning:true,fault:null,pipeBlocked:false,reducedMotion:window.matchMedia("(prefers-reduced-motion: reduce)").matches,sound:false,lastSnapshot:null,events:[],lastTick:performance.now(),overwaterExposure:0};

  const scenarios = {
    dry:{humidity:18,reservoir:75,light:55,fault:null,pipeBlocked:false,label:"Sol très sec"},normal:{humidity:48,reservoir:75,light:48,fault:null,pipeBlocked:false,label:"Sol suffisamment humide"},empty:{humidity:19,reservoir:4,light:50,fault:null,pipeBlocked:false,label:"Réservoir vide"},bright:{humidity:27,reservoir:70,light:95,fault:null,pipeBlocked:false,label:"Forte luminosité"},overwatered:{humidity:88,reservoir:55,light:35,fault:null,pipeBlocked:false,label:"Excès d’eau"},sensorFault:{humidity:30,reservoir:75,light:45,fault:"humidity",pipeBlocked:false,label:"Capteur d’humidité défaillant"},pipeBlocked:{humidity:20,reservoir:72,light:45,fault:null,pipeBlocked:true,label:"Tuyau bouché"},badThreshold:{humidity:60,reservoir:75,light:45,fault:null,pipeBlocked:false,label:"Seuil mal réglé",threshold:80}
  };

  function variableFromCode(name,fallback){const match=(codeEditor?.value||"").match(new RegExp(`${name}\\s*=\\s*(\\d+(?:\\.\\d+)?)`,`i`));return match?Number(match[1]):fallback;}
  function durationFromCode(){const match=(codeEditor?.value||"").match(/arroser\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);return match?clamp(Number(match[1]),.5,10):3;}
  function lightIsUsed(){return /lire_lumiere|seuil_lumiere/i.test(codeEditor?.value||"");}
  function stopThreshold(){const value=variableFromCode("seuil_arret",NaN);return Number.isFinite(value)?value:null;}

  function conditions(){const start=variableFromCode("seuil_humidite",Number(humidityThreshold.value));const reservoirMin=variableFromCode("seuil_reservoir",Number(reservoirThreshold.value));const lightMax=variableFromCode("seuil_lumiere",Number(lightThreshold.value));const mode=byId("twinMode").value;const sensorOk=!model.fault;const reservoirOk=model.reservoir>=reservoirMin;const dryEnough=model.humidity<start;const lightRequired=lightIsUsed();const lightOk=!lightRequired||model.light<lightMax;const request=mode==="manual"?true:mode==="safety"?reservoirOk:dryEnough&&lightOk;return {start,reservoirMin,lightMax,sensorOk,reservoirOk,dryEnough,lightRequired,lightOk,request,allowed:sensorOk&&reservoirOk&&request};}

  function addEvent(text,strong=false){const now=new Date().toLocaleTimeString("fr-FR",{hour12:false});model.events.unshift({time:now,text,strong});model.events=model.events.slice(0,30);eventLog.innerHTML=model.events.map(e=>`<li><span>${e.time}</span> — ${e.strong?`<strong>${e.text}</strong>`:e.text}</li>`).join("");}
  function beep(frequency=520,duration=.08){if(!model.sound)return;try{const AudioContext=window.AudioContext||window.webkitAudioContext;const ctx=new AudioContext();const oscillator=ctx.createOscillator();const gain=ctx.createGain();oscillator.frequency.value=frequency;gain.gain.value=.035;oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start();gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);oscillator.stop(ctx.currentTime+duration);}catch(error){}}
  function pulse(element){element.classList.remove("active");void element.offsetWidth;element.classList.add("active");}
  function traceStep(index,status="active"){document.querySelectorAll(".trace-step").forEach((step,i)=>{step.classList.toggle("active",i===index&&status==="active");if(i<index||status==="done"&&i===index)step.classList.add("done");else if(i>=index)step.classList.remove("done");});}
  function resetTrace(){document.querySelectorAll(".trace-step").forEach(step=>step.classList.remove("active","done"));}

  async function runTrace(){resetTrace();infoFlow.classList.remove("active");energyFlow.classList.remove("active");const delay=model.reducedMotion?20:260/model.speed;traceStep(0);infoFlow.classList.add("active");pulse(pulseHumidity);pulse(pulseReservoir);pulse(pulseLight);addEvent("Lecture des capteurs analogiques.");await new Promise(r=>setTimeout(r,delay));traceStep(1);addEvent("Conversion ADC : tension analogique → nombre numérique.");await new Promise(r=>setTimeout(r,delay));traceStep(2);addEvent("Comparaison des valeurs calibrées aux seuils.");await new Promise(r=>setTimeout(r,delay));traceStep(3);const c=conditions();addEvent(`Condition générale : ${c.allowed?"VRAIE":"FAUSSE"}.`,true);await new Promise(r=>setTimeout(r,delay));traceStep(4,"done");if(c.allowed)energyFlow.classList.add("active");}

  function setPumpState(state,reason=""){model.pumpState=state;pump.classList.remove("on","state-starting","state-running","state-stopping","state-blocked");const labels={off:"Pompe arrêtée",starting:"Démarrage…",running:"Pompe active",stopping:"Arrêt…",blocked:"Pompe bloquée"};if(state!=="off")pump.classList.add(`state-${state}`);pump.textContent=state==="running"?"POMPE ON":state==="blocked"?"BLOQUÉE":"POMPE";pumpBadge.textContent=labels[state]||state;pumpBadge.classList.toggle("gold",state==="starting"||state==="stopping");if(state==="blocked"&&reason)addEvent(`Blocage : ${reason}.`,true);}

  function startCycle(duration=3,source="test"){const c=conditions();if(!c.sensorOk){setPumpState("blocked","capteur défaillant");decisionText.innerHTML="<strong>Cycle refusé :</strong> la mesure n’est pas fiable.";beep(180,.16);return false;}if(!c.reservoirOk){setPumpState("blocked","réservoir insuffisant");decisionText.innerHTML="<strong>Sécurité :</strong> le niveau du réservoir empêche la marche à vide.";beep(180,.16);return false;}if(!c.request){setPumpState("blocked","conditions d’arrosage non réunies");decisionText.innerHTML="<strong>Pompe arrêtée :</strong> le besoin d’arrosage n’est pas confirmé.";return false;}model.lastSnapshot={humidity:model.humidity,reservoir:model.reservoir,light:model.light,duration,source,fault:model.fault,pipeBlocked:model.pipeBlocked};byId("replayTwinCycle").disabled=false;model.cycleRemaining=duration;model.phaseRemaining=.55;model.waterTransit=0;setPumpState("starting");addEvent(`Démarrage demandé (${source}, ${duration} s simulées).`,true);beep(430,.08);decisionText.innerHTML="<strong>Démarrage :</strong> D6 passe à HIGH. La pompe prépare la circulation de l’eau.";return true;}
  function stopCycle(reason="durée atteinte"){if(model.pumpState==="off")return;model.phaseRemaining=.45;setPumpState("stopping");waterJet.classList.remove("active","blocked");waterDrops.classList.remove("active");soil.classList.remove("watering");energyFlow.classList.remove("active");addEvent(`Arrêt demandé : ${reason}.`);beep(280,.08);}
  function classifyPlant(value){if(model.overwaterExposure>2.5||value>76)return {className:"state-overwatered",label:"Excès d’eau"};if(value<22)return {className:"state-wilted",label:"Très flétrie"};if(value<38)return {className:"state-stressed",label:"Stress hydrique"};return {className:"state-healthy",label:"Saine"};}
  function soilClass(value){return value<28?"state-dry":value>76?"state-saturated":"state-normal";}

  function renderConditions(){const c=conditions();conditionsZone.innerHTML=`<span class="condition-chip ${c.sensorOk?"ok":"no"}">${c.sensorOk?"✓":"✗"} Capteurs ${c.sensorOk?"valides":"défaillants"}</span><span class="condition-chip ${c.dryEnough?"ok":"no"}">${c.dryEnough?"✓":"✗"} Humidité ${round(model.humidity)} % &lt; ${c.start} %</span><span class="condition-chip ${c.reservoirOk?"ok":"no"}">${c.reservoirOk?"✓":"✗"} Réservoir ${round(model.reservoir)} % ≥ ${c.reservoirMin} %</span><span class="condition-chip ${c.lightRequired?(c.lightOk?"ok":"no"):"info"}">${c.lightRequired?(c.lightOk?"✓":"✗"):"ℹ"} Lumière ${c.lightRequired?`${round(model.light)} % &lt; ${c.lightMax} %`:"non utilisée par ce programme"}</span>`;decisionPanel.classList.remove("ready","blocked","waiting");decisionPanel.classList.add(c.allowed?"ready":c.sensorOk?"waiting":"blocked");if(model.pumpState==="off")decisionText.innerHTML=c.allowed?"<strong>Conditions réunies :</strong> le programme peut commander le relais.":"<strong>En attente :</strong> consulte les conditions ci-dessous.";}

  function render(){humidity.value=String(clamp(model.humidity,0,100));reservoir.value=String(clamp(model.reservoir,0,100));light.value=String(clamp(model.light,0,100));humidityValue.textContent=model.fault==="humidity"?"ERR":`${Math.round(model.humidity)} %`;reservoirValue.textContent=model.fault==="reservoir"?"ERR":`${Math.round(model.reservoir)} %`;lightValue.textContent=model.fault==="light"?"ERR":`${Math.round(model.light)} %`;water.style.height=`${clamp(model.reservoir,0,100)}%`;const rawHumidity=Math.round(clamp(model.humidity,0,100)/100*1023),rawReservoir=Math.round(clamp(model.reservoir,0,100)/100*1023),rawLight=Math.round(clamp(model.light,0,100)/100*1023);byId("metricHumidity").textContent=model.fault==="humidity"?"Erreur capteur":`${Math.round(model.humidity)} %`;byId("metricHumidityRaw").textContent=model.fault==="humidity"?"ADC : valeur incohérente":`ADC simulé : ${rawHumidity} / 1023`;byId("metricReservoir").textContent=`${Math.round(model.reservoir)} %`;byId("metricReservoirRaw").textContent=`ADC simulé : ${rawReservoir} / 1023`;byId("metricLight").textContent=`${Math.round(model.light)} %`;byId("metricLightRaw").textContent=`ADC simulé : ${rawLight} / 1023`;byId("metricWater").textContent=`${Math.round(model.waterUsedMl)} mL`;byId("metricEnergy").textContent=`${model.energyWh.toFixed(3)} Wh`;const plantStatus=classifyPlant(model.plantMoisture);plant.classList.remove("dry","state-healthy","state-stressed","state-wilted","state-overwatered");plant.classList.add(plantStatus.className);plant.setAttribute("aria-label",`État de la plante : ${plantStatus.label}`);byId("metricPlant").textContent=plantStatus.label;soil.classList.remove("state-dry","state-normal","state-saturated");soil.classList.add(soilClass(model.soilMoisture));tank?.classList.toggle("low",model.reservoir<25);tank?.classList.toggle("critical",model.reservoir<10);waterJet.classList.toggle("active",model.pumpState==="running"&&!model.pipeBlocked&&model.waterTransit>=1);waterJet.classList.toggle("blocked",model.pumpState==="running"&&model.pipeBlocked);waterDrops.classList.toggle("active",model.pumpState==="running"&&!model.pipeBlocked&&model.waterTransit>=1);soil.classList.toggle("watering",model.pumpState==="running"&&!model.pipeBlocked&&model.waterTransit>=1);renderConditions();}

  function tick(now){const elapsed=now-model.lastTick;if(elapsed<100){requestAnimationFrame(tick);return;}const realDt=Math.min(.5,elapsed/1000);model.lastTick=now;const dt=realDt*model.speed;if(model.environmentRunning){model.elapsedMinutes+=dt*5;if(model.pumpState==="off")model.humidity=clamp(model.humidity-(.004+.014*model.light/100)*dt,0,100);}if(model.pumpState==="starting"){model.phaseRemaining-=dt;if(model.phaseRemaining<=0){model.cycleRemaining=Math.max(.1,model.cycleRemaining);model.waterTransit=0;setPumpState("running");energyFlow.classList.add("active");addEvent("Relais fermé : la pompe fonctionne.",true);decisionText.innerHTML="<strong>Arrosage en cours :</strong> l’eau quitte le réservoir puis se diffuse progressivement dans le sol.";beep(590,.06);}}else if(model.pumpState==="running"){model.cycleRemaining-=dt;model.waterTransit=clamp(model.waterTransit+dt/.75,0,1);model.reservoir=clamp(model.reservoir-.72*dt,0,100);model.waterUsedMl+=12*dt;model.energyWh+=3.2*dt/3600;if(model.waterTransit>=1&&!model.pipeBlocked)model.humidity=clamp(model.humidity+1.8*dt,0,100);if(model.reservoir<=0){model.reservoir=0;stopCycle("réservoir vide");}const stopAt=stopThreshold();if(stopAt!==null&&model.humidity>=stopAt)stopCycle(`seuil d’arrêt ${stopAt} % atteint`);else if(model.cycleRemaining<=0)stopCycle("durée programmée atteinte");}else if(model.pumpState==="stopping"){model.phaseRemaining-=dt;if(model.phaseRemaining<=0){setPumpState("off");addEvent("D6 repasse à LOW : pompe arrêtée.",true);decisionText.innerHTML="<strong>Cycle terminé :</strong> observe le retard entre l’arrêt de la pompe, l’humidification du sol et la réaction de la plante.";}}model.soilMoisture+=(model.humidity-model.soilMoisture)*Math.min(1,.42*dt);model.plantMoisture+=(model.soilMoisture-model.plantMoisture)*Math.min(1,.075*dt);model.overwaterExposure=model.humidity>76?model.overwaterExposure+dt:Math.max(0,model.overwaterExposure-dt*.35);render();requestAnimationFrame(tick);}

  function loadScenario(key){const scenario=scenarios[key]||scenarios.dry;model.humidity=scenario.humidity;model.reservoir=scenario.reservoir;model.light=scenario.light;model.soilMoisture=scenario.humidity;model.plantMoisture=scenario.humidity;model.fault=scenario.fault;model.pipeBlocked=scenario.pipeBlocked;model.overwaterExposure=scenario.humidity>76?3:0;model.waterUsedMl=0;model.energyWh=0;setPumpState("off");if(scenario.threshold){humidityThreshold.value=String(scenario.threshold);if(codeEditor){const thresholdLine=/^seuil_humidite\s*=.*$/m;codeEditor.value=thresholdLine.test(codeEditor.value)?codeEditor.value.replace(thresholdLine,`seuil_humidite = ${scenario.threshold}`):`seuil_humidite = ${scenario.threshold}\n${codeEditor.value}`;codeEditor.dispatchEvent(new Event("input",{bubbles:true}));}}addEvent(`Scénario chargé : ${scenario.label}.`,true);resetTrace();infoFlow.classList.remove("active");energyFlow.classList.remove("active");render();}
  function syncFromSliders(){model.humidity=Number(humidity.value);model.reservoir=Number(reservoir.value);model.light=Number(light.value);model.fault=null;model.pipeBlocked=false;render();}

  runButton?.addEventListener("click",event=>{if(model.fault){event.preventDefault();event.stopImmediatePropagation();setPumpState("blocked","capteur défaillant");addEvent("Programme interrompu : mesure indisponible.",true);decisionText.innerHTML="<strong>Erreur :</strong> le système ne doit pas décider à partir d’une mesure invalide.";runTrace();render();return;}runTrace();setTimeout(()=>{if(!pump.classList.contains("on")&&model.pumpState==="off")renderConditions();},30);},true);
  const pumpObserver=new MutationObserver(()=>{if(pump.classList.contains("on")&&!["starting","running","stopping"].includes(model.pumpState)){pump.classList.remove("on");startCycle(durationFromCode(),"programme élève");}});pumpObserver.observe(pump,{attributes:true,attributeFilter:["class"]});
  [humidity,reservoir,light].forEach(control=>control.addEventListener("input",syncFromSliders));
  [humidityThreshold,reservoirThreshold,lightThreshold,codeEditor].filter(Boolean).forEach(control=>control.addEventListener("input",renderConditions));
  missionTitle&&new MutationObserver(()=>{setPumpState("off");resetTrace();renderConditions();}).observe(missionTitle,{childList:true,subtree:true});

  byId("applyTwinScenario").addEventListener("click",()=>loadScenario(byId("twinScenario").value));
  byId("testTwinCycle").addEventListener("click",()=>{runTrace();startCycle(durationFromCode(),"test du jumeau numérique");});
  byId("toggleTwinClock").addEventListener("click",event=>{model.environmentRunning=!model.environmentRunning;event.currentTarget.textContent=model.environmentRunning?"⏸ Mettre le temps en pause":"▶ Reprendre le temps";simulationPanel.classList.toggle("simulation-paused",!model.environmentRunning);addEvent(model.environmentRunning?"Temps simulé repris.":"Temps simulé mis en pause.");});
  byId("replayTwinCycle").addEventListener("click",()=>{if(!model.lastSnapshot)return;Object.assign(model,{humidity:model.lastSnapshot.humidity,reservoir:model.lastSnapshot.reservoir,light:model.lastSnapshot.light,fault:model.lastSnapshot.fault,pipeBlocked:model.lastSnapshot.pipeBlocked});model.soilMoisture=model.humidity;model.plantMoisture=model.humidity;runTrace();startCycle(model.lastSnapshot.duration,"relecture");});
  byId("twinSpeed").addEventListener("change",event=>{model.speed=Number(event.target.value);addEvent(`Vitesse réglée sur × ${model.speed}.`);});
  byId("twinReducedMotion").checked=model.reducedMotion;byId("twinReducedMotion").addEventListener("change",event=>{model.reducedMotion=event.target.checked;document.body.classList.toggle("reduce-motion",model.reducedMotion);});
  byId("twinSound").addEventListener("change",event=>{model.sound=event.target.checked;if(model.sound)beep(520,.06);});
  byId("compareRealValue").addEventListener("click",()=>{const raw=Number(byId("realAdcValue").value);const output=byId("realComparison");if(!Number.isFinite(raw)||raw<0||raw>1023){output.textContent="Saisis une valeur comprise entre 0 et 1023.";return;}const simplified=raw/1023*100;const gap=simplified-model.humidity;output.innerHTML=`Conversion linéaire pédagogique : <strong>${simplified.toFixed(1)} %</strong>. Écart avec la simulation : <strong>${gap>=0?"+":""}${gap.toFixed(1)} point(s)</strong>. Une vraie calibration utilise les mesures sèche et humide du capteur.`;});

  document.body.classList.toggle("reduce-motion",model.reducedMotion);
  addEvent("Jumeau numérique initialisé.",true);loadScenario("dry");requestAnimationFrame(tick);
})();
