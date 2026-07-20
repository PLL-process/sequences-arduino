/* TechnoQuest — tableau de bord enseignant (v3).
   Page 100 % locale : l'enseignant charge les bilans exportés par les élèves
   (fichiers bilan_….json ou codes TQB1:…), et la page agrège trois vues :
   - vue classe : grille élèves × séances 1-8 (score /20, coches de progression) ;
   - vue séance : moyenne, participation et questions les plus ratées, avec les
     intitulés lus dans les fichiers QCM du dépôt ;
   - vue élève : détail complet (progression, réponses QCM, code C++, réponse
     argumentée, intégrité du fichier).
   Les bilans chargés sont mémorisés dans CE navigateur (localStorage) ; rien
   n'est envoyé sur Internet. La somme de contrôle djb2 écrite par
   bilan-eleve-v3.js est revérifiée ici : un écart marque le bilan « modifié ». */
"use strict";
(() => {
  const KEY = "technoquest-tableau-bord-v1";
  const TITRES = { 1: "Observer les signaux", 2: "Calibrer un seuil", 3: "Analyser les chaînes", 4: "Protéger la pompe", 5: "Économiser l’eau", 6: "Décider avec trois données", 7: "Améliorer la durabilité", 8: "Défi ingénieur" };
  const SEANCES = [1, 2, 3, 4, 5, 6, 7, 8];

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = value => String(value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "eleve";

  /* Même somme de contrôle djb2 que bilan-eleve-v3.js. */
  const checksum = text => {
    let h = 5381;
    for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const verifieIntegrite = bilan => {
    if (typeof bilan.checksum !== "string") return false;
    const clone = { ...bilan };
    delete clone.checksum;
    return checksum(JSON.stringify(clone)) === bilan.checksum;
  };

  /* ==================== État + persistance ==================== */
  const state = { bilans: {}, demo: false, vue: "classe", filtreClasse: "", seance: 1, eleveKey: null };

  const lireStock = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
  const persister = () => {
    if (state.demo) return; /* les données d'exemple ne sont jamais enregistrées */
    const fresh = lireStock();
    fresh.bilans = state.bilans;
    try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch { /* stockage plein : la page reste utilisable */ }
  };

  const cleDe = bilan => `${slug(bilan.eleve.nom)}|${slug(bilan.eleve.classe)}|s${bilan.seance.id}`;
  const cleEleve = bilan => `${slug(bilan.eleve.nom)}|${slug(bilan.eleve.classe)}`;

  /* ==================== Ingestion ==================== */
  const controler = texte => {
    let bilan;
    try { bilan = JSON.parse(texte); } catch { return { erreur: "fichier illisible (JSON invalide)" }; }
    if (!bilan || bilan.format !== "technoquest-bilan-v1") return { erreur: "format inconnu (attendu : technoquest-bilan-v1)" };
    const seanceId = Number(bilan.seance?.id);
    if (!SEANCES.includes(seanceId)) return { erreur: "numéro de séance invalide" };
    if (!String(bilan.eleve?.nom || "").trim()) return { erreur: "nom d’élève manquant" };
    bilan.integre = verifieIntegrite(bilan);
    return { bilan };
  };

  const ajouter = textes => {
    const compte = { ajoutes: 0, remplaces: 0, ignores: 0, erreurs: [] };
    textes.forEach(({ texte, source }) => {
      const { bilan, erreur } = controler(texte);
      if (erreur) { compte.erreurs.push(`${source} : ${erreur}`); return; }
      const cle = cleDe(bilan);
      const existant = state.bilans[cle];
      if (existant) {
        if (String(existant.exportedAt || "") >= String(bilan.exportedAt || "")) { compte.ignores += 1; return; }
        compte.remplaces += 1;
      } else {
        compte.ajoutes += 1;
      }
      state.bilans[cle] = bilan;
    });
    persister();
    rendre();
    return compte;
  };

  const annoncer = compte => {
    const bouts = [];
    if (compte.ajoutes) bouts.push(`<span class="ok">${compte.ajoutes} bilan${compte.ajoutes > 1 ? "s" : ""} ajouté${compte.ajoutes > 1 ? "s" : ""}</span>`);
    if (compte.remplaces) bouts.push(`<span class="ok">${compte.remplaces} mis à jour</span>`);
    if (compte.ignores) bouts.push(`<span class="warn">${compte.ignores} ignoré${compte.ignores > 1 ? "s" : ""} (version plus récente déjà chargée)</span>`);
    compte.erreurs.forEach(e => bouts.push(`<span class="err">${esc(e)}</span>`));
    document.getElementById("tbImportStatus").innerHTML = bouts.join(" · ") || "<span class=\"warn\">Rien à ajouter.</span>";
  };

  /* ==================== Aides d'affichage ==================== */
  const donneesQcm = id => window.TechnoQuestQCM?.data?.[id];
  const listeBilans = () => Object.values(state.bilans)
    .filter(b => !state.filtreClasse || slug(b.eleve.classe) === state.filtreClasse);
  const eleves = () => {
    const map = new Map();
    listeBilans().forEach(b => {
      const cle = cleEleve(b);
      if (!map.has(cle)) map.set(cle, { cle, nom: b.eleve.nom, classe: b.eleve.classe || "", seances: {} });
      map.get(cle).seances[b.seance.id] = b;
    });
    return [...map.values()].sort((a, b2) =>
      (a.classe || "").localeCompare(b2.classe || "", "fr") || a.nom.localeCompare(b2.nom, "fr"));
  };

  const classeScore = score => score >= 16 ? "s-haut" : score >= 10 ? "s-moyen" : "s-bas";
  const dateFr = iso => {
    const d = new Date(iso || "");
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  /* ==================== Vue classe ==================== */
  const rendreClasse = () => {
    const zone = document.getElementById("tbVueClasse");
    const lignes = eleves();
    if (!lignes.length) {
      zone.innerHTML = `<h2>Vue classe</h2><p class="tb-vide">Aucun bilan chargé${state.filtreClasse ? " pour cette classe" : ""}.
        Chargez les fichiers <code>bilan_….json</code> de vos élèves ci-dessus, ou affichez les données d’exemple.</p>`;
      return;
    }
    const cellule = (eleve, id) => {
      const b = eleve.seances[id];
      if (!b) return "<td><span class=\"tb-score s-aucun\">—</span></td>";
      const p = b.progression || {};
      const q = b.qcm || {};
      const score = q.valide && q.score != null
        ? `<span class="tb-score ${classeScore(q.score)}">${q.score}<small>/20</small></span>`
        : "<span class=\"tb-score s-aucun\">en cours</span>";
      const point = fait => fait ? "<b>●</b>" : "<span>●</span>";
      const titre = `Séance ${id} · ${eleve.nom} — jumeau ${p.demo ? "✔" : "✘"}, programme ${p.programme ? "✔" : "✘"}, QCM ${q.valide ? `validé ${q.score}/20` : "non validé"}${b.integre ? "" : " — ⚠ fichier modifié"}`;
      return `<td><button type="button" class="tb-cell" data-eleve="${esc(eleve.cle)}" data-seance="${id}" title="${esc(titre)}">
        ${score}<span class="tb-dots" aria-hidden="true">${point(p.demo)}${point(p.programme)}${point(q.valide)}</span>${b.integre ? "" : "<span class=\"tb-alerte\">⚠ modifié</span>"}
      </button></td>`;
    };
    const moyenneDe = id => {
      const notes = lignes.map(e => e.seances[id]?.qcm).filter(q => q?.valide && q.score != null).map(q => q.score);
      return notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1).replace(".", ",") : "—";
    };
    zone.innerHTML = `
      <h2>Vue classe</h2>
      <p class="tb-note">Score du QCM /20 et trois points de progression : jumeau observé · programme vérifié · QCM validé. Cliquez sur une case ou un nom pour ouvrir le détail de l’élève.</p>
      <div class="tb-table-wrap"><table class="tb-classe">
        <thead><tr><th scope="col">Élève</th>${SEANCES.map(id => `<th scope="col" title="${esc(TITRES[id])}">S${id}</th>`).join("")}</tr></thead>
        <tbody>
          ${lignes.map(e => `<tr>
            <td><button type="button" class="tb-eleve-nom" data-eleve="${esc(e.cle)}">${esc(e.nom)}</button><br><small style="color:var(--muted)">${esc(e.classe) || "&nbsp;"}</small></td>
            ${SEANCES.map(id => cellule(e, id)).join("")}
          </tr>`).join("")}
          <tr><td><strong>Moyenne (QCM validés)</strong></td>${SEANCES.map(id => `<td><strong>${moyenneDe(id)}</strong></td>`).join("")}</tr>
        </tbody>
      </table></div>`;
    zone.querySelectorAll("[data-eleve]").forEach(btn => btn.addEventListener("click", () => {
      state.eleveKey = btn.dataset.eleve;
      state.seanceCible = Number(btn.dataset.seance || 0) || null;
      basculer("eleve");
    }));
  };

  /* ==================== Vue séance ==================== */
  const rendreSeance = () => {
    const zone = document.getElementById("tbVueSeance");
    const id = state.seance;
    const bilans = listeBilans().filter(b => b.seance.id === id);
    const valides = bilans.filter(b => b.qcm?.valide && b.qcm.score != null);
    const data = donneesQcm(id);
    const moyenne = valides.length ? (valides.reduce((a, b) => a + b.qcm.score, 0) / valides.length).toFixed(1).replace(".", ",") : "—";

    let questionsHtml = "<p class=\"tb-vide\">Aucune réponse chargée pour cette séance.</p>";
    if (data && bilans.length) {
      const stats = data.questions.map((q, index) => {
        let repondu = 0, faux = 0;
        const mauvaisChoix = {};
        bilans.forEach(b => {
          const rep = b.qcm?.reponses?.[q.id];
          if (rep == null) return;
          repondu += 1;
          if (Number(rep) !== q.answer) {
            faux += 1;
            mauvaisChoix[rep] = (mauvaisChoix[rep] || 0) + 1;
          }
        });
        return { q, index, repondu, faux, taux: repondu ? faux / repondu : 0, mauvaisChoix };
      }).filter(s => s.repondu > 0);
      stats.sort((a, b) => b.taux - a.taux || b.faux - a.faux || a.index - b.index);
      questionsHtml = stats.map(s => `
        <div class="tb-qrow">
          <div class="tb-qrow-head">
            <span class="tb-qid">Q${s.index + 1}</span>
            <span class="tb-qtheme">${esc(s.q.theme)}</span>
            <span class="tb-qtaux" style="color:${s.taux >= .5 ? "var(--red)" : s.taux >= .25 ? "var(--amber)" : "var(--green)"}">${Math.round(s.taux * 100)} % d’erreurs</span>
          </div>
          <div class="tb-qbar"><i style="width:${Math.round(s.taux * 100)}%"></i></div>
          <p style="margin:.2rem 0 0">${esc(s.q.question)}</p>
          <p class="tb-qdetail">${s.faux} erreur${s.faux > 1 ? "s" : ""} sur ${s.repondu} réponse${s.repondu > 1 ? "s" : ""} ·
            attendu : <b>${esc(s.q.choices[s.q.answer])}</b>${Object.keys(s.mauvaisChoix).length ? " · choisi à tort : " +
            Object.entries(s.mauvaisChoix).map(([i, n]) => `<b>${esc(s.q.choices[i] ?? `choix ${i}`)}</b> (${n})`).join(", ") : ""}</p>
        </div>`).join("");
    } else if (!data) {
      questionsHtml = "<p class=\"tb-vide\">Les fichiers de questions (qcm/qcm-data-s" + id + ".js) ne sont pas chargés : le détail par question n’est pas disponible.</p>";
    }

    zone.innerHTML = `
      <h2>Vue séance — Séance ${id} · ${esc(TITRES[id])}</h2>
      <p class="tb-note">Les questions sont triées des plus ratées aux mieux réussies : idéal pour choisir quoi corriger collectivement en début de séance suivante.</p>
      <div class="tb-stats">
        <div class="tb-stat"><b>${bilans.length}</b><span>bilan${bilans.length > 1 ? "s" : ""} chargé${bilans.length > 1 ? "s" : ""}</span></div>
        <div class="tb-stat"><b>${valides.length}</b><span>QCM validés</span></div>
        <div class="tb-stat"><b>${moyenne}</b><span>moyenne /20</span></div>
        <div class="tb-stat"><b>${bilans.filter(b => b.progression?.programme).length}</b><span>programmes vérifiés</span></div>
      </div>
      ${questionsHtml}`;
  };

  /* ==================== Vue élève ==================== */
  const rendreEleve = () => {
    const zone = document.getElementById("tbVueEleve");
    const tous = eleves();
    const eleve = tous.find(e => e.cle === state.eleveKey) || tous[0];
    if (!eleve) {
      zone.innerHTML = "<h2>Vue élève</h2><p class=\"tb-vide\">Aucun bilan chargé. Chargez des bilans, puis cliquez sur un élève dans la vue classe.</p>";
      return;
    }
    state.eleveKey = eleve.cle;
    const selecteur = `<select id="tbChoixEleve" aria-label="Choisir un élève">${tous.map(e =>
      `<option value="${esc(e.cle)}"${e.cle === eleve.cle ? " selected" : ""}>${esc(e.nom)}${e.classe ? ` — ${esc(e.classe)}` : ""}</option>`).join("")}</select>`;

    const blocs = SEANCES.filter(id => eleve.seances[id]).map(id => {
      const b = eleve.seances[id];
      const p = b.progression || {}, q = b.qcm || {};
      const data = donneesQcm(id);
      let reponses = "<p class=\"tb-vide\">Aucune réponse enregistrée.</p>";
      if (data && q.reponses && Object.keys(q.reponses).length) {
        reponses = `<table class="tb-reponses"><thead><tr><th>#</th><th>Question</th><th>Réponse de l’élève</th><th>Attendu</th><th></th></tr></thead><tbody>${
          data.questions.map((question, index) => {
            const rep = q.reponses[question.id];
            const bonne = rep != null && Number(rep) === question.answer;
            return `<tr>
              <td>Q${index + 1}</td>
              <td>${esc(question.question)}</td>
              <td>${rep == null ? "<span class=\"tb-vide\">—</span>" : esc(question.choices[rep] ?? `choix ${rep}`)}</td>
              <td>${esc(question.choices[question.answer])}</td>
              <td class="${rep == null ? "" : bonne ? "tb-ok" : "tb-ko"}">${rep == null ? "" : bonne ? "✔" : "✘"}</td>
            </tr>`;
          }).join("")}</tbody></table>`;
      }
      const coche = (fait, label) => `<span class="tb-chip ${fait ? "ok" : ""}">${fait ? "✔" : "○"} ${label}</span>`;
      return `<details class="tb-seance-detail"${state.seanceCible === id ? " open" : ""}>
        <summary>Séance ${id} — ${esc(TITRES[id])}
          <span class="tb-chip ${q.valide ? "ok" : ""}">${q.valide && q.score != null ? `QCM ${q.score}/20` : "QCM non validé"}</span>
          <span class="tb-chip">exporté le ${dateFr(b.exportedAt)}</span>
          ${b.integre ? "" : "<span class=\"tb-chip warn\">⚠ fichier modifié après export</span>"}
        </summary>
        <div class="tb-seance-detail-body">
          <p>${coche(p.demo, "Jumeau observé")} ${coche(p.programme, "Programme vérifié")} ${coche(q.valide, "QCM validé")}
             ${p.dernierePartie ? `<span class="tb-chip">dernière partie visitée : ${Number(p.dernierePartie)}</span>` : ""}</p>
          <h4>Réponse argumentée</h4>
          ${String(b.reponseArgumentee || "").trim() ? `<pre>${esc(b.reponseArgumentee)}</pre>` : "<p class=\"tb-vide\">Pas encore rédigée.</p>"}
          <h4>Programme C++ (éditeur classique)</h4>
          ${String(b.programme?.code || "").trim() ? `<pre>${esc(b.programme.code)}</pre>` : "<p class=\"tb-vide\">Aucun code enregistré.</p>"}
          <h4>Réponses au QCM</h4>
          ${reponses}
        </div>
      </details>`;
    }).join("");

    zone.innerHTML = `
      <div class="tb-eleve-head">
        <h2 style="margin:0">${esc(eleve.nom)}</h2>
        ${eleve.classe ? `<span class="tb-chip">${esc(eleve.classe)}</span>` : ""}
        <span class="tb-chip">${Object.keys(eleve.seances).length} séance${Object.keys(eleve.seances).length > 1 ? "s" : ""} remise${Object.keys(eleve.seances).length > 1 ? "s" : ""}</span>
        <span style="margin-left:auto">${selecteur}</span>
      </div>
      <p class="tb-note">Chaque séance remise se déplie : progression, réponse argumentée, code C++ et détail des réponses au QCM.</p>
      ${blocs || "<p class=\"tb-vide\">Aucune séance remise.</p>"}`;
    zone.querySelector("#tbChoixEleve")?.addEventListener("change", event => {
      state.eleveKey = event.target.value;
      state.seanceCible = null;
      rendreEleve();
    });
    state.seanceCible = null;
  };

  /* ==================== Navigation + rendu global ==================== */
  const basculer = vue => {
    state.vue = vue;
    ["classe", "seance", "eleve"].forEach(nom => {
      document.getElementById(`tbVue${nom[0].toUpperCase()}${nom.slice(1)}`).hidden = nom !== vue;
      document.getElementById(`tbTab${nom[0].toUpperCase()}${nom.slice(1)}`).setAttribute("aria-selected", String(nom === vue));
    });
    document.getElementById("tbFiltreSeance").hidden = vue !== "seance";
    rendre();
  };

  const rendre = () => {
    const bilans = Object.values(state.bilans);
    const nEleves = new Set(bilans.map(cleEleve)).size;
    document.getElementById("tbCount").textContent = bilans.length
      ? `${bilans.length} bilan${bilans.length > 1 ? "s" : ""} · ${nEleves} élève${nEleves > 1 ? "s" : ""}${state.demo ? " · exemple" : ""}`
      : "Aucun bilan chargé pour l’instant.";

    /* Filtre classe (reconstruit en conservant la sélection). */
    const filtre = document.getElementById("tbFiltreClasse");
    const classes = [...new Set(bilans.map(b => b.eleve.classe || "").filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
    filtre.innerHTML = "<option value=\"\">Toutes les classes</option>" +
      classes.map(c => `<option value="${esc(slug(c))}"${slug(c) === state.filtreClasse ? " selected" : ""}>${esc(c)}</option>`).join("");

    if (state.vue === "classe") rendreClasse();
    else if (state.vue === "seance") rendreSeance();
    else rendreEleve();
  };

  /* ==================== Données d'exemple (jamais enregistrées) ==================== */
  const chargerDemo = () => {
    state.demo = true;
    document.body.classList.add("tb-demo");
    state.bilans = {};
    const fabrique = (nom, classe, seanceId, score, options = {}) => {
      const data = donneesQcm(seanceId);
      const reponses = {};
      if (data && score != null) {
        const faux = 20 - score;
        data.questions.forEach((q, i) => { reponses[q.id] = i < faux ? (q.answer + 1) % 3 : q.answer; });
      }
      const bilan = {
        format: "technoquest-bilan-v1",
        exportedAt: `2026-06-0${(seanceId % 7) + 1}T10:${10 + seanceId}:00.000Z`,
        seance: { id: seanceId, titre: TITRES[seanceId] },
        eleve: { nom, classe },
        progression: { demo: true, programme: options.programme !== false, qcm: score != null, dernierePartie: score != null ? 6 : 4 },
        qcm: { valide: score != null, score: score != null ? score : null, valideLe: score != null ? `2026-06-0${(seanceId % 7) + 1}T10:${20 + seanceId}:00.000Z` : null, reponses },
        programme: { code: options.programme === false ? "" : `// Exemple — séance ${seanceId}\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int humidite = analogRead(A0);\n  Serial.println(humidite);\n  delay(1000);\n}`, verifie: options.programme !== false },
        reponseArgumentee: options.reponse || ""
      };
      bilan.checksum = checksum(JSON.stringify({ ...bilan, checksum: undefined }));
      if (options.trafique) bilan.reponseArgumentee += " (ligne ajoutée après export)";
      bilan.integre = verifieIntegrite(bilan);
      state.bilans[cleDe(bilan)] = bilan;
    };
    fabrique("Awa Exemple", "4e Démo", 1, 18, { reponse: "Le capteur envoie un nombre entre 0 et 1023 : plus la terre est sèche, plus la valeur monte, donc il faut arroser sous le seuil." });
    fabrique("Awa Exemple", "4e Démo", 2, 16, { reponse: "J’ai calibré le seuil en mesurant la terre sèche puis la terre humide." });
    fabrique("Awa Exemple", "4e Démo", 3, 14);
    fabrique("Baptiste Exemple", "4e Démo", 1, 11, { reponse: "La LED s’allume quand la valeur dépasse le seuil." });
    fabrique("Baptiste Exemple", "4e Démo", 2, null, { programme: false });
    fabrique("Baptiste Exemple", "4e Démo", 3, 9);
    fabrique("Chloé Exemple", "4e Démo", 1, 20, { reponse: "L’acquisition se fait sur A0, le traitement compare au seuil, la communication passe par le moniteur série." });
    fabrique("Chloé Exemple", "4e Démo", 2, 17, { trafique: true });
    document.getElementById("tbImportStatus").innerHTML = "<span class=\"ok\">Données d’exemple chargées (3 élèves fictifs).</span> <span class=\"warn\">Elles ne sont pas enregistrées : rechargez la page pour revenir à vos bilans.</span>";
    rendre();
  };

  /* ==================== Export CSV ==================== */
  const exporterCsv = () => {
    const cellule = valeur => {
      let s = String(valeur ?? "");
      if (/^[=+\-@]/.test(s)) s = `'${s}`;            /* neutralise les formules */
      if (/[";\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lignes = [["Nom", "Classe", "Séance", "Titre", "Score /20", "Jumeau observé", "Programme vérifié", "QCM validé", "QCM validé le", "Intégrité", "Bilan exporté le"]];
    eleves().forEach(e => SEANCES.forEach(id => {
      const b = e.seances[id];
      if (!b) return;
      const p = b.progression || {}, q = b.qcm || {};
      lignes.push([e.nom, e.classe, id, TITRES[id], q.valide && q.score != null ? q.score : "",
        p.demo ? "oui" : "non", p.programme ? "oui" : "non", q.valide ? "oui" : "non",
        q.valideLe || "", b.integre ? "ok" : "modifié", b.exportedAt || ""]);
    }));
    const csv = "\ufeff" + lignes.map(l => l.map(cellule).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `technoquest-bilans-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(lien); lien.click(); lien.remove();
    URL.revokeObjectURL(url);
  };

  /* ==================== Branchements ==================== */
  const boot = () => {
    state.bilans = lireStock().bilans || {};

    const drop = document.getElementById("tbDrop");
    const files = document.getElementById("tbFiles");
    const lireFichiers = async fileList => {
      const textes = await Promise.all([...fileList].map(async f => ({ texte: await f.text(), source: f.name })));
      annoncer(ajouter(textes));
    };
    drop.addEventListener("click", () => files.click());
    drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); files.click(); } });
    files.addEventListener("change", () => { if (files.files.length) { lireFichiers(files.files); files.value = ""; } });
    ["dragenter", "dragover"].forEach(type => drop.addEventListener(type, e => { e.preventDefault(); drop.classList.add("tb-drag"); }));
    ["dragleave", "drop"].forEach(type => drop.addEventListener(type, e => { e.preventDefault(); drop.classList.remove("tb-drag"); }));
    drop.addEventListener("drop", e => { if (e.dataTransfer?.files?.length) lireFichiers(e.dataTransfer.files); });

    document.getElementById("tbAddCodes").addEventListener("click", () => {
      const zone = document.getElementById("tbCodes");
      const codes = zone.value.split(/\s+/).map(c => c.trim()).filter(Boolean);
      const textes = [];
      const compteErreurs = [];
      codes.forEach((code, i) => {
        if (!code.startsWith("TQB1:")) { compteErreurs.push(`code ${i + 1} : ne commence pas par TQB1:`); return; }
        try {
          textes.push({ texte: decodeURIComponent(escape(atob(code.slice(5)))), source: `code ${i + 1}` });
        } catch { compteErreurs.push(`code ${i + 1} : illisible (copie incomplète ?)`); }
      });
      const compte = ajouter(textes);
      compte.erreurs.push(...compteErreurs);
      annoncer(compte);
      if (!compte.erreurs.length) zone.value = "";
    });

    document.getElementById("tbDemo").addEventListener("click", chargerDemo);

    /* Vider : double clic de confirmation, sans boîte de dialogue bloquante. */
    const clear = document.getElementById("tbClear");
    let armement = null;
    clear.addEventListener("click", () => {
      if (armement) {
        clearTimeout(armement); armement = null;
        state.bilans = {};
        if (state.demo) { state.demo = false; document.body.classList.remove("tb-demo"); state.bilans = lireStock().bilans || {}; }
        else persister();
        clear.textContent = "Vider le tableau";
        rendre();
        return;
      }
      clear.textContent = "Confirmer la suppression ?";
      armement = setTimeout(() => { armement = null; clear.textContent = "Vider le tableau"; }, 4000);
    });

    document.getElementById("tbTabClasse").addEventListener("click", () => basculer("classe"));
    document.getElementById("tbTabSeance").addEventListener("click", () => basculer("seance"));
    document.getElementById("tbTabEleve").addEventListener("click", () => basculer("eleve"));
    document.getElementById("tbFiltreClasse").addEventListener("change", e => { state.filtreClasse = e.target.value; rendre(); });

    const filtreSeance = document.getElementById("tbFiltreSeance");
    filtreSeance.innerHTML = SEANCES.map(id => `<option value="${id}">Séance ${id} — ${esc(TITRES[id])}</option>`).join("");
    filtreSeance.addEventListener("change", e => { state.seance = Number(e.target.value); rendre(); });

    document.getElementById("tbCsv").addEventListener("click", exporterCsv);
    document.getElementById("tbPrint").addEventListener("click", () => window.print());

    rendre();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
