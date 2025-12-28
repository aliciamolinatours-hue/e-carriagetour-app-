// ============================================
// E-CARRIAGE TOUR - APP MÓVIL PROFESIONAL
// ============================================

console.log('🚀 E-Carriage Tour App iniciada');

// ========== CONFIGURACIÓN INICIAL ==========
const CONFIG = {
    BASE_PRICE: 70.00,
    MAX_PASSENGERS: 8,
    MIN_PASSENGERS: 1,
    STORAGE_KEY: 'ecarriage_trips',
    APP_VERSION: '2.0'
};

// Estado global de la aplicación
const AppState = {
    currentScreen: 'new-trip',
    passengerCount: 1,
    paymentMethod: 'cash',
    selectedTip: 0,
    customTipValue: '',
    currentPeriod: 'today',
    statsPeriod: 'month',
    trips: []
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Aplicación cargada - Versión', CONFIG.APP_VERSION);
    
    initApp();
    showScreen('new-trip');
    updateCurrentDate();
    
    // Cargar viajes desde localStorage
    loadTripsFromStorage();
    
    // Actualizar cada minuto la fecha
    setInterval(updateCurrentDate, 60000);
});

// ========== FUNCIONES DE INICIALIZACIÓN ==========
function initApp() {
    console.log('🔄 Inicializando componentes...');
    
    // Inicializar componentes
    initPassengerSelector();
    initPaymentMethods();
    initTipSystem();
    initAddTripButton();
    initNavigation();
    initPeriodSelectors();
    initSummaryScreen();
    initStatsScreen();
    
    // Evento para actualizar cuando se añade viaje
    document.addEventListener('tripAdded', handleNewTrip);
    
    // Evento para cuando cambia la visibilidad de la página
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    console.log('✅ Aplicación inicializada correctamente');
}

function handleVisibilityChange() {
    if (!document.hidden) {
        // Recargar datos cuando la app vuelve a estar visible
        loadTripsFromStorage();
        refreshCurrentScreen();
    }
}

function refreshCurrentScreen() {
    switch(AppState.currentScreen) {
        case 'new-trip':
            updateTodayTrips();
            break;
        case 'summary':
            updateSummary(AppState.currentPeriod);
            break;
        case 'stats':
            updateStats(AppState.statsPeriod);
            break;
    }
}

// ========== MANEJO DE PANTALLAS ==========
function showScreen(screenId) {
    console.log('🔄 Cambiando a pantalla:', screenId);
    
    // Actualizar navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.screen === screenId) {
            btn.classList.add('active');
        }
    });
    
    // Ocultar todas las pantallas
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar pantalla seleccionada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = screenId;
        
        // Aplicar animación
        targetScreen.classList.add('slide-in');
        setTimeout(() => {
            targetScreen.classList.remove('slide-in');
        }, 300);
        
        // Actualizar datos de la pantalla
        updateScreenData(screenId);
    }
}

function updateScreenData(screenId) {
    switch(screenId) {
        case 'new-trip':
            updateTodayTrips();
            break;
        case 'summary':
            updateSummary(AppState.currentPeriod);
            break;
        case 'stats':
            updateStats(AppState.statsPeriod);
            break;
    }
}

