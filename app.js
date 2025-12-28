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

let passengers = 1;
let paymentMethod = null;

function changePassengers(value) {
  passengers += value;
  if (passengers < 1) passengers = 1;
  if (passengers > 5) passengers = 5;
  document.getElementById('passenger-count').textContent = passengers;
}

function setPayment(method) {
  paymentMethod = method;
  alert('Pago seleccionado: ' + (method === 'cash' ? 'Efectivo' : 'Tarjeta'));
}
