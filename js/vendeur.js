// =========================================================
//  Espace vendeur : créer, modifier et supprimer des fiches
//  - Neuf / Occasion : les champs propres à chaque état s'affichent
//  - Photos et vidéo depuis le téléphone ou l'ordinateur
//  - « Coller une fiche » : remplit le formulaire à partir d'un tableau
//  - Enregistrement dans IndexedDB (dans CE navigateur)
// =========================================================

const form = document.getElementById("vehicle-form");
const specContainer = document.getElementById("spec-fieldsets");
const newBox = document.getElementById("new-fields");
const usedBox = document.getElementById("used-fields");
const extraList = document.getElementById("extra-rows");
const photoInput = document.getElementById("photos");
const videoInput = document.getElementById("video");
const photoPreview = document.getElementById("photo-preview");
const videoPreview = document.getElementById("video-preview");
const status = document.getElementById("form-status");
const listEl = document.getElementById("my-vehicles");

const MAX_PHOTOS = 10;
const MAX_PHOTO_MB = 15;
const MAX_VIDEO_MB = 150;

let photos = [];      // fichiers image choisis
let video = null;     // fichier vidéo choisi
let editingId = null; // id de la fiche en cours de modification

// ---------- Construction des champs à partir des listes de vehicules.js ----------
function inputField(f, prefix) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const id = `${prefix}-${f.key}`;
  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = f.label === "Type" ? "Carrosserie et places" : f.label;
  const input = document.createElement(f.key === "finition" || f.key === "entretien" ? "textarea" : "input");
  input.id = id;
  input.name = f.key;
  if (input.tagName === "INPUT") input.type = f.type || "text";
  if (input.tagName === "TEXTAREA") input.rows = 2;
  if (f.type === "number") { input.min = "0"; input.inputMode = "numeric"; }
  input.placeholder = f.placeholder || "";
  const err = document.createElement("span");
  err.className = "error";
  wrap.append(label, input, err);
  return wrap;
}

SPEC_GROUPS.forEach((g) => {
  const fs = document.createElement("fieldset");
  fs.className = "panel form-section";
  const lg = document.createElement("legend");
  lg.textContent = `${g.icon} ${g.title}`;
  const grid = document.createElement("div");
  grid.className = "form-grid";
  SPEC_FIELDS.filter((f) => f.group === g.id).forEach((f) => grid.append(inputField(f, "spec")));
  fs.append(lg, grid);
  specContainer.append(fs);
});
NEW_FIELDS.forEach((f) => newBox.querySelector(".form-grid").append(inputField(f, "new")));
USED_FIELDS.forEach((f) => usedBox.querySelector(".form-grid").append(inputField(f, "used")));

// ---------- Neuf / Occasion ----------
function updateCondition() {
  const isNew = form.condition.value === "neuf";
  newBox.hidden = !isNew;
  usedBox.hidden = isNew;
  newBox.querySelectorAll("input, textarea").forEach((i) => (i.disabled = !isNew));
  usedBox.querySelectorAll("input, textarea").forEach((i) => (i.disabled = isNew));
}
form.querySelectorAll("input[name='condition']").forEach((r) => r.addEventListener("change", updateCondition));

// ---------- Autres caractéristiques (lignes libres) ----------
function addExtraRow(label = "", value = "") {
  const li = document.createElement("li");
  li.className = "extra-row";
  const l = document.createElement("input");
  l.placeholder = "Caractéristique (ex. Coffre)";
  l.value = label;
  l.setAttribute("aria-label", "Nom de la caractéristique");
  const v = document.createElement("input");
  v.placeholder = "Donnée (ex. 480 L)";
  v.value = value;
  v.setAttribute("aria-label", "Valeur de la caractéristique");
  const del = document.createElement("button");
  del.type = "button";
  del.className = "icon-btn-small";
  del.textContent = "×";
  del.setAttribute("aria-label", "Retirer cette ligne");
  del.addEventListener("click", () => li.remove());
  li.append(l, v, del);
  extraList.append(li);
}
document.getElementById("add-extra").addEventListener("click", () => addExtraRow());

