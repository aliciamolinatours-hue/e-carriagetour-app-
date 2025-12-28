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

// ============================================
// FUNCIONALIDAD PARA RESUMEN Y ESTADÍSTICAS
// ============================================

// 1. Función para actualizar el resumen
function updateSummary(period = 'today') {
  console.log(`📊 Actualizando resumen para: ${period}`);
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  
  // Filtrar viajes según el periodo
  const filteredTrips = filterTripsByPeriod(trips, period);
  
  // Calcular estadísticas
  const stats = calculateStats(filteredTrips);
  
  // Actualizar tarjetas
  document.getElementById('total-income').textContent = `${stats.totalIncome} €`;
  document.getElementById('total-trips').textContent = stats.totalTrips;
  document.getElementById('total-passengers').textContent = stats.totalPassengers;
  document.getElementById('average-tip').textContent = `${stats.averageTip} €`;
  
  // Actualizar lista de viajes recientes
  updateRecentTrips(filteredTrips);
  
  console.log('✅ Resumen actualizado:', stats);
}

// 2. Función para actualizar estadísticas
function updateStats(period = 'today') {
  console.log(`📈 Actualizando estadísticas para: ${period}`);
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  const filteredTrips = filterTripsByPeriod(trips, period);
  const stats = calculateStats(filteredTrips);
  
  // Actualizar estadísticas
  document.getElementById('stats-total-income').textContent = `${stats.totalIncome} €`;
  document.getElementById('stats-total-trips').textContent = stats.totalTrips;
  document.getElementById('stats-total-tip').textContent = `${stats.totalTip} €`;
  
  // Actualizar gráfico de métodos de pago
  updatePaymentMethodsChart(stats);
  
  // Actualizar historial completo
  updateAllTrips(filteredTrips);
  
  console.log('✅ Estadísticas actualizadas');
}

// 3. Función para filtrar viajes por periodo
function filterTripsByPeriod(trips, period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return trips.filter(trip => {
    const tripDate = new Date(trip.timestamp);
    
    switch(period) {
      case 'today':
        return tripDate >= today;
      case 'yesterday':
        return tripDate >= yesterday && tripDate < today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return tripDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return tripDate >= monthAgo;
      case 'all':
        return true;
      default:
        return tripDate >= today;
    }
  });
}

// 4. Función para calcular estadísticas
function calculateStats(trips) {
  if (trips.length === 0) {
    return {
      totalTrips: 0,
      totalIncome: 0,
      totalPassengers: 0,
      totalTip: 0,
      averageTip: 0,
      cashCount: 0,
      cardCount: 0
    };
  }
  
  const stats = {
    totalTrips: trips.length,
    totalIncome: trips.reduce((sum, trip) => sum + parseFloat(trip.total), 0),
    totalPassengers: trips.reduce((sum, trip) => sum + trip.passengers, 0),
    totalTip: trips.reduce((sum, trip) => sum + parseFloat(trip.tip), 0),
    cashCount: trips.filter(trip => trip.paymentMethod === 'cash').length,
    cardCount: trips.filter(trip => trip.paymentMethod === 'card').length
  };
  
  stats.averageTip = (stats.totalTip / stats.totalTrips).toFixed(2);
  stats.totalIncome = stats.totalIncome.toFixed(2);
  stats.totalTip = stats.totalTip.toFixed(2);
  
  return stats;
}

// 5. Función para actualizar viajes recientes
function updateRecentTrips(trips) {
  const recentTripsContainer = document.getElementById('recent-trips');
  const recentTrips = trips.slice(0, 5); // Últimos 5 viajes
  
  if (recentTrips.length === 0) {
    recentTripsContainer.innerHTML = '<div class="empty-state">No hay viajes registrados hoy</div>';
    return;
  }
  
  let html = '';
  recentTrips.forEach(trip => {
    html += `
      <div class="trip-item">
        <div class="trip-info">
          <div class="trip-country">${trip.country}</div>
          <div class="trip-details">
            ${trip.time} • ${trip.passengers} pasajero(s) • ${trip.paymentMethod === 'cash' ? '💵' : '💳'}
          </div>
        </div>
        <div class="trip-amount">${trip.total} €</div>
      </div>
    `;
  });
  
  recentTripsContainer.innerHTML = html;
}