// ========== COMPONENTE: SELECTOR DE PASAJEROS ==========
function initPassengerSelector() {
    const passengerCountEl = document.getElementById('passenger-count');
    const decreaseBtn = document.getElementById('decrease-passenger');
    const increaseBtn = document.getElementById('increase-passenger');
    const passengerInput = document.getElementById('passenger-input');
    
    if (!passengerCountEl || !decreaseBtn || !increaseBtn) return;
    
    function updatePassengerDisplay() {
        passengerCountEl.textContent = AppState.passengerCount;
        passengerInput.value = AppState.passengerCount;
        
        // Actualizar estado de botones
        decreaseBtn.disabled = AppState.passengerCount <= CONFIG.MIN_PASSENGERS;
        increaseBtn.disabled = AppState.passengerCount >= CONFIG.MAX_PASSENGERS;
        
        // Efecto visual
        passengerCountEl.classList.add('pulse');
        setTimeout(() => passengerCountEl.classList.remove('pulse'), 500);
        
        // Actualizar resumen
        updateTripSummary();
    }
    
    decreaseBtn.addEventListener('click', () => {
        if (AppState.passengerCount > CONFIG.MIN_PASSENGERS) {
            AppState.passengerCount--;
            updatePassengerDisplay();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        if (AppState.passengerCount < CONFIG.MAX_PASSENGERS) {
            AppState.passengerCount++;
            updatePassengerDisplay();
        }
    });
    
    // Efectos táctiles
    [decreaseBtn, increaseBtn].forEach(btn => {
        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.9)';
        });
        
        btn.addEventListener('touchend', () => {
            btn.style.transform = 'scale(1)';
        });
    });
    
    updatePassengerDisplay();
}

// ========== COMPONENTE: MÉTODOS DE PAGO ==========
function initPaymentMethods() {
    const paymentCards = document.querySelectorAll('.payment-method-card');
    
    paymentCards.forEach(card => {
        card.addEventListener('click', () => {
            // Desactivar todas las tarjetas
            paymentCards.forEach(c => c.classList.remove('active'));
            
            // Activar la seleccionada
            card.classList.add('active');
            AppState.paymentMethod = card.dataset.method;
            
            console.log('💳 Método de pago:', AppState.paymentMethod);
            
            // Actualizar sistema de propinas según método
            updateTipSystem();
            updateTripSummary();
        });
        
        // Efecto táctil
        card.addEventListener('touchstart', () => {
            card.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('touchend', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// ========== COMPONENTE: SISTEMA DE PROPINAS ==========
function initTipSystem() {
    updateTipSystem();
}

function updateTipSystem() {
    const tipContainer = document.getElementById('tip-container');
    if (!tipContainer) return;
    
    if (AppState.paymentMethod === 'card') {
        // Sistema de propinas para tarjeta con botones
        tipContainer.innerHTML = `
            <div class="tip-buttons-grid">
                <button type="button" class="tip-btn" data-tip="0">0 €</button>
                <button type="button" class="tip-btn" data-tip="5">5 €</button>
                <button type="button" class="tip-btn" data-tip="7">7 €</button>
                <button type="button" class="tip-btn" data-tip="10">10 €</button>
                <button type="button" class="tip-btn" data-tip="12.5">12,5 €</button>
                <button type="button" class="tip-btn" data-tip="15">15 €</button>
                <button type="button" class="tip-btn" data-tip="custom">Otro</button>
            </div>
            <div class="custom-tip-container" id="custom-tip-input-container" style="display: none; margin-top: 12px;">
                <input type="number" id="custom-tip-input" placeholder="0.00" step="0.01" min="0" max="50">
                <span class="currency">€</span>
            </div>
        `;
        
        // Configurar botones de propina
        const tipButtons = tipContainer.querySelectorAll('.tip-btn');
        tipButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Quitar activo de todos los botones
                tipButtons.forEach(b => b.classList.remove('active'));
                
                // Activar el botón clickeado
                btn.classList.add('active');
                
                const tipValue = btn.dataset.tip;
                
                if (tipValue === 'custom') {
                    // Mostrar input personalizado
                    document.getElementById('custom-tip-input-container').style.display = 'flex';
                    const input = document.getElementById('custom-tip-input');
                    input.focus();
                    
                    // Configurar evento para el input
                    input.addEventListener('input', (e) => {
                        AppState.customTipValue = e.target.value;
                        AppState.selectedTip = parseFloat(e.target.value) || 0;
                        updateTripSummary();
                    });
                } else {
                    // Ocultar input personalizado
                    document.getElementById('custom-tip-input-container').style.display = 'none';
                    AppState.selectedTip = parseFloat(tipValue);
                    AppState.customTipValue = '';
                    updateTripSummary();
                }
                
                console.log('💰 Propina seleccionada:', AppState.selectedTip);
            });
            
            // Efecto táctil
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
            });
            
            btn.addEventListener('touchend', () => {
                btn.style.transform = 'scale(1)';
            });
        });
        
        // Activar propina 0 por defecto
        if (tipButtons.length > 0) {
            tipButtons[0].click();
        }
        
    } else {
        // Input simple para efectivo
        tipContainer.innerHTML = `
            <div class="tip-amount-display">
                <input type="number" id="tip-input" class="tip-input" placeholder="0.00" step="0.01" min="0">
                <span class="currency">€</span>
            </div>
        `;
        
        const tipInput = document.getElementById('tip-input');
        if (tipInput) {
            tipInput.addEventListener('input', (e) => {
                AppState.selectedTip = parseFloat(e.target.value) || 0;
                updateTripSummary();
            });
            
            tipInput.value = AppState.selectedTip || '';
        }
    }
    
    // Añadir estilos para los botones de propina
    const style = document.createElement('style');
    style.textContent = `
        .tip-buttons-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 8px;
        }
        
        .tip-btn {
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius-md);
            background: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all var(--transition-fast);
        }
        
        .tip-btn:hover {
            border-color: var(--primary-color);
            transform: translateY(-2px);
        }
        
        .tip-btn.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        .custom-tip-container {
            display: flex;
            align-items: center;
            background: white;
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius-md);
            padding: 8px 12px;
        }
        
        .custom-tip-container input {
            flex: 1;
            border: none;
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            padding: 8px;
        }
        
        .custom-tip-container input:focus {
            outline: none;
        }
    `;
    document.head.appendChild(style);
}

