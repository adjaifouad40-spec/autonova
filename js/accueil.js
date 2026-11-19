// Accueil : affiche 6 véhicules du catalogue (neufs en premier)
const homeGrid = document.getElementById("home-products");
if (homeGrid) {
  getAllVehicles().then((list) => {
    const selection = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew)).slice(0, 6);
    homeGrid.replaceChildren(...selection.map(renderCarCard));
  });
}
