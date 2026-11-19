// =========================================================
//  AutoNova — données des véhicules (partagées par le catalogue,
//  les fiches et l'Espace vendeur)
//
//  Une fiche = des informations pour les filtres (type, état, prix…)
//  + un tableau « Caractéristique | Donnée » (specs), dans l'ordre voulu
//  + un tableau propre au neuf OU à l'occasion (details).
// =========================================================

// Libellés de la fiche technique, dans l'ordre d'affichage.
// key = nom interne du champ du formulaire, label = texte affiché.
const SPEC_FIELDS = [
  { key: "moteur", group: "moteur", label: "Moteur", placeholder: "1.5 Turbo essence, 4 cylindres" },
  { key: "cylindree", group: "moteur", label: "Cylindrée", placeholder: "1 496 cm³" },
  { key: "puissance", group: "moteur", label: "Puissance", placeholder: "204 ch (150 kW)" },
  { key: "couple", group: "moteur", label: "Couple", placeholder: "305 Nm" },
  { key: "vmax", group: "moteur", label: "Vitesse maximale", placeholder: "Environ 190 km/h" },
  { key: "acceleration", group: "moteur", label: "0–100 km/h", placeholder: "Environ 8,5 s" },
  { key: "boite", group: "transmission", label: "Boîte", placeholder: "Automatique 7 rapports" },
  { key: "transmission", group: "transmission", label: "Transmission", placeholder: "Traction avant (FWD)" },
  { key: "modes", group: "transmission", label: "Modes de conduite", placeholder: "Sport / Confort" },
  { key: "consommation", group: "conso", label: "Consommation mixte", placeholder: "6,8 L/100 km" },
  { key: "reservoir", group: "conso", label: "Réservoir", placeholder: "51 L" },
  { key: "carrosserie", group: "carrosserie", label: "Type", placeholder: "SUV 5 portes / 5 places" },
  { key: "longueur", group: "carrosserie", label: "Longueur", placeholder: "4 650 mm" },
  { key: "largeur", group: "carrosserie", label: "Largeur", placeholder: "1 905 mm" },
  { key: "hauteur", group: "carrosserie", label: "Hauteur", placeholder: "1 630 mm" },
  { key: "empattement", group: "carrosserie", label: "Empattement", placeholder: "2 775 mm" },
  { key: "garde", group: "carrosserie", label: "Garde au sol", placeholder: "202 mm" },
  { key: "pneus", group: "chassis", label: "Pneus", placeholder: "235/55 R19" },
  { key: "suspAv", group: "chassis", label: "Suspension avant", placeholder: "McPherson indépendante" },
  { key: "suspAr", group: "chassis", label: "Suspension arrière", placeholder: "Multibras indépendante" },
  { key: "freins", group: "chassis", label: "Freins", placeholder: "Disques ventilés à l'avant / disques à l'arrière" },
];

// Les thèmes de la fiche, dans l'ordre d'affichage
const SPEC_GROUPS = [
  { id: "moteur", title: "Moteur et performances", icon: "01" },
  { id: "transmission", title: "Boîte et transmission", icon: "02" },
  { id: "conso", title: "Consommation et autonomie", icon: "03", extra: ["autonomie", "batterie", "recharge"] },
  { id: "carrosserie", title: "Carrosserie et dimensions", icon: "04", extra: ["places", "portes", "coffre", "poids"] },
  { id: "chassis", title: "Châssis, roues et freinage", icon: "05" },
];

// Chiffres mis en avant en haut de la fiche
const KEY_FIGURES = ["Puissance", "0–100 km/h", "Consommation mixte", "Boîte"];

// Range une liste [libellé, valeur] par thème. Les libellés inconnus vont dans « Autres ».
function groupSpecs(specs) {
  const groups = SPEC_GROUPS.map((g) => ({ ...g, rows: [] }));
  const others = { id: "autres", title: "Autres caractéristiques", icon: "06", rows: [] };
  for (const [label, value] of specs) {
    const field = SPEC_FIELDS.find((f) => normalize(f.label) === normalize(label));
    let target = field && groups.find((g) => g.id === field.group);
    if (!target) target = groups.find((g) => (g.extra || []).some((x) => normalize(label).includes(x)));
    (target || others).rows.push([label === "Type" ? "Carrosserie" : label, value]);
  }
  return [...groups, others].filter((g) => g.rows.length);
}

