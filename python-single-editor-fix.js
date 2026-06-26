/* Fusionne l'éditeur et l'aperçu coloré en une seule zone de code modifiable. */
"use strict";

(() => {
  const code = document.getElementById("code");
  const highlight = document.getElementById("pythonHighlight");
  const previewBox = document.querySelector(".python-preview-box");
  if (!code || !highlight || !previewBox || document.getElementById("pythonUnifiedEditor")) return;

  const style = document.createElement("style");
  style.id = "technoquest-python-single-editor-styles";
  style.textContent = `
    .python-editor-heading{display:flex;justify-content:space-between;align-items:center;gap:.8rem;flex-wrap:wrap;margin:.75rem 0 .45rem}
    .python-editor-heading h4{margin:0;color:var(--text)}
    .python-editor-heading small{color:var(--muted)}
    .python-unified-editor{position:relative;height:330px;min-height:280px;max-height:680px;margin:0;border:2px solid #2f6553;border-radius:12px;background:#020c09;overflow:hidden;resize:vertical;box-shadow:inset 0 0 0 1px #081d16}
    .python-unified-editor #pythonHighlight,.python-unified-editor #code{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:1rem;box-sizing:border-box;border:0;border-radius:0;font:1rem/1.55 Consolas,"Courier New",monospace;white-space:pre;overflow:auto;tab-size:4}
    .python-unified-editor #pythonHighlight{z-index:1;min-height:0;background:#020c09;color:#eafff3;pointer-events:none;scrollbar-width:none}
    .python-unified-editor #pythonHighlight::-webkit-scrollbar{display:none}
    .python-unified-editor #code{z-index:2;min-height:0!important;background:transparent!important;color:transparent!important;-webkit-text-fill-color:transparent!important;caret-color:#ffffff!important;resize:none;outline:none;overflow:auto}
    .python-unified-editor #code::selection{background:#3b82f680}
    .python-unified-editor:focus-within{border-color:var(--yellow);box-shadow:0 0 0 3px #ffd16633}
    .python-unified-tools{display:flex;gap:.55rem;flex-wrap:wrap;margin:.65rem 0}
    .python-unified-tools button{flex:1 1 220px}
    .python-preview-box{display:none!important}
    @media(max-width:650px){.python-unified-editor{height:350px}.python-unified-editor #pythonHighlight,.python-unified-editor #code{font-size:.9rem;padding:.8rem}}
  `;
  document.head.appendChild(style);

  const heading = document.createElement("div");
  heading.className = "python-editor-heading";
  heading.innerHTML = `<h4>Programme Python pédagogique — éditeur coloré</h4><small>Écris directement dans cette zone : les couleurs se mettent à jour automatiquement.</small>`;

  const editor = document.createElement("div");
  editor.id = "pythonUnifiedEditor";
  editor.className = "python-unified-editor";
  editor.setAttribute("role", "group");
  editor.setAttribute("aria-label", "Éditeur Python pédagogique coloré");

  const tools = previewBox.querySelector(".python-tools");
  const restoreButton = document.getElementById("restoreMissionCode");
  const toggleButton = document.getElementById("togglePythonPreview");

  code.parentNode.insertBefore(heading, code);
  heading.insertAdjacentElement("afterend", editor);
  editor.append(highlight, code);

  const unifiedTools = document.createElement("div");
  unifiedTools.className = "python-unified-tools";
  if (restoreButton) unifiedTools.appendChild(restoreButton);
  editor.insertAdjacentElement("afterend", unifiedTools);

  if (toggleButton) toggleButton.remove();
  if (tools && !tools.children.length) tools.remove();
  previewBox.remove();

  code.setAttribute("wrap", "off");
  code.setAttribute("spellcheck", "false");
  code.setAttribute("autocapitalize", "off");
  code.setAttribute("autocomplete", "off");
  code.setAttribute("aria-label", "Saisir le programme Python de la mission");

  function syncScroll() {
    highlight.scrollTop = code.scrollTop;
    highlight.scrollLeft = code.scrollLeft;
  }

  function refreshSoon() {
    window.setTimeout(() => {
      code.dispatchEvent(new Event("input", {bubbles:true}));
      syncScroll();
    }, 0);
  }

  code.addEventListener("scroll", syncScroll, {passive:true});
  code.addEventListener("input", syncScroll);
  restoreButton?.addEventListener("click", refreshSoon);

  const missionTitle = document.getElementById("missionTitle");
  if (missionTitle) new MutationObserver(refreshSoon).observe(missionTitle, {childList:true, subtree:true});

  refreshSoon();
})();
