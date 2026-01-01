let trips = JSON.parse(localStorage.getItem("trips")) || [];
let currentFilter = "day";

document.addEventListener("DOMContentLoaded", renderAll);

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));

  document.getElementById(`tab-${tab}`).classList.add("active");
  document.getElementById(`btn-${tab}`).classList.add("active");
}

document.getElementById("tripForm").addEventListener("submit", e => {
  e.preventDefault();

  const trip = {
    date: new Date().toISOString(),
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

function renderTodayTrips() {
  const container = document.getElementById("todayTrips");
  container.innerHTML = "";

  const today = new Date().toDateString();

  trips.filter(t => new Date(t.date).toDateString() === today)
    .forEach(t => {
      const div = document.createElement("div");
      div.textContent =
        `${new Date(t.date).toLocaleTimeString()} | Pax ${t.pax} | ${t.payment} | Tip €${t.tip}`;
      container.appendChild(div);
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
    filtered = trips.filter(t =>
      new Date(t.date).toDateString() === now.toDateString()
    );
  } else if (currentFilter === "week") {
    const w = new Date();
    w.setDate(now.getDate() - 7);
    filtered = trips.filter(t => new Date(t.date) >= w);
  } else if (currentFilter === "month") {
    filtered = trips.filter(t =>
      new Date(t.date).getMonth() === now.getMonth()
    );
  }

  summaryData.innerHTML = `
    Viajes: ${filtered.length}<br>
    Pax: ${filtered.reduce((a,t)=>a+t.pax,0)}<br>
    Propinas: €${filtered.reduce((a,t)=>a+t.tip,0).toFixed(2)}
  `;
}

function renderMonthlyStats() {
  const stats = {};
  trips.forEach(t => {
    const m = t.date.slice(0,7);
    stats[m] = (stats[m] || 0) + 1;
  });

  monthlyStats.innerHTML = Object.entries(stats)
    .map(([m,v]) => `${m}: ${v} viajes`)
    .join("<br>");
}

function renderStats() {
  statsCash.textContent =
    `Efectivo: ${trips.filter(t => t.payment === "Efectivo").length}`;

  statsCard.textContent =
    `Tarjeta: ${trips.filter(t => t.payment === "Tarjeta").length}`;

  statsTotal.textContent =
    `Total viajes: ${trips.length}`;

  const countries = {};
  trips.forEach(t => countries[t.country] = (countries[t.country] || 0) + 1);

  statsCountries.innerHTML =
    "Países:<br>" +
    Object.entries(countries).map(([c,v]) => `${c}: ${v}`).join("<br>");
}

function exportCSV() {
  let csv = "Fecha,Pax,Pago,Propina,País\n";
  trips.forEach(t => {
    csv += `${t.date},${t.pax},${t.payment},${t.tip},${t.country}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "viajes.csv";
  link.click();
}
