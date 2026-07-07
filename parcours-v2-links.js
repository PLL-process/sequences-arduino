"use strict";
(() => {
  const links = [...document.querySelectorAll('a[href="seance-7.html"],a[href="seance-8.html"]')];
  links.forEach(link => {
    if (link.getAttribute("href") === "seance-7.html") link.setAttribute("href", "seance-7-v2.html");
    if (link.getAttribute("href") === "seance-8.html") link.setAttribute("href", "seance-8-v2.html");
  });
})();
