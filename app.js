// app.js - VERSIÓN COMPLETA CON RESUMEN DETALLADO
console.log('🚀 app.js cargado correctamente');

// ========== FUNCIONES BÁSICAS ==========
function showScreen(id) {
  console.log('Cambiando a pantalla:', id);
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  
  // Actualizar datos cuando se cambia de pantalla
  if (id === 'summary') {
    updateSummary('today');
  } else if (id === 'stats') {
    updateStats('month');
  } else if (id === 'new-trip') {
    updateTodayTrips();
  }
}

// ========== VARIABLES GLOBALES ==========
let passengerCount = 1;
const minPassengers = 1;
const maxPassengers = 5;
let paymentMethod = 'cash';
let selectedTip = null;
let customTipValue = '';

// ========== FUNCIÓN AUXILIAR PARA RESET PASSAJEROS ==========
function resetPassengerCounter() {
  console.log('🔄 Reseteando contador de pasajeros...');
  passengerCount = 1;
  
  const passengerCountElement = document.getElementById('passenger-count');
  const decreaseButton = document.getElementById('decrease-passenger');
  const increaseButton = document.getElementById('increase-passenger');
  
  if (passengerCountElement) {
    passengerCountElement.textContent = '1';
    passengerCountElement.classList.remove('limit-reached');
  }
  
  if (decreaseButton) decreaseButton.disabled = true;
  if (increaseButton) increaseButton.disabled = false;
  
  console.log('✅ Contador reseteado a 1 pasajero');
}

// ========== PASSAJEROS ==========
function initPassengerSelector() {
  console.log('Inicializando selector de pasajeros...');
  
  const passengerCountElement = document.getElementById('passenger-count');
  const decreaseButton = document.getElementById('decrease-passenger');
  const increaseButton = document.getElementById('increase-passenger');
  
  function updatePassengerCount() {
    passengerCountElement.textContent = passengerCount;
    
    decreaseButton.disabled = passengerCount <= minPassengers;
    increaseButton.disabled = passengerCount >= maxPassengers;
    
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
  
  decreaseButton.addEventListener('click', () => changePassengers(-1));
  increaseButton.addEventListener('click', () => changePassengers(1));
  
  updatePassengerCount();
}

// ========== MÉTODO DE PAGO ==========
function initPaymentButtons() {
  console.log('Inicializando botones de pago...');
  
  const paymentButtons = document.querySelectorAll('.payment-btn');
  
  paymentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      paymentButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      paymentMethod = btn.dataset.method;
      console.log('Método de pago seleccionado:', paymentMethod);
      
      updateTipDisplay();
    });
  });
}

// ========== PROPINA ==========
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
      
      const zeroBtn = tipContainer.querySelector('.tip-btn[data-tip="0"]');
      if (zeroBtn) zeroBtn.click();
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
    
    const country = document.getElementById('country').value;
    const price = 70;
    
    if (!country) {
      alert('Por favor, selecciona un país');
      return;
    }
    
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
    saveTripToStorage(trip);
    
    showMessage(`✅ Viaje añadido: ${passengerCount} pasajero(s) - ${country} - Total: ${total}€`);
    resetForm();
  });
}

function saveTripToStorage(trip) {
  try {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    trips.unshift(trip);
    localStorage.setItem('trips', JSON.stringify(trips));
    
    console.log('💾 Viaje guardado. Total:', trips.length);
    
    // Disparar evento para actualizar otras pantallas
    const event = new CustomEvent('tripAdded', { detail: trip });
    document.dispatchEvent(event);
    
    // Actualizar inmediatamente la lista de viajes de hoy
    updateTodayTrips();
    
    return true;
  } catch (error) {
    console.error('Error al guardar:', error);
    return false;
  }
}

function showMessage(text) {
  const existing = document.querySelector('.success-message');
  if (existing) existing.remove();
  
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
    if (messageDiv.parentNode) messageDiv.parentNode.removeChild(messageDiv);
  }, 3000);
}

function resetForm() {
  console.log('🔄 Reseteando formulario completo...');
  
  setTimeout(() => {
    resetPassengerCounter();
    
    paymentMethod = 'cash';
    const paymentButtons = document.querySelectorAll('.payment-btn');
    paymentButtons.forEach(b => b.classList.remove('active'));
    const cashBtn = document.querySelector('.cash-btn');
    if (cashBtn) cashBtn.classList.add('active');
    
    selectedTip = null;
    customTipValue = '';
    updateTipDisplay();
    
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
      countrySelect.value = '';
      countrySelect.focus();
    }
    
    console.log('✅ Formulario completamente reseteado');
  }, 1000);
}