// 6. Función para actualizar todos los viajes
function updateAllTrips(trips) {
  const allTripsContainer = document.getElementById('all-trips');
  
  if (trips.length === 0) {
    allTripsContainer.innerHTML = '<div class="empty-state">No hay viajes registrados</div>';
    return;
  }
  
  let html = '';
  trips.forEach(trip => {
    html += `
      <div class="trip-item">
        <div class="trip-info">
          <div class="trip-country">${trip.country}</div>
          <div class="trip-details">
            ${trip.date} ${trip.time} • ${trip.passengers} pasajero(s) • ${trip.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}
          </div>
        </div>
        <div class="trip-amount">${trip.total} €</div>
      </div>
    `;
  });
  
  allTripsContainer.innerHTML = html;
}

// 7. Función para actualizar gráfico de métodos de pago
function updatePaymentMethodsChart(stats) {
  const total = stats.cashCount + stats.cardCount;
  
  if (total === 0) {
    document.querySelector('.cash-bar').style.width = '0%';
    document.querySelector('.card-bar').style.width = '0%';
    document.querySelector('.cash-bar').textContent = '';
    document.querySelector('.card-bar').textContent = '';
    return;
  }
  
  const cashPercent = Math.round((stats.cashCount / total) * 100);
  const cardPercent = 100 - cashPercent;
  
  const cashBar = document.querySelector('.cash-bar');
  const cardBar = document.querySelector('.card-bar');
  
  cashBar.style.width = `${cashPercent}%`;
  cardBar.style.width = `${cardPercent}%`;
  
  cashBar.textContent = cashPercent > 10 ? `Efectivo: ${cashPercent}%` : '';
  cardBar.textContent = cardPercent > 10 ? `Tarjeta: ${cardPercent}%` : '';
}

// 8. Inicializar controles de resumen y stats
function initSummaryAndStats() {
  console.log('📋 Inicializando resumen y estadísticas...');
  
  // Event listeners para botones de periodo (Resumen)
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
  
  // Event listener para selector de periodo (Stats)
  document.getElementById('stats-period')?.addEventListener('change', (e) => {
    updateStats(e.target.value);
  });
  
  // Actualizar al cambiar de pantalla
  document.addEventListener('tripAdded', () => {
    updateSummary('today');
    updateStats('today');
  });
  
  // Inicializar con datos actuales
  updateSummary('today');
  updateStats('today');
  
  console.log('✅ Resumen y estadísticas inicializados');
}

// 9. Modificar la función initApp para incluir la inicialización
function initApp() {
  initPassengerSelector();
  initPaymentButtons();
  initTipOptions();
  initAddTripButton();
  initSummaryAndStats(); // ← AÑADE ESTA LÍNEA
  
  console.log('✅ Aplicación completamente inicializada');
}

// 10. Modificar showScreen para actualizar al cambiar de pantalla
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  
  // Actualizar datos cuando se muestra una pantalla
  if (id === 'summary') {
    updateSummary('today');
  } else if (id === 'stats') {
    updateStats('today');
  }
}

// ============================================
// FUNCIONALIDAD PARA ESTADÍSTICAS MEJORADAS
// ============================================

