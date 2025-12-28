// Función para mostrar pantallas
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// Pantalla inicial
document.addEventListener('DOMContentLoaded', () => {
  showScreen('new-trip');
  initApp();
});

// Variables globales
let passengerCount = 1;
const minPassengers = 1;
const maxPassengers = 5;
let paymentMethod = 'cash';
let selectedTip = null;
let customTipValue = '';

// Inicializar la aplicación
function initApp() {
  initPassengerSelector();
  initPaymentButtons();
  initTipOptions();
  initAddTripButton();
}

// 1. Funcionalidad para cambiar pasajeros
function initPassengerSelector() {
  const passengerCountElement = document.getElementById('passenger-count');
  const decreaseButton = document.getElementById('decrease-passenger');
  const increaseButton = document.getElementById('increase-passenger');
  const passengerInput = document.getElementById('passenger-input');

  // Función para actualizar contador
  function updatePassengerCount() {
    passengerCountElement.textContent = passengerCount;
    passengerInput.value = passengerCount;
    
    decreaseButton.disabled = passengerCount <= minPassengers;
    increaseButton.disabled = passengerCount >= maxPassengers;
    
    if (passengerCount === maxPassengers) {
      passengerCountElement.classList.add('limit-reached');
    } else {
      passengerCountElement.classList.remove('limit-reached');
    }
  }

  // Función para cambiar número de pasajeros
  function changePassengers(change) {
    const newCount = passengerCount + change;
    
    if (newCount >= minPassengers && newCount <= maxPassengers) {
      passengerCount = newCount;
      updatePassengerCount();
    }
  }

  // Event listeners
  decreaseButton.addEventListener('click', () => changePassengers(-1));
  increaseButton.addEventListener('click', () => changePassengers(1));

  // Inicializar
  updatePassengerCount();
}

// 2. Funcionalidad para método de pago (efectivo/tarjeta)
function initPaymentButtons() {
  const paymentButtons = document.querySelectorAll('.payment-btn');
  
  paymentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover clase active de todos los botones
      paymentButtons.forEach(b => b.classList.remove('active'));
      
      // Agregar clase active al botón clickeado
      btn.classList.add('active');
      
      // Actualizar método de pago
      paymentMethod = btn.dataset.method;
      
      // Actualizar opciones de propina según el método
      updateTipDisplay();
    });
  });
}

// 3. Funcionalidad para propina dinámica - MODIFICAR
function updateTipDisplay() {
  const tipContainer = document.getElementById('tip-container');
  
  if (paymentMethod === 'card') {
    // Opciones para tarjeta - AGREGAR BOTÓN 0€
    tipContainer.innerHTML = `
      <label>Propina</label>
      <div class="tip-options">
        <div class="tip-buttons">
          <button type="button" class="tip-btn" data-tip="0">0 €</button>
          <button type="button" class="tip-btn" data-tip="7">7 €</button>
          <button type="button" class="tip-btn" data-tip="10.5">10,5 €</button>
          <button type="button" class="tip-btn" data-tip="14">14 €</button>
          <button type="button" class="tip-btn" data-tip="custom">Custom</button>
        </div>
        <div class="tip-custom-input" id="custom-tip-container" style="display: none;">
          <input type="number" id="custom-tip-input" placeholder="0 €" min="0" max="99" step="0.01">
        </div>
      </div>
    `;
    
    // Event listeners para botones de propina (tarjeta)
    const tipButtons = tipContainer.querySelectorAll('.tip-btn');
    tipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remover active de todos
        tipButtons.forEach(b => b.classList.remove('active'));
        // Agregar active al clickeado
        btn.classList.add('active');
        
        const tipValue = btn.dataset.tip;
        
        if (tipValue === 'custom') {
          // Mostrar input personalizado
          const customContainer = document.getElementById('custom-tip-container');
          customContainer.style.display = 'block';
          const customInput = document.getElementById('custom-tip-input');
          customInput.focus();
          selectedTip = null;
          
          // Event listener para input custom
          customInput.addEventListener('input', (e) => {
            customTipValue = e.target.value;
            selectedTip = customTipValue;
          });
        } else {
          // Ocultar input personalizado
          const customContainer = document.getElementById('custom-tip-container');
          if (customContainer) customContainer.style.display = 'none';
          selectedTip = tipValue;
          customTipValue = '';
        }
      });
    });
    
    // Seleccionar 0€ por defecto para tarjeta
    setTimeout(() => {
      const zeroBtn = tipContainer.querySelector('.tip-btn[data-tip="0"]');
      if (zeroBtn) {
        zeroBtn.classList.add('active');
        selectedTip = '0';
      }
    }, 100);
    
  } else {
    // Opción para efectivo (input libre)
    tipContainer.innerHTML = `
      <label>Propina</label>
      <input type="number" id="tip-input" placeholder="0 €" step="0.01">
    `;
    
    // Event listener para input de efectivo
    const tipInput = document.getElementById('tip-input');
    if (tipInput) {
      tipInput.value = ''; // Resetear a vacío
      tipInput.addEventListener('input', (e) => {
        selectedTip = e.target.value;
      });
    }
  }
}