// ---------- Photos et vidéo ----------
function renderMedia() {
  photoPreview.replaceChildren();
  photos.forEach((file, i) => {
    const fig = document.createElement("figure");
    fig.className = "preview-item";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = `Photo ${i + 1}`;
    const cap = document.createElement("figcaption");
    cap.textContent = i === 0 ? "Photo principale" : `Photo ${i + 1}`;
    const del = document.createElement("button");
    del.type = "button";
    del.className = "icon-btn-small";
    del.textContent = "×";
    del.setAttribute("aria-label", `Retirer la photo ${i + 1}`);
    del.addEventListener("click", () => { photos.splice(i, 1); renderMedia(); });
    fig.append(img, cap, del);
    photoPreview.append(fig);
  });

  videoPreview.replaceChildren();
  if (video) {
    const v = document.createElement("video");
    v.src = URL.createObjectURL(video);
    v.controls = true;
    v.playsInline = true;
    const del = document.createElement("button");
    del.type = "button";
    del.className = "link-btn";
    del.textContent = "Retirer la vidéo";
    del.addEventListener("click", () => { video = null; videoInput.value = ""; renderMedia(); });
    videoPreview.append(v, del);
  }
}

photoInput.addEventListener("change", () => {
  const errors = [];
  for (const file of photoInput.files) {
    if (!file.type.startsWith("image/")) errors.push(`${file.name} n'est pas une image.`);
    else if (file.size > MAX_PHOTO_MB * 1024 * 1024) errors.push(`${file.name} dépasse ${MAX_PHOTO_MB} Mo.`);
    else if (photos.length >= MAX_PHOTOS) errors.push(`${MAX_PHOTOS} photos maximum.`);
    else photos.push(file);
  }
  photoInput.value = "";
  document.getElementById("photo-error").textContent = [...new Set(errors)].join(" ");
  renderMedia();
});

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  const err = document.getElementById("video-error");
  err.textContent = "";
  if (!file) return;
  if (!file.type.startsWith("video/")) err.textContent = "Ce fichier n'est pas une vidéo.";
  else if (file.size > MAX_VIDEO_MB * 1024 * 1024) err.textContent = `La vidéo dépasse ${MAX_VIDEO_MB} Mo.`;
  else video = file;
  renderMedia();
});

// ---------- Coller une fiche technique ----------
document.getElementById("import-btn").addEventListener("click", () => {
  const text = document.getElementById("import-text").value;
  const msg = document.getElementById("import-status");
  const parsed = parseSpecSheet(text);
  if (!parsed.name && !parsed.specs.length) {
    msg.textContent = "Rien à lire : colle le nom du véhicule puis une caractéristique par ligne.";
    msg.className = "import-status is-error";
    return;
  }
  if (parsed.name) form.vehicleName.value = parsed.name;
  let recognised = 0;
  const extras = [];
  parsed.specs.forEach(([label, value]) => {
    const field = fieldForLabel(label);
    const input = field && form.querySelector(`[name='${field.key}']`);
    if (input) {
      input.value = input.type === "number" ? value.replace(/[^\d]/g, "") : value;
      recognised++;
    } else extras.push([label, value]);
  });
  extras.forEach(([l, v]) => addExtraRow(l, v));

  const all = `${parsed.name} ${parsed.specs.map((s) => s.join(" ")).join(" ")}`;
  if (!form.brand.value && parsed.name) form.brand.value = parsed.name.split(" ")[0];
  if (!form.category.value) form.category.value = guessCategory(all);
  if (!form.energy.value) form.energy.value = guessEnergy(all);

  msg.textContent = `${recognised} caractéristique${recognised > 1 ? "s" : ""} placée${recognised > 1 ? "s" : ""} dans le formulaire` +
    (extras.length ? `, ${extras.length} ajoutée${extras.length > 1 ? "s" : ""} dans « Autres caractéristiques ».` : ".") +
    " Vérifie, choisis Neuf ou Occasion et ajoute tes photos.";
  msg.className = "import-status is-ok";
  form.scrollIntoView({ behavior: "smooth" });
});

// ---------- Lecture et validation du formulaire ----------
function setError(name, message) {
  const input = form.querySelector(`[name='${name}']`);
  const wrap = input.closest(".field");
  wrap.classList.toggle("invalid", Boolean(message));
  wrap.querySelector(".error").textContent = message || "";
  return !message;
}

