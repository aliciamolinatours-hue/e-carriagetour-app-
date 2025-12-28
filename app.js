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

// 3. Funcionalidad para propina dinámica
function initTipOptions() {
  updateTipDisplay();
}

function updateTipDisplay() {
  const tipContainer = document.getElementById('tip-container');
  
  if (paymentMethod === 'card') {
    // Opciones para tarjeta
    tipContainer.innerHTML = `
      <label>Propina</label>
      <div class="tip-options">
        <div class="tip-buttons">
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
    
  } else {
    // Opción para efectivo (input libre)
    tipContainer.innerHTML = `
      <label>Propina</label>
      <input type="number" id="tip-input" placeholder="0 €" step="0.01">
    `;
    
    // Event listener para input de efectivo
    const tipInput = document.getElementById('tip-input');
    if (tipInput) {
      tipInput.addEventListener('input', (e) => {
        selectedTip = e.target.value;
      });
    }
  }
}

// 4. Funcionalidad para añadir viaje
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
    } else if (paymentMethod === 'cash' && selectedTip) {
      tipAmount = parseFloat(selectedTip) || 0;
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
      date: new Date().toLocaleString(),
      country: country,
      passengers: passengerCount,
      price: price,
      paymentMethod: paymentMethod,
      tip: tipAmount,
      total: total
    };
    
    // Mostrar resumen en consola (por ahora)
    console.log('Viaje añadido:', trip);
    
    // Mostrar mensaje de éxito
    showMessage(`✅ Viaje añadido: ${passengerCount} pasajero(s) - Total: ${total}€`);
    
    // Resetear formulario (opcional)
    setTimeout(() => {
      // Resetear pasajeros a 1
      passengerCount = 1;
      const passengerCountElement = document.getElementById('passenger-count');
      const passengerInput = document.getElementById('passenger-input');
      passengerCountElement.textContent = '1';
      passengerInput.value = '1';
      
      // Resetear método de pago a efectivo
      paymentMethod = 'cash';
      const paymentButtons = document.querySelectorAll('.payment-btn');
      paymentButtons.forEach(b => b.classList.remove('active'));
      document.querySelector('.cash-btn').classList.add('active');
      
      // Resetear propina
      selectedTip = null;
      customTipValue = '';
      updateTipDisplay();
      
      // Resetear país
      document.getElementById('country').value = '';
    }, 2000);
  });
}

// Función para mostrar mensajes
function showMessage(text, type = 'success') {
  // Eliminar mensaje anterior si existe
  const existingMessage = document.querySelector('.success-message');
  if (existingMessage) existingMessage.remove();
  
  // Crear nuevo mensaje
  const messageDiv = document.createElement('div');
  messageDiv.className = 'success-message';
  messageDiv.textContent = text;
  
  if (type === 'error') {
    messageDiv.style.backgroundColor = '#f44336';
  }
  
  document.body.appendChild(messageDiv);
  
  // Eliminar mensaje después de 3 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}
