// =========================================================
//  Validation des formulaires (inscription et contact)
//  Chaque champ porte data-rules : "required", "email", "phone",
//  "min:2"... Les messages s'affichent sous le champ.
// =========================================================

const validators = {
  required: (v) => v.trim() !== "" || "Ce champ est obligatoire.",
  email: (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Adresse e-mail invalide.",
  phone: (v) => v === "" || /^[+0-9 ().-]{8,20}$/.test(v) || "Numéro de téléphone invalide.",
  min: (v, n) => v.trim().length >= Number(n) || `Au moins ${n} caractères.`,
  checked: (v, n, field) => field.checked || "Tu dois accepter pour continuer.",
  choice: (v, n, field) => Boolean(field.form.querySelector(`[name="${field.name}"]:checked`)) || "Choisis une réponse.",
  year: (v) => v === "" || (Number(v) >= 1980 && Number(v) <= new Date().getFullYear()) || `Année entre 1980 et ${new Date().getFullYear()}.`,
  km: (v) => v === "" || (Number(v) >= 0 && Number(v) <= 1000000) || "Kilométrage invalide.",
  price: (v) => v === "" || Number(v) >= 100000 || "Indique un prix d'au moins 100 000 F CFA.",
};

function validateField(field) {
  const rules = (field.dataset.rules || "").split(" ").filter(Boolean);
  let message = "";
  for (const rule of rules) {
    const [name, arg] = rule.split(":");
    const result = validators[name](field.value, arg, field);
    if (result !== true) {
      message = result;
      break;
    }
  }
  const wrapper = field.closest(".field, .checkbox-field");
  if (wrapper) {
    wrapper.classList.toggle("invalid", message !== "");
    const error = wrapper.querySelector(".error");
    if (error) error.textContent = message;
  }
  field.setAttribute("aria-invalid", message !== "");
  return message === "";
}

function setupForm(form) {
  const fields = form.querySelectorAll("[data-rules]");
  const success = form.querySelector(".form-success");

  // Validation en direct, une fois que l'utilisateur a quitté le champ
  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const results = [...fields].map(validateField);
    if (results.includes(false)) {
      form.querySelector("[aria-invalid='true']").focus();
      return;
    }
    // Site statique : pas de serveur. On affiche une confirmation.
    const firstName = form.querySelector("[name='prenom']")?.value.trim();
    success.textContent = form.dataset.success.replace("{prenom}", firstName || "");
    success.classList.add("visible");
    form.reset();
    fields.forEach((f) => f.removeAttribute("aria-invalid"));
    success.focus();
  });
}

document.querySelectorAll("form[data-validate]").forEach(setupForm);

// Page d'inscription : modèle pré-rempli depuis le catalogue (inscription.html?modele=...)
const modelSelect = document.getElementById("modele");
const wanted = new URLSearchParams(window.location.search).get("modele");
if (modelSelect && wanted) {
  const option = [...modelSelect.options].find((o) => o.value === wanted);
  if (option) modelSelect.value = wanted;
}
