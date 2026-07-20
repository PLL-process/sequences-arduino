/* TechnoQuest — sons discrets OPTIONNELS du jumeau numérique (v3).
   Synthèse Web Audio légère, sans aucun fichier : ronronnement grave de la
   pompe + gouttes d'eau espacées, uniquement pendant la démonstration et
   uniquement si l'élève a activé le son (OFF par défaut, préférence
   mémorisée). Aucune lecture automatique : l'activation est un clic. */
"use strict";
(() => {
  const PREFS_KEY = "technoquest-preferences-v1";
  const readPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; } };
  const writePrefs = patch => {
    const fresh = readPrefs();
    Object.assign(fresh, patch);
    localStorage.setItem(PREFS_KEY, JSON.stringify(fresh));
    return fresh;
  };

  const boot = () => {
    const stage = document.getElementById("twinStage");
    const header = document.querySelector(".fv-twin-frame-head");
    if (!stage || !header || header.querySelector(".fv-twin-son-btn")) return;

    let enabled = Boolean(readPrefs().sonsJumeau);
    let audio = null;   /* { context, master, pump, dripTimer } */

    const button = document.createElement("button");
    button.type = "button";
    button.className = "fv-twin-son-btn";
    const paint = () => {
      button.textContent = enabled ? "🔊" : "🔇";
      button.title = enabled ? "Couper les sons du jumeau" : "Activer les sons discrets du jumeau (pompe, gouttes)";
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute("aria-label", button.title);
    };
    paint();
    header.insertBefore(button, header.querySelector(".fv-twin-fullscreen-btn"));

    const running = () => stage.classList.contains("running");

    const buildAudio = () => {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);

      /* Ronronnement de pompe : deux oscillateurs graves + souffle filtré. */
      const pumpGain = context.createGain();
      pumpGain.gain.value = 0.5;
      pumpGain.connect(master);
      [52, 104].forEach((freq, i) => {
        const osc = context.createOscillator();
        osc.type = i ? "triangle" : "sine";
        osc.frequency.value = freq;
        const g = context.createGain();
        g.gain.value = i ? 0.06 : 0.12;
        osc.connect(g); g.connect(pumpGain);
        osc.start();
      });
      const noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const channel = noiseBuffer.getChannelData(0);
      for (let i = 0; i < channel.length; i += 1) channel[i] = (Math.random() * 2 - 1) * 0.25;
      const noise = context.createBufferSource();
      noise.buffer = noiseBuffer; noise.loop = true;
      const noiseFilter = context.createBiquadFilter();
      noiseFilter.type = "lowpass"; noiseFilter.frequency.value = 240;
      const noiseGain = context.createGain(); noiseGain.gain.value = 0.05;
      noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(pumpGain);
      noise.start();

      /* Goutte d'eau : petit blip sinusoïdal descendant. */
      const drip = () => {
        if (!enabled || !running()) return;
        const t = context.currentTime;
        const osc = context.createOscillator();
        const g = context.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1100 + Math.random() * 500, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.14);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.11, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.connect(g); g.connect(master);
        osc.start(t); osc.stop(t + 0.2);
      };
      const dripTimer = setInterval(() => { if (Math.random() < 0.75) drip(); }, 900);

      return { context, master, dripTimer };
    };

    const sync = () => {
      const wantSound = enabled && running();
      if (wantSound && !audio) audio = buildAudio();
      if (!audio) return;
      if (audio.context.state === "suspended" && wantSound) audio.context.resume();
      const target = wantSound ? 0.9 : 0;
      audio.master.gain.cancelScheduledValues(audio.context.currentTime);
      audio.master.gain.linearRampToValueAtTime(target, audio.context.currentTime + 0.35);
    };

    button.addEventListener("click", () => {
      enabled = !enabled;
      writePrefs({ sonsJumeau: enabled });
      paint();
      sync();
    });

    new MutationObserver(sync).observe(stage, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("pagehide", () => { if (audio) { clearInterval(audio.dripTimer); audio.context.close().catch(() => {}); } });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0));
  else setTimeout(boot, 0);
})();
