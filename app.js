// Lista de países para autocompletar - 195 países de la ONU ordenados alfabéticamente
const countries = [
    "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda",
    "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica",
    "Belice", "Benín", "Bielorrusia", "Birmania (Myanmar)", "Bolivia",
    "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria",
    "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún",
    "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Colombia",
    "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil",
    "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador",
    "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia",
    "Eslovenia", "España", "Estados Unidos", "Estonia", "Esuatini", "Etiopía",
    "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia",
    "Ghana", "Granada", "Grecia", "Guatemala", "Guinea", "Guinea Ecuatorial",
    "Guinea-Bisáu", "Guyana", "Haití", "Honduras", "Hungría", "India",
    "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall",
    "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania",
    "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos",
    "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein",
    "Lituania", "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia",
    "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania",
    "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro",
    "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria",
    "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos",
    "Palestina", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia",
    "Portugal", "Reino Unido", "República Centroafricana", "República Checa",
    "República del Congo", "República Democrática del Congo", "República Dominicana",
    "Ruanda", "Rumanía", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino",
    "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe",
    "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria",
    "Somalia", "Sri Lanka", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia",
    "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental",
    "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía",
    "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu",
    "Vaticano (Santa Sede)", "Venezuela", "Vietnam", "Yemen", "Yibuti",
    "Zambia", "Zimbabue"
];

// Datos iniciales
let trips = JSON.parse(localStorage.getItem('taxiTrips')) || [];
let selectedPax = null;
let selectedPayment = null;
let selectedTip = 0;
let currentPaymentType = null;

// Precio fijo por viaje (puedes ajustarlo según tu tarifa)
const PRICE_PER_TRIP = 70;

// Variable para evitar guardados múltiples
let isSaving = false;

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    loadTrips();
    updateStats();
    setupEventListeners();
    setupCountryAutocomplete();
    setupTabs();
    updateMonthStats();
    
    // Configurar botón de exportación
    document.getElementById('export-month').addEventListener('click', exportMonthData);
});

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('es-ES', options);
}

function setupEventListeners() {
    // Botones de pasajeros
    document.querySelectorAll('.pax-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.pax-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedPax = parseInt(this.getAttribute('data-pax'));
        });
    });
    
    // Botones de pago
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedPayment = this.getAttribute('data-payment');
            currentPaymentType = selectedPayment;
            
            // Mostrar sección de propinas
            document.querySelectorAll('.tip-section').forEach(section => {
                section.style.display = 'none';
            });
            
            if (selectedPayment === 'cash') {
                document.getElementById('tip-section-cash').style.display = 'block';
                selectedTip = 0;
            } else if (selectedPayment === 'card') {
                document.getElementById('tip-section-card').style.display = 'block';
                selectedTip = 0;
            }
            
            document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('selected'));
            document.getElementById('custom-tip-cash').style.display = 'none';
            document.getElementById('custom-tip-card').style.display = 'none';
        });
    });
    
    // Botones de propina
    document.querySelectorAll('.tip-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tipValue = this.getAttribute('data-tip');
            
            if (tipValue === 'custom') {
                if (currentPaymentType === 'cash') {
                    document.getElementById('custom-tip-cash').style.display = 'flex';
                } else if (currentPaymentType === 'card') {
                    document.getElementById('custom-tip-card').style.display = 'flex';
                }
            } else {
                document.getElementById('custom-tip-cash').style.display = 'none';
                document.getElementById('custom-tip-card').style.display = 'none';
                document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedTip = parseFloat(tipValue);
            }
        });
    });
    
    // Botones para aplicar propina personalizada
    document.getElementById('set-tip-cash').addEventListener('click', function() {
        const customTipInput = document.getElementById('custom-tip-input-cash');
        const tipValue = parseFloat(customTipInput.value);
        
        if (!isNaN(tipValue) && tipValue >= 0) {
            selectedTip = tipValue;
            document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('selected'));
            
            const confirmation = document.getElementById('confirmation-message');
            confirmation.innerHTML = `<i class="fas fa-check"></i><span>Propina: ${tipValue.toFixed(2)}€ aplicada</span>`;
            confirmation.style.display = 'flex';
            
            setTimeout(() => {
                confirmation.style.display = 'none';
            }, 1500);
        }
    });
    
    document.getElementById('set-tip-card').addEventListener('click', function() {
        const customTipInput = document.getElementById('custom-tip-input-card');
        const tipValue = parseFloat(customTipInput.value);
        
        if (!isNaN(tipValue) && tipValue >= 0) {
            selectedTip = tipValue;
            document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('selected'));
            
            const confirmation = document.getElementById('confirmation-message');
            confirmation.innerHTML = `<i class="fas fa-check"></i><span>Propina: ${tipValue.toFixed(2)}€ aplicada</span>`;
            confirmation.style.display = 'flex';
            
            setTimeout(() => {
                confirmation.style.display = 'none';
            }, 1500);
        }
    });
    
    // Guardar viaje
    document.getElementById('save-trip').addEventListener('click', saveTrip);
}

