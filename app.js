// ============================================
// E-CARRIAGE TOUR - APP MÓVIL PROFESIONAL
// ============================================

console.log('🚀 E-Carriage Tour App iniciada');

// ========== CONFIGURACIÓN INICIAL ==========
const CONFIG = {
    BASE_PRICE: 70.00,
    MAX_PASSENGERS: 5,
    MIN_PASSENGERS: 1,
    STORAGE_KEY: 'eCarriageTrips',
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
    tripsData: {
        today: [],
        yesterday: [],
        week: [],
        month: [],
        all: []
    }
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Aplicación cargada - Versión', CONFIG.APP_VERSION);
    
    // Cargar viajes desde localStorage
    loadTripsFromStorage();
    
    initApp();
    showScreen('new-trip');
    updateCurrentDate();
    
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
    initSummaryScreen();
    initStatsScreen();
    initMaintenanceScreen();
    
    // Evento para actualizar cuando se añade viaje
    document.addEventListener('tripAdded', handleNewTrip);
    
    console.log('✅ Aplicación inicializada correctamente');
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
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar pantalla seleccionada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = screenId;
        
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
        case 'maintenance':
            renderMaintenanceList();
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
        if (passengerInput) passengerInput.value = AppState.passengerCount;
        
        // Actualizar estado de botones
        decreaseBtn.disabled = AppState.passengerCount <= CONFIG.MIN_PASSENGERS;
        increaseBtn.disabled = AppState.passengerCount >= CONFIG.MAX_PASSENGERS;
        
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
        // Sistema de propinas para tarjeta con botones específicos
        tipContainer.innerHTML = `
            <div class="tip-buttons-grid">
                <button type="button" class="tip-btn" data-tip="0">0 €</button>
                <button type="button" class="tip-btn" data-tip="7">7 €</button>
                <button type="button" class="tip-btn" data-tip="10.5">10,5 €</button>
                <button type="button" class="tip-btn" data-tip="14">14 €</button>
                <button type="button" class="tip-btn" data-tip="custom">Custom</button>
            </div>
            <div class="custom-tip-container" id="custom-tip-input-container" style="display: none; margin-top: 12px;">
                <input type="number" id="custom-tip-input" placeholder="0.00" step="0.01" min="0" max="100">
                <span class="currency">€</span>
            </div>
        `;
        
        // Configurar botones de propina para tarjeta
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
                    const customContainer = document.getElementById('custom-tip-input-container');
                    if (customContainer) {
                        customContainer.style.display = 'flex';
                        const input = document.getElementById('custom-tip-input');
                        if (input) {
                            input.focus();
                            
                            // Configurar evento para el input
                            input.addEventListener('input', (e) => {
                                AppState.customTipValue = e.target.value;
                                AppState.selectedTip = parseFloat(e.target.value) || 0;
                                updateTripSummary();
                            });
                        }
                    }
                } else {
                    // Ocultar input personalizado
                    const customContainer = document.getElementById('custom-tip-input-container');
                    if (customContainer) customContainer.style.display = 'none';
                    
                    AppState.selectedTip = parseFloat(tipValue) || 0;
                    AppState.customTipValue = '';
                    updateTripSummary();
                }
                
                console.log('💰 Propina seleccionada (tarjeta):', AppState.selectedTip);
            });
        });
        
        // Activar propina 0 por defecto para tarjeta
        if (tipButtons.length > 0) {
            const zeroBtn = Array.from(tipButtons).find(btn => btn.dataset.tip === '0');
            if (zeroBtn) zeroBtn.click();
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
            
            tipInput.value = AppState.selectedTip || '0.00';
        }
    }
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
        
        // Actualizar Viajes de Hoy inmediatamente
        updateTodayTrips();
        
        // Disparar evento para otras pantallas
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
        const tripsData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{"today":[],"yesterday":[],"week":[],"month":[],"all":[]}');
        
        // Agregar a todas las colecciones
        tripsData.today.push(trip);
        tripsData.all.push(trip);
        tripsData.month.push(trip);
        
        // Guardar en localStorage
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(tripsData));
        
        // Actualizar estado global
        AppState.tripsData = tripsData;
        
        console.log('💾 Viaje guardado. Total:', tripsData.all.length);
        return true;
    } catch (error) {
        console.error('Error al guardar:', error);
        return false;
    }
}

function loadTripsFromStorage() {
    try {
        const tripsData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{"today":[],"yesterday":[],"week":[],"month":[],"all":[]}');
        AppState.tripsData = tripsData;
        console.log('📂 Viajes cargados:', tripsData.all.length);
        return tripsData;
    } catch (error) {
        console.error('Error al cargar viajes:', error);
        AppState.tripsData = { today: [], yesterday: [], week: [], month: [], all: [] };
        return { today: [], yesterday: [], week: [], month: [], all: [] };
    }
}

