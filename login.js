document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      // Appel à l'API de connexion
      const result = await API.login({ email, password });
      
      if (result.success) {
        // Redirection vers la page d'accueil ou le compte
        window.location.href = '/account';
      } else {
        alert('Erreur de connexion: ' + (result.error || 'Identifiants incorrects'));
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Une erreur est survenue lors de la connexion');
    }
  });
});