function validate() {
  const isNew = form.condition.value === "neuf";
  const year = Number(form.annee.value);
  const now = new Date().getFullYear();
  const checks = [
    setError("vehicleName", form.vehicleName.value.trim().length < 3 ? "Indique le nom complet du véhicule." : ""),
    setError("category", form.category.value ? "" : "Choisis une catégorie."),
    setError("price", form.price.value && Number(form.price.value) < 0 ? "Prix invalide." : ""),
  ];
  if (!isNew) {
    checks.push(setError("annee", !year || year < 1980 || year > now ? `Année entre 1980 et ${now}.` : ""));
    checks.push(setError("kilometrage", form.kilometrage.value === "" ? "Indique le kilométrage." : ""));
  }
  return checks.every(Boolean);
}

function readForm() {
  const isNew = form.condition.value === "neuf";
  const name = form.vehicleName.value.trim();
  const specs = SPEC_FIELDS
    .map((f) => [f.label, form.querySelector(`[name='${f.key}']`).value.trim()])
    .filter(([, v]) => v);
  extraList.querySelectorAll(".extra-row").forEach((row) => {
    const [l, v] = row.querySelectorAll("input");
    if (l.value.trim() && v.value.trim()) specs.push([l.value.trim(), v.value.trim()]);
  });
  const fields = isNew ? NEW_FIELDS : USED_FIELDS;
  const details = fields
    .map((f) => {
      let value = form.querySelector(`[name='${f.key}']`).value.trim();
      if (f.key === "kilometrage" && value) value = `${Number(value).toLocaleString("fr-FR")} km`;
      return [f.label, value];
    })
    .filter(([, v]) => v);
  return {
    name,
    brand: form.brand.value.trim(),
    type: form.category.value,
    energy: form.energy.value || guessEnergy(specs.map((s) => s[1]).join(" ")) || "—",
    isNew,
    year: isNew ? new Date().getFullYear() : Number(form.annee.value),
    km: isNew ? 0 : Number(form.kilometrage.value),
    price: form.price.value ? Number(form.price.value) : null,
    image: `images/${{ citadine: "citadine-bleue", berline: "berline-grise", suv: "suv-gris", electrique: "electrique-verte" }[form.category.value] || "suv-gris"}.svg`,
    specs,
    details,
    photos: [...photos],
    video,
    updatedAt: Date.now(),
  };
}

async function uniqueId(name) {
  const base = slugify(name) || "vehicule";
  const taken = new Set((await getAllVehicles()).map((v) => v.id));
  let id = base, n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.className = "form-status";
  if (!validate()) {
    status.textContent = "Corrige les champs en rouge.";
    status.classList.add("is-error");
    form.querySelector(".invalid input, .invalid select")?.focus();
    return;
  }
  const vehicle = readForm();
  vehicle.id = editingId || (await uniqueId(vehicle.name));
  try {
    await saveLocalVehicle(vehicle);
  } catch (err) {
    status.textContent = "Enregistrement impossible : l'espace de stockage de ton navigateur est peut-être plein (vidéo trop lourde ?).";
    status.classList.add("is-error");
    return;
  }
  status.replaceChildren(`Fiche « ${vehicle.name} » enregistrée. `);
  const link = document.createElement("a");
  link.href = `vehicule.html?id=${encodeURIComponent(vehicle.id)}`;
  link.textContent = "Voir la fiche →";
  status.append(link);
  status.classList.add("is-ok");
  resetForm(false);
  renderList();
});

function resetForm(clearStatus = true) {
  form.reset();
  extraList.replaceChildren();
  photos = [];
  video = null;
  editingId = null;
  form.querySelectorAll(".invalid").forEach((w) => w.classList.remove("invalid"));
  form.querySelectorAll(".error").forEach((e) => (e.textContent = ""));
  document.getElementById("submit-btn").textContent = "Enregistrer la fiche";
  document.getElementById("form-title").textContent = "Nouvelle fiche véhicule";
  if (clearStatus) status.textContent = "";
  updateCondition();
  renderMedia();
}
document.getElementById("reset-btn").addEventListener("click", () => resetForm());

