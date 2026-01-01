const PRECIO = 70;
let viajes = JSON.parse(localStorage.getItem("viajes")) || [];
let filtroActual = "hoy";

// DOM
const sections = document.querySelectorAll("section");
document.querySelectorAll(".nav-bottom button").forEach(b =>
  b.onclick = () => {
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(b.dataset.section).classList.add("active");
    actualizar();
  }
);

// Form
const form = document.getElementById("form-viaje");
const propina = document.getElementById("propina");
const propinaCustom = document.getElementById("propinaCustom");
const ok = document.getElementById("ok");

propina.onchange = () =>
  propinaCustom.style.display = propina.value === "custom" ? "block" : "none";

form.onsubmit = e => {
  e.preventDefault();
  const viaje = {
    fecha: new Date().toISOString(),
    pax: +pax.value,
    pais: pais.value,
    pago: pago.value,
    propina: propina.value === "custom" ? +propinaCustom.value || 0 : +propina.value
  };
  viajes.push(viaje);
  localStorage.setItem("viajes", JSON.stringify(viajes));
  ok.style.opacity = 1;
  setTimeout(() => ok.style.opacity = 0, 1500);
  form.reset();
  actualizar();
};

// Filtros
document.querySelectorAll(".filters button[data-filter]").forEach(b =>
  b.onclick = () => { filtroActual = b.dataset.filter; actualizar(); }
);

// Export CSV
document.getElementById("exportCSV").onclick = () => {
  let csv = "Fecha,Pax,Pais,Pago,Propina\n";
  viajesFiltrados().forEach(v =>
    csv += `${v.fecha},${v.pax},${v.pais},${v.pago},${v.propina}\n`
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "viajes.csv";
  a.click();
};

// Filtrado fechas
function viajesFiltrados() {
  const ahora = new Date();
  return viajes.filter(v => {
    const f = new Date(v.fecha);
    if (filtroActual === "hoy") return f.toDateString() === ahora.toDateString();
    if (filtroActual === "semana") return ahora - f < 7 * 86400000;
    if (filtroActual === "mes") return f.getMonth() === ahora.getMonth();
  });
}

// Resumen + gráficos
let chart1, chart2;
function actualizar() {
  const data = viajesFiltrados();
  let ef = 0, tar = 0, prop = 0;

  data.forEach(v => {
    if (v.pago === "efectivo") ef += PRECIO;
    else { tar += PRECIO; prop += v.propina; }
  });

  summary.innerHTML = `
    <p>Viajes: ${data.length}</p>
    <p>Efectivo: ${ef} €</p>
    <p>Tarjeta: ${tar} €</p>
    <p>Propinas tarjeta: ${prop} €</p>
    <hr>
    <p>Jefe: ${ef - prop} €</p>
    <p>Chofer: ${prop} €</p>
  `;

  if (chart1) chart1.destroy();
  chart1 = new Chart(chartIngresos, {
    type: "bar",
    data: { labels: ["Efectivo", "Tarjeta"], datasets: [{ data: [ef, tar] }] }
  });

  if (chart2) chart2.destroy();
  chart2 = new Chart(chartPagos, {
    type: "pie",
    data: { labels: ["Efectivo", "Tarjeta"], datasets: [{ data: [ef, tar] }] }
  });
}

actualizar();