function resetForm() {
    console.log('🔄 Reseteando formulario...');
    
    // Resetear pasajeros
    AppState.passengerCount = 1;
    const passengerCountEl = document.getElementById('passenger-count');
    const passengerInput = document.getElementById('passenger-input');
    
    if (passengerCountEl) passengerCountEl.textContent = '1';
    if (passengerInput) passengerInput.value = '1';
    
    // Resetear país
    const countrySelect = document.getElementById('country');
    if (countrySelect) countrySelect.value = '';
    
    // Resetear propina
    AppState.selectedTip = 0;
    const tipInput = document.getElementById('tip-input');
    if (tipInput) tipInput.value = '0.00';
    
    // Resetear método de pago a efectivo
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector('.payment-method-card[data-method="cash"]').classList.add('active');
    AppState.paymentMethod = 'cash';
    
    updateTripSummary();
    
    console.log('✅ Formulario reseteado');
}

// ========== COMPONENTE: VIAJES DE HOY ==========
function updateTodayTrips() {
    const todayTripsList = document.getElementById('today-trips-list');
    const todayTripsCount = document.getElementById('today-trips-count');
    
    if (!todayTripsList || !todayTripsCount) {
        console.error('❌ No se encontraron elementos para Viajes de Hoy');
        return;
    }
    
    // Obtener viajes de hoy
    const todayTrips = AppState.tripsData.today || [];
    
    console.log('📅 Viajes de hoy encontrados:', todayTrips.length);
    
    // Actualizar contador
    todayTripsCount.textContent = todayTrips.length;
    
    // Si no hay viajes, mostrar estado vacío
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
    
    // Crear lista de viajes en una sola línea
    let html = '';
    todayTrips.forEach((trip, index) => {
        // Icono según método de pago
        const paymentIcon = trip.paymentMethod === 'cash' 
            ? '<i class="fas fa-money-bill-wave"></i>' 
            : '<i class="fas fa-credit-card"></i>';
        
        const paymentText = trip.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta';
        
        html += `
            <div class="trip-item-single-line" style="animation-delay: ${index * 0.05}s">
                <div class="trip-info-compact">
                    <div class="trip-time-compact">${trip.time || '--:--'}</div>
                    <div class="trip-details-compact">
                        <span class="trip-country-compact">${trip.country || 'Sin país'}</span>
                        <span class="trip-passengers-compact">${trip.passengers || 1} Pax</span>
                        <span class="trip-payment-compact">${paymentIcon} ${paymentText}</span>
                        ${trip.tip > 0 ? `<span class="trip-tip-compact">+${trip.tip.toFixed(2)}€</span>` : ''}
                    </div>
                </div>
                <div class="trip-amount-compact">${typeof trip.total === 'number' ? trip.total.toFixed(2) : '0.00'} €</div>
            </div>
        `;
    });
    
    todayTripsList.innerHTML = html;
}

// ========== NAVEGACIÓN ==========
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const screenId = btn.dataset.screen;
            if (screenId) {
                showScreen(screenId);
            }
        });
    });
    
    console.log('✅ Navegación inicializada');
}

