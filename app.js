// ============================================
// E-CARRIAGE TOUR - APP MÓVIL PROFESIONAL
// ============================================

console.log('🚀 E-Carriage Tour App iniciada');

// ========== CONFIGURACIÓN ==========
const CONFIG = {
  BASE_PRICE: 70,
  MAX_PASSENGERS: 5,
  MIN_PASSENGERS: 1,
  STORAGE_KEY: 'eCarriageTrips',
  APP_VERSION: '2.0'
};

// ========== ESTADO GLOBAL ==========
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

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 App cargada - versión', CONFIG.APP_VERSION);

  loadTripsFromStorage();
  initApp();
  showScreen('new-trip');
  updateCurrentDate();

  setInterval(updateCurrentDate, 60000);
});

function initApp() {
  initPassengerSelector();
  initPaymentMethods();
  initTipSystem();
  initAddTripButton();
  initNavigation();
  initSummaryScreen();
  initStatsScreen();
  initMaintenanceScreen();

  document.addEventListener('tripAdded', handleNewTrip);
}

// ========== NAVEGACIÓN ==========
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const screenId = btn.dataset.screen;
      if (screenId) showScreen(screenId);
    });
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screenId);
  });

  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  const target = document.getElementById(screenId);
  if (!target) return;

  target.classList.add('active');
  AppState.currentScreen = screenId;

  // reset scroll (clave para coherencia con CSS)
  const main = document.querySelector('.app-main');
  if (main) main.scrollTop = 0;

  updateScreenData(screenId);
}

function updateScreenData(screenId) {
  if (screenId === 'new-trip') updateTodayTrips();
  if (screenId === 'summary') updateSummary(AppState.currentPeriod);
  if (screenId === 'stats') updateStats(AppState.statsPeriod);
  if (screenId === 'maintenance') renderMaintenanceList();
}

// ========== PASAJEROS ==========
function initPassengerSelector() {
  const countEl = document.getElementById('passenger-count');
  const input = document.getElementById('passenger-input');
  const dec = document.getElementById('decrease-passenger');
  const inc = document.getElementById('increase-passenger');

  if (!countEl || !dec || !inc) return;

  const render = () => {
    countEl.textContent = AppState.passengerCount;
    if (input) input.value = AppState.passengerCount;

    dec.disabled = AppState.passengerCount <= CONFIG.MIN_PASSENGERS;
    inc.disabled = AppState.passengerCount >= CONFIG.MAX_PASSENGERS;

    updateTripSummary();
  };

  dec.onclick = () => {
    if (AppState.passengerCount > CONFIG.MIN_PASSENGERS) {
      AppState.passengerCount--;
      render();
    }
  };

  inc.onclick = () => {
    if (AppState.passengerCount < CONFIG.MAX_PASSENGERS) {
      AppState.passengerCount++;
      render();
    }
  };

  render();
}

// ========== MÉTODOS DE PAGO ==========
function initPaymentMethods() {
  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      AppState.paymentMethod = card.dataset.method;
      AppState.selectedTip = 0;

      updateTipSystem();
      updateTripSummary();
    });
  });
}

// ========== PROPINAS ==========
function initTipSystem() {
  updateTipSystem();
}

function updateTipSystem() {
  const container = document.getElementById('tip-container');
  if (!container) return;

  container.innerHTML = '';
  AppState.selectedTip = 0;

  if (AppState.paymentMethod === 'card') {
    container.innerHTML = `
      <div class="tip-buttons-grid">
        <button class="tip-btn" data-tip="0">0 €</button>
        <button class="tip-btn" data-tip="7">7 €</button>
        <button class="tip-btn" data-tip="10.5">10,5 €</button>
        <button class="tip-btn" data-tip="14">14 €</button>
        <button class="tip-btn" data-tip="custom">Custom</button>
      </div>
      <div id="custom-tip-input-container" style="display:none;margin-top:12px">
        <input type="number" id="custom-tip-input" min="0" step="0.01">
        <span>€</span>
      </div>
    `;

    const buttons = container.querySelectorAll('.tip-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.tip === 'custom') {
          document.getElementById('custom-tip-input-container').style.display = 'flex';
          document.getElementById('custom-tip-input').oninput = e => {
            AppState.selectedTip = parseFloat(e.target.value) || 0;
            updateTripSummary();
          };
        } else {
          document.getElementById('custom-tip-input-container').style.display = 'none';
          AppState.selectedTip = parseFloat(btn.dataset.tip);
          updateTripSummary();
        }
      });
    });

    buttons[0].click();
  } else {
    container.innerHTML = `
      <input id="tip-input" type="number" min="0" step="0.01" value="0">
      <span>€</span>
    `;
    document.getElementById('tip-input').oninput = e => {
      AppState.selectedTip = parseFloat(e.target.value) || 0;
      updateTripSummary();
    };
  }
}

