// app.js - VERSIÓN SIMPLIFICADA Y FUNCIONAL
console.log('🚀 app.js cargado correctamente');

// ========== FUNCIONES BÁSICAS ==========
function showScreen(id) {
  console.log('Cambiando a pantalla:', id);
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// ========== PASSAJEROS ==========
let passengerCount = 1;
const minPassengers = 1;
const maxPassengers = 5;

function initPassengerSelector() {
  console.log('Inicializando selector de pasajeros...');
  
  const passengerCountElement = document.getElementById('passenger-count');
  const decreaseButton = document.getElementById('decrease-passenger');
  const increaseButton = document.getElementById('increase-passenger');
  
  function updatePassengerCount() {
    passengerCountElement.textContent = passengerCount;
    
    // Actualizar estado de botones
    decreaseButton.disabled = passengerCount <= minPassengers;
    increaseButton.disabled = passengerCount >= maxPassengers;
    
    // Feedback visual
    if (passengerCount === maxPassengers) {
      passengerCountElement.classList.add('limit-reached');
    } else {
      passengerCountElement.classList.remove('limit-reached');
    }
    
    console.log('Pasajeros actualizados:', passengerCount);
  }
  
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
  
  updatePassengerCount();
}

// ========== MÉTODO DE PAGO ==========
let paymentMethod = 'cash';

function initPaymentButtons() {
  console.log('Inicializando botones de pago...');
  
  const paymentButtons = document.querySelectorAll('.payment-btn');
  
  paymentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover clase active de todos
      paymentButtons.forEach(b => b.classList.remove('active'));
      
      // Agregar clase active al clickeado
      btn.classList.add('active');
      
      // Actualizar método de pago
      paymentMethod = btn.dataset.method;
      console.log('Método de pago seleccionado:', paymentMethod);
      
      // Actualizar opciones de propina
      updateTipDisplay();
    });
  });
}

// ========== PROPINA ==========
let selectedTip = null;
let customTipValue = '';

function updateTipDisplay() {
  const tipContainer = document.getElementById('tip-container');
  
  if (!tipContainer) {
    console.error('No se encontró tip-container');
    return;
  }
  
  if (paymentMethod === 'card') {
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
    
    // Event listeners para botones de propina
    setTimeout(() => {
      const tipButtons = tipContainer.querySelectorAll('.tip-btn');
      tipButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          tipButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          const tipValue = btn.dataset.tip;
          
          if (tipValue === 'custom') {
            document.getElementById('custom-tip-container').style.display = 'block';
            const input = document.getElementById('custom-tip-input');
            input.focus();
            input.addEventListener('input', (e) => {
              customTipValue = e.target.value;
              selectedTip = customTipValue;
            });
          } else {
            document.getElementById('custom-tip-container').style.display = 'none';
            selectedTip = tipValue;
            customTipValue = '';
          }
          
          console.log('Propina seleccionada:', selectedTip);
        });
      });
      
      // Seleccionar 0€ por defecto
      const zeroBtn = tipContainer.querySelector('.tip-btn[data-tip="0"]');
      if (zeroBtn) {
        zeroBtn.click();
      }
    }, 100);
    
  } else {
    tipContainer.innerHTML = `
      <label>Propina</label>
      <input type="number" id="tip-input" placeholder="0 €" step="0.01">
    `;
    
    setTimeout(() => {
      const tipInput = document.getElementById('tip-input');
      if (tipInput) {
        tipInput.addEventListener('input', (e) => {
          selectedTip = e.target.value;
          console.log('Propina efectivo:', selectedTip);
        });
      }
    }, 100);
  }
}

