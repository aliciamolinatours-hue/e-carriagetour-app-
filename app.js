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
