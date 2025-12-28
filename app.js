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
// FUNCIONALIDAD MEJORADA PARA ESTADÍSTICAS
// ============================================

// 1. Función PRINCIPAL para actualizar estadísticas (REEMPLAZA la anterior)
function updateStats(period = 'month') {
  console.log(`📈 Actualizando estadísticas MEJORADAS para: ${period}`);
  
  // Obtener todos los viajes
  const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
  console.log('Total viajes en sistema:', allTrips.length);
  
  // 1.1 Filtrar viajes según el periodo seleccionado
  let tripsToAnalyze;
  
  if (period === 'today' || period === 'yesterday' || period === 'week') {
    tripsToAnalyze = filterTripsByPeriod(allTrips, period);
  } else if (period === 'month') {
    // Para "mes", usar el mes seleccionado en el selector
    const monthSelect = document.getElementById('stats-month');
    const selectedMonth = monthSelect ? monthSelect.value : 'all';
    
    if (selectedMonth === 'all') {
      tripsToAnalyze = allTrips;
    } else {
      const [year, month] = selectedMonth.split('-').map(Number);
      tripsToAnalyze = allTrips.filter(trip => {
        const tripDate = new Date(trip.timestamp);
        return tripDate.getFullYear() === year && 
               tripDate.getMonth() === month - 1;
      });
    }
  } else if (period === 'all') {
    tripsToAnalyze = allTrips;
  }
  
  console.log(`📊 Viajes a analizar: ${tripsToAnalyze.length}`);
  
  // 1.2 Calcular TODAS las estadísticas
  const stats = calculateMonthlyStats(tripsToAnalyze);
  
  // 1.3 MOSTRAR todas las estadísticas en la pantalla
  displayMonthlyStats(stats);
  
  // 1.4 Actualizar también el historial completo
  updateAllTrips(tripsToAnalyze);
  
  console.log('✅ Estadísticas mejoradas actualizadas:', stats);
}

// 2. Función para CALCULAR estadísticas mensuales
function calculateMonthlyStats(trips) {
  if (trips.length === 0) {
    return {
      totalTrips: 0,
      totalPassengers: 0,
      cashTrips: 0,
      cardTrips: 0,
      cashPercentage: 0,
      cardPercentage: 0,
      countries: []
    };
  }
  
  // Calcular estadísticas básicas
  const stats = {
    totalTrips: trips.length,
    totalPassengers: trips.reduce((sum, trip) => sum + (parseInt(trip.passengers) || 1), 0),
    cashTrips: trips.filter(trip => trip.paymentMethod === 'cash').length,
    cardTrips: trips.filter(trip => trip.paymentMethod === 'card').length
  };
  
  // Calcular porcentajes
  stats.cashPercentage = stats.totalTrips > 0 ? 
    Math.round((stats.cashTrips / stats.totalTrips) * 100) : 0;
  stats.cardPercentage = stats.totalTrips > 0 ? 
    Math.round((stats.cardTrips / stats.totalTrips) * 100) : 0;
  
  // Calcular distribución por países
  const countryStats = {};
  trips.forEach(trip => {
    const country = trip.country || 'Sin especificar';
    
    if (!countryStats[country]) {
      countryStats[country] = {
        trips: 0,
        passengers: 0
      };
    }
    
    countryStats[country].trips++;
    countryStats[country].passengers += (parseInt(trip.passengers) || 1);
  });
  
  // Convertir a array y ordenar
  stats.countries = Object.entries(countryStats)
    .map(([country, data]) => ({
      country,
      trips: data.trips,
      passengers: data.passengers
    }))
    .sort((a, b) => b.trips - a.trips);
  
  return stats;
}

// 3. Función para MOSTRAR estadísticas mensuales en la pantalla
function displayMonthlyStats(stats) {
  console.log('🖥️ Mostrando estadísticas mensuales:', stats);
  
  // 3.1 Actualizar las 4 tarjetas principales
  document.getElementById('monthly-total-trips').textContent = stats.totalTrips;
  document.getElementById('monthly-total-passengers').textContent = stats.totalPassengers;
  document.getElementById('monthly-cash-trips').textContent = stats.cashTrips;
  document.getElementById('monthly-card-trips').textContent = stats.cardTrips;
  
  // 3.2 Actualizar distribución por países
  updateCountriesDistribution(stats.countries);
  
  // 3.3 Actualizar gráfico de métodos de pago
  updatePaymentChart(stats.cashPercentage, stats.cardPercentage);
  
  console.log('✅ Estadísticas mensuales mostradas correctamente');
}

