/* TechnoQuest — adaptation compacte de la palette d’actions et des libellés du mode Mission. */
"use strict";

(() => {
  /* Décrit les familles de commandes sans dupliquer les données pédagogiques existantes. */
  const GROUPS = [
    {
      id: "structure",
      icon: "⌘",
      label: "Structure",
      methods: ["include", "const-int", "setup", "loop"]
    },
    {
      id: "capteurs",
      icon: "◉",
      label: "Capteurs et broches",
      methods: ["analogread", "pinmode-output", "digitalwrite-low"]
    },
    {
      id: "communication",
      icon: "▤",
      label: "Communication et temps",
      methods: ["serial-begin", "serial-print", "serial-println", "delay"]
    }
  ];

  /* Attend la création dynamique du mode Mission et de la palette originale. */
  function waitForMission(attempt = 0) {
    /* Récupère la racine du mode Mission. */
    const root = document.getElementById("missionModeRoot");
    /* Récupère le rail des commandes. */
    const rail = root?.querySelector(".mission-command-rail");
    /* Récupère la liste originale des méthodes. */
    const list = rail?.querySelector(".mission-command-list");

    /* Lance l’adaptation dès que tous les éléments existent. */
    if (root && rail && list) {
      /* Applique la mise en page compacte. */
      installCompactMission(root, rail, list);
      /* Termine l’attente. */
      return;
    }

    /* Réessaie pendant quelques secondes si l’interface est encore en construction. */
    if (attempt < 100) window.setTimeout(() => waitForMission(attempt + 1), 100);
  }

  /* Regroupe la palette, compacte les textes et ajoute le raccourci d’exécution. */
  function installCompactMission(root, rail, list) {
    /* Évite une seconde transformation lors d’un rechargement partiel. */
    if (root.dataset.compactMissionReady === "true") return;
    /* Mémorise que la transformation est terminée. */
    root.dataset.compactMissionReady = "true";
    /* Ajoute une classe générale utilisable par les styles futurs. */
    root.classList.add("mission-compact-layout");

    /* Récupère tous les boutons créés par le catalogue existant. */
    const buttons = Array.from(list.querySelectorAll(".mission-command-chip"));
    /* Construit une table permettant de retrouver rapidement chaque bouton. */
    const buttonByMethod = new Map(buttons.map(button => [button.dataset.methodId, button]));

    /* Crée le titre de la palette basse. */
    const paletteTitle = document.createElement("div");
    /* Applique la classe visuelle du titre. */
    paletteTitle.className = "mission-command-palette-title";
    /* Ajoute le titre et son explication courte. */
    paletteTitle.innerHTML = "<strong>Palette d’actions Arduino</strong><span>Cliquez : insérer le code et ouvrir sa fiche méthode.</span>";
    /* Place le titre au début du rail. */
    rail.insertBefore(paletteTitle, rail.firstChild);

    /* Vide la liste afin de la reconstruire par familles. */
    list.innerHTML = "";

    /* Construit chaque groupe dans l’ordre pédagogique choisi. */
    GROUPS.forEach(group => {
      /* Crée le conteneur de la famille. */
      const section = document.createElement("section");
      /* Applique la classe commune. */
      section.className = "mission-command-group";
      /* Mémorise l’identifiant de la famille. */
      section.dataset.commandGroup = group.id;

      /* Crée le titre de la famille. */
      const heading = document.createElement("h3");
      /* Applique la classe visuelle du titre. */
      heading.className = "mission-command-group-title";
      /* Ajoute l’icône et le nom de la famille. */
      heading.textContent = `${group.icon} ${group.label}`;
      /* Ajoute le titre au groupe. */
      section.appendChild(heading);

      /* Crée la grille interne des snippets. */
      const items = document.createElement("div");
      /* Applique la classe de grille. */
      items.className = "mission-command-group-items";

      /* Déplace dans la grille chaque commande appartenant à la famille. */
      group.methods.forEach(methodId => {
        /* Retrouve le bouton original afin de conserver tous ses gestionnaires. */
        const button = buttonByMethod.get(methodId);
        /* Ignore une méthode absente de cette séance. */
        if (!button) return;
        /* Ajoute le bouton sans le recréer. */
        items.appendChild(button);
      });

      /* Ajoute la grille au groupe. */
      section.appendChild(items);
      /* Ajoute le groupe à la liste défilante. */
      list.appendChild(section);
    });

    /* Place les éventuelles méthodes futures dans un groupe complémentaire. */
    const remainingButtons = buttons.filter(button => !button.closest(".mission-command-group"));
    /* Crée le groupe complémentaire seulement s’il est nécessaire. */
    if (remainingButtons.length) {
      /* Crée le conteneur. */
      const section = document.createElement("section");
      /* Applique la classe commune. */
      section.className = "mission-command-group";
      /* Ajoute un titre générique. */
      section.innerHTML = '<h3 class="mission-command-group-title">＋ Autres commandes</h3><div class="mission-command-group-items"></div>';
      /* Récupère la grille créée. */
      const items = section.querySelector(".mission-command-group-items");
      /* Déplace toutes les commandes restantes. */
      remainingButtons.forEach(button => items.appendChild(button));
      /* Ajoute le groupe à la liste. */
      list.appendChild(section);
    }

    /* Ouvre également la fiche méthode lors d’un clic, comme dans CodeCombat. */
    rail.addEventListener("click", event => {
      /* Recherche le bouton de méthode éventuellement cliqué. */
      const button = event.target.closest(".mission-command-chip");
      /* Ignore les clics sur les flèches ou les espaces du rail. */
      if (!button) return;
      /* Déclenche le gestionnaire de survol déjà responsable de la fiche. */
      button.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false }));
    });

    /* Raccourcit le titre du panneau de gauche afin de réduire sa hauteur. */
    const twinHeading = root.querySelector(".mission-left > .mission-panel:first-of-type .mission-panel-head h2");
    /* Applique le nouveau titre lorsqu’il existe. */
    if (twinHeading) twinHeading.textContent = "Jumeau numérique";

    /* Raccourcit également son explication. */
    const twinDescription = root.querySelector(".mission-left > .mission-panel:first-of-type .mission-panel-head p");
    /* Applique le texte compact lorsqu’il existe. */
    if (twinDescription) twinDescription.textContent = "Observer le système pendant l’exécution du programme.";

    /* Rend le bouton principal plus proche du modèle CodeCombat. */
    const runButton = document.getElementById("missionRun");
    /* Change le libellé tout en conservant le comportement existant. */
    if (runButton) {
      /* Affiche le raccourci directement dans le bouton. */
      runButton.textContent = "EXÉCUTER LA SIMULATION  ⇧↵";
      /* Décrit le raccourci au survol. */
      runButton.title = "Exécuter avec Maj + Entrée";
    }

    /* Ajoute le raccourci Maj + Entrée sans modifier le moteur de simulation. */
    document.addEventListener("keydown", event => {
      /* Ignore toute autre combinaison. */
      if (!(event.shiftKey && event.key === "Enter")) return;
      /* Ignore le raccourci lorsque le mode Mission est masqué. */
      if (root.classList.contains("mission-hidden")) return;
      /* Empêche l’ajout d’une ligne dans l’éditeur. */
      event.preventDefault();
      /* Déclenche le bouton existant afin de conserver toutes les validations. */
      runButton?.click();
    });
  }

  /* Démarre après la construction du document. */
  if (document.readyState === "loading") {
    /* Attend DOMContentLoaded lorsque la page est encore en cours de lecture. */
    document.addEventListener("DOMContentLoaded", () => waitForMission());
  } else {
    /* Lance immédiatement l’attente lorsque le document est prêt. */
    waitForMission();
  }
})();
