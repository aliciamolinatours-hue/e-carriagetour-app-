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
  initAddTripButton(); // Esta función debe existir y llamarse
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

// 3. Funcionalidad para propina dinámica
function initTipOptions() {
  updateTipDisplay();
}

function updateTipDisplay() {
  const tipContainer = document.getElementById('tip-container');
  
  if (paymentMethod === 'card') {
    // Opciones para tarjeta - CON BOTÓN 0€
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
          if (customInput) customInput.focus();
          selectedTip = null;
          
          // Event listener para input custom
          if (customInput) {
            customInput.addEventListener('input', (e) => {
              customTipValue = e.target.value;
              selectedTip = customTipValue;
            });
          }
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

// 4. Funcionalidad para añadir viaje - VERSIÓN SIMPLIFICADA Y FUNCIONAL
function initAddTripButton() {
  console.log('🔍 Buscando botón "Añadir viaje"...');
  
  // Buscar el botón por ID (asegúrate de que en HTML tenga id="add-trip-btn")
  const addTripBtn = document.getElementById('add-trip-btn');
  
  if (!addTripBtn) {
    console.error('❌ ERROR: No se encontró el botón con id="add-trip-btn"');
    
    // Intentar encontrarlo por clase como fallback
    const fallbackBtn = document.querySelector('button.primary');
    if (fallbackBtn) {
      console.log('✅ Encontrado por clase .primary, configurando...');
      setupTripButton(fallbackBtn);
    } else {
      console.error('❌ ERROR CRÍTICO: No hay botón para añadir viaje');
      createEmergencyButton();
    }
    return;
  }
  
  console.log('✅ Botón encontrado, configurando...');
  setupTripButton(addTripBtn);
}

// Función para configurar el botón
function setupTripButton(button) {
  // Remover cualquier event listener anterior
  const newButton = button.cloneNode(true);
  button.parentNode.replaceChild(newButton, button);
  
  // Agregar estilos de feedback
  newButton.style.cursor = 'pointer';
  newButton.style.transition = 'all 0.2s';
  
  // Event listener para el clic
  newButton.addEventListener('click', function(event) {
    console.log('🟢 Botón "Añadir viaje" clickeado!');
    event.preventDefault();
    event.stopPropagation();
    
    // Feedback visual
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 200);
    
    // Llamar a la función que añade el viaje
    addNewTrip();
  });
  
  console.log('✅ Botón configurado correctamente');
}

// Función principal para añadir un nuevo viaje
function addNewTrip() {
  console.log('✈️ Iniciando proceso para añadir viaje...');
  
  // 1. Obtener datos del formulario
  const countrySelect = document.getElementById('country');
  const country = countrySelect ? countrySelect.value : '';
  
  // 2. Validar datos básicos
  if (!country || country === '') {
    console.log('❌ Validación fallida: No se seleccionó país');
    showMessage('Por favor, selecciona un país de origen', 'error');
    return;
  }
  
  console.log('✅ País seleccionado:', country);
  console.log('✅ Pasajeros:', passengerCount);
  console.log('✅ Método de pago:', paymentMethod);
  console.log('✅ Propina seleccionada:', selectedTip);
  console.log('✅ Propina custom:', customTipValue);
  
  // 3. Calcular propina
  let tipAmount = 0;
  const price = 70; // Precio fijo del viaje
  
  if (paymentMethod === 'card') {
    if (selectedTip === 'custom' && customTipValue) {
      tipAmount = parseFloat(customTipValue) || 0;
    } else if (selectedTip && selectedTip !== 'custom') {
      tipAmount = parseFloat(selectedTip) || 0;
    }
  } else if (paymentMethod === 'cash') {
    const tipInput = document.getElementById('tip-input');
    if (tipInput && tipInput.value) {
      tipAmount = parseFloat(tipInput.value) || 0;
    }
  }
  
  console.log('💰 Propina calculada:', tipAmount);
  
  // 4. Calcular total
  const total = price + tipAmount;
  console.log('💰 Total calculado:', total);
  
  // 5. Crear objeto del viaje
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
  
  console.log('📦 Objeto viaje creado:', trip);
  
  // 6. Guardar en localStorage
  const saved = saveTripToStorage(trip);
  
  if (saved) {
    console.log('✅ Viaje guardado exitosamente en localStorage');
    
    // 7. Mostrar mensaje de éxito
    showMessage(`✅ Viaje añadido exitosamente:
    • País: ${country}
    • Pasajeros: ${passengerCount}
    • Método: ${paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}
    • Propina: ${tipAmount}€
    • Total: ${total}€`);
    
    // 8. Resetear formulario
    resetForm();
  } else {
    console.log('❌ Error al guardar el viaje');
    showMessage('Error al guardar el viaje. Intenta nuevamente.', 'error');
  }
}

// Función para guardar viaje en localStorage
function saveTripToStorage(trip) {
  try {
    console.log('💾 Guardando viaje en localStorage...');
    
    // Obtener viajes existentes o crear array vacío
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    console.log('📊 Viajes existentes:', trips.length);
    
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
    
    console.log('💾 Viaje guardado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar el viaje:', error);
    return false;
  }
}

// Función para resetear formulario
function resetForm() {
  console.log('🔄 Reseteando formulario...');
  
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
    
    console.log('✅ Formulario reseteado');
  }, 1500);
}

// Función para mostrar mensajes
function showMessage(text, type = 'success') {
  console.log(`📝 Mostrando mensaje (${type}):`, text);
  
  // Eliminar mensaje anterior si existe
  const existingMessage = document.querySelector('.message-container');
  if (existingMessage) existingMessage.remove();
  
  // Crear contenedor de mensaje
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container';
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    max-width: 90%;
    text-align: center;
  `;
  
  if (type === 'error') {
    messageDiv.style.backgroundColor = '#f44336';
  } else {
    messageDiv.style.backgroundColor = '#4caf50';
  }
  
  messageDiv.textContent = text;
  
  document.body.appendChild(messageDiv);
  
  // Eliminar mensaje después de 3 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}

// Función de emergencia para crear botón si no existe
function createEmergencyButton() {
  console.log('🚨 Creando botón de emergencia...');
  
  const newTripScreen = document.getElementById('new-trip');
  if (!newTripScreen) return;
  
  const emergencyBtn = document.createElement('button');
  emergencyBtn.id = 'emergency-add-btn';
  emergencyBtn.textContent = '➕ AÑADIR VIAJE (EMERGENCIA)';
  emergencyBtn.style.cssText = `
    background: #ff5722;
    color: white;
    padding: 20px;
    font-size: 20px;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    margin-top: 30px;
    width: 100%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  newTripScreen.appendChild(emergencyBtn);
  
  emergencyBtn.addEventListener('click', function() {
    console.log('🚨 Botón de emergencia clickeado');
    addNewTrip();
  });
  
  console.log('✅ Botón de emergencia creado');
}

// Función para ver viajes guardados (para depuración)
function viewSavedTrips() {
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  console.log('=== VIAJES GUARDADOS EN LOCALSTORAGE ===');
  console.log('Total de viajes:', trips.length);
  trips.forEach((trip, index) => {
    console.log(`${index + 1}. ${trip.date} ${trip.time} - ${trip.country} - ${trip.passengers} pasajeros - ${trip.total}€ (${trip.paymentMethod})`);
  });
  console.log('=======================================');
  return trips;
}

// Para probar en consola: viewSavedTrips();
