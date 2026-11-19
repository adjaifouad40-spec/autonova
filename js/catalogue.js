// =========================================================
//  Catalogue : données des véhicules + filtres dynamiques
// =========================================================

// Les véhicules viennent de js/vehicules.js (site + Espace vendeur)
let cars = [];
const typeLabels = TYPE_LABELS;

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
  img.src = coverUrl(car);
  img.alt = `${car.name}, ${typeLabels[car.type].toLowerCase()}`;
  img.loading = "lazy";

  const body = document.createElement("div");
  body.className = "car-body";

  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = `vehicule.html?id=${encodeURIComponent(car.id)}`;
  titleLink.textContent = car.name;
  titleLink.className = "card-link";
  title.append(titleLink);

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
  price.textContent = formatPriceOrAsk(car.price);

  const month = document.createElement("p");
  month.className = "car-month";
  month.textContent = car.price ? `ou environ ${formatPrice(monthlyEstimate(car.price))} / mois*` : "Contactez-nous pour un devis";

  const link = document.createElement("a");
  link.className = "btn btn-dark";
  link.href = `vehicule.html?id=${encodeURIComponent(car.id)}`;
  link.textContent = "Voir la fiche";
  link.setAttribute("aria-label", `Voir la fiche de ${car.name}`);

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
    (car.price === null || car.price <= maxPrice) &&
    (condition === "all" || (condition === "neuf" ? car.isNew : !car.isNew))
  );

  const p = (c, empty) => (c.price === null ? empty : c.price);
  if (sortSelect.value === "price-asc") list.sort((a, b) => p(a, Infinity) - p(b, Infinity));
  if (sortSelect.value === "price-desc") list.sort((a, b) => p(b, -Infinity) - p(a, -Infinity));
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
getAllVehicles().then((list) => {
  cars = list;
  // Le curseur de budget s'adapte au véhicule le plus cher
  const maxPrice = Math.max(10000000, ...cars.map((c) => c.price || 0));
  const step = maxPrice > 200000 ? 100000 : 500;
  priceRange.max = Math.ceil(maxPrice / step) * step;
  priceRange.min = 0;
  priceRange.step = step;
  priceRange.value = priceRange.max;
  render();
});
