/* Coloration C++ Arduino de l’éditeur de la séance 1. */
"use strict";
(() => {
  if (Number(document.body.dataset.session || 0) !== 1) return;
  const editor = document.getElementById("codeEditor");
  const output = document.getElementById("codeHighlight");
  if (!editor || !output) return;

  const escapeHtml = value => String(value).replace(/[&<>]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]));
  const tokenRegex = /(<[A-Za-z_][\w.\/-]*>|#[A-Za-z_]\w*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b(?:const|int|void|long|float|double|bool|char|byte|unsigned|signed|return|if|else|for|while|do|switch|case|break|continue)\b|\b(?:LOW|HIGH|OUTPUT|INPUT|INPUT_PULLUP|A0|A1|A2|A3|A4|A5)\b|\b(?:setup|loop|pinMode|analogRead|analogWrite|digitalRead|digitalWrite|delay|millis)\b|\b(?:Serial|begin|print|println|available|read)\b|==|!=|<=|>=|&&|\|\||\+\+|--|[=+\-*\/%<>!&|.;,:(){}\[\]])/g;

  const fragment = source => {
    let html = "", last = 0, match;
    while ((match = tokenRegex.exec(source))) {
      html += escapeHtml(source.slice(last, match.index));
      const value = match[0];
      let className = "py-operator";
      if (value.startsWith("#")) className = "cpp-preprocessor";
      else if (/^<.*>$/.test(value)) className = "cpp-header";
      else if (/^["']/.test(value)) className = "py-string";
      else if (/^\d/.test(value)) className = "py-number";
      else if (/^(const|int|void|long|float|double|bool|char|byte|unsigned|signed|return|if|else|for|while|do|switch|case|break|continue)$/.test(value)) className = "py-keyword";
      else if (/^(LOW|HIGH|OUTPUT|INPUT|INPUT_PULLUP|A0|A1|A2|A3|A4|A5)$/.test(value)) className = "py-keyword";
      else if (/^(setup|loop|pinMode|analogRead|analogWrite|digitalRead|digitalWrite|delay|millis)$/.test(value)) className = /^(analogRead|digitalRead)$/.test(value) ? "py-reader" : "py-action";
      else if (/^(Serial|begin|print|println|available|read)$/.test(value)) className = "py-output";
      html += `<span class="${className}">${escapeHtml(value)}</span>`;
      last = match.index + value.length;
    }
    return html + escapeHtml(source.slice(last));
  };

  const line = source => {
    let quote = null, escaped = false, commentIndex = -1;
    for (let i = 0; i < source.length - 1; i += 1) {
      const char = source[i];
      if (escaped) { escaped = false; continue; }
      if (char === "\\") { escaped = true; continue; }
      if (quote) { if (char === quote) quote = null; continue; }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === "/" && source[i + 1] === "/") { commentIndex = i; break; }
    }
    const code = commentIndex >= 0 ? source.slice(0, commentIndex) : source;
    const comment = commentIndex >= 0 ? source.slice(commentIndex) : "";
    let commentClass = "py-comment";
    const normalized = comment.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (normalized.includes("ACQUERIR") || normalized.includes("LIRE")) commentClass = "py-comment py-comment-acquire";
    else if (normalized.includes("MEMORISER") || normalized.includes("STOCKER")) commentClass = "py-comment py-comment-memory";
    else if (normalized.includes("COMMUNIQUER") || normalized.includes("AFFICHER")) commentClass = "py-comment py-comment-output";
    else if (normalized.includes("SECURISER") || normalized.includes("ARRETEE") || normalized.includes("RELAIS AU REPOS")) commentClass = "py-comment py-comment-safety";
    return fragment(code) + (comment ? `<span class="${commentClass}">${escapeHtml(comment)}</span>` : "");
  };

  const render = () => {
    output.innerHTML = editor.value.split("\n").map(line).join("\n") || '<span class="py-comment">// Commence ton programme ici.</span>';
    output.scrollTop = editor.scrollTop;
    output.scrollLeft = editor.scrollLeft;
  };
  editor.addEventListener("input", render);
  editor.addEventListener("scroll", render, { passive: true });
  render();
})();
