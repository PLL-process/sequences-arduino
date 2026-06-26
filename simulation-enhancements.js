/* Mode stable : charge uniquement les aides indispensables. */
"use strict";

(() => {
  function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    script.onerror = () => console.error("TechnoQuest : chargement impossible", src);
    document.body.appendChild(script);
  }

  loadScript("python-learning-aid.js?v=28", () => {
    loadScript("python-single-editor-fix.js?v=28", () => {
      loadScript("stable-intro-visuals.js?v=28", () => {
        loadScript("parcours-hub-link.js?v=28", () => {
          document.documentElement.classList.add("technoquest-stable");
        });
      });
    });
  });
})();