// Champs propres à chaque état
const NEW_FIELDS = [
  { key: "garantie", label: "Garantie constructeur", placeholder: "5 ans ou 100 000 km" },
  { key: "delai", label: "Délai de livraison", placeholder: "2 à 4 semaines" },
  { key: "finition", label: "Finition et options", placeholder: "Toit ouvrant, caméra 360°…" },
  { key: "couleurs", label: "Couleurs disponibles", placeholder: "Blanc, gris, noir" },
];
const USED_FIELDS = [
  { key: "annee", label: "Année", placeholder: "2021", type: "number" },
  { key: "kilometrage", label: "Kilométrage", placeholder: "45000", type: "number" },
  { key: "proprietaires", label: "Nombre de propriétaires", placeholder: "1" },
  { key: "entretien", label: "Historique d'entretien", placeholder: "Carnet complet, révision faite en 2026" },
  { key: "controle", label: "Dernier contrôle technique", placeholder: "Mars 2026, sans défaut" },
  { key: "etat", label: "État général", placeholder: "Très bon état, aucune rayure" },
];

const TYPE_LABELS = { citadine: "Citadine", berline: "Berline", suv: "SUV", electrique: "Électrique" };

// ---------------------------------------------------------
//  Véhicules publiés avec le site (visibles par tous)
// ---------------------------------------------------------
const spec = (pairs) => pairs.map(([label, value]) => [label, value]);

