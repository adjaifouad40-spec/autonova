// =========================================================
//  Fiche véhicule : vehicule.html?id=dongfeng-aeolus-mage
//  En-tête (badge Neuf / Occasion, prix), médias, chiffres clés,
//  bloc propre au neuf ou à l'occasion, puis caractéristiques
//  rangées par thème.
// =========================================================

const root = document.getElementById("fiche");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function specTable(rows, caption) {
  const table = el("table", "spec-table");
  if (caption) table.append(el("caption", "visually-hidden", caption));
  const tbody = el("tbody");
  rows.forEach(([label, value]) => {
    const tr = el("tr");
    const th = el("th", "", label);
    th.scope = "row";
    tr.append(th, el("td", "", value));
    tbody.append(tr);
  });
  table.append(tbody);
  return table;
}

// --- Galerie : une grande vue + des miniatures (photos et vidéo) ---
function buildGallery(v) {
  const media = [];
  (v.photos || []).forEach((file, i) => media.push({ kind: "image", src: URL.createObjectURL(file), alt: `${v.name}, photo ${i + 1}` }));
  if (!media.length) media.push({ kind: "image", src: v.image || "images/suv-gris.svg", alt: `Illustration ${v.name}` });
  if (v.video) media.push({ kind: "video", src: URL.createObjectURL(v.video), alt: `Vidéo ${v.name}` });

  const wrap = el("div", "gallery");
  const stage = el("div", "gallery-stage");
  const thumbs = el("div", "gallery-thumbs");

  function show(item) {
    stage.replaceChildren();
    if (item.kind === "video") {
      const video = el("video");
      video.src = item.src;
      video.controls = true;
      video.playsInline = true;
      video.setAttribute("aria-label", item.alt);
      stage.append(video);
    } else {
      const img = el("img");
      img.src = item.src;
      img.alt = item.alt;
      stage.append(img);
    }
    thumbs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.src === item.src));
  }

  if (media.length > 1) {
    media.forEach((item) => {
      const b = el("button", "thumb");
      b.type = "button";
      b.dataset.src = item.src;
      b.setAttribute("aria-label", item.kind === "video" ? "Voir la vidéo" : `Voir ${item.alt}`);
      if (item.kind === "video") b.append(el("span", "thumb-video", "▶ Vidéo"));
      else {
        const img = el("img");
        img.src = item.src;
        img.alt = "";
        b.append(img);
      }
      b.addEventListener("click", () => show(item));
      thumbs.append(b);
    });
  }
  wrap.append(stage);
  if (media.length > 1) wrap.append(thumbs);
  show(media[0]);
  return wrap;
}

function render(v) {
  document.title = `${v.name} — AutoNova`;
  const typeRow = (v.specs || []).find(([l]) => l === "Type");

  // --- En-tête ---
  const head = el("section", "page-hero fiche-hero");
  const c = el("div", "container");
  const crumb = el("p", "breadcrumb");
  const a1 = el("a", "", "Accueil"); a1.href = "index.html";
  const a2 = el("a", "", "Catalogue"); a2.href = "catalogue.html";
  crumb.append(a1, " › ", a2, " › ", v.name);
  const badge = el("span", "condition-badge " + (v.isNew ? "is-new" : "is-used"), v.isNew ? "Neuf" : "Occasion");
  const h1 = el("h1", "", v.name);
  const sub = el("p", "", [typeRow && typeRow[1], v.energy, v.isNew ? null : v.km ? `${v.km.toLocaleString("fr-FR")} km` : null, v.isNew ? null : v.year].filter(Boolean).join(" · "));
  c.append(crumb, badge, h1, sub);
  head.append(c);

  // --- Médias + résumé ---
  const top = el("section", "section");
  const grid = el("div", "container fiche-top");
  const summary = el("aside", "panel fiche-summary");
  summary.append(el("p", "fiche-price", formatPriceOrAsk(v.price)));
  if (v.price) summary.append(el("p", "car-month", `ou environ ${formatPrice(monthlyEstimate(v.price))} / mois*`));

  const figures = el("div", "key-figures");
  KEY_FIGURES.forEach((label) => {
    const row = (v.specs || []).find(([l]) => l === label);
    if (!row) return;
    const f = el("div", "key-figure");
    f.append(el("span", "", label === "Consommation mixte" ? "Consommation" : label), el("strong", "", row[1].replace(/^Environ\s+/i, "≈ ").replace(/ selon.*$/, "")));
    figures.append(f);
  });
  if (figures.children.length) summary.append(figures);

  if (v.details && v.details.length) {
    summary.append(el("h2", "summary-title", v.isNew ? "Véhicule neuf" : "Historique du véhicule"));
    summary.append(specTable(v.details, v.isNew ? "Informations véhicule neuf" : "Historique occasion"));
  }

  const actions = el("div", "fiche-actions");
  const trial = el("a", "btn", "Réserver un essai"); trial.href = `inscription.html?modele=${encodeURIComponent(v.name)}`;
  actions.append(trial);
  if (v.price) {
    const fin = el("a", "btn btn-dark", "Simuler le financement"); fin.href = `financement.html?prix=${v.price}`;
    actions.append(fin);
  }
  summary.append(actions);
  if (v.price) summary.append(el("p", "disclaimer", "* Mensualité indicative sur 60 mois avec 10 % d'apport et un taux de 4,9 %."));
  if (v.local) summary.append(el("p", "disclaimer", "Fiche ajoutée depuis l'Espace vendeur : visible uniquement dans ce navigateur."));

  grid.append(buildGallery(v), summary);
  top.append(grid);

  // --- Caractéristiques par thème ---
  const specsSection = el("section", "section section-alt");
  const sc = el("div", "container");
  sc.append(el("h2", "section-heading", "Caractéristiques techniques"));
  const groups = el("div", "spec-groups");
  groupSpecs(v.specs || []).forEach((g) => {
    const card = el("article", "spec-card");
    const h3 = el("h3");
    h3.append(el("span", "spec-icon", g.icon), g.title);
    h3.querySelector(".spec-icon").setAttribute("aria-hidden", "true");
    card.append(h3, specTable(g.rows, g.title));
    groups.append(card);
  });
  if (!groups.children.length) groups.append(el("p", "empty", "Caractéristiques à venir."));
  sc.append(groups, el("p", "disclaimer", "Données indicatives, à confirmer auprès d'un conseiller avant l'achat."));
  specsSection.append(sc);

  root.replaceChildren(head, top, specsSection);
}

function notFound() {
  const s = el("section", "section");
  const c = el("div", "container empty");
  c.append(el("h1", "", "Véhicule introuvable"), el("p", "", "Ce véhicule n'existe pas ou a été retiré."));
  const a = el("a", "btn", "Retour au catalogue"); a.href = "catalogue.html";
  c.append(a);
  s.append(c);
  root.replaceChildren(s);
}

// Mensualité indicative (même calcul que le catalogue)
function monthlyEstimate(price) {
  const loan = price * 0.9, r = 0.049 / 12, n = 60;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

const id = new URLSearchParams(window.location.search).get("id");
getVehicle(id).then((v) => (v ? render(v) : notFound()));