// ========== COMPONENTE: RESUMEN DEL VIAJE ==========
function updateTripSummary() {
    const basePrice = CONFIG.BASE_PRICE;
    const tipAmount = AppState.selectedTip || 0;
    const total = basePrice + tipAmount;
    
    // Actualizar display
    const tipDisplay = document.getElementById('tip-amount-display');
    const totalDisplay = document.getElementById('total-amount-display');
    
    if (tipDisplay) tipDisplay.textContent = `${tipAmount.toFixed(2)} €`;
    if (totalDisplay) totalDisplay.textContent = `${total.toFixed(2)} €`;
}

// ========== COMPONENTE: AÑADIR VIAJE ==========
function initAddTripButton() {
    const addTripBtn = document.getElementById('add-trip-btn');
    
    if (!addTripBtn) return;
    
    addTripBtn.addEventListener('click', addNewTrip);
    
    // Efecto táctil
    addTripBtn.addEventListener('touchstart', () => {
        addTripBtn.style.transform = 'translateY(-2px)';
    });
    
    addTripBtn.addEventListener('touchend', () => {
        addTripBtn.style.transform = 'translateY(0)';
    });
}

function addNewTrip() {
    console.log('➕ Intentando añadir nuevo viaje...');
    
    // Validar formulario
    const countrySelect = document.getElementById('country');
    const country = countrySelect ? countrySelect.value : '';
    
    if (!country) {
        showNotification('Por favor, selecciona un país', 'warning');
        // Efecto de shake
        countrySelect.classList.add('shake');
        setTimeout(() => countrySelect.classList.remove('shake'), 500);
        return;
    }
    
    // Calcular precios
    const basePrice = CONFIG.BASE_PRICE;
    const tipAmount = AppState.selectedTip || 0;
    const total = basePrice + tipAmount;
    
    // Crear objeto del viaje
    const trip = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('es-ES'),
        time: new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        }),
        country: country,
        passengers: AppState.passengerCount,
        price: basePrice,
        paymentMethod: AppState.paymentMethod,
        tip: tipAmount,
        total: total
    };
    
    console.log('📝 Viaje creado:', trip);
    
    // Guardar viaje
    if (saveTrip(trip)) {
        showNotification(`✅ Viaje añadido: ${total.toFixed(2)} €`, 'success');
        resetForm();
        
        // Disparar evento
        const event = new CustomEvent('tripAdded', { detail: trip });
        document.dispatchEvent(event);
        
        // Actualizar pantalla actual
        updateScreenData(AppState.currentScreen);
    } else {
        showNotification('❌ Error al guardar el viaje', 'error');
    }
}

