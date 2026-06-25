/* Transforme la légende du visuel 18 en ressource explicative. */
"use strict";

(() => {
  const oldText = "Relier la valeur analogique à une comparaison, puis à la commande de la pompe.";
  const newText = "De la mesure à l’action : la valeur mesurée par le capteur est comparée à un seuil. Cette comparaison conduit à une décision logique, puis à la commande de la pompe. Ici, 28 % est inférieur à 35 % : la condition est vraie et la pompe est activée.";

  const replaceCaption = root => {
    root.querySelectorAll?.("figcaption, #visualLightboxContent p").forEach(element => {
      if (element.textContent.includes(oldText)) {
        const strong = element.querySelector("strong");
        if (strong) element.innerHTML = `<strong>${strong.textContent}</strong> — ${newText}`;
        else element.textContent = newText;
      }
    });
  };

  replaceCaption(document);
  new MutationObserver(() => replaceCaption(document)).observe(document.body, {childList:true, subtree:true});
})();
