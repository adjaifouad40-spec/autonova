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

// La carte est construite par renderCarCard() (js/vehicules.js)

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
    grid.replaceChildren(...list.map(renderCarCard));
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
