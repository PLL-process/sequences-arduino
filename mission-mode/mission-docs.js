/* TechnoQuest Mission Mode - aide contextuelle et documentation. */
"use strict";

(() => {
  const documentationHtml = `
    <div class="mission-doc-grid">
      <article><h4>Structure Arduino</h4><p>Un programme Arduino contient souvent des déclarations globales, puis <code>setup()</code> et <code>loop()</code>.</p></article>
      <article><h4>#include</h4><p><code>#include &lt;Arduino.h&gt;</code> rend explicites les définitions Arduino dans un fichier <code>.ino</code> ou C++.</p></article>
      <article><h4>Constantes</h4><p><code>const int</code> permet de nommer les broches A0, A1, A2 et D6 pour rendre le programme lisible.</p></article>
      <article><h4>Variables</h4><p>Une variable locale déclarée dans <code>loop()</code> garde une mesure le temps d'un tour de boucle.</p></article>
      <article><h4>setup()</h4><p>Ce bloc se lance une seule fois : communication série, configuration de D6, et état de sécurité.</p></article>
      <article><h4>loop()</h4><p>Ce bloc se répète : lire les capteurs, afficher les valeurs, attendre, recommencer.</p></article>
      <article><h4>analogRead()</h4><p><code>analogRead(A0)</code>, <code>analogRead(A1)</code> et <code>analogRead(A2)</code> lisent des entrées analogiques.</p></article>
      <article><h4>pinMode()</h4><p><code>pinMode(..., OUTPUT)</code> indique qu'une broche numérique sert de sortie.</p></article>
      <article><h4>digitalWrite()</h4><p><code>digitalWrite(..., LOW)</code> force une sortie à 0. Ici, LOW garde le relais au repos et la pompe arrêtée.</p></article>
      <article><h4>Serial.begin()</h4><p><code>Serial.begin(9600)</code> prépare le Moniteur Série à 9600 bauds.</p></article>
      <article><h4>Serial.print()</h4><p><code>Serial.print()</code> écrit sans retour à la ligne ; <code>Serial.println()</code> écrit puis passe à la ligne.</p></article>
      <article><h4>delay()</h4><p><code>delay(1000)</code> attend 1000 ms, soit une seconde, avant de continuer.</p></article>
      <article><h4>IDE Arduino</h4><p>La simulation de cette page est pédagogique. La compilation et le téléversement se font ensuite dans l'IDE Arduino.</p></article>
      <article><h4>Moniteur Série</h4><p>Après téléversement, ouvrir le Moniteur Série et choisir 9600 bauds pour voir les mesures.</p></article>
    </div>`;

  function helpFor(step) {
    if (!step) {
      return `<p>Toutes les étapes de code sont reconnues. Tu peux lancer la simulation pédagogique ou télécharger ton fichier <code>.ino</code>.</p>`;
    }
    return `
      <p><strong>Étape active :</strong> ${step.label}</p>
      <ol class="mission-hints">
        <li>${step.hint1}</li>
        <li>${step.hint2}</li>
        <li>${step.hint3}</li>
      </ol>`;
  }

  window.TechnoQuestMissionDocs = {
    documentationHtml,
    helpFor
  };
})();
