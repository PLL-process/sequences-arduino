/* TechnoQuest — Partie 3 commune : « Lire l'algorithme coloré et son algorigramme ».
   Fournit aux orchestrateurs les blocs B (algorigramme ultra premium) et
   C (correspondance algorithme → forme → instruction C++), ainsi que la
   légende normalisée. Le bloc C explique le programme sans dévoiler le
   sketch complet de la correction. */
"use strict";
(() => {
  const el = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };
  const esc = value => String(value).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  window.TechnoQuestPartie3 = {
    /* B — l'algorigramme ultra premium de la séance. */
    algorigramme(sessionId) {
      const spec = window.TechnoQuestAlgorigramme?.spec(sessionId);
      const svg = window.TechnoQuestAlgorigramme?.render(sessionId);
      if (!spec || !svg) return null;
      const block = el("div", "fv-flow");
      block.innerHTML = `
        <h3 class="fv-sub">B. Suivre son algorigramme</h3>
        <div class="ag-wrap" data-glossaire-manuel>${svg}</div>
        <p class="ag-note">${esc(spec.note)}</p>
        <div class="fv-legende">
          <h4>Légende normalisée</h4>
          <ul>
            <li><i class="fv-l-oval"></i> Ovale : début ou fin</li>
            <li><i class="fv-l-rect"></i> Rectangle : traitement ou action</li>
            <li><i class="fv-l-io"></i> Parallélogramme : lecture, affichage ou sortie</li>
            <li><i class="fv-l-diam"></i> Losange : décision réelle du programme</li>
            <li><i class="fv-l-arrow">→</i> Flèche : ordre d'exécution</li>
            <li><i class="fv-l-arrow" style="color:#f472b6">↺</i> Flèche courbe : retour de la boucle loop()</li>
          </ul>
          <p class="fv-note">Les branches des losanges portent OUI / NON ou un libellé précis (RÉSERVOIR INSUFFISANT, SOL SEC…). La répétition de loop() est une flèche de retour : jamais un losange, jamais de décision fictive « carte toujours alimentée ? ».</p>
        </div>`;
      return block;
    },

    /* C — correspondance concise : action colorée → forme → instruction C++. */
    correspondance(sessionId) {
      const spec = window.TechnoQuestAlgorigramme?.spec(sessionId);
      if (!spec) return null;
      const block = el("div", "fv-correspondance", `
        <h3 class="fv-sub">C. Relier les actions au programme C++ Arduino</h3>
        <p class="fv-note" data-glossaire>Chaque action de l'algorithme coloré garde sa couleur dans l'algorigramme, puis devient une instruction du sketch. Ce panneau explique le lien : il ne donne pas la correction complète du programme.</p>
        <table class="fv-corr-table">
          <thead><tr><th scope="col">Algorithme coloré</th><th scope="col">Forme d'algorigramme</th><th scope="col">Instruction C++</th></tr></thead>
          <tbody>
            ${spec.correspondances.map(([action, color, forme, code]) => `
            <tr>
              <td><span class="fv-corr-action" style="--c:${color}">${esc(action)}</span></td>
              <td>${esc(forme)}</td>
              <td><code>${esc(code)}</code></td>
            </tr>`).join("")}
          </tbody>
        </table>`);
      return block;
    }
  };
})();