function saveTrip(trip) {
    try {
        // Cargar viajes existentes
        const trips = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
        
        // Añadir nuevo viaje al principio
        trips.unshift(trip);
        
        // Guardar en localStorage
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(trips));
        
        // Actualizar estado global
        AppState.trips = trips;
        
        console.log('💾 Viaje guardado. Total:', trips.length);
        return true;
    } catch (error) {
        console.error('Error al guardar:', error);
        return false;
    }
}

function loadTripsFromStorage() {
    try {
        const trips = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
        AppState.trips = trips;
        console.log('📂 Viajes cargados:', trips.length);
        return trips;
    } catch (error) {
        console.error('Error al cargar viajes:', error);
        AppState.trips = [];
        return [];
    }
}

function resetForm() {
    console.log('🔄 Reseteando formulario...');
    
    // Resetear pasajeros
    AppState.passengerCount = 1;
    updatePassengerDisplay();
    
    // Resetear país
    const countrySelect = document.getElementById('country');
    if (countrySelect) countrySelect.value = '';
    
    // Resetear propina
    AppState.selectedTip = 0;
    AppState.customTipValue = '';
    updateTipSystem();
    updateTripSummary();
    
    // Mantener método de pago (no resetear)
    
    console.log('✅ Formulario reseteado');
}

