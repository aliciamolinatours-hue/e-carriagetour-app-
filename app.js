// Lista de países para autocompletar - 195 países de la ONU ordenados alfabéticamente en francés
const countries = [
    "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", 
    "Antigua-et-Barbuda", "Arabie saoudite", "Argentine", "Arménie", "Australie", "Autriche", 
    "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Bélarus", "Belgique", 
    "Belize", "Bénin", "Bhoutan", "Birmanie (Myanmar)", "Bolivie", "Bosnie-Herzégovine", 
    "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge", 
    "Cameroun", "Canada", "Cap-Vert", "Centrafrique", "Chili", "Chine", "Chypre", 
    "Colombie", "Comores", "Congo", "Congo (RDC)", "Corée du Nord", "Corée du Sud", 
    "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", 
    "Dominique", "Égypte", "Émirats arabes unis", "Équateur", "Érythrée", "Espagne", 
    "Estonie", "Eswatini", "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", 
    "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", 
    "Guinée équatoriale", "Guinée-Bissau", "Guyana", "Haïti", "Honduras", "Hongrie", 
    "Îles Marshall", "Îles Salomon", "Inde", "Indonésie", "Irak", "Iran", "Irlande", 
    "Islande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", 
    "Kenya", "Kirghizistan", "Kiribati", "Koweït", "Laos", "Lesotho", "Lettonie", 
    "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg", 
    "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", 
    "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", 
    "Monaco", "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru", "Népal", 
    "Nicaragua", "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande", "Oman", 
    "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Palestine", "Panama", 
    "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", 
    "Pologne", "Portugal", "Qatar", "Roumanie", "Royaume-Uni", "Russie", "Rwanda", 
    "Saint-Christophe-et-Niévès", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", 
    "Sainte-Lucie", "Salvador", "Samoa", "São Tomé-et-Príncipe", "Sénégal", 
    "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", 
    "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", 
    "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "République tchèque", "Thaïlande", 
    "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", 
    "Turquie", "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", 
    "Viêt Nam", "Yémen", "Zambie", "Zimbabwe"
];

// Datos iniciales
let trips = JSON.parse(localStorage.getItem('calècheTours')) || [];
let selectedPax = null;
let selectedPayment = null;
let selectedTip = 0;
let currentPaymentType = null;

// Prix fixe par tour (calèche électrique exclusive)
const PRICE_PER_TOUR = 150;

// Variable pour éviter enregistrements multiples
let isSaving = false;

// Initialiser l'application
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    loadTrips();
    updateStats();
    setupEventListeners();
    setupCountryAutocomplete();
    setupTabs();
    updateMonthStats();
    
    // Configurer bouton d'exportation
    document.getElementById('export-month').addEventListener('click', exportMonthData);
});

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('fr-FR', options);
}

