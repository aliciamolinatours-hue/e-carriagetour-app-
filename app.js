// ================================
// Script de Registro de Viajes
// ================================

// Array para guardar los viajes en memoria
let viajes = [];

// Precio fijo del viaje
const PRECIO_VIAJE = 70;

// Referencias a elementos del DOM
const form = document.getElementById('form-viaje');
const numPaxInput = document.getElementById('num-pax');
const paisInput = document.getElementById('pais-origen');
const tipoPagoSelect = document.getElementById('tipo-pago');
const propinaSelect = document.getElementById('propina');
const propinaCustomInput = document.getElementById('propina-custom');
const tablaBody = document.querySelector('#tabla-viajes tbody');
const resumenDiv = document.getElementById('resumen');

// ================================
// Mostrar/ocultar campo propina custom
// ================================
propinaSelect.addEventListener('change', () => {
  if (propinaSelect.value === 'custom') {
    propinaCustomInput.style.display = 'inline-block';
    propinaCustomInput.required = true;
  } else {
    propinaCustomInput.style.display = 'none';
    propinaCustomInput.required = false;
  }
});

// ================================
// Función para actualizar la tabla
// ================================
function actualizarTabla() {
  tablaBody.innerHTML = ''; // Limpiar tabla

  viajes.forEach((viaje, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${viaje.numPax}</td>
      <td>${viaje.pais}</td>
      <td>${viaje.tipoPago}</td>
      <td>${viaje.propina.toFixed(2)}€</td>
    `;
    tablaBody.appendChild(fila);
  });
}

// ================================
// Función para calcular resumen
// ================================
function actualizarResumen() {
  let totalEfectivo = 0;
  let totalTarjeta = 0;
  let propinasTarjeta = 0;

  viajes.forEach(viaje => {
    if (viaje.tipoPago === 'efectivo') {
      totalEfectivo += PRECIO_VIAJE;
    } else {
      totalTarjeta += PRECIO_VIAJE;
      propinasTarjeta += viaje.propina;
    }
  });

  // Resumen final
  resumenDiv.innerHTML = `
    <p>Total viajes: ${viajes.length}</p>
    <p>Total efectivo recibido: ${totalEfectivo.toFixed(2)}€</p>
    <p>Total tarjeta: ${totalTarjeta.toFixed(2)}€</p>
    <p>Propinas con tarjeta: ${propinasTarjeta.toFixed(2)}€</p>
    <p>Efectivo que se queda el jefe: ${(totalEfectivo - propinasTarjeta).toFixed(2)}€</p>
    <p>Total que se queda el chofer (propinas tarjeta): ${propinasTarjeta.toFixed(2)}€</p>
  `;
}

// ================================
// Función para registrar un nuevo viaje
// ================================
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Evitar que se recargue la página

  // Obtener valores del formulario
  const numPax = parseInt(numPaxInput.value);
  const pais = paisInput.value.trim();
  const tipoPago = tipoPagoSelect.value;
  let propina = parseFloat(propinaSelect.value);

  // Si es custom, tomar valor del input
  if (propinaSelect.value === 'custom') {
    propina = parseFloat(propinaCustomInput.value) || 0;
  }

  // Crear objeto viaje
  const viaje = {
    numPax,
    pais,
    tipoPago,
    propina
  };

  // Guardar en array
  viajes.push(viaje);

  // Actualizar tabla y resumen
  actualizarTabla();
  actualizarResumen();

  // Limpiar formulario
  form.reset();
  propinaCustomInput.style.display = 'none';
});