// 1. Función para obtener estadísticas mensuales
function getMonthlyStats(trips, monthFilter = 'current') {
  console.log(`📅 Calculando estadísticas para: ${monthFilter}`);
  
  let filteredTrips = [...trips];
  
  // Filtrar por mes si es necesario
  if (monthFilter !== 'all') {
    const now = new Date();
    let targetMonth, targetYear;
    
    if (monthFilter === 'current') {
      targetMonth = now.getMonth();
      targetYear = now.getFullYear();
    } else {
      // monthFilter sería algo como "2024-01"
      const [year, month] = monthFilter.split('-').map(Number);
      targetMonth = month - 1; // JavaScript meses van de 0-11
      targetYear = year;
    }
    
    filteredTrips = trips.filter(trip => {
      const tripDate = new Date(trip.timestamp);
      return tripDate.getMonth() === targetMonth && 
             tripDate.getFullYear() === targetYear;
    });
  }
  
  // Calcular estadísticas básicas
  const stats = {
    totalTrips: filteredTrips.length,
    totalPassengers: filteredTrips.reduce((sum, trip) => sum + trip.passengers, 0),
    cashTrips: filteredTrips.filter(t => t.paymentMethod === 'cash').length,
    cardTrips: filteredTrips.filter(t => t.paymentMethod === 'card').length,
    totalIncome: filteredTrips.reduce((sum, trip) => sum + parseFloat(trip.total), 0),
    totalTip: filteredTrips.reduce((sum, trip) => sum + parseFloat(trip.tip), 0)
  };
  
  // Calcular distribución por países
  const countryStats = {};
  filteredTrips.forEach(trip => {
    if (!countryStats[trip.country]) {
      countryStats[trip.country] = {
        trips: 0,
        passengers: 0,
        income: 0
      };
    }
    countryStats[trip.country].trips++;
    countryStats[trip.country].passengers += trip.passengers;
    countryStats[trip.country].income += parseFloat(trip.total);
  });
  
  // Convertir a array y ordenar por número de viajes
  const countryArray = Object.entries(countryStats).map(([country, data]) => ({
    country,
    ...data
  })).sort((a, b) => b.trips - a.trips);
  
  return {
    ...stats,
    countries: countryArray,
    cashPercentage: stats.totalTrips > 0 ? Math.round((stats.cashTrips / stats.totalTrips) * 100) : 0,
    cardPercentage: stats.totalTrips > 0 ? Math.round((stats.cardTrips / stats.totalTrips) * 100) : 0
  };
}

// 2. Función para actualizar la interfaz de estadísticas mensuales
function updateMonthlyStats(stats) {
  console.log('📊 Actualizando estadísticas mensuales en la interfaz');
  
  // Actualizar valores principales
  document.getElementById('monthly-total-trips').textContent = stats.totalTrips;
  document.getElementById('monthly-total-passengers').textContent = stats.totalPassengers;
  document.getElementById('monthly-cash-trips').textContent = stats.cashTrips;
  document.getElementById('monthly-card-trips').textContent = stats.cardTrips;
  
  // Actualizar gráfico de métodos de pago
  updatePaymentMethodsChartImproved(stats);
  
  // Actualizar distribución por países
  updateCountriesDistribution(stats.countries);
}

