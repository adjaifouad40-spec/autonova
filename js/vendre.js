// =========================================================
//  « Vendre ma voiture » : un particulier propose sa voiture.
//  La demande (détails + photos) est validée puis enregistrée ;
//  elle apparaît dans l'Espace vendeur, où l'on peut créer la fiche.
// =========================================================

const sellForm = document.getElementById("sell-form");
const sellPhotosInput = document.getElementById("s-photos");
const sellPreview = document.getElementById("s-photo-preview");
const sellStatus = document.getElementById("sell-status");
const MAX_SELL_PHOTOS = 8;
let sellPhotos = [];

function renderSellPhotos() {
  sellPreview.replaceChildren();
  sellPhotos.forEach((file, i) => {
    const fig = document.createElement("figure");
    fig.className = "preview-item";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = `Photo ${i + 1}`;
    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn-small";
    del.textContent = "×";
    del.setAttribute("aria-label", `Retirer la photo ${i + 1}`);
    del.addEventListener("click", () => { sellPhotos.splice(i, 1); renderSellPhotos(); });
    const cap = document.createElement("figcaption");
    cap.textContent = i === 0 ? "Photo principale" : `Photo ${i + 1}`;
    fig.append(img, cap, del);
    sellPreview.append(fig);
  });
}

sellPhotosInput.addEventListener("change", () => {
  const err = document.getElementById("s-photos-error");
  err.textContent = "";
  for (const file of sellPhotosInput.files) {
    if (!file.type.startsWith("image/")) err.textContent = `${file.name} n'est pas une image.`;
    else if (file.size > 15 * 1024 * 1024) err.textContent = `${file.name} dépasse 15 Mo.`;
    else if (sellPhotos.length >= MAX_SELL_PHOTOS) err.textContent = `${MAX_SELL_PHOTOS} photos maximum.`;
    else sellPhotos.push(file);
  }
  sellPhotosInput.value = "";
  renderSellPhotos();
});

const fields = sellForm.querySelectorAll("[data-rules]");
fields.forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
  field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
});

const val = (name) => (sellForm.elements[name]?.value || "").trim();

sellForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  sellStatus.classList.remove("visible");
  const ok = [...fields].map(validateField).every(Boolean);
  const photoErr = document.getElementById("s-photos-error");
  photoErr.textContent = sellPhotos.length ? "" : "Ajoute au moins une photo de la voiture.";
  if (!ok || !sellPhotos.length) {
    (sellForm.querySelector("[aria-invalid='true']") || sellPhotosInput).focus();
    return;
  }

  const request = {
    id: `demande-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    status: "nouvelle",
    car: {
      marque: val("s-marque"), modele: val("s-modele"), version: val("s-version"),
      annee: Number(val("s-annee")), km: Number(val("s-km")),
      energie: val("s-energie"), boite: val("s-boite"), categorie: val("s-categorie"),
      couleur: val("s-couleur"), cylindree: val("s-cylindree"), puissance: val("s-puissance"),
      portes: val("s-portes"), consommation: val("s-carburant-conso"),
      etat: val("s-etat"), proprietaires: val("s-proprietaires"), entretien: val("s-entretien"),
      controle: val("s-controle"),
      accident: sellForm.querySelector("[name='s-accident']:checked").value,
      accidentDetails: val("s-accident-details"), options: val("s-options"),
      prix: Number(val("s-prix")), negociable: sellForm.elements["s-negociable"].checked,
      documents: [...sellForm.querySelectorAll("[name='s-doc']:checked")].map((c) => c.value),
    },
    seller: {
      prenom: val("s-prenom"), nom: val("s-nom"), tel: val("s-tel"), email: val("s-email"),
      ville: val("s-ville"), dispo: val("s-dispo"),
    },
    photos: [...sellPhotos],
  };

  try {
    await saveSellRequest(request);
  } catch (e) {
    sellStatus.textContent = "Enregistrement impossible : l'espace de stockage de ton navigateur est peut-être plein. Essaie avec moins de photos.";
    sellStatus.classList.add("visible");
    return;
  }
  sellStatus.textContent = `Merci ${request.seller.prenom} ! Ta demande pour la ${request.car.marque} ${request.car.modele} est bien enregistrée. Un conseiller te rappelle sous 48 h au ${request.seller.tel}.`;
  sellStatus.classList.add("visible");
  sellForm.reset();
  sellPhotos = [];
  renderSellPhotos();
  fields.forEach((f) => f.removeAttribute("aria-invalid"));
  sellStatus.focus();
});