const STATIC_VEHICLES = [
  {
    id: "dongfeng-aeolus-mage",
    name: "Dongfeng Aeolus Mage 1.5T",
    brand: "Dongfeng",
    type: "suv", energy: "Essence", isNew: true, year: 2026, km: 0, price: null,
    image: "images/suv-gris.svg",
    specs: spec([
      ["Type", "SUV 5 portes / 5 places"],
      ["Moteur", "1.5 Turbo essence, 4 cylindres"],
      ["Cylindrée", "1 496 cm³"],
      ["Puissance", "204 ch (150 kW)"],
      ["Couple", "305 Nm"],
      ["Boîte", "Automatique 7 DCT à double embrayage humide"],
      ["Transmission", "Traction avant (FWD)"],
      ["Modes de conduite", "Sport / Confort"],
      ["Vitesse maximale", "Environ 190 km/h"],
      ["0–100 km/h", "Environ 8,5 s"],
      ["Consommation mixte", "Environ 6,8 L/100 km selon les données publiées"],
      ["Réservoir", "51 L"],
      ["Longueur", "4 650 mm"],
      ["Largeur", "1 905 mm"],
      ["Hauteur", "1 630 mm"],
      ["Empattement", "2 775 mm"],
      ["Garde au sol", "202 mm"],
      ["Pneus", "235/55 R19"],
      ["Suspension avant", "McPherson indépendante"],
      ["Suspension arrière", "Multibras indépendante"],
      ["Freins", "Disques ventilés à l'avant / disques à l'arrière"],
    ]),
    details: [],
  },
  {
    id: "nova-city", name: "Nova City", brand: "Nova", type: "citadine", energy: "Essence", isNew: true, year: 2026, km: 0, price: 10500000,
    image: "images/citadine-bleue.svg",
    specs: spec([["Type", "Citadine 5 portes / 4 places"], ["Moteur", "1.0 essence, 3 cylindres"], ["Puissance", "75 ch"], ["Boîte", "Manuelle 5 rapports"], ["Consommation mixte", "5,1 L/100 km"], ["Réservoir", "35 L"], ["Longueur", "3 650 mm"], ["Largeur", "1 660 mm"]]),
    details: [["Garantie constructeur", "3 ans"], ["Délai de livraison", "2 semaines"]],
  },
  {
    id: "nova-city-sun", name: "Nova City Sun", brand: "Nova", type: "citadine", energy: "Hybride", isNew: false, year: 2024, km: 12000, price: 8850000,
    image: "images/citadine-jaune.svg",
    specs: spec([["Type", "Citadine 5 portes / 4 places"], ["Moteur", "1.2 hybride"], ["Puissance", "90 ch"], ["Boîte", "Automatique"], ["Consommation mixte", "4,2 L/100 km"], ["Réservoir", "36 L"], ["Longueur", "3 700 mm"], ["Largeur", "1 680 mm"]]),
    details: [["Année", "2024"], ["Kilométrage", "12 000 km"], ["Nombre de propriétaires", "1"], ["Historique d'entretien", "Carnet complet"]],
  },
  {
    id: "nova-line", name: "Nova Line", brand: "Nova", type: "berline", energy: "Diesel", isNew: false, year: 2023, km: 34000, price: 14350000,
    image: "images/berline-grise.svg",
    specs: spec([["Type", "Berline 4 portes / 5 places"], ["Moteur", "1.6 diesel, 4 cylindres"], ["Puissance", "130 ch"], ["Boîte", "Manuelle 6 rapports"], ["Consommation mixte", "4,9 L/100 km"], ["Réservoir", "50 L"], ["Longueur", "4 600 mm"], ["Largeur", "1 800 mm"]]),
    details: [["Année", "2023"], ["Kilométrage", "34 000 km"], ["Nombre de propriétaires", "1"], ["Dernier contrôle technique", "Janvier 2026, sans défaut"]],
  },
  {
    id: "nova-line-pure", name: "Nova Line Pure", brand: "Nova", type: "berline", energy: "Hybride", isNew: true, year: 2026, km: 0, price: 19650000,
    image: "images/berline-blanche.svg",
    specs: spec([["Type", "Berline 4 portes / 5 places"], ["Moteur", "1.8 hybride"], ["Puissance", "140 ch"], ["Boîte", "Automatique"], ["Consommation mixte", "4,5 L/100 km"], ["Réservoir", "43 L"], ["Longueur", "4 630 mm"], ["Largeur", "1 790 mm"]]),
    details: [["Garantie constructeur", "5 ans"], ["Délai de livraison", "3 à 4 semaines"]],
  },
  {
    id: "nova-trek", name: "Nova Trek", brand: "Nova", type: "suv", energy: "Hybride", isNew: true, year: 2026, km: 0, price: 22650000,
    image: "images/suv-rouge.svg",
    specs: spec([["Type", "SUV 5 portes / 5 places"], ["Moteur", "1.6 hybride rechargeable"], ["Puissance", "180 ch"], ["Boîte", "Automatique"], ["Consommation mixte", "2,0 L/100 km"], ["Réservoir", "45 L"], ["Longueur", "4 500 mm"], ["Largeur", "1 860 mm"]]),
    details: [["Garantie constructeur", "5 ans"], ["Délai de livraison", "4 semaines"]],
  },
  {
    id: "nova-trek-black", name: "Nova Trek Black", brand: "Nova", type: "suv", energy: "Diesel", isNew: false, year: 2022, km: 51000, price: 16350000,
    image: "images/suv-noir.svg",
    specs: spec([["Type", "SUV 5 portes / 5 places"], ["Moteur", "2.0 diesel, 4 cylindres"], ["Puissance", "150 ch"], ["Boîte", "Automatique 8 rapports"], ["Consommation mixte", "5,8 L/100 km"], ["Réservoir", "55 L"], ["Longueur", "4 520 mm"], ["Largeur", "1 860 mm"]]),
    details: [["Année", "2022"], ["Kilométrage", "51 000 km"], ["Nombre de propriétaires", "2"], ["Historique d'entretien", "Révisions en concession"]],
  },
  {
    id: "nova-e", name: "Nova E", brand: "Nova", type: "electrique", energy: "Électrique", isNew: true, year: 2026, km: 0, price: 20950000,
    image: "images/electrique-verte.svg",
    specs: spec([["Type", "Compacte 5 portes / 5 places"], ["Moteur", "Électrique"], ["Puissance", "204 ch"], ["Boîte", "Automatique"], ["Autonomie", "420 km"], ["Batterie", "60 kWh"], ["Longueur", "4 300 mm"], ["Largeur", "1 810 mm"]]),
    details: [["Garantie constructeur", "5 ans, batterie 8 ans"], ["Délai de livraison", "3 semaines"]],
  },
  {
    id: "nova-e-long-range", name: "Nova E Long Range", brand: "Nova", type: "electrique", energy: "Électrique", isNew: false, year: 2024, km: 9000, price: 24200000,
    image: "images/electrique-bleue.svg",
    specs: spec([["Type", "Compacte 5 portes / 5 places"], ["Moteur", "Électrique"], ["Puissance", "231 ch"], ["Boîte", "Automatique"], ["Autonomie", "540 km"], ["Batterie", "77 kWh"], ["Longueur", "4 300 mm"], ["Largeur", "1 810 mm"]]),
    details: [["Année", "2024"], ["Kilométrage", "9 000 km"], ["Nombre de propriétaires", "1"], ["État général", "Comme neuve"]],
  },
];