function setupEventListeners() {
    // Boutons passagers
    document.querySelectorAll('.pax-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.pax-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedPax = parseInt(this.getAttribute('data-pax'));
        });
    });
    
    // Boutons paiement
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedPayment = this.getAttribute('data-payment');
            currentPaymentType = selectedPayment;
            
            // Afficher section pourboires
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
    
    // Boutons pourboire
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
    
    // Boutons pour appliquer pourboire personnalisé
    document.getElementById('set-tip-cash').addEventListener('click', function() {
        const customTipInput = document.getElementById('custom-tip-input-cash');
        const tipValue = parseFloat(customTipInput.value);
        
        if (!isNaN(tipValue) && tipValue >= 0) {
            selectedTip = tipValue;
            document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('selected'));
            
            const confirmation = document.getElementById('confirmation-message');
            confirmation.innerHTML = `<i class="fas fa-check"></i><span>Pourboire: ${tipValue.toFixed(2)}€ appliqué</span>`;
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
            confirmation.innerHTML = `<i class="fas fa-check"></i><span>Pourboire: ${tipValue.toFixed(2)}€ appliqué</span>`;
            confirmation.style.display = 'flex';
            
            setTimeout(() => {
                confirmation.style.display = 'none';
            }, 1500);
        }
    });
    
    // Enregistrer tour
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
            
            // Supprimer classe active de tous les onglets et contenus
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer onglet cliqué
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Si on active l'onglet résumé, mettre à jour les données
            if (tabId === 'summary') {
                updateSummary();
            }
            
            // Faire défiler au début de la page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function saveTrip() {
    // Prévenir clics multiples
    if (isSaving) {
        return;
    }
    
    const country = document.getElementById('country').value.trim();
    
    if (!selectedPax) {
        alert('Sélectionnez le nombre de passagers');
        return;
    }
    
    if (!country) {
        alert('Entrez le pays d\'origine');
        return;
    }
    
    if (!selectedPayment) {
        alert('Sélectionnez la méthode de paiement');
        return;
    }
    
    isSaving = true;
    
    // Désactiver bouton temporairement
    const saveButton = document.getElementById('save-trip');
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Enregistrement...</span>';
    
    const now = new Date();
    const trip = {
        id: Date.now(),
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        pax: selectedPax,
        country: country,
        payment: selectedPayment,
        tip: selectedTip,
        date: now.toISOString().split('T')[0]
    };
    
    // Ajouter tour et enregistrer
    trips.push(trip);
    localStorage.setItem('calècheTours', JSON.stringify(trips));
    
    // Mettre à jour l'interface immédiatement
    loadTrips();
    updateStats();
    
    // Afficher message de confirmation
    const confirmation = document.getElementById('confirmation-message');
    confirmation.innerHTML = `<i class="fas fa-check"></i><span>Tour enregistré</span>`;
    confirmation.style.display = 'flex';
    
    // Réinitialiser formulaire
    resetForm();
    
    // Mettre à jour le résumé si l'onglet est actif
    if (document.getElementById('summary-tab').classList.contains('active')) {
        updateSummary();
    }
    
    // Restaurer bouton après 1 seconde
    setTimeout(() => {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-check-circle"></i><span>Enregistrer le Tour</span>';
        confirmation.style.display = 'none';
        isSaving = false;
        
        // Faire défiler à la liste des tours
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
    
    document.getElementById('trip-count').textContent = `${todayTrips.length} tours aujourd'hui`;
    
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
    
    // Tours par type de paiement
    const cashTrips = todayTrips.filter(trip => trip.payment === 'cash');
    const cardTrips = todayTrips.filter(trip => trip.payment === 'card');
    
    // Totaux basiques
    document.getElementById('total-trips-summary').textContent = todayTrips.length;
    document.getElementById('total-pax-summary').textContent = todayTrips.reduce((sum, trip) => sum + trip.pax, 0);
    document.getElementById('total-tips-summary').textContent = todayTrips.reduce((sum, trip) => sum + trip.tip, 0).toFixed(2) + '€';
    
    // Revenus en espèces
    const cashTripsCount = cashTrips.length;
    const totalCash = cashTripsCount * PRICE_PER_TOUR;
    
    document.getElementById('cash-trips').textContent = cashTripsCount;
    document.getElementById('total-cash').textContent = totalCash.toFixed(2) + '€';
    document.getElementById('cash-detail').textContent = `${cashTripsCount} tours × ${PRICE_PER_TOUR}€ = ${totalCash.toFixed(2)}€`;
    
    // Revenus par carte
    const cardTripsCount = cardTrips.length;
    const totalCard = cardTripsCount * PRICE_PER_TOUR;
    const cardTipsTotal = cardTrips.reduce((sum, trip) => sum + trip.tip, 0);
    
    document.getElementById('card-trips').textContent = cardTripsCount;
    document.getElementById('total-card').textContent = totalCard.toFixed(2) + '€';
    document.getElementById('card-detail').textContent = `${cardTripsCount} tours × ${PRICE_PER_TOUR}€ = ${totalCard.toFixed(2)}€`;
    document.getElementById('card-tips').textContent = cardTipsTotal.toFixed(2) + '€';
    
    // Espèces à remettre
    const cashToDeliver = totalCash - cardTipsTotal;
    
    document.getElementById('cash-to-deliver').textContent = cashToDeliver.toFixed(2) + '€';
    document.getElementById('delivery-detail').textContent = `${totalCash.toFixed(2)}€ - ${cardTipsTotal.toFixed(2)}€ = ${cashToDeliver.toFixed(2)}€`;
    
    // Mettre à jour statistiques du mois
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
    
    const monthEarnings = monthTrips.length * PRICE_PER_TOUR;
    
    document.getElementById('month-trips').textContent = monthTrips.length;
    document.getElementById('month-earnings').textContent = monthEarnings.toFixed(2) + '€';
}

function exportMonthData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrer tours du mois actuel
    const monthTrips = trips.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate.getMonth() === currentMonth && 
               tripDate.getFullYear() === currentYear;
    });
    
    if (monthTrips.length === 0) {
        alert('Aucune donnée à exporter ce mois-ci.');
        return;
    }
    
    // Créer objet avec les données du mois
    const exportData = {
        mois: now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
        totalTours: monthTrips.length,
        totalPassagers: monthTrips.reduce((sum, trip) => sum + trip.pax, 0),
        totalToursEspeces: monthTrips.filter(t => t.payment === 'cash').length,
        totalToursCarte: monthTrips.filter(t => t.payment === 'card').length,
        totalRevenus: monthTrips.length * PRICE_PER_TOUR,
        totalPourboires: monthTrips.reduce((sum, trip) => sum + trip.tip, 0),
        tours: monthTrips
    };
    
    // Convertir en JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Créer fichier téléchargeable
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tours_caleche_${now.getFullYear()}_${now.getMonth() + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Afficher message de confirmation
    const exportMessage = document.getElementById('export-message');
    exportMessage.style.display = 'flex';
    
    setTimeout(() => {
        exportMessage.style.display = 'none';
    }, 3000);
}
