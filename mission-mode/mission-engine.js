/* TechnoQuest Mission Mode - moteur d'exécution pédagogique déterministe. */
"use strict";

(() => {
  const host = typeof window !== "undefined" ? window : globalThis;
  const SETUP_STATES = [
    { id: "serialBegin", lineStep: "serialBegin", label: "setup() - activation du Moniteur Série", signal: "serial", console: "Moniteur Série prêt à 9600 bauds." },
    { id: "pinMode", lineStep: "pinMode", label: "setup() - D6 configurée en sortie", signal: "d6", console: "D6 devient une sortie de commande." },
    { id: "safeLowSetup", lineStep: "safeLowSetup", label: "setup() - pompe maintenue arrêtée", signal: "tbt", console: "Relais au repos : pompe arrêtée." }
  ];

  const LOOP_STATES = [
    { id: "readA0", lineStep: "readHumidity", label: "loop() - lecture de A0 humidité", signal: "a0", sensor: "humidity", value: 642, console: "A0 humidité = 642" },
    { id: "readA1", lineStep: "readLight", label: "loop() - lecture de A1 lumière", signal: "a1", sensor: "light", value: 518, console: "A1 lumière = 518" },
    { id: "readA2", lineStep: "readWater", label: "loop() - lecture de A2 niveau d'eau", signal: "a2", sensor: "water", value: 781, console: "A2 niveau d'eau = 781" },
    { id: "serialHumidity", lineStep: "showHumidity", label: "loop() - affichage de l'humidité", signal: "serial", console: "Humidité : 642" },
    { id: "serialLight", lineStep: "showLight", label: "loop() - affichage de la lumière", signal: "serial", console: "Lumière : 518" },
    { id: "serialWater", lineStep: "showWater", label: "loop() - affichage du niveau d'eau", signal: "serial", console: "Niveau d'eau : 781" },
    { id: "delay", lineStep: "delay", label: "loop() - temporisation de 1000 ms", signal: "water", console: "Attente 1 seconde, puis retour au début de loop()." }
  ];

  const STATES = [...SETUP_STATES, ...LOOP_STATES];

  function createEngine({ onState, onStop, setupStates = SETUP_STATES, loopStates = LOOP_STATES } = {}) {
    let index = 0;
    let timer = 0;
    let running = false;
    let paused = false;
    let setupDone = false;
    let sequence = setupStates;
    let loopCycle = 0;
    let speed = "normal";
    const durations = { normal: 1150, slow: 2100 };

    const currentState = () => sequence[index % sequence.length];

    const loopNumber = () => {
      if (!setupDone) return 0;
      return loopCycle;
    };

    const emit = action => {
      const state = currentState();
      onState?.({
        ...state,
        action,
        phase: setupDone ? "loop" : "setup",
        index,
        loopIndex: setupDone ? index % loopStates.length : -1,
        loopNumber: loopNumber(),
        loopPercent: setupDone ? Math.round(((index % loopStates.length) / loopStates.length) * 100) : 0,
        running,
        paused,
        speed
      });
    };

    const clearTimer = () => {
      if (timer) host.clearTimeout(timer);
      timer = 0;
    };

    const advance = () => {
      if (!setupDone && index >= setupStates.length - 1) {
        setupDone = true;
        sequence = loopStates;
        index = 0;
        loopCycle = 1;
        return;
      }
      if (setupDone && index >= loopStates.length - 1) {
        index = 0;
        loopCycle += 1;
        return;
      }
      index = (index + 1) % sequence.length;
    };

    const schedule = () => {
      clearTimer();
      if (!running || paused) return;
      timer = host.setTimeout(() => {
        advance();
        emit("state");
        schedule();
      }, durations[speed]);
    };

    return {
      run() {
        index = 0;
        setupDone = false;
        sequence = setupStates;
        loopCycle = 0;
        running = true;
        paused = false;
        emit("start");
        schedule();
      },
      pause() {
        if (!running) return;
        paused = true;
        clearTimer();
        emit("pause");
      },
      resume() {
        if (!running) return;
        paused = false;
        emit("resume");
        schedule();
      },
      stop() {
        running = false;
        paused = false;
        setupDone = false;
        sequence = setupStates;
        loopCycle = 0;
        index = 0;
        clearTimer();
        onStop?.();
      },
      step() {
        clearTimer();
        running = false;
        paused = false;
        emit("step");
        advance();
      },
      setSpeed(nextSpeed) {
        speed = nextSpeed === "slow" ? "slow" : "normal";
        if (running && !paused) schedule();
      },
      isRunning() {
        return running;
      }
    };
  }

  const api = {
    SETUP_STATES,
    LOOP_STATES,
    STATES,
    createEngine
  };

  if (typeof window !== "undefined") window.TechnoQuestMissionEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