// ========== FUNCIÓN handleNewTrip() ==========
function handleNewTrip() {
    console.log('🔄 Evento: Viaje añadido, actualizando todas las pantallas...');
    
    // Actualizar pantalla actual
    updateScreenData(AppState.currentScreen);
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
            
            // Actualizar periodo basado en el ID del botón
            let period;
            if (btn.id === 'today-btn') period = 'today';
            else if (btn.id === 'yesterday-btn') period = 'yesterday';
            else if (btn.id === 'week-btn') period = 'week';
            
            AppState.currentPeriod = period;
            
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
    const periodTitleElement = document.getElementById('summary-period-title');
    if (periodTitleElement) {
        periodTitleElement.textContent = periodTitles[period] || 'Hoy';
    }
    
    // Filtrar viajes por periodo
    let filteredTrips = [];
    if (period === 'today') {
        filteredTrips = AppState.tripsData.today || [];
    } else if (period === 'yesterday') {
        filteredTrips = AppState.tripsData.yesterday || [];
    } else if (period === 'week') {
        filteredTrips = AppState.tripsData.week || [];
    }
    
    // Calcular estadísticas
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
    
    // Actualizar CAJAS DE ESTADÍSTICAS
    updateElement('quick-total-trips', totalTrips);
    updateElement('quick-total-amount', `${totalAmountCollected.toFixed(2)} €`);
    updateElement('quick-cash-amount', `${cashTotalReceived.toFixed(2)} €`);
    updateElement('quick-card-amount', `${cardTotalReceived.toFixed(2)} €`);
    
    // Actualizar DESGLOSE
    updateElement('cash-trips-breakdown', 
        `${cashTripsCount} viaje${cashTripsCount !== 1 ? 's' : ''} × 70€ = ${cashTripsAmount.toFixed(2)}€`);
    updateElement('cash-tips-breakdown', `+ ${cashTipsAmount.toFixed(2)}€`);
    updateElement('cash-total-received', `${cashTotalReceived.toFixed(2)}€`);
    
    updateElement('card-trips-breakdown', 
        `${cardTripsCount} viaje${cardTripsCount !== 1 ? 's' : ''} × 70€ = ${cardTripsAmount.toFixed(2)}€`);
    updateElement('card-tips-breakdown', `+ ${cardTipsAmount.toFixed(2)}€`);
    updateElement('card-total-received', `${cardTotalReceived.toFixed(2)}€`);
    
    updateElement('cash-received-amount', `${cashTotalReceived.toFixed(2)}€`);
    updateElement('card-tips-for-you', `- ${cardTipsAmount.toFixed(2)}€`);
    updateElement('cash-to-deliver-final', `${Math.max(cashToDeliver, 0).toFixed(2)}€`);
    
    console.log(`💰 Resumen: ${totalTrips} viajes, ${cashToDeliver.toFixed(2)}€ a entregar`);
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
    
    // Obtener viajes según el periodo
    let filteredTrips = [];
    switch(period) {
        case 'today':
            filteredTrips = AppState.tripsData.today || [];
            break;
        case 'yesterday':
            filteredTrips = AppState.tripsData.yesterday || [];
            break;
        case 'week':
            filteredTrips = AppState.tripsData.week || [];
            break;
        case 'month':
            filteredTrips = AppState.tripsData.month || [];
            break;
        case 'all':
            filteredTrips = AppState.tripsData.all || [];
            break;
        default:
            filteredTrips = AppState.tripsData.month || [];
    }
    
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
        .slice(0, 5);
}

function updatePaymentChart(cashPercent, cardPercent) {
    const cashBar = document.getElementById('cash-bar');
    const cardBar = document.getElementById('card-bar');
    const cashText = document.getElementById('cash-percent');
    const cardText = document.getElementById('card-percent');
    
    if (cashBar && cardBar) {
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
    countries.forEach((country, index) => {
        const totalTrips = AppState.tripsData.all.length;
        const percentage = totalTrips > 0 ? ((country.trips / totalTrips) * 100).toFixed(1) : '0.0';
        
        html += `
            <div class="country-item">
                <div class="country-rank">${index + 1}</div>
                <div class="country-info">
                    <div class="country-name">${country.country}</div>
                    <div class="country-stats">
                        <span class="country-trips">${country.trips} viajes</span>
                        <span class="country-percent">${percentage}%</span>
                    </div>
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
                <i class="fas fa-flag"></i>
                <p>No hay datos</p>
            </div>
        `;
    }
}

// ========== PANTALLA SERVICIO TÉCNICO ==========
function initMaintenanceScreen() {
    // Hotspots del carruaje
    document.querySelectorAll('.hotspot').forEach(btn => {
        btn.addEventListener('click', () => {
            const part = btn.dataset.part;
            openMaintenanceForm(part);
        });
    });
}

let maintenanceIssues = JSON.parse(localStorage.getItem('maintenanceIssues')) || [];

function openMaintenanceForm(part) {
    const issue = prompt(
        `Parte: ${part}\nDescribe el problema:`
    );
    
    if (!issue) return;
    
    const newIssue = {
        id: Date.now(),
        part,
        issue,
        status: 'Pendiente',
        date: new Date().toISOString()
    };
    
    maintenanceIssues.push(newIssue);
    localStorage.setItem('maintenanceIssues', JSON.stringify(maintenanceIssues));
    renderMaintenanceList();
}

function renderMaintenanceList() {
    const container = document.getElementById('maintenance-list');
    
    if (maintenanceIssues.length === 0) {
        container.innerHTML = `<div class="empty-state">No hay incidencias registradas</div>`;
        return;
    }
    
    container.innerHTML = maintenanceIssues
        .map(i => `
            <div class="trip-item-single-line">
                <div class="trip-info-compact">
                    <div class="trip-time-compact">${new Date(i.date).toLocaleDateString('es-ES')}</div>
                    <div class="trip-details-compact">
                        <span class="trip-country-compact">${i.part}</span>
                        <span class="trip-passengers-compact">${i.status}</span>
                    </div>
                </div>
                <div class="trip-amount-compact">${i.issue.substring(0, 20)}${i.issue.length > 20 ? '...' : ''}</div>
            </div>
        `)
        .join('');
}

// ========== FUNCIONES UTILITARIAS ==========
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateCurrentDate() {
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateDisplay.textContent = now.toLocaleDateString('es-ES', options);
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
