# AutoNova — spec.md

## 1. Objectif
Site de marketing pour le lancement d'AutoNova, une concession de voitures 100 % en ligne. Le site doit **présenter le service**, **détailler ses fonctionnalités** et **convertir** les visiteurs : inscription aux offres ou prise de contact.

## 2. Exigences du projet et réponses
| Exigence (énoncé GOMYCODE) | Réalisation |
|---|---|
| Accueil avec photographie et vue d'ensemble | `index.html` : héros avec image, chiffres clés, « Comment ça marche » |
| Pages de fonctionnalités liées depuis l'accueil | 4 cartes vers `catalogue`, `financement`, `reprise` et `garantie-livraison` |
| Landing page d'inscription avec formulaire | `inscription.html` : offre de 500 €, avantages, formulaire validé |
| Page Contact avec formulaire | `contact.html` |
| Lien d'appel à l'action vers Contact en bas de chaque page, sauf Contact | Bandeau `.cta-band` sur 6 pages, absent de `contact.html` |

## 3. Arborescence et navigation
```
Accueil ──┬── Catalogue ─────── (Réserver un essai) ──► Inscription?modele=…
          ├── Financement ───── (Être rappelé) ───────► Inscription
          ├── Reprise
          ├── Garantie & livraison
          ├── Inscription
          └── Contact   ◄── bandeau CTA en bas des 6 autres pages
```
La barre de navigation est identique sur toutes les pages, et `aria-current="page"` marque la page active.

## 4. Composants communs
- **En-tête fixe** : logo, liens, bouton « S'inscrire » mis en avant, menu repliable sous 760 px.
- **Héros de page** (`.page-hero`) : fil d'Ariane, titre, sous-titre.
- **Cartes** (`.feature-card`, `.car-card`), **étapes numérotées** (`.steps`), **tableaux**, **FAQ** (`<details>`).
- **Bandeau d'appel à l'action** (`.cta-band`) et **pied de page**.

## 5. Données
```js
// js/catalogue.js
{ name: "Nova Trek", type: "suv", energy: "Hybride", year: 2025, km: 0, price: 34500, image: "suv-rouge.svg", isNew: true }
```
Le catalogue compte 8 véhicules. Les types sont `citadine`, `berline`, `suv` et `electrique`.

## 6. Fonctions JavaScript principales
| Fichier | Fonction | Rôle |
|---|---|---|
| `main.js` | `formatPrice(v)` | Formate un prix en euros (`Intl.NumberFormat`) |
| `catalogue.js` | `createCarCard(car)` | Construit une carte véhicule (`createElement` et `textContent`) |
| `catalogue.js` | `render()` | Applique les filtres type, état et budget et le tri, puis met à jour le compteur |
| `catalogue.js` | `monthlyEstimate(price)` | Mensualité indicative (60 mois, 10 % d'apport, 4,9 %) |
| `financement.js` | `monthlyPayment(C, taux, n)` | Formule du crédit, avec le cas du taux à 0 % |
| `reprise.js` | `estimate({...})` | Valeur de base × 0,85^âge × décote kilométrique × état |
| `forms.js` | `validateField(field)` | Applique les règles `data-rules` et affiche l'erreur |
| `forms.js` | `setupForm(form)` | Validation au blur et à l'envoi, focus sur la 1re erreur, message de succès |

## 7. Règles de validation
| Formulaire | Champ | Règles |
|---|---|---|
| Inscription | Prénom, nom | obligatoire, 2 caractères minimum |
| Inscription | E-mail | obligatoire, format valide |
| Inscription | Téléphone | facultatif, 8 à 20 chiffres ou symboles téléphoniques |
| Inscription | Consentement | case cochée obligatoire |
| Contact | Prénom, e-mail, sujet, message | obligatoires (message : 10 caractères minimum) |
| Reprise | Année | entre 1995 et l'année en cours |
| Reprise | Kilométrage | entre 0 et 500 000 km |
| Financement | Prix | entre 1 000 € et 200 000 € |

## 8. Responsive
Les points de rupture sont 900 px (colonnes empilées), 760 px (menu mobile, formulaires sur une colonne) et 480 px (boutons pleine largeur). Les grilles utilisent `repeat(auto-fit, minmax(250px, 1fr))`.

## 9. Limites connues et suites possibles
- Aucun serveur : les formulaires ne sont pas envoyés. On pourrait les brancher sur un service comme Formspree.
- Données statiques : on pourrait les charger depuis un fichier JSON ou une API.
- Illustrations SVG à remplacer par de vraies photos.