// ========== RESUMEN VIAJE ==========
function updateTripSummary() {
  const tip = AppState.selectedTip || 0;
  const total = CONFIG.BASE_PRICE + tip;

  updateElement('tip-amount-display', `${tip.toFixed(2)} €`);
  updateElement('total-amount-display', `${total.toFixed(2)} €`);
}

// ========== NUEVO VIAJE ==========
function initAddTripButton() {
  const btn = document.getElementById('add-trip-btn');
  if (btn) btn.addEventListener('click', addNewTrip);
}

function addNewTrip() {
  const country = document.getElementById('country')?.value;
  if (!country) return showNotification('Selecciona un país', 'warning');

  const trip = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-ES'),
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    country,
    passengers: AppState.passengerCount,
    price: CONFIG.BASE_PRICE,
    paymentMethod: AppState.paymentMethod,
    tip: AppState.selectedTip,
    total: CONFIG.BASE_PRICE + AppState.selectedTip
  };

  if (saveTrip(trip)) {
    resetForm();
    updateTodayTrips();
    document.dispatchEvent(new CustomEvent('tripAdded', { detail: trip }));
    showNotification(`Viaje añadido: ${trip.total.toFixed(2)} €`, 'success');
  }
}

// ========== STORAGE ==========
function saveTrip(trip) {
  try {
    const data = loadTripsFromStorage();
    data.today.push(trip);
    data.month.push(trip);
    data.all.push(trip);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    AppState.tripsData = data;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function loadTripsFromStorage() {
  const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || {
    today: [], yesterday: [], week: [], month: [], all: []
  };
  AppState.tripsData = data;
  return data;
}

function resetForm() {
  AppState.passengerCount = 1;
  AppState.selectedTip = 0;
  AppState.paymentMethod = 'cash';

  document.getElementById('country').value = '';
  document.getElementById('passenger-count').textContent = '1';

  document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
  document.querySelector('.payment-method-card[data-method="cash"]').classList.add('active');

  updateTipSystem();
  updateTripSummary();
}

// ========== VIAJES DE HOY ==========
function updateTodayTrips() {
  const list = document.getElementById('today-trips-list');
  const count = document.getElementById('today-trips-count');
  if (!list || !count) return;

  const trips = AppState.tripsData.today || [];
  count.textContent = trips.length;

  if (!trips.length) {
    list.innerHTML = `<div class="empty-state">No hay viajes hoy</div>`;
    return;
  }

  list.innerHTML = trips.map(t => `
    <div class="trip-item-single-line">
      <div>${t.time} · ${t.country} · ${t.passengers} pax</div>
      <strong>${t.total.toFixed(2)} €</strong>
    </div>
  `).join('');
}

// ========== RESUMEN / STATS / MANTENIMIENTO ==========
function handleNewTrip() {
  updateScreenData(AppState.currentScreen);
}

function initSummaryScreen() {}
function initStatsScreen() {}
function updateSummary() {}
function updateStats() {}
function initMaintenanceScreen() {}
function renderMaintenanceList() {}

// ========== UTIL ==========
function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateCurrentDate() {
  const el = document.getElementById('current-date-display');
  if (el) {
    el.textContent = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}

function showNotification(message, type = 'info') {
  const n = document.getElementById('notification');
  if (!n) return;

  n.textContent = message;
  n.className = `notification show ${type}`;
  setTimeout(() => n.classList.remove('show'), 3000);
}