// ========== VIAJES DE HOY EN PANTALLA NUEVO VIAJE ==========
function updateTodayTrips() {
  console.log('📝 Actualizando lista de viajes de hoy...');
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  const todayTripsList = document.getElementById('today-trips-list');
  
  if (!todayTripsList) {
    console.error('No se encontró today-trips-list');
    return;
  }
  
  // Filtrar viajes de hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTrips = trips.filter(trip => {
    const tripDate = new Date(trip.timestamp);
    return tripDate >= today;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Más reciente primero
  
  if (todayTrips.length === 0) {
    todayTripsList.innerHTML = '<div class="empty-state">No hay viajes registrados hoy</div>';
    return;
  }
  
  let html = '';
  todayTrips.forEach(trip => {
    const paymentIcon = trip.paymentMethod === 'cash' ? '💵' : '💳';
    const paymentText = trip.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta';
    
    html += `
      <div class="today-trip-item">
        <div class="today-trip-info">
          <div class="today-trip-time">${trip.time}</div>
          <div class="today-trip-details">
            <span class="today-trip-country">${trip.country}</span>
            <span>•</span>
            <span>${trip.passengers} pasajero${trip.passengers !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span class="today-trip-payment">${paymentIcon} ${paymentText}</span>
            ${trip.tip > 0 ? `<span>•</span><span>+${trip.tip}€ propina</span>` : ''}
          </div>
        </div>
        <div class="today-trip-amount">${trip.total} €</div>
      </div>
    `;
  });
  
  todayTripsList.innerHTML = html;
  console.log(`✅ Mostrando ${todayTrips.length} viajes de hoy`);
}

// ========== RESUMEN DETALLADO (NUEVA VERSIÓN) ==========
function updateSummary(period = 'today') {
  console.log('📊 Actualizando Resumen detallado para:', period);
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  
  // Filtrar viajes según el periodo
  const filteredTrips = filterTripsByPeriod(trips, period);
  
  // Separar viajes por método de pago
  const cashTrips = filteredTrips.filter(t => t.paymentMethod === 'cash');
  const cardTrips = filteredTrips.filter(t => t.paymentMethod === 'card');
  
  // Calcular estadísticas de EFECTIVO
  const cashTripsCount = cashTrips.length;
  const cashTripsAmount = cashTrips.reduce((sum, trip) => sum + 70, 0); // 70€ por viaje
  const cashTipsAmount = cashTrips.reduce((sum, trip) => sum + parseFloat(trip.tip || 0), 0);
  
  // Calcular estadísticas de TARJETA
  const cardTripsCount = cardTrips.length;
  const cardTripsAmount = cardTrips.reduce((sum, trip) => sum + 70, 0); // 70€ por viaje
  const cardTipsAmount = cardTrips.reduce((sum, trip) => sum + parseFloat(trip.tip || 0), 0);
  
  // Calcular totales
  const totalAllTrips = cashTripsCount + cardTripsCount;
  
  // Calcular efectivo a entregar (FÓRMULA: efectivo - propinas tarjeta)
  const cashToDeliver = cashTripsAmount - cardTipsAmount;
  
  // Actualizar la fecha
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    currentDateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }
  
  // Actualizar todos los elementos en pantalla
  document.getElementById('total-all-trips').textContent = totalAllTrips;
  
  document.getElementById('cash-trips-count').textContent = cashTripsCount;
  document.getElementById('cash-trips-amount').textContent = `${cashTripsAmount.toFixed(2)} €`;
  document.getElementById('cash-tips-amount').textContent = `${cashTipsAmount.toFixed(2)} €`;
  
  document.getElementById('card-trips-count').textContent = cardTripsCount;
  document.getElementById('card-trips-amount').textContent = `${cardTripsAmount.toFixed(2)} €`;
  document.getElementById('card-tips-amount').textContent = `${cardTipsAmount.toFixed(2)} €`;
  
  document.getElementById('cash-to-deliver').textContent = `${Math.max(cashToDeliver, 0).toFixed(2)} €`;
  
  // Mostrar fórmula si hay datos
  if (totalAllTrips > 0) {
    console.log(`💰 Resumen: ${cashTripsCount} efectivo + ${cardTripsCount} tarjeta = ${totalAllTrips} viajes`);
    console.log(`💵 Efectivo a entregar: ${cashTripsAmount}€ - ${cardTipsAmount}€ = ${cashToDeliver}€`);
  }
}

// ========== ESTADÍSTICAS ==========
function updateStats(period = 'month') {
  console.log('📈 Actualizando Stats para:', period);
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  
  if (trips.length === 0) {
    console.log('📭 No hay viajes para mostrar en Stats');
    showEmptyStats();
    return;
  }
  
  const stats = calculateMonthlyStats(trips);
  
  // Actualizar la pantalla de Stats
  document.getElementById('monthly-total-trips').textContent = stats.totalTrips;
  document.getElementById('monthly-total-passengers').textContent = stats.totalPassengers;
  document.getElementById('monthly-cash-trips').textContent = stats.cashTrips;
  document.getElementById('monthly-card-trips').textContent = stats.cardTrips;
  
  // Actualizar distribución por países
  updateCountriesDistribution(stats.countries);
  
  // Actualizar gráfico
  updatePaymentChart(stats.cashPercentage, stats.cardPercentage);
  
  console.log('✅ Stats actualizados:', stats);
}