// ---------- Modifier une fiche existante ----------
function fillForm(v) {
  resetForm();
  editingId = v.id;
  form.condition.value = v.isNew ? "neuf" : "occasion";
  updateCondition();
  form.vehicleName.value = v.name;
  form.brand.value = v.brand || "";
  form.category.value = v.type || "";
  form.energy.value = ["Essence", "Diesel", "Hybride", "Électrique"].includes(v.energy) ? v.energy : "";
  form.price.value = v.price || "";
  [...v.specs, ...v.details].forEach(([label, value]) => {
    const field = fieldForLabel(label);
    const input = field && form.querySelector(`[name='${field.key}']`);
    if (input) input.value = input.type === "number" ? String(value).replace(/[^\d]/g, "") : value;
    else addExtraRow(label, value);
  });
  photos = [...(v.photos || [])];
  video = v.video || null;
  renderMedia();
  document.getElementById("submit-btn").textContent = "Enregistrer les modifications";
  document.getElementById("form-title").textContent = `Modifier : ${v.name}`;
  form.scrollIntoView({ behavior: "smooth" });
}

// ---------- Export : texte à coller dans js/vehicules.js pour publier ----------
function exportVehicle(v) {
  const data = { id: v.id, name: v.name, brand: v.brand, type: v.type, energy: v.energy, isNew: v.isNew, year: v.year, km: v.km, price: v.price, image: v.image, specs: v.specs, details: v.details };
  const box = document.getElementById("export-box");
  const text = document.getElementById("export-text");
  text.value = JSON.stringify(data, null, 2) + ",";
  box.hidden = false;
  text.select();
  navigator.clipboard?.writeText(text.value).catch(() => {});
  box.scrollIntoView({ behavior: "smooth" });
}

// ---------- Liste « Mes fiches » ----------
async function renderList() {
  const local = (await getLocalVehicles()).sort((a, b) => b.updatedAt - a.updatedAt);
  listEl.replaceChildren();
  document.getElementById("my-count").textContent = local.length ? `(${local.length})` : "";
  if (!local.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Aucune fiche pour l'instant. Remplis le formulaire ci-dessus.";
    listEl.append(p);
    return;
  }
  local.forEach((v) => {
    const item = document.createElement("article");
    item.className = "my-vehicle";
    const img = document.createElement("img");
    img.src = coverUrl(v);
    img.alt = "";
    const info = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = v.name;
    const meta = document.createElement("p");
    const badge = document.createElement("span");
    badge.className = "condition-badge small " + (v.isNew ? "is-new" : "is-used");
    badge.textContent = v.isNew ? "Neuf" : "Occasion";
    meta.append(badge, ` ${formatPriceOrAsk(v.price)} · ${(v.photos || []).length} photo(s)${v.video ? " · vidéo" : ""}`);
    info.append(h3, meta);

    const actions = document.createElement("div");
    actions.className = "my-actions";
    const view = document.createElement("a");
    view.href = `vehicule.html?id=${encodeURIComponent(v.id)}`;
    view.textContent = "Voir";
    const edit = document.createElement("button");
    edit.type = "button"; edit.textContent = "Modifier";
    edit.addEventListener("click", () => fillForm(v));
    const exp = document.createElement("button");
    exp.type = "button"; exp.textContent = "Exporter";
    exp.addEventListener("click", () => exportVehicle(v));
    const del = document.createElement("button");
    del.type = "button"; del.textContent = "Supprimer"; del.className = "danger";
    del.addEventListener("click", async () => {
      if (!confirm(`Supprimer définitivement la fiche « ${v.name} » ?`)) return;
      await deleteLocalVehicle(v.id);
      if (editingId === v.id) resetForm();
      renderList();
    });
    actions.append(view, edit, exp, del);
    item.append(img, info, actions);
    listEl.append(item);
  });
}

updateCondition();
renderList();

// Efface l'erreur d'un champ dès qu'on le corrige
form.addEventListener("input", (e) => {
  const wrap = e.target.closest(".field.invalid");
  if (wrap) {
    wrap.classList.remove("invalid");
    wrap.querySelector(".error").textContent = "";
  }
});
