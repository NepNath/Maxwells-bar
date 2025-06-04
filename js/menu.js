document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.getElementById('menu-button');
  const closeMenuButton = document.getElementById('close-menu');
  const menuOverlay = document.getElementById('menu-overlay');

  menuButton.addEventListener('click', function() {
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêche le défilement
  });

  closeMenuButton.addEventListener('click', function() {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Réactive le défilement
  });

  // Fermer le menu en cliquant en dehors
  document.addEventListener('click', function(event) {
    if (menuOverlay.classList.contains('active') && 
        !menuOverlay.contains(event.target) && 
        event.target !== menuButton) {
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});