// ========== AÑADIR VIAJE ==========
function initAddTripButton() {
  console.log('Inicializando botón de añadir viaje...');
  
  const addTripBtn = document.getElementById('add-trip-btn');
  
  if (!addTripBtn) {
    console.error('No se encontró el botón add-trip-btn');
    return;
  }
  
  addTripBtn.addEventListener('click', function() {
    console.log('🟢 Botón "Añadir viaje" clickeado');
    
    // Obtener datos del formulario
    const country = document.getElementById('country').value;
    const price = 70;
    
    // Validar
    if (!country) {
      alert('Por favor, selecciona un país');
      return;
    }
    
    // Calcular propina
    let tipAmount = 0;
    if (paymentMethod === 'card' && selectedTip) {
      if (selectedTip === 'custom' && customTipValue) {
        tipAmount = parseFloat(customTipValue) || 0;
      } else if (selectedTip !== 'custom') {
        tipAmount = parseFloat(selectedTip) || 0;
      }
    } else if (paymentMethod === 'cash') {
      const tipInput = document.getElementById('tip-input');
      if (tipInput && tipInput.value) {
        tipAmount = parseFloat(tipInput.value) || 0;
      }
    }
    
    const total = price + tipAmount;
    
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
    
    console.log('Viaje creado:', trip);
    
    // Guardar en localStorage
    saveTripToStorage(trip);
    
    // Mostrar mensaje
    showMessage(`✅ Viaje añadido: ${passengerCount} pasajero(s) - ${country} - Total: ${total}€`);
    
    // Resetear formulario
    resetForm();
  });
}

function saveTripToStorage(trip) {
  try {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    trips.unshift(trip);
    localStorage.setItem('trips', JSON.stringify(trips));
    console.log('Viaje guardado en localStorage');
    return true;
  } catch (error) {
    console.error('Error al guardar:', error);
    return false;
  }
}

function showMessage(text) {
  // Eliminar mensaje anterior
  const existing = document.querySelector('.success-message');
  if (existing) existing.remove();
  
  // Crear nuevo mensaje
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.textContent = text;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}

function resetForm() {
  console.log('🔄 Reseteando formulario...');
  
  setTimeout(() => {
    // 1. RESETEAR PASSAJEROS (ESTE ES EL CAMBIO CLAVE)
    passengerCount = 1; // ← Actualizar la variable GLOBAL
    
    const passengerCountElement = document.getElementById('passenger-count');
    const decreaseButton = document.getElementById('decrease-passenger');
    const increaseButton = document.getElementById('increase-passenger');
    
    if (passengerCountElement) {
      passengerCountElement.textContent = '1';
      passengerCountElement.classList.remove('limit-reached');
    }
    
    // Actualizar estado de botones
    if (decreaseButton) decreaseButton.disabled = true;
    if (increaseButton) increaseButton.disabled = false;
    
    // 2. Resetear método de pago
    paymentMethod = 'cash';
    const paymentButtons = document.querySelectorAll('.payment-btn');
    paymentButtons.forEach(b => b.classList.remove('active'));
    const cashBtn = document.querySelector('.cash-btn');
    if (cashBtn) cashBtn.classList.add('active');
    
    // 3. Resetear propina
    selectedTip = null;
    customTipValue = '';
    
    // 4. Actualizar display de propina (pero mantener efectivo como predeterminado)
    const tipContainer = document.getElementById('tip-container');
    if (tipContainer) {
      tipContainer.innerHTML = `
        <label>Propina</label>
        <input type="number" id="tip-input" placeholder="0 €" step="0.01" value="">
      `;
      
      // Restablecer event listener para propina en efectivo
      setTimeout(() => {
        const tipInput = document.getElementById('tip-input');
        if (tipInput) {
          tipInput.addEventListener('input', (e) => {
            selectedTip = e.target.value;
          });
        }
      }, 50);
    }
    
    // 5. Resetear país
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
      countrySelect.value = '';
      countrySelect.focus(); // Enfocar para siguiente viaje
    }
    
    console.log('✅ Formulario completamente reseteado. Pasajeros:', passengerCount);
  }, 1000); // Reducido a 1 segundo para mejor experiencia
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 DOM completamente cargado');
  
  // Mostrar pantalla inicial
  showScreen('new-trip');
  
  // Inicializar componentes
  initPassengerSelector();
  initPaymentButtons();
  initAddTripButton();
  updateTipDisplay();
  
  // Inicializar navegación
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', function() {
      const target = this.getAttribute('onclick');
      if (target && target.includes("showScreen")) {
        const screenId = target.match(/'([^']+)'/)[1];
        showScreen(screenId);
      }
    });
  });
  
  console.log('✅ Aplicación inicializada correctamente');
});