function filterTripsByPeriod(trips, period) {
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  
  return trips.filter(trip => {
    const fechaViaje = new Date(trip.timestamp);
    
    if (period === 'today') return fechaViaje >= hoy;
    if (period === 'yesterday') {
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);
      return fechaViaje >= ayer && fechaViaje < hoy;
    }
    if (period === 'week') {
      const semanaPasada = new Date(hoy);
      semanaPasada.setDate(semanaPasada.getDate() - 7);
      return fechaViaje >= semanaPasada;
    }
    return true; // 'all' o cualquier otro
  });
}

function calculateMonthlyStats(trips) {
  const stats = {
    totalTrips: trips.length,
    totalPassengers: trips.reduce((sum, t) => sum + t.passengers, 0),
    cashTrips: trips.filter(t => t.paymentMethod === 'cash').length,
    cardTrips: trips.filter(t => t.paymentMethod === 'card').length
  };
  
  // Porcentajes para el gráfico
  stats.cashPercentage = stats.totalTrips > 0 ? 
    Math.round((stats.cashTrips / stats.totalTrips) * 100) : 0;
  stats.cardPercentage = stats.totalTrips > 0 ? 
    Math.round((stats.cardTrips / stats.totalTrips) * 100) : 0;
  
  // Distribución por países
  const paises = {};
  trips.forEach(trip => {
    const pais = trip.country || 'Sin especificar';
    if (!paises[pais]) paises[pais] = { viajes: 0, pasajeros: 0 };
    paises[pais].viajes++;
    paises[pais].pasajeros += trip.passengers;
  });
  
  stats.countries = Object.entries(paises)
    .map(([pais, datos]) => ({
      pais,
      viajes: datos.viajes,
      pasajeros: datos.pasajeros
    }))
    .sort((a, b) => b.viajes - a.viajes);
  
  return stats;
}

function updateCountriesDistribution(countries) {
  const container = document.getElementById('countries-list');
  if (!container) return;
  
  if (countries.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay datos de países</div>';
    return;
  }
  
  let html = '';
  countries.forEach(pais => {
    html += `
      <div class="country-item">
        <div class="country-name">${pais.pais}</div>
        <div class="country-stats">
          <div class="country-trips">${pais.viajes} viaje${pais.viajes !== 1 ? 's' : ''}</div>
          <div class="country-passengers">(${pais.pasajeros} pasajero${pais.pasajeros !== 1 ? 's' : ''})</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function updatePaymentChart(cashPercent, cardPercent) {
  const cashBar = document.getElementById('cash-bar');
  const cardBar = document.getElementById('card-bar');
  const cashText = document.getElementById('cash-percent');
  const cardText = document.getElementById('card-percent');
  
  if (!cashBar || !cardBar) return;
  
  cashBar.style.width = `${Math.max(cashPercent, 5)}%`;
  cardBar.style.width = `${Math.max(cardPercent, 5)}%`;
  
  if (cashText) cashText.textContent = `${cashPercent}%`;
  if (cardText) cardText.textContent = `${cardPercent}%`;
}

function showEmptyStats() {
  document.getElementById('monthly-total-trips').textContent = '0';
  document.getElementById('monthly-total-passengers').textContent = '0';
  document.getElementById('monthly-cash-trips').textContent = '0';
  document.getElementById('monthly-card-trips').textContent = '0';
  
  const container = document.getElementById('countries-list');
  if (container) {
    container.innerHTML = '<div class="empty-state">No hay viajes registrados</div>';
  }
  
  updatePaymentChart(0, 0);
}

// ========== INICIALIZACIÓN ==========
function initSummaryAndStats() {
  console.log('📋 Inicializando resumen, stats y viajes de hoy...');
  
  document.addEventListener('tripAdded', function() {
    console.log('🔄 Viaje añadido, actualizando todas las pantallas...');
    updateSummary('today');
    updateStats('month');
    updateTodayTrips();
  });
  
  // Inicializar con datos existentes
  updateSummary('today');
  updateStats('month');
  updateTodayTrips();
  
  console.log('✅ Todas las pantallas listas');
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 DOM completamente cargado');
  
  showScreen('new-trip');
  
  initPassengerSelector();
  initPaymentButtons();
  initAddTripButton();
  updateTipDisplay();
  
  // ¡IMPORTANTE! Inicializar Resumen y Stats
  initSummaryAndStats();
  
  // Navegación
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', function() {
      const target = this.getAttribute('onclick');
      if (target && target.includes("showScreen")) {
        const screenId = target.match(/'([^']+)'/)[1];
        showScreen(screenId);
      }
    });
  });
  
  console.log('✅ Aplicación completamente inicializada');
});