// 4. Funcionalidad para añadir viaje - MODIFICAR PARA GUARDAR DATOS
function initAddTripButton() {
  const addTripBtn = document.querySelector('.primary');
  
  addTripBtn.addEventListener('click', function() {
    // Obtener datos del formulario
    const country = document.getElementById('country').value;
    const price = 70; // Precio fijo del viaje
    
    // Calcular propina
    let tipAmount = 0;
    if (paymentMethod === 'card' && selectedTip) {
      if (selectedTip === 'custom' && customTipValue) {
        tipAmount = parseFloat(customTipValue) || 0;
      } else if (selectedTip !== 'custom') {
        tipAmount = parseFloat(selectedTip) || 0;
      }
    } else if (paymentMethod === 'cash') {
      // Para efectivo, obtener valor del input
      const tipInput = document.getElementById('tip-input');
      if (tipInput) {
        tipAmount = parseFloat(tipInput.value) || 0;
      }
    }
    
    const total = price + tipAmount;
    
    // Validar datos básicos
    if (!country) {
      showMessage('Por favor, selecciona un país', 'error');
      return;
    }
    
    // Crear objeto del viaje
    const trip = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      country: country,
      passengers: passengerCount,
      price: price,
      paymentMethod: paymentMethod,
      tip: tipAmount,
      total: total.toFixed(2)
    };
    
    // Guardar en localStorage
    saveTripToStorage(trip);
    
    // Mostrar resumen en consola
    console.log('📋 VIAJE GUARDADO:', trip);
    console.log('💾 Todos los viajes:', JSON.parse(localStorage.getItem('trips') || '[]'));
    
    // Mostrar mensaje de éxito
    showMessage(`✅ Viaje añadido: ${passengerCount} pasajero(s) - ${country} - Total: ${total}€`);
    
    // Resetear formulario
    resetForm();
  });
}

// NUEVA FUNCIÓN: Guardar viaje en localStorage
function saveTripToStorage(trip) {
  try {
    // Obtener viajes existentes o crear array vacío
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    
    // Agregar nuevo viaje al inicio del array
    trips.unshift(trip);
    
    // Guardar en localStorage (máximo 1000 viajes)
    if (trips.length > 1000) {
      trips.pop(); // Eliminar el más antiguo si hay más de 1000
    }
    
    localStorage.setItem('trips', JSON.stringify(trips));
    
    // Disparar evento personalizado para notificar a otras partes de la app
    const event = new CustomEvent('tripAdded', { detail: trip });
    document.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Error al guardar el viaje:', error);
    showMessage('Error al guardar el viaje', 'error');
    return false;
  }
}

// NUEVA FUNCIÓN: Resetear formulario
function resetForm() {
  setTimeout(() => {
    // Resetear pasajeros a 1
    passengerCount = 1;
    const passengerCountElement = document.getElementById('passenger-count');
    const passengerInput = document.getElementById('passenger-input');
    if (passengerCountElement) passengerCountElement.textContent = '1';
    if (passengerInput) passengerInput.value = '1';
    
    // Resetear botones de pasajeros
    const decreaseButton = document.getElementById('decrease-passenger');
    const increaseButton = document.getElementById('increase-passenger');
    if (decreaseButton) decreaseButton.disabled = false;
    if (increaseButton) increaseButton.disabled = false;
    
    // Resetear método de pago a efectivo
    paymentMethod = 'cash';
    const paymentButtons = document.querySelectorAll('.payment-btn');
    paymentButtons.forEach(b => b.classList.remove('active'));
    const cashBtn = document.querySelector('.cash-btn');
    if (cashBtn) cashBtn.classList.add('active');
    
    // Resetear propina
    selectedTip = null;
    customTipValue = '';
    
    // Actualizar display de propina
    updateTipDisplay();
    
    // Resetear país
    const countrySelect = document.getElementById('country');
    if (countrySelect) countrySelect.value = '';
    
    // Enfocar en país para siguiente viaje
    if (countrySelect) countrySelect.focus();
  }, 1500);
}

// NUEVA FUNCIÓN: Ver viajes guardados (para depuración)
function viewSavedTrips() {
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  console.log('=== VIAJES GUARDADOS ===');
  console.log('Total:', trips.length);
  trips.forEach((trip, index) => {
    console.log(`${index + 1}. ${trip.date} ${trip.time} - ${trip.country} - ${trip.passengers} pasajeros - ${trip.total}€ (${trip.paymentMethod})`);
  });
  console.log('=======================');
  return trips;
}

// Llamar a esta función para ver viajes guardados
// viewSavedTrips();

