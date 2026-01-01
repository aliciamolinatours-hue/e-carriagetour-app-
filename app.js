const PRECIO = 70;
let viajes = JSON.parse(localStorage.getItem("viajes")) || [];
let rango = "dia";

// Navegación
document.querySelectorAll(".nav-bottom button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.section).classList.add("active");
    actualizarTodo();
  };
});

// Formulario
const form = document.getElementById("form-viaje");
const propina = document.getElementById("propina");
const propinaCustom = document.getElementById("propinaCustom");
const ok = document.getElementById("ok");

propina.onchange = () =>
  propinaCustom.style.display = propina.value === "custom" ? "block" : "none";

form.onsubmit = e => {
  e.preventDefault();

  viajes.push({
    fecha: new Date().toISOString(),
    pax: +pax.value,
    pais: pais.value,
    pago: pago.value,
    propina: propina.value === "custom" ? +propinaCustom.value || 0 : +propina.value
  });

  localStorage.setItem("viajes", JSON.stringify(viajes));
  ok.style.opacity = 1;
  setTimeout(() => ok.style.opacity = 0, 1200);
  form.reset();
  actualizarTodo();
};

// Filtros resumen
document.querySelectorAll("[data-range]").forEach(b =>
  b.onclick = () => { rango = b.dataset.range; actualizarResumen(); }
);
mesSelect.onchange = actualizarResumen;

// ================= FUNCIONES =================

function hoy(v) {
  return new Date(v.fecha).toDateString() === new Date().toDateString();
}

function filtrar() {
  const now = new Date();
  return viajes.filter(v => {
    const f = new Date(v.fecha);
    if (rango === "dia") return hoy(v);
    if (rango === "semana") return now - f < 7 * 86400000;
    if (rango === "mes") {
      const m = mesSelect.value ? new Date(mesSelect.value) : now;
      return f.getMonth() === m.getMonth() && f.getFullYear() === m.getFullYear();
    }
  });
}

// ===== NUEVO VIAJE =====
function actualizarHoy() {
  listaHoy.innerHTML = "";
  viajes.filter(hoy).forEach(v => {
    listaHoy.innerHTML += `
      <li>
        ${new Date(v.fecha).toLocaleTimeString()} – 
        Pax: ${v.pax} – 
        ${v.pago} ${v.propina > 0 ? `(Propina ${v.propina}€)` : `(Sin propina)`}
      </li>`;
  });
}

// ===== RESUMEN =====
function actualizarResumen() {
  const data = filtrar();
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
}

// ===== ESTADÍSTICAS =====
let cPagos, cPaises, cTotal, cMes;

function actualizarEstadisticas() {
  const pagos = { efectivo: 0, tarjeta: 0 };
  const paises = {};

  viajes.forEach(v => {
    pagos[v.pago]++;
    paises[v.pais] = (paises[v.pais] || 0) + 1;
  });

  if (cPagos) cPagos.destroy();
  cPagos = new Chart(chartPagos, {
    type: "pie",
    data: { labels: ["Efectivo", "Tarjeta"], datasets: [{ data: Object.values(pagos) }] }
  });

  if (cPaises) cPaises.destroy();
  cPaises = new Chart(chartPaises, {
    type: "bar",
    data: { labels: Object.keys(paises), datasets: [{ data: Object.values(paises) }] }
  });

  if (cTotal) cTotal.destroy();
  cTotal = new Chart(chartTotal, {
    type: "bar",
    data: { labels: ["Viajes"], datasets: [{ data: [viajes.length] }] }
  });
}

// ===== ESTADÍSTICAS MES (NUEVO VIAJE) =====
function actualizarMes() {
  const meses = {};
  viajes.forEach(v => {
    const m = new Date(v.fecha).toISOString().slice(0,7);
    meses[m] = (meses[m] || 0) + 1;
  });

  if (cMes) cMes.destroy();
  cMes = new Chart(chartMes, {
    type: "bar",
    data: { labels: Object.keys(meses), datasets: [{ data: Object.values(meses) }] }
  });
}

// ===== GLOBAL =====
function actualizarTodo() {
  actualizarHoy();
  actualizarResumen();
  actualizarEstadisticas();
  actualizarMes();
}

actualizarTodo();
