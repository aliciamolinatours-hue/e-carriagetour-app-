// app.js - VERSIÓN SIMPLIFICADA
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

// ========== VIAJES DE HOY (SOLO EN NUEVO VIAJE) ==========
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
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
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

// ========== RESUMEN DETALLADO ==========
function updateSummary(period = 'today') {
  console.log('📊 Actualizando Resumen para:', period);
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  const filteredTrips = filterTripsByPeriod(trips, period);
  
  const cashTrips = filteredTrips.filter(t => t.paymentMethod === 'cash');
  const cardTrips = filteredTrips.filter(t => t.paymentMethod === 'card');
  
  // Calcular estadísticas
  const cashTripsCount = cashTrips.length;
  const cashTripsAmount = cashTrips.reduce((sum, trip) => sum + 70, 0);
  const cashTipsAmount = cashTrips.reduce((sum, trip) => sum + parseFloat(trip.tip || 0), 0);
  
  const cardTripsCount = cardTrips.length;
  const cardTripsAmount = cardTrips.reduce((sum, trip) => sum + 70, 0);
  const cardTipsAmount = cardTrips.reduce((sum, trip) => sum + parseFloat(trip.tip || 0), 0);
  
  const totalAllTrips = cashTripsCount + cardTripsCount;
  const cashToDeliver = cashTripsAmount - cardTipsAmount;
  
  // Actualizar fecha
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
  
  // Actualizar elementos
  document.getElementById('total-all-trips').textContent = totalAllTrips;
  document.getElementById('cash-trips-count').textContent = cashTripsCount;
  document.getElementById('cash-trips-amount').textContent = `${cashTripsAmount.toFixed(2)} €`;
  document.getElementById('cash-tips-amount').textContent = `${cashTipsAmount.toFixed(2)} €`;
  document.getElementById('card-trips-count').textContent = cardTripsCount;
  document.getElementById('card-trips-amount').textContent = `${cardTripsAmount.toFixed(2)} €`;
  document.getElementById('card-tips-amount').textContent = `${cardTipsAmount.toFixed(2)} €`;
  document.getElementById('cash-to-deliver').textContent = `${Math.max(cashToDeliver, 0).toFixed(2)} €`;
  
  if (totalAllTrips > 0) {
    console.log(`💰 Resumen: ${cashTripsCount} efectivo + ${cardTripsCount} tarjeta = ${totalAllTrips} viajes`);
  }
}

// ========== ESTADÍSTICAS SIMPLIFICADAS ==========
function updateStats(period = 'month') {
  console.log('📈 Actualizando Stats para:', period);
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  const filteredTrips = filterTripsByPeriod(trips, period);
  
  if (filteredTrips.length === 0) {
    showEmptyStats();
    return;
  }
  
  // Calcular estadísticas básicas
  const totalTrips = filteredTrips.length;
  const totalPassengers = filteredTrips.reduce((sum, t) => sum + t.passengers, 0);
  const cashTrips = filteredTrips.filter(t => t.paymentMethod === 'cash').length;
  const cardTrips = filteredTrips.filter(t => t.paymentMethod === 'card').length;
  
  // Porcentajes para el gráfico
  const cashPercentage = totalTrips > 0 ? Math.round((cashTrips / totalTrips) * 100) : 0;
  const cardPercentage = totalTrips > 0 ? Math.round((cardTrips / totalTrips) * 100) : 0;
  
  // Distribución por países
  const countryStats = {};
  filteredTrips.forEach(trip => {
    const country = trip.country || 'Sin especificar';
    if (!countryStats[country]) countryStats[country] = { trips: 0, passengers: 0 };
    countryStats[country].trips++;
    countryStats[country].passengers += trip.passengers;
  });
  
  const countriesArray = Object.entries(countryStats)
    .map(([country, data]) => ({ country, trips: data.trips, passengers: data.passengers }))
    .sort((a, b) => b.trips - a.trips);
  
  // Actualizar pantalla
  document.getElementById('monthly-total-trips').textContent = totalTrips;
  document.getElementById('monthly-total-passengers').textContent = totalPassengers;
  document.getElementById('monthly-cash-trips').textContent = cashTrips;
  document.getElementById('monthly-card-trips').textContent = cardTrips;
  
  updateCountriesDistribution(countriesArray);
  updatePaymentChart(cashPercentage, cardPercentage);
  
  console.log(`✅ Stats: ${totalTrips} viajes, ${cashTrips} efectivo, ${cardTrips} tarjeta`);
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
    return true; // 'month' o 'all'
  });
}

function updateCountriesDistribution(countries) {
  const container = document.getElementById('countries-list');
  if (!container) return;
  
  if (countries.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay datos de países</div>';
    return;
  }
  
  let html = '';
  countries.forEach(country => {
    html += `
      <div class="country-item">
        <div class="country-name">${country.country}</div>
        <div class="country-stats">
          <div class="country-trips">${country.trips} viaje${country.trips !== 1 ? 's' : ''}</div>
          <div class="country-passengers">(${country.passengers} pasajero${country.passengers !== 1 ? 's' : ''})</div>
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
    container.innerHTML = '<div class="empty-state">No hay datos para este periodo</div>';
  }
  
  updatePaymentChart(0, 0);
}

// ========== INICIALIZACIÓN ==========
function initSummaryAndStats() {
  console.log('📋 Inicializando todas las pantallas...');
  
  document.addEventListener('tripAdded', function() {
    console.log('🔄 Viaje añadido, actualizando pantallas...');
    updateSummary('today');
    updateStats('month');
    updateTodayTrips();
  });
  
  // Configurar evento para el selector de periodo en Stats
  const statsPeriodSelect = document.getElementById('stats-period');
  if (statsPeriodSelect) {
    statsPeriodSelect.addEventListener('change', function() {
      updateStats(this.value);
    });
  }
  
  // Configurar eventos para los botones de periodo en Resumen
  document.getElementById('today-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('today-btn').classList.add('active');
    updateSummary('today');
  });
  
  document.getElementById('yesterday-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('yesterday-btn').classList.add('active');
    updateSummary('yesterday');
  });
  
  document.getElementById('week-btn')?.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('week-btn').classList.add('active');
    updateSummary('week');
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