// ---------------------------------------------------------
//  Fiches ajoutées dans l'Espace vendeur : IndexedDB
//  (contrairement à localStorage, IndexedDB accepte les photos
//   et vidéos, mais elles restent dans CE navigateur)
// ---------------------------------------------------------
const DB_NAME = "autonova";
const STORE = "vehicules";
const REQUESTS = "demandes"; // demandes « Vendre ma voiture »

function openDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB indisponible"));
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(REQUESTS)) db.createObjectStore(REQUESTS, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbRequest(mode, action, store = STORE) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = action(tx.objectStore(store));
    tx.oncomplete = () => resolve(req && req.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const getLocalVehicles = () => dbRequest("readonly", (s) => s.getAll()).then((r) => r || []).catch(() => []);
const saveLocalVehicle = (v) => dbRequest("readwrite", (s) => s.put(v));
const deleteLocalVehicle = (id) => dbRequest("readwrite", (s) => s.delete(id));

const getSellRequests = () => dbRequest("readonly", (s) => s.getAll(), REQUESTS).then((r) => r || []).catch(() => []);
const saveSellRequest = (r) => dbRequest("readwrite", (s) => s.put(r), REQUESTS);
const deleteSellRequest = (id) => dbRequest("readwrite", (s) => s.delete(id), REQUESTS);

async function getAllVehicles() {
  const local = await getLocalVehicles();
  return [...local.map((v) => ({ ...v, local: true })), ...STATIC_VEHICLES];
}

async function getVehicle(id) {
  const all = await getAllVehicles();
  return all.find((v) => v.id === id) || null;
}

// Image principale : la 1re photo envoyée, sinon l'illustration
function coverUrl(v) {
  if (v.photos && v.photos.length) return URL.createObjectURL(v.photos[0]);
  return v.image || "images/suv-gris.svg";
}

// "Dongfeng Aeolus Mage 1.5T" → "dongfeng-aeolus-mage-1-5t"
function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const formatPriceOrAsk = (price) => (price ? formatPrice(price) : "Prix sur demande");

// ---------------------------------------------------------
//  Lecture d'une fiche collée (ex. copiée depuis Word ou un site)
//
//  Dongfeng Aeolus Mage 1.5T
//  Caractéristique	Donnée
//  Type	SUV 5 portes / 5 places
//  ...
//  Accepte : tabulation, « : », « | » ou plusieurs espaces.
// ---------------------------------------------------------
const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

function parseSpecSheet(text) {
  const result = { name: "", specs: [] };
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(/\t+|\s*\|\s*|\s*:\s+|\s{2,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) {
      if (!result.name) result.name = line; // 1re ligne seule = nom du véhicule
      continue;
    }
    const [label, ...rest] = parts;
    const value = rest.join(" ");
    if (normalize(label) === "caracteristique") continue; // ligne d'en-tête
    result.specs.push([label, value]);
  }
  return result;
}

// Retrouve le champ du formulaire qui correspond à un libellé
function fieldForLabel(label) {
  const n = normalize(label);
  const all = [...SPEC_FIELDS, ...NEW_FIELDS, ...USED_FIELDS];
  return all.find((f) => normalize(f.label) === n) ||
    all.find((f) => n.startsWith(normalize(f.label)) || normalize(f.label).startsWith(n)) ||
    null;
}

// Devine la catégorie et l'énergie à partir du texte de la fiche
function guessCategory(text) {
  const t = text.toLowerCase();
  if (/électrique|electrique|ev\b/.test(t)) return "electrique";
  if (/suv|4x4|crossover/.test(t)) return "suv";
  if (/berline|sedan/.test(t)) return "berline";
  if (/citadine|compacte/.test(t)) return "citadine";
  return "";
}
function guessEnergy(text) {
  const t = text.toLowerCase();
  if (/électrique|electrique/.test(t)) return "Électrique";
  if (/hybride/.test(t)) return "Hybride";
  if (/diesel|gasoil/.test(t)) return "Diesel";
  if (/essence|turbo|tsi|tfsi/.test(t)) return "Essence";
  return "";
}

// ---------------------------------------------------------
//  Carte produit (accueil + catalogue)
// ---------------------------------------------------------
const USAGE_LABELS = { citadine: "Ville", berline: "Route", suv: "Famille", electrique: "Zéro émission" };

function carCategory(v) {
  return `${TYPE_LABELS[v.type] || "Véhicule"} — ${USAGE_LABELS[v.type] || (v.isNew ? "Neuf" : "Occasion")}`;
}

// Petite description à partir de la fiche : puissance · boîte · énergie / km
function carDesc(v) {
  const get = (label) => ((v.specs || []).find(([l]) => l === label) || [])[1];
  const power = get("Puissance");
  const gearbox = (get("Boîte") || "").split(" ")[0];
  const parts = [power && power.split(" (")[0], gearbox && gearbox.toLowerCase(), v.isNew ? v.energy?.toLowerCase() : `${v.year} · ${v.km.toLocaleString("fr-FR")} km`];
  return parts.filter(Boolean).join(" · ");
}

function renderCarCard(car) {
  const url = `vehicule.html?id=${encodeURIComponent(car.id)}`;
  const article = document.createElement("article");
  article.className = "car-card";

  const photo = document.createElement("a");
  photo.className = "car-photo";
  photo.href = url;
  photo.tabIndex = -1;
  photo.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.src = coverUrl(car);
  img.alt = "";
  img.loading = "lazy";
  const flag = document.createElement("span");
  flag.className = "car-flag" + (car.isNew ? " is-new" : "");
  flag.textContent = car.isNew ? "Neuf" : "Occasion";
  photo.append(img, flag);

  const body = document.createElement("div");
  body.className = "car-body";
  const cat = document.createElement("p");
  cat.className = "car-cat";
  cat.textContent = carCategory(car);
  const title = document.createElement("h3");
  const link = document.createElement("a");
  link.className = "card-link";
  link.href = url;
  link.textContent = car.name;
  title.append(link);
  const desc = document.createElement("p");
  desc.className = "car-desc";
  desc.textContent = carDesc(car);

  const foot = document.createElement("div");
  foot.className = "car-foot";
  const priceBox = document.createElement("div");
  const price = document.createElement("p");
  price.className = "car-price";
  price.textContent = formatPriceOrAsk(car.price);
  priceBox.append(price);
  const btn = document.createElement("a");
  btn.className = "btn btn-outline";
  btn.href = url;
  btn.textContent = "Voir détails";
  btn.setAttribute("aria-label", `Voir les détails de ${car.name}`);
  foot.append(priceBox, btn);

  body.append(cat, title, desc, foot);
  article.append(photo, body);
  return article;
}
