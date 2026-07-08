"use strict";

(() => {
  const selector = ".hub-hero-visual img,.hub-card-image,.realSessionVisual img";
  let overlay;
  let overlayImage;
  let previousFocus;

  function ensureOverlay() {
    if (overlay) return;

    const style = document.createElement("style");
    style.textContent = `
      .image-lightbox-open{overflow:hidden}
      .image-lightbox{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:clamp(.75rem,2vw,1.5rem);background:rgba(2,8,18,.94);backdrop-filter:blur(10px)}
      .image-lightbox.open{display:flex}
      .image-lightbox img{display:block;max-width:min(100%,96vw);max-height:92vh;width:auto;height:auto;object-fit:contain;transform:scale(var(--lightbox-zoom,1));transform-origin:center;border-radius:12px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.55)}
      .image-lightbox-close{position:fixed;top:clamp(.75rem,2vw,1.35rem);right:clamp(.75rem,2vw,1.35rem);display:grid;place-items:center;width:46px;height:46px;border:1px solid rgba(255,255,255,.45);border-radius:999px;background:rgba(4,12,24,.76);color:#fff;font:900 1.5rem/1 system-ui,sans-serif;cursor:pointer}
      .image-lightbox-close:hover,.image-lightbox-close:focus{outline:3px solid rgba(34,211,238,.7);outline-offset:3px;background:#0b2235}
      ${selector}{cursor:zoom-in}
    `;
    document.head.appendChild(style);

    overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image agrandie");
    overlay.innerHTML = `<button class="image-lightbox-close" type="button" aria-label="Fermer l’image agrandie">×</button><img alt="">`;
    document.body.appendChild(overlay);

    overlayImage = overlay.querySelector("img");
    overlay.querySelector("button").addEventListener("click", close);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) close();
    });
  }

  function open(img) {
    ensureOverlay();
    previousFocus = document.activeElement;
    overlayImage.src = img.currentSrc || img.src;
    overlayImage.alt = img.alt || img.closest("[aria-label]")?.getAttribute("aria-label") || "Image agrandie";
    overlayImage.style.setProperty("--lightbox-zoom", /seance-0[2-8]-reelle/i.test(overlayImage.src) ? "2.05" : "1");
    overlay.classList.add("open");
    document.body.classList.add("image-lightbox-open");
    overlay.querySelector("button").focus();
  }

  function close() {
    if (!overlay?.classList.contains("open")) return;
    overlay.classList.remove("open");
    overlayImage.removeAttribute("src");
    document.body.classList.remove("image-lightbox-open");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }

  document.addEventListener("click", event => {
    const img = event.target.closest(selector);
    if (!img) return;
    event.preventDefault();
    open(img);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(selector)) {
      event.preventDefault();
      open(event.target);
    }
  });

  function activateImages(root = document) {
    root.querySelectorAll(selector).forEach(img => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", img.alt ? `${img.alt} — agrandir` : "Agrandir l’image");
    });
  }

  activateImages();
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) activateImages(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