// ========== COMPONENTE: VIAJES DE HOY ==========
function updateTodayTrips() {
    const todayTripsList = document.getElementById('today-trips-list');
    const todayTripsCount = document.getElementById('today-trips-count');
    
    if (!todayTripsList || !todayTripsCount) return;
    
    // Filtrar viajes de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrips = AppState.trips.filter(trip => {
        const tripDate = new Date(trip.timestamp);
        return tripDate >= today;
    });
    
    // Actualizar contador
    todayTripsCount.textContent = todayTrips.length;
    
    if (todayTrips.length === 0) {
        todayTripsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-carriage"></i>
                <p>No hay viajes hoy</p>
                <small>Los viajes aparecerán aquí</small>
            </div>
        `;
        return;
    }
    
    // Crear lista de viajes
    let html = '';
    todayTrips.forEach(trip => {
        const paymentIcon = trip.paymentMethod === 'cash' ? 
            '<i class="fas fa-money-bill-wave"></i>' : 
            '<i class="fas fa-credit-card"></i>';
        
        const paymentClass = trip.paymentMethod === 'cash' ? 'cash' : 'card';
        
        html += `
            <div class="today-trip-item">
                <div class="today-trip-info">
                    <div class="today-trip-time">${trip.time}</div>
                    <div class="today-trip-details">
                        <span class="today-trip-country ${paymentClass}">${trip.country}</span>
                        <span>•</span>
                        <span>${trip.passengers} pasajero${trip.passengers !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span class="today-trip-payment">${paymentIcon} ${trip.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}</span>
                        ${trip.tip > 0 ? `<span>•</span><span class="tip-indicator">+${trip.tip}€</span>` : ''}
                    </div>
                </div>
                <div class="today-trip-amount">${trip.total.toFixed(2)} €</div>
            </div>
        `;
    });
    
    todayTripsList.innerHTML = html;
    
    // Añadir efecto de entrada
    const items = todayTripsList.querySelectorAll('.today-trip-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
        item.classList.add('slide-in');
    });
}

// ========== PANTALLA RESUMEN ==========
function initSummaryScreen() {
    // Botones de periodo
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones activos
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar periodo
            AppState.currentPeriod = btn.id.replace('-btn', '');
            
            // Actualizar resumen
            updateSummary(AppState.currentPeriod);
        });
    });
}

function updateSummary(period = 'today') {
  console.log('📊 Actualizando resumen para:', period);
  
  // Actualizar título del periodo
  const periodTitles = {
    'today': 'Hoy',
    'yesterday': 'Ayer', 
    'week': 'Esta semana'
  };
  document.getElementById('summary-period-title').textContent = periodTitles[period] || 'Hoy';
  
  // Filtrar viajes por periodo
  const filteredTrips = filterTripsByPeriod(AppState.trips, period);
  
  // Calcular estadísticas detalladas
  const cashTrips = filteredTrips.filter(t => t.paymentMethod === 'cash');
  const cardTrips = filteredTrips.filter(t => t.paymentMethod === 'card');
  
  const cashTripsCount = cashTrips.length;
  const cashTripsAmount = cashTrips.reduce((sum, t) => sum + t.price, 0);
  const cashTipsAmount = cashTrips.reduce((sum, t) => sum + (t.tip || 0), 0);
  const cashTotalReceived = cashTripsAmount + cashTipsAmount;
  
  const cardTripsCount = cardTrips.length;
  const cardTripsAmount = cardTrips.reduce((sum, t) => sum + t.price, 0);
  const cardTipsAmount = cardTrips.reduce((sum, t) => sum + (t.tip || 0), 0);
  const cardTotalReceived = cardTripsAmount + cardTipsAmount;
  
  const totalTrips = cashTripsCount + cardTripsCount;
  const totalAmountCollected = cashTotalReceived + cardTotalReceived;
  const cashToDeliver = cashTotalReceived - cardTipsAmount;
  
  // Actualizar estadísticas rápidas
  updateElement('total-trips-count', totalTrips);
  updateElement('total-amount-collected', `${totalAmountCollected.toFixed(2)} €`);
  
  // Actualizar desglose de efectivo
  updateElement('cash-trips-breakdown', 
    `${cashTripsCount} viaje${cashTripsCount !== 1 ? 's' : ''} × 70€ = ${cashTripsAmount.toFixed(2)}€`);
  updateElement('cash-tips-breakdown', `+ ${cashTipsAmount.toFixed(2)}€`);
  updateElement('cash-total-received', `${cashTotalReceived.toFixed(2)}€`);
  
  // Actualizar desglose de tarjeta
  updateElement('card-trips-breakdown', 
    `${cardTripsCount} viaje${cardTripsCount !== 1 ? 's' : ''} × 70€ = ${cardTripsAmount.toFixed(2)}€`);
  updateElement('card-tips-breakdown', `+ ${cardTipsAmount.toFixed(2)}€`);
  updateElement('card-total-received', `${cardTotalReceived.toFixed(2)}€`);
  
  // Actualizar resumen de entrega
  updateElement('cash-received-amount', `${cashTotalReceived.toFixed(2)}€`);
  updateElement('card-tips-for-you', `- ${cardTipsAmount.toFixed(2)}€`);
  updateElement('cash-to-deliver-final', `${Math.max(cashToDeliver, 0).toFixed(2)}€`);
  
  // También mantener los elementos originales actualizados (para compatibilidad)
  updateElement('total-all-trips', totalTrips);
  updateElement('cash-trips-count', cashTripsCount);
  updateElement('cash-trips-amount', `${cashTripsAmount.toFixed(2)} €`);
  updateElement('card-trips-count', cardTripsCount);
  updateElement('card-trips-amount', `${cardTripsAmount.toFixed(2)} €`);
  updateElement('total-tips', `${(cashTipsAmount + cardTipsAmount).toFixed(2)} €`);
  
  console.log(`💰 Resumen actualizado: ${totalTrips} viajes, ${cashToDeliver.toFixed(2)}€ a entregar`);
}



// ========== PANTALLA ESTADÍSTICAS ==========
function initStatsScreen() {
    // Selector de periodo
    const statsPeriod = document.getElementById('stats-period');
    if (statsPeriod) {
        statsPeriod.addEventListener('change', (e) => {
            AppState.statsPeriod = e.target.value;
            updateStats(AppState.statsPeriod);
        });
    }
}

function updateStats(period = 'month') {
    console.log('📈 Actualizando estadísticas para:', period);
    
    // Filtrar viajes
    const filteredTrips = filterTripsByPeriod(AppState.trips, period);
    
    if (filteredTrips.length === 0) {
        showEmptyStats();
        return;
    }
    
    // Estadísticas básicas
    const totalTrips = filteredTrips.length;
    const totalPassengers = filteredTrips.reduce((sum, t) => sum + t.passengers, 0);
    const cashTrips = filteredTrips.filter(t => t.paymentMethod === 'cash').length;
    const cardTrips = filteredTrips.filter(t => t.paymentMethod === 'card').length;
    
    // Porcentajes para gráfico
    const cashPercentage = totalTrips > 0 ? Math.round((cashTrips / totalTrips) * 100) : 0;
    const cardPercentage = totalTrips > 0 ? Math.round((cardTrips / totalTrips) * 100) : 0;
    
    // Distribución por países
    const countryStats = calculateCountryStats(filteredTrips);
    
    // Actualizar UI
    updateElement('monthly-total-trips', totalTrips);
    updateElement('monthly-total-passengers', totalPassengers);
    updateElement('monthly-cash-trips', cashTrips);
    updateElement('monthly-card-trips', cardTrips);
    
    // Actualizar gráfico
    updatePaymentChart(cashPercentage, cardPercentage);
    
    // Actualizar países
    updateCountriesList(countryStats);
}

function calculateCountryStats(trips) {
    const stats = {};
    
    trips.forEach(trip => {
        const country = trip.country || 'Sin especificar';
        if (!stats[country]) {
            stats[country] = {
                trips: 0,
                passengers: 0,
                total: 0
            };
        }
        
        stats[country].trips++;
        stats[country].passengers += trip.passengers;
        stats[country].total += trip.total;
    });
    
    // Convertir a array y ordenar
    return Object.entries(stats)
        .map(([country, data]) => ({ country, ...data }))
        .sort((a, b) => b.trips - a.trips)
        .slice(0, 10); // Top 10 países
}

function updatePaymentChart(cashPercent, cardPercent) {
    const cashBar = document.getElementById('cash-bar');
    const cardBar = document.getElementById('card-bar');
    const cashText = document.getElementById('cash-percent');
    const cardText = document.getElementById('card-percent');
    
    if (cashBar && cardBar) {
        // Animar el crecimiento de las barras
        cashBar.style.width = `${cashPercent}%`;
        cardBar.style.width = `${cardPercent}%`;
        
        if (cashText) cashText.textContent = `${cashPercent}%`;
        if (cardText) cardText.textContent = `${cardPercent}%`;
    }
}

function updateCountriesList(countries) {
    const container = document.getElementById('countries-list');
    if (!container) return;
    
    if (countries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-flag"></i>
                <p>No hay datos</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    countries.forEach(country => {
        const percentage = (country.trips / AppState.trips.length * 100).toFixed(1);
        
        html += `
            <div class="country-item">
                <div class="country-name">${country.country}</div>
                <div class="country-stats">
                    <div class="country-trips">${country.trips} viajes (${percentage}%)</div>
                    <div class="country-passengers">${country.passengers} pasajeros</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function showEmptyStats() {
    updateElement('monthly-total-trips', '0');
    updateElement('monthly-total-passengers', '0');
    updateElement('monthly-cash-trips', '0');
    updateElement('monthly-card-trips', '0');
    
    updatePaymentChart(0, 0);
    
    const container = document.getElementById('countries-list');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-line"></i>
                <p>No hay datos para este periodo</p>
            </div>
        `;
    }
}

// ========== FUNCIONES UTILITARIAS ==========
function filterTripsByPeriod(trips, period) {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    return trips.filter(trip => {
        const fechaViaje = new Date(trip.timestamp);
        
        switch(period) {
            case 'today':
                return fechaViaje >= hoy;
            case 'yesterday':
                const ayer = new Date(hoy);
                ayer.setDate(ayer.getDate() - 1);
                return fechaViaje >= ayer && fechaViaje < hoy;
            case 'week':
                const semanaPasada = new Date(hoy);
                semanaPasada.setDate(semanaPasada.getDate() - 7);
                return fechaViaje >= semanaPasada;
            case 'month':
                const mesPasado = new Date(hoy);
                mesPasado.setMonth(mesPasado.getMonth() - 1);
                return fechaViaje >= mesPasado;
            case 'all':
                return true;
            default:
                return fechaViaje >= hoy;
        }
    });
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        // Efecto de contador si es un número
        if (typeof value === 'number' || /^\d+$/.test(value)) {
            animateCounter(element, parseInt(element.textContent) || 0, parseInt(value));
        } else {
            element.textContent = value;
        }
    }
}

function animateCounter(element, start, end) {
    if (start === end) return;
    
    const duration = 500;
    const steps = 20;
    const stepTime = duration / steps;
    const increment = (end - start) / steps;
    
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, stepTime);
}

function updateCurrentDate() {
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        };
        const formattedDate = now.toLocaleDateString('es-ES', options);
        dateDisplay.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
}

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const screenId = btn.dataset.screen;
            if (screenId) {
                showScreen(screenId);
            }
        });
        
        // Efecto táctil
        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', () => {
            btn.style.transform = 'scale(1)';
        });
    });
}

function initPeriodSelectors() {
    // Ya se inicializa en initSummaryScreen y initStatsScreen
}

function handleNewTrip() {
    console.log('🔄 Actualizando todas las pantallas por nuevo viaje');
    
    // Actualizar pantalla actual
    updateScreenData(AppState.currentScreen);
    
    // Actualizar otras pantallas si es necesario
    if (AppState.currentScreen !== 'new-trip') {
        updateTodayTrips();
    }
    if (AppState.currentScreen !== 'summary') {
        updateSummary(AppState.currentPeriod);
    }
    if (AppState.currentScreen !== 'stats') {
        updateStats(AppState.statsPeriod);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    // Configurar notificación
    notification.textContent = message;
    notification.className = 'notification show';
    notification.classList.add(type);
    
    // Mostrar
    notification.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
            notification.classList.remove(type);
        }, 400);
    }, 3000);
}

// ========== FUNCIONES DE MIGRACIÓN (si es necesario) ==========
function migrateFromOldVersion() {
    // Migrar datos de versiones anteriores si es necesario
    const oldData = localStorage.getItem('trips');
    if (oldData && !localStorage.getItem(CONFIG.STORAGE_KEY)) {
        try {
            const trips = JSON.parse(oldData);
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(trips));
            console.log('🔄 Datos migrados desde versión anterior');
        } catch (error) {
            console.error('Error migrando datos:', error);
        }
    }
}

// Ejecutar migración al iniciar
migrateFromOldVersion();

// ========== FUNCIONES DE DEBUG ==========
// Descomenta para debug
// window.debugApp = function() {
//     console.log('🔧 Estado de la App:', AppState);
//     console.log('📊 Viajes totales:', AppState.trips.length);
//     console.log('💾 Storage:', localStorage.getItem(CONFIG.STORAGE_KEY));
// };

// window.clearAllData = function() {
//     if (confirm('¿Estás seguro de borrar todos los datos?')) {
//         localStorage.removeItem(CONFIG.STORAGE_KEY);
//         AppState.trips = [];
//         location.reload();
//     }
// };