// 3. Función para actualizar distribución por países
function updateCountriesDistribution(countries) {
  const countriesList = document.getElementById('countries-list');
  
  if (countries.length === 0) {
    countriesList.innerHTML = '<div class="empty-state">No hay datos de países</div>';
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
  
  countriesList.innerHTML = html;
}

// 4. Función mejorada para gráfico de métodos de pago
function updatePaymentMethodsChartImproved(stats) {
  const cashBar = document.getElementById('cash-bar');
  const cardBar = document.getElementById('card-bar');
  const cashPercent = document.getElementById('cash-percent');
  const cardPercent = document.getElementById('card-percent');
  
  if (stats.totalTrips === 0) {
    cashBar.style.width = '0%';
    cardBar.style.width = '0%';
    cashPercent.textContent = '0%';
    cardPercent.textContent = '0%';
    return;
  }
  
  const cashWidth = Math.max(stats.cashPercentage, 5); // Mínimo 5% para que se vea
  const cardWidth = Math.max(stats.cardPercentage, 5);
  
  cashBar.style.width = `${cashWidth}%`;
  cardBar.style.width = `${cardWidth}%`;
  
  cashPercent.textContent = `${stats.cashPercentage}%`;
  cardPercent.textContent = `${stats.cardPercentage}%`;
}

// 5. Función para obtener meses disponibles
function getAvailableMonths(trips) {
  const months = new Set();
  
  trips.forEach(trip => {
    const date = new Date(trip.timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    months.add(JSON.stringify({ key: monthKey, name: monthName }));
  });
  
  // Convertir a array y ordenar (más reciente primero)
  return Array.from(months)
    .map(m => JSON.parse(m))
    .sort((a, b) => b.key.localeCompare(a.key));
}

// 6. Función para actualizar selector de meses
function updateMonthSelector(months) {
  const monthSelect = document.getElementById('stats-month');
  
  if (!monthSelect) return;
  
  // Limpiar opciones existentes
  monthSelect.innerHTML = '';
  
  // Agregar opción para "Todos los meses"
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Todos los meses';
  monthSelect.appendChild(allOption);
  
  // Agregar meses disponibles
  months.forEach(month => {
    const option = document.createElement('option');
    option.value = month.key;
    option.textContent = month.name.charAt(0).toUpperCase() + month.name.slice(1);
    
    // Seleccionar mes actual por defecto
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    if (month.key === currentMonth) {
      option.selected = true;
    }
    
    monthSelect.appendChild(option);
  });
}

// 7. Función principal para actualizar estadísticas
function updateStats(period = 'month') {
  console.log(`📈 Actualizando estadísticas para periodo: ${period}`);
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  
  // Obtener meses disponibles
  const availableMonths = getAvailableMonths(trips);
  updateMonthSelector(availableMonths);
  
  // Obtener mes seleccionado
  const monthSelect = document.getElementById('stats-month');
  const selectedMonth = monthSelect ? monthSelect.value : 'current';
  
  // Calcular estadísticas según el periodo
  let stats;
  if (period === 'month') {
    stats = getMonthlyStats(trips, selectedMonth);
  } else {
    // Para otros periodos (hoy, ayer, semana, todos)
    const filteredTrips = filterTripsByPeriod(trips, period);
    stats = getMonthlyStats(filteredTrips, 'all');
  }
  
  // Actualizar interfaz
  updateMonthlyStats(stats);
  
  // También actualizar el historial completo
  updateAllTrips(trips.filter(trip => {
    if (period === 'month' && selectedMonth !== 'all') {
      const tripDate = new Date(trip.timestamp);
      const [year, month] = selectedMonth.split('-').map(Number);
      return tripDate.getMonth() === month - 1 && tripDate.getFullYear() === year;
    }
    return filterTripsByPeriod([trip], period).length > 0;
  }));
  
  console.log('✅ Estadísticas actualizadas:', stats);
}

// 8. Modificar la inicialización para incluir eventos del selector de mes
function initSummaryAndStats() {
  console.log('📋 Inicializando resumen y estadísticas mejoradas...');
  
  // ... (mantener los event listeners existentes para resumen)
  
  // Event listener para selector de periodo (Stats)
  document.getElementById('stats-period')?.addEventListener('change', (e) => {
    updateStats(e.target.value);
  });
  
  // Event listener para selector de mes
  document.getElementById('stats-month')?.addEventListener('change', () => {
    const periodSelect = document.getElementById('stats-period');
    const selectedPeriod = periodSelect ? periodSelect.value : 'month';
    updateStats(selectedPeriod);
  });
  
  // Actualizar al cambiar de pantalla
  document.addEventListener('tripAdded', () => {
    updateSummary('today');
    updateStats('month'); // Cambiado de 'today' a 'month'
  });
  
  // Inicializar con datos actuales
  updateSummary('today');
  updateStats('month'); // Cambiado de 'today' a 'month'
  
  console.log('✅ Resumen y estadísticas mejoradas inicializados');
}

// 9. Modificar showScreen para cargar estadísticas mensuales por defecto
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  
  // Actualizar datos cuando se muestra una pantalla
  if (id === 'summary') {
    updateSummary('today');
  } else if (id === 'stats') {
    updateStats('month'); // Cambiado de 'today' a 'month'
  }
}