function setupCountryAutocomplete() {
    const countryInput = document.getElementById('country');
    const suggestionsContainer = document.getElementById('country-suggestions');
    
    countryInput.addEventListener('input', function() {
        const input = this.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        
        if (input.length > 0) {
            const filteredCountries = countries.filter(country => 
                country.toLowerCase().startsWith(input)
            );
            
            if (filteredCountries.length > 0) {
                filteredCountries.forEach(country => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = country;
                    div.addEventListener('click', function() {
                        countryInput.value = country;
                        suggestionsContainer.style.display = 'none';
                    });
                    suggestionsContainer.appendChild(div);
                });
                
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!countryInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

function setupTabs() {
    const tabs = document.querySelectorAll('.bottom-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remover clase active de todas las pestañas y contenidos
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar pestaña clickeada
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Si se activa la pestaña de resumen, actualizar los datos
            if (tabId === 'summary') {
                updateSummary();
            }
            
            // Hacer scroll al inicio de la página
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function saveTrip() {
    // Prevenir múltiples clics
    if (isSaving) {
        return;
    }
    
    const country = document.getElementById('country').value.trim();
    
    if (!selectedPax) {
        alert('Selecciona el número de pasajeros');
        return;
    }
    
    if (!country) {
        alert('Introduce el país');
        return;
    }
    
    if (!selectedPayment) {
        alert('Selecciona el método de pago');
        return;
    }
    
    isSaving = true;
    
    // Deshabilitar botón temporalmente
    const saveButton = document.getElementById('save-trip');
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Guardando...</span>';
    
    const now = new Date();
    const trip = {
        id: Date.now(),
        time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        pax: selectedPax,
        country: country,
        payment: selectedPayment,
        tip: selectedTip,
        date: now.toISOString().split('T')[0]
    };
    
    // Añadir viaje y guardar
    trips.push(trip);
    localStorage.setItem('taxiTrips', JSON.stringify(trips));
    
    // Actualizar la interfaz inmediatamente
    loadTrips();
    updateStats();
    
    // Mostrar mensaje de confirmación
    const confirmation = document.getElementById('confirmation-message');
    confirmation.innerHTML = `<i class="fas fa-check"></i><span>Viaje guardado</span>`;
    confirmation.style.display = 'flex';
    
    // Resetear formulario
    resetForm();
    
    // Actualizar el resumen si la pestaña está activa
    if (document.getElementById('summary-tab').classList.contains('active')) {
        updateSummary();
    }
    
    // Restaurar botón después de 1 segundo
    setTimeout(() => {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-check-circle"></i><span>Guardar Viaje</span>';
        confirmation.style.display = 'none';
        isSaving = false;
        
        // Hacer scroll a la lista de viajes
        const tripsSection = document.querySelector('.trips-section');
        if (tripsSection) {
            tripsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 1000);
}

function resetForm() {
    document.querySelectorAll('.pax-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('country').value = '';
    document.querySelectorAll('.tip-section').forEach(s => s.style.display = 'none');
    document.getElementById('custom-tip-cash').style.display = 'none';
    document.getElementById('custom-tip-card').style.display = 'none';
    document.getElementById('custom-tip-input-cash').value = '';
    document.getElementById('custom-tip-input-card').value = '';
    
    selectedPax = null;
    selectedPayment = null;
    selectedTip = 0;
    currentPaymentType = null;
}

function loadTrips() {
    const tripsContainer = document.getElementById('trips-container');
    const emptyListMessage = document.getElementById('empty-list-message');
    
    const today = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(trip => trip.date === today);
    
    document.getElementById('trip-count').textContent = `${todayTrips.length} viajes hoy`;
    
    if (todayTrips.length === 0) {
        tripsContainer.innerHTML = '';
        tripsContainer.appendChild(emptyListMessage);
        emptyListMessage.style.display = 'flex';
        return;
    }
    
    emptyListMessage.style.display = 'none';
    
    const tripsHTML = todayTrips
        .sort((a, b) => b.id - a.id)
        .map(trip => `
        <div class="trip-item">
            <div class="trip-time">${trip.time}</div>
            <div class="trip-pax">${trip.pax}</div>
            <div class="trip-country">${trip.country}</div>
            <div class="trip-payment ${trip.payment}">
                <i class="fas ${trip.payment === 'cash' ? 'fa-money-bill' : 'fa-credit-card'}"></i>
            </div>
            <div class="trip-tip">${trip.tip > 0 ? trip.tip.toFixed(2) + '€' : '-'}</div>
        </div>
    `).join('');
    
    tripsContainer.innerHTML = tripsHTML;
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(trip => trip.date === today);
    
    const totalTrips = todayTrips.length;
    const totalPax = todayTrips.reduce((sum, trip) => sum + trip.pax, 0);
    const totalTips = todayTrips.reduce((sum, trip) => sum + trip.tip, 0);
    
    document.getElementById('total-trips').textContent = totalTrips;
    document.getElementById('total-pax').textContent = totalPax;
    document.getElementById('total-tips').textContent = totalTips.toFixed(2) + '€';
}

function updateSummary() {
    const today = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(trip => trip.date === today);
    
    // Viajes por tipo de pago
    const cashTrips = todayTrips.filter(trip => trip.payment === 'cash');
    const cardTrips = todayTrips.filter(trip => trip.payment === 'card');
    
    // Totales básicos
    document.getElementById('total-trips-summary').textContent = todayTrips.length;
    document.getElementById('total-pax-summary').textContent = todayTrips.reduce((sum, trip) => sum + trip.pax, 0);
    document.getElementById('total-tips-summary').textContent = todayTrips.reduce((sum, trip) => sum + trip.tip, 0).toFixed(2) + '€';
    
    // Ingresos en efectivo
    const cashTripsCount = cashTrips.length;
    const totalCash = cashTripsCount * PRICE_PER_TRIP;
    
    document.getElementById('cash-trips').textContent = cashTripsCount;
    document.getElementById('total-cash').textContent = totalCash.toFixed(2) + '€';
    document.getElementById('cash-detail').textContent = `${cashTripsCount} viajes × ${PRICE_PER_TRIP}€ = ${totalCash.toFixed(2)}€`;
    
    // Ingresos en tarjeta
    const cardTripsCount = cardTrips.length;
    const totalCard = cardTripsCount * PRICE_PER_TRIP;
    const cardTipsTotal = cardTrips.reduce((sum, trip) => sum + trip.tip, 0);
    
    document.getElementById('card-trips').textContent = cardTripsCount;
    document.getElementById('total-card').textContent = totalCard.toFixed(2) + '€';
    document.getElementById('card-detail').textContent = `${cardTripsCount} viajes × ${PRICE_PER_TRIP}€ = ${totalCard.toFixed(2)}€`;
    document.getElementById('card-tips').textContent = cardTipsTotal.toFixed(2) + '€';
    
    // Efectivo a entregar
    const cashToDeliver = totalCash - cardTipsTotal;
    
    document.getElementById('cash-to-deliver').textContent = cashToDeliver.toFixed(2) + '€';
    document.getElementById('delivery-detail').textContent = `${totalCash.toFixed(2)}€ - ${cardTipsTotal.toFixed(2)}€ = ${cashToDeliver.toFixed(2)}€`;
    
    // Actualizar estadísticas del mes
    updateMonthStats();
}

function updateMonthStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthTrips = trips.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate.getMonth() === currentMonth && 
               tripDate.getFullYear() === currentYear;
    });
    
    const monthEarnings = monthTrips.length * PRICE_PER_TRIP;
    
    document.getElementById('month-trips').textContent = monthTrips.length;
    document.getElementById('month-earnings').textContent = monthEarnings.toFixed(2) + '€';
}

function exportMonthData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar viajes del mes actual
    const monthTrips = trips.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate.getMonth() === currentMonth && 
               tripDate.getFullYear() === currentYear;
    });
    
    if (monthTrips.length === 0) {
        alert('No hay datos para exportar este mes.');
        return;
    }
    
    // Crear objeto con los datos del mes
    const exportData = {
        month: now.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
        totalTrips: monthTrips.length,
        totalPassengers: monthTrips.reduce((sum, trip) => sum + trip.pax, 0),
        totalCashTrips: monthTrips.filter(t => t.payment === 'cash').length,
        totalCardTrips: monthTrips.filter(t => t.payment === 'card').length,
        totalEarnings: monthTrips.length * PRICE_PER_TRIP,
        totalTips: monthTrips.reduce((sum, trip) => sum + trip.tip, 0),
        trips: monthTrips
    };
    
    // Convertir a JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Crear archivo descargable
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viajes_${now.getFullYear()}_${now.getMonth() + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mostrar mensaje de confirmación
    const exportMessage = document.getElementById('export-message');
    exportMessage.style.display = 'flex';
    
    setTimeout(() => {
        exportMessage.style.display = 'none';
    }, 3000);
}
