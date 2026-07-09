/*
 * TechnoQuest — garde-fou d’affichage des éditeurs.
 *
 * Sur certains Chrome Android, un textarea transparent placé au-dessus d’une couche
 * de coloration peut masquer visuellement cette couche lorsqu’il reçoit le focus.
 * Ce script conserve la coloration au repos et affiche le texte natif pendant la saisie tactile.
 */
"use strict";

(() => {
  // Détecter les appareils tactiles ou à pointeur grossier.
  const touchDevice = window.matchMedia?.("(pointer: coarse)")?.matches || navigator.maxTouchPoints > 0;

  // Retrouver l’enveloppe graphique d’un éditeur.
  function editorShell(editor) {
    return editor.closest(".fusion-editor-shell,.editor-wrap,.code-harmony-textarea-shell");
  }

  // Retrouver la couche colorée associée au textarea.
  function editorHighlight(editor, shell) {
    if (!shell) return null;
    if (shell.classList.contains("fusion-editor-shell")) return shell.querySelector("#codeHighlight,.fusion-code-highlight");
    if (shell.classList.contains("editor-wrap")) return shell.querySelector("pre");
    return shell.querySelector(".code-harmony-live-highlight,pre");
  }

  // Demander aux moteurs déjà présents de reconstruire leur couche colorée.
  function requestRefresh(editor) {
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    editor.dispatchEvent(new Event("scroll", { bubbles: false }));
  }

  // Vérifier qu’un texte non vide possède bien une représentation visible.
  function verifyEditor(editor) {
    const shell = editorShell(editor);
    const highlight = editorHighlight(editor, shell);
    if (!shell || !highlight || !editor.value.trim()) return;

    // Retirer un éventuel mode de secours ancien avant le nouveau contrôle.
    if (highlight.textContent.trim()) {
      shell.classList.remove("editor-native-fallback");
      return;
    }

    // Une première tentative de rafraîchissement suffit souvent après un déplacement dans le DOM.
    requestRefresh(editor);

    window.requestAnimationFrame(() => {
      if (!highlight.textContent.trim() && editor.value.trim()) {
        shell.classList.add("editor-native-fallback");
      }
    });
  }

  // Ajouter le comportement tactile sans perturber les ordinateurs à souris.
  function bindEditor(editor) {
    if (editor.dataset.visibilityGuardBound === "true") return;
    const shell = editorShell(editor);
    if (!shell) return;

    editor.dataset.visibilityGuardBound = "true";

    if (touchDevice) {
      // Afficher le texte natif juste avant que Chrome ne crée sa couche de composition tactile.
      editor.addEventListener("pointerdown", () => shell.classList.add("editor-native-mode"), { passive: true });
      editor.addEventListener("focus", () => shell.classList.add("editor-native-mode"));

      // Restaurer les couleurs dès que la saisie est terminée.
      editor.addEventListener("blur", () => {
        window.setTimeout(() => {
          shell.classList.remove("editor-native-mode");
          verifyEditor(editor);
        }, 40);
      });
    }

    // Contrôler l’affichage après toute modification ou restauration de squelette.
    editor.addEventListener("input", () => window.requestAnimationFrame(() => verifyEditor(editor)));

    // Ne pas laisser le focus automatique initial masquer le code sur une tablette.
    if (touchDevice && document.activeElement === editor) editor.blur();

    window.setTimeout(() => verifyEditor(editor), 80);
    window.setTimeout(() => verifyEditor(editor), 420);
  }

  // Scanner les trois familles d’éditeurs utilisées dans les pages et le Mode Mission.
  function scan(root = document) {
    root.querySelectorAll?.(
      ".fusion-editor-shell textarea, .editor-wrap textarea, .code-harmony-textarea-shell textarea"
    ).forEach(bindEditor);
  }

  // Initialiser après la construction des pages générées en JavaScript.
  function initialize() {
    scan(document);

    // Le Mode Mission déplace l’éditeur existant dans un autre conteneur : rescanner les ajouts.
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.("textarea")) bindEditor(node);
          scan(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Recontrôler après une rotation d’écran ou un retour dans l’onglet.
    window.addEventListener("resize", () => scan(document), { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) window.setTimeout(() => scan(document), 60);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
