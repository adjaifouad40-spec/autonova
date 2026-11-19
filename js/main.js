// =========================================================
//  AutoNova — script commun à toutes les pages
//  Menu mobile, année du pied de page, animations au défilement.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Menu mobile ---
  const toggle = document.querySelector(".menu-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.textContent = open ? "✕ Fermer" : "☰ Menu";
    });
  }

  // --- Année du pied de page ---
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // --- Apparition des blocs au défilement ---
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }
});

// Formatage commun des prix (utilisé par les autres scripts)
const formatPrice = (value) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
