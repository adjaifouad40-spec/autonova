// =========================================================
//  Estimation de reprise (indicative)
//  Valeur de départ selon la catégorie, puis décote par âge,
//  kilométrage et état du véhicule.
// =========================================================

const form = document.getElementById("tradein-form");
const result = document.getElementById("tradein-result");
const resultValue = document.getElementById("tradein-value");
const resultRange = document.getElementById("tradein-range");

const baseValues = { citadine: 16000, berline: 26000, suv: 32000, electrique: 34000 };
const conditionFactor = { excellent: 1, bon: 0.9, moyen: 0.75 };

function estimate({ category, year, km, condition }) {
  const age = Math.max(0, new Date().getFullYear() - year);
  let value = baseValues[category];
  value *= Math.pow(0.85, age);               // −15 % par an
  value *= Math.max(0.35, 1 - km / 300000);   // décote liée au kilométrage
  value *= conditionFactor[condition];
  return Math.max(500, Math.round(value / 100) * 100);
}

function showError(field, message) {
  const wrapper = field.closest(".field");
  wrapper.classList.toggle("invalid", Boolean(message));
  wrapper.querySelector(".error").textContent = message;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentYear = new Date().getFullYear();
  const category = form.category.value;
  const year = Number(form.year.value);
  const km = Number(form.km.value);
  const condition = form.condition.value;
  let valid = true;

  showError(form.category, category ? "" : "Choisissez une catégorie.");
  if (!category) valid = false;

  if (!year || year < 1995 || year > currentYear) {
    showError(form.year, `Année entre 1995 et ${currentYear}.`);
    valid = false;
  } else showError(form.year, "");

  if (form.km.value === "" || km < 0 || km > 500000) {
    showError(form.km, "Kilométrage entre 0 et 500 000 km.");
    valid = false;
  } else showError(form.km, "");

  if (!valid) {
    result.hidden = true;
    return;
  }

  const value = estimate({ category, year, km, condition });
  resultValue.textContent = formatPrice(value);
  resultRange.textContent = `Fourchette indicative : ${formatPrice(value * 0.9)} – ${formatPrice(value * 1.1)}`;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
