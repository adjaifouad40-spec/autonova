// =========================================================
//  Simulateur de financement (crédit classique)
//  Mensualité = C × t / (1 − (1 + t)^−n)
//  C = capital emprunté, t = taux mensuel, n = nombre de mois
// =========================================================

const priceInput = document.getElementById("car-price");
const downInput = document.getElementById("down-payment");
const durationInput = document.getElementById("duration");
const rateInput = document.getElementById("rate");

const out = {
  monthly: document.getElementById("monthly"),
  loan: document.getElementById("loan-amount"),
  interest: document.getElementById("total-interest"),
  total: document.getElementById("total-cost"),
  downLabel: document.getElementById("down-label"),
  durationLabel: document.getElementById("duration-label"),
  rateLabel: document.getElementById("rate-label"),
  error: document.getElementById("calc-error"),
};

function monthlyPayment(capital, annualRate, months) {
  if (capital <= 0) return 0;
  if (annualRate === 0) return capital / months;
  const t = annualRate / 100 / 12;
  return (capital * t) / (1 - Math.pow(1 + t, -months));
}

function update() {
  const price = Number(priceInput.value);
  const downPct = Number(downInput.value);
  const months = Number(durationInput.value);
  const rate = Number(rateInput.value);

  out.downLabel.textContent = `${downPct} %`;
  out.durationLabel.textContent = `${months} mois`;
  out.rateLabel.textContent = `${rate.toFixed(1).replace(".", ",")} %`;

  if (!price || price < 1000 || price > 200000) {
    out.error.textContent = "Saisissez un prix entre 1 000 € et 200 000 €.";
    priceInput.parentElement.classList.add("invalid");
    return;
  }
  out.error.textContent = "";
  priceInput.parentElement.classList.remove("invalid");

  const down = price * (downPct / 100);
  const capital = price - down;
  const monthly = monthlyPayment(capital, rate, months);
  const totalPaid = monthly * months;

  out.monthly.textContent = formatPrice(monthly);
  out.loan.textContent = formatPrice(capital);
  out.interest.textContent = formatPrice(totalPaid - capital);
  out.total.textContent = formatPrice(totalPaid + down);
}

// Prix pré-rempli depuis l'URL (ex. financement.html?prix=24900)
const fromUrl = Number(new URLSearchParams(window.location.search).get("prix"));
if (fromUrl) priceInput.value = fromUrl;

[priceInput, downInput, durationInput, rateInput].forEach((el) => el.addEventListener("input", update));
update();
