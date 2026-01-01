document.addEventListener("DOMContentLoaded", () => {
  renderAll();
});

let trips = JSON.parse(localStorage.getItem("trips")) || [];
let currentFilter = "day";

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");
}

document.getElementById("tripForm").addEventListener("submit", e => {
  e.preventDefault();

  const trip = {
    date: new Date(),
    pax: Number(pax.value),
    payment: payment.value,
    tip: Number(tip.value),
    country: country.value || "N/A"
  };

  trips.push(trip);
  localStorage.setItem("trips", JSON.stringify(trips));

  e.target.reset();
  renderAll();
});

function renderAll() {
  renderTodayTrips();
  renderSummary();
  renderMonthlyStats();
  renderStats();
}

function isSameDay(d1, d2) {
  return d1.toDateString() === d2.toDateString();
}

function renderTodayTrips() {
  const ul = document.getElementById("todayTrips");
  ul.innerHTML = "";

  trips.filter(t => isSameDay(new Date(t.date), new Date()))
    .forEach(t => {
      const li = document.createElement("li");
      li.textContent = `${new Date(t.date).toLocaleTimeString()} | Pax: ${t.pax} | ${t.payment} | Tip: €${t.tip}`;
      ul.appendChild(li);
    });
}

function setFilter(f) {
  currentFilter = f;
  renderSummary();
}

function renderSummary() {
  const now = new Date();
  let filtered = trips;

  if (currentFilter === "day") {
    filtered = trips.filter(t => isSameDay(new Date(t.date), now));
  } else if (currentFilter === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    filtered = trips.filter(t => new Date(t.date) >= weekAgo);
  } else if (currentFilter === "month") {
    filtered = trips.filter(t => new Date(t.date).getMonth() === now.getMonth());
  }

  summaryData.innerHTML = `
    Viajes: ${filtered.length}<br>
    Pax total: ${filtered.reduce((a,t)=>a+t.pax,0)}<br>
    Propinas: €${filtered.reduce((a,t)=>a+t.tip,0).toFixed(2)}
  `;
}

function renderMonthlyStats() {
  const stats = {};
  trips.forEach(t => {
    const m = new Date(t.date).toISOString().slice(0,7);
    stats[m] = (stats[m] || 0) + 1;
  });

  monthlyStats.innerHTML = Object.entries(stats)
    .map(([m,v]) => `${m}: ${v} viajes`)
    .join("<br>");
}

function renderStats() {
  const cash = trips.filter(t => t.payment === "Efectivo").length;
  const card = trips.filter(t => t.payment === "Tarjeta").length;

  const countries = {};
  trips.forEach(t => countries[t.country] = (countries[t.country] || 0) + 1);

  statsCash.innerHTML = `Efectivo: ${cash}`;
  statsCard.innerHTML = `Tarjeta: ${card}`;
  statsTotal.innerHTML = `Total viajes: ${trips.length}`;

  statsCountries.innerHTML = Object.entries(countries)
    .map(([c,v]) => `${c}: ${v}`)
    .join("<br>");
}

function exportCSV() {
  let csv = "Fecha,Pax,Pago,Propina,País\n";
  trips.forEach(t => {
    csv += `${t.date},${t.pax},${t.payment},${t.tip},${t.country}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "viajes.csv";
  a.click();
}
