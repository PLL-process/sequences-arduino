/* Ajoute un exemple ADC rigoureux et un glossaire bilingue des sigles. */
"use strict";

(() => {
  const adcNote = document.querySelector(".adc-note");
  if (adcNote) {
    adcNote.classList.add("adc-learning-card");
    adcNote.innerHTML = `
      <strong>À retenir — du signal analogique au nombre numérique</strong>
      <p>Un capteur de lumière, de température ou d’humidité produit une <strong>tension analogique</strong>. Le microcontrôleur traite des nombres : son <abbr title="Analog-to-Digital Converter — convertisseur analogique-numérique (CAN)">ADC</abbr> convertit donc la tension mesurée en une valeur numérique.</p>
      <div class="adc-example-grid">
        <section>
          <h4>Exemple pédagogique en 10 bits</h4>
          <p>Avec une référence de 5 V et une résolution réglée sur 10 bits, la conversion fournit 1024 niveaux, numérotés de 0 à 1023 :</p>
          <ul>
            <li><strong>0</strong> correspond approximativement à <strong>0 V</strong> ;</li>
            <li><strong>512</strong> correspond approximativement à <strong>2,5 V</strong> ;</li>
            <li><strong>1023</strong> correspond approximativement à <strong>5 V</strong>.</li>
          </ul>
          <p class="adc-formula"><code>valeur numérique ≈ tension ÷ 5 × 1023</code></p>
        </section>
        <section>
          <h4>Cas de l’Arduino UNO R4 Minima</h4>
          <p>La carte utilisée dans TechnoQuest accepte des lectures analogiques jusqu’à <strong>14 bits</strong>. Si le programme choisit 14 bits, l’échelle devient <strong>0 à 16383</strong>. L’exemple 0 à 1023 reste utile lorsque l’activité est volontairement configurée en 10 bits.</p>
        </section>
      </div>
      <p class="adc-warning"><strong>Attention au vocabulaire :</strong> <abbr title="Analog-to-Digital Converter — convertisseur analogique-numérique (CAN)">ADC</abbr> signifie <em>Analog-to-Digital Converter</em>, et non « Digital Analog Converter ». Le sens inverse correspond au <abbr title="Digital-to-Analog Converter — convertisseur numérique-analogique (CNA)">DAC</abbr>.</p>`;
  }

  const acronyms = {
    "ADC": "Analog-to-Digital Converter — convertisseur analogique-numérique (CAN)",
    "DAC": "Digital-to-Analog Converter — convertisseur numérique-analogique (CNA)",
    "LDR": "Light-Dependent Resistor — photorésistance, ou résistance dépendante de la lumière",
    "LED": "Light-Emitting Diode — diode électroluminescente (DEL)",
    "PWM": "Pulse Width Modulation — modulation de largeur d’impulsion (MLI)",
    "RTC": "Real-Time Clock — horloge temps réel",
    "HID": "Human Interface Device — périphérique d’interface humaine",
    "USB": "Universal Serial Bus — bus série universel",
    "CSV": "Comma-Separated Values — valeurs séparées par des virgules",
    "JSON": "JavaScript Object Notation — notation objet JavaScript",
    "PDF": "Portable Document Format — format de document portable",
    "SVG": "Scalable Vector Graphics — graphiques vectoriels redimensionnables",
    "HTML": "HyperText Markup Language — langage de balisage hypertexte",
    "CSS": "Cascading Style Sheets — feuilles de style en cascade",
    "CRCN": "Cadre de référence des compétences numériques — French Digital Competence Reference Framework",
    "BO": "Bulletin officiel — Official Bulletin of the French Ministry of Education"
  };

  const style = document.createElement("style");
  style.id = "technoquest-acronym-learning-styles";
  style.textContent = `
    .adc-learning-card{display:block!important;padding:1rem!important;border-left:5px solid var(--blue)!important;background:#0a2d3a!important}
    .adc-learning-card>strong{display:block;margin-bottom:.55rem;color:#fff;font-size:1.05rem}
    .adc-learning-card p{margin:.45rem 0;color:#e2f4fb}
    .adc-example-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;margin:.8rem 0}
    .adc-example-grid section{padding:.8rem;border:1px solid #6fd3ff66;border-radius:12px;background:#061d25}
    .adc-example-grid h4{margin:0 0 .45rem;color:#a9e5ff}
    .adc-example-grid ul{margin:.45rem 0;padding-left:1.3rem}.adc-example-grid li{margin:.3rem 0}
    .adc-formula{padding:.55rem;border-radius:8px;background:#020d11}.adc-warning{padding:.7rem;border:1px solid #ffd16688;border-radius:10px;background:#352b0c!important;color:#fff1bd!important}
    abbr.technoquest-acronym{cursor:help;text-decoration-line:underline;text-decoration-style:dotted;text-decoration-color:var(--yellow);text-underline-offset:3px}
    .acronym-glossary{max-width:1600px;margin:1rem auto;padding:0 clamp(1rem,5vw,5rem)}
    .acronym-glossary details{padding:1rem 1.2rem;border:1px solid var(--border);border-radius:18px;background:#0d2b23ee;box-shadow:var(--shadow)}
    .acronym-glossary summary{cursor:pointer;color:var(--yellow);font-weight:bold;font-size:1.05rem}
    .acronym-glossary p{color:var(--muted);line-height:1.5}
    .acronym-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(265px,1fr));gap:.65rem;margin-top:.8rem}
    .acronym-entry{padding:.7rem;border:1px solid var(--border);border-radius:11px;background:var(--soft);line-height:1.4}
    .acronym-entry strong{color:var(--blue)}
    @media(max-width:720px){.adc-example-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const glossary = document.createElement("section");
  glossary.className = "acronym-glossary";
  glossary.setAttribute("aria-label", "Glossaire bilingue des sigles");
  glossary.innerHTML = `
    <details>
      <summary>Glossaire bilingue des sigles techniques</summary>
      <p>Chaque sigle est donné avec son développement anglais, puis son équivalent ou son explication en français. Les sigles soulignés en pointillés dans la page peuvent aussi être survolés ou sélectionnés au clavier.</p>
      <div class="acronym-grid">
        ${Object.entries(acronyms).map(([short, long]) => `<div class="acronym-entry"><strong>${short}</strong><br>${long}</div>`).join("")}
        <div class="acronym-entry"><strong>A0, A1, A2</strong><br><em>Analog inputs</em> — entrées analogiques numérotées 0, 1 et 2.</div>
        <div class="acronym-entry"><strong>D6</strong><br><em>Digital pin 6</em> — broche numérique 6 utilisée ici pour commander le relais.</div>
        <div class="acronym-entry"><strong>CC BY</strong><br><em>Creative Commons Attribution</em> — licence Creative Commons avec obligation d’attribution.</div>
      </div>
    </details>`;
  const footer = document.querySelector("footer");
  if (footer) footer.insertAdjacentElement("beforebegin", glossary);
  else document.body.appendChild(glossary);

  const skipTags = new Set(["SCRIPT","STYLE","TEXTAREA","INPUT","SELECT","OPTION","PRE","CODE","ABBR","SVG","PATH","USE"]);
  const pattern = new RegExp(`\\b(${Object.keys(acronyms).sort((a,b)=>b.length-a.length).join("|")})\\b`, "g");

  function annotate(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || skipTags.has(parent.tagName) || parent.closest(".acronym-glossary,.adc-learning-card,abbr")) return NodeFilter.FILTER_REJECT;
        pattern.lastIndex = 0;
        return pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      pattern.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let last = 0;
      let match;
      while ((match = pattern.exec(node.nodeValue))) {
        fragment.appendChild(document.createTextNode(node.nodeValue.slice(last, match.index)));
        const abbr = document.createElement("abbr");
        abbr.className = "technoquest-acronym";
        abbr.title = acronyms[match[1]];
        abbr.setAttribute("aria-label", `${match[1]} : ${acronyms[match[1]]}`);
        abbr.textContent = match[1];
        fragment.appendChild(abbr);
        last = match.index + match[1].length;
      }
      fragment.appendChild(document.createTextNode(node.nodeValue.slice(last)));
      node.replaceWith(fragment);
    });
  }

  annotate();
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE && !node.matches?.(".acronym-glossary,.adc-learning-card")) annotate(node);
    }));
  }).observe(document.body, {childList:true, subtree:true});
})();
