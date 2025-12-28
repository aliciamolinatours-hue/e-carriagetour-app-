function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// Pantalla inicial
document.addEventListener('DOMContentLoaded', () => {
  showScreen('new-trip');
});

// Variables globales
let passengerCount = 1;
const minPassengers = 1;
const maxPassengers = 5;

// Elementos del DOM
const passengerCountElement = document.getElementById('passenger-count');
const decreaseButton = document.getElementById('decrease-passenger');
const increaseButton = document.getElementById('increase-passenger');
const passengerInput = document.getElementById('passenger-input');

// Función para actualizar el contador y la UI
function updatePassengerCount() {
    // Actualizar el texto visible
    passengerCountElement.textContent = passengerCount;
    
    // Actualizar el input oculto (para formularios)
    passengerInput.value = passengerCount;
    
    // Actualizar estado de los botones
    decreaseButton.disabled = passengerCount <= minPassengers;
    increaseButton.disabled = passengerCount >= maxPassengers;
    
    // Añadir/quitar clase para límite alcanzado
    if (passengerCount === maxPassengers) {
        passengerCountElement.classList.add('limit-reached');
    } else {
        passengerCountElement.classList.remove('limit-reached');
    }
}

// Función para cambiar el número de pasajeros
function changePassengers(change) {
    const newCount = passengerCount + change;
    
    // Verificar que esté dentro de los límites
    if (newCount >= minPassengers && newCount <= maxPassengers) {
        passengerCount = newCount;
        updatePassengerCount();
        
        // Opcional: emitir evento personalizado
        const event = new CustomEvent('passengerCountChanged', {
            detail: { count: passengerCount }
        });
        document.dispatchEvent(event);
    }
}

// Función para establecer un valor específico
function setPassengerCount(count) {
    if (count >= minPassengers && count <= maxPassengers) {
        passengerCount = count;
        updatePassengerCount();
    }
}

// Event Listeners
decreaseButton.addEventListener('click', () => changePassengers(-1));
increaseButton.addEventListener('click', () => changePassengers(1));

// Event Listeners adicionales para mejor UX
decreaseButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        changePassengers(-1);
    }
});

increaseButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        changePassengers(1);
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    updatePassengerCount();
    
    // Ejemplo de cómo usar desde otras partes del código:
    // Para obtener el valor actual:
    // console.log(`Pasajeros: ${passengerCount}`);
    
    // Para establecer un valor específico:
    // setPassengerCount(3);
    
    // Para escuchar cambios:
    // document.addEventListener('passengerCountChanged', (e) => {
    //     console.log(`Nuevo número de pasajeros: ${e.detail.count}`);
    // });
});
}

function setPayment(method) {
  paymentMethod = method;
  alert('Pago seleccionado: ' + (method === 'cash' ? 'Efectivo' : 'Tarjeta'));
}
