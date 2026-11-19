// =========================================================
//  Catalogue : données des véhicules + filtres dynamiques
// =========================================================

const cars = [
  { name: "Nova City", type: "citadine", energy: "Essence", year: 2025, km: 0, price: 15990, image: "citadine-bleue.svg", isNew: true },
  { name: "Nova City Sun", type: "citadine", energy: "Hybride", year: 2024, km: 12000, price: 13490, image: "citadine-jaune.svg", isNew: false },
  { name: "Nova Line", type: "berline", energy: "Diesel", year: 2023, km: 34000, price: 21900, image: "berline-grise.svg", isNew: false },
  { name: "Nova Line Pure", type: "berline", energy: "Hybride", year: 2025, km: 0, price: 29990, image: "berline-blanche.svg", isNew: true },
  { name: "Nova Trek", type: "suv", energy: "Hybride", year: 2025, km: 0, price: 34500, image: "suv-rouge.svg", isNew: true },
  { name: "Nova Trek Black", type: "suv", energy: "Diesel", year: 2022, km: 51000, price: 24900, image: "suv-noir.svg", isNew: false },
  { name: "Nova E", type: "electrique", energy: "Électrique", year: 2025, km: 0, price: 31900, image: "electrique-verte.svg", isNew: true },
  { name: "Nova E Long Range", type: "electrique", energy: "Électrique", year: 2024, km: 9000, price: 36900, image: "electrique-bleue.svg", isNew: false },
];

const typeLabels = { citadine: "Citadine", berline: "Berline", suv: "SUV", electrique: "Électrique" };

const grid = document.getElementById("car-grid");
const typeSelect = document.getElementById("filter-type");
const priceRange = document.getElementById("filter-price");
const priceOutput = document.getElementById("price-output");
const conditionSelect = document.getElementById("filter-condition");
const sortSelect = document.getElementById("sort");
const count = document.getElementById("result-count");

// Mensualité indicative sur 60 mois avec 10 % d'apport et un taux annuel de 4,9 %
function monthlyEstimate(price) {
  const loan = price * 0.9;
  const r = 0.049 / 12;
  const n = 60;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

function createCarCard(car) {
  const article = document.createElement("article");
  article.className = "car-card";

  const img = document.createElement("img");
  img.src = `images/${car.image}`;
  img.alt = `${car.name}, ${typeLabels[car.type].toLowerCase()}`;
  img.loading = "lazy";

  const body = document.createElement("div");
  body.className = "car-body";

  const title = document.createElement("h3");
  title.textContent = car.name;

  const meta = document.createElement("div");
  meta.className = "car-meta";
  const tags = [
    car.isNew ? "Neuf" : "Occasion",
    typeLabels[car.type],
    car.energy,
    car.km === 0 ? "0 km" : `${car.km.toLocaleString("fr-FR")} km`,
    String(car.year),
  ];
  tags.forEach((label, i) => {
    const tag = document.createElement("span");
    tag.className = "tag" + (i === 0 && car.isNew ? " tag-new" : "");
    tag.textContent = label;
    meta.append(tag);
  });

  const price = document.createElement("p");
  price.className = "car-price";
  price.textContent = formatPrice(car.price);

  const month = document.createElement("p");
  month.className = "car-month";
  month.textContent = `ou environ ${formatPrice(monthlyEstimate(car.price))} / mois*`;

  const link = document.createElement("a");
  link.className = "btn btn-dark";
  link.href = `inscription.html?modele=${encodeURIComponent(car.name)}`;
  link.textContent = "Réserver un essai";

  body.append(title, meta, price, month, link);
  article.append(img, body);
  return article;
}

function render() {
  const type = typeSelect.value;
  const maxPrice = Number(priceRange.value);
  const condition = conditionSelect.value;

  let list = cars.filter((car) =>
    (type === "all" || car.type === type) &&
    car.price <= maxPrice &&
    (condition === "all" || (condition === "neuf" ? car.isNew : !car.isNew))
  );

  if (sortSelect.value === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "year") list.sort((a, b) => b.year - a.year);

  priceOutput.textContent = formatPrice(maxPrice);
  count.textContent = `${list.length} véhicule${list.length > 1 ? "s" : ""} trouvé${list.length > 1 ? "s" : ""}`;

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Aucun véhicule ne correspond à ces critères. Essayez d'augmenter le budget.";
    grid.replaceChildren(empty);
  } else {
    grid.replaceChildren(...list.map(createCarCard));
  }
}

// Filtre pré-rempli depuis l'URL (ex. catalogue.html?type=suv depuis l'accueil)
const params = new URLSearchParams(window.location.search);
if (params.get("type") && typeLabels[params.get("type")]) typeSelect.value = params.get("type");

[typeSelect, priceRange, conditionSelect, sortSelect].forEach((el) => el.addEventListener("input", render));
render();