// 4. Función para actualizar distribución por países
function updateCountriesDistribution(countries) {
  const countriesList = document.getElementById('countries-list');
  
  if (!countriesList) {
    console.error('❌ No se encontró el contenedor de países');
    return;
  }
  
  if (countries.length === 0) {
    countriesList.innerHTML = `
      <div class="empty-state">
        No hay datos de países para el periodo seleccionado
      </div>
    `;
    return;
  }
  
  let html = '';
  countries.forEach((country, index) => {
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
  console.log(`🌍 Mostrados ${countries.length} países`);
}

// 5. Función para actualizar gráfico de métodos de pago
function updatePaymentChart(cashPercent, cardPercent) {
  const cashBar = document.getElementById('cash-bar');
  const cardBar = document.getElementById('card-bar');
  const cashText = document.getElementById('cash-percent');
  const cardText = document.getElementById('card-percent');
  
  if (!cashBar || !cardBar) {
    console.error('❌ Elementos del gráfico no encontrados');
    return;
  }
  
  // Asegurar que haya al menos un pequeño porcentaje visible
  const displayCash = Math.max(cashPercent, 5);
  const displayCard = Math.max(cardPercent, 5);
  
  cashBar.style.width = `${displayCash}%`;
  cardBar.style.width = `${displayCard}%`;
  
  if (cashText) cashText.textContent = `${cashPercent}%`;
  if (cardText) cardText.textContent = `${cardPercent}%`;
  
  console.log(`📊 Gráfico actualizado: Efectivo ${cashPercent}%, Tarjeta ${cardPercent}%`);
}

// 6. Función para configurar selector de meses
function setupMonthSelector() {
  console.log('🗓️ Configurando selector de meses...');
  
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  const monthSelect = document.getElementById('stats-month');
  
  if (!monthSelect) {
    console.log('⚠️ Selector de meses no encontrado');
    return;
  }
  
  // Limpiar opciones actuales
  monthSelect.innerHTML = '';
  
  // Agregar opción "Todos los meses"
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Todos los meses';
  monthSelect.appendChild(allOption);
  
  if (trips.length === 0) {
    console.log('📭 No hay viajes para mostrar meses');
    return;
  }
  
  // Obtener meses únicos
  const monthsMap = new Map();
  trips.forEach(trip => {
    try {
      const date = new Date(trip.timestamp);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      }).replace(/^\w/, c => c.toUpperCase());
      
      monthsMap.set(monthKey, monthName);
    } catch (error) {
      console.log('Error procesando fecha:', trip);
    }
  });
  
  // Ordenar por fecha (más reciente primero)
  const monthsArray = Array.from(monthsMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]));
  
  // Agregar meses al selector
  monthsArray.forEach(([key, name]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = name;
    monthSelect.appendChild(option);
  });
  
  // Seleccionar mes actual por defecto
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const currentOption = monthSelect.querySelector(`option[value="${currentMonth}"]`);
  
  if (currentOption) {
    currentOption.selected = true;
  } else if (monthsArray.length > 0) {
    monthSelect.value = monthsArray[0][0];
  } else {
    monthSelect.value = 'all';
  }
  
  console.log(`✅ Selector configurado con ${monthsArray.length + 1} opciones`);
}

// 7. MODIFICAR la función initSummaryAndStats() (REEMPLAZA la anterior)
function initSummaryAndStats() {
  console.log('📋 Inicializando resumen y estadísticas MEJORADAS...');
  
  // Configurar selector de meses
  setupMonthSelector();
  
  // Event listeners para botones de periodo (Resumen - se mantienen igual)
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
  
  // Event listener para selector de mes
  document.getElementById('stats-month')?.addEventListener('change', () => {
    const periodSelect = document.getElementById('stats-period');
    const selectedPeriod = periodSelect ? periodSelect.value : 'month';
    updateStats(selectedPeriod);
  });
  
  // Actualizar al añadir viaje
  document.addEventListener('tripAdded', () => {
    updateSummary('today');
    updateStats('month'); // Usar 'month' en lugar de 'today'
  });
  
  // Inicializar con datos actuales
  updateSummary('today');
  updateStats('month'); // Usar 'month' en lugar de 'today'
  
  console.log('✅ Resumen y estadísticas MEJORADAS inicializados');
}

// 8. MODIFICAR la función showScreen() (AJUSTAR para usar las nuevas estadísticas)
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  
  // Actualizar datos cuando se muestra una pantalla
  if (id === 'summary') {
    updateSummary('today');
  } else if (id === 'stats') {
    // Cuando se muestra stats, cargar selector de meses y estadísticas
    setupMonthSelector();
    updateStats('month');
  }
}
