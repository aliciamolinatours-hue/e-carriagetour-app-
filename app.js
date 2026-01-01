/****************************************
 * CONFIGURACIÓN GENERAL
 ****************************************/
const PRECIO_VIAJE = 70;
let viajes = [];

// DOM
const sections = document.querySelectorAll("main section");
const navButtons = document.querySelectorAll(".menu-inferior button");

const form = document.getElementById("form-viaje");
const numPaxInput = document.getElementById("num-pax");
const paisInput = document.getElementById("pais-origen");
const tipoPagoSelect = document.getElementById("tipo-pago");
const propinaSelect = document.getElementById("propina");
const propinaCustomInput = document.getElementById("propina-custom");
const confirmacionDiv = document.getElementById("confirmacion");
const resumenDiv = document.getElementById("resumen");

/****************************************
 * NAVEGACIÓN ENTRE SECCIONES (MÓVIL)
 ****************************************/
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    sections.forEach(sec => sec.classList.remove("seccion-activa"));
    document.getElementById(btn.dataset.section).classList.add("seccion-activa");
  });
});

/****************************************
 * PROPINA CUSTOM (MOSTRAR / OCULTAR)
 ****************************************/
propinaSelect.addEventListener("change", () => {
  if (propin
